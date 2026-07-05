import {
  Users,
  Building2,
  Target,
  Gift,
  Plug,
  Coins,
  ShieldCheck,
  UserCheck,
  ListChecks,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCampaign } from '../../context/CampaignContext';
import { getSubtype, getType, fmtMoney, fmtNum, BRANDS } from '../../data/campaigns';
import { estimateAudience, verdict, fulfillmentById, getBlockers, getWarnings } from '../../data/validation';
import { moduleSectionsForStep } from '../../data/modules';
import type { ModuleStep } from '../../data/modules';

type Dot = 'empty' | 'set' | 'warning' | 'blocked';

const DOT_COLOR: Record<Dot, string> = {
  empty: 'var(--fg-muted)',
  set: 'var(--accent)',
  warning: 'var(--warning)',
  blocked: 'var(--danger)',
};

interface Row {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  dot: Dot;
}

export default function ContextRail() {
  const { draft } = useCampaign();
  const type = draft.type ? getType(draft.type) : null;
  const aud = estimateAudience(draft);
  const v = verdict(draft);
  const fm = fulfillmentById(draft.fulfillmentMethod);
  const blockers = getBlockers(draft);
  const warnings = getWarnings(draft);
  const subtype = getSubtype(draft.type, draft.subtype);
  const moduleSteps: ModuleStep[] = ['setup', 'logic', 'rewards', 'budget'];
  const mechanicSections = moduleSteps.flatMap((step) =>
    moduleSectionsForStep(draft.type, step, draft.subtype).map((section) => ({ step, section }))
  );

  const networkAll = draft.brandScope === 'network' && draft.network.brandIdsMode === 'all';
  const brandsValue = networkAll
    ? `Network · all ${BRANDS.length}`
    : draft.brands.length > 0
    ? `${draft.brandScope === 'network' ? 'Network · ' : ''}${draft.brands.join(' · ')}`
    : 'No brands selected';

  const validRuleCount = draft.rules.filter((r) => r.when && r.thenAction).length;
  const actionValue = validRuleCount > 0
    ? `${validRuleCount} rule${validRuleCount === 1 ? '' : 's'} set`
    : type
    ? `${type.name} rules`
    : 'No type';

  const rewardValue =
    draft.rewardType && draft.rewardAmount
      ? `${fmtMoney(Number(draft.rewardAmount) || 0, draft.currency)} · ${draft.rewardType}`
      : draft.rewardType || 'Not set';

  const approvalLabel: Record<string, string> = {
    none: 'Not submitted',
    submitted: 'Submitted',
    pending: 'Pending review',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  const rows: Row[] = [
    {
      icon: Users,
      label: 'Audience scope',
      value: aud.size > 0 ? `${fmtNum(aud.size)} players` : 'Audience not set',
      sub: aud.excluded > 0 ? `${fmtNum(aud.excluded)} excluded` : undefined,
      dot: aud.size > 0 ? 'set' : 'empty',
    },
    {
      icon: Building2,
      label: 'Which brands',
      value: brandsValue,
      dot: networkAll || draft.brands.length > 0 ? 'set' : 'empty',
    },
    {
      icon: Target,
      label: 'Mission logic',
      value: actionValue,
      dot: validRuleCount > 0 ? 'set' : 'empty',
    },
    {
      icon: Gift,
      label: 'Outcome granted',
      value: rewardValue,
      sub: draft.maxPerPlayer ? `max ${fmtMoney(Number(draft.maxPerPlayer) || 0, draft.currency)}/player` : undefined,
      dot: draft.rewardType && draft.rewardAmount ? 'set' : 'empty',
    },
    {
      icon: Plug,
      label: 'How it fulfills',
      value: fm ? fm.name : 'No method',
      sub: fm ? fm.note : undefined,
      dot: fm ? (fm.health === 'error' ? 'blocked' : fm.health === 'degraded' ? 'warning' : 'set') : 'empty',
    },
    {
      icon: Coins,
      label: 'Money at risk',
      value: draft.budgetCap ? fmtMoney(Number(draft.budgetCap) || 0, draft.currency) : 'No cap set',
      sub: draft.dailyCap ? `${fmtMoney(Number(draft.dailyCap) || 0, draft.currency)}/day` : undefined,
      dot: draft.budgetCap ? 'set' : 'empty',
    },
    {
      icon: ShieldCheck,
      label: 'Compliance',
      value: v === 'blocked' ? `${blockers.length} blockers` : v === 'warning' ? `${warnings.length} warnings` : 'All checks passed',
      dot: v === 'blocked' ? 'blocked' : v === 'warning' ? 'warning' : 'set',
    },
    {
      icon: UserCheck,
      label: 'Approval',
      value: approvalLabel[draft.approvalState],
      dot: draft.approvalState === 'approved' ? 'set' : draft.approvalState === 'rejected' ? 'blocked' : draft.approvalState === 'pending' || draft.approvalState === 'submitted' ? 'warning' : 'empty',
    },
  ];

  return (
    <div className="sticky top-6 w-[320px] shrink-0 self-start">
      <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        {/* Header */}
        <div className="border-b px-4 py-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">Campaign summary</div>
          <div className="mt-1.5 flex items-center gap-2">
            {type && (
              <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>
                <TypeIcon />
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-semibold text-fg-primary">{draft.name || 'Untitled campaign'}</div>
              <div className="text-[11.5px] text-fg-muted">{type ? type.name : 'No type'}</div>
            </div>
          </div>
        </div>

        {/* Spine */}
        <div className="flex flex-col">
          {rows.map((r, i) => {
            const Icon = r.icon;
            return (
              <div
                key={r.label}
                className="flex items-start gap-3 px-4 py-2.5"
                style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}
              >
                <div className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                  <Icon size={14} strokeWidth={1.75} style={{ color: 'var(--fg-muted)' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: DOT_COLOR[r.dot] }} />
                    <span className="text-[10.5px] font-medium uppercase tracking-wide text-fg-muted">{r.label}</span>
                  </div>
                  <div
                    className="mt-0.5 truncate text-[12.5px] font-medium"
                    style={{ color: r.dot === 'empty' ? 'var(--fg-muted)' : 'var(--fg-primary)' }}
                  >
                    {r.value}
                  </div>
                  {r.sub && <div className="truncate text-[11px] text-fg-muted">{r.sub}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 px-1 text-[11px] leading-relaxed text-fg-muted">
        This summary updates live as you build. Every launch decision is grounded in these eight signals.
      </p>

      {type && mechanicSections.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <div className="border-b px-4 py-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
              <ListChecks size={13} strokeWidth={2} /> Mechanic blueprint
            </div>
            <div className="mt-1 text-[12.5px] font-medium text-fg-primary">
              {type.name}{subtype ? ` · ${subtype.name}` : ''}
            </div>
          </div>
          <div className="flex flex-col">
            {mechanicSections.map(({ step, section }) => {
              const Icon = section.icon;
              return (
                <div key={`${step}-${section.id}`} className="flex items-start gap-3 border-t px-4 py-2.5 first:border-t-0" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>
                    <Icon size={13} strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-medium text-fg-primary">{section.title}</span>
                      <span className="rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide" style={{ background: 'var(--surface-3)', color: 'var(--fg-muted)' }}>{step}</span>
                    </div>
                    {section.desc && <div className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-fg-muted">{section.desc}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  function TypeIcon() {
    if (!type) return null;
    const Icon = type.icon;
    return <Icon size={15} strokeWidth={1.75} />;
  }
}
