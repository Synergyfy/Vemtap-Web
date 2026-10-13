import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { SheetShell } from './SheetShell';

export interface GiftRecipientDetailsSheetProps {
  open: boolean;
  onClose: () => void;
  onContinue: (values: { firstName: string; lastName: string; email: string; phone: string }) => void;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length > 6) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  if (digits.length > 3) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return digits;
}

export function GiftRecipientDetailsSheet({ open, onClose, onContinue }: GiftRecipientDetailsSheetProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <SheetShell open={open} onClose={onClose}>
      <div className="w-full flex justify-center pt-3 pb-space-xs">
        <div className="w-12 h-1.5 rounded-full bg-surface-container/60" />
      </div>

      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between px-margin pt-space-md pb-space-xs">
          <div className="flex items-center space-x-space-2xs">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider font-semibold">
              Gifting Experience
            </span>
          </div>
          <button
            aria-label="Close sheet"
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors focus:outline-none"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="px-margin pt-space-xs pb-space-md">
          <h2 className="font-heading-lg text-heading-lg text-text-primary">Who is this deal for?</h2>
          <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
            Enter the recipient's details to send them this deal voucher as a gift.
          </p>
        </div>

        <div className="px-margin mb-space-md">
          <div className="flex items-center space-x-space-sm p-space-sm bg-surface-container-low rounded-xl">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-variant">
              <img
                className="w-full h-full object-cover"
                alt="Warm gourmet grilled lunch platter with skewers, fresh herbs, roasted vegetables and craft iced beverage on a rustic cafe table, golden hour light, high detail commercial food photography"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQW9aG5q7nNlUWib-HC8W81eZHeQ_mtDMyXyo2n4NaG5zIgCMSJ6ooIvIXuEUKhAhGoM4SIJPLTM444_5iJz-u8RyMywnxrrhBR4Wv8R_uVxOiatVCjWPW1KoyUVjAQ4krWfGm8AUkJxHvAgqueA6JnJHFLgtj7aelXu6W8tYz7nAH2dEhMNz3UyH9AHQv0gV-XngtwiOMto0t57dl9JIRcNvQFkt9Xayd10JOfGte"
              />
              <span className="absolute top-1 left-1 bg-badge-discount-bg text-badge-discount-text font-caption text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                -20%
              </span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center space-x-1">
                <span className="font-label-sm text-label-sm text-primary font-semibold truncate">
                  Urban Grill &amp; Bistro
                </span>
                <Icon name="verified" className="text-primary text-[14px]" filled />
              </div>
              <h4 className="font-heading-sm text-heading-sm text-text-primary truncate">Lunch Combo — 20% Off</h4>
              <div className="flex items-center text-text-tertiary font-caption text-caption mt-0.5 space-x-1">
                <Icon name="schedule" className="text-[13px]" />
                <span>Valid for 30 days • Instant Delivery</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-space-2xs mb-space-md">
          <div className="w-6 h-1.5 rounded-full bg-primary-container" />
          <div className="w-1.5 h-1.5 rounded-full bg-surface-container-high" />
          <div className="w-1.5 h-1.5 rounded-full bg-surface-container-high" />
        </div>

        <form
          className="px-margin flex flex-col space-y-space-md pb-space-xl"
          onSubmit={(event) => {
            event.preventDefault();
            onContinue({ firstName, lastName, email, phone });
          }}
        >
          <div className="grid grid-cols-2 gap-space-sm">
            <div className="flex flex-col space-y-1">
              <label className="font-label-md text-label-md text-text-primary" htmlFor="gift-first-name">
                First name
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full h-[52px] px-4 rounded-xl bg-surface-subtle text-text-primary placeholder:text-text-tertiary font-body-md text-body-md focus:bg-surface-canvas focus:outline-none transition-all duration-200"
                  id="gift-first-name"
                  placeholder="e.g. Amara"
                  required
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="font-label-md text-label-md text-text-primary" htmlFor="gift-last-name">
                Last name
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full h-[52px] px-4 rounded-xl bg-surface-subtle text-text-primary placeholder:text-text-tertiary font-body-md text-body-md focus:bg-surface-canvas focus:outline-none transition-all duration-200"
                  id="gift-last-name"
                  placeholder="e.g. Okafor"
                  required
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-label-md text-label-md text-text-primary" htmlFor="gift-recipient-email">
              Email
            </label>
            <div className="relative flex items-center">
              <Icon name="mail" className="absolute left-4 text-text-tertiary text-[20px] pointer-events-none" />
              <input
                className="w-full h-[52px] pl-11 pr-4 rounded-xl bg-surface-subtle text-text-primary placeholder:text-text-tertiary font-body-md text-body-md focus:bg-surface-canvas focus:outline-none transition-all duration-200"
                id="gift-recipient-email"
                placeholder="recipient@example.com"
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-label-md text-label-md text-text-primary" htmlFor="gift-recipient-phone">
              Phone number
            </label>
            <div className="flex items-center space-x-space-2xs">
              <div className="flex items-center h-[52px] px-3 rounded-xl bg-surface-subtle text-text-primary space-x-1.5 flex-shrink-0 cursor-pointer">
                <span className="text-base leading-none">🇳🇬</span>
                <span className="font-label-md text-label-md font-semibold text-text-primary">+234</span>
                <Icon name="keyboard_arrow_down" className="text-[18px] text-text-tertiary" />
              </div>
              <div className="relative flex items-center flex-1">
                <input
                  className="w-full h-[52px] px-4 rounded-xl bg-surface-subtle text-text-primary placeholder:text-text-tertiary font-body-md text-body-md focus:bg-surface-canvas focus:outline-none transition-all duration-200"
                  id="gift-recipient-phone"
                  placeholder="801 234 5678"
                  required
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(formatPhone(event.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col bg-surface-subtle rounded-2xl p-space-sm transition-all duration-200">
            <button
              type="button"
              onClick={() => setMessageOpen((value) => !value)}
              className="flex items-center justify-between cursor-pointer select-none text-left w-full"
            >
              <div className="flex items-center space-x-space-xs">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <Icon name="card_giftcard" className="text-[18px]" filled />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-semibold text-text-primary">
                    Add a gift message (optional)
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    We will personalize their digital voucher card
                  </span>
                </div>
              </div>
              <div
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 relative ${
                  messageOpen ? 'bg-primary-container' : 'bg-surface-container-highest'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-surface-canvas shadow-sm transition-transform duration-200 ${
                    messageOpen ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>

            <div className={messageOpen ? 'flex flex-col mt-space-sm pt-space-xs' : 'hidden'}>
              <div className="relative">
                <textarea
                  className="w-full p-3 rounded-xl bg-surface-canvas text-text-primary placeholder:text-text-tertiary font-body-md text-body-md focus:outline-none resize-none transition-all duration-200"
                  id="gift-message"
                  maxLength={160}
                  placeholder="Write a warm note... (e.g. Happy Birthday! Lunch on me this week 🎉)"
                  rows={3}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
                <div className="flex justify-between items-center mt-1 px-1">
                  <div className="flex space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setMessage('Enjoy your lunch! 🍔')}
                      className="font-caption text-[11px] font-medium bg-surface-container-high px-2 py-0.5 rounded-full text-text-secondary hover:text-text-primary"
                    >
                      🍔 Quick Lunch
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessage('A little treat for you! ✨')}
                      className="font-caption text-[11px] font-medium bg-surface-container-high px-2 py-0.5 rounded-full text-text-secondary hover:text-text-primary"
                    >
                      ✨ Surprise
                    </button>
                  </div>
                  <span className="font-caption text-caption text-text-tertiary">{message.length}/160</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-space-xs flex flex-col items-center space-y-space-sm">
            <button
              type="submit"
              className="w-full h-[52px] rounded-2xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
            <div className="flex items-center space-x-1 text-text-tertiary font-caption text-caption">
              <Icon name="lock" className="text-[14px]" />
              <span>Secure checkout • Instant SMS &amp; Email notification</span>
            </div>
          </div>
        </form>
      </div>
    </SheetShell>
  );
}
