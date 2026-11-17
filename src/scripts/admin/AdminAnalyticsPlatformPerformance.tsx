import { useState } from 'react';

interface AdminAnalyticsPlatformPerformanceProps {
  onNavigate: (path: string) => void;
}

const SUBSYSTEMS = [
  {
    name: 'Authentication & JWT Gateway',
    endpoint: 'service.auth.prod-core',
    icon: 'verified_user',
    status: 'Operational',
    statusClass: 'bg-primary/10 text-primary',
    dotClass: 'bg-primary',
    availability: '99.99%',
    latencyAvg: '21ms',
    latencyP99: '48ms',
    throughput: '1,120 req/s',
    errorBudget: 96,
  },
  {
    name: 'QR Verification & Tap Engine',
    endpoint: 'service.scanner.prod-lagos',
    icon: 'qr_code_scanner',
    status: 'Operational',
    statusClass: 'bg-primary/10 text-primary',
    dotClass: 'bg-primary',
    availability: '99.96%',
    latencyAvg: '44ms',
    latencyP99: '92ms',
    throughput: '840 req/s',
    errorBudget: 88,
  },
  {
    name: 'Real-Time POS Event Stream (Kafka)',
    endpoint: 'cluster.kafka.pipeline',
    icon: 'hub',
    status: 'Operational',
    statusClass: 'bg-primary/10 text-primary',
    dotClass: 'bg-primary',
    availability: '99.99%',
    latencyAvg: '8ms',
    latencyP99: 'lag: 0.2s',
    throughput: '1,480 msgs/s',
    errorBudget: 99,
  },
  {
    name: 'Geolocation & Cluster Routing',
    endpoint: 'geo.routing.lagos-island',
    icon: 'near_me',
    status: 'Operational',
    statusClass: 'bg-primary/10 text-primary',
    dotClass: 'bg-primary',
    availability: '99.95%',
    latencyAvg: '32ms',
    latencyP99: '61ms',
    throughput: '560 req/s',
    errorBudget: 91,
  },
  {
    name: 'Payment Webhooks Rail (Paystack/Flutterwave)',
    endpoint: 'service.payments.settlement',
    icon: 'account_balance_wallet',
    status: 'Degraded Minor',
    statusClass: 'bg-amber-100 text-amber-800',
    dotClass: 'bg-amber-600',
    availability: '99.28%',
    latencyAvg: '128ms',
    latencyP99: '1.2% retry queue',
    throughput: '310 req/s',
    errorBudget: 64,
  },
  {
    name: 'Notification Dispatch (Push / SMS / Email)',
    endpoint: 'service.notify.worker-mesh',
    icon: 'send_to_mobile',
    status: 'Operational',
    statusClass: 'bg-primary/10 text-primary',
    dotClass: 'bg-primary',
    availability: '99.91%',
    latencyAvg: '58ms',
    latencyP99: '130ms',
    throughput: '490 msgs/s',
    errorBudget: 82,
  },
];

