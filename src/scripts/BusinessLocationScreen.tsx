import { useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import type { BusinessProfileDraft } from './BusinessOnboardingScreen';

interface BusinessLocationScreenProps {
  draft: BusinessProfileDraft;
  onBack: () => void;
  /** Hands the entered primary location (always free) back to the container. */
  onNext: (location: { street: string; landmark: string }) => void;
  onSaveDraft: () => void;
}

const MAP_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBmjVs8gDO3WsmZCR-YYN3Ek1V99E50oudSc3E8Oal2Tb49hl9cua5JrOor0bUZsDZJin5lRlCjVQTbPSm5Mv_iyuC1ZXDPYOrYuXGshhsNkgDmGs5y-S-lUWx1uB3VcnGINvQKUlkyfHFLb3Y9RuqVEChaJZ-TZMxe3VF4wkOCJSaXT9ShXegpGnOwkG9mjoOuSV8E99aIIvwmM9eNCnxuWd2LJszconq7Hk75oQ00ooDesuzYQ2d1hA';

export function BusinessLocationScreen({ draft, onBack, onNext, onSaveDraft }: BusinessLocationScreenProps) {
  const [search, setSearch] = useState('Plot 1428, Adetokunbo Ademola Crescent, Wuse 2');
  const [locating, setLocating] = useState(false);
  const [street, setStreet] = useState('Plot 1428, Adetokunbo Ademola Crescent, Wuse 2, Abuja');
  const [landmark, setLandmark] = useState('Opposite Cubana Suites, Ground Floor (Suite G-02)');
  const [toast, setToast] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const businessLabel = `${draft.name.trim() || 'Your Store'} (Main)`;

  const handleClearSearch = () => {
    setSearch('');
    searchRef.current?.focus();
  };

  const handleUseLocation = () => {
    if (locating) return;
    setLocating(true);
    setSearch('Locating current GPS coordinates...');
    window.setTimeout(() => {
      setSearch('Adetokunbo Ademola Cres, Wuse 2, Abuja 904101');
      setLocating(false);
    }, 600);
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
            <h1 className="font-label-sm text-label-sm text-text-secondary line-clamp-1">Location Details</h1>
          </div>
          <div className="w-11 h-11 flex items-center justify-end">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_2px_6px_rgba(0,85,196,0.2)]">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-8">
        <section className="px-margin pt-4 pb-2">
          <div className="flex items-center justify-between gap-space-sm mb-2">
            <div className="flex items-center gap-space-2xs">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-on-primary font-caption text-caption font-semibold">
                2
              </span>
              <span className="font-label-sm text-label-sm text-text-secondary">Step 2 of 4 • Business Location</span>
            </div>
            <span className="font-label-sm text-label-sm font-semibold text-primary">50% Complete</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: '50%' }} />
          </div>
        </section>

        <section className="px-margin pt-3 pb-4">
          <div className="flex items-center justify-between gap-space-sm">
            <h2 className="font-heading-sm text-heading-sm text-on-surface">Where is your business located?</h2>
            <span className="bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
              Primary · Free
            </span>
          </div>
          <p className="font-body-md text-body-md text-text-secondary mt-1">
            This is your primary business location — it's free and serves as your default. Customers use it to
            discover your business and redeem local offers near them.
          </p>
        </section>

        <section className="px-margin space-y-3">
          <div className="relative flex items-center">
            <div className="absolute left-4 flex items-center pointer-events-none text-primary">
              <Icon name="search" className="text-[22px]" />
            </div>
            <input
              className="w-full h-11 pl-12 pr-11 bg-surface-container-lowest text-on-surface rounded-xl shadow-sm text-body-md font-body-md placeholder:text-text-tertiary focus:outline-none focus:bg-surface-tint-blue transition-all"
              id="location-search-input"
              placeholder="Search street, landmark, or area..."
              ref={searchRef}
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button
              aria-label="Clear search input"
              className="absolute right-3.5 w-7 h-7 flex items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant hover:bg-surface-container transition-transform active:scale-90"
              type="button"
              onClick={handleClearSearch}
            >
              <Icon name="close" className="text-[16px]" />
            </button>
          </div>

          <button
              className={`w-full h-11 px-4 rounded-xl bg-surface-tint-blue active:bg-secondary-container text-primary flex items-center justify-between transition-all group ${
              locating ? 'opacity-75' : ''
            }`}
            type="button"
            onClick={handleUseLocation}
          >
            <div className="flex items-center gap-space-xs">
              <Icon className="text-[20px] text-primary group-hover:rotate-45 transition-transform" name="my_location" />
              <span className="font-label-md text-label-md font-semibold text-primary">Use current location</span>
            </div>
            <span className="font-caption text-caption text-primary flex items-center gap-0.5">
              GPS Ready
              <span className="w-2 h-2 rounded-full bg-badge-discount-text inline-block animate-pulse ml-1" />
            </span>
          </button>
        </section>

        <section className="px-margin mt-4">
          <div className="relative w-full h-[210px] rounded-2xl overflow-hidden shadow-sm bg-surface-container-high">
            <div
              aria-label="Wuse 2, Abuja, Nigeria"
              className="w-full h-full bg-cover bg-center"
              role="img"
              style={{ backgroundImage: `url('${MAP_IMG}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest/95 backdrop-blur-md shadow-md text-on-surface">
                <Icon className="text-[16px] text-tertiary-container" name="storefront" filled />
                <span className="font-label-sm text-label-sm font-semibold truncate max-w-[190px]">{businessLabel}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-surface-container-lowest/95 backdrop-blur-md shadow-md flex items-center justify-center text-text-secondary pointer-events-auto cursor-pointer active:scale-95 transition-transform">
                <Icon name="layers" className="text-[18px]" />
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-4">
              <div className="relative flex flex-col items-center animate-bounce duration-1000">
                <div className="px-2 py-1 rounded-md bg-inverse-surface text-inverse-on-surface shadow-lg mb-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-ping" />
                  <span className="font-caption text-caption font-semibold">Store Entrance</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-xl text-on-primary">
                  <Icon name="location_on" className="text-[24px]" filled />
                </div>
                <div className="w-3 h-1 rounded-full bg-black/40 blur-[1px] mt-0.5" />
              </div>
            </div>
            <div className="absolute bottom-3 inset-x-0 flex justify-center px-3 pointer-events-none">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-inverse-surface/90 backdrop-blur-md shadow-lg text-inverse-on-surface">
                <Icon className="text-[15px] text-primary-fixed-dim" name="touch_app" />
                <span className="font-caption text-caption font-medium">
                  Drag pin to adjust exact storefront entrance
                </span>
              </div>
            </div>
            <button
              aria-label="Recenter map"
              className="absolute right-3 bottom-12 w-9 h-9 rounded-xl bg-surface-container-lowest text-on-surface shadow-md flex items-center justify-center active:scale-90 transition-transform"
              type="button"
            >
              <Icon name="filter_center_focus" className="text-[18px]" />
            </button>
          </div>
        </section>

        <section className="px-margin mt-5">
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="hub" className="text-[17px]" />
                </div>
                <span className="font-heading-sm text-heading-sm text-on-surface">Territory Resolution</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                Auto-Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-xl bg-surface-subtle">
                <span className="font-caption text-caption text-text-tertiary block">Country</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[16px]">🇳🇬</span>
                  <span className="font-label-md text-label-md font-semibold text-on-surface">Nigeria</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-subtle">
                <span className="font-caption text-caption text-text-tertiary block">State / Region</span>
                <span className="font-label-md text-label-md font-semibold text-on-surface mt-0.5 block truncate">
                  FCT (Abuja)
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-subtle">
                <span className="font-caption text-caption text-text-tertiary block">City / Metro</span>
                <span className="font-label-md text-label-md font-semibold text-on-surface mt-0.5 block">
                  Abuja Municipal
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-subtle">
                <span className="font-caption text-caption text-text-tertiary block">District / Area</span>
                <span className="font-label-md text-label-md font-semibold text-primary mt-0.5 block">Wuse 2</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-tint-blue flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className="text-[16px] text-primary" name="insights" filled />
                  <span className="font-label-sm text-label-sm font-semibold text-primary">
                    District Cluster Assignment
                  </span>
                </div>
                <button aria-label="More cluster details" className="text-secondary hover:text-primary" type="button" onClick={() => showToast('Cluster #04 covers a 3km radius around Wuse Commercial Hub')}>
                  <Icon name="info" className="text-[16px]" />
                </button>
              </div>
              <div className="flex items-center justify-between bg-surface-container-lowest px-2.5 py-1.5 rounded-lg shadow-sm">
                <span className="font-label-sm text-label-sm font-semibold text-on-surface truncate">
                  Wuse Commercial Hub Cluster #04
                </span>
                <span className="font-caption text-caption text-primary font-semibold shrink-0 ml-1">Assigned</span>
              </div>
              <p className="font-caption text-caption text-text-secondary leading-tight mt-0.5">
                Customers browsing within this 3km retail radius will see your flash offers and tap-to-pay deals
                instantly.
              </p>
            </div>
          </div>
        </section>

        <section className="px-margin mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-heading-sm text-heading-sm text-on-surface">Storefront Details</span>
            <span className="font-caption text-caption text-text-secondary">Editable</span>
          </div>
          <div className="space-y-1">
            <label className="font-label-sm text-label-sm font-medium text-text-secondary" htmlFor="input-street">
              Street / Building Address
            </label>
            <div className="relative">
              <input
                className="w-full h-11 px-4 rounded-xl bg-surface-container-lowest text-on-surface shadow-sm font-body-md text-body-md focus:bg-surface-tint-blue focus:outline-none transition-all"
                id="input-street"
                type="text"
                value={street}
                onChange={(event) => setStreet(event.target.value)}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-badge-discount-text">
                <Icon name="check_circle" className="text-[18px]" />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="font-label-sm text-label-sm font-medium text-text-secondary" htmlFor="input-landmark">
              Landmark / Suite / Floor
            </label>
            <div className="relative">
              <input
                className="w-full h-11 px-4 rounded-xl bg-surface-container-lowest text-on-surface shadow-sm font-body-md text-body-md focus:bg-surface-tint-blue focus:outline-none transition-all"
                id="input-landmark"
                placeholder="e.g. Opposite City Mall, 2nd Floor"
                type="text"
                value={landmark}
                onChange={(event) => setLandmark(event.target.value)}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary">
                <Icon name="edit_note" className="text-[18px]" />
              </div>
            </div>
          </div>
        </section>

        <section className="px-margin mt-8 flex flex-col items-center gap-3">
          <button
            className="w-full h-11 rounded-2xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:bg-primary active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            type="button"
            onClick={() => onNext({ street, landmark })}
          >
            <span>Continue to Business Offerings</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>
          <button
            className="h-11 px-6 rounded-xl text-text-secondary hover:text-on-surface active:bg-surface-container-high transition-colors font-button-secondary text-button-secondary inline-flex items-center gap-1.5"
            type="button"
            onClick={onSaveDraft}
          >
            <Icon name="save" className="text-[18px]" />
            <span>Save as Draft</span>
          </button>
        </section>
      </div>
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
