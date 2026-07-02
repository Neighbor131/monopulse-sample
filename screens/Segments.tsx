import { useMemo, useState } from 'react';
import {
  Add,
  ArchiveBook,
  ArrowDown2,
  Chart,
  ChartSuccess,
  CloseCircle,
  Copy,
  Data,
  Diagram,
  FilterSearch,
  People,
  Profile2User,
  Refresh2,
  SearchNormal,
  SecuritySafe,
  ShieldTick,
  TickCircle,
  UserSearch,
  Warning2,
} from 'iconsax-react';
import type { Icon } from 'iconsax-react';
import ActionModal from '../components/ActionModal';
import type { ActionModalState } from '../components/ActionModal';
import { BRANDS } from '../data/campaigns';
import {
  AUDIENCE_PREVIEW,
  HEALTH_META,
  SEGMENT_AUDIT,
  SEGMENTS,
  STATUS_META,
  TYPE_LABEL,
  segmentKpis,
} from '../data/segments';
import type { AudiencePreview, Segment, SegmentAudit, SegmentHealth, SegmentStatus, SegmentType } from '../data/segments';

type TabId = 'overview' | 'library' | 'builder' | 'exclusions' | 'usage' | 'sync' | 'audit';
type Detail = { title: string; subtitle: string; body: React.ReactNode; actions?: { icon: Icon; label: string }[] } | null;
interface Filters { brand: string; type: string; status: string; health: string; q: string }
const EMPTY: Filters = { brand: '', type: '', status: '', health: '', q: '' };

