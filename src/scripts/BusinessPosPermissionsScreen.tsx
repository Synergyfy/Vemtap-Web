import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { PosOwnerHeader, PosToggle } from '../components/PosControls';

interface BusinessPosPermissionsScreenProps {
  onBack: () => void;
}

function CardHead({
  icon,
  iconClass = 'text-primary',
  title,
  meta,
}: {
  icon: string;
  iconClass?: string;
  title: string;
  meta?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-space-xs">
      <div className="flex items-center gap-space-xs min-w-0">
        <Icon name={icon} className={`${iconClass} text-[19px] shrink-0`} />
        <h2 className="font-heading-sm text-heading-sm text-on-surface truncate">{title}</h2>
      </div>
      {meta}
    </div>
  );
}

function ToggleCard({
  title,
  sub,
  checked,
  onChange,
  badge,
}: {
  title: string;
  sub: string;
  checked: boolean;
  onChange: () => void;
  badge?: ReactNode;
}) {
  return (
    <div className="bg-surface-container-low p-3.5 rounded-lg flex items-center justify-between gap-3">
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-label-md text-label-md text-on-surface font-semibold">{title}</span>
          {badge}
        </div>
        <span className="font-caption text-caption text-text-secondary mt-0.5">{sub}</span>
      </div>
      <PosToggle checked={checked} onChange={onChange} ariaLabel={title} />
    </div>
  );
}

function MetaChip({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-semibold shrink-0 ${className}`}>
      {children}
    </span>
  );
}

function SupervisorPin({
  initials,
  initialsClass,
  name,
  role,
  onEdit,
}: {
  initials: string;
  initialsClass: string;
  name: string;
  role: string;
  onEdit: () => void;
}) {
  return (
    <div className="bg-surface-subtle p-3 rounded-lg flex items-center justify-between gap-space-xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-8 h-8 rounded-full ${initialsClass} flex items-center justify-center font-label-md text-label-md font-semibold shrink-0`}
        >
          {initials}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-label-md text-label-md text-on-surface font-semibold truncate">{name}</span>
          <span className="font-caption text-caption text-text-secondary">{role} • PIN ••••</span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-text-secondary shrink-0">
        <Icon name="verified" className="text-[17px]" />
        <button
          type="button"
          aria-label={`Edit ${name} PIN`}
          onClick={onEdit}
          className="p-1 hover:text-on-surface"
        >
          <Icon name="edit" className="text-[17px]" />
        </button>
      </div>
    </div>
  );
}

