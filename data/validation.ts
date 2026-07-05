import type { DraftCampaign, Rule, UserRole } from '../context/CampaignContext';

import { TIER_NAMES } from './loyalty';

export type StepId = 'setup' | 'audience' | 'logic' | 'rewards' | 'budget' | 'review';
export type FieldStatus = 'empty' | 'partial' | 'complete';

export interface StepMeta {
  id: StepId;
  label: string;
  short: string;
}

export const BUILDER_STEPS: StepMeta[] = [
  { id: 'setup', label: 'Basic setup + Brand scope', short: 'Setup' },
  { id: 'audience', label: 'Audience Scope', short: 'Audience' },
  { id: 'logic', label: 'Mission Logic', short: 'Logic' },
  { id: 'rewards', label: 'Outcome + Rewards', short: 'Outcome' },
  { id: 'budget', label: 'Budget + Safety', short: 'Safety' },
  { id: 'review', label: 'Review + Launch', short: 'Review' },
];

// ── Roles ────────────────────────────────────────────────────
export const ROLES: { id: UserRole; label: string; desc: string; canNetwork: boolean }[] = [
  { id: 'ORG_ADMIN', label: 'Org Admin', desc: 'Full organization access — can create network-wide campaigns', canNetwork: true },
  { id: 'BRAND_ADMIN', label: 'Brand Admin', desc: 'Manages a single brand — brand-only campaigns', canNetwork: false },
  { id: 'BRAND_OPERATOR', label: 'Brand Operator', desc: 'Day-to-day operator — brand-only campaigns', canNetwork: false },
];

export function canCreateNetwork(role: UserRole): boolean {
  return role === 'ORG_ADMIN';
}

// ── Option catalogs ──────────────────────────────────────────
export const SEGMENTS = ['New depositors', 'Reactivated', 'High rollers', 'Weekend players', 'Sports crossovers', 'Dormant 30d'];
export const TIERS = TIER_NAMES; // shared loyalty ladder — Campaigns target the same tiers loyalty programs define
export const COUNTRIES = ['Ireland', 'Canada', 'Germany', 'Finland', 'New Zealand', 'Ontario (CA)'];
export const OWNERS = ['Mara Ostheim', 'Dan Whitlock', 'Priya Nair', 'Tomas Reuter'];
export const TIMEZONES = ['UTC+00:00 — London', 'UTC+01:00 — Malta', 'UTC-05:00 — Toronto', 'UTC+02:00 — Helsinki'];
export const REWARD_TYPES = ['Bonus funds', 'Free spins', 'Free bet', 'Token currency', 'Cash'];
export const CURRENCIES = ['EUR', 'USD', 'CAD'];
export const EXPIRIES = ['24 hours', '72 hours', '7 days', '30 days', 'No expiry'];
export const FREQUENCIES = ['Once per campaign', 'Once per day', 'Unlimited'];

// ── WHEN / IF / THEN rule catalogs ───────────────────────────
export const RULE_EVENTS = [
  'Bet placed',
  'Bet settled',
  'Win',
  'Deposit made',
  'Game round completed',
  'Login',
  'Sports bet placed',
  'Sports event settled',
];

export const CONDITION_FIELDS = [
  'Game category',
  'Game studio',
  'Bet amount',
  'Win multiplier',
  'Player tier',
  'Country',
  'Deposit amount',
  'Sport',
];

export const CONDITION_OPS = ['is', 'is not', 'at least', 'at most', 'between'];

export const RULE_ACTIONS = [
  'Add progress',
  'Grant reward',
  'Add raffle tickets',
  'Award XP',
  'Add leaderboard points',
  'Trigger prize drop',
];

// value units for the THEN action
export function actionUnit(action: string): string {
  switch (action) {
    case 'Grant reward': return '€';
    case 'Add raffle tickets': return 'tickets';
    case 'Award XP': return 'XP';
    case 'Add leaderboard points': return 'pts';
    case 'Add progress': return 'progress';
    default: return '';
  }
}

// ── Fulfillment ──────────────────────────────────────────────
export type Health = 'connected' | 'degraded' | 'error';

export interface FulfillmentMethod {
  id: string;
  name: string;
  desc: string;
  health: Health;
  requires: string[];
  note: string;
}

