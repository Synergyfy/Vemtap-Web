import { useEffect, useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { BusinessAddProductStep1Screen } from './BusinessAddProductStep1Screen';
import { BusinessAddProductStep2Screen } from './BusinessAddProductStep2Screen';
import { BusinessAddProductImageScreen } from './BusinessAddProductImageScreen';
import { BusinessAddProductStep3Screen } from './BusinessAddProductStep3Screen';
import { BusinessAddServiceStep1Screen } from './BusinessAddServiceStep1Screen';
import { BusinessAddServiceStep2Screen } from './BusinessAddServiceStep2Screen';
import { BusinessAddServiceStep3Screen } from './BusinessAddServiceStep3Screen';
import { BusinessBusinessQrScreen } from './BusinessBusinessQrScreen';
import { BusinessCatalogScreen } from './BusinessCatalogScreen';
import { BusinessDealAutoImportScreen } from './BusinessDealAutoImportScreen';
import { BusinessDealStudioStep1Screen } from './BusinessDealStudioStep1Screen';
import { BusinessDealStudioStep2Screen } from './BusinessDealStudioStep2Screen';
import { BusinessDealStudioStep3Screen } from './BusinessDealStudioStep3Screen';
import { BusinessDealStudioStep4Screen } from './BusinessDealStudioStep4Screen';
import { BusinessIntroScreen } from './BusinessIntroScreen';
import { BusinessLocationScreen } from './BusinessLocationScreen';
import { BusinessOfferingsScreen } from './BusinessOfferingsScreen';
import { useBusinessOfferings } from '../context/BusinessOfferingsContext';
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
  getBusinessSetupSnapshot,
  getSectionStates,
  saveBusinessSetupSnapshot,
  setBusinessSetupVerificationState,
  type BusinessSetupSectionId,
  type VerificationSectionState,
} from './businessSetup';
import { INITIAL_DEAL_STUDIO_DRAFT } from './dealStudio';
import type { DealStudioDraft } from './dealStudio';
import { INITIAL_PRODUCT_DRAFT } from './productDraft';
import type { ProductDraft } from './productDraft';
import { INITIAL_SERVICE_DRAFT } from './serviceDraft';
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
  /** Primary business location (always free) captured on the location step. */
  primaryLocation?: { street: string; landmark: string };
  /** Business offerings selected on the offerings onboarding step. */
  offerings?: { hasProducts: boolean; hasServices: boolean };
}

/**
 * Official business email starts from the signed-in account profile so the
 * merchant recognises it immediately; it stays editable where account and
 * verification rules allow. WhatsApp is seeded as a phone number, never a link.
 */
