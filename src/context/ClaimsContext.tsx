import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiGet, apiPost, hasApiConfig } from '../lib/api';
import { claimsService } from '../services/claimsService';
import { useSessionUser } from '../hooks/useSessionUser';

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
  /** The deal this voucher belongs to. */
  offerId?: string;
  dealTitle: string;
  dealBusiness: string;
  dealImage?: string;
  dealDescription?: string;
  /** What the voucher covers, from the claim itself so it survives the deal ending. */
  dealItems?: { id: string; name: string }[];
  /** The business's public code, for opening its page. */
  businessCode?: string;
  businessVerified?: boolean;
  /** The branch that honours the voucher; opens the customer's chat with it. */
  branchId?: string;
  dealLocation?: string;
  dealPrice?: number;
  dealOldPrice?: number;
  discountLabel?: string;
  /** Voucher / redemption code shown to whoever redeems the deal. */
  code: string;
  /** `gift-sent` for gifts (not yet redeemed); `claimed` for redeemable passes. */
  status: 'claimed' | 'gift-sent';
  /** Made for someone else: they hold the voucher, this account only follows it. */
  sentForOther?: boolean;
  /** What the API says about the voucher now. */
  state?: 'ACTIVE' | 'REDEEMED' | 'EXPIRED';
  /** When the voucher stops being redeemable. */
  expiresAt?: number;
  dealPhone?: string;
  dealLatitude?: number;
  dealLongitude?: number;
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
  dealPhone?: string;
  branchId?: string;
  dealLatitude?: number;
  dealLongitude?: number;
  recipient?: ClaimParty;
  sender?: ClaimParty;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  code?: string;
  giftToken?: string;
  /** The sender's message on a gift. */
  note?: string;
  /** Terms in force when the claim is made; snapshotted onto the record. */
  terms?: string[];
}

/** Who the emailed claim code goes to; the voucher is issued to this person. */
export interface ClaimHolder {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
}

interface ClaimsContextValue {
  claims: ClaimRecord[];
  /** True until `GET /me/claims` has answered for this session. */
  claimsLoading: boolean;
  /** Step 1 of a claim: emails a code to the holder. Rejects with the API's reason. */
  requestClaimCode: (offerId: string, holder: ClaimHolder) => Promise<void>;
  recordClaim: (input: ClaimInput) => Promise<ClaimRecord>;
  byRef: (ref: string) => ClaimRecord | undefined;
  latestOf: (kind: ClaimKind) => ClaimRecord | undefined;
  removeClaim: (ref: string) => void;
  getGift: (token: string) => Promise<unknown>;
  rejectGift: (token: string, reason?: string) => Promise<unknown>;
  getClaimQr: (id: string) => Promise<unknown>;
  deleteClaim: (id: string) => Promise<unknown>;
}

/** The voucher to open when none is named: the newest usable one, else the newest of any state. */
export const currentVoucher = (claims: ClaimRecord[]): ClaimRecord | undefined => {
  const vouchers = claims.filter((entry) => entry.kind !== 'gift' && !entry.sentForOther);
  return vouchers.find((entry) => entry.state !== 'REDEEMED' && entry.state !== 'EXPIRED') ?? vouchers[0];
};

/** The customer's own vouchers they can still redeem, newest first as listed. */
export const activeVouchers = (claims: ClaimRecord[], now = Date.now()): ClaimRecord[] =>
  claims.filter(
    (entry) =>
      entry.kind !== 'gift' &&
      !entry.sentForOther &&
      entry.status === 'claimed' &&
      entry.state !== 'REDEEMED' &&
      entry.state !== 'EXPIRED' &&
      (entry.expiresAt === undefined || entry.expiresAt > now),
  );

/** The customer's own vouchers that were redeemed or ran out. */
export const pastVouchers = (claims: ClaimRecord[], now = Date.now()): ClaimRecord[] => {
  const active = new Set(activeVouchers(claims, now));
  return claims.filter((entry) => entry.kind !== 'gift' && !entry.sentForOther && entry.status === 'claimed' && !active.has(entry));
};

