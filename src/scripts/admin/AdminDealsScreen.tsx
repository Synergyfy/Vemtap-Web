import { useState, type FormEvent } from 'react';

export interface DealRecord {
  id: string;
  code: string;
  title: string;
  merchant: string;
  merchantId: string;
  cluster: string;
  terms: string;
  minSpend: string;
  cap: string;
  claimed: number;
  totalQuota: number;
  validity: string;
  dateRange: string;
  status: 'Active' | 'Under Review' | 'Flagged' | 'Expired';
  discountType: 'Percentage' | 'Fixed' | 'BOGO';
  discountValue: string;
  retailPrice: string;
  dealPrice: string;
  flagReason?: string;
  isFeatured?: boolean;
}

const INITIAL_DEALS: DealRecord[] = [
  {
    id: 'd1',
    code: '#DL-8820',
    title: '15% Off iPhone 15 Series',
    merchant: 'Slot Electronics Flagship',
    merchantId: 'm1',
    cluster: 'Ikeja Computer Village',
    terms: '15% Instant POS',
    minSpend: '₦100,000',
    cap: '₦35,000',
    claimed: 428,
    totalQuota: 500,
    validity: 'Ends in 3d',
    dateRange: 'Oct 28 - Nov 05',
    status: 'Active',
    discountType: 'Percentage',
    discountValue: '15%',
    retailPrice: '₦1,450,000',
    dealPrice: '₦1,232,500',
    isFeatured: true,
  },
  {
    id: 'd2',
    code: '#DL-8814',
    title: '20% Off Seafood Platter',
    merchant: 'Mega Seafood Hub',
    merchantId: 'm2',
    cluster: 'Lekki Phase 1 Waterfront',
    terms: '20% Off Bill',
    minSpend: '₦30,000',
    cap: '₦12,000',
    claimed: 194,
    totalQuota: 200,
    validity: 'Ends Today',
    dateRange: 'Oct 20 - Oct 31',
    status: 'Active',
    discountType: 'Percentage',
    discountValue: '20%',
    retailPrice: '₦45,000',
    dealPrice: '₦36,000',
    isFeatured: true,
  },
  {
    id: 'd3',
    code: '#DL-8790',
    title: 'Buy 1 Get 1 Free Smoothies',
    merchant: 'Chicken Republic QSR',
    merchantId: 'm3',
    cluster: 'Wuse 2 Commercial Zone',
    terms: 'BOGO Free Item',
    minSpend: '₦4,000',
    cap: 'Max 2 / order',
    claimed: 812,
    totalQuota: 1000,
    validity: 'Ends in 8d',
    dateRange: 'Oct 15 - Nov 10',
    status: 'Active',
    discountType: 'BOGO',
    discountValue: '100% (2nd item)',
    retailPrice: '₦3,800',
    dealPrice: '₦1,900 eq.',
  },
  {
    id: 'd4',
    code: '#DL-8765',
    title: '₦5,000 Off Designer Glasses',
    merchant: 'Medplus Optical',
    merchantId: 'm4',
    cluster: 'Victoria Island Hub',
    terms: 'Fixed ₦5,000 Off',
    minSpend: '₦40,000',
    cap: '₦5,000',
    claimed: 45,
    totalQuota: 50,
    validity: 'Paused',
    dateRange: 'Oct 10 - Oct 25',
    status: 'Flagged',
    discountType: 'Fixed',
    discountValue: '₦5,000',
    retailPrice: '₦65,000',
    dealPrice: '₦60,000',
    flagReason: 'Sentinel markup tripwire: retail price elevated 24h prior to voucher launch',
  },
  {
    id: 'd5',
    code: '#DL-8742',
    title: '10% Off Weekend Spa Package',
    merchant: 'Brisk Wellness Sanctuary',
    merchantId: 'm5',
    cluster: 'Lekki Phase 1 Corridor',
    terms: '10% Instant POS',
    minSpend: '₦25,000',
    cap: '₦8,000',
    claimed: 88,
    totalQuota: 100,
    validity: 'Ends in 12d',
    dateRange: 'Oct 25 - Nov 15',
    status: 'Active',
    discountType: 'Percentage',
    discountValue: '10%',
    retailPrice: '₦35,000',
    dealPrice: '₦31,500',
  },
  {
    id: 'd6',
    code: '#DL-8711',
    title: '25% Off Fresh Bakery Bundle',
    merchant: 'Shoprite Flagship Store',
    merchantId: 'm6',
    cluster: 'Ikeja City Mall',
    terms: '25% Off Groceries',
    minSpend: '₦10,000',
    cap: '₦5,000',
    claimed: 390,
    totalQuota: 400,
    validity: 'Expired',
    dateRange: 'Oct 01 - Oct 20',
    status: 'Expired',
    discountType: 'Percentage',
    discountValue: '25%',
    retailPrice: '₦12,000',
    dealPrice: '₦9,000',
  },
];

