import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { ReferralCodeCard } from './ReferralCodeCard';
import { useReferralIdentity } from '../../hooks/useReferralIdentity';
import { useProfile } from '../../context/ProfileContext';
import { getProvisionalReferralCode } from '../../scripts/referralData';
import {
  CHECKLIST_STATUS_LABEL,
  buildBusinessChecklist,
  buildCustomerChecklist,
  readinessPercent,
  type ChecklistStatus,
  type OnboardingChecklistItem,
} from '../../scripts/onboardingChecklist';

export type WelcomeAudience = 'customer' | 'business';

export interface OnboardingWelcomeContentProps {
  audience: WelcomeAudience;
  /** Business-setup state, used for the readiness percentage. */
  business?: {
    profileCompleted: boolean;
    offeringsCompleted: boolean;
    verificationState: 'not-started' | 'in-progress' | 'complete';
  };
  onEnterDashboard: () => void;
}

const STATUS_ICON: Record<ChecklistStatus, string> = {
  completed: 'check_circle',
  skipped: 'skip_next',
  pending: 'radio_button_unchecked',
};

const STATUS_CLASS: Record<ChecklistStatus, string> = {
  completed: 'text-badge-discount-text',
  skipped: 'text-text-tertiary',
  pending: 'text-primary',
};

function ChecklistItem({ item }: { item: OnboardingChecklistItem }) {
  return (
    <li className="flex items-start gap-space-xs px-space-sm py-space-xs">
      <Icon name={STATUS_ICON[item.status]} className={`text-[18px] shrink-0 mt-0.5 ${STATUS_CLASS[item.status]}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-space-xs">
          <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate">{item.label}</span>
          <span
            className={`font-caption text-caption shrink-0 ${
              item.status === 'completed'
                ? 'text-badge-discount-text'
                : item.status === 'pending'
                  ? 'text-primary'
                  : 'text-text-tertiary'
            }`}
          >
            {CHECKLIST_STATUS_LABEL[item.status]}
          </span>
        </div>
        <p className="font-caption text-caption text-text-secondary leading-snug">{item.detail}</p>
      </div>
    </li>
  );
}

/**
 * Shared body of the post-onboarding welcome screen: a collapsed readiness
 * checklist plus the "Refer Others & Earn Rewards" panel.
 *
 * Kept in `components/` so the mobile and desktop wrappers only supply the
 * shell around identical content.
 */
export function OnboardingWelcomeContent({ audience, business, onEnterDashboard }: OnboardingWelcomeContentProps) {
  const profile = useProfile();
  const identity = useReferralIdentity();
  const [checklistOpen, setChecklistOpen] = useState(false);

  const referralCodeApplied = Boolean(getProvisionalReferralCode());
  const items =
    audience === 'business'
      ? buildBusinessChecklist({
          profileCompleted: business?.profileCompleted ?? false,
          offeringsCompleted: business?.offeringsCompleted ?? false,
          verificationState: business?.verificationState ?? 'not-started',
          referralCodeApplied,
        })
      : buildCustomerChecklist({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          locationGranted: true,
          referralCodeApplied,
        });

  const percent = readinessPercent(items);
  const completed = items.filter((item) => item.status === 'completed').length;
  const isBusiness = audience === 'business';

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Greeting */}
      <div className="flex flex-col gap-space-2xs">
        <span className="inline-flex items-center gap-space-2xs self-start px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
          <Icon name="celebration" className="text-[14px]" />
          <span>Onboarding complete</span>
        </span>
        <h1 className="font-heading-lg text-heading-lg text-text-primary font-semibold tracking-tight">
          Welcome{profile.firstName ? `, ${profile.firstName}` : ''}!
        </h1>
        <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
          {isBusiness
            ? 'Your business is set up on VEMTAP. Here’s where your setup stands, and how to bring other businesses on board.'
            : 'You’re all set on VEMTAP. Here’s your setup summary, and how to invite others to join you.'}
        </p>
      </div>

      {/* Checklist — collapsed by default */}
      <section className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle overflow-hidden">
        <button
          type="button"
          aria-expanded={checklistOpen}
          aria-controls="onboarding-checklist"
          onClick={() => setChecklistOpen((open) => !open)}
          className="w-full flex items-center justify-between gap-space-sm px-space-md py-space-sm text-left hover:bg-surface-subtle transition-colors"
        >
          <div className="min-w-0">
            <p className="font-label-md text-label-md text-text-primary font-semibold">
              {isBusiness ? 'Business readiness' : 'Account setup'}
            </p>
            <p className="font-caption text-caption text-text-secondary truncate">
              {completed} of {items.length} steps complete · tap to view details
            </p>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            {isBusiness && (
              <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-bold">
                {percent}% ready
              </span>
            )}
            <Icon
              name="expand_more"
              className={`text-[22px] text-text-tertiary transition-transform ${checklistOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {checklistOpen && (
          <ul id="onboarding-checklist" className="divide-y divide-border-subtle border-t border-border-subtle">
            {items.map((item) => (
              <ChecklistItem key={item.id} item={item} />
            ))}
          </ul>
        )}

        {!checklistOpen && isBusiness && (
          <div className="px-space-md pb-space-sm">
            <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
              <div className="h-full bg-primary-container rounded-full transition-all" style={{ width: `${percent}%` }} />
            </div>
          </div>
        )}
      </section>

      {/* Refer others */}
      <ReferralCodeCard
        audience={audience}
        accountType={audience}
        code={identity.code}
        link={identity.link}
        title="Refer Others & Earn Rewards"
        description={
          isBusiness
            ? 'Invite other businesses to VEMTAP and earn rewards when they join. Qualifying referrals may earn VEMTAP Credits.'
            : 'Invite businesses and friends to VEMTAP and earn rewards when they join. Qualifying referrals may earn Points.'
        }
      />

      <button
        type="button"
        onClick={onEnterDashboard}
        className="w-full h-[54px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-2xs shadow-md active:scale-[0.98] transition hover:bg-primary"
      >
        <span>{isBusiness ? 'Go to Business Dashboard' : 'Explore VEMTAP'}</span>
        <Icon name="arrow_forward" className="text-[20px]" />
      </button>
    </div>
  );
}
