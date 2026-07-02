import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, X, ChevronRight } from 'lucide-react';
import {
  CAMPAIGN_TYPES,
  TYPE_GROUPS,
  getType,
  getSubtypes,
} from '../data/campaigns';
import type { CampaignType, CampaignTypeId, CampaignSubtype } from '../data/campaigns';
import { useCampaign } from '../context/CampaignContext';

function complexityColor(c: CampaignType['complexity']): string {
  if (c === 'Low') return 'var(--success)';
  if (c === 'Medium') return 'var(--warning)';
  return 'var(--status-scheduled)';
}

type Phase = 'type' | 'subtype';

const REQUIREMENTS: Record<CampaignTypeId, { title: string; items: string[]; risk: string }> = {
  mission: { title: 'Mission requirements', items: ['Task sequence and completion logic', 'Progress state and expiry behavior', 'Reward trigger per completed step'], risk: 'Avoid unclear partial-completion states.' },
  race: { title: 'Race requirements', items: ['Scoring metric and tie breaker', 'Leaderboard visibility and update cadence', 'Prize table and settlement grace period'], risk: 'Leaderboard disputes need audit snapshots.' },
  prizedrop: { title: 'Prize drop requirements', items: ['Drop trigger: time, count, event or provider signal', 'Randomness / seed evidence', 'Retry behavior for failed grants'], risk: 'Random rewards need visible fairness and audit trail.' },
  raffle: { title: 'Raffle requirements', items: ['Ticket earning rules', 'Draw schedule and winner count', 'Winner seed and compliance evidence'], risk: 'Users must understand ticket accumulation and draw state.' },
  jackpot: { title: 'Jackpot requirements', items: ['Pool contribution, seed and cap', 'Eligible brands and jurisdictions', 'Winner validation and high-value payout approval'], risk: 'Cross-brand pooled money is the highest governance surface.' },
  survival: { title: 'Survival requirements', items: ['Entry lock and elimination rule', 'Survivor count and reveal cadence', 'Final settlement and prize split'], risk: 'Elimination states must be explainable to support.' },
  velocity: { title: 'Velocity requirements', items: ['Countdown window', 'Threshold event count or wager amount', 'Expiry and anti-abuse checks'], risk: 'High-speed activity can look like abuse without guardrails.' },
  achievement: { title: 'Achievement requirements', items: ['Unlock rule and hidden/visible state', 'Badge inventory and progression', 'One-time vs repeat reward'], risk: 'Long-term progression needs durable state history.' },
  rakeback: { title: 'Rakeback requirements', items: ['Rate matrix by tier/game/provider', 'Loss/wager calculation window', 'Per-player caps and approval threshold'], risk: 'Cashback touches wallet, liability and fraud controls.' },
};

