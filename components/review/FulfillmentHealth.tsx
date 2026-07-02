import { Plug, RefreshCw } from 'lucide-react';
import type { Health } from '../../data/validation';

const META: Record<Health, { label: string; fg: string; bg: string }> = {
  connected: { label: 'Connected', fg: 'var(--success)', bg: 'var(--status-live-bg)' },
  degraded: { label: 'Degraded', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
  error: { label: 'Error', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
};

export default function FulfillmentHealth({
  method,
  health,
  note,
}: {
  method: string;
  health: Health;
  note: string;
}) {
  const m = META[health];
  return (
    <div className="rounded-lg border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="flex items-center justify-between gap-2 border-b px-3.5 py-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
          <Plug size={12} strokeWidth={2} /> Fulfillment health
        </span>
        <span className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10.5px] font-semibold" style={{ color: m.fg, background: m.bg }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.fg }} />
          {m.label}
        </span>
      </div>
      <div className="px-3.5 py-3">
        <div className="text-[12.5px] font-medium text-fg-primary">{method}</div>
        <p className="mt-1 text-[11.5px] leading-relaxed text-fg-secondary">{note}</p>
        {health === 'error' && (
          <button className="mt-2.5 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11.5px] font-semibold" style={{ background: 'var(--danger)', color: '#fff' }}>
            <RefreshCw size={12} strokeWidth={2.25} /> Reconnect provider
          </button>
        )}
      </div>
    </div>
  );
}