export function BusinessPosPermissionsScreen({ onBack }: BusinessPosPermissionsScreenProps) {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    idlePasscode: true,
    supervisorPin: true,
    noSale: true,
    voidTicket: true,
    refund: true,
    reprint: true,
  });
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

  const flip = (key: string) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <AppScreen>
      <PosOwnerHeader title="Staff Permissions & Passcodes" onBack={onBack} />

      <div className="flex flex-col pb-10">
        {/* Security banner */}
        <div className="px-margin pt-4 pb-2">
          <div className="bg-surface-container-high rounded-xl p-4 flex items-center justify-between shadow-sm gap-space-xs">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <Icon name="security" className="text-[21px]" />
              </div>
              <div className="min-w-0">
                <span className="font-label-sm text-label-sm text-text-secondary">Security, Passcodes &amp; Roles</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-caption text-caption font-semibold uppercase tracking-wider text-error">
                    Strict Enforce
                  </span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant" />
                  <span className="font-caption text-caption text-text-secondary truncate">Vault v2.4</span>
                </div>
              </div>
            </div>
            <div className="bg-error-container text-on-error-container px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
              <Icon name="lock" className="text-[12px]" />
              <span className="font-caption text-caption font-semibold tracking-tight">Owner &amp; GM Only</span>
            </div>
          </div>
        </div>

        <div className="px-margin mt-4 flex flex-col gap-5">
          {/* Till security & passcodes */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-4">
            <CardHead
              icon="pin"
              title="Till Security & Passcodes"
              meta={
                <span className="bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold px-2 py-0.5 rounded-full shrink-0">
                  Active Guard
                </span>
              }
            />
            <div className="flex flex-col gap-3">
              <ToggleCard
                title="Cashier Passcode on Idle"
                sub="Lock drawer & screen after 2 mins idle/switch"
                checked={toggles.idlePasscode}
                onChange={() => flip('idlePasscode')}
              />
              <ToggleCard
                title="Supervisor PIN for Overrides"
                sub="Demands elevated pass for sensitive actions"
                checked={toggles.supervisorPin}
                onChange={() => flip('supervisorPin')}
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center justify-between gap-space-xs">
                <span className="font-caption text-caption text-text-secondary font-semibold uppercase tracking-wider">
                  Authorized Supervisor PINs
                </span>
                <span className="font-caption text-caption text-primary font-medium shrink-0">2 Configured</span>
              </div>
              <div className="flex flex-col gap-2">
                <SupervisorPin
                  initials="TB"
                  initialsClass="bg-secondary-container text-on-secondary-container"
                  name="Chief Tunde B."
                  role="General Manager"
                  onEdit={() => showToast('Editing Chief Tunde B. supervisor PIN')}
                />
                <SupervisorPin
                  initials="SA"
                  initialsClass="bg-primary-fixed text-on-primary-fixed"
                  name="Sarah A."
                  role="Floor Supervisor"
                  onEdit={() => showToast('Editing Sarah A. supervisor PIN')}
                />
                <button
                  type="button"
                  onClick={() => showToast('New supervisor PIN enrolment opened')}
                  className="w-full mt-1 py-2.5 px-3 rounded-lg bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all"
                >
                  <Icon name="add_circle" className="text-[17px]" />
                  <span>+ Add Authorized Supervisor PIN</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sales & checkout controls */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-4">
            <CardHead icon="point_of_sale" title="Sales & Checkout Controls" />
            <div className="flex flex-col gap-3">
              <div className="bg-surface-container-low p-3.5 rounded-lg flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Apply Item / Bill Discounts
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Cashier manual discount cap threshold
                    </span>
                  </div>
                  <MetaChip className="bg-surface-tint-blue text-primary">10% Limit</MetaChip>
                </div>
                <div className="bg-surface-subtle p-2 rounded flex items-center justify-between text-text-secondary font-caption text-caption gap-space-xs">
                  <div className="flex items-center gap-1 min-w-0">
                    <Icon name="info" className="text-[14px] text-tertiary shrink-0" />
                    <span className="truncate">Discounts &gt;10% mandate Supervisor PIN</span>
                  </div>
                  <span className="text-primary font-semibold shrink-0">Configured</span>
                </div>
              </div>

              <ToggleCard
                title='Open Cash Drawer ("No Sale")'
                sub="Kick drawer without active transaction"
                checked={toggles.noSale}
                onChange={() => flip('noSale')}
                badge={
                  <span className="bg-error-container text-on-error-container text-[10px] font-bold px-1.5 rounded uppercase shrink-0">
                    Risk
                  </span>
                }
              />

              <div className="bg-surface-container-low p-3.5 rounded-lg flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Custom Line Item Entry
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Uncataloged quick pricing additions
                    </span>
                  </div>
                  <MetaChip className="bg-surface-tint-blue text-primary">₦10,000 Max</MetaChip>
                </div>
                <div className="bg-surface-subtle p-2 rounded flex items-center justify-between text-text-secondary font-caption text-caption gap-space-xs">
                  <span className="truncate">Requires item memo notes</span>
                  <span className="text-badge-discount-text font-medium shrink-0">Permitted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Post-sale & reversals */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-4">
            <CardHead
              icon="warning"
              iconClass="text-error"
              title="Post-Sale & Reversals"
              meta={
                <span className="bg-error-container text-on-error-container font-caption text-caption font-semibold px-2 py-0.5 rounded-full shrink-0">
                  High Audit
                </span>
              }
            />
            <div className="flex flex-col gap-3">
              <ToggleCard
                title="Void Active Ticket / Cancel Order"
                sub="Strictly requires Supervisor PIN verification"
                checked={toggles.voidTicket}
                onChange={() => flip('voidTicket')}
              />
              <ToggleCard
                title="Full or Partial Refund"
                sub="Strictly requires Supervisor authorization PIN"
                checked={toggles.refund}
                onChange={() => flip('refund')}
              />
              <ToggleCard
                title="Reprint Duplicate Receipt"
                sub="Cashier allowed freely without supervisor override"
                checked={toggles.reprint}
                onChange={() => flip('reprint')}
              />
            </div>
          </div>

          {/* Shift & reconciliation */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-4">
            <CardHead icon="account_balance_wallet" title="Shift & Reconciliation" />
            <div className="flex flex-col gap-3">
              <div className="bg-surface-container-low p-3.5 rounded-lg flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Active Shift Gross Total (Blind Close)
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Hide expected total from cashier until count is logged
                    </span>
                  </div>
                  <MetaChip className="bg-badge-discount-bg text-badge-discount-text">Blind Active</MetaChip>
                </div>
                <div className="bg-surface-subtle p-2 rounded flex items-center gap-2 text-text-secondary font-caption text-caption">
                  <Icon name="visibility_off" className="text-[14px] text-primary shrink-0" />
                  <span>Prevents cashier tally skimming during handoff</span>
                </div>
              </div>
              <div className="bg-surface-container-low p-3.5 rounded-lg flex items-center justify-between gap-3">
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Close Shift &amp; Print Z-Report
                  </span>
                  <span className="font-caption text-caption text-text-secondary mt-0.5">
                    Demands Supervisor sign-off &amp; physical till count
                  </span>
                </div>
                <span className="bg-surface-tint-blue text-primary font-caption text-caption font-semibold px-2.5 py-1 rounded shrink-0">
                  Supervisor Required
                </span>
              </div>
            </div>
          </div>

          {/* Offline integrity & sync */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-4">
            <CardHead icon="sync" iconClass="text-secondary" title="Offline Integrity & Sync" />
            <div className="flex flex-col gap-3">
              <div className="bg-surface-container-low p-3 rounded-lg flex items-center justify-between gap-space-xs">
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Allow Cashier Force Cloud Push
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    Manual re-sync when network reconnects
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold bg-badge-discount-bg px-2.5 py-0.5 rounded-full shrink-0">
                  Allowed
                </span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg flex items-center justify-between gap-space-xs">
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Clear Local SQLite Cache
                  </span>
                  <span className="font-caption text-caption text-text-secondary">Owner / Support Master Key only</span>
                </div>
                <span className="font-label-sm text-label-sm text-error font-semibold bg-error-container px-2.5 py-0.5 rounded-full shrink-0">
                  Blocked
                </span>
              </div>
            </div>
          </div>

          {/* Audit log */}
          <div className="bg-surface-container-high rounded-xl p-4 shadow-sm flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <Icon name="history_edu" className="text-[21px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Security Audit Log</span>
                <span className="font-caption text-caption text-text-secondary truncate">
                  12 supervisor overrides logged today
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => showToast('Security audit log opened • 12 entries today')}
              className="bg-surface-container-lowest text-primary font-label-sm text-label-sm font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1 active:scale-95 transition-all shrink-0"
            >
              <span>View Log</span>
              <Icon name="chevron_right" className="text-[15px]" />
            </button>
          </div>

          {/* Save */}
          <div className="mt-2">
            <button
              type="button"
              onClick={() => showToast('Security permissions saved & propagated to all POS terminals')}
              className="w-full h-11 bg-primary-container text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] active:scale-[0.98] transition-all"
            >
              <Icon name="save" className="text-[19px]" />
              <span>Save Security Permissions</span>
            </button>
            <div className="text-center mt-2.5">
              <span className="font-caption text-caption text-text-tertiary">
                Changes immediately propagate to all connected active POS terminals
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
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
