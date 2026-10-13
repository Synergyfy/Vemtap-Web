import { useRef, useState, type ChangeEvent } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface ProfileSetupScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

type Status = 'idle' | 'saving';

const PIN_LENGTH = 6;

function PinBoxes({
  value,
  focused,
  onChange,
  onFocus,
  onBlur,
  label,
  inputRef,
  revealed,
}: {
  value: string;
  focused: boolean;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  label: string;
  inputRef?: (element: HTMLInputElement | null) => void;
  revealed: boolean;
}) {
  return (
    <div className="relative flex w-full max-w-[345px] items-center justify-between gap-2 mx-auto">
      {Array.from({ length: PIN_LENGTH }, (_, index) => {
        const filled = index < value.length;
        const isActive = focused && index === value.length;
        return (
          <div
            key={index}
            className={`w-[48px] h-[56px] rounded-xl flex items-center justify-center text-center font-heading-md text-heading-md font-semibold select-none shadow-sm transition-all duration-150 ${
              filled
                ? 'bg-surface-subtle text-text-primary'
                : isActive
                  ? 'bg-surface-canvas text-primary-container shadow-md'
                  : 'bg-surface-container-low text-text-tertiary'
            }`}
          >
            {filled ? (revealed ? value[index] : '•') : ''}
          </div>
        );
      })}
      <input
        ref={inputRef}
        aria-label={label}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
        inputMode="numeric"
        maxLength={PIN_LENGTH}
        type="password"
        value={value}
        onBlur={onBlur}
        onFocus={onFocus}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH))
        }
      />
    </div>
  );
}

