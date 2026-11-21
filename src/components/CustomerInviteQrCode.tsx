import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Icon } from './ui/Icon';
import { useMyBusiness } from '../hooks/business/useMyBusiness';

interface CustomerInviteQrCodeProps {
  url: string;
  businessName: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}

/**
 * Real, scannable customer invite QR code with high error correction ('H')
 * that preserves readability when the business logo is placed in the center.
 * Clicking download generates a high-resolution scannable PNG with the centered logo.
 */
export function CustomerInviteQrCode({
  url,
  businessName,
  logoUrl,
  size = 184,
  className = '',
}: CustomerInviteQrCodeProps) {
  const myBusiness = useMyBusiness();
  const effectiveLogo = logoUrl !== undefined ? logoUrl : myBusiness.data?.logoUrl;
  const [qrImage, setQrImage] = useState<string>('');
  const [generationError, setGenerationError] = useState(false);

  useEffect(() => {
    let active = true;
    setGenerationError(false);
    QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: Math.max(size * 2, 400),
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((dataUrl) => {
        if (active) setQrImage(dataUrl);
      })
      .catch(() => {
        if (active) setGenerationError(true);
      });

    return () => {
      active = false;
    };
  }, [url, size]);

  const handleDownload = () => {
    if (!qrImage) return;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 0, 0, 512, 512);

      const triggerSave = () => {
        const downloadUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-invite-qr.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      if (effectiveLogo) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.onload = () => {
          const logoSize = 104;
          const logoX = (512 - logoSize) / 2;
          const logoY = (512 - logoSize) / 2;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(logoX - 6, logoY - 6, logoSize + 12, logoSize + 12, 20);
          ctx.fill();
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
          triggerSave();
        };
        logoImg.onerror = () => {
          triggerSave();
        };
        logoImg.src = effectiveLogo;
      } else {
        const badgeSize = 104;
        const badgeX = (512 - badgeSize) / 2;
        const badgeY = (512 - badgeSize) / 2;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(badgeX - 6, badgeY - 6, badgeSize + 12, badgeSize + 12, 20);
        ctx.fill();
        ctx.fillStyle = '#066CF4';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, 14);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(businessName.charAt(0).toUpperCase() || 'V', 256, 256);
        triggerSave();
      }
    };
    qrImg.src = qrImage;
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="relative p-4 bg-white rounded-3xl shadow-lg border border-border-subtle flex flex-col items-center">
        <span className="flex items-center gap-1.5 px-3 py-1 mb-3 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
          <Icon name="person_add" className="text-[14px]" />
          <span>VEMTAP CUSTOMER INVITE</span>
        </span>

        <div
          className="relative bg-white p-2 rounded-2xl flex items-center justify-center border border-gray-100 shadow-inner overflow-hidden"
          style={{ width: size, height: size }}
        >
          {qrImage ? (
            <>
              <img
                src={qrImage}
                alt={`Scannable invite QR code for ${businessName}`}
                className="w-full h-full object-contain block"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center border-2 border-white overflow-hidden p-0.5">
                  {effectiveLogo ? (
                    <img src={effectiveLogo} alt={businessName} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="w-full h-full bg-primary text-white rounded-lg flex items-center justify-center font-bold text-[16px]">
                      {businessName.charAt(0).toUpperCase() || 'V'}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : generationError ? (
            <span role="alert" className="p-2 text-center font-caption text-caption text-error">
              Unable to generate QR code.
            </span>
          ) : (
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        <p className="mt-3 text-center text-[11px] text-text-secondary max-w-[200px] leading-snug">
          Scan to join {businessName} on VEMTAP
        </p>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        title={url}
        disabled={!qrImage}
        className="flex items-center gap-space-2xs px-space-sm h-9 rounded-xl border border-border-subtle bg-surface-canvas hover:bg-surface-subtle disabled:opacity-50 text-text-primary font-label-sm text-label-sm font-semibold transition-colors"
      >
        <Icon name="download" className="text-[16px] text-primary" />
        <span>Download QR</span>
      </button>
    </div>
  );
}
