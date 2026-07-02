import { useMemo, useState } from 'react';
import {
  Gem, Users, Wallet, Crown, ArrowUpDown, ChevronRight, Search, MoreHorizontal,
  Eye, Pencil, Copy, Pause, Play, Archive, ArrowUp, ArrowDown, CalendarClock, Plus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProgram } from '../context/ProgramContext';
import { fmtMoney, fmtNum, initials, BRANDS } from '../data/campaigns';
import {
  STATUS_PROGRAMS, VIP_OVERRIDES, PENDING_TIER_CHANGES, UPCOMING_RESETS,
  PROGRAM_STATUS_META, RESET_LABEL, OVERRIDE_LABEL, TIER_VAR,
  JURISDICTIONS, SEGMENTS, TIER_NAMES,
  loyaltyKpis, liabilityByBrand, programToDrawer, overrideToDrawer, ledgerToDrawer, LEDGER, CASHBACK_CONFIGS,
} from '../data/loyalty';
import type { StatusProgram, ProgramStatus, VIPOverride, PendingTierChange, UpcomingReset } from '../data/loyalty';
import type { DrawerModel } from '../data/safety';
import SafetyDrawer, { StatusPill } from '../components/safety/SafetyDrawer';
import OverridesPanel from '../components/loyalty/OverridesPanel';
import LedgerPanel from '../components/loyalty/LedgerPanel';
import CashbackPanel from '../components/loyalty/CashbackPanel';

type TabId = 'overview' | 'programs' | 'cashback' | 'overrides' | 'ledger';
interface Filters { brand: string; program: string; tier: string; segment: string; jurisdiction: string; status: string; q: string }
const EMPTY: Filters = { brand: '', program: '', tier: '', segment: '', jurisdiction: '', status: '', q: '' };

