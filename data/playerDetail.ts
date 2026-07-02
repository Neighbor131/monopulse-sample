import type { Player } from './players';

// deterministic pseudo-random from id so records are stable per player
function seed(id: string): number { let h = 2166136261; for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function pick<T>(s: number, arr: T[]): T { return arr[s % arr.length]; }

const TIER_ORDER = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'VIP', 'Elite'];
const TIER_CASHBACK: Record<string, number> = { Bronze: 5, Silver: 8, Gold: 10, Platinum: 12, Diamond: 15, VIP: 20, Elite: 25 };

// ─────────────────────────────────────────────────────────────
// Campaigns tab
// ─────────────────────────────────────────────────────────────
export type CampaignPartStatus = 'active' | 'completed' | 'missed' | 'excluded';
export const CAMPAIGN_PART_META: Record<CampaignPartStatus, { label: string; fg: string; bg: string }> = {
  active: { label: 'Active', fg: 'var(--success)', bg: 'var(--status-live-bg)' },
  completed: { label: 'Completed', fg: 'var(--fg-secondary)', bg: 'var(--surface-3)' },
  missed: { label: 'Missed eligibility', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
  excluded: { label: 'Excluded', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
};
export interface CampaignRecord {
  id: string; name: string; module: string; brand: string; status: CampaignPartStatus;
  progress: number | null; reward: string; rewardStatus: string; joined: string; note: string;
}
function moduleFor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('vip') || n.includes('club')) return 'Loyalty tiers';
  if (n.includes('rakeback') || n.includes('cashback')) return 'Rakeback / Cashback';
  if (n.includes('mission') || n.includes('achievement') || n.includes('climb')) return 'Missions';
  if (n.includes('reactivation') || n.includes('win-back') || n.includes('onboarding') || n.includes('depositor')) return 'CRM lifecycle';
  if (n.includes('sportsbook')) return 'Sportsbook';
  if (n.includes('ladder') || n.includes('status')) return 'Status ladder';
  return 'Bonus engine';
}
export function campaignRecords(p: Player): CampaignRecord[] {
  const s = seed(p.id);
  const out: CampaignRecord[] = p.activeCampaigns.map((name, i) => ({
    id: `CMP-${(s % 9000 + i * 7 + 1000)}`, name, module: moduleFor(name), brand: p.brand, status: 'active',
    progress: 30 + ((s >> (i + 1)) % 65), reward: pick((s >> i) & 7, ['€250 cashback', '150 free spins', '€100 bonus', 'Tier boost', '€500 rakeback']),
    rewardStatus: 'Accruing', joined: pick(s + i, ['3 weeks ago', 'this month', '6 days ago', 'last week']), note: 'Live — rewards credited on schedule.',
  }));
  // completed history
  out.push({ id: `CMP-${s % 4000 + 200}`, name: pick(s, ['February Reload', 'Welcome Offer', 'New Year Free Spins', 'Spring Cashback Sprint']), module: 'Bonus engine', brand: p.brand, status: 'completed', progress: 100, reward: pick(s >> 2, ['€50 bonus', '50 free spins', '€120 cashback']), rewardStatus: 'Granted', joined: '2 months ago', note: 'Completed — reward fulfilled and settled.' });
  // missed eligibility
  if ((s & 1) === 0 || p.tier === 'Silver' || p.tier === 'Bronze') {
    out.push({ id: `CMP-${s % 3000 + 500}`, name: pick(s >> 3, ['VIP Weekend Boost', 'High-Roller Rakeback', 'Diamond Reload']), module: 'Loyalty tiers', brand: p.brand, status: 'missed', progress: null, reward: '—', rewardStatus: 'Not granted', joined: '5 weeks ago', note: `Below eligibility threshold — did not reach required tier / stake during the window.` });
  }
  // excluded (RG / risk driven)
  if (p.rg !== 'ok' || p.risk === 'flagged') {
    out.push({ id: `CMP-${s % 2000 + 800}`, name: 'All marketing campaigns', module: 'CRM lifecycle', brand: p.brand, status: 'excluded', progress: null, reward: '—', rewardStatus: 'Suppressed', joined: p.lastActivity, note: p.rg === 'self_excluded' ? 'Self-exclusion active — suppressed from every marketing and reward campaign.' : 'Excluded pending responsible-gambling / risk review.' });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────
// Loyalty tab
// ─────────────────────────────────────────────────────────────
export interface TierMove { at: string; from: string; to: string; direction: 'up' | 'down' | 'freeze' | 'override'; reason: string; actor: string }
export function tierMoves(p: Player): TierMove[] {
  const s = seed(p.id);
  const idx = Math.max(1, TIER_ORDER.indexOf(p.tier));
  const moves: TierMove[] = [];
  // most recent from activity if present
  const act = p.activity.find((a) => a.kind === 'tier');
  if (act) moves.push({ at: act.at, from: TIER_ORDER[Math.max(0, idx - 1)], to: p.tier, direction: act.label.toLowerCase().includes('override') || act.label.toLowerCase().includes('award') ? 'override' : act.label.toLowerCase().includes('demot') || act.label.toLowerCase().includes('froze') || act.label.toLowerCase().includes('freeze') ? (act.label.toLowerCase().includes('froze') || act.label.toLowerCase().includes('freeze') ? 'freeze' : 'down') : 'up', reason: act.detail, actor: p.accountManager ?? 'Points engine' });
  else moves.push({ at: '3 weeks ago', from: TIER_ORDER[Math.max(0, idx - 1)], to: p.tier, direction: 'up', reason: 'Crossed points threshold for the window', actor: 'Points engine' });
  moves.push({ at: '2 months ago', from: TIER_ORDER[Math.max(0, idx - 2)], to: TIER_ORDER[Math.max(0, idx - 1)], direction: 'up', reason: 'Requalification met', actor: 'Points engine' });
  if ((s & 3) === 0) moves.push({ at: '4 months ago', from: TIER_ORDER[Math.max(0, idx - 1)], to: TIER_ORDER[Math.max(0, idx - 2)], direction: 'down', reason: 'Quarterly reset — points not maintained', actor: 'Points engine' });
  return moves;
}
export interface CashbackEligibility { rakebackRate: number; cashbackRate: number; capped: boolean; cap: number; nextPayout: string; frequency: string; liability: number; eligible: boolean; blockReason: string | null }
export function cashbackEligibility(p: Player): CashbackEligibility {
  const rate = TIER_CASHBACK[p.tier] ?? 5;
  const blocked = p.rg !== 'ok' || p.kyc !== 'verified';
  return { rakebackRate: Math.max(3, Math.round(rate * 0.6)), cashbackRate: rate, capped: p.tier !== 'Elite' && p.tier !== 'VIP', cap: p.vip ? 5000 : 800, nextPayout: blocked ? '—' : pick(seed(p.id), ['Mon 00:00', 'in 3 days', 'next Monday']), frequency: 'Weekly', liability: p.metrics.cashbackLiability, eligible: !blocked, blockReason: p.rg !== 'ok' ? 'Responsible-gambling hold — payouts suspended' : p.kyc !== 'verified' ? 'KYC not verified — payouts on hold' : null };
}
export interface VipOverrideState { status: 'none' | 'active' | 'pending'; label: string; detail: string; forcedTier: string | null; approver: string }
export function vipOverride(p: Player): VipOverrideState {
  if (p.upcomingTierChange?.when.includes('approval')) return { status: 'pending', label: 'Override pending approval', detail: `${p.upcomingTierChange.from} → ${p.upcomingTierChange.to} · ${p.upcomingTierChange.reason}`, forcedTier: p.upcomingTierChange.to, approver: 'Loyalty committee' };
  const overrideAct = p.activity.find((a) => a.kind === 'tier' && (a.label.toLowerCase().includes('override') || a.label.toLowerCase().includes('award') || a.label.toLowerCase().includes('freeze') || a.label.toLowerCase().includes('froze')));
  if (overrideAct) return { status: 'active', label: 'Active tier override', detail: overrideAct.detail, forcedTier: p.tier, approver: p.accountManager ?? 'VIP host' };
  return { status: 'none', label: 'No override', detail: 'Player is on the standard automated tier track.', forcedTier: null, approver: '—' };
}

// ─────────────────────────────────────────────────────────────
// Rewards tab
// ─────────────────────────────────────────────────────────────
export type RewardStatus = 'granted' | 'pending' | 'failed' | 'expired' | 'held';
export const REWARD_META: Record<RewardStatus, { label: string; fg: string; bg: string }> = {
  granted: { label: 'Granted', fg: 'var(--success)', bg: 'var(--status-live-bg)' },
  pending: { label: 'Pending', fg: 'var(--status-scheduled)', bg: 'var(--status-scheduled-bg)' },
  failed: { label: 'Failed', fg: 'var(--danger)', bg: 'var(--danger-bg)' },
  expired: { label: 'Expired', fg: 'var(--fg-muted)', bg: 'var(--surface-3)' },
  held: { label: 'On hold', fg: 'var(--warning)', bg: 'var(--warning-bg)' },
};
export interface RewardRecord { id: string; name: string; type: string; value: string; fulfillment: string; guid: string; status: RewardStatus; date: string; source: string; note: string }
export function rewardRecords(p: Player): RewardRecord[] {
  const s = seed(p.id);
  const rows: RewardRecord[] = [];
  const mk = (i: number, status: RewardStatus, extra: Partial<RewardRecord> = {}): RewardRecord => ({
    id: `RWD-${s % 8000 + i * 13}`, name: pick(s + i, ['Weekly cashback', 'Reload bonus', 'Free spins pack', 'Loyalty comp', 'Tier upgrade gift', 'Rakeback payout']),
    type: pick(s + i * 3, ['Cashback', 'Bonus credit', 'Free spins', 'Goodwill comp']), value: pick(s + i * 5, ['€1,240', '€500', '150 spins', '€100', '€2,100']),
    fulfillment: pick(s + i * 2, ['Auto · PAM API', 'Auto · bonus engine', 'Manual · ops']), guid: `BNS-${(s + i * 97) % 90000 + 10000}`,
    status, date: pick(s + i, ['12 min ago', 'yesterday', '3 days ago', 'last week', '2 weeks ago']), source: pick(s + i, p.activeCampaigns.length ? p.activeCampaigns : ['Manual grant', 'Loyalty program']), note: '', ...extra,
  });
  rows.push(mk(0, 'granted', { name: 'Weekly cashback', note: 'Auto-credited to bonus wallet. Settled successfully.' }));
  rows.push(mk(1, 'granted', { note: 'Fulfilled via PAM API. Confirmed by operator platform.' }));
  if (p.kyc !== 'verified') rows.push(mk(2, 'held', { name: 'Reload bonus', fulfillment: 'Auto · bonus engine', note: 'Held automatically — KYC verification required before payout.' }));
  else if (p.rg !== 'ok') rows.push(mk(2, 'held', { name: 'Rakeback payout', note: 'Held — responsible-gambling review in progress.' }));
  else rows.push(mk(2, 'pending', { name: 'Reload bonus', note: 'Queued for next fulfillment batch.' }));
  if ((s & 2) === 0) rows.push(mk(3, 'failed', { name: 'Free spins pack', type: 'Free spins', fulfillment: 'Auto · PAM API', note: 'Platform rejected the grant (game unavailable in jurisdiction). Eligible for retry.' }));
  if (p.status === 'dormant' || (s & 4) === 0) rows.push(mk(4, 'expired', { name: 'Reactivation bonus', note: 'Reward window lapsed before the player claimed it.' }));
  return rows;
}

// ─────────────────────────────────────────────────────────────
// Risk tab
// ─────────────────────────────────────────────────────────────
export type RiskKind = 'fraud' | 'rg' | 'kyc' | 'jurisdiction';
export const RISK_KIND_META: Record<RiskKind, { label: string }> = {
  fraud: { label: 'Fraud / abuse' }, rg: { label: 'Responsible gambling' }, kyc: { label: 'KYC / identity' }, jurisdiction: { label: 'Jurisdiction' },
};
export interface RiskItem { id: string; kind: RiskKind; severity: 'critical' | 'warning' | 'info'; title: string; detail: string; status: 'open' | 'monitoring' | 'resolved'; raised: string; owner: string }
export function riskItems(p: Player): RiskItem[] {
  const s = seed(p.id);
  const items: RiskItem[] = [];
  // from explicit warnings
  p.warnings.forEach((w, i) => {
    const kind: RiskKind = w.title.toLowerCase().includes('kyc') ? 'kyc' : w.title.toLowerCase().includes('gambling') || w.title.toLowerCase().includes('exclud') || w.title.toLowerCase().includes('affordab') ? 'rg' : w.title.toLowerCase().includes('velocity') || w.title.toLowerCase().includes('abuse') ? 'fraud' : 'rg';
    items.push({ id: `RSK-${s % 7000 + i * 11}`, kind, severity: w.level === 'critical' ? 'critical' : 'warning', title: w.title, detail: w.detail, status: w.level === 'critical' ? 'open' : 'monitoring', raised: p.lastActivity, owner: 'Risk & Compliance' });
  });
  // KYC state
  if (p.kyc !== 'verified' && !items.some((r) => r.kind === 'kyc')) items.push({ id: `RSK-${s % 6000 + 40}`, kind: 'kyc', severity: p.kyc === 'expired' ? 'critical' : 'warning', title: p.kyc === 'expired' ? 'KYC verification expired' : 'KYC verification incomplete', detail: p.kyc === 'expired' ? 'Identity verification lapsed. Re-verification required before next transaction.' : 'Documents submitted, awaiting reviewer approval.', status: 'open', raised: '3 days ago', owner: 'KYC team' });
  // jurisdiction (informational)
  items.push({ id: `RSK-${s % 5000 + 70}`, kind: 'jurisdiction', severity: 'info', title: `${p.jurisdiction} licensing rules applied`, detail: `Player operates under ${p.jurisdiction} (${p.country}). Bonus caps, deposit limits and cashback rules enforced per this jurisdiction.`, status: 'monitoring', raised: 'at signup', owner: 'Compliance' });
  if (items.length === 1) items.unshift({ id: `RSK-${s % 4000 + 90}`, kind: 'fraud', severity: 'info', title: 'No open fraud signals', detail: 'Automated fraud and bonus-abuse checks clear. No manual reports on file.', status: 'resolved', raised: 'ongoing', owner: 'Fraud engine' });
  return items;
}
export interface ReviewerNote { at: string; author: string; note: string }
export function reviewerNotes(p: Player): ReviewerNote[] {
  const s = seed(p.id);
  const base: ReviewerNote[] = [];
  if (p.rg !== 'ok') base.push({ at: p.lastActivity, author: 'Risk & Compliance', note: 'Applied session and deposit limits pending affordability documentation. Marketing suppressed until cleared.' });
  if (p.kyc !== 'verified') base.push({ at: '3 days ago', author: 'KYC team', note: 'Requested source-of-funds documentation. Awaiting player response.' });
  base.push({ at: pick(s, ['1 week ago', '2 weeks ago', 'last month']), author: p.accountManager ?? pick(s >> 1, ['Priya Nair', 'Dan Whitlock', 'Ravi Menon']), note: p.vip ? 'VIP player — high value, stable play pattern. Cleared for enhanced hospitality.' : 'Routine review — no concerns. Standard limits apply.' });
  return base;
}

// ─────────────────────────────────────────────────────────────
// Timeline tab
// ─────────────────────────────────────────────────────────────
export type TimelineSource = 'platform' | 'monopulse' | 'reward' | 'status' | 'manual';
export const TIMELINE_META: Record<TimelineSource, { label: string; fg: string }> = {
  platform: { label: 'Operator platform', fg: 'var(--status-scheduled)' },
  monopulse: { label: 'MonoPulse decision', fg: 'var(--accent)' },
  reward: { label: 'Reward sent', fg: 'var(--tier-gold)' },
  status: { label: 'Status change', fg: 'var(--fg-secondary)' },
  manual: { label: 'Manual action', fg: 'var(--warning)' },
};
export interface TimelineEvent { at: string; source: TimelineSource; title: string; detail: string }
export function timelineEvents(p: Player): TimelineEvent[] {
  const s = seed(p.id);
  const ev: TimelineEvent[] = [];
  p.activity.slice(0, 3).forEach((a) => {
    const src: TimelineSource = a.kind === 'reward' ? 'reward' : a.kind === 'tier' ? 'status' : a.kind === 'risk' ? 'monopulse' : 'platform';
    ev.push({ at: a.at, source: src, title: a.label, detail: a.detail + (a.amount ? ` · ${a.amount}` : '') });
  });
  ev.push({ at: p.lastActivity, source: 'monopulse', title: 'Eligibility evaluated', detail: `Segments recomputed — ${p.segments.length} active. Tier + campaign eligibility refreshed.` });
  ev.push({ at: pick(s, ['2h ago', '5h ago', 'yesterday']), source: 'reward', title: 'Reward dispatched to platform', detail: `Fulfillment sent via PAM API · GUID BNS-${s % 90000 + 10000}` });
  ev.push({ at: pick(s >> 1, ['yesterday', '2 days ago']), source: 'status', title: 'Tier recalculated', detail: `Current tier held at ${p.tier} for the active window.` });
  if (p.rg !== 'ok' || p.kyc !== 'verified') ev.push({ at: '3 days ago', source: 'manual', title: 'Compliance action logged', detail: p.rg !== 'ok' ? 'RG limits applied by Risk & Compliance.' : 'KYC re-verification requested.' });
  ev.push({ at: pick(s >> 2, ['4 days ago', '1 week ago']), source: 'platform', title: 'Session activity received', detail: 'Wager + settlement events ingested from operator platform.' });
  return ev;
}
