import { useEffect, useState } from 'react';
import type { BusinessTabKey } from '../components/BusinessTabBar';
import { BusinessHubHomeScreen, type HubModuleKey } from './BusinessHubHomeScreen';
import { BusinessLocationsScreen } from './BusinessLocationsScreen';
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
  | 'profile';

export function BusinessHubScreen({
  initialStep = 'hub',
  onTab,
  onBoost,
  onOpenMessages,
  onPreviewStorefront,
  onOpenModule,
  onViewCustomerProfile,
  initialCustomer,
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
  onViewCustomerProfile?: (name: string) => void;
  initialCustomer?: string;
  onBackCustomerProfile?: () => void;
  onOpenAnalytics?: () => void;
  onPreviewInvite?: (url: string) => void;
}) {
  const [step, setStep] = useState<BusinessHubStep>(initialStep);
  const [assignmentItem, setAssignmentItem] = useState('Woodfire Aged Ribeye Steak');
  const [profileCustomer, setProfileCustomer] = useState(initialCustomer ?? 'Michael James');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    if (initialCustomer) setProfileCustomer(initialCustomer);
  }, [initialCustomer]);

  const handleTab = (tab: BusinessTabKey) => {
    onTab(tab);
  };

  const renderStep = () => {
    switch (step) {
      case 'hub':
        return <BusinessHubHomeScreen onTab={handleTab} onOpenModule={onOpenModule} />;
      case 'locations':
        return <BusinessLocationsScreen onTab={handleTab} />;
      case 'catalog':
        return (
          <BusinessHubCatalogScreen
            onTab={handleTab}
            onOpenAssignment={(itemName) => {
              setAssignmentItem(itemName);
              setStep('assignment');
            }}
            onBoost={(itemName) => onBoost(itemName)}
          />
        );
      case 'assignment':
        return <BusinessProductAssignmentScreen onBack={() => setStep('catalog')} itemName={assignmentItem} />;
      case 'deals':
        return (
          <BusinessDealsScreen
            onTab={handleTab}
            onBoost={(itemName) => onBoost(itemName)}
            onOpenDeal={() => setStep('dealDetail')}
            onCreateDeal={() => setStep('dealCreate')}
          />
        );
      case 'dealDetail':
        return (
          <BusinessDealDetailScreen
            onBack={() => setStep('deals')}
            onBoost={() => onBoost('Weekend Prime Lunch Combo')}
            onEditAssignment={() => setStep('dealAssignment')}
            onEditDeal={() => setStep('dealCreate')}
          />
        );
      case 'dealCreate':
        return <BusinessDealStudioFlow onComplete={() => setStep('deals')} onExit={() => setStep('deals')} />;
      case 'dealAssignment':
        return <BusinessDealAssignmentScreen onBack={() => setStep('dealDetail')} />;
      case 'customers':
        return (
          <BusinessCustomersScreen
            onTab={handleTab}
            onMessage={onOpenMessages}
            onViewProfile={(name) => {
              if (onViewCustomerProfile) {
                onViewCustomerProfile(name);
                return;
              }
              setProfileCustomer(name);
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
