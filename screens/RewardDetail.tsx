import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Gift,
  KeyRound,
  Plug,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ActionModal from '../components/ActionModal';
import type { ActionModalState } from '../components/ActionModal';
import {
  FULFILLMENT_LABEL,
  GATE_META,
  HEALTH_META,
  KIND_LABEL,
  LIABILITY,
  MANUAL_GRANTS,
  REWARD_AUDIT,
  REWARDS,
  RISK_GATES,
  STATUS_META,
} from '../data/rewards';
import type {
  FulfillmentMode,
  FulfillmentStatus,
  GateStatus,
  GrantStatus,
  ManualGrant,
  RewardAudit,
  RewardItem,
  RewardStatus,
  RiskGate,
} from '../data/rewards';

const FULFILLMENT_COPY: Record<FulfillmentMode, { title: string; route: string; request: string; response: string }> = {
  operator_wallet: {
    title: 'MonoPulse validates gates, then calls the operator wallet payout endpoint.',
    route: 'POST /wallet/rewards/grant',
    request: 'playerId, brandId, rewardId, amount, currency, auditReason',
    response: 'walletTransactionId, balanceDelta, ledgerStatus',
  },
  monopulse_trigger: {
    title: 'MonoPulse creates the reward internally and fires a platform bonus trigger.',
    route: 'POST /platform/bonus/create',
    request: 'triggerKey, campaignId, playerId, rewardTemplate, expiry',
    response: 'platformBonusId, triggerStatus, retryAfter',
  },
  bonus_guid: {
    title: 'MonoPulse references an existing bonus GUID and distributes it after gate checks.',
    route: 'POST /bonus-guid/distribute',
    request: 'bonusGuid, playerId, campaignContext, brandId',
    response: 'bonusAssignmentId, providerStatus, expiresAt',
  },
  manual_ops: {
    title: 'MonoPulse queues a manual task with mandatory audit notes and reviewer ownership.',
    route: 'POST /manual-grants/queue',
    request: 'assignee, playerId, rewardId, shippingOrOpsNote, approvalId',
    response: 'taskId, reviewerQueue, slaStatus',
  },
};

