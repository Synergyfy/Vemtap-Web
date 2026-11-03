import { useState, useMemo } from 'react';

interface AdPerformanceItem {
  id: string;
  name: string;
  code: string;
  badge: string;
  advertiser: string;
  advertiserInitial: string;
  format: string;
  formatClass: string;
  impressions: string;
  clicks: string;
  ctr: string;
  taps: string;
  tapShare: string;
  spend: string;
  roas: string;
  isTopPerformer?: boolean;
  lagosMainland: number;
  lagosIsland: number;
  abujaCentral: number;
  androidNfc: number;
  iosApplePay: number;
  unitCost: string;
  unitCostSaving: string;
  ledgerId: string;
  dwellTime: string;
  repeatRate: string;
  geoRadius: string;
}

const PERFORMANCE_DATA: AdPerformanceItem[] = [
  {
    id: 'perf_1',
    code: '#AD-2094',
    name: 'Slot Flagship Smartphone Fest',
    badge: 'Active Slot Hero',
    advertiser: 'Slot Electronics',
    advertiserInitial: 'S',
    format: 'Home Feed Hero #01',
    formatClass: 'bg-[#0055c4] text-white',
    impressions: '1,420,000',
    clicks: '91,200',
    ctr: '6.42% CTR',
    taps: '14,250 Taps',
    tapShare: '15.6% of clicks',
    spend: '₦3,120,000',
    roas: '12.3x ROAS',
    isTopPerformer: true,
    lagosMainland: 58,
    lagosIsland: 28,
    abujaCentral: 14,
    androidNfc: 64,
    iosApplePay: 36,
    unitCost: '₦218.90',
    unitCostSaving: '-24% below estimated retail CPA',
    ledgerId: '#BL-89240',
    dwellTime: '18.4 minutes',
    repeatRate: '31.2% (7-day window)',
    geoRadius: '1.8 km target ring',
  },
  {
    id: 'perf_2',
    code: '#AD-2089',
    name: 'Mega Seafood Weekend Catch',
    badge: 'Cluster Exclusive',
    advertiser: 'Mega Seafood Hub',
    advertiserInitial: 'M',
    format: 'Cluster Spotlight #02',
    formatClass: 'bg-blue-100 text-[#0055c4]',
    impressions: '480,000',
    clicks: '32,600',
    ctr: '6.79% CTR',
    taps: '5,420 Taps',
    tapShare: '16.6% of clicks',
    spend: '₦1,250,000',
    roas: '8.4x ROAS',
    lagosMainland: 22,
    lagosIsland: 68,
    abujaCentral: 10,
    androidNfc: 52,
    iosApplePay: 48,
    unitCost: '₦230.50',
    unitCostSaving: '-18% below estimated retail CPA',
    ledgerId: '#BL-89218',
    dwellTime: '24.2 minutes',
    repeatRate: '28.4% (7-day window)',
    geoRadius: '2.5 km target ring',
  },
  {
    id: 'perf_3',
    code: '#AD-2081',
    name: 'Medplus Immunity Push',
    badge: 'Health Section',
    advertiser: 'Medplus Pharmacy',
    advertiserInitial: 'P',
    format: 'Category Header',
    formatClass: 'bg-slate-100 text-slate-700',
    impressions: '620,000',
    clicks: '31,000',
    ctr: '5.00% CTR',
    taps: '4,110 Taps',
    tapShare: '13.2% of clicks',
    spend: '₦850,000',
    roas: '6.2x ROAS',
    lagosMainland: 45,
    lagosIsland: 42,
    abujaCentral: 13,
    androidNfc: 70,
    iosApplePay: 30,
    unitCost: '₦206.80',
    unitCostSaving: '-29% below estimated retail CPA',
    ledgerId: '#BL-89190',
    dwellTime: '12.8 minutes',
    repeatRate: '42.1% (7-day window)',
    geoRadius: '1.2 km target ring',
  },
  {
    id: 'perf_4',
    code: '#AD-2065',
    name: 'Chicken Republic Lunch Promo',
    badge: 'Keyword Bidding',
    advertiser: 'Chicken Republic',
    advertiserInitial: 'C',
    format: 'Search Intercept',
    formatClass: 'bg-sky-100 text-sky-800',
    impressions: '840,000',
    clicks: '48,720',
    ctr: '5.80% CTR',
    taps: '18,900 Taps',
    tapShare: '38.8% of clicks',
    spend: '₦1,420,000',
    roas: '9.8x ROAS',
    lagosMainland: 62,
    lagosIsland: 24,
    abujaCentral: 14,
    androidNfc: 78,
    iosApplePay: 22,
    unitCost: '₦75.10',
    unitCostSaving: '-45% below estimated QSR CPA',
    ledgerId: '#BL-89144',
    dwellTime: '16.5 minutes',
    repeatRate: '54.0% (7-day window)',
    geoRadius: '3.0 km target ring',
  },
  {
    id: 'perf_5',
    code: '#AD-2068',
    name: 'Casabella Glamour Week',
    badge: 'Radius Beacon',
    advertiser: 'Casabella Beauty',
    advertiserInitial: 'B',
    format: 'Geofence Intercept',
    formatClass: 'bg-purple-100 text-purple-800',
    impressions: '220,000',
    clicks: '11,440',
    ctr: '5.20% CTR',
    taps: '2,120 Taps',
    tapShare: '18.5% of clicks',
    spend: '₦650,000',
    roas: '4.9x ROAS',
    lagosMainland: 18,
    lagosIsland: 76,
    abujaCentral: 6,
    androidNfc: 44,
    iosApplePay: 56,
    unitCost: '₦306.60',
    unitCostSaving: '-12% below luxury CPA',
    ledgerId: '#BL-89088',
    dwellTime: '38.0 minutes',
    repeatRate: '22.5% (7-day window)',
    geoRadius: '1.0 km target ring',
  },
];

