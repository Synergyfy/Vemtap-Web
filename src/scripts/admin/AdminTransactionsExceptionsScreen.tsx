import { useState, useMemo } from 'react';

interface TransactionException {
  id: string;
  ref: string;
  timeAgo: string;
  rrn: string;
  merchantName: string;
  merchantCluster: string;
  terminalCode: string;
  customerName: string;
  customerTier: string;
  amount: number;
  paymentRail: string;
  exceptionReason: string;
  subReason: string;
  riskScore: number;
  severity: 'HIGH' | 'MED' | 'LOW' | 'CRIT';
  status: 'ESCROW LOCKED' | 'PENDING RE-TRY' | 'UNDER REVIEW' | 'INVESTIGATING' | 'QUEUED SYNC' | 'RESOLVED';
  claimedItem: string;
  issuerStatus: string;
  ruleCode: string;
  diagnosisText: string;
  traceSteps: {
    title: string;
    time: string;
    desc: string;
    status: 'success' | 'error' | 'sync';
  }[];
}

const EXCEPTIONS_DATA: TransactionException[] = [
  {
    id: 'exc_1',
    ref: '#TX-883921',
    timeAgo: '14m ago',
    rrn: '004928172910',
    merchantName: 'Slot Electronics Flagship',
    merchantCluster: 'Ikeja Hub (Terminal 04)',
    terminalCode: 'POS-IKJ-04 (v4.2.1)',
    customerName: 'Chiamaka Okonkwo',
    customerTier: 'Tier 3 Verified',
    amount: 145000,
    paymentRail: 'NGN Wallet',
    exceptionReason: 'Hardware Timeout',
    subReason: 'Double Auth Ping',
    riskScore: 88,
    severity: 'HIGH',
    status: 'ESCROW LOCKED',
    claimedItem: 'Samsung Galaxy S24 Ultra Acc.',
    issuerStatus: 'Hold 1 Settled • Hold 2 Pending Reversal',
    ruleCode: 'VEM-VELO-2',
    diagnosisText:
      "The consumer's NFC wallet triggered an authorization tap at 14:14:02. POS terminal delayed sending settlement confirmation by 4,200ms due to cellular network jitter, prompting consumer to re-tap, generating dual pre-auth holds.",
    traceSteps: [
      {
        title: 'Tap 1 Auth Accepted',
        time: '14:14:02',
        desc: '₦145,000 captured from GTBank Card ending in 4019',
        status: 'success',
      },
      {
        title: 'Terminal ACK Timeout',
        time: '14:14:06 (+4.2s)',
        desc: 'POS-IKJ-04 socket reset before printing receipt',
        status: 'error',
      },
      {
        title: 'Tap 2 Duplicate Pre-Auth',
        time: '14:14:11',
        desc: 'Escrow engine detected identical amount & card within 9s',
        status: 'sync',
      },
    ],
  },
  {
    id: 'exc_2',
    ref: '#TX-883890',
    timeAgo: '38m ago',
    rrn: '004928171104',
    merchantName: 'Chicken Republic QSR',
    merchantCluster: 'Wuse 2 Hub',
    terminalCode: 'POS-ABJ-02 (v4.2.1)',
    customerName: 'Ibrahim Aliyu',
    customerTier: 'Tier 1 Regular',
    amount: 8400,
    paymentRail: 'Debit Card',
    exceptionReason: 'Issuer Decline',
    subReason: 'Post-NFC Tap Fail',
    riskScore: 45,
    severity: 'MED',
    status: 'PENDING RE-TRY',
    claimedItem: '2x Citizens Meal + Large Refuel Combo',
    issuerStatus: 'Bank Gateway 502 Timeout',
    ruleCode: 'VEM-GATE-1',
    diagnosisText:
      'Customer tapped NFC card; bank switch timed out during CVV check. Merchant terminal displayed retry code without debiting funds.',
    traceSteps: [
      {
        title: 'Contactless Tap Initiated',
        time: '13:48:10',
        desc: 'NFC handshake acknowledged by PAX A920 terminal',
        status: 'success',
      },
      {
        title: 'Bank Issuer Rejection',
        time: '13:48:14',
        desc: 'Interswitch switch reported code 91: Issuer or Switch Inoperative',
        status: 'error',
      },
    ],
  },
  {
    id: 'exc_3',
    ref: '#TX-883842',
    timeAgo: '1h 12m ago',
    rrn: '004928169902',
    merchantName: 'Medplus Pharmacy Palms',
    merchantCluster: 'Lekki Phase 1',
    terminalCode: 'POS-LEK-08 (v4.2.1)',
    customerName: 'Yetunde Balogun',
    customerTier: 'Tier 2 Prime',
    amount: 32600,
    paymentRail: 'POS Tap',
    exceptionReason: 'Velocity Alert',
    subReason: 'Duplicate <30s Hold',
    riskScore: 79,
    severity: 'HIGH',
    status: 'UNDER REVIEW',
    claimedItem: 'Prescription Vitamins & Skin Care',
    issuerStatus: 'Auto-Locked by AI Watchdog',
    ruleCode: 'VEM-VELO-1',
    diagnosisText:
      'Card used across 2 distinct cash registers in under 28 seconds. Escrow held pending cashier verification of customer ID.',
    traceSteps: [
      {
        title: 'Terminal 01 Auth',
        time: '13:14:20',
        desc: '₦32,600 pre-auth confirmed at Cashier Desk A',
        status: 'success',
      },
      {
        title: 'Terminal 02 Duplicate Tap',
        time: '13:14:48',
        desc: 'Duplicate swipe at Cosmetics Counter flagged by velocity rule',
        status: 'error',
      },
    ],
  },
  {
    id: 'exc_4',
    ref: '#TX-883715',
    timeAgo: '2h 05m ago',
    rrn: '004928164019',
    merchantName: 'Mega Plaza Store VI',
    merchantCluster: 'Victoria Island',
    terminalCode: 'POS-VI-11 (v4.2.0)',
    customerName: 'Oladipo Vance',
    customerTier: 'Tier 1 Regular',
    amount: 64000,
    paymentRail: 'Apple Pay Sync',
    exceptionReason: 'Geofence Anomaly',
    subReason: 'NFC Tap >50m off POS',
    riskScore: 92,
    severity: 'CRIT',
    status: 'INVESTIGATING',
    claimedItem: 'Designer Fragrance & Grooming Set',
    issuerStatus: 'Flagged by Spatial Polygon Beacon',
    ruleCode: 'VEM-GEO-4',
    diagnosisText:
      'Smartphone GPS coordinates reported 180m away from the registered physical POS beacon at the exact time of the transaction authorization.',
    traceSteps: [
      {
        title: 'Apple Pay Biometric Accepted',
        time: '12:21:04',
        desc: 'TouchID cryptographic token generated',
        status: 'success',
      },
      {
        title: 'Spatial Coordinates Mismatch',
        time: '12:21:05',
        desc: 'Device lat/long outside registered Victoria Island store boundary',
        status: 'error',
      },
    ],
  },
  {
    id: 'exc_5',
    ref: '#TX-883602',
    timeAgo: '3h 22m ago',
    rrn: '004928159981',
    merchantName: 'Casabella Beauty',
    merchantCluster: 'Victoria Island',
    terminalCode: 'POS-VI-03 (v4.2.1)',
    customerName: 'Stephanie Kalu',
    customerTier: 'Tier 2 Prime',
    amount: 18000,
    paymentRail: 'Transfer Link',
    exceptionReason: 'Webhook Drop',
    subReason: '5 Max Retries Hit',
    riskScore: 30,
    severity: 'LOW',
    status: 'QUEUED SYNC',
    claimedItem: 'Hair Treatment Voucher',
    issuerStatus: 'Bank Transfer Cleared • Webhook Pending',
    ruleCode: 'VEM-HOOK-3',
    diagnosisText:
      'Merchant cloud ERP endpoint returned HTTP 500 during automated webhook dispatch. Queued for background exponential backoff replay.',
    traceSteps: [
      {
        title: 'Monnify Transfer Confirmed',
        time: '11:04:12',
        desc: '₦18,000 settled into VEMTAP master pool',
        status: 'success',
      },
      {
        title: 'Merchant Webhook 500',
        time: '11:04:13',
        desc: 'Endpoint https://api.casabella.ng/webhooks timed out',
        status: 'error',
      },
    ],
  },
];

