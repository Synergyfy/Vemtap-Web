import { useEffect, useRef, useState } from 'react';
import { DesktopModal, ModalCloseButton } from './desktop/DesktopModal';
import { Icon } from './ui/Icon';
import { copyTextToClipboard } from '../scripts/referralData';
import {
  AI_ASSET_LABELS,
  AI_PROVIDERS,
  buildAiPrompt,
  type AiAssetType,
  type AiImageAspect,
  type AiPromptContext,
} from '../scripts/aiDesignAssistant';

interface AiDesignAssistantModalProps {
  open: boolean;
  onClose: () => void;
  /** Which asset the merchant is creating: logo, banner, product or service. */
  assetType: AiAssetType;
  /** Business/item facts available on the surrounding screen, if any. */
  context?: AiPromptContext;
  /** Matches the surrounding upload component's aspect ratio. */
  aspectRatio?: AiImageAspect;
  /** Accepted file types / size limits shown on the surrounding screen. */
  fileHint?: string;
}

const STEPS = [
  'Copy the prepared prompt and open an AI tool below.',
  'Generate and download the image on that provider’s website.',
  'Return to this screen and upload the downloaded image with the existing upload button.',
] as const;

type CopyState = 'idle' | 'copied' | 'failed';

/**
 * AI Design Assistant — prepares a tailored prompt from frontend business
 * data and points the merchant at an external AI provider. VEMTAP never
 * generates or stores images here: the merchant downloads the result on the
 * provider's site and uploads it through the existing upload flow after this
 * modal closes. Opening/closing only toggles local state, so the surrounding
 * screen and its form state are preserved untouched.
 */
