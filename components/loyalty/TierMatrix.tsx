import { useState } from 'react';
import { Plus, ArrowUp, ArrowDown, Trash2, AlertTriangle } from 'lucide-react';
import type { DraftTier, TierCriteria } from '../../data/programDraft';
import { CRITERIA_COLS, makeTier, tierWarnings } from '../../data/programDraft';
import type { TierColor } from '../../data/loyalty';
import { TIER_VAR } from '../../data/loyalty';

const COLORS: TierColor[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

function NumCell({ value, onChange, prefix, suffix, decimals, warn }: { value: number; onChange: (n: number) => void; prefix?: string; suffix?: string; decimals?: boolean; warn?: boolean }) {
  const [focus, setFocus] = useState(false);
  return (
    <div
      className="flex items-center rounded-md border px-2 py-1"
      style={{ borderColor: focus ? 'var(--accent)' : warn ? 'var(--warning)' : 'transparent', background: focus ? 'var(--surface-2)' : warn ? 'var(--warning-bg)' : 'transparent' }}
    >
      {prefix && <span className="mr-0.5 text-[11px] text-fg-muted">{prefix}</span>}
      <input
        value={value === 0 ? '' : String(value)}
        placeholder="0"
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onChange={(e) => {
          const raw = e.target.value.replace(decimals ? /[^0-9.]/g : /[^0-9]/g, '');
          onChange(raw === '' ? 0 : decimals ? parseFloat(raw) || 0 : parseInt(raw, 10));
        }}
        className="w-full bg-transparent text-right font-mono text-[12px] tabular-nums outline-none"
        style={{ color: warn && !focus ? 'var(--warning)' : 'var(--fg-primary)' }}
      />
      {suffix && <span className="ml-0.5 text-[11px] text-fg-muted">{suffix}</span>}
    </div>
  );
}

const HEAD = 'px-3 py-2 text-left text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted';

export default function TierMatrix({ tiers, onChange }: { tiers: DraftTier[]; onChange: (t: DraftTier[]) => void }) {
  const [mode, setMode] = useState<'entry' | 'maintain'>('entry');

  const patch = (id: string, fn: (t: DraftTier) => DraftTier) => onChange(tiers.map((t) => (t.id === id ? fn(t) : t)));
  const setCrit = (id: string, key: keyof TierCriteria, n: number) =>
    patch(id, (t) => ({ ...t, [mode]: { ...t[mode], [key]: n } }));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= tiers.length) return;
    const copy = [...tiers];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };
  const cycleColor = (id: string) =>
    patch(id, (t) => ({ ...t, color: COLORS[(COLORS.indexOf(t.color) + 1) % COLORS.length] }));

  const warnings = tierWarnings(tiers);
  const critFlag = (tierId: string, key: keyof TierCriteria) => warnings.some((w) => w.tierId === tierId && w.scope === mode && w.key === key);
  const cashFlag = (tierId: string) => warnings.some((w) => w.tierId === tierId && w.key === 'cashbackPct');
  const messages = Array.from(new Set(warnings.map((w) => w.message)));

  return (
    <div className="overflow-hidden rounded-lg border" style={{ borderColor: 'var(--border-strong)' }}>
      {/* toolbar */}
      <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <span className="text-[11.5px] text-fg-secondary">
          Editing <span className="font-medium text-fg-primary">{mode === 'entry' ? 'entry' : 'maintenance'}</span> thresholds
        </span>
        <div className="flex overflow-hidden rounded-md border" style={{ borderColor: 'var(--border-strong)' }}>
          {(['entry', 'maintain'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="px-2.5 py-1 text-[11.5px] font-medium transition-colors"
              style={mode === m ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { background: 'var(--surface-1)', color: 'var(--fg-secondary)' }}
            >
              {m === 'entry' ? 'Entry' : 'Maintain'}
            </button>
          ))}
        </div>
      </div>

      {messages.length > 0 && (
        <div className="flex items-start gap-2.5 border-b px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--warning-bg)' }}>
          <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--warning)' }} strokeWidth={2} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[11.5px] font-semibold" style={{ color: 'var(--warning)' }}>{messages.length} threshold {messages.length === 1 ? 'issue' : 'issues'} to review</span>
            {messages.slice(0, 3).map((m) => (
              <span key={m} className="text-[11.5px] leading-relaxed text-fg-secondary">{m}</span>
            ))}
            {messages.length > 3 && <span className="text-[11px] text-fg-muted">+{messages.length - 3} more</span>}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              <th className={`${HEAD} sticky left-0 z-10`} style={{ background: 'var(--surface-2)', minWidth: 176 }}>Tier</th>
              {CRITERIA_COLS.map((c) => (
                <th key={c.key} className={HEAD} style={{ minWidth: 104 }}>{c.label}</th>
              ))}
              <th className={HEAD} style={{ minWidth: 96 }}>Cashback</th>
              <th className={HEAD} style={{ minWidth: 96 }}>Reward ×</th>
              <th className={HEAD} style={{ width: 72 }} />
            </tr>
          </thead>
          <tbody>
            {tiers.map((t, i) => (
              <tr key={t.id} className="border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                {/* tier name + color */}
                <td className="sticky left-0 z-10 px-3 py-1.5" style={{ background: 'var(--surface-1)' }}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cycleColor(t.id)}
                      title="Change tier colour"
                      className="h-4 w-4 shrink-0 rounded-full ring-2 ring-offset-1"
                      style={{ background: TIER_VAR[t.color], ['--tw-ring-color' as string]: 'var(--surface-1)', ['--tw-ring-offset-color' as string]: 'var(--surface-1)' }}
                    />
                    <span className="w-4 text-[11px] tabular-nums text-fg-muted">{i + 1}</span>
                    <input
                      value={t.name}
                      onChange={(e) => patch(t.id, (x) => ({ ...x, name: e.target.value }))}
                      className="w-full min-w-0 rounded bg-transparent px-1 py-0.5 text-[12.5px] font-medium outline-none focus:bg-[var(--surface-2)]"
                      style={{ color: 'var(--fg-primary)' }}
                    />
                  </div>
                </td>
                {CRITERIA_COLS.map((c) => (
                  <td key={c.key} className="px-1 py-1">
                    <NumCell value={t[mode][c.key]} onChange={(n) => setCrit(t.id, c.key, n)} prefix={c.prefix} suffix={c.suffix} warn={critFlag(t.id, c.key)} />
                  </td>
                ))}
                <td className="px-1 py-1">
                  <NumCell value={t.benefits.cashbackPct} onChange={(n) => patch(t.id, (x) => ({ ...x, benefits: { ...x.benefits, cashbackPct: n } }))} suffix="%" warn={cashFlag(t.id)} />
                </td>
                <td className="px-1 py-1">
                  <NumCell value={t.benefits.rewardMultiplier} onChange={(n) => patch(t.id, (x) => ({ ...x, benefits: { ...x.benefits, rewardMultiplier: n } }))} suffix="×" decimals />
                </td>
                <td className="px-2 py-1">
                  <div className="flex items-center justify-end gap-0.5">
                    <IconBtn disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={13} strokeWidth={2} /></IconBtn>
                    <IconBtn disabled={i === tiers.length - 1} onClick={() => move(i, 1)}><ArrowDown size={13} strokeWidth={2} /></IconBtn>
                    <IconBtn disabled={tiers.length <= 2} onClick={() => onChange(tiers.filter((x) => x.id !== t.id))} danger><Trash2 size={13} strokeWidth={2} /></IconBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t px-3 py-2" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <button
          onClick={() => onChange([...tiers, makeTier(tiers.length)])}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium transition-colors hover:bg-[var(--surface-2)]"
          style={{ color: 'var(--accent)' }}
        >
          <Plus size={14} strokeWidth={2.25} /> Add tier
        </button>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, disabled, danger }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-6 w-6 items-center justify-center rounded transition-colors"
      style={disabled ? { color: 'var(--fg-muted)', opacity: 0.35, cursor: 'not-allowed' } : { color: danger ? 'var(--danger)' : 'var(--fg-secondary)' }}
    >
      {children}
    </button>
  );
}
