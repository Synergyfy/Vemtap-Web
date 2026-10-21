import { useEffect, useMemo, useState } from 'react';
import { hasApiConfig } from '../../services/api/client';
import { Icon } from '../../components/ui/Icon';
import { AudienceSelector } from '../../components/campaigns/AudienceSelector';
import { CampaignShell } from './CampaignShell';
import { CampaignStepper, type CampaignStepKey } from '../../components/campaigns/CampaignStepper';
import { CampaignConfirmDialog } from '../../components/campaigns/CampaignConfirmDialog';
import { ScheduleControls, type SendMode } from '../../components/campaigns/ScheduleControls';
import { useCampaigns } from '../../context/CampaignsContext';
import { useCampaignAudience } from '../../hooks/business/useCampaignAudience';
import { useMyBusiness } from '../../hooks/business/useMyBusiness';
import { SmsComposer } from './SmsComposer';
import { EmailComposer } from './EmailComposer';
import type { BusinessTabKey } from '../../components/BusinessTabBar';
import {
  CAMPAIGN_TIMEZONE,
  BUSINESS_NAME,
  defaultScheduleValue,
  describeAudience,
  emptyDraft,
  evaluateAudience,
  estimateSmsCost,
  analyseSms,
  formatDateTime,
  formatNumber,
  renderPersonalisation,
  scheduleToTimestamp,
  validateCampaignName,
  validateEmail,
  validateSchedule,
  validateSms,
  type CampaignChannel,
  type CampaignRecord,
  type MessageTemplate,
} from './campaignsData';

export interface CampaignBuilderScreenProps {
  channel: CampaignChannel;
  isDesktop: boolean;
  onNav: (key: string) => void;
  onTab: (tab: BusinessTabKey) => void;
  /** Existing draft to edit or duplicate; omit to start a new campaign. */
  initial?: CampaignRecord;
  onExit: () => void;
  /** Called once the campaign is saved as a draft, scheduled or queued. */
  onCompleted: (campaign: CampaignRecord) => void;
}

/**
 * Screen 2 — one guided builder for both channels.
 * Audience → Message → Review & Send, all on one screen, with the work kept
 * in local state (and CampaignsContext) so stepping back never loses input.
 */
