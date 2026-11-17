import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_SYSTEM_FEATURES,
  FEATURE_IDS,
  RECOMMENDED_FEATURES,
  applySystemDefaults,
  isFeatureLocked,
  mergeFeatureState,
  validateFeatureSelection,
  type FeatureId,
  type FeatureState,
} from '../scripts/businessFeatures';
import { DEFAULT_BUSINESS_ID, useBusinessOfferings } from './BusinessOfferingsContext';
import { useSystemDefaults } from './SystemDefaultsContext';

/**
 * Single source of truth for which VEMTAP tools a business has switched on.
 *
 * Persisted in `localStorage` under the same business-scoped key pattern as
 * `BusinessOfferingsContext`, so the selection survives refreshes and normal
 * navigation, stays tied to the signed-in business, and can later be swapped
 * for server-loaded preferences without changing any consumer.
 *
 * Products and Services are not duplicated here — they mirror the existing
 * business-offering rule in `BusinessOfferingsContext`, which already owns the
 * "at least one offering" validation and the catalogue records.
 */

const STORAGE_KEY = 'vemtap_business_features';
const STORAGE_VERSION = 1;

interface StoredFeatures {
  version: number;
  setupComplete: boolean;
  flags: Partial<FeatureState>;
}

function getBusinessStorageKey(bizId: string): string {
  return `vemtap_business_features_${bizId}`;
}

function readStoredFeatures(bizId: string): StoredFeatures | null {
  try {
    const scopedRaw = window.localStorage.getItem(getBusinessStorageKey(bizId));
    const raw =
      scopedRaw || (bizId === DEFAULT_BUSINESS_ID ? window.localStorage.getItem(STORAGE_KEY) : null);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredFeatures>;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      version: typeof parsed.version === 'number' ? parsed.version : STORAGE_VERSION,
      setupComplete: Boolean(parsed.setupComplete),
      flags: (parsed.flags ?? {}) as Partial<FeatureState>,
    };
  } catch {
    return null;
  }
}

function writeStoredFeatures(bizId: string, record: StoredFeatures): void {
  const raw = JSON.stringify(record);
  window.localStorage.setItem(getBusinessStorageKey(bizId), raw);
  if (bizId === DEFAULT_BUSINESS_ID) window.localStorage.setItem(STORAGE_KEY, raw);
}

export interface SaveFeaturesResult {
  success: boolean;
  error?: string;
}

export interface BusinessFeaturesContextValue {
  /** Applied selection — what the dashboard, navigation and quick actions render from. */
  features: FeatureState;
  /** Whether the owner has finished the initial "Set Up Your Business Dashboard" step. */
  setupComplete: boolean;
  isEnabled: (id: FeatureId) => boolean;
  /** Recommended selection, used to seed pickers — applied only when saved. */
  recommended: FeatureState;
  /**
   * Pages pinned on for every business by the platform admin. They read as
   * enabled everywhere and are rendered locked in the pickers.
   */
  systemDefaults: FeatureId[];
  /**
   * Validate and persist a selection, then make it the applied configuration.
   * Toggling a control never calls this — only an explicit save does.
   */
  saveFeatures: (next: FeatureState, options?: { completeSetup?: boolean }) => SaveFeaturesResult;
}

const BusinessFeaturesContext = createContext<BusinessFeaturesContextValue | null>(null);

/** Only flags are stored — Products/Services are owned by BusinessOfferingsContext. */
function pickFlags(features: FeatureState): Partial<FeatureState> {
  const flags: Partial<FeatureState> = {};
  FEATURE_IDS.forEach((id) => {
    if (id === 'products' || id === 'services') return;
    flags[id] = Boolean(features[id]);
  });
  return flags;
}

