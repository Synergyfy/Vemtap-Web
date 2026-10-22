import { useState } from 'react';
import { hasApiConfig } from '../../services/api/client';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { useOfferMutations } from './useOffers';
import { studioToOfferInput } from '../../services/offersService';
import { toPrice, type CatalogueItem } from '../../services/catalogueItemsService';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';
import type { DealStudioDraft } from '../../scripts/deals/dealStudioShared';
import type { DealPublicationResult } from '../../scripts/deals/dealPublication';

/**
 * Live Deal Studio: the deal is built on a real catalogue item (picked first)
 * and published with `POST /catalogue/offers`. Demo mode keeps the sample flow.
 */
/** `initialSource` restores an item picked before a reload (onboarding keeps it with setup progress). */
export function useLiveDealPublish(onComplete: () => void, initialSource: CatalogueItem | null = null) {
  const live = hasApiConfig();
  const { activeBranchId } = useBusinessBranch();
  const { create } = useOfferMutations();
  const [source, setSource] = useState<CatalogueItem | null>(initialSource);
  const [error, setError] = useState<string | null>(null);

  const publish = (studio: DealStudioDraft) => {
    if (!live) return onComplete();
    if (!source || !activeBranchId) return setError('Choose the item this deal is for first.');
    setError(null);
    create.mutate(
      studioToOfferInput(
        studio,
        { itemId: source.id, name: source.name, basePrice: toPrice(source.price ?? undefined) ?? 0, mainImage: source.mainImage },
        activeBranchId,
      ),
      { onSuccess: onComplete, onError: (e) => setError(planErrorMessage(e) ?? apiErrorMessage(e, 'Could not publish the deal.')) },
    );
  };

  /** Creates the offer and describes what actually happened, for the review step's modal. */
  const publishAsync = async (studio: DealStudioDraft): Promise<DealPublicationResult> => {
    if (!source || !activeBranchId) {
      setError('Choose the item this deal is for first.');
      throw new Error('No source item');
    }
    setError(null);
    try {
      const offer = await create.mutateAsync(
        studioToOfferInput(
          studio,
          { itemId: source.id, name: source.name, basePrice: toPrice(source.price ?? undefined) ?? 0, mainImage: source.mainImage },
          activeBranchId,
        ),
      );
      const startsLater = offer.startDate ? new Date(offer.startDate).getTime() > Date.now() + 60_000 : false;
      const status: DealPublicationResult['status'] = offer.status !== 'active' ? 'pending-review' : startsLater ? 'scheduled' : 'live';
      return {
        status,
        reference: offer.id.slice(0, 8).toUpperCase(),
        message:
          status === 'live'
            ? `${offer.name} is live for customers near ${offer.branchName ?? 'your branch'}.`
            : status === 'scheduled'
              ? `${offer.name} goes live on ${new Date(offer.startDate as string).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}.`
              : `${offer.name} was saved but is not live yet (status: ${offer.status}).`,
        submittedAt: offer.createdAt ?? new Date().toISOString(),
      };
    } catch (e) {
      setError(planErrorMessage(e) ?? apiErrorMessage(e, 'Could not publish the deal.'));
      throw e;
    }
  };

  return {
    live,
    publishAsync,
    source,
    needsSource: live && !source,
    pick: setSource,
    publish,
    publishing: create.isPending,
    error,
    clearError: () => setError(null),
  };
}
