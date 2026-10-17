import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { exportEncryptedBackup, printOfflineXTape } from '../utils/posOffline';

interface BusinessPosOfflineBufferScreenProps {
  onBack: () => void;
  onReturnToRegister: () => void;
}

type QueueKey = 'all' | 'cash' | 'card' | 'audit';
type ActionState = 'idle' | 'working' | 'done';

interface QueuedTxn {
  id: string;
  time: string;
  first?: boolean;
  amount: number;
  type: 'cash' | 'card';
  method: string;
  items: string;
  meta: string;
  metaAccent: boolean;
  metaMono: boolean;
}

const QUEUE_TABS: { key: QueueKey; label: string }[] = [
  { key: 'all', label: 'All Queued (5)' },
  { key: 'cash', label: 'Cash Sales (3)' },
  { key: 'card', label: 'Card Swipes (2)' },
  { key: 'audit', label: 'Audit Trail' },
];

const QUEUED_TXNS: QueuedTxn[] = [
  {
    id: 'LOC-TXN-402-005',
    time: '03:12 PM',
    amount: 31712.5,
    type: 'cash',
    method: 'Cash Tender',
    items: '3 items (Woodfire Ribeye, Double Burger, Mojito)',
    meta: 'Cashier: Emeka Okafor',
    metaAccent: false,
    metaMono: false,
  },
  {
    id: 'LOC-TXN-402-004',
    time: '02:58 PM',
    amount: 14800,
    type: 'card',
    method: 'POS Swipe',
    items: '2 items (T-Bone, Truffle Fries)',
    meta: 'RRN: 99402194',
    metaAccent: false,
    metaMono: false,
  },
  {
    id: 'LOC-TXN-402-003',
    time: '02:44 PM',
    amount: 4800,
    type: 'cash',
    method: 'Cash Tender',
    items: 'Charcoal BBQ Wings (6pcs)',
    meta: '#LOCAL-HASH-003',
    metaAccent: true,
    metaMono: true,
  },
  {
    id: 'LOC-TXN-402-002',
    time: '02:31 PM',
    amount: 10200,
    type: 'cash',
    method: 'Cash Tender',
    items: '2x Double Smash Burger & Fries',
    meta: 'Till Cashier #01',
    metaAccent: false,
    metaMono: false,
  },
  {
    id: 'LOC-TXN-402-001',
    time: '02:15 PM (First offline ticket)',
    first: true,
    amount: 6937.5,
    type: 'card',
    method: 'External POS Swipe',
    items: '1 item (Loaded Platter Combo)',
    meta: 'AUTH: 881023',
    metaAccent: true,
    metaMono: true,
  },
];

