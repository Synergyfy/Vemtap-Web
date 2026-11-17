import { useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Skeleton, SkeletonGroup } from '../../components/ui/Skeleton';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { useCart } from '../../context/CartContext';
import { naira } from '../catalogueData';
import { businessMapEmbed, mapsLink, todayHours, usePublicBusiness, type PublicCatalogueItem } from '../../hooks/usePublicBusiness';
import { offerDiscountLabel, offerEndsLabel, offerImage, realOfferId, type OfferRecord } from '../../utils/homeOffer';
import { ordersService } from '../../services/ordersService';
import { SaveToggle } from '../../components/SaveToggle';
import { messageService } from '../../services/messageService';
import { ApiError, getAccessToken } from '../../services/api/client';
import type { ClaimDealSummary } from '../../components/desktop/dialogs/ClaimIdentityModal';

interface DesktopUrbanGrillStorefrontScreenProps {
  /** `slug` is the business's public code (`uniqueCode`); the page loads everything else live from it. */
  business?: { name?: string; slug?: string } | null;
  onNav: (key: DesktopNavKey) => void;
  activeNav?: DesktopNavKey;
  /** Opens the claim popup for exactly this deal. */
  onClaim?: (deal: ClaimDealSummary, onClaimed?: () => void) => void;
  /** Opens the deal page. */
  onOpenDeal?: (deal: ClaimDealSummary) => void;
  /** Opens the product/service page. */
  onOpenItem?: (itemId: string) => void;
  /** Review the tray and submit the order (goes to checkout). */
  onCheckout: () => void;
  /** Opens with the chat box ready, for a chat started from Messages. */
  startChat?: boolean;
  /** A first message was sent from that box. */
  onChatStarted?: (branchId: string) => void;
}

interface StorefrontDeal {
  id: string;
  badge: string;
  meta: string;
  metaIcon: string;
  title: string;
  price: number;
  was: number;
  image: string;
  alt: string;
  percent: number;
}

const toStorefrontDeal = (offer: OfferRecord): StorefrontDeal | null => {
  const id = realOfferId(offer);
  const title = typeof offer.name === 'string' ? offer.name.trim() : '';
  if (!id || !title) return null;
  const price = Number(offer.calculatedPrice ?? offer.price ?? 0) || 0;
  const original = Number(offer.originalPrice ?? 0) || 0;
  return {
    id,
    badge: offerDiscountLabel(offer),
    meta: offerEndsLabel(offer),
    metaIcon: 'timer',
    title,
    price,
    was: original > price ? original : 0,
    image: offerImage(offer),
    alt: title,
    percent: Number(offer.percentageOff ?? offer.discountPercent ?? 0) || 0,
  };
};

/** A simple icon per amenity the business listed (the text is always the business's own). */
const amenityIcon = (label: string) => {
  const text = label.toLowerCase();
  if (text.includes('wi')) return 'wifi';
  if (text.includes('park')) return 'local_parking';
  if (text.includes('card') || text.includes('pos')) return 'credit_card';
  if (text.includes('cash')) return 'payments';
  if (text.includes('takeaway') || text.includes('take-away')) return 'takeout_dining';
  if (text.includes('dine')) return 'restaurant';
  if (text.includes('deliver')) return 'delivery_dining';
  if (text.includes('outdoor') || text.includes('terrace')) return 'deck';
  if (text.includes('ac') || text.includes('air')) return 'ac_unit';
  if (text.includes('wheelchair') || text.includes('access')) return 'accessible';
  return 'check_circle';
};

const ALL = 'all';

