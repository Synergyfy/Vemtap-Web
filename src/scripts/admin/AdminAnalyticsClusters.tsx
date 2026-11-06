import { useState } from 'react';

interface AdminAnalyticsClustersProps {
  onNavigate: (path: string) => void;
}

const CLUSTERS = [
  {
    name: 'Victoria Island Central',
    id: 'LAG-VI-01 • Tier 1',
    state: 'Lagos',
    lga: 'Eti-Osa LGA',
    merchants: '148',
    merchantsVerified: '98% verified',
    mau: '68,420',
    mauGrowth: '↑ 8.4%',
    scans: '42,100',
    scansDaily: '2.1k / day avg',
    atv: '₦3,390',
    gmv: '₦142.8M',
    share: '32.4% share',
    score: 'A+ Optimal',
    scoreClass: 'bg-emerald-100 text-emerald-800',
    dotClass: 'bg-emerald-500',
  },
  {
    name: 'Lekki Phase 1 Admirals Way',
    id: 'LAG-LEK-02 • Tier 1',
    state: 'Lagos',
    lga: 'Eti-Osa East',
    merchants: '132',
    merchantsVerified: '95% verified',
    mau: '54,190',
    mauGrowth: '↑ 12.1%',
    scans: '36,800',
    scansDaily: '1.8k / day avg',
    atv: '₦3,210',
    gmv: '₦118.4M',
    share: '26.8% share',
    score: 'A+ Optimal',
    scoreClass: 'bg-emerald-100 text-emerald-800',
    dotClass: 'bg-emerald-500',
  },
  {
    name: 'Ikeja GRA Commercial Spine',
    id: 'LAG-IKJ-01 • Tier 2',
    state: 'Lagos',
    lga: 'Ikeja LGA',
    merchants: '108',
    merchantsVerified: '91% verified',
    mau: '41,200',
    mauGrowth: '↑ 4.2%',
    scans: '29,500',
    scansDaily: '1.4k / day avg',
    atv: '₦2,980',
    gmv: '₦88.2M',
    share: '20.0% share',
    score: 'A High',
    scoreClass: 'bg-blue-100 text-blue-800',
    dotClass: 'bg-blue-500',
  },
  {
    name: 'Wuse II Aminu Kano District',
    id: 'ABU-WUS-01 • Tier 2',
    state: 'Abuja (FCT)',
    lga: 'Municipal Area',
    merchants: '89',
    merchantsVerified: '94% verified',
    mau: '32,800',
    mauGrowth: '↑ 6.8%',
    scans: '24,200',
    scansDaily: '1.1k / day avg',
    atv: '₦3,070',
    gmv: '₦74.5M',
    share: '16.9% share',
    score: 'A High',
    scoreClass: 'bg-blue-100 text-blue-800',
    dotClass: 'bg-blue-500',
  },
  {
    name: 'Yaba Innovation Corridor',
    id: 'LAG-YAB-03 • Tier 3',
    state: 'Lagos',
    lga: 'Lagos Mainland',
    merchants: '76',
    merchantsVerified: '88% verified',
    mau: '49,300',
    mauGrowth: '↑ 15.3%',
    scans: '31,000',
    scansDaily: 'High frequency',
    atv: '₦1,480',
    gmv: '₦46.1M',
    share: '10.4% share',
    score: 'B+ Growth',
    scoreClass: 'bg-amber-100 text-amber-900',
    dotClass: 'bg-amber-500',
  },
  {
    name: 'GRA Phase 2 Commercial Ring',
    id: 'RIV-PHC-01 • Tier 3',
    state: 'Rivers',
    lga: 'Port Harcourt LGA',
    merchants: '51',
    merchantsVerified: '82% verified',
    mau: '18,600',
    mauGrowth: '− 1.1%',
    scans: '14,700',
    scansDaily: '0.7k / day',
    atv: '₦2,640',
    gmv: '₦38.9M',
    share: '8.8% share',
    score: 'Watchlist',
    scoreClass: 'bg-slate-100 text-slate-700',
    dotClass: 'bg-slate-400',
  },
];

