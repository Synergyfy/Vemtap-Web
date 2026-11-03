import { AdminPlanConfigurationScreen } from './AdminPlanConfigurationScreen';
import { AdminSubscriptionsListScreen } from './AdminSubscriptionsListScreen';
import { AdminPaymentsScreen } from './AdminPaymentsScreen';
import { AdminAdBillingScreen } from './AdminAdBillingScreen';

type SubTab = 'plan-configuration' | 'subscriptions' | 'payments' | 'ad-billing';

interface AdminSubscriptionsScreenProps {
  onNavigate: (path: string) => void;
  subpage?: SubTab | 'plans' | 'escrow' | 'invoices';
}

function resolveTab(subpage: AdminSubscriptionsScreenProps['subpage']): SubTab {
  if (!subpage || subpage === 'plans' || subpage === 'plan-configuration') return 'plan-configuration';
  if (subpage === 'subscriptions') return 'subscriptions';
  if (subpage === 'payments') return 'payments';
  if (subpage === 'ad-billing' || subpage === 'escrow' || subpage === 'invoices') return 'ad-billing';
  return 'plan-configuration';
}

const TABS: { id: SubTab; label: string; path: string }[] = [
  { id: 'plan-configuration', label: 'Plan Configuration', path: '/admin/subscriptions' },
  { id: 'subscriptions', label: 'Subscriptions', path: '/admin/subscriptions/subscriptions' },
  { id: 'payments', label: 'Payments', path: '/admin/subscriptions/payments' },
  { id: 'ad-billing', label: 'Ad Payments & Billing', path: '/admin/subscriptions/ad-billing' },
];

export function AdminSubscriptionsScreen({ onNavigate, subpage }: AdminSubscriptionsScreenProps) {
  const activeTab = resolveTab(subpage);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] w-full mx-auto">
      {/* Sub-page Tab Nav */}
      <div className="flex items-center gap-1 bg-surface-container-low border border-outline-variant p-1 rounded-2xl overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => onNavigate(t.path)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === t.id
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Render active sub-screen */}
      {activeTab === 'plan-configuration' && <AdminPlanConfigurationScreen onNavigate={onNavigate} />}
      {activeTab === 'subscriptions' && <AdminSubscriptionsListScreen onNavigate={onNavigate} />}
      {activeTab === 'payments' && <AdminPaymentsScreen onNavigate={onNavigate} />}
      {activeTab === 'ad-billing' && <AdminAdBillingScreen onNavigate={onNavigate} />}
    </div>
  );
}
