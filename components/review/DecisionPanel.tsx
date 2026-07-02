import { useState } from 'react';
import { Check, X, MessageSquare, Ban, Gavel, Lock, Bell, History, Rocket, RotateCcw } from 'lucide-react';

export type DecisionAction = 'approved' | 'rejected' | 'changes_requested';

interface Props {
  hasBlockers: boolean;
  onDecide: (action: DecisionAction, comment: string) => void;
  // prior decision context (read-only display)
  settled?: {
    label: string;
    fg: string;
    comment?: string;
    by?: string;
    at?: string;
  };
}

const ACTIONS: { id: DecisionAction; label: string; desc: string; icon: typeof Check; fg: string; bg: string; requiresComment: boolean; aftermath: string[] }[] = [
  {
    id: 'approved',
    label: 'Approve',
    desc: 'Clears this item for scheduling or launch.',
    icon: Check,
    fg: 'var(--success)',
    bg: 'var(--status-live-bg)',
    requiresComment: false,
    aftermath: ['Creator is notified', 'Campaign can launch or schedule', 'Approval is written to audit log'],
  },
  {
    id: 'changes_requested',
    label: 'Request changes',
    desc: 'Routes the item back to the creator with required fixes.',
    icon: MessageSquare,
    fg: 'var(--status-scheduled)',
    bg: 'var(--status-scheduled-bg)',
    requiresComment: true,
    aftermath: ['Creator must update configuration', 'Prior approval remains invalid', 'Re-submit required after edits'],
  },
  {
    id: 'rejected',
    label: 'Reject',
    desc: 'Stops this item until a new proposal is created or resubmitted.',
    icon: X,
    fg: 'var(--danger)',
    bg: 'var(--danger-bg)',
    requiresComment: true,
    aftermath: ['Creator is notified', 'Launch remains blocked', 'Decision is locked in audit history'],
  },
];

export default function DecisionPanel({ hasBlockers, onDecide, settled }: Props) {
  const [selected, setSelected] = useState<DecisionAction | null>(null);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState<{ action: DecisionAction; comment: string } | null>(null);

  const active = ACTIONS.find((a) => a.id === selected);
  const commentNeeded = active?.requiresComment ?? false;
  const canSubmit = selected !== null && (!commentNeeded || comment.trim().length > 0);

  // Decision already recorded this session
  if (done) {
    const a = ACTIONS.find((x) => x.id === done.action)!;
    const Icon = a.icon;
    return (
      <div className="rounded-xl border p-5" style={{ borderColor: a.fg, background: 'var(--surface-1)' }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: a.bg, color: a.fg }}>
            <Icon size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-fg-primary">Decision recorded</div>
            <div className="text-[12px]" style={{ color: a.fg }}>{a.label} · just now</div>
          </div>
        </div>
        {done.comment && (
          <div className="mt-3 rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Your comment</div>
            <p className="mt-1 text-[12.5px] text-fg-primary">{done.comment}</p>
          </div>
        )}
        <p className="mt-3 text-[11.5px] leading-relaxed text-fg-muted">
          The creator has been notified and the audit log updated. This is a demo — refresh to reset.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {a.aftermath.map((item) => (
            <div key={item} className="rounded-lg border px-2.5 py-2" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
              <div className="text-[11px] leading-snug text-fg-secondary">{item}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <Gavel size={15} strokeWidth={2} className="text-fg-secondary" />
        <h3 className="text-[13.5px] font-semibold text-fg-primary">Your decision</h3>
      </div>

      <div className="p-4">
        {hasBlockers && (
          <div className="mb-3 flex items-start gap-2 rounded-lg px-3 py-2.5" style={{ background: 'var(--danger-bg)' }}>
            <Ban size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--danger)' }} strokeWidth={2.25} />
            <p className="text-[11.5px] leading-relaxed" style={{ color: 'var(--fg-primary)' }}>
              Open blockers prevent approval. You can still request changes or reject and route it back to the creator.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            const isSelected = selected === a.id;
            const disabled = a.id === 'approved' && hasBlockers;
            return (
              <button
                key={a.id}
                disabled={disabled}
                onClick={() => setSelected(a.id)}
                className="flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-[13px] font-medium transition-colors"
                style={
                  disabled
                    ? { borderColor: 'var(--border-subtle)', color: 'var(--fg-muted)', cursor: 'not-allowed', opacity: 0.55 }
                    : isSelected
                    ? { borderColor: a.fg, background: a.bg, color: a.fg }
                    : { borderColor: 'var(--border-strong)', color: 'var(--fg-primary)' }
                }
              >
                <Icon size={15} strokeWidth={2.25} style={{ color: disabled ? 'var(--fg-muted)' : a.fg }} />
                <span className="flex-1">
                  <span className="block">{a.label}</span>
                  <span className="mt-0.5 block text-[11.5px] font-normal leading-snug" style={{ color: isSelected ? a.fg : 'var(--fg-muted)' }}>{a.desc}</span>
                </span>
                {disabled && <Lock size={13} strokeWidth={2} />}
              </button>
            );
          })}
        </div>

        {selected && (
          <>
            <div className="mt-3 rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
              <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">
                <RotateCcw size={12} strokeWidth={2} /> After submit
              </div>
              <div className="mt-2 grid gap-1.5">
                {active?.aftermath.map((item, index) => {
                  const Icon = index === 0 ? Bell : index === 1 ? Rocket : History;
                  return (
                    <div key={item} className="flex items-center gap-2 text-[11.5px] text-fg-secondary">
                      <Icon size={12} strokeWidth={2} style={{ color: active.fg }} />
                      {item}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-3">
              <label className="text-[11.5px] font-medium text-fg-secondary">
                {commentNeeded ? 'Comment to creator' : 'Note (optional)'}
                {commentNeeded && <span style={{ color: 'var(--danger)' }}> *</span>}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder={commentNeeded ? 'Explain what the creator must change…' : 'Add context for the audit log…'}
                className="mt-1.5 w-full resize-none rounded-md border px-3 py-2 text-[12.5px] leading-relaxed outline-none"
                style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)', color: 'var(--fg-primary)' }}
              />
            </div>
          </>
        )}

        <button
          disabled={!canSubmit}
          onClick={() => selected && (setDone({ action: selected, comment: comment.trim() }), onDecide(selected, comment.trim()))}
          className="mt-3 w-full rounded-md py-2.5 text-[13px] font-semibold transition-colors"
          style={canSubmit ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { background: 'var(--surface-3)', color: 'var(--fg-muted)', cursor: 'not-allowed' }}
        >
          Submit decision
        </button>

        {settled && (
          <div className="mt-4 border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Previous decision</div>
            <div className="mt-1 text-[12px] font-medium" style={{ color: settled.fg }}>{settled.label}</div>
            {settled.by && <div className="text-[11px] text-fg-muted">{settled.by} · {settled.at}</div>}
            {settled.comment && <p className="mt-1.5 text-[12px] leading-relaxed text-fg-secondary">“{settled.comment}”</p>}
          </div>
        )}
      </div>
    </div>
  );
}
