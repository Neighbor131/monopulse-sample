import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, CircleAlert, Clock, Filter, Search } from 'lucide-react';
import { actionQueue } from '../data/dashboard';
import { PROVIDERS } from '../data/integrations';
import { fmtNum } from '../data/campaigns';

type Severity = 'critical' | 'warning' | 'info';
type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  owner: string;
  severity: Severity;
  status: 'unread' | 'read' | 'resolved';
  at: string;
};

export default function Notifications() {
  const navigate = useNavigate();
  const [severity, setSeverity] = useState<Severity | 'all'>('all');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | NotificationItem['status']>('all');
  const items = useMemo<NotificationItem[]>(() => [
    ...actionQueue().map((item, index) => ({
      id: item.id,
      title: item.title,
      detail: item.detail,
      href: item.href,
      owner: item.owner,
      severity: item.severity === 'critical' ? 'critical' as Severity : 'warning' as Severity,
      status: index % 3 === 0 ? 'read' as const : 'unread' as const,
      at: item.kind === 'approval' ? 'Due now' : 'Live',
    })),
    ...PROVIDERS.filter((provider) => provider.status !== 'healthy').map((provider) => ({
      id: provider.id,
      title: `${provider.provider} ${provider.status}`,
      detail: provider.incident ?? `${provider.kind} integration needs review`,
      href: '/integrations',
      owner: 'Technical Admin',
      severity: provider.status === 'failing' ? 'critical' as Severity : 'warning' as Severity,
      status: 'unread' as const,
      at: provider.lastSync,
    })),
    { id: 'note-cert', title: 'Sandbox certification has pending checks', detail: 'Reward creation and retry behavior still need operator confirmation.', href: '/integrations/setup', owner: 'Backend', severity: 'info', status: 'read', at: '1h ago' },
  ], []);

  const filtered = items.filter((item) => {
    if (severity !== 'all' && item.severity !== severity) return false;
    if (status !== 'all' && item.status !== status) return false;
    if (query && !`${item.title} ${item.detail} ${item.owner}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="mx-auto w-full max-w-[1240px] px-8 py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[19px] font-semibold tracking-tight">Notifications</h1>
          <p className="mt-1 text-[13px] text-fg-secondary">Operational inbox for approvals, reward failures, provider incidents and backend certification work.</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>
          <CheckCheck size={15} /> Mark visible as read
        </button>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3">
        <Kpi label="Total" value={String(items.length)} icon={Bell} />
        <Kpi label="Unread" value={String(items.filter((item) => item.status === 'unread').length)} icon={CircleAlert} accent="var(--warning)" />
        <Kpi label="Critical" value={String(items.filter((item) => item.severity === 'critical').length)} icon={CircleAlert} accent="var(--danger)" />
        <Kpi label="Owners" value={fmtNum(new Set(items.map((item) => item.owner)).size)} icon={Filter} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Segment value={severity} onChange={(value) => setSeverity(value as Severity | 'all')} options={['all', 'critical', 'warning', 'info']} />
        <Segment value={status} onChange={(value) => setStatus(value as NotificationItem['status'] | 'all')} options={['all', 'unread', 'read', 'resolved']} />
        <div className="ml-auto flex items-center gap-2 rounded-md border px-3 py-2" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
          <Search size={14} className="text-fg-muted" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notifications..." className="w-64 bg-transparent text-[13px] outline-none" />
        </div>
      </div>

      <section className="mt-4 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="grid grid-cols-[110px_minmax(0,1fr)_160px_110px_90px] gap-4 border-b px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
          <span>Severity</span><span>Notification</span><span>Owner</span><span>Time</span><span>Status</span>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {filtered.map((item) => (
            <button key={item.id} onClick={() => navigate(item.href)} className="grid w-full grid-cols-[110px_minmax(0,1fr)_160px_110px_90px] items-center gap-4 px-5 py-3 text-left hover:bg-[var(--surface-2)]">
              <Pill label={item.severity} severity={item.severity} />
              <span className="min-w-0"><span className="block truncate text-[13px] font-semibold text-fg-primary">{item.title}</span><span className="mt-0.5 block truncate text-[12px] text-fg-secondary">{item.detail}</span></span>
              <span className="truncate text-[12px] text-fg-secondary">{item.owner}</span>
              <span className="inline-flex items-center gap-1 text-[12px] text-fg-muted"><Clock size={12} />{item.at}</span>
              <span className="text-[12px] capitalize text-fg-secondary">{item.status}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, icon: Icon, accent = 'var(--accent)' }: { label: string; value: string; icon: typeof Bell; accent?: string }) {
  return <div className="rounded-xl border px-4 py-3.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}><div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><Icon size={13} style={{ color: accent }} />{label}</div><div className="mt-1.5 font-mono text-[22px] font-semibold leading-none text-fg-primary">{value}</div></div>;
}

function Segment({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <div className="flex rounded-lg border p-1" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>{options.map((option) => <button key={option} onClick={() => onChange(option)} className="rounded-md px-2.5 py-1.5 text-[12.5px] font-medium capitalize" style={value === option ? { background: 'var(--surface-3)', color: 'var(--fg-primary)' } : { color: 'var(--fg-secondary)' }}>{option}</button>)}</div>;
}

function Pill({ label, severity }: { label: string; severity: Severity }) {
  const color = severity === 'critical' ? 'var(--danger)' : severity === 'warning' ? 'var(--warning)' : 'var(--accent)';
  const bg = severity === 'critical' ? 'var(--danger-bg)' : severity === 'warning' ? 'var(--warning-bg)' : 'var(--accent-bg)';
  return <span className="inline-flex w-fit rounded-md px-2 py-1 text-[11px] font-semibold capitalize" style={{ color, background: bg }}>{label}</span>;
}