/** "Expires 12 Nov", or a neutral label for a voucher with no end date. */
export const voucherExpiryLabel = (claim: ClaimRecord): string =>
  claim.expiresAt === undefined
    ? 'No expiry date'
    : `Expires ${new Date(claim.expiresAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}`;

const CLAIMS_KEY = 'vemtap_claims';
const LEGACY_CLAIMED_KEY = 'vemtap_claimed';

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

const toNumber = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : undefined;
};
const toTime = (value: unknown) => {
  const parsed = typeof value === 'string' || value instanceof Date ? new Date(value).getTime() : NaN;
  return Number.isFinite(parsed) ? parsed : undefined;
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

    // `/me/gifts` rows name who they went to; they are never the sender's voucher.
    const sentForOther = item.claimedForOther === true;
    const giftTo = !sentForOther && typeof item.recipientEmail === 'string' ? item.recipientEmail : undefined;
    const claimKind: ClaimKind = sentForOther ? 'someone-else' : giftTo ? 'gift' : item.kind === 'gift' || item.kind === 'someone-else' ? item.kind : 'self';
    const claimId =
      typeof item.id === 'string' && item.id.trim()
        ? item.id.trim()
        : typeof item.claimId === 'string' && item.claimId.trim()
          ? item.claimId.trim()
          : undefined;
    const normalizedRef =
      typeof item.ref === 'string' && item.ref.trim()
        ? item.ref.trim()
        : typeof item.claimCode === 'string' && item.claimCode.trim()
          ? item.claimCode.trim()
          : claimId ?? `VT-${Date.now().toString(36).toUpperCase()}`;

    const claimRecord: ClaimRecord = {
      id: claimId,
      ref: normalizedRef,
      kind: claimKind,
      offerId: typeof item.offerId === 'string' ? item.offerId : typeof offer.id === 'string' ? offer.id : undefined,
      dealTitle,
      dealBusiness: businessName,
      dealImage: typeof item.dealImage === 'string' ? item.dealImage : typeof offer.mainImage === 'string' ? offer.mainImage : typeof offer.image === 'string' ? offer.image : undefined,
      dealDescription: typeof offer.description === 'string' && offer.description.trim() ? offer.description.trim() : undefined,
      dealItems: Array.isArray(offer.items)
        ? (offer.items as { id?: unknown; name?: unknown }[]).flatMap((entry) =>
            typeof entry?.id === 'string' && typeof entry.name === 'string' ? [{ id: entry.id, name: entry.name }] : [],
          )
        : undefined,
      businessCode: typeof offer.businessCode === 'string' && offer.businessCode ? offer.businessCode : undefined,
      businessVerified: typeof offer.businessVerified === 'boolean' ? offer.businessVerified : undefined,
      branchId: typeof offer.branchId === 'string' && offer.branchId ? offer.branchId : undefined,
      dealLocation: typeof offer.branchAddress === 'string' ? offer.branchAddress : typeof offer.branchName === 'string' && offer.branchName ? offer.branchName : undefined,
      dealPrice: toNumber(offer.calculatedPrice),
      dealOldPrice: toNumber(offer.originalPrice),
      discountLabel: toNumber(offer.discountPercent) ? `${toNumber(offer.discountPercent)}% OFF` : undefined,
      dealPhone: typeof offer.branchPhone === 'string' ? offer.branchPhone : undefined,
      dealLatitude: toNumber(offer.branchLatitude),
      dealLongitude: toNumber(offer.branchLongitude),
      code: typeof item.code === 'string' && item.code.trim() ? item.code.trim() : typeof item.claimCode === 'string' ? item.claimCode.trim() : normalizedRef,
      sentForOther: sentForOther || undefined,
      status: giftTo || item.status === 'gift-sent' || item.status === 'gift' ? 'gift-sent' : 'claimed',
      state: item.status === 'ACTIVE' || item.status === 'REDEEMED' || item.status === 'EXPIRED' ? item.status : undefined,
      expiresAt: toTime(item.expiresAt),
      terms: Array.isArray(item.terms) ? item.terms.filter((value): value is string => typeof value === 'string') : undefined,
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : toTime(item.claimedAt) ?? toTime(item.createdAt) ?? Date.now(),
      recipient: sentForOther
        ? { name: typeof item.recipientName === 'string' ? item.recipientName : '', email: typeof item.recipientEmail === 'string' ? item.recipientEmail : '' }
        : giftTo
        ? { name: '', email: giftTo }
        : item.recipient && typeof item.recipient === 'object'
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

/**
 * A gift email opens the deal with `?giftToken=`. The token waits here through
 * sign-in, and goes with the recipient's claim so the gift is marked accepted.
 */
const GIFT_TOKEN_KEY = 'vemtap_gift_token';
export const rememberGiftLink = (search: string) => {
  const token = new URLSearchParams(search).get('giftToken');
  if (token) window.sessionStorage.setItem(GIFT_TOKEN_KEY, token);
};

const apiMessage = (error: unknown, fallback: string) => (error instanceof Error && error.message ? error.message : fallback);

const ClaimsContext = createContext<ClaimsContextValue | null>(null);

export function ClaimsProvider({ children }: { children: ReactNode }) {
  const [claims, setClaims] = useState<ClaimRecord[]>(readClaims);
  // `/me/claims` and `/me/gifts` are customer-only: business accounts and
  // signed-out visitors would only get a 403/401, so they don't ask.
  const isCustomer = useSessionUser().data?.role === 'Customer';
  const [claimsLoading, setClaimsLoading] = useState(() => hasApiConfig());

  useEffect(() => {
    if (!hasApiConfig() || !isCustomer) {
      setClaimsLoading(false);
      return;
    }

    let ignore = false;
    setClaimsLoading(true);

    const hydrate = async () => {
      try {
        const [claimsResult, giftsResult] = await Promise.allSettled([
          apiGet<unknown>('/me/claims?includeClaimedForOthers=true'),
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

        try {
          if (dedupedClaims.length > 0) {
            window.localStorage.setItem(LEGACY_CLAIMED_KEY, '1');
          } else {
            window.localStorage.removeItem(LEGACY_CLAIMED_KEY);
          }
        } catch {
          // storage unavailable; this is only legacy compatibility cleanup
        }

        setClaims(dedupedClaims);
        writeClaims(dedupedClaims);
      } catch {
        // Fail silently so the local fallback remains available while the API is unavailable.
      } finally {
        if (!ignore) setClaimsLoading(false);
      }
    };

    void hydrate();
    return () => {
      ignore = true;
    };
  }, [isCustomer]);

  const recordClaim = useCallback(
    async (input: ClaimInput): Promise<ClaimRecord> => {
      const record: ClaimRecord = {
        id: input.id,
        ref: newRef(input.kind, claims),
        kind: input.kind,
        offerId: input.offerId,
        dealTitle: input.dealTitle ?? '',
        dealBusiness: input.dealBusiness ?? '',
        dealImage: input.dealImage,
        dealLocation: input.dealLocation,
        dealPrice: input.dealPrice,
        dealOldPrice: input.dealOldPrice,
        discountLabel: input.discountLabel,
        dealPhone: input.dealPhone,
        branchId: input.branchId,
        dealLatitude: input.dealLatitude,
        dealLongitude: input.dealLongitude,
        terms: input.terms,
        code: input.code ?? newCode(claims),
        status: input.kind === 'gift' ? 'gift-sent' : 'claimed',
        createdAt: Date.now(),
        recipient: input.recipient,
        sender: input.sender,
      };

      if (hasApiConfig()) {
        if (!input.offerId) throw new Error('This deal can’t be claimed right now.');
        // Only the API creates a voucher: gifts directly, everything else by
        // trading the emailed code. There is no local fallback.
        if (input.kind !== 'gift' && !input.code) throw new Error('Enter the code we emailed you.');

        const giftToken = input.giftToken ?? window.sessionStorage.getItem(GIFT_TOKEN_KEY) ?? undefined;
        let response: unknown;
        try {
          if (input.kind === 'gift') {
            response = await apiPost<unknown>('/catalogue/offers/claim/gift', {
              offerId: input.offerId,
              recipientEmail: input.recipient?.email,
              senderName: input.sender?.name,
              ...(input.note?.trim() ? { note: input.note.trim() } : {}),
            });
          } else {
            response = await apiPost<unknown>('/catalogue/offers/claim/verify', {
              offerId: input.offerId,
              email: input.email ?? input.recipient?.email ?? input.sender?.email ?? '',
              code: input.code,
              ...(giftToken ? { giftToken } : {}),
            });
            if (giftToken) window.sessionStorage.removeItem(GIFT_TOKEN_KEY);
          }
        } catch (error) {
          throw new Error(apiMessage(error, 'We couldn’t confirm this claim. Please try again.'));
        }

        const body = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>;
        const server = ((body.claim ?? body.data ?? body) as Record<string, unknown>) ?? {};
        const claimCode = typeof server.claimCode === 'string' ? server.claimCode : typeof server.code === 'string' ? server.code : undefined;
        if (input.kind !== 'gift' && !claimCode) throw new Error('We couldn’t confirm this claim. Please try again.');

        // The API answers with the voucher's identity; the deal's details come from the page.
        const persisted: ClaimRecord = {
          ...record,
          id: typeof server.id === 'string' ? server.id : record.id,
          // A gift has no voucher code until the recipient accepts it.
          ref: claimCode ?? (typeof body.giftToken === 'string' ? body.giftToken : record.ref),
          code: claimCode ?? '',
          state: input.kind === 'gift' ? undefined : 'ACTIVE',
          sentForOther: input.kind === 'someone-else' || undefined,
          expiresAt: toTime(server.expiresAt),
        };

        setClaims((current) => {
          const next = [persisted, ...current.filter((claim) => claim.ref !== persisted.ref)].slice(0, 40);
          writeClaims(next);
          try {
            if (next.length > 0) window.localStorage.setItem(LEGACY_CLAIMED_KEY, '1');
            else window.localStorage.removeItem(LEGACY_CLAIMED_KEY);
          } catch {
            // storage unavailable; ignore legacy cleanup failures
          }
          return next;
        });

        return persisted;
      }

      setClaims((current) => {
        if (current.some((claim) => claim.ref === record.ref)) return current;
        const next = [record, ...current].slice(0, 40);
        writeClaims(next);
        try {
          if (next.length > 0) window.localStorage.setItem(LEGACY_CLAIMED_KEY, '1');
          else window.localStorage.removeItem(LEGACY_CLAIMED_KEY);
        } catch {
          // storage unavailable; ignore legacy cleanup failures
        }
        return next;
      });

      return record;
    },
    [claims],
  );

  const requestClaimCode = useCallback(async (offerId: string, holder: ClaimHolder) => {
    try {
      await apiPost<unknown>('/catalogue/offers/claim/request', { offerId, ...holder });
    } catch (error) {
      throw new Error(apiMessage(error, 'We couldn’t send the code. Please try again.'));
    }
  }, []);

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
      try {
        if (next.length > 0) window.localStorage.setItem(LEGACY_CLAIMED_KEY, '1');
        else window.localStorage.removeItem(LEGACY_CLAIMED_KEY);
      } catch {
        // storage unavailable; ignore legacy cleanup failures
      }
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
        try {
          if (next.length > 0) window.localStorage.setItem(LEGACY_CLAIMED_KEY, '1');
          else window.localStorage.removeItem(LEGACY_CLAIMED_KEY);
        } catch {
          // storage unavailable; ignore legacy cleanup failures
        }
        return next;
      });
      return deleted;
    } catch (error) {
      throw error;
    }
  }, []);

  const value = useMemo<ClaimsContextValue>(
    () => ({ claims, claimsLoading, requestClaimCode, recordClaim, byRef, latestOf, removeClaim, getGift, rejectGift, getClaimQr, deleteClaim }),
    [claims, claimsLoading, requestClaimCode, recordClaim, byRef, latestOf, removeClaim, getGift, rejectGift, getClaimQr, deleteClaim],
  );

  return <ClaimsContext.Provider value={value}>{children}</ClaimsContext.Provider>;
}

export function useClaims(): ClaimsContextValue {
  const ctx = useContext(ClaimsContext);
  if (!ctx) throw new Error('useClaims must be used within a ClaimsProvider');
  return ctx;
}
