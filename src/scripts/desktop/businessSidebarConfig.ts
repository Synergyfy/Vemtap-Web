export interface BusinessSidebarSubItem {
  key: string;
  label: string;
  icon?: string;
  badge?: string;
  badgeClass?: string;
}

export interface BusinessSidebarSection {
  key: string;
  label: string;
  icon: string;
  defaultKey: string;
  badge?: string;
  badgeClass?: string;
  /**
   * Hidden from the main business rail. The section still exists in this config
   * because the POS rail reuses its items — Store Front moved inside POS.
   */
  hidden?: boolean;
  /**
   * Direct link: rendered without a dropdown chevron even when `items` exist.
   * Used by POS, which is now a page with its own side menu (the POS rail).
   */
  link?: boolean;
  items?: BusinessSidebarSubItem[];
}

export const BUSINESS_SIDEBAR_SECTIONS: BusinessSidebarSection[] = [
  {
    key: 'overview',
    label: 'Overview',
    icon: 'space_dashboard',
    defaultKey: 'overview',
  },
  {
    key: 'messages',
    label: 'Messages',
    icon: 'forum',
    defaultKey: 'messages-inapp',
    badge: '2',
    badgeClass: 'bg-tertiary-container text-on-tertiary',
    // Messages is a page with its own side menu (the messages rail) — navigate
    // directly, no dropdown chevron on the main rail. The rail lists the
    // channels: In-App Chat, SMS and Email.
    link: true,
    items: [
      { key: 'messages-inapp', label: 'In-App Chat', icon: 'chat', badge: '2', badgeClass: 'bg-tertiary-container text-on-tertiary' },
      { key: 'messages-sms', label: 'SMS', icon: 'sms' },
      { key: 'messages-email', label: 'Email', icon: 'mail' },
    ],
  },
  {
    key: 'business',
    label: 'Business',
    icon: 'storefront',
    defaultKey: 'business-profile',
    // Order mirrors the mobile Business menu — keep both lists in sync.
    items: [
      { key: 'business-catalog', label: 'Products & Services', icon: 'inventory_2' },
      { key: 'business-deals', label: 'Deals', icon: 'local_offer' },
      { key: 'business-customers', label: 'Customers', icon: 'group' },
      { key: 'business-loyalty', label: 'Loyalty & Rewards', icon: 'stars' },
      { key: 'business-staff', label: 'Staff & Permissions', icon: 'shield_person' },
      { key: 'business-locations', label: 'Locations', icon: 'location_on' },
      { key: 'business-profile', label: 'Business Profile', icon: 'badge' },
    ],
  },
  {
    key: 'pos',
    label: 'POS',
    icon: 'point_of_sale',
    defaultKey: 'pos-home',
    badge: '4',
    badgeClass: 'bg-primary-container text-on-primary',
    // POS is a page with its own side menu (the POS rail) — navigate directly,
    // no dropdown chevron on the main rail.
    link: true,
    items: [
      { key: 'pos-home', label: 'POS Overview', icon: 'dashboard' },
      { key: 'pos-sale', label: 'New Sale', icon: 'add_shopping_cart' },
      { key: 'orders-all', label: 'Orders', icon: 'receipt_long', badge: '4', badgeClass: 'bg-primary-container text-on-primary' },
      { key: 'orders-bookings', label: 'Bookings', icon: 'calendar_month' },
      { key: 'pos-transactions', label: 'Transactions', icon: 'receipt' },
      { key: 'pos-sync', label: 'Offline & Sync', icon: 'sync' },
      { key: 'pos-settings', label: 'POS Settings', icon: 'settings' },
    ],
  },
  {
    key: 'store-ordering',
    label: 'Store Front',
    icon: 'qr_code_scanner',
    defaultKey: 'store-ordering-dashboard',
    badge: 'Live',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    // Store Front lives inside POS now — hidden from the main rail, rendered as
    // its own group in the POS side menu.
    hidden: true,
    items: [
      { key: 'store-ordering-dashboard', label: 'Store Front Dashboard', icon: 'dashboard' },
      { key: 'store-ordering-qr', label: 'QR Codes & Placement', icon: 'qr_code_2' },
      { key: 'store-ordering-settings', label: 'Store Front Settings', icon: 'tune' },
    ],
  },
  {
    key: 'cluster-system',
    label: 'Cluster System',
    icon: 'hub',
    defaultKey: 'cluster-system',
    link: true,
  },
  {
    key: 'more',
    label: 'More',
    icon: 'more_horiz',
    defaultKey: 'more-marketing',
    items: [
      { key: 'more-marketing', label: 'Marketing & Growth', icon: 'campaign' },
      { key: 'more-analytics', label: 'Analytics', icon: 'query_stats' },
      { key: 'more-subscription', label: 'Subscription & Billing', icon: 'credit_card' },
      { key: 'more-addons', label: 'Add-ons & Credits', icon: 'extension' },
      { key: 'more-notifications', label: 'Notifications', icon: 'notifications' },
      { key: 'more-verification', label: 'Verification', icon: 'verified' },
      { key: 'more-support', label: 'Help & Support', icon: 'help_outline' },
      { key: 'more-settings', label: 'Business Settings', icon: 'settings' },
    ],
  },
];

/**
 * Normalizes any legacy or sub-route key to its canonical section and item keys.
 */
