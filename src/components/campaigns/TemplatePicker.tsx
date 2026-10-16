import { Icon } from '../ui/Icon';
import {
  PERSONALISATION_TOKENS,
  type CampaignChannel,
  type MessageTemplate,
  templatesFor,
} from '../../scripts/campaigns/campaignsData';

interface TemplatePickerProps {
  channel: CampaignChannel;
  onApply: (template: MessageTemplate) => void;
  /** Key of the template currently loaded into the composer, if any. */
  activeKey?: string;
}

/**
 * Starter templates. Applying one only fills the composer — nothing is sent
 * until the business confirms on the review step.
 */
export function TemplatePicker({ channel, onApply, activeKey }: TemplatePickerProps) {
  const templates = templatesFor(channel);
  return (
    <div className="flex flex-col gap-space-xs">
      <div className="flex items-center justify-between gap-space-sm">
        <span className="font-label-sm text-label-sm text-text-secondary">Start from a template</span>
        <span className="font-caption text-caption text-text-tertiary">Editable — never sends on its own</span>
      </div>
      <div className="flex gap-space-xs overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        {templates.map((template) => {
          const active = template.key === activeKey;
          return (
            <button
              key={template.key}
              type="button"
              onClick={() => onApply(template)}
              className={`shrink-0 w-[190px] text-left rounded-xl border p-space-sm transition-colors ${
                active ? 'border-primary bg-surface-tint-blue' : 'border-border-subtle hover:bg-surface-subtle'
              }`}
            >
              <span className="flex items-center gap-space-2xs mb-1">
                <Icon name="article" className={`text-[16px] ${active ? 'text-primary' : 'text-text-tertiary'}`} />
                <span className={`font-label-md text-label-md truncate ${active ? 'text-primary font-semibold' : 'text-text-primary font-medium'}`}>
                  {template.title}
                </span>
              </span>
              <span className="font-caption text-caption text-text-secondary line-clamp-2">{template.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface TokenPickerProps {
  onInsert: (token: string) => void;
  disabled?: boolean;
}

/** Personalisation chips limited to fields the contact record actually has. */
export function TokenPicker({ onInsert, disabled }: TokenPickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-space-2xs">
      <span className="font-caption text-caption text-text-secondary mr-1">Personalise:</span>
      {PERSONALISATION_TOKENS.map((entry) => (
        <button
          key={entry.token}
          type="button"
          disabled={disabled}
          title={`Inserts ${entry.sample}`}
          onClick={() => onInsert(entry.token)}
          className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold hover:bg-primary-container hover:text-on-primary transition-colors disabled:opacity-50"
        >
          <Icon name="add_circle" className="text-[13px]" />
          {entry.label}
        </button>
      ))}
    </div>
  );
}
