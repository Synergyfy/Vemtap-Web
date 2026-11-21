import type { SessionUser } from '../services/sessionService';
import {
  BUSINESS_SIDEBAR_SECTIONS,
  filterSidebarSections,
  type BusinessSidebarSection,
  type BusinessSidebarSubItem,
} from './desktop/businessSidebarConfig';
import type { FeatureId } from './businessFeatures';

/**
 * Single source of truth for staff page access.
 *
 * The tree is derived from the canonical business side menu so the invite,
 * permission editor, navigation and route guard can never drift apart. Leaf
 * pages map to backend `StaffPermission` values; the legacy values are kept so
 * members invited before this change keep their access.
 */

export interface StaffPageNode {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  children: StaffPageNode[];
}

const PAGE_DESCRIPTIONS: Record<string, string> = {
  overview: 'Daily KPIs, alerts and business activity',
  messages: 'Every customer messaging channel',
  'messages-inapp': 'In-app customer conversations',
  'messages-sms': 'SMS conversations and broadcasts',
  'messages-email': 'Email conversations and broadcasts',
  business: 'Products, customers, team and business settings',
  'business-catalog': 'Products, stock, menu and pricing',
  // Product-only rollout: service page permission is hidden.
  // 'business-services': 'Service menu, durations and pricing',
  'business-deals': 'Create, publish and track deals',
  'business-customers': 'Customer profiles, segments and notes',
  'business-loyalty': 'Points, tiers and reward rules',
  'business-staff': 'Invites, roles and page permissions',
  'business-locations': 'Branches, hours and location details',
  'business-profile': 'Public profile, storefront and links',
  'business-referrals': 'Invite other businesses and track rewards',
  pos: 'Till, orders, bookings and registers',
  'pos-home': 'POS overview and shift status',
  'pos-sale': 'New sale and the till register',
  'orders-all': 'Order list, details and fulfilment',
  // Product-only rollout: booking permission is hidden.
  // 'orders-bookings': 'Appointments and service bookings',
  'pos-transactions': 'Transactions, refunds and daily totals',
  'pos-settings': 'Tills, payment methods and POS preferences',
  'store-ordering': 'Customer-facing storefront and QR codes',
  'store-ordering-dashboard': 'Store front performance and live orders',
  'store-ordering-qr': 'QR codes, stickers and placements',
  'store-ordering-settings': 'Store front appearance and ordering rules',
  'cluster-system': 'Cluster performance and partner network',
  more: 'Growth, insights and account management',
  'more-marketing': 'Campaigns, boosts and growth tools',
  'more-analytics': 'Traffic, audience and branch reports',
  'more-subscription': 'Plan, invoices and billing details',
  'more-addons': 'Add-ons, credits and top-ups',
  'more-notifications': 'Account alerts and notification feed',
  'more-verification': 'KYC status and compliance documents',
  'more-support': 'Help centre and support tickets',
  'more-settings': 'Business settings and account controls',
};

const toNode = (
  item: BusinessSidebarSubItem | BusinessSidebarSection,
  children: StaffPageNode[] = [],
): StaffPageNode => ({
  id: item.key,
  label: item.label,
  icon: item.icon,
  description: PAGE_DESCRIPTIONS[item.key],
  children,
});

/** Side-menu ordered tree: sections first, their pages nested underneath. */
export const STAFF_PAGE_TREE: StaffPageNode[] = BUSINESS_SIDEBAR_SECTIONS.map((section) =>
  toNode(
    section,
    (section.items ?? []).map((item) => toNode(item)),
  ),
);

export const STAFF_PAGE_NODE_BY_ID: Record<string, StaffPageNode> = Object.fromEntries(
  (() => {
    const entries: Array<[string, StaffPageNode]> = [];
    const walk = (nodes: StaffPageNode[]) => {
      nodes.forEach((node) => {
        entries.push([node.id, node]);
        walk(node.children);
      });
    };
    walk(STAFF_PAGE_TREE);
    return entries;
  })(),
);

