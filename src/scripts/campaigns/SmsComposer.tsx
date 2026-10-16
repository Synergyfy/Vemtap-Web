import { useMemo, useRef } from 'react';
import { Icon } from '../../components/ui/Icon';
import { TemplatePicker, TokenPicker } from '../../components/campaigns/TemplatePicker';
import {
  BUSINESS_NAME,
  CAMPAIGN_TIMEZONE,
  SAMPLE_CAMPAIGN_CONTACTS,
  SMS_CREDIT_BALANCE,
  SMS_CREDIT_BUNDLE,
  analyseSms,
  estimateSmsCost,
  findUnknownTokens,
  formatClock,
  formatNaira,
  formatNumber,
  renderPersonalisation,
  type AudienceOutcome,
  type CampaignRecord,
  type MessageTemplate,
} from './campaignsData';

export interface SmsComposerProps {
  draft: CampaignRecord;
  outcome: AudienceOutcome;
  activeTemplateKey?: string;
  error?: string;
  /** Field errors only appear once the step was attempted (Continue clicked). */
  showErrors?: boolean;
  onChange: (patch: Partial<CampaignRecord>) => void;
  onApplyTemplate: (template: MessageTemplate) => void;
}

const SAMPLE_RECIPIENT = SAMPLE_CAMPAIGN_CONTACTS[3];
const OPT_OUT_LINE = 'Reply STOP to opt out.';

/**
 * SMS composer: character and segment maths, personalisation, phone preview
 * and a clearly-labelled cost estimate built from the only pricing data the
 * project has (the SMS credit bundle on Add-ons).
 */
