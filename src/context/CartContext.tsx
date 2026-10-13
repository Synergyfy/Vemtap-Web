import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export interface CartItemInput {
  id: string;
  name: string;
  price: number;
  image: string;
  productId?: string;
  options?: string;
  instructions?: string;
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

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
