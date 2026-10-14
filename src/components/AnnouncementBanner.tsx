import { useEffect, useState } from 'react';
import { Icon } from './ui/Icon';
import {
  CUSTOMER_AUDIENCES,
  activeAnnouncements,
  type AnnouncementAudience,
  type AnnouncementDestination,
  type AnnouncementTone,
} from '../scripts/announcementsData';

/**
 * Compact rotating announcement / promotional banner.
 *
 * Renders directly below the "Hello, …" greeting on the customer dashboard
 * (mobile `DashboardScreen` and desktop `DesktopDashboardScreen`). The slides
 * themselves are admin content — `announcementsData` models the audience,
 * message, optional image, CTA, destination, schedule and publication status,
 * and applies the same rules the endpoint would before anything is shown.
 *
 * Behaviour:
 * - cross-fades between items every `intervalMs`, pausing on hover/focus and
 *   when the visitor asked for reduced motion;
 * - tapping a slide (or its CTA) hands the configured destination to
 *   `onNavigate`, so each screen maps it onto its own navigation;
 * - renders `null` when nothing is live, so the dashboard never shows an
 *   empty placeholder.
 */

export interface AnnouncementBannerProps {
  /** Opens the destination the admin configured for that slide. */
  onNavigate: (destination: AnnouncementDestination) => void;
  /** Audiences the current viewer belongs to. Defaults to the consumer set. */
  audiences?: readonly AnnouncementAudience[];
  /** Milliseconds each slide stays on screen. */
  intervalMs?: number;
  className?: string;
}

const TONE_STYLE: Record<AnnouncementTone, { label: string; tile: string; pill: string }> = {
  promo: {
    label: 'Promo',
    tile: 'bg-surface-tint-blue text-primary',
    pill: 'bg-surface-tint-blue text-primary',
  },
  info: {
    label: 'Update',
    tile: 'bg-secondary-container text-on-secondary-container',
    pill: 'bg-secondary-container text-on-secondary-container',
  },
  upgrade: {
    label: 'Upgrade',
    tile: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    pill: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  },
  alert: {
    label: 'Alert',
    tile: 'bg-error text-on-error',
    pill: 'bg-error text-on-error',
  },
};

export function AnnouncementBanner({
  onNavigate,
  audiences = CUSTOMER_AUDIENCES,
  intervalMs = 5000,
  className = '',
}: AnnouncementBannerProps) {
  const items = activeAnnouncements(new Date()).filter((item) => audiences.includes(item.audience));

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  // A slide can disappear while the tab is open (its window closes) — clamp
  // instead of landing on an empty frame.
  const active = items.length === 0 ? 0 : index % items.length;

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || items.length < 2) return;
    const timerId = window.setInterval(
      () => setIndex((current) => (current + 1) % items.length),
      intervalMs,
    );
    return () => window.clearInterval(timerId);
  }, [paused, reducedMotion, items.length, intervalMs]);

  // Nothing published and live right now — no placeholder, no empty shell.
  if (items.length === 0) return null;

  return (
    <section
      className={className}
      aria-label="Announcements"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Compact on phones; a noticeably roomier card from the `lg` breakpoint
          up, which is where the desktop dashboards render. */}
      <div className="relative h-[76px] lg:h-[104px] w-full overflow-hidden rounded-xl bg-surface-canvas shadow-sm ring-1 ring-primary-container/40">
        {items.map((item, position) => {
          const isActive = position === active;
          const tone = TONE_STYLE[item.tone];
          return (
            <button
              key={item.id}
              type="button"
              tabIndex={isActive ? 0 : -1}
              aria-hidden={!isActive}
              onClick={() => onNavigate(item.destination)}
              className={`absolute inset-0 flex items-center gap-space-sm px-space-sm lg:px-space-md text-left transition-opacity duration-500 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-container/60 ${
                isActive ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'
              }`}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="w-11 h-11 lg:w-14 lg:h-14 rounded-lg object-cover shrink-0"
                />
              ) : (
                <span
                  className={`w-11 h-11 lg:w-14 lg:h-14 rounded-lg flex items-center justify-center shrink-0 ${tone.tile}`}
                >
                  <Icon name={item.icon} className="text-[22px] lg:text-[26px]" />
                </span>
              )}

              <span className="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
                <span className="flex items-center gap-space-2xs min-w-0">
                  <span
                    className={`shrink-0 px-1.5 py-0.5 rounded font-caption text-[10px] lg:text-[11px] font-bold uppercase tracking-wide ${tone.pill}`}
                  >
                    {tone.label}
                  </span>
                  <span className="font-label-md text-label-md lg:text-heading-sm text-on-surface font-semibold truncate">
                    {item.title}
                  </span>
                </span>
                <span className="font-caption text-caption lg:font-body-md lg:text-body-md text-text-secondary truncate">
                  {item.message}
                </span>
              </span>

              <span className="shrink-0 flex items-center gap-1 lg:gap-1.5 px-2.5 py-1.5 lg:px-4 lg:py-2 rounded-lg bg-primary-container text-on-primary-container font-label-sm text-label-sm lg:text-label-md font-semibold">
                <span className="max-w-[92px] lg:max-w-[190px] truncate">{item.cta}</span>
                <Icon name="arrow_forward" className="text-[14px] lg:text-[16px]" />
              </span>
            </button>
          );
        })}
      </div>

      {items.length > 1 && (
        <div className="mt-space-2xs lg:mt-space-xs flex items-center justify-center gap-1.5 lg:gap-2">
          {items.map((item, position) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Announcement ${position + 1} of ${items.length}: ${item.title}`}
              aria-current={position === active}
              onClick={() => setIndex(position)}
              className={`h-1.5 lg:h-2 rounded-full transition-all ${
                position === active
                  ? 'w-4 lg:w-5 bg-primary-container'
                  : 'w-1.5 lg:w-2 bg-surface-container-highest hover:bg-outline'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
