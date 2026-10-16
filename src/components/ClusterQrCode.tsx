import { useState } from 'react';
import { Icon } from './ui/Icon';

interface ClusterQrCodeProps {
  url: string;
  clusterName: string;
  displayCode: string;
  size?: number;
  className?: string;
}

export function ClusterQrCode({
  url,
  clusterName,
  displayCode,
  size = 200,
  className = '',
}: ClusterQrCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(url).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // Generate a simple SVG file download for printable pass
    const svgElement = document.getElementById(`cluster-qr-svg-${displayCode}`);
    if (!svgElement) return;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${clusterName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-qr.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* QR Card Container */}
      <div className="relative p-5 bg-white rounded-3xl shadow-lg border border-border-subtle flex flex-col items-center">
        {/* Header Tag */}
        <div className="flex items-center gap-1.5 px-3 py-1 mb-3 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
          <Icon name="hub" className="text-[14px]" />
          <span>VEMTAP CLUSTER PASS</span>
        </div>

        {/* QR Graphic */}
        <div
          className="relative bg-white p-2 rounded-2xl flex items-center justify-center border border-gray-100 shadow-inner"
          style={{ width: size, height: size }}
        >
          <svg
            id={`cluster-qr-svg-${displayCode}`}
            className="w-full h-full text-text-primary fill-current"
            viewBox="0 0 160 160"
          >
            {/* Top-Left Finder */}
            <rect height="46" rx="8" width="46" x="0" y="0" fill="#066CF4" />
            <rect fill="white" height="30" rx="4" width="30" x="8" y="8" />
            <rect height="18" rx="2" width="18" x="14" y="14" fill="#066CF4" />

            {/* Top-Right Finder */}
            <rect height="46" rx="8" width="46" x="114" y="0" fill="#066CF4" />
            <rect fill="white" height="30" rx="4" width="30" x="122" y="8" />
            <rect height="18" rx="2" width="18" x="128" y="14" fill="#066CF4" />

            {/* Bottom-Left Finder */}
            <rect height="46" rx="8" width="46" x="0" y="114" fill="#066CF4" />
            <rect fill="white" height="30" rx="4" width="30" x="8" y="122" />
            <rect height="18" rx="2" width="18" x="14" y="128" fill="#066CF4" />

            {/* Matrix Data Pattern modules */}
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
            <rect height="10" rx="2" width="18" x="114" y="114" fill="#1e293b" />
            <rect height="20" rx="2" width="10" x="142" y="124" fill="#1e293b" />
            <rect height="10" rx="2" width="10" x="124" y="138" fill="#1e293b" />
            <rect height="10" rx="2" width="28" x="54" y="142" fill="#1e293b" />
            <rect height="12" rx="2" width="12" x="74" y="60" fill="#066CF4" />
            <rect height="12" rx="2" width="12" x="90" y="76" fill="#066CF4" />
          </svg>

          {/* Central Logo Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 bg-primary-container text-white rounded-xl shadow-md flex items-center justify-center border-2 border-white">
              <Icon name="hub" className="text-[20px]" />
            </div>
          </div>
        </div>

        {/* Display Code */}
        <div className="mt-3 text-center">
          <p className="font-mono text-xs font-bold tracking-wider text-text-primary uppercase">
            {displayCode}
          </p>
          <p className="text-[11px] text-text-secondary mt-0.5">
            Counter &amp; Entrance Shared Point
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 w-full max-w-xs">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 py-2 px-3 rounded-xl bg-surface-subtle hover:bg-surface-container border border-border-subtle flex items-center justify-center gap-1.5 text-text-primary font-label-sm text-label-sm transition-all"
        >
          <Icon name={copied ? 'check' : 'content_copy'} className="text-[16px] text-primary" />
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 py-2 px-3 rounded-xl bg-primary-container hover:opacity-95 text-on-primary flex items-center justify-center gap-1.5 font-label-sm text-label-sm shadow-sm transition-all"
        >
          <Icon name="download" className="text-[16px]" />
          <span>Download SVG</span>
        </button>
      </div>
    </div>
  );
}
