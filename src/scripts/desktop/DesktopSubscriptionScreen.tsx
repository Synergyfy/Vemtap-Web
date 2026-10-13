import { useEffect, useState } from 'react';
import { BusinessBoostScreen } from '../BusinessBoostScreen';
import { DesktopSubscriptionOverviewScreen } from './DesktopSubscriptionOverviewScreen';
import { DesktopSubscriptionTrialConfirmScreen } from './DesktopSubscriptionTrialConfirmScreen';
import { DesktopSubscriptionTrialActiveScreen } from './DesktopSubscriptionTrialActiveScreen';
import { DesktopSubscriptionEndingScreen } from './DesktopSubscriptionEndingScreen';
import { DesktopSubscriptionExpiredScreen } from './DesktopSubscriptionExpiredScreen';
import { DesktopSubscriptionPaymentScreen } from './DesktopSubscriptionPaymentScreen';
import { DesktopSubscriptionSuccessScreen } from './DesktopSubscriptionSuccessScreen';
import { DesktopSubscriptionAddonsScreen } from './DesktopSubscriptionAddonsScreen';

export type DesktopSubscriptionStep =
  | 'overview'
  | 'trialConfirm'
  | 'trialActive'
  | 'trialEnding'
  | 'trialExpired'
  | 'payment'
  | 'success'
  | 'boost'
  | 'addons';

interface DesktopSubscriptionScreenProps {
  initialStep?: DesktopSubscriptionStep;
  onExit: () => void;
  onViewBusiness: () => void;
  onBoost: () => void;
  boostOnBack?: () => void;
  boostItem?: string | null;
}

export function DesktopSubscriptionScreen({
  initialStep = 'overview',
  onExit,
  onViewBusiness,
  onBoost,
  boostOnBack,
  boostItem,
}: DesktopSubscriptionScreenProps) {
  const [step, setStep] = useState<DesktopSubscriptionStep>(initialStep);
  const [paymentFrom, setPaymentFrom] = useState<DesktopSubscriptionStep>('overview');
  const [boostFrom, setBoostFrom] = useState<DesktopSubscriptionStep>('overview');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const goToPayment = (from: DesktopSubscriptionStep) => {
    setPaymentFrom(from);
    setStep('payment');
  };

  const goToBoost = (from: DesktopSubscriptionStep) => {
    setBoostFrom(from);
    setStep('boost');
  };

  switch (step) {
    case 'overview':
      return (
        <DesktopSubscriptionOverviewScreen
          onBack={onExit}
          onStartTrial={() => setStep('trialConfirm')}
          onSubscribe={() => goToPayment('overview')}
          onViewAddons={() => setStep('addons')}
        />
      );
    case 'trialConfirm':
      return (
        <DesktopSubscriptionTrialConfirmScreen
          onBack={() => setStep('overview')}
          onTrialStarted={() => setStep('trialActive')}
          onSubscribeNow={() => goToPayment('trialConfirm')}
        />
      );
    case 'trialActive':
      return (
        <DesktopSubscriptionTrialActiveScreen
          onBack={() => setStep('overview')}
          onExploreDashboard={() => goToBoost('trialActive')}
          onSubscribe={() => goToPayment('trialActive')}
        />
      );
    case 'trialEnding':
      return (
        <DesktopSubscriptionEndingScreen
          onBack={onExit}
          onContinue={() => goToPayment('trialEnding')}
          onReviewBusiness={onViewBusiness}
        />
      );
    case 'trialExpired':
      return (
        <DesktopSubscriptionExpiredScreen
          onBack={onExit}
          onActivate={() => goToPayment('trialExpired')}
          onViewBusiness={onViewBusiness}
        />
      );
    case 'payment':
      return <DesktopSubscriptionPaymentScreen onBack={() => setStep(paymentFrom)} onPaid={() => setStep('success')} />;
    case 'success':
      return (
        <DesktopSubscriptionSuccessScreen
          onGoDashboard={() => goToBoost('success')}
          onExploreFeatures={() => setStep('addons')}
        />
      );
    case 'boost':
      return (
        <BusinessBoostScreen
          onBack={boostOnBack ?? (() => setStep(boostFrom))}
          onDone={boostOnBack ? onExit : onExit}
          growthActive={boostFrom === 'success'}
          preselectedItem={boostItem ?? null}
        />
      );
    case 'addons':
      return <DesktopSubscriptionAddonsScreen onBack={() => setStep('overview')} onBoost={onBoost} />;
  }
}
