import { useMemo } from 'react';
import { Icon } from '../ui/Icon';

/**
 * QR-style art for a referral link, following the established
 * `CustomerInviteQrCode` / `OrderQrArt` decorative-QR pattern in this app.
 *
 * IMPORTANT: this is a deterministic, link-derived pattern — it is NOT a real
 * QR encoding and will not scan. No QR library is installed and the referral
 * backend does not exist yet, so the human-readable link is always shown next
 * to it and labelled as a preview. Swap the `<svg>` body for a real encoder
 * (or a backend-rendered image) once that is available.
 */

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const GRID = 21;

function buildMatrix(value: string): boolean[][] {
  let seed = hashString(value) || 1;
  const nextBit = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    seed >>>= 0;
    return seed % 100 < 48;
  };

  const matrix: boolean[][] = Array.from({ length: GRID }, () =>
    Array.from({ length: GRID }, () => nextBit()),
  );

  const drawFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r += 1) {
      for (let c = 0; c < 7; c += 1) {
        const edge = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[row + r][col + c] = edge || core;
      }
    }
    for (let r = -1; r < 8; r += 1) {
      for (let c = -1; c < 8; c += 1) {
        const rr = row + r;
        const cc = col + c;
        if (rr < 0 || cc < 0 || rr >= GRID || cc >= GRID) continue;
        if (r === -1 || r === 7 || c === -1 || c === 7) matrix[rr][cc] = false;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, GRID - 7);
  drawFinder(GRID - 7, 0);

  return matrix;
}

export interface ReferralQrArtProps {
  link: string;
  /** Short caption under the art, e.g. "Scan to open the referral link". */
  caption?: string;
  size?: number;
  className?: string;
}

export function ReferralQrArt({ link, caption, size = 168, className = '' }: ReferralQrArtProps) {
  const matrix = useMemo(() => buildMatrix(link), [link]);
  const cell = size / GRID;

  return (
    <div className={`flex flex-col items-center gap-space-2xs ${className}`}>
      <div className="relative bg-white rounded-2xl border border-border-subtle shadow-sm p-space-xs">
        <svg
          role="img"
          aria-label={`Referral link preview for ${link}`}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          shapeRendering="crispEdges"
        >
          <rect width={size} height={size} fill="#ffffff" />
          {matrix.map((row, r) =>
            row.map((filled, c) =>
              filled ? (
                <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#111827" />
              ) : null,
            ),
          )}
        </svg>
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="w-10 h-10 rounded-xl bg-primary text-on-primary border-2 border-white shadow-md flex items-center justify-center">
            <Icon name="card_giftcard" className="text-[20px]" />
          </span>
        </span>
      </div>
      {caption && <p className="font-caption text-caption text-text-secondary text-center max-w-[220px]">{caption}</p>}
      <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container-high text-text-secondary font-caption text-caption">
        <Icon name="info" className="text-[12px]" />
        <span>Preview artwork — the link below is what gets shared</span>
      </span>
    </div>
  );
}