/** Pages an owner can grant — section headers are not independently granted. */
export const ALL_STAFF_PAGE_IDS: string[] = STAFF_PAGE_TREE.flatMap((section) =>
  section.children.length ? section.children.map((page) => page.id) : [section.id],
);

interface PagePermissionConfig {
  /** Permission string written by the invite/editor screens. */
  permission: string;
  /** Older permission strings that still grant this page. */
  legacy: string[];
}

const page = (permission: string, legacy: string[] = []): PagePermissionConfig => ({ permission, legacy });

/**
 * Backend `StaffPermission` values are extended with one `page:*` value per
 * side-menu page. Legacy values are accepted on read so existing staff keep
 * exactly the access they were invited with.
 */
export const PAGE_PERMISSION_CONFIG: Record<string, PagePermissionConfig> = {
  overview: page('page:overview', ['dashboard']),
  'messages-inapp': page('page:messages-inapp', ['messages']),
  'messages-sms': page('page:messages-sms', ['messages']),
  'messages-email': page('page:messages-email', ['messages']),
  'business-catalog': page('page:business-catalog', ['inventory', 'inventory:catalogue']),
  'business-services': page('page:business-services', ['inventory']),
  'business-deals': page('page:business-deals', ['marketing', 'discovery']),
  'business-customers': page('page:business-customers', ['visitors', 'visitors:customer-list']),
  'business-loyalty': page('page:business-loyalty', ['visitors:loyalty']),
  'business-staff': page('page:business-staff', ['staff']),
  'business-locations': page('page:business-locations', ['settings']),
  'business-profile': page('page:business-profile', ['settings:profile']),
  'business-referrals': page('page:business-referrals', ['discovery']),
  'pos-home': page('page:pos-home', ['pos', 'pos:pos-home', 'pos:sales-dashboard']),
  'pos-sale': page('page:pos-sale', ['pos', 'pos:pos-home']),
  'orders-all': page('page:orders-all', ['pos:orders']),
  'orders-bookings': page('page:orders-bookings', ['engagement']),
  'pos-transactions': page('page:pos-transactions', ['pos']),
  'pos-settings': page('page:pos-settings', ['pos:settings']),
  'store-ordering-dashboard': page('page:store-ordering-dashboard', ['qrthrive']),
  'store-ordering-qr': page('page:store-ordering-qr', ['qrthrive']),
  'store-ordering-settings': page('page:store-ordering-settings', ['qrthrive']),
  'cluster-system': page('page:cluster-system', ['discovery', 'qrthrive']),
  'more-marketing': page('page:more-marketing', ['marketing', 'discovery']),
  'more-analytics': page('page:more-analytics', ['analytics']),
  'more-subscription': page('page:more-subscription', ['settings:subscription']),
  'more-addons': page('page:more-addons', ['settings:subscription']),
  'more-notifications': page('page:more-notifications', ['messages']),
  'more-verification': page('page:more-verification', ['settings:compliance']),
  'more-support': page('page:more-support', ['settings:support']),
  'more-settings': page('page:more-settings', ['settings']),
};

/** Kept for any caller that still expects page id → accepted permission strings. */
export const PAGE_PERMISSIONS: Record<string, string[]> = Object.fromEntries(
  Object.entries(PAGE_PERMISSION_CONFIG).map(([id, config]) => [id, [config.permission, ...config.legacy]]),
);

/** Permission strings sent to the API for a set of selected page ids. */
export const toApiPermissions = (pageIds: string[]) => [
  ...new Set(
    pageIds
      .filter((id) => ALL_STAFF_PAGE_IDS.includes(id))
      .map((id) => PAGE_PERMISSION_CONFIG[id]?.permission)
      .filter((value): value is string => Boolean(value)),
  ),
];

