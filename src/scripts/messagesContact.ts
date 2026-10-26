/**
 * The person or business a merchant is chatting with inside /business/messages.
 * `isBusiness` switches the header identity icon from a customer avatar to a storefront mark.
 */
export interface BusinessChatContact {
  name: string;
  avatar?: string;
  isBusiness?: boolean;
  /** Live inbox thread this chat opens; absent for demo contacts. */
  threadId?: string;
}

/** Fallback contacts used when a chat screen is opened without an explicit contact. */
export const DEFAULT_CHAT_CONTACTS: Record<'general' | 'deal' | 'booking' | 'order', BusinessChatContact> = {
  general: { name: 'Tunde Bakare' },
  deal: { name: 'Sarah Adams' },
  booking: { name: 'Dr. Chidi Okafor' },
  order: { name: 'Michael James' },
};

const TITLES = new Set(['dr', 'dr.', 'mr', 'mr.', 'mrs', 'mrs.', 'ms', 'ms.', 'prof', 'prof.', 'sir', 'ma']);

/** Friendly first name for a contact — skips honorifics such as "Dr." or "Mr.". */
export function contactFirstName(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts.find((part) => !TITLES.has(part.toLowerCase()));
  return first || parts[0] || '';
}

/** Up to two initials, skipping honorifics — e.g. "Dr. Chidi Okafor" → "CO". */
export function contactInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter((part) => !TITLES.has(part.toLowerCase()))
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
