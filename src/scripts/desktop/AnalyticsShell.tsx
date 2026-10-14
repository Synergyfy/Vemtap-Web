import type { ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessSidebarRail } from './BusinessSidebarRail';
import { PortalBody, RAIL_OFFSET, ShellAccountMenu, type ShellAccountKey } from './PortalShell';

interface AnalyticsShellProps {
  children: ReactNode;
  activeNav?: string;
  onNav?: (key: string) => void;
  onSignOut?: () => void;
}

export function AnalyticsShell({ children, activeNav, onNav, onSignOut }: AnalyticsShellProps) {
  const handleAccount = (key: ShellAccountKey) => {
    if (key === 'sign-out') onSignOut?.();
    else onNav?.(key);
  };

  return (
    <div className={`w-full min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased ${RAIL_OFFSET}`}>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg shrink-0">
            <div className="flex items-center gap-space-xs cursor-pointer select-none">
              <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container shadow-[0_4px_16px_-2px_rgba(6,108,244,0.3)]">
                <Icon name="local_mall" className="text-[22px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading-sm text-heading-sm tracking-tight text-on-surface font-bold leading-none">
                  VEMTAP
                </span>
                <span className="font-caption text-caption text-text-tertiary leading-none mt-space-2xs">
                  Enterprise
                </span>
              </div>
            </div>
            <div className="h-6 w-px bg-surface-container-high hidden sm:block" />
            <div className="hidden md:flex items-center gap-space-xs px-space-sm py-1.5 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors cursor-pointer">
              <Icon name="store" className="text-primary text-[18px]" />
              <span className="font-label-sm text-label-sm font-medium">Wuse II Branch, Abuja, FCT</span>
              <Icon name="expand_more" className="text-outline text-[16px]" />
            </div>
          </div>

          <div className="flex items-center gap-space-sm shrink-0">
            <div className="hidden sm:flex items-center gap-space-2xs px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span>Live Sync</span>
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              <Icon name="notifications" className="text-[20px]" />
            </button>
            <ShellAccountMenu onSelect={handleAccount} />
          </div>
        </div>
      </header>

      <BusinessSidebarRail active={activeNav} onSelect={onNav} headerHeight="16" />

      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-4rem)]">
        <PortalBody>{children}</PortalBody>
      </main>
    </div>
  );
}
