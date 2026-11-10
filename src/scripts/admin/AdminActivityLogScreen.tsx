import { useState, useMemo } from 'react';
import { hasApiConfig } from '../../services/api/client';
import type { AdminAuditLog } from '../../services/adminService';
import { formatCount, NONE } from './adminLive';
import { adminErrorMessage, useAdminAuditLogs } from './useAdminData';

interface AdminActivityLogScreenProps {
  onNavigate: (path: string) => void;
}

type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'SECURITY';

interface AdminActivityRecord {
  id: string;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  adminRole: string;
  action: string;
  /** Sample categories in mock mode; the backend module (BUSINESSES, PAYMENTS…) against the API. */
  category: string;
  severity: AuditSeverity;
  targetEntity: string;
  targetId: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  details: string;
  hash: string;
}

const LIVE_MODULES = ['ALL', 'BUSINESSES', 'BRANCHES', 'PAYMENTS', 'SETTINGS', 'TICKETS', 'MESSAGING', 'LOYALTY', 'VISITORS', 'REPORTS'] as const;

function toActivity(log: AdminAuditLog): AdminActivityRecord {
  const actorName =
    [log.actor?.firstName, log.actor?.lastName].filter(Boolean).join(' ').trim() || log.actor?.email || 'System';
  const payload = log.payload ? JSON.stringify(log.payload) : '';
  return {
    id: log.id.slice(0, 8).toUpperCase(),
    timestamp: new Date(log.createdAt).toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    adminName: actorName,
    adminEmail: log.actor?.email ?? NONE,
    adminRole: log.actor?.role ?? NONE,
    action: `${log.method} ${log.endpoint}`,
    category: log.module,
    severity: log.impersonationTokenId ? 'SECURITY' : log.statusCode >= 500 ? 'CRITICAL' : log.statusCode >= 400 ? 'WARNING' : 'INFO',
    targetEntity: log.business?.name ?? log.branch?.name ?? NONE,
    targetId: (log.businessId ?? log.branchId ?? '').slice(0, 8).toUpperCase() || NONE,
    ipAddress: log.ipAddress ?? NONE,
    userAgent: log.userAgent ?? NONE,
    location: NONE,
    details: `HTTP ${log.statusCode}${log.impersonationTokenId ? ' • while impersonating' : ''}${payload ? ` • ${payload.length > 600 ? `${payload.slice(0, 600)}…` : payload}` : ''}`,
    hash: '',
  };
}

