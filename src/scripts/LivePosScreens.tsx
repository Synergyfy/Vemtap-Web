import type { ReactNode } from 'react';
import { Icon } from '../components/ui/Icon';
import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
import { PosHomePanel, type PosHomeTarget } from '../components/business/PosHomePanel';
import { PosRegisterPanel } from '../components/business/PosRegisterPanel';
import { PosOrderLookupPanel } from '../components/business/PosOrderLookupPanel';
import { PosCustomersPanel } from '../components/business/PosCustomersPanel';
import { PosDisplayPanel } from '../components/business/PosDisplayPanel';
import { PosKitchenPanel, PosLedgerPanel, PosStaffPinsPanel, PosStockPanel } from '../components/business/PosOpsPanels';
import { PosTerminalChrome, type PosTerminalNavKey } from './desktop/PosTerminalChrome';

export type LivePosPage = 'home' | 'register' | 'ledger' | 'kitchen' | 'stock' | 'settings' | 'orders' | 'customers' | 'switch';

export interface LivePosNav {
  onNewSale: () => void;
  onOpen: (target: PosHomeTarget) => void;
  onOpenHome: () => void;
  onOpenTaxes: () => void;
  onOpenReceipt: () => void;
  /** Signs the current person out so the next cashier can sign in. */
  onSwitchCashier: () => void;
}

const META: Record<LivePosPage, { title: string; nav: PosTerminalNavKey; rail?: string }> = {
  home: { title: 'Point of sale', nav: 'home' },
  register: { title: 'New sale', nav: 'register' },
  ledger: { title: 'Sales ledger', nav: 'ledger' },
  kitchen: { title: 'Kitchen', nav: 'orders', rail: 'pos-kitchen' },
  stock: { title: 'Stock', nav: 'products' },
  settings: { title: 'POS settings', nav: 'settings' },
  orders: { title: 'Find customer order', nav: 'orders' },
  customers: { title: 'Customers', nav: 'register' },
  switch: { title: 'Switch cashier', nav: 'home' },
};

/**
 * Sales are credited to whoever is signed in, so changing cashier means the
 * next person signs in with their own account.
 */
function SwitchCashier({ nav }: { nav: LivePosNav }) {
  return (
    <div className="max-w-md rounded-2xl bg-surface-canvas border border-border-subtle shadow-sm p-space-lg flex flex-col gap-space-md">
      <span className="w-12 h-12 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center">
        <Icon name="switch_account" className="text-[24px]" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-heading-sm text-heading-sm text-text-primary">Hand over the till</h2>
        <p className="font-body-md text-body-md text-text-secondary">
          You’ll be signed out so the next cashier can sign in with their own account. Each sale is recorded against whoever is
          signed in. The register stays open, and a ticket you haven’t charged stays on this device.
        </p>
      </div>
      <div className="flex flex-wrap gap-space-xs">
        <button type="button" onClick={nav.onSwitchCashier} className="h-11 px-space-md rounded-xl bg-primary-container text-on-primary font-label-md text-label-md">
          Sign out and switch
        </button>
        <button type="button" onClick={nav.onOpenHome} className="h-11 px-space-md rounded-xl border border-border-subtle font-label-md text-label-md text-text-primary">
          Cancel
        </button>
      </div>
    </div>
  );
}

function SettingsLinks({ nav }: { nav: LivePosNav }) {
  return (
    <div className="flex flex-col gap-space-lg max-w-3xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        {[
          { label: 'Taxes & charges', body: 'VAT, service charge and packaging', icon: 'percent', onClick: nav.onOpenTaxes },
          { label: 'Receipt', body: 'Header, footer, logo and printing', icon: 'receipt', onClick: nav.onOpenReceipt },
        ].map((link) => (
          <button key={link.label} type="button" onClick={link.onClick} className="rounded-xl bg-surface-canvas border border-border-subtle p-space-md flex items-center gap-space-sm text-left hover:border-primary/40">
            <span className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
              <Icon name={link.icon} className="text-[20px]" />
            </span>
            <span className="flex flex-col">
              <span className="font-label-md text-label-md text-text-primary font-semibold">{link.label}</span>
              <span className="font-caption text-caption text-text-secondary">{link.body}</span>
            </span>
          </button>
        ))}
      </div>
      <PosStaffPinsPanel />
    </div>
  );
}

function Body({ page, nav, saleId }: { page: LivePosPage; nav: LivePosNav; saleId?: string | null }): ReactNode {
  switch (page) {
    case 'home':
      return <PosHomePanel onNewSale={nav.onNewSale} onOpen={nav.onOpen} />;
    case 'register':
      return <PosRegisterPanel onOpenHome={nav.onOpenHome} />;
    case 'ledger':
      return <PosLedgerPanel initialSaleId={saleId} />;
    case 'kitchen':
      return <PosKitchenPanel />;
    case 'stock':
      return <PosStockPanel />;
    case 'settings':
      return <SettingsLinks nav={nav} />;
    case 'orders':
      return <PosOrderLookupPanel />;
    case 'customers':
      return <PosCustomersPanel onStartSale={nav.onNewSale} />;
    case 'switch':
      return <SwitchCashier nav={nav} />;
  }
}

/** Live POS page — mobile. */
export function LivePosScreen({ page, nav, saleId, onBack }: { page: LivePosPage; nav: LivePosNav; saleId?: string | null; onBack: () => void }) {
  return (
    <BusinessSubScreen title={META[page].title} onBack={onBack}>
      <Body page={page} nav={nav} saleId={saleId} />
    </BusinessSubScreen>
  );
}

/** Live POS page — desktop, inside the POS terminal chrome. */
export function DesktopLivePosScreen({
  page,
  nav,
  saleId,
  onNav,
}: {
  page: LivePosPage;
  nav: LivePosNav;
  saleId?: string | null;
  onNav: (key: PosTerminalNavKey) => void;
}) {
  const meta = META[page];
  return (
    <PosTerminalChrome activeNav={meta.nav} railActive={meta.rail} onNav={onNav}>
      <div className="flex flex-col gap-space-md p-space-lg">
        {page !== 'register' ? <h1 className="font-heading-lg text-heading-lg text-text-primary">{meta.title}</h1> : null}
        <Body page={page} nav={nav} saleId={saleId} />
      </div>
    </PosTerminalChrome>
  );
}

/** The full-screen customer display, shown without any app chrome. */
export function LivePosDisplayScreen({ onExit }: { onExit: () => void }) {
  return <PosDisplayPanel onExit={onExit} />;
}
