import { Coins, TrendingUp, Wallet, Gift, ArrowUp, ArrowDown, ShieldAlert, AlertTriangle, Sparkles, CircleDollarSign, LogIn, Dices, Banknote, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { fmtMoney } from '../../data/campaigns';
import { TIER_VAR } from '../../data/loyalty';
import type { Player, PlayerActivity } from '../../data/players';

const ACTIVITY_ICON: Record<PlayerActivity['kind'], LucideIcon> = {
  deposit: CircleDollarSign, wager: Dices, reward: Gift, tier: TrendingUp, login: LogIn, risk: ShieldAlert, withdrawal: Banknote,
};

export default function PlayerOverview({ p }: { p: Player }) {
  const m = p.metrics;
  return (
    <div className="grid grid-cols-[1fr_360px] gap-6">
      {/* Left */}
      <div className="flex flex-col gap-6">
        {/* Key metrics */}
        <section>
          <h3 className="mb-2.5 text-[13px] font-semibold text-fg-primary">Lifetime value</h3>
          <div className="grid grid-cols-3 gap-3">
            <Metric icon={Coins} label="Deposits" value={fmtMoney(m.deposits, 'EUR')} sub={`${fmtMoney(m.withdrawals, 'EUR')} withdrawn`} />
            <Metric icon={Dices} label="Turnover" value={fmtMoney(m.turnover, 'EUR')} sub="lifetime wagered" />
            <Metric icon={TrendingUp} label="GGR / NGR" value={fmtMoney(m.ggr, 'EUR')} sub={`${fmtMoney(m.ngr, 'EUR')} net`} />
            <Metric icon={Sparkles} label="Lifetime value" value={fmtMoney(m.ltv, 'EUR')} accent="var(--accent)" />
            <Metric icon={Gift} label="Reward cost" value={fmtMoney(m.rewardCost, 'EUR')} sub="bonuses + comps" />
            <Metric icon={Wallet} label="Cashback liability" value={m.cashbackLiability > 0 ? fmtMoney(m.cashbackLiability, 'EUR') : '—'} accent={m.cashbackLiability >= 5000 ? 'var(--warning)' : undefined} sub="open this period" />
          </div>
        </section>

        {/* Recent activity */}
        <section>
          <h3 className="mb-2.5 text-[13px] font-semibold text-fg-primary">Recent activity</h3>
          <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
            {p.activity.map((a, i) => {
              const Icon = ACTIVITY_ICON[a.kind];
              const tone = a.kind === 'risk' ? 'var(--danger)' : a.kind === 'reward' ? 'var(--tier-gold)' : a.kind === 'tier' ? 'var(--accent)' : 'var(--fg-secondary)';
              return (
                <div key={i} className="flex items-center gap-3 border-t px-4 py-3 first:border-t-0" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--surface-3)', color: tone }}><Icon size={15} strokeWidth={1.75} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-medium text-fg-primary">{a.label}</div>
                    <div className="truncate text-[11.5px] text-fg-muted">{a.detail}</div>
                  </div>
                  {a.amount && <span className="shrink-0 font-mono text-[12px] tabular-nums text-fg-secondary">{a.amount}</span>}
                  <span className="w-20 shrink-0 text-right font-mono text-[10.5px] text-fg-muted">{a.at}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Right rail */}
      <div className="flex flex-col gap-4">
        {/* Warnings / blockers */}
        {p.warnings.length > 0 && (
          <div className="flex flex-col gap-2">
            {p.warnings.map((w, i) => {
              const crit = w.level === 'critical';
              const c = crit ? 'var(--danger)' : 'var(--warning)';
              return (
                <div key={i} className="flex items-start gap-2.5 rounded-xl border px-4 py-3" style={{ borderColor: crit ? 'rgba(240,87,107,0.4)' : 'rgba(231,168,60,0.4)', background: crit ? 'var(--danger-bg)' : 'var(--warning-bg)' }}>
                  <ShieldAlert size={15} className="mt-0.5 shrink-0" style={{ color: c }} strokeWidth={2} />
                  <div>
                    <div className="text-[12.5px] font-semibold text-fg-primary">{w.title}</div>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-fg-secondary">{w.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upcoming tier change */}
        {p.upcomingTierChange && (
          <RailCard title="Upcoming tier change">
            <div className="flex items-center gap-3 px-1">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: p.upcomingTierChange.direction === 'up' ? 'var(--status-live-bg)' : 'var(--warning-bg)', color: p.upcomingTierChange.direction === 'up' ? 'var(--success)' : 'var(--warning)' }}>
                {p.upcomingTierChange.direction === 'up' ? <ArrowUp size={16} strokeWidth={2.5} /> : <ArrowDown size={16} strokeWidth={2.5} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-fg-primary">
                  {p.upcomingTierChange.from} <span className="text-fg-muted">→</span> {p.upcomingTierChange.to}
                  <span className="ml-1 text-[11px] font-normal text-fg-muted">{p.upcomingTierChange.when}</span>
                </div>
                <div className="mt-0.5 text-[11.5px] text-fg-muted">{p.upcomingTierChange.reason}</div>
              </div>
            </div>
          </RailCard>
        )}

        {/* Eligible campaign */}
        {p.eligibleCampaign && (
          <RailCard title="Campaign eligibility">
            <div className="flex items-start gap-2.5 px-1">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}><Sparkles size={14} strokeWidth={2} /></span>
              <div>
                <div className="text-[12.5px] font-medium text-fg-primary">{p.eligibleCampaign.name}</div>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-fg-muted">{p.eligibleCampaign.reason}</p>
              </div>
            </div>
          </RailCard>
        )}

        {/* Segments */}
        <RailCard title="Active segments" count={p.segments.length}>
          {p.segments.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 px-1">
              {p.segments.map((s) => (
                <span key={s} className="rounded-md border px-2 py-1 text-[11.5px] font-medium text-fg-secondary" style={{ borderColor: 'var(--border-strong)' }}>{s}</span>
              ))}
            </div>
          ) : (
            <p className="px-1 text-[12px] text-fg-muted">Not in any segment.</p>
          )}
        </RailCard>

        {/* Loyalty snapshot */}
        <RailCard title="Loyalty snapshot">
          <div className="flex flex-col gap-2 px-1">
            <Row label="Current tier">
              <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-fg-primary"><span className="h-2.5 w-2.5 rounded-full" style={{ background: TIER_VAR[p.tierColor] }} />{p.tier}</span>
            </Row>
            <Row label="VIP status"><span className="text-[12.5px] text-fg-secondary">{p.vip ? 'Yes' : 'No'}</span></Row>
            <Row label="Active campaigns"><span className="font-mono text-[12.5px] tabular-nums text-fg-secondary">{p.activeCampaigns.length}</span></Row>
            {p.accountManager && <Row label="VIP manager"><span className="text-[12.5px] text-fg-secondary">{p.accountManager}</span></Row>}
          </div>
        </RailCard>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, sub, accent }: { icon: LucideIcon; label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-xl border px-4 py-3.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">
        <span className="flex h-5 w-5 items-center justify-center rounded" style={{ background: 'var(--surface-3)', color: accent ?? 'var(--fg-secondary)' }}><Icon size={12} strokeWidth={2.25} /></span>
        {label}
      </div>
      <div className="mt-1.5 font-mono text-[19px] font-semibold leading-none tabular-nums" style={{ color: accent ?? 'var(--fg-primary)' }}>{value}</div>
      {sub && <div className="mt-1 text-[11px] text-fg-muted">{sub}</div>}
    </div>
  );
}

function RailCard({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-3.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">{title}</span>
        {count !== undefined && <span className="ml-auto rounded px-1.5 py-0.5 text-[10px] font-semibold text-fg-muted" style={{ background: 'var(--surface-3)' }}>{count}</span>}
      </div>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-t py-1.5 first:border-t-0 first:pt-0" style={{ borderColor: 'var(--border-subtle)' }}>
      <span className="text-[11.5px] text-fg-muted">{label}</span>
      {children}
    </div>
  );
}

// placeholder for tabs not yet built — keeps the profile navigable
export function TabPlaceholder({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center" style={{ borderColor: 'var(--border-strong)' }}>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}><Icon size={20} strokeWidth={1.75} /></div>
      <div>
        <div className="text-[13.5px] font-medium text-fg-primary">{title}</div>
        <p className="mx-auto mt-1 max-w-sm text-[12.5px] text-fg-secondary">{desc}</p>
      </div>
    </div>
  );
}
