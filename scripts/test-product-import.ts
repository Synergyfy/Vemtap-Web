/**
 * Dev-only self-test for the Bulk Product Import core logic.
 * Run with:  npx tsx scripts/test-product-import.ts
 * (Not part of the app bundle — tsconfig only includes src/.)
 */
import assert from 'node:assert';
import * as XLSX from 'xlsx';
import { parseSpreadsheetFile, ImportError } from '../src/scripts/productImport/importFile';
import { buildAutoMapping, mappingProblems } from '../src/scripts/productImport/importMapping';
import { buildImportDrafts, parseMoney, parseStock, parseVariants, parseBulkTiers } from '../src/scripts/productImport/importRecords';
import { validateImportDrafts, buildCatalogueIndex } from '../src/scripts/productImport/importValidation';
import {
  saveImportedProducts,
  listImportedProducts,
  publishImportedProducts,
  resolveProductDisplayImage,
  setImportedNeedsReview,
  updateImportedProduct,
  unpublishImportedProducts,
} from '../src/scripts/productImport/importedProductStore';
import { matchImagesToProducts, slugify } from '../src/scripts/productImport/importImages';
import { summariseImport } from '../src/scripts/productImport/importSummary';
import type { StagedRow } from '../src/scripts/productImport/importTypes';

