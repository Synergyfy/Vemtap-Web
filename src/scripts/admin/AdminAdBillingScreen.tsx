import { useState } from 'react';

interface AdminAdBillingScreenProps {
  onNavigate: (path: string) => void;
}

interface Advertiser {
  id: string;
  accountId: string;
  name: string;
  tier: 'Platinum' | 'Gold' | 'Silver';
  billingModel: 'Prepaid Escrow' | 'Post-Pay Net-30';
  status: 'GOOD STANDING' | 'LOW ESCROW' | 'DEPLETED';
  escrowBalance: number;
  escrowCap: number;
  totalSpend: number;
  primaryCluster: string;
  autoReloadTrigger: string;
  paymentMandate: string;
  activeCampaign: {
    name: string;
    status: 'RUNNING' | 'PAUSED';
    budget: number;
    spent: number;
    impressions: number;
    ctr: string;
    cpm: string;
    cpc: string;
  };
  escrowHistory: { date: string; type: string; amount: string; sign: '+' | '-' }[];
}

const ADVERTISERS: Advertiser[] = [
  {
    id: 'adv-1',
    accountId: '#ADV-9921',
    name: 'Slot Electronics',
    tier: 'Platinum',
    billingModel: 'Prepaid Escrow',
    status: 'GOOD STANDING',
    escrowBalance: 8_400_000,
    escrowCap: 10_000_000,
    totalSpend: 4_500_000,
    primaryCluster: 'Ikeja Computer Village',
    autoReloadTrigger: '₦2,000,000 Threshold',
    paymentMandate: 'GTBank NIBSS Direct Debit',
    activeCampaign: {
      name: 'Smartphone Fest 2025',
      status: 'RUNNING',
      budget: 4_500_000,
      spent: 3_120_000,
      impressions: 34910,
      ctr: '3.82%',
      cpm: '₦89',
      cpc: '₦2,330',
    },
    escrowHistory: [
      { date: '01 Nov 2024', type: 'Auto Top-up', amount: '₦3,000,000', sign: '+' },
      { date: '28 Oct 2024', type: 'Ad Debit', amount: '₦1,200,000', sign: '-' },
      { date: '20 Oct 2024', type: 'Manual Top-up', amount: '₦5,000,000', sign: '+' },
    ],
  },
  {
    id: 'adv-2',
    accountId: '#ADV-8812',
    name: 'Mega Seafood Hub',
    tier: 'Gold',
    billingModel: 'Prepaid Escrow',
    status: 'GOOD STANDING',
    escrowBalance: 5_200_000,
    escrowCap: 8_000_000,
    totalSpend: 2_800_000,
    primaryCluster: 'Victoria Island Food Strip',
    autoReloadTrigger: '₦1,500,000 Threshold',
    paymentMandate: 'Paystack Card Mandate',
    activeCampaign: {
      name: 'Fresh Catch Promo',
      status: 'RUNNING',
      budget: 2_000_000,
      spent: 1_100_000,
      impressions: 18240,
      ctr: '2.14%',
      cpm: '₦60',
      cpc: '₦2,800',
    },
    escrowHistory: [
      { date: '30 Oct 2024', type: 'Ad Debit', amount: '₦800,000', sign: '-' },
      { date: '22 Oct 2024', type: 'Manual Top-up', amount: '₦3,000,000', sign: '+' },
    ],
  },
  {
    id: 'adv-3',
    accountId: '#ADV-7703',
    name: 'Medplus Pharmacy Network',
    tier: 'Platinum',
    billingModel: 'Prepaid Escrow',
    status: 'LOW ESCROW',
    escrowBalance: 640_000,
    escrowCap: 5_000_000,
    totalSpend: 3_900_000,
    primaryCluster: 'Surulere Health Corridor',
    autoReloadTrigger: '₦1,000,000 Threshold',
    paymentMandate: 'Access Bank Mandate',
    activeCampaign: {
      name: 'Health Week Campaign',
      status: 'RUNNING',
      budget: 3_000_000,
      spent: 2_850_000,
      impressions: 49100,
      ctr: '4.20%',
      cpm: '₦58',
      cpc: '₦1,380',
    },
    escrowHistory: [
      { date: '02 Nov 2024', type: 'Ad Debit', amount: '₦450,000', sign: '-' },
      { date: '01 Nov 2024', type: 'Ad Debit', amount: '₦380,000', sign: '-' },
    ],
  },
  {
    id: 'adv-4',
    accountId: '#ADV-6614',
    name: 'Chicken Republic QSR',
    tier: 'Gold',
    billingModel: 'Prepaid Escrow',
    status: 'LOW ESCROW',
    escrowBalance: 320_000,
    escrowCap: 4_000_000,
    totalSpend: 2_100_000,
    primaryCluster: 'Lekki QSR District',
    autoReloadTrigger: '₦800,000 Threshold',
    paymentMandate: 'Zenith Bank Direct Debit',
    activeCampaign: {
      name: 'Combo Deal Push',
      status: 'RUNNING',
      budget: 1_500_000,
      spent: 1_380_000,
      impressions: 21800,
      ctr: '2.90%',
      cpm: '₦63',
      cpc: '₦2,170',
    },
    escrowHistory: [
      { date: '02 Nov 2024', type: 'Ad Debit', amount: '₦120,000', sign: '-' },
      { date: '01 Nov 2024', type: 'Ad Debit', amount: '₦95,000', sign: '-' },
    ],
  },
  {
    id: 'adv-5',
    accountId: '#ADV-5501',
    name: 'Casabella Beauty Hub',
    tier: 'Silver',
    billingModel: 'Prepaid Escrow',
    status: 'DEPLETED',
    escrowBalance: 0,
    escrowCap: 2_000_000,
    totalSpend: 1_800_000,
    primaryCluster: 'Ikeja Beauty Mile',
    autoReloadTrigger: '₦500,000 Threshold',
    paymentMandate: 'Access Bank (****3301)',
    activeCampaign: {
      name: 'Glam Season Deals',
      status: 'PAUSED',
      budget: 1_500_000,
      spent: 1_500_000,
      impressions: 29400,
      ctr: '1.88%',
      cpm: '₦51',
      cpc: '₦2,720',
    },
    escrowHistory: [
      { date: '01 Nov 2024', type: 'Escrow Depleted', amount: '₦0', sign: '-' },
    ],
  },
];

