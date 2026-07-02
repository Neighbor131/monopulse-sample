import { useMemo, useState } from 'react';
import { Flag, Unlock, ArrowUpRight, ChevronRight } from 'lucide-react';
import type { Player } from '../../data/players';
import { KYC_META, RG_META } from '../../data/players';
import { riskItems, reviewerNotes, RISK_KIND_META } from '../../data/playerDetail';
import type { RiskItem } from '../../data/playerDetail';
import { Pill } from '../../screens/Players';
import { Drawer, ConfirmBlock, AuditSection, SectionLabel, KV } from './Drawer';
import type { AuditEntry } from './Drawer';

// ─── helpers ────────────────────────────────────────────────────────────────

const SEVERITY_COLOR: Record<RiskItem['severity'], string> = {
  critical: 'var(--danger)',
  warning: 'var(--warning)',
  info: 'var(--fg-muted)',
};

const STATUS_META: Record<RiskItem['status'], { label: string; fg: string; bg: string }> = {
  open: { label: 'Open', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
  monitoring: { label: 'Monitoring', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
  resolved: { label: 'Resolved', fg: 'var(--success)', bg: 'var(--status-live-bg)' },
};

const SEVERITY_ORDER: RiskItem['severity'][] = ['critical', 'warning', 'info'];

type ActionKind = 'flag' | 'release' | 'escalate';
const ACTION_CFG: Record<ActionKind, { label: string; tone: 'danger' | 'warning' | 'accent'; icon: typeof Flag; verb: string; desc: string; audit: string; needNote: boolean; approval: boolean }> = {
  flag: { label: 'Flag abuse', tone: 'danger', icon: Flag, verb: 'Flag', desc: 'Flag this item as confirmed abuse or policy violation. Routes to the compliance queue for review and may trigger account restrictions.', audit: 'Flagged as abuse — submitted', needNote: true, approval: true },
  release: { label: 'Release hold', tone: 'accent', icon: Unlock, verb: 'Release', desc: 'Release the hold on this risk item. Because this may restore access to rewards or account features, it requires approval before taking effect.', audit: 'Hold released — submitted', needNote: true, approval: true },
  escalate: { label: 'Escalate to compliance', tone: 'warning', icon: ArrowUpRight, verb: 'Escalate', desc: 'Escalate this item to the compliance team for formal review. A note is required and will be recorded to the audit trail.', audit: 'Escalated to compliance', needNote: true, approval: false },
};

function actionsFor(item: RiskItem): ActionKind[] {
  if (item.status === 'resolved') return ['flag'];
  if (item.severity === 'critical') return ['flag', 'release', 'escalate'];
  if (item.status === 'open') return ['flag', 'release', 'escalate'];
  return ['flag', 'escalate'];
}

interface Audit extends AuditEntry { itemId: string }

// ─── component ──────────────────────────────────────────────────────────────

export default function RiskTab({ p }: { p: Player }) {
  const items = useMemo(() => {
    const raw = riskItems(p);
    return [...raw].sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));
  }, [p]);
  const notes = useMemo(() => reviewerNotes(p), [p]);

  const [sel, setSel] = useState<RiskItem | null>(null);
  const [action, setAction] = useState<ActionKind | null>(null);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);

  const close = () => { setSel(null); setAction(null); };

  const run = (item: RiskItem, kind: ActionKind, note: string) => {
    const cfg = ACTION_CFG[kind];
    setAudits((a) => [{ itemId: item.id, at: 'just now', actor: 'You', action: cfg.audit, note, pending: cfg.approval }, ...a]);
    setAction(null);
  };

  return (
    <div className="grid grid-cols-[1fr_340px] gap-6">
      {/* ── Left: risk item cards ── */}
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const isHovered = hovered === item.id;
          return (
            <div
              key={item.id}
              onClick={() => { setSel(item); setAction(null); }}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer rounded-xl border p-4 transition-colors"
              style={{
                borderColor: item.severity === 'critical' ? 'var(--danger)' : 'var(--border-subtle)',
                background: isHovered ? 'var(--surface-3)' : 'var(--surface-2)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* severity dot */}
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: SEVERITY_COLOR[item.severity] }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {/* kind chip */}
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ background: 'var(--surface-3)', color: 'var(--fg-muted)' }}>
                        {RISK_KIND_META[item.kind].label}
                      </span>
                      <Pill meta={STATUS_META[item.status]} />
                    </div>
                    <div className="text-[13px] font-medium text-fg-primary">{item.title}</div>
                    <div className="mt-0.5 text-[12px] text-fg-secondary">{item.detail}</div>
                    <div className="mt-1.5 text-[11px] text-fg-muted">{item.owner} · raised {item.raised}</div>
                  </div>
                </div>
                <ChevronRight size={15} className="text-fg-muted shrink-0 mt-1" strokeWidth={2} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Right rail ── */}
      <div className="flex flex-col gap-4">
        {/* Reviewer notes */}
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <div className="mb-3 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Reviewer notes &amp; history</div>
          {notes.length === 0 ? (
            <p className="text-[12px] text-fg-muted">No reviewer notes on file.</p>
          ) : (
            <div className="flex flex-col">
              {notes.map((n, i) => (
                <div key={i} className="relative flex gap-3 pb-3.5 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: 'var(--border-strong)' }} />
                    {i < notes.length - 1 && <span className="mt-1 w-px flex-1" style={{ background: 'var(--border-strong)' }} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-fg-muted">{n.author} · {n.at}</div>
                    <p className="mt-1 rounded-md px-2.5 py-1.5 text-[12px] leading-relaxed text-fg-secondary" style={{ background: 'var(--surface-2)' }}>{n.note}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* KYC / RG snapshot */}
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <div className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">KYC / RG snapshot</div>
          <KV label="KYC status"><Pill meta={KYC_META[p.kyc]} /></KV>
          <KV label="RG status"><Pill meta={RG_META[p.rg]} /></KV>
          <KV label="Jurisdiction">{p.jurisdiction}</KV>
          <KV label="Country">{p.country}</KV>
        </div>
      </div>

      {/* ── Drawer ── */}
      <Drawer
        open={!!sel}
        onClose={close}
        title={sel?.title ?? ''}
        subtitle={sel ? `${sel.id} · ${RISK_KIND_META[sel.kind].label}` : undefined}
        meta={sel && <Pill meta={STATUS_META[sel.status]} />}
        footer={sel && !action && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {actionsFor(sel).map((k) => {
              const cfg = ACTION_CFG[k];
              const Icon = cfg.icon;
              const isPrimary = k === 'release';
              return (
                <button
                  key={k}
                  onClick={() => setAction(k)}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold"
                  style={
                    isPrimary
                      ? { background: 'var(--accent)', color: 'var(--accent-fg)' }
                      : cfg.tone === 'danger'
                      ? { background: 'var(--danger-bg)', color: 'var(--danger)' }
                      : { border: '1px solid var(--border-strong)', color: cfg.tone === 'warning' ? 'var(--warning)' : 'var(--fg-secondary)' }
                  }
                >
                  <Icon size={13} strokeWidth={2} />{cfg.label}
                </button>
              );
            })}
          </div>
        )}
      >
        {sel && !action && (
          <div>
            <SectionLabel>Risk item detail</SectionLabel>
            <KV label="Kind">{RISK_KIND_META[sel.kind].label}</KV>
            <KV label="Severity">
              <span style={{ color: SEVERITY_COLOR[sel.severity] }} className="font-medium capitalize">{sel.severity}</span>
            </KV>
            <KV label="Status"><Pill meta={STATUS_META[sel.status]} /></KV>
            <KV label="Owner">{sel.owner}</KV>
            <KV label="Raised">{sel.raised}</KV>
            <p className="mt-3 rounded-lg px-3 py-2.5 text-[12px] leading-relaxed text-fg-secondary" style={{ background: 'var(--surface-2)' }}>{sel.detail}</p>
            <AuditSection entries={audits.filter((a) => a.itemId === sel.id)} />
          </div>
        )}
        {sel && action && (
          <ConfirmBlock
            icon={ACTION_CFG[action].icon}
            tone={ACTION_CFG[action].tone}
            title={`${ACTION_CFG[action].verb} — ${sel.title}`}
            description={ACTION_CFG[action].desc}
            requiresApproval={ACTION_CFG[action].approval}
            needNote={ACTION_CFG[action].needNote}
            confirmLabel={ACTION_CFG[action].verb}
            onConfirm={(note) => run(sel, action, note)}
            onCancel={() => setAction(null)}
          />
        )}
      </Drawer>
    </div>
  );
}
