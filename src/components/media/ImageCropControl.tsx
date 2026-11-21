import { useEffect, useRef, useState } from 'react';
import { Icon } from '../ui/Icon';
import { cropImageFile, getImageDimensions } from '../../services/uploadService';

interface ImageCropControlProps {
  file: File;
  onApply: (file: File) => void;
  onCancel: () => void;
}

interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

type RatioKey = 'free' | 'square' | 'landscape' | 'wide';

const RATIOS: Array<{ key: RatioKey; label: string; value: number | null }> = [
  { key: 'free', label: 'Free', value: null },
  { key: 'square', label: '1:1', value: 1 },
  { key: 'landscape', label: '4:3', value: 4 / 3 },
  { key: 'wide', label: '16:9', value: 16 / 9 },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

/** Inline crop editor embedded in an existing image field, shown after picking. */
export function ImageCropControl({ file, onApply, onCancel }: ImageCropControlProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<
    | { mode: 'move' | 'resize'; startX: number; startY: number; crop: CropBox }
    | null
  >(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [crop, setCrop] = useState<CropBox>({ x: 10, y: 10, width: 80, height: 80 });
  const [ratioKey, setRatioKey] = useState<RatioKey>('free');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ratioValue = RATIOS.find((item) => item.key === ratioKey)?.value ?? null;
  const imageAspect = dimensions ? dimensions.width / dimensions.height : 1;

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    let active = true;
    getImageDimensions(file)
      .then((size) => {
        if (!active) return;
        setDimensions(size);
      })
      .catch((cause: Error) => {
        if (active) setError(cause.message);
      });
    return () => {
      active = false;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!drag || !rect || !rect.width || !rect.height) return;
      const dx = ((event.clientX - drag.startX) / rect.width) * 100;
      const dy = ((event.clientY - drag.startY) / rect.height) * 100;

      if (drag.mode === 'move') {
        setCrop({
          ...drag.crop,
          x: clamp(drag.crop.x + dx, 0, 100 - drag.crop.width),
          y: clamp(drag.crop.y + dy, 0, 100 - drag.crop.height),
        });
        return;
      }

      const maxWidth = 100 - drag.crop.x;
      const maxHeight = 100 - drag.crop.y;
      let width = clamp(drag.crop.width + dx, 15, maxWidth);
      let height = ratioValue
        ? (width * imageAspect) / ratioValue
        : clamp(drag.crop.height + dy, 15, maxHeight);
      if (height > maxHeight) {
        height = maxHeight;
        if (ratioValue) width = (height * ratioValue) / imageAspect;
      }
      setCrop({ ...drag.crop, width, height });
    };
    const stop = () => {
      dragRef.current = null;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [imageAspect, ratioValue]);

  const applyRatio = (key: RatioKey) => {
    setRatioKey(key);
    const value = RATIOS.find((item) => item.key === key)?.value ?? null;
    if (!value) return;
    let width = Math.min(crop.width, 80);
    let height = (width * imageAspect) / value;
    if (height > 80) {
      height = 80;
      width = (height * value) / imageAspect;
    }
    const centerX = crop.x + crop.width / 2;
    const centerY = crop.y + crop.height / 2;
    setCrop({
      x: clamp(centerX - width / 2, 0, 100 - width),
      y: clamp(centerY - height / 2, 0, 100 - height),
      width,
      height,
    });
  };

  const applyCrop = async () => {
    if (!dimensions) return;
    setBusy(true);
    setError(null);
    try {
      const cropped = await cropImageFile(file, {
        x: Math.round((crop.x / 100) * dimensions.width),
        y: Math.round((crop.y / 100) * dimensions.height),
        width: Math.round((crop.width / 100) * dimensions.width),
        height: Math.round((crop.height / 100) * dimensions.height),
      });
      onApply(cropped);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not crop this image.');
    } finally {
      setBusy(false);
    }
  };

  const startDrag = (mode: 'move' | 'resize') => (event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = { mode, startX: event.clientX, startY: event.clientY, crop };
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-canvas p-space-sm space-y-space-xs">
      <div className="flex items-center justify-between gap-space-xs">
        <p className="font-label-sm text-label-sm text-text-primary font-semibold">Crop image</p>
        <button
          className="w-7 h-7 rounded-full bg-surface-container text-text-secondary flex items-center justify-center"
          onClick={onCancel}
          type="button"
          aria-label="Cancel crop"
        >
          <Icon name="close" className="text-[15px]" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        {RATIOS.map((item) => (
          <button
            className={`h-7 px-2 rounded-lg font-caption text-caption transition-colors ${
              ratioKey === item.key
                ? 'bg-primary-container text-on-primary'
                : 'bg-surface-container-low text-text-secondary'
            }`}
            key={item.key}
            onClick={() => applyRatio(item.key)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        className="relative inline-block max-w-full overflow-hidden rounded-xl bg-surface-container"
        ref={wrapperRef}
      >
        {previewUrl && (
          <img alt="Crop preview" className="block max-h-72 w-full object-contain select-none" src={previewUrl} draggable={false} />
        )}
        <div
          className="absolute border-2 border-primary bg-primary/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.38)]"
          onPointerDown={startDrag('move')}
          style={{
            left: `${crop.x}%`,
            top: `${crop.y}%`,
            width: `${crop.width}%`,
            height: `${crop.height}%`,
            touchAction: 'none',
            cursor: 'move',
          }}
        >
          <span
            className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary border-2 border-surface-canvas"
            onPointerDown={startDrag('resize')}
            style={{ touchAction: 'none', cursor: 'nwse-resize' }}
          />
        </div>
      </div>

      {error && <p className="font-caption text-caption text-error">{error}</p>}

      <div className="flex gap-space-xs">
        <button
          className="h-9 flex-1 rounded-xl bg-surface-container text-text-secondary font-label-sm text-label-sm"
          disabled={busy}
          onClick={onCancel}
          type="button"
        >
          Discard
        </button>
        <button
          className="h-9 flex-1 rounded-xl bg-primary text-on-primary font-label-sm text-label-sm disabled:opacity-60"
          disabled={busy || !dimensions}
          onClick={applyCrop}
          type="button"
        >
          {busy ? 'Applying…' : 'Use cropped image'}
        </button>
      </div>
    </div>
  );
}
