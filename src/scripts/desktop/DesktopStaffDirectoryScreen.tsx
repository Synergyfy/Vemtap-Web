import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { EnterpriseShell } from './EnterpriseShell';

interface DesktopStaffDirectoryScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onInvite?: () => void;
}

type RoleFilter = 'all' | 'owners' | 'managers' | 'cashiers' | 'pending';

const ROLE_PILLS: Array<{ key: RoleFilter; label: string; count: string; pending?: boolean }> = [
  { key: 'all', label: 'All', count: '6' },
  { key: 'owners', label: 'Owners', count: '1' },
  { key: 'managers', label: 'Managers', count: '2' },
  { key: 'cashiers', label: 'Cashiers & Staff', count: '3' },
  { key: 'pending', label: 'Pending Invites', count: '1', pending: true },
];

const METRICS = [
  {
    label: 'Total Headcount',
    value: '6 Members',
    note: '3 Active Stores',
    noteClass: 'text-badge-discount-text font-medium',
    icon: 'groups',
    iconClass: 'bg-surface-tint-blue text-primary',
  },
  {
    label: 'Active On-Duty',
    value: '4 Staff Live',
    note: '2 POS Terminals Busy',
    noteClass: 'text-text-secondary',
    icon: 'point_of_sale',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
  },
  {
    label: 'Role Matrix Tier',
    value: '3 Profiles',
    note: 'RBAC Enforced',
    noteClass: 'text-text-secondary',
    icon: 'verified_user',
    iconClass: 'bg-surface-container text-secondary',
  },
  {
    label: 'Pending Acceptance',
    value: '1 Invite',
    note: 'Expires in 46h',
    noteClass: 'text-text-tertiary',
    icon: 'hourglass_top',
    iconClass: 'bg-tertiary-fixed text-tertiary',
    valueClass: 'text-tertiary',
  },
];

const GOVERNANCE_TIERS = [
  {
    name: 'Owner Tier',
    dotClass: 'bg-tertiary',
    badge: 'Unrestricted',
    badgeClass: 'text-tertiary',
    body: 'Unrestricted full control, bank payout accounts, merchant KYC, and branch creation.',
  },
  {
    name: 'Manager Tier',
    dotClass: 'bg-primary',
    badge: 'Operational Super',
    badgeClass: 'text-primary',
    body: 'Branch operational settings, menu & deals publishing, shift schedules, and cashier supervision.',
  },
  {
    name: 'Staff & Cashier Tier',
    dotClass: 'bg-secondary',
    badge: 'POS Frontline',
    badgeClass: 'text-secondary',
    body: 'Order processing, deal voucher QR scanning, and customer check-in. Zero access to sales payouts or bank credentials.',
  },
];

const SAFEGUARDS = [
  {
    icon: 'pin',
    iconClass: 'bg-surface-tint-blue text-primary',
    title: 'Manager Authorization PIN',
    body: '4-digit manager authorization PIN required for voids, discounts >20%, and cash drawer reconciliation.',
  },
  {
    icon: 'phonelink_lock',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Mandatory 2FA Policy',
    body: 'Two-factor authentication (2FA) enforced on all administrative accounts before dashboard login.',
  },
];

function AssignBranchActions() {
  return (
    <div className="shrink-0 flex items-center gap-space-xs">
      <button
        type="button"
        className="h-9 px-space-sm rounded-lg bg-surface-subtle hover:bg-surface-container text-text-secondary font-label-sm text-label-sm flex items-center gap-1 transition-colors"
      >
        <Icon name="swap_horiz" className="text-[16px] text-primary" />
        <span>Assign Branch</span>
      </button>
      <button
        type="button"
        aria-label="More staff options"
        className="w-9 h-9 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-secondary flex items-center justify-center transition-colors"
      >
        <Icon name="more_vert" className="text-[18px]" />
      </button>
    </div>
  );
}

