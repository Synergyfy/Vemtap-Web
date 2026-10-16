import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { TaxMode } from '../scripts/posCartData';
import { URBAN_BUSINESS } from '../scripts/businessData';

/**
 * Shared POS settings — controlled from POS Settings (side menu) and honoured
 * by every POS page: register, cart, payment and receipts.
 */
export interface PosSettingsContextValue {
  // Business Info
  businessName: string;
  setBusinessName: (value: string) => void;
  businessAddress: string;
  setBusinessAddress: (value: string) => void;
  businessPhone: string;
  setBusinessPhone: (value: string) => void;
  // Receipt
  receiptHeader: string;
  setReceiptHeader: (value: string) => void;
  receiptFooter: string;
  setReceiptFooter: (value: string) => void;
  autoPrintReceipt: boolean;
  setAutoPrintReceipt: (value: boolean) => void;
  showBusinessLogo: boolean;
  setShowBusinessLogo: (value: boolean) => void;
  // Tax & Pricing
  taxEnabled: boolean;
  setTaxEnabled: (value: boolean) => void;
  /** Tax percentage, e.g. 7.5. */
  taxRate: number;
  setTaxRate: (value: number) => void;
  /** How the tax row is labelled on receipts, e.g. "VAT". */
  taxLabel: string;
  setTaxLabel: (value: string) => void;
  pricesIncludeTax: boolean;
  setPricesIncludeTax: (value: boolean) => void;
  /** Derived — what the totals functions should apply right now. */
  taxMode: TaxMode;
  /** Alias for taxMode used across POS screens. */
  vatMode: TaxMode;
  setVatMode: (mode: TaxMode) => void;
  // Alerts
  lowStockAlerts: boolean;
  setLowStockAlerts: (value: boolean) => void;
  dailySalesSummary: boolean;
  setDailySalesSummary: (value: boolean) => void;
  newOrderAlert: boolean;
  setNewOrderAlert: (value: boolean) => void;
  staffActivityAlerts: boolean;
  setStaffActivityAlerts: (value: boolean) => void;
  // Loyalty
  loyaltyEnabled: boolean;
  setLoyaltyEnabled: (value: boolean) => void;
  /** Minimum points a customer needs before rewards can be redeemed. */
  redemptionThreshold: number;
  setRedemptionThreshold: (value: number) => void;
  // Till behaviour
  allowWalkIn: boolean;
  setAllowWalkIn: (value: boolean) => void;
}

const PosSettingsContext = createContext<PosSettingsContextValue | null>(null);

export function PosSettingsProvider({ children }: { children: ReactNode }) {
  const [businessName, setBusinessName] = useState(URBAN_BUSINESS.name);
  const [businessAddress, setBusinessAddress] = useState('Plot 42, Aminu Kano Cres, Wuse II, Abuja');
  const [businessPhone, setBusinessPhone] = useState('+234 803 411 9082');

  const [receiptHeader, setReceiptHeader] = useState(`Thank you for shopping with ${URBAN_BUSINESS.name}`);
  const [receiptFooter, setReceiptFooter] = useState('No returns after 7 days. Receipt required.');
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(false);
  const [showBusinessLogo, setShowBusinessLogo] = useState(true);

  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxRate, setTaxRate] = useState(7.5);
  const [taxLabel, setTaxLabel] = useState('VAT');
  const [pricesIncludeTax, setPricesIncludeTax] = useState(false);

  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [dailySalesSummary, setDailySalesSummary] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(true);
  const [staffActivityAlerts, setStaffActivityAlerts] = useState(false);

  const [loyaltyEnabled, setLoyaltyEnabled] = useState(true);
  const [redemptionThreshold, setRedemptionThreshold] = useState(500);

  const [allowWalkIn, setAllowWalkIn] = useState(true);

  // Prices Include Tax wins when active; otherwise Enable Tax decides; both off → no tax.
  const taxMode: TaxMode = pricesIncludeTax ? 'inclusive' : taxEnabled ? 'checkout' : 'none';
  const vatMode = taxMode;
  const setVatMode = (mode: TaxMode) => {
    if (mode === 'none') {
      setTaxEnabled(false);
    } else {
      setTaxEnabled(true);
      setPricesIncludeTax(mode === 'inclusive');
    }
  };

  const value = useMemo<PosSettingsContextValue>(() => {
    // Enable Tax ↔ Prices Include Tax are mutually exclusive.
    const applyTaxEnabled = (next: boolean) => {
      setTaxEnabled(next);
      if (next) setPricesIncludeTax(false);
    };
    const applyPricesIncludeTax = (next: boolean) => {
      setPricesIncludeTax(next);
      if (next) setTaxEnabled(false);
    };
    return {
      businessName,
      setBusinessName,
      businessAddress,
      setBusinessAddress,
      businessPhone,
      setBusinessPhone,
      receiptHeader,
      setReceiptHeader,
      receiptFooter,
      setReceiptFooter,
      autoPrintReceipt,
      setAutoPrintReceipt,
      showBusinessLogo,
      setShowBusinessLogo,
      taxEnabled,
      setTaxEnabled: applyTaxEnabled,
      taxRate,
      setTaxRate,
      taxLabel,
      setTaxLabel,
      pricesIncludeTax,
      setPricesIncludeTax: applyPricesIncludeTax,
      taxMode,
      vatMode,
      setVatMode,
      lowStockAlerts,
      setLowStockAlerts,
      dailySalesSummary,
      setDailySalesSummary,
      newOrderAlert,
      setNewOrderAlert,
      staffActivityAlerts,
      setStaffActivityAlerts,
      loyaltyEnabled,
      setLoyaltyEnabled,
      redemptionThreshold,
      setRedemptionThreshold,
      allowWalkIn,
      setAllowWalkIn,
    };
  }, [
      businessName,
      businessAddress,
      businessPhone,
      receiptHeader,
      receiptFooter,
      autoPrintReceipt,
      showBusinessLogo,
      taxEnabled,
      taxRate,
      taxLabel,
      pricesIncludeTax,
      taxMode,
      vatMode,
      lowStockAlerts,
      dailySalesSummary,
      newOrderAlert,
      staffActivityAlerts,
      loyaltyEnabled,
      redemptionThreshold,
      allowWalkIn,
    ],
  );
  return <PosSettingsContext.Provider value={value}>{children}</PosSettingsContext.Provider>;
}

export function usePosSettings(): PosSettingsContextValue {
  const ctx = useContext(PosSettingsContext);
  if (!ctx) throw new Error('usePosSettings must be used within a PosSettingsProvider');
  return ctx;
}

