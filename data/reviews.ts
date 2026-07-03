import { BRANDS, fmtMoney, fmtNum } from './campaigns';
import type { CampaignTypeId } from './campaigns';
import { getBlockers, getWarnings, estimateAudience, fulfillmentById } from './validation';
import type { Health } from './validation';
import type { DraftCampaign } from '../context/CampaignContext';

export type ReviewDecision =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'changes_requested'
  | 'blocked'
  | 'reset';

export type CheckSeverity = 'pass' | 'warning' | 'blocker';

export type CheckCategory =
  | 'Budget'
  | 'Approvals'
  | 'Fraud & abuse'
  | 'Responsible gambling'
  | 'Jurisdiction'
  | 'Fulfillment'
  | 'Audit';

export interface CheckItem {
  id: string;
  category: CheckCategory;
  label: string;
  detail: string;
  severity: CheckSeverity;
}

export interface ChangeEntry {
  field: string;
  before: string;
  after: string;
  by: string;
  at: string;
  sensitive: boolean;
}

export type AuditKind =
  | 'create'
  | 'edit'
  | 'submit'
  | 'approve'
  | 'reject'
  | 'changes'
  | 'reset'
  | 'comment'
  | 'system';

export interface AuditEntry {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  detail?: string;
  at: string;
  kind: AuditKind;
}

export interface Review {
  id: string;
  campaignId: string;
  name: string;
  type: CampaignTypeId;
  decision: ReviewDecision;
  priority: 'high' | 'normal';
  // submission
  submittedBy: string;
  submittedByRole: string;
  submittedAt: string;
  waitingFor: string; // reviewer assigned
  slaHint: string;
  // facts
  brandScope: 'all' | 'selected';
  brands: string[];
  audienceSize: number;
  excludedPlayers: number;
  rewardSetup: string;
  fulfillmentMethod: string;
  fulfillmentHealth: Health;
  fulfillmentNote: string;
  budgetCap: number;
  projectedSpend: number;
  currency: string;
  // structured
  checks: CheckItem[];
  changesSinceReview: ChangeEntry[];
  audit: AuditEntry[];
  // decision context
  reviewerComment?: string;
  reviewerName?: string;
  decidedAt?: string;
}

export function countBySeverity(checks: CheckItem[]): { pass: number; warning: number; blocker: number } {
  return {
    pass: checks.filter((c) => c.severity === 'pass').length,
    warning: checks.filter((c) => c.severity === 'warning').length,
    blocker: checks.filter((c) => c.severity === 'blocker').length,
  };
}

export function getReview(id: string): Review | undefined {
  return REVIEWS.find((r) => r.id === id);
}

export function reviewCounts() {
  return {
    pending: REVIEWS.filter((r) => r.decision === 'pending').length,
    blocked: REVIEWS.filter((r) => r.decision === 'blocked').length,
    changes: REVIEWS.filter((r) => r.decision === 'changes_requested').length,
    reset: REVIEWS.filter((r) => r.decision === 'reset').length,
    approvedToday: REVIEWS.filter((r) => r.decision === 'approved').length,
    queue: REVIEWS.filter((r) => ['pending', 'blocked', 'reset'].includes(r.decision)).length,
  };
}

const PASS = (id: string, category: CheckCategory, label: string, detail: string): CheckItem => ({ id, category, label, detail, severity: 'pass' });
const WARN = (id: string, category: CheckCategory, label: string, detail: string): CheckItem => ({ id, category, label, detail, severity: 'warning' });
const BLOCK = (id: string, category: CheckCategory, label: string, detail: string): CheckItem => ({ id, category, label, detail, severity: 'blocker' });

