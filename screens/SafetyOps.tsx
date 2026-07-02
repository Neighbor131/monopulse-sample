import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ban, Clock, ShieldAlert, Gift, Plug, ChevronRight, Search, Check,
  AlertTriangle, Activity, RadioTower, ArrowUpRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useReviews } from '../context/ReviewsContext';
import { getType, fmtMoney, initials, BRANDS, CAMPAIGN_TYPES } from '../data/campaigns';
import { countBySeverity } from '../data/reviews';
import type { Review } from '../data/reviews';
import {
  FRAUD_CASES, MANUAL_REWARDS, COMPLIANCE_EXCEPTIONS, WEBHOOK_FAILURES, AUDIT_RECORDS,
  EXCEPTION_KIND_LABEL, safetyKpis, severitySplitAll,
  reviewToDrawer, fraudToDrawer, rewardToDrawer, exceptionToDrawer, webhookToDrawer, auditToDrawer,
} from '../data/safety';
import type { DrawerModel, Severity, FraudCase, ManualReward, ComplianceException, WebhookFailure, SafetyAuditRecord } from '../data/safety';
import SafetyDrawer, { SeverityBadge, StatusPill, SeverityDot } from '../components/safety/SafetyDrawer';

type TabId = 'overview' | 'review' | 'fraud' | 'reward' | 'exception' | 'audit' | 'webhook';

interface Filters { brand: string; type: string; severity: string; status: string; assignee: string; q: string }
const EMPTY: Filters = { brand: '', type: '', severity: '', status: '', assignee: '', q: '' };

const ASSIGNEES = ['You', 'Sofia Lindqvist', 'Ravi Menon', 'Dan Whitlock', 'Priya Nair'];

