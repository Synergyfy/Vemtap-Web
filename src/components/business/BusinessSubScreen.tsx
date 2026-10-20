import type { ReactNode } from 'react';
import { AppScreen } from '../ui/AppScreen';
import { ScreenHeader } from '../ui/ScreenHeader';

interface BusinessSubScreenProps {
  title: string;
  onBack: () => void;
  subtitle?: string;
  trailing?: ReactNode;
  children: ReactNode;
}

/** Standard mobile-web business page: header with back button and padded body. */
export function BusinessSubScreen({ title, onBack, subtitle, trailing, children }: BusinessSubScreenProps) {
  return (
    <AppScreen>
      <ScreenHeader title={title} onBack={onBack} trailing={trailing} />
      <div className="flex flex-col w-full flex-1 px-margin pt-space-xs pb-28 gap-space-md">
        {subtitle ? <p className="font-body-md text-body-md text-text-secondary">{subtitle}</p> : null}
        {children}
      </div>
    </AppScreen>
  );
}
