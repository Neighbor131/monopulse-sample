import { Plus, Trash2, GitBranch, Check, AlertTriangle, X } from 'lucide-react';
import { useProgram } from '../../context/ProgramContext';
import { Select } from '../../components/builder/form';
import { RULE_WHEN, RULE_FIELDS, RULE_OPS, RULE_ACTIONS, newRule, newCondition, ruleErrors, ruleSummary } from '../../data/programDraft';
import type { ProgramRule, RuleCondition } from '../../data/programDraft';
import { TIER_NAMES } from '../../data/loyalty';

function fieldOptions(field: string): string[] | null {
  return field === 'Current tier' ? TIER_NAMES : null;
}
function fieldPrefix(field: string): string {
  return field.startsWith('Wager') || field.startsWith('Net loss') || field.startsWith('Deposits') ? '€' : '';
}
const ACTION_NEEDS_VALUE = (a: string) => a === 'Grant bonus credit' || a === 'Add loyalty points';

export default function StepRules() {
  const { draft, update } = useProgram();
  const rules = draft.rules;
  const setRules = (r: ProgramRule[]) => update({ rules: r });
  const patch = (id: string, fn: (r: ProgramRule) => ProgramRule) => setRules(rules.map((r) => (r.id === id ? fn(r) : r)));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold tracking-tight">Progression rules</h2>
          <p className="mt-1 text-[13px] text-fg-secondary">Optional automation on top of the tier thresholds — promote, demote, or reward when conditions are met.</p>
        </div>
        <span className="mt-1 shrink-0 rounded-md px-2 py-1 font-mono text-[10.5px] font-semibold tracking-wide" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>WHEN · IF · THEN</span>
      </div>

      {rules.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-1)' }}>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>
            <GitBranch size={20} strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-[13.5px] font-medium text-fg-primary">No custom rules</div>
            <p className="mt-0.5 max-w-sm text-[12.5px] text-fg-secondary">Tier thresholds already handle standard promotion at reset. Add rules only for special behaviour like accelerated promotions or bonus drops.</p>
          </div>
          <button onClick={() => setRules([newRule()])} className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            <Plus size={15} strokeWidth={2.25} /> Add a rule
          </button>
        </div>
      )}

      {rules.map((rule, ri) => (
        <RuleCard key={rule.id} index={ri} rule={rule}
          onPatch={(fn) => patch(rule.id, fn)}
          onRemove={() => setRules(rules.filter((r) => r.id !== rule.id))} />
      ))}

      {rules.length > 0 && (
        <button onClick={() => setRules([...rules, newRule()])} className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed py-2.5 text-[12.5px] font-medium text-fg-secondary transition-colors hover:text-fg-primary" style={{ borderColor: 'var(--border-strong)' }}>
          <Plus size={15} strokeWidth={2.25} /> Add rule
        </button>
      )}
    </div>
  );
}

