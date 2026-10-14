import { useState, useEffect } from 'react';
import { Icon } from './ui/Icon';
import { Logo } from './ui/Logo';
import {
  BUSINESS_SIDEBAR_SECTIONS,
  resolveSidebarActive,
  type BusinessSidebarSection,
  type BusinessSidebarSubItem,
} from '../scripts/desktop/businessSidebarConfig';

interface BusinessMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  active?: string;
  onSelect: (key: string) => void;
  onSignOut?: () => void;
}

export function BusinessMobileDrawer({
  isOpen,
  onClose,
  active = 'overview',
  onSelect,
  onSignOut,
}: BusinessMobileDrawerProps) {
  const { sectionKey: activeSectionKey, itemKey: activeItemKey } = resolveSidebarActive(active);

  const activeSectionHasChildren = BUSINESS_SIDEBAR_SECTIONS.some(
    (s) => s.key === activeSectionKey && s.items && s.items.length > 0
  );

  const [openSectionKey, setOpenSectionKey] = useState<string | null>(() => {
    return activeSectionHasChildren ? activeSectionKey : null;
  });

  useEffect(() => {
    if (activeSectionHasChildren) {
      setOpenSectionKey(activeSectionKey);
    }
  }, [activeSectionKey, activeSectionHasChildren]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const toggleSection = (sectionKey: string, defaultKey: string) => {
    setOpenSectionKey((prev) => {
      const willOpen = prev !== sectionKey;
      if (willOpen && activeSectionKey !== sectionKey) {
        onSelect(defaultKey);
        onClose();
        return sectionKey;
      }
      return willOpen ? sectionKey : null;
    });
  };

  const handleParentClick = (section: BusinessSidebarSection) => {
    if (!section.items || section.items.length === 0) {
      onSelect(section.defaultKey);
      onClose();
      return;
    }
    toggleSection(section.key, section.defaultKey);
  };

  const handleSubItemClick = (subItem: BusinessSidebarSubItem) => {
    onSelect(subItem.key);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-4/5 max-w-[340px] bg-surface-canvas h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo variant="full" className="h-8 w-auto" />
            <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary leading-none">
              BUSINESS
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Branch Context Info */}
        <div className="px-4 py-2.5 bg-surface-subtle border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Icon name="store" className="text-primary text-[16px] shrink-0" />
            <span className="font-caption text-caption text-text-secondary truncate">
              Wuse II Branch, Abuja
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-badge-discount-text shrink-0 animate-pulse" />
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {BUSINESS_SIDEBAR_SECTIONS.map((section) => {
            const hasChildren = Boolean(section.items && section.items.length > 0);
            const isSectionActive = activeSectionKey === section.key;
            const isOpen = openSectionKey === section.key;

            return (
              <div key={section.key} className="flex flex-col">
                <button
                  type="button"
                  aria-expanded={hasChildren ? isOpen : undefined}
                  onClick={() => handleParentClick(section)}
                  className={`flex items-center justify-between w-full rounded-xl px-3.5 py-3 text-left transition-all ${
                    isSectionActive
                      ? 'bg-surface-tint-blue/80 text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-subtle'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      name={section.icon}
                      className={`text-[20px] shrink-0 ${
                        isSectionActive ? 'text-primary' : 'text-text-tertiary'
                      }`}
                    />
                    <span className="font-label-md text-label-md truncate">{section.label}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {section.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full font-caption text-[10px] font-bold ${
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
                          isOpen ? 'text-primary' : ''
                        }`}
                      />
                    )}
                  </div>
                </button>

                {hasChildren && isOpen && (
                  <div className="flex flex-col pl-4 mt-1 space-y-1 border-l-2 border-border-subtle ml-5">
                    {section.items!.map((subItem) => {
                      const isSubItemActive = activeItemKey === subItem.key;
                      return (
                        <button
                          key={subItem.key}
                          type="button"
                          onClick={() => handleSubItemClick(subItem)}
                          className={`flex items-center justify-between w-full rounded-lg px-3 py-2 text-left transition-colors ${
                            isSubItemActive
                              ? 'bg-primary text-on-primary font-semibold'
                              : 'text-text-secondary hover:text-on-surface hover:bg-surface-subtle'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {subItem.icon && (
                              <Icon
                                name={subItem.icon}
                                className={`text-[16px] shrink-0 ${
                                  isSubItemActive ? 'text-on-primary' : 'text-text-tertiary'
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
        </div>

        {/* Drawer Footer with Sign Out */}
        <div className="p-4 border-t border-border-subtle bg-surface-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              MD
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-label-sm text-label-sm font-semibold text-on-surface">Musa Danladi</span>
              <span className="font-caption text-[11px] text-text-tertiary">Store Manager</span>
            </div>
          </div>
          {onSignOut && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOut();
              }}
              title="Sign Out"
              className="p-2 text-text-tertiary hover:text-error transition-colors"
            >
              <Icon name="logout" className="text-[18px]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
