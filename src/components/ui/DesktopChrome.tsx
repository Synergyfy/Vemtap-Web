import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useProfile } from '../../context/ProfileContext';
import { DesktopLocationRadiusModal } from '../DesktopLocationRadiusModal';
import { PortalRail, RAIL_OFFSET, type RailGroup } from '../../scripts/desktop/PortalShell';
import { notificationService, type NotificationItem } from '../../services/notificationService';
import { Icon } from './Icon';
import { Logo } from './Logo';

export type DesktopNavKey =
  | 'home'
  | 'discover'
  | 'deals'
  | 'exclusive-deals'
  | 'how-it-works'
  | 'for-business'
  | 'sign-in'
  | 'get-started'
  | 'businesses'
  | 'dashboard'
  | 'my-deals'
  | 'orders'
  | 'messages'
  | 'cart'
  | 'notifications'
  | 'account-settings'
  | 'storefront'
  | 'all-products'
  | 'all-services'
  | 'product-detail'
  | 'spa-storefront'
  | 'spa-booking'
  | 'deal-detail'
  | 'for-merchants';

interface DesktopNavHeaderProps {
  active?: DesktopNavKey;
  onNav: (key: DesktopNavKey) => void;
  onOpenLocation?: () => void;
  /** Shifts the header content right to clear the fixed left rail on signed-in customer screens. */
  railOffset?: boolean;
}

const NAV_ITEMS: Array<{ key: DesktopNavKey; label: string }> = [
  { key: 'home', label: 'Home' },
  { key: 'deals', label: 'Deals' },
  { key: 'discover', label: 'Business' },
];

const SIGNED_IN_NAV_ITEMS: Array<{ key: DesktopNavKey; label: string }> = [
  { key: 'home', label: 'Home' },
  { key: 'deals', label: 'Deals' },
  { key: 'discover', label: 'Business' },
];

const ACCOUNT_MENU_ITEMS: Array<{ key: DesktopNavKey; label: string; icon: string }> = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'my-deals', label: 'My Deals', icon: 'redeem' },
  { key: 'orders', label: 'Orders', icon: 'receipt_long' },
  { key: 'messages', label: 'Messages', icon: 'forum' },
  { key: 'cart', label: 'Cart', icon: 'shopping_cart' },
  { key: 'account-settings', label: 'Account Settings', icon: 'settings' },
];

const CUSTOMER_NAV_ITEMS: Array<{ key: DesktopNavKey; label: string }> = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'my-deals', label: 'My Deals & Vouchers' },
  { key: 'orders', label: 'Orders & Bookings' },
  { key: 'messages', label: 'Messages' },
  { key: 'cart', label: 'Saved Items & Stores' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'account-settings', label: 'Account & Security' },
];

const customerNavItem = (key: DesktopNavKey) => CUSTOMER_NAV_ITEMS.find((item) => item.key === key)!;

/** Persistent left rail for signed-in desktop customer screens (mirrors the business portal rail). */
const CUSTOMER_NAV_GROUPS: ReadonlyArray<RailGroup<DesktopNavKey>> = [
  { label: '', items: [customerNavItem('dashboard')] },
  { label: 'Shopping', items: [customerNavItem('my-deals'), customerNavItem('orders'), customerNavItem('messages')] },
  { label: 'Account', items: [customerNavItem('cart'), customerNavItem('account-settings')] },
];

const CUSTOMER_RAIL_ICONS: Readonly<Record<string, string>> = {
  dashboard: 'space_dashboard',
  'my-deals': 'redeem',
  orders: 'receipt_long',
  messages: 'forum',
  cart: 'bookmark',
  'account-settings': 'settings',
};