export default function Loyalty() {
  const [tab, setTab] = useState<TabId>('overview');
  const [f, setF] = useState<Filters>(EMPTY);
  const [drawer, setDrawer] = useState<DrawerModel | null>(null);
  const [programs, setPrograms] = useState<StatusProgram[]>(STATUS_PROGRAMS);
  const [overrides, setOverrides] = useState<VIPOverride[]>(VIP_OVERRIDES);
  const [toast, setToast] = useState<string | null>(null);
  const navigate = useNavigate();
  const { startNew, loadProgram } = useProgram();

  const createProgram = () => { startNew(); navigate('/loyalty/builder/setup'); };
  const editProgram = (p: StatusProgram) => { loadProgram(p); navigate('/loyalty/builder/setup'); };

  const kpis = useMemo(() => loyaltyKpis(), []);
  const byBrand = useMemo(() => liabilityByBrand(), []);
  const set = (patch: Partial<Filters>) => setF((p) => ({ ...p, ...patch }));

  const flash = (msg: string) => { setToast(msg); window.setTimeout(() => setToast(null), 2200); };

  const fPrograms = programs.filter((p) => {
    if (f.brand && !p.brands.includes(f.brand)) return false;
    if (f.program && p.id !== f.program) return false;
    if (f.tier && !p.tiers.some((t) => t.name === f.tier)) return false;
    if (f.segment && p.segment !== f.segment) return false;
    if (f.jurisdiction && !p.jurisdictions.includes(f.jurisdiction)) return false;
    if (f.status && p.status !== f.status) return false;
    if (f.q && !`${p.name} ${p.owner} ${p.id}`.toLowerCase().includes(f.q.toLowerCase())) return false;
    return true;
  });

  const fOverrides = overrides.filter((v) => {
    if (f.brand && v.brand !== f.brand) return false;
    if (f.jurisdiction && v.jurisdiction !== f.jurisdiction) return false;
    if (f.tier && v.currentTier !== f.tier && v.forcedTier !== f.tier) return false;
    if (f.q && !`${v.playerAlias} ${v.playerId} ${v.program} ${v.reason}`.toLowerCase().includes(f.q.toLowerCase())) return false;
    return true;
  });
  const fLedger = LEDGER.filter((e) => {
    if (f.brand && e.brand !== f.brand) return false;
    if (f.q && !`${e.playerAlias} ${e.playerId} ${e.program} ${e.campaign ?? ''} ${e.detail}`.toLowerCase().includes(f.q.toLowerCase())) return false;
    return true;
  });

  const addOverride = (v: VIPOverride) => { setOverrides((prev) => [v, ...prev]); flash(`Override granted for ${v.playerAlias}`); };
  const extendOverride = (v: VIPOverride) => { setOverrides((prev) => prev.map((x) => (x.id === v.id ? { ...x, status: 'active' } : x))); flash(`Extended override for ${v.playerAlias} by 30 days`); };
  const removeOverride = (v: VIPOverride) => { setOverrides((prev) => prev.filter((x) => x.id !== v.id)); flash(`Removed override for ${v.playerAlias}`); };

  // program mutations
  const mutate = (id: string, next: (p: StatusProgram) => StatusProgram) =>
    setPrograms((prev) => prev.map((p) => (p.id === id ? next(p) : p)));
  const onPause = (p: StatusProgram) => { mutate(p.id, (x) => ({ ...x, status: 'paused' })); flash(`Paused ${p.name}`); };
  const onResume = (p: StatusProgram) => { mutate(p.id, (x) => ({ ...x, status: 'live' })); flash(`Resumed ${p.name}`); };
  const onArchive = (p: StatusProgram) => { mutate(p.id, (x) => ({ ...x, status: 'archived' })); flash(`Archived ${p.name}`); };
  const onDuplicate = (p: StatusProgram) => {
    const copy: StatusProgram = { ...p, id: `${p.id}-c`, name: `${p.name} (copy)`, status: 'draft', activePlayers: 0, liability: 0, updatedAt: 'just now' };
    setPrograms((prev) => { const i = prev.findIndex((x) => x.id === p.id); const n = [...prev]; n.splice(i + 1, 0, copy); return n; });
    flash(`Duplicated ${p.name}`);
  };
  const handleDrawerAction = (id: string) => {
    if (!drawer) return;
    if (drawer.kind === 'override') {
      const v = overrides.find((x) => x.id === drawer.id);
      if (v) {
        if (id === 'remove') removeOverride(v);
        else if (id === 'extend' || id === 'reinstate') extendOverride(v);
      }
      setDrawer(null);
      return;
    }
    const p = programs.find((x) => x.id === drawer.id);
    if (p) {
      if (id === 'pause') onPause(p);
      else if (id === 'resume') onResume(p);
      else if (id === 'archive') onArchive(p);
      else if (id === 'duplicate') onDuplicate(p);
      else if (id === 'launch') { onResume(p); }
      else if (id === 'edit') editProgram(p);
    }
    setDrawer(null);
  };

  const noop = () => {};

  return (
    <div className="mx-auto w-full max-w-[1360px] px-8 py-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[19px] font-semibold tracking-tight">Loyalty &amp; Status</h1>
            <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ color: 'var(--success)', background: 'var(--status-live-bg)' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--success)' }} /> {kpis.activePrograms} programs live
            </span>
          </div>
          <p className="mt-1 text-[13px] text-fg-secondary">Configure player status programs, tiers, cashback &amp; rakeback, VIP overrides and tier movement across all brands.</p>
        </div>
        <button onClick={createProgram} className="flex shrink-0 items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-semibold transition-colors" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
          <Plus size={15} strokeWidth={2.5} /> Create program
        </button>
      </div>

      {/* KPI row */}
      <div className="mt-5 grid grid-cols-5 gap-3">
        <Kpi icon={Gem} label="Active programs" value={String(kpis.activePrograms)} onClick={() => setTab('programs')} />
        <Kpi icon={Users} label="Players in tiers" value={fmtNum(kpis.playersInTiers)} />
        <Kpi icon={Wallet} label="Cashback liability" value={fmtMoney(kpis.cashbackLiability, 'EUR')} accent="var(--warning)" />
        <Kpi icon={Crown} label="VIP overrides" value={String(kpis.vipOverrides)} accent="var(--tier-diamond)" />
        <Kpi icon={ArrowUpDown} label="Pending tier changes" value={String(kpis.pendingTierChanges)} accent="var(--status-pending)" />
      </div>

      {/* Tab nav */}
      <div className="mt-6 flex items-center gap-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        {([{ id: 'overview', label: 'Overview' }, { id: 'programs', label: 'Status programs', count: programs.length }, { id: 'cashback', label: 'Cashback & rakeback', count: CASHBACK_CONFIGS.length }, { id: 'overrides', label: 'VIP overrides', count: overrides.length }, { id: 'ledger', label: 'Loyalty ledger', count: LEDGER.length }] as { id: TabId; label: string; count?: number }[]).map((t) => {
          const on = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className="relative flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium transition-colors" style={{ color: on ? 'var(--fg-primary)' : 'var(--fg-secondary)' }}>
              {t.label}
              {t.count !== undefined && <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold" style={on ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { background: 'var(--surface-3)', color: 'var(--fg-muted)' }}>{t.count}</span>}
              {on && <span className="absolute inset-x-0 -bottom-px h-0.5" style={{ background: 'var(--accent)' }} />}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      {tab !== 'cashback' && (
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <FilterSelect label="Brand" value={f.brand} onChange={(v) => set({ brand: v })} options={BRANDS.map((b) => ({ v: b.code, l: `${b.code} · ${b.name}` }))} />
        <FilterSelect label="Program" value={f.program} onChange={(v) => set({ program: v })} options={programs.map((p) => ({ v: p.id, l: p.name }))} />
        <FilterSelect label="Tier" value={f.tier} onChange={(v) => set({ tier: v })} options={TIER_NAMES.map((t) => ({ v: t, l: t }))} />
        <FilterSelect label="Segment" value={f.segment} onChange={(v) => set({ segment: v })} options={SEGMENTS.map((s) => ({ v: s, l: s }))} />
        <FilterSelect label="Jurisdiction" value={f.jurisdiction} onChange={(v) => set({ jurisdiction: v })} options={JURISDICTIONS.map((j) => ({ v: j, l: j }))} />
        {tab === 'programs' && <FilterSelect label="Status" value={f.status} onChange={(v) => set({ status: v })} options={(['live', 'scheduled', 'paused', 'draft', 'archived'] as ProgramStatus[]).map((s) => ({ v: s, l: PROGRAM_STATUS_META[s].label }))} />}
        <div className="ml-auto flex items-center gap-2 rounded-md border px-3 py-2" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
          <Search size={14} className="text-fg-muted" strokeWidth={1.75} />
          <input value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder={tab === 'overrides' ? 'Search players, reason…' : tab === 'ledger' ? 'Search players, campaigns…' : 'Search programs…'} className="w-44 bg-transparent text-[13px] outline-none" />
        </div>
        {(f.brand || f.program || f.tier || f.segment || f.jurisdiction || f.status || f.q) && (
          <button onClick={() => setF(EMPTY)} className="text-[12px] font-medium" style={{ color: 'var(--accent)' }}>Clear</button>
        )}
      </div>
      )}

      {/* Content */}
      <div className="mt-4">
        {tab === 'overview' && <Overview programs={fPrograms} byBrand={byBrand} overrides={VIP_OVERRIDES} changes={PENDING_TIER_CHANGES} resets={UPCOMING_RESETS} onOpen={(p) => setDrawer(programToDrawer(p))} goPrograms={() => setTab('programs')} />}
        {tab === 'programs' && <ProgramTable rows={fPrograms} onOpen={(p) => setDrawer(programToDrawer(p))} onPause={onPause} onResume={onResume} onArchive={onArchive} onDuplicate={onDuplicate} onEdit={editProgram} />}
        {tab === 'overrides' && <OverridesPanel rows={fOverrides} onOpen={(v) => setDrawer(overrideToDrawer(v))} onCreate={addOverride} onExtend={extendOverride} onRemove={removeOverride} />}
        {tab === 'cashback' && <CashbackPanel configs={CASHBACK_CONFIGS} onSave={flash} />}
        {tab === 'ledger' && <LedgerPanel rows={fLedger} onOpen={(e) => setDrawer(ledgerToDrawer(e))} />}
      </div>

      <SafetyDrawer model={drawer} onClose={() => setDrawer(null)} onAction={handleDrawerAction} onOpenCampaign={noop} onOpenReview={noop} />

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -ml-[130px] w-[260px] rounded-lg border px-4 py-2.5 text-center text-[12.5px] font-medium text-fg-primary" style={{ background: 'var(--surface-3)', borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-lg)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// KPI
// ─────────────────────────────────────────────────────────────
function Kpi({ icon: Icon, label, value, accent = 'var(--accent)', onClick }: { icon: LucideIcon; label: string; value: string; accent?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="rounded-xl border px-4 py-3.5 text-left transition-colors" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)', cursor: onClick ? 'pointer' : 'default' }}>
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">
        <span className="flex h-5 w-5 items-center justify-center rounded" style={{ background: 'var(--surface-3)', color: accent }}><Icon size={12} strokeWidth={2.25} /></span>
        {label}
      </div>
      <div className="mt-1.5 font-mono text-[22px] font-semibold leading-none tracking-tight tabular-nums text-fg-primary">{value}</div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Filter select
// ─────────────────────────────────────────────────────────────
function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  const active = value !== '';
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="cursor-pointer appearance-none rounded-md border py-2 pl-3 pr-8 text-[12.5px] font-medium outline-none" style={{ borderColor: active ? 'var(--accent-border)' : 'var(--border-strong)', background: active ? 'var(--accent-bg)' : 'var(--surface-2)', color: active ? 'var(--fg-primary)' : 'var(--fg-secondary)' }}>
        <option value="">{label}: All</option>
        {options.map((o) => <option key={o.v} value={o.v}>{label}: {o.l}</option>)}
      </select>
      <ChevronRight size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-fg-muted" strokeWidth={2} />
    </div>
  );
}

function ProgramStatusPill({ status }: { status: ProgramStatus }) {
  const m = PROGRAM_STATUS_META[status];
  return <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium leading-none" style={{ color: m.fg, background: m.bg }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: m.fg }} /> {m.label}</span>;
}

function TierBar({ tiers }: { tiers: StatusProgram['tiers'] }) {
  const total = tiers.reduce((s, t) => s + t.players, 0) || 1;
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-2 w-24 overflow-hidden rounded-full" style={{ background: 'var(--surface-3)' }}>
        {tiers.map((t) => <div key={t.name} style={{ width: `${(t.players / total) * 100}%`, background: TIER_VAR[t.color] }} />)}
      </div>
      <span className="font-mono text-[12px] tabular-nums text-fg-secondary">{tiers.length}</span>
    </div>
  );
}

