import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError, hasApiConfig } from '../../services/api/client';
import { offerKeys, useOfferMutations } from './useOffers';
import { offersService, studioToOfferInput, type BusinessOffer, type CreateOfferInput } from '../../services/offersService';
import { firstUsableItemImage } from '../../scripts/catalogueLive';
import { toPrice, type CatalogueItem } from '../../services/catalogueItemsService';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';
import type { DealStudioDraft } from '../../scripts/deals/dealStudioShared';
import type { DealPublicationResult } from '../../scripts/deals/dealPublication';
import { pickDealBranchIds, useDealBranchOptions, useDealProductCatalog } from './useDealStudioLive';

/**
 * Live Deal Studio: the deal is built from live catalogue products selected in
 * the wizard and published with `POST /catalogue/offers`. There is no mock
 * catalogue and no synthetic source item. Publishing a draft again updates it.
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
  const { catalog, products } = useDealProductCatalog();
  // Branch availability follows whichever products the merchant selected.
  const { options, activeBranchId } = useDealBranchOptions(source ? [source] : []);

  /** Keeps the source used by legacy callers in sync with the wizard's first product. */
  const selectedFor = (studio: DealStudioDraft) => {
    const byId = new Map(products.map((item) => [item.id, item]));
    const selected = studio.productIds.map((id) => byId.get(id)).filter((item): item is CatalogueItem => Boolean(item));
    const primary = selected[0] ?? source ?? products[0] ?? null;
    return { primary, selected };
  };

  const buildInput = (studio: DealStudioDraft, branchIds: string[]): CreateOfferInput => {
    const { primary } = selectedFor(studio);
    if (!primary) throw new Error('Choose at least one live product for this deal.');
    const basePrice = toPrice(primary.price ?? undefined) ?? 0;
    return studioToOfferInput(
      studio,
      {
        itemId: primary.id,
        name: primary.name,
        basePrice,
        mainImage: firstUsableItemImage(primary),
      },
      branchIds[0],
      { branchIds, catalog },
    );
  };

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
    const { selected } = selectedFor(studio);
    if (!selected.length) throw new Error('Choose at least one live product for this deal.');
    const allowedOptions = options.filter((option) =>
      selected.every((item) => !item.branches?.length || item.branches.some((branch) => branch.id === option.id)),
    );
    const branchIds = pickDealBranchIds(studio, allowedOptions, activeBranchId);
    if (!branchIds.length) throw new Error('The selected products are not sold at any of your branches yet.');
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
    needsSource: false,
    pick: setSource,
    publish,
    publishing: create.isPending || saving,
    error,
    clearError: () => setError(null),
  };
}
