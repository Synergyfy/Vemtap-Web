import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { PosOwnerHeader } from '../components/PosControls';

interface BusinessPosSettingsScreenProps {
  onBack: () => void;
  onOpenReceipt: () => void;
  onOpenHardware: () => void;
  onOpenTaxes: () => void;
  onOpenPermissions: () => void;
  onOpenKitchen: () => void;
}

interface SettingRowProps {
  icon: string;
  iconClass?: string;
  iconWrapClass?: string;
  title: string;
  desc: string;
  chips: ReactNode;
  onClick: () => void;
}

function SettingRow({
  icon,
  iconClass = 'text-primary',
  iconWrapClass = 'bg-surface-tint-blue',
  title,
  desc,
  chips,
  onClick,
}: SettingRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-space-md flex items-center justify-between hover:bg-surface-container-low/40 active:bg-surface-container-high/60 transition-all gap-space-xs"
    >
      <div className="flex items-start gap-space-sm min-w-0 pr-2">
        <div className={`w-10 h-10 rounded-xl ${iconWrapClass} flex items-center justify-center shrink-0 ${iconClass} mt-0.5`}>
          <Icon name={icon} className="text-[19px]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-body-lg text-body-lg font-semibold text-on-surface truncate">{title}</span>
          <p className="font-caption text-caption text-text-secondary mt-0.5 line-clamp-2">{desc}</p>
          <div className="flex items-center gap-space-2xs mt-1.5 flex-wrap">{chips}</div>
        </div>
      </div>
      <Icon name="chevron_right" className="text-text-tertiary text-[19px] shrink-0" />
    </button>
  );
}

