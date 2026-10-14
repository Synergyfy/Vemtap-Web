import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { SubmittedOrder } from './OrdersContext';

/**
 * Business customer database built from completed purchases (BUG-017).
 *
 * Every submitted order upserts one contact per (merchant, phone) pair, so a
 * returning customer extends their existing record instead of creating a
 * duplicate. Marketing consent is stored separately from the transactional
 * record and is never required to complete a purchase.
 *
 * BACKEND GAP: this is a local stand-in for
 *   POST /merchants/{id}/contacts (idempotent upsert on verified phone)
 *   GET  /merchants/{id}/contacts?query=
 * Payment details and raw transaction payloads are deliberately NOT stored
 * here — only order references and aggregate spend. Staff-role scoping
 * (who inside the business may see a contact) must be enforced server-side.
 */

export interface BusinessContact {
  /** `${merchantId}:${digits}` — dedupe key so one customer is one record. */
  key: string;
  merchantId: string;
  merchantName: string;
  name: string;
  phone?: string;
  email?: string;
  /** Order refs this contact placed, newest last. */
  orderRefs: string[];
  lastOrderRef?: string;
  orderCount: number;
  totalSpend: number;
  /** Optional promotional marketing opt-in, separate from the transaction. */
  marketingConsent: boolean;
  marketingConsentAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface ContactsContextValue {
  contacts: BusinessContact[];
  forMerchant: (merchantId?: string) => BusinessContact[];
  byPhone: (phone: string) => BusinessContact | undefined;
  search: (query: string, merchantId?: string) => BusinessContact[];
  /** Idempotent: merges into an existing record when the phone already exists. */
  upsertFromOrder: (order: SubmittedOrder) => BusinessContact;
}

const CONTACTS_KEY = 'vemtap_business_contacts';

const STORAGE_OK = typeof window !== 'undefined';

const readContacts = (): BusinessContact[] => {
  if (!STORAGE_OK) return [];
  try {
    const raw = window.localStorage.getItem(CONTACTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BusinessContact[]) : [];
  } catch {
    return [];
  }
};

const writeContacts = (contacts: BusinessContact[]) => {
  if (!STORAGE_OK) return;
  try {
    window.localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  } catch {
    // storage unavailable; state stays in memory only
  }
};

const digitsOf = (value?: string) => (value ?? '').replace(/\D/g, '');

const contactKey = (merchantId: string, phone?: string, email?: string) =>
  `${merchantId}:${digitsOf(phone) || (email ?? '').trim().toLowerCase()}`;

const ContactsContext = createContext<ContactsContextValue | null>(null);

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<BusinessContact[]>(readContacts);

  useEffect(() => {
    writeContacts(contacts);
  }, [contacts]);

  const upsertFromOrder = useCallback(
    (order: SubmittedOrder): BusinessContact => {
      const key = contactKey(order.merchantId, order.customerPhone, order.customerName);
      const now = Date.now();
      const created: BusinessContact = {
        key,
        merchantId: order.merchantId,
        merchantName: order.merchantName,
        name: order.customerName,
        phone: order.customerPhone,
        orderRefs: [order.ref],
        lastOrderRef: order.ref,
        orderCount: 1,
        totalSpend: order.total,
        marketingConsent: order.marketingConsent === true,
        marketingConsentAt: order.marketingConsent === true ? now : undefined,
        createdAt: now,
        updatedAt: now,
      };

      let result = created;
      setContacts((current) => {
        const existing = current.find((contact) => contact.key === key);
        if (!existing) {
          result = created;
          return [created, ...current];
        }
        const merged: BusinessContact = {
          ...existing,
          name: order.customerName || existing.name,
          phone: order.customerPhone || existing.phone,
          // Never re-ask, never silently drop: an order without a marketing
          // opt-in leaves the stored consent untouched.
          marketingConsent: order.marketingConsent === true ? true : existing.marketingConsent,
          marketingConsentAt:
            order.marketingConsent === true && !existing.marketingConsentAt ? now : existing.marketingConsentAt,
          orderRefs: existing.orderRefs.includes(order.ref)
            ? existing.orderRefs
            : [...existing.orderRefs, order.ref],
          lastOrderRef: order.ref,
          orderCount: existing.orderRefs.includes(order.ref) ? existing.orderCount : existing.orderCount + 1,
          totalSpend: existing.orderRefs.includes(order.ref) ? existing.totalSpend : existing.totalSpend + order.total,
          updatedAt: now,
        };
        result = merged;
        return current.map((contact) => (contact.key === key ? merged : contact));
      });
      return result;
    },
    [],
  );

  const byPhone = useCallback(
    (phone: string) => {
      const digits = digitsOf(phone);
      if (!digits) return undefined;
      return contacts.find((contact) => digitsOf(contact.phone).endsWith(digits.slice(-4)));
    },
    [contacts],
  );

  const forMerchant = useCallback(
    (merchantId?: string) => (merchantId ? contacts.filter((c) => c.merchantId === merchantId) : contacts),
    [contacts],
  );

  const search = useCallback(
    (query: string, merchantId?: string) => {
      const needle = query.trim().toLowerCase();
      const digits = digitsOf(query);
      return forMerchant(merchantId).filter((contact) => {
        if (!needle) return true;
        if (contact.name.toLowerCase().includes(needle)) return true;
        if (contact.email?.toLowerCase().includes(needle)) return true;
        if (digits.length >= 3 && digitsOf(contact.phone).includes(digits)) return true;
        return false;
      });
    },
    [forMerchant],
  );

  const value = useMemo<ContactsContextValue>(
    () => ({ contacts, forMerchant, byPhone, search, upsertFromOrder }),
    [contacts, forMerchant, byPhone, search, upsertFromOrder],
  );

  return <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>;
}

export function useContacts(): ContactsContextValue {
  const ctx = useContext(ContactsContext);
  if (!ctx) throw new Error('useContacts must be used within a ContactsProvider');
  return ctx;
}