export default function CampaignTypePicker() {
  const navigate = useNavigate();
  const { setType } = useCampaign();
  const [phase, setPhase] = useState<Phase>('type');
  const [selected, setSelected] = useState<CampaignTypeId | null>(null);
  const [subtype, setSubtype] = useState<string>('');

  const chosen = selected ? getType(selected) : null;
  const ChosenIcon = chosen?.icon;
  const subtypes = getSubtypes(selected);
  const hasSubtypes = subtypes.length > 0;

  const selectType = (id: CampaignTypeId) => {
    setSelected(id);
    setSubtype('');
    if (getSubtypes(id).length > 0) setPhase('subtype');
  };

  const canProceed = !!selected && (!hasSubtypes || !!subtype);

  const proceed = () => {
    if (!canProceed || !selected) return;
    setType(selected, subtype);
    navigate('/builder/setup');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mx-auto w-full max-w-[1120px] flex-1 px-8 py-7">
        {/* Back */}
        <button
          onClick={() => (phase === 'subtype' ? setPhase('type') : navigate('/'))}
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-secondary transition-colors hover:text-fg-primary"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          {phase === 'subtype' ? 'Back to campaign types' : 'Back to campaigns'}
        </button>

        {phase === 'type' ? (
          <>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
              New campaign · Step 1 · Type
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight">Choose a campaign type</h1>
            <p className="mt-1 text-[13px] text-fg-secondary">
              The type defines the mechanic, the rules you configure, and how rewards are earned. You can't change it later.
            </p>

            <div className="mt-7 grid grid-cols-[1fr_320px] gap-5">
              <div className="flex flex-col gap-7">
                {TYPE_GROUPS.map((group) => {
                  const types = CAMPAIGN_TYPES.filter((t) => t.group === group.id);
                  return (
                    <section key={group.id}>
                      <div className="mb-3 flex items-baseline gap-2.5">
                        <h2 className="text-[13px] font-semibold text-fg-primary">{group.label}</h2>
                        <span className="text-[12px] text-fg-muted">{group.hint}</span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {types.map((t) => (
                          <TypeCard key={t.id} type={t} selected={selected === t.id} onSelect={() => selectType(t.id)} />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
              <RequirementRail type={chosen} />
            </div>
          </>
        ) : (
          <>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
              New campaign · Step 1 · Subtype
            </div>
            <div className="flex items-center gap-2.5">
              {ChosenIcon && (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                  <ChosenIcon size={18} strokeWidth={1.75} />
                </div>
              )}
              <h1 className="text-[22px] font-semibold tracking-tight">{chosen?.name} · choose a subtype</h1>
            </div>
            <p className="mt-1.5 text-[13px] text-fg-secondary">
              The subtype fine-tunes the mechanic and the rule set you'll configure next.
            </p>

            <div className="mt-7 grid grid-cols-[1fr_320px] gap-5">
              <div className="grid grid-cols-1 gap-3">
                {subtypes.map((s) => (
                  <SubtypeCard key={s.id} subtype={s} selected={subtype === s.id} onSelect={() => setSubtype(s.id)} />
                ))}
              </div>
              <RequirementRail type={chosen} />
            </div>
          </>
        )}
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 border-t" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}>
        <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between px-8 py-3.5">
          <div className="text-[13px]">
            {chosen ? (
              <span className="flex items-center gap-1.5 text-fg-secondary">
                <span className="font-medium text-fg-primary">{chosen.name}</span>
                {subtype && (
                  <>
                    <ChevronRight size={14} className="text-fg-muted" strokeWidth={2} />
                    <span className="font-medium text-fg-primary">{subtypes.find((s) => s.id === subtype)?.name}</span>
                  </>
                )}
                {hasSubtypes && !subtype && <span className="text-fg-muted">· pick a subtype</span>}
              </span>
            ) : (
              <span className="text-fg-muted">Select a campaign type to continue</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-[13px] font-medium text-fg-secondary transition-colors"
              style={{ borderColor: 'var(--border-strong)' }}
            >
              <X size={15} strokeWidth={2} />
              Cancel
            </button>
            <button
              onClick={proceed}
              disabled={!canProceed}
              className="flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold transition-colors"
              style={
                canProceed
                  ? { background: 'var(--accent)', color: 'var(--accent-fg)' }
                  : { background: 'var(--surface-3)', color: 'var(--fg-muted)', cursor: 'not-allowed' }
              }
            >
              Continue to builder
              <ArrowRight size={15} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequirementRail({ type }: { type: CampaignType | null }) {
  if (!type) {
    return (
      <aside className="sticky top-6 h-fit rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Requirement preview</div>
        <p className="mt-3 text-[12.5px] leading-5 text-fg-secondary">Select a campaign type to see the rule moments, data dependencies and risk surfaces this flow needs to cover.</p>
      </aside>
    );
  }
  const req = REQUIREMENTS[type.id];
  return (
    <aside className="sticky top-6 h-fit rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">{req.title}</div>
      <div className="mt-3 flex flex-col gap-2">
        {req.items.map((item) => <div key={item} className="flex items-start gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--surface-2)' }}><Check size={13} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} /><span className="text-[12.5px] leading-5 text-fg-secondary">{item}</span></div>)}
      </div>
      <div className="mt-3 rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--warning)', background: 'var(--warning-bg)' }}>
        <div className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: 'var(--warning)' }}>UX risk</div>
        <p className="mt-1 text-[12px] leading-5 text-fg-secondary">{req.risk}</p>
      </div>
    </aside>
  );
}

function TypeCard({ type, selected, onSelect }: { type: CampaignType; selected: boolean; onSelect: () => void }) {
  const Icon = type.icon;
  return (
    <button
      onClick={onSelect}
      className="group relative flex flex-col rounded-xl border p-4 text-left transition-colors"
      style={{
        background: selected ? 'var(--accent-bg)' : 'var(--surface-1)',
        borderColor: selected ? 'var(--accent-border)' : 'var(--border-subtle)',
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
    >
      {selected && (
        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
          <Check size={13} strokeWidth={3} />
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: selected ? 'var(--accent)' : 'var(--surface-3)', color: selected ? 'var(--accent-fg)' : 'var(--fg-secondary)' }}>
          <Icon size={19} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 pr-6">
          <div className="text-[14px] font-semibold text-fg-primary">{type.name}</div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-fg-secondary">{type.description}</p>
        </div>
      </div>
      <div className="mt-3.5 flex items-center gap-4 border-t pt-3 text-[11.5px]" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex flex-col gap-0.5">
          <span className="text-fg-muted">Best for</span>
          <span className="font-medium text-fg-secondary">{type.bestFor}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-fg-muted">Complexity</span>
          <span className="inline-flex items-center gap-1.5 font-medium text-fg-secondary">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: complexityColor(type.complexity) }} />
            {type.complexity}
          </span>
        </div>
        {type.subtypes && (
          <div className="ml-auto flex items-center gap-1 text-fg-muted">
            {type.subtypes.length} subtypes <ChevronRight size={13} strokeWidth={2} />
          </div>
        )}
      </div>
    </button>
  );
}

function SubtypeCard({ subtype, selected, onSelect }: { subtype: CampaignSubtype; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="relative flex items-start gap-3 rounded-xl border p-4 text-left transition-colors"
      style={{
        background: selected ? 'var(--accent-bg)' : 'var(--surface-1)',
        borderColor: selected ? 'var(--accent-border)' : 'var(--border-subtle)',
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
    >
      <span
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
        style={selected ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { border: '1px solid var(--border-strong)' }}
      >
        {selected && <Check size={11} strokeWidth={3} />}
      </span>
      <div>
        <div className="text-[13.5px] font-semibold text-fg-primary">{subtype.name}</div>
        <p className="mt-0.5 text-[12px] leading-relaxed text-fg-secondary">{subtype.desc}</p>
      </div>
    </button>
  );
}
