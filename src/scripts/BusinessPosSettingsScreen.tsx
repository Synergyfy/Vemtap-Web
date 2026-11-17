import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { PosOwnerHeader, PosToggle } from '../components/PosControls';
import { usePosSettings } from '../context/PosSettingsContext';
import { hasApiConfig } from '../services/api/client';
import { useLivePos } from './posLive';
import { useBusinessBranch } from '../context/BusinessBranchContext';
import { apiErrorMessage } from '../services/errorMessages';
import { usePosSettingsQuery, useUpdatePosSettings } from '../hooks/business/usePosSettingsApi';

interface BusinessPosSettingsScreenProps {
  onBack: () => void;
}

const SETTINGS_TABS = [
  { key: 'business', label: 'Business', icon: 'storefront' },
  { key: 'tills', label: 'Registers & Tills', icon: 'point_of_sale' },
  { key: 'receipt', label: 'Receipt', icon: 'receipt_long' },
  { key: 'tax', label: 'Tax & Pricing', icon: 'percent' },
  { key: 'alerts', label: 'Alerts', icon: 'notifications' },
  { key: 'loyalty', label: 'Loyalty', icon: 'stars' },
] as const;

type SettingsTabKey = (typeof SETTINGS_TABS)[number]['key'];

/** Everything the settings page can edit — staged until Save Changes is pressed. */
interface SettingsDraft {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  receiptHeader: string;
  receiptFooter: string;
  autoPrintReceipt: boolean;
  showBusinessLogo: boolean;
  taxEnabled: boolean;
  taxRate: number;
  taxLabel: string;
  pricesIncludeTax: boolean;
  lowStockAlerts: boolean;
  dailySalesSummary: boolean;
  newOrderAlert: boolean;
  staffActivityAlerts: boolean;
  loyaltyEnabled: boolean;
  redemptionThreshold: number;
}

/** One line with a short description and an on/off switch. */
function SettingToggleRow({
  icon,
  title,
  desc,
  checked,
  onChange,
  disabled,
}: {
  icon: string;
  title: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-space-md p-space-md transition-opacity ${
        disabled ? 'opacity-45 pointer-events-none' : ''
      }`}
      aria-disabled={disabled}
    >
      <div className="flex items-start gap-space-sm min-w-0">
        <span
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            checked ? 'bg-surface-tint-blue text-primary' : 'bg-surface-container-high text-text-secondary'
          }`}
        >
          <Icon name={icon} className="text-[19px]" />
        </span>
        <div className="flex flex-col min-w-0">
          <span className="font-label-md text-label-md text-on-surface font-semibold">{title}</span>
          <span className="font-caption text-caption text-text-secondary mt-0.5 leading-snug">{desc}</span>
        </div>
      </div>
      <PosToggle checked={checked} onChange={onChange} ariaLabel={title} />
    </div>
  );
}

