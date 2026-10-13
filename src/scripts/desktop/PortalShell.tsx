import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../../components/ui/Icon';

/** Fired by the shared account menu so the app router can route to sign-in. */
export const SIGN_OUT_EVENT = 'vemtap:sign-out';

/**
 * Desktop layout rules for every merchant / business dashboard shell.
 *
 * Width      : content is centred at `PORTAL_CONTENT` (1440px) unless a screen
 *              opts out with `content="full"`.
 * Padding    : one horizontal gutter, `px-margin` (24px), applied once by the shell.
 * Navigation : sections live in grouped, collapsible sections in the left rail
 *              (`PortalRail`), never in the header.
 * Headers    : the global header carries brand / branch / account only.
 *
 * Screens inside a portal shell must NOT re-apply `max-w-*`, `mx-auto` or `px-*`
 * on their top-level wrappers — the shell owns all three.
 */
export const PORTAL_CONTENT = 'mx-auto w-full max-w-[1440px] px-margin';

/** Rail widths: icon-only from `lg` (1024px), labelled from `xl` (1280px). */
export const RAIL_OFFSET = 'lg:pl-[72px] xl:pl-60';

const RAIL_TOP: Record<'16' | '20', string> = { '16': 'top-16', '20': 'top-20' };

const RAIL_ICONS: Record<string, string> = {
  overview: 'space_dashboard',
  orders: 'receipt_long',
  messages: 'forum',
  catalog: 'inventory_2',
  deals: 'local_offer',
  locations: 'location_on',
  customers: 'group',
  analytics: 'query_stats',
  pos: 'point_of_sale',
  settings: 'settings',
  // POS terminal sections
  register: 'point_of_sale',
  products: 'sell',
  ledger: 'account_balance',
  'hardware-and-sync': 'sync',
};

export interface RailItem<T extends string> {
  key: T;
  label: string;
}

/** A collapsible section of related pages in the side rail. */
export interface RailGroup<T extends string> {
  /** Rendered as a group heading; `''` renders the items ungrouped at the top. */
  label: string;
  items: ReadonlyArray<RailItem<T>>;
}

interface PortalRailProps<T extends string> {
  groups: ReadonlyArray<RailGroup<T>>;
  active?: T;
  onSelect?: (key: T) => void;
  /** `top-16` by default; `top-20` for headers that are 80px tall. */
  headerHeight?: '16' | '20';
}

