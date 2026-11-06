import { useState, useMemo } from 'react';

interface CampaignAnnouncement {
  id: string;
  code: string;
  title: string;
  channels: string[];
  channelSummary: string;
  targetSegment: string;
  targetCluster: string;
  audienceCount: number;
  deliveryRate: string;
  openRate: string;
  scheduleDate: string;
  expiryNotice: string;
  status: 'ACTIVE' | 'SCHEDULED' | 'DRAFT' | 'COMPLETED';
  author: string;
  pushPreviewHeadline: string;
  pushPreviewBody: string;
  inAppHeadline: string;
  inAppBody: string;
  deepLink: string;
  imageSrc: string;
}

const CAMPAIGNS_DATA: CampaignAnnouncement[] = [
  {
    id: 'cmp_1',
    code: '#CMP-4091',
    title: 'Lagos Tech Week 20% Instant Tap Discount',
    channels: ['chat_bubble', 'notifications_active'],
    channelSummary: 'Modal + Push',
    targetSegment: 'Consumers',
    targetCluster: 'Ikeja & Yaba Clusters',
    audienceCount: 142500,
    deliveryRate: '68.4% Delivered',
    openRate: '38.2% Opened',
    scheduleDate: 'Oct 24 - Nov 04',
    expiryNotice: 'Exp: In 4 days',
    status: 'ACTIVE',
    author: 'Michael O. (Super Admin)',
    pushPreviewHeadline: 'Lagos Tech Week: Get 20% Off Instantly at Ikeja Computer Village!',
    pushPreviewBody: 'Tap your phone at any participating Slot, MegaTech, or MicroByte store in Ikeja to unlock instant discounts up to ₦35,000 on gadgets.',
    inAppHeadline: 'Lagos Tech Week: Get 20% Off Instantly at Ikeja Computer Village!',
    inAppBody: 'Tap your phone at any participating Slot, MegaTech, or MicroByte store in Ikeja to unlock instant discounts up to ₦35,000 on gadgets and accessories.',
    deepLink: 'vem://clusters/ikeja/techweek-2024',
    imageSrc: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'cmp_2',
    code: '#CMP-4088',
    title: 'Scheduled Network Maintenance Notice',
    channels: ['web'],
    channelSummary: 'Merchant Banner',
    targetSegment: 'Verified Merchants',
    targetCluster: 'All Active POS Nodes',
    audienceCount: 3840,
    deliveryRate: '92.1% Read Rate',
    openRate: '3,536 confirmed',
    scheduleDate: 'Oct 26, 2026',
    expiryNotice: 'Closed at 04:00',
    status: 'COMPLETED',
    author: 'David Nwosu (Operations Lead)',
    pushPreviewHeadline: 'System Notice: Maintenance Window at 02:00 AM WAT',
    pushPreviewBody: 'Core payment switches will undergo routine database indexing for 25 minutes. Offline card caching is active.',
    inAppHeadline: 'Core Switch Maintenance Completed',
    inAppBody: 'All merchant POS terminals have reconnected with zero failed transactions reported during the maintenance window.',
    deepLink: 'vem://admin/network-status',
    imageSrc: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'cmp_3',
    code: '#CMP-4085',
    title: 'Lekki Weekend Dining Passport Campaign',
    channels: ['notifications_active'],
    channelSummary: 'Push Notification',
    targetSegment: 'High Spenders',
    targetCluster: 'Lekki Phase 1 Node',
    audienceCount: 48200,
    deliveryRate: '54.0% Delivered',
    openRate: '24.8% CTR',
    scheduleDate: 'Oct 28 - Nov 01',
    expiryNotice: 'Exp: In 2 days',
    status: 'ACTIVE',
    author: 'Sarah Kalu (Growth Lead)',
    pushPreviewHeadline: 'Weekend Dining Passport: Exclusive Perks in Lekki!',
    pushPreviewBody: 'Tap at Urban Grill, Farmcity, or Waffle Stop to earn double cashback points this weekend.',
    inAppHeadline: 'Lekki Phase 1 Weekend Dining Passport',
    inAppBody: 'Enjoy exclusive discounts and instant digital card tap rewards at 18 premium dining spots along Admiralty Way.',
    deepLink: 'vem://clusters/lekki/dining-passport',
    imageSrc: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'cmp_4',
    code: '#CMP-4079',
    title: 'Abuja Wuse 2 Merchant Onboarding Drive',
    channels: ['sms'],
    channelSummary: 'SMS Broadcast',
    targetSegment: 'Unverified Leads',
    targetCluster: 'Abuja Zone 2 & Wuse',
    audienceCount: 450,
    deliveryRate: '98.2% Gate Queued',
    openRate: 'Telco approved',
    scheduleDate: 'Nov 05, 2026',
    expiryNotice: 'Starts 09:00 WAT',
    status: 'SCHEDULED',
    author: 'Amina Bello (Finance Ops)',
    pushPreviewHeadline: 'VEMTAP Abuja: Free Terminal Hardware Onboarding',
    pushPreviewBody: 'Upgrade your store to NFC contactless checkouts. Register your CAC documents online in 3 minutes.',
    inAppHeadline: 'Abuja Retail Expansion Initiative',
    inAppBody: 'Join 400+ leading merchants in Wuse 2 accepting instant smartphone payments with zero setup fees.',
    deepLink: 'vem://business/onboarding',
    imageSrc: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'cmp_5',
    code: '#CMP-4062',
    title: 'Black Friday Pre-Registration Push',
    channels: ['dynamic_feed'],
    channelSummary: 'App Feed Card',
    targetSegment: 'Nationwide Users',
    targetCluster: 'All Active Consumers',
    audienceCount: 340000,
    deliveryRate: '—',
    openRate: 'Targeting Pending',
    scheduleDate: 'Draft Pending',
    expiryNotice: 'Author: S. Bello',
    status: 'DRAFT',
    author: 'Sarah Bello (Marketing Specialist)',
    pushPreviewHeadline: 'Get Early VIP Access to Black Friday Deals',
    pushPreviewBody: 'Reserve your exclusive merchant vouchers ahead of time and tap to save up to 50% in Lagos & Abuja.',
    inAppHeadline: 'Black Friday 2026 VIP Access Pass',
    inAppBody: 'Be the first to claim high-value retail vouchers from top electronic, fashion, and beauty stores across Nigeria.',
    deepLink: 'vem://events/black-friday',
    imageSrc: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop',
  },
];

