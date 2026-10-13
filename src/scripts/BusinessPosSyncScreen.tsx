import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface BusinessPosSyncScreenProps {
  onBack: () => void;
}

type SyncState = 'idle' | 'pushing' | 'done';
type ConflictState = 'open' | 'resolving' | 'resolved';

const METRICS: {
  label: string;
  value: string;
  sub: string;
  icon: string;
  iconWrap: string;
  valueClass: string;
  subClass: string;
}[] = [
  {
    label: 'Waiting to Sync',
    value: '1 Txn',
    sub: 'Ready in flight buffer',
    icon: 'hourglass_top',
    iconWrap: 'bg-amber-500/10',
    valueClass: 'text-text-primary',
    subClass: 'text-tertiary',
  },
  {
    label: 'Successfully Synced',
    value: '142 Txns',
    sub: '₦3,480,250 verified',
    icon: 'check_circle',
    iconWrap: 'bg-badge-discount-bg',
    valueClass: 'text-text-primary',
    subClass: 'text-badge-discount-text',
  },
  {
    label: 'Needs Review',
    value: '1 Collision',
    sub: 'Action required',
    icon: 'warning',
    iconWrap: 'bg-error-container',
    valueClass: 'text-error',
    subClass: 'text-error',
  },
  {
    label: 'Last Cloud Push',
    value: 'Just now',
    sub: '03:26 PM verified',
    icon: 'cloud_done',
    iconWrap: 'bg-surface-tint-blue',
    valueClass: 'text-text-primary',
    subClass: 'text-text-tertiary',
  },
];

