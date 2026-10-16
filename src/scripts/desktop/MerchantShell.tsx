import type { ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Logo } from '../../components/ui/Logo';
import { BusinessBranchSelect } from '../../components/BusinessBranchSelect';
import { BusinessSidebarRail } from './BusinessSidebarRail';
import { PosNavRail } from './PosNavRail';
import { MessagesNavRail } from './MessagesNavRail';
import { resolveSidebarActive } from './businessSidebarConfig';
import {
  PortalBody,
  PORTAL_CONTENT,
  POS_RAIL_OFFSET,
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

  // Store Front pages live inside POS now: the main business rail collapses to an
  // icon strip and the POS menu (with the Store Front group) opens beside it.
  // Messages works the same way — the Messages menu (In-App Chat / SMS / Email)
  // opens beside the collapsed main rail.
  const { sectionKey, itemKey } = resolveSidebarActive(activeNav);
  const posMode = sectionKey === 'pos';
  const messagesMode = sectionKey === 'messages';
  const nestedMode = posMode || messagesMode;

  return (
    <div className={`w-full min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased ${nestedMode ? POS_RAIL_OFFSET : RAIL_OFFSET}`}>
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-canvas/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center shrink-0">
            <div className="w-auto lg:w-60 flex items-center gap-space-xs shrink-0">
              <button type="button" onClick={() => onNav?.('overview')} className="flex items-center gap-space-xs">
                <Logo variant="full" className="h-10 md:h-11 w-auto" />
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary shrink-0 leading-none">
                  BUSINESS
                </span>
              </button>
            </div>
            <div className="h-5 w-[1px] bg-border-subtle mx-space-md hidden lg:block" />
            {/* Branch control — the location shown in the header drives every page. */}
            <div className="hidden lg:block">
              <BusinessBranchSelect
                align="left"
                triggerClassName="inline-flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container transition-colors text-text-secondary hover:text-on-surface max-w-[240px]"
                nameClassName="font-label-md text-label-md text-on-surface"
              />
            </div>
            <div className="lg:hidden">
              <BusinessBranchSelect iconOnly align="left" />
            </div>
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

      {nestedMode ? (
        <>
          <BusinessSidebarRail collapsed active={activeNav} onSelect={onNav} headerHeight="16" />
          {posMode ? (
            <PosNavRail active={itemKey} onSelect={onNav} headerHeight="16" />
          ) : (
            <MessagesNavRail active={itemKey} onSelect={onNav} headerHeight="16" />
          )}
        </>
      ) : (
        <BusinessSidebarRail active={activeNav} onSelect={onNav} headerHeight="16" />
      )}

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
