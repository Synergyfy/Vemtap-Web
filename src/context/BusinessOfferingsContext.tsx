import { createContext, useContext, useState, type ReactNode } from 'react';

export type OfferingType = 'products' | 'services';
export type OfferingMode = 'products' | 'services' | 'both';

export interface BusinessOfferings {
  hasProducts: boolean;
  hasServices: boolean;
}
/** Alias for BusinessOfferings – used in branch screens for convenience. */
export type OfferingsState = BusinessOfferings;

export interface BusinessOfferingsContextValue {
  offerings: BusinessOfferings;
  mode: OfferingMode;
  businessId: string;
  setBusinessId: (id: string) => void;
  setOfferings: (offerings: BusinessOfferings) => { success: boolean; error?: string };
  toggleOffering: (type: OfferingType) => { success: boolean; error?: string };
  /** Branch-level enabled offerings */
  getBranchOfferings: (branchKey: string) => OfferingType[];
  setBranchOfferings: (branchKey: string, offerings: OfferingsState | OfferingType[]) => void;
  /** Effective offerings available at branch (intersection of business support & branch enablement) */
  getEffectiveBranchOfferings: (branchKey: string) => OfferingType[];
}

const STORAGE_KEY = 'vemtap_business_offerings';
const BRANCH_STORAGE_KEY = 'vemtap_branch_offerings';
export const DEFAULT_BUSINESS_ID = 'urban-grill-bistro-104';

const DEFAULT_OFFERINGS: BusinessOfferings = {
  hasProducts: true,
  hasServices: false,
};

const DEFAULT_BRANCH_OFFERINGS: Record<string, OfferingType[]> = {
  'wuse-ii': ['products', 'services'],
  'maitama': ['products'],
  'victoria-island': ['products', 'services'],
};

function getBusinessStorageKey(bizId: string): string {
  return `vemtap_business_offerings_${bizId}`;
}

function readStoredOfferings(bizId: string = DEFAULT_BUSINESS_ID): BusinessOfferings {
  try {
    // 1. Check business-scoped key first
    const scopedRaw = window.localStorage.getItem(getBusinessStorageKey(bizId));
    // 2. Fall back to generic key if for default business
    const raw = scopedRaw || (bizId === DEFAULT_BUSINESS_ID ? window.localStorage.getItem(STORAGE_KEY) : null);
    if (!raw) return DEFAULT_OFFERINGS;
    const parsed = JSON.parse(raw) as Partial<BusinessOfferings>;
    const hasProducts = Boolean(parsed.hasProducts);
    const hasServices = Boolean(parsed.hasServices);
    // At least one must be true
    if (!hasProducts && !hasServices) return DEFAULT_OFFERINGS;
    return { hasProducts, hasServices };
  } catch {
    return DEFAULT_OFFERINGS;
  }
}

function readStoredBranchOfferings(): Record<string, OfferingType[]> {
  try {
    const raw = window.localStorage.getItem(BRANCH_STORAGE_KEY);
    if (!raw) return DEFAULT_BRANCH_OFFERINGS;
    return JSON.parse(raw) as Record<string, OfferingType[]>;
  } catch {
    return DEFAULT_BRANCH_OFFERINGS;
  }
}

export function getOfferingChangeMessage(prev: BusinessOfferings, next: BusinessOfferings): string {
  const productsChanged = prev.hasProducts !== next.hasProducts;
  const servicesChanged = prev.hasServices !== next.hasServices;

  if (!productsChanged && !servicesChanged) {
    return 'Business offerings saved successfully';
  }
  if (!productsChanged && servicesChanged) {
    return next.hasServices ? 'Services enabled successfully' : 'Services removed from your business menu';
  }
  if (productsChanged && !servicesChanged) {
    return next.hasProducts ? 'Products enabled successfully' : 'Products removed from your business menu';
  }
  // Both changed simultaneously
  if (next.hasServices && !next.hasProducts) {
    return 'Services enabled successfully; Products removed from your business menu';
  }
  if (next.hasProducts && !next.hasServices) {
    return 'Products enabled successfully; Services removed from your business menu';
  }
  return 'Business offerings updated successfully';
}

const BusinessOfferingsContext = createContext<BusinessOfferingsContextValue | null>(null);