export default function RewardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [action, setAction] = useState<ActionModalState | null>(null);
  const reward = REWARDS.find((item) => item.id === id) ?? REWARDS[0];

  const context = useMemo(() => getRewardContext(reward), [reward]);
  const fulfillment = FULFILLMENT_COPY[reward.fulfillment];
  const test = providerTest(reward, context.grants);

  return (
    <div className="mx-auto w-full max-w-[1360px] px-8 py-6">
      <button onClick={() => navigate('/rewards')} className="mb-4 flex items-center gap-2 text-[12.5px] font-semibold text-fg-secondary hover:text-fg-primary">
        <ArrowLeft size={15} /> Rewards
      </button>

      <section className="rounded-xl border p-5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
              <Gift size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[21px] font-semibold tracking-tight text-fg-primary">{reward.name}</h1>
                <StatusPill status={reward.status} />
                <HealthPill status={reward.health} />
                <GatePill status={reward.risk} />
              </div>
              <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-fg-secondary">
                {KIND_LABEL[reward.kind]} reward used for {reward.campaignUse.toLowerCase()}, owned by {reward.owner}.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11.5px] text-fg-muted">
                <CodeTag>{reward.id}</CodeTag>
                <CodeTag>{reward.brand}</CodeTag>
                <CodeTag>{FULFILLMENT_LABEL[reward.fulfillment]}</CodeTag>
                <CodeTag>{reward.provider}</CodeTag>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Action icon={Activity} label="Test grant" primary onClick={() => setAction({ kind: 'testGrant', context: reward.id })} />
            <Action icon={RefreshCw} label={reward.health === 'failing' ? 'Retry provider' : 'Sync mapping'} onClick={() => setAction({ kind: 'syncGuids', title: reward.health === 'failing' ? 'Retry provider mapping' : 'Sync reward mapping', context: `${reward.provider} · ${reward.brand}` })} />
            <Action icon={ShieldCheck} label="Run gates" onClick={() => setAction({ kind: 'runGates', context: `${reward.id} · ${reward.risk}` })} />
          </div>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-5 gap-3">
        <Metric icon={Wallet} label="Cost per grant" value={`€${reward.costPerGrant.toLocaleString()}`} />
        <Metric icon={Clock} label="Pending liability" value={`€${reward.pendingLiability.toLocaleString()}`} tone={reward.risk === 'blocked' ? 'danger' : reward.risk === 'warning' ? 'warning' : 'default'} />
        <Metric icon={CheckCircle2} label="Issued" value={reward.issued.toLocaleString()} />
        <Metric icon={Gift} label="Claimed" value={reward.claimed.toLocaleString()} />
        <Metric icon={RotateCcw} label="Expired" value={reward.expired.toLocaleString()} />
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_360px] gap-4">
        <main className="grid gap-4">
          <Panel title="Fulfillment mapping" subtitle={fulfillment.title}>
            <div className="grid grid-cols-[1fr_280px] gap-4">
              <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
                <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">
                  <Plug size={13} /> Provider route
                </div>
                <div className="mt-3 rounded-md px-3 py-2 font-mono text-[12px] text-fg-primary" style={{ background: 'var(--surface-3)' }}>{fulfillment.route}</div>
                <InfoGrid rows={[
                  ['Request payload', fulfillment.request],
                  ['Expected response', fulfillment.response],
                  ['Provider', reward.provider],
                  ['Bonus GUID', reward.bonusGuid ?? 'Not required'],
                ]} />
              </div>
              <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
                <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">
                  <KeyRound size={13} /> Mapping owner
                </div>
                <InfoGrid rows={[
                  ['Owner', reward.owner],
                  ['Brand', reward.brand],
                  ['Type', KIND_LABEL[reward.kind]],
                  ['Updated', reward.updatedAt],
                ]} />
              </div>
            </div>
          </Panel>

          <Panel title="Provider test grant" subtitle="Shows whether the current reward can move from campaign action to backend fulfillment.">
            <div className="grid grid-cols-[1fr_280px] gap-4">
              <div className="rounded-lg border p-4" style={{ borderColor: test.border, background: test.bg }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-mono text-[13px] font-semibold text-fg-primary">{test.code}</div>
                    <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-fg-secondary">{test.message}</p>
                  </div>
                  <HealthPill status={reward.health} />
                </div>
                <div className="mt-4 rounded-md px-3 py-2 font-mono text-[11px] leading-relaxed text-fg-secondary" style={{ background: 'var(--surface-3)' }}>
                  rewardId={reward.id}<br />
                  brand={reward.brand}<br />
                  mode={reward.fulfillment}
                </div>
              </div>
              <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
                <InfoGrid rows={[
                  ['Latency', test.latency],
                  ['Last checked', reward.updatedAt],
                  ['Retry policy', reward.health === 'failing' ? 'Manual retry required' : 'Automatic retry enabled'],
                  ['Queue impact', `${context.grants.length} related grant${context.grants.length === 1 ? '' : 's'}`],
                ]} />
              </div>
            </div>
          </Panel>

          <Panel title="Grant queue and retry history" subtitle="Manual grants and failed/retrying fulfillment objects connected to this reward.">
            <div className="overflow-hidden rounded-lg border" style={{ borderColor: 'var(--border-subtle)' }}>
              {context.grants.length ? context.grants.map((grant) => <GrantRow key={grant.id} grant={grant} />) : <EmptyRow label="No active grant queue" detail="This reward has no pending, failed or retrying manual grants right now." />}
            </div>
          </Panel>

          <Panel title="Audit timeline" subtitle="Recent changes that backend, risk and CRM teams can trace.">
            <div className="grid gap-2">
              {context.audit.length ? context.audit.map((item) => <AuditRow key={item.id} item={item} />) : <EmptyRow label="No audit records yet" detail="The next mapping, gate or grant action will create a trace here." />}
            </div>
          </Panel>
        </main>

        <aside className="grid content-start gap-4">
          <Panel title="Risk gates" subtitle="Launch blockers and reviewer checks.">
            <div className="grid gap-2">
              {context.gates.map((gate) => <GateRow key={gate.id} gate={gate} />)}
            </div>
          </Panel>

          <Panel title="Liability" subtitle="Brand cap usage for this reward family.">
            {context.liability ? <LiabilityCard reward={reward} used={context.capUsed} /> : <EmptyRow label="No liability row" detail="This brand has no liability configuration in the current mock data." />}
          </Panel>

          <Panel title="Connected usage" subtitle="Where this reward appears in operations.">
            <InfoGrid rows={[
              ['Campaign usage', reward.campaignUse],
              ['Reward status', STATUS_META[reward.status].label],
              ['Risk state', GATE_META[reward.risk].label],
              ['Provider health', HEALTH_META[reward.health].label],
            ]} />
          </Panel>
        </aside>
      </div>
      <ActionModal state={action} onClose={() => setAction(null)} />
    </div>
  );
}

