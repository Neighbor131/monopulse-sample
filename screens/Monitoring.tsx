import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Ban,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Gauge,
  Gift,
  PauseCircle,
  Plug,
  RadioTower,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  Siren,
  X,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CAMPAIGNS, fmtMoney } from '../data/campaigns';
import { EVENT_LOGS, PROVIDERS, WEBHOOKS, DELIVERY_META, HEALTH_META } from '../data/integrations';
import type { DeliveryStatus, EventLog, Health } from '../data/integrations';
import { FRAUD_CASES, MANUAL_REWARDS, WEBHOOK_FAILURES } from '../data/safety';
import type { Severity } from '../data/safety';

type TabId = 'overview' | 'incidents' | 'events' | 'rewards' | 'campaigns' | 'providers' | 'actions';
type IncidentStatus = 'open' | 'investigating' | 'mitigating' | 'resolved';
type IncidentKind = 'reward' | 'webhook' | 'risk' | 'provider' | 'campaign';
type Detail = { title: string; subtitle: string; body: React.ReactNode; actions?: { icon: LucideIcon; label: string; tone?: 'default' | 'danger' | 'primary' }[] } | null;

interface Filters { brand: string; status: string; q: string }
const EMPTY: Filters = { brand: '', status: '', q: '' };

interface LiveIncident {
  id: string;
  kind: IncidentKind;
  title: string;
  brand: string;
  status: IncidentStatus;
  severity: Severity;
  started: string;
  impact: string;
  owner: string;
  linked: string[];
  nextAction: string;
}

const INCIDENTS: LiveIncident[] = [
  {
    id: 'inc-live-104',
    kind: 'webhook',
    title: 'GLR reward webhook failing',
    brand: 'GLR',
    status: 'mitigating',
    severity: 'critical',
    started: '24m ago',
    impact: '18 reward grants retrying, 3 near max retry limit',
    owner: 'Integrations',
    linked: ['wh-003', 'evt-9f12a4', 'rw-5509'],
    nextAction: 'Retry after operator confirms endpoint recovery',
  },
  {
    id: 'inc-live-103',
    kind: 'risk',
    title: 'Velocity abuse spike on rakeback',
    brand: 'VGV',
    status: 'investigating',
    severity: 'critical',
    started: '12m ago',
    impact: '1 payout held, 3 linked accounts under review',
    owner: 'Risk',
    linked: ['fr-8842', 'rw-5521', 'PLR-4471902'],
    nextAction: 'Hold rewards and inspect linked accounts',
  },
  {
    id: 'inc-live-101',
    kind: 'provider',
    title: 'Bonus engine mapping incomplete',
    brand: 'BNV',
    status: 'open',
    severity: 'warning',
    started: '44m ago',
    impact: 'Sandbox reward creation blocked for certification',
    owner: 'Java backend',
    linked: ['prov-bonus', 'cert-reward', 'cert-signature'],
    nextAction: 'Validate bonus GUID mapping and HMAC signature',
  },
];

const ACTIONS = [
  { id: 'act-1', title: 'Pause affected campaign', desc: 'Stop new eligibility and reward grants while incident is open.', tone: 'danger' as const, icon: PauseCircle },
  { id: 'act-2', title: 'Retry failed grants', desc: 'Replay retrying reward events after provider recovery.', tone: 'default' as const, icon: RotateCcw },
  { id: 'act-3', title: 'Quarantine event type', desc: 'Move new reward.grant events into manual review.', tone: 'warning' as const, icon: Ban },
  { id: 'act-4', title: 'Run health check', desc: 'Ping providers, webhooks, API keys and reward endpoints.', tone: 'primary' as const, icon: RefreshCw },
];

