import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';

interface DesktopPosGeneralSettingsScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
  onOpenHardware?: () => void;
  onOpenReceipt?: () => void;
  onOpenTaxes?: () => void;
}

interface DeepConfigLink {
  label: string;
  desc: string;
  icon: string;
}

const DEEP_CONFIG_LINKS: DeepConfigLink[] = [
  {
    label: 'Hardware & Payment Peripherals',
    desc: 'Tenders, thermal printers, cash drawer and scanner pairing',
    icon: 'point_of_sale',
  },
  {
    label: 'Receipt Template & Branding',
    desc: '80/58mm paper, slip header, FIRS TIN and footer greetings',
    icon: 'receipt_long',
  },
  {
    label: 'Taxes & Fiscal Levies',
    desc: 'FIRS VAT band, service charge, packaging levy and QR caps',
    icon: 'gavel',
  },
];

interface ToastData {
  title: string;
  body: string;
  icon: string;
}

const PRIMARY_PRINTER_OPTIONS = [
  'Epson TM-T88VI [USB/001:004 - Ready]',
  'Star Micronics TSP143III [Ethernet 192.168.1.130]',
  'Virtual Print Emulator (Debug Spooler)',
];

const SECONDARY_PRINTER_OPTIONS = [
  'Star TSP650 Kitchen Thermal [192.168.1.135]',
  'Bixolon SRP-350 Plus [192.168.1.138]',
  'Disabled / Kitchen Chit Off',
];

const ACCOUNT_EXPIRY_OPTIONS = [
  '10 Minutes (Fast Casual)',
  '15 Minutes (Dine-in Standard)',
  '30 Minutes (Lounge & Bar)',
];