export default function SafetyOps() {
  const navigate = useNavigate();
  const { reviews } = useReviews();
  const [tab, setTab] = useState<TabId>('overview');
  const [f, setF] = useState<Filters>(EMPTY);
  const [drawer, setDrawer] = useState<DrawerModel | null>(null);

  const kpis = useMemo(() => safetyKpis(reviews), [reviews]);
  const split = useMemo(() => severitySplitAll(reviews), [reviews]);

  const reviewQueue = useMemo(() => reviews.filter((r) => ['pending', 'blocked', 'reset', 'changes_requested'].includes(r.decision)), [reviews]);

  const set = (patch: Partial<Filters>) => setF((p) => ({ ...p, ...patch }));

  // ── generic filter predicate over common fields ──
  const matchCommon = (o: { brand?: string; type?: string; severity?: Severity; q: string }) => {
    if (f.brand && o.brand !== f.brand) return false;
    if (f.type && o.type !== f.type) return false;
    if (f.severity && o.severity !== f.severity) return false;
    if (f.q && !o.q.toLowerCase().includes(f.q.toLowerCase())) return false;
    return true;
  };

  // filtered per-queue
  const fReviews = reviewQueue.filter((r) => {
    const s = countBySeverity(r.checks);
    const sev: Severity = s.blocker ? 'critical' : s.warning ? 'warning' : 'info';
    if (f.brand && !r.brands.includes(f.brand)) return false;
    if (f.type && r.type !== f.type) return false;
    if (f.severity && sev !== f.severity) return false;
    if (f.status && r.decision !== f.status) return false;
    if (f.assignee && !r.waitingFor.includes(f.assignee) && r.submittedBy !== f.assignee) return false;
    if (f.q && !`${r.name} ${r.submittedBy} ${r.id}`.toLowerCase().includes(f.q.toLowerCase())) return false;
    return true;
  });
  const fFraud = FRAUD_CASES.filter((x) => matchCommon({ brand: x.brand, type: x.type, severity: x.severity, q: `${x.playerAlias} ${x.playerId} ${x.campaignName} ${x.triggerReason} ${x.id}` }) && (!f.status || x.status === f.status));
  const fReward = MANUAL_REWARDS.filter((x) => matchCommon({ brand: x.brand, type: x.type, severity: x.severity, q: `${x.rewardType} ${x.playerId} ${x.campaignName} ${x.holdReason} ${x.id}` }) && (!f.status || x.status === f.status));
  const fExc = COMPLIANCE_EXCEPTIONS.filter((x) => matchCommon({ brand: x.brand, type: x.type, severity: x.severity, q: `${x.title} ${x.campaignName} ${x.id}` }) && (!f.status || x.status === f.status) && (!f.assignee || x.owner === f.assignee));
  const fWeb = WEBHOOK_FAILURES.filter((x) => matchCommon({ brand: x.brand, type: x.type, severity: x.severity, q: `${x.provider} ${x.errorCode} ${x.campaignName} ${x.playerId} ${x.id}` }) && (!f.status || x.status === f.status));
  const fAudit = AUDIT_RECORDS.filter((x) => (!f.brand || x.brand === f.brand) && (!f.q || `${x.actor} ${x.summary} ${x.target} ${x.id}`.toLowerCase().includes(f.q.toLowerCase())) && (!f.assignee || x.actor === f.assignee));

  const TABS: { id: TabId; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'review', label: 'Review queue', count: reviewQueue.length },
    { id: 'fraud', label: 'Fraud & abuse', count: FRAUD_CASES.filter((x) => x.status !== 'released').length },
    { id: 'reward', label: 'Manual rewards', count: MANUAL_REWARDS.filter((x) => ['held', 'compliance'].includes(x.status)).length },
    { id: 'exception', label: 'Compliance', count: COMPLIANCE_EXCEPTIONS.filter((x) => x.status === 'open').length },
    { id: 'audit', label: 'Audit log' },
    { id: 'webhook', label: 'Fulfillment failures', count: WEBHOOK_FAILURES.filter((x) => x.status !== 'resolved').length },
  ];

  // status options per active tab
  const statusOptions = useMemo<string[]>(() => {
    switch (tab) {
      case 'review': return ['pending', 'blocked', 'reset', 'changes_requested'];
      case 'fraud': return ['open', 'holding', 'escalated', 'released', 'excluded'];
      case 'reward': return ['held', 'compliance', 'approved', 'rejected'];
      case 'exception': return ['open', 'resolved', 'waived'];
      case 'webhook': return ['failing', 'retrying', 'resolved'];
      default: return [];
    }
  }, [tab]);

  const openCampaign = () => navigate('/');
  const openReview = (id: string) => navigate(`/approvals/${id}`);
  const filtersActive = tab !== 'overview' && tab !== 'audit';

  return (
    <div className="mx-auto w-full max-w-[1360px] px-8 py-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[19px] font-semibold tracking-tight">Safety Operations</h1>
            <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ color: 'var(--success)', background: 'var(--status-live-bg)' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--success)' }} /> Safety engine live
            </span>
          </div>
          <p className="mt-1 text-[13px] text-fg-secondary">Control center for launch blockers, reward reviews, suspicious activity and fulfillment failures across all brands.</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="mt-5 grid grid-cols-5 gap-3">
        <Kpi icon={Ban} label="Open blockers" value={kpis.openBlockers} fg="var(--danger)" bg="var(--danger-bg)" onClick={() => setTab('review')} active={tab === 'review'} />
        <Kpi icon={Clock} label="Pending approvals" value={kpis.pendingApprovals} fg="var(--status-pending)" bg="var(--status-pending-bg)" onClick={() => setTab('review')} active={tab === 'review'} />
        <Kpi icon={ShieldAlert} label="Fraud flags" value={kpis.fraudFlags} fg="var(--danger)" bg="var(--danger-bg)" onClick={() => setTab('fraud')} active={tab === 'fraud'} />
        <Kpi icon={Gift} label="Reward reviews" value={kpis.manualReviews} fg="var(--warning)" bg="var(--warning-bg)" onClick={() => setTab('reward')} active={tab === 'reward'} />
        <Kpi icon={Plug} label="Failed webhooks" value={kpis.failedWebhooks} fg="var(--danger)" bg="var(--danger-bg)" onClick={() => setTab('webhook')} active={tab === 'webhook'} />
      </div>

      {/* Severity split */}
      <div className="mt-3">
        <SeveritySplit split={split} />
      </div>

      {/* Tab nav */}
      <div className="mt-6 flex items-center gap-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        {TABS.map((t) => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setF((p) => ({ ...p, status: '' })); }}
              className="relative flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium transition-colors"
              style={{ color: on ? 'var(--fg-primary)' : 'var(--fg-secondary)' }}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold" style={on ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { background: 'var(--surface-3)', color: 'var(--fg-muted)' }}>
                  {t.count}
                </span>
              )}
              {on && <span className="absolute inset-x-0 -bottom-px h-0.5" style={{ background: 'var(--accent)' }} />}
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      {(filtersActive || tab === 'audit') && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <FilterSelect label="Brand" value={f.brand} onChange={(v) => set({ brand: v })} options={BRANDS.map((b) => ({ v: b.code, l: `${b.code} · ${b.name}` }))} />
          {tab !== 'audit' && <FilterSelect label="Campaign type" value={f.type} onChange={(v) => set({ type: v })} options={CAMPAIGN_TYPES.map((c) => ({ v: c.id, l: c.name }))} />}
          {tab !== 'audit' && <FilterSelect label="Severity" value={f.severity} onChange={(v) => set({ severity: v })} options={[{ v: 'critical', l: 'Critical' }, { v: 'warning', l: 'Warning' }, { v: 'info', l: 'Info' }]} />}
          {statusOptions.length > 0 && <FilterSelect label="Status" value={f.status} onChange={(v) => set({ status: v })} options={statusOptions.map((s) => ({ v: s, l: s.replace('_', ' ') }))} />}
          <FilterSelect label="Assignee" value={f.assignee} onChange={(v) => set({ assignee: v })} options={ASSIGNEES.map((a) => ({ v: a, l: a }))} />
          <div className="ml-auto flex items-center gap-2 rounded-md border px-3 py-2" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
            <Search size={14} className="text-fg-muted" strokeWidth={1.75} />
            <input value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Search…" className="w-48 bg-transparent text-[13px] outline-none" />
          </div>
          {(f.brand || f.type || f.severity || f.status || f.assignee || f.q) && (
            <button onClick={() => setF(EMPTY)} className="text-[12px] font-medium" style={{ color: 'var(--accent)' }}>Clear</button>
          )}
        </div>
      )}

      {/* Tab content */}
      <div className="mt-4">
        {tab === 'overview' && <Overview split={split} reviews={reviewQueue} onOpen={setDrawer} goTab={setTab} />}
        {tab === 'review' && <ReviewTable rows={fReviews} onOpen={(r) => setDrawer(reviewToDrawer(r))} />}
        {tab === 'fraud' && <FraudTable rows={fFraud} onOpen={(x) => setDrawer(fraudToDrawer(x))} />}
        {tab === 'reward' && <RewardTable rows={fReward} onOpen={(x) => setDrawer(rewardToDrawer(x))} />}
        {tab === 'exception' && <ExceptionTable rows={fExc} onOpen={(x) => setDrawer(exceptionToDrawer(x))} />}
        {tab === 'audit' && <AuditTable rows={fAudit} onOpen={(x) => setDrawer(auditToDrawer(x))} />}
        {tab === 'webhook' && <WebhookTable rows={fWeb} onOpen={(x) => setDrawer(webhookToDrawer(x))} />}
      </div>

      <SafetyDrawer
        model={drawer}
        onClose={() => setDrawer(null)}
        onAction={() => setDrawer(null)}
        onOpenCampaign={openCampaign}
        onOpenReview={openReview}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// KPI + severity split
