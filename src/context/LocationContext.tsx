import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Shared customer location + radius selection.
 *
 * The header is the single source of truth: every screen (Home, Deals,
 * dashboard…) reads `district`/`radius` from here, and the location/radius
 * modal reports back through `setLocation`. Previously each screen kept its own
 * modal-open flag and the chosen district was thrown away on Apply.
 *
 * Backend gap: there is no `GET /deals?near=&radius=` endpoint yet; the
 * selected values drive client-side filtering only.
 */

export interface LocationContextValue {
  district: string;
  city: string;
  radius: number;
  setLocation: (district: string, radius: number) => void;
}

const STORAGE_KEY = 'vemtap_location';
const DEFAULTS = { district: 'Your area', city: 'Your city', radius: 5 };

type StoredLocation = { district?: string; city?: string; radius?: number };

const readLocation = (): StoredLocation => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredLocation;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [stored] = useState<StoredLocation>(readLocation);
  const [district, setDistrict] = useState(stored.district?.trim() || DEFAULTS.district);
  const city = stored.city?.trim() || DEFAULTS.city;
  const [radius, setRadius] = useState(
    typeof stored.radius === 'number' && stored.radius > 0 ? stored.radius : DEFAULTS.radius,
  );

  const setLocation = useCallback((nextDistrict: string, nextRadius: number) => {
    const cleanDistrict = nextDistrict.trim() || DEFAULTS.district;
    const cleanRadius = Number.isFinite(nextRadius) && nextRadius > 0 ? nextRadius : DEFAULTS.radius;
    setDistrict(cleanDistrict);
    setRadius(cleanRadius);
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ district: cleanDistrict, city, radius: cleanRadius }),
      );
    } catch {
      // storage unavailable; selection stays in memory
    }
  }, [city]);

  const value = useMemo<LocationContextValue>(
    () => ({ district, city, radius, setLocation }),
    [district, city, radius, setLocation],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within a LocationProvider');
  return ctx;
}
