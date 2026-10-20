import type { ImportFieldKey, ImportMapping, ParsedColumn, ParsedSpreadsheet } from './importTypes';

/**
 * Rule-based automatic column mapping.
 *
 * Strategy (in priority order):
 *  1. Exact header alias match (e.g. "product name", "item title" -> name).
 *  2. Tokenised header alias match ("wholesale cost price" -> costPrice).
 *  3. Data-driven heuristics on sample values (currency patterns, integers,
 *     URLs, length + uniqueness) — never the 20-character rule alone; length is
 *     only one signal combined with uniqueness, emptiness and header tokens.
 *
 * Every suggestion carries a confidence score and a human-readable reason so
 * the merchant can confirm or correct it in Step 2. Weak suggestions
 * (confidence < 0.7) are flagged `ambiguous` and the wizard requires an
 * explicit confirmation before continuing.
 */

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[\₦$€£¥]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

interface AliasEntry {
  field: ImportFieldKey;
  aliases: string[];
}

/** Known header aliases per target field, most specific first. */
const HEADER_ALIASES: AliasEntry[] = [
  {
    field: 'name',
    aliases: [
      'product name',
      'product',
      'item name',
      'item title',
      'name',
      'title',
      'dish name',
      'goods name',
      'product title',
      'itemname',
      'productname',
    ],
  },
  {
    field: 'description',
    aliases: [
      'product description',
      'description',
      'details',
      'item description',
      'long description',
      'about',
      'summary',
      'desc',
    ],
  },
  { field: 'sku', aliases: ['sku', 'sku code', 'product sku', 'item code', 'item sku', 'stock keeping unit', 'variant sku'] },
  { field: 'barcode', aliases: ['barcode', 'ean', 'upc', 'gtin', 'barcode number', 'ean 13', 'product code', 'barcode ean'] },
  {
    field: 'category',
    aliases: ['category', 'product category', 'item category', 'product type', 'collection', 'product group', 'department'],
  },
  {
    field: 'price',
    aliases: [
      'selling price',
      'price',
      'retail price',
      'base price',
      'regular price',
      'unit price',
      'list price',
      'mrp',
      'current price',
      'standard price',
    ],
  },
  {
    field: 'salePrice',
    aliases: [
      'sale price',
      'discounted price',
      'discount price',
      'compare price',
      'compare at price',
      'compareat',
      'was price',
      'offer price',
      'promo price',
      'special price',
      'rrp',
      'old price',
    ],
  },
  {
    field: 'costPrice',
    aliases: ['cost price', 'cost', 'cost per item', 'unit cost', 'buying price', 'purchase price', 'wholesale cost', 'base cost'],
  },
  {
    field: 'bulkPrice',
    aliases: ['bulk price', 'tiered price', 'wholesale price', 'bulk pricing', 'price tiers', 'tier pricing', 'volume price'],
  },
  {
    field: 'stock',
    aliases: [
      'stock',
      'quantity',
      'qty',
      'inventory',
      'stock quantity',
      'stock level',
      'units in stock',
      'available quantity',
      'available',
      'on hand',
      'onhand',
      'inventory quantity',
      'balance',
    ],
  },
  { field: 'unit', aliases: ['unit', 'uom', 'unit of measure', 'measure', 'pack size', 'weight'] },
  { field: 'variants', aliases: ['variants', 'options', 'variant options', 'variants pricing', 'choices'] },
  { field: 'image', aliases: ['image', 'image url', 'photo', 'photo url', 'picture', 'product image', 'image link', 'img', 'thumbnail', 'img url'] },
];

/** Token-level aliases catch phrasings like "wholesale unit cost (ngn)". */
const TOKEN_ALIASES: Array<{ field: ImportFieldKey; tokens: string[] }> = [
  { field: 'salePrice', tokens: ['sale', 'discount', 'compare', 'promo', 'offer', 'was', 'clearance'] },
  { field: 'costPrice', tokens: ['cost', 'buying', 'purchase', 'cogs'] },
  { field: 'bulkPrice', tokens: ['bulk', 'tiered', 'volume'] },
  { field: 'price', tokens: ['price', 'mrp', 'rate'] },
  { field: 'stock', tokens: ['stock', 'quantity', 'qty', 'inventory', 'onhand', 'available', 'balance'] },
  { field: 'name', tokens: ['name', 'title'] },
  { field: 'description', tokens: ['description', 'details', 'desc', 'notes'] },
  { field: 'category', tokens: ['category', 'collection', 'group', 'department'] },
  { field: 'sku', tokens: ['sku', 'code'] },
  { field: 'barcode', tokens: ['barcode', 'ean', 'upc', 'gtin'] },
  { field: 'image', tokens: ['image', 'photo', 'picture', 'img', 'thumbnail'] },
  { field: 'unit', tokens: ['unit', 'uom', 'pack'] },
  { field: 'variants', tokens: ['variant', 'options', 'choices'] },
];