// ─────────────────────────────────────────────────────────────
function Kpi({ icon: Icon, label, value, fg, bg, onClick, active }: { icon: LucideIcon; label: string; value: number; fg: string; bg: string; onClick: () => void; active?: boolean }) {
  const on = value > 0;
  return (
    <button
      onClick={onClick}
      className="rounded-xl border px-4 py-3.5 text-left transition-colors"
      style={{ borderColor: active ? 'var(--accent-border)' : on ? fg : 'var(--border-subtle)', background: active ? 'var(--accent-bg)' : 'var(--surface-1)' }}
    >
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">
        <span className="flex h-5 w-5 items-center justify-center rounded" style={{ background: bg, color: fg }}>
          <Icon size={12} strokeWidth={2.25} />
        </span>
        {label}
      </div>
      <div className="mt-1.5 font-mono text-[24px] font-semibold leading-none tabular-nums" style={{ color: on ? 'var(--fg-primary)' : 'var(--fg-muted)' }}>{value}</div>
    </button>
  );
}

function SeveritySplit({ split }: { split: Record<Severity, number> }) {
  const total = split.critical + split.warning + split.info || 1;
  const segs: { sev: Severity; label: string; fg: string; n: number }[] = [
    { sev: 'critical', label: 'Critical', fg: 'var(--danger)', n: split.critical },
    { sev: 'warning', label: 'Warning', fg: 'var(--warning)', n: split.warning },
    { sev: 'info', label: 'Info', fg: 'var(--status-scheduled)', n: split.info },
  ];
  return (
    <div className="flex items-center gap-5 rounded-xl border px-4 py-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Severity split</div>
      <div className="flex h-2 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--surface-3)' }}>
        {segs.map((s) => <div key={s.sev} style={{ width: `${(s.n / total) * 100}%`, background: s.fg }} />)}
      </div>
      <div className="flex items-center gap-4">
        {segs.map((s) => (
          <div key={s.sev} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: s.fg }} />
            <span className="text-[12px] text-fg-secondary">{s.label}</span>
            <span className="font-mono text-[12.5px] font-semibold tabular-nums text-fg-primary">{s.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Filter select (native)
// ─────────────────────────────────────────────────────────────
function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  const active = value !== '';
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-md border py-2 pl-3 pr-8 text-[12.5px] font-medium outline-none"
        style={{ borderColor: active ? 'var(--accent-border)' : 'var(--border-strong)', background: active ? 'var(--accent-bg)' : 'var(--surface-2)', color: active ? 'var(--fg-primary)' : 'var(--fg-secondary)' }}
      >
        <option value="">{label}: All</option>
        {options.map((o) => <option key={o.v} value={o.v}>{label}: {o.l}</option>)}
      </select>
      <ChevronRight size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-fg-muted" strokeWidth={2} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared table shell
// ─────────────────────────────────────────────────────────────
function TableShell({ cols, children, empty }: { cols: { label: string; align?: 'right'; w?: string }[]; children: React.ReactNode; empty: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted" style={{ background: 'var(--surface-1)' }}>
            {cols.map((c) => <th key={c.label} className={`px-4 py-2.5 font-semibold ${c.align === 'right' ? 'text-right' : ''}`} style={c.w ? { width: c.w } : undefined}>{c.label}</th>)}
            <th className="px-2 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {children}
          {empty && (
            <tr>
              <td colSpan={cols.length + 1} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--surface-3)' }}>
                    <Check size={18} className="text-fg-muted" strokeWidth={2} />
                  </div>
                  <p className="text-[13px] font-medium text-fg-primary">Nothing here</p>
                  <p className="text-[12px] text-fg-muted">No items match the current filters.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Tr({ onClick, accent, children }: { onClick: () => void; accent?: string; children: React.ReactNode }) {
  return (
    <tr
      onClick={onClick}
      className="cursor-pointer border-t transition-colors"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-3)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
    >
      {children}
    </tr>
  );
}

function BrandChips({ brands, scope }: { brands: string[]; scope?: 'all' | 'selected' }) {
  if (scope === 'all') return <span className="rounded px-1.5 py-0.5 text-[11px] font-medium" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>Network · {brands.length}</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {brands.slice(0, 3).map((b) => <span key={b} className="rounded px-1.5 py-0.5 font-mono text-[10.5px] font-medium" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{b}</span>)}
      {brands.length > 3 && <span className="text-[10.5px] text-fg-muted">+{brands.length - 3}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Review Queue table
// ─────────────────────────────────────────────────────────────
function ReviewTable({ rows, onOpen }: { rows: Review[]; onOpen: (r: Review) => void }) {
  return (
    <TableShell empty={rows.length === 0} cols={[
      { label: 'Campaign' }, { label: 'Module' }, { label: 'Brand scope' },
      { label: 'Budget exposure' }, { label: 'Requester' }, { label: 'Risk' }, { label: 'Submitted' },
    ]}>
      {rows.map((r) => {
        const type = getType(r.type);
        const TypeIcon = type.icon;
        const sev = countBySeverity(r.checks);
        const pct = Math.min(100, Math.round((r.projectedSpend / r.budgetCap) * 100));
        const accent = sev.blocker ? 'var(--danger)' : r.decision === 'reset' ? 'var(--warning)' : undefined;
        return (
          <Tr key={r.id} onClick={() => onOpen(r)}>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2.5">
                {accent && <span className="h-8 w-0.5 shrink-0 rounded-full" style={{ background: accent }} />}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}><TypeIcon size={14} strokeWidth={1.75} /></div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-fg-primary">{r.name}</div>
                  <div className="text-[11px] text-fg-muted">{r.id} · {r.decision.replace('_', ' ')}</div>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-[12.5px] text-fg-secondary">{type.name}</td>
            <td className="px-4 py-3"><BrandChips brands={r.brands} scope={r.brandScope} /></td>
            <td className="px-4 py-3">
              <div className="w-28">
                <div className="flex items-baseline justify-between text-[11.5px]"><span className="font-mono font-medium text-fg-primary">{fmtMoney(r.projectedSpend, r.currency)}</span><span className="text-fg-muted">{pct}%</span></div>
                <div className="mt-1 h-1 overflow-hidden rounded-full" style={{ background: 'var(--surface-3)' }}><div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 90 ? 'var(--warning)' : 'var(--accent)' }} /></div>
              </div>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full text-[9.5px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{initials(r.submittedBy)}</div>
                <div className="text-[12px] text-fg-primary">{r.submittedBy}</div>
              </div>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1.5">
                {sev.blocker > 0 && <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-semibold" style={{ color: 'var(--danger)', background: 'var(--danger-bg)' }}><Ban size={10} strokeWidth={2.5} /> {sev.blocker}</span>}
                {sev.warning > 0 && <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-semibold" style={{ color: 'var(--warning)', background: 'var(--warning-bg)' }}><AlertTriangle size={10} strokeWidth={2.5} /> {sev.warning}</span>}
                {sev.blocker === 0 && sev.warning === 0 && <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: 'var(--success)' }}><Check size={12} strokeWidth={2.5} /> Clear</span>}
              </div>
            </td>
            <td className="px-4 py-3 text-[12px] text-fg-muted">{r.submittedAt}</td>
            <td className="px-2 py-3 text-fg-muted"><ChevronRight size={16} strokeWidth={2} /></td>
          </Tr>
        );
      })}
    </TableShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Fraud table
// ─────────────────────────────────────────────────────────────
function FraudTable({ rows, onOpen }: { rows: FraudCase[]; onOpen: (x: FraudCase) => void }) {
  return (
    <TableShell empty={rows.length === 0} cols={[
      { label: 'Player' }, { label: 'Brand' }, { label: 'Campaign' }, { label: 'Trigger' },
      { label: 'Reward', align: 'right' }, { label: 'Velocity' }, { label: 'Status' },
    ]}>
      {rows.map((x) => (
        <Tr key={x.id} onClick={() => onOpen(x)}>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2.5">
              <SeverityDot severity={x.severity} />
              <div className="min-w-0"><div className="text-[13px] font-medium text-fg-primary">{x.playerAlias}</div><div className="font-mono text-[11px] text-fg-muted">{x.playerId}</div></div>
            </div>
          </td>
          <td className="px-4 py-3"><span className="rounded px-1.5 py-0.5 font-mono text-[10.5px] font-medium" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{x.brand}</span></td>
          <td className="px-4 py-3"><div className="text-[12.5px] text-fg-primary">{x.campaignName}</div><div className="text-[11px] text-fg-muted">{getType(x.type).name}</div></td>
          <td className="px-4 py-3"><div className="max-w-[200px] text-[12px] text-fg-secondary">{x.triggerReason}</div></td>
          <td className="px-4 py-3 text-right font-mono text-[12.5px] tabular-nums" style={{ color: x.rewardValue > 0 ? 'var(--danger)' : 'var(--fg-muted)' }}>{x.rewardValue > 0 ? fmtMoney(x.rewardValue, 'EUR') : '—'}</td>
          <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-1.5 w-14 overflow-hidden rounded-full" style={{ background: 'var(--surface-3)' }}><div className="h-full rounded-full" style={{ width: `${x.velocityScore}%`, background: x.velocityScore >= 80 ? 'var(--danger)' : 'var(--warning)' }} /></div><span className="font-mono text-[11px] text-fg-secondary">{x.velocityScore}</span></div></td>
          <td className="px-4 py-3"><StatusPill status={x.status} /></td>
          <td className="px-2 py-3 text-fg-muted"><ChevronRight size={16} strokeWidth={2} /></td>
        </Tr>
      ))}
    </TableShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Manual reward table
// ─────────────────────────────────────────────────────────────
function RewardTable({ rows, onOpen }: { rows: ManualReward[]; onOpen: (x: ManualReward) => void }) {
  return (
    <TableShell empty={rows.length === 0} cols={[
      { label: 'Reward' }, { label: 'Value', align: 'right' }, { label: 'Fulfillment' },
      { label: 'Player' }, { label: 'Campaign' }, { label: 'Hold reason' }, { label: 'Status' },
    ]}>
      {rows.map((x) => (
        <Tr key={x.id} onClick={() => onOpen(x)}>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2.5"><SeverityDot severity={x.severity} /><div className="text-[13px] font-medium text-fg-primary">{x.rewardType}</div></div>
          </td>
          <td className="px-4 py-3 text-right font-mono text-[12.5px] tabular-nums text-fg-primary">{fmtMoney(x.value, 'EUR')}</td>
          <td className="px-4 py-3 text-[12px] text-fg-secondary">{x.fulfillmentMethod}</td>
          <td className="px-4 py-3 font-mono text-[11.5px] text-fg-secondary">{x.playerId}</td>
          <td className="px-4 py-3"><div className="text-[12.5px] text-fg-primary">{x.campaignName}</div><div className="text-[11px] text-fg-muted">{x.brand}</div></td>
          <td className="px-4 py-3"><div className="max-w-[180px] text-[12px] text-fg-secondary">{x.holdReason}</div></td>
          <td className="px-4 py-3"><StatusPill status={x.status} /></td>
          <td className="px-2 py-3 text-fg-muted"><ChevronRight size={16} strokeWidth={2} /></td>
        </Tr>
      ))}
    </TableShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Compliance exceptions table
// ─────────────────────────────────────────────────────────────
function ExceptionTable({ rows, onOpen }: { rows: ComplianceException[]; onOpen: (x: ComplianceException) => void }) {
  return (
    <TableShell empty={rows.length === 0} cols={[
      { label: 'Exception' }, { label: 'Type' }, { label: 'Brand' }, { label: 'Campaign' },
      { label: 'Owner' }, { label: 'Raised' }, { label: 'Status' },
    ]}>
      {rows.map((x) => (
        <Tr key={x.id} onClick={() => onOpen(x)}>
          <td className="px-4 py-3">
            <div className="flex items-start gap-2.5">
              <span className="mt-1"><SeverityDot severity={x.severity} /></span>
              <div className="min-w-0"><div className="max-w-[260px] truncate text-[13px] font-medium text-fg-primary">{x.title}</div><div className="text-[11px] text-fg-muted">{x.id}</div></div>
            </div>
          </td>
          <td className="px-4 py-3"><span className="rounded px-1.5 py-0.5 text-[10.5px] font-medium" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{EXCEPTION_KIND_LABEL[x.kind]}</span></td>
          <td className="px-4 py-3"><span className="rounded px-1.5 py-0.5 font-mono text-[10.5px] font-medium" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{x.brand}</span></td>
          <td className="px-4 py-3 text-[12.5px] text-fg-primary">{x.campaignName}</td>
          <td className="px-4 py-3 text-[12px] text-fg-secondary">{x.owner}</td>
          <td className="px-4 py-3 text-[12px] text-fg-muted">{x.raisedAt}</td>
          <td className="px-4 py-3"><StatusPill status={x.status} /></td>
          <td className="px-2 py-3 text-fg-muted"><ChevronRight size={16} strokeWidth={2} /></td>
        </Tr>
      ))}
    </TableShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Webhook failures table
// ─────────────────────────────────────────────────────────────
function WebhookTable({ rows, onOpen }: { rows: WebhookFailure[]; onOpen: (x: WebhookFailure) => void }) {
  return (
    <TableShell empty={rows.length === 0} cols={[
      { label: 'Provider' }, { label: 'Error' }, { label: 'Retries', align: 'right' },
      { label: 'Last attempt' }, { label: 'Campaign / player' }, { label: 'Reward', align: 'right' }, { label: 'Status' },
    ]}>
      {rows.map((x) => (
        <Tr key={x.id} onClick={() => onOpen(x)}>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2.5"><SeverityDot severity={x.severity} /><div className="min-w-0"><div className="truncate text-[13px] font-medium text-fg-primary">{x.provider}</div><div className="text-[11px] text-fg-muted">{x.id}</div></div></div>
          </td>
          <td className="px-4 py-3"><span className="rounded px-1.5 py-0.5 font-mono text-[10.5px] font-medium" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>{x.errorCode}</span></td>
          <td className="px-4 py-3 text-right"><span className="font-mono text-[12.5px] tabular-nums" style={{ color: x.retryCount >= x.maxRetries ? 'var(--danger)' : 'var(--fg-secondary)' }}>{x.retryCount}/{x.maxRetries}</span></td>
          <td className="px-4 py-3 text-[12px] text-fg-muted">{x.lastAttempt}</td>
          <td className="px-4 py-3"><div className="text-[12.5px] text-fg-primary">{x.campaignName}</div><div className="font-mono text-[11px] text-fg-muted">{x.playerId}</div></td>
          <td className="px-4 py-3 text-right font-mono text-[12.5px] tabular-nums text-fg-primary">{fmtMoney(x.rewardValue, 'EUR')}</td>
          <td className="px-4 py-3"><StatusPill status={x.status} /></td>
          <td className="px-2 py-3 text-fg-muted"><ChevronRight size={16} strokeWidth={2} /></td>
        </Tr>
      ))}
    </TableShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Audit log (rich table, before → after inline)
// ─────────────────────────────────────────────────────────────
const AUDIT_TONE: Record<string, string> = {
  approve: 'var(--success)', release: 'var(--success)', reject: 'var(--danger)', exclude: 'var(--danger)',
  escalate: 'var(--status-scheduled)', changes: 'var(--status-scheduled)', reset: 'var(--warning)',
  hold: 'var(--warning)', waive: 'var(--warning)', retry: 'var(--fg-muted)', edit: 'var(--fg-secondary)', submit: 'var(--fg-secondary)',
};

function AuditTable({ rows, onOpen }: { rows: SafetyAuditRecord[]; onOpen: (x: SafetyAuditRecord) => void }) {
  return (
    <TableShell empty={rows.length === 0} cols={[
      { label: 'Actor' }, { label: 'Action' }, { label: 'Target' }, { label: 'Change' }, { label: 'Brand' }, { label: 'When' },
    ]}>
      {rows.map((x) => (
        <tr
          key={x.id}
          onClick={() => onOpen(x)}
          className="cursor-pointer border-t transition-colors"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-3)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
        >
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full text-[9.5px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{initials(x.actor)}</div>
              <div><div className="text-[12.5px] font-medium text-fg-primary">{x.actor}</div><div className="text-[10.5px] text-fg-muted">{x.role}</div></div>
            </div>
          </td>
          <td className="px-4 py-3">
            <span className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] font-medium" style={{ color: AUDIT_TONE[x.action] ?? 'var(--fg-secondary)', background: 'var(--surface-3)' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: AUDIT_TONE[x.action] ?? 'var(--fg-secondary)' }} /> {x.action}
            </span>
            <div className="mt-1 max-w-[240px] text-[12px] text-fg-secondary">{x.summary}</div>
          </td>
          <td className="px-4 py-3"><span className="font-mono text-[11.5px] text-fg-secondary">{x.target}</span><div className="text-[10.5px] text-fg-muted">{x.targetKind}</div></td>
          <td className="px-4 py-3">
            {x.field ? (
              <div className="flex items-center gap-1.5 text-[11.5px]">
                <span className="rounded px-1.5 py-0.5 font-mono line-through" style={{ background: 'var(--surface-3)', color: 'var(--fg-muted)' }}>{x.before}</span>
                <ArrowUpRight size={12} className="text-fg-muted" strokeWidth={2} />
                <span className="rounded px-1.5 py-0.5 font-mono" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{x.after}</span>
              </div>
            ) : <span className="text-[12px] text-fg-muted">—</span>}
          </td>
          <td className="px-4 py-3"><span className="rounded px-1.5 py-0.5 font-mono text-[10.5px] font-medium" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{x.brand}</span></td>
          <td className="px-4 py-3 font-mono text-[11.5px] text-fg-muted">{x.at}</td>
          <td className="px-2 py-3 text-fg-muted"><ChevronRight size={16} strokeWidth={2} /></td>
        </tr>
      ))}
    </TableShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Overview tab
// ─────────────────────────────────────────────────────────────
function Overview({ split, reviews, onOpen, goTab }: { split: Record<Severity, number>; reviews: Review[]; onOpen: (m: DrawerModel) => void; goTab: (t: TabId) => void }) {
  // aggregate critical / high-priority items across queues
  const critical: DrawerModel[] = [
    ...reviews.filter((r) => r.decision === 'blocked').map(reviewToDrawer),
    ...FRAUD_CASES.filter((x) => x.severity === 'critical' && x.status !== 'released').map(fraudToDrawer),
    ...MANUAL_REWARDS.filter((x) => x.severity === 'critical' && ['held', 'compliance'].includes(x.status)).map(rewardToDrawer),
    ...COMPLIANCE_EXCEPTIONS.filter((x) => x.severity === 'critical' && x.status === 'open').map(exceptionToDrawer),
    ...WEBHOOK_FAILURES.filter((x) => x.severity === 'critical' && x.status !== 'resolved').map(webhookToDrawer),
  ];

  const health: { label: string; tab: TabId; icon: LucideIcon; value: number; sub: string; fg: string }[] = [
    { label: 'Review queue', tab: 'review', icon: Clock, value: reviews.length, sub: `${reviews.filter((r) => r.decision === 'blocked').length} blocked`, fg: 'var(--status-pending)' },
    { label: 'Fraud & abuse', tab: 'fraud', icon: ShieldAlert, value: FRAUD_CASES.filter((x) => x.status !== 'released').length, sub: `${FRAUD_CASES.filter((x) => x.severity === 'critical').length} critical`, fg: 'var(--danger)' },
    { label: 'Manual rewards', tab: 'reward', icon: Gift, value: MANUAL_REWARDS.filter((x) => ['held', 'compliance'].includes(x.status)).length, sub: 'awaiting decision', fg: 'var(--warning)' },
    { label: 'Compliance', tab: 'exception', icon: RadioTower, value: COMPLIANCE_EXCEPTIONS.filter((x) => x.status === 'open').length, sub: 'open exceptions', fg: 'var(--danger)' },
    { label: 'Fulfillment', tab: 'webhook', icon: Plug, value: WEBHOOK_FAILURES.filter((x) => x.status !== 'resolved').length, sub: 'delivery failures', fg: 'var(--danger)' },
    { label: 'Audit log', tab: 'audit', icon: Activity, value: AUDIT_RECORDS.length, sub: 'tracked actions', fg: 'var(--status-scheduled)' },
  ];

  return (
    <div className="grid grid-cols-[1fr_360px] gap-6">
      {/* Critical attention list */}
      <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2"><ShieldAlert size={15} className="text-fg-secondary" strokeWidth={2} /><h3 className="text-[13.5px] font-semibold text-fg-primary">Needs immediate attention</h3><span className="rounded px-1.5 py-0.5 text-[10.5px] font-semibold" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>{critical.length}</span></div>
        </div>
        <div className="flex flex-col">
          {critical.map((m) => (
            <div
              key={m.kind + m.id}
              role="button" tabIndex={0}
              onClick={() => onOpen(m)}
              onKeyDown={(e) => { if (e.key === 'Enter') onOpen(m); }}
              className="flex cursor-pointer items-center gap-3 border-t px-5 py-3 transition-colors first:border-t-0"
              style={{ borderColor: 'var(--border-subtle)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span className="h-8 w-0.5 shrink-0 rounded-full" style={{ background: 'var(--danger)' }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">{m.kindLabel}</span>
                  <span className="font-mono text-[10.5px] text-fg-muted">{m.id}</span>
                </div>
                <div className="mt-0.5 truncate text-[13px] font-medium text-fg-primary">{m.title}</div>
                <div className="mt-0.5 truncate text-[11.5px] text-fg-secondary">{m.riskReason}</div>
              </div>
              <ArrowUpRight size={15} className="shrink-0 text-fg-muted" strokeWidth={2} />
            </div>
          ))}
          {critical.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--status-live-bg)' }}><Check size={18} style={{ color: 'var(--success)' }} strokeWidth={2.5} /></div>
              <p className="text-[13px] font-medium text-fg-primary">No critical items</p>
              <p className="text-[12px] text-fg-muted">Nothing needs urgent action right now.</p>
            </div>
          )}
        </div>
      </section>

      {/* Right rail: queue health */}
      <div className="flex flex-col gap-3">
        <div className="rounded-xl border p-2" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <div className="px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Queue health</div>
          <div className="flex flex-col gap-1">
            {health.map((h) => {
              const Icon = h.icon;
              return (
                <button key={h.label} onClick={() => goTab(h.tab)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors" onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--surface-3)', color: h.fg }}><Icon size={15} strokeWidth={2} /></div>
                  <div className="min-w-0 flex-1"><div className="text-[12.5px] font-medium text-fg-primary">{h.label}</div><div className="text-[11px] text-fg-muted">{h.sub}</div></div>
                  <div className="font-mono text-[16px] font-semibold tabular-nums" style={{ color: h.value > 0 ? 'var(--fg-primary)' : 'var(--fg-muted)' }}>{h.value}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
