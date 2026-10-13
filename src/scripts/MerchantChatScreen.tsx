import { useRef, useState, type FormEvent } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface MerchantChatScreenProps {
  onBack: () => void;
  onViewQr: () => void;
}

const AVATAR_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD5EHdPBiqV-fejGdf7TrB-SpdnO9l8ryfjfECc9Msgcee0FrhjtKOsn2PseQB9YJKEEbOc85e66uibO6nAuUF6Waz3S9GzRgaIS0-3PD0OzNHLPujNJ926j0imnPdoI9TJMnq6JaYB0t966Cz-cZyMQrpIXpIbx5E3yMyVL08fy4b0CxhBVB-dsBgS0yaMcvCATo-54qmsimsTXjHs4U67SYR7MLASGIlfhXems1kWxMuZjNk3tpUerA';

const AVATAR_ALT =
  'Warm and modern restaurant logo for Urban Grill and Bistro, featuring golden grill marks and clean typography on a deep charcoal backdrop, modern upscale dining vibe';

const REPLY_AVATAR_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCqx_chQxFA1JDezBmai9JKaK2_VSbVcWG08duHTy9WqIStdgSnRn6pcaz-5rHrhL1pgP9lY438PWJMvFXMaclxaL6e0Sy3PsldCXnXOqaU6fTRhjAM2JLQSuSfCZKOfBp9_RpV3csZb5vvbOyeLETSLCGFJ61C0C18Y37Yr4Z_IM012MMWw6T0K1JWaP53ulQqOLC6WWW4qGhB3beje45UjVg29rMTim6FMJ3yRGbjKEQ68j11aGrORg';

const REPLY_AVATAR_ALT = 'Small thumbnail circular logo of Urban Grill and Bistro restaurant Abuja';

const VOUCHER_CODE = 'VT-48F2G1';

const CHIPS: { label: string; emoji: string }[] = [
  { label: 'Confirm table reservation', emoji: '🪑' },
  { label: 'Redeem voucher question', emoji: '🎫' },
  { label: 'Directions & Parking', emoji: '📍' },
  { label: 'Dietary / Menu query', emoji: '🥗' },
];

interface SentMessage {
  id: number;
  text: string;
  time: string;
}

