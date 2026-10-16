import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { SocialChannelPicker } from '../../components/SocialChannelPicker';
import { useProfile } from '../../context/ProfileContext';
import {
  CHANNEL_PLATFORMS,
  CHANNEL_PLATFORM_BY_ID,
  normalizeChannel,
  type ChannelPlatformId,
} from '../../utils/socialChannels';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import type { BusinessProfileDraft } from './DesktopBusinessOnboardingScreen';

interface DesktopBusinessProfileContactScreenProps {
  draft: BusinessProfileDraft;
  onDraftChange: (patch: Partial<BusinessProfileDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

interface ChannelDraft {
  id: string;
  platform: ChannelPlatformId;
  value: string;
  touched: boolean;
}

const CORE_PLATFORMS: ChannelPlatformId[] = ['instagram', 'whatsapp', 'x'];

const seedChannels = (draft: BusinessProfileDraft): ChannelDraft[] =>
  (['instagram', 'whatsapp', 'x'] as const).map((platform) => ({
    id: platform,
    platform,
    value: draft[platform] ?? '',
    touched: false,
  }));

const LAUNCH_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCNczFLc0faRiEg4jO8sXFdg1kenSyM1sPXHoySM_AZy0ALkQgOd5Rz9poPpMDFASLZ-lonWkAaADj9SsuBiiphhxFqofAmKSvGnwvS87VQPjE4FPWUubVLH3Ex-PmTHoXYS3DH-NvdMggquKPlwNLFV-pGyoxF8uwY4afUg_ifquogK2A90GDeEQEeyipYTwK7ucgRwD_uy_HLw8_aQjJN1e1QQtNO7AzVw8QIbMIu';

export function DesktopBusinessProfileContactScreen({
  draft,
  onDraftChange,
  onBack,
  onNext,
  onSaveDraft,
}: DesktopBusinessProfileContactScreenProps) {
  const profile = useProfile();
  const [status, setStatus] = useState<'idle' | 'saving'>('idle');
  const [channels, setChannels] = useState<ChannelDraft[]>(() => seedChannels(draft));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [emailEditing, setEmailEditing] = useState(false);
  const channelSeq = useRef(0);
  const timers = useRef<number[]>([]);
  const channelInputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const localPhone = draft.phone.startsWith('+234 ') ? draft.phone.slice(5) : draft.phone;

  const handlePhoneChange = (value: string) => {
    const next = value.startsWith('+234') ? value : `+234 ${value}`;
    onDraftChange({ phone: next });
  };

  const togglePref = (key: 'inApp' | 'whatsapp') => {
    onDraftChange({ prefs: { ...draft.prefs, [key]: !draft.prefs[key] } });
  };

  const usedPlatforms = channels.map((channel) => channel.platform);
  const allPlatformsAdded = usedPlatforms.length >= CHANNEL_PLATFORMS.length;

  const setChannelValue = (id: string, value: string) => {
    const channel = channels.find((item) => item.id === id);
    if (channel && CORE_PLATFORMS.includes(channel.platform)) {
      onDraftChange({ [channel.platform]: value });
    }
    setChannels((prev) => prev.map((item) => (item.id === id ? { ...item, value, touched: true } : item)));
  };

  const markChannelTouched = (id: string) =>
    setChannels((prev) => prev.map((item) => (item.id === id ? { ...item, touched: true } : item)));

  const addChannel = (platform: ChannelPlatformId) => {
    setPickerOpen(false);
    if (usedPlatforms.includes(platform)) return;
    const id = `${platform}-${channelSeq.current++}`;
    setChannels((prev) => [...prev, { id, platform, value: '', touched: false }]);
  };

  const removeChannel = (id: string) =>
    setChannels((prev) => prev.filter((channel) => channel.id !== id));

  const accountEmail = profile.email.trim().toLowerCase();
  const isAccountEmail = accountEmail.length > 0 && draft.email.trim().toLowerCase() === accountEmail;
  const emailLocked = isAccountEmail && !emailEditing;

  const handleComplete = () => {
    if (status !== 'idle') return;
    setStatus('saving');
    timers.current.push(
      window.setTimeout(() => {
        onNext();
      }, 900),
    );
  };

  const chatSummary = draft.prefs.inApp && draft.prefs.whatsapp
    ? 'In-App + WhatsApp alerts'
    : draft.prefs.inApp
      ? 'In-App alerts'
      : draft.prefs.whatsapp
        ? 'WhatsApp alerts'
        : 'Instant chat disabled';

  return (
    <BusinessSetupChrome activeNav="profile">
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-surface-container-low via-surface to-surface pb-space-3xl">
        <div className="pointer-events-none absolute -top-40 right-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute top-80 -left-20 h-80 w-80 rounded-full bg-secondary-container/30 blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full pt-space-lg">
          <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-sm">
              <div className="flex items-center gap-space-sm">
                <span className="px-space-sm py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-caption font-semibold uppercase tracking-wider">
                  Final Step
                </span>
                <span className="font-label-md text-label-md text-text-primary font-semibold">
                  Step 3 of 3: Contact &amp; Channels
                </span>
              </div>
              <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm font-semibold">
                <Icon name="verified" className="text-[18px]" />
                <span>100% Complete</span>
              </div>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full w-full transition-all duration-700 ease-out" />
            </div>
          </div>

          <div className="mt-space-xl mb-space-2xl">
            <p className="text-primary font-label-md text-label-md uppercase tracking-wider mb-space-2xs font-semibold">
              Merchant Profile Configuration
            </p>
            <h1 className="font-display-hero text-display-hero text-on-surface">
              How customers connect with you
            </h1>
            <p className="font-body-lg text-body-lg text-text-secondary mt-space-2xs max-w-3xl">
              Make it easy for local customers to ask questions, place orders, and coordinate voucher redemptions
              seamlessly across Lagos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            <div className="lg:col-span-7 flex flex-col gap-space-xl">
              <section className="bg-surface-canvas rounded-xl p-space-xl shadow-sm flex flex-col gap-space-lg">
                <div className="flex items-center gap-space-xs text-text-primary font-heading-sm text-heading-sm">
                  <Icon name="call" className="text-primary text-[24px]" />
                  <h2>Direct Business Lines</h2>
                </div>
                <div className="flex flex-col gap-space-2xs">
                  <label
                    className="font-label-md text-label-md text-text-primary flex items-center justify-between"
                    htmlFor="phone-input"
                  >
                    <span>
                      Primary Business Phone / WhatsApp <span className="text-error">*</span>
                    </span>
                    <span className="text-badge-discount-text text-caption font-label-sm flex items-center gap-1 font-semibold">
                      <Icon name="check_circle" className="text-[14px]" /> Verified SMS &amp; OTP
                    </span>
                  </label>
                  <div className="flex rounded-lg overflow-hidden bg-surface-subtle focus-within:bg-surface-canvas shadow-sm">
                    <div className="flex items-center gap-space-2xs px-space-md bg-surface-container text-on-surface-variant font-label-md text-label-md select-none">
                      <span className="text-base leading-none">🇳🇬</span>
                      <span className="font-semibold">+234</span>
                      <Icon name="expand_more" className="text-text-tertiary text-[16px]" />
                    </div>
                    <input
                      id="phone-input"
                      type="tel"
                      placeholder="800 000 0000"
                      value={localPhone}
                      onChange={(event) => handlePhoneChange(event.target.value)}
                      className="w-full h-[52px] px-space-md bg-transparent text-text-primary font-body-md text-body-md outline-none focus:ring-0 placeholder:text-text-tertiary"
                    />
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-space-2xs flex items-center gap-space-2xs">
                    <Icon name="info" className="text-text-tertiary text-[14px]" />
                    Used for voucher redemption verification codes and customer queries.
                  </p>
                </div>
                <div className="flex flex-col gap-space-2xs">
                  <label
                    className="font-label-md text-label-md text-text-primary flex items-center justify-between gap-space-sm"
                    htmlFor="email-input"
                  >
                    <span>
                      Official Business Email <span className="text-error">*</span>
                    </span>
                    {isAccountEmail ? (
                      <span className="text-badge-discount-text text-caption font-label-sm flex items-center gap-1 font-semibold">
                        <Icon name="verified_user" className="text-[14px]" /> Linked to your account
                      </span>
                    ) : (
                      <span className="text-tertiary-container text-caption font-label-sm flex items-center gap-1 font-semibold">
                        <Icon name="pending" className="text-[14px]" /> Needs verification
                      </span>
                    )}
                  </label>
                  <div className="flex items-center rounded-lg bg-surface-subtle focus-within:bg-surface-canvas px-space-md shadow-sm">
                    <Icon name="mail" className="text-text-tertiary text-[20px] mr-space-xs" />
                    <input
                      id="email-input"
                      type="email"
                      placeholder="name@business.com"
                      readOnly={emailLocked}
                      value={draft.email}
                      onChange={(event) => onDraftChange({ email: event.target.value })}
                      className={`w-full h-[52px] bg-transparent text-text-primary font-body-md text-body-md outline-none focus:ring-0 placeholder:text-text-tertiary ${
                        emailLocked ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    {emailLocked ? (
                      <button
                        type="button"
                        aria-label="Edit business email"
                        onClick={() => setEmailEditing(true)}
                        className="p-space-2xs rounded-lg text-primary hover:bg-surface-tint-blue transition-colors"
                      >
                        <Icon name="edit" className="text-[18px]" />
                      </button>
                    ) : (
                      <Icon name="verified" className="text-badge-discount-text text-[20px]" />
                    )}
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-space-2xs flex items-center gap-space-2xs">
                    <Icon name="info" className="text-text-tertiary text-[14px]" />
                    {isAccountEmail
                      ? 'Pulled from your verified VEMTAP account. Editing needs a re-verification check.'
                      : emailLocked
                        ? 'For settlement invoices and official platform notices.'
                        : 'For settlement invoices — we will re-verify this address before launch.'}
                  </p>
                </div>
                <div className="flex flex-col gap-space-2xs">
                  <label
                    className="font-label-md text-label-md text-text-primary flex items-center justify-between"
                    htmlFor="web-input"
                  >
                    <span>Website or Online Menu</span>
                    <span className="text-text-tertiary font-caption text-caption">Optional</span>
                  </label>
                  <div className="flex items-center rounded-lg bg-surface-subtle focus-within:bg-surface-canvas px-space-md shadow-sm">
                    <Icon name="language" className="text-text-tertiary text-[20px] mr-space-xs" />
                    <input
                      id="web-input"
                      type="url"
                      placeholder="https://..."
                      value={draft.website}
                      onChange={(event) => onDraftChange({ website: event.target.value })}
                      className="w-full h-[52px] bg-transparent text-text-primary font-body-md text-body-md outline-none focus:ring-0 placeholder:text-text-tertiary"
                    />
                    <a
                      className="text-primary hover:text-on-primary-fixed-variant p-space-2xs"
                      href={draft.website}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Icon name="open_in_new" className="text-[18px]" />
                    </a>
                  </div>
                </div>
              </section>

              <section className="bg-surface-canvas rounded-xl p-space-xl shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-xs text-text-primary font-heading-sm text-heading-sm">
                    <Icon name="share" className="text-primary text-[24px]" />
                    <h2>Social &amp; Messaging Presences</h2>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPickerOpen((open) => !open)}
                      disabled={allPlatformsAdded}
                      aria-haspopup="menu"
                      aria-expanded={pickerOpen}
                      className="flex items-center gap-space-2xs px-space-sm py-space-xs rounded-lg bg-surface-tint-blue text-primary font-label-md text-label-md hover:bg-surface-container font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon name="add" className="text-[16px]" />
                      <span>Add Channel</span>
                      <Icon name="expand_more" className="text-[16px]" />
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
                <p className="font-body-md text-caption text-text-secondary -mt-space-2xs">
                  Paste an @handle or full profile link — we turn it into a clean, clickable destination.
                </p>
                <div className="flex flex-col gap-space-sm mt-space-xs">
                  {channels.map((channel) => {
                    const platform = CHANNEL_PLATFORM_BY_ID[channel.platform];
                    const result = normalizeChannel(channel.platform, channel.value);
                    const showError = channel.touched && channel.value.trim().length > 0 && !result.ok;
                    const isCore = CORE_PLATFORMS.includes(channel.platform);
                    return (
                      <div
                        key={channel.id}
                        className="flex items-start justify-between gap-space-md p-space-md rounded-xl bg-surface-subtle hover:bg-surface-container-low transition-colors"
                      >
                        <div className="flex items-start gap-space-md min-w-0 flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${platform.iconClass}`}
                          >
                            <Icon name={platform.icon} className="text-[20px]" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1 gap-space-2xs">
                            <div className="flex items-center gap-space-2xs">
                              <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                                {platform.label}
                              </span>
                              {result.ok ? (
                                <span title="Looks good">
                                  <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
                                </span>
                              ) : null}
                            </div>
                            <input
                              ref={(node) => {
                                channelInputs.current[channel.id] = node;
                              }}
                              aria-label={`${platform.label} ${platform.kind === 'phone' ? 'phone number' : 'handle'}`}
                              aria-invalid={showError}
                              placeholder={platform.placeholder}
                              value={channel.value}
                              onBlur={() => markChannelTouched(channel.id)}
                              onChange={(event) => setChannelValue(channel.id, event.target.value)}
                              className="font-body-md text-caption text-text-secondary bg-transparent outline-none focus:text-text-primary w-full placeholder:text-text-tertiary"
                            />
                            {showError ? (
                              <span className="font-caption text-caption text-error flex items-center gap-space-2xs">
                                <Icon name="error" className="text-[14px]" />
                                {result.error}
                              </span>
                            ) : result.ok ? (
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-caption text-caption text-primary hover:underline flex items-center gap-space-2xs min-w-0"
                              >
                                <Icon name="link" className="text-[14px] flex-shrink-0" />
                                <span className="truncate">{result.display}</span>
                              </a>
                            ) : (
                              <span className="font-caption text-caption text-text-tertiary">{platform.hint}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-space-xs flex-shrink-0 pt-0.5">
                          {!isCore ? (
                            <button
                              type="button"
                              aria-label={`Remove ${platform.label}`}
                              onClick={() => removeChannel(channel.id)}
                              className="p-space-xs rounded-lg text-text-secondary hover:text-error hover:bg-surface-container transition-colors"
                            >
                              <Icon name="delete" className="text-[18px]" />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            aria-label={`Edit ${platform.label}`}
                            onClick={() => channelInputs.current[channel.id]?.focus()}
                            className="p-space-xs rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors"
                          >
                            <Icon name="edit" className="text-[18px]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="bg-surface-canvas rounded-xl p-space-xl shadow-sm flex flex-col gap-space-lg">
                <div className="flex items-center gap-space-xs text-text-primary font-heading-sm text-heading-sm">
                  <Icon name="tune" className="text-primary text-[24px]" />
                  <h2>Direct Customer Contact Preferences</h2>
                </div>
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-start justify-between gap-space-md p-space-md rounded-xl bg-surface-tint-blue">
                    <div className="flex gap-space-sm items-start">
                      <Icon name="bolt" className="text-primary text-[22px] mt-0.5" />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-space-2xs">
                          <span className="font-label-md text-label-md font-semibold text-text-primary">
                            Allow In-App Direct Chat (Fast)
                          </span>
                          <span className="px-space-xs py-space-2xs rounded-full bg-primary-container text-on-primary font-caption text-caption text-[11px] font-semibold">
                            Recommended
                          </span>
                        </div>
                        <p className="font-body-md text-caption text-text-secondary mt-1">
                          Customers expect quick replies within 15 minutes. High responsiveness improves store
                          discovery ranking on VEMTAP.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-pressed={draft.prefs.inApp}
                      aria-label="Allow In-App Direct Chat"
                      onClick={() => togglePref('inApp')}
                      className={`w-12 h-7 rounded-full relative transition-colors focus:outline-none flex-shrink-0 p-0.5 ${
                        draft.prefs.inApp ? 'bg-primary' : 'bg-surface-variant'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 bg-surface-canvas rounded-full shadow-md block transition-transform ${
                          draft.prefs.inApp ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-start justify-between gap-space-md p-space-md rounded-xl bg-surface-subtle">
                    <div className="flex gap-space-sm items-start">
                      <Icon name="notifications_active" className="text-badge-discount-text text-[22px] mt-0.5" />
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md font-semibold text-text-primary">
                          Receive deal claims via WhatsApp alerts
                        </span>
                        <p className="font-body-md text-caption text-text-secondary mt-1">
                          Instant notification ping each time a nearby customer claims your voucher so kitchen and
                          front-of-house teams can prep immediately.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-pressed={draft.prefs.whatsapp}
                      aria-label="Receive deal claims via WhatsApp alerts"
                      onClick={() => togglePref('whatsapp')}
                      className={`w-12 h-7 rounded-full relative transition-colors focus:outline-none flex-shrink-0 p-0.5 ${
                        draft.prefs.whatsapp ? 'bg-primary' : 'bg-surface-variant'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 bg-surface-canvas rounded-full shadow-md block transition-transform ${
                          draft.prefs.whatsapp ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-space-xl">
              <div className="bg-surface-canvas rounded-2xl p-space-xl shadow-md relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-surface-tint-blue rounded-full pointer-events-none" />
                <div className="flex items-center gap-space-xs mb-space-md relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                    <Icon name="celebration" className="text-[24px]" />
                  </div>
                  <div>
                    <span className="font-label-sm text-caption text-badge-discount-text uppercase font-bold tracking-wider">
                      Launch Ready
                    </span>
                    <h3 className="font-heading-md text-heading-md text-text-primary">Almost Ready to Launch!</h3>
                  </div>
                </div>
                <div className="relative rounded-xl overflow-hidden mb-space-md shadow-sm">
                  <img
                    className="w-full h-44 object-cover"
                    alt="A modern upscale restaurant interior with warm ambient lighting, timber wooden tables, glowing bar in background, vibrant Lagos urban culinary dining experience with guests in stylish casual attire"
                    src={LAUNCH_IMAGE}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/40 to-transparent flex flex-col justify-end p-space-md">
                    <div className="flex items-center gap-space-2xs text-on-primary">
                      <span className="font-heading-sm text-heading-sm font-semibold">Urban Grill Lagos</span>
                      <Icon name="verified" className="text-primary-fixed text-[18px]" />
                    </div>
                    <p className="text-surface-variant font-caption text-caption flex items-center gap-1 mt-0.5">
                      <Icon name="pin_drop" className="text-[14px]" /> Victoria Island, Lagos • 0.4 mi from center
                    </p>
                  </div>
                </div>
                <div className="p-space-md rounded-xl bg-surface-container-low mb-space-md">
                  <div className="flex items-center gap-space-md">
                    <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
                      <Icon name="radar" className="text-[24px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-heading-sm text-heading-sm font-bold text-text-primary">
                        1,420+ food lovers
                      </span>
                      <span className="font-body-md text-caption text-text-secondary">
                        actively browsing dining vouchers within 3 km of your venue.
                      </span>
                    </div>
                  </div>
                </div>
                <p className="font-body-md text-caption text-text-secondary leading-relaxed">
                  Once you finish this step, your storefront will enter the priority merchant spotlight index. You can
                  launch your first 20%-off tap voucher immediately.
                </p>
              </div>

              <div className="bg-surface-canvas rounded-2xl p-space-xl shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                    Verification Checklist
                  </h3>
                  <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-label-sm text-caption font-bold">
                    3 of 3 ready
                  </span>
                </div>
                <div className="flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-subtle">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-8 h-8 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                        <Icon name="done" className="text-[18px]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md font-semibold text-text-primary">
                          Phone Verified
                        </span>
                        <span className="font-caption text-caption text-text-secondary">{draft.phone}</span>
                      </div>
                    </div>
                    <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
                  </div>
                  <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-subtle">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-8 h-8 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                        <Icon name="done" className="text-[18px]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md font-semibold text-text-primary">
                          Email Confirmed
                        </span>
                        <span className="font-caption text-caption text-text-secondary">{draft.email}</span>
                      </div>
                    </div>
                    <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
                  </div>
                  <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-subtle">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-8 h-8 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                        <Icon name="done" className="text-[18px]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md font-semibold text-text-primary">
                          Instant Chat Enabled
                        </span>
                        <span className="font-caption text-caption text-text-secondary">{chatSummary}</span>
                      </div>
                    </div>
                    <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
                  </div>
                </div>
                <div className="pt-space-xs mt-space-2xs flex items-center gap-space-2xs text-text-secondary font-caption text-caption">
                  <Icon name="lock" className="text-primary text-[16px]" />
                  <span>Encrypted with NDPR standards. Contact information is shielded from scrapers.</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-surface-tint-blue to-surface-container rounded-2xl p-space-lg flex items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-surface-canvas flex items-center justify-center text-primary shadow-sm">
                    <Icon name="contact_support" className="text-[22px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-semibold text-text-primary">
                      Need merchant onboarding help?
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      VEMTAP Partner Success is available 24/7.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-space-md py-space-xs rounded-lg bg-surface-canvas text-primary font-label-md text-label-md font-semibold shadow-sm hover:shadow transition-all whitespace-nowrap"
                >
                  Talk to Desk
                </button>
              </div>
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
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-secondary hover:text-on-surface hover:bg-surface-subtle font-label-md text-label-md transition-colors"
            >
              <Icon name="save" className="text-[16px]" />
              <span>Save as Draft</span>
            </button>
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={status !== 'idle'}
              onClick={handleComplete}
              className="inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-surface-tint text-on-primary px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === 'idle' ? (
                <>
                  <span>Complete Profile Setup</span>
                  <Icon name="arrow_forward" className="text-[20px]" />
                </>
              ) : (
                <>
                  <Icon name="progress_activity" className="text-[20px] animate-spin" />
                  <span>Saving...</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </BusinessSetupChrome>
  );
}