export default function Segments() {
  const [tab, setTab] = useState<TabId>('overview');
  const [f, setF] = useState<Filters>(EMPTY);
  const [detail, setDetail] = useState<Detail>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [action, setAction] = useState<ActionModalState | null>(null);
  const kpis = useMemo(() => segmentKpis(), []);
  const set = (patch: Partial<Filters>) => setF((p) => ({ ...p, ...patch }));

  const segments = SEGMENTS.filter((s) => {
    if (f.brand && !s.brands.includes(f.brand) && !s.brands.includes('All brands')) return false;
    if (f.type && s.type !== f.type) return false;
    if (f.status && s.status !== f.status) return false;
    if (f.health && s.health !== f.health) return false;
    if (f.q && !`${s.id} ${s.name} ${s.owner} ${s.rules.map((r) => `${r.label} ${r.value}`).join(' ')}`.toLowerCase().includes(f.q.toLowerCase())) return false;
    return true;
  });

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'library', label: 'Segment library', count: SEGMENTS.length },
    { id: 'builder', label: 'Rule builder' },
    { id: 'exclusions', label: 'Exclusions', count: SEGMENTS.filter((s) => s.exclusions.length > 0).length },
    { id: 'usage', label: 'Usage map', count: kpis.usageLinks },
    { id: 'sync', label: 'Sync health', count: SEGMENTS.filter((s) => s.health !== 'healthy').length },
    { id: 'audit', label: 'Audit log' },
  ];

  return (
    <div className="mx-auto w-full max-w-[1360px] px-8 py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[19px] font-semibold tracking-tight">Segments</h1>
            <Pill label={`${kpis.blocked} blockers`} tone={kpis.blocked > 0 ? 'danger' : 'success'} />
          </div>
          <p className="mt-1 text-[13px] text-fg-secondary">Build reusable audiences for campaigns, loyalty, rewards, exclusions and A/B testing across brands.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAction({ kind: 'recalculateSegments', context: `${SEGMENTS.length} segment definitions` })} className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)', border: '1px solid var(--border-strong)' }}>
            <Refresh2 size={15} variant="Linear" /> Recalculate
          </button>
          <button onClick={() => { setTab('builder'); setBuilderOpen(true); }} className="flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            <Add size={15} variant="Linear" /> New segment
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-6 gap-3">
        <Kpi icon={People} label="Active segments" value={String(kpis.active)} />
        <Kpi icon={Profile2User} label="Total audience" value={kpis.totalPlayers.toLocaleString()} />
        <Kpi icon={Warning2} label="Warnings" value={String(kpis.warnings)} accent="var(--warning)" />
        <Kpi icon={SecuritySafe} label="Blocked" value={String(kpis.blocked)} accent="var(--danger)" />
        <Kpi icon={ShieldTick} label="Suppressed players" value={kpis.suppression.toLocaleString()} />
        <Kpi icon={Diagram} label="Usage links" value={String(kpis.usageLinks)} />
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

      {tab !== 'overview' && tab !== 'builder' && tab !== 'audit' && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <FilterSelect label="Brand" value={f.brand} onChange={(v) => set({ brand: v })} options={BRANDS.map((b) => ({ v: b.code, l: `${b.code} · ${b.name}` }))} />
          <FilterSelect label="Type" value={f.type} onChange={(v) => set({ type: v })} options={(Object.keys(TYPE_LABEL) as SegmentType[]).map((t) => ({ v: t, l: TYPE_LABEL[t] }))} />
          <FilterSelect label="Status" value={f.status} onChange={(v) => set({ status: v })} options={(Object.keys(STATUS_META) as SegmentStatus[]).map((s) => ({ v: s, l: STATUS_META[s].label }))} />
          <FilterSelect label="Health" value={f.health} onChange={(v) => set({ health: v })} options={['healthy', 'warning', 'blocked'].map((h) => ({ v: h, l: h }))} />
          <div className="ml-auto flex items-center gap-2 rounded-md border px-3 py-2" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
            <SearchNormal size={14} variant="Linear" color="var(--fg-muted)" />
            <input value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Search segments, rules…" className="w-56 bg-transparent text-[13px] outline-none" />
          </div>
          {Object.values(f).some(Boolean) && <button onClick={() => setF(EMPTY)} className="text-[12px] font-medium" style={{ color: 'var(--accent)' }}>Clear</button>}
        </div>
      )}

      <div className="mt-4">
        {tab === 'overview' && <Overview setTab={setTab} setDetail={setDetail} />}
        {tab === 'library' && <SegmentTable rows={segments} onOpen={(s) => setDetail(segmentDetail(s))} />}
        {tab === 'builder' && <BuilderPreview setDetail={setDetail} onCreate={() => setBuilderOpen(true)} />}
        {tab === 'exclusions' && <Exclusions rows={segments} onOpen={(s) => setDetail(segmentDetail(s))} />}
        {tab === 'usage' && <Usage rows={segments} onOpen={(s) => setDetail(segmentDetail(s))} />}
        {tab === 'sync' && <Sync rows={segments} onOpen={(s) => setDetail(segmentDetail(s))} />}
        {tab === 'audit' && <Audit rows={SEGMENT_AUDIT} onOpen={(a) => setDetail(auditDetail(a))} />}
      </div>

      <DetailDrawer detail={detail} onClose={() => setDetail(null)} />
      <SegmentBuilderDrawer open={builderOpen} onClose={() => setBuilderOpen(false)} />
      <ActionModal state={action} onClose={() => setAction(null)} />
    </div>
  );
}

