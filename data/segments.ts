export type SegmentStatus = 'active' | 'draft' | 'syncing' | 'blocked';
export type SegmentType = 'dynamic' | 'static' | 'imported' | 'suppression';
export type SegmentHealth = 'healthy' | 'warning' | 'blocked';
export type RuleCategory = 'value' | 'activity' | 'gameplay' | 'loyalty' | 'risk' | 'geo' | 'brand';

export const STATUS_META: Record<SegmentStatus, { label: string; fg: string; bg: string }> = {
  active: { label: 'Active', fg: 'var(--success)', bg: 'var(--status-live-bg)' },
  draft: { label: 'Draft', fg: 'var(--fg-muted)', bg: 'var(--surface-3)' },
  syncing: { label: 'Syncing', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
  blocked: { label: 'Blocked', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
};

export const HEALTH_META: Record<SegmentHealth, { label: string; fg: string; bg: string }> = {
  healthy: { label: 'Healthy', fg: 'var(--success)', bg: 'var(--status-live-bg)' },
  warning: { label: 'Warning', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
  blocked: { label: 'Blocked', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
};

export const TYPE_LABEL: Record<SegmentType, string> = {
  dynamic: 'Dynamic',
  static: 'Static list',
  imported: 'Imported',
  suppression: 'Suppression',
};

export interface SegmentRule {
  id: string;
  category: RuleCategory;
  label: string;
  operator: string;
  value: string;
}

export interface SegmentUsage {
  kind: 'campaign' | 'reward' | 'loyalty' | 'risk';
  name: string;
  status: string;
}

export interface Segment {
  id: string;
  name: string;
  type: SegmentType;
  status: SegmentStatus;
  health: SegmentHealth;
  brands: string[];
  count: number;
  previousCount: number;
  overlapWarning: string;
  exclusions: string[];
  rules: SegmentRule[];
  usage: SegmentUsage[];
  owner: string;
  lastCalculated: string;
  syncStatus: string;
}

export interface AudiencePreview {
  brand: string;
  players: number;
  eligible: number;
  excluded: number;
  overlap: number;
  health: SegmentHealth;
}

export interface SegmentAudit {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  note: string;
}

export const SEGMENTS: Segment[] = [
  {
    id: 'seg-high-value-active',
    name: 'High value active players',
    type: 'dynamic',
    status: 'active',
    health: 'healthy',
    brands: ['ACR', 'VGV', 'LKF'],
    count: 5564,
    previousCount: 5218,
    overlapWarning: '18% overlap with VIP retention risk segment',
    exclusions: ['Responsible-gambling exclusions', 'Self-excluded players', 'Bonus abuse flags'],
    owner: 'CRM Ops',
    lastCalculated: '7m ago',
    syncStatus: 'Live recalculation every 15 minutes',
    rules: [
      { id: 'r1', category: 'value', label: '30d net gaming revenue', operator: 'greater than', value: '€500' },
      { id: 'r2', category: 'activity', label: 'Last active', operator: 'within', value: '7 days' },
      { id: 'r3', category: 'risk', label: 'Risk score', operator: 'below', value: 'Medium' },
    ],
    usage: [
      { kind: 'campaign', name: 'High Roller Rakeback Q1', status: 'Live' },
      { kind: 'reward', name: '5% weekly rakeback', status: 'Active' },
      { kind: 'loyalty', name: 'Gold tier accelerator', status: 'Draft' },
    ],
  },
  {
    id: 'seg-churn-risk',
    name: 'Churn risk · 14 day drop',
    type: 'dynamic',
    status: 'active',
    health: 'warning',
    brands: ['ACR', 'SPC', 'BNV', 'VGV'],
    count: 12840,
    previousCount: 10820,
    overlapWarning: 'High overlap with bonus-sensitive players',
    exclusions: ['Self-excluded players', 'Country blocked rewards'],
    owner: 'Retention Lead',
    lastCalculated: '18m ago',
    syncStatus: 'Next sync delayed by event volume spike',
    rules: [
      { id: 'r1', category: 'activity', label: 'Sessions', operator: 'dropped by', value: '50% vs prior 14d' },
      { id: 'r2', category: 'value', label: 'Lifetime deposits', operator: 'greater than', value: '€250' },
      { id: 'r3', category: 'brand', label: 'Brand', operator: 'is one of', value: 'ACR, SPC, BNV, VGV' },
    ],
    usage: [
      { kind: 'campaign', name: 'Comeback missions', status: 'Scheduled' },
      { kind: 'reward', name: '€50 deposit match', status: 'Draft' },
    ],
  },
  {
    id: 'seg-new-depositors',
    name: 'New depositors · first 72h',
    type: 'dynamic',
    status: 'syncing',
    health: 'healthy',
    brands: ['BNV', 'LKF'],
    count: 2416,
    previousCount: 2290,
    overlapWarning: 'No material overlap',
    exclusions: ['Responsible-gambling exclusions', 'Duplicate accounts'],
    owner: 'Casino Manager',
    lastCalculated: 'syncing now',
    syncStatus: 'Rebuilding after deposit schema change',
    rules: [
      { id: 'r1', category: 'activity', label: 'First deposit', operator: 'within', value: '72 hours' },
      { id: 'r2', category: 'gameplay', label: 'Casino activity', operator: 'at least', value: '1 bet settled' },
    ],
    usage: [
      { kind: 'campaign', name: 'Welcome mission', status: 'Draft' },
      { kind: 'loyalty', name: 'Bronze onboarding', status: 'Active' },
    ],
  },
  {
    id: 'seg-rg-suppression',
    name: 'RG and compliance suppression',
    type: 'suppression',
    status: 'active',
    health: 'healthy',
    brands: ['All brands'],
    count: 912,
    previousCount: 908,
    overlapWarning: 'Applies globally before reward eligibility',
    exclusions: [],
    owner: 'Risk',
    lastCalculated: '3m ago',
    syncStatus: 'Synced from operator exclusions API',
    rules: [
      { id: 'r1', category: 'risk', label: 'Self-exclusion status', operator: 'is', value: 'active' },
      { id: 'r2', category: 'risk', label: 'Deposit limit status', operator: 'is', value: 'breached or cooling-off' },
    ],
    usage: [
      { kind: 'risk', name: 'Reward grant gate', status: 'Active' },
      { kind: 'risk', name: 'Campaign launch gate', status: 'Active' },
    ],
  },
  {
    id: 'seg-jackpot-eligible',
    name: 'Jackpot eligible casino players',
    type: 'dynamic',
    status: 'blocked',
    health: 'blocked',
    brands: ['GLR', 'ACR'],
    count: 18410,
    previousCount: 19044,
    overlapWarning: 'Blocked: GLR wallet eligibility check failing',
    exclusions: ['RG exclusions', 'Jurisdiction blocked', 'Wallet KYC incomplete'],
    owner: 'Casino Manager',
    lastCalculated: '41m ago',
    syncStatus: 'Wallet eligibility API failure',
    rules: [
      { id: 'r1', category: 'gameplay', label: 'Game category', operator: 'includes', value: 'slots, live casino' },
      { id: 'r2', category: 'geo', label: 'Jurisdiction', operator: 'allows', value: 'jackpot rewards' },
      { id: 'r3', category: 'risk', label: 'KYC status', operator: 'equals', value: 'verified' },
    ],
    usage: [
      { kind: 'campaign', name: 'Mega Network Jackpot', status: 'Blocked' },
      { kind: 'reward', name: 'Jackpot cash payout', status: 'Blocked' },
    ],
  },
  {
    id: 'seg-vip-manual',
    name: 'VIP host managed list',
    type: 'static',
    status: 'draft',
    health: 'warning',
    brands: ['SPC', 'VGV'],
    count: 348,
    previousCount: 342,
    overlapWarning: 'Manual list has 12 players missing country data',
    exclusions: ['RG exclusions', 'Manual review required'],
    owner: 'VIP Manager',
    lastCalculated: '2h ago',
    syncStatus: 'Awaiting reviewer approval',
    rules: [
      { id: 'r1', category: 'value', label: 'VIP host list', operator: 'contains', value: 'uploaded player IDs' },
      { id: 'r2', category: 'loyalty', label: 'Tier', operator: 'at least', value: 'Gold' },
    ],
    usage: [
      { kind: 'reward', name: 'VIP event package', status: 'Paused' },
      { kind: 'campaign', name: 'VIP retention raffle', status: 'Draft' },
    ],
  },
];

export const AUDIENCE_PREVIEW: AudiencePreview[] = [
  { brand: 'ACR', players: 9200, eligible: 8120, excluded: 312, overlap: 18, health: 'healthy' },
  { brand: 'VGV', players: 7640, eligible: 6891, excluded: 204, overlap: 22, health: 'healthy' },
  { brand: 'BNV', players: 4010, eligible: 3610, excluded: 118, overlap: 9, health: 'warning' },
  { brand: 'GLR', players: 6220, eligible: 0, excluded: 6220, overlap: 0, health: 'blocked' },
  { brand: 'SPC', players: 3018, eligible: 2701, excluded: 92, overlap: 14, health: 'warning' },
  { brand: 'LKF', players: 5122, eligible: 4908, excluded: 61, overlap: 7, health: 'healthy' },
];

export const SEGMENT_AUDIT: SegmentAudit[] = [
  { id: 'aud-seg-7120', at: '12:46', actor: 'System', action: 'Recalculated segment', target: 'High value active players', note: 'Count increased by 346 players after latest settled bet events.' },
  { id: 'aud-seg-7118', at: '12:31', actor: 'Nino · Casino', action: 'Blocked segment usage', target: 'Jackpot eligible casino players', note: 'Wallet eligibility API failing for GLR.' },
  { id: 'aud-seg-7112', at: '11:58', actor: 'Mariam · Risk', action: 'Updated suppression rule', target: 'RG and compliance suppression', note: 'Added cooling-off status to mandatory exclusions.' },
  { id: 'aud-seg-7109', at: '11:24', actor: 'Dato · CRM', action: 'Created draft segment', target: 'VIP host managed list', note: 'Uploaded 348 player IDs from VIP host list.' },
];

export function segmentKpis() {
  return {
    active: SEGMENTS.filter((s) => s.status === 'active').length,
    totalPlayers: SEGMENTS.reduce((sum, s) => sum + s.count, 0),
    blocked: SEGMENTS.filter((s) => s.status === 'blocked' || s.health === 'blocked').length,
    warnings: SEGMENTS.filter((s) => s.health === 'warning').length,
    suppression: SEGMENTS.find((s) => s.type === 'suppression')?.count ?? 0,
    usageLinks: SEGMENTS.reduce((sum, s) => sum + s.usage.length, 0),
  };
}