const ACTIVITY_LOGS: AdminActivityRecord[] = [
  {
    id: 'log_9011',
    timestamp: 'Today, 14:10:22 WAT',
    adminName: 'Michael O.',
    adminEmail: 'michael.o@vemtap.com',
    adminRole: 'Super Admin',
    action: 'Approved KYB Clearance Tier Upgrade',
    category: 'KYB_COMPLIANCE',
    severity: 'INFO',
    targetEntity: 'Slot Electronics Flagship',
    targetId: 'BIZ-IKJ-001',
    ipAddress: '197.210.54.12',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: 'Lagos, Nigeria',
    details: 'Verified CAC Form CAC-7 and Director BVN matches with NIBSS database. Granted Platinum Enterprise tier gating.',
    hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
  },
  {
    id: 'log_9010',
    timestamp: 'Today, 13:42:05 WAT',
    adminName: 'Amina Bello',
    adminEmail: 'amina.b@vemtap.com',
    adminRole: 'Finance Controller',
    action: 'Dual-Authorizer Escrow Sweep Release',
    category: 'ESCROW',
    severity: 'SECURITY',
    targetEntity: 'Merchant Escrow Sweep Batch #441',
    targetId: 'SWP-2024-441',
    ipAddress: '102.89.34.88',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    location: 'Abuja, Nigeria',
    details: 'Authorized release of ₦14,850,000 across 38 merchant settlement accounts following T+1 clearing protocol verification.',
    hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  {
    id: 'log_9009',
    timestamp: 'Today, 11:25:14 WAT',
    adminName: 'Sarah Kalu',
    adminEmail: 'sarah.k@vemtap.com',
    adminRole: 'Compliance Officer',
    action: 'Quarantined Disputed Escrow Funds',
    category: 'DISPUTES',
    severity: 'WARNING',
    targetEntity: 'Dispute Case DSP-2024-8841',
    targetId: 'DSP-2024-8841',
    ipAddress: '105.112.98.204',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6)',
    location: 'Lagos, Nigeria',
    details: 'Placed administrative freeze on ₦24,500 pending dispute adjudication between customer and Mega Seafood Hub.',
    hash: 'sha256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
  },
  {
    id: 'log_9008',
    timestamp: 'Yesterday, 19:15:00 WAT',
    adminName: 'David Nwosu',
    adminEmail: 'david.n@vemtap.com',
    adminRole: 'Operations Lead',
    action: 'Updated Geofence Spatial Boundary',
    category: 'SYSTEM_CONFIG',
    severity: 'INFO',
    targetEntity: 'Victoria Island Food Strip Cluster',
    targetId: 'CLST-VI-004',
    ipAddress: '197.210.44.91',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: 'Lagos, Nigeria',
    details: 'Expanded geofence polygon north boundary to include Adeola Odeku corridor (+450 meters).',
    hash: 'sha256:ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
  },
  {
    id: 'log_9007',
    timestamp: 'Yesterday, 16:04:12 WAT',
    adminName: 'Chidi Okonkwo',
    adminEmail: 'chidi.o@vemtap.com',
    adminRole: 'Support Specialist',
    action: 'OTA Firmware Rollback Pushed',
    category: 'SYSTEM_CONFIG',
    severity: 'CRITICAL',
    targetEntity: 'Smart POS Terminal #PX-99214',
    targetId: 'POS-IKJ-003',
    ipAddress: '102.89.22.19',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    location: 'Lagos, Nigeria',
    details: 'Initiated remote firmware rollback from v3.8.4 to v3.8.3b due to NFC antenna impedance timeout ticket TKT-89021.',
    hash: 'sha256:a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
  },
  {
    id: 'log_9006',
    timestamp: '1 Nov 2024, 08:30:10 WAT',
    adminName: 'System Engine Daemon',
    adminEmail: 'daemon@engine.vemtap.internal',
    adminRole: 'Automated Daemon',
    action: 'Automatic Direct Debit Batch Dispatched',
    category: 'ESCROW',
    severity: 'INFO',
    targetEntity: 'NIBSS Direct Debit Mandates',
    targetId: 'MND-BATCH-2024-11',
    ipAddress: '10.0.4.1 (Internal Gateway)',
    userAgent: 'VemtapCron/4.2.0',
    location: 'Core Edge Cloud',
    details: 'Dispatched 3,618 auto-renewal mandates for monthly subscription recurring debits.',
    hash: 'sha256:5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
  },
  {
    id: 'log_9005',
    timestamp: '31 Oct 2024, 21:12:00 WAT',
    adminName: 'Michael O.',
    adminEmail: 'michael.o@vemtap.com',
    adminRole: 'Super Admin',
    action: 'Invited New Admin Member',
    category: 'AUTH',
    severity: 'SECURITY',
    targetEntity: 'Admin Credentials Desk',
    targetId: 'ADM-INV-992',
    ipAddress: '197.210.54.12',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: 'Lagos, Nigeria',
    details: 'Dispatched credential invite to chidi.o@vemtap.com with Support Specialist RBAC role and mandatory TOTP 2FA.',
    hash: 'sha256:4ca35177423cb5e30b425959956c46b1348345738652b6ca3592913e99b77252',
  },
];