export function CampaignBuilderScreen({
  channel,
  isDesktop,
  onNav,
  onTab,
  initial,
  onExit,
  onCompleted,
}: CampaignBuilderScreenProps) {
  const { upsertCampaign } = useCampaigns();
  const { pool } = useCampaignAudience();
  const myBusiness = useMyBusiness();

  const [draft, setDraft] = useState<CampaignRecord>(() => (initial ? { ...initial } : emptyDraft(channel)));
  // Live: the placeholder sender name becomes the real business name.
  const liveName = myBusiness.data?.name;
  useEffect(() => {
    if (liveName) setDraft((d) => (!d.senderName || d.senderName === BUSINESS_NAME ? { ...d, senderName: liveName } : d));
  }, [liveName]);
  const [step, setStep] = useState<CampaignStepKey>('audience');
  const [completed, setCompleted] = useState<CampaignStepKey[]>([]);
  const [templateKey, setTemplateKey] = useState<string | undefined>(undefined);
  const [sendMode, setSendMode] = useState<SendMode>('now');
  const [scheduleValue, setScheduleValue] = useState('');
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showNameError, setShowNameError] = useState(false);
  const [attemptedSteps, setAttemptedSteps] = useState<CampaignStepKey[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<'info' | 'error'>('info');

  const showToast = (message: string, tone: 'info' | 'error' = 'info') => {
    setToastTone(tone);
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  };

  const outcome = useMemo(() => evaluateAudience(pool, draft.audience, channel), [pool, draft.audience, channel]);

  const nameError = validateCampaignName(draft.name);
  const contentErrors = useMemo(() => {
    if (channel === 'sms') {
      return validateSms(draft.smsBody ?? '', outcome.eligible.length);
    }
    return validateEmail(
      draft.emailSubject ?? '',
      draft.emailBody ?? '',
      draft.senderName ?? '',
      draft.senderEmail ?? '',
      outcome.eligible.length,
    );
  }, [channel, draft, outcome.eligible.length]);

  const stepErrors: Partial<Record<CampaignStepKey, string>> = {};
  if (draft.audience.mode === 'individual' && draft.audience.selectedKeys.length === 0)
    stepErrors.audience = 'Select at least one customer, or switch to another audience type.';
  else if (outcome.eligible.length === 0)
    stepErrors.audience = 'No eligible recipients — change the audience or ask customers to opt in.';
  if (nameError) stepErrors.message = nameError;
  else if (Object.keys(contentErrors).some((key) => key !== 'recipients')) stepErrors.message = 'Fix the highlighted fields to continue.';

  const scheduleIssue = sendMode === 'schedule' ? validateSchedule(scheduleValue || defaultScheduleValue()) : null;
  const attempted = (key: CampaignStepKey) => attemptedSteps.includes(key);

  /**
   * Every blocker for the step the user is on, in plain language. These drive
   * the "complete these before you continue" banner, the toast shown when a
   * Continue / Send click does not advance, and the jump-back on Review.
   */
  const stepIssues: Record<CampaignStepKey, string[]> = {
    audience: stepErrors.audience ? [stepErrors.audience] : [],
    message: [
      ...(nameError ? [nameError] : []),
      ...(['body', 'subject', 'senderName', 'senderEmail'] as const)
        .map((key) => contentErrors[key])
        .filter((value): value is string => Boolean(value)),
    ],
    review: [
      ...(scheduleIssue ? [scheduleIssue] : []),
      ...(!consentConfirmed ? ['Tick the consent confirmation checkbox above so we know recipients opted in.'] : []),
    ],
  };

  const change = (patch: Partial<CampaignRecord>) =>
    setDraft((current) => ({ ...current, ...patch, updatedAt: Date.now() }));

  const applyTemplate = (template: MessageTemplate) => {
    setTemplateKey(template.key);
    change(
      channel === 'sms'
        ? { smsBody: template.body }
        : { emailSubject: template.subject ?? '', emailPreheader: template.preheader ?? '', emailBody: template.body },
    );
  };

  const markCompleted = (key: CampaignStepKey) =>
    setCompleted((current) => (current.includes(key) ? current : [...current, key]));

  const goToStep = (next: CampaignStepKey) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' as ScrollBehavior });
  };

  /** Highlights the first field that is still blocking progress. */
  const focusFirstInvalid = () => {
    window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      if (!target) return;
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 60);
  };

  const markAttempted = (key: CampaignStepKey) =>
    setAttemptedSteps((current) => (current.includes(key) ? current : [...current, key]));

  /** Explains a blocked Continue / Send click instead of silently doing nothing. */
  const reportBlockers = (key: CampaignStepKey) => {
    const issues = stepIssues[key];
    markAttempted(key);
    if (key === 'message') setShowNameError(true);
    focusFirstInvalid();
    showToast(
      issues.length > 1
        ? `Still needed to continue: ${issues.length} items — the missing fields are now highlighted.`
        : `${issues[0]} Complete this to continue.`,
      'error',
    );
  };

  /** True when the step can advance; otherwise highlights and reports the blockers. */
  const requireStep = (key: CampaignStepKey): boolean => {
    if (!stepIssues[key].length) return true;
    reportBlockers(key);
    return false;
  };

  const attemptStep = (next: CampaignStepKey) => {
    if (!requireStep(step)) return;
    markCompleted(step);
    goToStep(next);
  };

  const stepBack = () => {
    if (step === 'review') goToStep('message');
    else if (step === 'message') goToStep('audience');
    else onExit();
  };

  /** Shared save used by "Save draft" and by the final send/schedule flow. */
  const persist = (status: CampaignRecord['status'], extra: Partial<CampaignRecord> = {}): CampaignRecord => {
    const now = Date.now();
    const history = [...draft.history];
    if (status === 'scheduled') {
      history.push({ at: now, kind: 'scheduled', label: `Scheduled for ${formatDateTime(extra.scheduledAt ?? now)}` });
    } else if (status === 'sending') {
      history.push({
        at: now,
        kind: 'queued',
        label: hasApiConfig()
          ? `Queued for ${formatNumber(outcome.eligible.length)} recipients (delivery not yet available)`
          : `Queued in demonstration mode for ${formatNumber(outcome.eligible.length)} recipients`,
      });
    } else {
      history.push({ at: now, kind: 'saved', label: 'Draft saved' });
    }

    const record: CampaignRecord = {
      ...draft,
      ...extra,
      status,
      audienceLabel: describeAudience(draft.audience),
      recipientCount: outcome.eligible.length,
      excludedCount: outcome.excludedCount,
      exclusionBreakdown: outcome.exclusionCounts,
      updatedAt: now,
      history,
    };
    upsertCampaign(record);
    setDraft(record);
    return record;
  };

  const saveDraft = () => {
    const record = persist('draft');
    setToast(record.name.trim() ? `"${record.name}" saved to drafts` : 'Saved to drafts');
  };

  const scheduledTimestamp = scheduleToTimestamp(scheduleValue || defaultScheduleValue());

  const openConfirm = () => {
    // Review can be reached by jumping through the stepper, so re-check the earlier steps.
    if (!requireStep('audience')) {
      goToStep('audience');
      return;
    }
    if (!requireStep('message')) {
      goToStep('message');
      return;
    }
    markAttempted('review');
    if (sendMode === 'schedule') {
      const error = validateSchedule(scheduleValue || defaultScheduleValue());
      setScheduleError(error);
      if (error) {
        showToast(error, 'error');
        return;
      }
    }
    if (!consentConfirmed) {
      showToast('Confirm the consent and eligibility note before sending.', 'error');
      return;
    }
    setConfirmOpen(true);
  };

  const confirmSend = () => {
    if (submitting) return;
    setSubmitting(true);
    window.setTimeout(() => {
      const record = persist(sendMode === 'schedule' ? 'scheduled' : 'sending', {
        scheduledAt: sendMode === 'schedule' ? scheduledTimestamp : undefined,
        sentAt: sendMode === 'schedule' ? undefined : Date.now(),
        simulatedSend: sendMode !== 'schedule',
        stats: sendMode === 'schedule' ? undefined : { queued: outcome.eligible.length },
      });
      setSubmitting(false);
      setConfirmOpen(false);
      onCompleted(record);
    }, 650);
  };

  const smsSegments = analyseSms(draft.smsBody ?? '').segments;
  const smsCost = estimateSmsCost(smsSegments, outcome.eligible.length);

  const title = initial ? 'Edit campaign draft' : `New ${channel === 'sms' ? 'SMS' : 'email'} campaign`;

  const desktopHeader = (
    <section className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
      <div className="flex flex-col gap-space-2xs max-w-3xl">
        <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
          Messages · {channel === 'sms' ? 'SMS' : 'Email'} · Builder
        </span>
        <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">{title}</h1>
        <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
          Three steps: choose the audience, write the message, then review and send. You can save a draft at any point.
        </p>
      </div>
      <button
        type="button"
        onClick={saveDraft}
        className="shrink-0 h-11 px-space-md rounded-xl border border-border-subtle bg-surface-canvas font-button-secondary text-button-secondary text-on-surface-variant hover:bg-surface-subtle flex items-center justify-center gap-space-2xs transition-colors"
      >
        <Icon name="draft" className="text-[18px]" />
        <span>Save draft</span>
      </button>
    </section>
  );

  return (
    <CampaignShell
      channel={channel}
      isDesktop={isDesktop}
      onNav={onNav}
      onTab={onTab}
      onBack={stepBack}
      mobileTitle={title}
      mobileTrailing={
        <button
          type="button"
          onClick={saveDraft}
          className="h-9 px-space-sm rounded-xl border border-border-subtle bg-surface-canvas font-label-sm text-label-sm text-primary hover:bg-surface-tint-blue transition-colors shrink-0"
        >
          Save draft
        </button>
      }
      desktopHeader={desktopHeader}
    >
      <div className="flex flex-col gap-space-lg px-space-md md:px-0 py-space-md md:py-0">
        <CampaignStepper
          active={step}
          completed={completed}
          onSelect={goToStep}
          blockedReason={stepErrors}
          onBlocked={(reason) => showToast(`${reason}`, 'error')}
        />

        {/* Step 1 — Audience */}
        {step === 'audience' && (
          <>
            <AudienceSelector channel={channel} pool={pool} selection={draft.audience} outcome={outcome} onChange={(audience) => change({ audience })} />
            {stepErrors.audience && attemptedSteps.includes('audience') && (
              <p role="alert" className="flex items-center gap-space-2xs font-label-sm text-label-sm text-on-error">
                <Icon name="error" className="text-[16px]" />
                {stepErrors.audience}
              </p>
            )}
          </>
        )}

        {/* Step 2 — Message */}
        {step === 'message' && (
          <div className="flex flex-col gap-space-lg">
            <div className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle p-space-lg">
              <div className="flex flex-col gap-space-2xs">
                <label htmlFor="campaign-name" className="font-label-sm text-label-sm text-text-secondary">
                  Campaign name (internal)
                </label>
                <input
                  id="campaign-name"
                  type="text"
                  value={draft.name}
                  onChange={(event) => change({ name: event.target.value })}
                  placeholder={channel === 'sms' ? 'Weekend rice discount' : 'October lunch deal'}
                  aria-invalid={showNameError && !!nameError}
                  className={`min-h-11 px-3.5 rounded-xl bg-surface-container-lowest shadow-sm font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                    showNameError && nameError ? 'ring-2 ring-error' : ''
                  }`}
                />
                {showNameError && nameError && (
                  <span role="alert" className="flex items-center gap-1 font-label-sm text-label-sm text-on-error">
                    <Icon name="error" className="text-[15px]" />
                    {nameError}
                  </span>
                )}
                <span className="font-caption text-caption text-text-tertiary">
                  Only your team sees this name — recipients never do.
                </span>
              </div>
            </div>

            {channel === 'sms' ? (
              <SmsComposer
                draft={draft}
                outcome={outcome}
                activeTemplateKey={templateKey}
                error={contentErrors.body}
                showErrors={attempted('message')}
                onChange={change}
                onApplyTemplate={applyTemplate}
              />
            ) : (
              <EmailComposer
                draft={draft}
                outcome={outcome}
                activeTemplateKey={templateKey}
                errors={contentErrors}
                showErrors={attempted('message')}
                onChange={change}
                onApplyTemplate={applyTemplate}
                onOpenSettings={() => onNav('more-settings')}
              />
            )}
          </div>
        )}

        {/* Step 3 — Review & Send */}
        {step === 'review' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg items-start">
            <section className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle p-space-lg flex flex-col gap-space-md">
              <h2 className="font-heading-sm text-heading-sm text-text-primary">Review</h2>

              <dl className="flex flex-col divide-y divide-border-subtle rounded-xl bg-surface-subtle overflow-hidden">
                <ReviewRow label="Campaign name" value={draft.name || 'Untitled campaign'} icon="campaign" />
                <ReviewRow label="Channel" value={channel === 'sms' ? 'SMS campaign' : 'Email campaign'} icon={channel === 'sms' ? 'sms' : 'mail'} />
                <ReviewRow label="Audience" value={describeAudience(draft.audience)} icon="groups" />
                <ReviewRow
                  label="Eligible recipients"
                  value={`${formatNumber(outcome.eligible.length)} of ${formatNumber(outcome.matched.length)} selected`}
                  icon="how_to_reg"
                />
                <ReviewRow
                  label="Excluded"
                  value={`${formatNumber(outcome.excludedCount)} contacts will not be sent to`}
                  icon="block"
                />
                {channel === 'sms' && (
                  <ReviewRow
                    label="Estimated cost"
                    value={
                      smsCost
                        ? `${formatNumber(smsCost.credits)} credits · about ${smsCost.naira.toLocaleString('en-NG')} naira (demonstration estimate)`
                        : 'Estimated cost unavailable'
                    }
                    icon="payments"
                  />
                )}
                <ReviewRow
                  label="Sending"
                  value={
                    sendMode === 'schedule' && scheduledTimestamp
                      ? `${formatDateTime(scheduledTimestamp)} · ${CAMPAIGN_TIMEZONE.long}`
                      : hasApiConfig()
                        ? 'Queued after confirmation (delivery not yet available)'
                        : 'Immediately after confirmation (queued locally)'
                  }
                  icon={sendMode === 'schedule' ? 'schedule' : 'bolt'}
                />
              </dl>

              {outcome.exclusionCounts.length > 0 && (
                <div className="flex flex-wrap gap-space-2xs">
                  {outcome.exclusionCounts.map((entry) => (
                    <span
                      key={entry.reason}
                      className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-error-container/60 font-caption text-caption text-on-error"
                    >
                      <span className="font-semibold">{formatNumber(entry.count)}</span>
                      {entry.label}
                    </span>
                  ))}
                </div>
              )}

              <ScheduleControls
                mode={sendMode}
                value={scheduleValue || defaultScheduleValue()}
                error={scheduleError}
                onModeChange={(mode) => {
                  setSendMode(mode);
                  setScheduleError(null);
                }}
                onValueChange={(value) => {
                  setScheduleValue(value);
                  setScheduleError(validateSchedule(value));
                }}
              />

              <label
                className={`flex items-start gap-space-sm rounded-xl border p-space-sm cursor-pointer ${
                  attempted('review') && !consentConfirmed ? 'ring-2 ring-error border-error' : 'border-border-subtle'
                }`}
              >
                <input
                  type="checkbox"
                  checked={consentConfirmed}
                  onChange={(event) => setConsentConfirmed(event.target.checked)}
                  aria-invalid={attempted('review') && !consentConfirmed}
                  className="mt-0.5 h-4 w-4 accent-primary shrink-0"
                />
                <span className="font-label-sm text-label-sm text-text-secondary">
                  I confirm these customers opted in to {channel === 'sms' ? 'SMS' : 'email'} marketing, that excluded
                  contacts will not be contacted
                  {hasApiConfig()
                    ? ', and that nothing is delivered until VEMTAP switches on campaign sending.'
                    : ', and that this is a demonstration send until a provider is connected.'}
                </span>
              </label>
              {attempted('review') && !consentConfirmed && (
                <p role="alert" className="flex items-center gap-space-2xs font-label-sm text-label-sm text-on-error">
                  <Icon name="error" className="text-[16px]" />
                  Tick the consent confirmation above — sending is blocked until you do.
                </p>
              )}
            </section>

            <section className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle p-space-lg flex flex-col gap-space-sm xl:sticky xl:top-20">
              <span className="font-label-sm text-label-sm text-text-secondary">Message preview</span>
              <ReviewPreview channel={channel} draft={draft} />
              <p className="font-caption text-caption text-text-tertiary">
                Personalisation is shown with sample values. Each recipient sees their own details.
              </p>
            </section>
          </div>
        )}

        {/* Blocker summary — only after a blocked Continue / Send click, so the
            button never appears dead without explaining what is missing. */}
        {attempted(step) && stepIssues[step].length > 0 && (
          <div
            role="alert"
            className="rounded-xl border border-error/40 bg-error-container/60 p-space-sm flex items-start gap-space-sm"
          >
            <Icon name="error" className="text-on-error text-[18px] shrink-0 mt-0.5" filled />
            <div className="flex flex-col gap-space-2xs min-w-0">
              <span className="font-label-sm text-label-sm text-on-error font-semibold">
                Complete {stepIssues[step].length === 1 ? '1 more item' : `${stepIssues[step].length} more items`} before
                you can continue:
              </span>
              <ul className="flex flex-col gap-space-2xs">
                {stepIssues[step].map((issue) => (
                  <li key={issue} className="font-body-sm text-body-sm text-on-error flex items-start gap-space-2xs">
                    <span aria-hidden="true">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div
          className={`sticky bottom-0 z-30 -mx-space-md md:mx-0 px-space-md md:px-space-md py-space-sm bg-surface/90 backdrop-blur-xl border-t border-border-subtle flex flex-wrap items-center gap-space-xs ${
            isDesktop ? '' : 'pb-safe'
          }`}
        >
          <button
            type="button"
            onClick={stepBack}
            className="h-11 px-space-md rounded-xl border border-border-subtle bg-surface-canvas font-button-secondary text-button-secondary text-on-surface-variant hover:bg-surface-subtle flex items-center gap-space-2xs transition-colors"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>{step === 'audience' ? 'Cancel' : 'Back'}</span>
          </button>

          <div className="flex-1" />

          <button
            type="button"
            onClick={saveDraft}
            className="h-11 px-space-md rounded-xl border border-border-subtle bg-surface-canvas font-button-secondary text-button-secondary text-on-surface-variant hover:bg-surface-subtle flex items-center gap-space-2xs transition-colors"
          >
            <Icon name="draft" className="text-[18px]" />
            <span>Save draft</span>
          </button>

          {step !== 'review' ? (
            <button
              type="button"
              onClick={() => attemptStep(step === 'audience' ? 'message' : 'review')}
              className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-space-2xs shadow-sm active:scale-[0.98] transition-all"
            >
              <span>Continue</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={openConfirm}
              disabled={submitting}
              className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-space-2xs shadow-sm active:scale-[0.98] transition-all disabled:opacity-60"
            >
              <Icon name={sendMode === 'schedule' ? 'schedule' : 'send'} className="text-[18px]" />
              <span>{sendMode === 'schedule' ? 'Schedule campaign' : 'Send now'}</span>
            </button>
          )}
        </div>
      </div>

      <CampaignConfirmDialog
        open={confirmOpen}
        channel={channel}
        campaignName={draft.name}
        audienceLabel={describeAudience(draft.audience)}
        recipientCount={outcome.eligible.length}
        excludedCount={outcome.excludedCount}
        sendMode={sendMode}
        scheduledAt={sendMode === 'schedule' ? scheduledTimestamp : undefined}
        segments={channel === 'sms' ? smsSegments : undefined}
        submitting={submitting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmSend}
      />

      {toast && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-margin w-full max-w-[430px] md:max-w-md pointer-events-none">
          <div
            className={`rounded-xl px-space-md py-space-sm shadow-xl flex items-center gap-space-sm ${
              toastTone === 'error' ? 'bg-error text-on-error' : 'bg-on-surface text-surface-canvas'
            }`}
          >
            <Icon name={toastTone === 'error' ? 'error' : 'check_circle'} className="text-[18px]" />
            <span className="font-label-md text-label-md">{toast}</span>
          </div>
        </div>
      )}
    </CampaignShell>
  );
}

function ReviewRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-space-sm px-space-md py-space-sm">
      <Icon name={icon} className="text-primary text-[18px] shrink-0 mt-0.5" />
      <div className="flex flex-col min-w-0">
        <dt className="font-caption text-caption text-text-secondary">{label}</dt>
        <dd className="font-label-md text-label-md text-text-primary font-medium break-words">{value}</dd>
      </div>
    </div>
  );
}

