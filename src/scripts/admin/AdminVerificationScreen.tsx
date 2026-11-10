import { useDeferredValue, useMemo, useState } from 'react';
import { hasApiConfig } from '../../services/api/client';
import { adminService, type AdminApiBusiness } from '../../services/adminService';
import { formatCount, NONE, timeAgo } from './adminLive';
import {
  adminErrorMessage,
  useAdminAction,
  useAdminBusinesses,
  useAdminPendingVerification,
  useAdminVerificationDetail,
} from './useAdminData';

interface KYBCase {
  id: string;
  kybId: string;
  submittedAt: string;
  entityName: string;
  tradeName: string;
  initials: string;
  initialsColor: string;
  cacStatus: 'verified' | 'flagged' | 'pending';
  cacNumber: string;
  tinStatus: 'verified' | 'pending' | 'error';
  tinNumber: string;
  address: string;
  cluster: string;
  /** Sample pipeline stages in mock mode; the business's verification status against the API. */
  stage: string;
  stageBg: string;
  stageText: string;
  slaHours: string;
  slaColor: string;
  slaLabel: string;
  primaryAction: string;
  primaryActionStyle: string;
  isSelected?: boolean;
  /** The API record behind a live row (absent in mock mode). */
  raw?: AdminApiBusiness;
}

const LIVE_STAGE: Record<string, { label: string; bg: string; text: string }> = {
  needs_review: { label: 'Needs review', bg: 'bg-amber-100', text: 'text-amber-900' },
  in_progress: { label: 'Checks in progress', bg: 'bg-[#dae2fd]', text: 'text-[#001a41]' },
  rejected: { label: 'Rejected', bg: 'bg-[#ffdad6]', text: 'text-[#93000a]' },
  unverified: { label: 'Not started', bg: 'bg-[#e6e8ea]', text: 'text-[#191c1e]' },
};

/** A business awaiting verification, shaped as a queue row. */
function toKybCase(business: AdminApiBusiness): KYBCase {
  const stage = LIVE_STAGE[business.verificationStatus ?? 'unverified'] ?? LIVE_STAGE.unverified;
  const name = business.name || NONE;
  const submitted = new Date(business.createdAt);
  return {
    id: business.id,
    kybId: `#${business.uniqueCode ?? business.id.slice(0, 8).toUpperCase()}`,
    submittedAt: Number.isNaN(submitted.getTime())
      ? NONE
      : submitted.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    entityName: name,
    tradeName: business.category?.name ?? NONE,
    initials: name.slice(0, 2).toUpperCase(),
    initialsColor: 'bg-[#e6e8ea] text-[#191c1e]',
    cacStatus: 'pending',
    cacNumber: business.registrationNumber || 'No CAC number',
    tinStatus: 'pending',
    tinNumber: business.officialEmail || business.owner?.email || NONE,
    address: business.address || NONE,
    cluster: [business.city, business.state].filter(Boolean).join(', ') || NONE,
    stage: stage.label,
    stageBg: stage.bg,
    stageText: stage.text,
    slaHours: timeAgo(business.createdAt),
    slaColor: 'text-[#191c1e]',
    slaLabel: 'Since sign-up',
    primaryAction: 'Approve',
    primaryActionStyle: 'bg-[#066cf4] text-white hover:bg-[#0055c4]',
    raw: business,
  };
}

const CHECK_LABEL: Record<string, string> = { identity: 'Owner identity (ID + selfie)', business: 'Business registration (CAC)' };
const CHECK_STATUS: Record<string, { icon: string; color: string; label: string }> = {
  verified: { icon: 'verified', color: 'text-emerald-700', label: 'Passed' },
  needs_review: { icon: 'pending', color: 'text-amber-600', label: 'Needs review' },
  failed: { icon: 'error', color: 'text-[#ba1a1a]', label: 'Failed' },
  pending: { icon: 'schedule', color: 'text-[#4a5e88]', label: 'Pending' },
};

const LIVE_PAGE_SIZE = 20;

