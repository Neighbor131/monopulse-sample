import { Plus, Trash2, ShieldCheck, Info, AlertTriangle, Copy } from 'lucide-react';
import { Section, Field, Toggle, Select } from './form';
import { useCampaign } from '../../context/CampaignContext';
import { moduleSectionsForStep, fieldMatchesSubtype } from '../../data/modules';
import type { ModuleField, ModuleSection, ModuleStep } from '../../data/modules';
import { getSubtype } from '../../data/campaigns';

// deterministic pseudo-hash for commit/reveal displays
function pseudoHash(seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let out = '';
  for (let i = 0; i < 16; i++) {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    out += (h >>> 0).toString(16).padStart(8, '0').slice(0, 4);
  }
  return out.slice(0, 56);
}

export default function ModuleSections({ step }: { step: ModuleStep }) {
  const { draft } = useCampaign();
  const sections = moduleSectionsForStep(draft.type, step, draft.subtype);
  if (sections.length === 0) return null;
  return (
    <>
      {sections.map((s) => <ModuleSectionBlock key={s.id} section={s} subtype={draft.subtype} />)}
    </>
  );
}

function ModuleSectionBlock({ section, subtype }: { section: ModuleSection; subtype: string }) {
  const { draft, setModuleField } = useCampaign();
  const mod = draft.module;

  const defaults: Record<string, unknown> = {};
  section.fields.forEach((f) => { if (f.default !== undefined) defaults[f.key] = f.default; });
  const rawVal = (k: string): unknown => (k in mod ? mod[k] : defaults[k]);
  const strVal = (k: string): string => {
    const v = rawVal(k);
    return v === undefined || v === null ? '' : String(v);
  };
  const visible = (f: ModuleField): boolean => {
    if (!fieldMatchesSubtype(f.subtypes, subtype)) return false;
    if (!f.showIf) return true;
    return rawVal(f.showIf.key) === f.showIf.equals;
  };

  const shownFields = section.fields.filter(visible);
  if (shownFields.length === 0) return null;

  const subName = getSubtype(draft.type, subtype)?.name;

  return (
    <Section
      icon={section.icon}
      title={section.title}
      desc={section.desc}
      aside={
        <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
          Module{subName ? <span style={{ opacity: 0.7 }}>· {subName}</span> : null}
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        {shownFields.map((f) => {
          const full = f.full || ['tiers', 'matrix', 'info', 'hash', 'toggle'].includes(f.type);
          return (
            <div key={f.key} className={full ? 'col-span-2' : ''}>
              <FieldRenderer
                field={f}
                strVal={strVal}
                rawVal={rawVal}
                set={(v) => setModuleField(f.key, v)}
                campaignName={draft.name || 'campaign'}
              />
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function FieldRenderer({
  field, strVal, rawVal, set, campaignName,
}: {
  field: ModuleField;
  strVal: (k: string) => string;
  rawVal: (k: string) => unknown;
  set: (v: unknown) => void;
  campaignName: string;
}) {
  switch (field.type) {
    case 'toggle':
      return (
        <Toggle
          checked={rawVal(field.key) === true}
          onChange={(v) => set(v)}
          label={field.label}
          desc={field.hint}
        />
      );

    case 'select':
      return (
        <Field label={field.label} hint={field.hint}>
          <Select value={strVal(field.key)} onChange={(v) => set(v)} options={field.options ?? []} placeholder="Select…" />
        </Field>
      );

    case 'segmented':
      return (
        <Field label={field.label} hint={field.hint}>
          <Segmented value={strVal(field.key)} options={field.options ?? []} onChange={(v) => set(v)} />
        </Field>
      );

    case 'number':
    case 'text':
      return (
        <Field label={field.label} hint={field.hint}>
          <ModInput value={strVal(field.key)} onChange={(v) => set(v)} placeholder={field.placeholder} prefix={field.prefix} suffix={field.suffix} mono={field.type === 'number'} />
        </Field>
      );

    case 'tiers':
      return <TiersEditor field={field} rawVal={rawVal} set={set} />;

    case 'matrix':
      return <MatrixEditor field={field} rawVal={rawVal} set={set} />;

    case 'hash':
      return <HashBlock field={field} seed={campaignName + field.key} />;

    case 'info':
      return <InfoBlock field={field} />;

    default:
      return null;
  }
}

// ── primitives ───────────────────────────────────────────────
function ModInput({ value, onChange, placeholder, prefix, suffix, mono }: { value: string; onChange: (v: string) => void; placeholder?: string; prefix?: string; suffix?: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border px-3 py-2" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
      {prefix && <span className="text-[13px] text-fg-muted">{prefix}</span>}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-transparent text-[13px] outline-none ${mono ? 'font-mono' : ''}`}
        style={{ color: 'var(--fg-primary)' }}
      />
      {suffix && <span className="whitespace-nowrap text-[12px] text-fg-muted">{suffix}</span>}
    </div>
  );
}

function Segmented({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex overflow-hidden rounded-md border" style={{ borderColor: 'var(--border-strong)' }}>
      {options.map((o) => {
        const on = value === o;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className="flex-1 px-3 py-2 text-[12px] font-medium transition-colors"
            style={on ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { background: 'var(--surface-1)', color: 'var(--fg-secondary)' }}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

// ── tiers (repeatable rows) ──────────────────────────────────
function TiersEditor({ field, rawVal, set }: { field: ModuleField; rawVal: (k: string) => unknown; set: (v: unknown) => void }) {
  const cols = field.columns ?? [];
  const stored = rawVal(field.key);
  const rows: Record<string, string>[] = Array.isArray(stored) ? (stored as Record<string, string>[]) : (field.defaultRows ?? []);

  const patch = (i: number, key: string, val: string) => {
    const next = rows.map((r, ri) => (ri === i ? { ...r, [key]: val } : r));
    set(next);
  };
  const add = () => {
    const blank: Record<string, string> = {};
    cols.forEach((c) => { blank[c.key] = ''; });
    set([...rows, blank]);
  };
  const remove = (i: number) => set(rows.filter((_, ri) => ri !== i));

  return (
    <Field label={field.label} hint={field.hint}>
      <div className="overflow-hidden rounded-lg border" style={{ borderColor: 'var(--border-strong)' }}>
        <div className="grid gap-2 px-3 py-2" style={{ gridTemplateColumns: `${cols.map(() => '1fr').join(' ')} 28px`, background: 'var(--surface-3)' }}>
          {cols.map((c) => <span key={c.key} className="text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">{c.label}</span>)}
          <span />
        </div>
        <div className="flex flex-col">
          {rows.map((row, i) => (
            <div key={i} className="grid items-center gap-2 border-t px-3 py-2" style={{ gridTemplateColumns: `${cols.map(() => '1fr').join(' ')} 28px`, borderColor: 'var(--border-subtle)' }}>
              {cols.map((c) => (
                <ModInput key={c.key} value={row[c.key] ?? ''} onChange={(v) => patch(i, c.key, v)} prefix={c.prefix} suffix={c.suffix} mono={c.type === 'number'} />
              ))}
              <button onClick={() => remove(i)} className="flex h-7 w-7 items-center justify-center rounded text-fg-muted transition-colors hover:text-fg-primary">
                <Trash2 size={14} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={add} className="flex w-full items-center justify-center gap-1.5 border-t py-2 text-[12px] font-medium text-fg-secondary transition-colors hover:text-fg-primary" style={{ borderColor: 'var(--border-subtle)' }}>
          <Plus size={13} strokeWidth={2.25} /> {field.addLabel ?? 'Add row'}
        </button>
      </div>
    </Field>
  );
}

// ── matrix (rows × cols numeric grid) ────────────────────────
function MatrixEditor({ field, rawVal, set }: { field: ModuleField; rawVal: (k: string) => unknown; set: (v: unknown) => void }) {
  const rows = field.rows ?? [];
  const cols = field.cols ?? [];
  const stored = rawVal(field.key);
  const cells: Record<string, string> = (stored && typeof stored === 'object') ? (stored as Record<string, string>) : {};

  const patch = (ri: number, ci: number, val: string) => {
    set({ ...cells, [`${ri}-${ci}`]: val });
  };

  return (
    <Field label={field.label} hint={field.hint}>
      <div className="overflow-hidden rounded-lg border" style={{ borderColor: 'var(--border-strong)' }}>
        <div className="grid gap-px" style={{ gridTemplateColumns: `120px ${cols.map(() => '1fr').join(' ')}`, background: 'var(--border-subtle)' }}>
          <div className="px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted" style={{ background: 'var(--surface-3)' }}>Tier</div>
          {cols.map((c) => (
            <div key={c} className="px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted" style={{ background: 'var(--surface-3)' }}>{c}</div>
          ))}
          {rows.map((r, ri) => (
            <MatrixRow key={r} r={r} ri={ri} cols={cols} cells={cells} patch={patch} suffix={field.cellSuffix} />
          ))}
        </div>
      </div>
    </Field>
  );
}

function MatrixRow({ r, ri, cols, cells, patch, suffix }: { r: string; ri: number; cols: string[]; cells: Record<string, string>; patch: (ri: number, ci: number, v: string) => void; suffix?: string }) {
  return (
    <>
      <div className="flex items-center px-3 py-1.5 text-[12.5px] font-medium text-fg-primary" style={{ background: 'var(--surface-1)' }}>{r}</div>
      {cols.map((_, ci) => (
        <div key={ci} className="flex items-center gap-1 px-2 py-1.5" style={{ background: 'var(--surface-1)' }}>
          <input
            value={cells[`${ri}-${ci}`] ?? ''}
            onChange={(e) => patch(ri, ci, e.target.value)}
            placeholder="0"
            className="w-full bg-transparent text-right font-mono text-[12.5px] outline-none"
            style={{ color: 'var(--fg-primary)' }}
          />
          {suffix && <span className="text-[11px] text-fg-muted">{suffix}</span>}
        </div>
      ))}
    </>
  );
}

// ── hash (commit / reveal) ───────────────────────────────────
function HashBlock({ field, seed }: { field: ModuleField; seed: string }) {
  const hash = pseudoHash(seed);
  return (
    <div className="rounded-lg border" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
      <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} style={{ color: 'var(--success)' }} strokeWidth={2} />
          <span className="text-[12.5px] font-medium text-fg-primary">{field.label}</span>
        </div>
        <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--success)', background: 'var(--status-live-bg)' }}>
          Committed
        </span>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 rounded-md border px-3 py-2" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <code className="flex-1 truncate font-mono text-[11.5px]" style={{ color: 'var(--fg-secondary)' }}>{hash}</code>
          <Copy size={13} className="shrink-0 text-fg-muted" strokeWidth={2} />
        </div>
        {field.body && <p className="mt-2 text-[11.5px] leading-relaxed text-fg-muted">{field.body}</p>}
        <div className="mt-2 flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--fg-muted)' }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--warning)' }} />
          Seed revealed after resolution for public verification
        </div>
      </div>
    </div>
  );
}

// ── info callout ─────────────────────────────────────────────
function InfoBlock({ field }: { field: ModuleField }) {
  const tone = field.tone ?? 'info';
  const map = {
    info: { color: 'var(--status-scheduled)', bg: 'var(--surface-2)', Icon: Info },
    warning: { color: 'var(--warning)', bg: 'var(--warning-bg)', Icon: AlertTriangle },
    success: { color: 'var(--success)', bg: 'var(--status-live-bg)', Icon: ShieldCheck },
  }[tone];
  const Icon = map.Icon;
  return (
    <div className="flex items-start gap-2.5 rounded-lg border px-4 py-3" style={{ borderColor: 'var(--border-subtle)', background: map.bg }}>
      <Icon size={16} className="mt-0.5 shrink-0" style={{ color: map.color }} strokeWidth={2} />
      <div>
        {field.label && <div className="text-[13px] font-medium text-fg-primary">{field.label}</div>}
        <p className="text-[12px] leading-relaxed text-fg-secondary">{field.body}</p>
      </div>
    </div>
  );
}
