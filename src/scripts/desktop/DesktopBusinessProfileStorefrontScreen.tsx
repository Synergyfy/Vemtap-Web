import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { SocialChannelPicker } from '../../components/SocialChannelPicker';
import { CreateWithAiButton } from '../../components/CreateWithAiButton';
import {
  CHANNEL_PLATFORMS,
  CHANNEL_PLATFORM_BY_ID,
  normalizeChannel,
  type ChannelPlatformId,
} from '../../utils/socialChannels';
import { MerchantWorkspaceChrome } from './MerchantWorkspaceChrome';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { AiPromptContext } from '../aiDesignAssistant';

interface DesktopBusinessProfileStorefrontScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onDiscard?: () => void;
}

interface Amenity {
  icon: string;
  label: string;
}

const SUBDOMAIN_URL = 'https://urbangrill.vem.store';

/** Brand facts displayed on this screen — also fed to the AI Design Assistant. */
const BRAND_NAME = 'Urban Grill & Bistro';
const BRAND_CATEGORY = 'Restaurant & Grill • Casual Dining';
const BRAND_LOCATION = 'Apo District, Abuja';
const BRAND_BIO =
  'Premium casual dining and woodfire grill serving Lagos and Abuja. Famous for dry-aged steaks, artisan burgers, and handcrafted mocktails.';

const COVER_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC0PQQfxDTofHlI00FS1HC4wUJUDM9-BkN5GPpucSwBUy8oaMxd3zTf3-l-HYw0S4Mc1kt8O0B8zX7uBFLn9h7Vk8p9QUkJWCxG3_a7w9aeZH4C4fsMaRPg1EFEkynHCr6CLR2Nn-68aWL_7qpz6_bav5QcQ3L0AiFEM44UCdjOfCJjQc5FiVRt4caFVbGYuIPcAhxFHtZFH--JVs1K5Ssj8ctR9wGscl2yQ8JIhzvp6idjOfEx4qS9XQ';
const COVER_ALT =
  'Warm rustic contemporary restaurant interior with ambient amber hanging filament bulbs, dark timber dining tables, polished marble bar, and woodfire grill in the background, high dynamic range editorial photography';
const AVATAR_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBDfUK0NYjTbvL-fyEpFLM125Dtz0p7cPuYTpLC6Pe0TfLOqu2vSw0hG5yt1ue5KKnRv-SzLC6_i-kuLFCkIcj0OoAPIyRJDFTn6EuiWBGX-7JAOKJQYvKzYjFDpin6oFYP0vbo7W_-jbPppCZCM_zagdkuShEn7EOUrNKzGSNLbLMKfXjxn71hRNYKAcRNQT2mPgOMVgfTtH9PQPbPgobcQM5S9HreJPOq8geDNX1OH9i-k3zqz-cGmQ';
const AVATAR_ALT =
  'Sophisticated artisanal grill logo with an intertwined modern fork and flame icon enclosed in minimalist circle with Urban Grill text, professional branding, vector styling on dark slate navy background';
const PHONE_HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD1fU7eTY9MR3HXcpsNoIqZHTk7-U5h9zQrptSGKAU0VgsnJh-HJO1pxabu1D75ECoMWGVyo0OkVOd8iQFwH_E0qNwELSZbLeCGNc0Kud6c6w50MvHqmm38xjAJ3abVowfJME6V2tO6E_WRsyRrDDgk89XWuqrCl7Revjj_MNcWu-lWixQUkrDhVu_wCXJJfowO6Rg8GNnSSCepoq5B2kDU9dwMQz5p6yTfEQ2EQOyCaM0va5G3i4QHLw';
const PHONE_HERO_ALT =
  'Woodfire grilled tomahawk steak sizzling on cast iron grill with roasted vegetables, rosemary and smoky ember lighting, luxury food styling';
