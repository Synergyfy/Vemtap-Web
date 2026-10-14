import fullBlue from '../../hooks/VEMTAP FULL LOGO NEW PNG.png';
import fullWhite from '../../hooks/Vemtap Logo full White Header.png';
import markBlue from '../../hooks/VEMTAP LOGO NEW PNG.png';
import markWhite from '../../hooks/Vemtap Logo White.png';

const SOURCES = {
  full: fullBlue,
  'full-white': fullWhite,
  mark: markBlue,
  'mark-white': markWhite,
} as const;

export type LogoVariant = keyof typeof SOURCES;

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  alt?: string;
}

export function Logo({ variant = 'full', className = '', alt = 'VemTap' }: LogoProps) {
  return <img alt={alt} className={className} draggable={false} src={SOURCES[variant]} />;
}
