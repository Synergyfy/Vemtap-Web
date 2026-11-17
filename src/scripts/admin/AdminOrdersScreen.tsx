import { useState, useMemo } from 'react';
import { RECENT_TRANSACTIONS, type PlatformTransaction } from './adminData';
import { AdminTransactionsExceptionsScreen } from './AdminTransactionsExceptionsScreen';

interface AdminOrdersScreenProps {
  onNavigate: (path: string) => void;
  subpage?: 'live' | 'terminals' | 'disputes' | 'transactions';
}

interface PosTerminal {
  id: string;
  serialNumber: string;
  model: string;
  merchantName: string;
  cluster: string;
  carrier: string;
  batteryLevel: number;
  appVersion: string;
  lastPing: string;
  todayVolume: string;
  todayTaps: number;
  status: 'Online' | 'In-Session' | 'Offline' | 'Low-Battery';
}

interface DisputeCase {
  id: string;
  orderRef: string;
  customerName: string;
  customerPhone: string;
  merchantName: string;
  cluster: string;
  amount: string;
  reason: string;
  openedAt: string;
  hoursRemaining: number;
  gateway: string;
  status: 'Awaiting Merchant' | 'Under Admin Review' | 'Chargeback Escalated' | 'Resolved';
  evidenceSummary: string;
}

const INITIAL_TERMINALS: PosTerminal[] = [
  {
    id: 'term_1',
    serialNumber: 'VEM-POS-1049',
    model: 'Sunmi V2s Pro (NFC/4G)',
    merchantName: 'Slot Systems Ikeja',
    cluster: 'Ikeja Commercial Corridor',
    carrier: 'MTN 4G LTE',
    batteryLevel: 92,
    appVersion: 'v4.2.1',
    lastPing: '12s ago',
    todayVolume: '₦1,845,000',
    todayTaps: 48,
    status: 'Online',
  },
  {
    id: 'term_2',
    serialNumber: 'VEM-POS-0842',
    model: 'PAX A920 Smart POS',
    merchantName: 'MegaMart Groceries Lekki',
    cluster: 'Lekki Phase 1 Retail Strip',
    carrier: 'Airtel 4G',
    batteryLevel: 78,
    appVersion: 'v4.2.1',
    lastPing: '34s ago',
    todayVolume: '₦3,420,000',
    todayTaps: 112,
    status: 'In-Session',
  },
  {
    id: 'term_3',
    serialNumber: 'VEM-POS-0711',
    model: 'Sunmi V2s Pro (NFC/4G)',
    merchantName: 'Medplus Pharmacy Palms',
    cluster: 'Victoria Island Hub',
    carrier: 'MTN 4G LTE',
    batteryLevel: 14,
    appVersion: 'v4.2.0',
    lastPing: '1m ago',
    todayVolume: '₦980,500',
    todayTaps: 34,
    status: 'Low-Battery',
  },
  {
    id: 'term_4',
    serialNumber: 'VEM-POS-0418',
    model: 'Nexgo N5 Android POS',
    merchantName: 'The Place Restaurant',
    cluster: 'Ikeja Commercial Corridor',
    carrier: 'WiFi / Fiber',
    batteryLevel: 85,
    appVersion: 'v4.2.1',
    lastPing: '2s ago',
    todayVolume: '₦2,180,000',
    todayTaps: 89,
    status: 'Online',
  },
  {
    id: 'term_5',
    serialNumber: 'VEM-POS-0399',
    model: 'PAX A920 Smart POS',
    merchantName: 'Ruff \'n\' Tumble Kids',
    cluster: 'Victoria Island Hub',
    carrier: 'Glo 4G',
    batteryLevel: 0,
    appVersion: 'v4.1.8',
    lastPing: '4 hours ago',
    todayVolume: '₦0',
    todayTaps: 0,
    status: 'Offline',
  },
  {
    id: 'term_6',
    serialNumber: 'VEM-POS-1102',
    model: 'Sunmi V2s Pro (NFC/4G)',
    merchantName: 'Farmcity Lounge & Grill',
    cluster: 'Lekki Phase 1 Retail Strip',
    carrier: 'MTN 4G LTE',
    batteryLevel: 64,
    appVersion: 'v4.2.1',
    lastPing: '45s ago',
    todayVolume: '₦1,450,000',
    todayTaps: 52,
    status: 'Online',
  },
];

