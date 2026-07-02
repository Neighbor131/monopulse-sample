export type BrandHealth = 'ready' | 'warning' | 'blocked';
export type UserRole = 'Org Admin' | 'Brand Admin' | 'CRM / Retention' | 'Casino Manager' | 'Risk & Compliance' | 'Technical Admin';

export const HEALTH_META: Record<BrandHealth, { label: string; fg: string; bg: string }> = {
  ready: { label: 'Ready', fg: 'var(--success)', bg: 'var(--status-live-bg)' },
  warning: { label: 'Warning', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
  blocked: { label: 'Blocked', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
};

export interface OrgBrand {
  code: string;
  name: string;
  jurisdiction: string;
  currency: string;
  timezone: string;
  environment: 'production' | 'staging' | 'sandbox';
  health: BrandHealth;
  owner: string;
  activeCampaigns: number;
  loyaltyProgram: string;
  integrationHealth: BrandHealth;
  enabledModules: string[];
  rewardLimit: number;
}

export interface OrgUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  brands: string[];
  status: 'active' | 'pending' | 'suspended';
  lastSeen: string;
}

export interface PermissionRow {
  action: string;
  orgAdmin: boolean;
  brandAdmin: boolean;
  crm: boolean;
  casino: boolean;
  risk: boolean;
  tech: boolean;
}

export interface Restriction {
  id: string;
  brand: string;
  kind: string;
  value: string;
  severity: BrandHealth;
  note: string;
}

export interface OrgAudit {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  note: string;
}

export const ORG_BRANDS: OrgBrand[] = [
  { code: 'ACR', name: 'AceRoyale', jurisdiction: 'Malta', currency: 'EUR', timezone: 'Europe/Malta', environment: 'production', health: 'ready', owner: 'Sofia Lindqvist', activeCampaigns: 8, loyaltyProgram: 'AceRoyale VIP Ladder', integrationHealth: 'ready', enabledModules: ['Missions', 'Races', 'Jackpots', 'Rakeback'], rewardLimit: 50000 },
  { code: 'SPC', name: 'SpinCity', jurisdiction: 'Ontario', currency: 'CAD', timezone: 'America/Toronto', environment: 'production', health: 'warning', owner: 'Ravi Menon', activeCampaigns: 5, loyaltyProgram: 'SpinCity Status', integrationHealth: 'warning', enabledModules: ['Missions', 'Prize Drops', 'Achievements'], rewardLimit: 15000 },
  { code: 'BNV', name: 'BetNova', jurisdiction: 'UK', currency: 'GBP', timezone: 'Europe/London', environment: 'sandbox', health: 'warning', owner: 'Priya Nair', activeCampaigns: 2, loyaltyProgram: 'Nova Cashback', integrationHealth: 'warning', enabledModules: ['Missions', 'Velocity', 'Rakeback'], rewardLimit: 10000 },
  { code: 'LKF', name: 'LuckyForge', jurisdiction: 'Curacao', currency: 'EUR', timezone: 'UTC', environment: 'staging', health: 'ready', owner: 'Dan Whitlock', activeCampaigns: 3, loyaltyProgram: 'Forge Tiers', integrationHealth: 'ready', enabledModules: ['Raffles', 'Prize Drops', 'Survival'], rewardLimit: 20000 },
  { code: 'VGV', name: 'VegasVault', jurisdiction: 'Malta', currency: 'EUR', timezone: 'Europe/Malta', environment: 'production', health: 'ready', owner: 'Maya Costa', activeCampaigns: 9, loyaltyProgram: 'Vault Elite', integrationHealth: 'ready', enabledModules: ['Rakeback', 'Jackpots', 'Races'], rewardLimit: 75000 },
  { code: 'GLR', name: 'GoldRush', jurisdiction: 'Germany', currency: 'EUR', timezone: 'Europe/Berlin', environment: 'production', health: 'blocked', owner: 'Ivan Petrov', activeCampaigns: 1, loyaltyProgram: 'GoldRush Levels', integrationHealth: 'blocked', enabledModules: ['Prize Drops', 'Missions'], rewardLimit: 5000 },
];

export const ORG_USERS: OrgUser[] = [
  { id: 'usr-01', name: 'Sofia Lindqvist', email: 'sofia@novabet.example', role: 'Org Admin', brands: ['All brands'], status: 'active', lastSeen: '2m ago' },
  { id: 'usr-02', name: 'Ravi Menon', email: 'ravi@novabet.example', role: 'CRM / Retention', brands: ['SPC', 'BNV', 'LKF'], status: 'active', lastSeen: '12m ago' },
  { id: 'usr-03', name: 'Priya Nair', email: 'priya@novabet.example', role: 'Technical Admin', brands: ['BNV', 'GLR'], status: 'active', lastSeen: '34m ago' },
  { id: 'usr-04', name: 'Dan Whitlock', email: 'dan@novabet.example', role: 'Risk & Compliance', brands: ['All brands'], status: 'active', lastSeen: '1h ago' },
  { id: 'usr-05', name: 'Maya Costa', email: 'maya@novabet.example', role: 'Casino Manager', brands: ['VGV', 'ACR'], status: 'pending', lastSeen: 'Invite sent' },
  { id: 'usr-06', name: 'Ivan Petrov', email: 'ivan@novabet.example', role: 'Brand Admin', brands: ['GLR'], status: 'suspended', lastSeen: '6d ago' },
];

export const PERMISSIONS: PermissionRow[] = [
  { action: 'Create network campaign', orgAdmin: true, brandAdmin: false, crm: false, casino: false, risk: false, tech: false },
  { action: 'Create brand-only campaign', orgAdmin: true, brandAdmin: true, crm: true, casino: true, risk: false, tech: false },
  { action: 'Launch approved campaign', orgAdmin: true, brandAdmin: true, crm: true, casino: true, risk: false, tech: false },
  { action: 'Approve campaign / reward', orgAdmin: true, brandAdmin: false, crm: false, casino: false, risk: true, tech: false },
  { action: 'Change loyalty tiers', orgAdmin: true, brandAdmin: true, crm: true, casino: false, risk: false, tech: false },
  { action: 'Rotate API keys', orgAdmin: true, brandAdmin: false, crm: false, casino: false, risk: false, tech: true },
  { action: 'Edit jurisdiction rules', orgAdmin: true, brandAdmin: false, crm: false, casino: false, risk: true, tech: false },
  { action: 'View player risk flags', orgAdmin: true, brandAdmin: true, crm: false, casino: true, risk: true, tech: false },
];

export const RESTRICTIONS: Restriction[] = [
  { id: 'res-01', brand: 'GLR', kind: 'Reward fulfillment', value: 'Cash payout disabled', severity: 'blocked', note: 'Wallet API returns 401 until provider credentials are rotated.' },
  { id: 'res-02', brand: 'SPC', kind: 'Jurisdiction', value: 'Jackpots unavailable', severity: 'warning', note: 'Ontario approval pending for network jackpot pooling.' },
  { id: 'res-03', brand: 'BNV', kind: 'Environment', value: 'Sandbox only', severity: 'warning', note: 'Production activation waiting for signature certification.' },
  { id: 'res-04', brand: 'ACR', kind: 'Responsible gambling', value: 'KYC before cash payout', severity: 'ready', note: 'Cash rewards held until KYC verified.' },
];

export const ORG_AUDIT: OrgAudit[] = [
  { id: 'aud-01', at: '8m ago', actor: 'Sofia Lindqvist', action: 'Updated permission matrix', target: 'Risk & Compliance', note: 'Risk reviewers can approve high-value rewards.' },
  { id: 'aud-02', at: '41m ago', actor: 'Priya Nair', action: 'Rotated API key', target: 'BNV sandbox', note: 'New key generated for certification run.' },
  { id: 'aud-03', at: '2h ago', actor: 'Dan Whitlock', action: 'Blocked module', target: 'SPC jackpots', note: 'Network jackpot pooling disabled pending jurisdiction review.' },
  { id: 'aud-04', at: 'Yesterday', actor: 'Sofia Lindqvist', action: 'Invited user', target: 'Maya Costa', note: 'Casino Manager access for VGV and ACR.' },
];

export function orgKpis() {
  return {
    brands: ORG_BRANDS.length,
    activeBrands: ORG_BRANDS.filter((b) => b.environment === 'production').length,
    users: ORG_USERS.length,
    pendingInvites: ORG_USERS.filter((u) => u.status === 'pending').length,
    blockedRules: RESTRICTIONS.filter((r) => r.severity === 'blocked').length,
  };
}
