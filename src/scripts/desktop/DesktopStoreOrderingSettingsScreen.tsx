import { useState, useEffect, useRef } from 'react';
import { Icon } from '../../components/ui/Icon';
import { MerchantShell } from './MerchantShell';
import { useStoreOrdering } from '../../context/StoreOrderingContext';
import type { StoreOrderingSettings } from '../storeOrderingData';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { useTeam } from '../../hooks/business/useBranchesAndTeam';
import { hasApiConfig } from '../../services/api/client';

interface DesktopStoreOrderingSettingsScreenProps {
  onNav: (key: string) => void;
}

export function DesktopStoreOrderingSettingsScreen({ onNav }: DesktopStoreOrderingSettingsScreenProps) {
  const { settings, settingsLoading, settingsSaving, updateSettings, lastError, clearLastError } = useStoreOrdering();

  // Local form state
  const [enabled, setEnabled] = useState(settings.enabled);
  const [usePosForCompletion, setUsePosForCompletion] = useState(settings.usePosForCompletion);
  const [paymentMethods, setPaymentMethods] = useState(settings.paymentMethods);
  const [activeBranches, setActiveBranches] = useState(settings.activeBranches);
  const [immediatePickup, setImmediatePickup] = useState(settings.immediatePickup);
  const [scheduledPreOrder, setScheduledPreOrder] = useState(settings.scheduledPreOrder);
  const [defaultPrepMinutes, setDefaultPrepMinutes] = useState(settings.defaultPrepMinutes);
  const [pickupInstructions, setPickupInstructions] = useState(settings.pickupInstructions);
  const [guestOrderingAllowed, setGuestOrderingAllowed] = useState(settings.guestOrderingAllowed);
  const [acceptOrdersOutsideHours, setAcceptOrdersOutsideHours] = useState(settings.acceptOrdersOutsideHours);
  const [allowSubstitutions, setAllowSubstitutions] = useState(settings.allowSubstitutions);
  const [autoNotifyCustomerSms, setAutoNotifyCustomerSms] = useState(settings.autoNotifyCustomerSms);
  const [autoNotifyCustomerWhatsApp, setAutoNotifyCustomerWhatsApp] = useState(settings.autoNotifyCustomerWhatsApp);
  const [notifiedStaff, setNotifiedStaff] = useState<string[]>(settings.notifiedStaff);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live settings arrive after mount (and change after a save): re-seed the form from them.
  useEffect(() => {
    const apply = (s: StoreOrderingSettings) => {
      setEnabled(s.enabled);
      setUsePosForCompletion(s.usePosForCompletion);
      setPaymentMethods(s.paymentMethods);
      setActiveBranches(s.activeBranches);
      setImmediatePickup(s.immediatePickup);
      setScheduledPreOrder(s.scheduledPreOrder);
      setDefaultPrepMinutes(s.defaultPrepMinutes);
      setPickupInstructions(s.pickupInstructions);
      setGuestOrderingAllowed(s.guestOrderingAllowed);
      setAcceptOrdersOutsideHours(s.acceptOrdersOutsideHours);
      setAllowSubstitutions(s.allowSubstitutions);
      setAutoNotifyCustomerSms(s.autoNotifyCustomerSms);
      setAutoNotifyCustomerWhatsApp(s.autoNotifyCustomerWhatsApp);
      setNotifiedStaff(s.notifiedStaff);
    };
    apply(settings);
  }, [settings]);

  const live = hasApiConfig();
  const { branches, isLive: branchesLoaded } = useBusinessBranch();
  // Live: real branches keyed by id, open unless switched off (the API's rule);
  // demo: the sample branches, off unless listed.
  const branchCards = live
    ? (branchesLoaded ? branches : []).map((b) => ({ key: b.id ?? b.key, name: b.name, address: b.area }))
    : [
        { key: 'wuse-2', name: 'Wuse II Flagship', address: 'Plot 1428 Adetokunbo Ademola Cres, Abuja' },
        { key: 'maitama', name: 'Maitama Heights', address: 'Plot 14 Amazon Street, Maitama, Abuja' },
        { key: 'garki', name: 'Garki Branch', address: 'Area 11 Commercial District, Abuja' },
      ];
  // Live: the business's real team — the same query the Staff page uses — saved
  // by member id; demo: sample staff names.
  const team = useTeam();
  const staffOptions = live
    ? (team.data ?? []).map((member) => {
        const name = [member.firstName, member.lastName].filter(Boolean).join(' ') || member.email || 'Team member';
        const role = member.roleTag || member.jobTitle || member.role;
        return { key: member.id, label: role ? `${name} (${role})` : name };
      })
    : ['Chef Adebayo (Head Chef)', 'Musa Danladi (Store Manager)', 'Grace Udoh (Front Desk)', 'Ibrahim Bello (Kitchen Lead)'].map(
        (label) => ({ key: label, label }),
      );
  const isBranchActive = (key: string) => (live ? activeBranches[key] !== false : Boolean(activeBranches[key]));

  const toastTimer = useRef<number | null>(null);
  const showToast = (msg: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToastMessage(msg);
    toastTimer.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimer.current = null;
    }, 3000);
  };
  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!lastError) return;
    showToast(lastError);
    clearLastError();
  }, [lastError, clearLastError]);

  const handleBranchToggle = (branchKey: string) => {
    setActiveBranches((prev) => ({
      ...prev,
      [branchKey]: !isBranchActive(branchKey),
    }));
  };

  const handlePaymentMethodToggle = (methodId: string) => {
    setPaymentMethods((prev) =>
      prev.map((method) =>
        method.id === methodId ? { ...method, enabled: !method.enabled } : method,
      ),
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settingsLoading || settingsSaving) return;
    const result = await updateSettings({
      enabled,
      usePosForCompletion,
      paymentMethods,
      activeBranches,
      immediatePickup,
      scheduledPreOrder,
      defaultPrepMinutes,
      pickupInstructions,
      guestOrderingAllowed,
      acceptOrdersOutsideHours,
      allowSubstitutions,
      autoNotifyCustomerSms,
      autoNotifyCustomerWhatsApp,
      notifiedStaff,
    });
    showToast(result.message);
  };

  return (
    <MerchantShell activeNav="store-ordering-settings" onNav={onNav}>
      <form onSubmit={handleSave} className="w-full pb-space-3xl flex flex-col gap-space-xl">
        {/* Header Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-caption text-text-tertiary">
              <button
                type="button"
                onClick={() => onNav('store-ordering-dashboard')}
                className="hover:text-primary transition-colors"
              >
                Store Front
              </button>
              <span>/</span>
              <span className="text-text-primary font-semibold">Ordering Settings</span>
            </div>
            <h1 className="text-heading-xl font-heading-xl text-text-primary tracking-tight">
              Store Front Configuration
            </h1>
            <p className="text-body-sm text-text-secondary">
              Control pickup policies, participating branches, preparation lead times, and staff alerts.
            </p>
          </div>

          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={() => onNav('store-ordering-dashboard')}
              className="px-space-md py-2.5 rounded-xl border border-border bg-surface-canvas hover:bg-surface-subtle text-text-primary font-label-md text-label-md flex items-center gap-2 shadow-xs transition-colors"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back to Orders</span>
            </button>
            <button
              type="submit"
              disabled={settingsLoading || settingsSaving}
              className="px-space-lg py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="save" className="text-[18px]" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Section 1: Master Store Ordering Switch */}
        <div className="p-space-xl rounded-2xl bg-surface-canvas border border-border-subtle shadow-xs flex items-center justify-between gap-space-md">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              enabled ? 'bg-surface-tint-blue text-primary' : 'bg-surface-subtle text-text-tertiary'
            }`}>
              <Icon name="storefront" className="text-[26px]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
                  Enable Store &amp; QR Ordering
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-caption font-bold ${
                  enabled ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-subtle text-text-tertiary'
                }`}>
                  {enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-body-sm text-text-secondary mt-1 max-w-xl">
                Allow customers to scan physical QR codes and open your storefront to place direct pickup orders.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-8 bg-surface-container peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary" />
          </label>
        </div>

        {/* Section 1b: POS Completion Mode */}
        <div className="p-space-xl rounded-2xl bg-surface-canvas border border-border-subtle shadow-xs">
          <div className="flex items-start justify-between gap-space-md">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                usePosForCompletion ? 'bg-surface-tint-blue text-primary' : 'bg-surface-subtle text-text-tertiary'
              }`}>
                <Icon name="point_of_sale" className="text-[26px]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
                    VEMTAP POS Completion Mode
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-caption font-bold ${
                    usePosForCompletion
                      ? 'bg-surface-tint-blue text-primary border border-primary/30'
                      : 'bg-surface-subtle text-text-tertiary'
                  }`}>
                    {usePosForCompletion ? 'POS Enabled' : 'Standalone'}
                  </span>
                </div>
                <p className="text-body-sm text-text-secondary mt-1 max-w-xl">
                  {usePosForCompletion
                    ? 'When a store order is ready, staff will be directed to the VEMTAP POS register to process payment and issue a receipt. The order reference is auto-loaded into the POS cart.'
                    : 'Staff confirm pickup and record payment directly within Store Ordering without switching to the POS terminal. Suitable for cash-only or simple operations.'}
                </p>
                {usePosForCompletion && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-tint-blue/30 border border-primary/20">
                    <Icon name="info" className="text-[16px] text-primary shrink-0" />
                    <p className="text-caption text-primary">
                      POS must be active and configured. The order items, reference, and total will be pre-loaded into the current POS register session.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={usePosForCompletion}
                onChange={(e) => setUsePosForCompletion(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-surface-container peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
        </div>

        {/* Section 1c: Counter Payment Methods */}
        <div className="p-space-xl rounded-2xl bg-surface-canvas border border-border-subtle shadow-xs space-y-space-md">
          <div className="flex flex-col">
            <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
              Accepted Counter Payment Methods
            </h3>
            <p className="text-body-sm text-text-secondary">
              These are the live tender options shown when staff record payment for a store order.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border-subtle bg-surface-subtle cursor-pointer"
              >
                <span className="text-body-sm font-medium text-text-primary">{method.label}</span>
                <input
                  type="checkbox"
                  checked={method.enabled}
                  onChange={() => handlePaymentMethodToggle(method.id)}
                  className="w-4 h-4 text-primary rounded-md border-border cursor-pointer"
                />
              </label>
            ))}
            {paymentMethods.length === 0 && (
              <p className="text-caption text-text-secondary">
                No payment methods are configured for this business yet.
              </p>
            )}
          </div>
        </div>

        {/* Section 2: Participating Branches */}
        <div className="p-space-xl rounded-2xl bg-surface-canvas border border-border-subtle shadow-xs space-y-space-md">
          <div className="flex flex-col">
            <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
              Participating Branches
            </h3>
            <p className="text-body-sm text-text-secondary">
              Select which physical branches accept and fulfill incoming customer QR orders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-2">
            {branchCards.map((branch) => {
              const isChecked = isBranchActive(branch.key);
              return (
                <div
                  key={branch.key}
                  onClick={() => handleBranchToggle(branch.key)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isChecked
                      ? 'bg-surface-tint-blue/30 border-primary shadow-xs'
                      : 'bg-surface-subtle/50 border-border-subtle opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-text-primary text-[14px]">{branch.name}</span>
                    <span className="text-caption text-text-secondary mt-0.5">{branch.address}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleBranchToggle(branch.key)}
                    onClick={(event) => event.stopPropagation()}
                    className="w-5 h-5 text-primary rounded-md border-border shrink-0 mt-0.5 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Fulfillment & Ordering Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
          {/* Ordering Options */}
          <div className="p-space-xl rounded-2xl bg-surface-canvas border border-border-subtle shadow-xs space-y-space-md">
            <div className="flex flex-col">
              <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
                Pickup &amp; Ordering Preferences
              </h3>
              <p className="text-body-sm text-text-secondary">
                Configure pickup queue timing and guest checkout permissions for this store.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={immediatePickup}
                  onChange={(e) => setImmediatePickup(e.target.checked)}
                  className="w-4 h-4 text-primary rounded-md border-border"
                />
                <span className="text-body-sm text-text-primary">
                  Allow Immediate Pickup (Express preparation queue)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduledPreOrder}
                  onChange={(e) => setScheduledPreOrder(e.target.checked)}
                  className="w-4 h-4 text-primary rounded-md border-border"
                />
                <span className="text-body-sm text-text-primary">
                  Allow Pre-orders / Scheduled Pickup for later today
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={guestOrderingAllowed}
                  onChange={(e) => setGuestOrderingAllowed(e.target.checked)}
                  className="w-4 h-4 text-primary rounded-md border-border"
                />
                <span className="text-body-sm text-text-primary">
                  Allow Guest Checkout (Customers order without creating account)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptOrdersOutsideHours}
                  onChange={(e) => setAcceptOrdersOutsideHours(e.target.checked)}
                  className="w-4 h-4 text-primary rounded-md border-border"
                />
                <span className="text-body-sm text-text-primary">
                  Accept orders after closing hours (Queued for next opening time)
                </span>
              </label>
            </div>
          </div>

          {/* Pickup Instructions */}
          <div className="p-space-xl rounded-2xl bg-surface-canvas border border-border-subtle shadow-xs space-y-space-md">
            <div className="flex flex-col">
              <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
                Customer Pickup Instructions
              </h3>
              <p className="text-body-sm text-text-secondary">
                Directions displayed on the customer's scannable order receipt.
              </p>
            </div>

            <textarea
              rows={4}
              value={pickupInstructions}
              onChange={(e) => setPickupInstructions(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface-subtle border border-border text-body-md text-on-surface focus:outline-hidden focus:border-primary"
              placeholder="e.g. Please proceed to Pick-Up Counter A and display your Order Reference to cashier."
            />

            <div className="p-3 rounded-xl bg-surface-subtle text-caption text-text-secondary space-y-1">
              <span className="font-bold text-text-primary block">Payment Notice to Customers:</span>
              <span>
                {usePosForCompletion
                  ? 'Customers are told that payment is processed in VEMTAP POS when the order is ready, with the order reference pre-loaded at the register.'
                  : 'Customers are told that payment is confirmed and collected at the physical store counter upon pickup.'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Staff Notifications */}
        <div className="p-space-xl rounded-2xl bg-surface-canvas border border-border-subtle shadow-xs space-y-space-md">
          <div className="flex flex-col">
            <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
              Order Alert Routing
            </h3>
            <p className="text-body-sm text-text-secondary">
              Select the staff member or team designated to receive incoming store order notifications.
            </p>
          </div>

          <div className="max-w-md pt-2 space-y-2">
            <label htmlFor="staff-alert-recipient" className="font-label-md text-label-md font-semibold text-text-primary block">
              Staff Order Alert Recipient
            </label>
            <select
              id="staff-alert-recipient"
              value={notifiedStaff[0] || 'all'}
              onChange={(e) => setNotifiedStaff(e.target.value === 'all' ? ['all'] : [e.target.value])}
              className="w-full px-3.5 py-3 rounded-xl bg-surface-subtle border border-border text-body-md text-text-primary focus:outline-hidden focus:border-primary font-medium"
            >
              <option value="all">All Staff Members (Storewide Alert)</option>
              {staffOptions.map((staff) => (
                <option key={staff.key} value={staff.key}>
                  {staff.label}
                </option>
              ))}
            </select>
            {live && team.isSuccess && staffOptions.length === 0 && (
              <p className="text-caption text-text-secondary">Invite staff from Team &amp; Access to choose alert recipients.</p>
            )}
          </div>
        </div>

        {/* Global Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-on-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-xl font-label-md animate-in slide-in-from-bottom duration-200">
            <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </form>
    </MerchantShell>
  );
}