function Chip({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`font-caption text-caption px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
}

function GroupHeader({
  icon,
  iconWrap,
  iconClass,
  title,
  meta,
}: {
  icon: string;
  iconWrap: string;
  iconClass: string;
  title: string;
  meta: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-space-2xs gap-space-xs">
      <div className="flex items-center gap-space-xs min-w-0">
        <div className={`w-7 h-7 rounded-lg ${iconWrap} flex items-center justify-center shrink-0`}>
          <Icon name={icon} className={`${iconClass} text-[17px]`} />
        </div>
        <h3 className="font-heading-sm text-heading-sm text-on-surface font-semibold tracking-tight truncate">
          {title}
        </h3>
      </div>
      {meta}
    </div>
  );
}

function Divider() {
  return <div className="h-[1px] bg-surface-container-low mx-space-md" />;
}

function TelemetryNode({
  icon,
  iconClass,
  title,
  sub,
  subClass,
}: {
  icon: string;
  iconClass: string;
  title: string;
  sub: string;
  subClass: string;
}) {
  return (
    <div className="bg-surface-subtle p-space-xs rounded-lg flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <Icon name={icon} className={`${iconClass} text-[17px]`} />
        <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
      </div>
      <div className="mt-2">
        <p className="font-caption text-caption font-semibold text-on-surface truncate">{title}</p>
        <p className={`font-caption text-caption font-medium truncate ${subClass}`}>{sub}</p>
      </div>
    </div>
  );
}

export function BusinessPosSettingsScreen({
  onBack,
  onOpenReceipt,
  onOpenHardware,
  onOpenTaxes,
  onOpenPermissions,
  onOpenKitchen,
}: BusinessPosSettingsScreenProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [syncTag, setSyncTag] = useState('Synced 1 min ago');
  const [testing, setTesting] = useState<string | null>(null);
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

  const runTest = (key: string, busy: string, done: string) => {
    if (testing) return;
    setTesting(key);
    window.setTimeout(() => {
      setTesting(null);
      showToast(done);
    }, 850);
    void busy;
  };

  return (
    <AppScreen>
      <PosOwnerHeader title="POS General Settings" onBack={onBack} />

      <div className="flex flex-col pb-10">
        {/* Terminal profile & security context */}
        <section className="px-margin pt-space-xs pb-space-sm">
          <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
            <div className="absolute -right-10 -top-10 w-36 h-36 bg-gradient-to-br from-primary-fixed/40 via-surface-container-high/20 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between gap-space-xs relative">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-2xs text-primary font-label-sm text-label-sm">
                  <Icon name="storefront" className="text-[15px]" />
                  <span className="font-medium truncate">Urban Grill &amp; Bistro</span>
                </div>
                <h2 className="font-heading-md text-heading-md text-on-surface mt-0.5 tracking-tight truncate">
                  Till #01 • Wuse Flagship
                </h2>
                <p className="font-caption text-caption text-text-secondary">
                  Wuse Zone II, Abuja • Counter Terminal 01
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-1.5 px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                <span className="font-caption text-caption font-semibold">Live POS</span>
              </div>
            </div>
            {/* Manager security clearance banner */}
            <div className="mt-space-sm pt-space-xs flex items-center justify-between gap-space-xs bg-surface-container-low px-space-sm py-2 rounded-lg">
              <div className="flex items-center gap-space-2xs min-w-0">
                <div className="w-6 h-6 rounded-full bg-badge-discount-bg flex items-center justify-center shrink-0">
                  <Icon name="lock_open" className="text-badge-discount-text text-[14px]" />
                </div>
                <span className="font-label-sm text-label-sm text-text-primary font-medium truncate">
                  Owner / Manager Mode Active
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="font-caption text-caption text-text-secondary bg-surface-container-lowest px-2 py-0.5 rounded-full font-mono font-medium">
                  PIN #402
                </span>
                <button
                  type="button"
                  aria-label="Lock PIN"
                  title="Lock PIN"
                  onClick={() => showToast('Session locked to cashier mode')}
                  className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-primary transition-colors active:scale-95"
                >
                  <Icon name="lock" className="text-[13px]" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Fast health diagnostics strip */}
        <section className="px-margin mb-space-md">
          <div className="rounded-xl bg-surface-container-lowest p-space-sm shadow-sm flex flex-col gap-space-xs">
            <div className="flex items-center justify-between pb-space-2xs gap-space-xs">
              <span className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1 min-w-0">
                <Icon name="sensors" className="text-primary text-[13px] shrink-0" />
                <span className="truncate">System Telemetry &amp; Link</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setSyncTag('Synced just now');
                  showToast('POS Network & SQLite sync complete');
                }}
                className="flex items-center gap-1 font-caption text-caption text-primary font-medium active:scale-95 transition-transform shrink-0"
              >
                <Icon name="refresh" className="text-[13px]" />
                <span>Sync Now</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-space-xs">
              <TelemetryNode
                icon="print"
                iconClass="text-primary"
                title="Epson TM #2"
                sub="BT Ready • 80mm"
                subClass="text-badge-discount-text"
              />
              <TelemetryNode
                icon="storage"
                iconClass="text-secondary"
                title="Offline SQLite"
                sub="0 / 500 Buffer"
                subClass="text-text-secondary"
              />
              <TelemetryNode
                icon="wifi_tethering"
                iconClass="text-primary"
                title="Public POS"
                sub="Online (28ms)"
                subClass="text-badge-discount-text"
              />
            </div>
          </div>
        </section>

        {/* Settings categories */}
        <div className="px-margin flex flex-col gap-space-lg">
          {/* Group 1: Hardware */}
          <section className="flex flex-col gap-space-xs">
            <GroupHeader
              icon="devices_other"
              iconWrap="bg-surface-tint-blue"
              iconClass="text-primary"
              title="Hardware & Peripherals"
              meta={
                <Chip className="bg-badge-discount-bg text-badge-discount-text">3 Devices Paired</Chip>
              }
            />
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
              <SettingRow
                icon="receipt_long"
                title="Receipt & Order Customization"
                desc="Store logo, footer notes, auto-print triggers, kitchen chits, paper width (80mm vs 58mm)."
                chips={
                  <>
                    <Chip className="bg-surface-container text-on-secondary-container">80mm Wide</Chip>
                    <Chip className="bg-surface-tint-blue text-primary">Logo Enabled</Chip>
                  </>
                }
                onClick={onOpenReceipt}
              />
              <Divider />
              <SettingRow
                icon="print"
                iconClass="text-secondary"
                iconWrapClass="bg-surface-container"
                title="Printers & Kitchen Displays"
                desc="Epson TM-T88VI (ESC/POS), Sunmi V2 Pro mobile handheld, KDS IP display routing stream."
                chips={
                  <Chip className="bg-badge-discount-bg text-badge-discount-text">
                    KDS Online (192.168.1.140)
                  </Chip>
                }
                onClick={onOpenHardware}
              />
              <Divider />
              <SettingRow
                icon="qr_code_scanner"
                title="Barcode & QR Scanner"
                desc="Rear camera auto-focus, continuous sound chimes, Honeywell Voyager 1200g USB tether."
                chips={
                  <>
                    <Chip className="bg-surface-container text-on-secondary-container">Beep on scan</Chip>
                    <Chip className="text-text-secondary">Honeywell Active</Chip>
                  </>
                }
                onClick={onOpenHardware}
              />
            </div>
          </section>

          {/* Group 2: Payments */}
          <section className="flex flex-col gap-space-xs">
            <GroupHeader
              icon="payments"
              iconWrap="bg-badge-discount-bg"
              iconClass="text-badge-discount-text"
              title="Payments & Financials"
              meta={
                <div className="flex items-center gap-1 font-caption text-caption text-text-secondary bg-surface-container-low px-2 py-0.5 rounded-full">
                  <Icon name="security" className="text-primary text-[12px]" />
                  <span>PIN Protected</span>
                </div>
              }
            />
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
              <SettingRow
                icon="account_balance_wallet"
                iconWrapClass="bg-badge-discount-bg"
                iconClass="text-badge-discount-text"
                title="Payment Methods & Tender Rails"
                desc="Cash drawer auto-kick, Moniepoint & OPay card sync, dynamic bank transfer webhooks, split bills."
                chips={
                  <>
                    <Chip className="bg-surface-subtle text-text-primary">Moniepoint POS</Chip>
                    <Chip className="bg-surface-subtle text-text-primary">Instant Transfer</Chip>
                  </>
                }
                onClick={onOpenHardware}
              />
              <Divider />
              <SettingRow
                icon="percent"
                title="Taxes & Surcharges"
                desc="Statutory VAT (7.5%), Table Service Charge (5.0%), Dine-in vs Takeaway exemption overrides."
                chips={
                  <>
                    <Chip className="bg-surface-container text-on-secondary-container">VAT 7.5%</Chip>
                    <Chip className="bg-surface-container text-on-secondary-container">Service 5%</Chip>
                  </>
                }
                onClick={onOpenTaxes}
              />
            </div>
          </section>

          {/* Group 3: Operations */}
          <section className="flex flex-col gap-space-xs">
            <GroupHeader
              icon="table_restaurant"
              iconWrap="bg-surface-container-high"
              iconClass="text-on-surface-variant"
              title="Operations & Storefront"
              meta={<span className="font-caption text-caption text-text-secondary font-medium">Realtime</span>}
            />
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
              <SettingRow
                icon="touch_app"
                title="Public POS & Self-Ordering"
                desc="Table QR auto-assignment, instant kitchen chit alert, guest dine-in order restrictions."
                chips={<Chip className="bg-badge-discount-bg text-badge-discount-text">24 Tables Live</Chip>}
                onClick={() => showToast('Public self-ordering matrix opened')}
              />
              <Divider />
              <SettingRow
                icon="sync"
                iconClass="text-secondary"
                iconWrapClass="bg-surface-container"
                title="Offline Storage & Cloud Sync"
                desc="Local SQLite 500-order capacity buffer, sync interval (30s), collision auto-resolution."
                chips={
                  <>
                    <Chip className="bg-surface-subtle text-text-primary">30s Auto-Sync</Chip>
                    <span className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                      Up to date
                    </span>
                  </>
                }
                onClick={() => showToast('Local SQLite & cloud sync settings opened')}
              />
              <Divider />
              <SettingRow
                icon="soup_kitchen"
                title="Order Workflow & Kitchen Stream"
                desc="Auto-accept orders toggle, prep time defaults (15-20 min), kitchen bell sound chimes."
                chips={
                  <>
                    <Chip className="bg-surface-container text-on-secondary-container">Default: 18 min</Chip>
                    <Chip className="bg-badge-discount-bg text-badge-discount-text">Auto-Accept On</Chip>
                  </>
                }
                onClick={onOpenKitchen}
              />
            </div>
          </section>

          {/* Group 4: Security */}
          <section className="flex flex-col gap-space-xs">
            <GroupHeader
              icon="verified_user"
              iconWrap="bg-surface-tint-blue"
              iconClass="text-primary"
              title="Security & Permissions"
              meta={<Chip className="bg-surface-tint-blue text-primary font-semibold">Owner Restricted</Chip>}
            />
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
              <SettingRow
                icon="badge"
                title="Staff POS Permissions & Supervisor PINs"
                desc="Void/refund manager authorizations, open drawer without sale, discount caps (max 15%), till handoff sign-in."
                chips={
                  <>
                    <Chip className="bg-surface-container text-on-secondary-container">
                      Supervisor PIN Enforced
                    </Chip>
                    <Chip className="bg-surface-subtle text-text-secondary">4 Cashiers Active</Chip>
                  </>
                }
                onClick={onOpenPermissions}
              />
            </div>
          </section>

          {/* Immediate till controls */}
          <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between gap-space-xs">
              <h4 className="font-heading-sm text-heading-sm text-on-surface font-semibold">Immediate Till Controls</h4>
              <span className="font-caption text-caption text-text-secondary shrink-0">Direct Hardware Actions</span>
            </div>
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between p-space-xs bg-surface-subtle rounded-lg gap-space-xs">
                <div className="flex items-center gap-space-xs min-w-0">
                  <Icon name="receipt" className="text-primary text-[19px] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">
                      Thermal Receipt Feed Test
                    </span>
                    <span className="font-caption text-caption text-text-secondary truncate">
                      Prints a diagnostic slip to Epson TM-T88VI
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => runTest('feed', 'Printing…', 'Test chit printed to Epson TM #2')}
                  className="px-space-sm py-2 rounded-lg bg-surface-tint-blue text-primary font-button-secondary text-button-secondary font-medium hover:bg-secondary-container transition-all active:scale-95 shrink-0"
                >
                  {testing === 'feed' ? 'Printing…' : 'Feed Test'}
                </button>
              </div>
              <div className="flex items-center justify-between p-space-xs bg-surface-subtle rounded-lg gap-space-xs">
                <div className="flex items-center gap-space-xs min-w-0">
                  <Icon name="point_of_sale" className="text-secondary text-[19px] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">
                      Emergency Drawer Pop
                    </span>
                    <span className="font-caption text-caption text-text-secondary truncate">
                      Sends 24V pulse to RJ11 Cash Drawer
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => runTest('drawer', 'Triggered!', 'Cash drawer trigger pulse sent (PIN #402 logged)')}
                  className="px-space-sm py-2 rounded-lg bg-surface-container text-on-surface font-button-secondary text-button-secondary font-medium hover:bg-surface-container-high transition-all active:scale-95 shrink-0"
                >
                  {testing === 'drawer' ? 'Triggered!' : 'Open Till'}
                </button>
              </div>
            </div>
          </section>

          {/* Device diagnostic footer */}
          <footer className="pt-space-xs flex flex-col items-center justify-center text-center gap-space-2xs pb-space-sm">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
              <span className="font-caption text-caption font-semibold tracking-wider text-text-primary">
                VEMTAP POS Engine v2.4.0
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-text-secondary font-caption text-caption">
              <span className="font-mono">Node ID: POS-NG-ABJ-001</span>
              <span>•</span>
              <span>Hardware Build: REV-3</span>
              <span>•</span>
              <span>{syncTag}</span>
            </div>
            <div className="font-caption text-text-tertiary mt-0.5">
              Urban Grill &amp; Bistro (RC-149204) • Licensed to VEMTAP Cloud Retail Mesh
            </div>
          </footer>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-[124px] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="mx-auto w-fit max-w-full bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full shadow-xl flex items-center gap-space-xs">
            <Icon name="check_circle" className="text-badge-discount-text text-[17px] shrink-0" />
            <span className="font-label-sm text-label-sm font-medium truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
