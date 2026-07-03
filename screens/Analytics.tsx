import { BarChart3, CircleDollarSign, LineChart, Percent, TrendingUp, Users } from 'lucide-react';
import { CAMPAIGNS, fmtMoney, fmtNum, getType } from '../data/campaigns';
import { performanceMetrics, experiments } from '../data/dashboard';
import { rewardKpis } from '../data/rewards';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const SERIES = [62, 74, 69, 88, 96, 112];
const COST = [28, 34, 41, 39, 52, 58];

export default function Analytics() {
  const metrics = performanceMetrics();
  const totalBudget = CAMPAIGNS.reduce((sum, campaign) => sum + campaign.budgetTotal, 0);
  const totalCost = CAMPAIGNS.reduce((sum, campaign) => sum + campaign.rewardCost, 0);
  const roi = totalCost ? (CAMPAIGNS.reduce((sum, campaign) => sum + campaign.audienceSize, 0) / totalCost * 0.012).toFixed(1) : '0';
  const rewardLiability = rewardKpis().pendingLiability;

  return (
    <div className="mx-auto w-full max-w-[1360px] px-8 py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[19px] font-semibold tracking-tight">Analytics & performance</h1>
          <p className="mt-1 text-[13px] text-fg-secondary">Commercial readout across campaign ROI, retention, LTV, reward cost and A/B experiments.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-5 gap-3">
        <Kpi icon={TrendingUp} label="Campaign ROI" value={`${roi}x`} detail="blended across active campaigns" />
        <Kpi icon={Percent} label="Retention lift" value="+6.1%" detail="high-value active segment" />
        <Kpi icon={Users} label="Active players" value="84,912" detail="+8.4% vs last week" />
        <Kpi icon={CircleDollarSign} label="Reward cost" value={fmtMoney(totalCost, 'EUR')} detail={`${Math.round((totalCost / totalBudget) * 100)}% of approved budget`} accent="var(--warning)" />
        <Kpi icon={BarChart3} label="Liability" value={fmtMoney(rewardLiability, 'EUR')} detail="pending reward exposure" accent="var(--danger)" />
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_420px] gap-4">
        <section className="rounded-xl border p-5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <SectionTitle icon={LineChart} title="Retention and reward cost trend" desc="Monthly index values for prototype discussion; backend should map these to warehouse metrics." />
          <div className="mt-6 grid h-64 grid-cols-6 items-end gap-4 border-b border-l px-3 pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
            {MONTHS.map((month, index) => (
              <div key={month} className="flex h-full flex-col justify-end gap-2">
                <div className="flex items-end gap-1">
                  <div className="w-full rounded-t" style={{ height: `${SERIES[index]}%`, background: 'var(--accent)' }} />
                  <div className="w-full rounded-t" style={{ height: `${COST[index]}%`, background: 'var(--warning)' }} />
                </div>
                <span className="text-center text-[11px] text-fg-muted">{month}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-[12px] text-fg-secondary">
            <span><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }} />Retention index</span>
            <span><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: 'var(--warning)' }} />Reward cost index</span>
          </div>
        </section>

        <section className="rounded-xl border p-5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <SectionTitle icon={BarChart3} title="Metric definitions" desc="Questions for backend/product alignment." />
          <div className="mt-4 grid gap-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border p-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-semibold text-fg-primary">{metric.label}</span>
                  <span className="font-mono text-[15px] font-semibold text-fg-primary">{metric.value}</span>
                </div>
                <div className="mt-1 text-[11.5px] text-fg-muted">{metric.delta}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-4 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <SectionTitle icon={BarChart3} title="Campaign performance by mechanic" desc="Use this to validate which metrics are needed on each mechanic detail page." padded />
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse text-left">
            <thead><tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-2)' }}><th className="px-5 py-2.5">Campaign</th><th className="px-4 py-2.5">Mechanic</th><th className="px-4 py-2.5 text-right">Audience</th><th className="px-4 py-2.5 text-right">Reward cost</th><th className="px-4 py-2.5 text-right">Budget used</th><th className="px-4 py-2.5">Decision signal</th></tr></thead>
            <tbody>{CAMPAIGNS.slice(0, 8).map((campaign) => <tr key={campaign.id} className="border-t" style={{ borderColor: 'var(--border-subtle)' }}><td className="px-5 py-3 text-[13px] font-medium text-fg-primary">{campaign.name}</td><td className="px-4 py-3 text-[12px] text-fg-secondary">{getType(campaign.type).name}</td><td className="px-4 py-3 text-right font-mono text-[12px] text-fg-secondary">{fmtNum(campaign.audienceSize)}</td><td className="px-4 py-3 text-right font-mono text-[12px] text-fg-secondary">{fmtMoney(campaign.rewardCost, campaign.currency)}</td><td className="px-4 py-3 text-right font-mono text-[12px] text-fg-secondary">{campaign.budgetTotal ? Math.round((campaign.budgetUsed / campaign.budgetTotal) * 100) : 0}%</td><td className="px-4 py-3 text-[12px]" style={{ color: campaign.risk === 'warning' ? 'var(--warning)' : campaign.risk === 'blocked' ? 'var(--danger)' : 'var(--success)' }}>{campaign.risk === 'none' ? 'Healthy' : campaign.riskNote}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <SectionTitle icon={BarChart3} title="A/B experiment readout" desc="Prototype-friendly view for comparing campaign mechanics and UI variants." padded />
        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {experiments.map((exp) => <div key={exp.id} className="grid grid-cols-[1fr_180px_180px_120px_120px] items-center gap-4 px-5 py-3"><div><div className="text-[13px] font-semibold text-fg-primary">{exp.name}</div><div className="text-[11.5px] text-fg-muted">{exp.variantA} vs {exp.variantB}</div></div><span className="text-[12px] text-fg-secondary">{fmtNum(exp.audience)} players</span><span className="font-mono text-[13px] text-fg-primary">{exp.lift}</span><span className="text-[12px] text-fg-secondary">{exp.confidence}</span><span className="rounded-md px-2 py-1 text-[11px] font-semibold capitalize" style={{ background: 'var(--surface-3)', color: exp.status === 'winner' ? 'var(--success)' : exp.status === 'needs_review' ? 'var(--warning)' : 'var(--fg-secondary)' }}>{exp.status.replace('_', ' ')}</span></div>)}
        </div>
      </section>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, detail, accent = 'var(--accent)' }: { icon: typeof TrendingUp; label: string; value: string; detail: string; accent?: string }) {
  return <div className="rounded-xl border px-4 py-3.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}><div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><Icon size={13} style={{ color: accent }} />{label}</div><div className="mt-1.5 font-mono text-[21px] font-semibold leading-none text-fg-primary">{value}</div><div className="mt-1 text-[11.5px] text-fg-muted">{detail}</div></div>;
}

function SectionTitle({ icon: Icon, title, desc, padded }: { icon: typeof BarChart3; title: string; desc: string; padded?: boolean }) {
  return <div className={padded ? 'border-b px-5 py-3' : ''} style={{ borderColor: 'var(--border-subtle)' }}><div className="flex items-center gap-2 text-[14px] font-semibold text-fg-primary"><Icon size={15} style={{ color: 'var(--accent)' }} />{title}</div><p className="mt-0.5 text-[12.5px] text-fg-secondary">{desc}</p></div>;
}
