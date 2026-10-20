import { Icon } from '../components/ui/Icon';
import { MobileAccountMenu, MobileLocationMenu, MobileNotificationBell } from '../components/BusinessHeaderMenus';

export function BusinessHubHeader() {
  return (
    <header className="sticky top-0 z-40 bg-surface-canvas/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-margin flex items-center justify-between">
        <div className="flex items-center gap-space-xs min-w-0">
          <h1 className="font-heading-sm text-heading-sm text-text-primary truncate tracking-tight">Business Hub</h1>
          <Icon name="verified" filled className="text-[18px] text-primary-container shrink-0" />
        </div>
        <div className="flex items-center gap-space-xs">
          <button
            aria-label="Quick Switch Business"
            className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-text-primary hover:bg-surface-container-low transition-colors"
            type="button"
          >
            <Icon name="swap_horiz" className="text-[22px]" />
          </button>
          <MobileLocationMenu />
          <MobileNotificationBell />
          <MobileAccountMenu />
        </div>
      </div>
    </header>
  );
}
