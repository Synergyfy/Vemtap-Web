import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiGet, apiPost, hasApiConfig } from '../lib/api';
import { claimsService } from '../services/claimsService';

/**
 * Claim, gift and redemption records for the signed-in customer.
 *
 * The source of truth is the backend `/me/claims` listing, while the app also
 * keeps the latest claim set in the browser for quick in-session rendering.
 */

export type ClaimKind = 'self' | 'gift' | 'someone-else';

export interface ClaimParty {
  name: string;
  email: string;
  phone?: string;
}

export interface ClaimRecord {
  /** Backend claim id when available; used for QR and delete calls. */
  id?: string;
  /** Human-shareable reference, e.g. `VT-48F261` or `VT-GIFT-83921`. */
  ref: string;
  kind: ClaimKind;
  dealTitle: string;
  dealBusiness: string;
  dealImage?: string;
  dealLocation?: string;
  dealPrice?: number;
  dealOldPrice?: number;
  discountLabel?: string;
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
  id?: string;
  kind: ClaimKind;
  offerId?: string;
  dealTitle?: string;
  dealBusiness?: string;
  dealImage?: string;
  dealLocation?: string;
  dealPrice?: number;
  dealOldPrice?: number;
  discountLabel?: string;
  recipient?: ClaimParty;
  sender?: ClaimParty;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  code?: string;
  giftToken?: string;
  /** Terms in force when the claim is made; snapshotted onto the record. */
  terms?: string[];
}

interface ClaimsContextValue {
  claims: ClaimRecord[];
  recordClaim: (input: ClaimInput) => ClaimRecord;
  byRef: (ref: string) => ClaimRecord | undefined;
  latestOf: (kind: ClaimKind) => ClaimRecord | undefined;
  removeClaim: (ref: string) => void;
  getGift: (token: string) => Promise<unknown>;
  rejectGift: (token: string, reason?: string) => Promise<unknown>;
  getClaimQr: (id: string) => Promise<unknown>;
  deleteClaim: (id: string) => Promise<unknown>;
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

const normalizeClaimList = (payload: unknown): ClaimRecord[] => {
  const asArray = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown[] } | null)?.data)
      ? (payload as { data: unknown[] }).data
      : [];

  const normalized: ClaimRecord[] = [];

  for (const entry of asArray) {
    if (!entry || typeof entry !== 'object') continue;

    const item = entry as Record<string, unknown>;
    const offer = item.offer && typeof item.offer === 'object' ? (item.offer as Record<string, unknown>) : {};
    const businessName =
      typeof item.businessName === 'string' && item.businessName.trim()
        ? item.businessName.trim()
        : typeof offer.businessName === 'string' && offer.businessName.trim()
          ? offer.businessName.trim()
          : typeof offer.business === 'object' && offer.business && typeof (offer.business as Record<string, unknown>).name === 'string'
            ? ((offer.business as Record<string, unknown>).name as string).trim()
            : 'Partner merchant';

    const dealTitle =
      typeof item.dealTitle === 'string' && item.dealTitle.trim()
        ? item.dealTitle.trim()
        : typeof item.title === 'string' && item.title.trim()
          ? item.title.trim()
          : typeof offer.title === 'string' && offer.title.trim()
            ? offer.title.trim()
            : typeof offer.name === 'string' && offer.name.trim()
              ? offer.name.trim()
              : 'Live claim';

    const claimKind: ClaimKind = item.kind === 'gift' || item.kind === 'someone-else' ? item.kind : 'self';
    const claimId =
      typeof item.id === 'string' && item.id.trim()
        ? item.id.trim()
        : typeof item.claimId === 'string' && item.claimId.trim()
          ? item.claimId.trim()
          : undefined;
    const normalizedRef =
      typeof item.ref === 'string' && item.ref.trim()
        ? item.ref.trim()
        : claimId ?? `VT-${Date.now().toString(36).toUpperCase()}`;

    const claimRecord: ClaimRecord = {
      id: claimId,
      ref: normalizedRef,
      kind: claimKind,
      dealTitle,
      dealBusiness: businessName,
      dealImage: typeof item.dealImage === 'string' ? item.dealImage : typeof offer.image === 'string' ? offer.image : undefined,
      code: typeof item.code === 'string' && item.code.trim() ? item.code.trim() : typeof item.claimCode === 'string' ? item.claimCode.trim() : newCode([]),
      status: item.status === 'gift-sent' || item.status === 'gift' ? 'gift-sent' : 'claimed',
      terms: Array.isArray(item.terms) ? item.terms.filter((value): value is string => typeof value === 'string') : undefined,
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
      recipient:
        item.recipient && typeof item.recipient === 'object'
          ? {
              name: typeof (item.recipient as Record<string, unknown>).name === 'string' ? (item.recipient as Record<string, unknown>).name as string : '',
              email: typeof (item.recipient as Record<string, unknown>).email === 'string' ? (item.recipient as Record<string, unknown>).email as string : '',
              phone: typeof (item.recipient as Record<string, unknown>).phone === 'string' ? (item.recipient as Record<string, unknown>).phone as string : undefined,
            }
          : undefined,
      sender:
        item.sender && typeof item.sender === 'object'
          ? {
              name: typeof (item.sender as Record<string, unknown>).name === 'string' ? (item.sender as Record<string, unknown>).name as string : '',
              email: typeof (item.sender as Record<string, unknown>).email === 'string' ? (item.sender as Record<string, unknown>).email as string : '',
              phone: typeof (item.sender as Record<string, unknown>).phone === 'string' ? (item.sender as Record<string, unknown>).phone as string : undefined,
            }
          : undefined,
    };

    normalized.push(claimRecord);
  }

  return normalized;
};

