/**
 * Shared CSV download helper for business-dashboard export buttons.
 * Builds a UTF-8 CSV (with BOM so Excel renders Naira signs correctly),
 * triggers a browser download, and returns the number of data rows written.
 */
export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>): number {
  const escapeCell = (value: string | number): string => {
    const text = String(value ?? '');
    // Quote anything with a comma, quote, newline, or leading/trailing space.
    return /[",\n]/.test(text) || text !== text.trim() ? JSON.stringify(text) : text;
  };
  const csv = [headers.map(escapeCell).join(','), ...rows.map((row) => row.map(escapeCell).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return rows.length;
}
