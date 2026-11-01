import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Skeleton, SkeletonGroup } from '../../components/ui/Skeleton';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { naira } from '../catalogueData';
import { placePublicOrder, usePublicCatalogueItem } from '../../hooks/usePublicCatalogueItem';
import { todayHours, usePublicBusiness } from '../../hooks/usePublicBusiness';
import { messageService } from '../../services/messageService';
import { ApiError, getAccessToken } from '../../services/api/client';

interface DesktopProductDetailScreenProps {
  /** The item from the URL (`/business/<code>/products/<itemId>`). */
  itemId: string | null;
  businessCode: string | null;
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
  onOpenBusiness: () => void;
  onOpenItem: (itemId: string) => void;
}

type Fulfillment = 'pickup' | 'dine-in';

const FULFILLMENT: { key: Fulfillment; icon: string; label: string }[] = [
  { key: 'pickup', icon: 'storefront', label: 'Self Pickup' },
  { key: 'dine-in', icon: 'table_bar', label: 'Dine-In Table' },
];

export function DesktopProductDetailScreen({ itemId, businessCode, onNav, onBack, onOpenBusiness, onOpenItem }: DesktopProductDetailScreenProps) {
  const { item, loading, error, reload } = usePublicCatalogueItem(itemId);
  const { business, products, services } = usePublicBusiness(businessCode);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [fulfillment, setFulfillment] = useState<Fulfillment>('pickup');
  const [tableNumber, setTableNumber] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [branchId, setBranchId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatText, setChatText] = useState('');
  const [chatState, setChatState] = useState<{ kind: 'idle' | 'sending' | 'sent' | 'error'; message?: string }>({ kind: 'idle' });

  useEffect(() => {
    setSelectedImage(0);
    setQty(1);
    setOrderRef(null);
    setOrderError(null);
    setBranchId(item?.branches[0]?.id ?? '');
  }, [item?.id, item?.branches]);

  const recommendations = useMemo(
    () => [...products, ...services].filter((entry) => entry.id !== itemId).slice(0, 4),
    [products, services, itemId],
  );

  if (loading || error || !item) {
    return (
      <DesktopPage withHeader withFooter onNav={onNav} activeNav="businesses">
        <div className="w-full bg-surface">
          <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-8">
            {loading ? (
              <SkeletonGroup label="Loading item" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-4">
                  <Skeleton className="h-4 w-72" />
                  <Skeleton className="w-full h-[400px] sm:h-[480px] rounded-3xl" />
                  <Skeleton className="h-40 w-full rounded-3xl" />
                </div>
                <Skeleton className="lg:col-span-5 h-[520px] rounded-3xl" />
              </SkeletonGroup>
            ) : (
              <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl bg-surface-canvas p-10 text-center shadow-sm">
                <Icon name="inventory_2" className="text-[32px] text-primary" />
                <h1 className="mt-3 font-heading-lg text-heading-lg text-text-primary">Item not available</h1>
                <p className="mt-2 font-body-md text-body-md text-text-secondary">{error ?? 'This item couldn’t be loaded.'}</p>
                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={reload} className="h-11 rounded-xl bg-primary px-5 text-on-primary font-button-primary text-button-primary">Try again</button>
                  <button type="button" onClick={onBack} className="h-11 rounded-xl bg-surface-subtle px-5 text-text-primary font-button-secondary text-button-secondary">Go back</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DesktopPage>
    );
  }

  const isService = item.kind === 'service';
  const images = item.images;
  const mainImage = images[selectedImage] ?? images[0];
  const status = business ? todayHours(business.hours) : null;
  const total = item.unitPrice * qty;
  const fulfillmentOptions = FULFILLMENT.filter((method) => method.key === 'pickup' || item.modes.some((mode) => mode.includes('dine')));
  const markers = [
    { icon: isService ? 'room_service' : 'inventory_2', label: 'Type', value: isService ? 'Service' : 'Product' },
    item.category ? { icon: 'category', label: 'Category', value: item.category } : null,
    item.duration ? { icon: 'hourglass_top', label: 'Duration', value: item.duration } : null,
    item.stockLabel ? { icon: 'inventory', label: 'Availability', value: item.stockLabel } : null,
    item.brand ? { icon: 'verified', label: 'Brand', value: item.brand } : null,
  ].filter((marker): marker is { icon: string; label: string; value: string } => Boolean(marker));

  const submitOrder = async () => {
    setSubmitting(true);
    setOrderError(null);
    try {
      if (isService && (!bookingDate || !bookingTime)) throw new Error('Choose a date and time for your booking.');
      if (!isService && fulfillment === 'dine-in' && !tableNumber.trim()) throw new Error('Enter your table number.');
      const ref = await placePublicOrder({
        itemId: item.id,
        quantity: qty,
        branchId,
        fullName,
        phone,
        notes: instructions,
        tableNumber: !isService && fulfillment === 'dine-in' ? tableNumber : undefined,
        bookingDate: isService ? bookingDate : undefined,
        bookingTime: isService ? bookingTime : undefined,
      });
      setOrderRef(ref);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Your order couldn’t be sent.');
    } finally {
      setSubmitting(false);
    }
  };

  const sendChat = async () => {
    if (!chatText.trim() || !branchId) return;
    if (!getAccessToken()) {
      setChatState({ kind: 'error', message: 'Please sign in to message this business.' });
      return;
    }
    setChatState({ kind: 'sending' });
    try {
      await messageService.startConversation({ branchId, content: `About “${item.name}”: ${chatText.trim()}` });
      setChatText('');
      setChatState({ kind: 'sent' });
    } catch (err) {
      setChatState({ kind: 'error', message: err instanceof ApiError && err.message && !/^Request failed/.test(err.message) ? err.message : 'Your message couldn’t be sent.' });
    }
  };

  const businessName = business?.name ?? 'Business';

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="businesses">
      <div className="w-full bg-surface">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-8">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 mb-6">
            <button type="button" onClick={() => onNav('discover')} className="font-label-sm text-label-sm text-text-secondary hover:text-primary transition-colors">
              Businesses
            </button>
            <Icon name="chevron_right" className="text-[15px] text-text-tertiary" />
            <button type="button" onClick={onOpenBusiness} className="font-label-sm text-label-sm text-text-secondary hover:text-primary transition-colors">
              {businessName}
            </button>
            {item.category ? (
              <>
                <Icon name="chevron_right" className="text-[15px] text-text-tertiary" />
                <span className="font-label-sm text-label-sm text-text-secondary">{item.category}</span>
              </>
            ) : null}
            <Icon name="chevron_right" className="text-[15px] text-text-tertiary" />
            <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate max-w-xs sm:max-w-none">{item.name}</span>
          </nav>

          <div className="mb-8 rounded-2xl bg-surface-canvas p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary shrink-0 shadow-inner overflow-hidden">
                {business?.logo ? <img alt={`${businessName} logo`} className="w-full h-full object-cover" src={business.logo} /> : <Icon name="storefront" filled className="text-[28px]" />}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-heading-sm text-heading-sm text-on-surface font-semibold tracking-tight">{businessName}</span>
                  {business?.verified ? <Icon name="verified" filled className="text-primary text-[18px]" /> : null}
                  {status ? (
                    <span className={`px-2 py-0.5 rounded-full font-caption text-caption font-semibold ${status.openNow ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-subtle text-text-secondary'}`}>
                      {status.openNow ? 'Open now' : 'Closed now'}
                    </span>
                  ) : null}
                </div>
                {business?.address || business?.city ? (
                  <p className="font-caption text-caption text-text-secondary flex items-center gap-1 mt-0.5">
                    <Icon name="location_on" className="text-[14px]" /> {[business.address, business.city].filter(Boolean).join(', ')}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2.5 self-end md:self-auto">
              {business?.phone ? (
                <a
                  href={`tel:${business.phone.replace(/[^\d+]/g, '')}`}
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle hover:bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center gap-1.5 transition-colors"
                >
                  <Icon name="call" className="text-[18px]" />
                  <span>Call Business</span>
                </a>
              ) : null}
              <button
                type="button"
                onClick={onOpenBusiness}
                className="px-3.5 py-2 rounded-xl bg-surface-tint-blue text-primary hover:bg-surface-container font-label-sm text-label-sm flex items-center gap-1.5 transition-colors font-semibold"
              >
                <Icon name="storefront" className="text-[18px]" />
                <span>View All Items</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <section className="lg:col-span-7 flex flex-col gap-8 min-w-0">
              <div className="flex flex-col gap-3">
                <div className="relative w-full h-[400px] sm:h-[480px] rounded-3xl overflow-hidden bg-surface-container shadow-md group flex items-center justify-center">
                  {mainImage ? (
                    <img alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={mainImage} />
                  ) : (
                    <Icon name={isService ? 'room_service' : 'inventory_2'} className="text-[72px] text-outline" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {item.discountLabel ? (
                      <span className="px-3 py-1.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold shadow-md flex items-center gap-1">
                        <Icon name="local_offer" className="text-[14px]" /> {item.discountLabel}
                      </span>
                    ) : null}
                    {item.category ? (
                      <span className="px-3 py-1.5 rounded-full bg-primary text-on-primary font-caption text-caption font-semibold shadow-md">{item.category}</span>
                    ) : null}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-on-primary font-caption text-caption">
                    <span className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">{isService ? item.duration ?? 'Service' : item.stockLabel ?? 'Product'}</span>
                    {images.length > 0 ? (
                      <span className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1">
                        <Icon name="photo_camera" className="text-[14px]" /> {images.length} Photo{images.length === 1 ? '' : 's'}
                      </span>
                    ) : null}
                  </div>
                </div>
                {images.length > 1 ? (
                  <div className="grid grid-cols-4 gap-3">
                    {images.slice(0, 8).map((src, index) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setSelectedImage(index)}
                        aria-label={`Show photo ${index + 1}`}
                        className={`relative h-20 sm:h-24 rounded-2xl overflow-hidden cursor-pointer shadow-sm transition-opacity ${
                          selectedImage === index ? 'ring-2 ring-primary opacity-100' : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img alt="" className="w-full h-full object-cover" src={src} />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="p-6 sm:p-8 rounded-3xl bg-surface-canvas shadow-sm flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <h1 className="font-heading-lg text-heading-lg text-on-surface tracking-tight font-bold">{item.name}</h1>
                  <div className="flex flex-wrap items-baseline gap-3 mt-1">
                    <span className="font-display-hero text-display-hero text-primary font-bold tracking-tight">{item.priceLabel ?? 'Price on request'}</span>
                    {item.wasLabel ? <span className="font-heading-sm text-heading-sm text-text-tertiary line-through">{item.wasLabel}</span> : null}
                    <span className="font-label-md text-label-md text-text-secondary">Paid directly to {businessName}</span>
                  </div>
                </div>
                {item.shortDescription ? <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">{item.shortDescription}</p> : null}
                {item.description && item.description !== item.shortDescription ? (
                  <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed whitespace-pre-line">{item.description}</p>
                ) : null}
                {markers.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {markers.map((marker) => (
                      <div key={marker.label} className="p-3 rounded-2xl bg-surface-subtle flex flex-col items-center text-center gap-1">
                        <Icon name={marker.icon} className="text-primary text-[22px]" />
                        <span className="font-caption text-caption text-text-secondary">{marker.label}</span>
                        <span className="font-label-sm text-label-sm font-semibold text-text-primary">{marker.value}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                {item.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-surface-subtle text-text-secondary font-caption text-caption">{tag}</span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="p-6 sm:p-8 rounded-3xl bg-surface-canvas shadow-sm flex flex-col gap-8">
                <div>
                  <span className="font-caption text-caption uppercase tracking-wider text-primary font-bold">{isService ? 'Booking Details' : 'Order Preferences'}</span>
                  <h2 className="font-heading-md text-heading-md text-on-surface font-semibold mt-0.5">{isService ? 'Plan Your Visit' : 'Customize Your Order'}</h2>
                </div>

                {item.variants.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    <span className="font-label-md text-label-md font-semibold text-text-primary">Available options</span>
                    <div className="flex flex-wrap gap-2">
                      {item.variants.map((variant) => (
                        <span key={variant} className="px-3 py-1.5 rounded-xl bg-surface-subtle text-text-primary font-label-sm text-label-sm">{variant}</span>
                      ))}
                    </div>
                    <span className="font-caption text-caption text-text-tertiary">Mention the option you want in the instructions below.</span>
                  </div>
                ) : null}

                {isService ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="font-label-md text-label-md font-semibold text-text-primary">Date</span>
                      <input
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={bookingDate}
                        onChange={(event) => setBookingDate(event.target.value)}
                        className="h-12 px-4 rounded-2xl bg-surface-subtle text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="font-label-md text-label-md font-semibold text-text-primary">Time</span>
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={(event) => setBookingTime(event.target.value)}
                        className="h-12 px-4 rounded-2xl bg-surface-subtle text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                  </div>
                ) : null}

                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md font-semibold text-text-primary flex items-center gap-1.5" htmlFor="kitchen-instructions">
                    <Icon name="notes" className="text-[18px] text-text-secondary" />
                    <span>Special Requests &amp; Instructions</span>
                  </label>
                  <textarea
                    className="w-full p-4 rounded-2xl bg-surface-subtle text-on-surface font-body-md text-body-md focus:bg-surface-canvas focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-text-tertiary"
                    id="kitchen-instructions"
                    placeholder="Anything the business should know about your order..."
                    rows={3}
                    value={instructions}
                    onChange={(event) => setInstructions(event.target.value)}
                  />
                  <span className="font-caption text-caption text-text-tertiary">{businessName} will confirm special requests when your order is received.</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-surface-tint-blue flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-primary text-on-primary shrink-0 shadow-sm">
                  <Icon name="verified_user" className="text-[24px]" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-label-md text-label-md font-bold text-on-surface">VEMTAP Direct-to-Merchant Ordering</h3>
                  <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                    Your order goes straight to {businessName}. You pay the business directly when you collect it — no prepayment on VEMTAP.
                  </p>
                </div>
              </div>
            </section>

            <aside className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
              <div className="p-6 sm:p-7 rounded-3xl bg-surface-canvas shadow-xl flex flex-col gap-6">
                <div className="flex items-center justify-between pb-4">
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-primary uppercase font-bold tracking-wider">{isService ? 'Quick Booking Desk' : 'Quick Order Desk'}</span>
                    <h2 className="font-heading-md text-heading-md text-on-surface font-bold">{businessName}</h2>
                  </div>
                  <span className="w-10 h-10 rounded-2xl bg-surface-subtle flex items-center justify-center text-text-secondary">
                    <Icon name={isService ? 'event_available' : 'shopping_bag'} className="text-[20px]" />
                  </span>
                </div>

                {orderRef ? (
                  <div className="flex flex-col items-center text-center gap-3 py-4">
                    <div className="w-16 h-16 rounded-full bg-badge-discount-bg flex items-center justify-center">
                      <Icon name="check_circle" className="text-[40px] text-badge-discount-text" />
                    </div>
                    <h3 className="font-heading-md text-heading-md text-on-surface font-bold">{isService ? 'Booking requested!' : 'Order sent!'}</h3>
                    <p className="font-body-md text-body-md text-text-secondary">{businessName} has received it. Show this reference when you arrive:</p>
                    <span className="font-heading-lg text-heading-lg text-primary font-bold tracking-widest">{orderRef}</span>
                    <button type="button" onClick={() => setOrderRef(null)} className="mt-2 h-11 px-5 rounded-xl bg-surface-subtle text-text-primary font-label-md text-label-md font-semibold">
                      Place another
                    </button>
                  </div>
                ) : (
                  <>
                    {!isService && fulfillmentOptions.length > 1 ? (
                      <div className="flex flex-col gap-2">
                        <span className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider">Fulfillment Method</span>
                        <div className="grid grid-cols-2 p-1 rounded-2xl bg-surface-subtle gap-1">
                          {fulfillmentOptions.map((method) => (
                            <button
                              key={method.key}
                              type="button"
                              onClick={() => setFulfillment(method.key)}
                              className={`py-2 px-1 text-center font-label-sm text-label-sm font-semibold rounded-xl transition-all flex flex-col items-center gap-0.5 ${
                                fulfillment === method.key ? 'bg-surface-canvas text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                              }`}
                            >
                              <Icon name={method.icon} className="text-[18px]" />
                              <span>{method.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {item.branches.length > 1 ? (
                      <label className="p-3.5 rounded-2xl bg-surface-subtle flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2.5">
                          <Icon name="storefront" className="text-primary text-[20px]" />
                          <span className="font-label-sm text-label-sm font-semibold text-text-primary">Branch</span>
                        </span>
                        <select value={branchId} onChange={(event) => setBranchId(event.target.value)} className="bg-transparent font-label-sm text-label-sm text-text-primary outline-none text-right">
                          {item.branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                          ))}
                        </select>
                      </label>
                    ) : item.branches[0] ? (
                      <div className="p-3.5 rounded-2xl bg-surface-subtle flex items-center gap-2.5">
                        <Icon name="storefront" className="text-primary text-[20px]" />
                        <span className="font-label-sm text-label-sm font-semibold text-text-primary">{item.branches[0].name}</span>
                      </div>
                    ) : null}

                    {!isService && fulfillment === 'dine-in' ? (
                      <label className="p-3.5 rounded-2xl bg-surface-subtle flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2.5">
                          <Icon name="chair" className="text-primary text-[20px]" />
                          <span className="font-label-sm text-label-sm font-semibold text-text-primary">Table number</span>
                        </span>
                        <input value={tableNumber} onChange={(event) => setTableNumber(event.target.value)} placeholder="e.g. 7" className="w-24 bg-surface-canvas rounded-lg px-2 py-1 font-label-sm text-label-sm text-right outline-none" />
                      </label>
                    ) : null}

                    <div className="flex flex-col gap-3">
                      <span className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider">Order Item</span>
                      <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-subtle">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex items-center gap-1 bg-surface-canvas rounded-lg">
                            <button type="button" aria-label="Decrease quantity" onClick={() => setQty((value) => Math.max(1, value - 1))} className="w-7 h-7 flex items-center justify-center text-text-secondary">
                              <Icon name="remove" className="text-[16px]" />
                            </button>
                            <span className="font-label-sm text-label-sm font-bold text-primary w-5 text-center">{qty}</span>
                            <button type="button" aria-label="Increase quantity" onClick={() => setQty((value) => value + 1)} className="w-7 h-7 flex items-center justify-center text-primary">
                              <Icon name="add" className="text-[16px]" />
                            </button>
                          </div>
                          <span className="font-label-md text-label-md font-semibold text-text-primary truncate">{item.name}</span>
                        </div>
                        <span className="font-label-md text-label-md font-bold text-text-primary shrink-0">{item.unitPrice > 0 ? naira(item.unitPrice * qty) : '—'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <input
                        aria-label="Your name"
                        autoComplete="name"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="Your first and last name"
                        className="h-12 px-4 rounded-2xl bg-surface-subtle text-on-surface font-body-md text-body-md placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <input
                        aria-label="Phone number"
                        autoComplete="tel"
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="Phone number"
                        className="h-12 px-4 rounded-2xl bg-surface-subtle text-on-surface font-body-md text-body-md placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    {item.unitPrice > 0 ? (
                      <div className="flex items-center justify-between pt-3 mt-1">
                        <div className="flex flex-col">
                          <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">Payable to Merchant</span>
                          <span className="font-heading-lg text-heading-lg font-bold text-on-surface">Total</span>
                        </div>
                        <span className="font-display-hero text-display-hero font-bold text-primary">{naira(total)}</span>
                      </div>
                    ) : null}

                    <div className="p-4 rounded-2xl bg-surface-subtle flex items-start gap-3 text-text-secondary font-caption text-caption">
                      <Icon name="credit_card_heart" className="text-primary text-[20px] shrink-0 mt-0.5" />
                      <span>
                        <strong>Zero prepayment on VEMTAP.</strong> Settle {item.unitPrice > 0 ? naira(total) : 'the final price'} directly with {businessName}.
                      </span>
                    </div>

                    {orderError ? <p role="alert" className="font-caption text-caption text-error">{orderError}</p> : null}

                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        disabled={submitting || item.branches.length === 0}
                        onClick={() => void submitOrder()}
                        className="w-full h-14 rounded-2xl bg-primary-container text-on-primary-container hover:bg-primary font-button-primary text-button-primary shadow-lg shadow-primary/20 hover:scale-[0.99] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        <span>
                          {submitting
                            ? 'Sending…'
                            : isService
                              ? 'Request Booking'
                              : `Submit Order to Merchant${item.unitPrice > 0 ? ` (${naira(total)})` : ''}`}
                        </span>
                        <Icon name="arrow_forward" className="text-[20px]" />
                      </button>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          disabled={!branchId}
                          onClick={() => {
                            setChatOpen((open) => !open);
                            setChatState({ kind: 'idle' });
                          }}
                          className="py-3 px-3 rounded-xl bg-surface-subtle hover:bg-surface-container font-label-sm text-label-sm text-on-surface font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <Icon name="chat" className="text-[18px] text-primary" />
                          <span>Chat with Business</span>
                        </button>
                        <button
                          type="button"
                          onClick={onOpenBusiness}
                          className="py-3 px-3 rounded-xl bg-surface-subtle hover:bg-surface-container font-label-sm text-label-sm text-on-surface font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Icon name="add" className="text-[18px]" />
                          <span>See More Items</span>
                        </button>
                      </div>
                      {chatOpen ? (
                        <div className="rounded-2xl bg-surface-subtle p-3 space-y-2">
                          {chatState.kind === 'sent' ? (
                            <div className="flex items-center justify-between gap-2">
                              <p role="status" className="font-body-md text-body-md text-badge-discount-text">Message sent.</p>
                              <button type="button" onClick={() => onNav('messages')} className="font-label-md text-label-md text-primary font-semibold">Open Messages</button>
                            </div>
                          ) : (
                            <>
                              <textarea
                                aria-label={`Message ${businessName}`}
                                rows={2}
                                value={chatText}
                                onChange={(event) => setChatText(event.target.value)}
                                placeholder={`Ask ${businessName} about ${item.name}…`}
                                className="w-full resize-none rounded-xl bg-surface-canvas px-3 py-2 font-body-md text-body-md outline-none"
                              />
                              <div className="flex items-center justify-between gap-2">
                                {chatState.kind === 'error' ? <p role="alert" className="font-caption text-caption text-error">{chatState.message}</p> : <span />}
                                <button type="button" disabled={!chatText.trim() || chatState.kind === 'sending'} onClick={() => void sendChat()} className="h-9 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold disabled:opacity-50">
                                  {chatState.kind === 'sending' ? 'Sending…' : 'Send'}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </>
                )}

                <div className="text-center pt-2">
                  <p className="font-caption text-caption text-text-secondary">
                    Own a business?{' '}
                    <button type="button" onClick={() => onNav('for-business')} className="text-primary font-semibold hover:underline">
                      Set up your business on VEMTAP →
                    </button>
                  </p>
                </div>
              </div>

              {status ? (
                <div className="p-5 rounded-2xl bg-surface-canvas shadow-sm flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status.openNow ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-subtle text-text-secondary'}`}>
                      <Icon name="timer" className="text-[22px]" />
                    </div>
                    {status.openNow ? <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-badge-discount-text ring-2 ring-surface-canvas" /> : null}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">{status.openNow ? `${businessName} is open now` : `${businessName} is closed now`}</span>
                    <span className="font-caption text-caption text-text-secondary">{status.today.closed ? 'Closed today' : `Today: ${status.today.label}`}</span>
                  </div>
                </div>
              ) : null}
            </aside>
          </div>

          {recommendations.length > 0 ? (
            <section className="mt-16 pt-8 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="font-caption text-caption uppercase tracking-wider text-primary font-bold">More from {businessName}</span>
                  <h2 className="font-heading-lg text-heading-lg text-on-surface font-bold mt-1">You might also like</h2>
                </div>
                <button type="button" onClick={onOpenBusiness} className="font-label-md text-label-md text-primary font-semibold hover:underline flex items-center gap-1">
                  <span>See everything at {businessName}</span>
                  <Icon name="arrow_forward" className="text-[18px]" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.map((entry) => (
                  <div
                    key={entry.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenItem(entry.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onOpenItem(entry.id);
                      }
                    }}
                    className="rounded-3xl bg-surface-canvas p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4 group cursor-pointer"
                  >
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-surface-container flex items-center justify-center">
                      {entry.image ? (
                        <img alt={entry.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={entry.image} />
                      ) : (
                        <Icon name={entry.kind === 'service' ? 'room_service' : 'inventory_2'} className="text-[36px] text-outline" />
                      )}
                      {entry.category ? (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full font-caption text-caption font-semibold bg-surface-canvas/90 backdrop-blur-md text-on-surface">{entry.category}</span>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-label-md text-label-md font-semibold text-text-primary">{entry.name}</h3>
                      {entry.description ? <p className="font-caption text-caption text-text-secondary line-clamp-1">{entry.description}</p> : null}
                      <div className="flex items-center justify-between mt-2 pt-2">
                        <span className="font-label-md text-label-md font-bold text-primary">{entry.price > 0 ? naira(entry.price) : ''}</span>
                        <span aria-hidden="true" className="p-2 rounded-xl bg-surface-tint-blue text-primary">
                          <Icon name="chevron_right" className="text-[18px]" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </DesktopPage>
  );
}
