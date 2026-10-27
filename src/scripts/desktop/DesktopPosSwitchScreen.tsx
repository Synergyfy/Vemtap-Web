import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { TILL_STATUS_LABEL, tillMeta, timeLabel, useLivePos } from '../posLive';

interface DesktopPosSwitchScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
  onBack: () => void;
  onConfirm: () => void;
}

interface BranchOption {
  key: string;
  name: string;
  shortName: string;
  area: string;
  orders: string;
  revenue: string;
}

const BRANCHES: BranchOption[] = [
  { key: 'wuse-ii', name: 'Wuse II Branch', shortName: 'Wuse II', area: 'Wuse II, Abuja', orders: '8', revenue: '₦142,500' },
  { key: 'maitama', name: 'Maitama Branch', shortName: 'Maitama', area: 'Maitama, Abuja', orders: '5', revenue: '₦96,800' },
  {
    key: 'victoria-island',
    name: 'Victoria Island Branch',
    shortName: 'Victoria Island',
    area: 'Victoria Island, Lagos',
    orders: '11',
    revenue: '₦188,300',
  },
];

const CURRENT_BRANCH_KEY = 'wuse-ii';
const CURRENT_BRANCH = BRANCHES[0];

const TILLS = [
  {
    key: 'till-01',
    name: 'Till 01',
    meta: 'Counter front · Terminal 01 · ₦45,000 float',
    status: 'Active',
    active: true,
  },
  {
    key: 'till-02',
    name: 'Till 02',
    meta: 'Counter back · Terminal 02 · ₦20,000 float',
    status: 'Idle',
    active: false,
  },
  {
    key: 'till-03',
    name: 'Till 03',
    meta: 'Terrace bar · Terminal 03 · offline last seen 12m',
    status: 'Offline',
    active: false,
  },
];

