import { Check, AlertTriangle, Ban, Coins, ShieldCheck, Fingerprint, Scale, Plug, ScrollText, UserCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CheckItem, CheckSeverity, CheckCategory } from '../../data/reviews';

const SEV: Record<CheckSeverity, { fg: string; bg: string; icon: LucideIcon; label: string }> = {
  pass: { fg: 'var(--success)', bg: 'var(--status-live-bg)', icon: Check, label: 'Pass' },
  warning: { fg: 'var(--warning)', bg: 'var(--warning-bg)', icon: AlertTriangle, label: 'Warning' },
  blocker: { fg: 'var(--danger)', bg: 'var(--danger-bg)', icon: Ban, label: 'Blocker' },
};

const CAT_ICON: Record<CheckCategory, LucideIcon> = {
  Budget: Coins,
  Approvals: UserCheck,
  'Fraud & abuse': Fingerprint,
  'Responsible gambling': ShieldCheck,
  Jurisdiction: Scale,
  Fulfillment: Plug,
  Audit: ScrollText,
};

// Blockers first, then warnings, then passes.
const ORDER: Record<CheckSeverity, number> = { blocker: 0, warning: 1, pass: 2 };

export default function ReviewChecklist({ checks }: { checks: CheckItem[] }) {
  const sorted = [...checks].sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
  return (
    <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
      {sorted.map((c) => {
        const sev = SEV[c.severity];
        const SevIcon = sev.icon;
        const CatIcon = CAT_ICON[c.category];
        const emphasized = c.severity !== 'pass';
        return (
          <div key={c.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0" style={{ borderColor: 'var(--border-subtle)' }}>
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
              style={{ background: emphasized ? sev.bg : 'var(--surface-3)', color: emphasized ? sev.fg : 'var(--fg-muted)' }}
            >
              <SevIcon size={15} strokeWidth={2.25} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-fg-primary">{c.label}</span>
                <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-fg-muted">
                  <CatIcon size={11} strokeWidth={2} />
                  {c.category}
                </span>
              </div>
              <p className="mt-0.5 text-[12px] leading-relaxed text-fg-secondary">{c.detail}</p>
            </div>
            <span
              className="shrink-0 rounded px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide"
              style={{ color: sev.fg, background: emphasized ? sev.bg : 'var(--surface-3)' }}
            >
              {sev.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
