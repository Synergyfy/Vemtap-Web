import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Logo } from '../../components/ui/Logo';
import {
  PortalBody,
  PORTAL_CONTENT,
  POS_RAIL_OFFSET,
  RAIL_OFFSET,
  ShellAccountMenu,
  type ShellAccountKey,
} from './PortalShell';
import { BusinessSidebarRail } from './BusinessSidebarRail';
import { PosNavRail } from './PosNavRail';
import { MessagesNavRail } from './MessagesNavRail';
import { resolveSidebarActive } from './businessSidebarConfig';
import { BusinessBranchSelect } from '../../components/BusinessBranchSelect';
import { NOTIFICATION_FEED } from '../../utils/notificationFeed';

export type BusinessPortalNavKey = string;


interface BusinessPortalChromeProps {
  children: ReactNode;
  activeNav?: string;
  onNav?: (key: string) => void;
  onBrand?: () => void;
  notificationCount?: number;
  onSignOut?: () => void;
}

export function BusinessPortalChrome({
  children,
  activeNav = 'overview',
  onNav,
  onBrand,
  notificationCount = 3,
  onSignOut,
}: BusinessPortalChromeProps) {
  const handleAccount = (key: ShellAccountKey) => {
    if (key === 'sign-out') onSignOut?.();
    else onNav?.(key as string);
  };

  // Header bell pop-up: quick glance at recent alerts + a link to the full
  // dashboard notifications page. Closes on outside click or Escape.
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    const initialRead = new Set<string>();
    NOTIFICATION_FEED.slice(notificationCount).forEach((item) => initialRead.add(item.id));
    return initialRead;
  });
  const notifRef = useRef<HTMLDivElement | null>(null);
  const unreadCount = NOTIFICATION_FEED.filter((item) => !readIds.has(item.id)).length;

  useEffect(() => {
    if (!notifOpen) return;
    const handlePointer = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setNotifOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNotifOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [notifOpen]);

  const openAllNotifications = () => {
    setNotifOpen(false);
    onNav?.('more-notifications');
  };


  // POS section pages run in "POS mode": the main business rail collapses to an
  // icon strip and the POS menu opens beside it, so the side menu is never swapped.
  // Messages works the same way: the rail collapses and the Messages menu
  // (In-App Chat / SMS / Email) opens beside it.
  const { sectionKey, itemKey } = resolveSidebarActive(activeNav);
  const posMode = sectionKey === 'pos';
  const messagesMode = sectionKey === 'messages';
  const nestedMode = posMode || messagesMode;

  return (
    <div
      className={`w-full min-h-screen bg-surface-subtle font-body-md text-body-md text-on-surface antialiased flex flex-col ${
        nestedMode ? POS_RAIL_OFFSET : RAIL_OFFSET
      }`}
    >
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-canvas/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center shrink-0">
            <div className="w-auto lg:w-60 flex items-center gap-space-xs shrink-0">
              <button type="button" onClick={onBrand} className="flex items-center gap-space-xs">
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
            <div className="hidden md:flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-label-sm text-caption font-medium">Cloud Synced</span>
            </div>
            <button
              type="button"
              title="Help & Support"
              onClick={() => onNav?.('more-support')}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle hover:text-on-surface transition-colors"
            >
              <Icon name="help_outline" className="text-[20px]" />
            </button>
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                title="Notifications"
                aria-expanded={notifOpen}
                aria-haspopup="true"
                onClick={() => setNotifOpen((open) => !open)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle hover:text-on-surface transition-colors"
              >
                <Icon name="notifications" className="text-[20px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-container text-on-primary font-caption text-[10px] font-bold leading-none ring-2 ring-surface-canvas">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl bg-surface-canvas border border-border-subtle shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between gap-space-sm px-space-md py-space-sm border-b border-border-subtle bg-surface-subtle/60">
                    <div className="flex items-center gap-space-2xs">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-space-2xs py-0.5 rounded-full bg-primary-container text-on-primary font-caption text-caption font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setReadIds(new Set(NOTIFICATION_FEED.map((item) => item.id)))}
                      disabled={unreadCount === 0}
                      className="font-label-sm text-label-sm text-primary hover:underline disabled:text-text-tertiary disabled:no-underline"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-[320px] overflow-y-auto divide-y divide-border-subtle">
                    {NOTIFICATION_FEED.map((item) => {
                      const unread = !readIds.has(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={openAllNotifications}
                          className="w-full flex items-start gap-space-sm px-space-md py-space-sm text-left hover:bg-surface-subtle transition-colors"
                        >
                          <span
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.iconClass}`}
                          >
                            <Icon name={item.icon} className="text-[18px]" />
                          </span>
                          <span className="flex flex-col flex-1 min-w-0">
                            <span className="flex items-center justify-between gap-space-2xs">
                              <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">
                                {item.title}
                              </span>
                              <span className="font-caption text-caption text-text-tertiary whitespace-nowrap">
                                {item.time}
                              </span>
                            </span>
                            <span className="font-caption text-caption text-text-secondary leading-snug mt-0.5">
                              {item.body}
                            </span>
                          </span>
                          {unread && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={openAllNotifications}
                    className="w-full px-space-md py-space-sm border-t border-border-subtle bg-surface-subtle/60 hover:bg-surface-subtle text-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs transition-colors"
                  >
                    <span>View all notifications</span>
                    <Icon name="arrow_forward" className="text-[15px]" />
                  </button>
                </div>
              )}
            </div>
            <div className="h-6 w-[1px] bg-border-subtle mx-space-2xs" />
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

      <main className="w-full pt-16 flex-1 bg-surface-subtle">
        <PortalBody>{children}</PortalBody>
      </main>

      <footer className="w-full bg-surface-canvas shadow-[0_-1px_6px_rgba(0,0,0,0.03)] py-space-md">
        <div className={`w-full ${PORTAL_CONTENT} flex flex-col md:flex-row items-center justify-between gap-space-sm`}>
          <div className="flex flex-wrap items-center gap-space-sm font-label-sm text-caption text-text-secondary">
            <div className="flex items-center gap-1.5">
              <Icon name="verified_user" className="text-badge-discount-text text-[16px]" />
              <span>NDPR Compliant</span>
            </div>
            <span className="text-border-subtle">•</span>
            <div className="flex items-center gap-1.5">
              <Icon name="shield" className="text-badge-discount-text text-[16px]" />
              <span>ISO 27001 Certified</span>
            </div>
            <span className="text-border-subtle">•</span>
            <div className="flex items-center gap-1.5">
              <Icon name="lock" className="text-badge-discount-text text-[16px]" />
              <span>Bank-Grade 256-Bit SSL Security</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-space-md font-label-sm text-caption text-text-secondary">
            <button type="button" className="hover:text-primary transition-colors">Privacy Policy</button>
            <button type="button" className="hover:text-primary transition-colors">Terms of Service</button>
            <button type="button" className="hover:text-primary transition-colors">Merchant Agreement</button>
            <span className="text-text-tertiary">© 2025 VEMTAP Technologies Limited</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
