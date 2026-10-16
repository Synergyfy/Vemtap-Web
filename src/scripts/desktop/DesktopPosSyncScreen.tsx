import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';

interface DesktopPosSyncScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
}

type SyncPhase = 'idle' | 'pushing' | 'done';
type ConflictPhase = 'open' | 'resolving' | 'resolved';

/**
 * Chrome-less "Cloud Sync & Ledger Reconciliation" dashboard.
 * Rendered inside the POS terminal shell (DesktopPosSyncScreen) and inside the
 * business portal chrome (DesktopBusinessPosOrdersScreen → Offline & Sync).
 */
export function PosSyncContent() {
  const [syncPhase, setSyncPhase] = useState<SyncPhase>('idle');
  const [progress, setProgress] = useState(80);
  const [conflict, setConflict] = useState<ConflictPhase>('open');
  const [resolveMethod, setResolveMethod] = useState<'Local Override' | 'Custom Line Item'>('Local Override');
  const syncTimers = useRef<number[]>([]);

  useEffect(
    () => () => {
      syncTimers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const forceSync = () => {
    if (syncPhase !== 'idle') return;
    setSyncPhase('pushing');
    syncTimers.current.push(
      window.setTimeout(() => {
        setProgress(100);
        setSyncPhase('done');
        syncTimers.current.push(
          window.setTimeout(() => {
            setSyncPhase('idle');
            setProgress(80);
          }, 2500),
        );
      }, 1500),
    );
  };

  const resolveConflict = (method: 'Local Override' | 'Custom Line Item') => {
    if (conflict !== 'open') return;
    setResolveMethod(method);
    setConflict('resolving');
    syncTimers.current.push(window.setTimeout(() => setConflict('resolved'), 400));
  };

  const pingTerminal = () => {
    window.alert('Terminal PAX A920 Pro acknowledged ping: Roundtrip 12ms • Printer Ready');
  };

  const exportCsv = () => {
    const csvData =
      'Ticket_ID,Timestamp,Cashier,Tender_Method,Gross_Amount,Status,Reconciled_Hash\n' +
      'LOC-TXN-402-004,15:25,Emeka O.,Card,14800.00,Verified,8b1c4e\n' +
      'LOC-TXN-402-001,14:15,Emeka O.,Cash,6937.50,Resolved_Override,4f9a2d\n' +
      'LOC-TXN-402-005,15:31,Emeka O.,Split,31712.50,InFlight,PENDING';
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VEMTAP_Shift_Reconciliation_ABJ004.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Status Banner (Connection Restored) */}
      <div className="py-space-xs bg-badge-discount-bg text-badge-discount-text">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-badge-discount-text animate-ping" />
            <span className="font-label-md text-label-md font-semibold">Connection Restored</span>
            <span className="text-text-tertiary">|</span>
            <span className="font-body-md text-body-md">
              4G LTE / Fibre Uplink Active • 28ms Latency — Synchronizing buffered offline tickets to VEMTAP Cloud
              Mainnet.
            </span>
          </div>
          <div className="flex items-center gap-space-xs text-badge-discount-text font-caption text-caption uppercase tracking-wider font-semibold">
            <Icon name="cloud_sync" className="text-[16px]" />
            <span>Auto-Sync Daemon v4.19</span>
          </div>
        </div>
      </div>

      <div className="py-space-lg flex flex-col gap-space-xl">
        {/* Top Action Bar & Page Title Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs text-text-tertiary font-caption text-caption uppercase tracking-wider mb-space-2xs">
              <span>Enterprise Fleet Orchestration</span>
              <span>•</span>
              <span>Station POS-NG-ABJ-004</span>
            </div>
            <div className="flex items-center gap-space-sm">
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Cloud Sync &amp; Ledger Reconciliation</h1>
              <span className="px-space-xs py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-primary font-medium">
                Session #882
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={forceSync}
              disabled={syncPhase !== 'idle'}
              className={`inline-flex items-center gap-space-xs px-space-lg py-3 rounded-xl text-on-primary font-button-primary text-button-primary shadow-md hover:bg-primary transition-all active:scale-[0.98] ${
                syncPhase === 'done' ? 'bg-badge-discount-text' : 'bg-primary-container'
              } ${syncPhase === 'pushing' ? 'opacity-80' : ''}`}
            >
              {syncPhase === 'pushing' ? (
                <Icon name="sync" className="text-[20px] animate-spin" />
              ) : syncPhase === 'done' ? (
                <Icon name="check_circle" className="text-[20px]" />
              ) : (
                <Icon name="bolt" className="text-[20px]" />
              )}
              {syncPhase === 'pushing'
                ? 'Synchronizing 1 Pending Ticket...'
                : syncPhase === 'done'
                  ? 'Cloud Mainnet Fully Reconciled!'
                  : 'Sync Now (Force Immediate Cloud Push)'}
            </button>
          </div>
        </div>

        {/* Metrics Bento Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Metric 1: Progress */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">
                  Cloud Daemon Status
                </span>
                <span className="font-heading-sm text-heading-sm text-on-surface mt-space-2xs">Sync Active</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary">
                <Icon name="sync" className="text-[20px]" />
              </div>
            </div>
            <div className="mt-space-md">
              <div className="flex justify-between items-baseline mb-space-2xs">
                <span className="font-display-hero text-display-hero text-primary leading-none">{progress}%</span>
                <span className="font-label-sm text-label-sm text-text-secondary">4 of 5 records</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary-container h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-space-2xs flex items-center justify-between text-text-tertiary font-caption text-caption">
                <span>Local Buffer: 1 Pending</span>
                <span>Upstream: OK</span>
              </div>
            </div>
          </div>

          {/* Metric 2: Waiting */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">Local Queue</span>
                <span className="font-heading-sm text-heading-sm text-on-surface mt-space-2xs">Waiting to Sync</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-secondary">
                <Icon name="schedule" className="text-[20px]" />
              </div>
            </div>
            <div className="mt-space-md">
              <span className="font-display-hero text-display-hero text-on-surface leading-none">₦31,712.50</span>
              <div className="mt-space-2xs flex items-center gap-space-2xs">
                <span className="inline-block w-2 h-2 rounded-full bg-primary-container" />
                <span className="font-label-md text-label-md text-text-secondary">1 Transaction ready in flight</span>
              </div>
            </div>
          </div>

          {/* Metric 3: Synced */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">
                  Verified Shift Total
                </span>
                <span className="font-heading-sm text-heading-sm text-on-surface mt-space-2xs">Successfully Synced</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-badge-discount-bg flex items-center justify-center text-badge-discount-text">
                <Icon name="verified" className="text-[20px]" />
              </div>
            </div>
            <div className="mt-space-md">
              <span className="font-display-hero text-display-hero text-badge-discount-text leading-none">₦3,480,250</span>
              <div className="mt-space-2xs flex items-center gap-space-2xs">
                <Icon name="check_circle" className="text-[15px] text-badge-discount-text" />
                <span className="font-label-md text-label-md text-text-secondary">142 Transactions verified</span>
              </div>
            </div>
          </div>

          {/* Metric 4: Collision */}
          <div className="p-space-lg rounded-xl bg-error-container text-on-error-container shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider opacity-80">Attention Required</span>
                <span className="font-heading-sm text-heading-sm mt-space-2xs font-semibold">Stock Collision</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-canvas/60 flex items-center justify-center text-error">
                <Icon name="warning" className="text-[20px]" />
              </div>
            </div>
            <div className="mt-space-md">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-display-hero text-display-hero font-bold leading-none">1</span>
                <span className="font-heading-sm text-heading-sm">Conflict</span>
              </div>
              <div className="mt-space-2xs flex items-center gap-space-2xs text-error font-label-md text-label-md font-semibold">
                <Icon name="priority_high" className="text-[16px]" />
                <span>Manual resolution required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Reconciliation & Telemetry Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* Left Column (60% ~ 7 cols): Conflict Resolution & Queue */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <Icon name="rule" className="text-primary text-[22px]" />
                <h2 className="font-heading-md text-heading-md text-on-surface">Conflict Resolution &amp; Sync Queue</h2>
              </div>
              <span className="font-caption text-caption px-space-xs py-1 rounded bg-surface-container font-medium text-text-secondary">
                2 Items in Local Store
              </span>
            </div>

            {/* High Priority Collision Card */}
            <div
              className={`p-space-lg rounded-xl bg-surface-container-lowest shadow-md flex flex-col gap-space-md relative overflow-hidden transition-all duration-500 ${
                conflict === 'resolving' ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {conflict === 'resolved' ? (
                <div className="p-space-md bg-badge-discount-bg text-badge-discount-text rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="task_alt" className="text-[20px]" />
                    <span className="font-label-md text-label-md font-semibold">
                      Collision LOC-TXN-402-001 resolved via {resolveMethod}
                    </span>
                  </div>
                  <span className="font-caption text-caption uppercase tracking-wider font-semibold">
                    Cloud Synced • 0s ago
                  </span>
                </div>
              ) : (
                <>
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-error" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-xs">
                    <div className="flex items-center gap-space-xs">
                      <span className="px-space-xs py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                        COLLISION #01
                      </span>
                      <span className="font-heading-sm text-heading-sm text-on-surface">LOC-TXN-402-001</span>
                      <span className="text-text-tertiary">•</span>
                      <span className="font-heading-sm text-heading-sm text-primary">₦6,937.50</span>
                    </div>
                    <div className="font-caption text-caption text-text-secondary flex items-center gap-space-2xs">
                      <Icon name="schedule" className="text-[15px]" />
                      <span>02:15 PM • Cashier: Emeka O.</span>
                    </div>
                  </div>
                  <div className="p-space-md rounded-lg bg-surface-container-low flex items-start gap-space-sm">
                    <div className="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center shrink-0 mt-0.5">
                      <Icon name="inventory_2" className="text-[18px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">
                        Inventory Stock Collision Detected
                      </span>
                      <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
                        Woodfire Ribeye Steak was marked <strong className="text-error">Out of Stock</strong> at Maitama
                        central inventory node at 02:20 PM. Local customer already tendered cash and received hardware
                        printed receipt in-store at 02:15 PM.
                      </p>
                    </div>
                  </div>
                  {/* Product Preview Slice */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm text-text-secondary font-label-sm text-label-sm">
                    <div className="p-space-xs rounded bg-surface-subtle flex items-center justify-between">
                      <span>Cloud Central Stock:</span>
                      <span className="font-semibold text-error">0 units remaining</span>
                    </div>
                    <div className="p-space-xs rounded bg-surface-subtle flex items-center justify-between">
                      <span>Local Till Receipt:</span>
                      <span className="font-semibold text-badge-discount-text">Tender Confirmed (Cash)</span>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-space-xs pt-space-xs">
                    <button
                      type="button"
                      onClick={() => resolveConflict('Local Override')}
                      className="px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary font-button-secondary text-button-secondary flex items-center gap-space-2xs hover:bg-primary transition-all"
                    >
                      <Icon name="check" className="text-[18px]" />
                      <span>Accept Local Sale &amp; Override Stock</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => resolveConflict('Custom Line Item')}
                      className="px-space-md py-2.5 rounded-lg bg-surface-container-high text-on-surface font-button-secondary text-button-secondary flex items-center gap-space-2xs hover:bg-surface-variant transition-all"
                    >
                      <Icon name="edit_note" className="text-[18px]" />
                      <span>Mark as Custom Line Item</span>
                    </button>
                    <button
                      type="button"
                      className="px-space-sm py-2.5 rounded-lg text-text-secondary font-button-secondary text-button-secondary hover:text-primary transition-colors ml-auto"
                    >
                      <span>View Full Ledger Conflict →</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Sync Queue List */}
            <div className="flex flex-col gap-space-xs">
              <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">
                Buffered In-Flight &amp; Recently Reconciled
              </span>
              {/* Item 1: Pending In Flight */}
              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-space-md">
                  <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                    <Icon name="sync" className="text-[18px] animate-spin" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-2xs">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">LOC-TXN-402-005</span>
                      <span className="px-space-2xs py-0.5 rounded text-[11px] font-semibold bg-surface-container text-primary">
                        BUFFERED
                      </span>
                    </div>
                    <span className="font-caption text-caption text-text-tertiary">
                      3 Items • Split Tender (Card/Transfer) • Terminal Till #01
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-label-md text-label-md font-semibold text-on-surface">₦31,712.50</div>
                  <span className="font-caption text-caption text-primary flex items-center justify-end gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    In Flight (1/3 Ack)
                  </span>
                </div>
              </div>
              {/* Item 2: Successfully Reconciled */}
              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between opacity-85">
                <div className="flex items-center gap-space-md">
                  <div className="w-9 h-9 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                    <Icon name="check_circle" className="text-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-2xs">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">LOC-TXN-402-004</span>
                      <span className="px-space-2xs py-0.5 rounded text-[11px] font-semibold bg-badge-discount-bg text-badge-discount-text">
                        SYNCED
                      </span>
                    </div>
                    <span className="font-caption text-caption text-text-tertiary">
                      Synced at 03:25 PM • Reconciled • Hash: 8b1c4e
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-label-md text-label-md font-semibold text-on-surface">₦14,800.00</div>
                  <span className="font-caption text-caption text-badge-discount-text">Ledger Verified</span>
                </div>
              </div>
            </div>

            {/* Ledger Pipeline Sparkline Summary */}
            <div className="p-space-lg rounded-xl bg-surface-container-low flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    Hourly Shift Throughput vs Cloud Acknowledgment
                  </span>
                  <span className="font-caption text-caption text-text-tertiary">
                    Zero dropped tickets across 8 hours of retail operations
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-primary font-medium">99.98% Ack Rate</span>
              </div>
              {/* Inline Minimal SVG Chart */}
              <div className="w-full h-20 pt-2">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 60">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#066cf4" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#066cf4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,45 L50,42 L100,30 L150,38 L200,20 L250,22 L300,12 L350,18 L400,8 L450,15 L500,5 L550,10 L600,8 L600,60 L0,60 Z"
                    fill="url(#chartGrad)"
                  />
                  <path
                    d="M0,45 L50,42 L100,30 L150,38 L200,20 L250,22 L300,12 L350,18 L400,8 L450,15 L500,5 L550,10 L600,8"
                    fill="none"
                    stroke="#0055c4"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  />
                  <circle cx="500" cy="5" fill="#066cf4" r="4" />
                  <circle cx="600" cy="8" fill="#059669" r="4" />
                </svg>
              </div>
              <div className="flex justify-between font-caption text-caption text-text-tertiary">
                <span>08:00 WAT</span>
                <span>10:00 WAT</span>
                <span>12:00 WAT</span>
                <span>02:00 WAT</span>
                <span>14:30 WAT (Current)</span>
              </div>
            </div>
          </div>

          {/* Right Column (40% ~ 5 cols): Diagnostics & Telemetry */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <Icon name="dns" className="text-primary text-[22px]" />
                <h2 className="font-heading-md text-heading-md text-on-surface">Cloud Diagnostics &amp; Telemetry</h2>
              </div>
              <span className="inline-flex items-center gap-1 font-caption text-caption text-badge-discount-text font-medium">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                HEALTHY
              </span>
            </div>

            {/* Telemetry Card */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
              {/* Parameter 1: Region */}
              <div className="flex items-center justify-between py-space-xs">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name="hub" className="text-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-medium text-on-surface">Abuja Data Region</span>
                    <span className="font-caption text-caption text-text-tertiary">Cluster ID: NG-CENTRAL-1</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-space-xs py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold">
                    100% INTACT
                  </span>
                </div>
              </div>
              <div className="w-full h-px bg-surface-container" />
              {/* Parameter 2: Cloud Endpoint */}
              <div className="flex items-center justify-between py-space-xs">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name="cloud_queue" className="text-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-medium text-on-surface">Cloud Endpoint</span>
                    <span className="font-caption text-caption text-text-tertiary">api.vemtap.com (TLS 1.3)</span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-1 text-badge-discount-text font-label-md text-label-md font-semibold">
                  <Icon name="speed" className="text-[15px]" />
                  <span>28ms</span>
                </div>
              </div>
              <div className="w-full h-px bg-surface-container" />
              {/* Parameter 3: Offline Integrity */}
              <div className="flex items-center justify-between py-space-xs">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name="fact_check" className="text-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-medium text-on-surface">Offline Integrity</span>
                    <span className="font-caption text-caption text-text-tertiary">SHA-256 Ledger State Validation</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-label-md text-label-md font-semibold text-badge-discount-text">100% Matched</div>
                  <div className="font-caption text-caption text-text-tertiary">Zero discrepancy</div>
                </div>
              </div>
              <div className="w-full h-px bg-surface-container" />
              {/* Parameter 4: Cryptographic Sync State */}
              <div className="flex items-center justify-between py-space-xs">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name="lock_clock" className="text-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-medium text-on-surface">Local Ephemeral Key</span>
                    <span className="font-caption text-caption text-text-tertiary">PAX Hardware Secure Enclave</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-caption text-caption font-semibold text-text-secondary font-mono">
                    0x9F41...82AE
                  </span>
                </div>
              </div>
            </div>

            {/* Terminal Hardware Node Visual Card */}
            <div className="p-space-lg rounded-xl bg-surface-container-high flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md font-semibold text-on-surface">Active Terminal Bridge</span>
                <Icon name="point_of_sale" className="text-primary text-[20px]" />
              </div>
              <div className="flex items-center gap-space-md">
                <div className="w-16 h-16 rounded-lg bg-surface-canvas flex items-center justify-center text-primary shadow-sm shrink-0">
                  <Icon name="contactless" className="text-[36px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">PAX A920 Pro Linked</span>
                  <span className="font-caption text-caption text-text-secondary">Wuse II Flagship • Till Counter 01</span>
                  <span className="font-caption text-caption text-text-tertiary mt-space-2xs">
                    Battery 94% • Thermal Roll 78% remaining
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-space-xs pt-space-xs">
                <button
                  type="button"
                  onClick={pingTerminal}
                  className="px-space-sm py-2 rounded-lg bg-surface-canvas font-button-secondary text-button-secondary text-on-surface shadow-sm hover:bg-surface-subtle transition-colors flex items-center justify-center gap-1"
                >
                  <Icon name="sensors" className="text-[16px]" />
                  <span>Ping POS</span>
                </button>
                <button
                  type="button"
                  onClick={exportCsv}
                  className="px-space-sm py-2 rounded-lg bg-surface-canvas font-button-secondary text-button-secondary text-primary shadow-sm hover:bg-surface-tint-blue transition-colors flex items-center justify-center gap-1"
                >
                  <Icon name="file_download" className="text-[16px]" />
                  <span>Shift CSV</span>
                </button>
              </div>
            </div>

            {/* Secondary Export Banner */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-heading-sm text-heading-sm text-on-surface">Export Shift Audit</span>
                  <span className="font-body-md text-body-md text-text-secondary mt-space-2xs">
                    Generate a digitally signed NDPR &amp; tax compliant CSV audit report of all offline/online tickets.
                  </span>
                </div>
                <Icon name="receipt_long" className="text-primary text-[24px]" />
              </div>
              <button
                type="button"
                onClick={exportCsv}
                className="mt-space-xs w-full py-3 rounded-xl bg-surface-tint-blue text-primary font-button-primary text-button-primary hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-space-xs"
              >
                <Icon name="download" className="text-[20px]" />
                <span>Download Shift Reconciliation CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function DesktopPosSyncScreen({ onNav }: DesktopPosSyncScreenProps) {
  return (
    <PosTerminalChrome activeNav="hardware-and-sync" onNav={onNav}>
      <PosSyncContent />
    </PosTerminalChrome>
  );
}