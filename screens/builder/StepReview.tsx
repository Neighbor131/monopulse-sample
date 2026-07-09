import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, Ban, AlertTriangle, RotateCcw, UserCheck, Send, Rocket,
  ShieldCheck, Clock, X, PartyPopper, Inbox,
} from 'lucide-react';
import { useCampaign } from '../../context/CampaignContext';
import { useReviews } from '../../context/ReviewsContext';
import { getType, fmtMoney, fmtNum, BRANDS } from '../../data/campaigns';
import {
  getBlockers, getWarnings, requiresApproval, verdict,
  estimateAudience, fulfillmentById,
} from '../../data/validation';
import type { StepId } from '../../data/validation';

export default function StepReview() {
  const { draft, update, approvalReset, clearApprovalReset } = useCampaign();
  const { submitForApproval } = useReviews();
  const navigate = useNavigate();
  const [launched, setLaunched] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = () => {
    const r = submitForApproval(draft);
    setSubmittedId(r.id);
    update({ approvalState: 'pending' });
  };

  const type = draft.type ? getType(draft.type) : null;
  const blockers = getBlockers(draft);
  const warnings = getWarnings(draft);
  const needsApproval = requiresApproval(draft);
  const v = verdict(draft);
  const aud = estimateAudience(draft);
  const fm = fulfillmentById(draft.fulfillmentMethod);

  if (launched) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border py-20 text-center" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'var(--status-live-bg)', color: 'var(--success)' }}>
          <PartyPopper size={26} strokeWidth={1.75} />
        </div>
        <h2 className="mt-4 text-[18px] font-semibold tracking-tight">Campaign {draft.startDate ? 'scheduled' : 'launched'}</h2>
        <p className="mt-1.5 max-w-sm text-[13px] text-fg-secondary">
          <span className="font-medium text-fg-primary">{draft.name}</span> is now {draft.startDate ? 'scheduled and will go live on its start date' : 'live'}. Monitor reward fulfillment and cached delivery status from the campaign detail.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="rounded-md px-4 py-2 text-[13px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            Back to campaigns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[16px] font-semibold tracking-tight">Review & launch</h2>
        <p className="mt-1 text-[13px] text-fg-secondary">Confirm every decision, clear approval, and launch.</p>
      </div>

      {/* Reset-on-edit notices */}
      {approvalReset ? (
        <div className="flex items-center gap-3 rounded-lg border px-4 py-3" style={{ borderColor: 'rgba(231,168,60,0.35)', background: 'var(--warning-bg)' }}>
          <RotateCcw size={16} className="shrink-0" style={{ color: 'var(--warning)' }} strokeWidth={2} />
          <span className="flex-1 text-[12.5px] text-fg-primary">
            <span className="font-medium">Approval was reset.</span> You changed a sensitive field, so this campaign must be re-submitted.
          </span>
          <button onClick={clearApprovalReset} className="text-fg-muted hover:text-fg-primary"><X size={14} strokeWidth={2} /></button>
        </div>
      ) : (
        <div className="flex items-start gap-2.5 rounded-lg border px-4 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
          <RotateCcw size={14} className="mt-0.5 shrink-0 text-fg-muted" strokeWidth={2} />
          <span className="text-[12px] leading-relaxed text-fg-secondary">
            Editing audience scope, mission logic, rewards, fulfillment, budget or compliance after approval will reset it back to draft and require re-submission.
          </span>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <SummaryCard title="Type & schedule" step="setup" onEdit={navigate}>
          <Kv k="Type" v={type?.name ?? '—'} />
          <Kv k="Name" v={draft.name || '—'} />
          <Kv k="Runs" v={draft.startDate && draft.endDate ? `${draft.startDate} ${draft.startTime} → ${draft.endDate} ${draft.endTime}` : 'Not set'} />
          <Kv k="Owner" v={draft.owner} />
        </SummaryCard>

        <SummaryCard title="Brands" step="setup" onEdit={navigate}>
          <Kv k="Scope" v={draft.brandScope === 'network' ? (draft.network.brandIdsMode === 'all' ? `Network · all ${BRANDS.length}` : `Network · ${draft.brands.length} brands`) : `Brand-only · ${draft.brands.length}`} />
          <Kv k="Brands" v={draft.brandScope === 'network' && draft.network.brandIdsMode === 'all' ? BRANDS.map((b) => b.code).join(' · ') : draft.brands.join(' · ') || '—'} mono />
        </SummaryCard>

        <SummaryCard title="Audience Scope" step="audience" onEdit={navigate}>
          <Kv k="Reach" v={`${fmtNum(aud.size)} players`} mono />
          <Kv k="Excluded" v={`${fmtNum(aud.excluded)} players`} mono />
          <Kv k="Segments" v={draft.segments.join(', ') || 'All eligible players'} />
          <Kv k="Tiers" v={draft.tiers.join(', ') || 'All tiers'} />
        </SummaryCard>

        <SummaryCard title="Mission Logic" step="logic" onEdit={navigate}>
          <Kv k="Rules" v={`${draft.rules.filter((r) => r.when && r.thenAction).length} configured`} />
          <Kv k="Condition groups" v={`${draft.rules.reduce((sum, r) => sum + r.conditions.length, 0)} conditions`} />
          <Kv k="Evaluation" v="WHEN / IF / THEN" />
        </SummaryCard>

        <SummaryCard title="Outcome & Rewards" step="rewards" onEdit={navigate}>
          <Kv k="Reward" v={draft.rewardType && draft.rewardAmount ? `${fmtMoney(Number(draft.rewardAmount) || 0, draft.currency)} ${draft.rewardType}` : 'Not set'} />
          <Kv k="Per player" v={draft.maxPerPlayer ? fmtMoney(Number(draft.maxPerPlayer) || 0, draft.currency) : '—'} mono />
          <Kv k="Fulfillment" v={fm?.name ?? 'Not set'} />
        </SummaryCard>

        <SummaryCard title="Budget" step="budget" onEdit={navigate}>
          <Kv k="Total cap" v={draft.budgetCap ? fmtMoney(Number(draft.budgetCap) || 0, draft.currency) : 'Not set'} mono />
          <Kv k="Daily cap" v={draft.dailyCap ? fmtMoney(Number(draft.dailyCap) || 0, draft.currency) : 'None'} mono />
          <Kv k="Max winners" v={draft.maxWinners || 'Unlimited'} mono />
        </SummaryCard>

        <SummaryCard title="Compliance" step="budget" onEdit={navigate}>
          <div className="flex items-center gap-2 py-1">
            {v === 'clear' ? (
              <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium" style={{ color: 'var(--success)', background: 'var(--status-live-bg)' }}>
                <ShieldCheck size={13} strokeWidth={2} /> All checks passed
              </span>
            ) : v === 'warning' ? (
              <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium" style={{ color: 'var(--warning)', background: 'var(--warning-bg)' }}>
                <AlertTriangle size={13} strokeWidth={2} /> {warnings.length} warnings
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium" style={{ color: 'var(--danger)', background: 'var(--danger-bg)' }}>
                <Ban size={13} strokeWidth={2} /> {blockers.length} blockers
              </span>
            )}
          </div>
          <Kv k="RG exclusions" v={draft.rgExclusionsApplied ? 'Applied' : 'Not applied'} />
          <Kv k="Jurisdiction" v={draft.jurisdictionResolved ? 'Confirmed' : 'Unconfirmed'} />
        </SummaryCard>
      </div>

      {/* Approval + launch */}
      <ApprovalPanel
        blockers={blockers.length}
        needsApproval={needsApproval}
        state={draft.approvalState}
        onSubmit={handleSubmit}
        onApprove={() => update({ approvalState: 'approved' })}
        onReject={() => update({ approvalState: 'rejected' })}
        onLaunch={() => setLaunched(true)}
        onFixBlockers={() => navigate('/builder/budget')}
        onResubmit={handleSubmit}
        onViewQueue={() => submittedId && navigate(`/approvals/${submittedId}`)}
      />
    </div>
  );
}

function ApprovalPanel({
  blockers, needsApproval, state,
  onSubmit, onApprove, onReject, onLaunch, onFixBlockers, onResubmit, onViewQueue,
}: {
  blockers: number;
  needsApproval: boolean;
  state: string;
  onSubmit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onLaunch: () => void;
  onFixBlockers: () => void;
  onResubmit: () => void;
  onViewQueue: () => void;
}) {
  // Blocked — cannot proceed
  if (blockers > 0) {
    return (
      <Panel tone="danger" icon={Ban} title="Cannot submit — launch blocked" desc={`${blockers} ${blockers === 1 ? 'blocker' : 'blockers'} must be resolved before this campaign can be submitted or launched.`}>
        <button onClick={onFixBlockers} className="rounded-md px-4 py-2 text-[13px] font-semibold" style={{ background: 'var(--danger)', color: '#fff' }}>
          Resolve blockers
        </button>
      </Panel>
    );
  }

  // No approval needed — launch directly
  if (!needsApproval) {
    return (
      <Panel tone="clear" icon={ShieldCheck} title="No approval required" desc="This campaign is within all thresholds and passed every safety check. You can launch it now.">
        <button onClick={onLaunch} className="flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
          <Rocket size={15} strokeWidth={2.25} /> Launch campaign
        </button>
      </Panel>
    );
  }

  // Approval required — state machine
  if (state === 'approved') {
    return (
      <Panel tone="clear" icon={Check} title="Approved" desc="Sofia Lindqvist (Risk & Compliance) approved this campaign. You're clear to launch.">
        <button onClick={onLaunch} className="flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
          <Rocket size={15} strokeWidth={2.25} /> Launch campaign
        </button>
      </Panel>
    );
  }

  if (state === 'rejected') {
    return (
      <Panel tone="danger" icon={X} title="Rejected by reviewer" desc="Sofia Lindqvist (Risk & Compliance) rejected this campaign.">
        <div className="mb-3 rounded-lg border px-3.5 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">Reviewer comment</div>
          <p className="mt-1 text-[12.5px] text-fg-primary">Reward cap is too high for Bronze tier. Reduce max per player or restrict the audience to Gold and above, then resubmit.</p>
        </div>
        <button onClick={onResubmit} className="flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-primary)' }}>
          <Send size={14} strokeWidth={2} /> Edit & resubmit
        </button>
      </Panel>
    );
  }

  if (state === 'pending') {
    return (
      <Panel tone="warning" icon={Clock} title="Pending approval" desc="Submitted to Risk & Compliance. A reviewer must approve before this campaign can launch.">
        <div className="mb-3 flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
          <div className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>SL</div>
          <div>
            <div className="text-[12.5px] font-medium text-fg-primary">Sofia Lindqvist</div>
            <div className="text-[11.5px] text-fg-muted">Risk & Compliance · assigned</div>
          </div>
        </div>
        <button onClick={onViewQueue} className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
          <Inbox size={15} strokeWidth={2} /> View in approval queue
        </button>
        <div className="flex items-center gap-2 border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <button onClick={onApprove} className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[12.5px] font-semibold" style={{ background: 'var(--success)', color: '#04211E' }}>
            <Check size={14} strokeWidth={2.5} /> Approve
          </button>
          <button onClick={onReject} className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-[12.5px] font-semibold" style={{ borderColor: 'var(--border-strong)', color: 'var(--fg-secondary)' }}>
            <X size={14} strokeWidth={2.5} /> Reject
          </button>
          <span className="ml-1 text-[11px] text-fg-muted">simulate reviewer (demo)</span>
        </div>
      </Panel>
    );
  }

  // none → submit for approval
  return (
    <Panel tone="warning" icon={UserCheck} title="Approval required before launch" desc="This campaign has open warnings or a high-value reward, so it needs manager approval before it can go live.">
      <button onClick={onSubmit} className="flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
        <Send size={15} strokeWidth={2} /> Submit for approval
      </button>
    </Panel>
  );
}

function Panel({
  tone, icon: Icon, title, desc, children,
}: {
  tone: 'clear' | 'warning' | 'danger';
  icon: import('lucide-react').LucideIcon;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  const color = tone === 'danger' ? 'var(--danger)' : tone === 'warning' ? 'var(--warning)' : 'var(--success)';
  const border = tone === 'danger' ? 'rgba(240,87,107,0.35)' : tone === 'warning' ? 'rgba(231,168,60,0.35)' : 'var(--accent-border)';
  return (
    <div className="rounded-xl border p-5" style={{ borderColor: border, background: 'var(--surface-1)' }}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--surface-3)', color }}>
          <Icon size={18} strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <h3 className="text-[14.5px] font-semibold text-fg-primary">{title}</h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-fg-secondary">{desc}</p>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title, step, onEdit, children,
}: {
  title: string;
  step: StepId;
  onEdit: (path: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
        <span className="text-[12px] font-semibold uppercase tracking-wider text-fg-muted">{title}</span>
        <button onClick={() => onEdit(`/builder/${step}`)} className="text-[11.5px] font-medium" style={{ color: 'var(--accent)' }}>Edit</button>
      </div>
      <div className="flex flex-col gap-0.5 px-4 py-3">{children}</div>
    </div>
  );
}

function Kv({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="shrink-0 text-[12px] text-fg-muted">{k}</span>
      <span className={`truncate text-right text-[12.5px] font-medium text-fg-primary ${mono ? 'font-mono' : ''}`}>{v}</span>
    </div>
  );
}
