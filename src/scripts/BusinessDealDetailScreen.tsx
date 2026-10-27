import { AppScreen } from '../components/ui/AppScreen';
import { useState } from 'react';
import { hasApiConfig } from '../services/api/client';
import { useOfferGroup, useOfferGroupMutations, useOffers } from '../hooks/business/useOffers';
import { useCatalogueItems } from '../hooks/business/useCatalogueItems';
import { apiErrorMessage } from '../services/errorMessages';
import type { BusinessOffer, DealGroupStats, OfferGroupBranchPricing } from '../services/offersService';
import type { CatalogueItem } from '../services/catalogueItemsService';
import { dealBadgeLabel, isOfferPaused, offerClaimStats, pricingTypeLabel, redemptionWindowLabel } from './catalogueLive';
import { Icon } from '../components/ui/Icon';

interface BusinessDealDetailScreenProps {
  /** Live: the deal group to show; demo shows the sample deal. */
  dealGroupId?: string | null;
  onBack: () => void;
  onBoost: () => void;
  onEditAssignment: () => void;
  /** Opens the deal studio so the whole deal can be edited. */
  onEditDeal?: () => void;
}

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA1_Z0LwG2JcNNG3mNfDG_T1MIlMoIFbHIhdxxbnnyI-PuSix_NRMDEwlU5rLq-mBlfWYXU5wHpbbsf74yYS_P98kOJVchxXXydUr1CF_smRk0LVgK5jqGX6Viv2lUD-0Od8WTAIWUTueL3ptTJsRMvohWrqzMPKkw4K-ptvDBtCy1i9Qqb16pUgfUdX0wbDH-36nLUw9ctdKYEudfKPAb5hLXEAWmj_aw6Fkc1e3Oj79qrMQYeVgh5rw';
const HERO_ALT =
  'Gourmet prime Angus ribeye steak sizzling on a rustic dark slate board with rosemary sprigs, sea salt crystals, and a cold iced passionfruit cocktail garnished with mint in an upscale bistro setting with moody cinematic warm lighting.';
const RIBEYE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBWkXAPtK1q1vO4NHMZVNriHUzoV2GLucpM3GshzR3Vf-uh7fye7AabcbOBPfpUMpIQAmsX8F3vHGeoOYtaXss8aCUHw__XIX2JbEBAaKoZ1Gn32EVdEwS6ebqICoUXJC7oGOc0T3Spb_ezioWqn1G9iIq_doyDKNDcVHnOQb1-e1mawA8tM6QPdQ8bG9h_Yw94fiUPe476uiGcKjDqOvhBlzOsguXC5lMlGvSrESEJDNfChL2YITwv0';
const MOJITO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC30TOLTYVASe7u5wL3wVhAqPwIQ3byMvBrZ8Ys7pQAzMoqHjIwmv7rMqALEG_pNTocrM4bXwsXsJzUa6yxkqyhbHUffOpsQ5YtKkZQtmb1mSUmbawwRywAK6kDfEK4G127mLEBkoYw1C5aj-JtY6Z93FwFxEty4elS4_ny678PDHXXHF3sffNv5FjgxuTAQQf45miBGY9Ezgtw08Nfx76YPy6HcvHi4I2Skf-EnX_5be3dfkFMrp6hwQ';

const BRANCH_AVAILABILITY = [
    { name: 'Wuse II Flagship', sub: 'Adetokunbo Ademola Crescent', price: '₦9,600', available: true },
    { name: 'Maitama Heights', sub: 'Location Adjusted Surcharge', price: '₦10,200', available: true },
    { name: 'Garki Express Hub', sub: 'Takeout only branch · Excluded', price: 'Unavailable', available: false },
];

/** Every figure on the page, so live and demo render through the same markup. */
interface DealView {
  statusLabel: string;
  discountBadge: string;
  categoryLine: string;
  name: string;
  heroImg: string;
  heroAlt: string;
  boostHint: string;
  pricingType: string;
  originalPrice: string;
  dealPrice: string;
  savings: string;
  platformFee: string;
  dateRange: string;
  daysLeft: string;
  rate: number;
  redeemed: number | string;
  unredeemed: number | string;
  claims: number | string;
  claimsToday: string;
  revenue: string;
  window: string;
  bundleCount: string;
  bundled: { img: string; name: string; sub: string }[];
  capLabel: string;
  capValue: string;
  branchCount: string;
  branches: { name: string; sub: string; price: string; available: boolean }[];
  description: string;
  terms: string;
  claimSteps: string[];
  boostCta: string;
}

