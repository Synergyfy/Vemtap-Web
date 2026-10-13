import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';

interface DesktopPosHardwareScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
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

function ToggleRow({ title, sub, checked, onChange }: { title: string; sub: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-space-md">
      <div className="flex flex-col min-w-0">
        <span className="font-label-md text-label-md text-text-primary font-medium">{title}</span>
        <span className="font-caption text-caption text-text-secondary">{sub}</span>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
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
    <div className="flex items-center justify-between gap-space-xs flex-wrap">
      <div className="flex items-center gap-space-xs min-w-0">
        <Icon name={icon} className="text-primary text-[22px] shrink-0" />
        <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">{title}</h2>
      </div>
      <span className={`font-caption text-caption font-medium ${metaClass} shrink-0`}>{meta}</span>
    </div>
  );
}

function CardHead({
  icon,
  title,
  meta,
  metaClass = 'text-text-secondary',
  trailing,
}: {
  icon: string;
  title: string;
  meta?: string;
  metaClass?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-space-xs">
      <div className="flex items-center gap-space-sm min-w-0">
        <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary shrink-0">
          <Icon name={icon} className="text-[21px]" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-space-xs flex-wrap">
            <span className="font-label-md text-label-md font-semibold text-text-primary">{title}</span>
            {trailing}
          </div>
          {meta && <span className={`font-caption text-caption ${metaClass}`}>{meta}</span>}
        </div>
      </div>
    </div>
  );
}

