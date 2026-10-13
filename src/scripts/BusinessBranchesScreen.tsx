import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

export interface BusinessBranch {
  id: string;
  name: string;
  subtitle: string;
  address: string;
  phone: string;
  hours: string;
  image: string;
  imageAlt: string;
  primary?: boolean;
}

interface BusinessBranchesScreenProps {
  onBack: () => void;
  onAddBranch: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  extraBranches?: BusinessBranch[];
}

const BRANCH_IMAGES = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtfIdm0PJVpxgX9T0BGdNmwL_60wcP11Yoi8jOWp41Is39-kA5h1AxEP8yQOtQIzODYy_k2YqsZO0uOUJmnPcLasfJ_qdstZ7MfQ8kj7mYUeBO1WpXVl0CA6ORZG4oNNcIgfFm8E6zy45GybxpJs9fMXxEaaEP9cRSSZ1ZPYm6K9w3LoHBAbrOP9WDmZquq2SJGqm4wDFlFI8aM5bpokbcVBhUPzllqqpzQeu-jNZaG0NzCXgs3t9zOA',
    alt: 'Vibrant modern restaurant interior of Urban Grill Bistro in Abuja with ambient warm ceiling pendant lights, contemporary wooden tables, plush dining chairs, and clean sleek architectural styling with gentle natural sunlight through large glass windows.',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANJsmk1CZ7kqu-LkWt0xVGy3vQvAAan2Uh7Ae-lqlm1Rb8RiLOXtVOsxfmEPOizvnkLCegPcvq3NuOtbzguW_cqVTZV7750yTTpjC89dxUFwN3hFP4roCjyXSypNYEmwIgel6-zKkx9izBn56_TuVnPMWYVUx2G_5Axi-hkLlDfm8UQlIel1tu2ulnv3nGiT3Vtm8zhh7UaXbbP83y0fenbLPpvzRNj0A7mbkLzZpE7qRna9LuP2INkg',
    alt: 'Cozy bistro cafe storefront in a bustling commercial mall with warm ambient terrace lighting, artisan coffee counter, chalkboard specials, and potted plants under crisp modern architectural illumination.',
  },
];

const SEED_BRANCHES: BusinessBranch[] = [
  {
    id: 'wuse',
    name: '1 — Wuse Branch',
    subtitle: 'Urban Grill & Bistro • Wuse 2, Abuja',
    address: 'Plot 1428 Adetokunbo Ademola Cres',
    phone: '+234 803 555 9821',
    hours: '· 8:00 AM – 10:00 PM (Mon–Sun)',
    image: BRANCH_IMAGES[0].src,
    imageAlt: BRANCH_IMAGES[0].alt,
    primary: true,
  },
  {
    id: 'garki',
    name: '2 — Garki Branch',
    subtitle: 'Urban Grill & Bistro • Area 11 Arcade, Garki',
    address: 'Suite 4B, Garki Mall',
    phone: '+234 803 555 9825',
    hours: '· 9:00 AM – 9:30 PM (Mon–Sat)',
    image: BRANCH_IMAGES[1].src,
    imageAlt: BRANCH_IMAGES[1].alt,
  },
];

