export type Env = 'sandbox' | 'staging' | 'production';
export type Health = 'healthy' | 'degraded' | 'failing';
export type DeliveryStatus = 'delivered' | 'retrying' | 'failed' | 'quarantined';

export const HEALTH_META: Record<Health, { label: string; fg: string; bg: string }> = {
  healthy: { label: 'Healthy', fg: 'var(--success)', bg: 'var(--status-live-bg)' },
  degraded: { label: 'Degraded', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
  failing: { label: 'Failing', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
};

export const DELIVERY_META: Record<DeliveryStatus, { label: string; fg: string; bg: string }> = {
  delivered: { label: 'Delivered', fg: 'var(--success)', bg: 'var(--status-live-bg)' },
  retrying: { label: 'Retrying', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
  failed: { label: 'Failed', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
  quarantined: { label: 'Quarantined', fg: 'var(--status-scheduled)', bg: 'var(--status-scheduled-bg)' },
};

export interface ApiKey {
  id: string;
  name: string;
  brand: string;
  env: Env;
  scopes: string[];
  lastUsed: string;
  status: Health;
  owner: string;
  createdAt: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  brand: string;
  env: Env;
  events: string[];
  status: Health;
  successRate: number;
  lastDelivery: string;
  signed: boolean;
}

export interface EventLog {
  id: string;
  at: string;
  playerId: string;
  brand: string;
  env: Env;
  eventType: string;
  source: string;
  status: DeliveryStatus;
  latencyMs: number;
  campaign?: string;
  payload: string;
  validation: string;
}

export interface ProviderHealth {
  id: string;
  provider: string;
  brand: string;
  env: Env;
  kind: 'casino' | 'sportsbook' | 'wallet' | 'bonus engine';
  status: Health;
  mappedGames: number;
  lastSync: string;
  incident?: string;
}

export interface CertificationCheck {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'pending';
  detail: string;
}

export const API_KEYS: ApiKey[] = [
  { id: 'key-prod-01', name: 'Production event ingest', brand: 'ACR', env: 'production', scopes: ['events:write', 'players:read'], lastUsed: '42s ago', status: 'healthy', owner: 'Platform team', createdAt: '2026-06-20' },
  { id: 'key-prod-02', name: 'Reward fulfillment', brand: 'VGV', env: 'production', scopes: ['rewards:write', 'wallet:read'], lastUsed: '2m ago', status: 'healthy', owner: 'Casino ops', createdAt: '2026-06-18' },
  { id: 'key-stage-01', name: 'Sandbox certification', brand: 'BNV', env: 'sandbox', scopes: ['events:write', 'webhooks:test'], lastUsed: '18m ago', status: 'degraded', owner: 'Java backend', createdAt: '2026-06-26' },
  { id: 'key-prod-legacy', name: 'Legacy sports bridge', brand: 'GLR', env: 'production', scopes: ['events:write'], lastUsed: '3d ago', status: 'failing', owner: 'Integrations', createdAt: '2026-05-02' },
];

export const WEBHOOKS: WebhookEndpoint[] = [
  { id: 'wh-001', url: 'https://acr.example.com/monopulse/rewards', brand: 'ACR', env: 'production', events: ['reward.granted', 'reward.failed'], status: 'healthy', successRate: 99.84, lastDelivery: '37s ago', signed: true },
  { id: 'wh-002', url: 'https://vegasvip.example.com/events/monopulse', brand: 'VGV', env: 'production', events: ['campaign.completed', 'tier.changed'], status: 'healthy', successRate: 99.12, lastDelivery: '1m ago', signed: true },
  { id: 'wh-003', url: 'https://goldrush.example.com/bonus-webhook', brand: 'GLR', env: 'production', events: ['reward.granted'], status: 'failing', successRate: 82.4, lastDelivery: '24m ago', signed: false },
  { id: 'wh-004', url: 'https://betnova-sandbox.example.com/mp', brand: 'BNV', env: 'sandbox', events: ['event.test', 'reward.test'], status: 'degraded', successRate: 94.7, lastDelivery: '8m ago', signed: true },
];

export const EVENT_LOGS: EventLog[] = [
  { id: 'evt-9f12a8', at: '12:42:08', playerId: 'PLR-4471902', brand: 'VGV', env: 'production', eventType: 'bet.settled', source: 'operator-platform', status: 'delivered', latencyMs: 48, campaign: 'High Roller Rakeback Q1', validation: 'schema valid · rule matched', payload: '{ "event": "bet.settled", "amount": 250, "game": "roulette_live" }' },
  { id: 'evt-9f12a4', at: '12:41:51', playerId: 'PLR-3390014', brand: 'GLR', env: 'production', eventType: 'reward.grant', source: 'reward-engine', status: 'retrying', latencyMs: 1300, campaign: 'Cash Splash Prize Drop', validation: 'webhook 503 · retry scheduled', payload: '{ "rewardGuid": "bonus_20fs_glr", "attempt": 3 }' },
  { id: 'evt-9f1190', at: '12:39:13', playerId: 'PLR-9902137', brand: 'ACR', env: 'production', eventType: 'jackpot.win', source: 'jackpot-engine', status: 'quarantined', latencyMs: 77, campaign: 'Mega Network Jackpot', validation: 'high-value payout requires manual review', payload: '{ "jackpot": 50000, "currency": "EUR" }' },
  { id: 'evt-9f1052', at: '12:32:45', playerId: 'PLR-1120934', brand: 'BNV', env: 'sandbox', eventType: 'signature.test', source: 'sandbox-cert', status: 'failed', latencyMs: 0, validation: 'HMAC signature mismatch', payload: '{ "signature": "invalid", "timestamp": "2026-07-02T10:32:45Z" }' },
];

export const PROVIDERS: ProviderHealth[] = [
  { id: 'prov-ev', provider: 'Evolution', brand: 'ACR', env: 'production', kind: 'casino', status: 'healthy', mappedGames: 182, lastSync: '16m ago' },
  { id: 'prov-pp', provider: 'Pragmatic Play', brand: 'VGV', env: 'production', kind: 'casino', status: 'healthy', mappedGames: 246, lastSync: '22m ago' },
  { id: 'prov-wallet', provider: 'Operator Wallet API', brand: 'GLR', env: 'production', kind: 'wallet', status: 'failing', mappedGames: 0, lastSync: '2h ago', incident: '401 on reward payout endpoint' },
  { id: 'prov-bonus', provider: 'Bonus Engine v2', brand: 'BNV', env: 'sandbox', kind: 'bonus engine', status: 'degraded', mappedGames: 0, lastSync: '44m ago', incident: 'currency mapping incomplete' },
];

export const CERTIFICATION: CertificationCheck[] = [
  { id: 'cert-auth', label: 'API authentication', status: 'pass', detail: 'Sandbox key accepted and scoped correctly.' },
  { id: 'cert-events', label: 'Event ingestion', status: 'pass', detail: 'Bet, deposit, login and reward events received.' },
  { id: 'cert-trigger', label: 'Rule trigger', status: 'pass', detail: 'WHEN / IF / THEN test campaign fired.' },
  { id: 'cert-reward', label: 'Reward creation', status: 'pending', detail: 'Waiting for bonus GUID mapping from operator.' },
  { id: 'cert-signature', label: 'Signature verification', status: 'fail', detail: 'Latest test payload failed HMAC validation.' },
  { id: 'cert-retry', label: 'Retry behavior', status: 'pending', detail: 'Dead-letter replay not yet confirmed.' },
];

export function integrationKpis() {
  return {
    eventsReceived: 248912,
    eventsFailed: EVENT_LOGS.filter((e) => e.status === 'failed' || e.status === 'quarantined').length,
    webhookSuccess: 98.7,
    rewardErrors: EVENT_LOGS.filter((e) => e.eventType.includes('reward') && e.status !== 'delivered').length,
    activeKeys: API_KEYS.filter((k) => k.status !== 'failing').length,
    incidents: PROVIDERS.filter((p) => p.status !== 'healthy').length,
  };
}
