import { useState } from 'react';
import {
  Building2,
  KeyRound,
  LockKeyhole,
  Plus,
  Search,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react';
import ActionModal from '../components/ActionModal';
import type { ActionModalState } from '../components/ActionModal';

type TabId = 'users' | 'roles' | 'approval' | 'audit' | 'environment';

const USERS = [
  { name: 'Mara Ostheim', role: 'CRM / Retention Manager', brands: ['ACR', 'SPC'], status: 'Active', last: '12m ago' },
  { name: 'Dan Whitlock', role: 'Casino Manager', brands: ['ACR', 'BNV', 'VGV'], status: 'Active', last: '20m ago' },
  { name: 'Priya Nair', role: 'Reward Operations', brands: ['VGV', 'GLR'], status: 'Active', last: '1h ago' },
  { name: 'Ravi Menon', role: 'Risk & Compliance', brands: ['All brands'], status: 'Active', last: '8m ago' },
  { name: 'Java Backend Team', role: 'Technical Admin', brands: ['Sandbox', 'Production'], status: 'Limited', last: '44m ago' },
];

const ROLES = [
  { name: 'CRM / Retention Manager', scope: 'Create campaigns, segments and loyalty drafts', approvals: 'Submit only', users: 2 },
  { name: 'Casino Manager', scope: 'Campaign mechanics, provider/game mapping, live ops', approvals: 'Approve campaign mechanics', users: 2 },
  { name: 'Risk & Compliance', scope: 'RG, fraud, jurisdiction, exclusions, high-value payout', approvals: 'Block / approve launch', users: 3 },
  { name: 'Technical Admin', scope: 'API keys, webhooks, providers, event replay', approvals: 'No commercial approval', users: 1 },
  { name: 'Owner / Super Admin', scope: 'Org, brand, role, license and audit settings', approvals: 'Override with audit', users: 1 },
];

const APPROVALS = [
  { trigger: 'Campaign launch', rule: 'Risk + Casino sign-off when randomized or pooled', status: 'Enabled' },
  { trigger: 'Reward over €500', rule: 'Dual approval from Reward Ops + Risk', status: 'Enabled' },
  { trigger: 'New brand production activation', rule: 'Technical certification + Owner approval', status: 'Enabled' },
  { trigger: 'Emergency pause override', rule: 'Immediate action, reason required, audit notification', status: 'Enabled' },
];

const AUDIT = [
  { item: 'Retention manager approved segment change', actor: 'Mara Ostheim', at: '12:42', target: 'seg-high-value-active' },
  { item: 'Technical admin retried failed webhook', actor: 'Java Backend Team', at: '12:31', target: 'wh-003' },
  { item: 'Risk held high-value reward', actor: 'Ravi Menon', at: '12:19', target: 'rw-5521' },
  { item: 'Owner updated brand restriction', actor: 'Owner', at: '11:55', target: 'BNV production' },
];

export default function Settings() {
  const [tab, setTab] = useState<TabId>('users');
  const [action, setAction] = useState<ActionModalState | null>(null);
  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'users', label: 'Users', count: USERS.length },
    { id: 'roles', label: 'Roles & permissions', count: ROLES.length },
    { id: 'approval', label: 'Approval rules', count: APPROVALS.length },
    { id: 'audit', label: 'Audit retention' },
    { id: 'environment', label: 'Environment controls' },
  ];

  return (
    <div className="mx-auto w-full max-w-[1360px] px-8 py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[19px] font-semibold tracking-tight">Settings</h1>
            <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ color: 'var(--success)', background: 'var(--status-live-bg)' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--success)' }} /> Governance ready
            </span>
          </div>
          <p className="mt-1 text-[13px] text-fg-secondary">Org-level access, approval authority, audit visibility and production safety controls.</p>
        </div>
        <button onClick={() => setAction({ kind: 'inviteUser', context: 'Settings · roles and permissions' })} className="flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}><Plus size={15} /> Invite user</button>
      </div>

      <div className="mt-5 grid grid-cols-5 gap-3">
        <Kpi icon={Users} label="Users" value="6" />
        <Kpi icon={UserCog} label="Roles" value="5" />
        <Kpi icon={ShieldCheck} label="Approval rules" value="4" />
        <Kpi icon={Building2} label="Brand scopes" value="6" />
        <Kpi icon={KeyRound} label="API admins" value="1" />
      </div>

      <div className="mt-6 flex items-center gap-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        {tabs.map((t) => {
          const on = tab === t.id;
          return <button key={t.id} onClick={() => setTab(t.id)} className="relative flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium" style={{ color: on ? 'var(--fg-primary)' : 'var(--fg-secondary)' }}>{t.label}{t.count ? <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold" style={on ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { background: 'var(--surface-3)', color: 'var(--fg-muted)' }}>{t.count}</span> : null}{on && <span className="absolute inset-x-0 -bottom-px h-0.5" style={{ background: 'var(--accent)' }} />}</button>;
        })}
      </div>

      <div className="mt-4">
        {tab === 'users' && <UsersTable />}
        {tab === 'roles' && <RolesTable />}
        {tab === 'approval' && <ApprovalRules />}
        {tab === 'audit' && <AuditSettings />}
        {tab === 'environment' && <EnvironmentControls />}
      </div>
      <ActionModal state={action} onClose={() => setAction(null)} />
    </div>
  );
}

