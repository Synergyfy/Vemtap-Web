import { useState } from 'react';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { DesktopBusinessMessagesOrderContextScreen, type MessagesWorkspaceView } from './DesktopBusinessMessagesOrderContextScreen';
import { DesktopBusinessMessagesComposeScreen } from './DesktopBusinessMessagesComposeScreen';
import { DesktopBusinessMessagesBookingScreen } from './DesktopBusinessMessagesBookingScreen';
import { DesktopBusinessMessagesDealScreen } from './DesktopBusinessMessagesDealScreen';
import { DesktopBusinessMessagesSearchScreen } from './DesktopBusinessMessagesSearchScreen';

interface DesktopBusinessMessagesWorkspaceScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  /** Opens the customer's full CRM profile (Customers page) from a chat header. */
  onViewCustomerProfile?: (name: string) => void;
}

export function DesktopBusinessMessagesWorkspaceScreen({ onNav, onViewCustomerProfile }: DesktopBusinessMessagesWorkspaceScreenProps) {
  const [view, setView] = useState<MessagesWorkspaceView>('order-context');

  switch (view) {
    case 'compose':
      return <DesktopBusinessMessagesComposeScreen onNav={onNav} onView={setView} />;
    case 'booking':
      return <DesktopBusinessMessagesBookingScreen onNav={onNav} onView={setView} onViewCustomerProfile={onViewCustomerProfile} />;
    case 'deal':
      return <DesktopBusinessMessagesDealScreen onNav={onNav} onView={setView} onViewCustomerProfile={onViewCustomerProfile} />;
    case 'search':
      return <DesktopBusinessMessagesSearchScreen onNav={onNav} onView={setView} />;
    case 'order-context':
    default:
      return <DesktopBusinessMessagesOrderContextScreen onNav={onNav} onView={setView} onViewCustomerProfile={onViewCustomerProfile} />;
  }
}
