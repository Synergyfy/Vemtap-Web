import { useMemo, useState } from 'react';
import { hasApiConfig } from '../../services/api/client';
import type { AdminApiSubscription } from '../../services/adminService';
import { formatCount, formatDate, NONE } from './adminLive';
import { adminErrorMessage, useAdminSubscriptions, useAdminSubscriptionStats } from './useAdminData';

interface AdminSubscriptionsListScreenProps {
  onNavigate: (path: string) => void;
}

type SubStatus = 'Active' | 'Trial' | 'Grace Period' | 'Overdue' | 'Expired' | 'Cancelled';

interface Subscription {
  id: string;
  merchantName: string;
  merchantShort: string;
  plan: string;
  /** Sample tiers in mock mode; the live plan name against the API. */
  tier: string;
  billingFee: string;
  billingPeriod: 'monthly' | 'annual';
  paymentMethod: string;
  renewalDate: string;
  renewalLabel: string;
  status: SubStatus;
  uuid: string;
  location: string;
  renewalAnchor: string;
  lifetimeBillings: string;
  lifetimeCycles: number;
  channelMandate: string;
  mandateRef: string;
  nextDebit: string;
  fallback: string;
  entitlements: { label: string; value: string }[];
  /** Live: the business behind the subscription. */
  businessId?: string;
}

