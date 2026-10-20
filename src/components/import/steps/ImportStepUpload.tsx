import { useRef, useState } from 'react';
import { Icon } from '../../ui/Icon';
import { downloadCsvTemplate, downloadExcelTemplate, fileExtension, isSupportedSpreadsheet } from '../../../scripts/productImport/importFile';

interface ImportStepUploadProps {
  onFileChosen: (file: File) => void;
  error: string | null;
  busy: boolean;
  fileName: string | null;
}

/** Step 1 — upload CSV/Excel, template download, short instructions. */
export function ImportStepUpload({ onFileChosen, error, busy, fileName }: ImportStepUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onFileChosen(file);
  };

  return (
    <div className="flex flex-col gap-space-md">
      <div>
        <h2 className="font-heading-md text-heading-md text-text-primary">Upload your spreadsheet</h2>
        <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
          Upload a CSV or Excel file with your products. We&apos;ll match your columns to product fields next —
          nothing is imported until you confirm.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Upload spreadsheet file"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-space-lg flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
          dragging ? 'border-primary-container bg-surface-tint-blue' : 'border-border-subtle hover:border-border-active bg-surface-subtle/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls,text/csv"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFileChosen(file);
            event.target.value = '';
          }}
        />
        <span className="w-14 h-14 rounded-2xl bg-surface-tint-blue text-primary flex items-center justify-center mb-space-sm">
          <Icon name={busy ? 'progress_activity' : 'upload_file'} className={`text-[28px] ${busy ? 'animate-spin' : ''}`} />
        </span>
        <span className="font-heading-sm text-heading-sm text-text-primary">
          {busy ? 'Reading your file…' : fileName ? fileName : 'Tap to choose a file, or drag & drop here'}
        </span>
        <span className="font-caption text-caption text-text-secondary mt-space-2xs">
          Desktop: drag & drop works. Mobile: tap to pick from your files.
        </span>
        <span className="font-caption text-caption text-text-tertiary mt-space-xs">
          Accepts .csv, .xlsx, .xls — up to 15 MB / 5,000 rows
        </span>
      </div>

      {error && (
        <div role="alert" className="rounded-xl bg-error-container text-on-error-container p-space-sm flex items-start gap-space-sm">
          <Icon name="error" className="text-[20px] shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-semibold">We couldn&apos;t read that file</span>
            <span className="font-caption text-caption mt-0.5 leading-relaxed">{error}</span>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-sm">
        <span className="font-label-md text-label-md text-text-primary font-semibold">Quick instructions</span>
        <ul className="flex flex-col gap-space-2xs font-caption text-caption text-text-secondary leading-relaxed">
          <li className="flex gap-space-2xs">
            <Icon name="check_circle" className="text-[15px] text-badge-discount-text shrink-0 mt-0.5" />
            <span>Row 1 must be your column headers (Product Name, Price, SKU…).</span>
          </li>
          <li className="flex gap-space-2xs">
            <Icon name="check_circle" className="text-[15px] text-badge-discount-text shrink-0 mt-0.5" />
            <span>Every row after that is one product. Prices can include ₦ and commas.</span>
          </li>
          <li className="flex gap-space-2xs">
            <Icon name="check_circle" className="text-[15px] text-badge-discount-text shrink-0 mt-0.5" />
            <span>Only Product Name and Selling Price are required — everything else is optional.</span>
          </li>
          <li className="flex gap-space-2xs">
            <Icon name="check_circle" className="text-[15px] text-badge-discount-text shrink-0 mt-0.5" />
            <span>Imported products are saved as drafts. Nothing goes live until you publish it.</span>
          </li>
        </ul>
        <div className="flex flex-wrap items-center gap-space-xs pt-space-2xs border-t border-border-subtle mt-space-2xs">
          <span className="font-caption text-caption text-text-secondary">Need a starting point?</span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              downloadCsvTemplate();
            }}
            className="inline-flex items-center gap-space-2xs px-space-xs py-1 rounded-lg bg-surface-container-lowest border border-border-subtle text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-tint-blue transition-colors"
          >
            <Icon name="table_chart" className="text-[15px]" />
            <span>CSV template</span>
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              downloadExcelTemplate();
            }}
            className="inline-flex items-center gap-space-2xs px-space-xs py-1 rounded-lg bg-surface-container-lowest border border-border-subtle text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-tint-blue transition-colors"
          >
            <Icon name="description" className="text-[15px]" />
            <span>Excel template</span>
          </button>
        </div>
      </div>

      {fileName && !isSupportedSpreadsheet(fileName) && (
        <span className="font-caption text-caption text-error">
          “.{fileExtension(fileName)}” files aren&apos;t supported — use CSV or Excel.
        </span>
      )}
    </div>
  );
}
