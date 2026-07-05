import { useState } from 'react';
import {
  GitBranch, Plus, Trash2, Check, AlertTriangle, Zap, Loader, TrendingUp, Coins, X,
  Workflow, ShieldCheck, ListChecks,
} from 'lucide-react';
import { Section, Select } from '../../components/builder/form';
import ModuleSections from '../../components/builder/ModuleFields';
import { useCampaign, newRule, newCondition } from '../../context/CampaignContext';
import type { Rule, RuleCondition } from '../../context/CampaignContext';
import { getType, getSubtype, fmtNum, fmtMoney } from '../../data/campaigns';
import {
  TIERS, COUNTRIES, RULE_EVENTS, CONDITION_FIELDS, CONDITION_OPS,
  RULE_ACTIONS, actionUnit, ruleErrors, ruleSummary, testRules,
} from '../../data/validation';
import type { RuleTest } from '../../data/validation';

const MODES = ['Single trigger', 'ANY trigger', 'ALL triggers', 'SEQUENCE'];
const HARD_GATES = ['RG exclusions', 'Fraud queue', 'Reversal/voided event guard', 'Idempotency key', 'Budget availability'];

function fieldOptions(field: string): string[] | null {
  switch (field) {
    case 'Game category': return ['Slots', 'Live casino', 'Table games', 'Sportsbook', 'Crash', 'Instant win'];
    case 'Game studio': return ['Pragmatic Play', 'NetEnt', 'Evolution', 'Hacksaw', "Play'n GO"];
    case 'Player tier': return TIERS;
    case 'Country': return COUNTRIES;
    case 'Sport': return ['Football', 'Tennis', 'Basketball', 'Horse racing', 'eSports'];
    default: return null;
  }
}

function fieldPrefix(field: string): string {
  if (field === 'Bet amount' || field === 'Deposit amount') return '€';
  if (field === 'Win multiplier') return '×';
  return '';
}

