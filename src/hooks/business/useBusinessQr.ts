import { useMutation, useQuery } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { businessQrService } from '../../services/businessQrService';
import { downloadBase64 } from '../../utils/exportCsv';
import { useMyBusiness } from './useMyBusiness';

/**
 * Live business QR: the real link, QR image and printable kit, plus the
 * business facts the QR screens show. Null fields mean demo mode (or loading).
 */
export function useBusinessQr() {
  const live = hasApiConfig();
  const summary = useQuery({ queryKey: ['business-qr'], queryFn: businessQrService.summary, enabled: live, staleTime: 10 * 60_000 });
  const business = useMyBusiness();
  const kit = useMutation({
    mutationFn: businessQrService.kit,
    onSuccess: (file) => downloadBase64(file.filename, file.mimeType, file.contentBase64),
  });
  const qr = summary.data?.business.qr;
  return {
    live,
    url: qr?.url ?? null,
    /** Shown without the protocol, e.g. `vemtap.com/b/7ZP2UF75H`. */
    link: qr?.url ? qr.url.replace(/^https?:\/\//, '') : null,
    /** Rendered as an image, never injected as markup. */
    qrImage: qr?.svg ? `data:image/svg+xml;utf8,${encodeURIComponent(qr.svg)}` : null,
    name: business.data?.name ?? summary.data?.business.name ?? null,
    category: business.data?.subcategory?.name ?? business.data?.category?.name ?? null,
    area: [business.data?.address, business.data?.city].filter(Boolean).join(', ') || null,
    cover: business.data?.coverImage ?? null,
    downloadKit: () => kit.mutate(),
    downloading: kit.isPending,
    kitError: kit.isError,
  };
}
