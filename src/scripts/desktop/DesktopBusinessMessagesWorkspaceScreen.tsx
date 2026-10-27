import { useState } from 'react';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { DesktopBusinessMessagesOrderContextScreen, type MessagesWorkspaceView } from './DesktopBusinessMessagesOrderContextScreen';
import { DesktopBusinessMessagesComposeScreen } from './DesktopBusinessMessagesComposeScreen';
import { DesktopBusinessMessagesBookingScreen } from './DesktopBusinessMessagesBookingScreen';
import { DesktopBusinessMessagesDealScreen } from './DesktopBusinessMessagesDealScreen';
import { DesktopBusinessMessagesSearchScreen } from './DesktopBusinessMessagesSearchScreen';
import { hasApiConfig } from '../../services/api/client';

interface DesktopBusinessMessagesWorkspaceScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  /** Opens the customer's full CRM profile (Customers page) from a chat header. */
  onViewCustomerProfile?: (name: string) => void;
}

export function DesktopBusinessMessagesWorkspaceScreen({ onNav, onViewCustomerProfile }: DesktopBusinessMessagesWorkspaceScreenProps) {
  const [view, setView] = useState<MessagesWorkspaceView>('order-context');

  // Live: one workspace over the real inbox. The Booking / Deal / Search / Compose
  // views are sample-thread mockups, so they open the live workspace pre-set instead.
  if (hasApiConfig()) {
    return (
      <DesktopBusinessMessagesOrderContextScreen
        key={view}
        onNav={onNav}
        onView={setView}
        onViewCustomerProfile={onViewCustomerProfile}
        initialFilter={view === 'booking' ? 'bookings' : view === 'deal' ? 'deals' : 'all'}
        focusSearch={view === 'search'}
        openRecipient={view === 'compose'}
      />
    );
  }

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