const DEMO_VIEW: DealView = {
  statusLabel: 'Active · Live on Feeds',
  discountBadge: '20% OFF',
  categoryLine: 'Urban Grill & Bistro · Food & Dining',
  name: 'Weekend Prime Lunch Combo',
  heroImg: HERO_IMG,
  heroAlt: HERO_ALT,
  boostHint: 'Up to 5x more claims in Wuse',
  pricingType: 'Fixed Retail',
  originalPrice: '₦12,000',
  dealPrice: '₦9,600',
  savings: '20% (-₦2,400)',
  platformFee: '0% (Direct)',
  dateRange: 'Oct 12 – Oct 20, 2024 · Ends in 3 days',
  daysLeft: '3 Days Left',
  rate: 69.5,
  redeemed: 89,
  unredeemed: 39,
  claims: 128,
  claimsToday: '+14 today',
  revenue: '₦854,400',
  window: 'Monday – Sunday · 12:00 PM – 5:00 PM',
  bundleCount: '2 Items Bundled',
  bundled: [
    { img: RIBEYE_IMG, name: 'Woodfire Ribeye 250g', sub: 'Main · Kitchen Grill Section' },
    { img: MOJITO_IMG, name: 'Passionfruit House Mojito', sub: 'Beverage · Craft Bar Stand' },
  ],
  capLabel: 'Daily Kitchen Reservation',
  capValue: '45 covers/day',
  branchCount: '2 of 3 branches',
  branches: BRANCH_AVAILABILITY,
  description:
    'Indulge in our signature 250g woodfire grilled prime Angus ribeye paired with freshly muddled house passionfruit mojito. Exclusive VEMTAP weekend diners perk.',
  terms:
    'Valid for dine-in only. One voucher per table/visit. Not combinable with happy hour promotions. Show active QR code to server before requesting bill.',
  claimSteps: [
    'Present digital voucher QR on arrival.',
    'Staff verifies on Till 01.',
    'Discount automatically deducted from POS final check.',
  ],
  boostCta: 'Boost Deal (Reach +5,000 Diners)',
};

const LIVE_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23e9eef9'/></svg>";

const dayMonth = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

