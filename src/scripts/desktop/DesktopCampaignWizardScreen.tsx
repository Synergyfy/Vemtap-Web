import { CampaignWizard } from '../../components/business/CampaignWizard';
import { DesktopBusinessPage } from './DesktopBusinessPage';

export function DesktopCampaignWizardScreen({ onNav, onExit, onDone }: { onNav: (key: string) => void; onExit: () => void; onDone: () => void }) {
  return (
    <DesktopBusinessPage
      activeNav="more-marketing"
      onNav={onNav}
      crumbs={[{ label: 'Marketing & Growth', onClick: () => onNav('more-marketing') }, { label: 'Create Campaign' }]}
      title="Create Campaign"
      subtitle="Promote your deals, products or profile across VemTap discovery feeds."
    >
      <CampaignWizard onExit={onExit} onDone={onDone} />
    </DesktopBusinessPage>
  );
}
