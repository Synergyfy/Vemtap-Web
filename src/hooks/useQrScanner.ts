import { useCallback, useEffect, useRef, useState } from 'react';

/** The browser's built-in barcode reader (Chrome/Edge on Android, macOS and ChromeOS). */
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource | Blob | ImageBitmap): Promise<DetectedBarcode[]>;
}
type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

const detectorCtor = (): BarcodeDetectorCtor | null =>
  (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector ?? null;

export type ScannerStatus = 'idle' | 'starting' | 'scanning' | 'unsupported' | 'denied' | 'error';

/** A VEMTAP link (this site, or any vemtap host) opens in the app; anything else is reported. */
export function vemtapPath(value: string): string | null {
  try {
    const url = new URL(value.trim(), window.location.origin);
    const own = url.origin === window.location.origin || /(^|\.)vemtap\./i.test(url.hostname);
    return own ? `${url.pathname}${url.search}${url.hash}` : null;
  } catch {
    return null;
  }
}

/**
 * Live camera QR scanning with the browser's `BarcodeDetector`. Calls `onCode`
 * once per decoded value; `scanImage` reads a code from a picked photo.
 */
export function useQrScanner(onCode: (value: string) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const handled = useRef(false);
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;
  const [status, setStatus] = useState<ScannerStatus>(() => (detectorCtor() ? 'idle' : 'unsupported'));
  const [torchOn, setTorchOn] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);

  const detector = () => {
    const Ctor = detectorCtor();
    if (!Ctor) return null;
    detectorRef.current ??= new Ctor({ formats: ['qr_code'] });
    return detectorRef.current;
  };

  const stop = useCallback(() => {
    if (frameRef.current != null) window.clearTimeout(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setTorchOn(false);
  }, []);

  const deliver = (value: string) => {
    if (handled.current) return;
    handled.current = true;
    stop();
    onCodeRef.current(value);
  };

  const start = useCallback(async () => {
    const reader = detector();
    if (!reader) {
      setStatus('unsupported');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      return;
    }
    handled.current = false;
    setStatus('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      const caps = (track?.getCapabilities?.() ?? {}) as { torch?: boolean };
      setTorchAvailable(caps.torch === true);
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play().catch(() => undefined);
      setStatus('scanning');
      const tick = async () => {
        if (!streamRef.current || handled.current) return;
        try {
          if (video.readyState >= 2) {
            const [code] = await reader.detect(video);
            if (code?.rawValue) {
              deliver(code.rawValue);
              return;
            }
          }
        } catch {
          // A frame that can't be read is skipped.
        }
        frameRef.current = window.setTimeout(() => void tick(), 250);
      };
      void tick();
    } catch (error) {
      const name = (error as { name?: string })?.name;
      setStatus(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'error');
    }
  }, []);

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return false;
    const next = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] });
      setTorchOn(next);
      return true;
    } catch {
      return false;
    }
  };

  /** Reads a QR code from an image file; resolves to false when none is found. */
  const scanImage = async (file: File) => {
    const reader = detector();
    if (!reader) return false;
    const bitmap = await createImageBitmap(file);
    try {
      const [code] = await reader.detect(bitmap);
      if (!code?.rawValue) return false;
      handled.current = false;
      deliver(code.rawValue);
      return true;
    } finally {
      bitmap.close();
    }
  };

  useEffect(() => {
    void start();
    return stop;
  }, [start, stop]);

  return { videoRef, status, start, torchAvailable, torchOn, toggleTorch, scanImage, supported: status !== 'unsupported' };
}

/** What to tell the customer for each scanner state. */
export const SCANNER_MESSAGE: Record<ScannerStatus, string> = {
  idle: 'Starting the camera…',
  starting: 'Starting the camera…',
  scanning: 'Align the code inside the frame. VEMTAP codes open the business, table menu or voucher right away.',
  unsupported:
    "This browser can't read QR codes. Open your phone's camera app and point it at the code — VEMTAP codes open here automatically.",
  denied: 'Camera access is blocked. Allow the camera for this site in your browser settings, then try again.',
  error: "The camera couldn't be started. Close other apps using it and try again.",
};
