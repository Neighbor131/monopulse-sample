import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArchiveBook,
  ArrowDown2,
  Card,
  CloseCircle,
  Code,
  Copy,
  Diagram,
  Gift,
  MoneyRecive,
  Refresh2,
  SearchNormal,
  SecuritySafe,
  ShieldTick,
  Ticket,
  WalletMoney,
  Warning2,
} from 'iconsax-react';
import type { Icon } from 'iconsax-react';
import ActionModal from '../components/ActionModal';
import type { ActionModalState } from '../components/ActionModal';
import { DemoStateHint, LoadingBlock, StateCard, useDemoState } from '../components/StateViews';
import { BRANDS } from '../data/campaigns';
import {
  FULFILLMENT_LABEL,
  GATE_META,
  HEALTH_META,
  KIND_LABEL,
  LIABILITY,
  MANUAL_GRANTS,
  REWARD_AUDIT,
  REWARDS,
  RISK_GATES,
  STATUS_META,
  rewardKpis,
} from '../data/rewards';
import type {
  FulfillmentMode,
  FulfillmentStatus,
  GateStatus,
  GrantStatus,
  ManualGrant,
  RewardAudit,
  RewardItem,
  RewardKind,
  RewardStatus,
  RiskGate,
} from '../data/rewards';

type TabId = 'overview' | 'library' | 'fulfillment' | 'grants' | 'liability' | 'risk' | 'audit';
type Detail = { title: string; subtitle: string; body: React.ReactNode; actions?: { icon: Icon; label: string }[] } | null;
interface Filters { brand: string; kind: string; status: string; health: string; q: string }
const EMPTY: Filters = { brand: '', kind: '', status: '', health: '', q: '' };

