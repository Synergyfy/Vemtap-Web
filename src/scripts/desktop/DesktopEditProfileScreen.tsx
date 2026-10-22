import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { useProfile } from '../../context/ProfileContext';

interface DesktopEditProfileScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
}

const AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAWtbunYzQIPzZu8IFliEeDjcfIlsT2lnGlhG4NgJvukajbLSvMfRPjRw5e8KNQaWWwogqIKcyb-L5lfxrP5bgB3HcsiOj4RlXpers0FRYqQeMG4gzeeHAQ03OrO0FtEqceG2y7OISa1P6m0lTVodgzascGABQMJyz8jnw-KChw93sJS93sG4r3Zb9bTmgu8IaggCsl4dk-Wx0-w8_vxmB2o1fgfaS2s6uu7jhL5VZ_ZZeKJDTr-bZ1yA';
const AVATAR_ALT =
  'Editorial warm studio portrait of Zainab Ahmed, a radiant 28-year-old Nigerian woman with stylish braided hair, luminous skin, and an authentic gentle smile, wearing a modern cobalt blue collar shirt, soft warm ambient lighting, natural depth of field, high-fidelity lifestyle photo';

const GENDERS = ['Female', 'Male', 'Prefer not to say'] as const;
type Gender = (typeof GENDERS)[number];

