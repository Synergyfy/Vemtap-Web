import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { useBusinessOrder, useOrderStatusMutations } from '../hooks/business/useBusinessOrders';
import { hasApiConfig } from '../services/api/client';
import type { OrderStatus } from '../services/businessOrdersService';
import { apiErrorMessage } from '../services/errorMessages';
import { formatNaira, formatRelativeTime, parsePrice } from '../utils/format';
import {
  clockTime,
  isOrderPaid,
  orderPaymentLabel,
  orderQuantity,
  orderRef,
  orderStatus,
  orderTotalLabel,
  personName,
} from './ordersLive';

interface BusinessOrderDetailScreenProps {
  /** Live: the order to show (from the orders feed). */
  orderId?: string;
  onBack: () => void;
}

const CUSTOMER_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDitUORjWP7gx6kzReC-WC4_yC5Ja28lpv1WIlPM2_rR6m6Zbq4IrgjDPoVGDWJxJ6_woLHsEbok1JQhIU8i8SR9IRvnY9BkE0i3RQXPD2dmpYrD6JJp0_mPLTap9499v3GWSz4OiR-sYYmEJh19jciYH5woENo6_jSey0LJBYjnroSlIE10ko7lu52qs-MeJlzZ1svFROLNUDpBCV4FHTPXxXbmHK0pQ_J_AGQDdPg_5KqENLycIXiZA';
const CUSTOMER_ALT =
  'High quality customer portrait photography of Amina Bello, smiling professional young African woman in modern attire against a clean neutral cream studio backdrop, warm ambient lighting.';
const RIBEYE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAdEdxdPUi3zdxvqRBnywcwOBfjvzxOgZx8MjTUIkBghPm6KYVd4olOdgnqqr5yF2VVsQxk2sbvIa9Tx4MRdC0vFtAUtAEtcWyTURedMqvJGja981oTRata25f3_CZu57QUkhnkWDP7waN4tgaDwDnqwTv-ZQZSGZmUFh0Mhl6dJmiAA1v9BEranHVeh2XawBFiXEJAVzIIotojuvbod9VrkV2gsioARmWx--_LkbL557YEXuMZJwQJyg';
const RIBEYE_ALT =
  'Gourmet woodfire aged ribeye steak cooked medium-rare with fresh herb garnish and silky peppercorn sauce drizzle on artisan dark slate tableware, restaurant bistro styling.';
const FRIES_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAcGi_IZcSTyg9UzFWd_zG-FYfidkdpXeXJrbnK5zeIWwCC6I0D3DON0r3Pxb_1O-myGFKNp6ah9qllEy_iy2u48Kf2YxMQNpicNth3xKRrR5NW20S0wS3fLVU3ME05_OSfi79l3oWrxFh2OyYW5UP6qIgiRATx6mYBFt4P0wisVvoNJrfSG9GzYC93383OnhqUC8VPAgOcYjA2JQ8GIhGukJxccDuDJUEnCoyP_blcD38TZfBenPw2Zg';
const FRIES_ALT =
  'Crispy golden truffle parmesan fries sprinkled with freshly shaved parmesan shavings, chopped Italian parsley, and creamy truffle dipping aioli on warm ceramic surface.';
const LEMONADE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBhj3lZVf1FYiEtzrUTaeW3_22hRkZ4opss8ICs2jvFOsbNA1v3ntezZG7IXweOfsrnBHi6lgyoGT2-a6fmGz-cu1MQnqAaUfPtllHD8p5zCq3krYwH2O3DjsUUfCIGFXHs4T-y-F8UUxRQvQtdrPN124ZSd_X2mdmKdilnQb9oloradFoIkQLNtqpb9EvMkr5hL60DDvI8PZP8NwyHjJnmXFVFJn07-sdRED1FLjrYpNxXAEfmNG0lxA';
const LEMONADE_ALT =
  'Chilled artisanal fresh mint lemonade cocktail in frosty highball glass with lime wheel slice, crushed ice, and vibrant green mint sprig, natural sunlight bistro setting.';