const SUBS: Subscription[] = [
  {
    id: 'SUB-90214',
    merchantName: 'Slot Electronics Systems Ltd',
    merchantShort: 'SL',
    plan: 'Platinum Enterprise',
    tier: 'Platinum',
    billingFee: '₦120,000/mo',
    billingPeriod: 'monthly',
    paymentMethod: 'GTBank (****4019)',
    renewalDate: '18 Nov 2024',
    renewalLabel: 'In 4 days',
    status: 'Active',
    uuid: 'vem_sub_live_89102484920',
    location: 'Ikeja Computer Village',
    renewalAnchor: '18th of Every Month',
    lifetimeBillings: '₦2,160,000',
    lifetimeCycles: 18,
    channelMandate: 'GTBank NIBSS Direct Debit',
    mandateRef: 'MND-GTB-883902',
    nextDebit: 'Nov 18 02:00 WAT',
    fallback: 'Merchant Escrow ₦4.8M',
    entitlements: [
      { label: 'Branches', value: '8' },
      { label: 'Active Staff', value: '184' },
      { label: 'Live SKUs', value: '3,842' },
      { label: 'POS Terminals', value: '12' },
    ],
  },
  {
    id: 'SUB-89410',
    merchantName: 'Mega Seafood Hub',
    merchantShort: 'MS',
    plan: 'Gold Growth',
    tier: 'Gold',
    billingFee: '₦45,000/mo',
    billingPeriod: 'monthly',
    paymentMethod: 'Paystack (****8821)',
    renewalDate: 'Dec 2, 2024',
    renewalLabel: 'In 18 days',
    status: 'Active',
    uuid: 'vem_sub_live_72884192847',
    location: 'Victoria Island Food Strip',
    renewalAnchor: '2nd of Every Month',
    lifetimeBillings: '₦810,000',
    lifetimeCycles: 18,
    channelMandate: 'Paystack Card Mandate',
    mandateRef: 'MND-PSK-448213',
    nextDebit: 'Dec 2 02:00 WAT',
    fallback: 'Merchant Escrow ₦1.2M',
    entitlements: [
      { label: 'Branches', value: '3' },
      { label: 'Active Staff', value: '47' },
      { label: 'Live SKUs', value: '892' },
      { label: 'POS Terminals', value: '4' },
    ],
  },
  {
    id: 'SUB-88194',
    merchantName: 'Medplus Pharmacy Network',
    merchantShort: 'MP',
    plan: 'Platinum Annual',
    tier: 'Platinum',
    billingFee: '₦1,224,000/yr',
    billingPeriod: 'annual',
    paymentMethod: 'Escrow Sweep',
    renewalDate: 'Dec 15, 2024',
    renewalLabel: 'In 31 days',
    status: 'Active',
    uuid: 'vem_sub_live_66091827340',
    location: 'Surulere Health Corridor',
    renewalAnchor: 'Dec 15 Annually',
    lifetimeBillings: '₦3,672,000',
    lifetimeCycles: 3,
    channelMandate: 'Escrow Automatic Sweep',
    mandateRef: 'MND-ESC-228901',
    nextDebit: 'Dec 15 02:00 WAT',
    fallback: 'Merchant Escrow ₦8.4M',
    entitlements: [
      { label: 'Branches', value: '14' },
      { label: 'Active Staff', value: '312' },
      { label: 'Live SKUs', value: '6,100' },
      { label: 'POS Terminals', value: 'Unlimited' },
    ],
  },
  {
    id: 'SUB-87201',
    merchantName: 'Chicken Republic Wuse',
    merchantShort: 'CR',
    plan: 'Gold Growth',
    tier: 'Gold',
    billingFee: '₦45,000/mo',
    billingPeriod: 'monthly',
    paymentMethod: 'Zenith (****1192)',
    renewalDate: 'Nov 19, 2024',
    renewalLabel: 'Grace Day 1',
    status: 'Grace Period',
    uuid: 'vem_sub_live_59302817493',
    location: 'Wuse Zone 5, Abuja',
    renewalAnchor: '19th of Every Month',
    lifetimeBillings: '₦405,000',
    lifetimeCycles: 9,
    channelMandate: 'Zenith Bank Direct Debit',
    mandateRef: 'MND-ZNB-112947',
    nextDebit: 'Nov 20 02:00 WAT (Retry)',
    fallback: 'No escrow (grace active)',
    entitlements: [
      { label: 'Branches', value: '2' },
      { label: 'Active Staff', value: '28' },
      { label: 'Live SKUs', value: '148' },
      { label: 'POS Terminals', value: '3' },
    ],
  },
  {
    id: 'SUB-85112',
    merchantName: 'Casabella Beauty Hub',
    merchantShort: 'CB',
    plan: 'Silver Growth',
    tier: 'Silver',
    billingFee: '₦18,500/mo',
    billingPeriod: 'monthly',
    paymentMethod: 'Access (****3301)',
    renewalDate: '3 Failed Debits',
    renewalLabel: 'Overdue 12 days',
    status: 'Overdue',
    uuid: 'vem_sub_live_41029384756',
    location: 'Ikeja Beauty Mile',
    renewalAnchor: '21st of Every Month',
    lifetimeBillings: '₦222,000',
    lifetimeCycles: 12,
    channelMandate: 'Access Bank Direct Debit',
    mandateRef: 'MND-ACC-330128',
    nextDebit: 'Pending manual resolution',
    fallback: 'No escrow available',
    entitlements: [
      { label: 'Branches', value: '1' },
      { label: 'Active Staff', value: '9' },
      { label: 'Live SKUs', value: '74' },
      { label: 'POS Terminals', value: '1' },
    ],
  },
];

function statusBadge(s: SubStatus) {
  switch (s) {
    case 'Active': return 'bg-green-100 text-green-700';
    case 'Trial': return 'bg-blue-100 text-blue-700';
    case 'Grace Period': return 'bg-amber-100 text-amber-700';
    case 'Overdue': return 'bg-red-100 text-red-600';
    case 'Expired': return 'bg-slate-200 text-slate-600';
    case 'Cancelled': return 'bg-slate-100 text-slate-500';
  }
}

function tierBadge(t: Subscription['tier']) {
  switch (t) {
    case 'Platinum': return 'bg-amber-100 text-amber-700';
    case 'Gold': return 'bg-yellow-100 text-yellow-700';
    case 'Silver': return 'bg-slate-200 text-slate-700';
    case 'Free': return 'bg-slate-100 text-slate-500';
    default: return 'bg-blue-50 text-blue-700';
  }
}

const LIVE_STATUS: Record<string, SubStatus> = { active: 'Active', trial: 'Trial', expired: 'Expired', canceled: 'Cancelled' };

