import { useMemo, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { Skeleton, SkeletonGroup } from '../components/ui/Skeleton';
import { naira } from './catalogueData';
import { mapEmbedUrl, mapsLink, todayHours, usePublicBusiness, type PublicBusiness, type PublicCatalogueItem } from '../hooks/usePublicBusiness';
import { offerDiscountLabel, offerEndsLabel, offerImage, realOfferId, type OfferRecord } from '../utils/homeOffer';
import { SaveToggle } from '../components/SaveToggle';
import { messageService } from '../services/messageService';
import { ApiError, getAccessToken } from '../services/api/client';
import type { ClaimDealSummary } from '../components/desktop/dialogs/ClaimIdentityModal';

export interface BusinessProfileScreenProps {
  /** Ignored for live businesses: the layout follows what the business sells (services only → spa layout). */
  venue?: 'urban' | 'spa';
  /** `slug` is the business's public code (`uniqueCode`); everything else loads live from it. */
  business?: { name?: string; slug?: string } | null;
  onBack: () => void;
  /** Opens the claim popup for exactly this deal. */
  onClaim: (deal: ClaimDealSummary, onClaimed?: () => void) => void;
  /** Opens the deal page. */
  onOpenDeal?: (deal: ClaimDealSummary) => void;
  /** Opens the product/service page. */
  onOpenItem?: (itemId: string) => void;
  /** Opens with the message box ready, for a chat started from Messages. */
  startChat?: boolean;
  /** A first message was sent from that box. */
  onChatStarted?: (branchId: string) => void;
}

interface LiveDeal {
  id: string;
  badge: string;
  meta: string;
  metaIcon: string;
  title: string;
  price: number;
  was: number;
  image: string;
  percent: number;
}

const toLiveDeal = (offer: OfferRecord): LiveDeal | null => {
  const id = realOfferId(offer);
  const title = typeof offer.name === 'string' ? offer.name.trim() : '';
  if (!id || !title) return null;
  const price = Number(offer.calculatedPrice ?? offer.price ?? 0) || 0;
  const original = Number(offer.originalPrice ?? 0) || 0;
  return {
    id,
    badge: offerDiscountLabel(offer),
    meta: offerEndsLabel(offer),
    metaIcon: 'schedule',
    title,
    price,
    was: original > price ? original : 0,
    image: offerImage(offer),
    percent: Number(offer.percentageOff ?? offer.discountPercent ?? 0) || 0,
  };
};

interface ProfileProps {
  business: PublicBusiness;
  deals: LiveDeal[];
  products: PublicCatalogueItem[];
  services: PublicCatalogueItem[];
  catalogueLoading: boolean;
  onClaim: BusinessProfileScreenProps['onClaim'];
  onOpenDeal?: BusinessProfileScreenProps['onOpenDeal'];
  onOpenItem?: BusinessProfileScreenProps['onOpenItem'];
  /** Opens with the message box ready, for a chat started from Messages. */
  startChat?: boolean;
  onChatStarted?: (branchId: string) => void;
}

const toClaim = (deal: LiveDeal, business: PublicBusiness): ClaimDealSummary => ({
  id: deal.id,
  title: deal.title,
  business: business.name,
  location: business.city ?? undefined,
  price: deal.price || undefined,
  oldPrice: deal.was || undefined,
  discountLabel: deal.badge,
  image: deal.image,
});

const kindLine = (business: PublicBusiness) => [business.category, business.subcategory].filter(Boolean).join(' • ');
const addressLine = (business: PublicBusiness) => [business.address, business.city].filter(Boolean).join(', ');
const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
const waHref = (phone: string) => `https://wa.me/${phone.replace(/[^\d]/g, '')}`;
const webHref = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

/** Starts a real chat with the business's main branch (`POST /customer/messaging/threads/start`). */
function InAppChat({ business, onClose, onStarted }: { business: PublicBusiness; onClose: () => void; onStarted?: (branchId: string) => void }) {
  const [text, setText] = useState('');
  const [state, setState] = useState<{ kind: 'idle' | 'sending' | 'sent' | 'error'; message?: string }>({ kind: 'idle' });
  const send = async () => {
    const branchId = business.branches[0]?.id;
    if (!text.trim() || !branchId) return;
    if (!getAccessToken()) {
      setState({ kind: 'error', message: 'Please sign in to message this business.' });
      return;
    }
    setState({ kind: 'sending' });
    try {
      await messageService.startConversation({ branchId, content: text.trim() });
      setText('');
      setState({ kind: 'sent' });
      onStarted?.(branchId);
    } catch (err) {
      setState({ kind: 'error', message: err instanceof ApiError && err.message && !/^Request failed/.test(err.message) ? err.message : 'Your message couldn’t be sent. Please try again.' });
    }
  };
  return (
    <div className="mt-3 rounded-2xl bg-surface-canvas p-3 shadow-sm space-y-2">
      {state.kind === 'sent' ? (
        <div className="flex items-center justify-between gap-2">
          <p role="status" className="font-body-md text-body-md text-badge-discount-text">Message sent to {business.name}. Replies appear in Messages.</p>
          <button type="button" onClick={onClose} className="font-label-md text-label-md text-primary font-semibold shrink-0">Done</button>
        </div>
      ) : (
        <>
          <textarea
            aria-label={`Message ${business.name}`}
            rows={2}
            maxLength={1000}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={`Ask ${business.name} a question…`}
            className="w-full resize-none rounded-xl bg-surface-subtle px-3 py-2 font-body-md text-body-md text-on-surface placeholder:text-text-tertiary outline-none"
          />
          <div className="flex items-center justify-between gap-2">
            {state.kind === 'error' ? <p role="alert" className="font-caption text-caption text-error">{state.message}</p> : <span />}
            <button
              type="button"
              disabled={!text.trim() || state.kind === 'sending'}
              onClick={() => void send()}
              className="h-9 px-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold disabled:opacity-50 shrink-0"
            >
              {state.kind === 'sending' ? 'Sending…' : 'Send'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** Contact buttons for the channels the business actually set up. */
function ContactGrid({ business, chatOpen, onToggleChat, tone }: { business: PublicBusiness; chatOpen: boolean; onToggleChat: () => void; tone: 'urban' | 'spa' }) {
  const tile = tone === 'urban' ? 'bg-surface-canvas rounded-2xl p-3 shadow-sm' : 'p-space-xs rounded-xl bg-surface-subtle';
  const items: { key: string; label: string; icon: string; circle: string; href?: string; onClick?: () => void; active?: boolean }[] = [];
  if (business.phone) items.push({ key: 'call', label: 'Call', icon: 'call', circle: 'bg-surface-tint-blue text-primary', href: telHref(business.phone) });
  if (business.branches.length > 0) items.push({ key: 'chat', label: 'In-App', icon: 'chat_bubble', circle: chatOpen ? 'bg-primary text-on-primary' : 'bg-surface-tint-blue text-primary', onClick: onToggleChat, active: chatOpen });
  if (business.whatsapp) items.push({ key: 'wa', label: 'WhatsApp', icon: 'sms', circle: 'bg-badge-discount-bg text-badge-discount-text', href: waHref(business.whatsapp) });
  if (business.website) items.push({ key: 'web', label: 'Website', icon: 'language', circle: 'bg-surface-tint-blue text-primary', href: webHref(business.website) });
  if (items.length === 0) return null;
  const cols = ['grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4'][items.length - 1];
  return (
    <div className={`grid ${cols} gap-2`}>
      {items.map((item) => {
        const body = (
          <>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.circle}`}>
              <Icon name={item.icon} className="text-[20px]" />
            </div>
            <span className="font-caption text-caption text-text-secondary font-medium">{item.label}</span>
          </>
        );
        const className = `${tile} flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform`;
        return item.href ? (
          <a key={item.key} href={item.href} target={item.key === 'call' ? undefined : '_blank'} rel="noreferrer" className={className}>{body}</a>
        ) : (
          <button key={item.key} type="button" onClick={item.onClick} aria-pressed={item.active} className={className}>{body}</button>
        );
      })}
    </div>
  );
}

function OpenBadge({ business, className }: { business: PublicBusiness; className: string }) {
  const status = todayHours(business.hours);
  if (!status) return null;
  return (
    <span className={`${className} ${status.openNow ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-subtle text-text-secondary'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status.openNow ? 'bg-badge-discount-text' : 'bg-outline'}`} />
      <span>{status.openNow ? `Open now${status.today.close ? ` • Closes ${status.today.close}` : ''}` : status.today.closed ? 'Closed today' : 'Closed now'}</span>
    </span>
  );
}

function HoursList({ business, rowClass }: { business: PublicBusiness; rowClass: string }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  return (
    <>
      {business.hours.map((row) => (
        <div key={row.day} className={`${rowClass} ${row.day === today ? 'text-primary font-semibold' : ''}`}>
          <span className="font-medium text-text-primary">{row.day}</span>
          <span>{row.label}</span>
        </div>
      ))}
    </>
  );
}

function UrbanProfile({ business, deals, products, services, catalogueLoading, onClaim, onOpenDeal, onOpenItem, startChat, onChatStarted }: ProfileProps) {
  const [expanded, setExpanded] = useState(false);
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});
  const [chatOpen, setChatOpen] = useState(Boolean(startChat));
  const bestDeal = [...deals].sort((a, b) => b.percent - a.percent)[0];
  const map = mapsLink(business);
  const embed = mapEmbedUrl(business.latitude, business.longitude);
  const catalogue = [...products, ...services];

  return (
    <main className="relative w-full pt-14 pb-safe bg-surface min-h-screen">
      <div className={`flex flex-col w-full ${bestDeal ? 'pb-28' : 'pb-10'}`}>
        <div className="relative w-full h-[210px] bg-surface-tint-blue overflow-hidden">
          {business.cover ? <img alt={`${business.name} cover photo`} className="w-full h-full object-cover" src={business.cover} /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          {business.verified ? (
            <div className="absolute bottom-3 right-4 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1.5 text-on-primary font-caption text-caption">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
              <span>Verified Partner</span>
            </div>
          ) : null}
        </div>
        <div className="px-margin -mt-7 relative z-10">
          <div className="bg-surface-canvas rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="relative -mt-10">
                <div className="w-16 h-16 rounded-2xl bg-surface-canvas p-1 shadow-md overflow-hidden flex items-center justify-center">
                  {business.logo ? (
                    <img alt={`${business.name} logo`} className="w-full h-full rounded-xl object-cover" src={business.logo} />
                  ) : (
                    <span className="font-heading-md text-heading-md text-primary font-bold">{business.name.slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                {business.verified ? (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow">
                    <Icon name="check" filled className="text-[15px]" />
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex items-start justify-between gap-space-xs">
              <div className="min-w-0">
                <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">{business.name}</h2>
                {kindLine(business) ? <p className="font-body-md text-body-md text-text-secondary mt-0.5">{kindLine(business)}</p> : null}
              </div>
              <SaveToggle kind="businesses" id={business.id} name={business.name} className="w-10 h-10 shrink-0 rounded-full bg-surface-container-low text-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-60" />
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <OpenBadge business={business} className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-label-sm text-label-sm" />
            </div>
            {addressLine(business) ? (
              <div className="flex items-center gap-1.5 text-text-secondary font-label-sm text-label-sm pt-0.5">
                <Icon name="distance" className="text-[18px] text-primary" />
                <span>{addressLine(business)}</span>
              </div>
            ) : null}
          </div>
        </div>
        <div className="px-margin mt-4 grid grid-cols-12 gap-3">
          <button
            className={`${map ? 'col-span-7' : 'col-span-12'} h-[52px] rounded-2xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform`}
            type="button"
            onClick={() => document.getElementById('business-deals-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Icon name="local_offer" className="text-[20px]" />
            <span>View Deals ({deals.length})</span>
          </button>
          {map ? (
            <a
              className="col-span-5 h-[52px] rounded-2xl bg-surface-tint-blue text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
              href={map}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="near_me" className="text-[20px]" />
              <span>Directions</span>
            </a>
          ) : null}
        </div>
        {business.description ? (
          <div className="px-margin mt-6">
            <div className="bg-surface-canvas rounded-2xl p-4 shadow-sm">
              <h3 className="font-heading-sm text-heading-sm text-text-primary">About</h3>
              <p className={`font-body-md text-body-md text-text-secondary mt-1.5 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>{business.description}</p>
              {business.description.length > 90 ? (
                <button className="font-label-md text-label-md text-primary font-medium mt-1 inline-flex items-center gap-0.5" type="button" onClick={() => setExpanded((current) => !current)}>
                  {expanded ? 'Show less' : 'Read more'}
                  <Icon name={expanded ? 'expand_less' : 'expand_more'} className="text-[16px]" />
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="mt-7" id="business-deals-section">
          <div className="px-margin flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Active Deals</h3>
              {!catalogueLoading ? <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-caption text-caption">{deals.length}</span> : null}
            </div>
          </div>
          <div className="px-margin flex flex-col gap-3">
            {catalogueLoading ? (
              [0, 1].map((key) => <Skeleton key={key} className="h-[124px] w-full rounded-2xl" />)
            ) : deals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-primary/20 bg-surface-canvas p-4 text-text-secondary font-body-md text-body-md">{business.name} has no live deals right now.</div>
            ) : (
              deals.map((deal) => (
                <div
                  className="bg-surface-canvas rounded-2xl p-3.5 shadow-sm flex items-center gap-3.5 relative overflow-hidden cursor-pointer"
                  key={deal.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenDeal?.(toClaim(deal, business))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onOpenDeal?.(toClaim(deal, business));
                    }
                  }}
                >
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-surface-container-high">
                    <img alt={deal.title} className="w-full h-full object-cover" src={deal.image} />
                    <span className="absolute top-1.5 left-1.5 bg-badge-discount-bg text-badge-discount-text font-label-sm text-caption px-1.5 py-0.5 rounded font-semibold">{deal.badge}</span>
                  </div>
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <div className="flex items-center gap-1 text-tertiary font-caption text-caption mb-0.5">
                        <Icon name={deal.metaIcon} className="text-[14px]" />
                        <span>{deal.meta}</span>
                      </div>
                      <h4 className="font-label-md text-label-md text-text-primary font-semibold truncate">{deal.title}</h4>
                    </div>
                    <div className="flex items-end justify-between mt-2">
                      <div>
                        {deal.price > 0 ? <div className="font-heading-sm text-heading-sm text-text-primary">{naira(deal.price)}</div> : null}
                        {deal.was > 0 ? <div className="font-caption text-caption text-text-tertiary line-through -mt-0.5">{naira(deal.was)}</div> : null}
                      </div>
                      <button
                        className={`h-8 px-4 rounded-xl font-label-sm text-label-sm flex items-center justify-center active:scale-95 transition-transform shadow-sm ${
                          claimed[deal.id] ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-primary-container text-on-primary'
                        }`}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onClaim(toClaim(deal, business), () => setClaimed((current) => ({ ...current, [deal.id]: true })));
                        }}
                      >
                        {claimed[deal.id] ? 'Claimed' : 'Claim'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {catalogueLoading || catalogue.length > 0 ? (
          <div className="mt-7">
            <div className="px-margin flex items-center justify-between mb-3">
              <h3 className="font-heading-sm text-heading-sm text-text-primary">{services.length > 0 && products.length > 0 ? 'Products & Services' : services.length > 0 ? 'Services' : 'Products'}</h3>
            </div>
            <div className="grid grid-rows-2 grid-flow-col auto-cols-[10rem] gap-3 overflow-x-auto px-margin no-scrollbar pb-1">
              {catalogueLoading
                ? [0, 1, 2, 3].map((key) => <Skeleton key={key} className="w-40 h-44 rounded-2xl" />)
                : catalogue.map((product) => (
                    <div
                      className="w-40 shrink-0 bg-surface-canvas rounded-2xl p-2.5 shadow-sm flex flex-col cursor-pointer"
                      key={product.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenItem?.(product.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onOpenItem?.(product.id);
                        }
                      }}
                    >
                      <div className="w-full h-28 rounded-xl overflow-hidden bg-surface-container-high mb-2 flex items-center justify-center">
                        {product.image ? (
                          <img alt={product.name} className="w-full h-full object-cover" src={product.image} />
                        ) : (
                          <Icon name={product.kind === 'service' ? 'room_service' : 'inventory_2'} className="text-[28px] text-outline" />
                        )}
                      </div>
                      <h4 className="font-label-md text-label-md text-text-primary font-medium truncate">{product.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-label-md text-label-md text-text-primary font-bold">{product.price > 0 ? naira(product.price) : ''}</span>
                        <span aria-hidden="true" className="w-6 h-6 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center">
                          <Icon name="chevron_right" className="text-[16px]" />
                        </span>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        ) : null}
        <div className="px-margin mt-7">
          <ContactGrid business={business} chatOpen={chatOpen} onToggleChat={() => setChatOpen((open) => !open)} tone="urban" />
          {chatOpen ? <InAppChat business={business} onClose={() => setChatOpen(false)} onStarted={onChatStarted} /> : null}
        </div>
        {business.hours.length > 0 ? (
          <div className="px-margin mt-6">
            <div className="bg-surface-canvas rounded-2xl p-4 shadow-sm flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="schedule" className="text-primary text-[20px]" />
                  <h3 className="font-label-md text-label-md text-text-primary font-semibold">Opening Hours</h3>
                </div>
                <OpenBadge business={business} className="flex items-center gap-1 px-2 py-0.5 rounded-full font-caption text-caption font-semibold" />
              </div>
              <div className="flex flex-col gap-1.5 pt-1 font-label-sm text-label-sm text-text-secondary">
                <HoursList business={business} rowClass="flex justify-between items-center py-1" />
              </div>
            </div>
          </div>
        ) : null}
        {addressLine(business) ? (
          <div className="px-margin mt-6">
            <div className="bg-surface-canvas rounded-2xl p-4 shadow-sm flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <Icon name="place" className="text-primary text-[20px] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-label-md text-label-md text-text-primary font-semibold">Location</h3>
                  <p className="font-body-md text-body-md text-text-secondary mt-0.5">{[business.address, business.city, business.state].filter(Boolean).join(', ')}</p>
                </div>
              </div>
              {embed ? (
                <div className="w-full h-44 rounded-xl overflow-hidden shadow-sm bg-surface-tint-blue">
                  <iframe title={`Map showing ${business.name}`} className="w-full h-full border-0" src={embed} loading="lazy" />
                </div>
              ) : null}
              {map ? (
                <a className="w-full h-11 rounded-xl bg-surface-tint-blue text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5" href={map} target="_blank" rel="noreferrer">
                  <Icon name="turn_right" className="text-[18px]" />
                  <span>Open in Navigation</span>
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
        {business.amenities.length > 0 ? (
          <div className="px-margin mt-6">
            <div className="bg-surface-canvas rounded-2xl p-4 shadow-sm flex flex-col gap-2.5">
              <h3 className="font-label-md text-label-md text-text-primary font-semibold">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {business.amenities.map((amenity) => (
                  <span key={amenity} className="px-3 py-1 rounded-full bg-surface-subtle text-text-secondary font-caption text-caption">{amenity}</span>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
      {bestDeal ? (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-4 pb-safe bg-surface-canvas/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-40 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="font-caption text-caption text-text-secondary block">Special Offer</span>
            <span className="font-heading-sm text-heading-sm text-text-primary truncate block">{bestDeal.percent > 0 ? `Up to ${Math.round(bestDeal.percent)}% OFF` : bestDeal.title}</span>
          </div>
          <button
            className="h-12 px-6 rounded-2xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center gap-2 shadow-md active:scale-95 transition-transform shrink-0"
            type="button"
            onClick={() => onClaim(toClaim(bestDeal, business), () => setClaimed((current) => ({ ...current, [bestDeal.id]: true })))}
          >
            <Icon name="local_activity" className="text-[20px]" />
            <span>{claimed[bestDeal.id] ? 'Claimed' : 'Claim Deal'}</span>
          </button>
        </div>
      ) : null}
    </main>
  );
}

function SpaProfile({ business, deals, services, catalogueLoading, onClaim, onOpenDeal, onOpenItem, startChat, onChatStarted }: ProfileProps) {
  const [expanded, setExpanded] = useState(false);
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});
  const [chatOpen, setChatOpen] = useState(Boolean(startChat));
  const bestDeal = [...deals].sort((a, b) => b.percent - a.percent)[0];
  const map = mapsLink(business);
  const embed = mapEmbedUrl(business.latitude, business.longitude);
  const summary = business.description ?? '';
  const scrollToDeals = () => document.getElementById('spa-deals-section')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <main className="relative w-full pt-14 pb-safe bg-surface-canvas min-h-screen">
      <div className={`flex flex-col w-full ${bestDeal ? 'pb-24' : 'pb-10'}`}>
        <div className="relative w-full h-64 bg-surface-tint-blue overflow-hidden">
          {business.cover ? <img alt={`${business.name} cover photo`} className="w-full h-full object-cover" src={business.cover} /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          {business.verified ? (
            <div className="absolute top-4 right-4 flex items-center gap-space-2xs">
              <span className="px-space-xs py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md font-caption text-caption text-text-primary flex items-center gap-1 shadow-sm">
                <Icon name="verified" filled className="text-[15px] text-badge-discount-text" />
                Verified Partner
              </span>
            </div>
          ) : null}
        </div>
        <div className="px-margin pt-space-xs pb-space-md bg-surface-canvas relative">
          <div className="flex justify-between items-end -mt-12 mb-space-sm relative z-10">
            <div className="relative w-20 h-20 rounded-full p-1 bg-surface-canvas shadow-md flex items-center justify-center">
              {business.logo ? (
                <img alt={`${business.name} logo`} className="w-full h-full rounded-full object-cover" src={business.logo} />
              ) : (
                <span className="font-heading-md text-heading-md text-primary font-bold">{business.name.slice(0, 1).toUpperCase()}</span>
              )}
              {business.verified ? (
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary-container flex items-center justify-center shadow-sm">
                  <Icon name="check" filled className="text-on-primary text-[14px]" />
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex items-start justify-between gap-space-xs">
            <div className="flex flex-col gap-1 min-w-0">
              <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">{business.name}</h2>
              {kindLine(business) ? <p className="font-label-md text-label-md text-text-secondary">{kindLine(business)}</p> : null}
            </div>
            <SaveToggle kind="businesses" id={business.id} name={business.name} className="w-10 h-10 shrink-0 rounded-full bg-surface-container-low text-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-60" />
          </div>
          <div className="flex flex-wrap items-center gap-space-xs mt-space-xs">
            <OpenBadge business={business} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-medium" />
          </div>
          {addressLine(business) ? (
            <div className="flex items-start gap-1.5 mt-space-xs text-text-secondary">
              <Icon name="location_on" className="text-[18px] text-primary shrink-0 mt-0.5" />
              <p className="font-caption text-caption text-text-secondary">{addressLine(business)}</p>
            </div>
          ) : null}
          <div className={`grid ${map ? 'grid-cols-2' : 'grid-cols-1'} gap-space-xs mt-space-md`}>
            <button
              className="h-[50px] rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              type="button"
              onClick={scrollToDeals}
            >
              <Icon name="local_activity" filled className="text-[20px]" />
              <span>View Deals ({deals.length})</span>
            </button>
            {map ? (
              <a
                className="h-[50px] rounded-xl bg-surface-container-low hover:bg-surface-container text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 active:scale-95 transition-all"
                href={map}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="near_me" className="text-[20px] text-primary" />
                <span>Directions</span>
              </a>
            ) : null}
          </div>
        </div>
        {summary ? (
          <>
            <div className="h-2 w-full bg-surface-subtle" />
            <div className="px-margin py-space-md">
              <h3 className="font-heading-sm text-heading-sm text-text-primary mb-space-xs">About</h3>
              <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                {expanded || summary.length <= 140 ? summary : `${summary.slice(0, 140)}...`}{' '}
                {summary.length > 140 ? (
                  <button className="text-primary font-label-md text-label-md inline" type="button" onClick={() => setExpanded((current) => !current)}>
                    {expanded ? 'Show less' : 'Read more'}
                  </button>
                ) : null}
              </p>
            </div>
          </>
        ) : null}
        <div className="h-2 w-full bg-surface-subtle" />
        <div className="px-margin py-space-md" id="spa-deals-section">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-2">
              <Icon name="loyalty" className="text-primary text-[22px]" />
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Active Deals</h3>
            </div>
            {!catalogueLoading ? <span className="text-primary font-label-md text-label-md">{deals.length}</span> : null}
          </div>
          <div className="flex flex-col gap-space-sm">
            {catalogueLoading ? (
              [0, 1].map((key) => <Skeleton key={key} className="h-[128px] w-full rounded-xl" />)
            ) : deals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-primary/20 bg-surface-subtle p-4 text-text-secondary font-body-md text-body-md">{business.name} has no live deals right now.</div>
            ) : (
              deals.map((deal) => (
                <div
                  className="p-space-sm rounded-xl bg-surface-subtle shadow-sm flex flex-col gap-space-xs relative overflow-hidden cursor-pointer"
                  key={deal.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenDeal?.(toClaim(deal, business))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onOpenDeal?.(toClaim(deal, business));
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">{deal.badge}</span>
                    <span className="font-caption text-caption text-tertiary flex items-center gap-1 font-medium">
                      <Icon name={deal.metaIcon} className="text-[14px]" />
                      {deal.meta}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-heading-sm text-heading-sm text-text-primary">{deal.title}</h4>
                    {deal.was > 0 ? <p className="font-caption text-caption text-text-secondary mt-0.5">Save {naira(deal.was - deal.price)}</p> : null}
                  </div>
                  <div className="flex items-center justify-between mt-space-2xs pt-space-2xs">
                    <div className="flex items-baseline gap-2">
                      {deal.price > 0 ? <span className="font-heading-sm text-heading-sm text-text-primary font-bold">{naira(deal.price)}</span> : null}
                      {deal.was > 0 ? <span className="font-caption text-caption text-text-tertiary line-through">{naira(deal.was)}</span> : null}
                    </div>
                    <button
                      className={`px-space-md py-2 rounded-lg font-label-md text-label-md shadow-sm transition-all ${
                        claimed[deal.id] ? 'bg-badge-discount-bg text-badge-discount-text cursor-default' : 'bg-primary text-on-primary active:scale-95'
                      }`}
                      disabled={!!claimed[deal.id]}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onClaim(toClaim(deal, business), () => setClaimed((current) => ({ ...current, [deal.id]: true })));
                      }}
                    >
                      {claimed[deal.id] ? 'Claimed!' : 'Claim'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="h-2 w-full bg-surface-subtle" />
        <div className="py-space-md">
          <div className="px-margin flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-2">
              <Icon name="spa" className="text-primary text-[22px]" />
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Services</h3>
            </div>
          </div>
          <div className="grid grid-rows-2 grid-flow-col auto-cols-[11rem] gap-space-sm overflow-x-auto px-margin pb-space-xs no-scrollbar">
            {catalogueLoading
              ? [0, 1, 2, 3].map((key) => <Skeleton key={key} className="w-44 h-48 rounded-xl" />)
              : services.map((service) => (
                  <div
                    className="w-44 shrink-0 rounded-xl bg-surface-subtle p-2 flex flex-col justify-between shadow-sm cursor-pointer"
                    key={service.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenItem?.(service.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onOpenItem?.(service.id);
                      }
                    }}
                  >
                    <div className="w-full h-28 rounded-lg bg-surface-container-high overflow-hidden relative flex items-center justify-center">
                      {service.image ? <img alt={service.name} className="w-full h-full object-cover" src={service.image} /> : <Icon name="room_service" className="text-[28px] text-outline" />}
                    </div>
                    <div className="pt-2 flex flex-col gap-1">
                      <h4 className="font-label-md text-label-md text-text-primary font-semibold line-clamp-1">{service.name}</h4>
                      {service.description ? <p className="font-caption text-caption text-text-secondary line-clamp-1">{service.description}</p> : null}
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-label-md text-label-md font-bold text-text-primary">{service.price > 0 ? naira(service.price) : ''}</span>
                        <span aria-hidden="true" className="w-8 h-8 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center">
                          <Icon name="chevron_right" className="text-[18px]" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
        <div className="h-2 w-full bg-surface-subtle" />
        <div className="px-margin py-space-md">
          <h3 className="font-heading-sm text-heading-sm text-text-primary mb-space-sm">Connect with {business.name}</h3>
          <ContactGrid business={business} chatOpen={chatOpen} onToggleChat={() => setChatOpen((open) => !open)} tone="spa" />
          {chatOpen ? <InAppChat business={business} onClose={() => setChatOpen(false)} onStarted={onChatStarted} /> : null}
        </div>
        {business.hours.length > 0 ? (
          <>
            <div className="h-2 w-full bg-surface-subtle" />
            <div className="px-margin py-space-md">
              <div className="flex items-center justify-between mb-space-sm">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Operating Hours</h3>
                <OpenBadge business={business} className="flex items-center gap-1 px-2.5 py-0.5 rounded-full font-caption text-caption font-medium" />
              </div>
              <div className="p-space-sm rounded-xl bg-surface-subtle flex flex-col gap-2 font-label-md text-label-md text-text-secondary">
                <HoursList business={business} rowClass="flex items-center justify-between" />
              </div>
            </div>
          </>
        ) : null}
        {addressLine(business) ? (
          <>
            <div className="h-2 w-full bg-surface-subtle" />
            <div className="px-margin py-space-md">
              <h3 className="font-heading-sm text-heading-sm text-text-primary mb-space-xs">Location</h3>
              <p className="font-body-md text-body-md text-text-secondary mb-space-sm">{[business.address, business.city, business.state].filter(Boolean).join(', ')}</p>
              {embed ? (
                <div className="w-full h-44 rounded-xl overflow-hidden shadow-sm bg-surface-tint-blue">
                  <iframe title={`Map showing ${business.name}`} className="w-full h-full border-0" src={embed} loading="lazy" />
                </div>
              ) : null}
              {map ? (
                <a
                  className="w-full mt-space-sm h-12 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 active:scale-95 transition-all"
                  href={map}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="map" className="text-[20px]" />
                  <span>Open in Navigation</span>
                </a>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
      {bestDeal ? (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface-canvas/95 backdrop-blur-lg border-t border-border-subtle px-margin py-3 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-space-sm">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                <span className="font-caption text-caption font-semibold text-badge-discount-text tracking-wide">SPECIAL OFFER</span>
              </div>
              <p className="font-label-md text-label-md font-bold text-text-primary truncate">{bestDeal.percent > 0 ? `Up to ${Math.round(bestDeal.percent)}% OFF Deals` : bestDeal.title}</p>
            </div>
            <button
              className="h-11 px-space-lg rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md active:scale-95 transition-transform flex items-center justify-center whitespace-nowrap"
              type="button"
              onClick={() => onClaim(toClaim(bestDeal, business), () => setClaimed((current) => ({ ...current, [bestDeal.id]: true })))}
            >
              {claimed[bestDeal.id] ? 'Claimed' : 'Claim Deal'}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export function BusinessProfileScreen({ business: selected, onBack, onClaim, onOpenDeal, onOpenItem, startChat, onChatStarted }: BusinessProfileScreenProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const { business, deals, products, services, loading, catalogueLoading, error, reload } = usePublicBusiness(selected?.slug ?? null);
  const liveDeals = useMemo(() => deals.map(toLiveDeal).filter((deal): deal is LiveDeal => Boolean(deal)), [deals]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url).then(
      () => {
        setLinkCopied(true);
        window.setTimeout(() => setLinkCopied(false), 1800);
      },
      () => undefined,
    );
  };

  if (error || (!loading && !business)) {
    return (
      <AppScreen>
        <div className="flex min-h-screen items-center justify-center bg-surface px-margin py-10">
          <div className="w-full max-w-[420px] rounded-3xl bg-surface-canvas p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-subtle text-primary">
              <Icon name="storefront" className="text-[32px]" />
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary">Storefront unavailable</h1>
            <p className="mt-3 font-body-md text-body-md text-text-secondary leading-relaxed">{error ?? 'This business profile couldn’t be loaded.'}</p>
            <button
              type="button"
              onClick={reload}
              className="mt-6 h-11 w-full rounded-xl bg-primary text-on-primary font-button-primary text-button-primary shadow-md active:scale-[0.98] transition-transform"
            >
              Try again
            </button>
            <button type="button" onClick={onBack} className="mt-3 h-11 w-full rounded-xl bg-surface-subtle text-text-primary font-button-secondary text-button-secondary">
              Go back
            </button>
          </div>
        </div>
      </AppScreen>
    );
  }

  // Businesses that only offer services use the services (spa) layout; everyone else the store layout.
  const servicesOnly = !catalogueLoading && services.length > 0 && products.length === 0;

  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs min-w-0 flex-1">
            <button
              aria-label="Go back"
              className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-variant/40 transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface tracking-tight truncate max-w-[200px]">{business?.name ?? 'Business Profile'}</h1>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              aria-label={linkCopied ? 'Link copied' : 'Share'}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-variant/40 transition-colors"
              type="button"
              onClick={handleShare}
            >
              <Icon name={linkCopied ? 'check' : 'share'} className="text-on-surface-variant text-[22px]" />
            </button>
          </div>
        </div>
        {linkCopied && (
          <div className="px-margin pb-2">
            <div role="status" className="bg-inverse-surface/95 text-inverse-on-surface rounded-lg px-3 py-1.5 font-caption text-caption flex items-center gap-1.5 w-fit">
              <Icon name="check" className="text-[14px]" />
              <span>Link copied</span>
            </div>
          </div>
        )}
      </header>
      {loading || !business ? (
        <main className="relative w-full pt-14 bg-surface min-h-screen">
          <SkeletonGroup label="Loading business" className="flex flex-col">
            <Skeleton className="w-full h-[210px] rounded-none" />
            <div className="px-margin -mt-7 relative z-10 space-y-4">
              <div className="bg-surface-canvas rounded-2xl p-5 shadow-sm space-y-3">
                <Skeleton className="w-16 h-16 rounded-2xl -mt-10" />
                <Skeleton className="h-7 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-[52px] w-full rounded-2xl" />
              <Skeleton className="h-[124px] w-full rounded-2xl" />
              <Skeleton className="h-[124px] w-full rounded-2xl" />
            </div>
          </SkeletonGroup>
        </main>
      ) : servicesOnly ? (
        <SpaProfile business={business} deals={liveDeals} products={products} services={services} catalogueLoading={catalogueLoading} onClaim={onClaim} onOpenDeal={onOpenDeal} onOpenItem={onOpenItem} startChat={startChat} onChatStarted={onChatStarted} />
      ) : (
        <UrbanProfile business={business} deals={liveDeals} products={products} services={services} catalogueLoading={catalogueLoading} onClaim={onClaim} onOpenDeal={onOpenDeal} onOpenItem={onOpenItem} startChat={startChat} onChatStarted={onChatStarted} />
      )}
    </AppScreen>
  );
}
