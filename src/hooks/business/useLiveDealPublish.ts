import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError, hasApiConfig } from '../../services/api/client';
import { offerKeys, useOfferMutations } from './useOffers';
import { offersService, studioToOfferInput, type BusinessOffer, type CreateOfferInput } from '../../services/offersService';
import { toPrice, type CatalogueItem } from '../../services/catalogueItemsService';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';
import type { DealStudioDraft } from '../../scripts/deals/dealStudioShared';
import type { DealPublicationResult } from '../../scripts/deals/dealPublication';
import { pickDealBranchIds, useDealBranchOptions, useDealBundleCatalog } from './useDealStudioLive';

/**
 * Live Deal Studio: the deal is built on a real catalogue item (picked first)
 * and published with `POST /catalogue/offers` at the branches the owner chose.
 * Publishing a draft again updates that deal instead of creating another.
 * Demo mode keeps the sample flow.
 *
 * `initialSource` restores an item picked before a reload (onboarding keeps it
 * with setup progress). `onPublished` receives the studio fields to remember
 * (the deal group and its branches) so a later publish can update it.
 */
export function useLiveDealPublish(
  onComplete: () => void,
  initialSource: CatalogueItem | null = null,
  onPublished?: (patch: Partial<DealStudioDraft>) => void,
) {
  const live = hasApiConfig();
  const queryClient = useQueryClient();
  const { create } = useOfferMutations();
  const [source, setSource] = useState<CatalogueItem | null>(initialSource);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { options, activeBranchId } = useDealBranchOptions(source);
  const basePrice = toPrice(source?.price ?? undefined) ?? 0;
  const catalog = useDealBundleCatalog(source?.name ?? '', basePrice, source);

  const buildInput = (studio: DealStudioDraft, branchIds: string[]): CreateOfferInput =>
    studioToOfferInput(
      studio,
      { itemId: (source as CatalogueItem).id, name: (source as CatalogueItem).name, basePrice, mainImage: source?.mainImage },
      branchIds[0],
      { branchIds, catalog },
    );

  /** Updates the deal this draft published: its terms everywhere, then which branches run it. */
  const updatePublished = async (studio: DealStudioDraft, groupId: string, branchIds: string[]) => {
    const { branchId: _branchId, branchIds: _branchIds, ...fields } = buildInput(studio, branchIds);
    await offersService.updateGroup(groupId, fields);
    const before = studio.publishedBranchIds ?? [];
    if (before.join() !== branchIds.join()) {
      const every = [...new Set([...before, ...branchIds])];
      await offersService.setGroupBranchPricing(groupId, {
        branches: every.map((branchId) => ({ branchId, isActive: branchIds.includes(branchId) })),
      });
    }
    const offers = await offersService.list();
    return offers.find((offer) => (offer.dealGroupId ?? offer.id) === groupId && branchIds.includes(offer.branchId)) ?? null;
  };

  /** Creates or updates the deal; null when the deal group it updated has no row we can read back. */
  const save = async (studio: DealStudioDraft): Promise<{ offer: BusinessOffer | null; branchIds: string[] }> => {
    const branchIds = pickDealBranchIds(studio, options, activeBranchId);
    if (!branchIds.length) throw new Error('This item isn’t sold at any of your branches yet.');
    if (studio.publishedDealGroupId) {
      try {
        const offer = await updatePublished(studio, studio.publishedDealGroupId, branchIds);
        void queryClient.invalidateQueries({ queryKey: offerKeys.all });
        return { offer, branchIds };
      } catch (e) {
        // The deal was deleted elsewhere: publish it afresh.
        if (!(e instanceof ApiError && e.status === 404)) throw e;
      }
    }
    const offer = await create.mutateAsync(buildInput(studio, branchIds));
    return { offer, branchIds };
  };

  const remember = (offer: BusinessOffer | null, branchIds: string[], studio: DealStudioDraft) =>
    onPublished?.({
      publishedDealGroupId: offer?.dealGroupId ?? offer?.id ?? studio.publishedDealGroupId,
      publishedBranchIds: branchIds,
    });

  const publish = (studio: DealStudioDraft) => {
    if (!live) return onComplete();
    if (!source) return setError('Choose the item this deal is for first.');
    setError(null);
    setSaving(true);
    save(studio)
      .then(({ offer, branchIds }) => {
        remember(offer, branchIds, studio);
        onComplete();
      })
      .catch((e) => setError(planErrorMessage(e) ?? apiErrorMessage(e, 'Could not publish the deal.')))
      .finally(() => setSaving(false));
  };

  /** Creates or updates the offer and describes what actually happened, for the review step's modal. */
  const publishAsync = async (studio: DealStudioDraft): Promise<DealPublicationResult> => {
    if (!source) {
      setError('Choose the item this deal is for first.');
      throw new Error('No source item');
    }
    setError(null);
    setSaving(true);
    try {
      const { offer, branchIds } = await save(studio);
      remember(offer, branchIds, studio);
      const updated = Boolean(studio.publishedDealGroupId);
      const branchLabel =
        branchIds.length > 1
          ? `${branchIds.length} branches`
          : options.find((option) => option.id === branchIds[0])?.name ?? offer?.branchName ?? 'your branch';
      if (!offer) {
        return {
          status: 'live',
          reference: (studio.publishedDealGroupId ?? '').slice(0, 8).toUpperCase(),
          message: `Your deal was updated at ${branchLabel}.`,
          submittedAt: new Date().toISOString(),
        };
      }
      const startsLater = offer.startDate ? new Date(offer.startDate).getTime() > Date.now() + 60_000 : false;
      const status: DealPublicationResult['status'] = offer.status !== 'active' ? 'pending-review' : startsLater ? 'scheduled' : 'live';
      const verb = updated ? 'updated' : 'saved';
      return {
        status,
        reference: (offer.dealGroupId ?? offer.id).slice(0, 8).toUpperCase(),
        message:
          status === 'live'
            ? `${offer.name} is ${updated ? 'updated and ' : ''}live for customers near ${branchLabel}.`
            : status === 'scheduled'
              ? `${offer.name} goes live at ${branchLabel} on ${new Date(offer.startDate as string).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}.`
              : `${offer.name} was ${verb} but is not live yet (status: ${offer.status}).`,
        submittedAt: offer.createdAt ?? new Date().toISOString(),
      };
    } catch (e) {
      setError(planErrorMessage(e) ?? apiErrorMessage(e, 'Could not publish the deal.'));
      throw e;
    } finally {
      setSaving(false);
    }
  };

  return {
    live,
    publishAsync,
    source,
    needsSource: live && !source,
    pick: setSource,
    publish,
    publishing: create.isPending || saving,
    error,
    clearError: () => setError(null),
  };
}