export function BusinessFeaturesProvider({ children }: { children: ReactNode }) {
  const { offerings, setOfferings, businessId } = useBusinessOfferings();
  const { systemDefaults } = useSystemDefaults();
  const [stored, setStored] = useState<StoredFeatures | null>(() => readStoredFeatures(DEFAULT_BUSINESS_ID));

  // Reload the record when the active business/account context changes.
  useEffect(() => {
    setStored(readStoredFeatures(businessId));
  }, [businessId]);

  // Products / Services follow the existing offering rule instead of a second copy.
  // Locked system features (chat, sms, email) always stay true.
  // Other user preferences (including toggling off) are strictly respected.
  const features = useMemo<FeatureState>(() => {
    // Nothing is hidden until the business has saved a selection of its own.
    const base = stored?.flags
      ? mergeFeatureState(stored.flags)
      : (Object.fromEntries(FEATURE_IDS.map((id) => [id, true])) as FeatureState);
    const applied = applySystemDefaults(base, systemDefaults);
    if (stored?.flags) {
      (Object.keys(stored.flags) as FeatureId[]).forEach((key) => {
        if (isFeatureLocked(key, systemDefaults)) {
          applied[key] = true;
        } else if (stored.flags[key] !== undefined) {
          applied[key] = Boolean(stored.flags[key]);
        }
      });
    }
    return {
      ...applied,
      products: offerings.hasProducts,
      services: offerings.hasServices,
    };
  }, [stored, offerings.hasProducts, offerings.hasServices, systemDefaults]);

  const isEnabled = useCallback((id: FeatureId) => Boolean(features[id]), [features]);

  const saveFeatures = useCallback(
    (next: FeatureState, options?: { completeSetup?: boolean }): SaveFeaturesResult => {
      const selection = { ...next };
      // System defaults (chat, sms, email) are locked on and cannot be switched off
      DEFAULT_SYSTEM_FEATURES.forEach((id) => {
        selection[id] = true;
      });
      systemDefaults.forEach((id) => {
        selection[id] = true;
      });
      const validationError = validateFeatureSelection(selection);
      if (validationError) return { success: false, error: validationError };

      // 1. Offering rule first — it has its own persistence and can reject.
      if (selection.products !== offerings.hasProducts || selection.services !== offerings.hasServices) {
        const offeringResult = setOfferings({ hasProducts: selection.products, hasServices: selection.services });
        if (!offeringResult.success) return { success: false, error: offeringResult.error };
      }

      // 2. Feature flags + setup completion for this business.
      const record: StoredFeatures = {
        version: STORAGE_VERSION,
        setupComplete: options?.completeSetup ? true : Boolean(stored?.setupComplete),
        flags: pickFlags(selection),
      };
      try {
        writeStoredFeatures(businessId, record);
      } catch {
        // Storage unavailable — the previously applied configuration stays active.
        return {
          success: false,
          error: 'We could not save your dashboard features. Your previous setup is still active — please try again.',
        };
      }

      setStored(record);
      return { success: true };
    },
    [
      businessId,
      offerings.hasProducts,
      offerings.hasServices,
      setOfferings,
      stored?.setupComplete,
    ],
  );

  const value = useMemo<BusinessFeaturesContextValue>(
    () => ({
      features,
      setupComplete: Boolean(stored?.setupComplete),
      isEnabled,
      recommended: applySystemDefaults(RECOMMENDED_FEATURES, systemDefaults),
      systemDefaults,
      saveFeatures,
    }),
    [features, stored?.setupComplete, isEnabled, systemDefaults, saveFeatures],
  );

  return <BusinessFeaturesContext.Provider value={value}>{children}</BusinessFeaturesContext.Provider>;
}

const FALLBACK_FEATURES = applySystemDefaults(mergeFeatureState(null), DEFAULT_SYSTEM_FEATURES);

/** Outside the provider every feature reads as enabled so shared UI never hides anything. */
export function useBusinessFeatures(): BusinessFeaturesContextValue {
  const context = useContext(BusinessFeaturesContext);
  if (!context) {
    return {
      features: FALLBACK_FEATURES,
      setupComplete: true,
      isEnabled: (id) => Boolean(FALLBACK_FEATURES[id]),
      recommended: applySystemDefaults(RECOMMENDED_FEATURES, DEFAULT_SYSTEM_FEATURES),
      systemDefaults: [...DEFAULT_SYSTEM_FEATURES],
      saveFeatures: () => ({ success: true }),
    };
  }
  return context;
}
