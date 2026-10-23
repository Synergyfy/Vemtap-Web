import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
import { AnalyticsExportPanel } from '../components/business/AnalyticsExportPanel';
import { IntelligencePanel, type IntelligenceTab } from '../components/business/IntelligencePanel';
import { DesktopBusinessPage } from './desktop/DesktopBusinessPage';

/** Live analytics on one area — mobile. */
export function LiveAnalyticsScreen({ tab, onBack, onExport }: { tab: IntelligenceTab; onBack: () => void; onExport: () => void }) {
  return (
    <BusinessSubScreen title="Analytics" onBack={onBack}>
      <IntelligencePanel key={tab} initialTab={tab} onExport={onExport} />
    </BusinessSubScreen>
  );
}

/** Live analytics on one area — desktop. */
export function DesktopLiveAnalyticsScreen({ tab, onNav, onExport }: { tab: IntelligenceTab; onNav: (key: string) => void; onExport: () => void }) {
  return (
    <DesktopBusinessPage
      activeNav="more-analytics"
      onNav={onNav}
      crumbs={[{ label: 'Analytics' }]}
      title="Analytics"
      subtitle="Live performance for the period, compared with the one before."
    >
      <IntelligencePanel key={tab} initialTab={tab} onExport={onExport} />
    </DesktopBusinessPage>
  );
}

/** Live analytics export — mobile. */
export function LiveAnalyticsExportScreen({ onBack }: { onBack: () => void }) {
  return (
    <BusinessSubScreen title="Export report" onBack={onBack}>
      <AnalyticsExportPanel />
    </BusinessSubScreen>
  );
}

/** Live analytics export — desktop. */
export function DesktopLiveAnalyticsExportScreen({ onNav, onBack }: { onNav: (key: string) => void; onBack: () => void }) {
  return (
    <DesktopBusinessPage
      activeNav="more-analytics"
      onNav={onNav}
      crumbs={[{ label: 'Analytics', onClick: onBack }, { label: 'Export' }]}
      title="Export report"
      subtitle="Download your analytics as a PDF report or a CSV spreadsheet."
    >
      <AnalyticsExportPanel />
    </DesktopBusinessPage>
  );
}