export default function Monitoring() {
  const [tab, setTab] = useState<TabId>('overview');
  const [f, setF] = useState<Filters>(EMPTY);
  const [detail, setDetail] = useState<Detail>(null);
  const set = (patch: Partial<Filters>) => setF((p) => ({ ...p, ...patch }));

  const kpis = useMemo(() => ({
    openIncidents: INCIDENTS.filter((i) => i.status !== 'resolved').length,
    failedEvents: EVENT_LOGS.filter((e) => e.status !== 'delivered').length,
    heldRewards: MANUAL_REWARDS.filter((r) => ['held', 'compliance'].includes(r.status)).length,
    riskyPlayers: FRAUD_CASES.filter((c) => c.status !== 'released').length,
    providerIssues: PROVIDERS.filter((p) => p.status !== 'healthy').length,
    liveCampaigns: CAMPAIGNS.filter((c) => c.status === 'live').length,
  }), []);

  const incidents = INCIDENTS.filter((i) => matches(i.brand, i.status, `${i.id} ${i.title} ${i.owner} ${i.impact}`, f));
  const events = EVENT_LOGS.filter((e) => matches(e.brand, e.status, `${e.id} ${e.eventType} ${e.playerId} ${e.validation}`, f));
  const rewardQueue = MANUAL_REWARDS.filter((r) => matches(r.brand, r.status, `${r.id} ${r.rewardType} ${r.playerId} ${r.campaignName} ${r.holdReason}`, f));
  const campaigns = CAMPAIGNS.filter((c) => matches(c.brands[0], c.status, `${c.id} ${c.name} ${c.owner} ${c.type}`, f));
  const providers = PROVIDERS.filter((p) => matches(p.brand, p.status, `${p.id} ${p.provider} ${p.kind} ${p.incident ?? ''}`, f));

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'incidents', label: 'Incidents', count: incidents.length },
    { id: 'events', label: 'Event stream', count: EVENT_LOGS.filter((e) => e.status !== 'delivered').length },
    { id: 'rewards', label: 'Reward grants', count: rewardQueue.length },
    { id: 'campaigns', label: 'Campaign health', count: CAMPAIGNS.filter((c) => c.risk !== 'none').length },
    { id: 'providers', label: 'Providers', count: PROVIDERS.filter((p) => p.status !== 'healthy').length },
    { id: 'actions', label: 'Emergency actions' },
  ];

  return (
    <div className="mx-auto w-full max-w-[1360px] px-8 py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[19px] font-semibold tracking-tight">Live Monitoring</h1>
            <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ color: 'var(--warning)', background: 'var(--warning-bg)' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--warning)' }} /> 3 active incidents
            </span>
          </div>
          <p className="mt-1 text-[13px] text-fg-secondary">Control room for live campaigns, event ingestion, reward delivery, risk spikes and provider health.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)', border: '1px solid var(--border-strong)' }}>
            <RefreshCw size={15} strokeWidth={2.25} /> Refresh
          </button>
          <button onClick={() => setTab('actions')} className="flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-semibold" style={{ background: 'var(--danger)', color: '#fff' }}>
            <Siren size={15} strokeWidth={2.25} /> Emergency actions
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-6 gap-3">
        <Kpi icon={Siren} label="Open incidents" value={String(kpis.openIncidents)} accent="var(--danger)" onClick={() => setTab('incidents')} active={tab === 'incidents'} />
        <Kpi icon={Activity} label="Failed events" value={String(kpis.failedEvents)} accent="var(--danger)" onClick={() => setTab('events')} active={tab === 'events'} />
        <Kpi icon={Gift} label="Held rewards" value={String(kpis.heldRewards)} accent="var(--warning)" onClick={() => setTab('rewards')} active={tab === 'rewards'} />
        <Kpi icon={ShieldAlert} label="Risk flags" value={String(kpis.riskyPlayers)} accent="var(--danger)" onClick={() => setTab('incidents')} />
        <Kpi icon={Plug} label="Provider issues" value={String(kpis.providerIssues)} accent="var(--warning)" onClick={() => setTab('providers')} active={tab === 'providers'} />
        <Kpi icon={Zap} label="Live campaigns" value={String(kpis.liveCampaigns)} onClick={() => setTab('campaigns')} active={tab === 'campaigns'} />
      </div>

      <div className="mt-6 flex items-center gap-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        {tabs.map((t) => {
          const on = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className="relative flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium" style={{ color: on ? 'var(--fg-primary)' : 'var(--fg-secondary)' }}>
              {t.label}
              {t.count !== undefined && t.count > 0 && <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold" style={on ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { background: 'var(--surface-3)', color: 'var(--fg-muted)' }}>{t.count}</span>}
              {on && <span className="absolute inset-x-0 -bottom-px h-0.5" style={{ background: 'var(--accent)' }} />}
            </button>
          );
        })}
      </div>

      {tab !== 'overview' && tab !== 'actions' && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <FilterSelect label="Brand" value={f.brand} onChange={(v) => set({ brand: v })} options={['ACR', 'SPC', 'BNV', 'LKF', 'VGV', 'GLR']} />
          <FilterSelect label="Status" value={f.status} onChange={(v) => set({ status: v })} options={statusOptions(tab)} />
          <div className="ml-auto flex items-center gap-2 rounded-md border px-3 py-2" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
            <Search size={14} className="text-fg-muted" strokeWidth={1.75} />
            <input value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Search incidents, events, players…" className="w-60 bg-transparent text-[13px] outline-none" />
          </div>
          {Object.values(f).some(Boolean) && <button onClick={() => setF(EMPTY)} className="text-[12px] font-medium" style={{ color: 'var(--accent)' }}>Clear</button>}
        </div>
      )}

      <div className="mt-4">
        {tab === 'overview' && <Overview onTab={setTab} onOpen={setDetail} />}
        {tab === 'incidents' && <IncidentList rows={incidents} onOpen={(x) => setDetail(incidentDetail(x))} />}
        {tab === 'events' && <EventTable rows={events} onOpen={(x) => setDetail(eventDetail(x))} />}
        {tab === 'rewards' && <RewardOps rows={rewardQueue} onOpen={(x) => setDetail(rewardDetail(x))} />}
        {tab === 'campaigns' && <CampaignHealth rows={campaigns} onOpen={(x) => setDetail(campaignDetail(x))} />}
        {tab === 'providers' && <ProviderHealth rows={providers} onOpen={(x) => setDetail(providerDetail(x))} />}
        {tab === 'actions' && <EmergencyActions onOpen={setDetail} />}
      </div>

      <DetailDrawer detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function Overview({ onTab, onOpen }: { onTab: (t: TabId) => void; onOpen: (d: Detail) => void }) {
  return (
    <div className="grid grid-cols-[1fr_360px] gap-4">
      <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <div><h2 className="text-[14px] font-semibold text-fg-primary">Immediate attention</h2><p className="mt-0.5 text-[12.5px] text-fg-secondary">Incidents with live player, reward or provider impact.</p></div>
          <button onClick={() => onTab('incidents')} className="text-[12.5px] font-semibold" style={{ color: 'var(--accent)' }}>View all</button>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {INCIDENTS.map((i) => <IncidentRow key={i.id} incident={i} onClick={() => onOpen(incidentDetail(i))} />)}
        </div>
      </section>

      <aside className="flex flex-col gap-4">
        <section className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><Gauge size={13} /> System health</div>
          <div className="mt-4 flex flex-col gap-2">
            <HealthRow label="Event ingestion" value="99.98%" status="healthy" />
            <HealthRow label="Reward delivery" value="3 failing" status="failing" />
            <HealthRow label="Provider sync" value="2 degraded" status="degraded" />
            <HealthRow label="Risk engine" value="Live" status="healthy" />
          </div>
        </section>
        <section className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><RadioTower size={13} /> Event stream</div>
          <div className="mt-3 flex flex-col gap-2">
            {EVENT_LOGS.slice(0, 4).map((e) => <button key={e.id} onClick={() => onOpen(eventDetail(e))} className="rounded-lg border px-3 py-2 text-left" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div className="flex items-center justify-between gap-2"><span className="font-mono text-[11px] text-fg-muted">{e.at}</span><DeliveryPill status={e.status} /></div><div className="mt-1 text-[12.5px] font-medium text-fg-primary">{e.eventType}</div><div className="mt-0.5 truncate text-[11.5px] text-fg-muted">{e.brand} · {e.playerId}</div></button>)}
          </div>
        </section>
      </aside>
    </div>
  );
}

