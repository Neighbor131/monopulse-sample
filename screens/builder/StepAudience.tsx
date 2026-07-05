import { useState } from 'react';
import { Users, UserMinus, SlidersHorizontal, Database, Building2, Lock, CheckCircle2 } from 'lucide-react';
import { Section, Field, TagSelect, Toggle } from '../../components/builder/form';
import { useCampaign } from '../../context/CampaignContext';
import { TIERS, COUNTRIES, estimateAudience } from '../../data/validation';
import { fmtNum } from '../../data/campaigns';

const PLATFORM_SEGMENTS = ['New depositors', 'Reactivated', 'Dormant 30d', 'KYC verified', 'Sports bettors'];
const MONOPULSE_SEGMENTS = ['High rollers', 'Weekend players', 'Sports crossovers', 'VIP watchlist', 'Churn risk'];
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

  const toggle = (key: 'segments' | 'tiers' | 'countries', v: string) => {
    const list = draft[key];
    update({ [key]: list.includes(v) ? list.filter((x) => x !== v) : [...list, v] } as never);
  };

  const selectedPlatform = draft.segments.filter((s) => PLATFORM_SEGMENTS.includes(s));
  const selectedMonoPulse = draft.segments.filter((s) => MONOPULSE_SEGMENTS.includes(s));

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
        <Metric icon={Database} label="Segment sources" value={`${selectedPlatform.length + selectedMonoPulse.length}`} detail="platform + MonoPulse inputs" />
      </div>

      <Section
        icon={SlidersHorizontal}
        title="Segment membership"
        desc="Choose whether players qualify through operator platform segments, MonoPulse-built segments, or both."
        aside={<ModeControl value={mode} onChange={setMode} />}
      >
        <div className="grid grid-cols-2 gap-4">
          <SegmentSource
            icon={Building2}
            title="Platform segments"
            desc="Synced from the operator platform or CRM."
            options={PLATFORM_SEGMENTS}
            selected={draft.segments}
            onToggle={(v) => toggle('segments', v)}
          />
          <SegmentSource
            icon={Database}
            title="MonoPulse segments"
            desc="Built in-house from events, player profile and campaign behavior."
            options={MONOPULSE_SEGMENTS}
            selected={draft.segments}
            onToggle={(v) => toggle('segments', v)}
          />
        </div>
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

function SegmentSource({
  icon: Icon,
  title,
  desc,
  options,
  selected,
  onToggle,
}: {
  icon: typeof Database;
  title: string;
  desc: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <div className="flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ background: 'var(--surface-3)', color: 'var(--accent)' }}>
          <Icon size={16} strokeWidth={1.9} />
        </span>
        <div>
          <div className="text-[13.5px] font-semibold text-fg-primary">{title}</div>
          <p className="mt-0.5 text-[12px] leading-relaxed text-fg-secondary">{desc}</p>
        </div>
      </div>
      <div className="mt-3">
        <TagSelect options={options} selected={selected} onToggle={onToggle} />
      </div>
    </div>
  );
}
