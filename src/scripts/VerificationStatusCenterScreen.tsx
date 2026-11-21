import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { useVerificationSummary } from '../hooks/business/useVerification';
import { UserAvatar } from '../components/ui/UserAvatar';
import { VerificationCheckSheet } from '../components/sheets/VerificationCheckSheet';
import { DashboardIdentityVerificationFlow } from './DashboardIdentityVerificationFlow';

interface VerificationStatusCenterScreenProps {
  onBack: () => void;
  onManageLocations?: () => void;
}

type CertificateModal = 'id' | 'cac' | null;

export function VerificationStatusCenterScreen({ onBack, onManageLocations }: VerificationStatusCenterScreenProps) {
  const [sheet, setSheet] = useState<CertificateModal>(null);
  const [identityFlowOpen, setIdentityFlowOpen] = useState(false);
  const [identityNotice, setIdentityNotice] = useState<string | null>(null);

  // Live: the real status from GET /verification/status and the business record.
  const summary = useVerificationSummary();
  const branchCount = summary.locations.length;
  const branchWord = `${branchCount} ${branchCount === 1 ? 'Location' : 'Locations'}`;
  const checksLabel = `${summary.checksVerified} ${summary.checksVerified === 1 ? 'check' : 'checks'} verified`;
  const sandboxResult =
    summary.identity.sandbox || summary.registration.sandbox || summary.representative.sandbox;
  const pill = (ok: boolean) =>
    ok ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-container text-text-secondary';
  const startIdentity = () => {
    setSheet(null);
    setIdentityNotice(null);
    setIdentityFlowOpen(true);
  };

  if (identityFlowOpen) {
    return (
      <DashboardIdentityVerificationFlow
        desktop={false}
        onBack={() => setIdentityFlowOpen(false)}
        onComplete={(result) => {
          setIdentityFlowOpen(false);
          setIdentityNotice(
            result === 'success'
              ? 'Your identity check is complete.'
              : 'Your identity details were submitted for review.',
          );
        }}
      />
    );
  }

  return (
    <div className="biz-flow">
      <AppScreen>
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-14 px-margin flex items-center justify-between">
            <div className="flex items-center gap-space-xs min-w-0">
              <button
                aria-label="Go back"
                className="w-11 h-11 -ml-space-2xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high/60 active:scale-95 transition-all"
                type="button"
                onClick={onBack}
              >
                <Icon name="arrow_back" className="text-[22px]" />
              </button>
              <h1 className="font-heading-sm text-heading-sm text-text-primary tracking-tight truncate max-w-[220px]">
                Business Verification Status Center
              </h1>
            </div>
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm shadow-primary/20 overflow-hidden">
                <UserAvatar textClassName="text-on-primary text-[13px]" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col w-full flex-1 pb-10">
          {identityNotice && (
            <p role="status" className="mx-margin mt-space-md rounded-xl bg-badge-discount-bg px-space-sm py-space-xs font-label-md text-label-md text-badge-discount-text">
              {identityNotice}
            </p>
          )}
          {sandboxResult && (
            <p className="mx-margin mt-space-md rounded-xl bg-surface-tint-blue px-space-sm py-space-xs font-caption text-caption text-primary">
              Sandbox results are shown for testing. They are not live verification.
            </p>
          )}

          {/* Overview trust card */}
          <div className="px-margin pt-space-md">
            <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm p-space-md">
              <div className="flex items-start justify-between gap-space-sm mb-space-md">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="relative h-14 w-14 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-surface-container">
                    {summary.image ? (
                      <img alt={summary.businessName} className="w-full h-full object-cover" src={summary.image} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                        <Icon name="storefront" className="text-[26px]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="font-heading-sm text-heading-sm text-text-primary truncate block">
                      {summary.businessName}
                    </span>
                    <p className="font-caption text-caption text-text-secondary mt-0.5 flex items-center gap-1">
                      <Icon name="history" className="text-[14px] text-text-tertiary" />
                      {summary.lastVerified ? `Last verified on ${summary.lastVerified}` : 'Not verified yet'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-surface-tint-blue p-space-sm flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="verified" filled className="text-primary text-[20px]" />
                  <div>
                    <div className="font-label-sm text-label-sm text-primary font-semibold tracking-tight">
                      {summary.statusLabel}
                    </div>
                    <div className="font-caption text-caption text-text-secondary">{checksLabel}</div>
                  </div>
                </div>
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full ${pill(summary.verified)} font-label-sm text-label-sm font-semibold`}>
                  {summary.progressLabel}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-space-2xs mt-space-md pt-space-xs">
                <div className="flex flex-col items-center text-center p-space-2xs">
                  <Icon name="local_police" className="text-[18px] text-primary mb-1" />
                  <span className="font-caption text-caption font-semibold text-text-primary">Legal Entity</span>
                  <span className="font-caption text-caption text-text-tertiary scale-90">
                    {summary.registration.ok ? 'Validated' : summary.registration.label}
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-space-2xs">
                  <Icon name="storefront" className="text-[18px] text-badge-discount-text mb-1" />
                  <span className="font-caption text-caption font-semibold text-text-primary">
                    {summary.locationsLoading ? '…' : branchWord}
                  </span>
                  <span className="font-caption text-caption text-text-tertiary scale-90">
                    {branchCount ? 'Active' : 'None yet'}
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-space-2xs">
                  <Icon name="security" className="text-[18px] text-primary mb-1" />
                  <span className="font-caption text-caption font-semibold text-text-primary">Protection</span>
                  <span className="font-caption text-caption text-text-tertiary scale-90">Records secured</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-margin mb-space-xs flex items-center justify-between mt-space-md">
            <h2 className="font-heading-sm text-heading-sm text-text-primary">Credentials &amp; Standing</h2>
            <span className="font-label-sm text-label-sm text-text-secondary">{checksLabel}</span>
          </div>

          <div className="px-margin flex flex-col gap-space-xs">
            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-space-xs min-w-0">
                  <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <Icon name="badge" className="text-[20px]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-label-md text-label-md text-text-primary font-semibold">Identity Verification</h3>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      {summary.identity.submitted
                        ? `${summary.identity.name ?? 'Account holder'} • ${summary.identity.idType ?? 'ID'} (${summary.identity.ref ?? '—'})`
                        : 'Not submitted yet'}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${pill(summary.identity.ok)} font-label-sm text-label-sm font-semibold flex-shrink-0`}>
                  <Icon name={summary.identity.ok ? 'check' : 'schedule'} className="text-[14px]" />
                  {summary.identity.label}
                </span>
              </div>
              <div className="mt-space-sm pt-space-xs flex items-center justify-between">
                <span className="font-caption text-caption text-text-tertiary">
                  {summary.identity.sandbox
                    ? 'Sandbox check • not live verification'
                    : (summary.identity.note ?? summary.identity.date ?? 'Check recorded on your account')}
                </span>
                <button
                  className="font-label-sm text-label-sm text-primary font-semibold inline-flex items-center gap-0.5 hover:underline"
                  type="button"
                  onClick={() => setSheet('id')}
                >
                  View Details
                  <Icon name="chevron_right" className="text-[16px]" />
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-space-xs min-w-0">
                  <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <Icon name="account_balance" className="text-[20px]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-label-md text-label-md text-text-primary font-semibold">Business Registration (CAC)</h3>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      Corporate Affairs Commission • {summary.registration.ref ?? 'Not submitted yet'}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${pill(summary.registration.ok)} font-label-sm text-label-sm font-semibold flex-shrink-0`}>
                  <Icon name={summary.registration.ok ? 'check' : 'schedule'} className="text-[14px]" />
                  {summary.registration.label}
                </span>
              </div>
              <div className="mt-space-sm pt-space-xs flex items-center justify-between">
                <span className="font-caption text-caption text-text-tertiary">
                  {summary.registration.sandbox
                    ? 'Sandbox check • not live verification'
                    : (summary.registration.note ?? (summary.registration.date ? `Checked ${summary.registration.date}` : 'CAC register check'))}
                </span>
                <button
                  className="font-label-sm text-label-sm text-primary font-semibold inline-flex items-center gap-0.5 hover:underline"
                  type="button"
                  onClick={() => setSheet('cac')}
                >
                  View Certificate
                  <Icon name="chevron_right" className="text-[16px]" />
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-space-xs min-w-0">
                  <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <Icon name="pin_drop" className="text-[20px]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-label-md text-label-md text-text-primary font-semibold">Physical Business Locations</h3>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      {summary.locationsLoading
                        ? 'Loading branches…'
                        : branchCount
                          ? `${branchCount} Active ${branchCount === 1 ? 'Branch' : 'Branches'} (${summary.locations.map((branch) => branch.name).join(' & ')})`
                          : 'No branches added yet'}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${pill(branchCount > 0)} font-label-sm text-label-sm font-semibold flex-shrink-0`}>
                  <Icon name={branchCount ? 'check' : 'schedule'} className="text-[14px]" />
                  {branchCount ? `${branchCount} Active` : 'None yet'}
                </span>
              </div>
              <div className="mt-space-sm pt-space-xs flex items-center justify-between gap-space-sm">
                <span className="font-caption text-caption text-text-tertiary truncate">
                  {summary.locations.find((branch) => branch.isMain)?.address ?? summary.locations[0]?.address ?? 'Add your branch address'}
                </span>
                <button
                  className="font-label-sm text-label-sm text-primary font-semibold inline-flex items-center gap-0.5 hover:underline shrink-0"
                  type="button"
                  onClick={onManageLocations}
                >
                  Manage Locations
                  <Icon name="chevron_right" className="text-[16px]" />
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
              <div className="flex items-center gap-space-xs">
                <div className="w-9 h-9 rounded-full bg-badge-discount-bg flex items-center justify-center text-badge-discount-text shrink-0">
                  <Icon name="bolt" className="text-[20px]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-label-md text-label-md text-text-primary font-semibold">Storefront Standing</h3>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                      summary.suspended
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-badge-discount-bg text-badge-discount-text'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {summary.suspended ? 'Suspended' : 'Active'}
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-1 leading-snug">
                    {summary.suspended
                      ? (summary.suspensionReason ?? 'Your storefront is paused. Contact Vemtap support to restore it.')
                      : 'Full access to hyper-local discovery, instant deals, and customer passes'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-margin mt-space-md">
            <div className="rounded-xl bg-surface-container-low p-space-md flex items-start gap-space-sm">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-tertiary-container flex-shrink-0 mt-0.5">
                <Icon name="info" className="text-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-label-sm text-label-sm font-semibold text-text-primary">Need to update something?</h4>
                <p className="font-caption text-caption text-text-secondary mt-1 leading-relaxed">
                  Changes to your business name, legal structure, or operating address may require you to verify your credentials again.
                </p>
              </div>
            </div>
          </div>

          <div className="px-margin flex flex-col gap-space-sm mt-space-md">
            <button
              className="w-full rounded-xl bg-surface-container-high text-text-primary font-button-secondary text-button-secondary hover:bg-surface-container-highest active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs font-semibold shadow-sm h-11"
              type="button"
              onClick={startIdentity}
            >
              <Icon name="edit_document" className="text-[20px] text-text-secondary" />
              {summary.submitted ? 'Update Verification Information' : 'Start Verification'}
            </button>
            <div className="flex items-center justify-center gap-1.5 pt-space-xs text-center">
              <Icon name="lock" className="text-text-tertiary text-[14px]" />
              <p className="font-caption text-caption text-text-tertiary">
                Your details are handled in line with applicable data protection rules.
              </p>
            </div>
          </div>
        </div>

        {sheet && (
          <VerificationCheckSheet
            kind={sheet}
            check={sheet === 'cac' ? summary.registration : summary.identity}
            live={summary.live}
            onClose={() => setSheet(null)}
            onStart={startIdentity}
          />
        )}
      </AppScreen>
    </div>
  );
}
