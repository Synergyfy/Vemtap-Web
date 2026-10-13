import { Icon } from '../components/ui/Icon';

interface BusinessCfdHeaderProps {
  title: string;
  onBack: () => void;
  trailing?: 'restaurant' | 'point_of_sale';
}

export function BusinessCfdHeader({ title, onBack, trailing = 'point_of_sale' }: BusinessCfdHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-14 px-margin flex items-center justify-between gap-space-xs">
        <div className="flex items-center gap-space-xs min-w-0">
          <button
            aria-label="Go back"
            className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-low active:scale-95 transition-all shrink-0"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[21px]" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_4px_16px_-2px_rgba(6,108,244,0.3)] shrink-0">
            <Icon name={trailing} className="text-on-primary text-[19px]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-caption text-caption text-primary tracking-wide uppercase font-semibold leading-none">
              VEMTAP CFD
            </span>
            <h1 className="font-heading-sm text-heading-sm text-on-surface leading-tight truncate">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-space-xs shrink-0">
          <div className="flex items-center gap-space-2xs bg-surface-tint-blue px-space-xs py-space-2xs rounded-full">
            <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
            <span className="font-caption text-caption text-primary font-medium">Online</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Icon name="person" className="text-on-primary text-[17px]" />
          </div>
        </div>
      </div>
    </header>
  );
}
