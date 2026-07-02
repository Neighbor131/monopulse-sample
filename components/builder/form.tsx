import { useState } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown } from 'lucide-react';

export function Section({
  icon: Icon,
  title,
  desc,
  aside,
  children,
}: {
  icon?: LucideIcon;
  title: string;
  desc?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="flex items-start gap-3 border-b px-5 py-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>
            <Icon size={16} strokeWidth={1.75} />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-[14px] font-semibold text-fg-primary">{title}</h3>
          {desc && <p className="mt-0.5 text-[12.5px] leading-relaxed text-fg-secondary">{desc}</p>}
        </div>
        {aside}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[12.5px] font-medium text-fg-secondary">
        {label}
        {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        {hint && <span className="font-normal text-fg-muted">· {hint}</span>}
      </label>
      {children}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  mono,
  prefix,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  prefix?: string;
  type?: string;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <div
      className="flex items-center rounded-md border px-3"
      style={{ borderColor: focus ? 'var(--accent)' : 'var(--border-strong)', background: 'var(--surface-2)' }}
    >
      {prefix && <span className="mr-1.5 text-[13px] text-fg-muted">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder={placeholder}
        className={`w-full bg-transparent py-2 text-[13px] outline-none ${mono ? 'font-mono' : ''}`}
        style={{ color: 'var(--fg-primary)' }}
      />
    </div>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      placeholder={placeholder}
      className="w-full resize-none rounded-md border px-3 py-2 text-[13px] leading-relaxed outline-none"
      style={{ borderColor: focus ? 'var(--accent)' : 'var(--border-strong)', background: 'var(--surface-2)', color: 'var(--fg-primary)' }}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select…',
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-md border px-3 py-2 pr-8 text-[13px] outline-none"
        style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)', color: value ? 'var(--fg-primary)' : 'var(--fg-muted)' }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o} style={{ background: '#161B25', color: '#E7ECF3' }}>{o}</option>
        ))}
      </select>
      <ChevronDown size={14} strokeWidth={2} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted" />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-start gap-3 text-left">
      <span
        className="mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5"
        style={{ background: checked ? 'var(--accent)' : 'var(--surface-3)', transition: 'background 120ms' }}
      >
        <span
          className="h-4 w-4 rounded-full"
          style={{ background: '#fff', transform: checked ? 'translateX(16px)' : 'translateX(0)', transition: 'transform 140ms' }}
        />
      </span>
      <span className="flex-1">
        <span className="block text-[13px] font-medium text-fg-primary">{label}</span>
        {desc && <span className="mt-0.5 block text-[12px] leading-relaxed text-fg-secondary">{desc}</span>}
      </span>
    </button>
  );
}

export function TagSelect({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className="rounded-md border px-2.5 py-1.5 text-[12.5px] font-medium"
            style={
              on
                ? { borderColor: 'var(--accent-border)', background: 'var(--accent-bg)', color: 'var(--accent)' }
                : { borderColor: 'var(--border-strong)', color: 'var(--fg-secondary)' }
            }
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
