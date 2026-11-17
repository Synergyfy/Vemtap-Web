import { useEffect, useRef, useState } from 'react';
import { hasApiConfig } from '../../services/api/client';
import { geocodingService, type GeocodedPlace } from '../../services/geocodingService';

export type LookupStatus = 'idle' | 'locating' | 'searching' | 'resolved' | 'not-found' | 'error';

/** Typing pauses this long before the address is looked up. */
const SEARCH_DELAY_MS = 600;
const MIN_QUERY_LENGTH = 3;

const DENIED = 'Location access is off. Allow it in your browser, or type your address.';
const UNAVAILABLE = "Couldn't get your location. Try again or type your address.";

const position = () =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error(UNAVAILABLE));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => reject(new Error(error.code === error.PERMISSION_DENIED ? DENIED : UNAVAILABLE)),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  });

/** "Wuse 2, Abuja, FCT" from whatever parts the API named. */
export const placeLabel = (place: GeocodedPlace | null) =>
  place ? [place.district, place.city, place.state].filter((part, i, all) => part && all.indexOf(part) === i).join(', ') : '';

/**
 * Territory lookup for the business-location step: GPS → `GET /public/geocode/reverse`,
 * typed address → `GET /public/geocode/search` (debounced). Holds the resolved
 * area and the coordinates the step saves. Disabled without an API.
 */
export function useBusinessLocationLookup(query: string) {
  const live = hasApiConfig();
  const [place, setPlace] = useState<GeocodedPlace | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [status, setStatus] = useState<LookupStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  // Latest request wins; earlier answers that land late are dropped.
  const requestId = useRef(0);
  // Text the GPS fill wrote into the search box — not re-searched.
  const filledQuery = useRef<string | null>(null);

  useEffect(() => {
    if (!live) return;
    const text = query.trim();
    if (text === filledQuery.current) return;
    if (text.length < MIN_QUERY_LENGTH) return;
    const id = ++requestId.current;
    const timer = window.setTimeout(async () => {
      setStatus('searching');
      setMessage(null);
      try {
        const found = await geocodingService.search(text);
        if (id !== requestId.current) return;
        if (!found) {
          setStatus('not-found');
          setMessage("We couldn't find that address. Try adding the area or city.");
          return;
        }
        setPlace(found);
        setCoords({ latitude: found.lat, longitude: found.lng });
        setStatus('resolved');
      } catch {
        if (id !== requestId.current) return;
        setStatus('error');
        setMessage("Address search isn't available right now. You can still continue.");
      }
    }, SEARCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [live, query]);

  /**
   * Pins the device position and names its area. Resolves with the label to
   * show in the search box (empty when the area couldn't be named).
   */
  const locate = async (): Promise<string> => {
    const id = ++requestId.current;
    setStatus('locating');
    setMessage(null);
    let fix: GeolocationPosition;
    try {
      fix = await position();
    } catch (error) {
      if (id === requestId.current) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : UNAVAILABLE);
      }
      return '';
    }
    const latitude = Number(fix.coords.latitude.toFixed(6));
    const longitude = Number(fix.coords.longitude.toFixed(6));
    if (id !== requestId.current) return '';
    setCoords({ latitude, longitude });
    if (!live) {
      setStatus('resolved');
      return '';
    }
    const named = await geocodingService.reverse(latitude, longitude).catch(() => null);
    if (id !== requestId.current) return '';
    setPlace(named);
    setStatus(named ? 'resolved' : 'not-found');
    if (!named) setMessage('Location pinned, but we couldn’t name the area. Add your street address below.');
    const label = placeLabel(named);
    filledQuery.current = label;
    return label;
  };

  return { live, place, coords, status, message, locate };
}
