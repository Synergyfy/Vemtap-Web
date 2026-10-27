import { useEffect, useState } from 'react';
import { SubscriptionOverviewScreen } from './SubscriptionOverviewScreen';
import { SubscriptionTrialConfirmScreen } from './SubscriptionTrialConfirmScreen';
import { SubscriptionTrialActiveScreen } from './SubscriptionTrialActiveScreen';
import { SubscriptionEndingScreen } from './SubscriptionEndingScreen';
import { SubscriptionExpiredScreen } from './SubscriptionExpiredScreen';
import { SubscriptionPaymentScreen } from './SubscriptionPaymentScreen';
import { SubscriptionSuccessScreen } from './SubscriptionSuccessScreen';
import { SubscriptionAddonsScreen } from './SubscriptionAddonsScreen';
import { ClusterBoostFlow } from './ClusterBoostFlow';
import { hasActiveTrial } from '../utils/trialState';
import { hasApiConfig } from '../services/api/client';
import { useActiveSubscription, useVerifySubscriptionPayment } from '../hooks/business/useSubscription';

export type SubscriptionStep =
  | 'overview'
  | 'trialConfirm'
  | 'trialActive'
  | 'trialEnding'
  | 'trialExpired'
  | 'payment'
  | 'success'
  | 'boost'
  | 'addons';

export function SubscriptionScreen({
  initialStep = 'overview',
  onExit,
  onViewBusiness,
  onBoost,
  boostOnBack,
  boostItem,
}: {
  initialStep?: SubscriptionStep;
  onExit: () => void;
  onViewBusiness: () => void;
  onBoost: () => void;
  boostOnBack?: () => void;
  boostItem?: string | null;
}) {
  const [step, setStep] = useState<SubscriptionStep>(initialStep);
  const [paymentFrom, setPaymentFrom] = useState<SubscriptionStep>('overview');
  const [boostFrom, setBoostFrom] = useState<SubscriptionStep>('overview');
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

  const goToPayment = (from: SubscriptionStep) => {
    setPaymentFrom(from);
    setStep('payment');
  };

  const goToBoost = (from: SubscriptionStep) => {
    setBoostFrom(from);
    setStep('boost');
  };

  const renderStep = () => {
    switch (step) {
      case 'overview':
        return (
          <SubscriptionOverviewScreen
            onBack={onExit}
            onStartTrial={() => setStep('trialConfirm')}
            onSubscribe={() => goToPayment('overview')}
            onViewAddons={() => setStep('addons')}
          />
        );
      case 'trialConfirm':
        if (trialOn) {
          return (
            <SubscriptionTrialActiveScreen
              onBack={() => setStep('overview')}
              onExploreDashboard={onExit}
              onCreateCampaign={() => goToBoost('trialActive')}
              onSubscribe={() => goToPayment('trialActive')}
            />
          );
        }
        return (
          <SubscriptionTrialConfirmScreen
            onBack={() => setStep('overview')}
            onTrialStarted={() => setStep('trialActive')}
            onSubscribeNow={() => goToPayment('trialConfirm')}
          />
        );
      case 'trialActive':
        return (
          <SubscriptionTrialActiveScreen
            onBack={() => setStep('overview')}
            onExploreDashboard={onExit}
            onCreateCampaign={() => goToBoost('trialActive')}
            onSubscribe={() => goToPayment('trialActive')}
          />
        );
      case 'trialEnding':
        return (
          <SubscriptionEndingScreen
            onBack={onExit}
            onContinue={() => goToPayment('trialEnding')}
            onReviewBusiness={onViewBusiness}
          />
        );
      case 'trialExpired':
        return (
          <SubscriptionExpiredScreen
            onBack={onExit}
            onActivate={() => goToPayment('trialExpired')}
            onViewBusiness={onViewBusiness}
          />
        );
      case 'payment':
        return <SubscriptionPaymentScreen onBack={() => setStep(paymentFrom)} onPaid={() => setStep('success')} />;
      case 'success':
        return (
          <SubscriptionSuccessScreen onGoDashboard={() => goToBoost('success')} onExploreFeatures={() => setStep('addons')} />
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
        return <SubscriptionAddonsScreen onBack={() => setStep('overview')} onBoost={onBoost} />;
    }
  };

  return <div className="biz-flow">{renderStep()}</div>;
}
