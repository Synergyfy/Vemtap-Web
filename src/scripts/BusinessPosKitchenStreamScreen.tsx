import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { naira } from './catalogueData';
import { PUBLIC_IMAGES } from './publicPosData';

interface BusinessPosKitchenStreamScreenProps {
  onBack: () => void;
  onReturnToRegister: () => void;
}

type StreamKey = 'new' | 'preparing' | 'ready' | 'completed';

const FILTERS: { key: StreamKey; label: string; count?: number }[] = [
  { key: 'new', label: 'New', count: 1 },
  { key: 'preparing', label: 'Preparing', count: 2 },
  { key: 'ready', label: 'Ready for Pickup', count: 1 },
  { key: 'completed', label: 'Completed' },
];

const TICKET_ITEMS = [
  {
    qty: 1,
    name: 'Woodfire Ribeye Steak (250g)',
    note: 'Medium rare • Extra peppercorn sauce',
    price: 16000,
    image: PUBLIC_IMAGES.ribeye,
  },
  {
    qty: 1,
    name: 'Double Smash Burger',
    note: 'No pickles • Toasted brioche',
    price: 6500,
    image: PUBLIC_IMAGES.burger,
  },
  {
    qty: 1,
    name: 'Passionfruit Mojito',
    note: 'Standard ice • Fresh mint',
    price: 3500,
    image: PUBLIC_IMAGES.mojito,
  },
];

