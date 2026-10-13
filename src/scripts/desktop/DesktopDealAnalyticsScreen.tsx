import { Icon } from '../../components/ui/Icon';
import { MerchantWorkspaceChrome } from './MerchantWorkspaceChrome';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopDealAnalyticsScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onEditPricing?: () => void;
  onConfigureCap?: () => void;
  onChat?: () => void;
}

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBi14KuGJJnmvUeekQ7nZ8HThtiP8dwqv-UAnmLlSiBR2Q1yNnfPtwhhw2W-IKrxCvqO2GJgzo64ypb98_va13rhCV-jApHIaIa0a8z3axzRa-fx9LJOpffCRiuC5XgiO51sr5NjquAYm9U3hWoLgaf6EyAw_f-GTbiNuAWf3-useNFVvT9ZWmM_M4cvJwuSGxqO8kQvANEf3KLIrK-WRe8VkO50qau5QgPJ5zGJ8UOk2xvEjz8DHW-6Q';

const RIBEYE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDsWMX2Wi4TcSQRJJNgR1WXpAWVt63ApEAOkyXE5935kV0-nX_PfCuQXVhujrAHxT3FPz4DI1Ywi_HNYi9JqiSEPQyknnutFakHA8G5BpPRffYEZJIvDVSg2sQ5AjmKKT81nvSFdHPhM0jckf5k3ob7NnSPnTakVomfIj-NC11MHuw-jlmZ256_bRr6r9xUH6ggliuRHTcsZpI4ZeU0N_hLT4UU2zNEeW2zYH2z1xqkB24WbZWLhqcsxA';

const MOJITO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAuX4LV9x3ADSBhrJTDwWAG_27FSQBwoDW4JN7X_W9zeFI099ZkQCkRYbBfHLLRHrMvPQz84EVssE8aL3kxlvvg2Ic2CarVTiymLnCIMgzIAQWb6jlcT7fCJA-MpCcoATx9lBvl-piyZ1z0MXCgJAwIfFO8CwlX2gmEiRln9J7kaFdntq-2i2Ed_dZz2FhLd5ptjvOqxeDuy05wiO4lB1qIK22__tfkvGogIuMZWNzvr42eLFfTC9KigQ';

