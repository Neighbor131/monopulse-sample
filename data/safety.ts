import { fmtMoney, getType } from './campaigns';
import type { CampaignTypeId } from './campaigns';
import { countBySeverity } from './reviews';
import type { Review } from './reviews';

// ─────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────
export type Severity = 'critical' | 'warning' | 'info';

export interface TimelineEvent {
  at: string;
  actor: string;
  action: string;
  detail?: string;
  tone?: 'system' | 'human' | 'alert';
}

// Normalized shape the detail drawer renders for ANY item kind.
export type DrawerKind = 'review' | 'fraud' | 'reward' | 'exception' | 'webhook' | 'audit' | 'program' | 'override' | 'ledger';

export interface DrawerFact {
  label: string;
  value: string;
  mono?: boolean;
  tone?: 'default' | 'danger' | 'warning' | 'success';
}

export interface DrawerRelated {
  kind: 'campaign' | 'player' | 'reward' | 'provider' | 'segment' | 'brand';
  label: string;
  value: string;
}

export interface DrawerAction {
  id: string;
  label: string;
  tone: 'primary' | 'danger' | 'warning' | 'default';
}

export interface DrawerModel {
  kind: DrawerKind;
  kindLabel: string;
  id: string;
  title: string;
  subtitle: string;
  severity: Severity;
  statusLabel: string;
  riskReason: string;
  facts: DrawerFact[];
  related: DrawerRelated[];
  timeline: TimelineEvent[];
  actions: DrawerAction[];
  openCampaignId?: string;
  fullReviewId?: string;
}

const EUR = 'EUR';

// ─────────────────────────────────────────────────────────────
// Fraud & Abuse queue
// ─────────────────────────────────────────────────────────────
export type FraudStatus = 'open' | 'holding' | 'released' | 'escalated' | 'excluded';

export interface FraudCase {
  id: string;
  playerId: string;
  playerAlias: string;
  brand: string;
  campaignId: string;
  campaignName: string;
  type: CampaignTypeId;
  triggerReason: string;
  detail: string;
  rewardValue: number;
  velocitySignal: string;
  velocityScore: number; // 0-100
  severity: Severity;
  status: FraudStatus;
  flaggedAt: string;
  accountAge: string;
  linkedAccounts: number;
  timeline: TimelineEvent[];
}

