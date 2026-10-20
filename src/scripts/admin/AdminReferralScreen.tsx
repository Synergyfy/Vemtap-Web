import { useState } from 'react';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { AppScreen } from '../../components/ui/AppScreen';
import { Icon } from '../../components/ui/Icon';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import {
  DEFAULT_REFERRAL_VIDEO_URL,
  getReferralVideoSetting,
  referralVideoEmbedUrl,
  setReferralVideoUrl,
  clearReferralVideoUrl,
} from '../referralVideo';

interface AdminReferralScreenProps {
  onBack: () => void;
}

/**
 * Platform Admin → Referral programme.
 *
 * The one place an admin replaces the video that plays inside "See Referral
 * Benefits". Both the customer and business referral pages read whatever is
 * configured here, so a single edit updates both audiences.
 *
 * The app has no authentication model yet, so this screen is deliberately not
 * linked from any user navigation — it is reached directly at `/admin/referral`.
 * A real backend must gate it before launch; the data calls are already
 * isolated in `referralVideo.ts`.
 */
export function AdminReferralScreen({ onBack }: AdminReferralScreenProps) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased">
        <header className="border-b border-border-subtle bg-surface-canvas">
          <div className="mx-auto max-w-5xl px-space-xl py-space-md flex items-center gap-space-sm">
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:bg-surface-container hover:text-primary transition-colors"
            >
              <Icon name="arrow_back" className="text-[20px]" />
            </button>
            <span className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
              <Icon name="admin_panel_settings" className="text-[18px]" />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-caption text-caption text-text-tertiary">Platform Admin</span>
              <span className="font-label-md text-label-md text-text-primary font-semibold">Referral programme</span>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-space-xl py-space-xl">
          <AdminReferralBody />
        </main>
      </div>
    );
  }

  return (
    <AppScreen>
      <ScreenHeader title="Platform Admin" onBack={onBack} />
      <div className="flex-1 px-margin py-space-sm">
        <AdminReferralBody />
      </div>
    </AppScreen>
  );
}