export function DesktopEditProfileScreen({ onNav, onBack }: DesktopEditProfileScreenProps) {
  const profile = useProfile();
  const [firstName, setFirstName] = useState(profile.firstName || 'User');
  const [lastName, setLastName] = useState(profile.lastName || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [birthday, setBirthday] = useState('14 October');
  const [gender, setGender] = useState<Gender>('Female');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2400);
    timers.current.push(timer);
  };

  const memberSinceLabel = (() => {
    if (!profile.createdAt) return 'New member';
    const date = new Date(profile.createdAt);
    if (Number.isNaN(date.getTime())) return 'New member';
    return `Active member since ${new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date)}`;
  })();

  const saveProfile = () => {
    if (saving) return;
    setSaving(true);
    const timer = window.setTimeout(() => {
      setSaving(false);
      showToast('Profile updated successfully!');
    }, 700);
    timers.current.push(timer);
  };

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="account-settings">
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          {toast && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
              <div className="bg-text-primary text-on-primary px-space-md py-space-xs rounded-full shadow-xl flex items-center gap-space-xs text-label-md font-label-md">
                <Icon name="check_circle" className="text-[18px] text-badge-discount-text" filled />
                <span>{toast}</span>
              </div>
            </div>
          )}

          <nav className="flex items-center gap-2 font-label-sm text-label-sm text-text-secondary mb-6">
            <button className="hover:text-primary transition-colors" onClick={() => onNav('home')} type="button">
              Home
            </button>
            <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
            <button className="hover:text-primary transition-colors" onClick={onBack} type="button">
              Account
            </button>
            <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
            <span className="text-text-primary font-semibold">Edit Profile</span>
          </nav>

          <div className="mb-10 max-w-2xl">
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Edit Profile</h1>
            <p className="font-body-lg text-body-lg text-text-secondary mt-2">
              Update your personal details, verified contact channels, and default shopping district so vouchers and
              bookings always reach you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-10 items-start">
            <aside className="w-full flex flex-col gap-6 lg:sticky lg:top-24">
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full overflow-hidden shadow-md bg-surface-container-high">
                    <img className="w-full h-full object-cover" src={AVATAR_URL} alt={AVATAR_ALT} />
                  </div>
                  <button
                    aria-label="Upload new profile picture"
                    type="button"
                    onClick={() => showToast('Photo selector opened')}
                    className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                  >
                    <Icon name="photo_camera" className="text-[18px]" filled />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Photo selector opened')}
                  className="mt-space-sm text-primary font-button-secondary text-button-secondary hover:opacity-75 transition-opacity"
                >
                  Change Photo
                </button>
                <span className="text-text-tertiary font-caption text-caption mt-space-2xs">
                  JPG, PNG or WEBP under 5MB
                </span>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-10 h-10 rounded-full bg-badge-discount-bg flex items-center justify-center shrink-0">
                    <Icon name="verified_user" className="text-[22px] text-badge-discount-text" filled />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-space-2xs truncate">
                      <span className="font-label-md text-label-md text-text-primary truncate">Verified Consumer</span>
                      <Icon name="check_circle" className="text-[16px] text-badge-discount-text shrink-0" filled />
                    </div>
                    <span className="text-text-secondary font-caption text-caption">{memberSinceLabel}</span>
                  </div>
                </div>
                <span className="bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm px-space-xs py-space-2xs rounded-full shrink-0">
                  Level 2
                </span>
              </div>
            </aside>

            <div className="w-full flex flex-col gap-6">
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                  <div className="flex flex-col gap-space-2xs">
                    <label className="text-text-secondary font-label-sm text-label-sm" htmlFor="firstName">
                      First Name
                    </label>
                    <input
                      className="w-full h-[52px] px-4 bg-surface-container-low rounded-xl text-text-primary font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-space-2xs">
                    <label className="text-text-secondary font-label-sm text-label-sm" htmlFor="lastName">
                      Last Name
                    </label>
                    <input
                      className="w-full h-[52px] px-4 bg-surface-container-low rounded-xl text-text-primary font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                  <div className="flex flex-col gap-space-2xs">
                    <label className="text-text-secondary font-label-sm text-label-sm" htmlFor="emailInput">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Icon name="mail" className="absolute left-4 text-[20px] text-text-tertiary shrink-0" />
                      <input
                        className="w-full h-[52px] pl-12 pr-24 bg-surface-container-low rounded-xl text-text-primary font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        id="emailInput"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                      <span className="absolute right-3 flex items-center gap-1 bg-badge-discount-bg px-2 py-0.5 rounded-full shrink-0">
                        <Icon name="check" className="text-[13px] text-badge-discount-text" filled />
                        <span className="text-badge-discount-text font-label-sm text-caption">Verified</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-2xs">
                    <label className="text-text-secondary font-label-sm text-label-sm" htmlFor="phoneInput">
                      Phone Number
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 flex items-center gap-space-xs pointer-events-none">
                        <div className="flex items-center overflow-hidden rounded-[2px] w-5 h-3.5 shrink-0 shadow-sm">
                          <div className="w-1/3 h-full bg-[#008751]" />
                          <div className="w-1/3 h-full bg-[#FFFFFF]" />
                          <div className="w-1/3 h-full bg-[#008751]" />
                        </div>
                        <span className="text-text-secondary font-body-md text-body-md">+234</span>
                      </div>
                      <input
                        className="w-full h-[52px] pl-24 pr-24 bg-surface-container-low rounded-xl text-text-primary font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        id="phoneInput"
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                      />
                      <span className="absolute right-3 flex items-center gap-1 bg-badge-discount-bg px-2 py-0.5 rounded-full shrink-0">
                        <Icon name="check" className="text-[13px] text-badge-discount-text" filled />
                        <span className="text-badge-discount-text font-label-sm text-caption">Verified</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-space-2xs">
                  <label className="text-text-secondary font-label-sm text-label-sm">Default Shopping District</label>
                  <button
                    type="button"
                    onClick={() => showToast('Opening Abuja neighborhood selector')}
                    className="h-[52px] w-full bg-surface-container-low rounded-xl px-space-md flex items-center justify-between text-left hover:bg-surface-container-high transition-colors"
                  >
                    <div className="flex items-center gap-space-xs min-w-0">
                      <Icon name="location_on" className="text-[20px] text-primary shrink-0" filled />
                      <span className="text-text-primary font-body-md text-body-md truncate">
                        Apo District, Abuja, NG
                      </span>
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
                  <div className="relative flex items-center">
                    <Icon
                      name="featured_seasonal_and_gifts"
                      className="absolute left-4 text-[20px] text-tertiary shrink-0"
                      filled
                    />
                    <input
                      className="w-full h-[52px] pl-12 pr-32 bg-surface-container-low rounded-xl text-text-primary font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      id="birthdayInput"
                      type="text"
                      value={birthday}
                      onChange={(event) => setBirthday(event.target.value)}
                    />
                    <span className="absolute right-3 text-badge-discount-text text-label-sm font-label-sm bg-badge-discount-bg px-2 py-0.5 rounded-full shrink-0">
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
                          className="h-9 px-space-md rounded-full bg-surface-tint-blue text-primary font-label-md text-label-md flex items-center gap-1 shadow-sm hover:scale-105 transition-transform"
                        >
                          <Icon name="check" className="text-[16px]" filled />
                          <span>{option}</span>
                        </button>
                      ) : (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setGender(option)}
                          className="h-9 px-space-md rounded-full bg-surface-container-low text-text-secondary font-label-md text-label-md hover:bg-surface-container-high transition-colors"
                        >
                          {option}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-surface-tint-blue rounded-xl p-space-md flex items-start gap-space-sm shadow-sm">
                <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0 mt-0.5">
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

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-space-xs">
                <button
                  type="button"
                  onClick={onBack}
                  className="h-11 px-space-md text-text-secondary font-button-secondary text-button-secondary rounded-lg flex items-center justify-center hover:bg-surface-container-high/50 transition-colors"
                >
                  Discard Changes
                </button>
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="h-[52px] px-space-lg bg-primary-container text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-space-xs shadow-lg hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-80"
                >
                  {saving && <Icon name="progress_activity" className="text-[20px] animate-spin" />}
                  <span>{saving ? 'Saving…' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
