/**
 * Image handling for the Bulk Product Import (Step 4).
 *
 * - Per-product uploads are downscaled client-side to a compact JPEG data URL
 *   (the same local-only pattern as `ServiceImageUploader`, which stores a
 *   base64 data URL). No storage bucket exists in this app yet; when one
 *   lands, `compressImageFile` is the only function that needs to change.
 * - ZIP bundles are read with the platform's native `DecompressionStream` —
 *   no dependency added — and matched to products by SKU or product-name slug.
 * - Image URLs from the spreadsheet are verified with a best-effort load; a
 *   failure is a warning, never a blocker.
 * - No AI image generation anywhere, by design.
 */

export const MAX_IMAGES_PER_PRODUCT = 6;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB per file
const THUMBNAIL_MAX_EDGE = 1000;
const THUMBNAIL_QUALITY = 0.82;

export class ImageImportError extends Error {}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

/** Reads an image file and returns a downscaled JPEG data URL. */
export async function compressImageFile(file: File): Promise<string> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new ImageImportError(`"${file.name}" is not a supported image (use JPG, PNG, WEBP or GIF).`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ImageImportError(`"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is 8 MB per image.`);
  }
  const source = await readAsDataUrl(file);
  return downscaleDataUrl(source, THUMBNAIL_MAX_EDGE, THUMBNAIL_QUALITY);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new ImageImportError(`Could not read "${file.name}".`));
    reader.readAsDataURL(file);
  });
}

async function downscaleDataUrl(source: string, maxEdge: number, quality: number): Promise<string> {
  if (typeof Image === 'undefined' || typeof document === 'undefined') return source; // non-DOM environments
  const image = await loadImage(source);
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
  if (scale === 1 && source.length < 300_000) return source;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) return source;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  try {
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return source;
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new ImageImportError('Image could not be loaded.'));
    image.src = src;
  });
}

export interface UrlCheck {
  url: string;
  ok: boolean;
}

/**
 * Best-effort availability check for spreadsheet image URLs. A network/CORS
 * failure marks the URL "unverified" — the image stays attached and is only a
 * warning, never a reason to drop the product.
 */
export async function verifyImageUrls(urls: string[], timeoutMs = 6000): Promise<UrlCheck[]> {
  const unique = Array.from(new Set(urls.map((url) => url.trim()).filter(Boolean)));
  return Promise.all(
    unique.map(
      (url) =>
        new Promise<UrlCheck>((resolve) => {
          const image = new Image();
          const timer = setTimeout(() => resolve({ url, ok: false }), timeoutMs);
          image.onload = () => {
            clearTimeout(timer);
            resolve({ url, ok: true });
          };
          image.onerror = () => {
            clearTimeout(timer);
            resolve({ url, ok: false });
          };
          image.src = url;
        }),
    ),
  );
}

/* ------------------------------------------------------------------ */
/* ZIP support (native DecompressionStream — no extra dependency)      */
/* ------------------------------------------------------------------ */

interface ZipEntry {
  name: string;
  data: Uint8Array;
}

const IMAGE_EXTENSION_PATTERN = /\.(jpe?g|png|webp|gif|avif)$/i;

function findCentralDirectoryEntries(bytes: Uint8Array): Array<{ name: string; localHeaderOffset: number }> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  // Locate the End Of Central Directory record (signature 0x06054b50).
  let eocdOffset = -1;
  for (let i = bytes.length - 22; i >= 0 && i >= bytes.length - 22 - 65536; i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset < 0) throw new ImageImportError('This does not look like a valid ZIP file.');
  const entryCount = view.getUint16(eocdOffset + 10, true);
  let offset = view.getUint32(eocdOffset + 16, true);
  const entries: Array<{ name: string; localHeaderOffset: number }> = [];
  for (let i = 0; i < entryCount; i += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) break;
    const compressionMethod = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(offset + 46, offset + 46 + nameLength));
    // Only stored (0) or deflate (8) entries are supported; encrypted bits rejected.
    if ((compressionMethod === 0 || compressionMethod === 8) && !name.endsWith('/')) {
      entries.push({ name, localHeaderOffset });
      void compressedSize;
    }
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') {
    throw new ImageImportError('ZIP extraction needs a newer browser — upload the images directly instead.');
  }
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  const buffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(buffer);
}

async function readZipEntry(bytes: Uint8Array, localHeaderOffset: number): Promise<ZipEntry | null> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(localHeaderOffset, true) !== 0x04034b50) return null;
  const compressionMethod = view.getUint16(localHeaderOffset + 8, true);
  const compressedSize = view.getUint32(localHeaderOffset + 18, true);
  const nameLength = view.getUint16(localHeaderOffset + 26, true);
  const extraLength = view.getUint16(localHeaderOffset + 28, true);
  const name = new TextDecoder().decode(bytes.subarray(localHeaderOffset + 30, localHeaderOffset + 30 + nameLength));
  const dataStart = localHeaderOffset + 30 + nameLength + extraLength;
  const dataEnd = dataStart + compressedSize;
  if (dataEnd > bytes.length) return null;
  const raw = bytes.subarray(dataStart, dataEnd);
  const data = compressionMethod === 0 ? raw : await inflateRaw(raw);
  return { name, data };
}

