import { useNavigate } from 'react-router-dom';
import {
  Add,
  ArrowRight,
  Chart,
  Data,
  Gift,
  MoneyTick,
  SecuritySafe,
  StatusUp,
  TaskSquare,
  TrendUp,
  Warning2,
} from 'iconsax-react';
import type { Icon } from 'iconsax-react';
import {
  brandMoneyRows,
  moneyActions,
  moneyKpis,
  profitabilityRows,
} from '../data/dashboard';
import type { DashboardSeverity, MoneyKpi, ProfitabilityRow } from '../data/dashboard';
import { DemoStateHint, LoadingBlock, LoadingCards, StateCard, useDemoState } from '../components/StateViews';

const KPI_ICON: Record<string, Icon> = {
  ngr: TrendUp,
  cost: Gift,
  liability: MoneyTick,
  remaining: Data,
  roi: Chart,
  risk: SecuritySafe,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const demoState = useDemoState();
  const kpis = moneyKpis();
  const actions = moneyActions();
  const campaigns = profitabilityRows();
  const brands = brandMoneyRows();
  const moneyAtRisk = kpis.find((kpi) => kpi.id === 'risk');

  return (
    <div className="mx-auto w-full max-w-[1440px] px-8 py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-semibold tracking-tight">Dashboard</h1>
            {moneyAtRisk && <SeverityPill severity={moneyAtRisk.tone === 'danger' ? 'critical' : moneyAtRisk.tone === 'warning' ? 'warning' : 'healthy'} label="Today" />}
          </div>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-fg-secondary">
            Commercial control view for NGR, reward cost, open liability, budget burn and the actions that protect margin today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/ops')} className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)', border: '1px solid var(--border-strong)' }}>
            <TaskSquare size={15} variant="Linear" /> Open ops
          </button>
          <button onClick={() => navigate('/create')} className="flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            <Add size={15} variant="Linear" /> Create campaign
          </button>
        </div>
      </div>

      {demoState === 'error' && (
        <div className="mt-5">
          <StateCard
            state="error"
            title="Money data is delayed"
            detail="Financial dashboard data depends on campaign budgets, reward ledgers, grants, wallet state and liability caps. The shell should explain exactly which source failed."
            onAction={() => navigate('/dashboard')}
          />
          <DemoStateHint area="dashboard states" />
        </div>
      )}

      {demoState === 'loading' && (
        <div className="mt-5 grid gap-5">
          <LoadingCards count={6} />
          <LoadingBlock title="Loading financial exposure" rows={5} />
          <DemoStateHint area="dashboard states" />
        </div>
      )}

      {demoState === 'empty' && (
        <div className="mt-5 grid gap-5">
          <StateCard
            state="empty"
            title="No money exposure needs action"
            detail="No campaigns are over budget, no reward grants are blocked, no liability caps are close to breach and all financial controls are healthy."
            actionLabel="Create campaign"
            onAction={() => navigate('/create')}
          />
          <DemoStateHint area="dashboard states" />
        </div>
      )}

      {demoState ? null : (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            {kpis.map((kpi) => <MoneyKpiCard key={kpi.id} kpi={kpi} onOpen={() => navigate(kpi.href)} />)}
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)]">
            <section className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
              <SectionHeader icon={StatusUp} title="Campaign profitability" desc="Campaigns sorted for commercial review: spend, projected NGR, ROI and financial state." />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] border-collapse text-left">
                  <thead>
                    <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-2)' }}>
                      <th className="px-5 py-2.5">Campaign</th>
                      <th className="px-4 py-2.5">Mechanic</th>
                      <th className="px-4 py-2.5">Brands</th>
                      <th className="px-4 py-2.5 text-right">Budget used</th>
                      <th className="px-4 py-2.5 text-right">Reward cost</th>
                      <th className="px-4 py-2.5 text-right">Projected NGR</th>
                      <th className="px-4 py-2.5 text-right">ROI</th>
                      <th className="px-5 py-2.5">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => <ProfitabilityItem key={campaign.id} campaign={campaign} onOpen={() => navigate(campaign.href)} />)}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
              <SectionHeader icon={Warning2} title="Money-impact actions" desc="Highest-value issues to resolve before they leak margin or block payouts." />
              <div className="grid gap-2 p-4">
                {actions.map((action) => (
                  <button key={action.id} onClick={() => navigate(action.href)} className="rounded-lg border p-3 text-left hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-fg-primary">{action.title}</div>
                        <div className="mt-1 line-clamp-2 text-[11.5px] text-fg-muted">{action.detail}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-mono text-[13px] font-semibold tabular-nums text-fg-primary">{action.amount}</div>
                        <SeverityPill severity={action.severity} />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11.5px] text-fg-secondary">
                      <span>{action.owner}</span>
                      <ArrowRight size={14} variant="Linear" color="var(--fg-muted)" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
              <SectionHeader icon={MoneyTick} title="Brand exposure" desc="Reward issued value, pending liability and cap usage by brand." />
              <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {brands.map((brand) => (
                  <button key={brand.brand} onClick={() => navigate(brand.href)} className="grid w-full grid-cols-[72px_1fr_120px_120px_90px] items-center gap-4 px-5 py-3 text-left hover:bg-[var(--surface-2)]">
                    <span className="font-mono text-[13px] font-semibold text-fg-primary">{brand.brand}</span>
                    <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--surface-3)' }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, brand.capUsed)}%`, background: severityColor(brand.health) }} />
                    </div>
                    <span className="text-right font-mono text-[12.5px] text-fg-secondary">{brand.issued}</span>
                    <span className="text-right font-mono text-[12.5px] text-fg-secondary">{brand.pending}</span>
                    <SeverityPill severity={brand.health} label={`${brand.capUsed}% cap`} />
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
              <SectionHeader icon={Data} title="Finance drill-downs" desc="Useful routes for the product-owner demo." />
              <div className="grid gap-2 p-4">
                {[
                  { label: 'Reward liability', detail: 'Open reward exposure, caps and failed grants', href: '/rewards' },
                  { label: 'Campaign Ops calendar', detail: 'Budget-sensitive launch windows', href: '/ops' },
                  { label: 'Analytics', detail: 'ROI, retention, LTV and reward cost trends', href: '/analytics' },
                  { label: 'Risk & approvals', detail: 'Financial blockers and high-value approvals', href: '/safety' },
                  { label: 'Audit log', detail: 'Who changed money-sensitive settings', href: '/audit' },
                ].map((link) => (
                  <button key={link.label} onClick={() => navigate(link.href)} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
                    <span>
                      <span className="block text-[13px] font-medium text-fg-primary">{link.label}</span>
                      <span className="block text-[11.5px] text-fg-muted">{link.detail}</span>
                    </span>
                    <ArrowRight size={15} variant="Linear" color="var(--fg-muted)" />
                  </button>
                ))}
              </div>
            </section>
          </div>

          <DemoStateHint area="dashboard states" />
        </>
      )}
    </div>
  );
}