function BrandScope({ p }: { p: StatusProgram }) {
  if (p.brandScope === 'network') return <span className="rounded px-1.5 py-0.5 text-[11px] font-medium" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>Network · {p.brands.length}</span>;
  return <span className="rounded px-1.5 py-0.5 font-mono text-[10.5px] font-medium" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{p.brands[0]}</span>;
}

// ─────────────────────────────────────────────────────────────
// Program table
// ─────────────────────────────────────────────────────────────
function ProgramTable({ rows, onOpen, onPause, onResume, onArchive, onDuplicate, onEdit }: {
  rows: StatusProgram[]; onOpen: (p: StatusProgram) => void;
  onPause: (p: StatusProgram) => void; onResume: (p: StatusProgram) => void;
  onArchive: (p: StatusProgram) => void; onDuplicate: (p: StatusProgram) => void; onEdit: (p: StatusProgram) => void;
}) {
  const [menu, setMenu] = useState<string | null>(null);
  const cols = ['Program', 'Brand scope', 'Status', 'Active players', 'Tiers', 'Reset cycle', 'Liability', 'Owner'];
  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-1)' }}>
            {cols.map((c, i) => <th key={c} className={`px-4 py-2.5 font-semibold ${i === 3 || i === 6 ? 'text-right' : ''}`}>{c}</th>)}
            <th className="px-2 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} onClick={() => onOpen(p)} className="cursor-pointer border-t transition-colors" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-3)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style={{ background: 'var(--surface-3)', color: 'var(--accent)' }}><Gem size={13} strokeWidth={1.75} /></div>
                  <div className="min-w-0"><div className="truncate text-[13px] font-medium text-fg-primary">{p.name}</div><div className="text-[11px] text-fg-muted">{p.id} · {p.segment}</div></div>
                </div>
              </td>
              <td className="px-4 py-3"><BrandScope p={p} /></td>
              <td className="px-4 py-3"><ProgramStatusPill status={p.status} /></td>
              <td className="px-4 py-3 text-right font-mono text-[12.5px] tabular-nums text-fg-primary">{p.activePlayers > 0 ? fmtNum(p.activePlayers) : '—'}</td>
              <td className="px-4 py-3"><TierBar tiers={p.tiers} /></td>
              <td className="px-4 py-3 text-[12.5px] text-fg-secondary">{RESET_LABEL[p.resetCycle]}</td>
              <td className="px-4 py-3 text-right font-mono text-[12.5px] tabular-nums" style={{ color: p.liability >= 90000 ? 'var(--warning)' : 'var(--fg-primary)' }}>{p.liability > 0 ? fmtMoney(p.liability, 'EUR') : (p.projectedLiability ? `~${fmtMoney(p.projectedLiability, 'EUR')}` : '—')}</td>
              <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="flex h-6 w-6 items-center justify-center rounded-full text-[9.5px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{initials(p.owner)}</div><span className="text-[12px] text-fg-primary">{p.owner}</span></div></td>
              <td className="relative px-2 py-3">
                <button onClick={(e) => { e.stopPropagation(); setMenu(menu === p.id ? null : p.id); }} className="flex h-7 w-7 items-center justify-center rounded-md text-fg-muted transition-colors hover:text-fg-primary" style={{ background: menu === p.id ? 'var(--surface-hover)' : 'transparent' }}>
                  <MoreHorizontal size={16} strokeWidth={2} />
                </button>
                {menu === p.id && (
                  <RowMenu p={p} onClose={() => setMenu(null)} onView={onOpen} onEdit={onEdit} onDuplicate={onDuplicate} onPause={onPause} onResume={onResume} onArchive={onArchive} />
                )}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={cols.length + 1} className="px-4 py-16 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--surface-3)' }}><Gem size={18} className="text-fg-muted" strokeWidth={1.75} /></div>
                <p className="text-[13px] font-medium text-fg-primary">No programs</p>
                <p className="text-[12px] text-fg-muted">No status programs match the current filters.</p>
              </div>
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function RowMenu({ p, onClose, onView, onEdit, onDuplicate, onPause, onResume, onArchive }: {
  p: StatusProgram; onClose: () => void; onView: (p: StatusProgram) => void; onEdit: (p: StatusProgram) => void;
  onDuplicate: (p: StatusProgram) => void; onPause: (p: StatusProgram) => void; onResume: (p: StatusProgram) => void; onArchive: (p: StatusProgram) => void;
}) {
  const item = (icon: LucideIcon, label: string, fn: () => void, danger?: boolean) => {
    const Icon = icon;
    return (
      <button onClick={(e) => { e.stopPropagation(); fn(); onClose(); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12.5px] font-medium transition-colors" style={{ color: danger ? 'var(--danger)' : 'var(--fg-secondary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
        <Icon size={14} strokeWidth={1.75} /> {label}
      </button>
    );
  };
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); onClose(); }} />
      <div className="absolute right-2 top-11 z-50 w-44 overflow-hidden rounded-lg border py-1" style={{ background: 'var(--surface-2)', borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-lg)' }}>
        {item(Eye, 'View', () => onView(p))}
        {item(Pencil, 'Edit', () => onEdit(p))}
        {item(Copy, 'Duplicate', () => onDuplicate(p))}
        {p.status === 'paused' ? item(Play, 'Resume', () => onResume(p)) : item(Pause, 'Pause', () => onPause(p))}
        <div className="my-1 h-px" style={{ background: 'var(--border-subtle)' }} />
        {item(Archive, 'Archive', () => onArchive(p), true)}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Overview
// ─────────────────────────────────────────────────────────────
function Overview({ programs, byBrand, overrides, changes, resets, onOpen, goPrograms }: {
  programs: StatusProgram[]; byBrand: { brand: string; amount: number }[];
  overrides: VIPOverride[]; changes: PendingTierChange[]; resets: UpcomingReset[];
  onOpen: (p: StatusProgram) => void; goPrograms: () => void;
}) {
  const live = programs.filter((p) => p.status === 'live');
  const scheduled = programs.filter((p) => p.status === 'scheduled' || p.status === 'draft');
  const maxBrand = Math.max(...byBrand.map((b) => b.amount), 1);

  return (
    <div className="grid grid-cols-[1fr_360px] gap-6">
      {/* Left: live + scheduled programs */}
      <div className="flex flex-col gap-6">
        <Section title="Live programs" count={live.length} action={{ label: 'All programs', fn: goPrograms }}>
          <div className="grid grid-cols-2 gap-3">
            {live.map((p) => <ProgramCard key={p.id} p={p} onOpen={onOpen} />)}
            {live.length === 0 && <EmptyMini label="No live programs match filters" />}
          </div>
        </Section>

        <Section title="Scheduled & draft" count={scheduled.length}>
          <div className="flex flex-col gap-2">
            {scheduled.map((p) => (
              <div key={p.id} role="button" tabIndex={0} onClick={() => onOpen(p)} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(p); }} className="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-1)')}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--surface-3)', color: 'var(--status-scheduled)' }}><CalendarClock size={15} strokeWidth={1.75} /></div>
                <div className="min-w-0 flex-1"><div className="truncate text-[13px] font-medium text-fg-primary">{p.name}</div><div className="text-[11px] text-fg-muted">{p.brands.join(', ')} · {p.tiers.length} tiers{p.scheduledFor ? ` · launches ${p.scheduledFor}` : ''}</div></div>
                <ProgramStatusPill status={p.status} />
                <ChevronRight size={15} className="text-fg-muted" strokeWidth={2} />
              </div>
            ))}
            {scheduled.length === 0 && <EmptyMini label="Nothing scheduled" />}
          </div>
        </Section>
      </div>

      {/* Right rail */}
      <div className="flex flex-col gap-4">
        {/* Liability by brand */}
        <RailCard title="Cashback liability by brand">
          <div className="flex flex-col gap-2.5 px-1">
            {byBrand.map((b) => (
              <div key={b.brand} className="flex items-center gap-3">
                <span className="w-9 font-mono text-[11px] font-medium text-fg-secondary">{b.brand}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--surface-3)' }}><div className="h-full rounded-full" style={{ width: `${(b.amount / maxBrand) * 100}%`, background: 'var(--warning)' }} /></div>
                <span className="w-16 text-right font-mono text-[11.5px] tabular-nums text-fg-primary">{fmtMoney(b.amount, 'EUR')}</span>
              </div>
            ))}
          </div>
        </RailCard>

        {/* Pending tier changes */}
        <RailCard title="Pending tier changes" count={changes.length}>
          <div className="flex flex-col">
            {changes.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center gap-2.5 border-t px-1 py-2.5 first:border-t-0" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: c.direction === 'up' ? 'var(--status-live-bg)' : 'var(--warning-bg)', color: c.direction === 'up' ? 'var(--success)' : 'var(--warning)' }}>
                  {c.direction === 'up' ? <ArrowUp size={13} strokeWidth={2.5} /> : <ArrowDown size={13} strokeWidth={2.5} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-medium text-fg-primary">{c.playerAlias}</div>
                  <div className="text-[10.5px] text-fg-muted">{c.from} → {c.to} · {c.brand}</div>
                </div>
                <span className="font-mono text-[10px] text-fg-muted">{c.requestedAt}</span>
              </div>
            ))}
          </div>
        </RailCard>

        {/* Upcoming resets */}
        <RailCard title="Upcoming resets" count={resets.length}>
          <div className="flex flex-col">
            {resets.map((r) => (
              <div key={r.id} className="flex items-center gap-2.5 border-t px-1 py-2.5 first:border-t-0" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: 'var(--surface-3)', color: r.days <= 3 ? 'var(--warning)' : 'var(--status-scheduled)' }}><CalendarClock size={12} strokeWidth={2} /></span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-medium text-fg-primary">{r.program}</div>
                  <div className="truncate text-[10.5px] text-fg-muted">{r.brand} · {RESET_LABEL[r.cycle]} · {r.date}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[10.5px] font-medium" style={{ color: r.days <= 3 ? 'var(--warning)' : 'var(--fg-secondary)' }}>{r.resetsIn}</div>
                  <div className="font-mono text-[10px] text-fg-muted">{fmtNum(r.atRisk)} at risk</div>
                </div>
              </div>
            ))}
          </div>
        </RailCard>

        {/* VIP overrides */}
        <RailCard title="Active VIP overrides" count={overrides.length}>
          <div className="flex flex-col">
            {overrides.slice(0, 4).map((v) => (
              <div key={v.id} className="flex items-center gap-2.5 border-t px-1 py-2.5 first:border-t-0" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: 'var(--surface-3)', color: 'var(--tier-diamond)' }}><Crown size={12} strokeWidth={2} /></span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-medium text-fg-primary">{v.playerAlias}</div>
                  <div className="truncate text-[10.5px] text-fg-muted">{OVERRIDE_LABEL[v.type]} · {v.value}</div>
                </div>
                {v.status === 'expiring' && <StatusPill status="expiring" />}
              </div>
            ))}
          </div>
        </RailCard>
      </div>
    </div>
  );
}

