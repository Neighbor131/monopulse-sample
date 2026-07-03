import { Navigate, useParams } from 'react-router-dom';
import type { ReactElement } from 'react';
import ProgramBuilderLayout from '../components/loyalty/builder/ProgramBuilderLayout';
import StepSetup from './loyaltyBuilder/StepSetup';
import StepTiers from './loyaltyBuilder/StepTiers';
import StepBenefits from './loyaltyBuilder/StepBenefits';
import StepRules from './loyaltyBuilder/StepRules';
import StepReview from './loyaltyBuilder/StepReview';
import { PROGRAM_STEPS } from '../data/programDraft';
import type { ProgramStepId } from '../data/programDraft';

const STEP_CMP: Record<ProgramStepId, ReactElement> = {
  setup: <StepSetup />,
  tiers: <StepTiers />,
  benefits: <StepBenefits />,
  rules: <StepRules />,
  review: <StepReview />,
};

export default function ProgramBuilder() {
  const { step } = useParams<{ step: string }>();
  const valid = PROGRAM_STEPS.some((s) => s.id === step);
  if (!valid) return <Navigate to="/loyalty/builder/setup" replace />;
  const id = step as ProgramStepId;
  return <ProgramBuilderLayout step={id}>{STEP_CMP[id]}</ProgramBuilderLayout>;
}
