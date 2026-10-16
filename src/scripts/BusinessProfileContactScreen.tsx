import { useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { SocialChannelPicker } from '../components/SocialChannelPicker';
import { useProfile } from '../context/ProfileContext';
import {
  CHANNEL_PLATFORMS,
  CHANNEL_PLATFORM_BY_ID,
  normalizeChannel,
  type ChannelPlatformId,
} from '../utils/socialChannels';
import type { BusinessProfileDraft } from './BusinessOnboardingScreen';

interface BusinessProfileContactScreenProps {
  draft: BusinessProfileDraft;
  onChange: (patch: Partial<BusinessProfileDraft>) => void;
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

type Status = 'idle' | 'saving';

const CORE_PLATFORMS: ChannelPlatformId[] = ['instagram', 'whatsapp', 'x'];

const seedChannels = (draft: BusinessProfileDraft): ChannelDraft[] =>
  (['instagram', 'whatsapp', 'x'] as const).map((platform) => ({
    id: platform,
    platform,
    value: draft[platform] ?? '',
    touched: false,
  }));

export function BusinessProfileContactScreen({
  draft,
  onChange,
  onBack,
  onNext,
  onSaveDraft,
}: BusinessProfileContactScreenProps) {
  const profile = useProfile();
  const [status, setStatus] = useState<Status>('idle');
  const [channels, setChannels] = useState<ChannelDraft[]>(() => seedChannels(draft));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [emailEditing, setEmailEditing] = useState(false);
  const channelSeq = useRef(0);
  const channelInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const usedPlatforms = channels.map((channel) => channel.platform);
  const allPlatformsAdded = usedPlatforms.length >= CHANNEL_PLATFORMS.length;

  const setChannelValue = (id: string, value: string) => {
    const channel = channels.find((item) => item.id === id);
    if (channel && CORE_PLATFORMS.includes(channel.platform)) {
      onChange({ [channel.platform]: value });
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
    window.setTimeout(onNext, 900);
  };

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go Back"
              className="w-11 h-11 flex items-center justify-center -ml-2 text-on-surface hover:text-primary transition-colors focus:outline-none shrink-0"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate max-w-[210px]">Basic Information</h1>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-8">
        <div className="px-margin pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-space-xs">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-badge-discount-bg text-badge-discount-text">
                <Icon name="check" className="text-[14px]" filled />
              </span>
              <span className="font-label-sm text-label-sm text-text-secondary">Step 3 of 3</span>
            </div>
            <span className="font-label-sm text-label-sm text-primary-container font-semibold">100% Complete</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden flex gap-1">
            <div className="h-full flex-1 bg-primary-container rounded-full transition-all duration-500" />
            <div className="h-full flex-1 bg-primary-container rounded-full transition-all duration-500" />
            <div className="h-full flex-1 bg-primary-container rounded-full transition-all duration-500" />
          </div>
        </div>

        <div className="px-margin pt-3 pb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-tint-blue text-primary-container mb-2.5">
            <Icon name="contact_support" className="text-[16px]" />
            <span className="font-label-sm text-label-sm font-semibold">Final Step</span>
          </div>
          <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
            How customers connect with you
          </h2>
          <p className="font-body-md text-body-md text-text-secondary mt-1.5 leading-snug">
            Make it easy for local customers to ask questions, place orders, and coordinate voucher redemptions.
          </p>
        </div>

        <div className="px-margin flex flex-col gap-4">
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="font-label-md text-label-md text-text-primary font-medium" htmlFor="primary-phone">
                Primary Business Phone / WhatsApp
              </label>
              <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary-container font-semibold">
                Required
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="h-[52px] px-3 bg-surface-subtle hover:bg-surface-container-low active:scale-[0.98] transition-all rounded-xl flex items-center gap-1.5 shrink-0 focus:outline-none focus:bg-surface-container"
                type="button"
              >
                <span aria-label="Nigeria Flag" className="text-[18px] leading-none" role="img">
                  🇳🇬
                </span>
                <span className="font-label-md text-label-md text-text-primary font-semibold">+234</span>
                <Icon name="keyboard_arrow_down" className="text-text-tertiary text-[18px]" />
              </button>
              <div className="relative flex-1 flex items-center">
                <input
                  className="w-full h-[52px] pl-4 pr-11 bg-surface-subtle rounded-xl font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-tint-blue transition-colors"
                  id="primary-phone"
                  placeholder="800 000 0000"
                  type="tel"
                  value={draft.phone}
                  onChange={(event) => onChange({ phone: event.target.value.replace(/[^\d\s]/g, '') })}
                />
                <Icon className="text-text-tertiary absolute right-3 pointer-events-none text-[20px]" name="call" />
              </div>
            </div>
            <p className="font-caption text-caption text-text-secondary mt-2 flex items-start gap-1">
              <Icon className="text-text-tertiary text-[15px] shrink-0 mt-0.5" name="info" />
              <span>Used for voucher redemption verification codes and customer queries.</span>
            </p>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="font-label-md text-label-md text-text-primary font-medium" htmlFor="official-email">
                Official Business Email
              </label>
              {isAccountEmail ? (
                <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-semibold flex items-center gap-1">
                  <Icon name="verified_user" className="text-[14px]" />
                  Linked to account
                </span>
              ) : (
                <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary-container font-semibold">
                  Needs verification
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                className={`w-full h-[52px] pl-4 pr-11 bg-surface-subtle rounded-xl font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-tint-blue transition-colors ${
                  emailLocked ? 'cursor-not-allowed' : ''
                }`}
                id="official-email"
                placeholder="support@yourbusiness.ng"
                type="email"
                readOnly={emailLocked}
                value={draft.email}
                onChange={(event) => onChange({ email: event.target.value })}
              />
              {emailLocked ? (
                <button
                  aria-label="Edit business email"
                  className="absolute right-3 flex items-center justify-center text-primary-container hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setEmailEditing(true)}
                >
                  <Icon className="text-[20px]" name="edit" />
                </button>
              ) : (
                <Icon className="text-text-tertiary absolute right-3 pointer-events-none text-[20px]" name="mail" />
              )}
            </div>
            <p className="font-caption text-caption text-text-secondary mt-2 flex items-start gap-1">
              <Icon className="text-text-tertiary text-[15px] shrink-0 mt-0.5" name="verified_user" />
              <span>
                {isAccountEmail
                  ? 'Pulled from your verified VEMTAP account. Editing needs a re-verification check.'
                  : 'For settlement invoices — we will re-verify this address before launch.'}
              </span>
            </p>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="font-label-md text-label-md text-text-primary font-medium" htmlFor="business-website">
                Website or Online Menu (Optional)
              </label>
            </div>
            <div className="relative flex items-center">
              <input
                className="w-full h-[52px] pl-4 pr-11 bg-surface-subtle rounded-xl font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-tint-blue transition-colors"
                id="business-website"
                placeholder="https://yourmenu.com"
                type="url"
                value={draft.website}
                onChange={(event) => onChange({ website: event.target.value })}
              />
              <Icon className="text-text-tertiary absolute right-3 pointer-events-none text-[20px]" name="public" />
            </div>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="font-label-md text-label-md text-text-primary font-semibold">
                  Social &amp; Messaging Presences
                </h3>
                <p className="font-caption text-caption text-text-secondary">
                  Paste an @handle or link — we build the destination
                </p>
              </div>
              <div className="relative">
                <button
                  aria-label="Add social presence"
                  aria-haspopup="menu"
                  aria-expanded={pickerOpen}
                  className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center text-primary-container hover:bg-surface-tint-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                  disabled={allPlatformsAdded}
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
            </div>
            <div className="flex flex-col gap-2.5 mt-3">
              {channels.map((channel) => {
                const platform = CHANNEL_PLATFORM_BY_ID[channel.platform];
                const result = normalizeChannel(channel.platform, channel.value);
                const showError = channel.touched && channel.value.trim().length > 0 && !result.ok;
                const isCore = CORE_PLATFORMS.includes(channel.platform);
                return (
                  <div key={channel.id} className="flex items-start justify-between gap-2 p-3 rounded-xl bg-surface-subtle">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${platform.iconClass}`}
                      >
                        <Icon name={platform.icon} className="text-[20px]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="flex items-center gap-1 font-label-sm text-label-sm text-text-secondary">
                          {platform.label}
                          {result.ok ? <Icon className="text-badge-discount-text text-[14px]" name="check_circle" filled /> : null}
                        </span>
                        <input
                          aria-label={`${platform.label} ${platform.kind === 'phone' ? 'phone number' : 'handle'}`}
                          aria-invalid={showError}
                          className="block w-full font-label-md text-label-md text-text-primary font-medium bg-transparent border-none outline-none focus:ring-0 p-0 placeholder:text-text-tertiary"
                          ref={(node) => {
                            channelInputs.current[channel.id] = node;
                          }}
                          placeholder={platform.placeholder}
                          type="text"
                          value={channel.value}
                          onBlur={() => markChannelTouched(channel.id)}
                          onChange={(event) => setChannelValue(channel.id, event.target.value)}
                        />
                        {showError ? (
                          <span className="flex items-center gap-1 font-caption text-caption text-error mt-0.5">
                            <Icon className="text-[13px]" name="error" />
                            {result.error}
                          </span>
                        ) : result.ok ? (
                          <a
                            className="flex items-center gap-1 font-caption text-caption text-primary-container mt-0.5 min-w-0"
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Icon className="text-[13px] shrink-0" name="link" />
                            <span className="truncate">{result.display}</span>
                          </a>
                        ) : (
                          <span className="block font-caption text-caption text-text-tertiary mt-0.5">
                            {platform.hint}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isCore ? (
                        <button
                          aria-label={`Remove ${platform.label}`}
                          className="w-7 h-7 flex items-center justify-center text-text-tertiary hover:text-error transition-colors"
                          type="button"
                          onClick={() => removeChannel(channel.id)}
                        >
                          <Icon name="delete" className="text-[16px]" />
                        </button>
                      ) : null}
                      <button
                        aria-label={`Edit ${platform.label}`}
                        className="w-7 h-7 flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors"
                        type="button"
                        onClick={() => channelInputs.current[channel.id]?.focus()}
                      >
                        <Icon name="edit" className="text-[16px]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
            <h3 className="font-label-md text-label-md text-text-primary font-semibold mb-3">
              Direct Customer Contact Preferences
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-md text-label-md text-text-primary font-medium">
                      Allow In-App Direct Chat
                    </span>
                    <span className="font-caption text-caption px-1.5 py-0.2 bg-badge-discount-bg text-badge-discount-text rounded font-semibold">
                      Fast
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Recommended - customers expect quick replies within 15 minutes.
                  </p>
                </div>
                <button
                  aria-checked={draft.prefs.inApp}
                  aria-label="Allow In-App Direct Chat"
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none mt-0.5 ${
                    draft.prefs.inApp ? 'bg-primary-container' : 'bg-surface-dim'
                  }`}
                  role="switch"
                  type="button"
                  onClick={() => onChange({ prefs: { ...draft.prefs, inApp: !draft.prefs.inApp } })}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-surface-canvas shadow transition duration-200 ease-in-out mt-0.5 ${
                      draft.prefs.inApp ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="font-label-md text-label-md text-text-primary font-medium block">
                    Receive deal claims via WhatsApp alerts
                  </span>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Instant notification ping each time a nearby customer claims your voucher.
                  </p>
                </div>
                <button
                  aria-checked={draft.prefs.whatsapp}
                  aria-label="Receive deal claims via WhatsApp alerts"
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none mt-0.5 ${
                    draft.prefs.whatsapp ? 'bg-primary-container' : 'bg-surface-dim'
                  }`}
                  role="switch"
                  type="button"
                  onClick={() => onChange({ prefs: { ...draft.prefs, whatsapp: !draft.prefs.whatsapp } })}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-surface-canvas shadow transition duration-200 ease-in-out mt-0.5 ${
                      draft.prefs.whatsapp ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-tint-blue flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
              <Icon name="rocket_launch" className="text-primary text-[22px]" />
            </div>
            <div className="min-w-0">
              <h4 className="font-label-sm text-label-sm text-text-primary font-semibold">Almost Ready to Launch!</h4>
              <p className="font-caption text-caption text-text-secondary">
                Urban Grill Lagos will be visible to 1,420+ food lovers within 3 km.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              className="w-full h-[52px] bg-primary-container hover:bg-primary active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
              disabled={status !== 'idle'}
              type="button"
              onClick={handleComplete}
            >
              {status === 'idle' ? (
                <>
                  <span className="font-button-primary text-button-primary text-on-primary font-semibold">
                    Complete Profile Setup
                  </span>
                  <Icon className="text-on-primary text-[20px]" name="arrow_forward" />
                </>
              ) : (
                <>
                  <Icon className="text-[20px] text-on-primary animate-spin" name="progress_activity" />
                  <span className="font-button-primary text-button-primary text-on-primary font-semibold">
                    Saving...
                  </span>
                </>
              )}
            </button>
            <button
              className="w-full h-11 bg-transparent hover:bg-surface-container-low active:scale-[0.98] transition-all rounded-xl flex items-center justify-center font-button-secondary text-button-secondary text-text-secondary focus:outline-none"
              type="button"
              onClick={onSaveDraft}
            >
              Save as Draft
            </button>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
