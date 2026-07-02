import { useState } from 'react';
import { Percent, SlidersHorizontal, TrendingUp } from 'lucide-react';
import type { DraftProgram, CashbackModel, PayoutFrequency } from '../../data/programDraft';
import { CASHBACK_MODEL_META, tierLiability, monthlyLiability } from '../../data/programDraft';
import { Section, Field, TagSelect } from '../builder/form';
import { TIER_VAR, SEGMENTS } from '../../data/loyalty';

const MODELS: CashbackModel[] = ['net_loss', 'turnover', 'ggr'];
const FREQS: { v: PayoutFrequency; l: string }[] = [{ v: 'daily', l: 'Daily' }, { v: 'weekly', l: 'Weekly' }, { v: 'monthly', l: 'Monthly' }];
const fmt = (n: number) => '€' + Math.round(n).toLocaleString();

function MoneyInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [focus, setFocus] = useState(false);
  return (
    <div className="flex items-center rounded-md border px-3" style={{ borderColor: focus ? 'var(--accent)' : 'var(--border-strong)', background: 'var(--surface-2)' }}>
      <span className="mr-1 text-[13px] text-fg-muted">€</span>
      <input
        value={value === 0 ? '' : String(value)}
        placeholder="0"
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onChange={(e) => { const r = e.target.value.replace(/[^0-9]/g, ''); onChange(r === '' ? 0 : parseInt(r, 10)); }}
        className="w-full bg-transparent py-2 font-mono text-[13px] tabular-nums outline-none"
        style={{ color: 'var(--fg-primary)' }}
      />
    </div>
  );
}

export default function CashbackConfig({ draft, onUpdate }: { draft: DraftProgram; onUpdate: (patch: Partial<DraftProgram>) => void }) {
  const { cashback, tiers } = draft;
  const setCB = (p: Partial<typeof cashback>) => onUpdate({ cashback: { ...cashback, ...p } });
  const setRate = (id: string, pct: number) =>
    onUpdate({ tiers: tiers.map((t) => (t.id === id ? { ...t, benefits: { ...t.benefits, cashbackPct: pct } } : t)) });
  const total = monthlyLiability(draft);
  const maxTierLiab = Math.max(1, ...tiers.map((t, i) => tierLiability(t, i, cashback.model)));
  const maxRate = Math.max(1, ...tiers.map((t) => t.benefits.cashbackPct));
  const meta = CASHBACK_MODEL_META[cashback.model];

  return (
    <div className="flex flex-col gap-5">
      {/* model */}
      <Section icon={Percent} title="Cashback model" desc="Choose the metric the payout is calculated from.">
        <div className="grid grid-cols-3 gap-2.5">
          {MODELS.map((m) => {
            const on = cashback.model === m;
            const mm = CASHBACK_MODEL_META[m];
            return (
              <button
                key={m}
                onClick={() => setCB({ model: m })}
                className="flex flex-col gap-1 rounded-lg border px-3.5 py-3 text-left transition-colors"
                style={on ? { borderColor: 'var(--accent-border)', background: 'var(--accent-bg)' } : { borderColor: 'var(--border-strong)' }}
              >
                <span className="text-[13px] font-semibold" style={{ color: on ? 'var(--accent)' : 'var(--fg-primary)' }}>{mm.label}</span>
                <span className="text-[11.5px] leading-relaxed text-fg-muted">{mm.desc}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* rate matrix */}
      <Section icon={SlidersHorizontal} title="Rate matrix" desc={`Cashback rate applied to each tier’s ${meta.metric}.`}>
        <div className="flex flex-col">
          {tiers.map((t) => (
            <div key={t.id} className="flex items-center gap-3 border-b py-2 last:border-0" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: TIER_VAR[t.color] }} />
              <span className="w-28 shrink-0 text-[12.5px] font-medium text-fg-primary">{t.name}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--surface-3)' }}>
                <div className="h-full rounded-full" style={{ width: `${(t.benefits.cashbackPct / maxRate) * 100}%`, background: TIER_VAR[t.color] }} />
              </div>
              <div className="flex w-20 shrink-0 items-center rounded-md border px-2" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
                <input
                  value={t.benefits.cashbackPct === 0 ? '' : String(t.benefits.cashbackPct)}
                  placeholder="0"
                  onChange={(e) => { const r = e.target.value.replace(/[^0-9.]/g, ''); setRate(t.id, r === '' ? 0 : parseFloat(r) || 0); }}
                  className="w-full bg-transparent py-1.5 text-right font-mono text-[12.5px] tabular-nums outline-none"
                  style={{ color: 'var(--fg-primary)' }}
                />
                <span className="ml-0.5 text-[11px] text-fg-muted">%</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* payout settings */}
      <Section icon={SlidersHorizontal} title="Payout & eligibility">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-1.5 text-[12.5px] font-medium text-fg-secondary">Payout frequency</div>
            <div className="flex overflow-hidden rounded-md border" style={{ borderColor: 'var(--border-strong)' }}>
              {FREQS.map((f) => (
                <button
                  key={f.v}
                  onClick={() => setCB({ payoutFrequency: f.v })}
                  className="flex-1 px-2 py-2 text-[12px] font-medium transition-colors"
                  style={cashback.payoutFrequency === f.v ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { background: 'var(--surface-1)', color: 'var(--fg-secondary)' }}
                >
                  {f.l}
                </button>
              ))}
            </div>
          </div>
          <Field label="Max payout cap" hint="per player, per period">
            <MoneyInput value={cashback.maxPayoutCap} onChange={(n) => setCB({ maxPayoutCap: n })} />
          </Field>
          <Field label="Minimum eligibility" hint={`min ${meta.metric} to qualify`}>
            <MoneyInput value={cashback.minEligibility} onChange={(n) => setCB({ minEligibility: n })} />
          </Field>
          <div>
            <div className="mb-1.5 text-[12.5px] font-medium text-fg-secondary">Excluded segments</div>
            <TagSelect options={SEGMENTS} selected={cashback.excludedSegments} onToggle={(s) => setCB({ excludedSegments: cashback.excludedSegments.includes(s) ? cashback.excludedSegments.filter((x) => x !== s) : [...cashback.excludedSegments, s] })} />
          </div>
        </div>
      </Section>

      {/* liability preview */}
      <Section icon={TrendingUp} title="Projected liability" desc="Estimated monthly payout across the projected player base." aside={
        <div className="text-right">
          <div className="font-mono text-[18px] font-semibold tabular-nums" style={{ color: total >= 250000 ? 'var(--danger)' : 'var(--accent)' }}>{fmt(total)}</div>
          <div className="text-[10.5px] uppercase tracking-wider text-fg-muted">per month</div>
        </div>
      }>
        <div className="flex flex-col gap-2">
          {tiers.map((t, i) => {
            const l = tierLiability(t, i, cashback.model);
            return (
              <div key={t.id} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-[12px] text-fg-secondary">{t.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--surface-3)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(l / maxTierLiab) * 100}%`, background: TIER_VAR[t.color] }} />
                </div>
                <span className="w-24 shrink-0 text-right font-mono text-[11.5px] tabular-nums text-fg-muted">{fmt(l)}</span>
                <span className="w-16 shrink-0 text-right font-mono text-[11px] tabular-nums text-fg-muted">{t.estPlayers.toLocaleString()}p</span>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
