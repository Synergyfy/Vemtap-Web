import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
import { ReviewsPanel } from '../components/business/ReviewsPanel';

export function BusinessReviewsScreen({ onBack }: { onBack: () => void }) {
  return (
    <BusinessSubScreen title="Reviews & Reputation" onBack={onBack}>
      <ReviewsPanel />
    </BusinessSubScreen>
  );
}
