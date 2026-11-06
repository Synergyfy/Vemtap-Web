import { AdminCampaignsAnnouncementsScreen } from './AdminCampaignsAnnouncementsScreen';
import { AdminAdsManagementScreen } from './AdminAdsManagementScreen';
import { AdminAdPerformanceScreen } from './AdminAdPerformanceScreen';

interface AdminMarketingScreenProps {
  onNavigate: (path: string) => void;
  subpage?: 'campaigns' | 'ads' | 'performance' | 'slots' | 'broadcasts';
}

export function AdminMarketingScreen({ onNavigate, subpage = 'campaigns' }: AdminMarketingScreenProps) {
  // Normalize subpage prop
  const currentTab = subpage === 'ads' || subpage === 'slots'
    ? 'ads'
    : subpage === 'performance' || subpage === 'broadcasts'
    ? 'performance'
    : 'campaigns';

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] w-full mx-auto">
      {/* Subpages Tabs Nav */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-[12px] border border-slate-200/80">
          <button
            onClick={() => onNavigate('/admin/marketing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              currentTab === 'campaigns'
                ? 'bg-white text-[#0055c4] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">campaign</span>
            <span>Campaigns &amp; Announcements</span>
          </button>
          <button
            onClick={() => onNavigate('/admin/marketing/ads')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              currentTab === 'ads'
                ? 'bg-white text-[#0055c4] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">ads_click</span>
            <span>Ads Management</span>
          </button>
          <button
            onClick={() => onNavigate('/admin/marketing/performance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              currentTab === 'performance'
                ? 'bg-white text-[#0055c4] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">monitoring</span>
            <span>Ad Performance</span>
          </button>
        </div>
      </div>

      {/* Render selected view */}
      {currentTab === 'campaigns' && <AdminCampaignsAnnouncementsScreen onNavigate={onNavigate} />}
      {currentTab === 'ads' && <AdminAdsManagementScreen onNavigate={onNavigate} />}
      {currentTab === 'performance' && <AdminAdPerformanceScreen onNavigate={onNavigate} />}
    </div>
  );
}
