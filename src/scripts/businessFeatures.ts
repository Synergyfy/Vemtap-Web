/**
 * VEMTAP business dashboard feature catalogue.
 *
 * One shared definition of the tools a business owner can switch on or off:
 * the onboarding "Set Up Your Business Dashboard" screen, the dashboard quick
 * actions, the desktop sidebar, the mobile tab bar / drawer, the More menus and
 * Business Settings › Manage Features all read from this file, so the visible
 * workspace can never drift from the saved selection.
 *
 * Frontend only — selections are persisted per business by
 * `BusinessFeaturesContext` and can later be swapped for server-loaded
 * preferences without touching this catalogue.
 */

export type FeatureId =
  | 'pos'
  | 'products'
  | 'services'
  | 'storefront'
  | 'bookings'
  | 'chat'
  | 'sms'
  | 'email'
  | 'loyalty'
  | 'cluster'
  | 'referrals'
  | 'deals'
  | 'locations'
  | 'staff'
  | 'analytics'
  | 'customers';

export type FeatureState = Record<FeatureId, boolean>;

export interface BusinessFeature {
  id: FeatureId;
  /** Display name — matches the tool as it is labelled in the dashboard. */
  name: string;
  icon: string;
  /** One short, plain-English line shown on the picker cards. */
  description: string;
  /** Sidebar / portal nav key used to open the tool's existing page. */
  navKey: string;
}

export interface FeatureCategory {
  key: string;
  label: string;
  features: FeatureId[];
}

/**
 * Grouped and ordered exactly like the business dashboard's own navigation
 * (`BUSINESS_SIDEBAR_SECTIONS`): Messages → Business → POS (with Store Front
 * inside it) → Cluster System → Analytics under More. The setup screen, Manage
 * Features and the dashboard quick actions all read this list, so the tools an
 * owner switches on or off appear in the same arrangement as the pages they
 * open.
 */
export const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    key: 'messages',
    label: 'Messages',
    features: ['chat', 'sms', 'email'],
  },
  {
    key: 'business',
    label: 'Business',
    features: ['products', 'services', 'deals', 'customers', 'loyalty', 'staff', 'locations', 'referrals'],
  },
  {
    key: 'pos',
    label: 'POS & Store Front',
    features: ['pos', 'bookings', 'storefront'],
  },
  {
    key: 'growth',
    label: 'Cluster System & Analytics',
    features: ['cluster', 'analytics'],
  },
];

export const BUSINESS_FEATURES: Record<FeatureId, BusinessFeature> = {
  pos: {
    id: 'pos',
    name: 'POS',
    icon: 'point_of_sale',
    description: 'Manage sales, orders and receipts.',
    navKey: 'pos-home',
  },
  products: {
    id: 'products',
    name: 'Products',
    icon: 'inventory_2',
    description: 'Add and manage products.',
    navKey: 'business-catalog',
  },
  services: {
    id: 'services',
    name: 'Services',
    icon: 'design_services',
    description: 'Add and manage services.',
    navKey: 'business-services',
  },
  storefront: {
    id: 'storefront',
    name: 'Store Front',
    icon: 'qr_code_scanner',
    description: 'Let customers browse your catalogue and submit orders.',
    navKey: 'store-ordering-dashboard',
  },
  bookings: {
    id: 'bookings',
    name: 'Bookings',
    icon: 'calendar_month',
    description: 'Manage appointments and customer bookings.',
    navKey: 'bookings',
  },
  chat: {
    id: 'chat',
    name: 'VEMTAP Chat',
    icon: 'forum',
    description: 'Communicate with customers.',
    navKey: 'messages-inapp',
  },
  sms: {
    id: 'sms',
    name: 'SMS',
    icon: 'sms',
    description: 'Send SMS updates and campaigns.',
    navKey: 'messages-sms',
  },
  email: {
    id: 'email',
    name: 'Email Marketing',
    icon: 'mail',
    description: 'Reach customers through email.',
    navKey: 'messages-email',
  },
  loyalty: {
    id: 'loyalty',
    name: 'Loyalty & Rewards',
    icon: 'stars',
    description: 'Reward repeat customers.',
    navKey: 'business-loyalty',
  },
  cluster: {
    id: 'cluster',
    name: 'Cluster System',
    icon: 'hub',
    description: 'Connect with nearby businesses and customers and join local promotions.',
    navKey: 'cluster-system',
  },
  referrals: {
    id: 'referrals',
    name: 'Referrals',
    icon: 'group_add',
    description: 'Encourage customers to refer others.',
    navKey: 'business-referrals',
  },
  deals: {
    id: 'deals',
    name: 'Promotions & Deals',
    icon: 'local_offer',
    description: 'Create and promote special offers.',
    navKey: 'business-deals',
  },
  locations: {
    id: 'locations',
    name: 'Branches & Locations',
    icon: 'location_on',
    description: 'Manage business locations.',
    navKey: 'business-locations',
  },
  staff: {
    id: 'staff',
    name: 'Staff Management',
    icon: 'shield_person',
    description: 'Manage business staff.',
    navKey: 'business-staff',
  },
  analytics: {
    id: 'analytics',
    name: 'Analytics & Reports',
    icon: 'query_stats',
    description: 'Understand business performance.',
    navKey: 'more-analytics',
  },
  customers: {
    id: 'customers',
    name: 'Customers',
    icon: 'groups',
    description: 'Keep customer records and contact details in one place.',
    navKey: 'business-customers',
  },
};

