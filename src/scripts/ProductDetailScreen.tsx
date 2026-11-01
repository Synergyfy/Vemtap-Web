import { useEffect, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { Skeleton, SkeletonGroup } from '../components/ui/Skeleton';
import { SheetShell } from '../components/sheets/SheetShell';
import { naira } from './catalogueData';
import { placePublicOrder, usePublicCatalogueItem } from '../hooks/usePublicCatalogueItem';
import { usePublicBusiness } from '../hooks/usePublicBusiness';

interface ProductDetailScreenProps {
  /** The item from the URL (`/business/<code>/products/<itemId>`). */
  itemId: string | null;
  businessCode: string | null;
  onBack: () => void;
  onOpenBusiness: () => void;
}

export function ProductDetailScreen({ itemId, businessCode, onBack, onOpenBusiness }: ProductDetailScreenProps) {
  const { item, loading, error, reload } = usePublicCatalogueItem(itemId);
  const { business } = usePublicBusiness(businessCode);
  const [qty, setQty] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [copied, setCopied] = useState(false);
  const [photo, setPhoto] = useState(0);
  // Order / booking sheet
  const [orderOpen, setOrderOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [branchId, setBranchId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);

  useEffect(() => {
    setQty(1);
    setInstructions('');
    setPhoto(0);
    setOrderRef(null);
    setBranchId(item?.branches[0]?.id ?? '');
  }, [item?.id, item?.branches]);

  const share = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      },
      () => undefined,
    );
  };

  const isService = item?.kind === 'service';
  const total = (item?.unitPrice ?? 0) * qty;
  const businessName = business?.name ?? 'Business';

  const submit = async () => {
    if (!item) return;
    setSubmitting(true);
    setOrderError(null);
    try {
      if (isService && (!bookingDate || !bookingTime)) throw new Error('Choose a date and time for your booking.');
      const ref = await placePublicOrder({
        itemId: item.id,
        quantity: qty,
        branchId,
        fullName,
        phone,
        notes: instructions,
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

  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Navigate back"
              type="button"
              onClick={onBack}
              className="w-11 h-11 -ml-1 flex items-center justify-center text-on-surface hover:text-primary transition-colors active:scale-95"
            >
              <Icon name="arrow_back_ios_new" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface tracking-tight truncate max-w-[200px]">
              {isService ? 'Service Details' : 'Product Details'}
            </h1>
          </div>
          <button
            aria-label={copied ? 'Link copied' : 'Share'}
            type="button"
            onClick={share}
            className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <Icon name={copied ? 'check' : 'share'} className="text-[22px]" />
          </button>
        </div>
        {copied && (
          <div className="px-margin pb-2">
            <div role="status" className="bg-inverse-surface/95 text-inverse-on-surface rounded-lg px-3 py-1.5 font-caption text-caption flex items-center gap-1.5 w-fit">
              <Icon name="check" className="text-[14px]" />
              <span>Link copied</span>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-14 pb-safe bg-surface">
        {loading ? (
          <SkeletonGroup label="Loading item" className="flex flex-col w-full">
            <Skeleton className="w-full aspect-[4/3] rounded-none" />
            <div className="px-margin pt-4 space-y-3">
              <Skeleton className="h-8 w-40 rounded-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          </SkeletonGroup>
        ) : error || !item ? (
          <div className="px-margin pt-10">
            <div className="rounded-3xl bg-surface-canvas p-6 text-center shadow-sm space-y-3">
              <Icon name="inventory_2" className="text-[32px] text-primary" />
              <p className="font-label-md text-label-md text-text-primary font-semibold">{error ?? 'This item couldn’t be loaded.'}</p>
              <button type="button" onClick={reload} className="h-11 w-full rounded-xl bg-primary text-on-primary font-button-primary text-button-primary">Try again</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col w-full pb-32">
              <div className="relative w-full overflow-hidden bg-surface-container-low">
                <div className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center">
                  {item.images[photo] ?? item.images[0] ? (
                    <img className="w-full h-full object-cover" alt={item.name} src={item.images[photo] ?? item.images[0]} />
                  ) : (
                    <Icon name={isService ? 'room_service' : 'inventory_2'} className="text-[64px] text-outline" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/20 pointer-events-none" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <button
                      aria-label="Go back"
                      type="button"
                      onClick={onBack}
                      className="w-10 h-10 rounded-full bg-surface-container-lowest/90 backdrop-blur-md shadow-md flex items-center justify-center text-on-surface hover:text-primary active:scale-90 transition-transform"
                    >
                      <Icon name="arrow_back" className="text-[20px]" />
                    </button>
                    <button
                      aria-label="Share"
                      type="button"
                      onClick={share}
                      className="w-10 h-10 rounded-full bg-surface-container-lowest/90 backdrop-blur-md shadow-md flex items-center justify-center text-on-surface hover:text-primary active:scale-90 transition-transform"
                    >
                      <Icon name={copied ? 'check' : 'share'} className="text-[20px]" />
                    </button>
                  </div>

                  <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2 z-10">
                    {item.discountLabel && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm shadow-sm font-semibold">
                        <Icon name="local_offer" className="text-[14px]" />
                        {item.discountLabel}
                      </span>
                    )}
                    {item.category && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm shadow-sm font-medium bg-surface-canvas/90 text-on-surface">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>
                {item.images.length > 1 ? (
                  <div className="flex gap-2 px-margin py-2 overflow-x-auto no-scrollbar bg-surface">
                    {item.images.map((src, index) => (
                      <button
                        key={src}
                        type="button"
                        aria-label={`Show photo ${index + 1}`}
                        onClick={() => setPhoto(index)}
                        className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 ring-2 ${index === photo ? 'ring-primary' : 'ring-transparent opacity-80'}`}
                      >
                        <img alt="" className="w-full h-full object-cover" src={src} />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="px-margin flex flex-col gap-space-md pt-4">
                <button
                  type="button"
                  onClick={onOpenBusiness}
                  className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface hover:bg-secondary-fixed transition-colors"
                >
                  <Icon name="storefront" className="text-primary text-[16px]" />
                  <span className="font-label-md text-label-md font-medium text-text-primary">{businessName}</span>
                  {business?.city ? (
                    <>
                      <span className="text-text-tertiary">•</span>
                      <span className="font-label-sm text-label-sm text-text-secondary">{business.city}</span>
                    </>
                  ) : null}
                  <Icon name="chevron_right" className="text-text-tertiary text-[16px]" />
                </button>

                <div className="flex flex-col gap-1">
                  <h1 className="font-heading-lg text-heading-lg text-text-primary leading-tight">{item.name}</h1>
                  {item.brand ? <span className="font-label-sm text-label-sm text-text-secondary">by {item.brand}</span> : null}
                </div>

                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-display-hero-mobile text-display-hero-mobile text-text-primary tracking-tight">{item.priceLabel ?? 'Price on request'}</span>
                  {item.wasLabel && <span className="font-heading-sm text-heading-sm text-text-tertiary line-through">{item.wasLabel}</span>}
                </div>

                {item.stockLabel || item.duration ? (
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low text-text-secondary self-start flex-wrap">
                    {item.stockLabel ? (
                      <>
                        <span className={`w-2.5 h-2.5 rounded-full ${item.inStock ? 'bg-badge-discount-text' : 'bg-error'}`} />
                        <span className="font-label-sm text-label-sm font-medium text-text-primary">{item.stockLabel}</span>
                      </>
                    ) : null}
                    {item.stockLabel && item.duration ? <span className="text-text-tertiary">•</span> : null}
                    {item.duration ? (
                      <span className="font-label-sm text-label-sm text-text-secondary flex items-center gap-1">
                        <Icon name="schedule" className="text-[15px]" />
                        {item.duration}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {item.shortDescription || item.description ? (
                  <div className="flex flex-col gap-2 pt-2">
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">Description</h2>
                    {item.shortDescription ? <p className="font-body-md text-body-md text-text-primary leading-relaxed">{item.shortDescription}</p> : null}
                    {item.description && item.description !== item.shortDescription ? (
                      <p className="font-body-md text-body-md text-text-secondary leading-relaxed whitespace-pre-line">{item.description}</p>
                    ) : null}
                  </div>
                ) : null}

                {item.tags.length > 0 || item.fulfillment.length > 0 ? (
                  <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Icon name="info" className="text-primary text-[20px]" />
                      <h3 className="font-label-md text-label-md font-semibold text-text-primary">Good to know</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-caption text-caption text-text-secondary">
                      {[...item.fulfillment, ...item.tags].map((entry) => (
                        <div key={entry} className="flex items-center gap-1.5">
                          <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
                          <span>{entry}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {item.variants.length > 0 ? (
                  <div className="flex flex-col gap-3 pt-2">
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">Options</h2>
                    <div className="flex flex-wrap gap-2">
                      {item.variants.map((variant) => (
                        <span key={variant} className="px-3 py-1.5 rounded-2xl bg-surface-container-lowest shadow-sm font-label-md text-label-md text-text-primary">{variant}</span>
                      ))}
                    </div>
                    <span className="font-caption text-caption text-text-secondary">Mention the option you want in the instructions below.</span>
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">Special Instructions</h2>
                    <span className="font-caption text-caption text-text-secondary">Optional</span>
                  </div>
                  <div className="w-full rounded-2xl bg-surface-container-lowest p-3 shadow-sm">
                    <textarea
                      className="w-full bg-transparent font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none resize-none"
                      placeholder="Anything the business should know..."
                      rows={3}
                      value={instructions}
                      onChange={(event) => setInstructions(event.target.value)}
                    />
                  </div>
                </div>

                {!isService ? (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest shadow-sm mt-1">
                    <span className="font-label-md text-label-md font-semibold text-text-primary">Quantity</span>
                    <div className="flex items-center gap-4 bg-surface-container-low rounded-full px-2 py-1">
                      <button
                        aria-label="Decrease quantity"
                        type="button"
                        onClick={() => setQty((value) => Math.max(1, value - 1))}
                        className="w-8 h-8 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-text-secondary active:scale-90 transition-transform"
                      >
                        <Icon name="remove" className="text-[18px]" />
                      </button>
                      <span className="font-heading-sm text-heading-sm text-text-primary w-4 text-center">{qty}</span>
                      <button
                        aria-label="Increase quantity"
                        type="button"
                        onClick={() => setQty((value) => value + 1)}
                        className="w-8 h-8 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary active:scale-90 transition-transform"
                      >
                        <Icon name="add" className="text-[18px]" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe">
              <div className="max-w-[430px] mx-auto px-margin py-3 flex items-center justify-between gap-4">
                {item.unitPrice > 0 ? (
                  <div className="flex flex-col text-left">
                    <span className="font-caption text-caption text-text-secondary">Total Price</span>
                    <span className="font-heading-md text-heading-md text-text-primary font-bold">{naira(total)}</span>
                  </div>
                ) : null}
                <button
                  type="button"
                  disabled={item.branches.length === 0 || (!isService && !item.inStock)}
                  onClick={() => {
                    setOrderError(null);
                    setOrderOpen(true);
                  }}
                  className="flex-1 h-14 rounded-2xl hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-on-primary shadow-lg shadow-primary-container/25 bg-primary-container hover:bg-primary disabled:opacity-50"
                >
                  <Icon name={isService ? 'event_available' : 'shopping_bag'} className="text-[20px]" />
                  <span className="font-button-primary text-button-primary">
                    {isService ? 'Request Booking' : !item.inStock ? 'Out of stock' : `Order for Pickup${item.unitPrice > 0 ? ` • ${naira(total)}` : ''}`}
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      <SheetShell open={orderOpen && Boolean(item)} onClose={() => setOrderOpen(false)}>
        <div className="px-margin pt-4 pb-8 space-y-space-md">
          <div className="flex items-center justify-between">
            <h2 className="font-heading-sm text-heading-sm text-on-surface">{isService ? 'Request a booking' : 'Order for pickup'}</h2>
            <button aria-label="Close" type="button" onClick={() => setOrderOpen(false)} className="w-9 h-9 rounded-full bg-surface-subtle flex items-center justify-center text-text-secondary">
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>
          {orderRef ? (
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <div className="w-16 h-16 rounded-full bg-badge-discount-bg flex items-center justify-center">
                <Icon name="check_circle" className="text-[40px] text-badge-discount-text" />
              </div>
              <p className="font-body-md text-body-md text-text-secondary">{businessName} has received your {isService ? 'booking request' : 'order'}. Show this reference when you arrive:</p>
              <span className="font-heading-lg text-heading-lg text-primary font-bold tracking-widest">{orderRef}</span>
              <button type="button" onClick={() => setOrderOpen(false)} className="h-11 w-full rounded-xl bg-primary text-on-primary font-button-primary text-button-primary">Done</button>
            </div>
          ) : item ? (
            <>
              <p className="font-body-md text-body-md text-text-secondary">
                {isService ? item.name : `${qty} × ${item.name}`} · pay {businessName} directly when you arrive.
              </p>
              {item.branches.length > 1 ? (
                <label className="flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm text-text-primary font-semibold">Branch</span>
                  <select value={branchId} onChange={(event) => setBranchId(event.target.value)} className="h-11 px-3 rounded-xl bg-surface-subtle font-body-md text-body-md text-on-surface">
                    {item.branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </label>
              ) : null}
              {isService ? (
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold">Date</span>
                    <input type="date" min={new Date().toISOString().slice(0, 10)} value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} className="h-11 px-3 rounded-xl bg-surface-subtle font-body-md text-body-md text-on-surface" />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold">Time</span>
                    <input type="time" value={bookingTime} onChange={(event) => setBookingTime(event.target.value)} className="h-11 px-3 rounded-xl bg-surface-subtle font-body-md text-body-md text-on-surface" />
                  </label>
                </div>
              ) : null}
              <input aria-label="Your name" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your first and last name" className="h-11 w-full px-3 rounded-xl bg-surface-subtle font-body-md text-body-md text-on-surface placeholder:text-text-tertiary" />
              <input aria-label="Phone number" autoComplete="tel" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" className="h-11 w-full px-3 rounded-xl bg-surface-subtle font-body-md text-body-md text-on-surface placeholder:text-text-tertiary" />
              {orderError ? <p role="alert" className="font-caption text-caption text-error">{orderError}</p> : null}
              <button
                type="button"
                disabled={submitting}
                onClick={() => void submit()}
                className="h-12 w-full rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary disabled:opacity-60"
              >
                {submitting ? 'Sending…' : isService ? 'Send booking request' : `Send order${item.unitPrice > 0 ? ` • ${naira(total)}` : ''}`}
              </button>
            </>
          ) : null}
        </div>
      </SheetShell>
    </AppScreen>
  );
}