export function PortalRail<T extends string>({
  groups,
  active,
  onSelect,
  headerHeight = '16',
}: PortalRailProps<T>) {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(() => new Set());

  const toggle = (label: string) => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const renderItem = (item: RailItem<T>) => {
    const isActive = item.key === active;
    const icon = RAIL_ICONS[item.key] ?? 'circle';
    return (
      <button
        key={item.key}
        type="button"
        aria-current={isActive ? 'page' : undefined}
        title={item.label}
        onClick={() => onSelect?.(item.key)}
        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
          isActive ? 'bg-surface-tint-blue text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'
        }`}
      >
        <Icon
          name={icon}
          className={`text-[20px] shrink-0 ${isActive ? 'text-primary' : 'text-text-tertiary group-hover:text-on-surface'}`}
        />
        <span
          className={`hidden xl:block truncate font-label-md text-label-md ${
            isActive ? 'font-semibold' : 'font-medium'
          }`}
        >
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <aside
      className={`hidden lg:flex fixed left-0 ${RAIL_TOP[headerHeight]} bottom-0 z-40 w-[72px] xl:w-60 flex-col border-r border-border-subtle bg-surface-canvas overflow-y-auto`}
      aria-label="Dashboard sections"
    >
      <nav className="flex flex-col p-2 xl:p-3">
        {groups.map((group) => {
          const hasLabel = group.label.trim().length > 0;
          const isCollapsed = collapsed.has(group.label);
          // The active page's group is always expanded so it can never be lost.
          const expanded = !isCollapsed || group.items.some((item) => item.key === active);
          return (
            <div key={group.label || 'top'} className="mb-space-xs last:mb-0">
              {hasLabel && (
                <>
                  <span className="block lg:hidden xl:block h-px bg-border-subtle mx-1 mb-space-xs" />
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => toggle(group.label)}
                    title={group.label}
                    className="hidden xl:flex w-full items-center justify-between gap-1 px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold uppercase tracking-wider text-text-tertiary hover:text-on-surface transition-colors"
                  >
                    <span className="truncate">{group.label}</span>
                    <Icon name={expanded ? 'expand_less' : 'expand_more'} className="text-[16px] shrink-0" />
                  </button>
                </>
              )}
              {/* Below `xl` the rail is icon-only, so sections always stay visible. */}
              <div className={`flex flex-col gap-1 ${expanded ? 'flex' : 'flex xl:hidden'}`}>
                {group.items.map(renderItem)}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

interface PortalBodyProps {
  children: ReactNode;
  /** `'full'` lets a screen keep its own bleed — used by wide workspaces. */
  content?: 'contained' | 'full';
}

/** The single content container every dashboard screen renders inside. */
export function PortalBody({ children, content = 'contained' }: PortalBodyProps) {
  if (content === 'full') {
    return <div className="flex flex-col w-full">{children}</div>;
  }
  return <div className={`flex flex-col w-full ${PORTAL_CONTENT}`}>{children}</div>;
}

export type ShellAccountKey = 'overview' | 'settings' | 'sign-out';

interface ShellAccountMenuProps {
  onSelect?: (key: ShellAccountKey) => void;
  name?: string;
  role?: string;
}

/**
 * Avatar + account menu shared by every portal header. Replaces the inert
 * avatar that previously sat in the header with a working menu.
 */
export function ShellAccountMenu({ onSelect, name = 'Musa Danladi', role = 'Store Manager' }: ShellAccountMenuProps) {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleDocumentClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const choose = (key: ShellAccountKey) => {
    setOpen(false);
    if (key === 'sign-out') {
      // Clear the session, then let the router move to the sign-in screen.
      signOut();
      window.dispatchEvent(new CustomEvent(SIGN_OUT_EVENT));
    }
    onSelect?.(key);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-space-xs rounded-xl hover:bg-surface-subtle transition-colors"
      >
        <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Icon name="person" filled className="text-on-primary text-[18px]" />
        </span>
        <Icon name="expand_more" className={`text-[16px] text-text-tertiary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-space-xs z-50 w-60 py-space-xs bg-surface-canvas rounded-xl shadow-[0_12px_32px_-8px_rgba(13,37,76,0.18)] border border-border-subtle flex flex-col"
        >
          <div className="px-space-sm py-space-2xs">
            <span className="font-label-md text-label-md text-text-primary font-semibold block truncate">{name}</span>
            <span className="font-caption text-caption text-text-tertiary">{role}</span>
          </div>
          <div className="h-px bg-border-subtle my-space-2xs" />
          <button
            type="button"
            role="menuitem"
            onClick={() => choose('overview')}
            className="flex items-center gap-space-sm px-space-sm py-space-xs font-label-md text-label-md text-on-surface-variant hover:bg-surface-subtle hover:text-on-surface transition-colors text-left"
          >
            <Icon name="space_dashboard" className="text-[18px]" />
            <span>Dashboard</span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => choose('settings')}
            className="flex items-center gap-space-sm px-space-sm py-space-xs font-label-md text-label-md text-on-surface-variant hover:bg-surface-subtle hover:text-on-surface transition-colors text-left"
          >
            <Icon name="settings" className="text-[18px]" />
            <span>Settings</span>
          </button>
          <div className="h-px bg-border-subtle my-space-2xs" />
          <button
            type="button"
            role="menuitem"
            onClick={() => choose('sign-out')}
            className="flex items-center gap-space-sm px-space-sm py-space-xs font-label-md text-label-md text-error hover:bg-error-container/40 transition-colors text-left"
          >
            <Icon name="logout" className="text-[18px]" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
