import { useMemo, useState } from 'react';
import {
  AlertTriangle, Building2, Check, ChevronDown, Copy, Eye, Globe2, KeyRound,
  Lock, Search, Settings2, ShieldCheck, UserPlus, Users, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ActionModal from '../components/ActionModal';
import type { ActionModalState } from '../components/ActionModal';
import {
  HEALTH_META, ORG_AUDIT, ORG_BRANDS, ORG_USERS, PERMISSIONS, RESTRICTIONS, orgKpis,
} from '../data/org';
import type { BrandHealth, OrgAudit, OrgBrand, OrgUser, Restriction } from '../data/org';

type TabId = 'overview' | 'brands' | 'users' | 'permissions' | 'restrictions' | 'audit';
type Detail = { title: string; subtitle: string; body: React.ReactNode } | null;
interface Filters { brand: string; role: string; health: string; q: string }
const EMPTY: Filters = { brand: '', role: '', health: '', q: '' };

export default function BrandsOrg() {
  const [tab, setTab] = useState<TabId>('overview');
  const [f, setF] = useState<Filters>(EMPTY);
  const [detail, setDetail] = useState<Detail>(null);
  const [action, setAction] = useState<ActionModalState | null>(null);
  const kpis = useMemo(() => orgKpis(), []);
  const set = (patch: Partial<Filters>) => setF((p) => ({ ...p, ...patch }));

  const brands = ORG_BRANDS.filter((b) => {
    if (f.brand && b.code !== f.brand) return false;
    if (f.health && b.health !== f.health) return false;
    if (f.q && !`${b.code} ${b.name} ${b.jurisdiction} ${b.owner}`.toLowerCase().includes(f.q.toLowerCase())) return false;
    return true;
  });
  const users = ORG_USERS.filter((u) => {
    if (f.brand && !u.brands.includes(f.brand) && !u.brands.includes('All brands')) return false;
    if (f.role && u.role !== f.role) return false;
    if (f.q && !`${u.name} ${u.email} ${u.role}`.toLowerCase().includes(f.q.toLowerCase())) return false;
    return true;
  });
  const restrictions = RESTRICTIONS.filter((r) => {
    if (f.brand && r.brand !== f.brand) return false;
    if (f.health && r.severity !== f.health) return false;
    if (f.q && !`${r.kind} ${r.value} ${r.note}`.toLowerCase().includes(f.q.toLowerCase())) return false;
    return true;
  });

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'brands', label: 'Brands', count: ORG_BRANDS.length },
    { id: 'users', label: 'Users & roles', count: ORG_USERS.length },
    { id: 'permissions', label: 'Permission matrix' },
    { id: 'restrictions', label: 'Brand restrictions', count: RESTRICTIONS.filter((r) => r.severity !== 'ready').length },
    { id: 'audit', label: 'Audit log' },
  ];

  return (
    <div className="mx-auto w-full max-w-[1360px] px-8 py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[19px] font-semibold tracking-tight">Brands &amp; Org</h1>
            <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ color: 'var(--accent)', background: 'var(--accent-bg)' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} /> NovaBet Group
            </span>
          </div>
          <p className="mt-1 text-[13px] text-fg-secondary">Manage brand scope, users, permissions, jurisdiction limits and org-level controls for the MonoPulse back office.</p>
        </div>
        <button onClick={() => setAction({ kind: 'inviteUser', context: 'NovaBet Group · org-level invite' })} className="flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
          <UserPlus size={15} strokeWidth={2.25} /> Invite user
        </button>
      </div>

      <div className="mt-5 grid grid-cols-5 gap-3">
        <Kpi icon={Building2} label="Brands" value={String(kpis.brands)} />
        <Kpi icon={Globe2} label="Production brands" value={String(kpis.activeBrands)} />
        <Kpi icon={Users} label="Users" value={String(kpis.users)} />
        <Kpi icon={UserPlus} label="Pending invites" value={String(kpis.pendingInvites)} accent="var(--warning)" />
        <Kpi icon={Lock} label="Blocked rules" value={String(kpis.blockedRules)} accent="var(--danger)" />
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

      {tab !== 'overview' && tab !== 'permissions' && tab !== 'audit' && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <FilterSelect label="Brand" value={f.brand} onChange={(v) => set({ brand: v })} options={ORG_BRANDS.map((b) => ({ v: b.code, l: `${b.code} · ${b.name}` }))} />
          {tab === 'users' && <FilterSelect label="Role" value={f.role} onChange={(v) => set({ role: v })} options={Array.from(new Set(ORG_USERS.map((u) => u.role))).map((r) => ({ v: r, l: r }))} />}
          {tab !== 'users' && <FilterSelect label="Health" value={f.health} onChange={(v) => set({ health: v })} options={['ready', 'warning', 'blocked'].map((h) => ({ v: h, l: h }))} />}
          <div className="ml-auto flex items-center gap-2 rounded-md border px-3 py-2" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
            <Search size={14} className="text-fg-muted" strokeWidth={1.75} />
            <input value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Search…" className="w-52 bg-transparent text-[13px] outline-none" />
          </div>
          {Object.values(f).some(Boolean) && <button onClick={() => setF(EMPTY)} className="text-[12px] font-medium" style={{ color: 'var(--accent)' }}>Clear</button>}
        </div>
      )}

      <div className="mt-4">
        {tab === 'overview' && <Overview setTab={setTab} setDetail={setDetail} />}
        {tab === 'brands' && <BrandTable rows={brands} onOpen={(b) => setDetail(brandDetail(b))} />}
        {tab === 'users' && <UserTable rows={users} onOpen={(u) => setDetail(userDetail(u))} />}
        {tab === 'permissions' && <PermissionMatrix />}
        {tab === 'restrictions' && <RestrictionTable rows={restrictions} onOpen={(r) => setDetail(restrictionDetail(r))} />}
        {tab === 'audit' && <AuditLog rows={ORG_AUDIT} onOpen={(a) => setDetail(auditDetail(a))} />}
      </div>

      <DetailDrawer detail={detail} onClose={() => setDetail(null)} />
      <ActionModal state={action} onClose={() => setAction(null)} />
    </div>
  );
}

