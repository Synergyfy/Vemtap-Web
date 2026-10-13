import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';

interface DesktopPosTaxesScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
  onBack: () => void;
}

type TaxMode = 'inclusive' | 'checkout';

interface ToggleProps {
  checked: boolean;
  label: string;
  onChange: () => void;
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
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-on-primary shadow-sm transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function SectionHeading({ dot, title, meta }: { dot: string; title: string; meta?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-space-xs flex-wrap">
      <div className="flex items-center gap-space-xs min-w-0">
        <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
        <h2 className="font-heading-sm text-heading-sm text-on-surface truncate">{title}</h2>
      </div>
      {meta}
    </div>
  );
}

function ToggleLine({
  title,
  sub,
  checked,
  onChange,
  titleClass = 'font-medium',
}: {
  title: string;
  sub?: string;
  checked: boolean;
  onChange: () => void;
  titleClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-space-md">
      <div className="flex flex-col min-w-0">
        <span className={`font-label-md text-label-md text-on-surface ${titleClass}`}>{title}</span>
        {sub && <span className="font-caption text-caption text-text-secondary">{sub}</span>}
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

function RadioOption({
  selected,
  title,
  sub,
  onClick,
}: {
  selected: boolean;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <label
      className={`flex items-center justify-between p-space-sm rounded-lg cursor-pointer transition-all ${
        selected ? 'bg-surface-tint-blue' : 'bg-surface-container-low hover:bg-surface-container'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-space-sm min-w-0">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
            selected ? 'bg-primary' : 'bg-surface-container-high'
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${selected ? 'bg-surface-container-lowest' : 'bg-transparent'}`} />
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className={`font-label-md text-label-md ${selected ? 'text-primary font-semibold' : 'text-on-surface font-medium'}`}
          >
            {title}
          </span>
          <span className="font-caption text-caption text-text-secondary">{sub}</span>
        </div>
      </div>
      {selected && <Icon name="check" className="text-primary text-[19px] shrink-0" />}
    </label>
  );
}

function ValuePill({
  prefix,
  value,
  suffix,
  minWidth,
}: {
  prefix?: string;
  value: string;
  suffix?: string;
  minWidth: string;
}) {
  return (
    <div
      className="flex items-center bg-surface-container-low px-space-sm py-1.5 rounded-lg gap-1 justify-center shrink-0"
      style={{ minWidth }}
    >
      {prefix && <span className="font-label-sm text-label-sm text-text-secondary">{prefix}</span>}
      <span className="font-label-md text-label-md text-on-surface font-semibold">{value}</span>
      {suffix && <span className="font-label-sm text-label-sm text-text-secondary">{suffix}</span>}
    </div>
  );
}

export function DesktopPosTaxesScreen({ onNav, onBack }: DesktopPosTaxesScreenProps) {
  const [mode, setMode] = useState<TaxMode>('checkout');
  const [exempt, setExempt] = useState(true);
  const [vipWaiver, setVipWaiver] = useState(true);
  const [packagingAuto, setPackagingAuto] = useState(true);
  const [selfOrder, setSelfOrder] = useState(true);
  const [rushPause, setRushPause] = useState(false);
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

  return (
    <PosTerminalChrome activeNav="settings" onNav={onNav}>
      <div className="w-full py-space-lg flex flex-col gap-space-lg">
        {/* Page Header */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
            <div className="flex flex-col gap-space-2xs min-w-0">
              <button
                type="button"
                onClick={onBack}
                className="self-start mb-space-2xs inline-flex items-center gap-space-2xs text-primary font-label-sm text-label-sm font-semibold hover:text-on-primary-fixed-variant transition-colors"
              >
                <Icon name="arrow_back" className="text-[16px]" />
                <span>Back to POS Settings</span>
              </button>
              <div className="flex items-center gap-space-xs flex-wrap text-on-surface-variant font-caption text-caption">
                <Icon name="lock" className="text-[13px]" />
                <span>Manager Authorized • Session ID: #MGR-8841-LAGOS</span>
                <span className="text-text-tertiary">•</span>
                <span className="uppercase tracking-wider font-semibold text-primary">Terminal Settings</span>
              </div>
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                Taxes &amp; Surcharges
              </h1>
              <p className="font-body-md text-body-md text-text-secondary">
                Statutory VAT &amp; Dining Fees — applied across future digital receipts, KOT tickets, and FIRS shift
                reconciliation reports.
              </p>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-space-2xs shrink-0">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold tracking-wide">
                  <Icon name="verified_user" filled className="text-[15px]" />
                  PIN Verified
                </span>
                <button
                  type="button"
                  onClick={() => showToast('Tax & surcharge rules applied to all future receipts')}
                  className="px-space-lg py-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary transition-all flex items-center justify-center gap-space-xs shadow-md"
                >
                  <Icon name="save" className="text-[19px]" />
                  <span>Apply Tax &amp; Surcharge Rules</span>
                </button>
              </div>
              <span className="flex items-center gap-1.5 text-text-tertiary font-caption text-caption">
                <Icon name="lock_clock" className="text-[13px]" />
                <span>Requires Manager Role clearance</span>
              </span>
            </div>
          </div>
        </div>

        {/* 3-Column Tax Rule Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg items-start">
          {/* Section 1: Statutory tax */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <SectionHeading
              dot="bg-primary"
              title="Statutory Tax (FIRS)"
              meta={
                <span className="font-caption text-caption text-primary font-medium bg-surface-tint-blue px-2 py-0.5 rounded-full shrink-0">
                  National Schedule
                </span>
              }
            />

            {/* VAT rate */}
            <div className="flex items-center justify-between gap-space-md">
              <div className="flex-1 min-w-0">
                <label className="font-label-md text-label-md text-on-surface block font-medium">Standard VAT Rate</label>
                <span className="font-caption text-caption text-text-secondary block">
                  Statutory Federal Inland Revenue rate
                </span>
              </div>
              <div className="flex items-center bg-surface-container-low px-space-md py-space-xs rounded-lg min-w-[100px] justify-end gap-1 shrink-0">
                <span className="font-heading-sm text-heading-sm text-on-surface text-right w-12 text-end font-semibold">
                  7.5
                </span>
                <span className="font-label-md text-label-md text-text-secondary font-medium">%</span>
              </div>
            </div>

            {/* Tax treatment radios */}
            <div className="flex flex-col gap-space-xs pt-space-xs">
              <label className="font-label-sm text-label-sm text-text-secondary font-medium uppercase tracking-wider">
                POS Price Application
              </label>
              <div className="grid grid-cols-1 gap-space-xs">
                <RadioOption
                  selected={mode === 'inclusive'}
                  title="Prices shown are Inclusive of Tax"
                  sub="Tax embedded in display prices"
                  onClick={() => setMode('inclusive')}
                />
                <RadioOption
                  selected={mode === 'checkout'}
                  title="Tax added at checkout (Selected)"
                  sub="Line items net; +7.5% calculated on subtotal"
                  onClick={() => setMode('checkout')}
                />
              </div>
            </div>

            {/* Exemption toggle */}
            <div className="pt-space-xs">
              <ToggleLine
                title="Raw Food Item Exemption"
                sub="Zero-rate basic unprocessed agro items"
                checked={exempt}
                onChange={() => setExempt((v) => !v)}
              />
            </div>

            {/* FIRS TIN */}
            <div className="pt-space-xs flex flex-col gap-1.5">
              <label htmlFor="firs-tin" className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                FIRS Merchant Tax Identification Number (TIN)
              </label>
              <div className="flex items-center bg-surface-container-low px-space-md py-3 rounded-lg gap-space-sm">
                <Icon name="badge" className="text-text-secondary text-[19px]" />
                <input
                  id="firs-tin"
                  type="text"
                  defaultValue="TIN-902410-001"
                  placeholder="TIN-XXXXXX-XXX"
                  className="bg-transparent font-label-md text-label-md text-on-surface w-full outline-none font-medium"
                />
                <Icon name="verified" className="text-badge-discount-text text-[17px]" />
              </div>
            </div>
          </div>

          {/* Section 2: Service & packaging */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <SectionHeading dot="bg-secondary" title="Service & Packaging Surcharges" />

            {/* Dine-in service charge */}
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-on-surface font-medium">
                    Dine-In Table Service Charge
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    Auto-applied to active dine-in table bills
                  </span>
                </div>
                <ValuePill value="5.0" suffix="%" minWidth="76px" />
              </div>
              <ToggleLine
                title="Allow cashiers to waive service charge for VIP/Complaints"
                checked={vipWaiver}
                onChange={() => setVipWaiver((v) => !v)}
                titleClass="font-normal text-on-surface-variant"
              />
            </div>

            <div className="w-full h-px bg-surface-container-high" />

            {/* Packaging fee */}
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-on-surface font-medium">
                    Takeaway / Packaging Fee
                  </span>
                  <span className="font-caption text-caption text-text-secondary">Flat fee per food eco-container</span>
                </div>
                <ValuePill prefix="₦" value="300" minWidth="90px" />
              </div>
              <ToggleLine
                title="Apply automatically when order type is Takeaway / Delivery"
                checked={packagingAuto}
                onChange={() => setPackagingAuto((v) => !v)}
                titleClass="font-normal text-on-surface-variant"
              />
            </div>
          </div>

          {/* Section 3: Public POS rules */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <SectionHeading dot="bg-tertiary" title="Public POS & Table QR Rules" />

            <ToggleLine
              title="Enable Public POS Self-Ordering"
              sub="Patrons scan dynamic QR code at table to cart & pay"
              checked={selfOrder}
              onChange={() => setSelfOrder((v) => !v)}
              titleClass="font-semibold"
            />

            {/* Scope card */}
            <div className="bg-surface-container-low p-space-sm rounded-lg flex items-start gap-space-sm">
              <Icon name="room_service" className="text-primary text-[19px] mt-0.5 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">Table QR Ordering Scope</span>
                <p className="font-caption text-caption text-text-secondary mt-0.5">
                  Dine-In guest ordering with server confirmation required before kitchen dispatch.
                </p>
              </div>
            </div>

            {/* Max order value */}
            <div className="flex items-center justify-between gap-space-sm">
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-on-surface font-medium">Max Public Order Value</span>
                <span className="font-caption text-caption text-text-secondary">
                  Threshold needing cashier advance sign-off
                </span>
              </div>
              <ValuePill prefix="₦" value="50,000" minWidth="104px" />
            </div>

            {/* Rush hour auto-pause */}
            <ToggleLine
              title="Rush Hour Auto-Pause"
              sub="Auto-reject public QR orders when kitchen prep time exceeds 30 mins"
              checked={rushPause}
              onChange={() => setRushPause((v) => !v)}
            />
          </div>
        </div>

        {/* Compliance disclaimer */}
        <div className="bg-surface-tint-blue rounded-xl p-space-md flex gap-space-sm items-start">
          <Icon name="policy" className="text-primary text-[21px] mt-0.5 shrink-0" />
          <p className="font-caption text-caption text-text-secondary leading-relaxed">
            <strong className="font-semibold text-on-surface">Statutory Audit Log:</strong> Tax rates and service fee
            changes are cryptographically timestamped and reflected across all future digital receipts, KOT tickets, and
            daily FIRS shift reconciliation reports.
          </p>
        </div>
      </div>

      {/* Toast */}
      <div
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 pointer-events-none flex items-center gap-space-sm p-space-md rounded-xl bg-inverse-surface text-inverse-on-surface shadow-xl max-w-sm ${
          toast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        <Icon name="check_circle" filled className="text-badge-discount-text text-[22px] shrink-0" />
        <span className="font-label-md text-label-md font-medium">{toast ?? ''}</span>
      </div>
    </PosTerminalChrome>
  );
}
