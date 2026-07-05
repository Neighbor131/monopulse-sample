import { CAMPAIGNS } from './campaigns';
import { EVENT_LOGS, PROVIDERS, integrationKpis } from './integrations';
import { REWARDS, MANUAL_GRANTS, RISK_GATES, LIABILITY, rewardKpis } from './rewards';
import { SEGMENTS, segmentKpis } from './segments';
import { ORG_BRANDS, RESTRICTIONS, orgKpis } from './org';
import { REVIEWS, reviewCounts } from './reviews';

export type DashboardSeverity = 'healthy' | 'warning' | 'critical';
export type QueueKind = 'approval' | 'reward' | 'segment' | 'integration' | 'brand' | 'risk';
export type TimelineKind = 'campaign' | 'reward' | 'segment' | 'integration' | 'risk';

export interface HealthCard {
  id: string;
  label: string;
  value: string;
  detail: string;
  severity: DashboardSeverity;
  href: string;
}

export interface ActionQueueItem {
  id: string;
  kind: QueueKind;
  title: string;
  detail: string;
  owner: string;
  severity: DashboardSeverity;
  href: string;
}

export interface PerformanceMetric {
  label: string;
  value: string;
  delta: string;
  tone: 'up' | 'down' | 'neutral' | 'warning';
}

export interface TimelineItem {
  id: string;
  at: string;
  kind: TimelineKind;
  title: string;
  detail: string;
  severity: DashboardSeverity;
  href: string;
}

export interface ExperimentRow {
  id: string;
  name: string;
  variantA: string;
  variantB: string;
  audience: number;
  lift: string;
  confidence: string;
  status: 'running' | 'needs_review' | 'winner';
}

export interface QuickLink {
  label: string;
  detail: string;
  href: string;
}

export interface MoneyKpi {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: 'good' | 'warning' | 'danger' | 'neutral';
  href: string;
}

export interface ProfitabilityRow {
  id: string;
  name: string;
  mechanic: string;
  brands: string;
  budgetUsed: string;
  rewardCost: string;
  projectedNgr: string;
  roi: string;
  status: 'profitable' | 'watch' | 'blocked';
  href: string;
}

export interface BrandMoneyRow {
  brand: string;
  issued: string;
  pending: string;
  capUsed: number;
  health: DashboardSeverity;
  href: string;
}

export interface MoneyActionItem {
  id: string;
  title: string;
  amount: string;
  detail: string;
  owner: string;
  severity: DashboardSeverity;
  href: string;
}

const money = (amount: number) => `€${Math.round(amount).toLocaleString()}`;

export const dashboardKpis = () => {
  const campaignActive = CAMPAIGNS.filter((c) => ['live', 'final_day', 'standby', 'pending_seed'].includes(c.status)).length;
  const campaignsAtRisk = CAMPAIGNS.filter((c) => c.risk !== 'none').length;
  const rewards = rewardKpis();
  const integrations = integrationKpis();
  const segments = segmentKpis();
  const reviews = reviewCounts();
  const org = orgKpis();

  return {
    campaignActive,
    campaignsAtRisk,
    rewardFailures: rewards.failedFulfillment,
    rewardLiability: rewards.pendingLiability,
    integrationIncidents: integrations.incidents,
    reviewQueue: reviews.queue,
    blockedSegments: segments.blocked,
    brandIssues: org.blockedRules,
  };
};

