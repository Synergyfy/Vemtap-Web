import type { CSSProperties } from 'react';

export interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
  style?: CSSProperties;
}

export function Icon({ name, className = '', filled = false, style }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: `'FILL' 1`, ...style } : style}
    >
      {name}
    </span>
  );
}