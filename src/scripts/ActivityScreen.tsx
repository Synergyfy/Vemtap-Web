import { useMemo, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { useActivityFeed, type ActivityRow } from '../hooks/useActivityFeed';
import { useDealLikes } from '../hooks/useDealLikes';
import { NO_IMAGE } from '../utils/homeOffer';
import { UserAvatar } from '../components/ui/UserAvatar';

interface ActivityScreenProps {
  onBack: () => void;
  onOpenOrders: () => void;
  /** Opens a live deal's page. */
  onOpenDeal: (deal: { id: string; title?: string; business?: string; image?: string }) => void;
  onOpenBusiness: (business: { code: string; name?: string }) => void;
}

type ActivityTab = 'all' | 'recent' | 'visits' | 'reviews';

const TABS: Array<{ key: ActivityTab; label: string; icon: string }> = [
  { key: 'all', label: 'All Activity', icon: 'dynamic_feed' },
  { key: 'recent', label: 'Recently Viewed', icon: 'history' },
  { key: 'visits', label: 'Visits & Claims', icon: 'receipt_long' },
  { key: 'reviews', label: 'My Reviews', icon: 'rate_review' },
];

const naira = (value: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);

export function ActivityScreen({
  onBack,
  onOpenOrders,
  onOpenDeal,
  onOpenBusiness,
}: ActivityScreenProps) {
  const [tab, setTab] = useState<ActivityTab>('all');
  const [confirmClear, setConfirmClear] = useState(false);
  const activity = useActivityFeed();
  const recentIds = useMemo(() => activity.recent.map((card) => card.id), [activity.recent]);
  const { likes, toggleLike } = useDealLikes(recentIds);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2400);
  };

  const toggleFavorite = (id: string, title: string) => {
    toggleLike(id).then(
      (state) => showToast(state.liked ? `Liked "${title}"` : `Removed your like from "${title}"`),
      () => showToast('That didn’t save. Please try again.'),
    );
  };

  const openRow = (row: ActivityRow) => {
    if (row.kind === 'order' || row.kind === 'booking') onOpenOrders();
    else if (row.kind === 'claim' || row.kind === 'review') onOpenDeal({ id: row.refId, title: row.detail, business: row.merchant });
    else if (row.businessCode) onOpenBusiness({ code: row.businessCode, name: row.merchant });
  };
  const rowAction = (row: ActivityRow) =>
    row.kind === 'order' ? 'View Receipt' : row.kind === 'booking' ? 'View Booking' : row.kind === 'claim' ? 'View Deal' : row.businessCode ? 'View Business' : null;

  const showVisits = (tab === 'all' || tab === 'visits');
  const showRecent = (tab === 'all' || tab === 'recent');
  const showReviews = (tab === 'all' || tab === 'reviews');

  const tabClass = (key: ActivityTab) =>
    key === tab
      ? 'px-4 h-9 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0'
      : 'px-4 h-9 rounded-full bg-surface-container-lowest text-text-secondary font-label-sm text-label-sm hover:text-on-surface flex items-center gap-1.5 active:scale-95 transition-all shrink-0';

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm">
        <div className="h-16 px-space-xs flex items-center justify-between">
          <div className="flex items-center gap-space-xs flex-1 min-w-0">
            <button
              aria-label="Go back"
              type="button"
              onClick={onBack}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate pr-space-xs">User Activity</h1>
          </div>
          <div className="flex items-center gap-space-xs pr-space-xs shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              <UserAvatar textClassName="text-on-primary text-[13px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col w-full px-margin pb-space-2xl pt-space-md gap-space-lg">
        <div className="flex items-center justify-between pt-space-xs gap-space-xs">
          <div className="flex items-center gap-space-2xs text-text-secondary min-w-0">
            <Icon name="verified_user" className="text-[18px] text-primary shrink-0" />
            <span className="font-label-sm text-label-sm text-text-secondary truncate">Your Verified Activity</span>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button
              type="button"
              onClick={activity.togglePeriod}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low text-text-secondary hover:bg-surface-container hover:text-on-surface transition-all active:scale-95"
            >
              <Icon name="calendar_month" className="text-[16px] text-primary" />
              <span className="font-label-sm text-label-sm font-semibold">{activity.periodLabel}</span>
              <Icon name="expand_more" className="text-[14px]" />
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-low p-space-md shadow-sm space-y-space-sm relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-primary/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between gap-space-xs">
            <span className="font-label-sm text-label-sm text-text-secondary tracking-wide uppercase font-semibold">
              Your Local Footprint
            </span>
          </div>
          <div className="grid grid-cols-3 gap-space-xs pt-space-2xs">
            {activity.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col p-space-xs rounded-lg bg-surface-container-lowest shadow-sm">
                <div className="flex items-center gap-1 text-primary mb-1">
                  <Icon name={stat.icon} className="text-[16px]" />
                </div>
                <span className="font-heading-sm text-heading-sm text-text-primary tracking-tight font-bold">{stat.value}</span>
                <span className="font-caption text-caption text-text-tertiary mt-0.5">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-space-xs min-w-max" role="tablist">
            {TABS.map((item) => (
              <button key={item.key} type="button" role="tab" onClick={() => setTab(item.key)} className={tabClass(item.key)}>
                <Icon name={item.icon} className="text-[16px]" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-space-xl">
            {showVisits && (
              <section className="space-y-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-2xs">
                    <Icon name="store" className="text-[20px] text-primary" />
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">
                      Recent Store Visits &amp; Redemptions
                    </h2>
                  </div>
                  <span className="font-caption text-caption text-text-tertiary">{activity.visits.length} {activity.periodLabel === 'All Time' ? 'in total' : 'this period'}</span>
                </div>

                <div className="space-y-space-sm">
                  {activity.visits.length === 0 && (
                    <p className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm text-center font-caption text-caption text-text-secondary">
                      {activity.loading ? (
                        'Loading your activity…'
                      ) : activity.failed ? (
                        <button type="button" onClick={activity.retry} className="text-primary font-semibold hover:underline">
                          Your activity couldn’t be loaded. Tap to retry.
                        </button>
                      ) : (
                        'No visits or claims yet.'
                      )}
                    </p>
                  )}
                  {activity.visits.map((row) => (
                    <article key={row.id} className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm space-y-space-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-space-sm">
                        <div className="flex items-start gap-space-sm min-w-0">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                            <img className="w-full h-full object-cover" src={row.image} alt={row.merchant} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-label-md text-label-md text-text-primary font-bold truncate">{row.merchant}</h3>
                            <p className="font-label-sm text-label-sm text-primary font-semibold truncate mt-0.5">
                              {row.label} • {row.detail}
                            </p>
                            <div className="flex items-center gap-1.5 text-text-tertiary font-caption text-caption mt-1">
                              <span>{row.date}</span>
                              {row.location && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5 truncate">
                                    <Icon name="location_on" className="text-[12px]" /> {row.location}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {row.value && (
                          <span className="px-2 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shrink-0">
                            {row.value}
                          </span>
                        )}
                      </div>
                      {rowAction(row) && (
                        <div className="pt-space-xs flex items-center justify-end gap-space-xs">
                          <button type="button" onClick={() => openRow(row)} className="px-3.5 py-1.5 rounded-lg bg-surface-container-low text-text-secondary font-label-sm text-label-sm font-medium hover:bg-surface-container hover:text-on-surface active:scale-95 transition-all flex items-center gap-1">
                            <Icon name="receipt" className="text-[16px]" />
                            <span>{rowAction(row)}</span>
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {showRecent && (
              <section className="space-y-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-2xs">
                    <Icon name="visibility" className="text-[20px] text-primary" />
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">
                      Recently Viewed Deals &amp; Products
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      activity.clearRecent();
                      showToast('Recently viewed cleared');
                    }}
                    className="font-label-sm text-label-sm text-primary font-semibold hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex gap-space-sm overflow-x-auto pb-space-xs -mx-margin px-margin no-scrollbar">
                  {activity.recent.length === 0 && (
                    <p className="w-full p-space-md rounded-xl bg-surface-container-lowest shadow-sm text-center font-caption text-caption text-text-secondary">
                      Deals you open on this device will appear here.
                    </p>
                  )}
                  {activity.recent.map((card) => (
                    <div
                      key={card.id}
                      className="w-60 shrink-0 rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all active:scale-[0.99]"
                    >
                      <div className="relative h-28 w-full bg-surface-container">
                        <img className="w-full h-full object-cover" src={card.image || NO_IMAGE}
                          alt={card.title} />
                        {card.discountPercent > 0 && (
<span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-sm">
{card.discountPercent}% OFF
</span>
)}
                        <button
                          aria-label={likes[card.id]?.liked ? `Unlike ${card.title}` : `Like ${card.title}`}
                          type="button"
                          onClick={() => toggleFavorite(card.id, card.title)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-surface-canvas/90 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform"
                        >
                          <Icon
                            name="favorite"
                            className={`text-[16px] ${Boolean(likes[card.id]?.liked) ? 'text-primary' : 'text-text-tertiary'}`}
                            filled={Boolean(likes[card.id]?.liked)}
                          />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenDeal({ id: card.id, title: card.title, business: card.merchant, image: card.image })}
                        className="p-space-xs flex-1 flex flex-col justify-between text-left"
                      >
                        <div>
                          <p className="font-caption text-caption text-text-tertiary truncate">{card.merchant}</p>
                          <h3 className="font-label-md text-label-md text-text-primary font-bold line-clamp-1 mt-0.5">
                            {card.title}
                          </h3>
                        </div>
                        <div className="mt-2 flex items-baseline gap-1.5">
                          <span className="font-label-md text-label-md text-primary font-bold">{naira(card.price)}</span>
                          {card.oldPrice > card.price && <span className="font-caption text-caption text-text-tertiary line-through">{naira(card.oldPrice)}</span>}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {showReviews && (
              <section className="space-y-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-2xs">
                    <Icon name="reviews" className="text-[20px] text-primary" />
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">My Reviews &amp; Ratings</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab('reviews')}
                    className="font-label-sm text-label-sm text-primary font-semibold hover:underline"
                  >
                    See All ({activity.reviews.length})
                  </button>
                </div>
                {activity.reviews.length === 0 && (
                  <p className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm text-center font-caption text-caption text-text-secondary">
                    {activity.loading ? 'Loading your reviews…' : 'You haven’t written any reviews yet.'}
                  </p>
                )}
                {activity.reviews.map((row) => (
                  <article key={row.id} className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm space-y-space-xs">
                    <div className="flex items-start justify-between gap-space-xs">
                      <div className="min-w-0">
                        <h3 className="font-label-md text-label-md font-bold text-text-primary truncate">{row.merchant}</h3>
                        <p className="font-caption text-caption text-text-tertiary">
                          {row.detail} • Reviewed on {row.date}
                        </p>
                      </div>
                      {row.rating !== null && (
                        <div className="flex items-center gap-0.5 text-tertiary-container bg-surface-container-low px-2 py-0.5 rounded-full shrink-0">
                          <Icon name="star" className="text-[15px]" filled />
                          <span className="font-label-sm text-label-sm font-bold">{row.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    {row.body && <p className="font-body-md text-body-md text-text-secondary leading-relaxed">“{row.body}”</p>}
                    {row.reply && (
                      <div className="mt-space-xs p-space-xs rounded-lg bg-surface-container-low flex items-start gap-space-xs">
                        <Icon name="reply" className="text-primary text-[18px] shrink-0 mt-0.5" />
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-label-sm text-label-sm font-bold text-text-primary">{row.merchant}</span>
                            <span className="font-caption text-caption text-text-tertiary">Merchant Reply</span>
                          </div>
                          <p className="font-caption text-caption text-text-secondary">“{row.reply}”</p>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </section>
            )}
          </div>

        <div className="pt-space-md pb-space-lg flex flex-col items-center justify-center space-y-space-xs">
          <div className="flex items-center gap-space-md">
            <button
              type="button"
              onClick={() => {
                if (!activity.canExport) {
                  showToast('No activity to export yet');
                  return;
                }
                activity.exportCsv();
                showToast('Activity CSV export downloaded');
              }}
              className="flex items-center gap-1 font-label-sm text-label-sm text-text-secondary hover:text-primary transition-colors active:scale-95"
            >
              <Icon name="download" className="text-[16px]" />
              <span>Export Activity (CSV)</span>
            </button>
            <span className="text-outline-variant">•</span>
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1 font-label-sm text-label-sm text-error hover:opacity-80 transition-colors active:scale-95"
            >
              <Icon name="delete_outline" className="text-[16px]" />
              <span>Clear Recently Viewed</span>
            </button>
          </div>
          <p className="font-caption text-caption text-text-tertiary text-center max-w-xs">
            Your visits, claims and reviews are saved to your VEMTAP account.
          </p>
        </div>
      </main>

      {confirmClear && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center"
          onClick={(event) => {
            if (event.target === event.currentTarget) setConfirmClear(false);
          }}
        >
          <div className="w-full max-w-lg bg-surface rounded-t-2xl p-space-lg shadow-2xl flex flex-col space-y-space-md pb-safe">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center">
                  <Icon name="delete_outline" className="text-[18px]" />
                </div>
                <h3 className="font-heading-sm text-heading-sm text-on-surface">Clear recently viewed?</h3>
              </div>
              <button
                aria-label="Close"
                type="button"
                onClick={() => setConfirmClear(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
            <p className="font-body-md text-body-md text-text-secondary">
              This removes your recently viewed deals from this device. Your visits, claims, reviews and savings stay on your account.
            </p>
            <div className="flex gap-space-xs">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="flex-1 h-11 rounded-xl bg-surface-container-low text-text-secondary font-button-secondary text-button-secondary active:bg-surface-container transition-colors"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmClear(false);
activity.clearRecent();
                  showToast('Recently viewed cleared');
                }}
                className="flex-1 h-11 rounded-xl bg-error text-on-error font-button-secondary text-button-secondary font-semibold active:scale-[0.98] transition-transform"
              >
                Clear Recently Viewed
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-2.5 rounded-full shadow-lg font-label-md text-label-md flex items-center gap-2 transition-all duration-300">
          <Icon name="check_circle" className="text-[18px] text-badge-discount-text" />
          <span>{toast}</span>
        </div>
      )}
    </AppScreen>
  );
}