export function AdminActivityLogScreen({ onNavigate: _onNavigate }: AdminActivityLogScreenProps) {
  const live = hasApiConfig();
  const [mockLogs] = useState(ACTIVITY_LOGS);
  const [mockSelected, setMockSelected] = useState<AdminActivityRecord>(ACTIVITY_LOGS[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Live API: the audit trail, filtered by module on the server.
  const logsQuery = useAdminAuditLogs({ module: live && categoryFilter !== 'ALL' ? categoryFilter : undefined, page, limit: 50 });
  const liveLogs = useMemo(() => (logsQuery.data?.data ?? []).map(toActivity), [logsQuery.data]);
  const logs = live ? liveLogs : mockLogs;
  const lastPage = Math.max(1, logsQuery.data?.meta.lastPage ?? 1);
  const selectedLog: AdminActivityRecord | undefined = live ? liveLogs.find((l) => l.id === selectedId) ?? liveLogs[0] : mockSelected;
  const setSelectedLog = (log: AdminActivityRecord) => (live ? setSelectedId(log.id) : setMockSelected(log));

  const exportCsv = () => {
    const header = ['Time', 'Actor', 'Email', 'Role', 'Action', 'Module', 'Status', 'Target', 'IP'];
    const rows = filteredLogs.map((l) => [l.timestamp, l.adminName, l.adminEmail, l.adminRole, l.action, l.category, l.details.split(' • ')[0], l.targetEntity, l.ipAddress]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `vemtap-admin-audit-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchCat = live || categoryFilter === 'ALL' || log.category === categoryFilter;
      const matchSearch =
        log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.targetEntity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.targetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [live, logs, categoryFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-sm">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-base text-[#0055c4]">receipt_long</span>
            <span>{live ? 'Admin Audit Log' : 'Immutable Security Audit Ledger // WORM Compliant'}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">Administrative Actions & System Governance Trail</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {live
              ? `${formatCount(logsQuery.data?.meta.total)} recorded actions by admins and agents.`
              : 'Every administrative action, financial override, and credential change is cryptographically hashed and stamped.'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
{!live && (
<>
          <button
            onClick={() => showToast('Audit ledger signature verified against platform root key.')}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <span>Verify Signature</span>
          </button>
</>
)}
          <button
            onClick={() => (live ? exportCsv() : showToast('Audit trail exported as cryptographically signed CSV.'))}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 7 cols Log List + 5 cols Entry Cryptographic Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Filter & Log Table (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-4">
          {/* Search & Categories */}
          <div className="space-y-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-base">search</span>
              <input
                type="text"
                placeholder="Search administrator name, action, IP or entity..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0055c4] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {(live ? LIVE_MODULES : (['ALL', 'AUTH', 'ESCROW', 'KYB_COMPLIANCE', 'SYSTEM_CONFIG', 'DISPUTES'] as const)).map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoryFilter(cat);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                    categoryFilter === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {live && lastPage > 1 && (
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Page {page} of {lastPage}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page >= lastPage}
                  className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Records Table */}
          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {live && filteredLogs.length === 0 && (
              <p className="p-6 text-center text-xs text-slate-500">
                {logsQuery.isLoading
                  ? 'Loading the audit log…'
                  : logsQuery.isError
                    ? `Couldn't load the audit log: ${adminErrorMessage(logsQuery.error)}`
                    : 'No actions recorded.'}
              </p>
            )}
            {filteredLogs.map(log => {
              const isSelected = log.id === selectedLog?.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-[#0055c4] shadow-xs ring-1 ring-[#0055c4]/20'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                        <span className="material-symbols-outlined text-base">
                          {log.category === 'ESCROW' ? 'payments' : log.category === 'AUTH' ? 'lock' : log.category === 'KYB_COMPLIANCE' ? 'verified' : log.category === 'DISPUTES' ? 'gavel' : 'settings'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{log.action}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-[11px] text-slate-600 font-medium">{log.adminName}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Target: <span className="font-semibold text-slate-700">{log.targetEntity}</span> ({log.targetId})</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                          <span>{log.ipAddress}</span>
                          <span>•</span>
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-700'
                          : log.severity === 'SECURITY'
                          ? 'bg-purple-100 text-purple-700'
                          : log.severity === 'WARNING'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {log.severity}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">{log.category}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Cryptographic Audit Inspector (5 cols) */}
        {!selectedLog ? (
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs text-xs text-slate-500">
            Select an entry to inspect it.
          </div>
        ) : (
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#0055c4]">{selectedLog.id}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                selectedLog.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {selectedLog.severity}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-1.5">{selectedLog.action}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{selectedLog.timestamp}</p>
          </div>

          {/* Administrator Actor Details */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium text-slate-500">Initiating Actor:</span>
              <span className="font-semibold text-slate-900">{selectedLog.adminName}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium text-slate-500">Credential / Email:</span>
              <span className="font-mono text-slate-800">{selectedLog.adminEmail}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium text-slate-500">RBAC Role:</span>
              <span className="font-semibold text-indigo-700">{selectedLog.adminRole}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium text-slate-500">Network IP & Geo:</span>
              <span>{live ? selectedLog.ipAddress : `${selectedLog.ipAddress} (${selectedLog.location})`}</span>
            </div>
          </div>

          {/* Action Context & Narrative */}
          <div className="space-y-1.5 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500 block">Action Details</span>
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-slate-800 leading-relaxed">
              {selectedLog.details}
            </div>
          </div>

          {/* Cryptographic Proof Card */}
          <div className="space-y-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500 block">
              {live ? 'Client' : 'Cryptographic Chain Stamping'}
            </span>
            <div className="p-3 bg-slate-900 text-slate-300 rounded-xl space-y-2 font-mono text-[11px]">
              {!live && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">SHA-256 Ledger Digest:</span>
                  <span className="text-emerald-400 break-all">{selectedLog.hash}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Client Agent:</span>
                <span className="text-slate-200 break-all">{selectedLog.userAgent}</span>
              </div>
            </div>
          </div>

{!live && (
<>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Immutable ledger log v4.2</span>
            <button
              onClick={() => showToast(`Audit signature for ${selectedLog.id} verified.`)}
              className="text-xs font-semibold text-[#0055c4] hover:underline flex items-center gap-1"
            >
              <span>Validate Ledger Block</span>
              <span className="material-symbols-outlined text-xs">check_circle</span>
            </button>
          </div>
</>
)}
        </div>
        )}
      </div>
    </div>
  );
}