function Overview({ setTab, setDetail }: { setTab: (t: TabId) => void; setDetail: (d: Detail) => void }) {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-4 gap-3">
        <RailAction icon={Users} label="Manage users" value={`${ORG_USERS.length} users`} onClick={() => setTab('users')} />
        <RailAction icon={ShieldCheck} label="Permission matrix" value={`${PERMISSIONS.length} actions`} onClick={() => setTab('permissions')} />
        <RailAction icon={AlertTriangle} label="Restrictions" value={`${RESTRICTIONS.filter((r) => r.severity !== 'ready').length} active`} onClick={() => setTab('restrictions')} />
        <RailAction icon={Settings2} label="Org audit" value={`${ORG_AUDIT.length} records`} onClick={() => setTab('audit')} />
      </div>
      <section className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="border-b px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-[14px] font-semibold text-fg-primary">Brand readiness</h2>
          <p className="mt-0.5 text-[12.5px] text-fg-secondary">Production, jurisdiction, integration and reward-readiness by brand.</p>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[780px] divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="grid grid-cols-[80px_minmax(280px,1fr)_140px_140px_40px] items-center gap-3 px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-2)' }}>
              <span>Code</span>
              <span>Brand</span>
              <span>Environment</span>
              <span>Readiness</span>
              <span />
            </div>
            {ORG_BRANDS.map((b) => (
              <button key={b.code} onClick={() => setDetail(brandDetail(b))} className="grid w-full grid-cols-[80px_minmax(280px,1fr)_140px_140px_40px] items-center gap-3 px-5 py-3 text-left hover:bg-[var(--surface-2)]">
                <span className="font-mono text-[12px] text-fg-secondary">{b.code}</span>
                <div className="min-w-0"><div className="truncate text-[13px] font-medium text-fg-primary">{b.name}</div><div className="truncate text-[11.5px] text-fg-muted">{b.jurisdiction} · {b.currency} · {b.timezone}</div></div>
                <span className="text-[12px] text-fg-secondary">{b.environment}</span>
                <HealthPill status={b.health} />
                <Eye size={14} className="text-fg-muted" strokeWidth={2} />
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function BrandTable({ rows, onOpen }: { rows: OrgBrand[]; onOpen: (b: OrgBrand) => void }) {
  return <Table cols={['Brand', 'Jurisdiction', 'Env', 'Campaigns', 'Loyalty', 'Integration', 'Owner', 'Limit']}>{rows.map((b) => (
    <tr key={b.code} onClick={() => onOpen(b)} className="cursor-pointer border-t transition-colors hover:bg-[var(--surface-3)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <Td><div className="font-medium text-fg-primary">{b.name}</div><div className="font-mono text-[11px] text-fg-muted">{b.code}</div></Td>
      <Td>{b.jurisdiction}</Td><Td>{b.environment}</Td><Td right>{b.activeCampaigns}</Td><Td>{b.loyaltyProgram}</Td><Td><HealthPill status={b.integrationHealth} /></Td><Td>{b.owner}</Td><Td right>€{b.rewardLimit.toLocaleString()}</Td>
    </tr>
  ))}</Table>;
}

function UserTable({ rows, onOpen }: { rows: OrgUser[]; onOpen: (u: OrgUser) => void }) {
  return <Table cols={['User', 'Role', 'Brands', 'Status', 'Last seen']}>{rows.map((u) => (
    <tr key={u.id} onClick={() => onOpen(u)} className="cursor-pointer border-t transition-colors hover:bg-[var(--surface-3)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <Td><div className="font-medium text-fg-primary">{u.name}</div><div className="text-[11.5px] text-fg-muted">{u.email}</div></Td>
      <Td>{u.role}</Td><Td>{u.brands.join(' · ')}</Td><Td><Status status={u.status} /></Td><Td>{u.lastSeen}</Td>
    </tr>
  ))}</Table>;
}

function PermissionMatrix() {
  const roles = ['orgAdmin', 'brandAdmin', 'crm', 'casino', 'risk', 'tech'] as const;
  const labels = ['Org Admin', 'Brand Admin', 'CRM', 'Casino', 'Risk', 'Tech'];
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
      <table className="min-w-[860px] w-full border-collapse text-left">
        <thead><tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-1)' }}><th className="px-4 py-2.5">Action</th>{labels.map((l) => <th key={l} className="px-4 py-2.5 text-center">{l}</th>)}</tr></thead>
        <tbody>{PERMISSIONS.map((p) => <tr key={p.action} className="border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><Td>{p.action}</Td>{roles.map((r) => <td key={r} className="px-4 py-3 text-center">{p[r] ? <Check size={15} className="mx-auto" style={{ color: 'var(--success)' }} strokeWidth={3} /> : <X size={15} className="mx-auto text-fg-muted" strokeWidth={2} />}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function RestrictionTable({ rows, onOpen }: { rows: Restriction[]; onOpen: (r: Restriction) => void }) {
  return <Table cols={['Brand', 'Kind', 'Restriction', 'Severity', 'Note']}>{rows.map((r) => (
    <tr key={r.id} onClick={() => onOpen(r)} className="cursor-pointer border-t transition-colors hover:bg-[var(--surface-3)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <Td mono>{r.brand}</Td><Td>{r.kind}</Td><Td>{r.value}</Td><Td><HealthPill status={r.severity} /></Td><Td>{r.note}</Td>
    </tr>
  ))}</Table>;
}

function AuditLog({ rows, onOpen }: { rows: OrgAudit[]; onOpen: (a: OrgAudit) => void }) {
  return <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>{rows.map((a) => <button key={a.id} onClick={() => onOpen(a)} className="flex w-full items-start gap-3 border-b px-5 py-3 text-left last:border-0 hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border-subtle)' }}><span className="mt-1 h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }} /><div><div className="text-[13px] font-medium text-fg-primary">{a.action} · {a.target}</div><div className="mt-0.5 text-[11.5px] text-fg-muted">{a.actor} · {a.at}</div><div className="mt-1 text-[12px] text-fg-secondary">{a.note}</div></div></button>)}</section>;
}

function Kpi({ icon: Icon, label, value, accent = 'var(--accent)' }: { icon: LucideIcon; label: string; value: string; accent?: string }) {
  return <div className="rounded-xl border px-4 py-3.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}><div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><span className="flex h-5 w-5 items-center justify-center rounded" style={{ background: 'var(--surface-3)', color: accent }}><Icon size={12} strokeWidth={2.25} /></span>{label}</div><div className="mt-1.5 font-mono text-[22px] font-semibold leading-none tabular-nums text-fg-primary">{value}</div></div>;
}

function RailAction({ icon: Icon, label, value, onClick }: { icon: LucideIcon; label: string; value: string; onClick: () => void }) {
  return <button onClick={onClick} className="rounded-xl border p-4 text-left hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}><div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><Icon size={13} strokeWidth={2} /> {label}</div><div className="mt-2 text-[16px] font-semibold text-fg-primary">{value}</div></button>;
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  const active = value !== '';
  return <div className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} className="cursor-pointer appearance-none rounded-md border py-2 pl-3 pr-8 text-[12.5px] font-medium outline-none" style={{ borderColor: active ? 'var(--accent-border)' : 'var(--border-strong)', background: active ? 'var(--accent-bg)' : 'var(--surface-2)', color: active ? 'var(--fg-primary)' : 'var(--fg-secondary)' }}><option value="">{label}: All</option>{options.map((o) => <option key={o.v} value={o.v}>{label}: {o.l}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-muted" strokeWidth={2} /></div>;
}

function Table({ cols, children }: { cols: string[]; children: React.ReactNode }) {
  return <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}><table className="min-w-[920px] w-full border-collapse text-left"><thead><tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-1)' }}>{cols.map((c) => <th key={c} className="whitespace-nowrap px-4 py-2.5 font-semibold">{c}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function Td({ children, mono, right }: { children: React.ReactNode; mono?: boolean; right?: boolean }) {
  return <td className={`px-4 py-3 text-[12.5px] ${mono ? 'font-mono' : ''} ${right ? 'text-right font-mono tabular-nums' : ''}`} style={{ color: 'var(--fg-secondary)' }}>{children}</td>;
}

function HealthPill({ status }: { status: BrandHealth }) {
  const m = HEALTH_META[status];
  return <span className="inline-flex w-fit justify-self-start items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium leading-none" style={{ color: m.fg, background: m.bg }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: m.fg }} /> {m.label}</span>;
}

function Status({ status }: { status: OrgUser['status'] }) {
  const meta = status === 'active' ? { fg: 'var(--success)', bg: 'var(--status-live-bg)' } : status === 'pending' ? { fg: 'var(--warning)', bg: 'var(--warning-bg)' } : { fg: 'var(--danger)', bg: 'var(--danger-bg)' };
  return <span className="inline-flex w-fit justify-self-start rounded-md px-2 py-0.5 text-[11px] font-medium capitalize" style={meta}>{status}</span>;
}

function DetailDrawer({ detail, onClose }: { detail: Detail; onClose: () => void }) {
  if (!detail) return null;
  return <div className="fixed inset-0 z-50 flex justify-end"><div className="absolute inset-0" style={{ background: 'var(--overlay-scrim)' }} onClick={onClose} /><div className="relative flex h-full w-[470px] flex-col border-l" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-lg)' }}><div className="flex items-start justify-between gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}><div className="min-w-0"><div className="text-[15px] font-semibold text-fg-primary">{detail.title}</div><div className="mt-0.5 truncate font-mono text-[11.5px] text-fg-muted">{detail.subtitle}</div></div><button onClick={onClose} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-fg-muted" style={{ background: 'var(--surface-2)' }}><X size={15} strokeWidth={2} /></button></div><div className="flex-1 overflow-y-auto px-5 py-4">{detail.body}</div><div className="border-t px-5 py-3.5" style={{ borderColor: 'var(--border-subtle)' }}><div className="flex flex-wrap gap-2"><Action icon={Eye} label="View" /><Action icon={Copy} label="Copy ID" /><Action icon={KeyRound} label="Permissions" /></div></div></div></div>;
}