/** Page toggles switched on by a member's stored permissions. */
export const toPageIds = (permissions: string[] | null | undefined) => {
  const granted = new Set(permissions ?? []);
  return ALL_STAFF_PAGE_IDS.filter((id) => {
    const config = PAGE_PERMISSION_CONFIG[id];
    return Boolean(config && (granted.has(config.permission) || config.legacy.some((value) => granted.has(value))));
  });
};

export const toPermissionMap = (pageIds: string[]) => {
  const granted = new Set(pageIds);
  const map: Record<string, boolean> = {};
  STAFF_PAGE_TREE.forEach((section) => {
    if (section.children.length) {
      map[section.id] = section.children.every((child) => granted.has(child.id));
      section.children.forEach((child) => {
        map[child.id] = granted.has(child.id);
      });
    } else {
      map[section.id] = granted.has(section.id);
    }
  });
  return map;
};

/** Default pages for each owner-facing role preset. */
export const STAFF_PAGE_DEFAULTS: Record<string, string[]> = {
  owner: ALL_STAFF_PAGE_IDS,
  manager: [
    'overview',
    ...['messages-inapp', 'messages-sms', 'messages-email'],
    ...['business-catalog', 'business-deals', 'business-customers', 'business-loyalty', 'business-staff', 'business-locations', 'business-profile', 'business-referrals'],
    ...['pos-home', 'pos-sale', 'orders-all', 'pos-transactions', 'pos-settings'],
    ...['store-ordering-dashboard', 'store-ordering-qr', 'store-ordering-settings'],
    'cluster-system',
    ...['more-marketing', 'more-analytics', 'more-subscription', 'more-addons', 'more-notifications', 'more-verification', 'more-support', 'more-settings'],
  ],
  cashier: [
    'overview',
    'messages-inapp',
    'pos-home',
    'pos-sale',
    'orders-all',
    'pos-transactions',
    'store-ordering-dashboard',
    'store-ordering-qr',
    'more-notifications',
  ],
  staff: ['overview', 'messages-inapp', 'business-customers', 'orders-all', 'store-ordering-dashboard'],
  custom: ['overview'],
};

const PRIVILEGED_ROLES = new Set(['Owner', 'Admin', 'SUPER_ADMIN']);

/**
 * Owners/admins are unrestricted. A staff account with a recorded permission
 * list is limited to that list — including an empty list, which grants no
 * pages. A profile that has not loaded yet (no list at all) stays unrestricted
 * so the first render never hides the whole dashboard.
 */
const isRestricted = (user: SessionUser | undefined) =>
  Boolean(
    user &&
      !PRIVILEGED_ROLES.has(user.role) &&
      !PRIVILEGED_ROLES.has(user.businessRole ?? '') &&
      Array.isArray(user.permissions),
  );

/** Can this account open a side-menu page (or any page inside a section)? */
export const canAccessPage = (user: SessionUser | undefined, pageId: string): boolean => {
  if (!isRestricted(user)) return true;
  const node = STAFF_PAGE_NODE_BY_ID[pageId];
  if (!node) return true;
  if (node.children.length) return node.children.some((child) => canAccessPage(user, child.id));
  const config = PAGE_PERMISSION_CONFIG[node.id];
  if (!config) return true;
  const granted = new Set(user?.permissions ?? []);
  return granted.has(config.permission) || config.legacy.some((value) => granted.has(value));
};

/** Human-readable page labels for a member's stored permissions. */
export const grantedPageLabels = (permissions: string[] | null | undefined): string[] =>
  toPageIds(permissions).map((id) => STAFF_PAGE_NODE_BY_ID[id]?.label ?? id);

