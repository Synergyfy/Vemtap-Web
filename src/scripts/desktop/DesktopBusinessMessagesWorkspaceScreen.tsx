import { useState } from 'react';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { DesktopBusinessMessagesOrderContextScreen, type MessagesWorkspaceView } from './DesktopBusinessMessagesOrderContextScreen';
import { DesktopBusinessMessagesComposeScreen } from './DesktopBusinessMessagesComposeScreen';
import { DesktopBusinessMessagesBookingScreen } from './DesktopBusinessMessagesBookingScreen';
import { DesktopBusinessMessagesDealScreen } from './DesktopBusinessMessagesDealScreen';
import { DesktopBusinessMessagesSearchScreen } from './DesktopBusinessMessagesSearchScreen';

interface DesktopBusinessMessagesWorkspaceScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
}

export function DesktopBusinessMessagesWorkspaceScreen({ onNav }: DesktopBusinessMessagesWorkspaceScreenProps) {
  const [view, setView] = useState<MessagesWorkspaceView>('order-context');

  switch (view) {
    case 'compose':
      return <DesktopBusinessMessagesComposeScreen onNav={onNav} onView={setView} />;
    case 'booking':
      return <DesktopBusinessMessagesBookingScreen onNav={onNav} onView={setView} />;
    case 'deal':
      return <DesktopBusinessMessagesDealScreen onNav={onNav} onView={setView} />;
    case 'search':
      return <DesktopBusinessMessagesSearchScreen onNav={onNav} onView={setView} />;
    case 'order-context':
    default:
      return <DesktopBusinessMessagesOrderContextScreen onNav={onNav} onView={setView} />;
  }
}
