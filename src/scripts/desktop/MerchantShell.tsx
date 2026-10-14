import type { ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Logo } from '../../components/ui/Logo';
import { BusinessSidebarRail } from './BusinessSidebarRail';
import {
  PortalBody,
  PORTAL_CONTENT,
  RAIL_OFFSET,
  ShellAccountMenu,
  type ShellAccountKey,
} from './PortalShell';

interface MerchantShellProps {
  children: ReactNode;
  activeNav?: string;
  onNav?: (key: string) => void;
  onSignOut?: () => void;
}

export function MerchantShell({ children, activeNav = 'catalog', onNav, onSignOut }: MerchantShellProps) {
  const handleAccount = (key: ShellAccountKey) => {
    if (key === 'sign-out') onSignOut?.();
    else onNav?.(key);
  };

  return (
    <div className={`w-full min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased ${RAIL_OFFSET}`}>
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-canvas/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center shrink-0">
            <div className="w-auto xl:w-60 flex items-center gap-space-xs shrink-0">
              <button type="button" onClick={() => onNav?.('overview')} className="flex items-center gap-space-xs">
                <Logo variant="full" className="h-10 md:h-11 w-auto" />
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary shrink-0 leading-none">
                  BUSINESS
                </span>
              </button>
            </div>
            <div className="h-5 w-[1px] bg-border-subtle mx-space-md hidden xl:block" />
            <button
              type="button"
              className="hidden xl:flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container transition-colors text-text-secondary hover:text-on-surface"
            >
              <Icon name="store" className="text-primary text-[18px]" />
              <span className="font-label-md text-label-md max-w-[190px] truncate">Wuse II Branch, Abuja, FCT</span>
              <Icon name="expand_more" className="text-[16px] text-text-tertiary" />
            </button>
          </div>
          <div className="flex items-center gap-space-sm flex-shrink-0">
            <div className="hidden sm:flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-medium">Live Synced</span>
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="relative p-space-xs rounded-lg hover:bg-surface-container-high hover:text-on-surface text-on-surface-variant transition-colors"
            >
              <Icon name="notifications" className="text-[22px]" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-surface-canvas" />
            </button>
            <ShellAccountMenu onSelect={handleAccount} />
          </div>
        </div>
      </header>

      <BusinessSidebarRail active={activeNav} onSelect={onNav} headerHeight="16" />

      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-80px)]">
        <div className="py-space-lg">
          <PortalBody>{children}</PortalBody>
        </div>
      </main>

      <footer className="w-full bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className={`${PORTAL_CONTENT} py-space-xl flex flex-col md:flex-row items-center justify-between gap-space-md`}>
          <div className="flex flex-wrap items-center gap-space-md text-text-secondary font-caption text-caption">
            <div className="flex items-center gap-space-2xs">
              <Icon name="verified_user" className="text-badge-discount-text text-[16px]" />
              <span>NDPR Compliant</span>
            </div>
            <div className="flex items-center gap-space-2xs">
              <Icon name="lock" className="text-primary text-[16px]" />
              <span>ISO/IEC 27001 Certified</span>
            </div>
            <div className="flex items-center gap-space-2xs">
              <Icon name="shield" className="text-secondary text-[16px]" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-space-md font-caption text-caption text-text-secondary">
            <button type="button" className="hover:text-on-surface transition-colors">
              Merchant Agreement
            </button>
            <button type="button" className="hover:text-on-surface transition-colors">
              Privacy Policy
            </button>
            <button type="button" className="hover:text-on-surface transition-colors">
              Security Standards
            </button>
            <button type="button" className="hover:text-on-surface transition-colors">
              System Status
            </button>
            <span>© 2025 VEMTAP Technologies Ltd. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
