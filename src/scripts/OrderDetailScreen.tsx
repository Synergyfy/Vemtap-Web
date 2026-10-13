import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface OrderDetailScreenProps {
  onBack: () => void;
  onChat: () => void;
  onReorder: () => void;
  onSupport: () => void;
}

const URBAN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAI--zdhCQDqNIaUAFQUyyScD32B6PaFE8PYNPlwAAEUS3hvyURD_3XYhNE2ZssLu5cp1F51uX9_OJd2-F9zXtPPzyZDGx3PLSijXXJR7o0RYbFx2EPQ0JLA4pWSRlyejuc-I0MP3ps0FVbccbgwEQcsn5vt1_UUrHiJLzrXe_y0tOjDFe9tI_nByQxsEhv4gjxkXD-FKJyK57YQinUWWstMkdrx27HK_zhRFkspQSI';
const URBAN_ALT =
  'Woodfire dining grill interior with warm incandescent lighting and artisanal tables at Urban Grill and Bistro Apo Abuja';

const DIRECTIONS_URL = 'https://www.google.com/maps/search/?api=1&query=Apo%20Boulevard%2C%20Abuja';
const PICKUP_PIN = '6241';
const ORDER_REF = 'UG-9021-XT88';

const STEPS = [
  { label: 'Order Received', meta: 'Today, 12:14 PM', state: 'done' },
  { label: 'In the Kitchen', meta: 'Chef Ibrahim is on the grill', state: 'current' },
  { label: 'Ready for Pickup', meta: 'Estimated by 1:05 PM', state: 'todo' },
  { label: 'Picked Up', meta: 'Show your PIN at the counter', state: 'todo' },
];

const ITEMS = [
  { name: 'Woodfire Aged Ribeye Steak', meta: 'Green peppercorn jus on the side', price: '₦15,000' },
  { name: 'Truffle Parmesan Fries', meta: 'Extra parmesan', price: '₦3,900' },
  { name: 'House Craft Peach Iced Tea', meta: 'Less ice', price: '₦2,500' },
];

