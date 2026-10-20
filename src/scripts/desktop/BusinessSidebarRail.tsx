import { useState, useEffect } from 'react';
import { Icon } from '../../components/ui/Icon';
import { useSidebarSections } from '../../hooks/business/useSidebarSections';
import {
  resolveSidebarActive,
  type BusinessSidebarSection,
  type BusinessSidebarSubItem,
} from './businessSidebarConfig';

interface BusinessSidebarRailProps {
  active?: string;
  onSelect?: (key: string) => void;
  headerHeight?: '16' | '20';
  sections?: BusinessSidebarSection[];
  /**
   * POS mode: the rail shrinks to an icon-only strip (`72px`) so the POS menu can
   * open beside it instead of replacing it. Labels, badges, dropdowns and the
   * footer are hidden.
   */
  collapsed?: boolean;
}

const RAIL_TOP: Record<'16' | '20', string> = { '16': 'top-16', '20': 'top-20' };

export function BusinessSidebarRail({
  active = 'overview',
  onSelect,
  headerHeight = '16',
  sections: sectionsProp,
  collapsed = false,
}: BusinessSidebarRailProps) {
  const liveSections = useSidebarSections();
  const sections = sectionsProp ?? liveSections;
  const { sectionKey: activeSectionKey, itemKey: activeItemKey } = resolveSidebarActive(active);

  // Sections hidden from the main rail (e.g. Store Front, which moved inside POS).
  const visibleSections = sections.filter((section) => !section.hidden);

  const activeSectionHasChildren = visibleSections.some(
    (s) => s.key === activeSectionKey && !s.link && s.items && s.items.length > 0
  );

  // Single open dropdown state: collapsed by default, opens if user is currently inside a dropdown page
  const [openSectionKey, setOpenSectionKey] = useState<string | null>(() => {
    return activeSectionHasChildren ? activeSectionKey : null;
  });

  // When user is currently in any dropdown page, keep that dropdown open.
  // When switching to a section without children, auto-collapse so the layout stays clean.
  useEffect(() => {
    if (activeSectionHasChildren) {
      setOpenSectionKey(activeSectionKey);
    } else {
      setOpenSectionKey(null);
    }
  }, [activeSectionKey, activeSectionHasChildren]);

  const handleParentClick = (section: BusinessSidebarSection) => {
    // Direct-link sections (POS), childless sections and collapsed (POS) mode
    // never expand — a click just navigates to the section's default page.
    if (section.link || !section.items || section.items.length === 0 || collapsed) {
      onSelect?.(section.defaultKey);
      return;
    }
    // If clicking an inactive section header, navigate to its default page and expand its items
    if (activeSectionKey !== section.key) {
      setOpenSectionKey(section.key);
      onSelect?.(section.defaultKey);
      return;
    }
    // If already inside this section: if collapsed, just expand it; if already expanded, navigate to default
    if (openSectionKey !== section.key) {
      setOpenSectionKey(section.key);
    } else {
      onSelect?.(section.defaultKey);
    }
  };

  const handleSubItemClick = (subItem: BusinessSidebarSubItem) => {
    onSelect?.(subItem.key);
  };

  return (
    <aside
      className={`hidden lg:flex fixed left-0 ${RAIL_TOP[headerHeight]} bottom-0 z-40 ${
        collapsed ? 'w-[72px]' : 'w-[72px] lg:w-64'
      } flex-col border-r border-border-subtle bg-surface-canvas overflow-y-auto select-none`}
      aria-label="Business Dashboard Navigation"
    >
      <nav className={`flex flex-col ${collapsed ? 'p-2' : 'p-2 lg:p-3'} space-y-1`}>
        {visibleSections.map((section) => {
          // Link sections (POS) keep their items for the POS rail but never show a
          // dropdown chevron on the main rail.
          const hasChildren = !section.link && Boolean(section.items && section.items.length > 0);
          const isSectionActive = activeSectionKey === section.key;
          const isOpen = openSectionKey === section.key;

          return (
            <div key={section.key} className="flex flex-col">
              {/* Top-Level Section Header */}
              <button
                type="button"
                aria-expanded={hasChildren ? isOpen : undefined}
                aria-current={!hasChildren && isSectionActive ? 'page' : undefined}
                title={section.label}
                onClick={() => handleParentClick(section)}
                className={`group flex items-center w-full rounded-xl py-2.5 text-left transition-all ${
                  collapsed ? 'justify-center px-0' : 'justify-between px-3'
                } ${
                  isSectionActive
                    ? 'bg-surface-tint-blue/80 text-primary font-semibold'
                    : 'text-text-secondary hover:text-on-surface hover:bg-surface-subtle'
                }`}
              >
                <div className={`flex items-center ${collapsed ? '' : 'gap-3'} min-w-0`}>
                  <Icon
                    name={section.icon}
                    className={`text-[20px] shrink-0 transition-colors ${
                      isSectionActive
                        ? 'text-primary'
                        : 'text-text-tertiary group-hover:text-on-surface'
                    }`}
                  />
                  <span className={`${collapsed ? 'hidden' : 'hidden lg:block'} truncate font-label-md text-label-md`}>
                    {section.label}
                  </span>
                </div>

                <div className={`${collapsed ? 'hidden' : 'hidden lg:flex'} items-center gap-1.5 shrink-0`}>
                  {section.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full font-caption text-[10px] font-bold tracking-tight uppercase leading-none ${
                        section.badgeClass || 'bg-surface-container text-text-secondary'
                      }`}
                    >
                      {section.badge}
                    </span>
                  )}
                  {hasChildren && (
                    <Icon
                      name={isOpen ? 'expand_less' : 'expand_more'}
                      className={`text-[18px] text-text-tertiary transition-transform duration-200 ${
                        isOpen ? 'text-primary' : 'group-hover:text-on-surface'
                      }`}
                    />
                  )}
                </div>
              </button>

              {/* Sub-Items Dropdown List (Expanded) — hidden while collapsed (POS mode) */}
              {hasChildren && !collapsed && (
                <div
                  className={`flex-col pl-4 pr-1 mt-0.5 space-y-0.5 border-l-2 border-border-subtle/80 ml-5 ${
                    isOpen ? 'hidden lg:flex' : 'hidden'
                  }`}
                >
                  {section.items!.map((subItem) => {
                    const isSubItemActive = activeItemKey === subItem.key;
                    return (
                      <button
                        key={subItem.key}
                        type="button"
                        aria-current={isSubItemActive ? 'page' : undefined}
                        title={subItem.label}
                        onClick={() => handleSubItemClick(subItem)}
                        className={`group/sub flex items-center justify-between w-full rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                          isSubItemActive
                            ? 'bg-primary text-on-primary font-semibold shadow-xs'
                            : 'text-text-secondary hover:text-on-surface hover:bg-surface-subtle'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {subItem.icon && (
                            <Icon
                              name={subItem.icon}
                              className={`text-[16px] shrink-0 ${
                                isSubItemActive
                                  ? 'text-on-primary'
                                  : 'text-text-tertiary group-hover/sub:text-on-surface'
                              }`}
                            />
                          )}
                          <span className="truncate font-label-sm text-label-sm">
                            {subItem.label}
                          </span>
                        </div>

                        {subItem.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full font-caption text-[10px] font-bold ${
                              isSubItemActive
                                ? 'bg-on-primary/20 text-on-primary'
                                : subItem.badgeClass || 'bg-surface-container text-text-secondary'
                            }`}
                          >
                            {subItem.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer System Status Indicator — hidden while collapsed (POS mode) */}
      {!collapsed && (
        <div className="mt-auto p-3 border-t border-border-subtle hidden lg:block">
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-surface-subtle">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-caption text-[11px] text-text-secondary font-medium">
                VEMTAP Store Cloud
              </span>
            </div>
            <span className="font-caption text-[10px] font-bold text-badge-discount-text uppercase tracking-wider">
              Online
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
