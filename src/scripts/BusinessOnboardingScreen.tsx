import { useEffect, useState } from 'react';
import { BusinessAddBranchScreen } from './BusinessAddBranchScreen';
import { BusinessAddProductStep1Screen } from './BusinessAddProductStep1Screen';
import { BusinessAddProductStep2Screen } from './BusinessAddProductStep2Screen';
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
import { INITIAL_DEAL_STUDIO_DRAFT } from './dealStudio';
import type { DealStudioDraft } from './dealStudio';
import { INITIAL_PRODUCT_DRAFT } from './productDraft';
import type { ProductDraft } from './productDraft';
import { INITIAL_SERVICE_DRAFT } from './serviceDraft';
import type { ServiceDraft } from './serviceDraft';

export interface BusinessProfileDraft {
  name: string;
  category: string;
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

const INITIAL_DRAFT: BusinessProfileDraft = {
  name: 'Urban Grill & Bistro',
  category: 'Food & Drink',
  tags: ['Grill & Steakhouse', 'Bistro & Cafe'],
  description: SEED_DESCRIPTION,
  phone: '803 555 9821',
  email: 'hello@urbangrill.ng',
  website: 'https://www.urbangrill.ng',
  instagram: '@urbangrill_lagos',
  whatsapp: 'wa.me/2348035559821',
  x: '@urbangrillng',
  prefs: { inApp: true, whatsapp: true },
};

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
  initialStep = 'intro',
}: {
  onBack: () => void;
  onComplete: () => void;
  /** `'basic'` skips the marketing intro and lands directly on profile details (existing-account flow). */
  initialStep?: 'intro' | 'basic';
}) {
  const [stepIndex, setStepIndex] = useState(() => (initialStep === 'basic' ? 1 : 0));
  const [draft, setDraft] = useState<BusinessProfileDraft>(INITIAL_DRAFT);
  const [extraBranches, setExtraBranches] = useState<BusinessBranch[]>([]);
  const [productDraft, setProductDraft] = useState<ProductDraft>(INITIAL_PRODUCT_DRAFT);
  const [dealDraft, setDealDraft] = useState<ProductDraft>(INITIAL_PRODUCT_DRAFT);
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft>(INITIAL_SERVICE_DRAFT);
  const [dealStudio, setDealStudio] = useState<DealStudioDraft>(INITIAL_DEAL_STUDIO_DRAFT);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [stepIndex]);

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

  const renderStep = () => {
    switch (step) {
    case 'intro':
      return <BusinessIntroScreen onBack={onBack} onNext={() => setStepIndex(1)} />;
    case 'basic':
      return (
        <BusinessProfileBasicScreen
          draft={draft}
          onBack={initialStep === 'basic' ? onBack : () => setStepIndex(0)}
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
          onNext={() => setStepIndex(5)}
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
          onSaved={() => {
            setExtraBranches((current) =>
              current.some((branch) => branch.id === NEW_BRANCH.id) ? current : [...current, NEW_BRANCH],
            );
            setStepIndex(5);
          }}
        />
      );
    case 'catalog':
      return (
        <BusinessCatalogScreen
          onAddProduct={() => setStepIndex(8)}
          onAddService={() => setStepIndex(14)}
          onBack={() => setStepIndex(5)}
          onNext={() => setStepIndex(19)}
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
    case 'addProduct3':
      return (
        <BusinessAddProductStep3Screen
          draft={productDraft}
          onBack={() => setStepIndex(9)}
          onDraftChange={updateProductDraft}
          onNext={() => setStepIndex(11)}
          onSaveDraft={onBack}
        />
      );
    case 'productReview':
      return (
        <BusinessProductReviewScreen
          draft={productDraft}
          onBack={() => setStepIndex(10)}
          onEditBasics={() => setStepIndex(8)}
          onEditPricing={() => setStepIndex(9)}
          onEditBranches={() => setStepIndex(10)}
          onEditFulfillment={() => setStepIndex(10)}
          onEditDescription={() => setStepIndex(8)}
          onPublish={() => setStepIndex(12)}
          onSaveDraft={onBack}
        />
      );
    case 'productPublished':
      return (
        <BusinessProductPublishedScreen
          draft={productDraft}
          onMakeDeal={() => {
            setDealDraft(productDraft);
            setStepIndex(13);
          }}
          onViewCatalog={() => setStepIndex(7)}
          onAddAnother={() => setStepIndex(8)}
        />
      );
    case 'productDeal':
      return (
        <BusinessProductDealScreen
          draft={dealDraft}
          onConfirmDeal={() => setStepIndex(19)}
          onViewCatalog={() => setStepIndex(7)}
          onBack={() => setStepIndex(12)}
        />
      );
    case 'service1':
      return (
        <BusinessAddServiceStep1Screen
          draft={serviceDraft}
          onBack={() => setStepIndex(7)}
          onDraftChange={updateServiceDraft}
          onNext={() => setStepIndex(15)}
          onSaveDraft={onBack}
        />
      );
    case 'service2':
      return (
        <BusinessAddServiceStep2Screen
          draft={serviceDraft}
          onBack={() => setStepIndex(14)}
          onDraftChange={updateServiceDraft}
          onNext={() => setStepIndex(16)}
          onSaveDraft={onBack}
        />
      );
    case 'service3':
      return (
        <BusinessAddServiceStep3Screen
          draft={serviceDraft}
          onBack={() => setStepIndex(15)}
          onDraftChange={updateServiceDraft}
          onNext={() => setStepIndex(17)}
          onSaveDraft={onBack}
        />
      );
    case 'serviceReview':
      return (
        <BusinessServiceReviewScreen
          draft={serviceDraft}
          onBack={() => setStepIndex(16)}
          onEditBasics={() => setStepIndex(14)}
          onEditPricing={() => setStepIndex(15)}
          onEditBranches={() => setStepIndex(16)}
          onPublish={() => setStepIndex(18)}
          onSaveDraft={onBack}
        />
      );
    case 'servicePublished':
      return (
        <BusinessServicePublishedScreen
          draft={serviceDraft}
          onMakeDeal={() => {
            setDealDraft(serviceToDealDraft(serviceDraft));
            setStepIndex(13);
          }}
          onViewCatalog={() => setStepIndex(7)}
          onAddAnother={() => setStepIndex(14)}
        />
      );
    case 'dealStudio1':
      return (
        <BusinessDealStudioStep1Screen
          draft={dealDraft}
          studio={dealStudio}
          onStudioChange={updateDealStudio}
          onBack={() => setStepIndex(7)}
          onNext={() => setStepIndex(20)}
          onSaveDraft={onBack}
        />
      );
    case 'dealStudio2':
      return (
        <BusinessDealStudioStep2Screen
          draft={dealDraft}
          studio={dealStudio}
          onStudioChange={updateDealStudio}
          onBack={() => setStepIndex(19)}
          onNext={() => setStepIndex(21)}
          onSaveDraft={onBack}
        />
      );
    case 'dealStudio3':
      return (
        <BusinessDealStudioStep3Screen
          draft={dealDraft}
          studio={dealStudio}
          onStudioChange={updateDealStudio}
          onBack={() => setStepIndex(20)}
          onNext={() => setStepIndex(22)}
          onSaveDraft={onBack}
        />
      );
    case 'dealStudio4':
      return (
        <BusinessDealStudioStep4Screen
          draft={dealDraft}
          studio={dealStudio}
          onBack={() => setStepIndex(21)}
          onEditOffer={() => setStepIndex(19)}
          onEditRules={() => setStepIndex(20)}
          onEditLocations={() => setStepIndex(21)}
          onPublish={() => setStepIndex(24)}
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
      return <BusinessBusinessQrScreen onBack={() => setStepIndex(22)} onContinue={onComplete} />;
    default:
      return null;
    }
  };

  return <div className="biz-flow">{renderStep()}</div>;
}
