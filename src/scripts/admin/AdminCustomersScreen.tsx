import { useState, useMemo, useDeferredValue } from 'react';
import { ADMIN_CUSTOMERS, type AdminCustomer } from './adminData';
import { AdminChatModal } from './AdminChatModal';
import { hasApiConfig } from '../../services/api/client';
import { adminService } from '../../services/adminService';
import { formatCount, NONE, toAdminCustomer } from './adminLive';
import { adminErrorMessage, useAdminAction, useAdminCustomerActivity, useAdminUsers } from './useAdminData';

const LIVE_PAGE_SIZE = 25;

interface AdminCustomersScreenProps {
  onNavigate: (path: string) => void;
}

type CustomerTab = 'profile' | 'wallet' | 'saved' | 'history' | 'support';

export function AdminCustomersScreen({ onNavigate }: AdminCustomersScreenProps) {
  const live = hasApiConfig();
  const [mockCustomers, setCustomers] = useState<AdminCustomer[]>(ADMIN_CUSTOMERS);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(live ? '' : ADMIN_CUSTOMERS[0].id);
  const [isProfileView, setIsProfileView] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<CustomerTab>('profile');

  // Filters for table view
  const [searchQuery, setSearchQuery] = useState('');
  const [clusterFilter, setClusterFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [joinedFilter, setJoinedFilter] = useState('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Live API: customer accounts (role Customer), searched and paged on the server.
  const deferredSearch = useDeferredValue(searchQuery.trim());
  const liveStatus = statusFilter === 'Active' ? 'Active' : statusFilter === 'Suspended' ? 'Suspended' : undefined;
  const liveQuery = useAdminUsers({ role: 'Customer', search: deferredSearch || undefined, status: liveStatus, page, limit: LIVE_PAGE_SIZE });
  const activeCount = useAdminUsers({ role: 'Customer', status: 'Active', page: 1, limit: 1 }).data?.meta.total;
  const suspendedCount = useAdminUsers({ role: 'Customer', status: 'Suspended', page: 1, limit: 1 }).data?.meta.total;
  const allCount = useAdminUsers({ role: 'Customer', page: 1, limit: 1 }).data?.meta.total;
  const liveCustomers = useMemo(() => (liveQuery.data?.data ?? []).map(toAdminCustomer), [liveQuery.data]);
  const customers = live ? liveCustomers : mockCustomers;
  const liveTotal = liveQuery.data?.meta.total ?? 0;
  const lastPage = Math.max(1, liveQuery.data?.meta.lastPage ?? Math.ceil(liveTotal / LIVE_PAGE_SIZE));
  const [liveOverrides, setLiveOverrides] = useState<Record<string, AdminCustomer['status']>>({});

  const suspendUser = useAdminAction((id: string) => adminService.suspendUser(id));
  const activateUser = useAdminAction((id: string) => adminService.activateUser(id));

  // Notes state
  const [adminNote, setAdminNote] = useState(live ? '' : 'High-value consumer. Verified regular at Lekki and Ikeja corridors.');
  const [notesHistory, setNotesHistory] = useState<Array<{ id: string; text: string; author: string; time: string }>>([
    {
      id: 'n1',
      text: 'High-value consumer. Verified regular at Lekki and Ikeja corridors.',
      author: 'Super Admin (Ops Desk)',
      time: '2 days ago',
    },
    {
      id: 'n2',
      text: 'Biometric KYC Tier 1 confirmed via NIMC gateway and NIBSS API.',
      author: 'Compliance Desk',
      time: '14 days ago',
    },
    {
      id: 'n3',
      text: 'Phone number and device biometric credentials linked successfully.',
      author: 'Automated Service',
      time: '3 months ago',
    },
  ]);

  const selectedCustomer = useMemo(() => {
    const found = customers.find((c) => c.id === selectedCustomerId) ?? customers[0];
    if (!found || !live || !liveOverrides[found.id]) return found;
    const status = liveOverrides[found.id];
    return { ...found, status, restrictionStatus: status === 'Suspended' ? 'Suspended' : 'None' };
  }, [customers, selectedCustomerId, live, liveOverrides]);

  // Real visits only (the detail endpoint's other fields are placeholders).
  const activity = useAdminCustomerActivity(live && isProfileView ? selectedCustomer?.id : null);
  const liveHistory: AdminCustomer['activityHistory'] = (activity.data?.activityTimeline ?? []).map((a, idx) => ({
    id: `${a.time}-${idx}`,
    type: a.action.startsWith('Purchased') ? 'saved_deal' : 'nfc_tap',
    title: `${a.action} ${a.via}`,
    timestamp: a.time,
    description: a.via,
  }));
  const visitCount = activity.data?.stats?.totalVisits;

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (!live && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (clusterFilter !== 'all' && !c.cluster.toLowerCase().includes(clusterFilter.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && (!live || statusFilter === 'Dormant') && c.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [live, customers, searchQuery, clusterFilter, statusFilter]);

  const handleToggleCustomerStatus = (custId: string) => {
    if (live) {
      const target = customers.find((c) => c.id === custId);
      if (!target) return;
      const current = liveOverrides[custId] ?? target.status;
      const reactivating = current === 'Suspended';
      setActionError(null);
      (reactivating ? activateUser : suspendUser).mutate(custId, {
        onSuccess: () => {
          setLiveOverrides((prev) => ({ ...prev, [custId]: reactivating ? 'Active' : 'Suspended' }));
          setActionNotice(`Customer ${target.name} ${reactivating ? 'reactivated' : 'suspended'}.`);
          setTimeout(() => setActionNotice(null), 3500);
        },
        onError: (error) => setActionError(adminErrorMessage(error)),
      });
      return;
    }
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== custId) return c;
        const newStatus = c.status === 'Suspended' ? 'Active' : 'Suspended';
        setActionNotice(`Customer ${c.name} account status updated to ${newStatus}.`);
        setTimeout(() => setActionNotice(null), 3500);
        return {
          ...c,
          status: newStatus,
          restrictionStatus: newStatus === 'Suspended' ? 'Suspended (Admin Action)' : 'None (Clean standing)',
        };
      })
    );
  };

  const handleExportCsv = () => {
    const headers = [
      'Customer ID',
      'Code',
      'Name',
      'Email',
      'Phone',
      'Primary Cluster',
      'Status',
      'Loyalty Tier',
      'Lifetime Value',
      'Taps Recorded',
      'Saved Places',
      'Saved Deals',
      'Last Active',
    ];
    const rows = filteredCustomers.map((c) => [
      c.id,
      c.code,
      c.name,
      c.email,
      c.phone,
      c.cluster,
      c.status,
      c.tier,
      c.lifetimeValue,
      c.tapsRecorded,
      c.savedPlacesCount,
      c.savedDealsCount,
      c.lastActive,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vemtap-customers-directory-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportDossier = (cust: AdminCustomer) => {
    const dossierData = {
      customerProfile: {
        id: cust.id,
        code: cust.code,
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
        cluster: cust.cluster,
        status: cust.status,
        tier: cust.tier,
        memberSince: cust.memberSince,
        devicePlatform: cust.devicePlatform,
        restrictionStatus: cust.restrictionStatus,
        authRail: cust.authRail,
      },
      telemetryAndSpend: {
        tapsRecorded: cust.tapsRecorded,
        lifetimeValue: cust.lifetimeValue,
        purchasesCount: cust.purchasesCount,
        savedPlacesCount: cust.savedPlacesCount,
        savedDealsCount: cust.savedDealsCount,
        lastActive: cust.lastActive,
      },
      savedPlaces: cust.savedPlaces,
      claimedDeals: cust.claimedDeals,
      activityHistory: live ? liveHistory : cust.activityHistory,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(dossierData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dossier-${cust.code.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setActionNotice(`Dossier exported for ${cust.name} (${cust.code}).`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleAddNote = () => {
    if (!adminNote.trim()) return;
    const newEntry = {
      id: `n_${Date.now()}`,
      text: adminNote.trim(),
      author: 'Super Admin',
      time: 'Just now',
    };
    setNotesHistory((prev) => [newEntry, ...prev]);
    setActionNotice('Internal note added to customer dossier.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] w-full mx-auto pb-16">
      {/* Action Toast Notice */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[12px] flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
            <span className="font-medium">{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-600 hover:text-emerald-900 transition-colors p-1"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}
      {actionError && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-[12px] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-red-600">error</span>
            <span className="font-medium">{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-600 hover:text-red-900 transition-colors p-1">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL PAGE CUSTOMER PROFILE VIEW                                           */}
      {/* ========================================================================= */}
      {isProfileView && selectedCustomer ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Top Action Bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setIsProfileView(false)}
                className="h-9 px-3.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px] text-slate-500">arrow_back</span>
                <span>Back to All Customers</span>
              </button>

              <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-[12px]">
                <button
                  onClick={() => setIsProfileView(false)}
                  className="text-slate-400 hover:text-slate-700 font-medium transition-colors"
                >
                  Customers
                </button>
                <span className="text-slate-300">/</span>
                <span className="font-bold text-slate-900">{selectedCustomer.name}</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0055c4] font-mono font-semibold text-[11px] border border-blue-100">
                  {selectedCustomer.code}
                </span>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
              {/* Chat with Customer button (admin chat has no backend yet: mock mode only) */}
              {!live && (
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="bg-[#0055c4] hover:bg-[#066cf4] text-white px-3.5 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  <span>Chat with Customer</span>
                </button>
              )}

              {/* Suspend / Reactivate button */}
              <button
                disabled={suspendUser.isPending || activateUser.isPending}
                onClick={() => handleToggleCustomerStatus(selectedCustomer.id)}
                className={`disabled:opacity-50 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  selectedCustomer.status === 'Suspended'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    : 'bg-white hover:bg-red-50 text-red-600 border border-red-200'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {selectedCustomer.status === 'Suspended' ? 'check_circle' : 'block'}
                </span>
                <span>{selectedCustomer.status === 'Suspended' ? 'Reactivate Account' : 'Suspend Account'}</span>
              </button>

              {/* Export Dossier button */}
              <button
                onClick={() => handleExportDossier(selectedCustomer)}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-500">description</span>
                <span>Export Dossier</span>
              </button>
            </div>
          </div>

          {/* Full-Width Hero Header Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-100/50 via-indigo-50/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-wrap sm:flex-nowrap">
                <div className="relative shrink-0">
                  <div
                    className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-md ${
                      selectedCustomer.status === 'Suspended'
                        ? 'bg-gradient-to-tr from-red-600 to-red-400'
                        : 'bg-gradient-to-tr from-[#0055c4] to-[#066cf4]'
                    }`}
                  >
                    {selectedCustomer.initials}
                  </div>
                  <span
                    className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                      selectedCustomer.status === 'Suspended' ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                  </span>
                </div>

                <div className="min-w-0 space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {selectedCustomer.name}
                    </h1>
                    <span className="font-mono text-[12px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {selectedCustomer.code}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        selectedCustomer.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : selectedCustomer.status === 'Dormant'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {selectedCustomer.status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0055c4] text-[11px] font-bold border border-blue-100 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">workspace_premium</span>
                      {selectedCustomer.tier}
                    </span>
{!live && (
<>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                      <span className="material-symbols-outlined text-[14px] text-emerald-600">verified_user</span>
                      <span>Verified BVN / NIN</span>
                    </span>
</>
)}
                  </div>

                  {/* Direct Contact & Meta Info */}
                  <div className="flex items-center gap-4 text-[12px] text-slate-500 flex-wrap">
                    <a
                      href={`tel:${selectedCustomer.phone}`}
                      className="flex items-center gap-1.5 text-slate-700 hover:text-[#0055c4] font-medium transition-colors"
                      title="Direct Call"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#0055c4]">call</span>
                      <span>{selectedCustomer.phone}</span>
                    </a>
                    <span className="text-slate-300">•</span>
                    <a
                      href={`mailto:${selectedCustomer.email}`}
                      className="flex items-center gap-1.5 text-slate-700 hover:text-[#0055c4] font-medium transition-colors"
                      title="Direct Email"
                    >
                      <span className="material-symbols-outlined text-[16px] text-slate-400">mail</span>
                      <span>{selectedCustomer.email}</span>
                    </a>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="material-symbols-outlined text-[16px] text-[#0055c4]">location_on</span>
                      <span>Primary Cluster: <strong className="text-slate-900">{selectedCustomer.cluster}</strong></span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_month</span>
                      <span>Member Since: {selectedCustomer.memberSince}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Stat Badges on Right */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Lifetime Value
                  </span>
                  <span className="text-lg font-bold text-slate-900 mt-0.5 block">{selectedCustomer.lifetimeValue}</span>
                  <span className="text-[10px] text-slate-400">
                    {live ? 'Not tracked yet' : `${selectedCustomer.purchasesCount} Retail Purchases`}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {live ? 'Recent Visits' : 'Taps Recorded'}
                  </span>
                  <span className="text-lg font-bold text-[#0055c4] mt-0.5 block">
                    {live ? formatCount(visitCount) : selectedCustomer.tapsRecorded}
                  </span>
                  <span className="text-[10px] text-slate-400">{live ? 'Latest 5 shown' : 'NFC Interactions'}</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Saved Places & Deals
                  </span>
                  <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                    {live ? NONE : selectedCustomer.savedPlacesCount + selectedCustomer.savedDealsCount}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {live ? 'Not available yet' : `${selectedCustomer.savedPlacesCount} Hubs • ${selectedCustomer.savedDealsCount} Vouchers`}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Account Standing
                  </span>
                  <span
                    className={`text-sm font-bold mt-1 block truncate ${
                      selectedCustomer.status === 'Suspended' ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    {selectedCustomer.restrictionStatus}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {live ? `Last sign-in ${selectedCustomer.lastActive}` : `Active ${selectedCustomer.activeDays} Days`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5 Tab Navigation Strip */}
          <div className="bg-white rounded-xl p-1.5 border border-slate-200/80 shadow-2xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {[
              { id: 'profile' as CustomerTab, label: 'Profile & Identity', icon: 'badge' },
              { id: 'wallet' as CustomerTab, label: 'Wallet & Ledger', icon: 'account_balance_wallet' },
              { id: 'saved' as CustomerTab, label: 'Saved Places & Deals', icon: 'bookmark' },
              { id: 'history' as CustomerTab, label: 'Tap & Visit History', icon: 'history' },
              { id: 'support' as CustomerTab, label: 'Support & Admin Notes', icon: 'support_agent' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-10 px-4 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#0055c4] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[17px] ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: Profile & Identity */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-12 gap-6 animate-in fade-in duration-150">
              {/* Personal Details */}
              <div className="col-span-12 lg:col-span-6 bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#0055c4]">person</span>
                    <h3 className="font-bold text-[14px] text-slate-900">Personal & Contact Identification</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0055c4] text-[10px] font-bold">
                    Section 01
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[12px]">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium block">Full Legal Name</span>
                    <span className="font-semibold text-slate-900 text-[13px] mt-0.5 block">{selectedCustomer.name}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium block">Consumer Identifier</span>
                    <span className="font-mono font-semibold text-slate-900 text-[13px] mt-0.5 block">
                      {selectedCustomer.code}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium block">Mobile Phone</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-semibold text-slate-900 text-[13px]">{selectedCustomer.phone}</span>
{!live && (
<>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                        SMS OTP Active
                      </span>
</>
)}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium block">Email Address</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-semibold text-slate-900 text-[13px] truncate">{selectedCustomer.email}</span>
{!live && (
<>
                      <span className="text-[10px] text-[#0055c4] font-bold bg-blue-50 px-1.5 py-0.2 rounded">
                        Verified
                      </span>
</>
)}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium block">Primary Commercial Hub</span>
                    <span className="font-semibold text-slate-900 text-[13px] mt-0.5 block">
                      {selectedCustomer.cluster}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium block">Registration Date & Tenure</span>
                    <span className="font-semibold text-slate-900 text-[13px] mt-0.5 block">
                      {selectedCustomer.memberSince}
                    </span>
                  </div>
                </div>
              </div>

              {/* Compliance & Verification */}
              <div className="col-span-12 lg:col-span-6 bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
                    <h3 className="font-bold text-[14px] text-slate-900">KYC & Compliance Verification</h3>
                  </div>
                  {!live && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      Tier 1 Verified
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[12px]">
{!live && (
<>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium block">National Identity (NIN)</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                      <span className="font-semibold text-slate-900">Linked & Biometric Validated</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium block">Bank Verification (BVN)</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                      <span className="font-semibold text-slate-900">NIBSS API Matched (99.8%)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium block">Daily POS Tap Limit</span>
                    <span className="font-semibold text-slate-900 text-[13px] mt-0.5 block">₦500,000 / day</span>
                    <span className="text-[10px] text-slate-400">Tier 1 Consumer Standard Limit</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium block">AML & Sanctions Screening</span>
                    <span className="font-semibold text-emerald-700 text-[13px] mt-0.5 block">
                      Low Risk (0 Flags)
                    </span>
                    <span className="text-[10px] text-slate-400">Clean standing across platform</span>
                  </div>
</>
)}

                  <div className="col-span-1 sm:col-span-2 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Account Standing & Restriction</span>
                      <span className="font-semibold text-slate-900 text-[13px] mt-0.5 block">
                        {selectedCustomer.restrictionStatus}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                        selectedCustomer.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {selectedCustomer.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hardware Device & Platform Telemetry */}
              <div className="col-span-12 bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#0055c4]">devices</span>
                    <h3 className="font-bold text-[14px] text-slate-900">Client Device Platform & Connectivity</h3>
                  </div>
                  <span className="text-[11px] text-slate-400">Hardware Fingerprint</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-[12px]">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium block">Registered Hardware</span>
                    <span className="font-semibold text-slate-800 text-[13px] mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-slate-500">smartphone</span>
                      {selectedCustomer.devicePlatform}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium block">Authentication Protocol</span>
                    <span className="font-semibold text-slate-800 text-[13px] mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-[#0055c4]">fingerprint</span>
                      {selectedCustomer.authRail}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium block">NFC Hardware Spec</span>
                    <span className="font-semibold text-slate-800 text-[13px] mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-emerald-600">contactless</span>
                      {live ? NONE : 'ISO 14443 Type-A / FeliCa'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium block">{live ? 'Last Sign-in' : 'Last Network Handshake'}</span>
                    <span className="font-semibold text-slate-800 text-[13px] mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">wifi</span>
                      {selectedCustomer.lastActive}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Wallet & Ledger */}
          {activeTab === 'wallet' && live && (
            <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm text-[12px] text-slate-500">
              Customer wallet balances, payment instruments and transaction ledgers aren't available to platform admins yet.
            </div>
          )}
          {activeTab === 'wallet' && !live && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Gross Lifetime Value</span>
                    <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[17px]">payments</span>
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-2">{selectedCustomer.lifetimeValue}</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Across {selectedCustomer.purchasesCount} in-store transactions
                  </span>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">V-Points Loyalty Bal</span>
                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#0055c4] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[17px]">stars</span>
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-[#0055c4] mt-2">1,420 pts</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Worth ₦7,100 at merchant checkout</span>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Stored Escrow Balance</span>
                    <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[17px]">account_balance_wallet</span>
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-2">₦12,450.00</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Ready for 1-Tap NFC Checkout</span>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Average Order Value</span>
                    <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[17px]">trending_up</span>
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-2">₦7,308.80</div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">+14.2% higher than cluster avg</span>
                </div>
              </div>

              {/* Connected Payment Instruments */}
              <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-[13px] text-slate-900">Connected Payment Instruments & Rails</h3>
                  <span className="text-[11px] text-slate-400">Tokenized & PCI-DSS Scoped</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[12px]">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#0055c4] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">contactless</span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block">VEMTAP NFC Tokenizer</span>
                      <span className="text-[11px] text-slate-500 font-mono">#VMT-NFC-7719 • Active</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">credit_card</span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block">Mastercard (Debit)</span>
                      <span className="text-[11px] text-slate-500">•••• 4812 • GTBank Nigeria</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">account_balance</span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block">NIBSS Virtual Account</span>
                      <span className="text-[11px] text-slate-500">Providus Bank •••• 9920</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Ledger Table */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[13px] text-slate-900">Recent Consumer Transaction Ledger</h3>
                    <p className="text-[11px] text-slate-500">Synchronized with terminal switch feeds</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                    All Settled
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12px]">
                    <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Transaction Reference</th>
                        <th className="py-2.5 px-4">Merchant & Terminal</th>
                        <th className="py-2.5 px-3">Date & Time</th>
                        <th className="py-2.5 px-3">Payment Rail</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        {
                          ref: '#TXN-8821-IKJ',
                          merchant: 'Slot Electronics Flagship',
                          terminal: 'POS-IKJ-04 (Ikeja)',
                          time: 'Today, 14:12 WAT',
                          rail: 'Contactless NFC',
                          amount: '₦52,000.00',
                          status: 'Settled',
                        },
                        {
                          ref: '#TXN-8740-LEK',
                          merchant: 'Chicken Republic Admiralty',
                          terminal: 'POS-ADMR-02 (Lekki)',
                          time: 'Yesterday, 19:42 WAT',
                          rail: '1-Tap Deal Voucher',
                          amount: '₦4,800.00',
                          status: 'Settled',
                        },
                        {
                          ref: '#TXN-8612-LEK',
                          merchant: 'Medplus Pharmacy Network',
                          terminal: 'POS-MED-01 (VI)',
                          time: '4 days ago',
                          rail: 'NFC Virtual Card',
                          amount: '₦18,200.00',
                          status: 'Settled',
                        },
                        {
                          ref: '#TXN-8409-VI',
                          merchant: 'Mega Plaza Century Mall',
                          terminal: 'POS-MP-08 (VI)',
                          time: '12 days ago',
                          rail: 'QR Pay Escrow',
                          amount: '₦34,500.00',
                          status: 'Settled',
                        },
                      ].map((tx) => (
                        <tr key={tx.ref} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-semibold text-slate-800">{tx.ref}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-900 block">{tx.merchant}</span>
                            <span className="text-[11px] text-slate-400">{tx.terminal}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-600">{tx.time}</td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-[#0055c4] text-[10px] font-bold">
                              {tx.rail}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">{tx.amount}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Saved Places & Deals */}
          {activeTab === 'saved' && live && (
            <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm text-[12px] text-slate-500">
              Saved places and claimed deals aren't available to platform admins yet.
            </div>
          )}
          {activeTab === 'saved' && !live && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Saved Businesses Section */}
              <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#0055c4]">storefront</span>
                    <h3 className="font-bold text-[14px] text-slate-900">
                      Saved Businesses & Venues ({selectedCustomer.savedPlaces.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => onNavigate('/admin/businesses')}
                    className="text-[12px] text-[#0055c4] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Manage All Businesses</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedCustomer.savedPlaces.map((sp, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-200 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0055c4] to-[#066cf4] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                          {sp.initial}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-[13px] truncate">{sp.name}</h4>
                          <span className="text-[11px] text-slate-500 block">{sp.cluster}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0055c4] font-bold">
                          {sp.claimedDeals} Deal{sp.claimedDeals > 1 ? 's' : ''} Claimed
                        </span>
                        <button
                          onClick={() => onNavigate('/admin/businesses')}
                          className="text-[#0055c4] hover:text-[#066cf4] font-semibold flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>View Biz</span>
                          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Claimed Deals & Vouchers Section */}
              <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#0055c4]">local_activity</span>
                    <h3 className="font-bold text-[14px] text-slate-900">
                      Claimed Vouchers & Active Deals ({selectedCustomer.claimedDeals.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => onNavigate('/admin/deals')}
                    className="text-[12px] text-[#0055c4] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Inspect Deals Catalog</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedCustomer.claimedDeals.map((cd, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[17px]">confirmation_number</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-[13px]">{cd.title}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {cd.expiresIn ? `Expires in ${cd.expiresIn}` : 'No expiration • Ready for in-store tap'}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-200 shrink-0">
                          {cd.status}
                        </span>
                      </div>

                      <div className="p-2.5 bg-white rounded-lg border border-dashed border-slate-300 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Voucher Passcode</span>
                          <span className="font-mono font-bold text-slate-900 text-[12px]">{cd.voucher}</span>
                        </div>
                        <span className="material-symbols-outlined text-[20px] text-slate-400">qr_code_2</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Tap & Visit History */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Telemetry Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0055c4] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">contactless</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Physical Taps</span>
                    <span className="text-xl font-bold text-slate-900">
                      {live ? `${formatCount(visitCount)} recent visits` : `${selectedCustomer.tapsRecorded} NFC Swipes`}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">POS Signal Integrity</span>
                    <span className="text-xl font-bold text-emerald-700">{live ? NONE : '100% Authenticated'}</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">schedule</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">Most Active Window</span>
                    <span className="text-xl font-bold text-slate-900">{live ? NONE : '13:00 – 16:00 WAT'}</span>
                  </div>
                </div>
              </div>

              {/* Chronological Activity Feed */}
              <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#0055c4]">history</span>
                    <h3 className="font-bold text-[14px] text-slate-900">
                      Chronological Tap & Foot-Traffic Telemetry
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">Hardware Switch Audit Log</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {live && liveHistory.length === 0 && (
                    <p className="py-4 text-[12px] text-slate-500">
                      {activity.isLoading ? 'Loading visits…' : activity.isError ? "Couldn't load visits." : 'No visits recorded yet.'}
                    </p>
                  )}
                  {(live ? liveHistory : selectedCustomer.activityHistory).map((act) => (
                    <div key={act.id} className="py-3.5 flex items-start gap-3 text-[12px]">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          act.type === 'nfc_tap'
                            ? 'bg-blue-50 text-[#0055c4]'
                            : act.type === 'qr_scan'
                            ? 'bg-emerald-50 text-emerald-700'
                            : act.type === 'search'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {act.type === 'nfc_tap'
                            ? 'contactless'
                            : act.type === 'qr_scan'
                            ? 'qr_code_scanner'
                            : act.type === 'search'
                            ? 'travel_explore'
                            : 'bookmark_added'}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-bold text-slate-900 text-[13px]">{act.title}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{act.timestamp}</span>
                        </div>
                        <p className="text-[12px] text-slate-600 mt-0.5">{act.description}</p>
                        {act.amount && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                              <span>Amount Settled:</span>
                              <span>{act.amount}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Support & Admin Notes */}
          {activeTab === 'support' && (
            <div className="space-y-6 animate-in fade-in duration-150">
{!live && (
<>
              {/* Quick Communication & Chat Prompt Banner */}
              <div className="bg-gradient-to-r from-blue-900 to-[#0055c4] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-blue-200">chat_bubble</span>
                    <h3 className="font-bold text-base">Direct Customer Inquiries & Real-Time Chat</h3>
                  </div>
                  <p className="text-[12px] text-blue-100 max-w-xl">
                    Dispatch notifications or engage in live customer support directly through the VEMTAP consumer app messaging bridge.
                  </p>
                </div>
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="bg-white hover:bg-blue-50 text-[#0055c4] font-bold px-4 py-2 rounded-xl text-[12px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  <span>Launch Chat Session</span>
                </button>
              </div>
</>
)}

              {/* Admin Notes Section (notes are not stored by the backend yet: mock mode only) */}
              {live && (
                <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm text-[12px] text-slate-500">
                  Internal admin notes can't be saved yet: there is no backend for them.
                </div>
              )}
              {!live && (
              <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#0055c4]">note_alt</span>
                    <h3 className="font-bold text-[14px] text-slate-900">Internal Administrative Dossier Notes</h3>
                  </div>
                  <span className="text-[11px] text-slate-400">Strictly Confidential (Admins Only)</span>
                </div>

                {/* New Note Form */}
                <div className="space-y-2">
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Enter observations, support notes, or risk assessment remarks regarding this consumer..."
                    rows={3}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0055c4] transition-all"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddNote}
                      className="px-4 py-1.5 rounded-lg bg-[#0055c4] hover:bg-[#066cf4] text-white text-[12px] font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">save</span>
                      <span>Save Internal Note</span>
                    </button>
                  </div>
                </div>

                {/* Note Log History */}
                <div className="pt-2 space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Recorded Log History
                  </span>
                  {notesHistory.map((n) => (
                    <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[12px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{n.author}</span>
                        <span className="text-[11px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-slate-600">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Administrative Governance Actions */}
              <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                <h3 className="font-bold text-[13px] text-slate-900">Governance & Security Interventions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
{!live && (
<>
                  <button
                    onClick={() => {
                      setActionNotice('Device authentication tokens revoked. Consumer will be prompted for OTP on next launch.');
                      setTimeout(() => setActionNotice(null), 3500);
                    }}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-slate-800 block">Revoke Active Device Tokens</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Forces session re-auth via SMS OTP</span>
                  </button>

                  <button
                    onClick={() => {
                      setActionNotice('500 goodwill loyalty points credited to consumer account.');
                      setTimeout(() => setActionNotice(null), 3500);
                    }}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-slate-800 block">Issue Goodwill V-Points</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Dispatches 500 promotional loyalty points</span>
                  </button>
</>
)}

                  <button
                    disabled={suspendUser.isPending || activateUser.isPending}
                    onClick={() => handleToggleCustomerStatus(selectedCustomer.id)}
                    className={`disabled:opacity-50 p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      selectedCustomer.status === 'Suspended'
                        ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                        : 'bg-red-50 hover:bg-red-100 border-red-200'
                    }`}
                  >
                    <span
                      className={`font-bold block ${
                        selectedCustomer.status === 'Suspended' ? 'text-emerald-800' : 'text-red-700'
                      }`}
                    >
                      {selectedCustomer.status === 'Suspended' ? 'Reactivate Account' : 'Suspend Account'}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {selectedCustomer.status === 'Suspended' ? 'Restores full in-store tap access' : 'Locks POS tap execution'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Admin Chat Modal */}
          <AdminChatModal
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            recipientName={selectedCustomer.name}
            recipientType="customer"
            recipientSubtitle={`${selectedCustomer.phone} • ${selectedCustomer.cluster}`}
            recipientInitials={selectedCustomer.initials}
          />
        </div>
      ) : (
        /* ========================================================================= */
        /* FULL-WIDTH REGISTERED CONSUMERS TABLE VIEW (isProfileView === false)      */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Module Title & Quick Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Module 02 • Customer Intelligence
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-[12px] text-slate-400">{live ? 'Live registry' : 'Real-Time Registry Feed (Sync 14s ago)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setClusterFilter('all');
                  setStatusFilter('all');
                  setJoinedFilter('all');
                  setSearchQuery('');
                  setPage(1);
                }}
                className="h-8 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-medium transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-slate-400">tune</span>
                <span>Reset Filters</span>
              </button>
              <button
                onClick={handleExportCsv}
                className="h-8 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-medium transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-slate-400">file_download</span>
                <span>Export Directory (CSV)</span>
              </button>
            </div>
          </div>

          {/* Hero & Top 4 KPI Cards */}
          <div className="grid grid-cols-12 gap-4">
            {/* Hero Card */}
            <div className="col-span-12 lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-blue-100/50 blur-2xl pointer-events-none"></div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-[#0055c4] text-[10px] font-bold uppercase tracking-wider mb-2 border border-blue-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0055c4]"></span>
                  <span>CONSUMER DIRECTORY</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Customers & Consumer Accounts
                </h1>
                <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                  Platform-wide consumer directory, engagement telemetry, saved places, and customer activity history across commercial clusters.
                </p>
              </div>
{!live && (
<>
              <div className="pt-4 mt-4 flex items-center gap-4 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Coverage</span>
                  <span className="font-bold text-[14px] text-slate-900">4 Hubs</span>
                </div>
                <div className="w-px h-7 bg-slate-200"></div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">NFC Hardware Taps</span>
                  <span className="font-bold text-[14px] text-[#0055c4]">84.6k mtd</span>
                </div>
                <div className="w-px h-7 bg-slate-200"></div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Platform Index</span>
                  <span className="font-bold text-[14px] text-slate-900">99.98%</span>
                </div>
              </div>
</>
)}
            </div>

            {/* 4 Cards */}
            <div className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Customers</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-[#0055c4]">
                    <span className="material-symbols-outlined text-[16px]">group</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">{live ? formatCount(allCount) : '142,850'}</div>
                  {!live && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[#0055c4] text-[14px]">trending_up</span>
                      <span className="text-[11px] font-semibold text-[#0055c4]">+12.4%</span>
                      <span className="text-[11px] text-slate-400">MoM</span>
                    </div>
                  )}
                </div>
                {!live && (
                  <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                    <div className="bg-[#0055c4] h-full w-[88%] rounded-full"></div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{live ? 'Active Accounts' : 'Active This Month'}</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-[#066cf4]">
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">{live ? formatCount(activeCount) : '98,240'}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-emerald-600 text-[14px]">check_circle</span>
                    <span className="text-[11px] font-semibold text-emerald-600">
                      {live
                        ? allCount && activeCount !== undefined
                          ? `${Math.round((activeCount / allCount) * 100)}%`
                          : NONE
                        : '68.7%'}
                    </span>
                    <span className="text-[11px] text-slate-400">actives</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-[#066cf4] h-full rounded-full"
                    style={{ width: live ? `${allCount && activeCount !== undefined ? Math.round((activeCount / allCount) * 100) : 0}%` : '68%' }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{live ? 'Suspended Accounts' : 'Total Saved Items'}</span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <span className="material-symbols-outlined text-[16px]">bookmark_added</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">{live ? formatCount(suspendedCount) : '348,900'}</div>
                  {!live && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[11px] font-bold text-slate-800">2.44</span>
                      <span className="text-[11px] text-slate-400">saved items / user</span>
                    </div>
                  )}
                </div>
                {!live && (
                <div className="mt-3 h-3 w-full flex items-center">
                  <svg className="w-full h-full text-[#0055c4]" fill="none" preserveAspectRatio="none" viewBox="0 0 100 20">
                    <path d="M0,16 Q20,18 35,9 T70,12 T100,2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
                  </svg>
                </div>
                )}
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Repeat In-Store Visits</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">{live ? NONE : '64.2%'}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-emerald-600 text-[14px]">storefront</span>
                    <span className="text-[11px] text-slate-400">{live ? 'Not tracked yet' : 'across merchant nodes'}</span>
                  </div>
                </div>
                {!live && (
                  <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[64.2%] rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Query Matrix & Cluster Filters */}
          <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 flex-wrap xl:flex-nowrap">
              <div className="relative flex-1 min-w-[240px]">
                <span className="material-symbols-outlined absolute left-3 top-2 text-[17px] text-slate-400">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder={live ? 'Filter by customer name or email...' : 'Filter by customer name, phone, email, or customer ID...'}
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-[12px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0055c4] transition-all"
                />
              </div>

{!live && (
<>
              {/* Cluster Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-[11px] font-medium overflow-x-auto">
                {[
                  { id: 'all', label: 'All Hubs' },
                  { id: 'Lekki', label: 'Lagos Lekki' },
                  { id: 'Ikeja', label: 'Ikeja' },
                  { id: 'Wuse', label: 'Abuja Wuse' },
                  { id: 'PH', label: 'Port Harcourt' },
                  { id: 'Kano', label: 'Kano' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setClusterFilter(p.id)}
                    className={`h-7 px-2.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                      clusterFilter === p.id
                        ? 'bg-white text-slate-900 font-bold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
</>
)}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 pl-3 pr-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-[12px] appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="all">Status: All Accounts</option>
                  <option value="Active">Active</option>
                  <option value="Dormant">Dormant</option>
                  <option value="Suspended">Suspended</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[15px] text-slate-400 pointer-events-none">
                  expand_more
                </span>
              </div>

{!live && (
<>
              <div className="relative">
                <select
                  value={joinedFilter}
                  onChange={(e) => setJoinedFilter(e.target.value)}
                  className="h-9 pl-3 pr-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-[12px] appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="all">Joined: Any Period</option>
                  <option value="week">This Week</option>
                  <option value="month">Last 30 Days</option>
                  <option value="q1">Q1 2024</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[15px] text-slate-400 pointer-events-none">
                  calendar_today
                </span>
              </div>
</>
)}
            </div>
          </div>

          {/* Full-Width Consumers Table (col-span-12) */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 flex items-center justify-between bg-slate-50/70 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-[14px] text-slate-900">Registered Consumers</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0055c4] text-[10px] font-bold border border-blue-100">
                  {live ? formatCount(liveTotal) : '142,850'} Records
                </span>
              </div>
              <span className="text-slate-400 text-[12px]">Filtered Results: {filteredCustomers.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">
                    <th className="py-3 px-4">Customer Name & Code</th>
                    <th className="py-3 px-4">Contact (Phone & Email)</th>
                    <th className="py-3 px-3">Primary Cluster</th>
                    <th className="py-3 px-2.5">Status</th>
                    <th className="py-3 px-3">Tier</th>
                    <th className="py-3 px-3">Lifetime Value</th>
                    <th className="py-3 px-3">Total Taps</th>
                    <th className="py-3 px-3">Saved Places & Deals</th>
                    <th className="py-3 px-3">Last Active</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {live && filteredCustomers.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-8 px-4 text-center text-slate-500">
                        {liveQuery.isLoading
                          ? 'Loading customers…'
                          : liveQuery.isError
                            ? `Couldn't load customers: ${adminErrorMessage(liveQuery.error)}`
                            : 'No customers match these filters.'}
                      </td>
                    </tr>
                  )}
                  {filteredCustomers.map((cust) => {
                    const isSelected = selectedCustomer?.id === cust.id;
                    return (
                      <tr
                        key={cust.id}
                        onClick={() => {
                          setSelectedCustomerId(cust.id);
                          setIsProfileView(true);
                        }}
                        className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        {/* 1. Customer Name & Code */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[12px] shrink-0 ${
                                cust.status === 'Suspended'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gradient-to-tr from-[#0055c4] to-[#066cf4] text-white shadow-2xs'
                              }`}
                            >
                              {cust.initials}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 truncate flex items-center gap-1.5">
                                <span>{cust.name}</span>
                                {cust.status === 'Active' && (
                                  <span className="material-symbols-outlined text-[#0055c4] text-[15px]" title="Active Verified">
                                    verified
                                  </span>
                                )}
                              </div>
                              <div className="font-mono text-[11px] text-slate-400 truncate">{cust.code}</div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Contact */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="text-slate-800 font-medium">{cust.phone}</div>
                          <div className="text-[11px] text-slate-400 truncate">{cust.email}</div>
                        </td>

                        {/* 3. Primary Cluster */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                cust.status === 'Suspended' ? 'bg-red-500' : 'bg-[#0055c4]'
                              }`}
                            ></span>
                            {cust.cluster}
                          </span>
                        </td>

                        {/* 4. Status */}
                        <td className="py-3.5 px-2.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              cust.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : cust.status === 'Dormant'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {cust.status}
                          </span>
                        </td>

                        {/* 5. Tier */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="text-[11px] font-bold text-[#0055c4] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {cust.tier}
                          </span>
                        </td>

                        {/* 6. Lifetime Value */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="font-bold text-slate-900">{cust.lifetimeValue}</span>
                          {!live && <span className="text-[10px] text-slate-400 block">{cust.purchasesCount} orders</span>}
                        </td>

                        {/* 7. Total Taps Recorded */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-[#0055c4] font-bold">
                            <span className="material-symbols-outlined text-[15px]">contactless</span>
                            <span>{live ? NONE : cust.tapsRecorded}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">NFC interactions</span>
                        </td>

                        {/* 8. Saved Places & Deals */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{live ? NONE : `${cust.savedPlacesCount} Places`}</div>
                          {!live && <div className="text-[11px] text-slate-400">{cust.savedDealsCount} Deals</div>}
                        </td>

                        {/* 9. Last Active */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                          {cust.lastActive}
                        </td>

                        {/* 10. Action: Open Profile Button */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCustomerId(cust.id);
                              setIsProfileView(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-[#0055c4] text-[#0055c4] hover:text-white font-semibold text-[11px] inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer group"
                          >
                            <span>Open Profile</span>
                            <span className="material-symbols-outlined text-[14px] transition-transform group-hover:translate-x-0.5">
                              arrow_forward
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
              <span>
                Displaying {filteredCustomers.length} of {live ? formatCount(liveTotal) : '142,850'}{' '}
                {live ? 'customer accounts' : 'verified consumer accounts'}
              </span>
              {live ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">chevron_left</span>
                  </button>
                  <span className="px-2 text-slate-700 font-semibold">
                    Page {page} of {lastPage}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    disabled={page >= lastPage}
                    className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">chevron_right</span>
                  </button>
                </div>
              ) : (
              <div className="flex items-center gap-1">
                <button
                  className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center disabled:opacity-40"
                  disabled
                >
                  <span className="material-symbols-outlined text-[15px]">chevron_left</span>
                </button>
                <button className="w-7 h-7 rounded bg-[#0055c4] text-white font-bold flex items-center justify-center">
                  1
                </button>
                <button className="w-7 h-7 rounded bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50">
                  2
                </button>
                <button className="w-7 h-7 rounded bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50">
                  <span className="material-symbols-outlined text-[15px]">chevron_right</span>
                </button>
              </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
