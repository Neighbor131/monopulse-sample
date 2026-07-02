import { useMemo, useState } from 'react';
import { ArrowUp, ArrowDown, Snowflake, Sparkles, TrendingUp, Layers } from 'lucide-react';
import type { Player } from '../../data/players';
import { tierMoves, cashbackEligibility, vipOverride } from '../../data/playerDetail';
import type { TierMove } from '../../data/playerDetail';
import { TIER_VAR } from '../../data/loyalty';
import { fmtMoney } from '../../data/campaigns';
import { Pill } from '../../screens/Players';
import { Drawer, ConfirmBlock, AuditSection, SectionLabel, KV, Bar } from './Drawer';
import type { AuditEntry } from './Drawer';

// ─── helpers ────────────────────────────────────────────────────────────────

const TIER_ORDER = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'VIP', 'Elite'];

function nextTier(tier: string): string {
  const idx = TIER_ORDER.indexOf(tier);
  return idx >= 0 && idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1] : 'Max tier';
}

function tierProgress(p: Player): number {
  if (p.upcomingTierChange) {
    const idx = TIER_ORDER.indexOf(p.tier);
    return idx >= 0 ? 68 : 50;
  }
  const idx = TIER_ORDER.indexOf(p.tier);
  return idx >= 0 ? 35 + (idx * 8) % 45 : 50;
}

function directionIcon(dir: TierMove['direction']): typeof ArrowUp {
  if (dir === 'up') return ArrowUp;
  if (dir === 'down') return ArrowDown;
  if (dir === 'freeze') return Snowflake;
  return Sparkles;
}

function directionColor(dir: TierMove['direction']): string {
  if (dir === 'up') return 'var(--success)';
  if (dir === 'down') return 'var(--danger)';
  if (dir === 'freeze') return 'var(--status-scheduled)';
  return 'var(--accent)';
}

const VIP_STATUS_META: Record<'none' | 'active' | 'pending', { label: string; fg: string; bg: string }> = {
  none: { label: 'No override', fg: 'var(--fg-muted)', bg: 'var(--surface-3)' },
  active: { label: 'Active override', fg: 'var(--accent)', bg: 'var(--accent-bg)' },
  pending: { label: 'Pending approval', fg: 'var(--status-scheduled)', bg: 'var(--status-scheduled-bg)' },
};

// ─── component ──────────────────────────────────────────────────────────────

