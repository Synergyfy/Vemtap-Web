import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useBusinessBranch } from '../context/BusinessBranchContext';
import { useDealLedger } from '../hooks/business/useDealLedger';
import { claimsService } from '../services/claimsService';
import { hasApiConfig } from '../services/api/client';
import { offerKeys } from '../hooks/business/useOffers';
import { toAmount } from '../services/dealLedgerService';
import { formatNaira } from '../utils/format';
import { apiErrorMessage } from '../services/errorMessages';
import { Icon } from './ui/Icon';

interface DealClaimsLedgerProps {
  title?: string;
  limit?: number;
  branchId?: string | null;
  search?: string;
  allowRedeem?: boolean;
}

const statusLabel = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);

function activityLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
}

export function DealClaimsLedger({
  title = 'Deal claims',
  limit = 20,
  branchId,
  search = '',
  allowRedeem = false,
}: DealClaimsLedgerProps) {
  const { activeBranchId } = useBusinessBranch();
  const queryBranchId = branchId === undefined ? activeBranchId : branchId ?? undefined;
  const ledger = useDealLedger({ branchId: queryBranchId, limit });
  const queryClient = useQueryClient();
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const needle = search.trim().toLowerCase();
  const rows = (ledger.data?.data ?? []).filter((row) =>
    !needle || [row.claimCode, row.customerName, row.dealName].some((value) => value.toLowerCase().includes(needle)),
  );

  const redeem = async (id: string, code: string) => {
    setRedeemingId(id);
    setMessage(null);
    try {
      await claimsService.redeemVoucher(code);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['deal-ledger'] }),
        queryClient.invalidateQueries({ queryKey: offerKeys.all }),
      ]);
      setMessage({ kind: 'success', text: `Voucher ${code} redeemed.` });
    } catch (error) {
      setMessage({ kind: 'error', text: apiErrorMessage(error, 'Could not redeem this voucher.') });
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <section className="rounded-2xl bg-surface-canvas p-space-md shadow-sm border border-border-subtle">
      <div className="flex items-center justify-between gap-space-sm mb-space-sm">
        <h2 className="font-heading-sm text-heading-sm font-semibold text-on-surface">{title}</h2>
        <span className="font-caption text-caption text-text-secondary">
          {ledger.data?.total ?? ledger.data?.data.length ?? 0} vouchers
        </span>
      </div>
      {message && (
        <p
          role={message.kind === 'error' ? 'alert' : 'status'}
          className={`mb-space-sm rounded-lg px-space-sm py-space-xs font-caption text-caption ${
            message.kind === 'error' ? 'bg-error-container text-on-error-container' : 'bg-badge-discount-bg text-badge-discount-text'
          }`}
        >
          {message.text}
        </p>
      )}
      {ledger.isError && (
        <p role="alert" className="rounded-lg bg-error-container px-space-sm py-space-xs font-caption text-caption text-on-error-container">
          Could not load deal claims. Try again shortly.
        </p>
      )}
      {ledger.isLoading ? (
        <p className="py-space-sm font-body-sm text-body-sm text-text-secondary">Loading deal claims…</p>
      ) : !ledger.isError && rows.length === 0 ? (
        <p className="py-space-sm font-body-sm text-body-sm text-text-secondary">
          {needle ? 'No deal claims match your search.' : 'No deal claims yet.'}
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-border-subtle">
          {rows.map((row) => (
            <article key={row.id} className="flex flex-wrap items-center justify-between gap-space-sm py-space-sm first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">{row.dealName}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-caption text-caption font-semibold ${
                      row.status === 'redeemed'
                        ? 'bg-badge-discount-bg text-badge-discount-text'
                        : row.status === 'expired'
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-surface-container text-text-secondary'
                    }`}
                  >
                    {statusLabel(row.status)}
                  </span>
                </div>
                <p className="mt-1 font-caption text-caption text-text-secondary">
                  {row.customerName} · {row.claimCode} · {activityLabel(row.activityAt)}
                </p>
              </div>
              <div className="flex items-center gap-space-sm">
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  {formatNaira(toAmount(row.amount))}
                </span>
                {allowRedeem && hasApiConfig() && row.status === 'claimed' && (
                  <button
                    type="button"
                    disabled={redeemingId !== null}
                    onClick={() => void redeem(row.id, row.claimCode)}
                    className="inline-flex h-9 items-center gap-1 rounded-lg bg-primary px-space-sm font-label-sm text-label-sm font-semibold text-on-primary disabled:opacity-50"
                  >
                    <Icon name="verified" className="text-[16px]" />
                    {redeemingId === row.id ? 'Redeeming…' : 'Redeem'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