function AdminReferralBody() {
  // Read on every render so the "Default / Custom link" badge and the Reset
  // button stay truthful straight after a save.
  const setting = getReferralVideoSetting();
  const [draft, setDraft] = useState(() => setting.url);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const trimmed = draft.trim();
  const previewEmbed = referralVideoEmbedUrl(trimmed);

  const showToast = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice((current) => (current === message ? null : current)), 3000);
  };

  const handleSave = () => {
    const result = setReferralVideoUrl(trimmed);
    if (!result.ok) {
      setError(result.message ?? 'That link could not be saved.');
      setNotice(null);
      return;
    }
    setError(null);
    // Show the value as stored, so the field matches what plays.
    setDraft(trimmed || DEFAULT_REFERRAL_VIDEO_URL);
    showToast(trimmed ? 'Explainer video saved.' : 'Back to the default explainer video.');
  };

  const handleReset = () => {
    clearReferralVideoUrl();
    setDraft(DEFAULT_REFERRAL_VIDEO_URL);
    setError(null);
    showToast('Restored the default explainer video.');
  };

  return (
    <div className="flex flex-col gap-space-lg">
      <section className="flex flex-col gap-space-2xs">
        <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
          Referral programme content
        </h1>
        <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
          Content shown to every account that opens <em>See Referral Benefits</em>. Edit it here once and both the
          customer and business referral pages pick it up.
        </p>
      </section>

      {/* Explainer video */}
      <section className="rounded-2xl bg-surface-canvas shadow-sm p-space-md flex flex-col gap-space-sm">
        <div className="flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs min-w-0">
            <span className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
              <Icon name="smart_display" className="text-[22px]" />
            </span>
            <div className="flex flex-col min-w-0">
              <h2 className="font-label-md text-label-md text-text-primary font-semibold">Explainer video</h2>
              <span className="font-caption text-caption text-text-secondary">YouTube link</span>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full font-caption text-caption font-semibold whitespace-nowrap ${
              setting.overridden
                ? 'bg-surface-container text-on-surface-variant'
                : 'bg-badge-discount-bg text-badge-discount-text'
            }`}
          >
            <Icon name={setting.overridden ? 'edit' : 'settings'} className="text-[13px]" />
            <span>{setting.overridden ? 'Custom link' : 'Default'}</span>
          </span>
        </div>

        <label className="flex flex-col gap-space-2xs" htmlFor="referral-video-url">
          <span className="font-label-sm text-label-sm text-text-secondary font-medium">
            Referral explainer video URL
          </span>
          <input
            aria-describedby={error ? 'referral-video-feedback' : undefined}
            aria-invalid={error !== null}
            className={`w-full h-12 px-3 rounded-xl bg-surface-canvas border font-body-md text-body-md text-text-primary placeholder:text-text-tertiary outline-none transition-colors ${
              error ? 'border-error' : 'border-border-subtle focus:border-primary/40'
            }`}
            id="referral-video-url"
            placeholder="https://www.youtube.com/watch?v=..."
            spellCheck={false}
            type="url"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              if (error) setError(null);
            }}
          />
        </label>

        <div aria-live="polite" id="referral-video-feedback" className="flex items-start gap-space-2xs min-h-[16px]">
          {error ? (
            <>
              <Icon name="error" className="text-[16px] text-error shrink-0 mt-0.5" />
              <span className="font-caption text-caption text-on-error-container leading-snug">{error}</span>
            </>
          ) : (
            <>
              <Icon name="info" className="text-[16px] text-text-tertiary shrink-0 mt-0.5" />
              <span className="font-caption text-caption text-text-tertiary leading-snug">
                A youtube.com/watch, youtu.be or /shorts link. Clearing the field restores the default.
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-space-xs">
          <button
            type="button"
            onClick={handleSave}
            className="h-11 px-space-md rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary font-semibold shadow-sm hover:bg-primary transition active:scale-[0.98]"
          >
            Save video
          </button>
          <button
            type="button"
            disabled={!setting.overridden}
            onClick={handleReset}
            className="h-11 px-space-md rounded-xl border border-border-subtle bg-surface-canvas hover:bg-surface-subtle text-text-secondary font-button-secondary text-button-secondary transition disabled:opacity-40 active:scale-[0.98]"
          >
            Reset to default
          </button>
          {notice && (
            <span className="font-caption text-caption text-badge-discount-text font-semibold" role="status">
              {notice}
            </span>
          )}
        </div>

        {/* Live preview so an admin can confirm the link actually plays */}
        <div className="flex flex-col gap-space-2xs pt-space-xs border-t border-border-subtle">
          <span className="font-label-sm text-label-sm text-text-secondary font-medium">Preview</span>
          {previewEmbed ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-surface-dim border border-border-subtle">
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                src={previewEmbed}
                title="Referral programme explainer video preview"
              />
            </div>
          ) : (
            <div className="w-full aspect-video rounded-xl bg-surface-subtle border border-border-subtle flex flex-col items-center justify-center gap-space-2xs text-text-tertiary">
              <Icon name="smart_display" className="text-[32px]" />
              <span className="font-caption text-caption">Enter a valid YouTube link to preview it.</span>
            </div>
          )}
        </div>
      </section>

      {/* Where it shows up */}
      <section className="rounded-2xl bg-surface-canvas shadow-sm p-space-md flex flex-col gap-space-sm">
        <h2 className="font-label-md text-label-md text-text-primary font-semibold">Where this appears</h2>
        <ul className="flex flex-col gap-space-2xs">
          {[
            'Business Dashboard → Referrals → See Referral Benefits',
            'Customer Dashboard → Referrals & Rewards → See Referral Benefits',
            'The onboarding welcome screen’s referral panel',
          ].map((entry) => (
            <li key={entry} className="flex items-start gap-space-2xs">
              <Icon name="check_circle" className="text-[18px] text-primary shrink-0 mt-0.5" />
              <span className="font-body-md text-body-md text-text-secondary leading-relaxed">{entry}</span>
            </li>
          ))}
        </ul>
        <p className="font-caption text-caption text-text-secondary leading-relaxed">
          Each audience only ever sees the benefits written for their own account type — businesses see business
          benefits, customers see customer benefits.
        </p>
      </section>

      {/* Honest build note */}
      <div className="rounded-xl bg-surface-tint-blue border border-border-active p-space-sm flex items-start gap-space-2xs">
        <Icon name="info" className="text-[18px] text-primary shrink-0 mt-0.5" />
        <p className="font-caption text-caption text-text-secondary leading-relaxed">
          This build has no backend and no authentication, so the link is stored on this device only and this screen
          is not linked from user navigation. When the platform API lands, <code>referralVideo.ts</code> swaps to{' '}
          <code>GET /admin/referral-video</code> and <code>PUT /admin/referral-video</code> without changing this
          screen.
        </p>
      </div>
    </div>
  );
}