const PHONE_AVATAR_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA5fU6736q1TZXbjhIn7oqQbX6ogYlaWxlAq_X71acWVk3w3_0rr_Kf4U4xZqYpdpJVJz1Jx-8VWX6UuIgl0_moe-GJkNS0l_NQuM_f8FgtHLTlWGlM0lNuzGOIpKub45dRWgU22JOJjHwC6odiYM9utcmVvrOHtrzLmER1Iwn3eXai7O3-A-yZEGazPTQMbu-VFxFbyDZjuazGP0u1jxtgASrr8LvbhXtdbnv_Bg2BrE4dig1INVX8Pg';
const PHONE_AVATAR_ALT =
  'Circular restaurant crest featuring gold and obsidian fork and flame insignia for Urban Grill, luxury bistro emblem';

const AMENITIES: Amenity[] = [
  { icon: 'restaurant', label: 'Dine-In' },
  { icon: 'takeout_dining', label: 'Takeaway' },
  { icon: 'two_wheeler', label: 'Delivery' },
  { icon: 'wifi', label: 'Free Wi-Fi' },
  { icon: 'local_parking', label: 'Valet Parking' },
  { icon: 'accessible', label: 'Accessible' },
  { icon: 'deck', label: 'Outdoor Deck' },
  { icon: 'point_of_sale', label: 'POS Terminal' },
  { icon: 'account_balance', label: 'Instant Bank' },
  { icon: 'payments', label: 'Cash Settled' },
];

interface TrustItem {
  icon: string;
  iconBoxClass: string;
  title: string;
  value: string;
  mono?: boolean;
  note: string;
}

const TRUST_ITEMS: TrustItem[] = [
  {
    icon: 'domain',
    iconBoxClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'CAC Registration',
    value: 'RC-1849204',
    mono: true,
    note: 'Corporate Affairs Registry Confirmed',
  },
  {
    icon: 'fingerprint',
    iconBoxClass: 'bg-surface-tint-blue text-primary-container',
    title: 'Biometric ID Verification',
    value: 'Director KYC Passed',
    note: 'NIN / BVN Encrypted Auth',
  },
  {
    icon: 'receipt_long',
    iconBoxClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Tax Clearance (FIRS)',
    value: 'TIN: 2489-0193-8812',
    mono: true,
    note: 'Validated through 2026',
  },
  {
    icon: 'lock',
    iconBoxClass: 'bg-surface-container-high text-primary',
    title: 'NDPR Privacy Compliance',
    value: 'Data Vault Active',
    note: 'Customer records masked',
  },
];

interface StorefrontChannel {
  id: string;
  platform: ChannelPlatformId;
  value: string;
  touched: boolean;
}

const STOREFRONT_CHANNELS: StorefrontChannel[] = [
  { id: 'instagram', platform: 'instagram', value: 'urbangrillbistro', touched: false },
  { id: 'x', platform: 'x', value: 'urbangrill_ng', touched: false },
];

interface FeaturedItem {
  image: string;
  alt: string;
  name: string;
  note: string;
  price: string;
}