interface AdminCampaignsAnnouncementsScreenProps {
  onNavigate: (path: string) => void;
}

export function AdminCampaignsAnnouncementsScreen({ onNavigate: _onNavigate }: AdminCampaignsAnnouncementsScreenProps) {
  const [campaigns, setCampaigns] = useState<CampaignAnnouncement[]>(CAMPAIGNS_DATA);
  const [selectedId, setSelectedId] = useState<string>(CAMPAIGNS_DATA[0].id);
  const [statusTab, setStatusTab] = useState<'ALL' | 'ACTIVE' | 'SCHEDULED' | 'DRAFT' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const selectedCampaign = useMemo(() => {
    return campaigns.find((c) => c.id === selectedId) || campaigns[0];
  }, [campaigns, selectedId]);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.targetCluster.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusTab === 'ALL' || c.status === statusTab;
      const matchesChannel = channelFilter === 'ALL' || c.channelSummary.toLowerCase().includes(channelFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [campaigns, searchQuery, statusTab, channelFilter]);

  const handleToggleCampaignStatus = (id: string) => {
    setCampaigns(
      campaigns.map((c) => {
        if (c.id === id) {
          const next = c.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
          triggerNotice(`Campaign ${c.code} status switched to ${next}.`);
          return { ...c, status: next };
        }
        return c;
      })
    );
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

      {/* PAGE HEADER & ACTION DECK */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-[#0055c4] tracking-widest uppercase">
              MODULE 07 • CAMPAIGN OPS
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="text-[11px] text-slate-500 font-mono">TELEMETRY REGION: SSA-WEST-1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Campaigns &amp; Platform Announcements
          </h1>
          <p className="text-[14px] text-slate-500 mt-0.5">
            Broadcast system announcements, consumer push notices, cluster-targeted SMS, and merchant operational bulletins.
          </p>
        </div>

        {/* Right Header Action Suite */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <button
            onClick={() => triggerNotice('Message delivery audit ledger exported.')}
            className="h-9 px-3.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-[12px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">verified_user</span>
            <span>Delivery Audit</span>
          </button>
          <button
            onClick={() => triggerNotice('Template library drawer loaded.')}
            className="h-9 px-3.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-[12px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">library_books</span>
            <span>Template Library</span>
          </button>
          <button
            onClick={() => triggerNotice('Announcement creation wizard initiated.')}
            className="h-9 px-4 rounded-lg bg-[#0055c4] hover:bg-[#066cf4] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Create Announcement</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Broadcasts Sent</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0055c4]">
              <span className="material-symbols-outlined text-[20px]">send</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">148</span>
              <span className="text-[11px] text-slate-500">Campaigns (30d)</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-600">
              <span className="material-symbols-outlined text-[#0055c4] text-[15px]">sensors</span>
              <span className="font-bold text-slate-900">1.84M</span>
              <span>Consumers Reached</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-100">
            <div className="h-full bg-[#0055c4]" style={{ width: '78%' }}></div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Open / Read Rate</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0055c4]">
              <span className="material-symbols-outlined text-[20px]">visibility</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">44.8%</span>
              <span className="text-[11px] text-slate-500">Open Rate</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-600">
              <span className="material-symbols-outlined text-[#0055c4] text-[15px]">ads_click</span>
              <span className="font-bold text-slate-900">18.2%</span>
              <span>Aggregate CTR</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-100">
            <div className="h-full bg-[#0055c4]" style={{ width: '44.8%' }}></div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Live Notices</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0055c4]">
              <span className="material-symbols-outlined text-[20px]">campaign</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">6</span>
              <span className="text-[11px] text-slate-500">Live Campaigns</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-600">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-slate-900">2</span>
              <span>Cluster Flash Alerts Active</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-100">
            <div className="h-full bg-[#0055c4]" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Delivery Reliability</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0055c4]">
              <span className="material-symbols-outlined text-[20px]">signal_cellular_alt</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">99.4%</span>
              <span className="text-[11px] text-slate-500">SMS/Push SLA</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-600">
              <span className="material-symbols-outlined text-slate-400 text-[15px]">unsubscribe</span>
              <span className="font-bold text-slate-900">0.02%</span>
              <span>Opt-Out Rate (Strict)</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-100">
            <div className="h-full bg-[#0055c4]" style={{ width: '99.4%' }}></div>
          </div>
        </div>
      </div>

      {/* MAIN OPERATIONAL WORKSPACE (SPLIT 65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT 65% PANEL (Campaign Table & Filters) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Control Bar: Tabs + Search + Filter Pills */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col gap-3">
            {/* Status Tabs Bar */}
            <div className="flex items-center justify-between pb-1 overflow-x-auto text-[11px]">
              <div className="flex items-center gap-1 font-semibold">
                <button
                  onClick={() => setStatusTab('ALL')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                    statusTab === 'ALL'
                      ? 'bg-[#0055c4] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>All Announcements</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">148</span>
                </button>
                <button
                  onClick={() => setStatusTab('ACTIVE')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                    statusTab === 'ACTIVE'
                      ? 'bg-[#0055c4] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>Live Active</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">6</span>
                </button>
                <button
                  onClick={() => setStatusTab('SCHEDULED')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                    statusTab === 'SCHEDULED'
                      ? 'bg-[#0055c4] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>Scheduled</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">8</span>
                </button>
                <button
                  onClick={() => setStatusTab('DRAFT')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                    statusTab === 'DRAFT'
                      ? 'bg-[#0055c4] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>Drafts</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">12</span>
                </button>
                <button
                  onClick={() => setStatusTab('COMPLETED')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                    statusTab === 'COMPLETED'
                      ? 'bg-[#0055c4] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>Completed</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">122</span>
                </button>
              </div>
              <div className="hidden xl:flex items-center gap-2 text-slate-400 text-[11px]">
                <span className="material-symbols-outlined text-[16px]">sync</span>
                <span>Real-time polling</span>
              </div>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1 border-t border-slate-100">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Search by Title, Channel, Target Audience, or Author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 text-[12px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0055c4]/30"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                <span className="font-bold text-slate-400 uppercase pr-1">Channel:</span>
                <button
                  onClick={() => setChannelFilter('Push')}
                  className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-colors ${
                    channelFilter === 'Push' ? 'bg-blue-100 text-[#0055c4]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Push</span>
                </button>
                <button
                  onClick={() => setChannelFilter('Modal')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-colors ${
                    channelFilter === 'Modal' ? 'bg-blue-100 text-[#0055c4]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  In-App Modal
                </button>
                <button
                  onClick={() => setChannelFilter('SMS')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-colors ${
                    channelFilter === 'SMS' ? 'bg-blue-100 text-[#0055c4]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  SMS Broadcast
                </button>
                <button
                  onClick={() => setChannelFilter('Banner')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-colors ${
                    channelFilter === 'Banner' ? 'bg-blue-100 text-[#0055c4]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Merchant Banner
                </button>
                {channelFilter !== 'ALL' && (
                  <button
                    onClick={() => setChannelFilter('ALL')}
                    className="text-[10px] text-slate-400 hover:text-slate-700 underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Campaign Records Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                    <th className="py-2.5 px-4 font-semibold">Campaign Name &amp; ID</th>
                    <th className="py-2.5 px-3 font-semibold">Channel</th>
                    <th className="py-2.5 px-3 font-semibold">Target Segment</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Audience</th>
                    <th className="py-2.5 px-3 font-semibold">Delivery / Open</th>
                    <th className="py-2.5 px-3 font-semibold">Schedule</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {filteredCampaigns.map((camp) => {
                    const isSelected = camp.id === selectedId;

                    return (
                      <tr
                        key={camp.id}
                        onClick={() => setSelectedId(camp.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/70 hover:bg-blue-50 border-l-4 border-l-[#0055c4]'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3 px-4 font-medium text-slate-900">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 hover:text-[#0055c4] transition-colors text-[13px]">
                              {camp.title}
                            </span>
                            <span className="text-[11px] font-mono text-[#0055c4] font-bold">{camp.code}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <div className="flex items-center gap-1 text-[11px]">
                            {camp.channels.map((icon, idx) => (
                              <span key={idx} className="material-symbols-outlined text-[15px] text-[#0055c4]">
                                {icon}
                              </span>
                            ))}
                            <span className="text-slate-700 font-medium">{camp.channelSummary}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <div className="flex flex-col text-[11px]">
                            <span className="font-semibold text-slate-800">{camp.targetSegment}</span>
                            <span className="text-slate-400">{camp.targetCluster}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          {camp.audienceCount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col text-[11px]">
                            <span className="text-slate-800 font-semibold">{camp.deliveryRate}</span>
                            <span className="text-slate-400">{camp.openRate}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-[11px]">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{camp.scheduleDate}</span>
                            <span className="text-slate-400">{camp.expiryNotice}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              camp.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-900'
                                : camp.status === 'SCHEDULED'
                                ? 'bg-blue-100 text-[#0055c4]'
                                : camp.status === 'DRAFT'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {camp.status === 'ACTIVE' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            )}
                            {camp.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Operational Dispatch Activity */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055c4] text-[20px]">bolt</span>
                <span className="text-[13px] font-bold text-slate-900">Live Dispatch Gateway Nodes</span>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                FCM &amp; APNS Hot Standby
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
              <div className="p-3 rounded-xl bg-slate-50 flex flex-col gap-1 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase">MTN &amp; Airtel SMS Route</span>
                <span className="text-base font-bold text-slate-900">1,820 msg/sec</span>
                <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>Latency: 140ms
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex flex-col gap-1 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase">Firebase Cloud Messaging</span>
                <span className="text-base font-bold text-slate-900">14,200 push/sec</span>
                <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>99.98% Ack Rate
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex flex-col gap-1 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase">Apple Push (APNS Prod)</span>
                <span className="text-base font-bold text-slate-900">9,410 push/sec</span>
                <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>Direct Socket Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 35% PANEL: SELECTED CAMPAIGN INSPECTOR */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs sticky top-16">
            {/* Inspector Top Bar */}
            <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dossier</span>
                  <span className="text-[13px] font-mono text-[#0055c4] font-bold">{selectedCampaign.code}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                  <span className="text-slate-400">Author:</span>
                  <span className="font-semibold text-slate-900">{selectedCampaign.author}</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                {selectedCampaign.status}
              </span>
            </div>

            {/* Section 1: Creative Content Preview */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-[#0055c4]">smartphone</span>
                  Creative Render Preview
                </span>
                <span
                  onClick={() => triggerNotice(`Edit copy modal opened for ${selectedCampaign.code}.`)}
                  className="text-[11px] text-[#0055c4] font-semibold cursor-pointer hover:underline"
                >
                  Edit Copy
                </span>
              </div>

              {/* Smartphone Notification & Modal Mockup */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 space-y-2">
                {/* Simulated Push Card */}
                <div className="bg-white rounded-lg p-2.5 shadow-2xs border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0055c4] flex items-center justify-center text-white text-[9px] font-bold">
                        V
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        VEMTAP INSTANT REWARDS
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">now</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-900 leading-snug">
                    {selectedCampaign.pushPreviewHeadline}
                  </p>
                </div>

                {/* In-App Dialog Preview */}
                <div className="bg-white rounded-lg p-3 shadow-2xs border border-slate-200/80">
                  <div className="relative w-full h-24 rounded-lg overflow-hidden mb-2 bg-slate-900">
                    <img
                      className="w-full h-full object-cover"
                      alt={selectedCampaign.title}
                      src={selectedCampaign.imageSrc}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[9px] font-bold text-white bg-[#0055c4] px-1.5 py-0.5 rounded">
                        CLUSTER EVENT 2026
                      </span>
                    </div>
                  </div>
                  <h4 className="text-[12px] font-bold text-slate-900 mb-1">{selectedCampaign.inAppHeadline}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-3">{selectedCampaign.inAppBody}</p>
                  <button
                    onClick={() => triggerNotice(`Deep link triggered: ${selectedCampaign.deepLink}`)}
                    className="w-full py-1.5 px-3 rounded-lg bg-[#0055c4] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs hover:bg-[#066cf4] transition-colors"
                  >
                    <span>View Participating Stores</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </button>
                  <div className="text-center mt-1.5">
                    <span className="font-mono text-[10px] text-slate-400">Target: {selectedCampaign.deepLink}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Audience Targeting Matrix */}
            <div className="mb-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Audience Targeting Matrix
              </span>
              <div className="bg-slate-50 rounded-xl p-2.5 flex flex-col gap-2 border border-slate-100 text-[11px]">
                <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-100">
                  <span className="material-symbols-outlined text-[#0055c4] text-[18px] mt-0.5">location_on</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">Geographic Clusters</span>
                    <span className="text-slate-500">{selectedCampaign.targetCluster}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-100">
                  <span className="material-symbols-outlined text-[#0055c4] text-[18px] mt-0.5">tune</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">User Behavioral Segment</span>
                    <span className="text-slate-500">Consumers with ≥ 1 POS tap in past 60 days</span>
                    <span className="text-slate-400 font-mono text-[10px]">Filter: Device OS = iOS &amp; Android (v9.0+)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => handleToggleCampaignStatus(selectedCampaign.id)}
                className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-colors ${
                  selectedCampaign.status === 'ACTIVE'
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                }`}
              >
                {selectedCampaign.status === 'ACTIVE' ? 'Pause Broadcast' : 'Resume Broadcast'}
              </button>
              <button
                onClick={() => triggerNotice(`Duplicate campaign cloned for ${selectedCampaign.code}.`)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded-lg transition-colors"
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