export function DesktopDealAnalyticsScreen({
  onNav,
  onEditPricing,
  onConfigureCap,
  onChat,
}: DesktopDealAnalyticsScreenProps) {
  return (
    <MerchantWorkspaceChrome activeNav="deals" onNav={onNav}>
      <div className="w-full py-space-xl flex flex-col gap-space-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
          <nav className="flex items-center gap-space-2xs text-text-secondary font-caption text-caption">
            <button
              type="button"
              onClick={() => onNav('deals')}
              className="hover:text-primary-container transition-colors"
            >
              Deals & Promotions
            </button>
            <Icon name="chevron_right" className="text-outline-variant text-[14px]" />
            <button
              type="button"
              onClick={() => onNav('deals')}
              className="hover:text-primary-container transition-colors"
            >
              Active Deals
            </button>
            <Icon name="chevron_right" className="text-outline-variant text-[14px]" />
            <span className="font-medium text-text-primary">Weekend Prime Lunch Combo</span>
            <span className="ml-space-xs px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-[11px] font-semibold">
              Ref: #VT-48F261
            </span>
          </nav>
          <div className="flex items-center gap-space-md self-start md:self-auto">
            <div className="flex items-center gap-space-2xs text-badge-discount-text font-caption text-caption font-semibold">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-ping" />
              <span>Synced with POS Mesh (4 Tills Active)</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-space-lg">
          <div className="flex flex-col gap-space-xs max-w-3xl">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="inline-flex items-center gap-1 px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                Active • Live on Feeds
              </span>
              <span className="inline-flex items-center px-space-xs py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
                20% OFF Deal Badge
              </span>
              <span className="inline-flex items-center gap-1 px-space-xs py-1 rounded-full bg-surface-subtle text-text-secondary font-label-sm text-label-sm">
                <Icon name="storefront" className="text-[16px]" />
                Wuse II & Maitama (2 Active Branches)
              </span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight mt-1">
              Weekend Prime Lunch Combo
            </h1>
            <p className="font-body-md text-body-md text-text-secondary">
              Premium dry-aged beef paired with signature mocktails, optimized for fast corporate & midday
              walk-ins.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-xs flex-shrink-0">
            <button
              type="button"
              className="h-[48px] px-space-md rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center gap-space-xs shadow-md hover:bg-primary transition-all active:scale-[0.98]"
            >
              <Icon name="rocket_launch" className="text-[20px]" />
              <span>Boost Deal (+5,000 Diners)</span>
            </button>
            <button
              type="button"
              className="h-[48px] px-space-md rounded-xl bg-surface-canvas text-text-primary font-button-secondary text-button-secondary shadow-sm hover:bg-surface-subtle transition-colors flex items-center gap-1.5"
            >
              <Icon name="edit" className="text-text-secondary text-[18px]" />
              <span>Edit Deal</span>
            </button>
            <button
              type="button"
              title="Pause Deal"
              className="h-[48px] px-space-sm rounded-xl bg-surface-canvas text-text-secondary font-button-secondary text-button-secondary shadow-sm hover:bg-surface-subtle transition-colors flex items-center justify-center"
            >
              <Icon name="pause_circle" className="text-[20px]" />
            </button>
            <button
              type="button"
              title="End Promotion"
              className="h-[48px] px-space-sm rounded-xl bg-surface-canvas text-error font-button-secondary text-button-secondary shadow-sm hover:bg-error-container hover:text-on-error-container transition-colors flex items-center justify-center"
            >
              <Icon name="stop_circle" className="text-[20px]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl items-start">
          <div className="xl:col-span-8 flex flex-col gap-space-xl">
            <div className="bg-surface-canvas rounded-xl shadow-sm overflow-hidden">
              <div className="relative w-full h-72 bg-surface-container-high overflow-hidden">
                <img
                  className="w-full h-full object-cover object-center"
                  src={HERO_IMAGE}
                  alt="Close up gourmet photography of a sizzling 250g grilled woodfire ribeye steak garnished with rosemary sprigs alongside a condensation-frosted tall glass passionfruit mojito, warm atmospheric ambient dining lighting, warm mahogany wood background, sharp focus, 8k resolution"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/20 to-transparent" />
                <div className="absolute top-space-md left-space-md flex items-center gap-space-xs">
                  <span className="px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-sm">
                    20% DISCOUNT APPLIED
                  </span>
                  <span className="px-space-xs py-1 rounded-full bg-inverse-surface/70 backdrop-blur-md text-inverse-on-surface font-caption text-caption">
                    SKU: DLS-PRM-891
                  </span>
                </div>
                <div className="absolute bottom-space-md left-space-md right-space-md flex flex-wrap items-end justify-between gap-space-md text-surface-canvas">
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-surface-container-high tracking-wider uppercase font-semibold">
                      Curated Duo
                    </span>
                    <span className="font-heading-md text-heading-md font-bold leading-tight">
                      Artisan Woodfire Ribeye & Passionfruit Mojito
                    </span>
                  </div>
                  <div className="flex items-baseline gap-space-xs bg-inverse-surface/80 backdrop-blur-md px-space-md py-space-xs rounded-xl">
                    <span className="font-display-hero text-display-hero font-bold text-surface-canvas leading-none">
                      ₦9,600
                    </span>
                    <span className="font-body-md text-body-md line-through text-outline-variant">₦12,000</span>
                  </div>
                </div>
              </div>
              <div className="p-space-lg flex flex-col gap-space-md bg-surface-subtle">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="account_balance_wallet" className="text-primary text-[20px]" />
                    <h3 className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                      Pricing & Settlement Matrix
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 font-caption text-caption text-badge-discount-text font-semibold px-space-xs py-0.5 rounded-full bg-badge-discount-bg">
                    <Icon name="verified" className="text-[14px]" /> Zero VEMTAP Commission Guarantee
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
                  <div className="p-space-md rounded-xl bg-surface-canvas shadow-sm flex flex-col">
                    <span className="font-caption text-caption text-text-secondary">Original Menu Price</span>
                    <span className="font-heading-sm text-heading-sm font-semibold text-text-primary mt-1">
                      ₦12,000
                    </span>
                    <span className="font-caption text-caption text-text-tertiary mt-0.5">Dine-in base tariff</span>
                  </div>
                  <div className="p-space-md rounded-xl bg-surface-canvas shadow-sm flex flex-col">
                    <span className="font-caption text-caption text-text-secondary">Deal Offer Price</span>
                    <span className="font-heading-sm text-heading-sm font-semibold text-primary mt-1">₦9,600</span>
                    <span className="font-caption text-caption text-badge-discount-text mt-0.5">
                      -₦2,400 (20% Savings)
                    </span>
                  </div>
                  <div className="p-space-md rounded-xl bg-surface-canvas shadow-sm flex flex-col">
                    <span className="font-caption text-caption text-text-secondary">VEMTAP Platform Cut</span>
                    <span className="font-heading-sm text-heading-sm font-semibold text-badge-discount-text mt-1">
                      0% (₦0.00)
                    </span>
                    <span className="font-caption text-caption text-text-tertiary mt-0.5">
                      Direct Settlement Mode
                    </span>
                  </div>
                  <div className="p-space-md rounded-xl bg-surface-canvas shadow-sm flex flex-col">
                    <span className="font-caption text-caption text-text-secondary">Merchant Payout at Till</span>
                    <span className="font-heading-sm text-heading-sm font-semibold text-text-primary mt-1">
                      ₦9,600
                    </span>
                    <span className="font-caption text-caption text-text-tertiary mt-0.5">
                      100% Retained at POS
                    </span>
                  </div>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-tint-blue flex items-center gap-space-xs text-text-secondary font-caption text-caption">
                  <Icon name="info" className="text-primary text-[18px]" />
                  <span>
                    <strong>Settlement Note:</strong> Customer taps phone at your terminal or scans QR. 100% of
                    payments pass directly to your connected Wema/Zenith merchant acquiring account instantly.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-space-lg bg-surface-canvas rounded-xl shadow-sm flex flex-col gap-space-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs">
                  <Icon name="speed" className="text-primary text-[22px]" />
                  <h3 className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                    Redemption Velocity & Quota Telemetry
                  </h3>
                </div>
                <div className="flex items-center gap-space-2xs text-text-secondary font-caption text-caption">
                  <Icon name="timer" className="text-[16px] text-badge-discount-text" />
                  <span>Runs Mon – Sun, 12:00 PM – 5:00 PM (Ends in 3 days)</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-1">
                  <span className="font-caption text-caption text-text-secondary">Gross Revenue Captured (GMV)</span>
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-heading-lg text-heading-lg font-bold text-text-primary">₦854,400</span>
                    <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold">
                      +₦14.4k today
                    </span>
                  </div>
                  <span className="font-caption text-caption text-text-tertiary">
                    From 89 successful till redemptions
                  </span>
                </div>
                <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-1">
                  <span className="font-caption text-caption text-text-secondary">Conversion / Claim Velocity</span>
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-heading-lg text-heading-lg font-bold text-primary">69.5%</span>
                    <span className="font-label-sm text-label-sm text-text-secondary">redemption rate</span>
                  </div>
                  <span className="font-caption text-caption text-text-tertiary">
                    89 used / 128 claimed (39 live vouchers)
                  </span>
                </div>
                <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-1">
                  <span className="font-caption text-caption text-text-secondary">Today's Daily Burn Rate</span>
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-heading-lg text-heading-lg font-bold text-text-primary">38 / 100</span>
                    <span className="font-label-sm text-label-sm text-text-secondary">vouchers</span>
                  </div>
                  <span className="font-caption text-caption text-text-tertiary">
                    62 vouchers remaining for today
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-space-xs pt-space-xs">
                <div className="flex items-center justify-between font-label-sm text-label-sm">
                  <span className="font-semibold text-text-primary">Daily Kitchen Allocation Utilization</span>
                  <span className="text-primary font-bold">62% Capacity Allocated (38 Redeemed)</span>
                </div>
                <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-primary-container rounded-full transition-all duration-500"
                    style={{ width: '62%' }}
                  />
                </div>
                <div className="flex justify-between items-center text-text-tertiary font-caption text-caption mt-1">
                  <span>0 (12:00 PM Service Open)</span>
                  <span>Safe Buffer Zone (60/100 threshold)</span>
                  <span>100 Max Kitchen Cap</span>
                </div>
              </div>
              <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                    Today's Hourly Redemption Wave
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    Peak hour: 1:30 PM - 2:15 PM
                  </span>
                </div>
                <div className="w-full h-16 flex items-end">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 60">
                    <defs>
                      <linearGradient id="waveGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#066cf4" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#066cf4" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,55 Q40,52 80,48 T160,35 T240,8 T320,24 T400,38 L400,60 L0,60 Z"
                      fill="url(#waveGradient)"
                    />
                    <path
                      d="M0,55 Q40,52 80,48 T160,35 T240,8 T320,24 T400,38"
                      fill="none"
                      stroke="#066cf4"
                      strokeWidth="2.5"
                    />
                    <circle cx="240" cy="8" r="4" fill="#066cf4" />
                  </svg>
                </div>
                <div className="flex justify-between text-text-tertiary font-caption text-[11px] pt-1">
                  <span>12:00 PM</span>
                  <span>1:00 PM</span>
                  <span>2:00 PM (Peak)</span>
                  <span>3:00 PM</span>
                  <span>4:00 PM</span>
                  <span>5:00 PM</span>
                </div>
              </div>
            </div>

            <div className="p-space-lg bg-surface-canvas rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="restaurant_menu" className="text-primary text-[20px]" />
                  <h3 className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                    Bundled Catalog Items & Kitchen Load
                  </h3>
                </div>
                <span className="font-caption text-caption text-text-secondary">2 Items in Combo Package</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="p-space-md rounded-xl bg-surface-subtle flex gap-space-md items-center">
                  <div className="w-16 h-16 rounded-lg bg-surface-container-high overflow-hidden flex-shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      src={RIBEYE_IMAGE}
                      alt="Woodfire grilled ribeye steak 250g with grill marks on white rustic ceramic plate, top down clean view, appetizing food lighting"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                        Woodfire Ribeye 250g
                      </span>
                      <span className="font-caption text-caption font-semibold px-2 py-0.5 rounded-full bg-surface-container-high text-primary">
                        Qty: 1
                      </span>
                    </div>
                    <span className="font-caption text-caption text-text-secondary mt-0.5">
                      Section: Main Grill Line #01
                    </span>
                    <div className="flex items-center gap-space-2xs mt-2 text-badge-discount-text font-caption text-[11px] font-semibold">
                      <Icon name="check_circle" className="text-[14px]" />
                      <span>Kitchen Inventory Stocked (142 cuts ready)</span>
                    </div>
                  </div>
                </div>
                <div className="p-space-md rounded-xl bg-surface-subtle flex gap-space-md items-center">
                  <div className="w-16 h-16 rounded-lg bg-surface-container-high overflow-hidden flex-shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      src={MOJITO_IMAGE}
                      alt="Vibrant tropical passionfruit mojito with crushed ice and fresh mint leaves in a crystal highball glass, refreshing bar photo"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                        Passionfruit House Mojito
                      </span>
                      <span className="font-caption text-caption font-semibold px-2 py-0.5 rounded-full bg-surface-container-high text-primary">
                        Qty: 1
                      </span>
                    </div>
                    <span className="font-caption text-caption text-text-secondary mt-0.5">
                      Section: Craft Bar Stand #B
                    </span>
                    <div className="flex items-center gap-space-2xs mt-2 text-badge-discount-text font-caption text-[11px] font-semibold">
                      <Icon name="check_circle" className="text-[14px]" />
                      <span>Bar Prep Synced (Syrup & Mint Fresh)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-subtle flex items-center justify-between text-caption font-caption text-text-secondary">
                <div className="flex items-center gap-space-xs">
                  <Icon name="lock_clock" className="text-outline text-[18px]" />
                  <span>
                    <strong>Kitchen Cap Safeguard:</strong> Automatically suspends new claims when 45 active
                    reservations are reached within any single 60-minute window.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onConfigureCap}
                  className="text-primary-container font-semibold hover:underline flex-shrink-0"
                >
                  Configure Cap
                </button>
              </div>
            </div>

            <div className="p-space-lg bg-surface-canvas rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="domain" className="text-primary text-[20px]" />
                  <h3 className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                    Branch Availability & Price Differential
                  </h3>
                </div>
                <span className="font-caption text-caption text-text-secondary">2 of 3 Outlets Enabled</span>
              </div>
              <div className="flex flex-col gap-space-xs">
                <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                  <div className="flex items-start gap-space-sm">
                    <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                      <Icon name="store" className="text-[20px]" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-label-md text-label-md font-semibold text-text-primary">
                          Wuse II Flagship (Headquarters)
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
                          Primary
                        </span>
                      </div>
                      <span className="font-caption text-caption text-text-secondary">
                        Adetokunbo Ademola Crescent • Terminal 01 & 02 Online
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-lg">
                    <div className="flex flex-col text-left sm:text-right">
                      <span className="font-label-md text-label-md font-bold text-text-primary">₦9,600 Base</span>
                      <span className="font-caption text-caption text-badge-discount-text">
                        30 vouchers/day cap
                      </span>
                    </div>
                    <span className="w-3 h-3 rounded-full bg-badge-discount-text flex-shrink-0" />
                  </div>
                </div>
                <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                  <div className="flex items-start gap-space-sm">
                    <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                      <Icon name="apartment" className="text-[20px]" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-label-md text-label-md font-semibold text-text-primary">
                          Maitama Heights Branch
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-[11px] font-medium">
                          +₦600 Surcharge
                        </span>
                      </div>
                      <span className="font-caption text-caption text-text-secondary">
                        Gana Street Rooftop • Terminal 01 Online
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-lg">
                    <div className="flex flex-col text-left sm:text-right">
                      <span className="font-label-md text-label-md font-bold text-text-primary">₦10,200 Tier</span>
                      <span className="font-caption text-caption text-text-secondary">20 vouchers/day cap</span>
                    </div>
                    <span className="w-3 h-3 rounded-full bg-badge-discount-text flex-shrink-0" />
                  </div>
                </div>
                <div className="p-space-md rounded-xl bg-surface-subtle opacity-60 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                  <div className="flex items-start gap-space-sm">
                    <div className="w-9 h-9 rounded-lg bg-surface-dim flex items-center justify-center text-text-tertiary flex-shrink-0 mt-0.5">
                      <Icon name="block" className="text-[20px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-semibold text-text-primary">
                        Garki Express Hub
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        Takeout only branch • Ineligible for dine-in promo
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-lg">
                    <span className="font-caption text-caption text-text-tertiary">Deactivated</span>
                    <span className="w-3 h-3 rounded-full bg-outline-variant flex-shrink-0" />
                  </div>
                </div>
              </div>
              <div className="pt-space-2xs flex justify-end">
                <button
                  type="button"
                  onClick={onEditPricing}
                  className="font-label-md text-label-md font-semibold text-primary-container hover:underline flex items-center gap-1"
                >
                  <span>Edit Location Assignment & Pricing Matrix</span>
                  <Icon name="arrow_forward" className="text-[16px]" />
                </button>
              </div>
            </div>

            <div className="p-space-lg bg-surface-canvas rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center gap-space-xs">
                <Icon name="assignment" className="text-primary text-[20px]" />
                <h3 className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                  Customer Facing Copy & Terms
                </h3>
              </div>
              <div className="flex flex-col gap-space-sm">
                <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                    App Listing Headline & Pitch
                  </span>
                  <p className="font-body-md text-body-md text-text-secondary">
                    “Elevate your midday recharge with our 250g char-grilled Ribeye paired seamlessly with our chilled
                    house-pressed Passionfruit Mojito. Designed exclusively for fast executive dining.”
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                      Redemption Rules & Limitations
                    </span>
                    <ul className="list-disc list-inside text-text-secondary font-caption text-caption space-y-1">
                      <li>Valid for Dine-in only (no takeaways or box-ups).</li>
                      <li>Strictly 1 deal redemption per table / check.</li>
                      <li>Cannot be combined with Tuesday Happy Hour discounts.</li>
                      <li>Present VEMTAP wallet tap token before bill closing.</li>
                    </ul>
                  </div>
                  <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                      How to Claim (Consumer Flow)
                    </span>
                    <ol className="list-decimal list-inside text-text-secondary font-caption text-caption space-y-1">
                      <li>Claim deal on VEMTAP app to secure reservation token.</li>
                      <li>Visit Wuse II or Maitama branch between 12-5 PM.</li>
                      <li>Tap phone on the contactless POS counter reader.</li>
                      <li>Discount automatically deducted; settlement confirmed.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 flex flex-col gap-space-xl">
            <div className="p-space-lg bg-surface-canvas rounded-xl shadow-sm flex flex-col gap-space-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="rocket_launch" className="text-primary-container text-[22px]" />
                  <h3 className="font-heading-sm text-heading-sm text-text-primary font-semibold">Boost Telemetry</h3>
                </div>
                <span className="inline-flex items-center gap-1 font-caption text-caption text-primary font-bold px-2 py-0.5 rounded-full bg-surface-tint-blue">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Running
                </span>
              </div>
              <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption text-text-secondary">Current Radius Reach</span>
                  <span className="font-label-sm text-label-sm font-bold text-text-primary">5.0 km Urban Core</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption text-text-secondary">Active Impressions</span>
                  <span className="font-label-sm text-label-sm font-bold text-text-primary">14,280 diners</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption text-text-secondary">Tap-to-Claim Conversion</span>
                  <span className="font-label-sm text-label-sm font-bold text-badge-discount-text">71.0% Rate</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption text-text-secondary">Boost Time Remaining</span>
                  <span className="font-label-sm text-label-sm font-bold text-primary">2 Days 14 Hours</span>
                </div>
              </div>
              <button
                type="button"
                className="w-full h-[46px] rounded-xl bg-surface-subtle text-primary font-button-secondary text-button-secondary hover:bg-surface-tint-blue transition-colors flex items-center justify-center gap-1"
              >
                <Icon name="add_circle" className="text-[18px]" />
                <span>Extend Boost Duration</span>
              </button>
            </div>

            <div className="p-space-lg bg-surface-canvas rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="group" className="text-primary text-[20px]" />
                  <h3 className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                    Claimer Demographics
                  </h3>
                </div>
                <span className="font-caption text-caption text-text-secondary">Live Sample</span>
              </div>
              <div className="flex flex-col gap-space-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between font-caption text-caption">
                    <span className="font-medium text-text-primary">Corporate Lunch Diners</span>
                    <span className="font-bold text-primary">64% (82 Diners)</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary-container rounded-full" style={{ width: '64%' }} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between font-caption text-caption">
                    <span className="font-medium text-text-primary">Weekend Leisure Diners</span>
                    <span className="font-bold text-secondary">36% (46 Diners)</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: '36%' }} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
                <div className="p-space-sm rounded-xl bg-surface-subtle flex flex-col">
                  <span className="font-caption text-caption text-text-secondary">Repeat Visitors</span>
                  <span className="font-heading-sm text-heading-sm font-bold text-text-primary mt-1">58%</span>
                  <span className="font-caption text-[11px] text-badge-discount-text">Visited within 30 days</span>
                </div>
                <div className="p-space-sm rounded-xl bg-surface-subtle flex flex-col">
                  <span className="font-caption text-caption text-text-secondary">Avg. Party Size</span>
                  <span className="font-heading-sm text-heading-sm font-bold text-text-primary mt-1">3.2</span>
                  <span className="font-caption text-[11px] text-text-tertiary">Guests per claim token</span>
                </div>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-subtle flex items-center gap-space-xs text-caption font-caption text-text-secondary">
                <Icon name="insights" className="text-primary text-[18px]" />
                <span>
                  <strong>High Margin Upsell:</strong> 42% of parties ordering this combo add an appetizer or dessert
                  to their check.
                </span>
              </div>
            </div>

            <div className="p-space-lg bg-surface-canvas rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="contactless" className="text-primary text-[20px]" />
                  <h3 className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                    Counter Tap Terminal Sync
                  </h3>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text" />
              </div>
              <p className="font-caption text-caption text-text-secondary">
                VEMTAP contactless NFC pads automatically validate and close voucher claims when patron taps at check
                presentation.
              </p>
              <div className="flex flex-col gap-space-xs">
                <div className="p-space-sm rounded-xl bg-surface-subtle flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="wifi_tethering" className="text-badge-discount-text text-[18px]" />
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                        Wuse II - Terminal 01
                      </span>
                      <span className="font-caption text-[11px] text-text-secondary">Main Till • FW v4.2.1</span>
                    </div>
                  </div>
                  <span className="font-caption text-[11px] text-badge-discount-text font-semibold">
                    Online (Tap sync 8s ago)
                  </span>
                </div>
                <div className="p-space-sm rounded-xl bg-surface-subtle flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="wifi_tethering" className="text-badge-discount-text text-[18px]" />
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                        Wuse II - Terminal 02
                      </span>
                      <span className="font-caption text-[11px] text-text-secondary">Bar Section • FW v4.2.1</span>
                    </div>
                  </div>
                  <span className="font-caption text-[11px] text-primary font-bold">Redeemed 4m ago</span>
                </div>
                <div className="p-space-sm rounded-xl bg-surface-subtle flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="wifi_tethering" className="text-badge-discount-text text-[18px]" />
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                        Maitama - Terminal 01
                      </span>
                      <span className="font-caption text-[11px] text-text-secondary">Rooftop Cashier • FW v4.2.1</span>
                    </div>
                  </div>
                  <span className="font-caption text-[11px] text-badge-discount-text font-semibold">
                    Online (Tap sync 1m ago)
                  </span>
                </div>
              </div>
              <div className="p-space-xs rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-between font-caption text-caption px-space-sm">
                <span>Mesh protocol: Bluetooth LE + NFC Direct</span>
                <span className="font-semibold text-primary">Zero Latency</span>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-subtle flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <Icon name="help_center" className="text-text-secondary text-[20px]" />
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                    Need Campaign Advice?
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    Speak with Abuja Merchant Advisor
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onChat}
                className="text-primary-container font-label-sm text-label-sm font-semibold hover:underline"
              >
                Chat Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </MerchantWorkspaceChrome>
  );
}
