import { useState } from 'react';

interface AdminPlanConfigurationScreenProps {
  onNavigate: (path: string) => void;
}

type Currency = 'NGN' | 'USD';
type BillingCycle = 'monthly' | 'annual';

const TIER_DATA = [
  {
    id: 'free',
    name: 'Free',
    badge: 'Starter Tier',
    badgeColor: 'bg-slate-100 text-slate-600',
    ring: '',
    popular: false,
    priceMonthlyNGN: 0,
    priceAnnualNGN: 0,
    priceMonthlyUSD: 0,
    priceAnnualUSD: 0,
    branches: '1 Branch',
    staff: '3 Staff',
    skus: '25 SKUs',
    posFee: '2.5% POS Fee',
    discovery: '1.0× Discovery',
    extras: [],
    merchants: 910,
    merchantsPct: 23.7,
    barColor: 'bg-slate-400',
  },
  {
    id: 'silver',
    name: 'Silver',
    badge: 'Growth Tier',
    badgeColor: 'bg-slate-200 text-slate-700',
    ring: '',
    popular: false,
    priceMonthlyNGN: 18500,
    priceAnnualNGN: 188700,
    priceMonthlyUSD: 19,
    priceAnnualUSD: 190,
    branches: '3 Branches',
    staff: '10 Staff',
    skus: '150 SKUs',
    posFee: '2.0% POS Fee',
    discovery: '1.25× Boost',
    extras: ['1 Featured Deal/mo'],
    merchants: 1420,
    merchantsPct: 37.0,
    barColor: 'bg-slate-500',
  },
  {
    id: 'gold',
    name: 'Gold',
    badge: 'MOST POPULAR',
    badgeColor: 'bg-primary text-white',
    ring: 'ring-2 ring-primary',
    popular: true,
    priceMonthlyNGN: 45000,
    priceAnnualNGN: 459000,
    priceMonthlyUSD: 49,
    priceAnnualUSD: 499,
    branches: '10 Branches',
    staff: '35 Staff',
    skus: '1,000 SKUs',
    posFee: '1.5% POS Fee',
    discovery: '1.75× Priority',
    extras: ['Hardware Tripwires', '1h WhatsApp SLA'],
    merchants: 1186,
    merchantsPct: 30.9,
    barColor: 'bg-primary',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    badge: 'Enterprise Tier',
    badgeColor: 'bg-amber-100 text-amber-700',
    ring: '',
    popular: false,
    priceMonthlyNGN: 120000,
    priceAnnualNGN: 1224000,
    priceMonthlyUSD: 139,
    priceAnnualUSD: 1390,
    branches: 'Unlimited Branches',
    staff: 'Unlimited Staff',
    skus: 'Unlimited SKUs',
    posFee: '1.0% Floor (₦50 cap)',
    discovery: '2.5× Priority',
    extras: ['Dedicated AM', 'Quad-Eye Escrow API'],
    merchants: 324,
    merchantsPct: 8.4,
    barColor: 'bg-amber-500',
  },
];

const ENTITLEMENT_ROWS = [
  { feature: 'Geofence Radius', free: '500 m', silver: '2 km', gold: '10 km', platinum: 'Custom' },
  { feature: 'POS Terminal Quota', free: '1', silver: '3', gold: '10', platinum: 'Unlimited' },
  { feature: 'Multi-Cluster Search Indexing', free: '—', silver: '✓', gold: '✓', platinum: '✓ (Priority)' },
  { feature: 'Automated SMS/Push Broadcasts', free: '—', silver: '500/mo', gold: '5,000/mo', platinum: 'Unlimited' },
  { feature: 'API Webhook Access', free: '—', silver: 'Read-only', gold: 'Full CRUD', platinum: 'Full + Events' },
  { feature: 'Escrow Settlement Window', free: 'T+7', silver: 'T+3', gold: 'T+1', platinum: 'Same-Day' },
];