export function moneyKpis(): MoneyKpi[] {
  const totalBudget = CAMPAIGNS.reduce((sum, campaign) => sum + campaign.budgetTotal, 0);
  const usedBudget = CAMPAIGNS.reduce((sum, campaign) => sum + campaign.budgetUsed, 0);
  const rewardCost = CAMPAIGNS.reduce((sum, campaign) => sum + campaign.rewardCost, 0);
  const pendingLiability = rewardKpis().pendingLiability;
  const openGrantValue = MANUAL_GRANTS.filter((grant) => ['pending', 'retrying', 'failed'].includes(grant.status)).reduce((sum, grant) => sum + grant.amount, 0);
  const projectedNgr = 1284000;
  const roi = projectedNgr / Math.max(1, rewardCost + pendingLiability);
  const atRisk = pendingLiability + openGrantValue + CAMPAIGNS.filter((campaign) => campaign.risk !== 'none').reduce((sum, campaign) => sum + Math.max(0, campaign.rewardCost), 0);

  return [
    { id: 'ngr', label: 'Projected NGR', value: money(projectedNgr), detail: '+12.4% vs prior campaign cycle', tone: 'good', href: '/analytics' },
    { id: 'cost', label: 'Reward cost', value: money(rewardCost), detail: `${Math.round((rewardCost / totalBudget) * 100)}% of approved campaign budget`, tone: 'warning', href: '/' },
    { id: 'liability', label: 'Open liability', value: money(pendingLiability), detail: `${REWARDS.filter((reward) => reward.pendingLiability > 0).length} reward objects carry exposure`, tone: 'warning', href: '/rewards' },
    { id: 'remaining', label: 'Budget remaining', value: money(totalBudget - usedBudget), detail: `${money(usedBudget)} used from ${money(totalBudget)}`, tone: 'neutral', href: '/ops' },
    { id: 'roi', label: 'Blended ROI', value: `${roi.toFixed(1)}x`, detail: 'projected NGR divided by reward cost + liability', tone: 'good', href: '/analytics' },
    { id: 'risk', label: 'Money at risk', value: money(atRisk), detail: 'blocked grants, open liability and risky campaign spend', tone: 'danger', href: '/safety' },
  ];
}

export function profitabilityRows(): ProfitabilityRow[] {
  const projectedByCampaign = [174000, 286000, 0, 126000, 42000, 690000, 88000, 62000, 38000, 0, 24500, 0, 0];

  return CAMPAIGNS.slice(0, 8).map((campaign, index) => {
    const projectedNgr = projectedByCampaign[index] ?? Math.round(campaign.rewardCost * 2.2);
    const roi = projectedNgr / Math.max(1, campaign.rewardCost || campaign.budgetUsed || 1);
    const used = Math.round((campaign.budgetUsed / campaign.budgetTotal) * 100);
    const status: ProfitabilityRow['status'] = campaign.risk === 'blocked' ? 'blocked' : used > 85 || roi < 1.4 ? 'watch' : 'profitable';

    return {
      id: campaign.id,
      name: campaign.name,
      mechanic: campaign.type,
      brands: campaign.brands.join(', '),
      budgetUsed: `${used}%`,
      rewardCost: money(campaign.rewardCost),
      projectedNgr: projectedNgr ? money(projectedNgr) : 'Not started',
      roi: projectedNgr ? `${roi.toFixed(1)}x` : '—',
      status,
      href: `/campaigns/${campaign.id}`,
    };
  });
}

export function brandMoneyRows(): BrandMoneyRow[] {
  return LIABILITY.map((row) => {
    const used = Math.round(((row.issuedValue + row.pendingValue) / row.cap) * 100);
    const health: DashboardSeverity = row.health === 'failing' || used >= 100 ? 'critical' : row.health === 'warning' || used >= 75 ? 'warning' : 'healthy';
    return {
      brand: row.brand,
      issued: money(row.issuedValue),
      pending: money(row.pendingValue),
      capUsed: used,
      health,
      href: '/rewards',
    };
  }).sort((a, b) => b.capUsed - a.capUsed);
}

