import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { CampaignTypeId } from '../data/campaigns';

export type ApprovalState = 'none' | 'submitted' | 'pending' | 'approved' | 'rejected';

// Current operator role — gates who can create NETWORK campaigns.
export type UserRole = 'ORG_ADMIN' | 'BRAND_ADMIN' | 'BRAND_OPERATOR';

export type BrandScope = 'brand_only' | 'network';

// ── WHEN / IF / THEN rule model ──────────────────────────────
export interface RuleCondition {
  id: string;
  field: string; // e.g. 'Game category', 'Bet amount', 'Player tier'
  op: string; // 'is' | 'is not' | 'at least' | 'at most' | 'between'
  value: string;
}

export interface Rule {
  id: string;
  when: string; // event that fires the rule
  conditions: RuleCondition[]; // IF filters
  thenAction: string; // what happens
  thenValue: string; // amount / target for the action
}

export interface NetworkSettings {
  brandIdsMode: 'all' | 'selected';
  scoreAggregation: 'combined' | 'per_brand';
  prizeScope: 'shared_pool' | 'per_brand';
  displayMode: 'unified' | 'per_brand';
}

export interface DraftCampaign {
  type: CampaignTypeId | null;
  subtype: string; // subtype id, '' if type has none / not chosen
  // Actor
  role: UserRole;
  // Basic setup
  name: string;
  internalDesc: string;
  playerTitle: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
  owner: string;
  // Brand scope
  brandScope: BrandScope;
  brands: string[];
  network: NetworkSettings;
  // Audience
  segments: string[];
  tiers: string[];
  countries: string[];
  vipOnly: boolean;
  excludeRiskFlagged: boolean;
  // Rules (WHEN / IF / THEN)
  rules: Rule[];
  // Rewards
  rewardType: string;
  rewardAmount: string;
  currency: string;
  bonusTemplate: string;
  expiry: string;
  maxPerPlayer: string;
  totalCap: string;
  fulfillmentMethod: string;
  // Budget + compliance
  budgetCap: string;
  dailyCap: string;
  maxWinners: string;
  maxFrequency: string;
  rgExclusionsApplied: boolean;
  jurisdictionResolved: boolean;
  kycRequired: boolean;
  manualRewardReview: boolean;
  // Module-specific mechanics (keyed by field, driven by data/modules.ts)
  module: Record<string, unknown>;
  // Approval
  approvalState: ApprovalState;
}

let ruleSeq = 0;
export function newRule(): Rule {
  ruleSeq += 1;
  return {
    id: `rule-${Date.now()}-${ruleSeq}`,
    when: '',
    conditions: [],
    thenAction: '',
    thenValue: '',
  };
}

export function newCondition(): RuleCondition {
  ruleSeq += 1;
  return { id: `cond-${Date.now()}-${ruleSeq}`, field: '', op: 'is', value: '' };
}

const DEFAULT_NETWORK: NetworkSettings = {
  brandIdsMode: 'all',
  scoreAggregation: 'combined',
  prizeScope: 'shared_pool',
  displayMode: 'unified',
};

const DEFAULT_DRAFT: DraftCampaign = {
  type: null,
  subtype: '',
  role: 'ORG_ADMIN',
  name: '',
  internalDesc: '',
  playerTitle: '',
  startDate: '',
  startTime: '09:00',
  endDate: '',
  endTime: '23:59',
  timezone: 'UTC+00:00 — London',
  owner: 'Mara Ostheim',
  brandScope: 'brand_only',
  brands: [],
  network: DEFAULT_NETWORK,
  segments: [],
  tiers: [],
  countries: [],
  vipOnly: false,
  excludeRiskFlagged: true,
  rules: [],
  rewardType: '',
  rewardAmount: '',
  currency: 'EUR',
  bonusTemplate: '',
  expiry: '',
  maxPerPlayer: '',
  totalCap: '',
  fulfillmentMethod: '',
  budgetCap: '',
  dailyCap: '',
  maxWinners: '',
  maxFrequency: '',
  rgExclusionsApplied: false,
  jurisdictionResolved: false,
  kycRequired: false,
  manualRewardReview: false,
  module: {},
  approvalState: 'none',
};

// Editing any of these after approval invalidates it.
const SENSITIVE: (keyof DraftCampaign)[] = [
  'brandScope', 'brands', 'network', 'segments', 'tiers', 'countries', 'vipOnly',
  'rules', 'rewardType', 'rewardAmount', 'currency', 'fulfillmentMethod',
  'budgetCap', 'dailyCap', 'maxPerPlayer', 'maxWinners',
  'rgExclusionsApplied', 'jurisdictionResolved', 'kycRequired', 'manualRewardReview', 'module',
];

interface CampaignCtx {
  draft: DraftCampaign;
  approvalReset: boolean;
  update: (patch: Partial<DraftCampaign>) => void;
  setModuleField: (key: string, value: unknown) => void;
  setType: (t: CampaignTypeId, subtype?: string) => void;
  setRole: (r: UserRole) => void;
  clearApprovalReset: () => void;
  reset: () => void;
}

const Ctx = createContext<CampaignCtx | null>(null);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<DraftCampaign>(DEFAULT_DRAFT);
  const [approvalReset, setApprovalReset] = useState(false);

  const update = (patch: Partial<DraftCampaign>) =>
    setDraft((prev) => {
      const touchesSensitive = Object.keys(patch).some(
        (k) => SENSITIVE.includes(k as keyof DraftCampaign) &&
          (patch as unknown as Record<string, unknown>)[k] !== (prev as unknown as Record<string, unknown>)[k]
      );
      const wasCommitted =
        prev.approvalState === 'submitted' ||
        prev.approvalState === 'pending' ||
        prev.approvalState === 'approved';
      if (touchesSensitive && wasCommitted) {
        setApprovalReset(true);
        return { ...prev, ...patch, approvalState: 'none' };
      }
      return { ...prev, ...patch };
    });

  const setModuleField = (key: string, value: unknown) =>
    setDraft((prev) => {
      const wasCommitted =
        prev.approvalState === 'submitted' ||
        prev.approvalState === 'pending' ||
        prev.approvalState === 'approved';
      const next = { ...prev, module: { ...prev.module, [key]: value } };
      if (wasCommitted) {
        setApprovalReset(true);
        return { ...next, approvalState: 'none' };
      }
      return next;
    });

  const setType = (t: CampaignTypeId, subtype = '') =>
    // switching type clears stale module config from the previous mechanic
    setDraft((prev) => (prev.type === t ? { ...prev, subtype } : { ...prev, type: t, subtype, module: {} }));
  const setRole = (r: UserRole) =>
    setDraft((prev) => ({
      ...prev,
      role: r,
      // downgrade scope if the new role can't run network campaigns
      brandScope: r === 'ORG_ADMIN' ? prev.brandScope : 'brand_only',
    }));
  const clearApprovalReset = () => setApprovalReset(false);
  const reset = () => setDraft(DEFAULT_DRAFT);

  return (
    <Ctx.Provider value={{ draft, approvalReset, update, setModuleField, setType, setRole, clearApprovalReset, reset }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCampaign(): CampaignCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCampaign must be used within CampaignProvider');
  return ctx;
}
