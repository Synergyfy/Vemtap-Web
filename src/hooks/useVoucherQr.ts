import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/** The link a voucher's QR opens: this voucher's own pass page. */
export const voucherPassLink = (claimId: string) => `${window.location.origin}/my/claimed-deal/${encodeURIComponent(claimId)}`;

/** A scannable QR image for a voucher's pass link; null until it is ready. */
export function useVoucherQr(claimId: string | undefined) {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    setImage(null);
    if (!claimId) return;
    let ignore = false;
    QRCode.toDataURL(voucherPassLink(claimId), { errorCorrectionLevel: 'M', margin: 1, width: 480 })
      .then((url) => {
        if (!ignore) setImage(url);
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, [claimId]);

  return image;
}