function fmtNGN(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toLocaleString()}`;
}

function statusBadge(status: Advertiser['status']) {
  if (status === 'GOOD STANDING') return 'bg-green-100 text-green-700';
  if (status === 'LOW ESCROW') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-600';
}

function tierBadge(tier: Advertiser['tier']) {
  if (tier === 'Platinum') return 'bg-amber-100 text-amber-700';
  if (tier === 'Gold') return 'bg-yellow-100 text-yellow-700';
  return 'bg-slate-100 text-slate-600';
}

export function AdminAdBillingScreen({ onNavigate }: AdminAdBillingScreenProps) {
  const [selectedId, setSelectedId] = useState(ADVERTISERS[0].id);
  const [activeTab, setActiveTab] = useState('all');
  const [toast, setToast] = useState('');

  const selected = ADVERTISERS.find(a => a.id === selectedId) ?? ADVERTISERS[0];

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  const tabs = [
    { id: 'all', label: 'All Advertisers', count: 48 },
    { id: 'prepaid', label: 'Prepaid Escrow', count: 38 },
    { id: 'postpay', label: 'Post-Pay Net-30', count: 10 },
    { id: 'low', label: 'Low Balance', count: 6 },
    { id: 'paused', label: 'Billing Paused', count: 2 },
  ];

  const escrowPct = Math.min(100, Math.round((selected.escrowBalance / selected.escrowCap) * 100));
  const campaignPct = Math.min(100, Math.round((selected.activeCampaign.spent / selected.activeCampaign.budget) * 100));

  return (
    <div className="space-y-6 max-w-[1600px] w-full mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-on-surface text-inverse-on-surface text-sm px-4 py-2.5 rounded-xl shadow-lg animate-pulse">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-base">payments</span>
            <span className="text-[10px] font-semibold tracking-widest text-primary uppercase">Financial Operations // Ad Billed Ledger</span>
            <span className="bg-surface-container text-on-surface-variant text-[10px] font-mono font-medium px-2 py-0.5 rounded-full">
              SYS_SYNC_UTC: 11:42:09
            </span>
          </div>
          <h1 className="text-headline-xl font-bold text-on-surface">Ad Payments, Prepaid Escrows &amp; Advertiser Billing</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Manage advertiser escrow accounts, prepaid balances, auto-debit mandates, and billing lifecycle operations.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => showToast('Ledger exported to CSV')}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Export Ledger
          </button>
          <button
            onClick={() => showToast('Batch invoices generated')}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-base">receipt_long</span>
            Batch Invoices
          </button>
          <button
            onClick={() => showToast('Advertiser credit form opened')}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add Advertiser Credit
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Total Ad Spend</p>
          <p className="text-3xl font-bold text-on-surface">₦38.45M</p>
          <p className="text-xs text-green-600 font-semibold mt-1">+14.2% MoM</p>
          <p className="text-xs text-on-surface-variant mt-0.5">48 active advertisers</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Prepaid Escrow Locked</p>
          <p className="text-3xl font-bold text-on-surface">₦24.80M</p>
          <span className="inline-block mt-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Secure</span>
          <p className="text-xs text-on-surface-variant mt-1">38 prepaid accounts</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Unbilled Accruals</p>
          <p className="text-3xl font-bold text-on-surface">₦4.28M</p>
          <p className="text-xs text-on-surface-variant mt-1">Batch tonight</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Billing Health</p>
          <p className="text-3xl font-bold text-error">6</p>
          <span className="inline-block mt-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Low Escrow</span>
          <p className="text-xs text-on-surface-variant mt-1">2 accounts paused</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Table (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Filter Strip */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-surface-container border border-outline-variant rounded-xl px-3 py-2 flex-1 min-w-[180px]">
              <span className="material-symbols-outlined text-base text-on-surface-variant">search</span>
              <input className="bg-transparent text-sm outline-none flex-1 text-on-surface placeholder:text-on-surface-variant" placeholder="Search advertisers..." />
            </div>
            <select className="px-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface outline-none">
              <option>All Tiers</option>
              <option>Platinum</option>
              <option>Gold</option>
              <option>Silver</option>
            </select>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 bg-surface-container p-1 rounded-xl overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === t.id ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                {t.label}
                <span className="ml-1.5 bg-surface-container text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded-full">{t.count}</span>
              </button>
            ))}
          </div>

          {/* Ledger Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-low">
              <h3 className="text-xs font-bold text-on-surface">Merchant Advertising Escrow Ledger</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/50 text-[11px] text-on-surface-variant">
                    <th className="text-left px-4 py-2.5 font-semibold">Merchant</th>
                    <th className="text-left px-3 py-2.5 font-semibold">Tier</th>
                    <th className="text-left px-3 py-2.5 font-semibold">Status</th>
                    <th className="text-right px-3 py-2.5 font-semibold">Escrow Balance</th>
                    <th className="text-left px-3 py-2.5 font-semibold">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {ADVERTISERS.map(adv => (
                    <tr
                      key={adv.id}
                      onClick={() => setSelectedId(adv.id)}
                      className={`border-b border-outline-variant/30 cursor-pointer transition-colors ${selectedId === adv.id ? 'bg-secondary-container/20' : 'hover:bg-surface-container'}`}
                    >
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-on-surface">{adv.name}</p>
                        <p className="text-[11px] text-on-surface-variant">{adv.accountId}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tierBadge(adv.tier)}`}>{adv.tier}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(adv.status)}`}>{adv.status}</span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <p className="text-xs font-semibold text-on-surface">{fmtNGN(adv.escrowBalance)}</p>
                        <p className="text-[11px] text-on-surface-variant">of {fmtNGN(adv.escrowCap)}</p>
                      </td>
                      <td className="px-3 py-3 w-24">
                        <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${adv.status === 'GOOD STANDING' ? 'bg-green-500' : adv.status === 'LOW ESCROW' ? 'bg-amber-500' : 'bg-error'}`}
                            style={{ width: `${Math.min(100, (adv.escrowBalance / adv.escrowCap) * 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Auto-Debit Policy Banner */}
          <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
            <span className="material-symbols-outlined text-primary text-base mt-0.5">schedule_send</span>
            <div>
              <p className="text-xs font-semibold text-primary">Auto-Debit Policy Active</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Escrow top-ups run nightly at 01:00 WAT via NIBSS Direct Debit. Accounts below threshold are flagged 24h before automatic reload. Failed debits trigger dunning notices on T+1, T+3 and T+7.
              </p>
            </div>
          </div>
        </div>

        {/* Right Dossier (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden flex flex-col">
          {/* Dossier Header */}
          <div className="px-5 py-4 border-b border-outline-variant">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(selected.status)}`}>
                  PREPAID ESCROW {selected.status}
                </span>
                <p className="text-base font-bold text-on-surface mt-2">{selected.name}</p>
                <p className="text-xs text-on-surface-variant">{selected.accountId}</p>
              </div>
              <button
                onClick={() => onNavigate('/admin/businesses')}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline flex-shrink-0"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                Open Merchant Profile
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Details Grid */}
            <div className="px-5 py-4 border-b border-outline-variant">
              <h4 className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Account Details</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Primary Cluster', value: selected.primaryCluster },
                  { label: 'Billing Model', value: selected.billingModel },
                  { label: 'Auto-Reload Trigger', value: selected.autoReloadTrigger },
                  { label: 'Payment Mandate', value: selected.paymentMandate },
                ].map(d => (
                  <div key={d.label}>
                    <p className="text-[11px] text-on-surface-variant">{d.label}</p>
                    <p className="text-xs font-semibold text-on-surface mt-0.5">{d.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Campaign Spotlight */}
            <div className="px-5 py-4 border-b border-outline-variant">
              <h4 className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Active Campaign</h4>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm font-bold text-on-surface">{selected.activeCampaign.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selected.activeCampaign.status === 'RUNNING' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {selected.activeCampaign.status}
                  </span>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">Budget Used</span>
                  <span className="font-semibold text-on-surface">{campaignPct}% — {fmtNGN(selected.activeCampaign.spent)}/{fmtNGN(selected.activeCampaign.budget)}</span>
                </div>
                <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${campaignPct}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                {[
                  { label: 'Impressions', value: selected.activeCampaign.impressions.toLocaleString() },
                  { label: 'CTR', value: selected.activeCampaign.ctr },
                  { label: 'CPM', value: selected.activeCampaign.cpm },
                ].map(m => (
                  <div key={m.label} className="bg-surface-container rounded-lg p-2">
                    <p className="text-xs font-bold text-on-surface">{m.value}</p>
                    <p className="text-[11px] text-on-surface-variant">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Escrow Ledger Feed */}
            <div className="px-5 py-4 border-b border-outline-variant">
              <h4 className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Escrow Ledger</h4>
              <div className="space-y-2">
                {selected.escrowHistory.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-on-surface">{h.type}</p>
                      <p className="text-on-surface-variant text-[11px]">{h.date}</p>
                    </div>
                    <span className={`font-semibold ${h.sign === '+' ? 'text-green-600' : 'text-error'}`}>{h.sign}{h.amount}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 bg-on-surface rounded-xl p-3 flex items-center justify-between">
                <p className="text-xs text-inverse-on-surface font-semibold">Net Escrow Balance</p>
                <p className="text-sm font-bold text-white">{fmtNGN(selected.escrowBalance)}</p>
              </div>
            </div>

            {/* Escrow Level */}
            <div className="px-5 py-4 border-b border-outline-variant">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-on-surface-variant">Escrow Level</span>
                <span className="font-semibold text-on-surface">{escrowPct}% of cap ({fmtNGN(selected.escrowCap)})</span>
              </div>
              <div className="h-3 bg-surface-container rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${selected.status === 'GOOD STANDING' ? 'bg-green-500' : selected.status === 'LOW ESCROW' ? 'bg-amber-500' : 'bg-error'}`}
                  style={{ width: `${escrowPct}%` }}
                />
              </div>
            </div>

            {/* CTAs */}
            <div className="px-5 py-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => showToast(`Processing top-up for ${selected.name}...`)}
                className="py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add_card</span>
                Process Top-up
              </button>
              <button
                onClick={() => showToast(`Adjusting spend cap for ${selected.name}...`)}
                className="py-2 border border-outline-variant text-on-surface rounded-xl text-xs font-medium hover:bg-surface-container transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">tune</span>
                Adjust Spend Cap
              </button>
              <button
                onClick={() => showToast(`Tax invoice downloaded for ${selected.name}`)}
                className="py-2 border border-outline-variant text-on-surface rounded-xl text-xs font-medium hover:bg-surface-container transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">receipt</span>
                Download Invoice
              </button>
              <button
                onClick={() => showToast(`Ad serving paused for ${selected.name}`)}
                className="py-2 border border-error/40 text-error rounded-xl text-xs font-medium hover:bg-error/5 transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">pause_circle</span>
                Pause Ad Serving
              </button>
            </div>

            {/* Creative Thumbnail Card */}
            <div className="mx-5 mb-5 bg-surface-container rounded-xl p-4 border border-outline-variant">
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Active Creative</p>
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary to-primary-container flex-shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-2xl">campaign</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">Flagship Deal Spotlight</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">{selected.activeCampaign.impressions.toLocaleString()} impressions</p>
                  <p className="text-[11px] text-on-surface-variant">{selected.activeCampaign.ctr} CTR</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

