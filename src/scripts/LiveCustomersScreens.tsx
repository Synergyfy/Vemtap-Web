import { AppScreen } from '../components/ui/AppScreen';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
import { CustomerDossierPanel, CustomersPanel } from '../components/business/CustomersPanels';
import { BusinessHubHeader } from './BusinessHubHeader';
import { DesktopBusinessPage } from './desktop/DesktopBusinessPage';

/** Live customer directory — mobile. */
export function LiveCustomersScreen({ onTab, onOpenCustomer }: { onTab: (tab: BusinessTabKey) => void; onOpenCustomer: (userId: string) => void }) {
  return (
    <AppScreen>
      <BusinessHubHeader />
      <div className="flex flex-col w-full flex-1 px-margin pt-space-sm pb-28 gap-space-md">
        <h1 className="font-heading-md text-heading-md text-text-primary">Customers</h1>
        <CustomersPanel onOpenCustomer={onOpenCustomer} />
      </div>
      <BusinessTabBar active="business" onTab={onTab} />
    </AppScreen>
  );
}

/** Live customer dossier — mobile. */
export function LiveCustomerProfileScreen({ userId, onBack, onMessage }: { userId: string; onBack: () => void; onMessage?: (threadId: string) => void }) {
  return (
    <BusinessSubScreen title="Customer" onBack={onBack}>
      <CustomerDossierPanel userId={userId} onMessage={onMessage} />
    </BusinessSubScreen>
  );
}

/** Live customer directory — desktop. */
export function DesktopLiveCustomersScreen({ onNav, onOpenCustomer }: { onNav: (key: string) => void; onOpenCustomer: (userId: string) => void }) {
  return (
    <DesktopBusinessPage
      activeNav="business-customers"
      onNav={onNav}
      crumbs={[{ label: 'Customers' }]}
      title="Customers"
      subtitle="Everyone who has visited, ordered, booked, claimed a deal or chatted with you."
    >
      <CustomersPanel onOpenCustomer={onOpenCustomer} />
    </DesktopBusinessPage>
  );
}

/** Live customer dossier — desktop. */
export function DesktopLiveCustomerProfileScreen({
  userId,
  onNav,
  onBack,
  onMessage,
}: {
  userId: string;
  onNav: (key: string) => void;
  onBack: () => void;
  onMessage?: (threadId: string) => void;
}) {
  return (
    <DesktopBusinessPage activeNav="business-customers" onNav={onNav} crumbs={[{ label: 'Customers', onClick: onBack }, { label: 'Customer' }]} title="Customer profile">
      <CustomerDossierPanel userId={userId} onMessage={onMessage} />
    </DesktopBusinessPage>
  );
}