export const REVIEWS: Review[] = [
  {
    id: 'rv-3012',
    campaignId: 'c-1039',
    name: 'High Roller Rakeback Q1',
    type: 'rakeback',
    decision: 'pending',
    priority: 'high',
    submittedBy: 'Priya Nair',
    submittedByRole: 'Retention Manager',
    submittedAt: '1h ago',
    waitingFor: 'You · Risk & Compliance',
    slaHint: 'SLA 4h · 3h remaining',
    brandScope: 'selected',
    brands: ['VGV'],
    audienceSize: 3100,
    excludedPlayers: 142,
    rewardSetup: '12% cashback on net losses · cap €2,000 / player',
    fulfillmentMethod: 'Operator wallet payout',
    fulfillmentHealth: 'degraded',
    fulfillmentNote: 'Wallet route reachable — currency mapping unconfirmed for VGV',
    budgetCap: 120000,
    projectedSpend: 98400,
    currency: 'EUR',
    checks: [
      PASS('bc', 'Budget', 'Budget cap set', 'Hard cap €120,000 with projected spend €98,400 (82%).'),
      WARN('ap', 'Approvals', 'Reward exceeds tier threshold', 'Per-player cap €2,000 is above the €500 auto-approve limit — senior sign-off required.'),
      PASS('fa', 'Fraud & abuse', 'Abuse filters applied', 'Bonus-abuse and multi-account rules attached from the risk engine.'),
      PASS('rg', 'Responsible gambling', 'RG exclusions applied', '142 self-excluded and deposit-limited players removed from audience.'),
      PASS('ju', 'Jurisdiction', 'Single jurisdiction', 'VegasVault (VGV) operates under one licence — mapping valid.'),
      WARN('fu', 'Fulfillment', 'Wallet route degraded', 'Currency mapping for VGV wallet payouts is unconfirmed; grants may fail on EUR→local conversion.'),
      PASS('au', 'Audit', 'Audit trail complete', 'Full change history recorded since draft creation.'),
    ],
    changesSinceReview: [],
    audit: [
      { id: 'a1', actor: 'Priya Nair', actorRole: 'Retention Manager', action: 'Created campaign', at: '14 Mar · 09:20', kind: 'create' },
      { id: 'a2', actor: 'Priya Nair', actorRole: 'Retention Manager', action: 'Set reward cap', detail: 'Per-player cap set to €2,000', at: '14 Mar · 10:02', kind: 'edit' },
      { id: 'a3', actor: 'Priya Nair', actorRole: 'Retention Manager', action: 'Submitted for approval', detail: 'Routed to Risk & Compliance (reward above threshold)', at: '14 Mar · 10:05', kind: 'submit' },
    ],
  },
  {
    id: 'rv-3011',
    campaignId: 'c-1034',
    name: 'Mega Network Jackpot',
    type: 'jackpot',
    decision: 'blocked',
    priority: 'high',
    submittedBy: 'Dan Whitlock',
    submittedByRole: 'Casino Manager',
    submittedAt: '3h ago',
    waitingFor: 'Blocked — creator action needed',
    slaHint: 'Cannot approve until resolved',
    brandScope: 'all',
    brands: ['ACR', 'SPC', 'BNV', 'LKF', 'VGV', 'GLR'],
    audienceSize: 340000,
    excludedPlayers: 9520,
    rewardSetup: 'Pooled progressive jackpot · seed €50,000',
    fulfillmentMethod: 'MonoPulse triggers platform bonus',
    fulfillmentHealth: 'connected',
    fulfillmentNote: 'Platform API reachable across 4 of 6 brands',
    budgetCap: 250000,
    projectedSpend: 250000,
    currency: 'EUR',
    checks: [
      PASS('bc', 'Budget', 'Budget cap set', 'Hard cap €250,000 matches the seeded pool ceiling.'),
      PASS('ap', 'Approvals', 'Senior approval routed', 'Network-wide campaign correctly routed to senior CRM + compliance.'),
      WARN('fa', 'Fraud & abuse', 'High pooled exposure', 'Single-winner pool of €250k warrants enhanced payout monitoring.'),
      PASS('rg', 'Responsible gambling', 'RG exclusions applied', '9,520 players removed across the network.'),
      BLOCK('ju', 'Jurisdiction', 'Jurisdiction mismatch on 2 brands', 'Pooled jackpots are not permitted for LuckyForge (LKF) and GoldRush (GLR) under current licences. Remove these brands or split the pool.'),
      BLOCK('fu', 'Fulfillment', 'Platform API unreachable on 2 brands', 'LKF and GLR bonus endpoints failed the last health check — rewards cannot be granted network-wide.'),
      PASS('au', 'Audit', 'Audit trail complete', 'Change history recorded.'),
    ],
    changesSinceReview: [],
    audit: [
      { id: 'a1', actor: 'Dan Whitlock', actorRole: 'Casino Manager', action: 'Created campaign', at: '13 Mar · 16:40', kind: 'create' },
      { id: 'a2', actor: 'System', actorRole: 'Safety engine', action: 'Flagged jurisdiction mismatch', detail: 'LKF, GLR not eligible for pooled jackpots', at: '13 Mar · 16:41', kind: 'system' },
      { id: 'a3', actor: 'Dan Whitlock', actorRole: 'Casino Manager', action: 'Submitted for approval', at: '13 Mar · 17:10', kind: 'submit' },
      { id: 'a4', actor: 'System', actorRole: 'Safety engine', action: 'Launch blocked', detail: '2 blockers must be resolved by the creator', at: '13 Mar · 17:10', kind: 'system' },
    ],
  },
  {
    id: 'rv-3009',
    campaignId: 'c-1041',
    name: 'Champions League Tournament',
    type: 'race',
    decision: 'changes_requested',
    priority: 'normal',
    submittedBy: 'Dan Whitlock',
    submittedByRole: 'Casino Manager',
    submittedAt: 'yesterday',
    waitingFor: 'Creator · Dan Whitlock',
    slaHint: 'Awaiting creator update',
    brandScope: 'selected',
    brands: ['ACR', 'BNV', 'VGV'],
    audienceSize: 92500,
    excludedPlayers: 2610,
    rewardSetup: 'Prize pool €80,000 · top 200 ranks',
    fulfillmentMethod: 'MonoPulse triggers platform bonus',
    fulfillmentHealth: 'connected',
    fulfillmentNote: 'Platform API reachable · avg 240ms',
    budgetCap: 80000,
    projectedSpend: 80000,
    currency: 'EUR',
    checks: [
      WARN('bc', 'Budget', 'No daily cap configured', 'Full €80k prize pool could pay out on the final day — recommend a daily ceiling.'),
      PASS('ap', 'Approvals', 'Approval routed', 'Routed to compliance for cross-brand review.'),
      PASS('fa', 'Fraud & abuse', 'Abuse filters applied', 'Rank-manipulation and collusion checks attached.'),
      PASS('rg', 'Responsible gambling', 'RG exclusions applied', '2,610 players removed.'),
      WARN('ju', 'Jurisdiction', 'Mixed jurisdictions', 'Three brands span two licences — leaderboard prize rules differ; confirm mapping.'),
      PASS('fu', 'Fulfillment', 'Fulfillment healthy', 'Platform API connected across all three brands.'),
      PASS('au', 'Audit', 'Audit trail complete', 'Change history recorded.'),
    ],
    changesSinceReview: [],
    reviewerComment: 'Add a daily payout cap and confirm the jurisdiction mapping for the three pooled brands before I can approve. Prize structure itself looks good.',
    reviewerName: 'Sofia Lindqvist',
    decidedAt: 'yesterday · 15:22',
    audit: [
      { id: 'a1', actor: 'Dan Whitlock', actorRole: 'Casino Manager', action: 'Submitted for approval', at: '12 Mar · 11:00', kind: 'submit' },
      { id: 'a2', actor: 'Sofia Lindqvist', actorRole: 'Risk & Compliance', action: 'Requested changes', detail: 'Daily cap + jurisdiction mapping', at: '12 Mar · 15:22', kind: 'changes' },
      { id: 'a3', actor: 'Sofia Lindqvist', actorRole: 'Risk & Compliance', action: 'Left review comment', at: '12 Mar · 15:22', kind: 'comment' },
    ],
  },
  {
    id: 'rv-3007',
    campaignId: 'c-1042',
    name: 'Weekend Warriors Mission',
    type: 'mission',
    decision: 'reset',
    priority: 'high',
    submittedBy: 'Mara Ostheim',
    submittedByRole: 'Retention Manager',
    submittedAt: '30m ago',
    waitingFor: 'You · re-review required',
    slaHint: 'Approval invalidated by edit',
    brandScope: 'selected',
    brands: ['ACR', 'SPC'],
    audienceSize: 48200,
    excludedPlayers: 1340,
    rewardSetup: '€25 bonus funds · 3 quests',
    fulfillmentMethod: 'MonoPulse triggers platform bonus',
    fulfillmentHealth: 'connected',
    fulfillmentNote: 'Platform API reachable · avg 240ms',
    budgetCap: 25000,
    projectedSpend: 18600,
    currency: 'EUR',
    checks: [
      PASS('bc', 'Budget', 'Budget cap set', 'Hard cap €25,000 · projected €18,600 (74%).'),
      PASS('ap', 'Approvals', 'Approval routed', 'Standard retention approval.'),
      PASS('fa', 'Fraud & abuse', 'Abuse filters applied', 'Multi-account and bonus-abuse rules attached.'),
      PASS('rg', 'Responsible gambling', 'RG exclusions applied', '1,340 players removed.'),
      PASS('ju', 'Jurisdiction', 'Mapping valid', 'Both brands within one licence.'),
      WARN('fu', 'Fulfillment', 'Audience expanded post-approval', 'Audience grew from 32,000 to 48,200 after approval — projected spend increased 46%.'),
      PASS('au', 'Audit', 'Audit trail complete', 'Change history recorded.'),
    ],
    changesSinceReview: [
      { field: 'Audience — segments', before: 'Weekend players', after: 'Weekend players, Reactivated', by: 'Mara Ostheim', at: '30m ago', sensitive: true },
      { field: 'Estimated reach', before: '32,000', after: '48,200', by: 'System (recalculated)', at: '30m ago', sensitive: true },
      { field: 'Projected spend', before: '€12,700', after: '€18,600', by: 'System (recalculated)', at: '30m ago', sensitive: true },
    ],
    reviewerName: 'Sofia Lindqvist',
    decidedAt: '14 Mar · 08:10 (invalidated)',
    audit: [
      { id: 'a1', actor: 'Mara Ostheim', actorRole: 'Retention Manager', action: 'Submitted for approval', at: '13 Mar · 18:00', kind: 'submit' },
      { id: 'a2', actor: 'Sofia Lindqvist', actorRole: 'Risk & Compliance', action: 'Approved campaign', at: '14 Mar · 08:10', kind: 'approve' },
      { id: 'a3', actor: 'Mara Ostheim', actorRole: 'Retention Manager', action: 'Edited audience segments', detail: 'Added "Reactivated" segment', at: '14 Mar · 08:40', kind: 'edit' },
      { id: 'a4', actor: 'System', actorRole: 'Safety engine', action: 'Approval reset', detail: 'Sensitive field changed after approval — re-review required', at: '14 Mar · 08:40', kind: 'reset' },
    ],
  },
  {
    id: 'rv-3004',
    campaignId: 'c-1031',
    name: 'Slots Weekly Leaderboard',
    type: 'race',
    decision: 'approved',
    priority: 'normal',
    submittedBy: 'Priya Nair',
    submittedByRole: 'Retention Manager',
    submittedAt: '2d ago',
    waitingFor: '—',
    slaHint: 'Approved',
    brandScope: 'selected',
    brands: ['SPC', 'LKF'],
    audienceSize: 61000,
    excludedPlayers: 1710,
    rewardSetup: 'Top 50 share €30,000 pool',
    fulfillmentMethod: 'Use existing bonus GUID',
    fulfillmentHealth: 'connected',
    fulfillmentNote: 'GUID validated against catalog',
    budgetCap: 30000,
    projectedSpend: 30000,
    currency: 'EUR',
    checks: [
      PASS('bc', 'Budget', 'Budget cap set', 'Fixed prize pool €30,000.'),
      PASS('ap', 'Approvals', 'Approval routed', 'Standard retention approval.'),
      PASS('fa', 'Fraud & abuse', 'Abuse filters applied', 'Collusion and rank-manipulation checks attached.'),
      PASS('rg', 'Responsible gambling', 'RG exclusions applied', '1,710 players removed.'),
      PASS('ju', 'Jurisdiction', 'Mapping valid', 'Both brands within one licence.'),
      PASS('fu', 'Fulfillment', 'Fulfillment healthy', 'Existing bonus GUID validated.'),
      PASS('au', 'Audit', 'Audit trail complete', 'Change history recorded.'),
    ],
    changesSinceReview: [],
    reviewerComment: 'Clean setup, all checks green. Approved for launch.',
    reviewerName: 'Sofia Lindqvist',
    decidedAt: '12 Mar · 10:04',
    audit: [
      { id: 'a1', actor: 'Priya Nair', actorRole: 'Retention Manager', action: 'Submitted for approval', at: '11 Mar · 16:30', kind: 'submit' },
      { id: 'a2', actor: 'Sofia Lindqvist', actorRole: 'Risk & Compliance', action: 'Approved campaign', at: '12 Mar · 10:04', kind: 'approve' },
    ],
  },
  {
    id: 'rv-3001',
    campaignId: 'c-1012',
    name: 'Cash Splash Prize Drop',
    type: 'prizedrop',
    decision: 'rejected',
    priority: 'normal',
    submittedBy: 'Priya Nair',
    submittedByRole: 'Retention Manager',
    submittedAt: '1d ago',
    waitingFor: '—',
    slaHint: 'Rejected',
    brandScope: 'selected',
    brands: ['GLR'],
    audienceSize: 44000,
    excludedPlayers: 0,
    rewardSetup: 'Random cash drops · €12,000 pool',
    fulfillmentMethod: 'Operator wallet payout',
    fulfillmentHealth: 'error',
    fulfillmentNote: 'Wallet route returned auth errors on last sync',
    budgetCap: 12000,
    projectedSpend: 12000,
    currency: 'EUR',
    checks: [
      PASS('bc', 'Budget', 'Budget cap set', 'Fixed pool €12,000.'),
      PASS('ap', 'Approvals', 'Approval routed', 'Standard approval.'),
      WARN('fa', 'Fraud & abuse', 'Random payout exposure', 'Untargeted cash drops warrant abuse monitoring.'),
      BLOCK('rg', 'Responsible gambling', 'RG exclusions not applied', 'No responsible-gambling exclusions were configured — self-excluded players are in the audience.'),
      PASS('ju', 'Jurisdiction', 'Mapping valid', 'Single brand licence.'),
      BLOCK('fu', 'Fulfillment', 'Wallet payout failing', 'Provider auth error on last sync — rewards cannot be granted.'),
      PASS('au', 'Audit', 'Audit trail complete', 'Change history recorded.'),
    ],
    changesSinceReview: [],
    reviewerComment: 'Rejected. Responsible-gambling exclusions are missing entirely and the wallet payout route is failing auth. Cash drops with no RG filtering are not acceptable. Rebuild with exclusions applied and a working fulfillment route.',
    reviewerName: 'Sofia Lindqvist',
    decidedAt: '13 Mar · 09:48',
    audit: [
      { id: 'a1', actor: 'Priya Nair', actorRole: 'Retention Manager', action: 'Submitted for approval', at: '12 Mar · 14:00', kind: 'submit' },
      { id: 'a2', actor: 'Sofia Lindqvist', actorRole: 'Risk & Compliance', action: 'Rejected campaign', detail: 'Missing RG exclusions + failing fulfillment', at: '13 Mar · 09:48', kind: 'reject' },
      { id: 'a3', actor: 'Sofia Lindqvist', actorRole: 'Risk & Compliance', action: 'Left review comment', at: '13 Mar · 09:48', kind: 'comment' },
    ],
  },
];

