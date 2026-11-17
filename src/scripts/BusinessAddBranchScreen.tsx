import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import {
  OperatingHoursEditor,
  WEEKDAYS,
  type CustomDayHours,
  type StandardHours,
} from '../components/ui/OperatingHoursEditor';
import { hasApiConfig } from '../services/api/client';
import { useBranchMutations, useTeamMutations } from '../hooks/business/useBranchesAndTeam';
import { apiErrorMessage } from '../services/errorMessages';
import { planErrorMessage } from '../services/planErrors';
import { UserAvatar } from '../components/ui/UserAvatar';

import { formatNaira, getLocationPricing } from './locationPricing';
import { useBusinessOfferings, type OfferingsState } from '../context/BusinessOfferingsContext';

interface BusinessAddBranchScreenProps {
  onBack: () => void;
  /** Live: the branch the API created; demo: the details entered. */
  onSaved: (saved?: { id?: string; name: string; address?: string | null; district?: string | null; offerings?: OfferingsState }) => void;
}

/** "8:00 AM" → "08:00" for the API's opening hours. */
const to24h = (value: string) => {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value.trim());
  if (!match) return value;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
};

/** Reads a form field by id (the form's inputs are uncontrolled). */
const field = (id: string) => (document.getElementById(id) as HTMLInputElement | null)?.value.trim() ?? '';

/** Nigerian numbers as `+234…`. */
const phoneValue = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return undefined;
  return `+234${digits.startsWith('234') ? digits.slice(3) : digits.replace(/^0/, '')}`;
};

type SaveStatus = 'idle' | 'publishing' | 'success';

const BRANCH_IMAGES = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ4oNLsYUf9Br4A5iKA59KHZakY3MRrc7bBDGsd_glZVtk4s1wTWhcdZaxG137hOnKGMm_9wDuvSa8fU7gkfH3CikSVi4XY7ZdUx0XcAEFJroZzxGDU0foYmc3Em1B5SAzrrnDFIMvRyQy5bio69Ibs_QkoSRTv7D_lrcRJm8yzrga6YrYlsUHR5RXFB-3shvjD_D3UieD9TXcOS2OczGRy5kOue5PTDjqXriwKV7A3jTwkZtVjwYFNA',
    alt: 'Garki Mall, Abuja, Nigeria',
  },
];

const ROLE_PILLS = ['Branch Manager', 'Head Chef', 'Store Supervisor', 'Salon Director', 'Lead Host'];

