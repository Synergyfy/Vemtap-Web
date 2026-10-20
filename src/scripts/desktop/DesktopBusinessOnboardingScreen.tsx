import { useEffect, useState } from 'react';
import { useOnboardingSync } from '../../hooks/business/useOnboardingSync';
import { useMyBusiness } from '../../hooks/business/useMyBusiness';
import { hasApiConfig } from '../../services/api/client';
import { useProfile } from '../../context/ProfileContext';
import { DesktopBusinessIntroScreen } from './DesktopBusinessIntroScreen';
import { DesktopBusinessProfileBasicScreen } from './DesktopBusinessProfileBasicScreen';
import { DesktopBusinessProfileBrandingScreen } from './DesktopBusinessProfileBrandingScreen';
import { DesktopBusinessProfileContactScreen } from './DesktopBusinessProfileContactScreen';
import { DesktopBusinessLocationScreen } from './DesktopBusinessLocationScreen';
import { DesktopBusinessLocationsScreen } from './DesktopBusinessLocationsScreen';
import { DesktopBusinessAddBranchScreen } from './DesktopBusinessAddBranchScreen';
import { DesktopBusinessCatalogScreen } from './DesktopBusinessCatalogScreen';
import { DesktopAddProductStep1Screen } from './DesktopAddProductStep1Screen';
import { DesktopAddProductStep2Screen } from './DesktopAddProductStep2Screen';
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
import { INITIAL_PRODUCT_DRAFT, type ProductDraft } from './desktopProductDraft';
import { INITIAL_SERVICE_DRAFT, type ServiceDraft } from './desktopServiceDraft';
import { INITIAL_DEAL_STUDIO_DRAFT, type DealStudioDraft } from './desktopDealStudio';
import { DesktopDealStudioStep1Screen } from './DesktopDealStudioStep1Screen';
import { DesktopDealStudioStep2Screen } from './DesktopDealStudioStep2Screen';
import { DesktopDealStudioStep3Screen } from './DesktopDealStudioStep3Screen';
import { DesktopDealStudioStep4Screen } from './DesktopDealStudioStep4Screen';
import { DesktopDealAutoImportScreen } from './DesktopDealAutoImportScreen';
import { DesktopBusinessQrScreen } from './DesktopBusinessQrScreen';
import { SEED_DESCRIPTION } from './businessOnboardingData';
import {
  BusinessSetupNavContext,
  getBusinessSetupSnapshot,
  getSectionStates,
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
  prepWindow: `${service.durationMins} Mins`,
});

