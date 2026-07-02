import { FilePlus, Pencil, Send, Check, X, MessageSquare, RotateCcw, Cpu } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AuditEntry, AuditKind } from '../../data/reviews';

const KIND: Record<AuditKind, { icon: LucideIcon; fg: string }> = {
  create: { icon: FilePlus, fg: 'var(--fg-secondary)' },
  edit: { icon: Pencil, fg: 'var(--fg-secondary)' },
  submit: { icon: Send, fg: 'var(--accent)' },
  approve: { icon: Check, fg: 'var(--success)' },
  reject: { icon: X, fg: 'var(--danger)' },
  changes: { icon: MessageSquare, fg: 'var(--status-scheduled)' },
  reset: { icon: RotateCcw, fg: 'var(--warning)' },
  comment: { icon: MessageSquare, fg: 'var(--fg-muted)' },
  system: { icon: Cpu, fg: 'var(--fg-muted)' },
};

export default function AuditTimeline({ entries }: { entries: AuditEntry[] }) {
  const ordered = [...entries].reverse();
  return (
    <ol className="flex flex-col">
      {ordered.map((e, i) => {
        const meta = KIND[e.kind];
        const Icon = meta.icon;
        const last = i === ordered.length - 1;
        return (
          <li key={e.id} className="relative flex gap-3 pb-4 last:pb-0">
            {!last && <span className="absolute left-[13px] top-7 bottom-0 w-px" style={{ background: 'var(--border-strong)' }} />}
            <div
              className="relative z-10 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border-strong)', color: meta.fg }}
            >
              <Icon size={13} strokeWidth={2.25} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[12.5px] font-medium text-fg-primary">{e.action}</span>
                <span className="shrink-0 text-[11px] text-fg-muted">{e.at}</span>
              </div>
              <div className="text-[11.5px] text-fg-secondary">
                {e.actor} <span className="text-fg-muted">· {e.actorRole}</span>
              </div>
              {e.detail && <p className="mt-0.5 text-[11.5px] leading-relaxed text-fg-muted">{e.detail}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