interface AdminDealsScreenProps {
  onNavigate?: (path: string) => void;
  subpage?: 'active' | 'flagged' | 'moderation' | 'featured';
}

export function AdminDealsScreen({ onNavigate, subpage = 'active' }: AdminDealsScreenProps) {
  const [deals, setDeals] = useState<DealRecord[]>(INITIAL_DEALS);
  const [selectedDealId, setSelectedDealId] = useState<string>('d1');
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'REVIEW' | 'EXPIRED' | 'FLAGGED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Modals
  const [showPriceRulesModal, setShowPriceRulesModal] = useState(false);
  const [showCreateDealModal, setShowCreateDealModal] = useState(false);
  const [newDealForm, setNewDealForm] = useState({
    title: '',
    merchant: 'Slot Electronics Flagship',
    cluster: 'Ikeja Computer Village',
    discountType: 'Percentage' as const,
    discountValue: '15%',
    minSpend: '₦50,000',
    cap: '₦15,000',
    totalQuota: 200,
    days: 7,
  });

  const selectedDeal = deals.find((d) => d.id === selectedDealId) || deals[0];

  const filteredDeals = deals.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.cluster.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'ACTIVE') return d.status === 'Active';
    if (filterTab === 'REVIEW') return d.status === 'Under Review';
    if (filterTab === 'EXPIRED') return d.status === 'Expired';
    if (filterTab === 'FLAGGED') return d.status === 'Flagged';
    return true;
  });

  const handleFreezeToggle = (dealId: string) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === dealId) {
          const newStatus = d.status === 'Active' ? 'Flagged' : 'Active';
          return { ...d, status: newStatus };
        }
        return d;
      })
    );
    setBannerNotice(`Updated operational state for ${selectedDeal.code}.`);
    setTimeout(() => setBannerNotice(null), 3000);
  };

  const handlePushToFeatured = (dealId: string) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, isFeatured: !d.isFeatured } : d))
    );
    setBannerNotice(`Toggled featured hero discovery carousel placement for ${selectedDeal.code}.`);
    setTimeout(() => setBannerNotice(null), 3500);
  };

  const handleExportLedger = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Code,Title,Merchant,Cluster,Terms,Claimed,Quota,Status', ...deals.map((d) => `${d.code},"${d.title}","${d.merchant}","${d.cluster}","${d.terms}",${d.claimed},${d.totalQuota},${d.status}`)].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vemtap-deals-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setBannerNotice('Exported Deals & Redemptions ledger to CSV.');
    setTimeout(() => setBannerNotice(null), 3000);
  };

  const handleCreateDealSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newDealForm.title.trim()) return;

    const newD: DealRecord = {
      id: `deal_${Date.now()}`,
      code: `#DL-${Math.floor(8800 + Math.random() * 200)}`,
      title: newDealForm.title.trim(),
      merchant: newDealForm.merchant,
      merchantId: 'm_custom',
      cluster: newDealForm.cluster,
      terms: `${newDealForm.discountValue} Instant POS`,
      minSpend: newDealForm.minSpend,
      cap: newDealForm.cap,
      claimed: 0,
      totalQuota: Number(newDealForm.totalQuota) || 100,
      validity: `Ends in ${newDealForm.days}d`,
      dateRange: `Today - in ${newDealForm.days} days`,
      status: 'Active',
      discountType: newDealForm.discountType,
      discountValue: newDealForm.discountValue,
      retailPrice: '₦50,000',
      dealPrice: '₦42,500',
    };

    setDeals((prev) => [newD, ...prev]);
    setSelectedDealId(newD.id);
    setShowCreateDealModal(false);
    setBannerNotice(`Created and approved campaign deal ${newD.code}: "${newD.title}".`);
    setTimeout(() => setBannerNotice(null), 3500);
  };

  // ── Discovery Listings subpage ──────────────────────────────────────────────
  if (subpage === 'moderation') {
    const pendingDeals = deals.filter((d) => d.status === 'Under Review' || d.status === 'Active');
    return (
      <div className="flex flex-col w-full gap-6">
        {bannerNotice && (
          <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl flex items-center justify-between text-sm shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">verified</span>
              <span>{bannerNotice}</span>
            </div>
            <button onClick={() => setBannerNotice(null)} className="text-blue-500 hover:text-blue-800 text-xs font-semibold">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">Commercial Engine / Discovery Moderation</span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">Discovery Listings & Feed Moderation</h1>
            <p className="text-sm text-slate-500 mt-0.5">Review, approve, and curate deals appearing in the customer discovery home feed and explore carousel.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setBannerNotice('Refreshed discovery feed ranking scores for all active deals.'); setTimeout(() => setBannerNotice(null), 3000); }}
              className="h-9 px-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-600">refresh</span>
              Refresh Feed Scores
            </button>
            <button
              onClick={() => { setBannerNotice('Applied bulk approval to 62 Under Review deals in discovery queue.'); setTimeout(() => setBannerNotice(null), 3500); }}
              className="h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Bulk Approve Queue
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'In Discovery Feed', value: '1,620', icon: 'explore', color: 'blue' },
            { label: 'Pending Review', value: '62', icon: 'pending', color: 'amber' },
            { label: 'Rejected Today', value: '8', icon: 'cancel', color: 'rose' },
            { label: 'Avg Visibility Score', value: '74/100', icon: 'bar_chart', color: 'emerald' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block">{stat.label}</span>
                <span className="text-xl font-bold text-slate-900 mt-0.5 block">{stat.value}</span>
              </div>
              <span className={`material-symbols-outlined text-[26px] text-${stat.color}-500`}>{stat.icon}</span>
            </div>
          ))}
        </div>

        {/* Discovery Queue Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="font-semibold text-sm text-slate-900">Discovery Feed Moderation Queue</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">62 Pending Review</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-4 text-left">Deal</th>
                  <th className="py-2.5 px-4 text-left">Merchant & Cluster</th>
                  <th className="py-2.5 px-4 text-left">Category Tag</th>
                  <th className="py-2.5 px-4 text-left">Visibility Score</th>
                  <th className="py-2.5 px-4 text-left">Feed Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingDeals.map((deal) => {
                  const score = Math.floor(60 + Math.random() * 40);
                  return (
                    <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{deal.title}</div>
                        <div className="font-mono text-[10px] text-blue-600">{deal.code}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{deal.merchant}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] text-blue-500">hub</span>
                          {deal.cluster}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                          {deal.discountType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${score}%` }}></div>
                          </div>
                          <span className="font-mono font-bold text-slate-700">{score}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          deal.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {deal.status === 'Active' ? 'Live in Feed' : 'Pending Review'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setBannerNotice(`Approved "${deal.title}" for discovery feed visibility.`); setTimeout(() => setBannerNotice(null), 3000); }}
                            className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => { setBannerNotice(`Removed "${deal.title}" from discovery feed.`); setTimeout(() => setBannerNotice(null), 3000); }}
                            className="h-7 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── Featured Placement subpage ───────────────────────────────────────────────
  if (subpage === 'featured') {
    const featuredDeals = deals.filter((d) => d.isFeatured);
    const nonFeaturedDeals = deals.filter((d) => !d.isFeatured && d.status === 'Active');
    return (
      <div className="flex flex-col w-full gap-6">
        {bannerNotice && (
          <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl flex items-center justify-between text-sm shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">verified</span>
              <span>{bannerNotice}</span>
            </div>
            <button onClick={() => setBannerNotice(null)} className="text-blue-500 hover:text-blue-800 text-xs font-semibold">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">Commercial Engine / Hero Placement</span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">Featured Placement & Hero Carousel</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage premium deal placements in the customer home feed hero banner, discover highlights, and cluster spotlights.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setBannerNotice('Reordered hero carousel placement positions based on revenue performance.'); setTimeout(() => setBannerNotice(null), 3500); }}
              className="h-9 px-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px] text-purple-600">auto_awesome</span>
              Auto-Rank by Revenue
            </button>
            <button
              onClick={() => { setBannerNotice('Published updated featured carousel to production CDN.'); setTimeout(() => setBannerNotice(null), 3500); }}
              className="h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">publish</span>
              Publish Carousel
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Currently Featured', value: String(featuredDeals.length || 2), icon: 'stars', color: 'amber' },
            { label: 'Available Slots', value: '8', icon: 'grid_view', color: 'blue' },
            { label: 'Featured CTR', value: '24.8%', icon: 'ads_click', color: 'emerald' },
            { label: 'Revenue from Hero', value: '₦12.4M', icon: 'payments', color: 'purple' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block">{stat.label}</span>
                <span className="text-xl font-bold text-slate-900 mt-0.5 block">{stat.value}</span>
              </div>
              <span className={`material-symbols-outlined text-[26px] text-${stat.color}-500`}>{stat.icon}</span>
            </div>
          ))}
        </div>

        {/* Hero Carousel Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm text-slate-900">Hero Carousel Slots (Max 8)</h2>
              <p className="text-xs text-slate-500">Drag to reorder. Deals in this section appear as sponsored hero banners in the customer app.</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${featuredDeals.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {featuredDeals.length || 2} / 8 Slots Used
            </span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Always show some featured deals for demo */}
            {[...featuredDeals, ...deals.filter(d => d.status === 'Active').slice(0, 2 - featuredDeals.length)].slice(0, 8).map((deal, idx) => (
              <div key={deal.id} className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-4 text-white shadow-sm overflow-hidden">
                <div className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">stars</span>
                  Featured #{idx + 1}
                </div>
                <div className="mb-3 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">{deal.merchant}</span>
                  <div className="font-bold text-sm leading-snug mt-0.5">{deal.title}</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{deal.discountValue} OFF</span>
                  <button
                    onClick={() => { setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, isFeatured: false } : d)); setBannerNotice(`Removed "${deal.title}" from hero carousel.`); setTimeout(() => setBannerNotice(null), 3000); }}
                    className="text-white/60 hover:text-white text-[10px] font-semibold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {/* Empty slot */}
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 min-h-[110px] cursor-pointer hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-[28px] mb-1">add_circle</span>
              <span className="text-xs font-semibold">Add Featured Deal</span>
            </div>
          </div>
        </div>

        {/* Eligible Deals to Feature */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-semibold text-sm text-slate-900">Active Deals Eligible for Featured Placement</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select deals to promote to the hero carousel. Deals already featured are shown above.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-4 text-left">Deal</th>
                  <th className="py-2.5 px-4 text-left">Merchant</th>
                  <th className="py-2.5 px-4 text-left">Discount</th>
                  <th className="py-2.5 px-4 text-left">Redemptions</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {nonFeaturedDeals.slice(0, 8).map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 truncate max-w-[180px]">{deal.title}</div>
                      <div className="font-mono text-[10px] text-blue-600">{deal.code}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{deal.merchant}</div>
                      <div className="text-[10px] text-slate-500">{deal.cluster}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-700">{deal.discountValue} OFF</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{deal.claimed} / {deal.totalQuota}</div>
                      <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.round(deal.claimed / deal.totalQuota * 100)}%` }}></div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, isFeatured: true } : d));
                          setBannerNotice(`"${deal.title}" promoted to hero carousel slot.`);
                          setTimeout(() => setBannerNotice(null), 3000);
                        }}
                        className="h-7 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold flex items-center gap-1 ml-auto"
                      >
                        <span className="material-symbols-outlined text-[13px]">stars</span>
                        Feature Deal
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-6">
      {bannerNotice && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl flex items-center justify-between text-sm shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">verified</span>
            <span>{bannerNotice}</span>
          </div>
          <button onClick={() => setBannerNotice(null)} className="text-blue-500 hover:text-blue-800 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header & Operational Actions */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Commercial Engine / Campaigns & Discounts
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Deal Listing & Campaign Management
          </h1>
          <p className="text-sm text-slate-500">
            Monitor merchant promotions, instant POS discounts, redemption velocity, and automated fraud guards.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportLedger}
            type="button"
            className="h-9 px-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Deals Ledger</span>
          </button>
          <button
            onClick={() => setShowPriceRulesModal(true)}
            type="button"
            className="h-9 px-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-600">tune</span>
            <span>Configure Price Rules</span>
          </button>
          <button
            onClick={() => setShowCreateDealModal(true)}
            type="button"
            className="h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Create Admin Deal</span>
          </button>
        </div>
      </section>

      {/* Operational KPI Ribbon (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total Live Deals</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">1,842</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">local_offer</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="inline-flex items-center text-blue-600 font-semibold gap-0.5">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +14.2%
            </span>
            <span>vs trailing 7 days</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Claimed & Redeemed</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">348,900</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
              89.2% POS Verified
            </span>
            <span>NFC & QR Taps</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Avg Discount Depth</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                22.4% <span className="text-sm font-normal text-slate-500">Off</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">percent</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Variance floor: 5%</span>
            <span>Ceiling cap: 70%</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Anomaly & Price Holds</span>
              <div className="text-2xl font-bold text-rose-600 mt-1">18 Flagged</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-600">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            <span>Auto-Sentinel: Markup tripwires</span>
          </div>
        </div>
      </div>

      {/* Dual-Pane Master Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT PANE: Master Table (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          {/* Table Filter and Search Header */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[240px]">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Deal Title, Code, Merchant, or Cluster..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filter Pills Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setFilterTab('ALL')}
                className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap transition-colors ${
                  filterTab === 'ALL'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All (1,842)
              </button>
              <button
                onClick={() => setFilterTab('ACTIVE')}
                className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap transition-colors ${
                  filterTab === 'ACTIVE'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Active Live (1,620)
              </button>
              <button
                onClick={() => setFilterTab('REVIEW')}
                className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap transition-colors ${
                  filterTab === 'REVIEW'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Under Review (62)
              </button>
              <button
                onClick={() => setFilterTab('EXPIRED')}
                className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap transition-colors ${
                  filterTab === 'EXPIRED'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Expired (142)
              </button>
              <button
                onClick={() => setFilterTab('FLAGGED')}
                className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                  filterTab === 'FLAGGED'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                Flagged (18)
              </button>
            </div>
          </div>

          {/* Master Deals Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-3">Deal Code & Title</th>
                  <th className="py-2.5 px-3">Merchant & Cluster</th>
                  <th className="py-2.5 px-3">Terms & Mechanics</th>
                  <th className="py-2.5 px-3">Redemptions</th>
                  <th className="py-2.5 px-3">Validity</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeals.map((deal) => {
                  const isSelected = deal.id === selectedDealId;
                  const percentRedeemed = Math.round((deal.claimed / deal.totalQuota) * 100);

                  return (
                    <tr
                      key={deal.id}
                      onClick={() => setSelectedDealId(deal.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/80 hover:bg-blue-50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {isSelected && <div className="w-1.5 h-7 bg-blue-600 rounded-full -ml-2" />}
                          <div>
                            <div className="font-bold text-blue-600">{deal.code}</div>
                            <div className="font-medium text-slate-900 truncate max-w-[160px]">{deal.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 truncate max-w-[140px]">{deal.merchant}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-blue-600">hub</span>
                          <span className="truncate max-w-[120px]">{deal.cluster}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800">{deal.terms}</span>
                        <div className="text-[10px] text-slate-400">Min {deal.minSpend} • Cap {deal.cap}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 font-medium text-slate-800">
                          <span>{deal.claimed}</span>
                          <span className="text-slate-400">/ {deal.totalQuota}</span>
                        </div>
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              percentRedeemed > 90 ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${percentRedeemed}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{deal.validity}</div>
                        <div className="text-[10px] text-slate-400">{deal.dateRange}</div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            deal.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : deal.status === 'Flagged'
                              ? 'bg-rose-100 text-rose-800'
                              : deal.status === 'Under Review'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {deal.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredDeals.length} of {deals.length} deals</span>
            <span className="font-mono text-[11px]">POS Terminal Rule Sync: Active</span>
          </div>
        </div>

        {/* RIGHT PANE: Deal Dossier Inspector (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden sticky top-20">
          {/* Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
                {selectedDeal.discountType} Deal
              </span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  selectedDeal.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedDeal.status === 'Flagged'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {selectedDeal.status}
              </span>
            </div>

            <div>
              <div className="font-mono text-xs text-blue-600 font-bold">{selectedDeal.code}</div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">{selectedDeal.title}</h2>
              <div className="text-xs text-slate-500 mt-0.5">
                Merchant: <span className="font-semibold text-slate-700">{selectedDeal.merchant}</span> • {selectedDeal.cluster}
              </div>
            </div>
          </div>

          {/* Dossier Body */}
          <div className="p-4 flex flex-col gap-4 text-xs max-h-[calc(100vh-270px)] overflow-y-auto">
            {/* Terms & Pricing Mechanics */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                Discount Mechanics & POS Terms
              </span>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Discount Value</span>
                  <span className="font-bold text-emerald-600 text-sm">{selectedDeal.discountValue} OFF</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Cap Deduction</span>
                  <span className="font-semibold text-slate-800">{selectedDeal.cap}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Minimum Order Spend</span>
                  <span className="font-semibold text-slate-800">{selectedDeal.minSpend}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">POS Instant Deduction</span>
                  <span className="font-semibold text-blue-600">NFC & QR Tap</span>
                </div>
              </div>
            </div>

            {/* Campaign Redemption Quota */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                Campaign Allocation & Quota
              </span>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Redemption Progress</span>
                  <span className="font-bold text-slate-900">
                    {selectedDeal.claimed} / {selectedDeal.totalQuota} ({Math.round((selectedDeal.claimed / selectedDeal.totalQuota) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${(selectedDeal.claimed / selectedDeal.totalQuota) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Remaining Vouchers: {selectedDeal.totalQuota - selectedDeal.claimed}</span>
                  <span>Validity: {selectedDeal.validity}</span>
                </div>
              </div>
            </div>

            {/* Fraud & Anomaly Sentinel Status */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                Automated Fraud & Sentinel Guard
              </span>
              <div
                className={`p-3 rounded-lg border text-xs flex flex-col gap-1.5 ${
                  selectedDeal.status === 'Flagged'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="material-symbols-outlined text-[16px]">
                    {selectedDeal.status === 'Flagged' ? 'warning' : 'verified_user'}
                  </span>
                  <span>{selectedDeal.status === 'Flagged' ? 'Anomaly Tripwire Tripped' : 'Sentinel Verification Passed'}</span>
                </div>
                <div className="text-[11px]">
                  {selectedDeal.flagReason
                    ? selectedDeal.flagReason
                    : 'Merchant pricing history verified against 30-day baseline. No price markup or ghost discounting detected.'}
                </div>
              </div>
            </div>

            {/* Administrative Action Bar */}
            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleFreezeToggle(selectedDeal.id)}
                  type="button"
                  className={`h-8 rounded-lg font-semibold flex items-center justify-center gap-1 text-xs transition-colors ${
                    selectedDeal.status === 'Active'
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {selectedDeal.status === 'Active' ? 'pause_circle' : 'play_circle'}
                  </span>
                  <span>{selectedDeal.status === 'Active' ? 'Freeze Deal' : 'Unfreeze Deal'}</span>
                </button>

                <button
                  onClick={() => handlePushToFeatured(selectedDeal.id)}
                  type="button"
                  className={`h-8 rounded-lg font-semibold flex items-center justify-center gap-1 text-xs transition-colors ${
                    selectedDeal.isFeatured
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">stars</span>
                  <span>{selectedDeal.isFeatured ? 'Featured Hero' : 'Push to Hero'}</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setBannerNotice(`Opened merchant configuration for ${selectedDeal.merchant}.`);
                  onNavigate?.('/admin/businesses');
                }}
                type="button"
                className="w-full h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">store</span>
                <span>Inspect Merchant Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Configure Price Rules */}
      {showPriceRulesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">tune</span>
                <h3 className="font-bold text-slate-900 text-sm">Automated Discount & Fraud Guard Rules</h3>
              </div>
              <button
                onClick={() => setShowPriceRulesModal(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Max Permitted Discount Ceiling</label>
                <input
                  type="text"
                  defaultValue="70% OFF"
                  className="h-8 px-3 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Markup Tripwire Window</label>
                <input
                  type="text"
                  defaultValue="14 Days Prior to Deal Activation"
                  className="h-8 px-3 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px]">
                Deals exceeding 50% discount automatically require dual admin verification before displaying on the customer home feed.
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowPriceRulesModal(false)}
                  className="h-8 px-3 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowPriceRulesModal(false);
                    setBannerNotice('Updated price rule sentinel parameters.');
                    setTimeout(() => setBannerNotice(null), 3000);
                  }}
                  className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Save Price Guard Rules
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Admin Deal */}
      {showCreateDealModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">add_circle</span>
                <h3 className="font-bold text-slate-900 text-sm">Create Administrative Campaign Deal</h3>
              </div>
              <button
                onClick={() => setShowCreateDealModal(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateDealSubmit} className="p-4 flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Deal Title *</label>
                <input
                  type="text"
                  required
                  value={newDealForm.title}
                  onChange={(e) => setNewDealForm({ ...newDealForm, title: e.target.value })}
                  placeholder="e.g. 20% Off Weekend Brunch Special"
                  className="h-8 px-3 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Merchant</label>
                  <select
                    value={newDealForm.merchant}
                    onChange={(e) => setNewDealForm({ ...newDealForm, merchant: e.target.value })}
                    className="h-8 px-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Slot Electronics Flagship">Slot Electronics Flagship</option>
                    <option value="Mega Seafood Hub">Mega Seafood Hub</option>
                    <option value="Chicken Republic QSR">Chicken Republic QSR</option>
                    <option value="Medplus Optical">Medplus Optical</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Cluster</label>
                  <input
                    type="text"
                    value={newDealForm.cluster}
                    onChange={(e) => setNewDealForm({ ...newDealForm, cluster: e.target.value })}
                    className="h-8 px-3 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Discount</label>
                  <input
                    type="text"
                    value={newDealForm.discountValue}
                    onChange={(e) => setNewDealForm({ ...newDealForm, discountValue: e.target.value })}
                    className="h-8 px-3 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Min Spend</label>
                  <input
                    type="text"
                    value={newDealForm.minSpend}
                    onChange={(e) => setNewDealForm({ ...newDealForm, minSpend: e.target.value })}
                    className="h-8 px-3 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Quota</label>
                  <input
                    type="number"
                    value={newDealForm.totalQuota}
                    onChange={(e) => setNewDealForm({ ...newDealForm, totalQuota: parseInt(e.target.value, 10) || 100 })}
                    className="h-8 px-3 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDealModal(false)}
                  className="h-8 px-3 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Publish Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
