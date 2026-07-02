import { Clock, Check, X, RotateCcw, Ban, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReviewDecision } from '../../data/reviews';

const META: Record<ReviewDecision, { label: string; fg: string; bg: string; icon: LucideIcon }> = {
  pending: { label: 'Pending review', fg: 'var(--status-pending)', bg: 'var(--status-pending-bg)', icon: Clock },
  approved: { label: 'Approved', fg: 'var(--status-live)', bg: 'var(--status-live-bg)', icon: Check },
  rejected: { label: 'Rejected', fg: 'var(--status-failed)', bg: 'var(--status-failed-bg)', icon: X },
  changes_requested: { label: 'Changes requested', fg: 'var(--status-scheduled)', bg: 'var(--status-scheduled-bg)', icon: MessageSquare },
  blocked: { label: 'Launch blocked', fg: 'var(--danger)', bg: 'var(--danger-bg)', icon: Ban },
  reset: { label: 'Approval reset', fg: 'var(--warning)', bg: 'var(--warning-bg)', icon: RotateCcw },
};

export default function ReviewStatusBadge({ decision, size = 'sm' }: { decision: ReviewDecision; size?: 'sm' | 'md' }) {
  const m = META[decision];
  const Icon = m.icon;
  const pad = size === 'md' ? 'px-2.5 py-1.5 text-[12.5px]' : 'px-2 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md font-medium leading-none ${pad}`} style={{ color: m.fg, background: m.bg }}>
      <Icon size={size === 'md' ? 14 : 12} strokeWidth={2.25} />
      {m.label}
    </span>
  );
}
