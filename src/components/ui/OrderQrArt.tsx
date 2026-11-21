import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useMyBusiness } from '../../hooks/business/useMyBusiness';
import vemtapMark from '../../hooks/VEMTAP LOGO NEW PNG.png';

interface OrderQrArtProps {
  value: string;
  size?: number;
  className?: string;
  alt?: string;
  logoUrl?: string | null;
}

/** A real, scannable QR code for an order reference or public destination. */
export function OrderQrArt({ value, size = 168, className = '', alt = `QR code for ${value}`, logoUrl }: OrderQrArtProps) {
  const [image, setImage] = useState('');
  const [error, setError] = useState(false);
  const myBusiness = useMyBusiness();
  const effectiveLogo = logoUrl !== undefined ? logoUrl : myBusiness.data?.logoUrl;

  useEffect(() => {
    let ignore = false;
    setImage('');
    setError(false);
    QRCode.toDataURL(value, { errorCorrectionLevel: 'H', margin: 1, width: size * 2 })
      .then((url) => {
        if (!ignore) setImage(url);
      })
      .catch(() => {
        if (!ignore) setError(true);
      });
    return () => {
      ignore = true;
    };
  }, [value, size]);

  const badgeSize = Math.max(20, Math.round(size * 0.22));

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {image ? (
        <>
          <img alt={alt} src={image} width={size} height={size} className="block" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="rounded-lg bg-white p-0.5 shadow-sm border border-border-subtle flex items-center justify-center overflow-hidden"
              style={{ width: badgeSize, height: badgeSize }}
            >
              {effectiveLogo ? (
                <img src={effectiveLogo} alt="Logo" className="w-full h-full object-cover rounded" />
              ) : (
                <img src={vemtapMark} alt="Vemtap" className="w-full h-full object-contain" />
              )}
            </div>
          </div>
        </>
      ) : error ? (
        <span role="alert" className="px-2 text-center font-caption text-caption text-error">
          QR code could not be generated.
        </span>
      ) : null}
    </div>
  );
}