export const FULFILLMENT_METHODS: FulfillmentMethod[] = [
  {
    id: 'platform_api',
    name: 'MonoPulse triggers platform bonus',
    desc: 'MonoPulse calls the operator platform API to create the bonus at grant time.',
    health: 'connected',
    requires: ['Bonus template', 'Expiry'],
    note: 'Platform API reachable · avg 240ms',
  },
  {
    id: 'existing_guid',
    name: 'Use existing bonus GUID',
    desc: 'Reference a pre-created bonus by its GUID on the operator platform.',
    health: 'connected',
    requires: ['Bonus GUID'],
    note: 'GUID validated against catalog',
  },
  {
    id: 'wallet',
    name: 'Operator wallet payout',
    desc: 'Credit reward value directly to the player wallet as cash.',
    health: 'degraded',
    requires: ['Wallet route', 'Currency'],
    note: 'Wallet route needs currency mapping confirmed',
  },
  {
    id: 'external',
    name: 'External bonus engine / provider',
    desc: 'Delegate fulfillment to a connected third-party bonus provider.',
    health: 'error',
    requires: ['Provider auth', 'Bonus template'],
    note: 'Auth failed on last sync — reconnection required',
  },
];

export function fulfillmentById(id: string): FulfillmentMethod | undefined {
  return FULFILLMENT_METHODS.find((m) => m.id === id);
}

// ── Rule validation ──────────────────────────────────────────
export function ruleErrors(rule: Rule): string[] {
  const errs: string[] = [];
  if (!rule.when) errs.push('Choose a WHEN event that fires this rule.');
  if (!rule.thenAction) errs.push('Choose a THEN action.');
  const actionsNeedingValue = ['Grant reward', 'Add raffle tickets', 'Award XP', 'Add leaderboard points'];
  if (rule.thenAction && actionsNeedingValue.includes(rule.thenAction) && !rule.thenValue)
    errs.push('Set a value for the THEN action.');
  rule.conditions.forEach((c) => {
    if (c.field && !c.value) errs.push(`Condition “${c.field}” needs a value.`);
    if (!c.field && c.value) errs.push('A condition is missing its field.');
  });
  return errs;
}

export function rulesValid(d: DraftCampaign): boolean {
  return d.rules.length > 0 && d.rules.every((r) => ruleErrors(r).length === 0);
}

export function ruleSummary(rule: Rule): string {
  if (!rule.when) return 'Incomplete rule';
  const conds = rule.conditions.filter((c) => c.field && c.value);
  const ifPart = conds.length ? ` if ${conds.map((c) => `${c.field} ${c.op} ${c.value}`).join(' and ')}` : '';
  const unit = actionUnit(rule.thenAction);
  const thenPart = rule.thenAction
    ? ` → ${rule.thenAction}${rule.thenValue ? ` ${rule.thenValue}${unit && unit !== 'progress' ? ` ${unit}` : ''}` : ''}`
    : '';
  return `When ${rule.when.toLowerCase()}${ifPart}${thenPart}`;
}

// ── 7-day test + cost preview ────────────────────────────────
export interface RuleTest {
  matchedEvents: number;
  matchedPlayers: number;
  projectedGrants: number;
  estimatedCost: number;
  selectivity: number; // 0..1, how much conditions narrow the funnel
}

export function testRules(d: DraftCampaign): RuleTest {
  const aud = estimateAudience(d);
  const validRules = d.rules.filter((r) => ruleErrors(r).length === 0);
  if (validRules.length === 0 || aud.size === 0)
    return { matchedEvents: 0, matchedPlayers: 0, projectedGrants: 0, estimatedCost: 0, selectivity: 0 };

  // events per player per week baseline, narrowed by conditions
  const avgEventsPerPlayer = 42;
  const totalConditions = validRules.reduce((n, r) => n + r.conditions.filter((c) => c.field && c.value).length, 0);
  const selectivity = Math.max(0.12, 1 - totalConditions * 0.18);
  const matchedEvents = Math.round(aud.size * avgEventsPerPlayer * selectivity);
  const matchedPlayers = Math.round(aud.size * Math.min(0.9, 0.45 + selectivity * 0.4));

  const grantActions = validRules.filter((r) => r.thenAction === 'Grant reward');
  const perPlayerReward = Number(d.rewardAmount) || grantActions.reduce((s, r) => s + (Number(r.thenValue) || 0), 0) || 0;
  const projectedGrants = grantActions.length ? matchedPlayers : Math.round(matchedPlayers * 0.6);
  let estimatedCost = Math.round(projectedGrants * (perPlayerReward || 8));
  const cap = Number(d.budgetCap) || 0;
  if (cap > 0) estimatedCost = Math.min(estimatedCost, cap);

  return { matchedEvents, matchedPlayers, projectedGrants, estimatedCost, selectivity };
}

