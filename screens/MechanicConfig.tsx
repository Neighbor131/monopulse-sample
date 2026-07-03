import { useMemo, useState } from 'react';
import { Settings2, ShieldCheck, SlidersHorizontal, Workflow } from 'lucide-react';
import { CAMPAIGN_TYPES } from '../data/campaigns';
import type { CampaignTypeId } from '../data/campaigns';
import { MODULE_SPECS, fieldMatchesSubtype } from '../data/modules';
import type { ModuleField, ModuleSection, ModuleStep } from '../data/modules';

const STEPS: { id: ModuleStep; label: string }[] = [
  { id: 'setup', label: 'Setup' },
  { id: 'audience', label: 'Audience' },
  { id: 'rewards', label: 'Rewards' },
  { id: 'budget', label: 'Budget' },
  { id: 'review', label: 'Review' },
];

export default function MechanicConfig() {
  const [typeId, setTypeId] = useState<CampaignTypeId>('raffle');
  const type = CAMPAIGN_TYPES.find((item) => item.id === typeId) ?? CAMPAIGN_TYPES[0];
  const [subtype, setSubtype] = useState(type.subtypes?.[0]?.id ?? '');
  const subtypes = type.subtypes ?? [];

  const sections = useMemo(() => {
    return (MODULE_SPECS[typeId] ?? []).filter((section) => {
      if (!section.subtypes) return true;
      return subtype ? section.subtypes.includes(subtype) : true;
    });
  }, [subtype, typeId]);

  const fieldCount = sections.reduce((sum, section) => sum + section.fields.filter((field) => fieldMatchesSubtype(field.subtypes, subtype)).length, 0);
  const reviewItems = [
    `${sections.length} mechanic sections`,
    `${fieldCount} backend/config fields`,
    `${subtypes.length || 1} subtype path${subtypes.length === 1 ? '' : 's'}`,
  ];

  return (
    <div className="mx-auto w-full max-w-[1360px] px-8 py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[19px] font-semibold tracking-tight">Mechanic configuration</h1>
            <span className="rounded px-2 py-1 text-[11px] font-semibold" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>Campaign-type depth</span>
          </div>
          <p className="mt-1 text-[13px] text-fg-secondary">Preview the configuration surface each gamified mechanic needs before backend schema and validation rules are finalized.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3">
        <Kpi icon={Workflow} label="Mechanics" value={String(CAMPAIGN_TYPES.length)} />
        <Kpi icon={SlidersHorizontal} label="Selected fields" value={String(fieldCount)} />
        <Kpi icon={Settings2} label="Sections" value={String(sections.length)} />
        <Kpi icon={ShieldCheck} label="Review gates" value="Budget + audit" accent="var(--warning)" />
      </div>

      <div className="mt-6 grid grid-cols-[300px_minmax(0,1fr)] gap-4">
        <section className="rounded-xl border p-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <div className="px-2 pb-2 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Campaign mechanics</div>
          <div className="grid gap-1">
            {CAMPAIGN_TYPES.map((item) => {
              const Icon = item.icon;
              const active = item.id === typeId;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTypeId(item.id);
                    setSubtype(item.subtypes?.[0]?.id ?? '');
                  }}
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-left"
                  style={active ? { background: 'var(--accent-bg)', color: 'var(--accent)' } : { color: 'var(--fg-secondary)' }}
                >
                  <Icon size={16} className="mt-0.5 shrink-0" strokeWidth={1.9} />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold">{item.name}</span>
                    <span className="mt-0.5 block text-[11.5px] leading-4 text-fg-muted">{item.bestFor}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid gap-4">
          <section className="rounded-xl border p-5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <type.icon size={20} strokeWidth={1.9} style={{ color: 'var(--accent)' }} />
                  <h2 className="text-[17px] font-semibold text-fg-primary">{type.name}</h2>
                </div>
                <p className="mt-1 max-w-[720px] text-[13px] leading-5 text-fg-secondary">{type.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge label={type.complexity} />
                <Badge label={type.group} />
              </div>
            </div>

            {subtypes.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {subtypes.map((item) => {
                  const active = subtype === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSubtype(item.id)}
                      className="rounded-md border px-3 py-2 text-left"
                      style={active ? { borderColor: 'var(--accent-border)', background: 'var(--accent-bg)' } : { borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}
                    >
                      <span className="block text-[12.5px] font-semibold text-fg-primary">{item.name}</span>
                      <span className="mt-0.5 block max-w-[260px] text-[11.5px] text-fg-muted">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
            <div className="grid grid-cols-[190px_1fr] border-b px-5 py-3 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ borderColor: 'var(--border-subtle)' }}>
              <span>Builder step</span>
              <span>Mechanic-specific configuration</span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {STEPS.map((step) => {
                const stepSections = sections.filter((section) => section.step === step.id);
                return (
                  <div key={step.id} className="grid grid-cols-[190px_1fr] gap-4 px-5 py-4">
                    <div>
                      <div className="text-[13px] font-semibold text-fg-primary">{step.label}</div>
                      <div className="mt-1 text-[11.5px] text-fg-muted">{stepSections.length} section{stepSections.length === 1 ? '' : 's'}</div>
                    </div>
                    <div className="grid gap-3">
                      {stepSections.length ? stepSections.map((section) => <SectionPreview key={section.id} section={section} subtype={subtype} />) : <span className="text-[12px] text-fg-muted">No mechanic-specific fields for this step.</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
            <div className="text-[13px] font-semibold text-fg-primary">Backend handoff summary</div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {reviewItems.map((item) => <div key={item} className="rounded-lg border px-3 py-2 text-[12.5px] text-fg-secondary" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>{item}</div>)}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SectionPreview({ section, subtype }: { section: ModuleSection; subtype: string }) {
  const Icon = section.icon;
  const fields = section.fields.filter((field) => fieldMatchesSubtype(field.subtypes, subtype));
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <div className="flex items-start gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style={{ background: 'var(--surface-3)', color: 'var(--accent)' }}><Icon size={14} strokeWidth={1.9} /></span>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-fg-primary">{section.title}</div>
          {section.desc && <div className="mt-0.5 text-[11.5px] text-fg-muted">{section.desc}</div>}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {fields.map((field) => <FieldChip key={field.key} field={field} />)}
      </div>
    </div>
  );
}

function FieldChip({ field }: { field: ModuleField }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11.5px]" style={{ borderColor: 'var(--border-subtle)', color: 'var(--fg-secondary)' }}>
      <span className="font-medium text-fg-primary">{field.label || field.type}</span>
      <span className="text-fg-muted">{field.type}</span>
    </span>
  );
}

function Kpi({ icon: Icon, label, value, accent = 'var(--accent)' }: { icon: typeof Workflow; label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border px-4 py-3.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><Icon size={13} style={{ color: accent }} />{label}</div>
      <div className="mt-1.5 font-mono text-[22px] font-semibold leading-none text-fg-primary">{value}</div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return <span className="rounded-md px-2 py-1 text-[11px] font-semibold capitalize" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{label}</span>;
}
