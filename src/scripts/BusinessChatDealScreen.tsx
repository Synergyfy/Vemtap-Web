import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import {
  CustomerProfileDrawer,
  AttachmentSheet,
  ChatOptionsSheet,
} from '../components/sheets/ChatSheets';
import { BusinessChatHeader } from './BusinessChatHeader';
import { DEFAULT_CHAT_CONTACTS, contactFirstName, type BusinessChatContact } from './messagesContact';

interface BusinessChatDealScreenProps {
  onBack: () => void;
  /** Customer or business the merchant is chatting with. */
  contact?: BusinessChatContact;
}

interface ThreadMessage {
  id: number;
  direction: 'in' | 'out';
  text: string;
  time: string;
  readState?: 'read' | 'delivered';
  showAuthor?: string;
}

const DEAL_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBXLkdQzSVQfSgS8ZLgIv0WATbmAi9alZtT09HZkEhJtNZjmfv1gNORmzC2rINUTjJuhiUclECXv7LQK5andKgZx_ntw0OXp-Kt49KRswN7gjo_y6gP7euQMa-M_TD1Edlq3pVL7tBCYWopLxChZdR8kzYxBjxpmy-_8gJ6Om7AAnPrAGtU2wg3gGgkgKbUvHEP2q5YEgm_xPi0Ylbr7QQfrR0y-0fJuZCjR6pIwo1xkoTQtO9eag9tpw';
const DEAL_ALT =
  'Gourmet artisanal lunch burger with melted aged cheddar, crisp butter lettuce, sliced heirloom tomato, crispy hand-cut golden fries in a small matte ramekin, warm cafe natural backlight, professional food photography, shallow depth of field, vibrant colors';

const buildInitialMessages = (firstName: string): ThreadMessage[] => [
  {
    id: 1,
    direction: 'in',
    text: "Hello! We'd like to bring a team of 4 colleagues for lunch today. Can we all claim this 20% deal on our separate VEMTAP apps?",
    time: '10:35 AM',
    showAuthor: firstName,
  },
  {
    id: 2,
    direction: 'out',
    text: `Hi ${firstName}! Yes, absolutely! Each colleague can simply claim the voucher on their VEMTAP app and show the QR code when ordering at Table or Counter.`,
    time: '10:38 AM',
    readState: 'read',
  },
  {
    id: 3,
    direction: 'in',
    text: 'Awesome, we are heading over now. Can we settle with POS card swipe at the table?',
    time: '10:41 AM',
    showAuthor: firstName,
  },
  {
    id: 4,
    direction: 'out',
    text: 'Yes, our mobile POS terminal will be brought right to your table. Looking forward to hosting you!',
    time: '10:42 AM',
    readState: 'delivered',
  },
];

const QUICK_REPLIES = [
  {
    label: 'Send directions',
    emoji: '📍',
    text: 'Here are our express directions: We are at Suite 4, Central Promenade right opposite City Park. See you shortly! 📍',
  },
  {
    label: 'Confirm table',
    emoji: '🍽️',
    text: 'Table for 4 is reserved for your party 🍽️',
  },
  {
    label: 'Send voucher link',
    emoji: '🎫',
    text: 'Tap here to share this voucher directly with your colleagues: vemtap.com/deal/VT-48F261 🎫',
  },
];