export function BusinessBranchesScreen({
  onBack,
  onAddBranch,
  onNext,
  onSaveDraft,
  extraBranches,
}: BusinessBranchesScreenProps) {
  const [seedBranches] = useState<BusinessBranch[]>(SEED_BRANCHES);
  const [multiLocation, setMultiLocation] = useState(true);

  const branches = [...seedBranches, ...(extraBranches ?? [])];

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
            <h1 className="font-label-sm text-label-sm text-text-secondary line-clamp-1">Location Details</h1>
          </div>
          <div className="w-11 h-11 flex items-center justify-end">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_2px_6px_rgba(0,85,196,0.2)]">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-10">
        <div className="flex flex-col px-margin pt-space-xs gap-space-lg">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs bg-surface-container-high px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-label-sm text-label-sm text-secondary font-medium">Step 2 of 4</span>
              </div>
              <span className="font-label-sm text-label-sm text-primary font-semibold">60% Complete</span>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden flex">
              <div
                className="bg-primary-container h-full rounded-full transition-all duration-500"
                style={{ width: '60%' }}
              />
            </div>
            <div className="mt-space-2xs">
              <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                Your Business Locations
              </h2>
              <p className="font-body-md text-body-md text-text-secondary mt-1">
                Add your other locations so customers across different districts can discover them too. All branches
                are 🟢 Active during your free trial.
              </p>
            </div>
          </div>

          <div className="flex flex-col bg-surface-container-lowest rounded-xl p-space-md shadow-sm gap-space-xs border border-border-subtle">
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex flex-col gap-0.5 min-w-0">
                <h3 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">
                  Does your business have other locations?
                </h3>
                <label
                  className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1.5 mt-0.5 cursor-pointer"
                  htmlFor="multiLocationToggle"
                >
                  <Icon name="check_box" className="text-[18px] text-primary" />
                  <span className="">Yes, we operate in multiple locations</span>
                </label>
              </div>
              <div className="flex-shrink-0 pt-0.5">
                <button
                  aria-checked={multiLocation}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors relative flex items-center shadow-xs ${
                    multiLocation ? 'bg-primary-container' : 'bg-surface-container'
                  }`}
                  id="multiLocationToggle"
                  role="switch"
                  type="button"
                  onClick={() => setMultiLocation((current) => !current)}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-surface-canvas shadow-sm transition-transform flex items-center justify-center ${
                      multiLocation ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  >
                    <Icon name="check" className="text-primary text-[12px] font-semibold" />
                  </span>
                </button>
              </div>
            </div>
            <p className="font-caption text-caption text-text-secondary leading-relaxed pt-1 border-t border-border-subtle/80 mt-1">
              All locations remain active during your 30-day free trial. If unchecked, your primary location will be
              your sole operating branch.
            </p>
          </div>

          <div className="flex flex-col gap-space-md">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="flex flex-col bg-surface-container-lowest rounded-xl shadow-md p-space-md transition-all active:scale-[0.99]"
              >
                <div className="flex items-start gap-space-sm">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container shadow-inner">
                    <img className="w-full h-full object-cover" src={branch.image} alt={branch.imageAlt} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-heading-sm text-heading-sm text-text-primary truncate">
                        {branch.name}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {branch.primary && (
                          <span className="bg-primary-container text-on-primary font-label-sm text-label-sm px-2 py-0.5 rounded-full text-[11px] font-semibold">
                            Primary
                          </span>
                        )}
                        <span className="bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                          Active (Trial)
                        </span>
                      </div>
                    </div>
                    <p className="font-label-sm text-label-sm text-text-secondary truncate">{branch.subtitle}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 mt-space-sm pt-space-xs bg-surface-subtle p-space-sm rounded-lg">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Icon name="location_on" className="text-[17px] text-primary flex-shrink-0" />
                    <span className="font-caption text-caption truncate text-text-primary">{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Icon name="call" className="text-[17px] text-primary flex-shrink-0" />
                    <span className="font-caption text-caption text-text-primary">{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Icon name="schedule" className="text-[17px] text-badge-discount-text flex-shrink-0" />
                    <span className="font-caption text-caption text-text-primary font-medium">
                      Open today{' '}
                      <span className="font-normal text-text-secondary">{branch.hours}</span>
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-space-xs mt-space-sm">
                  <button
                    className="h-10 flex items-center justify-center gap-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high active:bg-surface-container-highest transition-colors text-text-primary font-button-secondary text-button-secondary"
                    type="button"
                  >
                    <Icon name="edit" className="text-[17px] text-secondary" />
                    <span className="">Edit Branch</span>
                  </button>
                  <button
                    className="h-10 flex items-center justify-center gap-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high active:bg-surface-container-highest transition-colors text-text-primary font-button-secondary text-button-secondary"
                    type="button"
                  >
                    <Icon name="event_available" className="text-[17px] text-secondary" />
                    <span className="">Manage Hours</span>
                  </button>
                </div>
              </div>
            ))}

            <button
              className="w-full rounded-xl bg-surface-tint-blue/70 hover:bg-surface-tint-blue active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs text-primary font-button-secondary text-button-secondary shadow-sm px-space-md"
              type="button"
              onClick={onAddBranch}
            >
              <div className="flex items-center gap-space-sm py-2 px-1 w-full">
                <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-xs flex-shrink-0">
                  <Icon name="add_business" className="text-[22px]" />
                </div>
                <div className="flex flex-col text-left flex-1 min-w-0">
                  <span className="font-button-secondary text-button-secondary font-semibold text-primary">
                    + Add Another Branch Location
                  </span>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    Opens branch setup form &amp; manager/lead contact assignment
                  </span>
                </div>
                <Icon name="chevron_right" className="text-primary text-[20px] flex-shrink-0" />
              </div>
            </button>
          </div>

          <div className="flex flex-col gap-space-xs mt-space-sm">
            <button
              className="w-full h-11 bg-surface-container-highest hover:bg-surface-container-high active:scale-[0.98] text-text-primary rounded-xl font-button-secondary text-button-secondary transition-all flex items-center justify-center gap-1.5"
              type="button"
              onClick={onSaveDraft}
            >
              <Icon name="save" className="text-[18px]" />
              <span>Save as Draft</span>
            </button>
            <button
              className="w-full h-[52px] bg-primary-container hover:bg-primary active:scale-[0.98] text-on-primary rounded-xl font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] flex items-center justify-center gap-2 transition-all"
              type="button"
              onClick={onNext}
            >
              <span>Continue to Products &amp; Services</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
            <p className="font-caption text-caption text-text-secondary text-center leading-normal px-space-md">
              You can add more locations anytime from your business settings.
            </p>
            <div className="flex items-center justify-center pt-space-xs">
              <span className="font-label-sm text-label-sm text-text-tertiary">
                Need custom territorial management?
              </span>
              <button
                className="font-label-sm text-label-sm text-primary font-semibold ml-1.5 hover:underline inline-flex items-center"
                type="button"
              >
                Contact Concierge <Icon name="chevron_right" className="text-[14px] ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