function IncidentList({ rows, onOpen }: { rows: LiveIncident[]; onOpen: (i: LiveIncident) => void }) {
  return <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>{rows.map((i) => <IncidentRow key={i.id} incident={i} onClick={() => onOpen(i)} />)}</section>;
}

function IncidentRow({ incident, onClick }: { incident: LiveIncident; onClick: () => void }) {
  return (
    <button onClick={onClick} className="grid w-full grid-cols-[1fr_120px_150px_150px_24px] items-center gap-4 border-b px-5 py-3 text-left last:border-0 hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="min-w-0">
        <div className="flex items-center gap-2"><SeverityDot severity={incident.severity} /><span className="truncate text-[13px] font-semibold text-fg-primary">{incident.title}</span></div>
        <div className="mt-0.5 truncate text-[11.5px] text-fg-muted">{incident.impact}</div>
      </div>
      <span className="font-mono text-[12px] text-fg-secondary">{incident.brand}</span>
      <StatusPill label={incident.status} tone={incident.severity === 'critical' ? 'danger' : 'warning'} />
      <span className="text-[12px] text-fg-muted">{incident.owner} · {incident.started}</span>
      <ChevronRight size={16} className="text-fg-muted" />
    </button>
  );
}

function EventTable({ rows, onOpen }: { rows: EventLog[]; onOpen: (e: EventLog) => void }) {
  return <Table cols={['Time', 'Event ID', 'Player', 'Brand', 'Type', 'Campaign', 'Status', 'Latency']}>{rows.map((e) => (
    <tr key={e.id} onClick={() => onOpen(e)} className="cursor-pointer border-t transition-colors hover:bg-[var(--surface-3)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <Td mono>{e.at}</Td><Td mono>{e.id}</Td><Td mono>{e.playerId}</Td><Td mono>{e.brand}</Td><Td>{e.eventType}</Td><Td>{e.campaign ?? '—'}</Td><Td><DeliveryPill status={e.status} /></Td><Td right>{e.latencyMs}ms</Td>
    </tr>
  ))}</Table>;
}