// Turn a submitted draft campaign into a live review for the queue.
let idSeq = 4000;

const CAT: Record<string, CheckCategory> = {
  fulfill: 'Fulfillment', ext: 'Fulfillment', wallet: 'Fulfillment',
  budget: 'Budget', daily: 'Budget',
  rg: 'Responsible gambling', jur: 'Jurisdiction', rwd: 'Approvals',
};

export function buildReviewFromDraft(draft: DraftCampaign): Review {
  idSeq += 1;
  const aud = estimateAudience(draft);
  const blockers = getBlockers(draft);
  const warnings = getWarnings(draft);
  const fm = fulfillmentById(draft.fulfillmentMethod);
  const cap = Number(draft.budgetCap) || 0;
  const perPlayer = Number(draft.maxPerPlayer) || 0;
  const rawSpend = perPlayer > 0 ? aud.size * perPlayer : cap * 0.78;
  const projectedSpend = cap > 0 ? Math.min(cap, Math.round(rawSpend)) : Math.round(rawSpend);

  const brands = draft.brandScope === 'network' ? BRANDS.map((b) => b.code) : draft.brands;

  const checks: CheckItem[] = [
    ...blockers.map((b) => ({ id: b.id, category: CAT[b.id] ?? 'Audit', label: b.title, detail: b.detail, severity: 'blocker' as CheckSeverity })),
    ...warnings.map((w) => ({ id: w.id, category: CAT[w.id] ?? 'Audit', label: w.title, detail: w.detail, severity: 'warning' as CheckSeverity })),
  ];
  const covered = new Set(checks.map((c) => c.category));
  const passes: { cat: CheckCategory; label: string; detail: string }[] = [
    { cat: 'Budget', label: 'Budget cap set', detail: `Hard cap ${cap ? fmtMoney(cap, draft.currency) : 'set'} with projected spend ${fmtMoney(projectedSpend, draft.currency)}.` },
    { cat: 'Approvals', label: 'Approval routed', detail: 'Submitted to Risk & Compliance for review.' },
    { cat: 'Fraud & abuse', label: 'Abuse filters applied', detail: 'Bonus-abuse and multi-account rules attached from the risk engine.' },
    { cat: 'Responsible gambling', label: 'RG exclusions applied', detail: `${fmtNum(aud.excluded)} self-excluded and limited players removed from the audience.` },
    { cat: 'Jurisdiction', label: 'Jurisdiction mapping valid', detail: 'Targeted brands operate under compatible licences.' },
    { cat: 'Fulfillment', label: 'Fulfillment healthy', detail: fm ? fm.note : 'Reward fulfillment route configured.' },
    { cat: 'Audit', label: 'Audit trail complete', detail: 'Full change history recorded since draft creation.' },
  ];
  passes.forEach((p) => { if (!covered.has(p.cat)) checks.push({ id: `pass-${p.cat}`, category: p.cat, label: p.label, detail: p.detail, severity: 'pass' }); });

  const highReward = Number(draft.rewardAmount) > 500;

  return {
    id: `rv-${idSeq}`,
    campaignId: `draft-${idSeq}`,
    name: draft.name || 'Untitled campaign',
    type: draft.type ?? 'mission',
    decision: blockers.length > 0 ? 'blocked' : 'pending',
    priority: blockers.length > 0 || warnings.length > 0 || highReward ? 'high' : 'normal',
    submittedBy: draft.owner,
    submittedByRole: 'Retention Manager',
    submittedAt: 'just now',
    waitingFor: blockers.length > 0 ? 'Blocked — creator action needed' : 'You · Risk & Compliance',
    slaHint: blockers.length > 0 ? 'Cannot approve until resolved' : 'SLA 4h · just submitted',
    brandScope: draft.brandScope === 'network' ? 'all' : 'selected',
    brands,
    audienceSize: aud.size,
    excludedPlayers: aud.excluded,
    rewardSetup: draft.rewardType && draft.rewardAmount ? `${fmtMoney(Number(draft.rewardAmount) || 0, draft.currency)} ${draft.rewardType}` : 'Reward not fully set',
    fulfillmentMethod: fm?.name ?? 'Not selected',
    fulfillmentHealth: fm?.health ?? 'error',
    fulfillmentNote: fm?.note ?? 'No fulfillment method selected.',
    budgetCap: cap,
    projectedSpend,
    currency: draft.currency,
    checks,
    changesSinceReview: [],
    audit: [
      { id: `${idSeq}-c`, actor: draft.owner, actorRole: 'Retention Manager', action: 'Created campaign', at: 'earlier today', kind: 'create' },
      { id: `${idSeq}-s`, actor: draft.owner, actorRole: 'Retention Manager', action: 'Submitted for approval', detail: 'Routed to Risk & Compliance', at: 'just now', kind: 'submit' },
    ],
  };
}
