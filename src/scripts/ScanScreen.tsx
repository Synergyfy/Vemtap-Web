import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { SCANNER_MESSAGE, useQrScanner, vemtapPath } from '../hooks/useQrScanner';

interface ScanScreenProps {
  onBack: () => void;
}

export function ScanScreen({ onBack }: ScanScreenProps) {
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  const showToast = (text: string) => {
    setToast(text);
    const timer = window.setTimeout(() => setToast(null), 2600);
    timers.current.push(timer);
  };

  const fileInput = useRef<HTMLInputElement>(null);
  const scanner = useQrScanner((value) => {
    const path = vemtapPath(value);
    if (path) {
      showToast('Opening…');
      window.location.assign(path);
      return;
    }
    showToast("That isn't a VEMTAP code. Try another one.");
    window.setTimeout(() => void scanner.start(), 1500);
  });
  const active = scanner.status === 'scanning';

  const toggleTorch = async () => {
    if (!(await scanner.toggleTorch())) showToast("This camera doesn't have a torch");
  };

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    try {
      if (!scanner.supported) showToast("This browser can't read QR codes from photos");
      else if (!(await scanner.scanImage(file))) showToast('No QR code found in that photo');
    } catch {
      showToast("That photo couldn't be read");
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <AppScreen surface="bg-inverse-surface">
      <header className="sticky top-0 z-40 pt-safe bg-inverse-surface/80 backdrop-blur-md">
        <div className="h-16 px-margin flex items-center justify-between">
          <button
            aria-label="Go back"
            className="w-11 h-11 -ml-space-xs flex items-center justify-center rounded-full text-inverse-on-surface hover:bg-white/10 transition-colors"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[24px]" />
          </button>
          <h1 className="text-heading-sm font-heading-sm text-inverse-on-surface tracking-tight">Scan QR</h1>
          <button
            aria-label="Torch"
            className="w-11 h-11 flex items-center justify-center rounded-full text-inverse-on-surface hover:bg-white/10 transition-colors"
            type="button"
            onClick={() => void toggleTorch()}
            disabled={!active || !scanner.torchAvailable}
          >
            <Icon name="flashlight_on" className="text-[22px]" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-margin pb-24 gap-space-lg">
        <div className="relative w-64 h-64">
          <video
            ref={scanner.videoRef}
            muted
            playsInline
            aria-label="Camera preview"
            className={`absolute inset-0 w-full h-full object-cover rounded-3xl ${active ? '' : 'hidden'}`}
          />
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => void pickImage(event.target.files?.[0])}
          />
          <div className="absolute inset-0 rounded-3xl border-2 border-white/20" />
          <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-3xl" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-3xl" />
          <div className="absolute inset-x-4 top-1/2 h-0.5 bg-primary animate-pulse rounded-full shadow-[0_0_12px_rgba(var(--color-primary-rgb,59,130,246)/0.8)]" />
          {!active && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon name="qr_code_scanner" className="text-[64px] text-white/15" />
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-space-2xs text-center max-w-[300px]">
          <p className="text-heading-sm font-heading-sm text-inverse-on-surface font-semibold">
            Point at a merchant QR
          </p>
          <p className="text-body-md font-body-md text-white/70 leading-relaxed">
            {SCANNER_MESSAGE[scanner.status]}
          </p>
        </div>

        <div className="flex flex-col gap-space-xs w-full max-w-[320px]">
          {(scanner.status === 'denied' || scanner.status === 'error') && (
            <button
              type="button"
              onClick={() => void scanner.start()}
              className="w-full h-11 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-md"
            >
              <Icon name="photo_camera" className="text-[18px]" />
              <span>Try the camera again</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="w-full h-11 rounded-xl bg-white/10 text-inverse-on-surface font-semibold text-button-primary flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
          >
            <Icon name="photo_library" className="text-[18px]" />
            <span>Choose from gallery</span>
          </button>
        </div>

        <p className="text-caption font-caption text-white/50 text-center max-w-[280px]">
          Camera access is requested on first use. Codes are read on your device; only VEMTAP links are opened.
        </p>
      </main>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-surface-container-lowest text-on-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
