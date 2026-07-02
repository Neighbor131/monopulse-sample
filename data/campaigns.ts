import {
  Target,
  Award,
  Flag,
  Gauge,
  Flame,
  Percent,
  Gift,
  Ticket,
  Dices,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Status model — universal lifecycle groups + module-specific states
// ─────────────────────────────────────────────────────────────

export type LifecycleGroup = 'setup' | 'scheduled' | 'active' | 'winding_down' | 'closed';

export type CampaignStatus =
  // universal
  | 'draft'
  | 'pending'
  | 'scheduled'
  | 'live'
  | 'paused'
  | 'completed'
  | 'failed'
  // module-specific
  | 'pending_seed'
  | 'standby'
  | 'locked'
  | 'grace_period'
  | 'final_day'
  | 'drawing'
  | 'distributing'
  | 'settling'
  | 'void'
  | 'expired';

export interface StatusMeta {
  id: CampaignStatus;
  label: string;
  group: LifecycleGroup;
  scope: 'universal' | 'module';
  desc: string;
}

export const STATUS_CATALOG: Record<CampaignStatus, StatusMeta> = {
  // universal
  draft: { id: 'draft', label: 'Draft', group: 'setup', scope: 'universal', desc: 'Being configured, not yet submitted.' },
  pending: { id: 'pending', label: 'Pending approval', group: 'setup', scope: 'universal', desc: 'Submitted, awaiting reviewer decision.' },
  scheduled: { id: 'scheduled', label: 'Scheduled', group: 'scheduled', scope: 'universal', desc: 'Approved and waiting for its start time.' },
  live: { id: 'live', label: 'Live', group: 'active', scope: 'universal', desc: 'Running and granting rewards.' },
  paused: { id: 'paused', label: 'Paused', group: 'active', scope: 'universal', desc: 'Temporarily halted; can be resumed.' },
  completed: { id: 'completed', label: 'Completed', group: 'closed', scope: 'universal', desc: 'Ran to end; all rewards settled.' },
  failed: { id: 'failed', label: 'Failed', group: 'closed', scope: 'universal', desc: 'Halted by a fatal error.' },
  // module-specific
  pending_seed: { id: 'pending_seed', label: 'Pending seed', group: 'scheduled', scope: 'module', desc: 'Jackpot pool awaiting its seed value before it can run.' },
  standby: { id: 'standby', label: 'Standby', group: 'scheduled', scope: 'module', desc: 'Armed and waiting for its trigger window (Prize Drops, Races).' },
  locked: { id: 'locked', label: 'Locked', group: 'active', scope: 'module', desc: 'Entries closed; outcome not yet resolved (Raffles, Survival).' },
  grace_period: { id: 'grace_period', label: 'Grace period', group: 'active', scope: 'module', desc: 'Past end time, still accepting late-settling events.' },
  final_day: { id: 'final_day', label: 'Final day', group: 'active', scope: 'module', desc: 'Last active day — heightened monitoring.' },
  drawing: { id: 'drawing', label: 'Drawing', group: 'winding_down', scope: 'module', desc: 'Selecting winners (Raffles, Prize Drops).' },
  distributing: { id: 'distributing', label: 'Distributing', group: 'winding_down', scope: 'module', desc: 'Rewards are being granted to winners.' },
  settling: { id: 'settling', label: 'Settling', group: 'winding_down', scope: 'module', desc: 'Reconciling reward cost and payouts.' },
  void: { id: 'void', label: 'Void', group: 'closed', scope: 'module', desc: 'Cancelled and invalidated; no payouts.' },
  expired: { id: 'expired', label: 'Expired', group: 'closed', scope: 'module', desc: 'Ended without meeting trigger conditions.' },
};

// Which module-specific statuses each campaign type can move through.
export const MODULE_STATUSES: Partial<Record<CampaignTypeId, CampaignStatus[]>> = {
  jackpot: ['pending_seed', 'standby', 'grace_period', 'settling', 'void'],
  prizedrop: ['standby', 'locked', 'drawing', 'distributing', 'expired', 'void'],
  raffle: ['locked', 'drawing', 'distributing', 'settling', 'void'],
  race: ['standby', 'final_day', 'settling', 'expired'],
  survival: ['standby', 'locked', 'final_day', 'settling', 'void'],
  velocity: ['standby', 'final_day', 'expired'],
  mission: ['grace_period', 'expired'],
};

// ─────────────────────────────────────────────────────────────
// Campaign types + subtypes
// ─────────────────────────────────────────────────────────────

export type CampaignTypeId =
  | 'mission'
  | 'race'
  | 'prizedrop'
  | 'raffle'
  | 'jackpot'
  | 'survival'
  | 'velocity'
  | 'achievement'
  | 'rakeback';

export type RiskLevel = 'none' | 'warning' | 'blocked';

export type TypeGroup = 'engagement' | 'competition' | 'monetary' | 'randomized';

export interface CampaignSubtype {
  id: string;
  name: string;
  desc: string;
}

export interface CampaignType {
  id: CampaignTypeId;
  name: string;
  group: TypeGroup;
  icon: LucideIcon;
  description: string;
  bestFor: string;
  complexity: 'Low' | 'Medium' | 'High';
  steps: string[];
  subtypes?: CampaignSubtype[];
}

export interface Brand {
  code: string;
  name: string;
}

export interface Campaign {
  id: string;
  name: string;
  playerTitle: string;
  type: CampaignTypeId;
  status: CampaignStatus;
  brandScope: 'brand_only' | 'network';
  brands: string[];
  audienceSize: number;
  budgetTotal: number;
  budgetUsed: number;
  rewardCost: number;
  owner: string;
  ownerRole: string;
  risk: RiskLevel;
  riskNote?: string;
  updatedAt: string;
  currency: string;
}

export const ORG = 'NovaBet Group';

export const BRANDS: Brand[] = [
  { code: 'ACR', name: 'AceRoyale' },
  { code: 'SPC', name: 'SpinCity' },
  { code: 'BNV', name: 'BetNova' },
  { code: 'LKF', name: 'LuckyForge' },
  { code: 'VGV', name: 'VegasVault' },
  { code: 'GLR', name: 'GoldRush' },
];

export const CAMPAIGN_TYPES: CampaignType[] = [
  {
    id: 'mission',
    name: 'Missions & Quests',
    group: 'engagement',
    icon: Target,
    description: 'Goal-based tasks that reward players for completing objectives over a window.',
    bestFor: 'Repeat sessions & habit loops',
    complexity: 'Medium',
    steps: ['Audience', 'Rules', 'Rewards', 'Budget'],
    subtypes: [
      { id: 'daily_quest', name: 'Daily Quest', desc: 'Resets every day; short single-session goals.' },
      { id: 'weekly_quest', name: 'Weekly Quest', desc: 'Longer goals that reset each week.' },
      { id: 'linked_mission', name: 'Linked Mission', desc: 'Sequential quests where each unlocks the next.' },
      { id: 'race_mission', name: 'Race Mission', desc: 'Mission scored competitively against other players.' },
    ],
  },
  {
    id: 'velocity',
    name: 'Velocity Milestones',
    group: 'engagement',
    icon: Gauge,
    description: 'Reward players for hitting activity thresholds within a countdown window.',
    bestFor: 'Bursts of activity & urgency',
    complexity: 'Medium',
    steps: ['Audience', 'Rules', 'Rewards', 'Budget'],
    subtypes: [
      { id: 'event_count', name: 'Event Count', desc: 'Hit N qualifying events before the timer ends.' },
      { id: 'volume_target', name: 'Volume Target', desc: 'Reach a wager / stake volume threshold.' },
      { id: 'mystery', name: 'Mystery', desc: 'Hidden target revealed only on completion.' },
      { id: 'frenzy_countdown', name: 'Frenzy Countdown', desc: 'Escalating rewards as the countdown shortens.' },
    ],
  },
  {
    id: 'achievement',
    name: 'Achievements',
    group: 'engagement',
    icon: Award,
    description: 'Unlockable badges and milestones across casino & sports, incl. hidden and seasonal.',
    bestFor: 'Long-term progression',
    complexity: 'Low',
    steps: ['Audience', 'Unlock rules', 'Rewards', 'Budget'],
  },
  {
    id: 'race',
    name: 'Races',
    group: 'competition',
    icon: Flag,
    description: 'Time-boxed competitions where players climb ranks by wager or win metrics.',
    bestFor: 'Activity spikes & prize hype',
    complexity: 'High',
    steps: ['Audience', 'Scoring', 'Prize pool', 'Budget'],
    subtypes: [
      { id: 'sprint_race', name: 'Sprint Race', desc: 'Short, high-intensity race over hours.' },
      { id: 'lap_race', name: 'Lap Race', desc: 'Multiple scored laps with interim winners.' },
      { id: 'multiplier_sprint', name: 'Multiplier Sprint', desc: 'Ranked by best win multiplier, not volume.' },
      { id: 'marathon_race', name: 'Marathon Race', desc: 'Sustained multi-day leaderboard.' },
    ],
  },
  {
    id: 'survival',
    name: 'Survival Mode',
    group: 'competition',
    icon: Flame,
    description: 'Elimination-style competition where players drop out until a pool of survivors remains.',
    bestFor: 'High-engagement events',
    complexity: 'High',
    steps: ['Audience', 'Survival rules', 'Prize pool', 'Budget'],
    subtypes: [
      { id: 'guaranteed_pool', name: 'Guaranteed Pool', desc: 'Operator-funded prize pool, fixed value.' },
      { id: 'entry_fee_pool', name: 'Entry Fee Pool', desc: 'Pool funded by player entry contributions.' },
      { id: 'hybrid_pool', name: 'Hybrid Pool', desc: 'Guaranteed floor topped up by entries.' },
    ],
  },
  {
    id: 'rakeback',
    name: 'Rakeback / Cashback',
    group: 'monetary',
    icon: Percent,
    description: 'Return a share of losses or wagering, targetable by game, studio or route.',
    bestFor: 'VIP retention & loss recovery',
    complexity: 'High',
    steps: ['Audience', 'Rate matrix', 'Fulfillment', 'Budget'],
  },
  {
    id: 'prizedrop',
    name: 'Prize Drops',
    group: 'randomized',
    icon: Gift,
    description: 'Scheduled or triggered random rewards dropped to eligible players.',
    bestFor: 'Surprise & delight moments',
    complexity: 'Medium',
    steps: ['Audience', 'Drop logic', 'Rewards', 'Budget'],
    subtypes: [
      { id: 'time_slot', name: 'Time-Slot', desc: 'Drops fire at scheduled time windows.' },
      { id: 'spin_count', name: 'Spin-Count', desc: 'Drops triggered every N qualifying spins.' },
      { id: 'sports_event_window', name: 'Sports Event Window', desc: 'Drops during a specific sports event.' },
      { id: 'sports_bet_count', name: 'Sports Bet Count', desc: 'Drops triggered by number of bets placed.' },
    ],
  },
  {
    id: 'raffle',
    name: 'Raffles',
    group: 'randomized',
    icon: Ticket,
    description: 'Players earn tickets toward a pooled draw with one or more winners.',
    bestFor: 'Big prizes on a fixed budget',
    complexity: 'Medium',
    steps: ['Audience', 'Ticket rules', 'Prize', 'Budget'],
    subtypes: [
      { id: 'standard', name: 'Standard', desc: 'Single draw at campaign end.' },
      { id: 'recurring', name: 'Recurring', desc: 'Repeats on a fixed cadence.' },
      { id: 'multi_draw', name: 'Multi-Draw', desc: 'Several draws across the campaign window.' },
      { id: 'golden_ticket', name: 'Golden Ticket', desc: 'Rare instant-win ticket alongside the pool.' },
    ],
  },
  {
    id: 'jackpot',
    name: 'Jackpots',
    group: 'randomized',
    icon: Dices,
    description: 'Network-wide pooled prize that grows until it is won across brands.',
    bestFor: 'Cross-brand scale & headlines',
    complexity: 'High',
    steps: ['Brand pool', 'Trigger', 'Seed & cap', 'Budget'],
    subtypes: [
      { id: 'progressive', name: 'Progressive', desc: 'Grows continuously until won.' },
      { id: 'must_drop_value', name: 'Must-Drop Value', desc: 'Guaranteed to drop before a value ceiling.' },
      { id: 'must_drop_time', name: 'Must-Drop Time', desc: 'Guaranteed to drop before a deadline.' },
      { id: 'community_split', name: 'Community Split', desc: 'Winnings split across a group of players.' },
    ],
  },
];

export const TYPE_GROUPS: { id: TypeGroup; label: string; hint: string }[] = [
  { id: 'engagement', label: 'Engagement', hint: 'Build habits, progression and repeat sessions' },
  { id: 'competition', label: 'Competition', hint: 'Rank players and reward performance' },
  { id: 'monetary', label: 'Monetary return', hint: 'Return value as loss or wager rebates' },
  { id: 'randomized', label: 'Randomized rewards', hint: 'Chance-based rewards and pooled prizes' },
];

export function getType(id: CampaignTypeId): CampaignType {
  return CAMPAIGN_TYPES.find((t) => t.id === id) as CampaignType;
}

export function getSubtypes(id: CampaignTypeId | null): CampaignSubtype[] {
  if (!id) return [];
  return getType(id)?.subtypes ?? [];
}

export function getSubtype(typeId: CampaignTypeId | null, subtypeId: string): CampaignSubtype | undefined {
  return getSubtypes(typeId).find((s) => s.id === subtypeId);
}

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'c-1042',
    name: 'Weekend Warriors Mission',
    playerTitle: 'Complete 3 quests, earn boosts',
    type: 'mission',
    status: 'live',
    brandScope: 'brand_only',
    brands: ['ACR', 'SPC'],
    audienceSize: 48200,
    budgetTotal: 25000,
    budgetUsed: 14320,
    rewardCost: 12100,
    owner: 'Mara Ostheim',
    ownerRole: 'Retention Manager',
    risk: 'none',
    updatedAt: '2h ago',
    currency: 'EUR',
  },
  {
    id: 'c-1041',
    name: 'Champions League Race',
    playerTitle: 'Climb the ranks, win the pool',
    type: 'race',
    status: 'final_day',
    brandScope: 'network',
    brands: ['ACR', 'BNV', 'VGV'],
    audienceSize: 92500,
    budgetTotal: 80000,
    budgetUsed: 61200,
    rewardCost: 58400,
    owner: 'Dan Whitlock',
    ownerRole: 'Casino Manager',
    risk: 'warning',
    riskNote: 'Budget 76% consumed with 4 days remaining',
    updatedAt: '20m ago',
    currency: 'EUR',
  },
  {
    id: 'c-1039',
    name: 'High Roller Rakeback Q1',
    playerTitle: '12% cashback on net losses',
    type: 'rakeback',
    status: 'pending',
    brandScope: 'brand_only',
    brands: ['VGV'],
    audienceSize: 3100,
    budgetTotal: 120000,
    budgetUsed: 0,
    rewardCost: 0,
    owner: 'Priya Nair',
    ownerRole: 'Retention Manager',
    risk: 'warning',
    riskNote: 'Reward cap exceeds tier threshold — approval required',
    updatedAt: '1h ago',
    currency: 'EUR',
  },
  {
    id: 'c-1038',
    name: 'Lunar New Year Prize Drop',
    playerTitle: 'Random gold envelopes all week',
    type: 'prizedrop',
    status: 'standby',
    brandScope: 'network',
    brands: ['ACR', 'SPC', 'BNV', 'LKF', 'VGV', 'GLR'],
    audienceSize: 210400,
    budgetTotal: 45000,
    budgetUsed: 0,
    rewardCost: 0,
    owner: 'Tomas Reuter',
    ownerRole: 'Casino Manager',
    risk: 'none',
    updatedAt: 'yesterday',
    currency: 'EUR',
  },
  {
    id: 'c-1035',
    name: 'Bronze Climb Achievement',
    playerTitle: 'Unlock your first tier badge',
    type: 'achievement',
    status: 'draft',
    brandScope: 'brand_only',
    brands: ['SPC'],
    audienceSize: 0,
    budgetTotal: 8000,
    budgetUsed: 0,
    rewardCost: 0,
    owner: 'Mara Ostheim',
    ownerRole: 'Retention Manager',
    risk: 'none',
    updatedAt: '3d ago',
    currency: 'EUR',
  },
  {
    id: 'c-1034',
    name: 'Mega Network Jackpot',
    playerTitle: 'One pool. Every brand. One winner.',
    type: 'jackpot',
    status: 'pending_seed',
    brandScope: 'network',
    brands: ['ACR', 'SPC', 'BNV', 'LKF', 'VGV', 'GLR'],
    audienceSize: 340000,
    budgetTotal: 250000,
    budgetUsed: 188000,
    rewardCost: 180000,
    owner: 'Dan Whitlock',
    ownerRole: 'Casino Manager',
    risk: 'warning',
    riskNote: 'Jurisdiction mismatch on 2 pooled brands',
    updatedAt: '5m ago',
    currency: 'EUR',
  },
  {
    id: 'c-1031',
    name: 'Slots Weekly Race',
    playerTitle: 'Top 50 spinners share the prize',
    type: 'race',
    status: 'live',
    brandScope: 'brand_only',
    brands: ['SPC', 'LKF'],
    audienceSize: 61000,
    budgetTotal: 30000,
    budgetUsed: 22400,
    rewardCost: 21200,
    owner: 'Priya Nair',
    ownerRole: 'Retention Manager',
    risk: 'none',
    updatedAt: '40m ago',
    currency: 'EUR',
  },
  {
    id: 'c-1029',
    name: 'Last Player Standing',
    playerTitle: 'Survive to the final 100',
    type: 'survival',
    status: 'locked',
    brandScope: 'brand_only',
    brands: ['ACR'],
    audienceSize: 24000,
    budgetTotal: 40000,
    budgetUsed: 40000,
    rewardCost: 38000,
    owner: 'Dan Whitlock',
    ownerRole: 'Casino Manager',
    risk: 'none',
    updatedAt: '1h ago',
    currency: 'EUR',
  },
  {
    id: 'c-1028',
    name: 'Deposit Streak Mission',
    playerTitle: 'Deposit 5 days in a row',
    type: 'mission',
    status: 'paused',
    brandScope: 'brand_only',
    brands: ['BNV'],
    audienceSize: 18700,
    budgetTotal: 15000,
    budgetUsed: 6100,
    rewardCost: 5900,
    owner: 'Tomas Reuter',
    ownerRole: 'Casino Manager',
    risk: 'none',
    updatedAt: '6h ago',
    currency: 'EUR',
  },
  {
    id: 'c-1024',
    name: 'Turbo Spin Velocity',
    playerTitle: 'Hit 500 spins before the timer ends',
    type: 'velocity',
    status: 'standby',
    brandScope: 'brand_only',
    brands: ['SPC'],
    audienceSize: 33000,
    budgetTotal: 18000,
    budgetUsed: 0,
    rewardCost: 0,
    owner: 'Priya Nair',
    ownerRole: 'Retention Manager',
    risk: 'none',
    updatedAt: '4h ago',
    currency: 'EUR',
  },
  {
    id: 'c-1019',
    name: "St. Patrick's Raffle",
    playerTitle: 'Earn tickets for the €20k draw',
    type: 'raffle',
    status: 'drawing',
    brandScope: 'network',
    brands: ['ACR', 'SPC', 'LKF'],
    audienceSize: 128000,
    budgetTotal: 20000,
    budgetUsed: 19850,
    rewardCost: 19850,
    owner: 'Mara Ostheim',
    ownerRole: 'Retention Manager',
    risk: 'none',
    updatedAt: '12 Mar',
    currency: 'EUR',
  },
  {
    id: 'c-1016',
    name: 'VIP Cashback Boost',
    playerTitle: 'Double cashback this weekend',
    type: 'rakeback',
    status: 'failed',
    brandScope: 'brand_only',
    brands: ['VGV', 'GLR'],
    audienceSize: 890,
    budgetTotal: 60000,
    budgetUsed: 0,
    rewardCost: 0,
    owner: 'Dan Whitlock',
    ownerRole: 'Casino Manager',
    risk: 'blocked',
    riskNote: 'Fulfillment integration returned errors on 2 brands',
    updatedAt: '3h ago',
    currency: 'EUR',
  },
  {
    id: 'c-1012',
    name: 'Cash Splash Prize Drop',
    playerTitle: 'Surprise cash drops on slots',
    type: 'prizedrop',
    status: 'draft',
    brandScope: 'brand_only',
    brands: ['GLR'],
    audienceSize: 0,
    budgetTotal: 12000,
    budgetUsed: 0,
    rewardCost: 0,
    owner: 'Priya Nair',
    ownerRole: 'Retention Manager',
    risk: 'blocked',
    riskNote: 'Responsible-gambling exclusions not configured',
    updatedAt: '1d ago',
    currency: 'EUR',
  },
];

export function fmtMoney(n: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtNum(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
