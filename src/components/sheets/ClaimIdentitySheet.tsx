import { Icon } from '../ui/Icon';
import { SheetShell } from './SheetShell';

export interface ClaimIdentitySheetProps {
  open: boolean;
  onClose: () => void;
  onClaimSelf: () => void;
  onGift: () => void;
  onSomeoneElse: () => void;
}

export function ClaimIdentitySheet({ open, onClose, onClaimSelf, onGift, onSomeoneElse }: ClaimIdentitySheetProps) {
  return (
    <SheetShell open={open} onClose={onClose}>
      <div className="w-full flex justify-center pt-3 pb-space-xs">
        <div className="w-12 h-1.5 rounded-full bg-surface-container/60" />
      </div>

      <div className="flex flex-col w-full px-margin pb-space-lg">
        <div className="flex items-center justify-between pt-space-xs pb-space-sm">
          <div className="inline-flex items-center gap-space-2xs bg-surface-container-high text-on-secondary-container px-space-sm py-1 rounded-full shadow-sm">
            <Icon name="restaurant" className="text-[16px] text-primary" filled />
            <span className="font-label-sm text-label-sm font-semibold truncate max-w-[200px]">Urban Grill &amp; Bistro</span>
            <span className="w-1 h-1 rounded-full bg-outline-variant" />
            <span className="font-label-sm text-label-sm font-bold text-primary">₦9,600</span>
          </div>
          <button
            aria-label="Close modal"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="flex flex-col gap-1 pb-space-md">
          <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
            How would you like to claim this deal?
          </h1>
          <p className="font-body-md text-body-md text-text-secondary">
            Choose who will redeem this voucher pass at Urban Grill &amp; Bistro.
          </p>
        </div>

        <div className="relative overflow-hidden bg-surface-container-low rounded-xl p-space-md mb-space-md shadow-sm">
          <div className="flex items-center gap-space-sm">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary-container flex items-center justify-center text-on-secondary-container font-heading-sm text-heading-sm font-semibold">
                <img
                  className="w-full h-full object-cover"
                  alt="Close up warm lifestyle portrait of a happy smiling male professional in his late 20s with soft cinematic studio lighting, clear natural skin, modern aesthetic, deep blue background accents"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFZHGyc5MAgmj7Jz780eJWG_z84IByVk44rdWqHsT8sqgpIUmV1Ou2NweIW9IXmcHzswJLInaHLQ6eUMpjb18hvvQRQWb4PtywRPQaiSfPJ5KTMGnmpdy1zjFJUWCdzZr3Rpc-qjpfhjgNMmH6dwbSAU-fPAmsxFhtOoXxb89h5Iul73k59dE_dR4EW5AgSoONmvWe_nsZCm2dEfbYHsLCHDZsRklUp_b5nwZW8IcA"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
                <Icon name="verified" className="text-[13px]" filled />
              </div>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-space-2xs">
                <span className="font-button-primary text-button-primary text-text-primary truncate">John Doe</span>
              </div>
              <span className="font-body-md text-body-md text-text-secondary truncate">john@email.com</span>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 bg-surface-tint-blue px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                  <span className="font-caption text-caption text-primary font-semibold">Active VEMTAP Shopper</span>
                </span>
              </div>
            </div>
            <div className="flex-shrink-0 text-text-tertiary">
              <Icon name="check_circle" className="text-[20px]" />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClaimSelf}
          className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary flex items-center justify-between px-space-lg font-button-primary text-button-primary shadow-md active:scale-[0.98] transition-all mb-space-md"
        >
          <span className="flex items-center gap-2">
            <Icon name="local_activity" className="text-[20px]" filled />
            <span>Yes, claim for me</span>
          </span>
          <Icon name="arrow_forward" className="text-[20px] transition-transform group-active:translate-x-1" />
        </button>

        <div className="flex flex-col gap-space-xs mb-space-sm">
          <span className="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider px-1">
            Other options
          </span>

          <button
            type="button"
            onClick={onGift}
            className="group flex items-start gap-space-sm p-space-sm rounded-xl bg-surface-container-lowest shadow-sm active:bg-surface-container-high transition-colors cursor-pointer text-left w-full"
          >
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0 mt-0.5 group-active:scale-95 transition-transform">
              <Icon name="card_giftcard" className="text-[22px]" filled />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-button-secondary text-button-secondary text-text-primary">Claim as a gift</span>
                <Icon name="chevron_right" className="text-[18px] text-text-tertiary group-hover:text-primary transition-colors" />
              </div>
              <p className="font-caption text-caption text-text-secondary leading-snug pt-0.5">
                Send this voucher directly to a friend or family member
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onSomeoneElse}
            className="group flex items-start gap-space-sm p-space-sm rounded-xl bg-surface-container-lowest shadow-sm active:bg-surface-container-high transition-colors cursor-pointer text-left w-full"
          >
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary flex-shrink-0 mt-0.5 group-active:scale-95 transition-transform">
              <Icon name="person_pin" className="text-[22px]" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-button-secondary text-button-secondary text-text-primary">
                  Claim for someone else
                </span>
                <Icon name="chevron_right" className="text-[18px] text-text-tertiary group-hover:text-primary transition-colors" />
              </div>
              <p className="font-caption text-caption text-text-secondary leading-snug pt-0.5">
                Use alternative recipient details without changing your account
              </p>
            </div>
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 pt-space-xs text-text-tertiary">
          <Icon name="lock" className="text-[14px]" />
          <span className="font-caption text-caption">Voucher code instantly saved to your VEMTAP wallet</span>
        </div>
      </div>
    </SheetShell>
  );
}
