import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { MerchantPortalChrome } from './MerchantPortalChrome';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopBusinessProfilePreviewStudioScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onPreviewStorefront?: () => void;
}

interface Amenity {
  icon: string;
  label: string;
}

const AMENITIES: Amenity[] = [
  { icon: 'restaurant', label: 'Dine-In' },
  { icon: 'takeout_dining', label: 'Takeaway' },
  { icon: 'moped', label: 'Delivery' },
  { icon: 'wifi', label: 'Free Wi-Fi' },
  { icon: 'local_parking', label: 'Valet Parking' },
  { icon: 'accessible', label: 'Wheelchair Acc.' },
  { icon: 'deck', label: 'Outdoor Patio' },
  { icon: 'credit_card', label: 'POS Card' },
  { icon: 'bolt', label: 'Instant Transfer' },
  { icon: 'payments', label: 'Cash Accepted' },
];

const TRUST_ITEMS: Array<{ icon: string; label: string; value: string; note: string }> = [
  { icon: 'domain', label: 'Corporate Affairs Commission', value: 'RC-1849204 Verified', note: 'Active Registry' },
  { icon: 'fingerprint', label: 'Director Biometrics & NIN', value: 'M. Danladi (NIN-***402)', note: 'Biometric Match 100%' },
  { icon: 'receipt_long', label: 'Tax Clearance (FIRS TIN)', value: 'TIN: 2489-0193-8812', note: '2025 Clearance Valid' },
  { icon: 'shield', label: 'Privacy Framework', value: 'NDPR Certified Audit', note: 'Compliant Data Handling' },
];

const PREVIEW_ITEMS: Array<{ image: string; alt: string; name: string; note: string; price: string }> = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCsu-42vJtM8J2D6NcjVHqeS-uJURXLde70839g0XHv64mrR9i1Tyb19w-ZdGiAxEEI4sOtd4DVOEOPmotYv9pmB8WEGrhS3sO1xpdg1JVJpAeZF3Aev6cetT9cHpcpdl_-m4Kyv3PXZ3b8GqZkR4eENfu93U0Am4r7td8U_pniN7iJu6yASWDoPJgt33iVcpBWba2rc8IIcSXOOgE9EvPBVh3U77koc2kPkQG7OvHwoY0qg4Uw5YypoQ',
    alt: 'Succulent roasted spicy smoked goat meat Asun ribs garnished with spring onions and red pepper flakes',
    name: 'Smoked Asun Ribs',
    note: 'Spicy dry rub • Woodfire',
    price: '₦9,500',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCxdlU5FjMbrmO1cJ1MdLLT3f7k7b2hmjxts-rvVqf3YwjBSJpRQzAM928iR6W6WiDGV1i6WacNhx0qWgd3M28oUXbVpLBqjm6X0ARqFlpe0MR4Q0YcI8pGe-aCxON8PE97I1tL_upkip7SjLfYChI268GKtMys8KyV6VpR0inqkaKw620JUysox3Bw7VWEVXyPpPvLpoX1opWm8lFC0bujllSs7I-7KA9T6NgVs7Lo5qMOMZOuqXjRfQ',
    alt: 'Nigerian gourmet truffle infused smokey jollof rice with jumbo tiger prawns and roasted plantain slices',
    name: 'Truffle Jollof & Prawns',
    note: 'Firewood flavor • Dodo',
    price: '₦7,200',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuClhheRKRPsM3ORVi-smuR3271cRBH-oXf53rsPSZZ2ECjnby5Tve6aYoy73W_p6IPenYmKarhAWrsefN4pMEP65dGyZY8o6RQQGH3gtSt11MuLVIZGOJ215aod0DRvbLWG4XwyTSWsxiAzrgf5mQdNo0y520nwuKo2ZzP7K-zslTdNMD2jXHGDONiCyN9RLeHqUr5hy2CrHhF9d2q65GJf6pBR0FnTTJB_SNqU9vWN8fzi1tEoFEA2bw',
    alt: 'Deep ruby red Hibiscus Zobo Sangria mocktail in an elegant ribbed glass with orange wheels, fresh mint, and cinnamon stick garnish',
    name: 'Zobo Craft Sangria',
    note: 'Fresh hibiscus • Citrus mocktail',
    price: '₦3,800',
  },
];