const MAX_ZIP_BYTES = 50 * 1024 * 1024;
const MAX_ZIP_ENTRIES = 400;

/** Extracts image entries from a ZIP file (up to `MAX_ZIP_ENTRIES`). */
export async function extractImagesFromZip(file: File): Promise<Array<{ fileName: string; dataUrl: string }>> {
  if (file.size > MAX_ZIP_BYTES) {
    throw new ImageImportError(`"${file.name}" is ${(file.size / 1024 / 1024).toFixed(0)} MB — keep image ZIPs under 50 MB.`);
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const entries = findCentralDirectoryEntries(bytes).filter((entry) => IMAGE_EXTENSION_PATTERN.test(entry.name));
  if (entries.length === 0) throw new ImageImportError('No image files (JPG/PNG/WEBP) were found inside this ZIP.');
  const limited = entries.slice(0, MAX_ZIP_ENTRIES);

  const results: Array<{ fileName: string; dataUrl: string }> = [];
  for (const entry of limited) {
    const read = await readZipEntry(bytes, entry.localHeaderOffset);
    if (!read) continue;
    const mime = IMAGE_EXTENSION_PATTERN.test(read.name)
      ? `image/${read.name.toLowerCase().replace(/.*\.(jpe?g)$/, 'jpeg').replace(/.*\.png$/, 'png').replace(/.*\.webp$/, 'webp').replace(/.*\.gif$/, 'gif').replace(/.*\.avif$/, 'avif')}`
      : 'image/jpeg';
    const blob = new Blob([read.data as BlobPart], { type: mime });
    const fileLike = new File([blob], read.name, { type: mime });
    try {
      results.push({ fileName: read.name, dataUrl: await compressImageFile(fileLike) });
    } catch {
      /* skip unreadable entries; reported via count */
    }
  }
  return results;
}

/* ------------------------------------------------------------------ */
/* Matching extracted/uploaded images to products                      */
/* ------------------------------------------------------------------ */

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface MatchableProduct {
  rowId: string;
  sku: string;
  name: string;
}

export interface ImageMatchResult {
  /** rowId -> matched data URLs. */
  matched: Map<string, string[]>;
  /** Entries that matched no product. */
  unmatched: Array<{ fileName: string; reason: string }>;
}

/**
 * Matches image files to products by SKU prefix ("VG-STEAK-01_hero.jpg") or by
 * product-name slug ("woodfire-aged-ribeye-steak.png"). Unmatched files are
 * reported, never silently dropped.
 */
export function matchImagesToProducts(
  files: Array<{ fileName: string; dataUrl: string }>,
  products: MatchableProduct[],
): ImageMatchResult {
  const matched = new Map<string, string[]>();
  const unmatched: Array<{ fileName: string; reason: string }> = [];

  const bySku = new Map<string, string[]>();
  const bySlug = new Map<string, string[]>();
  for (const product of products) {
    const sku = product.sku.trim().toLowerCase();
    if (sku) {
      const list = bySku.get(sku) ?? [];
      list.push(product.rowId);
      bySku.set(sku, list);
    }
    const slug = slugify(product.name);
    if (slug) {
      const list = bySlug.get(slug) ?? [];
      list.push(product.rowId);
      bySlug.set(slug, list);
    }
  }

  for (const file of files) {
    const base = slugify(file.fileName);
    let rowId: string | undefined;

    // SKU match: file base starts with the SKU (then a separator or end).
    for (const [sku, rowIds] of bySku) {
      const skuSlug = slugify(sku);
      if (skuSlug && (base === skuSlug || base.startsWith(`${skuSlug}-`) || base.startsWith(`${skuSlug}_`))) {
        rowId = rowIds[0];
        break;
      }
    }
    // Slug match: exact product-name slug or slug as a prefix/suffix.
    if (!rowId) {
      for (const [slug, rowIds] of bySlug) {
        if (slug && (base === slug || base.startsWith(`${slug}-`) || base.endsWith(`-${slug}`))) {
          rowId = rowIds[0];
          break;
        }
      }
    }

    if (rowId) {
      const list = matched.get(rowId) ?? [];
      list.push(file.dataUrl);
      matched.set(rowId, list);
    } else {
      unmatched.push({ fileName: file.fileName, reason: 'No product with a matching SKU or name was found.' });
    }
  }

  return { matched, unmatched };
}
