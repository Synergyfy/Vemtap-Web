import { useEffect, useState } from 'react';
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

const INITIAL_DRAFT: BusinessProfileDraft = {
  name: 'Urban Grill & Bistro',
  category: 'Restaurant & Dining',
  tags: ['Grill & Steakhouse', 'Bistro & Cafe'],
  description: SEED_DESCRIPTION,
  phone: '+234 803 555 9821',
  email: 'hello@urbangrill.ng',
  website: 'https://www.urbangrill.ng',
  instagram: '@urbangrill_lagos',
  whatsapp: 'wa.me/2348035559821',
  x: '@urbangrillng',
  prefs: { inApp: true, whatsapp: true },
};

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
  initialStep = 'intro',
}: {
  onBack: () => void;
  onComplete: () => void;
  /** `'basic'` skips the marketing intro and lands directly on profile details (existing-account flow). */
  initialStep?: 'intro' | 'basic';
}) {
  const [step, setStep] = useState<BusinessOnboardingStep>(initialStep);
  const [draft, setDraft] = useState<BusinessProfileDraft>(INITIAL_DRAFT);
  const [productDraft, setProductDraft] = useState<ProductDraft>(INITIAL_PRODUCT_DRAFT);
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft>(INITIAL_SERVICE_DRAFT);
  const [dealDraft, setDealDraft] = useState<ProductDraft>(INITIAL_PRODUCT_DRAFT);
  const [dealStudio, setDealStudio] = useState<DealStudioDraft>(INITIAL_DEAL_STUDIO_DRAFT);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

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

  switch (step) {
    case 'intro':
      return <DesktopBusinessIntroScreen onStart={() => setStep('basic')} onExit={onBack} />;
    case 'basic':
      return (
        <DesktopBusinessProfileBasicScreen
          draft={draft}
          onDraftChange={updateDraft}
          onPrevious={initialStep === 'basic' ? onBack : () => setStep('intro')}
          onNext={() => setStep('branding')}
          onSaveDraft={onBack}
        />
      );
    case 'branding':
      return (
        <DesktopBusinessProfileBrandingScreen
          draft={draft}
          onBack={() => setStep('basic')}
          onNext={() => setStep('contact')}
          onSaveDraft={onBack}
        />
      );
    case 'contact':
      return (
        <DesktopBusinessProfileContactScreen
          draft={draft}
          onDraftChange={updateDraft}
          onBack={() => setStep('branding')}
          onNext={() => setStep('location')}
          onSaveDraft={onBack}
        />
      );
    case 'location':
      return (
        <DesktopBusinessLocationScreen
          draft={draft}
          onBack={() => setStep('contact')}
          onComplete={() => setStep('branches')}
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
  }
}
