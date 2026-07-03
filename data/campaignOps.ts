import type { CampaignTypeId } from './campaigns';

export type OpsPriority = 'critical' | 'high' | 'medium' | 'low';
export type OpsTaskStatus = 'blocked' | 'in_review' | 'in_progress' | 'ready' | 'done';
export type ReportStatus = 'draft' | 'scheduled' | 'generating' | 'ready';

export interface CalendarCampaign {
  id: string;
  name: string;
  type: CampaignTypeId;
  brand: string;
  owner: string;
  start: string;
  end: string;
  status: 'draft' | 'approval' | 'scheduled' | 'live' | 'ending' | 'reporting';
  risk: 'clear' | 'warning' | 'blocked';
}

export interface OpsTask {
  id: string;
  campaignId: string;
  title: string;
  owner: string;
  team: 'CRM' | 'Casino' | 'Risk' | 'Backend' | 'Finance';
  due: string;
  status: OpsTaskStatus;
  priority: OpsPriority;
  blocker?: string;
}

export interface ReportTemplateSection {
  id: string;
  label: string;
  enabled: boolean;
  owner: 'CRM' | 'Casino' | 'Risk' | 'Backend' | 'Finance';
}

export interface GeneratedReport {
  id: string;
  campaignId: string;
  campaignName: string;
  generatedAt: string;
  status: ReportStatus;
  owner: string;
  roi: string;
  rewardCost: string;
  audienceReached: string;
  riskEvents: number;
}

export const CALENDAR_CAMPAIGNS: CalendarCampaign[] = [
  {
    id: 'c-1042',
    name: 'Weekend Warriors Mission',
    type: 'mission',
    brand: 'ACR',
    owner: 'Mara Ostheim',
    start: 'Mon 08 Jul',
    end: 'Sun 14 Jul',
    status: 'live',
    risk: 'warning',
  },
  {
    id: 'c-2210',
    name: 'High-Roller Rakeback',
    type: 'rakeback',
    brand: 'VGV',
    owner: 'Sofia Lindqvist',
    start: 'Wed 10 Jul',
    end: 'Wed 31 Jul',
    status: 'scheduled',
    risk: 'clear',
  },
  {
    id: 'c-3381',
    name: 'Friday Prize Drop',
    type: 'prizedrop',
    brand: 'SPC',
    owner: 'Nika Bell',
    start: 'Fri 12 Jul',
    end: 'Fri 12 Jul',
    status: 'approval',
    risk: 'blocked',
  },
  {
    id: 'c-4419',
    name: 'VIP Ladder Race',
    type: 'race',
    brand: 'Network',
    owner: 'Mara Ostheim',
    start: 'Mon 15 Jul',
    end: 'Sun 21 Jul',
    status: 'draft',
    risk: 'clear',
  },
  {
    id: 'c-1028',
    name: 'June Cashback Settlement',
    type: 'rakeback',
    brand: 'LKF',
    owner: 'Finance Ops',
    start: 'Sat 01 Jun',
    end: 'Sun 30 Jun',
    status: 'reporting',
    risk: 'clear',
  },
];

export const OPS_TASKS: OpsTask[] = [
  {
    id: 'task-1',
    campaignId: 'c-1042',
    title: 'Confirm RG exclusion snapshot before final launch window',
    owner: 'Irakli Risk',
    team: 'Risk',
    due: 'Today 16:00',
    status: 'blocked',
    priority: 'critical',
    blocker: 'Waiting for jurisdiction rule confirmation',
  },
  {
    id: 'task-2',
    campaignId: 'c-1042',
    title: 'Validate 20 free spins bonus GUID against ACR production',
    owner: 'Java Backend',
    team: 'Backend',
    due: 'Today 18:00',
    status: 'in_progress',
    priority: 'high',
  },
  {
    id: 'task-3',
    campaignId: 'c-3381',
    title: 'Approve prize drop odds disclosure copy',
    owner: 'Lena Compliance',
    team: 'Risk',
    due: 'Fri 10:00',
    status: 'in_review',
    priority: 'high',
  },
  {
    id: 'task-4',
    campaignId: 'c-4419',
    title: 'Attach VIP Ladder reward package and budget cap',
    owner: 'Sofia Lindqvist',
    team: 'Casino',
    due: 'Mon 12:00',
    status: 'ready',
    priority: 'medium',
  },
  {
    id: 'task-5',
    campaignId: 'c-1028',
    title: 'Reconcile cashback liability before report export',
    owner: 'Finance Ops',
    team: 'Finance',
    due: 'Overdue',
    status: 'in_progress',
    priority: 'critical',
  },
];

export const REPORT_TEMPLATE_SECTIONS: ReportTemplateSection[] = [
  { id: 'overview', label: 'Campaign summary and lifecycle timeline', enabled: true, owner: 'CRM' },
  { id: 'roi', label: 'ROI, GGR/NGR lift and reward cost', enabled: true, owner: 'Finance' },
  { id: 'audience', label: 'Audience reach, segment movement and exclusions', enabled: true, owner: 'CRM' },
  { id: 'fulfillment', label: 'Reward fulfillment, failures and retries', enabled: true, owner: 'Backend' },
  { id: 'risk', label: 'Risk, RG, KYC and jurisdiction events', enabled: true, owner: 'Risk' },
  { id: 'winners', label: 'Winners / leaderboard export', enabled: false, owner: 'Casino' },
];

export const GENERATED_REPORTS: GeneratedReport[] = [
  {
    id: 'rep-8841',
    campaignId: 'c-1028',
    campaignName: 'June Cashback Settlement',
    generatedAt: 'Auto-generated 01 Jul · 08:10',
    status: 'ready',
    owner: 'Finance Ops',
    roi: '+18.4%',
    rewardCost: '€46,800',
    audienceReached: '12,840',
    riskEvents: 3,
  },
  {
    id: 'rep-8842',
    campaignId: 'c-1042',
    campaignName: 'Weekend Warriors Mission',
    generatedAt: 'Scheduled after 14 Jul · 23:59',
    status: 'scheduled',
    owner: 'Mara Ostheim',
    roi: 'Projected +12.2%',
    rewardCost: '€5,280',
    audienceReached: '5,564',
    riskEvents: 2,
  },
];