const MONEY_PATTERN = /^[\s]*[\₦$€£¥]?\s*-?\d{1,3}(?:[,\s]\d{3})*(?:\.\d+)?\s*[\₦$€£¥]?(?:\s*(?:ngn|usd|eur|gbp))?$/i;
const INTEGER_PATTERN = /^\s*-?\d+\s*$/;
const URL_PATTERN = /^https?:\/\/\S+$/i;
const BULK_TIER_PATTERN = /\d+\s*[:@]\s*[\d.,]+/;
const NUMERIC_BARE_PATTERN = /^-?[\d.,\s]+$/;

interface ColumnProfile {
  count: number;
  numericRatio: number;
  currencyRatio: number;
  integerRatio: number;
  urlRatio: number;
  bulkTierRatio: number;
  avgLength: number;
  maxLength: number;
  uniqueRatio: number;
}

function sampleProfile(values: string[]): ColumnProfile {
  const nonEmpty = values.filter((value) => value.trim() !== '');
  const total = nonEmpty.length || 1;
  let numeric = 0;
  let currency = 0;
  let integer = 0;
  let url = 0;
  let bulkTier = 0;
  let lengthSum = 0;
  let maxLength = 0;
  const unique = new Set<string>();
  for (const value of nonEmpty) {
    const trimmed = value.trim();
    const bare = trimmed
      .replace(/[\₦$€£¥]/g, '')
      .replace(/(?:ngn|usd|eur|gbp)/gi, '')
      .trim();
    const numericValue = Number(bare.replace(/[,\s]/g, ''));
    const looksNumeric = bare !== '' && NUMERIC_BARE_PATTERN.test(bare) && !Number.isNaN(numericValue);
    if (looksNumeric) {
      numeric += 1;
      if (INTEGER_PATTERN.test(bare)) integer += 1;
      if (MONEY_PATTERN.test(trimmed)) currency += 1;
    }
    if (URL_PATTERN.test(trimmed)) url += 1;
    if (BULK_TIER_PATTERN.test(trimmed) && !INTEGER_PATTERN.test(trimmed)) bulkTier += 1;
    lengthSum += trimmed.length;
    maxLength = Math.max(maxLength, trimmed.length);
    unique.add(trimmed.toLowerCase());
  }
  return {
    count: nonEmpty.length,
    numericRatio: numeric / total,
    currencyRatio: currency / total,
    integerRatio: integer / total,
    urlRatio: url / total,
    bulkTierRatio: bulkTier / total,
    avgLength: nonEmpty.length ? lengthSum / nonEmpty.length : 0,
    maxLength,
    uniqueRatio: unique.size / total,
  };
}

const SAMPLE_SIZE = 40;

function suggestField(
  normalizedHeader: string,
  profile: ColumnProfile,
): { field: ImportFieldKey; confidence: number; reason: string; ambiguous: boolean } {
  const headerTokens = normalizedHeader.split(' ').filter(Boolean);

  // 1. Exact alias match on the whole header.
  for (const entry of HEADER_ALIASES) {
    if (entry.aliases.includes(normalizedHeader)) {
      return { field: entry.field, confidence: 0.98, reason: `Header matches “${entry.aliases[0]}”`, ambiguous: false };
    }
  }

  // 2. Tokenised match: a field token appears anywhere in the header.
  for (const entry of TOKEN_ALIASES) {
    if (entry.tokens.some((token) => headerTokens.includes(token))) {
      return { field: entry.field, confidence: 0.86, reason: `Header mentions “${entry.tokens[0]}”`, ambiguous: false };
    }
  }

  // 3. Data-driven heuristics (weak — require confirmation).
  if (profile.urlRatio >= 0.7) {
    return { field: 'image', confidence: 0.62, reason: 'Values look like image links', ambiguous: true };
  }
  if (profile.bulkTierRatio >= 0.6) {
    return { field: 'bulkPrice', confidence: 0.6, reason: 'Values look like quantity tiers (e.g. 5:900)', ambiguous: true };
  }
  if (profile.numericRatio >= 0.8 && profile.currencyRatio >= 0.5) {
    return { field: 'price', confidence: 0.55, reason: 'Values look like currency amounts', ambiguous: true };
  }
  if (profile.numericRatio >= 0.8 && profile.integerRatio >= 0.7) {
    return { field: 'stock', confidence: 0.5, reason: 'Values look like whole-number quantities', ambiguous: true };
  }
  if (profile.numericRatio >= 0.8) {
    return { field: 'price', confidence: 0.45, reason: 'Values are numeric — possibly a price', ambiguous: true };
  }
  // Long, mostly-unique free text suggests a description; short unique text a
  // name. Length is one signal among several — never the sole 20-char rule.
  if (profile.count > 0 && profile.avgLength >= 45 && profile.uniqueRatio >= 0.5) {
    return { field: 'description', confidence: 0.5, reason: 'Long, unique free-text values', ambiguous: true };
  }
  if (profile.count > 0 && profile.avgLength <= 44 && profile.uniqueRatio >= 0.85) {
    return { field: 'name', confidence: 0.45, reason: 'Short, unique label-like values', ambiguous: true };
  }

  return { field: 'ignore', confidence: 0.2, reason: 'No matching pattern — column kept for review', ambiguous: false };
}

