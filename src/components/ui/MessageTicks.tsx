import { Icon } from './Icon';
import type { MessageTick } from '../../services/messageService';

/** Sending clock, one tick sent, two ticks delivered, two blue ticks read. */
export function MessageTicks({ tick, size = 15 }: { tick?: MessageTick; size?: number }) {
  if (!tick) return null;
  const style = { fontSize: size };
  if (tick === 'failed') return <Icon name="error" filled aria-label="Not sent" className="text-error" style={style} />;
  if (tick === 'pending') return <Icon name="schedule" aria-label="Sending" className="text-text-tertiary" style={style} />;
  if (tick === 'sent') return <Icon name="done" aria-label="Sent" className="text-text-tertiary" style={style} />;
  return (
    <Icon
      name="done_all"
      aria-label={tick === 'read' ? 'Read' : 'Delivered'}
      className={tick === 'read' ? 'text-primary' : 'text-text-tertiary'}
      style={style}
    />
  );
}
