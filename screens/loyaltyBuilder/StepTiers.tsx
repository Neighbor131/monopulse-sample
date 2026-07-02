import { Layers, Info } from 'lucide-react';
import { useProgram } from '../../context/ProgramContext';
import TierMatrix from '../../components/loyalty/TierMatrix';
import { TIER_VAR } from '../../data/loyalty';

export default function StepTiers() {
  const { draft, update } = useProgram();
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[16px] font-semibold tracking-tight">Tier structure</h2>
        <p className="mt-1 text-[13px] text-fg-secondary">Define the ladder and the thresholds a player must hit to enter and hold each tier.</p>
      </div>

      {/* ladder preview */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-lg border px-3 py-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        {draft.tiers.map((t, i) => (
          <div key={t.id} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5" style={{ background: 'var(--surface-2)' }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: TIER_VAR[t.color] }} />
              <span className="whitespace-nowrap text-[12px] font-medium text-fg-primary">{t.name || 'Tier'}</span>
              <span className="font-mono text-[11px] text-fg-muted">{t.benefits.cashbackPct}%</span>
            </div>
            {i < draft.tiers.length - 1 && <span className="text-fg-muted">→</span>}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Layers size={15} className="text-fg-secondary" strokeWidth={1.75} />
        <h3 className="text-[14px] font-semibold text-fg-primary">Tier matrix</h3>
      </div>
      <TierMatrix tiers={draft.tiers} onChange={(t) => update({ tiers: t })} />

      <div className="flex items-start gap-2.5 rounded-lg border px-4 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
        <Info size={14} className="mt-0.5 shrink-0 text-fg-muted" strokeWidth={1.75} />
        <p className="text-[12px] leading-relaxed text-fg-secondary">
          <span className="font-medium text-fg-primary">Entry</span> thresholds promote a player up; <span className="font-medium text-fg-primary">maintenance</span> thresholds decide who holds or drops at each reset. Cashback % and reward multiplier flow into the Benefits step and the liability estimate.
        </p>
      </div>
    </div>
  );
}