function ReviewPreview({ channel, draft }: { channel: CampaignChannel; draft: CampaignRecord }) {
  const sampleName = 'Amaka';
  if (channel === 'sms') {
    return (
      <div className="rounded-2xl bg-on-surface p-space-sm">
        <div className="rounded-xl bg-white px-space-sm py-space-2xs">
          <p className="font-body-md text-body-md text-text-primary whitespace-pre-wrap break-words leading-snug">
            {renderPersonalisation(draft.smsBody ?? '', { name: sampleName }).trim() || 'No message yet.'}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border-subtle overflow-hidden">
      <div className="px-space-sm py-space-2xs bg-surface-subtle border-b border-border-subtle">
        <p className="font-label-sm text-label-sm text-text-primary font-semibold break-words">
          {renderPersonalisation(draft.emailSubject ?? '', { name: sampleName }) || 'No subject yet'}
        </p>
        {(draft.emailPreheader ?? '').trim() && (
          <p className="font-caption text-caption text-text-secondary break-words">{draft.emailPreheader}</p>
        )}
      </div>
      <div className="px-space-sm py-space-sm font-body-md text-body-md text-text-primary whitespace-pre-wrap break-words max-h-56 overflow-y-auto">
        {renderPersonalisation(draft.emailBody ?? '', { name: sampleName }) || 'No content yet.'}
      </div>
      <div className="px-space-sm py-space-2xs border-t border-border-subtle">
        <p className="font-caption text-caption text-text-tertiary">
          Sent by {draft.senderName || BUSINESS_NAME} · unsubscribe link added by your email provider
        </p>
      </div>
    </div>
  );
}
