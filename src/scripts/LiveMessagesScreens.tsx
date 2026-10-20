import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
import { MessagesPanel } from '../components/business/MessagesPanel';
import { DesktopBusinessPage } from './desktop/DesktopBusinessPage';

interface LiveMessagesProps {
  initialThreadId?: string | null;
  onOpenCustomer: (customerId: string) => void;
}

/** Live branch inbox — mobile. */
export function LiveMessagesScreen({ onBack, ...props }: LiveMessagesProps & { onBack: () => void }) {
  return (
    <BusinessSubScreen title="Messages" onBack={onBack}>
      <MessagesPanel {...props} />
    </BusinessSubScreen>
  );
}

/** Live branch inbox — desktop. */
export function DesktopLiveMessagesScreen({ onNav, ...props }: LiveMessagesProps & { onNav: (key: string) => void }) {
  return (
    <DesktopBusinessPage activeNav="messages-inapp" onNav={onNav} crumbs={[{ label: 'Messages' }]} title="Messages" subtitle="Conversations with your customers at this branch.">
      <MessagesPanel {...props} />
    </DesktopBusinessPage>
  );
}
