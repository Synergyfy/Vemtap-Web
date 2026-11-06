import { useEffect, useState } from 'react';
import { Icon } from './ui/Icon';
import { useBusinessBranch } from '../context/BusinessBranchContext';
import { useBusinessCustomers } from '../hooks/business/useBusinessCustomers';
import { useLoyaltyMutations } from '../hooks/business/useLoyalty';
import type { CustomerCard } from '../services/businessCustomersService';
import { apiErrorMessage } from '../services/errorMessages';

const REASONS = ['Counter Purchase', 'Customer Goodwill', 'Service Recovery', 'Special Promotion'];
const QUICK_POINTS = [50, 100, 250, 500];

const customerName = (customer: CustomerCard) => customer.name || customer.phone || customer.email || 'Customer';

function GivePointsBody({ onClose, onGiven }: { onClose: () => void; onGiven: (message: string) => void }) {
  const { activeBranchId } = useBusinessBranch();
  const { givePoints } = useLoyaltyMutations();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [customer, setCustomer] = useState<CustomerCard | null>(null);
  const [points, setPoints] = useState('100');
  const [reason, setReason] = useState(REASONS[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(input.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [input]);

  const customers = useBusinessCustomers({ search: search || undefined, sort: 'recent', page: 1, limit: 20 });
  const amount = Number(points);
  const valid = Number.isInteger(amount) && amount > 0;

  const give = () => {
    if (!customer || !valid || !activeBranchId) return;
    setError(null);
    givePoints.mutate(
      { customerId: customer.userId, branchId: activeBranchId, points: amount, reason },
      {
        onSuccess: () => {
          onGiven(`${amount.toLocaleString('en-US')} points given to ${customerName(customer)}`);
          onClose();
        },
        onError: (failure) => setError(apiErrorMessage(failure, "Those points couldn't be given. Please try again.")),
      },
    );
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Give Points" className="w-full max-w-[460px] max-h-[92vh] bg-surface-canvas rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-space-sm px-space-md py-space-sm bg-surface-container-low shrink-0">
        <div className="min-w-0">
          <h2 className="font-label-md text-label-md font-semibold text-on-surface">Give Points</h2>
          <p className="font-caption text-caption text-text-secondary truncate">{customer ? customerName(customer) : 'Choose a customer'}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container active:scale-95 transition-all">
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      <div className="p-space-md overflow-y-auto flex flex-col gap-space-sm">
        {!customer ? (
          <>
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary" />
              <input
                type="search"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Search name, phone or email"
                aria-label="Search customers"
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-text-tertiary outline-none"
              />
            </div>
            {customers.isError && <p className="font-caption text-caption text-error text-center">Couldn't load customers. Try again shortly.</p>}
            {customers.isLoading && <p className="font-caption text-caption text-text-secondary text-center py-space-sm">Loading customers…</p>}
            {customers.data && !customers.data.data.length && (
              <p className="font-caption text-caption text-text-secondary text-center py-space-sm">{search ? 'No customers match that search.' : 'No customers yet.'}</p>
            )}
            <div className="flex flex-col gap-space-2xs">
              {(customers.data?.data ?? []).map((row) => (
                <button
                  key={row.userId}
                  type="button"
                  onClick={() => setCustomer(row)}
                  className="w-full px-space-sm py-space-xs rounded-xl bg-surface-container-low flex items-center justify-between gap-space-sm text-left active:scale-[0.99] transition-transform"
                >
                  <span className="min-w-0">
                    <span className="block font-label-md text-label-md font-semibold text-on-surface truncate">{customerName(row)}</span>
                    <span className="block font-caption text-caption text-text-secondary truncate">{row.phone || row.email || 'No contact details'}</span>
                  </span>
                  <span className="font-caption text-caption font-semibold text-primary shrink-0">{(row.pointsBalance ?? 0).toLocaleString('en-US')} pts</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setCustomer(null)} className="self-start inline-flex items-center gap-1 font-label-md text-label-md text-primary">
              <Icon name="arrow_back" className="text-[16px]" />
              <span>Choose another customer</span>
            </button>
            <label className="flex flex-col gap-space-2xs">
              <span className="font-label-md text-label-md text-text-secondary">Points</span>
              <input
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={points}
                onChange={(event) => setPoints(event.target.value)}
                className="w-full h-10 px-space-sm rounded-xl bg-surface-container-low font-body-md text-body-md text-on-surface outline-none"
              />
            </label>
            <div className="grid grid-cols-4 gap-space-2xs">
              {QUICK_POINTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPoints(String(value))}
                  className={`h-9 rounded-lg font-label-md text-label-md ${amount === value ? 'bg-surface-tint-blue text-primary' : 'bg-surface-container-low text-text-secondary'}`}
                >
                  {value}
                </button>
              ))}
            </div>
            <label className="flex flex-col gap-space-2xs">
              <span className="font-label-md text-label-md text-text-secondary">Reason</span>
              <select
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="w-full h-10 px-space-sm rounded-xl bg-surface-container-low font-body-md text-body-md text-on-surface outline-none"
              >
                {REASONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            {error && <p className="font-caption text-caption text-error text-center" role="alert">{error}</p>}
            {!activeBranchId && <p className="font-caption text-caption text-error text-center">Choose a branch first.</p>}
            <button
              type="button"
              disabled={!valid || !activeBranchId || givePoints.isPending}
              onClick={give}
              className="w-full h-11 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold disabled:opacity-50 active:scale-[0.99] transition-all"
            >
              {givePoints.isPending ? 'Giving Points…' : `Give ${valid ? amount.toLocaleString('en-US') : ''} Points`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** Lets the counter give a customer points by hand, on desktop and mobile. */
export function GivePointsModal({ open, onClose, onGiven }: { open: boolean; onClose: () => void; onGiven: (message: string) => void }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-space-sm bg-scrim/70"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <GivePointsBody onClose={onClose} onGiven={onGiven} />
    </div>
  );
}
