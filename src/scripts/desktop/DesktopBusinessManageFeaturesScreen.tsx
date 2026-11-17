import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessFeaturePicker } from '../../components/BusinessFeaturePicker';
import { ConfirmActionDialog } from '../../components/ConfirmActionDialog';
import {
  isFeatureLocked,
  validateFeatureSelection,
  type FeatureId,
  type FeatureState,
} from '../businessFeatures';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopBusinessManageFeaturesScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  /** Applied selection loaded when the screen opens. */
  initial: FeatureState;
  recommended: FeatureState;
  /** Validates and persists the pending selection. */
  onSave: (selected: FeatureState) => { success: boolean; error?: string };
}

function isSameSelection(a: FeatureState, b: FeatureState): boolean {
  return (Object.keys(a) as FeatureId[]).every((id) => Boolean(a[id]) === Boolean(b[id]));
}

/** Desktop shell for Business Settings › Manage Features. */
export function DesktopBusinessManageFeaturesScreen({
  onNav,
  initial,
  recommended,
  onSave,
}: DesktopBusinessManageFeaturesScreenProps) {
  const [pending, setPending] = useState<FeatureState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);

  const dirty = !isSameSelection(pending, initial);

  const toggle = (id: FeatureId) => {
    if (isFeatureLocked(id)) return;
    const next: FeatureState = { ...pending, [id]: !pending[id] };
    const validationError = validateFeatureSelection(next);
    if (validationError) {
      setError(validationError);
      setNotice(null);
      return;
    }
    setError(null);
    setNotice(null);
    setPending(next);
  };

  const restoreRecommended = () => {
    // Recommended fills in the switchable tools only — Products/Services keep
    // whatever the business already offers.
    setPending({ ...recommended, products: initial.products, services: initial.services });
    setError(null);
    setNotice(null);
    setConfirmRestore(false);
  };

  const save = () => {
    const validationError = validateFeatureSelection(pending);
    if (validationError) {
      setError(validationError);
      setNotice(null);
      return;
    }
    setBusy(true);
    const result = onSave(pending);
    setBusy(false);
    if (!result.success) {
      setError(result.error ?? 'We could not save your changes. Your previous setup is still active.');
      setNotice(null);
      return;
    }
    setError(null);
    setNotice('Your dashboard features have been updated.');
  };

  return (
    <BusinessPortalChrome activeNav="more-settings" onNav={onNav}>
      <div className="w-full py-space-xl space-y-space-lg">
        <section className="flex flex-col gap-space-2xs max-w-3xl">
          <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
            More · Business Settings
          </span>
          <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Manage Features</h1>
          <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
            Choose which VEMTAP tools appear in your business dashboard. Changes only apply once you save them.
          </p>
        </section>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-space-2xs px-space-sm py-space-2xs rounded-lg bg-error-container text-error font-label-sm text-label-sm max-w-3xl"
          >
            <Icon name="error" className="text-[16px] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="flex items-start gap-space-2xs px-space-sm py-space-2xs rounded-lg bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm max-w-3xl"
          >
            <Icon name="check_circle" className="text-[16px] shrink-0 mt-0.5" filled />
            <span>{notice}</span>
          </div>
        )}

        <div className="max-w-4xl">
          <BusinessFeaturePicker selected={pending} onToggle={toggle} busy={busy} />
        </div>

        <p className="font-caption text-caption text-text-tertiary leading-relaxed max-w-3xl">
          Turning a tool off never deletes its data — sales, conversations, contacts and records stay exactly where
          they are, ready when you switch it back on.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-sm border-t border-border-subtle max-w-4xl">
          <button
            type="button"
            onClick={() => setConfirmRestore(true)}
            disabled={busy}
            className="h-11 px-space-md rounded-xl border border-border-subtle bg-surface-canvas text-text-secondary font-button-secondary text-button-secondary font-semibold hover:bg-surface-subtle transition-colors disabled:opacity-60"
          >
            Restore Recommended Setup
          </button>
          <div className="flex items-center gap-space-sm">
            {dirty && (
              <span className="inline-flex items-center gap-space-2xs px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                <Icon name="edit" className="text-[13px]" />
                Unsaved changes
              </span>
            )}
            <button
              type="button"
              onClick={save}
              disabled={busy || !dirty}
              className="h-11 px-space-md rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-2xs shadow-sm active:scale-[0.98] transition-transform disabled:opacity-60"
            >
              <span>{busy ? 'Saving…' : 'Save Changes'}</span>
              {!busy && <Icon name="check" className="text-[18px]" />}
            </button>
          </div>
        </div>
      </div>

      <ConfirmActionDialog
        open={confirmRestore}
        onClose={() => setConfirmRestore(false)}
        onConfirm={restoreRecommended}
        title="Restore recommended setup?"
        message="This replaces your current selection with VEMTAP's recommended tools. Nothing is saved until you press Save Changes."
        bullets={['Your existing business data is never affected.', 'You can review the selection before saving.']}
        confirmLabel="Restore"
      />
    </BusinessPortalChrome>
  );
}
