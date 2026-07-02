import { Gift } from 'lucide-react';
import { useProgram } from '../../context/ProgramContext';
import CashbackConfig from '../../components/loyalty/CashbackConfig';
import { Section, Select, Toggle, TagSelect } from '../../components/builder/form';
import { WITHDRAWAL_PERKS, BONUS_PERKS } from '../../data/programDraft';
import type { DraftTier, TierBenefits } from '../../data/programDraft';
import { TIER_VAR } from '../../data/loyalty';

export default function StepBenefits() {
  const { draft, update } = useProgram();
  const patchTier = (id: string, fn: (b: TierBenefits) => TierBenefits) =>
    update({ tiers: draft.tiers.map((t) => (t.id === id ? { ...t, benefits: fn(t.benefits) } : t)) });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[16px] font-semibold tracking-tight">Benefits & cashback</h2>
        <p className="mt-1 text-[13px] text-fg-secondary">Configure the cashback engine and the perks unlocked at each tier.</p>
      </div>

      <CashbackConfig draft={draft} onUpdate={update} />

      <Section icon={Gift} title="Tier perks" desc="Non-cash benefits granted while a player holds the tier.">
        <div className="flex flex-col gap-3">
          {draft.tiers.map((t: DraftTier) => (
            <div key={t.id} className="rounded-lg border p-3.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: TIER_VAR[t.color] }} />
                <span className="text-[13px] font-semibold text-fg-primary">{t.name}</span>
                <span className="ml-auto font-mono text-[11.5px] text-fg-muted">{t.benefits.cashbackPct}% cashback · {t.benefits.rewardMultiplier}× rewards</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-1.5 text-[12px] font-medium text-fg-secondary">Withdrawal priority</div>
                  <Select value={t.benefits.withdrawalPerk} onChange={(v) => patchTier(t.id, (b) => ({ ...b, withdrawalPerk: v }))} options={WITHDRAWAL_PERKS} />
                </div>
                <div className="flex items-end pb-1">
                  <Toggle checked={t.benefits.vipManager} onChange={(v) => patchTier(t.id, (b) => ({ ...b, vipManager: v }))} label="Dedicated VIP manager" desc="Assign a named account host" />
                </div>
                <div className="col-span-2">
                  <div className="mb-1.5 text-[12px] font-medium text-fg-secondary">Bonus perks</div>
                  <TagSelect options={BONUS_PERKS} selected={t.benefits.perks} onToggle={(p) => patchTier(t.id, (b) => ({ ...b, perks: b.perks.includes(p) ? b.perks.filter((x) => x !== p) : [...b.perks, p] }))} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