export const FRAUD_CASES: FraudCase[] = [
  {
    id: 'fr-8842', playerId: 'PLR-4471902', playerAlias: 'nightowl_88', brand: 'VGV',
    campaignId: 'c-1039', campaignName: 'High Roller Rakeback Q1', type: 'rakeback',
    triggerReason: 'Velocity spike — bonus abuse pattern',
    detail: '412 bets in 6 minutes across 3 low-edge tables immediately after rakeback qualified. Wager pattern matches known bonus-farming signature.',
    rewardValue: 2000, velocitySignal: '68× baseline bet rate', velocityScore: 92,
    severity: 'critical', status: 'holding', flaggedAt: '12m ago', accountAge: '4 days', linkedAccounts: 3,
    timeline: [
      { at: '12m ago', actor: 'Safety engine', action: 'Velocity threshold breached', detail: 'Bet rate 68× rolling baseline', tone: 'alert' },
      { at: '11m ago', actor: 'Safety engine', action: 'Reward payout auto-held', detail: '€2,000 rakeback held pending review', tone: 'system' },
      { at: '9m ago', actor: 'Fraud model v4', action: 'Linked 3 accounts by device + payment fingerprint', tone: 'system' },
    ],
  },
  {
    id: 'fr-8836', playerId: 'PLR-3390014', playerAlias: 'goldrush_max', brand: 'GLR',
    campaignId: 'c-1012', campaignName: 'Cash Splash Prize Drop', type: 'prizedrop',
    triggerReason: 'Drop-timing collusion',
    detail: 'Coordinated spin timing with 2 other accounts to cluster around drop windows. Shared IP subnet detected.',
    rewardValue: 500, velocitySignal: 'Synchronized spins ±0.4s', velocityScore: 78,
    severity: 'critical', status: 'escalated', flaggedAt: '48m ago', accountAge: '2 months', linkedAccounts: 2,
    timeline: [
      { at: '48m ago', actor: 'Safety engine', action: 'Drop-timing anomaly flagged', tone: 'alert' },
      { at: '40m ago', actor: 'Ravi Menon', action: 'Escalated to compliance', detail: 'Multi-account collusion suspected', tone: 'human' },
    ],
  },
  {
    id: 'fr-8829', playerId: 'PLR-5582177', playerAlias: 'spincity_ella', brand: 'SPC',
    campaignId: 'c-1042', campaignName: 'Weekend Warriors Mission', type: 'mission',
    triggerReason: 'Multi-account reward stacking',
    detail: 'Same KYC identity linked to 4 accounts each claiming the mission reward. Payment method reused across accounts.',
    rewardValue: 100, velocitySignal: '4 accounts · 1 identity', velocityScore: 64,
    severity: 'warning', status: 'open', flaggedAt: '2h ago', accountAge: '8 months', linkedAccounts: 4,
    timeline: [
      { at: '2h ago', actor: 'Safety engine', action: 'Identity match across 4 accounts', tone: 'alert' },
    ],
  },
  {
    id: 'fr-8815', playerId: 'PLR-2210548', playerAlias: 'aceroyale_tom', brand: 'ACR',
    campaignId: 'c-1041', campaignName: 'Champions League Tournament', type: 'race',
    triggerReason: 'Leaderboard rank manipulation',
    detail: 'Rapid low-risk hedged bets to inflate turnover score without real exposure. Wager/loss ratio anomalous.',
    rewardValue: 800, velocitySignal: 'Hedge ratio 0.98', velocityScore: 71,
    severity: 'warning', status: 'holding', flaggedAt: '3h ago', accountAge: '1 year', linkedAccounts: 0,
    timeline: [
      { at: '3h ago', actor: 'Safety engine', action: 'Hedging pattern detected', tone: 'alert' },
      { at: '2h ago', actor: 'Safety engine', action: 'Leaderboard reward held', tone: 'system' },
    ],
  },
  {
    id: 'fr-8801', playerId: 'PLR-6640231', playerAlias: 'betnova_kai', brand: 'BNV',
    campaignId: 'c-1034', campaignName: 'Mega Network Jackpot', type: 'jackpot',
    triggerReason: 'Bonus-bet contribution abuse',
    detail: 'Contributing to jackpot pool primarily via bonus funds excluded from eligibility. Low real-money exposure.',
    rewardValue: 0, velocitySignal: '94% bonus-funded', velocityScore: 55,
    severity: 'info', status: 'released', flaggedAt: 'yesterday', accountAge: '3 years', linkedAccounts: 0,
    timeline: [
      { at: 'yesterday', actor: 'Safety engine', action: 'Bonus-contribution ratio flagged', tone: 'alert' },
      { at: 'yesterday', actor: 'Sofia Lindqvist', action: 'Reviewed — false positive', detail: 'Player within bonus policy; released', tone: 'human' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Manual Reward Review queue
// ─────────────────────────────────────────────────────────────
export type RewardStatus = 'held' | 'approved' | 'rejected' | 'compliance';

export interface ManualReward {
  id: string;
  rewardType: string;
  value: number;
  fulfillmentMethod: string;
  fulfillmentHealth: 'connected' | 'degraded' | 'error';
  playerId: string;
  brand: string;
  campaignId: string;
  campaignName: string;
  type: CampaignTypeId;
  holdReason: string;
  detail: string;
  severity: Severity;
  status: RewardStatus;
  heldAt: string;
  timeline: TimelineEvent[];
}

export const MANUAL_REWARDS: ManualReward[] = [
  {
    id: 'rw-5521', rewardType: 'Cash payout', value: 2000, fulfillmentMethod: 'Operator wallet payout', fulfillmentHealth: 'degraded',
    playerId: 'PLR-4471902', brand: 'VGV', campaignId: 'c-1039', campaignName: 'High Roller Rakeback Q1', type: 'rakeback',
    holdReason: 'Exceeds auto-approve threshold',
    detail: 'Per-player cash payout of €2,000 is above the €500 auto-approve ceiling and is tied to a player under active fraud review (fr-8842).',
    severity: 'critical', status: 'held', heldAt: '12m ago',
    timeline: [
      { at: '12m ago', actor: 'Fulfillment engine', action: 'Payout held pre-delivery', detail: 'Above €500 threshold + linked fraud flag', tone: 'system' },
    ],
  },
  {
    id: 'rw-5518', rewardType: 'Jackpot pool payout', value: 50000, fulfillmentMethod: 'MonoPulse triggers platform bonus', fulfillmentHealth: 'connected',
    playerId: 'PLR-9902137', brand: 'ACR', campaignId: 'c-1034', campaignName: 'Mega Network Jackpot', type: 'jackpot',
    holdReason: 'High-value payout — dual sign-off required',
    detail: 'Network jackpot winner. Payout of €50,000 requires compliance + finance dual sign-off before release under high-value payout policy.',
    severity: 'critical', status: 'compliance', heldAt: '1h ago',
    timeline: [
      { at: '1h ago', actor: 'Fulfillment engine', action: 'High-value payout held', tone: 'system' },
      { at: '52m ago', actor: 'Dan Whitlock', action: 'Sent to compliance', detail: 'Requires dual sign-off', tone: 'human' },
    ],
  },
  {
    id: 'rw-5509', rewardType: 'Bonus funds', value: 250, fulfillmentMethod: 'MonoPulse triggers platform bonus', fulfillmentHealth: 'connected',
    playerId: 'PLR-3390014', brand: 'GLR', campaignId: 'c-1012', campaignName: 'Cash Splash Prize Drop', type: 'prizedrop',
    holdReason: 'Player under fraud review',
    detail: 'Prize-drop bonus paused because the recipient is part of an escalated collusion case (fr-8836).',
    severity: 'warning', status: 'held', heldAt: '45m ago',
    timeline: [
      { at: '45m ago', actor: 'Fulfillment engine', action: 'Payout held', detail: 'Recipient in active fraud case', tone: 'system' },
    ],
  },
  {
    id: 'rw-5498', rewardType: 'Free spins', value: 40, fulfillmentMethod: 'Use existing bonus GUID', fulfillmentHealth: 'connected',
    playerId: 'PLR-1120934', brand: 'SPC', campaignId: 'c-1042', campaignName: 'Weekend Warriors Mission', type: 'mission',
    holdReason: 'KYC verification incomplete',
    detail: 'Player has not completed identity verification. Free-spin grant with real-money withdrawal potential is held until KYC clears.',
    severity: 'warning', status: 'held', heldAt: '3h ago',
    timeline: [
      { at: '3h ago', actor: 'Fulfillment engine', action: 'Payout held — KYC pending', tone: 'system' },
    ],
  },
  {
    id: 'rw-5480', rewardType: 'Cash payout', value: 120, fulfillmentMethod: 'Operator wallet payout', fulfillmentHealth: 'connected',
    playerId: 'PLR-7781200', brand: 'BNV', campaignId: 'c-1031', campaignName: 'Slots Weekly Leaderboard', type: 'race',
    holdReason: 'Manual spot-check',
    detail: 'Random sampling hold for audit assurance. No risk flags — routine verification of leaderboard payout accuracy.',
    severity: 'info', status: 'approved', heldAt: 'yesterday',
    timeline: [
      { at: 'yesterday', actor: 'Fulfillment engine', action: 'Selected for spot-check', tone: 'system' },
      { at: 'yesterday', actor: 'Priya Nair', action: 'Approved payout', detail: 'Verified against leaderboard snapshot', tone: 'human' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Compliance Exceptions
// ─────────────────────────────────────────────────────────────
export type ExceptionKind = 'rg' | 'kyc' | 'jurisdiction' | 'budget_cap' | 'reward_cap';
export type ExceptionStatus = 'open' | 'resolved' | 'waived';

export const EXCEPTION_KIND_LABEL: Record<ExceptionKind, string> = {
  rg: 'Responsible gambling',
  kyc: 'KYC missing',
  jurisdiction: 'Jurisdiction conflict',
  budget_cap: 'Budget cap breach',
  reward_cap: 'Reward cap breach',
};

export interface ComplianceException {
  id: string;
  kind: ExceptionKind;
  title: string;
  detail: string;
  brand: string;
  campaignId: string;
  campaignName: string;
  type: CampaignTypeId;
  playerId?: string;
  severity: Severity;
  status: ExceptionStatus;
  raisedAt: string;
  owner: string;
  timeline: TimelineEvent[];
}

export const COMPLIANCE_EXCEPTIONS: ComplianceException[] = [
  {
    id: 'ce-2201', kind: 'rg', title: 'Self-excluded players in audience',
    detail: '38 self-excluded players were not removed from the Cash Splash Prize Drop audience. RG exclusions were never configured on this campaign.',
    brand: 'GLR', campaignId: 'c-1012', campaignName: 'Cash Splash Prize Drop', type: 'prizedrop',
    severity: 'critical', status: 'open', raisedAt: '1d ago', owner: 'Sofia Lindqvist',
    timeline: [
      { at: '1d ago', actor: 'Safety engine', action: 'RG exclusion gap detected', detail: '38 self-excluded players in audience', tone: 'alert' },
      { at: '1d ago', actor: 'Sofia Lindqvist', action: 'Blocked campaign', detail: 'Rejected until RG filters applied', tone: 'human' },
    ],
  },
  {
    id: 'ce-2195', kind: 'jurisdiction', title: 'Pooled jackpot not licensed in 2 brands',
    detail: 'Mega Network Jackpot spans all 6 brands, but pooled jackpots are not permitted for LuckyForge (LKF) and GoldRush (GLR) under current licences.',
    brand: 'LKF', campaignId: 'c-1034', campaignName: 'Mega Network Jackpot', type: 'jackpot',
    severity: 'critical', status: 'open', raisedAt: '3h ago', owner: 'Sofia Lindqvist',
    timeline: [
      { at: '3h ago', actor: 'Safety engine', action: 'Jurisdiction mismatch flagged', detail: 'LKF, GLR ineligible for pooled jackpots', tone: 'alert' },
    ],
  },
  {
    id: 'ce-2188', kind: 'kyc', title: 'Payout before KYC completion',
    detail: 'Free-spin reward (rw-5498) queued for a player who has not completed identity verification. Real-money withdrawal potential blocked pending KYC.',
    brand: 'SPC', campaignId: 'c-1042', campaignName: 'Weekend Warriors Mission', type: 'mission', playerId: 'PLR-1120934',
    severity: 'warning', status: 'open', raisedAt: '3h ago', owner: 'Ravi Menon',
    timeline: [
      { at: '3h ago', actor: 'Fulfillment engine', action: 'KYC hold applied', tone: 'system' },
    ],
  },
  {
    id: 'ce-2176', kind: 'reward_cap', title: 'Per-player cap above tier threshold',
    detail: 'Rakeback per-player cap of €2,000 exceeds the €500 auto-approve limit for the Retention Manager role. Senior sign-off required.',
    brand: 'VGV', campaignId: 'c-1039', campaignName: 'High Roller Rakeback Q1', type: 'rakeback',
    severity: 'warning', status: 'open', raisedAt: '1h ago', owner: 'Sofia Lindqvist',
    timeline: [
      { at: '1h ago', actor: 'Safety engine', action: 'Reward cap threshold exceeded', tone: 'alert' },
    ],
  },
  {
    id: 'ce-2160', kind: 'budget_cap', title: 'No daily cap on €80k prize pool',
    detail: 'Champions League Tournament has no daily payout ceiling. The full €80,000 pool could pay out on the final day, concentrating exposure.',
    brand: 'ACR', campaignId: 'c-1041', campaignName: 'Champions League Tournament', type: 'race',
    severity: 'warning', status: 'resolved', raisedAt: 'yesterday', owner: 'Sofia Lindqvist',
    timeline: [
      { at: 'yesterday', actor: 'Safety engine', action: 'Missing daily cap flagged', tone: 'alert' },
      { at: 'yesterday', actor: 'Dan Whitlock', action: 'Added daily cap €20,000', detail: 'Exception resolved', tone: 'human' },
    ],
  },
  {
    id: 'ce-2154', kind: 'rg', title: 'Deposit-limit players auto-removed',
    detail: '1,340 deposit-limited players were correctly excluded from the Weekend Warriors audience. Logged for the RG audit trail.',
    brand: 'SPC', campaignId: 'c-1042', campaignName: 'Weekend Warriors Mission', type: 'mission',
    severity: 'info', status: 'resolved', raisedAt: '2d ago', owner: 'System',
    timeline: [
      { at: '2d ago', actor: 'Safety engine', action: 'RG exclusions applied', detail: '1,340 players removed', tone: 'system' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Webhook / Fulfillment failures
// ─────────────────────────────────────────────────────────────
export type WebhookStatus = 'failing' | 'retrying' | 'resolved';

export interface WebhookFailure {
  id: string;
  provider: string;
  errorCode: string;
  errorMessage: string;
  retryCount: number;
  maxRetries: number;
  lastAttempt: string;
  campaignId: string;
  campaignName: string;
  type: CampaignTypeId;
  playerId: string;
  brand: string;
  rewardValue: number;
  severity: Severity;
  status: WebhookStatus;
  timeline: TimelineEvent[];
}

export const WEBHOOK_FAILURES: WebhookFailure[] = [
  {
    id: 'wh-9071', provider: 'GLR Wallet Gateway', errorCode: 'HTTP 401 · AUTH_EXPIRED',
    errorMessage: 'Provider rejected the payout request — API credentials expired. All wallet payouts for GoldRush are failing.',
    retryCount: 5, maxRetries: 5, lastAttempt: '3m ago',
    campaignId: 'c-1012', campaignName: 'Cash Splash Prize Drop', type: 'prizedrop', playerId: 'PLR-3390014', brand: 'GLR',
    rewardValue: 250, severity: 'critical', status: 'failing',
    timeline: [
      { at: '18m ago', actor: 'Fulfillment engine', action: 'First delivery attempt failed', detail: 'HTTP 401 AUTH_EXPIRED', tone: 'alert' },
      { at: '3m ago', actor: 'Fulfillment engine', action: 'Retry 5/5 failed — giving up', detail: 'Credentials still invalid', tone: 'alert' },
    ],
  },
  {
    id: 'wh-9065', provider: 'Platform Bonus API — LKF', errorCode: 'HTTP 503 · UPSTREAM_UNAVAILABLE',
    errorMessage: 'LuckyForge bonus endpoint unreachable. Network jackpot rewards cannot be granted on this brand.',
    retryCount: 3, maxRetries: 8, lastAttempt: '6m ago',
    campaignId: 'c-1034', campaignName: 'Mega Network Jackpot', type: 'jackpot', playerId: 'PLR-4409981', brand: 'LKF',
    rewardValue: 500, severity: 'critical', status: 'retrying',
    timeline: [
      { at: '22m ago', actor: 'Fulfillment engine', action: 'Delivery failed', detail: 'HTTP 503 upstream unavailable', tone: 'alert' },
      { at: '6m ago', actor: 'Fulfillment engine', action: 'Retry 3/8 scheduled', detail: 'Backoff 4m', tone: 'system' },
    ],
  },
  {
    id: 'wh-9052', provider: 'VGV Wallet Gateway', errorCode: 'HTTP 422 · CURRENCY_UNMAPPED',
    errorMessage: 'EUR→local currency mapping missing for VegasVault. Rakeback payout rejected before delivery.',
    retryCount: 2, maxRetries: 5, lastAttempt: '14m ago',
    campaignId: 'c-1039', campaignName: 'High Roller Rakeback Q1', type: 'rakeback', playerId: 'PLR-4471902', brand: 'VGV',
    rewardValue: 2000, severity: 'warning', status: 'retrying',
    timeline: [
      { at: '30m ago', actor: 'Fulfillment engine', action: 'Delivery failed', detail: 'Currency mapping missing', tone: 'alert' },
      { at: '14m ago', actor: 'Fulfillment engine', action: 'Retry 2/5 failed', tone: 'system' },
    ],
  },
  {
    id: 'wh-9040', provider: 'Platform Bonus API — SPC', errorCode: 'HTTP 429 · RATE_LIMITED',
    errorMessage: 'Bonus grant throttled during peak mission completion. Requests queued for backoff retry.',
    retryCount: 1, maxRetries: 8, lastAttempt: '20m ago',
    campaignId: 'c-1042', campaignName: 'Weekend Warriors Mission', type: 'mission', playerId: 'PLR-5582177', brand: 'SPC',
    rewardValue: 25, severity: 'warning', status: 'retrying',
    timeline: [
      { at: '25m ago', actor: 'Fulfillment engine', action: 'Rate limited by provider', tone: 'alert' },
      { at: '20m ago', actor: 'Fulfillment engine', action: 'Retry 1/8 scheduled', tone: 'system' },
    ],
  },
  {
    id: 'wh-9021', provider: 'ACR Wallet Gateway', errorCode: 'HTTP 200 · OK',
    errorMessage: 'Transient timeout on first attempt; payout delivered successfully on retry.',
    retryCount: 1, maxRetries: 5, lastAttempt: '2h ago',
    campaignId: 'c-1031', campaignName: 'Slots Weekly Leaderboard', type: 'race', playerId: 'PLR-7781200', brand: 'ACR',
    rewardValue: 120, severity: 'info', status: 'resolved',
    timeline: [
      { at: '2h ago', actor: 'Fulfillment engine', action: 'First attempt timed out', tone: 'alert' },
      { at: '2h ago', actor: 'Fulfillment engine', action: 'Retry 1/5 delivered', detail: 'Payout confirmed', tone: 'system' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Audit log (sensitive actions across the hub)
// ─────────────────────────────────────────────────────────────
export type AuditAction =
  | 'approve' | 'reject' | 'changes' | 'reset' | 'hold' | 'release'
  | 'exclude' | 'escalate' | 'retry' | 'edit' | 'waive' | 'submit';

export interface SafetyAuditRecord {
  id: string;
  actor: string;
  role: string;
  action: AuditAction;
  summary: string;
  target: string;
  targetKind: 'campaign' | 'player' | 'reward' | 'webhook';
  field?: string;
  before?: string;
  after?: string;
  brand: string;
  at: string;
}

export const AUDIT_RECORDS: SafetyAuditRecord[] = [
  { id: 'au-7712', actor: 'Safety engine', role: 'System', action: 'hold', summary: 'Auto-held €2,000 rakeback payout', target: 'rw-5521', targetKind: 'reward', brand: 'VGV', at: '14 Mar · 14:02', field: 'Payout state', before: 'queued', after: 'held' },
  { id: 'au-7710', actor: 'Ravi Menon', role: 'Fraud Analyst', action: 'escalate', summary: 'Escalated collusion case to compliance', target: 'fr-8836', targetKind: 'player', brand: 'GLR', at: '14 Mar · 13:40' },
  { id: 'au-7705', actor: 'Sofia Lindqvist', role: 'Risk & Compliance', action: 'reject', summary: 'Rejected campaign — missing RG exclusions', target: 'c-1012', targetKind: 'campaign', brand: 'GLR', at: '13 Mar · 09:48', field: 'Decision', before: 'pending', after: 'rejected' },
  { id: 'au-7702', actor: 'Mara Ostheim', role: 'Retention Manager', action: 'edit', summary: 'Added "Reactivated" segment after approval', target: 'c-1042', targetKind: 'campaign', brand: 'SPC', field: 'Audience segments', before: 'Weekend players', after: 'Weekend players, Reactivated', at: '14 Mar · 08:40' },
  { id: 'au-7701', actor: 'Safety engine', role: 'System', action: 'reset', summary: 'Approval reset — sensitive field changed', target: 'c-1042', targetKind: 'campaign', brand: 'SPC', field: 'Approval state', before: 'approved', after: 'reset', at: '14 Mar · 08:40' },
  { id: 'au-7698', actor: 'Sofia Lindqvist', role: 'Risk & Compliance', action: 'changes', summary: 'Requested daily cap + jurisdiction mapping', target: 'c-1041', targetKind: 'campaign', brand: 'ACR', at: '12 Mar · 15:22' },
  { id: 'au-7690', actor: 'Sofia Lindqvist', role: 'Risk & Compliance', action: 'release', summary: 'Released held reward — false positive', target: 'fr-8801', targetKind: 'player', brand: 'BNV', field: 'Reward state', before: 'held', after: 'released', at: '13 Mar · 11:15' },
  { id: 'au-7684', actor: 'Priya Nair', role: 'Retention Manager', action: 'approve', summary: 'Approved leaderboard spot-check payout', target: 'rw-5480', targetKind: 'reward', brand: 'BNV', at: '13 Mar · 10:02' },
  { id: 'au-7676', actor: 'Dan Whitlock', role: 'Casino Manager', action: 'edit', summary: 'Added daily cap €20,000 to prize pool', target: 'c-1041', targetKind: 'campaign', brand: 'ACR', field: 'Daily cap', before: 'none', after: '€20,000', at: '12 Mar · 16:30' },
  { id: 'au-7670', actor: 'System', role: 'Fulfillment engine', action: 'retry', summary: 'Retry 5/5 failed on GLR wallet gateway', target: 'wh-9071', targetKind: 'webhook', brand: 'GLR', at: '14 Mar · 13:59' },
];

// ─────────────────────────────────────────────────────────────
// KPIs + aggregation
// ─────────────────────────────────────────────────────────────
export function severitySplitAll(reviews: Review[]): Record<Severity, number> {
  const split: Record<Severity, number> = { critical: 0, warning: 0, info: 0 };
  const bump = (s: Severity) => { split[s] += 1; };
  reviews.forEach((r) => {
    const sev = countBySeverity(r.checks);
    if (sev.blocker > 0) bump('critical');
    else if (sev.warning > 0) bump('warning');
    else bump('info');
  });
  FRAUD_CASES.forEach((f) => bump(f.severity));
  MANUAL_REWARDS.forEach((m) => bump(m.severity));
  COMPLIANCE_EXCEPTIONS.forEach((c) => bump(c.severity));
  WEBHOOK_FAILURES.forEach((w) => bump(w.severity));
  return split;
}

export function safetyKpis(reviews: Review[]) {
  const openBlockers = reviews.filter((r) => r.decision === 'blocked').length;
  const pendingApprovals = reviews.filter((r) => ['pending', 'reset'].includes(r.decision)).length;
  const fraudFlags = FRAUD_CASES.filter((f) => ['open', 'holding', 'escalated'].includes(f.status)).length;
  const manualReviews = MANUAL_REWARDS.filter((m) => ['held', 'compliance'].includes(m.status)).length;
  const failedWebhooks = WEBHOOK_FAILURES.filter((w) => w.status !== 'resolved').length;
  return { openBlockers, pendingApprovals, fraudFlags, manualReviews, failedWebhooks };
}

// severity meta for badges/dots
export const SEVERITY_META: Record<Severity, { label: string; fg: string; bg: string }> = {
  critical: { label: 'Critical', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
  warning: { label: 'Warning', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
  info: { label: 'Info', fg: 'var(--status-scheduled)', bg: 'var(--status-scheduled-bg)' },
};

// status pill meta shared across kinds
export const STATUS_META: Record<string, { label: string; fg: string; bg: string }> = {
  // fraud
  open: { label: 'Open', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
  holding: { label: 'Reward held', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
  released: { label: 'Released', fg: 'var(--success)', bg: 'var(--status-live-bg)' },
  escalated: { label: 'Escalated', fg: 'var(--status-scheduled)', bg: 'var(--status-scheduled-bg)' },
  excluded: { label: 'Player excluded', fg: 'var(--fg-secondary)', bg: 'var(--surface-3)' },
  // reward
  held: { label: 'Held', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
  approved: { label: 'Approved', fg: 'var(--success)', bg: 'var(--status-live-bg)' },
  rejected: { label: 'Rejected', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
  compliance: { label: 'With compliance', fg: 'var(--status-scheduled)', bg: 'var(--status-scheduled-bg)' },
  // exception
  resolved: { label: 'Resolved', fg: 'var(--success)', bg: 'var(--status-live-bg)' },
  waived: { label: 'Waived', fg: 'var(--fg-secondary)', bg: 'var(--surface-3)' },
  // webhook
  failing: { label: 'Failing', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
  retrying: { label: 'Retrying', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
  // loyalty
  expiring: { label: 'Expiring soon', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
};

export function statusMeta(key: string) {
  return STATUS_META[key] ?? { label: key, fg: 'var(--fg-secondary)', bg: 'var(--surface-3)' };
}

// ─────────────────────────────────────────────────────────────
// Drawer normalizers — turn any item into a DrawerModel
// ─────────────────────────────────────────────────────────────
export function reviewToDrawer(r: Review): DrawerModel {
  const sev = countBySeverity(r.checks);
  const severity: Severity = sev.blocker > 0 ? 'critical' : sev.warning > 0 ? 'warning' : 'info';
  const topBlocker = r.checks.find((c) => c.severity === 'blocker');
  const topWarn = r.checks.find((c) => c.severity === 'warning');
  return {
    kind: 'review', kindLabel: 'Campaign review', id: r.id,
    title: r.name, subtitle: `${getType(r.type).name} · ${r.id}`,
    severity, statusLabel: r.decision,
    riskReason: topBlocker?.detail ?? topWarn?.detail ?? 'All safety checks passed. Ready for a launch decision.',
    facts: [
      { label: 'Brand scope', value: r.brandScope === 'all' ? 'Network · all brands' : r.brands.join(' · ') },
      { label: 'Budget exposure', value: fmtMoney(r.projectedSpend, r.currency), mono: true, tone: r.projectedSpend / r.budgetCap >= 0.9 ? 'warning' : 'default' },
      { label: 'Budget cap', value: fmtMoney(r.budgetCap, r.currency), mono: true },
      { label: 'Requester', value: `${r.submittedBy} · ${r.submittedByRole}` },
      { label: 'Blockers', value: String(sev.blocker), tone: sev.blocker ? 'danger' : 'default' },
      { label: 'Warnings', value: String(sev.warning), tone: sev.warning ? 'warning' : 'default' },
    ],
    related: [
      { kind: 'campaign', label: 'Campaign', value: r.name },
      { kind: 'player', label: 'Audience', value: `${r.audienceSize.toLocaleString()} players` },
    ],
    timeline: r.audit.map((a) => ({ at: a.at, actor: a.actor, action: a.action, detail: a.detail, tone: a.kind === 'system' ? 'system' : 'human' })),
    actions: r.decision === 'blocked'
      ? [{ id: 'view', label: 'Open full review', tone: 'primary' }, { id: 'changes', label: 'Request changes', tone: 'default' }]
      : ['pending', 'reset'].includes(r.decision)
      ? [{ id: 'approve', label: 'Approve', tone: 'primary' }, { id: 'changes', label: 'Request changes', tone: 'warning' }, { id: 'reject', label: 'Reject', tone: 'danger' }]
      : [{ id: 'view', label: 'Open full review', tone: 'primary' }],
    openCampaignId: r.campaignId,
    fullReviewId: r.id,
  };
}

export function fraudToDrawer(f: FraudCase): DrawerModel {
  return {
    kind: 'fraud', kindLabel: 'Fraud & abuse case', id: f.id,
    title: `${f.playerAlias} · ${f.triggerReason}`, subtitle: `${f.playerId} · ${f.brand} · ${f.id}`,
    severity: f.severity, statusLabel: f.status,
    riskReason: f.detail,
    facts: [
      { label: 'Reward at risk', value: f.rewardValue > 0 ? fmtMoney(f.rewardValue, EUR) : '—', mono: true, tone: f.rewardValue > 0 ? 'danger' : 'default' },
      { label: 'Velocity signal', value: f.velocitySignal, tone: 'warning' },
      { label: 'Risk score', value: `${f.velocityScore}/100`, mono: true, tone: f.velocityScore >= 80 ? 'danger' : 'warning' },
      { label: 'Account age', value: f.accountAge },
      { label: 'Linked accounts', value: String(f.linkedAccounts), mono: true, tone: f.linkedAccounts > 0 ? 'warning' : 'default' },
      { label: 'Campaign', value: getType(f.type).name },
    ],
    related: [
      { kind: 'player', label: 'Player', value: `${f.playerAlias} (${f.playerId})` },
      { kind: 'campaign', label: 'Campaign', value: f.campaignName },
    ],
    timeline: f.timeline,
    actions: [
      { id: 'hold', label: 'Hold reward', tone: 'warning' },
      { id: 'release', label: 'Release reward', tone: 'primary' },
      { id: 'exclude', label: 'Exclude player', tone: 'danger' },
      { id: 'escalate', label: 'Escalate', tone: 'default' },
    ],
    openCampaignId: f.campaignId,
  };
}

export function rewardToDrawer(m: ManualReward): DrawerModel {
  return {
    kind: 'reward', kindLabel: 'Manual reward review', id: m.id,
    title: `${m.rewardType} · ${fmtMoney(m.value, EUR)}`, subtitle: `${m.playerId} · ${m.brand} · ${m.id}`,
    severity: m.severity, statusLabel: m.status,
    riskReason: m.detail,
    facts: [
      { label: 'Reward value', value: fmtMoney(m.value, EUR), mono: true, tone: m.value >= 1000 ? 'warning' : 'default' },
      { label: 'Fulfillment', value: m.fulfillmentMethod },
      { label: 'Route health', value: m.fulfillmentHealth, tone: m.fulfillmentHealth === 'error' ? 'danger' : m.fulfillmentHealth === 'degraded' ? 'warning' : 'success' },
      { label: 'Hold reason', value: m.holdReason, tone: 'warning' },
      { label: 'Campaign', value: getType(m.type).name },
      { label: 'Held', value: m.heldAt },
    ],
    related: [
      { kind: 'reward', label: 'Reward', value: `${m.rewardType} · ${m.id}` },
      { kind: 'player', label: 'Player', value: m.playerId },
      { kind: 'campaign', label: 'Campaign', value: m.campaignName },
    ],
    timeline: m.timeline,
    actions: [
      { id: 'approve', label: 'Approve payout', tone: 'primary' },
      { id: 'reject', label: 'Reject payout', tone: 'danger' },
      { id: 'compliance', label: 'Send to compliance', tone: 'default' },
    ],
    openCampaignId: m.campaignId,
  };
}

export function exceptionToDrawer(c: ComplianceException): DrawerModel {
  return {
    kind: 'exception', kindLabel: EXCEPTION_KIND_LABEL[c.kind], id: c.id,
    title: c.title, subtitle: `${c.brand} · ${c.campaignName} · ${c.id}`,
    severity: c.severity, statusLabel: c.status,
    riskReason: c.detail,
    facts: [
      { label: 'Exception type', value: EXCEPTION_KIND_LABEL[c.kind] },
      { label: 'Brand', value: c.brand },
      { label: 'Campaign', value: getType(c.type).name },
      { label: 'Owner', value: c.owner },
      { label: 'Raised', value: c.raisedAt },
      ...(c.playerId ? [{ label: 'Player', value: c.playerId, mono: true } as DrawerFact] : []),
    ],
    related: [
      { kind: 'campaign', label: 'Campaign', value: c.campaignName },
      ...(c.playerId ? [{ kind: 'player', label: 'Player', value: c.playerId } as DrawerRelated] : []),
    ],
    timeline: c.timeline,
    actions: c.status === 'open'
      ? [{ id: 'resolve', label: 'Mark resolved', tone: 'primary' }, { id: 'waive', label: 'Waive exception', tone: 'warning' }, { id: 'block', label: 'Block campaign', tone: 'danger' }]
      : [{ id: 'view', label: 'Open campaign', tone: 'primary' }],
    openCampaignId: c.campaignId,
  };
}

const AUDIT_RELATED_KIND: Record<SafetyAuditRecord['targetKind'], DrawerRelated['kind']> = {
  campaign: 'campaign', player: 'player', reward: 'reward', webhook: 'provider',
};

export function auditToDrawer(a: SafetyAuditRecord): DrawerModel {
  const isCampaign = a.targetKind === 'campaign';
  return {
    kind: 'audit', kindLabel: `Audit · ${a.role}`, id: a.id,
    title: a.summary, subtitle: `${a.target} · ${a.brand} · ${a.id}`,
    severity: 'info', statusLabel: 'Logged',
    riskReason: a.field
      ? `${a.actor} changed ${a.field} from "${a.before}" to "${a.after}" on ${a.target}.`
      : `${a.actor} performed "${a.action}" on ${a.target}.`,
    facts: [
      { label: 'Actor', value: a.actor },
      { label: 'Role', value: a.role },
      { label: 'Action', value: a.action },
      { label: 'Target', value: a.target, mono: true },
      ...(a.field ? [
        { label: 'Field', value: a.field } as DrawerFact,
        { label: 'Before', value: a.before ?? '—', mono: true, tone: 'default' } as DrawerFact,
        { label: 'After', value: a.after ?? '—', mono: true, tone: 'success' } as DrawerFact,
      ] : []),
      { label: 'When', value: a.at, mono: true },
    ],
    related: [
      { kind: AUDIT_RELATED_KIND[a.targetKind], label: a.targetKind.charAt(0).toUpperCase() + a.targetKind.slice(1), value: a.target },
    ],
    timeline: [
      { at: a.at, actor: a.actor, action: a.summary, detail: a.field ? `${a.field}: ${a.before} → ${a.after}` : undefined, tone: a.actor.includes('engine') || a.actor === 'System' ? 'system' : 'human' },
    ],
    actions: isCampaign ? [{ id: 'view', label: 'Open campaign', tone: 'primary' }] : [],
    openCampaignId: isCampaign ? a.target : undefined,
  };
}

export function webhookToDrawer(w: WebhookFailure): DrawerModel {
  return {
    kind: 'webhook', kindLabel: 'Fulfillment failure', id: w.id,
    title: `${w.provider}`, subtitle: `${w.errorCode} · ${w.id}`,
    severity: w.severity, statusLabel: w.status,
    riskReason: w.errorMessage,
    facts: [
      { label: 'Error code', value: w.errorCode, mono: true, tone: 'danger' },
      { label: 'Retries', value: `${w.retryCount} / ${w.maxRetries}`, mono: true, tone: w.retryCount >= w.maxRetries ? 'danger' : 'warning' },
      { label: 'Last attempt', value: w.lastAttempt },
      { label: 'Reward held', value: fmtMoney(w.rewardValue, EUR), mono: true },
      { label: 'Campaign', value: getType(w.type).name },
      { label: 'Affected player', value: w.playerId, mono: true },
    ],
    related: [
      { kind: 'provider', label: 'Provider', value: w.provider },
      { kind: 'campaign', label: 'Campaign', value: w.campaignName },
      { kind: 'player', label: 'Player', value: w.playerId },
    ],
    timeline: w.timeline,
    actions: w.status === 'resolved'
      ? [{ id: 'integration', label: 'Open integration', tone: 'primary' }]
      : [{ id: 'retry', label: 'Retry now', tone: 'primary' }, { id: 'resolve', label: 'Mark resolved', tone: 'default' }, { id: 'integration', label: 'Open integration', tone: 'default' }],
    openCampaignId: w.campaignId,
  };
}
