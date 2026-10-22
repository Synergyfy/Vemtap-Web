import { useEffect } from 'react';
import { Icon } from '../ui/Icon';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { toPrice } from '../../services/catalogueItemsService';
import { formatNaira } from '../../utils/format';

export interface LiveItemSummary {
  kind: 'product' | 'service';
  title: string;
  image?: string;
  category?: string;
  description?: string;
  price?: string;
  was?: string;
  /** Extra facts shown on review, e.g. ['Duration', '60 mins']. */
  details?: [string, string][];
}

const money = (value?: string) => {
  const n = toPrice(value);
  return n === undefined ? '—' : formatNaira(n);
};

function SummaryCard({ item }: { item: LiveItemSummary }) {
  return (
    <div className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm overflow-hidden flex flex-col sm:flex-row">
      {item.image ? (
        <img src={item.image} alt={item.title} className="w-full sm:w-56 aspect-[4/3] object-cover bg-surface-subtle" />
      ) : (
        <span className="w-full sm:w-56 aspect-[4/3] bg-surface-tint-blue text-primary flex items-center justify-center">
          <Icon name={item.kind === 'service' ? 'spa' : 'inventory_2'} className="text-[40px]" />
        </span>
      )}
      <div className="p-space-md flex flex-col gap-1 min-w-0">
        <span className="font-caption text-caption text-text-secondary">{item.category || (item.kind === 'service' ? 'Service' : 'Product')}</span>
        <span className="font-heading-md text-heading-md text-text-primary">{item.title || 'Untitled'}</span>
        <span className="font-heading-sm text-heading-sm text-primary">
          {money(item.price)}
          {toPrice(item.was) && toPrice(item.was)! > (toPrice(item.price) ?? 0) ? (
            <span className="ml-2 font-body-md text-body-md text-text-tertiary line-through">{money(item.was)}</span>
          ) : null}
        </span>
        {item.description ? <p className="font-body-md text-body-md text-text-secondary line-clamp-3">{item.description}</p> : null}
      </div>
    </div>
  );
}

/** Real branches only — never the sample ones. */
function useLiveBranches() {
  const { branches, isLive, activeBranchId } = useBusinessBranch();
  return { branches: isLive ? branches : [], mainId: activeBranchId };
}

/**
 * Live "where is it sold" step: the business's real branches. The item is
 * created at the active branch; any others ticked are switched on after
 * publishing (per-branch prices live in Catalogue → Branch pricing).
 */
export function LiveAvailabilityStep({
  item,
  selected,
  onChange,
  onBack,
  onNext,
  nextLabel,
}: {
  item: LiveItemSummary;
  selected: string[];
  onChange: (ids: string[]) => void;
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
}) {
  const { branches, mainId } = useLiveBranches();
  // Default: sold at every branch.
  useEffect(() => {
    if (!selected.length && branches.length) onChange(branches.map((b) => b.id as string).filter(Boolean));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches.length]);
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading-lg text-heading-lg text-text-primary">Where is this {item.kind} sold?</h1>
        <p className="font-body-md text-body-md text-text-secondary">Choose the branches that offer it. You can set different prices per branch later in Catalogue → Branch pricing.</p>
      </div>
      <SummaryCard item={item} />
      <ul className="flex flex-col gap-space-xs">
        {branches.map((branch) => {
          const id = branch.id as string;
          const main = id === mainId;
          const on = selected.includes(id) || main;
          return (
            <li key={id}>
              <label className={`flex items-center gap-space-sm rounded-xl border p-space-sm ${on ? 'border-primary/40 bg-surface-tint-blue' : 'border-border-subtle bg-surface-canvas'}`}>
                <input type="checkbox" checked={on} disabled={main} onChange={() => toggle(id)} className="w-5 h-5" aria-label={`Sold at ${branch.name}`} />
                <span className="flex flex-col flex-1 min-w-0">
                  <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{branch.name}</span>
                  <span className="font-caption text-caption text-text-secondary truncate">{branch.area || (main ? 'Main branch' : 'Branch')}</span>
                </span>
                <span className="font-label-md text-label-md text-text-primary shrink-0">{money(item.price)}</span>
              </label>
            </li>
          );
        })}
        {!branches.length ? <li className="font-body-md text-body-md text-text-secondary">Loading your branches…</li> : null}
      </ul>
      <div className="flex flex-wrap gap-space-xs justify-between">
        <button type="button" onClick={onBack} className="h-11 px-space-md rounded-xl bg-surface-container font-label-md text-label-md inline-flex items-center gap-1">
          <Icon name="arrow_back" className="text-[18px]" /> Back
        </button>
        <button type="button" onClick={onNext} className="h-11 px-space-lg rounded-xl bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-1">
          {nextLabel} <Icon name="arrow_forward" className="text-[18px]" />
        </button>
      </div>
    </div>
  );
}