interface AdminAdPerformanceScreenProps {
  onNavigate: (path: string) => void;
}

export function AdminAdPerformanceScreen({ onNavigate }: AdminAdPerformanceScreenProps) {
  const [selectedId, setSelectedId] = useState<string>(PERFORMANCE_DATA[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const selectedItem = useMemo(() => {
    return PERFORMANCE_DATA.find((p) => p.id === selectedId) || PERFORMANCE_DATA[0];
  }, [selectedId]);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const filteredItems = useMemo(() => {
    return PERFORMANCE_DATA.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.advertiser.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFormat = formatFilter === 'ALL' || item.format.toLowerCase().includes(formatFilter.toLowerCase());
      return matchesSearch && matchesFormat;
    });
  }, [searchQuery, formatFilter]);

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

      {/* Dynamic Notification / Top Breadcrumb Alert Context */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0055c4] shrink-0 animate-pulse"></span>
          <span className="text-[11px] font-bold text-[#0055c4] uppercase tracking-wider">
            Live Ad Stream Telemetry
          </span>
          <span className="text-slate-300 text-[12px]">/</span>
          <span className="text-[12px] text-slate-500 truncate">
            Data consolidated across 14 commercial clusters (Lagos, Abuja, Port Harcourt). Synchronized 4 mins ago.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-[#0055c4]">verified</span>
            ATTRIBUTION CERTIFIED (NFC TAP-ENGINE 3.2)
          </span>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="max-w-3xl">
          <div className="flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider font-semibold">
            <span className="text-[#0055c4]">07 Marketing &amp; Ads</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Telemetry &amp; Conversion Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Advertising Performance &amp; Engagement Telemetry
          </h1>
          <p className="text-[14px] text-slate-500 mt-1 leading-relaxed">
            Cross-campaign analytics, impression yield, click-through rates, in-store footfall conversion, and advertiser ROI across all ad formats.
          </p>
        </div>

        {/* Top Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center bg-white border border-slate-200/80 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="material-symbols-outlined text-[18px] text-[#0055c4] mr-2">calendar_today</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Date Range</span>
              <span className="text-[12px] text-slate-800 font-semibold">Last 30 Days (Oct 01 - Oct 31)</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-400 ml-2">expand_more</span>
          </div>
          <button
            onClick={() => triggerNotice('Downloading Ad Performance CSV report...')}
            className="h-9 px-3.5 rounded-lg bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-800 text-[12px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">file_download</span>
            <span>Export Performance CSV</span>
          </button>
          <button
            onClick={() => triggerNotice('Executive report dispatch scheduled for weekly Monday digest.')}
            className="h-9 px-4 rounded-lg bg-[#0055c4] hover:bg-[#066cf4] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
            <span>Schedule Executive Report</span>
          </button>
        </div>
      </div>

      {/* KPI CARDS (4 across top) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Ad Impressions</span>
            <span className="p-1 rounded bg-blue-50 text-[#0055c4]">
              <span className="material-symbols-outlined text-[18px]">visibility</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">4.28M</span>
            <span className="text-[11px] text-[#03543F] bg-[#DEF7EC] px-2 py-0.5 rounded-full font-bold">+18.4% MoM</span>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-lg text-[11px]">
            <span className="text-slate-500">Viewability Score</span>
            <span className="text-[#0055c4] font-bold">99.2% verified</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Click-Through (CTR)</span>
            <span className="p-1 rounded bg-blue-50 text-[#0055c4]">
              <span className="material-symbols-outlined text-[18px]">ads_click</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">5.82%</span>
            <span className="text-[11px] text-[#03543F] bg-[#DEF7EC] px-2 py-0.5 rounded-full font-bold">+2.72% vs base</span>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-lg text-[11px]">
            <span className="text-slate-500">Benchmark Target</span>
            <span className="text-slate-700 font-medium">3.1% industry standard</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Physical NFC/Tap Conversions</span>
            <span className="p-1 rounded bg-blue-50 text-[#0055c4]">
              <span className="material-symbols-outlined text-[18px]">contactless</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">84,210</span>
            <span className="text-[11px] text-[#0055c4] bg-blue-50 px-2 py-0.5 rounded-full font-bold">Taps</span>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-lg text-[11px]">
            <span className="text-slate-500">Tap Attribution Rate</span>
            <span className="text-[#0055c4] font-bold">19.6% footfall yield</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Platform Ad Revenue</span>
            <span className="p-1 rounded bg-blue-50 text-[#0055c4]">
              <span className="material-symbols-outlined text-[18px]">monetization_on</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">₦38.45M</span>
            <span className="text-[11px] text-[#03543F] bg-[#DEF7EC] px-2 py-0.5 rounded-full font-bold">MTD</span>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-lg text-[11px]">
            <span className="text-slate-500">Avg eCPM Realized</span>
            <span className="text-slate-800 font-bold">₦1,180.00 / 1k</span>
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE: TOP HALF (Interactive Charts & Placement Yield Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT CHART (60% width -> 7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-[11px] font-bold text-[#0055c4] uppercase tracking-wider block">Engagement Correlation</span>
                <h2 className="text-base font-bold text-slate-900">Impression vs In-Store Footfall Tap Trends (Daily)</h2>
              </div>
              <div className="flex items-center gap-3 text-[12px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#0055c4]"></span>
                  <span className="text-slate-600">Impressions</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                  <span className="text-slate-600">NFC Footfall Taps</span>
                </span>
              </div>
            </div>
            <p className="text-[12px] text-slate-500 mb-4">
              Telemetry correlation demonstrates elevated physical store walk-ins within 4 hours of digital ad delivery across geo-fenced clusters.
            </p>

            {/* Dynamic SVG Chart Canvas */}
            <div className="w-full h-56 relative bg-slate-50/70 rounded-xl p-3 flex flex-col justify-between border border-slate-100">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 200">
                <defs>
                  <linearGradient id="primaryAreaGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0055c4" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#0055c4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,160 Q 40,140 80,120 T 160,90 T 240,110 T 320,50 T 400,65 T 480,30 T 560,40 L 600,20 L 600,200 L 0,200 Z"
                  fill="url(#primaryAreaGrad)"
                />
                <path
                  d="M 0,160 Q 40,140 80,120 T 160,90 T 240,110 T 320,50 T 400,65 T 480,30 T 560,40 L 600,20"
                  fill="none"
                  stroke="#0055c4"
                  strokeLinecap="round"
                  strokeWidth="3"
                />
                <path
                  d="M 0,185 Q 40,175 80,165 T 160,140 T 240,145 T 320,105 T 400,115 T 480,80 T 560,85 L 600,60"
                  fill="none"
                  stroke="#059669"
                  strokeDasharray="4 2"
                  strokeWidth="2.5"
                />
                <circle cx="320" cy="50" fill="#0055c4" r="5" className="animate-pulse" />
                <circle cx="320" cy="105" fill="#059669" r="5" />
                <circle cx="480" cy="30" fill="#0055c4" r="5" />
                <circle cx="480" cy="80" fill="#059669" r="5" />
              </svg>
              <div className="flex justify-between items-center text-slate-400 text-[10px] font-mono pt-1 border-t border-slate-200">
                <span>Oct 01</span>
                <span>Oct 06</span>
                <span>Oct 11</span>
                <span>Oct 16 (Mid-Month Peak)</span>
                <span>Oct 21</span>
                <span>Oct 26</span>
                <span>Oct 31</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px]">
            <div>
              <span className="font-bold text-slate-400 uppercase">Peak Day Volume</span>
              <div className="text-base font-bold text-slate-900">218,400</div>
              <span className="text-slate-400 text-[10px]">Oct 27 (Weekend Spike)</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase">Tap Elasticity</span>
              <div className="text-base font-bold text-[#0055c4]">+14.2%</div>
              <span className="text-slate-400 text-[10px]">vs Digital Clickout</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase">Confidence</span>
              <div className="text-base font-bold text-[#03543F]">98.4%</div>
              <span className="text-slate-400 text-[10px]">Crypt-checked</span>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: PLACEMENT FORMAT PERFORMANCE SHARE (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#0055c4] uppercase tracking-wider">Format Distribution</span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">4 Formats Monitored</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-3">Placement Format Performance Share</h2>

            {/* Interactive Stacked Visual Bar */}
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex mb-4">
              <div className="h-full bg-[#0055c4]" style={{ width: '46%' }} title="Home Feed Hero: 46%"></div>
              <div className="h-full bg-blue-400" style={{ width: '24%' }} title="Search Intercept: 24%"></div>
              <div className="h-full bg-indigo-500" style={{ width: '18%' }} title="Category Banner: 18%"></div>
              <div className="h-full bg-amber-500" style={{ width: '12%' }} title="Cluster Spotlight: 12%"></div>
            </div>

            {/* Format breakdown cards */}
            <div className="space-y-2 text-[12px]">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-3 h-3 rounded-xs bg-[#0055c4] shrink-0"></span>
                  <div className="truncate">
                    <span className="font-bold text-slate-900 block truncate">Home Screen Hero</span>
                    <span className="text-[10px] text-slate-400">46% share (1.97M impr.)</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-[#0055c4] block">6.42% CTR</span>
                  <span className="text-[10px] text-[#03543F] font-semibold">12.8% Tap Conv.</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-3 h-3 rounded-xs bg-blue-400 shrink-0"></span>
                  <div className="truncate">
                    <span className="font-bold text-slate-900 block truncate">Search Intercept</span>
                    <span className="text-[10px] text-slate-400">24% share (1.02M impr.)</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-[#0055c4] block">5.80% CTR</span>
                  <span className="text-[10px] text-[#03543F] font-semibold">22.5% Tap Conv.</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-3 h-3 rounded-xs bg-indigo-500 shrink-0"></span>
                  <div className="truncate">
                    <span className="font-bold text-slate-900 block truncate">Category Banner</span>
                    <span className="text-[10px] text-slate-400">18% share (770k impr.)</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-[#0055c4] block">5.00% CTR</span>
                  <span className="text-[10px] text-[#03543F] font-semibold">13.2% Tap Conv.</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-3 h-3 rounded-xs bg-amber-500 shrink-0"></span>
                  <div className="truncate">
                    <span className="font-bold text-slate-900 block truncate">Cluster Spotlight</span>
                    <span className="text-[10px] text-slate-400">12% share (513k impr.)</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-[#0055c4] block">6.79% CTR</span>
                  <span className="text-[10px] text-[#03543F] font-semibold">16.6% Tap Conv.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 text-center border-t border-slate-100 text-[11px] text-slate-500">
            <span>Highest engagement efficiency in: </span>
            <span className="text-[#0055c4] font-bold">Ikeja Cluster 01 &amp; Victoria Island</span>
          </div>
        </div>
      </div>

      {/* BOTTOM HALF: Granular Advertiser & Ad Unit Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Table Filter and Search Header */}
        <div className="p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border-b border-slate-100">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Advertiser, Campaign, Placement, or Ad Unit ID..."
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 text-[12px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055c4]/30"
              />
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Showing {filteredItems.length} active ad telemetry tracks
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-bold uppercase mr-1.5">Format:</span>
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Placement Types</option>
                <option value="Hero">Home Screen Hero</option>
                <option value="Spotlight">Cluster Spotlight</option>
                <option value="Category">Category Header</option>
                <option value="Search">Search Intercept</option>
                <option value="Geofence">Geofence Intercept</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <th className="py-3 px-4">Ad Campaign &amp; ID</th>
                <th className="py-3 px-4">Advertiser</th>
                <th className="py-3 px-4">Placement Format</th>
                <th className="py-3 px-4 text-right">Impressions</th>
                <th className="py-3 px-4 text-right">Clicks / CTR</th>
                <th className="py-3 px-4 text-right">In-Store Footfall Taps</th>
                <th className="py-3 px-4 text-right">Spend</th>
                <th className="py-3 px-4 text-right">ROAS / Conv. Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredItems.map((item) => {
                const isSelected = item.id === selectedId;

                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 hover:bg-blue-50 font-medium'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-7 rounded-full shrink-0 ${isSelected ? 'bg-[#0055c4]' : 'bg-transparent'}`}></span>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate text-[13px]">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.code} • {item.badge}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded bg-blue-100 text-[#0055c4] flex items-center justify-center font-bold text-[10px]">
                          {item.advertiserInitial}
                        </span>
                        <span className="font-semibold text-slate-800">{item.advertiser}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.formatClass}`}>
                        {item.format}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">{item.impressions}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-bold text-slate-900">{item.clicks}</div>
                      <div className="text-[10px] text-[#0055c4] font-semibold">{item.ctr}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-bold text-[#03543F]">{item.taps}</div>
                      <div className="text-[10px] text-slate-400">{item.tapShare}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">{item.spend}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-[#DEF7EC] text-[#03543F] font-bold">
                        {item.roas}
                      </span>
                      {item.isTopPerformer && (
                        <div className="text-[10px] text-slate-400 mt-0.5 font-semibold">Top Performer</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTIVE INSPECTOR PANEL: Detailed Breakdown for Active Selection */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 relative overflow-hidden transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0055c4] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">query_stats</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Active Selection: {selectedItem.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#DEF7EC] text-[#03543F] font-bold">
                  {selectedItem.code}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {selectedItem.advertiser} • Placement: {selectedItem.format} • Status: Running
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/admin/businesses')}
            className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-[#0055c4] text-[11px] font-bold flex items-center gap-1 transition-colors border border-slate-200"
          >
            <span>View {selectedItem.advertiser} Profile</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>

        {/* 4 High Precision Inspector Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-[12px]">
          {/* Insight 1: Demographic & Geo Distribution */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Demographic &amp; Geo Distribution
              </span>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-700 font-medium">Lagos Mainland (Ikeja)</span>
                    <span className="font-bold text-[#0055c4]">{selectedItem.lagosMainland}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0055c4]" style={{ width: `${selectedItem.lagosMainland}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-700 font-medium">Lagos Island (Lekki/VI)</span>
                    <span className="font-bold text-[#0055c4]">{selectedItem.lagosIsland}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400" style={{ width: `${selectedItem.lagosIsland}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-700 font-medium">Abuja Central</span>
                    <span className="font-bold text-[#0055c4]">{selectedItem.abujaCentral}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400" style={{ width: `${selectedItem.abujaCentral}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-400">
              Highest density: Ikeja Computer Village Cluster
            </div>
          </div>

          {/* Insight 2: Device Split */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Device &amp; Protocol Split
              </span>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
                  <span className="material-symbols-outlined text-[#0055c4] text-[24px]">smartphone</span>
                </div>
                <div className="w-full space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-700 font-medium">Android NFC</span>
                      <span className="font-bold text-slate-900">{selectedItem.androidNfc}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-emerald-600" style={{ width: `${selectedItem.androidNfc}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-700 font-medium">iOS Apple Pay / Wallet</span>
                      <span className="font-bold text-slate-900">{selectedItem.iosApplePay}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-[#0055c4]" style={{ width: `${selectedItem.iosApplePay}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-400">
              100% verified hardware handshakes
            </div>
          </div>

          {/* Insight 3: Cost Per In-Store Tap */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Footfall Acquisition Unit Cost
              </span>
              <div className="mt-1">
                <div className="text-2xl font-extrabold text-slate-900">{selectedItem.unitCost}</div>
                <span className="text-[10px] text-[#03543F] font-bold flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">trending_down</span>
                  {selectedItem.unitCostSaving}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Cost calculated per authenticated customer walk-in tap at verified in-store POS terminal.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-semibold">
              Spend to Footfall Efficiency: A+ Grade
            </div>
          </div>

          {/* Insight 4: Attribution Ledger Verification */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Campaign Integrity Ledger
              </span>
              <div className="space-y-1 mt-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Click Fraud Flag:</span>
                  <span className="font-bold text-[#03543F]">0.02% (Suppressed)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Avg Physical Dwell:</span>
                  <span className="font-semibold text-slate-900">{selectedItem.dwellTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Repeat Visitors:</span>
                  <span className="font-semibold text-[#0055c4]">{selectedItem.repeatRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Geo Radius Anchor:</span>
                  <span className="font-semibold text-slate-900">{selectedItem.geoRadius}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
              <span className="font-mono text-slate-400">{selectedItem.ledgerId}</span>
              <button
                onClick={() => triggerNotice(`Audit trail verification crypt-checked for ${selectedItem.code}.`)}
                className="text-[#0055c4] font-bold hover:underline"
              >
                Audit Trail
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