function toSubscription(sub: AdminApiSubscription): Subscription {
  const renewal = sub.renewal && sub.renewal !== 'N/A' ? sub.renewal : null;
  const days = renewal ? Math.ceil((new Date(renewal).getTime() - Date.now()) / 86_400_000) : null;
  return {
    id: sub.id.slice(0, 8).toUpperCase(),
    merchantName: sub.business,
    merchantShort: sub.business.slice(0, 2).toUpperCase(),
    plan: sub.plan,
    tier: sub.plan,
    billingFee: sub.amount === 'N/A' ? NONE : sub.amount === 'Free' ? 'Free' : `${sub.amount}/mo`,
    billingPeriod: 'monthly',
    paymentMethod: NONE,
    renewalDate: renewal ? formatDate(renewal) : NONE,
    renewalLabel: days === null ? '' : days < 0 ? `${-days}d ago` : days === 0 ? 'Today' : `In ${days} days`,
    status: LIVE_STATUS[sub.status] ?? 'Active',
    uuid: sub.id,
    location: NONE,
    renewalAnchor: NONE,
    lifetimeBillings: NONE,
    lifetimeCycles: 0,
    channelMandate: NONE,
    mandateRef: '',
    nextDebit: renewal ? formatDate(renewal) : NONE,
    fallback: NONE,
    entitlements: [],
    businessId: sub.businessId,
  };
}

const FILTER_TABS: { id: string; label: string; count: number }[] = [
  { id: 'all', label: 'All', count: 3840 },
  { id: 'active', label: 'Active', count: 2930 },
  { id: 'grace', label: 'Grace Period', count: 84 },
  { id: 'overdue', label: 'Overdue', count: 42 },
  { id: 'expired', label: 'Expired', count: 540 },
  { id: 'cancelled', label: 'Cancelled', count: 244 },
];