export function DesktopPosSwitchScreen({ onNav, onBack, onConfirm }: DesktopPosSwitchScreenProps) {
  const pos = useLivePos();
  const live = pos.live;
  const { branch, branches: liveBranchList, switchTo } = useBusinessBranch();
  const currentTillId = pos.session?.tillId ?? null;
  const branchOptions: BranchOption[] = live
    ? liveBranchList.map((item) => ({
        key: item.key,
        name: item.name,
        shortName: item.shortName,
        area: item.area || '—',
        orders: '—',
        revenue: '—',
      }))
    : BRANCHES;
  const currentBranchKey = live ? branch.key : CURRENT_BRANCH_KEY;
  const currentBranch = branchOptions.find((item) => item.key === currentBranchKey) ?? branchOptions[0] ?? CURRENT_BRANCH;
  const tillOptions = live
    ? pos.tills.length
      ? pos.tills.map((till) => ({
          key: till.id,
          name: till.name,
          meta: tillMeta(till),
          status: till.id === currentTillId ? 'Active' : TILL_STATUS_LABEL[till.status],
          active: till.id === currentTillId,
        }))
      : [{ key: 'new', name: 'Till 01', meta: 'New till · created when you start', status: 'Idle', active: false }]
    : TILLS;
  const [selectedTill, setSelectedTill] = useState('till-01');
  const [selectedBranchKey, setSelectedBranchKey] = useState(currentBranchKey);

  useEffect(() => {
    if (!live || !pos.tillsLoaded) return;
    setSelectedTill(currentTillId ?? pos.tills.find((till) => till.status !== 'disabled')?.id ?? 'new');
  }, [live, pos.tillsLoaded, currentTillId, pos.tills]);
  const [verifying, setVerifying] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const verifyTimer = useRef<number | null>(null);
  const confirmTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
      if (verifyTimer.current !== null) window.clearTimeout(verifyTimer.current);
      if (confirmTimer.current !== null) window.clearTimeout(confirmTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const selectedBranch = branchOptions.find((item) => item.key === selectedBranchKey) ?? currentBranch;
  const selectedTillData = tillOptions.find((item) => item.key === selectedTill) ?? tillOptions[0];
  const tillName = selectedTillData.name;
  const changed = live
    ? selectedBranchKey !== currentBranchKey || selectedTill !== (currentTillId ?? '') || !pos.isOpen
    : selectedBranchKey !== CURRENT_BRANCH_KEY || selectedTill !== 'till-01';

  /** Live: open the register on the chosen till (creating the branch's first till if needed). */
  const confirmLive = async () => {
    if (selectedBranchKey !== currentBranchKey) {
      switchTo(selectedBranchKey);
      showToast(`Switched to ${selectedBranch.shortName} — now pick a till`);
      return;
    }
    if (currentTillId && currentTillId !== selectedTill) {
      showToast(`Close the register on ${pos.tillName} first (Till & Cash Drawer on the POS home).`);
      return;
    }
    if (currentTillId === selectedTill) {
      onConfirm();
      return;
    }
    setVerifying(true);
    try {
      await pos.openOnTill(selectedTill === 'new' ? undefined : selectedTill);
      showToast(`Register open on ${tillName}`);
      window.setTimeout(() => onConfirm(), 500);
    } catch (error) {
      showToast(planErrorMessage(error) ?? apiErrorMessage(error, 'Could not open the register.'));
    } finally {
      setVerifying(false);
    }
  };

  const confirm = () => {
    if (verifying) return;
    if (live) {
      void confirmLive();
      return;
    }
    setVerifying(true);
    if (verifyTimer.current !== null) window.clearTimeout(verifyTimer.current);
    verifyTimer.current = window.setTimeout(() => {
      setVerifying(false);
      showToast(`Switched to ${selectedBranch.shortName} · ${tillName}`);
      if (confirmTimer.current !== null) window.clearTimeout(confirmTimer.current);
      confirmTimer.current = window.setTimeout(() => onConfirm(), 500);
    }, 1000);
  };

  return (
    <PosTerminalChrome activeNav="register" onNav={onNav}>
      <div className="py-space-lg flex flex-col gap-space-xl">
        {/* Back link */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-space-xs self-start font-button-secondary text-button-secondary text-text-secondary hover:text-primary transition-colors"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          <span>Back to Register</span>
        </button>

        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-space-xs text-text-tertiary font-caption text-caption uppercase tracking-wider mb-space-2xs">
              <span>Active Checkout</span>
              <span>•</span>
              <span>{currentBranch.name}</span>
              <span>•</span>
              <span>{live ? (pos.session ? `Shift since ${timeLabel(pos.session.openedAt)}` : 'Register closed') : 'Shift since 08:00'}</span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Switch Branch &amp; Till</h1>
            <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
              Move this terminal to another branch or till — the open ticket on this till is parked safely and follows
              your login to the fresh shift drawer.
            </p>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <span className="hidden sm:inline-flex items-center gap-space-xs px-space-sm py-2.5 rounded-xl bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold">
              <Icon name="point_of_sale" className="text-[18px]" />
              <span>Active checkout</span>
            </span>
            <button
              type="button"
              onClick={confirm}
              disabled={!changed && !verifying}
              className="inline-flex items-center gap-space-xs px-space-lg h-11 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
            >
              {verifying ? (
                <>
                  <Icon name="progress_activity" className="text-[18px] animate-spin" />
                  <span>Verifying till…</span>
                </>
              ) : (
                <>
                  <Icon name="swap_horiz" className="text-[18px]" />
                  <span>{live && !pos.isOpen && selectedBranchKey === currentBranchKey
                    ? `Open Register on ${tillName}`
                    : changed
                      ? `Switch to ${selectedBranch.shortName} · ${tillName}`
                      : 'No change selected'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Metrics bento row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Metric 1: Active checkout */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">
                  Active Checkout
                </span>
                <span className="font-heading-sm text-heading-sm text-on-surface mt-space-2xs truncate">
                  {currentBranch.name} · {live ? (pos.isOpen ? pos.tillName : 'No till open') : 'Till 01'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                <Icon name="storefront" className="text-[20px]" />
              </div>
            </div>
            <span className="mt-space-md inline-flex items-center gap-space-2xs self-start px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
              <span>{live ? (pos.isOpen ? 'Open' : 'Closed') : 'Live'}</span>
            </span>
          </div>

          {/* Metric 2: Cashier on duty */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">
                  Cashier On Duty
                </span>
                <span className="font-heading-sm text-heading-sm text-on-surface mt-space-2xs">{live ? pos.cashierName : 'Emeka O.'}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary shrink-0">
                <Icon name="person" className="text-[20px]" />
              </div>
            </div>
            <span className="mt-space-md font-caption text-caption text-text-tertiary">
              {live
                ? pos.session
                  ? `Signed in · shift since ${timeLabel(pos.session.openedAt)}`
                  : 'Signed in · register closed'
                : 'Signed in · shift since 08:00'}
            </span>
          </div>

          {/* Metric 3: Selected till */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">
                  Selected Till
                </span>
                <span className="font-heading-sm text-heading-sm text-on-surface mt-space-2xs">{tillName}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                <Icon name="point_of_sale" className="text-[20px]" />
              </div>
            </div>
            <span
              className={`mt-space-md font-label-sm text-label-sm font-semibold ${
                selectedTillData.status === 'Offline' ? 'text-error' : 'text-badge-discount-text'
              }`}
            >
              {selectedTillData.status}
            </span>
          </div>

          {/* Metric 4: Selected branch */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">
                  Selected Branch
                </span>
                <span className="font-heading-sm text-heading-sm text-on-surface mt-space-2xs truncate">
                  {selectedBranch.shortName}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary shrink-0">
                <Icon name="apartment" className="text-[20px]" />
              </div>
            </div>
            <span className="mt-space-md font-caption text-caption text-text-tertiary">{selectedBranch.area}</span>
          </div>
        </div>

        {/* Body: selections + security / action rail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* Left: till + branch pickers */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Tills */}
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                  Select Till
                </span>
                <span className="font-caption text-caption px-space-xs py-1 rounded-full bg-surface-container-high text-text-secondary">
                  3 tills on this counter
                </span>
              </div>
              <div className="flex flex-col gap-space-xs">
                {tillOptions.map((till) => {
                  const isSelected = till.key === selectedTill;
                  const isOffline = till.status === 'Offline';
                  return (
                    <button
                      key={till.key}
                      type="button"
                      disabled={isOffline}
                      onClick={() => setSelectedTill(till.key)}
                      className={`w-full rounded-xl p-space-sm text-left flex items-center justify-between gap-space-md transition-all disabled:opacity-55 shadow-sm ${
                        isSelected
                          ? 'bg-surface-tint-blue border-2 border-primary'
                          : 'bg-surface-canvas border-2 border-transparent hover:border-border-subtle'
                      }`}
                    >
                      <div className="flex items-center gap-space-xs min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-primary' : 'border-border-subtle'
                          }`}
                        >
                          {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">
                            {till.name}
                            {till.active && <span className="text-primary font-caption text-caption"> · current</span>}
                          </span>
                          <span className="font-caption text-caption text-text-secondary truncate">{till.meta}</span>
                        </div>
                      </div>
                      <span
                        className={`font-caption text-caption px-space-xs py-0.5 rounded-full shrink-0 ${
                          isOffline
                            ? 'bg-error-container text-on-error-container'
                            : till.status === 'Idle'
                              ? 'bg-surface-container-high text-text-secondary'
                              : 'bg-badge-discount-bg text-badge-discount-text'
                        }`}
                      >
                        {till.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Remote branches */}
            <div className="flex flex-col gap-space-sm">
              <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                Switch to Another Branch
              </span>
              <div className="flex flex-col gap-space-xs">
                {branchOptions.map((item) => {
                  const isSelected = item.key === selectedBranchKey;
                  const isCurrent = item.key === currentBranchKey;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSelectedBranchKey(item.key)}
                      className={`w-full rounded-xl p-space-sm flex items-center justify-between gap-space-md text-left transition-all shadow-sm ${
                        isSelected
                          ? 'bg-surface-tint-blue border-2 border-primary'
                          : 'bg-surface-canvas border-2 border-transparent hover:border-border-subtle'
                      }`}
                    >
                      <div className="flex items-center gap-space-xs min-w-0">
                        <span className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                          <Icon name="apartment" className="text-primary text-[17px]" />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-sm text-label-sm text-on-surface truncate font-semibold">
                            {item.name}
                          </span>
                          <span className="font-caption text-caption text-text-secondary truncate">
                            {item.area} · {item.orders} open orders · {item.revenue} today
                          </span>
                        </div>
                      </div>
                      <span
                        className={`font-caption text-caption px-space-xs py-0.5 rounded-full shrink-0 ${
                          isCurrent
                            ? 'bg-badge-discount-bg text-badge-discount-text'
                            : 'bg-surface-container-high text-text-secondary'
                        }`}
                      >
                        {isCurrent ? 'Current' : 'Remote'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: security notice + action deck */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg sticky top-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <Icon name="shield_lock" className="text-primary text-[22px]" />
                <h2 className="font-heading-md text-heading-md text-on-surface">Switch Authorization</h2>
              </div>
              <span className="font-caption text-caption px-space-xs py-1 rounded-full bg-surface-container-high font-medium text-text-secondary">
                Manager approval
              </span>
            </div>

            {/* Security notice */}
            <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex items-start gap-space-sm">
              <Icon name="shield_lock" className="text-primary text-[18px] shrink-0 mt-0.5" />
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">Manager approval</span>
                <span className="font-caption text-caption text-text-secondary">
                  Switching branches opens a fresh shift drawer. The current ticket on this till is parked safely and
                  follows your login.
                </span>
              </div>
            </div>

            {/* Selected summary */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-xs">
              <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                Pending Switch
              </span>
              <div className="flex items-center justify-between py-space-2xs">
                <span className="font-caption text-caption text-text-secondary">Branch</span>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                  {selectedBranch.shortName}
                </span>
              </div>
              <div className="flex items-center justify-between py-space-2xs">
                <span className="font-caption text-caption text-text-secondary">Till</span>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">{tillName}</span>
              </div>
              <div className="flex items-center justify-between py-space-2xs">
                <span className="font-caption text-caption text-text-secondary">State</span>
                <span
                  className={`font-label-sm text-label-sm font-semibold ${
                    changed ? 'text-primary' : 'text-text-secondary'
                  }`}
                >
                  {changed ? 'Ready to switch' : 'No change selected'}
                </span>
              </div>
            </div>

            {/* Pinned confirm deck */}
            <div className="p-space-md rounded-xl bg-surface-canvas border border-border-subtle shadow-md flex flex-col gap-space-xs">
              <button
                type="button"
                onClick={confirm}
                disabled={!changed && !verifying}
                className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs shadow-md hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
              >
                {verifying ? (
                  <>
                    <Icon name="progress_activity" className="text-[17px] animate-spin" />
                    <span>Verifying till…</span>
                  </>
                ) : (
                  <>
                    <Icon name="swap_horiz" className="text-[17px]" />
                    <span>
                      {live && !pos.isOpen && selectedBranchKey === currentBranchKey
                    ? `Open Register on ${tillName}`
                    : changed
                      ? `Switch to ${selectedBranch.shortName} · ${tillName}`
                      : 'No change selected'}
                    </span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onBack}
                className="w-full h-11 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold hover:bg-surface-container-high transition-colors"
              >
                Stay on Current Till
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </PosTerminalChrome>
  );
}
