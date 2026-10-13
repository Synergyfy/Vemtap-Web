import { useEffect, useState } from 'react';
import type { BusinessTabKey } from '../components/BusinessTabBar';
import { BusinessOrdersHubScreen } from './BusinessOrdersHubScreen';
import { BusinessBookingsHubScreen } from './BusinessBookingsHubScreen';
import { BusinessPosOrdersScreen } from './BusinessPosOrdersScreen';
import { BusinessOrderDetailScreen } from './BusinessOrderDetailScreen';

export type BusinessOrdersStep = 'orders' | 'bookings' | 'pos' | 'detail';

type HubStep = Exclude<BusinessOrdersStep, 'detail'>;

export function BusinessOrdersScreen({
  initialStep = 'orders',
  onTab,
  onOpenBooking,
  onOpenDisplay,
}: {
  initialStep?: BusinessOrdersStep;
  onTab: (tab: BusinessTabKey) => void;
  onOpenBooking: () => void;
  onOpenDisplay?: () => void;
}) {
  const [step, setStep] = useState<BusinessOrdersStep>(initialStep);
  const [detailFrom, setDetailFrom] = useState<HubStep>('orders');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  const openDetail = (from: HubStep) => {
    setDetailFrom(from);
    setStep('detail');
  };

  const handleTab = (tab: BusinessTabKey) => {
    if (tab === 'orders') {
      setStep('orders');
      onTab(tab);
      return;
    }
    onTab(tab);
  };

  const renderStep = () => {
    switch (step) {
      case 'orders':
        return (
          <BusinessOrdersHubScreen
            onTab={handleTab}
            onSwitchBookings={() => setStep('bookings')}
            onOpenOrder={() => openDetail('orders')}
          />
        );
      case 'bookings':
        return (
          <BusinessBookingsHubScreen
            onTab={handleTab}
            onSwitchOrders={() => setStep('orders')}
            onOpenBooking={onOpenBooking}
          />
        );
      case 'pos':
        return (
          <BusinessPosOrdersScreen
            onTab={handleTab}
            onOpenOrder={() => openDetail('pos')}
            onOpenDisplay={onOpenDisplay}
          />
        );
      case 'detail':
        return <BusinessOrderDetailScreen onBack={() => setStep(detailFrom)} />;
    }
  };

  return <div className="biz-flow">{renderStep()}</div>;
}
