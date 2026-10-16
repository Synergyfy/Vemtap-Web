import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';

import { BusinessHubHeader } from './BusinessHubHeader';
import { useIsDesktop } from '../hooks/useIsDesktop';

interface BusinessStaffScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  onInvite: () => void;
}

type RoleFilterKey = 'all' | 'owner' | 'manager' | 'staff' | 'cashier';

const ROLE_FILTERS: { key: RoleFilterKey; label: string }[] = [
  { key: 'all', label: 'All roles' },
  { key: 'owner', label: 'Owner' },
  { key: 'manager', label: 'Manager' },
  { key: 'staff', label: 'Staff' },
  { key: 'cashier', label: 'Cashier' },
];

const PERMISSION_LIST = [
  'Orders & POS',
  'Catalog & Deals',
  'Bookings & Events',
  'Analytics & Reports',
  'Team & Payroll',
];

interface StaffMember {
  key: string;
  name: string;
  role: string;
  roleKey: Exclude<RoleFilterKey, 'all'>;
  roleClass: string;
  scope: string;
  branches: string;
  lastActive: string;
  email: string;
  phone: string;
  joined: string;
  access: string[];
}

const STAFF: StaffMember[] = [
  {
    key: 'bola',
    name: 'Bola Adeyemi',
    role: 'Owner',
    roleKey: 'owner',
    roleClass: 'bg-surface-tint-blue text-primary',
    scope: 'Full access to every branch, billing, and team management.',
    branches: 'All branches (3)',
    lastActive: 'Active 12 min ago',
    email: 'bola@urbanugrill.com',
    phone: '+234 803 100 2201',
    joined: 'Jan 08, 2024',
    access: PERMISSION_LIST,
  },
  {
    key: 'chidi',
    name: 'Chidi Okafor',
    role: 'Manager',
    roleKey: 'manager',
    roleClass: 'bg-primary-container text-on-primary',
    scope: 'Orders, bookings, catalog and team scheduling.',
    branches: 'Wuse 2, Maitama',
    lastActive: 'Active 1 hour ago',
    email: 'chidi.okafor@urbanugrill.com',
    phone: '+234 812 443 0912',
    joined: 'Mar 19, 2024',
    access: ['Orders & POS', 'Catalog & Deals', 'Bookings & Events', 'Analytics & Reports'],
  },
  {
    key: 'amaka',
    name: 'Amaka Nwosu',
    role: 'Manager',
    roleKey: 'manager',
    roleClass: 'bg-primary-container text-on-primary',
    scope: 'Events, large bookings and guest relations only.',
    branches: 'Maitama',
    lastActive: 'Active yesterday',
    email: 'amaka.nwosu@urbanugrill.com',
    phone: '+234 805 771 4410',
    joined: 'Jun 02, 2024',
    access: ['Bookings & Events', 'Analytics & Reports'],
  },
  {
    key: 'tunde',
    name: 'Tunde Bello',
    role: 'Staff',
    roleKey: 'staff',
    roleClass: 'bg-surface-container text-on-surface-variant',
    scope: 'Table service and order updates on the floor.',
    branches: 'Wuse 2',
    lastActive: 'Active 25 min ago',
    email: 'tunde.bello@urbanugrill.com',
    phone: '+234 806 332 7781',
    joined: 'Aug 11, 2024',
    access: ['Orders & POS'],
  },
  {
    key: 'ngozi',
    name: 'Ngozi Eze',
    role: 'Cashier',
    roleKey: 'cashier',
    roleClass: 'bg-badge-discount-bg text-badge-discount-text',
    scope: 'POS checkout, refunds and end-of-day reconciliation.',
    branches: 'Wuse 2',
    lastActive: 'Active 3 hours ago',
    email: 'ngozi.eze@urbanugrill.com',
    phone: '+234 809 215 6640',
    joined: 'Sep 27, 2024',
    access: ['Orders & POS', 'Analytics & Reports'],
  },
];

const DETAILS: { label: string; value: (member: StaffMember) => string; icon: string }[] = [
  { label: 'Role', value: (member) => member.role, icon: 'badge' },
  { label: 'Branch access', value: (member) => member.branches, icon: 'location_on' },
  { label: 'Last active', value: (member) => member.lastActive, icon: 'schedule' },
  { label: 'Staff PIN', value: () => 'Set by owner', icon: 'pin' },
  { label: 'Email', value: (member) => member.email, icon: 'mail' },
  { label: 'Phone', value: (member) => member.phone, icon: 'call' },
  { label: 'Joined', value: (member) => member.joined, icon: 'event' },
  { label: 'Status', value: () => 'Active', icon: 'verified_user' },
];

