import { BusinessSectionNavRail } from './BusinessSectionNavRail';

interface MessagesNavRailProps {
  active?: string;
  onSelect?: (key: string) => void;
  headerHeight?: '16' | '20';
}

/**
 * The Messages side menu rendered beside the collapsed business rail in
 * Messages mode.
 */
export function MessagesNavRail({ active, onSelect, headerHeight = '16' }: MessagesNavRailProps) {
  return <BusinessSectionNavRail sectionKey="messages" groupLabel="Channels" active={active} onSelect={onSelect} headerHeight={headerHeight} />;
}