import { ReviewsPanel } from '../../components/business/ReviewsPanel';
import { DesktopBusinessPage } from './DesktopBusinessPage';

export function DesktopBusinessReviewsScreen({ onNav }: { onNav: (key: string) => void }) {
  return (
    <DesktopBusinessPage
      activeNav="more-reviews"
      onNav={onNav}
      crumbs={[{ label: 'More' }, { label: 'Reviews & Reputation' }]}
      title="Reviews & Reputation"
      subtitle="Approve what customers should see, reply publicly, or take a review down."
    >
      <ReviewsPanel />
    </DesktopBusinessPage>
  );
}
