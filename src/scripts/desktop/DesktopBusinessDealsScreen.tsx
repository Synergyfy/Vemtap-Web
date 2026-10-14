import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopBusinessDealsScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onOpenAnalytics?: () => void;
  onCreateDeal?: () => void;
}

type DealStatus = 'active' | 'scheduled' | 'expired' | 'all';

interface DealCard {
  id: string;
  title: string;
  image: string;
  discount: string;
  typeLabel: string;
  typeTone: string;
  status: string;
  statusTone: 'normal' | 'alert';
  sku: string;
  participating: string;
  price: string;
  was?: string;
  saveLabel: string;
  saveTone: string;
  claims: string;
  conversion: string;
  conversionTone: string;
  progress: number;
  progressTone: string;
  capLine: string;
  speedLine: string;
  metaIcon1: string;
  meta1: string;
  metaIcon2: string;
  meta2: string;
  bucket: DealStatus;
}

const DEALS: DealCard[] = [
  {
    id: 'd1',
    title: '20% Off Prime Lunch Combo & Craft Beverage',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-8PzHBlj8YXuJCPDni2kYzSzJNqZutnspG-8mTbHGhk8rxwzRHu0nmSN-FoMUo0qToOTxnkB0lebHT7rSDnhqqrFPsmqZzxkL8Fa2PTWgwAhr1paBqIPFU2NNqFzgdTCS96JUyg0AjgqVuqEMHSiRDPUGYx_6WCW6FUsj76zOyLw-VrTGOYXVeelDcaouFk4eWw2sbEUOvQlWF-FVGDEGjYGeDQP3XS3dc2D8_Z8AcvbMyMqOqX8gKg',
    discount: '20% OFF',
    typeLabel: 'Flash Deal',
    typeTone: 'bg-surface-canvas/90 backdrop-blur-sm text-primary',
    status: 'Active • Ends in 12 days',
    statusTone: 'normal',
    sku: 'VMT-LNC-48',
    participating: 'Maitama & Victoria Island (All Branches)',
    price: '₦9,600',
    was: '₦12,000',
    saveLabel: 'Save ₦2,400',
    saveTone: 'bg-surface-tint-blue text-primary',
    claims: '48 Claims • 34 Redeemed',
    conversion: '71% Conversion',
    conversionTone: 'text-primary',
    progress: 71,
    progressTone: 'bg-primary-container',
    capLine: 'Cap: 100 Vouchers',
    speedLine: 'Till speed: 1.2 per hr',
    metaIcon1: 'schedule',
    meta1: 'Mon – Fri, 12:00 PM – 4:00 PM',
    metaIcon2: 'restaurant',
    meta2: 'Prime Burger, Ribeye Cut, Artisan Soda',
    bucket: 'active',
  },
  {
    id: 'd2',
    title: 'Weekend Glow & Serenity Spa Package',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlNPBWYL-zJ2KbqGM1IBYUIdXeJDNYDfw42TMXX4DqV-WIQgZKsSPRc6PX-vqG0FF9IFymz4tUpdp-S71GK9DkN7hpdLuWMU7fmQgyWLz9U9OZMg4TCSA90Sxqy1V8u5a0RWke7b5W_hJ3PRz_jhLppBdgkeBCPdOkwlZ2Z1GK4RhU9QsrvGxI7yJzLZYRI9Hd9xmxZKu8iV_KWlm2NVhbROV5UKFZzYnnAORrcYviNvJGDdtIjpRK7w',
    discount: '26% OFF',
    typeLabel: 'Weekend Special',
    typeTone: 'bg-surface-canvas/90 backdrop-blur-sm text-tertiary-container',
    status: 'Active • 6 Days Left',
    statusTone: 'normal',
    sku: 'VMT-SPA-26',
    participating: 'Maitama Spa Suite Exclusive',
    price: '₦18,500',
    was: '₦25,000',
    saveLabel: 'Save ₦6,500',
    saveTone: 'bg-badge-discount-bg text-badge-discount-text',
    claims: '22 Claims • 18 Booked',
    conversion: '82% Conversion',
    conversionTone: 'text-badge-discount-text',
    progress: 82,
    progressTone: 'bg-badge-discount-text',
    capLine: 'Cap: 30 Sessions',
    speedLine: 'Slots left: 8',
    metaIcon1: 'calendar_month',
    meta1: 'Sat & Sun, 10:00 AM – 7:00 PM',
    metaIcon2: 'spa',
    meta2: 'Hydration Facial, Deluxe Manicure, Sauna Pass',
    bucket: 'active',
  },
  {
    id: 'd3',
    title: 'Buy 1 Get 1 Free Cold Brew Bottle',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAslapCtgVIzeI75C18XKOTf5-AhtVCXkvfJvuANChNusxwnUq-ItRimCfzLh4Th82pSIuxid2m8u9SEQbGTIsU3_sEyMQ5Zx-BFxOYbHGDJogC8ATF8RKDaJbSbf41tnQEtUixd_dkVTB9jeO-Oh3qM1tYrEgPwP1OumVxNAgzcOgLq66t4XC2uJ0vLBoytS-eVDyDhcN4hb-m-LbSU_kEDI9TZQ5nnYhVWYx9KX4EPKfxnpsFHS6G7Q',
    discount: 'BOGO 50%',
    typeLabel: 'Rapid Tap',
    typeTone: 'bg-tertiary-fixed text-on-tertiary-fixed',
    status: '5 left today (75% Cap Reached)',
    statusTone: 'alert',
    sku: 'VMT-CB-BOGO',
    participating: 'Victoria Island Hub & Express Counter',
    price: '₦3,200',
    was: '₦6,400',
    saveLabel: 'Instant BOGO',
    saveTone: 'bg-tertiary-fixed text-on-tertiary-fixed',
    claims: '15 Claims today',
    conversion: 'High Velocity',
    conversionTone: 'text-tertiary',
    progress: 75,
    progressTone: 'bg-tertiary-container',
    capLine: 'Daily Limit: 20',
    speedLine: 'Speed: Peak morning buzz',
    metaIcon1: 'coffee',
    meta1: 'Daily, 8:00 AM – 1:00 PM',
    metaIcon2: 'inventory_2',
    meta2: 'Nitro Cold Brew & Single-Origin Arabica Blend',
    bucket: 'active',
  },
];

