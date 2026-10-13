import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface BusinessProfileManageScreenProps {
  onBack: () => void;
  onPreviewStorefront: () => void;
}

const COVER_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBp6rBry6k7jRuALLMX3HgZXGvqhtzZ_RWaMH2XTtAlrpg3owX0m2y22WAOXNTAgLc0QX3cH9RlVNxX-zngWF41Xyu3rYhudg_nsT1QuOXEQfmBadedCMN2lBJmXF5NuNSA9eK3HyXd0jJhd1lfpvnwIUdHApR6IkGaPJWM7wv_jMSsvR9XgaiHHfSHRTkNB9qO4r1xoCR4OjLK_ii8T7aV_6ukKFZ__LwSkCVT1aa_5Ie_1BUAAM5xvg';
const COVER_ALT =
  'A chic modern restaurant dining hall with warm ambient Edison bulbs, exposed wood beams, cozy velvet booth seating, polished brass cutlery on rich dark oak tables, and subtle background grill fire glow in Lagos Nigeria, photographed in warm golden-hour architectural style with deep shadows and vibrant textures.';
const LOGO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDQTOcBbqm-ewMAwKsOwDYezk7UGHK4W0l3XS2IEWoQ9z6y1vCvMTl4ex_eMJzJgKuTqxlsNGT-eMQ247dHsUnlj59wV__QeG9jYwUXezMoiVW9RJ6L9l-hWh5XGWdmklSs5a6F-LXxUTR2j3HeaUdwZ9xMrXQmS52OL6-_AiSsa6uzUSLL9uxEKgHN-ut3nycLGOujLm3ZMPCatyV2eBY2yId7qpmtBO_cX2z2c49Nec3nX01Xej1KqA';
const LOGO_ALT =
  'Modern geometric emblem logo for Urban Grill & Bistro featuring a stylized flame and fork silhouette in deep royal blue and warm amber gold, vector graphic on crisp white circular badge.';

const AMENITIES = [
  { key: 'dine-in', icon: 'restaurant', label: 'Dine-In' },
  { key: 'takeaway', icon: 'takeout_dining', label: 'Takeaway' },
  { key: 'delivery', icon: 'delivery_dining', label: 'Delivery' },
  { key: 'wifi', icon: 'wifi', label: 'Free Wi-Fi' },
  { key: 'valet', icon: 'local_parking', label: 'Valet Parking' },
  { key: 'wheelchair', icon: 'accessible', label: 'Wheelchair Accessible' },
  { key: 'outdoor', icon: 'deck', label: 'Outdoor Seating' },
  { key: 'pos', icon: 'credit_card', label: 'POS Card Payment' },
  { key: 'transfer', icon: 'sync_alt', label: 'Instant Transfer' },
  { key: 'cash', icon: 'payments', label: 'Cash Accepted' },
];

