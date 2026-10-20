import { useIsDesktop } from '../../hooks/useIsDesktop';
import { DesktopModal, ModalCloseButton } from '../desktop/DesktopModal';
import { SheetShell } from '../sheets/SheetShell';
import { Icon } from '../ui/Icon';
import {
  BUSINESS_REFERRAL_BENEFITS,
  CUSTOMER_REFERRAL_BENEFITS,
  REFERRAL_PROGRAMME_NOTICE,
  type ReferralAudience,
} from '../../scripts/referralData';
import { getReferralVideoUrl, referralVideoEmbedUrl } from '../../scripts/referralVideo';

export interface ReferralBenefitsModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * Whose account is looking — NOT who they are inviting. `ReferralCodeCard`
   * uses `audience` for the invite target, so this stays a separate prop to
   * stop a customer inviting a business from being shown business benefits.
   */
  accountType: ReferralAudience;
}

function BenefitList({ points }: { points: string[] }) {
  return (
    <ul className="flex flex-col gap-space-xs">
      {points.map((point) => (
        <li key={point} className="flex items-start gap-space-2xs">
          <Icon name="check_circle" className="text-[18px] text-primary shrink-0 mt-0.5" />
          <span className="font-body-md text-body-md text-text-secondary leading-relaxed">{point}</span>
        </li>
      ))}
    </ul>
  );
}

function Section({ accountType, points }: { accountType: ReferralAudience; points: string[] }) {
  const isBusiness = accountType === 'business';
  return (
    <section className="rounded-xl border border-border-subtle bg-surface-canvas p-space-md flex flex-col gap-space-sm">
      <div className="flex items-center gap-space-xs">
        <span className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
          <Icon name={isBusiness ? 'storefront' : 'group'} className="text-[18px]" />
        </span>
        <h3 className="font-label-md text-label-md text-text-primary font-semibold">
          {isBusiness ? 'Business account' : 'Customer account'}
        </h3>
      </div>
      <BenefitList points={points} />
    </section>
  );
}

/**
 * Admin-managed explainer video. `referralVideo.ts` is the single source of
 * truth, so swapping the link at `/admin/referral` updates every surface at
 * once. Nothing renders when no playable link is configured.
 */
function VideoExplainer() {
  const embed = referralVideoEmbedUrl(getReferralVideoUrl());
  if (!embed) return null;

  return (
    <section className="rounded-xl border border-border-subtle bg-surface-canvas p-space-sm flex flex-col gap-space-2xs">
      <div className="flex items-center gap-space-xs">
        <span className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
          <Icon name="smart_display" className="text-[18px]" />
        </span>
        <h3 className="font-label-md text-label-md text-text-primary font-semibold">Watch how it works</h3>
      </div>
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-surface-dim">
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          src={embed}
          title="Referral programme explainer video"
        />
      </div>
      <p className="font-caption text-caption text-text-tertiary leading-snug">
        A short walkthrough of how referring others works on VEMTAP.
      </p>
    </section>
  );
}

/**
 * "See Referral Benefits" — explains what a qualifying referral *may* earn,
 * without promising amounts, prizes or redemption values.
 *
 * Only the benefits belonging to the signed-in account type are shown, so a
 * customer never reads the business list and a business never reads the
 * customer list.
 */
export function ReferralBenefitsModal({ open, onClose, accountType }: ReferralBenefitsModalProps) {
  const isDesktop = useIsDesktop();

  const body = (
    <div className="flex flex-col gap-space-md">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex items-start gap-space-xs min-w-0">
          <span className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
            <Icon name="redeem" className="text-[22px]" />
          </span>
          <div className="min-w-0">
            <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">
              Referral programme benefits
            </h2>
            <p className="font-caption text-caption text-text-secondary mt-0.5">
              An early look at how referring others may work.
            </p>
          </div>
        </div>
        {isDesktop && <ModalCloseButton onClose={onClose} />}
      </div>

      <div className="flex flex-col gap-space-sm">
        <Section
          accountType={accountType}
          points={accountType === 'business' ? BUSINESS_REFERRAL_BENEFITS : CUSTOMER_REFERRAL_BENEFITS}
        />
        <VideoExplainer />
      </div>

      <div className="rounded-xl bg-surface-tint-blue border border-border-active p-space-sm flex items-start gap-space-2xs">
        <Icon name="info" className="text-[18px] text-primary shrink-0 mt-0.5" />
        <p className="font-caption text-caption text-text-secondary leading-relaxed">{REFERRAL_PROGRAMME_NOTICE}</p>
      </div>

      {!isDesktop && (
        <button
          type="button"
          onClick={onClose}
          className="h-12 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-space-2xs active:scale-[0.98] transition"
        >
          <Icon name="check" className="text-[18px]" />
          <span>Got it</span>
        </button>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <DesktopModal open={open} onClose={onClose} maxWidth="max-w-[620px]">
        {body}
      </DesktopModal>
    );
  }

  return (
    <SheetShell open={open} onClose={onClose}>
      <div className="p-space-md pb-space-xl">{body}</div>
    </SheetShell>
  );
}
