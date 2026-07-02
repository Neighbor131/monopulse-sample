import { useState } from 'react';
import { FileText, Building2, Network, Search, Check, CalendarClock, RefreshCw } from 'lucide-react';
import { Section, Field, TextInput, TextArea, Select, TagSelect } from '../../components/builder/form';
import { useProgram } from '../../context/ProgramContext';
import { BRANDS } from '../../data/campaigns';
import { OWNERS } from '../../data/validation';
import { JURISDICTIONS, SEGMENTS, RESET_LABEL } from '../../data/loyalty';
import type { ResetCycle } from '../../data/loyalty';

const RESET_KEYS = Object.keys(RESET_LABEL) as ResetCycle[];

export default function StepSetup() {
  const { draft, update } = useProgram();
  const [brandQuery, setBrandQuery] = useState('');
  const filtered = BRANDS.filter((b) => b.name.toLowerCase().includes(brandQuery.toLowerCase()) || b.code.toLowerCase().includes(brandQuery.toLowerCase()));
  const isNetwork = draft.brandScope === 'network';

  const toggleBrand = (code: string) => update({ brands: draft.brands.includes(code) ? draft.brands.filter((c) => c !== code) : [...draft.brands, code] });
  const toggleJur = (j: string) => update({ jurisdictions: draft.jurisdictions.includes(j) ? draft.jurisdictions.filter((x) => x !== j) : [...draft.jurisdictions, j] });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[16px] font-semibold tracking-tight">Program setup & scope</h2>
        <p className="mt-1 text-[13px] text-fg-secondary">Name the status program, set requalification, and decide which brands it runs on.</p>
      </div>

      <Section icon={FileText} title="Program details">
        <div className="flex flex-col gap-4">
          <Field label="Program name" hint="internal + player-facing" required>
            <TextInput value={draft.name} onChange={(v) => update({ name: v })} placeholder="e.g. VegasVault Status Ladder" />
          </Field>
          <Field label="Description" hint="how the program behaves">
            <TextArea value={draft.description} onChange={(v) => update({ description: v })} placeholder="Points from real-money wagering, rolling requalification…" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Segment">
              <Select value={draft.segment} onChange={(v) => update({ segment: v })} options={SEGMENTS} />
            </Field>
            <Field label="Owner">
              <Select value={draft.owner} onChange={(v) => update({ owner: v })} options={OWNERS} />
            </Field>
          </div>
        </div>
      </Section>

      <Section icon={CalendarClock} title="Schedule & requalification">
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-1.5 text-[12.5px] font-medium text-fg-secondary">Launch</div>
            <div className="grid grid-cols-2 gap-2.5">
              <ChoiceCard active={draft.scheduleMode === 'now'} onClick={() => update({ scheduleMode: 'now' })} title="Launch now" desc="Goes live as soon as it’s approved." />
              <ChoiceCard active={draft.scheduleMode === 'scheduled'} onClick={() => update({ scheduleMode: 'scheduled' })} title="Schedule" desc="Set a future go-live date." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {draft.scheduleMode === 'scheduled' && (
              <Field label="Go-live date" required>
                <TextInput type="date" value={draft.scheduledFor} onChange={(v) => update({ scheduledFor: v })} />
              </Field>
            )}
            <Field label="Reset cycle" hint="requalification window">
              <Select
                value={RESET_LABEL[draft.resetCycle]}
                onChange={(v) => update({ resetCycle: RESET_KEYS.find((k) => RESET_LABEL[k] === v) ?? draft.resetCycle })}
                options={RESET_KEYS.map((k) => RESET_LABEL[k])}
              />
            </Field>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border px-4 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
            <RefreshCw size={14} className="mt-0.5 shrink-0 text-fg-muted" strokeWidth={1.75} />
            <p className="text-[12px] leading-relaxed text-fg-secondary">
              Players requalify every <span className="font-medium text-fg-primary">{RESET_LABEL[draft.resetCycle].toLowerCase()}</span>. Maintenance thresholds you set in the tier matrix determine who holds or drops a tier at reset.
            </p>
          </div>
        </div>
      </Section>

      <Section icon={Building2} title="Brand scope" desc="Run per brand, or pool status across the network.">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2.5">
            <ChoiceCard active={draft.brandScope === 'brand_only'} onClick={() => update({ brandScope: 'brand_only' })} icon={Building2} title="Brand only" code="BRAND_ONLY" desc="Runs on one or more brands, tracked per brand." />
            <ChoiceCard active={isNetwork} onClick={() => update({ brandScope: 'network' })} icon={Network} title="Network" code="NETWORK" desc="Shared status wallet pooled across brands." />
          </div>
          <div className="rounded-lg border" style={{ borderColor: 'var(--border-strong)' }}>
            <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: 'var(--border-subtle)' }}>
              <Search size={14} className="text-fg-muted" strokeWidth={1.75} />
              <input value={brandQuery} onChange={(e) => setBrandQuery(e.target.value)} placeholder="Search brands…" className="w-full bg-transparent text-[13px] outline-none" style={{ color: 'var(--fg-primary)' }} />
              <span className="text-[11.5px] text-fg-muted">{draft.brands.length} selected</span>
            </div>
            <div className="max-h-48 overflow-y-auto p-1.5">
              {filtered.map((b) => {
                const on = draft.brands.includes(b.code);
                return (
                  <button key={b.code} onClick={() => toggleBrand(b.code)} className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors" style={{ background: on ? 'var(--surface-3)' : 'transparent' }}>
                    <span className="flex h-4 w-4 items-center justify-center rounded" style={on ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { border: '1px solid var(--border-strong)' }}>
                      {on && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className="font-mono text-[11px] font-medium text-fg-muted">{b.code}</span>
                    <span className="text-[13px] text-fg-primary">{b.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <Field label="Jurisdictions" hint="where the program is offered">
            <TagSelect options={JURISDICTIONS} selected={draft.jurisdictions} onToggle={toggleJur} />
          </Field>
        </div>
      </Section>
    </div>
  );
}

function ChoiceCard({ active, onClick, icon: Icon, title, code, desc }: { active: boolean; onClick: () => void; icon?: typeof Building2; title: string; code?: string; desc: string }) {
  return (
    <button onClick={onClick} className="relative flex flex-col gap-1.5 rounded-lg border px-4 py-3.5 text-left transition-colors" style={active ? { borderColor: 'var(--accent-border)', background: 'var(--accent-bg)' } : { borderColor: 'var(--border-strong)' }}>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} style={{ color: active ? 'var(--accent)' : 'var(--fg-secondary)' }} strokeWidth={1.75} />}
        <span className="text-[13.5px] font-medium" style={{ color: active ? 'var(--accent)' : 'var(--fg-primary)' }}>{title}</span>
        {code && <span className="ml-auto font-mono text-[10px] font-medium text-fg-muted">{code}</span>}
      </div>
      <span className="text-[11.5px] leading-relaxed text-fg-muted">{desc}</span>
    </button>
  );
}
