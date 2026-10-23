import { Icon } from '../ui/Icon';

/** Card-style link from a summary settings tab to its full settings page. */
export function MoreSettingsLink({ icon, title, body, onClick }: { icon: string; title: string; body: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-space-sm p-space-md rounded-xl bg-surface-tint-blue text-left hover:bg-surface-container-low transition-colors"
    >
      <span className="w-10 h-10 rounded-lg bg-surface-canvas text-primary flex items-center justify-center shrink-0">
        <Icon name={icon} className="text-[20px]" />
      </span>
      <span className="flex flex-col flex-1 min-w-0">
        <span className="font-label-md text-label-md text-text-primary font-semibold">{title}</span>
        <span className="font-caption text-caption text-text-secondary">{body}</span>
      </span>
      <Icon name="chevron_right" className="text-[20px] text-text-tertiary" />
    </button>
  );
}
