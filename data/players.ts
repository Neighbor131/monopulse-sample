import type { TierColor } from './loyalty';

// ─────────────────────────────────────────────────────────────
// Status / flag vocabularies
// ─────────────────────────────────────────────────────────────
export type PlayerStatus = 'active' | 'dormant' | 'self_excluded' | 'closed';
export type RiskFlag = 'clear' | 'watch' | 'flagged';
export type KycStatus = 'verified' | 'pending' | 'review' | 'expired';
export type RgStatus = 'ok' | 'monitoring' | 'cooldown' | 'self_excluded';

interface PillMeta { label: string; fg: string; bg: string }

export const PLAYER_STATUS_META: Record<PlayerStatus, PillMeta> = {
  active: { label: 'Active', fg: 'var(--success)', bg: 'var(--status-live-bg)' },
  dormant: { label: 'Dormant', fg: 'var(--fg-muted)', bg: 'var(--surface-3)' },
  self_excluded: { label: 'Self-excluded', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
  closed: { label: 'Closed', fg: 'var(--fg-muted)', bg: 'var(--surface-3)' },
};
export const RISK_META: Record<RiskFlag, PillMeta> = {
  clear: { label: 'Clear', fg: 'var(--success)', bg: 'var(--status-live-bg)' },
  watch: { label: 'Watch', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
  flagged: { label: 'Flagged', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
};
export const KYC_META: Record<KycStatus, PillMeta> = {
  verified: { label: 'Verified', fg: 'var(--success)', bg: 'var(--status-live-bg)' },
  pending: { label: 'Pending', fg: 'var(--status-scheduled)', bg: 'var(--surface-3)' },
  review: { label: 'In review', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
  expired: { label: 'Expired', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
};
export const RG_META: Record<RgStatus, PillMeta> = {
  ok: { label: 'No concerns', fg: 'var(--success)', bg: 'var(--status-live-bg)' },
  monitoring: { label: 'Monitoring', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
  cooldown: { label: 'Cool-off', fg: 'var(--status-scheduled)', bg: 'var(--surface-3)' },
  self_excluded: { label: 'Self-excluded', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
};

export const COUNTRIES = ['Ireland', 'Canada', 'Germany', 'Finland', 'New Zealand', 'Norway', 'Ontario (CA)'];
export const PLAYER_SEGMENTS = ['New depositors', 'Reactivated', 'High rollers', 'Weekend players', 'Sports crossovers', 'Dormant 30d', 'VIP watchlist'];

// ─────────────────────────────────────────────────────────────
// Player model
// ─────────────────────────────────────────────────────────────
export interface PlayerActivity { at: string; kind: 'deposit' | 'wager' | 'reward' | 'tier' | 'login' | 'risk' | 'withdrawal'; label: string; detail: string; amount?: string }
export interface PlayerWarning { level: 'critical' | 'warning'; title: string; detail: string }
export interface PlayerMetrics { deposits: number; withdrawals: number; turnover: number; ggr: number; ngr: number; ltv: number; rewardCost: number; cashbackLiability: number }

export interface Player {
  id: string;
  externalId: string;      // platform / PAM id
  alias: string;
  emailHash: string;
  brand: string;
  country: string;
  jurisdiction: string;
  tier: string;
  tierColor: TierColor;
  status: PlayerStatus;
  risk: RiskFlag;
  kyc: KycStatus;
  rg: RgStatus;
  vip: boolean;
  segments: string[];
  activeCampaigns: string[];
  lastActivity: string;
  joined: string;
  accountManager?: string;
  metrics: PlayerMetrics;
  activity: PlayerActivity[];
  warnings: PlayerWarning[];
  upcomingTierChange?: { direction: 'up' | 'down'; from: string; to: string; when: string; reason: string };
  eligibleCampaign?: { name: string; reason: string };
}

export const PLAYERS: Player[] = [
  {
    id: 'PLR-88213', externalId: 'PAM-VGV-4471209', alias: 'Nightfall_92', emailHash: 'a4f…9c2', brand: 'VGV', country: 'Finland', jurisdiction: 'MGA',
    tier: 'Diamond', tierColor: 'diamond', status: 'active', risk: 'watch', kyc: 'verified', rg: 'monitoring', vip: true,
    segments: ['High rollers', 'VIP watchlist'], activeCampaigns: ['VGV VIP Club', 'High-Value Reactivation'], lastActivity: '12 min ago', joined: 'Apr 2023', accountManager: 'Sofia Lindqvist',
    metrics: { deposits: 486000, withdrawals: 312000, turnover: 4120000, ggr: 214000, ngr: 174000, ltv: 174000, rewardCost: 38400, cashbackLiability: 5200 },
    activity: [
      { at: '12 min ago', kind: 'wager', label: 'Live casino session', detail: 'Evolution · 2h 14m', amount: '€42,000 staked' },
      { at: '2h ago', kind: 'deposit', label: 'Deposit', detail: 'Visa ••41', amount: '€8,000' },
      { at: 'Yesterday', kind: 'reward', label: 'Weekly cashback paid', detail: 'VGV VIP Club · 18%', amount: '€1,240' },
      { at: '2 Mar', kind: 'tier', label: 'Tier override applied', detail: 'Platinum → Diamond (VIP nomination)' },
    ],
    warnings: [
      { level: 'warning', title: 'Deposit velocity above baseline', detail: 'Deposits up 220% vs 30-day average — flagged to RG for affordability review.' },
    ],
    upcomingTierChange: { direction: 'up', from: 'Diamond', to: 'Elite', when: 'pending approval', reason: 'Committee nomination — €280k NGR YTD' },
    eligibleCampaign: { name: 'Q2 High-Roller Rakeback', reason: 'Matches High rollers segment · Diamond tier' },
  },
  {
    id: 'PLR-71190', externalId: 'PAM-VGV-4419087', alias: 'HighRoller_004', emailHash: 'b1c…7e0', brand: 'VGV', country: 'Germany', jurisdiction: 'MGA',
    tier: 'Diamond', tierColor: 'diamond', status: 'active', risk: 'clear', kyc: 'verified', rg: 'ok', vip: true,
    segments: ['High rollers'], activeCampaigns: ['VGV VIP Club'], lastActivity: '1h ago', joined: 'Jan 2022', accountManager: 'Sofia Lindqvist',
    metrics: { deposits: 612000, withdrawals: 540000, turnover: 5890000, ggr: 188000, ngr: 156000, ltv: 156000, rewardCost: 44100, cashbackLiability: 7800 },
    activity: [
      { at: '1h ago', kind: 'withdrawal', label: 'Withdrawal approved', detail: 'Priority VIP · bank transfer', amount: '€22,000' },
      { at: '3h ago', kind: 'wager', label: 'Blackjack session', detail: 'Evolution', amount: '€61,000 staked' },
      { at: '18 Feb', kind: 'reward', label: 'Custom cashback override', detail: '20% (tier default 18%)' },
    ],
    warnings: [],
    eligibleCampaign: { name: 'Q2 High-Roller Rakeback', reason: 'Matches High rollers segment · Diamond tier' },
  },
  {
    id: 'PLR-51043', externalId: 'PAM-BNV-2290114', alias: 'SilentBet88', emailHash: 'c9d…1a4', brand: 'BNV', country: 'Ireland', jurisdiction: 'UKGC',
    tier: 'Gold', tierColor: 'gold', status: 'active', risk: 'flagged', kyc: 'review', rg: 'cooldown', vip: false,
    segments: ['Sports crossovers'], activeCampaigns: ['Sportsbook Loyalty Tiers'], lastActivity: '4h ago', joined: 'Sep 2023',
    metrics: { deposits: 74000, withdrawals: 18000, turnover: 640000, ggr: 41000, ngr: 33000, ltv: 33000, rewardCost: 3800, cashbackLiability: 900 },
    activity: [
      { at: '4h ago', kind: 'risk', label: 'RG affordability flag raised', detail: 'Loss chasing pattern detected — session limits applied' },
      { at: '8 Mar', kind: 'tier', label: 'Tier frozen', detail: 'Gold held pending affordability check' },
      { at: '6 Mar', kind: 'deposit', label: 'Deposit declined', detail: 'Cool-off period active' },
    ],
    warnings: [
      { level: 'critical', title: 'Under responsible-gambling review', detail: 'Affordability check open. Excluded from all cashback payouts and marketing until cleared.' },
      { level: 'warning', title: 'KYC re-verification required', detail: 'Source-of-funds documentation requested — response overdue by 3 days.' },
    ],
  },
  {
    id: 'PLR-90551', externalId: 'PAM-GLR-7781203', alias: 'LuckyN7', emailHash: 'd2e…8b5', brand: 'GLR', country: 'Canada', jurisdiction: 'DGA',
    tier: 'Gold', tierColor: 'gold', status: 'active', risk: 'clear', kyc: 'verified', rg: 'ok', vip: false,
    segments: ['Weekend players'], activeCampaigns: ['Weekend Rakeback Boost', 'Weekend Warriors Mission'], lastActivity: '30 min ago', joined: 'Nov 2022',
    metrics: { deposits: 128000, withdrawals: 96000, turnover: 1240000, ggr: 62000, ngr: 51000, ltv: 51000, rewardCost: 6200, cashbackLiability: 1400 },
    activity: [
      { at: '30 min ago', kind: 'wager', label: 'Slots session', detail: "Play'n GO", amount: '€3,200 staked' },
      { at: '10 Mar', kind: 'reward', label: 'Goodwill comp granted', detail: '€500 bonus credit — platform downtime' },
      { at: '9 Mar', kind: 'login', label: 'Login', detail: 'Mobile · Toronto' },
    ],
    warnings: [],
    upcomingTierChange: { direction: 'down', from: 'Gold', to: 'Silver', when: 'in 6 days', reason: 'Requalification — below €10k weekly stake' },
  },
  {
    id: 'PLR-40028', externalId: 'PAM-ACR-5540781', alias: 'Ace_Diamond', emailHash: 'e7f…2c6', brand: 'ACR', country: 'New Zealand', jurisdiction: 'UKGC',
    tier: 'Platinum', tierColor: 'platinum', status: 'dormant', risk: 'clear', kyc: 'verified', rg: 'ok', vip: true,
    segments: ['Dormant 30d', 'High rollers'], activeCampaigns: [], lastActivity: '38 days ago', joined: 'Mar 2021', accountManager: 'Ravi Menon',
    metrics: { deposits: 344000, withdrawals: 290000, turnover: 3010000, ggr: 118000, ngr: 98000, ltv: 98000, rewardCost: 21000, cashbackLiability: 0 },
    activity: [
      { at: '1 Feb', kind: 'tier', label: 'Tier freeze applied', detail: 'Platinum held through Q2 (injury layoff)' },
      { at: '20 Jan', kind: 'withdrawal', label: 'Withdrawal', detail: 'Bank transfer', amount: '€45,000' },
    ],
    warnings: [
      { level: 'warning', title: 'Dormancy risk — 38 days inactive', detail: 'High-value player dormant beyond 30 days. Eligible for reactivation outreach.' },
    ],
    eligibleCampaign: { name: 'High-Value Reactivation', reason: 'Dormant 30d segment · Platinum tier · €98k LTV' },
  },
  {
    id: 'PLR-33741', externalId: 'PAM-VGV-4402556', alias: 'RiverKing', emailHash: 'f3a…5d7', brand: 'VGV', country: 'Norway', jurisdiction: 'MGA',
    tier: 'Elite', tierColor: 'diamond', status: 'active', risk: 'clear', kyc: 'verified', rg: 'ok', vip: true,
    segments: ['High rollers', 'VIP watchlist'], activeCampaigns: ['VGV VIP Club'], lastActivity: '3h ago', joined: 'Jun 2020', accountManager: 'Sofia Lindqvist',
    metrics: { deposits: 1240000, withdrawals: 1010000, turnover: 12400000, ggr: 412000, ngr: 356000, ltv: 356000, rewardCost: 92000, cashbackLiability: 14200 },
    activity: [
      { at: '3h ago', kind: 'wager', label: 'High-limit baccarat', detail: 'Evolution VIP', amount: '€120,000 staked' },
      { at: '20 Jan', kind: 'tier', label: 'Committee award', detail: 'Diamond → Elite (brand ambassador)' },
    ],
    warnings: [],
  },
  {
    id: 'PLR-62094', externalId: 'PAM-GLR-7712889', alias: 'CasualJoe', emailHash: 'a8b…3e9', brand: 'GLR', country: 'Ireland', jurisdiction: 'DGA',
    tier: 'Silver', tierColor: 'silver', status: 'active', risk: 'clear', kyc: 'pending', rg: 'ok', vip: false,
    segments: ['Weekend players'], activeCampaigns: ['Weekend Rakeback Boost'], lastActivity: '2 days ago', joined: 'Feb 2024',
    metrics: { deposits: 4200, withdrawals: 1100, turnover: 38000, ggr: 2900, ngr: 2400, ltv: 2400, rewardCost: 320, cashbackLiability: 90 },
    activity: [
      { at: '2 days ago', kind: 'wager', label: 'Slots session', detail: 'Hacksaw', amount: '€180 staked' },
      { at: '11 Mar', kind: 'tier', label: 'Tier demotion', detail: 'Gold → Silver (quarterly reset)' },
    ],
    warnings: [
      { level: 'warning', title: 'KYC verification pending', detail: 'Identity documents uploaded, awaiting review. Withdrawals blocked until verified.' },
    ],
  },
  {
    id: 'PLR-11907', externalId: 'PAM-ACR-5521340', alias: 'SpinQueen', emailHash: 'b4c…6f1', brand: 'ACR', country: 'Germany', jurisdiction: 'UKGC',
    tier: 'Gold', tierColor: 'gold', status: 'active', risk: 'watch', kyc: 'verified', rg: 'monitoring', vip: false,
    segments: ['Reactivated'], activeCampaigns: ['Sportsbook Loyalty Tiers'], lastActivity: '5h ago', joined: 'Aug 2023',
    metrics: { deposits: 56000, withdrawals: 34000, turnover: 520000, ggr: 28000, ngr: 22000, ltv: 22000, rewardCost: 2600, cashbackLiability: 640 },
    activity: [
      { at: '5h ago', kind: 'wager', label: 'Sportsbook — accumulator', detail: 'Football', amount: '€1,400 staked' },
      { at: '1 week ago', kind: 'tier', label: 'Tier promotion', detail: 'Silver → Gold (20,000 pts)' },
    ],
    warnings: [],
    upcomingTierChange: { direction: 'up', from: 'Gold', to: 'Platinum', when: 'in 12 days', reason: 'On track — 78% to Platinum threshold' },
  },
  {
    id: 'PLR-77413', externalId: 'PAM-VGV-4390012', alias: 'MidnightBet', emailHash: 'c1d…9a2', brand: 'VGV', country: 'Finland', jurisdiction: 'MGA',
    tier: 'Platinum', tierColor: 'platinum', status: 'active', risk: 'clear', kyc: 'verified', rg: 'ok', vip: true,
    segments: ['High rollers'], activeCampaigns: ['MonoPulse Status Ladder'], lastActivity: '1 day ago', joined: 'Dec 2021', accountManager: 'Priya Nair',
    metrics: { deposits: 212000, withdrawals: 168000, turnover: 1980000, ggr: 84000, ngr: 69000, ltv: 69000, rewardCost: 12800, cashbackLiability: 2100 },
    activity: [
      { at: '1 day ago', kind: 'deposit', label: 'Deposit', detail: 'Apple Pay', amount: '€3,500' },
      { at: 'yesterday', kind: 'tier', label: 'Approaching promotion', detail: '40,000 pts / 90d reached' },
    ],
    warnings: [],
    upcomingTierChange: { direction: 'up', from: 'Platinum', to: 'Diamond', when: 'in 3 days', reason: 'Crossed 40,000 pts / 90d' },
  },
  {
    id: 'PLR-55620', externalId: 'PAM-BNV-2274510', alias: 'ColdStreak', emailHash: 'd6e…4b8', brand: 'BNV', country: 'Ontario (CA)', jurisdiction: 'UKGC',
    tier: 'Gold', tierColor: 'gold', status: 'self_excluded', risk: 'flagged', kyc: 'verified', rg: 'self_excluded', vip: false,
    segments: [], activeCampaigns: [], lastActivity: '15 days ago', joined: 'May 2022',
    metrics: { deposits: 98000, withdrawals: 42000, turnover: 810000, ggr: 47000, ngr: 38000, ltv: 38000, rewardCost: 4400, cashbackLiability: 0 },
    activity: [
      { at: '15 days ago', kind: 'risk', label: 'Self-exclusion activated', detail: '6-month cooling-off — all marketing suppressed' },
      { at: '16 days ago', kind: 'tier', label: 'Tier demotion', detail: 'Platinum → Gold (points not maintained)' },
    ],
    warnings: [
      { level: 'critical', title: 'Self-excluded — 6-month cooling-off', detail: 'Account locked. Excluded from every campaign, reward and override. No outreach permitted.' },
    ],
  },
  {
    id: 'PLR-30298', externalId: 'PAM-GLR-7690455', alias: 'FreshStart_21', emailHash: 'e2f…7c3', brand: 'GLR', country: 'Canada', jurisdiction: 'DGA',
    tier: 'Bronze', tierColor: 'bronze', status: 'active', risk: 'clear', kyc: 'verified', rg: 'ok', vip: false,
    segments: ['New depositors'], activeCampaigns: ['Bronze Climb Achievement'], lastActivity: '20 min ago', joined: 'this week',
    metrics: { deposits: 340, withdrawals: 0, turnover: 2400, ggr: 210, ngr: 180, ltv: 180, rewardCost: 25, cashbackLiability: 12 },
    activity: [
      { at: '20 min ago', kind: 'deposit', label: 'First deposit', detail: 'Welcome bonus applied', amount: '€40' },
      { at: '1h ago', kind: 'login', label: 'Account created', detail: 'Mobile · Toronto' },
    ],
    warnings: [],
    eligibleCampaign: { name: 'New Depositor Onboarding', reason: 'New depositors segment · first 7 days' },
  },
  {
    id: 'PLR-48870', externalId: 'PAM-ACR-5498221', alias: 'GriddleCat', emailHash: 'f9a…1d4', brand: 'ACR', country: 'New Zealand', jurisdiction: 'UKGC',
    tier: 'Silver', tierColor: 'silver', status: 'dormant', risk: 'clear', kyc: 'expired', rg: 'ok', vip: false,
    segments: ['Dormant 30d'], activeCampaigns: [], lastActivity: '52 days ago', joined: 'Jul 2023',
    metrics: { deposits: 18000, withdrawals: 14000, turnover: 160000, ggr: 9000, ngr: 7000, ltv: 7000, rewardCost: 800, cashbackLiability: 0 },
    activity: [
      { at: '52 days ago', kind: 'login', label: 'Last login', detail: 'Desktop · Auckland' },
    ],
    warnings: [
      { level: 'warning', title: 'KYC expired', detail: 'Verification lapsed. Re-verification required before next deposit or withdrawal.' },
    ],
    eligibleCampaign: { name: 'Win-back Free Spins', reason: 'Dormant 30d segment · lapsed KYC re-engagement' },
  },
];

// ─────────────────────────────────────────────────────────────
// KPIs
// ─────────────────────────────────────────────────────────────
export function playerKpis(rows: Player[] = PLAYERS) {
  return {
    total: rows.length,
    vips: rows.filter((p) => p.vip).length,
    flagged: rows.filter((p) => p.risk === 'flagged' || p.risk === 'watch').length,
    kycOpen: rows.filter((p) => p.kyc !== 'verified').length,
    rgActive: rows.filter((p) => p.rg !== 'ok').length,
    rewardLiability: rows.reduce((s, p) => s + p.metrics.cashbackLiability, 0),
  };
}

export function getPlayer(id: string): Player | undefined {
  return PLAYERS.find((p) => p.id === id);
}