function RuleCard({ index, rule, onPatch, onRemove }: { index: number; rule: ProgramRule; onPatch: (fn: (r: ProgramRule) => ProgramRule) => void; onRemove: () => void }) {
  const errors = ruleErrors(rule);
  const valid = errors.length === 0;
  const patchCond = (cid: string, fn: (c: RuleCondition) => RuleCondition) => onPatch((r) => ({ ...r, conditions: r.conditions.map((c) => (c.id === cid ? fn(c) : c)) }));

  return (
    <div className="rounded-lg border" style={{ borderColor: valid ? 'var(--border-subtle)' : 'rgba(231,168,60,0.4)', background: 'var(--surface-1)' }}>
      {/* header */}
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[10.5px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{index + 1}</span>
          <span className="truncate text-[12.5px] font-medium text-fg-primary">{ruleSummary(rule)}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-semibold" style={valid ? { color: 'var(--success)', background: 'var(--status-live-bg)' } : { color: 'var(--warning)', background: 'var(--warning-bg)' }}>
            {valid ? <Check size={11} strokeWidth={2.5} /> : <AlertTriangle size={11} strokeWidth={2.5} />}
            {valid ? 'Valid' : `${errors.length} to fix`}
          </span>
          <button onClick={onRemove} className="text-fg-muted transition-colors hover:text-fg-primary"><Trash2 size={14} strokeWidth={2} /></button>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {/* WHEN */}
        <ClauseRow tag="WHEN" tagColor="var(--accent)">
          <div className="flex-1">
            <Select value={rule.when} onChange={(v) => onPatch((r) => ({ ...r, when: v }))} options={RULE_WHEN} placeholder="Select the event that fires this rule…" />
          </div>
        </ClauseRow>

        {/* IF */}
        <ClauseRow tag="IF" tagColor="var(--status-scheduled)" align="start">
          <div className="flex flex-1 flex-col gap-2">
            {rule.conditions.length === 0 && (
              <span className="text-[12px] text-fg-muted">No conditions — fires on every {rule.when ? rule.when.toLowerCase() : 'event'}.</span>
            )}
            {rule.conditions.map((c) => {
              const opts = fieldOptions(c.field);
              return (
                <div key={c.id} className="flex items-center gap-2">
                  <div className="w-44 shrink-0">
                    <Select value={c.field} onChange={(v) => patchCond(c.id, (x) => ({ ...x, field: v, value: '' }))} options={RULE_FIELDS} placeholder="Field…" />
                  </div>
                  <div className="w-24 shrink-0">
                    <Select value={c.op} onChange={(v) => patchCond(c.id, (x) => ({ ...x, op: v }))} options={RULE_OPS} />
                  </div>
                  <div className="flex-1">
                    {opts ? (
                      <Select value={c.value} onChange={(v) => patchCond(c.id, (x) => ({ ...x, value: v }))} options={opts} placeholder="Value…" />
                    ) : (
                      <MiniInput value={c.value} onChange={(v) => patchCond(c.id, (x) => ({ ...x, value: v }))} placeholder="Value" prefix={fieldPrefix(c.field)} />
                    )}
                  </div>
                  <button onClick={() => onPatch((r) => ({ ...r, conditions: r.conditions.length > 1 ? r.conditions.filter((x) => x.id !== c.id) : r.conditions }))} className="shrink-0 text-fg-muted transition-colors hover:text-fg-primary"><X size={14} strokeWidth={2} /></button>
                </div>
              );
            })}
            <button onClick={() => onPatch((r) => ({ ...r, conditions: [...r.conditions, newCondition()] }))} className="flex w-fit items-center gap-1 text-[11.5px] font-medium" style={{ color: 'var(--accent)' }}>
              <Plus size={12} strokeWidth={2.5} /> Add condition
            </button>
          </div>
        </ClauseRow>

        {/* THEN */}
        <ClauseRow tag="THEN" tagColor="var(--success)">
          <div className="flex flex-1 items-center gap-2">
            <div className="flex-1">
              <Select value={rule.thenAction} onChange={(v) => onPatch((r) => ({ ...r, thenAction: v }))} options={RULE_ACTIONS} placeholder="Select an action…" />
            </div>
            {ACTION_NEEDS_VALUE(rule.thenAction) && (
              <div className="w-40 shrink-0">
                <MiniInput value={rule.thenValue} onChange={(v) => onPatch((r) => ({ ...r, thenValue: v }))} placeholder="Amount" prefix={rule.thenAction === 'Grant bonus credit' ? '€' : ''} suffix={rule.thenAction === 'Add loyalty points' ? 'pts' : ''} />
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
      <span className="flex w-14 shrink-0 items-center justify-center rounded py-1.5 font-mono text-[10.5px] font-bold tracking-wide" style={{ background: 'var(--surface-3)', color: tagColor }}>{tag}</span>
      {children}
    </div>
  );
}

function MiniInput({ value, onChange, placeholder, prefix, suffix }: { value: string; onChange: (v: string) => void; placeholder?: string; prefix?: string; suffix?: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
      {prefix && <span className="text-[12px] text-fg-muted">{prefix}</span>}
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent font-mono text-[12.5px] outline-none" style={{ color: 'var(--fg-primary)' }} />
      {suffix && <span className="text-[11px] text-fg-muted">{suffix}</span>}
    </div>
  );
}
