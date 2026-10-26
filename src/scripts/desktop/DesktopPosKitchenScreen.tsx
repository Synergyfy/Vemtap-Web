import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { naira } from '../catalogueData';
import { PUBLIC_IMAGES } from '../publicPosData';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';
import { hasApiConfig } from '../../services/api/client';
import { apiErrorMessage } from '../../services/errorMessages';
import type { KitchenOrder } from '../../services/posService';
import { useLiveKitchen, useLivePos, type KitchenLane } from '../posLive';
import { LiveNewTicket, LiveProgressTicket } from '../BusinessPosKitchenStreamScreen';

interface DesktopPosKitchenScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
  onReturnToRegister: () => void;
}

type StreamKey = 'new' | 'preparing' | 'ready' | 'completed';
type Ticket1State = 'new' | 'printing' | 'accepted' | 'rejected';

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

export function DesktopPosKitchenScreen({ onNav, onReturnToRegister }: DesktopPosKitchenScreenProps) {
  const [filter, setFilter] = useState<StreamKey>('new');
  const [ticket1, setTicket1] = useState<Ticket1State>('new');
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

  const live = hasApiConfig();
  const pos = useLivePos();
  const kitchen = useLiveKitchen();
  const laneOrders = live ? kitchen.lane(filter) : [];
  const where = live ? `${pos.branchName} • ${pos.isOpen ? pos.tillName : 'No till open'}` : 'Wuse Branch • Till #01';

  useEffect(() => {
    if (live && kitchen.error) showToast(apiErrorMessage(kitchen.error, 'Could not load the kitchen stream.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kitchen.error]);

  const move = (order: KitchenOrder, to: KitchenLane, message: string) => {
    kitchen
      .move(order, to)
      .then(() => showToast(message))
      .catch((error: unknown) => showToast(apiErrorMessage(error, 'Could not update the ticket.')));
  };

  const syncKitchenDisplay = () => {
    if (live) {
      void kitchen.refetch().then(() => showToast(`Kitchen stream refreshed • ${kitchen.count('new')} incoming`));
      return;
    }
    showToast('Kitchen Display synced • Station 1 online • Live Stream (3 incoming)');
  };

  const showTicket1 = filter === 'new' && ticket1 !== 'rejected';
  const showTicket2 = (filter === 'preparing' && ticket2 === 'preparing') || (filter === 'ready' && ticket2 === 'ready');
  const showEmpty = live ? laneOrders.length === 0 : !showTicket1 && !showTicket2;
  const visibleTickets = live ? laneOrders.length : (showTicket1 ? 1 : 0) + (showTicket2 ? 1 : 0);

  return (
    <PosTerminalChrome onNav={onNav} activeNav="orders">
      {/* Live kitchen status banner */}
      <div className="py-space-xs bg-badge-discount-bg text-badge-discount-text">
        <div className="w-full flex flex-wrap items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-badge-discount-text animate-pulse" />
            <span className="font-label-md text-label-md font-semibold">{where}</span>
            <span className="text-text-tertiary">|</span>
            <span className="font-body-md text-body-md">
              Live Stream ({live ? kitchen.count('new') : 3} incoming) — tickets fire here the moment a Public POS guest checks out.
            </span>
          </div>
          <div className="flex items-center gap-space-xs text-badge-discount-text font-caption text-caption uppercase tracking-wider font-semibold">
            <Icon name="restaurant" className="text-[16px]" />
            <span>Kitchen Display • Station 1</span>
          </div>
        </div>
      </div>

      {/* Page header: eyebrow, title, supporting sentence & primary action */}
      <div className="pt-space-lg pb-space-md flex flex-col gap-space-md">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md">
          <div className="flex flex-col">
            <button
              type="button"
              onClick={onReturnToRegister}
              className="self-start inline-flex items-center gap-space-2xs mb-space-xs text-primary font-label-sm text-label-sm font-semibold hover:underline transition-colors"
            >
              <Icon name="arrow_back" className="text-[16px]" />
              <span>Return to Register</span>
            </button>
            <div className="flex items-center gap-space-xs text-text-tertiary font-caption text-caption uppercase tracking-wider mb-space-2xs">
              <span>Live Kitchen Operations</span>
              <span>•</span>
              <span>{where}</span>
            </div>
            <div className="flex items-center gap-space-sm">
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Kitchen Stream</h1>
              <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue font-label-sm text-label-sm text-primary font-medium">
                Station 1
              </span>
            </div>
            <p className="font-body-md text-body-md text-text-secondary mt-space-2xs max-w-2xl">
              Watch every Public POS ticket from fire to pickup — accept incoming orders, monitor prep timing and bump
              ready tickets straight from the register terminal.
            </p>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            <button
              type="button"
              onClick={syncKitchenDisplay}
              className="inline-flex items-center gap-space-xs px-space-lg py-3 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:bg-primary transition-all active:scale-[0.98]"
            >
              <Icon name="sync" className="text-[20px]" />
              <span>Sync Kitchen Display</span>
            </button>
          </div>
        </div>

        {/* Segmented filter chips */}
        <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar">
          {FILTERS.map((item) => {
            const active = filter === item.key;
            const liveCount = live && item.key !== 'completed' ? kitchen.count(item.key) : undefined;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`flex items-center gap-space-2xs px-space-sm py-2 rounded-full font-label-sm text-label-sm shrink-0 transition-all hover:scale-[1.02] ${
                  active
                    ? 'bg-surface-tint-blue text-primary font-semibold shadow-sm'
                    : 'bg-surface-container-high text-text-secondary hover:text-text-primary'
                }`}
              >
                <span>{item.label}</span>
                {(live ? liveCount !== undefined : item.count !== undefined) && (
                  <span
                    className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center ${
                      active ? 'bg-primary text-on-primary font-bold' : 'bg-surface-canvas text-text-secondary font-medium'
                    }`}
                  >
                    {live
                      ? liveCount
                      : item.key === 'preparing' && ticket2 === 'ready'
                        ? Math.max(0, (item.count ?? 0) - 1)
                        : item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-column body: live stream + station vitals */}
      <div className="pb-space-xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        {/* Left column: main order stream */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <Icon name="restaurant" className="text-primary text-[22px]" />
              <h2 className="font-heading-md text-heading-md text-on-surface">Live Order Stream</h2>
            </div>
            <span className="font-caption text-caption px-space-xs py-1 rounded bg-surface-container font-medium text-text-secondary">
              {visibleTickets} in lane
            </span>
          </div>

          {live &&
            laneOrders.map((order) =>
              filter === 'new' ? (
                <LiveNewTicket
                  key={order.id}
                  order={order}
                  onAccept={() => move(order, 'preparing', `Order #${order.reference} sent to kitchen display`)}
                  onToast={showToast}
                />
              ) : (
                <LiveProgressTicket
                  key={order.id}
                  order={order}
                  lane={filter}
                  onReady={() => move(order, 'ready', `Order #${order.reference} marked ready`)}
                />
              ),
            )}

          {!live && (
          <>
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
                          <span className="bg-surface-container-high text-text-secondary font-caption text-caption px-space-xs py-space-2xs rounded-md font-semibold shrink-0">
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
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold font-label-md text-label-md shrink-0">
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
                        className="w-8 h-8 rounded-full bg-surface-canvas shadow-sm flex items-center justify-center text-primary hover:bg-surface-tint-blue active:scale-95 transition-transform shrink-0"
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
                              <span className="font-caption text-caption text-text-tertiary font-medium truncate mt-space-2xs">
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
                      <Icon name="info" filled className="text-[17px] text-text-tertiary shrink-0 mt-0.5" />
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
                        className="w-full h-11 bg-primary text-on-primary rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-md hover:bg-primary-container active:scale-[0.98] transition-transform"
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
                            showToast(
                              'ESC/POS Kitchen Chit sent to Thermal Printer (Till #01 / Kitchen Station 1) for Order #UG-1085',
                            );
                            window.setTimeout(() => setTicket1('new'), 900);
                          }}
                          className="h-11 bg-surface-container-high text-text-primary rounded-lg font-button-secondary text-button-secondary flex items-center justify-center gap-space-2xs hover:bg-surface-container active:scale-95 transition-transform disabled:opacity-60"
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
                          className="h-11 bg-error-container text-on-error-container rounded-lg font-button-secondary text-button-secondary flex items-center justify-center gap-space-2xs hover:opacity-90 active:scale-95 transition-transform"
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
                  <div className="bg-surface-container-high px-space-md py-space-xs flex items-center justify-between gap-space-xs">
                    <div className="flex items-center gap-space-2xs min-w-0">
                      <Icon name="local_fire_department" filled className="text-[17px] text-primary shrink-0" />
                      <span className="font-label-sm text-label-sm font-semibold text-text-primary truncate">
                        Order #UG-1084
                      </span>
                    </div>
                    <span className="font-caption text-caption bg-surface-tint-blue text-primary px-space-xs py-space-2xs rounded-full font-bold shrink-0">
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
                      <div className="bg-primary-container h-2 rounded-full w-2/3" />
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
                        className="h-10 px-space-md bg-primary text-on-primary rounded-lg font-button-secondary text-button-secondary flex items-center gap-space-2xs shadow-sm hover:bg-primary-container active:scale-95 transition-transform shrink-0"
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

          </>
          )}

          {/* Empty state for filter with no matching tickets */}
          {showEmpty && (
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col items-center text-center gap-space-2xs">
              <span className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center">
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
        </div>

        {/* Right column: quick stats & shortcuts dock */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <Icon name="monitoring" className="text-primary text-[22px]" />
              <h2 className="font-heading-md text-heading-md text-on-surface">Station Vitals</h2>
            </div>
            <span className="inline-flex items-center gap-1 font-caption text-caption text-badge-discount-text font-medium">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
              HEALTHY
            </span>
          </div>

          {/* Quick stats bar */}
          <div className="grid grid-cols-3 gap-space-xs">
            <div className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col items-center text-center gap-space-2xs">
              <span className="font-caption text-caption text-text-secondary">Active</span>
              <span className="font-display-hero text-display-hero leading-none text-text-primary">
                {live ? kitchen.active : ticket1 === 'new' || ticket1 === 'printing' ? 4 : 3}
              </span>
            </div>
            <div className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col items-center text-center gap-space-2xs">
              <span className="font-caption text-caption text-text-secondary">Avg Prep</span>
              <span className="font-display-hero text-display-hero leading-none text-primary">{live ? (kitchen.averagePrep != null ? `${Math.round(kitchen.averagePrep)}m` : '—') : '14m'}</span>
            </div>
            <div className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col items-center text-center gap-space-2xs">
              <span className="font-caption text-caption text-text-secondary">Alerts</span>
              <span className="flex items-center gap-space-2xs mt-0.5">
                <Icon name="volume_up" className="text-[16px] text-badge-discount-text" />
                <span className="font-heading-sm text-heading-sm font-bold text-badge-discount-text">ON</span>
              </span>
            </div>
          </div>

          {/* Shortcuts dock */}
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md font-semibold text-text-primary">Terminal Shortcuts</span>
              <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                Station POS-NG-ABJ-004
              </span>
            </div>
            <button
              type="button"
              onClick={onReturnToRegister}
              className="w-full h-11 bg-surface-container-high text-text-primary rounded-lg font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs hover:bg-surface-container-highest active:scale-[0.98] transition-transform"
            >
              <Icon name="point_of_sale" className="text-[17px]" />
              <span>Return to Register (F1)</span>
            </button>
            <div className="flex items-center justify-between font-caption text-caption text-text-tertiary">
              <span>{where}</span>
              <span className="font-medium text-text-secondary">Live Stream (3 incoming)</span>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 w-full max-w-md z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </PosTerminalChrome>
  );
}