function UsersTable() {
  return <Panel title="User access" action={<SearchBox />}><Table cols={['User', 'Role', 'Brand access', 'Status', 'Last active']}>{USERS.map((u) => <tr key={u.name} className="border-t hover:bg-[var(--surface-3)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><Td><div className="font-medium text-fg-primary">{u.name}</div></Td><Td>{u.role}</Td><Td>{u.brands.join(' · ')}</Td><Td><Pill label={u.status} ok={u.status === 'Active'} /></Td><Td>{u.last}</Td></tr>)}</Table></Panel>;
}

function RolesTable() {
  return <Panel title="Permission model"><Table cols={['Role', 'Allowed scope', 'Approval authority', 'Users']}>{ROLES.map((r) => <tr key={r.name} className="border-t hover:bg-[var(--surface-3)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><Td><div className="font-medium text-fg-primary">{r.name}</div></Td><Td>{r.scope}</Td><Td>{r.approvals}</Td><Td mono>{r.users}</Td></tr>)}</Table></Panel>;
}

function ApprovalRules() {
  return <Panel title="Approval gates"><div className="grid gap-3">{APPROVALS.map((a) => <div key={a.trigger} className="flex items-center justify-between gap-4 rounded-lg border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div><div className="text-[13px] font-semibold text-fg-primary">{a.trigger}</div><div className="mt-1 text-[12.5px] text-fg-secondary">{a.rule}</div></div><Pill label={a.status} ok /></div>)}</div></Panel>;
}

function AuditSettings() {
  return <div className="grid grid-cols-[1fr_320px] gap-4"><Panel title="Recent audit events"><div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>{AUDIT.map((a) => <div key={a.target} className="flex items-center justify-between gap-4 py-3"><div><div className="text-[13px] font-medium text-fg-primary">{a.item}</div><div className="mt-0.5 text-[11.5px] text-fg-muted">{a.actor} · {a.target}</div></div><span className="font-mono text-[12px] text-fg-muted">{a.at}</span></div>)}</div></Panel><Panel title="Retention policy"><div className="flex flex-col gap-2 text-[12.5px] text-fg-secondary"><Control label="Audit log retention" value="7 years" /><Control label="Decision evidence" value="Immutable" /><Control label="Export" value="CSV / API" /><Control label="PII masking" value="Role based" /></div></Panel></div>;
}

function EnvironmentControls() {
  return <div className="grid grid-cols-2 gap-4">{['Sandbox certification required', 'Production API key rotation', 'Emergency pause requires reason', 'Webhook replay has approval trail'].map((item) => <div key={item} className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}><div className="flex items-center gap-2 text-[13px] font-semibold text-fg-primary"><LockKeyhole size={15} style={{ color: 'var(--accent)' }} /> {item}</div><div className="mt-3 flex items-center justify-between"><span className="text-[12.5px] text-fg-secondary">Enabled across production brands</span><Pill label="On" ok /></div></div>)}</div>;
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}><div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}><h2 className="text-[14px] font-semibold text-fg-primary">{title}</h2>{action}</div><div className="p-5">{children}</div></section>;
}

function Table({ cols, children }: { cols: string[]; children: React.ReactNode }) {
  return <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}><table className="min-w-[860px] w-full border-collapse text-left"><thead><tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-1)' }}>{cols.map((c) => <th key={c} className="px-4 py-2.5 font-semibold">{c}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return <td className={`px-4 py-3 text-[12.5px] ${mono ? 'font-mono' : ''}`} style={{ color: 'var(--fg-secondary)' }}>{children}</td>;
}

function Kpi({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return <div className="rounded-xl border px-4 py-3.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}><div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><Icon size={13} style={{ color: 'var(--accent)' }} /> {label}</div><div className="mt-1.5 font-mono text-[22px] font-semibold text-fg-primary">{value}</div></div>;
}

function Pill({ label, ok }: { label: string; ok: boolean }) {
  return <span className="inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ color: ok ? 'var(--success)' : 'var(--warning)', background: ok ? 'var(--status-live-bg)' : 'var(--warning-bg)' }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: ok ? 'var(--success)' : 'var(--warning)' }} /> {label}</span>;
}

function SearchBox() {
  return <div className="flex items-center gap-2 rounded-md border px-3 py-2" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}><Search size={14} className="text-fg-muted" /><input placeholder="Search users…" className="w-48 bg-transparent text-[13px] outline-none" /></div>;
}

function Control({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'var(--surface-2)' }}><span>{label}</span><span className="font-medium text-fg-primary">{value}</span></div>;
}