function Overview({ setTab, setDetail }: { setTab: (t: TabId) => void; setDetail: (d: Detail) => void }) {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-4 gap-3">
        <RailAction icon={FilterSearch} label="Rule builder" value="Preview logic" onClick={() => setTab('builder')} />
        <RailAction icon={SecuritySafe} label="Exclusions" value={`${SEGMENTS.filter((s) => s.exclusions.length > 0).length} segments`} onClick={() => setTab('exclusions')} />
        <RailAction icon={Diagram} label="Usage map" value={`${segmentKpis().usageLinks} links`} onClick={() => setTab('usage')} />
        <RailAction icon={Data} label="Sync health" value={`${SEGMENTS.filter((s) => s.health !== 'healthy').length} issues`} onClick={() => setTab('sync')} />
      </div>
      <section className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="border-b px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-[14px] font-semibold text-fg-primary">Audience readiness</h2>
          <p className="mt-0.5 text-[12.5px] text-fg-secondary">Reusable segments, eligibility health and audience movement.</p>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[760px] divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="grid grid-cols-[minmax(240px,1fr)_84px_92px_88px_112px_84px] items-center gap-3 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-2)' }}>
              <span>Segment</span>
              <span>Status</span>
              <span>Health</span>
              <span className="text-right">Players</span>
              <span>Last calculated</span>
              <span className="text-right">Movement</span>
            </div>
            {SEGMENTS.map((s) => (
              <button key={s.id} onClick={() => setDetail(segmentDetail(s))} className="grid w-full grid-cols-[minmax(240px,1fr)_84px_92px_88px_112px_84px] items-center gap-3 px-4 py-3 text-left hover:bg-[var(--surface-2)]">
                <div className="min-w-0"><div className="truncate text-[13px] font-medium text-fg-primary">{s.name}</div><div className="truncate text-[11.5px] text-fg-muted">{s.brands.join(', ')} · {TYPE_LABEL[s.type]} · {s.owner}</div></div>
                <StatusPill status={s.status} />
                <HealthPill status={s.health} />
                <span className="text-right font-mono text-[12px] text-fg-secondary">{s.count.toLocaleString()}</span>
                <span className="truncate text-[12px] text-fg-muted">{s.lastCalculated}</span>
                <span className="text-right font-mono text-[12px] text-fg-secondary">{delta(s)}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SegmentTable({ rows, onOpen }: { rows: Segment[]; onOpen: (s: Segment) => void }) {
  return <Table cols={['Segment', 'Brands', 'Type', 'Players', 'Movement', 'Rules', 'Usage', 'Health', 'Status']}>{rows.map((s) => (
    <tr key={s.id} onClick={() => onOpen(s)} className="cursor-pointer border-t transition-colors hover:bg-[var(--surface-3)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <Td><div className="font-medium text-fg-primary">{s.name}</div><div className="font-mono text-[11px] text-fg-muted">{s.id}</div></Td>
      <Td>{s.brands.join(' · ')}</Td><Td>{TYPE_LABEL[s.type]}</Td><Td right>{s.count.toLocaleString()}</Td><Td right>{delta(s)}</Td><Td>{s.rules.length} rules</Td><Td>{s.usage.length} links</Td><Td><HealthPill status={s.health} /></Td><Td><StatusPill status={s.status} /></Td>
    </tr>
  ))}</Table>;
}

function BuilderPreview({ setDetail, onCreate }: { setDetail: (d: Detail) => void; onCreate: () => void }) {
  const selected = SEGMENTS[0];
  return (
    <div className="grid grid-cols-[1fr_340px] gap-4">
      <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="border-b px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-semibold text-fg-primary">Rule builder workspace</h2>
              <p className="mt-0.5 text-[12.5px] text-fg-secondary">A designable rule stack for audience logic, exclusions and preview counts.</p>
            </div>
            <button onClick={onCreate} className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[12.5px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}><Add size={14} variant="Linear" /> Build segment</button>
          </div>
        </div>
        <div className="p-5">
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
            <div className="flex items-center justify-between gap-3">
              <div><div className="text-[13px] font-semibold text-fg-primary">{selected.name}</div><div className="mt-0.5 text-[12px] text-fg-muted">{selected.brands.join(', ')} · dynamic audience</div></div>
              <button onClick={() => setDetail(segmentDetail(selected))} className="rounded-md px-3 py-2 text-[12.5px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>Inspect</button>
            </div>
            <div className="mt-4 grid gap-2">
              {selected.rules.map((r, i) => <RuleRow key={r.id} join={i === 0 ? 'WHERE' : 'AND'} label={r.label} operator={r.operator} value={r.value} />)}
              <RuleRow join="EXCLUDE" label="Mandatory risk gates" operator="include" value={selected.exclusions.join(', ')} tone="danger" />
            </div>
          </div>
        </div>
      </section>
      <AudiencePanel />
    </div>
  );
}

function SegmentBuilderDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('High intent reactivation');
  const [type, setType] = useState<SegmentType>('dynamic');
  const [brandMode, setBrandMode] = useState<'selected' | 'all'>('selected');
  const [logic, setLogic] = useState<'all' | 'any'>('all');
  const [rules, setRules] = useState([
    { id: 'draft-r1', category: 'activity', field: 'Last active', operator: 'within', value: '14 days' },
    { id: 'draft-r2', category: 'value', field: 'Lifetime deposits', operator: 'greater than', value: '€250' },
    { id: 'draft-r3', category: 'risk', field: 'Risk score', operator: 'below', value: 'Medium' },
  ]);

  if (!open) return null;

  const selectedBrands = ['ACR', 'VGV', 'BNV'];
  const eligible = AUDIENCE_PREVIEW.filter((p) => selectedBrands.includes(p.brand)).reduce((sum, p) => sum + p.eligible, 0);
  const excluded = AUDIENCE_PREVIEW.filter((p) => selectedBrands.includes(p.brand)).reduce((sum, p) => sum + p.excluded, 0);

  const addRule = () => setRules((prev) => [...prev, { id: `draft-r${prev.length + 1}`, category: 'gameplay', field: 'Game category', operator: 'includes', value: 'Slots' }]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0" style={{ background: 'var(--overlay-scrim)' }} onClick={onClose} />
      <div className="relative flex h-full w-[760px] max-w-[calc(100vw-72px)] flex-col border-l" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-start justify-between gap-4 border-b px-6 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}><FilterSearch size={17} variant="Linear" /></span>
              <div>
                <div className="text-[16px] font-semibold text-fg-primary">Create segment</div>
                <div className="mt-0.5 text-[12px] text-fg-secondary">Reusable audience for campaigns, loyalty, rewards and risk gates.</div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-fg-muted" style={{ background: 'var(--surface-2)' }}><CloseCircle size={17} variant="Linear" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-[1fr_250px] gap-4">
            <div className="flex flex-col gap-4">
              <DrawerSection title="Basics">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Segment name"><input value={name} onChange={(e) => setName(e.target.value)} className="field-input" /></Field>
                  <Field label="Type">
                    <select value={type} onChange={(e) => setType(e.target.value as SegmentType)} className="field-input">
                      {(Object.keys(TYPE_LABEL) as SegmentType[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                    </select>
                  </Field>
                  <Field label="Owner"><input defaultValue="Retention Lead" className="field-input" /></Field>
                  <Field label="Refresh cadence"><select className="field-input"><option>Every 15 minutes</option><option>Hourly</option><option>Manual only</option></select></Field>
                </div>
              </DrawerSection>

              <DrawerSection title="Brand scope">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setBrandMode('selected')} className="rounded-lg border p-3 text-left" style={{ borderColor: brandMode === 'selected' ? 'var(--accent-border)' : 'var(--border-subtle)', background: brandMode === 'selected' ? 'var(--accent-bg)' : 'var(--surface-2)' }}>
                    <div className="text-[13px] font-semibold text-fg-primary">Selected brands</div>
                    <div className="mt-1 text-[11.5px] text-fg-muted">ACR, VGV and BNV only</div>
                  </button>
                  <button onClick={() => setBrandMode('all')} className="rounded-lg border p-3 text-left" style={{ borderColor: brandMode === 'all' ? 'var(--accent-border)' : 'var(--border-subtle)', background: brandMode === 'all' ? 'var(--accent-bg)' : 'var(--surface-2)' }}>
                    <div className="text-[13px] font-semibold text-fg-primary">All org brands</div>
                    <div className="mt-1 text-[11.5px] text-fg-muted">Apply with jurisdiction gates</div>
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">{BRANDS.map((b) => <span key={b.code} className="rounded-md border px-2.5 py-1 text-[12px]" style={{ borderColor: selectedBrands.includes(b.code) || brandMode === 'all' ? 'var(--accent-border)' : 'var(--border-subtle)', background: selectedBrands.includes(b.code) || brandMode === 'all' ? 'var(--accent-bg)' : 'var(--surface-2)', color: 'var(--fg-secondary)' }}>{b.code} · {b.name}</span>)}</div>
              </DrawerSection>

              <DrawerSection title="Rule logic">
                <div className="mb-3 inline-flex rounded-md border p-1" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
                  {(['all', 'any'] as const).map((m) => <button key={m} onClick={() => setLogic(m)} className="rounded px-3 py-1.5 text-[12px] font-semibold" style={logic === m ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { color: 'var(--fg-muted)' }}>{m === 'all' ? 'Match all rules' : 'Match any rule'}</button>)}
                </div>
                <div className="flex flex-col gap-2">
                  {rules.map((r, i) => (
                    <div key={r.id} className="grid grid-cols-[70px_120px_1fr_120px_1fr] items-center gap-2 rounded-lg border p-2" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
                      <span className="text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">{i === 0 ? 'Where' : logic === 'all' ? 'And' : 'Or'}</span>
                      <select defaultValue={r.category} className="field-input py-1.5 text-[12px]"><option>activity</option><option>value</option><option>gameplay</option><option>loyalty</option><option>risk</option><option>geo</option></select>
                      <input defaultValue={r.field} className="field-input py-1.5 text-[12px]" />
                      <select defaultValue={r.operator} className="field-input py-1.5 text-[12px]"><option>within</option><option>greater than</option><option>below</option><option>includes</option><option>equals</option></select>
                      <input defaultValue={r.value} className="field-input py-1.5 text-[12px]" />
                    </div>
                  ))}
                </div>
                <button onClick={addRule} className="mt-3 flex items-center gap-1.5 rounded-md px-3 py-2 text-[12.5px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)', border: '1px solid var(--border-strong)' }}><Add size={14} variant="Linear" /> Add rule</button>
              </DrawerSection>

              <DrawerSection title="Mandatory safety gates">
                <div className="grid grid-cols-2 gap-2">
                  <BuilderCheck label="Responsible-gambling exclusions" status="healthy" desc="Applied before eligibility count" />
                  <BuilderCheck label="Jurisdiction eligibility" status="warning" desc="BNV requires country remap" />
                  <BuilderCheck label="Duplicate account suppression" status="healthy" desc="Synced from operator risk API" />
                  <BuilderCheck label="Reward abuse flags" status="healthy" desc="Blocked players removed" />
                </div>
              </DrawerSection>
            </div>

            <aside className="flex flex-col gap-4">
              <section className="rounded-xl border p-4" style={{ borderColor: 'var(--accent-border)', background: 'var(--accent-bg)' }}>
                <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}><ChartSuccess size={14} variant="Linear" /> Preview result</div>
                <div className="mt-3 font-mono text-[30px] font-semibold leading-none text-fg-primary">{eligible.toLocaleString()}</div>
                <div className="mt-1 text-[12px] text-fg-secondary">eligible players after safety gates</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <MiniStat label="Excluded" value={excluded.toLocaleString()} />
                  <MiniStat label="Overlap" value="17%" />
                  <MiniStat label="Brands" value={brandMode === 'all' ? '6' : '3'} />
                  <MiniStat label="Usage risk" value="Low" />
                </div>
              </section>

              <AudiencePanel />

              <section className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Usage impact</div>
                <div className="mt-3 flex flex-col gap-2">
                  {['Campaign audience selector', 'Loyalty tier accelerator', 'Reward grant eligibility', 'Risk approval reviewer'].map((item, i) => <div key={item} className="flex items-center justify-between gap-2 rounded-md px-3 py-2" style={{ background: 'var(--surface-2)' }}><span className="text-[12px] text-fg-secondary">{item}</span><span className="text-[11px] text-fg-muted">{i === 0 ? 'Default' : 'Optional'}</span></div>)}
                </div>
              </section>
            </aside>
          </div>
        </div>

        <div className="border-t px-6 py-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[12px] text-fg-secondary"><TickCircle size={15} variant="Bold" color="var(--success)" /> Draft can be saved. One warning requires review before activation.</div>
            <div className="flex gap-2">
              <Action icon={ArchiveBook} label="Save draft" />
              <Action icon={Refresh2} label="Recalculate preview" />
              <button className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[12.5px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}><ShieldTick size={13} variant="Linear" /> Submit approval</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Exclusions({ rows, onOpen }: { rows: Segment[]; onOpen: (s: Segment) => void }) {
  return <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>{rows.map((s) => <button key={s.id} onClick={() => onOpen(s)} className="grid w-full grid-cols-[1fr_360px_110px] items-center gap-4 border-b px-5 py-3 text-left last:border-0 hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border-subtle)' }}><div><div className="text-[13px] font-medium text-fg-primary">{s.name}</div><div className="mt-0.5 text-[11.5px] text-fg-muted">{s.count.toLocaleString()} players · {s.brands.join(', ')}</div></div><span className="truncate text-[12px] text-fg-secondary">{s.exclusions.length ? s.exclusions.join(' · ') : 'No local exclusions'}</span><HealthPill status={s.health} /></button>)}</section>;
}

function Usage({ rows, onOpen }: { rows: Segment[]; onOpen: (s: Segment) => void }) {
  return <div className="grid grid-cols-2 gap-4">{rows.map((s) => <button key={s.id} onClick={() => onOpen(s)} className="rounded-xl border p-4 text-left hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}><div className="flex items-start justify-between gap-3"><div><div className="text-[13px] font-semibold text-fg-primary">{s.name}</div><div className="mt-0.5 text-[11.5px] text-fg-muted">{s.usage.length} connected objects</div></div><StatusPill status={s.status} /></div><div className="mt-3 flex flex-col gap-2">{s.usage.map((u) => <div key={`${u.kind}-${u.name}`} className="flex items-center justify-between gap-3 rounded-md px-3 py-2" style={{ background: 'var(--surface-2)' }}><span className="text-[12px] text-fg-secondary">{u.kind} · {u.name}</span><span className="text-[11px] text-fg-muted">{u.status}</span></div>)}</div></button>)}</div>;
}

function Sync({ rows, onOpen }: { rows: Segment[]; onOpen: (s: Segment) => void }) {
  return <Table cols={['Segment', 'Last calculated', 'Sync status', 'Count', 'Movement', 'Health']}>{rows.map((s) => (
    <tr key={s.id} onClick={() => onOpen(s)} className="cursor-pointer border-t transition-colors hover:bg-[var(--surface-3)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <Td><div className="font-medium text-fg-primary">{s.name}</div><div className="font-mono text-[11px] text-fg-muted">{s.id}</div></Td><Td>{s.lastCalculated}</Td><Td>{s.syncStatus}</Td><Td right>{s.count.toLocaleString()}</Td><Td right>{delta(s)}</Td><Td><HealthPill status={s.health} /></Td>
    </tr>
  ))}</Table>;
}

function Audit({ rows, onOpen }: { rows: SegmentAudit[]; onOpen: (a: SegmentAudit) => void }) {
  return <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>{rows.map((a) => <button key={a.id} onClick={() => onOpen(a)} className="flex w-full items-start gap-3 border-b px-5 py-3 text-left last:border-0 hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border-subtle)' }}><span className="mt-1 h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }} /><div><div className="text-[13px] font-medium text-fg-primary">{a.action} · {a.target}</div><div className="mt-0.5 text-[11.5px] text-fg-muted">{a.actor} · {a.at}</div><div className="mt-1 text-[12px] text-fg-secondary">{a.note}</div></div></button>)}</section>;
}

function AudiencePanel() {
  return <aside className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}><div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><Chart size={13} variant="Linear" /> Audience preview</div><div className="mt-4 flex flex-col gap-2">{AUDIENCE_PREVIEW.map((p) => <PreviewRow key={p.brand} p={p} />)}</div></aside>;
}

function PreviewRow({ p }: { p: AudiencePreview }) {
  const pct = p.players ? Math.round((p.eligible / p.players) * 100) : 0;
  return <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div className="flex items-center justify-between"><span className="font-mono text-[12px] text-fg-secondary">{p.brand}</span><HealthPill status={p.health} /></div><div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--surface-3)' }}><div className="h-full rounded-full" style={{ width: `${pct}%`, background: p.health === 'blocked' ? 'var(--danger)' : p.health === 'warning' ? 'var(--warning)' : 'var(--accent)' }} /></div><div className="mt-1.5 flex justify-between text-[11.5px] text-fg-muted"><span>{p.eligible.toLocaleString()} eligible</span><span>{p.excluded.toLocaleString()} excluded</span></div></div>;
}

function RuleRow({ join, label, operator, value, tone = 'default' }: { join: string; label: string; operator: string; value: string; tone?: 'default' | 'danger' }) {
  return <div className="grid grid-cols-[80px_1fr_120px_1.4fr] items-center gap-3 rounded-md border px-3 py-2.5" style={{ borderColor: tone === 'danger' ? 'var(--danger-border)' : 'var(--border-subtle)', background: tone === 'danger' ? 'var(--danger-bg)' : 'var(--surface-1)' }}><span className="text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">{join}</span><span className="text-[12.5px] font-medium text-fg-primary">{label}</span><span className="text-[12px] text-fg-secondary">{operator}</span><span className="truncate text-[12px] text-fg-secondary">{value}</span></div>;
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="mb-3 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">{title}</div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">{label}</span>
      {children}
    </label>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border px-3 py-2" style={{ borderColor: 'var(--accent-border)', background: 'var(--surface-1)' }}>
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">{label}</div>
      <div className="mt-1 font-mono text-[13px] font-semibold text-fg-primary">{value}</div>
    </div>
  );
}

function BuilderCheck({ label, status, desc }: { label: string; status: SegmentHealth; desc: string }) {
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-[12.5px] font-semibold text-fg-primary">{label}</div>
        <HealthPill status={status} />
      </div>
      <div className="mt-1.5 text-[11.5px] leading-5 text-fg-muted">{desc}</div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, accent = 'var(--accent)' }: { icon: Icon; label: string; value: string; accent?: string }) {
  return <div className="rounded-xl border px-4 py-3.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}><div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><span className="flex h-5 w-5 items-center justify-center rounded" style={{ background: 'var(--surface-3)', color: accent }}><Icon size={12} variant="Linear" color={accent} /></span>{label}</div><div className="mt-1.5 font-mono text-[22px] font-semibold leading-none tabular-nums text-fg-primary">{value}</div></div>;
}

function RailAction({ icon: Icon, label, value, onClick }: { icon: Icon; label: string; value: string; onClick: () => void }) {
  return <button onClick={onClick} className="rounded-xl border p-4 text-left hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}><div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><Icon size={13} variant="Linear" /> {label}</div><div className="mt-2 text-[16px] font-semibold text-fg-primary">{value}</div></button>;
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  const active = value !== '';
  return <div className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} className="cursor-pointer appearance-none rounded-md border py-2 pl-3 pr-8 text-[12.5px] font-medium outline-none" style={{ borderColor: active ? 'var(--accent-border)' : 'var(--border-strong)', background: active ? 'var(--accent-bg)' : 'var(--surface-2)', color: active ? 'var(--fg-primary)' : 'var(--fg-secondary)' }}><option value="">{label}: All</option>{options.map((o) => <option key={o.v} value={o.v}>{label}: {o.l}</option>)}</select><ArrowDown2 size={13} variant="Linear" color="var(--fg-muted)" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" /></div>;
}

function Table({ cols, children }: { cols: string[]; children: React.ReactNode }) {
  return <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}><table className="min-w-[980px] w-full border-collapse text-left"><thead><tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-1)' }}>{cols.map((c) => <th key={c} className="px-4 py-2.5 font-semibold">{c}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function Td({ children, mono, right }: { children: React.ReactNode; mono?: boolean; right?: boolean }) {
  return <td className={`px-4 py-3 text-[12.5px] ${mono ? 'font-mono' : ''} ${right ? 'text-right font-mono tabular-nums' : ''}`} style={{ color: 'var(--fg-secondary)' }}>{children}</td>;
}

