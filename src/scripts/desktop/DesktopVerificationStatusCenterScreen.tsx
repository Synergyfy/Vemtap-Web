import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { VerificationCheckSheet } from '../../components/sheets/VerificationCheckSheet';
import { useVerificationSummary } from '../../hooks/business/useVerification';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';
import { DashboardIdentityVerificationFlow } from '../DashboardIdentityVerificationFlow';

interface DesktopVerificationStatusCenterScreenProps {
  onBack: () => void;
  onManageLocations?: () => void;
  onBrand?: () => void;
  /** Dashboard rail navigation — keeps the status centre inside the portal. */
  onNav?: (key: BusinessPortalNavKey) => void;
}

export function DesktopVerificationStatusCenterScreen({
  onBack,
  onManageLocations,
  onBrand,
  onNav,
}: DesktopVerificationStatusCenterScreenProps) {
  // Live: the real status from GET /verification/status and the business record.
  const summary = useVerificationSummary();
  const [sheet, setSheet] = useState<'id' | 'cac' | null>(null);
  const [identityFlowOpen, setIdentityFlowOpen] = useState(false);
  const [identityNotice, setIdentityNotice] = useState<string | null>(null);

  const branchCount = summary.locations.length;
  const branchNames = summary.locations.map((branch) => branch.name).join(' & ');
  const checksLabel = `${summary.checksVerified} ${summary.checksVerified === 1 ? 'check' : 'checks'} verified`;
  const sandboxResult =
    summary.identity.sandbox || summary.registration.sandbox || summary.representative.sandbox;
  const railChecks = [
    {
      label: summary.registration.ok
        ? 'Legal Entity Validated (CAC)'
        : `Legal Entity (CAC): ${summary.registration.label}`,
      ok: summary.registration.ok,
    },
    {
      label: branchCount
        ? `${branchCount} Active ${branchCount === 1 ? 'Location' : 'Locations'}${branchNames ? ` (${branchNames})` : ''}`
        : 'No locations added yet',
      ok: branchCount > 0,
    },
    { label: 'Verification records stored securely', ok: true },
  ];
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
        desktop
        onNav={onNav}
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
    <BusinessPortalChrome activeNav="more-verification" onNav={onNav} onBrand={onBrand}>
      <div className="max-w-6xl mx-auto py-space-lg px-margin flex flex-col gap-space-xl w-full">
        {identityNotice && (
          <p role="status" className="rounded-xl bg-badge-discount-bg px-space-sm py-space-xs font-label-md text-label-md text-badge-discount-text">
            {identityNotice}
          </p>
        )}
        {sandboxResult && (
          <p className="rounded-xl bg-surface-tint-blue px-space-sm py-space-xs font-caption text-caption text-primary">
            Sandbox results are shown for testing. They are not live verification.
          </p>
        )}

        <section className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="p-space-xl flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-lg">
              <div className="relative">
                {summary.image ? (
                  <img
                    alt={summary.businessName}
                    className="w-20 h-20 rounded-xl object-cover shadow-sm ring-2 ring-primary/20"
                    src={summary.image}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-surface-container ring-2 ring-primary/20 flex items-center justify-center text-text-tertiary">
                    <Icon name="storefront" className="text-[32px]" />
                  </div>
                )}
                {summary.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-badge-discount-bg text-badge-discount-text w-7 h-7 rounded-full flex items-center justify-center shadow-sm">
                    <Icon name="verified" filled className="text-[18px]" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-space-2xs">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">{summary.businessName}</h1>
                  <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold uppercase tracking-wider flex items-center gap-space-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {summary.statusLabel}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-text-secondary flex items-center gap-space-xs flex-wrap">
                  <Icon name="event_available" className="text-text-tertiary text-[18px]" />
                  <span>
                    {summary.lastVerified ? (
                      <>Last verified on <strong className="text-text-primary font-semibold">{summary.lastVerified}</strong></>
                    ) : (
                      'Not verified yet'
                    )}
                  </span>
                  <span className="text-text-tertiary">•</span>
                  <span className={`font-medium flex items-center gap-space-2xs ${summary.verified ? 'text-badge-discount-text' : 'text-text-secondary'}`}>
                    <Icon name={summary.verified ? 'check_circle' : summary.submitted ? 'schedule' : 'pending'} className="text-[16px]" />
                    {summary.progressLabel}
                  </span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-space-sm bg-surface-container-low/70 rounded-xl p-space-sm sm:self-auto self-stretch">
              <div className="flex flex-col items-center justify-center px-space-sm py-space-2xs text-center">
                <span className="font-caption text-caption text-text-secondary">Legal Standing</span>
                <span className={`font-label-md text-label-md font-semibold flex items-center gap-1 ${summary.registration.ok ? 'text-badge-discount-text' : 'text-text-secondary'}`}>
                  <Icon name={summary.registration.ok ? 'shield_with_heart' : 'schedule'} className="text-[14px]" />
                  {summary.registration.ok ? 'Validated' : summary.registration.label}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center px-space-sm py-space-2xs text-center">
                <span className="font-caption text-caption text-text-secondary">Active Locations</span>
                <span className="font-label-md text-label-md text-text-primary font-semibold">
                  {summary.locationsLoading ? '…' : `${branchCount} ${branchCount === 1 ? 'Location' : 'Locations'}`}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center px-space-sm py-space-2xs text-center">
                <span className="font-caption text-caption text-text-secondary">Security Vault</span>
                <span className="font-label-md text-label-md text-primary font-semibold flex items-center gap-1">
                  <Icon name="lock" className="text-[14px]" /> Secure records
                </span>
              </div>
            </div>
          </div>
          <div className="bg-surface-subtle px-space-xl py-space-md flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex flex-wrap items-center gap-space-lg text-text-secondary font-label-sm text-label-sm">
              {railChecks.map((check) => (
                <div className="flex items-center gap-space-2xs" key={check.label}>
                  <Icon
                    name={check.ok ? 'check_circle' : 'pending'}
                    filled={check.ok}
                    className={`text-[18px] ${check.ok ? 'text-badge-discount-text' : 'text-text-tertiary'}`}
                  />
                  <span className="text-text-primary font-medium">{check.label}</span>
                </div>
              ))}
            </div>
            {summary.credentialRef && (
              <span className="font-caption text-caption text-text-tertiary">
                Permanent Credential Ref: {summary.credentialRef}
              </span>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Credentials &amp; Standing</h2>
                <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                  {checksLabel}
                </span>
              </div>
              <span className="font-caption text-caption text-text-secondary">Status from your account</span>
            </div>

            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-start justify-between gap-space-md">
                <div className="flex items-start gap-space-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                    <Icon name="badge" className="text-[22px]" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <h3 className="font-label-md text-label-md text-text-primary font-bold">Identity Verification</h3>
                      <span className={`px-space-2xs py-0.5 rounded ${pill(summary.identity.ok)} font-caption text-caption font-semibold`}>
                        {summary.identity.label}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-text-primary font-medium mt-space-2xs">
                      {summary.identity.submitted ? (summary.identity.name ?? 'Account holder') : 'No ID submitted'}
                    </p>
                    <p className="font-label-sm text-label-sm text-text-secondary">
                      {summary.identity.submitted
                        ? `${summary.identity.idType ?? 'ID'} (${summary.identity.ref ?? '—'})`
                        : 'Not submitted yet'}
                    </p>
                  </div>
                </div>
                <button
                  className="font-label-sm text-label-sm text-primary hover:text-surface-tint font-semibold flex items-center gap-1 group whitespace-nowrap"
                  type="button"
                  onClick={() => setSheet('id')}
                >
                  <span>View Details</span>
                  <Icon name="arrow_forward" className="text-[16px] transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
              <div className="bg-surface-subtle p-space-sm rounded-lg flex items-center justify-between text-text-secondary font-caption text-caption">
                <span className="flex items-center gap-space-2xs">
                  <Icon
                    name={summary.identity.ok ? 'verified' : 'schedule'}
                    className={`text-[16px] ${summary.identity.ok ? 'text-badge-discount-text' : 'text-text-tertiary'}`}
                  />
                  {summary.identity.sandbox
                    ? 'Sandbox check — not live verification'
                    : (summary.identity.note ?? 'Check recorded on your account')}
                </span>
                <span className="text-text-tertiary">{summary.identity.date ?? ''}</span>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-start justify-between gap-space-md">
                <div className="flex items-start gap-space-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                    <Icon name="corporate_fare" className="text-[22px]" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <h3 className="font-label-md text-label-md text-text-primary font-bold">Business Registration (CAC)</h3>
                      <span className={`px-space-2xs py-0.5 rounded ${pill(summary.registration.ok)} font-caption text-caption font-semibold`}>
                        {summary.registration.label}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-text-primary font-medium mt-space-2xs">
                      Corporate Affairs Commission of Nigeria
                    </p>
                    <p className="font-label-sm text-label-sm text-text-secondary">
                      Registration ID: <span className="font-mono text-text-primary font-medium">{summary.registration.ref ?? 'Not submitted yet'}</span>
                    </p>
                  </div>
                </div>
                <button
                  className="font-label-sm text-label-sm text-primary hover:text-surface-tint font-semibold flex items-center gap-1 group whitespace-nowrap"
                  type="button"
                  onClick={() => setSheet('cac')}
                >
                  <span>View Certificate</span>
                  <Icon name="arrow_forward" className="text-[16px] transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
              <div className="bg-surface-subtle p-space-sm rounded-lg flex flex-wrap items-center justify-between gap-space-xs text-text-secondary font-caption text-caption">
                <span className="flex items-center gap-space-2xs">
                  <Icon
                    name={summary.registration.ok ? 'task_alt' : 'schedule'}
                    className={`text-[16px] ${summary.registration.ok ? 'text-badge-discount-text' : 'text-text-tertiary'}`}
                  />
                  {summary.registration.sandbox
                    ? 'Sandbox check — not live verification'
                    : (summary.registration.note ?? (summary.registration.date ? `Checked ${summary.registration.date}` : 'CAC register check'))}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-start justify-between gap-space-md">
                <div className="flex items-start gap-space-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                    <Icon name="storefront" className="text-[22px]" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <h3 className="font-label-md text-label-md text-text-primary font-bold">Physical Business Locations</h3>
                      <span className="px-space-2xs py-0.5 rounded bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                        {summary.locationsLoading ? '…' : branchCount ? `${branchCount} Active` : 'None yet'}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-text-primary font-medium mt-space-2xs">
                      {summary.locationsLoading
                        ? 'Loading branches…'
                        : branchCount
                          ? branchNames
                          : 'No branches added yet'}
                    </p>
                    <p className="font-label-sm text-label-sm text-text-secondary">
                      Branches customers can find you at on Vemtap
                    </p>
                  </div>
                </div>
                <button
                  className="font-label-sm text-label-sm text-primary hover:text-surface-tint font-semibold flex items-center gap-1 group whitespace-nowrap"
                  type="button"
                  onClick={onManageLocations}
                >
                  <span>Manage Locations</span>
                  <Icon name="arrow_forward" className="text-[16px] transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
              {branchCount > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
                  {summary.locations.map((branch) => (
                    <div className="p-space-xs rounded-lg bg-surface-subtle flex items-center gap-space-xs" key={branch.id}>
                      <div className="w-2 h-2 rounded-full bg-badge-discount-text shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-sm text-label-sm text-text-primary font-medium truncate">
                          {branch.address ?? branch.name}
                        </span>
                        <span className="font-caption text-caption text-text-secondary truncate">
                          {branch.isMain ? `${branch.name} • Main branch` : branch.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-start justify-between gap-space-md">
                <div className="flex items-start gap-space-md">
                  <div className="w-10 h-10 rounded-lg bg-badge-discount-bg flex items-center justify-center text-badge-discount-text shrink-0">
                    <Icon name="workspace_premium" className="text-[22px]" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <h3 className="font-label-md text-label-md text-text-primary font-bold">Storefront Standing</h3>
                      <span className={`px-space-xs py-space-2xs rounded-full font-caption text-caption font-bold ${
                        summary.suspended
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-badge-discount-bg text-badge-discount-text'
                      }`}>
                        {summary.suspended ? 'Suspended' : 'Active'}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
                      {summary.suspended
                        ? (summary.suspensionReason ?? 'Your storefront is paused. Contact Vemtap support to restore it.')
                        : 'Manage your storefront, deals and verification details from your dashboard.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-bold uppercase tracking-wider">
                  Verification status
                </span>
                <Icon name="insights" className="text-primary text-[20px]" />
              </div>
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-baseline gap-space-xs">
                  <span className="text-4xl font-extrabold text-text-primary tracking-tight">
                    {summary.checksVerified}
                  </span>
                  <span className="font-label-md text-label-md text-text-secondary font-semibold">{checksLabel.replace(/^\d+ /, '')}</span>
                </div>
                <p className="font-body-md text-body-md text-text-secondary">
                  Your verification outcomes are recorded against your business account. Open the status centre any time to review them.
                </p>
                {sandboxResult && (
                  <p className="rounded-lg bg-surface-tint-blue px-space-sm py-space-2xs font-caption text-caption text-primary">
                    Sandbox results are for testing only, not live verification.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center gap-space-xs text-text-primary">
                <Icon name="manage_history" className="text-text-secondary text-[20px]" />
                <h3 className="font-label-md text-label-md font-bold">Manage Legal Information</h3>
              </div>
              <p className="font-body-md text-body-md text-text-secondary">
                Any modification to registered business name, legal structure, or executive directors requires mandatory re-verification.
              </p>
              <button
                className="w-full h-11 rounded-lg bg-surface-subtle hover:bg-surface-container-high text-text-primary font-button-secondary text-button-secondary font-semibold transition-colors flex items-center justify-center gap-space-xs shadow-sm"
                type="button"
                onClick={startIdentity}
              >
                <Icon name="edit_document" className="text-[18px]" />
                <span>{summary.submitted ? 'Update Verification Information' : 'Start Verification'}</span>
              </button>
            </div>

            <div className="rounded-xl bg-surface-container-low p-space-md flex items-start gap-space-sm text-text-secondary font-caption text-caption">
              <Icon name="policy" className="text-text-tertiary text-[20px] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-space-2xs">
                <span className="font-semibold text-text-primary">Data protection</span>
                <p>
                  Your details are handled in line with applicable data protection rules and stored securely against your account.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <button
            className="px-space-md py-space-xs text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary transition-colors flex items-center gap-space-xs"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
      {sheet && (
        <VerificationCheckSheet
          centered
          kind={sheet}
          check={sheet === 'cac' ? summary.registration : summary.identity}
          live={summary.live}
          onClose={() => setSheet(null)}
          onStart={startIdentity}
        />
      )}
    </BusinessPortalChrome>
  );
}