export default function Rewards() {
  const navigate = useNavigate();
  const demoState = useDemoState();
  const [tab, setTab] = useState<TabId>('overview');
  const [f, setF] = useState<Filters>(EMPTY);
  const [detail, setDetail] = useState<Detail>(null);
  const [action, setAction] = useState<ActionModalState | null>(null);
  const kpis = useMemo(() => rewardKpis(), []);
  const set = (patch: Partial<Filters>) => setF((p) => ({ ...p, ...patch }));

  const rewards = demoState === 'empty' ? [] : REWARDS.filter((r) => {
    if (f.brand && r.brand !== f.brand) return false;
    if (f.kind && r.kind !== f.kind) return false;
    if (f.status && r.status !== f.status) return false;
    if (f.health && r.health !== f.health && r.risk !== f.health) return false;
    if (f.q && !`${r.id} ${r.name} ${r.campaignUse} ${r.provider} ${r.bonusGuid ?? ''}`.toLowerCase().includes(f.q.toLowerCase())) return false;
    return true;
  });
  const grants = demoState === 'empty' ? [] : MANUAL_GRANTS.filter((g) => {
    if (f.brand && g.brand !== f.brand) return false;
    if (f.status && g.status !== f.status) return false;
    if (f.health && g.risk !== f.health) return false;
    if (f.q && !`${g.id} ${g.rewardName} ${g.playerId} ${g.reason}`.toLowerCase().includes(f.q.toLowerCase())) return false;
    return true;
  });
  const gates = demoState === 'empty' ? [] : RISK_GATES.filter((g) => {
    if (f.health && g.status !== f.health) return false;
    if (f.q && !`${g.label} ${g.scope} ${g.impact}`.toLowerCase().includes(f.q.toLowerCase())) return false;
    return true;
  });

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'library', label: 'Reward library', count: REWARDS.length },
    { id: 'fulfillment', label: 'Fulfillment mapping', count: REWARDS.filter((r) => r.health !== 'healthy').length },
    { id: 'grants', label: 'Manual grants', count: MANUAL_GRANTS.filter((g) => g.status === 'pending' || g.status === 'retrying').length },
    { id: 'liability', label: 'Liability' },
    { id: 'risk', label: 'Risk gates', count: RISK_GATES.filter((g) => g.status !== 'clear').length },
    { id: 'audit', label: 'Audit log' },
  ];

  return (
    <div className="mx-auto w-full max-w-[1360px] px-8 py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[19px] font-semibold tracking-tight">Rewards</h1>
            <Pill label={`${kpis.guidCoverage}% GUID coverage`} tone={kpis.guidCoverage > 90 ? 'success' : 'warning'} />
          </div>
          <p className="mt-1 text-[13px] text-fg-secondary">Manage reward catalog, fulfillment mapping, manual grants, liability and safety gates across brands.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAction({ kind: 'syncGuids', context: `${kpis.guidCoverage}% current GUID coverage` })} className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)', border: '1px solid var(--border-strong)' }}>
            <Refresh2 size={15} variant="Linear" /> Sync GUIDs
          </button>
          <button onClick={() => setAction({ kind: 'newReward' })} className="flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            <Gift size={15} variant="Linear" /> New reward
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-6 gap-3">
        <Kpi icon={Gift} label="Active rewards" value={String(kpis.activeRewards)} />
        <Kpi icon={WalletMoney} label="Pending liability" value={`€${kpis.pendingLiability.toLocaleString()}`} accent="var(--warning)" />
        <Kpi icon={Warning2} label="Failed fulfillment" value={String(kpis.failedFulfillment)} accent="var(--danger)" />
        <Kpi icon={Ticket} label="Grant queue" value={String(kpis.queuedGrants)} />
        <Kpi icon={Code} label="GUID coverage" value={`${kpis.guidCoverage}%`} />
        <Kpi icon={SecuritySafe} label="Risk blockers" value={String(kpis.blockers)} accent="var(--danger)" />
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

      {tab !== 'overview' && tab !== 'liability' && tab !== 'audit' && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <FilterSelect label="Brand" value={f.brand} onChange={(v) => set({ brand: v })} options={BRANDS.map((b) => ({ v: b.code, l: `${b.code} · ${b.name}` }))} />
          {(tab === 'library' || tab === 'fulfillment') && <FilterSelect label="Type" value={f.kind} onChange={(v) => set({ kind: v })} options={(Object.keys(KIND_LABEL) as RewardKind[]).map((k) => ({ v: k, l: KIND_LABEL[k] }))} />}
          {tab !== 'risk' && <FilterSelect label="Status" value={f.status} onChange={(v) => set({ status: v })} options={statusOptions(tab)} />}
          <FilterSelect label={tab === 'risk' ? 'Gate' : 'Health'} value={f.health} onChange={(v) => set({ health: v })} options={(tab === 'risk' ? ['clear', 'warning', 'blocked'] : ['healthy', 'warning', 'failing']).map((s) => ({ v: s, l: s }))} />
          <div className="ml-auto flex items-center gap-2 rounded-md border px-3 py-2" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
            <SearchNormal size={14} variant="Linear" color="var(--fg-muted)" />
            <input value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Search rewards, players, GUIDs…" className="w-60 bg-transparent text-[13px] outline-none" />
          </div>
          {Object.values(f).some(Boolean) && <button onClick={() => setF(EMPTY)} className="text-[12px] font-medium" style={{ color: 'var(--accent)' }}>Clear</button>}
        </div>
      )}

      {demoState === 'error' && (
        <div className="mt-4">
          <StateCard
            state="error"
            title="Reward data source is unavailable"
            detail="Reward actions should be paused when GUID mapping, liability or fulfillment health cannot be verified."
            onAction={() => navigate('/rewards')}
          />
          <DemoStateHint area="reward states" />
        </div>
      )}

      {demoState === 'loading' && (
        <div className="mt-4">
          <LoadingBlock title="Loading rewards" rows={6} />
          <DemoStateHint area="reward states" />
        </div>
      )}

      {demoState === 'empty' && (
        <div className="mt-4">
          <StateCard
            state="empty"
            title="No rewards configured yet"
            detail="The reward catalog should explain that campaigns cannot launch with reward mechanics until at least one wallet, bonus GUID or MonoPulse trigger is configured."
            actionLabel="Create reward"
            onAction={() => setAction({ kind: 'newReward' })}
          />
          <DemoStateHint area="reward states" />
        </div>
      )}

      {demoState === null && <div className="mt-4">
        {tab === 'overview' && <Overview setTab={setTab} openReward={(r) => navigate(`/rewards/${r.id}`)} />}
        {tab === 'library' && <RewardTable rows={rewards} onOpen={(r) => navigate(`/rewards/${r.id}`)} />}
        {tab === 'fulfillment' && <Fulfillment rows={rewards} onOpen={(r) => navigate(`/rewards/${r.id}`)} />}
        {tab === 'grants' && <GrantTable rows={grants} onOpen={(g) => setDetail(grantDetail(g))} />}
        {tab === 'liability' && <Liability setDetail={setDetail} />}
        {tab === 'risk' && <RiskGates rows={gates} onOpen={(g) => setDetail(gateDetail(g))} />}
        {tab === 'audit' && <Audit rows={REWARD_AUDIT} onOpen={(a) => setDetail(auditDetail(a))} />}
      </div>}
      {demoState === null && <DemoStateHint area="reward states" />}

      <DetailDrawer detail={detail} onClose={() => setDetail(null)} />
      <ActionModal state={action} onClose={() => setAction(null)} />
    </div>
  );
}

