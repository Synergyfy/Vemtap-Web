import { useMutation } from '@tanstack/react-query';
import { Icon } from '../ui/Icon';
import { ErrorState, LoadingRows } from './QueryStates';
import { useVerificationStatus, verificationKeys } from '../../hooks/business/useVerification';
import {
  reasonCopy,
  verificationService,
  type BusinessVerificationStatus,
  type VerificationCheck,
} from '../../services/verificationService';
import { queryClient } from '../../services/queryClient';

const OVERALL: Record<BusinessVerificationStatus, { label: string; tone: string; icon: string; body: string }> = {
  unverified: { label: 'Not verified', tone: 'bg-surface-container text-text-secondary', icon: 'shield', body: 'Verify your identity and business to earn the verified badge and better placement.' },
  in_progress: { label: 'In progress', tone: 'bg-surface-tint-blue text-primary', icon: 'pending', body: 'You have started verification. Finish the remaining step below.' },
  needs_review: { label: 'Under review', tone: 'bg-tertiary-fixed text-on-tertiary-fixed-variant', icon: 'hourglass_top', body: 'Our team is reviewing your details. We will notify you when it is done.' },
  verified: { label: 'Verified', tone: 'bg-badge-discount-bg text-badge-discount-text', icon: 'verified', body: 'Your business carries the verified badge across VemTap.' },
  rejected: { label: 'Not approved', tone: 'bg-error-container text-on-error-container', icon: 'gpp_bad', body: 'Verification was not approved. Check the reasons below and try again.' },
};

const CHECK_TONE: Record<VerificationCheck['status'], string> = {
  verified: 'bg-badge-discount-bg text-badge-discount-text',
  pending: 'bg-surface-tint-blue text-primary',
  needs_review: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  failed: 'bg-error-container text-on-error-container',
};

const CHECK_LABEL: Record<VerificationCheck['status'], string> = {
  verified: 'Verified',
  pending: 'Checking',
  needs_review: 'Needs review',
  failed: 'Failed',
};

const ID_LABEL: Record<string, string> = {
  nin: 'NIN',
  drivers_license: "Driver's licence",
  voters_card: "Voter's card",
  passport: 'Passport',
  cac: 'CAC registration',
  unregistered: 'Unregistered business',
};

function CheckRow({ title, icon, check }: { title: string; icon: string; check?: VerificationCheck | null }) {
  const reasons = reasonCopy(check?.reasons);
  return (
    <div className="flex items-start gap-space-sm p-space-sm rounded-xl bg-surface-subtle">
      <span className="w-9 h-9 rounded-lg bg-surface-canvas text-primary flex items-center justify-center shrink-0">
        <Icon name={icon} className="text-[18px]" />
      </span>
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        <div className="flex items-center justify-between gap-space-xs">
          <span className="font-label-md text-label-md text-text-primary font-semibold">{title}</span>
          {check ? (
            <span className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold ${CHECK_TONE[check.status]}`}>
              {CHECK_LABEL[check.status]}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold bg-surface-container text-text-secondary">Not started</span>
          )}
        </div>
        {check ? (
          <span className="font-caption text-caption text-text-secondary">
            {ID_LABEL[check.idType] ?? check.idType}
            {check.maskedId ? ` · ${check.maskedId}` : ''}
            {check.recordName ? ` · ${check.recordName}` : ''}
          </span>
        ) : null}
        {reasons.map((reason) => (
          <span key={reason} className="font-caption text-caption text-on-tertiary-fixed-variant flex items-start gap-1">
            <Icon name="info" className="text-[14px] mt-px" /> {reason}
          </span>
        ))}
        {check?.reviewNote ? <span className="font-caption text-caption text-text-secondary">Reviewer: {check.reviewNote}</span> : null}
      </div>
    </div>
  );
}

/** Live verification status (`GET /verification/status`) with the next action. */
export function VerificationStatusPanel({ onContinue }: { onContinue: () => void }) {
  const status = useVerificationStatus();
  const review = useMutation({
    mutationFn: () => verificationService.requestManualReview({}),
    onSettled: () => queryClient.invalidateQueries({ queryKey: verificationKeys.status }),
  });

  if (status.isLoading) return <LoadingRows rows={3} label="Loading verification status" />;
  if (status.isError || !status.data)
    return <ErrorState title="Could not load verification status" error={status.error} onRetry={() => status.refetch()} />;

  const data = status.data;
  const overall = OVERALL[data.status];
  const canContinue = data.nextStep === 'identity' || data.nextStep === 'business';
  const failedCheck = [data.identity, data.business].find((c) => c?.status === 'failed');

  return (
    <div className="flex flex-col gap-space-lg max-w-3xl">
      <section className="rounded-xl bg-surface-canvas shadow-sm border border-border-subtle p-space-lg flex flex-col gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <span className={`w-12 h-12 rounded-full flex items-center justify-center ${overall.tone}`}>
            <Icon name={overall.icon} filled className="text-[24px]" />
          </span>
          <div className="flex flex-col">
            <span className="font-heading-md text-heading-md text-text-primary">{overall.label}</span>
            {data.verifiedAt ? (
              <span className="font-caption text-caption text-text-secondary">
                Since {new Date(data.verifiedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            ) : null}
          </div>
        </div>
        <p className="font-body-md text-body-md text-text-secondary">{overall.body}</p>
        <div className="flex flex-wrap gap-space-xs">
          {canContinue ? (
            <button
              type="button"
              onClick={onContinue}
              className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-1"
            >
              {data.nextStep === 'identity' ? 'Verify your identity' : 'Verify your business'}
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          ) : null}
          {failedCheck && data.status !== 'needs_review' ? (
            <button
              type="button"
              disabled={review.isPending}
              onClick={() => review.mutate()}
              className="h-10 px-space-md rounded-lg bg-surface-container text-text-primary font-label-md text-label-md disabled:opacity-60"
            >
              {review.isPending ? 'Requesting…' : 'Request a manual review'}
            </button>
          ) : null}
        </div>
        {review.isError ? <span className="font-caption text-caption text-red-600">{(review.error as Error).message}</span> : null}
      </section>

      <section className="flex flex-col gap-space-sm">
        <CheckRow title="Identity (owner ID + selfie)" icon="fingerprint" check={data.identity} />
        <CheckRow title="Business registration" icon="domain" check={data.business} />
      </section>
    </div>
  );
}