function StatusPill({ status }: { status: SegmentStatus }) {
  const m = STATUS_META[status];
  return <span className="inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium leading-none" style={{ color: m.fg, background: m.bg }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: m.fg }} /> {m.label}</span>;
}

function HealthPill({ status }: { status: SegmentHealth }) {
  const m = HEALTH_META[status];
  return <span className="inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium leading-none" style={{ color: m.fg, background: m.bg }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: m.fg }} /> {m.label}</span>;
}

function Pill({ label, tone }: { label: string; tone: 'success' | 'warning' | 'danger' }) {
  const style = tone === 'success' ? { color: 'var(--success)', background: 'var(--status-live-bg)' } : tone === 'warning' ? { color: 'var(--warning)', background: 'var(--warning-bg)' } : { color: 'var(--danger)', background: 'var(--danger-bg)' };
  return <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium" style={style}>{label}</span>;
}

function DetailDrawer({ detail, onClose }: { detail: Detail; onClose: () => void }) {
  if (!detail) return null;
  const actions = detail.actions ?? [{ icon: Copy, label: 'Copy ID' }, { icon: ArchiveBook, label: 'Audit trail' }, { icon: Refresh2, label: 'Recalculate' }];
  return <div className="fixed inset-0 z-50 flex justify-end"><div className="absolute inset-0" style={{ background: 'var(--overlay-scrim)' }} onClick={onClose} /><div className="relative flex h-full w-[470px] flex-col border-l" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-lg)' }}><div className="flex items-start justify-between gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}><div className="min-w-0"><div className="text-[15px] font-semibold text-fg-primary">{detail.title}</div><div className="mt-0.5 truncate font-mono text-[11.5px] text-fg-muted">{detail.subtitle}</div></div><button onClick={onClose} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-fg-muted" style={{ background: 'var(--surface-2)' }}><CloseCircle size={16} variant="Linear" /></button></div><div className="flex-1 overflow-y-auto px-5 py-4">{detail.body}</div><div className="border-t px-5 py-3.5" style={{ borderColor: 'var(--border-subtle)' }}><div className="flex flex-wrap gap-2">{actions.map((a) => <Action key={a.label} icon={a.icon} label={a.label} />)}</div></div></div></div>;
}