export function DesktopBusinessOnboardingScreen({
  onBack,
  onComplete,
  onOpenVerification,
  initialStep = 'intro',
}: {
  onBack: () => void;
  onComplete: () => void;
  /** Opens the (separate) verification section. Setup progress is preserved. */
  onOpenVerification?: () => void;
  /** `'basic'` skips the marketing intro and lands directly on profile details (existing-account flow). */
  initialStep?: 'intro' | 'basic';
}) {
  const profile = useProfile();
  // Restore saved progress (if any) so returning from verification or another
  // route resumes at the correct step instead of restarting setup.
  const stored = getBusinessSetupSnapshot();
  const [step, setStep] = useState<BusinessOnboardingStep>(() => {
    if (stored && (stored.step as BusinessOnboardingStep)) return stored.step as BusinessOnboardingStep;
    return initialStep;
  });
  const [draft, setDraft] = useState<BusinessProfileDraft>(
    () => (stored?.data.draft as BusinessProfileDraft | undefined) ?? createInitialDraft(profile.email),
  );
  const [productDraft, setProductDraft] = useState<ProductDraft>(
    () => (stored?.data.productDraft as ProductDraft | undefined) ?? INITIAL_PRODUCT_DRAFT,
  );
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft>(
    () => (stored?.data.serviceDraft as ServiceDraft | undefined) ?? INITIAL_SERVICE_DRAFT,
  );
  const [dealDraft, setDealDraft] = useState<ProductDraft>(
    () => (stored?.data.dealDraft as ProductDraft | undefined) ?? INITIAL_PRODUCT_DRAFT,
  );
  const [dealStudio, setDealStudio] = useState<DealStudioDraft>(
    () => (stored?.data.dealStudio as DealStudioDraft | undefined) ?? INITIAL_DEAL_STUDIO_DRAFT,
  );
  const [verificationState, setVerificationState] = useState<VerificationSectionState>(
    () => stored?.verificationState ?? 'not-started',
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    saveBusinessSetupSnapshot(step, { draft, productDraft, serviceDraft, dealDraft, dealStudio });
  }, [step, draft, productDraft, serviceDraft, dealDraft, dealStudio]);

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

  // Live: start from the name given at sign-up.
  useEffect(() => {
    const name = myBusiness.data?.name;
    if (name) setDraft((prev) => (prev.name ? prev : { ...prev, name }));
  }, [myBusiness.data?.name]);

  const updateDraft = (patch: Partial<BusinessProfileDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const updateProductDraft = (patch: Partial<ProductDraft>) => {
    setProductDraft((prev) => ({ ...prev, ...patch }));
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
      return <DesktopBusinessIntroScreen onStart={() => setStep('basic')} onExit={onBack} />;
    case 'basic':
      return (
        <DesktopBusinessProfileBasicScreen
          draft={draft}
          onDraftChange={updateDraft}
          onPrevious={initialStep === 'basic' ? onBack : () => setStep('intro')}
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
          onBack={() => setStep('location')}
          onAddBranch={() => setStep('addBranch')}
          onNext={() => setStep('catalog')}
          onSaveDraft={onBack}
        />
      );
    case 'addBranch':
      return <DesktopBusinessAddBranchScreen onBack={() => setStep('branches')} onSaved={() => setStep('branches')} />;
    case 'catalog':
      return (
        <DesktopBusinessCatalogScreen
          onBack={() => setStep('branches')}
          onNext={() => setStep('dealStudio1')}
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
          onNext={() => setStep('addProduct3')}
          onSaveDraft={onBack}
        />
      );
    case 'addProduct3':
      return (
        <DesktopAddProductStep3Screen
          draft={productDraft}
          onDraftChange={updateProductDraft}
          onBack={() => setStep('addProduct2')}
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
          onEditSteps={() => setStep('addProduct3')}
          onPublish={() => setStep('productPublished')}
          onSaveDraft={onBack}
        />
      );
    case 'productPublished':
      return (
        <DesktopProductPublishedScreen
          draft={productDraft}
          onMakeDeal={() => {
            setDealDraft(productDraft);
            setStep('productDeal');
          }}
          onViewCatalog={() => setStep('catalog')}
          onAddAnother={() => setStep('addProduct1')}
        />
      );
    case 'productDeal':
      return (
        <DesktopProductDealScreen
          draft={dealDraft}
          onConvert={() => setStep('dealStudio1')}
          onViewCatalog={() => setStep('catalog')}
          onAddAnother={() => setStep('addProduct1')}
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
          onPublish={() => setStep('servicePublished')}
          onSaveDraft={onBack}
        />
      );
    case 'servicePublished':
      return (
        <DesktopServicePublishedScreen
          draft={serviceDraft}
          onMakeDeal={() => {
            setDealDraft(serviceToDealDraft(serviceDraft));
            setStep('productDeal');
          }}
          onViewCatalog={() => setStep('catalog')}
          onAddAnother={() => setStep('service1')}
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
      {sync.error ? (
        <div role="alert" className="fixed top-4 left-1/2 -translate-x-1/2 z-[90] w-[min(92vw,560px)] rounded-xl bg-error-container text-on-error-container px-space-md py-space-sm shadow-lg flex items-start gap-space-xs">
          <span className="flex-1 font-label-md text-label-md">{sync.error}</span>
          <button type="button" onClick={sync.clearError} className="font-label-md text-label-md underline">
            Dismiss
          </button>
        </div>
      ) : null}
      {renderStep()}
    </BusinessSetupNavContext.Provider>
  );
}