const createInitialDraft = (accountEmail: string): BusinessProfileDraft => ({
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
  const { offerings: currentOfferings, setOfferings } = useBusinessOfferings();
  // Restore saved progress from the module snapshot (if any) so returning from
  // verification (or another route) resumes where the merchant left off.
  const stored = getBusinessSetupSnapshot();
  const [stepIndex, setStepIndex] = useState(() => {
    if (stored) {
      // Older drafts could pause on the (now removed) add-branch form — resume
      // at the informational locations step instead.
      const restored = stored.step === 'addBranch' ? 'branches' : stored.step;
      const index = (STEPS as readonly string[]).indexOf(restored);
      if (index >= 0) return index;
    }
    return initialStep === 'basic' ? 1 : 0;
  });
  const [draft, setDraft] = useState<BusinessProfileDraft>(
    () => (stored?.data.draft as BusinessProfileDraft | undefined) ?? createInitialDraft(profile.email),
  );
  const [extraBranches] = useState<Record<string, unknown>[]>(
    () => (stored?.data.extraBranches as Record<string, unknown>[] | undefined) ?? [],
  );
  // Additional locations whose simulated checkout already succeeded in an
  // earlier run. Kept only so restoring an older saved draft still knows which
  // entries were already paid; nothing new can be added during sign-up.
  const [paidBranchIds] = useState<string[]>(
    () => (stored?.data.paidBranchIds as string[] | undefined) ?? [],
  );
  const [productDraft, setProductDraft] = useState<ProductDraft>(
    () => (stored?.data.productDraft as ProductDraft | undefined) ?? INITIAL_PRODUCT_DRAFT,
  );
  const [dealDraft, setDealDraft] = useState<ProductDraft>(
    () => (stored?.data.dealDraft as ProductDraft | undefined) ?? INITIAL_PRODUCT_DRAFT,
  );
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft>(
    () => (stored?.data.serviceDraft as ServiceDraft | undefined) ?? INITIAL_SERVICE_DRAFT,
  );
  const [dealStudio, setDealStudio] = useState<DealStudioDraft>(
    () => (stored?.data.dealStudio as DealStudioDraft | undefined) ?? INITIAL_DEAL_STUDIO_DRAFT,
  );
  const [verificationState, setVerificationState] = useState<VerificationSectionState>(
    () => stored?.verificationState ?? 'not-started',
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [stepIndex]);

  useEffect(() => {
    saveBusinessSetupSnapshot(STEPS[stepIndex], {
      draft,
      extraBranches,
      paidBranchIds,
      productDraft,
      dealDraft,
      serviceDraft,
      dealStudio,
    });
  }, [stepIndex, draft, extraBranches, paidBranchIds, productDraft, dealDraft, serviceDraft, dealStudio]);

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
          onNext={() => setStepIndex(2)}
          onSaveDraft={onBack}
        />
      );
    case 'branding':
      return (
        <BusinessProfileBrandingScreen
          draft={draft}
          onBack={() => setStepIndex(1)}
          onNext={() => setStepIndex(3)}
          onSaveDraft={onBack}
        />
      );
    case 'contact':
      return (
        <BusinessProfileContactScreen
          draft={draft}
          onBack={() => setStepIndex(2)}
          onChange={updateDraft}
          onNext={() => setStepIndex(4)}
          onSaveDraft={onBack}
        />
      );
    case 'location':
      return (
        <BusinessLocationScreen
          draft={draft}
          onBack={() => setStepIndex(3)}
          onNext={(location) => {
            updateDraft({ primaryLocation: location });
            setStepIndex(5);
          }}
          onSaveDraft={onBack}
        />
      );
    case 'branches':
      // "What does your business offer?" step: merchants choose Products, Services, or Both.
      return (
        <BusinessOfferingsScreen
          businessName={draft.name}
          initialOfferings={draft.offerings ?? currentOfferings}
          onBack={() => setStepIndex(4)}
          onNext={(selectedOfferings) => {
            updateDraft({ offerings: selectedOfferings });
            setOfferings(selectedOfferings);
            setStepIndex(7);
          }}
          onSaveDraft={onBack}
        />
      );
    case 'addBranch':
      // Legacy saved-draft step: resume at the offerings step instead.
      return (
        <BusinessOfferingsScreen
          businessName={draft.name}
          initialOfferings={draft.offerings ?? currentOfferings}
          onBack={() => setStepIndex(4)}
          onNext={(selectedOfferings) => {
            updateDraft({ offerings: selectedOfferings });
            setOfferings(selectedOfferings);
            setStepIndex(7);
          }}
          onSaveDraft={onBack}
        />
      );
    case 'catalog':
      return (
        <BusinessCatalogScreen
          onAddProduct={() => setStepIndex(8)}
          onAddService={() => setStepIndex(15)}
          onBack={() => setStepIndex(5)}
          onNext={() => setStepIndex(20)}
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
          onPublish={() => setStepIndex(13)}
          onSaveDraft={onBack}
        />
      );
    case 'productPublished':
      return (
        <BusinessProductPublishedScreen
          draft={productDraft}
          onMakeDeal={() => {
            setDealDraft(productDraft);
            setStepIndex(14);
          }}
          onViewCatalog={() => setStepIndex(7)}
          onAddAnother={() => setStepIndex(8)}
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
          onPublish={() => setStepIndex(19)}
          onSaveDraft={onBack}
        />
      );
    case 'servicePublished':
      return (
        <BusinessServicePublishedScreen
          draft={serviceDraft}
          onMakeDeal={() => {
            setDealDraft(serviceToDealDraft(serviceDraft));
            setStepIndex(14);
          }}
          onViewCatalog={() => setStepIndex(7)}
          onAddAnother={() => setStepIndex(15)}
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
      {renderStep()}
    </div>
  );
}