export function SmsComposer({ draft, outcome, activeTemplateKey, error, showErrors, onChange, onApplyTemplate }: SmsComposerProps) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const body = draft.smsBody ?? '';
  const link = draft.smsLink ?? '';
  const fieldError = showErrors ? error : undefined;

  const analysis = useMemo(() => analyseSms(body), [body]);
  const unknownTokens = useMemo(() => findUnknownTokens(body), [body]);
  const cost = useMemo(() => estimateSmsCost(analysis.segments, outcome.eligible.length), [analysis.segments, outcome.eligible.length]);

  const insertToken = (token: string) => {
    const textarea = bodyRef.current;
    const text = body;
    if (!textarea) {
      onChange({ smsBody: `${text}${token}` });
      return;
    }
    const start = textarea.selectionStart ?? text.length;
    const end = textarea.selectionEnd ?? start;
    const next = `${text.slice(0, start)}${token}${text.slice(end)}`;
    onChange({ smsBody: next });
    window.requestAnimationFrame(() => {
      textarea.focus();
      const caret = start + token.length;
      textarea.setSelectionRange(caret, caret);
    });
  };

  const addOptOutLine = () => {
    if (/reply\s+stop/i.test(body)) return;
    onChange({ smsBody: body.trim() ? `${body.trim()}\n${OPT_OUT_LINE}` : OPT_OUT_LINE });
  };

  const setLink = (value: string) => onChange({ smsLink: value });

  /** Commit the link into the message body so counters stay honest. */
  const commitLink = () => {
    const trimmed = (draft.smsLink ?? '').trim();
    if (!trimmed) return;
    onChange({ smsBody: ensureLink(body, trimmed) });
  };

  const previewBody = renderPersonalisation(body, SAMPLE_RECIPIENT);
  const segments = analysis.segments === 0 ? 1 : analysis.segments;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg items-start">
      {/* Editor */}
      <div className="flex flex-col gap-space-md rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle p-space-lg">
        <TemplatePicker channel="sms" onApply={onApplyTemplate} activeKey={activeTemplateKey} />

        <div className="flex flex-col gap-space-2xs">
          <label htmlFor="sms-body" className="font-label-sm text-label-sm text-text-secondary">
            Message
          </label>
          <textarea
            id="sms-body"
            ref={bodyRef}
            value={body}
            rows={5}
            onChange={(event) => onChange({ smsBody: event.target.value })}
            placeholder="Hi {{first_name}}, your offer is waiting at our shop…"
            aria-invalid={!!fieldError}
            className={`w-full resize-y rounded-xl bg-surface-container-lowest shadow-sm px-3.5 py-3 font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/40 ${
              fieldError ? 'ring-2 ring-error' : ''
            }`}
          />
          <div className="flex flex-wrap items-center justify-between gap-space-xs pt-1">
            <TokenPicker onInsert={insertToken} />
            <span className="font-caption text-caption text-text-tertiary">Personalisation uses stored contact fields</span>
          </div>
          {fieldError && (
            <span role="alert" className="flex items-center gap-1 font-label-sm text-label-sm text-on-error pt-1">
              <Icon name="error" className="text-[15px]" />
              {fieldError}
            </span>
          )}
          {unknownTokens.length > 0 && !fieldError && (
            <span role="alert" className="flex items-center gap-1 font-label-sm text-label-sm text-on-error pt-1">
              <Icon name="warning" className="text-[15px]" />
              Unsupported personalisation tag: {unknownTokens.join(', ')}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-space-2xs">
          <label htmlFor="sms-link" className="font-label-sm text-label-sm text-text-secondary">
            Link (optional)
          </label>
          <div className="flex items-center gap-space-xs bg-surface-container-lowest shadow-sm rounded-xl px-3.5 min-h-11">
            <Icon name="link" className="text-text-tertiary text-[18px]" />
            <input
              id="sms-link"
              type="url"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              onBlur={commitLink}
              placeholder="https://vemtap.com/your-offer"
              className="flex-1 min-w-0 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none"
            />
          </div>
          <span className="font-caption text-caption text-text-tertiary">
            The link is added to the message when you leave the field and counts towards the segment total.
          </span>
        </div>

        {/* Live counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-2xs">
          <Counter label="Characters" value={formatNumber(analysis.characters)} />
          <Counter label="Encoding" value={analysis.encoding} />
          <Counter label="Segments / recipient" value={formatNumber(segments)} highlight={segments > 1} />
          <Counter label="Eligible recipients" value={formatNumber(outcome.eligible.length)} />
        </div>

        {analysis.overLimit && (
          <p role="alert" className="flex items-start gap-space-2xs rounded-lg bg-error-container/60 p-space-sm font-label-sm text-label-sm text-on-error">
            <Icon name="warning" className="text-[16px] shrink-0 mt-0.5" />
            This message is longer than most carriers allow (10 segments). Shorten it before sending.
          </p>
        )}
        {analysis.encoding === 'UCS-2' && !analysis.overLimit && (
          <p className="flex items-start gap-space-2xs rounded-lg bg-surface-subtle p-space-sm font-caption text-caption text-text-secondary">
            <Icon name="info" className="text-primary text-[16px] shrink-0 mt-0.5" />
            Emoji or non-Latin characters switch the message to UCS-2 encoding, which carries only {analysis.perSegment}{' '}
            characters per segment.
          </p>
        )}

        {/* Compliance reminder — provider rules differ, so nothing is hard-coded as universal. */}
        <div className="rounded-xl bg-surface-subtle p-space-sm space-y-space-2xs">
          <div className="flex items-center gap-space-2xs">
            <Icon name="verified_user" className="text-primary text-[18px]" />
            <span className="font-label-sm text-label-sm text-text-primary font-semibold">Consent &amp; opt-out</span>
          </div>
          <p className="font-caption text-caption text-text-secondary leading-relaxed">
            Only contacts with a marketing opt-in and a valid number are included. Add an opt-out line unless your provider
            handles STOP keywords centrally — rules differ by provider and country.
          </p>
          {!/reply\s+stop/i.test(body) && (
            <button
              type="button"
              onClick={addOptOutLine}
              className="inline-flex items-center gap-1 h-9 px-space-sm rounded-lg border border-border-subtle bg-surface-canvas font-label-sm text-label-sm text-primary hover:bg-surface-tint-blue transition-colors"
            >
              <Icon name="add" className="text-[16px]" />
              Add opt-out line
            </button>
          )}
        </div>

        {/* Cost estimate — clearly marked, derived from the Add-ons credit bundle. */}
        <div className="rounded-xl border border-border-subtle p-space-sm space-y-space-2xs">
          <div className="flex items-center justify-between gap-space-sm">
            <span className="font-label-sm text-label-sm text-text-primary font-semibold">Estimated cost</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-caption">
              Demonstration estimate
            </span>
          </div>
          {cost ? (
            <p className="font-body-md text-body-md text-text-secondary">
              <span className="text-text-primary font-semibold">{formatNumber(cost.credits)} SMS credits</span> · approx.{' '}
              <span className="text-text-primary font-semibold">{formatNaira(cost.naira)}</span>
              <span className="block font-caption text-caption text-text-tertiary">
                {formatNumber(cost.segments)} segment{cost.segments === 1 ? '' : 's'} × {formatNumber(cost.recipients)}{' '}
                recipients, priced at the {formatNaira(SMS_CREDIT_BUNDLE.naira)} / {SMS_CREDIT_BUNDLE.credits}-credit
                bundle on Add-ons. Your provider sets the final rate.
              </span>
            </p>
          ) : (
            <p className="font-body-md text-body-md text-text-secondary">
              Estimated cost unavailable until the message has content and recipients.
            </p>
          )}
          <p className="font-caption text-caption text-text-secondary">
            Current SMS credit balance: <span className="text-text-primary font-semibold">{SMS_CREDIT_BALANCE}</span> — buy
            credits under More → Add-ons &amp; Credits before a real send.
          </p>
        </div>
      </div>

      {/* Phone preview */}
      <div className="flex flex-col gap-space-sm xl:sticky xl:top-20">
        <div className="flex items-center justify-between gap-space-sm">
          <span className="font-label-sm text-label-sm text-text-secondary">Preview</span>
          <span className="font-caption text-caption text-text-tertiary">
            Sample recipient: {SAMPLE_RECIPIENT.name}
          </span>
        </div>
        <div className="mx-auto w-full max-w-[320px] rounded-[28px] border-[6px] border-on-surface bg-on-surface shadow-xl p-space-2xs">
          <div className="rounded-[22px] bg-[#f2f2f7] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-surface-canvas/80 backdrop-blur">
              <span className="font-caption text-caption text-text-secondary">{formatClock(Date.now())}</span>
              <span className="flex items-center gap-1 text-text-secondary">
                <Icon name="signal_cellular_alt" className="text-[13px]" />
                <Icon name="battery_full" className="text-[13px]" />
              </span>
            </div>
            <div className="px-3 py-3 min-h-[220px] flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center">
                  <Icon name="storefront" className="text-[14px]" />
                </span>
                <span className="font-label-sm text-label-sm text-text-primary font-semibold">{BUSINESS_NAME}</span>
              </div>
              <div className="self-start max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3 py-2 shadow-sm">
                <p className="font-body-md text-body-md text-text-primary whitespace-pre-wrap break-words leading-snug">
                  {previewBody.trim() || 'Your message preview appears here.'}
                </p>
              </div>
              <span className="mt-1 self-start font-caption text-caption text-text-tertiary">
                {segments} segment{segments === 1 ? '' : 's'} · {analysis.encoding}
              </span>
            </div>
          </div>
        </div>
        <p className="font-caption text-caption text-text-tertiary text-center">
          Previews use sample data. Delivery in West Africa Time ({CAMPAIGN_TIMEZONE.short}) once a provider is connected.
        </p>
      </div>
    </div>
  );
}

function Counter({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl bg-surface-subtle px-space-sm py-2 flex flex-col">
      <span className="font-caption text-caption text-text-secondary">{label}</span>
      <span className={`font-label-md text-label-md font-semibold ${highlight ? 'text-tertiary' : 'text-text-primary'}`}>
        {value}
      </span>
    </div>
  );
}

/** Appends the short link once, replacing a previous short link if present. */
function ensureLink(body: string, link: string): string {
  const withoutLink = body.replace(/\n?(https?:\/\/\S+)$/g, '').trimEnd();
  return `${withoutLink}\n${link}`;
}
