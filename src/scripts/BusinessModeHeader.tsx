import { BusinessBranchSelect } from '../components/BusinessBranchSelect';
import { MobileAccountMenu, MobileNotificationBell } from '../components/BusinessHeaderMenus';

export function BusinessModeHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-margin flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-on-primary font-heading-sm text-heading-sm">
            V
          </div>
          <div className="flex flex-col">
            <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">
              Business Mode
            </span>
            <h1 className="font-heading-sm text-heading-sm text-on-surface leading-tight">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-space-xs">
          {/* Branch control — the location at the top header drives this page. */}
          <BusinessBranchSelect iconOnly align="right" />
          <MobileNotificationBell />
          <MobileAccountMenu />
        </div>
      </div>
    </header>
  );
}
