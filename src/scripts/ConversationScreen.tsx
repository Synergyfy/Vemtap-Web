import { Fragment, useRef, useState, type FormEvent } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { MessageActions, MessageContent } from '../components/ui/MessageContent';
import { MessageTicks } from '../components/ui/MessageTicks';
import { useChatThread } from '../hooks/useChatThread';
import type { MessageThread } from '../services/messageService';
import { UserAvatar } from '../components/ui/UserAvatar';

interface ConversationScreenProps {
  threadId: string;
  onBack: () => void;
  onViewPass: () => void;
  onSecondary: () => void;
}

const ATTACHMENT_OPTIONS = [
  { icon: 'photo_camera', iconBox: 'bg-surface-tint-blue text-primary', title: 'Camera', sub: 'Take live photo' },
  { icon: 'image', iconBox: 'bg-secondary-container text-on-secondary-container', title: 'Gallery', sub: 'Photos & videos' },
  { icon: 'description', iconBox: 'bg-tertiary-fixed text-tertiary', title: 'Document', sub: 'Receipts & PDFs' },
  { icon: 'local_offer', iconBox: 'bg-badge-discount-bg text-badge-discount-text', title: 'Deal Pass', sub: 'Attach voucher code' },
];

export function ConversationScreen({ threadId, onBack, onViewPass, onSecondary }: ConversationScreenProps) {
  const { thread, messages, loading, typing, online, send, sendFile, editMessage, deleteMessage, notifyTyping } = useChatThread(threadId);
  const [actionsFor, setActionsFor] = useState<string | number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((curr) => (curr === message ? null : curr)), 2400);
  };

  const scrollToEnd = () => window.setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50);

  const deliver = async (text: string) => {
    scrollToEnd();
    if (!(await send(text))) showToast('Message could not be sent. Please retry.');
  };

  const sendMessage = (event?: FormEvent) => {
    if (event) event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    setSheetOpen(false);
    if (editingId) {
      const id = editingId;
      setEditingId(null);
      void editMessage(id, text).then((reason) => reason && showToast(reason));
      return;
    }
    void deliver(text);
  };

  const pickFile = (accept: string, capture?: boolean) => {
    const input = fileInput.current;
    if (!input) return;
    input.accept = accept;
    if (capture) input.setAttribute('capture', 'environment');
    else input.removeAttribute('capture');
    input.click();
  };

  const onFilePicked = (file: File | undefined) => {
    if (!file) return;
    scrollToEnd();
    void sendFile(file).then((reason) => reason && showToast(reason));
  };

  const startEdit = (id: string, body: string) => {
    setEditingId(id);
    setDraft(body);
    setActionsFor(null);
    inputRef.current?.focus();
  };

  const removeMessage = (id: string) => {
    setActionsFor(null);
    void deleteMessage(id).then((reason) => reason && showToast(reason));
  };

  const useReply = (text: string) => void deliver(text);

  const handleAttachment = (title: string) => {
    setSheetOpen(false);
    if (title === 'Deal Pass' && thread?.deal) {
      void deliver(`Attached Deal Pass: ${thread.deal.code} (${thread.deal.title})`);
    } else if (title === 'Camera') {
      pickFile('image/jpeg,image/png,image/webp', true);
    } else if (title === 'Gallery') {
      pickFile('image/jpeg,image/png,image/webp');
    } else if (title === 'Document') {
      pickFile('application/pdf');
    } else {
      showToast('This chat has no deal pass to attach.');
    }
  };

  if (loading && !thread) {
    return (
      <AppScreen>
        <div className="flex flex-1 items-center justify-center px-space-md text-center">
          <div className="space-y-2">
            <Icon name="forum" className="text-[36px] text-outline-variant mx-auto" />
            <p className="font-label-md text-label-md text-text-secondary">Loading conversation…</p>
          </div>
        </div>
      </AppScreen>
    );
  }

  const safeThread: MessageThread = thread ?? {
    id: threadId,
    name: 'Conversation',
    initials: 'C',
    verified: false,
    time: '',
    tag: 'Direct Message',
    tagClass: 'bg-surface-container-high text-text-secondary',
    tagIcon: 'chat_bubble_outline',
    preview: '',
    unread: false,
    filters: ['bookings'],
    messages: [],
    quickReplies: ['Thanks', 'Please confirm', 'I will get back shortly'],
  };

  return (
    <AppScreen>
      {/* Sticky Header — matches BusinessChatHeader */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-space-sm flex items-center justify-between gap-space-2xs">
          <div className="flex items-center gap-space-xs min-w-0 flex-1">
            <button
              aria-label="Back to messages"
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:text-primary transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <div className="relative flex-shrink-0">
              {safeThread.avatar ? (
                <img
                  className="w-10 h-10 rounded-full object-cover shadow-sm"
                  alt={safeThread.alt ?? safeThread.name}
                  src={safeThread.avatar}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-label-sm text-label-sm font-bold shadow-sm">
                  {safeThread.initials}
                </div>
              )}
              {online ? <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-badge-discount-text ring-2 ring-surface" /> : null}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">{safeThread.name}</h1>
                {safeThread.verified && <Icon name="verified" filled className="text-primary text-[16px] shrink-0" />}
              </div>
              <span className="font-caption text-caption text-text-secondary truncate">
                {typing ? 'typing…' : online ? 'Active now' : online === false ? 'Offline' : safeThread.location ?? ''}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-2xs">
            <a
              aria-label={`Call ${safeThread.name}`}
              href={safeThread.phone ? `tel:${safeThread.phone}` : undefined}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary transition-colors"
            >
              <Icon name="call" className="text-[22px]" />
            </a>
            <button
              aria-label="More options"
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
              type="button"
              onClick={onSecondary}
            >
              <Icon name="more_vert" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-2xs overflow-hidden">
              <UserAvatar textClassName="text-on-primary text-[13px]" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Conversation Stream */}
      <div className="flex flex-col w-full flex-1 relative">
        <div className="flex flex-col px-space-md py-space-sm space-y-space-md pb-44">
          {/* Context Anchor Card — matches BusinessChatGeneralScreen */}
          {safeThread.deal ? (
            <div className="bg-surface-subtle p-space-sm rounded-xl shadow-sm flex flex-col space-y-space-2xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label-sm font-semibold tracking-wide bg-secondary-container text-on-secondary-container">
                  ACTIVE DEAL PASS
                </span>
                <span className="font-caption text-caption text-text-tertiary">Code: {safeThread.deal.code}</span>
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                {safeThread.deal.title}
              </p>
              <button
                className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-medium hover:underline self-start pt-1"
                type="button"
                onClick={onViewPass}
              >
                <span>View Deal Pass</span>
                <Icon name="arrow_forward" className="text-[16px]" />
              </button>
            </div>
          ) : (
            <div className="bg-surface-subtle p-space-sm rounded-xl shadow-sm flex flex-col space-y-space-2xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label-sm font-semibold tracking-wide bg-secondary-container text-on-secondary-container">
                  DIRECT CONVERSATION
                </span>
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                You are messaging directly with <span className="font-semibold text-on-surface">{safeThread.name}</span>.
              </p>
            </div>
          )}

          {/* Message Bubbles */}
          {messages.map((message, index) => (
            <Fragment key={message.id}>
              {message.day && message.day !== messages[index - 1]?.day ? (
                <div className="flex items-center justify-center my-space-2xs">
                  <span className="px-3 py-1 rounded-full bg-surface-container-high font-caption text-caption text-text-secondary font-medium tracking-wide">
                    {message.day.toUpperCase()}
                  </span>
                </div>
              ) : null}
              {message.sender === 'merchant' ? (
              <div className="flex flex-col items-start max-w-[82%]">
                <div className="bg-surface-canvas text-on-surface p-3.5 rounded-2xl rounded-tl-sm shadow-sm border border-outline-variant/30">
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="font-label-sm text-[12px] font-semibold text-text-secondary">{message.author}</span>
                    {message.badge && (
                      <span className="px-1.5 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-caption text-[10px] font-bold">
                        {message.badge}
                      </span>
                    )}
                  </div>
                  <MessageContent message={message} className="font-body-md text-body-md leading-relaxed" />
                </div>
                <span className="font-caption text-caption text-text-tertiary mt-1 px-1">
                  {message.time}
                  {message.edited ? ' • Edited' : ''}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-end self-end max-w-[82%]">
                <button
                  type="button"
                  className="bg-primary-container text-on-primary p-3.5 rounded-2xl rounded-tr-sm shadow-sm text-left"
                  onClick={() => setActionsFor((current) => (current === message.id ? null : message.id))}
                >
                  <MessageContent message={message} className="font-body-md text-body-md leading-relaxed" />
                </button>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="font-caption text-caption text-text-tertiary">
                    {message.time}
                    {message.edited ? ' • Edited' : ''}
                  </span>
                  <MessageTicks tick={message.tick} />
                </div>
                {actionsFor === message.id && typeof message.id === 'string' && !message.id.startsWith('local-') && !message.deleted ? (
                  <MessageActions
                    canEdit={Boolean(message.body)}
                    onEdit={() => startEdit(String(message.id), message.body)}
                    onDelete={() => removeMessage(String(message.id))}
                  />
                ) : null}
              </div>
              )}
            </Fragment>
          ))}
        </div>

        {/* Modal Backdrop Dim for Attachment options */}
        {sheetOpen && (
          <div
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-[2px] z-30"
            onClick={() => setSheetOpen(false)}
          />
        )}

        {/* Bottom Interactive Deck: Sheet + Quick Replies + Composer */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 flex flex-col justify-end">
          {/* Attachment Modal Card — identical to Business chat */}
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
                    onClick={() => handleAttachment(option.title)}
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

          {/* Quick Replies chips row */}
          {!sheetOpen && safeThread.quickReplies?.length > 0 && (
            <div className="px-space-md py-1 bg-surface-canvas/90 backdrop-blur-md flex items-center gap-space-xs overflow-x-auto no-scrollbar">
              {safeThread.quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => useReply(reply)}
                  className="flex-shrink-0 bg-surface-subtle hover:bg-surface-tint-blue text-text-secondary hover:text-primary font-label-sm text-label-sm py-1.5 px-space-sm rounded-full transition-colors shadow-sm"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Composer Deck */}
          <input
            ref={fileInput}
            type="file"
            hidden
            aria-label="Choose a file to send"
            onChange={(event) => {
              onFilePicked(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
          {editingId ? (
            <div className="bg-surface-canvas px-space-md pt-space-xs flex items-center justify-between font-label-sm text-label-sm text-text-secondary">
              <span>Editing message</span>
              <button
                type="button"
                className="text-primary font-semibold"
                onClick={() => {
                  setEditingId(null);
                  setDraft('');
                }}
              >
                Cancel
              </button>
            </div>
          ) : null}
          <div className="bg-surface-canvas p-space-sm pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.05)] border-t border-border">
            <form className="flex items-center gap-space-xs" onSubmit={sendMessage}>
              <button
                aria-label="Toggle attachments menu"
                className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-all active:scale-95 ${
                  sheetOpen ? 'bg-primary text-on-primary' : 'bg-surface-subtle text-text-secondary'
                }`}
                type="button"
                onClick={() => setSheetOpen((open) => !open)}
              >
                <Icon
                  name="add"
                  className={`text-[22px] transition-transform duration-200 ${sheetOpen ? 'rotate-45' : ''}`}
                />
              </button>
              <div className="flex-1 bg-surface-subtle rounded-2xl px-4 py-2.5 flex items-center gap-2">
                <input
                  ref={inputRef}
                  className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none"
                  placeholder={`Message ${safeThread.name}...`}
                  type="text"
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    if (e.target.value) notifyTyping();
                  }}
                />
              </div>
              <button
                aria-label="Send message"
                className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0 shadow-sm transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!draft.trim()}
                type="submit"
              >
                <Icon name="send" className="text-[20px]" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[400px] z-50 rounded-xl bg-inverse-surface text-inverse-on-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