const INITIAL_DISPUTES: DisputeCase[] = [
  {
    id: 'DSP-8821',
    orderRef: 'TXN-90214-PAY',
    customerName: 'Chinedu Okafor',
    customerPhone: '+234 803 441 2901',
    merchantName: 'Slot Systems Ikeja',
    cluster: 'Ikeja Commercial Corridor',
    amount: '₦185,000',
    reason: 'Customer charged twice on NFC contactless tap; only 1 device item issued.',
    openedAt: 'Today, 11:20 AM',
    hoursRemaining: 14,
    gateway: 'Paystack Direct API',
    status: 'Under Admin Review',
    evidenceSummary: 'Customer uploaded bank debit alert showing matching timestamp & identical reference.',
  },
  {
    id: 'DSP-8820',
    orderRef: 'TXN-89912-FLW',
    customerName: 'Amara Nwosu',
    customerPhone: '+234 812 770 1932',
    merchantName: 'MegaMart Groceries Lekki',
    cluster: 'Lekki Phase 1 Retail Strip',
    amount: '₦42,650',
    reason: 'Voucher discounted cart did not apply at physical checkout; full price debited.',
    openedAt: 'Today, 09:45 AM',
    hoursRemaining: 18,
    gateway: 'Flutterwave Card',
    status: 'Awaiting Merchant',
    evidenceSummary: 'VEMTAP voucher #VEM-DISC-42 claimed 10m prior to transaction.',
  },
  {
    id: 'DSP-8818',
    orderRef: 'TXN-89401-MON',
    customerName: 'Tunde Bakare',
    customerPhone: '+234 705 918 2039',
    merchantName: 'Medplus Pharmacy Palms',
    cluster: 'Victoria Island Hub',
    amount: '₦18,200',
    reason: 'Prescription item damaged upon in-store collection; merchant refused immediate refund.',
    openedAt: 'Yesterday, 16:30 PM',
    hoursRemaining: 6,
    gateway: 'Monnify Transfer',
    status: 'Under Admin Review',
    evidenceSummary: 'Photo of broken packaging attached by customer. Merchant claims packaging was intact.',
  },
  {
    id: 'DSP-8815',
    orderRef: 'TXN-88102-ISW',
    customerName: 'Fatima Aliyu',
    customerPhone: '+234 809 334 1120',
    merchantName: 'The Place Restaurant',
    cluster: 'Ikeja Commercial Corridor',
    amount: '₦84,000',
    reason: 'Corporate catering booking cancelled 48h in advance under permitted refund policy.',
    openedAt: 'Yesterday, 12:15 PM',
    hoursRemaining: 2,
    gateway: 'Interswitch / NIBSS',
    status: 'Chargeback Escalated',
    evidenceSummary: 'Bank chargeback pre-arbitration notification received from Zenith Bank.',
  },
  {
    id: 'DSP-8809',
    orderRef: 'TXN-87654-PAY',
    customerName: 'Emeka Umeh',
    customerPhone: '+234 816 550 4912',
    merchantName: 'Ruff \'n\' Tumble Kids',
    cluster: 'Victoria Island Hub',
    amount: '₦90,150',
    reason: 'Incorrect size charged during weekend flash promo; replacement stock unavailable.',
    openedAt: 'Oct 31, 14:00 PM',
    hoursRemaining: 0,
    gateway: 'Paystack Direct API',
    status: 'Resolved',
    evidenceSummary: 'Merchant agreed to return. ₦90,150 released from escrow back to customer wallet.',
  },
];