export function resolveSidebarActive(activeKey?: string): { sectionKey: string; itemKey: string } {
  if (!activeKey) return { sectionKey: 'overview', itemKey: 'overview' };

  // Direct matches in sub items
  for (const section of BUSINESS_SIDEBAR_SECTIONS) {
    // Hidden sections (Store Front) only render inside the POS side menu, so they
    // resolve into the POS section for chrome / layout purposes.
    if (section.key === activeKey) {
      return { sectionKey: section.hidden ? 'pos' : section.key, itemKey: section.defaultKey };
    }
    if (section.items) {
      for (const item of section.items) {
        if (item.key === activeKey) {
          return { sectionKey: section.hidden ? 'pos' : section.key, itemKey: item.key };
        }
      }
    }
  }

  // Comprehensive alias mappings from existing portal keys
  const ALIAS_MAP: Record<string, { sectionKey: string; itemKey: string }> = {
    overview: { sectionKey: 'overview', itemKey: 'overview' },
    orders: { sectionKey: 'pos', itemKey: 'orders-all' },
    'orders-all': { sectionKey: 'pos', itemKey: 'orders-all' },
    bookings: { sectionKey: 'pos', itemKey: 'orders-bookings' },
    'orders-bookings': { sectionKey: 'pos', itemKey: 'orders-bookings' },
    messages: { sectionKey: 'messages', itemKey: 'messages-inapp' },
    'messages-all': { sectionKey: 'messages', itemKey: 'messages-inapp' },
    'messages-inquiries': { sectionKey: 'messages', itemKey: 'messages-inapp' },
    'messages-inapp': { sectionKey: 'messages', itemKey: 'messages-inapp' },
    'messages-sms': { sectionKey: 'messages', itemKey: 'messages-sms' },
    'messages-email': { sectionKey: 'messages', itemKey: 'messages-email' },
    business: { sectionKey: 'business', itemKey: 'business-profile' },
    profile: { sectionKey: 'business', itemKey: 'business-profile' },
    'business-profile': { sectionKey: 'business', itemKey: 'business-profile' },
    locations: { sectionKey: 'business', itemKey: 'business-locations' },
    'business-locations': { sectionKey: 'business', itemKey: 'business-locations' },
    catalog: { sectionKey: 'business', itemKey: 'business-catalog' },
    'business-catalog': { sectionKey: 'business', itemKey: 'business-catalog' },
    deals: { sectionKey: 'business', itemKey: 'business-deals' },
    'business-deals': { sectionKey: 'business', itemKey: 'business-deals' },
    customers: { sectionKey: 'business', itemKey: 'business-customers' },
    'business-customers': { sectionKey: 'business', itemKey: 'business-customers' },
    loyalty: { sectionKey: 'business', itemKey: 'business-loyalty' },
    'business-loyalty': { sectionKey: 'business', itemKey: 'business-loyalty' },
    staff: { sectionKey: 'business', itemKey: 'business-staff' },
    'business-staff': { sectionKey: 'business', itemKey: 'business-staff' },
    pos: { sectionKey: 'pos', itemKey: 'pos-home' },
    'pos-home': { sectionKey: 'pos', itemKey: 'pos-home' },
    'pos-sale': { sectionKey: 'pos', itemKey: 'pos-sale' },
    register: { sectionKey: 'pos', itemKey: 'pos-sale' },
    'pos-transactions': { sectionKey: 'pos', itemKey: 'pos-transactions' },
    'pos-sync': { sectionKey: 'pos', itemKey: 'pos-sync' },
    'pos-stock': { sectionKey: 'pos', itemKey: 'pos-stock' },
    'pos-ledger': { sectionKey: 'pos', itemKey: 'pos-ledger' },
    'pos-settings': { sectionKey: 'pos', itemKey: 'pos-settings' },
    // Store Front pages run inside POS mode: the main rail collapses and the POS
    // menu (with the Store Front group) opens beside it.
    'store-ordering': { sectionKey: 'pos', itemKey: 'store-ordering-dashboard' },
    'store-ordering-dashboard': { sectionKey: 'pos', itemKey: 'store-ordering-dashboard' },
    'store-ordering-qr': { sectionKey: 'pos', itemKey: 'store-ordering-qr' },
    'store-ordering-settings': { sectionKey: 'pos', itemKey: 'store-ordering-settings' },
    'cluster-system': { sectionKey: 'cluster-system', itemKey: 'cluster-system' },
    cluster: { sectionKey: 'cluster-system', itemKey: 'cluster-system' },
    'cluster-onboarding': { sectionKey: 'cluster-system', itemKey: 'cluster-system' },
    more: { sectionKey: 'more', itemKey: 'more-marketing' },
    'more-marketing': { sectionKey: 'more', itemKey: 'more-marketing' },
    analytics: { sectionKey: 'more', itemKey: 'more-analytics' },
    'more-analytics': { sectionKey: 'more', itemKey: 'more-analytics' },
    'more-subscription': { sectionKey: 'more', itemKey: 'more-subscription' },
    'more-addons': { sectionKey: 'more', itemKey: 'more-addons' },
    'more-notifications': { sectionKey: 'more', itemKey: 'more-notifications' },
    'more-verification': { sectionKey: 'more', itemKey: 'more-verification' },
    'more-support': { sectionKey: 'more', itemKey: 'more-support' },
    'more-settings': { sectionKey: 'more', itemKey: 'more-settings' },
    settings: { sectionKey: 'more', itemKey: 'more-settings' },
  };

  // Any sub-page key that belongs to a nested-menu section (POS / Store Front,
  // Messages) resolves back into that section so the inner side menu never
  // disappears while the user drills into detail pages (e.g. pos-txn-detail,
  // messages-search, store-ordering sub-flows).
  if (activeKey.startsWith('pos-') || activeKey.startsWith('store-ordering-')) {
    return { sectionKey: 'pos', itemKey: activeKey };
  }
  if (activeKey.startsWith('messages-')) {
    return { sectionKey: 'messages', itemKey: activeKey };
  }

  return ALIAS_MAP[activeKey] ?? { sectionKey: 'overview', itemKey: 'overview' };
}
