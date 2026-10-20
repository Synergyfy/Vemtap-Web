import { useEffect, useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { PosOwnerHeader, PosToggle } from '../components/PosControls';
import { MoreSettingsLink } from '../components/business/MoreSettingsLink';
import { usePosSettings } from '../context/PosSettingsContext';

interface BusinessPosSettingsScreenProps {
  onBack: () => void;
  onOpenTaxes?: () => void;
  onOpenReceipt?: () => void;
}

const SETTINGS_TABS = [
  { key: 'business', label: 'Business', icon: 'storefront' },
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
export function BusinessPosSettingsScreen({ onBack, onOpenTaxes, onOpenReceipt }: BusinessPosSettingsScreenProps) {
  const s = usePosSettings();
  const [tab, setTab] = useState<SettingsTabKey>('business');
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
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


        {tab === 'receipt' && onOpenReceipt && (


          <MoreSettingsLink


            icon="tune"


            title="Receipt & order customization"


            body="Paper width, address, print triggers and a live preview"


            onClick={onOpenReceipt}


          />


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

        {tab === 'tax' && onOpenTaxes && (

          <MoreSettingsLink

            icon="account_balance"

            title="Taxes & surcharges"

            body="Service charge, packaging fee, TIN and table QR rules"

            onClick={onOpenTaxes}

          />

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
          disabled={!dirty}
          className="w-full h-11 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all disabled:opacity-40 disabled:active:scale-100"
        >
          <Icon name="save" className="text-[18px]" />
          <span>Save Changes</span>
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
