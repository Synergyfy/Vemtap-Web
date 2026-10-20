import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { posSettingsService, type PosSettings, type PosSettingsUpdate } from '../../services/posSettingsService';
import { usePosSettings } from '../../context/PosSettingsContext';

export const posSettingsKeys = { all: ['pos-settings'] as const };

export function usePosSettingsQuery() {
  return useQuery({ queryKey: posSettingsKeys.all, queryFn: posSettingsService.get });
}

/**
 * Saves a partial update and mirrors the receipt/tax fields into the local
 * POS context, so the register and receipts pick the change up immediately.
 */
export function useUpdatePosSettings() {
  const queryClient = useQueryClient();
  const pos = usePosSettings();
  return useMutation({
    mutationFn: (body: PosSettingsUpdate) => posSettingsService.update(body),
    onSuccess: (saved) => {
      queryClient.setQueryData(posSettingsKeys.all, saved);
      if (typeof saved.taxEnabled === 'boolean') pos.setTaxEnabled(saved.taxEnabled);
      if (typeof saved.taxRate === 'number') pos.setTaxRate(saved.taxRate);
      if (saved.taxLabel) pos.setTaxLabel(saved.taxLabel);
      if (typeof saved.pricesIncludeTax === 'boolean') pos.setPricesIncludeTax(saved.pricesIncludeTax);
      if (typeof saved.receiptHeader === 'string') pos.setReceiptHeader(saved.receiptHeader);
      if (typeof saved.receiptFooter === 'string') pos.setReceiptFooter(saved.receiptFooter);
      if (typeof saved.autoPrintReceipt === 'boolean') pos.setAutoPrintReceipt(saved.autoPrintReceipt);
      if (typeof saved.showLogo === 'boolean') pos.setShowBusinessLogo(saved.showLogo);
    },
  });
}

/**
 * Local edits over saved settings. `value(key)` reads the edit if any, else
 * the saved value; `draft` holds only touched fields, so a save never
 * overwrites settings the screen did not show.
 */
export function usePosSettingsDraft(settings: PosSettings) {
  const [draft, setDraft] = useState<PosSettingsUpdate>({});
  const value = useCallback(
    <K extends keyof PosSettings>(key: K): PosSettings[K] => (key in draft ? draft[key] : settings[key]) as PosSettings[K],
    [draft, settings],
  );
  const set = useCallback(
    <K extends keyof PosSettings>(key: K, next: PosSettings[K]) => setDraft((current) => ({ ...current, [key]: next })),
    [],
  );
  return { draft, dirty: Object.keys(draft).length > 0, value, set, reset: () => setDraft({}) };
}

export const toNumber = (text: string) => {
  const parsed = Number.parseFloat(text);
  return Number.isFinite(parsed) ? parsed : 0;
};
