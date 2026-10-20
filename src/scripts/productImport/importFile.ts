import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { downloadCsv } from '../../utils/exportCsv';
import type { ParsedSpreadsheet } from './importTypes';

/**
 * Secure file parsing for the Bulk Product Import wizard.
 *
 * Only .csv / .xlsx / .xls files are accepted, with size and row caps so a
 * hostile or accidental huge file cannot freeze the UI. Parsing happens fully
 * client-side (papaparse + sheetjs); no data leaves the browser.
 */

export const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_DATA_ROWS = 5000;
export const MAX_COLUMNS = 80;

const ACCEPTED_EXTENSIONS = ['csv', 'xlsx', 'xls'] as const;

export class ImportError extends Error {}

export function fileExtension(name: string): string {
  const parts = name.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

export function isSupportedSpreadsheet(name: string): boolean {
  return (ACCEPTED_EXTENSIONS as readonly string[]).includes(fileExtension(name));
}

const MAX_HEADER_LENGTH = 120;

function sanitizeHeader(value: unknown, index: number): string {
  const raw = String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
  if (!raw) return `Column ${index + 1}`;
  return raw.length > MAX_HEADER_LENGTH ? `${raw.slice(0, MAX_HEADER_LENGTH - 1)}…` : raw;
}

function normalizeRow(row: unknown[], width: number): string[] {
  const cells: string[] = [];
  for (let i = 0; i < width; i += 1) {
    const value = row[i];
    if (value === undefined || value === null) cells.push('');
    else if (typeof value === 'number') cells.push(String(value));
    else cells.push(String(value).replace(/\r\n/g, '\n').trim());
  }
  return cells;
}

interface RawTable {
  rows: unknown[][];
  warnings: string[];
}

async function readCsv(file: File): Promise<RawTable> {
  const text = await file.text();
  const parsed = Papa.parse<unknown[]>(text, {
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim(),
  });
  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    const first = parsed.errors[0];
    throw new ImportError(`We could not read this CSV file (row ${(first.row ?? 0) + 1}: ${first.message}). Re-save it as UTF-8 CSV and try again.`);
  }
  return { rows: parsed.data, warnings: parsed.errors.slice(0, 3).map((error) => `Row ${(error.row ?? 0) + 1}: ${error.message}`) };
}

async function readExcel(file: File): Promise<RawTable> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false, cellText: true, dense: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new ImportError('This workbook has no sheets. Export the sheet with your products and try again.');
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false, defval: '' });
  const warnings: string[] = [];
  if (workbook.SheetNames.length > 1) {
    warnings.push(`Workbook has ${workbook.SheetNames.length} sheets — importing the first one ("${sheetName}").`);
  }
  return { rows, warnings };
}

/**
 * Parses a CSV or Excel file into a header row + string data rows.
 * Throws `ImportError` with a user-facing message for unsupported or invalid files.
 */
export async function parseSpreadsheetFile(file: File): Promise<ParsedSpreadsheet> {
  if (!file) throw new ImportError('No file was selected.');
  const extension = fileExtension(file.name);
  if (!isSupportedSpreadsheet(file.name)) {
    throw new ImportError(
      `".${extension || 'unknown'}" files are not supported. Upload a .csv, .xlsx or .xls spreadsheet.`,
    );
  }
  if (file.size === 0) throw new ImportError('This file is empty (0 bytes).');
  if (file.size > MAX_FILE_BYTES) {
    throw new ImportError(`This file is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is ${MAX_FILE_BYTES / 1024 / 1024} MB. Split it into smaller batches.`);
  }

  const raw = extension === 'csv' ? await readCsv(file) : await readExcel(file);

  const nonEmptyRows = raw.rows.filter((row) => Array.isArray(row) && row.some((cell) => String(cell ?? '').trim() !== ''));
  if (nonEmptyRows.length < 2) {
    throw new ImportError('We could not find any product rows. The file needs a header row plus at least one product row.');
  }

  const headerRow = nonEmptyRows[0];
  const columnCount = Math.min(
    Math.max(...nonEmptyRows.slice(0, 200).map((row) => row.length), headerRow.length),
    MAX_COLUMNS,
  );
  if (columnCount > MAX_COLUMNS) {
    throw new ImportError(`This sheet has ${columnCount} columns — the importer supports up to ${MAX_COLUMNS}.`);
  }

  const headers = Array.from({ length: columnCount }, (_, index) => sanitizeHeader(headerRow[index], index));
  const warnings = [...raw.warnings];
  headers.forEach((header, index) => {
    if (/^column \d+$/.test(header)) warnings.push(`Column ${index + 1} has no header — you can map it manually.`);
  });

  const dataRows = nonEmptyRows.slice(1);
  if (dataRows.length > MAX_DATA_ROWS) {
    warnings.push(`File has ${dataRows.length} product rows — only the first ${MAX_DATA_ROWS} will be imported.`);
  }
  const rows = dataRows.slice(0, MAX_DATA_ROWS).map((row) => normalizeRow(row, columnCount));

  return {
    fileName: file.name,
    fileType: extension === 'csv' ? 'csv' : 'excel',
    headers,
    rows,
    warnings,
  };
}

/** Sample template columns shown in the wizard and written into the downloads. */
export const TEMPLATE_HEADERS = [
  'Product Name',
  'Description',
  'SKU',
  'Category',
  'Selling Price',
  'Sale Price',
  'Cost Price',
  'Stock',
  'Unit',
  'Barcode',
  'Image URL',
];

const TEMPLATE_ROWS: Array<Array<string | number>> = [
  [
    'Woodfire Aged Ribeye Steak 400g',
    'Prime grass-aged Angus beef, flame-seared with herb butter.',
    'VG-STEAK-01',
    'Grills & Steaks',
    9600,
    12000,
    5400,
    42,
    'piece',
    '6012345678901',
    'https://images.example.com/ribeye.jpg',
  ],
  [
    'Truffle Parmesan Fries',
    'Hand-cut fries tossed in parmesan and truffle oil.',
    'VG-SIDE-04',
    'Sides & Starters',
    4500,
    '',
    2100,
    18,
    'plate',
    '',
    'https://images.example.com/truffle-fries.jpg',
  ],
  [
    'Vintage Reserve Cabernet 2018',
    'Estate-bottled Cabernet Sauvignon, 750ml.',
    'VG-WINE-12',
    'Cellar & Spirits',
    42000,
    '',
    26000,
    3,
    'bottle',
    '6019876543210',
    '',
  ],
];

/** Downloads the CSV sample template via the app's shared CSV helper. */
export function downloadCsvTemplate(): number {
  return downloadCsv('vemtap_product_import_template.csv', TEMPLATE_HEADERS, TEMPLATE_ROWS);
}

/** Downloads the same template as a real .xlsx workbook. */
export function downloadExcelTemplate(): number {
  const sheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...TEMPLATE_ROWS]);
  sheet['!cols'] = TEMPLATE_HEADERS.map((header) => ({ wch: Math.max(header.length, 14) }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Products');
  XLSX.writeFile(workbook, 'vemtap_product_import_template.xlsx');
  return TEMPLATE_ROWS.length;
}