export function DesktopUrbanGrillStorefrontScreen({ business: selected, onNav, activeNav = 'businesses', onClaim, onOpenDeal, onOpenItem, startChat, onChatStarted }: DesktopUrbanGrillStorefrontScreenProps) {
  const { business, deals, products, services, loading, catalogueLoading, error, reload } = usePublicBusiness(selected?.slug ?? null);
  const [category, setCategory] = useState<string>(ALL);
  const [query, setQuery] = useState('');
  const [claimedDeals, setClaimedDeals] = useState<Record<string, boolean>>({});
  const [shareNote, setShareNote] = useState<string | null>(null);
  const cart = useCart();

  // Guest checkout state
  const [guestCheckoutOpen, setGuestCheckoutOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const [orderBranchId, setOrderBranchId] = useState<string>('');
  const [orderError, setOrderError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<{ ref: string; branch: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Direct chat (live customer messaging)
  const [chatOpen, setChatOpen] = useState(Boolean(startChat));
  const [chatText, setChatText] = useState('');
  const [chatState, setChatState] = useState<{ kind: 'idle' | 'sending' | 'sent' | 'error'; message?: string }>({ kind: 'idle' });

  const storefrontDeals = useMemo(() => deals.map(toStorefrontDeal).filter((deal): deal is StorefrontDeal => Boolean(deal)), [deals]);
  const featuredDeal = useMemo(
    () => [...storefrontDeals].sort((a, b) => b.percent - a.percent)[0] ?? null,
    [storefrontDeals],
  );
  const catalogue = useMemo(() => [...products, ...services], [products, services]);
  const categories = useMemo(() => {
    const names = [...new Set(catalogue.map((item) => item.category).filter((name): name is string => Boolean(name)))];
    return [ALL, ...names];
  }, [catalogue]);
  const itemsById = useMemo(() => new Map(catalogue.map((item) => [item.id, item])), [catalogue]);
  // The tray is shared app-wide; this page shows (and orders) only this business's items.
  const trayLines = cart.lines.filter((line) => itemsById.has(line.id));
  const trayCount = trayLines.reduce((sum, line) => sum + line.qty, 0);
  const trayTotal = trayLines.reduce((sum, line) => sum + line.price * line.qty, 0);
  // An order goes to one branch: only branches that carry every item in the tray.
  const orderBranches = (business?.branches ?? []).filter((branch) => trayLines.every((line) => itemsById.get(line.id)?.branchIds.includes(branch.id)));

  const toClaim = (deal: StorefrontDeal): ClaimDealSummary => ({
    id: deal.id,
    title: deal.title,
    business: business?.name,
    location: business?.city ?? undefined,
    price: deal.price || undefined,
    oldPrice: deal.was || undefined,
    discountLabel: deal.badge,
    image: deal.image,
  });

  const addToTray = (item: PublicCatalogueItem) => {
    cart.add({
      id: item.id,
      productId: item.id,
      name: item.name,
      price: item.price,
      image: item.image ?? '',
      branchId: item.branchIds[0],
      merchantName: business?.name,
      merchantLogo: business?.logo ?? undefined,
      merchantPhone: business?.phone ?? undefined,
      merchantAddress: [business?.address, business?.city].filter(Boolean).join(', ') || undefined,
      merchantLatitude: business?.latitude ?? undefined,
      merchantLongitude: business?.longitude ?? undefined,
    });
  };

  const openCheckout = () => {
    setOrderError(null);
    setOrderBranchId(orderBranches[0]?.id ?? '');
    setGuestCheckoutOpen(true);
  };

  /** Sends the tray to the business as a real order — `POST /catalogue/orders` (source `storefront`). */
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const [firstName, ...rest] = guestName.trim().split(/\s+/);
    const lastName = rest.join(' ');
    if (!firstName || !lastName) {
      setOrderError('Please enter your first and last name.');
      return;
    }
    if (!guestPhone.trim()) return;
    if (!orderBranchId) {
      setOrderError('No single branch sells everything in your tray. Remove an item and try again.');
      return;
    }
    setIsSubmitting(true);
    setOrderError(null);
    try {
      const order = (await ordersService.createOrder({
        firstName,
        lastName,
        phone: guestPhone.trim(),
        notes: guestNotes.trim() || undefined,
        branchId: orderBranchId,
        source: 'storefront',
        items: trayLines.map((line) => ({ itemId: line.id, quantity: line.qty })),
      })) as unknown as Record<string, unknown> | null;
      const id = typeof order?.id === 'string' ? order.id : '';
      setConfirmedOrder({
        ref: id ? `#${id.slice(0, 8).toUpperCase()}` : 'Sent',
        branch: business?.branches.find((branch) => branch.id === orderBranchId)?.name ?? '',
      });
      trayLines.forEach((line) => cart.remove(line.id));
      setGuestCheckoutOpen(false);
    } catch (err) {
      setOrderError(err instanceof ApiError && err.message && !/^Request failed/.test(err.message) ? err.message : 'Your order couldn’t be sent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Starts a real chat with the business's main branch — `POST /customer/messaging/threads/start`. */
  const sendChat = async () => {
    const branchId = business?.branches[0]?.id;
    if (!chatText.trim() || !branchId) return;
    if (!getAccessToken()) {
      setChatState({ kind: 'error', message: 'Please sign in to message this business.' });
      return;
    }
    setChatState({ kind: 'sending' });
    try {
      await messageService.startConversation({ branchId, content: chatText.trim() });
      setChatText('');
      setChatState({ kind: 'sent' });
      onChatStarted?.(branchId);
    } catch (err) {
      setChatState({ kind: 'error', message: err instanceof ApiError && err.message && !/^Request failed/.test(err.message) ? err.message : 'Your message couldn’t be sent. Please try again.' });
    }
  };

  const shareStorefront = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url).then(
      () => setShareNote('Link copied'),
      () => setShareNote('Couldn’t copy the link'),
    );
    window.setTimeout(() => setShareNote(null), 2200);
  };

  const visibleProducts = catalogue.filter(
    (item) =>
      (category === ALL || item.category === category) &&
      (!query.trim() || item.name.toLowerCase().includes(query.trim().toLowerCase()) || (item.description ?? '').toLowerCase().includes(query.trim().toLowerCase())),
  );

  const resultsLabel =
    query.trim() || category !== ALL ? `Showing ${visibleProducts.length} matching items` : `Showing ${visibleProducts.length} items`;

  const containerClass = 'flex gap-5 overflow-x-auto pb-2 no-scrollbar';

  if (loading || error || !business) {
    return (
      <DesktopPage withHeader withFooter onNav={onNav} activeNav={activeNav}>
        <div className="w-full min-h-[calc(100vh-80px)] bg-surface">
          {loading ? (
            <SkeletonGroup label="Loading business" className="max-w-7xl w-full mx-auto px-6 lg:px-12 pt-6 pb-16 space-y-8">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-72 md:h-96 w-full rounded-2xl" />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <div className="flex gap-4">
                    {[0, 1, 2].map((key) => <Skeleton key={key} className="h-28 w-[320px] rounded-2xl" />)}
                  </div>
                  <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
                <div className="lg:col-span-4 space-y-4">
                  <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
              </div>
            </SkeletonGroup>
          ) : (
            <div className="px-6 py-16">
              <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl bg-surface-canvas p-10 text-center shadow-sm">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-subtle text-primary">
                  <Icon name="storefront" className="text-[32px]" />
                </div>
                <h1 className="font-heading-lg text-heading-lg text-text-primary">Storefront not available</h1>
                <p className="mt-3 max-w-md font-body-md text-body-md text-text-secondary leading-relaxed">
                  {error ?? 'There is no live storefront selected yet. Choose a business from discover.'}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={reload}
                    className="h-11 rounded-xl bg-primary px-5 text-on-primary font-button-primary text-button-primary shadow-md transition-transform active:scale-[0.98]"
                  >
                    Try again
                  </button>
                  <button
                    type="button"
                    onClick={() => onNav('discover')}
                    className="h-11 rounded-xl bg-surface-subtle px-5 text-text-primary font-button-secondary text-button-secondary transition-colors hover:bg-surface-container-high"
                  >
                    Browse businesses
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DesktopPage>
    );
  }

  const status = todayHours(business.hours);
  const thumbnails = business.gallery.slice(0, 3);
  const morePhotos = Math.max(0, business.gallery.length - thumbnails.length);
  const map = mapsLink(business);
  const mapEmbed = businessMapEmbed(business);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const fullAddress = [business.address, business.city, business.state].filter(Boolean).join(', ');

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav={activeNav}>
      <div className="w-full bg-surface">
        <div className="max-w-7xl w-full mx-auto px-6 lg:px-12 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <nav className="flex items-center gap-2 font-caption text-caption text-text-secondary">
              <button type="button" onClick={() => onNav('discover')} className="hover:text-primary transition-colors flex items-center gap-1">
                <Icon name="home" className="text-[15px]" />
                <span>{business.city ?? 'Discover'}</span>
              </button>
              {business.category ? (
                <>
                  <span className="text-outline-variant">/</span>
                  <button type="button" onClick={() => onNav('discover')} className="hover:text-primary transition-colors">
                    {business.category}
                  </button>
                </>
              ) : null}
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface font-semibold">{business.name}</span>
            </nav>
            {status ? (
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${status.openNow ? 'bg-emerald-500 animate-pulse' : 'bg-outline'}`} />
                <span className={`font-label-sm text-label-sm font-semibold px-2.5 py-1 rounded-full ${status.openNow ? 'text-emerald-700 bg-badge-discount-bg' : 'text-text-secondary bg-surface-subtle'}`}>
                  {status.openNow ? 'Open now' : 'Closed now'}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <section className="max-w-7xl w-full mx-auto px-6 lg:px-12 pb-8">
          <div className="relative w-full rounded-2xl overflow-hidden shadow-sm bg-surface-canvas">
            <div className="relative h-72 md:h-96 w-full overflow-hidden bg-surface-tint-blue">
              {business.cover ? (
                <div
                  aria-hidden="true"
                  className="bg-cover bg-center w-full h-full transform hover:scale-105 transition-transform duration-700"
                  style={{ backgroundImage: `url('${business.cover}')` }}
                  title={`${business.name} cover photo`}
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/35 to-transparent" />

              <div className="absolute top-4 right-4 flex items-center gap-2">
                {shareNote ? (
                  <span role="status" className="px-3 py-1.5 rounded-xl bg-inverse-surface text-inverse-on-surface font-caption text-caption font-semibold shadow-md">
                    {shareNote}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={shareStorefront}
                  title="Share Storefront"
                  aria-label="Share Storefront"
                  className="p-2.5 rounded-xl bg-surface-canvas/90 backdrop-blur-md text-on-surface hover:text-primary hover:bg-surface-canvas shadow-md transition-all flex items-center justify-center"
                >
                  <Icon name="share" className="text-[20px]" />
                </button>
              </div>

              {thumbnails.length > 0 ? (
                <div className="absolute bottom-4 right-6 hidden md:flex items-center gap-2 p-1.5 rounded-xl bg-surface-canvas/90 backdrop-blur-md shadow-md">
                  {thumbnails.map((src, index) => (
                    <a
                      key={src}
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                      className={`w-14 h-14 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 ${index === 0 ? 'ring-2 ring-primary-container' : ''}`}
                    >
                      <img alt={`${business.name} photo ${index + 1}`} className="w-full h-full object-cover" src={src} />
                    </a>
                  ))}
                  {morePhotos > 0 ? (
                    <div className="px-2.5 flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant font-medium">
                      <Icon name="photo_library" className="text-[16px]" />
                      <span>+{morePhotos}</span>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="absolute bottom-6 left-6 md:left-8 right-6 md:right-80">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {business.verified ? (
                    <span className="px-2.5 py-1 rounded-md bg-primary-container text-on-primary-container font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-sm">
                      <Icon name="verified" className="text-[16px]" />
                      <span>VEMTAP Verified</span>
                    </span>
                  ) : null}
                  {business.subcategory ?? business.category ? (
                    <span className="px-2.5 py-1 rounded-md bg-surface-canvas/90 backdrop-blur text-on-surface font-caption text-caption font-semibold flex items-center gap-1">
                      <Icon name="category" className="text-[15px] text-primary" />
                      <span>{business.subcategory ?? business.category}</span>
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  {business.logo ? <img alt={`${business.name} logo`} className="w-14 h-14 rounded-xl object-cover shadow-md bg-surface-canvas" src={business.logo} /> : null}
                  <SaveToggle
                    kind="businesses"
                    id={business.id}
                    name={business.name}
                    className="w-10 h-10 shrink-0 rounded-full bg-surface-canvas text-primary flex items-center justify-center shadow-md disabled:opacity-60"
                  />
                  <h1 className="font-display-hero text-display-hero text-on-primary drop-shadow-md">{business.name}</h1>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-surface-canvas">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-y-2 gap-x-5 font-body-md text-body-md text-text-secondary">
                  {fullAddress ? (
                    <div className="flex items-center gap-1.5 text-on-surface font-medium">
                      <Icon name="location_on" className="text-primary text-[19px]" />
                      <span>{fullAddress}</span>
                    </div>
                  ) : null}
                  {business.phone ? (
                    <div className="flex items-center gap-1.5 text-on-surface">
                      <Icon name="call" className="text-primary text-[19px]" />
                      <a className="hover:text-primary transition-colors" href={`tel:${business.phone.replace(/[^\d+]/g, '')}`}>
                        {business.phone}
                      </a>
                    </div>
                  ) : null}
                  {status ? (
                    <div className="flex items-center gap-1.5 font-medium">
                      <Icon name="schedule" className={`${status.openNow ? 'text-emerald-600' : 'text-text-tertiary'} text-[19px]`} />
                      <span className={status.openNow ? 'text-emerald-700 font-semibold' : 'text-text-secondary font-semibold'}>{status.openNow ? 'Open Now' : 'Closed Now'}</span>
                      <span className="text-text-tertiary">•</span>
                      <span>{status.today.closed ? 'Closed today' : `Today ${status.today.label}`}</span>
                    </div>
                  ) : null}
                </div>
                {business.description ? (
                  <p className="font-body-md text-body-md text-text-secondary max-w-3xl">{business.description}</p>
                ) : null}
              </div>

              <div className="flex flex-col items-stretch gap-3 shrink-0">
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                  {business.whatsapp ? (
                    <a
                      className="px-5 py-3 rounded-xl bg-emerald-600 text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm w-full sm:w-auto"
                      href={`https://wa.me/${business.whatsapp.replace(/[^\d]/g, '')}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Icon name="chat" className="text-[20px]" />
                      <span>WhatsApp</span>
                    </a>
                  ) : null}
                  {business.branches.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setChatOpen((open) => !open);
                        setChatState({ kind: 'idle' });
                      }}
                      className="px-5 py-3 rounded-xl bg-primary-container text-on-primary-container font-button-primary text-button-primary flex items-center justify-center gap-2 hover:opacity-95 shadow-md hover:scale-[0.99] transition-all w-full sm:w-auto"
                    >
                      <Icon name="forum" className="text-[20px]" />
                      <span>Direct Chat on VEMTAP</span>
                    </button>
                  ) : null}
                </div>
                {chatOpen ? (
                  <div className="w-full sm:w-[420px] rounded-xl bg-surface-subtle p-3 space-y-2">
                    {chatState.kind === 'sent' ? (
                      <div className="flex items-center justify-between gap-2">
                        <p role="status" className="font-body-md text-body-md text-badge-discount-text">Message sent to {business.name}.</p>
                        <button type="button" onClick={() => onNav('messages')} className="font-label-md text-label-md text-primary font-semibold hover:underline shrink-0">
                          Open Messages
                        </button>
                      </div>
                    ) : (
                      <>
                        <textarea
                          aria-label={`Message ${business.name}`}
                          rows={2}
                          maxLength={1000}
                          value={chatText}
                          onChange={(event) => setChatText(event.target.value)}
                          placeholder={`Ask ${business.name} a question…`}
                          className="w-full resize-none rounded-lg bg-surface-canvas px-3 py-2 font-body-md text-body-md text-on-surface placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-primary-container/20"
                        />
                        <div className="flex items-center justify-between gap-2">
                          {chatState.kind === 'error' ? <p role="alert" className="font-caption text-caption text-error">{chatState.message}</p> : <span />}
                          <button
                            type="button"
                            disabled={!chatText.trim() || chatState.kind === 'sending'}
                            onClick={() => void sendChat()}
                            className="h-9 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold disabled:opacity-50 shrink-0"
                          >
                            {chatState.kind === 'sending' ? 'Sending…' : 'Send'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {featuredDeal ? (
          <section className="max-w-7xl w-full mx-auto px-6 lg:px-12 pb-8">
            <div className="rounded-2xl p-6 md:p-7 bg-gradient-to-r from-primary via-primary-container to-secondary flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md text-on-primary relative overflow-hidden">
              <div className="absolute -right-8 -bottom-10 w-52 h-52 rounded-full bg-on-primary/10 blur-2xl pointer-events-none" />
              <div className="flex items-start md:items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-surface-canvas/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  <Icon name="local_offer" className="text-on-primary text-[28px]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-caption text-caption uppercase tracking-wider font-bold bg-surface-canvas text-primary">
                      VEMTAP Deal
                    </span>
                    <span className="font-caption text-caption opacity-90">{featuredDeal.meta}</span>
                  </div>
                  <h3 className="font-heading-md text-heading-md font-bold tracking-tight text-on-primary">
                    {featuredDeal.title} — {featuredDeal.badge}
                  </h3>
                  {featuredDeal.price > 0 ? (
                    <p className="font-body-md text-body-md text-on-primary/80">
                      Now <span className="font-bold text-on-primary underline decoration-2">{naira(featuredDeal.price)}</span>
                      {featuredDeal.was > 0 ? ` (was ${naira(featuredDeal.was)}).` : '.'}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="relative z-10 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => onClaim?.(toClaim(featuredDeal), () => setClaimedDeals((state) => ({ ...state, [featuredDeal.id]: true })))}
                  className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-surface-canvas text-primary font-button-primary text-button-primary hover:bg-surface-tint-blue shadow-lg hover:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Icon name="confirmation_number" className="text-[19px]" />
                  <span>{claimedDeals[featuredDeal.id] ? 'Claimed' : 'Claim Voucher'}</span>
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <section className="max-w-7xl w-full mx-auto px-6 lg:px-12 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 px-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading-md text-heading-md text-on-surface">Active Deals</h2>
                    {!catalogueLoading ? (
                      <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-caption text-caption font-bold">{storefrontDeals.length}</span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => onNav('deals')}
                    className="h-9 px-4 rounded-full bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold flex items-center gap-1 hover:bg-primary hover:text-on-primary transition-colors shrink-0"
                  >
                    See All Deals
                    <Icon name="chevron_right" className="text-[18px]" />
                  </button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {catalogueLoading ? (
                    [0, 1, 2].map((key) => <Skeleton key={key} className="w-[320px] h-[120px] shrink-0 rounded-2xl" />)
                  ) : storefrontDeals.length === 0 ? (
                    <div className="w-full rounded-2xl border border-dashed border-primary/20 bg-surface-subtle p-5 text-text-secondary font-body-md text-body-md">
                      {business.name} has no live deals right now.
                    </div>
                  ) : (
                    storefrontDeals.map((deal) => (
                      <div
                        key={deal.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onOpenDeal?.(toClaim(deal))}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onOpenDeal?.(toClaim(deal));
                          }
                        }}
                        className="w-[320px] shrink-0 bg-surface-canvas rounded-2xl p-3 shadow-sm hover:shadow-md transition-all flex items-center gap-3 cursor-pointer"
                      >
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-surface-container-high">
                          <img alt={deal.alt} className="w-full h-full object-cover" src={deal.image} />
                          <span className="absolute top-1.5 left-1.5 bg-badge-discount-bg text-badge-discount-text font-label-sm text-caption px-1.5 py-0.5 rounded font-semibold">
                            {deal.badge}
                          </span>
                        </div>
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <div className="flex items-center gap-1 text-tertiary font-caption text-caption mb-0.5">
                              <Icon name={deal.metaIcon} className="text-[14px]" />
                              <span>{deal.meta}</span>
                            </div>
                            <h3 className="font-label-md text-label-md text-text-primary font-semibold truncate">{deal.title}</h3>
                          </div>
                          <div className="flex items-end justify-between mt-2 gap-2">
                            <div>
                              {deal.price > 0 ? <div className="font-heading-sm text-heading-sm text-text-primary">{naira(deal.price)}</div> : null}
                              {deal.was > 0 ? <div className="font-caption text-caption text-text-tertiary line-through -mt-0.5">{naira(deal.was)}</div> : null}
                            </div>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onClaim?.(toClaim(deal), () => setClaimedDeals((state) => ({ ...state, [deal.id]: true })));
                              }}
                              className={`h-8 px-4 rounded-xl font-label-sm text-label-sm flex items-center justify-center active:scale-95 transition-transform shadow-sm shrink-0 ${
                                claimedDeals[deal.id]
                                  ? 'bg-badge-discount-bg text-badge-discount-text'
                                  : 'bg-primary-container text-on-primary hover:bg-primary hover:text-on-primary'
                              }`}
                            >
                              {claimedDeals[deal.id] ? 'Claimed' : 'Claim'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-surface-canvas p-4 rounded-2xl shadow-sm flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:flex-1">
                    <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]" />
                    <input
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-subtle text-on-surface placeholder:text-text-tertiary font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all"
                      id="menu-search-input"
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={`Search ${business.name}'s products and services...`}
                      type="text"
                      value={query}
                    />
                  </div>
                </div>

                {categories.length > 1 ? (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {categories.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCategory(item)}
                        className={`px-4 py-2 rounded-full font-label-md text-label-md font-semibold whitespace-nowrap transition-all ${
                          category === item ? 'bg-surface-tint-blue text-primary-container shadow-xs' : 'text-text-secondary hover:text-on-surface bg-surface-subtle'
                        }`}
                      >
                        {item === ALL ? `All Items (${catalogue.length})` : item}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-4 px-1">
                <div>
                  <h2 className="font-heading-md text-heading-md text-on-surface">Products &amp; Services</h2>
                  <p className="font-caption text-caption text-text-secondary">Prices displayed in Nigerian Naira (₦).</p>
                </div>
                {!catalogueLoading ? <span className="font-label-sm text-label-sm text-text-secondary shrink-0">{resultsLabel}</span> : null}
              </div>

              <div className={containerClass}>
                {catalogueLoading ? (
                  [0, 1, 2].map((key) => <Skeleton key={key} className="w-[300px] h-[300px] shrink-0 rounded-2xl" />)
                ) : visibleProducts.length === 0 ? (
                  <div className="w-full rounded-2xl border border-dashed border-primary/20 bg-surface-subtle p-5 text-text-secondary font-body-md text-body-md">
                    {catalogue.length === 0 ? `${business.name} hasn’t listed any products or services yet.` : 'No items match your search.'}
                  </div>
                ) : (
                  visibleProducts.map((product) => (
                    <div
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
                      className="group w-[300px] shrink-0 bg-surface-canvas rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        <div className="relative h-44 w-full overflow-hidden bg-surface-container flex items-center justify-center">
                          {product.image ? (
                            <img alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={product.image} />
                          ) : (
                            <Icon name={product.kind === 'service' ? 'room_service' : 'inventory_2'} className="text-[40px] text-outline" />
                          )}
                          {product.kind === 'service' ? (
                            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full font-caption text-caption font-semibold shadow-sm bg-surface-tint-blue text-primary">Service</span>
                          ) : null}
                          {product.category ? (
                            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md font-caption text-caption bg-inverse-surface/85 backdrop-blur text-inverse-on-surface">
                              {product.category}
                            </span>
                          ) : null}
                        </div>
                        <div className="p-4 space-y-2">
                          <h3 className="font-heading-sm text-heading-sm text-on-surface group-hover:text-primary transition-colors">{product.name}</h3>
                          {product.description ? <p className="font-caption text-caption text-text-secondary line-clamp-2">{product.description}</p> : null}
                        </div>
                      </div>
                      <div className="p-4 pt-0">
                        <div className="flex items-center justify-between pt-3">
                          <span className="font-heading-sm text-heading-sm text-on-surface font-bold">{product.price > 0 ? naira(product.price) : ''}</span>
                          {product.kind === 'product' && product.price > 0 ? (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                addToTray(product);
                              }}
                              className="h-10 px-3.5 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold hover:opacity-95 shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
                            >
                              <Icon name={cart.qtyOf(product.id) > 0 ? 'check' : 'add'} className="text-[18px]" />
                              <span>{cart.qtyOf(product.id) > 0 ? `In Tray (${cart.qtyOf(product.id)})` : 'Add'}</span>
                            </button>
                          ) : (
                            <span className="font-label-sm text-label-sm text-primary font-semibold">View details</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="shopping_bag" className="text-primary text-[22px]" />
                    <h3 className="font-heading-sm text-heading-sm text-on-surface">Your Tray Selection</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-caption text-caption text-primary font-bold">
                    {trayCount} {trayCount === 1 ? 'Item' : 'Items'}
                  </span>
                </div>
                <div className="space-y-3 py-2">
                  {trayLines.length === 0 ? (
                    <div className="py-6 text-center text-text-tertiary flex flex-col items-center gap-2">
                      <Icon name="shopping_bag" className="text-[36px] text-surface-variant" />
                      <p className="font-body-md text-body-md text-text-secondary">Select any product to start an in-store or pickup order.</p>
                    </div>
                  ) : (
                    trayLines.map((line) => (
                      <div key={line.id} className="flex items-center gap-3 py-2 border-b border-border-subtle/50 last:border-0">
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-surface-container shrink-0 flex items-center justify-center">
                          {line.image ? <img src={line.image} alt={line.name} className="w-full h-full object-cover" /> : <Icon name="inventory_2" className="text-[20px] text-outline" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-label-md text-label-md text-on-surface font-semibold truncate">{line.name}</p>
                          <p className="font-caption text-caption text-text-secondary">{naira(line.price)} each</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            aria-label={`Decrease ${line.name} quantity`}
                            onClick={() => cart.decrement(line.id)}
                            className="w-7 h-7 rounded-lg bg-surface-subtle flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
                          >
                            <Icon name="remove" className="text-[15px]" />
                          </button>
                          <span className="font-label-md text-label-md text-on-surface font-bold min-w-[16px] text-center">{line.qty}</span>
                          <button
                            type="button"
                            aria-label={`Increase ${line.name} quantity`}
                            onClick={() => cart.increment(line.id)}
                            className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center hover:opacity-95 transition-all"
                          >
                            <Icon name="add" className="text-[15px]" />
                          </button>
                        </div>
                        <span className="font-label-md text-label-md text-on-surface font-bold shrink-0 w-20 text-right">{naira(line.price * line.qty)}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between font-body-md text-body-md text-text-secondary">
                    <span>Estimated Subtotal</span>
                    <span className="font-semibold text-on-surface">{naira(trayTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between font-caption text-caption text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Icon name="credit_card_off" className="text-[15px]" />
                      <span>Pay at the store</span>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={trayLines.length === 0}
                  onClick={openCheckout}
                  className="w-full py-3.5 rounded-xl bg-primary-container text-on-primary-container font-button-primary text-button-primary disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Icon name="send" className="text-[19px]" />
                  <span>Submit Order to Store</span>
                </button>
              </div>

              <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading-sm text-heading-sm text-on-surface">Location &amp; Access</h3>
                  {business.city ? <span className="font-caption text-caption text-primary font-semibold">{business.city}</span> : null}
                </div>
                <div className="w-full h-44 rounded-xl bg-surface-tint-blue overflow-hidden shadow-inner relative flex items-end p-3">
                  {mapEmbed ? (
                    <iframe
                      title={`Map showing ${business.name}`}
                      className="absolute inset-0 w-full h-full border-0"
                      src={mapEmbed}
                      loading="lazy"
                    />
                  ) : (
                    <Icon name="map" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[56px] text-primary/30" />
                  )}
                  <div className={`relative z-10 w-full flex items-center justify-between gap-2 ${mapEmbed ? 'bg-surface-canvas/90 backdrop-blur-sm rounded-lg px-2.5 py-2 shadow-sm' : ''}`}>
                    <div className="text-on-surface min-w-0">
                      <p className="font-label-sm text-label-sm font-bold truncate">{business.address ?? business.name}</p>
                      {business.city || business.state ? (
                        <p className="font-caption text-caption text-text-secondary truncate">{[business.city, business.state].filter(Boolean).join(', ')}</p>
                      ) : null}
                    </div>
                    {map ? (
                      <a
                        className="px-3 py-1.5 rounded-lg bg-surface-canvas text-on-surface font-caption text-caption font-semibold hover:bg-surface-tint-blue shadow-md transition-all flex items-center gap-1 shrink-0"
                        href={map}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Icon name="directions" className="text-[15px] text-primary" />
                        <span>Directions</span>
                      </a>
                    ) : null}
                  </div>
                </div>

                {business.branches.length > 1 ? (
                  <div className="space-y-1.5">
                    <h4 className="font-label-md text-label-md font-semibold text-on-surface">Branches</h4>
                    {business.branches.map((branch) => (
                      <p key={branch.id} className="font-caption text-caption text-text-secondary">
                        <span className="font-semibold text-on-surface">{branch.name}</span>
                        {branch.address || branch.city ? ` · ${[branch.address, branch.city].filter(Boolean).join(', ')}` : ''}
                      </p>
                    ))}
                  </div>
                ) : null}

                {business.hours.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <h4 className="font-label-md text-label-md font-semibold text-on-surface">Weekly Schedule</h4>
                    <div className="space-y-1.5 font-caption text-caption text-text-secondary">
                      {business.hours.map((row) => (
                        <div
                          key={row.day}
                          className={`flex items-center justify-between py-1 px-2.5 rounded-lg ${row.day === today ? 'bg-surface-tint-blue font-semibold text-primary' : ''}`}
                        >
                          <span>{row.day}</span>
                          <span>{row.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {business.amenities.length > 0 ? (
                  <div className="space-y-2.5 pt-2">
                    <h4 className="font-label-md text-label-md font-semibold text-on-surface">Venue Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {business.amenities.map((amenity) => (
                        <span key={amenity} className="px-3 py-1 rounded-full bg-surface-subtle text-text-secondary font-caption text-caption flex items-center gap-1">
                          <Icon name={amenityIcon(amenity)} className="text-[15px] text-primary" />
                          <span>{amenity}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="pt-4 border-t border-border-subtle/50">
                  <button
                    type="button"
                    onClick={() => onNav('for-business')}
                    className="font-label-sm text-label-sm text-text-secondary hover:text-primary transition-colors flex items-center justify-between w-full"
                  >
                    <span>Own this business? Manage it on VEMTAP</span>
                    <Icon name="chevron_right" className="text-[16px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Guest Checkout Modal */}
      {guestCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setGuestCheckoutOpen(false)} />
          <form
            onSubmit={(event) => void handleSubmitOrder(event)}
            className="relative w-full max-w-md bg-surface-canvas rounded-2xl shadow-2xl p-space-xl border border-border-subtle z-10 space-y-space-md"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name="receipt_long" className="text-[20px]" />
                </div>
                <div>
                  <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">Confirm Your Order</h3>
                  <p className="text-caption text-text-secondary">You'll collect &amp; pay in-store. No online payment.</p>
                </div>
              </div>
              <button type="button" onClick={() => setGuestCheckoutOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle">
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            {/* Order summary */}
            <div className="rounded-xl bg-surface-subtle border border-border-subtle p-3 space-y-1.5">
              {trayLines.map((line) => (
                <div key={line.id} className="flex items-center justify-between text-body-sm">
                  <span className="text-text-primary">{line.name} × {line.qty}</span>
                  <span className="font-semibold text-text-primary">{naira(line.price * line.qty)}</span>
                </div>
              ))}
              <div className="border-t border-border-subtle mt-2 pt-2 flex justify-between font-bold text-body-md">
                <span>Total (Est.)</span>
                <span className="text-primary">{naira(trayTotal)}</span>
              </div>
            </div>

            {business.branches.length > 1 ? (
              <div className="space-y-1">
                <label htmlFor="order-branch" className="text-caption font-semibold text-text-primary">Pickup branch *</label>
                <select
                  id="order-branch"
                  value={orderBranchId}
                  onChange={(event) => setOrderBranchId(event.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-md"
                >
                  {orderBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="space-y-1">
              <label className="text-caption font-semibold text-text-primary">Your Name (first and last) *</label>
              <input
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Amina Bello"
                autoComplete="name"
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-md"
              />
            </div>

            <div className="space-y-1">
              <label className="text-caption font-semibold text-text-primary">Phone Number *</label>
              <input
                required
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                autoComplete="tel"
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-md"
              />
            </div>

            <div className="space-y-1">
              <label className="text-caption font-semibold text-text-primary">Special Instructions (Optional)</label>
              <textarea
                rows={2}
                value={guestNotes}
                onChange={(e) => setGuestNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-md resize-none"
              />
            </div>

            {orderError ? (
              <p role="alert" className="text-caption text-error">{orderError}</p>
            ) : (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
                <Icon name="info" className="text-[15px] text-amber-600 shrink-0 mt-0.5" />
                <p className="text-caption text-amber-700">You will pay and collect your order at the store counter. Please show your order reference to the cashier.</p>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setGuestCheckoutOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary hover:bg-surface-subtle text-label-md font-semibold">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-md font-semibold shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><Icon name="sync" className="text-[16px] animate-spin" /> Submitting...</> : <><Icon name="check_circle" className="text-[16px]" /> Submit Order</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Order Confirmed Overlay */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" />
          <div className="relative w-full max-w-sm bg-surface-canvas rounded-2xl shadow-2xl p-space-xl border border-border-subtle z-10 flex flex-col items-center text-center gap-space-md">
            <div className="w-20 h-20 rounded-full bg-badge-discount-bg flex items-center justify-center">
              <Icon name="check_circle" className="text-[48px] text-badge-discount-text" />
            </div>
            <div>
              <h2 className="text-heading-xl font-heading-xl font-bold text-text-primary">Order Submitted!</h2>
              <p className="text-body-sm text-text-secondary mt-1">Your order has been sent to {business.name}.</p>
            </div>
            <div className="w-full p-4 rounded-xl bg-surface-tint-blue/20 border border-primary/30">
              <p className="text-caption text-text-tertiary font-medium">Your Order Reference</p>
              <p className="text-heading-xl font-heading-xl font-bold text-primary tracking-widest mt-1">{confirmedOrder.ref}</p>
              <p className="text-caption text-text-secondary mt-2">Show this to the cashier to collect your order &amp; pay.</p>
            </div>
            {confirmedOrder.branch ? (
              <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle w-full text-left">
                <div className="flex items-center gap-2 text-caption text-text-secondary">
                  <Icon name="location_on" className="text-[14px]" />
                  <span>Pickup at <strong>{confirmedOrder.branch}</strong></span>
                </div>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setConfirmedOrder(null)}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-md font-semibold shadow-sm transition-all"
            >
              Done — Back to Store
            </button>
          </div>
        </div>
      )}
    </DesktopPage>
  );
}