export function moneyActions(): MoneyActionItem[] {
  const grantActions = MANUAL_GRANTS.filter((grant) => ['pending', 'retrying', 'failed'].includes(grant.status)).map((grant) => ({
    id: grant.id,
    title: grant.rewardName,
    amount: money(grant.amount),
    detail: `${grant.brand} · ${grant.reason}`,
    owner: grant.requester,
    severity: grant.status === 'failed' || grant.risk === 'blocked' ? 'critical' as DashboardSeverity : 'warning' as DashboardSeverity,
    href: '/rewards',
  }));

  const capActions = RISK_GATES.filter((gate) => gate.status !== 'clear').map((gate) => ({
    id: gate.id,
    title: gate.label,
    amount: gate.status === 'blocked' ? money(rewardKpis().pendingLiability) : 'Review',
    detail: gate.impact,
    owner: gate.owner,
    severity: gate.status === 'blocked' ? 'critical' as DashboardSeverity : 'warning' as DashboardSeverity,
    href: '/safety',
  }));

  const campaignActions = CAMPAIGNS.filter((campaign) => campaign.risk !== 'none').slice(0, 3).map((campaign) => ({
    id: campaign.id,
    title: campaign.name,
    amount: money(campaign.rewardCost),
    detail: campaign.riskNote ?? 'Campaign needs financial/risk review',
    owner: campaign.owner,
    severity: campaign.risk === 'blocked' ? 'critical' as DashboardSeverity : 'warning' as DashboardSeverity,
    href: `/campaigns/${campaign.id}`,
  }));

  return [...grantActions, ...capActions, ...campaignActions].slice(0, 8);
}

export function healthCards(): HealthCard[] {
  const k = dashboardKpis();
  return [
    { id: 'campaigns', label: 'Live campaigns', value: String(k.campaignActive), detail: `${k.campaignsAtRisk} need attention`, severity: k.campaignsAtRisk ? 'warning' : 'healthy', href: '/' },
    { id: 'rewards', label: 'Reward failures', value: String(k.rewardFailures), detail: `€${k.rewardLiability.toLocaleString()} pending liability`, severity: k.rewardFailures ? 'critical' : 'healthy', href: '/rewards' },
    { id: 'risk', label: 'Risk blockers', value: String(k.reviewQueue + RISK_GATES.filter((g) => g.status === 'blocked').length), detail: `${reviewCounts().queue} approval items`, severity: k.reviewQueue ? 'critical' : 'healthy', href: '/safety' },
    { id: 'integrations', label: 'Integration incidents', value: String(k.integrationIncidents), detail: `${EVENT_LOGS.filter((e) => e.status !== 'delivered').length} failed or retrying events`, severity: k.integrationIncidents ? 'warning' : 'healthy', href: '/integrations' },
    { id: 'segments', label: 'Blocked segments', value: String(k.blockedSegments), detail: `${SEGMENTS.filter((s) => s.health === 'warning').length} warnings`, severity: k.blockedSegments ? 'critical' : 'healthy', href: '/segments' },
    { id: 'brands', label: 'Brand readiness', value: String(ORG_BRANDS.filter((b) => b.health === 'ready').length), detail: `${RESTRICTIONS.filter((r) => r.severity !== 'ready').length} restrictions active`, severity: k.brandIssues ? 'warning' : 'healthy', href: '/org' },
  ];
}

export function actionQueue(): ActionQueueItem[] {
  return [
    ...REVIEWS.filter((r) => ['pending', 'blocked', 'reset'].includes(r.decision)).slice(0, 3).map((r) => ({
      id: r.id,
      kind: 'approval' as QueueKind,
      title: r.name,
      detail: `${r.waitingFor} · ${r.slaHint}`,
      owner: r.submittedBy,
      severity: r.decision === 'blocked' ? 'critical' as DashboardSeverity : 'warning' as DashboardSeverity,
      href: `/approvals/${r.id}`,
    })),
    ...MANUAL_GRANTS.filter((g) => ['pending', 'retrying', 'failed'].includes(g.status)).map((g) => ({
      id: g.id,
      kind: 'reward' as QueueKind,
      title: g.rewardName,
      detail: `${g.playerId} · ${g.reason}`,
      owner: g.requester,
      severity: g.status === 'failed' || g.risk === 'blocked' ? 'critical' as DashboardSeverity : 'warning' as DashboardSeverity,
      href: '/rewards',
    })),
    ...SEGMENTS.filter((s) => s.health !== 'healthy').slice(0, 3).map((s) => ({
      id: s.id,
      kind: 'segment' as QueueKind,
      title: s.name,
      detail: s.syncStatus,
      owner: s.owner,
      severity: s.health === 'blocked' ? 'critical' as DashboardSeverity : 'warning' as DashboardSeverity,
      href: '/segments',
    })),
    ...PROVIDERS.filter((p) => p.status !== 'healthy').map((p) => ({
      id: p.id,
      kind: 'integration' as QueueKind,
      title: p.provider,
      detail: p.incident ?? `${p.kind} health degraded`,
      owner: 'Technical Admin',
      severity: p.status === 'failing' ? 'critical' as DashboardSeverity : 'warning' as DashboardSeverity,
      href: '/integrations',
    })),
  ].slice(0, 9);
}

