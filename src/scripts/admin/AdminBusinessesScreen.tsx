import { useState, useMemo } from 'react';
import { ADMIN_BUSINESSES, type AdminBusiness } from './adminData';
import { AdminChatModal } from './AdminChatModal';

interface AdminBusinessesScreenProps {
  onNavigate: (path: string) => void;
}

export function AdminBusinessesScreen({ onNavigate }: AdminBusinessesScreenProps) {
  const [businesses, setBusinesses] = useState<AdminBusiness[]>(ADMIN_BUSINESSES);
  const [selectedBusiness, setSelectedBusiness] = useState<AdminBusiness | null>(ADMIN_BUSINESSES[0]);
  const [isProfileView, setIsProfileView] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'info' | 'branches' | 'staff' | 'catalogue' | 'status' | 'subscription' | 'qr'
  >('overview');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [clusterFilter, setClusterFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          b.name.toLowerCase().includes(q) ||
          b.slug.toLowerCase().includes(q) ||
          b.cacRc.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (categoryFilter && !b.category.toLowerCase().includes(categoryFilter.toLowerCase())) {
        return false;
      }
      if (clusterFilter && !b.cluster.toLowerCase().includes(clusterFilter.toLowerCase())) {
        return false;
      }
      if (statusFilter && b.complianceStatus !== statusFilter) {
        return false;
      }
      if (tierFilter && !b.tier.toLowerCase().includes(tierFilter.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [businesses, searchQuery, categoryFilter, clusterFilter, statusFilter, tierFilter]);

  const handleOpenProfile = (biz: AdminBusiness) => {
    setSelectedBusiness(biz);
    setIsProfileView(true);
  };

  const handleToggleStatus = (bizId: string) => {
    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id !== bizId) return b;
        const newStatus = b.complianceStatus === 'Suspended' ? 'Verified' : 'Suspended';
        setActionNotice(`Business "${b.name}" status updated to ${newStatus}.`);
        setTimeout(() => setActionNotice(null), 3000);
        return {
          ...b,
          complianceStatus: newStatus,
        };
      })
    );
    if (selectedBusiness?.id === bizId) {
      setSelectedBusiness((prev) =>
        prev
          ? {
              ...prev,
              complianceStatus: prev.complianceStatus === 'Suspended' ? 'Verified' : 'Suspended',
            }
          : null
      );
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setClusterFilter('');
    setStatusFilter('');
    setTierFilter('');
  };

  const handleExportCsv = () => {
    const headers = ['Name', 'Slug', 'Category', 'Tier', 'CAC RC', 'TIN', 'Cluster', 'Branches', 'Staff', 'Status', 'GMV'];
    const rows = filteredBusinesses.map((b) => [
      b.name,
      b.slug,
      b.category,
      b.tier,
      b.cacRc,
      b.tin,
      b.cluster,
      b.branchCount,
      b.staffCount,
      b.complianceStatus,
      b.monthlyGmv,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vemtap-businesses-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // FULL PAGE BUSINESS PROFILE VIEW
  if (isProfileView && selectedBusiness) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        {actionNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[12px] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] text-emerald-600">check_circle</span>
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
              <span className="material-symbols-outlined text-[15px]">close</span>
            </button>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsProfileView(false)}
              className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-[12px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to All Businesses</span>
            </button>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-[12px]">
              <button
                onClick={() => setIsProfileView(false)}
                className="text-slate-500 hover:text-[#0055c4] font-medium transition-colors cursor-pointer"
              >
                Businesses
              </button>
              <span className="text-slate-400">&gt;</span>
              <span className="font-bold text-slate-900">{selectedBusiness.name}</span>
              <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded border border-slate-200 ml-1">
                {selectedBusiness.cacRc}
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-[#0055c4] hover:bg-[#066cf4] text-white px-3.5 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">forum</span>
              <span>Chat with Business</span>
            </button>

            <button
              onClick={() => handleToggleStatus(selectedBusiness.id)}
              className={`h-8 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                selectedBusiness.complianceStatus === 'Suspended'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {selectedBusiness.complianceStatus === 'Suspended' ? 'check_circle' : 'block'}
              </span>
              <span>
                {selectedBusiness.complianceStatus === 'Suspended' ? 'Reinstate Business' : 'Suspend Account'}
              </span>
            </button>

            <button
              onClick={() => window.print()}
              className="h-8 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[12px] font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">print</span>
              <span>Print Certificate</span>
            </button>
          </div>
        </div>

        {/* Prominent Business Identity Header */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-[#0055c4] to-[#066cf4] text-white flex items-center justify-center shadow-md shrink-0">
                <span className="material-symbols-outlined text-[32px]">
                  {selectedBusiness.category.includes('Electronics')
                    ? 'devices'
                    : selectedBusiness.category.includes('Pharma')
                    ? 'local_pharmacy'
                    : selectedBusiness.category.includes('Dining')
                    ? 'restaurant'
                    : 'storefront'}
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {selectedBusiness.name}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                      selectedBusiness.complianceStatus === 'Verified'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : selectedBusiness.complianceStatus === 'Under Review'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : selectedBusiness.complianceStatus === 'Suspended'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedBusiness.complianceStatus === 'Verified'
                          ? 'bg-emerald-500'
                          : selectedBusiness.complianceStatus === 'Under Review'
                          ? 'bg-amber-500'
                          : selectedBusiness.complianceStatus === 'Suspended'
                          ? 'bg-red-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    {selectedBusiness.complianceStatus}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-[#0055c4] px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border border-blue-100">
                    <span className="material-symbols-outlined text-[13px]">diamond</span>
                    {selectedBusiness.tier}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 font-medium">CAC RC:</span>
                    <span className="font-semibold text-slate-800">{selectedBusiness.cacRc}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 font-medium">TIN:</span>
                    <span className="font-semibold text-slate-800">{selectedBusiness.tin}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">hub</span>
                    <span className="text-slate-700">Cluster: <strong>{selectedBusiness.cluster}</strong></span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">link</span>
                    <span className="text-[#0055c4] font-medium">vem.tap/{selectedBusiness.slug}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-slate-500 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">mail</span>
                    <span>{selectedBusiness.owner.email}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">call</span>
                    <span>{selectedBusiness.owner.phone}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">location_on</span>
                    <span className="text-slate-700">{selectedBusiness.hqAddress}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex lg:flex-col items-center lg:items-end justify-between gap-1 shrink-0 bg-slate-50 lg:bg-transparent p-4 lg:p-0 rounded-xl border lg:border-none border-slate-100">
              <div className="text-2xl sm:text-3xl font-bold text-[#0055c4]">{selectedBusiness.monthlyGmv}</div>
              <div className="text-[12px] text-slate-400 font-medium">30-Day Platform GMV</div>
            </div>
          </div>
        </div>

        {/* 8 In-Depth Specification Tabs Navigation */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-1.5 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {[
              { id: 'overview', label: '1. Overview' },
              { id: 'info', label: '2. Business Information' },
              { id: 'branches', label: `3. Branches (${selectedBusiness.branchCount})` },
              { id: 'staff', label: `4. Staff (${selectedBusiness.staffCount})` },
              { id: 'catalogue', label: `5. Products & Catalogue (${selectedBusiness.catalogue.length || 142})` },
              { id: 'status', label: '6. Account Status' },
              { id: 'subscription', label: '7. Subscription Details' },
              { id: 'qr', label: '8. Business QR Assets' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`h-9 px-4 rounded-lg text-[12px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#0055c4] text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB PANES CONTAINER - FULL WIDTH */}
        <div className="w-full">
          {/* 1. OVERVIEW PANE */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">
              {/* Quick KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-medium">Active Tap POS Terminals</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{selectedBusiness.posCount} Units</div>
                  <div className="text-[10px] font-bold text-[#0055c4] uppercase mt-1">
                    {selectedBusiness.uptime} Uptime
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-medium">Avg Daily Orders</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {selectedBusiness.dailyOrders} Orders
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase mt-1">+14.2% this wk</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-medium">Live Discount Deals</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {selectedBusiness.activeDeals} Flash Deals
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">VEMTAP Discovery</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-medium">Customer Retention</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{selectedBusiness.retention}</div>
                  <div className="text-[10px] font-bold text-[#0055c4] uppercase mt-1">Tier-1 Rating</div>
                </div>
              </div>

              {/* Summary & Operating Schedule */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
                  <h3 className="font-bold text-[15px] text-slate-900">Store Profile & Operating Hours</h3>
                  <p className="text-[13px] text-slate-600 leading-relaxed">
                    {selectedBusiness.name} operates as a vetted high-volume commercial hub in{' '}
                    {selectedBusiness.cluster}. Linked with direct inventory integration and instant contactless NFC
                    tap checkouts.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Monday - Friday</div>
                      <div className="text-[13px] font-semibold text-slate-800 mt-1">
                        {selectedBusiness.operatingHours.weekdays}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Saturdays</div>
                      <div className="text-[13px] font-semibold text-slate-800 mt-1">
                        {selectedBusiness.operatingHours.saturdays}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Sunday Service</div>
                      <div className="text-[13px] font-semibold text-red-600 mt-1">
                        {selectedBusiness.operatingHours.sundays}
                      </div>
                    </div>
                  </div>

                  {/* Inline Sparkline Trend Visual */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-slate-500 font-medium">Weekly In-Store Footfall & POS Taps</span>
                      <span className="text-[11px] font-semibold text-[#0055c4]">Peak: Friday 16:00</span>
                    </div>
                    <svg className="w-full h-20 text-[#0055c4]" fill="none" viewBox="0 0 500 60">
                      <path
                        d="M0,45 C50,42 90,50 140,28 C190,8 230,35 280,22 C330,12 380,4 430,18 C470,28 490,12 500,8"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                      />
                      <path
                        d="M0,45 C50,42 90,50 140,28 C190,8 230,35 280,22 C330,12 380,4 430,18 C470,28 490,12 500,8 L500,60 L0,60 Z"
                        fill="currentColor"
                        fillOpacity="0.08"
                      />
                    </svg>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
                  <h3 className="font-bold text-[15px] text-slate-900">Primary Hub Location</h3>
                  <div className="w-full h-44 bg-slate-100 rounded-lg relative overflow-hidden flex items-end p-3 bg-gradient-to-br from-blue-900/10 to-indigo-900/30">
                    <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-slate-800 text-[11px] shadow-sm flex items-center gap-1.5 font-semibold">
                      <span className="material-symbols-outlined text-[16px] text-[#0055c4]">pin_drop</span>
                      <span>{selectedBusiness.cluster}</span>
                    </div>
                  </div>
                  <div className="text-[12px] space-y-1">
                    <div className="text-slate-900 font-semibold">Headquarters Address:</div>
                    <div className="text-slate-600 leading-relaxed">{selectedBusiness.hqAddress}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. BUSINESS INFORMATION PANE */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Owner & Legal Contact Details */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedBusiness.owner.avatarUrl}
                    alt={selectedBusiness.owner.name}
                    className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-slate-100"
                  />
                  <div>
                    <h4 className="font-bold text-[16px] text-slate-900">{selectedBusiness.owner.name}</h4>
                    <div className="text-[12px] text-slate-500 font-medium">{selectedBusiness.owner.role}</div>
                    <div className="text-[10px] font-bold text-[#0055c4] uppercase mt-1">
                      Verified Identity (NIN/BVN)
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 text-[12px]">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Official Email:</span>
                    <span className="text-slate-900 font-semibold">{selectedBusiness.owner.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Direct Phone:</span>
                    <span className="text-slate-900 font-semibold">{selectedBusiness.owner.phone}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Support Desk:</span>
                    <span className="text-slate-900 font-semibold">{selectedBusiness.owner.supportEmail}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Merchant Escrow Account:</span>
                    <span className="text-slate-900 font-semibold">{selectedBusiness.owner.escrowAccount}</span>
                  </div>
                </div>
              </div>

              {/* Official CAC / TIN Registration Records */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
                <h4 className="font-bold text-[15px] text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0055c4] text-[20px]">policy</span>
                  <span>Statutory Corporate Records</span>
                </h4>

                <div className="space-y-3 text-[12px]">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Corporate Affairs Commission:</span>
                    <span className="text-slate-900 font-bold">{selectedBusiness.cacRc} (Registered 2012)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Federal Tax Identification (TIN):</span>
                    <span className="text-slate-900 font-semibold">{selectedBusiness.tin} (FIRS Vetted)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Registered Entity Title:</span>
                    <span className="text-slate-900 font-semibold">{selectedBusiness.name} Ltd</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Annual Audit Filing:</span>
                    <span className="text-emerald-600 font-semibold">FY 2024 Audited & Cleared</span>
                  </div>
                </div>

                <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 flex items-center gap-3 mt-2">
                  <span className="material-symbols-outlined text-[#0055c4] text-[24px] shrink-0">verified</span>
                  <div className="text-[12px]">
                    <span className="text-slate-800 font-bold block">AML & CTF Automated Vetting:</span>
                    <span className="text-slate-600">
                      No sanctions or adverse media detected across international financial registries.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. BRANCHES PANE */}
          {activeTab === 'branches' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[15px] text-slate-900">Associated Branch Network</h3>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    {selectedBusiness.branches.length || 8} Active operational hubs configured with geofencing boundaries
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('/admin/locations')}
                  className="h-8 px-3 rounded-lg bg-[#0055c4] text-white text-[11px] font-semibold flex items-center gap-1 shadow-2xs hover:bg-[#066cf4] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">add_location_alt</span>
                  <span>Register Branch</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedBusiness.branches.map((br) => (
                  <div
                    key={br.id}
                    className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase text-[#0055c4] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {br.type}
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      </div>
                      <h4 className="font-bold text-[14px] text-slate-900">{br.name}</h4>
                      <p className="text-[12px] text-slate-500 mt-1">{br.address}</p>
                      <div className="mt-4 space-y-1.5 text-[12px] text-slate-600">
                        <div>
                          Manager: <strong className="text-slate-800">{br.manager}</strong>
                        </div>
                        <div>
                          Geofence: <strong className="text-slate-800">{br.geofence}</strong>
                        </div>
                        <div>
                          Terminals: <strong className="text-slate-800">{br.terminals} POS Devices</strong>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 flex items-center justify-between text-[12px] border-t border-slate-100">
                      <span className="text-slate-400 font-medium">Staff: {br.staff}</span>
                      <button
                        onClick={() => onNavigate('/admin/locations/geofencing')}
                        className="text-[#0055c4] font-semibold hover:underline cursor-pointer"
                      >
                        Manage GIS →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. STAFF PANE */}
          {activeTab === 'staff' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[15px] text-slate-900">
                    Assigned Staff & Privilege Hierarchy
                  </h3>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    {selectedBusiness.staffCount} Active accounts mapped to corporate access levels
                  </p>
                </div>
                <select className="h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-[11px] cursor-pointer">
                  <option>All Personnel</option>
                  <option>Store Managers</option>
                  <option>Cashiers & Clerks</option>
                  <option>POS Operators</option>
                </select>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Assigned Branch</th>
                      <th className="py-3 px-4">System Role</th>
                      <th className="py-3 px-4">POS Authorization</th>
                      <th className="py-3 px-4">Security Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {selectedBusiness.staff.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0055c4] font-bold text-[12px] flex items-center justify-center shrink-0">
                            {st.initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{st.name}</div>
                            <div className="text-[11px] text-slate-400">{st.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{st.branch}</td>
                        <td className="py-3 px-4 font-semibold text-[#0055c4]">{st.role}</td>
                        <td className="py-3 px-4 text-slate-600">{st.posAuth}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. PRODUCTS & CATALOGUE PANE */}
          {activeTab === 'catalogue' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[15px] text-slate-900">Product Catalogue & Deal Sync</h3>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    Active SKU items synchronized with VEMTAP Discovery Feed
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[11px] font-medium">
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">sync</span>
                  <span>ERP Live Sync: 4 mins ago</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {selectedBusiness.catalogue.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex gap-3 hover:shadow-sm transition-shadow"
                  >
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-20 h-20 rounded-lg object-cover bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0 flex flex-col justify-between">
                      <div>
                        {cat.discount && (
                          <span className="text-[9px] font-bold uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                            Deal: {cat.discount}
                          </span>
                        )}
                        <h4 className="font-semibold text-[13px] text-slate-900 truncate mt-1">
                          {cat.title}
                        </h4>
                        <div className="text-[11px] text-slate-400">SKU: {cat.sku}</div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-[14px] text-slate-900">{cat.price}</span>
                        <span className="text-[11px] text-slate-500">{cat.stock} in stock</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. ACCOUNT STATUS PANE */}
          {activeTab === 'status' && (
            <div className="flex flex-col gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[32px]">shield_with_heart</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[16px] text-slate-900">Platform Good Standing</h3>
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                        Score: 98/100
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500 mt-1">
                      Zero unresolved consumer chargebacks, fraudulent filings, or POS irregularities recorded.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(selectedBusiness.id)}
                    className={`h-9 px-4 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
                      selectedBusiness.complianceStatus === 'Suspended'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                    }`}
                  >
                    {selectedBusiness.complianceStatus === 'Suspended' ? 'Reinstate Account' : 'Suspend Account'}
                  </button>
                </div>
              </div>

              {/* Compliance Audit Timeline */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
                <h4 className="font-bold text-[14px] text-slate-900 mb-4">Compliance Inspection History</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px] mt-0.5">
                      check_circle
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-slate-800">
                          Biannual CAC Recertification
                        </span>
                        <span className="text-[11px] text-slate-400">10 Jan 2025</span>
                      </div>
                      <p className="text-[12px] text-slate-500 mt-1">
                        Company registry and directorship credentials confirmed against national database.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px] mt-0.5">
                      check_circle
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-slate-800">
                          POS Terminal Geofence Calibration
                        </span>
                        <span className="text-[11px] text-slate-400">28 Nov 2024</span>
                      </div>
                      <p className="text-[12px] text-slate-500 mt-1">
                        Hardware terminals locked to Ikeja, VI, and Abuja coordinates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7. SUBSCRIPTION DETAILS PANE */}
          {activeTab === 'subscription' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#0055c4] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Plan Tier</span>
                  <h4 className="text-xl font-bold text-slate-900 mt-2">{selectedBusiness.tier}</h4>
                  <div className="text-xl font-bold text-[#0055c4] mt-2">₦180,000 / month</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Direct Corporate Invoicing</div>
                </div>
                <div className="mt-6 pt-3 border-t border-slate-100 text-[12px] text-slate-500">
                  Includes Unlimited POS accounts, VIP Geofencing, and VEMTAP Discovery priority.
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Next Billing Cycle</span>
                  <h4 className="text-lg font-bold text-slate-900 mt-2">01 March 2025</h4>
                  <div className="text-[12px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">check</span>
                    <span>Auto-Debit Configured</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Gateway: Paystack Corporate Direct</div>
                </div>
                <div className="mt-6 pt-3 border-t border-slate-100 text-[12px] text-slate-500">
                  Auto-receipt forwarded to billing@slot.ng
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Payment Gateway Health</span>
                  <h4 className="text-lg font-bold text-slate-900 mt-2">Operational</h4>
                  <div className="text-[12px] text-slate-800 font-medium mt-2">
                    Tokenized Card: Ending in 4921
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Expiry: 10/28 (Stanbic IBTC)</div>
                </div>
                <button
                  onClick={() => onNavigate('/admin/subscriptions')}
                  className="mt-6 pt-3 border-t border-slate-100 text-left text-[#0055c4] text-[12px] font-semibold hover:underline cursor-pointer"
                >
                  Manage Billing Plan →
                </button>
              </div>
            </div>
          )}

          {/* 8. BUSINESS QR ASSETS PANE */}
          {activeTab === 'qr' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Merchant Master QR */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
                <span className="text-[10px] font-bold uppercase text-[#0055c4] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100 mb-2">
                  Primary Dynamic QR
                </span>
                <h4 className="font-bold text-[15px] text-slate-900">Storefront Gateway QR</h4>
                <p className="text-[12px] text-slate-500 mb-4 max-w-sm">
                  Direct customer route to instant digital cart, branch inventory, and tap payment
                </p>

                <div className="p-4 bg-white rounded-xl shadow-md border-4 border-slate-100 mb-5">
                  <svg className="w-44 h-44 text-slate-900" fill="currentColor" viewBox="0 0 100 100">
                    <rect x="10" y="10" width="22" height="22" rx="2" />
                    <rect x="14" y="14" width="14" height="14" fill="#ffffff" />
                    <rect x="17" y="17" width="8" height="8" />
                    <rect x="68" y="10" width="22" height="22" rx="2" />
                    <rect x="72" y="14" width="14" height="14" fill="#ffffff" />
                    <rect x="75" y="17" width="8" height="8" />
                    <rect x="10" y="68" width="22" height="22" rx="2" />
                    <rect x="14" y="72" width="14" height="14" fill="#ffffff" />
                    <rect x="17" y="75" width="8" height="8" />
                    <circle cx="40" cy="15" r="3" />
                    <circle cx="52" cy="18" r="3" />
                    <circle cx="48" cy="28" r="3" />
                    <circle cx="36" cy="38" r="3" />
                    <circle cx="62" cy="42" r="3" />
                    <circle cx="50" cy="50" r="5" fill="#0055c4" />
                    <circle cx="20" cy="48" r="3" />
                    <circle cx="75" cy="55" r="3" />
                    <circle cx="82" cy="70" r="3" />
                    <circle cx="65" cy="80" r="3" />
                  </svg>
                </div>

                <div className="flex items-center gap-3 w-full max-w-xs">
                  <button
                    onClick={() => alert('Vector SVG QR downloaded for ' + selectedBusiness.name)}
                    className="flex-1 h-9 rounded-lg bg-[#0055c4] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-[#066cf4] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Vector SVG</span>
                  </button>
                  <button
                    onClick={() => alert('High-Res PNG QR downloaded for ' + selectedBusiness.name)}
                    className="flex-1 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">image</span>
                    <span>High-Res PNG</span>
                  </button>
                </div>
              </div>

              {/* Tabletop NFC Standees & Hardware Tokens */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Hardware Assets</span>
                  <h4 className="font-bold text-[15px] text-slate-900 mt-2">Tabletop NFC Standees & Clones</h4>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    Physical acrylic assets deployed across retail checkout counters
                  </p>

                  <div className="mt-4 space-y-2.5">
                    {selectedBusiness.qrTokens.map((t) => (
                      <div
                        key={t.token}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-[12px] font-bold text-slate-800">Standee Token: {t.token}</div>
                          <div className="text-[11px] text-slate-500">Assigned: {t.assignment}</div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase border border-emerald-100">
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[12px] text-slate-500">Need new NFC hardware units?</span>
                  <button
                    onClick={() => alert('Acrylic NFC kit requisition submitted for ' + selectedBusiness.name)}
                    className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold cursor-pointer"
                  >
                    Request Acrylic Kit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AdminChatModal */}
        <AdminChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          recipientName={selectedBusiness.name}
          recipientType="business"
          recipientSubtitle={`${selectedBusiness.cluster} • ${selectedBusiness.cacRc}`}
          recipientInitials={selectedBusiness.name.slice(0, 2).toUpperCase()}
        />
      </div>
    );
  }

  // NORMAL TABLE VIEW (isProfileView === false)
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] w-full mx-auto">
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[12px] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-emerald-600">check_circle</span>
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
            <span className="material-symbols-outlined text-[15px]">close</span>
          </button>
        </div>
      )}

      {/* Metric Badges & Title Block */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase text-slate-500 tracking-wider font-semibold">
            <span>Commercial Operations</span>
            <span>•</span>
            <span className="text-[#0055c4]">Active Directory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Businesses — All Businesses
          </h1>
        </div>

        {/* Live Aggregated Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#066cf4]"></span>
            <span className="text-[11px] text-slate-500 font-medium">Total:</span>
            <span className="font-bold text-[13px] text-slate-900">3,840</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] text-slate-500 font-medium">Verified:</span>
            <span className="font-bold text-[13px] text-slate-900">2,910</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-[11px] text-slate-500 font-medium">Pending:</span>
            <span className="font-bold text-[13px] text-slate-900">184</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-[11px] text-slate-500 font-medium">Suspended:</span>
            <span className="font-bold text-[13px] text-red-600">14</span>
          </div>
        </div>
      </div>

      {/* Advanced Query Matrix & Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Identifier */}
          <div className="lg:col-span-2 relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">
              manage_search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-[12px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0055c4] transition-all"
              placeholder="Search by Business Name, Slug, or RC Number..."
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-9 px-3 appearance-none rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-[12px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0055c4] transition-all cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="electronics">Consumer Electronics</option>
              <option value="dining">Dining & Hospitality</option>
              <option value="pharma">Pharma & Health</option>
              <option value="retail">Supermarket & Retail</option>
              <option value="lifestyle">Lifestyle & Fashion</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[16px] text-slate-400 pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Commercial Cluster/City Filter */}
          <div className="relative">
            <select
              value={clusterFilter}
              onChange={(e) => setClusterFilter(e.target.value)}
              className="w-full h-9 px-3 appearance-none rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-[12px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0055c4] transition-all cursor-pointer"
            >
              <option value="">Cluster: All Territories</option>
              <option value="ikeja">Ikeja Computer Village</option>
              <option value="vi">Victoria Island Hub</option>
              <option value="lekki">Lekki Commercial Zone</option>
              <option value="abuja">Abuja Central Trade Ring</option>
              <option value="port">Port Harcourt Gateway</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[16px] text-slate-400 pointer-events-none">
              pin_drop
            </span>
          </div>

          {/* Verification Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 px-3 appearance-none rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-[12px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0055c4] transition-all cursor-pointer"
            >
              <option value="">Status: All Checks</option>
              <option value="Verified">Verified CAC/TIN</option>
              <option value="Pending Validation">Pending Validation</option>
              <option value="Under Review">Audit Under Review</option>
              <option value="Suspended">Account Suspended</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[16px] text-slate-400 pointer-events-none">
              verified_user
            </span>
          </div>

          {/* Subscription Tier Filter */}
          <div className="relative">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full h-9 px-3 appearance-none rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-[12px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0055c4] transition-all cursor-pointer"
            >
              <option value="">Tier: All Subscriptions</option>
              <option value="Platinum">Platinum Enterprise</option>
              <option value="Gold">Gold Merchant</option>
              <option value="Silver">Silver Tier</option>
              <option value="Basic">Basic Trial</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[16px] text-slate-400 pointer-events-none">
              workspace_premium
            </span>
          </div>
        </div>

        {/* Active Filter Micro-Tokens */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[12px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mr-1">
              Active Refinements:
            </span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full text-slate-700">
                Query: "{searchQuery}"
                <span
                  onClick={() => setSearchQuery('')}
                  className="material-symbols-outlined text-[13px] cursor-pointer hover:text-red-500"
                >
                  close
                </span>
              </span>
            )}
            {categoryFilter && (
              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full text-slate-700">
                Category: {categoryFilter}
                <span
                  onClick={() => setCategoryFilter('')}
                  className="material-symbols-outlined text-[13px] cursor-pointer hover:text-red-500"
                >
                  close
                </span>
              </span>
            )}
            {clusterFilter && (
              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full text-slate-700">
                Cluster: {clusterFilter}
                <span
                  onClick={() => setClusterFilter('')}
                  className="material-symbols-outlined text-[13px] cursor-pointer hover:text-red-500"
                >
                  close
                </span>
              </span>
            )}
            {(searchQuery || categoryFilter || clusterFilter || statusFilter || tierFilter) && (
              <button onClick={resetFilters} className="text-[#0055c4] hover:underline font-semibold ml-1 cursor-pointer">
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-[11px]">
              Showing {filteredBusinesses.length} of 3,840 records
            </span>
            <button
              onClick={handleExportCsv}
              className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">file_download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Registered Businesses Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200/80">
                <th className="py-3 px-4">Business Entity & Slug</th>
                <th className="py-3 px-4">Category & Tier</th>
                <th className="py-3 px-4">CAC RC / TIN</th>
                <th className="py-3 px-4">Primary Cluster</th>
                <th className="py-3 px-4 text-center">Branches</th>
                <th className="py-3 px-4 text-center">Staff</th>
                <th className="py-3 px-4">Compliance</th>
                <th className="py-3 px-4">Billing Plan</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredBusinesses.map((biz) => {
                return (
                  <tr
                    key={biz.id}
                    onClick={() => handleOpenProfile(biz)}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#0055c4] font-bold shadow-2xs shrink-0">
                          <span className="material-symbols-outlined text-[20px]">
                            {biz.category.includes('Electronics')
                              ? 'devices'
                              : biz.category.includes('Pharma')
                              ? 'local_pharmacy'
                              : biz.category.includes('Dining')
                              ? 'restaurant'
                              : 'storefront'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span className="truncate">{biz.name}</span>
                            {biz.complianceStatus === 'Verified' && (
                              <span className="material-symbols-outlined text-[#0055c4] text-[15px]">verified</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">vem.tap/{biz.slug}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{biz.category}</div>
                      <div className="flex items-center gap-1 text-[11px] text-[#0055c4]">
                        <span className="material-symbols-outlined text-[13px]">diamond</span>
                        <span>{biz.tier}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[11px]">
                      <div className="text-slate-800 font-medium">{biz.cacRc}</div>
                      <div className="text-slate-400">TIN: {biz.tin}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-800">{biz.cluster}</div>
                      <div className="text-[11px] text-slate-400">{biz.state}</div>
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {biz.branchCount}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {biz.staffCount}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          biz.complianceStatus === 'Verified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : biz.complianceStatus === 'Under Review'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : biz.complianceStatus === 'Suspended'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            biz.complianceStatus === 'Verified'
                              ? 'bg-emerald-500'
                              : biz.complianceStatus === 'Under Review'
                              ? 'bg-amber-500'
                              : biz.complianceStatus === 'Suspended'
                              ? 'bg-red-500'
                              : 'bg-slate-400'
                          }`}
                        ></span>
                        {biz.complianceStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{biz.billingPlan}</div>
                      <div className="text-[11px] text-slate-400">GMV: {biz.monthlyGmv}</div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProfile(biz);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#0055c4] hover:bg-[#066cf4] text-white text-[11px] font-semibold transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Profile</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/80">
          <div>Displaying {filteredBusinesses.length} of 3,840 records</div>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center disabled:opacity-40" disabled>
              <span className="material-symbols-outlined text-[15px]">chevron_left</span>
            </button>
            <button className="w-7 h-7 rounded bg-[#0055c4] text-white font-bold flex items-center justify-center">
              1
            </button>
            <button className="w-7 h-7 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center cursor-pointer">
              2
            </button>
            <button className="w-7 h-7 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center cursor-pointer">
              3
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button className="w-7 h-7 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center cursor-pointer">
              384
            </button>
            <button className="w-7 h-7 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center cursor-pointer">
              <span className="material-symbols-outlined text-[15px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
