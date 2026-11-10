import { useState, useEffect, type ReactNode } from 'react';
import { adminUserFromSession, clearAdminSession, getAdminSession, type AdminUser, SUPER_ADMIN_USER } from './adminAuth';
import { hasApiConfig } from '../../services/api/client';
import { useSessionUser } from '../../hooks/useSessionUser';
import { useAuth } from '../../context/AuthContext';
import { useAdminPendingVerification } from './useAdminData';

export interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: ReactNode;
  breadcrumb?: {
    module?: string;
    page: string;
  };
}

interface SubPage {
  id: string;
  label: string;
  path: string;
  badge?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  moduleLabel?: string;
  sectionLabel?: string;
  children?: SubPage[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'dashboard', path: '/admin' },
  { id: 'customers', label: 'Customers', icon: 'group', path: '/admin/customers' },
  {
    id: 'businesses',
    label: 'Businesses',
    icon: 'domain',
    path: '/admin/businesses',
    sectionLabel: 'Operational Module',
    children: [
      { id: 'all-businesses', label: 'All Businesses', path: '/admin/businesses' },
      { id: 'verification-status', label: 'Verification Status', path: '/admin/businesses/verification', badge: '42' },
      { id: 'business-categories', label: 'Business Categories', path: '/admin/businesses/categories' },
    ],
  },
  {
    id: 'locations',
    label: 'Locations & Clusters',
    icon: 'hub',
    path: '/admin/locations',
    sectionLabel: 'Operational Module',
    children: [
      { id: 'location-hierarchy', label: 'Location Hierarchy', path: '/admin/locations/hierarchy' },
      { id: 'cluster-map', label: 'Cluster Map', path: '/admin/locations/map' },
      { id: 'cluster-management', label: 'Cluster Management', path: '/admin/locations' },
    ],
  },
  {
    id: 'deals',
    label: 'Deals & Discovery',
    icon: 'local_offer',
    path: '/admin/deals',
    sectionLabel: 'Commercial Module',
    children: [
      { id: 'all-deals', label: 'All Deals', path: '/admin/deals' },
      { id: 'discovery-listings', label: 'Discovery Listings', path: '/admin/deals/moderation' },
      { id: 'featured-placement', label: 'Featured Placement', path: '/admin/deals/featured' },
    ],
  },
  {
    id: 'orders',
    label: 'Orders & POS',
    icon: 'point_of_sale',
    path: '/admin/orders',
    sectionLabel: 'Commercial Module',
    children: [
      { id: 'orders-bookings', label: 'Orders & Bookings', path: '/admin/orders' },
      { id: 'transactions-exceptions', label: 'Transactions & Exceptions', path: '/admin/orders/transactions', badge: '42' },
      { id: 'pos-terminals', label: 'POS Monitoring', path: '/admin/orders/terminals' },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing & Ads',
    icon: 'campaign',
    path: '/admin/marketing',
    sectionLabel: 'Growth Module',
    children: [
      { id: 'campaigns-announcements', label: 'Campaigns & Announcements', path: '/admin/marketing' },
      { id: 'ads-management', label: 'Ads Management', path: '/admin/marketing/ads' },
      { id: 'ad-performance', label: 'Ad Performance', path: '/admin/marketing/performance' },
    ],
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions & Payments',
    icon: 'credit_card',
    path: '/admin/subscriptions',
    sectionLabel: 'Financial Module',
    children: [
      { id: 'plan-configuration', label: 'Plan Configuration', path: '/admin/subscriptions' },
      { id: 'subscriptions-list', label: 'Subscriptions', path: '/admin/subscriptions/subscriptions' },
      { id: 'payments', label: 'Payments', path: '/admin/subscriptions/payments' },
      { id: 'ad-billing', label: 'Ad Payments & Billing', path: '/admin/subscriptions/ad-billing' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics & Reports',
    icon: 'monitoring',
    path: '/admin/analytics',
    sectionLabel: 'Intelligence Module',
    children: [
      { id: 'platform-performance', label: 'Platform Performance', path: '/admin/analytics' },
      { id: 'customer-growth', label: 'Customer & Business Growth', path: '/admin/analytics/growth' },
      { id: 'deals-performance', label: 'Deals & Discovery Performance', path: '/admin/analytics/deals' },
      { id: 'clusters-performance', label: 'Clusters & Locations Performance', path: '/admin/analytics/clusters' },
      { id: 'revenue-reports', label: 'Revenue & Advertising Reports', path: '/admin/analytics/revenue' },
    ],
  },
  {
    id: 'settings',
    label: 'Support & Settings',
    icon: 'manage_accounts',
    path: '/admin/settings',
    sectionLabel: 'System Module',
    children: [
      { id: 'support-requests', label: 'Support Requests', path: '/admin/settings/support' },
      { id: 'complaints-disputes', label: 'Complaints & Disputes', path: '/admin/settings/disputes' },
      { id: 'platform-settings', label: 'Platform Settings', path: '/admin/settings' },
      { id: 'admin-activity-log', label: 'Admin Activity Log', path: '/admin/settings/audit' },
      { id: 'referral-video', label: 'Referral Programme Video', path: '/admin/referral' },
    ],
  },
];

export function AdminLayout({ currentPath, onNavigate, children, breadcrumb }: AdminLayoutProps) {
  const live = hasApiConfig();
  const { signOut } = useAuth();
  const sessionUser = useSessionUser().data;
  const [mockAdminUser] = useState<AdminUser>(() => getAdminSession() ?? SUPER_ADMIN_USER);
  // Live: the signed-in admin account. Mock mode keeps the sample admin.
  const adminUser: AdminUser = live
    ? sessionUser
      ? adminUserFromSession(sessionUser)
      : { ...SUPER_ADMIN_USER, id: '', name: '…', email: '', initials: '…', role: 'Admin', permissions: [] }
    : mockAdminUser;
  const pendingCount = useAdminPendingVerification({ page: 1, limit: 1 }).data?.meta.total;
  // Live badges show real counts; sample badges are for mock mode only.
  const badgeFor = (child: { id: string; badge?: string }) => {
    if (!live) return child.badge;
    if (child.id === 'verification-status') return pendingCount ? String(pendingCount) : undefined;
    return undefined;
  };
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickNewOpen, setQuickNewOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((p) => !p);
      }
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setQuickNewOpen(false);
        setUserDropdownOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    clearAdminSession();
    if (live) {
      try {
        await signOut();
      } catch {
        // signOut clears the local session even when the logout call fails
      }
    }
    onNavigate('/admin/login');
  };

  // Determine active module
  const activeModule = NAV_ITEMS.find((item) => {
    if (item.path === '/admin') return currentPath === '/admin' || currentPath === '/admin/overview';
    if (item.children) {
      return (
        item.children.some((c) => c.path === currentPath) ||
        currentPath === item.path ||
        currentPath.startsWith(item.path + '/')
      );
    }
    return currentPath === item.path;
  });

  // Only modules that have subpages trigger the collapsed icon rail + subpage panel
  const hasSubNav = Boolean(activeModule?.children && activeModule.children.length > 0);

  const mainPadding = hasSubNav ? 'pl-0 lg:pl-[312px]' : 'pl-0 lg:pl-[260px]';
  const headerLeft = hasSubNav ? 'left-0 lg:left-[312px]' : 'left-0 lg:left-[260px]';

  return (
    <div className="bg-[#f7f9fb] font-sans text-[#191c1e] antialiased min-h-screen text-[13px]">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* OPTION A: FULL SIDEBAR (~260px) FOR SINGLE PAGES (Overview, Customers, Analytics) */}
      {/* ========================================================================= */}
      {!hasSubNav && (
        <aside
          className={`fixed left-0 top-0 h-full w-[260px] bg-white border-r border-slate-200/80 z-40 flex flex-col select-none shadow-[1px_0_4px_rgba(0,0,0,0.01)] transition-transform duration-200 lg:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                onNavigate('/admin');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0055c4] to-[#066cf4] flex items-center justify-center text-white font-bold text-base shadow-sm tracking-tight group-hover:opacity-95 transition-opacity">
                V
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[14px] tracking-tight text-slate-900 leading-tight">VEMTAP</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-[#0055c4] uppercase tracking-wider border border-blue-100">
                    Enterprise
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">Admin Management</span>
              </div>
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden w-7 h-7 rounded-md text-slate-400 hover:text-slate-700 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Navigation List - Full Item Rows */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeModule?.id === item.id;
              const hasChildren = Boolean(item.children && item.children.length > 0);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.children ? item.children[0].path : item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50/80 text-[#0055c4] font-semibold border border-blue-100/60 shadow-[0_1px_2px_rgba(6,108,244,0.06)]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`material-symbols-outlined text-[19px] ${
                        isActive ? 'text-[#0055c4]' : 'text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="text-[13px] tracking-tight">{item.label}</span>
                  </div>
                  {hasChildren && (
                    <span className="material-symbols-outlined text-[16px] text-slate-400">
                      chevron_right
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Status & Help */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 animate-pulse"></span>
                <span className="text-[11px] font-semibold text-slate-700">Engine v4.2</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Operational</span>
            </div>
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">verified_user</span>
                PCI-DSS Level 1
              </span>
              <button
                onClick={() => onNavigate('/admin/settings')}
                className="text-[#0055c4] hover:underline font-medium"
              >
                Docs & Help
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* OPTION B: DUAL-RAIL FOR MODULES WITH DROPDOWN/SUBPAGE (Businesses, Locations, Deals, etc.) */}
      {/* ========================================================================= */}
      {hasSubNav && (
        <>
          {/* RAIL 1: PRIMARY ICON RAIL (72px) */}
          <aside
            className={`fixed left-0 top-0 h-full w-[72px] bg-[#2d3133] z-50 flex flex-col justify-between py-3 items-center select-none transition-transform duration-200 lg:translate-x-0 ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Top: Logo + Nav Icons */}
            <div className="flex flex-col items-center w-full gap-3">
              {/* V Brand Logo */}
              <button
                onClick={() => onNavigate('/admin')}
                className="w-10 h-10 rounded-xl bg-[#066cf4] flex items-center justify-center text-white font-bold text-[20px] tracking-wider shadow-[0_1px_8px_rgba(0,0,0,0.15)] mb-1 hover:opacity-90 transition-opacity"
                title="VEMTAP Admin Overview"
              >
                V
              </button>

              {/* Nav Icons */}
              <nav className="flex flex-col items-center gap-1 w-full px-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeModule?.id === item.id;
                  const hasChildren = Boolean(item.children && item.children.length > 0);
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.children ? item.children[0].path : item.path)}
                      title={item.label}
                      className={`relative w-11 h-11 rounded-lg flex items-center justify-center transition-colors group ${
                        isActive
                          ? 'bg-[#066cf4] text-white shadow-sm'
                          : 'text-[#bec6e0] hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      {hasChildren && isActive && (
                        <span className="material-symbols-outlined absolute right-0.5 text-[11px] opacity-80">
                          chevron_right
                        </span>
                      )}
                      {/* Tooltip */}
                      <span className="absolute left-full ml-2 px-2 py-1 bg-[#191c1e] text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom: Settings + Avatar */}
            <div className="flex flex-col items-center gap-2 w-full pb-1">
              <button
                onClick={() => onNavigate('/admin/settings')}
                title="Settings"
                className="w-11 h-11 rounded-lg flex items-center justify-center text-[#bec6e0] hover:bg-white/10 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="w-9 h-9 rounded-full bg-[#0055c4] flex items-center justify-center hover:opacity-90 transition-opacity text-white"
                  title="Super Admin Profile"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </button>
                {userDropdownOpen && (
                  <div className="absolute bottom-full left-full ml-2 mb-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="font-semibold text-[13px] text-slate-900">{adminUser.name}</div>
                      <div className="text-[11px] text-slate-500">{adminUser.role}</div>
                    </div>
                    <button
                      onClick={() => onNavigate('/admin/settings/team')}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-[12px] text-slate-700"
                    >
                      <span className="material-symbols-outlined text-[16px] text-slate-400">manage_accounts</span>
                      Account Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-3 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-[12px] text-red-600"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* RAIL 2: SUB-NAV PANEL (240px) */}
          <aside
            className={`fixed left-0 lg:left-[72px] top-0 h-full w-[240px] bg-white z-40 flex flex-col py-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-slate-100 select-none transition-transform duration-200 lg:translate-x-0 ${
              mobileMenuOpen ? 'translate-x-[72px]' : '-translate-x-full'
            }`}
          >
            {/* Module Header */}
            <div className="px-4 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a5e88]">
                {activeModule?.sectionLabel ?? 'Operational Module'}
              </span>
              <h2 className="text-[16px] font-semibold text-[#191c1e] mt-0.5 tracking-tight">
                {activeModule?.label}
              </h2>
            </div>

            {/* Sub-page links */}
            <nav className="flex flex-col gap-0.5 px-3 flex-1 overflow-y-auto">
              {activeModule?.children?.map((child) => {
                const isActive =
                  currentPath === child.path ||
                  (child.path === '/admin/orders/transactions' && currentPath === '/admin/orders/disputes') ||
                  (child.path === '/admin/marketing/ads' && currentPath === '/admin/marketing/slots') ||
                  (child.path === '/admin/marketing/performance' && currentPath === '/admin/marketing/broadcasts');
                return (
                  <button
                    key={child.id}
                    onClick={() => {
                      onNavigate(child.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`relative flex items-center justify-between h-[34px] px-3 rounded-lg text-left transition-colors text-[13px] ${
                      isActive
                        ? 'bg-[#dae2fd] text-[#001a41] font-semibold'
                        : 'text-[#424655] hover:bg-[#f2f4f6] hover:text-[#191c1e] font-normal'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#066cf4] rounded-r" />
                    )}
                    <span className="truncate">{child.label}</span>
                    {badgeFor(child) && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 ${
                          isActive ? 'bg-[#066cf4] text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {badgeFor(child)}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Bottom status */}
            <div className="mt-auto px-4 pt-3 border-t border-slate-100 mx-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-slate-700">Engine v4.2 Operational</span>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* ========================================================================= */}
      {/* HEADER */}
      {/* ========================================================================= */}
      <header
        className={`fixed top-0 right-0 ${headerLeft} h-14 bg-white/90 backdrop-blur-xl z-30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-slate-100 transition-all`}
      >
        <div className="h-14 w-full px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle + Breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 truncate">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 shrink-0"
              title="Toggle Menu"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>

            {/* Breadcrumb links */}
            <div className="flex items-center gap-1 text-[13px] text-[#4a5e88] truncate">
              <button
                onClick={() => onNavigate('/admin')}
                className="hover:text-[#191c1e] transition-colors cursor-pointer shrink-0 hidden sm:inline"
              >
                VEMTAP Admin
              </button>
              {breadcrumb?.module && (
                <>
                  <span className="material-symbols-outlined text-[14px] text-slate-300 shrink-0 hidden sm:inline">
                    chevron_right
                  </span>
                  <span className="hover:text-[#191c1e] transition-colors cursor-pointer shrink-0">
                    {breadcrumb.module}
                  </span>
                </>
              )}
              <span className="material-symbols-outlined text-[14px] text-slate-300 shrink-0">chevron_right</span>
              <span className="text-[13px] font-semibold text-[#191c1e] truncate">{breadcrumb?.page ?? 'Overview'}</span>
              <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#dae2fd] text-[#001a41] text-[10px] font-bold tracking-wide ml-2 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#066cf4]" />
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>
          </div>

          {/* Right: Search, New, Notifications, User */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search */}
            <div
              onClick={() => setSearchModalOpen(true)}
              className="relative hidden md:flex items-center w-56 lg:w-64 cursor-pointer"
            >
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[16px] text-[#727786]">search</span>
              <input
                readOnly
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#f2f4f6] text-[#191c1e] placeholder:text-[#727786] text-[13px] focus:outline-none cursor-pointer"
                placeholder="Search platform... ⌘K"
                type="text"
                value={searchQuery}
                onChange={() => {}}
              />
            </div>

            {/* New button */}
            <div className="relative">
              <button
                onClick={() => setQuickNewOpen(!quickNewOpen)}
                className="h-9 px-3 rounded-lg bg-[#066cf4] text-white text-[13px] font-medium hover:bg-[#0055c4] transition-colors flex items-center gap-1 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span className="hidden sm:inline">New</span>
              </button>
              {quickNewOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Quick Actions
                  </div>
                  {[
                    { icon: 'domain', label: 'Onboard Merchant', path: '/admin/businesses' },
                    { icon: 'person_add', label: 'Add Customer', path: '/admin/customers' },
                    { icon: 'campaign', label: 'Create Campaign', path: '/admin/marketing' },
                    { icon: 'local_offer', label: 'Create Deal', path: '/admin/deals' },
                  ].map((action) => (
                    <button
                      key={action.path}
                      onClick={() => {
                        setQuickNewOpen(false);
                        onNavigate(action.path);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-[12px] text-slate-700"
                    >
                      <span className="material-symbols-outlined text-[17px] text-[#0055c4]">{action.icon}</span>
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#4a5e88] hover:bg-[#f2f4f6] hover:text-[#191c1e] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </button>
              {!live && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a]" />}
            </div>

            {/* User */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
              <div className="hidden sm:block text-right">
                <div className="text-[12px] font-semibold text-[#191c1e] leading-none">{adminUser.name}</div>
                <div className="text-[11px] text-[#4a5e88] mt-0.5 leading-none">{adminUser.role}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#0055c4] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTENT CANVAS */}
      {/* ========================================================================= */}
      <div className={`${mainPadding} pt-14 min-h-screen bg-[#f7f9fb] transition-all`}>
        {children}
      </div>

      {/* ========================================================================= */}
      {/* SEARCH MODAL (⌘K) */}
      {/* ========================================================================= */}
      {searchModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              <span className="material-symbols-outlined text-[20px] text-slate-400">search</span>
              <input
                autoFocus
                className="flex-1 text-[15px] text-slate-900 placeholder-slate-400 outline-none bg-transparent"
                placeholder="Search businesses, customers, orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <kbd className="px-2 py-1 text-[11px] text-slate-400 border border-slate-200 rounded">ESC</kbd>
            </div>
            <div className="px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Quick Navigate</div>
              <div className="space-y-0.5">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSearchModalOpen(false);
                      onNavigate(item.path);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 text-left text-[13px] text-slate-700"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#0055c4]">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
