import { api } from './api/client';

/** `/business/clusters/*` — the cluster system from the business side (Owner/Manager). */

export type ClusterKind = 'mall' | 'plaza' | 'market' | 'commercial-axis' | 'strip';
export type ShowcasePreference = 'all' | 'deals' | 'products' | 'services' | 'profile';

export interface ClusterCard {
  id: string;
  name: string;
  kind: string;
  type: string;
  city: string;
  state: string;
  address: string;
  coordinates: { lat: number; lng: number };
  radiusMeters: number;
  status: 'active' | 'review';
  description: string;
  createdAt: string;
}

export interface MyCluster extends ClusterCard {
  qrCode: { url: string; displayCode: string; scansTotal: number; isActive: boolean };
  stats: { totalBusinesses: number; activeBusinesses: number; totalDealsInPool: number; totalScans: number };
  membership: { branchId: string; joinedAt: string | null; showcase: ShowcasePreference };
}

export interface ClusterDetection {
  scenario: 'detected' | 'not_found' | 'already_joined';
  cluster: ClusterCard | null;
  reason?: string;
}

export interface ClusterMember {
  id: string;
  branchId: string;
  businessId: string;
  businessName: string;
  branchName: string;
  category: string | null;
  unitOrSuite: string;
  joinedAt: string;
  status: 'active' | 'suspended';
  isVerified: boolean;
  logoUrl: string | null;
  bannerUrl: string | null;
  phone: string;
  email: string;
  bio: string;
  dealsCount: number;
  isSelf: boolean;
}

export interface ClusterMemberDetail extends ClusterMember {
  hours: Record<string, unknown> | null;
  topOffers: Array<{ id: string; title: string; price: number }>;
}

export interface ShowcaseItem {
  id: string;
  entityType: 'deal' | 'product' | 'service';
  title: string;
  price: number;
  image: string;
  showInCluster: boolean;
}

export interface ClusterChatMessage {
  id: string;
  senderBranchId: string;
  recipientBranchId: string;
  text: string;
  timestamp: string;
  readAt: string | null;
  isSelf: boolean;
}

export interface ProposeClusterInput {
  name: string;
  kind: ClusterKind;
  address?: string;
  city?: string;
  state?: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  description?: string;
}

const scope = (branchId?: string) => (branchId ? { params: { branchId } } : undefined);

export const clustersService = {
  detect: (branchId?: string) => api.get<ClusterDetection>('/business/clusters/detect', scope(branchId)),
  mine: (branchId?: string) => api.get<MyCluster>('/business/clusters/mine', scope(branchId)),
  join: (clusterId: string, branchId?: string) =>
    api.post<MyCluster>(`/business/clusters/${clusterId}/join`, branchId ? { branchId } : {}),
  leave: (branchId?: string) => api.post<{ success: true }>('/business/clusters/leave', branchId ? { branchId } : {}),
  propose: (input: ProposeClusterInput, branchId?: string) =>
    api.post<MyCluster>('/business/clusters', { ...input, ...(branchId ? { branchId } : {}) }),
  members: (clusterId: string, query: { q?: string; page?: number; limit?: number; branchId?: string } = {}) =>
    api.get<{ data: ClusterMember[]; total: number; page: number; limit: number }>(`/business/clusters/${clusterId}/members`, {
      params: { ...query },
    }),
  member: (clusterId: string, memberBranchId: string, branchId?: string) =>
    api.get<ClusterMemberDetail>(`/business/clusters/${clusterId}/members/${memberBranchId}`, scope(branchId)),
  showcase: (branchId?: string) =>
    api.get<{ branchId: string; inCluster: boolean; preference: ShowcasePreference; items: ShowcaseItem[] }>(
      '/business/clusters/showcase',
      scope(branchId),
    ),
  updateShowcase: (items: Array<{ type: ShowcaseItem['entityType']; id: string; show: boolean }>, branchId?: string) =>
    api.put<{ updated: number; ignored: number }>('/business/clusters/showcase', { items, ...(branchId ? { branchId } : {}) }),
  setPreference: (showcase: ShowcasePreference, branchId?: string) =>
    api.patch<{ showcase: ShowcasePreference }>('/business/clusters/preferences', { showcase, ...(branchId ? { branchId } : {}) }),
  chat: (clusterId: string, otherBranchId: string, branchId?: string) =>
    api.get<{ data: ClusterChatMessage[]; hasMore: boolean }>(`/business/clusters/${clusterId}/chats/${otherBranchId}`, scope(branchId)),
  send: (clusterId: string, otherBranchId: string, body: string, branchId?: string) =>
    api.post<ClusterChatMessage>(`/business/clusters/${clusterId}/chats/${otherBranchId}`, { body, ...(branchId ? { branchId } : {}) }),
};
