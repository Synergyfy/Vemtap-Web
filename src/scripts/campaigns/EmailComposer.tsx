import { Fragment, useMemo, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { TemplatePicker, TokenPicker } from '../../components/campaigns/TemplatePicker';
import {
  BUSINESS_NAME,
  SAMPLE_CAMPAIGN_CONTACTS,
  findUnknownTokens,
  isValidEmail,
  renderPersonalisation,
  type AudienceOutcome,
  type CampaignRecord,
  type MessageTemplate,
} from './campaignsData';

export interface EmailComposerProps {
  draft: CampaignRecord;
  outcome: AudienceOutcome;
  activeTemplateKey?: string;
  errors: Record<string, string>;
  /** Field errors only appear once the step was attempted (Continue clicked). */
  showErrors?: boolean;
  onChange: (patch: Partial<CampaignRecord>) => void;
  onApplyTemplate: (template: MessageTemplate) => void;
  onOpenSettings: () => void;
}

type PreviewMode = 'desktop' | 'mobile';

const SAMPLE_RECIPIENT = SAMPLE_CAMPAIGN_CONTACTS[3];

/** Email composer: subject, preheader, sender, plain-text body with light
 * formatting, personalisation and a desktop / mobile preview. */
export function EmailComposer({
  draft,
  outcome,
  activeTemplateKey,
  errors,
  showErrors,
  onChange,
  onApplyTemplate,
  onOpenSettings,
}: EmailComposerProps) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');

  const subject = draft.emailSubject ?? '';
  const preheader = draft.emailPreheader ?? '';
  const body = draft.emailBody ?? '';
  const senderName = draft.senderName ?? '';
  const senderEmail = draft.senderEmail ?? '';
  const fieldErrors = showErrors ? errors : {};

  const unknownTokens = useMemo(
    () => [...new Set([...findUnknownTokens(subject), ...findUnknownTokens(body)])],
    [subject, body],
  );

  const insertToken = (token: string) => {
    const textarea = bodyRef.current;
    const text = body;
    if (!textarea) {
      onChange({ emailBody: `${text}${token}` });
      return;
    }
    const start = textarea.selectionStart ?? text.length;
    const end = textarea.selectionEnd ?? start;
    const next = `${text.slice(0, start)}${token}${text.slice(end)}`;
    onChange({ emailBody: next });
    window.requestAnimationFrame(() => {
      textarea.focus();
      const caret = start + token.length;
      textarea.setSelectionRange(caret, caret);
    });
  };

  const applyFormat = (before: string, after: string, placeholder: string) => {
    const textarea = bodyRef.current;
    const text = body;
    const start = textarea?.selectionStart ?? text.length;
    const end = textarea?.selectionEnd ?? start;
    const selected = text.slice(start, end) || placeholder;
    const next = `${text.slice(0, start)}${before}${selected}${after}${text.slice(end)}`;
    onChange({ emailBody: next });
    window.requestAnimationFrame(() => {
      textarea?.focus();
      const from = start + before.length;
      textarea?.setSelectionRange(from, from + selected.length);
    });
  };

  const previewSubject = renderPersonalisation(subject, SAMPLE_RECIPIENT);
  const previewPreheader = renderPersonalisation(preheader, SAMPLE_RECIPIENT);
  const previewBody = renderPersonalisation(body, SAMPLE_RECIPIENT);
  const senderReady = isValidEmail(senderEmail);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg items-start">
      {/* Editor */}
      <div className="flex flex-col gap-space-md rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle p-space-lg">
        <TemplatePicker channel="email" onApply={onApplyTemplate} activeKey={activeTemplateKey} />

        {/* Sender */}
        <div className="flex flex-col gap-space-sm">
          <span className="font-label-sm text-label-sm text-text-secondary">From</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
            <Field
              id="email-sender-name"
              label="Sender name"
              value={senderName}
              error={fieldErrors.senderName}
              onChange={(value) => onChange({ senderName: value })}
              placeholder={BUSINESS_NAME}
            />
            <Field
              id="email-sender-email"
              label="Sender email"
              type="email"
              value={senderEmail}
              error={fieldErrors.senderEmail}
              onChange={(value) => onChange({ senderEmail: value })}
              placeholder="hello@yourbusiness.com"
            />
          </div>
          {!senderReady && showErrors && (
            <p className="flex items-start gap-space-2xs rounded-lg bg-error-container/60 p-space-sm font-label-sm text-label-sm text-on-error">
              <Icon name="warning" className="text-[16px] shrink-0 mt-0.5" />
              <span>
                No verified sending address yet. Add your business email (and verify the sending domain with a provider) in{' '}
                <button type="button" onClick={onOpenSettings} className="underline font-semibold">
                  More → Business Settings
                </button>
                . Nothing is sent from an unverified identity in this demo.
              </span>
            </p>
          )}
        </div>

        {/* Subject + preheader */}
        <Field
          id="email-subject"
          label="Subject line"
          value={subject}
          error={fieldErrors.subject}
          onChange={(value) => onChange({ emailSubject: value })}
          placeholder="20% off this week at {{business_name}}"
          counter={`${subject.length}/120`}
        />
        <Field
          id="email-preheader"
          label="Preview text (optional)"
          value={preheader}
          onChange={(value) => onChange({ emailPreheader: value })}
          placeholder="Shown after the subject in most inboxes"
          hint="Recipients see this next to the subject line."
        />

        {/* Body */}
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center justify-between gap-space-xs">
            <label htmlFor="email-body" className="font-label-sm text-label-sm text-text-secondary">
              Email content
            </label>
            <div className="flex items-center gap-1">
              <ToolButton label="Bold" icon="format_bold" onClick={() => applyFormat('**', '**', 'bold text')} />
              <ToolButton label="Italic" icon="format_italic" onClick={() => applyFormat('*', '*', 'italic text')} />
              <ToolButton label="Bulleted list" icon="format_list_bulleted" onClick={() => applyFormat('\n- ', '', 'list item')} />
              <ToolButton label="Insert link" icon="link" onClick={() => applyFormat('[', '](https://)', 'link text')} />
            </div>
          </div>
          <textarea
            id="email-body"
            ref={bodyRef}
            value={body}
            rows={10}
            onChange={(event) => onChange({ emailBody: event.target.value })}
            placeholder={'Hi {{first_name}},\n\nWe have something new for you…\n\n- First point\n- Second point'}
            aria-invalid={!!fieldErrors.body}
            className={`w-full resize-y rounded-xl bg-surface-container-lowest shadow-sm px-3.5 py-3 font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/40 ${
              fieldErrors.body ? 'ring-2 ring-error' : ''
            }`}
          />
          <div className="flex flex-wrap items-center justify-between gap-space-xs pt-1">
            <TokenPicker onInsert={insertToken} />
            <span className="font-caption text-caption text-text-tertiary">**bold** · *italic* · [label](https://…)</span>
          </div>
          {fieldErrors.body && (
            <span role="alert" className="flex items-center gap-1 font-label-sm text-label-sm text-on-error pt-1">
              <Icon name="error" className="text-[15px]" />
              {fieldErrors.body}
            </span>
          )}
          {unknownTokens.length > 0 && !fieldErrors.body && (
            <span role="alert" className="flex items-center gap-1 font-label-sm text-label-sm text-on-error pt-1">
              <Icon name="warning" className="text-[15px]" />
              Unsupported personalisation tag: {unknownTokens.join(', ')}
            </span>
          )}
        </div>

        <div className="rounded-xl bg-surface-subtle p-space-sm space-y-space-2xs">
          <div className="flex items-center gap-space-2xs">
            <Icon name="mark_email_read" className="text-primary text-[18px]" />
            <span className="font-label-sm text-label-sm text-text-primary font-semibold">Unsubscribe footer</span>
          </div>
          <p className="font-caption text-caption text-text-secondary leading-relaxed">
            A compliant unsubscribe link is shown in the footer below. Once an email provider is connected it adds and
            tracks the real unsubscribe link, honouring every opt-out automatically.
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="flex flex-col gap-space-sm xl:sticky xl:top-20">
        <div className="flex items-center justify-between gap-space-sm">
          <span className="font-label-sm text-label-sm text-text-secondary">Preview</span>
          <div className="flex items-center gap-1 p-1 rounded-full bg-surface-container-low">
            {(['desktop', 'mobile'] as PreviewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={previewMode === mode}
                onClick={() => setPreviewMode(mode)}
                className={`flex items-center gap-1 px-space-sm py-1 rounded-full font-label-sm text-label-sm transition-colors ${
                  previewMode === mode ? 'bg-surface-canvas text-primary shadow-sm font-semibold' : 'text-text-secondary'
                }`}
              >
                <Icon name={mode === 'desktop' ? 'desktop_windows' : 'smartphone'} className="text-[15px]" />
                {mode === 'desktop' ? 'Desktop' : 'Mobile'}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`mx-auto w-full rounded-2xl border border-border-subtle bg-white shadow-md overflow-hidden transition-all ${
            previewMode === 'mobile' ? 'max-w-[340px]' : 'max-w-full'
          }`}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-subtle border-b border-border-subtle">
            <span className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
            </span>
            <span className="font-caption text-caption text-text-tertiary truncate">
              {previewMode === 'mobile' ? 'Mobile inbox' : 'Desktop inbox'}
            </span>
          </div>

          <div className="px-4 py-3 border-b border-border-subtle">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                <Icon name="storefront" className="text-[14px]" />
              </span>
              <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate">
                {senderName.trim() || BUSINESS_NAME}
              </span>
              <span className="font-caption text-caption text-text-tertiary truncate">
                &lt;{senderEmail.trim() || 'sender@yourbusiness.com'}&gt;
              </span>
            </div>
            <p className="font-label-md text-label-md text-text-primary font-semibold break-words">
              {previewSubject.trim() || 'Your subject line appears here'}
            </p>
            {previewPreheader.trim() && (
              <p className="font-caption text-caption text-text-secondary break-words">{previewPreheader}</p>
            )}
          </div>

          <div className="px-4 py-4 max-h-[420px] overflow-y-auto">
            <div className="font-body-md text-body-md text-text-primary leading-relaxed break-words">
              {previewBody.trim() ? renderRichText(previewBody) : <span className="text-text-tertiary">Your email content appears here.</span>}
            </div>
            <div className="mt-space-md pt-space-sm border-t border-border-subtle">
              <p className="font-caption text-caption text-text-tertiary leading-relaxed">
                You are receiving this email because you opted in to updates from {BUSINESS_NAME}.
              </p>
              <button type="button" className="mt-1 font-caption text-caption text-primary underline pointer-events-none">
                Unsubscribe
              </button>
            </div>
          </div>
        </div>

        <p className="font-caption text-caption text-text-tertiary text-center">
          Sample recipient: {SAMPLE_RECIPIENT.name} · {formatRecipientCount(outcome.eligible.length)} would receive this email.
        </p>
      </div>
    </div>
  );
}

function formatRecipientCount(count: number): string {
  return `${count.toLocaleString('en-NG')} ${count === 1 ? 'recipient' : 'recipients'}`;
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  hint?: string;
  counter?: string;
  type?: string;
}

function Field({ id, label, value, onChange, error, placeholder, hint, counter, type = 'text' }: FieldProps) {
  return (
    <div className="flex flex-col gap-space-2xs">
      <div className="flex items-center justify-between gap-space-xs">
        <label htmlFor={id} className="font-label-sm text-label-sm text-text-secondary">
          {label}
        </label>
        {counter && <span className="font-caption text-caption text-text-tertiary">{counter}</span>}
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={`min-h-11 px-3.5 rounded-xl bg-surface-container-lowest shadow-sm font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/40 ${
          error ? 'ring-2 ring-error' : ''
        }`}
      />
      {hint && !error && <span className="font-caption text-caption text-text-tertiary">{hint}</span>}
      {error && (
        <span role="alert" className="flex items-center gap-1 font-label-sm text-label-sm text-on-error">
          <Icon name="error" className="text-[15px]" />
          {error}
        </span>
      )}
    </div>
  );
}

function ToolButton({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle hover:text-on-surface transition-colors"
    >
      <Icon name={icon} className="text-[18px]" />
    </button>
  );
}

/** Very small, safe rich-text renderer: **bold**, *italic*, [label](url) and - lists. */
function renderRichText(text: string): ReactNode {
  const blocks = text.split(/\n{2,}/);
  return blocks.map((block, blockIndex) => {
    const lines = block.split('\n');
    const listLike = lines.every((line) => /^\s*[-•]\s+/.test(line));
    if (listLike) {
      return (
        <ul key={blockIndex} className="list-disc pl-5 mb-3 space-y-1">
          {lines.map((line, lineIndex) => (
            <li key={lineIndex}>{renderInline(line.replace(/^\s*[-•]\s+/, ''))}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={blockIndex} className="mb-3">
        {lines.map((line, lineIndex) => (
          <Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            {renderInline(line)}
          </Fragment>
        ))}
      </p>
    );
  });
}

const INLINE_PATTERN = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|https?:\/\/\S+)/g;

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push(text.slice(cursor, index));
    const token = match[0];
    if (token.startsWith('**')) parts.push(<strong key={index}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith('*')) parts.push(<em key={index}>{token.slice(1, -1)}</em>);
    else {
      const link = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      parts.push(
        link ? (
          <a key={index} className="text-primary underline" href={link[2]} rel="noreferrer" target="_blank">
            {link[1]}
          </a>
        ) : (
          <a key={index} className="text-primary underline break-all" href={token} rel="noreferrer" target="_blank">
            {token}
          </a>
        ),
      );
    }
    cursor = index + token.length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}