const FEATURED_ITEMS: FeaturedItem[] = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDoDo9-xjvvynNZ09SA4efqQtT9k0iGVlEmsRnWFLGN0W-lCsx-G5hRPw-8JUrcC9vf-YV-KIj9mN3XDu5kHTepvb_gnmF_Vq2vV-4eX9PKlYl8A3uPIBDblbXsUg5DIGk5Qad7tqyHwlDWgN44TfyMsuDTYqog51MFTqpAhc1Xo89Bb2vERVKI9Kj7hV-Z4BHpd66gTuB7a8hoB7D3K42cjlgvzANl7pbt-2V3n8jABrJ59MUePSGaKQ',
    alt: 'Smoked goat meat asun ribs skewers seasoned with habanero peppers and onions, restaurant platter presentation',
    name: 'Smoked Asun Ribs',
    note: 'Woodfire slow-smoked',
    price: '₦9,500',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJPy25gujVWPCobNU5ipp4lq2-0sRZJi400vTxYERZzw4izrsJvcozkljDVWbBjjLXp8b1qIJMHa1rXUNQa2ikk_ytNOtNes1d-Lk44qyKQsiLOOBLARx6z92eJz5r05PMYCEiyJRSfHeyW0vCPJxD1GWnSb0sz8habfqQHn9ku4zhTuJAsMqZFxS4HVuwC7PXXhAFjxBMBZzUsAmuM-P3BG95ZTs7GMgz1M5f4kQfj9vql8h7C5Ed7A',
    alt: 'Gourmet jollof rice served in miniature iron pot topped with black summer truffle shavings and jumbo grilled tiger prawn',
    name: 'Truffle Jollof Pot',
    note: 'Smokey firewood blend',
    price: '₦7,200',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCjsZV-Oz_vPwqFM58-8EkiviqimA1zD-oP2c2f5Syn97Vc4IJVCquzg7xGRwtrM6N0ehMbmUeMs_39XBWqjL8x9tdy5dXLtPD82mhznEDV8Cfn1PDQDnAAolsWAATLghg3KVWc65m-wAxvc2ZKXMYbiB3lvUrBANIVV7Yew9oGv_wtFd0ZAQ96Mv4uYTyZIlpuGA_Ah4DDAbkGCmZyJeY4go74t5Kr2GHdGAIaENalFzW6BnI5d_ThnA',
    alt: 'Deep crimson chilled hibiscus zobo sangria cocktail with fresh orange wheels, mint garnish and cinnamon stick in crystal glassware',
    name: 'Zobo Sangria',
    note: 'Hibiscus, citrus & spice',
    price: '₦3,800',
  },
];