function formatTime(date: Date): string {
  const period = date.getHours() >= 12 ? 'PM' : 'AM';
  const hour = date.getHours() % 12 || 12;
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${hour}:${minute} ${period}`;
}

export function MerchantChatScreen({ onBack, onViewQr }: MerchantChatScreenProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<SentMessage[]>([]);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimers = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2400);
    toastTimers.current.push(timer);
  };

  const copyVoucher = () => {
    navigator.clipboard?.writeText(VOUCHER_CODE).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: Date.now(), text, time: formatTime(new Date()) }]);
    setInput('');
    inputRef.current?.focus();
  };

  const useChip = (label: string) => {
    setInput(label);
    inputRef.current?.focus();
  };

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between px-margin py-space-xs">
          <div className="flex items-center space-x-space-sm min-w-0">
            <button
              aria-label="Go back"
              type="button"
              onClick={onBack}
              className="p-space-2xs text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center -ml-space-2xs"
            >
              <Icon name="arrow_back_ios_new" className="text-[24px]" />
            </button>

            <div className="relative flex-shrink-0">
              <img className="w-11 h-11 rounded-full object-cover shadow-sm" alt={AVATAR_ALT} src={AVATAR_IMAGE} />
              <span
                className="absolute bottom-0 right-0 w-3 h-3 bg-badge-discount-text rounded-full ring-2 ring-surface-container-lowest"
                title="Active now"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center space-x-space-2xs">
                <h1 className="font-heading-sm text-heading-sm text-text-primary truncate">
                  Urban Grill &amp; Bistro
                </h1>
                <span title="Verified Merchant" className="flex-shrink-0">
                  <Icon name="verified" filled className="text-primary text-[18px]" />
                </span>
              </div>
              <div className="flex items-center space-x-1 text-badge-discount-text font-caption text-caption truncate">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                <span className="font-medium">Active now</span>
                <span className="text-text-tertiary text-[10px]">•</span>
                <span className="text-text-secondary truncate">Replies in &lt; 5m</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <a
              aria-label="Call restaurant"
              href="tel:+2348039204491"
              className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-tint-blue transition-colors"
            >
              <Icon name="call" className="text-[22px]" />
            </a>
            <button
              aria-label="More options"
              type="button"
              onClick={() => showToast('Chat options: mute, report, view business')}
              className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-tint-blue transition-colors"
            >
              <Icon name="more_vert" className="text-[22px]" />
            </button>
          </div>
        </div>

        <div className="px-margin pb-space-xs">
          <div className="bg-surface-container-low rounded-xl p-space-sm shadow-sm">
            <div className="flex items-start justify-between gap-space-xs">
              <div className="flex items-start space-x-space-xs min-w-0">
                <div className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center flex-shrink-0">
                  <Icon name="confirmation_number" filled className="text-[20px]" />
                </div>
                <div className="min-w-0 flex flex-col">
                  <div className="flex items-center space-x-space-2xs flex-wrap gap-y-1">
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate">
                      Lunch Combo — 20% Off
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold">
                      Save ₦2,400
                    </span>
                  </div>
                  <p className="text-text-secondary font-caption text-caption mt-0.5">
                    ₦9,600 total • Active • Expires in 3 days
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onViewQr}
                className="flex-shrink-0 flex items-center space-x-0.5 text-primary font-label-sm text-label-sm font-semibold hover:underline pt-0.5"
              >
                <span>View QR</span>
                <Icon name="arrow_forward" className="text-[16px]" />
              </button>
            </div>

            <div className="mt-space-xs pt-space-xs flex items-center justify-between bg-surface-container-lowest rounded-lg px-space-sm py-1.5">
              <div className="flex items-center space-x-1.5">
                <span className="text-text-tertiary font-caption text-[11px] uppercase tracking-wide">
                  Voucher Code:
                </span>
                <span className="font-label-sm text-label-sm font-bold text-text-primary tracking-wider">
                  {VOUCHER_CODE}
                </span>
              </div>
              <button
                type="button"
                onClick={copyVoucher}
                className={`flex items-center space-x-1 text-caption font-medium transition-colors ${
                  copied ? 'text-badge-discount-text' : 'text-primary hover:text-on-primary-fixed-variant'
                }`}
              >
                <Icon name={copied ? 'check' : 'content_copy'} className="text-[15px]" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-margin pb-space-xs">
          <div className="flex items-center space-x-2 py-1.5 px-space-sm bg-surface-subtle rounded-lg text-text-secondary font-caption text-[11px] leading-tight">
            <Icon name="verified_user" filled className="text-[16px] text-primary flex-shrink-0" />
            <span className="truncate">Protected by VEMTAP Guarantee. Never share payment PINs.</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col space-y-space-md px-margin py-space-sm pb-space-sm">
        <div className="flex justify-center my-space-xs">
          <span className="bg-surface-container text-on-surface-variant font-caption text-caption px-space-sm py-0.5 rounded-full shadow-sm">
            Today, 1:24 PM
          </span>
        </div>

        <div className="flex justify-center">
          <div className="max-w-[85%] bg-surface-container-low rounded-xl px-space-sm py-space-xs text-center shadow-sm">
            <div className="flex items-center justify-center space-x-1 text-primary font-label-sm text-label-sm font-semibold mb-0.5">
              <Icon name="share" className="text-[16px]" />
              <span>Voucher Attached to Chat</span>
            </div>
            <p className="font-caption text-caption text-text-secondary leading-snug">
              Voucher <span className="font-semibold text-text-primary">{VOUCHER_CODE}</span> shared with merchant for
              Urban Grill &amp; Bistro (Apo Boulevard, Abuja).
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-1 pl-space-xl">
          <div className="bg-primary text-on-primary rounded-2xl rounded-tr-sm p-space-sm shadow-md">
            <p className="font-body-md text-body-md leading-relaxed">
              Hello! I claimed the 20% Lunch Combo voucher. Do I need to book a table ahead for today around 2:30 PM,
              or can I just walk in with the voucher QR code?
            </p>
          </div>
          <div className="flex items-center space-x-1 pr-1">
            <span className="font-caption text-[11px] text-text-tertiary">1:25 PM</span>
            <Icon name="done_all" filled className="text-[14px] text-primary" />
          </div>
        </div>

        <div className="flex items-start space-x-space-xs pr-space-xl">
          <img
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1 shadow-sm"
            alt={REPLY_AVATAR_ALT}
            src={REPLY_AVATAR_IMAGE}
          />
          <div className="flex flex-col space-y-1">
            <div className="bg-surface-container-lowest text-text-primary rounded-2xl rounded-tl-sm p-space-sm shadow-sm">
              <div className="flex items-center space-x-1 mb-1">
                <span className="font-label-sm text-[12px] font-semibold text-text-secondary">
                  Urban Grill &amp; Bistro
                </span>
                <Icon name="verified" filled className="text-primary text-[14px]" />
              </div>
              <p className="font-body-md text-body-md leading-relaxed">
                Hi John! Welcome to Urban Grill &amp; Bistro. Walk-ins with the VEMTAP voucher are very welcome! We have
                plenty of indoor and terrace seating available right now.
              </p>
            </div>
            <span className="font-caption text-[11px] text-text-tertiary pl-2">1:27 PM</span>
          </div>
        </div>

        <div className="flex items-start space-x-space-xs pr-space-xl">
          <div className="w-8 flex-shrink-0" />
          <div className="flex flex-col space-y-1">
            <div className="bg-surface-container-lowest text-text-primary rounded-2xl rounded-tl-sm p-space-sm shadow-sm">
              <p className="font-body-md text-body-md leading-relaxed">
                Just announce your code{' '}
                <span className="font-semibold text-primary bg-surface-tint-blue px-1.5 py-0.5 rounded">
                  {VOUCHER_CODE}
                </span>{' '}
                to your server before placing your order so we apply the ₦2,400 discount immediately to your bill. See
                you soon! 🍔
              </p>
            </div>
            <span className="font-caption text-[11px] text-text-tertiary pl-2">1:27 PM</span>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-1 pl-space-xl">
          <div className="bg-primary text-on-primary rounded-2xl rounded-tr-sm p-space-sm shadow-md">
            <p className="font-body-md text-body-md leading-relaxed">Awesome, thank you! On my way now.</p>
          </div>
          <div className="flex items-center space-x-1 pr-1">
            <span className="font-caption text-[11px] text-text-tertiary">1:29 PM</span>
            <Icon name="check" className="text-[14px] text-text-tertiary" />
          </div>
        </div>

        {messages.map((message) => (
          <div key={message.id} className="flex flex-col items-end space-y-1 pl-space-xl">
            <div className="bg-primary text-on-primary rounded-2xl rounded-tr-sm p-space-sm shadow-md">
              <p className="font-body-md text-body-md leading-relaxed">{message.text}</p>
            </div>
            <div className="flex items-center space-x-1 pr-1">
              <span className="font-caption text-[11px] text-text-tertiary">{message.time}</span>
              <Icon name="done_all" filled className="text-[14px] text-primary" />
            </div>
          </div>
        ))}
      </div>

      <footer className="sticky bottom-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md shadow-lg pt-space-xs pb-space-sm px-margin flex flex-col space-y-space-xs">
        <div className="flex items-center space-x-space-xs overflow-x-auto py-1 -mx-margin px-margin no-scrollbar">
          {CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => useChip(chip.label)}
              className="flex-shrink-0 bg-surface-subtle hover:bg-surface-tint-blue text-text-secondary hover:text-primary font-label-sm text-label-sm py-1.5 px-space-sm rounded-full transition-colors flex items-center space-x-1 shadow-sm"
            >
              <span>{chip.label}</span>
              <span>{chip.emoji}</span>
            </button>
          ))}
        </div>

        <form className="flex items-center space-x-space-xs" onSubmit={sendMessage}>
          <button
            aria-label="Add attachment or image"
            type="button"
            onClick={() => showToast('Attachment picker coming soon')}
            className="w-11 h-11 rounded-full bg-surface-container-low text-text-secondary hover:text-primary flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Icon name="add" className="text-[22px]" />
          </button>

          <div className="flex-1 flex items-center bg-surface-container-low rounded-full px-space-sm py-1.5 focus-within:bg-surface-container-lowest focus-within:shadow-sm transition-all">
            <input
              className="w-full bg-transparent border-none outline-none font-body-md text-body-md text-text-primary placeholder:text-text-tertiary px-1"
              placeholder="Message Urban Grill & Bistro..."
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              ref={inputRef}
            />
            <button
              aria-label="Add emoji"
              type="button"
              onClick={() => showToast('Emoji picker coming soon')}
              className="text-text-tertiary hover:text-text-secondary transition-colors p-1 flex items-center"
            >
              <Icon name="sentiment_satisfied" className="text-[20px]" />
            </button>
          </div>

          <button
            aria-label="Send message"
            type="submit"
            className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md active:scale-95 transition-transform flex-shrink-0"
          >
            <Icon name="send" className="text-[20px] ml-0.5" />
          </button>
        </form>
      </footer>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
