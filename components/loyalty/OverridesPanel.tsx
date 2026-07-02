import { useState } from 'react';
import { Plus, MoreHorizontal, Eye, CalendarPlus, Trash2, ArrowUp, Crown, X, ShieldAlert } from 'lucide-react';
import { StatusPill } from '../safety/SafetyDrawer';
import { Field, TextInput, TextArea, Select } from '../builder/form';
import { OVERRIDE_LABEL, TIER_NAMES, overrideSensitivity } from '../../data/loyalty';
import type { VIPOverride, OverrideType } from '../../data/loyalty';
import { BRANDS } from '../../data/campaigns';
import { JURISDICTIONS } from '../../data/loyalty';

const TYPE_OPTS = Object.entries(OVERRIDE_LABEL).map(([v, l]) => ({ v: v as OverrideType, l }));

export default function OverridesPanel({ rows, onOpen, onCreate, onExtend, onRemove }: {
  rows: VIPOverride[];
  onOpen: (v: VIPOverride) => void;
  onCreate: (v: VIPOverride) => void;
  onExtend: (v: VIPOverride) => void;
  onRemove: (v: VIPOverride) => void;
}) {
  const [menu, setMenu] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const cols = ['Player', 'Brand', 'Program', 'Type', 'Tier movement', 'Value', 'Expiry', 'Owner'];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] text-fg-secondary">Manually overridden players — tier boosts, freezes, custom cashback and comps that bypass earned status.</p>
        <button onClick={() => setAdding(true)} className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
          <Plus size={15} strokeWidth={2.5} /> Add override
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-1)' }}>
              {cols.map((c) => <th key={c} className="px-4 py-2.5 font-semibold">{c}</th>)}
              <th className="px-2 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id} onClick={() => onOpen(v)} className="cursor-pointer border-t transition-colors" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-3)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style={{ background: 'var(--surface-3)', color: 'var(--tier-diamond)' }}><Crown size={13} strokeWidth={1.75} /></div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-medium text-fg-primary">{v.playerAlias}</span>
                        {v.rgExcluded && <span className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-bold" style={{ color: 'var(--danger)', background: 'var(--danger-bg)' }}><ShieldAlert size={9} strokeWidth={2.5} />RG</span>}
                        {v.approval === 'pending' && <span className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-bold uppercase" style={{ color: 'var(--warning)', background: 'var(--warning-bg)' }}>Approval</span>}
                      </div>
                      <div className="font-mono text-[11px] text-fg-muted">{v.playerId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-fg-secondary">{v.brand}</td>
                <td className="px-4 py-3 text-[12.5px] text-fg-secondary">{v.program}</td>
                <td className="px-4 py-3"><TypeChip type={v.type} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-[12.5px]">
                    <span className="text-fg-muted">{v.currentTier}</span>
                    {v.forcedTier !== v.currentTier ? <ArrowUp size={12} className="rotate-45" style={{ color: 'var(--success)' }} strokeWidth={2.5} /> : <span className="text-fg-muted">·</span>}
                    <span className="font-medium text-fg-primary">{v.forcedTier}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-fg-secondary">{v.value}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="text-[12.5px] text-fg-secondary">{v.expiresAt}</span><StatusPill status={v.status} /></div></td>
                <td className="px-4 py-3 text-[12px] text-fg-primary">{v.grantedBy}</td>
                <td className="relative px-2 py-3">
                  <button onClick={(e) => { e.stopPropagation(); setMenu(menu === v.id ? null : v.id); }} className="flex h-7 w-7 items-center justify-center rounded-md text-fg-muted transition-colors hover:text-fg-primary">
                    <MoreHorizontal size={16} strokeWidth={2} />
                  </button>
                  {menu === v.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMenu(null); }} />
                      <div className="absolute right-2 top-11 z-50 w-44 overflow-hidden rounded-lg border py-1" style={{ background: 'var(--surface-2)', borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-lg)' }}>
                        <MenuItem icon={Eye} label="View detail" onClick={() => { onOpen(v); setMenu(null); }} />
                        <MenuItem icon={CalendarPlus} label="Extend 30 days" onClick={() => { onExtend(v); setMenu(null); }} />
                        <div className="my-1 h-px" style={{ background: 'var(--border-subtle)' }} />
                        <MenuItem icon={Trash2} label="Remove override" danger onClick={() => { onRemove(v); setMenu(null); }} />
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={cols.length + 1} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--surface-3)' }}><Crown size={18} className="text-fg-muted" strokeWidth={1.75} /></div>
                  <p className="text-[13px] font-medium text-fg-primary">No overrides</p>
                  <p className="text-[12px] text-fg-muted">No VIP overrides match the current filters.</p>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {adding && <AddOverrideModal onClose={() => setAdding(false)} onCreate={(v) => { onCreate(v); setAdding(false); }} />}
    </div>
  );
}

function TypeChip({ type }: { type: OverrideType }) {
  return <span className="rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{OVERRIDE_LABEL[type]}</span>;
}

