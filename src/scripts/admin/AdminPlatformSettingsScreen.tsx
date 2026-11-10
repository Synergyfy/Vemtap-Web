import { useEffect, useState } from 'react';
import { hasApiConfig } from '../../services/api/client';
import { adminService, type AdminPlatformParameters } from '../../services/adminService';
import { adminErrorMessage, useAdminAction, useAdminPlatformSettings } from './useAdminData';

/** The page's starting values; "Reset Defaults" puts these back into the form. */
const DEFAULTS: AdminPlatformParameters = {
  platformCurrencySymbol: '₦ (NGN)',
  platformVatRate: 7.5,
  withholdingTaxRate: 5,
  defaultPosTakeRate: 1.5,
  escrowHoldingHours: 24,
  defaultGeofenceRadiusMeters: 2000,
  maxClustersPerMerchant: 10,
  nfcHeartbeatIntervalSec: 45,
  maintenanceMode: false,
  strictKybGate: true,
  dualAuthorizerEscrow: true,
  autoDunningActive: true,
  smsGatewayFallback: true,
  realtimeTelemetryRateLimit: false,
};

interface AdminPlatformSettingsScreenProps {
  onNavigate: (path: string) => void;
}

export function AdminPlatformSettingsScreen({ onNavigate: _onNavigate }: AdminPlatformSettingsScreenProps) {
  // Global Platform Parameters
  const [currencySymbol, setCurrencySymbol] = useState('₦ (NGN)');
  const [platformVatRate, setPlatformVatRate] = useState('7.5');
  const [whtRate, setWhtRate] = useState('5.0');
  const [defaultPosTakeRate, setDefaultPosTakeRate] = useState('1.5');
  const [escrowHoldingHours, setEscrowHoldingHours] = useState('24');
  
  // Geofencing & Cluster Governance
  const [defaultGeofenceRadiusMeters, setDefaultGeofenceRadiusMeters] = useState('2000');
  const [maxClustersPerMerchant, setMaxClustersPerMerchant] = useState('10');
  const [nfcHeartbeatIntervalSec, setNfcHeartbeatIntervalSec] = useState('45');
  
  // Governance & Security Toggles
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [strictKybGate, setStrictKybGate] = useState(true);
  const [dualAuthorizerEscrow, setDualAuthorizerEscrow] = useState(true);
  const [autoDunningActive, setAutoDunningActive] = useState(true);
  const [smsGatewayFallback, setSmsGatewayFallback] = useState(true);
  const [realtimeTelemetryRateLimit, setRealtimeTelemetryRateLimit] = useState(false);

  // Notice Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Live API: load the stored parameters into the form; "Deploy Changes" saves them.
  const live = hasApiConfig();
  const settingsQuery = useAdminPlatformSettings();
  const saveSettings = useAdminAction((input: Partial<AdminPlatformParameters>) => adminService.updatePlatformSettings(input));
  const fill = (v: AdminPlatformParameters) => {
    setCurrencySymbol(v.platformCurrencySymbol);
    setPlatformVatRate(String(v.platformVatRate));
    setWhtRate(String(v.withholdingTaxRate));
    setDefaultPosTakeRate(String(v.defaultPosTakeRate));
    setEscrowHoldingHours(String(v.escrowHoldingHours));
    setDefaultGeofenceRadiusMeters(String(v.defaultGeofenceRadiusMeters));
    setMaxClustersPerMerchant(String(v.maxClustersPerMerchant));
    setNfcHeartbeatIntervalSec(String(v.nfcHeartbeatIntervalSec));
    setMaintenanceMode(v.maintenanceMode);
    setStrictKybGate(v.strictKybGate);
    setDualAuthorizerEscrow(v.dualAuthorizerEscrow);
    setAutoDunningActive(v.autoDunningActive);
    setSmsGatewayFallback(v.smsGatewayFallback);
    setRealtimeTelemetryRateLimit(v.realtimeTelemetryRateLimit);
  };
  useEffect(() => {
    if (settingsQuery.data) fill({ ...DEFAULTS, ...settingsQuery.data });
    // Refill only when a fresh copy arrives from the server.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsQuery.data]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!live) {
      showToast('Platform configuration synchronized to all edge servers and ledger nodes.');
      return;
    }
    const num = (value: string) => Number(value);
    const input: Partial<AdminPlatformParameters> = {
      platformCurrencySymbol: currencySymbol.trim(),
      platformVatRate: num(platformVatRate),
      withholdingTaxRate: num(whtRate),
      defaultPosTakeRate: num(defaultPosTakeRate),
      escrowHoldingHours: Math.round(num(escrowHoldingHours)),
      defaultGeofenceRadiusMeters: Math.round(num(defaultGeofenceRadiusMeters)),
      maxClustersPerMerchant: Math.round(num(maxClustersPerMerchant)),
      nfcHeartbeatIntervalSec: Math.round(num(nfcHeartbeatIntervalSec)),
      maintenanceMode,
      strictKybGate,
      dualAuthorizerEscrow,
      autoDunningActive,
      smsGatewayFallback,
      realtimeTelemetryRateLimit,
    };
    const bad = Object.entries(input).find(([, v]) => typeof v === 'number' && !Number.isFinite(v));
    if (bad) {
      setSaveError(`Enter a number for ${bad[0]}.`);
      return;
    }
    setSaveError(null);
    saveSettings.mutate(input, {
      onSuccess: () => showToast('Platform settings saved.'),
      onError: (error) => setSaveError(adminErrorMessage(error)),
    });
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-sm">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}
      {saveError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center justify-between">
          <span>{saveError}</span>
          <button type="button" onClick={() => setSaveError(null)} className="text-red-600 font-semibold">
            Dismiss
          </button>
        </div>
      )}
      {live && settingsQuery.isError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">
          Couldn't load platform settings: {adminErrorMessage(settingsQuery.error)}
        </div>
      )}

      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-200 font-semibold tracking-wider uppercase mb-1">
            <span className="material-symbols-outlined text-sm">tune</span>
            <span>{live ? 'Global Platform Parameters' : 'Global Runtime Governance // Core Engine v4.2'}</span>
          </div>
          <h2 className="text-lg font-bold">Platform Configuration & System Preferences</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {live
              ? settingsQuery.data?.updatedAt
                ? `Last saved ${new Date(settingsQuery.data.updatedAt).toLocaleString()}.`
                : 'Loading…'
              : 'Parameters applied across all payment rails, NFC POS edge fleets, and merchant clusters.'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (live) {
                fill(DEFAULTS);
                showToast('Defaults loaded into the form — Deploy Changes to save them.');
                return;
              }
              showToast('Configuration reset to cluster defaults.');
            }}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
          >
            Reset Defaults
          </button>
          <button
            type="submit"
            disabled={live && (saveSettings.isPending || !settingsQuery.data)}
            className="disabled:opacity-50 px-4 py-2 rounded-xl text-xs font-bold bg-[#066cf4] hover:bg-blue-600 text-white transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            <span>Deploy Changes</span>
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Fiscal, Escrow & Payment Rates */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="material-symbols-outlined text-[#0055c4] text-lg">account_balance</span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Fiscal Policy, Escrow & Settlement Rates</h3>
              <p className="text-xs text-slate-500">Statutory deductions, default POS take rates, and holding periods.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Primary Settlement Currency</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={e => setCurrencySymbol(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-[#0055c4] focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default currency for consumer wallets & invoices</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Statutory VAT Rate (%)</label>
              <input
                type="text"
                value={platformVatRate}
                onChange={e => setPlatformVatRate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-[#0055c4] focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">FIRS mandatory 7.5% transaction levy</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Withholding Tax (WHT %)</label>
              <input
                type="text"
                value={whtRate}
                onChange={e => setWhtRate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-[#0055c4] focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Applicable to B2B settlement sweeps</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Default POS Platform Take Rate (%)</label>
              <input
                type="text"
                value={defaultPosTakeRate}
                onChange={e => setDefaultPosTakeRate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-[#0055c4] focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Baseline commission before tier overrides</span>
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Escrow Cooling Period (Hours)</label>
              <input
                type="text"
                value={escrowHoldingHours}
                onChange={e => setEscrowHoldingHours(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-[#0055c4] focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Duration deal redemption funds stay in escrow before automatic batch clearing</span>
            </div>
          </div>
        </div>

        {/* Card 2: Geofencing, Clusters & Fleet Governance */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="material-symbols-outlined text-[#0055c4] text-lg">radar</span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Spatial Geofencing & Cluster Governance</h3>
              <p className="text-xs text-slate-500">Limits for discovery bounds, multi-cluster mapping and telemetry.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Default Discovery Radius (Meters)</label>
              <input
                type="text"
                value={defaultGeofenceRadiusMeters}
                onChange={e => setDefaultGeofenceRadiusMeters(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-[#0055c4] focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Standard proximity trigger boundary</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Max Clusters Per Merchant</label>
              <input
                type="text"
                value={maxClustersPerMerchant}
                onChange={e => setMaxClustersPerMerchant(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-[#0055c4] focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Prevents multi-cluster spam indexing</span>
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">NFC POS Heartbeat Interval (Seconds)</label>
              <input
                type="text"
                value={nfcHeartbeatIntervalSec}
                onChange={e => setNfcHeartbeatIntervalSec(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-[#0055c4] focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Frequency terminal transmits battery, signal and tamper integrity pings</span>
            </div>
          </div>
        </div>

        {/* Card 3: Governance Policies & Kill Switches */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="material-symbols-outlined text-[#0055c4] text-lg">policy</span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Security Gateways & Operational Switches</h3>
              <p className="text-xs text-slate-500">
                {live
                  ? 'Saved for the platform; the backend does not act on these switches yet.'
                  : 'Platform-wide guardrails enforced at API and gateway layers.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-900">Strict KYB Verification Gate</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Block deal publishing and payouts until CAC & Director BVN are verified.</p>
              </div>
              <input
                type="checkbox"
                checked={strictKybGate}
                onChange={e => setStrictKybGate(e.target.checked)}
                className="w-4 h-4 text-[#0055c4] rounded mt-0.5"
              />
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-900">Quad-Eye Escrow Authorization</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Require dual admin approval on manual escrow overrides &gt; ₦250k.</p>
              </div>
              <input
                type="checkbox"
                checked={dualAuthorizerEscrow}
                onChange={e => setDualAuthorizerEscrow(e.target.checked)}
                className="w-4 h-4 text-[#0055c4] rounded mt-0.5"
              />
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-900">Auto Dunning & Retry Cycle</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Attempt failed card debits 3 times across a 7-day grace period.</p>
              </div>
              <input
                type="checkbox"
                checked={autoDunningActive}
                onChange={e => setAutoDunningActive(e.target.checked)}
                className="w-4 h-4 text-[#0055c4] rounded mt-0.5"
              />
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-900">Multi-Provider SMS Gateway Failover</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Route OTPs through secondary Termii provider if Africa's Talking latency exceeds 4s.</p>
              </div>
              <input
                type="checkbox"
                checked={smsGatewayFallback}
                onChange={e => setSmsGatewayFallback(e.target.checked)}
                className="w-4 h-4 text-[#0055c4] rounded mt-0.5"
              />
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-900">Throttle Realtime POS Telemetry</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Temporarily throttle low-priority sensor pings during peak settlement volume.</p>
              </div>
              <input
                type="checkbox"
                checked={realtimeTelemetryRateLimit}
                onChange={e => setRealtimeTelemetryRateLimit(e.target.checked)}
                className="w-4 h-4 text-[#0055c4] rounded mt-0.5"
              />
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-rose-900">Platform Maintenance Emergency Mode</div>
                <p className="text-[11px] text-rose-700 mt-0.5">Puts customer checkout in read-only and displays maintenance banner.</p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={e => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded mt-0.5"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