const formatNow = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${minutes} ${ampm}`;
};

export function BusinessChatDealScreen({ onBack, contact }: BusinessChatDealScreenProps) {
  const activeContact = contact ?? DEFAULT_CHAT_CONTACTS.deal;
  const firstName = contactFirstName(activeContact.name);
  const [messages, setMessages] = useState<ThreadMessage[]>(() => buildInitialMessages(firstName));
  const [input, setInput] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const handleSend = () => {
    const value = input.trim();
    if (!value) return;
    setMessages((current) => [
      ...current,
      { id: Date.now(), direction: 'out', text: value, time: formatNow(), readState: 'delivered' },
    ]);
    setInput('');
    window.setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50);
  };

  return (
    <AppScreen>
      <BusinessChatHeader
        onBack={onBack}
        title={activeContact.name}
        avatar={activeContact.avatar}
        isBusiness={activeContact.isBusiness}
        subtitle="Active inquiry • Deal #VT-48F261"
        onAvatar={() => setDrawerOpen(true)}
        onCall={() => (window.location.href = 'tel:+2348124430912')}
        onMore={() => setOptionsOpen(true)}
      />
      <CustomerProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} name={activeContact.name} phone="+234 812 443 0912" />
      <AttachmentSheet open={attachOpen} onClose={() => setAttachOpen(false)} />
      <ChatOptionsSheet open={optionsOpen} onClose={() => setOptionsOpen(false)} />

      <div className="flex flex-col w-full flex-1">
        {/* Pinned Deal Context Card */}
        <div className="sticky top-16 z-20 px-space-md py-space-xs bg-surface/95 backdrop-blur-md">
          <section
            aria-label="Referenced Deal Context"
            className="bg-surface-container-lowest rounded-xl p-space-sm shadow-md flex flex-col gap-space-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-2xs">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold tracking-wide">
                  <Icon name="local_offer" filled className="text-[13px]" />
                  DEAL CONTEXT
                </span>
                <span className="font-caption text-caption text-text-tertiary">#VT-48F261</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container font-caption text-caption text-text-secondary">
                Active Campaign
              </span>
            </div>
            <div className="flex items-center gap-space-sm pt-space-2xs">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                <img alt={DEAL_ALT} className="w-full h-full object-cover" src={DEAL_IMG} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">20% Off Prime Lunch Combo</h2>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-label-sm text-label-sm text-primary font-semibold">₦9,600</span>
                  <span className="font-caption text-caption text-text-tertiary line-through">₦12,000</span>
                  <span className="w-1 h-1 rounded-full bg-text-tertiary" />
                  <span className="font-caption text-caption text-text-secondary">Mon-Fri 12–4 PM</span>
                </div>
                <div className="mt-space-2xs flex items-center justify-between">
                  <span className="font-caption text-caption text-badge-discount-text font-medium">
                    Valid for separate redemption
                  </span>
                  <button
                    aria-label="View complete deal details"
                    className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold transition-colors"
                    type="button"
                  >
                    Details
                    <Icon name="arrow_forward" className="text-[16px]" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Messages Conversation Stream */}
        <div className="px-space-md py-space-sm flex flex-col gap-space-md pb-40" id="chat-stream">
          {/* Timeline Date Stamp */}
          <div className="flex items-center justify-center my-space-2xs">
            <span className="px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption font-medium shadow-sm">
              TODAY, OCT 18
            </span>
          </div>

          {messages.map((message) =>
            message.direction === 'in' ? (
              <div className="flex flex-col items-start max-w-[84%] gap-1" key={message.id}>
                <div className="bg-surface-container-lowest text-text-primary rounded-2xl rounded-tl-sm px-space-md py-space-sm shadow-sm">
                  <p className="font-body-md text-body-md leading-relaxed">{message.text}</p>
                </div>
                <div className="flex items-center gap-1 pl-1">
                  <span className="font-caption text-caption text-text-tertiary">{message.time}</span>
                  {message.showAuthor && (
                    <span className="font-caption text-caption text-text-tertiary">• {message.showAuthor}</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-end max-w-[85%] self-end gap-1" key={message.id}>
                <div className="bg-primary text-on-primary rounded-2xl rounded-tr-sm px-space-md py-space-sm shadow-md">
                  <p className="font-body-md text-body-md leading-relaxed">{message.text}</p>
                </div>
                <div className="flex items-center gap-1 pr-1">
                  <span className="font-caption text-caption text-text-tertiary">{message.time}</span>
                  <Icon
                    name="done_all"
                    filled
                    className={`text-[16px] ${message.readState === 'read' ? 'text-primary' : 'text-text-tertiary'}`}
                  />
                </div>
              </div>
            ),
          )}
        </div>

        {/* Bottom Interactive Deck */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 bg-surface/95 backdrop-blur-xl pt-space-xs pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          {/* Quick Business Action Chips */}
          <div className="px-space-md pb-space-xs overflow-x-auto no-scrollbar flex items-center gap-space-xs">
            {QUICK_REPLIES.map((reply) => (
              <button
                className="h-9 px-space-sm rounded-full bg-surface-subtle hover:bg-surface-tint-blue text-text-secondary hover:text-primary font-label-sm text-label-sm whitespace-nowrap shadow-sm flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
                key={reply.label}
                type="button"
                onClick={() => setInput(reply.text)}
              >
                <span>{reply.label}</span>
                <span>{reply.emoji}</span>
              </button>
            ))}
          </div>
          {/* Message Composer Bar */}
          <div className="px-space-md pb-space-sm pt-1 flex items-center gap-space-xs">
            <button
              aria-label="Attach voucher, photo or receipt"
              className="w-11 h-11 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors active:scale-95"
              type="button"
              onClick={() => setAttachOpen(true)}
            >
              <Icon name="add" className="text-[24px]" />
            </button>
            <div className="relative flex-1">
              <input
                autoComplete="off"
                className="w-full h-[48px] pl-space-md pr-10 rounded-full bg-surface-container-lowest text-text-primary placeholder:text-text-tertiary font-body-md text-body-md focus:outline-none focus:bg-surface-canvas shadow-sm"
                placeholder={`Type a reply to ${firstName}...`}
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
                aria-label="Add canned emoji or smile"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-primary transition-colors"
                type="button"
                onClick={() => setInput((current) => `${current} 😊`)}
              >
                <Icon name="sentiment_satisfied" className="text-[20px]" />
              </button>
            </div>
            <button
              aria-label="Send message to customer"
              className="w-11 h-11 rounded-full bg-primary hover:bg-primary-container text-on-primary flex items-center justify-center shadow-md active:scale-95 transition-all"
              type="button"
              onClick={handleSend}
            >
              <Icon name="send" className="text-[20px] ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
