import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { hasApiConfig } from '../services/api/client';
import {
  AREA_NOT_FOUND,
  AREA_UNNAMED,
  LOCATION_UNAVAILABLE,
  UNNAMED_DISTRICT,
  findPlace,
  getCurrentPlace,
  type PickedPlace,
} from '../services/currentLocation';

export type { PickedPlace };

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
      const next = await getCurrentPlace();
      setPlace(next);
      // The coordinates still filter the feeds; say why the area has no name.
      if (next.district === UNNAMED_DISTRICT) showToast(AREA_UNNAMED);
      return next;
    } catch (error) {
      showToast(error instanceof Error && error.message ? error.message : LOCATION_UNAVAILABLE);
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
      const next = await findPlace(text);
      if (!next) {
        showToast(AREA_NOT_FOUND);
        return null;
      }
      setPlace(next);
      return next;
    } catch (error) {
      showToast(error instanceof Error ? error.message : AREA_NOT_FOUND);
      return null;
    } finally {
      setSearching(false);
    }
  }, [place, showToast]);

  return { live, place, detecting, searching, toast, detect, resolve };
}
