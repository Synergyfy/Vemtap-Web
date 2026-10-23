import { LoadingRows, ErrorState } from './QueryStates';
import { RadioCard, SaveBar, SettingsSection, SwitchRow, TextField } from './FormPrimitives';
import { Icon } from '../ui/Icon';
import {
  toNumber,
  usePosSettingsDraft,
  usePosSettingsQuery,
  useUpdatePosSettings,
} from '../../hooks/business/usePosSettingsApi';
import type { PosSettings } from '../../services/posSettingsService';

function TaxesForm({ settings }: { settings: PosSettings }) {
  const { draft, dirty, value, set, reset } = usePosSettingsDraft(settings);
  const save = useUpdatePosSettings();
  const inclusive = Boolean(value('pricesIncludeTax'));
  const maxOrder = value('maxQrOrderValue') ?? 0;

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg items-start">
        <SettingsSection title="Sales Tax" icon="account_balance">
          <SwitchRow
            title="Charge VAT"
            body="Apply VAT to POS tickets and guest orders"
            checked={Boolean(value('taxEnabled'))}
            onChange={(next) => set('taxEnabled', next)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
            <TextField
              id="tax-rate"
              label="VAT rate (%)"
              inputMode="decimal"
              value={String(value('taxRate') ?? 0)}
              onChange={(text) => set('taxRate', toNumber(text))}
            />
            <TextField
              id="tax-label"
              label="Tax label on receipts"
              value={value('taxLabel') ?? ''}
              onChange={(text) => set('taxLabel', text)}
            />
          </div>
          <div className="flex flex-col gap-space-xs" role="radiogroup" aria-label="Price application">
            <span className="font-label-sm text-label-sm text-text-secondary font-semibold">Price application</span>
            <RadioCard
              title="Tax added at checkout"
              body="Menu prices are net; tax is added on the subtotal"
              selected={!inclusive}
              onSelect={() => set('pricesIncludeTax', false)}
            />
            <RadioCard
              title="Prices include tax"
              body="Tax is already inside the menu prices"
              selected={inclusive}
              onSelect={() => set('pricesIncludeTax', true)}
            />
          </div>
          <SwitchRow
            title="Exempt takeaway orders from VAT"
            body="Zero-rate tickets marked takeaway"
            checked={Boolean(value('takeawayVatExempt'))}
            onChange={(next) => set('takeawayVatExempt', next)}
          />
          <TextField
            id="tax-tin"
            label="Tax Identification Number (TIN)"
            value={value('tin') ?? ''}
            onChange={(text) => set('tin', text)}
          />
        </SettingsSection>

        <div className="flex flex-col gap-space-lg">
          <SettingsSection title="Service & Packaging Surcharges" icon="room_service">
            <SwitchRow
              title="Service charge"
              body="Percentage added to dine-in and takeaway tickets"
              checked={Boolean(value('serviceChargeEnabled'))}
              onChange={(next) => set('serviceChargeEnabled', next)}
            />
            <TextField
              id="service-rate"
              label="Service charge rate (%)"
              inputMode="decimal"
              value={String(value('serviceChargeRate') ?? 0)}
              onChange={(text) => set('serviceChargeRate', toNumber(text))}
              disabled={!value('serviceChargeEnabled')}
            />
            <SwitchRow
              title="Allow cashiers to waive the service charge"
              checked={Boolean(value('serviceChargeWaivable'))}
              onChange={(next) => set('serviceChargeWaivable', next)}
              disabled={!value('serviceChargeEnabled')}
            />
            <TextField
              id="packaging-fee"
              label="Takeaway packaging fee (₦)"
              inputMode="decimal"
              value={String(value('packagingFee') ?? 0)}
              onChange={(text) => set('packagingFee', toNumber(text))}
            />
            <SwitchRow
              title="Apply the packaging fee automatically to takeaway tickets"
              checked={Boolean(value('packagingAutoApply'))}
              onChange={(next) => set('packagingAutoApply', next)}
            />
          </SettingsSection>

          <SettingsSection title="Public POS & Table QR Rules" icon="qr_code_2">
            <SwitchRow
              title="Enable guest self-ordering"
              body="Guests scan the table QR to order without logging in"
              checked={Boolean(value('selfOrderingEnabled'))}
              onChange={(next) => set('selfOrderingEnabled', next)}
            />
            <TextField
              id="max-qr-order"
              label="Max guest order value (₦)"
              inputMode="numeric"
              value={String(maxOrder)}
              onChange={(text) => set('maxQrOrderValue', toNumber(text))}
              hint={maxOrder ? undefined : '0 means no limit'}
            />
            <SwitchRow
              title="Pause QR orders (rush)"
              body="Temporarily refuse new guest orders while the kitchen catches up"
              checked={Boolean(value('rushPause'))}
              onChange={(next) => set('rushPause', next)}
            />
          </SettingsSection>
        </div>
      </div>

      <div className="flex items-start gap-space-xs rounded-xl bg-surface-tint-blue p-space-sm text-primary">
        <Icon name="info" className="text-[18px] mt-0.5" />
        <span className="font-caption text-caption">
          Changes apply to tickets rung up from now on. Existing receipts keep the charges they were sold with.
        </span>
      </div>

      <SaveBar
        label="Apply tax & surcharge rules"
        note="Only owners and managers can change these rules."
        dirty={dirty}
        saving={save.isPending}
        saved={save.isSuccess}
        error={save.isError ? (save.error instanceof Error ? save.error.message : 'Could not save the rules.') : null}
        onSave={() => save.mutate(draft, { onSuccess: reset })}
        onReset={reset}
      />
    </div>
  );
}

/** VAT, service and packaging surcharges, and the public QR ordering rules. */
export function TaxesPanel() {
  const settings = usePosSettingsQuery();
  if (settings.isLoading) return <LoadingRows label="Loading tax rules" />;
  if (settings.isError || !settings.data)
    return <ErrorState title="Could not load tax rules" error={settings.error} onRetry={() => settings.refetch()} />;
  return <TaxesForm settings={settings.data} />;
}
