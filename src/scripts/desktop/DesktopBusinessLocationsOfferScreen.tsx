import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { InfoDialog } from '../../components/InfoDialog';
import { ADD_LOCATION_AFTER_SIGNUP_MESSAGE } from '../BusinessLocationsOfferScreen';

/**
 * Desktop step 4 of the business-location onboarding: the informational
 * "add more locations" step shown right after the (free) primary location.
 *
 * Same rules as mobile: registration is primary-location only, so this screen
 * never shows pricing or a checkout. "Add Another Location" opens an
 * informational popup pointing at the dashboard, and the primary CTA continues
 * onboarding with the primary location only.
 *
 * `extraBranches` / `paidBranchIds` are only relevant for restoring older
 * saved drafts; anything unpaid is dropped when continuing.
 */

export interface OnboardingBranch {
  id: string;
  name: string;
  city: string;
  address: string;
  hours: string;
  phone: string;
  isPrimary: boolean;
}

interface DesktopBusinessLocationsOfferScreenProps {
  businessName: string;
  /** Primary location captured in the previous step — always free. */
  primaryLocation?: { street: string; landmark?: string };
  /** Additional locations restored from an older saved draft (if any). */
  extraBranches?: OnboardingBranch[];
  /** Ids of those additional locations that were already paid for. */
  paidBranchIds?: string[];
  onBack: () => void;
  /** "Continue with Primary Location" — drop unpaid extras, continue onboarding. */
  onContinuePrimary: () => void;
  onSaveDraft: () => void;
}

export function DesktopBusinessLocationsOfferScreen({
  businessName,
  primaryLocation,
  extraBranches = [],
  paidBranchIds = [],
  onBack,
  onContinuePrimary,
  onSaveDraft,
}: DesktopBusinessLocationsOfferScreenProps) {
  const [showDashboardHint, setShowDashboardHint] = useState(false);

  const isPaid = (branchId: string) => paidBranchIds.includes(branchId);
  const label = businessName.trim() || 'Your Store';

  return (
    <div className="w-full max-w-3xl mx-auto px-8 py-10 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <button
            className="w-10 h-10 rounded-xl bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-secondary transition-colors cursor-pointer"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
          <span className="font-label-sm text-caption text-primary font-semibold uppercase tracking-wider">
            Step 4 of 8 • Business Locations
          </span>
        </div>
        <h1 className="font-heading-lg text-heading-lg text-text-primary font-bold tracking-tight">
          Add More Business Locations
        </h1>
        <p className="font-label-md text-label-md text-text-primary font-semibold">
          Do you have other branches or business locations?
        </p>
        <p className="font-body-md text-body-md text-text-secondary">
          You can continue with your primary location now and manage every location from your dashboard.
        </p>
      </div>

      {/* Dashboard-only notice — replaces the old in-signup pricing card. */}
      <div className="flex items-start gap-4 bg-surface-canvas rounded-xl p-5 shadow-sm border border-surface-container">
        <div className="w-11 h-11 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center flex-shrink-0">
          <Icon name="info" className="text-[22px]" />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="font-heading-sm text-heading-sm text-text-primary font-semibold">
            Locations are managed from your dashboard
          </span>
          <p className="font-caption text-caption text-text-secondary leading-relaxed mt-1">
            {ADD_LOCATION_AFTER_SIGNUP_MESSAGE}
          </p>
        </div>
      </div>

      {/* Locations list */}
      <div className="flex flex-col bg-surface-canvas rounded-xl p-5 shadow-sm border border-surface-container gap-2">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-text-secondary font-semibold">Your locations</span>
          <span className="font-caption text-caption text-text-secondary">Primary location included free</span>
        </div>

        <div className="flex items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center flex-shrink-0">
              <Icon name="storefront" className="text-[22px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                  {label} (Main)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-caption font-semibold flex-shrink-0">
                  Primary
                </span>
              </div>
              <span className="font-caption text-caption text-text-secondary truncate">
                {primaryLocation?.street || 'Your primary business location'}
              </span>
            </div>
          </div>
          <span className="font-label-md text-label-md font-semibold text-badge-discount-text flex-shrink-0">
            Free
          </span>
        </div>

        {extraBranches.map((branch) => (
          <div
            className="flex items-center justify-between gap-4 py-2 border-t border-border-subtle/80"
            key={branch.id}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isPaid(branch.id)
                    ? 'bg-badge-discount-bg text-badge-discount-text'
                    : 'bg-surface-container-high text-primary'
                }`}
              >
                <Icon name={isPaid(branch.id) ? 'check_circle' : 'add_location_alt'} className="text-[22px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                    {branch.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-label-sm text-caption font-semibold flex-shrink-0 ${
                      isPaid(branch.id)
                        ? 'bg-badge-discount-bg text-badge-discount-text'
                        : 'bg-surface-container-high text-text-secondary'
                    }`}
                  >
                    {isPaid(branch.id) ? 'Paid' : 'Draft'}
                  </span>
                </div>
                <span className="font-caption text-caption text-text-secondary truncate">
                  {branch.address}, {branch.city}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80 -mx-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md w-full sm:w-auto">
            <button
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-subtle font-button-secondary text-button-secondary transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back</span>
            </button>
            <button
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-secondary hover:text-on-surface hover:bg-surface-subtle font-label-md text-label-md transition-colors"
              type="button"
              onClick={onSaveDraft}
            >
              <Icon name="save" className="text-[16px]" />
              <span>Save as Draft</span>
            </button>
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
            <button
              className="inline-flex items-center justify-center gap-space-xs bg-surface-tint-blue hover:bg-surface-tint text-primary px-space-md py-space-xs rounded-lg font-button-secondary text-button-secondary shadow-sm transition-colors me-space-sm"
              type="button"
              onClick={() => setShowDashboardHint(true)}
            >
              <Icon name="add" className="text-[17px]" />
              <span>Add Another Location</span>
            </button>
            <button
              className="inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-surface-tint text-on-primary px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
              type="button"
              onClick={onContinuePrimary}
            >
              <span>Continue with Primary Location</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>

      <InfoDialog
        open={showDashboardHint}
        onClose={() => setShowDashboardHint(false)}
        title="Add locations from your dashboard"
        message={ADD_LOCATION_AFTER_SIGNUP_MESSAGE}
        acknowledgeLabel="Got it"
      />
    </div>
  );
}
