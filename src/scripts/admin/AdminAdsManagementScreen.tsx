import { useState, useMemo } from 'react';

interface AdCampaign {
  id: string;
  name: string;
  code: string;
  advertiser: string;
  tier: 'Platinum' | 'Gold' | 'Silver';
  rcNumber: string;
  placement: string;
  slotPosition: string;
  totalBudget: number;
  spentBudget: number;
  runtimeDates: string;
  daysRemainingText: string;
  status: 'Active' | 'Pending Approval' | 'Paused' | 'Ended';
  billingModel: string;
  imageAlt: string;
  imageSrc: string;
  targetGeo: string;
  clickUrl: string;
  flightDays: string;
  cpmModel: string;
  unbilledReserve: string;
  impressions: string;
  viewability: string;
  taps: string;
  ctr: string;
  posVisits: string;
  attributedGmv: string;
  roi: string;
}

const CAMPAIGNS_DATA: AdCampaign[] = [
  {
    id: 'ad_1',
    code: '#AD-2094',
    name: 'Smartphone Fest',
    advertiser: 'Slot Electronics Systems Ltd',
    tier: 'Platinum',
    rcNumber: 'RC-1049281',
    placement: 'Home Feed Hero Carousel',
    slotPosition: 'Slot Position #01 (Top of Fold)',
    totalBudget: 4500000,
    spentBudget: 3120000,
    runtimeDates: 'Oct 20 — Nov 10',
    daysRemainingText: '12 days remaining',
    status: 'Active',
    billingModel: 'Escrow Prepaid',
    imageAlt: 'Flagship smartphones on electric cobalt background',
    imageSrc: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
    targetGeo: 'Lagos & Abuja Metros (All Users)',
    clickUrl: 'app://merchant/slot-electronics?promo=mega2094',
    flightDays: 'Oct 20, 2026 — Nov 10, 2026 (21 Days)',
    cpmModel: 'CPM ₦1,200 + CPC ₦45',
    unbilledReserve: '₦1,380,000',
    impressions: '1,420,000',
    viewability: '98.2%',
    taps: '91,200',
    ctr: '6.42% CTR (Top 5%)',
    posVisits: '14,250',
    attributedGmv: '₦38.4M',
    roi: '8.5x Campaign ROI',
  },
  {
    id: 'ad_2',
    code: '#AD-2089',
    name: 'Weekend Catch Special',
    advertiser: 'Mega Seafood Hub',
    tier: 'Gold',
    rcNumber: 'RC-983100',
    placement: 'Lekki Cluster Spotlight',
    slotPosition: 'Slot #02 Geo-boosted',
    totalBudget: 1800000,
    spentBudget: 1250000,
    runtimeDates: 'Oct 25 — Nov 05',
    daysRemainingText: '5 days remaining',
    status: 'Active',
    billingModel: 'Daily Auto-Debit',
    imageAlt: 'Fresh gourmet seafood platter promo',
    imageSrc: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=800&auto=format&fit=crop',
    targetGeo: 'Lekki Phase 1 & Victoria Island Corridor',
    clickUrl: 'app://merchant/mega-seafood?promo=catch2089',
    flightDays: 'Oct 25, 2026 — Nov 05, 2026 (11 Days)',
    cpmModel: 'CPM ₦950 + CPC ₦35',
    unbilledReserve: '₦550,000',
    impressions: '480,000',
    viewability: '97.5%',
    taps: '32,600',
    ctr: '6.79% CTR',
    posVisits: '5,420',
    attributedGmv: '₦12.5M',
    roi: '8.4x Campaign ROI',
  },
  {
    id: 'ad_3',
    code: '#AD-2081',
    name: 'Immunity Wellness Push',
    advertiser: 'Medplus Pharmacy Network',
    tier: 'Platinum',
    rcNumber: 'RC-441203',
    placement: 'Category Header',
    slotPosition: 'Health & Beauty Subgrid',
    totalBudget: 2200000,
    spentBudget: 850000,
    runtimeDates: 'Oct 28 — Nov 18',
    daysRemainingText: '18 days remaining',
    status: 'Active',
    billingModel: 'Escrow Prepaid',
    imageAlt: 'Vitamins and health supplements display',
    imageSrc: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop',
    targetGeo: 'All Lagos Healthcare Clusters',
    clickUrl: 'app://merchant/medplus?promo=wellness2081',
    flightDays: 'Oct 28, 2026 — Nov 18, 2026 (21 Days)',
    cpmModel: 'CPM ₦1,100 + CPC ₦40',
    unbilledReserve: '₦1,350,000',
    impressions: '620,000',
    viewability: '99.1%',
    taps: '31,000',
    ctr: '5.00% CTR',
    posVisits: '4,110',
    attributedGmv: '₦14.2M',
    roi: '6.2x Campaign ROI',
  },
  {
    id: 'ad_4',
    code: '#AD-2075',
    name: 'Hot Combo Sprint',
    advertiser: 'Chicken Republic QSR',
    tier: 'Gold',
    rcNumber: 'RC-318490',
    placement: 'Search Intercept',
    slotPosition: '"Food, Lunch, Quick Bite"',
    totalBudget: 950000,
    spentBudget: 0,
    runtimeDates: 'Nov 01 — Nov 15',
    daysRemainingText: 'Queued start',
    status: 'Pending Approval',
    billingModel: 'Awaiting Funds',
    imageAlt: 'Crispy fried chicken meal with savory sides',
    imageSrc: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=800&auto=format&fit=crop',
    targetGeo: 'All QSR Dining Zones (Lagos & Abuja)',
    clickUrl: 'app://merchant/chicken-republic?deal=combo2075',
    flightDays: 'Nov 01, 2026 — Nov 15, 2026 (14 Days)',
    cpmModel: 'CPM ₦800 + CPC ₦30',
    unbilledReserve: '₦950,000',
    impressions: '0 (Queued)',
    viewability: '—',
    taps: '0',
    ctr: '0.0% CTR',
    posVisits: '0',
    attributedGmv: '₦0',
    roi: 'Pre-launch',
  },
  {
    id: 'ad_5',
    code: '#AD-2068',
    name: 'Glamour Week Boost',
    advertiser: 'Casabella Beauty',
    tier: 'Silver',
    rcNumber: 'RC-772911',
    placement: 'Geofence Intercept',
    slotPosition: 'Victoria Island Corridor',
    totalBudget: 650000,
    spentBudget: 650000,
    runtimeDates: 'Oct 10 — Oct 24',
    daysRemainingText: 'Completed',
    status: 'Ended',
    billingModel: 'Settled Complete',
    imageAlt: 'Luxury cosmetics and salon treatments promo',
    imageSrc: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
    targetGeo: 'Victoria Island Admiralty Ring',
    clickUrl: 'app://merchant/casabella?promo=glam2068',
    flightDays: 'Oct 10, 2026 — Oct 24, 2026 (14 Days)',
    cpmModel: 'CPM ₦900 + CPC ₦35',
    unbilledReserve: '₦0',
    impressions: '220,000',
    viewability: '96.8%',
    taps: '11,440',
    ctr: '5.20% CTR',
    posVisits: '2,120',
    attributedGmv: '₦3.8M',
    roi: '4.9x Campaign ROI',
  },
];

