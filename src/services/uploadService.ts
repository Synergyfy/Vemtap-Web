import { hasApiConfig, uploadFile } from './api/client';

/** Largest photo the picker accepts; it is shrunk to fit the upload cap before sending. */
export const MAX_IMAGE_UPLOAD_MB = 5;
const MAX_IMAGE_BYTES = MAX_IMAGE_UPLOAD_MB * 1024 * 1024;
/** Largest video the picker accepts — videos cannot be shrunk in the browser. */
export const MAX_VIDEO_UPLOAD_MB = 50;
const MAX_VIDEO_BYTES = MAX_VIDEO_UPLOAD_MB * 1024 * 1024;
/**
 * What is actually sent for photos. The API's proxy rejects request bodies
 * over 1MB with a 413 that carries no CORS headers, which the browser reports
 * only as "Failed to fetch" — so images are kept safely under it. Videos are
 * sent as selected and are capped by MAX_VIDEO_BYTES instead.
 */
const MAX_UPLOAD_BYTES = 900 * 1024;
/** Longest side after resizing: sharp on a storefront banner, small on the wire. */
const MAX_IMAGE_DIMENSION = 2000;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

/** Why this file can't be uploaded as an image; null when it can. */
export const imageFileError = (file: File): string | null => {
  if (!IMAGE_TYPES.includes(file.type)) return 'Choose a PNG, JPG or WebP image.';
  return file.size > MAX_IMAGE_BYTES
    ? `Images must be ${MAX_IMAGE_UPLOAD_MB}MB or smaller.`
    : null;
};

/** Why this file can't be uploaded as a video; null when it can. */
export const videoFileError = (file: File): string | null => {
  if (!VIDEO_TYPES.includes(file.type)) return 'Choose an MP4, WebM or MOV video.';
  return file.size > MAX_VIDEO_BYTES
    ? `Videos must be ${MAX_VIDEO_UPLOAD_MB}MB or smaller.`
    : null;
};

const canvasBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

/** Source-pixel crop rectangle produced by the inline image crop control. */
export interface ImageCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Natural dimensions of a picked image, used to initialise the crop control. */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const problem = imageFileError(file);
  if (problem) throw new Error(problem);
  try {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  } catch {
    throw new Error('That image could not be read. Try a different JPG, PNG or WebP photo.');
  }
}

/** Applies a source-pixel crop and returns a fresh File ready for upload. */
export async function cropImageFile(file: File, crop: ImageCrop): Promise<File> {
  const problem = imageFileError(file);
  if (problem) throw new Error(problem);
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('That image could not be read. Try a different JPG, PNG or WebP photo.');
  }

  const sourceX = Math.max(0, Math.min(crop.x, bitmap.width - 1));
  const sourceY = Math.max(0, Math.min(crop.y, bitmap.height - 1));
  const sourceWidth = Math.max(1, Math.min(crop.width, bitmap.width - sourceX));
  const sourceHeight = Math.max(1, Math.min(crop.height, bitmap.height - sourceY));
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(sourceWidth, sourceHeight));
  const type = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp';
  const extension = type === 'image/jpeg' ? 'jpg' : 'webp';
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';

  try {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(sourceWidth * scale));
    canvas.height = Math.max(1, Math.round(sourceHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not crop this image.');
    context.drawImage(
      bitmap,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    const blob = await canvasBlob(canvas, type, 0.92);
    if (!blob) throw new Error('Your browser could not crop this image.');
    return new File([blob], `${baseName}-cropped.${extension}`, { type });
  } finally {
    bitmap.close();
  }
}

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

/** Opens the file picker and resolves with the chosen video (null when cancelled). */
export function pickVideo(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/mp4,video/webm,video/quicktime';
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

/** `POST /uploads` (multipart `file`) → hosted URL for a video. */
export async function uploadVideo(file: File): Promise<string> {
  const problem = videoFileError(file);
  if (problem) throw new Error(problem);
  if (!hasApiConfig()) return URL.createObjectURL(file);
  const result = await uploadFile<{ url?: string; data?: { url?: string } }>('/uploads', file);
  const url = result.url ?? result.data?.url;
  if (!url) throw new Error('The upload did not return a video URL.');
  return url;
}

/** Picks and uploads a video in one go; null when the user cancels. */
export async function pickAndUploadVideo(): Promise<string | null> {
  const file = await pickVideo();
  return file ? uploadVideo(file) : null;
}
