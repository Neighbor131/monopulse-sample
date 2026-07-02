import { useMemo, useState } from 'react';
import { Wallet, Percent, CalendarClock, ShieldAlert, ShieldCheck, Megaphone, Plus, X, Send, Check, TrendingUp, Info } from 'lucide-react';
import { Section, Field, Select, Toggle, TagSelect } from '../builder/form';
import { fmtMoney, fmtNum } from '../../data/campaigns';
import {
  CB_MODEL_META, PAYOUT_FREQ, JURISDICTIONS, TIER_VAR, CASHBACK_APPROVAL_THRESHOLD,
  cbTierPerPlayer, cbTierCost, cbLiability, cbComplianceWarnings,
} from '../../data/loyalty';
import type { CashbackConfig, CashbackModel, CashbackTierRate } from '../../data/loyalty';

const MODELS: CashbackModel[] = ['net_loss', 'turnover_rakeback', 'ggr_rakeback'];

export default function CashbackPanel({ configs, onSave }: { configs: CashbackConfig[]; onSave: (msg: string) => void }) {
  const [list, setList] = useState<CashbackConfig[]>(configs);
  const [selId, setSelId] = useState(configs[0]?.id ?? '');
  const cfg = list.find((c) => c.id === selId) ?? list[0];

  const patch = (fn: (c: CashbackConfig) => CashbackConfig) => setList((prev) => prev.map((c) => (c.id === cfg.id ? fn(c) : c)));
  const liab = useMemo(() => cbLiability(cfg), [cfg]);
  const overThreshold = liab >= CASHBACK_APPROVAL_THRESHOLD;
  const warnings = useMemo(() => cbComplianceWarnings(cfg), [cfg]);

  return (
    <div className="grid grid-cols-[248px_1fr] gap-5">
      {/* Program rail */}
      <div className="flex flex-col gap-2">
        <div className="px-1 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Configured programs</div>
        {list.map((c) => {
          const on = c.id === cfg.id;
          const l = cbLiability(c);
          return (
            <button key={c.id} onClick={() => setSelId(c.id)} className="rounded-lg border px-3 py-2.5 text-left transition-colors"
              style={{ borderColor: on ? 'var(--accent-border)' : 'var(--border-subtle)', background: on ? 'var(--accent-bg)' : 'var(--surface-1)' }}>
              <div className="truncate text-[12.5px] font-medium text-fg-primary">{c.programName}</div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="rounded px-1.5 py-0.5 text-[9.5px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{CB_MODEL_META[c.model].short}</span>
                <span className="font-mono text-[10.5px] tabular-nums" style={{ color: l >= CASHBACK_APPROVAL_THRESHOLD ? 'var(--warning)' : 'var(--fg-muted)' }}>{fmtMoney(l, 'EUR')}/mo</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <div className="flex flex-col gap-4">
        {/* Model */}
        <Section icon={Wallet} title="Cashback model" desc="How the rebate basis is calculated for this program. Switching model re-bases the liability estimate.">
          <div className="grid grid-cols-3 gap-2.5">
            {MODELS.map((m) => {
              const on = cfg.model === m;
              const meta = CB_MODEL_META[m];
              return (
                <button key={m} onClick={() => patch((c) => ({ ...c, model: m }))} className="rounded-lg border p-3 text-left transition-colors"
                  style={{ borderColor: on ? 'var(--accent)' : 'var(--border-strong)', background: on ? 'var(--accent-bg)' : 'var(--surface-2)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-fg-primary">{meta.label}</span>
                    {on && <Check size={14} style={{ color: 'var(--accent)' }} strokeWidth={2.5} />}
                  </div>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-fg-secondary">{meta.desc}</p>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Rate matrix */}
        <Section icon={Percent} title="Rate matrix by tier"
          desc={`Rate applied to each player’s ${CB_MODEL_META[cfg.model].basisWord} per ${cfg.payoutFrequency.toLowerCase()} payout.`}
          aside={<span className="rounded-md px-2 py-1 text-[11px] font-medium" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{cfg.tiers.length} tiers</span>}>
          <div className="overflow-hidden rounded-lg border" style={{ borderColor: 'var(--border-subtle)' }}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-2)' }}>
                  <th className="px-3 py-2 font-semibold">Tier</th>
                  <th className="px-3 py-2 font-semibold">Rate</th>
                  <th className="px-3 py-2 text-right font-semibold">Players</th>
                  <th className="px-3 py-2 text-right font-semibold">Avg {CB_MODEL_META[cfg.model].short.toLowerCase()} / player</th>
                  <th className="px-3 py-2 text-right font-semibold">Est. / player</th>
                  <th className="px-3 py-2 text-right font-semibold">Est. monthly</th>
                </tr>
              </thead>
              <tbody>
                {cfg.tiers.map((t, i) => {
                  const per = cbTierPerPlayer(t, cfg.model, cfg.maxPayoutCap);
                  const cost = cbTierCost(t, cfg.model, cfg.maxPayoutCap, cfg.minEligibility);
                  const capped = cfg.maxPayoutCap > 0 && (t.rate / 100) * t.basis > cfg.maxPayoutCap;
                  return (
                    <tr key={t.tier} className="border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: TIER_VAR[t.color] }} /><span className="text-[12.5px] font-medium text-fg-primary">{t.tier}</span></div>
                      </td>
                      <td className="px-3 py-2">
                        <RateCell value={t.rate} onChange={(v) => patch((c) => ({ ...c, tiers: c.tiers.map((x, j) => (j === i ? { ...x, rate: v } : x)) }))} />
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-[12px] tabular-nums text-fg-secondary">{fmtNum(t.players)}</td>
                      <td className="px-3 py-2 text-right font-mono text-[12px] tabular-nums text-fg-secondary">{fmtMoney(Math.round(t.basis), 'EUR')}</td>
                      <td className="px-3 py-2 text-right font-mono text-[12px] tabular-nums" style={{ color: capped ? 'var(--warning)' : 'var(--fg-secondary)' }}>{fmtMoney(Math.round(per), 'EUR')}{capped ? ' ⋯' : ''}</td>
                      <td className="px-3 py-2 text-right font-mono text-[12.5px] font-medium tabular-nums text-fg-primary">{fmtMoney(Math.round(cost), 'EUR')}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
                  <td className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-fg-muted" colSpan={5}>Estimated monthly liability</td>
                  <td className="px-3 py-2.5 text-right font-mono text-[13px] font-semibold tabular-nums" style={{ color: overThreshold ? 'var(--warning)' : 'var(--fg-primary)' }}>{fmtMoney(liab, 'EUR')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {cfg.maxPayoutCap > 0 && <p className="mt-2 flex items-center gap-1.5 text-[11px] text-fg-muted"><Info size={11} strokeWidth={2} /> ⋯ indicates per-player payout clipped by the {fmtMoney(cfg.maxPayoutCap, 'EUR')} cap.</p>}
        </Section>

        {/* Payout & eligibility */}
        <Section icon={CalendarClock} title="Payout & eligibility" desc="Frequency, per-player caps and the minimum activity a player must reach to earn a rebate.">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Payout frequency"><Select value={cfg.payoutFrequency} onChange={(v) => patch((c) => ({ ...c, payoutFrequency: v }))} options={PAYOUT_FREQ} /></Field>
            <Field label="Max payout cap" hint="per player / period">
              <NumField value={cfg.maxPayoutCap} onChange={(v) => patch((c) => ({ ...c, maxPayoutCap: v }))} prefix="€" placeholder="0 = uncapped" />
            </Field>
            <Field label="Minimum eligibility" hint={`min ${CB_MODEL_META[cfg.model].basisWord}`}>
              <NumField value={cfg.minEligibility} onChange={(v) => patch((c) => ({ ...c, minEligibility: v }))} prefix="€" />
            </Field>
          </div>
        </Section>

        {/* Exclusions */}
        <Section icon={ShieldAlert} title="Eligibility & exclusions" desc="Responsible-gambling and jurisdiction gates. Eligibility mirrors the audience filters in Campaign Builder.">
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border px-4 py-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
              <Toggle checked={cfg.rgAutoExclude} onChange={(v) => patch((c) => ({ ...c, rgAutoExclude: v }))}
                label="Auto-exclude players under RG review"
                desc="Players flagged for affordability or self-exclusion are automatically removed from cashback payouts and cannot be manually re-added." />
            </div>

            <Field label="Excluded jurisdictions" hint="rebates suppressed in these markets">
              <TagSelect options={JURISDICTIONS} selected={cfg.excludedJurisdictions}
                onToggle={(j) => patch((c) => ({ ...c, excludedJurisdictions: c.excludedJurisdictions.includes(j) ? c.excludedJurisdictions.filter((x) => x !== j) : [...c.excludedJurisdictions, j] }))} />
            </Field>

            <ExcludedPlayers cfg={cfg} patch={patch} />

            {/* Campaign Builder link */}
            <div className="rounded-lg border px-4 py-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-fg-muted"><Megaphone size={12} strokeWidth={2} /> Linked campaign reward rules</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {cfg.linkedCampaigns.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11.5px] font-medium text-fg-secondary" style={{ borderColor: 'var(--border-strong)' }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />{c}
                  </span>
                ))}
                {cfg.linkedCampaigns.length === 0 && <span className="text-[12px] text-fg-muted">No linked campaigns — cashback runs on program tier logic only.</span>}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-fg-muted">Reward rules from these campaigns top up this program’s cashback basis. Editing a campaign’s audience filters changes who qualifies here.</p>
            </div>
          </div>
        </Section>

        {/* Compliance checks */}
        <Section icon={ShieldAlert} title="Compliance checks" desc="Automated review of high-liability payout rules against responsible-gambling and approval policy.">
          {warnings.length === 0 ? (
            <div className="flex items-center gap-2.5 rounded-lg border px-4 py-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--status-live-bg)' }}>
              <ShieldCheck size={16} style={{ color: 'var(--success)' }} strokeWidth={2} />
              <span className="text-[12.5px] font-medium" style={{ color: 'var(--fg-primary)' }}>No compliance flags — payout rules are within policy.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {warnings.map((w, i) => {
                const crit = w.level === 'critical';
                const c = crit ? 'var(--danger)' : 'var(--warning)';
                const bg = crit ? 'var(--danger-bg)' : 'var(--warning-bg)';
                return (
                  <div key={i} className="flex items-start gap-3 rounded-lg border px-4 py-3" style={{ borderColor: crit ? 'rgba(240,87,107,0.4)' : 'rgba(231,168,60,0.4)', background: bg }}>
                    <ShieldAlert size={15} className="mt-0.5 shrink-0" style={{ color: c }} strokeWidth={2} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12.5px] font-semibold text-fg-primary">{w.title}</span>
                        <span className="rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide" style={{ color: c, background: 'var(--surface-1)' }}>{crit ? 'Critical' : 'Review'}</span>
                      </div>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-fg-secondary">{w.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* Liability preview + save */}
        <div className="rounded-xl border" style={{ borderColor: overThreshold ? 'rgba(231,168,60,0.4)' : 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'var(--surface-3)', color: overThreshold ? 'var(--warning)' : 'var(--success)' }}><TrendingUp size={18} strokeWidth={2} /></div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">Estimated monthly liability</div>
                <div className="font-mono text-[22px] font-semibold leading-none tabular-nums" style={{ color: overThreshold ? 'var(--warning)' : 'var(--fg-primary)' }}>{fmtMoney(liab, 'EUR')}</div>
              </div>
            </div>
            {/* tier contribution bar */}
            <div className="flex-1 px-2">
              <div className="flex h-2.5 overflow-hidden rounded-full" style={{ background: 'var(--surface-3)' }}>
                {cfg.tiers.map((t) => {
                  const cost = cbTierCost(t, cfg.model, cfg.maxPayoutCap, cfg.minEligibility);
                  return <div key={t.tier} style={{ width: `${(cost / (liab || 1)) * 100}%`, background: TIER_VAR[t.color] }} title={t.tier} />;
                })}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                {cfg.tiers.map((t) => <span key={t.tier} className="flex items-center gap-1 text-[10px] text-fg-muted"><span className="h-1.5 w-1.5 rounded-full" style={{ background: TIER_VAR[t.color] }} />{t.tier}</span>)}
              </div>
            </div>
          </div>

          {overThreshold && (
            <div className="flex items-start gap-2.5 border-t px-5 py-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--warning-bg)' }}>
              <ShieldAlert size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--warning)' }} strokeWidth={2} />
              <p className="text-[12px] text-fg-secondary">Projected liability exceeds the {fmtMoney(CASHBACK_APPROVAL_THRESHOLD, 'EUR')} threshold — rate changes must be <span className="font-medium text-fg-primary">approved by a Casino Manager</span> before they take effect.</p>
            </div>
          )}

          <div className="flex items-center justify-between border-t px-5 py-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-[11.5px] text-fg-muted">Owner {cfg.owner} · updated {cfg.updatedAt}</span>
            <div className="flex items-center gap-2.5">
              <button onClick={() => onSave(`Saved as draft — ${cfg.programName}`)} className="rounded-md border px-4 py-2 text-[13px] font-medium transition-colors" style={{ borderColor: 'var(--border-strong)', color: 'var(--fg-secondary)' }}>Save draft</button>
              <button onClick={() => onSave(overThreshold ? `Sent for approval — ${cfg.programName}` : `Cashback config published — ${cfg.programName}`)}
                className="flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold transition-colors" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                {overThreshold ? <Send size={15} strokeWidth={2} /> : <Check size={15} strokeWidth={2.25} />} {overThreshold ? 'Submit for approval' : 'Publish changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RateCell({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-md border px-2 py-1" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
      <input value={value} onChange={(e) => onChange(Math.max(0, Math.min(100, Number(e.target.value.replace(/[^0-9.]/g, '')) || 0)))}
        className="w-10 bg-transparent text-right font-mono text-[12.5px] tabular-nums outline-none" style={{ color: 'var(--fg-primary)' }} />
      <span className="text-[12px] text-fg-muted">%</span>
    </div>
  );
}

function NumField({ value, onChange, prefix, placeholder }: { value: number; onChange: (v: number) => void; prefix?: string; placeholder?: string }) {
  return (
    <div className="flex items-center rounded-md border px-3" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
      {prefix && <span className="mr-1.5 text-[13px] text-fg-muted">{prefix}</span>}
      <input value={value === 0 ? '' : value} placeholder={placeholder} onChange={(e) => onChange(Math.max(0, Number(e.target.value.replace(/[^0-9]/g, '')) || 0))}
        className="w-full bg-transparent py-2 font-mono text-[13px] tabular-nums outline-none" style={{ color: 'var(--fg-primary)' }} />
    </div>
  );
}

function ExcludedPlayers({ cfg, patch }: { cfg: CashbackConfig; patch: (fn: (c: CashbackConfig) => CashbackConfig) => void }) {
  const [id, setId] = useState('');
  const add = () => {
    const v = id.trim();
    if (!v) return;
    patch((c) => ({ ...c, excludedPlayers: [...c.excludedPlayers, { id: v.toUpperCase(), alias: 'Manual exclusion', reason: 'Manually excluded from cashback' }] }));
    setId('');
  };
  return (
    <Field label="Excluded players" hint="manual overrides on top of RG auto-exclusion">
      <div className="flex flex-col gap-2">
        {cfg.excludedPlayers.map((p) => (
          <div key={p.id} className="flex items-center gap-2.5 rounded-md border px-3 py-2" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
            <span className="flex h-6 w-6 items-center justify-center rounded" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}><ShieldAlert size={12} strokeWidth={2.25} /></span>
            <span className="font-mono text-[12px] text-fg-primary">{p.id}</span>
            <span className="text-[12px] text-fg-secondary">{p.alias}</span>
            <span className="truncate text-[11px] text-fg-muted">· {p.reason}</span>
            <button onClick={() => patch((c) => ({ ...c, excludedPlayers: c.excludedPlayers.filter((x) => x.id !== p.id) }))} className="ml-auto shrink-0 text-fg-muted transition-colors hover:text-fg-primary"><X size={14} strokeWidth={2} /></button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center rounded-md border px-3" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
            <input value={id} onChange={(e) => setId(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add(); }} placeholder="Add player ID, e.g. PLR-00000"
              className="w-full bg-transparent py-2 font-mono text-[12.5px] outline-none" style={{ color: 'var(--fg-primary)' }} />
          </div>
          <button onClick={add} className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-[12.5px] font-medium text-fg-secondary transition-colors" style={{ borderColor: 'var(--border-strong)' }}><Plus size={14} strokeWidth={2.25} /> Exclude</button>
        </div>
      </div>
    </Field>
  );
}
