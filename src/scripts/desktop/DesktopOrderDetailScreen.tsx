import { useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopOrderDetailScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
}

const URBAN_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCta-AVcjCZDWInIcUOJAuZYV2oAQHyTKLW5eoRshVGRfv8UJJbZ9ZCzBn61chEDIfTHAGW1GJtmX2WtS91OqMMUuKu_rwDf5fhd87TDW44tR2GYusQ1Q0A_EdzsPpIuPe9Ka3jV_pnY_4A-0zbBoXeaXu8h257sUKg1LWCudIZeklCl2b_QS7i_d4Cq3p8rIm-xBCEHufzUuVhTBN4Z6tLGW_WUhyJZBbwR8YVUOYg';
const URBAN_ALT =
  'Plated gourmet woodfire steak dinner at Urban Grill and Bistro Abuja with warm ambient restaurant spotlighting';

const DIRECTIONS_URL = 'https://www.google.com/maps/search/?api=1&query=Apo%20Boulevard%2C%20Abuja';
const PICKUP_PIN = '6241';
const ORDER_REF = 'UG-9021-XT88';

const STEPS = [
  { label: 'Order Received', meta: 'Today, 12:14 PM WAT', state: 'done' },
  { label: 'In the Kitchen', meta: 'Chef Ibrahim is on the grill', state: 'current' },
  { label: 'Ready for Pickup', meta: 'Estimated by 1:05 PM', state: 'todo' },
  { label: 'Picked Up', meta: 'Show your PIN at the counter', state: 'todo' },
];

const ITEMS = [
  { qty: '1x', name: 'Woodfire Aged Ribeye Steak', meta: 'Green peppercorn jus on the side', price: '₦15,000' },
  { qty: '1x', name: 'Truffle Parmesan Fries', meta: 'Extra parmesan', price: '₦3,900' },
  { qty: '1x', name: 'House Craft Peach Iced Tea', meta: 'Less ice', price: '₦2,500' },
];

