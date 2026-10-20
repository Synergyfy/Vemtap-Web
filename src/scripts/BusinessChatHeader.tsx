import { Icon } from '../components/ui/Icon';

interface BusinessChatHeaderProps {
  onBack: () => void;
  /** Name of the customer or business being chatted with. */
  title?: string;
  /** Profile image of the contact, when available. */
  avatar?: string;
  /** Renders the storefront identity icon instead of the customer icon. */
  isBusiness?: boolean;
  subtitle?: string;
  onAvatar?: () => void;
  onCall?: () => void;
  onMore?: () => void;
}

export function BusinessChatHeader({
  onBack,
  title = 'Business Chat',
  avatar,
  isBusiness = false,
  subtitle = 'Active inquiry • Order #8491',
  onAvatar,
  onCall,
  onMore,
}: BusinessChatHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-space-sm flex items-center justify-between gap-space-2xs">
        <div className="flex items-center gap-space-xs min-w-0 flex-1">
          <button
            aria-label="Back to messages"
            className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:text-primary transition-colors"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[24px]" />
          </button>
          <button
            aria-label={`View ${title} profile`}
            className="relative flex-shrink-0 rounded-full active:scale-95 transition-transform"
            type="button"
            onClick={onAvatar}
          >
            {avatar ? (
              <img
                alt={title}
                className="w-10 h-10 rounded-full object-cover shadow-sm"
                src={avatar}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <Icon name={isBusiness ? 'storefront' : 'account_circle'} className="text-[20px]" />
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-badge-discount-text ring-2 ring-surface" />
          </button>
          <div className="flex flex-col min-w-0 flex-1">
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">{title}</h1>
            <span className="font-caption text-caption text-text-secondary truncate">{subtitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-space-2xs">
          <button
            aria-label={`Call ${title}`}
            className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary transition-colors"
            type="button"
            onClick={onCall}
          >
            <Icon name="call" className="text-[22px]" />
          </button>
          <button
            aria-label="More options"
            className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
            type="button"
            onClick={onMore}
          >
            <Icon name="more_vert" className="text-[22px]" />
          </button>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-2xs">
            <Icon name="person" className="text-on-primary text-[18px]" />
          </div>
        </div>
      </div>
    </header>
  );
}
