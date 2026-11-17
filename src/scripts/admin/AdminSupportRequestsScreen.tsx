import { useState, useMemo } from 'react';

interface AdminSupportRequestsScreenProps {
  onNavigate: (path: string) => void;
}

type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';
type TicketStatus = 'Open' | 'In Progress' | 'Escalated' | 'Resolved';
type RequesterType = 'Customer' | 'Business';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  requesterName: string;
  requesterType: RequesterType;
  requesterAvatar: string;
  email: string;
  phone: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  lastReply: string;
  assignedTo: string;
  channel: 'In-App Chat' | 'Email' | 'WhatsApp SLA' | 'Escalation Desk';
  messagesCount: number;
  description: string;
  metadata: {
    referenceId?: string;
    clusterOrAddress?: string;
    deviceOS?: string;
    tier?: string;
  };
  chatThread: {
    sender: string;
    isStaff: boolean;
    timestamp: string;
    text: string;
  }[];
}

const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'supp_101',
    ticketNumber: 'TKT-89021',
    subject: 'NFC tap failure at Ikeja branch POS terminal #3',
    category: 'Hardware & POS Terminal',
    requesterName: 'Slot Electronics Flagship',
    requesterType: 'Business',
    requesterAvatar: 'SE',
    email: 'operations@slot.ng',
    phone: '+234 802 334 1190',
    priority: 'Critical',
    status: 'In Progress',
    createdAt: 'Today, 10:24 WAT',
    lastReply: '12m ago',
    assignedTo: 'Chidi Okonkwo (Support Specialist)',
    channel: 'In-App Chat',
    messagesCount: 5,
    description: 'During peak lunch rush, customer cards are throwing error 0x4B (NFC field timeout) on Terminal #3. Device was restarted twice with no change.',
    metadata: {
      referenceId: 'POS-IKJ-003',
      clusterOrAddress: 'Ikeja Computer Village',
      deviceOS: 'Pax A920 Pro (Firmware v3.8.4)',
      tier: 'Platinum Enterprise',
    },
    chatThread: [
      { sender: 'Slot Store Manager', isStaff: false, timestamp: '10:24', text: 'Hello, our Pax terminal #3 is failing on all contactless card taps. Chip & PIN still works but checkout is bottlenecked.' },
      { sender: 'Chidi Okonkwo', isStaff: true, timestamp: '10:31', text: 'Hi! Received your ticket. I have pulled the terminal telemetry log. It shows an NFC antenna impedance error after OTA v3.8.4.' },
      { sender: 'Chidi Okonkwo', isStaff: true, timestamp: '10:35', text: 'Pushing a firmware rollback patch `v3.8.3b` right now to terminal serial #PX-99214. Please keep it connected to WiFi.' },
      { sender: 'Slot Store Manager', isStaff: false, timestamp: '10:48', text: 'Download completed and rebooting now.' },
    ],
  },
  {
    id: 'supp_102',
    ticketNumber: 'TKT-89018',
    subject: 'Double debit on combo deal checkout at Urban Grill',
    category: 'Billing & Consumer Payment',
    requesterName: 'Adebayo Ogunlesi',
    requesterType: 'Customer',
    requesterAvatar: 'AO',
    email: 'adebayo.og@gmail.com',
    phone: '+234 813 904 2218',
    priority: 'High',
    status: 'Open',
    createdAt: 'Today, 09:15 WAT',
    lastReply: '1h ago',
    assignedTo: 'Amina Bello (Finance Desk)',
    channel: 'In-App Chat',
    messagesCount: 3,
    description: 'I bought the Weekend Ribeye Combo deal (₦18,500). My bank debited twice with refs #PAY-883192 and #PAY-883193. Only one QR ticket was generated.',
    metadata: {
      referenceId: 'ORD-UG-9941',
      clusterOrAddress: 'Victoria Island Dining Zone',
      deviceOS: 'iOS 18.1 / Vemtap v2.4.1',
      tier: 'VIP Customer',
    },
    chatThread: [
      { sender: 'Adebayo Ogunlesi', isStaff: false, timestamp: '09:15', text: 'Good morning, I was charged twice for order #ORD-UG-9941. Please reverse the second transaction.' },
      { sender: 'Vemtap Bot', isStaff: true, timestamp: '09:15', text: 'Automated Notice: Your case has been routed to Support Finance. Ledger reconciliation in progress.' },
    ],
  },
  {
    id: 'supp_103',
    ticketNumber: 'TKT-88982',
    subject: 'Cannot update delivery radius geofence on branch portal',
    category: 'Portal & Geofencing',
    requesterName: 'Mega Seafood Hub',
    requesterType: 'Business',
    requesterAvatar: 'MS',
    email: 'admin@megaseafood.com',
    phone: '+234 809 112 4001',
    priority: 'Medium',
    status: 'Open',
    createdAt: 'Yesterday, 18:40 WAT',
    lastReply: 'Yesterday',
    assignedTo: 'Unassigned',
    channel: 'WhatsApp SLA',
    messagesCount: 2,
    description: 'When saving the geofence boundary slider past 5km, it shows "Tier entitlement violation". But we upgraded to Gold Growth last week.',
    metadata: {
      referenceId: 'TIER-UPG-8821',
      clusterOrAddress: 'Victoria Island Food Strip',
      deviceOS: 'Desktop Chrome 128',
      tier: 'Gold Growth',
    },
    chatThread: [
      { sender: 'Mega Seafood Manager', isStaff: false, timestamp: '18:40', text: 'We upgraded our plan to Gold but our geofence radius still restricts us to 2km instead of 10km.' },
    ],
  },
  {
    id: 'supp_104',
    ticketNumber: 'TKT-88941',
    subject: 'Vemtap gift voucher code not recognised at counter',
    category: 'Vouchers & Deals',
    requesterName: 'Folake Johnson',
    requesterType: 'Customer',
    requesterAvatar: 'FJ',
    email: 'folake.j@yahoo.com',
    phone: '+234 803 551 8892',
    priority: 'Low',
    status: 'Resolved',
    createdAt: '2 Nov 2024, 14:00 WAT',
    lastReply: 'Yesterday',
    assignedTo: 'Chidi Okonkwo (Support Specialist)',
    channel: 'In-App Chat',
    messagesCount: 6,
    description: 'Customer attempted to redeem birthday gift voucher VEM-GIFT-992. Cashier system claimed invalid code. Resolved after re-syncing voucher batch #88.',
    metadata: {
      referenceId: 'VEM-GIFT-992',
      clusterOrAddress: 'Surulere Retail Cluster',
      deviceOS: 'Android 14 / Vemtap v2.4.0',
      tier: 'Standard Member',
    },
    chatThread: [
      { sender: 'Folake Johnson', isStaff: false, timestamp: '14:00', text: 'Voucher code VEM-GIFT-992 rejected at Medplus cashier.' },
      { sender: 'Chidi Okonkwo', isStaff: true, timestamp: '14:15', text: 'Fixed! The promotion cluster mapping had an unindexed record. It is now redeemed and receipt credited.' },
      { sender: 'Folake Johnson', isStaff: false, timestamp: '14:22', text: 'Thank you so much! All sorted.' },
    ],
  },
  {
    id: 'supp_105',
    ticketNumber: 'TKT-88910',
    subject: 'Escrow release dispute on expired deal redemption',
    category: 'Escrow & Legal',
    requesterName: 'Casabella Beauty Hub',
    requesterType: 'Business',
    requesterAvatar: 'CB',
    email: 'billing@casabellahub.com',
    phone: '+234 805 441 3300',
    priority: 'High',
    status: 'Escalated',
    createdAt: '1 Nov 2024, 16:30 WAT',
    lastReply: '3h ago',
    assignedTo: 'Sarah Kalu (Compliance Officer)',
    channel: 'Escalation Desk',
    messagesCount: 4,
    description: 'Merchant requests manual release of ₦450,000 escrow for 18 vouchers that expired before customer check-in under clause 4.2 of terms.',
    metadata: {
      referenceId: 'ESCROW-SWEEP-441',
      clusterOrAddress: 'Ikeja Beauty Mile',
      deviceOS: 'Web Portal',
      tier: 'Silver Growth',
    },
    chatThread: [
      { sender: 'Casabella Legal', isStaff: false, timestamp: '16:30', text: 'Per section 4.2 of Merchant Agreement, unredeemed expired vouchers must sweep to merchant escrow within 7 days.' },
      { sender: 'Sarah Kalu', isStaff: true, timestamp: '17:05', text: 'Reviewing audit ledger for Batch #441. Compliance audit is in progress.' },
    ],
  },
];