export function AiDesignAssistantModal({
  open,
  onClose,
  assetType,
  context,
  aspectRatio,
  fileHint,
}: AiDesignAssistantModalProps) {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [copiedTo, setCopiedTo] = useState<string | null>(null);
  const [editedPrompt, setEditedPrompt] = useState<string | null>(null);
  const promptRef = useRef<HTMLTextAreaElement | null>(null);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!open) return undefined;
    setCopyState('idle');
    setCopiedTo(null);
    setEditedPrompt(null);
    return () => {
      if (resetTimer.current !== undefined) {
        window.clearTimeout(resetTimer.current);
        resetTimer.current = undefined;
      }
    };
  }, [open]);

  const prompt = open ? (editedPrompt ?? buildAiPrompt(assetType, context, { aspectRatio })) : '';

  const reportCopy = (ok: boolean, providerName?: string) => {
    setCopyState(ok ? 'copied' : 'failed');
    setCopiedTo(ok ? providerName ?? null : null);
    if (!ok) promptRef.current?.select();
    if (resetTimer.current !== undefined) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => {
      setCopyState('idle');
      setCopiedTo(null);
    }, 4000);
  };

  const handleCopy = async () => {
    reportCopy(await copyTextToClipboard(prompt));
  };

  // Runs alongside the anchor's normal navigation (a new tab is not a popup,
  // so it is never blocked). Clipboard failure degrades to the selectable
  // textarea above with a visible message.
  const handleProviderClick = (providerName: string) => {
    void copyTextToClipboard(prompt).then((ok) => reportCopy(ok, providerName));
  };

  const statusText =
    copyState === 'copied'
      ? copiedTo
        ? `Prompt copied — paste it into ${copiedTo}.`
        : 'Prompt copied to clipboard.'
      : copyState === 'failed'
        ? 'Automatic copy was blocked. Select the prompt above and copy it manually.'
        : '';

  return (
    <DesktopModal open={open} onClose={onClose} maxWidth="max-w-lg">
      <div className="overflow-y-auto p-space-xl flex flex-col gap-space-md">
        {/* Header */}
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs min-w-0">
            <span className="w-10 h-10 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
              <Icon filled name="auto_awesome" className="text-[20px]" />
            </span>
            <div className="flex flex-col min-w-0">
              <h2 className="font-heading-sm text-heading-sm text-text-primary">AI Design Assistant</h2>
              <span className="font-caption text-caption text-text-secondary">
                Create images with external AI tools
              </span>
            </div>
          </div>
          <ModalCloseButton onClose={onClose} />
        </div>

        {/* Asset identification */}
        <div className="flex flex-wrap items-center gap-space-xs">
          <span className="px-space-sm py-space-2xs rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold">
            Creating: {AI_ASSET_LABELS[assetType]}
          </span>
          {fileHint && (
            <span className="px-space-sm py-space-2xs rounded-full bg-surface-container font-caption text-caption text-text-secondary">
              {fileHint}
            </span>
          )}
        </div>

        {/* How it works */}
        <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
          VEMTAP prepared a prompt below from your business and item details. Review or edit it, then copy
          it into ChatGPT or Google Gemini, generate and download the image on their website, and come
          back here to upload it. VEMTAP does not generate images — your own AI provider account and its
          limits apply.
        </p>

        <ol className="flex flex-col gap-space-xs bg-surface-tint-blue rounded-xl p-space-sm">
          {STEPS.map((step, index) => (
            <li className="flex items-start gap-space-xs" key={step}>
              <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold shrink-0">
                {index + 1}
              </span>
              <span className="font-caption text-caption text-on-secondary-container leading-relaxed">
                {step}
              </span>
            </li>
          ))}
        </ol>

        {/* Prepared prompt + copy action */}
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center justify-between gap-space-xs">
            <label className="font-label-sm text-label-sm text-text-secondary font-semibold" htmlFor="ai-design-prompt">
              Prepared prompt
            </label>
            <button
              className={`h-9 px-space-sm rounded-lg font-button-secondary text-button-secondary flex items-center gap-1.5 shadow-sm transition-colors ${
                copyState === 'copied'
                  ? 'bg-surface-tint-blue text-badge-discount-text'
                  : 'bg-primary-container text-on-primary hover:bg-primary'
              }`}
              type="button"
              onClick={handleCopy}
            >
              <Icon className="text-[16px]" name={copyState === 'copied' ? 'check' : 'content_copy'} />
              <span>{copyState === 'copied' ? 'Copied' : 'Copy Prompt'}</span>
            </button>
          </div>
          <textarea
            className="w-full h-36 rounded-xl bg-surface-subtle border border-border-subtle p-space-sm font-caption text-caption text-text-primary leading-relaxed resize-none focus:outline-none focus:shadow-[0_0_0_2px_#066cf4]"
            id="ai-design-prompt"
            ref={promptRef}
            value={prompt}
            onChange={(event) => setEditedPrompt(event.target.value)}
          />
          <p className="font-caption text-caption text-text-tertiary">
            Editable — tweak the wording before copying it into your AI tool.
          </p>
          <p
            aria-live="polite"
            className={`font-caption text-caption font-semibold ${
              copyState === 'failed' ? 'text-error' : 'text-badge-discount-text'
            }`}
          >
            {statusText}
          </p>
        </div>

        {/* External providers */}
        <div className="flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm text-text-secondary font-semibold">
            Open an AI tool
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
            {AI_PROVIDERS.map((provider) => (
              <a
                className="h-11 px-space-md rounded-xl bg-surface-tint-blue hover:bg-surface-container text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs shadow-sm transition-colors"
                href={provider.url}
                key={provider.id}
                rel="noopener noreferrer"
                target="_blank"
                onClick={() => handleProviderClick(provider.name)}
              >
                <span>Open {provider.name}</span>
                <Icon className="text-[16px]" name="open_in_new" />
              </a>
            ))}
          </div>
          <p className="font-caption text-caption text-text-tertiary leading-relaxed">
            Opens in a new tab. The prompt is copied for you when possible — paste it into the chat
            once it loads.
          </p>
        </div>

        {/* Download reminder + image quality note */}
        <div className="rounded-xl bg-surface-subtle p-space-sm flex flex-col gap-space-xs">
          <p className="font-caption text-caption text-text-secondary leading-relaxed">
            <span className="font-semibold text-text-primary">Download the image</span> from the AI
            tool before uploading it — providers keep generated images in their own account.
          </p>
          <p className="font-caption text-caption text-text-secondary leading-relaxed">
            AI-generated imagery is an approximation and may differ from your real product or
            storefront. Use accurate real photos whenever appearance matters. Image sizes, downloads
            and availability are controlled by the provider you choose.
          </p>
        </div>

        {/* Return to the existing upload flow */}
        <button
          className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-sm hover:bg-primary transition-colors"
          type="button"
          onClick={onClose}
        >
          <Icon className="text-[18px]" name="arrow_back" />
          <span>Back to upload</span>
        </button>
      </div>
    </DesktopModal>
  );
}

