import { Icon } from './ui/Icon';

interface CustomerInviteQrCodeProps {
  url: string;
  businessName: string;
  size?: number;
  className?: string;
}

/**
 * Decorative invite QR card following the established ClusterQrCode pattern
 * (stylised VEMTAP-blue SVG, downloadable as an .svg for printing). A real
 * scannable encoder can replace the SVG once a QR library or backend-rendered
 * QR is available — see customerInviteService.ts integration notes.
 */
export function CustomerInviteQrCode({ url, businessName, size = 184, className = '' }: CustomerInviteQrCodeProps) {
  const handleDownload = () => {
    const svgElement = document.getElementById('customer-invite-qr-svg');
    if (!svgElement) return;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-invite-qr.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="relative p-4 bg-white rounded-3xl shadow-lg border border-border-subtle flex flex-col items-center">
        <span className="flex items-center gap-1.5 px-3 py-1 mb-3 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
          <Icon name="person_add" className="text-[14px]" />
          <span>VEMTAP CUSTOMER INVITE</span>
        </span>

        <div
          className="relative bg-white p-2 rounded-2xl flex items-center justify-center border border-gray-100 shadow-inner"
          style={{ width: size, height: size }}
        >
          <svg
            id="customer-invite-qr-svg"
            className="w-full h-full text-text-primary fill-current"
            viewBox="0 0 160 160"
            role="img"
            aria-label={`Invite QR code for ${businessName}`}
          >
            {/* Finder patterns */}
            <rect height="46" rx="8" width="46" x="0" y="0" fill="#066CF4" />
            <rect fill="white" height="30" rx="4" width="30" x="8" y="8" />
            <rect height="18" rx="2" width="18" x="14" y="14" fill="#066CF4" />
            <rect height="46" rx="8" width="46" x="114" y="0" fill="#066CF4" />
            <rect fill="white" height="30" rx="4" width="30" x="122" y="8" />
            <rect height="18" rx="2" width="18" x="128" y="14" fill="#066CF4" />
            <rect height="46" rx="8" width="46" x="0" y="114" fill="#066CF4" />
            <rect fill="white" height="30" rx="4" width="30" x="8" y="122" />
            <rect height="18" rx="2" width="18" x="14" y="128" fill="#066CF4" />
            {/* Data modules */}
            <rect height="10" rx="2" width="10" x="54" y="8" fill="#1e293b" />
            <rect height="10" rx="2" width="10" x="72" y="8" fill="#1e293b" />
            <rect height="10" rx="2" width="10" x="90" y="8" fill="#1e293b" />
            <rect height="28" rx="2" width="10" x="54" y="26" fill="#1e293b" />
            <rect height="10" rx="2" width="10" x="72" y="34" fill="#1e293b" />
            <rect height="18" rx="2" width="10" x="90" y="26" fill="#1e293b" />
            <rect height="10" rx="2" width="10" x="8" y="54" fill="#1e293b" />
            <rect height="10" rx="2" width="18" x="26" y="54" fill="#1e293b" />
            <rect height="10" rx="2" width="28" x="8" y="72" fill="#1e293b" />
            <rect height="10" rx="2" width="10" x="26" y="90" fill="#1e293b" />
            <rect height="10" rx="2" width="10" x="114" y="54" fill="#1e293b" />
            <rect height="10" rx="2" width="18" x="132" y="54" fill="#1e293b" />
            <rect height="10" rx="2" width="28" x="122" y="72" fill="#1e293b" />
            <rect height="10" rx="2" width="10" x="142" y="90" fill="#1e293b" />
            <rect height="20" rx="2" width="10" x="54" y="114" fill="#1e293b" />
            <rect height="10" rx="2" width="28" x="72" y="124" fill="#1e293b" />
            <rect height="18" rx="2" width="18" x="114" y="114" fill="#1e293b" />
            <rect height="20" rx="2" width="10" x="142" y="124" fill="#1e293b" />
            <rect height="10" rx="2" width="10" x="124" y="138" fill="#1e293b" />
            <rect height="10" rx="2" width="28" x="54" y="142" fill="#1e293b" />
            <rect height="12" rx="2" width="12" x="74" y="60" fill="#066CF4" />
            <rect height="12" rx="2" width="12" x="90" y="76" fill="#066CF4" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 bg-primary text-white rounded-xl shadow-md flex items-center justify-center border-2 border-white">
              <Icon name="person_add" className="text-[20px]" />
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-[11px] text-text-secondary max-w-[200px] leading-snug">
          Scan to join {businessName} on VEMTAP
        </p>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        title={url}
        className="flex items-center gap-space-2xs px-space-sm h-9 rounded-xl border border-border-subtle bg-surface-canvas hover:bg-surface-subtle text-text-primary font-label-sm text-label-sm font-semibold transition-colors"
      >
        <Icon name="download" className="text-[16px] text-primary" />
        <span>Download QR</span>
      </button>
    </div>
  );
}
