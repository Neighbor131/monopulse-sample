import {
  Activity,
  Buildings,
  Calendar,
  Category,
  Code,
  Diamonds,
  Gift,
  Profile2User,
  SecuritySafe,
  Setting2,
  SidebarLeft,
  SidebarRight,
  SliderHorizontal,
  StatusUp,
} from 'iconsax-react';
import type { Icon } from 'iconsax-react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useReviews } from '../context/ReviewsContext';
import BrandLogo from './BrandLogo';

interface NavItem {
  label: string;
  icon: Icon;
  path?: string;
  match?: string[];
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    label: 'Operate',
    items: [
      { label: 'Dashboard', icon: Category, path: '/dashboard', match: ['/dashboard'] },
      { label: 'Campaigns', icon: StatusUp, path: '/', match: ['/', '/create', '/builder'], badge: '4' },
      { label: 'Campaign Ops', icon: Calendar, path: '/ops', match: ['/ops'], badge: '5' },
      { label: 'Loyalty', icon: Diamonds, path: '/loyalty', match: ['/loyalty'] },
      { label: 'Rewards', icon: Gift, path: '/rewards', match: ['/rewards'] },
    ],
  },
  {
    label: 'Audience',
    items: [
      { label: 'Players', icon: Profile2User, path: '/players', match: ['/players'] },
      { label: 'Segments', icon: SliderHorizontal, path: '/segments', match: ['/segments'] },
    ],
  },
  {
    label: 'Control',
    items: [
      { label: 'Monitoring', icon: Activity, path: '/monitoring', match: ['/monitoring'], badge: '3' },
      { label: 'Risk & Compliance', icon: SecuritySafe, path: '/safety', match: ['/safety', '/approvals'] },
      { label: 'Brands & Org', icon: Buildings, path: '/org', match: ['/org'], badge: '1' },
      { label: 'Integrations', icon: Code, path: '/integrations', match: ['/integrations'], badge: '2' },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { counts } = useReviews();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('monopulse-sidebar') === 'collapsed';
  });

  useEffect(() => {
    window.localStorage.setItem('monopulse-sidebar', collapsed ? 'collapsed' : 'expanded');
  }, [collapsed]);

  const isActive = (item: NavItem) => {
    if (!item.match) return false;
    return item.match.some((m) => (m === '/' ? pathname === '/' : pathname.startsWith(m)));
  };

  return (
    <aside
      className={`flex shrink-0 flex-col border-r transition-[width] duration-200 ${collapsed ? 'w-16' : 'w-60'}`}
      style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
    >
      {/* Brand */}
      <div className={`relative flex h-14 items-center border-b ${collapsed ? 'justify-center px-2' : 'gap-2.5 px-5'}`} style={{ borderColor: 'var(--border-subtle)' }}>
        <BrandLogo showName={!collapsed} size={collapsed ? 'sm' : 'md'} />
        {!collapsed && (
          <span className="ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium text-fg-muted" style={{ background: 'var(--surface-3)' }}>
            BO
          </span>
        )}
        <button
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed((value) => !value)}
          className={`${collapsed ? '' : 'ml-1'} flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-[var(--surface-3)]`}
          style={{ color: 'var(--fg-secondary)' }}
        >
          {collapsed ? <SidebarRight size={15} variant="Linear" /> : <SidebarLeft size={15} variant="Linear" />}
        </button>
      </div>

      {/* Nav */}
      <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? 'px-2' : 'px-3'}`}>
        {SECTIONS.map((section) => (
          <div key={section.label} className={collapsed ? 'mb-3' : 'mb-5'}>
            <div className={`${collapsed ? 'sr-only' : 'px-2 pb-1.5'} text-[10px] font-semibold uppercase tracking-wider text-fg-muted`}>
              {section.label}
            </div>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                const badge = item.label === 'Risk & Compliance' ? String(counts.queue) : item.badge;
                return (
                  <button
                    key={item.label}
                    title={collapsed ? item.label : undefined}
                    onClick={() => item.path && navigate(item.path)}
                    className={`group relative flex items-center rounded-md text-[13px] font-medium transition-colors ${collapsed ? 'h-9 justify-center px-0' : 'gap-2.5 px-2 py-1.5'}`}
                    style={
                      active
                        ? { background: 'var(--accent-bg)', color: 'var(--accent)' }
                        : { color: 'var(--fg-secondary)' }
                    }
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.background = 'var(--surface-3)';
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Icon size={16} variant="Linear" />
                    {!collapsed && <span>{item.label}</span>}
                    {badge && badge !== '0' && (
                      <span
                        className={collapsed ? 'absolute right-1 top-1 h-2 w-2 rounded-full text-[0px]' : 'ml-auto rounded px-1.5 py-0.5 text-[10px] font-semibold'}
                        style={
                          active
                            ? { background: 'var(--accent)', color: 'var(--accent-fg)' }
                            : { background: 'var(--surface-3)', color: 'var(--fg-muted)' }
                        }
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`border-t py-3 ${collapsed ? 'px-2' : 'px-3'}`} style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          title={collapsed ? 'Settings' : undefined}
          onClick={() => navigate('/settings')}
          className={`flex w-full items-center rounded-md text-[13px] font-medium text-fg-secondary transition-colors ${collapsed ? 'h-9 justify-center px-0' : 'gap-2.5 px-2 py-1.5'}`}
          style={pathname.startsWith('/settings') ? { background: 'var(--accent-bg)', color: 'var(--accent)' } : undefined}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-3)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = pathname.startsWith('/settings') ? 'var(--accent-bg)' : 'transparent')}
        >
          <Setting2 size={16} variant="Linear" />
          {!collapsed && 'Settings'}
        </button>
      </div>
    </aside>
  );
}
