import { useEffect, useState } from 'react';
import { useOnboardingSync } from '../hooks/business/useOnboardingSync';
import { DealSourceContext } from '../hooks/business/useDealStudioLive';
import { useLiveDealPublish } from '../hooks/business/useLiveDealPublish';
import { toPrice, type CatalogueItem } from '../services/catalogueItemsService';
import { useMyBusiness } from '../hooks/business/useMyBusiness';
import { hasApiConfig } from '../services/api/client';
import { useProfile } from '../context/ProfileContext';
import { BusinessAddBranchScreen } from './BusinessAddBranchScreen';
import { BusinessAddProductStep1Screen } from './BusinessAddProductStep1Screen';
import { BusinessAddProductStep2Screen } from './BusinessAddProductStep2Screen';
import { BusinessAddProductImageScreen } from './BusinessAddProductImageScreen';
import { BusinessAddProductStep3Screen } from './BusinessAddProductStep3Screen';
import { BusinessAddServiceStep1Screen } from './BusinessAddServiceStep1Screen';
import { BusinessAddServiceStep2Screen } from './BusinessAddServiceStep2Screen';
import { BusinessAddServiceStep3Screen } from './BusinessAddServiceStep3Screen';
import { BusinessBranchesScreen } from './BusinessBranchesScreen';
import type { BusinessBranch } from './BusinessBranchesScreen';
import { BusinessBusinessQrScreen } from './BusinessBusinessQrScreen';
import { BusinessCatalogScreen } from './BusinessCatalogScreen';
import { BusinessDealAutoImportScreen } from './BusinessDealAutoImportScreen';
import { BusinessDealStudioStep1Screen } from './BusinessDealStudioStep1Screen';
import { BusinessDealStudioStep2Screen } from './BusinessDealStudioStep2Screen';
import { BusinessDealStudioStep3Screen } from './BusinessDealStudioStep3Screen';
import { BusinessDealStudioStep4Screen } from './BusinessDealStudioStep4Screen';
import { BusinessIntroScreen } from './BusinessIntroScreen';
import { BusinessLocationScreen } from './BusinessLocationScreen';
import { BusinessProductDealScreen } from './BusinessProductDealScreen';
import { BusinessProductPublishedScreen } from './BusinessProductPublishedScreen';
import { BusinessProductReviewScreen } from './BusinessProductReviewScreen';
import { BusinessProfileBasicScreen } from './BusinessProfileBasicScreen';
import { BusinessProfileBrandingScreen } from './BusinessProfileBrandingScreen';
import { BusinessProfileContactScreen } from './BusinessProfileContactScreen';
import { BusinessServicePublishedScreen } from './BusinessServicePublishedScreen';
import { BusinessServiceReviewScreen } from './BusinessServiceReviewScreen';
import { SEED_DESCRIPTION } from './businessOnboardingSeed';
import { BusinessSetupProgress } from '../components/BusinessSetupProgress';
import {
  getBusinessSetupResumeStep,
  getBusinessSetupSnapshot,
  getSectionStates,
  recordBusinessSetupAdvance,
  saveBusinessSetupSnapshot,
  setBusinessSetupVerificationState,
  type BusinessSetupSectionId,
  type VerificationSectionState,
} from './businessSetup';
import { INITIAL_DEAL_STUDIO_DRAFT, LIVE_DEAL_STUDIO_DRAFT } from './dealStudio';
import type { DealStudioDraft } from './dealStudio';
import { BLANK_PRODUCT_DRAFT, INITIAL_PRODUCT_DRAFT } from './productDraft';
import type { ProductDraft } from './productDraft';
import { BLANK_SERVICE_DRAFT, INITIAL_SERVICE_DRAFT } from './serviceDraft';
import type { ServiceDraft } from './serviceDraft';
import { classifyServiceFromBusiness } from './serviceClassification';

export interface BusinessProfileDraft {
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
  prefs: { inApp: boolean; whatsapp: boolean };
}

/**
 * Official business email starts from the signed-in account profile so the
 * merchant recognises it immediately; it stays editable where account and
 * verification rules allow. WhatsApp is seeded as a phone number, never a link.
 */