const ACTIONS: { key: string; label: string; hint: string; icon: string; danger?: boolean }[] = [
  { key: 'edit', label: 'Edit details', hint: 'Name, contact and job title', icon: 'edit' },
  { key: 'role', label: 'Change role', hint: 'Switch between preset roles', icon: 'swap_horiz' },
  { key: 'branch', label: 'Assign branch', hint: 'Add or remove branch access', icon: 'add_business' },
  { key: 'permissions', label: 'Permissions', hint: 'Pages and actions they can use', icon: 'lock' },
  { key: 'pin', label: 'Reset PIN', hint: 'Send a new PIN to their email', icon: 'pin' },
];

export function BusinessStaffScreen({ onTab, onInvite }: BusinessStaffScreenProps) {
  const isDesktop = useIsDesktop();
  const [members, setMembers] = useState<StaffMember[]>(STAFF);
  const [filter, setFilter] = useState<RoleFilterKey>('all');
  const [activeMember, setActiveMember] = useState<StaffMember | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const closeDetail = () => {
    setConfirmRemove(false);
    setActiveMember(null);
  };

  const roleCount = (key: RoleFilterKey) =>
    key === 'all' ? members.length : members.filter((member) => member.roleKey === key).length;

  const visibleStaff = members.filter((member) => filter === 'all' || member.roleKey === filter);

  const removeMember = (member: StaffMember) => {
    setMembers((current) => current.filter((item) => item.key !== member.key));
    closeDetail();
    showToast(`${member.name} removed from the team`);
  };

  const runAction = (actionKey: string, member: StaffMember) => {
    const first = member.name.split(' ')[0];
    switch (actionKey) {
      case 'edit':
        showToast(`Editing ${member.name}`);
        break;
      case 'role':
        showToast(`Role options opened for ${first}`);
        break;
      case 'branch':
        showToast(`Branch assignment opened for ${first}`);
        break;
      case 'permissions':
        showToast(`Permissions opened for ${first}`);
        break;
      default:
        showToast(`New PIN sent to ${member.email}`);
    }
  };

  const renderDetail = (member: StaffMember) => (
    <>
      {!isDesktop && <div className="w-12 h-1.5 bg-surface-container-highest rounded-full mx-auto" />}
      <div className="flex items-start justify-between gap-space-xs pt-space-xs">
        <div className="flex items-center gap-space-xs min-w-0">
          <div className="w-11 h-11 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center font-label-md text-label-md font-semibold shrink-0">
            {member.name
              .split(' ')
              .map((part) => part[0])
              .join('')}
          </div>
          <div className="min-w-0">
            <h3 className="font-heading-sm text-heading-sm text-text-primary tracking-tight truncate">{member.name}</h3>
            <span className={`inline-flex px-1.5 py-0.5 rounded-full font-caption text-caption font-semibold ${member.roleClass}`}>
              {member.role}
            </span>
          </div>
        </div>
        <button
          aria-label="Close details"
          className="w-8 h-8 rounded-full bg-surface-container-low text-text-secondary flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          type="button"
          onClick={closeDetail}
        >
          <Icon name="close" className="text-[18px]" />
        </button>
      </div>

      <p className="font-label-sm text-label-sm text-text-secondary leading-relaxed mt-space-xs">{member.scope}</p>

      <div className="grid grid-cols-2 gap-space-xs mt-space-sm">
        {DETAILS.map((item) => (
          <div className="rounded-xl bg-surface-container-low p-space-xs min-w-0" key={item.label}>
            <span className="flex items-center gap-1 text-text-tertiary">
              <Icon name={item.icon} className="text-[13px]" />
              <span className="font-caption text-caption">{item.label}</span>
            </span>
            <p className="font-label-sm text-label-sm text-text-primary font-medium truncate mt-0.5">
              {item.value(member)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-space-sm">
        <div className="flex items-center justify-between">
          <h4 className="font-label-md text-label-md text-text-primary font-semibold">Permissions</h4>
          <span className="font-caption text-caption text-text-tertiary">
            {member.access.length} of {PERMISSION_LIST.length} allowed
          </span>
        </div>
        <div className="mt-space-2xs bg-surface-canvas rounded-xl divide-y divide-border-subtle">
          {PERMISSION_LIST.map((permission) => {
            const allowed = member.access.includes(permission);
            return (
              <div className="flex items-center justify-between gap-space-xs py-2 px-space-xs" key={permission}>
                <span className="font-label-sm text-label-sm text-text-primary truncate">{permission}</span>
                <Icon
                  name={allowed ? 'check_circle' : 'cancel'}
                  className={`text-[16px] shrink-0 ${allowed ? 'text-badge-discount-text' : 'text-text-tertiary'}`}
                  filled={allowed}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-space-sm">
        <h4 className="font-label-md text-label-md text-text-primary font-semibold">Manage</h4>
        <div className="mt-space-2xs bg-surface-canvas rounded-xl divide-y divide-border-subtle">
          {ACTIONS.map((action) => (
            <button
              className="w-full flex items-center gap-space-xs py-2.5 px-space-xs text-left active:bg-surface-container-low transition-colors"
              key={action.key}
              type="button"
              onClick={() => runAction(action.key, member)}
            >
              <span className="w-8 h-8 rounded-lg bg-surface-container-low text-text-secondary flex items-center justify-center shrink-0">
                <Icon name={action.icon} className="text-[16px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-label-sm text-label-sm text-text-primary block truncate">{action.label}</span>
                <span className="font-caption text-caption text-text-tertiary block truncate">{action.hint}</span>
              </span>
              <Icon name="chevron_right" className="text-[18px] text-text-tertiary shrink-0" />
            </button>
          ))}

          {confirmRemove ? (
            <div className="p-space-xs flex items-center justify-between gap-space-xs bg-badge-discount-bg">
              <span className="font-caption text-caption text-on-surface min-w-0">
                Remove {member.name} from the team? Access is revoked immediately.
              </span>
              <span className="flex items-center gap-1.5 shrink-0">
                <button
                  className="h-8 px-space-xs rounded-lg bg-surface-canvas font-label-sm text-label-sm text-text-primary"
                  type="button"
                  onClick={() => setConfirmRemove(false)}
                >
                  Cancel
                </button>
                <button
                  className="h-8 px-space-xs rounded-lg bg-badge-discount text-white font-label-sm text-label-sm font-semibold"
                  type="button"
                  onClick={() => removeMember(member)}
                >
                  Remove
                </button>
              </span>
            </div>
          ) : (
            <button
              className="w-full flex items-center gap-space-xs py-2.5 px-space-xs text-left active:bg-surface-container-low transition-colors"
              type="button"
              onClick={() => setConfirmRemove(true)}
            >
              <span className="w-8 h-8 rounded-lg bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                <Icon name="person_remove" className="text-[16px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-label-sm text-label-sm text-badge-discount-text block truncate">
                  Remove from team
                </span>
                <span className="font-caption text-caption text-text-tertiary block truncate">
                  Revoke access for this staff
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <AppScreen>
      <BusinessHubHeader />
      <div className="flex flex-col w-full flex-1 pb-24">
        {/* Header */}
        <section className="px-margin pt-space-md pb-space-xs bg-surface-canvas shadow-sm">
          <div className="flex items-start justify-between gap-space-xs">
            <div className="min-w-0">
              <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">Staff &amp; Team Access</h2>
              <p className="font-caption text-caption text-text-secondary mt-0.5">
                Roles, branch scope, and permission control in one place
              </p>
            </div>
            <button
              className="h-9 px-space-sm rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-sm shrink-0 active:scale-95 transition-transform"
              type="button"
              onClick={onInvite}
            >
              <Icon name="person_add" className="text-[16px]" />
              <span>Invite</span>
            </button>
          </div>

          <div className="mt-space-sm flex items-center justify-end gap-space-xs">
            <span className="font-caption text-caption text-text-tertiary">{members.length} team members</span>
          </div>
        </section>

        {/* Role filters */}
        <div className="w-full bg-surface-canvas px-margin pb-space-sm pt-space-2xs shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {ROLE_FILTERS.map((roleFilter) => {
              const active = filter === roleFilter.key;
              const count = roleCount(roleFilter.key);
              return (
                <button
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-all ${
                    active
                      ? 'bg-primary-container text-on-primary-container shadow-sm'
                      : 'text-text-secondary bg-surface-container-low hover:bg-surface-container-high'
                  }`}
                  key={roleFilter.key}
                  type="button"
                  onClick={() => setFilter(roleFilter.key)}
                >
                  <span>{roleFilter.label}</span>
                  <span
                    className={`font-caption text-caption px-1 rounded-full ${
                      active ? 'bg-white/20' : 'bg-surface-canvas text-text-secondary'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Staff list — one line per member */}
        <section className="px-margin pt-space-sm">
          {isDesktop ? (
            <div className="bg-surface-canvas rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
              <table className="w-full border-collapse min-w-[560px]">
                <thead>
                  <tr className="border-b border-border-subtle">
                    {['Team member', 'Role', 'Branch access', 'Last active', ''].map((label) => (
                      <th
                        className="text-left font-caption text-caption text-text-tertiary font-medium py-2 px-space-xs first:pl-space-sm"
                        key={label}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleStaff.map((member) => (
                    <tr className="border-b border-border-subtle last:border-0" key={member.key}>
                      <td className="py-2 pl-space-sm pr-space-xs">
                        <div className="flex items-center gap-space-xs min-w-0">
                          <span className="w-7 h-7 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center font-caption text-caption font-semibold shrink-0">
                            {member.name
                              .split(' ')
                              .map((part) => part[0])
                              .join('')}
                          </span>
                          <span className="min-w-0">
                            <span className="font-label-sm text-label-sm text-text-primary font-medium block truncate">
                              {member.name}
                            </span>
                            <span className="font-caption text-caption text-text-tertiary block truncate">
                              {member.email}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-space-xs">
                        <span className={`inline-flex px-1.5 py-0.5 rounded-full font-caption text-caption font-semibold whitespace-nowrap ${member.roleClass}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="py-2 px-space-xs font-caption text-caption text-text-secondary whitespace-nowrap">
                        {member.branches}
                      </td>
                      <td className="py-2 px-space-xs font-caption text-caption text-text-tertiary whitespace-nowrap">
                        {member.lastActive}
                      </td>
                      <td className="py-2 px-space-xs pr-space-sm text-right">
                        <button
                          className="h-8 px-space-xs rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1 ml-auto active:scale-95 transition-transform"
                          type="button"
                          onClick={() => setActiveMember(member)}
                        >
                          <span>Manage</span>
                          <Icon name="chevron_right" className="text-[15px]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-surface-canvas rounded-2xl shadow-sm divide-y divide-border-subtle">
              {visibleStaff.map((member) => (
                <button
                  className="w-full flex items-center gap-space-xs px-space-sm py-2.5 text-left active:bg-surface-container-low transition-colors"
                  key={member.key}
                  type="button"
                  onClick={() => setActiveMember(member)}
                >
                  <span className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center font-label-sm text-label-sm font-semibold shrink-0">
                    {member.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                        {member.name}
                      </span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded-full font-caption text-caption font-semibold shrink-0 ${member.roleClass}`}>
                        {member.role}
                      </span>
                    </span>
                    <span className="font-caption text-caption text-text-tertiary block truncate">
                      {member.branches} · {member.lastActive}
                    </span>
                  </span>
                  <Icon name="chevron_right" className="text-[20px] text-text-tertiary shrink-0" />
                </button>
              ))}
            </div>
          )}

          {visibleStaff.length === 0 && (
            <div className="py-space-lg flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-surface-container-high text-primary flex items-center justify-center mb-space-xs">
                <Icon name="group" className="text-[26px]" />
              </div>
              <h4 className="font-label-md text-label-md font-semibold text-text-primary">No team members here</h4>
              <p className="font-label-sm text-label-sm text-text-secondary max-w-xs mt-1">
                No one matches this role filter yet.
              </p>
            </div>
          )}
        </section>

        {/* Bottom invite CTA */}
        <section className="px-margin pt-space-md pb-space-md">
          <button
            className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
            type="button"
            onClick={onInvite}
          >
            <Icon name="person_add" className="text-[18px]" />
            <span>Invite Team Member</span>
          </button>
          <p className="font-caption text-caption text-text-tertiary text-center mt-space-xs">
            New teammates only get the access you approve.
          </p>
        </section>
      </div>

      {/* Staff detail — sheet on mobile, centered panel on desktop */}
      {activeMember &&
        (isDesktop ? (
          <div
            className="fixed inset-0 z-[60] bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-margin"
            onClick={closeDetail}
          >
            <div
              className="w-full max-w-[430px] max-h-[85vh] overflow-y-auto no-scrollbar bg-surface rounded-3xl p-space-md shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              {renderDetail(activeMember)}
            </div>
          </div>
        ) : (
          <div
            className="fixed inset-0 z-[60] bg-on-surface/50 backdrop-blur-sm flex items-end justify-center"
            onClick={closeDetail}
          >
            <div
              className="w-full max-w-[430px] bg-surface rounded-t-3xl p-space-md pb-[calc(env(safe-area-inset-bottom,0px)+16px)] max-h-[85vh] overflow-y-auto no-scrollbar shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              {renderDetail(activeMember)}
            </div>
          </div>
        ))}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-[70] pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}

      <BusinessTabBar active="business" onTab={onTab} />
    </AppScreen>
  );
}
