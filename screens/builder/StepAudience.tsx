import { useState } from 'react';
import { Users, UserMinus, SlidersHorizontal, Database, Lock, CheckCircle2, Search, Sparkles } from 'lucide-react';
import { Section, Field, TagSelect, Toggle } from '../../components/builder/form';
import { useCampaign } from '../../context/CampaignContext';
import { TIERS, COUNTRIES, estimateAudience } from '../../data/validation';
import { fmtNum } from '../../data/campaigns';

const SEGMENT_LIBRARY = [
  { name: 'New depositors', source: 'Platform', desc: 'First deposit completed in the selected campaign window.' },
  { name: 'Reactivated', source: 'Platform', desc: 'Returned after a dormant period and recent login.' },
  { name: 'Dormant 30d', source: 'Platform', desc: 'No qualifying activity for at least 30 days.' },
  { name: 'KYC verified', source: 'Platform', desc: 'Identity and age checks verified by operator platform.' },
  { name: 'Sports bettors', source: 'Platform', desc: 'Recent sportsbook activity across connected brands.' },
  { name: 'High rollers', source: 'MonoPulse', desc: 'High value wager behavior detected across casino events.' },
  { name: 'Weekend players', source: 'MonoPulse', desc: 'Usually active Friday through Sunday.' },
  { name: 'Sports crossovers', source: 'MonoPulse', desc: 'Sports users likely to engage with casino campaigns.' },
  { name: 'VIP watchlist', source: 'MonoPulse', desc: 'Operator-managed VIP audience with host context.' },
  { name: 'Churn risk', source: 'MonoPulse', desc: 'Activity decline suggests likely churn without intervention.' },
];
const HARD_GATES = [
  'Self-excluded and cooling-off players',
  'Suspended or closed accounts',
  'Players blocked by jurisdiction rule',
  'Players already above deposit or bonus limits',
];

type MatchMode = 'ANY' | 'ALL' | 'NONE';