const createInitialDraft = (accountEmail: string): BusinessProfileDraft =>
  hasApiConfig()
    ? {
        // Live setup starts empty so nothing sample-only reaches the business record.
        name: '',
        categories: [],
        tags: [],
        description: '',
        phone: '',
        email: accountEmail,
        website: '',
        instagram: '',
        whatsapp: '',
        x: '',
        prefs: { inApp: true, whatsapp: true },
      }
    : ({
  name: 'Urban Grill & Bistro',
  categories: ['restaurant'],
  tags: ['Grill & Steakhouse', 'Bistro & Cafe'],
  description: SEED_DESCRIPTION,
  phone: '803 555 9821',
  email: accountEmail || 'hello@urbangrill.ng',
  website: 'https://www.urbangrill.ng',
  instagram: '@urbangrill_lagos',
  whatsapp: '0803 555 9821',
  x: '@urbangrillng',
  prefs: { inApp: true, whatsapp: true },
});

const STEPS = [
  'intro',
  'basic',
  'branding',
  'contact',
  'location',
  'branches',
  'addBranch',
  'catalog',
  'addProduct1',
  'addProduct2',
  'addProductImage',
  'addProduct3',
  'productReview',
  'productPublished',
  'productDeal',
  'service1',
  'service2',
  'service3',
  'serviceReview',
  'servicePublished',
  'dealStudio1',
  'dealStudio2',
  'dealStudio3',
  'dealStudio4',
  'dealAutoImport',
  'businessQr',
] as const;

type BusinessOnboardingStep = (typeof STEPS)[number];

const PROFILE_STEPS: readonly BusinessOnboardingStep[] = [
  'intro',
  'basic',
  'branding',
  'contact',
  'location',
  'branches',
  'addBranch',
];

const NEW_BRANCH_IMAGES = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANJsmk1CZ7kqu-LkWt0xVGy3vQvAAan2Uh7Ae-lqlm1Rb8RiLOXtVOsxfmEPOizvnkLCegPcvq3NuOtbzguW_cqVTZV7750yTTpjC89dxUFwN3hFP4roCjyXSypNYEmwIgel6-zKkx9izBn56_TuVnPMWYVUx2G_5Axi-hkLlDfm8UQlIel1tu2ulnv3nGiT3Vtm8zhh7UaXbbP83y0fenbLPpvzRNj0A7mbkLzZpE7qRna9LuP2INkg',
    alt: 'Cozy bistro cafe storefront in a bustling commercial mall with warm ambient terrace lighting, artisan coffee counter, chalkboard specials, and potted plants under crisp modern architectural illumination.',
  },
];

const NEW_BRANCH: BusinessBranch = {
  id: 'garki-flagship',
  name: '3 — Garki District Flagship',
  subtitle: 'Urban Grill & Bistro • Garki District, FCT',
  address: 'Plot 742, Tafawa Balewa Way, Area 11',
  phone: '+234 809 111 4455',
  hours: '· 8:00 AM – 10:00 PM (Mon–Sun)',
  image: NEW_BRANCH_IMAGES[0].src,
  imageAlt: NEW_BRANCH_IMAGES[0].alt,
};

const serviceToDealDraft = (service: ServiceDraft): ProductDraft => ({
  ...INITIAL_PRODUCT_DRAFT,
  title: service.title,
  skuCode: service.skuCode,
  basePrice: service.tiers[0]?.price ?? service.basePrice,
  comparePrice: service.comparePrice,
  branches: {
    maitama: service.branches.maitama,
    wuse: service.branches.wuseII,
    garki: service.branches.garki,
  },
  variantsEnabled: service.tiersEnabled,
  variants: service.tiers.map((tier, index) => ({
    id: tier.id,
    name: index === 0 ? 'Regular' : tier.name,
    cut: tier.duration,
    price: tier.price,
    inventory: 'Bookable',
  })),
});

