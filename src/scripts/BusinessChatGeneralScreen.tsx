import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { CustomerProfileDrawer, ChatOptionsSheet } from '../components/sheets/ChatSheets';
import { BusinessChatHeader } from './BusinessChatHeader';
import { DEFAULT_CHAT_CONTACTS, contactFirstName, type BusinessChatContact } from './messagesContact';

interface BusinessChatGeneralScreenProps {
  onBack: () => void;
  /** Customer or business the merchant is chatting with. */
  contact?: BusinessChatContact;
}

interface ThreadMessage {
  id: number;
  direction: 'in' | 'out';
  text: string;
  time: string;
  read?: 'done_all' | 'done';
}

const buildInitialMessages = (firstName: string): ThreadMessage[] => [
  { id: 1, direction: 'in', text: 'Good morning! Do you cater for private corporate lunches for about 25 people?', time: '10:14 AM' },
  {
    id: 2,
    direction: 'out',
    text: `Good morning ${firstName}! Yes, we offer tailored corporate lunch catering packages with custom menus.`,
    time: '10:18 AM',
    read: 'done_all',
  },
  { id: 3, direction: 'in', text: 'That sounds great. Could you share your catering brochure or a sample menu with prices?', time: '10:20 AM' },
  {
    id: 4,
    direction: 'out',
    text: 'Certainly! Sending our current corporate catering catalogue and banquet packages right now.',
    time: '10:22 AM',
    read: 'done',
  },
];

const ATTACHMENT_OPTIONS = [
  { icon: 'photo_camera', iconBox: 'bg-surface-tint-blue text-primary', title: 'Camera', sub: 'Take live photo' },
  { icon: 'image', iconBox: 'bg-secondary-container text-on-secondary-container', title: 'Gallery', sub: 'Photos & videos' },
  { icon: 'description', iconBox: 'bg-tertiary-fixed text-tertiary', title: 'Document', sub: 'Catalogue & Menu' },
  { icon: 'local_offer', iconBox: 'bg-badge-discount-bg text-badge-discount-text', title: 'Deal Card', sub: 'Attach live offer' },
];

