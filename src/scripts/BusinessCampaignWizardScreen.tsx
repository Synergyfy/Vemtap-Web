import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
import { CampaignWizard } from '../components/business/CampaignWizard';

export function BusinessCampaignWizardScreen({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  return (
    <BusinessSubScreen title="Create Campaign" onBack={onBack}>
      <CampaignWizard onExit={onBack} onDone={onDone} />
    </BusinessSubScreen>
  );
}
