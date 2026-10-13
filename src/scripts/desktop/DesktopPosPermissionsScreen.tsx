import { useState, type ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';

interface DesktopPosPermissionsScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
}

interface ToggleProps {
  checked: boolean;
  label: string;
  onChange: () => void;
}

interface PermissionToggleRowProps {
  title: string;
  hint: string;
  checked: boolean;
  onChange: () => void;
  badge?: ReactNode;
}

function Toggle({ checked, label, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors focus:outline-none ${
        checked ? 'bg-primary-container' : 'bg-surface-container-highest'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-on-primary shadow-sm ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function PermissionToggleRow({ title, hint, checked, onChange, badge }: PermissionToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-space-md p-space-sm rounded-lg bg-surface-subtle">
      <div className="flex flex-col pr-space-xs">
        <div className="flex items-center gap-space-2xs">
          <span className="font-label-md text-label-md text-text-primary font-semibold">{title}</span>
          {badge}
        </div>
        <span className="font-caption text-caption text-text-secondary mt-0.5">{hint}</span>
      </div>
      <Toggle checked={checked} label={title} onChange={onChange} />
    </div>
  );
}

export function DesktopPosPermissionsScreen({ onNav }: DesktopPosPermissionsScreenProps) {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    idlePasscode: true,
    supervisorPin: true,
    noSale: true,
    voidTicket: true,
    refund: true,
    reprint: true,
    blindClose: true,
  });
  const flip = (key: string) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <PosTerminalChrome activeNav="settings" onNav={onNav}>
      <div className="relative w-full overflow-hidden py-space-lg">
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Title & Status Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs text-primary font-caption text-caption uppercase tracking-wider font-semibold">
              <Icon name="verified_user" className="text-[16px]" />
              <span>Access Control Architecture v4.2</span>
              <span className="text-text-tertiary">•</span>
              <span className="text-badge-discount-text">Tamper Detection Active</span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight mt-space-2xs">
              Staff POS Permissions &amp; Till Security Studio
            </h1>
            <p className="font-body-md text-body-md text-text-secondary mt-0.5">
              Owner &amp; General Manager Access Level (Strict Enforcement Active)
            </p>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            <div className="px-space-sm py-1.5 rounded-lg bg-surface-container-high flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-caption text-caption text-text-secondary font-medium">Synced: 4 Tills, 2 KDS</span>
            </div>
            <button
              type="button"
              className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-button-secondary text-button-secondary transition-colors inline-flex items-center gap-space-2xs"
            >
              <Icon name="history" className="text-[18px]" />
              <span>Session Audit</span>
            </button>
          </div>
        </div>

        {/* Top Security Vault Alert Banner */}
        <div className="relative z-10 w-full mb-space-lg rounded-xl bg-surface-container-low p-space-md shadow-sm flex items-start sm:items-center justify-between gap-space-md">
          <div className="flex items-start sm:items-center gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon name="lock" className="text-[22px]" />
            </div>
            <div>
              <div className="font-label-md text-label-md text-text-primary font-semibold flex items-center gap-space-2xs">
                <span>Protected Security Vault</span>
                <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-primary text-on-primary">
                  REAL-TIME DAEMON
                </span>
              </div>
              <p className="font-body-md text-body-md text-text-secondary mt-0.5">
                Changes made here propagate instantly to all active tills, KDS monitors, and mobile handhelds across
                Wuse II Flagship via zero-latency local mesh.
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-space-xs shrink-0 text-text-tertiary font-caption text-caption">
            <Icon name="shield" className="text-[16px] text-badge-discount-text" />
            <span>SHA-256 Ledger Signed</span>
          </div>
        </div>

        {/* 2-Column Desktop Matrix (50% / 50%) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-space-lg items-start">
          {/* LEFT COLUMN: Till Security & Passcodes */}
          <div className="flex flex-col gap-space-md">
            {/* Block 1: Terminal Passcode Architecture */}
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="key" className="text-primary text-[22px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Till Security &amp; Passcodes</h2>
                </div>
                <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                  TILL LEVEL 1
                </span>
              </div>
              <div className="space-y-space-md">
                <PermissionToggleRow
                  title="Cashier Passcode on Idle"
                  hint="Lock drawer & screen after 2 minutes of inactivity or station switch."
                  checked={toggles.idlePasscode}
                  onChange={() => flip('idlePasscode')}
                />
                <PermissionToggleRow
                  title="Supervisor PIN for Overrides"
                  hint="Demands elevated pass for high-risk manual price edits and voids."
                  checked={toggles.supervisorPin}
                  onChange={() => flip('supervisorPin')}
                />
              </div>
              {/* Authorized Supervisor PINs Roster */}
              <div className="mt-space-2xs pt-space-xs flex flex-col gap-space-xs">
                <div className="flex items-center justify-between mb-space-2xs">
                  <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider font-semibold">
                    Active Authorized Keys
                  </span>
                  <span className="font-caption text-caption text-text-tertiary">2 Configured</span>
                </div>
                <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-lowest shadow-sm">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[14px]">
                      TB
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-2xs">
                        <span className="font-label-md text-label-md text-text-primary font-semibold">
                          Chief Tunde B.
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                          Verified
                        </span>
                      </div>
                      <span className="font-caption text-caption text-text-secondary">
                        General Manager • PIN: ••••
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-space-xs py-1 rounded hover:bg-surface-container text-primary font-label-sm text-label-sm font-semibold transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-lowest shadow-sm">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary font-bold text-[14px]">
                      SA
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-2xs">
                        <span className="font-label-md text-label-md text-text-primary font-semibold">Sarah A.</span>
                        <span className="px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                          Verified
                        </span>
                      </div>
                      <span className="font-caption text-caption text-text-secondary">
                        Floor Supervisor • PIN: ••••
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-space-xs py-1 rounded hover:bg-surface-container text-primary font-label-sm text-label-sm font-semibold transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <button
                  type="button"
                  className="mt-space-xs w-full py-2.5 px-space-md rounded-lg bg-surface-tint-blue hover:bg-surface-container text-primary font-button-secondary text-button-secondary font-semibold transition-colors flex items-center justify-center gap-space-2xs"
                >
                  <Icon name="add_circle" className="text-[18px]" />
                  <span>+ Add Authorized Supervisor PIN</span>
                </button>
              </div>
            </div>

            {/* Block 2: Sales & Checkout Controls */}
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="point_of_sale" className="text-primary text-[22px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Sales &amp; Checkout Controls</h2>
                </div>
                <span className="px-space-xs py-0.5 rounded-full bg-surface-container text-on-secondary-container font-caption text-caption font-semibold">
                  THRESHOLDS
                </span>
              </div>
              <div className="space-y-space-md">
                {/* Control 1: Discount Threshold Limit */}
                <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-text-primary font-semibold">
                        Apply Item / Bill Discounts
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        Cashier manual discount cap threshold without elevation.
                      </span>
                    </div>
                    <div className="flex items-center gap-space-2xs bg-surface-canvas px-space-sm py-1 rounded-md shadow-sm">
                      <span className="font-label-md text-label-md font-bold text-primary">10% Limit</span>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-1 overflow-hidden">
                    <div className="bg-primary h-1.5 rounded-full w-[33%]" />
                  </div>
                  <div className="flex items-center justify-between text-text-tertiary font-caption text-caption pt-0.5">
                    <span>0% (No manual)</span>
                    <span className="text-error font-medium">Discounts &gt;10% mandate Supervisor PIN</span>
                    <span>30% Max</span>
                  </div>
                </div>
                {/* Control 2: Open Cash Drawer ('No Sale') */}
                <PermissionToggleRow
                  title="Open Cash Drawer ('No Sale')"
                  hint="Kick drawer without active transaction. Every kick logs timestamp & camera trigger."
                  checked={toggles.noSale}
                  onChange={() => flip('noSale')}
                  badge={
                    <span className="px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-bold">
                      FLAGGED RISK
                    </span>
                  }
                />
                {/* Control 3: Custom Line Item Entry */}
                <div className="flex items-center justify-between gap-space-md p-space-sm rounded-lg bg-surface-subtle">
                  <div className="flex flex-col pr-space-xs">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      Custom Line Item Entry
                    </span>
                    <span className="font-caption text-caption text-text-secondary mt-0.5">
                      Uncataloged quick pricing additions for seasonal or bespoke items.
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center gap-space-2xs bg-surface-canvas px-space-sm py-1 rounded-md shadow-sm">
                    <span className="font-caption text-caption text-text-tertiary">Cap:</span>
                    <span className="font-label-md text-label-md font-bold text-text-primary">₦10,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Post-Sale, Reversals & Shift Reconciliation */}
          <div className="flex flex-col gap-space-md">
            {/* Block 1: Post-Sale & Reversals */}
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="assignment_return" className="text-primary text-[22px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Post-Sale &amp; Reversals</h2>
                </div>
                <span className="px-space-xs py-0.5 rounded-full bg-error-container text-on-error-container font-caption text-caption font-semibold">
                  FINANCIAL IMPACT
                </span>
              </div>
              <div className="space-y-space-md">
                <PermissionToggleRow
                  title="Void Active Ticket / Cancel Order"
                  hint="Strictly requires Supervisor PIN verification before line clearance."
                  checked={toggles.voidTicket}
                  onChange={() => flip('voidTicket')}
                  badge={
                    <span className="px-1.5 py-0.2 rounded bg-surface-tint-blue text-primary font-caption text-caption font-bold">
                      SUPERVISOR
                    </span>
                  }
                />
                <PermissionToggleRow
                  title="Full or Partial Refund"
                  hint="Strictly requires Supervisor PIN clearance + original tender audit trail."
                  checked={toggles.refund}
                  onChange={() => flip('refund')}
                  badge={
                    <span className="px-1.5 py-0.2 rounded bg-surface-tint-blue text-primary font-caption text-caption font-bold">
                      SUPERVISOR
                    </span>
                  }
                />
                <PermissionToggleRow
                  title="Reprint Duplicate Receipt"
                  hint="Cashier allowed freely without supervisor override. Marked 'DUPLICATE'."
                  checked={toggles.reprint}
                  onChange={() => flip('reprint')}
                />
              </div>
            </div>

            {/* Block 2: Shift & Reconciliation */}
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="account_balance_wallet" className="text-primary text-[22px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Shift &amp; Reconciliation</h2>
                </div>
                <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  TILL DISCIPLINE
                </span>
              </div>
              <div className="space-y-space-md">
                <PermissionToggleRow
                  title="Active Shift Gross Total (Blind Close)"
                  hint="Hide expected total from cashier until drawer cash count is permanently entered."
                  checked={toggles.blindClose}
                  onChange={() => flip('blindClose')}
                  badge={
                    <span className="px-1.5 py-0.2 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                      PREVENTS SKIMMING
                    </span>
                  }
                />
                <div className="flex items-center justify-between gap-space-md p-space-sm rounded-lg bg-surface-subtle">
                  <div className="flex flex-col pr-space-xs">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      Close Shift &amp; Print Z-Report
                    </span>
                    <span className="font-caption text-caption text-text-secondary mt-0.5">
                      Demands dual sign-off (Cashier count + physical Supervisor verification count).
                    </span>
                  </div>
                  <span className="shrink-0 px-space-sm py-1 rounded-md bg-surface-container-high text-on-surface-variant font-caption text-caption font-semibold flex items-center gap-1">
                    <Icon name="verified" className="text-[15px] text-primary" />
                    Supervisor Required
                  </span>
                </div>
              </div>
            </div>

            {/* Block 3: Offline Integrity & Sync */}
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="cloud_sync" className="text-primary text-[22px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Offline Integrity &amp; Sync</h2>
                </div>
                <span className="px-space-xs py-0.5 rounded-full bg-surface-container-low text-text-secondary font-caption text-caption font-semibold">
                  STORAGE SECURITY
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                <div className="p-space-sm rounded-lg bg-surface-subtle flex flex-col justify-between gap-space-xs">
                  <div>
                    <span className="font-label-md text-label-md text-text-primary font-semibold block">
                      Allow Force Cloud Push
                    </span>
                    <span className="font-caption text-caption text-text-secondary block mt-0.5">
                      Cashier permitted to manual-trigger queued payload sync upon cellular reconnect.
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-badge-discount-text font-caption text-caption font-semibold mt-1">
                    <Icon name="check_circle" className="text-[16px]" />
                    <span>Allowed on Reconnect</span>
                  </div>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col justify-between gap-space-xs">
                  <div>
                    <span className="font-label-md text-label-md text-text-primary font-semibold block">
                      Clear Local SQLite Cache
                    </span>
                    <span className="font-caption text-caption text-text-secondary block mt-0.5">
                      Destructive database purges are hardlocked against staff actions.
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-error font-caption text-caption font-semibold mt-1">
                    <Icon name="block" className="text-[16px]" />
                    <span>Owner Key Only</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Ribbon & Security Telemetry */}
        <div className="relative z-10 mt-space-xl bg-surface-canvas rounded-xl shadow-md p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm w-full sm:w-auto">
            <div className="w-10 h-10 rounded-lg bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
              <Icon name="policy" className="text-[20px]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-md text-label-md text-text-primary font-semibold">
                  12 supervisor overrides logged today
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="font-caption text-caption text-text-tertiary">Till #01 &amp; #02</span>
              </div>
              <button
                type="button"
                className="font-caption text-caption text-primary hover:underline font-medium inline-flex items-center gap-0.5 mt-0.5"
              >
                <span>View Security Log</span>
                <Icon name="arrow_forward" className="text-[14px]" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
            <button
              type="button"
              className="px-space-md py-2.5 rounded-xl bg-surface-subtle hover:bg-surface-container text-text-secondary font-button-secondary text-button-secondary transition-colors"
            >
              Discard Changes
            </button>
            <button
              type="button"
              className="px-space-xl py-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary shadow-sm hover:shadow transition-all flex items-center justify-center gap-space-2xs"
            >
              <Icon name="verified" className="text-[18px]" />
              <span>Save Security Permissions</span>
            </button>
          </div>
        </div>
      </div>
    </PosTerminalChrome>
  );
}