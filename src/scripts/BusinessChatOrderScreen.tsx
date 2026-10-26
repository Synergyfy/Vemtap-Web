import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import {
  CustomerProfileDrawer,
  AttachmentSheet,
  ChatOptionsSheet,
} from '../components/sheets/ChatSheets';
import { BusinessChatHeader } from './BusinessChatHeader';
import { useLiveChat } from './messagesLive';
import { useThreadRealtime } from '../hooks/business/useInbox';
import { DEFAULT_CHAT_CONTACTS, contactFirstName, contactInitials, type BusinessChatContact } from './messagesContact';

interface BusinessChatOrderScreenProps {
  onBack: () => void;
  /** Customer or business the merchant is chatting with. */
  contact?: BusinessChatContact;
}

const MICHAEL_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBamWqZzhrwTS30NpF89KXVNnuDN7so9uiydGhMdZrPlfE4nyaOMyowFBg2h0QFWetKCaywf41gcA89BwjYMT9oa22QFn7QR1KeHsKWQFPkoTFYJqMpB69Ic2rk9IE59QlCJcDYX4xWIM1yCqLUxVLXHMRaW3MQuDOoN5CSfqZM9-LEQyI2tf-wFsZ1hWuK6VuqCnCY6Q3mZ8lrqM8lfh9QIqM-1tdFc5GQu-ZTmFvejQQ0HLPCgqg6Bw';
const MICHAEL_ALT =
  'A warm, confident portrait of a 30-year-old West African man wearing a smart casual navy linen collared shirt against a soft neutral studio background, friendly smile, clean editorial commercial photography';

const METRICS = [
  {
    label: 'Total Spend',
    icon: 'payments',
    iconClass: 'text-primary',
    value: 'â‚¦318,000',
    sub: 'Top 5% Local Spender',
    subClass: 'text-badge-discount-text',
  },
  {
    label: 'Total Orders',
    icon: 'receipt_long',
    iconClass: 'text-secondary',
    value: '14 Orders',
    sub: 'Avg â‚¦22.7k / order',
    subClass: 'text-text-secondary',
  },
  {
    label: 'Tap Loyalty',
    icon: 'workspace_premium',
    iconClass: 'text-tertiary-container',
    value: '450 Pts',
    sub: 'â‚¦4,500 redeemable',
    subClass: 'text-text-secondary',
  },
  {
    label: 'Favorite Dish',
    icon: 'restaurant',
    iconClass: 'text-primary',
    value: 'Ribeye Steak',
    sub: 'Ordered 7 times',
    subClass: 'text-text-secondary',
  },
];

const ORDER_HISTORY = [
  {
    id: '#VG-94021',
    date: 'Today â€¢ 3 items',
    amount: 'â‚¦34,500',
    status: 'Ready',
    statusClass: 'text-badge-discount-text font-medium',
    icon: 'skillet',
    iconBox: 'bg-badge-discount-bg text-badge-discount-text',
  },
  {
    id: '#VG-93880',
    date: 'Oct 12 â€¢ 1 item',
    amount: 'â‚¦9,600',
    status: 'Completed',
    statusClass: 'text-text-secondary',
    icon: 'check_circle',
    iconBox: 'bg-surface-container text-secondary',
  },
  {
    id: '#VG-93510',
    date: 'Sep 28 â€¢ 2 items',
    amount: 'â‚¦14,800',
    status: 'Completed',
    statusClass: 'text-text-secondary',
    icon: 'check_circle',
    iconBox: 'bg-surface-container text-secondary',
  },
];

