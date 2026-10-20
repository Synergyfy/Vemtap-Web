import { Icon } from '../ui/Icon';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { DesktopModal, ModalCloseButton } from '../desktop/DesktopModal';
import { SheetShell } from '../sheets/SheetShell';
import { PLATFORM_CONNECTORS } from '../../scripts/productImport/platformConnectors';

export interface AddProductMethodsDialogProps {
  open: boolean;
  onClose: () => void;
  /** Opens the existing 4-step manual add-product wizard. */
  onAddManually: () => void;
  /** Opens the Bulk Product Import wizard (CSV/Excel). */
  onBulkImport: () => void;
}

interface MethodOption {
  key: string;
  icon: string;
  title: string;
  desc: string;
  onSelect?: () => void;
  disabled?: boolean;
  badge?: string;
}

function MethodBody({ onClose, onAddManually, onBulkImport }: Omit<AddProductMethodsDialogProps, 'open'>) {
  const options: MethodOption[] = [
    {
      key: 'manual',
      icon: 'edit_note',
      title: 'Add Manually',
      desc: 'Fill in one product at a time with the guided form',
      onSelect: onAddManually,
    },
    {
      key: 'bulk',
      icon: 'upload_file',
      title: 'Bulk Import (CSV/Excel)',
      desc: 'Upload a spreadsheet and import many products at once',
      onSelect: onBulkImport,
    },
    {
      key: 'platform',
      icon: 'sync_alt',
      title: 'Connect an Existing Platform',
      desc: 'Pull products from Shopify, WooCommerce & more',
      disabled: true,
      badge: 'Coming Soon',
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-space-md pt-space-md pb-space-sm border-b border-border-subtle">
        <div className="flex items-center gap-space-sm min-w-0">
          <span className="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
            <Icon name="add_shopping_cart" className="text-[22px]" />
          </span>
          <div className="flex flex-col min-w-0">
            <h3 className="font-heading-sm text-heading-sm text-text-primary">Add Product</h3>
            <p className="font-caption text-caption text-text-secondary">Choose how you&apos;d like to add products</p>
          </div>
        </div>
        <ModalCloseButton onClose={onClose} />
      </div>

      <div className="p-space-md flex flex-col gap-space-xs">
        {options.map((option) => {
          const interactive = !option.disabled;
          return (
            <button
              key={option.key}
              type="button"
              disabled={option.disabled}
              aria-disabled={option.disabled}
              onClick={option.onSelect}
              className={`w-full flex items-center gap-space-sm p-space-sm rounded-xl text-left transition-colors ${
                interactive
                  ? 'bg-surface-container-low hover:bg-surface-container active:scale-[0.99]'
                  : 'bg-surface-subtle cursor-not-allowed opacity-80'
              }`}
            >
              <span
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  interactive ? 'bg-surface-tint-blue text-primary' : 'bg-surface-container-high text-text-tertiary'
                }`}
              >
                <Icon name={option.icon} className="text-[20px]" />
              </span>
              <span className="flex flex-col min-w-0 flex-1">
                <span className="flex items-center gap-space-2xs min-w-0">
                  <span
                    className={`font-label-md text-label-md font-semibold truncate ${
                      interactive ? 'text-text-primary' : 'text-text-secondary'
                    }`}
                  >
                    {option.title}
                  </span>
                  {option.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-text-secondary font-caption text-caption font-semibold whitespace-nowrap">
                      {option.badge}
                    </span>
                  )}
                </span>
                <span className="font-caption text-caption text-text-secondary mt-0.5">{option.desc}</span>
              </span>
              {interactive && <Icon name="chevron_right" className="text-[18px] text-text-tertiary shrink-0" />}
            </button>
          );
        })}

        <p className="font-caption text-caption text-text-tertiary px-space-2xs pt-space-2xs leading-relaxed">
          Platform connections aren&apos;t live yet ({PLATFORM_CONNECTORS.map((connector) => connector.name).join(', ')}
          ) — nothing is synced until they&apos;re officially launched.
        </p>
      </div>
    </div>
  );
}

/** Add Product → method chooser. Desktop modal / mobile sheet per app conventions. */
export function AddProductMethodsDialog({ open, onClose, onAddManually, onBulkImport }: AddProductMethodsDialogProps) {
  const isDesktop = useIsDesktop();
  if (!open) return null;

  if (isDesktop) {
    return (
      <DesktopModal open={open} onClose={onClose} maxWidth="max-w-md">
        <MethodBody onClose={onClose} onAddManually={onAddManually} onBulkImport={onBulkImport} />
      </DesktopModal>
    );
  }

  return (
    <SheetShell open={open} onClose={onClose}>
      <div className="w-full flex justify-center pt-3 pb-1">
        <div className="w-12 h-1.5 rounded-full bg-surface-dim" />
      </div>
      <div className="max-h-[80vh] overflow-y-auto">
        <MethodBody onClose={onClose} onAddManually={onAddManually} onBulkImport={onBulkImport} />
      </div>
    </SheetShell>
  );
}
