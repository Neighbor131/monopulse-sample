import { useNavigate } from 'react-router-dom';
import { Check, AlertTriangle, Rocket, ShieldCheck, Layers, Percent, Building2, ArrowUp, ArrowDown, Send, Users } from 'lucide-react';
import { useProgram } from '../../context/ProgramContext';
import { monthlyLiability, totalProjectedPlayers, safetyChecks, CASHBACK_MODEL_META, tierMovement, movementTotals, needsApproval, APPROVAL_THRESHOLD } from '../../data/programDraft';
import { RESET_LABEL, TIER_VAR } from '../../data/loyalty';

const fmt = (n: number) => '€' + Math.round(n).toLocaleString();

export default function StepReview() {
  const navigate = useNavigate();
  const { draft, reset } = useProgram();
  const checks = safetyChecks(draft);
  const blockers = checks.filter((c) => !c.ok).length;
  const liab = monthlyLiability(draft);
  const approval = needsApproval(draft);
  // the liability check failing routes to approval rather than hard-blocking
  const hardBlockers = checks.filter((c) => !c.ok && c.label !== 'Liability within budget').length;
  const movement = tierMovement(draft);
  const totals = movementTotals(draft);
  const cycleWord = RESET_LABEL[draft.resetCycle].toLowerCase();

  const submit = () => { reset(); navigate(approval ? '/approvals' : '/loyalty'); };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[16px] font-semibold tracking-tight">Review & publish</h2>
        <p className="mt-1 text-[13px] text-fg-secondary">Confirm the structure, benefits and safety checks before sending for approval.</p>
      </div>

      {/* summary tiles */}
      <div className="grid grid-cols-4 gap-3">
        <Tile icon={Building2} label="Scope" value={draft.brandScope === 'network' ? 'Network' : `${draft.brands.length} brand${draft.brands.length === 1 ? '' : 's'}`} sub={draft.brands.join(', ') || '—'} />
        <Tile icon={Layers} label="Tiers" value={String(draft.tiers.length)} sub={`Reset ${RESET_LABEL[draft.resetCycle].toLowerCase()}`} />
        <Tile icon={Percent} label="Cashback" value={CASHBACK_MODEL_META[draft.cashback.model].short} sub={`${draft.cashback.payoutFrequency} payout`} />
        <Tile icon={ShieldCheck} label="Monthly liability" value={fmt(liab)} sub={`${totalProjectedPlayers(draft).toLocaleString()} players`} danger={liab >= 250000} />
      </div>

      {/* tier movement preview */}
      <div className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="flex items-center gap-2 border-b px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <Users size={15} className="text-fg-secondary" strokeWidth={1.75} />
          <span className="text-[14px] font-semibold text-fg-primary">Tier movement preview</span>
          <span className="ml-auto text-[11.5px] text-fg-muted">projected at first {cycleWord} reset</span>
        </div>
        <div className="flex items-center gap-4 border-b px-5 py-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium" style={{ color: 'var(--success)' }}><ArrowUp size={13} strokeWidth={2.5} /> {totals.promotions.toLocaleString()} promotions</span>
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium" style={{ color: 'var(--warning)' }}><ArrowDown size={13} strokeWidth={2.5} /> {totals.demotions.toLocaleString()} demotions</span>
        </div>
        <div>
          {movement.map((m) => (
            <div key={m.name} className="flex items-center gap-3 border-t px-5 py-2 first:border-0" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="h-3 w-3 rounded-full" style={{ background: TIER_VAR[m.color] }} />
              <span className="w-32 text-[13px] font-medium text-fg-primary">{m.name}</span>
              <span className="flex w-20 items-center gap-1 font-mono text-[11.5px]" style={{ color: m.promotedIn ? 'var(--success)' : 'var(--fg-muted)' }}>{m.promotedIn ? <ArrowUp size={11} strokeWidth={2.5} /> : null}{m.promotedIn ? `+${m.promotedIn.toLocaleString()}` : '—'}</span>
              <span className="flex w-20 items-center gap-1 font-mono text-[11.5px]" style={{ color: m.demotedOut ? 'var(--warning)' : 'var(--fg-muted)' }}>{m.demotedOut ? <ArrowDown size={11} strokeWidth={2.5} /> : null}{m.demotedOut ? `-${m.demotedOut.toLocaleString()}` : '—'}</span>
              <span className="ml-auto font-mono text-[11.5px] tabular-nums" style={{ color: m.net > 0 ? 'var(--success)' : m.net < 0 ? 'var(--warning)' : 'var(--fg-muted)' }}>net {m.net > 0 ? '+' : ''}{m.net.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* tier ladder */}
      <div className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="border-b px-5 py-3 text-[14px] font-semibold text-fg-primary" style={{ borderColor: 'var(--border-subtle)' }}>Tier ladder</div>
        <div>
          {draft.tiers.map((t) => (
            <div key={t.id} className="flex items-center gap-3 border-t px-5 py-2.5 first:border-0" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="h-3 w-3 rounded-full" style={{ background: TIER_VAR[t.color] }} />
              <span className="w-32 text-[13px] font-medium text-fg-primary">{t.name}</span>
              <span className="flex-1 font-mono text-[11.5px] text-fg-muted">entry €{t.entry.wager.toLocaleString()} wager · {t.entry.activeDays}d active</span>
              <span className="font-mono text-[12px] font-medium text-fg-secondary">{t.benefits.cashbackPct}% · {t.benefits.rewardMultiplier}×</span>
              <span className="w-20 text-right font-mono text-[11.5px] text-fg-muted">{t.estPlayers.toLocaleString()}p</span>
            </div>
          ))}
        </div>
      </div>

      {/* safety checks */}
      <div className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="flex items-center gap-2 border-b px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <ShieldCheck size={15} className="text-fg-secondary" strokeWidth={1.75} />
          <span className="text-[14px] font-semibold text-fg-primary">Safety & compliance checks</span>
          <span className="ml-auto text-[12px]" style={{ color: blockers ? 'var(--warning)' : 'var(--accent)' }}>{blockers ? `${blockers} to resolve` : 'All clear'}</span>
        </div>
        <div className="flex flex-col">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-3 border-t px-5 py-2.5 first:border-0" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full" style={c.ok ? { background: 'var(--accent-bg)', color: 'var(--accent)' } : { background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                {c.ok ? <Check size={12} strokeWidth={3} /> : <AlertTriangle size={12} strokeWidth={2.5} />}
              </span>
              <span className="text-[13px] font-medium text-fg-primary">{c.label}</span>
              <span className="ml-auto text-[12px] text-fg-secondary">{c.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* high-liability approval banner */}
      {approval && (
        <div className="flex items-start gap-2.5 rounded-xl border px-5 py-3.5" style={{ borderColor: 'rgba(231,168,60,0.4)', background: 'var(--warning-bg)' }}>
          <ShieldCheck size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--warning)' }} strokeWidth={2} />
          <div>
            <div className="text-[13px] font-semibold" style={{ color: 'var(--warning)' }}>Casino Manager approval required</div>
            <p className="mt-0.5 text-[12px] text-fg-secondary">Projected liability of <span className="font-medium text-fg-primary">{fmt(liab)}/mo</span> exceeds the {fmt(APPROVAL_THRESHOLD)} threshold. This program routes to the approval inbox before it can go live.</p>
          </div>
        </div>
      )}

      {/* publish */}
      <div className="flex items-center justify-between rounded-xl border px-5 py-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div>
          <div className="text-[13.5px] font-semibold text-fg-primary">{hardBlockers ? 'Resolve checks before publishing' : approval ? 'Ready to submit for approval' : 'Ready to publish'}</div>
          <p className="mt-0.5 text-[12px] text-fg-secondary">{hardBlockers ? `${hardBlockers} safety ${hardBlockers === 1 ? 'check' : 'checks'} still open.` : draft.scheduleMode === 'scheduled' && draft.scheduledFor ? `Scheduled to go live ${draft.scheduledFor}.` : approval ? 'A Casino Manager approves, then it goes live.' : 'Goes live immediately once published.'}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => navigate('/loyalty')} className="rounded-md border px-4 py-2 text-[13px] font-medium transition-colors" style={{ borderColor: 'var(--border-strong)', color: 'var(--fg-secondary)' }}>Save as draft</button>
          <button onClick={submit} disabled={hardBlockers > 0} className="flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold transition-colors" style={hardBlockers > 0 ? { background: 'var(--surface-3)', color: 'var(--fg-muted)', cursor: 'not-allowed' } : { background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            {approval ? <Send size={15} strokeWidth={2} /> : <Rocket size={15} strokeWidth={2} />} {approval ? 'Submit for approval' : draft.scheduleMode === 'scheduled' ? 'Schedule program' : 'Publish program'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Tile({ icon: Icon, label, value, sub, danger }: { icon: typeof Layers; label: string; value: string; sub: string; danger?: boolean }) {
  return (
    <div className="rounded-xl border px-4 py-3.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="flex items-center gap-1.5 text-fg-muted">
        <Icon size={13} strokeWidth={1.75} />
        <span className="text-[11px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-1.5 text-[17px] font-semibold tracking-tight" style={{ color: danger ? 'var(--danger)' : 'var(--fg-primary)' }}>{value}</div>
      <div className="mt-0.5 truncate text-[11.5px] text-fg-muted">{sub}</div>
    </div>
  );
}