export function BusinessChatOrderScreen({ onBack, contact }: BusinessChatOrderScreenProps) {
  const activeContact = contact ?? DEFAULT_CHAT_CONTACTS.order;
  const firstName = contactFirstName(activeContact.name);
  const initials = contactInitials(activeContact.name);
  const liveChat = useLiveChat(activeContact.threadId);
  const { customerTyping } = useThreadRealtime(liveChat.live && activeContact.threadId ? activeContact.threadId : null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [custOpen, setCustOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [input, setInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const handleSend = () => {
    const value = input.trim();
    if (!value) return;
    setInput('');
    if (liveChat.live) {
      liveChat.send(value);
      return;
    }
    window.alert(`Message sent to ${firstName}: "${value}"`);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(`${activeContact.name} | +2348032198831 | michael.j@example.com`).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <AppScreen>
      <BusinessChatHeader
        onBack={onBack}
        title={activeContact.name}
        avatar={activeContact.avatar}
        isBusiness={activeContact.isBusiness}
        subtitle="Active inquiry â€¢ Order #VG-94021"
        onAvatar={() => setCustOpen(true)}
        onCall={() => (window.location.href = 'tel:+2348032198831')}
        onMore={() => setOptionsOpen(true)}
      />
      <CustomerProfileDrawer open={custOpen} onClose={() => setCustOpen(false)} name={activeContact.name} phone="+234 803 219 8831" />
      <AttachmentSheet open={attachOpen} onClose={() => setAttachOpen(false)} />
      <ChatOptionsSheet open={optionsOpen} onClose={() => setOptionsOpen(false)} />

      <div className="flex flex-col w-full flex-1 relative">
        {/* Top Pinned Order Context Deck */}
        <div className="px-space-md pt-space-xs pb-space-sm bg-surface">
          <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col gap-space-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-2xs">
                <span className="bg-surface-tint-blue text-primary font-caption text-caption px-space-xs py-0.5 rounded-full uppercase tracking-wider font-semibold">
                  Order Context
                </span>
                <span className="font-label-sm text-label-sm text-text-secondary">#VG-94021</span>
              </div>
              <span className="bg-badge-discount-bg text-badge-discount-text font-caption text-caption px-space-xs py-0.5 rounded-full font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                Ready Â· Pickup
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <p className="font-body-md text-body-md text-text-primary font-medium truncate pr-2">
                3 items (Woodfire Aged Ribeye x2, Fresh Lemonade x1)
              </p>
              <span className="font-heading-sm text-heading-sm text-primary flex-shrink-0 font-bold">â‚¦34,500</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1 text-text-secondary font-caption text-caption">
                <Icon name="contactless" className="text-[16px] text-text-tertiary" />
                <span>POS Terminal â€¢ Pay at Counter</span>
              </div>
              <button className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-0.5" type="button" onClick={() => showToast('Opening kitchen ticket #VG-94021…')}>
                View Ticket <Icon name="arrow_forward" className="text-[14px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Background Chat Thread (Dimmed Context) */}
        <div className="px-space-md py-space-sm flex flex-col gap-space-md opacity-45 pointer-events-none select-none pb-32">
          <div className="flex justify-center">
            <span className="font-caption text-caption bg-surface-container-low text-text-secondary px-3 py-1 rounded-full">
              Today, 11:28 AM
            </span>
          </div>
          {/* Customer Incoming */}
          {!liveChat.live && (
            <div className="flex items-end gap-space-xs max-w-[85%]">
              <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-label-sm text-label-sm flex-shrink-0 font-medium">
                {initials}
              </div>
              <div className="bg-surface-container-lowest rounded-2xl rounded-bl-xs p-space-sm shadow-sm flex flex-col gap-1">
                <p className="font-body-md text-body-md text-text-primary">
                  Good morning, is my pickup order ready? Heading out now.
                </p>
                <span className="font-caption text-caption text-text-tertiary self-end">11:29 AM</span>
              </div>
            </div>
          )}
          {/* Merchant Outgoing */}
          {!liveChat.live && (
            <div className="flex items-end gap-space-xs max-w-[85%] self-end flex-row-reverse">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary font-label-sm text-label-sm flex-shrink-0 font-medium">
                VT
              </div>
              <div className="bg-primary text-on-primary rounded-2xl rounded-br-xs p-space-sm shadow-sm flex flex-col gap-1">
                <p className="font-body-md text-body-md text-on-primary">
                  Hi {firstName}, chef just plated your ribeyes. Packing them securely in thermo-craft boxes now!
                </p>
                <span className="font-caption text-caption text-surface-tint-blue self-end flex items-center gap-1">
                  11:31 AM <Icon name="done_all" className="text-[13px]" />
                </span>
              </div>
            </div>
          )}
          {/* Live thread behind the order context */}
          {liveChat.live &&
            liveChat.messages.map((message) =>
              message.direction === 'in' ? (
                <div className="flex items-end gap-space-xs max-w-[85%]" key={message.id}>
                  <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-label-sm text-label-sm flex-shrink-0 font-medium">
                    {initials}
                  </div>
                  <div className="bg-surface-container-lowest rounded-2xl rounded-bl-xs p-space-sm shadow-sm flex flex-col gap-1">
                    <p className="font-body-md text-body-md text-text-primary">{message.text}</p>
                    <span className="font-caption text-caption text-text-tertiary self-end">{message.time}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-end gap-space-xs max-w-[85%] self-end flex-row-reverse" key={message.id}>
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary font-label-sm text-label-sm flex-shrink-0 font-medium">
                    VT
                  </div>
                  <div className="bg-primary text-on-primary rounded-2xl rounded-br-xs p-space-sm shadow-sm flex flex-col gap-1">
                    <p className="font-body-md text-body-md text-on-primary">{message.text}</p>
                    <span className="font-caption text-caption text-surface-tint-blue self-end flex items-center gap-1">
                      {message.time} {message.read && <Icon name="done_all" className="text-[13px]" />}
                    </span>
                  </div>
                </div>
              ),
            )}
          {/* Typing Indicator */}
          {(!liveChat.live || customerTyping) && (
            <div className="flex items-center gap-2 text-text-tertiary font-caption text-caption pl-9">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              <span>{firstName} is typing...</span>
            </div>
          )}
        </div>

        {/* Drawer Backdrop */}
        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 bg-on-surface/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        {/* Customer Profile Drawer */}
        <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pointer-events-none">
          <aside
            aria-label="Customer Profile Details"
            aria-modal="true"
            className={`absolute inset-y-0 right-0 w-[86%] max-w-[340px] bg-surface-canvas shadow-xl flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-out pointer-events-auto ${
              drawerOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            role="dialog"
          >
            {/* Drawer Header */}
            <div className="sticky top-0 bg-surface-canvas/95 backdrop-blur z-10 px-space-md pt-12 pb-space-xs flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider font-semibold">
                Customer Dossier
              </span>
              <button
                aria-label="Close profile drawer"
                className="w-8 h-8 rounded-full bg-surface-subtle text-text-secondary flex items-center justify-center active:scale-95 transition-transform"
                type="button"
                onClick={() => setDrawerOpen(false)}
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            {/* Scrollable Profile Content */}
            <div className="flex-1 px-space-md py-space-xs flex flex-col gap-space-md">
              {/* Identity Block */}
              <div className="flex flex-col items-center text-center bg-surface-subtle rounded-2xl p-space-md shadow-sm relative overflow-hidden">
                <div className="relative mb-space-xs">
                  <div className="w-20 h-20 rounded-full overflow-hidden shadow-sm">
                    <img alt={MICHAEL_ALT} className="w-full h-full object-cover" src={MICHAEL_IMG} />
                  </div>
                  <div
                    className="absolute bottom-0 right-0 bg-primary text-on-primary rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
                    title="Verified Customer"
                  >
                    <Icon name="verified" className="text-[16px]" />
                  </div>
                </div>
                <h2 className="font-heading-md text-heading-md text-text-primary font-bold">{activeContact.name}</h2>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="bg-surface-tint-blue text-primary font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Icon name="star" className="text-[14px]" /> Loyal Tier VIP
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 mt-space-sm w-full font-body-md text-body-md text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Icon name="phone_iphone" className="text-[17px] text-text-tertiary" />
                    <span className="font-medium text-text-primary">+234 803 219 8831</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="mail" className="text-[17px] text-text-tertiary" />
                    <span className="font-caption text-caption text-text-secondary">michael.j@example.com</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-space-xs w-full mt-space-sm pt-space-xs">
                  <a
                    className="h-10 bg-primary text-on-primary rounded-xl font-label-md text-label-md flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform"
                    href="tel:+2348032198831"
                  >
                    <Icon name="call" className="text-[18px]" />
                    Call
                  </a>
                  <button
                    className={`h-10 bg-surface-canvas rounded-xl font-label-md text-label-md flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform ${
                      copied ? 'text-primary' : 'text-text-primary'
                    }`}
                    type="button"
                    onClick={handleCopy}
                  >
                    <Icon name="content_copy" className="text-[18px] text-text-secondary" />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Relationship Metrics Bento */}
              <div className="grid grid-cols-2 gap-space-xs">
                {METRICS.map((metric) => (
                  <div className="bg-surface-subtle p-space-sm rounded-xl flex flex-col justify-between shadow-sm" key={metric.label}>
                    <div className="flex items-center justify-between text-text-secondary">
                      <span className="font-caption text-caption">{metric.label}</span>
                      <Icon name={metric.icon} className={`text-[18px] ${metric.iconClass}`} />
                    </div>
                    <div className="mt-2">
                      <span className="font-heading-sm text-heading-sm text-text-primary font-bold truncate block">
                        {metric.value}
                      </span>
                      <p className={`font-caption text-caption mt-0.5 ${metric.subClass}`}>{metric.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Conversation Intent Banner */}
              <div className="bg-surface-tint-blue rounded-xl p-space-sm flex items-start gap-space-xs shadow-sm">
                <Icon name="info" className="text-primary text-[20px] mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-primary font-semibold">Active Conversation Intent</span>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Order #VG-94021 is undergoing counter packing. {firstName} prefers extra cutlery & chimichurri.
                  </p>
                </div>
              </div>

              {/* Recent Order History */}
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-label-md text-label-md text-text-primary font-bold">Recent Order History</h3>
                  <span className="font-caption text-caption text-text-secondary">Last 60 Days</span>
                </div>
                {ORDER_HISTORY.map((order) => (
                  <div className="bg-surface-subtle p-space-sm rounded-xl flex items-center justify-between shadow-sm" key={order.id}>
                    <div className="flex items-center gap-space-xs">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${order.iconBox}`}>
                        <Icon name={order.icon} className="text-[18px]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-text-primary font-semibold">{order.id}</span>
                        <span className="font-caption text-caption text-text-secondary">{order.date}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-label-md text-label-md text-text-primary font-bold">{order.amount}</span>
                      <span className={`font-caption text-caption ${order.statusClass}`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="sticky bottom-0 bg-surface-canvas/95 backdrop-blur p-space-md flex flex-col gap-space-xs shadow-md">
              <button
                className="w-full h-11 bg-surface-tint-blue text-primary rounded-xl font-label-md text-label-md flex items-center justify-center gap-1.5 font-semibold hover:bg-secondary-container transition-colors"
                type="button"
              >
                <span>View Full Customer CRM Profile</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
              <div className="flex justify-center">
                <span className="font-caption text-caption text-text-tertiary">
                  VEMTAP Tap-Pass Identity Verified #9021-MJ
                </span>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom Composer */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface-canvas/90 backdrop-blur-lg px-space-md py-space-xs flex items-center gap-space-xs z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
          <button
            aria-label="Add media"
            className="w-10 h-10 rounded-full bg-surface-subtle flex items-center justify-center text-text-secondary"
            type="button"
            onClick={() => setAttachOpen(true)}
          >
            <Icon name="add" className="text-[20px]" />
          </button>
          <div className="flex-1 relative">
            <input
              aria-label={`Reply to ${firstName}`}
              className="w-full h-10 rounded-full bg-surface-subtle px-4 pr-10 text-text-primary font-body-md text-body-md placeholder:text-text-tertiary focus:outline-none"
              placeholder={`Reply to ${firstName}...`}
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-text-tertiary hover:text-text-secondary"
              type="button"
              onClick={() => setInput((current) => `${current} 😊`)}
            >
              <Icon name="sentiment_satisfied" className="text-[18px]" />
            </button>
          </div>
          <button
            aria-label="Send message"
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm active:scale-95 transition-transform"
            type="button"
            onClick={handleSend}
          >
            <Icon name="send" className="text-[20px]" />
          </button>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
