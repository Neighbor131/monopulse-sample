import { CAMPAIGNS } from './campaigns';
import { EVENT_LOGS, PROVIDERS, integrationKpis } from './integrations';
import { REWARDS, MANUAL_GRANTS, RISK_GATES, rewardKpis } from './rewards';
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