function RewardOps({ rows, onOpen }: { rows: typeof MANUAL_REWARDS; onOpen: (r: typeof MANUAL_REWARDS[number]) => void }) {
  return <Table cols={['Reward', 'Value', 'Player', 'Brand', 'Campaign', 'Hold reason', 'Status']}>{rows.map((r) => (
    <tr key={r.id} onClick={() => onOpen(r)} className="cursor-pointer border-t transition-colors hover:bg-[var(--surface-3)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <Td><div className="font-medium text-fg-primary">{r.rewardType}</div><div className="font-mono text-[11px] text-fg-muted">{r.id}</div></Td><Td right>{fmtMoney(r.value, 'EUR')}</Td><Td mono>{r.playerId}</Td><Td mono>{r.brand}</Td><Td>{r.campaignName}</Td><Td>{r.holdReason}</Td><Td><StatusPill label={r.status} tone={r.severity === 'critical' ? 'danger' : 'warning'} /></Td>
    </tr>
  ))}</Table>;
}

function CampaignHealth({ rows, onOpen }: { rows: typeof CAMPAIGNS; onOpen: (c: typeof CAMPAIGNS[number]) => void }) {
  return <Table cols={['Campaign', 'Type', 'Brands', 'Audience', 'Budget used', 'Owner', 'Risk', 'Status']}>{rows.map((c) => (
    <tr key={c.id} onClick={() => onOpen(c)} className="cursor-pointer border-t transition-colors hover:bg-[var(--surface-3)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <Td><div className="font-medium text-fg-primary">{c.name}</div><div className="font-mono text-[11px] text-fg-muted">{c.id}</div></Td><Td>{c.type}</Td><Td>{c.brands.join(' · ')}</Td><Td right>{c.audienceSize.toLocaleString()}</Td><Td right>{fmtMoney(c.budgetUsed, c.currency)}</Td><Td>{c.owner}</Td><Td><RiskPill risk={c.risk} /></Td><Td>{c.status}</Td>
    </tr>
  ))}</Table>;
}

function ProviderHealth({ rows, onOpen }: { rows: typeof PROVIDERS; onOpen: (p: typeof PROVIDERS[number]) => void }) {
  return <Table cols={['Provider', 'Brand', 'Env', 'Kind', 'Mapped games', 'Last sync', 'Incident', 'Status']}>{rows.map((p) => (
    <tr key={p.id} onClick={() => onOpen(p)} className="cursor-pointer border-t transition-colors hover:bg-[var(--surface-3)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <Td>{p.provider}</Td><Td mono>{p.brand}</Td><Td>{p.env}</Td><Td>{p.kind}</Td><Td right>{p.mappedGames.toLocaleString()}</Td><Td>{p.lastSync}</Td><Td>{p.incident ?? '—'}</Td><Td><HealthPill status={p.status} /></Td>
    </tr>
  ))}</Table>;
}

