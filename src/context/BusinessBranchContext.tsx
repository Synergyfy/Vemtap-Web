import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Icon } from '../components/ui/Icon';

export interface BusinessBranchData {
  key: string;
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
  switchTo: (key: string) => void;
}

const BusinessBranchContext = createContext<BusinessBranchContextValue | null>(null);

export function BusinessBranchProvider({ children }: { children: ReactNode }) {
  const [branchKey, setBranchKey] = useState('wuse-ii');
  const [switching, setSwitching] = useState(false);

  const switchTo = useCallback(
    (key: string) => {
      if (key === branchKey) return;
      setSwitching(true);
      window.setTimeout(() => {
        setBranchKey(key);
        setSwitching(false);
      }, 900);
    },
    [branchKey],
  );

  const branch = BUSINESS_BRANCHES.find((option) => option.key === branchKey) ?? BUSINESS_BRANCHES[0];

  return (
    <BusinessBranchContext.Provider value={{ branch, branches: BUSINESS_BRANCHES, switching, switchTo }}>
      {children}
    </BusinessBranchContext.Provider>
  );
}

export function useBusinessBranch(): BusinessBranchContextValue {
  const context = useContext(BusinessBranchContext);
  if (!context) {
    const branch = BUSINESS_BRANCHES[0];
    return { branch, branches: BUSINESS_BRANCHES, switching: false, switchTo: () => {} };
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
