import { useEffect, useState } from 'react';
import { hasApiConfig } from '../services/api/client';
import type { CatalogueItem } from '../services/catalogueItemsService';
import type { BusinessTabKey } from '../components/BusinessTabBar';
import { BusinessHubHomeScreen, type HubModuleKey } from './BusinessHubHomeScreen';
import { BusinessLocationsScreen } from './BusinessLocationsScreen';
import { BusinessAddBranchScreen } from './BusinessAddBranchScreen';
import { BusinessHubCatalogScreen } from './BusinessHubCatalogScreen';
import { BusinessProductAssignmentScreen } from './BusinessProductAssignmentScreen';
import { BusinessDealsScreen } from './BusinessDealsScreen';
import { BusinessDealDetailScreen } from './BusinessDealDetailScreen';
import { BusinessDealStudioFlow } from './BusinessDealStudioFlow';
import { BusinessDealAssignmentScreen } from './BusinessDealAssignmentScreen';
import { BusinessCustomersScreen } from './BusinessCustomersScreen';
import { BusinessCustomerProfileScreen } from './BusinessCustomerProfileScreen';
import { BusinessProfileManageScreen } from './BusinessProfileManageScreen';

export type BusinessHubStep =
  | 'hub'
  | 'locations'
  | 'catalog'
  | 'assignment'
  | 'deals'
  | 'dealDetail'
  | 'dealCreate'
  | 'dealAssignment'
  | 'customers'
  | 'customerProfile'
  | 'profile'
  | 'addBranch';