/** One line with a short description and an editable text/number field. */
function SettingFieldRow({
  title,
  desc,
  value,
  onChange,
  placeholder,
  suffix,
  numeric,
  disabled,
}: {
  title: string;
  desc: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  numeric?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-space-2xs p-space-md transition-opacity ${
        disabled ? 'opacity-45 pointer-events-none' : ''
      }`}
      aria-disabled={disabled}
    >
      <span className="font-label-md text-label-md text-on-surface font-semibold">{title}</span>
      <span className="font-caption text-caption text-text-secondary leading-snug">{desc}</span>
      <div className="flex items-center bg-surface-container-low rounded-lg h-11 px-space-sm gap-space-xs mt-space-xs">
        <input
          type="text"
          value={value}
          disabled={disabled}
          inputMode={numeric ? 'decimal' : 'text'}
          placeholder={placeholder}
          onChange={(event) => onChange(numeric ? event.target.value.replace(/[^0-9.]/g, '') : event.target.value)}
          className="flex-1 min-w-0 bg-transparent font-label-md text-label-md text-on-surface placeholder:text-text-tertiary focus:outline-none disabled:cursor-not-allowed"
        />
        {suffix && <span className="font-label-sm text-label-sm text-text-secondary shrink-0">{suffix}</span>}
      </div>
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-surface-canvas shadow-sm divide-y divide-border-subtle overflow-hidden">
      {children}
    </section>
  );
}


/**
 * POS Settings — tabbed list of till controls. Edits are staged as a draft;
 * Save Changes applies them across the whole till.
 */
export function BusinessPosSettingsScreen({ onBack }: BusinessPosSettingsScreenProps) {
  const s = usePosSettings();
  const live = hasApiConfig();
  const settingsQuery = usePosSettingsQuery();
  const updateMutation = useUpdatePosSettings();
  const hydrated = useRef(false);
  const [tab, setTab] = useState<SettingsTabKey>('business');
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tillsList, setTillsList] = useState([
    { key: 'till-01', name: 'Till 01', station: 'Counter Front', float: '50,000', hardware: 'Thermal Printer #1 · POS Terminal #1', active: true },
    { key: 'till-02', name: 'Till 02', station: 'Counter Back / Takeaway', float: '20,000', hardware: 'Thermal Printer #2 · Card Reader #2', active: false },
    { key: 'till-03', name: 'Till 03', station: 'Terrace Bar', float: '25,000', hardware: 'Mobile Reader (Bluetooth)', active: false },
  ]);
  const pos = useLivePos();
  const { activeBranchId } = useBusinessBranch();
  const [tillError, setTillError] = useState<string | null>(null);
  // Live: this branch's real tills; the station and float samples are demo-only.
  const shownTills = live
    ? pos.tills.map((till) => ({
        key: till.id,
        name: till.name,
        station: till.code,
        float: '',
        hardware: till.deviceLabel || 'No device linked',
        active: Boolean(till.occupant),
      }))
    : tillsList;
  const addLiveTill = async () => {
    if (!activeBranchId || !newTillName.trim()) return;
    setTillError(null);
    try {
      await pos.mutations.createTill.mutateAsync({ branchId: activeBranchId, name: newTillName.trim() });
      setNewTillName('');
      setShowAddTill(false);
    } catch (error) {
      setTillError(apiErrorMessage(error, 'Could not add the till.'));
    }
  };
  const [showAddTill, setShowAddTill] = useState(false);
  const [newTillName, setNewTillName] = useState('');
  const [newTillStation, setNewTillStation] = useState('');
  const [newTillFloat, setNewTillFloat] = useState('30,000');
  const [draft, setDraft] = useState<SettingsDraft>({
    businessName: s.businessName,
    businessAddress: s.businessAddress,
    businessPhone: s.businessPhone,
    receiptHeader: s.receiptHeader,
    receiptFooter: s.receiptFooter,
    autoPrintReceipt: s.autoPrintReceipt,
    showBusinessLogo: s.showBusinessLogo,
    taxEnabled: s.taxEnabled,
    taxRate: s.taxRate,
    taxLabel: s.taxLabel,
    pricesIncludeTax: s.pricesIncludeTax,
    lowStockAlerts: s.lowStockAlerts,
    dailySalesSummary: s.dailySalesSummary,
    newOrderAlert: s.newOrderAlert,
    staffActivityAlerts: s.staffActivityAlerts,
    loyaltyEnabled: s.loyaltyEnabled,
    redemptionThreshold: s.redemptionThreshold,
  });
  const [rateText, setRateText] = useState(String(s.taxRate));
  const [thresholdText, setThresholdText] = useState(String(s.redemptionThreshold));

  useEffect(() => {
    if (!saved) return;
    const id = window.setTimeout(() => setSaved(false), 2400);
    return () => window.clearTimeout(id);
  }, [saved]);

  // Live: seed the draft — and the till context — from GET /pos/settings once,
  // so register, cart and receipts read the saved values immediately.
  useEffect(() => {
    const data = settingsQuery.data;
    if (!live || !data || hydrated.current) return;
    hydrated.current = true;
    setDraft((prev) => ({
      ...prev,
      businessAddress: data.receiptAddress ?? prev.businessAddress,
      businessPhone: data.receiptPhone ?? prev.businessPhone,
      receiptHeader: data.receiptHeader ?? prev.receiptHeader,
      receiptFooter: data.receiptFooter ?? prev.receiptFooter,
      autoPrintReceipt: data.autoPrintReceipt ?? prev.autoPrintReceipt,
      showBusinessLogo: data.showLogo ?? prev.showBusinessLogo,
      taxEnabled: data.taxEnabled ?? prev.taxEnabled,
      taxRate: data.taxRate ?? prev.taxRate,
      taxLabel: data.taxLabel ?? prev.taxLabel,
      pricesIncludeTax: data.pricesIncludeTax ?? prev.pricesIncludeTax,
    }));
    if (typeof data.taxRate === 'number') setRateText(String(data.taxRate));
    if (data.receiptAddress) s.setBusinessAddress(data.receiptAddress);
    if (data.receiptPhone) s.setBusinessPhone(data.receiptPhone);
    if (data.receiptHeader) s.setReceiptHeader(data.receiptHeader);
    if (data.receiptFooter) s.setReceiptFooter(data.receiptFooter);
    if (typeof data.autoPrintReceipt === 'boolean') s.setAutoPrintReceipt(data.autoPrintReceipt);
    if (typeof data.showLogo === 'boolean') s.setShowBusinessLogo(data.showLogo);
    if (typeof data.taxRate === 'number') s.setTaxRate(data.taxRate);
    if (data.taxLabel) s.setTaxLabel(data.taxLabel);
    // Tax flags go through the context's exclusive setters — enable-tax first,
    // then prices-include-tax, so the last writer wins as designed.
    if (typeof data.taxEnabled === 'boolean') s.setTaxEnabled(data.taxEnabled);
    if (typeof data.pricesIncludeTax === 'boolean') s.setPricesIncludeTax(data.pricesIncludeTax);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, settingsQuery.data]);

  const update = <K extends keyof SettingsDraft>(key: K, value: SettingsDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleRate = (text: string) => {
    const clean = text.replace(/[^0-9.]/g, '');
    setRateText(clean);
    const parsed = parseFloat(clean);
    if (!isNaN(parsed)) update('taxRate', parsed);
  };

  const handleThreshold = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    setThresholdText(clean);
    const parsed = parseInt(clean, 10);
    if (!isNaN(parsed)) update('redemptionThreshold', parsed);
  };

  // Enable Tax ↔ Prices Include Tax mutually exclusive toggle
  const toggleTaxEnabled = () => {
    const next = !draft.taxEnabled;
    setDraft((prev) => ({
      ...prev,
      taxEnabled: next,
      pricesIncludeTax: next ? false : prev.pricesIncludeTax,
    }));
    setDirty(true);
  };

  const togglePricesIncludeTax = () => {
    const next = !draft.pricesIncludeTax;
    setDraft((prev) => ({
      ...prev,
      pricesIncludeTax: next,
      taxEnabled: next ? false : prev.taxEnabled,
    }));
    setDirty(true);
  };

  const save = () => {
    if (live) {
      // Only the receipt/tax fields live on the API — PATCH those, and keep
      // business identity, alerts and loyalty in the local till context.
      updateMutation.mutate(
        {
          receiptHeader: draft.receiptHeader,
          receiptFooter: draft.receiptFooter,
          receiptAddress: draft.businessAddress,
          receiptPhone: draft.businessPhone,
          autoPrintReceipt: draft.autoPrintReceipt,
          showLogo: draft.showBusinessLogo,
          taxEnabled: draft.taxEnabled,
          taxRate: draft.taxRate,
          taxLabel: draft.taxLabel,
          pricesIncludeTax: draft.pricesIncludeTax,
        },
        {
          onSuccess: () => {
            s.setBusinessName(draft.businessName);
            s.setBusinessAddress(draft.businessAddress);
            s.setBusinessPhone(draft.businessPhone);
            s.setLowStockAlerts(draft.lowStockAlerts);
            s.setDailySalesSummary(draft.dailySalesSummary);
            s.setNewOrderAlert(draft.newOrderAlert);
            s.setStaffActivityAlerts(draft.staffActivityAlerts);
            s.setLoyaltyEnabled(draft.loyaltyEnabled);
            s.setRedemptionThreshold(draft.redemptionThreshold);
            setDirty(false);
            setSaved(true);
          },
        },
      );
      return;
    }
    s.setBusinessName(draft.businessName);
    s.setBusinessAddress(draft.businessAddress);
    s.setBusinessPhone(draft.businessPhone);
    s.setReceiptHeader(draft.receiptHeader);
    s.setReceiptFooter(draft.receiptFooter);
    s.setAutoPrintReceipt(draft.autoPrintReceipt);
    s.setShowBusinessLogo(draft.showBusinessLogo);
    s.setTaxEnabled(draft.taxEnabled);
    s.setTaxRate(draft.taxRate);
    s.setTaxLabel(draft.taxLabel);
    s.setPricesIncludeTax(draft.pricesIncludeTax);
    s.setLowStockAlerts(draft.lowStockAlerts);
    s.setDailySalesSummary(draft.dailySalesSummary);
    s.setNewOrderAlert(draft.newOrderAlert);
    s.setStaffActivityAlerts(draft.staffActivityAlerts);
    s.setLoyaltyEnabled(draft.loyaltyEnabled);
    s.setRedemptionThreshold(draft.redemptionThreshold);
    setDirty(false);
    setSaved(true);
  };

  return (
    <AppScreen>
      <PosOwnerHeader title="POS Settings" onBack={onBack} />

      {/* Tab bar */}
      <div className="sticky top-16 z-30 bg-surface/90 backdrop-blur-xl border-b border-border-subtle">
        <div className="flex gap-space-xs overflow-x-auto no-scrollbar px-margin py-space-xs">
          {SETTINGS_TABS.map((entry) => {
            const active = entry.key === tab;
            return (
              <button
                key={entry.key}
                type="button"
                onClick={() => setTab(entry.key)}
                className={`flex shrink-0 items-center gap-1.5 px-space-sm h-9 rounded-full font-label-sm text-label-sm font-semibold whitespace-nowrap transition-colors ${
                  active ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low text-text-secondary'
                }`}
              >
                <Icon name={entry.icon} className="text-[16px]" />
                <span>{entry.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-space-lg px-margin py-space-md pb-44">
        {tab === 'business' && (
          <Card>
            <SettingFieldRow
              title="Business Name"
              desc="Appears on receipts and reports"
              value={draft.businessName}
              onChange={(value) => update('businessName', value)}
              placeholder="Your business name"
            />
            <SettingFieldRow
              title="Business Address"
              desc="Shown on printed receipts"
              value={draft.businessAddress}
              onChange={(value) => update('businessAddress', value)}
              placeholder="Street, area, city"
            />
            <SettingFieldRow
              title="Phone Number"
              desc="Contact printed on receipts"
              value={draft.businessPhone}
              onChange={(value) => update('businessPhone', value)}
              placeholder="+234 …"
            />
          </Card>
        )}

        {tab === 'tills' && (
          <div className="flex flex-col gap-3">
            <div className="bg-surface-tint-blue/70 rounded-2xl p-3 border border-primary/20 flex flex-col gap-1 shadow-xs">
              <div className="flex items-center gap-1.5 text-primary text-[13px] font-bold">
                <Icon name="point_of_sale" className="text-[17px]" />
                <span>Branch Registers &amp; Tills</span>
              </div>
              <p className="font-caption text-[11px] text-text-primary leading-relaxed">
                Configure your checkout counters and cash drawer stations for this branch. Each till manages its own starting cash float, receipt printers, and shift audit.
              </p>
            </div>

            <Card>
              <div className="p-3 border-b border-border-subtle flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-sm text-[13px] font-bold text-text-primary">Configured Branch Tills</span>
                  <span className="font-caption text-[11px] text-text-secondary">Wuse II Branch • 3 Stations Setup</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddTill(!showAddTill)}
                  className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-caption text-[11px] font-semibold flex items-center gap-1 shadow-xs hover:bg-primary-container active:scale-95 transition-all"
                >
                  <Icon name={showAddTill ? 'close' : 'add'} className="text-[14px]" />
                  <span>{showAddTill ? 'Cancel' : 'Add Till'}</span>
                </button>
              </div>

              {showAddTill && (
                <div className="p-3 bg-surface-container-low flex flex-col gap-2.5 border-b border-border-subtle">
                  <span className="font-label-sm text-[12px] font-bold text-text-primary">New Register / Till Setup</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="font-caption text-[10px] text-text-secondary block mb-0.5">Till Identifier</label>
                      <input
                        type="text"
                        placeholder="e.g. Till 04, VIP Bar Till"
                        value={newTillName}
                        onChange={(e) => setNewTillName(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-border-subtle text-[12px] bg-surface-canvas text-text-primary focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className={live ? 'hidden' : undefined}>
                      <label className="font-caption text-[10px] text-text-secondary block mb-0.5">Counter / Station Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Garden Patio, Drive-thru"
                        value={newTillStation}
                        onChange={(e) => setNewTillStation(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-border-subtle text-[12px] bg-surface-canvas text-text-primary focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className={live ? 'hidden' : undefined}>
                    <label className="font-caption text-[10px] text-text-secondary block mb-0.5">Default Starting Float (₦)</label>
                    <input
                      type="text"
                      placeholder="e.g. 50,000"
                      value={newTillFloat}
                      onChange={(e) => setNewTillFloat(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-border-subtle text-[12px] bg-surface-canvas text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (live) {
                        void addLiveTill();
                        return;
                      }
                      if (!newTillName.trim()) return;
                      setTillsList((prev) => [
                        ...prev,
                        {
                          key: `till-0${prev.length + 1}`,
                          name: newTillName.trim(),
                          station: newTillStation.trim() || 'Counter Station',
                          float: newTillFloat.trim() || '30,000',
                          hardware: 'Assigned on pairing',
                          active: false,
                        },
                      ]);
                      setNewTillName('');
                      setNewTillStation('');
                      setShowAddTill(false);
                      setDirty(true);
                    }}
                    className="self-end px-3 py-1.5 rounded-lg bg-primary text-on-primary text-[11px] font-semibold"
                  >
                    Save New Till
                  </button>
                </div>
              )}

              {tillError && <p className="font-caption text-caption text-error p-3" role="alert">{tillError}</p>}
              {shownTills.map((till) => (
                <div key={till.key} className="p-3 flex items-start justify-between gap-2 border-b border-border-subtle last:border-b-0">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Icon name="point_of_sale" className="text-[17px]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-label-sm text-[13px] font-bold text-text-primary">{till.name}</span>
                        {till.active ? (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-badge-discount-bg text-badge-discount-text">
                            Active Shift
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-surface-container text-text-secondary">
                            Idle / Ready
                          </span>
                        )}
                      </div>
                      <span className="font-caption text-[11px] text-text-secondary">{till.station}</span>
                      <span className="font-caption text-[10px] text-text-tertiary mt-0.5">{till.hardware}</span>
                    </div>
                  </div>
                  {!live && (
                  <div className="text-right shrink-0">
                    <span className="font-label-sm text-[12px] font-bold text-text-primary block">₦{till.float}</span>
                    <span className="font-caption text-[10px] text-text-secondary">Opening Float</span>
                  </div>
                  )}
                </div>
              ))}
            </Card>
          </div>
        )}


        {tab === 'receipt' && (
          <Card>
            <SettingFieldRow
              title="Receipt Header"
              desc="Custom text at the top of every receipt — use [business name] for the business name"
              value={draft.receiptHeader}
              onChange={(value) => update('receiptHeader', value)}
              placeholder="Thank you for shopping with [business name]"
            />
            <SettingFieldRow
              title="Receipt Footer"
              desc="Shown at the bottom of every receipt"
              value={draft.receiptFooter}
              onChange={(value) => update('receiptFooter', value)}
              placeholder="e.g. No returns after 7 days. Receipt required."
            />
            <SettingToggleRow
              icon="print"
              title="Auto-Print Receipt"
              desc="Automatically print after each sale"
              checked={draft.autoPrintReceipt}
              onChange={() => update('autoPrintReceipt', !draft.autoPrintReceipt)}
            />
            <SettingToggleRow
              icon="image"
              title="Show Business Logo"
              desc="Display your logo on digital receipts"
              checked={draft.showBusinessLogo}
              onChange={() => update('showBusinessLogo', !draft.showBusinessLogo)}
            />
          </Card>
        )}

        {tab === 'tax' && (
          <Card>
            <SettingToggleRow
              icon="percent"
              title="Enable Tax"
              desc="Apply tax to all transactions"
              checked={draft.taxEnabled}
              onChange={toggleTaxEnabled}
            />
            {draft.taxEnabled && (
              <>
                <SettingFieldRow
                  title="Tax Rate (%)"
                  desc="Default tax percentage applied to products"
                  value={rateText}
                  onChange={handleRate}
                  suffix="%"
                  numeric
                />
                <SettingFieldRow
                  title="Tax Label"
                  desc="How tax is labeled on receipts"
                  value={draft.taxLabel}
                  onChange={(value) => update('taxLabel', value)}
                  placeholder="VAT"
                />
              </>
            )}
            <SettingToggleRow
              icon="receipt_long"
              title="Prices Include Tax"
              desc="Whether listed prices already include tax"
              checked={draft.pricesIncludeTax}
              onChange={togglePricesIncludeTax}
            />
          </Card>
        )}


        {tab === 'alerts' && (
          <Card>
            <SettingToggleRow
              icon="inventory_2"
              title="Low Stock Alerts"
              desc="Get notified when products drop below minimum"
              checked={draft.lowStockAlerts}
              onChange={() => update('lowStockAlerts', !draft.lowStockAlerts)}
            />
            <SettingToggleRow
              icon="insights"
              title="Daily Sales Summary"
              desc="Receive end-of-day revenue report"
              checked={draft.dailySalesSummary}
              onChange={() => update('dailySalesSummary', !draft.dailySalesSummary)}
            />
            <SettingToggleRow
              icon="add_shopping_cart"
              title="New Order Alert"
              desc="Notify when a new order is placed"
              checked={draft.newOrderAlert}
              onChange={() => update('newOrderAlert', !draft.newOrderAlert)}
            />
            <SettingToggleRow
              icon="gpp_maybe"
              title="Staff Activity Alerts"
              desc="Notify on refunds, voids, and drawer openings"
              checked={draft.staffActivityAlerts}
              onChange={() => update('staffActivityAlerts', !draft.staffActivityAlerts)}
            />
          </Card>
        )}

        {tab === 'loyalty' && (
          <Card>
            <SettingToggleRow
              icon="stars"
              title="Enable Loyalty Program"
              desc="Allow cashiers to award points to customers at checkout"
              checked={draft.loyaltyEnabled}
              onChange={() => update('loyaltyEnabled', !draft.loyaltyEnabled)}
            />
            <SettingFieldRow
              title="Redemption Threshold"
              desc="Minimum points required before a customer can redeem rewards"
              value={thresholdText}
              onChange={handleThreshold}
              suffix="pts"
              numeric
            />
          </Card>
        )}
      </div>

      {/* Save bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/95 backdrop-blur-xl border-t border-border-subtle px-margin pt-space-xs pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || updateMutation.isPending}
          className="w-full h-11 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all disabled:opacity-40 disabled:active:scale-100"
        >
          <Icon name="save" className="text-[18px]" />
          <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
        </button>
        {dirty && (
          <p className="text-center font-caption text-caption text-text-secondary pt-1">You have unsaved changes</p>
        )}
      </div>

      {saved && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="mx-auto w-fit bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full shadow-xl flex items-center gap-space-xs">
            <Icon name="check_circle" filled className="text-badge-discount-text text-[16px]" />
            <span className="font-label-sm text-label-sm">POS settings saved</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
