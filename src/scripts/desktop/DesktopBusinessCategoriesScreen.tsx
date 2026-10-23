import { CategoriesPanel } from '../../components/business/CategoriesPanel';
import { DesktopBusinessPage } from './DesktopBusinessPage';

export function DesktopBusinessCategoriesScreen({ onNav }: { onNav: (key: string) => void }) {
  return (
    <DesktopBusinessPage
      activeNav="business-categories"
      onNav={onNav}
      crumbs={[{ label: 'Products & Services', onClick: () => onNav('business-catalog') }, { label: 'Categories' }]}
      title="Catalogue Categories"
      subtitle="Group your products and services and set the order customers see them in."
    >
      <CategoriesPanel />
    </DesktopBusinessPage>
  );
}