function MoneyKpiCard({ kpi, onOpen }: { kpi: MoneyKpi; onOpen: () => void }) {
  const Icon = KPI_ICON[kpi.id] ?? MoneyTick;
  return (
    <button onClick={onOpen} className="min-h-[142px] rounded-xl border px-4 py-3.5 text-left hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">
        <span className="flex h-5 w-5 items-center justify-center rounded" style={{ background: 'var(--surface-3)' }}>
          <Icon size={12} variant="Linear" color={toneColor(kpi.tone)} />
        </span>
        {kpi.label}
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="font-mono text-[22px] font-semibold leading-none tabular-nums text-fg-primary">{kpi.value}</div>
        <Sparkline values={kpi.trend} tone={kpi.tone} />
      </div>
      <div className="mt-1 line-clamp-2 text-[11.5px]" style={{ color: toneColor(kpi.tone) }}>{kpi.detail}</div>
    </button>
  );
}

function Sparkline({ values, tone }: { values: number[]; tone: MoneyKpi['tone'] }) {
  const width = 92;
  const height = 42;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const points = values.map((value, index) => {
    const x = (index / Math.max(1, values.length - 1)) * width;
    const y = height - 5 - ((value - min) / range) * (height - 10);
    return { x, y };
  });
  const line = points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
  const area = `0,${height} ${line} ${width},${height}`;
  const color = toneColor(tone);

  return (
    <svg className="h-[42px] w-[92px] shrink-0" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline points={area} fill={color} opacity="0.12" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2.5" fill={color} />
    </svg>
  );
}

