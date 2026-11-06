import { Icon } from '../components/ui/Icon';
import { MobileAccountMenu, MobileLocationMenu, MobileNotificationBell } from '../components/BusinessHeaderMenus';

export function BusinessHubHeader() {
  return (
    <header className="sticky top-0 z-40 bg-surface-canvas/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-14 px-margin flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <h1 className="font-label-md text-label-md font-bold text-text-primary truncate tracking-tight">Business Hub</h1>
          <Icon name="verified" filled className="text-[16px] text-primary shrink-0" />
        </div>
        <div className="flex items-center gap-1">
          <button
            aria-label="Quick Switch Business"
            className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:text-text-primary hover:bg-surface-container-low transition-colors"
            type="button"
          >
            <Icon name="swap_horiz" className="text-[19px]" />
          </button>
          <MobileLocationMenu />
          <MobileNotificationBell />
          <MobileAccountMenu />
        </div>
      </div>
    </header>
  );
}
