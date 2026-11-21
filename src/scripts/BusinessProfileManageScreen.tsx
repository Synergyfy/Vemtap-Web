import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { useBusinessProfileForm } from '../hooks/business/useBusinessProfileForm';
import { useStorefrontPreview } from '../hooks/business/useStorefrontPreview';
import { SocialChannelPicker } from '../components/SocialChannelPicker';
import { businessProfileUrl } from '../utils/businessProfileLink';
import {
  channelsFromProfile,
  socialFieldsFromChannels,
  type ProfileChannel,
} from '../utils/businessProfileChannels';
import {
  CHANNEL_PLATFORMS,
  CHANNEL_PLATFORM_BY_ID,
  normalizeChannel,
  type ChannelPlatformId,
} from '../utils/socialChannels';
import { apiErrorMessage } from '../services/errorMessages';
import { CreateWithAiButton } from '../components/CreateWithAiButton';
import type { AiPromptContext } from './aiDesignAssistant';
import { UserAvatar } from '../components/ui/UserAvatar';
import { useBusinessOfferings, type OfferingType } from '../context/BusinessOfferingsContext';

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

/** Brand facts displayed on this screen — also fed to the AI Design Assistant. */
const BRAND_NAME = 'Urban Grill & Bistro';
const BRAND_CATEGORY = 'Restaurant & Grill • Casual Dining';
const BRAND_BIO =
  'Premium casual dining and woodfire grill serving Lagos and Abuja. Famous for dry-aged steaks, artisan burgers, and handcrafted mocktails.';

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function BusinessProfileManageScreen({ onBack, onPreviewStorefront }: BusinessProfileManageScreenProps) {
  const { offerings, setOfferings } = useBusinessOfferings();
  const profile = useBusinessProfileForm();
  const preview = useStorefrontPreview();
  const live = preview.live;

  const [offeringsDraft, setOfferingsDraft] = useState(offerings);
  const [confirmDisable, setConfirmDisable] = useState<OfferingType | null>(null);
  const [amenities, setAmenities] = useState<string[]>(() => [...profile.form.amenities]);
  const [channels, setChannels] = useState<ProfileChannel[]>(() => channelsFromProfile(profile.form));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [newAmenity, setNewAmenity] = useState('');
  const seededChannelsKey = useRef(
    JSON.stringify([profile.form.amenities, profile.form.socials, profile.form.whatsappNumber]),
  );
  const channelSeq = useRef(0);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const brandName = profile.form.name || (live ? 'Your business' : BRAND_NAME);
  const brandCategory = live ? profile.category || 'Add a category' : BRAND_CATEGORY;
  const brandBio = live ? profile.form.description || 'Add a short description so shoppers know what you offer.' : BRAND_BIO;
  const coverImg = live ? preview.coverImage : COVER_IMG;
  const logoImg = live ? preview.logoUrl : LOGO_IMG;
  const verified = live ? preview.verified : true;
  const storeCode = live ? preview.storeCode : '4082';
  // Live: host-relative /b/<code> link that opens this business on the app the merchant is using.
  const publicUrl = live ? businessProfileUrl(preview.storeCode ?? preview.publicUrl) : 'https://urbangrill.vem.store';
  const socialFields = socialFieldsFromChannels(channels, profile.form);
  const socialChips = channels
    .map((channel) => {
      const platform = CHANNEL_PLATFORM_BY_ID[channel.platform];
      const result = normalizeChannel(channel.platform, channel.value);
      return {
        key: channel.id,
        icon: platform.icon,
        label: result.ok ? result.display : channel.value,
        href: result.ok ? result.url : '',
      };
    })
    .filter((chip) => Boolean(chip.label));

  // Reflect the saved socials/amenities once they load (or after a save) without
  // wiping edits made in other fields while editing.
  useEffect(() => {
    if (profile.isLoading) return;
    const key = JSON.stringify([profile.form.amenities, profile.form.socials, profile.form.whatsappNumber]);
    if (seededChannelsKey.current === key) return;
    seededChannelsKey.current = key;
    setAmenities([...profile.form.amenities]);
    setChannels(channelsFromProfile(profile.form));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.isLoading, profile.form.amenities, profile.form.socials, profile.form.whatsappNumber]);

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

  const handleToggleOffering = (type: OfferingType) => {
    const isCurrentlyOn = type === 'products' ? offeringsDraft.hasProducts : offeringsDraft.hasServices;
    if (isCurrentlyOn) {
      // Trying to disable: check if the other is also disabled
      const otherOn = type === 'products' ? offeringsDraft.hasServices : offeringsDraft.hasProducts;
      if (!otherOn) {
        showToast('You must keep at least one offering active (Products, Services, or Both).');
        return;
      }
      // Require confirmation before disabling
      setConfirmDisable(type);
    } else {
      // Enabling: safe to enable immediately
      setOfferingsDraft((prev) => ({
        ...prev,
        [type === 'products' ? 'hasProducts' : 'hasServices']: true,
      }));
      showToast(`${type === 'products' ? 'Products' : 'Services'} enabled! Click Save Changes to apply.`);
    }
  };

  const confirmDisableOffering = () => {
    if (!confirmDisable) return;
    const type = confirmDisable;
    setOfferingsDraft((prev) => ({
      ...prev,
      [type === 'products' ? 'hasProducts' : 'hasServices']: false,
    }));
    setConfirmDisable(null);
    showToast(`${type === 'products' ? 'Products' : 'Services'} disabled. Existing data remains safely preserved.`);
  };

  /** Brand facts shown above — reused by the contextual AI prompts. */
  const aiProfileContext: AiPromptContext = {
    businessName: live ? (profile.isLoading ? undefined : profile.form.name) : BRAND_NAME,
    category: live ? profile.category || undefined : BRAND_CATEGORY,
    description: live ? (profile.isLoading ? undefined : profile.form.description) : BRAND_BIO,
  };

  /** Live: Edit Profile / Manage turn the name, bio, contacts and channels into fields; Save writes them. */
  const [editing, setEditing] = useState(false);
  const hasChanges =
    !profile.isLoading &&
    (profile.dirty ||
      !sameJson(amenities, profile.form.amenities) ||
      !sameJson(socialFields.socials, profile.form.socials) ||
      socialFields.whatsappNumber !== profile.form.whatsappNumber ||
      offeringsDraft.hasProducts !== offerings.hasProducts ||
      offeringsDraft.hasServices !== offerings.hasServices);
  const cancelEditing = () => {
    const saved = profile.reset();
    setAmenities([...saved.amenities]);
    setChannels(channelsFromProfile(saved));
    setPickerOpen(false);
    setNewAmenity('');
    setOfferingsDraft(offerings);
    setEditing(false);
  };
  const startEditing = (demoMessage: string) => (live ? setEditing(true) : showToast(demoMessage));
  const inputClass =
    'w-full rounded-lg bg-surface-container-low px-3 py-2 font-body-md text-body-md text-text-primary outline-none focus:ring-2 focus:ring-primary/30';

  /** Live: uploads a new logo / cover and saves it to the business right away. */
  const changeImage = (kind: 'logo' | 'cover') => {
    if (!editing) return;
    if (!live) {
      showToast(kind === 'logo' ? 'Logo upload opened' : 'Cover photo picker opened');
      return;
    }
    profile.uploadImage.mutate(kind, {
      onSuccess: (url) => {
        if (url) showToast(kind === 'logo' ? 'Logo updated' : 'Cover photo updated');
      },
      onError: (error) => showToast(`Could not upload: ${apiErrorMessage(error)}`),
    });
  };
  const uploadingKind = profile.uploadImage.isPending ? profile.uploadImage.variables : null;

  const handleSave = () => {
    profile.save.mutate(
      { ...profile.form, amenities, ...socialFields },
      {
        onSuccess: () => {
          setOfferings(offeringsDraft);
          setEditing(false);
          showToast('Profile, channels & amenities updated successfully!');
        },
        onError: (error) => showToast(`Could not save: ${apiErrorMessage(error)}`),
      },
    );
  };

  const addAmenity = () => {
    const value = newAmenity.trim().replace(/\s+/g, ' ');
    if (!value) return;
    if (amenities.some((item) => item.toLowerCase() === value.toLowerCase())) {
      showToast('That feature is already on your storefront.');
      return;
    }
    setAmenities((current) => [...current, value]);
    setNewAmenity('');
  };
  const removeAmenity = (label: string) => setAmenities((current) => current.filter((item) => item !== label));

  const usedPlatforms = channels.map((channel) => channel.platform);
  const setChannelValue = (id: string, value: string) =>
    setChannels((current) => current.map((channel) => (channel.id === id ? { ...channel, value, touched: true } : channel)));
  const markChannelTouched = (id: string) =>
    setChannels((current) => current.map((channel) => (channel.id === id ? { ...channel, touched: true } : channel)));
  const addChannel = (platform: ChannelPlatformId) => {
    setPickerOpen(false);
    if (usedPlatforms.includes(platform)) return;
    setChannels((current) => [...current, { id: `${platform}-${channelSeq.current++}`, platform, value: '', touched: false }]);
  };
  const removeChannel = (id: string) => setChannels((current) => current.filter((channel) => channel.id !== id));

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
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              <UserAvatar textClassName="text-on-primary text-[13px]" />
            </div>
          </div>
        </div>
      </header>

      <div className={`flex flex-col w-full flex-1 ${editing && hasChanges ? 'pb-32' : 'pb-space-xl'}`}>
        {/* Live strip */}
        <div className="px-margin pt-space-xs pb-space-sm flex items-center justify-between">
          <div className="flex items-center gap-space-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text animate-pulse" />
            <span className="font-label-sm text-label-sm text-text-secondary">Live on VEMTAP Network</span>
          </div>
          {!editing && (
            <button
              className="flex items-center gap-space-2xs px-space-sm py-1.5 rounded-full bg-surface-container-high hover:bg-surface-variant transition-colors text-primary font-label-sm text-label-sm active:scale-95"
              type="button"
              onClick={onPreviewStorefront}
            >
              <Icon name="visibility" className="text-[16px]" />
              <span>Public Preview</span>
            </button>
          )}
        </div>

        {/* Cover & Avatar */}
        <div className="relative w-full px-margin mb-space-lg">
          <div className="relative w-full h-44 rounded-xl overflow-hidden shadow-sm">
            {coverImg ? (
              <img alt={live ? `${brandName} cover` : COVER_ALT} className="w-full h-full object-cover" src={coverImg} />
            ) : (
              <div className="w-full h-full bg-surface-container" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-on-background/70 via-on-background/20 to-transparent" />
            {editing && (!live || !profile.isLoading) && (
              <button
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-inverse-surface/85 backdrop-blur-md text-on-primary font-label-sm text-label-sm active:scale-95 transition-all shadow-md"
                type="button"
                onClick={() => changeImage('cover')}
                disabled={uploadingKind === 'cover'}
              >
                <Icon name="photo_camera" className="text-[16px]" />
                <span>{uploadingKind === 'cover' ? 'Uploading…' : live && !coverImg ? 'Add Cover' : 'Change Cover'}</span>
              </button>
            )}
            {storeCode && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md shadow-sm">
                <Icon name="storefront" className="text-[14px] text-badge-discount-text" />
                <span className="font-label-sm text-label-sm text-text-primary">Store #{storeCode}</span>
              </div>
            )}
          </div>
          <div className="relative -mt-11 ml-3 flex items-end justify-between">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-surface-canvas p-1 shadow-md">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  {logoImg ? (
                    <img alt={live ? `${brandName} logo` : LOGO_ALT} className="w-full h-full object-cover" src={logoImg} />
                  ) : (
                    <div className="w-full h-full bg-surface-tint-blue text-primary flex items-center justify-center font-heading-md text-heading-md">
                      {brandName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              {editing && (!live || !profile.isLoading) && (
                <button
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md active:scale-90 transition-transform"
                  type="button"
                  onClick={() => changeImage('logo')}
                  disabled={uploadingKind === 'logo'}
                  aria-label="Change logo"
                >
                  <Icon name={uploadingKind === 'logo' ? 'progress_activity' : 'edit'} className={`text-[15px] ${uploadingKind === 'logo' ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 pb-1">
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${
                  verified ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-container text-text-secondary'
                }`}
              >
                <Icon name={verified ? 'verified' : 'storefront'} filled className="text-[14px]" />
                <span className="font-label-sm text-label-sm">{verified ? 'Active & Verified' : 'Active'}</span>
              </div>
            </div>
          </div>
          {editing && (!live || !profile.isLoading) && (
            <div className="mt-space-xs flex flex-wrap items-center gap-x-space-md gap-y-1">
              <CreateWithAiButton assetType="banner" context={aiProfileContext} aspectRatio="16/9" />
              <CreateWithAiButton assetType="logo" context={aiProfileContext} aspectRatio="square" />
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="px-margin flex flex-col gap-space-xs mb-space-lg">
          <div className="flex items-center gap-space-2xs flex-wrap">
            {editing ? (
              <input
                aria-label="Business name"
                className={`${inputClass} font-heading-sm text-heading-sm font-bold`}
                value={profile.form.name}
                onChange={(event) => profile.set('name', event.target.value)}
              />
            ) : (
              <h2 className="font-heading-sm text-heading-sm text-text-primary font-bold tracking-tight">
                {brandName}
              </h2>
            )}
            {verified && <Icon name="verified" filled className="text-primary text-[20px]" />}
          </div>
          <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm">
            <Icon name="restaurant" className="text-[14px]" />
            <span>{brandCategory}</span>
          </div>
          {editing ? (
            <div className="mt-1 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption text-text-tertiary">
                  {profile.form.description.length} / 250
                </span>
                <CreateWithAiButton
                  assetType="description"
                  context={{
                    businessName: brandName,
                    category: brandCategory,
                  }}
                  label="Write your Description with AI"
                />
              </div>
              <textarea
                aria-label="Storefront bio"
                className={`${inputClass} resize-none`}
                maxLength={250}
                placeholder="Tell shoppers what you offer"
                rows={3}
                value={profile.form.description}
                onChange={(event) => profile.set('description', event.target.value)}
              />
            </div>
          ) : (
            <p className="font-body-md text-body-md text-text-secondary mt-1">
              {brandBio}
            </p>
          )}
          <div className="grid grid-cols-2 gap-space-sm mt-space-sm">
            {!editing && (
              <button
                className="h-11 rounded-xl bg-surface-container-high text-primary hover:bg-surface-variant flex items-center justify-center gap-2 font-button-secondary text-button-secondary transition-all active:scale-[0.98]"
                type="button"
                onClick={onPreviewStorefront}
              >
                <Icon name="store" className="text-[18px]" />
                <span>Public Storefront</span>
                <Icon name="north_east" className="text-[16px]" />
              </button>
            )}
            <button
              className="h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center gap-2 font-button-primary text-button-primary shadow-[0_8px_20px_-4px_rgba(6,108,244,0.28)] hover:bg-primary-container active:scale-[0.98] transition-all"
              type="button"
              onClick={() => (editing ? cancelEditing() : startEditing('Profile editor opening…'))}
            >
              <Icon name={editing ? 'close' : 'tune'} className="text-[18px]" />
              <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
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
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">
                    {live ? preview.verificationLabel ?? 'Verification' : 'Business Verified'}
                  </h3>
                  {!live && (
                    <span className="px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption">
                      Tier 3
                    </span>
                  )}
                </div>
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  {!live
                    ? 'Your CAC registration (RC-1849204), government ID, and operating tax identity have been verified by VEMTAP Trust & Safety.'
                    : verified
                      ? 'Your business has been verified by VEMTAP Trust & Safety.'
                      : 'Verify your business to earn the blue badge and rank higher in local discovery.'}
                </p>
                <div className="flex items-center gap-4 mt-2 pt-2 text-text-tertiary font-caption text-caption flex-wrap">
                  {live ? (
                    <>
                      <span className={`flex items-center gap-1 font-medium ${preview.identityCheckOk ? 'text-badge-discount-text' : ''}`}>
                        <Icon name="format_image_left" className="text-[14px]" />
                        ID: {preview.identityCheck ?? '…'}
                      </span>
                      <span className={`flex items-center gap-1 font-medium ${preview.businessCheckOk ? 'text-badge-discount-text' : ''}`}>
                        <Icon name="domain_verification" className="text-[14px]" />
                        CAC: {preview.businessCheck ?? '…'}
                      </span>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Offerings */}
        <div className="px-margin mb-space-lg">
          <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                  <Icon name="tune" className="text-[18px]" />
                </div>
                <div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Business Offerings</h3>
                  <p className="font-caption text-caption text-text-secondary">
                    Choose what this business offers on VEMTAP.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-space-xs mt-1">
              {/* Products Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors">
                <div className="flex items-start gap-3 min-w-0 pr-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      offeringsDraft.hasProducts ? 'bg-primary text-on-primary' : 'bg-surface-container text-text-secondary'
                    }`}
                  >
                    <Icon name="inventory_2" className="text-[16px]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md font-semibold text-text-primary">Products</span>
                    <span className="font-caption text-caption text-text-secondary leading-snug">
                      Manage products, stock, prices and product deals.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-label="Toggle Products"
                  aria-checked={offeringsDraft.hasProducts}
                  disabled={!editing}
                  onClick={() => handleToggleOffering('products')}
                  className={`w-8 h-5 rounded-full transition-colors relative shrink-0 p-0.5 inline-flex items-center ${
                    offeringsDraft.hasProducts ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform ${
                      offeringsDraft.hasProducts ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Services Toggle — hidden in product-only rollout */}
              {false && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors">
                <div className="flex items-start gap-3 min-w-0 pr-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      offeringsDraft.hasServices ? 'bg-primary text-on-primary' : 'bg-surface-container text-text-secondary'
                    }`}
                  >
                    <Icon name="content_cut" className="text-[16px]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md font-semibold text-text-primary">Services</span>
                    <span className="font-caption text-caption text-text-secondary leading-snug">
                      Manage services, pricing, packages and service deals.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-label="Toggle Services"
                  aria-checked={offeringsDraft.hasServices}
                  disabled={!editing}
                  onClick={() => handleToggleOffering('services')}
                  className={`w-8 h-5 rounded-full transition-colors relative shrink-0 p-0.5 inline-flex items-center ${
                    offeringsDraft.hasServices ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform ${
                      offeringsDraft.hasServices ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              )}
            </div>

            {/* Dynamic Status Indicator */}
            <div className="pt-2 border-t border-border-subtle flex items-center gap-2 text-caption font-caption text-text-secondary">
              <Icon name="info" className="text-[16px] text-primary shrink-0" />
              <span>Your dashboard will focus on products.</span>
            </div>
          </div>
        </div>

        {/* Contact & Channels */}
        <div className="px-margin mb-space-lg">
          <div className="flex items-center justify-between mb-space-xs">
            <h3 className="font-heading-sm text-heading-sm text-text-primary">Contact & Public Channels</h3>
          </div>
          <div className="rounded-xl bg-surface-container-lowest p-space-sm shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-xs">
            <div className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                  <Icon name="phone" className="text-[18px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-caption text-caption text-text-tertiary">Official Phone</span>
                  {editing ? (
                    <input
                      aria-label="Official phone"
                      className={inputClass}
                      inputMode="tel"
                      placeholder="+234…"
                      value={profile.form.phone}
                      onChange={(event) => profile.set('phone', event.target.value)}
                    />
                  ) : (
                    <span className="font-body-md text-body-md text-text-primary font-medium truncate">
                      {live ? profile.form.phone || 'Add a phone number' : '+234 803 900 2210'}
                    </span>
                  )}
                </div>
              </div>
              {!live && (
                <div className="flex items-center gap-1 text-badge-discount-text bg-badge-discount-bg px-2 py-0.5 rounded-full shrink-0">
                  <Icon name="check_circle" className="text-[13px]" />
                  <span className="font-caption text-caption font-medium">Verified</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                  <Icon name="alternate_email" className="text-[18px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-caption text-caption text-text-tertiary">Customer Desk</span>
                  {editing ? (
                    <input
                      aria-label="Contact email"
                      className={inputClass}
                      placeholder="hello@yourbusiness.com"
                      type="email"
                      value={profile.form.officialEmail}
                      onChange={(event) => profile.set('officialEmail', event.target.value)}
                    />
                  ) : (
                    <span className="font-body-md text-body-md text-text-primary font-medium truncate">
                      {live ? profile.form.officialEmail || 'Add a contact email' : 'contact@urbangrill.ng'}
                    </span>
                  )}
                </div>
              </div>
              <Icon name="chevron_right" className="text-text-tertiary text-[18px]" />
            </div>
            <div className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-container-low transition-colors">
              <a
                href={publicUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                title="Open your public storefront"
                className={`flex items-center gap-space-sm min-w-0 ${publicUrl ? 'hover:text-primary transition-colors' : ''}`}
              >
                <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                  <Icon name="language" className="text-[18px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-caption text-caption text-text-tertiary">{live ? 'Public Link' : 'VEMTAP Subdomain'}</span>
                  <span className="flex items-center gap-1 font-body-md text-body-md text-primary font-medium truncate">
                    {publicUrl ? publicUrl.replace(/^https?:\/\//, '') : 'Loading…'}
                    {publicUrl ? <Icon name="open_in_new" className="text-[13px] shrink-0" /> : null}
                  </span>
                </div>
              </a>
              <button
                className="p-1 text-text-secondary hover:text-primary active:scale-95 disabled:opacity-50"
                title="Copy link"
                type="button"
                disabled={!publicUrl}
                onClick={() => {
                  if (publicUrl) navigator.clipboard?.writeText(publicUrl).catch(() => {});
                }}
              >
                <Icon name="content_copy" className="text-[18px]" />
              </button>
            </div>
            <div className="mt-space-xs pt-space-xs px-1 flex flex-col gap-space-xs">
              <div className="flex items-center justify-between gap-space-sm">
                <div>
                  <span className="font-label-sm text-label-sm text-text-primary font-semibold">Social Channels</span>
                  <p className="font-caption text-caption text-text-tertiary">
                    Only channels you add will be shown to customers.
                  </p>
                </div>
                {editing && (
                  <div className="relative shrink-0">
                    <button
                      aria-label="Add social channel"
                      aria-haspopup="menu"
                      aria-expanded={pickerOpen}
                      className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center active:scale-95 disabled:opacity-50"
                      type="button"
                      disabled={usedPlatforms.length >= CHANNEL_PLATFORMS.length}
                      onClick={() => setPickerOpen((open) => !open)}
                    >
                      <Icon name="add" className="text-[18px]" />
                    </button>
                    {pickerOpen ? (
                      <SocialChannelPicker
                        used={usedPlatforms}
                        onSelect={addChannel}
                        onClose={() => setPickerOpen(false)}
                      />
                    ) : null}
                  </div>
                )}
              </div>

              {editing ? (
                channels.length === 0 ? (
                  <span className="font-caption text-caption text-text-tertiary">
                    No social channels yet — tap “+” to add one.
                  </span>
                ) : (
                  channels.map((channel) => {
                    const platform = CHANNEL_PLATFORM_BY_ID[channel.platform];
                    const result = normalizeChannel(channel.platform, channel.value);
                    const showError = channel.touched && channel.value.trim().length > 0 && !result.ok;
                    return (
                      <div key={channel.id} className="flex items-start gap-space-xs p-space-xs rounded-xl bg-surface-container-low">
                        <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${platform.iconClass}`}>
                          <Icon name={platform.icon} className="text-[18px]" />
                        </span>
                        <div className="min-w-0 flex-grow">
                          <span className="flex items-center gap-1 font-caption text-caption text-text-secondary">
                            {platform.label}
                            {result.ok ? <Icon name="check_circle" className="text-badge-discount-text text-[13px]" filled /> : null}
                          </span>
                          <input
                            aria-label={`${platform.label} ${platform.kind === 'phone' ? 'phone number' : 'handle'}`}
                            aria-invalid={showError}
                            className="w-full bg-transparent font-label-sm text-label-sm text-text-primary outline-none p-0 placeholder:text-text-tertiary"
                            placeholder={platform.placeholder}
                            value={channel.value}
                            onBlur={() => markChannelTouched(channel.id)}
                            onChange={(event) => setChannelValue(channel.id, event.target.value)}
                          />
                          {showError ? (
                            <span className="flex items-center gap-1 font-caption text-caption text-error">
                              <Icon name="error" className="text-[13px]" />
                              {'error' in result ? result.error : ''}
                            </span>
                          ) : null}
                        </div>
                        <button
                          aria-label={`Remove ${platform.label}`}
                          className="p-1 rounded-lg text-text-tertiary hover:text-error transition-colors shrink-0"
                          type="button"
                          onClick={() => removeChannel(channel.id)}
                        >
                          <Icon name="delete" className="text-[16px]" />
                        </button>
                      </div>
                    );
                  })
                )
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  {socialChips.length === 0 && (
                    <span className="font-caption text-caption text-text-tertiary">No social channels added yet</span>
                  )}
                  {socialChips.map((chip) => {
                    const className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors';
                    return chip.href ? (
                      <a key={chip.key} href={chip.href} target="_blank" rel="noopener noreferrer" className={className}>
                        <Icon name={chip.icon} className="text-[16px] text-primary" />
                        <span className="font-caption text-caption font-medium">{chip.label}</span>
                      </a>
                    ) : (
                      <span key={chip.key} className={className}>
                        <Icon name={chip.icon} className="text-[16px] text-primary" />
                        <span className="font-caption text-caption font-medium">{chip.label}</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="px-margin mb-space-2xl">
          <div className="flex items-center justify-between mb-space-xs">
            <div>
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Amenities & Features</h3>
              <p className="font-caption text-caption text-text-secondary">
                Add the features your customers can actually enjoy
              </p>
            </div>
            <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-tint-blue text-primary font-semibold shrink-0">
              {amenities.length} Added
            </span>
          </div>
          {editing && (
            <div className="flex items-center gap-space-xs pt-1">
              <input
                aria-label="New amenity or feature"
                className={inputClass}
                placeholder="e.g. Rooftop seating, EV charging…"
                value={newAmenity}
                onChange={(event) => setNewAmenity(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addAmenity();
                  }
                }}
              />
              <button
                aria-label="Add amenity"
                className="h-10 px-space-sm rounded-xl bg-primary text-on-primary flex items-center justify-center gap-1 font-label-sm text-label-sm shrink-0 active:scale-95 disabled:opacity-50"
                type="button"
                disabled={!newAmenity.trim()}
                onClick={addAmenity}
              >
                <Icon name="add" className="text-[16px]" />
                Add new
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2.5 pt-2">
            {amenities.length === 0 ? (
              <span className="font-caption text-caption text-text-tertiary">
                {editing ? 'No features yet — type one above and tap Add new.' : 'No features added yet.'}
              </span>
            ) : (
              amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-tint-blue text-primary font-label-md text-label-md"
                >
                  <Icon name="check_circle" className="text-[16px]" filled />
                  {amenity}
                  {editing ? (
                    <button
                      aria-label={`Remove ${amenity}`}
                      className="p-0.5 rounded-full hover:text-error transition-colors"
                      type="button"
                      onClick={() => removeAmenity(amenity)}
                    >
                      <Icon name="close" className="text-[14px]" />
                    </button>
                  ) : null}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sticky Save Bar */}
      {editing && hasChanges && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/95 backdrop-blur-md px-margin py-3 shadow-[0_-8px_24px_-4px_rgba(17,24,39,0.06)] flex items-center gap-space-sm">
        <button
          className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary active:scale-95 transition-all shrink-0"
          title="Discard Changes"
          type="button"
          onClick={cancelEditing}
        >
          <Icon name="restart_alt" className="text-[20px]" />
        </button>
        <button
          className="flex-1 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center gap-2 font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] hover:bg-primary-container active:scale-[0.98] transition-all"
          type="button"
          onClick={handleSave}
          disabled={profile.save.isPending || profile.uploadImage.isPending || profile.isLoading}
        >
          <Icon name="check" className="text-[20px]" />
          <span>{profile.save.isPending ? 'Saving…' : 'Save Changes'}</span>
        </button>
        </div>
      )}

      {/* Confirmation modal when disabling an offering */}
      {confirmDisable && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-canvas rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-border-subtle flex flex-col gap-4 animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Icon name="warning" className="text-[26px]" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-heading-sm text-heading-sm text-text-primary font-bold">
                Turn off {confirmDisable === 'products' ? 'Products' : 'Services'}?
              </h4>
              <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                Your existing {confirmDisable === 'products' ? 'products, stock, and deals' : 'services, durations, and deals'} won&apos;t be deleted. They will remain safely preserved, but won&apos;t be visible to customers until re-enabled.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDisable(null)}
                className="flex-1 h-11 rounded-xl bg-surface-container text-text-primary font-button-secondary text-button-secondary hover:bg-surface-container-high transition-colors"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={confirmDisableOffering}
                className="flex-1 h-11 rounded-xl bg-error text-on-error font-button-primary text-button-primary hover:bg-error/90 active:scale-95 transition-all shadow-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

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
