import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Clock, Ban, MessageSquare, RotateCcw, Check, AlertTriangle } from 'lucide-react';
import { countBySeverity } from '../data/reviews';
import type { Review, ReviewDecision } from '../data/reviews';
import { useReviews } from '../context/ReviewsContext';
import { getType, fmtMoney, fmtNum, initials } from '../data/campaigns';
import ReviewStatusBadge from '../components/review/ReviewStatusBadge';
import { DemoStateHint, LoadingBlock, StateCard, useDemoState } from '../components/StateViews';

type Filter = 'queue' | ReviewDecision | 'all';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'queue', label: 'Needs action' },
  { id: 'pending', label: 'Pending' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'reset', label: 'Reset' },
  { id: 'changes_requested', label: 'Changes requested' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
];

export default function ApprovalInbox() {
  const navigate = useNavigate();
  const demoState = useDemoState();
  const [filter, setFilter] = useState<Filter>('queue');
  const [query, setQuery] = useState('');
  const { reviews, counts } = useReviews();

  const rows = useMemo(() => {
    if (demoState === 'empty') return [];
    return reviews.filter((r) => {
      const matchQ = r.name.toLowerCase().includes(query.toLowerCase()) || r.submittedBy.toLowerCase().includes(query.toLowerCase());
      if (!matchQ) return false;
      if (filter === 'all') return true;
      if (filter === 'queue') return ['pending', 'blocked', 'reset'].includes(r.decision);
      return r.decision === filter;
    });
  }, [demoState, filter, query, reviews]);

  return (
    <div className="mx-auto w-full max-w-[1240px] px-8 py-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[19px] font-semibold tracking-tight">Approval queue</h1>
          <p className="mt-1 text-[13px] text-fg-secondary">Review submitted campaigns for safety, budget and compliance before they can launch.</p>
        </div>
      </div>

      {/* Stat strip */}
      <div className="mt-5 grid grid-cols-5 gap-3">
        <Stat icon={Clock} label="Pending review" value={counts.pending} fg="var(--status-pending)" bg="var(--status-pending-bg)" emphasis />
        <Stat icon={Ban} label="Blocked" value={counts.blocked} fg="var(--danger)" bg="var(--danger-bg)" emphasis />
        <Stat icon={RotateCcw} label="Approval reset" value={counts.reset} fg="var(--warning)" bg="var(--warning-bg)" emphasis />
        <Stat icon={MessageSquare} label="Changes requested" value={counts.changes} fg="var(--status-scheduled)" bg="var(--status-scheduled-bg)" />
        <Stat icon={Check} label="Approved" value={counts.approvedToday} fg="var(--success)" bg="var(--status-live-bg)" />
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className="rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors"
                style={active ? { background: 'var(--accent-bg)', color: 'var(--accent)' } : { color: 'var(--fg-secondary)' }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 rounded-md border px-3 py-2" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
          <Search size={14} className="text-fg-muted" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campaigns or creators…"
            className="w-56 bg-transparent text-[13px] outline-none"
          />
        </div>
      </div>

      {demoState === 'error' && (
        <div className="mt-4">
          <StateCard
            state="error"
            title="Approval queue failed to load"
            detail="Approvers need a clear stop state here: no decisions should be taken when review packets, blockers or audit history cannot be trusted."
            onAction={() => navigate('/approvals')}
          />
          <DemoStateHint area="approval queue states" />
        </div>
      )}

      {demoState === 'loading' && (
        <div className="mt-4">
          <LoadingBlock title="Loading approvals" rows={5} />
          <DemoStateHint area="approval queue states" />
        </div>
      )}

      {/* Table */}
      {demoState !== 'error' && demoState !== 'loading' && <div className="mt-4 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-1)' }}>
              <th className="px-4 py-2.5 font-semibold">Campaign</th>
              <th className="px-4 py-2.5 font-semibold">Submitted by</th>
              <th className="px-4 py-2.5 font-semibold">Brands</th>
              <th className="px-4 py-2.5 text-right font-semibold">Audience</th>
              <th className="px-4 py-2.5 font-semibold">Projected spend</th>
              <th className="px-4 py-2.5 font-semibold">Risk</th>
              <th className="px-4 py-2.5 font-semibold">Status</th>
              <th className="px-2 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Row key={r.id} review={r} onOpen={() => navigate(`/approvals/${r.id}`)} />
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--surface-3)' }}>
                      <Check size={18} className="text-fg-muted" strokeWidth={2} />
                    </div>
                    <p className="text-[13px] font-medium text-fg-primary">Nothing in this view</p>
                    <p className="text-[12px] text-fg-muted">No campaigns match the current filter.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>}
      {demoState !== 'error' && demoState !== 'loading' && <DemoStateHint area="approval queue states" />}
    </div>
  );
}

