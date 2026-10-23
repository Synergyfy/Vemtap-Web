import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Icon } from '../components/ui/Icon';
import { useMyBusiness } from '../hooks/business/useMyBusiness';
import type { ProfileBranch } from '../services/businessService';

export interface BusinessBranchData {
  key: string;
  /** Backend branch UUID — only set for live branches, never for the demo ones. */
  id?: string;
  isMainBranch?: boolean;
  name: string;
  shortName: string;
  area: string;
  stats: {
    orders: string;
    revenue: string;
    revenueDelta: string;
    bookings: string;
    unread: string;
    customers: string;
    newCustomers: string;
  };
}

export const BUSINESS_BRANCHES: BusinessBranchData[] = [
  {
    key: 'wuse-ii',
    name: 'Wuse II Branch',
    shortName: 'Wuse II',
    area: 'Wuse II, Abuja',
    stats: {
      orders: '8',
      revenue: '₦142,500',
      revenueDelta: '+18% this week',
      bookings: '5',
      unread: '2',
      customers: '482',
      newCustomers: '38',
    },
  },
  {
    key: 'maitama',
    name: 'Maitama Branch',
    shortName: 'Maitama',
    area: 'Maitama, Abuja',
    stats: {
      orders: '5',
      revenue: '₦96,800',
      revenueDelta: '+9% this week',
      bookings: '3',
      unread: '1',
      customers: '214',
      newCustomers: '12',
    },
  },
  {
    key: 'victoria-island',
    name: 'Victoria Island Branch',
    shortName: 'Victoria Island',
    area: 'Victoria Island, Lagos',
    stats: {
      orders: '11',
      revenue: '₦188,300',
      revenueDelta: '+24% this week',
      bookings: '7',
      unread: '4',
      customers: '326',
      newCustomers: '21',
    },
  },
];

interface BusinessBranchContextValue {
  branch: BusinessBranchData;
  branches: BusinessBranchData[];
  switching: boolean;
  /**
   * Whether the signed-in user may move between locations. Single-site staff
   * only see their own branch, so the header switcher degrades to a read-only
   * "you are here" card instead of a list of branches.
   */
  canSwitchLocations: boolean;
  switchTo: (key: string) => void;
  /** UUID of the active live branch, for branch-scoped API calls; undefined in demo mode. */
  activeBranchId?: string;
  /** True when the branches came from `GET /businesses/my-business`. */
  isLive: boolean;
}

const BRANCH_KEY = 'vemtap_active_branch';
const EMPTY_STATS: BusinessBranchData['stats'] = {
  orders: '—',
  revenue: '—',
  revenueDelta: '',
  bookings: '—',
  unread: '—',
  customers: '—',
  newCustomers: '—',
};

const readStoredBranch = () => {
  try {
    return window.localStorage.getItem(BRANCH_KEY);
  } catch {
    return null;
  }
};

const toBranchData = (branch: ProfileBranch): BusinessBranchData => ({
  key: branch.id,
  id: branch.id,
  isMainBranch: branch.isMainBranch === true,
  name: branch.name,
  shortName: branch.name.replace(/\s+branch$/i, ''),
  area: [branch.address, branch.city].filter(Boolean).join(', ') || branch.state || '',
  // Per-branch figures come from the dashboard query, not the branch list.
  stats: EMPTY_STATS,
});

const BusinessBranchContext = createContext<BusinessBranchContextValue | null>(null);

export function BusinessBranchProvider({
  children,
  canSwitchLocations = true,
}: {
  children: ReactNode;
  /** Set false for staff scoped to a single location. Defaults to true. */
  canSwitchLocations?: boolean;
}) {
  const myBusiness = useMyBusiness();
  const liveBranches = useMemo(
    () => (myBusiness.data?.branches ?? []).filter((b) => b.id && b.isActive !== false).map(toBranchData),
    [myBusiness.data],
  );
  const isLive = liveBranches.length > 0;
  // Never mix sample branches into a live business: their keys would reach branch-scoped APIs.
  const branches = isLive ? liveBranches : BUSINESS_BRANCHES;

  const [branchKey, setBranchKey] = useState<string>(() => readStoredBranch() ?? 'wuse-ii');
  const [switching, setSwitching] = useState(false);

  const switchTo = useCallback(
    (key: string) => {
      if (key === branchKey) return;
      setSwitching(true);
      window.setTimeout(() => {
        setBranchKey(key);
        try {
          window.localStorage.setItem(BRANCH_KEY, key);
        } catch {
          // storage unavailable — selection lasts for this session only
        }
        setSwitching(false);
      }, 900);
    },
    [branchKey],
  );

  const branch =
    branches.find((option) => option.key === branchKey) ?? branches.find((option) => option.isMainBranch) ?? branches[0];

  return (
    <BusinessBranchContext.Provider
      value={{ branch, branches, switching, canSwitchLocations, switchTo, activeBranchId: branch.id, isLive }}
    >
      {children}
    </BusinessBranchContext.Provider>
  );
}

export function useBusinessBranch(): BusinessBranchContextValue {
  const context = useContext(BusinessBranchContext);
  if (!context) {
    const branch = BUSINESS_BRANCHES[0];
    return {
      branch,
      branches: BUSINESS_BRANCHES,
      switching: false,
      canSwitchLocations: true,
      switchTo: () => {},
      isLive: false,
    };
  }
  return context;
}

export function BranchSwitchOverlay() {
  const { switching, branch, branches } = useBusinessBranch();
  const [label, setLabel] = useState(branch.name);

  useEffect(() => {
    if (switching) setLabel(branch.name);
  }, [switching, branch.name]);

  if (!switching) return null;
  const next = branches.find((option) => option.key !== branch.key);

  return (
    <div className="fixed inset-0 z-[80] bg-surface/85 backdrop-blur-md flex items-center justify-center pointer-events-auto">
      <div className="mx-margin w-full max-w-[300px] bg-surface-canvas rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full bg-surface-tint-blue animate-pulse" />
          <div className="relative w-16 h-16 rounded-full bg-surface-tint-blue flex items-center justify-center">
            <Icon name="storefront" filled className="text-primary text-[30px]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md">
            <Icon name="progress_activity" className="animate-spin text-on-primary text-[15px]" />
          </div>
        </div>
        <p className="font-label-md text-label-md font-semibold text-text-primary">Loading {label} details…</p>
        <p className="font-caption text-caption text-text-secondary mt-1">
          Refreshing orders, messages & catalogue for {next?.name ?? 'your branch'}
        </p>
        <div className="w-full h-1.5 rounded-full bg-surface-container mt-4 overflow-hidden">
          <div className="h-full w-1/2 rounded-full bg-primary-container animate-pulse" />
        </div>
      </div>
    </div>
  );
}
