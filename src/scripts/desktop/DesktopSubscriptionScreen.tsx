import { useEffect, useState } from 'react';
import { ClusterBoostFlow } from '../ClusterBoostFlow';
import { DesktopSubscriptionOverviewScreen } from './DesktopSubscriptionOverviewScreen';
import { DesktopSubscriptionTrialConfirmScreen } from './DesktopSubscriptionTrialConfirmScreen';
import { DesktopSubscriptionTrialActiveScreen } from './DesktopSubscriptionTrialActiveScreen';
import { DesktopSubscriptionEndingScreen } from './DesktopSubscriptionEndingScreen';
import { DesktopSubscriptionExpiredScreen } from './DesktopSubscriptionExpiredScreen';
import { DesktopSubscriptionPaymentScreen } from './DesktopSubscriptionPaymentScreen';
import { DesktopSubscriptionSuccessScreen } from './DesktopSubscriptionSuccessScreen';
import { DesktopSubscriptionAddonsScreen } from './DesktopSubscriptionAddonsScreen';
import { hasActiveTrial } from '../../utils/trialState';
import { hasApiConfig } from '../../services/api/client';
import { useActiveSubscription, useVerifySubscriptionPayment } from '../../hooks/business/useSubscription';

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
  const live = hasApiConfig();
  const subscription = useActiveSubscription();
  // Live: only a real API trial counts; demo keeps the localStorage flag.
  const trialOn = live ? subscription.data?.status === 'trial' : hasActiveTrial();

  // Paystack redirects back here with ?reference= — confirm it once and land
  // on the success step instead of a blank checkout URL.
  useVerifySubscriptionPayment(() => setStep('success'));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // If a trial is already active, never show the "start trial" entry points
  // again — land directly on the active-trial screen so the period can't be
  // reset or duplicated by re-entering the flow.
  useEffect(() => {
    if (trialOn && step === 'overview') {
      setStep('trialActive');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trialOn]);

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
      if (trialOn) {
        return (
          <DesktopSubscriptionTrialActiveScreen
            onBack={() => setStep('overview')}
            onExploreDashboard={onExit}
            onCreateCampaign={() => goToBoost('trialActive')}
            onSubscribe={() => goToPayment('trialActive')}
          />
        );
      }
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
          onExploreDashboard={onExit}
          onCreateCampaign={() => goToBoost('trialActive')}
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
      // The only purchasable placement today is the Cluster Campaign, so the
      // onboarding "create campaign" step runs the same unified flow.
      return (
        <ClusterBoostFlow
          chrome="subscription"
          onBack={boostOnBack ?? (() => setStep(boostFrom))}
          onDone={onExit}
          preselectedItemId={boostItem ?? null}
        />
      );
    case 'addons':
      return <DesktopSubscriptionAddonsScreen onBack={() => setStep('overview')} onBoost={onBoost} />;
  }
}