function Stat({
  icon: Icon, label, value, fg, bg, emphasis,
}: {
  icon: typeof Clock; label: string; value: number; fg: string; bg: string; emphasis?: boolean;
}) {
  return (
    <div className="rounded-xl border px-4 py-3.5" style={{ borderColor: emphasis && value > 0 ? fg : 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">
        <span className="flex h-5 w-5 items-center justify-center rounded" style={{ background: bg, color: fg }}>
          <Icon size={12} strokeWidth={2.25} />
        </span>
        {label}
      </div>
      <div className="mt-1.5 font-mono text-[24px] font-semibold leading-none tabular-nums" style={{ color: value > 0 ? 'var(--fg-primary)' : 'var(--fg-muted)' }}>
        {value}
      </div>
    </div>
  );
}

function Row({ review, onOpen }: { review: Review; onOpen: () => void }) {
  const type = getType(review.type);
  const TypeIcon = type.icon;
  const sev = countBySeverity(review.checks);
  const spendPct = Math.min(100, Math.round((review.projectedSpend / review.budgetCap) * 100));
  const needsAction = ['pending', 'blocked', 'reset'].includes(review.decision);

  return (
    <tr
      onClick={onOpen}
      className="cursor-pointer border-t transition-colors hover:brightness-110"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-3)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          {needsAction && review.priority === 'high' && (
            <span className="h-8 w-0.5 shrink-0 rounded-full" style={{ background: review.decision === 'blocked' ? 'var(--danger)' : 'var(--warning)' }} />
          )}
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>
            <TypeIcon size={14} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium text-fg-primary">{review.name}</div>
            <div className="text-[11px] text-fg-muted">{type.name} · {review.id}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full text-[9.5px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>
            {initials(review.submittedBy)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12.5px] text-fg-primary">{review.submittedBy}</div>
            <div className="text-[10.5px] text-fg-muted">{review.submittedByRole}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {review.brandScope === 'all' ? (
          <span className="rounded px-1.5 py-0.5 text-[11px] font-medium" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>All brands</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {review.brands.slice(0, 3).map((b) => (
              <span key={b} className="rounded px-1.5 py-0.5 font-mono text-[10.5px] font-medium" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{b}</span>
            ))}
            {review.brands.length > 3 && <span className="text-[10.5px] text-fg-muted">+{review.brands.length - 3}</span>}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-right font-mono text-[12.5px] tabular-nums text-fg-primary">{fmtNum(review.audienceSize)}</td>
      <td className="px-4 py-3">
        <div className="w-32">
          <div className="flex items-baseline justify-between text-[11.5px]">
            <span className="font-mono font-medium text-fg-primary">{fmtMoney(review.projectedSpend, review.currency)}</span>
            <span className="text-fg-muted">{spendPct}%</span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full" style={{ background: 'var(--surface-3)' }}>
            <div className="h-full rounded-full" style={{ width: `${spendPct}%`, background: spendPct >= 90 ? 'var(--warning)' : 'var(--accent)' }} />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          {sev.blocker > 0 && (
            <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-semibold" style={{ color: 'var(--danger)', background: 'var(--danger-bg)' }}>
              <Ban size={10} strokeWidth={2.5} /> {sev.blocker}
            </span>
          )}
          {sev.warning > 0 && (
            <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-semibold" style={{ color: 'var(--warning)', background: 'var(--warning-bg)' }}>
              <AlertTriangle size={10} strokeWidth={2.5} /> {sev.warning}
            </span>
          )}
          {sev.blocker === 0 && sev.warning === 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: 'var(--success)' }}>
              <Check size={12} strokeWidth={2.5} /> Clear
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3"><ReviewStatusBadge decision={review.decision} /></td>
      <td className="px-2 py-3 text-fg-muted"><ChevronRight size={16} strokeWidth={2} /></td>
    </tr>
  );
}