export function AdminSupportRequestsScreen({ onNavigate }: AdminSupportRequestsScreenProps) {
  const [tickets, setTickets] = useState(SUPPORT_TICKETS);
  const [selectedId, setSelectedId] = useState<string>(SUPPORT_TICKETS[0].id);
  const [filterType, setFilterType] = useState<'All' | 'Customer' | 'Business'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | TicketStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedTicket = useMemo(() => {
    return tickets.find(t => t.id === selectedId) || tickets[0];
  }, [tickets, selectedId]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchType = filterType === 'All' || t.requesterType === filterType;
      const matchStatus = filterStatus === 'All' || t.status === filterStatus;
      const matchSearch =
        t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchStatus && matchSearch;
    });
  }, [tickets, filterType, filterStatus, searchQuery]);

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    const updated = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'In Progress' as TicketStatus,
          lastReply: 'Just now',
          chatThread: [
            ...t.chatThread,
            {
              sender: 'Antigravity Admin (Support Lead)',
              isStaff: true,
              timestamp: 'Just now',
              text: replyText.trim(),
            },
          ],
        };
      }
      return t;
    });
    setTickets(updated);
    setReplyText('');
    showToast('Reply sent to requester and logged in audit stream.');
  };

  const handleStatusChange = (newStatus: TicketStatus) => {
    const updated = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return { ...t, status: newStatus };
      }
      return t;
    });
    setTickets(updated);
    showToast(`Ticket status updated to ${newStatus}.`);
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

      {/* KPI Bento Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Open Cases</span>
            <span className="material-symbols-outlined text-[#0055c4] text-lg">support_agent</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">42</div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px]">
            <span className="text-amber-600 font-semibold">14 Business</span>
            <span className="text-slate-400">•</span>
            <span className="text-sky-600 font-semibold">28 Customer</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Avg First Response</span>
            <span className="material-symbols-outlined text-emerald-600 text-lg">speed</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">4m 12s</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            <span>SLA Target: &lt; 15 mins (98.4% met)</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Critical Escalations</span>
            <span className="material-symbols-outlined text-rose-600 text-lg">emergency_home</span>
          </div>
          <div className="text-2xl font-bold text-rose-600">3</div>
          <div className="text-[11px] text-slate-500 mt-1">Requires L2/L3 Engineering sign-off</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Resolution CSAT</span>
            <span className="material-symbols-outlined text-amber-500 text-lg">star</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">4.92 <span className="text-sm font-normal text-slate-400">/ 5.0</span></div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Based on 642 verified reviews</div>
        </div>
      </div>

      {/* Main Grid: 7-col Ticket Explorer + 5-col Ticket Live Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Filter & List (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-base">search</span>
              <input
                type="text"
                placeholder="Search ticket #, merchant, customer or keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0055c4] focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['All', 'Business', 'Customer'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    filterType === type
                      ? 'bg-[#0055c4] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Status Sub-filter Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-slate-100 pt-1">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider shrink-0">Status:</span>
            {(['All', 'Open', 'In Progress', 'Escalated', 'Resolved'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Tickets List */}
          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredTickets.map(ticket => {
              const isSelected = ticket.id === selectedTicket.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedId(ticket.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/60 border-[#0055c4] shadow-xs ring-1 ring-[#0055c4]/20'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        ticket.requesterType === 'Business'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {ticket.requesterAvatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{ticket.ticketNumber}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-xs font-semibold text-slate-700">{ticket.requesterName}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            ticket.requesterType === 'Business' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200/60' : 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                          }`}>
                            {ticket.requesterType}
                          </span>
                        </div>
                        <h4 className="text-xs font-medium text-slate-800 mt-1 line-clamp-1">{ticket.subject}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span>{ticket.category}</span>
                          <span>•</span>
                          <span>{ticket.channel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ticket.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-700'
                          : ticket.priority === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {ticket.priority}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        ticket.status === 'Open'
                          ? 'bg-sky-100 text-sky-700'
                          : ticket.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-700'
                          : ticket.status === 'Escalated'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {ticket.status}
                      </span>
                      <span className="text-[10px] text-slate-400">{ticket.lastReply}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTickets.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">inbox</span>
                <p className="text-xs">No support cases matching current filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Case Workspace & Chat Thread (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-5">
          {/* Workspace Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0055c4] font-mono">{selectedTicket.ticketNumber}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedTicket.status === 'Open'
                    ? 'bg-sky-100 text-sky-700'
                    : selectedTicket.status === 'In Progress'
                    ? 'bg-blue-100 text-blue-700'
                    : selectedTicket.status === 'Escalated'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {selectedTicket.status}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedTicket.priority === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {selectedTicket.priority} Priority
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1.5">{selectedTicket.subject}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedTicket.category}</p>
            </div>
            
            {/* Quick Profile Link */}
            {selectedTicket.requesterType === 'Business' ? (
              <button
                onClick={() => onNavigate('/admin/businesses')}
                className="text-[11px] font-semibold text-[#0055c4] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Merchant Profile</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('/admin/customers')}
                className="text-[11px] font-semibold text-[#0055c4] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Customer Profile</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            )}
          </div>

          {/* Requester Dossier Mini-Card */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium text-slate-500">Requester:</span>
              <span className="font-semibold text-slate-900">{selectedTicket.requesterName} ({selectedTicket.requesterType})</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium text-slate-500">Contact:</span>
              <span>{selectedTicket.email} • {selectedTicket.phone}</span>
            </div>
            {selectedTicket.metadata.tier && (
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium text-slate-500">Plan / Standing:</span>
                <span className="font-semibold text-indigo-700">{selectedTicket.metadata.tier}</span>
              </div>
            )}
            {selectedTicket.metadata.referenceId && (
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium text-slate-500">Related Asset / Ref:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">{selectedTicket.metadata.referenceId}</span>
              </div>
            )}
            {selectedTicket.metadata.clusterOrAddress && (
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium text-slate-500">Cluster Location:</span>
                <span className="text-slate-800">{selectedTicket.metadata.clusterOrAddress}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-200/60">
              <span className="font-medium text-slate-500">Assigned Agent:</span>
              <span className="font-semibold text-slate-800">{selectedTicket.assignedTo}</span>
            </div>
          </div>

          {/* Chat Stream */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Case Audit Conversation Stream</h4>
            <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-3 space-y-3 max-h-[300px] overflow-y-auto">
              {selectedTicket.chatThread.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col text-xs p-2.5 rounded-xl ${
                    msg.isStaff
                      ? 'bg-blue-50/80 border border-blue-200/70 ml-4'
                      : 'bg-white border border-slate-200 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-[11px] mb-1">
                    <span className={msg.isStaff ? 'text-[#0055c4]' : 'text-slate-800'}>{msg.sender}</span>
                    <span className="text-slate-400 font-normal">{msg.timestamp}</span>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Reply Box */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Respond to {selectedTicket.requesterName}</span>
              <span className="text-[11px] text-slate-400">Notifies via {selectedTicket.channel}</span>
            </label>
            <textarea
              rows={3}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Type official support resolution or troubleshooting instructions..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#0055c4] focus:bg-white"
            />
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStatusChange('Resolved')}
                  className="px-2.5 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 bg-emerald-50 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                >
                  Mark Resolved
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('Escalated')}
                  className="px-2.5 py-1.5 rounded-lg border border-purple-300 text-purple-700 bg-purple-50 text-xs font-semibold hover:bg-purple-100 transition-colors"
                >
                  Escalate to L3
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="px-4 py-1.5 rounded-xl bg-[#0055c4] text-white text-xs font-bold hover:bg-[#00429b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-2xs"
              >
                <span>Send Reply</span>
                <span className="material-symbols-outlined text-xs">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

