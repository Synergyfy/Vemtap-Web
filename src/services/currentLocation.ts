import type { LocationPlace } from '../context/LocationContext';
import { geocodingService } from './geocodingService';

/** A place the customer can browse from: an area name plus city and coordinates. */
export interface PickedPlace extends LocationPlace {
  district: string;
}

export const LOCATION_DENIED = 'Location access is off. Allow it in your browser, or pick your area below.';
export const LOCATION_UNAVAILABLE = "Couldn't get your location. Try again or pick your area below.";
export const AREA_NOT_FOUND = "We couldn't find that area. Try a nearby landmark or district.";
export const SEARCH_UNAVAILABLE = "Location search isn't available right now. Try again shortly.";
export const AREA_UNNAMED = "Couldn't name your area. Showing deals near you.";
/** The district used when the API can't name the customer's position. */
export const UNNAMED_DISTRICT = 'Current location';

const currentPosition = () =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error(LOCATION_UNAVAILABLE));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => reject(new Error(error.code === error.PERMISSION_DENIED ? LOCATION_DENIED : LOCATION_UNAVAILABLE)),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  });

/**
 * The browser's position, named by the API. Throws a customer-facing message
 * when the browser can't or won't share it; when only the naming fails the
 * coordinates are still returned (as "Current location") so distance
 * filtering keeps working.
 */
export async function getCurrentPlace(): Promise<PickedPlace> {
  const { coords } = await currentPosition();
  const lat = Number(coords.latitude.toFixed(5));
  const lng = Number(coords.longitude.toFixed(5));
  const named = await geocodingService.reverse(lat, lng).catch(() => null);
  return {
    district: named?.district || named?.city || UNNAMED_DISTRICT,
    city: named?.city || undefined,
    lat,
    lng,
  };
}

/**
 * The API's match for a typed area, or null when there is none. Throws when
 * the search itself fails, so an outage isn't reported as a bad search.
 */
export async function findPlace(query: string): Promise<PickedPlace | null> {
  const text = query.trim();
  if (!text) return null;
  let found;
  try {
    found = await geocodingService.search(text);
  } catch {
    throw new Error(SEARCH_UNAVAILABLE);
  }
  if (!found) return null;
  return { district: found.district || text, city: found.city || undefined, lat: found.lat, lng: found.lng };
}
