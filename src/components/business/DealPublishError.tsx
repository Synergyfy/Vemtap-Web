/** Floating error for the Deal Studio review step, which has no slot of its own. */
export function DealPublishError({ message, onDismiss }: { message: string | null; onDismiss: () => void }) {
  if (!message) return null;
  return (
    <div role="alert" className="fixed top-4 left-1/2 -translate-x-1/2 z-[90] w-[min(92vw,560px)] rounded-xl bg-error-container text-on-error-container px-space-md py-space-sm shadow-lg flex items-start gap-space-xs">
      <span className="flex-1 font-label-md text-label-md">{message}</span>
      <button type="button" onClick={onDismiss} className="font-label-md text-label-md underline">
        Dismiss
      </button>
    </div>
  );
}
