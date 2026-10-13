import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { PosOwnerHeader, PosToggle } from '../components/PosControls';

interface BusinessPosTaxesScreenProps {
  onBack: () => void;
}

type TaxMode = 'inclusive' | 'checkout';

function SectionHeading({ dot, title, meta }: { dot: string; title: string; meta?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-space-xs">
      <div className="flex items-center gap-space-xs min-w-0">
        <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
        <h3 className="font-heading-sm text-heading-sm text-on-surface truncate">{title}</h3>
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
      <PosToggle checked={checked} onChange={onChange} ariaLabel={title} />
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
      className={`flex items-center justify-between p-space-sm rounded-lg cursor-pointer active:scale-[0.99] transition-all ${
        selected ? 'bg-surface-tint-blue' : 'bg-surface-container-low'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-space-sm min-w-0">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
            selected ? 'bg-primary' : 'bg-surface-container-high'
          }`}
        >
          <div
            className={`w-2.5 h-2.5 rounded-full ${selected ? 'bg-surface-container-lowest' : 'bg-transparent'}`}
          />
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

export function BusinessPosTaxesScreen({ onBack }: BusinessPosTaxesScreenProps) {
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
    <AppScreen>
      <PosOwnerHeader title="Taxes & Surcharges" onBack={onBack} />

      <div className="px-margin pt-space-md pb-space-2xl flex flex-col gap-space-lg">
        {/* Sub-header & manager security state */}
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center justify-between gap-space-xs">
            <div className="min-w-0">
              <h2 className="font-heading-md text-heading-md text-on-surface tracking-tight truncate">
                Taxes &amp; Surcharges
              </h2>
              <p className="font-caption text-caption text-text-secondary mt-0.5">Statutory VAT &amp; Dining Fees</p>
            </div>
            <div className="flex items-center gap-1.5 px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text shrink-0">
              <Icon name="verified_user" filled className="text-[15px]" />
              <span className="font-caption text-caption font-semibold tracking-wide">PIN Verified</span>
            </div>
          </div>
          <div className="flex items-center gap-space-2xs text-on-surface-variant font-caption text-caption">
            <Icon name="lock" className="text-[13px]" />
            <span>Manager Authorized • Session ID: #MGR-8841-LAGOS</span>
          </div>
        </div>

        {/* Section 1: Statutory tax */}
        <div className="flex flex-col gap-space-sm">
          <SectionHeading
            dot="bg-primary"
            title="Statutory Tax (FIRS)"
            meta={
              <span className="font-caption text-caption text-primary font-medium bg-surface-tint-blue px-2 py-0.5 rounded-full shrink-0">
                National Schedule
              </span>
            }
          />
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
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
              <label
                htmlFor="firs-tin"
                className="font-label-sm text-label-sm text-on-surface-variant font-medium"
              >
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
        </div>

        {/* Section 2: Service & packaging */}
        <div className="flex flex-col gap-space-sm">
          <SectionHeading dot="bg-secondary" title="Service & Packaging Surcharges" />
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
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
                <div className="flex items-center bg-surface-container-low px-space-sm py-1.5 rounded-lg gap-1 min-w-[76px] justify-center shrink-0">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">5.0</span>
                  <span className="font-label-sm text-label-sm text-text-secondary">%</span>
                </div>
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
                <div className="flex items-center bg-surface-container-low px-space-sm py-1.5 rounded-lg gap-1 min-w-[90px] justify-center shrink-0">
                  <span className="font-label-sm text-label-sm text-text-secondary">₦</span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">300</span>
                </div>
              </div>
              <ToggleLine
                title="Apply automatically when order type is Takeaway / Delivery"
                checked={packagingAuto}
                onChange={() => setPackagingAuto((v) => !v)}
                titleClass="font-normal text-on-surface-variant"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Public POS rules */}
        <div className="flex flex-col gap-space-sm">
          <SectionHeading dot="bg-tertiary" title="Public POS & Table QR Rules" />
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
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
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                  Table QR Ordering Scope
                </span>
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
              <div className="flex items-center bg-surface-container-low px-space-sm py-1.5 rounded-lg gap-1 min-w-[104px] justify-center shrink-0">
                <span className="font-label-sm text-label-sm text-text-secondary">₦</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">50,000</span>
              </div>
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
        <div className="bg-surface-container-high/60 rounded-xl p-space-md flex gap-space-sm items-start">
          <Icon name="policy" className="text-secondary text-[21px] mt-0.5 shrink-0" />
          <p className="font-caption text-caption text-text-secondary leading-relaxed">
            <strong className="font-semibold text-on-surface">Statutory Audit Log:</strong> Tax rates and service fee
            changes are cryptographically timestamped and reflected across all future digital receipts, KOT tickets, and
            daily FIRS shift reconciliation reports.
          </p>
        </div>

        {/* Primary action */}
        <div className="flex flex-col gap-space-2xs">
          <button
            type="button"
            onClick={() => showToast('Tax & surcharge rules applied to all future receipts')}
            className="w-full h-11 bg-primary-container text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-space-xs active:scale-[0.98] transition-all shadow-md"
          >
            <Icon name="save" className="text-[19px]" />
            <span>Apply Tax &amp; Surcharge Rules</span>
          </button>
          <div className="flex justify-center items-center gap-1.5 py-1">
            <Icon name="lock_clock" className="text-text-tertiary text-[13px]" />
            <span className="font-caption text-caption text-text-tertiary">Requires Manager Role clearance</span>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-[124px] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="mx-auto w-fit max-w-full bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full shadow-xl flex items-center gap-space-xs">
            <Icon name="check_circle" filled className="text-badge-discount-text text-[17px] shrink-0" />
            <span className="font-label-sm text-label-sm font-medium truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
