import { api } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';

/** An area and city from `GET /public/geocode/reverse`. */
export interface GeocodedPlace {
  district: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

/** A typed area's coordinates from `GET /public/geocode/search`. */
export interface GeocodedPoint extends GeocodedPlace {
  lat: number;
  lng: number;
}

/** The API answers `null` when no provider knows the place. */
const orNull = <T>(value: unknown): T | null =>
  value && typeof value === 'object' ? (value as T) : null;

export const geocodingService = {
  reverse: async (lat: number, lng: number) =>
    orNull<GeocodedPlace>(await api.get<unknown>(API_ENDPOINTS.public.reverseGeocode, { params: { lat, lng } })),

  search: async (q: string) =>
    orNull<GeocodedPoint>(await api.get<unknown>(API_ENDPOINTS.public.searchGeocode, { params: { q } })),
};
