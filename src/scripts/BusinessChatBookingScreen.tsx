import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import {
  CustomerProfileDrawer,
  AttachmentSheet,
  ChatOptionsSheet,
} from '../components/sheets/ChatSheets';
import { BusinessChatHeader } from './BusinessChatHeader';

interface BusinessChatBookingScreenProps {
  onBack: () => void;
}

interface ThreadMessage {
  id: number;
  direction: 'in' | 'out';
  text: string;
  time: string;
  meta?: string;
  author?: string;
  bubbleClass?: string;
  status?: 'read' | 'delivered' | 'sending';
}

const WINE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB9e9Wt059zdfQFzYPICKHyT8oT-MEaC0cEInizqgTtJoDd-8d0SKDMFTUrsNLQDQ-jheAslkfe1PQM0LMCsadDQnO5l35bUcxoSnzClRkeaErduX-TARjtKVSzDkYLyEyKmyk5PEK6W8sZsOgdPA--zDr5oRB3T7OzY6WhWHNGheB6cVbOMXG55_EBavTVQyBkVpiHTJWHdp8kXjA3QUCtPaokR2VsQRg0CerrA325DqLXNBsdRtk0xg';
const WINE_ALT =
  'Close up studio photograph of a premium vintage red wine bottle with an artisanal parchment label, warm rustic mahogany cellar backdrop, subtle amber rim lighting, luxury lifestyle product photography in rich deep tones.';

const INITIAL_MESSAGES: ThreadMessage[] = [
  {
    id: 1,
    direction: 'in',
    text: 'Do you have the 2018 vintage available for this weekend?',
    time: 'Oct 10, 4:18 PM',
    meta: 'Dr. Chidi',
    bubbleClass: 'bg-surface-canvas text-text-primary',
  },
  {
    id: 2,
    direction: 'out',
    text: 'Yes Dr. Chidi, we have 3 bottles reserved in our cellar.',
    time: 'Oct 10, 4:21 PM',
    bubbleClass: 'bg-surface-tint-blue text-on-surface',
    status: 'read',
  },
  {
    id: 3,
    direction: 'in',
    text: 'Good morning. We have 2 additional guests joining us for our anniversary dinner on Saturday. Can we expand our Table 08 reservation to 6 seats?',
    time: '11:05 AM',
    author: 'Dr. Chidi Okafor',
    bubbleClass: 'bg-surface-canvas text-text-primary',
  },
  {
    id: 4,
    direction: 'out',
    text: 'Good morning Dr. Chidi! Yes, we have merged Table 08 & 09 to comfortably seat party of 6. We look forward to celebrating with you!',
    time: '11:08 AM',
    bubbleClass: 'bg-primary-container text-on-primary',
    status: 'read',
  },
  {
    id: 5,
    direction: 'out',
    text: "We've also chilled the reserve bottle for your arrival 🍷",
    time: '11:10 AM',
    bubbleClass: 'bg-surface-tint-blue text-on-surface',
    status: 'sending',
  },
];