export function ProfileSetupScreen({ onBack, onComplete }: ProfileSetupScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinFocused, setPinFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [pinRevealed, setPinRevealed] = useState(false);
  const [status, setStatus] = useState<Status>('idle');

  const confirmInputRef = useRef<HTMLInputElement | null>(null);

  const handlePinChange = (value: string) => {
    setPin(value);
    if (value.length === PIN_LENGTH) {
      window.setTimeout(() => confirmInputRef.current?.focus(), 0);
    }
  };

  const pinsMatch = pin.length === PIN_LENGTH && pin === pinConfirm;
  const isValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    phone.replace(/\D/g, '').length >= 7 &&
    pinsMatch;

  const handleComplete = () => {
    if (!isValid || status !== 'idle') return;
    setStatus('saving');
    window.setTimeout(onComplete, 900);
  };

  return (
    <AppScreen>
      <ScreenHeader title="Profile Setup" onBack={onBack} />

      <div className="flex flex-col w-full flex-1">
        <div className="px-margin pt-space-xs pb-space-sm flex flex-col gap-space-xs bg-surface-canvas">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-2xs bg-surface-container-high px-space-xs py-space-2xs rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
              <span className="font-label-sm text-label-sm text-primary font-semibold">Step 3 of 3</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary-container" />
              <div className="w-2 h-2 rounded-full bg-primary-container" />
              <div className="w-6 h-2 rounded-full bg-primary-container" />
            </div>
          </div>
          <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary-container rounded-full w-full" />
          </div>
        </div>

        <div className="px-margin pt-space-xs pb-space-md">
          <h2 className="font-heading-lg text-heading-lg text-text-primary font-semibold tracking-tight">
            Tell us about yourself
          </h2>
          <p className="font-body-md text-body-md text-text-secondary mt-1">
            Complete your profile and set your security PIN to access your account and claimed deals.
          </p>
        </div>

        <div className="flex flex-col px-margin gap-space-lg pb-space-3xl">
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary">
                <Icon name="badge" className="text-[16px]" />
              </span>
              <span className="font-label-md text-label-md text-text-primary font-semibold">Personal Information</span>
            </div>

            <div className="flex flex-col gap-space-sm">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-text-secondary font-medium" htmlFor="first-name">
                  First name
                </label>
                <div className="bg-surface-subtle rounded-xl flex items-center px-4 h-[50px] shadow-sm">
                  <input
                    autoComplete="given-name"
                    className="w-full bg-transparent border-none outline-none font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:ring-0"
                    id="first-name"
                    placeholder="e.g. John"
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-text-secondary font-medium" htmlFor="last-name">
                  Last name
                </label>
                <div className="bg-surface-subtle rounded-xl flex items-center px-4 h-[50px] shadow-sm">
                  <input
                    autoComplete="family-name"
                    className="w-full bg-transparent border-none outline-none font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:ring-0"
                    id="last-name"
                    placeholder="e.g. Doe"
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-text-secondary font-medium" htmlFor="phone-number">
                Phone number
              </label>
              <div className="bg-surface-subtle rounded-xl flex items-center h-[50px] px-3 shadow-sm gap-2">
                <div className="flex items-center gap-1.5 bg-surface-canvas rounded-lg px-2.5 py-1.5 shadow-sm">
                  <svg
                    aria-hidden="true"
                    className="w-5 h-3.5 rounded-[2px] overflow-hidden"
                    fill="none"
                    viewBox="0 0 6 4"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect fill="#008753" height="4" width="2" />
                    <rect fill="#FFFFFF" height="4" width="2" x="2" />
                    <rect fill="#008753" height="4" width="2" x="4" />
                  </svg>
                  <span className="font-label-sm text-label-sm text-text-primary font-semibold">+234</span>
                  <Icon name="expand_more" className="text-[14px] text-text-tertiary" />
                </div>
                <input
                  className="flex-1 bg-transparent border-none outline-none font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:ring-0"
                  id="phone-number"
                  inputMode="numeric"
                  placeholder="801 234 5678"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value.replace(/[^\d\s]/g, ''))}
                />
              </div>
            </div>
          </div>

          <div className="bg-surface-subtle rounded-xl p-space-md flex flex-col gap-space-md shadow-sm">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary">
                    <Icon name="lock" className="text-[18px]" />
                  </span>
                <span className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                  Create your 6-digit PIN
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-caption text-caption font-semibold px-2 py-0.5 rounded-full bg-surface-container text-primary">
                  Encrypted
                </span>
                <button
                  aria-label={pinRevealed ? 'Hide PIN' : 'Show PIN'}
                  className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-text-tertiary hover:text-text-primary active:scale-90 transition-all"
                  type="button"
                  onClick={() => setPinRevealed((current) => !current)}
                >
                  <Icon name={pinRevealed ? 'visibility_off' : 'visibility'} className="text-[20px]" />
                </button>
              </div>
            </div>
              <p className="font-caption text-caption text-text-secondary mt-1">
                This 6-digit PIN will be your primary access credential to sign in and confirm deal claims.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="font-label-sm text-label-sm text-text-primary font-medium">
                  Create 6-digit PIN
                </label>
                <span className="font-caption text-caption text-text-tertiary">{pin.length} / 6 entered</span>
              </div>
              <PinBoxes
                value={pin}
                focused={pinFocused}
                label="Create 6-digit PIN"
                revealed={pinRevealed}
                onBlur={() => setPinFocused(false)}
                onChange={handlePinChange}
                onFocus={() => setPinFocused(true)}
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="font-label-sm text-label-sm text-text-primary font-medium">
                  Confirm your 6-digit PIN
                </label>
                <div
                  className={`flex items-center gap-1 transition-opacity ${
                    pinConfirm.length === PIN_LENGTH ? 'opacity-100' : 'opacity-0'
                  }`}
                  id="match-indicator"
                >
                  <Icon
                    name={pinsMatch ? 'check_circle' : 'error'}
                    className={`text-[16px] ${pinsMatch ? 'text-badge-discount-text' : 'text-error'}`}
                  />
                  <span
                    className={`font-caption text-caption font-semibold ${
                      pinsMatch ? 'text-badge-discount-text' : 'text-error'
                    }`}
                  >
                    {pinsMatch ? 'PIN Matches' : 'PINs do not match'}
                  </span>
                </div>
              </div>
              <PinBoxes
                inputRef={(element) => {
                  confirmInputRef.current = element;
                }}
                value={pinConfirm}
                focused={confirmFocused}
                label="Confirm 6-digit PIN"
                revealed={pinRevealed}
                onBlur={() => setConfirmFocused(false)}
                onChange={setPinConfirm}
                onFocus={() => setConfirmFocused(true)}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Icon name="verified_user" className="text-[18px] text-primary" />
              <p className="font-caption text-caption text-text-secondary">
                Your PIN is encrypted and securely stored.
              </p>
            </div>
          </div>

          <div className="bg-surface-tint-blue rounded-xl p-space-sm flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-canvas flex items-center justify-center text-primary shadow-sm flex-shrink-0">
              <Icon name="loyalty" className="text-[22px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate">
                Instant Claim Verification
              </span>
              <span className="font-caption text-caption text-secondary">
                Never wait for SMS codes at checkout. One tap with your PIN redeems offers instantly.
              </span>
            </div>
          </div>

          <div className="pt-space-xs flex flex-col gap-space-sm">
            <button
              className="w-full h-[54px] bg-primary-container text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-2 active:scale-[0.99] transition-transform duration-150 shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              id="submit-profile-btn"
              type="button"
              disabled={!isValid || status !== 'idle'}
              onClick={handleComplete}
            >
              {status === 'idle' ? (
                <>
                  <span>Complete Setup</span>
                  <Icon name="arrow_forward" className="text-[20px]" />
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                  <span>Saving...</span>
                </>
              )}
            </button>
            <button
              className="w-full rounded-xl bg-surface-container-low px-4 py-3 flex items-center justify-between gap-3 text-left active:bg-surface-container-high transition-colors disabled:opacity-40"
              type="button"
              disabled={!isValid}
              onClick={handleComplete}
            >
              <span className="flex flex-col min-w-0">
                <span className="font-caption text-caption text-text-tertiary">Next step</span>
                <span className="font-label-md text-label-md text-text-primary font-medium">
                  Set up your location to discover deals near you
                </span>
              </span>
              <Icon name="chevron_right" className="text-[20px] text-text-tertiary shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
