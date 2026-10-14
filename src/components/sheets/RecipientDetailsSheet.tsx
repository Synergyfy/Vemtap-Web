import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { SheetShell } from './SheetShell';

export interface RecipientValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface RecipientDetailsSheetProps {
  open: boolean;
  onClose: () => void;
  /** Receives the collected recipient details so later steps can show and store them. */
  onContinue: (values: RecipientValues) => void;
  onBack: () => void;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length > 6) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  if (digits.length > 3) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return digits;
}

export function RecipientDetailsSheet({ open, onClose, onContinue, onBack }: RecipientDetailsSheetProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <SheetShell open={open} onClose={onClose}>
      <div className="w-full flex justify-center pt-3 pb-space-xs">
        <div className="w-12 h-1.5 rounded-full bg-surface-container/60" />
      </div>

      <div className="flex flex-col w-full px-margin pb-space-lg">
        <div className="flex items-center justify-between pt-space-xs pb-space-sm">
          <div className="flex items-center gap-space-xs">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-tint-blue text-primary">
              <Icon name="card_giftcard" className="text-[20px]" filled />
            </div>
            <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider font-semibold">
              Special Transfer
            </span>
          </div>
          <button
            aria-label="Close sheet"
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-high text-on-surface-variant active:scale-95 transition-transform"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="flex flex-col gap-space-2xs mt-space-2xs">
          <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Claim for someone else</h1>
          <p className="font-body-md text-body-md text-text-secondary">
            Enter the recipient's details to claim on their behalf without altering your VEMTAP account.
          </p>
        </div>

        <div className="mt-space-md p-space-sm rounded-xl bg-surface-tint-blue flex items-start gap-space-sm">
          <Icon name="verified_user" className="text-primary text-[20px] mt-0.5" filled />
          <p className="font-label-sm text-label-sm text-text-primary leading-snug">
            Your personal profile and active reward points stay unchanged. Only this specific claim voucher updates.
          </p>
        </div>

        <form
          className="flex flex-col mt-space-lg gap-space-md"
          onSubmit={(event) => {
            event.preventDefault();
            onContinue({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), phone: phone.trim() });
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-heading-sm text-heading-sm text-text-primary">Recipient Details</span>
            <span className="font-caption text-caption text-text-tertiary">All fields required</span>
          </div>

          <div className="grid grid-cols-2 gap-space-xs">
            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="recipient-first-name">
                First name
              </label>
              <div className="relative flex items-center">
                <input
                  autoComplete="given-name"
                  className="w-full h-[52px] px-space-md rounded-[14px] bg-surface-container-lowest font-body-md text-body-md text-text-primary placeholder:text-text-tertiary outline-none shadow-sm focus:bg-surface-tint-blue transition-colors"
                  id="recipient-first-name"
                  placeholder="e.g. Samuel"
                  required
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="recipient-last-name">
                Last name
              </label>
              <div className="relative flex items-center">
                <input
                  autoComplete="family-name"
                  className="w-full h-[52px] px-space-md rounded-[14px] bg-surface-container-lowest font-body-md text-body-md text-text-primary placeholder:text-text-tertiary outline-none shadow-sm focus:bg-surface-tint-blue transition-colors"
                  id="recipient-last-name"
                  placeholder="e.g. Adeleke"
                  required
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-space-2xs">
            <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="recipient-email">
              Email address
            </label>
            <div className="relative flex items-center">
              <Icon name="mail" className="text-text-tertiary absolute left-space-md text-[20px] pointer-events-none" />
              <input
                autoComplete="email"
                className="w-full h-[52px] pl-11 pr-space-md rounded-[14px] bg-surface-container-lowest font-body-md text-body-md text-text-primary placeholder:text-text-tertiary outline-none shadow-sm focus:bg-surface-tint-blue transition-colors"
                id="recipient-email"
                placeholder="recipient@example.com"
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-space-2xs">
            <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="recipient-phone">
              Phone number
            </label>
            <div className="flex items-center gap-space-2xs">
              <div className="flex items-center gap-1 h-[52px] px-space-sm rounded-[14px] bg-surface-container-lowest shadow-sm flex-shrink-0">
                <span className="text-[18px]">🇳🇬</span>
                <span className="font-label-md text-label-md text-text-primary font-semibold">+234</span>
              </div>
              <div className="relative flex items-center flex-1">
                <input
                  autoComplete="tel"
                  className="w-full h-[52px] px-space-md rounded-[14px] bg-surface-container-lowest font-body-md text-body-md text-text-primary placeholder:text-text-tertiary outline-none shadow-sm focus:bg-surface-tint-blue transition-colors"
                  id="recipient-phone"
                  placeholder="802 345 6789"
                  required
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(formatPhone(event.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-space-xs mt-space-2xs p-space-sm rounded-xl bg-surface-container-low">
            <Icon name="sms" className="text-text-secondary text-[18px] mt-0.5" />
            <p className="font-caption text-caption text-text-secondary leading-relaxed">
              The claim verification and SMS code will be issued directly in this person's name.
            </p>
          </div>

          <div className="flex flex-col items-center gap-space-sm mt-space-sm">
            <button
              type="submit"
              className="w-full h-[52px] rounded-[16px] bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-2xs shadow-md shadow-primary/20 active:scale-[0.98] transition-transform"
            >
              <span>Continue to Verification</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
            <button
              type="button"
              onClick={onBack}
              className="h-11 px-space-md flex items-center justify-center font-button-secondary text-button-secondary text-text-secondary active:text-text-primary transition-colors"
            >
              Back to my details
            </button>
          </div>
        </form>
      </div>
    </SheetShell>
  );
}
