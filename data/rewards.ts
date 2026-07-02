export type RewardKind = 'bonus' | 'free_spins' | 'cashback' | 'cash' | 'points' | 'physical';
export type FulfillmentMode = 'operator_wallet' | 'monopulse_trigger' | 'bonus_guid' | 'manual_ops';
export type RewardStatus = 'active' | 'draft' | 'paused' | 'blocked';
export type FulfillmentStatus = 'healthy' | 'warning' | 'failing';
export type GateStatus = 'clear' | 'warning' | 'blocked';
export type GrantStatus = 'pending' | 'approved' | 'retrying' | 'failed';

export const KIND_LABEL: Record<RewardKind, string> = {
  bonus: 'Bonus',
  free_spins: 'Free spins',
  cashback: 'Cashback',
  cash: 'Cash',
  points: 'Points',
  physical: 'Physical',
};

export const FULFILLMENT_LABEL: Record<FulfillmentMode, string> = {
  operator_wallet: 'Operator wallet',
  monopulse_trigger: 'MonoPulse trigger',
  bonus_guid: 'Existing bonus GUID',
  manual_ops: 'Manual ops',
};

export const STATUS_META: Record<RewardStatus, { label: string; fg: string; bg: string }> = {
  active: { label: 'Active', fg: 'var(--success)', bg: 'var(--status-live-bg)' },
  draft: { label: 'Draft', fg: 'var(--fg-muted)', bg: 'var(--surface-3)' },
  paused: { label: 'Paused', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
  blocked: { label: 'Blocked', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
};

export const HEALTH_META: Record<FulfillmentStatus, { label: string; fg: string; bg: string }> = {
  healthy: { label: 'Healthy', fg: 'var(--success)', bg: 'var(--status-live-bg)' },
  warning: { label: 'Warning', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
  failing: { label: 'Failing', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
};

export const GATE_META: Record<GateStatus, { label: string; fg: string; bg: string }> = {
  clear: { label: 'Clear', fg: 'var(--success)', bg: 'var(--status-live-bg)' },
  warning: { label: 'Warning', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
  blocked: { label: 'Blocked', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
};

export interface RewardItem {
  id: string;
  name: string;
  kind: RewardKind;
  brand: string;
  campaignUse: string;
  fulfillment: FulfillmentMode;
  bonusGuid?: string;
  provider: string;
  costPerGrant: number;
  currency: string;
  issued: number;
  claimed: number;
  expired: number;
  pendingLiability: number;
  dailyCap: number;
  status: RewardStatus;
  health: FulfillmentStatus;
  risk: GateStatus;
  owner: string;
  updatedAt: string;
}

export interface ManualGrant {
  id: string;
  rewardId: string;
  rewardName: string;
  playerId: string;
  brand: string;
  reason: string;
  requester: string;
  status: GrantStatus;
  risk: GateStatus;
  amount: number;
  createdAt: string;
}

export interface LiabilityRow {
  brand: string;
  issuedValue: number;
  pendingValue: number;
  expiredValue: number;
  cap: number;
  health: FulfillmentStatus;
}

export interface RiskGate {
  id: string;
  label: string;
  scope: string;
  status: GateStatus;
  impact: string;
  owner: string;
}

export interface RewardAudit {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  note: string;
}

export const REWARDS: RewardItem[] = [
  {
    id: 'rw-fs-acr-20',
    name: '20 free spins · Starburst',
    kind: 'free_spins',
    brand: 'ACR',
    campaignUse: 'Mission completion, prize drops',
    fulfillment: 'bonus_guid',
    bonusGuid: 'BONUS-FS20-ACR-2026',
    provider: 'Bonus Engine v2',
    costPerGrant: 2.4,
    currency: 'EUR',
    issued: 18420,
    claimed: 14980,
    expired: 1240,
    pendingLiability: 5280,
    dailyCap: 25000,
    status: 'active',
    health: 'healthy',
    risk: 'clear',
    owner: 'CRM Ops',
    updatedAt: '8m ago',
  },
  {
    id: 'rw-cb-vgv-5',
    name: '5% weekly rakeback',
    kind: 'cashback',
    brand: 'VGV',
    campaignUse: 'Loyalty tier benefit',
    fulfillment: 'operator_wallet',
    provider: 'Operator Wallet API',
    costPerGrant: 18,
    currency: 'EUR',
    issued: 3120,
    claimed: 2860,
    expired: 0,
    pendingLiability: 46800,
    dailyCap: 85000,
    status: 'active',
    health: 'healthy',
    risk: 'warning',
    owner: 'Casino Manager',
    updatedAt: '16m ago',
  },
  {
    id: 'rw-bonus-bnv-50',
    name: '€50 deposit match',
    kind: 'bonus',
    brand: 'BNV',
    campaignUse: 'Welcome mission',
    fulfillment: 'monopulse_trigger',
    provider: 'MonoPulse trigger → Platform bonus',
    costPerGrant: 50,
    currency: 'EUR',
    issued: 920,
    claimed: 641,
    expired: 96,
    pendingLiability: 9150,
    dailyCap: 35000,
    status: 'draft',
    health: 'warning',
    risk: 'warning',
    owner: 'Retention Lead',
    updatedAt: '34m ago',
  },
  {
    id: 'rw-cash-glr-jackpot',
    name: 'Jackpot cash payout',
    kind: 'cash',
    brand: 'GLR',
    campaignUse: 'Mega Network Jackpot',
    fulfillment: 'operator_wallet',
    provider: 'Operator Wallet API',
    costPerGrant: 50000,
    currency: 'EUR',
    issued: 3,
    claimed: 2,
    expired: 0,
    pendingLiability: 50000,
    dailyCap: 60000,
    status: 'blocked',
    health: 'failing',
    risk: 'blocked',
    owner: 'Risk team',
    updatedAt: '4m ago',
  },
  {
    id: 'rw-points-lkf-1000',
    name: '1,000 loyalty points',
    kind: 'points',
    brand: 'LKF',
    campaignUse: 'Achievements, tier boosts',
    fulfillment: 'monopulse_trigger',
    provider: 'MonoPulse loyalty ledger',
    costPerGrant: 6,
    currency: 'EUR',
    issued: 8410,
    claimed: 8410,
    expired: 0,
    pendingLiability: 0,
    dailyCap: 40000,
    status: 'active',
    health: 'healthy',
    risk: 'clear',
    owner: 'Loyalty Ops',
    updatedAt: '11m ago',
  },
  {
    id: 'rw-physical-spc-vip',
    name: 'VIP event package',
    kind: 'physical',
    brand: 'SPC',
    campaignUse: 'High-value retention',
    fulfillment: 'manual_ops',
    provider: 'CRM manual fulfillment',
    costPerGrant: 750,
    currency: 'EUR',
    issued: 18,
    claimed: 12,
    expired: 1,
    pendingLiability: 3750,
    dailyCap: 10000,
    status: 'paused',
    health: 'warning',
    risk: 'warning',
    owner: 'VIP Manager',
    updatedAt: '1h ago',
  },
];

export const MANUAL_GRANTS: ManualGrant[] = [
  { id: 'gr-1029', rewardId: 'rw-cash-glr-jackpot', rewardName: 'Jackpot cash payout', playerId: 'PLR-9902137', brand: 'GLR', reason: 'High-value jackpot requires reviewer approval', requester: 'Risk team', status: 'pending', risk: 'blocked', amount: 50000, createdAt: '12:39' },
  { id: 'gr-1028', rewardId: 'rw-bonus-bnv-50', rewardName: '€50 deposit match', playerId: 'PLR-4412890', brand: 'BNV', reason: 'Retention save offer', requester: 'CRM Ops', status: 'approved', risk: 'warning', amount: 50, createdAt: '12:18' },
  { id: 'gr-1027', rewardId: 'rw-fs-acr-20', rewardName: '20 free spins · Starburst', playerId: 'PLR-4471902', brand: 'ACR', reason: 'Mission completion retry', requester: 'Support', status: 'retrying', risk: 'clear', amount: 2.4, createdAt: '11:55' },
  { id: 'gr-1026', rewardId: 'rw-physical-spc-vip', rewardName: 'VIP event package', playerId: 'PLR-2210048', brand: 'SPC', reason: 'VIP retention approval missing shipping country', requester: 'VIP Manager', status: 'failed', risk: 'warning', amount: 750, createdAt: '11:31' },
];

export const LIABILITY: LiabilityRow[] = [
  { brand: 'ACR', issuedValue: 44208, pendingValue: 5280, expiredValue: 2976, cap: 95000, health: 'healthy' },
  { brand: 'VGV', issuedValue: 56160, pendingValue: 46800, expiredValue: 0, cap: 120000, health: 'healthy' },
  { brand: 'BNV', issuedValue: 46000, pendingValue: 9150, expiredValue: 4800, cap: 65000, health: 'warning' },
  { brand: 'GLR', issuedValue: 150000, pendingValue: 50000, expiredValue: 0, cap: 180000, health: 'failing' },
  { brand: 'LKF', issuedValue: 50460, pendingValue: 0, expiredValue: 0, cap: 80000, health: 'healthy' },
  { brand: 'SPC', issuedValue: 13500, pendingValue: 3750, expiredValue: 750, cap: 50000, health: 'warning' },
];

export const RISK_GATES: RiskGate[] = [
  { id: 'gate-rg', label: 'Responsible-gambling exclusions', scope: 'All brands', status: 'clear', impact: 'Excluded, self-limited and deposit-limited players are blocked before grant.', owner: 'Risk' },
  { id: 'gate-jurisdiction', label: 'Jurisdiction reward rules', scope: 'GLR · SPC', status: 'warning', impact: 'Physical rewards and cash jackpots require country-specific review.', owner: 'Compliance' },
  { id: 'gate-liability', label: 'Daily reward liability caps', scope: 'GLR', status: 'blocked', impact: 'Jackpot payout would exceed remaining daily cap without approval.', owner: 'Casino Manager' },
  { id: 'gate-provider', label: 'Wallet/provider fulfillment health', scope: 'GLR', status: 'blocked', impact: 'Operator Wallet API returns 401 on reward payout endpoint.', owner: 'Technical Admin' },
  { id: 'gate-audit', label: 'Manual grant audit reason', scope: 'All manual grants', status: 'clear', impact: 'Grant reason and actor are required before submission.', owner: 'CRM Ops' },
];

export const REWARD_AUDIT: RewardAudit[] = [
  { id: 'aud-rw-9321', at: '12:44', actor: 'Mariam · Risk', action: 'Blocked payout', target: 'rw-cash-glr-jackpot', note: 'Wallet auth failure and cap breach. Sent to approval queue.' },
  { id: 'aud-rw-9320', at: '12:32', actor: 'Dato · CRM', action: 'Mapped bonus GUID', target: 'rw-bonus-bnv-50', note: 'Assigned sandbox bonus GUID for deposit match test.' },
  { id: 'aud-rw-9318', at: '12:05', actor: 'System', action: 'Retried grant', target: 'gr-1027', note: 'Free spin grant retry scheduled after provider timeout.' },
  { id: 'aud-rw-9315', at: '11:40', actor: 'Nino · Casino', action: 'Updated cap', target: 'rw-cb-vgv-5', note: 'Daily rakeback cap increased after campaign forecast review.' },
];

export function rewardKpis() {
  return {
    activeRewards: REWARDS.filter((r) => r.status === 'active').length,
    pendingLiability: REWARDS.reduce((sum, r) => sum + r.pendingLiability, 0),
    failedFulfillment: REWARDS.filter((r) => r.health === 'failing').length + MANUAL_GRANTS.filter((g) => g.status === 'failed').length,
    queuedGrants: MANUAL_GRANTS.filter((g) => g.status === 'pending' || g.status === 'retrying').length,
    guidCoverage: Math.round((REWARDS.filter((r) => r.fulfillment !== 'bonus_guid' || r.bonusGuid).length / REWARDS.length) * 100),
    blockers: RISK_GATES.filter((g) => g.status === 'blocked').length,
  };
}
