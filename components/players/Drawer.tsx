import { useState } from 'react';
import { X, ShieldAlert, Lock, History } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Right-side drawer shell
// ─────────────────────────────────────────────────────────────
export function Drawer({ open, onClose, title, subtitle, meta, children, footer }: {
  open: boolean; onClose: () => void; title: string; subtitle?: string; meta?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-[460px] flex-col border-l" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-md)' }}>
        <div className="flex items-start justify-between gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="min-w-0">
            <div className="text-[14px] font-semibold tracking-tight text-fg-primary">{title}</div>
            {subtitle && <div className="mt-0.5 truncate text-[12px] text-fg-muted">{subtitle}</div>}
            {meta && <div className="mt-2 flex flex-wrap items-center gap-1.5">{meta}</div>}
          </div>
          <button onClick={onClose} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-fg-muted transition-colors hover:text-fg-primary" style={{ background: 'var(--surface-3)' }}><X size={15} strokeWidth={2} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t px-5 py-3.5" style={{ borderColor: 'var(--border-subtle)' }}>{footer}</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Confirm / approval block — gates controlled + destructive actions
// ─────────────────────────────────────────────────────────────
export function ConfirmBlock({ icon: Icon = ShieldAlert, tone = 'danger', title, description, requiresApproval, confirmLabel, onConfirm, onCancel, needNote }: {
  icon?: LucideIcon; tone?: 'danger' | 'warning' | 'accent'; title: string; description: string; requiresApproval?: boolean; confirmLabel: string; onConfirm: (note: string) => void; onCancel: () => void; needNote?: boolean;
}) {
  const [note, setNote] = useState('');
  const c = tone === 'danger' ? 'var(--danger)' : tone === 'warning' ? 'var(--warning)' : 'var(--accent)';
  const bg = tone === 'danger' ? 'var(--danger-bg)' : tone === 'warning' ? 'var(--warning-bg)' : 'var(--accent-bg)';
  const blocked = needNote && note.trim().length === 0;
  return (
    <div>
      <div className="flex items-start gap-3 rounded-lg border p-3.5" style={{ borderColor: c, background: bg }}>
        <Icon size={16} className="mt-0.5 shrink-0" style={{ color: c }} strokeWidth={2} />
        <div>
          <div className="text-[13px] font-semibold text-fg-primary">{title}</div>
          <p className="mt-1 text-[12px] leading-relaxed text-fg-secondary">{description}</p>
        </div>
      </div>
      {requiresApproval && (
        <div className="mt-2.5 flex items-center gap-2 rounded-md px-3 py-2 text-[11.5px] font-medium" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>
          <Lock size={13} style={{ color: 'var(--status-scheduled)' }} strokeWidth={2} /> Requires approval — routed to the approvals queue before it takes effect.
        </div>
      )}
      <div className="mt-3">
        <label className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Reason {needNote && <span style={{ color: 'var(--danger)' }}>*</span>}<span className="ml-1 font-normal normal-case text-fg-muted">· recorded to audit trail</span></label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Add a note explaining this action…" className="mt-1.5 w-full resize-none rounded-md border px-3 py-2 text-[12.5px] outline-none" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)', color: 'var(--fg-primary)' }} />
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <button onClick={onCancel} className="rounded-md px-3 py-1.5 text-[12.5px] font-medium text-fg-secondary" style={{ border: '1px solid var(--border-strong)' }}>Cancel</button>
        <button onClick={() => !blocked && onConfirm(note)} disabled={blocked} className="rounded-md px-3 py-1.5 text-[12.5px] font-semibold" style={{ background: c, color: '#fff', opacity: blocked ? 0.45 : 1, cursor: blocked ? 'not-allowed' : 'pointer' }}>{requiresApproval ? 'Submit for approval' : confirmLabel}</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Audit trail
// ─────────────────────────────────────────────────────────────
export interface AuditEntry { at: string; actor: string; action: string; note?: string; pending?: boolean }
export function AuditList({ entries }: { entries: AuditEntry[] }) {
  if (entries.length === 0) return <p className="text-[12px] text-fg-muted">No manual changes recorded.</p>;
  return (
    <div className="flex flex-col">
      {entries.map((e, i) => (
        <div key={i} className="relative flex gap-3 pb-3.5 last:pb-0">
          <div className="flex flex-col items-center">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: e.pending ? 'var(--status-scheduled)' : 'var(--accent)' }} />
            {i < entries.length - 1 && <span className="mt-1 w-px flex-1" style={{ background: 'var(--border-strong)' }} />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] font-medium text-fg-primary">{e.action}</span>
              {e.pending && <span className="rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide" style={{ background: 'var(--status-scheduled-bg)', color: 'var(--status-scheduled)' }}>Pending approval</span>}
            </div>
            <div className="mt-0.5 text-[11px] text-fg-muted">{e.actor} · {e.at}</div>
            {e.note && <p className="mt-1 rounded-md px-2.5 py-1.5 text-[11.5px] italic text-fg-secondary" style={{ background: 'var(--surface-2)' }}>“{e.note}”</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
export function AuditSection({ entries }: { entries: AuditEntry[] }) {
  return (
    <div>
      <SectionLabel icon={History}>Audit trail</SectionLabel>
      <AuditList entries={entries} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Small shared primitives for tab detail views
// ─────────────────────────────────────────────────────────────
export function SectionLabel({ icon: Icon, children }: { icon?: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="mb-2.5 mt-5 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted first:mt-0">
      {Icon && <Icon size={13} strokeWidth={2} />}{children}
    </div>
  );
}
export function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t py-2 first:border-t-0 first:pt-0" style={{ borderColor: 'var(--border-subtle)' }}>
      <span className="text-[12px] text-fg-muted">{label}</span>
      <span className="text-right text-[12.5px] font-medium text-fg-primary">{children}</span>
    </div>
  );
}
export function Bar({ value, tone = 'var(--accent)' }: { value: number; tone?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--surface-3)' }}>
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: tone }} />
    </div>
  );
}