const amountLabel = (value: number) =>
  `₦${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function BusinessPosOfflineBufferScreen({ onBack, onReturnToRegister }: BusinessPosOfflineBufferScreenProps) {
  const [tab, setTab] = useState<QueueKey>('all');
  const [printState, setPrintState] = useState<ActionState>('idle');
  const [backupState, setBackupState] = useState<ActionState>('idle');
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const runAction = (
    state: ActionState,
    setAction: (next: ActionState) => void,
    workingLabel: number,
    doneLabel: number,
    message: string,
  ) => {
    if (state !== 'idle') return;
    setAction('working');
    timers.current.push(
      window.setTimeout(() => {
        setAction('done');
        showToast(message);
        timers.current.push(window.setTimeout(() => setAction('idle'), workingLabel + doneLabel));
      }, workingLabel),
    );
  };

  /** Real AES-GCM vault dump of the offline queue. */
  const exportVault = () =>
    exportEncryptedBackup(QUEUED_TXNS, { till: 'Till 01 (Wuse II)', cashier: 'Emeka Okafor' });

  /** Local X-tape summary printed straight from the till. */
  const printXTape = () =>
    printOfflineXTape(QUEUED_TXNS, {
      till: 'Till 01 (Wuse II)',
      cashier: 'Emeka Okafor',
      networkNote: 'Offline — transactions buffered locally',
    });

  const rows = QUEUED_TXNS.filter((txn) => tab === 'all' || tab === 'audit' || txn.type === tab);

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
                POS Offline Buffer
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

      <div className="flex flex-col pb-8">
        {/* Offline network banner */}
        <div className="px-margin pt-space-sm pb-space-xs">
          <div className="bg-tertiary-fixed/60 text-on-tertiary-fixed rounded-xl p-space-sm shadow-sm flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-space-xs min-w-0">
              <Icon name="cloud_off" className="text-tertiary text-[19px] shrink-0 animate-pulse" />
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-on-tertiary-fixed font-semibold truncate">
                  Wuse Branch • Till #01
                </span>
                <span className="font-caption text-caption text-on-tertiary-fixed-variant truncate">
                  Offline (Encrypted Local Storage Active)
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-canvas text-tertiary text-caption font-label-sm shrink-0 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-ping" />
              <span>Buffered</span>
            </span>
          </div>
        </div>

        {/* Hero overview */}
        <div className="px-margin pt-space-xs pb-space-sm">
          <div className="bg-surface-canvas rounded-2xl p-space-md shadow-sm flex flex-col gap-space-sm relative overflow-hidden">
            <span className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-primary-fixed/20 pointer-events-none blur-xl" />
            <div className="flex items-start justify-between gap-space-xs">
              <div className="min-w-0">
                <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
                  Device Queue
                </span>
                <h2 className="font-heading-md text-heading-md text-text-primary mt-0.5 font-bold">5 Pending</h2>
              </div>
              <div className="text-right min-w-0">
                <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
                  Queued Volume
                </span>
                <p className="font-heading-md text-heading-md text-primary font-bold mt-0.5">₦68,450.00</p>
              </div>
            </div>

            <div className="bg-surface-subtle rounded-xl p-space-sm flex items-center justify-between gap-space-xs">
              <div className="flex items-center gap-space-xs min-w-0">
                <span className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                  <Icon name="database" className="text-[17px]" />
                </span>
                <div className="min-w-0">
                  <p className="font-label-sm text-label-sm text-text-primary font-semibold">Device SQLite Storage</p>
                  <p className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-1">
                    <Icon name="check_circle" className="text-[13px]" />
                    <span>100% Intact • Synced locally</span>
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 rounded-full bg-primary-fixed text-primary font-caption text-caption font-semibold shrink-0">
                AES-256
              </span>
            </div>

            <div className="flex items-start gap-space-xs bg-surface-container-low p-space-2xs rounded-xl">
              <Icon name="sync" className="text-primary text-[17px] shrink-0 mt-0.5" />
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                Transactions are permanently saved on this device. When internet reconnects, all records batch-sync to
                VEMTAP Cloud HQ without manual intervention.
              </p>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-margin pt-space-xs pb-space-sm">
          <div className="flex items-center gap-space-2xs overflow-x-auto no-scrollbar py-0.5">
            {QUEUE_TABS.map((item) => {
              const isActive = tab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
                    isActive ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-subtle text-text-secondary'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Queue transaction cards */}
        <div className="px-margin flex flex-col gap-space-sm">
          {rows.map((txn) => (
            <div
              key={txn.id}
              className="bg-surface-canvas rounded-2xl p-space-md shadow-sm flex flex-col gap-space-2xs"
            >
              <div className="flex items-center justify-between gap-space-xs">
                <span className="flex items-center gap-space-2xs min-w-0">
                  <span className="font-heading-sm text-heading-sm text-text-primary truncate">#{txn.id}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary shrink-0" />
                  <span
                    className={`font-caption text-caption truncate ${
                      txn.first ? 'text-text-tertiary font-medium' : 'text-text-secondary'
                    }`}
                  >
                    {txn.time}
                  </span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-caption text-caption font-semibold shrink-0">
                  Queued on Device
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-space-xs pt-1">
                <span className="font-heading-md text-heading-md text-text-primary font-bold truncate">
                  {amountLabel(txn.amount)}
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-label-sm text-label-sm px-2 py-0.5 rounded-full shrink-0 ${
                    txn.type === 'cash'
                      ? 'text-badge-discount-text bg-badge-discount-bg'
                      : 'text-primary bg-surface-tint-blue'
                  }`}
                >
                  <Icon name={txn.type === 'cash' ? 'payments' : 'credit_card'} className="text-[13px]" />
                  <span>{txn.method}</span>
                </span>
              </div>

              <div className="bg-surface-subtle rounded-xl p-space-2xs flex flex-col gap-1 text-text-secondary font-caption text-caption">
                <div className="flex items-center justify-between gap-space-xs">
                  <span className="text-text-primary font-medium truncate">{txn.items}</span>
                  <span
                    className={`shrink-0 ${txn.metaAccent ? 'text-text-tertiary' : ''} ${txn.metaMono ? 'font-mono' : ''}`}
                  >
                    {txn.meta}
                  </span>
                </div>
                {(txn.id === 'LOC-TXN-402-005' || txn.id === 'LOC-TXN-402-004') && (
                  <div className="flex items-center justify-between text-text-tertiary gap-space-xs">
                    <span className={txn.id === 'LOC-TXN-402-005' ? 'font-mono truncate' : 'truncate'}>
                      {txn.id === 'LOC-TXN-402-005' ? 'SHA256: 8f4a2b90…21e0' : 'Customer: Sarah Adams (Cached profile)'}
                    </span>
                    <span className="text-badge-discount-text font-medium flex items-center gap-0.5 shrink-0">
                      <Icon name={txn.id === 'LOC-TXN-402-005' ? 'verified' : 'check_circle'} className="text-[13px]" />
                      <span>{txn.id === 'LOC-TXN-402-005' ? 'Verified Local' : 'Slip Linked'}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="flex flex-col items-center text-center gap-space-xs py-space-md">
              <span className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                <Icon name="inventory_2" className="text-text-secondary text-[21px]" />
              </span>
              <span className="font-label-md text-label-md text-on-surface">No transactions in this filter</span>
            </div>
          )}
        </div>

        {/* Device integrity & actions */}
        <div className="px-margin pt-space-md flex flex-col gap-space-sm">
          <div className="bg-surface-canvas rounded-2xl p-space-md shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <Icon name="security_update_good" className="text-primary text-[21px]" />
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Device Integrity &amp; Actions</h3>
            </div>
            <div className="bg-error-container/40 p-space-sm rounded-xl flex items-start gap-space-xs">
              <Icon name="warning" className="text-error text-[19px] shrink-0 mt-0.5" />
              <p className="font-caption text-caption text-on-error-container leading-relaxed">
                <strong className="font-semibold">Do not clear app cache or sign out of Till</strong> until network
                restores and synchronization has completed. All encrypted local sales reside in device memory.
              </p>
            </div>
            <div className="flex flex-col gap-space-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  printXTape();
                  runAction(printState, setPrintState, 1200, 2500, 'Offline X-tape summary printed');
                }}
                className="w-full h-11 rounded-xl bg-surface-subtle text-text-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Icon
                  name={printState === 'done' ? 'check' : 'print'}
                  className={`text-[19px] ${
                    printState === 'working' ? 'text-primary animate-spin' : 'text-primary'
                  }`}
                />
                <span>
                  {printState === 'working'
                    ? 'Printing Local Thermal Slip…'
                    : printState === 'done'
                      ? 'Offline Summary Printed'
                      : 'Print Offline X-Tape Summary'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  void exportVault();
                  runAction(
                    backupState,
                    setBackupState,
                    1400,
                    3000,
                    'Backup saved: till01_offline_dump.dat',
                  );
                }}
                className="w-full h-11 rounded-xl bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Icon
                  name={backupState === 'done' ? 'task_alt' : 'file_download'}
                  className={`text-[19px] ${backupState === 'done' ? 'text-badge-discount-text' : 'text-secondary'}`}
                />
                <span>
                  {backupState === 'working'
                    ? 'Generating AES-256 Vault File…'
                    : backupState === 'done'
                      ? 'Backup Saved: till01_offline_dump.dat'
                      : 'Export Encrypted Local Backup (.dat)'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Primary bottom action */}
        <div className="px-margin pt-space-md">
          <button
            type="button"
            onClick={onReturnToRegister}
            className="w-full h-11 rounded-2xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-lg shadow-primary-container/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <span>Return to Register (Continue Selling Offline)</span>
            <Icon name="arrow_forward" className="text-[19px]" />
          </button>
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
