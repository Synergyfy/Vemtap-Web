import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { businessService, type MyBusiness } from '../../services/businessService';
import { useBusinessCategoryOptions } from './useBusinessCategoryOptions';
import { myBusinessKeys } from './useMyBusiness';
import { BUSINESS_CATEGORIES } from '../../scripts/businessOnboardingSeed';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import {
  catalogueItemsService,
  productDraftToInput,
  serviceDraftToInput,
  type ProductDraftLike,
  type ServiceDraftLike,
  type CatalogueItem,
} from '../../services/catalogueItemsService';
import { catalogueItemKeys } from './useCatalogueItems';
import { useAuth } from '../../context/AuthContext';
import { useSessionUser } from '../useSessionUser';
import { isBusinessRole } from '../../services/sessionService';
import { ownerAuthService } from '../../services/ownerAuthService';
import { getProvisionalReferralCode } from '../../scripts/referralData';

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
  const { activeBranchId, branches, isLive } = useBusinessBranch();
  const { adoptSession } = useAuth();
  const sessionUser = useSessionUser().data;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** The item the setup just published, so "Make a deal" can start from it. */
  const [lastPublished, setLastPublished] = useState<CatalogueItem | null>(null);

  const patch = async (update: Partial<MyBusiness> & Record<string, unknown>) => {
    if (!live) return;
    await businessService.updateMyBusiness(update as Partial<MyBusiness>);
    await queryClient.invalidateQueries({ queryKey: myBusinessKeys.all });
  };

  /** Runs a save, then `next` on success; failures stay on the step with a message. */
  /**
   * Items are created at the active branch; switch them on at any other real
   * branches the owner ticked (same price everywhere — per-branch prices are
   * set later in Branch pricing).
   */
  const sellAtBranches = async (itemId: string, selected: string[]) => {
    const others = selected.filter((id) => id !== activeBranchId);
    if (!isLive || !others.length) return;
    await catalogueItemsService.setBranchPricing(itemId, {
      pricingMode: 'uniform',
      branches: branches
        .filter((b) => b.id)
        .map((b) => ({ branchId: b.id as string, isAvailable: b.id === activeBranchId || others.includes(b.id as string) })),
    });
  };

  /**
   * A signed-in customer who chose "Continue with this account" becomes an
   * owner on the first save (`POST /auth/upgrade-to-owner`), so the business
   * exists before the profile is patched.
   */
  const ensureOwner = async (businessName: string) => {
    if (!live || !sessionUser || isBusinessRole(sessionUser.role)) return;
    try {
      adoptSession(
        await ownerAuthService.upgrade({ businessName, referralCode: getProvisionalReferralCode() || undefined }),
      );
    } catch (e) {
      // PIN accounts confirm their PIN on the account-choice step; send them back there.
      if (e instanceof Error && /password confirmation is required/i.test(e.message)) {
        throw new Error('Confirm your PIN to add a business: go back and choose "Continue with this account".');
      }
      throw e;
    }
    await queryClient.invalidateQueries({ queryKey: myBusinessKeys.all });
  };

  const saveThen = (save: () => Promise<void>, next: () => void) => {
    if (saving) return;
    setSaving(true);
    setError(null);
    save()
      .then(next)
      .catch((e: unknown) => setError(planErrorMessage(e) ?? apiErrorMessage(e, 'Could not save this step. Please try again.')))
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

  /** Both setup screens save the same shape: `+234 8031234567`. */
  const nigerianPhone = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '');
    if (!digits) return undefined;
    const local = digits.startsWith('234') ? digits.slice(3) : digits.replace(/^0/, '');
    return `+234 ${local}`;
  };

  const contactUpdate = (draft: OnboardingProfileDraft) => {
    const socials: Record<string, string> = {};
    if (handle(draft.instagram)) socials.instagram = handle(draft.instagram);
    if (handle(draft.x)) socials.x = handle(draft.x);
    return {
      phone: nigerianPhone(draft.phone),
      officialEmail: draft.email.trim() || undefined,
      website: draft.website.trim() || undefined,
      whatsappNumber: draft.whatsapp.trim() || undefined,
      ...(Object.keys(socials).length ? { socials } : {}),
    };
  };

  return {
    live,
    lastPublished,
    saving,
    error,
    clearError: () => setError(null),
    saveBasic: (draft: OnboardingProfileDraft, next: () => void) =>
      saveThen(async () => {
        await ensureOwner(draft.name.trim());
        await patch(basicUpdate(draft));
      }, next),
    saveContact: (draft: OnboardingProfileDraft, next: () => void) => saveThen(() => patch(contactUpdate(draft)), next),
    saveBranding: (branding: { logoUrl?: string; coverImage?: string; gallery: string[] }, next: () => void) =>
      saveThen(
        () =>
          patch({
            ...(branding.logoUrl ? { logoUrl: branding.logoUrl } : {}),
            ...(branding.coverImage ? { coverImage: branding.coverImage } : {}),
            ...(branding.gallery.length ? { gallery: branding.gallery } : {}),
          }),
        next,
      ),
    /** Publishes the setup's product at the active branch (plus any others ticked), then moves on. */
    publishProduct: (draft: ProductDraftLike & { branches?: Record<string, boolean> }, next: () => void) =>
      saveThen(async () => {
        if (!live) return;
        if (!activeBranchId) throw new Error('Your branch is still loading. Try again in a moment.');
        const item = await catalogueItemsService.create(productDraftToInput(draft, activeBranchId));
        await sellAtBranches(item.id, Object.keys(draft.branches ?? {}).filter((id) => draft.branches?.[id]));
        setLastPublished(item);
        await queryClient.invalidateQueries({ queryKey: catalogueItemKeys.all });
      }, next),
    publishService: (draft: ServiceDraftLike & { locations?: string[] }, next: () => void) =>
      saveThen(async () => {
        if (!live) return;
        if (!activeBranchId) throw new Error('Your branch is still loading. Try again in a moment.');
        const item = await catalogueItemsService.create(serviceDraftToInput(draft, activeBranchId));
        await sellAtBranches(item.id, draft.locations ?? []);
        setLastPublished(item);
        await queryClient.invalidateQueries({ queryKey: catalogueItemKeys.all });
      }, next),
    saveLocation: (location: { address?: string; city?: string; state?: string; latitude?: number; longitude?: number }, next: () => void) =>
      saveThen(async () => {
        await patch(location);
        // Typed addresses have no GPS fix: let the backend geocode it so the
        // business shows up for nearby customers. Best-effort, never blocks.
        if (live && location.address && (location.latitude === undefined || location.longitude === undefined)) {
          await businessService.enqueueGeocode().catch(() => undefined);
        }
      }, next),
  };
}
