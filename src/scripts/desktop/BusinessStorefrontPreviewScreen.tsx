import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '../../components/ui/Icon';
import { MerchantPortalChrome } from './MerchantPortalChrome';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { useMyBusiness } from '../../hooks/business/useMyBusiness';
import { useStorefrontPreview } from '../../hooks/business/useStorefrontPreview';
import { hasApiConfig } from '../../services/api/client';
import { offersService, type BusinessOffer } from '../../services/offersService';
import { catalogueItemsService } from '../../services/catalogueItemsService';
import { CHANNEL_PLATFORM_BY_ID, isChannelPlatform } from '../../utils/socialChannels';
import { formatNaira } from '../../utils/format';

/** Neutral tile while the business has no cover / item photo. */
const NO_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23e9eef9'/></svg>";

/** Icons for the amenities the profile studio offers; anything else gets a check. */
const AMENITY_ICON: Record<string, string> = {
  'Dine-In': 'restaurant',
  Takeaway: 'takeout_dining',
  Delivery: 'moped',
  'Free Wi-Fi': 'wifi',
  'Valet Parking': 'local_parking',
  'Wheelchair Acc.': 'accessible',
  'Outdoor Patio': 'deck',
  'POS Card': 'credit_card',
  'Instant Transfer': 'bolt',
  'Cash Accepted': 'payments',
};

interface BusinessStorefrontPreviewScreenProps {
  onNav: (key: string) => void;
  onBack: () => void;
  onEditProfile: () => void;
}

const money = (value?: number | string | null) =>
  value != null && value !== '' && !Number.isNaN(Number(value)) ? formatNaira(Number(value)) : '';

const dealBadge = (offer: BusinessOffer) =>
  offer.pricingType === 'percentage_discount' && offer.discountValue ? `${offer.discountValue}% OFF` : 'Deal';

