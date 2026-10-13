import { Icon } from '../ui/Icon';
import { SheetShell } from './SheetShell';

export interface RecipientSummarySheetProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  onEdit: () => void;
}

export function RecipientSummarySheet({ open, onClose, onContinue, onEdit }: RecipientSummarySheetProps) {
  return (
    <SheetShell open={open} onClose={onClose}>
      <div className="flex justify-center pt-3 pb-3">
        <div className="w-12 h-1.5 bg-outline-variant rounded-full" />
      </div>

      <div className="px-6 pt-1 pb-8">
        <header className="flex items-center justify-between mt-1 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-tint-blue border border-border-active rounded-full text-primary-container text-xs font-semibold tracking-wide">
            <Icon name="check" className="text-[14px]" />
            <span className="tracking-wider text-[11px] font-bold uppercase">Recipient Confirmed</span>
          </div>
          <button
            aria-label="Close dialog"
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-low text-text-secondary hover:bg-surface-container transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </header>

        <section className="mb-5">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight leading-tight">Confirm Recipient Summary</h1>
          <p className="text-sm text-text-tertiary mt-1 leading-snug">
            Review the verified recipient details before continuing to claim this deal on their behalf.
          </p>
        </section>

        <section className="bg-surface-subtle border border-border-subtle rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle/80">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-primary-container to-primary flex items-center justify-center text-on-primary font-bold text-lg shadow-sm">
                <span>SA</span>
                <span
                  className="absolute -bottom-0.5 -right-0.5 bg-primary-container text-on-primary p-0.5 rounded-full ring-2 ring-surface-canvas"
                  title="Verified"
                >
                  <Icon name="check" className="text-[14px]" filled />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-bold text-text-primary">Samuel Adeleke</h2>
                </div>
                <span className="inline-flex items-center text-xs font-semibold text-badge-discount-text bg-badge-discount-bg border border-badge-discount-text/20 px-2 py-0.5 rounded-full mt-0.5">
                  ✓ Verified Email
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary-container flex items-center justify-center">
              <Icon name="person" className="text-[20px]" />
            </div>
          </div>

          <div className="mt-3 space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-text-secondary">
              <div className="flex items-center gap-2 text-text-tertiary">
                <Icon name="mail" className="text-[16px]" />
                <span>Email</span>
              </div>
              <span className="font-medium text-text-primary">samuel.adeleke@example.com</span>
            </div>
            <div className="flex items-center justify-between text-text-secondary">
              <div className="flex items-center gap-2 text-text-tertiary">
                <Icon name="call" className="text-[16px]" />
                <span>Phone</span>
              </div>
              <span className="font-medium text-text-primary">+234 802 345 6789</span>
            </div>
          </div>
        </section>

        <section className="bg-surface-tint-blue/50 border border-border-active rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Attached Perk</span>
            <span className="bg-badge-discount-bg text-badge-discount-text text-xs font-bold px-2 py-0.5 rounded-md">
              20% OFF
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-surface-container overflow-hidden shrink-0 border border-border-subtle">
              <img
                alt="Urban Grill & Bistro Burger"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgxtHhHYkFK-oOHk2m2MiNyZ1CcnAPqiv36HD1dpTEMozJIs1lH9FP1irg5ws60AmGFOaMwdr53oSPADNKGebNtJhWXfCzby8UCggA6vq9WcsPswGiH-XuF19e2EWVAfclb__-Y4_mDnpeWj8xdX4ilC11h6I8nu11PnNV3LudPZAYGULQ_KXehKm5FbtHveev6WfLg5GyMmzOV98upg6WVBJ5wM5p-ULNWCtVgMx0-Kf4E93pqdM86g"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-text-primary truncate">Urban Grill &amp; Bistro</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Lunch Combo • <span className="font-bold text-text-primary">₦9,600</span>
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border-active/70 flex items-start gap-2 text-[11px] text-text-tertiary leading-snug">
            <Icon name="info" className="text-[16px] text-primary-container shrink-0 mt-0.5" />
            <span>
              Claim voucher will be generated in <strong>Samuel Adeleke's</strong> name. Payment is settled upon
              redemption.
            </span>
          </div>
        </section>

        <footer className="space-y-3">
          <button
            type="button"
            onClick={onContinue}
            className="w-full h-[52px] bg-primary-container hover:bg-primary active:bg-primary text-on-primary font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary-container/25 transition-all text-base"
          >
            <span>Continue to Claim</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="w-full py-2.5 text-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Edit Recipient Details
          </button>
        </footer>
      </div>
    </SheetShell>
  );
}