/** The live deal mapped onto the page's figures; no data → "—". */
function liveDealView(
  offer: BusinessOffer,
  stats: DealGroupStats | undefined,
  pricing: OfferGroupBranchPricing | undefined,
  items: CatalogueItem[],
): DealView {
  const claimStats = offerClaimStats(offer);
  const claims = stats?.claims ?? claimStats.claims;
  const redeemed = stats?.redeemed ?? claimStats.redeemed;
  const rate = Math.round(Number(stats?.redemptionRate ?? claimStats.rate) || 0);
  const was = Number(offer.originalPrice ?? 0);
  const now = Number(offer.calculatedPrice ?? offer.fixedPrice ?? 0);
  const today = stats?.series?.[stats.series.length - 1]?.claims;
  const from = dayMonth(offer.startDate ?? offer.createdAt);
  const to = dayMonth(offer.endDate);
  const branchRows = (pricing?.branches ?? []).map((row) => ({
    name: row.branchName ?? 'Branch',
    sub: row.isActive ? `${row.claimedCount} claims · ${row.redeemedCount} redeemed` : 'Paused at this branch',
    price: row.isActive ? `₦${Number(row.calculatedPrice).toLocaleString('en-US')}` : 'Unavailable',
    available: row.isActive,
  }));
  const bundled = (offer.itemIds ?? []).map((id) => {
    const item = items.find((entry) => entry.id === id);
    return {
      img: item?.mainImage || LIVE_IMAGE_PLACEHOLDER,
      name: item?.name ?? 'Catalogue item',
      sub: item?.category?.name ?? (item?.itemType === 'service' ? 'Service' : 'Product'),
    };
  });
  const paused = isOfferPaused(offer);
  return {
    statusLabel: paused ? 'Paused · Hidden from feeds' : 'Active · Live on Feeds',
    discountBadge: dealBadgeLabel(offer),
    categoryLine: [offer.branchName, offer.offerType].filter(Boolean).join(' · ') || 'Deal',
    name: offer.name,
    heroImg: offer.mainImage || LIVE_IMAGE_PLACEHOLDER,
    heroAlt: offer.name,
    boostHint: 'Reach more nearby customers',
    pricingType: pricingTypeLabel(offer),
    originalPrice: was ? `₦${was.toLocaleString('en-US')}` : '—',
    dealPrice: now ? `₦${now.toLocaleString('en-US')}` : '—',
    savings: was > now && now ? `${Math.round(((was - now) / was) * 100)}% (-₦${(was - now).toLocaleString('en-US')})` : '—',
    platformFee: '—',
    dateRange: [from, to ? `– ${to}` : '· No end date'].filter(Boolean).join(' '),
    daysLeft: stats?.daysLeft != null ? `${stats.daysLeft} ${stats.daysLeft === 1 ? 'Day' : 'Days'} Left` : 'Ongoing',
    rate,
    redeemed,
    unredeemed: stats?.activeUnclaimed ?? Math.max(claims - redeemed, 0),
    claims,
    claimsToday: today != null ? `+${today} today` : '—',
    revenue: stats?.revenue != null ? `₦${Number(stats.revenue).toLocaleString('en-US')}` : '—',
    window: redemptionWindowLabel(offer),
    bundleCount: `${bundled.length} ${bundled.length === 1 ? 'Item' : 'Items'} Bundled`,
    bundled,
    capLabel: 'Voucher Cap',
    capValue: offer.quantity ? `${stats?.remaining ?? offer.quantity} of ${offer.quantity} left` : 'No cap',
    branchCount: `${branchRows.filter((row) => row.available).length} of ${branchRows.length} branches`,
    branches: branchRows,
    description: offer.description || '—',
    terms: offer.terms?.length ? offer.terms.join(' ') : '—',
    claimSteps: offer.claimSteps?.length ? offer.claimSteps : ['Show the voucher QR at the counter.'],
    boostCta: 'Boost Deal',
  };
}

