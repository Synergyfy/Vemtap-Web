import { LoadingRows, ErrorState } from './QueryStates';
import { SaveBar, SettingsSection, SwitchRow, TextField } from './FormPrimitives';
import { usePosSettingsDraft, usePosSettingsQuery, useUpdatePosSettings } from '../../hooks/business/usePosSettingsApi';
import type { PosSettings } from '../../services/posSettingsService';
import { formatNaira } from '../../utils/format';
import { hasApiConfig } from '../../services/api/client';
import { useCatalogueItems } from '../../hooks/business/useCatalogueItems';

const PAPER_WIDTHS = [58, 80] as const;

const PRINT_TRIGGERS = [
  { key: 'sale', label: 'After every sale' },
  { key: 'refund', label: 'After a refund' },
  { key: 'kitchen', label: 'Kitchen ticket for new orders' },
] as const;

const SAMPLE_LINES = [
  { name: 'Woodfire Ribeye', qty: 1, price: 14500 },
  { name: 'Jollof Rice', qty: 2, price: 3500 },
  { name: 'Chapman', qty: 2, price: 1800 },
];

const PREVIEW_QTYS = [1, 2, 1];

/** Preview lines: the branch's first priced products in live mode, sample lines in the demo. */
function usePreviewLines() {
  const items = useCatalogueItems('product');
  if (!hasApiConfig()) return SAMPLE_LINES;
  const priced = (items.data ?? [])
    .filter((item) => item.status === 'active' && Number(item.price) > 0)
    .slice(0, 3)
    .map((item, index) => ({ name: item.name, qty: PREVIEW_QTYS[index], price: Number(item.price) }));
  return priced.length ? priced : [{ name: 'Your product', qty: 1, price: 5000 }];
}

function ReceiptPreview({ settings }: { settings: PosSettings }) {
  const lines = usePreviewLines();
  const subtotal = lines.reduce((sum, line) => sum + line.qty * line.price, 0);
  const rate = settings.taxEnabled ? settings.taxRate ?? 0 : 0;
  const tax = settings.pricesIncludeTax ? 0 : Math.round((subtotal * rate) / 100);
  const narrow = settings.receiptWidth === 58;

  return (
    <div className="rounded-xl bg-surface-container-low p-space-md flex justify-center">
      <div
        className={`bg-white text-neutral-900 shadow-md px-space-md py-space-lg font-mono text-[12px] leading-5 flex flex-col gap-1 ${
          narrow ? 'w-[220px]' : 'w-[300px]'
        }`}
        aria-label="Receipt preview"
      >
        {settings.showLogo ? (
          <div className="mx-auto mb-1 w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold">
            V
          </div>
        ) : null}
        {settings.receiptHeader ? <p className="text-center font-semibold">{settings.receiptHeader}</p> : null}
        {settings.receiptAddress ? <p className="text-center text-neutral-600">{settings.receiptAddress}</p> : null}
        {settings.receiptPhone ? <p className="text-center text-neutral-600">{settings.receiptPhone}</p> : null}
        {settings.tin ? <p className="text-center text-neutral-600">TIN {settings.tin}</p> : null}
        <div className="border-t border-dashed border-neutral-400 my-2" />
        {lines.map((line) => (
          <div key={line.name} className="flex justify-between gap-2">
            <span className="truncate">
              {line.qty}× {line.name}
            </span>
            <span>{formatNaira(line.qty * line.price)}</span>
          </div>
        ))}
        <div className="border-t border-dashed border-neutral-400 my-2" />
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatNaira(subtotal)}</span>
        </div>
        {rate ? (
          <div className="flex justify-between">
            <span>
              {settings.taxLabel || 'VAT'} {rate}%{settings.pricesIncludeTax ? ' (incl.)' : ''}
            </span>
            <span>{settings.pricesIncludeTax ? 'incl.' : formatNaira(tax)}</span>
          </div>
        ) : null}
        <div className="flex justify-between font-bold text-[14px] mt-1">
          <span>TOTAL</span>
          <span>{formatNaira(subtotal + tax)}</span>
        </div>
        <div className="border-t border-dashed border-neutral-400 my-2" />
        {settings.receiptFooter ? <p className="text-center text-neutral-600">{settings.receiptFooter}</p> : null}
        <p className="text-center text-[10px] tracking-widest text-neutral-500 mt-2">POWERED BY VEMTAP</p>
      </div>
    </div>
  );
}

