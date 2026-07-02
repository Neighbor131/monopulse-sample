import { useMemo, useState } from 'react';
import { Search, ChevronDown, BookOpen } from 'lucide-react';
import type { Player } from '../../data/players';
import { LEDGER, LEDGER_META, LEDGER_RANGES } from '../../data/loyalty';
import type { LedgerEventType } from '../../data/loyalty';
import { fmtNum } from '../../data/campaigns';

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtSigned(amount: number, unit: '€' | 'pts'): string {
  const abs = unit === '€' ? `€${fmtNum(Math.abs(amount))}` : `${fmtNum(Math.abs(amount))} pts`;
  if (amount === 0) return '—';
  return amount > 0 ? `+${abs}` : `−${abs.replace('-', '')}`;
}

function fmtBalance(bal: number, unit: '€' | 'pts'): string {
  return unit === '€' ? `€${fmtNum(bal)}` : `${fmtNum(bal)} pts`;
}

const TONE_COLOR: Record<'default' | 'success' | 'warning' | 'danger' | 'accent', string> = {
  default: 'var(--fg-secondary)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  accent: 'var(--accent)',
};

const TONE_BG: Record<'default' | 'success' | 'warning' | 'danger' | 'accent', string> = {
  default: 'var(--surface-3)',
  success: 'var(--status-live-bg)',
  warning: 'var(--warning-bg)',
  danger: 'var(--danger-bg)',
  accent: 'var(--accent-bg)',
};

// ─── component ──────────────────────────────────────────────────────────────

export default function LedgerTab({ p }: { p: Player }) {
  const allEntries = useMemo(() => LEDGER.filter((e) => e.playerId === p.id), [p]);

  const [rangeV, setRangeV] = useState('all');
  const [typeV, setTypeV] = useState('');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const range = LEDGER_RANGES.find((r) => r.v === rangeV) ?? LEDGER_RANGES[0];
    return allEntries.filter((e) => {
      if (range.days !== Infinity && e.days > range.days) return false;
      if (typeV && e.type !== typeV) return false;
      if (q) {
        const lq = q.toLowerCase();
        const hay = `${e.summary} ${e.detail} ${e.campaign ?? ''}`.toLowerCase();
        if (!hay.includes(lq)) return false;
      }
      return true;
    });
  }, [allEntries, rangeV, typeV, q]);

  const anyFilter = rangeV !== 'all' || typeV !== '' || q !== '';

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* Date range */}
        <div className="relative">
          <select
            value={rangeV}
            onChange={(e) => setRangeV(e.target.value)}
            className="cursor-pointer appearance-none rounded-md border py-2 pl-3 pr-8 text-[12.5px] font-medium outline-none"
            style={{
              borderColor: rangeV !== 'all' ? 'var(--accent-border)' : 'var(--border-strong)',
              background: rangeV !== 'all' ? 'var(--accent-bg)' : 'var(--surface-2)',
              color: rangeV !== 'all' ? 'var(--fg-primary)' : 'var(--fg-secondary)',
            }}
          >
            {LEDGER_RANGES.map((r) => (
              <option key={r.v} value={r.v}>Date: {r.l}</option>
            ))}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-muted" strokeWidth={2} />
        </div>

        {/* Event type */}
        <div className="relative">
          <select
            value={typeV}
            onChange={(e) => setTypeV(e.target.value)}
            className="cursor-pointer appearance-none rounded-md border py-2 pl-3 pr-8 text-[12.5px] font-medium outline-none"
            style={{
              borderColor: typeV ? 'var(--accent-border)' : 'var(--border-strong)',
              background: typeV ? 'var(--accent-bg)' : 'var(--surface-2)',
              color: typeV ? 'var(--fg-primary)' : 'var(--fg-secondary)',
            }}
          >
            <option value="">Event type: All</option>
            {(Object.keys(LEDGER_META) as LedgerEventType[]).map((k) => (
              <option key={k} value={k}>Event type: {LEDGER_META[k].label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-muted" strokeWidth={2} />
        </div>

        {/* Text search */}
        <div className="flex items-center gap-2 rounded-md border px-3 py-2" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
          <Search size={14} className="text-fg-muted" strokeWidth={1.75} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search summary, detail, campaign…"
            className="w-52 bg-transparent text-[13px] outline-none"
          />
        </div>

        {anyFilter && (
          <button
            onClick={() => { setRangeV('all'); setTypeV(''); setQ(''); }}
            className="text-[12px] font-medium"
            style={{ color: 'var(--accent)' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border py-16" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--surface-3)' }}>
            <BookOpen size={18} className="text-fg-muted" strokeWidth={1.75} />
          </div>
          <p className="text-[13px] font-medium text-fg-primary">
            {allEntries.length === 0 ? 'No ledger entries for this player yet.' : 'No entries match the current filters.'}
          </p>
          {allEntries.length > 0 && <p className="text-[12px] text-fg-muted">Try adjusting the date range or event type filter.</p>}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-1)' }}>
                <th className="px-4 py-2 font-semibold">Event</th>
                <th className="px-4 py-2 font-semibold">Summary</th>
                <th className="px-4 py-2 font-semibold">Source</th>
                <th className="px-4 py-2 text-right font-semibold">Amount</th>
                <th className="px-4 py-2 text-right font-semibold">Balance</th>
                <th className="px-4 py-2 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const meta = LEDGER_META[e.type];
                const amtColor = e.amount > 0 ? 'var(--success)' : e.amount < 0 ? 'var(--danger)' : 'var(--fg-muted)';
                return (
                  <tr
                    key={e.id}
                    className="border-t"
                    style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}
                    onMouseEnter={(ev) => (ev.currentTarget.style.background = 'var(--surface-3)')}
                    onMouseLeave={(ev) => (ev.currentTarget.style.background = 'var(--surface-2)')}
                  >
                    <td className="px-4 py-2.5">
                      <span
                        className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium leading-none"
                        style={{ color: TONE_COLOR[meta.tone], background: TONE_BG[meta.tone] }}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-[12.5px] font-medium text-fg-primary">{e.summary}</div>
                      {e.detail && <div className="text-[11px] text-fg-muted">{e.detail}</div>}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-[12px] text-fg-secondary">{e.actor}</div>
                      {e.campaign && <div className="text-[11px] text-fg-muted">{e.campaign}</div>}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[12px] tabular-nums" style={{ color: amtColor }}>
                      {fmtSigned(e.amount, e.unit)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[12px] tabular-nums text-fg-primary">
                      {fmtBalance(e.balanceAfter, e.unit)}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-fg-secondary">{e.at}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
