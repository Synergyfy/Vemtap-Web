import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface BusinessAddBranchScreenProps {
  onBack: () => void;
  onSaved: () => void;
}

type SaveStatus = 'idle' | 'publishing' | 'success';

const BRANCH_IMAGES = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ4oNLsYUf9Br4A5iKA59KHZakY3MRrc7bBDGsd_glZVtk4s1wTWhcdZaxG137hOnKGMm_9wDuvSa8fU7gkfH3CikSVi4XY7ZdUx0XcAEFJroZzxGDU0foYmc3Em1B5SAzrrnDFIMvRyQy5bio69Ibs_QkoSRTv7D_lrcRJm8yzrga6YrYlsUHR5RXFB-3shvjD_D3UieD9TXcOS2OczGRy5kOue5PTDjqXriwKV7A3jTwkZtVjwYFNA',
    alt: 'Garki Mall, Abuja, Nigeria',
  },
];

const ROLE_PILLS = ['Branch Manager', 'Head Chef', 'Store Supervisor', 'Salon Director', 'Lead Host'];

export function BusinessAddBranchScreen({ onBack, onSaved }: BusinessAddBranchScreenProps) {
  const [role, setRole] = useState('Branch Manager');
  const [grantAccess, setGrantAccess] = useState(true);
  const [customHours, setCustomHours] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');

  const handleSave = () => {
    if (status !== 'idle') return;
    setStatus('publishing');
    window.setTimeout(() => {
      setStatus('success');
      window.setTimeout(onSaved, 900);
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
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_2px_6px_rgba(0,85,196,0.2)]">
              <Icon name="person" className="text-on-primary text-[18px]" />
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
                  defaultValue="Garki District Flagship"
                  id="branch-name"
                  placeholder="e.g. Garki Branch, Victoria Island Annex"
                  type="text"
                />
                <Icon
                  className="absolute right-space-md text-text-tertiary text-[20px]"
                  name="storefront"
                />
              </div>
            </div>
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
                  defaultValue="Plot 742, Tafawa Balewa Way, Area 11"
                  id="branch-street"
                  placeholder="e.g. Suite 4B, Garki Mall, Area 11"
                  type="text"
                />
              </div>
              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="branch-landmark">
                  Landmark / Floor
                </label>
                <input
                  className="w-full h-[52px] px-space-md rounded-[14px] bg-surface-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-canvas"
                  defaultValue="Directly opposite Area 11 Post Office, Wing B"
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
                  defaultValue="Abuja Municipal • Garki District, FCT"
                  id="branch-district"
                  placeholder="e.g. Abuja Municipal • Garki District"
                  type="text"
                />
              </div>
            </div>
            <div className="relative w-full rounded-xl overflow-hidden bg-surface-container shadow-sm flex flex-col">
              <div
                aria-label={BRANCH_IMAGES[0].alt}
                className="w-full h-36 bg-cover bg-center"
                role="img"
                style={{ backgroundImage: `url('${BRANCH_IMAGES[0].src}')` }}
              />
              <div className="p-space-sm bg-surface-canvas flex items-center justify-between">
                <div className="flex items-center gap-space-xs min-w-0">
                  <Icon name="pin_drop" className="text-primary-container text-[20px] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-text-primary truncate">
                      9.0348° N, 7.4891° E
                    </span>
                    <span className="font-caption text-caption text-text-tertiary">Pinned with ±3m accuracy</span>
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
                    defaultValue="809 111 4455"
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
                    defaultValue="garki.store@urbangrill.ng"
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
                  defaultValue="Chidinma Okafor"
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
                  defaultValue="chidinma@urbangrill.ng"
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
                  defaultValue="803 762 9901"
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
                <div className="w-12 h-7 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-canvas after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-primary after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-container" />
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
            <div className="p-space-sm bg-surface-subtle rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container shrink-0">
                  <Icon name="calendar_today" className="text-[20px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-text-primary">Mon - Sun Standard</span>
                  <span className="font-caption text-caption text-text-secondary">8:00 AM – 10:00 PM (Daily)</span>
                </div>
              </div>
              <button
                className="font-button-secondary text-button-secondary text-primary-container active:opacity-75"
                type="button"
              >
                Edit
              </button>
            </div>
            <div className="flex items-center justify-between pt-space-2xs">
              <span className="font-label-sm text-label-sm text-text-secondary">Customize specific day hours</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={customHours}
                  className="sr-only peer"
                  type="checkbox"
                  onChange={() => setCustomHours((current) => !current)}
                />
                <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-canvas after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-primary after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container" />
              </label>
            </div>
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
                  <span>Save &amp; Add Branch Location</span>
                  <Icon name="arrow_forward" className="text-[18px]" />
                </>
              )}
              {status === 'publishing' && (
                <>
                  <span className="w-5 h-5 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                  <span>Publishing Branch...</span>
                </>
              )}
              {status === 'success' && (
                <>
                  <Icon name="check_circle" className="text-[20px]" />
                  <span>Branch Successfully Activated!</span>
                </>
              )}
            </button>
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
    </AppScreen>
  );
}
