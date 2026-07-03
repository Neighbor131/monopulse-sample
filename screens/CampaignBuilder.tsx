import { useEffect } from 'react';
import type { ReactElement } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BuilderLayout from '../components/builder/BuilderLayout';
import { BUILDER_STEPS } from '../data/validation';
import type { StepId } from '../data/validation';
import { useCampaign } from '../context/CampaignContext';
import StepSetup from './builder/StepSetup';
import StepAudience from './builder/StepAudience';
import StepRewards from './builder/StepRewards';
import StepBudget from './builder/StepBudget';
import StepReview from './builder/StepReview';

export default function CampaignBuilder() {
  const { step } = useParams<{ step: string }>();
  const { draft } = useCampaign();
  const navigate = useNavigate();

  useEffect(() => {
    if (!draft.type) navigate('/create');
  }, [draft.type, navigate]);

  const stepId = (BUILDER_STEPS.find((s) => s.id === step)?.id ?? 'setup') as StepId;

  const content: Record<StepId, ReactElement> = {
    setup: <StepSetup />,
    audience: <StepAudience />,
    rewards: <StepRewards />,
    budget: <StepBudget />,
    review: <StepReview />,
  };

  return <BuilderLayout step={stepId}>{content[stepId]}</BuilderLayout>;
}