const ClaimsContext = createContext<ClaimsContextValue | null>(null);

export function ClaimsProvider({ children }: { children: ReactNode }) {
  const [claims, setClaims] = useState<ClaimRecord[]>(readClaims);

  useEffect(() => {
    if (!hasApiConfig()) return;

    let ignore = false;

    const hydrate = async () => {
      try {
        const [claimsResult, giftsResult] = await Promise.allSettled([
          apiGet<unknown>('/me/claims'),
          apiGet<unknown>('/me/gifts'),
        ]);

        if (ignore) return;

        const hydratedClaims = [
          ...(claimsResult.status === 'fulfilled' ? normalizeClaimList(claimsResult.value) : []),
          ...(giftsResult.status === 'fulfilled' ? normalizeClaimList(giftsResult.value) : []),
        ];

        const dedupedClaims = hydratedClaims.filter(
          (claim, index, source) => source.findIndex((candidate) => candidate.ref === claim.ref) === index,
        );

        setClaims(dedupedClaims);
        writeClaims(dedupedClaims);
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
        id: input.id,
        ref: newRef(input.kind, claims),
        kind: input.kind,
        dealTitle: input.dealTitle ?? 'Live claim',
        dealBusiness: input.dealBusiness ?? 'Partner merchant',
        dealImage: input.dealImage,
        dealLocation: input.dealLocation,
        dealPrice: input.dealPrice,
        dealOldPrice: input.dealOldPrice,
        discountLabel: input.discountLabel,
        terms: input.terms,
        code: input.code ?? newCode(claims),
        status: input.kind === 'gift' ? 'gift-sent' : 'claimed',
        createdAt: Date.now(),
        recipient: input.recipient,
        sender: input.sender,
      };

      if (hasApiConfig() && input.offerId) {
        const payload = {
          offerId: input.offerId,
          firstName: input.firstName ?? input.sender?.name?.split(' ')[0] ?? 'Customer',
          lastName: input.lastName ?? input.sender?.name?.split(' ').slice(1).join(' ') ?? '',
          email: input.email ?? input.sender?.email ?? '',
          phone: input.phone ?? input.sender?.phone ?? '',
          code: input.code,
          giftToken: input.giftToken,
        };

        if (input.kind === 'gift') {
          void apiPost<{ message?: string; data?: Record<string, unknown> }>('/catalogue/offers/claim/gift', {
            offerId: input.offerId,
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            phone: payload.phone,
            recipientName: input.recipient?.name,
            recipientEmail: input.recipient?.email,
            recipientPhone: input.recipient?.phone,
          }).catch(() => undefined);
        } else if (!input.code) {
          void apiPost<{ message?: string; data?: Record<string, unknown> }>('/catalogue/offers/claim/request', payload)
            .catch(() => undefined);
        } else {
          void apiPost<{ message?: string; data?: Record<string, unknown> }>('/catalogue/offers/claim/verify', payload)
            .catch(() => undefined);
        }
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
      const target = current.find((claim) => claim.ref === ref);
      const targetId = target?.id ?? target?.ref;
      if (hasApiConfig() && targetId) {
        void claimsService.deleteClaim(targetId).catch(() => undefined);
      }

      const next = current.filter((claim) => claim.ref !== ref);
      writeClaims(next);
      return next;
    });
  }, []);

  const getGift = useCallback((token: string) => claimsService.getGift(token), []);
  const rejectGift = useCallback((token: string, reason?: string) => claimsService.rejectGift(token, reason), []);
  const getClaimQr = useCallback((id: string) => claimsService.getClaimQr(id), []);
  const deleteClaim = useCallback(async (id: string) => {
    try {
      const deleted = await claimsService.deleteClaim(id);
      setClaims((current) => {
        const next = current.filter((claim) => claim.id !== id && claim.ref !== id);
        writeClaims(next);
        return next;
      });
      return deleted;
    } catch (error) {
      throw error;
    }
  }, []);

  const value = useMemo<ClaimsContextValue>(
    () => ({ claims, recordClaim, byRef, latestOf, removeClaim, getGift, rejectGift, getClaimQr, deleteClaim }),
    [claims, recordClaim, byRef, latestOf, removeClaim, getGift, rejectGift, getClaimQr, deleteClaim],
  );

  return <ClaimsContext.Provider value={value}>{children}</ClaimsContext.Provider>;
}

export function useClaims(): ClaimsContextValue {
  const ctx = useContext(ClaimsContext);
  if (!ctx) throw new Error('useClaims must be used within a ClaimsProvider');
  return ctx;
}
