import { useEffect, useRef, useState } from 'react';
import { hasApiConfig } from '../../services/api/client';
import { useBranchMutations, useTeamMutations } from '../../hooks/business/useBranchesAndTeam';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';
import type { Branch } from '../../services/branchService';
import { Icon } from '../../components/ui/Icon';
import {
  OperatingHoursEditor,
  WEEKDAYS,
  type CustomDayHours,
  type StandardHours,
} from '../../components/ui/OperatingHoursEditor';
import { BusinessSetupChrome } from './BusinessSetupChrome';

interface DesktopBusinessAddBranchScreenProps {
  onBack: () => void;
  /** Live: receives the branch the API created. */
  onSaved: (branch?: Branch) => void;
}

/** "8:00 AM" → "08:00" for the API's opening hours. */
const to24h = (value: string) => {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value.trim());
  if (!match) return value;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
};

const GEOFENCE_MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCBgb7jXvULnbCHh2Cc7OFg3W48zRxM7y56f8tsnMLP0iGJtOeFD_NjS5v2LKAw8N3o3P1TBBV4_ll9oE-EPHf2Bt9wKNxnxA_ZKu3ZvtLGobsTOqQ0TvZE51c1P9UTHQ1jgpINOc5iugRVQ64mlkGYP58qte-cJ8kRnJ-NeWFAL2GPOd6Vo3TOMSpVFV1vsybN8BiVOYQLpMKxYYHpC7gKmux6ZvjXxvFcI7aCYfG4';

const LEAD_PORTRAIT =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAaI5fmUNYeT3BRF9l6NyI6l8dhQymH-hQgFavDUuVKs5_yL7Xx-2ntImYJ-wKObyOp1v4ka800l4-BPThoWrfMU4oQ07VsGcb3Zo9FFgxlY1dV52HMD0B3Jucao_qBFckVobblskslYplu-9EhrLol5r70Vy8s6ViVCLW32_HTjv0yq5JWKbXgo5IjUX-zYF1g0bqIdleY_1ylhl2i20icvZ3Ec6B3UFpTkSa3rE6_';

const LEAD_PORTRAIT_ALT =
  'Portrait photograph of Chidinma Okafor, an ambitious Nigerian female branch manager wearing sharp professional attire in a modern retail setting, warm natural lighting, confident warm expression, clean studio backdrop.';

const ROLE_OPTIONS = ['Branch Manager', 'Head Chef', 'Store Supervisor', 'Cashier Lead'];

const PERMITTED_MODULES: Array<{ icon: string; label: string }> = [
  { icon: 'restaurant_menu', label: 'Catalog availability' },
  { icon: 'receipt_long', label: 'Live Orders stream' },
  { icon: 'point_of_sale', label: 'Till 02 operations' },
];