function ProgramCard({ p, onOpen }: { p: StatusProgram; onOpen: (p: StatusProgram) => void }) {
  const total = p.tiers.reduce((s, t) => s + t.players, 0) || 1;
  return (
    <div role="button" tabIndex={0} onClick={() => onOpen(p)} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(p); }} className="cursor-pointer rounded-xl border p-4 transition-colors" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-1)')}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0"><div className="truncate text-[13.5px] font-semibold text-fg-primary">{p.name}</div><div className="mt-0.5 text-[11px] text-fg-muted">{p.brandScope === 'network' ? `Network · ${p.brands.length}` : p.brands[0]} · {RESET_LABEL[p.resetCycle]}</div></div>
        <BrandScope p={p} />
      </div>
      {/* tier ladder */}
      <div className="mt-3 flex h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--surface-3)' }}>
        {p.tiers.map((t) => <div key={t.name} style={{ width: `${(t.players / total) * 100}%`, background: TIER_VAR[t.color] }} />)}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {p.tiers.map((t) => (
          <div key={t.name} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: TIER_VAR[t.color] }} /><span className="text-[10.5px] text-fg-secondary">{t.name}</span></div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <div><div className="text-[10px] uppercase tracking-wide text-fg-muted">Players</div><div className="font-mono text-[13px] font-semibold tabular-nums text-fg-primary">{fmtNum(p.activePlayers)}</div></div>
        <div className="text-right"><div className="text-[10px] uppercase tracking-wide text-fg-muted">Liability</div><div className="font-mono text-[13px] font-semibold tabular-nums" style={{ color: p.liability >= 90000 ? 'var(--warning)' : 'var(--fg-primary)' }}>{fmtMoney(p.liability, 'EUR')}</div></div>
      </div>
    </div>
  );
}

function Section({ title, count, action, children }: { title: string; count?: number; action?: { label: string; fn: () => void }; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2.5 flex items-center gap-2">
        <h3 className="text-[13px] font-semibold text-fg-primary">{title}</h3>
        {count !== undefined && <span className="rounded px-1.5 py-0.5 text-[10.5px] font-semibold text-fg-muted" style={{ background: 'var(--surface-3)' }}>{count}</span>}
        {action && <button onClick={action.fn} className="ml-auto text-[12px] font-medium" style={{ color: 'var(--accent)' }}>{action.label}</button>}
      </div>
      {children}
    </section>
  );
}

function RailCard({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-3.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">{title}</span>
        {count !== undefined && <span className="ml-auto rounded px-1.5 py-0.5 text-[10px] font-semibold text-fg-muted" style={{ background: 'var(--surface-3)' }}>{count}</span>}
      </div>
      {children}
    </div>
  );
}

function EmptyMini({ label }: { label: string }) {
  return <div className="col-span-2 rounded-lg border border-dashed px-4 py-6 text-center text-[12px] text-fg-muted" style={{ borderColor: 'var(--border-subtle)' }}>{label}</div>;
}