export function BusinessAddBranchScreen({ onBack, onSaved }: BusinessAddBranchScreenProps) {
  const { offerings: businessOfferings, setBranchOfferings } = useBusinessOfferings();
  const [branchName, setBranchName] = useState('Garki District Flagship');
  const [street, setStreet] = useState('Plot 742, Tafawa Balewa Way, Area 11');
  const [district, setDistrict] = useState('Abuja Municipal • Garki District, FCT');
  const [role, setRole] = useState('Branch Manager');
  const [grantAccess, setGrantAccess] = useState(true);
  const [customHours, setCustomHours] = useState(false);
  const [branchOfferings, setBranchOfferingsState] = useState<OfferingsState>(() => ({
    hasProducts: businessOfferings.hasProducts,
    hasServices: businessOfferings.hasServices,
  }));
  const [standardHours, setStandardHours] = useState<StandardHours>({
    days: [...WEEKDAYS],
    open: '8:00 AM',
    close: '10:00 PM',
  });
  const [customDayHours, setCustomDayHours] = useState<CustomDayHours[]>([]);
  const [status, setStatus] = useState<SaveStatus>('idle');
  // Live: the form creates a real branch (and invites its lead when access is granted).
  const live = hasApiConfig();
  const sample = (value: string) => (live ? '' : value);
  const { create, update } = useBranchMutations();
  const { invite } = useTeamMutations();
  const [error, setError] = useState<string | null>(null);
  const showError = (message: string) => {
    setError(message);
    window.setTimeout(() => setError(null), 4500);
  };

  const saveLive = async () => {
    const name = field('branch-name');
    if (!name) return showError('Give the branch a name.');
    const hours = Object.fromEntries(
      WEEKDAYS.map((day) => {
        const custom = customHours ? customDayHours.find((entry) => entry.day === day) : undefined;
        const open = custom ? custom.open : standardHours.days.includes(day) ? standardHours.open : '';
        const close = custom ? custom.close : standardHours.days.includes(day) ? standardHours.close : '';
        return [day.toLowerCase(), open && close ? { open: to24h(open), close: to24h(close) } : { closed: true }];
      }),
    );
    const leadName = field('lead-name');
    const leadEmail = field('lead-email');
    const leadPhone = phoneValue(field('lead-phone'));
    setStatus('publishing');
    try {
      const branch = await create.mutateAsync({
        name,
        address: [field('branch-street'), field('branch-landmark')].filter(Boolean).join(' — ') || undefined,
        district: field('branch-district') || undefined,
        phone: phoneValue(field('branch-phone')),
        officialEmail: field('branch-email') || undefined,
        managerName: leadName || undefined,
        managerEmail: leadEmail || undefined,
        managerPhone: leadPhone,
      });
      // Opening hours are set on the branch once it exists.
      await update.mutateAsync({ id: branch.id, input: { businessHours: hours } });
      if (grantAccess && leadName && leadEmail) {
        const [firstName, ...rest] = leadName.split(/\s+/);
        await invite
          .mutateAsync({ firstName, lastName: rest.join(' ') || firstName, email: leadEmail, phone: leadPhone, role: 'Manager', jobTitle: role, branchId: branch.id })
          .catch(() => showError('Branch saved, but the lead invite could not be sent. Invite them from Staff.'));
      }
      setStatus('success');
      setBranchOfferings(branch.id, branchOfferings);
      window.setTimeout(() => onSaved(branch), 900);
    } catch (e) {
      setStatus('idle');
      showError(planErrorMessage(e) ?? apiErrorMessage(e, 'Could not add the branch.'));
    }
  };

  const toggleBranchOffering = (type: 'products' | 'services') => {
    if (type === 'products') {
      if (!businessOfferings.hasProducts) return;
      if (branchOfferings.hasProducts && !branchOfferings.hasServices) return;
      setBranchOfferingsState((prev) => ({ ...prev, hasProducts: !prev.hasProducts }));
    } else {
      if (!businessOfferings.hasServices) return;
      if (branchOfferings.hasServices && !branchOfferings.hasProducts) return;
      setBranchOfferingsState((prev) => ({ ...prev, hasServices: !prev.hasServices }));
    }
  };

  const handleSave = () => {
    if (status !== 'idle') return;
    if (live) {
      void saveLive();
      return;
    }
    setStatus('publishing');
    const finalName = branchName.trim();
    setBranchOfferings(finalName, branchOfferings);
    window.setTimeout(() => {
      setStatus('success');
      window.setTimeout(
        () =>
          onSaved({
            name: finalName,
            address: street.trim(),
            district: district.trim(),
            offerings: branchOfferings,
          }),
        900,
      );
    }, 1100);
  };

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
          <button
            aria-label="Go back"
            className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high/50 active:scale-95 transition-all"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back_ios_new" className="text-[22px]" />
          </button>
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="flex items-center gap-space-2xs mb-1">
              <span className="w-6 h-1.5 rounded-full bg-primary-container transition-all" />
              <span className="w-1.5 h-1.5 rounded-full bg-border-subtle transition-all" />
              <span className="w-1.5 h-1.5 rounded-full bg-border-subtle transition-all" />
            </div>
            <h1 className="font-label-sm text-label-sm text-text-secondary line-clamp-1">Add Branch Location</h1>
          </div>
          <div className="w-11 h-11 flex items-center justify-end">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_2px_6px_rgba(0,85,196,0.2)] overflow-hidden">
              <UserAvatar textClassName="text-on-primary text-[13px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full">
        <div className="px-margin pt-space-md pb-space-2xl flex flex-col gap-space-lg">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center gap-space-2xs text-primary">
              <Icon name="add_location_alt" className="text-[20px]" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                Expansion Studio
              </span>
            </div>
            <h2 className="font-heading-lg text-heading-lg text-text-primary">Add Branch Location</h2>
            <p className="font-body-md text-body-md text-text-secondary">
              Expand your customer reach and empower local store leads with one tap.
            </p>
          </div>

          <div className="bg-surface-tint-blue rounded-xl p-space-md shadow-sm flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center shrink-0 text-primary-container">
              <Icon name="verified" className="text-[22px]" />
            </div>
            <div className="flex flex-col gap-space-2xs">
              <h3 className="font-heading-sm text-heading-sm text-primary-container">Inherits Brand Identity</h3>
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                This branch automatically shares your primary business logo, storefront branding, and verified
                category badges. No extra media uploads required!
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center gap-space-2xs">
              <span className="w-2 h-2 rounded-full bg-primary-container" />
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Branch Identification</h3>
            </div>
            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="branch-name">
                Branch / Location Name
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full h-[52px] px-space-md rounded-[14px] bg-surface-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-canvas shadow-inner"
                  defaultValue={sample('Garki District Flagship')}
                  id="branch-name"
                  placeholder="e.g. Garki Branch, Victoria Island Annex"
                  type="text"
                  value={branchName}
                  onChange={(event) => setBranchName(event.target.value)}
                />
                <Icon
                  className="absolute right-space-md text-text-tertiary text-[20px]"
                  name="storefront"
                />
              </div>
            </div>
          </div>

          {/* Branch Offerings Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-2xs">
                <span className="w-2 h-2 rounded-full bg-primary-container" />
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Branch Offerings</h3>
              </div>
              <span className="font-caption text-caption text-primary bg-surface-tint-blue px-2 py-0.5 rounded-full font-semibold">
                {branchOfferings.hasProducts && branchOfferings.hasServices
                  ? 'Products & Services'
                  : branchOfferings.hasServices
                  ? 'Services Only'
                  : 'Products Only'}
              </span>
            </div>
            <p className="font-caption text-caption text-text-secondary leading-relaxed -mt-1">
              Select what is available at this specific branch. The branch catalogue and order workflows will adapt accordingly.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Products Option */}
              <div
                onClick={() => toggleBranchOffering('products')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2 ${
                  !businessOfferings.hasProducts
                    ? 'border-border-subtle bg-surface-subtle opacity-50 cursor-not-allowed'
                    : branchOfferings.hasProducts
                    ? 'border-primary bg-surface-tint-blue/40 shadow-sm'
                    : 'border-border-subtle bg-surface-subtle hover:border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    branchOfferings.hasProducts && businessOfferings.hasProducts
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-text-tertiary'
                  }`}>
                    <Icon name="inventory_2" className="text-[18px]" />
                  </div>
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    branchOfferings.hasProducts && businessOfferings.hasProducts
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-border-subtle'
                  }`}>
                    {branchOfferings.hasProducts && businessOfferings.hasProducts && (
                      <Icon name="check" className="text-[13px]" />
                    )}
                  </span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md text-text-primary font-bold">Products</h4>
                  <p className="font-caption text-caption text-text-secondary mt-0.5 line-clamp-2">
                    Goods, stock &amp; physical retail catalogue.
                  </p>
                </div>
              </div>

              {/* Services Option */}
              <div
                onClick={() => toggleBranchOffering('services')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2 ${
                  !businessOfferings.hasServices
                    ? 'border-border-subtle bg-surface-subtle opacity-50 cursor-not-allowed'
                    : branchOfferings.hasServices
                    ? 'border-primary bg-surface-tint-blue/40 shadow-sm'
                    : 'border-border-subtle bg-surface-subtle hover:border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    branchOfferings.hasServices && businessOfferings.hasServices
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-text-tertiary'
                  }`}>
                    <Icon name="design_services" className="text-[18px]" />
                  </div>
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    branchOfferings.hasServices && businessOfferings.hasServices
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-border-subtle'
                  }`}>
                    {branchOfferings.hasServices && businessOfferings.hasServices && (
                      <Icon name="check" className="text-[13px]" />
                    )}
                  </span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md text-text-primary font-bold">Services</h4>
                  <p className="font-caption text-caption text-text-secondary mt-0.5 line-clamp-2">
                    Appointments, treatments &amp; packages.
                  </p>
                </div>
              </div>
            </div>

            {(!businessOfferings.hasProducts || !businessOfferings.hasServices) && (
              <div className="p-2.5 rounded-lg bg-surface-subtle flex items-center gap-2 text-caption font-caption text-text-secondary">
                <Icon name="info" className="text-[16px] text-primary shrink-0" />
                <span>
                  {!businessOfferings.hasServices
                    ? 'Enable Services on your Business Profile to offer services at this branch.'
                    : 'Enable Products on your Business Profile to sell products at this branch.'}
                </span>
              </div>
            )}
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-2xs">
                <span className="w-2 h-2 rounded-full bg-primary-container" />
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Physical Location &amp; Address</h3>
              </div>
              <span className="font-caption text-caption text-primary-container bg-badge-discount-bg px-space-xs py-0.5 rounded-full font-medium">
                GPS Linked
              </span>
            </div>
            <div className="flex flex-col gap-space-sm">
              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="branch-street">
                  Street / Building Address
                </label>
                <input
                  className="w-full h-[52px] px-space-md rounded-[14px] bg-surface-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-canvas"
                  defaultValue={sample('Plot 742, Tafawa Balewa Way, Area 11')}
                  id="branch-street"
                  placeholder="e.g. Suite 4B, Garki Mall, Area 11"
                  type="text"
                  value={street}
                  onChange={(event) => setStreet(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="branch-landmark">
                  Landmark / Floor
                </label>
                <input
                  className="w-full h-[52px] px-space-md rounded-[14px] bg-surface-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-canvas"
                  defaultValue={sample('Directly opposite Area 11 Post Office, Wing B')}
                  id="branch-landmark"
                  placeholder="e.g. Opposite National Hospital, Ground Floor"
                  type="text"
                />
              </div>
              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="branch-district">
                  City / District
                </label>
                <input
                  className="w-full h-[52px] px-space-md rounded-[14px] bg-surface-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-canvas"
                  defaultValue={sample('Abuja Municipal • Garki District, FCT')}
                  id="branch-district"
                  placeholder="e.g. Abuja Municipal • Garki District"
                  type="text"
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                />
              </div>
            </div>
            <div className="relative w-full rounded-xl overflow-hidden bg-surface-container shadow-sm flex flex-col">
              <div
                aria-label={BRANCH_IMAGES[0].alt}
                className="w-full h-36 bg-cover bg-center"
                role="img"
                style={live ? undefined : { backgroundImage: `url('${BRANCH_IMAGES[0].src}')` }}
              />
              <div className="p-space-sm bg-surface-canvas flex items-center justify-between">
                <div className="flex items-center gap-space-xs min-w-0">
                  <Icon name="pin_drop" className="text-primary-container text-[20px] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-text-primary truncate">
                      {live ? 'Location' : '9.0348° N, 7.4891° E'}
                    </span>
                    <span className="font-caption text-caption text-text-tertiary">
                      {live ? 'Pinned from the address you enter' : 'Pinned with ±3m accuracy'}
                    </span>
                  </div>
                </div>
                <button
                  className="h-9 px-space-sm rounded-lg bg-surface-tint-blue text-primary font-button-secondary text-button-secondary active:scale-95 transition-transform flex items-center gap-1 shrink-0"
                  type="button"
                >
                  <Icon name="edit_location" className="text-[16px]" />
                  Change GPS
                </button>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center gap-space-2xs">
              <span className="w-2 h-2 rounded-full bg-primary-container" />
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Branch Contact Information</h3>
            </div>
            <div className="flex flex-col gap-space-sm">
              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="branch-phone">
                  Branch Phone Number
                </label>
                <div className="flex gap-space-xs">
                  <div className="h-[52px] px-space-sm bg-surface-subtle rounded-[14px] flex items-center gap-1 shrink-0 text-text-primary font-label-md">
                    <span>🇳🇬</span>
                    <span className="font-medium">+234</span>
                    <Icon name="keyboard_arrow_down" className="text-[18px] text-text-tertiary" />
                  </div>
                  <input
                    className="flex-1 h-[52px] px-space-md rounded-[14px] bg-surface-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-canvas"
                    defaultValue={sample('809 111 4455')}
                    id="branch-phone"
                    placeholder="801 234 5678"
                    type="tel"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="branch-email">
                  Branch Direct Email
                </label>
                <div className="relative flex items-center">
                  <input
                    className="w-full h-[52px] px-space-md rounded-[14px] bg-surface-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-canvas"
                    defaultValue={sample('garki.store@urbangrill.ng')}
                    id="branch-email"
                    placeholder="e.g. garki@urbangrill.ng"
                    type="email"
                  />
                  <Icon
                    className="absolute right-space-md text-text-tertiary text-[20px]"
                    name="alternate_email"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="flex flex-col gap-space-2xs">
              <div className="flex items-center gap-space-2xs">
                <span className="w-2 h-2 rounded-full bg-primary-container" />
                <h3 className="font-heading-sm text-heading-sm text-text-primary">
                  Person in Charge / Branch Lead
                </h3>
              </div>
              <p className="font-caption text-caption text-text-secondary">
                Who manages orders, customer inquiries, and voucher redemptions at this branch?
              </p>
            </div>
            <div className="flex flex-col gap-space-2xs">
              <span className="font-label-sm text-label-sm text-text-secondary">Suggested Title</span>
              <div className="flex items-center gap-space-xs overflow-x-auto pb-1 no-scrollbar">
                {ROLE_PILLS.map((title) => (
                  <button
                    key={title}
                    className={`role-pill shrink-0 px-space-sm h-9 rounded-full font-button-secondary text-[13px] active:scale-95 transition-all ${
                      role === title ? 'bg-surface-tint-blue text-primary' : 'bg-surface-subtle text-text-secondary'
                    }`}
                    type="button"
                    onClick={() => setRole(title)}
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="lead-role">
                Role / Title Title
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full h-[52px] px-space-md rounded-[14px] bg-surface-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-canvas"
                  id="lead-role"
                  placeholder="e.g. Branch Manager, Store Lead, Supervisor"
                  type="text"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                />
                <Icon className="absolute right-space-md text-text-tertiary text-[20px]" name="badge" />
              </div>
            </div>
            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="lead-name">
                Full Name
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full h-[52px] px-space-md rounded-[14px] bg-surface-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-canvas"
                  defaultValue={sample('Chidinma Okafor')}
                  id="lead-name"
                  placeholder="e.g. Chidinma Okafor"
                  type="text"
                />
                <Icon className="absolute right-space-md text-text-tertiary text-[20px]" name="person_pin" />
              </div>
            </div>
            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="lead-email">
                Direct Email Address
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full h-[52px] px-space-md rounded-[14px] bg-surface-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-canvas"
                  defaultValue={sample('chidinma@urbangrill.ng')}
                  id="lead-email"
                  placeholder="e.g. chidinma@urbangrill.ng"
                  type="email"
                />
                <Icon className="absolute right-space-md text-text-tertiary text-[20px]" name="mail" />
              </div>
            </div>
            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="lead-phone">
                Direct Phone / WhatsApp Number
              </label>
              <div className="flex gap-space-xs">
                <div className="h-[52px] px-space-sm bg-surface-subtle rounded-[14px] flex items-center gap-1 shrink-0 text-text-primary font-label-md">
                  <span>🇳🇬</span>
                  <span className="font-medium">+234</span>
                  <Icon name="keyboard_arrow_down" className="text-[18px] text-text-tertiary" />
                </div>
                <input
                  className="flex-1 h-[52px] px-space-md rounded-[14px] bg-surface-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-canvas"
                  defaultValue={sample('803 762 9901')}
                  id="lead-phone"
                  placeholder="803 000 0000"
                  type="tel"
                />
              </div>
            </div>
            <div className="p-space-sm rounded-xl bg-surface-subtle flex items-center justify-between">
              <div className="flex flex-col pr-space-sm">
                <span className="font-label-md text-label-md text-text-primary">Grant dashboard access</span>
                <span className="font-caption text-caption text-text-secondary">
                  Allows managing vouchers, local menu &amp; reviews
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={grantAccess}
                  className="sr-only peer"
                  id="grant-access-toggle"
                  type="checkbox"
                  onChange={() => setGrantAccess((current) => !current)}
                />
                <div className="w-8 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-3.5 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all after:shadow-xs peer-checked:bg-primary" />
              </label>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-2xs">
                <span className="w-2 h-2 rounded-full bg-primary-container" />
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Operating Hours</h3>
              </div>
              <Icon name="schedule" className="text-text-tertiary text-[20px]" />
            </div>
            <OperatingHoursEditor
              customDays={customDayHours}
              customizeEnabled={customHours}
              dense
              standard={standardHours}
              onCustomDaysChange={setCustomDayHours}
              onCustomizeEnabledChange={setCustomHours}
              onStandardChange={setStandardHours}
            />
          </div>

          <div className="flex flex-col gap-space-sm pt-space-sm">
            <button
              className={`w-full h-[52px] rounded-[16px] text-on-primary font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs disabled:cursor-not-allowed disabled:active:scale-100 ${
                status === 'success' ? 'bg-badge-discount-text' : 'bg-primary-container'
              }`}
              disabled={status !== 'idle'}
              type="button"
              onClick={handleSave}
            >
              {status === 'idle' && (
                <>
                  <span>Save &amp; Continue to Checkout</span>
                  <Icon name="arrow_forward" className="text-[18px]" />
                </>
              )}
              {status === 'publishing' && (
                <>
                  <span className="w-5 h-5 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                  <span>Saving Location...</span>
                </>
              )}
              {status === 'success' && (
                <>
                  <Icon name="check_circle" className="text-[20px]" />
                  <span>Location Saved</span>
                </>
              )}
            </button>
            <p className="font-caption text-caption text-text-secondary text-center leading-relaxed px-space-md">
              Each additional location costs {formatNaira(getLocationPricing().pricePerAdditionalLocation)} under our pricing model (one-time fee). Enabling services later does not incur another location fee.
            </p>
            <button
              className="w-full h-[44px] flex items-center justify-center text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary active:opacity-75 transition-opacity"
              type="button"
              onClick={onBack}
            >
              Cancel &amp; Return to Locations
            </button>
          </div>
        </div>
      </div>
      {error && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-inverse-on-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {error}
        </div>
      )}
    </AppScreen>
  );
}