const formatNow = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${minutes} ${ampm}`;
};

export function BusinessChatBookingScreen({ onBack }: BusinessChatBookingScreenProps) {
  const [messages, setMessages] = useState<ThreadMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('Looking forward to seeing you!');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const handleSend = () => {
    const value = input.trim();
    if (!value) return;
    setMessages((current) => [
      ...current,
      { id: Date.now(), direction: 'out', text: value, time: formatNow(), bubbleClass: 'bg-primary-container text-on-primary', status: 'read' },
    ]);
    setInput('');
    window.setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50);
  };

  return (
    <AppScreen>
      <BusinessChatHeader
        onBack={onBack}
        subtitle="Active inquiry • Booking #BK-77402"
        onAvatar={() => setDrawerOpen(true)}
        onCall={() => (window.location.href = 'tel:+2348027719044')}
        onMore={() => setOptionsOpen(true)}
      />
      <CustomerProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} name="Dr. Chidi Okafor" phone="+234 802 771 9044" />
      <AttachmentSheet open={attachOpen} onClose={() => setAttachOpen(false)} />
      <ChatOptionsSheet open={optionsOpen} onClose={() => setOptionsOpen(false)} />

      <div className="flex flex-col w-full flex-1">
        {/* Offline Sync Pill */}
        <aside aria-label="Network status banner" className="mx-margin mt-space-sm mb-space-xs">
          <div className="flex items-center justify-between gap-space-xs px-space-md py-space-xs rounded-xl bg-surface-container-high text-on-surface shadow-sm">
            <div className="flex items-center gap-space-xs min-w-0">
              <span className="flex h-2 w-2 relative flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-container opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary" />
              </span>
              <span className="font-caption text-caption text-text-secondary truncate">
                Offline changes queued • Will sync when connected
              </span>
            </div>
            <Icon name="cloud_sync" className="text-[16px] text-text-tertiary flex-shrink-0" />
          </div>
        </aside>

        {/* Sticky Multi-Context Active Deck */}
        <section aria-labelledby="active-booking-heading" className="mx-margin mb-space-md">
          <div className="bg-surface-canvas rounded-xl shadow-md p-space-md flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-2xs">
                <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold uppercase tracking-wider">
                  <Icon name="restaurant" filled className="text-[13px]" />
                  Booking Context
                </span>
                <span className="font-caption text-caption text-text-tertiary">•</span>
                <span className="font-caption text-caption text-text-secondary font-medium">Ref: #BK-77402</span>
              </div>
              <span className="inline-flex items-center px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                Confirmed
              </span>
            </div>
            <h2 className="font-heading-sm text-heading-sm text-text-primary mt-space-2xs" id="active-booking-heading">
              Dining Table Reservation — Party of 4
            </h2>
            <div className="flex flex-col gap-1 py-space-2xs bg-surface-subtle px-space-sm rounded-lg mt-space-2xs">
              <div className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm">
                <Icon name="calendar_month" className="text-[16px] text-primary flex-shrink-0" />
                <span className="truncate">Saturday, Oct 19 · 7:30 PM (Table 08 Indoor)</span>
              </div>
              <div className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm">
                <Icon name="celebration" className="text-[16px] text-tertiary flex-shrink-0" />
                <span className="truncate">Special Anniversary Request</span>
              </div>
              <div className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm">
                <Icon name="payments" className="text-[16px] text-badge-discount-text flex-shrink-0" />
                <span className="truncate">Direct Settle at Restaurant</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-2xs mt-space-2xs">
              <span className="font-caption text-caption text-text-tertiary">Table locked with host team</span>
              <button
                className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-semibold hover:opacity-80 transition-opacity"
                type="button"
              >
                View Booking Details
                <Icon name="arrow_forward" className="text-[16px]" />
              </button>
            </div>
          </div>
        </section>

        {/* Message Thread */}
        <div className="flex flex-col px-margin pb-32 gap-space-md">
          {/* Previous Context Divider */}
          <div className="flex items-center justify-center my-space-xs">
            <div className="flex items-center gap-space-2xs px-space-md py-1 rounded-full bg-surface-container text-on-secondary-container shadow-sm">
              <Icon name="history" className="text-[14px]" />
              <span className="font-caption text-caption font-semibold uppercase tracking-wider">
                Previous Context: Product Inquiry · Oct 10
              </span>
            </div>
          </div>

          {/* Product Card Snippet */}
          <div className="flex justify-start">
            <div className="max-w-[85%] bg-surface-canvas rounded-xl shadow-sm p-space-sm flex gap-space-sm items-center">
              <img
                alt={WINE_ALT}
                className="w-12 h-14 object-cover rounded-lg flex-shrink-0 bg-surface-container"
                src={WINE_IMG}
              />
              <div className="flex flex-col min-w-0">
                <span className="font-caption text-caption text-text-tertiary uppercase font-semibold">
                  Wine Cellar Catalog
                </span>
                <p className="font-label-md text-label-md text-text-primary font-semibold truncate">
                  Vintage Reserve Red Wine (750ml)
                </p>
                <span className="font-label-sm text-label-sm text-primary font-bold">₦42,000</span>
              </div>
            </div>
          </div>

          {messages.map((message) =>
            message.direction === 'in' ? (
              <div className="flex flex-col items-start max-w-[88%]" key={message.id}>
                {message.author && (
                  <div className="flex items-center gap-space-2xs mb-1">
                    <span className="font-caption text-caption font-semibold text-text-secondary">{message.author}</span>
                    <span className="font-caption text-caption text-text-tertiary">{message.time.split(',')[0]}</span>
                  </div>
                )}
                <div
                  className={`rounded-2xl rounded-tl-sm px-space-md py-space-sm shadow-sm font-body-md text-body-md ${
                    message.bubbleClass ?? 'bg-surface-canvas text-text-primary'
                  }`}
                >
                  {message.text}
                </div>
                <div className="flex items-center gap-1 mt-1 ml-1 text-text-tertiary font-caption text-caption">
                  {!message.author && <span>{message.meta ?? message.time}</span>}
                  {message.author && <span>{message.time.includes(',') ? message.time.split(', ')[1] : message.time}</span>}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-end self-end max-w-[88%]" key={message.id}>
                <div
                  className={`rounded-2xl rounded-tr-sm px-space-md py-space-sm shadow-sm font-body-md text-body-md ${
                    message.bubbleClass ?? 'bg-primary-container text-on-primary'
                  }`}
                >
                  {message.text}
                </div>
                <div className="flex items-center gap-1 mt-1 mr-1 text-text-secondary font-caption text-caption">
                  <span>{message.time}</span>
                  {message.status === 'sending' && (
                    <span className="inline-flex items-center gap-1 text-text-tertiary">
                      <Icon name="progress_activity" className="animate-spin text-[14px] text-primary" />
                      <span className="font-caption text-caption text-text-tertiary">Sending...</span>
                    </span>
                  )}
                  {message.status === 'read' && (
                    <Icon name="done_all" filled className="text-[14px] text-primary" />
                  )}
                  {message.status === 'delivered' && (
                    <Icon name="done_all" className="text-[14px] text-text-tertiary" />
                  )}
                </div>
              </div>
            ),
          )}
        </div>

        {/* Bottom Composer Deck */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface-canvas/95 backdrop-blur-xl shadow-xl pb-safe">
          {/* Quick Merchant Assistant Chips */}
          <div className="flex items-center gap-space-2xs px-margin pt-space-xs pb-space-2xs overflow-x-auto no-scrollbar">
            <button
              className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface font-caption text-caption whitespace-nowrap active:scale-95 transition-transform"
              type="button"
            >
              <Icon name="add_circle" className="text-[14px] text-primary" />
              Attach Menu Card
            </button>
            <button
              className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface font-caption text-caption whitespace-nowrap active:scale-95 transition-transform"
              type="button"
            >
              <Icon name="receipt_long" className="text-[14px] text-tertiary" />
              Issue Pre-Invoice
            </button>
            <button
              className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface font-caption text-caption whitespace-nowrap active:scale-95 transition-transform"
              type="button"
            >
              <Icon name="check_circle" className="text-[14px] text-badge-discount-text" />
              Modify Booking
            </button>
          </div>
          {/* Input Bar */}
          <div className="flex items-center gap-space-xs px-margin py-space-xs">
            <button
              aria-label="Add attachment or action"
              className="w-11 h-11 rounded-full bg-surface-subtle flex items-center justify-center text-text-secondary active:scale-95 transition-all shadow-sm"
              type="button"
              onClick={() => setAttachOpen(true)}
            >
              <Icon name="add" className="text-[22px]" />
            </button>
            <div className="flex-1 relative flex items-center">
              <input
                className="w-full h-11 pl-space-md pr-10 rounded-full bg-surface-subtle text-text-primary font-body-md text-body-md focus:outline-none shadow-inner"
                placeholder="Reply to Dr. Chidi..."
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                aria-label="Add emoji"
                className="absolute right-2.5 w-7 h-7 flex items-center justify-center text-text-tertiary hover:text-text-secondary transition-colors"
                type="button"
                onClick={() => setInput((current) => `${current} 😊`)}
              >
                <Icon name="sentiment_satisfied" className="text-[20px]" />
              </button>
            </div>
            <button
              aria-label="Send message"
              className="w-11 h-11 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md active:scale-95 transition-transform"
              type="button"
              onClick={handleSend}
            >
              <Icon name="send" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
