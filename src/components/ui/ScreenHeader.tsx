import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface ScreenHeaderProps {
  title: string;
  onBack: () => void;
  trailing?: ReactNode;
}

export function ScreenHeader({ title, onBack, trailing }: ScreenHeaderProps) {
  return (
    <header className="w-full shrink-0 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-14 px-margin flex items-center justify-between">
        <button
          aria-label="Go back"
          type="button"
          onClick={onBack}
          className="w-11 h-11 -ml-space-2xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high active:scale-95 transition-all duration-150"
        >
          <Icon name="arrow_back" className="text-[24px]" />
        </button>
        <span className="flex-1 truncate px-space-xs text-center font-heading-sm text-heading-sm text-on-surface tracking-tight">
          {title}
        </span>
        {trailing ?? (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Icon name="person" className="text-on-primary text-[18px]" />
          </div>
        )}
      </div>
    </header>
  );
}
