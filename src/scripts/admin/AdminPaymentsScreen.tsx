import { useState, useMemo } from 'react';

interface PaymentRecord {
  id: string;
  ref: string;
  time: string;
  merchantName: string;
  paymentType: string;
  amount: number;
  amountDisplay: string;
  rail: string;
  railSub: string;
  gatewaySyncCode: string;
  gatewaySyncType: 'ok' | 'err' | 'matched' | 'reversed';
  status: 'SETTLED' | 'RETRY #2' | 'REVERSED' | 'PENDING';
}

interface PaymentDossier {
  ref: string;
  merchantName: string;
  grossBilled: number;
  vatPct: number;
  whtPct: number;
  gatewayRef: string;
  rrn: string;
  rail: string;
  authToken: string;
  webhookLatency: string;
  invoiceNumber: string;
  billingSchedule: string;
  corporateEntity: string;
  tin: string;
  time: string;
}

const PAYMENT_RECORDS: PaymentRecord[] = [
  {
    id: 'pay_1',
    ref: '#PAY-883192',
    time: 'Nov 18, 14:28:09',
    merchantName: 'Slot Electronics',
    paymentType: 'Subscription Fee',
    amount: 120000,
    amountDisplay: '₦120,000',
    rail: 'NIBSS Direct',
    railSub: 'GTBank Mandate',
    gatewaySyncCode: '200 OK',
    gatewaySyncType: 'ok',
    status: 'SETTLED',
  },
  {
    id: 'pay_2',
    ref: '#PAY-883140',
    time: 'Nov 18, 13:45:21',
    merchantName: 'Mega Seafood Hub',
    paymentType: 'Ad Spend Deposit',
    amount: 45000,
    amountDisplay: '₦45,000',
    rail: 'Paystack Card',
    railSub: 'Mastercard •• 4019',
    gatewaySyncCode: '200 OK',
    gatewaySyncType: 'ok',
    status: 'SETTLED',
  },
  {
    id: 'pay_3',
    ref: '#PAY-883098',
    time: 'Nov 18, 12:10:44',
    merchantName: 'Oasis Luxury Wellness',
    paymentType: 'Setup Fee',
    amount: 18500,
    amountDisplay: '₦18,500',
    rail: 'Flutterwave Card',
    railSub: 'Visa •• 9811',
    gatewaySyncCode: '502 ERR',
    gatewaySyncType: 'err',
    status: 'RETRY #2',
  },
  {
    id: 'pay_4',
    ref: '#PAY-882950',
    time: 'Nov 18, 09:30:12',
    merchantName: 'Medplus Pharmacy',
    paymentType: 'Subscription Fee',
    amount: 450000,
    amountDisplay: '₦450,000',
    rail: 'Bank Transfer',
    railSub: 'Zenith NIBSS',
    gatewaySyncCode: 'MATCHED',
    gatewaySyncType: 'matched',
    status: 'SETTLED',
  },
  {
    id: 'pay_5',
    ref: '#PAY-882741',
    time: 'Nov 17, 18:22:05',
    merchantName: 'Punto Coma Lounge',
    paymentType: 'Overage Charge',
    amount: 45000,
    amountDisplay: '₦45,000',
    rail: 'Paystack Card',
    railSub: 'Mastercard •• 1102',
    gatewaySyncCode: 'REV 200',
    gatewaySyncType: 'reversed',
    status: 'REVERSED',
  },
];

