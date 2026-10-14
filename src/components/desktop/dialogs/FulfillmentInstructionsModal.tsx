import { Icon } from '../../ui/Icon';
import { DesktopModal, ModalCloseButton } from '../DesktopModal';

/**
 * Review of the merchant-configured hand-over rules for everything in the tray.
 *
 * Opened from the cart's "Review Fulfillment Instructions" action so the
 * customer sees pickup, collection, delivery and redemption requirements
 * *before* submitting the order. Every field here mirrors what a merchant
 * configures per venue / per product (BACKEND GAP: served today from the local
 * cart data — `GET /cart/fulfillment` would return the same shape).
 */

export interface FulfillmentItemNote {
  name: string;
  note: string;
}

export interface FulfillmentVenueInstructions {
  id: string;
  name: string;
  icon: string;
  iconClass: string;
  address: string;
  distance: string;
  /** How the venue hands the order over: pickup, collection, delivery, booking. */
  mode: string;
  modeIcon: string;
  /** Collection window configured by the merchant. */
  window: string;
  /** Prep / readiness expectation shown to the customer. */
  leadTime: string;
  /** How and when payment happens on site. */
  payment: string;
  /** Ordered hand-over steps. */
  steps: string[];
  /** Per-product requirements (customization, assignment, add-on handling). */
  itemNotes: FulfillmentItemNote[];
  /** Rules the customer must know before submitting. */
  requirements: string[];
}

export interface FulfillmentInstructionsModalProps {
  open: boolean;
  onClose: () => void;
  /** Leaves the review and continues to the order submission step. */
  onProceed: () => void;
  /** Venues in the tray that still have items. */
  venues: FulfillmentVenueInstructions[];
  /** Tray amount referenced by the continue button. */
  totalLabel?: string;
}

export function FulfillmentInstructionsModal({
  open,
  onClose,
  onProceed,
  venues,
  totalLabel,
}: FulfillmentInstructionsModalProps) {
  return (
    <DesktopModal
      open={open}
      onClose={onClose}
      maxWidth="max-w-[720px]"
      backdropClassName="bg-on-surface/60 backdrop-blur-sm"
      cardClassName="bg-surface-canvas rounded-2xl max-h-[92vh]"
    >
      <div className="px-space-xl pt-space-xl pb-space-lg flex items-start justify-between gap-space-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-space-xs text-primary font-label-sm text-label-sm bg-surface-tint-blue px-space-sm py-0.5 rounded-full mb-1">
            <Icon name="receipt_long" className="text-[14px]" />
            <span>Review before submitting</span>
          </div>
          <h2 className="font-heading-lg text-heading-lg text-on-surface tracking-tight">
            Fulfillment Instructions
          </h2>
          <p className="font-body-md text-body-md text-text-secondary">
            Pickup, collection and redemption details configured by each merchant in this tray.
          </p>
        </div>
        <ModalCloseButton onClose={onClose} />
      </div>

      <div className="px-space-xl py-space-sm overflow-y-auto space-y-space-lg">
        {venues.length === 0 && (
          <p className="font-body-md text-body-md text-text-secondary p-space-md bg-surface-subtle rounded-xl">
            Nothing is left in this tray. Add an item from a merchant to see how they hand it over.
          </p>
        )}

        {venues.map((venue) => (
          <section key={venue.id} className="rounded-xl border border-surface-container-highest overflow-hidden">
            <header className="flex items-center gap-space-sm p-space-md bg-surface-subtle">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${venue.iconClass}`}>
                <Icon name={venue.icon} className="text-[22px]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading-sm text-heading-sm text-on-surface truncate">{venue.name}</h3>
                <p className="font-caption text-caption text-text-tertiary truncate">
                  {venue.address} • {venue.distance}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-space-xs py-1 rounded-full bg-surface-container text-on-secondary-container font-label-sm text-label-sm font-semibold shrink-0">
                <Icon name={venue.modeIcon} className="text-[15px]" />
                <span>{venue.mode}</span>
              </span>
            </header>

            <div className="p-space-md space-y-space-md">
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                <div className="rounded-lg bg-surface-subtle p-space-sm">
                  <dt className="font-caption text-caption text-text-tertiary">Collection point</dt>
                  <dd className="font-label-md text-label-md text-on-surface font-medium">{venue.address}</dd>
                </div>
                <div className="rounded-lg bg-surface-subtle p-space-sm">
                  <dt className="font-caption text-caption text-text-tertiary">Window</dt>
                  <dd className="font-label-md text-label-md text-on-surface font-medium">{venue.window}</dd>
                </div>
                <div className="rounded-lg bg-surface-subtle p-space-sm">
                  <dt className="font-caption text-caption text-text-tertiary">Timing</dt>
                  <dd className="font-label-md text-label-md text-on-surface font-medium">{venue.leadTime}</dd>
                </div>
              </dl>

              <div className="space-y-space-xs">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-tertiary font-bold block">
                  Collection steps
                </span>
                <ol className="space-y-space-xs">
                  {venue.steps.map((step, index) => (
                    <li
                      key={step}
                      className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-subtle/70"
                    >
                      <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-body-md text-body-md text-text-secondary leading-snug">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {venue.itemNotes.length > 0 && (
                <div className="space-y-space-xs">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-tertiary font-bold block">
                    For the items in your tray
                  </span>
                  <ul className="space-y-space-xs">
                    {venue.itemNotes.map((item) => (
                      <li key={item.name} className="flex items-start gap-space-sm">
                        <Icon
                          name="check_circle"
                          filled
                          className="text-[18px] text-badge-discount-text shrink-0 mt-0.5"
                        />
                        <span className="font-body-md text-body-md text-text-secondary leading-snug">
                          <span className="text-on-surface font-medium">{item.name}</span>
                          <span className="text-text-tertiary"> — </span>
                          {item.note}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-space-xs">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-tertiary font-bold block">
                  Before you submit
                </span>
                <ul className="space-y-space-xs">
                  {venue.requirements.map((requirement) => (
                    <li key={requirement} className="flex items-start gap-space-sm">
                      <Icon
                        name="rule"
                        className="text-[18px] text-primary shrink-0 mt-0.5"
                      />
                      <span className="font-body-md text-body-md text-text-secondary leading-snug">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-surface-container-low rounded-lg p-space-sm flex items-start gap-space-sm">
                <Icon name="shield" className="text-[18px] text-primary shrink-0 mt-0.5" />
                <span className="font-body-md text-body-md text-text-secondary leading-snug">{venue.payment}</span>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="px-space-xl pt-space-md pb-space-xl space-y-space-md shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
        <button
          type="button"
          onClick={onProceed}
          disabled={venues.length === 0}
          className={`w-full h-[52px] rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-space-xs transition-all active:scale-[0.99] ${
            venues.length === 0
              ? 'bg-surface-container-high text-text-tertiary cursor-not-allowed'
              : 'bg-primary-container hover:bg-primary text-on-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.28)]'
          }`}
        >
          <span>Continue to Checkout{totalLabel ? ` (${totalLabel})` : ''}</span>
          <Icon name="arrow_forward" className="text-[20px]" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 text-text-secondary hover:text-on-surface font-button-secondary text-button-secondary rounded-xl transition-colors flex items-center justify-center"
        >
          Back to Cart
        </button>
      </div>
    </DesktopModal>
  );
}
