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

/** Saves a file the API returned base64-encoded (analytics and customer exports). */
export function downloadBase64(filename: string, mimeType: string, base64: string) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoking straight away can cancel the download in Chrome; give it a moment.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