export default function StepLogic() {
  const { draft, update } = useCampaign();
  const type = draft.type ? getType(draft.type) : null;
  const subtype = getSubtype(draft.type, draft.subtype);
  const [mode, setMode] = useState(MODES[0]);

  const setRules = (rules: Rule[]) => update({ rules });
  const addRule = () => setRules([...draft.rules, newRule()]);
  const removeRule = (id: string) => setRules(draft.rules.filter((r) => r.id !== id));
  const patchRule = (id: string, patch: Partial<Rule>) =>
    setRules(draft.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const addCondition = (ruleId: string) => {
    const r = draft.rules.find((x) => x.id === ruleId);
    if (r) patchRule(ruleId, { conditions: [...r.conditions, newCondition()] });
  };
  const patchCondition = (ruleId: string, condId: string, patch: Partial<RuleCondition>) => {
    const r = draft.rules.find((x) => x.id === ruleId);
    if (r) patchRule(ruleId, { conditions: r.conditions.map((c) => (c.id === condId ? { ...c, ...patch } : c)) });
  };
  const removeCondition = (ruleId: string, condId: string) => {
    const r = draft.rules.find((x) => x.id === ruleId);
    if (r) patchRule(ruleId, { conditions: r.conditions.filter((c) => c.id !== condId) });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[16px] font-semibold tracking-tight">Mission Logic</h2>
        <p className="mt-1 text-[13px] text-fg-secondary">
          Define what eligible players must do: WHEN an event happens, IF conditions match, THEN progress or outcome is applied
          {subtype ? <> for this <span className="font-medium text-fg-primary">{subtype.name}</span> {type?.name.toLowerCase()}</> : null}.
        </p>
      </div>

      <LogicToolbar mode={mode} onChange={setMode} />

      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-5">
        <div className="flex min-w-0 flex-col gap-5">
          <Section
            icon={GitBranch}
            title="WHEN / IF / THEN rules"
            desc="Rules are evaluated only after Audience Scope says the player is eligible."
            aside={<span className="rounded-md px-2 py-1 text-[11px] font-medium" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>ALL · ANY · NONE</span>}
          >
            <div className="flex flex-col gap-3">
              {draft.rules.length === 0 && (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center" style={{ borderColor: 'var(--border-strong)' }}>
                  <GitBranch size={20} className="text-fg-muted" strokeWidth={1.75} />
                  <p className="text-[13px] font-medium text-fg-primary">No mission rules yet</p>
                  <p className="max-w-sm text-[12px] text-fg-muted">Add a rule to define what a player must do to earn progress or complete the mission.</p>
                </div>
              )}

              {draft.rules.map((rule, i) => (
                <RuleCard
                  key={rule.id}
                  index={i}
                  rule={rule}
                  onPatch={(patch) => patchRule(rule.id, patch)}
                  onRemove={() => removeRule(rule.id)}
                  onAddCondition={() => addCondition(rule.id)}
                  onPatchCondition={(cid, patch) => patchCondition(rule.id, cid, patch)}
                  onRemoveCondition={(cid) => removeCondition(rule.id, cid)}
                />
              ))}

              <button
                onClick={addRule}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed py-2.5 text-[12.5px] font-medium text-fg-secondary transition-colors hover:text-fg-primary"
                style={{ borderColor: 'var(--border-strong)' }}
              >
                <Plus size={15} strokeWidth={2.25} /> Add mission rule
              </button>
            </div>
          </Section>

          <RuleTestPanel />
        </div>

        <aside className="sticky top-24 flex h-fit flex-col gap-4">
          <LogicRail mode={mode} />
          <ModuleSections step="logic" />
        </aside>
      </div>
    </div>
  );
}

function LogicToolbar({ mode, onChange }: { mode: string; onChange: (mode: string) => void }) {
  return (
    <div className="rounded-xl border px-4 py-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="grid grid-cols-[minmax(180px,240px)_1fr_auto] items-center gap-4">
        <div className="flex items-start gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ background: 'var(--surface-3)', color: 'var(--accent)' }}>
            <Workflow size={16} strokeWidth={1.9} />
          </span>
          <div>
            <div className="text-[13.5px] font-semibold text-fg-primary">Execution mode</div>
            <p className="mt-0.5 text-[12px] leading-5 text-fg-secondary">How event rules combine.</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {MODES.map((option) => (
            <button
              key={option}
              onClick={() => onChange(option)}
              className="min-h-9 rounded-md border px-2.5 text-center text-[12px] font-semibold transition-colors"
              style={mode === option ? { borderColor: 'var(--accent-border)', background: 'var(--accent-bg)', color: 'var(--fg-primary)' } : { borderColor: 'var(--border-strong)', background: 'var(--surface-2)', color: 'var(--fg-secondary)' }}
            >
              {option}
            </button>
          ))}
        </div>
        <span className="rounded-md px-2 py-1 text-[11px] font-semibold whitespace-nowrap" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
          Tech doc v1.0
        </span>
      </div>
    </div>
  );
}

function RuleCard({
  index, rule, onPatch, onRemove, onAddCondition, onPatchCondition, onRemoveCondition,
}: {
  index: number;
  rule: Rule;
  onPatch: (patch: Partial<Rule>) => void;
  onRemove: () => void;
  onAddCondition: () => void;
  onPatchCondition: (cid: string, patch: Partial<RuleCondition>) => void;
  onRemoveCondition: (cid: string) => void;
}) {
  const errors = ruleErrors(rule);
  const valid = errors.length === 0;
  const unit = actionUnit(rule.thenAction);

  return (
    <div className="rounded-lg border" style={{ borderColor: valid ? 'var(--border-subtle)' : 'rgba(231,168,60,0.4)', background: 'var(--surface-1)' }}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[10.5px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{index + 1}</span>
          <span className="truncate text-[12.5px] font-medium text-fg-primary">{ruleSummary(rule)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-semibold"
            style={valid ? { color: 'var(--success)', background: 'var(--status-live-bg)' } : { color: 'var(--warning)', background: 'var(--warning-bg)' }}
          >
            {valid ? <Check size={11} strokeWidth={2.5} /> : <AlertTriangle size={11} strokeWidth={2.5} />}
            {valid ? 'Valid' : `${errors.length} to fix`}
          </span>
          <button onClick={onRemove} className="text-fg-muted transition-colors hover:text-fg-primary"><Trash2 size={14} strokeWidth={2} /></button>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <ClauseRow tag="WHEN" tagColor="var(--accent)">
          <div className="flex-1">
            <Select value={rule.when} onChange={(v) => onPatch({ when: v })} options={RULE_EVENTS} placeholder="Select the event that fires this rule..." />
          </div>
        </ClauseRow>

        <ClauseRow tag="IF" tagColor="var(--status-scheduled)" align="start">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
              <ListChecks size={12} strokeWidth={2} /> Match ALL conditions in this group
            </div>
            {rule.conditions.length === 0 && (
              <span className="text-[12px] text-fg-muted">No conditions. The rule fires on every {rule.when ? rule.when.toLowerCase() : 'event'} for eligible audience members.</span>
            )}
            {rule.conditions.map((c) => {
              const opts = fieldOptions(c.field);
              return (
                <div key={c.id} className="flex items-center gap-2">
                  <div className="w-40 shrink-0">
                    <Select value={c.field} onChange={(v) => onPatchCondition(c.id, { field: v, value: '' })} options={CONDITION_FIELDS} placeholder="Field..." />
                  </div>
                  <div className="w-24 shrink-0">
                    <Select value={c.op} onChange={(v) => onPatchCondition(c.id, { op: v })} options={CONDITION_OPS} />
                  </div>
                  <div className="flex-1">
                    {opts ? (
                      <Select value={c.value} onChange={(v) => onPatchCondition(c.id, { value: v })} options={opts} placeholder="Value..." />
                    ) : (
                      <MiniInput value={c.value} onChange={(v) => onPatchCondition(c.id, { value: v })} placeholder="Value" prefix={fieldPrefix(c.field)} />
                    )}
                  </div>
                  <button onClick={() => onRemoveCondition(c.id)} className="shrink-0 text-fg-muted transition-colors hover:text-fg-primary"><X size={14} strokeWidth={2} /></button>
                </div>
              );
            })}
            <div className="flex items-center gap-3">
              <button onClick={onAddCondition} className="flex w-fit items-center gap-1 text-[11.5px] font-medium" style={{ color: 'var(--accent)' }}>
                <Plus size={12} strokeWidth={2.5} /> Add condition
              </button>
              <button className="flex w-fit items-center gap-1 text-[11.5px] font-medium text-fg-secondary">
                <Plus size={12} strokeWidth={2.5} /> Add ANY/NONE group
              </button>
            </div>
          </div>
        </ClauseRow>

        <ClauseRow tag="THEN" tagColor="var(--success)">
          <div className="flex flex-1 items-center gap-2">
            <div className="flex-1">
              <Select value={rule.thenAction} onChange={(v) => onPatch({ thenAction: v })} options={RULE_ACTIONS} placeholder="Select an action..." />
            </div>
            {rule.thenAction && rule.thenAction !== 'Trigger prize drop' && (
              <div className="w-40 shrink-0">
                <MiniInput value={rule.thenValue} onChange={(v) => onPatch({ thenValue: v })} placeholder="Value" prefix={unit === '€' ? '€' : ''} suffix={unit && unit !== '€' && unit !== 'progress' ? unit : ''} />
              </div>
            )}
          </div>
        </ClauseRow>

        {!valid && (
          <div className="flex flex-col gap-1 rounded-md px-3 py-2" style={{ background: 'var(--warning-bg)' }}>
            {errors.map((e, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11.5px]" style={{ color: 'var(--fg-secondary)' }}>
                <AlertTriangle size={11} style={{ color: 'var(--warning)' }} strokeWidth={2.5} /> {e}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ClauseRow({ tag, tagColor, align = 'center', children }: { tag: string; tagColor: string; align?: 'center' | 'start'; children: React.ReactNode }) {
  return (
    <div className={`flex gap-3 ${align === 'start' ? 'items-start' : 'items-center'}`}>
      <span
        className="mt-0 flex w-14 shrink-0 items-center justify-center rounded py-1.5 font-mono text-[10.5px] font-bold tracking-wide"
        style={{ background: 'var(--surface-3)', color: tagColor }}
      >
        {tag}
      </span>
      {children}
    </div>
  );
}

function MiniInput({ value, onChange, placeholder, prefix, suffix }: { value: string; onChange: (v: string) => void; placeholder?: string; prefix?: string; suffix?: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
      {prefix && <span className="text-[12px] text-fg-muted">{prefix}</span>}
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent font-mono text-[12.5px] outline-none" />
      {suffix && <span className="text-[11px] text-fg-muted">{suffix}</span>}
    </div>
  );
}

function LogicRail({ mode }: { mode: string }) {
  const { draft } = useCampaign();
  const live = testRules(draft);
  const validRules = draft.rules.filter((r) => ruleErrors(r).length === 0).length;
  return (
    <>
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Evaluation preview</div>
        <div className="mt-3 flex flex-col gap-3">
          <RailMetric label="Mode" value={mode} />
          <RailMetric label="Valid rules" value={`${validRules}/${draft.rules.length}`} />
          <RailMetric label="Matched events" value={fmtNum(live.matchedEvents)} mono />
          <RailMetric label="Matched players" value={fmtNum(live.matchedPlayers)} mono />
        </div>
      </div>
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">
          <ShieldCheck size={13} strokeWidth={2} /> Invisible hard gates
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {HARD_GATES.map((gate) => (
            <div key={gate} className="flex items-center gap-2 text-[12px] text-fg-secondary">
              <Check size={13} strokeWidth={2.5} style={{ color: 'var(--success)' }} />
              {gate}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function RailMetric({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10.5px] font-medium uppercase tracking-wide text-fg-muted">{label}</div>
      <div className={`mt-0.5 text-[13px] font-semibold text-fg-primary ${mono ? 'font-mono tabular-nums' : ''}`}>{value}</div>
    </div>
  );
}

function RuleTestPanel() {
  const { draft } = useCampaign();
  const [state, setState] = useState<'idle' | 'running' | 'done'>('idle');
  const [result, setResult] = useState<RuleTest | null>(null);
  const live = testRules(draft);
  const canTest = draft.rules.some((r) => ruleErrors(r).length === 0) && live.matchedPlayers > 0;

  const run = () => {
    setState('running');
    setTimeout(() => { setResult(testRules(draft)); setState('done'); }, 950);
  };

  return (
    <div className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="flex items-center justify-between gap-3 border-b px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <TrendingUp size={15} strokeWidth={2} className="text-fg-secondary" />
          <h3 className="text-[13.5px] font-semibold text-fg-primary">Backtest & cost preview</h3>
        </div>
        <button
          onClick={run}
          disabled={!canTest || state === 'running'}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-colors"
          style={canTest && state !== 'running' ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { background: 'var(--surface-3)', color: 'var(--fg-muted)', cursor: 'not-allowed' }}
        >
          {state === 'running' ? <Loader size={14} className="animate-spin" strokeWidth={2} /> : <Zap size={14} strokeWidth={2} />}
          {state === 'running' ? 'Running...' : 'Test last 7 days'}
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3" style={{ borderColor: 'var(--accent-border)', background: 'var(--accent-bg)' }}>
          <div className="flex items-center gap-2">
            <Coins size={15} style={{ color: 'var(--accent)' }} strokeWidth={2} />
            <span className="text-[12.5px] font-medium text-fg-primary">Estimated reward cost after completion</span>
          </div>
          <div className="text-right">
            <div className="font-mono text-[18px] font-semibold leading-none tabular-nums text-fg-primary">
              {canTest ? fmtMoney(live.estimatedCost, draft.currency) : '-'}
            </div>
            <div className="mt-0.5 text-[11px] text-fg-muted">{canTest ? `~${fmtNum(live.projectedGrants)} projected completions` : 'add a valid rule to estimate'}</div>
          </div>
        </div>

        {state === 'done' && result && (
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
              <Check size={12} style={{ color: 'var(--success)' }} strokeWidth={2.5} /> Simulated against live event history
            </div>
            <div className="grid grid-cols-4 gap-3">
              <Metric label="Matching events" value={fmtNum(result.matchedEvents)} />
              <Metric label="Players triggered" value={fmtNum(result.matchedPlayers)} />
              <Metric label="Completions" value={fmtNum(result.projectedGrants)} />
              <Metric label="Reward cost" value={fmtMoney(result.estimatedCost, draft.currency)} accent />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <div className="text-[10.5px] font-medium text-fg-muted">{label}</div>
      <div className="mt-1 font-mono text-[15px] font-semibold tabular-nums" style={{ color: accent ? 'var(--accent)' : 'var(--fg-primary)' }}>{value}</div>
    </div>
  );
}
