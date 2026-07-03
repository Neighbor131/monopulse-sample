import { useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Check,
  Clock,
  Gift,
  Pause,
  Play,
  ScrollText,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { CAMPAIGNS, fmtMoney, fmtNum, getType } from '../data/campaigns';
import { EVENT_LOGS } from '../data/integrations';
import { MANUAL_REWARDS, WEBHOOK_FAILURES } from '../data/safety';
import { SEGMENTS } from '../data/segments';
import { StateCard } from '../components/StateViews';

const requirementMap: Record<string, { label: string; value: string; tone?: 'warning' | 'danger' | 'success' }[]> = {
  mission: [
    { label: 'Task chain', value: '3 quest steps configured', tone: 'success' },
    { label: 'Completion rule', value: 'All tasks before expiry' },
    { label: 'Reward trigger', value: 'Instant bonus GUID' },
  ],
  race: [
    { label: 'Scoring', value: 'Turnover leaderboard' },
    { label: 'Settlement', value: 'Final-day grace period', tone: 'warning' },
    { label: 'Prize table', value: 'Top 50 paid' },
  ],
  rakeback: [
    { label: 'Rate matrix', value: 'Tiered cashback' },
    { label: 'Caps', value: 'Manual approval above €500', tone: 'warning' },
    { label: 'Risk gate', value: 'Velocity abuse hold', tone: 'danger' },
  ],
  prizedrop: [
    { label: 'Drop logic', value: 'Time window + spin count' },
    { label: 'Randomness', value: 'Seeded draw audit' },
    { label: 'Provider', value: 'Webhook delivery check', tone: 'warning' },
  ],
  achievement: [
    { label: 'Unlock rule', value: 'Tier milestone' },
    { label: 'Badge state', value: 'Visible after completion' },
    { label: 'Reward', value: 'Optional benefit' },
  ],
  jackpot: [
    { label: 'Pool', value: 'Network pooled prize' },
    { label: 'Seed & cap', value: 'Pending seed value', tone: 'warning' },
    { label: 'Jurisdiction', value: '2 brand conflicts', tone: 'danger' },
  ],
  survival: [
    { label: 'Elimination', value: 'Locked entries' },
    { label: 'Prize pool', value: 'Guaranteed pool' },
    { label: 'Settlement', value: 'Final survivor list' },
  ],
  velocity: [
    { label: 'Timer', value: 'Countdown window' },
    { label: 'Threshold', value: '500 spins' },
    { label: 'Expiry', value: 'No reward after timer' },
  ],
  raffle: [
    { label: 'Ticket rule', value: 'Earn tickets by wager' },
    { label: 'Draw', value: 'Drawing in progress', tone: 'warning' },
    { label: 'Audit', value: 'Winner seed recorded' },
  ],
};

export default function CampaignDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const campaign = CAMPAIGNS.find((c) => c.id === id);
  if (!campaign) {
    return (
      <div className="mx-auto w-full max-w-[1360px] px-8 py-24">
        <StateCard
          state="not-found"
          title="Campaign not found"
          detail="This campaign may have been archived, removed from the current brand scope, or opened from a stale notification."
          actionLabel="Back to campaigns"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }
  const type = getType(campaign.type);
  const TypeIcon = type.icon;
  const budgetRatio = campaign.budgetTotal ? Math.round((campaign.budgetUsed / campaign.budgetTotal) * 100) : 0;

  const connected = {
    events: EVENT_LOGS.filter((e) => e.campaign === campaign.name || e.brand === campaign.brands[0]),
    rewards: MANUAL_REWARDS.filter((r) => r.campaignName === campaign.name || r.brand === campaign.brands[0]),
    failures: WEBHOOK_FAILURES.filter((w) => w.campaignName === campaign.name || w.brand === campaign.brands[0]),
    segments: SEGMENTS.filter((s) => s.usage.some((u) => u.name === campaign.name || campaign.name.includes(u.name))),
  };

  return (
    <div className="mx-auto w-full max-w-[1360px] px-8 py-6">
      <button onClick={() => navigate('/')} className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-secondary hover:text-fg-primary">
        <ArrowLeft size={15} /> Campaigns
      </button>

      <section className="rounded-xl border p-5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="flex items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
              <TypeIcon size={22} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-[22px] font-semibold tracking-tight">{campaign.name}</h1>
                <StatusBadge status={campaign.status} />
              </div>
              <p className="mt-1 text-[13px] text-fg-secondary">{campaign.playerTitle}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip label={type.name} />
                <Chip label={campaign.brands.join(' · ')} mono />
                <Chip label={`${campaign.owner} · ${campaign.ownerRole}`} />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Action icon={campaign.status === 'paused' ? Play : Pause} label={campaign.status === 'paused' ? 'Resume' : 'Pause'} danger={campaign.status !== 'paused'} />
            <Action icon={BarChart3} label="Performance" />
            <Action icon={ScrollText} label="Audit" />
          </div>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-4 gap-3">
        <Metric icon={Users} label="Audience" value={fmtNum(campaign.audienceSize)} />
        <Metric icon={Gift} label="Reward cost" value={fmtMoney(campaign.rewardCost, campaign.currency)} />
        <Metric icon={BarChart3} label="Budget used" value={`${budgetRatio}%`} accent={budgetRatio > 80 ? 'var(--warning)' : 'var(--accent)'} />
        <Metric icon={AlertTriangle} label="Open failures" value={String(connected.failures.length)} accent={connected.failures.length ? 'var(--danger)' : 'var(--success)'} />
      </div>

      <div className="mt-4 grid grid-cols-[1fr_360px] gap-4">
        <div className="flex flex-col gap-4">
          <Panel title="Mechanic requirements">
            <div className="grid grid-cols-3 gap-3">
              {(requirementMap[campaign.type] ?? []).map((r) => <Requirement key={r.label} {...r} />)}
            </div>
          </Panel>

          <Panel title="Operational timeline">
            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {[
                { icon: Check, title: 'Safety gates evaluated', sub: campaign.riskNote ?? 'No blockers detected', tone: campaign.risk === 'blocked' ? 'danger' : campaign.risk === 'warning' ? 'warning' : 'success' },
                { icon: Activity, title: 'Latest event activity', sub: connected.events[0]?.validation ?? 'No live event attached yet', tone: connected.events.some((e) => e.status !== 'delivered') ? 'warning' : 'success' },
                { icon: Gift, title: 'Reward fulfilment', sub: connected.rewards[0]?.holdReason ?? 'No manual reward holds', tone: connected.rewards.length ? 'warning' : 'success' },
                { icon: Clock, title: 'Last updated', sub: campaign.updatedAt, tone: 'default' },
              ].map((item) => <TimelineItem key={item.title} {...item} />)}
            </div>
          </Panel>
        </div>

        <aside className="flex flex-col gap-4">
          <Panel title="Readiness">
            <div className="flex flex-col gap-2">
              <Health label="Budget cap" ok={budgetRatio < 90} detail={`${fmtMoney(campaign.budgetUsed, campaign.currency)} / ${fmtMoney(campaign.budgetTotal, campaign.currency)}`} />
              <Health label="Risk controls" ok={campaign.risk !== 'blocked'} detail={campaign.riskNote ?? 'Clear'} />
              <Health label="Reward delivery" ok={connected.failures.length === 0} detail={connected.failures.length ? `${connected.failures.length} fulfilment failure` : 'Healthy'} />
              <Health label="Audience segment" ok={campaign.audienceSize > 0} detail={campaign.audienceSize ? `${fmtNum(campaign.audienceSize)} players` : 'Not configured'} />
            </div>
          </Panel>

          <Panel title="Connected objects">
            <Connected label="Events" value={connected.events.length} />
            <Connected label="Reward holds" value={connected.rewards.length} />
            <Connected label="Segments" value={connected.segments.length} />
            <Connected label="Webhook failures" value={connected.failures.length} danger={connected.failures.length > 0} />
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}><div className="border-b px-5 py-3 text-[14px] font-semibold text-fg-primary" style={{ borderColor: 'var(--border-subtle)' }}>{title}</div><div className="p-5">{children}</div></section>;
}

function Metric({ icon: Icon, label, value, accent = 'var(--accent)' }: { icon: LucideIcon; label: string; value: string; accent?: string }) {
  return <div className="rounded-xl border px-4 py-3.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}><div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><Icon size={13} style={{ color: accent }} /> {label}</div><div className="mt-1.5 font-mono text-[22px] font-semibold text-fg-primary">{value}</div></div>;
}

function Requirement({ label, value, tone = 'success' }: { label: string; value: string; tone?: 'warning' | 'danger' | 'success' }) {
  const color = tone === 'danger' ? 'var(--danger)' : tone === 'warning' ? 'var(--warning)' : 'var(--success)';
  return <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><span className="h-2 w-2 rounded-full" style={{ background: color }} />{label}</div><div className="mt-2 text-[12.5px] font-medium text-fg-primary">{value}</div></div>;
}

function TimelineItem({ icon: Icon, title, sub, tone }: { icon: LucideIcon; title: string; sub: string; tone: string }) {
  const color = tone === 'danger' ? 'var(--danger)' : tone === 'warning' ? 'var(--warning)' : tone === 'success' ? 'var(--success)' : 'var(--fg-muted)';
  return <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"><span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'var(--surface-3)', color }}><Icon size={14} /></span><div><div className="text-[13px] font-medium text-fg-primary">{title}</div><div className="mt-0.5 text-[12px] text-fg-secondary">{sub}</div></div></div>;
}

function Health({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2" style={{ background: 'var(--surface-2)' }}><div><div className="text-[12.5px] font-medium text-fg-primary">{label}</div><div className="text-[11.5px] text-fg-muted">{detail}</div></div><span style={{ color: ok ? 'var(--success)' : 'var(--danger)' }}>{ok ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}</span></div>;
}

function Connected({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return <div className="flex items-center justify-between border-b py-2 last:border-0" style={{ borderColor: 'var(--border-subtle)' }}><span className="text-[12.5px] text-fg-secondary">{label}</span><span className="font-mono text-[13px] font-semibold" style={{ color: danger ? 'var(--danger)' : 'var(--fg-primary)' }}>{value}</span></div>;
}

function Chip({ label, mono }: { label: string; mono?: boolean }) {
  return <span className={`rounded-md px-2 py-1 text-[11.5px] font-medium ${mono ? 'font-mono' : ''}`} style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{label}</span>;
}

function Action({ icon: Icon, label, danger }: { icon: LucideIcon; label: string; danger?: boolean }) {
  return <button className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[12.5px] font-semibold" style={{ background: danger ? 'var(--danger-bg)' : 'var(--surface-3)', color: danger ? 'var(--danger)' : 'var(--fg-secondary)', border: '1px solid var(--border-strong)' }}><Icon size={14} /> {label}</button>;
}