function Overview({ setTab, openReward }: { setTab: (t: TabId) => void; openReward: (r: RewardItem) => void }) {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-4 gap-3">
        <RailAction icon={Ticket} label="Manual grants" value={`${MANUAL_GRANTS.filter((g) => g.status === 'pending' || g.status === 'retrying').length} queued`} onClick={() => setTab('grants')} />
        <RailAction icon={Diagram} label="Fulfillment mapping" value={`${REWARDS.filter((r) => r.health !== 'healthy').length} warnings`} onClick={() => setTab('fulfillment')} />
        <RailAction icon={WalletMoney} label="Liability review" value={`€${REWARDS.reduce((s, r) => s + r.pendingLiability, 0).toLocaleString()}`} onClick={() => setTab('liability')} />
        <RailAction icon={SecuritySafe} label="Risk gates" value={`${RISK_GATES.filter((g) => g.status !== 'clear').length} blockers`} onClick={() => setTab('risk')} />
      </div>
      <section className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="border-b px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-[14px] font-semibold text-fg-primary">Reward readiness</h2>
          <p className="mt-0.5 text-[12.5px] text-fg-secondary">Reward fulfillment, risk and liability status by reward object.</p>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[820px] divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="grid grid-cols-[minmax(340px,1fr)_104px_116px_100px_116px] items-center gap-4 px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-2)' }}>
              <span>Reward</span>
              <span>Status</span>
              <span>Health</span>
              <span>Risk</span>
              <span className="text-right">Liability</span>
            </div>
            {REWARDS.map((r) => (
              <button key={r.id} onClick={() => openReward(r)} className="grid w-full grid-cols-[minmax(340px,1fr)_104px_116px_100px_116px] items-center gap-4 px-5 py-3 text-left hover:bg-[var(--surface-2)]">
                <div className="min-w-0"><div className="truncate text-[13px] font-medium text-fg-primary">{r.name}</div><div className="truncate text-[11.5px] text-fg-muted">{r.brand} · {KIND_LABEL[r.kind]} · {FULFILLMENT_LABEL[r.fulfillment]}</div></div>
                <StatusPill status={r.status} />
                <HealthPill status={r.health} />
                <GatePill status={r.risk} />
                <span className="text-right font-mono text-[12px] text-fg-secondary">€{r.pendingLiability.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function RewardTable({ rows, onOpen }: { rows: RewardItem[]; onOpen: (r: RewardItem) => void }) {
  return <Table cols={['Reward', 'Brand', 'Type', 'Fulfillment', 'Cost', 'Issued / claimed', 'Liability', 'Risk', 'Status']}>{rows.map((r) => (
    <tr key={r.id} onClick={() => onOpen(r)} className="cursor-pointer border-t transition-colors hover:bg-[var(--surface-3)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <Td><div className="font-medium text-fg-primary">{r.name}</div><div className="font-mono text-[11px] text-fg-muted">{r.id}</div></Td>
      <Td mono>{r.brand}</Td><Td>{KIND_LABEL[r.kind]}</Td><Td>{FULFILLMENT_LABEL[r.fulfillment]}</Td><Td right>€{r.costPerGrant.toLocaleString()}</Td><Td>{r.issued.toLocaleString()} / {r.claimed.toLocaleString()}</Td><Td right>€{r.pendingLiability.toLocaleString()}</Td><Td><GatePill status={r.risk} /></Td><Td><StatusPill status={r.status} /></Td>
    </tr>
  ))}</Table>;
}

function Fulfillment({ rows, onOpen }: { rows: RewardItem[]; onOpen: (r: RewardItem) => void }) {
  const grouped = rows.reduce<Record<FulfillmentMode, RewardItem[]>>((acc, r) => {
    acc[r.fulfillment].push(r);
    return acc;
  }, { operator_wallet: [], monopulse_trigger: [], bonus_guid: [], manual_ops: [] });
  return (
    <div className="grid grid-cols-2 gap-4">
      {(Object.keys(grouped) as FulfillmentMode[]).map((mode) => (
        <section key={mode} className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <div className="border-b px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-semibold text-fg-primary">{FULFILLMENT_LABEL[mode]}</h2>
                <p className="mt-0.5 text-[12.5px] text-fg-secondary">{grouped[mode].length} reward mappings</p>
              </div>
              <HealthPill status={grouped[mode].some((r) => r.health === 'failing') ? 'failing' : grouped[mode].some((r) => r.health === 'warning') ? 'warning' : 'healthy'} />
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {grouped[mode].map((r) => (
              <button key={r.id} onClick={() => onOpen(r)} className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-[var(--surface-2)]">
                <div><div className="text-[13px] font-medium text-fg-primary">{r.name}</div><div className="font-mono text-[11.5px] text-fg-muted">{r.bonusGuid ?? r.provider}</div></div>
                <GatePill status={r.risk} />
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function GrantTable({ rows, onOpen }: { rows: ManualGrant[]; onOpen: (g: ManualGrant) => void }) {
  return <Table cols={['Grant', 'Player', 'Brand', 'Reason', 'Requester', 'Amount', 'Risk', 'Status']}>{rows.map((g) => (
    <tr key={g.id} onClick={() => onOpen(g)} className="cursor-pointer border-t transition-colors hover:bg-[var(--surface-3)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <Td><div className="font-medium text-fg-primary">{g.rewardName}</div><div className="font-mono text-[11px] text-fg-muted">{g.id} · {g.createdAt}</div></Td>
      <Td mono>{g.playerId}</Td><Td mono>{g.brand}</Td><Td>{g.reason}</Td><Td>{g.requester}</Td><Td right>€{g.amount.toLocaleString()}</Td><Td><GatePill status={g.risk} /></Td><Td><GrantPill status={g.status} /></Td>
    </tr>
  ))}</Table>;
}

function Liability({ setDetail }: { setDetail: (d: Detail) => void }) {
  return (
    <div className="grid grid-cols-[1fr_340px] gap-4">
      <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="border-b px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-[14px] font-semibold text-fg-primary">Reward liability by brand</h2>
          <p className="mt-0.5 text-[12.5px] text-fg-secondary">Issued, pending and expired value against configured brand caps.</p>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {LIABILITY.map((l) => {
            const used = Math.min(100, Math.round(((l.issuedValue + l.pendingValue) / l.cap) * 100));
            return (
              <button key={l.brand} onClick={() => setDetail(liabilityDetail(l.brand))} className="grid w-full grid-cols-[80px_1fr_110px_110px_110px] items-center gap-4 px-5 py-3 text-left hover:bg-[var(--surface-2)]">
                <span className="font-mono text-[12px] text-fg-secondary">{l.brand}</span>
                <div><div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--surface-3)' }}><div className="h-full rounded-full" style={{ width: `${used}%`, background: used > 90 ? 'var(--danger)' : used > 70 ? 'var(--warning)' : 'var(--accent)' }} /></div><div className="mt-1 text-[11.5px] text-fg-muted">{used}% of cap used</div></div>
                <span className="text-right font-mono text-[12px] text-fg-secondary">€{l.issuedValue.toLocaleString()}</span>
                <span className="text-right font-mono text-[12px] text-fg-secondary">€{l.pendingValue.toLocaleString()}</span>
                <HealthPill status={l.health} />
              </button>
            );
          })}
        </div>
      </section>
      <aside className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><WalletMoney size={13} variant="Linear" /> Liability summary</div>
        <div className="mt-4 grid gap-3">
          <Metric label="Issued value" value={`€${LIABILITY.reduce((s, l) => s + l.issuedValue, 0).toLocaleString()}`} />
          <Metric label="Pending value" value={`€${LIABILITY.reduce((s, l) => s + l.pendingValue, 0).toLocaleString()}`} tone="warning" />
          <Metric label="Expired value" value={`€${LIABILITY.reduce((s, l) => s + l.expiredValue, 0).toLocaleString()}`} />
          <Metric label="Brands over watch threshold" value={String(LIABILITY.filter((l) => (l.issuedValue + l.pendingValue) / l.cap > 0.7).length)} tone="danger" />
        </div>
      </aside>
    </div>
  );
}

function RiskGates({ rows, onOpen }: { rows: RiskGate[]; onOpen: (g: RiskGate) => void }) {
  return <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>{rows.map((g) => <button key={g.id} onClick={() => onOpen(g)} className="grid w-full grid-cols-[1fr_140px_110px_150px] items-center gap-4 border-b px-5 py-3 text-left last:border-0 hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border-subtle)' }}><div><div className="text-[13px] font-medium text-fg-primary">{g.label}</div><div className="mt-0.5 text-[12px] text-fg-secondary">{g.impact}</div></div><span className="text-[12px] text-fg-secondary">{g.scope}</span><GatePill status={g.status} /><span className="text-[12px] text-fg-muted">{g.owner}</span></button>)}</section>;
}

function Audit({ rows, onOpen }: { rows: RewardAudit[]; onOpen: (a: RewardAudit) => void }) {
  return <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>{rows.map((a) => <button key={a.id} onClick={() => onOpen(a)} className="flex w-full items-start gap-3 border-b px-5 py-3 text-left last:border-0 hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border-subtle)' }}><span className="mt-1 h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }} /><div><div className="text-[13px] font-medium text-fg-primary">{a.action} · {a.target}</div><div className="mt-0.5 text-[11.5px] text-fg-muted">{a.actor} · {a.at}</div><div className="mt-1 text-[12px] text-fg-secondary">{a.note}</div></div></button>)}</section>;
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
  return <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}><table className="min-w-[980px] w-full border-collapse text-left"><thead><tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-1)' }}>{cols.map((c) => <th key={c} className="whitespace-nowrap px-4 py-2.5 font-semibold">{c}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function Td({ children, mono, right }: { children: React.ReactNode; mono?: boolean; right?: boolean }) {
  return <td className={`px-4 py-3 text-[12.5px] ${mono ? 'font-mono' : ''} ${right ? 'text-right font-mono tabular-nums' : ''}`} style={{ color: 'var(--fg-secondary)' }}>{children}</td>;
}

function StatusPill({ status }: { status: RewardStatus }) {
  const m = STATUS_META[status];
  return <span className="inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium leading-none" style={{ color: m.fg, background: m.bg }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: m.fg }} /> {m.label}</span>;
}

function HealthPill({ status }: { status: FulfillmentStatus }) {
  const m = HEALTH_META[status];
  return <span className="inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium leading-none" style={{ color: m.fg, background: m.bg }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: m.fg }} /> {m.label}</span>;
}

function GatePill({ status }: { status: GateStatus }) {
  const m = GATE_META[status];
  return <span className="inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium leading-none" style={{ color: m.fg, background: m.bg }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: m.fg }} /> {m.label}</span>;
}

function GrantPill({ status }: { status: GrantStatus }) {
  const meta = status === 'approved'
    ? { label: 'Approved', fg: 'var(--success)', bg: 'var(--status-live-bg)' }
    : status === 'pending' || status === 'retrying'
      ? { label: status === 'pending' ? 'Pending' : 'Retrying', fg: 'var(--warning)', bg: 'var(--warning-bg)' }
      : { label: 'Failed', fg: 'var(--danger)', bg: 'var(--danger-bg)' };
  return <span className="inline-flex w-fit rounded-md px-2 py-0.5 text-[11px] font-medium leading-none" style={{ color: meta.fg, background: meta.bg }}>{meta.label}</span>;
}

function Pill({ label, tone }: { label: string; tone: 'success' | 'warning' | 'danger' }) {
  const style = tone === 'success' ? { color: 'var(--success)', background: 'var(--status-live-bg)' } : tone === 'warning' ? { color: 'var(--warning)', background: 'var(--warning-bg)' } : { color: 'var(--danger)', background: 'var(--danger-bg)' };
  return <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium" style={style}>{label}</span>;
}

function Metric({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'warning' | 'danger' }) {
  const color = tone === 'warning' ? 'var(--warning)' : tone === 'danger' ? 'var(--danger)' : 'var(--fg-primary)';
  return <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div className="text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">{label}</div><div className="mt-1 font-mono text-[18px] font-semibold tabular-nums" style={{ color }}>{value}</div></div>;
}

function DetailDrawer({ detail, onClose }: { detail: Detail; onClose: () => void }) {
  if (!detail) return null;
  const actions = detail.actions ?? [{ icon: Copy, label: 'Copy ID' }, { icon: ArchiveBook, label: 'Audit trail' }, { icon: Refresh2, label: 'Retry / sync' }];
  return <div className="fixed inset-0 z-50 flex justify-end"><div className="absolute inset-0" style={{ background: 'var(--overlay-scrim)' }} onClick={onClose} /><div className="relative flex h-full w-[540px] flex-col border-l" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-lg)' }}><div className="flex items-start justify-between gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}><div className="min-w-0"><div className="text-[15px] font-semibold text-fg-primary">{detail.title}</div><div className="mt-0.5 truncate font-mono text-[11.5px] text-fg-muted">{detail.subtitle}</div></div><button onClick={onClose} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-fg-muted" style={{ background: 'var(--surface-2)' }}><CloseCircle size={16} variant="Linear" /></button></div><div className="flex-1 overflow-y-auto px-5 py-4">{detail.body}</div><div className="border-t px-5 py-3.5" style={{ borderColor: 'var(--border-subtle)' }}><div className="flex flex-wrap gap-2">{actions.map((a) => <Action key={a.label} icon={a.icon} label={a.label} />)}</div></div></div></div>;
}

function Action({ icon: Icon, label }: { icon: Icon; label: string }) {
  return <button className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[12.5px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)', border: '1px solid var(--border-strong)' }}><Icon size={13} variant="Linear" /> {label}</button>;
}

function Facts({ rows }: { rows: { k: string; v: string; mono?: boolean }[] }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-3">{rows.map((r) => <div key={r.k}><div className="text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">{r.k}</div><div className={`mt-0.5 text-[12.5px] font-medium text-fg-primary ${r.mono ? 'font-mono' : ''}`}>{r.v}</div></div>)}</div>;
}

function RewardFulfillmentBody({ reward }: { reward: RewardItem }) {
  const brandLiability = LIABILITY.find((l) => l.brand === reward.brand);
  const grants = MANUAL_GRANTS.filter((g) => g.rewardId === reward.id);
  const gates = RISK_GATES.filter((g) => g.scope.includes(reward.brand) || g.scope === 'All brands' || g.scope === 'All manual grants');
  const audit = REWARD_AUDIT.filter((a) => a.target === reward.id || grants.some((g) => g.id === a.target));
  const used = brandLiability ? Math.min(100, Math.round(((brandLiability.issuedValue + brandLiability.pendingValue) / brandLiability.cap) * 100)) : 0;
  return (
    <div className="flex flex-col gap-5">
      <FulfillmentDecision health={reward.health} risk={reward.risk} />
      <DrawerSection title="Mapping">
        <Facts rows={[
          { k: 'Brand', v: reward.brand, mono: true },
          { k: 'Type', v: KIND_LABEL[reward.kind] },
          { k: 'Fulfillment route', v: FULFILLMENT_LABEL[reward.fulfillment] },
          { k: 'Provider', v: reward.provider },
          { k: 'Bonus GUID', v: reward.bonusGuid ?? 'Not required', mono: Boolean(reward.bonusGuid) },
          { k: 'Owner', v: reward.owner },
        ]} />
      </DrawerSection>
      <DrawerSection title="Provider test">
        <ProviderTest reward={reward} />
      </DrawerSection>
      <DrawerSection title="Liability">
        <div className="grid grid-cols-3 gap-2">
          <Metric label="Pending" value={`€${reward.pendingLiability.toLocaleString()}`} tone={reward.risk === 'blocked' ? 'danger' : reward.risk === 'warning' ? 'warning' : 'default'} />
          <Metric label="Daily cap" value={`€${reward.dailyCap.toLocaleString()}`} />
          <Metric label="Brand cap used" value={`${used}%`} tone={used > 90 ? 'danger' : used > 70 ? 'warning' : 'default'} />
        </div>
      </DrawerSection>
      <DrawerSection title="Affected objects">
        <div className="flex flex-col gap-2">
          <AffectedRow label="Campaign usage" value={reward.campaignUse} />
          {grants.length ? grants.map((g) => <AffectedRow key={g.id} label={`${g.id} · ${g.playerId}`} value={`${g.status} · €${g.amount.toLocaleString()} · ${g.reason}`} />) : <AffectedRow label="Manual grants" value="No active manual grants for this reward." />}
        </div>
      </DrawerSection>
      <DrawerSection title="Risk gates">
        <div className="flex flex-col gap-2">{gates.map((g) => <GateRow key={g.id} gate={g} />)}</div>
      </DrawerSection>
      <DrawerSection title="Audit trail">
        <MiniAudit rows={audit.length ? audit : REWARD_AUDIT.slice(0, 2)} />
      </DrawerSection>
    </div>
  );
}

function GrantFulfillmentBody({ grant, reward }: { grant: ManualGrant; reward?: RewardItem }) {
  return (
    <div className="flex flex-col gap-5">
      <FulfillmentDecision health={reward?.health ?? 'warning'} risk={grant.risk} grantStatus={grant.status} />
      <DrawerSection title="Grant request">
        <Facts rows={[
          { k: 'Player', v: grant.playerId, mono: true },
          { k: 'Brand', v: grant.brand, mono: true },
          { k: 'Status', v: grant.status },
          { k: 'Risk', v: grant.risk },
          { k: 'Requester', v: grant.requester },
          { k: 'Amount', v: `€${grant.amount.toLocaleString()}` },
          { k: 'Reason', v: grant.reason },
          { k: 'Created', v: grant.createdAt },
        ]} />
      </DrawerSection>
      {reward && (
        <>
          <DrawerSection title="Fulfillment route">
            <Facts rows={[
              { k: 'Reward ID', v: reward.id, mono: true },
              { k: 'Route', v: FULFILLMENT_LABEL[reward.fulfillment] },
              { k: 'Provider', v: reward.provider },
              { k: 'Bonus GUID', v: reward.bonusGuid ?? 'Not required', mono: Boolean(reward.bonusGuid) },
            ]} />
          </DrawerSection>
          <DrawerSection title="Provider test">
            <ProviderTest reward={reward} grant={grant} />
          </DrawerSection>
        </>
      )}
      <DrawerSection title="Recovery path">
        <div className="grid gap-2">
          <AffectedRow label="Retry" value={grant.status === 'failed' || grant.status === 'retrying' ? 'Available with current mapping and audit note.' : 'Not needed while grant is approved/pending.'} />
          <AffectedRow label="Escalation" value={grant.risk === 'blocked' ? 'Route to Risk + Technical Admin before payout.' : 'Reviewer can approve or reject from manual grant queue.'} />
          <AffectedRow label="Ledger impact" value="Outcome writes to player ledger, reward audit and liability totals." />
        </div>
      </DrawerSection>
      <DrawerSection title="Audit trail">
        <MiniAudit rows={REWARD_AUDIT.filter((a) => a.target === grant.id || a.target === grant.rewardId)} />
      </DrawerSection>
    </div>
  );
}

function FulfillmentDecision({ health, risk, grantStatus }: { health: FulfillmentStatus; risk: GateStatus; grantStatus?: GrantStatus }) {
  const blocked = health === 'failing' || risk === 'blocked' || grantStatus === 'failed';
  const warning = !blocked && (health === 'warning' || risk === 'warning' || grantStatus === 'pending' || grantStatus === 'retrying');
  const status: GateStatus = blocked ? 'blocked' : warning ? 'warning' : 'clear';
  return (
    <section className="rounded-lg border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Fulfillment decision</div>
          <div className="mt-1 text-[16px] font-semibold text-fg-primary">{blocked ? 'Recovery required' : warning ? 'Can proceed with review' : 'Ready to fulfill'}</div>
          <p className="mt-1 text-[12px] leading-relaxed text-fg-secondary">
            {blocked ? 'Provider, cap or risk state blocks direct payout. Retry or escalation is required.' : warning ? 'Mapping works, but reviewer context should be checked before payout.' : 'Mapping, provider and risk gates are clear for fulfilment.'}
          </p>
        </div>
        <GatePill status={status} />
      </div>
    </section>
  );
}

function ProviderTest({ reward, grant }: { reward: RewardItem; grant?: ManualGrant }) {
  const failing = reward.health === 'failing';
  const warning = reward.health === 'warning' || grant?.status === 'retrying';
  const code = failing ? '401 AUTH_FAILED' : warning ? '202 ACCEPTED_WITH_WARNINGS' : '200 OK';
  const latency = failing ? 'timeout' : warning ? '680ms' : '240ms';
  const message = failing
    ? 'Provider rejected the fulfilment call. Check API key scope and wallet endpoint auth.'
    : warning
      ? 'Provider accepted the request, but mapping or currency should be confirmed.'
      : 'Provider confirmed reward creation and returned a fulfilment reference.';
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[12px] font-semibold text-fg-primary">{code}</div>
          <div className="mt-0.5 text-[11.5px] text-fg-muted">{reward.provider} · {latency}</div>
        </div>
        <HealthPill status={reward.health} />
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-fg-secondary">{message}</p>
      <div className="mt-3 rounded-md px-3 py-2 font-mono text-[11px] leading-relaxed" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>
        {`POST /rewards/${reward.fulfillment}/grant`}<br />
        {`rewardId=${reward.id} ${grant ? `grantId=${grant.id}` : `brand=${reward.brand}`}`}
      </div>
    </div>
  );
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><div className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">{title}</div>{children}</section>;
}

function AffectedRow({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div className="text-[12.5px] font-medium text-fg-primary">{label}</div><div className="mt-0.5 text-[11.5px] leading-relaxed text-fg-secondary">{value}</div></div>;
}

function GateRow({ gate }: { gate: RiskGate }) {
  return <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div className="flex items-start justify-between gap-3"><div><div className="text-[12.5px] font-medium text-fg-primary">{gate.label}</div><div className="mt-0.5 text-[11.5px] text-fg-secondary">{gate.impact}</div></div><GatePill status={gate.status} /></div></div>;
}

function MiniAudit({ rows }: { rows: RewardAudit[] }) {
  if (!rows.length) return <AffectedRow label="No recent audit records" value="The next action will create the first visible record for this item." />;
  return <div className="flex flex-col gap-2">{rows.map((a) => <div key={a.id} className="rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div className="text-[12.5px] font-medium text-fg-primary">{a.action}</div><div className="mt-0.5 text-[11.5px] text-fg-muted">{a.actor} · {a.at}</div><div className="mt-1 text-[11.5px] leading-relaxed text-fg-secondary">{a.note}</div></div>)}</div>;
}

function statusOptions(tab: TabId) {
  if (tab === 'grants') return ['pending', 'approved', 'retrying', 'failed'].map((s) => ({ v: s, l: s }));
  return (Object.keys(STATUS_META) as RewardStatus[]).map((s) => ({ v: s, l: STATUS_META[s].label }));
}

const rewardDetail = (r: RewardItem): Detail => ({
  title: r.name,
  subtitle: r.id,
  body: <RewardFulfillmentBody reward={r} />,
  actions: [{ icon: Refresh2, label: r.health === 'failing' ? 'Retry provider' : 'Test fulfillment' }, { icon: ShieldTick, label: 'Run gates' }, { icon: Copy, label: 'Copy ID' }],
});
const grantDetail = (g: ManualGrant): Detail => {
  const reward = REWARDS.find((r) => r.id === g.rewardId);
  return {
    title: g.rewardName,
    subtitle: g.id,
    body: <GrantFulfillmentBody grant={g} reward={reward} />,
    actions: [{ icon: Refresh2, label: g.status === 'retrying' || g.status === 'failed' ? 'Retry grant' : 'Test route' }, { icon: ShieldTick, label: 'Approve' }, { icon: Warning2, label: 'Reject' }],
  };
};
const gateDetail = (g: RiskGate): Detail => ({ title: g.label, subtitle: g.id, body: <Facts rows={[{ k: 'Scope', v: g.scope }, { k: 'Status', v: g.status }, { k: 'Owner', v: g.owner }, { k: 'Impact', v: g.impact }]} /> });
const auditDetail = (a: RewardAudit): Detail => ({ title: a.action, subtitle: a.id, body: <Facts rows={[{ k: 'Actor', v: a.actor }, { k: 'Target', v: a.target, mono: true }, { k: 'At', v: a.at }, { k: 'Note', v: a.note }]} /> });
const liabilityDetail = (brand: string): Detail => ({ title: `Liability · ${brand}`, subtitle: brand, body: <Facts rows={LIABILITY.filter((l) => l.brand === brand).flatMap((l) => [{ k: 'Issued value', v: `€${l.issuedValue.toLocaleString()}` }, { k: 'Pending value', v: `€${l.pendingValue.toLocaleString()}` }, { k: 'Expired value', v: `€${l.expiredValue.toLocaleString()}` }, { k: 'Cap', v: `€${l.cap.toLocaleString()}` }, { k: 'Health', v: l.health }])} /> });
