import { useState, useMemo } from 'react';

interface AdminComplaintsDisputesScreenProps {
  onNavigate: (path: string) => void;
}

type DisputeType = 'Merchant vs Customer' | 'Refund Non-Fulfillment' | 'Deal Misrepresentation' | 'Quality & Hygiene Complaint' | 'Escrow Hold';
type DisputeStatus = 'Under Investigation' | 'Awaiting Merchant Evidence' | 'Mediation' | 'Refund Mandated' | 'Dismissed';

interface PlatformDispute {
  id: string;
  disputeRef: string;
  type: DisputeType;
  title: string;
  status: DisputeStatus;
  amountAtRisk: string;
  escrowStatus: 'Locked in Escrow' | 'Partially Released' | 'Pending Sweep';
  filedBy: {
    name: string;
    type: 'Customer' | 'Merchant';
    email: string;
    phone: string;
  };
  respondent: {
    name: string;
    type: 'Customer' | 'Merchant';
    cluster: string;
  };
  orderRef: string;
  filedDate: string;
  deadlineDate: string;
  summary: string;
  customerStatement: string;
  merchantStatement: string;
  evidenceFiles: { name: string; size: string; type: string }[];
  timeline: { title: string; date: string; by: string; note: string }[];
}

const DISPUTES: PlatformDispute[] = [
  {
    id: 'disp_301',
    disputeRef: 'DSP-2024-8841',
    type: 'Deal Misrepresentation',
    title: 'Terms stipulated complimentary beverage not honored at redemption',
    status: 'Under Investigation',
    amountAtRisk: '₦24,500',
    escrowStatus: 'Locked in Escrow',
    filedBy: {
      name: 'Dr. Kelechi Amadi',
      type: 'Customer',
      email: 'k.amadi@lagosmed.ng',
      phone: '+234 802 884 9901',
    },
    respondent: {
      name: 'Mega Seafood Hub (Victoria Island)',
      type: 'Merchant',
      cluster: 'Victoria Island Food Strip',
    },
    orderRef: 'ORD-MSH-99214',
    filedDate: 'Today, 11:20 WAT',
    deadlineDate: 'Tomorrow, 18:00 WAT',
    summary: 'Customer purchased Seafood Platter Deluxe deal with advertised "Complimentary Imported Wine Pitcher". Restaurant refused beverage honoring claiming fine-print blackout on weekends.',
    customerStatement: 'I explicitly checked deal voucher #VEM-8821. Nowhere does it state weekend exemption for beverages. The staff were dismissive and charged an extra ₦14,000 on my table bill.',
    merchantStatement: 'The deal copywriter omitted our weekend cellar clause in error. We offered 10% off their next visit, which the customer declined.',
    evidenceFiles: [
      { name: 'POS_Receipt_Extra_Charge.pdf', size: '240 KB', type: 'PDF' },
      { name: 'Voucher_Screenshot_Fineprint.png', size: '1.2 MB', type: 'PNG' },
    ],
    timeline: [
      { title: 'Dispute Lodged by Customer', date: 'Today, 11:20', by: 'Dr. Kelechi Amadi', note: 'Escrow amount of ₦24,500 automatically frozen in merchant ledger.' },
      { title: 'Notice Served to Merchant', date: 'Today, 11:25', by: 'Automated Dispute Engine', note: 'Merchant notified via SMS and portal with 24h deadline to respond.' },
      { title: 'Merchant Preliminary Defense Received', date: 'Today, 13:40', by: 'Mega Seafood Ops', note: 'Claimed copywriter discrepancy; admits beverage was not served.' },
    ],
  },
  {
    id: 'disp_302',
    disputeRef: 'DSP-2024-8839',
    type: 'Refund Non-Fulfillment',
    title: 'Out-of-stock electronics item charged with no pickup turnaround',
    status: 'Mediation',
    amountAtRisk: '₦185,000',
    escrowStatus: 'Locked in Escrow',
    filedBy: {
      name: 'Ngozi Okafor',
      type: 'Customer',
      email: 'ngozi.o@gmail.com',
      phone: '+234 818 200 1192',
    },
    respondent: {
      name: 'Slot Electronics Flagship',
      type: 'Merchant',
      cluster: 'Ikeja Computer Village',
    },
    orderRef: 'ORD-SLT-44120',
    filedDate: 'Yesterday, 14:15 WAT',
    deadlineDate: '4 Nov 2024',
    summary: 'Order for tablet hardware #SLT-44120 placed via Store Ordering. Customer arrived for click-and-collect; merchant reported stockout but did not initiate merchant void/refund.',
    customerStatement: 'The sales rep informed me they ran out of stock 2 days prior. They told me to request my refund through Vemtap. It has been 48 hours without reversal.',
    merchantStatement: 'Replacement unit has been transshipped from our Victoria Island branch and will arrive today by 16:00. We can fulfill or issue instant refund if customer prefers.',
    evidenceFiles: [
      { name: 'Store_Ordering_Invoice.pdf', size: '180 KB', type: 'PDF' },
    ],
    timeline: [
      { title: 'Dispute Lodged', date: 'Yesterday, 14:15', by: 'Ngozi Okafor', note: 'Requested full refund reversal to GTBank debit card.' },
      { title: 'Mediation Case Assigned', date: 'Yesterday, 16:00', by: 'Sarah Kalu (Compliance)', note: 'Contacted Slot store director for stock confirmation.' },
    ],
  },
  {
    id: 'disp_303',
    disputeRef: 'DSP-2024-8812',
    type: 'Quality & Hygiene Complaint',
    title: 'Critical food temperature and packaging integrity failure',
    status: 'Awaiting Merchant Evidence',
    amountAtRisk: '₦32,000',
    escrowStatus: 'Locked in Escrow',
    filedBy: {
      name: 'Babatunde Fashola',
      type: 'Customer',
      email: 'b.fashola@businesscorp.ng',
      phone: '+234 803 440 9922',
    },
    respondent: {
      name: 'Urban Grill & Bistro 104',
      type: 'Merchant',
      cluster: 'Victoria Island Dining Zone',
    },
    orderRef: 'ORD-UG-7741',
    filedDate: '1 Nov 2024',
    deadlineDate: 'Today, 23:59 WAT',
    summary: 'Corporate catering delivery arrived 2.5 hours late with broken thermal seal. Customer reported spoilage.',
    customerStatement: 'The food was lukewarm and unconsumable for our board meeting. We had to order alternative catering urgently.',
    merchantStatement: 'Courier was delayed by downpour flooding on Ozumba Mbadiwe. Thermal bag insulation was intact when dispatched from kitchen.',
    evidenceFiles: [
      { name: 'Food_Photo_Seal_Broken.jpg', size: '3.4 MB', type: 'JPG' },
      { name: 'Courier_Trip_Log.pdf', size: '512 KB', type: 'PDF' },
    ],
    timeline: [
      { title: 'Health & Quality Complaint Filed', date: '1 Nov, 17:30', by: 'Babatunde Fashola', note: 'Photos submitted showing broken tamper stickers.' },
      { title: 'Evidence Request Issued', date: '2 Nov, 09:00', by: 'Compliance Desk', note: 'Requested kitchen dispatch timestamps.' },
    ],
  },
  {
    id: 'disp_304',
    disputeRef: 'DSP-2024-8790',
    type: 'Escrow Hold',
    title: 'Disputed delivery completion on bulk spa retreat vouchers',
    status: 'Refund Mandated',
    amountAtRisk: '₦450,000',
    escrowStatus: 'Partially Released',
    filedBy: {
      name: 'Zenith Bank Staff Welfare Club',
      type: 'Customer',
      email: 'welfare@zenithbank.com',
      phone: '+234 802 119 4433',
    },
    respondent: {
      name: 'Glow & Serenity Spa 219',
      type: 'Merchant',
      cluster: 'Ikoyi Wellness District',
    },
    orderRef: 'ORD-GLW-1094',
    filedDate: '28 Oct 2024',
    deadlineDate: 'Resolved',
    summary: 'Corporate client purchased 30 executive massage sessions. Spa closed unexpectedly for renovation during scheduled wellness week.',
    customerStatement: 'Staff arrived to locked doors. No prior notice was provided.',
    merchantStatement: 'Emergency plumbing repairs were mandated by building management. Offered reschedule or full credit.',
    evidenceFiles: [
      { name: 'Corporate_Contract_Copy.pdf', size: '1.1 MB', type: 'PDF' },
      { name: 'Notice_Of_Closure.jpg', size: '890 KB', type: 'JPG' },
    ],
    timeline: [
      { title: 'Case Filed', date: '28 Oct, 10:00', by: 'Welfare Secretary', note: 'Immediate clawback requested.' },
      { title: 'Investigation Complete', date: '30 Oct, 16:00', by: 'Compliance Board', note: 'Breach of confirmed booking window verified.' },
      { title: 'Mandated Full Reversal', date: '31 Oct, 11:00', by: 'Antigravity Super Admin', note: '₦450,000 reversed from merchant escrow directly to corporate account.' },
    ],
  },
];