const MESH_INTERVAL_OPTIONS = [
  '10 seconds (High-Speed Local LAN)',
  '30 seconds (Standard Bandwidth)',
  '60 seconds (Cellular Fallback Guard)',
];

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex items-center cursor-pointer w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-primary-container' : 'bg-surface-variant'
      }`}
    >
      <span
        className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function ToggleRow({
  title,
  subtitle,
  checked,
  onChange,
  className = '',
}: {
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex flex-col">
        <span className="font-label-md text-label-md text-text-primary">{title}</span>
        <span className="font-caption text-caption text-text-secondary">{subtitle}</span>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-space-2xs">
      <label className="font-label-sm text-label-sm text-text-secondary">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 px-space-sm rounded-lg bg-surface-container-lowest text-text-primary font-body-md text-body-md shadow-sm outline-none cursor-pointer"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export function DesktopPosGeneralSettingsScreen({
  onNav,
  onOpenHardware,
  onOpenReceipt,
  onOpenTaxes,
}: DesktopPosGeneralSettingsScreenProps) {
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [printLogo, setPrintLogo] = useState(true);
  const [receiptFooter, setReceiptFooter] = useState('Thank you for dining at Urban Grill!');
  const [primaryPrinter, setPrimaryPrinter] = useState(PRIMARY_PRINTER_OPTIONS[0]);
  const [secondaryPrinter, setSecondaryPrinter] = useState(SECONDARY_PRINTER_OPTIONS[0]);
  const [kdsIp, setKdsIp] = useState('192.168.1.140');
  const [kdsPort, setKdsPort] = useState('9100');
  const [autoScan, setAutoScan] = useState(true);
  const [buzzerRead, setBuzzerRead] = useState(true);
  const [autoKickDrawer, setAutoKickDrawer] = useState(true);
  const [drawerSensor, setDrawerSensor] = useState(true);
  const [terminalLink, setTerminalLink] = useState<'moniepoint' | 'sunmip2'>('moniepoint');
  const [nipPolling, setNipPolling] = useState(true);
  const [accountExpiry, setAccountExpiry] = useState(ACCOUNT_EXPIRY_OPTIONS[1]);
  const [vatRate, setVatRate] = useState(7.5);
  const [serviceSurcharge, setServiceSurcharge] = useState(5.0);
  const [consumptionTax, setConsumptionTax] = useState(true);
  const [tableQr, setTableQr] = useState(true);
  const [autoAccept, setAutoAccept] = useState(true);
  const [prepMinutes, setPrepMinutes] = useState(18);
  const [meshInterval, setMeshInterval] = useState(MESH_INTERVAL_OPTIONS[1]);
  const [testing, setTesting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedVisible, setSavedVisible] = useState(false);
  const [toast, setToast] = useState<ToastData>({
    title: 'Action Sent',
    body: 'Communicating with node bus...',
    icon: 'info',
  });
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (title: string, body: string, icon: string) => {
    setToast({ title, body, icon });
    setToastVisible(true);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastVisible(false), 3200);
  };

  const runTest = (key: string, title: string, body: string, icon: string) => {
    if (testing) return;
    setTesting(key);
    window.setTimeout(() => {
      setTesting(null);
      showToast(title, body, icon);
    }, 950);
  };

  const saveConfig = () => {
    if (saving) return;
    setSaving(true);
    setSavedVisible(true);
    showToast('Station Settings Persisted', 'Saved locally to Till #01 and replicated to Abuja mesh peers.', 'verified');
    window.setTimeout(() => {
      setSaving(false);
      window.setTimeout(() => setSavedVisible(false), 4000);
    }, 600);
  };

  return (
    <PosTerminalChrome activeNav="settings" onNav={onNav}>
      <div className="w-full py-space-lg flex flex-col gap-space-lg">
        {/* Top System Header & Node Meta */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <div className="flex flex-col gap-space-2xs min-w-0">
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-secondary-container font-caption text-caption uppercase tracking-wider font-semibold">
                Station Profile
              </span>
              <span className="text-text-tertiary">•</span>
              <span className="font-caption text-caption text-text-secondary font-medium">Till #01 • Wuse Flagship</span>
              <span className="text-text-tertiary">•</span>
              <span className="font-caption text-caption text-text-tertiary">Node ID: POS-NG-ABJ-001</span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight truncate">
              POS General & Peripheral Configuration
            </h1>
            <p className="font-body-md text-body-md text-text-secondary">
              Manage thermal cut thresholds, RJ11 24V solenoids, kitchen displays, and asynchronous SQLite buffers.
            </p>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            <button
              type="button"
              onClick={() => runTest('restart', 'Restarting VEMTAP Daemon', 'Reloading SQLite drivers and POS USB HAL in 1.4s...', 'sync')}
              disabled={testing !== null}
              className="px-space-md py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-button-secondary text-button-secondary transition-all flex items-center gap-space-xs disabled:opacity-75"
            >
              <Icon name={testing === 'restart' ? 'sync' : 'sync_saved_locally'} className="text-[18px] animate-none" />
              <span>{testing === 'restart' ? 'Restarting…' : 'Restart Local Daemon'}</span>
            </button>
            <div className="flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-surface-tint-blue text-primary font-label-md text-label-md">
              <Icon name="memory" className="text-[18px]" />
              <span>Core Engine v2.4.0</span>
            </div>
          </div>
        </div>

        {/* Quick Status Bar (Edge Hardware & Network Pulse) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                <Icon name="print" className="text-[20px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-text-secondary truncate">Thermal Receipt Feed</span>
                <span className="font-label-md text-label-md text-text-primary font-medium truncate">Epson TM-T88VI</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
              <span className="font-caption text-caption text-badge-discount-text font-semibold">BT/USB Ready</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center shrink-0">
                <Icon name="tablet_mac" className="text-[20px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-text-secondary truncate">Sunmi Kitchen KDS</span>
                <span className="font-label-md text-label-md text-text-primary font-medium truncate">192.168.1.140:9100</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
              <span className="font-caption text-caption text-badge-discount-text font-semibold">Active</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-lg bg-surface-container text-on-secondary-container flex items-center justify-center shrink-0">
                <Icon name="storage" className="text-[20px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-text-secondary truncate">SQLite Edge Journal</span>
                <span className="font-label-md text-label-md text-text-primary font-medium truncate">Buffer 0 / 500 orders</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
              <span className="font-caption text-caption text-badge-discount-text font-semibold">Flushed</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                <Icon name="cell_tower" className="text-[20px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-text-secondary truncate">Mesh Sync Protocol</span>
                <span className="font-label-md text-label-md text-text-primary font-medium truncate">Abuja Cloud Relay</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-caption text-caption text-badge-discount-text font-semibold">28ms Ping</span>
            </div>
          </div>
        </div>

        {/* 3-Column Configuration Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-lg items-start">
          {/* Column 1: Hardware & Peripherals */}
          <div className="flex flex-col gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <Icon name="developer_board" className="text-primary text-[22px]" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Hardware & Peripherals</h2>
              </div>
              <span className="font-caption text-caption text-text-tertiary">BUS / PORT MGMT</span>
            </div>

            {/* Receipt & Order Customization */}
            <div className="flex flex-col gap-space-sm bg-surface-subtle p-space-md rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-primary font-semibold">Thermal Paper Profile</span>
                <span className="inline-flex items-center px-space-xs py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-medium">
                  Auto-Cutter OK
                </span>
              </div>
              <div className="grid grid-cols-2 gap-space-xs">
                <label
                  className={`flex items-center gap-space-xs p-space-xs rounded-lg cursor-pointer ${
                    paperWidth === '80mm' ? 'bg-surface-container-lowest shadow-sm' : 'bg-surface-container'
                  }`}
                >
                  <input
                    type="radio"
                    name="paper_width"
                    value="80mm"
                    checked={paperWidth === '80mm'}
                    onChange={() => setPaperWidth('80mm')}
                    className="text-primary accent-primary w-4 h-4"
                  />
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-primary font-medium">80mm Paper</span>
                    <span className="font-caption text-caption text-text-tertiary">Standard Roll</span>
                  </div>
                </label>
                <label
                  className={`flex items-center gap-space-xs p-space-xs rounded-lg cursor-pointer ${
                    paperWidth === '58mm' ? 'bg-surface-container-lowest shadow-sm' : 'bg-surface-container'
                  }`}
                >
                  <input
                    type="radio"
                    name="paper_width"
                    value="58mm"
                    checked={paperWidth === '58mm'}
                    onChange={() => setPaperWidth('58mm')}
                    className="text-primary accent-primary w-4 h-4"
                  />
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-primary font-medium">58mm Paper</span>
                    <span className="font-caption text-caption text-text-tertiary">Compact Mobile</span>
                  </div>
                </label>
              </div>
              <ToggleRow
                title="Print Business Logo"
                subtitle="Monochrome 384x128px bitmap"
                checked={printLogo}
                onChange={() => setPrintLogo((value) => !value)}
                className="pt-1"
              />
              <div className="flex flex-col gap-space-2xs pt-1">
                <label className="font-label-sm text-label-sm text-text-secondary font-medium">Receipt Footer Note</label>
                <input
                  type="text"
                  value={receiptFooter}
                  onChange={(event) => setReceiptFooter(event.target.value)}
                  className="h-10 px-space-sm rounded-lg bg-surface-container-lowest text-text-primary font-body-md text-body-md shadow-sm outline-none focus:bg-surface-tint-blue focus:text-primary transition-all"
                />
              </div>
            </div>

            {/* Printers & Kitchen Displays */}
            <div className="flex flex-col gap-space-sm bg-surface-subtle p-space-md rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-primary font-semibold">Kitchen & Order Chit Routers</span>
                <Icon name="hub" className="text-text-tertiary text-[18px]" />
              </div>
              <SelectField
                label="Primary Counter Receipt Output"
                value={primaryPrinter}
                onChange={setPrimaryPrinter}
                options={PRIMARY_PRINTER_OPTIONS}
              />
              <SelectField
                label="Secondary Hot Line Chit Printer"
                value={secondaryPrinter}
                onChange={setSecondaryPrinter}
                options={SECONDARY_PRINTER_OPTIONS}
              />
              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-sm text-label-sm text-text-secondary">KDS Target IP & Port</label>
                <div className="flex items-center gap-space-xs">
                  <input
                    type="text"
                    value={kdsIp}
                    onChange={(event) => setKdsIp(event.target.value)}
                    className="h-10 flex-1 px-space-sm rounded-lg bg-surface-container-lowest text-text-primary font-body-md text-body-md shadow-sm outline-none"
                  />
                  <input
                    type="text"
                    value={kdsPort}
                    onChange={(event) => setKdsPort(event.target.value)}
                    className="h-10 w-20 px-space-sm rounded-lg bg-surface-container-lowest text-text-primary font-body-md text-body-md shadow-sm outline-none text-center"
                  />
                </div>
              </div>
            </div>

            {/* Barcode & QR Scanner Configuration */}
            <div className="flex flex-col gap-space-sm bg-surface-subtle p-space-md rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-primary font-semibold">Barcode & Optical Sensors</span>
                <span className="font-caption text-caption text-text-tertiary">HID POS MODE</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-text-primary">Honeywell Xenon 1900 2D Imager</span>
                  <span className="font-caption text-caption text-badge-discount-text">Connected on /dev/usb/hiddev0</span>
                </div>
                <Icon name="qr_code_scanner" className="text-primary text-[20px]" />
              </div>
              <ToggleRow
                title="Continuous Auto-Scan"
                subtitle="Keep illumination LED active"
                checked={autoScan}
                onChange={() => setAutoScan((value) => !value)}
                className="pt-1"
              />
              <ToggleRow
                title="Hardware Buzzer On Read"
                subtitle="Single 2.4kHz affirmative beep"
                checked={buzzerRead}
                onChange={() => setBuzzerRead((value) => !value)}
              />
            </div>
          </div>

          {/* Column 2: Payments & Financials */}
          <div className="flex flex-col gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <Icon name="account_balance_wallet" className="text-primary text-[22px]" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Payments & Financials</h2>
              </div>
              <span className="font-caption text-caption text-text-tertiary">SETTLEMENT ENGINE</span>
            </div>

            {/* Cash Drawer & RJ11 Pinout */}
            <div className="flex flex-col gap-space-sm bg-surface-subtle p-space-md rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-primary font-semibold">Tenders & Drawer Actuation</span>
                <Icon name="point_of_sale" className="text-text-tertiary text-[18px]" />
              </div>
              <ToggleRow
                title="Auto-Kick Drawer on Cash"
                subtitle="Fires 24V pulse to Epson DK port"
                checked={autoKickDrawer}
                onChange={() => setAutoKickDrawer((value) => !value)}
              />
              <ToggleRow
                title="Cash Drawer Sensor (Microswitch)"
                subtitle="Warn when open > 90 seconds"
                checked={drawerSensor}
                onChange={() => setDrawerSensor((value) => !value)}
              />
            </div>

            {/* Card Terminals & NIP Transfer Polling */}
            <div className="flex flex-col gap-space-sm bg-surface-subtle p-space-md rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-primary font-semibold">External Terminal Bridge</span>
                <span className="inline-flex items-center px-space-xs py-0.5 rounded bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                  Tethered Link
                </span>
              </div>
              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-sm text-label-sm text-text-secondary">Moniepoint / Sunmi Card POS Channel</label>
                <div className="grid grid-cols-2 gap-space-xs">
                  <label
                    className={`flex items-center gap-space-xs p-space-xs rounded-lg cursor-pointer ${
                      terminalLink === 'moniepoint' ? 'bg-surface-container-lowest shadow-sm' : 'bg-surface-container'
                    }`}
                  >
                    <input
                      type="radio"
                      name="terminal_link"
                      value="moniepoint"
                      checked={terminalLink === 'moniepoint'}
                      onChange={() => setTerminalLink('moniepoint')}
                      className="text-primary accent-primary w-4 h-4"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm text-text-primary font-medium truncate">Moniepoint POS</span>
                      <span className="font-caption text-caption text-text-tertiary">Cloud Webhook</span>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-space-xs p-space-xs rounded-lg cursor-pointer ${
                      terminalLink === 'sunmip2' ? 'bg-surface-container-lowest shadow-sm' : 'bg-surface-container'
                    }`}
                  >
                    <input
                      type="radio"
                      name="terminal_link"
                      value="sunmip2"
                      checked={terminalLink === 'sunmip2'}
                      onChange={() => setTerminalLink('sunmip2')}
                      className="text-primary accent-primary w-4 h-4"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm text-text-primary font-medium truncate">Sunmi P2 Pro</span>
                      <span className="font-caption text-caption text-text-tertiary">Local Intent / BT</span>
                    </div>
                  </label>
                </div>
              </div>
              <ToggleRow
                title="Instant NIP Bank Transfer Polling"
                subtitle="Auto-reconciles virtual dynamic accounts"
                checked={nipPolling}
                onChange={() => setNipPolling((value) => !value)}
                className="pt-1"
              />
              <SelectField
                label="Dynamic Account Expiry Timeout"
                value={accountExpiry}
                onChange={setAccountExpiry}
                options={ACCOUNT_EXPIRY_OPTIONS}
              />
            </div>

            {/* Taxes & Surcharges */}
            <div className="flex flex-col gap-space-sm bg-surface-subtle p-space-md rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-primary font-semibold">Taxes & Fiscal Levies</span>
                <span className="font-caption text-caption text-badge-discount-text font-medium">FIRS Compliant</span>
              </div>
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="flex flex-col gap-space-2xs">
                  <label className="font-label-sm text-label-sm text-text-secondary">Statutory VAT</label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.1"
                      value={vatRate}
                      onChange={(event) => setVatRate(event.target.value === '' ? 0 : parseFloat(event.target.value))}
                      className="h-10 w-full pl-space-sm pr-7 rounded-lg bg-surface-container-lowest text-text-primary font-body-md text-body-md shadow-sm outline-none font-semibold"
                    />
                    <span className="absolute right-2.5 text-text-tertiary font-label-sm text-label-sm">%</span>
                  </div>
                </div>
                <div className="flex flex-col gap-space-2xs">
                  <label className="font-label-sm text-label-sm text-text-secondary">Table Service Surcharge</label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.5"
                      value={serviceSurcharge}
                      onChange={(event) => setServiceSurcharge(event.target.value === '' ? 0 : parseFloat(event.target.value))}
                      className="h-10 w-full pl-space-sm pr-7 rounded-lg bg-surface-container-lowest text-text-primary font-body-md text-body-md shadow-sm outline-none font-semibold"
                    />
                    <span className="absolute right-2.5 text-text-tertiary font-label-sm text-label-sm">%</span>
                  </div>
                </div>
              </div>
              <ToggleRow
                title="Consumption Tax (Hospitality)"
                subtitle="Apply 5.0% FCT statutory levy"
                checked={consumptionTax}
                onChange={() => setConsumptionTax((value) => !value)}
                className="pt-1"
              />
            </div>

            {/* Advanced Configuration Deep Links */}
            <div className="flex flex-col gap-space-sm bg-surface-subtle p-space-md rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-primary font-semibold">
                  Advanced Terminal Configuration
                </span>
                <span className="font-caption text-caption text-text-tertiary">3 Modules</span>
              </div>
              <div className="flex flex-col gap-space-xs">
                <button
                  type="button"
                  onClick={onOpenHardware}
                  className="flex items-center justify-between gap-space-sm p-space-sm rounded-lg bg-surface-container-lowest hover:bg-surface-tint-blue text-left shadow-sm transition-colors group"
                >
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                      <Icon name={DEEP_CONFIG_LINKS[0].icon} className="text-[18px]" />
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate">
                        {DEEP_CONFIG_LINKS[0].label}
                      </span>
                      <span className="font-caption text-caption text-text-tertiary truncate">
                        {DEEP_CONFIG_LINKS[0].desc}
                      </span>
                    </div>
                  </div>
                  <Icon name="chevron_right" className="text-[18px] text-text-tertiary group-hover:text-primary" />
                </button>
                <button
                  type="button"
                  onClick={onOpenReceipt}
                  className="flex items-center justify-between gap-space-sm p-space-sm rounded-lg bg-surface-container-lowest hover:bg-surface-tint-blue text-left shadow-sm transition-colors group"
                >
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                      <Icon name={DEEP_CONFIG_LINKS[1].icon} className="text-[18px]" />
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate">
                        {DEEP_CONFIG_LINKS[1].label}
                      </span>
                      <span className="font-caption text-caption text-text-tertiary truncate">
                        {DEEP_CONFIG_LINKS[1].desc}
                      </span>
                    </div>
                  </div>
                  <Icon name="chevron_right" className="text-[18px] text-text-tertiary group-hover:text-primary" />
                </button>
                <button
                  type="button"
                  onClick={onOpenTaxes}
                  className="flex items-center justify-between gap-space-sm p-space-sm rounded-lg bg-surface-container-lowest hover:bg-surface-tint-blue text-left shadow-sm transition-colors group"
                >
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                      <Icon name={DEEP_CONFIG_LINKS[2].icon} className="text-[18px]" />
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate">
                        {DEEP_CONFIG_LINKS[2].label}
                      </span>
                      <span className="font-caption text-caption text-text-tertiary truncate">
                        {DEEP_CONFIG_LINKS[2].desc}
                      </span>
                    </div>
                  </div>
                  <Icon name="chevron_right" className="text-[18px] text-text-tertiary group-hover:text-primary" />
                </button>
              </div>
            </div>
          </div>

          {/* Column 3: Operations & Kitchen Workflow */}
          <div className="flex flex-col gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <Icon name="skillet" className="text-primary text-[22px]" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Operations & Kitchen Workflow</h2>
              </div>
              <span className="font-caption text-caption text-text-tertiary">TABLE ORCHESTRATION</span>
            </div>

            {/* Public POS & Self-Ordering */}
            <div className="flex flex-col gap-space-sm bg-surface-subtle p-space-md rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-primary font-semibold">Guest Self-Ordering & QR</span>
                <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                  24 Tables Live
                </span>
              </div>
              <ToggleRow
                title="Table QR Auto-Assignment"
                subtitle="Binds sessions to physical table beacon"
                checked={tableQr}
                onChange={() => setTableQr((value) => !value)}
              />
              <ToggleRow
                title="Auto-Accept Self-Orders"
                subtitle="Direct fire to kitchen chits & KDS"
                checked={autoAccept}
                onChange={() => setAutoAccept((value) => !value)}
              />
              <div className="flex flex-col gap-space-2xs pt-1">
                <div className="flex items-center justify-between">
                  <label className="font-label-sm text-label-sm text-text-secondary">Default Prep Estimate</label>
                  <span className="font-label-sm text-label-sm text-primary font-semibold">{prepMinutes} minutes</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={prepMinutes}
                  onChange={(event) => setPrepMinutes(parseInt(event.target.value, 10))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-text-tertiary font-caption text-caption">
                  <span>5 min (Express)</span>
                  <span>30 min</span>
                  <span>60 min (Full Course)</span>
                </div>
              </div>
            </div>

            {/* Offline Storage & Sync Frequency */}
            <div className="flex flex-col gap-space-sm bg-surface-subtle p-space-md rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-primary font-semibold">Offline Buffer & Resiliency</span>
                <Icon name="cloud_sync" className="text-text-tertiary text-[18px]" />
              </div>
              <div className="flex flex-col gap-space-2xs">
                <div className="flex justify-between items-center">
                  <span className="font-label-sm text-label-sm text-text-secondary">SQLite Capacity Limit</span>
                  <span className="font-caption text-caption text-badge-discount-text font-medium">Zero Queued Transactions</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '2%' }} />
                </div>
                <span className="font-caption text-caption text-text-tertiary">
                  Max buffer cap: 500 orders before mandatory sync halt
                </span>
              </div>
              <SelectField
                label="Mesh Sync Cycle Interval"
                value={meshInterval}
                onChange={setMeshInterval}
                options={MESH_INTERVAL_OPTIONS}
              />
              <div className="p-space-xs rounded-lg bg-surface-container-low flex items-start gap-space-xs mt-1">
                <Icon name="info" className="text-secondary text-[18px] shrink-0" />
                <p className="font-caption text-caption text-text-secondary leading-snug">
                  When WAN connectivity drops, transactions are cryptographically signed on-chip and stored in unalterable
                  SQLite journal partitions.
                </p>
              </div>
            </div>

            {/* Hardware Peripheral Health Check SVG */}
            <div className="bg-surface-subtle p-space-md rounded-xl flex flex-col gap-space-xs">
              <div className="flex justify-between items-center">
                <span className="font-label-sm text-label-sm text-text-secondary font-medium">Voltage & Bus Stability</span>
                <span className="font-caption text-caption text-badge-discount-text font-bold">100% NOMINAL</span>
              </div>
              <div className="w-full h-12 flex items-center justify-center">
                <svg
                  className="w-full h-10 text-primary"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 320 40"
                  aria-hidden="true"
                >
                  <path
                    d="M0,20 L40,20 L50,10 L60,30 L70,20 L130,20 L140,8 L150,32 L160,20 L220,20 L230,12 L240,28 L250,20 L320,20"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="flex justify-between items-center font-caption text-caption text-text-tertiary">
                <span>24V Solenoid: 24.1V</span>
                <span>USB Bus: 5.02V</span>
                <span>Thermal Head: 31°C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Diagnostics & Action Deck */}
        <div className="w-full bg-surface-container-lowest p-space-lg rounded-xl shadow-md flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex flex-wrap items-center gap-space-sm w-full md:w-auto">
            <button
              type="button"
              onClick={() =>
                runTest('feed', 'Thermal Test Feed Dispatched', 'ESC/POS alignment slip transmitted to Epson TM-T88VI on /dev/usb/001.', 'receipt_long')
              }
              disabled={testing !== null}
              className="px-space-md py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-button-secondary text-button-secondary transition-all flex items-center gap-space-xs shadow-sm disabled:opacity-75"
            >
              <Icon name="receipt_long" className="text-[20px] text-primary" />
              <span>{testing === 'feed' ? 'Testing Feed…' : 'Test Thermal Receipt Feed'}</span>
            </button>
            <button
              type="button"
              onClick={() =>
                runTest('drawer', '24V Pulse Sent', 'RJ11 pin 2/5 solenoid triggered. Drawer microswitch reported open.', 'lock_open')
              }
              disabled={testing !== null}
              className="px-space-md py-3 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-button-secondary text-button-secondary transition-all flex items-center gap-space-xs shadow-sm disabled:opacity-75"
            >
              <Icon name="lock_open" className="text-[20px] text-tertiary" />
              <span>{testing === 'drawer' ? 'Popping…' : 'Emergency Cash Drawer Pop'}</span>
            </button>
          </div>
          <div className="flex items-center gap-space-md w-full md:w-auto justify-end">
            <span
              className={`font-caption text-caption text-badge-discount-text font-semibold flex items-center gap-1 ${
                savedVisible ? '' : 'hidden'
              }`}
            >
              <Icon name="check_circle" className="text-[16px]" />
              Configuration Synced to Node
            </span>
            <button
              type="button"
              onClick={saveConfig}
              disabled={saving}
              className={`w-full md:w-auto px-space-xl py-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary transition-all flex items-center justify-center gap-space-xs shadow-md ${
                saving ? 'opacity-75' : ''
              }`}
            >
              <Icon name="save" className="text-[20px]" />
              <span>Save Configuration Changes</span>
            </button>
          </div>
        </div>

        {/* Notification Toast / Dialog for Direct Actions */}
        <div
          className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 pointer-events-none flex items-center gap-space-sm p-space-md rounded-xl bg-inverse-surface text-inverse-on-surface shadow-xl ${
            toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
          }`}
        >
          <Icon name={toast.icon} className="text-primary-fixed text-[24px]" />
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-semibold">{toast.title}</span>
            <span className="font-caption text-caption text-text-tertiary">{toast.body}</span>
          </div>
        </div>
      </div>
    </PosTerminalChrome>
  );
}