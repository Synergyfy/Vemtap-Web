import { useState } from 'react';
import {
  ADMIN_CLUSTERS,
  RECENT_TRANSACTIONS,
  VERIFICATION_QUEUE,
} from './adminData';

interface AdminOverviewScreenProps {
  onNavigate: (path: string) => void;
}

export function AdminOverviewScreen({ onNavigate }: AdminOverviewScreenProps) {
  const [timeframe, setTimeframe] = useState<'today' | '7d' | '30d'>('today');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshNotice('Telemetry stream synchronized with all 48 cluster nodes.');
      setTimeout(() => setRefreshNotice(null), 3000);
    }, 600);
  };

  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      timeframe,
      kpis: {
        totalCustomers: 142850,
        activeMerchants: 3840,
        dailyGrossVolume: '₦284.5M',
        posFleet: 14820,
        adPlacementRev: '₦38.45M',
      },
      transactions: RECENT_TRANSACTIONS,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vemtap-platform-telemetry-${timeframe}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] w-full mx-auto">
      {refreshNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[12px] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-emerald-600">check_circle</span>
            <span>{refreshNotice}</span>
          </div>
          <button onClick={() => setRefreshNotice(null)} className="text-emerald-600 hover:text-emerald-800">
            <span className="material-symbols-outlined text-[15px]">close</span>
          </button>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-[#0055c4] border border-blue-100">
              PLATFORM COMMAND CENTRE • REAL-TIME TELEMETRY
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Cluster Sync: 48/48 Nodes Active</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Overview & Ecosystem Pulse</h1>
          <p className="text-slate-500 text-[12px]">
            High-level operational health, customer density, active merchant nodes, and revenue telemetry across commercial clusters.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Pill */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-[11px] font-medium text-slate-600">
            <button
              onClick={() => setTimeframe('today')}
              className={`px-2.5 py-1 rounded transition-colors ${
                timeframe === 'today'
                  ? 'bg-white text-[#0055c4] font-semibold shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Today (Live)
            </button>
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-2.5 py-1 rounded transition-colors ${
                timeframe === '7d'
                  ? 'bg-white text-[#0055c4] font-semibold shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-2.5 py-1 rounded transition-colors ${
                timeframe === '30d'
                  ? 'bg-white text-[#0055c4] font-semibold shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Last 30 Days
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-[12px] font-medium shadow-2xs transition-colors"
          >
            <span className={`material-symbols-outlined text-[16px] text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Stream'}</span>
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0055c4] hover:bg-[#066cf4] text-white text-[12px] font-medium shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export Snapshot</span>
          </button>
        </div>
      </div>

      {/* 5 TOP KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Customers */}
        <div
          onClick={() => onNavigate('/admin/customers')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-hover:text-[#0055c4] transition-colors">
              Total Customers
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0055c4] flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">group</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">142,850</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1 rounded">
                <span className="material-symbols-outlined text-[13px]">trending_up</span>
                +12.4%
              </span>
              <span className="text-[11px] text-slate-400">MoM growth</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>98.2k 30d actives</span>
            <svg className="w-14 h-4 text-[#0055c4]" fill="none" viewBox="0 0 56 16">
              <path
                d="M1 14 L12 10 L24 12 L36 5 L48 8 L55 2"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: Active Merchants & Branches */}
        <div
          onClick={() => onNavigate('/admin/businesses')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-hover:text-indigo-600 transition-colors">
              Active Merchants
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">storefront</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">3,840</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1 rounded">
                <span className="material-symbols-outlined text-[13px]">add</span>
                18 new
              </span>
              <span className="text-[11px] text-slate-400">this week</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>84 active clusters</span>
            <span className="font-medium text-slate-700">75.8% CAC OK</span>
          </div>
        </div>

        {/* Card 3: Daily Gross Volume */}
        <div
          onClick={() => onNavigate('/admin/orders')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-hover:text-emerald-600 transition-colors">
              Daily Gross Volume
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">payments</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">₦284.5M</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1 rounded">
                99.4%
              </span>
              <span className="text-[11px] text-slate-400">settlement rate</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>214.2k transactions</span>
            <span className="text-emerald-600 font-medium">Zero backlogs</span>
          </div>
        </div>

        {/* Card 4: Active POS Fleet & Beacons */}
        <div
          onClick={() => onNavigate('/admin/locations/fleet')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-hover:text-sky-600 transition-colors">
              POS & NFC Fleet
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">contactless</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">14,820</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1 rounded">
                98.6%
              </span>
              <span className="text-[11px] text-slate-400">online uptime</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>128 sync pings/min</span>
            <span className="text-slate-600 font-medium">Firmware v3.1</span>
          </div>
        </div>

        {/* Card 5: Ad Placement Revenue */}
        <div
          onClick={() => onNavigate('/admin/marketing')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-hover:text-amber-600 transition-colors">
              Ad Placement Rev
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">campaign</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">₦38.45M</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-[11px] font-semibold text-blue-600 bg-blue-50 px-1 rounded">
                88.5%
              </span>
              <span className="text-[11px] text-slate-400">inventory util</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>28/32 slots booked</span>
            <span className="text-amber-600 font-medium">MTD target 92%</span>
          </div>
        </div>
      </div>

      {/* MAIN BALANCED 2-COLUMN GRID (Left ~65%, Right ~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (~65% -> 8 of 12 columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Verification & Review Queue Requiring Attention */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-100"></span>
                <h2 className="font-bold text-[14px] text-slate-900">
                  Verification & Review Queue Requiring Attention
                </h2>
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                  93 Pending Audits
                </span>
              </div>
              <button
                onClick={() => onNavigate('/admin/businesses/verification')}
                className="text-[12px] font-semibold text-[#0055c4] hover:underline flex items-center gap-0.5"
              >
                View all in Queue
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            {/* Verification Action Table/List */}
            <div className="divide-y divide-slate-100">
              {VERIFICATION_QUEUE.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        item.tagColor === 'red'
                          ? 'bg-red-50 text-red-600'
                          : item.tagColor === 'amber'
                          ? 'bg-amber-50 text-amber-600'
                          : item.tagColor === 'purple'
                          ? 'bg-purple-50 text-purple-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {item.type === 'kyb'
                          ? 'verified_user'
                          : item.type === 'geofence'
                          ? 'share_location'
                          : item.type === 'flagged_deal'
                          ? 'bolt'
                          : 'sync_problem'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 text-[13px]">{item.title}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            item.tagColor === 'red'
                              ? 'bg-red-100 text-red-800'
                              : item.tagColor === 'amber'
                              ? 'bg-amber-100 text-amber-800'
                              : item.tagColor === 'purple'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <span className="text-[11px] font-medium text-slate-400">{item.batchId}</span>
                    <button
                      onClick={() => {
                        if (item.type === 'kyb') onNavigate('/admin/businesses/verification');
                        else if (item.type === 'geofence') onNavigate('/admin/locations/geofencing');
                        else if (item.type === 'flagged_deal') onNavigate('/admin/deals/flagged');
                        else onNavigate('/admin/orders/disputes');
                      }}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md shadow-2xs transition-colors ${
                        item.type === 'kyb'
                          ? 'bg-[#0055c4] text-white hover:bg-[#066cf4]'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {item.type === 'kyb'
                        ? 'Review Batch'
                        : item.type === 'geofence'
                        ? 'Re-align Maps'
                        : item.type === 'flagged_deal'
                        ? 'Audit Pricing'
                        : 'Reconcile'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Cluster Footfall & In-Store Tap Velocity */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-[14px] text-slate-900">
                  Cluster Footfall & In-Store Tap Velocity
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Real-time performance comparing digital search impressions to physical NFC/POS check-ins
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-600"></span>
                  <span className="text-slate-600">Search Impressions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
                  <span className="text-slate-600">Verified NFC Taps</span>
                </div>
              </div>
            </div>

            {/* Commercial Hubs Bars */}
            <div className="space-y-3.5 pt-1">
              {ADMIN_CLUSTERS.slice(0, 4).map((c) => {
                const impPercent = Math.round((c.impressions / 50000) * 100);
                const tapPercent = Math.round((c.taps / 50000) * 100);
                return (
                  <div key={c.id}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <span className="font-semibold text-slate-800">{c.name}</span>
                      <span className="text-slate-500 text-[11px]">
                        <strong>{c.impressions.toLocaleString()}</strong> impressions •{' '}
                        <strong className="text-emerald-700">{c.taps.toLocaleString()}</strong> taps ({c.conversion} conv)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="bg-blue-600 h-full rounded-l-full" style={{ width: `${impPercent}%` }}></div>
                      <div className="bg-emerald-500 h-full rounded-r-full" style={{ width: `${tapPercent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer summary pill */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">bolt</span>
                Top converter: Victoria Island belt (27.5% tap conversion)
              </span>
              <button
                onClick={() => onNavigate('/admin/locations')}
                className="text-[#0055c4] font-medium hover:underline"
              >
                Explore Heatmap & Polygon GIS →
              </button>
            </div>
          </div>

          {/* 3. Recent Platform Transactions & Activity Feed */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055c4] text-[19px]">receipt_long</span>
                <h2 className="font-bold text-[14px] text-slate-900">
                  Recent Platform Transactions & Activity Feed
                </h2>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Stream latency: 24ms</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">TIMESTAMP</th>
                    <th className="py-2.5 px-4">MERCHANT / CLUSTER</th>
                    <th className="py-2.5 px-4">PAYMENT RAIL</th>
                    <th className="py-2.5 px-4 text-right">AMOUNT (₦)</th>
                    <th className="py-2.5 px-4 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {RECENT_TRANSACTIONS.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">{txn.timestamp}</td>
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-slate-800">{txn.merchantName}</span>
                        <span className="text-slate-400 text-[11px] block">{txn.branchOrTerminal}</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${txn.railColor}`}></span>
                          {txn.rail}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold text-slate-900">{txn.amount}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Showing last 4 live pulses of 214,190 logged today</span>
              <button
                onClick={() => onNavigate('/admin/orders')}
                className="font-semibold text-[#0055c4] hover:underline"
              >
                Open Transaction Audit Ledger →
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (~35% -> 4 of 12 columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Subscription & Settlement Health */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[19px]">account_balance_wallet</span>
                <h3 className="font-bold text-[14px] text-slate-900">Subscription & Settlement</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                HEALTHY
              </span>
            </div>

            <div className="space-y-3">
              {/* MRR */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-500 block">Monthly Recurring Revenue (MRR)</span>
                  <span className="text-[16px] font-bold text-slate-900">₦64.8M</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  +14.2% QoQ
                </span>
              </div>

              {/* Renewal Rate & Escrow Alerts */}
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Auto-Renewal Rate</span>
                  <span className="text-sm font-bold text-slate-800">94.2%</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">3,618 tier accounts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Renewal Sweep</span>
                  <span className="text-sm font-bold text-slate-800">14 Overdue</span>
                  <span className="text-[10px] text-amber-600 font-medium block mt-0.5">Grace period active</span>
                </div>
              </div>

              {/* Automatic Overnight Settlement Note */}
              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 flex items-start gap-2 text-[11px] text-blue-900">
                <span className="material-symbols-outlined text-[16px] text-[#0055c4] shrink-0 mt-0.5">info</span>
                <div>
                  <span className="font-semibold block">Automatic Overnight Settlement</span>
                  <span>Escrow pool reserves at ₦124.5M. Next clearing window: 00:00 UTC.</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Ad Performance & Sponsored Inventory */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[19px]">ad_units</span>
                <h3 className="font-bold text-[14px] text-slate-900">Ad & Sponsored Inventory</h3>
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">28/32 Booked</span>
            </div>

            {/* Spotlight Card */}
            <div className="p-3 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-900">
                  TOP CAMPAIGN SPOTLIGHT
                </span>
                <span className="text-[10px] text-slate-300">Corridor Boost</span>
              </div>
              <div>
                <h4 className="font-semibold text-[13px] text-white">Smartphone Fest 2025</h4>
                <p className="text-[11px] text-slate-300">By Slot Electronics • Ikeja Corridor</p>
              </div>
              <div className="grid grid-cols-2 pt-2 border-t border-slate-700/60 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Average ROAS</span>
                  <span className="font-bold text-emerald-400">4.8x Return</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Physical Footfall</span>
                  <span className="font-bold text-white">28,490 Taps</span>
                </div>
              </div>
            </div>

            {/* Inventory Fill Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Premium Search Placements</span>
                <span className="font-bold text-slate-800">87.5% Full</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '87.5%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>4 slots remaining for reservation</span>
                <button
                  onClick={() => onNavigate('/admin/marketing/slots')}
                  className="text-[#0055c4] hover:underline font-semibold"
                >
                  Manage Inventory
                </button>
              </div>
            </div>
          </div>

          {/* 3. System Nodes & Gateway Latency */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055c4] text-[19px]">dns</span>
                <h3 className="font-bold text-[14px] text-slate-900">Nodes & Gateway Latency</h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Nominal
              </span>
            </div>

            {/* Real-time latency monitors */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-medium text-slate-700">Paystack Gateway</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-800">140ms</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-medium text-slate-700">GTBank NIBSS Rail</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-800">210ms</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-medium text-slate-700">Firebase Telemetry Push</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-800">9,410 /sec</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-medium text-slate-700">Cloudflare Edge CDN</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-800">14ms</span>
              </div>
            </div>

            <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Sync cycle: Every 5s</span>
              <button
                onClick={() => onNavigate('/admin/settings')}
                className="text-[#0055c4] hover:underline font-semibold"
              >
                Gateway Diagnostics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

