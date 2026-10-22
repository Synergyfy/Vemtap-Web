import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
import { IntelligencePanel } from '../components/business/IntelligencePanel';

export function BusinessIntelligenceScreen({ onBack }: { onBack: () => void }) {
  return (
    <BusinessSubScreen title="Vemtap Intelligence" onBack={onBack}>
      <IntelligencePanel />
    </BusinessSubScreen>
  );
}