export function DesktopBusinessProfileStorefrontScreen({
  onNav,
  onDiscard,
}: DesktopBusinessProfileStorefrontScreenProps) {
  const [toastVisible, setToastVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  /** Brand facts shown on this screen — reused by the contextual AI prompts. */
  const aiProfileContext: AiPromptContext = {
    businessName: BRAND_NAME,
    category: BRAND_CATEGORY,
    location: BRAND_LOCATION,
    description: BRAND_BIO,
  };
  const [activeAmenities, setActiveAmenities] = useState<string[]>(AMENITIES.map((a) => a.label));
  const [channels, setChannels] = useState<StorefrontChannel[]>(STOREFRONT_CHANNELS);
  const [pickerOpen, setPickerOpen] = useState(false);
  const channelSeq = useRef(0);
  const toastTimer = useRef<number | undefined>(undefined);
  const copyTimer = useRef<number | undefined>(undefined);

  const usedPlatforms = channels.map((channel) => channel.platform);
  const allPlatformsAdded = usedPlatforms.length >= CHANNEL_PLATFORMS.length;

  const setChannelValue = (id: string, value: string) =>
    setChannels((prev) => prev.map((item) => (item.id === id ? { ...item, value, touched: true } : item)));

  const markChannelTouched = (id: string) =>
    setChannels((prev) => prev.map((item) => (item.id === id ? { ...item, touched: true } : item)));

  const addChannel = (platform: ChannelPlatformId) => {
    setPickerOpen(false);
    if (usedPlatforms.includes(platform)) return;
    setChannels((prev) => [...prev, { id: `${platform}-${channelSeq.current++}`, platform, value: '', touched: false }]);
  };

  const removeChannel = (id: string) =>
    setChannels((prev) => prev.filter((channel) => channel.id !== id));

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  const toggleAmenity = (label: string) =>
    setActiveAmenities((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]));

  const handleSave = () => {
    setToastVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastVisible(false), 5000);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(SUBDOMAIN_URL).catch(() => undefined);
    setCopied(true);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  const handlePreview = () => {
    window.open(SUBDOMAIN_URL, '_blank');
  };

  return (
    <MerchantWorkspaceChrome activeNav="business-profile" onNav={onNav}>
      <div className="w-full py-space-xl flex flex-col gap-space-xl">
        {/* Top Action Breadcrumb & Studio Header Deck */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg pb-space-xs">
          <div className="flex flex-col gap-space-2xs">
            <nav className="flex items-center gap-space-xs font-caption text-caption text-text-secondary">
              <button
                type="button"
                onClick={() => onNav('overview')}
                className="hover:text-primary-container cursor-pointer transition-colors"
              >
                Business Hub
              </button>
              <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
              <span className="hover:text-primary-container cursor-pointer transition-colors">Settings</span>
              <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
              <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                Business Profile &amp; Storefront
              </span>
            </nav>
            <div className="flex items-baseline gap-space-sm pt-space-xs">
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                Business Profile &amp; Public Storefront Studio
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                Live On Discovery
              </span>
            </div>
            <p className="font-body-md text-body-md text-text-secondary max-w-3xl">
              Manage your verified merchant identity, public branding, contact channels, and amenities visible to nearby
              consumers across Abuja and Lagos.
            </p>
          </div>
          <div className="flex items-center gap-space-sm self-start lg:self-end flex-shrink-0">
            <button
              type="button"
              onClick={onDiscard}
              className="px-space-md py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-dim font-label-md text-label-md text-text-secondary transition-colors"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-surface-canvas text-primary-container hover:bg-surface-tint-blue font-label-md text-label-md font-semibold shadow-sm transition-all"
            >
              <span>Preview Live Storefront</span>
              <Icon name="open_in_new" className="text-[17px]" />
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-space-lg py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary shadow-[0_8px_20px_-4px_rgba(6,108,244,0.35)] active:scale-[0.98] transition-all"
            >
              <Icon name="check" className="text-[18px]" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Notification Toast Banner */}
        <div
          className={`${
            toastVisible ? 'flex' : 'hidden'
          } w-full p-space-md rounded-xl bg-badge-discount-bg text-badge-discount-text items-center justify-between shadow-sm transition-all duration-300`}
        >
          <div className="flex items-center gap-space-sm">
            <Icon name="verified" className="text-[20px]" />
            <span className="font-label-md text-label-md font-medium">
              Merchant credentials and live public storefront successfully synchronized across Abuja cluster nodes.
            </span>
          </div>
          <button
            type="button"
            aria-label="Close notification"
            onClick={() => setToastVisible(false)}
            className="text-badge-discount-text hover:opacity-75"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        {/* Main 2-Column Responsive Layout (12 cols: 7 Left, 5 Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* LEFT COLUMN: Merchant Configuration (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Section 1: Cover & Brand Identity Card */}
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="storefront" className="text-primary-container text-[20px]" />
                  <h2 className="font-heading-sm text-heading-sm font-semibold text-text-primary">
                    Cover &amp; Brand Identity
                  </h2>
                </div>
                <span className="font-caption text-caption text-text-tertiary">Store ID #4082</span>
              </div>
              {/* Hero Cover Banner Container */}
              <div className="relative w-full h-52 rounded-xl overflow-hidden group bg-surface-container">
                <div
                  role="img"
                  aria-label={COVER_ALT}
                  className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${COVER_IMAGE}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-black/20" />
                <button
                  type="button"
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-canvas/90 backdrop-blur-md text-text-primary hover:bg-surface-canvas text-label-sm font-label-sm font-medium shadow-md transition-all"
                >
                  <Icon name="photo_camera" className="text-[16px] text-primary-container" />
                  <span>Change Cover Photo</span>
                </button>
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-inverse-surface/80 backdrop-blur-md text-surface-bright font-caption text-caption">
                  16:9 Display Aspect • Rec. 1920×1080
                </div>
              </div>
              {/* Avatar & Identifier Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-md -mt-10 sm:-mt-12 px-space-xs z-10">
                <div className="relative group">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-surface-canvas shadow-md">
                    <img className="w-full h-full rounded-full object-cover" alt={AVATAR_ALT} src={AVATAR_IMAGE} />
                  </div>
                  <button
                    type="button"
                    aria-label="Edit logo"
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary-container text-on-primary hover:bg-primary shadow transition-transform hover:scale-110"
                  >
                    <Icon name="edit" className="text-[16px]" />
                  </button>
                </div>
                <div className="flex flex-col pt-2 sm:pt-6">
                  <div className="flex items-center gap-2">
                    <span className="font-heading-sm text-heading-sm font-bold text-text-primary">
                      {BRAND_NAME}
                    </span>
                    <Icon name="verified" className="text-primary-container text-[20px]" filled />
                  </div>
                  <div className="flex items-center gap-space-xs font-caption text-caption text-text-secondary mt-0.5">
                    <span className="px-2 py-0.5 rounded-md bg-surface-container font-semibold text-text-primary">
                      {BRAND_LOCATION}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-badge-discount-text font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                      Active &amp; Verified
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-space-md gap-y-1">
                <CreateWithAiButton
                  aspectRatio="16/9"
                  assetType="banner"
                  context={aiProfileContext}
                  fileHint="16:9 Display Aspect • Rec. 1920×1080"
                />
                <CreateWithAiButton aspectRatio="square" assetType="logo" context={aiProfileContext} />
              </div>
              {/* Profile Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm font-semibold text-text-primary">Public Brand Name</label>
                  <div className="relative flex items-center">
                    <input
                      className="w-full h-[48px] px-3.5 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md focus:bg-surface-canvas focus:ring-2 focus:ring-primary-container outline-none transition-all"
                      type="text"
                      defaultValue={BRAND_NAME}
                    />
                    <Icon name="badge" className="absolute right-3 text-text-tertiary text-[18px]" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm font-semibold text-text-primary">
                    Primary Culinary Category
                  </label>
                  <div className="relative flex items-center">
                    <input
                      className="w-full h-[48px] px-3.5 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md focus:bg-surface-canvas focus:ring-2 focus:ring-primary-container outline-none transition-all"
                      type="text"
                      defaultValue={BRAND_CATEGORY}
                    />
                    <Icon name="restaurant" className="absolute right-3 text-text-tertiary text-[18px]" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="font-label-sm text-label-sm font-semibold text-text-primary">
                      Storefront Public Bio
                    </label>
                    <span className="font-caption text-caption text-text-tertiary">142 / 240 chars</span>
                  </div>
                  <textarea
                    className="w-full p-3.5 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md focus:bg-surface-canvas focus:ring-2 focus:ring-primary-container outline-none resize-none transition-all"
                    rows={3}
                    defaultValue={BRAND_BIO}
                  />
                  <p className="font-caption text-caption text-text-tertiary">
                    Visible at top of discovery feeds in Abuja &amp; Lagos consumer app searches.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Trust & Verification Dossier */}
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="verified_user" className="text-badge-discount-text text-[22px]" />
                  <h2 className="font-heading-sm text-heading-sm font-semibold text-text-primary">
                    Trust &amp; Verification Dossier
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center gap-1">
                  <Icon name="shield" className="text-[14px]" />
                  Tier 3 Enterprise Verified
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs">
                {TRUST_ITEMS.map((item) => (
                  <div key={item.title} className="p-space-sm rounded-xl bg-surface-subtle flex items-start gap-space-sm">
                    <div
                      className={`w-8 h-8 rounded-lg ${item.iconBoxClass} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon name={item.icon} className="text-[18px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm font-semibold text-text-primary">{item.title}</span>
                      <span
                        className={`font-caption text-caption text-text-secondary ${item.mono ? 'font-mono' : ''}`}
                      >
                        {item.value}
                      </span>
                      <span className="font-caption text-caption text-badge-discount-text flex items-center gap-0.5 mt-0.5">
                        <Icon name="done_all" className="text-[12px]" /> {item.note}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Contact & Discovery Channels */}
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="hub" className="text-primary-container text-[20px]" />
                  <h2 className="font-heading-sm text-heading-sm font-semibold text-text-primary">
                    Contact &amp; Public Discovery Channels
                  </h2>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setPickerOpen((open) => !open)}
                    disabled={allPlatformsAdded}
                    aria-haspopup="menu"
                    aria-expanded={pickerOpen}
                    className="text-primary-container font-label-sm text-label-sm font-semibold hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                  >
                    <Icon name="add" className="text-[16px]" /> Add Channel
                  </button>
                  {pickerOpen ? (
                    <SocialChannelPicker
                      used={usedPlatforms}
                      onSelect={addChannel}
                      onClose={() => setPickerOpen(false)}
                    />
                  ) : null}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {/* Official Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm font-semibold text-text-primary">
                    Customer Booking Hotline
                  </label>
                  <div className="relative flex items-center">
                    <Icon name="call" className="absolute left-3 text-text-tertiary text-[18px]" />
                    <input
                      className="w-full h-[48px] pl-10 pr-24 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md focus:bg-surface-canvas focus:ring-2 focus:ring-primary-container outline-none transition-all"
                      type="text"
                      defaultValue="+234 803 900 2210"
                    />
                    <span className="absolute right-2 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center gap-1">
                      <Icon name="check_circle" className="text-[12px]" /> Verified
                    </span>
                  </div>
                </div>
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm font-semibold text-text-primary">
                    Support &amp; Catering Email
                  </label>
                  <div className="relative flex items-center">
                    <Icon name="mail" className="absolute left-3 text-text-tertiary text-[18px]" />
                    <input
                      className="w-full h-[48px] pl-10 pr-3 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md focus:bg-surface-canvas focus:ring-2 focus:ring-primary-container outline-none transition-all"
                      type="email"
                      defaultValue="contact@urbangrill.ng"
                    />
                  </div>
                </div>
                {/* Subdomain */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-label-sm text-label-sm font-semibold text-text-primary">
                    Dedicated VEMTAP Web Storefront Link
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex items-center flex-1">
                      <Icon name="link" className="absolute left-3 text-text-tertiary text-[18px]" />
                      <input
                        className="w-full h-[48px] pl-10 pr-28 rounded-xl bg-surface-container text-text-primary font-body-md text-body-md font-mono outline-none select-all"
                        readOnly
                        type="text"
                        value={SUBDOMAIN_URL}
                      />
                      <span className="absolute right-3 px-2 py-0.5 rounded bg-surface-canvas font-caption text-caption text-badge-discount-text font-semibold">
                        SSL 256-Bit
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="h-[48px] px-4 rounded-xl bg-surface-subtle hover:bg-surface-tint-blue text-text-primary font-label-md text-label-md flex items-center gap-1.5 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Icon name="check" className="text-[18px] text-badge-discount-text" />
                          <span className="hidden sm:inline">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Icon name="content_copy" className="text-[18px] text-primary-container" />
                          <span className="hidden sm:inline">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {/* Social Handles */}
                {channels.map((channel) => {
                  const platform = CHANNEL_PLATFORM_BY_ID[channel.platform];
                  const result = normalizeChannel(channel.platform, channel.value);
                  const showError = channel.touched && channel.value.trim().length > 0 && !result.ok;
                  return (
                    <div key={channel.id} className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm font-semibold text-text-primary flex items-center gap-1.5">
                        {platform.label}
                        {result.ok ? <Icon name="check_circle" className="text-badge-discount-text text-[14px]" /> : null}
                      </label>
                      <div className="relative flex items-center">
                        <Icon name={platform.icon} className="absolute left-3 text-text-tertiary text-[18px]" />
                        <input
                          className={`w-full h-[48px] pl-10 pr-10 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md focus:bg-surface-canvas outline-none transition-all ${
                            showError ? 'ring-2 ring-error focus:ring-error' : 'focus:ring-2 focus:ring-primary-container'
                          }`}
                          type="text"
                          aria-invalid={showError}
                          aria-label={`${platform.label} ${platform.kind === 'phone' ? 'phone number' : 'handle'}`}
                          placeholder={platform.placeholder}
                          value={channel.value}
                          onBlur={() => markChannelTouched(channel.id)}
                          onChange={(event) => setChannelValue(channel.id, event.target.value)}
                        />
                        <button
                          type="button"
                          aria-label={`Remove ${platform.label}`}
                          onClick={() => removeChannel(channel.id)}
                          className="absolute right-2 w-7 h-7 flex items-center justify-center rounded-lg text-text-tertiary hover:text-error hover:bg-surface-container transition-colors"
                        >
                          <Icon name="delete" className="text-[16px]" />
                        </button>
                      </div>
                      {showError ? (
                        <span className="font-caption text-caption text-error flex items-center gap-1">
                          <Icon name="error" className="text-[13px]" />
                          {result.error}
                        </span>
                      ) : result.ok ? (
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-caption text-caption text-primary-container hover:underline flex items-center gap-1 min-w-0"
                        >
                          <Icon name="link" className="text-[13px] shrink-0" />
                          <span className="truncate">{result.display}</span>
                        </a>
                      ) : (
                        <span className="font-caption text-caption text-text-tertiary">{platform.hint}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Amenities & Store Features (10 Interactive Pills) */}
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="room_service" className="text-primary-container text-[20px]" />
                    <h2 className="font-heading-sm text-heading-sm font-semibold text-text-primary">
                      Amenities &amp; Store Features
                    </h2>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Toggle customer-facing capabilities displayed in nearby filter searches.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-surface-container font-caption text-caption font-semibold text-text-primary">
                  {activeAmenities.length} Active
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-space-xs">
                {AMENITIES.map((amenity) => {
                  const active = activeAmenities.includes(amenity.label);
                  return (
                    <button
                      key={amenity.label}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleAmenity(amenity.label)}
                      className={`cursor-pointer p-3 rounded-xl flex flex-col items-center justify-center gap-1 text-center transition-all ${
                        active ? 'bg-surface-tint-blue text-primary-container' : 'bg-surface-subtle text-text-tertiary'
                      }`}
                    >
                      <Icon name={amenity.icon} className="text-[20px]" />
                      <span className="font-label-sm text-label-sm font-semibold">{amenity.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Live Consumer Preview Mockup (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg sticky top-20">
            {/* Frame Heading Deck */}
            <div className="flex items-center justify-between px-space-xs">
              <div className="flex items-center gap-2">
                <Icon name="smartphone" className="text-primary-container text-[20px]" />
                <span className="font-heading-sm text-heading-sm font-bold text-text-primary">Live Consumer Viewport</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                Abuja Diners (Nearby)
              </div>
            </div>

            {/* Phone Mockup Container (Native 393px-style Mobile Preview) */}
            <div className="w-full max-w-sm mx-auto bg-surface-canvas rounded-[32px] shadow-[0_16px_40px_rgba(13,37,76,0.12)] p-3 relative overflow-hidden">
              {/* Mock Phone Speaker Notch */}
              <div className="w-full flex justify-center pb-2">
                <div className="w-24 h-4 bg-inverse-surface rounded-full flex items-center justify-end px-3">
                  <div className="w-2 h-2 rounded-full bg-primary-container" />
                </div>
              </div>
              {/* Inside Screen */}
              <div className="w-full bg-surface-subtle rounded-[24px] overflow-hidden flex flex-col">
                {/* Storefront Hero Banner with 15% discount */}
                <div className="relative w-full h-44 bg-surface-container overflow-hidden">
                  <div
                    role="img"
                    aria-label={PHONE_HERO_ALT}
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${PHONE_HERO_IMAGE}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-transparent to-black/10" />
                  {/* Promo Discount Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-sm flex items-center gap-1">
                    <Icon name="local_offer" className="text-[14px]" />
                    15% Off First Dine-In
                  </div>
                  {/* Distance Pill */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-inverse-surface/75 text-surface-bright font-caption text-caption font-medium backdrop-blur-sm flex items-center gap-1">
                    <Icon name="near_me" className="text-[13px] text-badge-discount-text" />
                    0.4 km away
                  </div>
                  {/* Brand Avatar overlapping bottom */}
                  <div className="absolute -bottom-6 left-4 w-14 h-14 rounded-full p-1 bg-surface-canvas shadow-lg">
                    <img
                      className="w-full h-full rounded-full object-cover"
                      alt={PHONE_AVATAR_ALT}
                      src={PHONE_AVATAR_IMAGE}
                    />
                  </div>
                </div>
                {/* Profile Info Body inside phone */}
                <div className="pt-8 px-4 pb-4 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary leading-tight">
                        Urban Grill &amp; Bistro
                      </h3>
                      <Icon name="verified" className="text-primary-container text-[18px]" filled />
                    </div>
                    <div className="flex items-center gap-1 text-tertiary-container font-label-sm text-label-sm font-bold">
                      <Icon name="star" className="text-[16px] text-tertiary-container" filled />
                      <span>4.9</span>
                      <span className="text-text-tertiary font-normal">(142)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 font-caption text-caption text-text-secondary">
                    <span className="font-medium text-text-primary">Nigerian-Continental Fusion</span>
                    <span>•</span>
                    <span>Apo District, Abuja</span>
                    <span>•</span>
                    <span className="text-badge-discount-text font-semibold">Open Now</span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary line-clamp-2">
                    Premium casual dining and woodfire grill serving Lagos and Abuja. Famous for dry-aged steaks and
                    artisanal burgers.
                  </p>
                  {/* Quick Action Pills Deck */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <button
                      type="button"
                      className="py-2 rounded-xl bg-surface-tint-blue text-primary-container flex flex-col items-center justify-center gap-0.5 hover:bg-secondary-container transition-colors"
                    >
                      <Icon name="directions" className="text-[18px]" />
                      <span className="font-caption text-[11px] font-semibold">Directions</span>
                    </button>
                    <button
                      type="button"
                      className="py-2 rounded-xl bg-surface-tint-blue text-primary-container flex flex-col items-center justify-center gap-0.5 hover:bg-secondary-container transition-colors"
                    >
                      <Icon name="call" className="text-[18px]" />
                      <span className="font-caption text-[11px] font-semibold">Call</span>
                    </button>
                    <button
                      type="button"
                      className="py-2 rounded-xl bg-surface-tint-blue text-primary-container flex flex-col items-center justify-center gap-0.5 hover:bg-secondary-container transition-colors"
                    >
                      <Icon name="menu_book" className="text-[18px]" />
                      <span className="font-caption text-[11px] font-semibold">Menu</span>
                    </button>
                    <button
                      type="button"
                      className="py-2 rounded-xl bg-badge-discount-bg text-badge-discount-text flex flex-col items-center justify-center gap-0.5 hover:opacity-90 transition-opacity"
                    >
                      <Icon name="loyalty" className="text-[18px]" />
                      <span className="font-caption text-[11px] font-semibold">3 Deals</span>
                    </button>
                  </div>
                  {/* Featured Menu Mini-Grid */}
                  <div className="pt-2 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm font-bold text-text-primary">Featured Today</span>
                      <span className="font-caption text-caption text-primary-container font-semibold cursor-pointer">
                        View All (38)
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {FEATURED_ITEMS.map((item) => (
                        <div
                          key={item.name}
                          className="p-2 rounded-xl bg-surface-canvas flex items-center justify-between shadow-sm"
                        >
                          <div className="flex items-center gap-2.5">
                            <img className="w-11 h-11 rounded-lg object-cover" alt={item.alt} src={item.image} />
                            <div className="flex flex-col">
                              <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                                {item.name}
                              </span>
                              <span className="font-caption text-caption text-text-tertiary">{item.note}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-label-sm text-label-sm font-bold text-text-primary">{item.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Live Tap Reservation Trigger */}
                    <button
                      type="button"
                      className="w-full py-2.5 mt-1 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-sm hover:bg-primary transition-all"
                    >
                      Instant Table Tap &amp; Order
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Standee & QR Desk Code Download Promotional Box */}
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-md flex items-start gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-tint-blue text-primary-container flex items-center justify-center flex-shrink-0">
                <Icon name="qr_code_scanner" className="text-[26px]" />
              </div>
              <div className="flex flex-col flex-1 gap-1">
                <span className="font-label-sm text-label-sm font-bold text-text-primary">
                  Counter Standee &amp; Table Tent Pack
                </span>
                <p className="font-caption text-caption text-text-secondary">
                  Generate ready-to-print vector acrylic signage with your store's high-res dynamic VEMTAP checkout QR
                  code.
                </p>
                <div className="flex items-center gap-space-sm pt-1">
                  <button
                    type="button"
                    className="font-label-sm text-label-sm font-semibold text-primary-container hover:underline flex items-center gap-1"
                  >
                    <span>Download Print PDF (A5 / A6)</span>
                    <Icon name="download" className="text-[14px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MerchantWorkspaceChrome>
  );
}