const TABS: Array<{ key: DealStatus; label: string }> = [
  { key: 'active', label: 'Active (3)' },
  { key: 'scheduled', label: 'Scheduled (1)' },
  { key: 'expired', label: 'Expired (8)' },
  { key: 'all', label: 'All Campaigns (12)' },
];

export function DesktopBusinessDealsScreen({ onNav, onOpenAnalytics, onCreateDeal }: DesktopBusinessDealsScreenProps) {
  const [tab, setTab] = useState<DealStatus>('active');
  const [search, setSearch] = useState('');
  const [boosted, setBoosted] = useState<Record<string, boolean>>({});
  const [paused, setPaused] = useState<Record<string, boolean>>({});
  const [quotaCap, setQuotaCap] = useState(18);

  const filtered = DEALS.filter((d) => {
    if (tab === 'scheduled' || tab === 'expired') return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !d.sku.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <BusinessPortalChrome activeNav="business-deals" onNav={onNav}>
      <aside aria-label="Surge Announcement" className="w-full bg-gradient-to-r from-tertiary-container via-tertiary to-on-tertiary-fixed text-on-tertiary px-space-lg py-2.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-xs text-center sm:text-left">
          <div className="flex items-center gap-space-xs min-w-0">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-on-tertiary/20 text-on-tertiary">
              <Icon name="local_fire_department" className="text-[16px]" filled />
            </span>
            <span className="font-label-sm text-label-sm font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-on-tertiary/15 text-tertiary-fixed">Live Flash Alert</span>
            <p className="font-body-md text-caption sm:text-label-sm font-medium truncate">
              Lunch combo voucher claims surging (<span className="font-bold text-tertiary-fixed">+42% vs yesterday</span>) in Maitama Heights.
            </p>
          </div>
          <div className="flex items-center gap-space-sm flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-on-tertiary-fixed/40 font-label-sm text-caption font-semibold text-tertiary-fixed">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim animate-ping" />
              {quotaCap} claims remaining before quota cap
            </span>
            <button type="button" onClick={() => setQuotaCap(50)} className="font-label-sm text-caption underline decoration-tertiary-fixed-dim hover:text-tertiary-fixed transition-colors">
              Manage Cap →
            </button>
          </div>
        </div>
      </aside>

      <div className="w-full py-space-xl flex flex-col gap-space-xl">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
          <div className="max-w-3xl">
            <div className="flex items-center gap-space-xs mb-1">
              <span className="font-label-sm text-caption uppercase tracking-wider text-primary font-bold">VEMTAP Hyperlocal Retail</span>
              <span className="text-text-tertiary">•</span>
              <span className="font-label-sm text-caption text-text-secondary">Abuja &amp; Lagos Fleet Operations</span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              Central Deals &amp; Promotions Management
            </h1>
            <p className="font-body-md text-body-md text-text-secondary mt-1">
              Create, monitor, and optimize discounted vouchers, flash campaigns, and counter tap promotions across all branch locations.
            </p>
          </div>
          <div className="flex items-center gap-space-sm flex-shrink-0">
            <button type="button" onClick={onOpenAnalytics} className="px-4 py-2.5 rounded-xl bg-surface-canvas text-primary font-label-md text-label-md font-semibold hover:bg-surface-tint-blue transition-all shadow-sm flex items-center gap-1.5">
              <span>View Deals Analytics</span>
              <Icon name="north_east" className="text-[16px]" />
            </button>
            <button
              type="button"
              onClick={onCreateDeal}
              className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center gap-2 shadow-[0_8px_20px_-4px_rgba(6,108,244,0.35)] hover:bg-primary transition-all"
            >
              <Icon name="add" className="text-[20px]" />
              <span>Create New Deal</span>
            </button>
          </div>
        </header>

        <section aria-label="Deals KPI Metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="rounded-xl p-space-lg bg-surface-canvas shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <span className="font-label-md text-label-md text-text-secondary">Net Merchant Impact</span>
              <span className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                <Icon name="payments" className="text-[18px]" />
              </span>
            </div>
            <div className="mt-4">
              <div className="font-heading-lg text-heading-lg font-bold text-text-primary tracking-tight">₦1,248,000</div>
              <p className="font-caption text-caption text-badge-discount-text font-semibold flex items-center gap-1 mt-1">
                <Icon name="trending_up" className="text-[14px]" />
                <span>+18.4% generated from deals</span>
              </p>
            </div>
            <div className="w-full bg-surface-subtle h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-primary-container h-full rounded-full" style={{ width: '68%' }} />
            </div>
          </div>
          <div className="rounded-xl p-space-lg bg-badge-discount-bg text-badge-discount-text shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between">
              <span className="font-label-md text-label-md font-semibold text-text-primary">Direct Payouts</span>
              <span className="w-8 h-8 rounded-lg bg-surface-canvas flex items-center justify-center text-badge-discount-text shadow-sm">
                <Icon name="verified" className="text-[18px]" filled />
              </span>
            </div>
            <div className="mt-4">
              <div className="font-heading-lg text-heading-lg font-bold text-text-primary tracking-tight">₦0 Paid</div>
              <p className="font-caption text-caption text-text-secondary mt-1">100% direct merchant settlement</p>
            </div>
            <button type="button" className="mt-4 font-label-sm text-caption font-semibold text-badge-discount-text hover:underline flex items-center gap-1 self-start">
              <span>Ledger Statement</span>
              <Icon name="arrow_forward" className="text-[14px]" />
            </button>
          </div>
          <div className="rounded-xl p-space-lg bg-surface-canvas shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <span className="font-label-md text-label-md text-text-secondary">Total Redemptions</span>
              <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <Icon name="confirmation_number" className="text-[18px]" />
              </span>
            </div>
            <div className="mt-4">
              <div className="font-heading-lg text-heading-lg font-bold text-text-primary tracking-tight">68 Vouchers</div>
              <p className="font-caption text-caption text-text-secondary mt-1">
                <strong className="text-text-primary font-semibold">74%</strong> conversion rate to till checkout
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 text-caption font-caption text-text-tertiary">
              <Icon name="speed" className="text-[15px] text-badge-discount-text" />
              <span>Average tap-to-checkout: 4.8 min</span>
            </div>
          </div>
          <div className="rounded-xl p-space-lg bg-surface-canvas shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <span className="font-label-md text-label-md text-text-secondary">Hyperlocal Radius</span>
              <span className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                <Icon name="radar" className="text-[18px]" />
              </span>
            </div>
            <div className="mt-4">
              <div className="font-heading-lg text-heading-lg font-bold text-text-primary tracking-tight">3,840 Foodies</div>
              <p className="font-caption text-caption text-text-secondary mt-1">
                Active app users within <strong className="text-text-primary font-semibold">5km radius</strong>
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 text-caption font-caption text-primary font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>432 active app opens right now</span>
            </div>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border-b-0 pb-1">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-canvas shadow-sm">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-colors ${
                  tab === t.key ? 'bg-primary-container text-on-primary font-semibold shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle font-medium'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-space-xs">
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-2.5 text-text-tertiary text-[18px]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title or SKU..."
                className="pl-9 pr-3 py-2 bg-surface-canvas rounded-xl font-label-sm text-label-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
            </div>
            <button type="button" className="px-3 py-2 bg-surface-canvas rounded-xl shadow-sm text-text-secondary hover:text-text-primary font-label-sm text-label-sm flex items-center gap-1.5">
              <Icon name="filter_list" className="text-[16px]" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
          {filtered.map((d) => (
            <article key={d.id} className="bg-surface-canvas rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group">
              <div className="relative w-full h-52 bg-surface-container overflow-hidden">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={d.image} alt={d.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-on-background/70 via-transparent to-black/20" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-caption font-bold shadow-sm">{d.discount}</span>
                  <span className={`px-2.5 py-1 rounded-full font-label-sm text-caption font-semibold ${d.typeTone}`}>{d.typeLabel}</span>
                </div>
                <div className="absolute top-3 right-3">
                  <button type="button" aria-label="Card Options" className="w-8 h-8 rounded-full bg-surface-canvas/80 hover:bg-surface-canvas text-text-primary flex items-center justify-center transition-colors">
                    <Icon name="more_vert" className="text-[18px]" />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-on-primary">
                  <div className={`flex items-center gap-1.5 text-caption font-label-sm px-2.5 py-1 rounded-lg ${d.statusTone === 'alert' ? 'bg-tertiary/90 backdrop-blur-md text-on-tertiary font-medium' : 'bg-black/40 backdrop-blur-md'}`}>
                    <span className={`w-2 h-2 rounded-full ${d.statusTone === 'alert' ? 'bg-surface-canvas animate-ping' : 'bg-badge-discount-text animate-pulse'}`} />
                    <span className="font-medium">{d.status}</span>
                  </div>
                  <span className="font-label-sm text-caption bg-primary/80 backdrop-blur-md px-2 py-0.5 rounded text-on-primary font-mono font-semibold">{d.sku}</span>
                </div>
              </div>
              <div className="p-space-lg flex-1 flex flex-col justify-between gap-space-md">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="font-heading-sm text-heading-sm text-text-primary font-bold line-clamp-1">{d.title}</h2>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-1">
                    Participating: <span className="font-semibold text-text-primary">{d.participating}</span>
                  </p>
                  <div className="flex items-baseline gap-2.5 mt-3">
                    <span className="font-heading-md text-heading-md font-bold text-text-primary">{d.price}</span>
                    {d.was && <span className="font-body-md text-body-md text-text-tertiary line-through">{d.was}</span>}
                    <span className={`font-label-sm text-caption px-2 py-0.5 rounded font-semibold ${d.saveTone}`}>{d.saveLabel}</span>
                  </div>
                  <div className="mt-4 p-3 rounded-xl bg-surface-subtle">
                    <div className="flex justify-between items-center text-caption font-label-sm">
                      <span className="font-semibold text-text-primary">{d.claims}</span>
                      <span className={`font-bold ${d.conversionTone}`}>{d.conversion}</span>
                    </div>
                    <div className="w-full bg-surface-container h-2 rounded-full mt-2 overflow-hidden">
                      <div className={`${d.progressTone} h-full rounded-full transition-all duration-500`} style={{ width: `${d.progress}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-caption font-caption text-text-tertiary mt-2">
                      <span>{d.capLine}</span>
                      <span>{d.speedLine}</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-caption font-body-md text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Icon name={d.metaIcon1} className="text-[16px] text-text-tertiary" />
                      <span>{d.meta1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name={d.metaIcon2} className="text-[16px] text-text-tertiary" />
                      <span className="truncate">{d.meta2}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setBoosted((p) => ({ ...p, [d.id]: !p[d.id] }))}
                    className={`w-full py-2.5 px-3 rounded-xl font-button-secondary text-button-secondary flex items-center justify-center gap-2 transition-colors shadow-sm ${
                      boosted[d.id] ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-primary-container text-on-primary hover:bg-primary'
                    }`}
                  >
                    <Icon name="rocket_launch" className="text-[18px]" filled={boosted[d.id]} />
                    <span>{boosted[d.id] ? 'Boosted 🚀' : 'Boost Deal 🚀'}</span>
                  </button>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button type="button" className="py-1.5 px-2 rounded-lg bg-surface-subtle text-text-secondary hover:text-text-primary hover:bg-surface-container font-label-sm text-caption font-medium flex items-center justify-center gap-1 transition-colors">
                      <Icon name="edit" className="text-[14px]" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaused((p) => ({ ...p, [d.id]: !p[d.id] }))}
                      className={`py-1.5 px-2 rounded-lg font-label-sm text-caption font-medium flex items-center justify-center gap-1 transition-colors ${
                        paused[d.id] ? 'bg-surface-tint-blue text-primary' : 'bg-surface-subtle text-text-secondary hover:text-text-primary hover:bg-surface-container'
                      }`}
                    >
                      <Icon name={paused[d.id] ? 'play_circle' : 'pause_circle'} className="text-[14px]" />
                      <span>{paused[d.id] ? 'Resume' : 'Pause'}</span>
                    </button>
                    <button type="button" className="py-1.5 px-2 rounded-lg bg-surface-subtle text-text-secondary hover:text-primary hover:bg-surface-container font-label-sm text-caption font-medium flex items-center justify-center gap-1 transition-colors">
                      <Icon name="receipt_long" className="text-[14px]" />
                      <span>Log</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-space-2xl text-center">
              <Icon name="local_offer" className="text-[40px] text-text-tertiary" />
              <p className="mt-space-sm font-heading-sm text-heading-sm text-text-primary">No campaigns in this view</p>
              <p className="font-body-md text-body-md text-text-secondary">Switch tabs or create a new deal to get started.</p>
            </div>
          )}
        </div>

        <section className="rounded-2xl bg-surface-canvas p-space-lg shadow-sm flex flex-col lg:flex-row items-center justify-between gap-space-lg">
          <div className="flex items-center gap-space-md">
            <div className="w-14 h-14 rounded-2xl bg-surface-tint-blue flex items-center justify-center text-primary flex-shrink-0">
              <Icon name="point_of_sale" className="text-[32px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading-sm text-heading-sm text-text-primary font-bold">Counter Tap &amp; QR Terminal Sync</h3>
                <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-caption font-semibold">Active at 4 Tills</span>
              </div>
              <p className="font-body-md text-caption text-text-secondary mt-0.5">
                Merchants scan customer deal barcode or verify with 1-Tap NFC reader. Instant checkouts automatically update online campaign remaining caps in real time.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-md w-full lg:w-auto justify-between lg:justify-end">
            <div className="text-right">
              <div className="font-label-sm text-caption text-text-tertiary">Last Redemption</div>
              <div className="font-label-md text-label-md font-semibold text-text-primary">2 min ago • Maitama #1</div>
            </div>
            <button type="button" className="px-4 py-2 rounded-xl bg-surface-subtle hover:bg-surface-container text-text-primary font-label-md text-label-md font-semibold transition-colors flex items-center gap-1.5">
              <Icon name="terminal" className="text-[18px]" />
              <span>Terminal Settings</span>
            </button>
          </div>
        </section>

        <aside aria-label="Commission Policy" className="rounded-2xl bg-surface-tint-blue p-space-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex items-start gap-space-md">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary flex-shrink-0">
              <Icon name="verified_user" className="text-[24px]" />
            </div>
            <div>
              <h4 className="font-heading-sm text-heading-sm text-text-primary font-bold">Zero VEMTAP Commission Guarantee</h4>
              <p className="font-body-md text-caption sm:text-label-md text-text-secondary mt-1 max-w-3xl">
                VEMTAP charges zero commission on in-store redemptions. Merchants keep 100% of revenue collected at the till via POS, card, or instant bank transfer. All funds settle directly to your business account.
              </p>
            </div>
          </div>
          <button type="button" className="px-4 py-2 rounded-xl bg-surface-canvas text-primary font-label-md text-label-md font-bold hover:bg-primary hover:text-on-primary transition-all shadow-sm inline-flex items-center gap-1 flex-shrink-0">
            <span>Read Merchant Charter</span>
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
        </aside>
      </div>
    </BusinessPortalChrome>
  );
}
