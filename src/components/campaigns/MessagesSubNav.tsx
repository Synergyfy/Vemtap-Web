import { Icon } from '../ui/Icon';

export type MessagesChannelKey = 'chat' | 'sms' | 'email';

interface MessagesSubNavProps {
  active: MessagesChannelKey;
  onSelect: (key: MessagesChannelKey) => void;
}

/**
 * Sub-navigation inside the Messages section: In-App Chat, SMS
 * and Email. On desktop the same three channels live in the Messages
 * side rail; this tab bar is the mobile equivalent so campaigns never become a
 * separate top-level destination.
 */
const CHANNELS: Array<{ key: MessagesChannelKey; label: string; icon: string }> = [
  { key: 'chat', label: 'In-App Chat', icon: 'chat' },
  { key: 'sms', label: 'SMS', icon: 'sms' },
  { key: 'email', label: 'Email', icon: 'mail' },
];

export function MessagesSubNav({ active, onSelect }: MessagesSubNavProps) {
  return (
    <nav aria-label="Messages channels" className="w-full bg-surface-canvas border-b border-border-subtle">
      <div className="flex items-stretch gap-space-xs px-margin overflow-x-auto no-scrollbar">
        {CHANNELS.map((channel) => {
          const isActive = channel.key === active;
          return (
            <button
              key={channel.key}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onSelect(channel.key)}
              className={`flex shrink-0 items-center gap-1.5 px-space-2xs py-2.5 border-b-2 font-label-md text-label-md transition-colors ${
                isActive
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-text-secondary hover:text-on-surface'
              }`}
            >
              <Icon name={channel.icon} className="text-[17px]" />
              <span className="whitespace-nowrap">{channel.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
