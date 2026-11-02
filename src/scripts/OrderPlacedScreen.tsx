import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { mapEmbedUrl } from '../hooks/usePublicBusiness';
import { Icon } from '../components/ui/Icon';
import { OrderQrArt } from '../components/ui/OrderQrArt';
import { useOrders } from '../context/OrdersContext';
import type { SubmittedOrder } from '../context/OrdersContext';
import { naira } from './catalogueData';
import {
  PAYMENT_STATUS_LABELS,
  orderStatusLabel,
} from './orderData';

interface OrderPlacedScreenProps {
  order: SubmittedOrder;
  onClose: () => void;
  onHome: () => void;
  onTrack: () => void;
}

export function OrderPlacedScreen({ order, onClose, onHome, onTrack }: OrderPlacedScreenProps) {
  const [accordionOpen, setAccordionOpen] = useState(false);
  const orders = useOrders();

  // Re-read from the store so payment/status updates from the cashier show here.
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
  const itemCount = live.lines.reduce((sum, line) => sum + line.qty, 0);
  const total = live.total;

  return (
    <AppScreen>
      <main className="flex-1 flex flex-col relative w-full pt-safe pb-safe bg-surface">
        <div className="flex flex-col w-full px-margin pb-space-2xl space-y-space-lg">
          <header className="flex items-center justify-between py-space-sm">
            <div className="w-10" />
            <h1 className="font-heading-sm text-heading-sm text-on-surface text-center">Order Confirmation</h1>
            <button
              aria-label="Close to Home"
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors active:scale-95"
            >
              <Icon name="close" className="text-on-surface" />
            </button>
          </header>

          <section className="flex flex-col items-center text-center pt-space-xs space-y-space-sm">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-24 h-24 rounded-full bg-badge-discount-bg animate-ping opacity-60" />
              <div className="absolute w-20 h-20 rounded-full bg-surface-tint-blue" />
              <div className="relative w-16 h-16 rounded-full bg-badge-discount-bg flex items-center justify-center shadow-md">
                <Icon name="check_circle" filled className="text-badge-discount-text text-3xl" />
              </div>
            </div>
            <div className="space-y-space-2xs">
              <h2 className="font-heading-md text-heading-md text-on-surface font-semibold">
                Order Received by {merchantName}!
              </h2>
              <p className="font-body-md text-body-md text-text-secondary">
                Order <span className="font-semibold text-on-surface">#{shortRef}</span> • Placed just now
              </p>
            </div>
            <div className="inline-flex items-center gap-space-xs px-space-md py-space-2xs rounded-full bg-surface-tint-blue shadow-sm">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
              <span className="font-label-md text-label-md text-primary font-semibold">
                {orderStatusLabel(live.status)}
              </span>
            </div>
          </section>

          {/* BUG-015 Step 4: order confirmation pass — reopenable from Orders. */}
          <section className="p-space-md rounded-xl bg-surface-canvas shadow-sm flex flex-col items-center gap-space-sm">
            <div className="flex items-center gap-space-xs self-start">
              <Icon name="qr_code_2" className="text-primary text-[20px]" />
              <h3 className="font-heading-sm text-heading-sm text-on-surface">Collection Pass</h3>
            </div>
            <OrderQrArt value={live.ref} size={168} className="rounded-lg border border-subtle" />
            <div className="flex flex-col items-center gap-space-2xs">
              <span className="font-mono text-heading-sm text-heading-sm font-bold text-on-surface tracking-widest">
                {shortRef}
              </span>
              <span className="font-caption text-caption text-text-secondary">
                Show this pass or quote the order number
              </span>
            </div>
            <div className="w-full grid grid-cols-2 gap-space-xs text-left">
              <div className="p-space-xs rounded-lg bg-surface-subtle">
                <p className="font-caption text-caption text-text-tertiary uppercase tracking-wider">Business</p>
                <p className="font-label-md text-label-md font-semibold text-on-surface truncate">
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
                Your order stays Payment Pending until {live.merchantName} verifies the payment — it has not been
                marked paid yet.
              </p>
            )}
            <button
              type="button"
              onClick={onTrack}
              className="w-full h-10 rounded-lg bg-surface-tint-blue text-primary font-button-secondary text-button-secondary font-semibold flex items-center justify-center gap-1"
            >
              <Icon name="forum" className="text-[18px]" />
              Message {live.merchantName}
            </button>
          </section>

          <section className="space-y-space-sm">

            <>
              <div className="p-space-lg rounded-xl bg-surface-canvas shadow-sm space-y-space-md">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center">
                    <Icon name="storefront" filled className="text-primary text-sm" />
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-on-surface">Pickup Guide</h3>
                </div>
                <ol className="space-y-space-md">
                  {[
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
                  ].map((item) => (
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
                        <p className="font-label-md text-label-md text-on-surface font-semibold">{item.title}</p>
                        <p className="font-caption text-caption text-text-secondary mt-0.5">{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
</>
          </section>

          <section className="p-space-lg rounded-xl bg-surface-canvas shadow-sm space-y-space-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading-sm text-heading-sm text-on-surface">{merchantName}</h3>
              </div>
            </div>

            <div className={`grid ${merchantPhone ? 'grid-cols-3' : 'grid-cols-1'} gap-space-xs`}>
              {merchantPhone ? (
<a
 className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container active:scale-95 transition-all text-center"
 href={`tel:${merchantPhone}`}
              >
                <Icon name="call" className="text-primary text-xl mb-1" />
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">Direct Call</span>
              </a>
) : null}
              <button
                type="button"
                onClick={onTrack}
                className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container active:scale-95 transition-all text-center"
              >
                <Icon name="chat" className="text-primary text-xl mb-1" />
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">In-App Chat</span>
              </button>
              {merchantPhone ? (
<a
 className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container active:scale-95 transition-all text-center"
 href={`https://wa.me/${merchantPhone.replace(/\D/g, '')}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon name="forum" filled className="text-badge-discount-text text-xl mb-1" />
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">WhatsApp</span>
              </a>
) : null}
            </div>

            {merchantAddress ? (
<div className="flex items-center justify-between pt-space-xs bg-surface-subtle p-space-sm rounded-lg">
<div className="flex items-start gap-space-xs min-w-0 pr-2">
                <Icon name="location_on" className="text-primary text-lg mt-0.5 shrink-0" />
                <span className="font-caption text-caption text-text-secondary truncate">{merchantAddress}</span>
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

          <section className="rounded-xl bg-surface-canvas shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setAccordionOpen((value) => !value)}
              className="w-full flex items-center justify-between p-space-lg text-left bg-surface-canvas hover:bg-surface-subtle transition-colors"
            >
              <div className="space-y-0.5">
                <span className="font-heading-sm text-heading-sm text-on-surface">Order Details</span>
                <p className="font-caption text-caption text-text-secondary">
                  {itemCount} items • Total <span className="font-semibold text-on-surface">{naira(total)}</span>
                </p>
              </div>
              <div className="flex items-center gap-space-xs">
                <Icon
                  name="expand_more"
                  className={`text-on-surface-variant transition-transform duration-200 ${accordionOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>
            {accordionOpen && (
              <div className="px-space-lg pb-space-lg space-y-space-sm bg-surface-canvas">
                <div className="space-y-space-xs pt-space-xs">
                  {order.lines.map((line) => (
                    <div key={line.id} className="flex items-center justify-between font-body-md text-body-md">
                      <span className="text-on-surface">
                        {line.qty}x {line.name}
                      </span>
                      <span className="text-on-surface font-medium">{naira(line.price * line.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-space-xs space-y-1 bg-surface-subtle p-space-sm rounded-lg">
                  <div className="flex justify-between font-caption text-caption text-text-secondary">
                    <span>Subtotal</span>
                    <span>{naira(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-label-md text-label-md text-on-surface font-bold pt-1">
                    <span>Total Payable to Cashier</span>
                    <span className="text-primary">{naira(total)}</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          <div className="space-y-space-sm pt-space-xs">
            <button
              type="button"
              onClick={onTrack}
              className="w-full h-14 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-lg active:scale-95 transition-all"
            >
              <Icon name="forum" className="text-xl" />
              <span>Track Status / Chat with Merchant</span>
            </button>
            <button
              type="button"
              onClick={onHome}
              className="w-full h-11 rounded-xl bg-transparent text-text-secondary hover:text-on-surface font-button-secondary text-button-secondary flex items-center justify-center transition-colors"
            >
              Back to Home Discovery
            </button>
          </div>
        </div>
      </main>
    </AppScreen>
  );
}
