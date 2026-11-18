import { Icon } from './ui/Icon';

interface ClusterCreationConfirmDialogProps {
  open: boolean;
  clusterName: string;
  clusterTypeLabel: string;
  businessName: string;
  businessLocation: string;
  radiusLabel: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ClusterCreationConfirmDialog({
  open,
  clusterName,
  clusterTypeLabel,
  businessName,
  businessLocation,
  radiusLabel,
  isSubmitting,
  onCancel,
  onConfirm,
}: ClusterCreationConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cluster-create-title"
        aria-describedby="cluster-create-description"
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-surface-canvas p-5 text-text-primary shadow-2xl sm:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary">
            <Icon name="location_on" className="text-[20px]" />
          </div>
          <div>
            <h2 id="cluster-create-title" className="text-lg font-bold">
              Review your new cluster
            </h2>
            <p id="cluster-create-description" className="mt-1 text-sm text-text-secondary">
              Check the cluster details and coverage before establishing it.
            </p>
          </div>
        </div>

        <dl className="mt-5 space-y-3 rounded-xl border border-border-subtle bg-surface-subtle p-4 text-sm">
          <div>
            <dt className="text-xs font-medium text-text-secondary">Cluster</dt>
            <dd className="mt-0.5 font-semibold">{clusterName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-text-secondary">Type</dt>
            <dd className="mt-0.5 font-semibold">{clusterTypeLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-text-secondary">Business location</dt>
            <dd className="mt-0.5 font-semibold">{businessLocation || 'Business location unavailable'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-text-secondary">Coverage radius</dt>
            <dd className="mt-0.5 font-semibold">{radiusLabel}</dd>
          </div>
        </dl>

        <div className="mt-4 space-y-2 text-sm leading-relaxed text-text-secondary">
          <p>
            VEMTAP will record <strong className="text-text-primary">{businessName}</strong> as the
            business that established this cluster. Businesses registering within this radius will
            be associated with the cluster and its shared features.
          </p>
          <p>
            This cluster and its coverage are permanent and cannot be deleted or reduced after
            creation. You can still edit the details before confirming.
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-11 rounded-xl border border-border-subtle bg-surface-canvas px-5 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-60"
          >
            Edit details
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-container px-5 text-sm font-semibold text-on-primary shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Establishing...' : 'Confirm & Establish'}
            {!isSubmitting && <Icon name="arrow_forward" className="text-[18px]" />}
          </button>
        </div>
      </section>
    </div>
  );
}