function Action({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return <button className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[12.5px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)', border: '1px solid var(--border-strong)' }}><Icon size={13} strokeWidth={2.25} /> {label}</button>;
}

function Facts({ rows }: { rows: { k: string; v: string; mono?: boolean }[] }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-3">{rows.map((r) => <div key={r.k}><div className="text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">{r.k}</div><div className={`mt-0.5 text-[12.5px] font-medium text-fg-primary ${r.mono ? 'font-mono' : ''}`}>{r.v}</div></div>)}</div>;
}

const brandDetail = (b: OrgBrand): Detail => ({ title: b.name, subtitle: b.code, body: <div className="flex flex-col gap-5"><Facts rows={[{ k: 'Jurisdiction', v: b.jurisdiction }, { k: 'Currency', v: b.currency }, { k: 'Timezone', v: b.timezone }, { k: 'Environment', v: b.environment }, { k: 'Owner', v: b.owner }, { k: 'Reward limit', v: `€${b.rewardLimit.toLocaleString()}` }]} /><div><div className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">Enabled modules</div><div className="flex flex-wrap gap-1.5">{b.enabledModules.map((m) => <span key={m} className="rounded px-2 py-1 text-[11.5px] font-medium" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{m}</span>)}</div></div></div> });
const userDetail = (u: OrgUser): Detail => ({ title: u.name, subtitle: u.email, body: <Facts rows={[{ k: 'Role', v: u.role }, { k: 'Brands', v: u.brands.join(', ') }, { k: 'Status', v: u.status }, { k: 'Last seen', v: u.lastSeen }, { k: 'User ID', v: u.id, mono: true }]} /> });
const restrictionDetail = (r: Restriction): Detail => ({ title: r.value, subtitle: `${r.brand} · ${r.kind}`, body: <Facts rows={[{ k: 'Brand', v: r.brand, mono: true }, { k: 'Kind', v: r.kind }, { k: 'Severity', v: r.severity }, { k: 'Note', v: r.note }]} /> });
const auditDetail = (a: OrgAudit): Detail => ({ title: a.action, subtitle: a.id, body: <Facts rows={[{ k: 'Actor', v: a.actor }, { k: 'Target', v: a.target }, { k: 'At', v: a.at }, { k: 'Note', v: a.note }]} /> });
