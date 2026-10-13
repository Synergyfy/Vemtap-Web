import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';

interface DesktopPosReceiptScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
  onBack: () => void;
}

const LOGO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDH8VB59GUgwKjNUOa2nu0dK9H7jQD6Yp4-Q9cRN1JXb1tf9PbZj3KYGRRTMFF-0tZcUwWg6N2B3vjFm2SWZq_YoND7cC7v-AP5hZ8UL7Ks1Sx74MR0Bvq8TuUGNCfeHm4l49kcypsoVPEX0n95np050XzNoehB3UJXp5qMaW5gz0Lv4jKqUOaKQqW0URCOq1VQf5Q5Eyw7R0HgjYrQYN7K5_7PXvn-cfZY6bWkDRnMatyzDO6DItsdLA';

const QR_SVG =
  'M10 10h30v30H10V10zm6 6v18h18V16H16zm44-6h30v30H60V10zm6 6v18h18V16H66zm-56 50h30v30H10V60zm6 6v18h18V66H16zm54-6h10v10H70V60zm10 10h10v10H80V70zm-10 10h10v10H70V80zm10 10h10v10H80V90zm-30-30h10v10H50V60zm10 20h10v10H60V80zm-10 10h10v10H50V90zm-20-40h10v10H30V50zm10-10h10v10H40V40zm0 20h10v10H40V60zm-20-10h10v10H20V50zm30-20h10v10H50V30zm20 0h10v10H70V30zM22 22h6v6h-6v-6zm50 0h6v6h-6v-6zm-50 50h6v6h-6v-6z';

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

interface RuleProps {
  icon: string;
  iconClass?: string;
  title: string;
  desc: string;
  badge?: string;
  checked: boolean;
  onChange: () => void;
}

function RuleRow({ icon, iconClass = 'text-primary', title, desc, badge, checked, onChange }: RuleProps) {
  return (
    <div className="flex items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors gap-space-xs">
      <div className="flex items-start gap-space-sm min-w-0 pr-space-xs">
        <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shrink-0 mt-0.5">
          <Icon name={icon} className={`${iconClass} text-[18px]`} />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-label-md text-label-md font-semibold text-on-surface truncate">{title}</span>
            {badge && (
              <span className="font-caption text-caption bg-surface-container-high text-on-surface-variant px-1.5 py-0.2 rounded font-semibold text-[10px] shrink-0">
                {badge}
              </span>
            )}
          </div>
          <span className="font-caption text-caption text-text-secondary">{desc}</span>
        </div>
      </div>
      <Toggle checked={checked} label={title} onChange={onChange} />
    </div>
  );
}

function FieldCard({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-surface-subtle rounded-xl p-space-md shadow-sm flex flex-col gap-space-2xs">
      <div className="flex justify-between items-center gap-space-xs">
        <label className="font-label-sm text-label-sm text-text-secondary">{label}</label>
        {hint}
      </div>
      {children}
    </div>
  );
}

function SectionHead({ icon, title, meta }: { icon: string; title: string; meta?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-space-xs flex-wrap">
      <div className="flex items-center gap-space-xs min-w-0">
        <Icon name={icon} className="text-primary text-[22px] shrink-0" />
        <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight truncate">{title}</h2>
      </div>
      {meta}
    </div>
  );
}

function Dashed() {
  return (
    <div className="w-full my-2 flex justify-center text-text-tertiary select-none overflow-hidden font-mono text-[10px]">
      ---------------------------------------------------
    </div>
  );
}

function ReceiptLine({ name, note, amount }: { name: string; note: string; amount: string }) {
  return (
    <div className="flex justify-between items-baseline text-on-surface gap-space-xs">
      <div className="flex flex-col min-w-0">
        <span className="font-label-md text-label-md font-semibold truncate">{name}</span>
        <span className="font-caption text-caption text-text-secondary truncate">{note}</span>
      </div>
      <span className="font-label-md text-label-md font-semibold font-mono shrink-0">{amount}</span>
    </div>
  );
}

function CalcRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-text-secondary gap-space-xs">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function DesktopPosReceiptScreen({ onNav, onBack }: DesktopPosReceiptScreenProps) {
  const [bizName, setBizName] = useState('Urban Grill & Bistro');
  const [slogan, setSlogan] = useState('Woodfire & Craft Kitchen');
  const [tin, setTin] = useState('TIN-8894102-NG');
  const [footer, setFooter] = useState('Thank you for dining with us! Follow @urbangrillbistro');
  const [paper, setPaper] = useState<'80' | '58'>('80');
  const [rules, setRules] = useState<Record<string, boolean>>({
    autoPrint: true,
    kitchenChit: true,
    splitBar: true,
    phoneMask: true,
    showQr: true,
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

  const flip = (key: string) => setRules((prev) => ({ ...prev, [key]: !prev[key] }));

  const slipClass =
    paper === '80'
      ? 'bg-surface-canvas rounded-lg shadow-md p-5 text-on-surface mx-auto max-w-[320px]'
      : 'bg-surface-canvas rounded-lg shadow-md p-4 text-on-surface text-caption mx-auto max-w-[250px]';

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
              <div className="flex items-center gap-space-xs flex-wrap text-text-tertiary font-caption text-caption uppercase tracking-wider font-semibold">
                <span className="text-primary">Terminal Settings</span>
                <span>•</span>
                <span>Hardware &amp; Output</span>
                <span>•</span>
                <span>Station POS-NG-ABJ-004</span>
              </div>
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                Receipt &amp; Order Customization
              </h1>
              <p className="font-body-md text-body-md text-text-secondary">
                Customize real-time thermal typography, print triggers, and loyalty digital handshakes.
              </p>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-space-2xs shrink-0">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                  Live Thermal Simulation
                </span>
                <button
                  type="button"
                  onClick={() => showToast('Receipt rules & styling saved to cloud POS')}
                  className="px-space-lg py-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary transition-all flex items-center justify-center gap-space-xs shadow-md"
                >
                  <Icon name="save" className="text-[19px]" />
                  <span>Save Setup</span>
                </button>
              </div>
              <span className="font-caption text-caption text-text-secondary">
                {paper === '80' ? '80mm ESC/POS' : '58mm Mini ESC'} • Sunmi Cloud Print Link Ready
              </span>
            </div>
          </div>
        </div>

        {/* Configuration column + live preview column */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-space-lg items-start">
          <div className="flex flex-col gap-space-lg min-w-0">
            {/* Paper format */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <SectionHead icon="print" title="Thermal Paper Standard" />
              <div className="bg-surface-container-low rounded-xl p-space-xs flex gap-space-xs">
                <button
                  type="button"
                  onClick={() => setPaper('80')}
                  className={`flex-1 py-3 px-3 rounded-lg font-label-md text-label-md font-semibold flex items-center justify-center gap-2 transition-all ${
                    paper === '80'
                      ? 'bg-surface-canvas shadow-sm text-primary'
                      : 'text-text-secondary hover:bg-surface-canvas/50'
                  }`}
                >
                  <Icon name="receipt_long" className="text-[17px]" />
                  <span>80mm Standard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaper('58')}
                  className={`flex-1 py-3 px-3 rounded-lg font-label-md text-label-md font-medium flex items-center justify-center gap-2 transition-all ${
                    paper === '58'
                      ? 'bg-surface-canvas shadow-sm text-primary'
                      : 'text-text-secondary hover:bg-surface-canvas/50'
                  }`}
                >
                  <Icon name="receipt" className="text-[17px]" />
                  <span>58mm Compact</span>
                </button>
              </div>
              <p className="font-caption text-caption text-text-secondary">
                Selected width aligns automatic auto-cutter margins and column character wrapping.
              </p>
            </div>

            {/* Slip header branding */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <SectionHead icon="storefront" title="Slip Header Branding" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
                <FieldCard label="Business Display Name">
                  <input
                    type="text"
                    maxLength={32}
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    placeholder="e.g. Urban Grill & Bistro"
                    className="w-full bg-surface-container-low rounded-lg px-3 py-2.5 font-label-md text-label-md text-on-surface focus:outline-none focus:bg-surface-tint-blue transition-colors"
                  />
                </FieldCard>
                <FieldCard label="Subtitle / Slogan Line">
                  <input
                    type="text"
                    maxLength={40}
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    placeholder="e.g. Artisanal Bakehouse"
                    className="w-full bg-surface-container-low rounded-lg px-3 py-2.5 font-label-md text-label-md text-on-surface focus:outline-none focus:bg-surface-tint-blue transition-colors"
                  />
                </FieldCard>
                <FieldCard
                  label="Taxpayer ID (VAT / TIN)"
                  hint={
                    <span className="font-caption text-caption text-primary bg-surface-tint-blue px-2 py-0.5 rounded font-medium">
                      FIRS Compliant
                    </span>
                  }
                >
                  <input
                    type="text"
                    maxLength={20}
                    value={tin}
                    onChange={(e) => setTin(e.target.value)}
                    placeholder="e.g. TIN-0000000-XX"
                    className="w-full bg-surface-container-low rounded-lg px-3 py-2.5 font-label-md text-label-md font-mono text-on-surface focus:outline-none focus:bg-surface-tint-blue transition-colors"
                  />
                </FieldCard>
              </div>
            </div>

            {/* Footer greetings */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <SectionHead icon="short_text" title="Footer Greetings & Socials" />
              <div className="flex flex-col gap-space-2xs">
                <div className="flex justify-between items-center gap-space-xs">
                  <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="receipt-footer">
                    Dynamic Slip Closing Message
                  </label>
                  <span className="font-caption text-caption text-text-tertiary shrink-0">{footer.length} / 120</span>
                </div>
                <textarea
                  id="receipt-footer"
                  rows={3}
                  maxLength={120}
                  value={footer}
                  onChange={(e) => setFooter(e.target.value)}
                  placeholder="Enter thank-you note, Instagram handle, or Wi-Fi password..."
                  className="w-full bg-surface-container-low rounded-lg p-3 font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-tint-blue resize-none transition-colors"
                />
                <div className="flex items-center gap-1.5 mt-1 text-text-secondary">
                  <Icon name="wifi" className="text-[15px] text-primary" />
                  <span className="font-caption text-caption">Tip: You can append public guest Wi-Fi details here.</span>
                </div>
              </div>
            </div>

            {/* Print automation rules */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <SectionHead
                icon="smart_toy"
                title="Print Automation Rules"
                meta={
                  <span className="font-caption text-caption text-badge-discount-text font-semibold bg-badge-discount-bg px-2 py-0.5 rounded-full shrink-0">
                    5 Active
                  </span>
                }
              />
              <div className="flex flex-col gap-space-2xs">
                <RuleRow
                  icon="print"
                  title="Auto-print customer receipt"
                  desc="Cut slip instantly when payment clears"
                  checked={rules.autoPrint}
                  onChange={() => flip('autoPrint')}
                />
                <RuleRow
                  icon="soup_kitchen"
                  iconClass="text-secondary"
                  title="Print duplicate kitchen chit"
                  desc="Physical KDS backup for grill expeditor"
                  checked={rules.kitchenChit}
                  onChange={() => flip('kitchenChit')}
                />
                <RuleRow
                  icon="local_bar"
                  iconClass="text-secondary"
                  title="Split bar & drink tickets"
                  desc="Route mocktails/wines to station printer"
                  checked={rules.splitBar}
                  onChange={() => flip('splitBar')}
                />
                <RuleRow
                  icon="privacy_tip"
                  title="Mask customer phone"
                  badge="NDPR"
                  desc="Conceals middle 6 digits on physical slips"
                  checked={rules.phoneMask}
                  onChange={() => flip('phoneMask')}
                />
                <RuleRow
                  icon="qr_code_scanner"
                  title="Show Loyalty QR Code"
                  desc="Enables 1-tap points claim & review page"
                  checked={rules.showQr}
                  onChange={() => flip('showQr')}
                />
              </div>
            </div>
          </div>

          {/* Live thermal preview column */}
          <div className="flex flex-col gap-space-sm self-start lg:sticky lg:top-24 w-full">
            <div className="flex items-center justify-between mb-1 gap-space-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse shrink-0" />
                <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">
                  Live Thermal Simulation
                </span>
              </div>
              <span className="font-caption text-caption text-primary bg-surface-tint-blue px-2 py-0.5 rounded-full font-medium shrink-0">
                {paper === '80' ? '80mm ESC/POS' : '58mm Mini ESC'}
              </span>
            </div>

            <div className="relative bg-surface-container-high rounded-xl p-space-sm shadow-sm">
              <div className={slipClass}>
                {/* Serrated edge */}
                <div className="flex justify-between items-center mb-4 opacity-40 overflow-hidden">
                  <span className="font-caption text-caption tracking-widest text-text-tertiary">
                    ••••••••••••••••••••••••••••••••••
                  </span>
                </div>

                {/* Branding */}
                <div className="text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center mb-2 shadow-sm overflow-hidden">
                    <img src={LOGO_IMG} alt="" className="w-9 h-9 object-contain" />
                  </div>
                  <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface uppercase tracking-tight">
                    {bizName.trim() || 'BUSINESS NAME'}
                  </h3>
                  <p className="font-caption text-caption text-text-secondary italic">{slogan}</p>
                  <p className="font-caption text-caption text-text-secondary mt-1">
                    Victoria Island, Plot 14 Admiralty Way, Lagos
                  </p>
                  <p className="font-caption text-caption text-text-secondary">Tel: +234 (0) 812 900 4421</p>
                  <div className="mt-2 py-0.5 px-2 bg-surface-container rounded font-caption text-caption text-on-surface-variant font-mono">
                    TIN: {tin.trim() || 'TIN-NOT-SET'}
                  </div>
                </div>

                {/* Order meta */}
                <div className="mt-4 pt-3 flex justify-between font-caption text-caption text-text-secondary font-mono gap-space-xs">
                  <span>TXN #88204-POS1</span>
                  <span>14:32 • 28 OCT 2024</span>
                </div>
                <div className="flex justify-between font-caption text-caption text-text-secondary font-mono pb-2 gap-space-xs">
                  <span>Server: Adebayo O.</span>
                  <span>{rules.phoneMask ? 'Phone: +234 ••• ••• 4410' : 'Phone: +234 812 900 4410'}</span>
                </div>

                <Dashed />

                {/* Line items */}
                <div className="flex flex-col gap-2 py-1">
                  <ReceiptLine name="1x Woodfire Ribeye Steak" note="Medium Rare • Herb Butter Jus" amount="₦16,000.00" />
                  <ReceiptLine name="2x Hibiscus Smoked Cooler" note="Signature Mocktail" amount="₦4,400.00" />
                </div>

                <Dashed />

                {/* Calculations */}
                <div className="flex flex-col gap-1 font-caption text-caption font-mono">
                  <CalcRow label="Subtotal" value="₦20,400.00" />
                  <CalcRow label="VAT (7.5%)" value="₦1,530.00" />
                  <CalcRow label="Consumption Tax (5%)" value="₦1,020.00" />
                  <div className="flex justify-between font-heading-sm text-heading-sm font-bold text-on-surface pt-1.5 font-sans">
                    <span>TOTAL DUE</span>
                    <span className="font-mono">₦22,950.00</span>
                  </div>
                  <div className="flex justify-between text-badge-discount-text font-medium pt-0.5 gap-space-xs">
                    <span>PAID: VEMTAP Smart Tap</span>
                    <span>AUTH #994012</span>
                  </div>
                </div>

                <Dashed />

                {/* Loyalty QR */}
                {rules.showQr && (
                  <div className="flex flex-col items-center py-2">
                    <div className="p-2 bg-surface-container rounded-lg flex items-center justify-center shadow-inner">
                      <svg className="w-20 h-20 text-on-surface" fill="currentColor" viewBox="0 0 100 100" aria-hidden="true">
                        <path d={QR_SVG} />
                      </svg>
                    </div>
                    <span className="font-caption text-caption text-primary font-semibold mt-1 flex items-center gap-1">
                      <Icon name="stars" className="text-[12px]" />
                      Earn 230 VEMTAP Points
                    </span>
                    <span className="font-caption text-caption text-text-tertiary">
                      Scan with camera for instant e-receipt
                    </span>
                  </div>
                )}

                <Dashed />

                {/* Footer */}
                <div className="text-center pt-1">
                  <p className="font-caption text-caption text-text-secondary italic">
                    {footer.trim() || 'Thank you for your patronage!'}
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-1 text-text-tertiary">
                    <span className="font-caption text-caption tracking-widest uppercase">POWERED BY VEMTAP OS</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 opacity-40 overflow-hidden">
                  <span className="font-caption text-caption tracking-widest text-text-tertiary">
                    ••••••••••••••••••••••••••••••••••
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hardware connectivity ribbon */}
        <div className="w-full bg-surface-tint-blue rounded-xl p-space-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-10 h-10 rounded-full bg-surface-canvas flex items-center justify-center shadow-sm shrink-0">
              <Icon name="bluetooth_connected" className="text-primary text-[21px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md font-semibold text-on-surface">Sunmi Cloud Print Link</span>
              <span className="font-caption text-caption text-text-secondary truncate">
                BT: VEMTAP-P3-9092 • 100% Signal
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <span className="flex items-center gap-1 bg-badge-discount-bg text-badge-discount-text px-2 py-1 rounded-full font-caption text-caption font-semibold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
              Ready
            </span>
            <button
              type="button"
              onClick={() => showToast('Sent sample 80mm test payload to Sunmi BT printer')}
              className="px-space-md py-2.5 rounded-xl bg-surface-canvas text-on-surface font-button-secondary text-button-secondary font-medium flex items-center justify-center gap-2 shadow-sm hover:bg-surface-container-low transition-colors"
            >
              <Icon name="print" className="text-[19px] text-primary" />
              <span>Test Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 pointer-events-none flex items-center gap-space-sm p-space-md rounded-xl bg-inverse-surface text-inverse-on-surface shadow-xl max-w-sm ${
          toast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        <Icon name="check_circle" className="text-badge-discount-text text-[22px] shrink-0" />
        <span className="font-label-md text-label-md font-medium">{toast ?? ''}</span>
      </div>
    </PosTerminalChrome>
  );
}
