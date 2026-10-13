import { Icon } from '../ui/Icon';
import { SheetShell } from './SheetShell';

export interface ClaimAuthSheetProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export function ClaimAuthSheet({ open, onClose, onAuthenticated }: ClaimAuthSheetProps) {
  return (
    <SheetShell open={open} onClose={onClose}>
      <div className="w-full flex justify-center pt-3 pb-space-xs">
        <div className="w-12 h-1.5 rounded-full bg-surface-container/60" />
      </div>

      <div className="flex flex-col w-full px-margin pt-space-xs pb-space-lg">
        <div className="flex items-center justify-between w-full mb-space-sm">
          <div className="flex items-center gap-space-2xs bg-surface-tint-blue px-space-xs py-space-2xs rounded-full">
            <Icon name="bolt" className="text-primary text-[16px]" filled />
            <span className="font-label-sm text-label-sm text-primary font-semibold">Fast Pass Claim</span>
          </div>
          <button
            aria-label="Close modal"
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface-container-low active:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="flex flex-col mb-space-md">
          <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">Before you claim</h2>
          <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
            We need a few details to save this deal to your wallet and reserve your table perk.
          </p>
        </div>

        <div className="flex items-center gap-space-sm p-space-sm bg-surface-subtle rounded-xl shadow-sm mb-space-lg">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container">
            <img
              className="w-full h-full object-cover"
              alt="Gourmet artisanal lunch combo meal featuring an elevated smashed cheeseburger with truffle seasoned fries, iced tea, warm ambient natural dining light, studio culinary photography style with subtle gold accents"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYv-Cf0sSh-nrgo5Kq1VfMrjiQ9cmn_dRuC2o6034OOiGTAZXPWMBS16ckIDydE9blv0uB9M-Kwmm9k97eC2kaWwONQ7n37oXItM5bo4HAnioqAf8Q84CQ1dyHpI624ynaD-Lg3KS0tAr118hBAG8F76AtZBbgC42AtH8H2RV-l6hppFU9mK2AQoF1lla1W8Wy3Stc5j45nyCtYth-Wd1PxxQZSbL3pG5UrKTvE6oX"
            />
            <div className="absolute top-1 left-1 bg-badge-discount-bg px-1.5 py-0.5 rounded-full flex items-center">
              <span className="font-caption text-[10px] text-badge-discount-text font-bold leading-none">-20%</span>
            </div>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-space-2xs">
              <span className="font-label-sm text-label-sm text-text-secondary truncate">Urban Grill &amp; Bistro</span>
              <Icon name="verified" className="text-primary text-[14px]" filled />
            </div>
            <p className="font-heading-sm text-heading-sm text-text-primary truncate mt-0.5">Lunch Combo Special</p>
            <div className="flex items-baseline gap-space-xs mt-1">
              <span className="font-button-primary text-button-primary text-text-primary font-bold">₦9,600</span>
              <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold bg-badge-discount-bg px-space-2xs py-0.5 rounded">
                Save ₦2,400
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-space-sm w-full">
          <button
            type="button"
            onClick={onAuthenticated}
            className="relative flex items-center justify-center w-full h-[52px] bg-surface-container-lowest rounded-xl shadow-sm active:scale-[0.98] transition-transform duration-150 px-space-md"
          >
            <svg className="w-5 h-5 mr-space-sm shrink-0" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-button-primary text-button-primary text-text-primary font-semibold">
              Continue with Google
            </span>
          </button>

          <div className="flex items-center my-space-2xs">
            <div className="h-px bg-surface-container-high flex-1" />
            <span className="px-space-sm font-caption text-caption text-text-tertiary font-medium uppercase tracking-wider">
              or
            </span>
            <div className="h-px bg-surface-container-high flex-1" />
          </div>

          <button
            type="button"
            onClick={onAuthenticated}
            className="flex items-center justify-center w-full h-[52px] bg-surface-container-low active:bg-surface-container-high rounded-xl active:scale-[0.98] transition-all duration-150 px-space-md text-on-surface"
          >
            <Icon name="mail" className="text-on-surface-variant text-[20px] mr-space-sm shrink-0" />
            <span className="font-button-primary text-button-primary text-text-primary font-semibold">
              Continue with Email
            </span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-space-2xs mt-space-md py-space-2xs px-space-sm bg-surface-subtle rounded-full mx-auto">
          <Icon name="verified_user" className="text-badge-discount-text text-[16px]" filled />
          <span className="font-caption text-caption text-text-secondary">Instant voucher sync • Zero hidden fees</span>
        </div>

        <div className="flex flex-col items-center text-center mt-space-md gap-space-2xs">
          <div className="flex items-center justify-center gap-space-2xs">
            <span className="font-label-md text-label-md text-text-secondary">Already have an account?</span>
            <button
              type="button"
              onClick={onAuthenticated}
              className="font-label-md text-label-md text-primary-container font-semibold active:opacity-75 transition-opacity"
            >
              Sign in
            </button>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-text-tertiary">
            <Icon name="subdirectory_arrow_right" className="text-[14px]" />
            <p className="font-caption text-caption text-text-secondary">
              You'll be returned directly to this deal after signing in.
            </p>
          </div>
        </div>
      </div>
    </SheetShell>
  );
}
