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
}: {
  initialStep?: BusinessHubStep;
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
}) {
  const [step, setStep] = useState<BusinessHubStep>(initialStep);
  const [assignmentItem, setAssignmentItem] = useState('Woodfire Aged Ribeye Steak');
  // Live deals: the item a new deal is built on, the deal being viewed, and a
  // one-off catalogue message ("pick an item").
  const live = hasApiConfig();
  const [dealSource, setDealSource] = useState<CatalogueItem | null>(null);
  const [dealGroupId, setDealGroupId] = useState<string | null>(null);
  const [catalogNotice, setCatalogNotice] = useState<string | null>(null);
  const [profileCustomer, setProfileCustomer] = useState(initialCustomer ?? 'Michael James');
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
        return <BusinessLocationsScreen onTab={handleTab} onAddBranch={() => setStep('addBranch')} />;
      case 'addBranch':
        return <BusinessAddBranchScreen onBack={() => setStep('locations')} onSaved={() => setStep('locations')} />;
      case 'catalog':
        return (
          <BusinessHubCatalogScreen
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
              // Live deals are made from a catalogue item's "Make a Deal".
              if (live) {
                setCatalogNotice('Pick an item, then tap Make a Deal in its options.');
                setStep('catalog');
                return;
              }
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

  return <div className="biz-flow">{renderStep()}</div>;
}
