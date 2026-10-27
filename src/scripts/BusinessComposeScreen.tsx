import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { contactFirstName, contactInitials } from './messagesContact';
import { hasApiConfig } from '../services/api/client';
import { apiErrorMessage } from '../services/errorMessages';
import { useStartChat } from './messagesLive';
import { useMyBusiness } from '../hooks/business/useMyBusiness';

interface BusinessComposeScreenProps {
  onBack: () => void;
  /** Live: called with the thread the message went to. */
  onSent: (threadId?: string) => void;
  /** Name of the recipient the message is being composed for. */
  recipientName?: string;
  /** Live: the recipient's user id; the message opens (or reuses) their thread. */
  recipientId?: string;
}

const RECIPIENT_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDt1nWu4T1lusduSUguAEHlk4UAqKNwi06qC6rDC4S-aMPDxpbkm6bwwE1-dwADWQ1zpB0GN9IRc-ekTcRVyy_guT4obqRN9vlN6iTWtgKvNdMMdx_n8L4fwUxG70n42bLqpdiCYiTH93CAULEMZlyZzqFg5Oc1RqPogdlhTVNYsBqn3UEkRCpUl4pV5WMqDZujHKR5nvXerNvv8X-ORs-kggzvuHAs3LDsgP1Tqt4D8GsUhlLKoDrpVg';
const RECIPIENT_ALT =
  'Close up portrait photograph of Dr. Chidi Okafor wearing smart attire with friendly approachable smile against clean neutral studio background with soft lighting';
const HOST_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDIbZlRCANW6vUAx3pVYJq2uSdyw5BRFvIYtQWqTRNe79DDq98vEktbSi7ojZJFv4cQM8KnDHG9DzHGvV0lmjoWVcLVWg9vKCHplIFTkJtQQeQ2UxeKasdz-F-9jaumR5hTdjC_kYsxN-xnrO2rxBYoKF1_h4Xhu8djMikKPhlE9SF_QmcE7LpqrXhodGnnXZ4WEDTSn1kaCRKafnZhvSv3h3SWV-T7PaO7qmzfaZ-_CLZuLv4Yk5Bdw';
const HOST_ALT =
  'Modern upscale bistro interior featuring warm ambient Edison bulbs wooden tables neatly set with wine glasses and welcoming hospitality atmosphere';

const DEFAULT_DRAFT =
  'Good morning {name}, regarding your reservation for Saturday evening, we have successfully merged Tables 08 & 09 for your party of 6. Would you also like us to prepare the wine list in advance?';

const QUICK_ATTACHMENTS = [
  { icon: 'local_offer', iconClass: 'text-badge-discount-text', label: '20% Off Prime Lunch', snippet: '[Attached: 20% Off Prime Lunch Deal Voucher]' },
  { icon: 'receipt_long', iconClass: 'text-primary', label: 'Invoice / POS Receipt', snippet: '[Attached: Invoice #INV-2024-884 ($145.00)]' },
  { icon: 'menu_book', iconClass: 'text-tertiary', label: 'Autumn Wine Menu', snippet: '[Attached: Autumn Chef Tasting Menu & Wine Pairings]' },
  { icon: 'photo_camera', iconClass: 'text-secondary', label: 'Table View Photo', snippet: '[Attached: Table 08/09 Private Booth Setup Image]' },
];

const TEMPLATES = [
  {
    icon: 'event_available',
    iconClass: 'text-primary',
    title: 'Booking Reminder',
    body: 'Party of 6 arrival notice & custom place cards note.',
    text: 'Hi {name}, this is a warm confirmation of your reservation for Saturday at 7:30 PM. We are delighted to host your party and have prepared custom celebratory place cards!',
  },
  {
    icon: 'inventory_2',
    iconClass: 'text-badge-discount-text',
    title: 'Order / Items Ready',
    body: 'Wine pairings and curated dessert locked in.',
    text: 'Hello {name}, your requested pre-order wines and artisanal celebratory dessert are officially set aside for your party.',
  },
  {
    icon: 'loyalty',
    iconClass: 'text-tertiary',
    title: 'Deal Assistance',
    body: 'Auto-apply promo discount voucher directly.',
    text: 'We have attached your exclusive 20% loyalty redemption code valid for your table this weekend!',
  },
  {
    icon: 'local_parking',
    iconClass: 'text-secondary',
    title: 'Parking & Entry',
    body: 'Valet directions and dedicated entry gate guide.',
    text: 'Complimentary valet parking is ready at our main entrance on Elm Street. Let the attendant know you are booked for Table 08.',
  },
];

