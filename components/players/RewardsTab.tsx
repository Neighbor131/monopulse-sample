import { useMemo, useState } from 'react';
import { RotateCw, PauseCircle, PlayCircle, Eye, ChevronRight } from 'lucide-react';
import type { Player } from '../../data/players';
import { rewardRecords, REWARD_META } from '../../data/playerDetail';
import type { RewardRecord, RewardStatus } from '../../data/playerDetail';
import { Pill } from '../../screens/Players';
import { Drawer, ConfirmBlock, AuditSection, SectionLabel, KV } from './Drawer';
import type { AuditEntry } from './Drawer';

interface Audit extends AuditEntry { rid: string }
type ActionKind = 'retry' | 'hold' | 'release' | 'review';
const ACTION_CFG: Record<ActionKind, { label: string; tone: 'danger' | 'warning' | 'accent'; approval: boolean; verb: string; desc: string; audit: string; toStatus?: RewardStatus }> = {
  retry: { label: 'Retry fulfillment', tone: 'accent', approval: false, verb: 'Retry', desc: 'Re-attempt delivery of this reward to the operator platform via the fulfillment API.', audit: 'Retried fulfillment', toStatus: 'pending' },
  hold: { label: 'Hold reward', tone: 'warning', approval: false, verb: 'Hold', desc: 'Pause this reward and block payout until manually released. Use for suspected abuse or pending checks.', audit: 'Placed reward on hold', toStatus: 'held' },
  release: { label: 'Release hold', tone: 'accent', approval: true, verb: 'Release', desc: 'Release this held reward for payout to the player. Because it credits real value, this routes for approval.', audit: 'Released hold — submitted', toStatus: 'granted' },
  review: { label: 'Manual review', tone: 'warning', approval: false, verb: 'Flag for review', desc: 'Flag this reward for a manual review by the rewards operations team.', audit: 'Flagged for manual review' },
};

export default function RewardsTab({ p }: { p: Player }) {
  const records = useMemo(() => rewardRecords(p), [p]);
  const [sel, setSel] = useState<RewardRecord | null>(null);
  const [action, setAction] = useState<ActionKind | null>(null);
  const [override, setOverride] = useState<Record<string, RewardStatus>>({});
  const [audits, setAudits] = useState<Audit[]>([]);

  const statusOf = (r: RewardRecord): RewardStatus => override[r.id] ?? r.status;
  const close = () => { setSel(null); setAction(null); };
  const run = (r: RewardRecord, kind: ActionKind, note: string) => {
    const cfg = ACTION_CFG[kind];
    if (cfg.toStatus && !cfg.approval) setOverride((o) => ({ ...o, [r.id]: cfg.toStatus! }));
    setAudits((a) => [{ rid: r.id, at: 'just now', actor: 'You', action: cfg.audit, note, pending: cfg.approval }, ...a]);
    setAction(null);
  };

  const actionsFor = (s: RewardStatus): ActionKind[] => {
    if (s === 'failed') return ['retry', 'review'];
    if (s === 'held') return ['release', 'review'];
    if (s === 'pending') return ['hold', 'review'];
    return ['review'];
  };
  const ACTION_ICON: Record<ActionKind, typeof RotateCw> = { retry: RotateCw, hold: PauseCircle, release: PlayCircle, review: Eye };

  const counts = (['granted', 'pending', 'held', 'failed', 'expired'] as RewardStatus[]).map((s) => ({ s, n: records.filter((r) => statusOf(r) === s).length }));

  return (
    <div>
      {/* status summary */}
      <div className="mb-4 flex flex-wrap gap-2">
        {counts.filter((c) => c.n > 0).map((c) => (
          <div key={c.s} className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
            <Pill meta={REWARD_META[c.s]} /><span className="font-mono text-[13px] font-semibold tabular-nums text-fg-primary">{c.n}</span>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-1)' }}>
              <th className="px-4 py-2 font-semibold">Reward</th>
              <th className="px-4 py-2 font-semibold">Value</th>
              <th className="px-4 py-2 font-semibold">Fulfillment</th>
              <th className="px-4 py-2 font-semibold">Bonus GUID</th>
              <th className="px-4 py-2 font-semibold">Date</th>
              <th className="px-4 py-2 font-semibold">Status</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} onClick={() => { setSel(r); setAction(null); }} className="cursor-pointer border-t transition-colors" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-3)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}>
                <td className="px-4 py-2.5">
                  <div className="text-[12.5px] font-medium text-fg-primary">{r.name}</div>
                  <div className="text-[10.5px] text-fg-muted">{r.type} · {r.source}</div>
                </td>
                <td className="px-4 py-2.5 font-mono text-[12px] tabular-nums text-fg-primary">{r.value}</td>
                <td className="px-4 py-2.5 text-[12px] text-fg-secondary">{r.fulfillment}</td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-fg-muted">{r.guid}</td>
                <td className="px-4 py-2.5 text-[12px] text-fg-secondary">{r.date}</td>
                <td className="px-4 py-2.5"><Pill meta={REWARD_META[statusOf(r)]} /></td>
                <td className="px-2 py-2.5"><ChevronRight size={15} className="text-fg-muted" strokeWidth={2} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer open={!!sel} onClose={close} title={sel?.name ?? ''} subtitle={sel ? `${sel.id} · ${sel.type}` : undefined}
        meta={sel && <Pill meta={REWARD_META[statusOf(sel)]} />}
        footer={sel && !action && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {actionsFor(statusOf(sel)).map((k) => {
              const cfg = ACTION_CFG[k]; const Icon = ACTION_ICON[k];
              const primary = k === 'retry' || k === 'release';
              return <button key={k} onClick={() => setAction(k)} className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold" style={primary ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { border: '1px solid var(--border-strong)', color: cfg.tone === 'warning' ? 'var(--warning)' : 'var(--fg-secondary)' }}><Icon size={13} strokeWidth={2} />{cfg.label}</button>;
            })}
          </div>
        )}>
        {sel && !action && (
          <div>
            <SectionLabel>Reward detail</SectionLabel>
            <KV label="Type">{sel.type}</KV>
            <KV label="Value">{sel.value}</KV>
            <KV label="Fulfillment">{sel.fulfillment}</KV>
            <KV label="Bonus template / GUID"><span className="font-mono text-[11.5px]">{sel.guid}</span></KV>
            <KV label="Source">{sel.source}</KV>
            <KV label="Issued">{sel.date}</KV>
            <p className="mt-3 rounded-lg px-3 py-2.5 text-[12px] leading-relaxed text-fg-secondary" style={{ background: 'var(--surface-2)' }}>{sel.note}</p>
            <AuditSection entries={audits.filter((a) => a.rid === sel.id)} />
          </div>
        )}
        {sel && action && (
          <ConfirmBlock icon={ACTION_ICON[action]} tone={ACTION_CFG[action].tone} title={`${ACTION_CFG[action].verb} — ${sel.name}`} description={ACTION_CFG[action].desc} requiresApproval={ACTION_CFG[action].approval} needNote={action !== 'retry'} confirmLabel={ACTION_CFG[action].verb} onConfirm={(note) => run(sel, action, note)} onCancel={() => setAction(null)} />
        )}
      </Drawer>
    </div>
  );
}
