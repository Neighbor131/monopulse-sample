import { STATUS_CATALOG } from '../data/campaigns';
import type { CampaignStatus } from '../data/campaigns';

// color + pulse per status; label comes from STATUS_CATALOG
const STATUS_STYLE: Record<CampaignStatus, { fg: string; bg: string; pulse?: boolean }> = {
  draft: { fg: 'var(--status-draft)', bg: 'var(--status-draft-bg)' },
  pending: { fg: 'var(--status-pending)', bg: 'var(--status-pending-bg)' },
  scheduled: { fg: 'var(--status-scheduled)', bg: 'var(--status-scheduled-bg)' },
  live: { fg: 'var(--status-live)', bg: 'var(--status-live-bg)', pulse: true },
  paused: { fg: 'var(--status-paused)', bg: 'var(--status-paused-bg)' },
  completed: { fg: 'var(--status-completed)', bg: 'var(--status-completed-bg)' },
  failed: { fg: 'var(--status-failed)', bg: 'var(--status-failed-bg)' },
  // module-specific
  pending_seed: { fg: 'var(--status-scheduled)', bg: 'var(--status-scheduled-bg)' },
  standby: { fg: 'var(--status-scheduled)', bg: 'var(--status-scheduled-bg)' },
  locked: { fg: 'var(--status-pending)', bg: 'var(--status-pending-bg)' },
  grace_period: { fg: 'var(--status-live)', bg: 'var(--status-live-bg)' },
  final_day: { fg: 'var(--status-live)', bg: 'var(--status-live-bg)', pulse: true },
  drawing: { fg: 'var(--status-pending)', bg: 'var(--status-pending-bg)', pulse: true },
  distributing: { fg: 'var(--status-live)', bg: 'var(--status-live-bg)', pulse: true },
  settling: { fg: 'var(--status-pending)', bg: 'var(--status-pending-bg)' },
  void: { fg: 'var(--status-failed)', bg: 'var(--status-failed-bg)' },
  expired: { fg: 'var(--status-completed)', bg: 'var(--status-completed-bg)' },
};

const FALLBACK = { fg: 'var(--status-draft)', bg: 'var(--status-draft-bg)' };

export default function StatusBadge({ status }: { status: CampaignStatus }) {
  const s = STATUS_STYLE[status] ?? FALLBACK;
  const label = STATUS_CATALOG[status]?.label ?? status;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium leading-none"
      style={{ color: s.fg, background: s.bg }}
    >
      {s.pulse ? (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
            style={{ background: s.fg }}
          />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: s.fg }} />
        </span>
      ) : (
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.fg }} />
      )}
      {label}
    </span>
  );
}