function getRewardContext(reward: RewardItem) {
  const grants = MANUAL_GRANTS.filter((grant) => grant.rewardId === reward.id);
  const liability = LIABILITY.find((row) => row.brand === reward.brand);
  const gates = RISK_GATES.filter((gate) => gate.scope.includes(reward.brand) || gate.scope === 'All brands' || gate.scope === 'All manual grants' || reward.risk !== 'clear');
  const audit = REWARD_AUDIT.filter((item) => item.target === reward.id || grants.some((grant) => grant.id === item.target));
  const capUsed = liability ? Math.min(100, Math.round(((liability.issuedValue + liability.pendingValue) / liability.cap) * 100)) : 0;
  return { grants, liability, gates: gates.length ? gates : RISK_GATES.filter((gate) => gate.scope === 'All brands'), audit, capUsed };
}

function providerTest(reward: RewardItem, grants: ManualGrant[]) {
  if (reward.health === 'failing') {
    return {
      code: '401 AUTH_FAILED',
      latency: 'timeout',
      border: 'var(--danger-border)',
      bg: 'var(--danger-bg)',
      message: 'Provider rejected the payout call. Technical admin needs to check API key scope, wallet endpoint auth and cap approval before this can grant.',
    };
  }
  if (reward.health === 'warning' || grants.some((grant) => grant.status === 'retrying' || grant.status === 'failed')) {
    return {
      code: '202 ACCEPTED_WITH_WARNINGS',
      latency: '680ms',
      border: 'var(--warning-border)',
      bg: 'var(--warning-bg)',
      message: 'The provider accepts the route, but reviewer context is still needed. Check mapping currency, bonus expiry and risk warnings before launch.',
    };
  }
  return {
    code: '200 OK',
    latency: '240ms',
    border: 'var(--accent-border)',
    bg: 'var(--accent-bg)',
    message: 'Test grant is ready. Mapping, provider response and risk gate state are aligned for normal campaign fulfillment.',
  };
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="border-b px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <h2 className="text-[14px] font-semibold text-fg-primary">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[12.5px] leading-relaxed text-fg-secondary">{subtitle}</p>}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Action({ icon: Icon, label, primary, onClick }: { icon: LucideIcon; label: string; primary?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[12.5px] font-semibold" style={primary ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { background: 'var(--surface-3)', color: 'var(--fg-secondary)', border: '1px solid var(--border-strong)' }}>
      <Icon size={14} /> {label}
    </button>
  );
}

function Metric({ icon: Icon, label, value, tone = 'default' }: { icon: LucideIcon; label: string; value: string; tone?: 'default' | 'warning' | 'danger' }) {
  const color = tone === 'warning' ? 'var(--warning)' : tone === 'danger' ? 'var(--danger)' : 'var(--fg-primary)';
  return (
    <div className="rounded-xl border px-4 py-3.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><Icon size={13} /> {label}</div>
      <div className="mt-1.5 font-mono text-[21px] font-semibold leading-none tabular-nums" style={{ color }}>{value}</div>
    </div>
  );
}

function InfoGrid({ rows }: { rows: [string, string][] }) {
  return (
    <div className="mt-3 grid gap-3">
      {rows.map(([label, value]) => (
        <div key={label}>
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-fg-muted">{label}</div>
          <div className="mt-0.5 text-[12.5px] leading-relaxed text-fg-primary">{value}</div>
        </div>
      ))}
    </div>
  );
}

