import { Icon } from '../../components/ui/Icon';
import {
  BUSINESS_SIDEBAR_SECTIONS,
  resolveSidebarActive,
  type BusinessSidebarSubItem,
} from './businessSidebarConfig';

/** The POS section of the main business sidebar — reused as the POS rail's primary group. */
const POS_SECTION = BUSINESS_SIDEBAR_SECTIONS.find((section) => section.key === 'pos')!;

/**
 * Store Front pages replace the old "Terminal" group (Products / Ledger /
 * Settings): the catalogue already lives under Business › Products & Services
 * and VEMTAP does not settle payments yet, so the storefront pages are what a
 * cashier actually needs one tap away.
 */
const STORE_FRONT_SECTION = BUSINESS_SIDEBAR_SECTIONS.find((section) => section.key === 'store-ordering')!;

const RAIL_TOP: Record<'16' | '20', string> = { '16': 'top-16', '20': 'top-20' };

const POS_NAV_GROUPS: ReadonlyArray<{ label: string; items: BusinessSidebarSubItem[] }> = [
  { label: 'Point of Sale', items: POS_SECTION.items ?? [] },
  { label: 'Store Front', items: STORE_FRONT_SECTION.items ?? [] },
];

interface PosNavRailProps {
  active?: string;
  onSelect?: (key: string) => void;
  headerHeight?: '16' | '20';
}

/**
 * The POS side menu rendered beside the collapsed business rail while the app is
 * in POS mode. It mirrors the "POS" dropdown of the main business sidebar so the
 * menu never has to swap out — the main rail simply collapses to icons.
 */
export function PosNavRail({ active, onSelect, headerHeight = '16' }: PosNavRailProps) {
  const { itemKey: activeItemKey } = resolveSidebarActive(active);

  return (
    <aside
      className={`hidden lg:flex fixed left-[72px] ${RAIL_TOP[headerHeight]} bottom-0 z-40 w-[72px] lg:w-60 flex-col border-r border-border-subtle bg-surface-canvas overflow-y-auto select-none`}
      aria-label="Point of Sale navigation"
    >
      <nav className="flex flex-col p-2 lg:p-3">
        {POS_NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-space-xs last:mb-0">
            <span className="hidden lg:block px-3 py-1.5 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-text-tertiary truncate">
              {group.label}
            </span>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                const isActive = activeItemKey === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-current={isActive ? 'page' : undefined}
                    title={item.label}
                    onClick={() => onSelect?.(item.key)}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-subtle'
                    }`}
                  >
                    <Icon
                      name={item.icon ?? 'circle'}
                      className={`text-[20px] shrink-0 ${
                        isActive ? 'text-on-primary' : 'text-text-tertiary group-hover:text-on-surface'
                      }`}
                    />
                    <span
                      className={`hidden lg:block truncate font-label-md text-label-md ${
                        isActive ? 'font-semibold' : 'font-medium'
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={`hidden lg:flex ml-auto px-1.5 py-0.5 rounded-full font-caption text-[10px] font-bold leading-none ${
                          isActive ? 'bg-on-primary/20 text-on-primary' : item.badgeClass || 'bg-surface-container text-text-secondary'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