export function BusinessHubScreen({
  initialStep = 'hub',
  onTab,
  onBoost,
  onOpenMessages,
  onPreviewStorefront,
  onOpenModule,
  onViewCustomerProfile,
  initialCustomer,
  initialCustomerId,
  onBackCustomerProfile,
  onOpenAnalytics,
  onPreviewInvite,
  onAddLocation,
  onUpgradePlan,
  onBuyLocations,
  initialBuyLocations = false,
  catalogMode = 'products',
  startWithNewProduct = false,
  startWithNewService = false,
}: {
  initialStep?: BusinessHubStep;
  /** Mobile catalogue is split into its own product and service pages. */
  catalogMode?: 'products' | 'services';
  /** Route mode: open the new-product wizard straight away. */
  startWithNewProduct?: boolean;
  /** Route mode: open the new-service wizard straight away. */
  startWithNewService?: boolean;
  onTab: (tab: BusinessTabKey) => void;
  onBoost: (item?: string) => void;
  onOpenMessages: () => void;
  onPreviewStorefront: () => void;
  onOpenModule: (module: HubModuleKey) => void;
  onViewCustomerProfile?: (name: string, userId?: string) => void;
  initialCustomer?: string;
  /** The live customer's user id, when the profile is for a real customer. */
  initialCustomerId?: string | null;
  onBackCustomerProfile?: () => void;
  onOpenAnalytics?: () => void;
  onPreviewInvite?: (url: string) => void;
  /** "Add Location" on the locations step — opens the paid add-location flow. */
  onAddLocation?: () => void;
  /** Location-limit modal — opens the dashboard plan page. */
  onUpgradePlan?: () => void;
  /** Location-limit modal and capacity card — opens the purchase form. */
  onBuyLocations?: () => void;
  /** Route mode: open the standalone location purchase form. */
  initialBuyLocations?: boolean;
}) {
  const [step, setStep] = useState<BusinessHubStep>(initialStep);
  const [assignmentItem, setAssignmentItem] = useState('Woodfire Aged Ribeye Steak');
  // Live deals: the item a new deal is built on, the deal being viewed, and a
  // one-off catalogue message ("pick an item").
  const live = hasApiConfig();
  const [dealSource, setDealSource] = useState<CatalogueItem | null>(null);
  const [dealGroupId, setDealGroupId] = useState<string | null>(null);
  const [catalogNotice] = useState<string | null>(null);
  const [profileCustomer, setProfileCustomer] = useState(initialCustomer ?? (hasApiConfig() ? '' : 'Michael James'));
  const [profileCustomerId, setProfileCustomerId] = useState<string | null>(initialCustomerId ?? null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    if (initialCustomer) setProfileCustomer(initialCustomer);
    setProfileCustomerId(initialCustomerId ?? null);
  }, [initialCustomer, initialCustomerId]);

  const handleTab = (tab: BusinessTabKey) => {
    onTab(tab);
  };

  const renderStep = () => {
    switch (step) {
      case 'hub':
        return <BusinessHubHomeScreen onTab={handleTab} onOpenModule={onOpenModule} />;
      case 'locations':
        return (
          <BusinessLocationsScreen
            onTab={handleTab}
            onAddBranch={() => setStep('addBranch')}
            onAddLocation={onAddLocation}
            onUpgradePlan={onUpgradePlan}
            onBuyLocations={onBuyLocations}
            initialBuyLocations={initialBuyLocations}
          />
        );
      case 'addBranch':
        return <BusinessAddBranchScreen onBack={() => setStep('locations')} onSaved={() => setStep('locations')} />;
      case 'catalog':
        return (
          <BusinessHubCatalogScreen
            mode={catalogMode}
            startWithNewProduct={startWithNewProduct}
            startWithNewService={startWithNewService}
            onTab={handleTab}
            onOpenAssignment={(itemName) => {
              setAssignmentItem(itemName);
              setStep('assignment');
            }}
            onBoost={(itemName) => onBoost(itemName)}
            onMakeDeal={(item) => {
              setDealSource(item);
              setStep('dealCreate');
            }}
            notice={catalogNotice}
          />
        );
      case 'assignment':
        return (
          <BusinessProductAssignmentScreen
            onBack={() => setStep('catalog')}
            itemName={assignmentItem}
            // Live: the catalogue passes the item's id.
            itemId={live ? assignmentItem : null}
          />
        );
      case 'deals':
        return (
          <BusinessDealsScreen
            onTab={handleTab}
            onBoost={(itemName) => onBoost(itemName)}
            onOpenDeal={(id) => {
              setDealGroupId(id ?? null);
              setStep('dealDetail');
            }}
            onCreateDeal={() => {
              // Create Deal starts type-first; the studio loads live products itself.
              setDealSource(null);
              setStep('dealCreate');
            }}
          />
        );
      case 'dealDetail':
        return (
          <BusinessDealDetailScreen
            dealGroupId={dealGroupId}
            onBack={() => setStep('deals')}
            onBoost={() => onBoost('Weekend Prime Lunch Combo')}
            onEditAssignment={() => setStep('dealAssignment')}
            onEditDeal={() => setStep('dealCreate')}
            onDeleted={() => setStep('deals')}
          />
        );
      case 'dealCreate':
        return (
          <BusinessDealStudioFlow
            sourceItem={dealSource}
            onComplete={() => {
              setDealSource(null);
              setStep('deals');
            }}
            onExit={() => {
              setDealSource(null);
              setStep('deals');
            }}
          />
        );
      case 'dealAssignment':
        return <BusinessDealAssignmentScreen dealGroupId={dealGroupId} onBack={() => setStep('dealDetail')} />;
      case 'customers':
        return (
          <BusinessCustomersScreen
            onTab={handleTab}
            onMessage={onOpenMessages}
            onViewProfile={(name, userId) => {
              if (onViewCustomerProfile) {
                onViewCustomerProfile(name, userId);
                return;
              }
              setProfileCustomer(name);
              setProfileCustomerId(userId ?? null);
              setStep('customerProfile');
            }}
            onOpenAnalytics={onOpenAnalytics}
            onPreviewInvite={onPreviewInvite}
          />
        );
      case 'customerProfile':
        return (
          <BusinessCustomerProfileScreen
            customerName={profileCustomer}
            customerId={profileCustomerId}
            onBack={onBackCustomerProfile ?? (() => setStep('customers'))}
            onMessage={onOpenMessages}
          />
        );
      case 'profile':
        return (
          <BusinessProfileManageScreen onBack={() => setStep('hub')} onPreviewStorefront={onPreviewStorefront} />
        );
    }
  };

  return (
    <div className="biz-flow">
      {renderStep()}
    </div>
  );
}
