import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';

interface MessagesShareAttachmentModalProps {
  onClose: () => void;
}

type AttachmentSource = {
  id: string;
  icon: string;
  title: string;
  meta: string;
  filled?: boolean;
};

const SOURCES: AttachmentSource[] = [
  { id: 'camera', icon: 'photo_camera', title: 'Camera', meta: 'Take a live photo' },
  { id: 'gallery', icon: 'image', title: 'Media Gallery', meta: 'Browse photos & videos' },
  { id: 'document', icon: 'description', title: 'Document & PDF', meta: 'Menu, invoice, flyer' },
  { id: 'deal', icon: 'local_offer', title: 'Live Deal Card', meta: '1-TAP attach deal', filled: true },
  { id: 'catalog', icon: 'inventory_2', title: 'Product from Catalog', meta: 'Pull product card' },
  { id: 'receipt', icon: 'receipt_long', title: 'POS Receipt', meta: 'Share paid receipt' },
];

const QUICK_PICKS = [
  { id: 'q1', icon: 'local_offer', label: 'Lunch Combo Deal' },
  { id: 'q2', icon: 'receipt_long', label: 'Order #VG-94021' },
  { id: 'q3', icon: 'event', label: 'Booking #BK-77402' },
];

export function MessagesShareAttachmentModal({ onClose }: MessagesShareAttachmentModalProps) {
  const [selected, setSelected] = useState<AttachmentSource | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const attach = () => {
    if (!selected) return;
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSent(true);
      window.setTimeout(onClose, 900);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md" role="dialog" aria-modal="true" aria-label="Share Attachment">
      <div className="absolute inset-0 bg-inverse-surface/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[580px] bg-surface rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] border border-border overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary-container to-primary" />
        <div className="p-space-md border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <span className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-surface-tint-blue text-primary">
              <Icon name="attach_file" className="text-[18px]" filled />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-error animate-pulse" />
            </span>
            <div>
              <h2 className="font-heading-sm text-heading-sm text-on-surface">Share Attachment</h2>
              <p className="font-caption text-caption text-on-surface-variant">Attach context to this conversation</p>
            </div>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="p-space-md space-y-space-md">
          <div className="grid grid-cols-2 gap-space-sm">
            {SOURCES.map((s) => {
              const active = selected?.id === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelected(s)}
                  className={`flex items-start gap-space-sm p-space-sm rounded-xl border text-left transition-colors ${
                    active ? 'border-primary bg-surface-tint-blue' : 'border-border bg-surface hover:bg-surface-subtle'
                  }`}
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-primary-container text-on-primary' : 'bg-surface-subtle text-on-surface-variant'}`}>
                    <Icon name={s.icon} className="text-[20px]" filled={s.filled} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-label-md text-label-md text-on-surface">{s.title}</span>
                    <span className="block font-caption text-caption text-on-surface-variant truncate">{s.meta}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div>
            <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs">Quick Picks</div>
            <div className="flex flex-wrap gap-space-xs">
              {QUICK_PICKS.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setSelected({ id: q.id, icon: q.icon, title: q.label, meta: 'Quick pick attachment' })}
                  className={`flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full border font-label-sm text-label-sm transition-colors ${
                    selected?.id === q.id ? 'border-primary bg-surface-tint-blue text-primary font-semibold' : 'border-border text-on-surface-variant hover:bg-surface-subtle'
                  }`}
                >
                  <Icon name={q.icon} className="text-[14px]" />
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`rounded-xl border p-space-sm transition-colors ${selected ? 'border-primary bg-surface-tint-blue/40' : 'border-dashed border-border bg-surface-subtle/40'}`}>
            <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-2xs">Active Selection Summary</div>
            {selected ? (
              <div className="flex items-center gap-space-sm">
                <span className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
                  <Icon name={selected.icon} className="text-[18px]" filled={selected.filled} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-label-md text-label-md text-on-surface truncate">{selected.title}</div>
                  <div className="font-caption text-caption text-on-surface-variant">{selected.meta}</div>
                </div>
                <button type="button" aria-label="Remove attachment" onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error/10">
                  <Icon name="delete" className="text-[16px]" />
                </button>
              </div>
            ) : (
              <p className="font-body-sm text-body-sm text-text-tertiary">No attachment selected — choose a source or quick pick above.</p>
            )}
          </div>
        </div>

        <div className="p-space-md border-t border-border flex items-center justify-between gap-space-sm bg-surface-subtle/40">
          <div className="flex items-center gap-space-xs min-w-0">
            <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption shrink-0">
              {selected ? selected.title : 'No attachment'}
            </span>
            <input
              type="text"
              placeholder="Add a note…"
              className="flex-1 min-w-0 h-11 px-space-sm rounded-xl border border-border bg-surface font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button type="button" onClick={onClose} className="h-11 px-space-md rounded-xl border border-border font-label-md text-label-md text-on-surface-variant hover:bg-surface-subtle">
              Cancel
            </button>
            <button
              type="button"
              onClick={attach}
              disabled={!selected || sending || sent}
              className={`h-11 px-space-md rounded-xl font-label-md text-label-md shadow-sm flex items-center gap-space-2xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                sent ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-primary text-on-primary hover:opacity-90'
              }`}
            >
              {sent ? (
                <>
                  <Icon name="check_circle" className="text-[18px]" filled />
                  Sent
                </>
              ) : sending ? (
                <>
                  <Icon name="progress_activity" className="text-[18px] animate-spin" />
                  Attaching…
                </>
              ) : (
                <>
                  <Icon name="send" className="text-[18px]" />
                  Attach &amp; Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
