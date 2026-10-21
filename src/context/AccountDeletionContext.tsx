import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { hasApiConfig } from '../lib/api';
import { accountService } from '../services/accountService';
import { apiErrorMessage } from '../services/errorMessages';

const REQUEST_KEY = 'vemtap_account_deletion_request';

export type DeletionStatus = 'submitted' | 'processing' | 'completed' | 'failed';

/** Optional exit reasons (BUG-019 step 2). The reason never blocks deletion. */
export const DELETION_REASONS: { id: string; label: string }[] = [
  { id: 'no-longer-use', label: 'I no longer use VEMTAP.' },
  { id: 'could-not-find', label: 'I could not find what I needed.' },
  { id: 'problem', label: 'I experienced a problem.' },
  { id: 'privacy', label: 'I have privacy concerns.' },
  { id: 'another-account', label: 'I created another account.' },
  { id: 'other', label: 'Other.' },
];

export interface DeletionRequest {
  id: string;
  reasonId?: string;
  feedback?: string;
  status: DeletionStatus;
  submittedAt: number;
  completedAt?: number;
  /** Only set when the backend rejected/failed the request. */
  error?: string;
  /** Records kept under legal retention obligations after purge. */
  retainedNote?: string;
}

export type SubmitDeletionResult = { ok: true; request: DeletionRequest } | { ok: false; error: string };

export interface AccountDeletionContextValue {
  /** The most recent request, if any. */
  request: DeletionRequest | null;
  /**
   * Submit the deletion request to the backend (simulated without an API).
   * Resolves with the final request — `status` is only `completed`
   * when the backend confirms the purge; failures surface as `failed`.
   */
  submitRequest: (input: { reasonId?: string; feedback?: string }) => Promise<SubmitDeletionResult>;
  clearRequest: () => void;
}

const AccountDeletionContext = createContext<AccountDeletionContextValue | null>(null);

function readRequest(): DeletionRequest | null {
  try {
    const raw = localStorage.getItem(REQUEST_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return (parsed as DeletionRequest) ?? null;
  } catch {
    return null;
  }
}

const RETAINED_NOTE =
  'Receipts and transaction records are retained for 24 months where legally required, then anonymised. Everything else is purged within 30 days.';

function delay(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export function AccountDeletionProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<DeletionRequest | null>(() => readRequest());

  useEffect(() => {
    try {
      if (request) localStorage.setItem(REQUEST_KEY, JSON.stringify(request));
      else localStorage.removeItem(REQUEST_KEY);
    } catch {
      /* storage unavailable — keep in memory */
    }
  }, [request]);

  const submitRequest = useCallback(async (input: { reasonId?: string; feedback?: string }) => {
    const id = `DEL-${Date.now().toString(36).toUpperCase()}`;
    const submitted: DeletionRequest = {
      id,
      reasonId: input.reasonId,
      feedback: input.feedback,
      status: 'submitted',
      submittedAt: Date.now(),
    };
    setRequest(submitted);

    if (hasApiConfig()) {
      try {
        const response = await accountService.deleteAccount(input);
        const completed: DeletionRequest = {
          ...submitted,
          id: response.id,
          status: 'completed',
          submittedAt: Date.parse(response.submittedAt),
          completedAt: Date.parse(response.completedAt),
          retainedNote: response.retainedNote,
        };
        setRequest(completed);
        return { ok: true, request: completed } as SubmitDeletionResult;
      } catch (error) {
        const failed: DeletionRequest = {
          ...submitted,
          status: 'failed',
          error: apiErrorMessage(error, 'The deletion request could not be processed. Please try again or contact support.'),
        };
        setRequest(failed);
        return { ok: false, error: failed.error ?? 'Request failed.' } as SubmitDeletionResult;
      }
    }

    // Demo build (no API): simulate the request.
    await delay(900);

    const processing: DeletionRequest = { ...submitted, status: 'processing' };
    setRequest(processing);
    await delay(1200);

    // Simulated backend outcome. A real deployment replaces this block with
    // the API response — only a successful response may set `completed`.
    const backendOk = true;
    if (!backendOk) {
      const failed: DeletionRequest = {
        ...processing,
        status: 'failed',
        error: 'The deletion request could not be processed. Please try again or contact support.',
      };
      setRequest(failed);
      return { ok: false, error: failed.error ?? 'Request failed.' } as SubmitDeletionResult;
    }

    const completed: DeletionRequest = {
      ...processing,
      status: 'completed',
      completedAt: Date.now(),
      retainedNote: RETAINED_NOTE,
    };
    setRequest(completed);
    return { ok: true, request: completed } as SubmitDeletionResult;
  }, []);

  const clearRequest = useCallback(() => setRequest(null), []);

  return (
    <AccountDeletionContext.Provider value={{ request, submitRequest, clearRequest }}>
      {children}
    </AccountDeletionContext.Provider>
  );
}

export function useAccountDeletion(): AccountDeletionContextValue {
  const value = useContext(AccountDeletionContext);
  if (!value) throw new Error('useAccountDeletion must be used within AccountDeletionProvider');
  return value;
}
