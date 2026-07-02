import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, X, Check, Layers, Building2, Percent, Users } from 'lucide-react';
import { useProgram } from '../../../context/ProgramContext';
import { PROGRAM_STEPS, stepStatus, monthlyLiability, totalProjectedPlayers, CASHBACK_MODEL_META } from '../../../data/programDraft';
import type { ProgramStepId } from '../../../data/programDraft';

const fmt = (n: number) => '€' + Math.round(n).toLocaleString();

export default function ProgramBuilderLayout({ step, children }: { step: ProgramStepId; children: ReactNode }) {
  const navigate = useNavigate();
  const { draft } = useProgram();
  const status = stepStatus(draft);
  const idx = PROGRAM_STEPS.findIndex((s) => s.id === step);
  const prev = idx > 0 ? PROGRAM_STEPS[idx - 1] : null;
  const next = idx < PROGRAM_STEPS.length - 1 ? PROGRAM_STEPS[idx + 1] : null;
  const isReview = step === 'review';
  const liab = monthlyLiability(draft);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 border-b" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}>
        <div className="mx-auto w-full max-w-[1240px] px-8">
          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/loyalty')} className="flex items-center gap-1.5 text-[13px] font-medium text-fg-secondary transition-colors hover:text-fg-primary">
                <ArrowLeft size={15} strokeWidth={2} /> Loyalty
              </button>
              <span className="text-fg-muted">/</span>
              <h1 className="text-[15px] font-semibold tracking-tight">{draft.id ? `Edit — ${draft.name || 'program'}` : `New status program${draft.name ? ` — ${draft.name}` : ''}`}</h1>
            </div>
            <button onClick={() => navigate('/loyalty')} className="flex h-7 w-7 items-center justify-center rounded-md text-fg-muted transition-colors hover:text-fg-primary">
              <X size={16} strokeWidth={2} />
            </button>
          </div>
          <div className="flex items-center py-4">
            {PROGRAM_STEPS.map((s, i) => {
              const current = s.id === step;
              const st = status[s.id];
              const isLast = i === PROGRAM_STEPS.length - 1;
              let cs: React.CSSProperties = { background: 'var(--surface-3)', color: 'var(--fg-muted)' };
              if (current) cs = { background: 'var(--accent)', color: 'var(--accent-fg)' };
              else if (st === 'complete') cs = { background: 'var(--accent-bg)', color: 'var(--accent)' };
              else if (st === 'partial') cs = { background: 'var(--warning-bg)', color: 'var(--warning)' };
              return (
                <div key={s.id} className="flex items-center" style={{ flex: isLast ? '0 0 auto' : '1 1 0' }}>
                  <button onClick={() => navigate(`/loyalty/builder/${s.id}`)} className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold" style={cs}>
                      {st === 'complete' && !current ? <Check size={13} strokeWidth={3} /> : i + 1}
                    </span>
                    <span className="whitespace-nowrap text-[12.5px] font-medium" style={{ color: current ? 'var(--fg-primary)' : 'var(--fg-secondary)' }}>{s.short}</span>
                  </button>
                  {!isLast && <div className="mx-3 h-px flex-1" style={{ background: 'var(--border-strong)' }} />}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1240px] flex-1 gap-6 px-8 py-6">
        <main className="min-w-0 flex-1">{children}</main>
        {/* summary rail */}
        <aside className="hidden w-[248px] shrink-0 lg:block">
          <div className="sticky top-[132px] rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
            <div className="border-b px-4 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="text-[13px] font-semibold text-fg-primary">{draft.name || 'Untitled program'}</div>
              <div className="mt-0.5 text-[11.5px] text-fg-muted">{draft.owner}</div>
            </div>
            <div className="flex flex-col gap-3 p-4">
              <RailRow icon={Building2} label="Scope" value={draft.brandScope === 'network' ? `Network · ${draft.brands.length}` : `${draft.brands.length} brand${draft.brands.length === 1 ? '' : 's'}`} />
              <RailRow icon={Layers} label="Tiers" value={`${draft.tiers.length} tiers`} />
              <RailRow icon={Percent} label="Model" value={CASHBACK_MODEL_META[draft.cashback.model].short} />
              <RailRow icon={Users} label="Players" value={totalProjectedPlayers(draft).toLocaleString()} />
            </div>
            <div className="border-t px-4 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="text-[10.5px] uppercase tracking-wider text-fg-muted">Monthly liability</div>
              <div className="mt-0.5 font-mono text-[16px] font-semibold tabular-nums" style={{ color: liab >= 250000 ? 'var(--danger)' : 'var(--fg-primary)' }}>{fmt(liab)}</div>
            </div>
          </div>
        </aside>
      </div>

      <footer className="sticky bottom-0 z-20 border-t" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}>
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-8 py-3.5">
          <button
            onClick={() => prev && navigate(`/loyalty/builder/${prev.id}`)}
            disabled={!prev}
            className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-[13px] font-medium transition-colors"
            style={prev ? { borderColor: 'var(--border-strong)', color: 'var(--fg-secondary)' } : { borderColor: 'var(--border-subtle)', color: 'var(--fg-muted)', cursor: 'not-allowed' }}
          >
            <ArrowLeft size={15} strokeWidth={2} /> {prev ? prev.short : 'Back'}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-fg-muted">Step {idx + 1} of {PROGRAM_STEPS.length}</span>
            <button onClick={() => navigate('/loyalty')} className="rounded-md px-3 py-2 text-[13px] font-medium text-fg-secondary transition-colors hover:text-fg-primary">Save draft</button>
            {!isReview && next && (
              <button onClick={() => navigate(`/loyalty/builder/${next.id}`)} className="flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold transition-colors" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                Continue <ArrowRight size={15} strokeWidth={2.25} />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function RailRow({ icon: Icon, label, value }: { icon: typeof Layers; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={14} className="text-fg-muted" strokeWidth={1.75} />
      <span className="text-[12px] text-fg-secondary">{label}</span>
      <span className="ml-auto text-[12px] font-medium text-fg-primary">{value}</span>
    </div>
  );
}
