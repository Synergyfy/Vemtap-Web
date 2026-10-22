import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
import { DealLedgerPanel } from '../components/business/DealLedgerPanel';

export function BusinessDealLedgerScreen({ onBack }: { onBack: () => void }) {
  return (
    <BusinessSubScreen title="Redemption Ledger" onBack={onBack} subtitle="Every claim on your deals, from claim to redemption.">
      <DealLedgerPanel />
    </BusinessSubScreen>
  );
}