function ReceiptForm({ settings }: { settings: PosSettings }) {
  const { draft, dirty, value, set, reset } = usePosSettingsDraft(settings);
  const save = useUpdatePosSettings();
  const triggers = value('autoPrintOn') ?? [];
  const merged: PosSettings = { ...settings, ...draft };

  const toggleTrigger = (key: string) =>
    set('autoPrintOn', triggers.includes(key) ? triggers.filter((t) => t !== key) : [...triggers, key]);

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-space-lg items-start">
        <div className="flex flex-col gap-space-lg min-w-0">
          <SettingsSection title="Receipt Content" icon="receipt_long">
            <TextField id="receipt-header" label="Header line" value={value('receiptHeader') ?? ''} onChange={(t) => set('receiptHeader', t)} />
            <TextField id="receipt-address" label="Address on receipt" value={value('receiptAddress') ?? ''} onChange={(t) => set('receiptAddress', t)} />
            <TextField id="receipt-phone" label="Phone on receipt" type="tel" value={value('receiptPhone') ?? ''} onChange={(t) => set('receiptPhone', t)} />
            <TextField id="receipt-footer" label="Footer message" value={value('receiptFooter') ?? ''} onChange={(t) => set('receiptFooter', t)} />
            <SwitchRow title="Show business logo" checked={Boolean(value('showLogo'))} onChange={(next) => set('showLogo', next)} />
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm text-text-secondary font-semibold">Paper width</span>
              <div className="grid grid-cols-2 gap-space-xs" role="radiogroup" aria-label="Paper width">
                {PAPER_WIDTHS.map((width) => {
                  const selected = (value('receiptWidth') ?? 80) === width;
                  return (
                    <button
                      key={width}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => set('receiptWidth', width)}
                      className={`h-10 rounded-lg font-label-md text-label-md border ${
                        selected ? 'bg-surface-tint-blue border-primary/40 text-primary font-semibold' : 'bg-surface-subtle border-transparent text-text-secondary'
                      }`}
                    >
                      {width}mm
                    </button>
                  );
                })}
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Print Triggers" icon="print">
            <SwitchRow
              title="Print automatically"
              checked={Boolean(value('autoPrintReceipt'))}
              onChange={(next) => set('autoPrintReceipt', next)}
            />
            {PRINT_TRIGGERS.map((trigger) => (
              <SwitchRow
                key={trigger.key}
                title={trigger.label}
                checked={triggers.includes(trigger.key)}
                onChange={() => toggleTrigger(trigger.key)}
                disabled={!value('autoPrintReceipt')}
              />
            ))}
            <SwitchRow
              title="Print kitchen chits per station"
              checked={Boolean(value('printKitchenChits'))}
              onChange={(next) => set('printKitchenChits', next)}
            />
          </SettingsSection>
        </div>

        <div className="lg:sticky lg:top-24 flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">Receipt preview</span>
          <ReceiptPreview settings={merged} />
        </div>
      </div>

      <SaveBar
        label="Save receipt settings"
        dirty={dirty}
        saving={save.isPending}
        saved={save.isSuccess}
        error={save.isError ? (save.error instanceof Error ? save.error.message : 'Could not save receipt settings.') : null}
        onSave={() => save.mutate(draft, { onSuccess: reset })}
        onReset={reset}
      />
    </div>
  );
}

/** POS receipt content, paper width and print triggers, with a live preview. */
export function ReceiptPanel() {
  const settings = usePosSettingsQuery();
  if (settings.isLoading) return <LoadingRows label="Loading receipt settings" />;
  if (settings.isError || !settings.data)
    return <ErrorState title="Could not load receipt settings" error={settings.error} onRetry={() => settings.refetch()} />;
  return <ReceiptForm settings={settings.data} />;
}