interface OrderItem {
  img: string;
  alt: string;
  name: string;
  price: string;
  modifier: string;
  qty: string;
  unit?: string;
  highlight?: boolean;
}

const ORDER_ITEMS: OrderItem[] = [
  {
    img: RIBEYE_IMG,
    alt: RIBEYE_ALT,
    name: 'Woodfire Aged Ribeye Steak',
    price: '₦26,000',
    modifier: 'Medium-Rare • Peppercorn Sauce',
    qty: 'Qty: 2',
    unit: '₦13,000 each',
  },
  {
    img: FRIES_IMG,
    alt: FRIES_ALT,
    name: 'Truffle Parmesan Fries',
    price: '₦4,500',
    modifier: 'Extra Truffle Aioli on side',
    qty: 'Qty: 1',
    highlight: true,
  },
  {
    img: LEMONADE_IMG,
    alt: LEMONADE_ALT,
    name: 'Fresh Mint Lemonade',
    price: '₦4,000',
    modifier: 'Less Sugar • Crushed Ice',
    qty: 'Qty: 2',
    unit: '₦2,000 each',
  },
];

interface ToastState {
  message: string;
  icon: string;
  error?: boolean;
}

const STEP_RANK: Record<string, number> = { new: 0, processing: 1, ready: 2, completed: 3 };

