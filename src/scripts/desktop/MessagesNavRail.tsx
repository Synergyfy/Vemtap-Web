import { Icon } from '../../components/ui/Icon';
import { useNavBadges } from '../../hooks/business/useNavBadges';
import { useBusinessFeatures } from '../../context/BusinessFeaturesContext';
import {
  BUSINESS_SIDEBAR_SECTIONS,
  filterSidebarSections,
  resolveSidebarActive,
  type BusinessSidebarSubItem,
} from './businessSidebarConfig';

const RAIL_TOP: Record<'16' | '20', string> = { '16': 'top-16', '20': 'top-20' };

interface MessagesNavRailProps {
  active?: string;
  onSelect?: (key: string) => void;
  headerHeight?: '16' | '20';
}

/**
 * The Messages side menu rendered beside the collapsed business rail while the
 * app is in Messages mode. It mirrors the "Messages" dropdown of the main
 * business sidebar (In-App Chat, SMS, Email) so the menu never has to swap out
 * — the main rail simply collapses to icons, same as POS mode.
 */
export function MessagesNavRail({ active, onSelect, headerHeight = '16' }: MessagesNavRailProps) {
  const { features } = useBusinessFeatures();
  const { itemKey: activeItemKey } = resolveSidebarActive(active);
  const badgeFor = useNavBadges();

  // Only the channels the business has switched on (In-App Chat / SMS / Email).
  const visibleSections = filterSidebarSections(BUSINESS_SIDEBAR_SECTIONS, (id) => Boolean(features[id]));
  const messagesSection = visibleSections.find((section) => section.key === 'messages');
  const groups: Array<{ label: string; items: BusinessSidebarSubItem[] }> = [];
  if (messagesSection) groups.push({ label: 'Channels', items: messagesSection.items ?? [] });

  if (groups.length === 0) return null;

  return (
    <aside
      className={`hidden lg:flex fixed left-[72px] ${RAIL_TOP[headerHeight]} bottom-0 z-40 w-[72px] lg:w-60 flex-col border-r border-border-subtle bg-surface-canvas overflow-y-auto select-none`}
      aria-label="Messages navigation"
    >
      <nav className="flex flex-col p-2 lg:p-3">
        {groups.map((group) => (
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
        ))}
      </nav>
    </aside>
  );
}