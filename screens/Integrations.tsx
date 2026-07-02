import { useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, Check, ChevronDown, Code2, Copy, Eye, KeyRound,
  Plug, RefreshCw, RotateCcw, Search, ServerCog, ShieldCheck, Webhook, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BRANDS } from '../data/campaigns';
import {
  API_KEYS, CERTIFICATION, DELIVERY_META, EVENT_LOGS, HEALTH_META, PROVIDERS, WEBHOOKS,
  integrationKpis,
} from '../data/integrations';
import type { ApiKey, DeliveryStatus, Env, EventLog, Health, ProviderHealth, WebhookEndpoint } from '../data/integrations';

type TabId = 'overview' | 'keys' | 'webhooks' | 'events' | 'failures' | 'rewards' | 'providers' | 'certification';
interface Filters { brand: string; env: string; provider: string; event: string; severity: string; q: string }
const EMPTY: Filters = { brand: '', env: '', provider: '', event: '', severity: '', q: '' };
type Detail = { title: string; subtitle: string; body: React.ReactNode; actions?: { icon: LucideIcon; label: string }[] } | null;

export default function Integrations() {
  const [tab, setTab] = useState<TabId>('overview');
  const [f, setF] = useState<Filters>(EMPTY);
  const [detail, setDetail] = useState<Detail>(null);
  const kpis = useMemo(() => integrationKpis(), []);
  const set = (patch: Partial<Filters>) => setF((p) => ({ ...p, ...patch }));

  const match = (x: { brand?: string; env?: Env; provider?: string; eventType?: string; status?: Health | DeliveryStatus; q: string }) => {
    if (f.brand && x.brand !== f.brand) return false;
    if (f.env && x.env !== f.env) return false;
    if (f.provider && x.provider !== f.provider) return false;
    if (f.event && x.eventType !== f.event) return false;
    if (f.severity && x.status !== f.severity) return false;
    if (f.q && !x.q.toLowerCase().includes(f.q.toLowerCase())) return false;
    return true;
  };

  const keys = API_KEYS.filter((x) => match({ brand: x.brand, env: x.env, status: x.status, q: `${x.id} ${x.name} ${x.owner} ${x.scopes.join(' ')}` }));
  const hooks = WEBHOOKS.filter((x) => match({ brand: x.brand, env: x.env, status: x.status, q: `${x.id} ${x.url} ${x.events.join(' ')}` }));
  const events = EVENT_LOGS.filter((x) => match({ brand: x.brand, env: x.env, eventType: x.eventType, status: x.status, q: `${x.id} ${x.playerId} ${x.eventType} ${x.campaign ?? ''}` }));
  const failed = events.filter((x) => x.status !== 'delivered');
  const rewards = events.filter((x) => x.eventType.includes('reward') || x.eventType.includes('jackpot'));
  const providers = PROVIDERS.filter((x) => match({ brand: x.brand, env: x.env, provider: x.provider, status: x.status, q: `${x.provider} ${x.kind} ${x.incident ?? ''}` }));

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'keys', label: 'API keys', count: API_KEYS.length },
    { id: 'webhooks', label: 'Webhooks', count: WEBHOOKS.filter((x) => x.status !== 'healthy').length },
    { id: 'events', label: 'Event stream', count: EVENT_LOGS.length },
    { id: 'failures', label: 'Failed events', count: EVENT_LOGS.filter((x) => x.status !== 'delivered').length },
    { id: 'rewards', label: 'Reward fulfillment', count: rewards.length },
    { id: 'providers', label: 'Providers', count: PROVIDERS.filter((x) => x.status !== 'healthy').length },
    { id: 'certification', label: 'Sandbox certification' },
  ];

  return (
    <div className="mx-auto w-full max-w-[1360px] px-8 py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[19px] font-semibold tracking-tight">Integrations &amp; Monitoring</h1>
            <HealthPill status={PROVIDERS.some((p) => p.status === 'failing') ? 'degraded' : 'healthy'} />
          </div>
          <p className="mt-1 text-[13px] text-fg-secondary">Verify API keys, event ingestion, webhook delivery, reward calls, provider health and sandbox certification.</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
          <RefreshCw size={15} strokeWidth={2.25} /> Run health check
        </button>
      </div>

      <div className="mt-5 grid grid-cols-6 gap-3">
        <Kpi icon={Activity} label="Events received" value={kpis.eventsReceived.toLocaleString()} />
        <Kpi icon={AlertTriangle} label="Events failed" value={String(kpis.eventsFailed)} accent="var(--danger)" />
        <Kpi icon={Webhook} label="Webhook success" value={`${kpis.webhookSuccess}%`} />
        <Kpi icon={Plug} label="Reward API errors" value={String(kpis.rewardErrors)} accent="var(--warning)" />
        <Kpi icon={KeyRound} label="Active API keys" value={String(kpis.activeKeys)} />
        <Kpi icon={ServerCog} label="Provider incidents" value={String(kpis.incidents)} accent="var(--danger)" />
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

      {tab !== 'overview' && tab !== 'certification' && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <FilterSelect label="Brand" value={f.brand} onChange={(v) => set({ brand: v })} options={BRANDS.map((b) => ({ v: b.code, l: `${b.code} · ${b.name}` }))} />
          <FilterSelect label="Environment" value={f.env} onChange={(v) => set({ env: v })} options={['sandbox', 'staging', 'production'].map((e) => ({ v: e, l: e }))} />
          {tab === 'providers' && <FilterSelect label="Provider" value={f.provider} onChange={(v) => set({ provider: v })} options={PROVIDERS.map((p) => ({ v: p.provider, l: p.provider }))} />}
          {(tab === 'events' || tab === 'failures' || tab === 'rewards') && <FilterSelect label="Event" value={f.event} onChange={(v) => set({ event: v })} options={Array.from(new Set(EVENT_LOGS.map((e) => e.eventType))).map((e) => ({ v: e, l: e }))} />}
          <FilterSelect label="Status" value={f.severity} onChange={(v) => set({ severity: v })} options={(tab === 'events' || tab === 'failures' || tab === 'rewards' ? ['delivered', 'retrying', 'failed', 'quarantined'] : ['healthy', 'degraded', 'failing']).map((s) => ({ v: s, l: s }))} />
          <div className="ml-auto flex items-center gap-2 rounded-md border px-3 py-2" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
            <Search size={14} className="text-fg-muted" strokeWidth={1.75} />
            <input value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Search IDs, players, URLs…" className="w-52 bg-transparent text-[13px] outline-none" />
          </div>
          {Object.values(f).some(Boolean) && <button onClick={() => setF(EMPTY)} className="text-[12px] font-medium" style={{ color: 'var(--accent)' }}>Clear</button>}
        </div>
      )}

      <div className="mt-4">
        {tab === 'overview' && <Overview onTab={setTab} />}
        {tab === 'keys' && <ApiKeyTable rows={keys} onOpen={(x) => setDetail(apiKeyDetail(x))} />}
        {tab === 'webhooks' && <WebhookTable rows={hooks} onOpen={(x) => setDetail(webhookDetail(x))} />}
        {tab === 'events' && <EventTable rows={events} onOpen={(x) => setDetail(eventDetail(x))} />}
        {tab === 'failures' && <EventTable rows={failed} onOpen={(x) => setDetail(eventDetail(x))} />}
        {tab === 'rewards' && <EventTable rows={rewards} onOpen={(x) => setDetail(eventDetail(x))} />}
        {tab === 'providers' && <ProviderTable rows={providers} onOpen={(x) => setDetail(providerDetail(x))} />}
        {tab === 'certification' && <Certification />}
      </div>

      <DetailDrawer detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function Overview({ onTab }: { onTab: (t: TabId) => void }) {
  const cards = [
    { label: 'Production webhooks', value: `${WEBHOOKS.filter((w) => w.env === 'production' && w.status === 'healthy').length}/${WEBHOOKS.filter((w) => w.env === 'production').length}`, icon: Webhook, tab: 'webhooks' as TabId },
    { label: 'Dead-letter items', value: String(EVENT_LOGS.filter((e) => e.status === 'quarantined').length), icon: AlertTriangle, tab: 'failures' as TabId },
    { label: 'Provider mappings', value: PROVIDERS.reduce((s, p) => s + p.mappedGames, 0).toLocaleString(), icon: ServerCog, tab: 'providers' as TabId },
    { label: 'Certification status', value: `${CERTIFICATION.filter((c) => c.status === 'pass').length}/${CERTIFICATION.length}`, icon: ShieldCheck, tab: 'certification' as TabId },
  ];
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-4 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button key={c.label} onClick={() => onTab(c.tab)} className="rounded-xl border p-4 text-left hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
              <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><Icon size={13} strokeWidth={2} /> {c.label}</div>
              <div className="mt-2 font-mono text-[20px] font-semibold tabular-nums text-fg-primary">{c.value}</div>
            </button>
          );
        })}
      </div>
      <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="border-b px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-[14px] font-semibold text-fg-primary">Live event stream</h2>
          <p className="mt-0.5 text-[12.5px] text-fg-secondary">Recent operator events and MonoPulse processing outcomes.</p>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {EVENT_LOGS.map((e) => <EventRow key={e.id} e={e} />)}
        </div>
      </section>
    </div>
  );
}

