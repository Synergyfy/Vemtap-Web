import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Shared customer location + radius selection.
 *
 * The header is the single source of truth: every screen (Home, Deals,
 * dashboard…) reads the location from here, and the location/radius sheet
 * reports back through `setLocation`. With coordinates (Auto-Detect or a typed
 * area the API found), feeds ask for deals and businesses nearest first within
 * the radius; without them the district is a label only.
 */

/** Where the customer is browsing from, beyond the district label. */
export interface LocationPlace {
  city?: string;
  lat?: number;
  lng?: number;
}

export interface LocationContextValue {
  district: string;
  city: string;
  radius: number;
  lat?: number;
  lng?: number;
  hasCoordinates: boolean;
  setLocation: (district: string, radius: number, place?: LocationPlace) => void;
}

const STORAGE_KEY = 'vemtap_location';
const DEFAULTS = { district: 'Your area', city: 'Your city', radius: 5 };

type StoredLocation = { district?: string; city?: string; radius?: number; lat?: number; lng?: number };

const isCoordinate = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

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
  const [city, setCity] = useState(stored.city?.trim() || DEFAULTS.city);
  const [radius, setRadius] = useState(
    typeof stored.radius === 'number' && stored.radius > 0 ? stored.radius : DEFAULTS.radius,
  );
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(
    isCoordinate(stored.lat) && isCoordinate(stored.lng) ? { lat: stored.lat, lng: stored.lng } : null,
  );

  const setLocation = useCallback((nextDistrict: string, nextRadius: number, place?: LocationPlace) => {
    const cleanDistrict = nextDistrict.trim() || DEFAULTS.district;
    const cleanRadius = Number.isFinite(nextRadius) && nextRadius > 0 ? nextRadius : DEFAULTS.radius;
    const cleanCity = place?.city?.trim() || DEFAULTS.city;
    // A district picked without coordinates replaces the old point: the
    // header and the feeds must describe the same place.
    const nextPoint = isCoordinate(place?.lat) && isCoordinate(place?.lng) ? { lat: place.lat, lng: place.lng } : null;
    setDistrict(cleanDistrict);
    setRadius(cleanRadius);
    setCity(cleanCity);
    setPoint(nextPoint);
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ district: cleanDistrict, city: cleanCity, radius: cleanRadius, ...(nextPoint ?? {}) }),
      );
    } catch {
      // storage unavailable; selection stays in memory
    }
  }, []);

  const value = useMemo<LocationContextValue>(
    () => ({
      district,
      city,
      radius,
      lat: point?.lat,
      lng: point?.lng,
      hasCoordinates: point !== null,
      setLocation,
    }),
    [district, city, radius, point, setLocation],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within a LocationProvider');
  return ctx;
}

/**
 * Query params for the public deal/business feeds: nearest first within the
 * radius when the customer has coordinates, nothing otherwise.
 */
export function useLocationQuery(): Record<string, string | number> {
  const { lat, lng, radius } = useLocation();
  return useMemo((): Record<string, string | number> => {
    if (lat === undefined || lng === undefined) return {};
    return { lat, lng, radius, sortBy: 'nearest' };
  }, [lat, lng, radius]);
}

/** "850 m" / "1.2 km" for a feed's `distanceKm`, or undefined without one. */
export function formatDistanceKm(value: unknown): string | undefined {
  const km = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
  if (!Number.isFinite(km) || km < 0) return undefined;
  return km < 1 ? `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m` : `${km.toFixed(1)} km`;
}
