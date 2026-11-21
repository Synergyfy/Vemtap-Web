/** Shared catalogue ordering + pagination for the desktop and mobile product hubs. */

export type CatalogSortKey = 'newest' | 'oldest' | 'recent' | 'name-asc' | 'name-desc';

export const CATALOG_PAGE_SIZE = 10;

export const CATALOG_SORT_CHOICES: Array<{ value: CatalogSortKey; label: string }> = [
  { value: 'newest', label: 'Newest added' },
  { value: 'oldest', label: 'Oldest added' },
  { value: 'recent', label: 'Recently edited' },
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
];

interface SortableCatalogueRecord {
  name: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const timestamp = (value?: string | null): number | null => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Sorts a copy. Records without timestamps keep their existing relative order
 * by falling back to the original index, so demo/imported rows never jump.
 */
export function sortCatalogueRecords<T extends SortableCatalogueRecord>(records: T[], sort: CatalogSortKey): T[] {
  return records
    .map((record, index) => ({ record, index }))
    .sort((a, b) => {
      const nameOrder = a.record.name.localeCompare(b.record.name, undefined, { sensitivity: 'base' });
      if (sort === 'name-asc') return nameOrder || a.index - b.index;
      if (sort === 'name-desc') return -nameOrder || a.index - b.index;

      const field = sort === 'recent' ? 'updatedAt' : 'createdAt';
      const aTime = timestamp(a.record[field]) ?? timestamp(a.record.createdAt);
      const bTime = timestamp(b.record[field]) ?? timestamp(b.record.createdAt);
      if (aTime != null && bTime != null && aTime !== bTime) return sort === 'oldest' ? aTime - bTime : bTime - aTime;
      if (aTime != null && bTime == null) return -1;
      if (aTime == null && bTime != null) return 1;
      return sort === 'oldest' ? a.index - b.index : b.index - a.index;
    })
    .map(({ record }) => record);
}

export function paginateCatalogueRecords<T>(records: T[], page: number, pageSize = CATALOG_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    totalPages,
    rows: records.slice(start, start + pageSize),
    from: records.length ? start + 1 : 0,
    to: Math.min(start + pageSize, records.length),
  };
}
