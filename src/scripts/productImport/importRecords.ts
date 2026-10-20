import type {
  ImportFieldKey,
  ImportMapping,
  ImportProductDraft,
  StagedRow,
} from './importTypes';

/**
 * Turns staged spreadsheet rows into normalised product drafts using the
 * confirmed column mapping. Values are parsed defensively: anything that cannot
 * be understood becomes `null` (surfaced later by validation) rather than a
 * guessed number. Regular, sale, cost, bulk/tiered pricing, units, variants and
 * stock are all preserved separately.
 */

/** "₦45,000", "1,200.50 NGN", "9600" -> 45000 / 1200.5 / 9600. Null when invalid. */
export function parseMoney(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const bare = trimmed
    .replace(/[\₦$€£¥]/g, '')
    .replace(/(?:ngn|usd|eur|gbp)/gi, '')
    .replace(/\((.*)\)/, '$1')
    .trim();
  if (!/^-?[\d.,]+$/.test(bare)) return null;
  // Support both 1,234.56 (comma thousands) and 1.234,56 (European decimal).
  let normalised = bare;
  if (/,\d{1,2}$/.test(bare) && bare.includes('.')) normalised = bare.replace(/\./g, '').replace(',', '.');
  else normalised = bare.replace(/,/g, '');
  const amount = Number(normalised);
  return Number.isFinite(amount) ? amount : null;
}

/** "42", "42 units", " 7 " -> 42. Null when empty/invalid (stock is optional). */
export function parseStock(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const match = trimmed.match(/-?\d+/);
  if (!match) return null;
  const amount = Number(match[0]);
  return Number.isFinite(amount) ? amount : null;
}

/** "Large:1800 | Small:1200" / "Large 1800; Small 1200" -> parsed variants. */
export function parseVariants(value: string): Array<{ name: string; price: number | null }> {
  const trimmed = value.trim();
  if (!trimmed) return [];
  return trimmed
    .split(/\s*[|;]\s*|\s*\/\s*(?=[^/]*\d)/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^(.*?)\s*[:@]\s*(.+)$/);
      if (match) return { name: match[1].trim(), price: parseMoney(match[2]) };
      return { name: part, price: null };
    })
    .filter((variant) => variant.name !== '')
    .slice(0, 20);
}

/** "1-5:900|6+:800" -> [{minQty:1,price:900},{minQty:6,price:800}] */
export function parseBulkTiers(value: string): Array<{ minQty: number; price: number }> {
  const trimmed = value.trim();
  if (!trimmed) return [];
  return trimmed
    .split(/\s*[|;]\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      // Accepts "5:900", "5@900", "1-5:900" and "6+:800" tier notations.
      const match = part.match(/^(\d+)\s*(?:[-–]\s*\d+)?\s*\+?\s*[:@]\s*(.+)$/);
      if (!match) return null;
      const minQty = Number(match[1]);
      const price = parseMoney(match[2]);
      if (!Number.isFinite(minQty) || price === null) return null;
      return { minQty, price };
    })
    .filter((tier): tier is { minQty: number; price: number } => tier !== null)
    .slice(0, 20);
}

/** Maps each field to the staged-row cell indexes that provide it. */
function fieldIndexMap(mapping: ImportMapping): Record<ImportFieldKey, number[]> {
  const map: Record<ImportFieldKey, number[]> = {
    name: [],
    description: [],
    sku: [],
    barcode: [],
    category: [],
    price: [],
    salePrice: [],
    costPrice: [],
    bulkPrice: [],
    stock: [],
    unit: [],
    variants: [],
    image: [],
    ignore: [],
  };
  for (const [index, field] of Object.entries(mapping)) {
    const column = Number(index);
    if (Number.isNaN(column) || !map[field]) continue;
    map[field].push(column);
  }
  return map;
}

/** Multi-value join for singleton fields mapped to more than one column. */
function joinValues(row: StagedRow, columns: number[], separator = ' '): string {
  return columns
    .map((column) => (row.cells[column] ?? '').trim())
    .filter(Boolean)
    .join(separator);
}

/** Builds the normalised draft for one staged row. */
export function buildImportDraft(row: StagedRow, mapping: ImportMapping, headers: string[]): ImportProductDraft {
  const indexes = fieldIndexMap(mapping);

  const imageColumns = indexes.image;
  const imageUrls = imageColumns
    .map((column) => (row.cells[column] ?? '').trim())
    .filter((value) => /^https?:\/\//i.test(value));

  const bulkColumns = indexes.bulkPrice;
  const bulkPricing = bulkColumns.flatMap((column) => parseBulkTiers(row.cells[column] ?? ''));

  const extra: Record<string, string> = {};
  headers.forEach((header, index) => {
    const field = mapping[index];
    const isIgnored = field === undefined || field === 'ignore';
    const value = (row.cells[index] ?? '').trim();
    if (isIgnored && value !== '') extra[header || `Column ${index + 1}`] = value;
  });

  return {
    rowId: row.id,
    rowNumber: row.rowNumber,
    name: joinValues(row, indexes.name, ' '),
    description: joinValues(row, indexes.description, '\n'),
    sku: joinValues(row, indexes.sku, ' '),
    barcode: joinValues(row, indexes.barcode, ' '),
    category: joinValues(row, indexes.category, ' / '),
    price: indexes.price.length ? parseMoney(row.cells[indexes.price[0]] ?? '') : null,
    salePrice: indexes.salePrice.length ? parseMoney(row.cells[indexes.salePrice[0]] ?? '') : null,
    costPrice: indexes.costPrice.length ? parseMoney(row.cells[indexes.costPrice[0]] ?? '') : null,
    bulkPricing,
    stock: indexes.stock.length ? parseStock(row.cells[indexes.stock[0]] ?? '') : null,
    unit: joinValues(row, indexes.unit, ' '),
    variants: indexes.variants.length ? parseVariants(row.cells[indexes.variants[0]] ?? '') : [],
    images: [...imageUrls, ...row.images],
    extra,
    publishAfterImport: row.publishAfterImport === true,
    markForReview: row.markForReview === true,
  };
}

/** Builds drafts for every included (non-excluded) staged row. */
export function buildImportDrafts(
  rows: StagedRow[],
  mapping: ImportMapping,
  headers: string[],
): ImportProductDraft[] {
  return rows.filter((row) => !row.excluded).map((row) => buildImportDraft(row, mapping, headers));
}
