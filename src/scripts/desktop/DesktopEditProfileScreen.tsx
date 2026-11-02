import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { useEditProfile } from '../../hooks/useEditProfile';
import { apiErrorMessage } from '../../services/errorMessages';

interface DesktopEditProfileScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
}

const GENDERS = ['Female', 'Male', 'Prefer not to say'] as const;

export function DesktopEditProfileScreen({ onNav, onBack }: DesktopEditProfileScreenProps) {
  const account = useEditProfile();
  const [firstName, setFirstName] = useState(account.firstName);
  const [lastName, setLastName] = useState(account.lastName);
  const [phone, setPhone] = useState(account.phone);
  const [gender, setGender] = useState(account.gender);
  const [districtId, setDistrictId] = useState(account.homeDistrictId ?? '');
  const [touched, setTouched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState(account.avatar);
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const saving = account.save.isPending;

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  // Follow the live profile until the customer edits a field.
  useEffect(() => {
    if (touched) return;
    setFirstName(account.firstName);
    setLastName(account.lastName);
    setPhone(account.phone);
    setGender(account.gender);
    setDistrictId(account.homeDistrictId ?? '');
  }, [touched, account.firstName, account.lastName, account.phone, account.gender, account.homeDistrictId]);
  useEffect(() => setAvatar(account.avatar), [account.avatar]);

  const edit = <T,>(setter: (value: T) => void) => (value: T) => {
    setTouched(true);
    setter(value);
  };

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2400);
    timers.current.push(timer);
  };

  const memberSinceLabel = account.memberSince ? `Active member since ${account.memberSince}` : 'VEMTAP member';

  const pickPhoto = () => fileInput.current?.click();

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      setAvatar(await account.uploadAvatar(file));
      showToast('Profile photo updated');
    } catch (error) {
      showToast(apiErrorMessage(error, "Couldn't upload your photo"));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const saveProfile = () => {
    if (saving) return;
    if (!firstName.trim()) {
      showToast('Enter your first name');
      return;
    }
    account.save.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(gender ? { gender } : {}),
        homeDistrictId: districtId || null,
      },
      {
        onSuccess: () => {
          setTouched(false);
          showToast('Profile updated successfully!');
        },
        onError: (error) => showToast(apiErrorMessage(error, "Couldn't save your profile. Please try again.")),
      },
    );
  };

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="account-settings">
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          {toast && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
              <div className="bg-inverse-surface text-inverse-on-surface px-space-md py-space-xs rounded-full shadow-xl flex items-center gap-space-xs text-label-md font-label-md">
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
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(event) => void onPhoto(event.target.files?.[0])}
                  />
                  <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-md bg-surface-container-high">
                    {avatar ? (
                      <img className="w-full h-full object-cover" src={avatar} alt={`${firstName} ${lastName}`.trim() || 'Profile photo'} />
                    ) : (
                      <div className="w-full h-full bg-primary flex items-center justify-center text-on-primary font-heading-md text-heading-md">
                        {initials}
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 rounded-full bg-inverse-surface/50 flex items-center justify-center">
                        <Icon name="progress_activity" className="text-[24px] text-inverse-on-surface animate-spin" />
                      </div>
                    )}
                  </div>
                  <button
                    aria-label="Upload new profile picture"
                    type="button"
                    onClick={pickPhoto}
                    className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                  >
                    <Icon name="photo_camera" className="text-[18px]" filled />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={pickPhoto}
                  className="mt-space-sm text-primary font-button-secondary text-button-secondary hover:opacity-75 transition-opacity"
                >
                  Change Photo
                </button>
                <span className="text-text-tertiary font-caption text-caption mt-space-2xs">
                  JPG, PNG or WEBP under 4MB
                </span>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-10 h-10 rounded-full bg-badge-discount-bg flex items-center justify-center shrink-0">
                    <Icon name="verified_user" className="text-[22px] text-badge-discount-text" filled />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-space-2xs truncate">
                      <span className="font-label-md text-label-md text-text-primary truncate">
                        {account.emailVerified ? 'Verified Consumer' : 'Consumer'}
                      </span>
                      {account.emailVerified && (
                        <Icon name="check_circle" className="text-[16px] text-badge-discount-text shrink-0" filled />
                      )}
                    </div>
                    <span className="text-text-secondary font-caption text-caption">{memberSinceLabel}</span>
                  </div>
                </div>
                <span
                  className={`font-label-sm text-label-sm px-space-xs py-space-2xs rounded-full shrink-0 ${
                    account.emailVerified ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-container text-text-secondary'
                  }`}
                >
                  {account.emailVerified ? 'Email verified' : 'Email unverified'}
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
                      onChange={(event) => edit(setFirstName)(event.target.value)}
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
                      onChange={(event) => edit(setLastName)(event.target.value)}
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
                        value={account.email}
                        readOnly
                        placeholder="No email on file"
                        title="Your sign-in email can't be changed here"
                      />
                      {account.email && account.emailVerified && (
                        <span className="absolute right-3 flex items-center gap-1 bg-badge-discount-bg px-2 py-0.5 rounded-full shrink-0">
                          <Icon name="check" className="text-[13px] text-badge-discount-text" filled />
                          <span className="text-badge-discount-text font-label-sm text-caption">Verified</span>
                        </span>
                      )}
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
                        placeholder="Phone number"
                        onChange={(event) => edit(setPhone)(event.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-space-2xs">
                  <label className="text-text-secondary font-label-sm text-label-sm">Default Shopping District</label>
                  <div className="relative h-[52px] w-full bg-surface-container-low rounded-xl px-space-md flex items-center justify-between focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <div className="flex items-center gap-space-xs min-w-0 flex-1">
                      <Icon name="location_on" className="text-[20px] text-primary shrink-0" filled />
                      <select
                        aria-label="Default shopping district"
                        value={districtId}
                        onChange={(event) => edit(setDistrictId)(event.target.value)}
                        className="w-full appearance-none bg-transparent border-0 outline-none text-text-primary font-body-md text-body-md truncate cursor-pointer"
                      >
                        <option value="">{account.districts.length ? 'Choose your district' : 'No districts available'}</option>
                        {account.districts.map((district) => (
                          <option key={district.id} value={district.id}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Icon name="expand_more" className="text-[20px] text-text-tertiary shrink-0 pointer-events-none" />
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
                          onClick={() => edit(setGender)(option)}
                          className="h-9 px-space-md rounded-full bg-surface-tint-blue text-primary font-label-md text-label-md flex items-center gap-1 shadow-sm hover:scale-105 transition-transform"
                        >
                          <Icon name="check" className="text-[16px]" filled />
                          <span>{option}</span>
                        </button>
                      ) : (
                        <button
                          key={option}
                          type="button"
                          onClick={() => edit(setGender)(option)}
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
                    Your name and phone number are shown to businesses when you redeem a deal, so checkout is quick
                    and needs no manual verification.
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