export function AdminAnalyticsPlatformPerformance({ onNavigate: _onNavigate }: AdminAnalyticsPlatformPerformanceProps) {
  const [range, setRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [searchFilter, setSearchFilter] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredSubsystems = SUBSYSTEMS.filter(s =>
    s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.endpoint.toLowerCase().includes(searchFilter.toLowerCase())
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

      {/* Module Sub-Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            <span>Telemetry</span>
            <span>·</span>
            <span className="text-[#0055c4]">Real-Time Observability</span>
            <span>·</span>
            <span>Engine v2.4</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Platform Performance &amp; System Health
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Selector Pills */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setRange('24h')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                range === '24h' ? 'bg-white text-[#0055c4] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 24 Hours
            </button>
            <button
              type="button"
              onClick={() => setRange('7d')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                range === '7d' ? 'bg-white text-[#0055c4] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => setRange('30d')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                range === '30d' ? 'bg-white text-[#0055c4] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 30 Days
            </button>
          </div>

          {/* Live Refresh Indicator */}
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0055c4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0055c4]"></span>
            </span>
            <span>Live (15s)</span>
            <button
              type="button"
              onClick={() => showToast('Telemetry buffer refreshed.')}
              className="text-slate-400 hover:text-[#0055c4] transition-colors ml-0.5"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
            </button>
          </div>

          {/* Export Action */}
          <button
            type="button"
            onClick={() => showToast('Performance telemetry report generated.')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0055c4] hover:bg-[#00429b] text-white text-xs font-bold shadow-2xs transition-all"
          >
            <span className="material-symbols-outlined text-sm">file_download</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Active Degradation Advisory Bar */}
      <div className="flex items-center justify-between bg-amber-50/80 border border-amber-200/80 px-4 py-3 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-amber-600 shadow-2xs">
            <span className="material-symbols-outlined text-[18px]">warning</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold bg-white text-slate-800 px-1.5 py-0.5 rounded border border-amber-200">
                Subsystem Alert
              </span>
              <span className="text-xs font-bold text-slate-900">Payment Webhook Retry Escalation</span>
            </div>
            <span className="text-xs text-slate-600 mt-0.5">
              Paystack webhook ingress node encountering 1.2% retry queue; automated fallback worker pools engaged.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] font-semibold text-amber-800 uppercase hidden sm:inline">Impact: Minor Degradation</span>
          <button
            type="button"
            onClick={() => showToast('Loading triage trace for node webhook-worker-04...')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-amber-200 transition-colors"
          >
            View Triage Trace
          </button>
        </div>
      </div>

      {/* Top Row: 4 Precision KPI Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Gateway Latency</span>
              <span className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">
                42<span className="text-sm font-normal text-slate-500 ml-1">ms</span>
              </span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0055c4] border border-blue-200/60">
              99.98% SLA
            </span>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="material-symbols-outlined text-sm">trending_down</span>
              <span>-8ms vs threshold</span>
            </div>
            <span className="text-slate-400">Target ≤ 50ms</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#0055c4] h-full rounded-full" style={{ width: '42%' }}></div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Real-Time App RPS</span>
              <span className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">
                3,840<span className="text-sm font-normal text-slate-500 ml-1">req/s</span>
              </span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              Peak Window
            </span>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-[#0055c4] font-semibold">
              <span className="material-symbols-outlined text-sm">arrow_upward</span>
              <span>+14.2% peak surge</span>
            </div>
            <span className="text-slate-400">Cap: 12k req/s</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#0055c4] h-full rounded-full" style={{ width: '32%' }}></div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">POS Sync Integrity</span>
              <span className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">
                99.94<span className="text-sm font-normal text-slate-500 ml-1">%</span>
              </span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Synchronized
            </span>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-slate-600">
              <span className="material-symbols-outlined text-sm text-slate-400">sync_saved_locally</span>
              <span>0.06% retry queue</span>
            </div>
            <span className="text-slate-400">38 POS online</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '99.4%' }}></div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Scan &amp; Tap Engine Latency</span>
              <span className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">
                78<span className="text-sm font-normal text-slate-500 ml-1">ms (p95)</span>
              </span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0055c4] border border-blue-200/60">
              Optimal
            </span>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-[#0055c4] font-semibold">
              <span className="material-symbols-outlined text-sm">bolt</span>
              <span>p50: 38ms · p99: 112ms</span>
            </div>
            <span className="text-slate-400">Edge cached</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#0055c4] h-full rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Analytics Bento: Primary Graph (8 cols) + Distribution / DB Health (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8-cols: Time Series System Throughput Graph */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider">Telemetry Canvas</span>
              <h3 className="text-base font-bold text-slate-900">System Load &amp; Request Throughput</h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#0055c4] rounded-full"></span>
                <span className="text-slate-900 font-medium">Consumer API</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-slate-600 rounded-full"></span>
                <span className="text-slate-600 font-medium">POS Real-Time Sync</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-slate-300 rounded-full"></span>
                <span className="text-slate-600 font-medium">Merchant Webhooks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-slate-400 rounded-full"></span>
                <span className="text-slate-600 font-medium">QR Scan Verification</span>
              </div>
            </div>
          </div>

          {/* Inline SVG Chart */}
          <div className="relative w-full h-72 bg-slate-50 rounded-xl p-4 flex flex-col justify-between overflow-hidden border border-slate-200/60">
            {/* Grid overlay */}
            <div className="absolute inset-0 flex flex-col justify-between py-6 px-10 pointer-events-none opacity-40">
              <div className="w-full h-[1px] bg-slate-300"></div>
              <div className="w-full h-[1px] bg-slate-300"></div>
              <div className="w-full h-[1px] bg-slate-300"></div>
              <div className="w-full h-[1px] bg-slate-300"></div>
              <div className="w-full h-[1px] bg-slate-300"></div>
            </div>
            {/* Y-Axis */}
            <div className="absolute left-3 inset-y-6 flex flex-col justify-between text-[10px] font-mono text-slate-400 pointer-events-none">
              <span>5.0k</span>
              <span>3.75k</span>
              <span>2.5k</span>
              <span>1.25k</span>
              <span>0 rps</span>
            </div>
            {/* SVG */}
            <svg className="w-full h-full pt-2 pb-6 pl-10 pr-2 overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 800 240">
              <defs>
                <linearGradient id="primaryAreaGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#0055c4" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#0055c4" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="secondaryAreaGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#565e74" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#565e74" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0 180 Q 80 160 140 130 T 280 140 T 420 70 T 560 90 T 700 45 T 800 60 L 800 220 L 0 220 Z" fill="url(#primaryAreaGrad)" />
              <path d="M 0 195 Q 80 190 140 170 T 280 165 T 420 120 T 560 135 T 700 110 T 800 100 L 800 220 L 0 220 Z" fill="url(#secondaryAreaGrad)" />
              <path d="M 0 210 Q 70 205 140 198 T 280 190 T 420 160 T 560 175 T 700 155 T 800 148" fill="none" stroke="#727786" strokeDasharray="3 3" strokeWidth="1.5" />
              <path d="M 0 200 Q 80 195 140 185 T 280 180 T 420 140 T 560 155 T 700 130 T 800 125" fill="none" stroke="#bec6e0" strokeWidth="2" />
              <path d="M 0 195 Q 80 190 140 170 T 280 165 T 420 120 T 560 135 T 700 110 T 800 100" fill="none" stroke="#565e74" strokeWidth="2.5" />
              <path d="M 0 180 Q 80 160 140 130 T 280 140 T 420 70 T 560 90 T 700 45 T 800 60" fill="none" stroke="#0055c4" strokeLinecap="round" strokeWidth="3" />
              <circle className="animate-pulse" cx="700" cy="45" fill="#0055c4" r="4.5" />
              <circle cx="700" cy="45" fill="none" opacity="0.6" r="8" stroke="#0055c4" strokeWidth="1" />
            </svg>
            {/* X-Axis */}
            <div className="w-full flex justify-between pl-10 pr-2 pt-1 text-[10px] font-mono text-slate-400">
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00 (Peak)</span>
              <span>18:00 (Surge)</span>
              <span>22:00</span>
              <span>Now</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#0055c4]">info</span>
              <span>Evening surge peaked at 18:42 WAT with <strong className="text-slate-900">4,410 requests/sec</strong>. Zero dropped socket connections.</span>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase">Kafka Ingress: Stable</span>
          </div>
        </div>

        {/* Right 4-cols: Error Breakdown & Database Latencies */}
        <div className="lg:col-span-4 space-y-4">
          {/* Status Code Distribution Card */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider">HTTP Telemetry</span>
                <h4 className="text-sm font-bold text-slate-900">Status Code Distribution</h4>
              </div>
              <span className="text-[11px] font-bold text-[#0055c4] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                99.12% Success
              </span>
            </div>
            {/* Stacked bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="bg-[#0055c4] h-full" style={{ width: '99.12%' }} title="2xx Success"></div>
              <div className="bg-slate-500 h-full" style={{ width: '0.4%' }} title="3xx Redirect"></div>
              <div className="bg-slate-400 h-full" style={{ width: '0.41%' }} title="4xx Client"></div>
              <div className="bg-rose-600 h-full" style={{ width: '0.07%' }} title="5xx Server"></div>
            </div>
            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0055c4]"></span>
                  <span className="text-slate-700 font-medium">2xx OK / Accepted</span>
                </div>
                <span className="font-semibold text-slate-900">99.12% <span className="text-slate-400 font-normal">(3.80M)</span></span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                  <span className="text-slate-700 font-medium">3xx Redirects</span>
                </div>
                <span className="font-semibold text-slate-900">0.40% <span className="text-slate-400 font-normal">(15.3k)</span></span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span className="text-slate-700 font-medium">4xx Client Errors</span>
                </div>
                <span className="font-semibold text-slate-900">0.41% <span className="text-slate-400 font-normal">(15.7k)</span></span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                  <span className="text-slate-700 font-medium">5xx Server Faults</span>
                </div>
                <span className="font-semibold text-rose-600">0.07% <span className="text-slate-400 font-normal">(2,680)</span></span>
              </div>
            </div>
          </div>

          {/* Database & Cache Performance */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider">Persistence Tier</span>
                <h4 className="text-sm font-bold text-slate-900">Data &amp; Cache Latencies</h4>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-lg">dns</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#0055c4]">database</span>
                  <div>
                    <div className="font-semibold text-slate-900">PostgreSQL Master</div>
                    <div className="text-[11px] text-slate-500">Write pool (Lagos Core)</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">4.8ms</div>
                  <div className="text-[10px] text-[#0055c4] font-semibold">Read: 1.1ms</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#0055c4]">memory</span>
                  <div>
                    <div className="font-semibold text-slate-900">Redis Cache Fleet</div>
                    <div className="text-[11px] text-slate-500">Cluster hit-rate 98.4%</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">0.9ms</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">Optimal Hit</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#0055c4]">search_insights</span>
                  <div>
                    <div className="font-semibold text-slate-900">ElasticSearch Discover</div>
                    <div className="text-[11px] text-slate-500">Deal index latency</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">18.2ms</div>
                  <div className="text-[10px] text-slate-500">p95 Index</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subsystems & Services Status Ledger */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
              <span>Critical Microservices</span>
              <span>·</span>
              <span className="text-[#0055c4]">Health Ledger</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Subsystems Performance &amp; SLA Breakdown</h3>
          </div>
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
            <input
              type="text"
              placeholder="Filter microservices..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0055c4] focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-y border-slate-200/60">
                <th className="py-2.5 px-3">Subsystem &amp; Endpoint</th>
                <th className="py-2.5 px-3">Runtime State</th>
                <th className="py-2.5 px-3">30D Availability</th>
                <th className="py-2.5 px-3">Average Latency</th>
                <th className="py-2.5 px-3">Active Throughput</th>
                <th className="py-2.5 px-3">Error Budget</th>
                <th className="py-2.5 px-3 text-right">Diagnostics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubsystems.map(sub => (
                <tr key={sub.endpoint} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0055c4] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">{sub.icon}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{sub.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{sub.endpoint}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${sub.statusClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sub.dotClass}`}></span>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{sub.availability}</td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-900">{sub.latencyAvg}</div>
                    <div className="text-[11px] text-slate-400">{sub.latencyP99}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">{sub.throughput}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#0055c4] h-full" style={{ width: `${sub.errorBudget}%` }}></div>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">{sub.errorBudget}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => showToast(`Diagnostics terminal opened for ${sub.endpoint}`)}
                      className="text-slate-400 hover:text-[#0055c4] transition-colors p-1 rounded"
                    >
                      <span className="material-symbols-outlined text-base">terminal</span>
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