function ProfitabilityItem({ campaign, onOpen }: { campaign: ProfitabilityRow; onOpen: () => void }) {
  return (
    <tr onClick={onOpen} className="cursor-pointer border-t hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border-subtle)' }}>
      <td className="px-5 py-3"><div className="max-w-[190px] text-[13px] font-medium text-fg-primary">{campaign.name}</div><div className="font-mono text-[11px] text-fg-muted">{campaign.id}</div></td>
      <td className="px-4 py-3 text-[12.5px] capitalize text-fg-secondary">{campaign.mechanic}</td>
      <td className="px-4 py-3 text-[12.5px] text-fg-secondary"><span className="line-clamp-2">{campaign.brands}</span></td>
      <td className="px-4 py-3 text-right font-mono text-[12.5px] text-fg-secondary">{campaign.budgetUsed}</td>
      <td className="px-4 py-3 text-right font-mono text-[12.5px] text-fg-secondary">{campaign.rewardCost}</td>
      <td className="px-4 py-3 text-right font-mono text-[12.5px] text-fg-secondary">{campaign.projectedNgr}</td>
      <td className="px-4 py-3 text-right font-mono text-[12.5px] font-semibold text-fg-primary">{campaign.roi}</td>
      <td className="px-5 py-3"><StatusPill status={campaign.status} /></td>
    </tr>
  );
}

function SectionHeader({ icon: Icon, title, desc }: { icon: Icon; title: string; desc: string }) {
  return <div className="border-b px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}><div className="flex items-center gap-2"><Icon size={14} variant="Linear" color="var(--fg-muted)" /><h2 className="text-[14px] font-semibold text-fg-primary">{title}</h2></div><p className="mt-0.5 text-[12.5px] text-fg-secondary">{desc}</p></div>;
}

function StatusPill({ status }: { status: ProfitabilityRow['status'] }) {
  const severity: DashboardSeverity = status === 'blocked' ? 'critical' : status === 'watch' ? 'warning' : 'healthy';
  return <SeverityPill severity={severity} label={status} />;
}

function SeverityPill({ severity, label }: { severity: DashboardSeverity; label?: string }) {
  const style = severity === 'healthy' ? { color: 'var(--success)', background: 'var(--status-live-bg)' } : severity === 'warning' ? { color: 'var(--warning)', background: 'var(--warning-bg)' } : { color: 'var(--danger)', background: 'var(--danger-bg)' };
  return <span className="inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium capitalize leading-none" style={style}><span className="h-1.5 w-1.5 rounded-full" style={{ background: style.color }} /> {label ?? severity}</span>;
}

function toneColor(tone: MoneyKpi['tone']) {
  if (tone === 'danger') return 'var(--danger)';
  if (tone === 'warning') return 'var(--warning)';
  if (tone === 'good') return 'var(--success)';
  return 'var(--fg-secondary)';
}

function severityColor(severity: DashboardSeverity) {
  if (severity === 'critical') return 'var(--danger)';
  if (severity === 'warning') return 'var(--warning)';
  return 'var(--success)';
}
