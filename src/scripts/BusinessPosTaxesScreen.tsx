import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
import { TaxesPanel } from '../components/business/TaxesPanel';

export function BusinessPosTaxesScreen({ onBack }: { onBack: () => void }) {
  return (
    <BusinessSubScreen title="Taxes & Surcharges" onBack={onBack} subtitle="VAT, dining fees and QR ordering rules used on every ticket.">
      <TaxesPanel />
    </BusinessSubScreen>
  );
}
