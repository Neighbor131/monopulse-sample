import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown2, Buildings, Moon, NotificationBing, SearchNormal, Sun1 } from 'iconsax-react';
import { Bell, Building2, CheckCircle2, LogOut, Search, Settings, ShieldAlert, UserRound, X } from 'lucide-react';
import Sidebar from './Sidebar';
import { BRANDS, CAMPAIGNS, getType, ORG } from '../data/campaigns';
import { PLAYERS } from '../data/players';
import { REWARDS } from '../data/rewards';
import { PROVIDERS } from '../data/integrations';
import { actionQueue } from '../data/dashboard';

type ThemeMode = 'dark' | 'light';
type OpenPanel = 'notifications' | 'account' | 'org' | null;

interface SearchItem {
  id: string;
  type: string;
  title: string;
  detail: string;
  href: string;
  tone?: 'default' | 'warning' | 'danger' | 'success';
}

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.localStorage.getItem('monopulse-theme') === 'light' ? 'light' : 'dark';
  });
  const [panel, setPanel] = useState<OpenPanel>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('monopulse-theme', theme);
  }, [theme]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === 'Escape') {
        setCommandOpen(false);
        setPanel(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const queue = useMemo(() => actionQueue(), []);
  const notifications = useMemo(() => [
    ...queue.slice(0, 5).map((item) => ({
      id: item.id,
      title: item.title,
      detail: item.detail,
      at: item.kind === 'approval' ? 'Due now' : 'Live',
      href: item.href,
      tone: item.severity === 'critical' ? 'danger' as const : 'warning' as const,
    })),
    ...PROVIDERS.filter((provider) => provider.status !== 'healthy').map((provider) => ({
      id: provider.id,
      title: `${provider.provider} ${provider.status}`,
      detail: provider.incident ?? `${provider.kind} integration needs review`,
      at: provider.lastSync,
      href: '/integrations',
      tone: provider.status === 'failing' ? 'danger' as const : 'warning' as const,
    })),
  ], [queue]);

  const searchItems = useMemo<SearchItem[]>(() => [
    ...CAMPAIGNS.map((campaign) => ({
      id: campaign.id,
      type: 'Campaign',
      title: campaign.name,
      detail: `${getType(campaign.type).name} · ${campaign.brands.join(', ')} · ${campaign.status}`,
      href: `/campaigns/${campaign.id}`,
      tone: campaign.risk === 'warning' ? 'warning' as const : 'default' as const,
    })),
    ...PLAYERS.map((player) => ({
      id: player.id,
      type: 'Player',
      title: player.alias,
      detail: `${player.id} · ${player.brand} · ${player.tier} · ${player.risk}`,
      href: `/players/${player.id}`,
      tone: player.risk === 'flagged' ? 'danger' as const : player.risk === 'watch' ? 'warning' as const : 'default' as const,
    })),
    ...REWARDS.map((reward) => ({
      id: reward.id,
      type: 'Reward',
      title: reward.name,
      detail: `${reward.brand} · ${reward.provider} · ${reward.health}`,
      href: `/rewards/${reward.id}`,
      tone: reward.health === 'failing' ? 'danger' as const : reward.health === 'warning' ? 'warning' as const : 'default' as const,
    })),
    ...queue.map((item) => ({
      id: item.id,
      type: 'Queue',
      title: item.title,
      detail: `${item.kind} · ${item.detail}`,
      href: item.href,
      tone: item.severity === 'critical' ? 'danger' as const : 'warning' as const,
    })),
    ...PROVIDERS.map((provider) => ({
      id: provider.id,
      type: 'Integration',
      title: provider.provider,
      detail: `${provider.brand} · ${provider.kind} · ${provider.status}`,
      href: '/integrations',
      tone: provider.status === 'failing' ? 'danger' as const : provider.status === 'degraded' ? 'warning' as const : 'success' as const,
    })),
  ], [queue]);

  const filteredItems = searchItems.filter((item) => {
    const haystack = `${item.type} ${item.title} ${item.detail} ${item.id}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  }).slice(0, 9);

  const go = (href: string) => {
    navigate(href);
    setPanel(null);
    setCommandOpen(false);
    setQuery('');
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header
          className="flex h-14 shrink-0 items-center gap-4 border-b px-6"
          style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
        >
          {/* Org / brand switcher */}
          <button
            onClick={() => setPanel(panel === 'org' ? null : 'org')}
            className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[13px] font-medium transition-colors"
            style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}
          >
            <Buildings size={15} variant="Linear" color="var(--accent)" />
            <span>{ORG}</span>
            <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-fg-muted" style={{ background: 'var(--surface-3)' }}>
              6 brands
            </span>
            <ArrowDown2 size={14} variant="Linear" color="var(--fg-muted)" />
          </button>

          {/* Search */}
          <button
            onClick={() => setCommandOpen(true)}
            className="flex flex-1 items-center gap-2 rounded-md border px-3 py-1.5 text-left"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)', maxWidth: 380 }}
          >
            <SearchNormal size={15} variant="Linear" color="var(--fg-muted)" />
            <span className="w-full text-[13px] text-fg-muted">Search campaigns, players, rewards…</span>
            <kbd className="rounded px-1.5 py-0.5 text-[10px] text-fg-muted" style={{ background: 'var(--surface-3)' }}>
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              aria-label={`Switch to ${nextTheme} mode`}
              title={`Switch to ${nextTheme} mode`}
              onClick={() => setTheme(nextTheme)}
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-[var(--surface-3)]"
              style={{ background: 'var(--surface-2)' }}
            >
              {theme === 'dark' ? (
                <Sun1 size={16} variant="Linear" color="var(--fg-secondary)" />
              ) : (
                <Moon size={16} variant="Linear" color="var(--fg-secondary)" />
              )}
            </button>
            <button
              onClick={() => setPanel(panel === 'notifications' ? null : 'notifications')}
              className="relative flex h-8 w-8 items-center justify-center rounded-md transition-colors"
              style={{ background: 'var(--surface-2)' }}
            >
              <NotificationBing size={16} variant="Linear" color="var(--fg-secondary)" />
              <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[8px] font-bold" style={{ background: 'var(--danger)', color: '#fff' }}>{notifications.length}</span>
            </button>
            <button onClick={() => setPanel(panel === 'account' ? null : 'account')} className="flex items-center gap-2 rounded-md px-1 py-0.5 hover:bg-[var(--surface-2)]">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
              >
                MO
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {panel && <button aria-label="Close panel" className="fixed inset-0 z-30 cursor-default" onClick={() => setPanel(null)} />}
      {panel === 'notifications' && <NotificationsPanel items={notifications} onOpen={go} />}
      {panel === 'account' && <AccountPanel theme={theme} setTheme={setTheme} onOpen={go} />}
      {panel === 'org' && <OrgPanel onOpen={go} />}
      {commandOpen && (
        <CommandPalette
          query={query}
          setQuery={setQuery}
          items={filteredItems}
          onClose={() => setCommandOpen(false)}
          onOpen={go}
        />
      )}
    </div>
  );
}

function NotificationsPanel({ items, onOpen }: { items: { id: string; title: string; detail: string; at: string; href: string; tone: 'warning' | 'danger' }[]; onOpen: (href: string) => void }) {
  return (
    <aside className="fixed right-12 top-12 z-40 w-[380px] overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-1)', boxShadow: 'var(--shadow-lg)' }}>
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="text-[14px] font-semibold text-fg-primary">Notification center</div>
          <div className="text-[11.5px] text-fg-muted">{items.length} operational alerts</div>
        </div>
        <Bell size={16} className="text-fg-muted" />
      </div>
      <div className="max-h-[460px] overflow-y-auto p-2">
        {items.map((item) => (
          <button key={item.id} onClick={() => onOpen(item.href)} className="flex w-full gap-3 rounded-lg px-3 py-3 text-left hover:bg-[var(--surface-2)]">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: item.tone === 'danger' ? 'var(--danger)' : 'var(--warning)' }} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-fg-primary">{item.title}</span>
              <span className="mt-0.5 block text-[12px] leading-relaxed text-fg-secondary">{item.detail}</span>
              <span className="mt-1 block text-[11px] text-fg-muted">{item.at}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="border-t p-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <button onClick={() => onOpen('/dashboard')} className="w-full rounded-md px-3 py-2 text-[12.5px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>Open operations dashboard</button>
      </div>
    </aside>
  );
}

function AccountPanel({ theme, setTheme, onOpen }: { theme: ThemeMode; setTheme: (theme: ThemeMode) => void; onOpen: (href: string) => void }) {
  return (
    <aside className="fixed right-4 top-12 z-40 w-[300px] overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-1)', boxShadow: 'var(--shadow-lg)' }}>
      <div className="border-b p-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-semibold" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>MO</div>
          <div>
            <div className="text-[13px] font-semibold text-fg-primary">Mara Ostheim</div>
            <div className="text-[11.5px] text-fg-muted">CRM / Retention Manager</div>
          </div>
        </div>
        <div className="mt-3 rounded-lg border p-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Active scope</div>
          <div className="mt-1 text-[12.5px] font-medium text-fg-primary">{ORG}</div>
          <div className="mt-0.5 text-[11.5px] text-fg-secondary">6 brands · production</div>
        </div>
      </div>
      <div className="p-2">
        <MenuRow icon={UserRound} label="Profile and access" detail="Role, brands, permissions" onClick={() => onOpen('/settings')} />
        <MenuRow icon={Building2} label="Brands & org" detail="Switch or inspect restrictions" onClick={() => onOpen('/org')} />
        <MenuRow icon={Settings} label="Settings" detail="Audit, theme, account defaults" onClick={() => onOpen('/settings')} />
        <MenuRow icon={theme === 'dark' ? Sun1Wrapper : MoonWrapper} label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} detail="Preview both operator modes" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
      </div>
      <div className="border-t p-2" style={{ borderColor: 'var(--border-subtle)' }}>
        <MenuRow icon={LogOut} label="Log out" detail="Return to sign in" onClick={() => onOpen('/login')} danger />
      </div>
    </aside>
  );
}

function OrgPanel({ onOpen }: { onOpen: (href: string) => void }) {
  return (
    <aside className="fixed left-[260px] top-12 z-40 w-[360px] overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-1)', boxShadow: 'var(--shadow-lg)' }}>
      <div className="border-b px-4 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="text-[14px] font-semibold text-fg-primary">{ORG}</div>
        <div className="text-[11.5px] text-fg-muted">Organization-level access with brand-scoped campaign setup.</div>
      </div>
      <div className="p-2">
        {BRANDS.map((brand) => (
          <button key={brand.code} onClick={() => onOpen('/org')} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-[var(--surface-2)]">
            <span>
              <span className="block text-[13px] font-semibold text-fg-primary">{brand.name}</span>
              <span className="block text-[11.5px] text-fg-muted">{brand.code} · production · ready</span>
            </span>
            <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
          </button>
        ))}
      </div>
      <div className="border-t p-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <button onClick={() => onOpen('/org')} className="w-full rounded-md px-3 py-2 text-[12.5px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>Manage brand restrictions</button>
      </div>
    </aside>
  );
}

function CommandPalette({ query, setQuery, items, onClose, onOpen }: { query: string; setQuery: (value: string) => void; items: SearchItem[]; onClose: () => void; onOpen: (href: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]" style={{ background: 'var(--overlay-scrim)' }}>
      <div className="w-full max-w-[720px] overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-1)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <Search size={17} className="text-fg-muted" />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search campaigns, players, rewards, integrations..." className="flex-1 bg-transparent text-[14px] text-fg-primary outline-none" />
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[var(--surface-2)]"><X size={15} /></button>
        </div>
        <div className="max-h-[480px] overflow-y-auto p-2">
          {items.map((item) => (
            <button key={`${item.type}-${item.id}`} onClick={() => onOpen(item.href)} className="grid w-full grid-cols-[90px_1fr_auto] items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-[var(--surface-2)]">
              <span className="rounded-md px-2 py-1 text-center text-[10.5px] font-semibold uppercase tracking-wide" style={{ background: 'var(--surface-3)', color: toneColor(item.tone) }}>{item.type}</span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold text-fg-primary">{item.title}</span>
                <span className="block truncate text-[11.5px] text-fg-muted">{item.detail}</span>
              </span>
              <span className="font-mono text-[11px] text-fg-muted">{item.id}</span>
            </button>
          ))}
          {!items.length && <div className="px-4 py-8 text-center text-[13px] text-fg-muted">No matching objects.</div>}
        </div>
      </div>
    </div>
  );
}

function MenuRow({ icon: Icon, label, detail, onClick, danger }: { icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>; label: string; detail: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-[var(--surface-2)]">
      <Icon size={16} style={{ color: danger ? 'var(--danger)' : 'var(--fg-muted)' }} />
      <span>
        <span className="block text-[13px] font-semibold" style={{ color: danger ? 'var(--danger)' : 'var(--fg-primary)' }}>{label}</span>
        <span className="block text-[11.5px] text-fg-muted">{detail}</span>
      </span>
    </button>
  );
}

function Sun1Wrapper({ size, style }: { size?: number; style?: React.CSSProperties }) {
  return <Sun1 size={size} variant="Linear" color={style?.color ?? 'var(--fg-muted)'} />;
}

function MoonWrapper({ size, style }: { size?: number; style?: React.CSSProperties }) {
  return <Moon size={size} variant="Linear" color={style?.color ?? 'var(--fg-muted)'} />;
}

function toneColor(tone: SearchItem['tone']) {
  if (tone === 'danger') return 'var(--danger)';
  if (tone === 'warning') return 'var(--warning)';
  if (tone === 'success') return 'var(--success)';
  return 'var(--fg-secondary)';
}
