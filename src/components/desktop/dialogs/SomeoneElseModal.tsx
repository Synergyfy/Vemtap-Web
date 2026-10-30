import { useState } from 'react';
import { Icon } from '../../ui/Icon';
import { DesktopModal, ModalCloseButton } from '../DesktopModal';

export interface SomeoneElseValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface SomeoneElseModalProps {
  open: boolean;
  onClose: () => void;
  /** Receives the collected recipient details so later steps can show and store them. */
  onContinue: (values: SomeoneElseValues) => void;
}

const inputClass =
  'w-full h-[50px] px-4 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md placeholder:text-text-tertiary focus:bg-surface-canvas focus:outline-none shadow-sm transition-all';

const labelClass = 'block font-label-sm text-label-sm text-text-secondary mb-1.5 font-medium';

export function SomeoneElseModal({ open, onClose, onContinue }: SomeoneElseModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <DesktopModal
      open={open}
      onClose={onClose}
      maxWidth="max-w-xl"
      backdropClassName="bg-on-surface/50 backdrop-blur-md"
      cardClassName="bg-surface-canvas"
    >
      <div className="relative p-6 sm:p-8 bg-surface-canvas overflow-y-auto">
        <div className="absolute top-6 right-6">
          <ModalCloseButton onClose={onClose} label="Close modal" />
        </div>

        <div className="flex items-center gap-2 mb-2 pr-12">
          <span className="px-2.5 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold uppercase tracking-wider">
            Voucher Assignment
          </span>
        </div>

        <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
          Claim Deal for Someone Else
        </h2>
        <p className="font-body-md text-body-md text-text-secondary mt-1">
          Register a voucher pass directly under the beneficiary's name so they can redeem smoothly at the venue.
        </p>

        <div className="mt-5 p-4 rounded-xl bg-surface-tint-blue flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 mt-0.5">
            <Icon name="info" className="text-[16px]" />
          </div>
          <div className="flex-1">
            <p className="font-label-sm text-label-sm text-on-surface font-semibold">
              Why do we need recipient details?
            </p>
            <p className="font-caption text-caption text-on-surface-variant mt-0.5 leading-relaxed">
              The venue matches the guest's name and verification code at counter checkout to prevent
              unauthorized claims.
            </p>
          </div>
        </div>

        <form
          className="mt-6 flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            onContinue({
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              email: email.trim(),
              phone: phone.trim(),
            });
          }}
        >
          <div>
            <label className={labelClass}>Recipient Name</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                className={inputClass}
                placeholder="First Name"
                type="text"
                required
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Last Name"
                type="text"
                required
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Email Address</label>
              <input
                className={inputClass}
                placeholder="samuel@example.com"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <div className="flex items-center h-[50px] rounded-xl bg-surface-subtle shadow-sm px-3 gap-2 focus-within:bg-surface-canvas transition-all">
                <div className="flex items-center gap-1.5 shrink-0 pr-2">
                  <span className="inline-flex w-5 h-3.5 rounded-sm overflow-hidden shadow-xs">
                    <svg className="w-full h-full object-cover" viewBox="0 0 3 2" aria-hidden="true">
                      <rect fill="#008751" height="2" width="1" />
                      <rect fill="#FFFFFF" height="2" width="1" x="1" />
                      <rect fill="#008751" height="2" width="1" x="2" />
                    </svg>
                  </span>
                  <span className="font-label-sm text-label-sm text-text-primary font-medium">+234</span>
                </div>
                <input
                  className="w-full bg-transparent text-text-primary font-body-md text-body-md placeholder:text-text-tertiary focus:outline-none"
                  placeholder="800 000 0000"
                  type="tel"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Relationship to Beneficiary</label>
            <div className="relative">
              <select className={`${inputClass} pr-10 appearance-none cursor-pointer`}>
                <option value="family_friend">Family / Friend</option>
                <option value="colleague">Colleague</option>
                <option value="client">Client</option>
                <option value="partner">Partner</option>
              </select>
              <Icon
                name="expand_more"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-[20px]"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-subtle flex items-start gap-3">
            <Icon name="verified_user" className="text-[20px] text-primary shrink-0 mt-0.5" />
            <p className="font-caption text-caption text-text-secondary leading-snug">
              A 6-digit confirmation code will be sent to the recipient to verify their authorization before the pass is
              activated.
            </p>
          </div>

          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-subtle hover:bg-surface-container-low cursor-pointer transition-colors select-none">
            <div className="relative flex items-center justify-center mt-0.5">
              <input className="sr-only peer" type="checkbox" defaultChecked />
              <div className="w-5 h-5 rounded-lg bg-surface-canvas peer-checked:bg-primary transition-all flex items-center justify-center shadow-xs">
                <Icon name="check" className="text-[16px] text-on-primary scale-0 peer-checked:scale-100 transition-transform" />
              </div>
            </div>
            <div className="flex-1">
              <span className="font-label-md text-label-md text-text-primary font-medium block">
                Send an instant copy of the pass and redemption directions to recipient's WhatsApp
              </span>
              <span className="font-caption text-caption text-text-tertiary block mt-0.5">
                Includes interactive Google Map pin to the venue.
              </span>
            </div>
          </label>

          <div className="mt-2 flex flex-col items-center gap-3">
            <button
              type="submit"
              className="w-full h-[52px] rounded-xl bg-primary-container hover:bg-surface-tint text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-lg shadow-primary-container/20 active:scale-[0.99] transition-all"
            >
              <span>Proceed to Verification Code</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="font-label-md text-label-md text-text-secondary hover:text-text-primary py-1.5 transition-colors"
            >
              Cancel and back to deal
            </button>
            <div className="flex items-center gap-1.5 text-center mt-2 px-3">
              <Icon name="lock" className="text-[16px] text-badge-discount-text shrink-0" />
              <p className="font-caption text-caption text-text-tertiary leading-tight">
                NDPR compliant: Recipient personal data is encrypted and strictly used for venue voucher verification.
              </p>
            </div>
          </div>
        </form>
      </div>
    </DesktopModal>
  );
}
