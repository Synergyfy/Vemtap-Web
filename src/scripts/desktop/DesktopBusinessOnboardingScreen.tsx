import { useEffect, useState } from 'react';
import { DealSourceContext } from '../../hooks/business/useDealStudioLive';
import { useLiveDealPublish } from '../../hooks/business/useLiveDealPublish';
import { toPrice, type CatalogueItem } from '../../services/catalogueItemsService';
import { useOnboardingSync } from '../../hooks/business/useOnboardingSync';
import { useMyBusiness } from '../../hooks/business/useMyBusiness';
import { hasApiConfig } from '../../services/api/client';
import { useProfile } from '../../context/ProfileContext';
import { DesktopBusinessIntroScreen } from './DesktopBusinessIntroScreen';
import { DesktopBusinessProfileBasicScreen } from './DesktopBusinessProfileBasicScreen';
import { DesktopBusinessProfileBrandingScreen } from './DesktopBusinessProfileBrandingScreen';
import { DesktopBusinessProfileContactScreen } from './DesktopBusinessProfileContactScreen';
import { DesktopBusinessLocationScreen } from './DesktopBusinessLocationScreen';
import { DesktopBusinessLocationsScreen, type OnboardingBranch } from './DesktopBusinessLocationsScreen';
import { DesktopBusinessAddBranchScreen } from './DesktopBusinessAddBranchScreen';
import { DesktopBusinessCatalogScreen } from './DesktopBusinessCatalogScreen';
import { DesktopAddProductStep1Screen } from './DesktopAddProductStep1Screen';
import { DesktopAddProductStep2Screen } from './DesktopAddProductStep2Screen';
import { DesktopAddProductImageScreen } from './DesktopAddProductImageScreen';
import { DesktopAddProductStep3Screen } from './DesktopAddProductStep3Screen';
import { DesktopProductReviewScreen } from './DesktopProductReviewScreen';
import { DesktopProductPublishedScreen } from './DesktopProductPublishedScreen';
import { DesktopProductDealScreen } from './DesktopProductDealScreen';
import { DesktopProductPricingConfigScreen } from './DesktopProductPricingConfigScreen';
import { DesktopAddServiceStep1Screen } from './DesktopAddServiceStep1Screen';
import { DesktopAddServiceStep2Screen } from './DesktopAddServiceStep2Screen';
import { DesktopAddServiceStep3Screen } from './DesktopAddServiceStep3Screen';
import { DesktopServiceReviewScreen } from './DesktopServiceReviewScreen';
import { DesktopServicePublishedScreen } from './DesktopServicePublishedScreen';
import { BLANK_PRODUCT_DRAFT, INITIAL_PRODUCT_DRAFT, type ProductDraft } from './desktopProductDraft';
import { BLANK_SERVICE_DRAFT, INITIAL_SERVICE_DRAFT, type ServiceDraft } from './desktopServiceDraft';
import { INITIAL_DEAL_STUDIO_DRAFT, LIVE_DEAL_STUDIO_DRAFT, type DealStudioDraft } from './desktopDealStudio';
import { DesktopDealStudioStep1Screen } from './DesktopDealStudioStep1Screen';
import { DesktopDealStudioStep2Screen } from './DesktopDealStudioStep2Screen';
import { DesktopDealStudioStep3Screen } from './DesktopDealStudioStep3Screen';
import { DesktopDealStudioStep4Screen } from './DesktopDealStudioStep4Screen';
import { DesktopDealAutoImportScreen } from './DesktopDealAutoImportScreen';
import { DesktopBusinessQrScreen } from './DesktopBusinessQrScreen';
import { SEED_DESCRIPTION } from './businessOnboardingData';
import {
  BusinessSetupNavContext,
  getBusinessSetupResumeStep,
  getBusinessSetupSnapshot,
  getSectionStates,
  recordBusinessSetupAdvance,
  saveBusinessSetupSnapshot,
  setBusinessSetupVerificationState,
  type BusinessSetupNavValue,
  type BusinessSetupSectionId,
  type VerificationSectionState,
} from '../businessSetup';
import { classifyServiceFromBusiness } from '../serviceClassification';

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

type BusinessOnboardingStep =
  | 'intro'
  | 'basic'
  | 'branding'
  | 'contact'
  | 'location'
  | 'branches'
  | 'addBranch'
  | 'catalog'
  | 'addProduct1'
  | 'addProduct2'
  | 'addProductImage'
  | 'addProduct3'
  | 'productReview'
  | 'productPublished'
  | 'productDeal'
  | 'productPricingConfig'
  | 'service1'
  | 'service2'
  | 'service3'
  | 'serviceReview'
  | 'servicePublished'
  | 'dealStudio1'
  | 'dealStudio2'
  | 'dealStudio3'
  | 'dealStudio4'
  | 'dealAutoImport'
  | 'businessQr';

