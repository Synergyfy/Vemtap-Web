import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Icon } from '../ui/Icon';

/**
 * Real, scannable QR code for a referral link, generated client-side with the
 * same `qrcode` encoder the backend uses. While the data URL is being
 * generated (or failed), the same-sized box stays empty.
 */

export interface ReferralQrArtProps {
  link: string;
  /** Short caption under the art, e.g. "Scan to open the referral link". */
  caption?: string;
  size?: number;
  className?: string;
}

export function ReferralQrArt({ link, caption, size = 168, className = '' }: ReferralQrArtProps) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(link, { margin: 1, width: size * 2 })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        // Leave the box empty on failure — the link below is always shown too.
        if (!cancelled) setDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [link, size]);

  return (
    <div className={`flex flex-col items-center gap-space-2xs ${className}`}>
      <div className="relative bg-white rounded-2xl border border-border-subtle shadow-sm p-space-xs">
        {/* Same-sized empty box while the QR is generating */}
        <img
          role="img"
          aria-label={`Referral link QR code for ${link}`}
          src={dataUrl}
          alt=""
          width={size}
          height={size}
          className={dataUrl ? 'block' : 'invisible'}
        />
        {dataUrl && (
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="w-10 h-10 rounded-xl bg-primary text-on-primary border-2 border-white shadow-md flex items-center justify-center">
              <Icon name="card_giftcard" className="text-[20px]" />
            </span>
          </span>
        )}
      </div>
      {caption && <p className="font-caption text-caption text-text-secondary text-center max-w-[220px]">{caption}</p>}
    </div>
  );
}