const DOSSIERS: Record<string, PaymentDossier> = {
  pay_1: {
    ref: '#PAY-883192',
    merchantName: 'Slot Electronics Flagship',
    grossBilled: 120000,
    vatPct: 7.5,
    whtPct: 5,
    gatewayRef: 'pstk_trx_9984102941',
    rrn: '004928172910',
    rail: 'GTBank NIBSS Direct Debit',
    authToken: 'AUTH_883910_GTB',
    webhookLatency: '142ms at 14:28:10 WAT',
    invoiceNumber: 'INV-2024-11-0492',
    billingSchedule: 'Platinum Plan (Nov 18 - Dec 17, 2024)',
    corporateEntity: 'Slot Systems Limited',
    tin: '28491029-001',
    time: 'Nov 18, 14:28:09',
  },
  pay_2: {
    ref: '#PAY-883140',
    merchantName: 'Mega Seafood Hub',
    grossBilled: 45000,
    vatPct: 7.5,
    whtPct: 5,
    gatewayRef: 'pstk_trx_9984100422',
    rrn: '004928170012',
    rail: 'Paystack Mastercard Direct',
    authToken: 'AUTH_883140_MSH',
    webhookLatency: '98ms at 13:45:22 WAT',
    invoiceNumber: 'INV-2024-11-0488',
    billingSchedule: 'Ad Spend Deposit (Nov 18, 2024)',
    corporateEntity: 'Mega Seafood Hub Ltd',
    tin: '10928374-002',
    time: 'Nov 18, 13:45:21',
  },
  pay_3: {
    ref: '#PAY-883098',
    merchantName: 'Oasis Luxury Wellness',
    grossBilled: 18500,
    vatPct: 7.5,
    whtPct: 5,
    gatewayRef: 'flw_trx_88201943',
    rrn: '004928169100',
    rail: 'Flutterwave Visa Card',
    authToken: 'AUTH_883098_OLW',
    webhookLatency: 'N/A – Failed',
    invoiceNumber: 'INV-2024-11-0481',
    billingSchedule: 'Setup Fee (Nov 18, 2024)',
    corporateEntity: 'Oasis Luxury Wellness NG Ltd',
    tin: '29381740-003',
    time: 'Nov 18, 12:10:44',
  },
  pay_4: {
    ref: '#PAY-882950',
    merchantName: 'Medplus Pharmacy',
    grossBilled: 450000,
    vatPct: 7.5,
    whtPct: 5,
    gatewayRef: 'nibss_trx_9820194410',
    rrn: '004928164004',
    rail: 'Zenith Bank NIBSS',
    authToken: 'AUTH_882950_ZEN',
    webhookLatency: '210ms at 09:30:13 WAT',
    invoiceNumber: 'INV-2024-11-0479',
    billingSchedule: 'Platinum Annual Plan (Nov 2024)',
    corporateEntity: 'Medplus Pharmacy Network Ltd',
    tin: '83019284-001',
    time: 'Nov 18, 09:30:12',
  },
  pay_5: {
    ref: '#PAY-882741',
    merchantName: 'Punto Coma Lounge',
    grossBilled: 45000,
    vatPct: 7.5,
    whtPct: 5,
    gatewayRef: 'pstk_trx_9983920011',
    rrn: '004928155901',
    rail: 'Paystack Mastercard Direct',
    authToken: 'AUTH_882741_PCL',
    webhookLatency: 'REV 200 at 18:22:06 WAT',
    invoiceNumber: 'INV-2024-11-0461',
    billingSchedule: 'Overage Charge (Nov 17, 2024)',
    corporateEntity: 'Punto Coma Catering Concepts',
    tin: '77291940-005',
    time: 'Nov 17, 18:22:05',
  },
};

interface AdminPaymentsScreenProps {
  onNavigate: (path: string) => void;
}