export function AdminPlanConfigurationScreen({ onNavigate: _onNavigate }: AdminPlanConfigurationScreenProps) {
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function getPrice(tier: typeof TIER_DATA[0]): string {
    if (tier.priceMonthlyNGN === 0) return 'Free';
    if (currency === 'NGN') {
      const v = cycle === 'monthly' ? tier.priceMonthlyNGN : tier.priceAnnualNGN;
      return `₦${v.toLocaleString()}`;
    } else {
      const v = cycle === 'monthly' ? tier.priceMonthlyUSD : tier.priceAnnualUSD;
      return `$${v.toLocaleString()}`;
    }
  }

  function getPriceLabel() {
    return cycle === 'monthly' ? '/mo' : '/yr';
  }

  return (
    <div className="space-y-6 max-w-[1600px] w-full mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-on-surface text-inverse-on-surface text-sm px-4 py-2.5 rounded-xl shadow-lg animate-pulse">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-base">layers</span>
            <span className="text-[10px] font-semibold tracking-widest text-primary uppercase">Tier Orchestration Engine</span>
            <span className="bg-surface-container text-on-surface-variant text-[10px] font-medium px-2 py-0.5 rounded-full">Policy Revision v4.19</span>
          </div>
          <h1 className="text-headline-xl font-bold text-on-surface">Plan Configuration &amp; Entitlements Governance</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Define tier pricing, feature entitlements, policy rules and gating controls for the merchant subscription ecosystem.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => showToast('Audit rate cards exported')}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-base">receipt_long</span>
            Audit Rate Cards
          </button>
          <button
            onClick={() => showToast('Enterprise tier creation flow opened')}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Create Enterprise Tier
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Currency Toggle */}
        <div className="flex items-center bg-surface-container border border-outline-variant rounded-xl p-1 gap-1">
          {(['NGN', 'USD'] as Currency[]).map(c => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${currency === c ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              {c === 'NGN' ? '₦ NGN' : '$ USD'}
            </button>
          ))}
        </div>
        {/* Billing Toggle */}
        <div className="flex items-center bg-surface-container border border-outline-variant rounded-xl p-1 gap-1">
          <button
            onClick={() => setCycle('monthly')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${cycle === 'monthly' ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setCycle('annual')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${cycle === 'annual' ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            Annual
            <span className="ml-1.5 bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Save 15%</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Enrolled Ecosystem */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Enrolled Ecosystem</p>
          <p className="text-3xl font-bold text-on-surface">3,840</p>
          <p className="text-xs text-on-surface-variant mb-3">Active merchants</p>
          <div className="w-full h-2 rounded-full overflow-hidden flex gap-0.5">
            <div className="h-full bg-slate-400 rounded-full" style={{ width: '23.7%' }} title="Free 910" />
            <div className="h-full bg-slate-500 rounded-full" style={{ width: '37%' }} title="Silver 1.4k" />
            <div className="h-full bg-primary rounded-full" style={{ width: '30.9%' }} title="Gold 1.1k" />
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '8.4%' }} title="Platinum 324" />
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-on-surface-variant">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />Free 23.7%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />Silver 37%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" />Gold 30.9%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Plat 8.4%</span>
          </div>
        </div>

        {/* MRR */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">MRR</p>
          <p className="text-3xl font-bold text-on-surface">{currency === 'NGN' ? '₦64.8M' : '$43.2K'}<span className="text-sm font-normal text-on-surface-variant">/mo</span></p>
          <p className="text-xs text-green-600 font-semibold mt-1">+14.2% MoM</p>
          <p className="text-xs text-on-surface-variant mt-1">ARR {currency === 'NGN' ? '₦777.6M' : '$518.4K'}</p>
        </div>

        {/* ARPU */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">ARPU</p>
          <p className="text-3xl font-bold text-on-surface">{currency === 'NGN' ? '₦22,100' : '$14.70'}</p>
          <p className="text-xs text-on-surface-variant mt-1">Per subscribed merchant</p>
          <p className="text-xs text-green-600 font-semibold mt-1">+8.5% Net Expansion</p>
        </div>

        {/* Plan Migration */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Plan Migration</p>
          <p className="text-3xl font-bold text-on-surface">98.6%</p>
          <p className="text-xs text-on-surface-variant mt-1">Net Tier Retention</p>
          <div className="flex gap-3 mt-2 text-xs">
            <span className="text-green-600 font-semibold">↑ 84 Upgrades</span>
            <span className="text-amber-600 font-semibold">↓ 6 Downgrades</span>
            <span className="text-slate-400">0 Churned</span>
          </div>
        </div>
      </div>

      {/* 4-Column Tier Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIER_DATA.map(tier => (
          <div
            key={tier.id}
            className={`bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 flex flex-col gap-3 relative ${tier.ring}`}
          >
            {tier.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </span>
            )}
            <div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${tier.badgeColor}`}>
                {tier.popular ? 'Gold' : tier.badge}
              </span>
              {!tier.popular && <p className="text-base font-bold text-on-surface mt-2">{tier.name}</p>}
              {tier.popular && <p className="text-base font-bold text-on-surface mt-2">Gold</p>}
            </div>
            <div>
              <p className="text-2xl font-bold text-on-surface">{getPrice(tier)}</p>
              {tier.priceMonthlyNGN > 0 && <p className="text-xs text-on-surface-variant">{getPriceLabel()}</p>}
              {tier.priceMonthlyNGN > 0 && cycle === 'monthly' && (
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Annual: {currency === 'NGN' ? `₦${tier.priceAnnualNGN.toLocaleString()}` : `$${tier.priceAnnualUSD.toLocaleString()}`}/yr
                </p>
              )}
            </div>
            <ul className="space-y-1 text-sm text-on-surface-variant flex-1">
              <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base text-green-500">check_circle</span>{tier.branches}</li>
              <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base text-green-500">check_circle</span>{tier.staff}</li>
              <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base text-green-500">check_circle</span>{tier.skus}</li>
              <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base text-green-500">check_circle</span>{tier.posFee}</li>
              <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base text-green-500">check_circle</span>{tier.discovery}</li>
              {tier.extras.map(e => (
                <li key={e} className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base text-primary">star</span>{e}</li>
              ))}
            </ul>
            <div className="flex items-center gap-1.5 mt-1 pt-3 border-t border-outline-variant">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: tier.barColor.replace('bg-', '') === tier.barColor ? '#94a3b8' : '' }}></span>
              <p className="text-xs text-on-surface-variant flex-1">{tier.merchants.toLocaleString()} merchants ({tier.merchantsPct}%)</p>
            </div>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => showToast(`Editing ${tier.name} tier gating...`)}
                className="flex-1 py-1.5 border border-outline-variant rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container transition-colors"
              >
                Edit Gating
              </button>
              <button
                onClick={() => showToast(`Viewing ${tier.merchants.toLocaleString()} ${tier.name} merchants...`)}
                className="flex-1 py-1.5 bg-secondary-container text-on-secondary-container rounded-lg text-xs font-medium hover:bg-secondary-container/70 transition-colors"
              >
                View ({tier.merchants.toLocaleString()})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Feature Entitlement Matrix (8 cols) */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
            <div>
              <h3 className="text-sm font-bold text-on-surface">Feature Entitlement Matrix</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Capability comparison across all subscription tiers</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => showToast('Bulk quota editor opened')}
                className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container transition-colors"
              >
                Bulk Quotas
              </button>
              <button
                onClick={() => showToast('Entitlement matrix committed')}
                className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                Commit Matrix
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-on-surface-variant">Feature</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-on-surface-variant">Free</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-on-surface-variant">Silver</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-primary bg-secondary-container/20">Gold</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-on-surface-variant">Platinum</th>
                </tr>
              </thead>
              <tbody>
                {ENTITLEMENT_ROWS.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-outline-variant/50 ${i % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low/30'}`}>
                    <td className="px-5 py-3 text-xs font-medium text-on-surface">{row.feature}</td>
                    <td className="px-3 py-3 text-xs text-center text-on-surface-variant">{row.free}</td>
                    <td className="px-3 py-3 text-xs text-center text-on-surface-variant">{row.silver}</td>
                    <td className="px-3 py-3 text-xs text-center text-primary font-semibold bg-secondary-container/10">{row.gold}</td>
                    <td className="px-3 py-3 text-xs text-center text-on-surface-variant">{row.platinum}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-outline-variant flex items-center justify-between">
            <p className="text-[11px] text-on-surface-variant">All entitlements are enforced at the API gateway layer. Changes take effect on the next billing cycle.</p>
            <button
              onClick={() => showToast('Entitlement matrix CSV downloaded')}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Download CSV
            </button>
          </div>
        </div>

        {/* Policy Rules (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Policy Toggles */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
            <h3 className="text-sm font-bold text-on-surface mb-1">Policy Rules</h3>
            <p className="text-xs text-on-surface-variant mb-4">Governance controls applied platform-wide</p>
            <div className="space-y-4">
              {[
                { label: '30-Day Failed Debit Grace', desc: 'Allow merchants a grace window before suspension', default: true },
                { label: 'Downgrade SKU Suppression', desc: 'Hide excess SKUs rather than delete on downgrade', default: true },
                { label: 'Quad-Eye Waiver Mandate', desc: 'Require dual-authorizer sign-off on plan waivers', default: false },
              ].map(policy => (
                <PolicyToggle key={policy.label} label={policy.label} desc={policy.desc} defaultOn={policy.default} onToast={showToast} />
              ))}
            </div>
            <button
              onClick={() => showToast('Opening governance audit trail...')}
              className="mt-4 w-full py-2 border border-outline-variant rounded-xl text-xs font-medium text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">manage_history</span>
              View Governance Audit Trail
            </button>
          </div>

          {/* Smart POS Firmware Sync */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-base">memory</span>
              <h3 className="text-sm font-bold text-on-surface">Smart POS Firmware Sync</h3>
            </div>
            <div className="space-y-2 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Current Firmware</span>
                <span className="font-semibold text-on-surface">v3.8.4</span>
              </div>
              <div className="flex justify-between">
                <span>Target Firmware</span>
                <span className="font-semibold text-green-600">v3.9.1</span>
              </div>
              <div className="flex justify-between">
                <span>Devices Pending</span>
                <span className="font-semibold text-amber-600">142 Devices</span>
              </div>
              <div className="flex justify-between">
                <span>Sync Window</span>
                <span className="font-semibold text-on-surface">02:00 – 04:00 WAT</span>
              </div>
            </div>
            <div className="mt-3 bg-surface-container rounded-lg p-2 text-[11px] text-on-surface-variant">
              Gold &amp; Platinum tiers get priority firmware updates. Free &amp; Silver scheduled T+3.
            </div>
            <button
              onClick={() => showToast('POS firmware sync triggered')}
              className="mt-3 w-full py-2 bg-surface-container border border-outline-variant rounded-xl text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">sync</span>
              Force Sync Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PolicyToggle({ label, desc, defaultOn, onToast }: { label: string; desc: string; defaultOn: boolean; onToast: (m: string) => void }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <p className="text-xs font-semibold text-on-surface">{label}</p>
        <p className="text-[11px] text-on-surface-variant mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => { setOn(v => !v); onToast(`${label} ${!on ? 'enabled' : 'disabled'}`); }}
        className={`relative flex-shrink-0 w-10 h-5.5 rounded-full transition-colors mt-0.5 ${on ? 'bg-primary' : 'bg-outline-variant'}`}
        style={{ height: '22px', width: '40px' }}
        role="switch"
        aria-checked={on}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-[18px]' : 'translate-x-0'}`}
          style={{ width: '18px', height: '18px', borderRadius: '50%' }}
        />
      </button>
    </div>
  );
}