export function BusinessProfileManageScreen({ onBack, onPreviewStorefront }: BusinessProfileManageScreenProps) {
  const [amenityState, setAmenityState] = useState<Record<string, boolean>>(
    Object.fromEntries(AMENITIES.map((amenity) => [amenity.key, true])),
  );
  const [toast, setToast] = useState<string | null>(null);
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
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  const activeCount = AMENITIES.filter((amenity) => amenityState[amenity.key]).length;

  const handleSave = () => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast('Profile & amenities updated successfully!');
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go back"
              className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">Business Profile</h1>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              aria-label="More options"
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
              type="button"
            >
              <Icon name="more_vert" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full flex-1 pb-32">
        {/* Live strip */}
        <div className="px-margin pt-space-xs pb-space-sm flex items-center justify-between">
          <div className="flex items-center gap-space-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text animate-pulse" />
            <span className="font-label-sm text-label-sm text-text-secondary">Live on VEMTAP Network</span>
          </div>
          <button
            className="flex items-center gap-space-2xs px-space-sm py-1.5 rounded-full bg-surface-container-high hover:bg-surface-variant transition-colors text-primary font-label-sm text-label-sm active:scale-95"
            type="button"
            onClick={onPreviewStorefront}
          >
            <Icon name="visibility" className="text-[16px]" />
            <span>Public Preview</span>
          </button>
        </div>

        {/* Cover & Avatar */}
        <div className="relative w-full px-margin mb-space-lg">
          <div className="relative w-full h-44 rounded-xl overflow-hidden shadow-sm">
            <img alt={COVER_ALT} className="w-full h-full object-cover" src={COVER_IMG} />
            <div className="absolute inset-0 bg-gradient-to-t from-on-background/70 via-on-background/20 to-transparent" />
            <button
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-inverse-surface/85 backdrop-blur-md text-on-primary font-label-sm text-label-sm active:scale-95 transition-all shadow-md"
              type="button"
              onClick={() => showToast('Cover photo picker opened')}
            >
              <Icon name="photo_camera" className="text-[16px]" />
              <span>Change Cover</span>
            </button>
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md shadow-sm">
              <Icon name="storefront" className="text-[14px] text-badge-discount-text" />
              <span className="font-label-sm text-label-sm text-text-primary">Store #4082</span>
            </div>
          </div>
          <div className="relative -mt-11 ml-3 flex items-end justify-between">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-surface-canvas p-1 shadow-md">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  <img alt={LOGO_ALT} className="w-full h-full object-cover" src={LOGO_IMG} />
                </div>
              </div>
              <button
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md active:scale-90 transition-transform"
                type="button"
                onClick={() => showToast('Logo upload opened')}
              >
                <Icon name="edit" className="text-[15px]" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 pb-1">
              <div className="flex items-center gap-1 bg-badge-discount-bg text-badge-discount-text px-2.5 py-1 rounded-full">
                <Icon name="verified" filled className="text-[14px]" />
                <span className="font-label-sm text-label-sm">Active & Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="px-margin flex flex-col gap-space-xs mb-space-lg">
          <div className="flex items-center gap-space-2xs flex-wrap">
            <h2 className="font-heading-sm text-heading-sm text-text-primary font-bold tracking-tight">
              Urban Grill & Bistro
            </h2>
            <Icon name="verified" filled className="text-primary text-[20px]" />
          </div>
          <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm">
            <Icon name="restaurant" className="text-[14px]" />
            <span>Restaurant & Grill • Casual Dining</span>
          </div>
          <p className="font-body-md text-body-md text-text-secondary mt-1">
            Premium casual dining and woodfire grill serving Lagos and Abuja. Famous for dry-aged steaks, artisan
            burgers, and handcrafted mocktails.
          </p>
          <div className="grid grid-cols-2 gap-space-sm mt-space-sm">
            <button
              className="h-11 rounded-xl bg-surface-container-high text-primary hover:bg-surface-variant flex items-center justify-center gap-2 font-button-secondary text-button-secondary transition-all active:scale-[0.98]"
              type="button"
              onClick={onPreviewStorefront}
            >
              <Icon name="store" className="text-[18px]" />
              <span>Public Storefront</span>
              <Icon name="north_east" className="text-[16px]" />
            </button>
            <button
              className="h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center gap-2 font-button-primary text-button-primary shadow-[0_8px_20px_-4px_rgba(6,108,244,0.28)] hover:bg-primary-container active:scale-[0.98] transition-all"
              type="button"
              onClick={() => showToast('Profile editor opening…')}
            >
              <Icon name="tune" className="text-[18px]" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Trust & Verification */}
        <div className="px-margin mb-space-lg">
          <div className="rounded-xl p-space-md bg-surface-container-lowest shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-badge-discount-bg opacity-60 pointer-events-none" />
            <div className="flex items-start gap-space-sm relative z-10">
              <div className="w-10 h-10 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                <Icon name="gpp_good" filled className="text-[24px]" />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Business Verified</h3>
                  <span className="px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption">
                    Tier 3
                  </span>
                </div>
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  Your CAC registration (RC-1849204), government ID, and operating tax identity have been verified by
                  VEMTAP Trust & Safety.
                </p>
                <div className="flex items-center gap-4 mt-2 pt-2 text-text-tertiary font-caption text-caption flex-wrap">
                  <span className="flex items-center gap-1 text-badge-discount-text font-medium">
                    <Icon name="format_image_left" className="text-[14px]" />
                    ID Confirmed
                  </span>
                  <span className="flex items-center gap-1 text-badge-discount-text font-medium">
                    <Icon name="task_alt" className="text-[14px]" />
                    Tax Verified
                  </span>
                  <span className="flex items-center gap-1 text-badge-discount-text font-medium">
                    <Icon name="domain_verification" className="text-[14px]" />
                    CAC Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Channels */}
        <div className="px-margin mb-space-lg">
          <div className="flex items-center justify-between mb-space-xs">
            <h3 className="font-heading-sm text-heading-sm text-text-primary">Contact & Public Channels</h3>
            <button className="font-label-sm text-label-sm text-primary hover:underline" type="button" onClick={() => showToast('Channel manager opening…')}>
              Manage
            </button>
          </div>
          <div className="rounded-xl bg-surface-container-lowest p-space-sm shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-xs">
            <div className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                  <Icon name="phone" className="text-[18px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-caption text-caption text-text-tertiary">Official Phone</span>
                  <span className="font-body-md text-body-md text-text-primary font-medium truncate">
                    +234 803 900 2210
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-badge-discount-text bg-badge-discount-bg px-2 py-0.5 rounded-full shrink-0">
                <Icon name="check_circle" className="text-[13px]" />
                <span className="font-caption text-caption font-medium">Verified</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                  <Icon name="alternate_email" className="text-[18px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-caption text-caption text-text-tertiary">Customer Desk</span>
                  <span className="font-body-md text-body-md text-text-primary font-medium truncate">
                    contact@urbangrill.ng
                  </span>
                </div>
              </div>
              <Icon name="chevron_right" className="text-text-tertiary text-[18px]" />
            </div>
            <div className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                  <Icon name="language" className="text-[18px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-caption text-caption text-text-tertiary">VEMTAP Subdomain</span>
                  <span className="font-body-md text-body-md text-primary font-medium truncate">
                    urbangrill.vem.store
                  </span>
                </div>
              </div>
              <button
                className="p-1 text-text-secondary hover:text-primary active:scale-95"
                title="Copy link"
                type="button"
                onClick={() => navigator.clipboard?.writeText('https://urbangrill.vem.store').catch(() => {})}
              >
                <Icon name="content_copy" className="text-[18px]" />
              </button>
            </div>
            <div className="mt-space-xs pt-space-xs flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
                  type="button"
                >
                  <Icon name="photo_camera" className="text-[16px] text-tertiary" />
                  <span className="font-caption text-caption font-medium">@urbangrillbistro</span>
                </button>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
                  type="button"
                >
                  <Icon name="tag" className="text-[16px] text-primary" />
                  <span className="font-caption text-caption font-medium">@urbangrill_ng</span>
                </button>
              </div>
              <button
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-primary"
                type="button"
                onClick={() => showToast('Add social handle opened')}
              >
                <Icon name="add" className="text-[18px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="px-margin mb-space-2xl">
          <div className="flex items-center justify-between mb-space-xs">
            <div>
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Amenities & Features</h3>
              <p className="font-caption text-caption text-text-secondary">
                Tap features to toggle availability on your storefront
              </p>
            </div>
            <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-tint-blue text-primary font-semibold shrink-0">
              {activeCount} Active
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5 pt-1">
            {AMENITIES.map((amenity) => {
              const active = amenityState[amenity.key];
              return (
                <button
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-label-md text-label-md transition-all active:scale-95 ${
                    active ? 'bg-surface-tint-blue text-primary shadow-sm' : 'bg-surface-container text-text-secondary'
                  }`}
                  key={amenity.key}
                  type="button"
                  onClick={() => setAmenityState((current) => ({ ...current, [amenity.key]: !current[amenity.key] }))}
                >
                  <Icon name={amenity.icon} className="text-[16px]" />
                  <span>{amenity.label}</span>
                  <Icon name={active ? 'check_circle' : 'add_circle_outline'} filled={active} className="text-[16px]" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/95 backdrop-blur-md px-margin py-3 shadow-[0_-8px_24px_-4px_rgba(17,24,39,0.06)] flex items-center gap-space-sm">
        <button
          className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary active:scale-95 transition-all shrink-0"
          title="Discard Changes"
          type="button"
          onClick={onBack}
        >
          <Icon name="restart_alt" className="text-[20px]" />
        </button>
        <button
          className="flex-1 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center gap-2 font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] hover:bg-primary-container active:scale-[0.98] transition-all"
          type="button"
          onClick={handleSave}
        >
          <Icon name="check" className="text-[20px]" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-inverse-surface text-inverse-on-surface shadow-xl flex items-center gap-2 font-label-sm text-label-sm">
          <Icon name="check_circle" className="text-[18px] text-badge-discount-text" />
          <span>{toast}</span>
        </div>
      )}
    </AppScreen>
  );
}
