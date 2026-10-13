import { useEffect, useState } from 'react';
import type { BusinessTabKey } from '../components/BusinessTabBar';
import { BusinessMessagesHomeScreen } from './BusinessMessagesHomeScreen';
import { BusinessMessagesSearchScreen } from './BusinessMessagesSearchScreen';
import { BusinessNewMessageScreen } from './BusinessNewMessageScreen';
import { BusinessComposeScreen } from './BusinessComposeScreen';
import { BusinessChatGeneralScreen } from './BusinessChatGeneralScreen';
import { BusinessChatDealScreen } from './BusinessChatDealScreen';
import { BusinessChatBookingScreen } from './BusinessChatBookingScreen';
import { BusinessChatOrderScreen } from './BusinessChatOrderScreen';

export type BusinessMessagesStep =
  | 'home'
  | 'search'
  | 'select'
  | 'compose'
  | 'chatGeneral'
  | 'chatDeal'
  | 'chatBooking'
  | 'chatOrder';

export function BusinessMessagesScreen({
  initialStep = 'home',
  onTab,
}: {
  initialStep?: BusinessMessagesStep;
  onTab: (tab: BusinessTabKey) => void;
}) {
  const [step, setStep] = useState<BusinessMessagesStep>(initialStep);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  const handleTab = (tab: BusinessTabKey) => {
    if (tab === 'messages') {
      setStep('home');
      onTab(tab);
      return;
    }
    onTab(tab);
  };

  const renderStep = () => {
    switch (step) {
      case 'home':
        return (
          <BusinessMessagesHomeScreen
            onTab={handleTab}
            onOpenSearch={() => setStep('search')}
            onNewMessage={() => setStep('select')}
            onOpenConversation={(thread) =>
              setStep(
                thread === 'deal' ? 'chatDeal' : thread === 'order' ? 'chatOrder' : thread === 'booking' ? 'chatBooking' : 'chatGeneral',
              )
            }
          />
        );
      case 'search':
        return (
          <BusinessMessagesSearchScreen
            onTab={handleTab}
            onCancel={() => setStep('home')}
            onOpenConversation={(thread) => setStep(thread === 'order' ? 'chatOrder' : 'chatGeneral')}
          />
        );
      case 'select':
        return (
          <BusinessNewMessageScreen
            onBack={() => setStep('home')}
            onRecipientSelected={() => setStep('compose')}
          />
        );
      case 'compose':
        return <BusinessComposeScreen onBack={() => setStep('select')} onSent={() => setStep('chatBooking')} />;
      case 'chatGeneral':
        return <BusinessChatGeneralScreen onBack={() => setStep('home')} />;
      case 'chatDeal':
        return <BusinessChatDealScreen onBack={() => setStep('home')} />;
      case 'chatBooking':
        return <BusinessChatBookingScreen onBack={() => setStep('home')} />;
      case 'chatOrder':
        return <BusinessChatOrderScreen onBack={() => setStep('home')} />;
    }
  };

  return <div className="biz-flow">{renderStep()}</div>;
}
