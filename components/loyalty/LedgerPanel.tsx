import { useState, useMemo } from 'react';
import { Zap, ArrowUpDown, Wallet, SlidersHorizontal, Clock, ChevronDown, Receipt, Megaphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { LEDGER_META, LEDGER_RANGES } from '../../data/loyalty';
import type { LedgerEntry, LedgerEventType } from '../../data/loyalty';

const EVENT_ICON: Record<LedgerEventType, LucideIcon> = {
  xp_earned: Zap, tier_change: ArrowUpDown, cashback_granted: Wallet, manual_adjustment: SlidersHorizontal, points_expired: Clock,
};
const TONE_VAR: Record<string, string> = {
  accent: 'var(--accent)', success: 'var(--success)', warning: 'var(--warning)', danger: 'var(--danger)', default: 'var(--fg-secondary)',
};

function amountColor(a: number) { return a > 0 ? 'var(--success)' : a < 0 ? 'var(--danger)' : 'var(--fg-muted)'; }
function fmtAmount(e: LedgerEntry) {
  if (e.amount === 0) return '—';
  const sign = e.amount > 0 ? '+' : '−';
  const abs = Math.abs(e.amount).toLocaleString();
  return e.unit === '€' ? `${sign}€${abs}` : `${sign}${abs} pts`;
}

function MiniSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div className="relative flex items-center gap-1.5 rounded-md border pl-3 pr-2" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
      <span className="text-[11px] font-medium text-fg-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="appearance-none bg-transparent py-2 pr-4 text-[12.5px] font-medium outline-none" style={{ color: 'var(--fg-primary)' }}>
        {options.map((o) => <option key={o.v} value={o.v} style={{ background: '#161B25', color: '#E7ECF3' }}>{o.l}</option>)}
      </select>
      <ChevronDown size={13} strokeWidth={2} className="pointer-events-none absolute right-2 text-fg-muted" />
    </div>
  );
}

export default function LedgerPanel({ rows, onOpen }: { rows: LedgerEntry[]; onOpen: (e: LedgerEntry) => void }) {
  const [type, setType] = useState<string>('all');
  const [range, setRange] = useState<string>('all');
  const cols = ['Time', 'Player', 'Brand', 'Program / campaign', 'Event', 'Detail', 'Amount', 'Balance'];

  const filtered = useMemo(() => {
    const r = LEDGER_RANGES.find((x) => x.v === range)?.days ?? Infinity;
    return rows.filter((e) => (type === 'all' || e.type === type) && (range === 'today' ? e.days === 0 : e.days <= r));
  }, [rows, type, range]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12.5px] text-fg-secondary">Player-level transaction log — XP, tier changes, cashback, manual adjustments and expiries across all brands.</p>
        <div className="flex shrink-0 items-center gap-2">
          <MiniSelect label="Event" value={type} onChange={setType} options={[{ v: 'all', l: 'All events' }, ...(Object.keys(LEDGER_META) as LedgerEventType[]).map((t) => ({ v: t, l: LEDGER_META[t].label }))]} />
          <MiniSelect label="Range" value={range} onChange={setRange} options={LEDGER_RANGES.map((x) => ({ v: x.v, l: x.l }))} />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-1)' }}>
              {cols.map((c, i) => <th key={c} className={`px-4 py-2.5 font-semibold ${i === 6 || i === 7 ? 'text-right' : ''}`}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => {
              const meta = LEDGER_META[e.type];
              const Icon = EVENT_ICON[e.type];
              return (
                <tr key={e.id} onClick={() => onOpen(e)} className="cursor-pointer border-t transition-colors" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}
                  onMouseEnter={(ev) => (ev.currentTarget.style.background = 'var(--surface-3)')} onMouseLeave={(ev) => (ev.currentTarget.style.background = 'var(--surface-2)')}>
                  <td className="px-4 py-3 text-[12px] text-fg-muted">{e.at}</td>
                  <td className="px-4 py-3">
                    <div className="text-[12.5px] font-medium text-fg-primary">{e.playerAlias}</div>
                    <div className="font-mono text-[11px] text-fg-muted">{e.playerId}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-fg-secondary">{e.brand}</td>
                  <td className="px-4 py-3">
                    <div className="text-[12.5px] text-fg-secondary">{e.program}</div>
                    {e.campaign && <div className="mt-0.5 flex items-center gap-1 text-[11px] text-fg-muted"><Megaphone size={10} strokeWidth={2} />{e.campaign}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: 'var(--surface-3)', color: TONE_VAR[meta.tone] }}><Icon size={13} strokeWidth={2} /></span>
                      <span className="whitespace-nowrap text-[12px] font-medium text-fg-primary">{meta.label}</span>
                    </div>
                  </td>
                  <td className="max-w-[240px] px-4 py-3"><div className="truncate text-[12px] text-fg-secondary">{e.detail}</div></td>
                  <td className="px-4 py-3 text-right font-mono text-[12.5px] font-medium tabular-nums" style={{ color: amountColor(e.amount) }}>{fmtAmount(e)}</td>
                  <td className="px-4 py-3 text-right font-mono text-[12px] tabular-nums text-fg-secondary">{e.balanceAfter.toLocaleString()}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={cols.length} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--surface-3)' }}><Receipt size={18} className="text-fg-muted" strokeWidth={1.75} /></div>
                  <p className="text-[13px] font-medium text-fg-primary">No ledger events</p>
                  <p className="text-[12px] text-fg-muted">No transactions match the current filters.</p>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
