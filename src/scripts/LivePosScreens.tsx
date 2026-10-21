import type { ReactNode } from 'react';
import { Icon } from '../components/ui/Icon';
import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
import { PosHomePanel } from '../components/business/PosHomePanel';
import { PosRegisterPanel } from '../components/business/PosRegisterPanel';
import { PosOrderLookupPanel } from '../components/business/PosOrderLookupPanel';
import { PosKitchenPanel, PosLedgerPanel, PosStaffPinsPanel, PosStockPanel } from '../components/business/PosOpsPanels';
import { PosTerminalChrome, type PosTerminalNavKey } from './desktop/PosTerminalChrome';

export type LivePosPage = 'home' | 'register' | 'ledger' | 'kitchen' | 'stock' | 'settings' | 'orders';

export interface LivePosNav {
  onNewSale: () => void;
  onOpen: (target: 'ledger' | 'kitchen' | 'stock') => void;
  onOpenHome: () => void;
  onOpenTaxes: () => void;
  onOpenReceipt: () => void;
}

const META: Record<LivePosPage, { title: string; nav: PosTerminalNavKey; rail?: string }> = {
  home: { title: 'Point of sale', nav: 'home' },
  register: { title: 'New sale', nav: 'register' },
  ledger: { title: 'Sales ledger', nav: 'ledger' },
  kitchen: { title: 'Kitchen', nav: 'orders', rail: 'pos-kitchen' },
  stock: { title: 'Stock', nav: 'products' },
  settings: { title: 'POS settings', nav: 'settings' },
  orders: { title: 'Find customer order', nav: 'orders' },
};

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
