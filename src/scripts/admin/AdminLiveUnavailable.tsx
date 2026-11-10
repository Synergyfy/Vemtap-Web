/**
 * Shown in place of an admin section's sample data when running against the live API
 * and the backend has no admin endpoint for that section yet. Mock mode never renders it.
 */
export function AdminLiveUnavailable({ title, needs }: { title: string; needs: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 flex items-start gap-3">
      <span className="material-symbols-outlined text-[22px] text-slate-400 shrink-0">cloud_off</span>
      <div className="space-y-1">
        <h2 className="text-[14px] font-bold text-slate-900">{title} isn't available yet</h2>
        <p className="text-[12px] text-slate-600">
          The backend has no admin endpoint for this section, so there is no live data to show.
        </p>
        <p className="text-[11px] text-slate-500">Needs: {needs}</p>
      </div>
    </div>
  );
}
