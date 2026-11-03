import { useState } from 'react';

interface AdminAnalyticsDealsPerformanceProps {
  onNavigate: (path: string) => void;
}

export function AdminAnalyticsDealsPerformance({ onNavigate: _onNavigate }: AdminAnalyticsDealsPerformanceProps) {
  const [dealType, setDealType] = useState('All Deal Types');
  const [placement, setPlacement] = useState('All Discovery Placements');
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

      {/* Top View Controls & Segment Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0055c4]"></span>
            <span>Telemetry Stream :: Cluster Alpha</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Deals &amp; Discovery Performance
          </h2>
        </div>

        {/* Filter Tooling Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={dealType}
            onChange={e => setDealType(e.target.value)}
            className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-xl outline-none cursor-pointer border border-transparent focus:border-[#0055c4]"
          >
            <option>All Deal Types</option>
            <option>Flash Deals (Timer Driven)</option>
            <option>Percentage Discount (-X%)</option>
            <option>Buy One Get One (BOGO)</option>
            <option>VIP / Exclusive Perks</option>
          </select>

          <select
            value={placement}
            onChange={e => setPlacement(e.target.value)}
            className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-xl outline-none cursor-pointer border border-transparent focus:border-[#0055c4]"
          >
            <option>All Discovery Placements</option>
            <option>Featured Carousel (Hero)</option>
            <option>Category Spotlights</option>
            <option>Nearby Radius (Geo-fenced)</option>
            <option>Push Notification Drop</option>
          </select>

          <div className="flex items-center gap-1.5 bg-slate-100 px-3 h-9 rounded-xl text-slate-700 text-xs font-semibold">
            <span className="material-symbols-outlined text-sm text-slate-500">history</span>
            <span>Last 30 Days</span>
          </div>

          <button
            type="button"
            onClick={() => showToast('Exporting raw deal telemetry...')}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-xl bg-[#0055c4] hover:bg-[#00429b] text-white text-xs font-bold shadow-2xs transition-all"
          >
            <span className="material-symbols-outlined text-sm">file_download</span>
            <span>Export Raw Telemetry</span>
          </button>
        </div>
      </div>

      {/* Performance Telemetry High-Impact Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Discovery Exposure</span>
              <div className="text-3xl font-bold text-slate-900 mt-1">1,842,500</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0055c4] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">visibility</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+18.6% MoM</span>
            </div>
            <span className="text-slate-400">Total Impressions</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Saved / Claimed</span>
              <div className="text-3xl font-bold text-slate-900 mt-1">264,800</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">bookmark_added</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-[#0055c4] font-semibold">
              <span className="material-symbols-outlined text-sm">ads_click</span>
              <span>14.4% CTR</span>
            </div>
            <span className="text-slate-400">+9.2% from last cycle</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">POS &amp; Web Redemptions</span>
              <div className="text-3xl font-bold text-slate-900 mt-1">189,420</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">verified</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>71.5% Yield</span>
            </div>
            <span className="text-slate-400">Claim-to-Redeem</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Attributed GMV</span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-mono">₦342,850,000</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="material-symbols-outlined text-sm">north_east</span>
              <span>+22.1% MoM</span>
            </div>
            <span className="text-slate-400">Avg Ticket ₦1,810</span>
          </div>
        </div>
      </div>

      {/* Discovery Funnel & Placement Effectiveness */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Funnel Stage (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Discovery &amp; Redemption Funnel</h3>
              <p className="text-xs text-slate-500">End-to-end customer transition lifecycle from app discovery to verified terminal checkout.</p>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Full Pipeline</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { num: '01', title: 'Feed Impressions', desc: 'Card exposed on discovery screen', count: '1,842,500', pct: '100.0% Base', barWidth: '100%', barColor: 'bg-[#0055c4]' },
              { num: '02', title: 'Clicks & Detail Views', desc: 'Opened detailed offer voucher card', count: '612,000', pct: '33.2% of Impr.', barWidth: '33.2%', barColor: 'bg-blue-500' },
              { num: '03', title: 'Claims & Saved Vouchers', desc: 'Stored in consumer wallet passes', count: '264,800', pct: '43.3% of Views', barWidth: '14.4%', barColor: 'bg-indigo-600' },
              { num: '04', title: 'Physical POS & Web Redemptions', desc: 'NFC tap or QR verified checkout at store', count: '189,420', pct: '71.5% Conversion', barWidth: '10.3%', barColor: 'bg-emerald-600' },
            ].map(step => (
              <div key={step.num} className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-[190px]">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0055c4] font-bold text-xs flex items-center justify-center shrink-0">
                    {step.num}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">{step.title}</div>
                    <div className="text-[11px] text-slate-400">{step.desc}</div>
                  </div>
                </div>
                <div className="flex-1 mx-2 sm:mx-4">
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${step.barColor}`} style={{ width: step.barWidth }}></div>
                  </div>
                </div>
                <div className="text-right min-w-[110px] shrink-0">
                  <div className="font-bold text-slate-900 text-xs font-mono">{step.count}</div>
                  <div className="text-[10px] font-semibold text-slate-500">{step.pct}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Placement Effectiveness Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Placement Surface ROI</h3>
              <p className="text-xs text-slate-500">Conversion efficiency across app surfaces</p>
            </div>
            <span className="text-[10px] font-bold uppercase text-[#0055c4] bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">Benchmarked</span>
          </div>

          <div className="space-y-3">
            {[
              { surface: 'Hero Carousel (Top)', impressions: '940k', claims: '142k', ctr: '15.1%', gmv: '₦184M' },
              { surface: 'Category Spotlight', impressions: '480k', claims: '68k', ctr: '14.2%', gmv: '₦89M' },
              { surface: 'Nearby Geo-Fenced', impressions: '290k', claims: '42k', ctr: '14.5%', gmv: '₦51M' },
              { surface: 'Push Notification Drop', impressions: '132k', claims: '12.8k', ctr: '9.7%', gmv: '₦18.8M' },
            ].map(p => (
              <div key={p.surface} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{p.surface}</span>
                  <span className="font-bold text-[#0055c4] font-mono">{p.gmv}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500">
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase">Impr.</span>
                    <span className="font-semibold text-slate-800">{p.impressions}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase">Claims</span>
                    <span className="font-semibold text-slate-800">{p.claims}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase">CTR</span>
                    <span className="font-bold text-emerald-600">{p.ctr}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

