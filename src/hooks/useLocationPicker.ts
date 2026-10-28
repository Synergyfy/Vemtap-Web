import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, type LocationPlace } from '../context/LocationContext';
import { hasApiConfig } from '../services/api/client';
import { geocodingService } from '../services/geocodingService';

/** The place being chosen in the location sheet. */
export interface PickedPlace extends LocationPlace {
  district: string;
}

const DENIED = 'Location access is off. Allow it in your browser, or pick your area below.';
const UNAVAILABLE = "Couldn't get your location. Try again or pick your area below.";
const NOT_FOUND = "We couldn't find that area. Try a nearby landmark or district.";

const currentPosition = () =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error(UNAVAILABLE));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, (error) => reject(new Error(error.code === error.PERMISSION_DENIED ? DENIED : UNAVAILABLE)), {
      enableHighAccuracy: false,
      timeout: 10_000,
      maximumAge: 5 * 60_000,
    });
  });

/**
 * Live location picking for the Location & Radius sheets: Auto-Detect from the
 * browser (named by the API), typed areas looked up by the API, and a toast
 * for anything that fails. Demo mode (`live` false) leaves the sheets alone.
 */
export function useLocationPicker(open: boolean) {
  const live = hasApiConfig();
  const current = useLocation();
  const [place, setPlace] = useState<PickedPlace>({
    district: current.district,
    city: current.city,
    lat: current.lat,
    lng: current.lng,
  });
  const [detecting, setDetecting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  // Each opening starts from the location currently in use.
  useEffect(() => {
    if (!open) return;
    setPlace({ district: current.district, city: current.city, lat: current.lat, lng: current.lng });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  /** Finds the browser's position and names it; null (with a toast) on failure. */
  const detect = useCallback(async (): Promise<PickedPlace | null> => {
    setDetecting(true);
    try {
      const { coords } = await currentPosition();
      const lat = Number(coords.latitude.toFixed(5));
      const lng = Number(coords.longitude.toFixed(5));
      const named = await geocodingService.reverse(lat, lng).catch(() => null);
      const next: PickedPlace = {
        district: named?.district || named?.city || 'Your location',
        city: named?.city || undefined,
        lat,
        lng,
      };
      setPlace(next);
      return next;
    } catch (error) {
      showToast(error instanceof Error && error.message ? error.message : UNAVAILABLE);
      return null;
    } finally {
      setDetecting(false);
    }
  }, [showToast]);

  /**
   * The place to apply for what's in the search box: the picked place when
   * unchanged, otherwise the API's match for the typed area (null + toast).
   */
  const resolve = useCallback(async (typed: string): Promise<PickedPlace | null> => {
    const text = typed.trim();
    if (!text || text.toLowerCase() === place.district.toLowerCase()) return place;
    setSearching(true);
    try {
      const found = await geocodingService.search(text).catch(() => null);
      if (!found) {
        showToast(NOT_FOUND);
        return null;
      }
      const next: PickedPlace = {
        district: found.district || text,
        city: found.city || undefined,
        lat: found.lat,
        lng: found.lng,
      };
      setPlace(next);
      return next;
    } finally {
      setSearching(false);
    }
  }, [place, showToast]);

  return { live, place, detecting, searching, toast, detect, resolve };
}
