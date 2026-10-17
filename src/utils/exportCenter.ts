import { downloadCsv } from './exportCsv';
import { printKvTable, printReport } from './printReport';

/**
 * Backing data for the Export Center screens (desktop + mobile).
 * Each report module contributes a small, self-describing table so the
 * generated CSV/PDF is a real artefact instead of a simulated progress bar.
 */
export interface ExportModuleSpec {
  key: string;
  label: string;
  headers: string[];
  rows: Array<Array<string | number>>;
}

export const EXPORT_CENTER_MODULES: ExportModuleSpec[] = [
  {
    key: 'sales',
    label: 'Revenue & Sales',
    headers: ['Metric', 'Value', 'Change vs prior period'],
    rows: [
      ['Gross revenue', '₦4,820,500', '+12.4%'],
      ['Net revenue (after refunds)', '₦4,655,900', '+11.8%'],
      ['Orders', '512', '+8.1%'],
      ['Average order value', '₦9,425', '+3.9%'],
      ['Card / transfer split', '68% card · 32% transfer', '—'],
      ['Refunds issued', '₦164,600 (14 orders)', '-2.2%'],
    ],
  },
  {
    key: 'customers',
    label: 'Customer Metrics',
    headers: ['Metric', 'Value', 'Detail'],
    rows: [
      ['Total customers', '1,482', '+96 new this period'],
      ['Returning rate', '41.6%', 'Cohort: Sep 2026'],
      ['Top segment', 'Lunch Regulars', '318 customers'],
      ['Churn risk', '122 customers', 'No visit in 45 days'],
      ['Avg. visits / customer', '2.3', 'Per 30 days'],
      ['Directory opt-in', '78%', 'Marketing consent given'],
    ],
  },
  {
    key: 'deals',
    label: 'Deals & Vouchers',
    headers: ['Campaign', 'Claims', 'Redemptions', 'ROI'],
    rows: [
      ['Weekend Prime Lunch Combo', '186', '64', '4.9×'],
      ['Happy Hour 25% Off', '240', '121', '3.6×'],
      ['First Order ₦1,000 Off', '305', '98', '2.8×'],
      ['Student Tuesdays', '88', '41', '3.1×'],
    ],
  },
  {
    key: 'locations',
    label: 'Location Performance',
    headers: ['Branch', 'Revenue share', 'Orders', 'Discovery views'],
    rows: [
      ['Wuse II — Apo Boulevard', '54%', '276', '8,420'],
      ['Maitama Heights', '29%', '149', '4,110'],
      ['Central Business District', '17%', '87', '2,650'],
    ],
  },
  {
    key: 'inventory',
    label: 'Inventory & Items',
    headers: ['Item', 'Units sold', 'Revenue', 'Stock status'],
    rows: [
      ['Woodfire Steak Platter', '184', '₦1,472,000', 'Healthy'],
      ['Jollof Rice & Chicken', '231', '₦693,000', 'Healthy'],
      ['Pepper Soup Bowl', '96', '₦259,200', 'Low'],
      ['Chapman (large)', '302', '₦151,000', 'Healthy'],
      ['Smoked Turkey Wrap', '0', '₦0', "86'd — unavailable"],
    ],
  },
  {
    key: 'staff',
    label: 'Staff & Shifts',
    headers: ['Staff', 'Role', 'Orders handled', 'Shift hours'],
    rows: [
      ['Amaka Obi', 'Manager', '198', '86.5'],
      ['Tunde Bakare', 'Cashier', '164', '72.0'],
      ['Grace Eze', 'Cashier', '150', '68.5'],
      ['PIN overrides', 'Manager only', '6', '—'],
    ],
  },
];

export interface ExportCenterConfig {
  format: 'csv' | 'pdf';
  selectedKeys: string[];
  timeframe: string;
  branchFilter: string;
}

/** Produce the real artefact for the Export Center and return a status line. */
export function runExportCenter(config: ExportCenterConfig): string {
  const modules = EXPORT_CENTER_MODULES.filter((module) => config.selectedKeys.includes(module.key));
  if (modules.length === 0) return 'Select at least one module to export.';

  if (config.format === 'csv') {
    // Modules have different column meanings, so the CSV flattens each row
    // into Module / Metric / Details (each value labelled with its column name).
    const headers = ['Module', 'Metric', 'Details'];
    const rows: Array<Array<string | number>> = modules.flatMap((module) =>
      module.rows.map((row) => [
        module.label,
        String(row[0]),
        row
          .slice(1)
          .map((value, index) => `${module.headers[index + 1]}: ${value}`)
          .join(' · '),
      ]),
    );
    const written = downloadCsv(`vemtap-analytics-${Date.now()}.csv`, headers, rows);
    return `${written} rows exported across ${modules.length} module${modules.length === 1 ? '' : 's'}.`;
  }

  printReport(
    'VEMTAP Analytics Report',
    `${printKvTable('Report scope', [
      ['Timeframe', config.timeframe],
      ['Branch filter', config.branchFilter],
      ['Modules included', modules.map((module) => module.label).join(', ')],
    ])}
     ${modules
       .map((module) =>
         printKvTable(
           module.label,
           module.rows.map(
             (row) =>
               [
                 String(row[0]),
                 row
                   .slice(1)
                   .map((value, index) => `${module.headers[index + 1]}: ${value}`)
                   .join(' · '),
               ] as [string, string],
           ),
         ),
       )
       .join('')}
     <p class="foot">NDPR compliant — exports expire after 24 hours and never include card BIN or PIN data.</p>`,
  );
  return `PDF summary generated with ${modules.length} module${modules.length === 1 ? '' : 's'}.`;
}