interface AdminAdsManagementScreenProps {
  onNavigate: (path: string) => void;
}

export function AdminAdsManagementScreen({ onNavigate }: AdminAdsManagementScreenProps) {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(CAMPAIGNS_DATA);
  const [selectedId, setSelectedId] = useState<string>(CAMPAIGNS_DATA[0].id);
  const [statusTab, setStatusTab] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'PAUSED' | 'ENDED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const selectedCampaign = useMemo(() => {
    return campaigns.find((c) => c.id === selectedId) || campaigns[0];
  }, [campaigns, selectedId]);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.advertiser.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.placement.toLowerCase().includes(searchQuery.toLowerCase());

      if (statusTab === 'ACTIVE') return matchesSearch && c.status === 'Active';
      if (statusTab === 'PENDING') return matchesSearch && c.status === 'Pending Approval';
      if (statusTab === 'PAUSED') return matchesSearch && c.status === 'Paused';
      if (statusTab === 'ENDED') return matchesSearch && c.status === 'Ended';
      return matchesSearch;
    });
  }, [campaigns, searchQuery, statusTab]);

  const handleToggleStatus = (id: string) => {
    setCampaigns(
      campaigns.map((c) => {
        if (c.id === id) {
          const next = c.status === 'Active' ? 'Paused' : 'Active';
          triggerNotice(`Campaign ${c.code} (${c.name}) delivery set to ${next}.`);
          return { ...c, status: next };
        }
        return c;
      })
    );
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[12px] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-emerald-600">check_circle</span>
            <span className="font-medium">{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-600 hover:text-emerald-800">
            <span className="material-symbols-outlined text-[15px]">close</span>
          </button>
        </div>
      )}

      {/* Top Context Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="flex flex-col max-w-3xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 px-2 py-0.5 rounded bg-slate-100 font-semibold">
              Inventory &amp; Monetization Engine
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0055c4]"></span>
            <span className="text-[12px] text-slate-500">Ad Placement Core v4.2</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Advertising Campaigns &amp; Placements Management
          </h1>
          <p className="text-[14px] text-slate-500 mt-1">
            Oversee merchant-sponsored ad campaigns, hero placements, creative approvals, bidding budgets, and scheduled runtimes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => triggerNotice('Placement rate card drawer opened.')}
            className="h-9 px-3.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-[12px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-[17px] text-slate-500">price_change</span>
            <span>Placement Rate Card</span>
          </button>
          <button
            onClick={() => triggerNotice('Policy guidelines documentation loaded.')}
            className="h-9 px-3.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-[12px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-[17px] text-slate-500">policy</span>
            <span>Policy Guidelines</span>
          </button>
          <button
            onClick={() => triggerNotice('Launch new campaign wizard initiated.')}
            className="h-9 px-4 rounded-lg bg-[#0055c4] hover:bg-[#066cf4] text-white text-[12px] font-semibold flex items-center gap-2 shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Launch Ad Campaign</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Active Ad Campaigns</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-[#0055c4] material-symbols-outlined text-[18px]">
              campaign
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">48</span>
            <span className="text-[12px] text-slate-500 font-medium">Live Campaigns</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-slate-500">
            <span className="text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> 12 Awaiting Review
            </span>
            <button
              onClick={() => setStatusTab('PENDING')}
              className="text-[11px] text-[#0055c4] font-semibold hover:underline"
            >
              Review Queue →
            </button>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Sponsored Revenue (MTD)
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 material-symbols-outlined text-[18px]">
              payments
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">₦24.8M</span>
            <span className="text-[12px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>+18.4%
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
            <span>Settled Net</span>
            <span className="font-semibold text-slate-800">₦32.5M Projected</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Placements Inventory Utilisation
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-[#0055c4] material-symbols-outlined text-[18px]">
              grid_view
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">88.5%</span>
            <span className="text-[12px] text-slate-500 font-medium">Fill Rate</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
            <span>Prime Spots Allocation</span>
            <span className="font-bold text-[#0055c4]">28 / 32 Slots Booked</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Avg Campaign ROAS</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 material-symbols-outlined text-[18px]">
              auto_graph
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">4.8x</span>
            <span className="text-[12px] text-slate-500 font-medium">Merchant Return</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
            <span>Attributed Consumer Orders</span>
            <span className="font-semibold text-emerald-600">82.1k Conversions</span>
          </div>
        </div>
      </div>

      {/* Search, Tabs & Operational Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1 max-w-xl">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by Campaign Name, Advertiser / Merchant, Placement Slot, or Campaign ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-slate-50 font-medium text-[12px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0055c4]/30"
            />
          </div>

          {/* Quick Status Badges / Counter Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 text-[11px]">
            <button
              onClick={() => setStatusTab('ALL')}
              className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-colors shrink-0 ${
                statusTab === 'ALL'
                  ? 'bg-blue-100 text-[#0055c4]'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Ads (64)
            </button>
            <button
              onClick={() => setStatusTab('ACTIVE')}
              className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-colors shrink-0 ${
                statusTab === 'ACTIVE'
                  ? 'bg-blue-100 text-[#0055c4]'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Active Live (48)
            </button>
            <button
              onClick={() => setStatusTab('PENDING')}
              className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1 ${
                statusTab === 'PENDING'
                  ? 'bg-amber-100 text-amber-800'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending Approval (12)
            </button>
            <button
              onClick={() => setStatusTab('PAUSED')}
              className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-colors shrink-0 ${
                statusTab === 'PAUSED'
                  ? 'bg-blue-100 text-[#0055c4]'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Paused (4)
            </button>
            <button
              onClick={() => setStatusTab('ENDED')}
              className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-colors shrink-0 ${
                statusTab === 'ENDED'
                  ? 'bg-blue-100 text-[#0055c4]'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Ended (180)
            </button>
          </div>
        </div>

        {/* Secondary Filter Strip */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
          <span className="font-bold text-slate-400 uppercase tracking-wider mr-1">Filter Inventory:</span>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer font-medium transition-colors">
            <span className="material-symbols-outlined text-[15px] text-slate-500">view_carousel</span>
            <span>Placement: All Slots</span>
            <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer font-medium transition-colors">
            <span className="material-symbols-outlined text-[15px] text-slate-500">account_balance_wallet</span>
            <span>Budget: All Ranges</span>
            <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer font-medium transition-colors">
            <span className="material-symbols-outlined text-[15px] text-slate-500">stars</span>
            <span>Tier: Platinum &amp; Gold</span>
            <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer font-medium transition-colors">
            <span className="material-symbols-outlined text-[15px] text-slate-500">calendar_today</span>
            <span>Runtime: Current Q4</span>
            <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => triggerNotice('Exporting CSV inventory log...')}
              className="h-7 px-2.5 text-slate-600 hover:text-slate-900 font-semibold uppercase flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">file_download</span> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Layout (Left 65% Table | Right 35% Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT PANEL: Ads Inventory & Campaigns Table (65% / 8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] select-none">
                  <th className="py-2.5 pl-4 pr-1 w-10 text-center">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded text-[#0055c4] focus:ring-blue-500" />
                  </th>
                  <th className="py-2.5 px-4">Ad Campaign</th>
                  <th className="py-2.5 px-4">Advertiser &amp; Tier</th>
                  <th className="py-2.5 px-4">Placement Slot</th>
                  <th className="py-2.5 px-4 text-right">Budget &amp; Spent</th>
                  <th className="py-2.5 px-4">Runtime Dates</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 pr-4 pl-2 text-right w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredCampaigns.map((ad) => {
                  const isSelected = ad.id === selectedId;
                  const spentPercent = Math.min(100, Math.round((ad.spentBudget / (ad.totalBudget || 1)) * 100));

                  return (
                    <tr
                      key={ad.id}
                      onClick={() => setSelectedId(ad.id)}
                      className={`transition-colors cursor-pointer relative ${
                        isSelected
                          ? 'bg-blue-50/60 border-l-4 border-l-[#0055c4]'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 pl-4 pr-1 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => setSelectedId(ad.id)}
                          className="w-3.5 h-3.5 rounded text-[#0055c4] focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col min-w-[160px]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 tracking-tight text-[13px]">{ad.name}</span>
                            {ad.tier === 'Platinum' && (
                              <span className="material-symbols-outlined text-[#0055c4] text-[15px]" title="Priority Pinned">
                                verified
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono font-bold text-[#0055c4]">{ad.code}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{ad.advertiser}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span
                              className={`px-1.5 py-0.2 rounded font-bold text-[9px] uppercase tracking-wider ${
                                ad.tier === 'Platinum'
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : ad.tier === 'Gold'
                                  ? 'bg-amber-50 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {ad.tier}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">{ad.rcNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col min-w-[150px]">
                          <span className="font-medium text-slate-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0055c4] shrink-0"></span> {ad.placement}
                          </span>
                          <span className="text-[11px] text-slate-400">{ad.slotPosition}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right min-w-[130px]">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-slate-900">₦{ad.totalBudget.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400">
                            ₦{ad.spentBudget.toLocaleString()} spent ({spentPercent}%)
                          </span>
                          <div className="w-20 bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
                            <div className="bg-[#0055c4] h-1 rounded-full" style={{ width: `${spentPercent}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col text-[11px]">
                          <span className="font-medium text-slate-700">{ad.runtimeDates}</span>
                          <span className="text-[#0055c4] font-semibold">{ad.daysRemainingText}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ad.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ad.status === 'Pending Approval'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ad.status}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{ad.billingModel}</span>
                      </td>
                      <td className="py-3 pr-4 pl-2 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(ad.id);
                          }}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-800"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {ad.status === 'Active' ? 'pause_circle' : 'play_circle'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination footer inside table block */}
          <div className="px-4 py-3 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100 text-[11px] text-slate-500">
            <div>
              Showing <strong className="text-slate-900">1-{filteredCampaigns.length}</strong> of{' '}
              <strong className="text-slate-900">{campaigns.length}</strong> active &amp; scheduled campaigns
            </div>
            <div className="flex items-center gap-1 font-semibold">
              <span className="px-2 py-0.5 rounded bg-white text-[#0055c4] shadow-2xs border border-slate-200">1</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Ad Campaign Dossier & Creative Inspector (35% / 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col">
            {/* Header & Status Pill */}
            <div className="flex items-start justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Campaign Dossier</span>
                  <span className="text-[11px] font-mono font-bold text-[#0055c4]">{selectedCampaign.code}</span>
                </div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">{selectedCampaign.name}</h2>
              </div>
              <div className="flex flex-col items-end">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span> {selectedCampaign.status}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium mt-0.5">Creative: Verified &amp; Approved</span>
              </div>
            </div>

            {/* Advertiser Identification & Navigation Anchor */}
            <div className="p-3 rounded-xl bg-slate-50 mb-4 flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#0055c4] text-white font-bold flex items-center justify-center shrink-0 text-sm">
                  {selectedCampaign.advertiser.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[12px] font-bold text-slate-900 truncate">{selectedCampaign.advertiser}</span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {selectedCampaign.rcNumber} • {selectedCampaign.tier} Merchant Tier
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('/admin/businesses')}
                className="shrink-0 ml-2 px-2 py-1 rounded bg-white hover:bg-slate-50 text-[#0055c4] text-[10px] font-bold flex items-center gap-0.5 shadow-2xs transition-colors border border-slate-200"
              >
                <span>Profile</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </button>
            </div>

            {/* Creative Inspector Visual Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Creative Asset Inspector</span>
                <span className="text-[11px] text-slate-400 font-mono">1080×540 WebP • 142 KB</span>
              </div>
              <div className="relative w-full h-44 rounded-xl overflow-hidden group shadow-2xs bg-slate-900">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt={selectedCampaign.imageAlt}
                  src={selectedCampaign.imageSrc}
                />
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[10px] tracking-wider uppercase font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live on Slot #01
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => triggerNotice(`Creative preview modal for ${selectedCampaign.code}.`)}
                    className="px-3 py-1.5 rounded bg-white text-slate-900 text-[11px] font-bold flex items-center gap-1 shadow hover:bg-slate-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span> Preview Full View
                  </button>
                </div>
              </div>
            </div>

            {/* Placement & Targeting Specs */}
            <div className="space-y-2 mb-4 text-[12px]">
              <div className="flex items-start justify-between">
                <span className="text-slate-400 font-medium">Placement Slot</span>
                <span className="text-slate-900 font-semibold text-right">{selectedCampaign.placement}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400 font-medium">Target Geography</span>
                <span className="text-slate-800 font-medium text-right">{selectedCampaign.targetGeo}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400 font-medium">Click Destination</span>
                <span className="text-[#0055c4] font-mono text-[11px] truncate max-w-[210px] text-right">
                  {selectedCampaign.clickUrl}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400 font-medium">Flight Runtime</span>
                <span className="text-slate-800 font-medium text-right">{selectedCampaign.flightDays}</span>
              </div>
            </div>

            {/* Budget & Financial Standing Grid */}
            <div className="p-3.5 rounded-xl bg-slate-50 mb-4 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Budget &amp; Escrow Standing
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] uppercase font-bold">
                  Prepaid Escrow
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Total Cap</span>
                  <span className="text-base font-bold text-slate-900">₦{selectedCampaign.totalBudget.toLocaleString()}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Total Spent</span>
                  <span className="text-base font-bold text-[#0055c4]">₦{selectedCampaign.spentBudget.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Pacing: ₦225,000 / day</span>
                  <span className="font-semibold text-emerald-700">On Target</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#0055c4] h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.round((selectedCampaign.spentBudget / (selectedCampaign.totalBudget || 1)) * 100))}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="mt-2 pt-2 flex justify-between text-[11px] text-slate-500 border-t border-slate-200/60">
                <span>Model: <strong>{selectedCampaign.cpmModel}</strong></span>
                <span>Unbilled Reserve: <strong>{selectedCampaign.unbilledReserve}</strong></span>
              </div>
            </div>

            {/* Campaign Performance Summary & Live Funnel */}
            <div className="mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Real-Time Performance Funnel
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-50 flex flex-col border border-slate-100">
                  <span className="text-[11px] text-slate-400">Impressions Served</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5">{selectedCampaign.impressions}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-1">{selectedCampaign.viewability} viewability</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 flex flex-col border border-slate-100">
                  <span className="text-[11px] text-slate-400">Taps / Clicks</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5">{selectedCampaign.taps}</span>
                  <span className="text-[10px] text-[#0055c4] font-semibold mt-1">{selectedCampaign.ctr}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 flex flex-col border border-slate-100">
                  <span className="text-[11px] text-slate-400">POS Store Visits</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5">{selectedCampaign.posVisits}</span>
                  <span className="text-[10px] text-slate-500 mt-1">Geofence validated</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 flex flex-col border border-slate-100">
                  <span className="text-[11px] text-slate-400">Attributed GMV</span>
                  <span className="text-base font-bold text-emerald-700 mt-0.5">{selectedCampaign.attributedGmv}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-1">{selectedCampaign.roi}</span>
                </div>
              </div>
            </div>

            {/* Quick Operational Actions */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-[11px]">
              <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">Administrative Actions</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => triggerNotice(`Creative re-verification passed for ${selectedCampaign.code}.`)}
                  className="h-8 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px] text-[#0055c4]">verified</span>
                  <span>Re-verify</span>
                </button>
                <button
                  onClick={() => triggerNotice(`Daily cap adjustment modal opened for ${selectedCampaign.code}.`)}
                  className="h-8 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px] text-slate-500">tune</span>
                  <span>Adjust Cap</span>
                </button>
                <button
                  onClick={() => triggerNotice(`Runtime dates extended for ${selectedCampaign.code}.`)}
                  className="h-8 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px] text-slate-500">date_range</span>
                  <span>Extend Dates</span>
                </button>
                <button
                  onClick={() => handleToggleStatus(selectedCampaign.id)}
                  className="h-8 px-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {selectedCampaign.status === 'Active' ? 'pause_circle' : 'play_circle'}
                  </span>
                  <span>{selectedCampaign.status === 'Active' ? 'Pause Ad' : 'Resume Ad'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Delivery Health & Network Telemetry Pill */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">cell_tower</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-slate-900">Ad Server Edge CDN • Fastly</span>
                <span className="text-[11px] text-slate-400">Latency: 14ms • Zero Delivery Drops</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-mono font-bold text-slate-600">200 OK</span>
          </div>
        </div>
      </div>
    </div>
  );
}