function EmergencyActions({ onOpen }: { onOpen: (d: Detail) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {ACTIONS.map((a) => {
        const Icon = a.icon;
        return (
          <button key={a.id} onClick={() => onOpen(actionDetail(a))} className="rounded-xl border p-5 text-left hover:bg-[var(--surface-2)]" style={{ borderColor: a.tone === 'danger' ? 'var(--danger)' : 'var(--border-subtle)', background: 'var(--surface-1)' }}>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: actionBg(a.tone), color: actionFg(a.tone) }}><Icon size={17} strokeWidth={2.25} /></span>
              <div><div className="text-[14px] font-semibold text-fg-primary">{a.title}</div><div className="mt-1 text-[12.5px] leading-5 text-fg-secondary">{a.desc}</div></div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Kpi({ icon: Icon, label, value, accent = 'var(--accent)', onClick, active }: { icon: LucideIcon; label: string; value: string; accent?: string; onClick: () => void; active?: boolean }) {
  return <button onClick={onClick} className="rounded-xl border px-4 py-3.5 text-left" style={{ borderColor: active ? 'var(--accent-border)' : 'var(--border-subtle)', background: active ? 'var(--accent-bg)' : 'var(--surface-1)' }}><div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><span className="flex h-5 w-5 items-center justify-center rounded" style={{ background: 'var(--surface-3)', color: accent }}><Icon size={12} strokeWidth={2.25} /></span>{label}</div><div className="mt-1.5 font-mono text-[22px] font-semibold leading-none tabular-nums text-fg-primary">{value}</div></button>;
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  const active = value !== '';
  return <div className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} className="cursor-pointer appearance-none rounded-md border py-2 pl-3 pr-8 text-[12.5px] font-medium capitalize outline-none" style={{ borderColor: active ? 'var(--accent-border)' : 'var(--border-strong)', background: active ? 'var(--accent-bg)' : 'var(--surface-2)', color: active ? 'var(--fg-primary)' : 'var(--fg-secondary)' }}><option value="">{label}: All</option>{options.map((o) => <option key={o} value={o}>{label}: {o}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-muted" strokeWidth={2} /></div>;
}

function Table({ cols, children }: { cols: string[]; children: React.ReactNode }) {
  return <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}><table className="min-w-[1060px] w-full border-collapse text-left"><thead><tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-1)' }}>{cols.map((c) => <th key={c} className="px-4 py-2.5 font-semibold">{c}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function Td({ children, mono, right }: { children: React.ReactNode; mono?: boolean; right?: boolean }) {
  return <td className={`px-4 py-3 text-[12.5px] ${mono ? 'font-mono' : ''} ${right ? 'text-right font-mono tabular-nums' : ''}`} style={{ color: 'var(--fg-secondary)' }}>{children}</td>;
}

function HealthRow({ label, value, status }: { label: string; value: string; status: Health }) {
  return <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2" style={{ background: 'var(--surface-2)' }}><div><div className="text-[12.5px] font-medium text-fg-primary">{label}</div><div className="mt-0.5 text-[11.5px] text-fg-muted">{value}</div></div><HealthPill status={status} /></div>;
}

function DeliveryPill({ status }: { status: DeliveryStatus }) {
  const m = DELIVERY_META[status];
  return <span className="inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium capitalize leading-none" style={{ color: m.fg, background: m.bg }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: m.fg }} /> {m.label}</span>;
}

function HealthPill({ status }: { status: Health }) {
  const m = HEALTH_META[status];
  return <span className="inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium leading-none" style={{ color: m.fg, background: m.bg }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: m.fg }} /> {m.label}</span>;
}

function StatusPill({ label, tone }: { label: string; tone: 'danger' | 'warning' | 'success' }) {
  const style = tone === 'danger' ? { color: 'var(--danger)', background: 'var(--danger-bg)' } : tone === 'warning' ? { color: 'var(--warning)', background: 'var(--warning-bg)' } : { color: 'var(--success)', background: 'var(--status-live-bg)' };
  return <span className="inline-flex w-fit rounded-md px-2 py-0.5 text-[11px] font-medium capitalize leading-none" style={style}>{label.replace('_', ' ')}</span>;
}

function SeverityDot({ severity }: { severity: Severity }) {
  const color = severity === 'critical' ? 'var(--danger)' : severity === 'warning' ? 'var(--warning)' : 'var(--status-scheduled)';
  return <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />;
}

function RiskPill({ risk }: { risk: string }) {
  const tone = risk === 'blocked' ? 'danger' : risk === 'warning' ? 'warning' : 'success';
  return <StatusPill label={risk === 'none' ? 'clear' : risk} tone={tone} />;
}

function DetailDrawer({ detail, onClose }: { detail: Detail; onClose: () => void }) {
  if (!detail) return null;
  const actions = detail.actions ?? [{ icon: RefreshCw, label: 'Refresh' }, { icon: RotateCcw, label: 'Retry' }];
  return <div className="fixed inset-0 z-50 flex justify-end"><div className="absolute inset-0" style={{ background: 'var(--overlay-scrim)' }} onClick={onClose} /><div className="relative flex h-full w-[540px] flex-col border-l" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-lg)' }}><div className="flex items-start justify-between gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}><div className="min-w-0"><div className="text-[15px] font-semibold text-fg-primary">{detail.title}</div><div className="mt-0.5 truncate font-mono text-[11.5px] text-fg-muted">{detail.subtitle}</div></div><button onClick={onClose} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-fg-muted" style={{ background: 'var(--surface-2)' }}><X size={15} strokeWidth={2} /></button></div><div className="flex-1 overflow-y-auto px-5 py-4">{detail.body}</div><div className="border-t px-5 py-3.5" style={{ borderColor: 'var(--border-subtle)' }}><div className="flex flex-wrap gap-2">{actions.map((a) => <button key={a.label} className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[12.5px] font-semibold" style={{ background: a.tone === 'danger' ? 'var(--danger-bg)' : a.tone === 'primary' ? 'var(--accent)' : 'var(--surface-3)', color: a.tone === 'danger' ? 'var(--danger)' : a.tone === 'primary' ? 'var(--accent-fg)' : 'var(--fg-secondary)', border: a.tone === 'primary' ? 'none' : '1px solid var(--border-strong)' }}><a.icon size={13} strokeWidth={2.25} /> {a.label}</button>)}</div></div></div></div>;
}