export function AdminPaymentsScreen({ onNavigate }: AdminPaymentsScreenProps) {
  const [selectedId, setSelectedId] = useState<string>('pay_1');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [railFilter, setRailFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedRecord = PAYMENT_RECORDS.find(r => r.id === selectedId) ?? PAYMENT_RECORDS[0];
  const dossier = DOSSIERS[selectedId] ?? DOSSIERS['pay_1'];

  const gross = dossier.grossBilled;
  const vat = Math.round(gross * (dossier.vatPct / 100));
  const wht = Math.round(gross * (dossier.whtPct / 100));
  const net = gross + vat - wht;

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const filteredRecords = useMemo(() => {
    return PAYMENT_RECORDS.filter(r => {
      const matchSearch = r.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.merchantName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' ||
        (statusFilter === 'SETTLED' && r.status === 'SETTLED') ||
        (statusFilter === 'FAILED' && (r.status === 'RETRY #2')) ||
        (statusFilter === 'REVERSED' && r.status === 'REVERSED');
      const matchRail = railFilter === 'ALL' || r.rail.toLowerCase().includes(railFilter.toLowerCase());
      const matchType = typeFilter === 'ALL' || r.paymentType === typeFilter;
      return matchSearch && matchStatus && matchRail && matchType;
    });
  }, [searchQuery, statusFilter, railFilter, typeFilter]);

  const getGatewaySyncBadge = (r: PaymentRecord) => {
    switch (r.gatewaySyncType) {
      case 'ok': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">{r.gatewaySyncCode}</span>;
      case 'err': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">{r.gatewaySyncCode}</span>;
      case 'matched': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">{r.gatewaySyncCode}</span>;
      case 'reversed': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-bold text-[10px]">{r.gatewaySyncCode}</span>;
    }
  };

  const getStatusBadge = (r: PaymentRecord) => {
    switch (r.status) {
      case 'SETTLED': return <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">SETTLED</span>;
      case 'RETRY #2': return <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">RETRY #2</span>;
      case 'REVERSED': return <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[10px]">REVERSED</span>;
      case 'PENDING': return <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">PENDING</span>;
    }
  };

  const getDossierStatusBadge = () => {
    switch (selectedRecord.status) {
      case 'SETTLED': return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          SETTLED &amp; RECONCILED • 200 OK
        </span>
      );
      case 'RETRY #2': return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          FAILED • RETRY #2 QUEUED
        </span>
      );
      case 'REVERSED': return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          REVERSED • REV 200
        </span>
      );
      default: return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] w-full mx-auto">
      {/* Toast */}
      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[12px] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
            <span className="font-medium">{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-emerald-600 hover:text-emerald-800">
            <span className="material-symbols-outlined text-[15px]">close</span>
          </button>
        </div>
      )}

      {/* Top Command Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#0055c4] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#0055c4] animate-pulse inline-block" />
            <span>Core Settlement &amp; Webhook Registry</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500 font-medium normal-case tracking-normal">Ledger Engine v4.1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Platform Payment Operations &amp; Financial Reconciliation
          </h1>
          <p className="text-[13px] text-slate-500 mt-1 max-w-4xl">
            Review merchant subscription collections, fee receipts, payment gateway webhook syncs, gateway failure diagnostics, and refund chargebacks across all payment rails.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => triggerNotice('Gateway batch reconciliation triggered across NIBSS, Paystack, and Flutterwave rails.')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[12px] font-medium shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">sync_alt</span>
            <span>Reconcile Gateway Batch</span>
          </button>
          <button
            onClick={() => triggerNotice('Exporting payment ledger to CSV and PDF...')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#066cf4] text-white text-[12px] font-semibold shadow-sm hover:bg-[#0055c4] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Ledger (CSV/PDF)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Payments (MTD)</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">₦98.4M</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-[#0055c4]">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="mt-4 p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
            <span className="text-[11px] text-slate-500">4,210 txns processed</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />98.8% SETTLED
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Failed &amp; Disputed</span>
              <div className="text-2xl font-bold text-red-600 mt-1">₦1.85M</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
          </div>
          <div className="mt-4 p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
            <span className="text-[11px] text-slate-500">18 Failed Webhooks</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
              6 ACTIVE DISPUTES
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Refunds &amp; Reversals</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">₦420,000</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
              <span className="material-symbols-outlined text-[20px]">history_toggle_off</span>
            </div>
          </div>
          <div className="mt-4 p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
            <span className="text-[11px] text-slate-500">4 reversed this month</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-semibold">
              QUAD-EYE VERIFIED
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Gateway Ingestion Health</span>
              <div className="text-2xl font-bold text-[#0055c4] mt-1">99.98%</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0055c4] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">speed</span>
            </div>
          </div>
          <div className="mt-4 p-2.5 bg-slate-50 rounded-lg flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>PSTK 140ms</span>
            <span className="text-slate-300">|</span>
            <span>FLW 185ms</span>
            <span className="text-slate-300">|</span>
            <span>NIBSS 210ms</span>
          </div>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-2xl">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">manage_search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Transaction Ref, RRN, Merchant, Invoice #, or Gateway ID..."
              className="w-full h-10 pl-10 pr-20 rounded-lg bg-slate-50 border border-slate-200 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055c4]/20 focus:border-[#0055c4] transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-slate-200 text-slate-500 text-[10px] font-bold">ESC to Clear</kbd>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-[12px]">
              <span className="text-[10px] text-slate-500 px-2 uppercase font-bold">Rail:</span>
              <select
                value={railFilter}
                onChange={e => setRailFilter(e.target.value)}
                className="bg-transparent text-slate-800 font-medium focus:outline-none pr-2 cursor-pointer py-1 text-[12px]"
              >
                <option value="ALL">All Rails</option>
                <option value="NIBSS">NIBSS Direct</option>
                <option value="Paystack">Paystack</option>
                <option value="Flutterwave">Flutterwave</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-[12px]">
              <span className="text-[10px] text-slate-500 px-2 uppercase font-bold">Type:</span>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-transparent text-slate-800 font-medium focus:outline-none pr-2 cursor-pointer py-1 text-[12px]"
              >
                <option value="ALL">All Types</option>
                <option value="Subscription Fee">Subscription Fee</option>
                <option value="Ad Spend Deposit">Ad Spend Deposit</option>
                <option value="Setup Fee">Setup Fee</option>
                <option value="Overage Charge">Overage Charge</option>
              </select>
            </div>
            <button
              onClick={() => { setSearchQuery(''); setRailFilter('ALL'); setTypeFilter('ALL'); setStatusFilter('ALL'); }}
              className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
              title="Refresh / Clear Filters"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { key: 'ALL', label: 'All Transactions', count: '4,210' },
            { key: 'SETTLED', label: 'Successful', count: '4,158' },
            { key: 'FAILED', label: 'Failed / Retrying', count: '34', red: true },
            { key: 'DISPUTED', label: 'Disputed', count: '12', amber: true },
            { key: 'REVERSED', label: 'Refunded', count: '6' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-2 shrink-0 transition-colors ${
                statusFilter === tab.key
                  ? 'bg-[#0055c4] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                statusFilter === tab.key
                  ? 'bg-white/20 text-white'
                  : tab.red
                  ? 'bg-red-100 text-red-700'
                  : tab.amber
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Dual-Pane Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* LEFT: Ledger Table */}
        <div className="xl:col-span-7 flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0055c4] text-[18px]">receipt_long</span>
              <h2 className="text-[15px] font-bold text-slate-900">Payment Ingestion Ledger</h2>
            </div>
            <span className="text-[12px] text-slate-400">Showing {filteredRecords.length} of 4,210 batches</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Txn Ref &amp; Time</th>
                  <th className="py-2.5 px-3">Merchant &amp; Type</th>
                  <th className="py-2.5 px-3 text-right">Amount (₦)</th>
                  <th className="py-2.5 px-3">Payment Rail</th>
                  <th className="py-2.5 px-3">Gateway Sync</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map(r => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedId === r.id
                        ? 'bg-blue-50/70 hover:bg-blue-50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className={`text-[13px] font-bold flex items-center gap-1 ${selectedId === r.id ? 'text-[#0055c4]' : 'text-slate-800'}`}>
                          {r.ref}
                          {selectedId === r.id && <span className="w-1.5 h-1.5 rounded-full bg-[#0055c4] inline-block" />}
                        </span>
                        <span className="text-[11px] text-slate-400">{r.time}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col max-w-[140px]">
                        <span className="text-[13px] font-medium text-slate-800 truncate">{r.merchantName}</span>
                        <span className="text-[11px] text-slate-400">{r.paymentType}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`text-[13px] font-bold ${r.status === 'RETRY #2' ? 'text-red-600' : r.status === 'REVERSED' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {r.amountDisplay}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="text-[13px] text-slate-800 truncate">{r.rail}</span>
                        <span className="text-[11px] text-slate-400">{r.railSub}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">{getGatewaySyncBadge(r)}</td>
                    <td className="py-3 px-3 text-center">{getStatusBadge(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between">
            <span className="text-[12px] text-slate-400">Showing 1 - {filteredRecords.length} of 4,210 transactions</span>
            <div className="flex items-center gap-1">
              <button disabled className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-slate-400 disabled:opacity-40">
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <span className="px-2 text-[11px] font-bold text-slate-800">1</span>
              <button className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Dossier */}
        <div className="xl:col-span-5 flex flex-col gap-3">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Dossier Header */}
            <div className="p-4 bg-slate-50/80 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Selected Payment Dossier</span>
                {getDossierStatusBadge()}
              </div>
              <div className="flex items-start justify-between mt-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[18px] font-bold text-slate-900">{dossier.ref}</span>
                    <button
                      onClick={handleCopy}
                      title="Copy Transaction Reference"
                      className="text-slate-400 hover:text-[#0055c4] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
                    </button>
                  </div>
                  <span className="text-[14px] font-semibold text-[#0055c4]">{dossier.merchantName}</span>
                </div>
                <button
                  onClick={() => onNavigate('/admin/businesses')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0055c4] text-[12px] font-semibold transition-all"
                >
                  <span>View Merchant Profile</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-4">
              {/* Fiscal Breakdown */}
              <div className="bg-slate-50/60 p-3 rounded-xl flex flex-col gap-1.5">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Financial &amp; Tax Settlement Ledger</span>
                  <span className="text-[11px] text-slate-400">NG-WAT Cleared</span>
                </div>
                <div className="flex justify-between items-center text-[13px] pt-1">
                  <span className="text-slate-500">Gross Billed Subscription:</span>
                  <span className="font-semibold text-slate-900">₦{gross.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-slate-500">Applicable VAT ({dossier.vatPct}% Itemized):</span>
                  <span className="font-medium text-slate-800">+₦{vat.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-slate-500">Withholding Tax (WHT {dossier.whtPct}% Source):</span>
                  <span className="font-medium text-red-600">-₦{wht.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between items-center text-[15px] font-bold pt-2 text-[#0055c4] border-t border-slate-200 mt-1">
                  <span>Net Settled to VEMTAP:</span>
                  <span>₦{net.toLocaleString()}.00</span>
                </div>
              </div>

              {/* Gateway Protocol Trace */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Gateway Protocol Trace &amp; Handshake</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">HMAC-SHA512 VERIFIED</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { label: 'Gateway Provider Reference', value: dossier.gatewayRef },
                    { label: 'Bank Retrieval Ref (RRN)', value: dossier.rrn },
                    { label: 'Ingestion Rail & Mandate', value: dossier.rail },
                    { label: 'Authorization Token', value: dossier.authToken },
                  ].map(item => (
                    <div key={item.label} className="p-2 bg-slate-50 rounded-lg flex flex-col">
                      <span className="text-[11px] text-slate-400">{item.label}</span>
                      <span className="text-[12px] font-mono font-medium text-slate-800 truncate" title={item.value}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="p-2 bg-slate-100 rounded-lg flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0055c4] text-[18px]">cell_tower</span>
                    <span className="text-[12px] text-slate-700">Webhook Latency: <strong className="text-slate-900">{dossier.webhookLatency}</strong></span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Delivered &amp; Stored</span>
                </div>
              </div>

              {/* Invoice */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tax Invoice &amp; Legal Entity</span>
                <div className="p-3 bg-slate-50 rounded-xl flex flex-col gap-1.5">
                  {[
                    { label: 'Tax Invoice Number', value: dossier.invoiceNumber, mono: true },
                    { label: 'Billing Schedule', value: dossier.billingSchedule },
                    { label: 'Corporate Entity', value: dossier.corporateEntity },
                    { label: 'Tax Identification (TIN)', value: dossier.tin, mono: true },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between text-[13px]">
                      <span className="text-slate-500">{item.label}:</span>
                      <span className={`font-medium text-slate-800 ${item.mono ? 'font-mono' : ''}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Grid */}
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Operational Actions &amp; Controls</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => triggerNotice('Tax invoice PDF generated and downloading...')}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[12px] font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-slate-500">receipt</span>
                    <span>Download Tax PDF</span>
                  </button>
                  <button
                    onClick={() => triggerNotice(`Webhook re-dispatched for ${dossier.ref}. Delivery status: 200 OK.`)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[12px] font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-slate-500">forward_to_inbox</span>
                    <span>Resend Webhook</span>
                  </button>
                  <button
                    onClick={() => triggerNotice(`${dossier.ref} flagged for compliance audit review.`)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[12px] font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">assignment_late</span>
                    <span>Flag for Audit</span>
                  </button>
                  <button
                    onClick={() => triggerNotice(`Refund initiated for ${dossier.ref}. Amount will be reversed to merchant within 24h.`)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[12px] font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">undo</span>
                    <span>Initiate Refund</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Card */}
          <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#0055c4] text-[20px]">shield</span>
              <div>
                <span className="text-[12px] font-bold text-slate-800 block">Dual-Authorizer Approval Active</span>
                <span className="text-[11px] text-slate-500">Financial modifications &gt;₦100K require 2 FA verification</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}