function MenuItem({ icon: Icon, label, onClick, danger }: { icon: typeof Eye; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12.5px] font-medium transition-colors" style={{ color: danger ? 'var(--danger)' : 'var(--fg-secondary)' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
      <Icon size={14} strokeWidth={1.75} /> {label}
    </button>
  );
}

function AddOverrideModal({ onClose, onCreate }: { onClose: () => void; onCreate: (v: VIPOverride) => void }) {
  const [alias, setAlias] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [brand, setBrand] = useState(BRANDS[0]?.code ?? '');
  const [program, setProgram] = useState('');
  const [type, setType] = useState<OverrideType>('tier_boost');
  const [currentTier, setCurrentTier] = useState('Platinum');
  const [forcedTier, setForcedTier] = useState('Diamond');
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [jurisdiction, setJurisdiction] = useState(JURISDICTIONS[0]);

  const valid = alias && playerId && program && reason;
  const effForced = type === 'custom_cashback' || type === 'manual_comp' ? currentTier : forcedTier;
  const effValue = value || (type === 'tier_boost' ? forcedTier : '—');
  const sens = overrideSensitivity({ rgExcluded: false, currentTier, forcedTier: effForced, type, value: effValue });
  const needsApproval = sens.length > 0;
  const submit = () => {
    if (!valid) return;
    onCreate({
      id: `vo-${Math.floor(Math.random() * 9000 + 1000)}`,
      playerAlias: alias, playerId, brand, program, type,
      value: effValue,
      currentTier, forcedTier: effForced,
      reason, jurisdiction, rgExcluded: false,
      grantedBy: 'You', grantedAt: 'just now', expiresAt: expiresAt || '30 days', status: 'active',
      approval: needsApproval ? 'pending' : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div className="absolute inset-0" style={{ background: 'var(--overlay-scrim)' }} onClick={onClose} />
      <div className="relative flex max-h-[86vh] w-[540px] flex-col overflow-hidden rounded-xl border" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight text-fg-primary">Add VIP override</h3>
            <p className="mt-0.5 text-[12px] text-fg-secondary">Manually force a tier, freeze, or custom benefit for a player.</p>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md text-fg-muted transition-colors hover:text-fg-primary" style={{ background: 'var(--surface-2)' }}><X size={15} strokeWidth={2} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Player alias" required><TextInput value={alias} onChange={setAlias} placeholder="e.g. Nightfall_92" /></Field>
              <Field label="Player ID" required><TextInput value={playerId} onChange={setPlayerId} placeholder="PLR-00000" mono /></Field>
              <Field label="Brand"><Select value={brand} onChange={setBrand} options={BRANDS.map((b) => b.code)} /></Field>
              <Field label="Program" required><TextInput value={program} onChange={setProgram} placeholder="e.g. VGV VIP Club" /></Field>
              <Field label="Override type"><Select value={OVERRIDE_LABEL[type]} onChange={(l) => setType((TYPE_OPTS.find((o) => o.l === l)?.v) ?? 'tier_boost')} options={TYPE_OPTS.map((o) => o.l)} /></Field>
              <Field label="Jurisdiction"><Select value={jurisdiction} onChange={setJurisdiction} options={JURISDICTIONS} /></Field>
              <Field label="Current tier"><Select value={currentTier} onChange={setCurrentTier} options={TIER_NAMES} /></Field>
              <Field label="Forced tier"><Select value={forcedTier} onChange={setForcedTier} options={TIER_NAMES} /></Field>
              <Field label="Value / note" hint="e.g. 20% cashback"><TextInput value={value} onChange={setValue} placeholder="optional" /></Field>
              <Field label="Expires"><TextInput type="date" value={expiresAt} onChange={setExpiresAt} /></Field>
            </div>
            <Field label="Reason" hint="required for audit trail" required>
              <TextArea value={reason} onChange={setReason} placeholder="Why this override is being granted…" />
            </Field>
          </div>
        </div>
        {needsApproval && valid && (
          <div className="flex items-start gap-2.5 border-t px-5 py-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--warning-bg)' }}>
            <ShieldAlert size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--warning)' }} strokeWidth={2} />
            <div>
              <div className="text-[12px] font-semibold" style={{ color: 'var(--warning)' }}>Sensitive override — requires approval</div>
              <p className="mt-0.5 text-[11.5px] text-fg-secondary">{sens.join(' · ')}. This will be held for Casino Manager sign-off before it takes effect.</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-end gap-2.5 border-t px-5 py-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-[13px] font-medium transition-colors" style={{ borderColor: 'var(--border-strong)', color: 'var(--fg-secondary)' }}>Cancel</button>
          <button onClick={submit} disabled={!valid} className="flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold transition-colors" style={valid ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { background: 'var(--surface-3)', color: 'var(--fg-muted)', cursor: 'not-allowed' }}>{needsApproval ? 'Submit for approval' : 'Grant override'}</button>
        </div>
      </div>
    </div>
  );
}