export function AdminAnalyticsClusters({ onNavigate: _onNavigate }: AdminAnalyticsClustersProps) {
  const [mapMode, setMapMode] = useState<'density' | 'pins' | 'flows'>('density');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredClusters = CLUSTERS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-sm">verified</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Action / Filter Header Context Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <span>Regional Footprint Engine</span>
            <span className="w-1 h-1 rounded-full bg-slate-400"></span>
            <span className="text-[#0055c4] font-semibold">GPS Geofence Mesh Active</span>
            <span className="w-1 h-1 rounded-full bg-slate-400"></span>
            <span>Coverage Index: 98.88%</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Clusters &amp; Regional Footprint Analytics
            </h2>
            <span className="bg-blue-50 text-[#0055c4] text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-blue-200/60">
              v3.8 Live
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 h-9 px-3 bg-slate-100 rounded-xl text-xs font-semibold text-slate-800">
            <span className="material-symbols-outlined text-sm text-slate-500">location_on</span>
            <span>Nigeria: Lagos Core</span>
          </div>
          <div className="flex items-center gap-1.5 h-9 px-3 bg-slate-100 rounded-xl text-xs font-semibold text-slate-800">
            <span className="material-symbols-outlined text-sm text-slate-500">hub</span>
            <span>All Cluster Tiers</span>
          </div>
          <button
            type="button"
            onClick={() => showToast('Geospatial deck generated.')}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-xl bg-[#0055c4] hover:bg-[#00429b] text-white text-xs font-bold shadow-2xs transition-all"
          >
            <span className="material-symbols-outlined text-sm">map</span>
            <span>Export Geospatial Deck</span>
          </button>
        </div>
      </div>

      {/* 4 High-Impact Regional KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Active Commercial Clusters</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold text-slate-900">28</span>
                <span className="text-xs text-slate-400">Hubs</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0055c4] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">share_location</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Spread over 3 States</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase">+4 This Quarter</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Merchant Cluster Density</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold text-slate-900">122</span>
                <span className="text-xs text-slate-400">Outlets / Avg</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">store_mall_directory</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Saturation Index: 78.4%</span>
            <span className="text-[#0055c4] font-semibold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-sm">trending_up</span>+11.2% YoY
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Footfall &amp; POS Scans</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold text-slate-900">894.2k</span>
                <span className="text-xs text-slate-400">Signals</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0055c4] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">radar</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Peak: 18:00 - 21:30 WAT</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase">High Engagement</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Apex Hub (By Volume)</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-lg font-bold text-slate-900 truncate max-w-[150px]">Victoria Island</span>
                <span className="text-xs text-[#0055c4] font-bold">Tier-1</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">trophy</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-900">₦142.8M GMV</span>
            <span>42,100 Check-ins</span>
          </div>
        </div>
      </div>

      {/* Geospatial Heatmap & Density Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Map (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Geospatial Polygonal Heatmap</h3>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">EPSG:4326</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Real-time GPS boundary pings, merchant clusters, and active POS beacon radius</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setMapMode('density')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${mapMode === 'density' ? 'bg-white text-[#0055c4] shadow-2xs' : 'text-slate-600'}`}
              >
                Density Heatmap
              </button>
              <button
                type="button"
                onClick={() => setMapMode('pins')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${mapMode === 'pins' ? 'bg-white text-[#0055c4] shadow-2xs' : 'text-slate-600'}`}
              >
                Merchant Pins
              </button>
              <button
                type="button"
                onClick={() => setMapMode('flows')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${mapMode === 'flows' ? 'bg-white text-[#0055c4] shadow-2xs' : 'text-slate-600'}`}
              >
                Footfall Flows
              </button>
            </div>
          </div>

          {/* Map canvas */}
          <div className="relative w-full h-[360px] bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center border border-slate-800">
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="gridMap" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#60a5fa" strokeWidth="0.75" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#gridMap)" />
            </svg>

            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="120,80 240,65 310,130 260,240 140,210" fill="rgba(6, 108, 244, 0.22)" stroke="#066cf4" strokeWidth="1.75" strokeDasharray="4 2" />
              <circle cx="210" cy="140" r="48" fill="rgba(6, 108, 244, 0.35)" />
              <circle cx="210" cy="140" r="18" fill="#066cf4" />

              <polygon points="340,140 460,110 520,180 430,260 330,210" fill="rgba(99, 102, 241, 0.18)" stroke="#818cf8" strokeWidth="1.5" />
              <circle cx="420" cy="170" r="32" fill="rgba(99, 102, 241, 0.3)" />
              <circle cx="420" cy="170" r="12" fill="#6366f1" />

              <polygon points="160,260 270,250 290,320 180,340" fill="rgba(14, 165, 233, 0.2)" stroke="#38bdf8" strokeWidth="1.5" />
              <circle cx="225" cy="295" r="24" fill="rgba(14, 165, 233, 0.3)" />

              <circle cx="100" cy="190" r="38" fill="rgba(244, 63, 94, 0.15)" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="100" cy="190" r="8" fill="#f43f5e" />

              <line x1="210" y1="140" x2="420" y2="170" stroke="#38bdf8" strokeWidth="1.25" strokeDasharray="2 4" opacity="0.6" />
              <line x1="210" y1="140" x2="100" y2="190" stroke="#60a5fa" strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />
            </svg>

            {/* Interactive Pin Tooltip */}
            <div className="absolute top-10 left-16 bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl max-w-xs z-10 border border-slate-200/80">
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="font-bold text-slate-900 text-xs">LAG-VI-01 Apex Geofence</span>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Live Scan</span>
              </div>
              <p className="text-[11px] text-slate-500">Victoria Island Central Commercial Belt</p>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-1.5 border-t border-slate-100 text-[11px]">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Density</span>
                  <span className="font-bold text-slate-900">148 Outlets</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Footfall Index</span>
                  <span className="font-bold text-[#0055c4]">96.4 / 100</span>
                </div>
              </div>
            </div>

            {/* Bottom HUD */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-slate-300 text-xs font-mono border border-slate-700/60">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span>Active Nodes: 28</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-400"></span>GPS Accuracy: ±2.4m</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 uppercase text-[10px]">Geofence Drift</span>
                <span className="text-emerald-400 font-semibold">0.12% (Nominal)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footfall vs Revenue Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Footfall vs Revenue Index</h3>
              <span className="text-[11px] text-slate-500">Top 6 Clusters</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-[#0055c4]">Ranked</span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Victoria Island Central (LAG)', gmv: '₦142.8M', width: '88%', footfall: '42.1k', atv: '₦3,390', color: 'bg-[#0055c4]' },
              { name: 'Lekki Phase 1 Admirals (LAG)', gmv: '₦118.4M', width: '72%', footfall: '36.8k', atv: '₦3,210', color: 'bg-[#0055c4]' },
              { name: 'Ikeja GRA Business (LAG)', gmv: '₦88.2M', width: '58%', footfall: '29.5k', atv: '₦2,980', color: 'bg-indigo-600' },
              { name: 'Wuse II Commercial (ABU)', gmv: '₦74.5M', width: '48%', footfall: '24.2k', atv: '₦3,070', color: 'bg-indigo-600' },
              { name: 'Yaba Tech District (LAG)', gmv: '₦46.1M', width: '32%', footfall: '31.0k', atv: '₦1,480', color: 'bg-slate-500' },
              { name: 'GRA Phase 2 (PHC)', gmv: '₦38.9M', width: '26%', footfall: '14.7k', atv: '₦2,640', color: 'bg-slate-500' },
            ].map(item => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 truncate">{item.name}</span>
                  <span className="font-bold text-[#0055c4] font-mono">{item.gmv}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: item.width }}></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Footfall: {item.footfall}</span>
                  <span>ATV: {item.atv}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Cluster GMV Concentration</span>
            <span className="font-bold text-slate-900">Top 3 = 68.2%</span>
          </div>
        </div>
      </div>

      {/* Cluster Performance Ledger Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Detailed Cluster Performance Ledger</h3>
            <span className="text-xs text-slate-500">Verified performance matrix for geofenced commercial polygons</span>
          </div>
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
            <input
              type="text"
              placeholder="Filter by cluster ID or name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0055c4] focus:bg-white"
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Cluster Identifier</th>
                <th className="py-3 px-3">State / LGA</th>
                <th className="py-3 px-3">Active Merch.</th>
                <th className="py-3 px-3">Consumer Density (MAU)</th>
                <th className="py-3 px-3">Scans &amp; Check-ins</th>
                <th className="py-3 px-3">Avg ATV</th>
                <th className="py-3 px-3">Monthly GMV</th>
                <th className="py-3 px-4 text-right">Health Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClusters.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${c.dotClass}`}></div>
                      <div>
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{c.state}</div>
                    <div className="text-[11px] text-slate-400">{c.lga}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{c.merchants}</div>
                    <div className="text-[11px] text-slate-400">{c.merchantsVerified}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{c.mau}</div>
                    <div className="text-[11px] text-emerald-600 font-semibold">{c.mauGrowth}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{c.scans}</div>
                    <div className="text-[11px] text-slate-400">{c.scansDaily}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{c.atv}</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 font-mono">{c.gmv}</div>
                    <div className="text-[11px] text-slate-400">{c.share}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${c.scoreClass}`}>
                      {c.score}
                    </span>
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

