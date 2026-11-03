import { useState } from 'react';

interface AdminAnalyticsGrowthProps {
  onNavigate: (path: string) => void;
}

const CATEGORIES = [
  { name: 'F&B / Dining', count: '1,140', share: '33.4%', width: '78%', icon: 'restaurant' },
  { name: 'Retail & Fashion', count: '890', share: '26.1%', width: '62%', icon: 'checkroom' },
  { name: 'Health & Wellness', count: '480', share: '14.1%', width: '44%', icon: 'spa' },
  { name: 'Hospitality & Stays', count: '522', share: '15.3%', width: '48%', icon: 'hotel' },
  { name: 'Electronics & Tech', count: '380', share: '11.1%', width: '35%', icon: 'devices_other' },
];

const COHORTS = [
  { month: 'Jan 2024', newUsers: '18,240', m0: '100%', m1: '68.4%', m2: '54.2%', m3: '48.1%', m6: '42.8%', status: 'Stabilized', color: 'emerald' },
  { month: 'Feb 2024', newUsers: '20,110', m0: '100%', m1: '71.2%', m2: '58.6%', m3: '51.4%', m6: '46.0%', status: 'Optimized', color: 'emerald' },
  { month: 'Mar 2024', newUsers: '22,850', m0: '100%', m1: '73.8%', m2: '61.2%', m3: '54.9%', m6: 'In Progress', status: 'Surging', color: 'blue' },
  { month: 'Apr 2024', newUsers: '24,300', m0: '100%', m1: '75.1%', m2: '63.5%', m3: '—', m6: '—', status: 'Above Avg', color: 'blue' },
  { month: 'May 2024', newUsers: '27,100', m0: '100%', m1: '77.4%', m2: '—', m3: '—', m6: '—', status: 'Peak Entry', color: 'blue' },
  { month: 'Jun 2024', newUsers: '28,900', m0: '100%', m1: 'Tracking...', m2: '—', m3: '—', m6: '—', status: 'Gathering', color: 'slate' },
];