/**
 * Known steps, used to validate a restored snapshot: the snapshot is shared
 * with mobile, which has a slightly different step list, so a stale or
 * foreign step must fall back to `initialStep` instead of a blank screen.
 */
const ONBOARDING_STEPS: readonly BusinessOnboardingStep[] = [
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
  'productPricingConfig',
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
];

/** Branch appended after "Add Branch Location" is saved (matches the form's defaults). */
const NEW_DESKTOP_BRANCH: OnboardingBranch = {
  id: 'garki-flagship',
  name: 'Garki District Flagship',
  city: 'Abuja Municipal • Garki District, FCT',
  address: 'Plot 742, Tafawa Balewa Way, Area 11',
  hours: 'Mon–Sun • 8:00 AM – 10:00 PM',
  phone: '+234 809 111 4455',
  isPrimary: false,
};

const PROFILE_STEPS: readonly BusinessOnboardingStep[] = [
  'intro',
  'basic',
  'branding',
  'contact',
  'location',
  'branches',
  'addBranch',
];

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
  categories: ['Restaurant & Dining'],
  tags: ['Grill & Steakhouse', 'Bistro & Cafe'],
  description: SEED_DESCRIPTION,
  phone: '+234 803 555 9821',
  email: accountEmail || 'hello@urbangrill.ng',
  website: 'https://www.urbangrill.ng',
  instagram: '@urbangrill_lagos',
  whatsapp: '0803 555 9821',
  x: '@urbangrillng',
  prefs: { inApp: true, whatsapp: true },
});

const serviceToDealDraft = (service: ServiceDraft): ProductDraft => ({
  title: service.title,
  producer: service.provider,
  sku: service.skuCode,
  unbranded: false,
  primaryCategory: service.primaryCategory,
  subCategory: service.subCategory,
  classification: `${service.durationMins} Minute Session`,
  description: service.description,
  condition: 'fresh',
  basePrice: service.basePrice,
  comparePrice: service.comparePrice,
  costPrice: '',
  variantsEnabled: service.tiersEnabled,
  variants: service.tiers.map((tier) => ({
    id: tier.id,
    name: tier.name,
    cut: tier.duration,
    price: tier.price,
    inventory: '',
  })),
  skuCode: service.skuCode,
  lowStock: '0',
  backorder: false,
  branches: { ...service.branches },
  pricingMode: service.pricingMode === 'tiered' ? 'custom' : 'uniform',
  fulfillment: { pickup: true, delivery: false },
  tags: [],
  stock: '',
  prepWindow: `${service.durationMins} Mins`,
});

