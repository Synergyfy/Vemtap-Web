import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopBusinessOrderDetailScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onBack: () => void;
  orderStatus?: 'new' | 'accepted' | 'preparing' | 'ready';
  onAccept?: () => void;
  onDecline?: () => void;
  onStatusChange?: (status: string) => void;
}

const ITEMS = [
  {
    qty: '2×',
    name: 'Woodfire Ribeye Steak',
    meta: 'Medium rare • Green peppercorn jus',
    price: '₦15,000',
    station: 'GRILL',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCta-AVcjCZDWInIcUOJAuZYV2oAQHyTKLW5eoRshVGRfv8UJJbZ9ZCzBn61chEDIfTHAGW1GJtmX2WtS91OqMMUuKu_rwDf5fhd87TDW44tR2GYusQ1Q0A_EdzsPpIuPe9Ka3jV_pnY_4A-0zbBoXeaXu8h257sUKg1LWCudIZeklCl2b_QS7i_d4Cq3p8rIm-xBCEHufzUuVhTBN4Z6tLGW_WUhyJZBbwR8YVUOYg',
  },
  {
    qty: '1×',
    name: 'Truffle Parmesan Fries',
    meta: 'Extra parmesan on the side',
    price: '₦4,500',
    station: 'FRYER',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_QV6uRZyyO54NZ_xP-h2bJ8ASlYYKyHrhcifuXhWq8-8e8k7vVjQp92ikYv3cH5MH1U3mE-cqvqgIrgvoTD-_3v0kflAwqqy8Epu7Gxy7JGLPfKzbysfHasIYlfBSpqOZTvvLMf7DdGcoLZHsJdXHYXPoe6YzKvM1VfQBm0hKUBoocqfb1jEx0XIwvHG3Cu3MbVVrfoRPKvM2x6jDPEgCeLL7VDkEoBDmTl5tggWL',
  },
  {
    qty: '2×',
    name: 'Mint Lemonade',
    meta: 'Less ice',
    price: '₦2,500',
    station: 'BAR',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvPDiI1HY_kmgTwi-eVu0GLT8lvuFgOzG95QeQsUfatbuVmwj7kwKYeDUbbtr4EETbCZ_ejNMg6uBgyFxG_cn1uFJdwfCGTLAbCrZmd_GUlKdL8a97NwwfSIniiMVcdGRdWhM-IaPabMr2rOnyZ2RBo-cuPE43VbYg3vbAj21b0Y3a8_2y8n0mHkISpOptF2Uwtd6MA-LOZ_IaShQ2R67xbK2Cpn-xuuNmgk7LHQwT',
  },
];

const TIMELINE = [
  { label: 'Order Received', meta: 'Today, 12:14 PM • Auto-accepted', state: 'done' },
  { label: 'Accepted & Cooking', meta: 'Chef Ibrahim assigned', state: 'current' },
  { label: 'Quality Check', meta: 'Pending', state: 'todo' },
  { label: 'Ready for Pickup', meta: 'ETA 12:55 PM', state: 'todo' },
  { label: 'Picked Up', meta: 'PIN 6241', state: 'todo' },
];

const MODIFIERS = [
  { icon: 'restaurant', label: 'Mark Ready' },
  { icon: 'local_shipping', label: 'Dispatch' },
  { icon: 'print', label: 'Print KOT' },
  { icon: 'block', label: 'Cancel Order' },
];