const KYB_QUEUE: KYBCase[] = [
  {
    id: '1', kybId: '#KYB-88204', submittedAt: 'Today, 08:42 AM',
    entityName: 'Mega Seafood Hub Ltd.', tradeName: 'Mega Atlantic Oceanics', initials: 'MS',
    initialsColor: 'bg-[#066cf4] text-white',
    cacStatus: 'verified', cacNumber: 'RC-1849204', tinStatus: 'verified', tinNumber: 'TIN: 29402914-001',
    address: 'Lekki Free Zone Block 4', cluster: 'Lekki Peninsula Hub',
    stage: 'Geofence Audit', stageBg: 'bg-amber-100', stageText: 'text-amber-900',
    slaHours: '2.4 hrs', slaColor: 'text-[#ba1a1a]', slaLabel: 'Priority Target',
    primaryAction: 'Approve', primaryActionStyle: 'bg-[#066cf4] text-white hover:bg-[#0055c4]',
    isSelected: true,
  },
  {
    id: '2', kybId: '#KYB-88198', submittedAt: 'Today, 07:15 AM',
    entityName: 'Silverline Diagnostics Inc.', tradeName: 'Silverline Labs', initials: 'SD',
    initialsColor: 'bg-[#e6e8ea] text-[#191c1e]',
    cacStatus: 'verified', cacNumber: 'RC-0994182', tinStatus: 'pending', tinNumber: 'TIN: Pending FIRS',
    address: '14 Victoria Island Blvd', cluster: 'VI Central Commercial',
    stage: 'TIN Clearance', stageBg: 'bg-[#dae2fd]', stageText: 'text-[#001a41]',
    slaHours: '4.8 hrs', slaColor: 'text-[#191c1e]', slaLabel: 'Standard Tier',
    primaryAction: 'Inspect', primaryActionStyle: 'bg-[#f2f4f6] text-[#191c1e] hover:bg-[#e6e8ea]',
  },
  {
    id: '3', kybId: '#KYB-88192', submittedAt: 'Yesterday, 18:20',
    entityName: 'Prime Agro Trans Solutions', tradeName: 'AgroDirect Logistics', initials: 'PA',
    initialsColor: 'bg-emerald-100 text-emerald-800',
    cacStatus: 'flagged', cacNumber: 'CAC Flagged (Inactive)', tinStatus: 'verified', tinNumber: 'TIN: 88102914-002',
    address: 'Warehouse 3, Ikeja Freight Way', cluster: 'Ikeja Cargo Cluster',
    stage: 'Doc Resubmit', stageBg: 'bg-[#ffdad6]', stageText: 'text-[#93000a]',
    slaHours: 'Overdue (+1.2h)', slaColor: 'text-[#ba1a1a]', slaLabel: 'Escalated L2',
    primaryAction: 'Review Flag', primaryActionStyle: 'bg-[#f2f4f6] text-[#ba1a1a] hover:bg-[#e6e8ea]',
  },
  {
    id: '4', kybId: '#KYB-88185', submittedAt: 'Yesterday, 16:04',
    entityName: 'Apex Urban Couture Enterprises', tradeName: 'Apex Studio 9', initials: 'AU',
    initialsColor: 'bg-purple-100 text-purple-800',
    cacStatus: 'verified', cacNumber: 'BN-7718290', tinStatus: 'verified', tinNumber: 'TIN: 44109823-001',
    address: 'Plot 88 Admiralty Way', cluster: 'Lekki Phase 1 Retail',
    stage: 'Final Sign-off', stageBg: 'bg-[#e6e8ea]', stageText: 'text-[#191c1e]',
    slaHours: '11.5 hrs', slaColor: 'text-[#191c1e]', slaLabel: 'Normal Band',
    primaryAction: 'Sign-off', primaryActionStyle: 'bg-[#066cf4] text-white hover:bg-[#0055c4]',
  },
  {
    id: '5', kybId: '#KYB-88174', submittedAt: 'Yesterday, 14:10',
    entityName: 'Koko Hospitality Brands Ltd.', tradeName: 'Koko Bar & Grill', initials: 'KG',
    initialsColor: 'bg-amber-100 text-amber-800',
    cacStatus: 'verified', cacNumber: 'RC-2001923', tinStatus: 'verified', tinNumber: 'TIN: 55902188-001',
    address: '5 Bishop Aboyade Cole St', cluster: 'VI Gastronomy Strip',
    stage: 'Audit Cleared', stageBg: 'bg-emerald-100', stageText: 'text-emerald-900',
    slaHours: '18.0 hrs', slaColor: 'text-[#191c1e]', slaLabel: 'Auto Queued',
    primaryAction: 'Dispatch', primaryActionStyle: 'bg-[#f2f4f6] text-[#191c1e] hover:bg-[#e6e8ea]',
  },
];

interface AdminVerificationScreenProps {
  onNavigate?: (path: string) => void;
}

