import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { PosOwnerHeader, PosToggle } from '../components/PosControls';

interface BusinessPosHardwareScreenProps {
  onBack: () => void;
}

const HARDWARE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDTXJJQZZqBWZVwdPIAKnzZ0b-6OT2_W8zY5grYiVraOv4nmaNxNDADEpHYjhfqAjS32EfJnREZ5feFfbrsrXw9alU2NnedzbNuO6WGzAl3o2cRR06OhIjyuhEE_naqSSvn1NDD1anAytMuMZPJq3pIzXHvokvn72SvkXvDCK9_qudtmzX6GkTc9oG1wLFVlEEcV-WM5UiHoiLDRAsyyH7MgR6dr5MN1tk5tnjyA-11vpWF6p4E2bXqdQ';

const PILL_RAIL = [
  { icon: 'print', text: 'Receipt 80mm: Online', color: 'text-badge-discount-text' },
  { icon: 'contactless', text: 'Push POS: Synced', color: 'text-primary' },
  { icon: 'lock_open', text: 'Drawer: Armed', color: 'text-badge-discount-text' },
];

const PROVIDERS = ['Moniepoint', 'OPay Smart POS', 'Sunmi POS'] as const;

interface ToggleRowProps {
  title: string;
  sub: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleRow({ title, sub, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-space-sm">
      <div className="flex flex-col min-w-0">
        <span className="font-body-md text-body-md text-text-primary font-medium">{title}</span>
        <span className="font-caption text-caption text-text-secondary">{sub}</span>
      </div>
      <PosToggle checked={checked} onChange={onChange} ariaLabel={title} />
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  meta,
  metaClass = 'text-text-secondary',
}: {
  icon: string;
  title: string;
  meta: string;
  metaClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-space-xs">
      <div className="flex items-center gap-space-xs min-w-0">
        <Icon name={icon} className="text-primary text-[19px] shrink-0" />
        <h3 className="font-heading-sm text-heading-sm text-on-surface truncate">{title}</h3>
      </div>
      <span className={`font-caption text-caption ${metaClass} shrink-0`}>{meta}</span>
    </div>
  );
}

export function BusinessPosHardwareScreen({ onBack }: BusinessPosHardwareScreenProps) {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    drawerKick: true,
    exactTender: false,
    autoPush: true,
    webhook: true,
    houseTab: true,
    cameraScanner: true,
  });
  const [provider, setProvider] = useState<(typeof PROVIDERS)[number]>('Moniepoint');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
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
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };

  const flip = (key: string) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const runTest = (key: string, done: string) => {
    if (testing) return;
    setTesting(key);
    window.setTimeout(() => {
      setTesting(null);
      showToast(done);
    }, 700);
  };

  const save = () => {
    if (saving) return;
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      showToast('Hardware profile applied successfully');
    }, 900);
  };

  return (
    <AppScreen>
      <PosOwnerHeader title="Payment & Hardware Setup" onBack={onBack} />

      <div className="flex flex-col pb-32">
        {/* Status banner */}
        <div className="px-margin pt-4 pb-2">
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm">
            <div className="flex items-start justify-between gap-space-xs">
              <div className="flex items-center gap-space-xs min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                  <Icon name="point_of_sale" className="text-[21px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-heading-sm text-heading-sm text-on-surface">Payment &amp; Hardware</span>
                  <span className="font-caption text-caption text-text-secondary">Tender Rails &amp; Counter Devices</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text shrink-0">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                <span className="font-caption text-caption font-semibold">Terminal Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hardware health pill rail */}
        <div className="px-margin py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {PILL_RAIL.map((pill) => (
            <div
              key={pill.text}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-full text-on-surface shrink-0"
            >
              <Icon name={pill.icon} className={`text-[15px] ${pill.color}`} />
              <span className="font-caption text-caption font-medium">{pill.text}</span>
            </div>
          ))}
        </div>

        {/* Ambient visual card */}
        <div className="px-margin my-3">
          <div className="relative w-full h-32 rounded-xl overflow-hidden shadow-sm flex items-center">
            <img src={HARDWARE_IMG} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-on-surface/90 via-on-surface/60 to-transparent" />
            <div className="relative z-10 px-4 py-3 max-w-[240px]">
              <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-caption text-caption font-semibold uppercase tracking-wider">
                Live Register 01
              </span>
              <h2 className="font-heading-sm text-heading-sm text-on-primary mt-1">Checkout Peripherals</h2>
              <p className="font-caption text-caption text-surface-container-high truncate">
                Sync hardware &amp; instant tender routes
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Active payment methods */}
        <div className="px-margin mt-3 flex flex-col gap-3">
          <SectionTitle icon="payments" title="Active Payment Methods" meta="5 Channels Configured" />

          {/* Cash tender */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between gap-space-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary shrink-0">
                  <Icon name="attach_money" className="text-[21px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md font-semibold text-text-primary">Cash Tender</span>
                    <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shrink-0">
                      Standard
                    </span>
                  </div>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    Physical currency handling &amp; change drawer
                  </span>
                </div>
              </div>
              <Icon name="check_circle" className="text-badge-discount-text text-[21px] shrink-0" />
            </div>
            <div className="bg-surface-subtle rounded-lg p-3 flex flex-col gap-2.5">
              <ToggleRow
                title="Auto-kick cash drawer on sale"
                sub="Fires 24V pulse to RJ12 connector"
                checked={toggles.drawerKick}
                onChange={() => flip('drawerKick')}
              />
              <div className="h-px bg-surface-container-high" />
              <ToggleRow
                title="Require exact tender entry"
                sub="Block sale until exact banknote count is input"
                checked={toggles.exactTender}
                onChange={() => flip('exactTender')}
              />
            </div>
          </div>

          {/* Contactless card / POS terminal push */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary shrink-0">
                <Icon name="contactless" className="text-[21px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                    Contactless Card / POS Terminal Push
                  </span>
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text shrink-0" />
                </div>
                <span className="font-caption text-caption text-text-secondary truncate">
                  Wireless tender push over local subnet
                </span>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-lg p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon name="router" className="text-primary text-[17px] shrink-0" />
                  <span className="font-label-md text-label-md font-semibold text-on-surface truncate">
                    {provider} Terminal #04
                  </span>
                </div>
                <span className="font-caption text-caption text-primary font-medium bg-surface-tint-blue px-2 py-0.5 rounded-full shrink-0">
                  Connected • 192.168.1.120
                </span>
              </div>
              <div className="flex gap-2 pt-1">
                {PROVIDERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setProvider(item)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-center font-caption text-caption shadow-sm transition-colors ${
                      provider === item
                        ? 'bg-primary text-on-primary font-semibold'
                        : 'bg-surface-container-lowest text-text-secondary font-medium'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="h-px bg-surface-container-high" />
              <ToggleRow
                title="Auto-push total amount to POS"
                sub="Zero-tap amount transmission to device screen"
                checked={toggles.autoPush}
                onChange={() => flip('autoPush')}
              />
            </div>
          </div>

          {/* Dynamic bank transfer */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary shrink-0">
                <Icon name="account_balance" className="text-[21px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-label-md font-semibold text-text-primary">Dynamic Bank Transfer</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-bold shrink-0">
                    Fast Webhook
                  </span>
                </div>
                <span className="font-caption text-caption text-text-secondary truncate">
                  Auto-allocated dynamic reserve account
                </span>
              </div>
            </div>
            <div className="bg-surface-subtle rounded-lg p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex flex-col min-w-0">
                  <span className="font-caption text-caption text-text-secondary">
                    Dedicated Dynamic Virtual Account
                  </span>
                  <span className="font-label-md text-label-md font-bold text-text-primary tracking-wide truncate">
                    Wema Bank • 9940284411 (VEM-POS-01)
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Copy account number"
                  onClick={() => showToast('Account number copied to clipboard')}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary active:scale-95 transition-transform shrink-0"
                >
                  <Icon name="content_copy" className="text-[17px]" />
                </button>
              </div>
              <div className="h-px bg-surface-container-high" />
              <ToggleRow
                title="Auto-confirm via instant webhook"
                sub="Trigger receipt printing upon inbound wire notice"
                checked={toggles.webhook}
                onChange={() => flip('webhook')}
              />
            </div>
          </div>

          {/* VEMTAP one-tap & QR */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between gap-space-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <Icon name="qr_code_scanner" className="text-[21px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                      VEMTAP One-Tap &amp; Customer QR
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shrink-0">
                      Active Rail
                    </span>
                  </div>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    Consumer wallet auto-debit &amp; loyalty sync
                  </span>
                </div>
              </div>
              <Icon name="verified" className="text-primary text-[21px] shrink-0" />
            </div>
            <div className="bg-surface-tint-blue rounded-lg p-3 flex items-center justify-between gap-space-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Icon name="stars" className="text-primary text-[19px] shrink-0" />
                <span className="font-caption text-caption font-medium text-on-primary-fixed truncate">
                  Instant 2.5% Loyalty Redemption on Scan
                </span>
              </div>
              <span className="font-caption text-caption font-semibold text-primary shrink-0">Always On</span>
            </div>
          </div>

          {/* House tab */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between gap-space-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-text-secondary shrink-0">
                  <Icon name="badge" className="text-[21px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md font-semibold text-text-primary">
                    House Tab / Offline Credit
                  </span>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    Pre-authorized corporate and regular tabs
                  </span>
                </div>
              </div>
              <PosToggle
                checked={toggles.houseTab}
                onChange={() => flip('houseTab')}
                ariaLabel="House Tab / Offline Credit"
              />
            </div>
            <div className="bg-tertiary-fixed/30 rounded-lg p-3 flex items-center gap-2.5">
              <Icon name="shield_person" className="text-tertiary text-[19px] shrink-0" />
              <span className="font-caption text-caption text-on-tertiary-fixed-variant">
                Manager PIN approval strictly enforced for tabs exceeding ₦50,000.
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Connected hardware */}
        <div className="px-margin mt-8 flex flex-col gap-3">
          <SectionTitle
            icon="devices_other"
            title="Connected Hardware & Peripherals"
            meta="3 Active Nodes"
            metaClass="text-badge-discount-text font-medium"
          />

          {/* Thermal printers */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between gap-space-xs">
              <span className="font-label-md text-label-md font-semibold text-text-primary">Thermal Printers</span>
              <span className="font-caption text-caption text-text-secondary">ESC/POS Compatible</span>
            </div>

            {/* Printer 1 */}
            <div className="bg-surface-subtle rounded-lg p-3 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-space-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <Icon name="receipt_long" className="text-[18px]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-body-md text-body-md font-semibold text-text-primary">
                      Counter Receipt Printer
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-caption text-caption text-text-secondary">Epson TM-T88VI</span>
                      <span className="w-1 h-1 rounded-full bg-outline" />
                      <span className="font-caption text-caption text-badge-discount-text font-medium">
                        Bluetooth • Connected
                      </span>
                      <span className="w-1 h-1 rounded-full bg-outline" />
                      <span className="font-caption text-caption text-text-secondary">80mm Paper</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 gap-space-xs">
                <div className="flex items-center gap-1 min-w-0">
                  <Icon name="signal_cellular_alt" className="text-badge-discount-text text-[15px]" />
                  <span className="font-caption text-caption text-badge-discount-text font-medium">Signal Strong</span>
                </div>
                <button
                  type="button"
                  onClick={() => runTest('printer1', 'Printer feed cycle executed (80mm test voucher printed)')}
                  className="px-3 py-1.5 bg-surface-container-high text-primary rounded-lg font-button-secondary text-button-secondary font-medium active:scale-95 transition-transform shrink-0"
                >
                  {testing === 'printer1' ? 'Testing…' : 'Test Feed'}
                </button>
              </div>
            </div>

            {/* Printer 2 */}
            <div className="bg-surface-subtle rounded-lg p-3 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-space-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <Icon name="restaurant" className="text-[18px]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-body-md text-body-md font-semibold text-text-primary">
                      Kitchen Display System / Chit Printer
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-caption text-caption text-text-secondary">Sunmi Cloud Kitchen Printer</span>
                      <span className="w-1 h-1 rounded-full bg-outline" />
                      <span className="font-caption text-caption text-badge-discount-text font-medium">
                        LAN / IP 192.168.1.108 • Online
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 gap-space-xs">
                <span className="font-caption text-caption text-text-secondary truncate">
                  Auto-route Bar &amp; Hot Kitchen order slips
                </span>
                <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold shrink-0">
                  Active Sync
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast('Scanning for nearby Bluetooth & network printers…')}
              className="w-full py-2.5 rounded-lg bg-surface-container-low text-primary flex items-center justify-center gap-2 font-label-md text-label-md font-semibold active:bg-surface-container transition-colors"
            >
              <Icon name="add_circle" className="text-[17px]" />
              <span>Pair New Bluetooth / Network Printer</span>
            </button>
          </div>

          {/* Cash drawer */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary shrink-0">
                <Icon name="inbox" className="text-[21px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-label-md font-semibold text-text-primary">Cash Drawer</span>
                  <span className="font-caption text-caption text-badge-discount-text font-semibold">Status: Ready</span>
                </div>
                <span className="font-caption text-caption text-text-secondary truncate">
                  RJ12 trigger connected via Epson Printer pin
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 bg-surface-subtle p-3 rounded-lg gap-space-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Icon name="electric_bolt" className="text-primary text-[17px] shrink-0" />
                <span className="font-caption text-caption text-text-primary font-medium truncate">
                  Standard 24V Solenoid Trigger
                </span>
              </div>
              <button
                type="button"
                onClick={() => runTest('drawer', 'RJ12 pulse delivered. Cash drawer opened.')}
                className="px-3 py-1.5 bg-primary text-on-primary rounded-lg font-button-secondary text-button-secondary font-medium active:scale-95 transition-transform shadow-sm shrink-0"
              >
                {testing === 'drawer' ? 'Kicking…' : 'Test Drawer Kick'}
              </button>
            </div>
          </div>

          {/* Barcode scanner */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary shrink-0">
                <Icon name="barcode_scanner" className="text-[21px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md font-semibold text-text-primary">
                  Barcode &amp; Optical Scanners
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-caption text-caption text-text-secondary">Honeywell Voyager 1400g</span>
                  <span className="w-1 h-1 rounded-full bg-outline" />
                  <span className="font-caption text-caption text-badge-discount-text font-medium">USB • Ready</span>
                </div>
              </div>
            </div>
            <div className="bg-surface-subtle rounded-lg p-3 flex items-center justify-between gap-space-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon name="photo_camera" className="text-text-secondary text-[19px] shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-body-md text-body-md text-text-primary font-medium">
                    Phone Camera Scanner Fallback
                  </span>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    Haptic buzz &amp; audible beep on successful 1D/2D scan
                  </span>
                </div>
              </div>
              <PosToggle
                checked={toggles.cameraScanner}
                onChange={() => flip('cameraScanner')}
                ariaLabel="Phone Camera Scanner Fallback"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-md text-label-md shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[17px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}

      {/* Bottom floating CTA deck */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/90 backdrop-blur-xl px-margin pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] shadow-[0_-8px_24px_rgba(17,24,39,0.06)]">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="w-full h-11 bg-primary-container active:scale-[0.98] text-on-primary rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] transition-all disabled:opacity-80"
          >
            {saving && <Icon name="sync" className="text-[19px] animate-spin" />}
            <span>{saving ? 'Syncing Bus…' : 'Save Hardware Configuration'}</span>
            {!saving && <Icon name="save" className="text-[19px]" />}
          </button>
          <div className="text-center">
            <span className="font-caption text-caption text-text-secondary">
              Register 01 • Station Profile: Main Dining Hall
            </span>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