export function DesktopBusinessOrderDetailScreen({
  onNav,
  onBack,
  orderStatus = 'new',
  onAccept,
  onDecline,
}: DesktopBusinessOrderDetailScreenProps) {
  const accepted = orderStatus !== 'new';

  return (
    <BusinessPortalChrome activeNav="orders" onNav={onNav}>
      <div className="w-full bg-background">
        <div className="w-full py-space-xl space-y-space-lg">
          <nav aria-label="Breadcrumb" className="flex items-center gap-space-2xs text-text-tertiary font-label-sm text-label-sm">
            <button type="button" onClick={() => onNav('overview')} className="hover:text-primary transition-colors">
              Business
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <button type="button" onClick={onBack} className="hover:text-primary transition-colors">
              Orders & Bookings
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-on-surface font-medium">#VG-94021</span>
          </nav>

          <div className="flex flex-wrap items-center gap-space-sm">
            <button type="button" onClick={onBack} className="flex items-center gap-space-2xs px-space-sm py-space-xs rounded-xl border border-border bg-surface text-on-surface font-label-sm text-label-sm hover:bg-surface-subtle">
              <Icon name="arrow_back" className="text-[16px]" />
              Back to Orders
            </button>
            <button type="button" className="px-space-sm py-space-xs rounded-xl border border-border bg-surface text-on-surface font-label-sm text-label-sm hover:bg-surface-subtle flex items-center gap-space-2xs">
              <Icon name="print" className="text-[16px]" />
              Print KOT
            </button>
            <button type="button" className="px-space-sm py-space-xs rounded-xl border border-border bg-surface text-on-surface font-label-sm text-label-sm hover:bg-surface-subtle flex items-center gap-space-2xs">
              <Icon name="receipt_long" className="text-[16px]" />
              Print Receipt
            </button>
            <button type="button" aria-label="More" className="w-9 h-9 rounded-xl border border-border bg-surface flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle">
              <Icon name="more_horiz" className="text-[18px]" />
            </button>
          </div>

          <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
              <div className="space-y-space-xs">
                <div className="flex flex-wrap items-center gap-space-sm">
                  <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">#VG-94021</h1>
                  <span
                    className={`px-space-xs py-space-2xs rounded-full font-label-sm text-label-sm font-semibold ${
                      accepted ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-tint-blue text-primary'
                    }`}
                  >
                    {accepted ? 'ACCEPTED — COOKING' : 'NEW ORDER'}
                  </span>
                  <span className="px-space-xs py-space-2xs rounded-full bg-surface-subtle text-on-surface-variant font-label-sm text-label-sm">
                    Pickup • 12:40 PM
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Amina Bello • Placed 12:14 PM • <span className="text-badge-discount-text font-medium">₦34,500.00</span>
                </p>
              </div>
              <div className="flex items-center gap-space-sm">
                <button
                  type="button"
                  onClick={onDecline}
                  disabled={accepted}
                  className="h-11 px-space-md rounded-xl border border-error text-error font-label-md text-label-md hover:bg-error/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Decline Order
                </button>
                <button
                  type="button"
                  onClick={onAccept}
                  disabled={accepted}
                  className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-space-xs"
                >
                  {accepted ? (
                    <>
                      <Icon name="check" filled className="text-[18px]" />
                      Accepted & Cooking
                    </>
                  ) : (
                    'Accept Order'
                  )}
                </button>
              </div>
            </div>
            <div className="mt-space-md">
              <div className="flex items-center justify-between mb-space-2xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Kitchen countdown</span>
                <span className="font-label-sm text-label-sm text-primary font-semibold">18 min remaining • 72%</span>
              </div>
              <div className="w-full h-2 bg-surface-subtle rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '72%' }} />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
            <div className="xl:col-span-7 space-y-space-lg">
              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg">
                <h2 className="font-heading-sm text-heading-sm text-on-surface mb-space-md">Customer</h2>
                <div className="flex items-start gap-space-md">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Icon name="person" filled className="text-on-primary text-[22px]" />
                  </div>
                  <div className="flex-1 space-y-space-2xs">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <span className="font-heading-sm text-heading-sm text-on-surface">Amina Bello</span>
                      <span className="px-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                        VIP
                      </span>
                      <span className="px-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                        12 orders
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">+234 803 445 1122 • amina.b@email.com</p>
                    <div className="flex flex-wrap gap-space-sm pt-space-2xs">
                      <button type="button" className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-lg border border-border font-label-sm text-label-sm text-primary hover:bg-surface-tint-blue">
                        <Icon name="call" className="text-[14px]" /> Call
                      </button>
                      <button type="button" onClick={() => onNav('messages')} className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-lg border border-border font-label-sm text-label-sm text-primary hover:bg-surface-tint-blue">
                        <Icon name="chat" className="text-[14px]" /> Chat
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-space-sm mt-space-md">
                  <div className="p-space-sm rounded-xl bg-surface-subtle">
                    <div className="font-label-sm text-label-sm text-on-surface-variant">Order history</div>
                    <div className="font-heading-sm text-heading-sm text-on-surface">12 lifetime orders</div>
                  </div>
                  <div className="p-space-sm rounded-xl bg-surface-subtle">
                    <div className="font-label-sm text-label-sm text-on-surface-variant">Loyalty tier</div>
                    <div className="font-heading-sm text-heading-sm text-primary">Gold • 2,400 pts</div>
                  </div>
                </div>
                <div className="mt-space-sm p-space-sm rounded-xl bg-surface-subtle flex items-start gap-space-xs">
                  <Icon name="sticky_note_2" className="text-[16px] text-on-surface-variant mt-0.5" />
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Pickup instructions: Call on arrival — lobby is under renovation, use side entrance.
                  </p>
                </div>
              </section>

              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg">
                <h2 className="font-heading-sm text-heading-sm text-on-surface mb-space-md">Order Manifest</h2>
                <div className="space-y-space-sm">
                  {ITEMS.map((item) => (
                    <div key={item.name} className="flex items-center gap-space-md p-space-sm rounded-xl border border-border">
                      <img src={item.img} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-space-xs">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">{item.qty}</span>
                          <span className="font-label-md text-label-md text-on-surface">{item.name}</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{item.meta}</p>
                        <span className="inline-flex mt-1 px-space-2xs py-space-2xs rounded bg-surface-subtle font-caption text-caption text-on-surface-variant">
                          Station: {item.station}
                        </span>
                      </div>
                      <span className="font-label-md text-label-md text-on-surface font-semibold shrink-0">{item.price}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg">
                <h2 className="font-heading-sm text-heading-sm text-on-surface mb-space-md">Payment & Settlement</h2>
                <div className="space-y-space-xs font-body-md text-body-md">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span className="text-on-surface">₦34,500.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Deal discount (Lunch Combo)</span>
                    <span className="text-badge-discount-text">− ₦2,500.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">VAT (7.5%)</span>
                    <span className="text-on-surface">₦1,000.00</span>
                  </div>
                  <div className="border-t border-border pt-space-xs flex justify-between font-heading-sm text-heading-sm">
                    <span className="text-on-surface">Settlement to you</span>
                    <span className="text-primary">₦31,000.00</span>
                  </div>
                </div>
                <div className="mt-space-md flex items-center gap-space-xs p-space-sm rounded-xl bg-badge-discount-bg text-badge-discount-text">
                  <Icon name="verified" filled className="text-[18px]" />
                  <span className="font-label-sm text-label-sm font-semibold">Zero commission — 100% of settlement lands in your wallet.</span>
                </div>
              </section>
            </div>

            <div className="xl:col-span-5 space-y-space-lg">
              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg">
                <div className="flex items-center justify-between mb-space-md">
                  <h2 className="font-heading-sm text-heading-sm text-on-surface">Progression</h2>
                  <span className="font-label-sm text-label-sm text-primary font-semibold">Step 2 of 5</span>
                </div>
                <div className="space-y-0">
                  {TIMELINE.map((step, i) => (
                    <div key={step.label} className="flex gap-space-sm">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            step.state === 'done'
                              ? 'bg-primary text-on-primary'
                              : step.state === 'current'
                                ? 'bg-surface-tint-blue text-primary border-2 border-primary'
                                : 'bg-surface-subtle text-text-tertiary border border-border'
                          }`}
                        >
                          {step.state === 'done' ? (
                            <Icon name="check" filled className="text-[14px]" />
                          ) : (
                            <span className="font-caption text-caption font-semibold">{i + 1}</span>
                          )}
                        </div>
                        {i < TIMELINE.length - 1 && (
                          <div className={`w-0.5 flex-1 min-h-6 ${step.state === 'done' ? 'bg-primary' : 'bg-border'}`} />
                        )}
                      </div>
                      <div className="pb-space-md flex-1">
                        <div className={`font-label-md text-label-md ${step.state === 'todo' ? 'text-on-surface-variant' : 'text-on-surface font-semibold'}`}>
                          {step.label}
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">{step.meta}</div>
                        {step.state === 'current' && (
                          <span className="inline-flex mt-1 px-space-2xs py-space-2xs rounded-full bg-error/10 text-error font-caption text-caption font-semibold">
                            ACTION NEEDED
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg space-y-space-sm">
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Fulfillment</h2>
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">Channel</span>
                  <span className="text-on-surface">VEMTAP Online • Pickup</span>
                </div>
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">Branch</span>
                  <span className="text-on-surface">Wuse II Branch</span>
                </div>
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">Assigned staff</span>
                  <span className="text-on-surface">Chef Ibrahim • Tunde (front)</span>
                </div>
              </section>

              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg">
                <h2 className="font-heading-sm text-heading-sm text-on-surface mb-space-sm">Quick Modifiers</h2>
                <div className="grid grid-cols-2 gap-space-sm">
                  {MODIFIERS.map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-xl border border-border bg-surface hover:bg-surface-subtle font-label-sm text-label-sm text-on-surface transition-colors"
                    >
                      <Icon name={m.icon} className="text-[16px] text-primary" />
                      {m.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg">
                <h2 className="font-heading-sm text-heading-sm text-on-surface mb-space-sm">Pickup Location</h2>
                <div className="h-36 rounded-xl bg-surface-subtle flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  <div className="relative flex flex-col items-center gap-space-2xs">
                    <Icon name="location_on" filled className="text-[28px] text-primary" />
                    <span className="font-label-sm text-label-sm text-on-surface">Urban Grill & Bistro — Wuse II</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">12 Adetokunbo Ademola Crescent</span>
                  </div>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Adetokunbo+Ademola+Crescent+Abuja"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-space-sm flex items-center justify-center gap-space-xs w-full py-space-xs rounded-xl border border-border font-label-sm text-label-sm text-primary hover:bg-surface-tint-blue"
                >
                  <Icon name="directions" className="text-[16px]" />
                  Open in Maps
                </a>
              </section>
            </div>
          </div>
        </div>
      </div>
    </BusinessPortalChrome>
  );
}
