import type { DealStudioDraft } from './dealStudioShared';

/**
 * Publication outcome reported by the deals service. The UI must render the
 * status that actually comes back — never assume the deal went live just
 * because the merchant tapped "Publish".
 */
export type DealPublicationStatus = 'live' | 'scheduled' | 'pending-review' | 'rejected';

export interface DealPublicationResult {
  status: DealPublicationStatus;
  /** Backend reference the merchant can quote to support. */
  reference: string;
  /** Human-readable explanation of the status. */
  message: string;
  /** ISO timestamp the service acknowledged the submission. */
  submittedAt: string;
}

export const DEAL_PUBLICATION_COPY: Record<DealPublicationStatus, { title: string; icon: string; tone: string }> = {
  live: { title: 'Deal Broadcast Live!', icon: 'rocket_launch', tone: 'bg-badge-discount-bg text-badge-discount-text' },
  scheduled: { title: 'Deal Scheduled', icon: 'schedule', tone: 'bg-surface-tint-blue text-primary' },
  'pending-review': {
    title: 'Deal Submitted for Review',
    icon: 'pending_actions',
    tone: 'bg-surface-container-high text-on-surface-variant',
  },
  rejected: { title: 'Deal Needs Changes', icon: 'error', tone: 'bg-error/10 text-error' },
};

/**
 * Stand-in for the publish endpoint (`POST /deals/:id/publish`). There is no
 * backend in this prototype, so this returns a realistic service response that
 * the screens branch on. Swap the body for a real fetch when the API lands.
 */
export function publishDeal(input: { dealTitle: string; studio: DealStudioDraft }): DealPublicationResult {
  return {
    status: 'pending-review',
    reference: `DL-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    message: `${input.dealTitle} was accepted and queued for VEMTAP Trust & Safety review. It goes live automatically once cleared — usually within 30 minutes.`,
    submittedAt: new Date().toISOString(),
  };
}
