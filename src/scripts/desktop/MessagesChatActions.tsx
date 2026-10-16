import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';

/**
 * Demo directory: the workspace threads carry a name only, so the dialable
 * number for each customer is resolved here (falling back to the front-desk
 * line when a thread has no number on file).
 */
const CUSTOMER_PHONES: Record<string, string> = {
  'Michael James': '+234 803 221 7788',
  'Sarah Adams': '+234 803 112 4455',
  'Amina Bello': '+234 803 445 1122',
  'Dr. Chidi Okafor': '+234 809 331 7788',
  'Dr. Chidi Eze': '+234 809 331 7788',
  'Tunde Balogun': '+234 812 909 3311',
  'Zainab Musa': '+234 806 112 3344',
};

const FRONT_DESK_LINE = '+234 803 221 7788';

export function customerPhone(name: string): string {
  return CUSTOMER_PHONES[name] ?? FRONT_DESK_LINE;
}

interface MessagesChatActionsProps {
  /** Name of the customer in the open thread — used for the call label/tooltips. */
  customerName: string;
  /** Opens the customer's full CRM profile in the Customers page. */
  onViewProfile: () => void;
  /** Jumps to the workspace conversation search view. */
  onSearch: () => void;
}

/**
 * Chat header controls shared by every In-App Chat view (order / booking / deal):
 * a Call action that actually dials the customer's number and a "More" menu with
 * the customer-level shortcuts (CRM profile, search, mute).
 */
export function MessagesChatActions({
  customerName,
  onViewProfile,
  onSearch,
}: MessagesChatActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointer = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

  const phone = customerPhone(customerName);
  const telHref = `tel:${phone.replace(/[^+\d]/g, '')}`;

  const menuItems = [
    {
      key: 'profile',
      icon: 'person',
      label: 'View Full Customer CRM Profile',
      onClick: () => {
        setMenuOpen(false);
        onViewProfile();
      },
    },
    {
      key: 'search',
      icon: 'search',
      label: 'Search in Conversation',
      onClick: () => {
        setMenuOpen(false);
        onSearch();
      },
    },
    {
      key: 'mute',
      icon: muted ? 'notifications_off' : 'notifications',
      label: muted ? 'Unmute Chat Notifications' : 'Mute Chat Notifications',
      onClick: () => setMuted((current) => !current),
    },
  ];

  return (
    <div ref={wrapRef} className="relative flex items-center gap-space-xs">
      <a
        href={telHref}
        aria-label={`Call ${customerName}`}
        title={`Call ${customerName} · ${phone}`}
        className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle hover:text-on-surface transition-colors"
      >
        <Icon name="call" className="text-[18px]" />
      </a>

      <button
        type="button"
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
        className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-on-surface-variant hover:bg-surface-subtle hover:text-on-surface transition-colors"
      >
        <Icon name="more_vert" className="text-[18px]" />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-[264px] rounded-xl bg-surface-canvas border border-border-subtle shadow-xl z-30 overflow-hidden"
        >
          <div className="px-space-sm py-space-2xs border-b border-border-subtle bg-surface-subtle/60">
            <span className="font-label-sm text-label-sm text-text-secondary truncate block">
              {customerName} · {phone}
            </span>
          </div>
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              onClick={item.onClick}
              className="w-full flex items-center gap-space-sm px-space-sm py-space-xs text-left font-label-sm text-label-sm text-on-surface hover:bg-surface-subtle transition-colors"
            >
              <Icon name={item.icon} className="text-[18px] text-text-tertiary shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
