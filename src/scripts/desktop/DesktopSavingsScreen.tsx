import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { SAVINGS_TIMEFRAMES, useSavingsLedger, type SavingsTimeframe } from '../../hooks/useSavingsLedger';

interface DesktopSavingsScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
  onOpenRewards: () => void;
  onSupport: () => void;
}

export function DesktopSavingsScreen({ onNav, onBack, onOpenRewards, onSupport }: DesktopSavingsScreenProps) {
  const [timeframe, setTimeframe] = useState<SavingsTimeframe>('month');
  const savings = useSavingsLedger(timeframe);
  const [exportPhase, setExportPhase] = useState<'idle' | 'preparing' | 'done'>('idle');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2500);
  };

  const runExport = () => {
    if (exportPhase !== 'idle') return;
    setExportPhase('preparing');
    try {
      const count = savings.exportStatement();
      if (count === 0) {
        setExportPhase('idle');
        showToast('No redemptions to export for this period');
        return;
      }
      setExportPhase('done');
      showToast('Statement downloaded to Files');
      window.setTimeout(() => setExportPhase('idle'), 2000);
    } catch {
      setExportPhase('idle');
      showToast('The statement couldn’t be downloaded. Please try again.');
    }
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
                Every naira you have kept with VEMTAP passes: your savings, category splits and a ledger of each
                redemption.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-space-xs self-start md:self-auto shrink-0">
              <span className="flex items-center gap-space-2xs px-space-sm py-1.5 rounded-full bg-surface-container-lowest shadow-sm font-label-sm text-label-sm text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text inline-block animate-pulse" />
                <span>{savings.loading ? 'Syncing…' : 'Synced'}</span>
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
              {SAVINGS_TIMEFRAMES.map((item) => (
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
                  <span className="font-label-md text-label-md text-text-secondary">{timeframe === 'all' ? 'Total Lifetime Savings' : 'Total Savings'}</span>
                </div>
                <div className="flex items-baseline space-x-space-xs flex-wrap">
                  <span className="font-display-hero text-display-hero text-text-primary tracking-tight">
                    {savings.totalLabel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-xs lg:w-[420px]">
                <div className="p-space-xs rounded-lg bg-surface-subtle flex flex-col justify-between">
                  <span className="font-caption text-caption text-text-tertiary">Deals Redeemed</span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="font-heading-sm text-heading-sm text-text-primary">{savings.records}</span>
                    <span className="font-caption text-caption text-text-secondary">deals</span>
                  </div>
                </div>
                <div className="p-space-xs rounded-lg bg-surface-subtle flex flex-col justify-between">
                  <span className="font-caption text-caption text-text-tertiary">Avg Discount</span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="font-heading-sm text-heading-sm text-primary">{savings.avgDiscount}%</span>
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
                    <span className="font-heading-sm text-heading-sm text-badge-discount-text">{savings.points === null ? '—' : savings.points.toLocaleString()}</span>
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
                  <span className="font-caption text-caption text-text-secondary">{savings.categories.length} active {savings.categories.length === 1 ? 'category' : 'categories'}</span>
                </div>
                <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm space-y-space-md">
                  <div className="w-full h-2.5 rounded-full bg-surface-container-low flex overflow-hidden">
                    {savings.categories.map((category) => (
                      <div
                        key={category.label}
                        className={`h-full ${category.barClass}`}
                        style={{ width: `${category.width}%` }}
                      />
                    ))}
                  </div>
                  <div className="space-y-space-sm">
                    {savings.categories.map((category) => (
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
                      Your ledger records the discount on every VEMTAP pass a merchant has redeemed.
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
                    {savings.records} {savings.records === 1 ? 'record' : 'records'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={savings.toggleSort}
                  className="font-caption text-caption text-primary flex items-center space-x-0.5 hover:underline"
                >
                  <span>Sort: {savings.sort === 'latest' ? 'Latest' : 'Oldest'}</span>
                  <Icon name="expand_more" className="text-[14px]" />
                </button>
              </div>

              <div className="space-y-space-xs">
            {savings.items.length === 0 && (
              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm text-center font-caption text-caption text-text-secondary">
                {savings.loading ? (
                  'Loading your savings…'
                ) : savings.failed ? (
                  <button type="button" onClick={savings.retry} className="text-primary font-semibold hover:underline">
                    Your savings couldn’t be loaded. Click to retry.
                  </button>
                ) : (
                  'No redemptions in this period yet.'
                )}
              </div>
            )}
                {savings.items.map((item) => (
                  <div
                    key={item.id}
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
              disabled={exportPhase !== 'idle' || savings.loading}
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
