import { AdminAnalyticsPlatformPerformance } from './AdminAnalyticsPlatformPerformance';
import { AdminAnalyticsGrowth } from './AdminAnalyticsGrowth';
import { AdminAnalyticsClusters } from './AdminAnalyticsClusters';
import { AdminAnalyticsDealsPerformance } from './AdminAnalyticsDealsPerformance';
import { AdminAnalyticsRevenueReports } from './AdminAnalyticsRevenueReports';

export type AnalyticsSubpage =
  | 'platform-performance'
  | 'customer-and-business-growth'
  | 'deals-and-discovery-performance'
  | 'clusters-and-locations-performance'
  | 'revenue-and-advertising-reports';

interface AdminAnalyticsScreenProps {
  onNavigate: (path: string) => void;
  subpage?: AnalyticsSubpage;
}

const TABS: { id: AnalyticsSubpage; label: string; icon: string; path: string }[] = [
  { id: 'platform-performance', label: 'Platform Performance', icon: 'speed', path: '/admin/analytics' },
  { id: 'customer-and-business-growth', label: 'Customer & Business Growth', icon: 'trending_up', path: '/admin/analytics/growth' },
  { id: 'deals-and-discovery-performance', label: 'Deals & Discovery Performance', icon: 'local_offer', path: '/admin/analytics/deals' },
  { id: 'clusters-and-locations-performance', label: 'Clusters & Locations Performance', icon: 'location_on', path: '/admin/analytics/clusters' },
  { id: 'revenue-and-advertising-reports', label: 'Revenue & Advertising Reports', icon: 'payments', path: '/admin/analytics/revenue' },
];

function resolveSubpage(subpage?: AnalyticsSubpage): AnalyticsSubpage {
  if (!subpage || subpage === 'platform-performance') return 'platform-performance';
  return subpage;
}

export function AdminAnalyticsScreen({ onNavigate, subpage }: AdminAnalyticsScreenProps) {
  const activeSubpage = resolveSubpage(subpage);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] w-full mx-auto">
      {/* Workspace Sub-Header & Global Tab Navigator */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-semibold border border-slate-200/80 overflow-x-auto w-full sm:w-auto">
          {TABS.map(tab => {
            const isActive = activeSubpage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.path)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#0055c4] shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Analytics View */}
      {activeSubpage === 'platform-performance' && <AdminAnalyticsPlatformPerformance onNavigate={onNavigate} />}
      {activeSubpage === 'customer-and-business-growth' && <AdminAnalyticsGrowth onNavigate={onNavigate} />}
      {activeSubpage === 'deals-and-discovery-performance' && <AdminAnalyticsDealsPerformance onNavigate={onNavigate} />}
      {activeSubpage === 'clusters-and-locations-performance' && <AdminAnalyticsClusters onNavigate={onNavigate} />}
      {activeSubpage === 'revenue-and-advertising-reports' && <AdminAnalyticsRevenueReports onNavigate={onNavigate} />}
    </div>
  );
}
