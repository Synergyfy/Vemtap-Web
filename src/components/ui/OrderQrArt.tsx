import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface OrderQrArtProps {
  value: string;
  size?: number;
  className?: string;
  alt?: string;
}

/** A real, scannable QR code for an order reference or public destination. */
export function OrderQrArt({ value, size = 168, className = '', alt = `QR code for ${value}` }: OrderQrArtProps) {
  const [image, setImage] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    let ignore = false;
    setImage('');
    setError(false);
    QRCode.toDataURL(value, { errorCorrectionLevel: 'M', margin: 1, width: size * 2 })
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

  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {image ? (
        <img alt={alt} src={image} width={size} height={size} />
      ) : error ? (
        <span role="alert" className="px-2 text-center font-caption text-caption text-error">
          QR code could not be generated.
        </span>
      ) : null}
    </div>
  );
}
