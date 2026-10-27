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
  onOpenSale,
}: {
  initialStep?: BusinessOrdersStep;
  onTab: (tab: BusinessTabKey) => void;
  onOpenBooking: () => void;
  onOpenDisplay?: () => void;
  /** Opens the POS transaction detail (live POS sales). */
  onOpenSale?: () => void;
}) {
  const [step, setStep] = useState<BusinessOrdersStep>(initialStep);
  const [detailFrom, setDetailFrom] = useState<HubStep>('orders');
  const [orderId, setOrderId] = useState<string | undefined>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  const openDetail = (from: HubStep, id?: string) => {
    setDetailFrom(from);
    setOrderId(id);
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
            onOpenOrder={(id) => openDetail('orders', id)}
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
            onOpenSale={onOpenSale}
          />
        );
      case 'detail':
        return <BusinessOrderDetailScreen orderId={orderId} onBack={() => setStep(detailFrom)} />;
    }
  };

  return <div className="biz-flow">{renderStep()}</div>;
}