export function DesktopPosHardwareScreen({ onNav, onBack }: DesktopPosHardwareScreenProps) {
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
                <Icon name="point_of_sale" className="text-[16px] text-primary" />
                <span className="text-primary">Terminal Settings</span>
                <span>•</span>
                <span>Payment &amp; Hardware</span>
                <span>•</span>
                <span>Station POS-NG-ABJ-004</span>
              </div>
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                Payment &amp; Hardware Setup
              </h1>
              <p className="font-body-md text-body-md text-text-secondary">
                Tender Rails &amp; Counter Devices — sync hardware &amp; instant tender routes across Register 01.
              </p>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-space-2xs shrink-0">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                  Terminal Ready
                </span>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className={`px-space-lg py-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary transition-all flex items-center justify-center gap-space-xs shadow-md ${
                    saving ? 'opacity-75' : ''
                  }`}
                >
                  {saving && <Icon name="sync" className="text-[19px] animate-spin" />}
                  <span>{saving ? 'Syncing Bus…' : 'Save Hardware Configuration'}</span>
                  {!saving && <Icon name="save" className="text-[19px]" />}
                </button>
              </div>
              <span className="font-caption text-caption text-text-secondary">
                Register 01 • Station Profile: Main Dining Hall
              </span>
            </div>
          </div>
        </div>

        {/* Hardware health pill rail */}
        <div className="flex items-center gap-space-xs flex-wrap">
          {PILL_RAIL.map((pill) => (
            <div
              key={pill.text}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-full text-on-surface"
            >
              <Icon name={pill.icon} className={`text-[15px] ${pill.color}`} />
              <span className="font-caption text-caption font-medium">{pill.text}</span>
            </div>
          ))}
        </div>

        {/* Ambient visual card */}
        <div className="relative w-full h-44 rounded-xl overflow-hidden shadow-sm flex items-center">
          <img src={HARDWARE_IMG} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-on-surface/90 via-on-surface/60 to-transparent" />
          <div className="relative z-10 px-space-lg py-space-md max-w-[320px]">
            <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-caption text-caption font-semibold uppercase tracking-wider">
              Live Register 01
            </span>
            <h2 className="font-heading-sm text-heading-sm text-on-primary mt-1">Checkout Peripherals</h2>
            <p className="font-caption text-caption text-surface-container-high truncate">
              Sync hardware &amp; instant tender routes
            </p>
          </div>
        </div>

        {/* Section 1: Active payment methods */}
        <div className="flex flex-col gap-space-md">
          <SectionTitle icon="payments" title="Active Payment Methods" meta="5 Channels Configured" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md items-start">
            {/* Cash tender */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <CardHead
                icon="attach_money"
                title="Cash Tender"
                meta="Physical currency handling & change drawer"
                trailing={
                  <>
                    <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shrink-0">
                      Standard
                    </span>
                    <Icon name="check_circle" className="text-badge-discount-text text-[21px] shrink-0" />
                  </>
                }
              />
              <div className="bg-surface-subtle rounded-lg p-space-md flex flex-col gap-space-sm">
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
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <CardHead
                icon="contactless"
                title="Contactless Card / POS Terminal Push"
                meta="Wireless tender push over local subnet"
                trailing={<span className="w-2 h-2 rounded-full bg-badge-discount-text shrink-0" />}
              />
              <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-space-sm">
                <div className="flex items-center justify-between gap-space-xs">
                  <div className="flex items-center gap-space-xs min-w-0">
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
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <CardHead
                icon="account_balance"
                title="Dynamic Bank Transfer"
                meta="Auto-allocated dynamic reserve account"
                trailing={
                  <span className="px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-bold shrink-0">
                    Fast Webhook
                  </span>
                }
              />
              <div className="bg-surface-subtle rounded-lg p-space-md flex flex-col gap-space-sm">
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
                    className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors shrink-0"
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
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <CardHead
                icon="qr_code_scanner"
                title="VEMTAP One-Tap & Customer QR"
                meta="Consumer wallet auto-debit & loyalty sync"
                trailing={
                  <>
                    <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shrink-0">
                      Active Rail
                    </span>
                    <Icon name="verified" className="text-primary text-[21px] shrink-0" />
                  </>
                }
              />
              <div className="bg-surface-tint-blue rounded-lg p-space-md flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs min-w-0">
                  <Icon name="stars" className="text-primary text-[19px] shrink-0" />
                  <span className="font-caption text-caption font-medium text-on-primary-fixed truncate">
                    Instant 2.5% Loyalty Redemption on Scan
                  </span>
                </div>
                <span className="font-caption text-caption font-semibold text-primary shrink-0">Always On</span>
              </div>
            </div>

            {/* House tab */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between gap-space-xs">
                <CardHead
                  icon="badge"
                  title="House Tab / Offline Credit"
                  meta="Pre-authorized corporate and regular tabs"
                />
                <Toggle
                  checked={toggles.houseTab}
                  onChange={() => flip('houseTab')}
                  label="House Tab / Offline Credit"
                />
              </div>
              <div className="bg-surface-tint-blue rounded-lg p-space-md flex items-start gap-space-sm">
                <Icon name="shield_person" className="text-primary text-[19px] mt-0.5 shrink-0" />
                <span className="font-caption text-caption text-on-surface-variant leading-relaxed">
                  Manager PIN approval strictly enforced for tabs exceeding ₦50,000.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Connected hardware */}
        <div className="flex flex-col gap-space-md">
          <SectionTitle
            icon="devices_other"
            title="Connected Hardware & Peripherals"
            meta="3 Active Nodes"
            metaClass="text-badge-discount-text"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md items-start">
            {/* Thermal printers */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between gap-space-xs">
                <span className="font-label-md text-label-md font-semibold text-text-primary">Thermal Printers</span>
                <span className="font-caption text-caption text-text-secondary">ESC/POS Compatible</span>
              </div>

              {/* Printer 1 */}
              <div className="bg-surface-subtle rounded-lg p-space-md flex flex-col gap-space-sm">
                <div className="flex items-start justify-between gap-space-xs">
                  <div className="flex items-center gap-space-sm min-w-0">
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
                    className="px-3 py-1.5 bg-surface-container-high text-primary rounded-lg font-button-secondary text-button-secondary font-medium hover:bg-surface-container transition-colors shrink-0"
                  >
                    {testing === 'printer1' ? 'Testing…' : 'Test Feed'}
                  </button>
                </div>
              </div>

              {/* Printer 2 */}
              <div className="bg-surface-subtle rounded-lg p-space-md flex flex-col gap-space-sm">
                <div className="flex items-start justify-between gap-space-xs">
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                      <Icon name="restaurant" className="text-[18px]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-body-md text-body-md font-semibold text-text-primary">
                        Kitchen Display System / Chit Printer
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-caption text-caption text-text-secondary">
                          Sunmi Cloud Kitchen Printer
                        </span>
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
                className="w-full py-2.5 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center gap-2 font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors"
              >
                <Icon name="add_circle" className="text-[17px]" />
                <span>Pair New Bluetooth / Network Printer</span>
              </button>
            </div>

            {/* Cash drawer */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <CardHead
                icon="inbox"
                title="Cash Drawer"
                meta="RJ12 trigger connected via Epson Printer pin"
                trailing={
                  <span className="font-caption text-caption text-badge-discount-text font-semibold shrink-0">
                    Status: Ready
                  </span>
                }
              />
              <div className="flex items-center justify-between bg-surface-subtle p-space-md rounded-lg gap-space-xs">
                <div className="flex items-center gap-space-xs min-w-0">
                  <Icon name="electric_bolt" className="text-primary text-[17px] shrink-0" />
                  <span className="font-caption text-caption text-text-primary font-medium truncate">
                    Standard 24V Solenoid Trigger
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => runTest('drawer', 'RJ12 pulse delivered. Cash drawer opened.')}
                  disabled={testing !== null}
                  className="px-3 py-1.5 bg-primary text-on-primary rounded-lg font-button-secondary text-button-secondary font-medium hover:bg-primary-container transition-colors shadow-sm shrink-0 disabled:opacity-75"
                >
                  {testing === 'drawer' ? 'Kicking…' : 'Test Drawer Kick'}
                </button>
              </div>
            </div>

            {/* Barcode scanner */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <CardHead
                icon="barcode_scanner"
                title="Barcode & Optical Scanners"
                meta="Honeywell Voyager 1400g"
                trailing={
                  <span className="font-caption text-caption text-badge-discount-text font-semibold shrink-0">
                    USB • Ready
                  </span>
                }
              />
              <div className="bg-surface-subtle rounded-lg p-space-md flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-sm min-w-0">
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
                <Toggle
                  checked={toggles.cameraScanner}
                  onChange={() => flip('cameraScanner')}
                  label="Phone Camera Scanner Fallback"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom status ribbon */}
        <div className="w-full bg-surface-container-lowest px-space-lg py-space-md rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
              <Icon name="memory" className="text-[20px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md text-text-primary font-semibold">
                Register 01 • Station Profile: Main Dining Hall
              </span>
              <span className="font-caption text-caption text-text-secondary">
                Payment &amp; Hardware • Tender Rails &amp; Counter Devices
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs shrink-0 px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
            <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
            <span>Terminal Ready</span>
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