export function BusinessOrderDetailScreen({ orderId, onBack }: BusinessOrderDetailScreenProps) {
  const [demoAccepted, setAccepted] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string, icon: string, error = false) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast({ message, icon, error });
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  // Live: the real order, with status changes sent to the API.
  const live = hasApiConfig();
  const order = useBusinessOrder(live ? orderId : null).data;
  const { order: statusMutation } = useOrderStatusMutations();
  const status = order ? orderStatus(order) : 'new';
  const rank = STEP_RANK[status] ?? 0;
  const closed = live && STEP_RANK[status] === undefined;
  const accepted = live ? status !== 'new' : demoAccepted;
  const v = <T,>(liveValue: T, demoValue: T) => (live ? liveValue : demoValue);
  const ref = order ? orderRef(order) : '—';
  const total = order ? orderTotalLabel(order) : '—';
  const customer = order ? personName(order.customer) : '—';
  const phone = order?.customer?.phone ?? '';
  const branchName = order?.branch?.name ?? '—';
  const liveItems: OrderItem[] = (order?.items ?? []).map((line) => {
    const quantity = line.quantity ?? 1;
    const unit = parsePrice(line.priceAtOrder);
    return {
      img: line.item?.mainImage ?? '',
      alt: line.item?.name ?? 'Item',
      name: line.item?.name ?? line.offer?.title ?? 'Item',
      price: formatNaira(unit * quantity),
      modifier: line.offer?.title ? `Deal: ${line.offer.title}` : '',
      qty: `Qty: ${quantity}`,
      unit: quantity > 1 ? `${formatNaira(unit)} each` : undefined,
    };
  });
  const items = v(liveItems, ORDER_ITEMS);
  const quantity = order ? orderQuantity(order) : 0;
  const timeline = order?.statusTimeline ?? {};

  const setStatus = (next: OrderStatus, message: string, icon: string) => {
    if (!order) return;
    statusMutation.mutate(
      { id: order.id, status: next },
      {
        onSuccess: () => showToast(message, icon),
        onError: (error) => showToast(apiErrorMessage(error), 'error', true),
      },
    );
  };

  const handleAccept = () => {
    if (live) return setStatus('processing', `Order ${ref} accepted`, 'restaurant');
    setAccepted(true);
    showToast('Order #VG-94021 confirmed & sent to grill!', 'restaurant');
  };

  return (
    <AppScreen>
      {/* Detail Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-space-md flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go back"
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate max-w-[210px]">Order Detail</h1>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              aria-label="More options"
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              type="button"
            >
              <Icon name="more_vert" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full flex-1 pb-10">
        {/* Top Utility Bar */}
        <div className="px-margin pt-space-sm pb-space-xs flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <span className="inline-flex items-center justify-center px-space-xs py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold shrink-0">
              {v(ref, '#VG-94021')}
            </span>
            <span className="font-caption text-caption text-text-secondary truncate">{v(branchName, 'Wuse II Branch')}</span>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button
              aria-label="Print Kitchen Receipt"
              className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-container-highest active:scale-95 transition-all shadow-sm"
              type="button"
              onClick={() => showToast('Printing thermal kitchen ticket...', 'print')}
            >
              <Icon name="receipt_long" className="text-[20px]" />
            </button>
            <button
              aria-label="Share Order Ticket"
              className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-container-highest active:scale-95 transition-all shadow-sm"
              type="button"
              onClick={() => showToast('Ticket link copied to clipboard', 'content_copy')}
            >
              <Icon name="share" className="text-[20px]" />
            </button>
          </div>
        </div>

        {/* Status Hero Banner */}
        <div className="px-margin mt-space-2xs">
          <div className="relative overflow-hidden rounded-xl bg-surface-canvas shadow-md p-space-md">
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-primary/5 rounded-full pointer-events-none" />
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-container opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary-container" />
                </span>
                <span className="font-label-md text-label-md text-tertiary-container font-semibold tracking-wide uppercase">
                  {closed
                    ? `Order ${status.replace('_', ' ')}`
                    : live && rank >= 2
                      ? status === 'completed'
                        ? 'Completed'
                        : 'Ready for Pickup'
                      : accepted
                        ? 'Accepted • In Preparation'
                        : 'New Incoming Order'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-on-surface-variant font-caption text-caption bg-surface-container px-space-xs py-0.5 rounded-full">
                <Icon name="schedule" className="text-[14px]" />
                <span>{v(formatRelativeTime(order?.createdAt), '4m ago')}</span>
              </div>
            </div>
            <div className="mt-space-xs">
              <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">
                {closed
                  ? 'This order is closed'
                  : live && status === 'completed'
                    ? 'Order Completed'
                    : live && status === 'ready'
                      ? 'Ready & Awaiting Handover'
                      : accepted
                        ? 'Kitchen Accepted & Preparing'
                        : 'Awaiting Kitchen Acceptance'}
              </h2>
              <p className="font-body-md text-body-md text-text-secondary mt-1 flex items-center gap-1.5">
                <Icon name="timer" className="text-[18px] text-primary" />
                Estimated pickup preparation window:
                <span className="font-semibold text-text-primary">{v('—', '25 mins')}</span>
              </p>
            </div>
            {/* Hero Fast Triage Action Buttons */}
            {!accepted && !closed && (
              <div className="grid grid-cols-2 gap-space-sm mt-space-md pt-space-xs">
                <button
                  className="h-12 rounded-xl bg-error-container text-on-error-container font-button-secondary text-button-secondary font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
                  type="button"
                  disabled={statusMutation.isPending}
                  onClick={() =>
                    live
                      ? setStatus('rejected', `Order ${ref} declined`, 'warning')
                      : showToast('Decline modal opened: notify kitchen lead', 'warning', true)
                  }
                >
                  <Icon name="close" className="text-[20px]" />
                  Decline
                </button>
                <button
                  className="h-12 rounded-xl bg-primary-container text-on-primary-container font-button-primary text-button-primary font-semibold flex items-center justify-center gap-1.5 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] active:scale-[0.98] transition-transform"
                  type="button"
                  disabled={statusMutation.isPending}
                  onClick={handleAccept}
                >
                  <Icon name="restaurant" className="text-[20px]" />
                  Accept Order
                </button>
              </div>
            )}
            {/* Kitchen Status Confirmation */}
            {accepted && !closed && (
              <div className="mt-space-sm p-space-xs rounded-lg bg-badge-discount-bg text-badge-discount-text font-label-md text-label-md flex items-center gap-space-xs justify-center text-center">
                <Icon name="check_circle" className="text-[18px]" />
                <span>{v(`Status: ${status === 'processing' ? 'In preparation' : status}`, 'Ticket sent to Kitchen Display #2')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Customer Profile & Direct Contact Card */}
        <div className="px-margin mt-space-md">
          <div className="rounded-xl bg-surface-canvas shadow-sm p-space-md flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-surface-container-high flex-shrink-0">
                  {live ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="person" className="text-text-secondary text-[24px]" />
                    </div>
                  ) : (
                    <img alt={CUSTOMER_ALT} className="w-full h-full object-cover" src={CUSTOMER_IMG} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-space-2xs">
                    <h3 className="font-heading-sm text-heading-sm text-text-primary leading-tight truncate">
                      {v(customer, 'Amina Bello')}
                    </h3>
                    <Icon name="verified" filled className="text-primary text-[18px]" />
                  </div>
                  <p className="font-caption text-caption text-text-secondary">{v(phone || '—', '+234 803 219 8831')}</p>
                </div>
              </div>
              <span className="px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center gap-1 shrink-0">
                <Icon name="stars" className="text-[14px]" />
                {v('—', 'Loyal Tier')}
              </span>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-subtle p-space-xs rounded-lg">
              <Icon name="military_tech" className="text-primary text-[20px]" />
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                {v('—', '12 previous orders • 450 Tap Points accumulated')}
              </span>
            </div>
            {/* Quick Communication Buttons */}
            <div className="grid grid-cols-2 gap-space-xs pt-1">
              <a
                className="h-11 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center gap-space-xs font-button-secondary text-button-secondary hover:bg-surface-container-highest transition-colors active:scale-[0.98]"
                href={v(phone ? `tel:${phone.replace(/\s+/g, '')}` : undefined, 'tel:+2348032198831')}
              >
                <Icon name="call" className="text-[18px]" />
                Call Customer
              </a>
              <button
                className="h-11 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center gap-space-xs font-button-secondary text-button-secondary hover:bg-primary-fixed transition-colors active:scale-[0.98]"
                type="button"
                onClick={() => showToast(v(`Opening chat with ${customer}...`, 'Opening encrypted chat with Amina...'), 'chat')}
              >
                <Icon name="chat" className="text-[18px]" />
                VEMTAP Chat
              </button>
            </div>
            {/* Customer Arrival Note */}
            <div className="rounded-lg bg-surface-container-low p-space-sm flex items-start gap-space-xs">
              <Icon name="directions_car" className="text-primary text-[20px] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                  Self-Pickup Instructions
                </span>
                <p className="font-body-md text-body-md text-text-primary mt-0.5 leading-snug">
                  {v(
                    order?.notes || (order?.tableNumber ? `Serve at table ${order.tableNumber}` : '—'),
                    'Self-Pickup at Wuse II Counter • Customer arriving in white Toyota Camry (Abuja plates).',
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items List & Financial Breakdown Card */}
        <div className="px-margin mt-space-md">
          <div className="rounded-xl bg-surface-canvas shadow-sm p-space-md">
            <div className="flex items-center justify-between pb-space-xs">
              <div className="flex items-center gap-space-2xs min-w-0">
                <Icon name="dinner_dining" className="text-primary text-[20px]" />
                <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">{v(`Order Items (${items.length} items, ${quantity} qty)`, 'Order Items (3 items, 5 qty)')}</h3>
              </div>
              <span className="font-caption text-caption bg-surface-container px-space-xs py-0.5 rounded-full text-on-surface-variant font-medium shrink-0">
                {v(status === 'ready' || status === 'completed' ? 'Kitchen Ready' : 'In Queue', 'Kitchen Ready')}
              </span>
            </div>
            {items.map((item, index) => (
              <div
                className={`py-space-sm flex items-start gap-space-sm ${
                  item.highlight ? 'bg-surface-subtle rounded-lg px-space-xs' : ''
                }`}
                key={`${item.name}-${index}`}
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                  {item.img && <img alt={item.alt} className="w-full h-full object-cover" src={item.img} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-space-xs">
                    <h4 className="font-label-md text-label-md font-semibold text-text-primary truncate">
                      {item.name}
                    </h4>
                    <span className="font-label-md text-label-md font-semibold text-text-primary shrink-0">
                      {item.price}
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">{item.modifier}</p>
                  <div className="flex items-center gap-space-xs mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-surface-container font-caption text-caption text-on-surface-variant font-medium">
                      {item.qty}
                    </span>
                    {item.unit && <span className="font-caption text-caption text-text-tertiary">{item.unit}</span>}
                  </div>
                </div>
              </div>
            ))}
            {/* Subtotal & Ledger Breakdown */}
            <div className="mt-space-sm pt-space-sm bg-surface-container-low p-space-sm rounded-xl flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-body-md text-body-md text-text-secondary">
                <span>{v(`Subtotal (${quantity} items)`, 'Subtotal (5 items)')}</span>
                <span>{v(total, '₦34,500')}</span>
              </div>
              {!live && (
              <>
              <div className="flex items-center justify-between font-body-md text-body-md text-badge-discount-text">
                <span className="flex items-center gap-1">
                  <Icon name="local_offer" className="text-[16px]" />
                  VEMTAP 10% Member Perk
                </span>
                <span>-₦2,500</span>
              </div>
              <div className="flex items-center justify-between font-body-md text-body-md text-badge-discount-text">
                <span className="flex items-center gap-1">
                  <Icon name="redeem" className="text-[16px]" />
                  Tap Points Redeemed (200 pts)
                </span>
                <span>-₦1,000</span>
              </div>
              </>
              )}
              <div className="mt-space-2xs pt-space-xs flex items-center justify-between">
                <span className="font-heading-sm text-heading-sm text-text-primary font-bold">
                  Total Payable to Merchant
                </span>
                <span className="font-heading-md text-heading-md text-primary font-bold">{v(total, '₦31,000')}</span>
              </div>
              {/* Direct Merchant Settlement Box */}
              <div className="mt-space-xs p-space-sm rounded-lg bg-surface-canvas border border-border-subtle flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-text-secondary">
                    Direct Merchant Settlement
                  </span>
                  <span className="px-space-xs py-0.5 rounded-full bg-error-container text-error font-caption text-caption font-semibold flex items-center gap-1">
                    <Icon name="pending" className="text-[14px]" />
                    {live && order
                      ? isOrderPaid(order)
                        ? 'Settled'
                        : accepted
                          ? 'Collect at Handover'
                          : 'Pending Payment at Counter'
                      : accepted
                        ? 'Collect at Handover'
                        : 'Pending Payment at Counter'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-space-xs pt-0.5">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="point_of_sale" className="text-primary text-[20px]" />
                    <div>
                      <p className="font-label-md text-label-md font-semibold text-text-primary">
                        {v(order?.payment?.method ?? 'POS, cash or transfer', 'POS Terminal / Card Swipe')}
                      </p>
                      <p className="font-caption text-caption text-text-secondary">
                        {v(order ? orderPaymentLabel(order) : '—', 'Pay at Business Location (Counter Pickup)')}
                      </p>
                    </div>
                  </div>
                  <span className="font-heading-sm text-heading-sm font-bold text-text-primary">{v(total, '₦31,000')}</span>
                </div>
                <div className="p-space-xs rounded bg-surface-container-low flex items-start gap-1.5 mt-0.5">
                  <Icon name="info" className="text-primary text-[16px] mt-0.5 flex-shrink-0" />
                  <p className="font-caption text-caption text-text-secondary leading-snug">
                    VEMTAP does not process customer funds. Settle {v(total, '₦31,000')} directly via your store POS, cash, or bank
                    transfer upon pickup.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Realtime Order Timeline Tracker */}
        <div className="px-margin mt-space-md">
          <div className="rounded-xl bg-surface-canvas shadow-sm p-space-md">
            <div className="flex items-center justify-between mb-space-sm">
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Order Progression Tracker</h3>
              <span className="font-caption text-caption text-primary font-semibold">Live Updates</span>
            </div>
            <div className="flex flex-col gap-space-sm relative">
              {/* Step 1 */}
              <div className="flex items-start gap-space-sm relative">
                <div className="w-7 h-7 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center flex-shrink-0 z-10">
                  <Icon name="done" className="text-[16px] font-bold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md font-semibold text-text-primary">Order Placed</span>
                    <span className="font-caption text-caption text-text-secondary">{v(clockTime(order?.createdAt), '1:45 PM')}</span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary">
                    Customer finalized order on VEMTAP Mobile
                  </p>
                </div>
              </div>
              {/* Step 2 */}
              <div className="flex items-start gap-space-sm relative">
                <div className="w-7 h-7 rounded-full bg-surface-container-high text-primary flex items-center justify-center flex-shrink-0 z-10">
                  <Icon name="point_of_sale" className="text-[16px] font-bold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md font-semibold text-text-primary">
                      Payment Method Selected
                    </span>
                    <span className="font-caption text-caption text-error font-medium">
                      {v(order && isOrderPaid(order) ? 'Settled' : 'Unsettled', 'Unsettled')}
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary">
                    {v(order ? orderPaymentLabel(order) : '—', 'Customer selected: Pay with POS at Counter Pickup')}
                  </p>
                </div>
              </div>
              {/* Step 3 (Active) */}
              <div className="flex items-start gap-space-sm relative">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                    accepted
                      ? 'bg-badge-discount-bg text-badge-discount-text'
                      : 'bg-primary text-on-primary shadow-sm'
                  }`}
                >
                  <Icon name={accepted ? 'done' : 'restaurant'} className={`text-[16px] ${accepted ? 'font-bold' : ''}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-label-md text-label-md font-semibold ${accepted ? 'text-text-primary' : 'text-primary'}`}>
                      {accepted ? 'Kitchen Accepted (Now in Prep)' : 'Kitchen Acceptance'}
                    </span>
                    <span
                      className={`font-caption text-caption font-semibold ${accepted ? 'text-badge-discount-text' : 'text-primary'}`}
                    >
                      {accepted ? v(clockTime(timeline.processing) || 'Confirmed', 'Confirmed') : 'Pending Response'}
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary">
                    {accepted ? 'Ticket routed to bistro kitchen display' : 'Pending acceptance from bistro kitchen lead'}
                  </p>
                </div>
              </div>
              {/* Step 4 */}
              <div className={`flex items-start gap-space-sm relative ${live && rank >= 1 ? '' : 'opacity-60'}`}>
                <div className="w-7 h-7 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center flex-shrink-0 z-10">
                  <Icon name="skillet" className="text-[16px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-label-md text-label-md font-medium text-text-primary">
                    Preparation & Cooking
                  </span>
                  <p className="font-caption text-caption text-text-secondary">{v('Target prep time —', 'Target prep time ~25 minutes')}</p>
                </div>
              </div>
              {/* Step 5 */}
              <div className={`flex items-start gap-space-sm relative ${live && rank >= 2 ? '' : 'opacity-60'}`}>
                <div className="w-7 h-7 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center flex-shrink-0 z-10">
                  <Icon name="shopping_bag" className="text-[16px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-label-md text-label-md font-medium text-text-primary">
                    Ready for Counter Pickup
                  </span>
                  <p className="font-caption text-caption text-text-secondary">
                    {v(clockTime(timeline.ready) || `${branchName} counter`, 'Wuse II Pick-up shelf #4')}
                  </p>
                </div>
              </div>
              {/* Step 6 */}
              <div className={`flex items-start gap-space-sm relative ${live && rank >= 3 ? '' : 'opacity-60'}`}>
                <div className="w-7 h-7 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center flex-shrink-0 z-10">
                  <Icon name="payments" className="text-[16px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-label-md text-label-md font-medium text-text-primary">
                    Payment Collected & Order Handover
                  </span>
                  <p className="font-caption text-caption text-text-secondary">
                    Confirm customer payment of {v(total, '₦31,000')} before handing over items
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Branch & Operational Fulfilment Card */}
        <div className="px-margin mt-space-md">
          <div className="rounded-xl bg-surface-canvas shadow-sm p-space-md flex flex-col gap-space-xs">
            <h3 className="font-label-md text-label-md font-semibold text-text-primary">Fulfillment Details</h3>
            <div className="grid grid-cols-2 gap-space-sm mt-1">
              <div className="bg-surface-container-low p-space-xs rounded-lg">
                <span className="font-caption text-caption text-text-secondary block">Location / Branch</span>
                <span className="font-label-sm text-label-sm font-semibold text-text-primary">{v(branchName, 'Wuse II Flagship')}</span>
              </div>
              <div className="bg-surface-container-low p-space-xs rounded-lg">
                <span className="font-caption text-caption text-text-secondary block">Assigned Station</span>
                <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                  {v(order?.attendedByUser ? personName(order.attendedByUser) : '—', 'Kitchen Counter #2')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Operations Management Suite */}
        <div className="px-margin mt-space-md flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm uppercase font-semibold text-text-secondary tracking-wider">
            Quick State Modifiers
          </span>
          <div className="grid grid-cols-2 gap-space-xs">
            <button
              className="h-11 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center gap-1.5 font-button-secondary text-button-secondary hover:bg-surface-container-highest active:scale-[0.98] transition-all"
              type="button"
              disabled={live && (statusMutation.isPending || status !== 'new')}
              onClick={() =>
                live ? setStatus('processing', 'Status set to Preparation', 'microwave') : showToast('Status set to Preparation', 'microwave')
              }
            >
              <Icon name="microwave" className="text-[18px]" />
              Mark Processing
            </button>
            <button
              className="h-11 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center gap-1.5 font-button-secondary text-button-secondary hover:bg-surface-container-highest active:scale-[0.98] transition-all"
              type="button"
              disabled={live && (statusMutation.isPending || status !== 'processing')}
              onClick={() =>
                live
                  ? setStatus('ready', 'Customer notified for pickup!', 'notifications_active')
                  : showToast('Customer notified for pickup!', 'notifications_active')
              }
            >
              <Icon name="inventory_2" className="text-[18px]" />
              Mark Ready
            </button>
            <button
              className="h-11 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center gap-1.5 font-button-secondary text-button-secondary hover:bg-surface-container-highest active:scale-[0.98] transition-all"
              type="button"
              disabled={live && (statusMutation.isPending || status !== 'ready')}
              onClick={() =>
                live
                  ? setStatus('completed', 'Order completed and archived', 'task_alt')
                  : showToast('Order completed and archived', 'task_alt')
              }
            >
              <Icon name="payments" className="text-[18px]" />
              Confirm Payment & Complete
            </button>
            <button
              className="h-11 rounded-lg bg-surface-container-low text-error flex items-center justify-center gap-1.5 font-button-secondary text-button-secondary hover:bg-error-container active:scale-[0.98] transition-all"
              type="button"
              onClick={() => showToast('Opening Paystack settlement ledger...', 'receipt', true)}
            >
              <Icon name="currency_exchange" className="text-[18px]" />
              Adjust / Refund
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Feedback Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50">
          <div className="rounded-xl bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-space-xs min-w-0">
              <Icon
                name={toast.icon}
                className={`text-[20px] shrink-0 ${toast.error ? 'text-error' : 'text-badge-discount-text'}`}
              />
              <span className="font-body-md text-body-md font-medium truncate">{toast.message}</span>
            </div>
            <span className="font-caption text-caption text-inverse-primary font-semibold shrink-0">VEMTAP OS</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