export function BusinessOnboardingScreen({
  onBack,
  onComplete,
  onOpenVerification,
  onStartSignup,
  initialStep = 'intro',
}: {
  onBack: () => void;
  onComplete: () => void;
  /** Opens the (separate) verification section. Setup progress is preserved. */
  onOpenVerification?: () => void;
  /**
   * "Set Up My Business" on the intro — opens the business sign-up modal, then
   * returns here on the Business Profile step. Falls back to stepping straight
   * into profile details when the caller does not wire one up.
   */
  onStartSignup?: () => void;
  /** `'basic'` skips the marketing intro and lands directly on profile details (existing-account flow). */
  initialStep?: 'intro' | 'basic';
}) {
  const profile = useProfile();
  // Restore saved progress from the module snapshot (if any) so returning from
  // verification (or another route) resumes where the merchant left off.
  const stored = getBusinessSetupSnapshot();
  // A saved run reopens on the page after the last one completed.
  const [stepIndex, setStepIndexState] = useState(() => {
    if (stored) {
      const index = (STEPS as readonly string[]).indexOf(getBusinessSetupResumeStep(stored) ?? '');
      if (index >= 0) return index;
    }
    return initialStep === 'basic' ? 1 : 0;
  });
  // Moving forward completes the page being left (Back changes nothing saved).
  const setStepIndex = (next: number) => {
    if (next > stepIndex) recordBusinessSetupAdvance(STEPS[stepIndex], STEPS[next]);
    setStepIndexState(next);
  };
  const [draft, setDraft] = useState<BusinessProfileDraft>(
    () => (stored?.data.draft as BusinessProfileDraft | undefined) ?? createInitialDraft(profile.email),
  );
  const [extraBranches, setExtraBranches] = useState<BusinessBranch[]>(
    () => (stored?.data.extraBranches as BusinessBranch[] | undefined) ?? [],
  );
  const [productDraft, setProductDraft] = useState<ProductDraft>(
    () => (stored?.data.productDraft as ProductDraft | undefined) ?? (hasApiConfig() ? BLANK_PRODUCT_DRAFT : INITIAL_PRODUCT_DRAFT),
  );
  const [dealDraft, setDealDraft] = useState<ProductDraft>(
    () => (stored?.data.dealDraft as ProductDraft | undefined) ?? (hasApiConfig() ? BLANK_PRODUCT_DRAFT : INITIAL_PRODUCT_DRAFT),
  );
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft>(
    () => (stored?.data.serviceDraft as ServiceDraft | undefined) ?? (hasApiConfig() ? BLANK_SERVICE_DRAFT : INITIAL_SERVICE_DRAFT),
  );
  const [dealStudio, setDealStudio] = useState<DealStudioDraft>(
    () => (stored?.data.dealStudio as DealStudioDraft | undefined) ?? (hasApiConfig() ? LIVE_DEAL_STUDIO_DRAFT : INITIAL_DEAL_STUDIO_DRAFT),
  );
  const [verificationState, setVerificationState] = useState<VerificationSectionState>(
    () => stored?.verificationState ?? 'not-started',
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [stepIndex]);


  useEffect(() => {
    setBusinessSetupVerificationState(verificationState);
  }, [verificationState]);

  // A service inherits its category/sub-category from the business profile, so
  // keep the service draft aligned whenever the business classification changes.
  useEffect(() => {
    const classification = classifyServiceFromBusiness(draft.categories, draft.tags);
    if (!classification) return;
    setServiceDraft((current) =>
      current.primaryCategory === classification.primaryCategory &&
      current.subCategory === classification.subCategory
        ? current
        : {
            ...current,
            primaryCategory: classification.primaryCategory,
            subCategory: classification.subCategory,
          },
    );
  }, [draft.categories, draft.tags]);

  const sync = useOnboardingSync();
  // Live: deals are built on a real catalogue item and published to the API.
  const liveDeal = useLiveDealPublish(
    () => setStepIndex(25), (stored?.data.dealSource as CatalogueItem | undefined) ?? null,
    // Remember the published deal so going back and publishing again updates it.
    (patch) => setDealStudio((prev) => ({ ...prev, ...patch })),
  );
  // Saved after the deal hook so the picked item survives a reload too.
  useEffect(() => {
    saveBusinessSetupSnapshot(STEPS[stepIndex], {
      draft,
      extraBranches,
      productDraft,
      dealDraft,
      serviceDraft,
      dealStudio,
      dealSource: liveDeal.source,
    });
  }, [stepIndex, draft, extraBranches, productDraft, dealDraft, serviceDraft, dealStudio, liveDeal.source]);

  const startLiveDeal = (item: CatalogueItem) => {
    // A different item is a new deal: forget the one published for the last item.
    if (liveDeal.source?.id !== item.id) {
      setDealStudio((prev) => ({ ...prev, branchIds: undefined, publishedDealGroupId: undefined, publishedBranchIds: undefined }));
    }
    liveDeal.pick(item);
    setDealDraft((prev) => ({
      ...prev,
      title: item.name,
      description: item.description ?? '',
      basePrice: String(toPrice(item.price ?? undefined) ?? ''),
      comparePrice: String(toPrice(item.compareAtPrice ?? undefined) ?? ''),
      // The draft starts from the sample product: drop its variants and photo.
      variantsEnabled: false,
      variants: [],
      mainImage: item.mainImage ?? undefined,
      sku: item.sku ?? '',
      skuCode: item.sku ?? '',
    }));
  };
  const myBusiness = useMyBusiness();

  // Live: start from the name given at sign-up.
  useEffect(() => {
    const name = myBusiness.data?.name;
    if (name) setDraft((prev) => (prev.name ? prev : { ...prev, name }));
  }, [myBusiness.data?.name]);

  // Live: save and publish failures show in the flow's toast, then clear.
  const apiError =
    sync.error ?? (liveDeal.error && liveDeal.needsSource ? 'Publish a product or service first, then make a deal from it.' : liveDeal.error);
  useEffect(() => {
    if (!apiError) return;
    const timer = window.setTimeout(() => {
      sync.clearError();
      liveDeal.clearError();
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [apiError]);

  const updateDraft = (patch: Partial<BusinessProfileDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const updateProductDraft = (patch: Partial<ProductDraft>) => {
    setProductDraft((current) => ({ ...current, ...patch }));
  };

  const updateServiceDraft = (patch: Partial<ServiceDraft>) => {
    setServiceDraft((current) => ({ ...current, ...patch }));
  };

  const updateDealStudio = (patch: Partial<DealStudioDraft>) => {
    setDealStudio((current) => ({ ...current, ...patch }));
  };

  const step: BusinessOnboardingStep = STEPS[stepIndex];

  const activeSection: BusinessSetupSectionId = PROFILE_STEPS.includes(step) ? 'profile' : 'offerings';
  const progressSnapshot = {
    activeSection,
    profileCompleted: activeSection !== 'profile',
    offeringsCompleted: step === 'businessQr' || verificationState !== 'not-started',
    verificationState,
  };

  const handleSelectSection = (id: BusinessSetupSectionId) => {
    if (getSectionStates(progressSnapshot)[id] === 'locked') return;
    if (id === 'profile') {
      setStepIndex(1);
    } else if (id === 'offerings') {
      setStepIndex(7);
    } else if (onOpenVerification) {
      setVerificationState('in-progress');
      onOpenVerification();
    }
  };

  const renderStep = () => {
    switch (step) {
    case 'intro':
      return <BusinessIntroScreen onBack={onBack} onNext={onStartSignup ?? (() => setStepIndex(1))} />;
    case 'basic':
      return (
        <BusinessProfileBasicScreen
          draft={draft}
          onBack={() => setStepIndex(0)}
          onChange={updateDraft}
          onNext={() => sync.saveBasic(draft, () => setStepIndex(2))}
          onSaveDraft={onBack}
        />
      );
    case 'branding':
      return (
        <BusinessProfileBrandingScreen
          draft={draft}
          onBack={() => setStepIndex(1)}
          onNext={(branding) => sync.saveBranding(branding, () => setStepIndex(3))}
          onSaveDraft={onBack}
        />
      );
    case 'contact':
      return (
        <BusinessProfileContactScreen
          draft={draft}
          onBack={() => setStepIndex(2)}
          onChange={updateDraft}
          onNext={() => sync.saveContact(draft, () => setStepIndex(4))}
          onSaveDraft={onBack}
        />
      );
    case 'location':
      return (
        <BusinessLocationScreen
          draft={draft}
          onBack={() => setStepIndex(3)}
          onNext={(location) => sync.saveLocation(location, () => setStepIndex(5))}
          onSaveDraft={onBack}
        />
      );
    case 'branches':
      return (
        <BusinessBranchesScreen
          extraBranches={extraBranches}
          onBack={() => setStepIndex(4)}
          onAddBranch={() => setStepIndex(6)}
          onNext={() => setStepIndex(7)}
          onSaveDraft={onBack}
        />
      );
    case 'addBranch':
      return (
        <BusinessAddBranchScreen
          onBack={() => setStepIndex(5)}
          onSaved={(saved) => {
            // Live branches come from the API; the sample new branch is demo-only.
            if (!saved) {
              setExtraBranches((current) =>
                current.some((branch) => branch.id === NEW_BRANCH.id) ? current : [...current, NEW_BRANCH],
              );
            }
            setStepIndex(5);
          }}
        />
      );
    case 'catalog':
      return (
        <BusinessCatalogScreen
          onAddProduct={() => setStepIndex(8)}
          onAddService={() => setStepIndex(15)}
          onBack={() => setStepIndex(5)}
          onNext={(dealItem) => {
            // Live deals are built on a real item; with none picked, deals wait until later.
            if (hasApiConfig()) {
              if (!dealItem) return setStepIndex(25);
              startLiveDeal(dealItem);
            }
            setStepIndex(20);
          }}
          onSaveDraft={onBack}
        />
      );
    case 'addProduct1':
      return (
        <BusinessAddProductStep1Screen
          draft={productDraft}
          onBack={() => setStepIndex(7)}
          onDraftChange={updateProductDraft}
          onNext={() => setStepIndex(9)}
          onSaveDraft={onBack}
        />
      );
    case 'addProduct2':
      return (
        <BusinessAddProductStep2Screen
          draft={productDraft}
          onBack={() => setStepIndex(8)}
          onDraftChange={updateProductDraft}
          onNext={() => setStepIndex(10)}
          onSaveDraft={onBack}
        />
      );
    case 'addProductImage':
      return (
        <BusinessAddProductImageScreen
          draft={productDraft}
          onDraftChange={updateProductDraft}
          onBack={() => setStepIndex(9)}
          onNext={() => setStepIndex(11)}
          onSaveDraft={onBack}
        />
      );
    case 'addProduct3':
      return (
        <BusinessAddProductStep3Screen
          draft={productDraft}
          onBack={() => setStepIndex(10)}
          onDraftChange={updateProductDraft}
          onNext={() => setStepIndex(12)}
          onSaveDraft={onBack}
        />
      );
    case 'productReview':
      return (
        <BusinessProductReviewScreen
          draft={productDraft}
          onBack={() => setStepIndex(11)}
          onEditBasics={() => setStepIndex(8)}
          onEditPricing={() => setStepIndex(9)}
          onEditImage={() => setStepIndex(10)}
          onEditBranches={() => setStepIndex(11)}
          onEditFulfillment={() => setStepIndex(11)}
          onEditDescription={() => setStepIndex(8)}
          onPublish={() =>
            sync.publishProduct(productDraft, (item) => {
              if (item) updateProductDraft({ publishedItemId: item.id });
              setStepIndex(13);
            })
          }
          onSaveDraft={onBack}
        />
      );
    case 'productPublished':
      return (
        <BusinessProductPublishedScreen
          draft={productDraft}
          onMakeDeal={() => {
            setDealDraft(productDraft);
            if (sync.lastPublished) startLiveDeal(sync.lastPublished);
            setStepIndex(14);
          }}
          onViewCatalog={() => setStepIndex(7)}
          onAddAnother={() => {
            // Live: a fresh, blank item — the one just published stays as it is.
            if (hasApiConfig()) setProductDraft(BLANK_PRODUCT_DRAFT);
            setStepIndex(8);
          }}
        />
      );
    case 'productDeal':
      return (
        <BusinessProductDealScreen
          draft={dealDraft}
          onConfirmDeal={() => setStepIndex(20)}
          onViewCatalog={() => setStepIndex(7)}
          onBack={() => setStepIndex(13)}
        />
      );
    case 'service1':
      return (
        <BusinessAddServiceStep1Screen
          draft={serviceDraft}
          onBack={() => setStepIndex(7)}
          onDraftChange={updateServiceDraft}
          onNext={() => setStepIndex(16)}
          onSaveDraft={onBack}
          businessCategories={draft.categories}
          businessSubcategories={draft.tags}
        />
      );
    case 'service2':
      return (
        <BusinessAddServiceStep2Screen
          draft={serviceDraft}
          onBack={() => setStepIndex(15)}
          onDraftChange={updateServiceDraft}
          onNext={() => setStepIndex(17)}
          onSaveDraft={onBack}
        />
      );
    case 'service3':
      return (
        <BusinessAddServiceStep3Screen
          draft={serviceDraft}
          onBack={() => setStepIndex(16)}
          onDraftChange={updateServiceDraft}
          onNext={() => setStepIndex(18)}
          onSaveDraft={onBack}
        />
      );
    case 'serviceReview':
      return (
        <BusinessServiceReviewScreen
          draft={serviceDraft}
          onBack={() => setStepIndex(17)}
          onEditBasics={() => setStepIndex(15)}
          onEditPricing={() => setStepIndex(16)}
          onEditBranches={() => setStepIndex(17)}
          onPublish={() =>
            sync.publishService(serviceDraft, (item) => {
              if (item) updateServiceDraft({ publishedItemId: item.id });
              setStepIndex(19);
            })
          }
          onSaveDraft={onBack}
        />
      );
    case 'servicePublished':
      return (
        <BusinessServicePublishedScreen
          draft={serviceDraft}
          onMakeDeal={() => {
            setDealDraft(serviceToDealDraft(serviceDraft));
            if (sync.lastPublished) startLiveDeal(sync.lastPublished);
            setStepIndex(14);
          }}
          onViewCatalog={() => setStepIndex(7)}
          onAddAnother={() => {
            if (hasApiConfig()) setServiceDraft(BLANK_SERVICE_DRAFT);
            setStepIndex(15);
          }}
        />
      );
    case 'dealStudio1':
      return (
        <BusinessDealStudioStep1Screen
          draft={dealDraft}
          studio={dealStudio}
          onStudioChange={updateDealStudio}
          onBack={() => setStepIndex(7)}
          onNext={() => setStepIndex(21)}
          onSaveDraft={onBack}
        />
      );
    case 'dealStudio2':
      return (
        <BusinessDealStudioStep2Screen
          draft={dealDraft}
          studio={dealStudio}
          onStudioChange={updateDealStudio}
          onBack={() => setStepIndex(20)}
          onNext={() => setStepIndex(22)}
          onSaveDraft={onBack}
        />
      );
    case 'dealStudio3':
      return (
        <BusinessDealStudioStep3Screen
          draft={dealDraft}
          studio={dealStudio}
          onStudioChange={updateDealStudio}
          onBack={() => setStepIndex(21)}
          onNext={() => setStepIndex(23)}
          onSaveDraft={onBack}
        />
      );
    case 'dealStudio4':
      return (
        <BusinessDealStudioStep4Screen
          draft={dealDraft}
          studio={dealStudio}
          onBack={() => setStepIndex(22)}
          onEditOffer={() => setStepIndex(20)}
          onEditRules={() => setStepIndex(21)}
          onEditLocations={() => setStepIndex(22)}
          onPublish={() => setStepIndex(25)}
          livePublish={liveDeal.live ? () => liveDeal.publishAsync(dealStudio) : undefined}
          onSaveDraft={() => setStepIndex(7)}
        />
      );
    case 'dealAutoImport':
      return (
        <BusinessDealAutoImportScreen
          draft={dealDraft}
          studio={dealStudio}
          onStudioChange={updateDealStudio}
          onPublish={() => setStepIndex(7)}
          onCancel={() => setStepIndex(7)}
        />
      );
    case 'businessQr':
      return <BusinessBusinessQrScreen onBack={() => setStepIndex(23)} onContinue={onComplete} />;
    default:
      return null;
    }
  };

  return (
    <div className="biz-flow">
      {step !== 'intro' && (
        <div className="w-full max-w-[430px] mx-auto px-gutter pt-safe pt-2">
          <BusinessSetupProgress {...progressSnapshot} variant="mobile" onSelectSection={handleSelectSection} />
        </div>
      )}
      {apiError && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {apiError}
        </div>
      )}
      <DealSourceContext.Provider value={liveDeal.source}>{renderStep()}</DealSourceContext.Provider>
    </div>
  );
}
