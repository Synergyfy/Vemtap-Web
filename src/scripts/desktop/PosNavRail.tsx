import { BusinessSectionNavRail } from './BusinessSectionNavRail';

interface PosNavRailProps {
  active?: string;
  onSelect?: (key: string) => void;
  headerHeight?: '16' | '20';
}

/**
 * The POS side menu rendered beside the collapsed business rail in POS mode.
 */
export function PosNavRail({ active, onSelect, headerHeight = '16' }: PosNavRailProps) {
  return <BusinessSectionNavRail sectionKey="pos" groupLabel="Point of Sale" active={active} onSelect={onSelect} headerHeight={headerHeight} />;
}
