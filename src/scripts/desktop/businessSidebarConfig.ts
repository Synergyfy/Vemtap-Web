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
    key: 'orders',
    label: 'Orders',
    icon: 'receipt_long',
    defaultKey: 'orders-all',
    badge: '4',
    badgeClass: 'bg-primary-container text-on-primary',
    items: [
      { key: 'orders-all', label: 'All Orders', icon: 'list_alt', badge: '4', badgeClass: 'bg-primary-container text-on-primary' },
      { key: 'orders-bookings', label: 'Bookings', icon: 'calendar_month' },
      { key: 'orders-history', label: 'Order History', icon: 'history' },
    ],
  },
  {
    key: 'messages',
    label: 'Messages',
    icon: 'forum',
    defaultKey: 'messages-all',
    badge: '2',
    badgeClass: 'bg-tertiary-container text-on-tertiary',
    items: [
      { key: 'messages-all', label: 'All Conversations', icon: 'chat', badge: '2', badgeClass: 'bg-tertiary-container text-on-tertiary' },
      { key: 'messages-inquiries', label: 'Customer Inquiries', icon: 'contact_support' },
    ],
  },
  {
    key: 'business',
    label: 'Business',
    icon: 'storefront',
    defaultKey: 'business-profile',
    items: [
      { key: 'business-profile', label: 'Business Profile', icon: 'badge' },
      { key: 'business-locations', label: 'Locations', icon: 'location_on' },
      { key: 'business-catalog', label: 'Products & Services', icon: 'inventory_2' },
      { key: 'business-deals', label: 'Deals', icon: 'local_offer' },
      { key: 'business-customers', label: 'Customers', icon: 'group' },
      { key: 'business-loyalty', label: 'Loyalty & Rewards', icon: 'stars' },
      { key: 'business-staff', label: 'Staff & Permissions', icon: 'shield_person' },
    ],
  },
  {
    key: 'pos',
    label: 'POS',
    icon: 'point_of_sale',
    defaultKey: 'pos-transactions',
    items: [
      { key: 'pos-home', label: 'POS Overview', icon: 'dashboard' },
      { key: 'pos-sale', label: 'New Sale', icon: 'add_shopping_cart' },
      { key: 'pos-transactions', label: 'Transactions', icon: 'receipt' },
      { key: 'pos-sync', label: 'Offline & Sync', icon: 'sync' },
    ],
  },
  {
    key: 'store-ordering',
    label: 'Store Ordering',
    icon: 'qr_code_scanner',
    defaultKey: 'store-ordering-dashboard',
    badge: 'Live',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    items: [
      { key: 'store-ordering-dashboard', label: 'Ordering Dashboard', icon: 'dashboard' },
      { key: 'store-ordering-qr', label: 'QR Codes & Placement', icon: 'qr_code_2' },
      { key: 'store-ordering-settings', label: 'Ordering Settings', icon: 'tune' },
    ],
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
      { key: 'more-qr-nfc', label: 'QR & NFC Assets', icon: 'nfc' },
      { key: 'more-payments', label: 'Payments & Checkout Settings', icon: 'payments' },
      { key: 'more-support', label: 'Help & Support', icon: 'help_outline' },
      { key: 'more-integrations', label: 'Integrations', icon: 'hub' },
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
    if (section.key === activeKey) {
      return { sectionKey: section.key, itemKey: section.defaultKey };
    }
    if (section.items) {
      for (const item of section.items) {
        if (item.key === activeKey) {
          return { sectionKey: section.key, itemKey: item.key };
        }
      }
    }
  }

  // Comprehensive alias mappings from existing portal keys
  const ALIAS_MAP: Record<string, { sectionKey: string; itemKey: string }> = {
    overview: { sectionKey: 'overview', itemKey: 'overview' },
    orders: { sectionKey: 'orders', itemKey: 'orders-all' },
    'orders-all': { sectionKey: 'orders', itemKey: 'orders-all' },
    bookings: { sectionKey: 'orders', itemKey: 'orders-bookings' },
    'orders-bookings': { sectionKey: 'orders', itemKey: 'orders-bookings' },
    'orders-history': { sectionKey: 'orders', itemKey: 'orders-history' },
    messages: { sectionKey: 'messages', itemKey: 'messages-all' },
    'messages-all': { sectionKey: 'messages', itemKey: 'messages-all' },
    'messages-inquiries': { sectionKey: 'messages', itemKey: 'messages-inquiries' },
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
    'store-ordering': { sectionKey: 'store-ordering', itemKey: 'store-ordering-dashboard' },
    'store-ordering-dashboard': { sectionKey: 'store-ordering', itemKey: 'store-ordering-dashboard' },
    'store-ordering-qr': { sectionKey: 'store-ordering', itemKey: 'store-ordering-qr' },
    'store-ordering-settings': { sectionKey: 'store-ordering', itemKey: 'store-ordering-settings' },
    more: { sectionKey: 'more', itemKey: 'more-marketing' },
    'more-marketing': { sectionKey: 'more', itemKey: 'more-marketing' },
    analytics: { sectionKey: 'more', itemKey: 'more-analytics' },
    'more-analytics': { sectionKey: 'more', itemKey: 'more-analytics' },
    'more-subscription': { sectionKey: 'more', itemKey: 'more-subscription' },
    'more-addons': { sectionKey: 'more', itemKey: 'more-addons' },
    'more-notifications': { sectionKey: 'more', itemKey: 'more-notifications' },
    'more-verification': { sectionKey: 'more', itemKey: 'more-verification' },
    'more-qr-nfc': { sectionKey: 'more', itemKey: 'more-qr-nfc' },
    'more-payments': { sectionKey: 'more', itemKey: 'more-payments' },
    'more-support': { sectionKey: 'more', itemKey: 'more-support' },
    'more-integrations': { sectionKey: 'more', itemKey: 'more-integrations' },
    'more-settings': { sectionKey: 'more', itemKey: 'more-settings' },
    settings: { sectionKey: 'more', itemKey: 'more-settings' },
  };

  return ALIAS_MAP[activeKey] ?? { sectionKey: 'overview', itemKey: 'overview' };
}