export const FEATURE_IDS: FeatureId[] = FEATURE_CATEGORIES.flatMap((category) => category.features);

/**
 * Pages the platform ships for every business and that an owner can never
 * switch off — Messages (Chat, SMS, Email) are platform-locked defaults.
 */
export const DEFAULT_SYSTEM_FEATURES: FeatureId[] = ['chat', 'sms', 'email'];
export const LOCKED_SYSTEM_FEATURES: readonly FeatureId[] = ['chat', 'sms', 'email'];

export function isFeatureLocked(
  id: FeatureId,
  systemDefaults: readonly FeatureId[] = DEFAULT_SYSTEM_FEATURES,
): boolean {
  return LOCKED_SYSTEM_FEATURES.includes(id) || systemDefaults.includes(id);
}

/** Keeps only real feature ids, deduped and returned in dashboard order. */
export function normalizeSystemDefaults(ids: readonly unknown[]): FeatureId[] {
  const valid = new Set<FeatureId>(
    ids.filter((id): id is FeatureId => typeof id === 'string' && id in BUSINESS_FEATURES),
  );
  return FEATURE_IDS.filter((id) => valid.has(id));
}

/** Forces every system-default page on, whatever the stored selection says. */
export function applySystemDefaults(state: FeatureState, systemDefaults: readonly FeatureId[]): FeatureState {
  const effectiveDefaults = Array.from(new Set([...DEFAULT_SYSTEM_FEATURES, ...systemDefaults]));
  if (effectiveDefaults.length === 0) return { ...state };
  const next: FeatureState = { ...state };
  effectiveDefaults.forEach((id) => {
    next[id] = true;
  });
  return next;
}

export function isSystemDefault(id: FeatureId, systemDefaults: readonly FeatureId[]): boolean {
  return DEFAULT_SYSTEM_FEATURES.includes(id) || systemDefaults.includes(id);
}

/** Map of "is this page a system default?" used to seed the admin pickers. */
export function buildSystemDefaultState(systemDefaults: readonly unknown[]): FeatureState {
  const normalized = normalizeSystemDefaults(systemDefaults);
  return FEATURE_IDS.reduce((state, id) => {
    state[id] = normalized.includes(id);
    return state;
  }, {} as FeatureState);
}

export interface BusinessGoalOption {
  id: 'products' | 'services' | 'growth';
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  features: FeatureId[];
}

export const BUSINESS_GOAL_OPTIONS: BusinessGoalOption[] = [
  {
    id: 'products',
    title: 'Sell Products & Manage Store Orders',
    subtitle: 'Point of sale (POS) checkout, inventory catalogue & digital store front.',
    icon: 'point_of_sale',
    badge: 'Retail & Food',
    features: ['products', 'pos', 'storefront'],
  },
  {
    id: 'services',
    title: 'Offer Services & Accept Client Bookings',
    subtitle: 'Service menu, appointment calendar, bookings & staff management.',
    icon: 'calendar_month',
    badge: 'Appointments & Care',
    features: ['services', 'bookings', 'staff'],
  },
  {
    id: 'growth',
    title: 'Market, Retain Customers & Boost Growth',
    subtitle: 'Commercial cluster network, deals rotator, loyalty points & customer CRM.',
    icon: 'hub',
    badge: 'Traffic & Marketing',
    features: ['cluster', 'deals', 'loyalty', 'customers', 'referrals', 'analytics'],
  },
];

/**
 * Builds a FeatureState from a set of selected goal option ids.
 * Messages (chat, sms, email) are always locked ON.
 */
