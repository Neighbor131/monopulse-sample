import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Add,
  ArrowRight,
  CalendarTick,
  Chart,
  Clock,
  Code,
  Data,
  Diagram,
  Gift,
  Health,
  MoneyTick,
  People,
  Routing,
  SecuritySafe,
  StatusUp,
  TaskSquare,
  TrendUp,
  Warning2,
} from 'iconsax-react';
import type { Icon } from 'iconsax-react';
import {
  actionQueue,
  experiments,
  healthCards,
  performanceMetrics,
  quickLinks,
  timeline,
} from '../data/dashboard';
import type { ActionQueueItem, DashboardSeverity, ExperimentRow, TimelineItem } from '../data/dashboard';

const HEALTH_ICON: Record<string, Icon> = {
  campaigns: StatusUp,
  rewards: Gift,
  risk: SecuritySafe,
  integrations: Code,
  segments: People,
  brands: Routing,
};

const QUEUE_ICON: Record<ActionQueueItem['kind'], Icon> = {
  approval: TaskSquare,
  reward: Gift,
  segment: People,
  integration: Code,
  brand: Routing,
  risk: SecuritySafe,
};

const TIMELINE_ICON: Record<TimelineItem['kind'], Icon> = {
  campaign: StatusUp,
  reward: Gift,
  segment: People,
  integration: Code,
  risk: SecuritySafe,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const health = healthCards();
  const queue = actionQueue();
  const metrics = performanceMetrics();
  const events = timeline();

  return (
    <div className="mx-auto w-full max-w-[1360px] px-8 py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[19px] font-semibold tracking-tight">Dashboard</h1>
            <SeverityPill severity={health.some((h) => h.severity === 'critical') ? 'critical' : health.some((h) => h.severity === 'warning') ? 'warning' : 'healthy'} label="Today" />
          </div>
          <p className="mt-1 text-[13px] text-fg-secondary">Command center for campaign health, rewards, segments, approvals, integrations and brand readiness.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/approvals')} className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)', border: '1px solid var(--border-strong)' }}>
            <TaskSquare size={15} variant="Linear" /> Review queue
          </button>
          <button onClick={() => navigate('/create')} className="flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            <Add size={15} variant="Linear" /> Create campaign
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-6 gap-3">
        {health.map((h) => <HealthCard key={h.id} card={h} onOpen={() => navigate(h.href)} />)}
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] gap-4">
        <section className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <SectionHeader icon={TaskSquare} title="Action queue" desc="Highest-priority work across approvals, rewards, segments and integrations." />
          <div className="overflow-x-auto">
            <div className="min-w-[820px] divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="grid grid-cols-[120px_minmax(300px,1fr)_170px_110px] items-center gap-4 px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-2)' }}>
                <span>Type</span>
                <span>Item</span>
                <span>Owner</span>
                <span>Severity</span>
              </div>
              {queue.map((q) => {
                const Icon = QUEUE_ICON[q.kind];
                return (
                  <button key={q.id} onClick={() => navigate(q.href)} className="grid w-full grid-cols-[120px_minmax(300px,1fr)_170px_110px] items-center gap-4 px-5 py-3 text-left hover:bg-[var(--surface-2)]">
                    <span className="inline-flex items-center gap-2 text-[12px] capitalize text-fg-secondary"><Icon size={14} variant="Linear" /> {q.kind}</span>
                    <div className="min-w-0"><div className="truncate text-[13px] font-medium text-fg-primary">{q.title}</div><div className="truncate text-[11.5px] text-fg-muted">{q.detail}</div></div>
                    <span className="truncate text-[12px] text-fg-secondary">{q.owner}</span>
                    <SeverityPill severity={q.severity} />
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <SectionHeader icon={Chart} title="Performance snapshot" desc="Live commercial and engagement readout." />
          <div className="grid gap-3 p-4">
            {metrics.map((m) => <Metric key={m.label} metric={m} />)}
          </div>
        </section>
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_420px] gap-4">
        <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <SectionHeader icon={Activity} title="Operational timeline" desc="Recent events from campaign, reward, segment, integration and risk systems." />
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {events.map((e) => {
              const Icon = TIMELINE_ICON[e.kind];
              return (
                <button key={e.id} onClick={() => navigate(e.href)} className="grid w-full grid-cols-[70px_28px_1fr_100px] items-start gap-3 px-5 py-3 text-left hover:bg-[var(--surface-2)]">
                  <span className="font-mono text-[12px] text-fg-muted">{e.at}</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: 'var(--surface-3)', color: severityColor(e.severity) }}><Icon size={13} variant="Linear" color={severityColor(e.severity)} /></span>
                  <div className="min-w-0"><div className="truncate text-[13px] font-medium text-fg-primary">{e.title}</div><div className="truncate text-[12px] text-fg-secondary">{e.detail}</div></div>
                  <SeverityPill severity={e.severity} />
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <SectionHeader icon={Data} title="Quick links" desc="Common operator actions." />
          <div className="grid gap-2 p-4">
            {quickLinks.map((l) => (
              <button key={l.label} onClick={() => navigate(l.href)} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
                <span><span className="block text-[13px] font-medium text-fg-primary">{l.label}</span><span className="block text-[11.5px] text-fg-muted">{l.detail}</span></span>
                <ArrowRight size={15} variant="Linear" color="var(--fg-muted)" />
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-4 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <SectionHeader icon={Diagram} title="A/B experiment monitor" desc="Prototype and campaign comparison readout for product-owner review." />
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full border-collapse text-left">
            <thead><tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-2)' }}><th className="px-5 py-2.5">Experiment</th><th className="px-4 py-2.5">Variant A</th><th className="px-4 py-2.5">Variant B</th><th className="px-4 py-2.5 text-right">Audience</th><th className="px-4 py-2.5 text-right">Lift</th><th className="px-4 py-2.5">Confidence</th><th className="px-4 py-2.5">Status</th></tr></thead>
            <tbody>{experiments.map((e) => <Experiment key={e.id} exp={e} />)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function HealthCard({ card, onOpen }: { card: ReturnType<typeof healthCards>[number]; onOpen: () => void }) {
  const Icon = HEALTH_ICON[card.id] ?? Health;
  return (
    <button onClick={onOpen} className="rounded-xl border px-4 py-3.5 text-left hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><span className="flex h-5 w-5 items-center justify-center rounded" style={{ background: 'var(--surface-3)' }}><Icon size={12} variant="Linear" color={severityColor(card.severity)} /></span>{card.label}</div>
      <div className="mt-1.5 font-mono text-[22px] font-semibold leading-none tabular-nums text-fg-primary">{card.value}</div>
      <div className="mt-1 truncate text-[11.5px] text-fg-muted">{card.detail}</div>
    </button>
  );
}

function SectionHeader({ icon: Icon, title, desc }: { icon: Icon; title: string; desc: string }) {
  return <div className="border-b px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}><div className="flex items-center gap-2"><Icon size={14} variant="Linear" color="var(--fg-muted)" /><h2 className="text-[14px] font-semibold text-fg-primary">{title}</h2></div><p className="mt-0.5 text-[12.5px] text-fg-secondary">{desc}</p></div>;
}

function Metric({ metric }: { metric: ReturnType<typeof performanceMetrics>[number] }) {
  const color = metric.tone === 'warning' ? 'var(--warning)' : metric.tone === 'down' ? 'var(--danger)' : metric.tone === 'up' ? 'var(--success)' : 'var(--fg-primary)';
  const Icon = metric.tone === 'warning' ? Warning2 : metric.tone === 'up' ? TrendUp : MoneyTick;
  return <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div className="flex items-center justify-between gap-3"><span className="text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">{metric.label}</span><Icon size={13} variant="Linear" color={color} /></div><div className="mt-1 font-mono text-[20px] font-semibold tabular-nums text-fg-primary">{metric.value}</div><div className="mt-0.5 text-[11.5px]" style={{ color }}>{metric.delta}</div></div>;
}

function Experiment({ exp }: { exp: ExperimentRow }) {
  const severity: DashboardSeverity = exp.status === 'needs_review' ? 'warning' : 'healthy';
  return <tr className="border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><td className="px-5 py-3"><div className="text-[13px] font-medium text-fg-primary">{exp.name}</div><div className="font-mono text-[11px] text-fg-muted">{exp.id}</div></td><td className="px-4 py-3 text-[12.5px] text-fg-secondary">{exp.variantA}</td><td className="px-4 py-3 text-[12.5px] text-fg-secondary">{exp.variantB}</td><td className="px-4 py-3 text-right font-mono text-[12.5px] text-fg-secondary">{exp.audience.toLocaleString()}</td><td className="px-4 py-3 text-right font-mono text-[12.5px]" style={{ color: 'var(--success)' }}>{exp.lift}</td><td className="px-4 py-3 text-[12.5px] text-fg-secondary">{exp.confidence}</td><td className="px-4 py-3"><SeverityPill severity={severity} label={exp.status.replace('_', ' ')} /></td></tr>;
}

function SeverityPill({ severity, label }: { severity: DashboardSeverity; label?: string }) {
  const style = severity === 'healthy' ? { color: 'var(--success)', background: 'var(--status-live-bg)' } : severity === 'warning' ? { color: 'var(--warning)', background: 'var(--warning-bg)' } : { color: 'var(--danger)', background: 'var(--danger-bg)' };
  return <span className="inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium capitalize leading-none" style={style}><span className="h-1.5 w-1.5 rounded-full" style={{ background: style.color }} /> {label ?? severity}</span>;
}

function severityColor(severity: DashboardSeverity) {
  if (severity === 'critical') return 'var(--danger)';
  if (severity === 'warning') return 'var(--warning)';
  return 'var(--success)';
}
