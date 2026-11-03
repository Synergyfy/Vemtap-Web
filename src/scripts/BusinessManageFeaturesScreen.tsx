import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessFeaturePicker } from '../components/BusinessFeaturePicker';
import { ConfirmActionDialog } from '../components/ConfirmActionDialog';
import {
  isFeatureLocked,
  validateFeatureSelection,
  type FeatureId,
  type FeatureState,
} from './businessFeatures';

interface BusinessManageFeaturesScreenProps {
  onBack: () => void;
  /** Applied selection loaded when the screen opens. */
  initial: FeatureState;
  recommended: FeatureState;
  /** Validates and persists the pending selection. */
  onSave: (selected: FeatureState) => { success: boolean; error?: string };
}

function isSameSelection(a: FeatureState, b: FeatureState): boolean {
  return (Object.keys(a) as FeatureId[]).every((id) => Boolean(a[id]) === Boolean(b[id]));
}

/**
 * Business Settings › Manage Features. Toggles only edit the pending selection;
 * nothing in the dashboard changes until "Save Changes" succeeds.
 */
export function BusinessManageFeaturesScreen({
  onBack,
  initial,
  recommended,
  onSave,
}: BusinessManageFeaturesScreenProps) {
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
    <div className="biz-flow">
      <AppScreen>
        <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm">
          <div className="h-16 px-margin flex items-center justify-between">
            <div className="flex items-center gap-space-sm min-w-0">
              <button
                aria-label="Go back"
                type="button"
                onClick={onBack}
                className="w-11 h-11 -ml-space-2xs flex items-center justify-center rounded-full text-on-surface active:bg-surface-container transition-colors"
              >
                <Icon name="arrow_back_ios_new" className="text-[24px]" />
              </button>
              <h1 className="font-heading-sm text-heading-sm text-on-surface truncate tracking-tight">
                Manage Features
              </h1>
            </div>
          </div>
        </header>

        <main className="flex flex-col w-full px-margin pt-space-md pb-4 gap-space-sm">
          <div className="flex flex-col gap-space-2xs">
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              Choose which VEMTAP tools appear in your business dashboard.
            </p>
            {dirty && (
              <span className="inline-flex items-center gap-space-2xs self-start px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                <Icon name="edit" className="text-[13px]" />
                Unsaved changes
              </span>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-space-2xs px-space-sm py-space-2xs rounded-lg bg-error-container text-error font-label-sm text-label-sm"
            >
              <Icon name="error" className="text-[16px] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="flex items-start gap-space-2xs px-space-sm py-space-2xs rounded-lg bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm"
            >
              <Icon name="check_circle" className="text-[16px] shrink-0 mt-0.5" filled />
              <span>{notice}</span>
            </div>
          )}

          <div className="pt-space-xs">
            <BusinessFeaturePicker selected={pending} onToggle={toggle} busy={busy} />
          </div>

          <p className="font-caption text-caption text-text-tertiary leading-relaxed px-1">
            Turning a tool off never deletes its data — sales, conversations, contacts and records stay exactly
            where they are, ready when you switch it back on.
          </p>
        </main>

        <div className="sticky bottom-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border-subtle px-margin pt-space-sm pb-safe flex flex-col gap-space-xs shadow-[0_-8px_24px_-4px_rgba(17,24,39,0.08)]">
          <button
            type="button"
            onClick={() => setConfirmRestore(true)}
            disabled={busy}
            className="w-full h-11 rounded-xl border border-border-subtle bg-surface-canvas text-text-secondary font-button-secondary text-button-secondary font-semibold active:scale-[0.99] transition-transform disabled:opacity-60"
          >
            Restore Recommended Setup
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy || !dirty}
            className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-2xs shadow-md active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            <span>{busy ? 'Saving…' : 'Save Changes'}</span>
            {!busy && <Icon name="check" className="text-[20px]" />}
          </button>
        </div>

        <ConfirmActionDialog
          open={confirmRestore}
          onClose={() => setConfirmRestore(false)}
          onConfirm={restoreRecommended}
          title="Restore recommended setup?"
          message="This replaces your current selection with VEMTAP's recommended tools. Nothing is saved until you press Save Changes."
          bullets={[
            'Your existing business data is never affected.',
            'You can review the selection before saving.',
          ]}
          confirmLabel="Restore"
        />
      </AppScreen>
    </div>
  );
}