function Facts({ rows }: { rows: { k: string; v: string; mono?: boolean }[] }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-3">{rows.map((r) => <div key={r.k}><div className="text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">{r.k}</div><div className={`mt-0.5 text-[12.5px] font-medium text-fg-primary ${r.mono ? 'font-mono' : ''}`}>{r.v}</div></div>)}</div>;
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div className="mb-3 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">{title}</div>{children}</section>;
}

function matches(brand: string | undefined, status: string | undefined, haystack: string, f: Filters) {
  if (f.brand && brand !== f.brand) return false;
  if (f.status && status !== f.status) return false;
  if (f.q && !haystack.toLowerCase().includes(f.q.toLowerCase())) return false;
  return true;
}

function statusOptions(tab: TabId) {
  if (tab === 'incidents') return ['open', 'investigating', 'mitigating', 'resolved'];
  if (tab === 'events') return ['delivered', 'retrying', 'failed', 'quarantined'];
  if (tab === 'rewards') return ['held', 'compliance', 'approved', 'rejected'];
  if (tab === 'campaigns') return ['draft', 'pending', 'scheduled', 'live', 'paused', 'completed', 'failed'];
  if (tab === 'providers') return ['healthy', 'degraded', 'failing'];
  return [];
}

function actionBg(tone: string) {
  if (tone === 'danger') return 'var(--danger-bg)';
  if (tone === 'warning') return 'var(--warning-bg)';
  if (tone === 'primary') return 'var(--accent-bg)';
  return 'var(--surface-3)';
}

function actionFg(tone: string) {
  if (tone === 'danger') return 'var(--danger)';
  if (tone === 'warning') return 'var(--warning)';
  if (tone === 'primary') return 'var(--accent)';
  return 'var(--fg-secondary)';
}

function incidentDetail(i: LiveIncident): Detail {
  return {
    title: i.title,
    subtitle: i.id,
    body: <div className="flex flex-col gap-4"><Facts rows={[{ k: 'Brand', v: i.brand, mono: true }, { k: 'Status', v: i.status }, { k: 'Severity', v: i.severity }, { k: 'Started', v: i.started }, { k: 'Owner', v: i.owner }, { k: 'Next action', v: i.nextAction }]} /><DrawerSection title="Impact"><p className="text-[12.5px] leading-5 text-fg-secondary">{i.impact}</p></DrawerSection><DrawerSection title="Linked objects"><div className="flex flex-wrap gap-2">{i.linked.map((l) => <span key={l} className="rounded-md px-2 py-1 font-mono text-[11.5px]" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{l}</span>)}</div></DrawerSection></div>,
    actions: [{ icon: PauseCircle, label: 'Pause campaign', tone: 'danger' }, { icon: RotateCcw, label: 'Retry failed work' }, { icon: Check, label: 'Mark mitigated', tone: 'primary' }],
  };
}

