import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_SYSTEM_FEATURES,
  normalizeSystemDefaults,
  type FeatureId,
} from '../scripts/businessFeatures';

/**
 * Platform-wide list of dashboard pages that are system defaults.
 *
 * A system default is switched on for every business and cannot be turned off
 * in Business Settings › Manage Features — the owner sees the row, locked on.
 * The set is chosen by the platform admin on Platform Admin › Dashboard system
 * defaults (`/admin/dashboard-features`) and, unlike the per-business feature
 * selection, it is not scoped to a business: one list drives every workspace.
 *
 * Frontend only — persisted in `localStorage` under the platform key and
 * isolated here so it can later be swapped for a server-loaded setting
 * without touching any consumer.
 */

const STORAGE_KEY = 'vemtap_platform_system_defaults';
const STORAGE_VERSION = 1;

interface StoredSystemDefaults {
  version: number;
  features: FeatureId[];
}

function readStoredSystemDefaults(): FeatureId[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_SYSTEM_FEATURES];
    const parsed = JSON.parse(raw) as Partial<StoredSystemDefaults>;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.features)) {
      return [...DEFAULT_SYSTEM_FEATURES];
    }
    return normalizeSystemDefaults(parsed.features);
  } catch {
    return [...DEFAULT_SYSTEM_FEATURES];
  }
}

function writeStoredSystemDefaults(features: FeatureId[]): boolean {
  try {
    const record: StoredSystemDefaults = { version: STORAGE_VERSION, features };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export interface SaveSystemDefaultsResult {
  success: boolean;
  error?: string;
}

export interface SystemDefaultsContextValue {
  /** Pages pinned on for every business, in dashboard order. */
  systemDefaults: FeatureId[];
  isSystemDefault: (id: FeatureId) => boolean;
  /** Validate and persist the admin's selection, then apply it everywhere. */
  saveSystemDefaults: (features: FeatureId[]) => SaveSystemDefaultsResult;
}

const SystemDefaultsContext = createContext<SystemDefaultsContextValue | null>(null);

export function SystemDefaultsProvider({ children }: { children: ReactNode }) {
  const [systemDefaults, setSystemDefaults] = useState<FeatureId[]>(readStoredSystemDefaults);

  const isSystemDefault = useCallback((id: FeatureId) => systemDefaults.includes(id), [systemDefaults]);

  const saveSystemDefaults = useCallback((features: FeatureId[]): SaveSystemDefaultsResult => {
    const normalized = normalizeSystemDefaults(features);
    if (!writeStoredSystemDefaults(normalized)) {
      return {
        success: false,
        error: 'We could not save the system defaults. The previous list is still active — please try again.',
      };
    }
    setSystemDefaults(normalized);
    return { success: true };
  }, []);

  const value = useMemo<SystemDefaultsContextValue>(
    () => ({ systemDefaults, isSystemDefault, saveSystemDefaults }),
    [systemDefaults, isSystemDefault, saveSystemDefaults],
  );

  return <SystemDefaultsContext.Provider value={value}>{children}</SystemDefaultsContext.Provider>;
}

/** Outside the provider the shipped defaults apply, so nothing ever renders unlocked by accident. */
export function useSystemDefaults(): SystemDefaultsContextValue {
  const context = useContext(SystemDefaultsContext);
  if (!context) {
    return {
      systemDefaults: [...DEFAULT_SYSTEM_FEATURES],
      isSystemDefault: (id) => DEFAULT_SYSTEM_FEATURES.includes(id),
      saveSystemDefaults: () => ({ success: true }),
    };
  }
  return context;
}