function GateRow({ gate }: { gate: RiskGate }) {
  return (
    <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12.5px] font-medium text-fg-primary">{gate.label}</div>
          <div className="mt-0.5 text-[11.5px] leading-relaxed text-fg-secondary">{gate.impact}</div>
          <div className="mt-1 text-[11px] text-fg-muted">{gate.scope} · {gate.owner}</div>
        </div>
        <GatePill status={gate.status} />
      </div>
    </div>
  );
}

function GrantRow({ grant }: { grant: ManualGrant }) {
  return (
    <div className="grid grid-cols-[1fr_110px_90px_110px] items-center gap-4 border-b px-4 py-3 last:border-0" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-fg-primary">{grant.playerId}</div>
        <div className="mt-0.5 truncate text-[11.5px] text-fg-muted">{grant.id} · {grant.reason}</div>
      </div>
      <span className="text-[12px] text-fg-secondary">{grant.requester}</span>
      <span className="text-right font-mono text-[12px] text-fg-secondary">€{grant.amount.toLocaleString()}</span>
      <GrantPill status={grant.status} />
    </div>
  );
}

function AuditRow({ item }: { item: RewardAudit }) {
  return (
    <div className="flex gap-3 rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <FileText size={14} className="mt-0.5 shrink-0 text-fg-muted" />
      <div>
        <div className="text-[12.5px] font-medium text-fg-primary">{item.action}</div>
        <div className="mt-0.5 text-[11.5px] text-fg-muted">{item.actor} · {item.at} · {item.target}</div>
        <div className="mt-1 text-[11.5px] leading-relaxed text-fg-secondary">{item.note}</div>
      </div>
    </div>
  );
}

function LiabilityCard({ reward, used }: { reward: RewardItem; used: number }) {
  const tone = used > 90 ? 'var(--danger)' : used > 70 ? 'var(--warning)' : 'var(--accent)';
  const liability = LIABILITY.find((row) => row.brand === reward.brand);
  if (!liability) return null;
  return (
    <div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--surface-3)' }}>
        <div className="h-full rounded-full" style={{ width: `${used}%`, background: tone }} />
      </div>
      <div className="mt-2 text-[12px] text-fg-secondary">{used}% of {reward.brand} cap used</div>
      <InfoGrid rows={[
        ['Issued value', `€${liability.issuedValue.toLocaleString()}`],
        ['Pending value', `€${liability.pendingValue.toLocaleString()}`],
        ['Expired value', `€${liability.expiredValue.toLocaleString()}`],
        ['Daily reward cap', `€${reward.dailyCap.toLocaleString()}`],
      ]} />
    </div>
  );
}

function EmptyRow({ label, detail }: { label: string; detail: string }) {
  return <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div className="text-[12.5px] font-medium text-fg-primary">{label}</div><div className="mt-0.5 text-[11.5px] text-fg-secondary">{detail}</div></div>;
}

function CodeTag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md border px-2 py-1 font-mono" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>{children}</span>;
}

function StatusPill({ status }: { status: RewardStatus }) {
  const meta = STATUS_META[status];
  return <Pill label={meta.label} fg={meta.fg} bg={meta.bg} />;
}

function HealthPill({ status }: { status: FulfillmentStatus }) {
  const meta = HEALTH_META[status];
  return <Pill label={meta.label} fg={meta.fg} bg={meta.bg} />;
}

function GatePill({ status }: { status: GateStatus }) {
  const meta = GATE_META[status];
  return <Pill label={meta.label} fg={meta.fg} bg={meta.bg} />;
}

function GrantPill({ status }: { status: GrantStatus }) {
  const meta = status === 'approved'
    ? { label: 'Approved', fg: 'var(--success)', bg: 'var(--status-live-bg)' }
    : status === 'pending' || status === 'retrying'
      ? { label: status === 'pending' ? 'Pending' : 'Retrying', fg: 'var(--warning)', bg: 'var(--warning-bg)' }
      : { label: 'Failed', fg: 'var(--danger)', bg: 'var(--danger-bg)' };
  return <Pill label={meta.label} fg={meta.fg} bg={meta.bg} />;
}

function Pill({ label, fg, bg }: { label: string; fg: string; bg: string }) {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium leading-none" style={{ color: fg, background: bg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: fg }} /> {label}
    </span>
  );
}
