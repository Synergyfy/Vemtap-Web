import { useState } from 'react';
import { type PublicBusiness } from '../hooks/usePublicBusiness';
import { messageService } from '../services/messageService';
import { ApiError, getAccessToken } from '../services/api/client';

/**
 * Starts a real chat with the business's main branch (`POST /customer/messaging/threads/start`).
 * Shared by the business profile and the public product/service catalogue pages.
 */
export function BusinessChatBox({ business, onClose, onStarted }: { business: PublicBusiness; onClose: () => void; onStarted?: (branchId: string) => void }) {
  const [text, setText] = useState('');
  const [state, setState] = useState<{ kind: 'idle' | 'sending' | 'sent' | 'error'; message?: string }>({ kind: 'idle' });
  const send = async () => {
    const branchId = business.branches[0]?.id;
    if (!text.trim() || !branchId) return;
    if (!getAccessToken()) {
      setState({ kind: 'error', message: 'Please sign in to message this business.' });
      return;
    }
    setState({ kind: 'sending' });
    try {
      await messageService.startConversation({ branchId, content: text.trim() });
      setText('');
      setState({ kind: 'sent' });
      onStarted?.(branchId);
    } catch (err) {
      setState({ kind: 'error', message: err instanceof ApiError && err.message && !/^Request failed/.test(err.message) ? err.message : 'Your message couldn’t be sent. Please try again.' });
    }
  };
  return (
    <div className="mt-3 rounded-2xl bg-surface-canvas p-3 shadow-sm space-y-2">
      {state.kind === 'sent' ? (
        <div className="flex items-center justify-between gap-2">
          <p role="status" className="font-body-md text-body-md text-badge-discount-text">Message sent to {business.name}. Replies appear in Messages.</p>
          <button type="button" onClick={onClose} className="font-label-md text-label-md text-primary font-semibold shrink-0">Done</button>
        </div>
      ) : (
        <>
          <textarea
            aria-label={`Message ${business.name}`}
            rows={2}
            maxLength={1000}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={`Ask ${business.name} a question…`}
            className="w-full resize-none rounded-xl bg-surface-subtle px-3 py-2 font-body-md text-body-md text-on-surface placeholder:text-text-tertiary outline-none"
          />
          <div className="flex items-center justify-between gap-2">
            {state.kind === 'error' ? <p role="alert" className="font-caption text-caption text-error">{state.message}</p> : <span />}
            <button
              type="button"
              disabled={!text.trim() || state.kind === 'sending'}
              onClick={() => void send()}
              className="h-9 px-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold disabled:opacity-50 shrink-0"
            >
              {state.kind === 'sending' ? 'Sending…' : 'Send'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
