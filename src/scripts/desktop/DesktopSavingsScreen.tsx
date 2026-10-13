import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopSavingsScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
  onOpenRewards: () => void;
  onSupport: () => void;
}

type Timeframe = 'month' | 'quarter' | 'all';

const TOTALS: Record<Timeframe, string> = {
  month: '₦48,500',
  quarter: '₦124,300',
  all: '₦289,750',
};

const TIMEFRAMES: Array<{ key: Timeframe; label: string }> = [
  { key: 'month', label: 'This Month' },
  { key: 'quarter', label: 'Last 3 Mo' },
  { key: 'all', label: 'All Time' },
];

const CATEGORIES = [
  {
    icon: 'restaurant',
    iconClass: 'bg-surface-tint-blue text-primary',
    label: 'Food & Dining',
    meta: '6 redemptions • 58%',
    amount: '₦28,400',
    width: 58,
    barClass: 'bg-primary',
  },
  {
    icon: 'spa',
    iconClass: 'bg-surface-container text-secondary',
    label: 'Wellness & Beauty',
    meta: '5 redemptions • 29%',
    amount: '₦14,100',
    width: 29,
    barClass: 'bg-secondary-container',
  },
  {
    icon: 'shopping_bag',
    iconClass: 'bg-tertiary-fixed text-tertiary',
    label: 'Fashion & Retail',
    meta: '3 redemptions • 13%',
    amount: '₦6,000',
    width: 13,
    barClass: 'bg-tertiary-fixed-dim',
  },
];

const LEDGER_ITEMS = [
  {
    name: 'Urban Grill & Bistro',
    time: 'Oct 15, 2024 • 1:15 PM',
    code: 'VT-48F261',
    saved: '₦2,400',
    deal: '20% Off Lunch Combo',
    was: '₦12,000',
    paid: '₦9,600',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCDpJzehdTIakEd1l0aHtXcEENngWKwUL79INnAJtrU09GrivYgMJR4bfgrzFW318ScXl0skr_aEHzNQD7QfiJsaiqoijzaaynQlWxZyBYVXbPuzyXRFL0KhJm_qz0GVXxnnzaYO7EtTpNNxAfyVpFtKxpzJr2p9OsYYpi8vyqER9UYoSuziYcx3K51XiE0wupPjYGE5yh58M5pAMtp1GABh-h5X8PLxP_vgJqz6wg6-gNeyqKdFvUXKA',
    alt: 'A modern Lagos artisanal bistro restaurant burger and cocktail served on a rustic stone platter with soft natural light and subtle blue napkins',
  },
  {
    name: 'Glow & Serenity Spa & Salon',
    time: 'Oct 04, 2024 • 3:30 PM',
    code: 'VT-SPA8821',
    saved: '₦5,000',
    deal: 'Weekend Glow Facial Promo',
    was: '₦25,000',
    paid: '₦20,000',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAXMfSfZGmy3oINAHONydpb5CJi5oKMrEIJzLcwXjGwSL5LXAuV1NIoEFEQBwRVTR9qfVCIVXApxL9rJR9Cysn6trPdZ2CZQYtCYWONxf_AGSTYprhNQWKz-LEMe2lXnULPYwdfbUuwbvieSnkuCHrs8z9zu0Q_lY5eLIGg2EeFpBnQgpRA0XPnyDHEltjX5gXIwODoDViuvn9CyvTa272siegnOxY7E2S_dqdSiMzRk25EQPWHuj3uNg',
    alt: 'An upscale serene day spa interior featuring smooth warm bamboo minimalist stone water accents clean white rolled linen towels and deep relaxed ambient lighting',
  },
  {
    name: 'The Daily Knead Bakery',
    time: 'Sept 28, 2024 • 9:45 AM',
    code: 'VT-BAK4192',
    saved: '₦1,200',
    deal: '15% Off Morning Pastry Pack',
    was: '₦8,000',
    paid: '₦6,800',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC16GrqfAPlFKScFIyWtL5Ht6ORXy6PLGkXXX42qPyfLAx1VNz3aRXLC_nm8l550rsb_M_jsAQZy74_g2JGZlEZN2pXJBIuIgoefbc3asRpC4idVjY6fb39GjFKbmlwj2zFgBeVOW8-amrF-gvQhwhBgShtReKeHuonzYu7P0HRdZrKbUZS1IooMD7lGjeJA4u9jv2VD4E57buWekoGkTC2vKmP7TtdS2IfFz4icwQ6SV4qftT0dhwfUw',
    alt: 'Fresh golden brown sourdough croissants and buttery artisan pastries resting on a clean marble counter in a chic modern bakery',
  },
  {
    name: 'Sole District Apparel',
    time: 'Sept 19, 2024 • 5:20 PM',
    code: 'VT-SOL9910',
    saved: '₦6,000',
    deal: 'Flash Voucher Redemption',
    was: '₦35,000',
    paid: '₦29,000',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDeyOzl-DW9E35EiZof0vPXfxq1u2rQ3OTRVxGI0PvxMsUwbYwmacHMinRDAiuipZwtB8vnuTK6DhNAVygBtodPYaGnXUCohJw6NuBK4zF5n7sQC7l-uQszgaoUzlS1w0xkg-v1qZYJta_rwdVEVsWAXqWg1NF8cYciDe6bO50phJmxCx9yIOnLlJDil_IHxxATHKRPYfwTWRtdAAZFcFiQ28h4xAPjW0IGfrpsRWPNElgvlShg1jh9aQ',
    alt: 'Boutique high-end contemporary streetwear and luxury sneakers displayed on minimalist light oak shelving with warm boutique spotlighting',
  },
];