export function AdminVerificationScreen({ onNavigate: _onNavigate }: AdminVerificationScreenProps) {
  const live = hasApiConfig();
  const [mockQueue, setQueue] = useState<KYBCase[]>(KYB_QUEUE);
  const [mockSelected, setMockSelected] = useState<KYBCase>(KYB_QUEUE[0]);
  const [activeTab, setActiveTab] = useState<'all' | 'cac' | 'geofence' | 'resubmit' | 'rejected'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Live API: businesses not yet verified, newest first.
  const deferredSearch = useDeferredValue(search.trim());
  const pending = useAdminPendingVerification({ search: deferredSearch || undefined, page, limit: LIVE_PAGE_SIZE });
  const verifiedCount = useAdminBusinesses({ isVerified: true, page: 1, limit: 1 }).data?.meta.total;
  const liveRows = useMemo(() => (pending.data?.data ?? []).map(toKybCase), [pending.data]);
  const liveTotal = pending.data?.meta.total ?? 0;
  const lastPage = Math.max(1, pending.data?.meta.lastPage ?? Math.ceil(liveTotal / LIVE_PAGE_SIZE));
  const liveTabRows = useMemo(() => {
    const status = (row: KYBCase) => row.raw?.verificationStatus ?? 'unverified';
    if (activeTab === 'cac') return liveRows.filter((r) => status(r) === 'needs_review');
    if (activeTab === 'resubmit') return liveRows.filter((r) => status(r) === 'in_progress');
    if (activeTab === 'rejected') return liveRows.filter((r) => status(r) === 'rejected');
    if (activeTab === 'geofence') return [];
    return liveRows;
  }, [liveRows, activeTab]);

  const queue = live ? liveTabRows : mockQueue;
  const liveSelected = liveRows.find((r) => r.id === selectedId) ?? liveTabRows[0] ?? null;
  const selected: KYBCase | null = live ? liveSelected : mockSelected;
  const setSelected = (item: KYBCase) => (live ? setSelectedId(item.id) : setMockSelected(item));
  const detail = useAdminVerificationDetail(live ? selected?.id : null);

  const approve = useAdminAction((id: string) => adminService.approveVerification(id, 'Approved from the admin console'));
  const reject = useAdminAction((id: string) => adminService.rejectVerification(id, 'Rejected from the admin console'));

  const notify = (message: string) => {
    setActionNotice(message);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleApprove = (item: KYBCase) => {
    if (live) {
      setActionError(null);
      approve.mutate(item.id, {
        onSuccess: () => {
          setSelectedId(null);
          notify(`${item.entityName} verified.`);
        },
        onError: (error) => setActionError(adminErrorMessage(error)),
      });
      return;
    }
    setQueue((prev) => prev.filter((q) => q.id !== item.id));
    setSelected(queue.find((q) => q.id !== item.id) ?? KYB_QUEUE[0]);
    setActionNotice(`${item.entityName} approved — Live API Key issued.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleReject = () => {
    if (!selected) return;
    if (live) {
      setActionError(null);
      reject.mutate(selected.id, {
        onSuccess: () => notify(`${selected.entityName} rejected — the owner can submit again.`),
        onError: (error) => setActionError(adminErrorMessage(error)),
      });
      return;
    }
    setActionNotice(`${selected.entityName} rejected — Notice queued for dispatch.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleRequest = () => {
    if (!selected) return;
    setActionNotice(`Document resubmission request sent to ${selected.entityName}.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const countStatus = (status: string) => liveRows.filter((r) => (r.raw?.verificationStatus ?? 'unverified') === status).length;
  const tabCounts = live
    ? { all: liveTotal, cac: countStatus('needs_review'), geofence: 0, resubmit: countStatus('in_progress'), rejected: countStatus('rejected') }
    : { all: 3152, cac: 42, geofence: 32, resubmit: 18, rejected: 86 };

  const handleExport = () => {
    const header = ['ID', 'Business', 'Category', 'CAC', 'Contact', 'Address', 'Location', 'Stage', 'Submitted'];
    const rows = queue.map((q) => [q.kybId, q.entityName, q.tradeName, q.cacNumber, q.tinNumber, q.address, q.cluster, q.stage, q.submittedAt]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `vemtap-verification-queue-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
      {/* Action Notice */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[12px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-emerald-600">check_circle</span>
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)}>
            <span className="material-symbols-outlined text-[15px] text-emerald-600">close</span>
          </button>
        </div>
      )}
      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-[12px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-red-600">error</span>
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)}>
            <span className="material-symbols-outlined text-[15px] text-red-600">close</span>
          </button>
        </div>
      )}

      {/* TOP: Triage Title & Live Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0055c4] bg-[#d9e2ff]/40 px-2 py-0.5 rounded-full">
              Regulatory Node 03
            </span>
            <span className="text-[#c2c6d7] text-[12px]">•</span>
            {!live && (
              <span className="text-[12px] text-[#4a5e88] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                CAC & FIRS Realtime Telemetry Sync Active
              </span>
            )}
          </div>
          <h1 className="text-[24px] font-bold tracking-tight text-[#191c1e]">
            Business Verification & KYB Pipeline
          </h1>
          <p className="text-[14px] text-[#4a5e88] max-w-3xl">
            Manage merchant onboarding verifications, corporate credentials, CAC matches, and physical store geofence audits.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="h-9 px-3 rounded-lg bg-[#f2f4f6] text-[#191c1e] hover:bg-[#e6e8ea] text-[12px] font-medium shadow-sm flex items-center gap-1.5 transition-colors">
            <span className="material-symbols-outlined text-[16px] text-[#4a5e88]">tune</span>
            Filter Rules
          </button>
          <button
            onClick={live ? handleExport : undefined}
            className="h-9 px-3 rounded-lg bg-[#f2f4f6] text-[#191c1e] hover:bg-[#e6e8ea] text-[12px] font-medium shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-[#4a5e88]">file_download</span>
            Export Audit Log
          </button>
          {live ? (
            <button
              onClick={() => void pending.refetch()}
              className="h-9 px-3 rounded-lg bg-[#066cf4] text-white text-[12px] font-medium hover:bg-[#0055c4] transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span className={`material-symbols-outlined text-[16px] ${pending.isFetching ? 'animate-spin' : ''}`}>sync</span>
              Refresh Queue
            </button>
          ) : (
          <button className="h-9 px-3 rounded-lg bg-[#066cf4] text-white text-[12px] font-medium hover:bg-[#0055c4] transition-colors shadow-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">sync</span>
            Trigger CAC Batch Poll
          </button>
          )}
        </div>
      </div>

      {/* METRIC HUD: 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending */}
        <div className="relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[#0055c4]/5 pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a5e88]">Pending Initial Review</span>
            <span className="w-8 h-8 rounded-lg bg-[#d9e2ff]/50 text-[#0055c4] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-[24px] font-bold tracking-tight text-[#191c1e]">
                {live ? formatCount(pending.data?.stats.totalPending ?? liveTotal) : queue.length + 119}
              </span>
              <span className="text-[12px] text-[#4a5e88]">cases</span>
            </div>
            <span className="text-[10px] font-bold text-[#0055c4] flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              {live ? `${formatCount(pending.data?.stats.verifiedToday)} verified today` : '+14 today'}
            </span>
          </div>
          {live ? (
            <div className="mt-2 pt-1 text-[11px] text-[#4a5e88]">
              Avg wait {pending.data?.stats.avgWaitTime ?? NONE} hrs
            </div>
          ) : (
          <div className="mt-2 pt-1 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-[#e6e8ea] overflow-hidden">
              <div className="h-full bg-[#066cf4] rounded-full" style={{ width: '68%' }} />
            </div>
            <span className="text-[11px] text-[#4a5e88] shrink-0">68% allocated</span>
          </div>
          )}
        </div>

        {/* Card 2: Verified */}
        <div className="relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/5 pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a5e88]">Verified & Active</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-[24px] font-bold tracking-tight text-[#191c1e]">{live ? formatCount(verifiedCount) : '2,910'}</span>
              <span className="text-[12px] text-[#4a5e88]">entities</span>
            </div>
            {!live && (
              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>98.2% pass
              </span>
            )}
          </div>
          {!live && (
          <div className="mt-2 pt-1 flex items-center justify-between text-[#4a5e88]">
            <span className="text-[11px]">Corporate tier verified</span>
            <span className="text-[12px] font-medium text-[#191c1e]">92.4% avg conf</span>
          </div>
          )}
        </div>

        {/* Card 3: Rejected */}
        <div className="relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[#ba1a1a]/5 pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a5e88]">Rejected / Flagged</span>
            <span className="w-8 h-8 rounded-lg bg-[#ffdad6] text-[#93000a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">gpp_bad</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-[24px] font-bold tracking-tight text-[#191c1e]">{live ? formatCount(tabCounts.rejected) : '86'}</span>
              <span className="text-[12px] text-[#4a5e88]">{live ? 'on this page' : 'disqualified'}</span>
            </div>
            {!live && (
              <span className="text-[10px] font-bold text-[#ba1a1a] flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">warning</span>CAC mismatch
              </span>
            )}
          </div>
          {!live && (
          <div className="mt-2 pt-1 flex items-center justify-between text-[#4a5e88]">
            <span className="text-[11px]">Revoked/Forged TIN</span>
            <span className="text-[12px] font-medium text-[#ba1a1a]">18 critical holds</span>
          </div>
          )}
        </div>

        {/* Card 4: Field Review */}
        <div className="relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-500/5 pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a5e88]">Field Review Needed</span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">wrong_location</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-[24px] font-bold tracking-tight text-[#191c1e]">{live ? formatCount(tabCounts.cac) : '32'}</span>
              <span className="text-[12px] text-[#4a5e88]">{live ? 'need a person (this page)' : 'geofence flags'}</span>
            </div>
            {!live && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded">
                Agent Dispatched
              </span>
            )}
          </div>
          {!live && (
          <div className="mt-2 pt-1 flex items-center justify-between text-[#4a5e88]">
            <span className="text-[11px]">Avg response lag</span>
            <span className="text-[12px] font-medium text-[#191c1e]">3.8 hrs SLA</span>
          </div>
          )}
        </div>
      </div>

      {/* TABBED QUEUE FILTER RAIL */}
      <div className="flex items-center justify-between bg-white p-1.5 rounded-xl shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1">
          {([
            { id: 'all', label: 'All Verifications', count: tabCounts.all },
            { id: 'cac', label: 'Pending CAC / TIN Match', count: tabCounts.cac, dot: true },
            { id: 'geofence', label: 'Physical Geofence Inspection', count: tabCounts.geofence },
            { id: 'resubmit', label: 'Document Resubmission', count: tabCounts.resubmit },
            { id: 'rejected', label: 'Rejected / Flagged', count: tabCounts.rejected },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 h-9 px-3 rounded-lg text-[12px] font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#f2f4f6] text-[#191c1e] shadow-sm'
                  : 'text-[#4a5e88] hover:text-[#191c1e] hover:bg-[#f2f4f6]'
              }`}
            >
              {'dot' in tab && tab.dot && <span className="w-1.5 h-1.5 rounded-full bg-[#066cf4]" />}
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.id
                  ? 'bg-[#066cf4] text-white'
                  : 'bg-[#f2f4f6] text-[#4a5e88]'
              }`}>
                {tab.count.toLocaleString()}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pr-1">
          <span className="text-[11px] text-[#4a5e88]">Sort by:</span>
          <button className="flex items-center gap-1 text-[12px] font-medium text-[#191c1e] bg-[#f2f4f6] px-2 py-1 rounded">
            SLA Urgency
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>
        </div>
      </div>

      {/* TRIAGE SPLIT WORKSPACE: 8-col table + 4-col inspector */}
      <div className="grid grid-cols-12 gap-4 items-start">
        {/* LEFT: Triage Master Table (8 cols) */}
        <div className="col-span-12 xl:col-span-8 flex flex-col bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="px-4 py-3 bg-white flex items-center justify-between border-b border-[#f2f4f6]">
            <div className="flex items-center gap-3">
              <span className="text-[15px] font-semibold text-[#191c1e]">Queue Worklist</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#066cf4]" />
                <span className="text-[11px] text-[#4a5e88]">
                  {live ? `Showing ${queue.length} of ${formatCount(liveTotal)}` : `Showing ${queue.length + 37} Priority Items`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-[#727786]">search</span>
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 pl-8 pr-3 rounded bg-[#f2f4f6] text-[#191c1e] placeholder:text-[#727786] text-[12px] focus:outline-none focus:ring-1 focus:ring-[#066cf4]/30 w-52"
                  placeholder={live ? 'Search business or owner...' : 'Search RC, TIN, merchant...'}
                  type="text"
                />
              </div>
              <button className="w-8 h-8 rounded bg-[#f2f4f6] hover:bg-[#e6e8ea] flex items-center justify-center text-[#4a5e88]">
                <span className="material-symbols-outlined text-[18px]">view_column</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6] text-[#4a5e88] text-[10px] font-bold uppercase tracking-widest">
                  <th className="py-3 px-4 w-8"><input type="checkbox" className="rounded cursor-pointer" /></th>
                  <th className="py-3 px-4">ID & Submitted</th>
                  <th className="py-3 px-4">Entity & Trade Name</th>
                  <th className="py-3 px-4">CAC / TIN Match</th>
                  <th className="py-3 px-4">Cluster & Address</th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4">SLA Clock</th>
                  <th className="py-3 px-4 text-right">Triage Actions</th>
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {live && queue.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 px-4 text-center text-[#4a5e88]">
                      {pending.isLoading
                        ? 'Loading the verification queue…'
                        : pending.isError
                          ? `Couldn't load the queue: ${adminErrorMessage(pending.error)}`
                          : 'Nothing in this queue.'}
                    </td>
                  </tr>
                )}
                {queue.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className={`transition-colors cursor-pointer ${
                      selected?.id === item.id
                        ? 'bg-[#d9e2ff]/20 hover:bg-[#d9e2ff]/30'
                        : 'bg-white hover:bg-[#f2f4f6]/50'
                    }`}
                  >
                    <td className="py-3 px-4 relative">
                      {selected?.id === item.id && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#066cf4]" />
                      )}
                      <input type="checkbox" checked={selected?.id === item.id} readOnly className="rounded cursor-pointer" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[12px] font-bold text-[#191c1e]">{item.kybId}</span>
                      <div className="text-[11px] text-[#4a5e88]">{item.submittedAt}</div>
                    </td>
                    <td className="py-3 px-4 min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded text-[11px] font-bold flex items-center justify-center shrink-0 ${item.initialsColor}`}>
                          {item.initials}
                        </div>
                        <div className="truncate">
                          <div className="text-[12px] font-medium text-[#191c1e] truncate">{item.entityName}</div>
                          <div className="text-[11px] text-[#4a5e88] truncate">{item.tradeName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] ${item.cacStatus === 'flagged' ? 'text-[#ba1a1a]' : 'text-emerald-800'}`}>
                          <span className={`material-symbols-outlined text-[13px] ${item.cacStatus === 'flagged' ? '' : 'text-emerald-700'}`}>
                            {item.cacStatus === 'flagged' ? 'error' : 'verified'}
                          </span>
                          {item.cacNumber}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[11px] ${item.tinStatus === 'pending' ? 'text-amber-700' : 'text-[#4a5e88]'}`}>
                          <span className={`material-symbols-outlined text-[13px] ${item.tinStatus === 'pending' ? '' : 'text-[#0055c4]'}`}>
                            {item.tinStatus === 'pending' ? 'pending' : 'check_circle'}
                          </span>
                          {item.tinNumber}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-[190px]">
                      <div className="truncate text-[11px] text-[#191c1e]">{item.address}</div>
                      <div className="truncate text-[11px] text-[#4a5e88]">{item.cluster}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${item.stageBg} ${item.stageText}`}>
                        {item.stage === 'Geofence Audit' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                        )}
                        {item.stage}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1 text-[12px] font-medium ${item.slaColor}`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {item.slaColor === 'text-[#ba1a1a]' ? 'timer' : 'schedule'}
                        </span>
                        {item.slaHours}
                      </div>
                      <div className="text-[11px] text-[#4a5e88]">{item.slaLabel}</div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          disabled={approve.isPending}
                          onClick={(e) => { e.stopPropagation(); handleApprove(item); }}
                          className={`h-7 px-2 rounded text-[10px] font-bold shadow-sm transition-colors ${item.primaryActionStyle}`}
                        >
                          {item.primaryAction}
                        </button>
                        <button className="h-7 w-7 rounded bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#4a5e88] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[16px]">more_vert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-2.5 bg-white border-t border-[#f2f4f6] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-[#4a5e88]">
              <span>
                {live
                  ? `Page ${page} of ${lastPage} • ${formatCount(liveTotal)} unverified businesses`
                  : `Showing 1 to ${queue.length} of 42 actionable entries`}
              </span>
              {!live && <span>•</span>}
              {!live && <span className="text-[#191c1e] font-medium">Batch 01/09</span>}
            </div>
            {live ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-8 px-2 rounded bg-[#f2f4f6] text-[#191c1e] text-[11px] font-medium disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page >= lastPage}
                  className="h-8 px-2 rounded bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#191c1e] text-[11px] font-medium disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            ) : (
            <div className="flex items-center gap-1">
              <button className="h-8 px-2 rounded bg-[#f2f4f6] text-[#4a5e88] text-[11px] font-medium opacity-50" disabled>Previous</button>
              <button className="h-8 w-8 rounded bg-[#066cf4] text-white text-[11px] font-bold flex items-center justify-center">1</button>
              <button className="h-8 w-8 rounded bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[11px] text-[#191c1e] flex items-center justify-center">2</button>
              <button className="h-8 w-8 rounded bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[11px] text-[#191c1e] flex items-center justify-center">3</button>
              <button className="h-8 px-2 rounded bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#191c1e] text-[11px] font-medium">Next</button>
            </div>
            )}
          </div>
        </div>

        {/* RIGHT: Persistent Side Inspector (4 cols) */}
        {!selected ? (
          <div className="col-span-12 xl:col-span-4 bg-white rounded-xl p-4 shadow-sm text-[12px] text-[#4a5e88]">
            Select a business to inspect it.
          </div>
        ) : (
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-4 bg-white rounded-xl p-4 shadow-sm">
          {/* Inspector Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-xl text-[16px] font-bold flex items-center justify-center shadow-sm shrink-0 ${selected.initialsColor}`}>
                {selected.initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#0055c4]">Active Inspector</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#066cf4] animate-pulse" />
                </div>
                <div className="text-[15px] font-bold text-[#191c1e] mt-0.5 leading-tight">{selected.entityName}</div>
                <div className="text-[11px] text-[#4a5e88]">{selected.tradeName}</div>
                <div className="text-[10px] font-bold text-[#4a5e88] mt-0.5">{selected.kybId}</div>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${selected.stageBg} ${selected.stageText}`}>
              {selected.stage}
            </span>
          </div>

          {/* Verification checks (live) */}
          {live && (
            <div className="bg-[#f2f4f6] rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a5e88]">Verification Checks</span>
                <span className="text-[11px] font-bold text-[#191c1e] bg-white px-1.5 py-0.5 rounded">
                  {(detail.data?.status ?? selected.raw?.verificationStatus ?? 'unverified').replace(/_/g, ' ')}
                </span>
              </div>
              {detail.isLoading && <p className="text-[12px] text-[#4a5e88]">Loading checks…</p>}
              {detail.isError && <p className="text-[12px] text-[#ba1a1a]">Couldn't load the checks.</p>}
              {detail.data && detail.data.checks.length === 0 && (
                <p className="text-[12px] text-[#4a5e88]">The owner hasn't submitted any checks yet.</p>
              )}
              {(detail.data?.checks ?? []).map((check) => {
                const look = CHECK_STATUS[check.status] ?? CHECK_STATUS.pending;
                return (
                  <div key={check.id} className="py-1 border-b border-[#e6e8ea] last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[17px] ${look.color}`}>{look.icon}</span>
                        <span className="text-[12px] text-[#191c1e]">{CHECK_LABEL[check.kind] ?? check.kind}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-[#191c1e]">{look.label}</span>
                    </div>
                    {(check.recordName || check.maskedId) && (
                      <div className="text-[11px] text-[#4a5e88] ml-6">
                        {[check.recordName, check.maskedId].filter(Boolean).join(' • ')}
                      </div>
                    )}
                    {check.reasons.length > 0 && (
                      <div className="text-[11px] text-[#ba1a1a] ml-6">{check.reasons.join('; ')}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* KYB Scoring Suite (sample: mock mode only) */}
          {!live && (
          <div className="bg-[#f2f4f6] rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a5e88]">Automated Verification Suite</span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">96% Confident</span>
            </div>
            {[
              { icon: 'verified', color: 'text-emerald-700', label: 'CAC Corporate Entity Status', result: 'Active (LTD)' },
              { icon: 'verified', color: 'text-emerald-700', label: 'Registered Office Match', result: '96% Semantic Match' },
              { icon: 'verified', color: 'text-emerald-700', label: 'Director Identity & BVN Link', result: 'Passed (T. Alabi)' },
              { icon: 'near_me', color: 'text-amber-600', label: 'Store Geofence Pin Drift', result: '42m Offset Flag' },
            ].map((check, idx) => (
              <div key={idx} className="flex items-center justify-between py-1 border-b border-[#e6e8ea] last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-[17px] ${check.color}`}>{check.icon}</span>
                  <span className="text-[12px] text-[#191c1e]">{check.label}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase ${idx === 3 ? 'text-amber-800' : 'text-emerald-800'}`}>
                  {check.result}
                </span>
              </div>
            ))}
          </div>

          )}

          {/* Submitted documents (live) */}
          {live && (() => {
            const urls = Array.from(
              new Set([...(selected.raw?.documents ?? []), ...(detail.data?.checks ?? []).flatMap((c) => c.documentUrls)]),
            );
            return (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a5e88]">
                  Submitted Credentials ({urls.length})
                </span>
                {urls.length === 0 ? (
                  <p className="text-[12px] text-[#4a5e88]">No documents uploaded.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {urls.map((url, idx) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-[12px] text-[#066cf4] hover:underline truncate"
                      >
                        <span className="material-symbols-outlined text-[16px]">description</span>
                        Document {idx + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Document Previews (sample: mock mode only) */}
          {!live && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a5e88]">Submitted Credentials (3)</span>
              <button className="text-[11px] text-[#066cf4] hover:underline">Download All ZIP</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'CAC Certificate', sub: 'PDF • 2.4 MB', bg: 'bg-blue-100' },
                { label: 'FIRS Clearance', sub: 'JPG • 1.8 MB', bg: 'bg-green-100' },
                { label: 'Store Geotag', sub: 'EXIF Matched', bg: 'bg-amber-100' },
              ].map((doc, idx) => (
                <div key={idx} className={`relative rounded-lg overflow-hidden flex flex-col aspect-[4/5] shadow-sm cursor-pointer ${doc.bg}`}>
                  <div className="flex-1 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[32px] text-white/70">
                      {idx === 0 ? 'description' : idx === 1 ? 'receipt_long' : 'location_on'}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2d3133]/80 via-transparent to-transparent flex flex-col justify-end p-1.5">
                    <span className="text-[10px] text-white font-bold leading-tight">{doc.label}</span>
                    <span className="text-[9px] text-white/80">{doc.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          )}

          {/* Geofence Map Preview */}
          {!live && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a5e88]">Cluster Geofence Radius</span>
              <span className="text-[11px] text-[#4a5e88]">6.4392° N, 3.5281° E</span>
            </div>
            <div className="w-full h-28 rounded-lg bg-[#dae2fd]/50 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,#0055c4_0,#0055c4_1px,transparent_0,transparent_20px),repeating-linear-gradient(90deg,#0055c4_0,#0055c4_1px,transparent_0,transparent_20px)]" />
              </div>
              <div className="relative z-10 flex items-center gap-1.5 px-3 py-1 bg-white/90 rounded-full shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-[#0055c4]">location_on</span>
                <span className="text-[12px] font-medium text-[#191c1e]">{selected.cluster} (Within Cluster)</span>
              </div>
            </div>
          </div>

          )}

          {/* Owner (live) */}
          {live && (
            <div className="bg-[#f2f4f6]/60 rounded-lg p-3 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a5e88]">Account Owner</span>
              <div className="text-[12px] font-semibold text-[#191c1e]">
                {selected.raw?.ownerName ||
                  [selected.raw?.owner?.firstName, selected.raw?.owner?.lastName].filter(Boolean).join(' ') ||
                  NONE}
              </div>
              <div className="text-[11px] text-[#4a5e88]">
                {[selected.raw?.owner?.email, selected.raw?.owner?.phone || selected.raw?.phone].filter(Boolean).join(' • ') || NONE}
              </div>
              <div className="text-[11px] text-[#4a5e88]">{selected.address}</div>
            </div>
          )}

          {/* Managing Signatory (sample: mock mode only) */}
          {!live && (
          <div className="bg-[#f2f4f6]/60 rounded-lg p-3 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a5e88]">Managing Signatory</span>
            <div className="flex items-center justify-between mt-0.5">
              <div>
                <div className="text-[12px] font-semibold text-[#191c1e]">Chief Tunde Alabi</div>
                <div className="text-[11px] text-[#4a5e88]">+234 803 892 0144</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase text-emerald-700">BVN Verified</div>
                <div className="text-[11px] text-[#4a5e88]">NIN: 98102 ••••</div>
              </div>
            </div>
          </div>

          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              disabled={approve.isPending || reject.isPending}
              onClick={handleApprove.bind(null, selected)}
              className="w-full h-10 disabled:opacity-50 rounded-lg bg-[#066cf4] text-white text-[13px] font-semibold hover:bg-[#0055c4] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              {live ? 'Approve & Verify Business' : 'Approve Merchant & Issue Live Key'}
            </button>
            {/* No endpoint asks an owner for documents; rejecting lets them submit again. */}
            {!live && (
            <button
              onClick={handleRequest}
              className="w-full h-9 rounded-lg bg-[#f2f4f6] text-[#191c1e] text-[12px] font-medium hover:bg-[#e6e8ea] transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px] text-[#4a5e88]">upload_file</span>
              Request Documents
            </button>
            )}
            <button
              disabled={approve.isPending || reject.isPending}
              onClick={handleReject}
              className="w-full h-9 rounded-lg bg-[#ffdad6] text-[#93000a] text-[12px] font-medium hover:bg-[#ffb4ab] transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
              Reject with Notice
            </button>
          </div>
        </div>
        )}
      </div>

      {/* BOTTOM TELEMETRY CARDS (sample: mock mode only) */}
      {!live && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Verified Clusters */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0055c4] text-[20px]">hub</span>
              <span className="text-[14px] font-semibold text-[#191c1e]">Top Verified Clusters</span>
            </div>
            <button className="text-[11px] text-[#066cf4] hover:underline">View All</button>
          </div>
          {[
            { name: 'Lekki Peninsula Hub', count: 842, pct: 87 },
            { name: 'VI Central Commercial', count: 612, pct: 65 },
            { name: 'Ikeja Cargo Cluster', count: 488, pct: 52 },
            { name: 'Surulere Trade Mile', count: 312, pct: 33 },
          ].map((cluster, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#191c1e] font-medium">{cluster.name}</span>
                <span className="text-[#4a5e88]">{cluster.count}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#f2f4f6] overflow-hidden">
                <div className="h-full bg-[#066cf4] rounded-full transition-all" style={{ width: `${cluster.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* API Pipeline Gateway */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0055c4] text-[20px]">network_check</span>
              <span className="text-[14px] font-semibold text-[#191c1e]">API Pipeline Gateway</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Optimal (112ms)
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            {[
              { label: 'CAC Integration Uptime', value: '99.98%', color: 'text-[#191c1e]' },
              { label: 'TIN Webhook Rate', value: '1,420 / min', color: 'text-[#191c1e]' },
              { label: 'Auto-Pass Ratio', value: '89.4%', color: 'text-emerald-700' },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col text-center">
                <span className="text-[11px] text-[#4a5e88]">{stat.label}</span>
                <span className={`text-[15px] font-bold ${stat.color} mt-0.5`}>{stat.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-[#4a5e88] bg-[#f2f4f6] px-2 py-1 rounded">
            <span>Next scheduled schema reconciliation:</span>
            <span className="text-[#191c1e] font-medium">18:00 UTC</span>
          </div>
        </div>

        {/* Field Auditor Roster */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0055c4] text-[20px]">badge</span>
              <span className="text-[14px] font-semibold text-[#191c1e]">Field Auditor Roster</span>
            </div>
            <button className="text-[11px] text-[#066cf4] hover:underline font-medium">Rebalance</button>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {[
              { initials: 'DA', name: 'David Adeleke (Zone A)', count: '14 active audits', color: 'text-[#4a5e88]' },
              { initials: 'BO', name: 'Blessing Okafor (Zone B)', count: '11 active audits', color: 'text-[#4a5e88]' },
              { initials: 'MO', name: 'Michael O. (Super Lead)', count: '7 manual escalations', color: 'text-[#0055c4] font-medium' },
            ].map((auditor, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#e6e8ea] text-[#191c1e] flex items-center justify-center text-[10px] font-bold">
                    {auditor.initials}
                  </div>
                  <span className="text-[12px] text-[#191c1e] font-medium">{auditor.name}</span>
                </div>
                <span className={`text-[11px] ${auditor.color}`}>{auditor.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-[#4a5e88] border-t border-[#f2f4f6]">
            <span>Overall Queue Velocity</span>
            <span className="text-[#191c1e] font-medium">38 verifications / hr</span>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
