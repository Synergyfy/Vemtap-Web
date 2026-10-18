import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { MerchantPortalChrome } from './MerchantPortalChrome';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { downloadCsv } from '../../utils/exportCsv';
import { printKvTable, printReport } from '../../utils/printReport';
interface DesktopDealCreateLocationsScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onBack?: () => void;
  onReview?: () => void;
}
type DraftStatus = 'idle' | 'saving' | 'saved';
export function DesktopDealCreateLocationsScreen({
  onNav,
  onBack,
  onReview,
}: DesktopDealCreateLocationsScreenProps) {
  const [scope, setScope] = useState<'selected' | 'all'>('selected');
  const [branches, setBranches] = useState({ wuse: true, vi: true, garki: false });
  const [customPrice, setCustomPrice] = useState({ wuse: false, vi: true });
  const [gift, setGift] = useState(true);
  const [boost, setBoost] = useState(true);
  const [draftStatus, setDraftStatus] = useState<DraftStatus>('idle');
  const draftTimers = useRef<number[]>([]);
  useEffect(
    () => () => {
      draftTimers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );
  const handleSelectAll = () => setBranches((prev) => ({ ...prev, wuse: true, vi: true }));

  const MATRIX = [
    {
      branch: 'Wuse Branch',
      status: 'Live & Accepting',
      location: 'Central Area, Abuja, FCT',
      participating: branches.wuse,
      price: '₦9,600',
      pricingNote: 'Standard MSRP -20%',
      allocation: '50 vouchers',
      customPrice: customPrice.wuse ? 'Yes' : 'No',
    },
    {
      branch: 'Victoria Island Branch',
      status: 'Live & Accepting',
      location: 'Lagos Island, Lagos State',
      participating: branches.vi,
      price: '₦10,800',
      pricingNote: '+₦1,200 logistics surcharge (10% off Lagos MSRP)',
      allocation: '30 vouchers',
      customPrice: customPrice.vi ? 'Yes' : 'No',
    },
    {
      branch: 'Garki Branch',
      status: 'Renovation / Paused',
      location: 'Area 11, Garki, Abuja, FCT',
      participating: branches.garki,
      price: 'Excluded from active deal rotation',
      pricingNote: 'Auto-activates once reopening is confirmed',
      allocation: '—',
      customPrice: 'No',
    },
  ];

  const handleExportMatrix = () => {
    downloadCsv(
      'prime-lunch-combo-pricing-matrix.csv',
      ['Branch', 'Status', 'Location', 'Participating', 'Deal price', 'Pricing note', 'Weekly allocation', 'Custom price'],
      MATRIX.map((row) => [
        row.branch,
        row.status,
        row.location,
        row.participating ? 'Yes' : 'No',
        row.price,
        row.pricingNote,
        row.allocation,
        row.customPrice,
      ]),
    );
    printReport(
      'Prime Lunch Combo — Branch Participation & Pricing Matrix',
      `${printKvTable('Deal', [
        ['Deal', 'Prime Lunch Combo'],
        ['Base discount', '20% Off MSRP'],
        ['Standard deal price', '₦9,600 (MSRP ₦12,000)'],
        ['Schedule', 'Mon–Fri 12:00 PM – 4:00 PM • Valid 30 days'],
      ])}
       ${printKvTable(
         'Branch matrix',
         MATRIX.map(
           (row) =>
             [
               `${row.branch} — ${row.status}`,
               `${row.participating ? 'Participating' : 'Not participating'} • ${row.price} • ${row.allocation} • ${row.pricingNote}`,
             ] as [string, string],
         ),
       )}
       <p class="foot">A CSV copy of this matrix downloaded alongside the PDF.</p>`,
    );
  };

  const handleSaveDraft = () => {
    draftTimers.current.forEach((timer) => window.clearTimeout(timer));
    draftTimers.current = [];
    setDraftStatus('saving');
    draftTimers.current.push(window.setTimeout(() => setDraftStatus('saved'), 700));
    draftTimers.current.push(window.setTimeout(() => setDraftStatus('idle'), 2700));
  };
  const draftLabel =
    draftStatus === 'idle' ? 'Save Deal as Draft' : draftStatus === 'saving' ? 'Saving...' : 'Draft Saved ✓';
  const toggleClass =
    "w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-canvas after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-canvas after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container";
  return (
    <MerchantPortalChrome activeNav="business-deals" onNav={onNav}>
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none" />
        <div className="py-space-xl flex flex-col gap-space-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs flex-wrap font-caption text-caption text-text-secondary">
                <span className="hover:text-primary cursor-pointer transition-colors">Deals</span>
                <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
                <span className="hover:text-primary cursor-pointer transition-colors">Create New Deal</span>
                <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
                <span className="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-primary font-medium">
                  Step 2 of 3
                </span>
                <span className="text-text-primary font-medium">Locations & Pricing</span>
              </div>
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                Step 2 of 3: Location Assignment & Deal Pricing
              </h1>
              <p className="font-body-md text-body-md text-text-secondary max-w-2xl">
                Select participating branch outlets, set location-specific voucher pricing, adjust weekly allocations,
                and configure customer limits.
              </p>
            </div>
            <div className="flex items-center gap-space-sm bg-surface-canvas p-1.5 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] shrink-0 self-start md:self-auto">
              <div className="flex items-center gap-space-xs px-3 py-1.5 rounded-lg text-badge-discount-text bg-badge-discount-bg">
                <Icon name="check_circle" className="text-[18px]" />
                <span className="font-label-sm text-label-sm font-semibold">1. Strategy</span>
              </div>
              <span className="h-4 w-px bg-surface-variant" />
              <div className="flex items-center gap-space-xs px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container shadow-sm">
                <span className="w-5 h-5 rounded-full bg-surface-canvas text-primary flex items-center justify-center font-caption text-caption font-bold">
                  2
                </span>
                <span className="font-label-sm text-label-sm font-semibold">Locations & Matrix</span>
              </div>
              <span className="h-4 w-px bg-surface-variant" />
              <div className="flex items-center gap-space-xs px-3 py-1.5 rounded-lg text-text-tertiary">
                <span className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center font-caption text-caption">
                  3
                </span>
                <span className="font-label-sm text-label-sm font-medium">Launch Review</span>
              </div>
            </div>
          </div>
          <div className="bg-surface-canvas rounded-xl shadow-[0_4px_20px_-4px_rgba(13,37,76,0.04)] overflow-hidden">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-space-md lg:px-space-lg lg:py-space-md gap-space-md bg-gradient-to-r from-surface-tint-blue/80 via-surface-canvas to-surface-canvas">
              <div className="flex items-center gap-space-md">
                <div className="w-16 h-16 rounded-xl bg-surface-container-high shrink-0 overflow-hidden relative shadow-sm">
                  <img
                    className="w-full h-full object-cover"
                    alt="Plated gourmet lunch combo meal with grilled chicken, fragrant jollof rice, side plantains, and chilled hibiscus beverage styled inside a bright contemporary restaurant setting with warm ambient lighting"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD16jvdf5sQAvahFOCHEngG0zX5Nf-O__VRYpyzxyCS8QzS1P0j8A-yvMUVQUYx4arfKDqvZmrUkda9ZxYb4D-XBk0Pfa9-2Oa47qr36HJG5ODT5_xRbmmxCe3aigY3JDQrYZ5uRhZQRsKPQq6PrNzvKhOxv_qOxzGSZwx1UoYpAbhJlIoTyGK3Vzc6EzccxY1u0lwpTxcaGIMxt4lBl2hdTqUo7b2Us1wXGOzxmlEvH4mb29jIR-oe5A"
                  />
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                    -20%
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="font-heading-sm text-heading-sm text-text-primary">Prime Lunch Combo</span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-caption font-medium uppercase tracking-wide">
                      Draft Deal
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary flex items-center gap-space-2xs">
                    <Icon name="schedule" className="text-[16px] text-text-tertiary" />
                    <span>Mon–Fri 12:00 PM – 4:00 PM • Base Deal Valid 30 Days</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-space-lg lg:border-l lg:border-surface-variant lg:pl-space-lg">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider">
                    Base Discount
                  </span>
                  <span className="font-heading-sm text-heading-sm text-badge-discount-text font-semibold">
                    20% Off MSRP
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider">
                    Standard Deal Price
                  </span>
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-heading-md text-heading-md text-text-primary font-bold">₦9,600</span>
                    <span className="font-caption text-caption text-text-tertiary line-through">₦12,000</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider">
                    Customer Savings
                  </span>
                  <span className="font-label-md text-label-md text-primary font-semibold">Save ₦2,400</span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
            <div className="lg:col-span-8 flex flex-col gap-space-xl">
              <div className="bg-surface-canvas rounded-xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-7 h-7 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center font-label-sm text-label-sm font-bold">
                      1
                    </span>
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">
                      Where is this deal available?
                    </h2>
                  </div>
                  <span className="font-caption text-caption text-text-tertiary">Scope assignment</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  <label
                    className={`relative flex flex-col p-space-md rounded-xl cursor-pointer transition-all shadow-sm ${
                      scope === 'selected' ? 'bg-surface-tint-blue' : 'bg-surface-subtle'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-space-xs">
                        <Icon name="store" className="text-primary text-[22px]" />
                        <span className="font-label-md text-label-md text-text-primary font-semibold">
                          Selected locations only
                        </span>
                      </div>
                      <input
                        className="w-4 h-4 text-primary accent-primary mt-1"
                        name="deal-scope"
                        type="radio"
                        value="selected"
                        checked={scope === 'selected'}
                        onChange={() => setScope('selected')}
                      />
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-space-xs leading-relaxed">
                      Specify which branches honor this voucher and adjust branch-level promotional pricing & volume
                      caps.
                    </p>
                    <div className="mt-space-sm pt-space-xs flex items-center gap-1.5 text-primary font-caption text-caption font-medium">
                      <Icon name="tune" className="text-[16px]" />
                      <span>Custom Pricing Matrix Active</span>
                    </div>
                  </label>
                  <label
                    className={`relative flex flex-col p-space-md rounded-xl cursor-pointer transition-all ${
                      scope === 'all'
                        ? 'bg-surface-tint-blue shadow-sm'
                        : 'bg-surface-subtle hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-space-xs">
                        <Icon name="domain_add" className="text-text-secondary text-[22px]" />
                        <span className="font-label-md text-label-md text-text-primary font-semibold">
                          All locations (Current & future)
                        </span>
                      </div>
                      <input
                        className="w-4 h-4 text-primary accent-primary mt-1"
                        name="deal-scope"
                        type="radio"
                        value="all"
                        checked={scope === 'all'}
                        onChange={() => setScope('all')}
                      />
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-space-xs leading-relaxed">
                      Deal is universally redeemable across all present and incoming branches automatically with
                      baseline values.
                    </p>
                    <div className="mt-space-sm pt-space-xs flex items-center gap-1.5 text-text-tertiary font-caption text-caption">
                      <Icon name="sync" className="text-[16px]" />
                      <span>Auto-sync new openings</span>
                    </div>
                  </label>
                </div>
              </div>
              <div className="bg-surface-canvas rounded-xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-7 h-7 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center font-label-sm text-label-sm font-bold">
                      2
                    </span>
                    <div>
                      <h2 className="font-heading-sm text-heading-sm text-text-primary">
                        Branch Participation & Pricing Matrix
                      </h2>
                      <span className="font-caption text-caption text-text-secondary">
                        3 registered outlets configured
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-sm self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container font-label-sm text-label-sm text-primary font-medium transition-colors"
                    >
                      Select All Active (2)
                    </button>
                    <button
                      type="button"
                      title="Export matrix specs"
                      onClick={handleExportMatrix}
                      className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container-low transition-colors"
                    >
                      <Icon name="download" className="text-[20px]" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-space-md">
                  <div className="bg-surface-subtle hover:bg-surface-container-low/70 rounded-xl p-space-md transition-all shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                      <div className="flex items-start gap-space-sm">
                        <div className="pt-0.5">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              className="sr-only peer"
                              type="checkbox"
                              checked={branches.wuse}
                              onChange={() => setBranches((prev) => ({ ...prev, wuse: !prev.wuse }))}
                            />
                            <div className={toggleClass} />
                          </label>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-space-xs flex-wrap">
                            <span className="font-label-md text-label-md text-text-primary font-bold">
                              Wuse Branch
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-surface-container text-text-primary font-caption text-caption font-semibold">
                              HQ
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                              Live & Accepting
                            </span>
                          </div>
                          <span className="font-caption text-caption text-text-secondary">
                            Central Area, Abuja, FCT • Point-of-Sale Terminal #102 Active
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-space-lg self-end md:self-auto">
                        <div className="flex flex-col text-right">
                          <span className="font-caption text-caption text-text-tertiary">Deal Price</span>
                          <span className="font-label-md text-label-md text-text-primary font-bold">₦9,600</span>
                          <span className="font-caption text-caption text-badge-discount-text">
                            Standard MSRP -20%
                          </span>
                        </div>
                        <span className="h-8 w-px bg-surface-variant hidden sm:block" />
                        <div className="flex flex-col text-right">
                          <span className="font-caption text-caption text-text-tertiary">Weekly Allocation</span>
                          <div className="flex items-center gap-1 justify-end">
                            <input
                              className="w-16 h-8 text-center bg-surface-canvas rounded-lg font-label-sm text-label-sm font-semibold text-text-primary outline-none focus:ring-2 focus:ring-primary-container"
                              max={500}
                              min={5}
                              type="number"
                              defaultValue={50}
                            />
                            <span className="font-caption text-caption text-text-secondary">vouchers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-space-sm pt-space-xs flex flex-wrap items-center justify-between gap-space-xs">
                      <label className="flex items-center gap-space-xs cursor-pointer text-text-secondary hover:text-text-primary">
                        <input
                          className="w-4 h-4 rounded text-primary accent-primary"
                          type="checkbox"
                          checked={customPrice.wuse}
                          onChange={() => setCustomPrice((prev) => ({ ...prev, wuse: !prev.wuse }))}
                        />
                        <span className="font-caption text-caption font-medium">
                          Use different price for this location
                        </span>
                      </label>
                      <span className="font-caption text-caption text-text-tertiary">
                        Inheriting base discount structure
                      </span>
                    </div>
                  </div>
                  <div className="bg-surface-tint-blue/50 rounded-xl p-space-md transition-all shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                      <div className="flex items-start gap-space-sm">
                        <div className="pt-0.5">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              className="sr-only peer"
                              type="checkbox"
                              checked={branches.vi}
                              onChange={() => setBranches((prev) => ({ ...prev, vi: !prev.vi }))}
                            />
                            <div className={toggleClass} />
                          </label>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-space-xs flex-wrap">
                            <span className="font-label-md text-label-md text-text-primary font-bold">
                              Victoria Island Branch
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                              Live & Accepting
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-caption text-caption font-semibold">
                              Tier 1 Coastal
                            </span>
                          </div>
                          <span className="font-caption text-caption text-text-secondary">
                            Lagos Island, Lagos State • Point-of-Sale Terminal #409 Active
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-space-lg self-end md:self-auto">
                        <div className="flex flex-col text-right">
                          <span className="font-caption text-caption text-text-tertiary">Branch Deal Price</span>
                          <div className="flex items-baseline gap-1 justify-end">
                            <span className="font-label-md text-label-md text-text-primary font-bold">₦10,800</span>
                          </div>
                          <span className="font-caption text-caption text-tertiary font-medium">
                            +₦1,200 Logistics Surcharge
                          </span>
                        </div>
                        <span className="h-8 w-px bg-surface-variant hidden sm:block" />
                        <div className="flex flex-col text-right">
                          <span className="font-caption text-caption text-text-tertiary">Weekly Allocation</span>
                          <div className="flex items-center gap-1 justify-end">
                            <input
                              className="w-16 h-8 text-center bg-surface-canvas rounded-lg font-label-sm text-label-sm font-semibold text-text-primary outline-none focus:ring-2 focus:ring-primary-container"
                              max={500}
                              min={5}
                              type="number"
                              defaultValue={30}
                            />
                            <span className="font-caption text-caption text-text-secondary">vouchers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-space-sm pt-space-xs flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs bg-surface-canvas/80 p-2.5 rounded-lg">
                      <label className="flex items-center gap-space-xs cursor-pointer text-text-primary">
                        <input
                          className="w-4 h-4 rounded text-primary accent-primary"
                          type="checkbox"
                          checked={customPrice.vi}
                          onChange={() => setCustomPrice((prev) => ({ ...prev, vi: !prev.vi }))}
                        />
                        <span className="font-label-sm text-label-sm font-semibold text-primary">
                          Use different price for selected location
                        </span>
                      </label>
                      {customPrice.vi && (
                        <div className="flex items-center gap-space-sm">
                          <span className="font-caption text-caption text-text-secondary">Set Custom Amount:</span>
                          <div className="relative flex items-center">
                            <span className="absolute left-2.5 font-label-sm text-label-sm text-text-secondary font-bold">
                              ₦
                            </span>
                            <input
                              className="pl-6 pr-3 py-1 w-28 bg-surface-canvas rounded-md font-label-sm text-label-sm font-bold text-text-primary outline-none ring-1 ring-primary focus:ring-2"
                              type="text"
                              defaultValue="10,800"
                            />
                          </div>
                          <span className="font-caption text-caption text-badge-discount-text font-medium">
                            (10% off Lagos MSRP)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-surface-subtle/50 opacity-80 rounded-xl p-space-md transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                      <div className="flex items-start gap-space-sm">
                        <div className="pt-0.5">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              className="sr-only peer"
                              type="checkbox"
                              checked={branches.garki}
                              onChange={() => setBranches((prev) => ({ ...prev, garki: !prev.garki }))}
                            />
                            <div className={toggleClass} />
                          </label>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-space-xs flex-wrap">
                            <span className="font-label-md text-label-md text-text-secondary font-bold">
                              Garki Branch
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-caption font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
                              Renovation / Paused
                            </span>
                          </div>
                          <span className="font-caption text-caption text-text-tertiary">
                            Area 11, Garki, Abuja, FCT • Scheduled completion Q2 2025
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-space-xs self-start md:self-auto text-text-tertiary">
                        <Icon name="pause_circle" className="text-[18px]" />
                        <span className="font-caption text-caption italic">
                          Excluded from active deal rotation
                        </span>
                      </div>
                    </div>
                    <div className="mt-space-sm pt-space-xs flex items-center gap-space-xs text-text-secondary bg-surface-container-low px-3 py-2 rounded-lg">
                      <Icon name="info" className="text-[18px] text-primary" />
                      <span className="font-caption text-caption">
                        Deal will automatically activate here once branch reopening is confirmed on your Merchant
                        Profile.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-surface-canvas rounded-xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-lg">
                <div className="flex items-center gap-space-xs">
                  <span className="w-7 h-7 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center font-label-sm text-label-sm font-bold">
                    3
                  </span>
                  <div>
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">
                      Redemption, Customer Limits & Boost Options
                    </h2>
                    <span className="font-caption text-caption text-text-secondary">
                      Control redemption velocity and organic discovery incentives
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-subtle">
                  <div className="flex items-start gap-space-sm max-w-md">
                    <Icon name="verified_user" className="text-primary text-[24px]" />
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-text-primary font-semibold">
                        Customer Claim Limit
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        Cap per unique VEMTAP consumer wallet ID to prevent voucher hoarding and encourage new
                        customer acquisition.
                      </span>
                    </div>
                  </div>
                  <div className="relative min-w-[180px]">
                    <select
                      className="w-full h-11 pl-3 pr-8 bg-surface-canvas rounded-lg font-label-md text-label-md text-text-primary appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary shadow-sm font-medium"
                      defaultValue="1 per day (Recommended)"
                    >
                      <option>1 per day (Recommended)</option>
                      <option>1 per week</option>
                      <option>2 total per campaign</option>
                      <option>Unlimited claims</option>
                    </select>
                    <Icon
                      name="expand_more"
                      className="text-[20px] text-text-tertiary absolute right-2.5 top-2.5 pointer-events-none"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-subtle">
                  <div className="flex items-start gap-space-sm">
                    <Icon name="featured_seasonal_and_gifts" className="text-badge-discount-text text-[24px]" />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-label-md text-label-md text-text-primary font-semibold">
                          Gift to Friends & Family
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                          Viral Enabler
                        </span>
                      </div>
                      <span className="font-caption text-caption text-text-secondary mt-0.5">
                        Allow customers to claim and send this deal to someone else as a digital gift voucher with
                        personalized note.
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      className="sr-only peer"
                      type="checkbox"
                      checked={gift}
                      onChange={() => setGift((prev) => !prev)}
                    />
                    <div className={toggleClass} />
                  </label>
                </div>
                <div className="flex items-center justify-between gap-space-md p-space-md rounded-xl bg-gradient-to-r from-surface-tint-blue via-surface-canvas to-surface-subtle shadow-sm">
                  <div className="flex items-start gap-space-sm">
                    <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 shadow-sm">
                      <Icon name="rocket_launch" className="text-[20px]" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <span className="font-label-md text-label-md text-text-primary font-bold">
                          Boost on Launch
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-caption text-caption font-semibold">
                          Recommended
                        </span>
                      </div>
                      <span className="font-caption text-caption text-text-secondary mt-0.5">
                        Instantly feature this deal to 1,500+ foodies within 5km radius upon publication via VEMTAP
                        Nearby Feed.
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      className="sr-only peer"
                      type="checkbox"
                      checked={boost}
                      onChange={() => setBoost((prev) => !prev)}
                    />
                    <div className={toggleClass} />
                  </label>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-space-lg">
              <div className="bg-surface-canvas rounded-xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-md sticky top-20">
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                    Weekly Yield Forecast
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                    Healthy Margin
                  </span>
                </div>
                <div className="flex flex-col gap-space-xs pt-space-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="font-body-md text-body-md text-text-secondary">Total Weekly Allocation</span>
                    <span className="font-heading-sm text-heading-sm text-text-primary font-bold">80 Vouchers</span>
                  </div>
                  <div className="flex items-baseline justify-between text-text-secondary">
                    <span className="font-caption text-caption">Active Outlets</span>
                    <span className="font-label-sm text-label-sm font-medium text-text-primary">
                      2 of 3 Branches
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-text-secondary">
                    <span className="font-caption text-caption">Weighted Avg. Deal Price</span>
                    <span className="font-label-sm text-label-sm font-medium text-text-primary">₦10,050</span>
                  </div>
                </div>
                <div className="bg-surface-subtle rounded-xl p-space-md flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                      Allocation by Branch
                    </span>
                    <span className="font-caption text-caption text-text-tertiary">Max 80/wk</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-surface-variant flex overflow-hidden">
                    <div
                      className="h-full bg-primary-container transition-all"
                      style={{ width: '62.5%' }}
                      title="Wuse: 50 vouchers (62.5%)"
                    />
                    <div
                      className="h-full bg-secondary transition-all"
                      style={{ width: '37.5%' }}
                      title="Victoria Island: 30 vouchers (37.5%)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-space-xs pt-1 font-caption text-caption">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-primary-container" />
                      <span className="text-text-secondary">Wuse (50)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-secondary" />
                      <span className="text-text-secondary">VI Lagos (30)</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 p-space-md rounded-xl bg-surface-container-low">
                  <span className="font-caption text-caption text-text-tertiary uppercase tracking-wide">
                    Est. Gross Weekly Volume
                  </span>
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-heading-md text-heading-md text-text-primary font-bold">₦804,000</span>
                    <span className="font-caption text-caption text-text-secondary">/ week</span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary leading-tight mt-1">
                    Projected incremental revenue assuming 100% voucher claim and standard 92% walk-in redemption
                    rate.
                  </p>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold">
                      Active Catchment Map
                    </span>
                    <span className="font-caption text-caption text-primary">Abuja & Lagos</span>
                  </div>
                  <div
                    className="w-full h-40 bg-cover bg-center rounded-xl overflow-hidden relative shadow-sm"
                    data-location="Abuja, Nigeria"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDGvyeqrEoVT-RrCFkFOb0Az2XPDCrWdv8qezuQkqTNgjtQ38RShxab6Znc-owhP2R9rU6SUXmCzPAPdGfshV6XksZFO6-Nwh3GAD1_MtxUOzxcwpccLRARssCA4t2cet4GL53x-TAIlC4D918bqs6wOsDv0QccnK7S6h3-yil28WSYOEl7XsTP0Olv7NKhN0IjniV2Hs6tH06_373tYnHdQro_SbSobwfCX6YeB1892htK3xmYgZr60Q')",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/60 to-transparent flex items-end p-space-sm">
                      <div className="flex items-center gap-1.5 text-on-secondary font-caption text-caption">
                        <Icon name="share_location" className="text-[16px] text-primary-fixed" />
                        <span className="font-medium">2 Active Zones • 5km Proximity Geofence</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm flex items-center gap-space-sm">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high overflow-hidden shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      alt="Modern smartphone screen display mock showcasing VEMTAP consumer app deal card with 20% discount tag and active redeem button"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVcmyJ_fTfkcgchKNkeJIUcQx1udIhFE4NIdXbYCZVFSkNm_6DzW9QfYXrLG1rj4EawfpmXupzLDV4x36p1OYyp19TclxH5jwhLwfQAY7ZJ7VzQV36KTdjw88vFq0RwnurPQeNL4r2u_HO7k6Pw667kRnZRtHxgJjWinFy0X4otsGpxMFyExG0NiAtU3uAhXmUUNpxg4vNaN73M-3jlhlaMffa47o7BZFD7OmIPEhhpSJtk2eVumJyyQ"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-caption text-caption text-text-tertiary">Customer App Preview</span>
                    <span className="font-label-sm text-label-sm text-text-primary font-bold truncate">
                      ₦9,600 • 2 Outlets Honoring
                    </span>
                    <span className="font-caption text-caption text-primary flex items-center gap-0.5">
                      <span>View client card</span>
                      <Icon name="arrow_outward" className="text-[14px]" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-surface-canvas/95 backdrop-blur-md rounded-xl p-space-md shadow-[0_8px_24px_-4px_rgba(17,24,39,0.08)] flex flex-col sm:flex-row items-center justify-between gap-space-md sticky bottom-4 z-40">
            <div className="flex items-center gap-space-md w-full sm:w-auto justify-between sm:justify-start">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary font-label-md text-label-md transition-colors py-2 px-3 rounded-lg hover:bg-surface-container-low"
              >
                <Icon name="arrow_back" className="text-[18px]" />
                <span>Back to Step 1: Discount Strategy</span>
              </button>
              <span className="h-5 w-px bg-surface-variant hidden sm:block" />
              <button
                type="button"
                onClick={handleSaveDraft}
                className={`font-label-md text-label-md transition-colors underline-offset-4 hover:underline py-2 ${
                  draftStatus === 'saved' ? 'text-badge-discount-text' : 'text-text-secondary hover:text-primary'
                }`}
              >
                {draftLabel}
              </button>
            </div>
            <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
              <div className="hidden md:flex flex-col text-right">
                <span className="font-caption text-caption text-text-tertiary">Step 2 Complete</span>
                <span className="font-label-sm text-label-sm text-text-primary font-semibold">
                  2 Branches Configured
                </span>
              </div>
              <button
                type="button"
                onClick={onReview}
                className="w-full sm:w-auto px-space-lg h-[52px] rounded-xl bg-primary-container text-on-primary-container hover:bg-primary font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs"
              >
                <span>Review & Launch Deal</span>
                <Icon name="arrow_forward" className="text-[20px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MerchantPortalChrome>
  );
}