/** Feature filter + staff page filter, in the same order as the side menu. */
export const filterSidebarSectionsForUser = (
  sections: BusinessSidebarSection[],
  isEnabled: (id: FeatureId) => boolean,
  user: SessionUser | undefined,
): BusinessSidebarSection[] =>
  filterSidebarSections(sections, isEnabled)
    .map((section) => ({
      ...section,
      items: section.items?.filter((item) => canAccessPage(user, item.key)),
    }))
    .filter((section) =>
      section.items?.length
        ? section.items.length > 0
        : canAccessPage(user, section.key),
    );

/**
 * Route → side-menu page. Routes not listed here are public/customer/admin
 * screens and are left untouched by the staff guard.
 */
const ROUTE_PAGE_IDS: Record<string, string[]> = {
  'business-overview': ['overview'],
  'business-hub': ['overview'],
  'business-more': ['more'],
  'business-orders': ['orders-all'],
  'business-bookings': ['orders-bookings'],
  'business-pos-orders': ['pos-transactions'],
  'business-messages': ['messages-inapp'],
  'business-messages-sms': ['messages-sms'],
  'business-messages-email': ['messages-email'],
  'hub-catalog': ['business-catalog'],
  'hub-catalog-new-product': ['business-catalog'],
  'hub-catalog-new-service': ['business-services'],
  'hub-services': ['business-services'],
  'hub-deals': ['business-deals'],
  'business-deals': ['business-deals'],
  'deal-studio': ['business-deals'],
  'deal-create-locations': ['business-deals'],
  'deal-location-pricing': ['business-deals'],
  'hub-deal-detail': ['business-deals'],
  'business-branch-pricing': ['business-deals'],
  'hub-customers': ['business-customers'],
  'hub-customer-profile': ['business-customers'],
  'segments-hub': ['business-customers'],
  'segment-actions': ['business-customers'],
  'segment-create': ['business-customers'],
  'segment-detail': ['business-customers'],
  'hub-loyalty': ['business-loyalty'],
  'hub-loyalty-rewards': ['business-loyalty'],
  'hub-staff': ['business-staff'],
  'hub-staff-invite': ['business-staff'],
  'hub-locations': ['business-locations'],
  'business-add-location': ['business-locations'],
  'hub-branch-detail': ['business-locations'],
  'hub-profile': ['business-profile'],
  'business-profile': ['business-profile'],
  'business-profile-studio': ['business-profile'],
  'hub-storefront-preview': ['business-profile'],
  'business-referrals': ['business-referrals'],
  'business-pos-menu': ['pos'],
  'pos-home': ['pos-home'],
  'pos-home-offline': ['pos-home'],
  'pos-register': ['pos-sale'],
  'pos-cart': ['pos-sale'],
  'pos-switch': ['pos-sale'],
  'pos-customer': ['pos-sale'],
  'pos-sale-complete': ['pos-sale'],
  'pos-payment': ['pos-sale'],
  'pos-split-bill': ['pos-sale'],
  'pos-display-order': ['pos-sale'],
  'pos-display-tip': ['pos-sale'],
  'pos-display-pay': ['pos-sale'],
  'pos-display-receipt': ['pos-sale'],
  'pos-product-shift': ['pos-sale'],
  'pos-stock': ['business-catalog'],
  'pos-ledger': ['pos-transactions'],
  'pos-customers-lookup': ['business-customers'],
  'pos-order-lookup': ['orders-all'],
  'pos-dossier': ['orders-all'],
  'pos-offline': ['pos-home'],
  'pos-txn-detail': ['pos-transactions'],
  'pos-buffer': ['pos-home'],
  'pos-kitchen': ['orders-all'],
  'pos-settings': ['pos-settings'],
  'store-ordering-dashboard': ['store-ordering-dashboard'],
  'store-ordering-qr': ['store-ordering-qr'],
  'store-ordering-settings': ['store-ordering-settings'],
  'cluster-system': ['cluster-system'],
  'cluster-onboarding': ['cluster-system'],
  'cluster-boost': ['cluster-system'],
  'cluster-boost-new': ['cluster-system'],
  'boost': ['more-marketing'],
  'boost-hub': ['more-marketing'],
  'boost-studio': ['more-marketing'],
  'boost-metrics': ['more-marketing'],
  'boost-wallet': ['more-marketing'],
  'analytics-overview': ['more-analytics'],
  'analytics-audience': ['more-analytics'],
  'analytics-branches': ['more-analytics'],
  'analytics-business': ['more-analytics'],
  'analytics-customers': ['more-analytics'],
  'analytics-deals': ['more-analytics'],
  'analytics-locations': ['more-analytics'],
  'analytics-pos': ['more-analytics'],
  'analytics-export': ['more-analytics'],
  'analytics-filter': ['more-analytics'],
  'business-subscription': ['more-subscription'],
  'business-add-ons': ['more-addons'],
  'business-notifications': ['more-notifications'],
  'verification-status': ['more-verification'],
  'business-support': ['more-support'],
  'business-settings': ['more-settings'],
  'business-manage-features': ['more-settings'],
  'business-feature-setup': ['more-settings'],
};

