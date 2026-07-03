import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  AlertTriangle,
  MoreHorizontal,
  Copy,
  Pause,
  Play,
  BarChart3,
  ScrollText,
  ArrowUpDown,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { DemoStateHint, LoadingBlock, StateCard, useDemoState } from '../components/StateViews';
import {
  CAMPAIGNS,
  BRANDS,
  getType,
  fmtMoney,
  fmtNum,
  initials,
} from '../data/campaigns';
import type { Campaign, CampaignStatus } from '../data/campaigns';
import type { MouseEvent, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type MenuState = { id: string; x: number; y: number } | null;

const STATUS_FILTERS: { id: CampaignStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'pending', label: 'Pending' },
  { id: 'paused', label: 'Paused' },
  { id: 'draft', label: 'Draft' },
  { id: 'completed', label: 'Completed' },
  { id: 'failed', label: 'Failed' },
];

function brandName(code: string): string {
  return BRANDS.find((b) => b.code === code)?.name ?? code;
}

function budgetColor(ratio: number): string {
  if (ratio >= 0.9) return 'var(--danger)';
  if (ratio >= 0.7) return 'var(--warning)';
  return 'var(--accent)';
}

export default function CampaignsList() {
  const navigate = useNavigate();
  const demoState = useDemoState();
  const [filter, setFilter] = useState<CampaignStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<MenuState>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: CAMPAIGNS.length };
    for (const cam of CAMPAIGNS) c[cam.status] = (c[cam.status] ?? 0) + 1;
    return c;
  }, []);

  const attention = useMemo(
    () => CAMPAIGNS.filter((c) => c.risk === 'blocked' || c.status === 'failed'),
    []
  );

  const rows = useMemo(() => {
    if (demoState === 'empty') return [];
    return CAMPAIGNS.filter((c) => {
      if (filter !== 'all' && c.status !== filter) return false;
      if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [demoState, filter, query]);

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-7">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Campaigns</h1>
          <p className="mt-1 text-[13px] text-fg-secondary">
            Gamified campaigns across all {BRANDS.length} brands · real-time reward orchestration
          </p>
        </div>
        <button
          onClick={() => navigate('/create')}
          className="flex items-center gap-2 rounded-md px-3.5 py-2 text-[13px] font-semibold transition-colors"
          style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
        >
          <Plus size={16} strokeWidth={2.25} />
          Create campaign
        </button>
      </div>

      {/* Attention strip */}
      {attention.length > 0 && (
        <div
          className="mt-5 flex items-center gap-3 rounded-lg border px-4 py-3"
          style={{ borderColor: 'rgba(240,87,107,0.3)', background: 'var(--danger-bg)' }}
        >
          <AlertTriangle size={16} style={{ color: 'var(--danger)' }} strokeWidth={2} />
          <span className="text-[13px] font-medium" style={{ color: 'var(--fg-primary)' }}>
            {attention.length} campaigns need attention
          </span>
          <span className="text-[13px]" style={{ color: 'var(--fg-secondary)' }}>
            {attention.map((c) => c.name).join(' · ')}
          </span>
          <button
            onClick={() => setFilter('failed')}
            className="ml-auto text-[12px] font-medium"
            style={{ color: 'var(--danger)' }}
          >
            Review →
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border p-1" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          {STATUS_FILTERS.map((f) => {
            const active = filter === f.id;
            const count = counts[f.id] ?? 0;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors"
                style={
                  active
                    ? { background: 'var(--surface-3)', color: 'var(--fg-primary)' }
                    : { color: 'var(--fg-secondary)' }
                }
              >
                {f.label}
                <span
                  className="rounded px-1 text-[10px] font-semibold tabular-nums"
                  style={{
                    background: active ? 'var(--accent-bg)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--fg-muted)',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="flex items-center gap-2 rounded-md border px-3 py-2"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)', width: 240 }}
        >
          <Search size={15} className="text-fg-muted" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="w-full bg-transparent text-[13px] outline-none"
          />
        </div>
      </div>

      {demoState === 'error' && (
        <div className="mt-4">
          <StateCard
            state="error"
            title="Campaigns could not be loaded"
            detail="The operator can still see the shell, but the campaign portfolio should explain the failed data source and offer a retry path."
            onAction={() => navigate('/')}
          />
          <DemoStateHint area="campaign portfolio states" />
        </div>
      )}

      {demoState === 'loading' && (
        <div className="mt-4">
          <LoadingBlock title="Loading campaigns" rows={6} />
          <DemoStateHint area="campaign portfolio states" />
        </div>
      )}

      {/* Table */}
      {demoState !== 'error' && demoState !== 'loading' && <div
        className="mt-4 overflow-hidden rounded-xl border"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-left">
            <thead>
              <tr
                className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <Th className="pl-5">
                  <span className="inline-flex items-center gap-1">
                    Campaign <ArrowUpDown size={11} />
                  </span>
                </Th>
                <Th>Status</Th>
                <Th>Brands</Th>
                <Th className="text-right">Audience</Th>
                <Th>Budget used</Th>
                <Th className="text-right">Reward cost</Th>
                <Th>Owner</Th>
                <Th>Risk</Th>
                <Th className="pr-5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <Row
                  key={c.id}
                  c={c}
                  menuOpen={openMenu?.id === c.id}
                  onToggleMenu={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    setOpenMenu((prev) => (prev?.id === c.id ? null : { id: c.id, x: rect.right - 192, y: rect.bottom + 6 }));
                  }}
                  onOpen={() => navigate(`/campaigns/${c.id}`)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <p className="text-[14px] font-medium text-fg-secondary">No campaigns match this filter</p>
            <button onClick={() => { setFilter('all'); setQuery(''); }} className="text-[12px]" style={{ color: 'var(--accent)' }}>
              Clear filters
            </button>
          </div>
        )}
      </div>}

      {/* Click-away for menus */}
      {openMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
          <div
            className="fixed z-50 w-48 overflow-hidden rounded-lg border py-1 text-left"
            style={{
              left: Math.max(12, openMenu.x),
              top: openMenu.y,
              background: 'var(--surface-2)',
              borderColor: 'var(--border-strong)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <MenuItem icon={Copy} label="Duplicate" onClick={() => setOpenMenu(null)} />
            <MenuItem icon={Pause} label="Pause campaign" onClick={() => setOpenMenu(null)} />
            <MenuItem icon={Play} label="Resume campaign" onClick={() => setOpenMenu(null)} />
            <MenuItem icon={BarChart3} label="View performance" onClick={() => setOpenMenu(null)} />
            <MenuItem icon={ScrollText} label="View audit log" onClick={() => setOpenMenu(null)} />
          </div>
        </>
      )}

      {demoState !== 'error' && demoState !== 'loading' && <div className="mt-3 text-[12px] text-fg-muted">
        Showing {rows.length} of {CAMPAIGNS.length} campaigns
      </div>}
      {demoState !== 'error' && demoState !== 'loading' && <DemoStateHint area="campaign portfolio states" />}
    </div>
  );
}

function Th({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <th className={`px-3 py-2.5 font-semibold ${className}`}>{children}</th>;
}

function Row({
  c,
  menuOpen,
  onToggleMenu,
  onOpen,
}: {
  c: Campaign;
  menuOpen: boolean;
  onToggleMenu: (event: MouseEvent<HTMLButtonElement>) => void;
  onOpen: () => void;
}) {
  const type = getType(c.type);
  const TypeIcon = type.icon;
  const ratio = c.budgetTotal > 0 ? c.budgetUsed / c.budgetTotal : 0;
  return (
    <tr
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(); }}
      className="align-middle transition-colors"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Campaign */}
      <td className="py-3 pl-5 pr-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}
          >
            <TypeIcon size={17} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-medium text-fg-primary">{c.name}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-fg-muted">
              <span>{type.name}</span>
              <span>·</span>
              <span className="font-mono">{c.id}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-3 py-3">
        <StatusBadge status={c.status} />
      </td>

      {/* Brands */}
      <td className="px-3 py-3">
        {c.brandScope === 'network' ? (
          <span
            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11.5px] font-medium"
            style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
          >
            Network · {c.brands.length}
          </span>
        ) : (
          <div className="flex items-center gap-1">
            {c.brands.slice(0, 2).map((b) => (
              <span
                key={b}
                className="inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[11px] font-medium"
                style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}
                title={brandName(b)}
              >
                {b}
              </span>
            ))}
            {c.brands.length > 2 && (
              <span className="text-[11px] text-fg-muted">+{c.brands.length - 2}</span>
            )}
          </div>
        )}
      </td>

      {/* Audience */}
      <td className="px-3 py-3 text-right">
        <span className="font-mono text-[13px] text-fg-primary tabular-nums">
          {c.audienceSize > 0 ? fmtNum(c.audienceSize) : '—'}
        </span>
      </td>

      {/* Budget */}
      <td className="px-3 py-3" style={{ minWidth: 150 }}>
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[12px] text-fg-secondary tabular-nums">
              {fmtMoney(c.budgetUsed, c.currency)}
            </span>
            <span className="font-mono text-[11px] text-fg-muted tabular-nums">
              / {fmtMoney(c.budgetTotal, c.currency)}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: 'var(--surface-3)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.round(ratio * 100)}%`, background: budgetColor(ratio) }}
            />
          </div>
        </div>
      </td>

      {/* Reward cost */}
      <td className="px-3 py-3 text-right">
        <span className="font-mono text-[13px] text-fg-primary tabular-nums">
          {c.rewardCost > 0 ? fmtMoney(c.rewardCost, c.currency) : '—'}
        </span>
      </td>

      {/* Owner */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
            style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}
          >
            {initials(c.owner)}
          </div>
          <div className="text-[12.5px] text-fg-secondary">{c.owner.split(' ')[0]}</div>
        </div>
      </td>

      {/* Risk */}
      <td className="px-3 py-3">
        {c.risk === 'blocked' ? (
          <span className="inline-flex items-center gap-1 text-[12px] font-medium" style={{ color: 'var(--danger)' }} title={c.riskNote}>
            <AlertTriangle size={13} strokeWidth={2} /> Blocked
          </span>
        ) : c.risk === 'warning' ? (
          <span className="inline-flex items-center gap-1 text-[12px] font-medium" style={{ color: 'var(--warning)' }} title={c.riskNote}>
            <AlertTriangle size={13} strokeWidth={2} /> Warning
          </span>
        ) : (
          <span className="text-[12px] text-fg-muted">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="relative py-3 pl-3 pr-5 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMenu(e);
          }}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors"
          style={{ color: 'var(--fg-secondary)', background: menuOpen ? 'var(--surface-3)' : 'transparent' }}
        >
          <MoreHorizontal size={16} strokeWidth={2} />
        </button>
      </td>
    </tr>
  );
}

function MenuItem({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-fg-secondary transition-colors"
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--surface-3)';
        e.currentTarget.style.color = 'var(--fg-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--fg-secondary)';
      }}
    >
      <Icon size={14} strokeWidth={1.75} />
      {label}
    </button>
  );
}
