import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiGet, hasApiConfig } from '../lib/api';

/**
 * Claim, gift and redemption records for the signed-in customer.
 *
 * The backend contract uses customer-scoped claim listing under `/me/claims`.
 * This frontend keeps a localStorage fallback for the app shell while the
 * backend payload shape is being wired up, so the UI remains stable without
 * sending requests to invalid routes.
 */

export type ClaimKind = 'self' | 'gift' | 'someone-else';

export interface ClaimParty {
  name: string;
  email: string;
  phone?: string;
}

export interface ClaimRecord {
  /** Human-shareable reference, e.g. `VT-48F261` or `VT-GIFT-83921`. */
  ref: string;
  kind: ClaimKind;
  dealTitle: string;
  dealBusiness: string;
  dealImage?: string;
  /** Voucher / redemption code shown to whoever redeems the deal. */
  code: string;
  /** `gift-sent` for gifts (not yet redeemed); `claimed` for redeemable passes. */
  status: 'claimed' | 'gift-sent';
  /**
   * Snapshot of the merchant terms that applied at the moment of claiming.
   * Frozen on the record so later edits to the live offer cannot rewrite an
   * agreement the customer already accepted.
   */
  terms?: string[];
  createdAt: number;
  /** Who receives / redeems the deal (undefined for a self claim). */
  recipient?: ClaimParty;
  /** Who initiated the claim. */
  sender?: ClaimParty;
}

export interface ClaimInput {
  kind: ClaimKind;
  dealTitle?: string;
  dealBusiness?: string;
  dealImage?: string;
  recipient?: ClaimParty;
  sender?: ClaimParty;
  /** Terms in force when the claim is made; snapshotted onto the record. */
  terms?: string[];
}

interface ClaimsContextValue {
  claims: ClaimRecord[];
  recordClaim: (input: ClaimInput) => ClaimRecord;
  byRef: (ref: string) => ClaimRecord | undefined;
  latestOf: (kind: ClaimKind) => ClaimRecord | undefined;
  removeClaim: (ref: string) => void;
}

const CLAIMS_KEY = 'vemtap_claims';

/** Generic default values used only when the backend does not return claim metadata. */
export const DEFAULT_CLAIMED_DEAL = {
  dealTitle: 'Live claim',
  dealBusiness: 'Partner merchant',
  dealImage: '',
  terms: ['Terms are provided by the merchant at the time the claim is created.'],
};

const readClaims = (): ClaimRecord[] => {
  if (!hasApiConfig()) return [];

  try {
    const raw = window.localStorage.getItem(CLAIMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is ClaimRecord =>
        Boolean(entry) && typeof entry.ref === 'string' && typeof entry.kind === 'string',
    );
  } catch {
    return [];
  }
};

const writeClaims = (claims: ClaimRecord[]) => {
  if (!hasApiConfig()) return;

  try {
    window.localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
  } catch {
    // storage unavailable; records stay in memory for this session only
  }
};

const randomChunk = (length: number) => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < length; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
};

const newRef = (kind: ClaimKind, existing: ClaimRecord[]) => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const ref =
      kind === 'gift'
        ? `VT-GIFT-${Math.floor(10000 + Math.random() * 89999)}`
        : `VT-${randomChunk(6)}`;
    if (!existing.some((claim) => claim.ref === ref)) return ref;
  }
  return `VT-${Date.now().toString(36).toUpperCase()}`;
};

const newCode = (existing: ClaimRecord[]) => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = `VT-${randomChunk(6)}`;
    if (!existing.some((claim) => claim.code === code)) return code;
  }
  return `VT-${Date.now().toString(36).toUpperCase()}`;
};

const ClaimsContext = createContext<ClaimsContextValue | null>(null);

export function ClaimsProvider({ children }: { children: ReactNode }) {
  const [claims, setClaims] = useState<ClaimRecord[]>(readClaims);

  useEffect(() => {
    if (!hasApiConfig()) return;

    let ignore = false;

    const hydrate = async () => {
      try {
        const remoteClaims = await apiGet<ClaimRecord[]>('/me/claims');
        if (!ignore && Array.isArray(remoteClaims)) {
          setClaims(remoteClaims);
          writeClaims(remoteClaims);
        }
      } catch {
        // Fail silently so the local fallback remains available while the API is unavailable.
      }
    };

    void hydrate();
    return () => {
      ignore = true;
    };
  }, []);

  const recordClaim = useCallback(
    (input: ClaimInput): ClaimRecord => {
      const record: ClaimRecord = {
        ref: newRef(input.kind, claims),
        kind: input.kind,
        dealTitle: input.dealTitle ?? 'Live claim',
        dealBusiness: input.dealBusiness ?? 'Partner merchant',
        dealImage: input.dealImage,
        terms: input.terms,
        code: newCode(claims),
        status: input.kind === 'gift' ? 'gift-sent' : 'claimed',
        createdAt: Date.now(),
        recipient: input.recipient,
        sender: input.sender,
      };

      if (!hasApiConfig()) {
        return record;
      }

      setClaims((current) => {
        if (current.some((claim) => claim.ref === record.ref)) return current;
        const next = [record, ...current].slice(0, 40);
        writeClaims(next);
        return next;
      });

      return record;
    },
    [claims],
  );

  const byRef = useCallback(
    (ref: string) => {
      const needle = ref.trim().toUpperCase().replace(/^#/, '');
      return claims.find((claim) => claim.ref.toUpperCase().replace(/^#/, '') === needle);
    },
    [claims],
  );

  const latestOf = useCallback(
    (kind: ClaimKind) => claims.find((claim) => claim.kind === kind),
    [claims],
  );

  const removeClaim = useCallback((ref: string) => {
    setClaims((current) => {
      const next = current.filter((claim) => claim.ref !== ref);
      writeClaims(next);
      return next;
    });
  }, []);

  const value = useMemo<ClaimsContextValue>(
    () => ({ claims, recordClaim, byRef, latestOf, removeClaim }),
    [claims, recordClaim, byRef, latestOf, removeClaim],
  );

  return <ClaimsContext.Provider value={value}>{children}</ClaimsContext.Provider>;
}

export function useClaims(): ClaimsContextValue {
  const ctx = useContext(ClaimsContext);
  if (!ctx) throw new Error('useClaims must be used within a ClaimsProvider');
  return ctx;
}