/** Builds a `ParsedColumn` profile (with mapping suggestion) for one column. */
export function profileColumn(index: number, header: string, rows: string[][]): ParsedColumn {
  const samples: string[] = [];
  for (const row of rows) {
    const value = (row[index] ?? '').trim();
    if (value !== '') samples.push(value);
    if (samples.length >= SAMPLE_SIZE) break;
  }
  const profile = sampleProfile(samples);
  const normalizedHeader = normalize(header);
  const suggestion = suggestField(normalizedHeader, profile);

  return {
    index,
    header,
    normalizedHeader,
    samples: samples.slice(0, 4),
    nonEmpty: profile.count,
    numericRatio: profile.numericRatio,
    currencyRatio: profile.currencyRatio,
    integerRatio: profile.integerRatio,
    urlRatio: profile.urlRatio,
    avgLength: profile.avgLength,
    maxLength: profile.maxLength,
    uniqueRatio: profile.uniqueRatio,
    suggestedField: suggestion.field,
    confidence: suggestion.confidence,
    reason: suggestion.reason,
    ambiguous: suggestion.ambiguous,
  };
}

/**
 * Produces the automatic mapping for an entire sheet. Singleton fields are
 * assigned to the single best-scoring column; weaker suggestions that would
 * collide with a stronger one are demoted to `ignore` (still visible in the
 * staging table) so nothing is silently lost.
 */
export function buildAutoMapping(sheet: Pick<ParsedSpreadsheet, 'headers' | 'rows'>): {
  mapping: ImportMapping;
  columns: ParsedColumn[];
  /** Column indexes whose suggestion is ambiguous and needs confirmation. */
  needsConfirmation: number[];
} {
  const columns = sheet.headers.map((header, index) => profileColumn(index, header, sheet.rows));

  const mapping: ImportMapping = {};
  const claimed = new Set<ImportFieldKey>();

  // Strong (non-ambiguous) suggestions win collisions; ties break on confidence.
  const ordered = [...columns].sort(
    (a, b) => Number(a.ambiguous) - Number(b.ambiguous) || b.confidence - a.confidence,
  );
  for (const column of ordered) {
    if (column.suggestedField === 'ignore') continue;
    if (claimed.has(column.suggestedField)) {
      mapping[column.index] = 'ignore';
      column.reason = 'Another column is a better match for this field — kept for review';
      continue;
    }
    mapping[column.index] = column.suggestedField;
    claimed.add(column.suggestedField);
  }

  const needsConfirmation = columns
    .filter((column) => column.ambiguous && mapping[column.index] !== 'ignore' && column.suggestedField !== 'ignore')
    .map((column) => column.index);

  return { mapping, columns, needsConfirmation };
}

/** Human message for the ambiguity banner in Step 2. */
export function ambiguityNotice(column: ParsedColumn): string {
  const guess =
    column.suggestedField === 'price'
      ? 'a selling price'
      : column.suggestedField === 'stock'
        ? 'a stock quantity'
        : `a ${column.suggestedField}`;
  return `“${column.header}” looks like ${guess}, but we're not certain. Confirm or change the mapping.`;
}

/** True when required singleton fields are still ambiguous (blocks continue). */
export function hasUnconfirmedAmbiguity(
  columns: ParsedColumn[],
  mapping: ImportMapping,
  confirmed: Record<number, boolean>,
): ParsedColumn[] {
  return columns.filter(
    (column) =>
      column.ambiguous &&
      !confirmed[column.index] &&
      mapping[column.index] !== 'ignore' &&
      column.suggestedField !== 'ignore',
  );
}

/** Validates that required fields (name + price) are mapped exactly once. */
export function mappingProblems(mapping: ImportMapping): string[] {
  const counts: Partial<Record<ImportFieldKey, number>> = {};
  for (const field of Object.values(mapping)) {
    if (field === 'ignore') continue;
    counts[field] = (counts[field] ?? 0) + 1;
  }
  const problems: string[] = [];
  if (!counts.name) problems.push('Map one column to Product Name.');
  if (!counts.price) problems.push('Map one column to Selling Price.');
  (['name', 'price'] as const).forEach((field) => {
    if ((counts[field] ?? 0) > 1) problems.push(`Only one column can map to ${field === 'name' ? 'Product Name' : 'Selling Price'}.`);
  });
  return problems;
}
