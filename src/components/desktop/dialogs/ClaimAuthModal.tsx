import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '../../ui/Icon';
import { DesktopModal, ModalCloseButton } from '../DesktopModal';

export interface ClaimAuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

const PIN_LENGTH = 6;

export function ClaimAuthModal({ open, onClose, onAuthenticated }: ClaimAuthModalProps) {
  const [pin, setPin] = useState('123456');
  const [revealed, setRevealed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(899);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!open) return undefined;
    const interval = window.setInterval(() => {
      setSecondsLeft((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [open]);

  const digits = Array.from({ length: PIN_LENGTH }, (_, index) => pin[index] ?? '');

  const handleChange = (index: number, raw: string) => {
    const char = raw.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setPin(next.join(''));
    if (char && index < PIN_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < PIN_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  return (
    <DesktopModal
      open={open}
      onClose={onClose}
      maxWidth="max-w-[560px]"
      backdropClassName="bg-on-surface/60 backdrop-blur-md"
      cardClassName="bg-surface-canvas"
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary-container to-secondary-container" />

      <div className="p-space-xl flex flex-col gap-space-lg overflow-y-auto">
        <div className="flex items-start justify-between gap-space-md">
          <div className="flex items-start gap-space-md">
            <div className="w-12 h-12 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary-container shrink-0 shadow-sm">
              <Icon name="verified_user" filled className="text-[26px]" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-heading-lg text-heading-lg text-text-primary">Sign in to Claim This Deal</h3>
              <p className="font-body-md text-body-md text-text-secondary mt-1">
                Reserve <span className="font-semibold text-text-primary">"Featured local deal"</span> at a special
                rate (Pay in-store). No credit card required.
              </p>
            </div>
          </div>
          <ModalCloseButton onClose={onClose} label="Close authentication modal" />
        </div>

        <div className="w-full bg-surface-subtle p-space-md rounded-xl flex items-center gap-space-md shadow-sm">
          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container">
            <img
              className="w-full h-full object-cover"
              alt="Close up plate of gourmet grilled bistro lunch combo with steak medallions, green asparagus and sauce in warm lighting"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuClOfKRpt4W6Yn_nLUR-w5MAux4WskBj8emCq4hdaaipD9AoyBRrJXHmB5wGuhQnYd4v_kpL9fcpl43_ZO6NS7c5RgipPCTkJMrlfY-njIZBJjmcwCDjKW8A8lOiRPjJ6D02RFoAuQtedZHQIntn1gugDFBD9dgMIaPUDiWqK7nEl2RuD2qqWg2Ev7lkE4R8JmBT6ysuxixg5-ny-CtTQkBe0IkSoxgqrn6bbwxahVJ"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-space-xs">
              <span className="font-label-sm text-label-sm text-text-secondary truncate">Local dining partner</span>
              <span className="px-space-xs py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shrink-0">
                SPECIAL RATE
              </span>
            </div>
            <div className="flex items-baseline gap-space-xs my-0.5">
              <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦9,600</span>
              <span className="font-caption text-caption text-text-tertiary line-through">₦12,000</span>
            </div>
            <div className="flex items-center gap-1 text-tertiary-container">
              <Icon name="timer" className="text-[14px] animate-pulse" />
              <span className="font-caption text-caption font-semibold">
                Spot held for {minutes}:{seconds} mins during sign-in
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-space-md">
          <button
            type="button"
            onClick={onAuthenticated}
            className="w-full h-[50px] bg-surface-canvas hover:bg-surface-subtle active:scale-[0.99] text-text-primary rounded-xl font-button-primary text-button-primary shadow-sm flex items-center justify-center gap-space-sm transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-space-2xs">
            <div className="w-full h-px bg-surface-container-high" />
            <span className="absolute bg-surface-canvas px-space-md font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
              OR SIGN IN WITH EMAIL / PHONE
            </span>
          </div>

          <form
            className="flex flex-col gap-space-md"
            onSubmit={(event) => {
              event.preventDefault();
              onAuthenticated();
            }}
          >
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-text-secondary font-medium" htmlFor="claim-identifier">
                Email Address or Phone Number
              </label>
              <div className="relative flex items-center">
                <Icon
                  name="alternate_email"
                  className="absolute left-space-md text-[20px] text-text-tertiary pointer-events-none"
                />
                <input
                  id="claim-identifier"
                  className="w-full h-[52px] pl-11 pr-space-md bg-surface-subtle focus:bg-surface-canvas rounded-xl font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all shadow-inner"
                  placeholder="name@email.com or +234 801 234 5678"
                  type="text"
                  defaultValue="chidi.okonkwo@gmail.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-text-secondary font-medium">
                  6-digit PIN or Password
                </span>
                <button type="button" className="font-label-sm text-label-sm text-primary hover:underline">
                  Forgot PIN?
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputsRef.current[index] = element;
                    }}
                    aria-label={`PIN digit ${index}`}
                    inputMode="numeric"
                    maxLength={1}
                    pattern="[0-9]*"
                    type={revealed ? 'text' : 'password'}
                    value={digit}
                    onChange={(event) => handleChange(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onFocus={(event) => event.currentTarget.select()}
                    className="w-full h-[52px] text-center font-heading-lg text-heading-lg text-text-primary bg-surface-subtle focus:bg-surface-canvas rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all select-all caret-primary"
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Toggle password visibility"
                onClick={() => setRevealed((value) => !value)}
                className="self-end text-text-tertiary hover:text-text-primary focus:outline-none mt-1"
              >
                <Icon name={revealed ? 'visibility_off' : 'visibility'} className="text-[20px]" />
              </button>
            </div>

            <div className="flex items-center gap-space-sm pt-1">
              <label className="relative flex items-center cursor-pointer select-none">
                <input className="sr-only peer" type="checkbox" defaultChecked />
                <div className="w-5 h-5 bg-surface-subtle peer-checked:bg-primary-container rounded flex items-center justify-center transition-colors shadow-sm">
                  <Icon name="check" className="text-[16px] text-on-primary" />
                </div>
              </label>
              <span className="font-label-md text-label-md text-text-secondary">Keep me signed in on this computer</span>
            </div>

            <button
              type="submit"
              className="w-full h-[50px] bg-primary-container hover:bg-primary active:scale-[0.99] text-on-primary rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary-container/25 flex items-center justify-center gap-space-sm transition-all mt-space-xs"
            >
              <span>Sign In &amp; Lock Deal Reservation</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </form>

          <div className="text-center pt-space-2xs">
            <span className="font-body-md text-body-md text-text-secondary">Don't have a VEMTAP account? </span>
            <button type="button" className="font-button-secondary text-button-secondary text-primary font-semibold hover:underline">
              Create one in 30 seconds
            </button>
          </div>
        </div>

        <div className="pt-space-md flex items-center justify-center gap-space-sm text-text-tertiary font-caption text-caption text-center flex-wrap">
          <span className="flex items-center gap-1">
            <Icon name="lock" className="text-[14px] text-badge-discount-text" />
            256-bit Bank Grade SSL
          </span>
          <span>•</span>
          <span>NDPR Data Privacy Compliant</span>
          <span>•</span>
          <span>Zero spam guarantee</span>
        </div>
      </div>
    </DesktopModal>
  );
}
