import { AdminSupportRequestsScreen } from './AdminSupportRequestsScreen';
import { AdminComplaintsDisputesScreen } from './AdminComplaintsDisputesScreen';
import { AdminPlatformSettingsScreen } from './AdminPlatformSettingsScreen';
import { AdminActivityLogScreen } from './AdminActivityLogScreen';

export type SettingsSubpage = 'support' | 'disputes' | 'platform' | 'audit' | 'team';

interface AdminSettingsScreenProps {
  onNavigate: (path: string) => void;
  subpage?: SettingsSubpage;
}

const TABS: { id: SettingsSubpage; label: string; icon: string; path: string }[] = [
  { id: 'support', label: 'Support Requests', icon: 'support_agent', path: '/admin/settings/support' },
  { id: 'disputes', label: 'Complaints & Disputes', icon: 'gavel', path: '/admin/settings/disputes' },
  { id: 'platform', label: 'Platform Settings', icon: 'tune', path: '/admin/settings' },
  { id: 'audit', label: 'Admin Activity Log', icon: 'history_edu', path: '/admin/settings/audit' },
];

function resolveSubpage(subpage?: SettingsSubpage): SettingsSubpage {
  if (!subpage || subpage === 'platform' || subpage === 'team') return 'platform';
  return subpage;
}

export function AdminSettingsScreen({ onNavigate, subpage = 'support' }: AdminSettingsScreenProps) {
  const activeSubpage = resolveSubpage(subpage);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] w-full mx-auto">
      {/* Header Zone */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase text-slate-500 tracking-wider font-semibold">
            <span>Governance &amp; Support Ops</span>
            <span>•</span>
            <span className="text-[#0055c4]">System Control Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Support, Disputes &amp; Platform Governance
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Resolve merchant and customer tickets, adjudicate platform disputes, configure global parameters, and inspect immutable audit ledgers.
          </p>
        </div>

        {/* Subpage Ribbon Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-[12px] shrink-0 border border-slate-200/80 overflow-x-auto">
          {TABS.map(tab => {
            const isActive = activeSubpage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#0055c4] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Content Views */}
      {activeSubpage === 'support' && <AdminSupportRequestsScreen onNavigate={onNavigate} />}
      {activeSubpage === 'disputes' && <AdminComplaintsDisputesScreen onNavigate={onNavigate} />}
      {activeSubpage === 'platform' && <AdminPlatformSettingsScreen onNavigate={onNavigate} />}
      {activeSubpage === 'audit' && <AdminActivityLogScreen onNavigate={onNavigate} />}
    </div>
  );
}
