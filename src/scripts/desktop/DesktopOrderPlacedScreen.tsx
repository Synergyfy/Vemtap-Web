import { useState } from 'react';
import { mapEmbedUrl } from '../../hooks/usePublicBusiness';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { OrderQrArt } from '../../components/ui/OrderQrArt';
import { useOrders, type SubmittedOrder } from '../../context/OrdersContext';
import {
  PAYMENT_STATUS_LABELS,
  orderStatusLabel,
} from '../orderData';

const naira = (value: number) => `₦${value.toLocaleString('en-US')}`;

interface DesktopOrderPlacedScreenProps {
  onNav: (key: DesktopNavKey) => void;
  order: SubmittedOrder;
  onClose: () => void;
  onHome: () => void;
  onTrack: () => void;
}

export function DesktopOrderPlacedScreen({
  onNav,
  order,
  onClose,
  onHome,
  onTrack,
}: DesktopOrderPlacedScreenProps) {
  const orders = useOrders();
  const live = orders.byRef(order.ref) ?? order;
  const merchantName = live.merchantName;
  const merchantAddress = live.merchantAddress ?? '';
  const merchantPhone = live.merchantPhone ?? '';
  const hasPoint = live.merchantLatitude != null && live.merchantLongitude != null;
  const directionsUrl = hasPoint
    ? `https://www.google.com/maps/search/?api=1&query=${live.merchantLatitude},${live.merchantLongitude}`
    : merchantAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(merchantAddress)}`
      : null;
  const mapUrl = mapEmbedUrl(live.merchantLatitude ?? null, live.merchantLongitude ?? null);
  const shortRef = live.ref.length > 12 ? live.ref.slice(0, 8).toUpperCase() : live.ref;
  const [accordionOpen, setAccordionOpen] = useState(true);

  const itemCount = order.lines.reduce((sum, line) => sum + line.qty, 0);
  const total = order.total;

  const pickupSteps = [
    {
      step: '1',
      title: 'Go to the Business',
      body: `Head to ${merchantName}${merchantAddress ? ` at ${merchantAddress}` : ''}.`,
      accent: false,
    },
    {
      step: '2',
      title: 'Identify Your Order',
      body: `Show this digital confirmation screen or mention Order #${shortRef} to the cashier.`,
      accent: false,
    },
    {
      step: '3',
      title: `Pay at the Counter: ${naira(total)}`,
      body: 'Pay the business directly when you collect.',
      accent: true,
    },
    {
      step: '4',
      title: 'Collect Your Order',
      body: 'The business will have your order ready for you.',
      accent: false,
    },
  ];

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="deals">
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1 text-text-tertiary font-caption text-caption">
                <li className="flex items-center gap-1">
                  <button className="hover:text-primary transition-colors" onClick={() => onNav('home')} type="button">
                    Home
                  </button>
                  <Icon name="chevron_right" className="text-[14px]" />
                </li>
                <li aria-current="page" className="font-label-sm text-label-sm text-text-primary">
                  Order Confirmation
                </li>
              </ol>
            </nav>
            <button
              aria-label="Close to Home"
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container-high text-text-secondary hover:text-text-primary transition-colors active:scale-95 shrink-0"
            >
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>

          <section className="flex flex-col items-center text-center space-y-space-sm max-w-3xl mx-auto pb-2">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-28 h-28 rounded-full bg-badge-discount-bg animate-ping opacity-60" />
              <div className="absolute w-24 h-24 rounded-full bg-surface-tint-blue" />
              <div className="relative w-20 h-20 rounded-full bg-badge-discount-bg flex items-center justify-center shadow-md">
                <Icon name="check_circle" filled className="text-badge-discount-text text-5xl" />
              </div>
            </div>

            <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
              Order Received by {merchantName}!
            </h1>

            <p className="font-body-lg text-body-lg text-text-secondary">
              Order <span className="font-semibold text-text-primary">#{shortRef}</span> • Placed just now
            </p>

            <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-tint-blue shadow-sm">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
              <span className="font-label-md text-label-md text-primary font-semibold">
                {orderStatusLabel(live.status)}
              </span>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start mt-8">
            <div className="flex flex-col gap-6 min-w-0">
              <section className="space-y-space-sm">

                <>
                  <div className="p-6 rounded-xl bg-surface-canvas border border-border-subtle shadow-sm space-y-space-md">
                    <div className="flex items-center gap-space-xs">
                      <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center">
                        <Icon name="storefront" filled className="text-primary text-sm" />
                      </div>
                      <h2 className="font-heading-sm text-heading-sm text-text-primary">
                        Pickup Guide
                      </h2>
                    </div>
                    <ol className="space-y-space-md">
                      {pickupSteps.map((item) => (
                        <li key={item.step} className="flex items-start gap-space-sm">
                          <span
                            className={`flex-shrink-0 w-6 h-6 rounded-full font-label-sm text-label-sm font-bold flex items-center justify-center ${
                              item.accent
                                ? 'bg-badge-discount-bg text-badge-discount-text'
                                : 'bg-surface-container-high text-primary'
                            }`}
                          >
                            {item.step}
                          </span>
                          <div className="flex-1">
                            <p className="font-label-md text-label-md text-text-primary font-semibold">{item.title}</p>
                            <p className="font-caption text-caption text-text-secondary mt-0.5">{item.body}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
</>
              </section>

              <section className="p-6 rounded-xl bg-surface-canvas border border-border-subtle shadow-sm space-y-space-md">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">{merchantName}</h2>
                  </div>
                </div>

                <div className={`grid ${merchantPhone ? 'grid-cols-3' : 'grid-cols-1'} gap-space-xs`}>
                  {merchantPhone ? (
<a
 className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container-high active:scale-95 transition-all text-center"
 href={`tel:${merchantPhone}`}
                  >
                    <Icon name="call" className="text-primary text-xl mb-1" />
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold">Direct Call</span>
                  </a>
) : null}
                  <button
                    type="button"
                    onClick={onTrack}
                    className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container-high active:scale-95 transition-all text-center"
                  >
                    <Icon name="chat" className="text-primary text-xl mb-1" />
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold">In-App Chat</span>
                  </button>
                  {merchantPhone ? (
<a
 className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container-high active:scale-95 transition-all text-center"
 href={`https://wa.me/${merchantPhone.replace(/\D/g, '')}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Icon name="forum" filled className="text-badge-discount-text text-xl mb-1" />
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold">WhatsApp</span>
                  </a>
) : null}
                </div>

                {merchantAddress ? (
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-subtle p-space-sm rounded-lg">
<div className="flex items-start gap-space-xs min-w-0 pr-2">
                    <Icon name="location_on" className="text-primary text-lg mt-0.5 shrink-0" />
                    <span className="font-caption text-caption text-text-secondary">{merchantAddress}</span>
                  </div>
                  {directionsUrl ? (
<a
 className="shrink-0 font-button-secondary text-button-secondary text-primary font-semibold hover:underline"
 href={directionsUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Directions
                  </a>
) : null}
</div>
) : null}
              </section>

              {mapUrl ? (
<section className="rounded-xl overflow-hidden shadow-sm">
<iframe title={`Map showing ${merchantName}`} className="w-full h-44 border-0" src={mapUrl} loading="lazy" />
</section>
) : null}
            </div>

            <aside className="lg:sticky lg:top-24 flex flex-col gap-6 min-w-0">
              {/* BUG-015 Step 4: collection pass — also reopenable from Orders. */}
              <section className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-6 flex flex-col items-center gap-space-sm">
                <div className="flex items-center gap-space-xs self-start">
                  <Icon name="qr_code_2" className="text-primary text-[20px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Collection Pass</h2>
                </div>
                <OrderQrArt value={live.ref} size={180} className="rounded-lg border border-subtle" />
                <span className="font-mono text-heading-sm text-heading-sm font-bold text-text-primary tracking-widest">
                  {shortRef}
                </span>
                <span className="font-caption text-caption text-text-secondary text-center">
                  Show this pass or quote the order number to the cashier.
                </span>
                <div className="w-full grid grid-cols-2 gap-space-xs text-left">
                  <div className="p-space-xs rounded-lg bg-surface-subtle">
                    <p className="font-caption text-caption text-text-tertiary uppercase tracking-wider">Business</p>
                    <p className="font-label-md text-label-md font-semibold text-text-primary truncate">
                      {live.merchantName}
                    </p>
                  </div>
                  <div className="p-space-xs rounded-lg bg-surface-subtle">
                    <p className="font-caption text-caption text-text-tertiary uppercase tracking-wider">Payment</p>
                    <p
                      className={`font-label-md text-label-md font-semibold truncate ${
                        live.paymentStatus === 'verified' || live.paymentStatus === 'not-required'
                          ? 'text-badge-discount-text'
                          : 'text-error'
                      }`}
                    >
                      {PAYMENT_STATUS_LABELS[live.paymentStatus]}
                    </p>
                  </div>
                </div>
                {live.paymentStatus === 'pending' && (
                  <p className="font-caption text-caption text-text-secondary text-center">
                    This order stays Payment Pending until {live.merchantName} verifies payment — it has not been
                    marked paid.
                  </p>
                )}
              </section>

              <section className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAccordionOpen((value) => !value)}
                  className="w-full flex items-center justify-between p-5 text-left bg-surface-canvas hover:bg-surface-subtle transition-colors"
                >
                  <div className="space-y-0.5 text-left min-w-0">
                    <span className="font-heading-sm text-heading-sm text-text-primary">Order Details</span>
                    <p className="font-caption text-caption text-text-secondary">
                      {itemCount} items • Total <span className="font-semibold text-text-primary">{naira(total)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-space-xs shrink-0">
                    <Icon
                      name="expand_more"
                      className={`text-text-tertiary transition-transform duration-200 ${
                        accordionOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>
                {accordionOpen && (
                  <div className="px-5 pb-5 space-y-space-sm bg-surface-canvas">
                    <div className="space-y-space-xs pt-space-xs">
                      {order.lines.map((line) => (
                        <div key={line.id} className="flex items-center justify-between font-body-md text-body-md">
                          <span className="text-text-primary">
                            {line.qty}x {line.name}
                          </span>
                          <span className="text-text-primary font-medium">{naira(line.price * line.qty)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-space-xs space-y-1 bg-surface-subtle p-space-sm rounded-lg">
                      <div className="flex justify-between font-caption text-caption text-text-secondary">
                        <span>Subtotal</span>
                        <span>{naira(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between font-label-md text-label-md text-text-primary font-bold pt-1">
                        <span>Total Payable to Cashier</span>
                        <span className="text-primary">{naira(total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <div className="bg-surface-canvas rounded-xl border border-border-subtle p-6 shadow-md flex flex-col gap-3">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-tertiary font-semibold">
                  Next Steps
                </span>
                <button
                  type="button"
                  onClick={onTrack}
                  className="w-full h-12 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] active:scale-95 transition-all"
                >
                  <Icon name="forum" className="text-xl" />
                  <span>Track Status / Chat with Merchant</span>
                </button>
                <button
                  type="button"
                  onClick={onHome}
                  className="w-full h-11 rounded-xl bg-surface-subtle hover:bg-surface-container-high text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary flex items-center justify-center transition-colors"
                >
                  Back to Home Discovery
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full h-9 rounded-xl bg-transparent text-text-tertiary hover:text-error font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Icon name="close" className="text-[17px]" />
                  <span>Close Confirmation</span>
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