function eventDetail(e: EventLog): Detail {
  return {
    title: e.eventType,
    subtitle: e.id,
    body: <div className="flex flex-col gap-4"><Facts rows={[{ k: 'Player', v: e.playerId, mono: true }, { k: 'Brand', v: e.brand, mono: true }, { k: 'Environment', v: e.env }, { k: 'Source', v: e.source }, { k: 'Status', v: e.status }, { k: 'Latency', v: `${e.latencyMs}ms` }]} /><DrawerSection title="Validation"><p className="text-[12.5px] leading-5 text-fg-secondary">{e.validation}</p></DrawerSection><DrawerSection title="Payload"><pre className="overflow-x-auto rounded-md p-3 text-[11.5px]" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{e.payload}</pre></DrawerSection></div>,
    actions: [{ icon: RotateCcw, label: 'Retry event' }, { icon: Ban, label: 'Quarantine type', tone: 'danger' }],
  };
}

function rewardDetail(r: typeof MANUAL_REWARDS[number]): Detail {
  return {
    title: r.rewardType,
    subtitle: r.id,
    body: <div className="flex flex-col gap-4"><Facts rows={[{ k: 'Value', v: fmtMoney(r.value, 'EUR') }, { k: 'Player', v: r.playerId, mono: true }, { k: 'Brand', v: r.brand, mono: true }, { k: 'Campaign', v: r.campaignName }, { k: 'Status', v: r.status }, { k: 'Fulfillment', v: r.fulfillmentMethod }]} /><DrawerSection title="Hold reason"><p className="text-[12.5px] leading-5 text-fg-secondary">{r.detail}</p></DrawerSection></div>,
    actions: [{ icon: Check, label: 'Approve grant', tone: 'primary' }, { icon: Ban, label: 'Reject grant', tone: 'danger' }, { icon: RotateCcw, label: 'Retry' }],
  };
}

function campaignDetail(c: typeof CAMPAIGNS[number]): Detail {
  return {
    title: c.name,
    subtitle: c.id,
    body: <Facts rows={[{ k: 'Status', v: c.status }, { k: 'Type', v: c.type }, { k: 'Brands', v: c.brands.join(', ') }, { k: 'Audience', v: c.audienceSize.toLocaleString() }, { k: 'Budget used', v: fmtMoney(c.budgetUsed, c.currency) }, { k: 'Risk', v: c.riskNote ?? c.risk }]} />,
    actions: [{ icon: PauseCircle, label: 'Pause campaign', tone: 'danger' }, { icon: Activity, label: 'Open events' }],
  };
}

function providerDetail(p: typeof PROVIDERS[number]): Detail {
  return {
    title: p.provider,
    subtitle: p.id,
    body: <Facts rows={[{ k: 'Brand', v: p.brand, mono: true }, { k: 'Environment', v: p.env }, { k: 'Kind', v: p.kind }, { k: 'Status', v: p.status }, { k: 'Mapped games', v: p.mappedGames.toLocaleString() }, { k: 'Incident', v: p.incident ?? 'None' }]} />,
    actions: [{ icon: RefreshCw, label: 'Run provider sync' }, { icon: RotateCcw, label: 'Retry failed calls' }],
  };
}

function actionDetail(a: typeof ACTIONS[number]): Detail {
  return {
    title: a.title,
    subtitle: a.id,
    body: <div className="flex flex-col gap-4"><DrawerSection title="Action intent"><p className="text-[12.5px] leading-5 text-fg-secondary">{a.desc}</p></DrawerSection><DrawerSection title="Confirmation checklist"><div className="flex flex-col gap-2">{['Scope selected', 'Reason captured', 'Audit record will be written', 'Reviewer notified'].map((x) => <div key={x} className="flex items-center gap-2 text-[12.5px] text-fg-secondary"><Check size={13} style={{ color: 'var(--success)' }} /> {x}</div>)}</div></DrawerSection></div>,
    actions: [{ icon: a.icon, label: 'Confirm action', tone: a.tone === 'danger' ? 'danger' : 'primary' }],
  };
}
