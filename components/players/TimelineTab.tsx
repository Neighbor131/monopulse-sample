import { useMemo, useState } from 'react';
import type { Player } from '../../data/players';
import { timelineEvents, TIMELINE_META } from '../../data/playerDetail';
import type { TimelineSource } from '../../data/playerDetail';

// ─── helpers ────────────────────────────────────────────────────────────────

const ALL_SOURCES = Object.keys(TIMELINE_META) as TimelineSource[];

// ─── component ──────────────────────────────────────────────────────────────

export default function TimelineTab({ p }: { p: Player }) {
  const events = useMemo(() => timelineEvents(p), [p]);
  const [activeSource, setActiveSource] = useState<TimelineSource | 'all'>('all');

  const filtered = useMemo(
    () => (activeSource === 'all' ? events : events.filter((e) => e.source === activeSource)),
    [events, activeSource],
  );

  return (
    <div>
      {/* Source filter chips */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveSource('all')}
          className="rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors"
          style={
            activeSource === 'all'
              ? { background: 'var(--accent)', color: 'var(--accent-fg)' }
              : { background: 'var(--surface-2)', color: 'var(--fg-secondary)', border: '1px solid var(--border-strong)' }
          }
        >
          All
        </button>
        {ALL_SOURCES.map((src) => {
          const meta = TIMELINE_META[src];
          const isActive = activeSource === src;
          return (
            <button
              key={src}
              onClick={() => setActiveSource(src)}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors"
              style={
                isActive
                  ? { background: meta.fg, color: '#fff' }
                  : { background: 'var(--surface-2)', color: 'var(--fg-secondary)', border: '1px solid var(--border-strong)' }
              }
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: isActive ? '#fff' : meta.fg }} />
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {ALL_SOURCES.map((src) => {
          const meta = TIMELINE_META[src];
          return (
            <div key={src} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: meta.fg }} />
              <span className="text-[11px] text-fg-muted">{meta.label}</span>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border py-12 text-center" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <p className="text-[13px] font-medium text-fg-primary">No events for this source.</p>
          <p className="mt-1 text-[12px] text-fg-muted">Try selecting a different source filter.</p>
        </div>
      ) : (
        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <div className="flex flex-col">
            {filtered.map((ev, i) => {
              const meta = TIMELINE_META[ev.source];
              return (
                <div key={i} className="relative flex gap-4 pb-5 last:pb-0">
                  {/* Connector line + dot */}
                  <div className="flex flex-col items-center">
                    <span
                      className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-2"
                      style={{ background: meta.fg, ringColor: 'var(--surface-1)' }}
                    />
                    {i < filtered.length - 1 && (
                      <span className="mt-1 w-px flex-1" style={{ background: 'var(--border-strong)' }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pt-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {/* Source badge */}
                        <span
                          className="mb-1.5 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                          style={{ color: meta.fg, background: 'var(--surface-3)' }}
                        >
                          {meta.label}
                        </span>
                        <div className="text-[13px] font-medium text-fg-primary">{ev.title}</div>
                        <div className="mt-0.5 text-[12px] text-fg-secondary">{ev.detail}</div>
                      </div>
                      <span className="shrink-0 text-[11px] text-fg-muted">{ev.at}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
