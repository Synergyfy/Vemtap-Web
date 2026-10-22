import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
import { CategoriesPanel } from '../components/business/CategoriesPanel';

export function BusinessCategoriesScreen({ onBack }: { onBack: () => void }) {
  return (
    <BusinessSubScreen title="Categories" onBack={onBack}>
      <CategoriesPanel />
    </BusinessSubScreen>
  );
}