/** True when a staff account may open this dashboard route. */
export const isRouteAllowed = (user: SessionUser | undefined, route: string): boolean => {
  const pages = ROUTE_PAGE_IDS[route];
  if (!pages?.length) return true;
  return pages.some((pageId) => canAccessPage(user, pageId));
};

/** The dashboard route used for a granted page when redirecting a staff user. */
const PAGE_FALLBACK_ROUTES: Record<string, string> = {
  overview: 'business-overview',
  'messages-inapp': 'business-messages',
  'messages-sms': 'business-messages-sms',
  'messages-email': 'business-messages-email',
  'business-catalog': 'hub-catalog',
  'business-services': 'hub-services',
  'business-deals': 'hub-deals',
  'business-customers': 'hub-customers',
  'business-loyalty': 'hub-loyalty',
  'business-staff': 'hub-staff',
  'business-locations': 'hub-locations',
  'business-profile': 'hub-profile',
  'business-referrals': 'business-referrals',
  'pos-home': 'pos-home',
  'pos-sale': 'pos-register',
  'orders-all': 'business-orders',
  'orders-bookings': 'business-bookings',
  'pos-transactions': 'business-pos-orders',
  'pos-settings': 'pos-settings',
  'store-ordering-dashboard': 'store-ordering-dashboard',
  'store-ordering-qr': 'store-ordering-qr',
  'store-ordering-settings': 'store-ordering-settings',
  'cluster-system': 'cluster-system',
  'more-marketing': 'boost-hub',
  'more-analytics': 'analytics-overview',
  'more-subscription': 'business-subscription',
  'more-addons': 'business-add-ons',
  'more-notifications': 'business-notifications',
  'more-verification': 'verification-status',
  'more-support': 'business-support',
  'more-settings': 'business-settings',
};

/** First side-menu page this account can open, or the overview shell as a last resort. */
export const firstAllowedStaffRoute = (user: SessionUser | undefined): string =>
  ALL_STAFF_PAGE_IDS.map((id) => PAGE_FALLBACK_ROUTES[id]).find((route) =>
    route ? isRouteAllowed(user, route) : false,
  ) ?? 'business-overview';

/** Resolve a navigation target to the route the account is actually allowed to open. */
export const allowedStaffRoute = (user: SessionUser | undefined, route: string): string =>
  isRouteAllowed(user, route) ? route : firstAllowedStaffRoute(user);

/** Owner-assigned label for the signed-in account, with a Staff fallback. */
export const sessionRoleLabel = (user: SessionUser | undefined): string => {
  if (!user) return 'Business account';
  if (user.role === 'Owner') return 'Owner';
  const label = user.jobTitle || user.roleTag;
  if (label && !['staff', 'custom'].includes(label.trim().toLowerCase())) return label.trim();
  return user.businessRole || user.role || 'Staff';
};