export const performanceMetrics = (): PerformanceMetric[] => [
  { label: 'Active players', value: '84,912', delta: '+8.4% vs last week', tone: 'up' },
  { label: 'Campaign ROI', value: '2.7x', delta: '+0.3x from active missions', tone: 'up' },
  { label: 'Reward cost', value: `€${rewardKpis().pendingLiability.toLocaleString()}`, delta: 'liability pending', tone: 'warning' },
  { label: 'Retention lift', value: '+6.1%', delta: 'high-value active segment', tone: 'up' },
];

export const timeline = (): TimelineItem[] => [
  { id: 'tl-1', at: '12:46', kind: 'segment', title: 'High value active players recalculated', detail: '+346 players after settled bet events', severity: 'healthy', href: '/segments' },
  { id: 'tl-2', at: '12:44', kind: 'reward', title: 'Jackpot cash payout blocked', detail: 'Wallet auth failure and cap breach', severity: 'critical', href: '/rewards' },
  { id: 'tl-3', at: '12:41', kind: 'integration', title: 'Reward grant retrying', detail: 'GLR webhook returned 503', severity: 'warning', href: '/integrations' },
  { id: 'tl-4', at: '12:31', kind: 'risk', title: 'Review queue updated', detail: `${reviewCounts().queue} items need reviewer action`, severity: 'warning', href: '/approvals' },
  { id: 'tl-5', at: '12:18', kind: 'campaign', title: 'Welcome mission bonus mapping updated', detail: 'Sandbox bonus GUID assigned', severity: 'healthy', href: '/' },
  { id: 'tl-6', at: '11:58', kind: 'risk', title: 'Suppression rule updated', detail: 'Cooling-off status added to mandatory exclusions', severity: 'healthy', href: '/segments' },
];

export const experiments: ExperimentRow[] = [
  { id: 'exp-01', name: 'Mission setup wizard', variantA: 'Module-first', variantB: 'Goal-first', audience: 18400, lift: '+7.8%', confidence: '91%', status: 'running' },
  { id: 'exp-02', name: 'Rakeback reward copy', variantA: 'Cashback framing', variantB: 'Loss protection framing', audience: 7200, lift: '+3.1%', confidence: '78%', status: 'needs_review' },
  { id: 'exp-03', name: 'Prize drop eligibility preview', variantA: 'Compact warnings', variantB: 'Expanded checklist', audience: 11200, lift: '+11.4%', confidence: '96%', status: 'winner' },
];

export const quickLinks: QuickLink[] = [
  { label: 'Create campaign', detail: 'Start from campaign type picker', href: '/create' },
  { label: 'Review approvals', detail: `${reviewCounts().queue} items in queue`, href: '/approvals' },
  { label: 'Inspect failed rewards', detail: `${rewardKpis().failedFulfillment} failures`, href: '/rewards' },
  { label: 'Open segment builder', detail: 'Preview audience rules', href: '/segments' },
  { label: 'Run integration health', detail: `${integrationKpis().incidents} incidents`, href: '/integrations' },
  { label: 'Brand readiness', detail: `${ORG_BRANDS.length} brands`, href: '/org' },
];
