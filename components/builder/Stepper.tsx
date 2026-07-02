import { useNavigate, useParams } from 'react-router-dom';
import { Check, AlertTriangle } from 'lucide-react';
import { BUILDER_STEPS, stepStatus, blockerSteps } from '../../data/validation';
import { useCampaign } from '../../context/CampaignContext';

export default function Stepper() {
  const navigate = useNavigate();
  const { step } = useParams<{ step: string }>();
  const { draft } = useCampaign();
  const status = stepStatus(draft);
  const blocked = blockerSteps(draft);

  return (
    <div className="flex items-center">
      {BUILDER_STEPS.map((s, i) => {
        const current = s.id === step;
        const st = status[s.id];
        const hasBlock = blocked.has(s.id);
        const isLast = i === BUILDER_STEPS.length - 1;

        let circleStyle: React.CSSProperties = { background: 'var(--surface-3)', color: 'var(--fg-muted)' };
        if (current) circleStyle = { background: 'var(--accent)', color: 'var(--accent-fg)' };
        else if (hasBlock) circleStyle = { background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)' };
        else if (st === 'complete') circleStyle = { background: 'var(--accent-bg)', color: 'var(--accent)' };
        else if (st === 'partial') circleStyle = { background: 'var(--warning-bg)', color: 'var(--warning)' };

        return (
          <div key={s.id} className="flex items-center" style={{ flex: isLast ? '0 0 auto' : '1 1 0' }}>
            <button
              onClick={() => navigate(`/builder/${s.id}`)}
              className="flex items-center gap-2"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold" style={circleStyle}>
                {hasBlock && !current ? (
                  <AlertTriangle size={12} strokeWidth={2.5} />
                ) : st === 'complete' && !current ? (
                  <Check size={13} strokeWidth={3} />
                ) : (
                  i + 1
                )}
              </span>
              <span
                className="whitespace-nowrap text-[12.5px] font-medium"
                style={{ color: current ? 'var(--fg-primary)' : 'var(--fg-secondary)' }}
              >
                {s.short}
              </span>
            </button>
            {!isLast && (
              <div className="mx-3 h-px flex-1" style={{ background: 'var(--border-strong)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
