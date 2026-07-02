import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import Stepper from './Stepper';
import ContextRail from './ContextRail';
import { BUILDER_STEPS } from '../../data/validation';
import type { StepId } from '../../data/validation';
import { useCampaign } from '../../context/CampaignContext';
import { getType } from '../../data/campaigns';

export default function BuilderLayout({ step, children }: { step: StepId; children: ReactNode }) {
  const navigate = useNavigate();
  const { draft } = useCampaign();
  const type = draft.type ? getType(draft.type) : null;
  const idx = BUILDER_STEPS.findIndex((s) => s.id === step);
  const prev = idx > 0 ? BUILDER_STEPS[idx - 1] : null;
  const next = idx < BUILDER_STEPS.length - 1 ? BUILDER_STEPS[idx + 1] : null;
  const isReview = step === 'review';

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}>
        <div className="mx-auto w-full max-w-[1240px] px-8">
          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/create')}
                className="flex items-center gap-1.5 text-[13px] font-medium text-fg-secondary transition-colors hover:text-fg-primary"
              >
                <ArrowLeft size={15} strokeWidth={2} />
                Type
              </button>
              <span className="text-fg-muted">/</span>
              <h1 className="text-[15px] font-semibold tracking-tight">
                New {type ? type.name : ''} campaign
              </h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex h-7 w-7 items-center justify-center rounded-md text-fg-muted transition-colors hover:text-fg-primary"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
          <div className="py-4">
            <Stepper />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto flex w-full max-w-[1240px] flex-1 gap-6 px-8 py-6">
        <main className="min-w-0 flex-1">{children}</main>
        <ContextRail />
      </div>

      {/* Footer */}
      <footer
        className="sticky bottom-0 z-20 border-t"
        style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-8 py-3.5">
          <button
            onClick={() => prev && navigate(`/builder/${prev.id}`)}
            disabled={!prev}
            className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-[13px] font-medium transition-colors"
            style={prev ? { borderColor: 'var(--border-strong)', color: 'var(--fg-secondary)' } : { borderColor: 'var(--border-subtle)', color: 'var(--fg-muted)', cursor: 'not-allowed' }}
          >
            <ArrowLeft size={15} strokeWidth={2} />
            {prev ? prev.short : 'Back'}
          </button>

          <div className="flex items-center gap-3">
            <span className="text-[12px] text-fg-muted">
              Step {idx + 1} of {BUILDER_STEPS.length}
            </span>
            <button
              onClick={() => navigate('/')}
              className="rounded-md px-3 py-2 text-[13px] font-medium text-fg-secondary transition-colors hover:text-fg-primary"
            >
              Save draft
            </button>
            {!isReview && next && (
              <button
                onClick={() => navigate(`/builder/${next.id}`)}
                className="flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold transition-colors"
                style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
              >
                Continue
                <ArrowRight size={15} strokeWidth={2.25} />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