export default function LoyaltyTab({ p }: { p: Player }) {
  const moves = useMemo(() => tierMoves(p), [p]);
  const cashback = useMemo(() => cashbackEligibility(p), [p]);
  const vip = useMemo(() => vipOverride(p), [p]);
  const progress = useMemo(() => tierProgress(p), [p]);
  const next = useMemo(() => nextTier(p.tier), [p]);

  type ActionKind = 'tier_adj' | 'vip_override';
  const [drawerAction, setDrawerAction] = useState<ActionKind | null>(null);
  const [audits, setAudits] = useState<AuditEntry[]>([]);

  const close = () => setDrawerAction(null);

  const confirm = (kind: ActionKind, note: string) => {
    const action = kind === 'tier_adj' ? 'Tier adjustment requested' : 'VIP override requested';
    setAudits((a) => [{ at: 'just now', actor: 'You', action, note, pending: true }, ...a]);
    setDrawerAction(null);
  };

  return (
    <div>
      {/* Action row */}
      <div className="mb-4 flex items-center justify-end gap-2">
        <button
          onClick={() => setDrawerAction('tier_adj')}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold"
          style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
        >
          <TrendingUp size={13} strokeWidth={2} />Request tier adjustment
        </button>
        <button
          onClick={() => setDrawerAction('vip_override')}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold"
          style={{ border: '1px solid var(--border-strong)', color: 'var(--fg-secondary)' }}
        >
          <Sparkles size={13} strokeWidth={2} />Add VIP override
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-[1fr_340px] gap-6">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-5">
          {/* Current tier & progress */}
          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
            <div className="mb-3 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Current tier &amp; progress</div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-3 w-3 rounded-full shrink-0" style={{ background: TIER_VAR[p.tierColor] }} />
              <span className="text-[22px] font-semibold tracking-tight text-fg-primary">{p.tier}</span>
              {p.vip && (
                <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>VIP</span>
              )}
            </div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[12px] text-fg-muted">Progress to {next}</span>
              <span className="font-mono text-[12px] tabular-nums text-fg-primary">{progress}%</span>
            </div>
            <Bar value={progress} tone={TIER_VAR[p.tierColor]} />
            {p.upcomingTierChange && (
              <div className="mt-3 rounded-md px-3 py-2 text-[12px]" style={{ background: 'var(--surface-2)', color: 'var(--fg-secondary)' }}>
                <span className="font-medium text-fg-primary">{p.upcomingTierChange.direction === 'up' ? '↑' : '↓'} {p.upcomingTierChange.to}</span>
                {' '}expected {p.upcomingTierChange.when} · {p.upcomingTierChange.reason}
              </div>
            )}
          </div>

          {/* Tier movement history */}
          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
            <div className="mb-3 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Tier movement history</div>
            <div className="flex flex-col">
              {moves.map((m, i) => {
                const Icon = directionIcon(m.direction);
                const color = directionColor(m.direction);
                return (
                  <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
                    <div className="flex flex-col items-center">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--surface-3)' }}>
                        <Icon size={12} style={{ color }} strokeWidth={2.25} />
                      </span>
                      {i < moves.length - 1 && <span className="mt-1 w-px flex-1" style={{ background: 'var(--border-strong)' }} />}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[12.5px] font-medium text-fg-primary">{m.from} → {m.to}</span>
                        <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color, background: 'var(--surface-3)' }}>{m.direction}</span>
                      </div>
                      <div className="mt-0.5 text-[11.5px] text-fg-secondary">{m.reason}</div>
                      <div className="mt-0.5 text-[11px] text-fg-muted">{m.actor} · {m.at}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right rail ── */}
        <div className="flex flex-col gap-4">
          {/* Cashback & rakeback eligibility */}
          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
            <div className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Cashback &amp; rakeback eligibility</div>
            {!cashback.eligible && cashback.blockReason && (
              <div className="mb-3 flex items-start gap-2 rounded-md px-3 py-2 text-[12px]" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{cashback.blockReason}</span>
              </div>
            )}
            <KV label="Cashback rate">{cashback.cashbackRate}%</KV>
            <KV label="Rakeback rate">{cashback.rakebackRate}%</KV>
            <KV label="Cap">{cashback.capped ? fmtMoney(cashback.cap, 'EUR') : 'Uncapped'}</KV>
            <KV label="Frequency">{cashback.frequency}</KV>
            <KV label="Next payout">{cashback.nextPayout}</KV>
            <KV label="Current liability">
              <span className="font-mono tabular-nums" style={{ color: cashback.liability > 5000 ? 'var(--warning)' : 'var(--fg-primary)' }}>
                {fmtMoney(cashback.liability, 'EUR')}
              </span>
            </KV>
          </div>

          {/* VIP override */}
          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">VIP override</span>
              <Pill meta={VIP_STATUS_META[vip.status]} />
            </div>
            <KV label="Status">{vip.label}</KV>
            <KV label="Detail"><span className="text-right text-[12px] text-fg-secondary">{vip.detail}</span></KV>
            {vip.forcedTier && <KV label="Forced tier">{vip.forcedTier}</KV>}
            <KV label="Approver">{vip.approver}</KV>
          </div>

          {/* Audit trail */}
          {audits.length > 0 && (
            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
              <AuditSection entries={audits} />
            </div>
          )}
        </div>
      </div>

      {/* Tier adjustment drawer */}
      <Drawer
        open={drawerAction === 'tier_adj'}
        onClose={close}
        title="Request tier adjustment"
        subtitle={`${p.alias} · ${p.id}`}
      >
        <ConfirmBlock
          icon={TrendingUp}
          tone="accent"
          title={`Request tier adjustment for ${p.alias}`}
          description="Submit a tier adjustment request for this player. Because this directly affects the player's loyalty status and reward eligibility, it routes to the approvals queue before taking effect."
          requiresApproval
          needNote
          confirmLabel="Request adjustment"
          onConfirm={(note) => confirm('tier_adj', note)}
          onCancel={close}
        />
      </Drawer>

      {/* VIP override drawer */}
      <Drawer
        open={drawerAction === 'vip_override'}
        onClose={close}
        title="Add VIP override"
        subtitle={`${p.alias} · ${p.id}`}
      >
        <ConfirmBlock
          icon={Sparkles}
          tone="accent"
          title={`Add VIP override for ${p.alias}`}
          description="Apply a manual VIP override to this player's tier or cashback rate. This bypasses the automated points engine and requires Casino Manager approval before it takes effect."
          requiresApproval
          needNote
          confirmLabel="Submit override"
          onConfirm={(note) => confirm('vip_override', note)}
          onCancel={close}
        />
      </Drawer>
    </div>
  );
}
