/**
 * Shared helpers for the product "Variants & Options" toggle.
 *
 * A merchant can switch variants off to sell an item as a single standard
 * product. Doing so must never destroy the variant rows they already entered —
 * they stay on the draft so re-enabling the toggle restores them, and so
 * historical orders/records that reference those variants keep resolving. The
 * helpers below decide what the *customer-facing* and *submitted* view of the
 * product should be, so every screen agrees on when an item is a variant
 * product versus a standard one.
 */

export interface VariantRecord {
  id: string;
  name: string;
  cut: string;
  price: string;
  inventory: string;
}

/** Minimal shape shared by the mobile and desktop product drafts. */
export interface VariantToggleState<V extends VariantRecord = VariantRecord> {
  variantsEnabled: boolean;
  variants: V[];
}

/**
 * True when the product should present selectable variants to customers.
 * Switching the toggle off (or having no saved variants) means a standard item.
 */
export function isVariantProduct<V extends VariantRecord>(state: VariantToggleState<V>): boolean {
  return state.variantsEnabled && state.variants.length > 0;
}

/**
 * Variants that should drive pricing, stock, previews and submission.
 *
 * Returns `[]` when the toggle is off so downstream screens treat the product
 * as a standard item — without deleting the saved rows from the draft.
 */
export function getActiveVariants<V extends VariantRecord>(state: VariantToggleState<V>): V[] {
  return state.variantsEnabled ? state.variants : [];
}