export function DesktopBusinessProfilePreviewStudioScreen({
  onNav,
  onPreviewStorefront,
}: DesktopBusinessProfilePreviewStudioScreenProps) {
  const [activeAmenities, setActiveAmenities] = useState<string[]>(AMENITIES.map((a) => a.label));
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [copied, setCopied] = useState(false);

  const toggleAmenity = (label: string) =>
    setActiveAmenities((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]));

  const copySubdomain = () => {
    navigator.clipboard?.writeText('https://urbangrill.vem.store');
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const saveChanges = () => {
    if (saveState !== 'idle') return;
    setSaveState('saving');
    window.setTimeout(() => {
      setSaveState('saved');
      window.setTimeout(() => setSaveState('idle'), 1800);
    }, 800);
  };

  return (
    <MerchantPortalChrome activeNav="settings" onNav={onNav}>
      <div className="w-full py-space-lg flex flex-col gap-space-xl">
        {/* Top Context & Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-space-2xs text-text-tertiary font-caption text-caption">
              <button type="button" onClick={() => onNav('overview')} className="hover:text-primary cursor-pointer transition-colors">Home</button>
              <Icon name="chevron_right" className="text-[14px]" />
              <button type="button" onClick={() => onNav('overview')} className="hover:text-primary cursor-pointer transition-colors">Business Hub</button>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="text-text-primary font-medium">Business Profile &amp; Preview</span>
            </div>
            <div className="flex items-center gap-space-sm mt-1">
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Business Profile &amp; Public Preview Studio</h1>
              <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high text-primary font-caption text-caption font-semibold flex items-center gap-1">
                <Icon name="verified" className="text-[14px]" filled />
                Tier 3 Verified
              </span>
            </div>
            <p className="font-body-md text-body-md text-text-secondary max-w-3xl">
              Manage your verified merchant identity, brand visuals, contact hotlines, customer amenities, and preview the
              live public web storefront.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm flex-shrink-0">
            <button
              type="button"
              className="h-[44px] px-space-md rounded-xl bg-surface-canvas text-text-primary font-button-secondary text-button-secondary hover:bg-surface-container-low transition-all shadow-sm flex items-center gap-space-xs"
            >
              <Icon name="edit" className="text-[18px]" />
              <span>Edit Profile Details</span>
            </button>
            <button
              type="button"
              onClick={onPreviewStorefront}
              className="h-[44px] px-space-md rounded-xl bg-surface-tint-blue text-primary font-button-secondary text-button-secondary hover:bg-secondary-container transition-all flex items-center gap-space-xs"
            >
              <span>Preview Public Storefront</span>
              <Icon name="open_in_new" className="text-[18px]" />
            </button>
            <button
              type="button"
              onClick={saveChanges}
              className="h-[44px] px-space-lg rounded-xl bg-primary-container text-on-primary-container font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] hover:opacity-95 active:scale-95 transition-all flex items-center gap-space-xs"
            >
              <Icon name={saveState === 'saving' ? 'progress_activity' : saveState === 'saved' ? 'done_all' : 'save'} className={`text-[18px] ${saveState === 'saving' ? 'animate-spin' : ''}`} />
              <span>{saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved Successfully' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Main Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* Left Column (Configuration & Identity) */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* 1. Cover & Brand Identity Card */}
            <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] overflow-hidden">
              <div className="p-space-lg flex items-center justify-between pb-0">
                <div className="flex items-center gap-space-xs">
                  <Icon name="badge" className="text-primary text-[22px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Cover &amp; Brand Identity</h2>
                </div>
                <span className="font-caption text-caption text-text-tertiary">Merchant ID: #4082</span>
              </div>
              <div className="p-space-lg flex flex-col gap-space-lg">
                <div className="relative w-full aspect-[16/7] rounded-xl overflow-hidden group">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt="Sophisticated modern grill restaurant interior with dark oak wood tables, warm amber ambient strip lights, stainless steel open kitchen, clean architecture, cinematic lighting, ultra sharp focus"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXkpStKZGEaRSBhcdBylyfs1abZ2bDsUnGvuADtcSnD-qjIUZ51WfofWRXC3Upo7QEorP4ymqDYZP0xgUfrXNvljqX8KmO3BHwSV-yZqtvtIsGHEResllrRNckDeKMvXDaLXzp4ck64P7eEIvr_VCUBfUom7p2_UcJ-97BabQZ0Of6xxqB6PVPx2hLNsb7PfMw6j2PgSvxytV2jYVdZ3778iMYnx_rksJznfYqjKpDRBJjjR_d-OeitA"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <button
                    type="button"
                    className="absolute top-space-sm right-space-sm bg-surface-canvas/90 backdrop-blur-md hover:bg-surface-canvas text-text-primary px-space-sm py-1.5 rounded-lg font-label-sm text-label-sm shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <Icon name="photo_camera" className="text-[16px] text-primary" />
                    <span>Change Cover Photo</span>
                  </button>
                  <div className="absolute bottom-space-sm left-space-md text-surface-canvas flex items-center gap-space-xs">
                    <span className="px-space-xs py-0.5 rounded-md bg-black/40 backdrop-blur-sm font-caption text-caption">1920 × 840 px optimal</span>
                    <span className="font-caption text-caption text-white/80">• High-Res Brand Banner</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-space-md -mt-12 sm:-mt-14 px-space-xs">
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg p-1 bg-surface-canvas">
                      <img
                        className="w-full h-full rounded-full object-cover"
                        alt="Minimalist circular logo emblem for Urban Grill featuring clean typographic monogram with flame accent in royal blue and warm amber tones on clean background"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKk_SocM8tvSBVXvk7Whvl-0L5of8F7w3E4BBF8Q1bVMAGx9qkRMl4eLiF6APxGrlMZ2zMWfTG2Mar0N5FzVMCu0xEB6qDPeMfy4Bb6qgytyIu1BiYrrMeEf79P4ATsBzQ5LXPR5oGDAHF7wHh1FGL3rdenmJYjUr-hXFGMksgIAQEOnfIrHB2qDZ1HWdCGW4gwk5kerrpJ2Al-woLI5PvCrmYYBTsCdiZLTMAD4fl2FVMSZKv8c1L_g"
                      />
                    </div>
                    <button
                      type="button"
                      title="Change store logo"
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                    >
                      <Icon name="edit" className="text-[16px]" />
                    </button>
                  </div>
                  <div className="flex flex-col flex-grow">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <span className="font-heading-md text-heading-md text-text-primary tracking-tight">Urban Grill &amp; Bistro</span>
                      <span title="VEMTAP Verified Merchant" className="flex items-center">
                        <Icon name="verified" className="text-primary text-[20px]" filled />
                      </span>
                      <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">Live Online</span>
                    </div>
                    <p className="font-label-sm text-label-sm text-text-secondary mt-0.5">Restaurant &amp; Grill • Casual Dining • Wuse II, Abuja</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-space-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-label-sm text-label-sm text-text-primary font-semibold" htmlFor="storefront-bio">Storefront Public Bio</label>
                    <span className="font-caption text-caption text-text-tertiary">138 / 250 characters</span>
                  </div>
                  <textarea
                    className="w-full rounded-xl bg-surface-subtle p-space-sm font-body-md text-body-md text-text-primary focus:bg-surface-canvas outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner"
                    placeholder="Tell customers about your kitchen, specialties, and experience..."
                    rows={3}
                    id="storefront-bio"
                    defaultValue="Premium casual dining and woodfire grill serving Lagos and Abuja. Famous for dry-aged steaks, artisan burgers, and handcrafted mocktails."
                  />
                  <span className="font-caption text-caption text-text-tertiary">
                    Visible on the consumer app header and local discovery search engine.
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Business Verification & Trust Card */}
            <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="verified_user" className="text-badge-discount-text text-[22px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Business Verification &amp; Trust</h2>
                </div>
                <div className="flex items-center gap-1.5 px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                  <span>Tier 3 Fully Compliant</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-2xs">
                {TRUST_ITEMS.map((item) => (
                  <div key={item.label} className="bg-surface-subtle p-space-sm rounded-xl flex items-start gap-space-xs">
                    <div className="w-8 h-8 rounded-lg bg-badge-discount-bg text-badge-discount-text flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon name={item.icon} className="text-[18px]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-caption text-caption text-text-tertiary">{item.label}</span>
                      <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate">{item.value}</span>
                      <span className="font-caption text-caption text-badge-discount-text flex items-center gap-1 mt-0.5">
                        <Icon name="check_circle" className="text-[13px]" /> {item.note}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Contact & Public Discovery Channels */}
            <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="contact_phone" className="text-primary text-[22px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Contact &amp; Public Discovery Channels</h2>
                </div>
                <span className="font-caption text-caption text-text-tertiary">Live On VEMTAP Network</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-2xs">
                <div className="md:col-span-2 flex flex-col gap-1.5 bg-surface-subtle p-space-md rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold">Storefront Subdomain URL</span>
                    <span className="font-caption text-caption text-badge-discount-text font-medium">SSL Active • Fast CDN</span>
                  </div>
                  <div className="flex items-center gap-space-xs bg-surface-canvas px-space-sm py-2 rounded-lg shadow-sm">
                    <Icon name="link" className="text-primary text-[18px]" />
                    <span className="font-body-md text-body-md text-text-primary font-medium flex-grow truncate">urbangrill.vem.store</span>
                    <button
                      type="button"
                      onClick={copySubdomain}
                      className={`px-space-xs py-1 rounded-md font-caption text-caption font-semibold transition-colors flex items-center gap-1 ${
                        copied ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-tint-blue text-primary hover:bg-secondary-container'
                      }`}
                    >
                      <Icon name={copied ? 'check' : 'content_copy'} className="text-[14px]" />
                      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="hotline-input">Official Hotline (Customer Calls)</label>
                  <div className="flex items-center gap-space-xs bg-surface-subtle px-space-sm py-2.5 rounded-xl">
                    <Icon name="call" className="text-primary text-[18px]" />
                    <input className="bg-transparent font-label-md text-label-md text-text-primary outline-none w-full" id="hotline-input" type="text" defaultValue="+234 803 900 2210" />
                    <span title="SMS Verified" className="flex items-center">
                      <Icon name="check_circle" className="text-badge-discount-text text-[16px]" filled />
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="email-input">Customer Desk Email</label>
                  <div className="flex items-center gap-space-xs bg-surface-subtle px-space-sm py-2.5 rounded-xl">
                    <Icon name="alternate_email" className="text-primary text-[18px]" />
                    <input className="bg-transparent font-label-md text-label-md text-text-primary outline-none w-full" id="email-input" type="email" defaultValue="contact@urbangrill.ng" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="instagram-input">Instagram Profile</label>
                  <div className="flex items-center gap-space-xs bg-surface-subtle px-space-sm py-2.5 rounded-xl">
                    <Icon name="photo_camera" className="text-text-secondary text-[18px]" />
                    <span className="font-label-sm text-label-sm text-text-tertiary">@</span>
                    <input className="bg-transparent font-label-md text-label-md text-text-primary outline-none w-full" id="instagram-input" type="text" defaultValue="urbangrillbistro" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="x-input">X (Formerly Twitter)</label>
                  <div className="flex items-center gap-space-xs bg-surface-subtle px-space-sm py-2.5 rounded-xl">
                    <Icon name="tag" className="text-text-secondary text-[18px]" />
                    <span className="font-label-sm text-label-sm text-text-tertiary">@</span>
                    <input className="bg-transparent font-label-md text-label-md text-text-primary outline-none w-full" id="x-input" type="text" defaultValue="urbangrill_ng" />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Storefront Amenities & Features */}
            <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="room_service" className="text-primary text-[22px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Storefront Amenities &amp; Features</h2>
                </div>
                <span className="font-caption text-caption text-text-tertiary">{activeAmenities.length} Configured Badges</span>
              </div>
              <p className="font-caption text-caption text-text-secondary">
                Toggle customer-facing facilities. Verified tags enhance your ranking in hyper-local category filters.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-space-xs pt-space-2xs">
                {AMENITIES.map((amenity) => {
                  const active = activeAmenities.includes(amenity.label);
                  return (
                    <button
                      key={amenity.label}
                      type="button"
                      onClick={() => toggleAmenity(amenity.label)}
                      className={`group flex flex-col items-center justify-center p-space-sm rounded-xl cursor-pointer transition-all shadow-sm text-center ${
                        active ? 'bg-surface-tint-blue' : 'bg-surface-subtle opacity-60'
                      }`}
                    >
                      <Icon name={amenity.icon} className={`text-[22px] mb-1 ${active ? 'text-primary' : 'text-text-tertiary'}`} />
                      <span className="font-label-sm text-label-sm text-text-primary font-medium">{amenity.label}</span>
                      <span className={`font-caption text-caption font-semibold mt-0.5 ${active ? 'text-primary' : 'text-text-tertiary'}`}>
                        {active ? 'Active' : 'Disabled'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (Live Storefront Preview & Collateral Deck) */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg sticky top-20">
            <div className="bg-surface-canvas rounded-2xl shadow-[0_12px_32px_-4px_rgba(13,37,76,0.08)] overflow-hidden flex flex-col">
              <div className="p-space-md bg-surface-subtle flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text animate-pulse" />
                  <span className="font-label-sm text-label-sm text-text-primary font-semibold">Live Public Web Preview</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-tertiary">
                  <Icon name="smartphone" className="text-[16px] text-primary" />
                  <span className="font-caption text-caption text-text-secondary">Mobile Diner View</span>
                </div>
              </div>

              <div className="p-space-md bg-surface flex justify-center">
                <div className="w-full max-w-[370px] bg-surface-canvas rounded-2xl shadow-xl overflow-hidden flex flex-col">
                  <div className="relative w-full aspect-[16/9] overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      alt="Plated gourmet grilled tomahawk steak with rosemary butter, smoke rising softly, artisan dark stone platter, high-end bistro ambiance"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoSQapBR2K8RNL6ubyOFZFCnRUASULyUP4tANm20iuQCWCbGYFdo94ic8yeos0Mk-suIrpeNGmDXvu8sy3pKN1f8R3mkHBWbucl3rYrhkOoQZEjFdE4xJrukbxCSOoIH419BIXyxcFluZj5I8VirElnAmvtZVlTFoRzx6v68KfTF_o0_ZeHxp_LkKQX2vC91jih0fnXUDgzO0Bmc5I4A-sxopmRetuxhnajr7u7ZmhIPSCwNFYrl6HSg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-sm">
                        15% OFF First Dine-In
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-caption text-caption flex items-center gap-1">
                      <Icon name="near_me" className="text-[12px] text-badge-discount-text" />
                      <span>0.4 km away</span>
                    </div>
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                      <div className="flex flex-col text-white">
                        <div className="flex items-center gap-1">
                          <span className="font-heading-sm text-heading-sm font-bold leading-tight">Urban Grill &amp; Bistro</span>
                          <Icon name="verified" className="text-primary-fixed text-[16px]" filled />
                        </div>
                        <span className="font-caption text-caption text-white/80">Wuse II, Abuja • Casual Dining</span>
                      </div>
                      <div className="w-10 h-10 rounded-full p-0.5 bg-surface-canvas shadow-md flex-shrink-0">
                        <img
                          className="w-full h-full rounded-full object-cover"
                          alt="Urban grill logo round avatar graphic crisp and punchy"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDC3oLgxrQwsFgRl45ahVDnCs70FyaPg4llGt-MyzspCw8sTDzP7a1RxVDSikrSyPRFFEnLVTFXgSp_Kq96a7x9-8EW2fYmU1H8gGUXpD_ALp_vnnAGBkJflFO5bLg7XuQz31AjRYs9VMZTBwoTHHlwaLJ822x6hUpZhYO62hHTVXK9-ureACHeBcbFQFHRmaFPl13iiyUrf_n6S5t885IoFGJGvS9Izps5te4mTBYMfm4QHBAAMl2npQ"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-space-sm flex flex-col gap-space-xs bg-surface-canvas">
                    <div className="flex items-center justify-between text-text-secondary">
                      <div className="flex items-center gap-1">
                        <Icon name="star" className="text-[16px] text-amber-500" filled />
                        <span className="font-label-sm text-label-sm text-text-primary font-bold">4.9</span>
                        <span className="font-caption text-caption text-text-tertiary">(142 reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                        <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold">Open Now</span>
                        <span className="font-caption text-caption text-text-tertiary">• Closes 11 PM</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      <button type="button" className="flex flex-col items-center justify-center py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container-low transition-colors text-text-primary">
                        <Icon name="directions" className="text-[18px] text-primary" />
                        <span className="font-caption text-caption font-medium mt-0.5">Directions</span>
                      </button>
                      <button type="button" className="flex flex-col items-center justify-center py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container-low transition-colors text-text-primary">
                        <Icon name="call" className="text-[18px] text-primary" />
                        <span className="font-caption text-caption font-medium mt-0.5">Call</span>
                      </button>
                      <button type="button" className="flex flex-col items-center justify-center py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container-low transition-colors text-text-primary">
                        <Icon name="menu_book" className="text-[18px] text-primary" />
                        <span className="font-caption text-caption font-medium mt-0.5">Full Menu</span>
                      </button>
                      <button type="button" className="flex flex-col items-center justify-center py-1.5 rounded-lg bg-badge-discount-bg text-badge-discount-text">
                        <Icon name="local_offer" className="text-[18px]" />
                        <span className="font-caption text-caption font-bold mt-0.5">3 Deals</span>
                      </button>
                    </div>

                    <div className="mt-space-2xs flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-text-primary font-bold">Signature Bites Today</span>
                        <span className="font-caption text-caption text-primary font-medium cursor-pointer">View 28 items</span>
                      </div>
                      {PREVIEW_ITEMS.map((item) => (
                        <div key={item.name} className="p-2 rounded-xl bg-surface-subtle flex items-center justify-between gap-space-xs">
                          <div className="flex items-center gap-space-xs min-w-0">
                            <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                              <img className="w-full h-full object-cover" alt={item.alt} src={item.image} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate">{item.name}</span>
                              <span className="font-caption text-caption text-text-tertiary">{item.note}</span>
                            </div>
                          </div>
                          <span className="font-label-sm text-label-sm text-primary font-bold flex-shrink-0">{item.price}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="mt-2 w-full h-[46px] rounded-xl bg-primary-container text-on-primary-container font-button-primary text-button-primary shadow-[0_8px_20px_-4px_rgba(6,108,244,0.3)] hover:opacity-95 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Icon name="bolt" className="text-[18px]" />
                      <span>Instant Table Tap &amp; Order</span>
                    </button>
                    <div className="text-center font-caption text-caption text-text-tertiary pb-1">
                      Powered by VEMTAP Instant NFC / QR Engine
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-space-sm bg-surface-subtle flex items-center justify-between text-text-secondary font-caption text-caption">
                <span className="flex items-center gap-1">
                  <Icon name="speed" className="text-[15px] text-badge-discount-text" />
                  0.4s Public Page Load Time
                </span>
                <button type="button" onClick={onPreviewStorefront} className="text-primary hover:underline font-semibold flex items-center gap-0.5">
                  <span>Open in browser tab</span>
                  <Icon name="arrow_forward" className="text-[14px]" />
                </button>
              </div>
            </div>

            {/* In-Store Physical Collateral Download Card */}
            <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="print" className="text-primary text-[22px]" />
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">In-Store Physical Materials</h3>
                </div>
                <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">Print Ready</span>
              </div>
              <p className="font-body-md text-body-md text-text-secondary">
                Generate customized vector PDF print kits calibrated with your dedicated store QR code and NFC tap
                parameters.
              </p>
              <div className="flex flex-col gap-space-xs">
                <div className="p-space-sm rounded-xl bg-surface-subtle flex items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                      <Icon name="qr_code_2" className="text-[20px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-primary font-semibold">Acrylic Counter Tent &amp; QR Standee</span>
                      <span className="font-caption text-caption text-text-tertiary">A5 / A6 Landscape • High Res CMYK (300 DPI)</span>
                    </div>
                  </div>
                  <button type="button" className="p-2 rounded-lg bg-surface-canvas hover:bg-surface-container-low text-primary shadow-sm transition-colors flex items-center gap-1 font-caption text-caption font-bold">
                    <Icon name="download" className="text-[16px]" />
                    <span className="hidden sm:inline">PDF</span>
                  </button>
                </div>
                <div className="p-space-sm rounded-xl bg-surface-subtle flex items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                      <Icon name="contactless" className="text-[20px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-text-primary font-semibold">Tabletop NFC Tap Discs (Pack of 20)</span>
                      <span className="font-caption text-caption text-text-tertiary">Circular 65mm Stickers with UV protective coating</span>
                    </div>
                  </div>
                  <button type="button" className="p-2 rounded-lg bg-surface-canvas hover:bg-surface-container-low text-primary shadow-sm transition-colors flex items-center gap-1 font-caption text-caption font-bold">
                    <Icon name="download" className="text-[16px]" />
                    <span className="hidden sm:inline">PDF</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-space-xs text-text-tertiary font-caption text-caption">
                <span>Includes brand logo, hex colors, and dine-in prompts</span>
                <button type="button" className="text-primary font-medium hover:underline flex items-center gap-1">
                  <span>Order Acrylic Hardware Kit</span>
                  <Icon name="chevron_right" className="text-[14px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MerchantPortalChrome>
  );
}