export function AdminSubscriptionsListScreen({ onNavigate }: AdminSubscriptionsListScreenProps) {
  const live = hasApiConfig();
  const [selectedId, setSelectedId] = useState(live ? '' : SUBS[0].id);
  const [filterTab, setFilterTab] = useState('all');
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [page, setPage] = useState(1);

  // Live API: every subscription (the endpoint returns them all, newest first).
  const subsQuery = useAdminSubscriptions();
  const stats = useAdminSubscriptionStats().data;
  const liveSubs = useMemo(() => (subsQuery.data ?? []).map(toSubscription), [subsQuery.data]);
  const statusCount = (status: SubStatus) => liveSubs.filter((x) => x.status === status).length;
  const planOptions = useMemo(() => Array.from(new Set(liveSubs.map((x) => x.plan))).sort(), [liveSubs]);
  const filteredLive = liveSubs.filter((x) => {
    if (filterTab === 'active' && x.status !== 'Active') return false;
    if (filterTab === 'trial' && x.status !== 'Trial') return false;
    if (filterTab === 'expired' && x.status !== 'Expired') return false;
    if (filterTab === 'cancelled' && x.status !== 'Cancelled') return false;
    if (planFilter && x.plan !== planFilter) return false;
    const q = search.trim().toLowerCase();
    return !q || x.merchantName.toLowerCase().includes(q) || x.plan.toLowerCase().includes(q) || x.uuid.includes(q);
  });
  const PAGE = 25;
  const lastPage = Math.max(1, Math.ceil(filteredLive.length / PAGE));
  const rows = live ? filteredLive.slice((page - 1) * PAGE, page * PAGE) : SUBS;
  const filterTabs = live
    ? [
        { id: 'all', label: 'All', count: liveSubs.length },
        { id: 'active', label: 'Active', count: statusCount('Active') },
        { id: 'trial', label: 'Trial', count: statusCount('Trial') },
        { id: 'expired', label: 'Expired', count: statusCount('Expired') },
        { id: 'cancelled', label: 'Cancelled', count: statusCount('Cancelled') },
      ]
    : FILTER_TABS;

  const selected: Subscription | undefined = (live ? liveSubs : SUBS).find(s => s.id === selectedId) ?? rows[0];

  const exportCsv = () => {
    const header = ['ID', 'Business', 'Plan', 'Fee', 'Renewal', 'Status'];
    const lines = filteredLive.map((x) => [x.uuid, x.merchantName, x.plan, x.billingFee, x.renewalDate, x.status]);
    const csv = [header, ...lines].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `vemtap-subscriptions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

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
            <span className="material-symbols-outlined text-primary text-base">autorenew</span>
            <span className="text-[10px] font-semibold tracking-widest text-primary uppercase">
              {live ? 'Revenue Operations' : 'Revenue Operations • Ledger 2024-Q4'}
            </span>
          </div>
          <h1 className="text-headline-xl font-bold text-on-surface">Platform Subscriptions &amp; Lifecycle Management</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Monitor merchant subscription health, manage lifecycle events, and govern billing operations across all tiers.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => (live ? exportCsv() : showToast('Subscription CSV exported'))}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Export CSV
          </button>
{!live && (
<>
          <button
            onClick={() => showToast('Bulk renewal notices queued')}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-base">send</span>
            Bulk Renewal Notice
          </button>
          <button
            onClick={() => showToast('Plan assignment form opened')}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            New Plan Assignment
          </button>
</>
)}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Total Subscriptions</p>
          <p className="text-3xl font-bold text-on-surface">{live ? formatCount(liveSubs.length) : '3,840'}</p>
          {live ? (
            <div className="flex gap-2 mt-3 flex-wrap text-[10px] text-on-surface-variant">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Active {statusCount('Active')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Trial {statusCount('Trial')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />Expired {statusCount('Expired')}</span>
            </div>
          ) : (
          <>
          <div className="w-full h-2 rounded-full overflow-hidden flex mt-3 gap-0.5">
            <div className="h-full bg-green-500 rounded-full" style={{ width: '76.3%' }} />
            <div className="h-full bg-amber-400 rounded-full" style={{ width: '2.2%' }} />
            <div className="h-full bg-red-400 rounded-full" style={{ width: '1.1%' }} />
            <div className="h-full bg-slate-300 rounded-full flex-1" />
          </div>
          <div className="flex gap-2 mt-1.5 flex-wrap text-[10px] text-on-surface-variant">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Active 76.3%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Grace 2.2%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Overdue 1.1%</span>
          </div>
          </>
          )}
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            {live ? 'Active & Trial' : 'Auto-Renewal Rate'}
          </p>
          <p className="text-3xl font-bold text-on-surface">
            {live ? formatCount((stats?.activeSubscriptions ?? 0) + (stats?.activeTrials ?? 0)) : '94.2%'}
          </p>
          {live ? (
            <p className="text-xs text-on-surface-variant mt-1">{formatCount(stats?.activeTrials)} on trial</p>
          ) : (
            <>
              <p className="text-xs text-green-600 font-semibold mt-1">+1.8% MoM</p>
              <p className="text-xs text-on-surface-variant mt-1">3,618 active mandates</p>
            </>
          )}
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            {live ? 'Renewing in 7 Days' : 'Renewal Inflow (7 days)'}
          </p>
          <p className="text-3xl font-bold text-on-surface">{live ? formatCount(stats?.expiringSoon) : '₦18.4M'}</p>
          <p className="text-xs text-on-surface-variant mt-1">{live ? 'subscriptions' : '412 upcoming renewals'}</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            {live ? 'Expired' : 'Churn Rate'}
          </p>
          <p className="text-3xl font-bold text-on-surface">{live ? formatCount(stats?.pastDue) : '1.4%'}</p>
          <p className="text-xs text-on-surface-variant mt-1">{live ? 'not renewed' : 'Avg LTV ₦384,500'}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Table (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Search + Filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-surface-container border border-outline-variant rounded-xl px-3 py-2 flex-1">
              <span className="material-symbols-outlined text-base text-on-surface-variant">search</span>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-sm outline-none flex-1 text-on-surface placeholder:text-on-surface-variant"
                placeholder="Search subscriptions..."
              />
            </div>
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface outline-none"
            >
              <option value="">{live ? 'All Plans' : 'All Tiers'}</option>
              {live ? (
                planOptions.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan}
                  </option>
                ))
              ) : (
                <>
                  <option>Platinum</option>
                  <option>Gold</option>
                  <option>Silver</option>
                  <option>Free</option>
                </>
              )}
            </select>
            {!live && (
            <select className="px-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface outline-none">
              <option>Renewal Window</option>
              <option>Next 7 days</option>
              <option>Next 30 days</option>
            </select>
            )}
            <button onClick={() => (live ? void subsQuery.refetch() : showToast('Refreshed subscription data'))} className="p-2 bg-surface-container border border-outline-variant rounded-xl hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-base text-on-surface-variant">refresh</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1 flex-wrap">
            {filterTabs.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setFilterTab(t.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${filterTab === t.id ? 'bg-primary text-white' : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                {t.label} <span className="opacity-75">{t.count.toLocaleString()}</span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low text-[11px] text-on-surface-variant">
                    <th className="text-left px-4 py-3 font-semibold">Merchant</th>
                    <th className="text-left px-3 py-3 font-semibold">Plan</th>
                    <th className="text-left px-3 py-3 font-semibold">Billing Fee</th>
                    <th className="text-left px-3 py-3 font-semibold">Renewal</th>
                    <th className="text-left px-3 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {live && rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-on-surface-variant">
                        {subsQuery.isLoading
                          ? 'Loading subscriptions…'
                          : subsQuery.isError
                            ? `Couldn't load subscriptions: ${adminErrorMessage(subsQuery.error)}`
                            : 'No subscriptions match.'}
                      </td>
                    </tr>
                  )}
                  {rows.map(sub => (
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedId(sub.id)}
                      className={`border-b border-outline-variant/30 cursor-pointer transition-colors ${selected?.id === sub.id ? 'bg-secondary-container/20' : 'hover:bg-surface-container'}`}
                    >
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-on-surface">{sub.merchantName}</p>
                        <p className="text-[11px] text-on-surface-variant">#{sub.id}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tierBadge(sub.tier)}`}>{sub.tier}</span>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs font-medium text-on-surface">{sub.billingFee}</p>
                        {!live && <p className="text-[11px] text-on-surface-variant">{sub.paymentMethod}</p>}
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs font-medium text-on-surface">{sub.renewalDate}</p>
                        <p className="text-[11px] text-on-surface-variant">{sub.renewalLabel}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(sub.status)}`}>{sub.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-outline-variant flex items-center justify-between">
              <p className="text-xs text-on-surface-variant">
                {live
                  ? `Showing ${rows.length ? (page - 1) * PAGE + 1 : 0}–${(page - 1) * PAGE + rows.length} of ${filteredLive.length} subscriptions`
                  : 'Showing 1–5 of 3,840 subscriptions'}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => live && setPage((x) => Math.max(1, x - 1))}
                  disabled={live && page <= 1}
                  className="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface-variant disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>
                <button
                  onClick={() => live && setPage((x) => Math.min(lastPage, x + 1))}
                  disabled={live && page >= lastPage}
                  className="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface-variant disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Dossier (5 cols) */}
        {!selected ? (
          <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 text-xs text-on-surface-variant">
            Select a subscription to see it.
          </div>
        ) : (
        <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden flex flex-col">
          {/* Dossier Header */}
          <div className="px-5 py-4 border-b border-outline-variant">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(selected.status)}`}>{selected.status.toUpperCase()}</span>
                  {!live && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">AUTO-RENEW ON</span>}
                </div>
                <p className="text-sm font-bold text-on-surface mt-2">#{selected.id}</p>
                <p className="text-[11px] font-mono text-on-surface-variant mt-0.5">{selected.uuid}</p>
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
            {/* Merchant Snapshot */}
            <div className="px-5 py-4 border-b border-outline-variant">
              <h4 className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Merchant</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {selected.merchantShort}
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">{selected.merchantName}</p>
                  {!live && <p className="text-xs text-on-surface-variant">{selected.location}</p>}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${tierBadge(selected.tier)}`}>
                    {live ? selected.plan : `${selected.tier} ${selected.plan}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Subscription Specs */}
            <div className="px-5 py-4 border-b border-outline-variant">
              <h4 className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Subscription Specs</h4>
              <div className="grid grid-cols-2 gap-3">
                {(live
                  ? [
                      { label: 'Current Plan', value: selected.plan },
                      { label: 'Billing Fee', value: selected.billingFee },
                      { label: 'Renews / Ends', value: selected.renewalDate },
                      { label: 'Status', value: selected.status },
                    ]
                  : [
                      { label: 'Current Plan', value: selected.plan },
                      { label: 'Billing Fee', value: selected.billingFee },
                      { label: 'Renewal Anchor', value: selected.renewalAnchor },
                      { label: 'Lifetime Billings', value: `${selected.lifetimeBillings} / ${selected.lifetimeCycles} cycles` },
                    ]
                ).map(d => (
                  <div key={d.label}>
                    <p className="text-[11px] text-on-surface-variant">{d.label}</p>
                    <p className="text-xs font-semibold text-on-surface mt-0.5">{d.value}</p>
                  </div>
                ))}
              </div>
            </div>

