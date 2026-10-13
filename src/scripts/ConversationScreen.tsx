import { useRef, useState, type FormEvent } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { MOBILE_THREADS, type MobileMessage } from './messagesData';

interface ConversationScreenProps {
  threadId: string;
  onBack: () => void;
  onViewPass: () => void;
  onSecondary: () => void;
}

function formatTime(date: Date): string {
  const period = date.getHours() >= 12 ? 'PM' : 'AM';
  const hour = date.getHours() % 12 || 12;
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${hour}:${minute} ${period}`;
}

export function ConversationScreen({ threadId, onBack, onViewPass, onSecondary }: ConversationScreenProps) {
  const thread = MOBILE_THREADS.find((item) => item.id === threadId) ?? MOBILE_THREADS[0];
  const [messages, setMessages] = useState<MobileMessage[]>(thread.messages);
  const [draft, setDraft] = useState('');
  const [pinnedVisible, setPinnedVisible] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimers = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2400);
    toastTimers.current.push(timer);
  };

  const appendMessage = (body: string) => {
    setMessages((current) => [
      ...current,
      { id: Date.now(), sender: 'you', author: 'You', time: formatTime(new Date()), body, delivered: true },
    ]);
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    appendMessage(text);
    setDraft('');
    inputRef.current?.focus();
  };

  const useReply = (text: string) => {
    appendMessage(text);
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
              {thread.avatar ? (
                <img
                  className="w-11 h-11 rounded-full object-cover shadow-sm"
                  alt={thread.alt ?? thread.name}
                  src={thread.avatar}
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-label-sm text-label-sm font-bold shadow-sm">
                  {thread.initials}
                </div>
              )}
              <span
                className="absolute bottom-0 right-0 w-3 h-3 bg-badge-discount-text rounded-full ring-2 ring-surface-container-lowest"
                title="Active now"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center space-x-space-2xs">
                <h1 className="font-heading-sm text-heading-sm text-text-primary truncate">{thread.name}</h1>
                {thread.verified && (
                  <span title="Verified Merchant" className="flex-shrink-0">
                    <Icon name="verified" filled className="text-primary text-[18px]" />
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1 text-badge-discount-text font-caption text-caption truncate">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                <span className="font-medium">Open</span>
                <span className="text-text-tertiary text-[10px]">•</span>
                <span className="text-text-secondary truncate">{thread.status}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <a
              aria-label={`Call ${thread.name}`}
              href={`tel:${thread.phone}`}
              className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-tint-blue transition-colors"
            >
              <Icon name="call" className="text-[22px]" />
            </a>
            <button
              type="button"
              onClick={onSecondary}
              className="flex items-center gap-1 px-space-sm h-9 rounded-full bg-surface-container-low text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-tint-blue transition-colors"
            >
              <span>{thread.secondaryLabel}</span>
            </button>
          </div>
        </div>

        {thread.deal && pinnedVisible && (
          <div className="px-margin pb-space-xs">
            <div className="bg-surface-container-low rounded-xl p-space-sm shadow-sm">
              <div className="flex items-start justify-between gap-space-xs">
                <div className="flex items-start space-x-space-xs min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center flex-shrink-0">
                    <Icon name="confirmation_number" filled className="text-[20px]" />
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate">
                      {thread.deal.title}
                    </span>
                    <p className="text-text-secondary font-caption text-caption mt-0.5 truncate">
                      Active deal context for this chat
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs shrink-0">
                  <button
                    type="button"
                    onClick={onViewPass}
                    className="flex items-center space-x-0.5 text-primary font-label-sm text-label-sm font-semibold hover:underline"
                  >
                    <span>View Pass</span>
                    <Icon name="arrow_forward" className="text-[16px]" />
                  </button>
                  <button
                    aria-label="Dismiss deal context"
                    type="button"
                    onClick={() => setPinnedVisible(false)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-container transition-colors"
                  >
                    <Icon name="close" className="text-[16px]" />
                  </button>
                </div>
              </div>
              <div className="mt-space-xs pt-space-xs flex items-center justify-between bg-surface-container-lowest rounded-lg px-space-sm py-1.5">
                <span className="text-text-tertiary font-caption text-[11px] uppercase tracking-wide">Pass Code</span>
                <span className="font-label-sm text-label-sm font-bold text-text-primary tracking-wider">
                  {thread.deal.code}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="px-margin pb-space-xs">
          <div className="flex items-center space-x-2 py-1.5 px-space-sm bg-surface-subtle rounded-lg text-text-secondary font-caption text-[11px] leading-tight">
            <Icon name="lock" filled className="text-[14px] text-primary flex-shrink-0" />
            <span className="truncate">End-to-end encrypted • Protected under NDPR standards</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col space-y-space-md px-margin py-space-sm pb-space-sm">
        <div className="flex justify-center my-space-xs">
          <span className="bg-surface-container text-on-surface-variant font-caption text-caption px-space-sm py-0.5 rounded-full shadow-sm">
            Today
          </span>
        </div>

        {messages.map((message) =>
          message.sender === 'merchant' ? (
            <div className="flex items-start space-x-space-xs pr-space-xl" key={message.id}>
              {message.avatar ? (
                <img
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1 shadow-sm"
                  alt={message.avatarAlt ?? message.author}
                  src={message.avatar}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-caption text-[11px] font-bold flex-shrink-0 mt-1">
                  {thread.initials}
                </div>
              )}
              <div className="flex flex-col space-y-1">
                <div className="bg-surface-container-lowest text-text-primary rounded-2xl rounded-tl-sm p-space-sm shadow-sm border border-outline-variant/30">
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="font-label-sm text-[12px] font-semibold text-text-secondary">{message.author}</span>
                    {message.badge && (
                      <span className="px-1.5 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-caption text-[10px] font-bold">
                        {message.badge}
                      </span>
                    )}
                  </div>
                  <p className="font-body-md text-body-md leading-relaxed">{message.body}</p>
                </div>
                <span className="font-caption text-[11px] text-text-tertiary pl-2">{message.time}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-end space-y-1 pl-space-xl" key={message.id}>
              <div className="bg-primary text-on-primary rounded-2xl rounded-tr-sm p-space-sm shadow-md">
                <p className="font-body-md text-body-md leading-relaxed">{message.body}</p>
              </div>
              <div className="flex items-center space-x-1 pr-1">
                <span className="font-caption text-[11px] text-text-tertiary">{message.time}</span>
                <Icon name={message.delivered ? 'done_all' : 'done'} filled className="text-[14px] text-primary" />
              </div>
            </div>
          ),
        )}

        {thread.deal && (
          <div className="flex justify-center pt-space-xs">
            <div className="w-full max-w-[320px] bg-surface-tint-blue rounded-xl p-space-sm flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0">
                <Icon name="local_activity" filled className="text-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-label-sm text-label-sm font-semibold text-text-primary leading-tight">
                  Pass reminder: show {thread.deal.code} at checkout
                </p>
                <p className="font-caption text-caption text-text-secondary mt-0.5">
                  20% off is applied when your server scans the pass.
                </p>
              </div>
              <button
                type="button"
                onClick={onViewPass}
                className="shrink-0 text-primary font-label-sm text-label-sm font-bold hover:underline"
              >
                View
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="sticky bottom-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md shadow-lg pt-space-xs pb-space-sm px-margin flex flex-col space-y-space-xs">
        <div className="flex items-center space-x-space-xs overflow-x-auto py-1 -mx-margin px-margin no-scrollbar">
          {thread.quickReplies.map((reply) => (
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
              placeholder={`Message ${thread.name}...`}
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
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