interface AdminTransactionsExceptionsScreenProps {
  onNavigate: (path: string) => void;
}

export function AdminTransactionsExceptionsScreen({ onNavigate }: AdminTransactionsExceptionsScreenProps) {
  const [exceptions, setExceptions] = useState<TransactionException[]>(EXCEPTIONS_DATA);
  const [selectedId, setSelectedId] = useState<string>(EXCEPTIONS_DATA[0].id);
  const [categoryTab, setCategoryTab] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const selectedCase = useMemo(() => {
    return exceptions.find((e) => e.id === selectedId) || exceptions[0];
  }, [exceptions, selectedId]);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const filteredExceptions = useMemo(() => {
    return exceptions.filter((exc) => {
      const matchesSearch =
        exc.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exc.rrn.includes(searchQuery) ||
        exc.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exc.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exc.terminalCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity = severityFilter === 'ALL' || exc.severity === severityFilter;

      let matchesCategory = true;
      if (categoryTab === 'FAILED') matchesCategory = exc.exceptionReason.includes('Timeout') || exc.exceptionReason.includes('Decline');
      if (categoryTab === 'DISPUTED') matchesCategory = exc.exceptionReason.includes('Velocity') || exc.status === 'ESCROW LOCKED';
      if (categoryTab === 'DUPLICATE') matchesCategory = exc.subReason.includes('Duplicate') || exc.subReason.includes('Double');
      if (categoryTab === 'TIMEOUT') matchesCategory = exc.exceptionReason.includes('Timeout') || exc.subReason.includes('Timeout');

      return matchesSearch && matchesSeverity && matchesCategory;
    });
  }, [exceptions, searchQuery, severityFilter, categoryTab]);

  const handleForceReverse = (ref: string, amount: number) => {
    setExceptions(
      exceptions.map((e) => (e.ref === ref ? { ...e, status: 'RESOLVED' } : e))
    );
    triggerNotice(`Duplicate hold for ${ref} successfully reversed. ₦${amount.toLocaleString()} refunded to customer wallet.`);
  };

  const handleReleaseEscrow = (ref: string) => {
    setExceptions(
      exceptions.map((e) => (e.ref === ref ? { ...e, status: 'RESOLVED' } : e))
    );
    triggerNotice(`Escrow hold released for ${ref}. Funds dispatched to merchant settlement queue.`);
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

      {/* Top Action & Meta Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-[#0055c4] uppercase tracking-widest bg-blue-100 text-[#0055c4] px-2 py-0.5 rounded-full">
              Operations Protocol 06.2
            </span>
            <span className="text-slate-400 text-[11px] font-mono">• Live Stream Sync: Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Transactions &amp; Exception Handling
          </h1>
          <p className="text-[13px] text-slate-500 max-w-4xl mt-0.5">
            Supervise payment settlement streams, failed authorizations, disputed charges, and abnormal transactional velocity across merchant nodes.
          </p>
        </div>

        {/* Quick Toolbelt Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => triggerNotice('Exporting disputed transactions batch CSV...')}
            className="h-9 px-3.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-[12px] font-semibold shadow-2xs transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">file_download</span>
            <span>Export Disputed Batch</span>
          </button>
          <button
            onClick={() => triggerNotice('Settlement rules configuration panel loaded.')}
            className="h-9 px-3.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-[12px] font-semibold shadow-2xs transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">rule</span>
            <span>Settlement Rules</span>
          </button>
          <button
            onClick={() => triggerNotice('Bulk re-verification executed across 42 active exception records.')}
            className="h-9 px-4 rounded-lg bg-[#0055c4] hover:bg-[#066cf4] text-white text-[12px] font-semibold shadow-2xs transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Bulk Re-verify</span>
          </button>
        </div>
      </div>

      {/* Metric / KPI Summary Cards (4 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1: Daily Transaction Volume */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Daily Transaction Volume
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">₦284.5M</span>
                <span className="text-[11px] text-slate-500 font-medium">32,490 txns</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0055c4]">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 flex items-center justify-between border-t border-slate-100 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-slate-800">99.4% Success Rate</span>
            </div>
            <span className="text-emerald-600 font-bold">+3.2% vs yesterday</span>
          </div>
        </div>

        {/* Metric 2: Active Exceptions */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Active Exceptions
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-red-600 tracking-tight">42 Cases</span>
                <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full uppercase">
                  Action Required
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 flex items-center justify-between border-t border-slate-100 text-[11px]">
            <span className="font-bold text-red-600">18 High Priority</span>
            <span className="text-slate-400">24 Auto-Triage</span>
          </div>
        </div>

        {/* Metric 3: Total Disputed Value */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Disputed Value
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">₦2.14M</span>
                <span className="text-[11px] text-slate-400">0.007% GTV</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-[20px]">lock_clock</span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 flex items-center justify-between border-t border-slate-100 text-[11px]">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-[#0055c4]">security</span>
              <span className="text-slate-700 font-medium">Escrow Auto-locked</span>
            </div>
            <span className="text-[#0055c4] font-bold">100% Protected</span>
          </div>
        </div>

        {/* Metric 4: Avg Resolution Time */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Avg Resolution Time
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">1.8 Hours</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                  Optimal
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <span className="material-symbols-outlined text-[20px]">speed</span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 flex items-center justify-between border-t border-slate-100 text-[11px]">
            <span className="text-slate-500">SLA Target &lt; 4.0h</span>
            <span className="font-bold text-slate-900">94.2% on-time</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Area: Split Layout (65% Table / Worklist, 35% Resolution Dossier) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Panel: Filterable Worklist & Table */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          {/* Control Bar: Tabs, Search, Severity Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-3">
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <button
                onClick={() => setCategoryTab('ALL')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-colors ${
                  categoryTab === 'ALL'
                    ? 'bg-[#0055c4] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Exceptions (42)
              </button>
              <button
                onClick={() => setCategoryTab('FAILED')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-colors ${
                  categoryTab === 'FAILED'
                    ? 'bg-[#0055c4] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Failed Settlement (14)
              </button>
              <button
                onClick={() => setCategoryTab('DISPUTED')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-colors ${
                  categoryTab === 'DISPUTED'
                    ? 'bg-[#0055c4] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Chargeback / Disputed (12)
              </button>
              <button
                onClick={() => setCategoryTab('DUPLICATE')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-colors ${
                  categoryTab === 'DUPLICATE'
                    ? 'bg-[#0055c4] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Duplicate Tap Suspect (9)
              </button>
              <button
                onClick={() => setCategoryTab('TIMEOUT')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-colors ${
                  categoryTab === 'TIMEOUT'
                    ? 'bg-[#0055c4] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Terminal Timeout (7)
              </button>
            </div>

            {/* Filter Row: Universal Search & Severity Pill Toggle */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-100">
              <div className="relative w-full sm:w-80">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Filter Txn Ref, RRN, Customer, POS ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 text-[12px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0055c4]/30"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end text-[11px]">
                <span className="font-bold text-slate-400 uppercase mr-1">Severity:</span>
                <button
                  onClick={() => setSeverityFilter(severityFilter === 'HIGH' ? 'ALL' : 'HIGH')}
                  className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-colors ${
                    severityFilter === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> High Risk
                </button>
                <button
                  onClick={() => setSeverityFilter(severityFilter === 'MED' ? 'ALL' : 'MED')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-colors ${
                    severityFilter === 'MED' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setSeverityFilter(severityFilter === 'LOW' ? 'ALL' : 'LOW')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-colors ${
                    severityFilter === 'LOW' ? 'bg-blue-100 text-[#0055c4]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Low
                </button>
                {severityFilter !== 'ALL' && (
                  <button onClick={() => setSeverityFilter('ALL')} className="text-[10px] text-slate-400 underline ml-1">
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Exceptions Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                    <th className="py-3 px-4">Txn Ref / Time</th>
                    <th className="py-3 px-4">Merchant &amp; Cluster</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Exception Reason</th>
                    <th className="py-3 px-4 text-center">Risk Score</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {filteredExceptions.map((exc) => {
                    const isSelected = exc.id === selectedId;

                    return (
                      <tr
                        key={exc.id}
                        onClick={() => setSelectedId(exc.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/70 hover:bg-blue-50 border-l-4 border-l-[#0055c4]'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <span className="font-bold text-[#0055c4] block text-[13px]">{exc.ref}</span>
                              <span className="text-[11px] text-slate-400 font-mono">{exc.timeAgo}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block truncate max-w-[140px]">
                            {exc.merchantName}
                          </span>
                          <span className="text-[11px] text-slate-400">{exc.merchantCluster}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800 block">{exc.customerName}</span>
                          <span className="text-[11px] text-slate-400">{exc.customerTier}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-slate-900">₦{exc.amount.toLocaleString()}</span>
                          <span className="block text-[10px] text-slate-400">{exc.paymentRail}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-800 font-semibold block">{exc.exceptionReason}</span>
                          <span className="text-red-600 text-[11px] font-medium">{exc.subReason}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              exc.riskScore >= 80
                                ? 'bg-red-100 text-red-700'
                                : exc.riskScore >= 40
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">crisis_alert</span>
                            <span>{exc.riskScore} {exc.severity}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              exc.status === 'ESCROW LOCKED'
                                ? 'bg-red-600 text-white shadow-2xs'
                                : exc.status === 'RESOLVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {exc.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Terminal Network Signal Sub-section */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0055c4]">
                <span className="material-symbols-outlined text-[20px]">router</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-slate-900">Terminal Telemetry Beacon</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Auto-Recovery 91%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  314 POS units polling at 3-second heartbeat. Latency spikes detected in Ikeja South Sector.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="w-2 h-2 rounded-full bg-[#0055c4] animate-ping"></span>
                <span className="text-[11px] text-slate-700 font-mono font-bold">Sync Ping: 42ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Case Resolution Dossier (Sticky) */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-16 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-5 flex flex-col">
            {/* Dossier Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-slate-900 font-mono">{selectedCase.ref}</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      selectedCase.status === 'ESCROW LOCKED'
                        ? 'bg-red-600 text-white'
                        : selectedCase.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedCase.status}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  RRN: <code className="font-mono text-slate-700 font-bold">{selectedCase.rrn}</code>
                </span>
              </div>
              <button
                onClick={() => triggerNotice(`Audit trail log opened for ${selectedCase.ref}.`)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
                title="Audit Log"
              >
                <span className="material-symbols-outlined text-[20px]">history</span>
              </button>
            </div>

            {/* Business Context & Navigation Link */}
            <div className="bg-slate-50 p-3 rounded-xl my-3 flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#0055c4] shadow-2xs border border-slate-200/80 font-bold">
                  <span className="material-symbols-outlined text-[20px]">storefront</span>
                </div>
                <div className="min-w-0">
                  <span className="text-[12px] font-bold text-slate-900 truncate block">{selectedCase.merchantName}</span>
                  <span className="text-[10px] text-slate-400 font-mono block">RC-1049281 • {selectedCase.merchantCluster}</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('/admin/businesses')}
                className="h-7 px-2 rounded bg-white hover:bg-[#0055c4] hover:text-white text-[#0055c4] text-[10px] font-bold transition-all shadow-2xs flex items-center gap-0.5 border border-slate-200"
              >
                <span>Profile</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </button>
            </div>

            {/* Anomaly Diagnostic Block */}
            <div className="py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Anomaly Diagnosis</span>
                <span className="font-mono text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-bold">
                  ERR_NFC_DOUBLE_CAPTURE_TIMEOUT
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[12px] text-slate-600 leading-relaxed">{selectedCase.diagnosisText}</p>
                <div className="mt-2.5 pt-2 flex items-center justify-between text-[11px] border-t border-slate-200/60">
                  <span>
                    Risk: <strong className="text-red-600">{selectedCase.riskScore}/100</strong> (Fraud Flag)
                  </span>
                  <span className="text-[#0055c4] font-bold font-mono">Rule: {selectedCase.ruleCode}</span>
                </div>
              </div>
            </div>

            {/* Transaction Detailed Breakdown */}
            <div className="py-2 text-[12px]">
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">
                Transaction Breakdown
              </span>
              <div className="flex flex-col gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Claimed Item:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[190px]">{selectedCase.claimedItem}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Authorized Total:</span>
                  <span className="font-extrabold text-[#0055c4] text-sm">₦{selectedCase.amount.toLocaleString()}.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Merchant Terminal:</span>
                  <span className="font-mono text-slate-800 text-[11px]">{selectedCase.terminalCode}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-slate-400">Issuer Status:</span>
                  <span className="text-slate-800 text-right font-medium text-[11px] max-w-[190px]">
                    {selectedCase.issuerStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Mini Visual Timeline / Authorization Step Trace */}
            <div className="py-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-2">Execution Trace</span>
              <div className="flex flex-col gap-2 pl-1">
                {selectedCase.traceSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-full text-white flex items-center justify-center mt-0.5 text-[9px] font-bold shrink-0 ${
                        step.status === 'success'
                          ? 'bg-emerald-500'
                          : step.status === 'error'
                          ? 'bg-red-500'
                          : 'bg-amber-500'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[10px]">
                        {step.status === 'success' ? 'check' : step.status === 'error' ? 'close' : 'sync'}
                      </span>
                    </div>
                    <div className="flex-1 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{step.title}</span>
                        <span className="text-slate-400 font-mono text-[10px]">{step.time}</span>
                      </div>
                      <span className="text-slate-500 block leading-snug">{step.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Administrative Resolution Controls */}
            <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">
                Administrative Remediation
              </span>
              <button
                onClick={() => handleForceReverse(selectedCase.ref, selectedCase.amount)}
                className="w-full h-10 px-3 rounded-xl bg-[#0055c4] hover:bg-[#066cf4] text-white text-[11px] font-bold shadow-2xs transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[17px]">undo</span>
                <span>Force Reverse Duplicate Hold (₦{selectedCase.amount.toLocaleString()} to Customer)</span>
              </button>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  onClick={() => handleReleaseEscrow(selectedCase.ref)}
                  className="h-8 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition-all flex items-center justify-center gap-1 border border-emerald-200"
                >
                  <span className="material-symbols-outlined text-[15px]">task_alt</span>
                  <span className="truncate">Release Escrow</span>
                </button>
                <button
                  onClick={() => triggerNotice(`Case ${selectedCase.ref} escalated to Tier 2 Fraud Lead.`)}
                  className="h-8 px-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold transition-all flex items-center justify-center gap-1 border border-red-200"
                >
                  <span className="material-symbols-outlined text-[15px]">shield</span>
                  <span className="truncate">Escalate Tier 2</span>
                </button>
              </div>

              <button
                onClick={() => triggerNotice(`Call initiated with ${selectedCase.merchantName} and ${selectedCase.customerName}.`)}
                className="w-full h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 border border-slate-200/80 mt-1"
              >
                <span className="material-symbols-outlined text-[16px]">support_agent</span>
                <span>Initiate Direct Call: Merchant &amp; Customer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

