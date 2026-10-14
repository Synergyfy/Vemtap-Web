import { useMemo } from 'react';

/**
 * Deterministic QR-style art for an order reference.
 *
 * BACKEND GAP: real scannable QR encoding needs a QR library (or a server
 * -rendered image from `GET /orders/{ref}/qr`). Until then this renders a
 * stable, ref-derived matrix so the confirmation looks and behaves like a
 * pass, while the human-readable order number underneath is what the cashier
 * actually keys in (the lookup flow accepts either).
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
    // Quiet ring around the finder.
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

export interface OrderQrArtProps {
  value: string;
  size?: number;
  className?: string;
}

export function OrderQrArt({ value, size = 168, className }: OrderQrArtProps) {
  const matrix = useMemo(() => buildMatrix(value), [value]);
  const cell = size / GRID;

  return (
    <svg
      role="img"
      aria-label={`Order code ${value}`}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
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
  );
}
