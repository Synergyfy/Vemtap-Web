import { AdminClusterManagementScreen } from './AdminClusterManagementScreen';
import { AdminLocationHierarchyScreen } from './AdminLocationHierarchyScreen';
import { AdminClusterMapScreen } from './AdminClusterMapScreen';

export interface AdminLocationsScreenProps {
  onNavigate: (path: string) => void;
  subpage?: 'clusters' | 'geofencing' | 'fleet' | 'hierarchy' | 'map';
}

export function AdminLocationsScreen({ onNavigate, subpage = 'clusters' }: AdminLocationsScreenProps) {
  if (subpage === 'hierarchy') {
    return <AdminLocationHierarchyScreen />;
  }

  if (subpage === 'map') {
    return <AdminClusterMapScreen />;
  }

  // Default to Cluster Management
  return <AdminClusterManagementScreen onNavigate={onNavigate} />;
}
