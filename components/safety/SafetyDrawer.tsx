import { useEffect, useState } from 'react';
import {
  X, AlertTriangle, Info, Ban, ShieldAlert, History, Link2,
  Megaphone, User, Gift, Plug, ArrowUpRight, Building2, Layers,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SEVERITY_META, statusMeta } from '../../data/safety';
import type { DrawerModel, DrawerAction, Severity, DrawerRelated } from '../../data/safety';

export function SeverityBadge({ severity, size = 'sm' }: { severity: Severity; size?: 'sm' | 'md' }) {
  const m = SEVERITY_META[severity];
  const Icon = severity === 'critical' ? Ban : severity === 'warning' ? AlertTriangle : Info;
  const pad = size === 'md' ? 'px-2.5 py-1 text-[12px]' : 'px-1.5 py-0.5 text-[10.5px]';
  return (
    <span className={`inline-flex items-center gap-1 rounded font-semibold leading-none ${pad}`} style={{ color: m.fg, background: m.bg }}>
      <Icon size={size === 'md' ? 13 : 10} strokeWidth={2.5} /> {m.label}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const m = statusMeta(status);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium leading-none" style={{ color: m.fg, background: m.bg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.fg }} /> {m.label}
    </span>
  );
}

export function SeverityDot({ severity }: { severity: Severity }) {
  return <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: SEVERITY_META[severity].fg }} />;
}

const RELATED_ICON: Record<DrawerRelated['kind'], LucideIcon> = {
  campaign: Megaphone, player: User, reward: Gift, provider: Plug, segment: Layers, brand: Building2,
};

const ACTION_STYLE: Record<DrawerAction['tone'], React.CSSProperties> = {
  primary: { background: 'var(--accent)', color: 'var(--accent-fg)' },
  danger: { background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(240,87,107,0.35)' },
  warning: { background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid rgba(231,168,60,0.35)' },
  default: { background: 'var(--surface-3)', color: 'var(--fg-secondary)', border: '1px solid var(--border-strong)' },
};

const FACT_TONE: Record<string, string> = {
  danger: 'var(--danger)', warning: 'var(--warning)', success: 'var(--success)',
};

export default function SafetyDrawer({
  model, onClose, onAction, onOpenCampaign, onOpenReview,
}: {
  model: DrawerModel | null;
  onClose: () => void;
  onAction: (id: string) => void;
  onOpenCampaign: (campaignId: string) => void;
  onOpenReview: (reviewId: string) => void;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (model) {
      const t = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(t);
    }
    setShown(false);
  }, [model]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!model) return null;
  const sev = SEVERITY_META[model.severity];

  const handleAction = (a: DrawerAction) => {
    if (a.id === 'view' && model.fullReviewId) { onOpenReview(model.fullReviewId); return; }
    if ((a.id === 'integration' || a.id === 'view') && model.openCampaignId) { onOpenCampaign(model.openCampaignId); return; }
    onAction(a.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 transition-opacity duration-200"
        style={{ background: 'var(--overlay-scrim)', opacity: shown ? 1 : 0 }}
      />
      {/* Panel */}
      <div
        className="relative flex h-full w-[452px] flex-col border-l transition-opacity duration-200"
        style={{ background: 'var(--surface-1)', borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-lg)', opacity: shown ? 1 : 0 }}
      >
        {/* Severity edge */}
        <span className="absolute left-0 top-0 h-full w-0.5" style={{ background: sev.fg }} />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">{model.kindLabel}</span>
              <SeverityBadge severity={model.severity} />
            </div>
            <h2 className="mt-1.5 truncate text-[15.5px] font-semibold tracking-tight text-fg-primary">{model.title}</h2>
            <div className="mt-0.5 truncate font-mono text-[11.5px] text-fg-muted">{model.subtitle}</div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-fg-muted transition-colors hover:text-fg-primary"
            style={{ background: 'var(--surface-2)' }}
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Status + risk reason */}
          <div className="mb-4 flex items-center gap-2">
            <StatusPill status={model.statusLabel} />
          </div>

          <Block icon={ShieldAlert} title="Risk reason">
            <p className="text-[12.5px] leading-relaxed text-fg-secondary">{model.riskReason}</p>
          </Block>

          {/* Facts */}
          <Block icon={Info} title="Summary">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {model.facts.map((f) => (
                <div key={f.label}>
                  <div className="text-[10.5px] font-medium uppercase tracking-wide text-fg-muted">{f.label}</div>
                  <div
                    className={`mt-0.5 text-[12.5px] font-medium ${f.mono ? 'font-mono tabular-nums' : ''}`}
                    style={{ color: f.tone && f.tone !== 'default' ? FACT_TONE[f.tone] : 'var(--fg-primary)' }}
                  >
                    {f.value}
                  </div>
                </div>
              ))}
            </div>
          </Block>

          {/* Related */}
          {model.related.length > 0 && (
          <Block icon={Link2} title="Related">
            <div className="flex flex-col gap-2">
              {model.related.map((r) => {
                const Icon = RELATED_ICON[r.kind];
                const clickable = r.kind === 'campaign' && model.openCampaignId;
                return (
                  <div
                    key={r.label + r.value}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    onClick={clickable ? () => onOpenCampaign(model.openCampaignId!) : undefined}
                    onKeyDown={clickable ? (e) => { if (e.key === 'Enter') onOpenCampaign(model.openCampaignId!); } : undefined}
                    className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 ${clickable ? 'cursor-pointer' : ''}`}
                    style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>
                      <Icon size={13} strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-medium uppercase tracking-wide text-fg-muted">{r.label}</div>
                      <div className="truncate text-[12.5px] font-medium text-fg-primary">{r.value}</div>
                    </div>
                    {clickable && <ArrowUpRight size={14} className="shrink-0 text-fg-muted" strokeWidth={2} />}
                  </div>
                );
              })}
            </div>
          </Block>
          )}

          {/* Timeline */}
          {model.timeline.length > 0 && (
          <Block icon={History} title="Timeline" last>
            <div className="flex flex-col">
              {model.timeline.map((e, i) => {
                const dot = e.tone === 'alert' ? 'var(--danger)' : e.tone === 'system' ? 'var(--fg-muted)' : 'var(--accent)';
                const isLast = i === model.timeline.length - 1;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} />
                      {!isLast && <span className="w-px flex-1" style={{ background: 'var(--border-strong)' }} />}
                    </div>
                    <div className={isLast ? 'pb-0' : 'pb-4'}>
                      <div className="text-[12px] font-medium text-fg-primary">{e.action}</div>
                      {e.detail && <div className="mt-0.5 text-[11.5px] leading-snug text-fg-secondary">{e.detail}</div>}
                      <div className="mt-0.5 text-[10.5px] text-fg-muted">{e.actor} · {e.at}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Block>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t px-5 py-3.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <div className="flex flex-wrap items-center gap-2">
            {model.actions.map((a) => (
              <button
                key={a.id}
                onClick={() => handleAction(a)}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[12.5px] font-semibold transition-colors"
                style={ACTION_STYLE[a.tone]}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Block({ icon: Icon, title, children, last }: { icon: LucideIcon; title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={last ? '' : 'mb-5'}>
      <div className="mb-2 flex items-center gap-1.5">
        <Icon size={13} className="text-fg-muted" strokeWidth={2} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">{title}</span>
      </div>
      {children}
    </div>
  );
}
