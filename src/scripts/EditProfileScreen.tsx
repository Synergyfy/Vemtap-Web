import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { useEditProfile } from '../hooks/useEditProfile';
import { apiErrorMessage } from '../services/errorMessages';

interface EditProfileScreenProps {
  onBack: () => void;
}

const GENDERS = ['Female', 'Male', 'Prefer not to say'] as const;

export function EditProfileScreen({ onBack }: EditProfileScreenProps) {
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
  const fileInput = useRef<HTMLInputElement>(null);
  const saving = account.save.isPending;

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
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2400);
  };

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
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              >
                <Icon name="photo_camera" className="text-[18px]" filled />
              </button>
            </div>
            <button
              type="button"
              onClick={pickPhoto}
              className="mt-space-sm text-primary font-button-secondary text-button-secondary active:opacity-75 transition-opacity"
            >
              Change Photo
            </button>
            <span className="text-text-tertiary font-caption text-caption mt-space-2xs">
              JPG, PNG or WEBP under 4MB
            </span>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-full bg-badge-discount-bg flex items-center justify-center shrink-0">
                <Icon name="verified_user" className="text-[22px] text-badge-discount-text" filled />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-2xs truncate">
                  <span className="font-heading-sm text-label-md text-text-primary truncate">
                    {account.emailVerified ? 'Verified Consumer' : 'Consumer'}
                  </span>
                  {account.emailVerified && (
                    <Icon name="check_circle" className="text-[16px] text-badge-discount-text shrink-0" filled />
                  )}
                </div>
                <span className="text-text-secondary font-caption text-caption">
                  {account.memberSince ? `Member since ${account.memberSince}` : 'VEMTAP member'}
                </span>
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
                    onChange={(event) => edit(setFirstName)(event.target.value)}
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
                    onChange={(event) => edit(setLastName)(event.target.value)}
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
                    value={account.email}
                    readOnly
                    placeholder="No email on file"
                    title="Your sign-in email can't be changed here"
                  />
                </div>
                {account.email && account.emailVerified && (
                  <div className="flex items-center gap-1 bg-badge-discount-bg px-2 py-0.5 rounded-full shrink-0">
                    <Icon name="check" className="text-[13px] text-badge-discount-text" filled />
                    <span className="text-badge-discount-text font-label-sm text-caption">Verified</span>
                  </div>
                )}
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
                    placeholder="Phone number"
                    onChange={(event) => edit(setPhone)(event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-space-2xs">
              <label className="text-text-secondary font-label-sm text-label-sm">Default Shopping District</label>
              <div className="relative h-[52px] w-full bg-surface-container-low rounded-lg px-space-md flex items-center justify-between text-left focus-within:bg-surface-tint-blue transition-colors">
                <div className="flex items-center gap-space-xs min-w-0 flex-1">
                  <Icon name="location_on" className="text-[20px] text-primary shrink-0" filled />
                  <select
                    aria-label="Default shopping district"
                    value={districtId}
                    onChange={(event) => edit(setDistrictId)(event.target.value)}
                    className="w-full appearance-none bg-transparent border-0 outline-none text-text-primary font-body-md text-body-md truncate"
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
                      className="h-9 px-space-md rounded-full bg-surface-tint-blue text-primary font-label-md text-label-md flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
                    >
                      <Icon name="check" className="text-[16px]" filled />
                      <span>{option}</span>
                    </button>
                  ) : (
                    <button
                      key={option}
                      type="button"
                      onClick={() => edit(setGender)(option)}
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
                Your name and phone number are shown to businesses when you redeem a deal, so checkout is quick
                and needs no manual verification.
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