export function DesktopBusinessAddBranchScreen({ onBack, onSaved }: DesktopBusinessAddBranchScreenProps) {
  const [branchName, setBranchName] = useState(hasApiConfig() ? '' : 'Garki District Flagship');
  const [address, setAddress] = useState(hasApiConfig() ? '' : 'Plot 742, Tafawa Balewa Way, Area 11');
  const [landmark, setLandmark] = useState(hasApiConfig() ? '' : 'Directly opposite Area 11 Post Office, Wing B');
  const [district, setDistrict] = useState(hasApiConfig() ? '' : 'Abuja Municipal • Garki District, FCT');
  const [branchPhone, setBranchPhone] = useState(hasApiConfig() ? '' : '+234 809 111 4455');
  const [branchEmail, setBranchEmail] = useState(hasApiConfig() ? '' : 'garki.store@urbangrill.ng');
  const [leadName, setLeadName] = useState(hasApiConfig() ? '' : 'Chidinma Okafor');
  const [leadEmail, setLeadEmail] = useState(hasApiConfig() ? '' : 'chidinma@urbangrill.ng');
  const [leadWhatsapp, setLeadWhatsapp] = useState(hasApiConfig() ? '' : '+234 803 762 9901');
  const [role, setRole] = useState('Branch Manager');
  // Live: the preview cards reflect what has been typed; there is no map / reach data yet.
  const live = hasApiConfig();
  const leadInitials =
    leadName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join('') || '—';
  const [dashboardAccess, setDashboardAccess] = useState(true);
  const [customizeDays, setCustomizeDays] = useState(false);
  const [standardHours, setStandardHours] = useState<StandardHours>({
    days: [...WEEKDAYS],
    open: '8:00 AM',
    close: '10:00 PM',
  });
  const [customDayHours, setCustomDayHours] = useState<CustomDayHours[]>([]);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  // Live: the form creates a real branch (and invites its lead when access is granted).
  const { create, update } = useBranchMutations();
  const { invite } = useTeamMutations();
  const [error, setError] = useState<string | null>(null);
  const saveLive = async () => {
    if (!branchName.trim()) {
      setError('Give the branch a name.');
      return;
    }
    const hours = Object.fromEntries(
      WEEKDAYS.map((day) => {
        const custom = customizeDays ? customDayHours.find((entry) => entry.day === day) : undefined;
        const open = custom ? custom.open : standardHours.days.includes(day) ? standardHours.open : '';
        const close = custom ? custom.close : standardHours.days.includes(day) ? standardHours.close : '';
        return [day.toLowerCase(), open && close ? { open: to24h(open), close: to24h(close) } : { closed: true }];
      }),
    );
    setStatus('saving');
    setError(null);
    try {
      const branch = await create.mutateAsync({
        name: branchName.trim(),
        address: [address.trim(), landmark.trim()].filter(Boolean).join(' — ') || undefined,
        district: district.trim() || undefined,
        phone: branchPhone.trim() || undefined,
        officialEmail: branchEmail.trim() || undefined,
        managerName: leadName.trim() || undefined,
        managerEmail: leadEmail.trim() || undefined,
        managerPhone: leadWhatsapp.trim() || undefined,
      });
      await update.mutateAsync({ id: branch.id, input: { businessHours: hours } });
      if (dashboardAccess && leadName.trim() && leadEmail.trim()) {
        const [firstName, ...rest] = leadName.trim().split(/\s+/);
        await invite
          .mutateAsync({ firstName, lastName: rest.join(' ') || firstName, email: leadEmail.trim(), phone: leadWhatsapp.trim() || undefined, role: 'Manager', jobTitle: role, branchId: branch.id })
          .catch(() => setError('Branch saved, but the lead invite could not be sent. Invite them from Staff.'));
      }
      setStatus('success');
      timers.current.push(window.setTimeout(() => onSaved(branch), 800));
    } catch (e) {
      setStatus('idle');
      setError(planErrorMessage(e) ?? apiErrorMessage(e, 'Could not add the branch.'));
    }
  };

  useEffect(() => {
    if (!error) return undefined;
    const timer = window.setTimeout(() => setError(null), 4500);
    return () => window.clearTimeout(timer);
  }, [error]);

  const handleSave = () => {
    if (status !== 'idle') return;
    if (hasApiConfig()) {
      void saveLive();
      return;
    }
    setStatus('saving');
    timers.current.push(
      window.setTimeout(() => {
        setStatus('success');
        timers.current.push(window.setTimeout(() => onSaved(), 800));
      }, 1100),
    );
  };

  return (
    <BusinessSetupChrome activeNav="locations">
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-space-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-xl pb-space-lg bg-surface-container-low px-space-xl py-space-lg rounded-xl shadow-sm">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center gap-space-xs text-on-surface-variant font-caption text-caption">
              <button
                type="button"
                onClick={onBack}
                className="hover:text-primary transition-colors flex items-center gap-space-2xs"
              >
                <Icon name="storefront" className="text-[16px]" />
                <span>Locations</span>
              </button>
              <span className="text-text-tertiary">/</span>
              <span className="font-label-sm text-label-sm text-primary font-semibold">Add New Branch</span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight font-bold">
              Add Branch Location
            </h1>
            <p className="font-body-md text-body-md text-text-secondary">
              Expand your customer reach and empower local store leads with one tap.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-md">
            <div className="flex items-center gap-space-sm bg-surface-canvas px-space-md py-space-xs rounded-lg shadow-sm">
              <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary font-bold font-caption text-caption">
                2/3
              </div>
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                  Setup Sequence
                </span>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                  Branch 2 of Multi-Location Setup
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
              <span className="w-6 h-2 rounded-full bg-primary-container" />
              <span className="w-2 h-2 rounded-full bg-surface-dim" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="relative overflow-hidden bg-primary px-space-lg py-space-md rounded-xl text-on-primary shadow-md">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary-container/20 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start gap-space-md relative z-10">
                <div className="w-9 h-9 rounded-lg bg-on-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="verified" className="text-[20px] text-on-primary" />
                </div>
                <div className="flex flex-col gap-space-2xs">
                  <span className="font-label-md text-label-md font-semibold tracking-wide flex items-center gap-space-xs">
                    Brand Identity Auto-Inherited
                    <span className="px-space-xs py-0.5 rounded-full bg-on-primary/20 text-on-primary font-caption text-caption font-medium">
                      Synced
                    </span>
                  </span>
                  <p className="font-body-md text-body-md text-surface-container-low leading-relaxed">
                    This branch automatically shares your primary business logo, storefront branding, and verified
                    category badges. No extra media uploads required!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="store" className="text-primary text-[22px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Branch Identification</h2>
                </div>
                <span className="font-caption text-caption text-text-tertiary">Required</span>
              </div>
              <div className="flex flex-col gap-space-xs">
                <label
                  className="font-label-md text-label-md text-on-surface-variant font-medium"
                  htmlFor="branch-name-input"
                >
                  Branch / Location Name
                </label>
                <div className="relative flex items-center">
                  <Icon name="storefront" className="absolute left-4 text-[20px] text-on-surface-variant" />
                  <input
                    id="branch-name-input"
                    type="text"
                    value={branchName}
                    onChange={(event) => setBranchName(event.target.value)}
                    placeholder="e.g. Central Mall Express"
                    className="w-full h-[52px] pl-12 pr-4 bg-surface-subtle focus:bg-surface-canvas rounded-[14px] text-on-surface font-body-md text-body-md outline-none transition-all shadow-inner focus:shadow-md"
                  />
                </div>
                <span className="font-caption text-caption text-text-tertiary">
                  Displayed to shoppers across discovery feeds, checkout receipts, and navigation screens.
                </span>
              </div>
            </div>

            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="pin_drop" className="text-primary text-[22px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">
                    Physical Location &amp; Address
                  </h2>
                </div>
                <div className="flex items-center gap-space-2xs px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-medium">
                  <Icon name="satellite_alt" className="text-[14px]" />
                  <span>GPS Linked</span>
                </div>
              </div>
              <div className="flex flex-col gap-space-md">
                <div className="flex flex-col gap-space-xs">
                  <label
                    className="font-label-md text-label-md text-on-surface-variant font-medium"
                    htmlFor="address-search"
                  >
                    Street Address Lookup
                  </label>
                  <div className="relative flex items-center">
                    <Icon name="search" className="absolute left-4 text-[20px] text-primary" />
                    <input
                      id="address-search"
                      type="text"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      className="w-full h-[52px] pl-12 pr-28 bg-surface-subtle focus:bg-surface-canvas rounded-[14px] text-on-surface font-body-md text-body-md outline-none transition-all shadow-inner focus:shadow-md"
                    />
                    <button
                      type="button"
                      className="absolute right-2 px-space-sm py-1.5 rounded-lg bg-surface-tint-blue text-primary font-caption text-caption font-semibold hover:bg-surface-container transition-colors"
                    >
                      Recalibrate
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  <div className="flex flex-col gap-space-xs">
                    <label
                      className="font-label-md text-label-md text-on-surface-variant font-medium"
                      htmlFor="landmark-input"
                    >
                      Landmark / Floor / Wing
                    </label>
                    <div className="relative flex items-center">
                      <Icon name="apartment" className="absolute left-4 text-[20px] text-on-surface-variant" />
                      <input
                        id="landmark-input"
                        type="text"
                        value={landmark}
                        onChange={(event) => setLandmark(event.target.value)}
                        className="w-full h-[52px] pl-12 pr-4 bg-surface-subtle focus:bg-surface-canvas rounded-[14px] text-on-surface font-body-md text-body-md outline-none transition-all shadow-inner focus:shadow-md"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <label
                      className="font-label-md text-label-md text-on-surface-variant font-medium"
                      htmlFor="district-input"
                    >
                      City / District / State
                    </label>
                    <div className="relative flex items-center">
                      <Icon name="map" className="absolute left-4 text-[20px] text-on-surface-variant" />
                      <input
                        id="district-input"
                        type="text"
                        value={district}
                        onChange={(event) => setDistrict(event.target.value)}
                        className="w-full h-[52px] pl-12 pr-4 bg-surface-subtle focus:bg-surface-canvas rounded-[14px] text-on-surface font-body-md text-body-md outline-none transition-all shadow-inner focus:shadow-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center gap-space-xs">
                <Icon name="contact_phone" className="text-primary text-[22px]" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Branch Contact Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-space-xs">
                  <label
                    className="font-label-md text-label-md text-on-surface-variant font-medium"
                    htmlFor="branch-phone"
                  >
                    Branch Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <Icon name="call" className="absolute left-4 text-[20px] text-on-surface-variant" />
                    <input
                      id="branch-phone"
                      type="tel"
                      value={branchPhone}
                      onChange={(event) => setBranchPhone(event.target.value)}
                      className="w-full h-[52px] pl-12 pr-4 bg-surface-subtle focus:bg-surface-canvas rounded-[14px] text-on-surface font-body-md text-body-md outline-none transition-all shadow-inner focus:shadow-md"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <label
                    className="font-label-md text-label-md text-on-surface-variant font-medium"
                    htmlFor="branch-email"
                  >
                    Branch Direct Email
                  </label>
                  <div className="relative flex items-center">
                    <Icon name="mail" className="absolute left-4 text-[20px] text-on-surface-variant" />
                    <input
                      id="branch-email"
                      type="email"
                      value={branchEmail}
                      onChange={(event) => setBranchEmail(event.target.value)}
                      className="w-full h-[52px] pl-12 pr-4 bg-surface-subtle focus:bg-surface-canvas rounded-[14px] text-on-surface font-body-md text-body-md outline-none transition-all shadow-inner focus:shadow-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-space-2xs">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="badge" className="text-primary text-[22px]" />
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">
                      Person in Charge / Branch Lead
                    </h2>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary">
                    Who manages orders, customer inquiries, and voucher redemptions at this branch?
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-space-xs py-space-xs">
                {ROLE_OPTIONS.map((option) => {
                  const selected = option === role;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRole(option)}
                      className={`h-9 px-space-md rounded-full flex items-center gap-space-2xs transition-colors ${
                        selected
                          ? 'bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold shadow-sm'
                          : 'bg-surface-subtle text-text-secondary hover:bg-surface-container-low font-label-md text-label-md'
                      }`}
                    >
                      {selected && <Icon name="check" className="text-[16px]" />}
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                <div className="flex flex-col gap-space-xs">
                  <label
                    className="font-label-md text-label-md text-on-surface-variant font-medium"
                    htmlFor="lead-fullname"
                  >
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <Icon name="account_circle" className="absolute left-4 text-[20px] text-on-surface-variant" />
                    <input
                      id="lead-fullname"
                      type="text"
                      value={leadName}
                      onChange={(event) => setLeadName(event.target.value)}
                      className="w-full h-[52px] pl-12 pr-4 bg-surface-subtle focus:bg-surface-canvas rounded-[14px] text-on-surface font-body-md text-body-md outline-none transition-all shadow-inner focus:shadow-md"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <label
                    className="font-label-md text-label-md text-on-surface-variant font-medium"
                    htmlFor="lead-email"
                  >
                    Direct Email
                  </label>
                  <div className="relative flex items-center">
                    <Icon name="alternate_email" className="absolute left-4 text-[20px] text-on-surface-variant" />
                    <input
                      id="lead-email"
                      type="email"
                      value={leadEmail}
                      onChange={(event) => setLeadEmail(event.target.value)}
                      className="w-full h-[52px] pl-12 pr-4 bg-surface-subtle focus:bg-surface-canvas rounded-[14px] text-on-surface font-body-md text-body-md outline-none transition-all shadow-inner focus:shadow-md"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <label
                    className="font-label-md text-label-md text-on-surface-variant font-medium"
                    htmlFor="lead-whatsapp"
                  >
                    WhatsApp Number
                  </label>
                  <div className="relative flex items-center">
                    <Icon name="chat" className="absolute left-4 text-[20px] text-badge-discount-text" />
                    <input
                      id="lead-whatsapp"
                      type="tel"
                      value={leadWhatsapp}
                      onChange={(event) => setLeadWhatsapp(event.target.value)}
                      className="w-full h-[52px] pl-12 pr-4 bg-surface-subtle focus:bg-surface-canvas rounded-[14px] text-on-surface font-body-md text-body-md outline-none transition-all shadow-inner focus:shadow-md"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-space-xs p-space-md bg-surface-container-low rounded-xl flex items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-canvas flex items-center justify-center text-primary shadow-sm shrink-0">
                    <Icon name="admin_panel_settings" className="text-[20px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Grant dashboard access
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Allows managing vouchers, local menu availability, and responding to branch reviews.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-pressed={dashboardAccess}
                  onClick={() => setDashboardAccess((value) => !value)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                    dashboardAccess ? 'bg-primary-container' : 'bg-surface-dim'
                  }`}
                >
                  <span
                    className={`${
                      dashboardAccess ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface-canvas shadow transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
            </div>

            <div className="bg-surface-canvas p-space-xl rounded-xl shadow-sm flex flex-col gap-space-md mb-space-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="schedule" className="text-primary text-[22px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Operating Hours</h2>
                </div>
                <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption font-medium">
                  Standard Hours Sync
                </span>
              </div>
              <OperatingHoursEditor
                customDays={customDayHours}
                customizeEnabled={customizeDays}
                customizeHint="Set irregular schedules for Friday nights, public holidays, or weekend brunches."
                standard={standardHours}
                timezoneNote="West Africa Time"
                onCustomDaysChange={setCustomDayHours}
                onCustomizeEnabledChange={setCustomizeDays}
                onStandardChange={setStandardHours}
              />
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg lg:sticky lg:top-24">
            <div className="bg-surface-canvas rounded-xl shadow-md overflow-hidden flex flex-col">
              <div className="p-space-lg bg-surface-canvas flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-caption text-caption uppercase text-text-tertiary font-bold tracking-wider">
                    Spatial Catchment
                  </span>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Live Geofence Preview</h3>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-space-2xs px-space-sm py-1 rounded-lg bg-surface-container-low text-primary font-caption text-caption font-semibold hover:bg-surface-container transition-colors"
                >
                  <Icon name="my_location" className="text-[16px]" />
                  <span>Change GPS</span>
                </button>
              </div>
              <div className="relative w-full h-72 bg-surface-container overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center"
                  data-location="Plot 742 Tafawa Balewa Way Garki Abuja Nigeria"
                  style={live ? undefined : { backgroundImage: `url('${GEOFENCE_MAP_IMAGE}')` }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-52 h-52 rounded-full border-2 border-primary/40 bg-primary/10 flex items-center justify-center animate-pulse">
                    <div className="w-24 h-24 rounded-full border border-primary/60 bg-primary/20" />
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none drop-shadow-lg">
                  <div className="bg-on-surface text-on-primary px-space-sm py-1 rounded-full font-caption text-caption font-semibold flex items-center gap-space-2xs whitespace-nowrap shadow-md">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                    <span>{live ? branchName.trim() || 'New branch' : 'Urban Grill (Garki Branch)'}</span>
                  </div>
                  <Icon name="location_on" filled className="text-primary text-[38px] -mt-1" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 bg-surface-canvas/90 backdrop-blur-md p-space-xs px-space-sm rounded-lg flex items-center justify-between text-on-surface shadow-sm">
                  <div className="flex items-center gap-space-xs font-caption text-caption text-text-secondary font-mono">
                    <Icon name="explore" className="text-[15px] text-primary" />
                    <span>{live ? address.trim() || 'Pinned from the address you enter' : '9.0348° N, 7.4891° E'}</span>
                  </div>
                  {!live && (
                    <div className="flex items-center gap-space-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                      <span className="font-caption text-caption text-badge-discount-text font-semibold">
                        ±3m Accuracy
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-space-md grid grid-cols-3 gap-space-xs text-center bg-surface-subtle">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-tertiary">Catchment Radius</span>
                  <span className="font-heading-sm text-heading-sm font-bold text-text-primary">{live ? '—' : '3.0 km'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-tertiary">Est. Shoppers Reach</span>
                  <span className="font-heading-sm text-heading-sm font-bold text-primary">{live ? '—' : '~18,400'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-tertiary">Delivery Timeband</span>
                  <span className="font-heading-sm text-heading-sm font-bold text-text-primary">{live ? '—' : '12-25 min'}</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas p-space-lg rounded-xl shadow-md flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption uppercase text-text-tertiary font-bold tracking-wider">
                  Credential Summary
                </span>
                <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                  Active Assignment
                </span>
              </div>
              <div className="p-space-md rounded-xl bg-surface-container-low flex items-start gap-space-md">
                {live ? (
                  <span className="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-heading-sm text-heading-sm font-bold shadow-sm shrink-0">
                    {leadInitials}
                  </span>
                ) : (
                  <img
                    className="w-14 h-14 rounded-full object-cover shadow-sm shrink-0"
                    alt={LEAD_PORTRAIT_ALT}
                    src={LEAD_PORTRAIT}
                  />
                )}
                <div className="flex flex-col gap-space-2xs min-w-0">
                  <div className="flex items-center gap-space-xs">
                    <h4 className="font-heading-sm text-heading-sm text-text-primary font-bold truncate">
                      {live ? leadName.trim() || 'Branch lead' : leadName}
                    </h4>
                    <Icon name="check_circle" className="text-[16px] text-badge-discount-text" />
                  </div>
                  <p className="font-caption text-caption text-primary font-semibold">{role} • {live ? branchName.trim() || 'New branch' : 'Garki Flagship'}</p>
                  <p className="font-caption text-caption text-text-secondary truncate">{live ? leadEmail.trim() || '—' : leadEmail}</p>
                </div>
              </div>
              <div className="flex flex-col gap-space-xs pt-space-2xs">
                <span className="font-caption text-caption text-text-tertiary font-medium uppercase tracking-wider">
                  Permitted Modules
                </span>
                <div className="flex flex-wrap gap-space-2xs">
                  {(live
                    ? dashboardAccess
                      ? PERMITTED_MODULES.map((entry) => (entry.label === 'Till 02 operations' ? { ...entry, label: 'POS operations' } : entry))
                      : []
                    : PERMITTED_MODULES
                  ).map((entry) => (
                    <span
                      key={entry.label}
                      className="px-space-xs py-1 rounded-md bg-surface-subtle text-on-surface-variant font-caption text-caption flex items-center gap-space-2xs"
                    >
                      <Icon name={entry.icon} className="text-[14px] text-primary" />
                      <span>{entry.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-space-xs pt-space-xs text-text-tertiary font-caption text-caption">
              <Icon name="shield" className="text-[14px]" />
              <span>Branch configurations are encrypted and logged per NDPR guidelines</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md w-full sm:w-auto">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-subtle font-button-secondary text-button-secondary transition-colors"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Cancel &amp; Return to Locations</span>
            </button>
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={status === 'saving'}
              className={`inline-flex items-center justify-center gap-space-xs px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed ${
                status === 'success'
                  ? 'bg-badge-discount-bg text-badge-discount-text'
                  : 'bg-primary hover:bg-surface-tint text-on-primary shadow-primary/20'
              }`}
            >
              {status === 'idle' && (
                <>
                  <span>Save &amp; Add Branch Location</span>
                  <Icon name="arrow_forward" className="text-[20px]" />
                </>
              )}
              {status === 'saving' && (
                <>
                  <Icon name="progress_activity" className="text-[20px] animate-spin" />
                  <span>Saving...</span>
                </>
              )}
              {status === 'success' && (
                <>
                  <Icon name="check_circle" className="text-[20px]" />
                  <span>Branch Successfully Activated!</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {error && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {error}
        </div>
      )}
    </BusinessSetupChrome>
  );
}