export function DesktopOrderDetailScreen({ onNav, onBack }: DesktopOrderDetailScreenProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = (message: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  };

  const copyValue = (value: string, label: string) => {
    navigator.clipboard?.writeText(value).catch(() => undefined);
    setCopied(value);
    showToast(`${label} copied: ${value}`);
    window.setTimeout(() => setCopied((current) => (current === value ? null : current)), 2000);
  };

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="orders">
      <div className="w-full bg-surface-canvas min-h-[calc(100vh-80px)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1 text-text-tertiary font-caption text-caption">
              <li className="flex items-center gap-1">
                <button className="hover:text-primary transition-colors" onClick={() => onNav('home')} type="button">
                  Home
                </button>
                <Icon name="chevron_right" className="text-[14px]" />
              </li>
              <li className="flex items-center gap-1">
                <button className="hover:text-primary transition-colors" onClick={onBack} type="button">
                  Orders &amp; Bookings
                </button>
                <Icon name="chevron_right" className="text-[14px]" />
              </li>
              <li aria-current="page" className="font-label-sm text-label-sm text-text-primary">
                Order #UG-9021
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                <span>In the Kitchen • Estimated ready by 1:05 PM</span>
              </div>
              <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                Order #UG-9021
              </h1>
              <p className="font-body-md text-body-md text-text-secondary">
                Dine-in at Urban Grill &amp; Bistro, Table #07 • Placed today at 12:14 PM WAT
              </p>
            </div>
            <button
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-subtle text-text-primary font-button-secondary text-button-secondary shadow-sm hover:bg-surface transition-all"
              onClick={onBack}
              type="button"
            >
              <Icon name="arrow_back" className="text-[20px] text-text-secondary" />
              <span>Back to Activity</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <section className="bg-surface-canvas rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-subtle">
                  <h2 className="font-heading-lg text-heading-lg text-text-primary font-bold tracking-tight">
                    Order Progress
                  </h2>
                  <span className="font-mono font-caption text-caption text-text-tertiary">REF #{ORDER_REF}</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {STEPS.map((step) => {
                    const done = step.state === 'done';
                    const current = step.state === 'current';
                    return (
                      <div
                        key={step.label}
                        className={`rounded-xl p-4 border ${
                          current
                            ? 'border-primary bg-surface-tint-blue'
                            : done
                              ? 'border-border-subtle bg-surface-subtle'
                              : 'border-border-subtle bg-surface-canvas'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center ${
                              done
                                ? 'bg-primary text-on-primary'
                                : current
                                  ? 'bg-primary/10 text-primary ring-2 ring-primary'
                                  : 'bg-surface-subtle text-text-tertiary'
                            }`}
                          >
                            <Icon
                              name={done ? 'check' : current ? 'restaurant' : 'radio_button_unchecked'}
                              filled={done || current}
                              className="text-[15px]"
                            />
                          </div>
                          {done && <Icon name="check_circle" className="text-[16px] text-badge-discount-text" />}
                          {current && <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />}
                        </div>
                        <span className="font-label-md text-label-md font-semibold text-text-primary block">
                          {step.label}
                        </span>
                        <span className="font-caption text-caption text-text-secondary">{step.meta}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="bg-surface-canvas rounded-2xl shadow-md p-6">
                <h2 className="font-heading-lg text-heading-lg text-text-primary font-bold tracking-tight mb-4">
                  Order Summary
                </h2>
                <ul className="divide-y divide-border-subtle">
                  {ITEMS.map((item) => (
                    <li key={item.name} className="flex items-start justify-between gap-4 py-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="px-2 py-0.5 rounded bg-surface-subtle text-text-secondary font-label-sm text-label-sm font-semibold shrink-0">
                          {item.qty}
                        </span>
                        <div className="min-w-0">
                          <span className="font-body-lg text-body-lg text-text-primary block">{item.name}</span>
                          <span className="font-caption text-caption text-text-tertiary">{item.meta}</span>
                        </div>
                      </div>
                      <span className="font-label-md text-label-md font-semibold text-text-primary shrink-0">
                        {item.price}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-border-subtle flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-body-md text-body-md text-text-secondary">Subtotal</span>
                    <span className="font-body-md text-body-md text-text-primary">₦21,400</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body-md text-body-md text-text-secondary flex items-center gap-1.5">
                      <Icon name="confirmation_number" className="text-[16px] text-badge-discount-text" />
                      Prime Lunch Deal (20% OFF)
                    </span>
                    <span className="font-body-md text-body-md text-badge-discount-text font-semibold">−₦2,400</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                    <span className="font-label-md text-label-md font-bold text-text-primary">Total Due</span>
                    <span className="font-heading-lg text-heading-lg font-bold text-text-primary">₦19,000</span>
                  </div>
                </div>
              </section>

              <section className="bg-surface-canvas rounded-2xl shadow-md p-6">
                <h2 className="font-heading-lg text-heading-lg text-text-primary font-bold tracking-tight mb-4">
                  Transaction Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle">
                    <div className="w-10 h-10 rounded-xl bg-surface-canvas shadow-sm flex items-center justify-center text-badge-discount-text">
                      <Icon name="credit_card" className="text-[20px]" />
                    </div>
                    <div>
                      <span className="font-caption text-caption text-text-tertiary block">Payment Method</span>
                      <span className="font-label-md text-label-md text-text-primary font-semibold">
                        Pay at Counter (Card)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle">
                    <div className="w-10 h-10 rounded-xl bg-surface-canvas shadow-sm flex items-center justify-center text-primary">
                      <Icon name="schedule" className="text-[20px]" />
                    </div>
                    <div>
                      <span className="font-caption text-caption text-text-tertiary block">Placed</span>
                      <span className="font-label-md text-label-md text-text-primary font-semibold">
                        Today, 12:14 PM WAT
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-subtle md:col-span-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-surface-canvas shadow-sm flex items-center justify-center text-primary">
                        <Icon name="tag" className="text-[20px]" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-caption text-caption text-text-tertiary block">Transaction Reference</span>
                        <span className="font-mono font-label-md text-label-md text-text-primary font-semibold">
                          #{ORDER_REF}
                        </span>
                      </div>
                    </div>
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-canvas hover:bg-surface-tint-blue hover:text-primary text-text-secondary font-label-sm text-label-sm font-semibold transition-colors shrink-0"
                      onClick={() => copyValue(ORDER_REF, 'Order reference')}
                      type="button"
                    >
                      <Icon name={copied === ORDER_REF ? 'check' : 'content_copy'} className="text-[16px]" />
                      <span>{copied === ORDER_REF ? 'Copied' : 'Copy Ref'}</span>
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <section className="bg-surface-tint-blue rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-label-sm text-label-sm font-semibold text-primary uppercase tracking-wider">
                    Counter Pickup PIN
                  </span>
                  <Icon name="pin" className="text-primary text-[20px]" filled />
                </div>
                <div className="flex items-center justify-between bg-surface-canvas rounded-xl px-4 py-3 shadow-sm">
                  <span className="font-mono text-heading-lg text-heading-lg font-bold tracking-[0.3em] text-text-primary">
                    {PICKUP_PIN}
                  </span>
                  <button
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-subtle hover:bg-surface-tint-blue hover:text-primary text-text-secondary font-label-sm text-label-sm font-semibold transition-colors"
                    onClick={() => copyValue(PICKUP_PIN, 'Pickup PIN')}
                    type="button"
                  >
                    <Icon name={copied === PICKUP_PIN ? 'check' : 'content_copy'} className="text-[16px]" />
                    <span>{copied === PICKUP_PIN ? 'Copied' : 'Copy PIN'}</span>
                  </button>
                </div>
                <p className="font-caption text-caption text-text-secondary mt-3 leading-relaxed">
                  Show this PIN when you collect your order at the Urban Grill counter. It replaces a printed ticket.
                </p>
              </section>

              <section className="bg-surface-canvas rounded-2xl shadow-md p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <img
                    alt={URBAN_ALT}
                    className="w-14 h-14 rounded-xl object-cover shadow-sm"
                    src={URBAN_IMG}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-heading-sm text-heading-sm text-text-primary font-bold truncate">
                        Urban Grill &amp; Bistro
                      </h3>
                      <Icon name="verified" filled className="text-primary text-[16px]" />
                    </div>
                    <span className="font-caption text-caption text-text-secondary block truncate">
                      Plot 14 Apo Boulevard, Abuja • 0.8 km
                    </span>
                    <span className="font-caption text-caption text-badge-discount-text font-semibold">
                      Open until 10:30 PM
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href="tel:+2348039204491"
                    className="h-10 rounded-xl bg-surface-subtle hover:bg-surface-tint-blue hover:text-primary text-text-secondary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Icon name="call" className="text-[16px]" />
                    <span>Call</span>
                  </a>
                  <button
                    className="h-10 rounded-xl bg-surface-subtle hover:bg-surface-tint-blue hover:text-primary text-text-secondary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    onClick={() => onNav('messages')}
                    type="button"
                  >
                    <Icon name="chat" className="text-[16px]" />
                    <span>Chat</span>
                  </button>
                  <a
                    href={DIRECTIONS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 rounded-xl bg-surface-subtle hover:bg-surface-tint-blue hover:text-primary text-text-secondary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Icon name="near_me" className="text-[16px]" />
                    <span>Directions</span>
                  </a>
                </div>
              </section>

              <section className="bg-surface-canvas rounded-2xl shadow-md p-6 flex flex-col gap-3">
                <button
                  className="w-full h-12 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
                  onClick={() => onNav('storefront')}
                  type="button"
                >
                  <Icon name="refresh" className="text-[20px]" />
                  <span>Reorder These Items</span>
                </button>
                <button
                  className="w-full h-12 rounded-xl bg-surface-subtle text-text-primary font-button-secondary text-button-secondary shadow-sm hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
                  onClick={() => showToast('PDF receipt saved to your device')}
                  type="button"
                >
                  <Icon name="download" className="text-[20px] text-text-secondary" />
                  <span>Download PDF Receipt</span>
                </button>
                <a
                  href="mailto:support@vemtap.ng?subject=Issue%20with%20order%20%23UG-9021"
                  className="w-full h-11 rounded-xl text-error font-label-md text-label-md font-semibold hover:bg-error-container/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="report" className="text-[18px]" />
                  <span>Report an Issue with this Order</span>
                </a>
                <p className="font-caption text-caption text-text-tertiary text-center leading-relaxed">
                  Payments settle directly with the merchant. VEMTAP verifies the discount and vaults your receipt.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-2xl flex items-center gap-space-sm">
          <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
          <span className="font-label-md text-label-md">{toast}</span>
        </div>
      )}
    </DesktopPage>
  );
}