function toCsv(headers: string[], rows: string[][]): string {
  const esc = (v: string) => (/[",\n]/.test(v) ? JSON.stringify(v) : v);
  return [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
}

function csvFile(name: string, csv: string): File {
  return new File([csv], name, { type: 'text/csv' });
}

function stagedRows(rows: string[][]): StagedRow[] {
  return rows.map((cells, i) => ({
    id: `r${i}`,
    rowNumber: i + 1,
    cells,
    images: [],
    imageErrors: [],
    excluded: false,
  }));
}

async function main() {
  let passed = 0;
  const ok = (label: string) => {
    passed += 1;
    console.log(`  ✓ ${label}`);
  };

  console.log('\n— Value parsers —');
  assert.equal(parseMoney('₦45,000'), 45000);
  assert.equal(parseMoney('1,200.50'), 1200.5);
  assert.equal(parseMoney('9600 NGN'), 9600);
  assert.equal(parseMoney('abc'), null);
  assert.equal(parseMoney(''), null);
  assert.equal(parseMoney('1.234,56'), 1234.56);
  ok('parseMoney handles ₦, commas, decimals, garbage');
  assert.equal(parseStock('42 units'), 42);
  assert.equal(parseStock('n/a'), null);
  ok('parseStock extracts integers, rejects text');
  assert.deepEqual(parseVariants('Large:1800 | Small:1200'), [
    { name: 'Large', price: 1800 },
    { name: 'Small', price: 1200 },
  ]);
  ok('parseVariants parses name:price pairs');
  assert.deepEqual(parseBulkTiers('1-5:900|6+:800'), [
    { minQty: 1, price: 900 },
    { minQty: 6, price: 800 },
  ]);
  ok('parseBulkTiers parses tiers');

  console.log('\n— 1,000-row CSV: parse, map, validate, import —');
  const COUNT = 1000;
  const headers = [
    'Item Title',
    'Product Description',
    'SKU Code',
    'Product Category',
    'Selling Price (₦)',
    'Discount Price',
    'Cost Price',
    'Qty',
    'Unit',
    'Barcode',
    'Photo URL',
    'Internal Notes',
  ];
  const rows: string[][] = [];
  for (let i = 0; i < COUNT; i += 1) {
    const isBad = i === 5 || i === 42; // missing price rows
    const dupe = i === 700; // duplicate SKU with row 0
    rows.push([
      `Product ${i + 1} — House Blend`,
      i % 3 === 0
        ? 'Slow-roasted with a house herb crust, resting on artisan sourdough and finished with brown butter jus.'
        : 'Short copy.',
      dupe ? 'SKU-0001' : `SKU-${String(i + 1).padStart(4, '0')}`,
      ['Grills', 'Sides', 'Drinks', 'Desserts'][i % 4],
      isBad ? 'N/A' : (1000 + i * 7).toLocaleString('en-US'),
      i % 10 === 0 ? String(1200 + i) : '',
      String(600 + i),
      String((i * 3) % 90),
      'piece',
      String(6010000000000 + i),
      i % 4 === 0 ? `https://cdn.example.com/img/product-${i}.jpg` : '',
      `warehouse-bin-${i % 20}`, // unknown column — must be preserved
    ]);
  }
  const parsed = await parseSpreadsheetFile(csvFile('inventory.csv', toCsv(headers, rows)));
  assert.equal(parsed.rows.length, COUNT);
  assert.equal(parsed.headers.length, headers.length);
  ok(`parsed ${parsed.rows.length} rows / ${parsed.headers.length} columns`);

  const { mapping, needsConfirmation } = buildAutoMapping(parsed);
  assert.equal(mapping[0], 'name');
  assert.equal(mapping[1], 'description');
  assert.equal(mapping[2], 'sku');
  assert.equal(mapping[3], 'category');
  assert.equal(mapping[4], 'price');
  assert.equal(mapping[5], 'salePrice');
  assert.equal(mapping[6], 'costPrice');
  assert.equal(mapping[7], 'stock');
  assert.equal(mapping[8], 'unit');
  assert.equal(mapping[9], 'barcode');
  assert.equal(mapping[10], 'image');
  assert.deepEqual(needsConfirmation, []);
  assert.deepEqual(mappingProblems(mapping), []);
  ok('auto-mapped all 11 known columns; "Internal Notes" left for review');

  const drafts = buildImportDrafts(stagedRows(parsed.rows), mapping, parsed.headers);
  assert.equal(drafts.length, COUNT);
  assert.equal(drafts[1].price, 1007);
  assert.equal(drafts[1].stock, 3);
  assert.equal(drafts[0].salePrice, 1200);
  assert.deepEqual(drafts[0].extra, { 'Internal Notes': 'warehouse-bin-0' });
  ok('prices/stock preserved separately; unknown column kept in extra');

  const report = validateImportDrafts(drafts, buildCatalogueIndex([{ name: 'Product 1 — House Blend', sku: 'SKU-0002' }]));
  assert.equal(report.blockedCount, 4); // rows 5 & 42 missing prices + both rows sharing SKU-0001
  const dupes = report.issues.filter((i) => i.severity === 'blocking' && i.field === 'sku');
  assert.equal(dupes.length, 2); // both rows sharing SKU-0001
  const existingDupe = report.issues.find((i) => i.message.includes('already exists in your catalogue'));
  assert.ok(existingDupe, 'existing-catalogue duplicate warned');
  const noImage = report.issues.filter((i) => i.field === 'image');
  assert.equal(noImage.length, 750);
  assert.ok(noImage.every((i) => i.severity === 'warning'), 'missing images are warnings only');
  ok(`validation: ${report.blockedCount} blocked, ${report.warningCount} warned, ${report.readyCount} clean`);

  // Duplicate SKU rows must be excluded from import (blocking).
  const importable = drafts.filter((d) => !report.issues.some((i) => i.rowId === d.rowId && i.severity === 'blocking'));
  const t0 = performance.now();
  const { saved, skippedDuplicates } = saveImportedProducts(
    { batchId: 'batch-test', fileName: 'inventory.csv', importedAt: Date.now(), failures: [] },
    importable,
    { existingSkus: new Set(['SKU-0002']) },
  );
  const elapsed = performance.now() - t0;
  assert.equal(saved.length, COUNT - 4 - 1); // minus 4 blocked rows, 1 existing SKU
  assert.equal(skippedDuplicates, 1);
  assert.ok(elapsed < 2000, `store write took ${elapsed.toFixed(0)}ms`);
  assert.ok(listImportedProducts().every((p) => p.status === 'draft'));
  ok(`imported ${saved.length} drafts in ${elapsed.toFixed(0)}ms — all status=draft (existing SKU skipped)`);

  // Publish only valid ones; missing image must NOT block.
  const ids = saved.map((s) => s.id).slice(0, 5);
  updateImportedProduct(saved[3].id, { price: null });
  const publish = publishImportedProducts(ids);
  assert.equal(publish.published.length, 4);
  assert.deepEqual(publish.blocked, [saved[3].id]);
  unpublishImportedProducts(ids.slice(0, 2));
  assert.equal(listImportedProducts().filter((p) => p.status === 'published').length, 2);
  ok('publish validation: missing price blocks, missing images never block; unpublish works');

  // Partial retry semantics: a re-run with fixed rows appends only new SKUs.
  const fixed = drafts.filter((d) => d.rowNumber === 6 || d.rowNumber === 43).map((d) => ({ ...d, price: 5000 }));
  const retry = saveImportedProducts(
    { batchId: 'batch-retry', fileName: 'inventory.csv', importedAt: Date.now(), failures: [] },
    fixed,
  );
  assert.equal(retry.saved.length, 2);
  ok('retry after partial failure imports only the fixed rows (no duplicates)');

  console.log('\n— Bulk actions (store) —');
  const clearStore = saveImportedProducts(
    { batchId: 'batch-bulk', fileName: 'bulk.csv', importedAt: Date.now(), failures: [] },
    [
      { ...drafts[0], rowId: 'b-valid', sku: 'BULK-VALID', publishAfterImport: true },
      // Missing price — publish intent must NOT bypass validation.
      { ...drafts[0], rowId: 'b-invalid', sku: 'BULK-INVALID', price: null, publishAfterImport: true },
      { ...drafts[0], rowId: 'b-review', sku: 'BULK-REVIEW', markForReview: true },
      { ...drafts[0], rowId: 'b-fallback', sku: 'BULK-FALLBACK', useCategoryImage: true },
    ],
  );
  const bySku = new Map(listImportedProducts().map((p) => [p.sku, p]));
  assert.equal(clearStore.published, 1);
  assert.equal(bySku.get('BULK-VALID')?.status, 'published');
  const invalid = bySku.get('BULK-INVALID');
  assert.equal(invalid?.status, 'draft');
  assert.equal(invalid?.needsReview, true, 'unpublishable row carrying a publish intent is flagged for review');
  assert.equal(bySku.get('BULK-REVIEW')?.needsReview, true);
  assert.equal(bySku.get('BULK-REVIEW')?.status, 'draft');
  assert.equal(bySku.get('BULK-FALLBACK')?.useCategoryImage, true);
  assert.equal(bySku.get('BULK-FALLBACK')?.status, 'draft', 'no publish intent means it stays a draft');
  ok('publish-after-import is validation-gated; review flag + category-image fallback are persisted');

  // Bulk needs-review toggle reports how many rows actually changed.
  // BULK-REVIEW is already flagged, so only BULK-VALID actually changes.
  const reviewIds = [bySku.get('BULK-VALID')!.id, bySku.get('BULK-REVIEW')!.id];
  assert.equal(setImportedNeedsReview(reviewIds, true), 1, 'already-flagged rows are not re-counted');
  assert.equal(setImportedNeedsReview(reviewIds, true), 0, 'second identical call is a no-op');
  assert.equal(setImportedNeedsReview(reviewIds, false), 2);
  assert.equal(setImportedNeedsReview(['imp_does_not_exist'], true), 0, 'unknown ids change nothing');
  ok('setImportedNeedsReview is idempotent and reports partial results');

  // Image resolution: own image wins, category image is a linked fallback.
  const categoryImage = 'data:image/jpeg;base64,CATEGORY';
  const resolve = (product: Parameters<typeof resolveProductDisplayImage>[0]) =>
    resolveProductDisplayImage(product, () => categoryImage);
  assert.equal(
    resolve({ images: ['data:image/jpeg;base64,OWN'], useCategoryImage: true, category: 'Grills' }),
    'data:image/jpeg;base64,OWN',
    'own image always wins',
  );
  assert.equal(resolve({ images: [], useCategoryImage: true, category: 'Grills' }), categoryImage);
  assert.equal(resolve({ images: [], useCategoryImage: false, category: 'Grills' }), undefined);
  assert.equal(resolve({ images: [], category: 'Grills' }), undefined, 'legacy rows default to no fallback');
  assert.equal(
    resolveProductDisplayImage({ images: [], useCategoryImage: true, category: 'Grills' }, () => undefined),
    undefined,
    'no category image -> caller keeps its placeholder',
  );
  ok('category image is a display fallback only (own image wins, never copied)');

  // The validation step reflects the fallback in its wording and keeps it a warning.
  const noImageDraft = { ...drafts[0], images: [], useCategoryImage: true };
  const fallbackReport = validateImportDrafts([noImageDraft], buildCatalogueIndex([]));
  const fallbackImageIssue = fallbackReport.issues.find((issue) => issue.field === 'image');
  assert.ok(fallbackImageIssue, 'a product without an image still reports the image issue');
  assert.ok(fallbackImageIssue.message.includes('category image'), 'issue explains the category-image fallback');
  assert.equal(fallbackImageIssue.severity, 'warning', 'a missing image never blocks import');
  const plainImageIssue = validateImportDrafts([{ ...noImageDraft, useCategoryImage: false }], buildCatalogueIndex([])).issues.find(
    (issue) => issue.field === 'image',
  );
  assert.ok(plainImageIssue && !plainImageIssue.message.includes('category image'));
  ok('validation explains the category-image fallback without changing severity');

  console.log('\n— Image matching —');
  const products = [
    { rowId: 'r0', sku: 'SKU-0001', name: 'Product 1 — House Blend' },
    { rowId: 'r1', sku: 'SKU-0002', name: 'Truffle Parmesan Fries' },
  ];
  const match = matchImagesToProducts(
    [
      { fileName: 'SKU-0001_hero.jpg', dataUrl: 'data:image/jpeg;base64,AAA' },
      { fileName: 'truffle-parmesan-fries.png', dataUrl: 'data:image/png;base64,BBB' },
      { fileName: 'orphan.webp', dataUrl: 'data:image/webp;base64,CCC' },
    ],
    products,
  );
  assert.deepEqual(match.matched.get('r0'), ['data:image/jpeg;base64,AAA']);
  assert.deepEqual(match.matched.get('r1'), ['data:image/png;base64,BBB']);
  assert.equal(match.unmatched.length, 1);
  assert.equal(slugify('Product 1 — House Blend'), 'product-1-house-blend');
  ok('ZIP/bulk images matched by SKU prefix and name slug; unmatched reported');

  console.log('\n— Error handling —');
  await assert.rejects(() => parseSpreadsheetFile(csvFile('pic.png', 'a,b')), ImportError);
  await assert.rejects(() => parseSpreadsheetFile(csvFile('empty.csv', '')), ImportError);
  await assert.rejects(() => parseSpreadsheetFile(csvFile('bad.csv', 'no,delimiters,here\n')), ImportError);
  ok('unsupported/empty/headerless files rejected with ImportError');

  console.log('\n— Excel (.xlsx) round-trip —');
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([headers, ...rows]), 'Inventory');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['ignored']]), 'Second sheet');
  const xlsxBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  const xlsxParsed = await parseSpreadsheetFile(
    new File([new Uint8Array(xlsxBuffer)], 'inventory.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
  );
  assert.equal(xlsxParsed.fileType, 'excel');
  assert.deepEqual(xlsxParsed.headers, headers);
  assert.equal(xlsxParsed.rows.length, rows.length);
  assert.equal(xlsxParsed.rows[0][0], rows[0][0]);
  assert.ok(xlsxParsed.warnings.some((warning) => warning.includes('2 sheets') && warning.includes('Inventory')));
  const xlsxMapping = buildAutoMapping(xlsxParsed);
  assert.equal(xlsxMapping.mapping[0], mapping[0]);
  assert.equal(xlsxMapping.mapping[4], mapping[4]);
  assert.equal(xlsxMapping.mapping[10], mapping[10]);
  assert.equal(xlsxMapping.mapping[0], 'name');
  assert.equal(xlsxMapping.mapping[4], 'price');
  assert.deepEqual(mappingProblems(xlsxMapping.mapping), []);
  ok('.xlsx parsed, extra sheet flagged, and mapped identically to the CSV');

  console.log('\n— Import summary copy —');
  assert.equal(summariseImport({ imported: 0, published: 0 }), 'No products were imported.');
  assert.equal(summariseImport({ imported: 3, published: 0 }), '3 products imported as drafts.');
  assert.equal(summariseImport({ imported: 1, published: 0 }), '1 product imported as drafts.');
  assert.equal(summariseImport({ imported: 4, published: 4 }), '4 products imported — 4 published, 0 saved as drafts.');
  assert.equal(summariseImport({ imported: 10, published: 3 }), '10 products imported — 3 published, 7 saved as drafts.');
  // Defensive: a published count above the imported count can never read as "more published than imported".
  assert.equal(summariseImport({ imported: 2, published: 9 }), '2 products imported — 2 published, 0 saved as drafts.');
  ok('import summary reports drafts & published totals consistently (all 4 entry points)');

  console.log(`\nAll ${passed} test groups passed.\n`);
}

main().catch((error) => {
  console.error('\nTEST FAILED:', error);
  process.exit(1);
});