// ── Step completeness ────────────────────────────────────────
export function stepStatus(d: DraftCampaign): Record<StepId, FieldStatus> {
  const brandsOk = d.brandScope === 'network' ? (d.network.brandIdsMode === 'all' || d.brands.length > 0) : d.brands.length > 0;
  const setupComplete = !!(d.name && d.startDate && d.startTime && d.endDate && d.endTime && brandsOk);
  const setupPartial = !!(d.name || d.brands.length > 0 || d.brandScope === 'network');

  const audienceComplete = !!(d.segments.length > 0 || d.tiers.length > 0 || d.vipOnly);
  const audiencePartial = !!(d.segments.length > 0 || d.tiers.length > 0 || d.rules.length > 0);

  const logicComplete = rulesValid(d);
  const logicPartial = d.rules.length > 0;

  const rewardsComplete = !!(d.rewardType && d.rewardAmount && d.fulfillmentMethod);
  const rewardsPartial = !!(d.rewardType || d.fulfillmentMethod);

  const budgetComplete = !!(d.budgetCap && d.rgExclusionsApplied);
  const budgetPartial = !!(d.budgetCap || d.rgExclusionsApplied);

  return {
    setup: setupComplete ? 'complete' : setupPartial ? 'partial' : 'empty',
    audience: audienceComplete ? 'complete' : audiencePartial ? 'partial' : 'empty',
    logic: logicComplete ? 'complete' : logicPartial ? 'partial' : 'empty',
    rewards: rewardsComplete ? 'complete' : rewardsPartial ? 'partial' : 'empty',
    budget: budgetComplete ? 'complete' : budgetPartial ? 'partial' : 'empty',
    review: 'empty',
  };
}

// ── Safety model (expanded) ──────────────────────────────────
export type SafetyCategory =
  | 'validation'
  | 'fraud'
  | 'manual_review'
  | 'rg'
  | 'kyc'
  | 'jurisdiction'
  | 'audit';

export type SafetySeverity = 'blocker' | 'warning' | 'info' | 'pass';

export interface SafetyCheck {
  id: string;
  category: SafetyCategory;
  label: string;
  detail: string;
  severity: SafetySeverity;
  step: StepId;
}

export const SAFETY_CATEGORY_LABEL: Record<SafetyCategory, string> = {
  validation: 'Validation',
  fraud: 'Fraud queue',
  manual_review: 'Manual reward review',
  rg: 'Responsible gambling',
  kyc: 'KYC hold',
  jurisdiction: 'Jurisdiction',
  audit: 'Audit trail',
};

