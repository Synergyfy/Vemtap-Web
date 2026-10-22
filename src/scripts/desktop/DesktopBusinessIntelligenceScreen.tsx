import { IntelligencePanel } from '../../components/business/IntelligencePanel';
import { DesktopBusinessPage } from './DesktopBusinessPage';

export function DesktopBusinessIntelligenceScreen({ onNav }: { onNav: (key: string) => void }) {
  return (
    <DesktopBusinessPage
      activeNav="more-intelligence"
      onNav={onNav}
      crumbs={[{ label: 'Analytics', onClick: () => onNav('more-analytics') }, { label: 'Vemtap Intelligence' }]}
      title="Vemtap Intelligence"
      subtitle="Live performance across your business, compared with the previous period, with what to act on."
    >
      <IntelligencePanel />
    </DesktopBusinessPage>
  );
}
