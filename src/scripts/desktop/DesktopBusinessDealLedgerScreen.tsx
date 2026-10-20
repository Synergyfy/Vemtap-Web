import { DealLedgerPanel } from '../../components/business/DealLedgerPanel';
import { DesktopBusinessPage } from './DesktopBusinessPage';

export function DesktopBusinessDealLedgerScreen({ onNav }: { onNav: (key: string) => void }) {
  return (
    <DesktopBusinessPage
      activeNav="business-deal-ledger"
      onNav={onNav}
      crumbs={[{ label: 'Deals', onClick: () => onNav('business-deals') }, { label: 'Redemption Ledger' }]}
      title="Deal Redemption Ledger"
      subtitle="Every claim on your deals, from claim to redemption, with revenue and discount totals."
    >
      <DealLedgerPanel />
    </DesktopBusinessPage>
  );
}
