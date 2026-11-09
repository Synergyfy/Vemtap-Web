import { Logo } from '../components/ui/Logo';
import { MobileAccountMenu, MobileLocationMenu, MobileNotificationBell } from '../components/BusinessHeaderMenus';

export function BusinessModeHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-margin flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center overflow-hidden shrink-0">
            {/* The mark image has built-in padding, so it fills the tile and is scaled up slightly. */}
            <Logo variant="mark-white" className="w-full h-full object-contain scale-125" />
          </div>
          <div className="flex flex-col">
            <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">
              Business Mode
            </span>
            <h1 className="font-heading-sm text-heading-sm text-on-surface leading-tight">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-space-xs">
          {/* Persistent location switcher — sits right by the notification bell. */}
          <MobileLocationMenu />
          <MobileNotificationBell />
          <MobileAccountMenu />
        </div>
      </div>
    </header>
  );
}
