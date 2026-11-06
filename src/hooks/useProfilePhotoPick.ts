import { useEffect, useRef, useState } from 'react';
import { imageFileError } from '../services/uploadService';

/**
 * A profile photo chosen before the account exists: it is held and previewed
 * here, then uploaded once sign-up has signed the customer in.
 */
export function useProfilePhotoPick() {
  const [photo, setPhoto] = useState<File | undefined>();
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const openPicker = () => fileInput.current?.click();

  const onPick = (file: File | undefined) => {
    if (fileInput.current) fileInput.current.value = '';
    if (!file) return;
    const problem = imageFileError(file);
    setPhotoError(problem);
    if (!problem) setPhoto(file);
  };

  return { photo, preview, photoError, fileInput, openPicker, onPick };
}