export function AdminComplaintsDisputesScreen({ onNavigate }: AdminComplaintsDisputesScreenProps) {
  const [disputes, setDisputes] = useState(DISPUTES);
  const [selectedId, setSelectedId] = useState<string>(DISPUTES[0].id);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedDispute = useMemo(() => {
    return disputes.find(d => d.id === selectedId) || disputes[0];
  }, [disputes, selectedId]);

  const filteredDisputes = useMemo(() => {
    return disputes.filter(d => {
      const matchStatus = filterStatus === 'All' || d.status === filterStatus;
      const matchSearch =
        d.disputeRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.filedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.respondent.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [disputes, filterStatus, searchQuery]);

  const handleMandateRefund = () => {
    const updated = disputes.map(d => {
      if (d.id === selectedDispute.id) {
        return {
          ...d,
          status: 'Refund Mandated' as DisputeStatus,
          timeline: [
            ...d.timeline,
            {
              title: 'Refund Mandate Executed by Admin',
              date: 'Just now',
              by: 'Super Admin Ledger',
              note: `Admin authorized immediate release of ${d.amountAtRisk} from locked escrow to customer. Note: ${resolutionNote || 'Compliance finding in favor of complainant.'}`,
            },
          ],
        };
      }
      return d;
    });
    setDisputes(updated);
    setResolutionNote('');
    showToast(`Mandated full refund of ${selectedDispute.amountAtRisk}. Escrow reversed.`);
  };

  const handleDismissDispute = () => {
    const updated = disputes.map(d => {
      if (d.id === selectedDispute.id) {
        return {
          ...d,
          status: 'Dismissed' as DisputeStatus,
          escrowStatus: 'Pending Sweep' as const,
          timeline: [
            ...d.timeline,
            {
              title: 'Dispute Dismissed After Examination',
              date: 'Just now',
              by: 'Compliance Review',
              note: `Evidence insufficient to establish merchant default. Escrow unfrozen. Note: ${resolutionNote || 'Dismissed per terms of service.'}`,
            },
          ],
        };
      }
      return d;
    });
    setDisputes(updated);
    setResolutionNote('');
    showToast(`Dispute dismissed. Escrow unfrozen for merchant sweep.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-sm">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Disputes</span>
            <span className="material-symbols-outlined text-amber-600 text-lg">gavel</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">8</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">4 awaiting merchant response</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Escrow At Risk</span>
            <span className="material-symbols-outlined text-rose-600 text-lg">lock</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">₦691,500</div>
          <div className="text-[11px] text-slate-500 mt-1">Held securely in quarantine ledger</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Mediation Settle Rate</span>
            <span className="material-symbols-outlined text-emerald-600 text-lg">handshake</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">92.4%</div>
          <div className="text-[11px] text-slate-500 mt-1">Settled before formal chargeback</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Dispute Frequency</span>
            <span className="material-symbols-outlined text-sky-600 text-lg">analytics</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">0.08%</div>
          <div className="text-[11px] text-slate-500 mt-1">Of all platform settlements MTD</div>
        </div>
      </div>

      {/* Main Grid: 6 cols List + 6 cols Mediation Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-4">
          {/* Search & Tabs */}
          <div className="space-y-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-base">search</span>
              <input
                type="text"
                placeholder="Search dispute ref, party name, or order #..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0055c4] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {(['All', 'Under Investigation', 'Awaiting Merchant Evidence', 'Mediation', 'Refund Mandated', 'Dismissed'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                    filterStatus === status
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Disputes List */}
          <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {filteredDisputes.map(dispute => {
              const isSelected = dispute.id === selectedDispute.id;
              return (
                <div
                  key={dispute.id}
                  onClick={() => setSelectedId(dispute.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/50 border-amber-500 shadow-xs ring-1 ring-amber-500/20'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-amber-700 font-mono">{dispute.disputeRef}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-900">{dispute.type}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{dispute.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Complainant: <span className="font-medium text-slate-700">{dispute.filedBy.name}</span> vs <span className="font-medium text-slate-700">{dispute.respondent.name}</span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs font-bold text-slate-900 font-mono">{dispute.amountAtRisk}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        dispute.status === 'Refund Mandated'
                          ? 'bg-rose-100 text-rose-700'
                          : dispute.status === 'Awaiting Merchant Evidence'
                          ? 'bg-amber-100 text-amber-700'
                          : dispute.status === 'Mediation'
                          ? 'bg-purple-100 text-purple-700'
                          : dispute.status === 'Dismissed'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {dispute.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
                    <span>Order: {dispute.orderRef}</span>
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <span className="material-symbols-outlined text-xs text-amber-600">lock</span>
                      {dispute.escrowStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Case Dossier & Arbitration Terminal (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-5">
          {/* Dossier Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-amber-700 font-mono">{selectedDispute.disputeRef}</span>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-700">{selectedDispute.orderRef}</span>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {selectedDispute.amountAtRisk} Held
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-2">{selectedDispute.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedDispute.summary}</p>
            </div>

            <button
              onClick={() => onNavigate('/admin/businesses')}
              className="text-[11px] font-semibold text-[#0055c4] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Inspect Merchant</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>

          {/* Statements Side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Complainant Statement */}
            <div className="bg-sky-50/70 border border-sky-200/70 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-900">Complainant Claim</span>
                <span className="text-[10px] bg-sky-200/60 text-sky-800 px-1.5 py-0.2 rounded font-semibold">{selectedDispute.filedBy.type}</span>
              </div>
              <div className="text-[11px] font-semibold text-sky-800">{selectedDispute.filedBy.name}</div>
              <p className="text-slate-700 text-[11px] leading-relaxed italic">"{selectedDispute.customerStatement}"</p>
            </div>

            {/* Merchant Defense */}
            <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900">Respondent Defense</span>
                <span className="text-[10px] bg-amber-200/60 text-amber-800 px-1.5 py-0.2 rounded font-semibold">{selectedDispute.respondent.type}</span>
              </div>
              <div className="text-[11px] font-semibold text-amber-800">{selectedDispute.respondent.name}</div>
              <p className="text-slate-700 text-[11px] leading-relaxed italic">"{selectedDispute.merchantStatement}"</p>
            </div>
          </div>

          {/* Attached Evidence Files */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Submitted Evidence Artifacts</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedDispute.evidenceFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="material-symbols-outlined text-slate-500 text-base">attach_file</span>
                    <span className="font-medium text-slate-800 truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-2">{file.size}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Arbitration History</h4>
            <div className="space-y-2 text-xs">
              {selectedDispute.timeline.map((step, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50/80 border-l-2 border-[#0055c4] rounded-r-xl">
                  <div className="flex justify-between font-semibold text-[11px]">
                    <span className="text-slate-900">{step.title}</span>
                    <span className="text-slate-400">{step.date}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">By {step.by}</div>
                  <p className="text-[11px] text-slate-700 mt-1">{step.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Adjudication Ruling Controls */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Adjudicate Dispute & Escrow Mandate</h4>
            <textarea
              rows={2}
              value={resolutionNote}
              onChange={e => setResolutionNote(e.target.value)}
              placeholder="State formal findings, contractual clauses cited, and settlement terms..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#0055c4] focus:bg-white"
            />
            
            <div className="flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleDismissDispute}
                className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Dismiss Dispute & Release Escrow
              </button>
              <button
                type="button"
                onClick={handleMandateRefund}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-xs">undo</span>
                <span>Mandate Full Refund ({selectedDispute.amountAtRisk})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