export function AdminAnalyticsGrowth({ onNavigate: _onNavigate }: AdminAnalyticsGrowthProps) {
  const [selectedCohort, setSelectedCohort] = useState('All Users');
  const [selectedCluster, setSelectedCluster] = useState('All Clusters');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-sm">verified</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Operational Header & Multi-Filter Control Plane */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0055c4]"></span>
            <span>Telemetry Stream • Growth Operations</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Customer &amp; Business Growth
            </h2>
            <span className="text-xs text-slate-500 font-medium">Ecosystem Cohort Analytics</span>
          </div>
        </div>

        {/* Filter Pipeline Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedCohort}
            onChange={e => setSelectedCohort(e.target.value)}
            className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-xl outline-none cursor-pointer border border-transparent focus:border-[#0055c4]"
          >
            <option>All Users</option>
            <option>Verified Shoppers</option>
            <option>Premium Subscribers</option>
          </select>

          <select
            value={selectedCluster}
            onChange={e => setSelectedCluster(e.target.value)}
            className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-xl outline-none cursor-pointer border border-transparent focus:border-[#0055c4]"
          >
            <option>All Clusters</option>
            <option>Victoria Island</option>
            <option>Ikeja Commercial</option>
            <option>Lekki Phase 1</option>
          </select>

          <div className="flex items-center gap-1.5 bg-slate-100 px-3 h-9 rounded-xl text-slate-700 text-xs font-semibold">
            <span className="material-symbols-outlined text-sm text-slate-500">date_range</span>
            <span>Last 90 Days</span>
          </div>

          <button
            type="button"
            onClick={() => showToast('Cohort dataset exported as CSV.')}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#0055c4] hover:bg-[#00429b] text-white text-xs font-bold shadow-2xs transition-all"
          >
            <span className="material-symbols-outlined text-sm">file_download</span>
            <span>Export Cohort Dataset</span>
          </button>
        </div>
      </div>

      {/* Telemetry Highlights (KPI Quad Array) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Registered Consumers</span>
              <div className="text-3xl font-bold text-slate-900 mt-1">148,920</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0055c4] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">person_add</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl">
            <div className="flex items-center gap-1 text-[#0055c4] font-semibold">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+12.4% MoM</span>
            </div>
            <span className="text-slate-500 font-medium">+16,400 net new</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Active Merchants</span>
              <div className="text-3xl font-bold text-slate-900 mt-1">3,412</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">store</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl">
            <div className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+8.7% MoM</span>
            </div>
            <span className="text-slate-500 font-medium">284 onboarded</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Interaction Ratio</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold text-slate-900">43.6</span>
                <span className="text-xs text-slate-400">/user/mo</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">hub</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <div className="w-2 h-2 rounded-full bg-[#0055c4] animate-pulse"></div>
              <span>Lekki Cluster Peak</span>
            </div>
            <span className="text-slate-500 font-semibold">62.8 max</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">30-Day Stickiness</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold text-slate-900">34.8%</span>
                <span className="text-xs text-slate-400">DAU/MAU</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">loyalty</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl">
            <div className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>+2.3%</span>
            </div>
            <span className="text-slate-500 font-medium">Above benchmark</span>
          </div>
        </div>
      </div>

      {/* Trajectory Canvas & Acquisition Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Dual-Axis Chart Panel (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Net Growth Trajectory &amp; Operational Milestones</h3>
              <p className="text-xs text-slate-500">Twelve-month velocity comparing consumer acquisition and merchant additions</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#0055c4]"></span>
                <span className="text-slate-900 font-medium">Net Customers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-500"></span>
                <span className="text-slate-600 font-medium">Merchants</span>
              </div>
            </div>
          </div>

          {/* Inline Dual-Axis SVG Chart */}
          <div className="relative w-full h-72 pt-2 pb-1 select-none bg-slate-50 rounded-xl p-3 border border-slate-200/60">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 740 240">
              <defs>
                <linearGradient id="primaryAreaGradGrowth" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#0055c4" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#0055c4" stopOpacity="0.00" />
                </linearGradient>
              </defs>
              <line stroke="#eceef0" strokeDasharray="3 3" strokeWidth="1" x1="40" x2="720" y1="30" y2="30" />
              <line stroke="#eceef0" strokeDasharray="3 3" strokeWidth="1" x1="40" x2="720" y1="80" y2="80" />
              <line stroke="#eceef0" strokeDasharray="3 3" strokeWidth="1" x1="40" x2="720" y1="130" y2="130" />
              <line stroke="#eceef0" strokeDasharray="3 3" strokeWidth="1" x1="40" x2="720" y1="180" y2="180" />
              <line stroke="#d8dadc" strokeWidth="1" x1="40" x2="720" y1="210" y2="210" />

              <text className="fill-slate-400 text-[10px] font-sans" textAnchor="end" x="32" y="34">20k</text>
              <text className="fill-slate-400 text-[10px] font-sans" textAnchor="end" x="32" y="84">15k</text>
              <text className="fill-slate-400 text-[10px] font-sans" textAnchor="end" x="32" y="134">10k</text>
              <text className="fill-slate-400 text-[10px] font-sans" textAnchor="end" x="32" y="184">5k</text>

              <text className="fill-slate-400 text-[10px] font-sans" textAnchor="start" x="728" y="34">400</text>
              <text className="fill-slate-400 text-[10px] font-sans" textAnchor="start" x="728" y="84">300</text>
              <text className="fill-slate-400 text-[10px] font-sans" textAnchor="start" x="728" y="134">200</text>
              <text className="fill-slate-400 text-[10px] font-sans" textAnchor="start" x="728" y="184">100</text>

              <polygon fill="url(#primaryAreaGradGrowth)" points="50,195 110,185 170,172 230,165 290,140 350,110 410,125 470,95 530,70 590,52 650,42 710,35 710,210 50,210" />
              <polyline fill="none" points="50,195 110,185 170,172 230,165 290,140 350,110 410,125 470,95 530,70 590,52 650,42 710,35" stroke="#0055c4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
              <polyline fill="none" points="50,198 110,192 170,186 230,178 290,160 350,150 410,142 470,125 530,110 590,95 650,82 710,65" stroke="#565e74" strokeDasharray="4 2" strokeLinecap="round" strokeWidth="2" />

              <line stroke="#0055c4" strokeDasharray="2 2" strokeOpacity="0.4" strokeWidth="1.5" x1="290" x2="290" y1="40" y2="210" />
              <circle cx="290" cy="140" fill="#0055c4" r="4.5" stroke="#ffffff" strokeWidth="2" />

              <line stroke="#066cf4" strokeDasharray="2 2" strokeOpacity="0.4" strokeWidth="1.5" x1="530" x2="530" y1="25" y2="210" />
              <circle cx="530" cy="70" fill="#066cf4" r="4.5" stroke="#ffffff" strokeWidth="2" />
            </svg>
            <div className="absolute top-4 left-[38%] -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-slate-800 shadow-2xs border border-slate-200">
              Lekki Rollout
            </div>
            <div className="absolute top-2 left-[71%] -translate-x-1/2 bg-[#0055c4] px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs">
              VEMTAP Fest '24
            </div>
          </div>

          <div className="grid grid-cols-12 text-center text-[10px] text-slate-400">
            <span>Oct '23</span><span>Nov</span><span>Dec</span><span>Jan '24</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep '24</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#0055c4]">insights</span>
              <span className="text-slate-800">Growth Velocity peaked at <strong className="font-bold text-slate-900">16,400 monthly customers</strong> during the festive activation cycle.</span>
            </div>
            <span className="text-slate-500 font-mono text-[11px]">Confidence: 99.4%</span>
          </div>
        </div>

        {/* Acquisition Funnel (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Acquisition Funnel</h3>
              <span className="text-[11px] text-slate-500">End-to-End User Liquidity</span>
            </div>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-slate-600">90D Agg</span>
          </div>

          <div className="space-y-3.5 my-auto">
            {/* Step 1 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-slate-400">devices</span>
                  App Installs &amp; Web Visits
                </span>
                <span className="font-bold text-slate-900">210,000</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <span className="text-[10px] text-slate-400 block text-right">Top of Funnel (100%)</span>
            </div>

            {/* Step 2 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#0055c4]">badge</span>
                  Account Registrations
                </span>
                <span className="font-bold text-slate-900">148,920</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#0055c4] rounded-full" style={{ width: '70.9%' }}></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span className="text-[#0055c4] font-semibold">70.9% Conversion</span>
                <span>-61,080 drop</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#0055c4]">qr_code_scanner</span>
                  First QR / Deal Claim
                </span>
                <span className="font-bold text-slate-900">92,400</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '62%' }}></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span className="text-[#0055c4] font-semibold">62.0% Activation</span>
                <span>-56,520 unactivated</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-emerald-600">repeat</span>
                  Repeat Usage (&gt;2 in 30d)
                </span>
                <span className="font-bold text-slate-900">56,120</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '60.7%' }}></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span className="text-emerald-700 font-semibold">60.7% Retention Rate</span>
                <span>Core Active Base</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-center gap-2 text-xs text-slate-700">
            <span className="material-symbols-outlined text-[#0055c4] text-lg">bolt</span>
            <span>Activation rates improved by <strong className="font-bold text-slate-900">+4.1%</strong> following merchant instant cashback integrations.</span>
          </div>
        </div>
      </div>

      {/* Merchant Category Footprint & Churn Mitigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Merchant Category Breakdown (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Merchant Distribution by Category</h3>
              <p className="text-xs text-slate-500">Segmented breakdown of 3,412 onboarded commercial accounts</p>
            </div>
            <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-600">Categorical Share</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {CATEGORIES.map(cat => (
              <div key={cat.name} className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="material-symbols-outlined text-base">{cat.icon}</span>
                  <span className="text-[10px] font-bold font-mono">{cat.share}</span>
                </div>
                <span className="text-base font-bold text-slate-900">{cat.count}</span>
                <span className="text-[11px] text-slate-600 mt-0.5 truncate">{cat.name}</span>
                <div className="w-full h-1 bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-[#0055c4] rounded-full" style={{ width: cat.width }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#0055c4]">verified_user</span>
              All categories currently hold &gt;94% operational SLA compliance
            </span>
            <button
              type="button"
              onClick={() => showToast('Navigating to business category manager...')}
              className="text-[#0055c4] hover:underline font-semibold flex items-center gap-0.5"
            >
              <span>Manage tags</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Merchant Churn Gauge Card (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Merchant Churn Index</h3>
              <span className="text-[11px] text-slate-500">Contractual Stability</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Healthy</span>
          </div>

          <div className="flex items-center justify-around py-2">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="transparent" r="42" stroke="#eceef0" strokeWidth="8" />
                <circle cx="50" cy="50" fill="transparent" r="42" stroke="#0055c4" strokeDasharray="264" strokeDashoffset="8.4" strokeLinecap="round" strokeWidth="8" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-900">96.8%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Retained</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Active Renewal</span>
                <span className="font-bold text-slate-900">96.8% MoM</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Voluntary Churn</span>
                <span className="font-bold text-rose-600">3.2% (109 units)</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Average LTV</span>
                <span className="font-bold text-[#0055c4]">₦1,420,000</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
            <span>Primary exit vector: Lease expiration</span>
            <span className="text-[10px] uppercase font-bold text-[#0055c4] cursor-pointer hover:underline">Audit Logs →</span>
          </div>
        </div>
      </div>

      {/* Growth Cohort Retention Matrix (High Density Table) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Customer Cohort Retention Matrix</h3>
              <span className="text-[10px] font-bold uppercase bg-blue-50 text-[#0055c4] px-2 py-0.5 rounded border border-blue-200/60">2024 H1</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Tracking monthly repeat engagement percentage through sequential maturity cycles</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#0055c4]"></span>&gt;70% High</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-300"></span>50-70% Mid</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-200"></span>&lt;50% Normal</span>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Cohort Month</th>
                <th className="py-3 px-3 text-right">New Users</th>
                <th className="py-3 px-3 text-center">Month 0</th>
                <th className="py-3 px-3 text-center">Month 1</th>
                <th className="py-3 px-3 text-center">Month 2</th>
                <th className="py-3 px-3 text-center">Month 3</th>
                <th className="py-3 px-3 text-center">Month 6</th>
                <th className="py-3 px-4 text-right">Trend Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {COHORTS.map(c => (
                <tr key={c.month} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${c.color === 'emerald' ? 'bg-emerald-500' : c.color === 'blue' ? 'bg-[#0055c4]' : 'bg-slate-400'}`}></span>
                    <span>{c.month}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">{c.newUsers}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-[#0055c4] text-white font-bold text-[11px]">{c.m0}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold ${c.m1.includes('%') ? 'bg-blue-100 text-[#0055c4]' : 'text-slate-400 italic'}`}>{c.m1}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold ${c.m2.includes('%') ? 'bg-slate-100 text-slate-700' : 'text-slate-400 italic'}`}>{c.m2}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold ${c.m3.includes('%') ? 'bg-slate-100 text-slate-700' : 'text-slate-400 italic'}`}>{c.m3}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold ${c.m6.includes('%') ? 'bg-slate-100 text-slate-700' : 'text-slate-400 italic'}`}>{c.m6}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'Stabilized' || c.status === 'Optimized'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'Surging' || c.status === 'Above Avg' || c.status === 'Peak Entry'
                        ? 'bg-blue-50 text-[#0055c4] border border-blue-200/60'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {c.status}
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

