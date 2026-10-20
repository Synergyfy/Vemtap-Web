import { useState } from 'react';
import { Icon } from './ui/Icon';
import { AiDesignAssistantModal } from './AiDesignAssistantModal';
import {
  aiTriggerLabel,
  type AiAssetType,
  type AiImageAspect,
  type AiPromptContext,
} from '../scripts/aiDesignAssistant';

interface CreateWithAiButtonProps {
  /** Which asset the merchant is creating: logo, banner, product or service. */
  assetType: AiAssetType;
  /** Business/item facts available on the surrounding screen, if any. */
  context?: AiPromptContext;
  /** Matches the surrounding upload component's aspect ratio. */
  aspectRatio?: AiImageAspect;
  /** Accepted file types / size limits shown on the surrounding screen. */
  fileHint?: string;
  /** Overrides the contextual label (e.g. "Don't have a banner? …"). */
  label?: string;
  className?: string;
}

const DEFAULT_CLASS =
  'inline-flex items-center gap-1.5 text-primary font-caption text-caption font-semibold hover:underline text-left';

/**
 * Contextual "Create with AI" entry point placed next to an existing upload
 * control. It owns the AI Design Assistant modal's open state, so opening or
 * closing the modal never unmounts or resets the surrounding screen or form.
 * The existing Upload Image action stays untouched and always available.
 */
export function CreateWithAiButton({
  assetType,
  context,
  aspectRatio,
  fileHint,
  label,
  className = DEFAULT_CLASS,
}: CreateWithAiButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-haspopup="dialog"
        className={className}
        type="button"
        onClick={() => setOpen(true)}
      >
        <Icon className="text-[14px]" filled name="auto_awesome" />
        <span>{label ?? aiTriggerLabel(assetType)}</span>
      </button>
      <AiDesignAssistantModal
        open={open}
        assetType={assetType}
        aspectRatio={aspectRatio}
        context={context}
        fileHint={fileHint}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