function PermissionsPanel({ icon, iconClass, title, body }: { icon: string; iconClass: string; title: string; body: string }) {
  return (
    <div className="mt-space-md pt-space-md bg-surface-subtle rounded-xl p-space-md ml-space-xs">
      <div className="flex items-start gap-space-xs">
        <Icon name={icon} className={`text-[18px] shrink-0 mt-0.5 ${iconClass}`} />
        <div className="flex flex-col gap-1">
          <span className="font-caption text-caption uppercase tracking-wider font-semibold text-text-tertiary">
            {title}
          </span>
          <p className="font-body-md text-body-md text-text-secondary leading-snug">{body}</p>
        </div>
      </div>
    </div>
  );
}

function MatrixButton() {
  return (
    <button
      type="button"
      className="h-9 px-space-md rounded-lg bg-surface-tint-blue hover:bg-secondary-container text-primary font-label-md text-label-md font-semibold transition-colors flex items-center gap-1.5"
    >
      <Icon name="tune" className="text-[16px]" />
      <span>Permissions Matrix</span>
    </button>
  );
}

export function DesktopStaffDirectoryScreen({ onNav, onInvite }: DesktopStaffDirectoryScreenProps) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [query, setQuery] = useState('');

  const matches = (haystack: string) =>
    query.trim() === '' || haystack.toLowerCase().includes(query.trim().toLowerCase());

  const showOwner = (roleFilter === 'all' || roleFilter === 'owners') && matches('zainab ahmed zainab.ahmed@example.com all locations master');
  const showJohn = (roleFilter === 'all' || roleFilter === 'managers') && matches('john peter +234 803 219 8831 wuse branch abuja flagship');
  const showAmara = (roleFilter === 'all' || roleFilter === 'managers') && matches('amara kalu +234 812 443 0912 victoria island branch lagos');
  const showTunde = (roleFilter === 'all' || roleFilter === 'cashiers') && matches('tunde bakare vem-csh-094 wuse branch terminal 1 cashier');
  const showKemi = (roleFilter === 'all' || roleFilter === 'pending') && matches('kemi davies kemi.d@example.com pending invite wuse branch');

  return (
    <EnterpriseShell activeNav="business-staff" onNav={onNav}>
      <div className="w-full py-space-xl flex flex-col gap-space-xl">
        <div className="flex flex-col gap-space-sm">
          <nav className="flex items-center gap-space-xs text-text-tertiary font-label-sm text-label-sm">
            <button
              type="button"
              className="hover:text-primary transition-colors"
              onClick={() => onNav('overview')}
            >
              Business Hub
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="hover:text-primary transition-colors">Staff &amp; Access</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-text-primary font-medium">Team Directory</span>
          </nav>
          {/* Header — stacks until `xl` so it fits iPad Pro 13 */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg pt-space-xs">
            <div className="flex flex-col gap-space-2xs max-w-2xl min-w-0">
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                Staff &amp; Team Access Directory
              </h1>
              <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                Manage employee accounts, role-based operational permissions, cashier till authority, and branch
                assignments across all outlets.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm shrink-0">
              <div className="relative">
                <button
                  type="button"
                  className="h-[52px] px-space-md rounded-xl bg-surface-canvas shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] hover:bg-surface-subtle transition-all flex items-center gap-space-sm text-left"
                >
                  <span className="flex items-center justify-center w-2 h-2 rounded-full bg-badge-discount-text ring-4 ring-badge-discount-bg" />
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                      Assigned Scope
                    </span>
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      All Locations (3) • 4 Online
                    </span>
                  </div>
                  <Icon name="unfold_more" className="text-outline text-[18px] ml-space-xs" />
                </button>
              </div>
              <button
                type="button"
                className="h-[52px] px-space-md rounded-xl bg-surface-canvas shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] hover:bg-surface-subtle text-text-primary font-button-secondary text-button-secondary flex items-center gap-space-xs transition-colors"
              >
                <Icon name="download" className="text-secondary text-[20px]" />
                <span>Export Roster (CSV)</span>
              </button>
              <button
                type="button"
                onClick={onInvite}
                className="h-[52px] px-space-lg rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] flex items-center gap-space-xs transition-all active:scale-[0.98]"
              >
                <Icon name="person_add" className="text-[20px]" />
                <span>+ Invite New Team Member</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
          {METRICS.map((metric) => (
            <div
              key={metric.label}
              className="p-space-md rounded-xl bg-surface-canvas shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider">
                  {metric.label}
                </span>
                <span
                  className={`font-heading-md text-heading-md text-text-primary ${metric.valueClass ?? ''}`}
                >
                  {metric.value}
                </span>
                <span className={`font-caption text-caption mt-0.5 ${metric.noteClass}`}>{metric.note}</span>
              </div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${metric.iconClass}`}
              >
                <Icon name={metric.icon} className="text-[24px]" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md p-space-xs rounded-xl bg-surface-canvas shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)]">
          <div className="flex flex-wrap items-center gap-space-2xs">
            {ROLE_PILLS.map((pill) => (
              <button
                key={pill.key}
                type="button"
                onClick={() => setRoleFilter(pill.key)}
                className={
                  roleFilter === pill.key
                    ? pill.pending
                      ? 'px-space-md h-9 rounded-full bg-tertiary-fixed text-tertiary font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-sm'
                      : pill.key === 'all'
                        ? 'px-space-md h-9 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-sm'
                        : 'px-space-md h-9 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-sm'
                    : 'px-space-md h-9 rounded-full bg-surface-subtle hover:bg-surface-container text-text-secondary font-label-sm text-label-sm flex items-center gap-1.5 transition-colors'
                }
              >
                <span>{pill.label}</span>
                <span
                  className={
                    roleFilter === pill.key
                      ? pill.pending
                        ? 'px-1.5 py-0.5 rounded-full bg-tertiary text-on-tertiary-fixed text-[11px] leading-none'
                        : pill.key === 'all'
                          ? 'px-1.5 py-0.5 rounded-full bg-primary text-on-primary text-[11px] leading-none'
                          : 'px-1.5 py-0.5 rounded-full bg-primary text-on-primary text-[11px] leading-none'
                      : pill.pending
                        ? 'px-1.5 py-0.5 rounded-full bg-tertiary-fixed text-tertiary text-[11px] leading-none'
                        : 'px-1.5 py-0.5 rounded-full bg-surface-container-highest text-text-secondary text-[11px] leading-none'
                  }
                >
                  {pill.count}
                </span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]" />
            <input
              className="w-full h-9 pl-9 pr-space-md rounded-lg bg-surface-subtle text-text-primary placeholder:text-text-tertiary font-body-md text-body-md focus:bg-surface-canvas focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Filter by name, phone or branch..."
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <div className="lg:col-span-8 flex flex-col gap-space-md">
            {showOwner && (
              <div className="rounded-xl bg-surface-canvas p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] relative overflow-hidden transition-all hover:shadow-[0_8px_24px_-4px_rgba(13,37,76,0.08)]">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-tertiary" />
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md pl-space-xs">
                  <div className="flex items-start gap-space-md min-w-0">
                    <div className="relative shrink-0">
                      <img
                        className="w-14 h-14 rounded-2xl object-cover shadow-sm"
                        alt="High-resolution professional headshot of Zainab Ahmed, an elegant Nigerian woman business owner in contemporary executive attire smiling warmly with soft studio lighting and crisp clean depth of field."
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbZ0kTrc1fTVdv73I8KHNPpcu5q3m8cVVmUyWTBM6_1Wh17aHk4mz4eyCsjMDw2lyTn5GMnLEpNspTYMyU0jaPeHSk7u8AZEfZw8QAGZE2KS5BuBTRpUyWh3q55dAjQ5hBkorXfSwBLv7kWCWAwlqwFwPG3WKrZwKRLVoD1SmZ97tP0O8y2gRTq9vWz2ra-0D26jRGI6qS_xuS_I3JPhPQmSQ0uM9bOElPIrKL0Q2jtz_qi68dpMXGow"
                      />
                      <span
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center text-[10px] font-bold shadow-sm"
                        title="Root Authority"
                      >
                        <Icon name="shield_person" className="text-[13px]" />
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex flex-wrap items-center gap-space-xs">
                        <h3 className="font-heading-sm text-heading-sm text-text-primary font-bold truncate">
                          Zainab Ahmed
                        </h3>
                        <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                          You
                        </span>
                        <span className="px-space-xs py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold uppercase tracking-wider">
                          Owner
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-space-sm mt-1 text-text-secondary font-label-sm text-label-sm">
                        <span className="flex items-center gap-1 text-text-secondary">
                          <Icon name="mail" className="text-[16px] text-text-tertiary" />
                          zainab.ahmed@example.com
                        </span>
                        <span className="text-text-tertiary">•</span>
                        <span className="flex items-center gap-1 text-badge-discount-text font-medium">
                          <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                          Active • Primary
                        </span>
                      </div>
                      <div className="mt-space-xs flex items-center gap-space-xs text-text-secondary font-caption text-caption">
                        <Icon name="storefront" className="text-[16px] text-primary" />
                        <span className="font-semibold text-text-primary">All Locations (Master)</span>
                        <span className="text-text-tertiary">• Root Account</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center">
                    <span className="px-space-sm py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium flex items-center gap-1.5">
                      <Icon name="lock" className="text-[16px] text-primary" />
                      Protected Root Account
                    </span>
                  </div>
                </div>
                <PermissionsPanel
                  icon="key"
                  iconClass="text-tertiary"
                  title="Assigned Operational Permissions"
                  body="Full business control, billing & payout ledger, branch creation, API integrations, and staff credential management."
                />
                <div className="mt-space-md flex flex-wrap items-center justify-between gap-space-sm pt-space-xs ml-space-xs">
                  <span className="font-caption text-caption text-text-tertiary">
                    Authenticated with 2FA Token Enforced
                  </span>
                  <button
                    type="button"
                    className="h-10 px-space-md rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-highest transition-colors flex items-center gap-1.5"
                  >
                    <span>View Payout Profile</span>
                    <Icon name="arrow_forward" className="text-[16px]" />
                  </button>
                </div>
              </div>
            )}

            {showJohn && (
              <div className="rounded-xl bg-surface-canvas p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] relative overflow-hidden transition-all hover:shadow-[0_8px_24px_-4px_rgba(13,37,76,0.08)]">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary" />
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md pl-space-xs">
                  <div className="flex items-start gap-space-md min-w-0">
                    <div className="relative shrink-0">
                      <img
                        className="w-14 h-14 rounded-2xl object-cover shadow-sm"
                        alt="Polished corporate headshot portrait of John Peter, a distinguished West African hospitality manager in a crisp navy collared shirt with confident friendly smile, modern blurred store interior background."
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGpJKx63E8vHTE0mcCIP9ugcablfzP8yCFRxTqLDXcnPeE2NsF4mo1BbhVCnW2elDs_4sjEzdETS6YBXSmU2JNzJ4tAcbENWIX0Bj4Kv9YytJ61FjPbvwu6AFpdb4T0VD0mMAaRsrYW4Yb-s0Wwspz3iuqWRjW05UX8HrFk2T6Ew8PH-0LGwL5TT99VfESeO5WufLHIIstm0BQDSj0VuMNriLawdc8SDkLcTBK49TOM5ktE-cLGZ7FOw"
                      />
                      <span
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-badge-discount-text text-on-secondary flex items-center justify-center text-[10px] font-bold shadow-sm"
                        title="Active On-Duty"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex flex-wrap items-center gap-space-xs">
                        <h3 className="font-heading-sm text-heading-sm text-text-primary font-bold truncate">
                          John Peter
                        </h3>
                        <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold uppercase tracking-wider">
                          Manager
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-space-sm mt-1 text-text-secondary font-label-sm text-label-sm">
                        <span className="flex items-center gap-1 text-text-secondary">
                          <Icon name="call" className="text-[16px] text-text-tertiary" />
                          +234 803 219 8831
                        </span>
                        <span className="text-text-tertiary">•</span>
                        <span className="flex items-center gap-1 text-badge-discount-text font-medium">
                          <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-ping" />
                          Active On-Duty (Wuse Shift)
                        </span>
                      </div>
                      <div className="mt-space-xs flex items-center gap-space-xs text-text-secondary font-caption text-caption">
                        <Icon name="location_on" className="text-[16px] text-primary" />
                        <span className="font-semibold text-text-primary">Wuse Branch (Abuja Flagship)</span>
                        <span className="text-text-tertiary">• Till Code: #WS-01</span>
                      </div>
                    </div>
                  </div>
                  <AssignBranchActions />
                </div>
                <PermissionsPanel
                  icon="verified_user"
                  iconClass="text-primary"
                  title="Role Capabilities"
                  body="Can edit local catalogue, validate promotional deals, review sales registers, and supervise on-site team shifts."
                />
                <div className="mt-space-md flex flex-wrap items-center justify-between gap-space-sm pt-space-xs ml-space-xs">
                  <div className="flex items-center gap-space-xs text-text-tertiary font-caption text-caption">
                    <Icon name="pin" className="text-[16px] text-badge-discount-text" />
                    <span>Supervisor Override PIN: Configured</span>
                  </div>
                  <MatrixButton />
                </div>
              </div>
            )}

            {showAmara && (
              <div className="rounded-xl bg-surface-canvas p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] relative overflow-hidden transition-all hover:shadow-[0_8px_24px_-4px_rgba(13,37,76,0.08)]">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary" />
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md pl-space-xs">
                  <div className="flex items-start gap-space-md min-w-0">
                    <div className="relative shrink-0">
                      <img
                        className="w-14 h-14 rounded-2xl object-cover shadow-sm"
                        alt="Close-up professional headshot of Amara Kalu, a smart Nigerian woman retail branch manager wearing chic eyeglasses and modern professional attire against an elegant warm corporate office background."
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyjRHJH_geh78dFrYWJyRGXGK6C_HE9I9AZ6rcRtmrOKWQOqJMpXp19wlbQ998XdIAnVW21uTN2PeqsFhUru7VaJgFkR6zx0_A95lvAPrFIbJzLdjjLmEhiMmvKPcDZlQhpIA-3NXtq36UE8Gzbi_0QtCPSQp5Oty3GWsUul6WwA2GNityIbuANFe8JRuv2GUz5Y2ncNgoCokNTOj8XwQqR9caYhpGOpjExVdOa6vCmVty6nimnuWWFg"
                      />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-badge-discount-text text-on-secondary flex items-center justify-center text-[10px] font-bold shadow-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-white" />
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex flex-wrap items-center gap-space-xs">
                        <h3 className="font-heading-sm text-heading-sm text-text-primary font-bold truncate">
                          Amara Kalu
                        </h3>
                        <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold uppercase tracking-wider">
                          Manager
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-space-sm mt-1 text-text-secondary font-label-sm text-label-sm">
                        <span className="flex items-center gap-1 text-text-secondary">
                          <Icon name="call" className="text-[16px] text-text-tertiary" />
                          +234 812 443 0912
                        </span>
                        <span className="text-text-tertiary">•</span>
                        <span className="flex items-center gap-1 text-badge-discount-text font-medium">
                          <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                          Active
                        </span>
                      </div>
                      <div className="mt-space-xs flex items-center gap-space-xs text-text-secondary font-caption text-caption">
                        <Icon name="location_on" className="text-[16px] text-primary" />
                        <span className="font-semibold text-text-primary">Victoria Island Branch</span>
                        <span className="text-text-tertiary">• Lagos Coastal Outpost</span>
                      </div>
                    </div>
                  </div>
                  <AssignBranchActions />
                </div>
                <PermissionsPanel
                  icon="verified_user"
                  iconClass="text-primary"
                  title="Role Capabilities"
                  body="Branch operations, service schedules, bookings management, and localized customer resolution."
                />
                <div className="mt-space-md flex flex-wrap items-center justify-between gap-space-sm pt-space-xs ml-space-xs">
                  <span className="font-caption text-caption text-text-tertiary">
                    Shift Schedule: Mon-Fri Morning Register
                  </span>
                  <MatrixButton />
                </div>
              </div>
            )}

            {showTunde && (
              <div className="rounded-xl bg-surface-canvas p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] relative overflow-hidden transition-all hover:shadow-[0_8px_24px_-4px_rgba(13,37,76,0.08)]">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-secondary" />
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md pl-space-xs">
                  <div className="flex items-start gap-space-md min-w-0">
                    <div className="relative shrink-0">
                      <img
                        className="w-14 h-14 rounded-2xl object-cover shadow-sm"
                        alt="Portrait photography of Tunde Bakare, a vibrant young African retail cashier with focused friendly expression wearing a clean branded black apron against a high-tech point-of-sale checkout counter."
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD__EPGZ__nAFqToiqV-T7UxODMSgzkiV5xn8JZScZXGDSopAzCBBhZJEpeu849oMYbVEN90_C8Gbr3yJa70WlfGYOVU8jNeK_Wn6rWYAajrlPJFxyBFkywT8Cg--u9OWP-8xh_jVYp0y5yA0JvTD3s5OAySaatL-MtLyhvlkKIuJUT5k21K0UpqEgi3D_OTOv1DJYEho7iPqJrBuZN7K_zLGamiOmu4VSulKebUa2s3Ir_qnOqauoAag"
                      />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-badge-discount-text text-on-secondary flex items-center justify-center text-[10px] font-bold shadow-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-white" />
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex flex-wrap items-center gap-space-xs">
                        <h3 className="font-heading-sm text-heading-sm text-text-primary font-bold truncate">
                          Tunde Bakare
                        </h3>
                        <span className="px-space-xs py-0.5 rounded-full bg-surface-container text-secondary font-caption text-caption font-semibold uppercase tracking-wider">
                          Cashier
                        </span>
                        <span className="px-space-xs py-0.5 rounded-full bg-surface-subtle text-text-secondary font-caption text-caption font-medium">
                          Terminal 1 (Hardware Active)
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-space-sm mt-1 text-text-secondary font-label-sm text-label-sm">
                        <span className="flex items-center gap-1 text-text-secondary">
                          <Icon name="badge" className="text-[16px] text-text-tertiary" />
                          ID: VEM-CSH-094
                        </span>
                        <span className="text-text-tertiary">•</span>
                        <span className="flex items-center gap-1 text-badge-discount-text font-medium">
                          <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                          Active
                        </span>
                      </div>
                      <div className="mt-space-xs flex items-center gap-space-xs text-text-secondary font-caption text-caption">
                        <Icon name="store" className="text-[16px] text-primary" />
                        <span className="font-semibold text-text-primary">Wuse Branch - Terminal 1</span>
                        <span className="text-text-tertiary">• Cash Drawer Till Synchronized</span>
                      </div>
                    </div>
                  </div>
                  <AssignBranchActions />
                </div>
                <PermissionsPanel
                  icon="point_of_sale"
                  iconClass="text-secondary"
                  title="Role Capabilities"
                  body="Process POS cash/card orders, scan and redeem customer deal QR codes, check loyalty balances."
                />
                <div className="mt-space-md flex flex-wrap items-center justify-between gap-space-sm pt-space-xs ml-space-xs">
                  <span className="font-caption text-caption text-text-tertiary">
                    Strict Cash Float • Zero Direct Payout Privileges
                  </span>
                  <MatrixButton />
                </div>
              </div>
            )}

            {showKemi && (
              <div className="rounded-xl bg-surface-canvas p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] relative overflow-hidden transition-all hover:shadow-[0_8px_24px_-4px_rgba(13,37,76,0.08)] bg-gradient-to-r from-tertiary-fixed/20 via-surface-canvas to-surface-canvas">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-tertiary-container" />
                <div className="mb-space-sm pl-space-xs flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold">
                  <Icon name="schedule" className="text-[18px] text-tertiary" />
                  <span>Pending Invite Acceptance • Token Expires in 46 hours</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md pl-space-xs">
                  <div className="flex items-start gap-space-md min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-text-secondary font-heading-sm text-heading-sm font-semibold shrink-0">
                      KD
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex flex-wrap items-center gap-space-xs">
                        <h3 className="font-heading-sm text-heading-sm text-text-primary font-bold truncate">
                          Kemi Davies
                        </h3>
                        <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-semibold uppercase tracking-wider">
                          Service Lead
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-space-sm mt-1 text-text-secondary font-label-sm text-label-sm">
                        <span className="flex items-center gap-1 text-text-secondary">
                          <Icon name="mail" className="text-[16px] text-text-tertiary" />
                          kemi.d@example.com
                        </span>
                      </div>
                      <div className="mt-space-xs flex items-center gap-space-xs text-text-secondary font-caption text-caption">
                        <Icon name="schedule_send" className="text-[16px] text-tertiary" />
                        <span>Invitation email sent 2 hours ago for assignment to Wuse Branch.</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-space-xs">
                    <button
                      type="button"
                      className="h-9 px-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Icon name="forward_to_inbox" className="text-[16px]" />
                      <span>Resend Invite</span>
                    </button>
                    <button
                      type="button"
                      className="h-9 px-space-sm rounded-lg bg-error-container text-on-error-container hover:bg-error/20 font-label-sm text-label-sm font-medium transition-colors"
                    >
                      Cancel Invite
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            <div className="rounded-xl bg-surface-canvas p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="admin_panel_settings" className="text-primary text-[22px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary font-bold">Access Governance</h2>
                </div>
                <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface-variant font-caption text-caption font-semibold">
                  SEC-30
                </span>
              </div>
              <p className="font-body-md text-body-md text-text-secondary">
                Role hierarchy strictly determines ledger viewability, discount caps, and terminal control.
              </p>
              <div className="flex flex-col gap-space-sm pt-space-xs">
                {GOVERNANCE_TIERS.map((tier) => (
                  <div
                    key={tier.name}
                    className="p-space-sm rounded-xl bg-surface-subtle flex flex-col gap-1.5 transition-colors hover:bg-surface-container-low"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md font-bold text-text-primary flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${tier.dotClass}`} />
                        {tier.name}
                      </span>
                      <span className={`font-caption text-caption font-semibold ${tier.badgeClass}`}>{tier.badge}</span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary leading-relaxed">{tier.body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-space-xs p-space-sm rounded-xl bg-surface-tint-blue flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-caption text-caption font-semibold text-text-primary">
                    Till Auth Security Policy
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    Enforced on 3 POS Hardware Units
                  </span>
                </div>
                <Icon name="lock_reset" className="text-primary text-[20px]" />
              </div>
            </div>

            <div className="rounded-xl bg-surface-canvas p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="policy" className="text-badge-discount-text text-[22px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary font-bold">
                    Compliance Assurance
                  </h2>
                </div>
                <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface-variant font-caption text-caption font-semibold">
                  SEC-31
                </span>
              </div>
              <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-space-xs">
                <div className="flex items-center gap-space-xs text-badge-discount-text">
                  <Icon name="verified" className="text-[18px]" />
                  <span className="font-label-md text-label-md font-semibold text-text-primary">
                    Immutable Audit Trails
                  </span>
                </div>
                <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                  Deactivating or reassigning a team member automatically preserves all historical transaction ledgers,
                  shift audit trails, and POS logs.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-space-xs pt-space-xs">
                <div className="p-space-xs rounded-lg bg-surface-subtle flex flex-col text-center">
                  <span className="font-heading-sm text-heading-sm text-text-primary font-bold">100%</span>
                  <span className="font-caption text-caption text-text-tertiary">Ledger Retention</span>
                </div>
                <div className="p-space-xs rounded-lg bg-surface-subtle flex flex-col text-center">
                  <span className="font-heading-sm text-heading-sm text-text-primary font-bold">7 Yrs</span>
                  <span className="font-caption text-caption text-text-tertiary">Tax Compliance</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-surface-canvas p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-md">
              <div className="flex items-center gap-space-xs">
                <Icon name="security" className="text-primary text-[22px]" />
                <h2 className="font-heading-sm text-heading-sm text-text-primary font-bold">Security Safeguards</h2>
              </div>
              <div className="flex flex-col gap-space-md">
                {SAFEGUARDS.map((safeguard) => (
                  <div key={safeguard.title} className="flex items-start gap-space-sm">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${safeguard.iconClass}`}
                    >
                      <Icon name={safeguard.icon} className="text-[18px]" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-label-md text-label-md font-semibold text-text-primary">
                        {safeguard.title}
                      </span>
                      <p className="font-caption text-caption text-text-secondary leading-relaxed">{safeguard.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-space-xs">
                <button
                  type="button"
                  className="font-label-sm text-label-sm text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Configure global branch terminal rules</span>
                  <Icon name="arrow_forward" className="text-[14px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EnterpriseShell>
  );
}