export function BusinessOfferingsProvider({ children, initialBusinessId = DEFAULT_BUSINESS_ID }: { children: ReactNode; initialBusinessId?: string }) {
  const [businessId, setBusinessIdState] = useState<string>(initialBusinessId);
  const [offerings, setOfferingsState] = useState<BusinessOfferings>(() => readStoredOfferings(initialBusinessId));
  const [branchOfferingsMap, setBranchOfferingsMap] = useState<Record<string, OfferingType[]>>(readStoredBranchOfferings);

  const mode: OfferingMode =
    offerings.hasProducts && offerings.hasServices
      ? 'both'
      : offerings.hasServices
      ? 'services'
      : 'products';

  const setBusinessId = (id: string) => {
    setBusinessIdState(id);
    setOfferingsState(readStoredOfferings(id));
  };

  const setOfferings = (next: BusinessOfferings): { success: boolean; error?: string } => {
    if (!next.hasProducts && !next.hasServices) {
      return {
        success: false,
        error: 'At least one offering must remain enabled (Products or Services).',
      };
    }
    try {
      window.localStorage.setItem(getBusinessStorageKey(businessId), JSON.stringify(next));
      if (businessId === DEFAULT_BUSINESS_ID) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      setOfferingsState(next);
      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Failed to persist business offerings. Please try again.',
      };
    }
  };

  const toggleOffering = (type: OfferingType): { success: boolean; error?: string } => {
    const next = {
      hasProducts: type === 'products' ? !offerings.hasProducts : offerings.hasProducts,
      hasServices: type === 'services' ? !offerings.hasServices : offerings.hasServices,
    };
    if (!next.hasProducts && !next.hasServices) {
      return {
        success: false,
        error: 'You must keep at least one offering active. Businesses on VEMTAP must offer Products, Services, or Both.',
      };
    }
    return setOfferings(next);
  };

  const getBranchOfferings = (branchKey: string): OfferingType[] => {
    const normalized = branchKey.toLowerCase().trim().replace(/\s+/g, '-');
    if (branchOfferingsMap[branchKey]) {
      return branchOfferingsMap[branchKey];
    }
    if (branchOfferingsMap[normalized]) {
      return branchOfferingsMap[normalized];
    }
    // Default to business offerings
    const result: OfferingType[] = [];
    if (offerings.hasProducts) result.push('products');
    if (offerings.hasServices) result.push('services');
    return result.length > 0 ? result : ['products'];
  };

  const setBranchOfferings = (branchKey: string, newOfferings: OfferingsState | OfferingType[]) => {
    let types: OfferingType[];
    if (Array.isArray(newOfferings)) {
      types = newOfferings;
    } else {
      types = [];
      if (newOfferings.hasProducts) types.push('products');
      if (newOfferings.hasServices) types.push('services');
    }
    setBranchOfferingsMap((prev) => {
      const normalized = branchKey.toLowerCase().trim().replace(/\s+/g, '-');
      const next = { ...prev, [branchKey]: types, [normalized]: types };
      try {
        window.localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage unavailable
      }
      return next;
    });
  };

  const getEffectiveBranchOfferings = (branchKey: string): OfferingType[] => {
    const branchSpecific = getBranchOfferings(branchKey);
    // Intersection with what the business supports overall
    return branchSpecific.filter((type) =>
      type === 'products' ? offerings.hasProducts : offerings.hasServices,
    );
  };

  return (
    <BusinessOfferingsContext.Provider
      value={{
        offerings,
        mode,
        businessId,
        setBusinessId,
        setOfferings,
        toggleOffering,
        getBranchOfferings,
        setBranchOfferings,
        getEffectiveBranchOfferings,
      }}
    >
      {children}
    </BusinessOfferingsContext.Provider>
  );
}

export function useBusinessOfferings(): BusinessOfferingsContextValue {
  const context = useContext(BusinessOfferingsContext);
  if (!context) {
    const fallbackOfferings: BusinessOfferings = DEFAULT_OFFERINGS;
    return {
      offerings: fallbackOfferings,
      mode: 'products',
      businessId: DEFAULT_BUSINESS_ID,
      setBusinessId: () => {},
      setOfferings: () => ({ success: true }),
      toggleOffering: () => ({ success: true }),
      getBranchOfferings: () => ['products'],
      setBranchOfferings: () => {},
      getEffectiveBranchOfferings: () => ['products'],
    };
  }
  return context;
}