export function BusinessComposeScreen({ onBack, onSent, recipientName = 'Dr. Chidi Okafor', recipientId }: BusinessComposeScreenProps) {
  const live = hasApiConfig();
  const firstName = contactFirstName(recipientName);
  const isDefaultRecipient = !live && recipientName === 'Dr. Chidi Okafor';
  // Live: start with an empty draft and no sample booking attached.
  const [draft, setDraft] = useState(() => (live ? '' : DEFAULT_DRAFT.split('{name}').join(firstName)));
  const [contextVisible, setContextVisible] = useState(!live);
  const { start, pending } = useStartChat();
  const business = useMyBusiness();
  const [recipientVisible, setRecipientVisible] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const sendTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
      if (sendTimer.current !== null) window.clearTimeout(sendTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const handleSend = () => {
    if (!draft.trim()) return;
    if (live) {
      if (pending) return;
      if (!recipientId || !recipientVisible) {
        showToast('Pick a customer to message first');
        return;
      }
      start(recipientId, draft)
        .then((threadId) => {
          setDraft('');
          onSent(threadId);
        })
        .catch((error: unknown) => showToast(apiErrorMessage(error, 'Could not send the message.')));
      return;
    }
    showToast(`Message sent to ${recipientName}!`);
    setDraft('');
    if (sendTimer.current !== null) window.clearTimeout(sendTimer.current);
    sendTimer.current = window.setTimeout(() => onSent(), 1500);
  };

  const insertSnippet = (snippet: string) => {
    setDraft((current) => `${current.trim()}\n\n${snippet}`.trim());
    showToast('Context snippet attached');
  };

  const applyTemplate = (text: string) => {
    setDraft(text.split('{name}').join(firstName));
    showToast('Template applied to draft');
  };

  const hasDraft = draft.trim().length > 0;

  return (
    <AppScreen>
      {/* New Message Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go back"
              className="w-11 h-11 -ml-space-xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container active:scale-95 transition-all"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface">New Message</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Icon name="person" className="text-on-primary text-[18px]" />
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full flex-1 pb-32">
        {/* Interactive Top Action Rail */}
        <div className="px-margin pt-space-xs pb-space-sm flex items-center justify-between">
          <div className="flex items-center gap-space-2xs">
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-badge-discount-text" />
            <span className="font-label-sm text-label-sm text-text-secondary">Direct Client Channel</span>
          </div>
          <button
            className={`inline-flex items-center gap-space-2xs px-space-md py-1.5 rounded-full bg-primary-container text-on-primary font-button-secondary text-button-secondary shadow-sm active:scale-95 transition-all ${
              hasDraft ? '' : 'opacity-50 pointer-events-none'
            }`}
            type="button"
            onClick={handleSend}
          >
            <span>Send</span>
            <Icon name="send" className="text-[16px]" />
          </button>
        </div>

        {/* Recipient Address Line */}
        <div className="px-margin mb-space-sm">
          <div className="bg-surface-canvas rounded-xl p-space-xs shadow-sm flex items-center gap-space-xs flex-wrap">
            <span className="font-label-md text-label-md text-text-tertiary pl-space-2xs select-none">To:</span>
            {recipientVisible ? (
              <div className="inline-flex items-center gap-space-2xs bg-surface-tint-blue py-1 pl-1.5 pr-space-xs rounded-full shadow-sm transition-all">
                <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0">
                  {isDefaultRecipient ? (
                    <img alt={RECIPIENT_ALT} className="w-full h-full object-cover" src={RECIPIENT_IMG} />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">
                      {contactInitials(recipientName)}
                    </span>
                  )}
                </div>
                <span className="font-label-md text-label-md text-primary font-semibold">{recipientName}</span>
                <Icon name="verified" filled className="text-primary text-[14px]" />
                <button
                  aria-label="Remove recipient"
                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-secondary-container/40 active:scale-90 text-primary transition-all ml-0.5"
                  type="button"
                  onClick={() => {
                    setRecipientVisible(false);
                    showToast('Recipient removed. Type new name/phone.');
                  }}
                >
                  <Icon name="close" className="text-[13px]" />
                </button>
              </div>
            ) : null}
            <button
              className="inline-flex items-center gap-1 text-primary hover:text-surface-tint font-label-sm text-label-sm px-space-xs py-1 rounded-full hover:bg-surface-tint-blue transition-colors ml-auto"
              type="button"
              onClick={() => {
                if (live) {
                  showToast('Attaching an order or booking is coming soon');
                  return;
                }
                setContextVisible((current) => !current);
                showToast(contextVisible ? 'Context hidden' : 'Booking #BK-77402 attached');
              }}
            >
              <Icon name="link" className="text-[16px]" />
              <span>{contextVisible ? 'Context Attached' : '+ Add Context'}</span>
            </button>
          </div>
        </div>

        {/* Attached Business Context Card */}
        {contextVisible && (
          <div className="px-margin mb-space-md transition-all duration-300">
            <div className="relative bg-surface-canvas rounded-2xl p-space-md shadow-sm overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-container via-surface-tint to-badge-discount-text" />
              <div className="flex items-start justify-between gap-space-xs mb-space-xs">
                <div className="flex items-center gap-space-xs flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-caption text-caption font-semibold tracking-wide">
                    BOOKING CONTEXT • #BK-77402
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
                    Confirmed
                  </span>
                </div>
                <button
                  aria-label="Remove attached context"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-text-tertiary hover:text-on-surface hover:bg-surface-container active:scale-95 transition-all"
                  type="button"
                  onClick={() => {
                    setContextVisible(false);
                    showToast('Booking context detached');
                  }}
                >
                  <Icon name="close" className="text-[18px]" />
                </button>
              </div>
              <div className="flex items-center gap-space-sm mb-space-xs">
                <div className="w-10 h-10 rounded-xl bg-surface-tint-blue flex items-center justify-center shrink-0 text-primary">
                  <Icon name="restaurant" className="text-[22px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">
                    Table Reservation — Party of 6
                  </h2>
                  <p className="font-caption text-caption text-text-secondary truncate">
                    Occasion: 10th Wedding Anniversary Special
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-space-xs bg-surface-subtle -mx-space-md -mb-space-md px-space-md py-space-xs rounded-b-2xl mt-space-xs">
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <Icon name="calendar_clock" className="text-[16px] text-text-tertiary" />
                  <span className="font-label-sm text-label-sm">Sat, Oct 19 • 7:30 PM • Tables 08 & 09</span>
                </div>
                <button
                  className="inline-flex items-center gap-0.5 text-primary hover:text-surface-tint font-label-sm text-label-sm font-medium py-0.5 px-1.5 rounded hover:bg-surface-container active:scale-95 transition-all"
                  type="button"
                  onClick={() => showToast('Switched to latest inquiry #BK-77490')}
                >
                  <span>Change</span>
                  <Icon name="expand_more" className="text-[16px]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Context Shortcuts & Quick Attachment Carousel (demo only) */}
        {!live && (
        <div className="mb-space-md">
          <div className="px-margin flex items-center justify-between mb-space-2xs">
            <span className="font-caption text-caption font-semibold tracking-wider uppercase text-text-tertiary">
              Quick Attachments
            </span>
            <span className="font-caption text-caption text-primary">View Catalog</span>
          </div>
          <div className="flex gap-space-xs overflow-x-auto px-margin py-1 no-scrollbar scroll-smooth">
            {QUICK_ATTACHMENTS.map((attachment) => (
              <button
                className="inline-flex items-center gap-1.5 px-space-sm py-2 rounded-full bg-surface-canvas shadow-sm hover:bg-surface-container-low active:scale-95 transition-all shrink-0"
                key={attachment.label}
                type="button"
                onClick={() => insertSnippet(attachment.snippet)}
              >
                <Icon name={attachment.icon} className={`${attachment.iconClass} text-[18px]`} />
                <span className="font-label-sm text-label-sm text-text-primary font-medium">{attachment.label}</span>
                {attachment.label === '20% Off Prime Lunch' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                )}
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Message Body Drafting Area */}
        <div className="px-margin mb-space-md flex flex-col">
          <div className="bg-surface-canvas rounded-2xl p-space-md shadow-sm focus-within:shadow-md transition-shadow relative">
            <div className="flex items-center justify-between pb-space-xs mb-space-xs text-text-tertiary">
              <span className="font-caption text-caption flex items-center gap-1">
                <Icon name="history_edu" className="text-[14px]" />
                VEMTAP Smart Draft
              </span>
              <span className="font-caption text-caption">{draft.length} chars</span>
            </div>
            <textarea
              className="w-full bg-transparent font-body-md text-body-md text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none leading-relaxed"
              placeholder="Type your message to Dr. Chidi Okafor..."
              rows={5}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <div className="flex items-center justify-between pt-space-xs mt-space-xs">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-subtle text-text-secondary font-caption text-caption">
                <Icon name="check_circle" className="text-[13px] text-badge-discount-text" />
                Auto-synced with POS #BK-77402
              </div>
              <button
                className="font-caption text-caption text-text-tertiary hover:text-error transition-colors"
                type="button"
                onClick={() => setDraft('')}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Quick Message Templates (demo only — they reference sample bookings) */}
        {!live && (
        <div className="mb-space-lg">
          <div className="px-margin flex items-center justify-between mb-space-2xs">
            <div className="flex items-center gap-1 text-text-primary">
              <Icon name="bolt" className="text-primary text-[18px]" />
              <span className="font-label-md text-label-md font-semibold">Quick Templates</span>
            </div>
            <span className="font-caption text-caption text-text-secondary">Tap to replace draft</span>
          </div>
          <div className="px-margin grid grid-cols-2 gap-space-xs">
            {TEMPLATES.map((template) => (
              <button
                className="p-space-sm rounded-xl bg-surface-canvas shadow-sm hover:bg-surface-tint-blue/40 text-left active:scale-[0.98] transition-all group"
                key={template.title}
                type="button"
                onClick={() => applyTemplate(template.text)}
              >
                <div className={`flex items-center gap-1.5 mb-1 ${template.iconClass}`}>
                  <Icon name={template.icon} className="text-[17px]" />
                  <span className="font-label-sm text-label-sm font-semibold truncate group-hover:text-primary">
                    {template.title}
                  </span>
                </div>
                <p className="font-caption text-caption text-text-secondary line-clamp-2">{template.body}</p>
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Client Preview Card */}
        <div className="px-margin mb-space-lg">
          <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm flex items-center gap-space-sm">
            <div className="w-12 h-12 rounded-xl bg-surface-container overflow-hidden shrink-0">
              {live ? (
                <span className="w-full h-full flex items-center justify-center text-primary">
                  <Icon name="storefront" className="text-[22px]" />
                </span>
              ) : (
                <img alt={HOST_ALT} className="w-full h-full object-cover" src={HOST_IMG} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-label-md text-label-md font-semibold text-text-primary">{live ? (business.data?.name ?? 'Your business') : 'The Oak & Cellar'}</span>
                <span className="inline-flex px-1.5 py-0.5 rounded bg-surface-tint-blue text-primary font-caption text-caption">
                  Verified Host
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary truncate">
                {live ? 'Replying in the in-app chat' : 'Replying as General Manager • Typical response under 2m'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="font-caption text-caption text-badge-discount-text font-semibold flex items-center gap-0.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Message Sticky Dock */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface-canvas/95 backdrop-blur-xl shadow-lg pb-safe">
        <div className="px-margin py-space-sm flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-2xs text-text-secondary">
            <button
              aria-label="Attach file or photo"
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container active:scale-90 transition-all text-text-primary"
              title="Attach file or photo"
              type="button"
              onClick={() => showToast(live ? 'Attachments are coming soon' : 'Media picker opened')}
            >
              <Icon name="add_circle" className="text-[22px]" />
            </button>
            <button
              aria-label="Attach catalog link"
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container active:scale-90 transition-all text-text-secondary"
              title="Attach catalog link or offer"
              type="button"
              onClick={() => showToast(live ? 'Sharing products and deals is coming soon' : 'Product & voucher picker')}
            >
              <Icon name="storefront" className="text-[22px]" />
            </button>
            <button
              aria-label="Record voice note"
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container active:scale-90 transition-all text-text-secondary"
              title="Record voice note"
              type="button"
              onClick={() => showToast(live ? 'Voice notes are coming soon' : 'Voice note recorder ready')}
            >
              <Icon name="mic" className="text-[22px]" />
            </button>
          </div>
          <div className="flex items-center gap-space-xs">
            <div className="flex flex-col text-right">
              <span className="font-caption text-caption text-text-tertiary">Channel</span>
              <span className="font-label-sm text-label-sm font-semibold text-primary">{live ? 'In-App' : 'In-App + SMS'}</span>
            </div>
            <button
              aria-label="Send message"
              className={`w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md shadow-primary-container/30 active:scale-90 hover:brightness-105 transition-all ${
                hasDraft ? '' : 'opacity-50'
              }`}
              type="button"
              onClick={handleSend}
            >
              <Icon name="send" className="text-[24px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Feedback Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-space-md py-space-xs rounded-full shadow-xl font-label-sm text-label-sm flex items-center gap-2 z-50">
          <Icon name="check_circle" className="text-primary-fixed text-[18px]" />
          <span>{toast}</span>
        </div>
      )}
    </AppScreen>
  );
}
