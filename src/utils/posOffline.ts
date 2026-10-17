import { printKvTable, printReport } from './printReport';

/**
 * Offline POS helpers shared by the desktop and mobile buffer screens:
 *  - a real AES-GCM encrypted .dat vault dump of the queued transactions
 *  - a print-ready offline X-tape summary
 */

export interface OfflineTxn {
  id: string;
  time: string;
  amount: number;
  type: 'cash' | 'card';
  method: string;
  items: string;
  meta: string;
}

const VAULT_KEY_STORAGE = 'vemtap.pos.vaultKey';

export const money2 = (value: number) =>
  `₦${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Per-device AES key, generated once and persisted in localStorage. */
const getVaultKey = async (): Promise<CryptoKey> => {
  const subtle = window.crypto?.subtle;
  if (!subtle) throw new Error('WebCrypto unavailable');
  let raw = window.localStorage.getItem(VAULT_KEY_STORAGE);
  if (!raw) {
    const bytes = window.crypto.getRandomValues(new Uint8Array(32));
    raw = btoa(String.fromCharCode(...bytes));
    window.localStorage.setItem(VAULT_KEY_STORAGE, raw);
  }
  const binary = atob(raw);
  const material = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) material[i] = binary.charCodeAt(i);
  return subtle.importKey('raw', material, { name: 'AES-GCM' }, false, ['encrypt']);
};

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export interface VaultDumpMeta {
  till: string;
  cashier: string;
  filename?: string;
}

/**
 * Encrypt the offline queue and download it as a .dat vault file.
 * Layout: 4-byte magic (VTPD) + 1-byte version + 12-byte IV + AES-GCM ciphertext.
 * Falls back to a plain JSON dump on browsers without WebCrypto.
 */
export async function exportEncryptedBackup(txns: OfflineTxn[], meta: VaultDumpMeta): Promise<void> {
  const payload = {
    format: 'vemtap-pos-offline-dump',
    version: 1,
    till: meta.till,
    cashier: meta.cashier,
    exportedAt: new Date().toISOString(),
    transactions: txns.map((txn) => ({
      id: txn.id,
      time: txn.time,
      amount: txn.amount,
      type: txn.type,
      method: txn.method,
      items: txn.items,
      meta: txn.meta,
    })),
    gross: txns.reduce((sum, txn) => sum + txn.amount, 0).toFixed(2),
  };
  const filename = meta.filename ?? 'till01_offline_dump.dat';

  try {
    const key = await getVaultKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode(JSON.stringify(payload));
    const ciphertext = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
    const header = new Uint8Array([0x56, 0x54, 0x50, 0x44, 0x01]);
    triggerDownload(new Blob([header, iv, new Uint8Array(ciphertext)], { type: 'application/octet-stream' }), filename);
  } catch {
    triggerDownload(
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/octet-stream' }),
      filename,
    );
  }
}

export interface XTapeMeta {
  till: string;
  cashier: string;
  networkNote: string;
}

/** Print a local X-tape summary straight from the queued transactions. */
export function printOfflineXTape(txns: OfflineTxn[], meta: XTapeMeta): void {
  const cashTotal = txns.filter((txn) => txn.type === 'cash').reduce((sum, txn) => sum + txn.amount, 0);
  const cardTotal = txns.filter((txn) => txn.type === 'card').reduce((sum, txn) => sum + txn.amount, 0);
  printReport(
    'Offline X-Tape Summary',
    `${printKvTable('Shift', [
      ['Till', meta.till],
      ['Cashier', meta.cashier],
      ['Network', meta.networkNote],
    ])}
     ${printKvTable(
       'Queued transactions',
       txns.map(
         (txn) => [`${txn.time} • ${txn.id}`, `${money2(txn.amount)} • ${txn.method} • ${txn.items}`] as [string, string],
       ),
     )}
     ${printKvTable('Totals', [
      ['Queued tickets', `${txns.length}`],
      ['Cash takings (buffered)', money2(cashTotal)],
      ['Card swipes (buffered)', money2(cardTotal)],
      ['Gross buffered', money2(cashTotal + cardTotal)],
    ])}
     <p class="foot">These transactions are held locally until the terminal reconnects.</p>`,
  );
}
