import { fmtMoney, fmtNum } from './campaigns';
import type { DrawerModel, DrawerFact, DrawerRelated, TimelineEvent } from './safety';

const EUR = 'EUR';

// ─────────────────────────────────────────────────────────────
// Shared taxonomy
// ─────────────────────────────────────────────────────────────
export type ProgramStatus = 'live' | 'scheduled' | 'paused' | 'draft' | 'archived';
export type ResetCycle = 'monthly' | 'quarterly' | 'rolling_30d' | 'rolling_90d' | 'annual' | 'none';
export type BrandScope = 'brand_only' | 'network';

export const RESET_LABEL: Record<ResetCycle, string> = {
  monthly: 'Monthly', quarterly: 'Quarterly', rolling_30d: 'Rolling 30d', rolling_90d: 'Rolling 90d', annual: 'Yearly', none: 'No reset',
};

export const PROGRAM_STATUS_META: Record<ProgramStatus, { label: string; fg: string; bg: string }> = {
  live: { label: 'Live', fg: 'var(--status-live)', bg: 'var(--status-live-bg)' },
  scheduled: { label: 'Scheduled', fg: 'var(--status-scheduled)', bg: 'var(--status-scheduled-bg)' },
  paused: { label: 'Paused', fg: 'var(--status-paused)', bg: 'var(--status-paused-bg)' },
  draft: { label: 'Draft', fg: 'var(--status-draft)', bg: 'var(--status-draft-bg)' },
  archived: { label: 'Archived', fg: 'var(--status-completed)', bg: 'var(--status-completed-bg)' },
};

export type TierColor = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export const TIER_VAR: Record<TierColor, string> = {
  bronze: 'var(--tier-bronze)', silver: 'var(--tier-silver)', gold: 'var(--tier-gold)',
  platinum: 'var(--tier-platinum)', diamond: 'var(--tier-diamond)',
};

export interface Tier {
  name: string;
  color: TierColor;
  players: number;
  cashbackPct: number;
  reqLabel: string; // qualification requirement
}

export interface StatusProgram {
  id: string;
  name: string;
  description: string;
  brandScope: BrandScope;
  brands: string[];
  status: ProgramStatus;
  activePlayers: number;
  tiers: Tier[];
  resetCycle: ResetCycle;
  liability: number;      // current cashback/rakeback exposure
  projectedLiability?: number; // for scheduled/draft
  owner: string;
  segment: string;
  jurisdictions: string[];
  cashbackRange: string;
  scheduledFor?: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

// ─────────────────────────────────────────────────────────────
// Filter option lists
// ─────────────────────────────────────────────────────────────
export const JURISDICTIONS = ['MGA', 'UKGC', 'DGA', 'SGA', 'ON'];
export const SEGMENTS = ['All active', 'High value', 'Sports bettors', 'Casino regulars', 'Reactivated', 'New depositors'];
export const TIER_NAMES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'VIP', 'Elite'];

