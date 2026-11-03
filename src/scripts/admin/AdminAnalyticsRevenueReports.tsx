import { useState } from 'react';

interface AdminAnalyticsRevenueReportsProps {
  onNavigate: (path: string) => void;
}

const REVENUE_STREAMS = [
  { stream: 'POS Platform Fee (Take Rate)', mtd: '₦48,240,000', projected: '₦62,000,000', growth: '+18.4%', share: '49.0%', color: 'bg-[#0055c4]' },
  { stream: 'Merchant Tier Subscriptions', mtd: '₦26,800,000', projected: '₦32,500,000', growth: '+14.2%', share: '27.2%', color: 'bg-indigo-600' },
  { stream: 'Featured Placements & Ad Spend', mtd: '₦18,450,000', projected: '₦22,800,000', growth: '+24.6%', share: '18.7%', color: 'bg-blue-500' },
  { stream: 'Cross-Cluster Broadcasts & SMS', mtd: '₦4,910,000', projected: '₦6,100,000', growth: '+9.1%', share: '5.1%', color: 'bg-slate-500' },
];

export function AdminAnalyticsRevenueReports({ onNavigate: _onNavigate }: AdminAnalyticsRevenueReportsProps) {
  const [period, setPeriod] = useState('Month to Date');
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

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0055c4]"></span>
            <span>Fiscal Intelligence &amp; Monetization</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Revenue &amp; Advertising Financial Reports
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-xl outline-none cursor-pointer border border-transparent focus:border-[#0055c4]"
          >
            <option>Month to Date</option>
            <option>Q3 2024</option>
            <option>Full Year 2024</option>
          </select>

          <button
            type="button"
            onClick={() => showToast('Financial ledger exported to CSV.')}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-xl bg-[#0055c4] hover:bg-[#00429b] text-white text-xs font-bold shadow-2xs transition-all"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Download Financial Deck</span>
          </button>
        </div>
      </div>

      {/* 4 Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Net Platform Revenue (MTD)</span>
          <div className="text-3xl font-bold text-slate-900 mt-2 font-mono">₦98.40M</div>
          <div className="mt-3 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+16.8% vs last month</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Processed GMV (MTD)</span>
          <div className="text-3xl font-bold text-slate-900 mt-2 font-mono">₦4.28B</div>
          <div className="mt-3 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+21.4% YoY surge</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Active Ad Spend (MTD)</span>
          <div className="text-3xl font-bold text-slate-900 mt-2 font-mono">₦18.45M</div>
          <div className="mt-3 text-xs text-[#0055c4] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">campaign</span>
            <span>48 active campaigns</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Average Blended Take Rate</span>
          <div className="text-3xl font-bold text-slate-900 mt-2 font-mono">1.82%</div>
          <div className="mt-3 text-xs text-slate-500 font-semibold">Target floor: 1.50%</div>
        </div>
      </div>

      {/* Revenue Stream Breakdown Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Monetization Streams &amp; Attribution</h3>
            <p className="text-xs text-slate-500">Gross revenue composition across merchant commission, subscriptions and advertising.</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">Node: Fiscal-ANL-09</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Revenue Channel</th>
                <th className="py-3 px-3">Realized MTD</th>
                <th className="py-3 px-3">Month End Projected</th>
                <th className="py-3 px-3">MoM Growth</th>
                <th className="py-3 px-4 text-right">Contribution Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {REVENUE_STREAMS.map(r => (
                <tr key={r.stream} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${r.color}`}></span>
                    <span>{r.stream}</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{r.mtd}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-600">{r.projected}</td>
                  <td className="py-3.5 px-3 font-semibold text-emerald-600">{r.growth}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">{r.share}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