/** One card per live deal: active, not expired, one per deal group (offers are per branch). */
function liveDeals(offers: BusinessOffer[]) {
  const now = Date.now();
  const seen = new Set<string>();
  return offers.filter((offer) => {
    if (offer.status !== 'active') return false;
    if (offer.endDate && new Date(offer.endDate).getTime() < now) return false;
    const key = offer.dealGroupId ?? offer.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * The owner's storefront laid out the way the customer storefront page shows a
 * business, filled from the live record, catalogue and deals. Customer-only
 * actions (save, chat, add to tray, claim) are inert here.
 */
export function BusinessStorefrontPreviewScreen({ onNav, onBack, onEditProfile }: BusinessStorefrontPreviewScreenProps) {
  const isDesktop = useIsDesktop();
  const live = hasApiConfig();
  const business = useMyBusiness();
  const preview = useStorefrontPreview();
  const opts = { enabled: live, staleTime: 60_000 };
  // Same key as useStorefrontPreview, so the catalogue loads once.
  const items = useQuery({
    queryKey: ['storefront-preview', 'items'],
    queryFn: () => catalogueItemsService.list({ limit: 100 }),
    ...opts,
  });
  const offers = useQuery({ queryKey: ['storefront-preview', 'offers-list'], queryFn: () => offersService.list(), ...opts });

  const b = business.data;
  const name = b?.name?.trim() || 'Your business';
  const products = (items.data ?? []).filter((item) => item.status === 'active' && !item.isSuspended);
  const deals = liveDeals(offers.data ?? []);
  const amenities = b?.amenities ?? [];
  const socials = Object.entries(b?.socials ?? {}).filter(([platform, handle]) => handle && isChannelPlatform(platform));
  const whatsapp = (b?.whatsappNumber ?? '').replace(/\D/g, '');
  const location = [b?.address, b?.city, b?.state].filter(Boolean).join(', ');
  const loading = live && business.isLoading;

  const frame = (children: ReactNode) =>
    isDesktop ? (
      <MerchantPortalChrome activeNav="business-profile" onNav={onNav}>
        {children}
      </MerchantPortalChrome>
    ) : (
      <div className="w-full min-h-screen bg-surface font-body-md text-on-surface">{children}</div>
    );

  return frame(
    <div className="w-full bg-surface pb-16">
      {/* Preview bar — the only part customers don't see */}
      <div className="max-w-7xl w-full mx-auto px-4 lg:px-12 pt-6">
        <div className="rounded-2xl bg-surface-tint-blue px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-primary">
            <Icon name="visibility" className="text-[20px]" />
            <span className="font-label-md text-label-md font-semibold">Customer view</span>
            <span className="font-caption text-caption text-text-secondary">
              {b?.isVisible === false ? 'Your storefront is hidden from search — only people with your link see it.' : 'This is how customers see your storefront.'}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onBack}
              className="h-9 px-4 rounded-xl bg-surface-canvas text-text-primary font-label-md text-label-md font-semibold flex items-center gap-1 hover:bg-surface-container-low transition-colors"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back to profile</span>
            </button>
            <button
              type="button"
              onClick={onEditProfile}
              className="h-9 px-4 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold flex items-center gap-1 hover:opacity-95 transition-opacity"
            >
              <Icon name="edit" className="text-[18px]" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="max-w-7xl w-full mx-auto px-4 lg:px-12 py-16 flex justify-center text-text-secondary">
          <Icon name="progress_activity" className="text-[28px] animate-spin" />
        </div>
      ) : (
        <>
          <section className="max-w-7xl w-full mx-auto px-4 lg:px-12 pt-6 pb-8">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-sm bg-surface-canvas">
              <div className="relative h-56 md:h-96 w-full overflow-hidden bg-surface-container">
                <img alt={`${name} cover photo`} className="w-full h-full object-cover" src={b?.coverImage || NO_IMAGE} />
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/35 to-transparent" />

                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span aria-hidden="true" className="p-2.5 rounded-xl bg-surface-canvas/90 backdrop-blur-md shadow-md text-on-surface flex">
                    <Icon name="favorite_border" className="text-[20px]" />
                  </span>
                  <span aria-hidden="true" className="p-2.5 rounded-xl bg-surface-canvas/90 backdrop-blur-md shadow-md text-on-surface flex">
                    <Icon name="share" className="text-[20px]" />
                  </span>
                </div>

                <div className="absolute bottom-6 left-4 md:left-8 right-4 md:right-8 flex items-end gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-surface-canvas shadow-lg shrink-0 p-1">
                    {b?.logoUrl ? (
                      <img alt={`${name} logo`} className="w-full h-full rounded-xl object-cover" src={b.logoUrl} />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center font-heading-md text-heading-md">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {preview.verified && (
                        <span className="px-2.5 py-1 rounded-md bg-primary-container text-on-primary-container font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-sm">
                          <Icon name="verified" className="text-[16px]" />
                          <span>VEMTAP Verified</span>
                        </span>
                      )}
                      {preview.category && (
                        <span className="px-2.5 py-1 rounded-md bg-surface-canvas/90 backdrop-blur text-on-surface font-caption text-caption font-semibold">
                          {preview.category}
                        </span>
                      )}
                      {preview.rating && (
                        <span className="px-2.5 py-1 rounded-md bg-surface-canvas/90 backdrop-blur text-on-surface font-caption text-caption font-semibold flex items-center gap-1">
                          <Icon name="star" filled className="text-[15px] text-amber-500" />
                          <span className="text-on-surface font-bold">{preview.rating}</span>
                          <span className="text-text-secondary">
                            ({preview.reviewCount} {preview.reviewCount === 1 ? 'Review' : 'Reviews'})
                          </span>
                        </span>
                      )}
                    </div>
                    <h1 className="font-display-hero text-display-hero text-on-primary drop-shadow-md truncate">{name}</h1>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-surface-canvas">
                <div className="space-y-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-5 font-body-md text-body-md text-text-secondary">
                    {location && (
                      <div className="flex items-center gap-1.5 text-on-surface font-medium">
                        <Icon name="location_on" className="text-primary text-[19px]" />
                        <span>{location}</span>
                      </div>
                    )}
                    {b?.phone && (
                      <div className="flex items-center gap-1.5 text-on-surface">
                        <Icon name="call" className="text-primary text-[19px]" />
                        <span>{b.phone}</span>
                      </div>
                    )}
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary max-w-3xl">
                    {b?.description?.trim() || 'No description yet — add one so customers know what you offer.'}
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                  {whatsapp && (
                    <span className="px-5 py-3 rounded-xl bg-emerald-600 text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto">
                      <Icon name="chat" className="text-[20px]" />
                      <span>WhatsApp</span>
                    </span>
                  )}
                  <span className="px-5 py-3 rounded-xl bg-primary-container text-on-primary-container font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-md w-full sm:w-auto">
                    <Icon name="forum" className="text-[20px]" />
                    <span>Direct Chat on VEMTAP</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-7xl w-full mx-auto px-4 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 flex flex-col gap-8 min-w-0">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 px-1">
                    <h2 className="font-heading-md text-heading-md text-on-surface">Active Deals</h2>
                    <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-caption text-caption font-bold">{deals.length}</span>
                  </div>
                  {deals.length === 0 ? (
                    <p className="px-1 font-body-md text-body-md text-text-secondary">No live deals — customers won't see a deals row until you publish one.</p>
                  ) : (
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                      {deals.map((deal) => (
                        <div key={deal.id} className="w-[300px] shrink-0 bg-surface-canvas rounded-2xl p-3 shadow-sm flex items-center gap-3">
                          <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-surface-container-high">
                            <img alt={deal.name} className="w-full h-full object-cover" src={deal.mainImage || NO_IMAGE} />
                            <span className="absolute top-1.5 left-1.5 bg-badge-discount-bg text-badge-discount-text font-label-sm text-caption px-1.5 py-0.5 rounded font-semibold">
                              {dealBadge(deal)}
                            </span>
                          </div>
                          <div className="flex flex-col justify-between flex-1 min-w-0">
                            <h3 className="font-label-md text-label-md text-text-primary font-semibold line-clamp-2">{deal.name}</h3>
                            <div className="mt-2">
                              <div className="font-heading-sm text-heading-sm text-text-primary">{money(deal.calculatedPrice ?? deal.fixedPrice)}</div>
                              {deal.originalPrice != null && (
                                <div className="font-caption text-caption text-text-tertiary line-through -mt-0.5">{money(deal.originalPrice)}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="px-1">
                    <h2 className="font-heading-md text-heading-md text-on-surface">Products</h2>
                    <p className="font-caption text-caption text-text-secondary">Prices displayed in Nigerian Naira (₦).</p>
                  </div>
                  {products.length === 0 ? (
                    <p className="px-1 font-body-md text-body-md text-text-secondary">No active catalogue items yet.</p>
                  ) : (
                    <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar">
                      {products.map((product) => (
                        <div key={product.id} className="w-[260px] shrink-0 bg-surface-canvas rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="relative h-40 w-full overflow-hidden bg-surface-container">
                              <img alt={product.name} className="w-full h-full object-cover" src={product.mainImage || NO_IMAGE} />
                            </div>
                            <div className="p-4 space-y-2">
                              <h3 className="font-heading-sm text-heading-sm text-on-surface">{product.name}</h3>
                              <p className="font-caption text-caption text-text-secondary line-clamp-2">
                                {product.shortDescription || product.description || product.category?.name || ''}
                              </p>
                            </div>
                          </div>
                          <div className="p-4 pt-0 flex items-center justify-between">
                            <div>
                              <span className="font-heading-sm text-heading-sm text-on-surface font-bold">{money(product.price)}</span>
                              {product.compareAtPrice != null && Number(product.compareAtPrice) > Number(product.price) && (
                                <span className="font-caption text-caption text-text-tertiary line-through ml-1.5">{money(product.compareAtPrice)}</span>
                              )}
                            </div>
                            <span className="h-10 px-3.5 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold shadow-sm flex items-center gap-1.5">
                              <Icon name="add" className="text-[18px]" />
                              <span>Add</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm space-y-5">
                  <h3 className="font-heading-sm text-heading-sm text-on-surface">Location &amp; Access</h3>
                  <div className="flex items-start gap-2 font-body-md text-body-md text-text-secondary">
                    <Icon name="location_on" className="text-primary text-[19px] mt-0.5" />
                    <span>{location || 'No address yet'}</span>
                  </div>

                  {amenities.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="font-label-md text-label-md font-semibold text-on-surface">Venue Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {amenities.map((label) => (
                          <span key={label} className="px-3 py-1 rounded-full bg-surface-subtle text-text-secondary font-caption text-caption flex items-center gap-1">
                            <Icon name={AMENITY_ICON[label] ?? 'check_circle'} className="text-[15px] text-primary" />
                            <span>{label}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(b?.officialEmail || b?.website || socials.length > 0) && (
                    <div className="space-y-2.5">
                      <h4 className="font-label-md text-label-md font-semibold text-on-surface">Contact &amp; Socials</h4>
                      <div className="flex flex-col gap-2 font-caption text-caption text-text-secondary">
                        {b?.officialEmail && (
                          <span className="flex items-center gap-1.5">
                            <Icon name="mail" className="text-[16px] text-primary" />
                            {b.officialEmail}
                          </span>
                        )}
                        {b?.website && (
                          <span className="flex items-center gap-1.5">
                            <Icon name="language" className="text-[16px] text-primary" />
                            {b.website}
                          </span>
                        )}
                        {socials.map(([platform, handle]) => (
                          <span key={platform} className="flex items-center gap-1.5">
                            <Icon name={isChannelPlatform(platform) ? CHANNEL_PLATFORM_BY_ID[platform].icon : 'link'} className="text-[16px] text-primary" />
                            {handle.startsWith('@') || handle.includes('/') ? handle : `@${handle}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>,
  );
}