// ─────────────────────────────────────────────────────────────
// Status programs
// ─────────────────────────────────────────────────────────────
export const STATUS_PROGRAMS: StatusProgram[] = [
  {
    id: 'lp-01', name: 'MonoPulse Status Ladder',
    description: 'Network-wide 5-tier status program. Points from real-money wagering across casino and sportsbook, rolling 90-day requalification.',
    brandScope: 'network', brands: ['VGV', 'GLR', 'ACR', 'BNV', 'SPC'], status: 'live',
    activePlayers: 48210, resetCycle: 'rolling_90d', liability: 182400, owner: 'Priya Nair',
    segment: 'All active', jurisdictions: ['MGA', 'UKGC'], cashbackRange: '5–15%', updatedAt: '2h ago',
    tiers: [
      { name: 'Bronze', color: 'bronze', players: 31200, cashbackPct: 5, reqLabel: '0 pts' },
      { name: 'Silver', color: 'silver', players: 11400, cashbackPct: 8, reqLabel: '2,500 pts / 90d' },
      { name: 'Gold', color: 'gold', players: 4100, cashbackPct: 10, reqLabel: '10,000 pts / 90d' },
      { name: 'Platinum', color: 'platinum', players: 1180, cashbackPct: 12, reqLabel: '40,000 pts / 90d' },
      { name: 'Diamond', color: 'diamond', players: 330, cashbackPct: 15, reqLabel: 'Invite only' },
    ],
    timeline: [
      { at: '2h ago', actor: 'Priya Nair', action: 'Adjusted Gold cashback 9% → 10%', tone: 'human' },
      { at: '6 Mar', actor: 'Safety engine', action: 'Liability recalculated — €182.4k', tone: 'system' },
      { at: '12 Jan', actor: 'Priya Nair', action: 'Program launched network-wide', tone: 'human' },
    ],
  },
  {
    id: 'lp-02', name: 'VGV VIP Club',
    description: 'Invitation-only high-roller program for VegasVault. Manual VIP host management with custom cashback and comps.',
    brandScope: 'brand_only', brands: ['VGV'], status: 'live',
    activePlayers: 3120, resetCycle: 'annual', liability: 96500, owner: 'Sofia Lindqvist',
    segment: 'High value', jurisdictions: ['MGA'], cashbackRange: '12–25%', updatedAt: 'yesterday',
    tiers: [
      { name: 'Gold', color: 'gold', players: 1980, cashbackPct: 12, reqLabel: 'Host nomination' },
      { name: 'Platinum', color: 'platinum', players: 840, cashbackPct: 18, reqLabel: '€50k NGR / yr' },
      { name: 'Diamond', color: 'diamond', players: 240, cashbackPct: 22, reqLabel: '€250k NGR / yr' },
      { name: 'Elite', color: 'diamond', players: 60, cashbackPct: 25, reqLabel: 'Committee approval' },
    ],
    timeline: [
      { at: 'yesterday', actor: 'Sofia Lindqvist', action: 'Approved 4 Diamond nominations', tone: 'human' },
      { at: '3 Mar', actor: 'Safety engine', action: 'Cashback liability flagged >€90k', tone: 'alert' },
    ],
  },
  {
    id: 'lp-03', name: 'Weekend Rakeback Boost',
    description: 'Recurring monthly rakeback overlay for GoldenReels sports bettors. 3 volume tiers, auto-credited Monday.',
    brandScope: 'brand_only', brands: ['GLR'], status: 'live',
    activePlayers: 12840, resetCycle: 'monthly', liability: 41200, owner: 'Dan Whitlock',
    segment: 'Sports bettors', jurisdictions: ['MGA', 'DGA'], cashbackRange: '3–8%', updatedAt: '4h ago',
    tiers: [
      { name: 'Bronze', color: 'bronze', players: 9100, cashbackPct: 3, reqLabel: '€500 staked / wk' },
      { name: 'Silver', color: 'silver', players: 2900, cashbackPct: 5, reqLabel: '€2,500 staked / wk' },
      { name: 'Gold', color: 'gold', players: 840, cashbackPct: 8, reqLabel: '€10,000 staked / wk' },
    ],
    timeline: [
      { at: '4h ago', actor: 'Safety engine', action: 'Weekly rakeback batch credited — €9.8k', tone: 'system' },
      { at: '1 Mar', actor: 'Dan Whitlock', action: 'Raised Gold rate 7% → 8%', tone: 'human' },
    ],
  },
  {
    id: 'lp-04', name: 'Sportsbook Loyalty Tiers',
    description: 'Cross-brand sportsbook loyalty for Acer & Bonanza. Quarterly requalification, free-bet and boosted-odds benefits.',
    brandScope: 'network', brands: ['ACR', 'BNV'], status: 'live',
    activePlayers: 21750, resetCycle: 'quarterly', liability: 73900, owner: 'Ravi Menon',
    segment: 'Sports bettors', jurisdictions: ['UKGC', 'SGA'], cashbackRange: '4–12%', updatedAt: '1d ago',
    tiers: [
      { name: 'Bronze', color: 'bronze', players: 13800, cashbackPct: 4, reqLabel: '0 pts' },
      { name: 'Silver', color: 'silver', players: 5100, cashbackPct: 6, reqLabel: '5,000 pts / qtr' },
      { name: 'Gold', color: 'gold', players: 2200, cashbackPct: 8, reqLabel: '20,000 pts / qtr' },
      { name: 'Platinum', color: 'platinum', players: 560, cashbackPct: 10, reqLabel: '80,000 pts / qtr' },
      { name: 'Diamond', color: 'diamond', players: 90, cashbackPct: 12, reqLabel: 'Invite only' },
    ],
    timeline: [
      { at: '1d ago', actor: 'Ravi Menon', action: 'Added boosted-odds benefit to Gold+', tone: 'human' },
    ],
  },
  {
    id: 'lp-05', name: 'Summer Status Sprint',
    description: 'Seasonal accelerated status program for SpinCity. Double points, launches 01 Jun. Pending final approval.',
    brandScope: 'brand_only', brands: ['SPC'], status: 'scheduled',
    activePlayers: 0, resetCycle: 'none', liability: 0, projectedLiability: 38000, owner: 'Mara Ostheim',
    segment: 'Reactivated', jurisdictions: ['MGA'], cashbackRange: '6–14%', scheduledFor: '01 Jun', updatedAt: '3d ago',
    tiers: [
      { name: 'Bronze', color: 'bronze', players: 0, cashbackPct: 6, reqLabel: '0 pts' },
      { name: 'Silver', color: 'silver', players: 0, cashbackPct: 9, reqLabel: '1,500 pts' },
      { name: 'Gold', color: 'gold', players: 0, cashbackPct: 11, reqLabel: '6,000 pts' },
      { name: 'Platinum', color: 'platinum', players: 0, cashbackPct: 14, reqLabel: '20,000 pts' },
    ],
    timeline: [
      { at: '3d ago', actor: 'Mara Ostheim', action: 'Scheduled for 01 Jun — awaiting approval', tone: 'human' },
    ],
  },
  {
    id: 'lp-06', name: 'Legacy Cashback Program',
    description: 'Deprecated flat-rate cashback for Bonanza. Paused pending migration to Sportsbook Loyalty Tiers.',
    brandScope: 'brand_only', brands: ['BNV'], status: 'paused',
    activePlayers: 8600, resetCycle: 'monthly', liability: 28400, owner: 'Priya Nair',
    segment: 'Casino regulars', jurisdictions: ['UKGC'], cashbackRange: '5%', updatedAt: '5d ago',
    tiers: [
      { name: 'Bronze', color: 'bronze', players: 8600, cashbackPct: 5, reqLabel: 'Flat rate' },
    ],
    timeline: [
      { at: '5d ago', actor: 'Priya Nair', action: 'Paused — migration in progress', tone: 'alert' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// VIP overrides
// ─────────────────────────────────────────────────────────────
export type OverrideStatus = 'active' | 'expiring' | 'expired';
export type OverrideType = 'tier_boost' | 'custom_cashback' | 'manual_comp' | 'tier_freeze';
export const OVERRIDE_LABEL: Record<OverrideType, string> = {
  tier_boost: 'Tier boost', custom_cashback: 'Custom cashback', manual_comp: 'Manual comp', tier_freeze: 'Tier freeze',
};

export interface VIPOverride {
  id: string;
  playerAlias: string;
  playerId: string;
  brand: string;
  program: string;
  type: OverrideType;
  value: string;
  currentTier: string;
  forcedTier: string;
  reason: string;
  jurisdiction: string;
  rgExcluded: boolean;
  grantedBy: string;
  grantedAt: string;
  expiresAt: string;
  status: OverrideStatus;
  approval?: 'pending' | 'approved';
}

export const VIP_OVERRIDES: VIPOverride[] = [
  { id: 'vo-01', playerAlias: 'Nightfall_92', playerId: 'PLR-88213', brand: 'VGV', program: 'VGV VIP Club', type: 'tier_boost', value: 'Diamond', currentTier: 'Platinum', forcedTier: 'Diamond', reason: 'Retention — €280k NGR YTD, VIP host nomination.', jurisdiction: 'MGA', rgExcluded: false, grantedBy: 'Sofia Lindqvist', grantedAt: '2 Mar', expiresAt: '30 Jun', status: 'active', approval: 'approved' },
  { id: 'vo-02', playerAlias: 'HighRoller_004', playerId: 'PLR-71190', brand: 'VGV', program: 'VGV VIP Club', type: 'custom_cashback', value: '20% (tier default 18%)', currentTier: 'Diamond', forcedTier: 'Diamond', reason: 'Negotiated cashback rate to retain a high-roller.', jurisdiction: 'MGA', rgExcluded: false, grantedBy: 'Sofia Lindqvist', grantedAt: '18 Feb', expiresAt: '18 May', status: 'active' },
  { id: 'vo-03', playerAlias: 'LuckyN7', playerId: 'PLR-90551', brand: 'GLR', program: 'Weekend Rakeback Boost', type: 'manual_comp', value: '€500 bonus credit', currentTier: 'Gold', forcedTier: 'Gold', reason: 'Goodwill comp after platform downtime.', jurisdiction: 'DGA', rgExcluded: false, grantedBy: 'Dan Whitlock', grantedAt: '10 Mar', expiresAt: '17 Mar', status: 'expiring' },
  { id: 'vo-04', playerAlias: 'Ace_Diamond', playerId: 'PLR-40028', brand: 'ACR', program: 'Sportsbook Loyalty Tiers', type: 'tier_freeze', value: 'Platinum held', currentTier: 'Platinum', forcedTier: 'Platinum', reason: 'Injury layoff — hold status through Q2 requalification.', jurisdiction: 'UKGC', rgExcluded: false, grantedBy: 'Ravi Menon', grantedAt: '1 Feb', expiresAt: '30 Jun', status: 'active' },
  { id: 'vo-05', playerAlias: 'RiverKing', playerId: 'PLR-33741', brand: 'VGV', program: 'VGV VIP Club', type: 'tier_boost', value: 'Elite (committee)', currentTier: 'Diamond', forcedTier: 'Elite', reason: 'Committee award — brand ambassador programme.', jurisdiction: 'MGA', rgExcluded: false, grantedBy: 'Sofia Lindqvist', grantedAt: '20 Jan', expiresAt: '20 Mar', status: 'expiring', approval: 'pending' },
  { id: 'vo-06', playerAlias: 'SilentBet88', playerId: 'PLR-51043', brand: 'BNV', program: 'Sportsbook Loyalty Tiers', type: 'tier_freeze', value: 'Gold held', currentTier: 'Gold', forcedTier: 'Gold', reason: 'Under RG review — status frozen pending affordability check.', jurisdiction: 'UKGC', rgExcluded: true, grantedBy: 'Priya Nair', grantedAt: '8 Mar', expiresAt: '8 Apr', status: 'active', approval: 'pending' },
];

// Overrides that bypass earned status in high-risk ways require Casino Manager sign-off.
export function overrideSensitivity(v: Pick<VIPOverride, 'rgExcluded' | 'currentTier' | 'forcedTier' | 'type' | 'value'>): string[] {
  const reasons: string[] = [];
  if (v.rgExcluded) reasons.push('Player is under responsible-gambling review');
  const from = TIER_NAMES.indexOf(v.currentTier);
  const to = TIER_NAMES.indexOf(v.forcedTier);
  if (from >= 0 && to >= 0 && to - from >= 2) reasons.push(`Skips ${to - from} tiers (${v.currentTier} → ${v.forcedTier})`);
  if (v.type === 'tier_boost' && (v.forcedTier === 'Diamond' || v.forcedTier === 'Elite')) reasons.push(`Forces top-tier status (${v.forcedTier})`);
  const pct = parseFloat((v.value.match(/(\d+(?:\.\d+)?)\s*%/) || [])[1] || '0');
  if (v.type === 'custom_cashback' && pct >= 20) reasons.push(`High custom cashback rate (${pct}%)`);
  if (/committee|elite/i.test(v.value)) reasons.push('Committee-level award');
  return Array.from(new Set(reasons));
}
export function overrideNeedsApproval(v: Pick<VIPOverride, 'rgExcluded' | 'currentTier' | 'forcedTier' | 'type' | 'value'>): boolean {
  return overrideSensitivity(v).length > 0;
}

// ─────────────────────────────────────────────────────────────
// Pending tier changes
// ─────────────────────────────────────────────────────────────
export type TierChangeStatus = 'pending' | 'approved' | 'rejected';
export interface PendingTierChange {
  id: string;
  playerAlias: string;
  playerId: string;
  brand: string;
  program: string;
  from: string;
  to: string;
  direction: 'up' | 'down';
  reason: string;
  requestedAt: string;
  status: TierChangeStatus;
}

export const PENDING_TIER_CHANGES: PendingTierChange[] = [
  { id: 'tc-01', playerAlias: 'Nightfall_92', playerId: 'PLR-88213', brand: 'VGV', program: 'VGV VIP Club', from: 'Platinum', to: 'Diamond', direction: 'up', reason: 'Manual VIP nomination — €280k NGR YTD', requestedAt: '1h ago', status: 'pending' },
  { id: 'tc-02', playerAlias: 'CasualJoe', playerId: 'PLR-62094', brand: 'GLR', program: 'Weekend Rakeback Boost', from: 'Gold', to: 'Silver', direction: 'down', reason: 'Requalification failed — below €10k weekly stake', requestedAt: '3h ago', status: 'pending' },
  { id: 'tc-03', playerAlias: 'SpinQueen', playerId: 'PLR-11907', brand: 'ACR', program: 'Sportsbook Loyalty Tiers', from: 'Silver', to: 'Gold', direction: 'up', reason: 'Crossed 20,000 pts this quarter', requestedAt: '5h ago', status: 'pending' },
  { id: 'tc-04', playerAlias: 'ColdStreak', playerId: 'PLR-55620', brand: 'BNV', program: 'Sportsbook Loyalty Tiers', from: 'Platinum', to: 'Gold', direction: 'down', reason: 'Quarterly reset — points not maintained', requestedAt: 'yesterday', status: 'pending' },
  { id: 'tc-05', playerAlias: 'MidnightBet', playerId: 'PLR-77413', brand: 'VGV', program: 'MonoPulse Status Ladder', from: 'Gold', to: 'Platinum', direction: 'up', reason: 'Crossed 40,000 pts / 90d', requestedAt: 'yesterday', status: 'pending' },
];

// ─────────────────────────────────────────────────────────────
// KPIs + aggregation
// ─────────────────────────────────────────────────────────────
export function loyaltyKpis() {
  const live = STATUS_PROGRAMS.filter((p) => p.status === 'live');
  return {
    activePrograms: live.length,
    playersInTiers: live.reduce((s, p) => s + p.activePlayers, 0),
    cashbackLiability: STATUS_PROGRAMS.reduce((s, p) => s + p.liability, 0),
    vipOverrides: VIP_OVERRIDES.filter((v) => v.status !== 'expired').length,
    pendingTierChanges: PENDING_TIER_CHANGES.filter((t) => t.status === 'pending').length,
  };
}

export function liabilityByBrand(): { brand: string; amount: number }[] {
  const map = new Map<string, number>();
  STATUS_PROGRAMS.forEach((p) => {
    const share = p.liability / (p.brands.length || 1);
    p.brands.forEach((b) => map.set(b, (map.get(b) ?? 0) + share));
  });
  return [...map.entries()].map(([brand, amount]) => ({ brand, amount: Math.round(amount) })).sort((a, b) => b.amount - a.amount);
}

// ─────────────────────────────────────────────────────────────
// Program → drawer
// ─────────────────────────────────────────────────────────────
export function programToDrawer(p: StatusProgram): DrawerModel {
  const scopeLabel = p.brandScope === 'network' ? `Network · ${p.brands.length} brands` : `Brand · ${p.brands[0]}`;
  const facts: DrawerFact[] = [
    { label: 'Status', value: PROGRAM_STATUS_META[p.status].label, tone: p.status === 'paused' ? 'warning' : p.status === 'live' ? 'success' : 'default' },
    { label: 'Brand scope', value: scopeLabel },
    { label: 'Active players', value: fmtNum(p.activePlayers), mono: true },
    { label: 'Tiers', value: String(p.tiers.length), mono: true },
    { label: 'Reset cycle', value: RESET_LABEL[p.resetCycle] },
    { label: 'Cashback range', value: p.cashbackRange, mono: true },
    { label: p.status === 'scheduled' ? 'Projected liability' : 'Cashback liability', value: fmtMoney(p.status === 'scheduled' ? (p.projectedLiability ?? 0) : p.liability, EUR), mono: true, tone: p.liability >= 90000 ? 'warning' : 'default' },
    { label: 'Segment', value: p.segment },
    { label: 'Jurisdictions', value: p.jurisdictions.join(', ') },
    { label: 'Owner', value: p.owner },
    ...(p.scheduledFor ? [{ label: 'Launches', value: p.scheduledFor } as DrawerFact] : []),
  ];
  return {
    kind: 'program', kindLabel: 'Status program', id: p.id,
    title: p.name, subtitle: `${scopeLabel} · ${p.id}`,
    severity: p.liability >= 90000 ? 'warning' : 'info', statusLabel: PROGRAM_STATUS_META[p.status].label,
    riskReason: p.description,
    facts,
    related: [
      { kind: 'segment', label: 'Target segment', value: p.segment },
      { kind: 'brand', label: 'Brands', value: p.brands.join(' · ') },
    ],
    timeline: p.timeline,
    actions: p.status === 'paused'
      ? [{ id: 'resume', label: 'Resume program', tone: 'primary' }, { id: 'edit', label: 'Edit', tone: 'default' }, { id: 'archive', label: 'Archive', tone: 'danger' }]
      : p.status === 'scheduled'
      ? [{ id: 'edit', label: 'Edit', tone: 'primary' }, { id: 'launch', label: 'Launch now', tone: 'default' }]
      : [{ id: 'edit', label: 'Edit program', tone: 'primary' }, { id: 'duplicate', label: 'Duplicate', tone: 'default' }, { id: 'pause', label: 'Pause', tone: 'warning' }],
  };
}

// ─────────────────────────────────────────────────────────────
// VIP override → drawer
// ─────────────────────────────────────────────────────────────
export function overrideToDrawer(v: VIPOverride): DrawerModel {
  const tierMoved = v.forcedTier !== v.currentTier;
  const sens = overrideSensitivity(v);
  const facts: DrawerFact[] = [
    { label: 'Override type', value: OVERRIDE_LABEL[v.type] },
    { label: 'Value', value: v.value, mono: true },
    { label: 'Current tier', value: v.currentTier },
    { label: 'Forced tier', value: v.forcedTier, tone: tierMoved ? 'success' : 'default' },
    { label: 'Brand', value: v.brand, mono: true },
    { label: 'Program', value: v.program },
    { label: 'Jurisdiction', value: v.jurisdiction, mono: true },
    { label: 'RG status', value: v.rgExcluded ? 'Under RG review' : 'Clear', tone: v.rgExcluded ? 'danger' : 'success' },
    { label: 'Granted by', value: v.grantedBy },
    { label: 'Granted', value: v.grantedAt },
    { label: 'Expires', value: v.expiresAt, tone: v.status === 'expiring' ? 'warning' : 'default' },
  ];
  if (v.approval === 'pending') facts.push({ label: 'Approval', value: 'Pending Casino Manager', tone: 'warning' });
  else if (v.approval === 'approved') facts.push({ label: 'Approval', value: 'Approved', tone: 'success' });
  const timeline: TimelineEvent[] = [
    { at: v.grantedAt, actor: v.grantedBy, action: `${OVERRIDE_LABEL[v.type]} granted`, detail: `${v.currentTier} → ${v.forcedTier}${v.value ? ` · ${v.value}` : ''}`, tone: 'human' },
  ];
  if (sens.length) timeline.push({ at: v.grantedAt, actor: 'Policy engine', action: 'Flagged as sensitive override', detail: sens.join(' · '), tone: 'alert' });
  if (v.approval === 'pending') timeline.push({ at: 'now', actor: 'System', action: 'Sent for approval', detail: 'Awaiting Casino Manager sign-off before it takes effect', tone: 'system' });
  if (v.approval === 'approved') timeline.push({ at: v.grantedAt, actor: 'Casino Manager', action: 'Override approved', detail: 'Sensitive override authorised', tone: 'human' });
  if (v.rgExcluded) timeline.push({ at: v.grantedAt, actor: 'Safety engine', action: 'RG affordability flag applied', detail: 'Override held under responsible-gambling review', tone: 'alert' });
  timeline.push({ at: v.expiresAt, actor: 'System', action: v.status === 'expired' ? 'Override expired' : 'Scheduled to expire', detail: 'Player reverts to earned tier', tone: 'system' });
  return {
    kind: 'override', kindLabel: 'VIP override', id: v.id,
    title: v.playerAlias, subtitle: `${v.playerId} · ${v.id}`,
    severity: v.rgExcluded ? 'critical' : v.approval === 'pending' || v.status === 'expiring' ? 'warning' : 'info',
    statusLabel: v.approval === 'pending' ? 'Pending approval' : v.status,
    riskReason: v.reason,
    facts,
    related: [
      { kind: 'player', label: 'Player', value: `${v.playerAlias} (${v.playerId})` },
      { kind: 'brand', label: 'Brand', value: v.brand },
    ],
    timeline,
    actions: v.status === 'expired'
      ? [{ id: 'reinstate', label: 'Reinstate', tone: 'primary' }, { id: 'remove', label: 'Remove', tone: 'danger' }]
      : [{ id: 'extend', label: 'Extend override', tone: 'primary' }, { id: 'remove', label: 'Remove override', tone: 'danger' }],
  };
}

// ─────────────────────────────────────────────────────────────
// Loyalty ledger — player-level transaction log
// ─────────────────────────────────────────────────────────────
export type LedgerEventType = 'xp_earned' | 'tier_change' | 'cashback_granted' | 'manual_adjustment' | 'points_expired';
export const LEDGER_META: Record<LedgerEventType, { label: string; tone: 'default' | 'success' | 'warning' | 'danger' | 'accent' }> = {
  xp_earned: { label: 'XP earned', tone: 'accent' },
  tier_change: { label: 'Tier change', tone: 'default' },
  cashback_granted: { label: 'Cashback granted', tone: 'success' },
  manual_adjustment: { label: 'Manual adjustment', tone: 'warning' },
  points_expired: { label: 'Points expired', tone: 'danger' },
};

export interface LedgerEntry {
  id: string;
  at: string;
  days: number;          // age in days, for range filtering
  playerAlias: string;
  playerId: string;
  brand: string;
  program: string;
  type: LedgerEventType;
  summary: string;
  detail: string;
  amount: number;        // signed
  unit: 'pts' | '€';
  balanceAfter: number;  // running points balance
  actor: string;
  campaign?: string;     // source campaign (links to Campaign Builder)
  tierFrom?: string;
  tierTo?: string;
}

export const LEDGER: LedgerEntry[] = [
  { id: 'LX-90455', at: '12m ago', days: 0, playerAlias: 'Nightfall_92', playerId: 'PLR-88213', brand: 'VGV', program: 'VGV VIP Club', type: 'xp_earned', summary: '+2,400 XP from real-money wagering', detail: '€12,000 turnover · casino tables', amount: 2400, unit: 'pts', balanceAfter: 486200, actor: 'Points engine', campaign: 'Weekend Warriors Mission' },
  { id: 'LX-90441', at: '38m ago', days: 0, playerAlias: 'HighRoller_004', playerId: 'PLR-71190', brand: 'VGV', program: 'VGV VIP Club', type: 'cashback_granted', summary: '€1,240 cashback credited', detail: '20% custom rate on €6,200 net loss (weekly)', amount: 1240, unit: '€', balanceAfter: 312050, actor: 'Cashback engine', campaign: 'VGV VIP Club' },
  { id: 'LX-90420', at: '1h ago', days: 0, playerAlias: 'MidnightBet', playerId: 'PLR-77413', brand: 'VGV', program: 'MonoPulse Status Ladder', type: 'tier_change', summary: 'Promoted Gold → Platinum', detail: 'Crossed 40,000 pts / 90-day window', amount: 0, unit: 'pts', balanceAfter: 41300, actor: 'Points engine', tierFrom: 'Gold', tierTo: 'Platinum' },
  { id: 'LX-90388', at: '3h ago', days: 0, playerAlias: 'LuckyN7', playerId: 'PLR-90551', brand: 'GLR', program: 'Weekend Rakeback Boost', type: 'manual_adjustment', summary: '+€500 manual comp', detail: 'Goodwill after platform downtime · override vo-03', amount: 500, unit: '€', balanceAfter: 8400, actor: 'Dan Whitlock' },
  { id: 'LX-90361', at: '5h ago', days: 0, playerAlias: 'SpinQueen', playerId: 'PLR-11907', brand: 'ACR', program: 'Sportsbook Loyalty Tiers', type: 'xp_earned', summary: '+1,150 XP from settled bets', detail: '€5,750 sportsbook turnover', amount: 1150, unit: 'pts', balanceAfter: 20450, actor: 'Points engine', campaign: 'Sportsbook Loyalty Tiers' },
  { id: 'LX-90344', at: 'yesterday', days: 1, playerAlias: 'CasualJoe', playerId: 'PLR-62094', brand: 'GLR', program: 'Weekend Rakeback Boost', type: 'tier_change', summary: 'Demoted Gold → Silver', detail: 'Requalification failed — below €10k weekly stake', amount: 0, unit: 'pts', balanceAfter: 6100, actor: 'Points engine', tierFrom: 'Gold', tierTo: 'Silver' },
  { id: 'LX-90330', at: 'yesterday', days: 1, playerAlias: 'Ace_Diamond', playerId: 'PLR-40028', brand: 'ACR', program: 'Sportsbook Loyalty Tiers', type: 'cashback_granted', summary: '€380 rakeback credited', detail: '8% on €4,750 turnover (weekly)', amount: 380, unit: '€', balanceAfter: 88700, actor: 'Cashback engine', campaign: 'Sportsbook Loyalty Tiers' },
  { id: 'LX-90318', at: 'yesterday', days: 1, playerAlias: 'RiverKing', playerId: 'PLR-33741', brand: 'VGV', program: 'VGV VIP Club', type: 'xp_earned', summary: '+5,600 XP from real-money wagering', detail: '€28,000 turnover · live casino', amount: 5600, unit: 'pts', balanceAfter: 604800, actor: 'Points engine', campaign: 'VGV VIP Club' },
  { id: 'LX-90290', at: '2d ago', days: 2, playerAlias: 'ColdStreak', playerId: 'PLR-55620', brand: 'BNV', program: 'Sportsbook Loyalty Tiers', type: 'tier_change', summary: 'Demoted Platinum → Gold', detail: 'Quarterly reset — points not maintained', amount: 0, unit: 'pts', balanceAfter: 12900, actor: 'Points engine', tierFrom: 'Platinum', tierTo: 'Gold' },
  { id: 'LX-90271', at: '2d ago', days: 2, playerAlias: 'SilentBet88', playerId: 'PLR-51043', brand: 'BNV', program: 'Sportsbook Loyalty Tiers', type: 'manual_adjustment', summary: '−1,000 pts correction', detail: 'Reversed duplicate XP credit (incident INC-4471)', amount: -1000, unit: 'pts', balanceAfter: 14200, actor: 'Priya Nair' },
  { id: 'LX-90240', at: '4d ago', days: 4, playerAlias: 'Nightfall_92', playerId: 'PLR-88213', brand: 'VGV', program: 'VGV VIP Club', type: 'cashback_granted', summary: '€2,100 cashback credited', detail: '18% on €11,700 net loss (weekly)', amount: 2100, unit: '€', balanceAfter: 483800, actor: 'Cashback engine', campaign: 'VGV VIP Club' },
  { id: 'LX-90205', at: '6d ago', days: 6, playerAlias: 'QuietAce', playerId: 'PLR-29014', brand: 'SPC', program: 'MonoPulse Status Ladder', type: 'points_expired', summary: '−3,200 pts expired', detail: 'Points older than 90 days lapsed at reset', amount: -3200, unit: 'pts', balanceAfter: 9800, actor: 'Points engine' },
  { id: 'LX-90142', at: '12d ago', days: 12, playerAlias: 'SpinQueen', playerId: 'PLR-11907', brand: 'ACR', program: 'Sportsbook Loyalty Tiers', type: 'xp_earned', summary: '+2,050 XP from settled bets', detail: '€10,250 sportsbook turnover', amount: 2050, unit: 'pts', balanceAfter: 18300, actor: 'Points engine', campaign: 'Sportsbook Loyalty Tiers' },
  { id: 'LX-90088', at: '18d ago', days: 18, playerAlias: 'HighRoller_004', playerId: 'PLR-71190', brand: 'VGV', program: 'VGV VIP Club', type: 'manual_adjustment', summary: '+50,000 pts goodwill', detail: 'Retention package — approved by committee', amount: 50000, unit: 'pts', balanceAfter: 310810, actor: 'Sofia Lindqvist' },
  { id: 'LX-89944', at: '24d ago', days: 24, playerAlias: 'MidnightBet', playerId: 'PLR-77413', brand: 'VGV', program: 'MonoPulse Status Ladder', type: 'points_expired', summary: '−1,400 pts expired', detail: 'Lapsed points from prior 90-day window', amount: -1400, unit: 'pts', balanceAfter: 35900, actor: 'Points engine' },
  { id: 'LX-89802', at: '29d ago', days: 29, playerAlias: 'LuckyN7', playerId: 'PLR-90551', brand: 'GLR', program: 'Weekend Rakeback Boost', type: 'cashback_granted', summary: '€120 rakeback credited', detail: '4% on €3,000 turnover (weekly)', amount: 120, unit: '€', balanceAfter: 7900, actor: 'Cashback engine', campaign: 'Weekend Rakeback Boost' },
];

// ─────────────────────────────────────────────────────────────
// Upcoming resets — programs approaching a requalification window
// ─────────────────────────────────────────────────────────────
export interface UpcomingReset {
  id: string;
  program: string;
  brand: string;
  cycle: ResetCycle;
  date: string;        // reset date label
  resetsIn: string;    // relative label, e.g. 'in 3 days'
  days: number;        // days until reset, for sorting
  affected: number;    // players in scope at reset
  atRisk: number;      // players likely to be demoted
}
export const UPCOMING_RESETS: UpcomingReset[] = [
  { id: 'ur-01', program: 'Weekend Rakeback Boost', brand: 'GLR', cycle: 'monthly', date: '01 Jul', resetsIn: 'in 2 days', days: 2, affected: 12840, atRisk: 1740 },
  { id: 'ur-02', program: 'MonoPulse Status Ladder', brand: 'Network', cycle: 'rolling_90d', date: '05 Jul', resetsIn: 'in 6 days', days: 6, affected: 48210, atRisk: 5120 },
  { id: 'ur-03', program: 'Sportsbook Loyalty Tiers', brand: 'ACR · BNV', cycle: 'quarterly', date: '30 Sep', resetsIn: 'in 12 days', days: 12, affected: 21750, atRisk: 3080 },
  { id: 'ur-04', program: 'VGV VIP Club', brand: 'VGV', cycle: 'annual', date: '31 Dec', resetsIn: 'in 94 days', days: 94, affected: 3120, atRisk: 210 },
];

export const LEDGER_RANGES = [
  { v: 'all', l: 'All time', days: Infinity },
  { v: 'today', l: 'Today', days: 0 },
  { v: '7d', l: 'Last 7 days', days: 7 },
  { v: '30d', l: 'Last 30 days', days: 30 },
];

// ─────────────────────────────────────────────────────────────
// Cashback / rakeback configuration
// ─────────────────────────────────────────────────────────────
export type CashbackModel = 'net_loss' | 'turnover_rakeback' | 'ggr_rakeback';
export const CB_MODEL_META: Record<CashbackModel, { label: string; short: string; basisWord: string; desc: string }> = {
  net_loss: { label: 'Net-loss cashback', short: 'Net loss', basisWord: 'net loss', desc: 'Rebate a % of a player’s net losses over the payout period. Highest cost per player — used for VIP and casino programs.' },
  turnover_rakeback: { label: 'Turnover rakeback', short: 'Turnover', basisWord: 'turnover', desc: 'Pay a % of total wagered volume regardless of outcome. Lower rates, broad eligibility — typical for sportsbook.' },
  ggr_rakeback: { label: 'GGR rakeback', short: 'GGR', basisWord: 'gross gaming revenue', desc: 'Rebate a % of gross gaming revenue the player generates. Margin-aware middle ground between net-loss and turnover.' },
};
// switching model re-bases the estimate: rakeback yields less per player than net-loss cashback
const MODEL_FACTOR: Record<CashbackModel, number> = { net_loss: 1, ggr_rakeback: 0.85, turnover_rakeback: 0.55 };
export const PAYOUT_FREQ = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly'];
export const CASHBACK_APPROVAL_THRESHOLD = 150000;

export interface CashbackTierRate {
  tier: string;
  color: TierColor;
  rate: number;    // % of basis
  players: number;
  basis: number;   // avg monthly net-loss € per player (scaled by model factor for other models)
}
export interface CashbackConfig {
  id: string;
  programId: string;
  programName: string;
  brands: string[];
  model: CashbackModel;
  tiers: CashbackTierRate[];
  payoutFrequency: string;
  maxPayoutCap: number;         // € per player per period, 0 = uncapped
  minEligibility: number;       // € min net-loss/turnover to qualify
  excludedJurisdictions: string[];
  rgAutoExclude: boolean;
  excludedPlayers: { id: string; alias: string; reason: string }[];
  linkedCampaigns: string[];    // Campaign Builder reward rules that feed this config
  owner: string;
  updatedAt: string;
}

export const CASHBACK_CONFIGS: CashbackConfig[] = [
  {
    id: 'cc-01', programId: 'lp-01', programName: 'MonoPulse Status Ladder', brands: ['VGV', 'GLR', 'ACR', 'BNV', 'SPC'],
    model: 'net_loss', payoutFrequency: 'Weekly', maxPayoutCap: 5000, minEligibility: 25, rgAutoExclude: true,
    excludedJurisdictions: ['UKGC'], owner: 'Priya Nair', updatedAt: '2h ago',
    tiers: [
      { tier: 'Bronze', color: 'bronze', rate: 5, players: 31200, basis: 28 },
      { tier: 'Silver', color: 'silver', rate: 8, players: 11400, basis: 52 },
      { tier: 'Gold', color: 'gold', rate: 10, players: 4100, basis: 96 },
      { tier: 'Platinum', color: 'platinum', rate: 12, players: 1180, basis: 240 },
      { tier: 'Diamond', color: 'diamond', rate: 15, players: 330, basis: 640 },
    ],
    excludedPlayers: [{ id: 'PLR-51043', alias: 'SilentBet88', reason: 'RG affordability review — auto-excluded' }],
    linkedCampaigns: ['Weekend Warriors Mission', 'High-Value Reactivation'],
  },
  {
    id: 'cc-02', programId: 'lp-02', programName: 'VGV VIP Club', brands: ['VGV'],
    model: 'net_loss', payoutFrequency: 'Weekly', maxPayoutCap: 12000, minEligibility: 100, rgAutoExclude: true,
    excludedJurisdictions: [], owner: 'Sofia Lindqvist', updatedAt: 'yesterday',
    tiers: [
      { tier: 'Gold', color: 'gold', rate: 12, players: 1980, basis: 210 },
      { tier: 'Platinum', color: 'platinum', rate: 18, players: 840, basis: 520 },
      { tier: 'Diamond', color: 'diamond', rate: 22, players: 240, basis: 1150 },
      { tier: 'Elite', color: 'diamond', rate: 25, players: 60, basis: 2400 },
    ],
    excludedPlayers: [],
    linkedCampaigns: ['VGV VIP Club'],
  },
  {
    id: 'cc-03', programId: 'lp-03', programName: 'Weekend Rakeback Boost', brands: ['GLR'],
    model: 'turnover_rakeback', payoutFrequency: 'Weekly', maxPayoutCap: 800, minEligibility: 500, rgAutoExclude: true,
    excludedJurisdictions: ['DGA'], owner: 'Dan Whitlock', updatedAt: '4h ago',
    tiers: [
      { tier: 'Bronze', color: 'bronze', rate: 3, players: 9100, basis: 90 },
      { tier: 'Silver', color: 'silver', rate: 5, players: 2900, basis: 180 },
      { tier: 'Gold', color: 'gold', rate: 8, players: 840, basis: 420 },
    ],
    excludedPlayers: [],
    linkedCampaigns: ['Weekend Rakeback Boost'],
  },
  {
    id: 'cc-04', programId: 'lp-04', programName: 'Sportsbook Loyalty Tiers', brands: ['ACR', 'BNV'],
    model: 'ggr_rakeback', payoutFrequency: 'Bi-weekly', maxPayoutCap: 1500, minEligibility: 50, rgAutoExclude: true,
    excludedJurisdictions: ['UKGC'], owner: 'Ravi Menon', updatedAt: '1d ago',
    tiers: [
      { tier: 'Bronze', color: 'bronze', rate: 4, players: 13800, basis: 42 },
      { tier: 'Silver', color: 'silver', rate: 6, players: 5100, basis: 78 },
      { tier: 'Gold', color: 'gold', rate: 8, players: 2200, basis: 160 },
      { tier: 'Platinum', color: 'platinum', rate: 10, players: 560, basis: 380 },
      { tier: 'Diamond', color: 'diamond', rate: 12, players: 90, basis: 900 },
    ],
    excludedPlayers: [{ id: 'PLR-55620', alias: 'ColdStreak', reason: 'Self-exclusion cooldown' }],
    linkedCampaigns: ['Sportsbook Loyalty Tiers'],
  },
];

export function cbTierPerPlayer(t: CashbackTierRate, model: CashbackModel, cap: number): number {
  const gross = (t.rate / 100) * t.basis * MODEL_FACTOR[model];
  return cap > 0 ? Math.min(gross, cap) : gross;
}
export function cbTierCost(t: CashbackTierRate, model: CashbackModel, cap: number, minElig: number): number {
  const perPlayer = cbTierPerPlayer(t, model, cap);
  // players below the minimum-eligibility basis don't qualify
  const eligible = t.basis * MODEL_FACTOR[model] >= minElig ? t.players : Math.round(t.players * 0.35);
  return perPlayer * eligible;
}
export function cbLiability(c: CashbackConfig): number {
  return Math.round(c.tiers.reduce((s, t) => s + cbTierCost(t, c.model, c.maxPayoutCap, c.minEligibility), 0));
}

// Compliance warnings for high-liability payout rules — surfaced on the cashback config surface.
export interface CbWarning { level: 'warning' | 'critical'; title: string; detail: string; }
export function cbComplianceWarnings(c: CashbackConfig): CbWarning[] {
  const w: CbWarning[] = [];
  const topRate = Math.max(...c.tiers.map((t) => t.rate));
  const liab = cbLiability(c);
  if (c.maxPayoutCap === 0 && topRate >= 12)
    w.push({ level: 'critical', title: 'Uncapped high-value payouts', detail: `No per-player cap with rebates up to ${topRate}% — a single high-roller’s payout is unbounded. Set a max payout cap.` });
  if (topRate >= 20)
    w.push({ level: 'warning', title: `Rebate rate reaches ${topRate}%`, detail: `Top-tier rebates ${topRate}% of ${CB_MODEL_META[c.model].basisWord}. Rates above 20% require Casino Manager sign-off and RG review.` });
  if (c.minEligibility === 0)
    w.push({ level: 'warning', title: 'No minimum eligibility', detail: 'Every active player qualifies for a rebate. A minimum threshold contains liability and excludes marginal accounts.' });
  if (c.model === 'net_loss' && liab >= CASHBACK_APPROVAL_THRESHOLD)
    w.push({ level: 'warning', title: 'Net-loss cashback at scale', detail: 'Rebating net losses at this volume can incentivise loss-chasing. Confirm affordability checks and RG safeguards are active before publishing.' });
  return w;
}

export function ledgerToDrawer(e: LedgerEntry): DrawerModel {
  const meta = LEDGER_META[e.type];
  const signed = `${e.amount > 0 ? '+' : e.amount < 0 ? '−' : ''}${e.unit === '€' ? '€' : ''}${Math.abs(e.amount).toLocaleString()}${e.unit === 'pts' ? ' pts' : ''}`;
  const facts: DrawerFact[] = [
    { label: 'Event', value: meta.label },
    { label: 'Amount', value: e.amount === 0 ? '—' : signed, mono: true, tone: meta.tone === 'accent' || meta.tone === 'default' ? 'default' : meta.tone },
    { label: 'Points balance', value: `${e.balanceAfter.toLocaleString()} pts`, mono: true },
    { label: 'Brand', value: e.brand, mono: true },
    { label: 'Program', value: e.program },
    ...(e.campaign ? [{ label: 'Source campaign', value: e.campaign } as DrawerFact] : []),
    ...(e.tierFrom ? [{ label: 'Tier movement', value: `${e.tierFrom} → ${e.tierTo}`, tone: 'default' } as DrawerFact] : []),
    { label: 'Booked by', value: e.actor },
    { label: 'When', value: e.at },
  ];
  return {
    kind: 'ledger', kindLabel: `Ledger · ${meta.label}`, id: e.id,
    title: e.playerAlias, subtitle: `${e.playerId} · ${e.id}`,
    severity: e.type === 'points_expired' ? 'warning' : e.type === 'manual_adjustment' ? 'warning' : 'info',
    statusLabel: meta.label,
    riskReason: e.detail,
    facts,
    related: [
      { kind: 'player', label: 'Player', value: `${e.playerAlias} (${e.playerId})` },
      { kind: 'brand', label: 'Brand', value: e.brand },
      ...(e.campaign ? [{ kind: 'campaign', label: 'Source campaign', value: e.campaign } as DrawerRelated] : []),
    ],
    timeline: [
      { at: e.at, actor: e.actor, action: e.summary, detail: e.detail, tone: e.actor.includes('engine') ? 'system' : 'human' },
    ],
    openCampaignId: e.campaign ? 'campaigns' : undefined,
    actions: e.type === 'manual_adjustment'
      ? [{ id: 'view', label: 'View player ledger', tone: 'primary' }, { id: 'reverse', label: 'Reverse adjustment', tone: 'danger' }]
      : [{ id: 'view', label: 'View player ledger', tone: 'primary' }],
  };
}
