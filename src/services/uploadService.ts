import { hasApiConfig, uploadFile } from './api/client';

/** Largest photo the picker accepts; it is shrunk to fit the upload cap before sending. */
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
/**
 * What is actually sent. The API's proxy rejects request bodies over 1MB with a
 * 413 that carries no CORS headers, which the browser reports only as
 * "Failed to fetch" — so images are kept safely under it.
 */
const MAX_UPLOAD_BYTES = 900 * 1024;
/** Longest side after resizing: sharp on a storefront banner, small on the wire. */
const MAX_IMAGE_DIMENSION = 2000;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

/** Why this file can't be uploaded as an image; null when it can. */
export const imageFileError = (file: File): string | null => {
  if (!IMAGE_TYPES.includes(file.type)) return 'Choose a PNG, JPG or WebP image.';
  return file.size > MAX_IMAGE_BYTES ? 'Images must be 15MB or smaller.' : null;
};

const canvasBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Resizes and re-encodes an image until it fits under the upload cap. Files
 * already small enough are sent as they are. PNG/WebP become WebP (keeps a
 * logo's transparency); photos become JPEG.
 */
export async function fitImageForUpload(file: File): Promise<File> {
  if (file.size <= MAX_UPLOAD_BYTES) return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('That image could not be read. Try a different JPG, PNG or WebP photo.');
  }
  const type = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp';
  const extension = type === 'image/jpeg' ? 'jpg' : 'webp';
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
  let scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
  try {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) break;
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.85, 0.75, 0.65]) {
        const blob = await canvasBlob(canvas, type, quality);
        if (blob && blob.size <= MAX_UPLOAD_BYTES) return new File([blob], `${baseName}.${extension}`, { type });
      }
      scale *= 0.75;
    }
  } finally {
    bitmap.close();
  }
  throw new Error('That image is too large to upload. Try a smaller photo.');
}

/** Opens the file picker and resolves with the chosen image (null when cancelled). */
export function pickImage(): Promise<File | null> {
  return new Promise((resolve) => {
    // Attached (but hidden) so every browser fires change/cancel reliably.
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp';
    input.style.display = 'none';
    const finish = (file: File | null) => {
      input.remove();
      resolve(file);
    };
    input.addEventListener('change', () => finish(input.files?.[0] ?? null));
    input.addEventListener('cancel', () => finish(null));
    document.body.appendChild(input);
    input.click();
  });
}

/**
 * `POST /uploads` (multipart `file`) → hosted URL. Demo: a local preview URL so
 * the screen still shows the chosen image.
 */
export async function uploadImage(file: File): Promise<string> {
  const problem = imageFileError(file);
  if (problem) throw new Error(problem);
  if (!hasApiConfig()) return URL.createObjectURL(file);
  const result = await uploadFile<{ url?: string; data?: { url?: string } }>('/uploads', await fitImageForUpload(file));
  const url = result.url ?? result.data?.url;
  if (!url) throw new Error('The upload did not return an image URL.');
  return url;
}

/**
 * Uploads an image held as a `data:` URL (e.g. from an inline image field)
 * and returns the hosted URL. Hosted URLs are returned unchanged.
 */
export async function uploadDataUrlImage(value: string, fileName = 'image'): Promise<string> {
  if (!value.startsWith('data:')) return value;
  const blob = await (await fetch(value)).blob();
  const extension = blob.type.split('/')[1] || 'png';
  return uploadImage(new File([blob], `${fileName}.${extension}`, { type: blob.type }));
}

/** Picks and uploads in one go; null when the user cancels. */
export async function pickAndUploadImage(): Promise<string | null> {
  const file = await pickImage();
  return file ? uploadImage(file) : null;
}
