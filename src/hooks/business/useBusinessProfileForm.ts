import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { businessService, type MyBusiness } from '../../services/businessService';
import { myBusinessKeys, useMyBusiness } from './useMyBusiness';

/** The storefront fields the owner edits in the Business Profile studio. */
export interface BusinessProfileForm {
  name: string;
  description: string;
  phone: string;
  officialEmail: string;
  website: string;
  /** Social handles keyed by platform (`instagram`, `x`, …); WhatsApp lives in `whatsappNumber`. */
  socials: Record<string, string>;
  whatsappNumber: string;
  amenities: string[];
  isVisible: boolean;
}

const DEMO_PROFILE: BusinessProfileForm = {
  name: 'Urban Grill & Bistro',
  description:
    'Premium casual dining and woodfire grill serving Lagos and Abuja. Famous for dry-aged steaks, artisan burgers, and handcrafted mocktails.',
  phone: '+234 803 900 2210',
  officialEmail: 'contact@urbangrill.ng',
  website: '',
  socials: { instagram: 'urbangrillbistro', x: 'urbangrill_ng' },
  whatsappNumber: '',
  amenities: ['Dine-In', 'Takeaway', 'Delivery', 'Free Wi-Fi', 'Valet Parking', 'Accessible', 'Outdoor Deck', 'POS Terminal', 'Instant Bank', 'Cash Settled'],
  isVisible: true,
};

const fromBusiness = (b: MyBusiness): BusinessProfileForm => ({
  name: b.name ?? '',
  description: b.description ?? '',
  phone: b.phone ?? '',
  officialEmail: b.officialEmail ?? '',
  website: b.website ?? '',
  socials: { ...(b.socials ?? {}) },
  whatsappNumber: b.whatsappNumber ?? '',
  amenities: [...(b.amenities ?? [])],
  isVisible: b.isVisible !== false,
});

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Loads the owner's business (or the demo profile), tracks edits and saves
 * only the changed fields with `PATCH /businesses/my-business` (Owner only).
 */
export function useBusinessProfileForm() {
  const live = hasApiConfig();
  const queryClient = useQueryClient();
  const business = useMyBusiness();
  const [saved, setSaved] = useState<BusinessProfileForm>(DEMO_PROFILE);
  const [form, setForm] = useState<BusinessProfileForm>(DEMO_PROFILE);

  // Reset the form whenever a fresh copy of the business arrives.
  useEffect(() => {
    if (!business.data) return;
    const next = fromBusiness(business.data);
    setSaved(next);
    setForm(next);
  }, [business.data]);

  const diff = (next: BusinessProfileForm) => {
    const patch: Partial<BusinessProfileForm> = {};
    (Object.keys(next) as (keyof BusinessProfileForm)[]).forEach((key) => {
      if (!same(next[key], saved[key])) (patch as Record<string, unknown>)[key] = next[key];
    });
    return patch;
  };
  const changes = useMemo(() => diff(form), [form, saved]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Saves `next` (defaults to the current form), sending only what changed. */
  const save = useMutation({
    mutationFn: async (next: BusinessProfileForm = form) => {
      const patch = diff(next);
      if (!live || !Object.keys(patch).length) return next;
      const updated = await businessService.updateMyBusiness(patch as Partial<MyBusiness>);
      return updated ? fromBusiness({ ...(business.data as MyBusiness), ...updated }) : next;
    },
    onSuccess: (next) => {
      setSaved(next);
      setForm(next);
      if (live) void queryClient.invalidateQueries({ queryKey: myBusinessKeys.all });
    },
  });

  return {
    form,
    set: <K extends keyof BusinessProfileForm>(key: K, value: BusinessProfileForm[K]) => setForm((current) => ({ ...current, [key]: value })),
    dirty: Object.keys(changes).length > 0,
    reset: () => setForm(saved),
    save,
    isLoading: live && business.isLoading,
    loadError: live ? business.error : null,
    category: business.data
      ? [business.data.category?.name, business.data.subcategory?.name].filter(Boolean).join(' • ')
      : 'Restaurant & Grill • Casual Dining',
    uniqueCode: business.data?.uniqueCode ?? null,
  };
}