export function DesktopSavingsScreen({ onNav, onBack, onOpenRewards, onSupport }: DesktopSavingsScreenProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('month');
  const [exportPhase, setExportPhase] = useState<'idle' | 'preparing' | 'done'>('idle');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2500);
  };

  const runExport = () => {
    if (exportPhase !== 'idle') return;
    setExportPhase('preparing');
    window.setTimeout(() => {
      setExportPhase('done');
      showToast('Statement downloaded to Files');
      window.setTimeout(() => setExportPhase('idle'), 2000);
    }, 1200);
  };

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="account-settings">
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <nav className="flex flex-wrap items-center gap-2 mb-6 font-label-sm text-label-sm text-text-tertiary">
            <button className="hover:text-primary transition-colors" onClick={() => onNav('home')} type="button">
              Home
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <button className="hover:text-primary transition-colors" onClick={onBack} type="button">
              Account
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-text-primary font-semibold">Savings History &amp; Ledger</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="max-w-3xl">
              <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                Savings History &amp; Ledger
              </h1>
              <p className="font-body-lg text-body-lg text-text-secondary mt-2">
                Every naira you have kept with VEMTAP passes, audited and synced: lifetime savings, category splits,
                and a verified ledger of each redemption.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-space-xs self-start md:self-auto shrink-0">
              <span className="flex items-center gap-space-2xs px-space-sm py-1.5 rounded-full bg-surface-container-lowest shadow-sm font-label-sm text-label-sm text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text inline-block animate-pulse" />
                <span>Audited &amp; Synced</span>
              </span>
              <button
                type="button"
                onClick={runExport}
                className="flex items-center gap-space-2xs px-space-sm py-1.5 rounded-full bg-surface-tint-blue text-primary hover:bg-surface-container-low font-label-sm text-label-sm transition-colors active:scale-95"
              >
                <Icon name="receipt_long" className="text-[18px]" />
                <span>Export Statement</span>
              </button>
            </div>
          </div>

          <section className="rounded-xl bg-surface-container-lowest p-space-lg lg:p-8 shadow-md space-y-space-md relative overflow-hidden mb-6">
            <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-surface-tint-blue opacity-70 pointer-events-none" />
            <div className="relative z-10 grid grid-cols-3 gap-1 p-1 rounded-full bg-surface-container-low max-w-md">
              {TIMEFRAMES.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTimeframe(item.key)}
                  className={`py-1.5 rounded-full text-center font-label-sm text-label-sm transition-all ${
                    timeframe === item.key ? 'bg-primary text-on-primary shadow-sm' : 'text-text-secondary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg pt-space-xs">
              <div className="space-y-space-2xs">
                <div className="flex items-center space-x-space-2xs text-text-secondary">
                  <Icon name="savings" className="text-[16px] text-primary" />
                  <span className="font-label-md text-label-md text-text-secondary">Total Lifetime Savings</span>
                </div>
                <div className="flex items-baseline space-x-space-xs flex-wrap">
                  <span className="font-display-hero text-display-hero text-text-primary tracking-tight">
                    {TOTALS[timeframe]}
                  </span>
                  <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-medium">
                    +18% vs last mo
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-xs lg:w-[420px]">
                <div className="p-space-xs rounded-lg bg-surface-subtle flex flex-col justify-between">
                  <span className="font-caption text-caption text-text-tertiary">Deals Redeemed</span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="font-heading-sm text-heading-sm text-text-primary">14</span>
                    <span className="font-caption text-caption text-text-secondary">deals</span>
                  </div>
                </div>
                <div className="p-space-xs rounded-lg bg-surface-subtle flex flex-col justify-between">
                  <span className="font-caption text-caption text-text-tertiary">Avg Discount</span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="font-heading-sm text-heading-sm text-primary">22%</span>
                    <span className="font-caption text-caption text-text-secondary">off</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenRewards}
                  className="p-space-xs rounded-lg bg-surface-subtle flex flex-col justify-between text-left hover:bg-surface-container-low transition-colors"
                >
                  <span className="font-caption text-caption text-text-tertiary flex items-center gap-1">
                    VEM Points
                    <Icon name="arrow_forward" className="text-[12px] text-primary" />
                  </span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="font-heading-sm text-heading-sm text-badge-discount-text">1,450</span>
                    <span className="font-caption text-caption text-text-secondary">pts</span>
                  </div>
                </button>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
            <div className="w-full flex flex-col gap-6">
              <section className="space-y-space-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading-md text-heading-md text-text-primary">Savings by Category</h2>
                  <span className="font-caption text-caption text-text-secondary">3 active categories</span>
                </div>
                <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm space-y-space-md">
                  <div className="w-full h-2.5 rounded-full bg-surface-container-low flex overflow-hidden">
                    {CATEGORIES.map((category) => (
                      <div
                        key={category.label}
                        className={`h-full ${category.barClass}`}
                        style={{ width: `${category.width}%` }}
                      />
                    ))}
                  </div>
                  <div className="space-y-space-sm">
                    {CATEGORIES.map((category) => (
                      <div key={category.label} className="flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-space-sm min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${category.iconClass}`}
                          >
                            <Icon name={category.icon} className="text-[18px]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-label-md text-label-md text-text-primary truncate">{category.label}</p>
                            <p className="font-caption text-caption text-text-tertiary">{category.meta}</p>
                          </div>
                        </div>
                        <span className="font-label-md text-label-md text-text-primary shrink-0">
                          {category.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <div className="p-space-md rounded-xl bg-surface-tint-blue space-y-space-xs">
                <div className="flex items-start space-x-space-xs">
                  <Icon name="shield" className="text-primary text-[20px] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-label-md text-label-md text-text-primary font-semibold">
                      Guaranteed Ledger Integrity
                    </h4>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      Your ledger accurately records in-store and checkout discounts guaranteed by VEMTAP passes. All
                      redemptions are cryptographically signed at merchant terminals.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <section className="w-full space-y-space-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-space-2xs">
                  <h2 className="font-heading-md text-heading-md text-text-primary">Transaction Ledger</h2>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-secondary-container font-caption text-caption font-semibold">
                    14 records
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Showing latest redemptions first')}
                  className="font-caption text-caption text-primary flex items-center space-x-0.5 hover:underline"
                >
                  <span>Sort: Latest</span>
                  <Icon name="expand_more" className="text-[14px]" />
                </button>
              </div>

              <div className="space-y-space-xs">
                {LEDGER_ITEMS.map((item) => (
                  <div
                    key={item.name}
                    className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm space-y-space-xs"
                  >
                    <div className="flex items-start justify-between gap-space-xs">
                      <div className="flex space-x-space-sm min-w-0">
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                          <img
                            className="w-full h-full object-cover"
                            src={item.image}
                            data-alt={item.alt}
                            alt={item.alt}
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-label-md text-label-md text-text-primary font-semibold truncate">
                            {item.name}
                          </h3>
                          <p className="font-caption text-caption text-text-tertiary">{item.time}</p>
                          <div className="flex items-center space-x-space-2xs mt-1">
                            <span className="px-1.5 py-0.5 rounded bg-surface-container-low font-caption text-caption text-text-secondary">
                              Code: {item.code}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold inline-block">
                          +Saved {item.saved}
                        </span>
                      </div>
                    </div>
                    <div className="mt-space-xs flex flex-wrap items-center justify-between gap-space-xs bg-surface-subtle p-space-xs rounded-lg">
                      <div className="min-w-0">
                        <p className="font-caption text-caption text-text-secondary font-medium truncate">{item.deal}</p>
                        <div className="flex items-center space-x-space-xs mt-0.5">
                          <span className="font-caption text-caption line-through text-text-tertiary">{item.was}</span>
                          <span className="font-label-sm text-label-sm text-text-primary font-bold">
                            Paid {item.paid}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-badge-discount-text shrink-0">
                        <Icon name="verified" className="text-[16px]" />
                        <span className="font-caption text-caption font-medium">Verified Redemption</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-8 pt-space-xs flex flex-col items-center gap-space-xs">
            <button
              type="button"
              onClick={runExport}
              disabled={exportPhase !== 'idle'}
              className="w-full max-w-md h-[52px] rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-md active:scale-95 transition-transform disabled:opacity-90"
            >
              {exportPhase === 'idle' && <Icon name="download" className="text-[20px]" />}
              {exportPhase === 'preparing' && <Icon name="sync" className="text-[20px] animate-spin" />}
              {exportPhase === 'done' && <Icon name="check_circle" className="text-[20px]" />}
              <span>
                {exportPhase === 'idle' && 'Download Full Ledger (PDF / CSV)'}
                {exportPhase === 'preparing' && 'Preparing Statement...'}
                {exportPhase === 'done' && 'Downloaded to Files'}
              </span>
            </button>
            <div className="text-center pt-space-xs">
              <button
                type="button"
                onClick={onSupport}
                className="inline-flex items-center font-button-secondary text-button-secondary text-primary hover:underline"
              >
                <span>Need receipt help or dispute a charge?</span>
                <Icon name="arrow_forward" className="text-[16px] ml-1" />
              </button>
            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-2.5 rounded-full shadow-lg font-label-md text-label-md flex items-center gap-2 transition-all duration-300">
            <Icon name="check_circle" className="text-[18px] text-badge-discount-text" />
            <span>{toast}</span>
          </div>
        )}
      </div>
    </DesktopPage>
  );
}