export function getSafetyChecks(d: DraftCampaign): SafetyCheck[] {
  const out: SafetyCheck[] = [];
  const multiBrand = d.brandScope === 'network';
  const highReward = Number(d.rewardAmount) > 500;

  // 1. Validation blockers
  if (!rulesValid(d))
    out.push({ id: 'val-rules', category: 'validation', severity: 'blocker', step: 'logic', label: 'Rule set incomplete or invalid', detail: 'At least one valid WHEN / IF / THEN rule is required before this campaign can run.' });
  else
    out.push({ id: 'val-rules', category: 'validation', severity: 'pass', step: 'logic', label: 'Rules validated', detail: `${d.rules.length} rule${d.rules.length === 1 ? '' : 's'} pass live validation.` });

  if (!d.fulfillmentMethod)
    out.push({ id: 'val-fulfill', category: 'validation', severity: 'blocker', step: 'rewards', label: 'No fulfillment method selected', detail: 'A reward fulfillment method is required before rewards can be granted.' });
  if (d.fulfillmentMethod === 'external')
    out.push({ id: 'val-ext', category: 'validation', severity: 'blocker', step: 'rewards', label: 'Fulfillment provider unreachable', detail: 'The external bonus engine returned auth errors on last sync. Reconnect before launch.' });
  if (!d.budgetCap)
    out.push({ id: 'val-budget', category: 'validation', severity: 'blocker', step: 'budget', label: 'No total budget cap set', detail: 'A total budget cap is mandatory to protect against runaway reward cost.' });

  // 2. Fraud queue
  if (d.excludeRiskFlagged)
    out.push({ id: 'fraud', category: 'fraud', severity: 'pass', step: 'audience', label: 'Fraud-flagged players excluded', detail: 'Players in the fraud & abuse review queue are removed from the audience.' });
  else
    out.push({ id: 'fraud', category: 'fraud', severity: 'warning', step: 'audience', label: 'Fraud-flagged players included', detail: 'Players currently in the fraud queue are eligible. Enable the exclusion or accept the abuse risk.' });

  // 3. Manual reward review
  if (highReward && !d.manualRewardReview)
    out.push({ id: 'manual', category: 'manual_review', severity: 'warning', step: 'budget', label: 'High-value grants not routed to manual review', detail: 'Rewards above €500 are not queued for a human check before payout. Enable manual review to add a safeguard.' });
  else if (d.manualRewardReview)
    out.push({ id: 'manual', category: 'manual_review', severity: 'info', step: 'budget', label: 'Manual reward review enabled', detail: 'Qualifying grants pause in a review queue before payout.' });

  // 4. Responsible gambling
  if (!d.rgExclusionsApplied)
    out.push({ id: 'rg', category: 'rg', severity: 'blocker', step: 'budget', label: 'Responsible-gambling exclusions not applied', detail: 'Self-excluded, cooling-off and deposit-limited players must be excluded before launch.' });
  else
    out.push({ id: 'rg', category: 'rg', severity: 'pass', step: 'budget', label: 'RG exclusions applied', detail: 'Self-excluded and limited players are removed from the audience.' });

  // 5. KYC hold
  if (Number(d.rewardType === 'Cash' ? d.rewardAmount : 0) > 0 || d.rewardType === 'Cash') {
    if (!d.kycRequired)
      out.push({ id: 'kyc', category: 'kyc', severity: 'warning', step: 'budget', label: 'Cash reward without KYC hold', detail: 'Cash payouts should require verified KYC. Enable the KYC hold to withhold payout until verification passes.' });
    else
      out.push({ id: 'kyc', category: 'kyc', severity: 'pass', step: 'budget', label: 'KYC hold active', detail: 'Payout is withheld until the player passes KYC verification.' });
  } else if (d.kycRequired) {
    out.push({ id: 'kyc', category: 'kyc', severity: 'info', step: 'budget', label: 'KYC hold active', detail: 'Reward is withheld until the player passes KYC verification.' });
  }

  // 6. Jurisdiction
  if (multiBrand && !d.jurisdictionResolved)
    out.push({ id: 'jur', category: 'jurisdiction', severity: 'warning', step: 'setup', label: 'Brands span multiple jurisdictions', detail: 'Network brands operate under differing bonus rules. Confirm eligibility mapping to clear this warning.' });
  else
    out.push({ id: 'jur', category: 'jurisdiction', severity: 'pass', step: 'setup', label: 'Jurisdiction mapping valid', detail: multiBrand ? 'Eligibility mapping confirmed across network brands.' : 'Single-brand scope — one licence applies.' });

  // 7. Audit trail
  out.push({ id: 'audit', category: 'audit', severity: 'pass', step: 'review', label: 'Audit trail active', detail: 'Every configuration change is recorded and attributed for compliance review.' });

  return out;
}

export interface Issue {
  id: string;
  title: string;
  detail: string;
  step: StepId;
}

export function getBlockers(d: DraftCampaign): Issue[] {
  return getSafetyChecks(d)
    .filter((c) => c.severity === 'blocker')
    .map((c) => ({ id: c.id, title: c.label, detail: c.detail, step: c.step }));
}

export function getWarnings(d: DraftCampaign): Issue[] {
  return getSafetyChecks(d)
    .filter((c) => c.severity === 'warning')
    .map((c) => ({ id: c.id, title: c.label, detail: c.detail, step: c.step }));
}

export type Verdict = 'clear' | 'warning' | 'blocked';

export function verdict(d: DraftCampaign): Verdict {
  if (getBlockers(d).length > 0) return 'blocked';
  if (getWarnings(d).length > 0) return 'warning';
  return 'clear';
}

export function requiresApproval(d: DraftCampaign): boolean {
  // Network campaigns always need org-level approval; warnings and high rewards too.
  return d.brandScope === 'network' || getWarnings(d).length > 0 || Number(d.rewardAmount) > 500;
}

export function blockerSteps(d: DraftCampaign): Set<StepId> {
  return new Set(getBlockers(d).map((b) => b.step));
}

export function estimateAudience(d: DraftCampaign): { size: number; excluded: number } {
  const networkAll = d.brandScope === 'network' && d.network.brandIdsMode === 'all';
  const base = networkAll ? 340000 : Math.max(d.brands.length, 0) * 58000;
  if (base === 0) return { size: 0, excluded: 0 };
  let size = base;
  if (d.tiers.length) size = Math.round(size * (0.18 + d.tiers.length * 0.12));
  if (d.segments.length) size = Math.round(size * 0.62);
  if (d.countries.length) size = Math.round(size * Math.min(1, 0.35 + d.countries.length * 0.15));
  if (d.vipOnly) size = Math.round(size * 0.06);
  let excluded = Math.round(base * 0.028);
  if (d.excludeRiskFlagged) excluded += Math.round(base * 0.014);
  if (d.rgExclusionsApplied) excluded += Math.round(base * 0.019);
  return { size: Math.max(size - excluded, 0), excluded };
}