export function DesktopNavHeader({ active, onNav, onOpenLocation, railOffset = false }: DesktopNavHeaderProps) {
  const { authed, signOut } = useAuth();
  const { fullName, email, initials } = useProfile();
  const { district, city, radius, setLocation } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notificationItems, setNotificationItems] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const accountRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  const closeMenu = () => setMenuOpen(false);
  const openLocation = onOpenLocation ?? (() => setLocationOpen(true));
  const unreadCount = notificationItems.filter((item) => !readIds.has(item.id)).length;

  // The header uses `backdrop-blur`, which turns it into the containing block
  // for `position: fixed` children — so a fixed overlay would be trapped
  // inside the header. Listen on the document instead.
  useEffect(() => {
    if (!menuOpen) return;
    const handleDocumentClick = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) closeMenu();
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!authed) {
      setNotificationItems([]);
      setReadIds(new Set());
      return;
    }

    let ignore = false;

    const loadNotifications = async () => {
      try {
        const response = await notificationService.list({ limit: 5 });
        if (ignore) return;

        const mapped = response.map((item) => ({
          ...item,
          id: String(item.id),
          title: item.title || 'Vemtap update',
          message: item.message || item.body || 'You have a new update.',
          unread: item.unread ?? !(item.isRead ?? item.read ?? false),
        }));

        setNotificationItems(mapped);
        setReadIds(() => {
          const next = new Set<string>();
          mapped.filter((item) => !item.unread).forEach((item) => next.add(item.id));
          return next;
        });
      } catch (error) {
        console.warn('Unable to load desktop notifications:', error);
        if (!ignore) {
          setNotificationItems([]);
          setReadIds(new Set());
        }
      }
    };

    void loadNotifications();
    return () => { ignore = true; };
  }, [authed]);

  useEffect(() => {
    if (!notifOpen) return;
    const handleDocumentClick = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setNotifOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [notifOpen]);

  const openAllNotifications = () => {
    setNotifOpen(false);
    onNav('notifications');
  };

  const navButtonClass = (key: DesktopNavKey) =>
    `px-space-sm py-space-2xs font-label-md text-label-md transition-colors rounded-lg ${
      active === key
        ? 'bg-surface-tint-blue text-primary font-semibold'
        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-subtle'
    }`;

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-canvas/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className={`h-20 ${railOffset ? 'w-full' : 'max-w-7xl mx-auto'} px-margin flex items-center justify-between gap-gutter`}>
        <div className="flex items-center shrink-0">
          <div className={`${railOffset ? 'w-auto lg:w-60' : ''} flex items-center gap-space-xs shrink-0`}>
            <button
              type="button"
              className="flex items-center gap-space-xs"
              aria-label="VemTap home"
              onClick={() => onNav('home')}
            >
              <Logo variant="full" className="h-11 md:h-12 w-auto" />
              {(authed || railOffset) && (
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary shrink-0 leading-none">
                  CUSTOMER
                </span>
              )}
            </button>
          </div>

          {authed ? (
            <>
              {railOffset && <div className="h-5 w-[1px] bg-border-subtle mx-space-md hidden lg:block" />}
              <button
                type="button"
                className="hidden lg:flex items-center gap-space-xs bg-surface-container-low px-space-sm py-space-2xs rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
                onClick={openLocation}
              >
                <Icon name="location_on" className="text-[18px] text-primary-container" />
                <span className="font-label-sm text-label-sm text-on-surface">
                  {district}, {city} • Within {radius}km
                </span>
                <Icon name="keyboard_arrow_down" className="text-[16px] text-outline" />
              </button>
            </>
          ) : (
            <nav className="hidden lg:flex items-center gap-space-lg ml-space-2xl">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onNav(item.key)}
                  className={`font-label-md text-label-md transition-colors ${
                    active === item.key
                      ? 'text-primary-container font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>

        {authed && (
          <div className="flex-1 max-w-md hidden lg:block">
            <div className="relative flex items-center">
              <Icon
                name="search"
                className="absolute left-space-md text-[20px] text-outline pointer-events-none"
              />
              <input
                className="w-full h-11 pl-11 pr-space-md bg-surface-subtle border-0 rounded-full font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all"
                placeholder="Search deals, restaurants, beauty, spas..."
                type="search"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-space-md shrink-0">
          {authed ? (
            <>
              <nav className="hidden lg:flex items-center gap-space-xs">
                {SIGNED_IN_NAV_ITEMS.map((item) => (
                  <button key={item.key} type="button" className={navButtonClass(item.key)} onClick={() => onNav(item.key)}>
                    {item.label}
                  </button>
                ))}
              </nav>

              <div ref={notifRef} className="relative">
                <button
                  type="button"
                  aria-label="Notifications"
                  aria-expanded={notifOpen}
                  aria-haspopup="true"
                  onClick={() => setNotifOpen((open) => !open)}
                  className="relative w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
                >
                  <Icon name="notifications" className="text-[22px]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-caption text-[10px] font-bold text-on-primary leading-none ring-2 ring-surface-canvas">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 z-50 w-[min(360px,calc(100vw-2rem))] rounded-2xl bg-surface-canvas border border-border-subtle shadow-[0_12px_32px_-8px_rgba(13,37,76,0.18)] overflow-hidden">
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
                        disabled={unreadCount === 0}
                        onClick={async () => {
                          if (unreadCount === 0) return;
                          setReadIds(new Set(notificationItems.map((item) => item.id)));
                          try {
                            await notificationService.markAllRead();
                          } catch (error) {
                            console.warn('Unable to mark all notifications read:', error);
                          }
                        }}
                        className="font-label-sm text-label-sm text-primary disabled:text-text-tertiary disabled:no-underline hover:underline"
                      >
                        Mark all read
                      </button>
                    </div>

                    <div className="max-h-[320px] overflow-y-auto divide-y divide-border-subtle">
                      {notificationItems.length === 0 ? (
                        <div className="px-space-md py-space-lg text-center text-text-secondary">
                          <p className="font-label-md text-label-md text-on-surface">No new notifications</p>
                          <p className="mt-1 font-caption text-caption">We’ll show your latest updates here.</p>
                        </div>
                      ) : (
                        notificationItems.map((item) => {
                          const unread = !readIds.has(item.id);
                          const category = String(item.category ?? item.type ?? item.kind ?? 'system').toLowerCase();
                          const icon = category.includes('reward') ? 'stars' : category.includes('booking') || category.includes('order') ? 'calendar_month' : category.includes('deal') ? 'local_offer' : 'campaign';
                          const iconClass = category.includes('reward')
                            ? 'bg-badge-discount-bg text-badge-discount-text'
                            : category.includes('booking') || category.includes('order')
                              ? 'bg-primary-fixed text-primary'
                              : category.includes('deal')
                                ? 'bg-tertiary-fixed text-tertiary'
                                : 'bg-surface-container-highest text-secondary';

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={openAllNotifications}
                              className="w-full flex items-start gap-space-sm px-space-md py-space-sm text-left hover:bg-surface-subtle transition-colors"
                            >
                              <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}>
                                <Icon name={icon} className="text-[18px]" />
                              </span>
                              <span className="flex flex-col flex-1 min-w-0">
                                <span className="flex items-center justify-between gap-space-2xs">
                                  <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">
                                    {item.title}
                                  </span>
                                  <span className="font-caption text-caption text-text-tertiary whitespace-nowrap">
                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Now'}
                                  </span>
                                </span>
                                <span className="font-caption text-caption text-text-secondary leading-snug mt-0.5">
                                  {item.message || item.body || 'You have a new update.'}
                                </span>
                              </span>
                              {unread && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                            </button>
                          );
                        })
                      )}
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

              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  aria-label="Account menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex items-center gap-space-xs pl-space-xs rounded-xl hover:bg-surface-subtle transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary text-[12px] font-bold">
                    {initials || 'U'}
                  </span>
                  <span className="hidden lg:flex flex-col text-left leading-tight">
                    <span className="font-label-md text-label-md text-text-primary">{fullName || 'User'}</span>
                    <span className="font-caption text-caption text-text-tertiary">Consumer</span>
                  </span>
                  <Icon name="keyboard_arrow_down" className="text-[18px] text-text-tertiary hidden lg:inline-block" />
                </button>

                {menuOpen && (
                  <>
                      <div className="absolute right-0 top-full mt-space-xs z-50 w-56 py-space-xs bg-surface-canvas rounded-xl shadow-[0_12px_32px_-8px_rgba(13,37,76,0.18)] border border-border-subtle flex flex-col">
                      <div className="px-space-sm py-space-2xs">
                        <span className="font-label-md text-label-md text-text-primary font-semibold block">{fullName || 'User'}</span>
                        <span className="font-caption text-caption text-text-tertiary">{email || 'No email'}</span>
                      </div>
                      <div className="h-px bg-border-subtle my-space-2xs" />
                      {ACCOUNT_MENU_ITEMS.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            closeMenu();
                            onNav(item.key);
                          }}
                          className="flex items-center gap-space-sm px-space-sm py-space-xs font-label-md text-label-md text-on-surface-variant hover:bg-surface-subtle hover:text-on-surface transition-colors text-left"
                        >
                          <Icon name={item.icon} className="text-[18px]" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                      <div className="h-px bg-border-subtle my-space-2xs" />
                      <button
                        type="button"
                        onClick={() => {
                          closeMenu();
                          signOut();
                          onNav('sign-in');
                        }}
                        className="flex items-center gap-space-sm px-space-sm py-space-xs font-label-md text-label-md text-error hover:bg-error-container/40 transition-colors text-left"
                      >
                        <Icon name="logout" className="text-[18px]" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onNav('sign-in')}
                className="font-button-secondary text-button-secondary text-on-surface-variant hover:text-on-surface px-space-md py-space-xs transition-colors"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onNav('get-started')}
                className="font-button-primary text-button-primary bg-primary-container text-on-primary px-space-lg py-space-sm rounded-xl hover:bg-primary transition-colors shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)]"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
    <DesktopLocationRadiusModal
      open={locationOpen}
      onClose={() => setLocationOpen(false)}
      onApply={setLocation}
      district={district}
      radius={radius}
    />
    </>
  );
}

interface DesktopFooterProps {
  onNav: (key: DesktopNavKey) => void;
}

const FOOTER_COLUMNS: Array<{ title: string; links: Array<{ label: string; key: DesktopNavKey }> }> = [
  {
    title: 'Platform',
    links: [
      { label: 'Discover Local', key: 'discover' },
      { label: 'Exclusive Deals', key: 'exclusive-deals' },
      { label: 'How It Works', key: 'how-it-works' },
    ],
  },
  {
    title: 'Merchants',
    links: [
      { label: 'Set Up Business', key: 'for-business' },
      { label: 'Partner Growth', key: 'for-business' },
      { label: 'Merchant Portal', key: 'for-business' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', key: 'how-it-works' },
      { label: 'Consumer App', key: 'sign-in' },
      { label: 'Support', key: 'sign-in' },
    ],
  },
];

export function DesktopFooter({ onNav }: DesktopFooterProps) {
  return (
    <footer className="w-full bg-surface-subtle shadow-[0_1px_8px_rgba(0,0,0,0.04)] mt-auto">
      <div className="max-w-7xl mx-auto px-margin py-space-3xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-space-xl pb-space-2xl">
          <div className="md:col-span-2 flex flex-col gap-space-sm">
            <Logo variant="full" className="h-7 w-auto self-start" />
            <p className="font-body-md text-body-md text-text-secondary max-w-sm">
              Hyper-local discovery and seamless commerce for high-velocity local communities. One tap. Lifetime
              customer.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-space-sm">
              <span className="font-label-md text-label-md font-semibold text-text-primary">{column.title}</span>
              {column.links.map((link, index) => (
                <button
                  key={`${link.label}-${index}`}
                  type="button"
                  onClick={() => onNav(link.key)}
                  className="font-caption text-caption text-on-surface-variant hover:text-on-surface transition-colors text-left"
                >
                  {link.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md bg-surface-subtle">
          <p className="font-caption text-caption text-text-tertiary">© 2025 VEMTAP Inc. All rights reserved.</p>
          <div className="flex items-center gap-space-lg">
            {['Privacy Policy', 'Terms of Service', 'Security'].map((label) => (
              <span
                key={label}
                className="font-caption text-caption text-text-tertiary hover:text-on-surface transition-colors cursor-pointer"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

interface DesktopPageProps {
  children: ReactNode;
  withHeader?: boolean;
  onNav?: (key: DesktopNavKey) => void;
  activeNav?: DesktopNavKey;
  withFooter?: boolean;
  onOpenLocation?: () => void;
  /** Renders the persistent signed-in customer left rail (Dashboard → Account) and offsets content to clear it. */
  withCustomerRail?: boolean;
}

export function DesktopPage({
  children,
  withHeader = false,
  onNav,
  activeNav,
  withFooter = false,
  onOpenLocation,
  withCustomerRail = false,
}: DesktopPageProps) {
  return (
    <div
      className={`w-full min-h-screen bg-surface-canvas font-body-md text-text-primary flex flex-col antialiased ${
        withCustomerRail ? RAIL_OFFSET : ''
      }`}
    >
      {withHeader && onNav && (
        <DesktopNavHeader
          active={activeNav}
          onNav={onNav}
          onOpenLocation={onOpenLocation}
          railOffset={withCustomerRail}
        />
      )}
      {withCustomerRail && onNav && (
        <PortalRail
          groups={CUSTOMER_NAV_GROUPS}
          active={activeNav}
          onSelect={onNav}
          headerHeight="20"
          icons={CUSTOMER_RAIL_ICONS}
        />
      )}
      <main className={`w-full flex-1 bg-surface-canvas ${withHeader ? 'pt-20' : ''}`}>{children}</main>
      {withFooter && onNav && <DesktopFooter onNav={onNav} />}
    </div>
  );
}
