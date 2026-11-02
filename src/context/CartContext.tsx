import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { hasApiConfig } from '../lib/api';

export interface CartItemInput {
  id: string;
  name: string;
  price: number;
  image: string;
  productId?: string;
  options?: string;
  instructions?: string;
  /** The branch the order goes to, and who it is. */
  branchId?: string;
  merchantName?: string;
  merchantLogo?: string;
}

export interface CartLine extends CartItemInput {
  qty: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  total: number;
  qtyOf: (id: string) => number;
  add: (item: CartItemInput, qty?: number) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = 'vemtap_cart';

/** The saved cart; a line without a branch can't be ordered, so it isn't kept. */
const readCart = (): CartLine[] => {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(CART_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return (parsed as CartLine[]).filter((line) => line?.id && line.qty > 0 && (!hasApiConfig() || line.branchId));
  } catch {
    return [];
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readCart);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
    } catch {
      // storage unavailable; the cart lasts for this page only
    }
  }, [lines]);

  const add = useCallback((item: CartItemInput, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((line) => line.id === item.id);
      if (existing) {
        return prev.map((line) => (line.id === item.id ? { ...line, qty: line.qty + qty } : line));
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const increment = useCallback((id: string) => {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, qty: line.qty + 1 } : line)));
  }, []);

  const decrement = useCallback((id: string) => {
    setLines((prev) =>
      prev
        .map((line) => (line.id === id ? { ...line, qty: line.qty - 1 } : line))
        .filter((line) => line.qty > 0),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setLines((prev) => prev.filter((line) => line.id !== id));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, line) => sum + line.qty, 0);
    const total = lines.reduce((sum, line) => sum + line.qty * line.price, 0);
    return {
      lines,
      count,
      total,
      qtyOf: (id: string) => lines.find((line) => line.id === id)?.qty ?? 0,
      add,
      increment,
      decrement,
      remove,
      clear,
    };
  }, [lines, add, increment, decrement, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
