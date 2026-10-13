import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { naira } from './catalogueData';
import {
  MERCHANT_ADDRESS,
  MERCHANT_NAME,
  MERCHANT_PHONE_DISPLAY,
  MERCHANT_PHONE_TEL,
  MAP_IMAGE,
  VOUCHER_CODE,
  type FulfillmentMode,
  type OrderSummary,
} from './orderData';

interface OrderPlacedScreenProps {
  order: OrderSummary;
  onClose: () => void;
  onHome: () => void;
  onTrack: () => void;
}

export function OrderPlacedScreen({ order, onClose, onHome, onTrack }: OrderPlacedScreenProps) {
  const [mode, setMode] = useState<FulfillmentMode>(order.fulfillment);
  const [accordionOpen, setAccordionOpen] = useState(false);

  const itemCount = order.lines.reduce((sum, line) => sum + line.qty, 0);
  const total = order.total;

  const tabClass = (active: boolean) =>
    `flex-1 py-space-xs rounded-lg font-button-secondary text-button-secondary text-center transition-all ${
      active ? 'bg-surface-canvas text-primary shadow-sm' : 'text-text-secondary'
    }`;

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
                Order Received by {MERCHANT_NAME}!
              </h2>
              <p className="font-body-md text-body-md text-text-secondary">
                Order <span className="font-semibold text-on-surface">#{order.ref}</span> • Placed just now
              </p>
            </div>
            <div className="inline-flex items-center gap-space-xs px-space-md py-space-2xs rounded-full bg-surface-tint-blue shadow-sm">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
              <span className="font-label-md text-label-md text-primary font-semibold">
                Merchant Preparing Your Order
              </span>
              <span className="font-caption text-caption text-secondary">(~20–25 mins)</span>
            </div>
          </section>

          <section className="space-y-space-sm">
            <div className="flex p-space-2xs rounded-xl bg-surface-container">
              <button type="button" onClick={() => setMode('pickup')} className={tabClass(mode === 'pickup')}>
                Pickup / Dine-in{' '}
                {mode === 'pickup' && (
                  <span className="font-caption text-caption text-badge-discount-text ml-1">(Active)</span>
                )}
              </button>
              <button type="button" onClick={() => setMode('delivery')} className={tabClass(mode === 'delivery')}>
                If Delivery
              </button>
            </div>

            {mode === 'pickup' ? (
              <div className="p-space-lg rounded-xl bg-surface-canvas shadow-sm space-y-space-md">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center">
                    <Icon name="restaurant" filled className="text-primary text-sm" />
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-on-surface">Dine-in or Counter Pickup Guide</h3>
                </div>
                <ol className="space-y-space-md">
                  {[
                    {
                      step: '1',
                      title: 'Arrive at the Bistro',
                      body: `Head to ${MERCHANT_NAME} at Plot 104 Apo Boulevard, Garki District.`,
                      accent: false,
                    },
                    {
                      step: '2',
                      title: 'Identify Your Order',
                      body: `Show this digital confirmation screen or mention Order #${order.ref} to the hostess or front cashier.`,
                      accent: false,
                    },
                    {
                      step: '3',
                      title: `Pay at the Counter: ${naira(total)}`,
                      body: 'Present payment directly to the cashier. Accepted: Physical Card (POS), Cash, or Instant Merchant Bank Transfer.',
                      accent: true,
                    },
                    {
                      step: '4',
                      title: 'Collect & Relish',
                      body: 'Pick up your heat-sealed package or take a seat at your reserved table.',
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
            ) : (
              <div className="p-space-lg rounded-xl bg-surface-canvas shadow-sm space-y-space-md">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center">
                    <Icon name="two_wheeler" className="text-primary text-sm" />
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-on-surface">Doorstep Delivery Instructions</h3>
                </div>
                <div className="space-y-space-sm">
                  <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-subtle">
                    <Icon name="phone_in_talk" className="text-primary text-lg mt-0.5" />
                    <p className="font-body-md text-body-md text-text-secondary">
                      The restaurant dispatch rider will call your mobile line (
                      <span className="font-medium text-on-surface">{MERCHANT_PHONE_DISPLAY}</span>) immediately upon
                      approaching your gate or security post.
                    </p>
                  </div>
                  <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-badge-discount-bg">
                    <Icon name="payments" className="text-badge-discount-text text-lg mt-0.5" />
                    <div>
                      <p className="font-label-md text-label-md text-badge-discount-text font-semibold">
                        Payment Upon Delivery
                      </p>
                      <p className="font-caption text-caption text-on-surface-variant">
                        Hand {naira(total)} to the courier via Cash or tap using their handheld wireless POS terminal
                        before order handover.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-subtle">
                    <Icon name="security" className="text-secondary text-lg mt-0.5" />
                    <p className="font-body-md text-body-md text-text-secondary">
                      Need to provide compound gate passes or specific drop-off notes? Dial the kitchen team directly
                      below.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="p-space-lg rounded-xl bg-surface-canvas shadow-sm space-y-space-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading-sm text-heading-sm text-on-surface">{MERCHANT_NAME}</h3>
                <p className="font-caption text-caption text-text-secondary">Kitchen Desk • Orders Helpdesk</p>
              </div>
              <span className="inline-flex items-center px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                Available Now
              </span>
            </div>

            <div className="grid grid-cols-3 gap-space-xs">
              <a
                className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container active:scale-95 transition-all text-center"
                href={`tel:${MERCHANT_PHONE_TEL}`}
              >
                <Icon name="call" className="text-primary text-xl mb-1" />
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">Direct Call</span>
              </a>
              <button
                type="button"
                onClick={onTrack}
                className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container active:scale-95 transition-all text-center"
              >
                <Icon name="chat" className="text-primary text-xl mb-1" />
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">In-App Chat</span>
              </button>
              <a
                className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container active:scale-95 transition-all text-center"
                href={`https://wa.me/${MERCHANT_PHONE_TEL}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon name="forum" filled className="text-badge-discount-text text-xl mb-1" />
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">WhatsApp</span>
              </a>
            </div>

            <div className="flex items-center justify-between pt-space-xs bg-surface-subtle p-space-sm rounded-lg">
              <div className="flex items-start gap-space-xs min-w-0 pr-2">
                <Icon name="location_on" className="text-primary text-lg mt-0.5 shrink-0" />
                <span className="font-caption text-caption text-text-secondary truncate">{MERCHANT_ADDRESS}</span>
              </div>
              <a
                className="shrink-0 font-button-secondary text-button-secondary text-primary font-semibold hover:underline"
                href={`https://maps.google.com/?q=${encodeURIComponent(MERCHANT_ADDRESS)}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                Directions
              </a>
            </div>
          </section>

          <section className="rounded-xl overflow-hidden shadow-sm">
            <a
              className="w-full h-28 bg-cover bg-center flex items-end p-space-sm relative"
              href={`https://maps.google.com/?q=${encodeURIComponent(MERCHANT_ADDRESS)}`}
              rel="noopener noreferrer"
              target="_blank"
              style={{ backgroundImage: `url('${MAP_IMAGE}')` }}
            >
              <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="relative flex items-center gap-space-xs text-on-primary">
                <Icon name="navigation" className="text-sm" />
                <span className="font-caption text-caption font-semibold">0.4 km away • 4 min drive</span>
              </span>
            </a>
          </section>

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
                <span className="font-caption text-caption px-space-xs py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-semibold">
                  {VOUCHER_CODE} Applied
                </span>
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
                  <div className="flex justify-between font-caption text-caption text-badge-discount-text font-semibold">
                    <span>Loyalty Voucher Discount</span>
                    <span>-{naira(order.savings)}</span>
                  </div>
                  {order.deliveryFee > 0 && (
                    <div className="flex justify-between font-caption text-caption text-text-secondary">
                      <span>Direct Dispatch Logistics</span>
                      <span>{naira(order.deliveryFee)}</span>
                    </div>
                  )}
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