/** Live review before publishing: exactly what will go live, with edit links. */
export function LiveReviewStep({
  item,
  branchIds,
  onBack,
  onEditBasics,
  onEditPricing,
  onEditBranches,
  onPublish,
  onSaveDraft,
}: {
  item: LiveItemSummary;
  branchIds: string[];
  onBack: () => void;
  onEditBasics: () => void;
  onEditPricing: () => void;
  onEditBranches: () => void;
  onPublish: () => void;
  onSaveDraft: () => void;
}) {
  const { branches, mainId } = useLiveBranches();
  const names = branches.filter((b) => branchIds.includes(b.id as string) || b.id === mainId).map((b) => b.name);
  const missing = !item.title.trim() || toPrice(item.price) === undefined;

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading-lg text-heading-lg text-text-primary">Review and publish</h1>
        <p className="font-body-md text-body-md text-text-secondary">This is what customers will see on your storefront and at the till.</p>
      </div>
      <SummaryCard item={item} />
      <div className="rounded-xl bg-surface-canvas border border-border-subtle p-space-md flex flex-col divide-y divide-border-subtle">
        {[
          { label: 'Name & description', value: item.title || '—', onEdit: onEditBasics },
          { label: 'Price', value: `${money(item.price)}${toPrice(item.was) ? ` · was ${money(item.was)}` : ''}`, onEdit: onEditPricing },
          ...(item.details ?? []).map(([label, value]) => ({ label, value, onEdit: onEditPricing })),
          { label: 'Sold at', value: names.join(', ') || 'Your main branch', onEdit: onEditBranches },
        ].map((row) => (
          <div key={row.label} className="py-space-xs flex items-center justify-between gap-space-sm">
            <span className="flex flex-col min-w-0">
              <span className="font-caption text-caption text-text-secondary">{row.label}</span>
              <span className="font-label-md text-label-md text-text-primary truncate">{row.value}</span>
            </span>
            <button type="button" onClick={row.onEdit} className="font-label-md text-label-md text-primary shrink-0">
              Edit
            </button>
          </div>
        ))}
      </div>
      {missing ? <p className="font-caption text-caption text-red-600">Add a name and a price before publishing.</p> : null}
      <div className="flex flex-wrap gap-space-xs justify-between">
        <span className="flex gap-space-xs">
          <button type="button" onClick={onBack} className="h-11 px-space-md rounded-xl bg-surface-container font-label-md text-label-md inline-flex items-center gap-1">
            <Icon name="arrow_back" className="text-[18px]" /> Back
          </button>
          <button type="button" onClick={onSaveDraft} className="h-11 px-space-md rounded-xl font-label-md text-label-md text-text-secondary">
            Save & exit
          </button>
        </span>
        <button
          type="button"
          disabled={missing}
          onClick={onPublish}
          className="h-11 px-space-lg rounded-xl bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-1 disabled:opacity-50"
        >
          <Icon name="rocket_launch" className="text-[18px]" /> Publish {item.kind}
        </button>
      </div>
    </div>
  );
}
