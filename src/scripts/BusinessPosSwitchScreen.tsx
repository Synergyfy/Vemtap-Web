import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { useBusinessBranch, type BusinessBranchData } from '../context/BusinessBranchContext';
import { apiErrorMessage } from '../services/errorMessages';
import { planErrorMessage } from '../services/planErrors';
import { TILL_STATUS_LABEL, tillMeta, timeLabel, useLivePos } from './posLive';

interface BusinessPosSwitchScreenProps {
  onBack: () => void;
  onConfirm: (branch: BusinessBranchData, till: string) => void;
}

const TILLS = [
  { key: 'till-01', name: 'Till 01', meta: 'Counter front · Terminal 01 · ₦45,000 float', status: 'Active', active: true },
  { key: 'till-02', name: 'Till 02', meta: 'Counter back · Terminal 02 · ₦20,000 float', status: 'Idle', active: false },
  { key: 'till-03', name: 'Till 03', meta: 'Terrace bar · Terminal 03 · offline last seen 12m', status: 'Offline', active: false },
];

export function BusinessPosSwitchScreen({ onBack, onConfirm }: BusinessPosSwitchScreenProps) {
  const { branch, branches, switchTo } = useBusinessBranch();
  const pos = useLivePos();
  const live = pos.live;
  const [selectedTill, setSelectedTill] = useState('till-01');
  const currentTillId = pos.session?.tillId ?? null;
  // Live: tills come from the branch; with none yet, starting creates the first one.
  const tills = live
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

  useEffect(() => {
    if (!live || !pos.tillsLoaded) return;
    setSelectedTill(currentTillId ?? pos.tills.find((till) => till.status !== 'disabled')?.id ?? 'new');
  }, [live, pos.tillsLoaded, currentTillId, pos.tills]);
  const [selectedBranchKey, setSelectedBranchKey] = useState(branch.key);
  const [verifying, setVerifying] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const verifyTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
      if (verifyTimer.current !== null) window.clearTimeout(verifyTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const selectedBranch = branches.find((item) => item.key === selectedBranchKey) ?? branch;
  const tillName = tills.find((item) => item.key === selectedTill)?.name ?? 'Till 01';
  const changed = live
    ? selectedBranchKey !== branch.key || selectedTill !== (currentTillId ?? '')
    : selectedBranchKey !== branch.key || selectedTill !== 'till-01';

  /** Live: open the register on the chosen till (creating the branch's first till if needed). */
  const confirmLive = async () => {
    if (selectedBranchKey !== branch.key) {
      switchTo(selectedBranchKey);
      showToast(`Switched to ${selectedBranch.shortName} — now pick a till`);
      return;
    }
    if (currentTillId && currentTillId !== selectedTill) {
      showToast(`Close the register on ${pos.tillName} first (Drawer on the POS home).`);
      return;
    }
    if (currentTillId === selectedTill) {
      onConfirm(selectedBranch, tillName);
      return;
    }
    setVerifying(true);
    try {
      await pos.openOnTill(selectedTill === 'new' ? undefined : selectedTill);
      showToast(`Register open on ${tillName}`);
      window.setTimeout(() => onConfirm(selectedBranch, tillName), 500);
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
    verifyTimer.current = window.setTimeout(() => {
      setVerifying(false);
      if (selectedBranchKey !== branch.key) switchTo(selectedBranchKey);
      showToast(`Switched to ${selectedBranch.shortName} · ${tillName}`);
      window.setTimeout(() => onConfirm(selectedBranch, tillName), 500);
    }, 1000);
  };

  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between gap-space-xs">
          <button
            type="button"
            aria-label="Go back"
            onClick={onBack}
            className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-low active:scale-95 transition-all shrink-0"
          >
            <Icon name="arrow_back" className="text-[21px]" />
          </button>
          <div className="flex flex-col items-center min-w-0">
            <span className="font-heading-sm text-heading-sm text-on-surface leading-tight truncate">
              Switch Branch & Till
            </span>
            <span className="font-caption text-caption text-text-secondary leading-none">Active checkout</span>
          </div>
          <span className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center shrink-0">
            <Icon name="point_of_sale" className="text-primary text-[16px]" />
          </span>
        </div>
      </header>

      <div className="flex flex-col pb-32">
        {/* Current checkout */}
        <div className="px-margin pt-space-xs pb-space-2xs">
          <div className="bg-surface-container-low rounded-xl p-space-sm flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-space-xs min-w-0">
              <span className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Icon name="storefront" className="text-on-primary text-[17px]" />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-on-surface truncate">
                  {branch.name} · {live ? (pos.isOpen ? pos.tillName : 'No till open') : 'Till 01'}
                </span>
                <span className="font-caption text-caption text-text-secondary truncate">
                  {live
                    ? pos.session
                      ? `${pos.cashierName} signed in · shift since ${timeLabel(pos.session.openedAt)}`
                      : `${pos.cashierName} · register closed`
                    : 'Emeka O. signed in · shift since 08:00'}
                </span>
              </div>
            </div>
            <span className="bg-badge-discount-bg text-badge-discount-text font-caption text-caption px-space-xs py-0.5 rounded-full shrink-0">
              {live ? (pos.isOpen ? 'Open' : 'Closed') : 'Live'}
            </span>
          </div>
        </div>

        {/* Tills */}
        <div className="px-margin pt-space-xs pb-space-2xs">
          <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
            Select Till
          </span>
        </div>
        <div className="px-margin flex flex-col gap-space-xs">
          {tills.map((till) => {
            const isSelected = till.key === selectedTill;
            const isOffline = till.status === 'Offline';
            return (
              <button
                key={till.key}
                type="button"
                disabled={isOffline}
                onClick={() => setSelectedTill(till.key)}
                className={`w-full rounded-xl p-space-sm text-left flex items-center justify-between gap-space-xs transition-all disabled:opacity-55 ${
                  isSelected
                    ? 'bg-surface-tint-blue border-2 border-border-active shadow-sm'
                    : 'bg-surface-canvas border-2 border-transparent shadow-sm'
                }`}
              >
                <div className="flex items-center gap-space-xs min-w-0">
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-primary' : 'border-outline-variant'
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
                        ? 'bg-surface-container text-text-secondary'
                        : 'bg-badge-discount-bg text-badge-discount-text'
                  }`}
                >
                  {till.status}
                </span>
              </button>
            );
          })}
        </div>

        {/* Remote branches */}
        <div className="px-margin pt-space-md pb-space-2xs">
          <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
            Switch to Another Branch
          </span>
        </div>
        <div className="px-margin flex flex-col gap-space-xs">
          {branches.map((item) => {
            const isSelected = item.key === selectedBranchKey;
            const isCurrent = item.key === branch.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedBranchKey(item.key)}
                className={`w-full rounded-xl p-space-xs flex items-center justify-between gap-space-xs text-left transition-all ${
                  isSelected ? 'bg-surface-tint-blue border-2 border-border-active' : 'bg-surface-canvas border-2 border-transparent shadow-sm'
                }`}
              >
                <div className="flex items-center gap-space-xs min-w-0">
                  <span className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                    <Icon name="apartment" className="text-primary text-[17px]" />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface truncate">{item.name}</span>
                    <span className="font-caption text-caption text-text-secondary truncate">
                      {item.area} · {item.stats.orders} open orders · {item.stats.revenue} today
                    </span>
                  </div>
                </div>
                <span
                  className={`font-caption text-caption px-space-xs py-0.5 rounded-full shrink-0 ${
                    isCurrent ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-container text-text-secondary'
                  }`}
                >
                  {isCurrent ? 'Current' : 'Remote'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Security notice */}
        <div className="px-margin pt-space-sm">
          <div className="bg-surface-container-low rounded-xl p-space-sm flex items-start gap-space-xs">
            <Icon name="shield_lock" className="text-primary text-[18px] shrink-0 mt-0.5" />
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">Manager approval</span>
              <span className="font-caption text-caption text-text-secondary">
                Switching branches opens a fresh shift drawer. The current ticket on this till is parked safely and
                follows your login.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pinned confirm deck */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/95 backdrop-blur-xl border-t border-border-subtle px-margin pt-space-xs pb-[calc(env(safe-area-inset-bottom,0px)+12px)] flex flex-col gap-space-2xs shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <button
          type="button"
          onClick={confirm}
          disabled={!changed && !verifying && !(live && !pos.isOpen)}
          className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all disabled:opacity-40"
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
                {live && !pos.isOpen && selectedBranchKey === branch.key
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
          className="w-full h-10 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold"
        >
          Stay on Current Till
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
