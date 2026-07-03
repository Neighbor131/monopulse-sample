import { AlertTriangle, Database, RefreshCw, SearchX, WifiOff } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export type DemoState = 'empty' | 'loading' | 'error' | null;

export function useDemoState(): DemoState {
  const [params] = useSearchParams();
  const state = params.get('state');
  if (state === 'empty' || state === 'loading' || state === 'error') return state;
  return null;
}

export function StateCard({
  state,
  title,
  detail,
  actionLabel = 'Retry',
  onAction,
  icon,
}: {
  state: Exclude<DemoState, null> | 'not-found';
  title: string;
  detail: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}) {
  const Icon = icon ?? iconFor(state);
  const danger = state === 'error' || state === 'not-found';
  return (
    <div
      className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border px-8 py-14 text-center"
      style={{ borderColor: danger ? 'rgba(240,87,107,0.28)' : 'var(--border-subtle)', background: 'var(--surface-1)' }}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-lg"
        style={{ background: danger ? 'var(--danger-bg)' : 'var(--surface-3)', color: danger ? 'var(--danger)' : 'var(--accent)' }}
      >
        <Icon size={21} strokeWidth={1.9} />
      </div>
      <h2 className="mt-4 text-[15px] font-semibold text-fg-primary">{title}</h2>
      <p className="mt-1 max-w-[520px] text-[13px] leading-5 text-fg-secondary">{detail}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-[13px] font-semibold"
          style={{ background: danger ? 'var(--danger-bg)' : 'var(--accent-bg)', color: danger ? 'var(--danger)' : 'var(--accent)' }}
        >
          <RefreshCw size={14} strokeWidth={2} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function LoadingBlock({ title = 'Loading workspace', rows = 5 }: { title?: string; rows?: number }) {
  return (
    <div className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="h-3 w-40 animate-pulse rounded" style={{ background: 'var(--surface-3)' }} />
        <div className="mt-2 h-2.5 w-72 animate-pulse rounded" style={{ background: 'var(--surface-2)' }} />
        <span className="sr-only">{title}</span>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-[minmax(220px,1fr)_140px_140px_100px] items-center gap-4 px-5 py-4">
            <SkeletonLine width="70%" />
            <SkeletonLine width="56%" />
            <SkeletonLine width="62%" />
            <SkeletonLine width="44%" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border px-4 py-3.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <SkeletonLine width="52%" />
          <div className="mt-4"><SkeletonLine width="38%" height={22} /></div>
          <div className="mt-3"><SkeletonLine width="78%" /></div>
        </div>
      ))}
    </div>
  );
}

export function DemoStateHint({ area }: { area: string }) {
  return (
    <div className="mt-3 text-[11.5px] text-fg-muted">
      Demo states: add <span className="font-mono text-fg-secondary">?state=loading</span>, <span className="font-mono text-fg-secondary">?state=empty</span> or <span className="font-mono text-fg-secondary">?state=error</span> to preview {area}.
    </div>
  );
}

function SkeletonLine({ width, height = 10 }: { width: string; height?: number }) {
  return <div className="animate-pulse rounded" style={{ width, height, background: 'var(--surface-3)' }} />;
}

function iconFor(state: Exclude<DemoState, null> | 'not-found'): LucideIcon {
  if (state === 'empty') return SearchX;
  if (state === 'loading') return Database;
  if (state === 'not-found') return AlertTriangle;
  return WifiOff;
}