export function OrderDetailScreen({ onBack, onChat, onReorder, onSupport }: OrderDetailScreenProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2200);
  };

  const copyValue = (value: string, label: string) => {
    navigator.clipboard?.writeText(value).catch(() => undefined);
    setCopied(value);
    showToast(`${label} copied: ${value}`);
    window.setTimeout(() => setCopied((current) => (current === value ? null : current)), 2000);
  };

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-space-sm px-margin py-space-xs">
          <button
            aria-label="Go back"
            type="button"
            onClick={onBack}
            className="p-space-2xs text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center -ml-space-2xs"
          >
            <Icon name="arrow_back_ios_new" className="text-[24px]" />
          </button>
          <div className="flex flex-col min-w-0">
            <h1 className="font-heading-sm text-heading-sm text-text-primary truncate">Order Details</h1>
            <span className="font-mono font-caption text-caption text-text-tertiary">#UG-9021 • Urban Grill</span>
          </div>
        </div>
      </header>

      <main className="flex flex-col w-full px-margin py-space-sm pb-space-xl gap-space-md">
        <section className="bg-surface-tint-blue rounded-xl p-space-md flex items-start gap-space-sm">
          <div className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
            <Icon name="restaurant" className="text-[22px]" filled />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              <span className="font-label-md text-label-md font-bold text-tertiary">In the Kitchen</span>
            </div>
            <p className="font-body-md text-body-md text-text-secondary mt-0.5">
              Estimated ready by <span className="font-semibold text-text-primary">1:05 PM</span> • Dine-in, Table #07
            </p>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
          <h2 className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider mb-space-sm">
            Order Progress
          </h2>
          <ol className="flex flex-col">
            {STEPS.map((step, index) => {
              const isLast = index === STEPS.length - 1;
              const done = step.state === 'done';
              const current = step.state === 'current';
              return (
                <li key={step.label} className="flex gap-space-sm">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        done
                          ? 'bg-primary text-on-primary'
                          : current
                            ? 'bg-primary/10 text-primary ring-2 ring-primary'
                            : 'bg-surface-container-high text-text-tertiary'
                      }`}
                    >
                      <Icon
                        name={done ? 'check' : current ? 'restaurant' : 'radio_button_unchecked'}
                        filled={done || current}
                        className="text-[15px]"
                      />
                    </div>
                    {!isLast && <div className={`w-0.5 flex-1 min-h-6 my-1 ${done ? 'bg-primary' : 'bg-outline-variant/50'}`} />}
                  </div>
                  <div className={`pb-space-sm ${isLast ? '' : 'pb-md'}`}>
                    <span
                      className={`font-label-md text-label-md font-semibold block ${
                        done || current ? 'text-text-primary' : 'text-text-tertiary'
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="font-caption text-caption text-text-secondary">{step.meta}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
          <div className="flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-xs min-w-0">
              <div className="w-9 h-9 rounded-lg bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                <Icon name="pin" className="text-[18px]" filled />
              </div>
              <div className="min-w-0">
                <span className="font-label-sm text-label-sm text-text-primary font-semibold block">
                  Counter Pickup PIN
                </span>
                <span className="font-caption text-caption text-text-secondary">Show this PIN when you collect</span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs shrink-0">
              <span className="font-mono text-heading-sm font-bold tracking-[0.3em] text-text-primary">{PICKUP_PIN}</span>
              <button
                type="button"
                onClick={() => copyValue(PICKUP_PIN, 'Pickup PIN')}
                className="w-9 h-9 rounded-lg bg-surface-container text-primary hover:bg-surface-container-high flex items-center justify-center transition-colors"
                aria-label="Copy pickup PIN"
              >
                <Icon name={copied === PICKUP_PIN ? 'check' : 'content_copy'} className="text-[17px]" />
              </button>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <div className="relative shrink-0">
              <img
                className="w-12 h-12 rounded-full object-cover shadow-sm"
                alt={URBAN_ALT}
                src={URBAN_AVATAR}
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-badge-discount-text rounded-full ring-2 ring-surface-container-lowest" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">Urban Grill &amp; Bistro</h2>
                <Icon name="verified" filled className="text-primary text-[16px] shrink-0" />
              </div>
              <span className="font-caption text-caption text-text-secondary truncate">
                Plot 14 Apo Boulevard, Abuja • 0.8 km
              </span>
              <span className="font-caption text-caption text-badge-discount-text">Open until 10:30 PM</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-space-xs">
            <a
              href="tel:+2348039204491"
              className="h-10 rounded-xl bg-surface-container text-text-secondary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors"
            >
              <Icon name="call" className="text-[16px]" />
              <span>Call</span>
            </a>
            <button
              type="button"
              onClick={onChat}
              className="h-10 rounded-xl bg-surface-container text-text-secondary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors"
            >
              <Icon name="chat" className="text-[16px]" />
              <span>Chat</span>
            </button>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noreferrer"
              className="h-10 rounded-xl bg-surface-container text-text-secondary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors"
            >
              <Icon name="near_me" className="text-[16px]" />
              <span>Directions</span>
            </a>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <h2 className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">Order Summary</h2>
          <ul className="flex flex-col gap-space-sm">
            {ITEMS.map((item) => (
              <li key={item.name} className="flex items-start justify-between gap-space-sm">
                <div className="min-w-0">
                  <span className="font-body-md text-body-md text-text-primary block truncate">{item.name}</span>
                  <span className="font-caption text-caption text-text-tertiary">{item.meta}</span>
                </div>
                <span className="font-label-md text-label-md font-semibold text-text-primary shrink-0">{item.price}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-outline-variant/40 pt-space-xs flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-body-md text-body-md text-text-secondary">Subtotal</span>
              <span className="font-body-md text-body-md text-text-primary">₦21,400</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-md text-body-md text-text-secondary flex items-center gap-1">
                <Icon name="confirmation_number" className="text-[15px] text-badge-discount-text" />
                Prime Lunch Deal (20%)
              </span>
              <span className="font-body-md text-body-md text-badge-discount-text font-semibold">−₦2,400</span>
            </div>
            <div className="flex items-center justify-between pt-space-xs border-t border-outline-variant/40">
              <span className="font-label-md text-label-md font-bold text-text-primary">Total</span>
              <span className="font-heading-sm text-heading-sm font-bold text-text-primary">₦19,000</span>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
          <h2 className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider mb-space-xs">
            Transaction Details
          </h2>
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between gap-space-sm">
              <span className="font-caption text-caption text-text-secondary">Payment</span>
              <span className="font-label-sm text-label-sm text-text-primary font-medium flex items-center gap-1">
                <Icon name="credit_card" className="text-[15px] text-badge-discount-text" />
                Pay at Counter (Card)
              </span>
            </div>
            <div className="flex items-center justify-between gap-space-sm">
              <span className="font-caption text-caption text-text-secondary">Placed</span>
              <span className="font-label-sm text-label-sm text-text-primary font-medium">Today, 12:14 PM WAT</span>
            </div>
            <div className="flex items-center justify-between gap-space-sm">
              <span className="font-caption text-caption text-text-secondary">Reference</span>
              <button
                type="button"
                onClick={() => copyValue(ORDER_REF, 'Order reference')}
                className="flex items-center gap-1 font-mono font-label-sm text-label-sm text-primary font-semibold hover:underline"
              >
                <span>#{ORDER_REF}</span>
                <Icon name={copied === ORDER_REF ? 'check' : 'content_copy'} className="text-[15px]" />
              </button>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-space-xs">
          <a
            href="tel:+2348039204491"
            className="h-12 rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all hover:bg-primary"
          >
            <Icon name="call" className="text-[19px]" />
            <span>Call Kitchen</span>
          </a>
          <button
            type="button"
            onClick={onReorder}
            className="h-12 rounded-xl bg-surface-container text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors active:scale-[0.98]"
          >
            <Icon name="refresh" className="text-[19px]" />
            <span>Reorder These Items</span>
          </button>
          <button
            type="button"
            onClick={() => showToast('PDF receipt saved to your device')}
            className="h-12 rounded-xl bg-surface-container-low text-text-secondary font-button-secondary text-button-secondary flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors active:scale-[0.98]"
          >
            <Icon name="download" className="text-[19px]" />
            <span>Download PDF Receipt</span>
          </button>
          <button
            type="button"
            onClick={onSupport}
            className="h-11 text-error font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 hover:underline"
          >
            <Icon name="report" className="text-[17px]" />
            <span>Report an Issue with this Order</span>
          </button>
        </section>
      </main>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-md text-label-md shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
