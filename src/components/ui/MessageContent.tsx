import { Icon } from './Icon';
import type { MessageItem } from '../../services/messageService';

/** What a chat bubble holds: an image, a PDF link and/or text. */
export function MessageContent({ message, className }: { message: MessageItem; className: string }) {
  if (message.deleted) {
    return <p className={`${className} italic opacity-70`}>Message deleted</p>;
  }
  const isPdf = message.mediaType === 'application/pdf';
  return (
    <>
      {message.media && isPdf ? (
        <a href={message.media} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline font-label-sm text-label-sm mb-1">
          <Icon name="description" className="text-[18px]" />
          <span>Open document</span>
        </a>
      ) : null}
      {message.media && !isPdf ? (
        <a href={message.media} target="_blank" rel="noreferrer">
          <img src={message.media} alt="Shared in this chat" className="max-w-full rounded-lg mb-1" />
        </a>
      ) : null}
      {message.body ? <p className={className}>{message.body}</p> : null}
    </>
  );
}

/** Edit and delete, shown under your own message once it is tapped. */
export function MessageActions({ canEdit, onEdit, onDelete }: { canEdit: boolean; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-space-sm mt-1 px-1 font-label-sm text-label-sm">
      {canEdit ? (
        <button type="button" onClick={onEdit} className="text-primary font-semibold">
          Edit
        </button>
      ) : null}
      <button type="button" onClick={onDelete} className="text-error font-semibold">
        Delete
      </button>
    </div>
  );
}