function ApiKeyTable({ rows, onOpen }: { rows: ApiKey[]; onOpen: (x: ApiKey) => void }) {
  return <Table cols={['Key', 'Brand', 'Env', 'Scopes', 'Last used', 'Status', 'Owner']}>{rows.map((x) => (
    <tr key={x.id} onClick={() => onOpen(x)} className="cursor-pointer border-t transition-colors hover:bg-[var(--surface-3)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <Td><div className="font-medium text-fg-primary">{x.name}</div><div className="font-mono text-[11px] text-fg-muted">{x.id}</div></Td>
      <Td mono>{x.brand}</Td><Td>{x.env}</Td><Td>{x.scopes.join(' · ')}</Td><Td>{x.lastUsed}</Td><Td><HealthPill status={x.status} /></Td><Td>{x.owner}</Td>
    </tr>
  ))}</Table>;
}

function WebhookTable({ rows, onOpen }: { rows: WebhookEndpoint[]; onOpen: (x: WebhookEndpoint) => void }) {
  return <Table cols={['Endpoint', 'Brand', 'Env', 'Events', 'Success', 'Last delivery', 'Signing', 'Status']}>{rows.map((x) => (
    <tr key={x.id} onClick={() => onOpen(x)} className="cursor-pointer border-t transition-colors hover:bg-[var(--surface-3)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <Td><span className="font-mono text-[12px] text-fg-primary">{x.url}</span></Td><Td mono>{x.brand}</Td><Td>{x.env}</Td><Td>{x.events.join(' · ')}</Td><Td right>{x.successRate}%</Td><Td>{x.lastDelivery}</Td><Td>{x.signed ? 'HMAC signed' : 'Unsigned'}</Td><Td><HealthPill status={x.status} /></Td>
    </tr>
  ))}</Table>;
}

