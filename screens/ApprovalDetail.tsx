import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Users, UserMinus, Building2, Gift, Coins, Ban, AlertTriangle,
  Check, ShieldCheck, ListChecks, History, GitCompare, ExternalLink, Clock,
} from 'lucide-react';
import { countBySeverity } from '../data/reviews';
import { useReviews } from '../context/ReviewsContext';
import type { Review, AuditEntry } from '../data/reviews';
import { getType, fmtMoney, fmtNum, initials } from '../data/campaigns';
import ReviewStatusBadge from '../components/review/ReviewStatusBadge';
import ReviewChecklist from '../components/review/ReviewChecklist';
import ChangesSinceReview from '../components/review/ChangesSinceReview';
import AuditTimeline from '../components/review/AuditTimeline';
import FulfillmentHealth from '../components/review/FulfillmentHealth';
import DecisionPanel from '../components/review/DecisionPanel';
import type { DecisionAction } from '../components/review/DecisionPanel';

const SETTLED_META: Record<string, { label: string; fg: string }> = {
  changes_requested: { label: 'Changes requested', fg: 'var(--status-scheduled)' },
  rejected: { label: 'Rejected', fg: 'var(--status-failed)' },
  approved: { label: 'Approved', fg: 'var(--status-live)' },
};

export default function ApprovalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getReviewById } = useReviews();
  const review = id ? getReviewById(id) : undefined;

  const [audit, setAudit] = useState<AuditEntry[]>(review?.audit ?? []);

  if (!review) {
    return (
      <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-8 py-24 text-center">
        <p className="text-[14px] font-medium text-fg-primary">Review not found</p>
        <button onClick={() => navigate('/approvals')} className="mt-3 text-[13px] font-medium" style={{ color: 'var(--accent)' }}>Back to queue</button>
      </div>
    );
  }

  const type = getType(review.type);
  const sev = countBySeverity(review.checks);
  const hasBlockers = sev.blocker > 0;
  const spendPct = Math.min(100, Math.round((review.projectedSpend / review.budgetCap) * 100));
  const settled = SETTLED_META[review.decision];

  const onDecide = (action: DecisionAction, comment: string) => {
    const map: Record<DecisionAction, { action: string; kind: AuditEntry['kind'] }> = {
      approved: { action: 'Approved campaign', kind: 'approve' },
      rejected: { action: 'Rejected campaign', kind: 'reject' },
      changes_requested: { action: 'Requested changes', kind: 'changes' },
    };
    const m = map[action];
    setAudit((prev) => [
      ...prev,
      { id: `live-${Date.now()}`, actor: 'You', actorRole: 'Risk & Compliance', action: m.action, detail: comment || undefined, at: 'just now', kind: m.kind },
    ]);
  };

  return (
    <div className="mx-auto w-full max-w-[1240px] px-8 py-6">
      {/* Breadcrumb + header */}
      <button onClick={() => navigate('/approvals')} className="flex items-center gap-1.5 text-[13px] font-medium text-fg-secondary transition-colors hover:text-fg-primary">
        <ArrowLeft size={15} strokeWidth={2} /> Approval queue
      </button>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>
            <type.icon size={20} strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[19px] font-semibold tracking-tight">{review.name}</h1>
              <ReviewStatusBadge decision={review.decision} size="md" />
            </div>
            <div className="mt-1 flex items-center gap-2 text-[12.5px] text-fg-secondary">
              <span>{type.name}</span>
              <span className="text-fg-muted">·</span>
              <span className="font-mono text-fg-muted">{review.id}</span>
              <span className="text-fg-muted">·</span>
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{initials(review.submittedBy)}</span>
                <span>{review.submittedBy} · {review.submittedByRole}</span>
              </div>
              <span className="text-fg-muted">·</span>
              <span className="flex items-center gap-1 text-fg-muted"><Clock size={12} strokeWidth={2} /> submitted {review.submittedAt}</span>
            </div>
          </div>
        </div>
        <button onClick={() => navigate('/')} className="flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-2 text-[12.5px] font-medium text-fg-secondary transition-colors hover:text-fg-primary" style={{ borderColor: 'var(--border-strong)' }}>
          <ExternalLink size={14} strokeWidth={2} /> Open campaign
        </button>
      </div>

      {/* State banners */}
      {review.decision === 'reset' && (
        <Banner tone="warning" title="Approval reset — re-review required"
          detail={`This campaign was approved, then ${review.changesSinceReview.length} sensitive fields were edited by the creator. The prior approval is void until you decide again.`} />
      )}
      {hasBlockers && review.decision !== 'reset' && (
        <Banner tone="danger" title="Launch blocked"
          detail={`${sev.blocker} ${sev.blocker === 1 ? 'blocker' : 'blockers'} must be resolved by the creator before this campaign can be approved or launched.`} />
      )}

      {/* Body */}
      <div className="mt-5 grid grid-cols-[1fr_320px] gap-6">
        {/* Main */}
        <div className="flex flex-col gap-5">
          {/* Verdict summary */}
          <div className="grid grid-cols-3 gap-3">
            <Verdict label="Passed" value={sev.pass} fg="var(--success)" bg="var(--status-live-bg)" icon={Check} />
            <Verdict label="Warnings" value={sev.warning} fg="var(--warning)" bg="var(--warning-bg)" icon={AlertTriangle} />
            <Verdict label="Blockers" value={sev.blocker} fg="var(--danger)" bg="var(--danger-bg)" icon={Ban} />
          </div>

          <DecisionReadiness blockers={sev.blocker} warnings={sev.warning} decision={review.decision} />

          {/* Campaign facts */}
          <Panel icon={ListChecks} title="Campaign summary">
            <div className="grid grid-cols-2 gap-x-6 gap-y-0">
              <Fact icon={Building2} label="Brand scope"
                value={review.brandScope === 'all' ? 'All 6 brands' : `${review.brands.length} selected`}
                sub={review.brandScope === 'all' ? 'Network-wide' : review.brands.join(' · ')} />
              <Fact icon={Users} label="Audience estimate" value={`${fmtNum(review.audienceSize)} players`} sub="eligible after filters" mono />
              <Fact icon={UserMinus} label="Excluded players" value={fmtNum(review.excludedPlayers)} sub="RG + risk-flagged removed" mono />
              <Fact icon={Gift} label="Reward setup" value={review.rewardSetup} />
              <Fact icon={Coins} label="Budget cap" value={fmtMoney(review.budgetCap, review.currency)} mono />
              <div className="border-t py-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-fg-muted">
                  <Coins size={12} strokeWidth={2} /> Projected spend
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-[13px] font-medium text-fg-primary">{fmtMoney(review.projectedSpend, review.currency)}</span>
                  <span className="text-[11.5px]" style={{ color: spendPct >= 90 ? 'var(--warning)' : 'var(--fg-muted)' }}>{spendPct}% of cap</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--surface-3)' }}>
                  <div className="h-full rounded-full" style={{ width: `${spendPct}%`, background: spendPct >= 90 ? 'var(--warning)' : 'var(--accent)' }} />
                </div>
              </div>
            </div>
          </Panel>

          {/* Changes since review — only when reset */}
          {review.changesSinceReview.length > 0 && (
            <Panel icon={GitCompare} title="Changes since last review" count={review.changesSinceReview.length}>
              <ChangesSinceReview changes={review.changesSinceReview} />
            </Panel>
          )}

          {/* Compliance & risk checklist */}
          <Panel icon={ShieldCheck} title="Compliance & risk checklist"
            aside={
              <div className="flex items-center gap-2 text-[11.5px] font-medium">
                {sev.blocker > 0 && <span style={{ color: 'var(--danger)' }}>{sev.blocker} blockers</span>}
                {sev.warning > 0 && <span style={{ color: 'var(--warning)' }}>{sev.warning} warnings</span>}
                <span style={{ color: 'var(--success)' }}>{sev.pass} pass</span>
              </div>
            }>
            <ReviewChecklist checks={review.checks} />
          </Panel>

          {/* Audit log */}
          <Panel icon={History} title="Audit log & change history">
            <AuditTimeline entries={audit} />
          </Panel>
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-4">
          <div className="sticky top-6 flex flex-col gap-4">
            <DecisionPanel
              hasBlockers={hasBlockers}
              onDecide={onDecide}
              settled={settled ? { label: settled.label, fg: settled.fg, comment: review.reviewerComment, by: review.reviewerName, at: review.decidedAt } : undefined}
            />
            <FulfillmentHealth method={review.fulfillmentMethod} health={review.fulfillmentHealth} note={review.fulfillmentNote} />
            <div className="rounded-lg border px-3.5 py-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Routing</div>
              <div className="mt-1.5 text-[12.5px] text-fg-primary">{review.waitingFor}</div>
              <div className="mt-0.5 text-[11.5px] text-fg-muted">{review.slaHint}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DecisionReadiness({ blockers, warnings, decision }: { blockers: number; warnings: number; decision: Review['decision'] }) {
  const blocked = blockers > 0;
  const fg = blocked ? 'var(--danger)' : warnings > 0 ? 'var(--warning)' : 'var(--success)';
  const bg = blocked ? 'var(--danger-bg)' : warnings > 0 ? 'var(--warning-bg)' : 'var(--status-live-bg)';
  const title = blocked ? 'Approval unavailable until blockers are resolved' : warnings > 0 ? 'Approval possible, but reviewer note is recommended' : 'Ready for approval';
  const detail = blocked
    ? 'The reviewer can request changes or reject. Approval is locked while blocker checks are open.'
    : warnings > 0
      ? 'Warnings do not block approval, but the final audit should explain why the risk is acceptable.'
      : 'All checks are green. Approval will notify the creator and clear the campaign for scheduling or launch.';
  return (
    <div className="rounded-xl border px-4 py-3.5" style={{ borderColor: fg, background: bg }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[14px] font-semibold text-fg-primary">{title}</div>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-fg-secondary">{detail}</p>
        </div>
        <span className="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold capitalize" style={{ color: fg, background: 'var(--surface-1)' }}>
          {decision.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
}

function Banner({ tone, title, detail }: { tone: 'danger' | 'warning'; title: string; detail: string }) {
  const fg = tone === 'danger' ? 'var(--danger)' : 'var(--warning)';
  const bg = tone === 'danger' ? 'var(--danger-bg)' : 'var(--warning-bg)';
  const border = tone === 'danger' ? 'rgba(240,87,107,0.35)' : 'rgba(231,168,60,0.35)';
  const Icon = tone === 'danger' ? Ban : AlertTriangle;
  return (
    <div className="mt-4 flex items-start gap-3 rounded-xl border px-4 py-3.5" style={{ borderColor: border, background: bg }}>
      <Icon size={18} className="mt-0.5 shrink-0" style={{ color: fg }} strokeWidth={2.25} />
      <div>
        <div className="text-[14px] font-semibold text-fg-primary">{title}</div>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-fg-secondary">{detail}</p>
      </div>
    </div>
  );
}

function Verdict({ label, value, fg, bg, icon: Icon }: { label: string; value: number; fg: string; bg: string; icon: typeof Check }) {
  const on = value > 0;
  return (
    <div className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: on && label === 'Blockers' ? fg : 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: on ? bg : 'var(--surface-3)', color: on ? fg : 'var(--fg-muted)' }}>
        <Icon size={17} strokeWidth={2.25} />
      </div>
      <div>
        <div className="font-mono text-[20px] font-semibold leading-none tabular-nums" style={{ color: on ? 'var(--fg-primary)' : 'var(--fg-muted)' }}>{value}</div>
        <div className="mt-0.5 text-[11.5px] font-medium text-fg-secondary">{label}</div>
      </div>
    </div>
  );
}

function Panel({
  icon: Icon, title, count, aside, children,
}: {
  icon: typeof Check; title: string; count?: number; aside?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="flex items-center justify-between gap-3 border-b px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <Icon size={15} strokeWidth={2} className="text-fg-secondary" />
          <h3 className="text-[13.5px] font-semibold text-fg-primary">{title}</h3>
          {count !== undefined && (
            <span className="rounded px-1.5 py-0.5 text-[10.5px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{count}</span>
          )}
        </div>
        {aside}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Fact({ icon: Icon, label, value, sub, mono }: { icon: typeof Check; label: string; value: string; sub?: string; mono?: boolean }) {
  return (
    <div className="border-t py-3 first:border-t-0" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-fg-muted">
        <Icon size={12} strokeWidth={2} /> {label}
      </div>
      <div className={`mt-1 text-[13px] font-medium text-fg-primary ${mono ? 'font-mono' : ''}`}>{value}</div>
      {sub && <div className="mt-0.5 text-[11.5px] text-fg-muted">{sub}</div>}
    </div>
  );
}
