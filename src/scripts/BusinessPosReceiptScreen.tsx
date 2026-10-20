import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
import { ReceiptPanel } from '../components/business/ReceiptPanel';

export function BusinessPosReceiptScreen({ onBack }: { onBack: () => void }) {
  return (
    <BusinessSubScreen title="Receipt Settings" onBack={onBack} subtitle="What prints on every receipt, paper width and when the printer fires.">
      <ReceiptPanel />
    </BusinessSubScreen>
  );
}