export function DesktopBusinessOnboardingScreen({
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
  // Restore saved progress (if any) so returning from verification or another
  // route resumes at the correct step instead of restarting setup.
  const stored = getBusinessSetupSnapshot();
  // A saved run reopens on the page after the last one completed.
  const [step, setStepState] = useState<BusinessOnboardingStep>(() => {
    const resume = getBusinessSetupResumeStep(stored);
    if (resume && (ONBOARDING_STEPS as readonly string[]).includes(resume)) {
      return resume as BusinessOnboardingStep;
    }
    return initialStep;
  });
  // Moving forward completes the page being left (Back changes nothing saved).
  // Pricing config is a side trip from the product review, not progress.
  const setStep = (next: BusinessOnboardingStep) => {
    if (next !== 'productPricingConfig' && ONBOARDING_STEPS.indexOf(next) > ONBOARDING_STEPS.indexOf(step)) {
      recordBusinessSetupAdvance(step, next);
    }
    setStepState(next);
  };
  const [draft, setDraft] = useState<BusinessProfileDraft>(
    () => (stored?.data.draft as BusinessProfileDraft | undefined) ?? createInitialDraft(profile.email),
  );
  const [productDraft, setProductDraft] = useState<ProductDraft>(
    () => (stored?.data.productDraft as ProductDraft | undefined) ?? (hasApiConfig() ? BLANK_PRODUCT_DRAFT : INITIAL_PRODUCT_DRAFT),
  );
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft>(
    () => (stored?.data.serviceDraft as ServiceDraft | undefined) ?? (hasApiConfig() ? BLANK_SERVICE_DRAFT : INITIAL_SERVICE_DRAFT),
  );
  const [dealDraft, setDealDraft] = useState<ProductDraft>(
    () => (stored?.data.dealDraft as ProductDraft | undefined) ?? (hasApiConfig() ? BLANK_PRODUCT_DRAFT : INITIAL_PRODUCT_DRAFT),
  );
  const [dealStudio, setDealStudio] = useState<DealStudioDraft>(
    () => (stored?.data.dealStudio as DealStudioDraft | undefined) ?? (hasApiConfig() ? LIVE_DEAL_STUDIO_DRAFT : INITIAL_DEAL_STUDIO_DRAFT),
  );
  // Branches added during setup are part of the run's data: keep them in the
  // shared snapshot so they survive step changes, auth and verification
  // round-trips (mobile parity).
  const [extraBranches, setExtraBranches] = useState<OnboardingBranch[]>(
    () => (stored?.data.extraBranches as OnboardingBranch[] | undefined) ?? [],
  );
  const [verificationState, setVerificationState] = useState<VerificationSectionState>(
    () => stored?.verificationState ?? 'not-started',
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);


  useEffect(() => {
    setBusinessSetupVerificationState(verificationState);
  }, [verificationState]);

  // A service always inherits its classification from the business profile —
  // keep the service draft aligned whenever the business categories/tags change
  // so the service editor never needs to re-ask for this information.
  useEffect(() => {
    const classification = classifyServiceFromBusiness(draft.categories, draft.tags);
    if (!classification) return;
    setServiceDraft((prev) =>
      prev.primaryCategory === classification.primaryCategory &&
      prev.subCategory === classification.subCategory
        ? prev
        : { ...prev, primaryCategory: classification.primaryCategory, subCategory: classification.subCategory },
    );
  }, [draft.categories, draft.tags]);

  const sync = useOnboardingSync();
  const myBusiness = useMyBusiness();
  // Live: deals are built on a real catalogue item and published to the API.
  const liveDeal = useLiveDealPublish(
    () => setStep('businessQr'), (stored?.data.dealSource as CatalogueItem | undefined) ?? null,
    // Remember the published deal so going back and publishing again updates it.
    (patch) => setDealStudio((prev) => ({ ...prev, ...patch })),
  );
  // Saved after the deal hook so the picked item survives a reload too.
  useEffect(() => {
    saveBusinessSetupSnapshot(step, { draft, productDraft, serviceDraft, dealDraft, dealStudio, extraBranches, dealSource: liveDeal.source });
  }, [step, draft, productDraft, serviceDraft, dealDraft, dealStudio, extraBranches, liveDeal.source]);

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
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const updateProductDraft = (patch: Partial<ProductDraft>) => {
    setProductDraft((prev) => ({ ...prev, ...patch }));
  };

  // Live: a fresh, blank item — the one just published stays as it is.
  const startAnotherProduct = () => {
    if (hasApiConfig()) setProductDraft(BLANK_PRODUCT_DRAFT);
    setStep('addProduct1');
  };
  const startAnotherService = () => {
    if (hasApiConfig()) setServiceDraft(BLANK_SERVICE_DRAFT);
    setStep('service1');
  };

  const updateServiceDraft = (patch: Partial<ServiceDraft>) => {
    setServiceDraft((prev) => ({ ...prev, ...patch }));
  };

  const updateDealStudio = (patch: Partial<DealStudioDraft>) => {
    setDealStudio((prev) => ({ ...prev, ...patch }));
  };

  const renderStep = () => {
    switch (step) {
    case 'intro':
      return (
        <DesktopBusinessIntroScreen onStart={onStartSignup ?? (() => setStep('basic'))} onExit={onBack} />
      );
    case 'basic':
      return (
        <DesktopBusinessProfileBasicScreen
          draft={draft}
          onDraftChange={updateDraft}
          onPrevious={() => setStep('intro')}
          onNext={() => sync.saveBasic(draft, () => setStep('branding'))}
          onSaveDraft={onBack}
        />
      );
    case 'branding':
      return (
        <DesktopBusinessProfileBrandingScreen
          draft={draft}
          onBack={() => setStep('basic')}
          onNext={(branding) => sync.saveBranding(branding, () => setStep('contact'))}
          onSaveDraft={onBack}
        />
      );
    case 'contact':
      return (
        <DesktopBusinessProfileContactScreen
          draft={draft}
          onDraftChange={updateDraft}
          onBack={() => setStep('branding')}
          onNext={() => sync.saveContact(draft, () => setStep('location'))}
          onSaveDraft={onBack}
        />
      );
    case 'location':
      return (
        <DesktopBusinessLocationScreen
          draft={draft}
          onBack={() => setStep('contact')}
          onComplete={(location) => sync.saveLocation(location, () => setStep('branches'))}
          onSaveDraft={onBack}
        />
      );
    case 'branches':
      return (
        <DesktopBusinessLocationsScreen
          extraBranches={extraBranches}
          onBack={() => setStep('location')}
          onAddBranch={() => setStep('addBranch')}
          onNext={() => setStep('catalog')}
          onSaveDraft={onBack}
        />
      );
    case 'addBranch':
      return (
        <DesktopBusinessAddBranchScreen
          onBack={() => setStep('branches')}
          onSaved={(saved) => {
            // Live branches come from the API; the sample new branch is demo-only.
            if (!saved)
              setExtraBranches((current) =>
                current.some((branch) => branch.id === NEW_DESKTOP_BRANCH.id)
                  ? current
                  : [...current, NEW_DESKTOP_BRANCH],
              );
            setStep('branches');
          }}
        />
      );
    case 'catalog':
      return (
        <DesktopBusinessCatalogScreen
          onBack={() => setStep('branches')}
          onNext={(dealItem) => {
            // Live deals are built on a real item; with none yet, deals wait until later.
            if (hasApiConfig()) {
              if (!dealItem) return setStep('businessQr');
              startLiveDeal(dealItem);
            }
            setStep('dealStudio1');
          }}
          onSaveDraft={onBack}
          onAddProduct={() => setStep('addProduct1')}
          onAddService={() => setStep('service1')}
        />
      );
    case 'addProduct1':
      return (
        <DesktopAddProductStep1Screen
          draft={productDraft}
          onDraftChange={updateProductDraft}
          onBack={() => setStep('catalog')}
          onNext={() => setStep('addProduct2')}
          onSaveDraft={onBack}
        />
      );
    case 'addProduct2':
      return (
        <DesktopAddProductStep2Screen
          draft={productDraft}
          onDraftChange={updateProductDraft}
          onBack={() => setStep('addProduct1')}
          onNext={() => setStep('addProductImage')}
          onSaveDraft={onBack}
        />
      );
    case 'addProductImage':
      return (
        <DesktopAddProductImageScreen
          draft={productDraft}
          onDraftChange={updateProductDraft}
          onBack={() => setStep('addProduct2')}
          onNext={() => setStep('addProduct3')}
          onSaveDraft={onBack}
        />
      );
    case 'addProduct3':
      return (
        <DesktopAddProductStep3Screen
          draft={productDraft}
          onDraftChange={updateProductDraft}
          onBack={() => setStep('addProductImage')}
          onNext={() => setStep('productReview')}
          onSaveDraft={onBack}
        />
      );
    case 'productReview':
      return (
        <DesktopProductReviewScreen
          draft={productDraft}
          onBack={() => setStep('addProduct3')}
          onEditBasics={() => setStep('addProduct1')}
          onEditPricing={() => setStep('productPricingConfig')}
          onEditBranches={() => setStep('productPricingConfig')}
          onEditFulfillment={() => setStep('addProduct3')}
          onEditDescription={() => setStep('addProduct1')}
          onEditImage={() => setStep('addProductImage')}
          onEditSteps={() => setStep('addProduct3')}
          onPublish={() =>
            sync.publishProduct(productDraft, (item) => {
              if (item) updateProductDraft({ publishedItemId: item.id });
              setStep('productPublished');
            })
          }
          onSaveDraft={onBack}
        />
      );
    case 'productPublished':
      return (
        <DesktopProductPublishedScreen
          draft={productDraft}
          onMakeDeal={() => {
            setDealDraft(productDraft);
            if (sync.lastPublished) startLiveDeal(sync.lastPublished);
            setStep('productDeal');
          }}
          onViewCatalog={() => setStep('catalog')}
          onAddAnother={startAnotherProduct}
        />
      );
    case 'productDeal':
      return (
        <DesktopProductDealScreen
          draft={dealDraft}
          onConvert={() => setStep('dealStudio1')}
          onViewCatalog={() => setStep('catalog')}
          onAddAnother={startAnotherProduct}
        />
      );
    case 'productPricingConfig':
      return (
        <DesktopProductPricingConfigScreen
          draft={productDraft}
          onDraftChange={updateProductDraft}
          onSaved={() => setStep('productReview')}
          onCancel={() => setStep('productReview')}
        />
      );
    case 'service1':
      return (
        <DesktopAddServiceStep1Screen
          draft={serviceDraft}
          onDraftChange={updateServiceDraft}
          onBack={() => setStep('catalog')}
          onNext={() => setStep('service2')}
          onSaveDraft={onBack}
          businessCategories={draft.categories}
          businessSubcategories={draft.tags}
        />
      );
    case 'service2':
      return (
        <DesktopAddServiceStep2Screen
          draft={serviceDraft}
          onDraftChange={updateServiceDraft}
          onBack={() => setStep('service1')}
          onNext={() => setStep('service3')}
          onSaveDraft={onBack}
        />
      );
    case 'service3':
      return (
        <DesktopAddServiceStep3Screen
          draft={serviceDraft}
          onDraftChange={updateServiceDraft}
          onBack={() => setStep('service2')}
          onNext={() => setStep('serviceReview')}
          onSaveDraft={onBack}
        />
      );
    case 'serviceReview':
      return (
        <DesktopServiceReviewScreen
          draft={serviceDraft}
          onBack={() => setStep('service3')}
          onEditBasics={() => setStep('service1')}
          onEditPricing={() => setStep('service2')}
          onEditBranches={() => setStep('service3')}
          onEditDescription={() => setStep('service1')}
          onPublish={() =>
            sync.publishService(serviceDraft, (item) => {
              if (item) updateServiceDraft({ publishedItemId: item.id });
              setStep('servicePublished');
            })
          }
          onSaveDraft={onBack}
        />
      );
    case 'servicePublished':
      return (
        <DesktopServicePublishedScreen
          draft={serviceDraft}
          onMakeDeal={() => {
            setDealDraft(serviceToDealDraft(serviceDraft));
            if (sync.lastPublished) startLiveDeal(sync.lastPublished);
            setStep('productDeal');
          }}
          onViewCatalog={() => setStep('catalog')}
          onAddAnother={startAnotherService}
        />
      );
    case 'dealStudio1':
      return (
        <DesktopDealStudioStep1Screen
          draft={dealDraft}
          studio={dealStudio}
          onStudioChange={updateDealStudio}
          onBack={() => setStep('catalog')}
          onNext={() => setStep('dealStudio2')}
          onSaveDraft={onBack}
        />
      );
    case 'dealStudio2':
      return (
        <DesktopDealStudioStep2Screen
          draft={dealDraft}
          studio={dealStudio}
          onStudioChange={updateDealStudio}
          onBack={() => setStep('dealStudio1')}
          onNext={() => setStep('dealStudio3')}
          onSaveDraft={onBack}
        />
      );
    case 'dealStudio3':
      return (
        <DesktopDealStudioStep3Screen
          draft={dealDraft}
          studio={dealStudio}
          onStudioChange={updateDealStudio}
          onBack={() => setStep('dealStudio2')}
          onNext={() => setStep('dealStudio4')}
          onSaveDraft={onBack}
        />
      );
    case 'dealStudio4':
      return (
      <DesktopDealStudioStep4Screen
        draft={dealDraft}
        studio={dealStudio}
        onBack={() => setStep('dealStudio3')}
        onEditOffer={() => setStep('dealStudio1')}
        onEditRules={() => setStep('dealStudio2')}
        onEditLocations={() => setStep('dealStudio3')}
        onPublish={() => setStep('businessQr')}
        livePublish={liveDeal.live ? () => liveDeal.publishAsync(dealStudio) : undefined}
        onAnalytics={onComplete}
        onSaveDraft={() => setStep('catalog')}
      />
      );
    case 'dealAutoImport':
      return (
        <DesktopDealAutoImportScreen
          draft={dealDraft}
          studio={dealStudio}
          onStudioChange={updateDealStudio}
          onPublish={() => setStep('catalog')}
          onCancel={() => setStep('catalog')}
        />
      );
    case 'businessQr':
      return <DesktopBusinessQrScreen onContinue={onComplete} />;
    default:
      return null;
    }
  };

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
      setStep('basic');
    } else if (id === 'offerings') {
      setStep('catalog');
    } else if (onOpenVerification) {
      setVerificationState('in-progress');
      onOpenVerification();
    }
  };

  const navValue: BusinessSetupNavValue | null =
    step === 'intro' ? null : { ...progressSnapshot, onSelectSection: handleSelectSection };

  return (
    <BusinessSetupNavContext.Provider value={navValue}>
      {apiError && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {apiError}
        </div>
      )}
      <DealSourceContext.Provider value={liveDeal.source}>{renderStep()}</DealSourceContext.Provider>
    </BusinessSetupNavContext.Provider>
  );
}
