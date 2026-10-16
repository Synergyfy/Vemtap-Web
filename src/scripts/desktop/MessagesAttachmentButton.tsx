import { useState, type ReactNode } from 'react';

/**
 * A single "Share attachment" icon-button for the in-app chat.
 *
 * Replaces the previous pattern of rendering several identical `add_photo_alternate`
 * icons (one per mock attachment in the order/deal payload), which looked like a bug.
 * The existing MessagesShareAttachmentModal is rendered through `renderModal`.
 */
export function MessagesAttachmentButton({
  onClick,
  renderModal,
  label = 'Share attachment',
}: {
  onClick?: () => void;
  /** Renders the attachment picker modal (a fixed overlay). Receives the close handler. */
  renderModal?: (onClose: () => void) => ReactNode;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          onClick?.();
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        title={label}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E7DFD2] bg-white text-[#1C0C0C] transition hover:bg-[#F7F2EA]"
      >
        <span className="material-symbols-outlined text-[18px]">attach_file</span>
      </button>
      {open && renderModal?.(close)}
    </>
  );
}