export function buildFeaturesFromGoals(
  selectedGoalIds: ('products' | 'services' | 'growth')[],
  lockedFeatures: readonly FeatureId[] = LOCKED_SYSTEM_FEATURES,
): FeatureState {
  const state = buildFeatureState(false);
  // Locked features are always on
  lockedFeatures.forEach((id) => {
    state[id] = true;
  });
  // Active features based on selected goals
  BUSINESS_GOAL_OPTIONS.forEach((goal) => {
    if (selectedGoalIds.includes(goal.id)) {
      goal.features.forEach((fid) => {
        state[fid] = true;
      });
    }
  });
  return state;
}

/**
 * Features left out of the recommended setup. Everything else is on by
 * default, so a small business gets a complete workspace without switching on
 * paid or team-oriented outreach tools it may not need yet. System-default
 * pages are never listed here — they are always on regardless.
 */
const RECOMMENDED_OFF: FeatureId[] = ['referrals'];

/** Every feature in the recommended (default) setup. */
export const RECOMMENDED_FEATURES: FeatureState = FEATURE_IDS.reduce((state, id) => {
  state[id] = !RECOMMENDED_OFF.includes(id);
  return state;
}, {} as FeatureState);

export function buildFeatureState(enabled: boolean): FeatureState {
  return FEATURE_IDS.reduce((state, id) => {
    state[id] = enabled;
    return state;
  }, {} as FeatureState);
}

/**
 * Merge a stored selection over the recommended defaults (new features fall
 * back sensibly). System-default pages are forced on afterwards by
 * `BusinessFeaturesContext` — a stored "off" can never hide them.
 */
export function mergeFeatureState(stored?: Partial<FeatureState> | null): FeatureState {
  return { ...RECOMMENDED_FEATURES, ...(stored ?? {}) };
}

/**
 * The one business rule carried over from BusinessOfferingsContext: a business
 * must always offer at least one of Products or Services.
 */
export function validateFeatureSelection(features: FeatureState): string | null {
  if (!features.products && !features.services) {
    return 'At least one business offering must stay on. Keep Products or Services switched on — you can turn off everything else.';
  }
  return null;
}

/** Does this nav key belong to a feature that can be switched off? */
const NAV_KEY_FEATURE: Record<string, FeatureId> = {
  // Messages channels
  'messages-inapp': 'chat',
  'messages-sms': 'sms',
  'messages-email': 'email',
  // Business section
  'business-catalog': 'products',
  'business-services': 'services',
  'business-deals': 'deals',
  'business-customers': 'customers',
  'business-loyalty': 'loyalty',
  'business-staff': 'staff',
  'business-locations': 'locations',
  'business-referrals': 'referrals',
  // POS section
  'pos-home': 'pos',
  'pos-sale': 'pos',
  'orders-all': 'pos',
  'pos-transactions': 'pos',
  'pos-stock': 'pos',
  'pos-ledger': 'pos',
  'pos-settings': 'pos',
  'orders-bookings': 'bookings',
  // Store Front section (renders inside the POS menu)
  'store-ordering-dashboard': 'storefront',
  'store-ordering-qr': 'storefront',
  'store-ordering-settings': 'storefront',
  // More section
  'more-marketing': 'deals',
  'more-analytics': 'analytics',
};

/** Which features a sidebar section needs before it is worth showing. */
export const SECTION_FEATURES: Record<string, FeatureId[]> = {
  messages: ['chat', 'sms', 'email'],
  pos: ['pos', 'bookings', 'storefront'],
  'store-ordering': ['storefront'],
  'cluster-system': ['cluster'],
};

export function getNavKeyFeature(key: string): FeatureId | undefined {
  return NAV_KEY_FEATURE[key];
}

/**
 * Routes that belong to a specific tool. Navigating here while that tool is
 * switched off is redirected to the dashboard, so stale links and shortcuts
 * can never open a hidden feature. Essential routes (profile, settings,
 * billing, support, notifications, verification) are deliberately absent.
 */