export function BusinessDealDetailScreen({
  dealGroupId,
  onBack,
  onBoost,
  onEditAssignment,
  onEditDeal,
}: BusinessDealDetailScreenProps) {
  // Live: the deal's real stats, branches and copy; demo keeps the sample deal.
  const live = hasApiConfig() && Boolean(dealGroupId);
  const offersQuery = useOffers();
  const group = useOfferGroup(live ? dealGroupId : null);
  const groupMutations = useOfferGroupMutations(live ? dealGroupId : null);
  const itemsQuery = useCatalogueItems();
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  };
  const offer = (offersQuery.data ?? []).find((entry) => (entry.dealGroupId ?? entry.id) === dealGroupId);
  const stats = group.stats.data;
  const pricing = group.pricing.data;
  const view = live && offer ? liveDealView(offer, stats, pricing, itemsQuery.data ?? []) : DEMO_VIEW;
  const paused = live && offer ? isOfferPaused(offer) : false;
  const setStatus = (status: 'active' | 'inactive', done: string) =>
    groupMutations.setStatus.mutate(status, {
      onSuccess: () => showToast(done),
      onError: (error) => showToast(apiErrorMessage(error, 'Could not update this deal.')),
    });
  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-space-xs flex items-center justify-between gap-space-2xs">
          <button
            aria-label="Go back"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface hover:text-primary"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[24px]" />
          </button>
          <h1 className="font-heading-sm text-heading-sm text-on-surface font-semibold truncate flex-1 text-center">
            Deal Details
          </h1>
          <div className="flex items-center gap-space-2xs shrink-0">
            <button
              aria-label="More actions"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              type="button"
            >
              <Icon name="more_vert" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full flex-1 px-margin pt-space-md pb-40 space-y-space-md">
        {/* Hero */}
        <div className="relative w-full rounded-xl overflow-hidden shadow-sm bg-surface-container-low">
          <div className="w-full h-52 relative flex flex-col justify-between p-space-md">
            <img alt={view.heroAlt} className="absolute inset-0 w-full h-full object-cover" src={view.heroImg} />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/40 to-transparent" />
            <div className="relative z-10 flex items-center justify-between w-full">
              <span className="inline-flex items-center gap-space-2xs px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm shadow-sm">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                {view.statusLabel}
              </span>
              <span className="inline-flex items-center px-space-xs py-1 rounded-full bg-surface-canvas/90 text-primary font-label-sm text-label-sm shadow-sm backdrop-blur-sm">
                {view.discountBadge}
              </span>
            </div>
            <div className="relative z-10 space-y-space-2xs">
              <p className="font-label-sm text-label-sm text-surface-container-highest tracking-wide uppercase">
                {view.categoryLine}
              </p>
              <h2 className="font-heading-md text-heading-md text-surface-canvas leading-tight">
                {view.name}
              </h2>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col w-full space-y-space-xs">
          <button
            className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-between px-space-md shadow-md active:scale-[0.99] transition-transform"
            type="button"
            onClick={onBoost}
          >
            <div className="flex items-center gap-space-xs">
              <Icon name="rocket_launch" className="text-[20px]" />
              <span>Boost Deal</span>
            </div>
            <span className="font-caption text-caption bg-surface-canvas/20 px-space-xs py-0.5 rounded-full text-on-primary truncate max-w-[170px]">
              {view.boostHint}
            </span>
          </button>
          <div className="grid grid-cols-3 gap-space-xs">
            <button
              className="h-11 rounded-lg bg-surface-container-high text-on-surface font-button-secondary text-button-secondary flex items-center justify-center gap-1 active:bg-surface-variant transition-colors"
              type="button"
              onClick={live ? () => setStatus(paused ? 'active' : 'inactive', paused ? 'Deal resumed.' : 'Deal paused.') : undefined}
            >
              <Icon name={paused ? 'play_circle' : 'pause_circle'} className="text-[18px]" />
              <span>{paused ? 'Resume' : 'Pause'}</span>
            </button>
            <button
              className="h-11 rounded-lg bg-surface-container-high text-on-surface font-button-secondary text-button-secondary flex items-center justify-center gap-1 active:bg-surface-variant transition-colors"
              type="button"
              onClick={onEditDeal}
            >
              <Icon name="edit" className="text-[18px]" />
              <span>Edit</span>
            </button>
            <button
              className="h-11 rounded-lg bg-error-container text-on-error-container font-button-secondary text-button-secondary flex items-center justify-center gap-1 active:opacity-90 transition-opacity"
              type="button"
              onClick={live ? () => setStatus('inactive', 'Deal ended. Existing claims are kept.') : undefined}
            >
              <Icon name="cancel" className="text-[18px]" />
              <span>End</span>
            </button>
          </div>
        </div>

        {/* Pricing & Settlement */}
        <section className="bg-surface-canvas rounded-xl p-space-md shadow-sm space-y-space-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-space-2xs">
              <Icon name="payments" className="text-primary text-[20px]" />
              Pricing & Settlement
            </h3>
            <span className="font-caption text-caption px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-medium">
              {view.pricingType}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-space-xs pt-space-2xs">
            <div className="p-space-xs rounded-lg bg-surface-subtle flex flex-col justify-between">
              <span className="font-caption text-caption text-text-secondary">Original Price</span>
              <span className="font-heading-sm text-heading-sm text-text-secondary line-through mt-0.5">{view.originalPrice}</span>
            </div>
            <div className="p-space-xs rounded-lg bg-surface-tint-blue flex flex-col justify-between">
              <span className="font-caption text-caption text-primary">Deal Price</span>
              <span className="font-heading-sm text-heading-sm text-primary font-bold mt-0.5">{view.dealPrice}</span>
            </div>
            <div className="p-space-xs rounded-lg bg-badge-discount-bg flex flex-col justify-between">
              <span className="font-caption text-caption text-badge-discount-text">Customer Savings</span>
              <span className="font-heading-sm text-heading-sm text-badge-discount-text font-semibold mt-0.5">
                {view.savings}
              </span>
            </div>
            <div className="p-space-xs rounded-lg bg-surface-subtle flex flex-col justify-between">
              <span className="font-caption text-caption text-text-secondary">Platform Fee</span>
              <span className="font-heading-sm text-heading-sm text-text-primary font-semibold mt-0.5">{view.platformFee}</span>
            </div>
          </div>
          <p className="font-caption text-caption text-text-tertiary flex items-center gap-1">
            <Icon name="verified" className="text-[14px]" />
            Settlement deposited directly to merchant account upon POS redemption.
          </p>
        </section>

        {/* Redemption & Velocity */}
        <section className="bg-surface-canvas rounded-xl p-space-md shadow-sm space-y-space-md">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <h3 className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-space-2xs">
                <Icon name="analytics" className="text-primary text-[20px]" />
                Redemption & Velocity
              </h3>
              <span className="font-caption text-caption text-text-secondary">{view.dateRange}</span>
            </div>
            <span className="font-label-sm text-label-sm px-space-xs py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-semibold shrink-0">
              {view.daysLeft}
            </span>
          </div>
          <div className="p-space-sm rounded-lg bg-surface-container-low space-y-space-xs">
            <div className="flex items-center justify-between font-label-md text-label-md">
              <span className="text-text-secondary">Redemption Rate</span>
              <span className="text-primary font-semibold">{view.rate}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-surface-variant overflow-hidden flex">
              <div className="h-full bg-primary-container" style={{ width: `${view.rate}%` }} />
              <div className="h-full bg-secondary-fixed-dim" style={{ width: `${100 - view.rate}%` }} />
            </div>
            <div className="flex items-center justify-between font-caption text-caption text-text-secondary">
              <span>{view.redeemed} Redeemed at POS</span>
              <span>{view.unredeemed} Active / Unclaimed</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-space-xs">
            <div className="p-space-sm rounded-lg bg-surface-subtle">
              <span className="font-caption text-caption text-text-secondary block">Total Claimed</span>
              <span className="font-heading-md text-heading-md text-text-primary mt-1 block">{view.claims}</span>
              <span className="font-caption text-caption text-badge-discount-text flex items-center gap-0.5 mt-0.5">
                <Icon name="trending_up" className="text-[13px]" /> {view.claimsToday}
              </span>
            </div>
            <div className="p-space-sm rounded-lg bg-surface-subtle">
              <span className="font-caption text-caption text-text-secondary block">Revenue Generated</span>
              <span className="font-heading-md text-heading-md text-primary mt-1 block">{view.revenue}</span>
              <span className="font-caption text-caption text-text-tertiary block mt-0.5">Gross GMV</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs p-space-xs rounded-lg bg-surface-container-high/60">
            <Icon name="schedule" className="text-secondary text-[20px]" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-text-primary font-medium">Redemption Window</span>
              <span className="font-caption text-caption text-text-secondary">{view.window}</span>
            </div>
          </div>
        </section>

        {/* Catalog & Cap Limits */}
        <section className="bg-surface-canvas rounded-xl p-space-md shadow-sm space-y-space-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-space-2xs">
              <Icon name="restaurant_menu" className="text-primary text-[20px]" />
              Catalog & Cap Limits
            </h3>
            <span className="font-caption text-caption text-text-secondary">{view.bundleCount}</span>
          </div>
          <div className="space-y-space-xs">
            {view.bundled.map((bundled) => (
              <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-subtle" key={bundled.name}>
                <div className="flex items-center gap-space-xs min-w-0">
                  <div
                    className="w-10 h-10 rounded-lg shrink-0 bg-surface-container bg-cover bg-center"
                    style={{ backgroundImage: `url('${bundled.img}')` }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-text-primary font-medium truncate">
                      {bundled.name}
                    </span>
                    <span className="font-caption text-caption text-text-secondary truncate">{bundled.sub}</span>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm text-primary font-semibold shrink-0">Qty 1</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-tint-blue">
            <div className="flex items-center gap-space-2xs text-primary">
              <Icon name="inventory_2" className="text-[18px]" />
              <span className="font-label-sm text-label-sm font-medium">{view.capLabel}</span>
            </div>
            <span className="font-label-sm text-label-sm text-primary font-semibold">{view.capValue}</span>
          </div>
        </section>

        {/* Branch Availability */}
        <section className="bg-surface-canvas rounded-xl p-space-md shadow-sm space-y-space-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-space-2xs">
              <Icon name="store" className="text-primary text-[20px]" />
              Branch Availability
            </h3>
            <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
              {view.branchCount}
            </span>
          </div>
          <div className="space-y-space-xs">
            {view.branches.map((branch) => (
              <div
                className={`flex items-center justify-between p-space-xs rounded-lg ${
                  branch.available ? 'bg-surface-subtle' : 'bg-surface-container-low opacity-60'
                }`}
                key={branch.name}
              >
                <div className="flex items-center gap-space-xs min-w-0">
                  <Icon
                    name={branch.available ? 'check_circle' : 'block'}
                    className={branch.available ? 'text-badge-discount-text text-[20px]' : 'text-outline text-[20px]'}
                  />
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`font-label-md text-label-md font-medium truncate ${
                        branch.available ? 'text-text-primary' : 'text-text-secondary'
                      }`}
                    >
                      {branch.name}
                    </span>
                    <span className="font-caption text-caption text-text-secondary truncate">{branch.sub}</span>
                  </div>
                </div>
                <span
                  className={`font-label-md text-label-md shrink-0 ${
                    branch.available ? 'text-text-primary font-semibold' : 'text-text-tertiary font-caption text-caption'
                  }`}
                >
                  {branch.price}
                </span>
              </div>
            ))}
          </div>
          <button
            className="w-full text-left font-button-secondary text-button-secondary text-primary flex items-center justify-between pt-1"
            type="button"
            onClick={onEditAssignment}
          >
            <span>Edit Location Assignment & Pricing</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        </section>

        {/* Customer Facing Copy */}
        <section className="bg-surface-canvas rounded-xl p-space-md shadow-sm space-y-space-sm">
          <h3 className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-space-2xs">
            <Icon name="visibility" className="text-primary text-[20px]" />
            Customer Facing Copy
          </h3>
          <div className="space-y-space-2xs">
            <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
              Description
            </span>
            <p className="font-body-md text-body-md text-text-primary p-space-xs rounded-lg bg-surface-subtle">
              {view.description}
            </p>
          </div>
          <div className="space-y-space-2xs">
            <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
              Terms & Conditions
            </span>
            <p className="font-caption text-caption text-text-secondary p-space-xs rounded-lg bg-surface-subtle leading-relaxed">
              {view.terms}
            </p>
          </div>
          <div className="space-y-space-2xs">
            <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
              Claim Flow Instructions
            </span>
            <div className="p-space-xs rounded-lg bg-surface-subtle space-y-1 font-caption text-caption text-text-secondary">
              {view.claimSteps.map((step, index) => (
                <div className="flex items-start gap-space-xs" key={step}>
                  <span className="w-4 h-4 rounded-full bg-surface-variant text-on-surface font-semibold flex items-center justify-center shrink-0 font-caption text-[10px]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface-canvas/95 backdrop-blur-md px-margin py-space-xs pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex flex-col gap-space-2xs">
        <button
          className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-2xs shadow-md active:scale-[0.99] transition-transform"
          type="button"
          onClick={onBoost}
        >
          <Icon name="rocket_launch" className="text-[20px]" />
          <span>{view.boostCta}</span>
        </button>
        <button
          className="w-full h-10 rounded-lg text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1 active:bg-surface-tint-blue transition-colors"
          type="button"
        >
          <span>Preview Customer Deal View</span>
          <Icon name="north_east" className="text-[16px]" />
        </button>
      </div>
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[80] bg-inverse-surface text-inverse-on-surface px-space-md py-space-xs rounded-xl shadow-2xl font-label-md text-label-md max-w-[90vw] text-center">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