export function BusinessPosSyncScreen({ onBack }: BusinessPosSyncScreenProps) {
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [progress, setProgress] = useState(80);
  const [conflict, setConflict] = useState<ConflictState>('open');
  const [toast, setToast] = useState<string | null>(null);
  const syncTimers = useRef<number[]>([]);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      syncTimers.current.forEach((id) => window.clearTimeout(id));
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const forceSync = () => {
    if (syncState !== 'idle') return;
    setSyncState('pushing');
    setProgress(100);
    syncTimers.current.push(
      window.setTimeout(() => {
        setSyncState('done');
        showToast('All buffered records pushed to VEMTAP Cloud HQ');
        syncTimers.current.push(
          window.setTimeout(() => {
            setSyncState('idle');
            setProgress(80);
          }, 2500),
        );
      }, 1200),
    );
  };

  const resolveConflict = () => {
    if (conflict !== 'open') return;
    setConflict('resolving');
    window.setTimeout(() => setConflict('resolved'), 800);
  };

  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              type="button"
              aria-label="Go back"
              onClick={onBack}
              className="w-11 h-11 -ml-2 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-variant/50 transition-colors shrink-0"
            >
              <Icon name="arrow_back" className="text-[23px]" />
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className="font-heading-sm text-heading-sm text-on-surface leading-tight truncate">
                POS Sync Reconciliation
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="font-caption text-caption text-text-secondary truncate">Branch: Midtown Flagship</span>
                <span className="w-1 h-1 rounded-full bg-outline-variant shrink-0" />
                <span className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                  <span>Online</span>
                </span>
              </div>
            </div>
          </div>
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Icon name="person" className="text-on-primary text-[17px]" />
          </span>
        </div>
      </header>

      <div className="flex flex-col pb-10">
        {/* Network restoration alert */}
        <div className="px-margin pt-space-xs pb-space-xs">
          <div className="bg-surface-tint-blue rounded-xl p-space-sm flex items-center justify-between gap-space-xs shadow-sm">
            <div className="flex items-center gap-space-xs min-w-0">
              <span className="w-7 h-7 rounded-full bg-primary-container/10 flex items-center justify-center shrink-0">
                <Icon name="wifi" className="text-[17px] text-primary-container animate-pulse" />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-primary-container truncate font-semibold">
                  Online (4G LTE Restored)
                </span>
                <span className="font-caption text-caption text-text-secondary truncate">
                  Wuse Branch • Till #01
                </span>
              </div>
            </div>
            <span className="font-caption text-caption bg-surface-canvas text-primary font-semibold px-space-xs py-1 rounded-full shadow-sm shrink-0">
              28ms Latency
            </span>
          </div>
        </div>

        {/* Sync status master banner */}
        <div className="px-margin pt-space-xs pb-space-sm">
          <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm relative overflow-hidden">
            <span className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-primary/5 pointer-events-none" />
            <div className="flex items-start justify-between mb-space-2xs gap-space-xs">
              <span className="flex items-center gap-space-xs min-w-0">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-container" />
                </span>
                <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">
                  Automatic Synchronization Active
                </h2>
              </span>
              <span className="font-label-md text-label-md text-primary-container font-semibold shrink-0">
                {progress}%
              </span>
            </div>
            <p className="font-body-md text-body-md text-text-secondary mb-space-sm">
              Internet restored at 03:25 PM. Pushing buffered local transactions to VEMTAP Cloud HQ…
            </p>
            <div className="w-full bg-surface-subtle h-2.5 rounded-full overflow-hidden shadow-inner mb-space-2xs">
              <div
                className="bg-primary-container h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-space-xs font-caption text-caption text-text-tertiary">
              <span>4 of 5 offline records uploaded</span>
              <span className="font-label-sm text-label-sm text-text-secondary font-medium">1 in queue</span>
            </div>
          </div>
        </div>

        {/* Metric tiles 2x2 */}
        <div className="px-margin py-space-xs">
          <div className="grid grid-cols-2 gap-space-2xs">
            {METRICS.map((metric) => (
              <div
                key={metric.label}
                className="bg-surface-canvas rounded-xl p-space-sm shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-space-2xs mb-space-2xs">
                  <span className="font-caption text-caption text-text-secondary truncate">{metric.label}</span>
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${metric.iconWrap}`}
                  >
                    <Icon
                      name={metric.icon}
                      className={`text-[15px] ${
                        metric.icon === 'warning'
                          ? 'text-error'
                          : metric.icon === 'check_circle'
                            ? 'text-badge-discount-text'
                            : metric.icon === 'hourglass_top'
                              ? 'text-tertiary'
                              : 'text-primary'
                      }`}
                    />
                  </span>
                </div>
                <div>
                  <span className={`font-heading-md text-heading-md block truncate ${metric.valueClass}`}>
                    {metric.value}
                  </span>
                  <span className={`font-caption text-caption font-medium ${metric.subClass}`}>{metric.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Primary sync action deck */}
        <div className="px-margin py-space-sm flex flex-col gap-space-2xs">
          <button
            type="button"
            onClick={forceSync}
            disabled={syncState !== 'idle'}
            className={`w-full h-11 active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-space-xs font-label-md text-label-md font-semibold shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] ${
              syncState === 'done' ? 'bg-badge-discount-text text-white' : 'bg-primary-container text-on-primary'
            }`}
          >
            {syncState === 'idle' && (
              <>
                <Icon name="bolt" filled className="text-[19px]" />
                <span>Sync Now (Force Cloud Push)</span>
              </>
            )}
            {syncState === 'pushing' && (
              <>
                <Icon name="sync" className="text-[19px] animate-spin" />
                <span>Transmitting Local Batches…</span>
              </>
            )}
            {syncState === 'done' && (
              <>
                <Icon name="done_all" className="text-[19px]" />
                <span>Sync Completed</span>
              </>
            )}
          </button>
          <div className="bg-surface-subtle rounded-xl p-space-sm flex items-start gap-space-xs">
            <Icon name="verified" className="text-[17px] text-badge-discount-text shrink-0 mt-0.5" />
            <p className="font-caption text-caption text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Background Auto-Sync Enabled</strong> — The POS pushes queued sales
              the moment internet reconnects. Manual sync is only needed if the network drops repeatedly.
            </p>
          </div>
        </div>

        {/* Sync queue & conflict log */}
        <div className="px-margin pt-space-xs pb-space-md flex flex-col gap-space-sm">
          <div className="flex items-center justify-between gap-space-xs">
            <h3 className="font-heading-sm text-heading-sm text-text-primary">Sync Queue &amp; Conflict Log</h3>
            <span className="font-caption text-caption text-text-tertiary">Real-time journal</span>
          </div>

          {/* Collision card */}
          <div
            className={`bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm transition-opacity ${
              conflict === 'resolved' ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-space-xs">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-2xs flex-wrap">
                  <span className="font-label-md text-label-md text-text-primary font-semibold">LOC-TXN-402-001</span>
                  <span
                    className={`font-caption text-caption px-2 py-0.5 rounded-full font-semibold ${
                      conflict === 'resolved'
                        ? 'bg-badge-discount-bg text-badge-discount-text'
                        : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    {conflict === 'resolved' ? 'Resolved' : 'Needs Review'}
                  </span>
                </div>
                <span className="font-caption text-caption text-text-secondary mt-0.5">
                  02:15 PM • Cashier: Emeka O.
                </span>
              </div>
              <span className="font-heading-sm text-heading-sm text-text-primary shrink-0">₦6,937.50</span>
            </div>

            <div className="bg-error-container/20 rounded-lg p-space-2xs flex items-start gap-space-2xs">
              <Icon name="report_problem" className="text-[17px] text-error shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-error font-semibold">Inventory Stock Collision</span>
                <p className="font-caption text-caption text-text-secondary leading-snug">
                  Woodfire Ribeye Steak was marked Out of Stock at Maitama central inventory at 02:20 PM. Local
                  customer already paid cash in store.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-space-2xs pt-space-2xs">
              <button
                type="button"
                onClick={resolveConflict}
                disabled={conflict !== 'open'}
                className={`w-full h-10 rounded-lg font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs shadow-sm active:scale-[0.99] transition-transform ${
                  conflict === 'resolved' ? 'bg-badge-discount-text text-white' : 'bg-primary text-on-primary'
                }`}
              >
                {conflict === 'open' && (
                  <>
                    <Icon name="check" className="text-[17px]" />
                    <span>Accept Local Sale &amp; Override Stock</span>
                  </>
                )}
                {conflict === 'resolving' && (
                  <>
                    <Icon name="sync" className="text-[17px] animate-spin" />
                    <span>Resolving…</span>
                  </>
                )}
                {conflict === 'resolved' && (
                  <>
                    <Icon name="check_circle" className="text-[17px]" />
                    <span>Overridden &amp; Synced</span>
                  </>
                )}
              </button>
              <div className="grid grid-cols-2 gap-space-2xs">
                <button
                  type="button"
                  onClick={() => showToast('Custom line item editor opened')}
                  className="h-9 bg-surface-subtle text-text-primary rounded-lg font-label-sm text-label-sm font-medium flex items-center justify-center hover:bg-surface-variant/50 transition-colors"
                >
                  Custom Line Item
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Collision details loaded')}
                  className="h-9 bg-surface-subtle text-text-primary rounded-lg font-label-sm text-label-sm font-medium flex items-center justify-center hover:bg-surface-variant/50 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>

          {/* Pending card */}
          <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col gap-space-2xs">
            <div className="flex items-start justify-between gap-space-xs">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-2xs flex-wrap">
                  <span className="font-label-md text-label-md text-text-primary font-semibold">LOC-TXN-402-005</span>
                  <span className="font-caption text-caption bg-surface-tint-blue text-primary-container px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
                    <span>Pending In Flight</span>
                  </span>
                </div>
                <span className="font-caption text-caption text-text-secondary mt-0.5">
                  03:12 PM • Till #01 Master Queue
                </span>
              </div>
              <span className="font-heading-sm text-heading-sm text-text-primary shrink-0">₦31,712.50</span>
            </div>
            <div className="flex items-center justify-between gap-space-xs pt-space-2xs">
              <span className="flex items-center gap-1.5 min-w-0">
                <Icon name="lock" className="text-[15px] text-primary shrink-0" />
                <span className="font-caption text-caption text-text-secondary truncate">
                  AES-256 Encrypted packet ready
                </span>
              </span>
              <span className="font-caption text-caption text-primary font-medium shrink-0">Channel Active</span>
            </div>
          </div>

          {/* Reconciled card */}
          <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col gap-space-2xs">
            <div className="flex items-start justify-between gap-space-xs">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-2xs flex-wrap">
                  <span className="font-label-md text-label-md text-text-primary font-semibold">LOC-TXN-402-004</span>
                  <Icon name="arrow_forward" className="text-[15px] text-text-tertiary" />
                  <span className="font-label-sm text-label-sm text-text-secondary font-medium">#RC-94022</span>
                </div>
                <span className="font-caption text-caption text-text-secondary mt-0.5">
                  Synced at 03:25 PM • Cashier: Sarah Adams
                </span>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="font-heading-sm text-heading-sm text-text-primary">₦14,800.00</span>
                <span className="font-caption text-caption bg-badge-discount-bg text-badge-discount-text px-2 py-0.5 rounded-full font-semibold mt-1">
                  Reconciled
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-space-2xs">
              <Icon name="done_all" className="text-[15px] text-badge-discount-text shrink-0" />
              <span className="font-caption text-caption text-text-secondary">
                Zero ledger variance • Stock deducted globally
              </span>
            </div>
          </div>
        </div>

        {/* Cloud health diagnostics */}
        <div className="px-margin pb-space-lg">
          <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between gap-space-xs">
              <div className="flex items-center gap-space-xs min-w-0">
                <span className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center shrink-0">
                  <Icon name="hub" className="text-[19px] text-primary" />
                </span>
                <div className="flex flex-col min-w-0">
                  <h4 className="font-label-md text-label-md text-text-primary font-semibold truncate">
                    VEMTAP Cloud Diagnostics
                  </h4>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    Abuja Data Region (NG-CENTRAL-1)
                  </span>
                </div>
              </div>
              <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold flex items-center gap-1 shrink-0">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                <span>100% Intact</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-space-2xs bg-surface-subtle rounded-lg p-space-sm">
              <div>
                <span className="font-caption text-caption text-text-secondary block">Offline Integrity</span>
                <span className="font-label-md text-label-md text-text-primary font-bold">100% Matched</span>
              </div>
              <div className="min-w-0">
                <span className="font-caption text-caption text-text-secondary block">Cloud Endpoint</span>
                <span className="font-label-md text-label-md text-text-primary font-bold truncate block">
                  api.vemtap.com
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => showToast('reconciliation_shift_402.csv downloaded')}
              className="w-full h-10 bg-surface-subtle active:bg-surface-variant/50 text-text-primary rounded-xl font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-xs transition-colors"
            >
              <Icon name="download" className="text-[17px] text-text-secondary" />
              <span>Download Shift Reconciliation CSV</span>
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