const ROUTE_FEATURE: Record<string, FeatureId> = {
  // Sales & operations
  'hub-catalog': 'products',
  'business-branch-pricing': 'products',
  'hub-services': 'services',
  'store-ordering-dashboard': 'storefront',
  'store-ordering-qr': 'storefront',
  'store-ordering-settings': 'storefront',
  'business-bookings': 'bookings',
  'business-orders': 'pos',
  'business-pos-menu': 'pos',
  'business-pos-orders': 'pos',
  'pos-home': 'pos',
  'pos-home-offline': 'pos',
  'pos-register': 'pos',
  'pos-cart': 'pos',
  'pos-switch': 'pos',
  'pos-customer': 'pos',
  'pos-sale-complete': 'pos',
  'pos-payment': 'pos',
  'pos-product-shift': 'pos',
  'pos-stock': 'pos',
  'pos-ledger': 'pos',
  'pos-customers-lookup': 'pos',
  'pos-order-lookup': 'pos',
  'pos-dossier': 'pos',
  'pos-offline': 'pos',
  'pos-txn-detail': 'pos',
  'pos-buffer': 'pos',
  'pos-kitchen': 'pos',
  'pos-settings': 'pos',
  'pos-split-bill': 'pos',
  'pos-display-order': 'pos',
  'pos-display-tip': 'pos',
  'pos-display-pay': 'pos',
  'pos-display-receipt': 'pos',
  // Customer engagement
  'business-messages': 'chat',
  'business-messages-sms': 'sms',
  'business-messages-email': 'email',
  'hub-loyalty': 'loyalty',
  'hub-loyalty-rewards': 'loyalty',
  // Customer growth
  'cluster-system': 'cluster',
  'cluster-boost': 'cluster',
  'cluster-boost-new': 'cluster',
  'business-referrals': 'referrals',
  'hub-deals': 'deals',
  'deal-studio': 'deals',
  'hub-deal-detail': 'deals',
  'deal-location-pricing': 'deals',
  'deal-create-locations': 'deals',
  // Business management
  'hub-locations': 'locations',
  'business-add-location': 'locations',
  'hub-branch-detail': 'locations',
  'hub-staff': 'staff',
  'hub-staff-invite': 'staff',
  'analytics-overview': 'analytics',
  'analytics-audience': 'analytics',
  'analytics-branches': 'analytics',
  'analytics-business': 'analytics',
  'analytics-customers': 'analytics',
  'analytics-deals': 'analytics',
  'analytics-locations': 'analytics',
  'analytics-pos': 'analytics',
  'analytics-export': 'analytics',
  'analytics-filter': 'analytics',
  'hub-customers': 'customers',
  'hub-customer-profile': 'customers',
};

/** Core dashboard landing pages — entering these counts as entering the workspace. */
const CORE_DASHBOARD_ROUTES = new Set(['business-overview', 'business-hub', 'business-more']);

/** Route shown while the business has not finished picking its tools. */
export const FEATURE_SETUP_ROUTE = 'business-feature-setup';
/** Route of Business Settings › Manage Features. */
export const FEATURE_MANAGE_ROUTE = 'business-manage-features';

export function getRouteFeature(route: string): FeatureId | undefined {
  return ROUTE_FEATURE[route];
}

export interface FeatureRouteContext {
  setupComplete: boolean;
  isEnabled: (id: FeatureId) => boolean;
}

/**
 * Single gate applied to every navigation: routes a business has not set up yet
 * go through the setup screen, and routes belonging to a switched-off tool are
 * redirected to the dashboard. Pure — call it wherever a route is resolved
 * (`setRoute`, initial entry and browser back/forward).
 */
export function resolveFeatureRoute(target: string, ctx: FeatureRouteContext): string {
  if (target === FEATURE_SETUP_ROUTE || target === FEATURE_MANAGE_ROUTE) return target;

  const feature = ROUTE_FEATURE[target];
  const entersDashboard = feature !== undefined || CORE_DASHBOARD_ROUTES.has(target);
  if (!entersDashboard) return target;

  if (!ctx.setupComplete) return FEATURE_SETUP_ROUTE;
  if (feature !== undefined && !ctx.isEnabled(feature)) return 'business-overview';
  return target;
}

/** Which feature owns a page — used to redirect away after a feature is switched off. */
export function findDisabledRoute(route: string, isEnabled: (id: FeatureId) => boolean): boolean {
  const feature = ROUTE_FEATURE[route];
  return feature !== undefined && !isEnabled(feature);
}

export interface FeatureQuickAction {
  feature: FeatureId;
  icon: string;
  label: string;
  sub: string;
}

/**
 * Dashboard quick actions are generated from the saved selection (in category
 * order) so they can never drift from the feature settings.
 */
export function getEnabledQuickActions(isEnabled: (id: FeatureId) => boolean): FeatureQuickAction[] {
  return FEATURE_IDS.filter((id) => isEnabled(id)).map((id) => ({
    feature: id,
    icon: BUSINESS_FEATURES[id].icon,
    label: BUSINESS_FEATURES[id].name,
    sub: BUSINESS_FEATURES[id].description,
  }));
}
