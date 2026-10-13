import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface EditProfileScreenProps {
  onBack: () => void;
}

const AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAWtbunYzQIPzZu8IFliEeDjcfIlsT2lnGlhG4NgJvukajbLSvMfRPjRw5e8KNQaWWwogqIKcyb-L5lfxrP5bgB3HcsiOj4RlXpers0FRYqQeMG4gzeeHAQ03OrO0FtEqceG2y7OISa1P6m0lTVodgzascGABQMJyz8jnw-KChw93sJS93sG4r3Zb9bTmgu8IaggCsl4dk-Wx0-w8_vxmB2o1fgfaS2s6uu7jhL5VZ_ZZeKJDTr-bZ1yA';
const AVATAR_ALT =
  'Editorial warm studio portrait of Zainab Ahmed, a radiant 28-year-old Nigerian woman with stylish braided hair, luminous skin, and an authentic gentle smile, wearing a modern cobalt blue collar shirt, soft warm ambient lighting, natural depth of field, high-fidelity lifestyle photo';

const GENDERS = ['Female', 'Male', 'Prefer not to say'] as const;
type Gender = (typeof GENDERS)[number];

export function EditProfileScreen({ onBack }: EditProfileScreenProps) {
  const [firstName, setFirstName] = useState('Zainab');
  const [lastName, setLastName] = useState('Ahmed');
  const [email, setEmail] = useState('zainab.ahmed@example.com');
  const [phone, setPhone] = useState('803 555 0192');
  const [birthday, setBirthday] = useState('14 October');
  const [gender, setGender] = useState<Gender>('Female');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2400);
  };

  const saveProfile = () => {
    if (saving) return;
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      showToast('Profile updated successfully!');
    }, 700);
  };

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm">
        <div className="h-16 px-margin flex items-center justify-between">
          <button
            aria-label="Go back"
            type="button"
            onClick={onBack}
            className="w-11 h-11 -ml-space-2xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high/60 transition-colors"
          >
            <Icon name="arrow_back_ios_new" className="text-[24px]" />
          </button>
          <div className="flex-1 text-center px-space-2xs truncate">
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">Edit Profile</h1>
          </div>
          <div className="flex items-center justify-end min-w-[44px]">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full">
        {toast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
            <div className="bg-inverse-surface text-inverse-on-surface px-space-md py-space-xs rounded-full shadow-xl flex items-center gap-space-xs text-label-md font-label-md">
              <Icon name="check_circle" className="text-[18px] text-badge-discount-text" filled />
              <span>{toast}</span>
            </div>
          </div>
        )}

        <div className="px-margin pt-space-md pb-space-3xl flex flex-col gap-space-lg">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden shadow-md bg-surface-container-high">
                <img className="w-full h-full object-cover" src={AVATAR_URL} data-alt={AVATAR_ALT} alt={AVATAR_ALT} />
              </div>
              <button
                aria-label="Upload new profile picture"
                type="button"
                onClick={() => showToast('Photo selector opened')}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              >
                <Icon name="photo_camera" className="text-[18px]" filled />
              </button>
            </div>
            <button
              type="button"
              onClick={() => showToast('Photo selector opened')}
              className="mt-space-sm text-primary font-button-secondary text-button-secondary active:opacity-75 transition-opacity"
            >
              Change Photo
            </button>
            <span className="text-text-tertiary font-caption text-caption mt-space-2xs">
              JPG, PNG or WEBP under 5MB
            </span>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-full bg-badge-discount-bg flex items-center justify-center shrink-0">
                <Icon name="verified_user" className="text-[22px] text-badge-discount-text" filled />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-2xs truncate">
                  <span className="font-heading-sm text-label-md text-text-primary truncate">Verified Consumer</span>
                  <Icon name="check_circle" className="text-[16px] text-badge-discount-text shrink-0" filled />
                </div>
                <span className="text-text-secondary font-caption text-caption">Active member since Sept 2024</span>
              </div>
            </div>
            <span className="bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm px-space-xs py-space-2xs rounded-full shrink-0">
              Level 2
            </span>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="grid grid-cols-2 gap-space-sm">
              <div className="flex flex-col gap-space-2xs">
                <label className="text-text-secondary font-label-sm text-label-sm" htmlFor="firstName">
                  First Name
                </label>
                <div className="h-[52px] bg-surface-container-low rounded-lg px-space-md flex items-center focus-within:bg-surface-tint-blue focus-within:text-primary transition-colors">
                  <input
                    className="w-full bg-transparent border-0 outline-none text-text-primary font-body-md text-body-md"
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-space-2xs">
                <label className="text-text-secondary font-label-sm text-label-sm" htmlFor="lastName">
                  Last Name
                </label>
                <div className="h-[52px] bg-surface-container-low rounded-lg px-space-md flex items-center focus-within:bg-surface-tint-blue focus-within:text-primary transition-colors">
                  <input
                    className="w-full bg-transparent border-0 outline-none text-text-primary font-body-md text-body-md"
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-space-2xs">
              <label className="text-text-secondary font-label-sm text-label-sm" htmlFor="emailInput">
                Email Address
              </label>
              <div className="h-[52px] bg-surface-container-low rounded-lg px-space-md flex items-center justify-between gap-space-xs focus-within:bg-surface-tint-blue transition-colors">
                <div className="flex items-center gap-space-xs flex-1 min-w-0">
                  <Icon name="mail" className="text-[20px] text-text-tertiary shrink-0" />
                  <input
                    className="w-full bg-transparent border-0 outline-none text-text-primary font-body-md text-body-md truncate"
                    id="emailInput"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <div className="flex items-center gap-1 bg-badge-discount-bg px-2 py-0.5 rounded-full shrink-0">
                  <Icon name="check" className="text-[13px] text-badge-discount-text" filled />
                  <span className="text-badge-discount-text font-label-sm text-caption">Verified</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-space-2xs">
              <label className="text-text-secondary font-label-sm text-label-sm" htmlFor="phoneInput">
                Phone Number
              </label>
              <div className="h-[52px] bg-surface-container-low rounded-lg px-space-md flex items-center justify-between gap-space-xs focus-within:bg-surface-tint-blue transition-colors">
                <div className="flex items-center gap-space-xs flex-1 min-w-0">
                  <div className="flex items-center overflow-hidden rounded-[2px] w-5 h-3.5 shrink-0 shadow-sm">
                    <div className="w-1/3 h-full bg-[#008751]" />
                    <div className="w-1/3 h-full bg-[#FFFFFF]" />
                    <div className="w-1/3 h-full bg-[#008751]" />
                  </div>
                  <span className="text-text-secondary font-body-md text-body-md">+234</span>
                  <input
                    className="w-full bg-transparent border-0 outline-none text-text-primary font-body-md text-body-md"
                    id="phoneInput"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>
                <div className="flex items-center gap-1 bg-badge-discount-bg px-2 py-0.5 rounded-full shrink-0">
                  <Icon name="check" className="text-[13px] text-badge-discount-text" filled />
                  <span className="text-badge-discount-text font-label-sm text-caption">Verified</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-space-2xs">
              <label className="text-text-secondary font-label-sm text-label-sm">Default Shopping District</label>
              <button
                type="button"
                onClick={() => showToast('Opening Abuja neighborhood selector')}
                className="h-[52px] w-full bg-surface-container-low rounded-lg px-space-md flex items-center justify-between text-left active:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-space-xs min-w-0">
                  <Icon name="location_on" className="text-[20px] text-primary shrink-0" filled />
                  <span className="text-text-primary font-body-md text-body-md truncate">Apo District, Abuja, NG</span>
                </div>
                <Icon name="chevron_right" className="text-[20px] text-text-tertiary shrink-0" />
              </button>
            </div>

            <div className="flex flex-col gap-space-2xs">
              <div className="flex items-center justify-between">
                <label className="text-text-secondary font-label-sm text-label-sm" htmlFor="birthdayInput">
                  Birthday (For merchant perks)
                </label>
                <span className="text-text-tertiary font-caption text-caption">Optional</span>
              </div>
              <div className="h-[52px] bg-surface-container-low rounded-lg px-space-md flex items-center justify-between gap-space-xs focus-within:bg-surface-tint-blue transition-colors">
                <div className="flex items-center gap-space-xs flex-1 min-w-0">
                  <Icon name="featured_seasonal_and_gifts" className="text-[20px] text-tertiary shrink-0" filled />
                  <input
                    className="w-full bg-transparent border-0 outline-none text-text-primary font-body-md text-body-md"
                    id="birthdayInput"
                    type="text"
                    value={birthday}
                    onChange={(event) => setBirthday(event.target.value)}
                  />
                </div>
                <span className="text-badge-discount-text text-label-sm font-label-sm bg-badge-discount-bg px-2 py-0.5 rounded-full shrink-0">
                  Treats active
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-space-xs pt-space-2xs">
              <label className="text-text-secondary font-label-sm text-label-sm">Gender</label>
              <div className="flex gap-space-xs flex-wrap">
                {GENDERS.map((option) =>
                  gender === option ? (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setGender(option)}
                      className="h-9 px-space-md rounded-full bg-surface-tint-blue text-primary font-label-md text-label-md flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
                    >
                      <Icon name="check" className="text-[16px]" filled />
                      <span>{option}</span>
                    </button>
                  ) : (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setGender(option)}
                      className="h-9 px-space-md rounded-full bg-surface-container-low text-text-secondary font-label-md text-label-md active:bg-surface-container transition-colors"
                    >
                      {option}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="bg-surface-tint-blue rounded-xl p-space-md flex items-start gap-space-sm shadow-sm">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="local_mall" className="text-[20px] text-on-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-text-primary font-heading-sm text-label-md">Instant Tap &amp; Checkout Ready</span>
              <p className="text-text-secondary font-caption text-caption mt-0.5 leading-relaxed">
                Your profile metadata ensures contactless NFC redemption and customized dining discounts in Abuja
                venues without manual verification.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-space-xs mt-space-2xs">
            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="w-full h-[52px] bg-primary-container text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-space-xs shadow-lg active:scale-[0.98] transition-transform disabled:opacity-80"
            >
              {saving && <Icon name="progress_activity" className="text-[20px] animate-spin" />}
              <span>{saving ? 'Saving…' : 'Save Changes'}</span>
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full h-11 text-text-secondary font-button-secondary text-button-secondary rounded-lg flex items-center justify-center active:bg-surface-container-high/50 transition-colors"
            >
              Discard Changes
            </button>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
