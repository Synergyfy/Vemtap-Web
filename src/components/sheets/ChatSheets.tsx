import { Icon } from '../ui/Icon';

export function CustomerProfileDrawer({
  open,
  onClose,
  name,
  phone,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  phone: string;
}) {
  if (!open) return null;
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <>
      <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pointer-events-none">
        <aside
          className="absolute inset-y-0 right-0 w-[86%] max-w-[340px] bg-surface-canvas shadow-xl flex flex-col justify-between overflow-y-auto pointer-events-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="sticky top-0 bg-surface-canvas/95 backdrop-blur z-10 px-space-md pt-12 pb-space-xs flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider font-semibold">
              Customer 360
            </span>
            <button
              aria-label="Close profile drawer"
              className="w-8 h-8 rounded-full bg-surface-subtle text-text-secondary flex items-center justify-center active:scale-95 transition-transform"
              type="button"
              onClick={onClose}
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          </div>
          <div className="flex-1 px-space-md py-space-xs flex flex-col gap-space-md">
            <div className="flex flex-col items-center text-center bg-surface-subtle rounded-2xl p-space-md shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary-fixed text-on-primary-fixed font-heading-md text-heading-md font-bold flex items-center justify-center mb-2">
                {initials}
              </div>
              <h3 className="font-heading-sm text-heading-sm text-text-primary">{name}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Icon name="phone_iphone" className="text-[15px] text-text-tertiary" />
                <span className="font-label-sm text-label-sm font-medium text-text-primary">{phone}</span>
              </div>
              <span className="mt-2 px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold">
                Loyal Tier VIP
              </span>
            </div>
            <div className="grid grid-cols-2 gap-space-xs text-center">
              <div className="p-space-sm rounded-xl bg-surface-container-low">
                <p className="font-caption text-caption text-text-secondary">Total Spend</p>
                <p className="font-heading-sm text-heading-sm text-text-primary mt-1">₦118,500</p>
              </div>
              <div className="p-space-sm rounded-xl bg-surface-container-low">
                <p className="font-caption text-caption text-text-secondary">Visit Frequency</p>
                <p className="font-heading-sm text-heading-sm text-text-primary mt-1">Every 8 Days</p>
              </div>
            </div>
            <div className="flex flex-col gap-space-2xs">
              <h4 className="font-label-md text-label-md text-text-primary font-semibold">Favorite Items</h4>
              <div className="flex flex-wrap gap-1.5">
                {['Chargrilled Ribeye', 'Hibiscus Cooler', 'Truffle Fries'].map((favorite) => (
                  <span
                    className="px-2.5 py-1 rounded-lg bg-surface-container text-text-secondary font-caption text-caption"
                    key={favorite}
                  >
                    {favorite}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 bg-surface-canvas/95 backdrop-blur p-space-md shadow-md">
            <button
              className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 shadow-sm"
              type="button"
              onClick={onClose}
            >
              <Icon name="card_giftcard" className="text-[20px]" />
              <span>Send Exclusive VIP Offer</span>
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}

export function AttachmentSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const options = [
    { icon: 'photo_camera', iconBox: 'bg-surface-tint-blue text-primary', title: 'Camera', sub: 'Take live photo' },
    {
      icon: 'image',
      iconBox: 'bg-secondary-container text-on-secondary-container',
      title: 'Gallery',
      sub: 'Photos & videos',
    },
    { icon: 'description', iconBox: 'bg-tertiary-fixed text-tertiary', title: 'Document', sub: 'Catalogue & Menu' },
    {
      icon: 'local_offer',
      iconBox: 'bg-badge-discount-bg text-badge-discount-text',
      title: 'Deal Card',
      sub: 'Attach live offer',
    },
  ];
  return (
    <>
      <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-[2px] z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
        <div className="bg-surface-canvas rounded-t-3xl shadow-xl px-space-md pt-3 pb-space-md">
          <div className="w-10 h-1.5 bg-outline-variant/60 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading-sm text-heading-sm text-text-primary font-semibold">Share Attachment</h3>
            <button
              aria-label="Dismiss attachment options"
              className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center text-text-secondary"
              type="button"
              onClick={onClose}
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-space-sm">
            {options.map((option) => (
              <button
                className="flex items-center gap-3 p-3 bg-surface-subtle hover:bg-surface-container rounded-2xl text-left group"
                key={option.title}
                type="button"
                onClick={onClose}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${option.iconBox}`}>
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
      </div>
    </>
  );
}

export function ChatOptionsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const options = [
    { icon: 'mark_email_read', label: 'Mark as read' },
    { icon: 'notifications_off', label: 'Mute notifications' },
    { icon: 'search', label: 'Search in conversation' },
    { icon: 'report', label: 'Report conversation', danger: true },
  ];
  return (
    <>
      <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-[2px] z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
        <div className="bg-surface-canvas rounded-t-3xl shadow-xl p-space-lg">
          <div className="w-12 h-1 bg-border-subtle rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between pb-2">
            <span className="font-heading-sm text-heading-sm font-semibold text-on-surface">Conversation</span>
            <button
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary"
              type="button"
              onClick={onClose}
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          </div>
          <div className="flex flex-col">
            {options.map((option) => (
              <button
                className={`flex items-center gap-3 p-space-xs rounded-xl text-left hover:bg-surface-container-low ${
                  option.danger ? 'text-error' : 'text-on-surface'
                }`}
                key={option.label}
                type="button"
                onClick={onClose}
              >
                <Icon name={option.icon} className="text-[20px]" />
                <span className="font-body-md text-body-md">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
