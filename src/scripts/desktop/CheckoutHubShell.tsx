import type { ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';

interface CheckoutHubShellProps {
  children: ReactNode;
}

export function CheckoutHubShell({ children }: CheckoutHubShellProps) {
  return (
    <div className="w-full min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased">
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full max-w-7xl mx-auto px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xs cursor-pointer select-none">
            <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container shadow-[0_4px_16px_-2px_rgba(6,108,244,0.3)]">
              <Icon name="local_mall" className="text-[22px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading-sm text-heading-sm tracking-tight text-on-surface font-bold leading-none">
                VEMTAP
              </span>
              <span className="font-caption text-caption text-text-tertiary leading-none mt-space-2xs">
                Checkout Hub
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs px-space-sm py-1.5 rounded-full bg-surface-container-low text-on-surface">
              <Icon name="store" className="text-primary text-[18px]" />
              <span className="font-label-sm text-label-sm font-medium">Wuse II Branch, Abuja</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-8rem)]">
        <div className="flex flex-col w-full">{children}</div>
      </main>

      <footer className="w-full bg-surface-container-lowest shadow-[0_-1px_8px_rgba(0,0,0,0.03)] py-space-lg">
        <div className="max-w-7xl mx-auto px-margin flex flex-col md:flex-row items-center justify-between gap-space-sm text-center md:text-left">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-md text-label-md font-semibold text-on-surface">VEMTAP Commerce</span>
            <span className="font-caption text-caption text-text-tertiary">
              · Secured Enterprise Merchant Network
            </span>
          </div>
          <div className="font-caption text-caption text-text-secondary">
            © 2025 VEMTAP Technologies Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
