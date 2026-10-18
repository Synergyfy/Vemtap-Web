import type { ReactNode } from 'react';
import { AppScreen } from '../../components/ui/AppScreen';
import { Icon } from '../../components/ui/Icon';
import { MessagesSubNav, type MessagesChannelKey } from '../../components/campaigns/MessagesSubNav';
import { BusinessTabBar, type BusinessTabKey } from '../../components/BusinessTabBar';
import { BusinessPortalChrome } from '../desktop/BusinessPortalChrome';
import { CHANNEL_META, type CampaignChannel } from './campaignsData';

interface CampaignShellProps {
  channel: CampaignChannel;
  /** Desktop: renders the Messages side rail page. Mobile: header + tab bar. */
  isDesktop: boolean;
  onNav: (key: string) => void;
  onTab: (tab: BusinessTabKey) => void;
  /** Mobile back button — sends the user one step up (dashboard → chat). */
  onBack?: () => void;
  mobileTitle: string;
  mobileTrailing?: ReactNode;
  /** Mobile channel tabs under the header (dashboard screens). */
  showSubNav?: boolean;
  /** Mobile bottom tab bar (dashboard screens only, matching the app flows). */
  showTabBar?: boolean;
  /** Desktop page heading shown above the screen content. */
  desktopHeader?: ReactNode;
  children: ReactNode;
}

/**
 * One shell for every campaign screen: the desktop business portal (with the
 * Messages side rail) on wide screens, and the standard mobile business screen
 * with the Messages sub-navigation on phones.
 */
export function CampaignShell({
  channel,
  isDesktop,
  onNav,
  onTab,
  onBack,
  mobileTitle,
  mobileTrailing,
  showSubNav = false,
  showTabBar = false,
  desktopHeader,
  children,
}: CampaignShellProps) {
  if (isDesktop) {
    return (
      <BusinessPortalChrome activeNav={channel === 'sms' ? 'messages-sms' : 'messages-email'} onNav={onNav}>
        <div className="w-full bg-background">
          <div className="w-full py-space-xl space-y-space-lg">
            {desktopHeader}
            {children}
          </div>
        </div>
      </BusinessPortalChrome>
    );
  }

  const subNavChannel: MessagesChannelKey = channel;

  return (
    <AppScreen>
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs min-w-0 flex-1">
            {onBack && (
              <button
                type="button"
                aria-label="Go back"
                onClick={onBack}
                className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high active:scale-95 transition-all shrink-0"
              >
                <Icon name="arrow_back" className="text-[24px]" />
              </button>
            )}
            <div className="flex items-center gap-space-xs min-w-0">
              <Icon name={CHANNEL_META[channel].icon} className="text-primary text-[20px] shrink-0" />
              <h1 className="font-heading-md text-heading-md text-on-surface truncate">{mobileTitle}</h1>
            </div>
          </div>
          {mobileTrailing}
        </div>
        {showSubNav && (
          <MessagesSubNav
            active={subNavChannel}
            onSelect={(key) => onNav(key === 'chat' ? 'messages' : `messages-${key}`)}
          />
        )}
      </header>

      <div className="flex-1 flex flex-col">{children}</div>

      {showTabBar && <BusinessTabBar active="messages" onTab={onTab} />}
    </AppScreen>
  );
}