export function AdminOrdersScreen({ onNavigate, subpage = 'live' }: AdminOrdersScreenProps) {
  const [txns] = useState<PlatformTransaction[]>(RECENT_TRANSACTIONS);
  const [terminals, setTerminals] = useState<PosTerminal[]>(INITIAL_TERMINALS);
  const [disputes, setDisputes] = useState<DisputeCase[]>(INITIAL_DISPUTES);

  // Filters for Live Orders
  const [searchQuery, setSearchQuery] = useState('');
  const [railFilter, setRailFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filters for Terminals
  const [terminalSearch, setTerminalSearch] = useState('');
  const [terminalStatusFilter, setTerminalStatusFilter] = useState('ALL');

  // Modals
  const [selectedTxn, setSelectedTxn] = useState<PlatformTransaction | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<DisputeCase | null>(null);
  const [provisionModalOpen, setProvisionModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New Terminal Form State
  const [newTerminalSerial, setNewTerminalSerial] = useState('');
  const [newTerminalModel, setNewTerminalModel] = useState('Sunmi V2s Pro (NFC/4G)');
  const [newTerminalMerchant, setNewTerminalMerchant] = useState('Slot Systems Ikeja');
  const [newTerminalCluster, setNewTerminalCluster] = useState('Ikeja Commercial Corridor');
  const [newTerminalCarrier, setNewTerminalCarrier] = useState('MTN 4G LTE');

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Filtered Live Transactions
  const filteredTxns = useMemo(() => {
    return txns.filter((t) => {
      const matchesSearch =
        t.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.branchOrTerminal.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRail =
        railFilter === 'ALL' || t.rail.toLowerCase().includes(railFilter.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' || t.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesRail && matchesStatus;
    });
  }, [txns, searchQuery, railFilter, statusFilter]);

  // Filtered Terminals
  const filteredTerminals = useMemo(() => {
    return terminals.filter((term) => {
      const matchesSearch =
        term.serialNumber.toLowerCase().includes(terminalSearch.toLowerCase()) ||
        term.merchantName.toLowerCase().includes(terminalSearch.toLowerCase()) ||
        term.cluster.toLowerCase().includes(terminalSearch.toLowerCase());
      const matchesStatus =
        terminalStatusFilter === 'ALL' || term.status === terminalStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [terminals, terminalSearch, terminalStatusFilter]);

  // Terminal Handlers
  const handlePingTerminal = (serial: string) => {
    triggerNotice(`Ping dispatched to terminal ${serial}. Latency: 22ms. Signal: 98%.`);
  };

  const handleUpdateFirmware = (serial: string) => {
    triggerNotice(`OTA firmware v4.2.1 patch queued for ${serial}. Scheduled during idle state.`);
  };

  const handleProvisionTerminal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerminalSerial.trim()) return;

    const newTerm: PosTerminal = {
      id: `term_${Date.now()}`,
      serialNumber: newTerminalSerial.toUpperCase(),
      model: newTerminalModel,
      merchantName: newTerminalMerchant,
      cluster: newTerminalCluster,
      carrier: newTerminalCarrier,
      batteryLevel: 100,
      appVersion: 'v4.2.1',
      lastPing: 'Just now',
      todayVolume: '₦0',
      todayTaps: 0,
      status: 'Online',
    };

    setTerminals([newTerm, ...terminals]);
    setProvisionModalOpen(false);
    setNewTerminalSerial('');
    triggerNotice(`Terminal ${newTerm.serialNumber} successfully provisioned and linked to ${newTerm.merchantName}.`);
  };

  // Dispute Handlers
  const handleResolveDispute = (caseId: string, resolution: 'REFUND_CUSTOMER' | 'RELEASE_MERCHANT') => {
    setDisputes(
      disputes.map((d) => (d.id === caseId ? { ...d, status: 'Resolved', hoursRemaining: 0 } : d))
    );
    setSelectedDispute(null);
    if (resolution === 'REFUND_CUSTOMER') {
      triggerNotice(`Dispute ${caseId} settled. Escrow funds refunded to customer account.`);
    } else {
      triggerNotice(`Dispute ${caseId} resolved. Funds cleared and released to merchant settlement wallet.`);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] w-full mx-auto">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[12px] flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
            <span className="font-medium">{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-600 hover:text-emerald-800">
            <span className="material-symbols-outlined text-[15px]">close</span>
          </button>
        </div>
      )}

      {/* Top Header & Subpage Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase text-slate-500 tracking-wider font-semibold">
            <span>Orders & Terminal Telemetry</span>
            <span>•</span>
            <span className="text-[#0055c4]">Live Payment Rails</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Orders & POS Settlement Ledger
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Real-time multi-rail transactions, POS terminal hardware fleet telemetry, and escrow dispute arbitration.
          </p>
        </div>

        {/* Subpages Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-[12px] shrink-0 border border-slate-200/80">
          <button
            onClick={() => onNavigate('/admin/orders')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              subpage === 'live'
                ? 'bg-white text-[#0055c4] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            <span>Orders &amp; Bookings</span>
          </button>
          <button
            onClick={() => onNavigate('/admin/orders/transactions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              subpage === 'transactions' || subpage === 'disputes'
                ? 'bg-white text-[#0055c4] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">troubleshoot</span>
            <span>Transactions &amp; Exceptions</span>
            <span className="ml-1 px-1.5 py-0.2 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
              42
            </span>
          </button>
          <button
            onClick={() => onNavigate('/admin/orders/terminals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              subpage === 'terminals'
                ? 'bg-white text-[#0055c4] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            <span>POS Monitoring</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUBPAGE: LIVE ORDERS & LEDGER                                          */}
      {/* ========================================================================= */}
      {subpage === 'live' && (
        <div className="space-y-6">
          {/* KPI Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider">24h Settlement Volume</span>
                <span className="material-symbols-outlined text-[#0055c4] text-[20px]">payments</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">₦142,850,000</div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 font-medium">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                <span>+14.2% vs yesterday</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Settled & Cleared</span>
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">₦138,430,000</div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 font-medium">
                <span>96.9% successful automated sweeps</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Active Escrow Reserve</span>
                <span className="material-symbols-outlined text-amber-500 text-[20px]">lock_clock</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">₦4,420,000</div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-600 font-medium">
                <span>Held pending merchant fulfillment verification</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Disputes / Flagged</span>
                <span className="material-symbols-outlined text-red-500 text-[20px]">report_problem</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">₦380,000</div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-red-600 font-medium">
                <span>5 active chargeback claims</span>
              </div>
            </div>
          </div>

          {/* Transactions Control Strip */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full md:w-auto flex-1">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search by merchant, transaction ID, or terminal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:border-[#0055c4] focus:bg-white"
                />
              </div>

              {/* Payment Rail Filter */}
              <select
                value={railFilter}
                onChange={(e) => setRailFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[12px] text-slate-700 font-medium focus:outline-none focus:border-[#0055c4]"
              >
                <option value="ALL">All Payment Rails</option>
                <option value="Paystack">Paystack Direct</option>
                <option value="Flutterwave">Flutterwave</option>
                <option value="GTBank">GTBank NIBSS</option>
                <option value="Monnify">Monnify Transfer</option>
                <option value="Interswitch">Interswitch</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[12px] text-slate-700 font-medium focus:outline-none focus:border-[#0055c4]"
              >
                <option value="ALL">All Statuses</option>
                <option value="Settled">Settled</option>
                <option value="Escrow Hold">Escrow Hold</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => triggerNotice('Exporting CSV transaction ledger for current filter...')}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[12px] font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => triggerNotice('Live transactions stream refreshed.')}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Refresh stream"
              >
                <span className="material-symbols-outlined text-[18px]">sync</span>
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055c4] text-[18px]">receipt_long</span>
                <h3 className="font-bold text-[13px] text-slate-900">Live Transaction Stream</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-[#0055c4] text-[10px] font-bold rounded-full">
                  {filteredTxns.length} records
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                Stream latency: 18ms • 100% Escrow Integrity
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">TIMESTAMP</th>
                    <th className="py-2.5 px-4">TXN REF</th>
                    <th className="py-2.5 px-4">MERCHANT / CHECKOUT</th>
                    <th className="py-2.5 px-4">PAYMENT RAIL</th>
                    <th className="py-2.5 px-4 text-right">AMOUNT</th>
                    <th className="py-2.5 px-4 text-center">STATUS</th>
                    <th className="py-2.5 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {filteredTxns.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{txn.timestamp}</td>
                      <td className="py-3 px-4 font-mono text-[11px] font-bold text-slate-700">{txn.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{txn.merchantName}</div>
                        <div className="text-[11px] text-slate-400">{txn.branchOrTerminal}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <span className={`w-1.5 h-1.5 rounded-full ${txn.railColor}`}></span>
                          {txn.rail}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">{txn.amount}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            txn.status === 'Settled'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedTxn(txn)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#0055c4] hover:bg-blue-50 rounded transition-colors"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUBPAGE: POS HARDWARE FLEET                                            */}
      {/* ========================================================================= */}
      {subpage === 'terminals' && (
        <div className="space-y-6">
          {/* Hardware Fleet KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Total Deployed Units</span>
                <span className="material-symbols-outlined text-[#0055c4] text-[20px]">devices</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">1,482 Terminals</div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 font-medium">
                <span>Across 18 geographic retail corridors</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Online & In-Session</span>
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">wifi</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">1,408 (95%)</div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active heartbeat telemetry</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Fleet Battery Avg</span>
                <span className="material-symbols-outlined text-blue-500 text-[20px]">battery_charging_full</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">88% Avg Charge</div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-600 font-medium">
                <span>12 units below 15% threshold</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Firmware Compliance</span>
                <span className="material-symbols-outlined text-purple-600 text-[20px]">system_update</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">98.4% on v4.2.1</div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 font-medium">
                <span>24 pending overnight reboot update</span>
              </div>
            </div>
          </div>

          {/* Terminal Search & Action Strip */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search by serial number, merchant, or cluster..."
                  value={terminalSearch}
                  onChange={(e) => setTerminalSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:border-[#0055c4] focus:bg-white"
                />
              </div>

              <select
                value={terminalStatusFilter}
                onChange={(e) => setTerminalStatusFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[12px] text-slate-700 font-medium focus:outline-none focus:border-[#0055c4]"
              >
                <option value="ALL">All Hardware Statuses</option>
                <option value="Online">Online</option>
                <option value="In-Session">In-Session</option>
                <option value="Low-Battery">Low Battery Alert</option>
                <option value="Offline">Offline</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setProvisionModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#0055c4] hover:bg-[#066cf4] text-white rounded-lg text-[12px] font-semibold shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Provision New POS</span>
              </button>
            </div>
          </div>

          {/* Terminals Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055c4] text-[18px]">developer_board</span>
                <h3 className="font-bold text-[13px] text-slate-900">Provisioned POS Terminals Fleet</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-[#0055c4] text-[10px] font-bold rounded-full">
                  {filteredTerminals.length} units
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">SERIAL & MODEL</th>
                    <th className="py-2.5 px-4">MERCHANT ASSIGNED</th>
                    <th className="py-2.5 px-4">NETWORK & BATTERY</th>
                    <th className="py-2.5 px-4">FIRMWARE</th>
                    <th className="py-2.5 px-4 text-right">TODAY'S VOLUME</th>
                    <th className="py-2.5 px-4 text-center">STATUS</th>
                    <th className="py-2.5 px-4 text-right">TELEMETRY ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {filteredTerminals.map((term) => (
                    <tr key={term.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{term.serialNumber}</div>
                        <div className="text-[11px] text-slate-400">{term.model}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{term.merchantName}</div>
                        <div className="text-[11px] text-slate-400">{term.cluster}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-600 font-medium">{term.carrier}</span>
                          <span className="text-slate-300">•</span>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                              term.batteryLevel < 20
                                ? 'text-red-600'
                                : term.batteryLevel < 50
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">battery_std</span>
                            {term.batteryLevel}%
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Ping: {term.lastPing}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {term.appVersion}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-slate-900">{term.todayVolume}</div>
                        <div className="text-[10px] text-slate-400">{term.todayTaps} NFC taps</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            term.status === 'Online'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : term.status === 'In-Session'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : term.status === 'Low-Battery'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {term.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handlePingTerminal(term.serialNumber)}
                            className="p-1 text-slate-500 hover:text-[#0055c4] hover:bg-blue-50 rounded"
                            title="Ping Terminal"
                          >
                            <span className="material-symbols-outlined text-[17px]">network_ping</span>
                          </button>
                          <button
                            onClick={() => handleUpdateFirmware(term.serialNumber)}
                            className="p-1 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                            title="Push OTA Firmware Update"
                          >
                            <span className="material-symbols-outlined text-[17px]">system_update_alt</span>
                          </button>
                          <button
                            onClick={() => triggerNotice(`Terminal ${term.serialNumber} reboot signal broadcasted.`)}
                            className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                            title="Restart Terminal"
                          >
                            <span className="material-symbols-outlined text-[17px]">restart_alt</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUBPAGE: TRANSACTIONS & EXCEPTIONS                                     */}
      {/* ========================================================================= */}
      {(subpage === 'transactions' || subpage === 'disputes') && (
        <AdminTransactionsExceptionsScreen onNavigate={onNavigate} />
      )}

      {/* ========================================================================= */}
      {/* MODAL: TRANSACTION RECEIPT DOSSIER                                        */}
      {/* ========================================================================= */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055c4] text-[22px]">verified</span>
                <div>
                  <h3 className="font-bold text-[15px] text-slate-900">Transaction Receipt Dossier</h3>
                  <span className="font-mono text-[11px] text-slate-400">{selectedTxn.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-2.5 text-[12px]">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Merchant Entity</span>
                <span className="text-slate-900 font-semibold">{selectedTxn.merchantName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Checkout Terminal / Point</span>
                <span className="text-slate-800">{selectedTxn.branchOrTerminal}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Payment Gateway Rail</span>
                <span className="text-slate-800 font-medium">{selectedTxn.rail}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Time Cleared</span>
                <span className="font-mono text-slate-700">{selectedTxn.timestamp}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Platform Escrow Fee (1.5%)</span>
                <span className="text-slate-800 font-medium">₦2,775</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Merchant Net Settlement</span>
                <span className="text-slate-900 font-bold">₦182,225</span>
              </div>
              <div className="flex justify-between py-2 bg-emerald-50/60 px-3 rounded-lg border border-emerald-100">
                <span className="text-emerald-800 font-semibold">Total Amount Charged</span>
                <span className="text-emerald-700 font-bold text-base">{selectedTxn.amount}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  triggerNotice(`Flagged transaction ${selectedTxn.id} for anti-fraud review.`);
                  setSelectedTxn(null);
                }}
                className="px-3 py-2 text-red-600 hover:bg-red-50 text-[11px] font-bold rounded-lg transition-colors"
              >
                Flag for Fraud Review
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    triggerNotice(`Webhook re-dispatch sent for ${selectedTxn.id}.`);
                    setSelectedTxn(null);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors"
                >
                  Resend Webhook
                </button>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="px-4 py-2 bg-[#0055c4] hover:bg-[#066cf4] text-white text-[11px] font-bold rounded-lg shadow-2xs transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PROVISION NEW POS TERMINAL                                         */}
      {/* ========================================================================= */}
      {provisionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055c4] text-[22px]">point_of_sale</span>
                <h3 className="font-bold text-[15px] text-slate-900">Provision POS Terminal</h3>
              </div>
              <button
                onClick={() => setProvisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleProvisionTerminal} className="space-y-3.5 text-[12px]">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Terminal Serial / IMEI Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VEM-POS-2091"
                  value={newTerminalSerial}
                  onChange={(e) => setNewTerminalSerial(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-[#0055c4] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Hardware Model</label>
                <select
                  value={newTerminalModel}
                  onChange={(e) => setNewTerminalModel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0055c4]"
                >
                  <option value="Sunmi V2s Pro (NFC/4G)">Sunmi V2s Pro (NFC / 4G Built-in)</option>
                  <option value="PAX A920 Smart POS">PAX A920 Smart POS</option>
                  <option value="Nexgo N5 Android POS">Nexgo N5 Android POS</option>
                  <option value="Castles S1F2 Enterprise">Castles S1F2 Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Assign to Merchant</label>
                <input
                  type="text"
                  required
                  value={newTerminalMerchant}
                  onChange={(e) => setNewTerminalMerchant(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0055c4]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Geographic Cluster</label>
                <input
                  type="text"
                  required
                  value={newTerminalCluster}
                  onChange={(e) => setNewTerminalCluster(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0055c4]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Primary SIM Carrier</label>
                <select
                  value={newTerminalCarrier}
                  onChange={(e) => setNewTerminalCarrier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0055c4]"
                >
                  <option value="MTN 4G LTE">MTN 4G LTE (Tier-1)</option>
                  <option value="Airtel 4G">Airtel 4G</option>
                  <option value="Glo 4G">Glo 4G</option>
                  <option value="WiFi / Merchant Broadband">WiFi / Merchant Fiber</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProvisionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0055c4] hover:bg-[#066cf4] text-white text-[12px] font-bold rounded-lg shadow-2xs"
                >
                  Deploy Terminal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DISPUTE CASE ARBITRATION                                           */}
      {/* ========================================================================= */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[24px]">gavel</span>
                <div>
                  <h3 className="font-bold text-[15px] text-slate-900">Escrow Dispute Arbitration</h3>
                  <span className="font-mono text-[11px] text-slate-400">{selectedDispute.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDispute(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-[12px]">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Disputed Sum:</span>
                  <span className="text-base font-bold text-slate-900">{selectedDispute.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Ref:</span>
                  <span className="font-mono text-slate-800">{selectedDispute.orderRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway Channel:</span>
                  <span className="text-slate-800 font-medium">{selectedDispute.gateway}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-1">Customer Dispute Claim</h4>
                <p className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg text-slate-700 leading-relaxed">
                  {selectedDispute.reason}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-1">Evidence & Verification Summary</h4>
                <p className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-600 leading-relaxed">
                  {selectedDispute.evidenceSummary}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Opened: {selectedDispute.openedAt}</span>
                <span className="font-semibold text-amber-600">
                  {selectedDispute.hoursRemaining > 0
                    ? `${selectedDispute.hoursRemaining}h remaining before auto-forfeit`
                    : 'Window expired'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2">
              <button
                onClick={() => handleResolveDispute(selectedDispute.id, 'RELEASE_MERCHANT')}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[12px] font-bold rounded-lg transition-colors"
              >
                Release to Merchant
              </button>
              <button
                onClick={() => handleResolveDispute(selectedDispute.id, 'REFUND_CUSTOMER')}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-bold rounded-lg shadow-2xs transition-colors"
              >
                Refund Customer Escrow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
