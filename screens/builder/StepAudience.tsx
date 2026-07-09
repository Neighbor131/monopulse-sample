import { useState } from 'react';
import { Check, CheckCircle2, Clock3, Database, Eye, Search, ShieldCheck, Users, UserMinus, X } from 'lucide-react';
import { useCampaign } from '../../context/CampaignContext';
import { estimateAudience } from '../../data/validation';
import { fmtNum } from '../../data/campaigns';

type MatchMode = 'ANY' | 'ALL' | 'NONE';

type Segment = {
  name: string;
  source: string;
  freshness: string;
  count: number;
  desc: string;
  criteria: { join: string; field: string; operator: string; value: string }[];
};

const SEGMENT_LIBRARY: Segment[] = [
  {
    name: 'New depositors', source: 'Platform / CRM', freshness: 'Synced 18m ago', count: 12_480,
    desc: 'First deposit completed during the selected campaign window.',
    criteria: [
      { join: 'WHERE', field: 'First deposit date', operator: 'within', value: '30 days' },
      { join: 'AND', field: 'Account status', operator: 'equals', value: 'Active' },
    ],
  },
  {
    name: 'Reactivated', source: 'Platform / CRM', freshness: 'Synced 31m ago', count: 8_920,
    desc: 'Returned after a dormant period and a recent login.',
    criteria: [
      { join: 'WHERE', field: 'Last active', operator: 'within', value: '7 days' },
      { join: 'AND', field: 'Prior inactivity', operator: 'greater than', value: '30 days' },
    ],
  },
  {
    name: 'Dormant 30d', source: 'Platform / CRM', freshness: 'Synced 42m ago', count: 22_610,
    desc: 'No qualifying activity for at least 30 days.',
    criteria: [
      { join: 'WHERE', field: 'Last casino activity', operator: 'more than', value: '30 days ago' },
      { join: 'AND', field: 'Account status', operator: 'equals', value: 'Active' },
    ],
  },
  {
    name: 'KYC verified', source: 'Platform / CRM', freshness: 'Synced 14m ago', count: 48_210,
    desc: 'Identity and age checks verified by the operator platform.',
    criteria: [
      { join: 'WHERE', field: 'KYC status', operator: 'equals', value: 'Verified' },
      { join: 'AND', field: 'Age', operator: 'greater than or equal to', value: '18' },
    ],
  },
  {
    name: 'High rollers', source: 'Platform / CRM', freshness: 'Synced 2h ago', count: 5_564,
    desc: 'High value wagering behaviour provided by the operator segment feed.',
    criteria: [
      { join: 'WHERE', field: 'Lifetime deposits', operator: 'greater than', value: 'EUR 2,500' },
      { join: 'AND', field: 'Player tier', operator: 'in', value: 'Diamond, VIP, Elite' },
      { join: 'AND', field: 'Country of registration', operator: 'equals', value: 'Malta' },
    ],
  },
  {
    name: 'VIP watchlist', source: 'Platform / CRM', freshness: 'Synced 11m ago', count: 348,
    desc: 'Operator-managed VIP audience with host context.',
    criteria: [
      { join: 'WHERE', field: 'VIP flag', operator: 'equals', value: 'True' },
      { join: 'AND', field: 'Account manager', operator: 'is assigned', value: 'Any' },
    ],
  },
];

