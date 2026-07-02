import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Hammer, Check } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { getType } from '../data/campaigns';

const STEPS = [
  { id: 'setup', label: 'Basic setup + Brand scope' },
  { id: 'audience', label: 'Audience + Rules' },
  { id: 'rewards', label: 'Rewards + Fulfillment' },
  { id: 'budget', label: 'Budget + Compliance' },
  { id: 'review', label: 'Review + Launch' },
];

export default function BuilderPlaceholder() {
  const navigate = useNavigate();
  const { step } = useParams<{ step: string }>();
  const { draft } = useCampaign();
  const type = draft.type ? getType(draft.type) : null;
  const current = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="mx-auto max-w-[720px] px-8 py-10">
      <button
        onClick={() => navigate('/create')}
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-secondary transition-colors hover:text-fg-primary"
      >
        <ArrowLeft size={15} strokeWidth={2} />
        Back to type picker
      </button>

      <div
        className="rounded-xl border p-8"
        style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-lg"
            style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
          >
            <Hammer size={20} strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold tracking-tight">Campaign builder</h1>
            <p className="text-[13px] text-fg-secondary">
              {type ? (
                <>
                  Building a <span className="font-medium text-fg-primary">{type.name}</span> campaign
                </>
              ) : (
                'No type selected yet'
              )}
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-1.5">
          {STEPS.map((s, i) => {
            const isCurrent = i === current;
            return (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-lg border px-3.5 py-3"
                style={{
                  borderColor: isCurrent ? 'var(--accent-border)' : 'var(--border-subtle)',
                  background: isCurrent ? 'var(--accent-bg)' : 'transparent',
                }}
              >
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold"
                  style={{
                    background: isCurrent ? 'var(--accent)' : 'var(--surface-3)',
                    color: isCurrent ? 'var(--accent-fg)' : 'var(--fg-muted)',
                  }}
                >
                  {i + 1}
                </div>
                <span
                  className="text-[13.5px] font-medium"
                  style={{ color: isCurrent ? 'var(--fg-primary)' : 'var(--fg-secondary)' }}
                >
                  {s.label}
                </span>
                {isCurrent && (
                  <span className="ml-auto text-[11.5px] font-medium" style={{ color: 'var(--accent)' }}>
                    Building next
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div
          className="mt-6 flex items-start gap-2.5 rounded-lg border px-4 py-3"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}
        >
          <Check size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} strokeWidth={2.25} />
          <p className="text-[12.5px] leading-relaxed text-fg-secondary">
            The design language is set. These builder steps — including the persistent campaign-context
            rail, the Mission rules example, fulfillment health, and the blockers-vs-warnings compliance
            view — are the next build phase.
          </p>
        </div>
      </div>
    </div>
  );
}
