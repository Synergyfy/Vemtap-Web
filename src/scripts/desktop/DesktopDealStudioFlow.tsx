import { useEffect, useState, type ReactNode } from 'react';
import { DealSourceContext } from '../../hooks/business/useDealStudioLive';
import { hasApiConfig } from '../../services/api/client';
import { useLiveDealPublish } from '../../hooks/business/useLiveDealPublish';
import { firstUsableItemImage } from '../catalogueLive';
import { toPrice, type CatalogueItem } from '../../services/catalogueItemsService';
import { INITIAL_DEAL_STUDIO_DRAFT, LIVE_DEAL_STUDIO_DRAFT, type DealStudioDraft } from './desktopDealStudio';
import { INITIAL_PRODUCT_DRAFT, type ProductDraft } from './desktopProductDraft';
import { withSelectedProducts, type DealPriceChoice } from '../deals/dealStudioShared';
import { DesktopDealStudioStep1Screen } from './DesktopDealStudioStep1Screen';
import { DesktopDealStudioStep2Screen } from './DesktopDealStudioStep2Screen';
import { DesktopDealStudioStep3Screen } from './DesktopDealStudioStep3Screen';
import { DesktopDealGalleryScreen } from './DesktopDealGalleryScreen';
import { DesktopDealStudioStep4Screen } from './DesktopDealStudioStep4Screen';

interface DesktopDealStudioFlowProps {
  initialDraft?: ProductDraft;
  initialStudio?: DealStudioDraft;
  /** Live: the real catalogue item preselected by "Make a Deal". */
  sourceItem?: CatalogueItem | null;
  /** Kept for callers restoring an older deal; the wizard always starts type-first. */
  priceChoice?: DealPriceChoice;
  onExit: () => void;
  onComplete: () => void;
  onNav?: (key: string) => void;
}

/** Self-contained desktop Deal Studio (steps 1–5), mirroring mobile exactly. */
export function DesktopDealStudioFlow({
  initialDraft,
  initialStudio,
  sourceItem = null,
  onExit,
  onComplete,
  onNav,
}: DesktopDealStudioFlowProps) {
  const liveDeal = useLiveDealPublish(onComplete, sourceItem, (patch) => setStudio((previous) => ({ ...previous, ...patch })));
  const [draft] = useState<ProductDraft>(() =>
    sourceItem
      ? {
          ...(initialDraft ?? INITIAL_PRODUCT_DRAFT),
          title: sourceItem.name,
          description: sourceItem.description ?? '',
          basePrice: String(toPrice(sourceItem.price ?? undefined) ?? ''),
          comparePrice: String(toPrice(sourceItem.compareAtPrice ?? undefined) ?? ''),
          variantsEnabled: false,
          variants: [],
          sku: sourceItem.sku ?? '',
          skuCode: sourceItem.sku ?? '',
        }
      : initialDraft ?? INITIAL_PRODUCT_DRAFT,
  );
  useEffect(() => {
    if (!liveDeal.error) return undefined;
    const timer = window.setTimeout(liveDeal.clearError, 4000);
    return () => window.clearTimeout(timer);
  }, [liveDeal.error]);

  const [studio, setStudio] = useState<DealStudioDraft>(() => {
    const base = initialStudio ?? (hasApiConfig() ? LIVE_DEAL_STUDIO_DRAFT : INITIAL_DEAL_STUDIO_DRAFT);
    if (!sourceItem) return base;
    return withSelectedProducts(
      { ...base, title: sourceItem.name },
      [sourceItem.id],
      [
        {
          id: sourceItem.id,
          name: sourceItem.name,
          price: toPrice(sourceItem.price ?? undefined) ?? 0,
          image: firstUsableItemImage(sourceItem),
        },
      ],
    );
  });
  const [step, setStep] = useState(1);
  const wrap = (node: ReactNode) => <DealSourceContext.Provider value={liveDeal.source}>{node}</DealSourceContext.Provider>;
  const handleStudioChange = (patch: Partial<DealStudioDraft>) => setStudio((previous) => ({ ...previous, ...patch }));

  if (step === 1)
    return wrap(
      <DesktopDealStudioStep1Screen
        draft={draft}
        studio={studio}
        onStudioChange={handleStudioChange}
        onBack={onExit}
        onNext={() => setStep(2)}
        onSaveDraft={onExit}
        onNav={onNav}
      />,
    );

  if (step === 2)
    return wrap(
      <DesktopDealStudioStep2Screen
        draft={draft}
        studio={studio}
        onStudioChange={handleStudioChange}
        onBack={() => setStep(1)}
        onNext={() => setStep(3)}
        onSaveDraft={onExit}
        onNav={onNav}
      />,
    );

  if (step === 3)
    return wrap(
      <DesktopDealStudioStep3Screen
        draft={draft}
        studio={studio}
        onStudioChange={handleStudioChange}
        onBack={() => setStep(2)}
        onNext={() => setStep(4)}
        onSaveDraft={onExit}
        onNav={onNav}
      />,
    );

  if (step === 4)
    return wrap(
      <DesktopDealGalleryScreen
        draft={draft}
        studio={studio}
        onStudioChange={handleStudioChange}
        onBack={() => setStep(3)}
        onNext={() => setStep(5)}
        onSaveDraft={onExit}
        onNav={onNav}
      />,
    );

  return wrap(
    <>
      <DesktopDealStudioStep4Screen
        draft={draft}
        studio={studio}
        onBack={() => setStep(4)}
        onEditOffer={() => setStep(2)}
        onEditRules={() => setStep(3)}
        onEditGallery={() => setStep(4)}
        onEditLocations={() => setStep(3)}
        onPublish={onComplete}
        livePublish={liveDeal.live ? () => liveDeal.publishAsync(studio) : undefined}
        onSaveDraft={onExit}
        onNav={onNav}
      />
      {liveDeal.error && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface px-4 py-2.5 text-label-md font-medium text-inverse-on-surface shadow-lg">
          {liveDeal.error}
        </div>
      )}
    </>,
  );
}