function EventTable({ rows, onOpen }: { rows: EventLog[]; onOpen: (x: EventLog) => void }) {
  return <Table cols={['Time', 'Event ID', 'Player', 'Brand', 'Event type', 'Source', 'Status', 'Latency']}>{rows.map((x) => (
    <tr key={x.id} onClick={() => onOpen(x)} className="cursor-pointer border-t transition-colors hover:bg-[var(--surface-3)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <Td mono>{x.at}</Td><Td mono>{x.id}</Td><Td mono>{x.playerId}</Td><Td mono>{x.brand}</Td><Td>{x.eventType}</Td><Td>{x.source}</Td><Td><DeliveryPill status={x.status} /></Td><Td right>{x.latencyMs}ms</Td>
    </tr>
  ))}</Table>;
}

function ProviderTable({ rows, onOpen }: { rows: ProviderHealth[]; onOpen: (x: ProviderHealth) => void }) {
  return <Table cols={['Provider', 'Brand', 'Env', 'Kind', 'Status', 'Mapped games', 'Last sync', 'Incident']}>{rows.map((x) => (
    <tr key={x.id} onClick={() => onOpen(x)} className="cursor-pointer border-t transition-colors hover:bg-[var(--surface-3)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <Td>{x.provider}</Td><Td mono>{x.brand}</Td><Td>{x.env}</Td><Td>{x.kind}</Td><Td><HealthPill status={x.status} /></Td><Td right>{x.mappedGames.toLocaleString()}</Td><Td>{x.lastSync}</Td><Td>{x.incident ?? '—'}</Td>
    </tr>
  ))}</Table>;
}

