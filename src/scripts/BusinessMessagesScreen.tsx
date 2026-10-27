import { useEffect, useState } from 'react';
import type { BusinessTabKey } from '../components/BusinessTabBar';
import type { MessagesChannelKey } from '../components/campaigns/MessagesSubNav';
import { BusinessMessagesHomeScreen } from './BusinessMessagesHomeScreen';
import { BusinessMessagesSearchScreen } from './BusinessMessagesSearchScreen';
import { BusinessNewMessageScreen } from './BusinessNewMessageScreen';
import { BusinessComposeScreen } from './BusinessComposeScreen';
import { BusinessChatGeneralScreen } from './BusinessChatGeneralScreen';
import { BusinessChatDealScreen } from './BusinessChatDealScreen';
import { BusinessChatBookingScreen } from './BusinessChatBookingScreen';
import { BusinessChatOrderScreen } from './BusinessChatOrderScreen';
import { DEFAULT_CHAT_CONTACTS, type BusinessChatContact } from './messagesContact';

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
  onSelectChannel,
}: {
  initialStep?: BusinessMessagesStep;
  onTab: (tab: BusinessTabKey) => void;
  onSelectChannel?: (key: MessagesChannelKey) => void;
}) {
  const [step, setStep] = useState<BusinessMessagesStep>(initialStep);
  const [contact, setContact] = useState<BusinessChatContact>(DEFAULT_CHAT_CONTACTS.general);

  const openConversation = (thread: 'deal' | 'order' | 'general' | 'booking', next?: BusinessChatContact) => {
    setContact(next ?? DEFAULT_CHAT_CONTACTS[thread]);
    setStep(`chat${thread.charAt(0).toUpperCase()}${thread.slice(1)}` as BusinessMessagesStep);
  };

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
            onSelectChannel={onSelectChannel}
            onOpenSearch={() => setStep('search')}
            onNewMessage={() => setStep('select')}
            onOpenConversation={(thread, next) => openConversation(thread, next)}
          />
        );
      case 'search':
        return (
          <BusinessMessagesSearchScreen
            onTab={handleTab}
            onCancel={() => setStep('home')}
            onOpenConversation={(thread, next) => openConversation(thread, next)}
          />
        );
      case 'select':
        return (
          <BusinessNewMessageScreen
            onBack={() => setStep('home')}
            onRecipientSelected={(name, _context, customerId) => {
              setContact({ name, customerId });
              setStep('compose');
            }}
          />
        );
      case 'compose':
        return (
          <BusinessComposeScreen
            recipientName={contact.name}
            recipientId={contact.customerId ?? undefined}
            onBack={() => setStep('select')}
            onSent={(threadId) => {
              // Live: open the real thread the first message went to.
              if (threadId) openConversation('general', { name: contact.name, threadId, customerId: contact.customerId });
              else setStep('chatBooking');
            }}
          />
        );
      case 'chatGeneral':
        return <BusinessChatGeneralScreen contact={contact} onBack={() => setStep('home')} />;
      case 'chatDeal':
        return <BusinessChatDealScreen contact={contact} onBack={() => setStep('home')} />;
      case 'chatBooking':
        return <BusinessChatBookingScreen contact={contact} onBack={() => setStep('home')} />;
      case 'chatOrder':
        return <BusinessChatOrderScreen contact={contact} onBack={() => setStep('home')} />;
    }
  };

  return <div className="biz-flow">{renderStep()}</div>;
}
