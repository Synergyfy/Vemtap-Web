import { Icon } from '../../components/ui/Icon';
import { useNavBadges } from '../../hooks/business/useNavBadges';
import { useBusinessFeatures } from '../../context/BusinessFeaturesContext';
import { useBusinessOfferings } from '../../context/BusinessOfferingsContext';
import {
  BUSINESS_SIDEBAR_SECTIONS,
  resolveSidebarActive,
  type BusinessSidebarSubItem,
} from './businessSidebarConfig';
import { filterSidebarSectionsForUser } from '../staffPageAccess';
import { useSessionUser } from '../../hooks/useSessionUser';

const RAIL_TOP: Record<'16' | '20', string> = { '16': 'top-16', '20': 'top-20' };

export type BusinessSecondarySectionKey = 'business' | 'pos' | 'messages' | 'store-ordering' | 'more';

interface BusinessSectionNavRailProps {
  sectionKey: BusinessSecondarySectionKey;
  active?: string;
  onSelect?: (key: string) => void;
  headerHeight?: '16' | '20';
  groupLabel?: string;
}

export function BusinessSectionNavRail({
  sectionKey,
  active,
  onSelect,
  headerHeight = '16',
  groupLabel,
}: BusinessSectionNavRailProps) {
  const { features } = useBusinessFeatures();
  const { offerings, mode } = useBusinessOfferings();
  const session = useSessionUser().data;
  const { itemKey: activeItemKey } = resolveSidebarActive(active);
  const badgeFor = useNavBadges();
  const section = filterSidebarSectionsForUser(
    BUSINESS_SIDEBAR_SECTIONS,
    (id) => Boolean(features[id]),
    session,
  ).find((item) => item.key === sectionKey);
  const items = section?.items?.filter((item) => {
    if (item.key === 'business-catalog') return offerings.hasProducts;
    if (item.key === 'business-services') return offerings.hasServices;
    return true;
  }) ?? [];

  if (!section || items.length === 0) return null;

  const title =
    groupLabel ?? (sectionKey === 'pos' ? 'Point of Sale' : sectionKey === 'messages' ? 'Channels' : section.label);
  const getItemLabel = (item: BusinessSidebarSubItem) => {
    if (item.key === 'business-catalog') return 'My Products';
    if (item.key === 'business-services') return 'My Service';
    if (item.key === 'business-deals') {
      if (mode === 'products') return 'Product Deals';
      if (mode === 'services') return 'Service Deals';
    }
    return item.label;
  };

  return (
    <aside
      className={`hidden lg:flex fixed left-[72px] ${RAIL_TOP[headerHeight]} bottom-0 z-40 w-[72px] lg:w-60 flex-col border-r border-border-subtle bg-surface-canvas overflow-y-auto select-none`}
      aria-label={`${title} navigation`}
    >
      <nav className="flex flex-col p-2 lg:p-3">
        <div className="mb-space-xs last:mb-0">
          <span className="hidden lg:block px-3 py-1.5 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-text-tertiary truncate">
            {title}
          </span>
          <div className="flex flex-col gap-1">
            {items.map((item) => {
              const isActive = activeItemKey === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  title={getItemLabel(item)}
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
                    {getItemLabel(item)}
                  </span>
                  {badgeFor(item.key, item.badge) && (
                    <span
                      className={`hidden lg:flex ml-auto px-1.5 py-0.5 rounded-full font-caption text-[10px] font-bold leading-none ${
                        isActive ? 'bg-on-primary/20 text-on-primary' : item.badgeClass || 'bg-surface-container text-text-secondary'
                      }`}
                    >
                      {badgeFor(item.key, item.badge)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}

export function isBusinessSecondarySectionKey(key: string): key is BusinessSecondarySectionKey {
  return ['business', 'pos', 'messages', 'store-ordering', 'more'].includes(key);
}