{!live && (
<>
            {/* Channel & Mandate */}
            <div className="px-5 py-4 border-b border-outline-variant">
              <h4 className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Channel &amp; Mandate</h4>
              <div className="flex items-start gap-3 bg-surface-container rounded-xl p-3">
                <span className="material-symbols-outlined text-primary text-base mt-0.5">account_balance</span>
                <div>
                  <p className="text-xs font-semibold text-on-surface">{selected.channelMandate}</p>
                  <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">{selected.mandateRef}</p>
                </div>
              </div>
            </div>

            {/* Dunning & Retry */}
            <div className="px-5 py-4 border-b border-outline-variant">
              <h4 className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Dunning &amp; Retry Governance</h4>
              <div className="space-y-2">
                {[
                  { label: 'Next Debit', value: selected.nextDebit, icon: 'schedule' },
                  { label: 'Fallback', value: selected.fallback, icon: 'savings' },
                  { label: 'Auto-retry Policy', value: '3× / 7 days', icon: 'repeat' },
                ].map(d => (
                  <div key={d.label} className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">{d.icon}</span>
                    <div className="flex-1 flex justify-between">
                      <p className="text-[11px] text-on-surface-variant">{d.label}</p>
                      <p className="text-xs font-semibold text-on-surface">{d.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Entitlement Utilization */}
            <div className="px-5 py-4 border-b border-outline-variant">
              <h4 className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Entitlement Utilization</h4>
              <div className="grid grid-cols-2 gap-2">
                {selected.entitlements.map(e => (
                  <div key={e.label} className="bg-surface-container rounded-xl p-3">
                    <p className="text-lg font-bold text-on-surface">{e.value}</p>
                    <p className="text-[11px] text-on-surface-variant">{e.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Action Buttons */}
            <div className="px-5 py-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => showToast(`Force renewal debit for ${selected.merchantName}...`)}
                className="py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">bolt</span>
                Force Renewal Debit
              </button>
              <button
                onClick={() => showToast(`Dunning notice sent to ${selected.merchantName}`)}
                className="py-2 border border-outline-variant text-on-surface rounded-xl text-xs font-medium hover:bg-surface-container transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">mail</span>
                Send Dunning Notice
              </button>
              <button
                onClick={() => showToast(`Subscription paused for ${selected.merchantName}`)}
                className="py-2 border border-outline-variant text-on-surface rounded-xl text-xs font-medium hover:bg-surface-container transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">pause_circle</span>
                Pause Subscription
              </button>
              <button
                onClick={() => showToast(`Plan upgrade/downgrade flow for ${selected.merchantName}...`)}
                className="py-2 border border-outline-variant text-on-surface rounded-xl text-xs font-medium hover:bg-surface-container transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">swap_vert</span>
                Upgrade / Downgrade
              </button>
            </div>
</>
)}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

