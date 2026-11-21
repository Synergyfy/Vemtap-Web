import { useState } from 'react';
import { DesktopModal, ModalCloseButton } from '../components/desktop/DesktopModal';
import { Icon } from '../components/ui/Icon';
import { SheetShell } from '../components/sheets/SheetShell';
import { useIsDesktop } from '../hooks/useIsDesktop';
import type { TeamMember, UpdateStaffInput } from '../services/teamService';
import { memberName } from './teamLive';
import {
  ALL_STAFF_PAGE_IDS,
  PAGE_PERMISSIONS,
  STAFF_PAGE_TREE,
  toApiPermissions,
  toPageIds,
} from './staffPageAccess';

export type TeamMemberAction = 'edit' | 'role' | 'permissions';

interface TeamMemberActionDialogProps {
  member: TeamMember;
  action: TeamMemberAction;
  busy: boolean;
  onClose: () => void;
  onSave: (input: UpdateStaffInput) => void;
}

const fieldClass =
  'w-full h-10 px-space-sm rounded-xl bg-surface-container-low text-text-primary font-label-sm text-label-sm placeholder:text-text-tertiary outline-none focus:bg-surface-canvas border border-border-subtle';

function ActionForm({ member, action, busy, onClose, onSave }: TeamMemberActionDialogProps) {
  const [name, setName] = useState(memberName(member));
  const [email, setEmail] = useState(member.email ?? '');
  const [systemRole, setSystemRole] = useState(member.role?.toLowerCase() === 'manager' ? 'manager' : 'staff');
  const [roleLabel, setRoleLabel] = useState(member.jobTitle || member.roleTag || '');
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

  const toggleSection = (ids: string[], allGranted: boolean) => {
    setSelectedPages((current) => {
      const next = new Set(current);
      ids.forEach((id) => {
        if (allGranted) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const save = () => {
    if (action === 'edit') {
      onSave({ name: name.trim(), email: email.trim() });
      return;
    }
    if (action === 'role') {
      onSave({
        role: systemRole,
        jobTitle: roleLabel.trim() || 'Staff',
      });
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
          <>
            <label className="flex flex-col gap-1 font-label-sm text-label-sm text-text-secondary">
              Access level
              <select className={fieldClass} value={systemRole} onChange={(event) => setSystemRole(event.target.value)}>
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 font-label-sm text-label-sm text-text-secondary">
              Role shown to your team
              <input
                className={fieldClass}
                placeholder="e.g. Shift Supervisor"
                value={roleLabel}
                onChange={(event) => setRoleLabel(event.target.value)}
              />
              <span className="font-caption text-caption text-text-tertiary">
                Leave blank to show “Staff”. Owners are protected and cannot be changed here.
              </span>
            </label>
          </>
        )}

        {action === 'permissions' && (
          <>
            <div className="flex items-center justify-between gap-space-sm">
              <p className="font-label-sm text-label-sm text-text-secondary">Choose the pages this member can access.</p>
              <span className="font-caption text-caption text-text-tertiary whitespace-nowrap">
                {selectedPageCount} of {ALL_STAFF_PAGE_IDS.length}
              </span>
            </div>
            {STAFF_PAGE_TREE.map((section) => {
              const childIds = section.children.map((child) => child.id);
              const allGranted = section.children.length
                ? childIds.every((id) => selectedPages.has(id))
                : selectedPages.has(section.id);
              const someGranted = section.children.length
                ? childIds.some((id) => selectedPages.has(id))
                : allGranted;
              return (
                <section key={section.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={allGranted}
                    className="w-full flex items-center justify-between gap-space-sm px-space-sm py-1.5 text-left"
                    onClick={() => toggleSection(childIds.length ? childIds : [section.id], allGranted)}
                  >
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold">{section.label}</span>
                    <span
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                        allGranted ? 'bg-primary border-primary' : 'bg-surface-canvas border-outline-variant'
                      }`}
                    >
                      {allGranted ? (
                        <Icon name="check" className="text-on-primary text-[13px]" />
                      ) : someGranted ? (
                        <span className="w-2 h-0.5 rounded bg-primary" />
                      ) : null}
                    </span>
                  </button>
                  {section.children.length > 0 && (
                    <div className="rounded-xl bg-surface-canvas divide-y divide-border-subtle pl-space-sm">
                      {section.children.map((item) => {
                        const checked = selectedPages.has(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            role="checkbox"
                            aria-checked={checked}
                            className="w-full flex items-center justify-between gap-space-sm px-space-sm py-2 text-left"
                            onClick={() => togglePage(item.id)}
                          >
                            <span className="font-label-sm text-label-sm text-text-primary">{item.label}</span>
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
                  )}
                </section>
              );
            })}
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