function Action({ icon: Icon, label }: { icon: Icon; label: string }) {
  return <button className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[12.5px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)', border: '1px solid var(--border-strong)' }}><Icon size={13} variant="Linear" /> {label}</button>;
}

function Facts({ rows }: { rows: { k: string; v: string; mono?: boolean }[] }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-3">{rows.map((r) => <div key={r.k}><div className="text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">{r.k}</div><div className={`mt-0.5 text-[12.5px] font-medium text-fg-primary ${r.mono ? 'font-mono' : ''}`}>{r.v}</div></div>)}</div>;
}

function delta(s: Segment) {
  const d = s.count - s.previousCount;
  return `${d >= 0 ? '+' : ''}${d.toLocaleString()}`;
}

const segmentDetail = (s: Segment): Detail => ({
  title: s.name,
  subtitle: s.id,
  body: <div className="flex flex-col gap-5"><Facts rows={[{ k: 'Brands', v: s.brands.join(', ') }, { k: 'Type', v: TYPE_LABEL[s.type] }, { k: 'Players', v: s.count.toLocaleString() }, { k: 'Movement', v: delta(s) }, { k: 'Owner', v: s.owner }, { k: 'Last calculated', v: s.lastCalculated }, { k: 'Sync status', v: s.syncStatus }, { k: 'Overlap warning', v: s.overlapWarning }]} /><div><div className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">Rules</div><div className="flex flex-col gap-2">{s.rules.map((r) => <div key={r.id} className="rounded-md border px-3 py-2 text-[12px] text-fg-secondary" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>{r.label} · {r.operator} · {r.value}</div>)}</div></div></div>,
  actions: [{ icon: UserSearch, label: 'Preview players' }, { icon: Refresh2, label: 'Recalculate' }, { icon: Copy, label: 'Copy ID' }],
});
const auditDetail = (a: SegmentAudit): Detail => ({ title: a.action, subtitle: a.id, body: <Facts rows={[{ k: 'Actor', v: a.actor }, { k: 'Target', v: a.target }, { k: 'At', v: a.at }, { k: 'Note', v: a.note }]} /> });
