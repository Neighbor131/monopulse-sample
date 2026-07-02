import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban, ExternalLink, ChevronRight } from 'lucide-react';
import type { Player } from '../../data/players';
import { campaignRecords, CAMPAIGN_PART_META } from '../../data/playerDetail';
import type { CampaignRecord, CampaignPartStatus } from '../../data/playerDetail';
import { Pill } from '../../screens/Players';
import { Drawer, ConfirmBlock, AuditSection, SectionLabel, KV, Bar } from './Drawer';
import type { AuditEntry } from './Drawer';

interface Audit extends AuditEntry { cid: string }

export default function CampaignsTab({ p }: { p: Player }) {
  const records = useMemo(() => campaignRecords(p), [p]);
  const navigate = useNavigate();
  const [sel, setSel] = useState<CampaignRecord | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [audits, setAudits] = useState<Audit[]>([]);

  const statusOf = (r: CampaignRecord): CampaignPartStatus => (excluded.has(r.id) ? 'excluded' : r.status);
  const close = () => { setSel(null); setConfirming(false); };
  const exclude = (r: CampaignRecord, note: string) => {
    setExcluded((s) => new Set(s).add(r.id));
    setAudits((a) => [{ cid: r.id, at: 'just now', actor: 'You', action: 'Excluded from campaign — submitted', note, pending: true }, ...a]);
    setConfirming(false);
  };

  const groups: { key: CampaignPartStatus; label: string }[] = [
    { key: 'active', label: 'Active' }, { key: 'completed', label: 'Completed' }, { key: 'missed', label: 'Missed eligibility' }, { key: 'excluded', label: 'Excluded' },
  ];

  return (
    <div>
      {groups.map((g) => {
        const rows = records.filter((r) => statusOf(r) === g.key);
        if (rows.length === 0) return null;
        return (
          <div key={g.key} className="mb-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[12px] font-semibold text-fg-primary">{g.label}</span>
              <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-fg-muted" style={{ background: 'var(--surface-3)' }}>{rows.length}</span>
            </div>
            <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-1)' }}>
                    <th className="px-4 py-2 font-semibold">Campaign</th>
                    <th className="px-4 py-2 font-semibold">Module</th>
                    <th className="px-4 py-2 font-semibold">Progress</th>
                    <th className="px-4 py-2 font-semibold">Reward</th>
                    <th className="px-4 py-2 font-semibold">Reward status</th>
                    <th className="px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} onClick={() => { setSel(r); setConfirming(false); }} className="cursor-pointer border-t transition-colors" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-3)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}>
                      <td className="px-4 py-2.5">
                        <div className="text-[12.5px] font-medium text-fg-primary">{r.name}</div>
                        <div className="font-mono text-[10.5px] text-fg-muted">{r.id} · {r.brand}</div>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-fg-secondary">{r.module}</td>
                      <td className="px-4 py-2.5 w-32">
                        {r.progress !== null ? (
                          <div className="flex items-center gap-2"><Bar value={r.progress} /><span className="w-8 shrink-0 text-right font-mono text-[11px] tabular-nums text-fg-muted">{r.progress}%</span></div>
                        ) : <span className="text-[12px] text-fg-muted">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-fg-secondary">{r.reward}</td>
                      <td className="px-4 py-2.5"><span className="text-[12px] text-fg-secondary">{r.rewardStatus}</span></td>
                      <td className="px-2 py-2.5"><ChevronRight size={15} className="text-fg-muted" strokeWidth={2} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      <Drawer open={!!sel} onClose={close} title={sel?.name ?? ''} subtitle={sel ? `${sel.id} · ${sel.module}` : undefined}
        meta={sel && <Pill meta={CAMPAIGN_PART_META[statusOf(sel)]} />}
        footer={sel && !confirming && (
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium text-fg-secondary" style={{ border: '1px solid var(--border-strong)' }}><ExternalLink size={13} strokeWidth={2} />Inspect campaign</button>
            {statusOf(sel) === 'active' && <button onClick={() => setConfirming(true)} className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}><Ban size={13} strokeWidth={2} />Exclude from campaign</button>}
          </div>
        )}>
        {sel && !confirming && (
          <div>
            <SectionLabel>Participation</SectionLabel>
            <KV label="Module">{sel.module}</KV>
            <KV label="Brand">{sel.brand}</KV>
            <KV label="Joined">{sel.joined}</KV>
            {sel.progress !== null && <KV label="Progress"><span className="flex items-center gap-2"><Bar value={sel.progress} /><span className="font-mono text-[11px] tabular-nums">{sel.progress}%</span></span></KV>}
            <KV label="Reward">{sel.reward}</KV>
            <KV label="Reward status">{sel.rewardStatus}</KV>
            <p className="mt-3 rounded-lg px-3 py-2.5 text-[12px] leading-relaxed text-fg-secondary" style={{ background: 'var(--surface-2)' }}>{excluded.has(sel.id) ? 'Excluded pending approval — exclusion routed to the approvals queue.' : sel.note}</p>
            <AuditSection entries={audits.filter((a) => a.cid === sel.id)} />
          </div>
        )}
        {sel && confirming && (
          <ConfirmBlock icon={Ban} tone="danger" title={`Exclude ${p.alias} from ${sel.name}?`} description="The player will stop accruing rewards from this campaign and be suppressed from its future triggers. This is reversible but affects live earnings." requiresApproval needNote confirmLabel="Exclude" onConfirm={(note) => exclude(sel, note)} onCancel={() => setConfirming(false)} />
        )}
      </Drawer>
    </div>
  );
}