export function BusinessPosKitchenStreamScreen({
  onBack,
  onReturnToRegister,
}: BusinessPosKitchenStreamScreenProps) {
  const [filter, setFilter] = useState<StreamKey>('new');
  const [ticket1, setTicket1] = useState<'new' | 'printing' | 'accepted' | 'rejected'>('new');
  const [ticket2, setTicket2] = useState<'preparing' | 'ready'>('preparing');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const showTicket1 = filter === 'new' && ticket1 !== 'rejected';
  const showTicket2 = (filter === 'preparing' && ticket2 === 'preparing') || (filter === 'ready' && ticket2 === 'ready');
  const showEmpty = !showTicket1 && !showTicket2;

  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              type="button"
              aria-label="Go back"
              onClick={onBack}
              className="w-11 h-11 flex items-center justify-center rounded-xl text-on-surface hover:bg-surface-container active:scale-95 transition-transform shrink-0"
            >
              <Icon name="arrow_back" className="text-[23px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-text-primary truncate">Kitchen Stream</h1>
          </div>
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Icon name="person" className="text-on-primary text-[17px]" />
          </span>
        </div>
      </header>

      <div className="flex flex-col pb-8">
        {/* Operational header & live status stream */}
        <div className="px-margin pt-2 pb-space-sm flex flex-col gap-space-xs bg-surface-bright shadow-sm">
          <div className="flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-space-2xs min-w-0">
              <Icon name="storefront" filled className="text-[17px] text-primary" />
              <span className="font-label-sm text-label-sm text-text-secondary truncate">
                Wuse Branch • Till #01
              </span>
            </div>
            <div className="flex items-center gap-space-2xs bg-badge-discount-bg text-badge-discount-text px-space-xs py-space-2xs rounded-full shrink-0">
              <span className="inline-block w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-caption text-caption font-semibold">Live Stream (3 incoming)</span>
            </div>
          </div>
          {/* Segmented filter chips */}
          <div className="flex items-center gap-space-2xs overflow-x-auto no-scrollbar pt-space-2xs pb-space-2xs -mx-margin px-margin">
            {FILTERS.map((item) => {
              const active = filter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={`flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full font-label-sm text-label-sm shrink-0 transition-transform active:scale-95 ${
                    active
                      ? 'bg-surface-tint-blue text-primary font-semibold shadow-sm'
                      : 'bg-surface-container text-text-secondary'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.count !== undefined && (
                    <span
                      className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center ${
                        active ? 'bg-primary text-on-primary font-bold' : 'bg-surface-variant text-text-secondary font-medium'
                      }`}
                    >
                      {item.key === 'preparing' && ticket2 === 'ready' ? Math.max(0, item.count - 1) : item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main order stream */}
        <div className="px-margin flex flex-col gap-space-md pt-space-md">
          {/* Card 1: Urgent incoming public POS order */}
          {showTicket1 && (
            <div className="bg-surface-canvas rounded-xl shadow-md overflow-hidden relative">
              <div className="h-1.5 w-full bg-primary-container" />
              {ticket1 === 'accepted' ? (
                <div className="p-space-md flex items-center justify-center gap-space-xs text-badge-discount-text bg-badge-discount-bg">
                  <Icon name="check_circle" className="text-[22px]" />
                  <span className="font-label-md text-label-md font-bold text-center">
                    Dispatched to Kitchen Display &amp; POS Chits Queued!
                  </span>
                </div>
              ) : (
                <>
                  {/* Top alert ribbon */}
                  <div className="bg-surface-tint-blue px-space-md py-space-xs flex items-center justify-between gap-space-xs">
                    <div className="flex items-center gap-space-2xs min-w-0">
                      <Icon name="bolt" filled className="text-[17px] text-primary shrink-0" />
                      <span className="font-label-sm text-label-sm text-primary font-semibold uppercase tracking-wider truncate">
                        New Public POS Order
                      </span>
                    </div>
                    <span className="font-caption text-caption text-text-secondary flex items-center gap-space-2xs shrink-0">
                      <Icon name="schedule" className="text-[13px]" />
                      <span>Just Now (14:32)</span>
                    </span>
                  </div>

                  <div className="p-space-md flex flex-col gap-space-sm">
                    {/* Order meta */}
                    <div className="flex items-start justify-between gap-space-xs">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-space-2xs">
                          <span className="font-heading-sm text-heading-sm text-text-primary">Order #UG-1085</span>
                          <span className="bg-secondary-fixed text-on-secondary-fixed font-caption text-caption px-space-xs py-space-2xs rounded-md font-semibold shrink-0">
                            Table 04
                          </span>
                        </div>
                        <div className="flex items-center gap-space-2xs mt-space-2xs text-text-secondary">
                          <Icon name="restaurant" className="text-[15px] text-text-tertiary" />
                          <span className="font-caption text-caption">Dine-In • Guest Order</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high flex flex-col items-center justify-center text-primary shrink-0">
                        <Icon name="table_restaurant" className="text-[19px]" />
                        <span className="font-caption text-caption font-bold">T-04</span>
                      </div>
                    </div>

                    {/* Customer identity pill */}
                    <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between gap-space-xs">
                      <div className="flex items-center gap-space-sm min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold font-label-md text-label-md shrink-0">
                          SA
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                            Samuel Adeleke
                          </span>
                          <span className="font-caption text-caption text-text-secondary truncate">
                            +234 802 345 6789
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label="Call guest"
                        onClick={() => showToast('Dialling Samuel Adeleke • +234 802 345 6789')}
                        className="w-8 h-8 rounded-full bg-surface-canvas shadow-sm flex items-center justify-center text-primary active:scale-95 transition-transform shrink-0"
                      >
                        <Icon name="call" className="text-[17px]" />
                      </button>
                    </div>

                    {/* Order items */}
                    <div className="flex flex-col gap-space-2xs">
                      <div className="flex items-center justify-between gap-space-xs">
                        <span className="font-label-sm text-label-sm font-semibold text-text-secondary uppercase">
                          Order Items (3)
                        </span>
                        <span className="font-caption text-caption text-badge-discount-text bg-badge-discount-bg px-space-xs py-space-2xs rounded font-medium">
                          Auto-synced
                        </span>
                      </div>
                      {TICKET_ITEMS.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between gap-space-sm bg-surface-subtle p-space-2xs rounded-lg"
                        >
                          <div className="flex items-center gap-space-xs min-w-0">
                            <img
                              src={item.image}
                              alt=""
                              loading="lazy"
                              className="w-14 h-14 rounded-lg object-cover shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-space-2xs">
                                <span className="w-5 h-5 rounded-full bg-primary text-on-primary font-caption text-caption font-bold flex items-center justify-center shrink-0">
                                  {item.qty}
                                </span>
                                <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                                  {item.name}
                                </span>
                              </div>
                              <span className="font-caption text-caption text-tertiary font-medium truncate mt-space-2xs">
                                {item.note}
                              </span>
                            </div>
                          </div>
                          <span className="font-label-md text-label-md text-text-primary font-semibold shrink-0">
                            {naira(item.price)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Guest request note */}
                    <div className="bg-surface-container-high rounded-lg p-space-sm flex items-start gap-space-xs">
                      <Icon name="info" filled className="text-[17px] text-tertiary shrink-0 mt-0.5" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-caption text-caption font-semibold text-text-primary">
                          Kitchen &amp; Waiter Note
                        </span>
                        <span className="font-caption text-caption text-text-secondary">
                          Allergies: None. &quot;Please bring extra napkins &amp; water right away.&quot;
                        </span>
                      </div>
                    </div>

                    {/* Total bill & settlement */}
                    <div className="bg-surface-tint-blue rounded-xl p-space-sm flex items-center justify-between gap-space-xs">
                      <div className="flex flex-col">
                        <span className="font-caption text-caption text-text-secondary">Order Total Value</span>
                        <span className="font-heading-sm text-heading-sm text-primary font-bold">₦27,950</span>
                      </div>
                      <div className="flex items-center gap-space-2xs bg-error-container text-on-error-container px-space-xs py-space-2xs rounded-md shrink-0">
                        <Icon name="schedule" className="text-[13px]" />
                        <span className="font-caption text-caption font-bold">Unpaid • Pay at Table</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-space-2xs pt-space-2xs">
                      <button
                        type="button"
                        onClick={() => {
                          setTicket1('accepted');
                          showToast('Order #UG-1085 sent to kitchen display');
                        }}
                        className="w-full h-11 bg-primary text-on-primary rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-transform"
                      >
                        <Icon name="check_circle" className="text-[20px]" />
                        <span>Accept Order &amp; Send to Kitchen</span>
                      </button>
                      <div className="grid grid-cols-2 gap-space-2xs">
                        <button
                          type="button"
                          disabled={ticket1 === 'printing'}
                          onClick={() => {
                            setTicket1('printing');
                            showToast('ESC/POS Kitchen Chit sent to Thermal Printer (Till #01 / Kitchen Station 1) for Order #UG-1085');
                            window.setTimeout(() => setTicket1('new'), 900);
                          }}
                          className="h-11 bg-surface-container text-text-primary rounded-lg font-button-secondary text-button-secondary flex items-center justify-center gap-space-2xs active:scale-95 transition-transform disabled:opacity-60"
                        >
                          <Icon name="receipt_long" className="text-[17px]" />
                          <span>{ticket1 === 'printing' ? 'Sending…' : 'Print Chit'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTicket1('rejected');
                            showToast('Order #UG-1085 rejected • guest notified of stock limits');
                          }}
                          className="h-11 bg-error-container text-on-error-container rounded-lg font-button-secondary text-button-secondary flex items-center justify-center gap-space-2xs active:scale-95 transition-transform"
                        >
                          <Icon name="cancel" className="text-[17px]" />
                          <span>Reject / Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Card 2: In-progress order */}
          {showTicket2 && (
            <div className="bg-surface-canvas rounded-xl shadow-sm overflow-hidden">
              {ticket2 === 'ready' ? (
                <div className="p-space-md flex items-center justify-between gap-space-xs bg-badge-discount-bg text-badge-discount-text">
                  <div className="flex items-center gap-space-xs min-w-0">
                    <Icon name="notifications_active" className="text-[19px] shrink-0" />
                    <span className="font-label-md text-label-md font-semibold truncate">
                      Order #UG-1084 Ready for Pickup
                    </span>
                  </div>
                  <span className="font-caption text-caption font-bold shrink-0">SMS Sent</span>
                </div>
              ) : (
                <>
                  <div className="bg-surface-container px-space-md py-space-xs flex items-center justify-between gap-space-xs">
                    <div className="flex items-center gap-space-2xs min-w-0">
                      <Icon name="local_fire_department" filled className="text-[17px] text-tertiary-container shrink-0" />
                      <span className="font-label-sm text-label-sm font-semibold text-text-primary truncate">
                        Order #UG-1084
                      </span>
                    </div>
                    <span className="font-caption text-caption bg-tertiary-fixed text-on-tertiary-fixed px-space-xs py-space-2xs rounded-full font-bold shrink-0">
                      Elapsed: 8 mins
                    </span>
                  </div>
                  <div className="p-space-md flex flex-col gap-space-2xs">
                    <div className="flex items-start justify-between gap-space-xs">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-space-2xs">
                          <span className="font-label-md text-label-md font-semibold text-text-primary">Fatima Bello</span>
                          <span className="bg-surface-container-high text-text-secondary text-[11px] px-space-xs py-0.5 rounded font-medium shrink-0">
                            Takeaway
                          </span>
                        </div>
                        <span className="font-caption text-caption text-text-secondary mt-0.5 truncate">
                          Pickup Counter • 2 Items (Smash Burger, Truffle Fries)
                        </span>
                      </div>
                      <span className="font-label-md text-label-md font-bold text-text-primary shrink-0">
                        {naira(9700)}
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden mt-space-2xs">
                      <div className="bg-tertiary-container h-2 rounded-full w-2/3" />
                    </div>
                    <div className="flex items-center justify-between pt-space-xs gap-space-xs">
                      <div className="flex items-center gap-space-2xs text-text-secondary min-w-0">
                        <Icon name="verified" filled className="text-[15px] text-badge-discount-text shrink-0" />
                        <span className="font-caption text-caption truncate">Cook station: Grill &amp; Fryer</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTicket2('ready');
                          showToast('Order #UG-1084 marked ready • pickup SMS sent to Fatima Bello');
                        }}
                        className="h-10 px-space-md bg-primary text-on-primary rounded-lg font-button-secondary text-button-secondary flex items-center gap-space-2xs shadow-sm active:scale-95 transition-transform shrink-0"
                      >
                        <span>Mark Ready</span>
                        <Icon name="arrow_forward" className="text-[15px]" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Empty state for filter with no matching tickets */}
          {showEmpty && (
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-md flex flex-col items-center text-center gap-space-2xs">
              <span className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center">
                <Icon name="restaurant" className="text-text-secondary text-[20px]" />
              </span>
              <span className="font-label-md text-label-md text-on-surface">No tickets in this lane</span>
              <span className="font-caption text-caption text-text-secondary max-w-[260px]">
                {filter === 'completed'
                  ? 'Completed tickets archive here once settled and printed at the counter.'
                  : 'New guest tickets land here the moment they are fired from the Public POS.'}
              </span>
            </div>
          )}

          {/* Quick stats bar & shortcuts dock */}
          <div className="bg-surface-canvas rounded-xl p-space-sm shadow-sm flex flex-col gap-space-sm">
            <div className="grid grid-cols-3 gap-space-2xs text-center">
              <div className="flex flex-col items-center p-space-2xs">
                <span className="font-caption text-caption text-text-secondary">Active</span>
                <span className="font-heading-sm text-heading-sm font-bold text-text-primary">
                  {ticket1 === 'new' || ticket1 === 'printing' ? 4 : 3}
                </span>
              </div>
              <div className="flex flex-col items-center p-space-2xs">
                <span className="font-caption text-caption text-text-secondary">Avg Prep</span>
                <span className="font-heading-sm text-heading-sm font-bold text-primary">14m</span>
              </div>
              <div className="flex flex-col items-center p-space-2xs">
                <span className="font-caption text-caption text-text-secondary">Alerts</span>
                <div className="flex items-center gap-space-2xs mt-0.5">
                  <Icon name="volume_up" className="text-[15px] text-badge-discount-text" />
                  <span className="font-caption text-caption font-bold text-badge-discount-text">ON</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onReturnToRegister}
              className="w-full h-11 bg-surface-container-high text-text-primary rounded-lg font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs active:scale-[0.98] transition-transform"
            >
              <Icon name="point_of_sale" className="text-[17px]" />
              <span>Return to Register (F1)</span>
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