export default function StepAudience() {
  const { draft, update } = useCampaign();
  const aud = estimateAudience(draft);
  const [mode, setMode] = useState<MatchMode>('ANY');
  const [query, setQuery] = useState('');
  const [inspected, setInspected] = useState<Segment | null>(null);
  const selectedSegments = SEGMENT_LIBRARY.filter((segment) => draft.segments.includes(segment.name));

  const toggle = (name: string) => {
    update({ segments: draft.segments.includes(name) ? draft.segments.filter((value) => value !== name) : [...draft.segments, name] });
  };

  return (
    <>
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-[16px] font-semibold tracking-tight">Choose audience</h2>
          <p className="mt-1 text-[13px] text-fg-secondary">Use existing platform or CRM segments. MonoPulse reads dynamic membership; it does not create or own customer segments.</p>
        </div>

        <div className="flex items-start gap-3 rounded-lg border px-4 py-3" style={{ borderColor: 'var(--accent-border)', background: 'var(--accent-bg)' }}>
          <Database size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
          <div className="min-w-0">
            <div className="text-[12.5px] font-semibold text-fg-primary">Platform-owned audience</div>
            <p className="mt-0.5 text-[12px] leading-5 text-fg-secondary">Counts are cached snapshots with visible sync times. Membership stays dynamic after a campaign is launched.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Metric icon={Users} label="Cached reach" value={fmtNum(aud.size)} detail="latest eligible membership snapshot" accent />
          <Metric icon={UserMinus} label="Excluded" value={fmtNum(aud.excluded)} detail="handled by Safety before launch" />
          <Metric icon={Database} label="Selected" value={`${selectedSegments.length}`} detail={selectedSegments.length === 1 ? 'platform segment' : 'platform segments'} />
        </div>

        <section className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <div className="flex items-start justify-between gap-5 border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <h3 className="text-[13.5px] font-semibold text-fg-primary">Platform segment library</h3>
              <p className="mt-1 text-[12px] text-fg-secondary">Select the audience source. Inspecting criteria never changes the segment.</p>
            </div>
            <ModeControl value={mode} onChange={setMode} />
          </div>

          <div className="p-4">
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
              <Search size={15} strokeWidth={2} className="text-fg-muted" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search segments" className="w-full bg-transparent text-[13px] outline-none" style={{ color: 'var(--fg-primary)' }} />
            </div>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {SEGMENT_LIBRARY.filter((segment) => `${segment.name} ${segment.desc}`.toLowerCase().includes(query.trim().toLowerCase())).map((segment) => {
              const selected = draft.segments.includes(segment.name);
              return (
                <div key={segment.name} className="grid grid-cols-[minmax(0,1fr)_120px_110px_96px] items-center gap-4 px-5 py-3.5">
                  <button onClick={() => toggle(segment.name)} className="flex min-w-0 items-start gap-3 text-left">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded" style={selected ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { border: '1px solid var(--border-strong)' }}>
                      {selected && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold text-fg-primary">{segment.name}</span>
                      <span className="mt-0.5 block truncate text-[11.5px] text-fg-secondary">{segment.desc}</span>
                    </span>
                  </button>
                  <span className="font-mono text-[12.5px] tabular-nums text-fg-primary">{fmtNum(segment.count)}</span>
                  <span className="flex items-center gap-1.5 text-[11px] text-fg-muted"><Clock3 size={12} />{segment.freshness}</span>
                  <button onClick={() => setInspected(segment)} className="flex items-center justify-end gap-1.5 text-[11.5px] font-medium" style={{ color: 'var(--accent)' }}><Eye size={13} />Inspect</button>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-lg border px-4 py-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
          <div>
            <div className="flex items-center gap-2 text-[12.5px] font-semibold text-fg-primary"><CheckCircle2 size={14} style={{ color: 'var(--accent)' }} />Audience matching</div>
            <p className="mt-1 text-[12px] text-fg-secondary">A player must match <span className="font-semibold text-fg-primary">{mode}</span> selected segment{selectedSegments.length === 1 ? '' : 's'} before mission logic can evaluate their events.</p>
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-fg-secondary"><ShieldCheck size={14} />Safety gates apply later</div>
        </div>
      </div>

      <CriteriaDrawer segment={inspected} onClose={() => setInspected(null)} />
    </>
  );
}

function CriteriaDrawer({ segment, onClose }: { segment: Segment | null; onClose: () => void }) {
  if (!segment) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close criteria preview" className="absolute inset-0 cursor-default" style={{ background: 'var(--overlay-scrim)' }} onClick={onClose} />
      <aside className="relative flex h-full w-[520px] max-w-[calc(100vw-32px)] flex-col border-l" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-lg)' }}>
        <header className="flex items-start justify-between gap-4 border-b px-6 py-5" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="flex items-center gap-2"><h3 className="text-[16px] font-semibold text-fg-primary">{segment.name}</h3><span className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>Read only</span></div>
            <p className="mt-1 text-[12px] text-fg-secondary">Criteria supplied and owned by {segment.source}.</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-fg-muted" style={{ background: 'var(--surface-2)' }}><X size={16} /></button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <DrawerMetric label="Cached players" value={fmtNum(segment.count)} />
            <DrawerMetric label="Last sync" value={segment.freshness.replace('Synced ', '')} />
          </div>
          <section className="mt-5">
            <div className="mb-2 flex items-center justify-between"><h4 className="text-[12.5px] font-semibold text-fg-primary">Source criteria</h4><span className="text-[11px] text-fg-muted">Match all rules</span></div>
            <div className="flex flex-col gap-2">
              {segment.criteria.map((criterion) => <div key={`${criterion.field}-${criterion.value}`} className="grid grid-cols-[58px_1fr_118px_1fr] items-center gap-2 rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><span className="text-[10px] font-semibold uppercase tracking-wide text-fg-muted">{criterion.join}</span><span className="text-[12px] font-medium text-fg-primary">{criterion.field}</span><span className="text-[12px] text-fg-secondary">{criterion.operator}</span><span className="truncate text-[12px] text-fg-secondary">{criterion.value}</span></div>)}
            </div>
          </section>
          <div className="mt-5 flex items-start gap-2.5 rounded-lg border px-3.5 py-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
            <Clock3 size={14} className="mt-0.5 shrink-0 text-fg-muted" />
            <p className="text-[12px] leading-5 text-fg-secondary">MonoPulse uses the last available platform snapshot for reach and preview. Membership is re-evaluated dynamically by the platform after launch.</p>
          </div>
        </div>
        <footer className="border-t px-6 py-4" style={{ borderColor: 'var(--border-subtle)' }}><button onClick={onClose} className="w-full rounded-md px-3 py-2 text-[12.5px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>Done</button></footer>
      </aside>
    </div>
  );
}

function DrawerMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div className="text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">{label}</div><div className="mt-1 font-mono text-[14px] font-semibold text-fg-primary">{value}</div></div>;
}

function Metric({ icon: Icon, label, value, detail, accent }: { icon: typeof Users; label: string; value: string; detail: string; accent?: boolean }) {
  return <div className="rounded-xl border px-5 py-4" style={{ borderColor: accent ? 'var(--accent-border)' : 'var(--border-subtle)', background: accent ? 'var(--accent-bg)' : 'var(--surface-1)' }}><div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: accent ? 'var(--accent)' : 'var(--fg-muted)' }}><Icon size={13} />{label}</div><div className="mt-1.5 font-mono text-[26px] font-semibold leading-none tabular-nums text-fg-primary">{value}</div><div className="mt-1 text-[12px] text-fg-secondary">{detail}</div></div>;
}

function ModeControl({ value, onChange }: { value: MatchMode; onChange: (value: MatchMode) => void }) {
  return <div className="flex shrink-0 overflow-hidden rounded-md border" style={{ borderColor: 'var(--border-strong)' }}>{(['ANY', 'ALL', 'NONE'] as MatchMode[]).map((option) => <button key={option} onClick={() => onChange(option)} className="px-3 py-1.5 text-[11.5px] font-semibold transition-colors" style={value === option ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { background: 'var(--surface-2)', color: 'var(--fg-secondary)' }}>{option[0]}{option.slice(1).toLowerCase()}</button>)}</div>;
}