const formatNow = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${minutes} ${ampm}`;
};

export function BusinessChatGeneralScreen({ onBack, contact }: BusinessChatGeneralScreenProps) {
  const activeContact = contact ?? DEFAULT_CHAT_CONTACTS.general;
  const firstName = contactFirstName(activeContact.name);
  const [messages, setMessages] = useState<ThreadMessage[]>(() => buildInitialMessages(firstName));
  const [input, setInput] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const handleSend = () => {
    const value = input.trim();
    if (!value) return;
    setMessages((current) => [...current, { id: Date.now(), direction: 'out', text: value, time: formatNow(), read: 'done' }]);
    setInput('');
    setSheetOpen(false);
    window.setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50);
  };

  return (
    <AppScreen>
      <BusinessChatHeader
        onBack={onBack}
        title={activeContact.name}
        avatar={activeContact.avatar}
        isBusiness={activeContact.isBusiness}
        subtitle="Active inquiry • Corporate Catering"
        onAvatar={() => setDrawerOpen(true)}
        onCall={() => (window.location.href = 'tel:+2348035551204')}
        onMore={() => setOptionsOpen(true)}
      />
      <CustomerProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} name={activeContact.name} phone="+234 803 555 1204" />
      <ChatOptionsSheet open={optionsOpen} onClose={() => setOptionsOpen(false)} />

      <div className="flex flex-col w-full flex-1 relative">
        {/* Interactive Conversation Canvas */}
        <div className="flex flex-col px-space-md py-space-sm space-y-space-md pb-44">
          {/* Context Anchor Card */}
          <div className="bg-surface-subtle p-space-sm rounded-xl shadow-sm flex flex-col space-y-space-2xs">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label-sm font-semibold tracking-wide bg-secondary-container text-on-secondary-container">
                GENERAL INQUIRY
              </span>
              <span className="font-caption text-caption text-text-tertiary">Initiated 10:12 AM</span>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Customer started conversation from <span className="font-semibold text-on-surface">Urban Grill & Bistro</span>{' '}
              public storefront.
            </p>
            <button
              className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-medium hover:underline self-start pt-1"
              type="button"
            >
              <span>View Storefront Profile</span>
              <Icon name="arrow_forward" className="text-[16px]" />
            </button>
          </div>

          {/* Date Divider */}
          <div className="flex items-center justify-center my-space-2xs">
            <span className="px-3 py-1 rounded-full bg-surface-container-high font-caption text-caption text-text-secondary font-medium tracking-wide">
              TODAY
            </span>
          </div>

          {/* Messages */}
          {messages.map((message) =>
            message.direction === 'in' ? (
              <div className="flex flex-col items-start max-w-[82%]" key={message.id}>
                <div className="bg-surface-canvas text-on-surface p-3.5 rounded-2xl rounded-tl-sm shadow-sm">
                  <p className="font-body-md text-body-md leading-relaxed">{message.text}</p>
                </div>
                <span className="font-caption text-caption text-text-tertiary mt-1 px-1">{message.time}</span>
              </div>
            ) : (
              <div className="flex flex-col items-end self-end max-w-[82%]" key={message.id}>
                <div className="bg-primary-container text-on-primary p-3.5 rounded-2xl rounded-tr-sm shadow-sm">
                  <p className="font-body-md text-body-md leading-relaxed">{message.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="font-caption text-caption text-text-tertiary">{message.time}</span>
                  <Icon
                    name={message.read === 'done_all' ? 'done_all' : 'done'}
                    filled={message.read === 'done_all'}
                    className={`text-[15px] ${message.read === 'done_all' ? 'text-primary' : 'text-text-tertiary'}`}
                  />
                </div>
              </div>
            ),
          )}
        </div>

        {/* Modal Backdrop Dim */}
        {sheetOpen && <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-[2px] z-30" onClick={() => setSheetOpen(false)} />}

        {/* Bottom Interactive Deck: Sheet + Composer */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 flex flex-col justify-end">
          {/* Attachment Modal Card */}
          {sheetOpen && (
            <div className="bg-surface-canvas rounded-t-3xl shadow-xl px-space-md pt-3 pb-space-md flex flex-col space-y-space-md">
              <div className="w-10 h-1.5 bg-outline-variant/60 rounded-full mx-auto" />
              <div className="flex items-center justify-between">
                <h2 className="font-heading-sm text-heading-sm text-on-surface font-semibold">Share Attachment</h2>
                <button
                  aria-label="Dismiss attachment options"
                  className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center text-text-secondary hover:text-on-surface"
                  type="button"
                  onClick={() => setSheetOpen(false)}
                >
                  <Icon name="close" className="text-[20px]" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-space-sm">
                {ATTACHMENT_OPTIONS.map((option) => (
                  <button
                    className="flex items-center gap-3 p-3 bg-surface-subtle hover:bg-surface-container transition-colors rounded-2xl text-left group"
                    key={option.title}
                    type="button"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${option.iconBox}`}
                    >
                      <Icon name={option.icon} className="text-[22px]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                        {option.title}
                      </span>
                      <span className="font-caption text-caption text-text-secondary truncate">{option.sub}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Composer Deck */}
          <div className="bg-surface-canvas p-space-sm pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-space-xs">
              <button
                aria-label="Toggle attachments menu"
                className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-all active:scale-95 ${
                  sheetOpen ? 'bg-primary text-on-primary' : 'bg-surface-subtle text-text-secondary'
                }`}
                type="button"
                onClick={() => setSheetOpen((open) => !open)}
              >
                <Icon name="add" className={`text-[22px] transition-transform duration-200 ${sheetOpen ? 'rotate-45' : ''}`} />
              </button>
              <div className="flex-1 bg-surface-subtle rounded-2xl px-4 py-2.5 flex items-center gap-2">
                <input
                  className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none"
                  id="chat-input"
                  placeholder="Type a message..."
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
                  aria-label="Insert emoji"
                  className="text-text-tertiary hover:text-on-surface flex items-center justify-center"
                  type="button"
                >
                  <Icon name="sentiment_satisfied" className="text-[20px]" />
                </button>
              </div>
              <button
                aria-label="Record voice note or send"
                className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0 shadow-sm transition-transform active:scale-95"
                type="button"
                onClick={handleSend}
              >
                <Icon name={input.trim().length > 0 ? 'send' : 'mic'} className="text-[20px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