function Certification() {
  return (
    <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="border-b px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <h2 className="text-[14px] font-semibold text-fg-primary">Sandbox certification checklist</h2>
        <p className="mt-0.5 text-[12.5px] text-fg-secondary">Required before a brand can move MonoPulse integration into production.</p>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
        {CERTIFICATION.map((c) => {
          const ok = c.status === 'pass';
          const fail = c.status === 'fail';
          return (
            <div key={c.id} className="flex items-start gap-3 px-5 py-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full" style={ok ? { background: 'var(--status-live-bg)', color: 'var(--success)' } : fail ? { background: 'var(--danger-bg)', color: 'var(--danger)' } : { background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                {ok ? <Check size={14} strokeWidth={3} /> : fail ? <X size={14} strokeWidth={3} /> : <RefreshCw size={13} strokeWidth={2.25} />}
              </span>
              <div>
                <div className="text-[13px] font-medium text-fg-primary">{c.label}</div>
                <div className="mt-0.5 text-[12px] text-fg-secondary">{c.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Kpi({ icon: Icon, label, value, accent = 'var(--accent)' }: { icon: LucideIcon; label: string; value: string; accent?: string }) {
  return <div className="rounded-xl border px-4 py-3.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}><div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><span className="flex h-5 w-5 items-center justify-center rounded" style={{ background: 'var(--surface-3)', color: accent }}><Icon size={12} strokeWidth={2.25} /></span>{label}</div><div className="mt-1.5 font-mono text-[22px] font-semibold leading-none tabular-nums text-fg-primary">{value}</div></div>;
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  const active = value !== '';
  return <div className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} className="cursor-pointer appearance-none rounded-md border py-2 pl-3 pr-8 text-[12.5px] font-medium outline-none" style={{ borderColor: active ? 'var(--accent-border)' : 'var(--border-strong)', background: active ? 'var(--accent-bg)' : 'var(--surface-2)', color: active ? 'var(--fg-primary)' : 'var(--fg-secondary)' }}><option value="">{label}: All</option>{options.map((o) => <option key={o.v} value={o.v}>{label}: {o.l}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-muted" strokeWidth={2} /></div>;
}

function Table({ cols, children }: { cols: string[]; children: React.ReactNode }) {
  return <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}><table className="min-w-[980px] w-full border-collapse text-left"><thead><tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-1)' }}>{cols.map((c) => <th key={c} className="whitespace-nowrap px-4 py-2.5 font-semibold">{c}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function Td({ children, mono, right }: { children: React.ReactNode; mono?: boolean; right?: boolean }) {
  return <td className={`px-4 py-3 text-[12.5px] ${mono ? 'font-mono' : ''} ${right ? 'text-right font-mono tabular-nums' : ''}`} style={{ color: 'var(--fg-secondary)' }}>{children}</td>;
}

function HealthPill({ status }: { status: Health }) {
  const m = HEALTH_META[status];
  return <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium leading-none" style={{ color: m.fg, background: m.bg }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: m.fg }} /> {m.label}</span>;
}

function DeliveryPill({ status }: { status: DeliveryStatus }) {
  const m = DELIVERY_META[status];
  return <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium leading-none" style={{ color: m.fg, background: m.bg }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: m.fg }} /> {m.label}</span>;
}

function EventRow({ e }: { e: EventLog }) {
  return <div className="grid grid-cols-[80px_110px_1fr_auto] items-center gap-3 px-5 py-3"><span className="font-mono text-[12px] text-fg-muted">{e.at}</span><span className="font-mono text-[11.5px] text-fg-secondary">{e.id}</span><div><div className="text-[13px] font-medium text-fg-primary">{e.eventType}</div><div className="text-[11.5px] text-fg-muted">{e.brand} · {e.playerId} · {e.validation}</div></div><DeliveryPill status={e.status} /></div>;
}

function DetailDrawer({ detail, onClose }: { detail: Detail; onClose: () => void }) {
  if (!detail) return null;
  const actions = detail.actions ?? [{ icon: RotateCcw, label: 'Retry / test' }, { icon: Copy, label: 'Copy ID' }, { icon: Code2, label: 'View raw' }];
  return <div className="fixed inset-0 z-50 flex justify-end"><div className="absolute inset-0" style={{ background: 'var(--overlay-scrim)' }} onClick={onClose} /><div className="relative flex h-full w-[540px] flex-col border-l" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-lg)' }}><div className="flex items-start justify-between gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}><div className="min-w-0"><div className="text-[15px] font-semibold text-fg-primary">{detail.title}</div><div className="mt-0.5 truncate font-mono text-[11.5px] text-fg-muted">{detail.subtitle}</div></div><button onClick={onClose} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-fg-muted" style={{ background: 'var(--surface-2)' }}><X size={15} strokeWidth={2} /></button></div><div className="flex-1 overflow-y-auto px-5 py-4">{detail.body}</div><div className="border-t px-5 py-3.5" style={{ borderColor: 'var(--border-subtle)' }}><div className="flex flex-wrap gap-2">{actions.map((a) => <Action key={a.label} icon={a.icon} label={a.label} />)}</div></div></div></div>;
}

function Action({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return <button className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[12.5px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)', border: '1px solid var(--border-strong)' }}><Icon size={13} strokeWidth={2.25} /> {label}</button>;
}

function Facts({ rows }: { rows: { k: string; v: string; mono?: boolean }[] }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-3">{rows.map((r) => <div key={r.k}><div className="text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">{r.k}</div><div className={`mt-0.5 text-[12.5px] font-medium text-fg-primary ${r.mono ? 'font-mono' : ''}`}>{r.v}</div></div>)}</div>;
}

function EventDebugBody({ event }: { event: EventLog }) {
  const hook = WEBHOOKS.find((w) => w.brand === event.brand && w.env === event.env && w.events.some((name) => event.eventType.includes(name.split('.')[0]) || name.includes(event.eventType.split('.')[0])));
  const provider = PROVIDERS.find((p) => p.brand === event.brand && p.env === event.env && (event.source.includes('reward') ? p.kind === 'wallet' || p.kind === 'bonus engine' : true));
  const failed = event.status !== 'delivered';
  return (
    <div className="flex flex-col gap-5">
      <DebugDecision status={event.status} validation={event.validation} />
      <DrawerSection title="Event summary">
        <Facts rows={[{ k: 'Player', v: event.playerId, mono: true }, { k: 'Brand', v: event.brand, mono: true }, { k: 'Environment', v: event.env }, { k: 'Source', v: event.source }, { k: 'Latency', v: `${event.latencyMs}ms` }, { k: 'Campaign', v: event.campaign ?? '—' }]} />
      </DrawerSection>
      <DrawerSection title="Failure checks">
        <div className="flex flex-col gap-2">
          <CheckRow label="Schema validation" detail={event.validation.includes('schema valid') ? 'Payload matches expected MonoPulse event contract.' : 'Payload should be checked against event schema and required fields.'} status={event.validation.includes('schema valid') ? 'healthy' : event.status === 'failed' ? 'failing' : 'degraded'} />
          <CheckRow label="Signature / authentication" detail={event.validation.includes('HMAC') ? 'Signature mismatch detected. Verify secret, timestamp tolerance and canonical payload.' : hook?.signed ? 'HMAC signing is enabled on matching endpoint.' : 'Endpoint is unsigned or no matching webhook was found.'} status={event.validation.includes('HMAC') || hook?.signed === false ? 'failing' : 'healthy'} />
          <CheckRow label="Provider route" detail={provider?.incident ?? (provider ? `${provider.provider} is ${provider.status}.` : 'No provider incident linked to this event.')} status={provider?.status ?? 'healthy'} />
          <CheckRow label="Retry / quarantine" detail={retryCopy(event)} status={event.status === 'delivered' ? 'healthy' : event.status === 'failed' ? 'failing' : 'degraded'} />
        </div>
      </DrawerSection>
      <DrawerSection title="Affected objects">
        <div className="grid gap-2">
          <InfoLine label="Campaign" value={event.campaign ?? 'No campaign linked'} />
          <InfoLine label="Reward/player impact" value={event.eventType.includes('reward') || event.eventType.includes('jackpot') ? 'Reward grant or payout state may be delayed until replay succeeds.' : 'Rules and segment calculations may lag until event is delivered.'} />
          <InfoLine label="Owner" value={event.env === 'sandbox' ? 'Java backend / integration owner' : failed ? 'Technical Admin + operator platform' : 'No action needed'} />
        </div>
      </DrawerSection>
      <DrawerSection title="Retry history">
        <RetryTimeline event={event} />
      </DrawerSection>
      <DrawerSection title="Payload preview">
        <pre className="max-h-56 overflow-auto rounded-lg border p-3 font-mono text-[11.5px] leading-relaxed text-fg-secondary" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>{formatPayload(event.payload)}</pre>
      </DrawerSection>
    </div>
  );
}

function WebhookDebugBody({ hook }: { hook: WebhookEndpoint }) {
  const related = EVENT_LOGS.filter((e) => e.brand === hook.brand && e.env === hook.env);
  return (
    <div className="flex flex-col gap-5">
      <DrawerSection title="Endpoint health">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Success rate" value={`${hook.successRate}%`} tone={hook.successRate < 90 ? 'danger' : hook.successRate < 98 ? 'warning' : 'default'} />
          <MetricCard label="Last delivery" value={hook.lastDelivery} />
          <MetricCard label="Signing" value={hook.signed ? 'HMAC enabled' : 'Unsigned'} tone={hook.signed ? 'default' : 'danger'} />
          <MetricCard label="Status" value={HEALTH_META[hook.status].label} tone={hook.status === 'failing' ? 'danger' : hook.status === 'degraded' ? 'warning' : 'default'} />
        </div>
      </DrawerSection>
      <DrawerSection title="Configuration">
        <Facts rows={[{ k: 'Brand', v: hook.brand, mono: true }, { k: 'Environment', v: hook.env }, { k: 'URL', v: hook.url, mono: true }, { k: 'Events', v: hook.events.join(', ') }]} />
      </DrawerSection>
      <DrawerSection title="Recent related events">
        <div className="flex flex-col gap-2">{related.map((e) => <InfoLine key={e.id} label={`${e.id} · ${e.eventType}`} value={`${DELIVERY_META[e.status].label} · ${e.validation}`} />)}</div>
      </DrawerSection>
    </div>
  );
}

function ProviderDebugBody({ provider }: { provider: ProviderHealth }) {
  const related = EVENT_LOGS.filter((e) => e.brand === provider.brand && e.env === provider.env && (provider.kind === 'wallet' ? e.eventType.includes('reward') || e.eventType.includes('jackpot') : true));
  return (
    <div className="flex flex-col gap-5">
      <DrawerSection title="Provider health">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Status" value={HEALTH_META[provider.status].label} tone={provider.status === 'failing' ? 'danger' : provider.status === 'degraded' ? 'warning' : 'default'} />
          <MetricCard label="Mapped games" value={provider.mappedGames.toLocaleString()} />
          <MetricCard label="Last sync" value={provider.lastSync} />
          <MetricCard label="Kind" value={provider.kind} />
        </div>
      </DrawerSection>
      <DrawerSection title="Incident">
        <InfoLine label={provider.incident ? 'Current incident' : 'No active incident'} value={provider.incident ?? 'Provider is healthy and no escalation is open.'} />
      </DrawerSection>
      <DrawerSection title="Checks">
        <div className="flex flex-col gap-2">
          <CheckRow label="Authentication" detail={provider.incident?.includes('401') ? 'Provider is returning auth errors. Rotate/check API credentials.' : 'No credential issue detected.'} status={provider.incident?.includes('401') ? 'failing' : 'healthy'} />
          <CheckRow label="Mapping sync" detail={provider.mappedGames ? `${provider.mappedGames.toLocaleString()} mappings available.` : 'No mapped games or route mappings available.'} status={provider.mappedGames ? 'healthy' : 'degraded'} />
          <CheckRow label="Reward compatibility" detail={provider.kind === 'wallet' || provider.kind === 'bonus engine' ? 'Provider participates in reward fulfilment path.' : 'Provider affects gameplay/event qualification.'} status={provider.status} />
        </div>
      </DrawerSection>
      <DrawerSection title="Affected events">
        <div className="flex flex-col gap-2">{related.length ? related.map((e) => <InfoLine key={e.id} label={`${e.id} · ${e.eventType}`} value={`${e.status} · ${e.validation}`} />) : <InfoLine label="No recent events" value="No event log currently linked to this provider." />}</div>
      </DrawerSection>
    </div>
  );
}

function DebugDecision({ status, validation }: { status: DeliveryStatus; validation: string }) {
  const failed = status !== 'delivered';
  const fg = status === 'failed' || status === 'quarantined' ? 'var(--danger)' : status === 'retrying' ? 'var(--warning)' : 'var(--success)';
  const bg = status === 'failed' || status === 'quarantined' ? 'var(--danger-bg)' : status === 'retrying' ? 'var(--warning-bg)' : 'var(--status-live-bg)';
  return (
    <section className="rounded-lg border p-4" style={{ borderColor: failed ? fg : 'var(--border-subtle)', background: bg }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Integration decision</div>
          <div className="mt-1 text-[16px] font-semibold text-fg-primary">{status === 'delivered' ? 'Delivered successfully' : status === 'retrying' ? 'Retry in progress' : status === 'quarantined' ? 'Quarantined for review' : 'Failed delivery'}</div>
          <p className="mt-1 text-[12px] leading-relaxed text-fg-secondary">{validation}</p>
        </div>
        <DeliveryPill status={status} />
      </div>
    </section>
  );
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><div className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">{title}</div>{children}</section>;
}

function CheckRow({ label, detail, status }: { label: string; detail: string; status: Health }) {
  return <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div className="flex items-start justify-between gap-3"><div><div className="text-[12.5px] font-medium text-fg-primary">{label}</div><div className="mt-0.5 text-[11.5px] leading-relaxed text-fg-secondary">{detail}</div></div><HealthPill status={status} /></div></div>;
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div className="text-[12.5px] font-medium text-fg-primary">{label}</div><div className="mt-0.5 text-[11.5px] leading-relaxed text-fg-secondary">{value}</div></div>;
}

function MetricCard({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'warning' | 'danger' }) {
  const color = tone === 'danger' ? 'var(--danger)' : tone === 'warning' ? 'var(--warning)' : 'var(--fg-primary)';
  return <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div className="text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">{label}</div><div className="mt-1 truncate text-[13px] font-semibold text-fg-primary" style={{ color }}>{value}</div></div>;
}

function RetryTimeline({ event }: { event: EventLog }) {
  const rows = event.status === 'delivered'
    ? [{ at: event.at, label: 'Delivered', detail: `${event.latencyMs}ms processing time` }]
    : event.status === 'retrying'
      ? [{ at: event.at, label: 'Attempt 3 failed', detail: event.validation }, { at: '+4m', label: 'Next retry scheduled', detail: 'Backoff policy continues until attempt 8' }]
      : event.status === 'quarantined'
        ? [{ at: event.at, label: 'Quarantined', detail: event.validation }, { at: 'manual', label: 'Reviewer action required', detail: 'Replay or attach approval before payout' }]
        : [{ at: event.at, label: 'Failed', detail: event.validation }, { at: 'now', label: 'Escalation recommended', detail: 'Tech admin should inspect auth/signature and replay policy' }];
  return <div className="flex flex-col gap-2">{rows.map((row) => <InfoLine key={`${row.at}-${row.label}`} label={`${row.at} · ${row.label}`} value={row.detail} />)}</div>;
}

function retryCopy(event: EventLog) {
  if (event.status === 'delivered') return 'No retry needed.';
  if (event.status === 'retrying') return 'Retry is scheduled by backoff policy. Operator can replay immediately if needed.';
  if (event.status === 'quarantined') return 'Event is held until manual review clears replay or payout.';
  return 'Retry stopped after validation failure. Escalate before replay.';
}

function formatPayload(payload: string) {
  try {
    return JSON.stringify(JSON.parse(payload), null, 2);
  } catch {
    return payload;
  }
}

const apiKeyDetail = (x: ApiKey): Detail => ({ title: x.name, subtitle: x.id, body: <Facts rows={[{ k: 'Brand', v: x.brand, mono: true }, { k: 'Environment', v: x.env }, { k: 'Scopes', v: x.scopes.join(', ') }, { k: 'Owner', v: x.owner }, { k: 'Last used', v: x.lastUsed }, { k: 'Created', v: x.createdAt }]} />, actions: [{ icon: KeyRound, label: 'Rotate key' }, { icon: Copy, label: 'Copy ID' }, { icon: Eye, label: 'View scopes' }] });
const webhookDetail = (x: WebhookEndpoint): Detail => ({ title: 'Webhook endpoint', subtitle: x.url, body: <WebhookDebugBody hook={x} />, actions: [{ icon: RotateCcw, label: 'Send test event' }, { icon: Copy, label: 'Copy webhook ID' }, { icon: Code2, label: 'View signing secret' }] });
const eventDetail = (x: EventLog): Detail => ({ title: x.eventType, subtitle: x.id, body: <EventDebugBody event={x} />, actions: x.status === 'delivered' ? [{ icon: Copy, label: 'Copy event ID' }, { icon: Code2, label: 'View raw' }] : [{ icon: RotateCcw, label: x.status === 'quarantined' ? 'Replay from quarantine' : 'Retry event' }, { icon: AlertTriangle, label: 'Escalate to tech admin' }, { icon: Code2, label: 'View raw payload' }] });
const providerDetail = (x: ProviderHealth): Detail => ({ title: x.provider, subtitle: `${x.brand} · ${x.env}`, body: <ProviderDebugBody provider={x} />, actions: [{ icon: RefreshCw, label: 'Run provider sync' }, { icon: AlertTriangle, label: 'Escalate incident' }, { icon: Copy, label: 'Copy provider ID' }] });
