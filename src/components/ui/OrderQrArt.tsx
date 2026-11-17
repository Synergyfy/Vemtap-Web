import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface OrderQrArtProps {
  value: string;
  size?: number;
  className?: string;
}

/** A real, scannable QR code for an order reference. */
export function OrderQrArt({ value, size = 168, className = '' }: OrderQrArtProps) {
  const [image, setImage] = useState('');

  useEffect(() => {
    let ignore = false;
    QRCode.toDataURL(value, { errorCorrectionLevel: 'M', margin: 1, width: size * 2 })
      .then((url) => {
        if (!ignore) setImage(url);
      })
      .catch(() => {
        if (!ignore) setImage('');
      });
    return () => {
      ignore = true;
    };
  }, [value, size]);

  return (
    <div className={className} style={{ width: size, height: size }}>
      {image ? <img alt={`QR code for order ${value}`} src={image} width={size} height={size} /> : null}
    </div>
  );
}
