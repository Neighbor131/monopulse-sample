import { useMemo, useState } from 'react';
import { Users, Crown, AlertTriangle, FileCheck2, ShieldAlert, Search, ChevronRight, ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fmtMoney, fmtNum, initials, BRANDS } from '../data/campaigns';
import { TIER_VAR, TIER_NAMES } from '../data/loyalty';
import {
  PLAYERS, COUNTRIES, PLAYER_SEGMENTS, playerKpis,
  PLAYER_STATUS_META, RISK_META, KYC_META, RG_META,
} from '../data/players';
import type { Player, PlayerStatus, RiskFlag, KycStatus, RgStatus } from '../data/players';

interface Filters { brand: string; country: string; tier: string; risk: string; campaign: string; kyc: string; rg: string; segment: string; q: string }
const EMPTY: Filters = { brand: '', country: '', tier: '', risk: '', campaign: '', kyc: '', rg: '', segment: '', q: '' };

const ALL_CAMPAIGNS = Array.from(new Set(PLAYERS.flatMap((p) => p.activeCampaigns)));

export default function Players() {
  const [f, setF] = useState<Filters>(EMPTY);
  const navigate = useNavigate();
  const set = (patch: Partial<Filters>) => setF((p) => ({ ...p, ...patch }));

  const rows = useMemo(() => PLAYERS.filter((p) => {
    if (f.brand && p.brand !== f.brand) return false;
    if (f.country && p.country !== f.country) return false;
    if (f.tier && p.tier !== f.tier) return false;
    if (f.risk && p.risk !== f.risk) return false;
    if (f.campaign && !p.activeCampaigns.includes(f.campaign)) return false;
    if (f.kyc && p.kyc !== f.kyc) return false;
    if (f.rg && p.rg !== f.rg) return false;
    if (f.segment && !p.segments.includes(f.segment)) return false;
    if (f.q) {
      const q = f.q.toLowerCase();
      if (!`${p.id} ${p.alias} ${p.emailHash} ${p.externalId}`.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [f]);

  const kpis = useMemo(() => playerKpis(rows), [rows]);
  const anyFilter = Object.values(f).some(Boolean);

  return (
    <div className="mx-auto w-full max-w-[1360px] px-8 py-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[19px] font-semibold tracking-tight">Players</h1>
          <p className="mt-1 text-[13px] text-fg-secondary">Inspect players across brands — loyalty status, risk, KYC and responsible-gambling posture, and take controlled actions.</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="mt-5 grid grid-cols-5 gap-3">
        <Kpi icon={Users} label="Players" value={fmtNum(kpis.total)} />
        <Kpi icon={Crown} label="VIP / high-tier" value={String(kpis.vips)} accent="var(--tier-diamond)" />
        <Kpi icon={AlertTriangle} label="Risk flagged" value={String(kpis.flagged)} accent="var(--warning)" />
        <Kpi icon={FileCheck2} label="KYC open" value={String(kpis.kycOpen)} accent="var(--status-scheduled)" />
        <Kpi icon={ShieldAlert} label="RG active" value={String(kpis.rgActive)} accent="var(--danger)" />
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <FilterSelect label="Brand" value={f.brand} onChange={(v) => set({ brand: v })} options={BRANDS.map((b) => ({ v: b.code, l: b.code }))} />
        <FilterSelect label="Country" value={f.country} onChange={(v) => set({ country: v })} options={COUNTRIES.map((c) => ({ v: c, l: c }))} />
        <FilterSelect label="Tier" value={f.tier} onChange={(v) => set({ tier: v })} options={TIER_NAMES.map((t) => ({ v: t, l: t }))} />
        <FilterSelect label="Risk" value={f.risk} onChange={(v) => set({ risk: v })} options={(['clear', 'watch', 'flagged'] as RiskFlag[]).map((r) => ({ v: r, l: RISK_META[r].label }))} />
        <FilterSelect label="Campaign" value={f.campaign} onChange={(v) => set({ campaign: v })} options={ALL_CAMPAIGNS.map((c) => ({ v: c, l: c }))} />
        <FilterSelect label="KYC" value={f.kyc} onChange={(v) => set({ kyc: v })} options={(['verified', 'pending', 'review', 'expired'] as KycStatus[]).map((k) => ({ v: k, l: KYC_META[k].label }))} />
        <FilterSelect label="RG" value={f.rg} onChange={(v) => set({ rg: v })} options={(['ok', 'monitoring', 'cooldown', 'self_excluded'] as RgStatus[]).map((r) => ({ v: r, l: RG_META[r].label }))} />
        <FilterSelect label="Segment" value={f.segment} onChange={(v) => set({ segment: v })} options={PLAYER_SEGMENTS.map((s) => ({ v: s, l: s }))} />
        <div className="ml-auto flex items-center gap-2 rounded-md border px-3 py-2" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
          <Search size={14} className="text-fg-muted" strokeWidth={1.75} />
          <input value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Player ID, email hash, platform ID…" className="w-52 bg-transparent text-[13px] outline-none" />
        </div>
        {anyFilter && <button onClick={() => setF(EMPTY)} className="text-[12px] font-medium" style={{ color: 'var(--accent)' }}>Clear</button>}
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full border-collapse text-left">
            <thead>
              <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-1)' }}>
                {['Player', 'Brand', 'Country', 'Tier', 'Status', 'Risk', 'Campaigns', 'Last activity', 'LTV', 'Reward liability'].map((c, i) => (
                  <th key={c} className={`px-4 py-2.5 font-semibold ${i >= 8 ? 'text-right' : ''}`}>{c}</th>
                ))}
                <th className="px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} onClick={() => navigate(`/players/${p.id}`)} className="cursor-pointer border-t transition-colors" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-3)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold" style={{ background: 'var(--surface-3)', color: p.vip ? 'var(--tier-diamond)' : 'var(--fg-secondary)' }}>{initials(p.alias)}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-[13px] font-medium text-fg-primary">{p.alias}</span>
                          {p.vip && <Crown size={11} style={{ color: 'var(--tier-diamond)' }} strokeWidth={2} />}
                        </div>
                        <div className="font-mono text-[11px] text-fg-muted">{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-fg-secondary">{p.brand}</td>
                  <td className="px-4 py-3 text-[12.5px] text-fg-secondary">{p.country}</td>
                  <td className="px-4 py-3"><TierCell tier={p.tier} color={p.tierColor} /></td>
                  <td className="px-4 py-3"><Pill meta={PLAYER_STATUS_META[p.status]} /></td>
                  <td className="px-4 py-3"><Pill meta={RISK_META[p.risk]} dot /></td>
                  <td className="px-4 py-3">
                    {p.activeCampaigns.length > 0
                      ? <span className="rounded px-1.5 py-0.5 text-[11.5px] font-medium text-fg-secondary" style={{ background: 'var(--surface-3)' }}>{p.activeCampaigns.length}</span>
                      : <span className="text-[12px] text-fg-muted">—</span>}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-fg-secondary">{p.lastActivity}</td>
                  <td className="px-4 py-3 text-right font-mono text-[12.5px] tabular-nums text-fg-primary">{fmtMoney(p.metrics.ltv, 'EUR')}</td>
                  <td className="px-4 py-3 text-right font-mono text-[12.5px] tabular-nums" style={{ color: p.metrics.cashbackLiability >= 5000 ? 'var(--warning)' : 'var(--fg-secondary)' }}>{p.metrics.cashbackLiability > 0 ? fmtMoney(p.metrics.cashbackLiability, 'EUR') : '—'}</td>
                  <td className="px-2 py-3"><ChevronRight size={15} className="text-fg-muted" strokeWidth={2} /></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={11} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--surface-3)' }}><Users size={18} className="text-fg-muted" strokeWidth={1.75} /></div>
                    <p className="text-[13px] font-medium text-fg-primary">No players</p>
                    <p className="text-[12px] text-fg-muted">No players match the current filters.</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, accent = 'var(--accent)' }: { icon: LucideIcon; label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border px-4 py-3.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">
        <span className="flex h-5 w-5 items-center justify-center rounded" style={{ background: 'var(--surface-3)', color: accent }}><Icon size={12} strokeWidth={2.25} /></span>
        {label}
      </div>
      <div className="mt-1.5 font-mono text-[22px] font-semibold leading-none tracking-tight tabular-nums text-fg-primary">{value}</div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  const active = value !== '';
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="cursor-pointer appearance-none rounded-md border py-2 pl-3 pr-8 text-[12.5px] font-medium outline-none" style={{ borderColor: active ? 'var(--accent-border)' : 'var(--border-strong)', background: active ? 'var(--accent-bg)' : 'var(--surface-2)', color: active ? 'var(--fg-primary)' : 'var(--fg-secondary)' }}>
        <option value="">{label}: All</option>
        {options.map((o) => <option key={o.v} value={o.v}>{label}: {o.l}</option>)}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-muted" strokeWidth={2} />
    </div>
  );
}

export function TierCell({ tier, color }: { tier: string; color: Player['tierColor'] }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: TIER_VAR[color] }} />
      <span className="text-[12.5px] font-medium text-fg-primary">{tier}</span>
    </div>
  );
}

export function Pill({ meta, dot }: { meta: { label: string; fg: string; bg: string }; dot?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium leading-none" style={{ color: meta.fg, background: meta.bg }}>
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.fg }} />}{meta.label}
    </span>
  );
}
