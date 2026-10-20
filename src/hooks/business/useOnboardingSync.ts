import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { businessService, type MyBusiness } from '../../services/businessService';
import { useBusinessCategoryOptions } from './useBusinessCategoryOptions';
import { myBusinessKeys } from './useMyBusiness';
import { BUSINESS_CATEGORIES } from '../../scripts/businessOnboardingSeed';

/** The setup draft fields both onboarding screens share. */
export interface OnboardingProfileDraft {
  name: string;
  categories: string[];
  tags: string[];
  description: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  whatsapp: string;
  x: string;
}

const handle = (value: string) => value.trim().replace(/^@/, '');

/**
 * Saves business setup steps to `PATCH /businesses/my-business` as the owner
 * moves through them. In demo mode every save resolves immediately.
 */
export function useOnboardingSync() {
  const live = hasApiConfig();
  const queryClient = useQueryClient();
  const categories = useBusinessCategoryOptions(BUSINESS_CATEGORIES);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = async (update: Partial<MyBusiness> & Record<string, unknown>) => {
    if (!live) return;
    await businessService.updateMyBusiness(update as Partial<MyBusiness>);
    await queryClient.invalidateQueries({ queryKey: myBusinessKeys.all });
  };

  /** Runs a save, then `next` on success; failures stay on the step with a message. */
  const saveThen = (save: () => Promise<void>, next: () => void) => {
    if (saving) return;
    setSaving(true);
    setError(null);
    save()
      .then(next)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not save this step. Please try again.'))
      .finally(() => setSaving(false));
  };

  const basicUpdate = (draft: OnboardingProfileDraft) => {
    const { categoryId, subcategoryId } = categories.resolve(draft.categories, draft.tags);
    return {
      name: draft.name.trim() || undefined,
      description: draft.description.trim() || undefined,
      ...(categoryId ? { categoryId } : {}),
      ...(subcategoryId ? { subcategoryId } : {}),
    };
  };

  const contactUpdate = (draft: OnboardingProfileDraft) => {
    const socials: Record<string, string> = {};
    if (handle(draft.instagram)) socials.instagram = handle(draft.instagram);
    if (handle(draft.x)) socials.x = handle(draft.x);
    return {
      phone: draft.phone.trim() || undefined,
      officialEmail: draft.email.trim() || undefined,
      website: draft.website.trim() || undefined,
      whatsappNumber: draft.whatsapp.trim() || undefined,
      ...(Object.keys(socials).length ? { socials } : {}),
    };
  };

  return {
    live,
    saving,
    error,
    clearError: () => setError(null),
    saveBasic: (draft: OnboardingProfileDraft, next: () => void) => saveThen(() => patch(basicUpdate(draft)), next),
    saveContact: (draft: OnboardingProfileDraft, next: () => void) => saveThen(() => patch(contactUpdate(draft)), next),
    saveLocation: (location: { address?: string; city?: string; state?: string; latitude?: number; longitude?: number }, next: () => void) =>
      saveThen(() => patch(location), next),
  };
}
