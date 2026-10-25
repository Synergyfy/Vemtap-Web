import { hasApiConfig, uploadFile } from './api/client';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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
  if (!file.type.startsWith('image/')) throw new Error('Choose a PNG, JPG or WebP image.');
  if (file.size > MAX_IMAGE_BYTES) throw new Error('Images must be 5MB or smaller.');
  if (!hasApiConfig()) return URL.createObjectURL(file);
  const result = await uploadFile<{ url?: string; data?: { url?: string } }>('/uploads', file);
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
