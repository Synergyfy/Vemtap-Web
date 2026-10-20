import type { ImportBatchResult } from './importTypes';

/**
 * One-line human summary of an import batch, shared by every entry point's
 * post-import toast so the totals always read the same way.
 *
 * Drafts are the default; only rows that carried the explicit "publish after
 * import" intent *and* passed validation show up as published here.
 */
export function summariseImport(result: Pick<ImportBatchResult, 'imported' | 'published'>): string {
  const imported = Math.max(0, result.imported);
  if (imported === 0) return 'No products were imported.';

  const noun = imported === 1 ? 'product' : 'products';
  const published = Math.min(Math.max(0, result.published), imported);
  if (published === 0) return `${imported.toLocaleString()} ${noun} imported as drafts.`;

  const drafts = imported - published;
  return `${imported.toLocaleString()} ${noun} imported — ${published.toLocaleString()} published, ${drafts.toLocaleString()} saved as drafts.`;
}
