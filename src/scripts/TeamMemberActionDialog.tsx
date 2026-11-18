import { useState } from 'react';
import { DesktopModal, ModalCloseButton } from '../components/desktop/DesktopModal';
import { Icon } from '../components/ui/Icon';
import { SheetShell } from '../components/sheets/SheetShell';
import { useIsDesktop } from '../hooks/useIsDesktop';
import type { TeamMember, UpdateStaffInput } from '../services/teamService';
import { PAGE_PERMISSIONS, memberName, toApiPermissions, toPageIds } from './teamLive';

export type TeamMemberAction = 'edit' | 'role' | 'permissions';

interface TeamMemberActionDialogProps {
  member: TeamMember;
  action: TeamMemberAction;
  busy: boolean;
  onClose: () => void;
  onSave: (input: UpdateStaffInput) => void;
}

const PERMISSION_GROUPS = [
  { label: 'Overview & operations', pages: ['overview', 'orders', 'pos', 'messages'] },
  { label: 'Sales & catalogue', pages: ['catalog', 'deals', 'loyalty', 'boost'] },
  { label: 'Customers & team', pages: ['customers', 'staff', 'locations', 'profile'] },
  { label: 'Insights & account', pages: ['analytics', 'subscription', 'verification', 'more'] },
] as const;

const PERMISSION_LABELS: Record<string, string> = {
  overview: 'Overview & Dashboard',
  orders: 'Orders',
  pos: 'POS & Customer Display',
  messages: 'Messages',
  catalog: 'Products & Services',
  deals: 'Deals & Promotions',
  loyalty: 'Loyalty & Rewards',
  boost: 'Boost Campaigns',
  customers: 'Customers CRM',
  staff: 'Staff & Team Access',
  locations: 'Locations & Branches',
  profile: 'Business Profile',
  analytics: 'Analytics & Reports',
  subscription: 'Subscription & Add-ons',
  verification: 'Verification & Compliance',
  more: 'More & Settings',
};

const fieldClass =
  'w-full h-10 px-space-sm rounded-xl bg-surface-container-low text-text-primary font-label-sm text-label-sm placeholder:text-text-tertiary outline-none focus:bg-surface-canvas border border-border-subtle';

function ActionForm({ member, action, busy, onClose, onSave }: TeamMemberActionDialogProps) {
  const [name, setName] = useState(memberName(member));
  const [email, setEmail] = useState(member.email ?? '');
  const [role, setRole] = useState(member.role?.toLowerCase() === 'manager' ? 'manager' : 'staff');
  const [selectedPages, setSelectedPages] = useState(() => new Set(toPageIds(member.permissions)));
  const selectedPageCount = selectedPages.size;

  const title =
    action === 'edit' ? 'Edit member details' : action === 'role' ? 'Change team role' : 'Permissions matrix';
  const submitLabel = action === 'permissions' ? 'Save permissions' : action === 'role' ? 'Save role' : 'Save changes';

  const togglePage = (page: string) => {
    setSelectedPages((current) => {
      const next = new Set(current);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

  const save = () => {
    if (action === 'edit') {
      onSave({ name: name.trim(), email: email.trim() });
      return;
    }
    if (action === 'role') {
      onSave({ role, jobTitle: role === 'manager' ? 'Manager' : 'Staff' });
      return;
    }

    const knownPermissions = new Set(Object.values(PAGE_PERMISSIONS).flat());
    const existing = member.permissions ?? [];
    const preservedPermissions = existing.filter((permission) => !knownPermissions.has(permission));
    onSave({ permissions: [...new Set([...toApiPermissions([...selectedPages]), ...preservedPermissions])] });
  };

  const body = (
    <>
      <div className="flex items-center justify-between gap-space-sm px-space-md py-space-sm border-b border-border-subtle">
        <div className="min-w-0">
          <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">{title}</h3>
          <p className="font-caption text-caption text-text-secondary truncate">{memberName(member)}</p>
        </div>
        <ModalCloseButton onClose={onClose} label="Close staff editor" />
      </div>

      <div className="p-space-md flex flex-col gap-space-sm overflow-y-auto">
        {action === 'edit' && (
          <>
            <label className="flex flex-col gap-1 font-label-sm text-label-sm text-text-secondary">
              Full name
              <input
                autoComplete="name"
                className={fieldClass}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 font-label-sm text-label-sm text-text-secondary">
              Email
              <input
                autoComplete="email"
                className={fieldClass}
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
          </>
        )}

        {action === 'role' && (
          <label className="flex flex-col gap-1 font-label-sm text-label-sm text-text-secondary">
            Role
            <select className={fieldClass} value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
            </select>
            <span className="font-caption text-caption text-text-tertiary">
              Owners are protected and cannot be changed here.
            </span>
          </label>
        )}

        {action === 'permissions' && (
          <>
            <div className="flex items-center justify-between gap-space-sm">
              <p className="font-label-sm text-label-sm text-text-secondary">Choose the pages this member can access.</p>
              <span className="font-caption text-caption text-text-tertiary whitespace-nowrap">
                {selectedPageCount} of {Object.keys(PAGE_PERMISSIONS).length}
              </span>
            </div>
            {PERMISSION_GROUPS.map((group) => (
              <section key={group.label}>
                <h4 className="font-caption text-caption text-text-tertiary font-semibold uppercase tracking-wide mb-1">
                  {group.label}
                </h4>
                <div className="rounded-xl bg-surface-canvas divide-y divide-border-subtle">
                  {group.pages.map((page) => {
                    const checked = selectedPages.has(page);
                    return (
                      <button
                        key={page}
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        className="w-full flex items-center justify-between gap-space-sm px-space-sm py-2 text-left"
                        onClick={() => togglePage(page)}
                      >
                        <span className="font-label-sm text-label-sm text-text-primary">{PERMISSION_LABELS[page]}</span>
                        <span
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                            checked ? 'bg-primary border-primary' : 'bg-surface-canvas border-outline-variant'
                          }`}
                        >
                          {checked && <Icon name="check" className="text-on-primary text-[13px]" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
            <p className="font-caption text-caption text-text-tertiary">
              Permissions not represented in this matrix are preserved. Select at least one page to save.
            </p>
          </>
        )}
      </div>

      <div className="flex items-center justify-end gap-space-xs px-space-md py-space-sm border-t border-border-subtle">
        <button
          type="button"
          disabled={busy}
          className="h-10 px-space-md rounded-xl text-text-secondary hover:bg-surface-subtle font-button-secondary text-button-secondary disabled:opacity-50"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={
            busy ||
            (action === 'edit' && (!name.trim() || !/^\S+@\S+\.\S+$/.test(email.trim()))) ||
            (action === 'permissions' && selectedPageCount === 0)
          }
          className="h-10 px-space-md rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary font-semibold disabled:opacity-50"
          onClick={save}
        >
          {busy ? 'Saving...' : submitLabel}
        </button>
      </div>
    </>
  );

  return body;
}

export function TeamMemberActionDialog(props: TeamMemberActionDialogProps) {
  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return (
      <DesktopModal open onClose={props.onClose} maxWidth="max-w-xl" cardClassName="bg-surface-canvas max-h-[90vh]">
        <ActionForm {...props} />
      </DesktopModal>
    );
  }

  return (
    <SheetShell open onClose={props.onClose}>
      <ActionForm {...props} />
    </SheetShell>
  );
}
