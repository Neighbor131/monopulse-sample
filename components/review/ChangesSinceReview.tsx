import { ArrowRight, RotateCcw } from 'lucide-react';
import type { ChangeEntry } from '../../data/reviews';

export default function ChangesSinceReview({ changes }: { changes: ChangeEntry[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-start gap-2.5 rounded-lg border px-4 py-3" style={{ borderColor: 'rgba(231,168,60,0.35)', background: 'var(--warning-bg)' }}>
        <RotateCcw size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--warning)' }} strokeWidth={2} />
        <p className="text-[12.5px] leading-relaxed text-fg-primary">
          <span className="font-medium">Approval was reset.</span> The creator changed {changes.filter((c) => c.sensitive).length} sensitive {changes.filter((c) => c.sensitive).length === 1 ? 'field' : 'fields'} after this campaign was approved. Re-review the changes below before deciding again.
        </p>
      </div>
      {changes.map((c, i) => (
        <div key={i} className="rounded-lg border px-4 py-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] font-medium text-fg-primary">{c.field}</span>
              {c.sensitive && (
                <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--warning)', background: 'var(--warning-bg)' }}>
                  Sensitive
                </span>
              )}
            </div>
            <span className="text-[11px] text-fg-muted">{c.by} · {c.at}</span>
          </div>
          <div className="mt-2 flex items-center gap-2.5 text-[12.5px]">
            <span className="rounded px-2 py-1 font-mono line-through" style={{ background: 'var(--surface-3)', color: 'var(--fg-muted)' }}>{c.before}</span>
            <ArrowRight size={14} className="shrink-0 text-fg-muted" strokeWidth={2} />
            <span className="rounded px-2 py-1 font-mono font-medium" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{c.after}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
