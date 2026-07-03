import { useMemo, useState } from 'react';
import { FileClock, Filter, Search, ShieldCheck, UserRound } from 'lucide-react';
import { REVIEWS } from '../data/reviews';
import { REWARD_AUDIT } from '../data/rewards';
import { EVENT_LOGS } from '../data/integrations';

type AuditSource = 'approval' | 'reward' | 'event';
type AuditRow = {
  id: string;
  at: string;
  source: AuditSource;
  actor: string;
  action: string;
  target: string;
  detail: string;
  risk: 'normal' | 'warning' | 'critical';
};

export default function AuditLog() {
  const [source, setSource] = useState<AuditSource | 'all'>('all');
  const [query, setQuery] = useState('');
  const rows = useMemo<AuditRow[]>(() => [
    ...REVIEWS.flatMap((review) => review.audit.map((entry) => ({
      id: `${review.id}-${entry.id}`,
      at: entry.at,
      source: 'approval' as AuditSource,
      actor: `${entry.actor} · ${entry.actorRole}`,
      action: entry.action,
      target: review.name,
      detail: entry.detail ?? review.slaHint,
      risk: entry.kind === 'reject' || review.decision === 'blocked' ? 'critical' as const : entry.kind === 'changes' || entry.kind === 'reset' ? 'warning' as const : 'normal' as const,
    }))),
    ...REWARD_AUDIT.map((entry) => ({
      id: entry.id,
      at: entry.at,
      source: 'reward' as AuditSource,
      actor: entry.actor,
      action: entry.action,
      target: entry.target,
      detail: entry.note,
      risk: entry.action.toLowerCase().includes('blocked') ? 'critical' as const : entry.action.toLowerCase().includes('retried') ? 'warning' as const : 'normal' as const,
    })),
    ...EVENT_LOGS.map((event) => ({
      id: event.id,
      at: event.at,
      source: 'event' as AuditSource,
      actor: event.source,
      action: event.eventType,
      target: event.playerId,
      detail: event.validation,
      risk: event.status === 'failed' || event.status === 'quarantined' ? 'critical' as const : event.status === 'retrying' ? 'warning' as const : 'normal' as const,
    })),
  ], []);

  const filtered = rows.filter((row) => {
    if (source !== 'all' && row.source !== source) return false;
    if (query && !`${row.actor} ${row.action} ${row.target} ${row.detail}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="mx-auto w-full max-w-[1360px] px-8 py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[19px] font-semibold tracking-tight">Audit log</h1>
          <p className="mt-1 text-[13px] text-fg-secondary">Unified audit explorer for approvals, reward actions and event-processing evidence.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3">
        <Kpi icon={FileClock} label="Audit records" value={String(rows.length)} />
        <Kpi icon={ShieldCheck} label="Critical" value={String(rows.filter((row) => row.risk === 'critical').length)} accent="var(--danger)" />
        <Kpi icon={Filter} label="Sources" value="3" />
        <Kpi icon={UserRound} label="Actors" value={String(new Set(rows.map((row) => row.actor)).size)} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Segment value={source} onChange={(value) => setSource(value as AuditSource | 'all')} options={['all', 'approval', 'reward', 'event']} />
        <div className="ml-auto flex items-center gap-2 rounded-md border px-3 py-2" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
          <Search size={14} className="text-fg-muted" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search actors, targets, evidence..." className="w-72 bg-transparent text-[13px] outline-none" />
        </div>
      </div>

      <section className="mt-4 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-[1080px] w-full border-collapse text-left">
            <thead><tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-2)' }}><th className="px-5 py-2.5">Time</th><th className="px-4 py-2.5">Source</th><th className="px-4 py-2.5">Actor</th><th className="px-4 py-2.5">Action</th><th className="px-4 py-2.5">Target</th><th className="px-4 py-2.5">Evidence</th><th className="px-4 py-2.5">Risk</th></tr></thead>
            <tbody>{filtered.map((row) => <tr key={row.id} className="border-t" style={{ borderColor: 'var(--border-subtle)' }}><td className="px-5 py-3 font-mono text-[12px] text-fg-muted">{row.at}</td><td className="px-4 py-3"><span className="rounded-md px-2 py-1 text-[11px] font-semibold capitalize" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{row.source}</span></td><td className="px-4 py-3 text-[12px] text-fg-secondary">{row.actor}</td><td className="px-4 py-3 text-[12.5px] font-semibold text-fg-primary">{row.action}</td><td className="px-4 py-3 text-[12px] text-fg-secondary">{row.target}</td><td className="px-4 py-3 text-[12px] text-fg-muted">{row.detail}</td><td className="px-4 py-3"><Risk risk={row.risk} /></td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, accent = 'var(--accent)' }: { icon: typeof FileClock; label: string; value: string; accent?: string }) {
  return <div className="rounded-xl border px-4 py-3.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}><div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><Icon size={13} style={{ color: accent }} />{label}</div><div className="mt-1.5 font-mono text-[22px] font-semibold leading-none text-fg-primary">{value}</div></div>;
}

function Segment({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <div className="flex rounded-lg border p-1" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>{options.map((option) => <button key={option} onClick={() => onChange(option)} className="rounded-md px-2.5 py-1.5 text-[12.5px] font-medium capitalize" style={value === option ? { background: 'var(--surface-3)', color: 'var(--fg-primary)' } : { color: 'var(--fg-secondary)' }}>{option}</button>)}</div>;
}

function Risk({ risk }: { risk: AuditRow['risk'] }) {
  const color = risk === 'critical' ? 'var(--danger)' : risk === 'warning' ? 'var(--warning)' : 'var(--success)';
  const bg = risk === 'critical' ? 'var(--danger-bg)' : risk === 'warning' ? 'var(--warning-bg)' : 'var(--status-live-bg)';
  return <span className="rounded-md px-2 py-1 text-[11px] font-semibold capitalize" style={{ color, background: bg }}>{risk}</span>;
}