export default function StepAudience() {
  const { draft, update } = useCampaign();
  const aud = estimateAudience(draft);
  const [mode, setMode] = useState<MatchMode>('ANY');
  const [query, setQuery] = useState('');

  const toggle = (key: 'segments' | 'tiers' | 'countries', v: string) => {
    const list = draft[key];
    update({ [key]: list.includes(v) ? list.filter((x) => x !== v) : [...list, v] } as never);
  };

  const selectedSegments = SEGMENT_LIBRARY.filter((s) => draft.segments.includes(s.name));
  const segmentSourceCount = new Set(selectedSegments.map((s) => s.source)).size;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[16px] font-semibold tracking-tight">Audience Scope</h2>
        <p className="mt-1 text-[13px] text-fg-secondary">
          Define who is allowed to enter the campaign. Mission completion rules are configured separately in Mission Logic.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Metric icon={Users} label="Estimated reach" value={fmtNum(aud.size)} detail="eligible after selected scope" accent />
        <Metric icon={UserMinus} label="Excluded" value={fmtNum(aud.excluded)} detail="risk, RG and hard gates" />
        <Metric icon={Database} label="Selected segments" value={`${selectedSegments.length}`} detail={`${segmentSourceCount || 0} source${segmentSourceCount === 1 ? '' : 's'} represented`} />
      </div>

      <Section
        icon={SlidersHorizontal}
        title="Segment library"
        desc="Search reusable audiences by business meaning. Source is shown as context, not something operators need to configure."
        aside={<ModeControl value={mode} onChange={setMode} />}
      >
        <SegmentLibrary query={query} onQuery={setQuery} selected={draft.segments} onToggle={(v) => toggle('segments', v)} />
        <div className="mt-4 rounded-lg border px-4 py-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
          <div className="flex items-center gap-2 text-[12.5px] font-medium text-fg-primary">
            <CheckCircle2 size={14} strokeWidth={2} style={{ color: 'var(--accent)' }} />
            Current boolean rule
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-fg-secondary">
            Player must match <span className="font-semibold text-fg-primary">{mode}</span> selected segment criteria across platform and MonoPulse sources before mission logic can start tracking progress.
          </p>
        </div>
      </Section>

      <Section icon={Users} title="Eligibility filters" desc="Filter eligible players after segment membership is resolved.">
        <div className="flex flex-col gap-4">
          <Field label="Loyalty tier">
            <TagSelect options={TIERS} selected={draft.tiers} onToggle={(v) => toggle('tiers', v)} />
          </Field>
          <Field label="Country / jurisdiction">
            <TagSelect options={COUNTRIES} selected={draft.countries} onToggle={(v) => toggle('countries', v)} />
          </Field>
          <div className="flex flex-col gap-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <Toggle checked={draft.vipOnly} onChange={(v) => update({ vipOnly: v })} label="VIP players only" desc="Restrict to players flagged VIP by the loyalty engine." />
            <Toggle checked={draft.excludeRiskFlagged} onChange={(v) => update({ excludeRiskFlagged: v })} label="Exclude fraud-flagged players" desc="Remove players in the fraud & abuse review queue from the audience." />
          </div>
        </div>
      </Section>

      <Section icon={Lock} title="Mandatory hard gates" desc="These exclusions are not campaign choices. They are enforced before the audience becomes eligible.">
        <div className="grid grid-cols-2 gap-3">
          {HARD_GATES.map((gate) => (
            <div key={gate} className="flex items-center gap-2 rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
              <Lock size={13} strokeWidth={2} className="shrink-0 text-fg-muted" />
              <span className="text-[12.5px] font-medium text-fg-primary">{gate}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail, accent }: { icon: typeof Users; label: string; value: string; detail: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border px-5 py-4" style={{ borderColor: accent ? 'var(--accent-border)' : 'var(--border-subtle)', background: accent ? 'var(--accent-bg)' : 'var(--surface-1)' }}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: accent ? 'var(--accent)' : 'var(--fg-muted)' }}>
        <Icon size={13} strokeWidth={2} /> {label}
      </div>
      <div className="mt-1.5 font-mono text-[26px] font-semibold leading-none tabular-nums text-fg-primary">{value}</div>
      <div className="mt-1 text-[12px] text-fg-secondary">{detail}</div>
    </div>
  );
}

function ModeControl({ value, onChange }: { value: MatchMode; onChange: (value: MatchMode) => void }) {
  const options: { id: MatchMode; label: string }[] = [
    { id: 'ANY', label: 'Any' },
    { id: 'ALL', label: 'All' },
    { id: 'NONE', label: 'None' },
  ];
  return (
    <div className="flex overflow-hidden rounded-md border" style={{ borderColor: 'var(--border-strong)' }}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className="px-3 py-1.5 text-[11.5px] font-semibold transition-colors"
          style={value === option.id ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { background: 'var(--surface-2)', color: 'var(--fg-secondary)' }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SegmentLibrary({
  query,
  onQuery,
  selected,
  onToggle,
}: {
  query: string;
  onQuery: (value: string) => void;
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const normalized = query.trim().toLowerCase();
  const visible = SEGMENT_LIBRARY.filter((segment) =>
    [segment.name, segment.source, segment.desc].some((value) => value.toLowerCase().includes(normalized))
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
        <Search size={15} strokeWidth={2} className="text-fg-muted" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search VIP, dormant, sports, first deposit..."
          className="w-full bg-transparent text-[13px] outline-none"
          style={{ color: 'var(--fg-primary)' }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {visible.map((segment) => {
          const on = selected.includes(segment.name);
          return (
            <button
              key={segment.name}
              onClick={() => onToggle(segment.name)}
              className="rounded-lg border p-3 text-left transition-colors"
              style={on ? { borderColor: 'var(--accent-border)', background: 'var(--accent-bg)' } : { borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-fg-primary">{segment.name}</div>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-fg-secondary">{segment.desc}</p>
                </div>
                <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ background: 'var(--surface-3)', color: 'var(--fg-muted)' }}>
                  {segment.source}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {visible.length === 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-5 text-[12.5px] text-fg-secondary" style={{ borderColor: 'var(--border-strong)' }}>
          <Sparkles size={15} strokeWidth={2} className="text-fg-muted" />
          No segment matches that search.
        </div>
      )}
    </div>
  );
}
