import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Crown, Copy, Check, Gift, UserPlus, Ban, Flag, Sparkles, Clock, X, AlertTriangle, ShieldCheck, Send,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BRANDS, fmtMoney } from '../data/campaigns';
import { TIER_VAR } from '../data/loyalty';
import { getPlayer, PLAYER_STATUS_META, RISK_META, KYC_META, RG_META } from '../data/players';
import type { Player } from '../data/players';
import { FULFILLMENT_LABEL, GATE_META, HEALTH_META as REWARD_HEALTH_META, KIND_LABEL, REWARDS } from '../data/rewards';
import type { GateStatus, RewardItem } from '../data/rewards';
import { SEGMENTS } from '../data/segments';
import { Pill } from './Players';
import PlayerOverview from '../components/players/PlayerOverview';
import CampaignsTab from '../components/players/CampaignsTab';
import LoyaltyTab from '../components/players/LoyaltyTab';
import RewardsTab from '../components/players/RewardsTab';
import RiskTab from '../components/players/RiskTab';
import LedgerTab from '../components/players/LedgerTab';
import TimelineTab from '../components/players/TimelineTab';
import { StateCard } from '../components/StateViews';

const TABS = ['Overview', 'Campaigns', 'Loyalty', 'Rewards', 'Risk', 'Ledger', 'Timeline'] as const;
type Tab = typeof TABS[number];
type ActionFlow = 'segment' | 'exclude' | 'vip' | 'abuse';


export default function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('Overview');
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [grantOpen, setGrantOpen] = useState(false);
  const [actionFlow, setActionFlow] = useState<ActionFlow | null>(null);

  const p = id ? getPlayer(id) : undefined;

  if (!p) {
    return (
      <div className="mx-auto w-full max-w-[1360px] px-8 py-24">
        <StateCard
          state="not-found"
          title="Player not found"
          detail="The player may belong to another brand scope, be hidden by permissions, or no longer exist in the operator platform."
          actionLabel="Back to players"
          onAction={() => navigate('/players')}
        />
      </div>
    );
  }

  const brandName = BRANDS.find((b) => b.code === p.brand)?.name ?? p.brand;
  const copy = (v: string) => { setCopied(v); setTimeout(() => setCopied((c) => (c === v ? null : c)), 1200); };
  const fire = (msg: string) => { setToast(msg); setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600); };

  return (
    <div className="mx-auto w-full max-w-[1360px] px-8 py-6">
      <button onClick={() => navigate('/players')} className="mb-4 flex items-center gap-1.5 text-[12.5px] font-medium text-fg-muted transition-colors hover:text-fg-secondary">
        <ArrowLeft size={14} strokeWidth={2} /> Players
      </button>

      {/* Header */}
      <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="flex items-start justify-between gap-6">
          {/* Identity */}
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold" style={{ background: 'var(--surface-3)', color: p.vip ? 'var(--tier-diamond)' : 'var(--fg-secondary)' }}>{p.alias.slice(0, 2).toUpperCase()}</div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[19px] font-semibold tracking-tight">{p.alias}</h1>
                {p.vip && <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold" style={{ background: 'var(--accent-bg)', color: 'var(--tier-diamond)' }}><Crown size={11} strokeWidth={2.25} />VIP</span>}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                <CopyId label="Player ID" value={p.id} copied={copied === p.id} onCopy={() => copy(p.id)} />
                <CopyId label="Platform ID" value={p.externalId} copied={copied === p.externalId} onCopy={() => copy(p.externalId)} />
                <span className="text-[11.5px] text-fg-muted">Joined {p.joined}</span>
              </div>
            </div>
          </div>
          {/* Quick actions */}
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <Action icon={Gift} label="Grant reward" primary onClick={() => setGrantOpen(true)} />
            <Action icon={UserPlus} label="Add to segment" onClick={() => setActionFlow('segment')} />
            <Action icon={Ban} label="Exclude from campaign" onClick={() => setActionFlow('exclude')} />
            <Action icon={Sparkles} label="VIP override" onClick={() => setActionFlow('vip')} />
            <Action icon={Flag} label="Flag abuse" danger onClick={() => setActionFlow('abuse')} />
          </div>
        </div>

        {/* Facts */}
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <Fact label="Brand"><span className="text-[12.5px] font-medium text-fg-primary">{brandName}</span><span className="ml-1 font-mono text-[11px] text-fg-muted">{p.brand}</span></Fact>
          <Fact label="Jurisdiction"><span className="text-[12.5px] font-medium text-fg-primary">{p.jurisdiction}</span><span className="ml-1 text-[11.5px] text-fg-muted">· {p.country}</span></Fact>
          <Fact label="Tier"><span className="flex items-center gap-1.5 text-[12.5px] font-medium text-fg-primary"><span className="h-2.5 w-2.5 rounded-full" style={{ background: TIER_VAR[p.tierColor] }} />{p.tier}</span></Fact>
          <Fact label="Status"><Pill meta={PLAYER_STATUS_META[p.status]} /></Fact>
          <Fact label="Risk"><Pill meta={RISK_META[p.risk]} dot /></Fact>
          <Fact label="KYC"><Pill meta={KYC_META[p.kyc]} /></Fact>
          <Fact label="Responsible gambling"><Pill meta={RG_META[p.rg]} /></Fact>
          <Fact label="Last activity"><span className="flex items-center gap-1 text-[12.5px] font-medium text-fg-primary"><Clock size={12} className="text-fg-muted" strokeWidth={2} />{p.lastActivity}</span></Fact>
        </div>
      </div>

      {/* Tab nav */}
      <div className="mt-5 flex items-center gap-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        {TABS.map((t) => {
          const active = t === tab;
          return (
            <button key={t} onClick={() => setTab(t)} className="relative px-3.5 py-2.5 text-[13px] font-medium transition-colors" style={{ color: active ? 'var(--fg-primary)' : 'var(--fg-muted)' }}>
              {t}
              {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full" style={{ background: 'var(--accent)' }} />}
            </button>
          );
        })}
      </div>

      {/* Tab body */}
      <div className="mt-6">
        {tab === 'Overview' && <PlayerOverview p={p} />}
        {tab === 'Campaigns' && <CampaignsTab p={p} />}
        {tab === 'Loyalty' && <LoyaltyTab p={p} />}
        {tab === 'Rewards' && <RewardsTab p={p} />}
        {tab === 'Risk' && <RiskTab p={p} />}
        {tab === 'Ledger' && <LedgerTab p={p} />}
        {tab === 'Timeline' && <TimelineTab p={p} />}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -ml-[180px] flex w-[360px] items-center gap-2.5 rounded-lg border px-4 py-3 text-[12.5px]" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-3)', color: 'var(--fg-primary)', boxShadow: 'var(--shadow-md)' }}>
          <Check size={15} style={{ color: 'var(--success)' }} strokeWidth={2.5} />{toast}
        </div>
      )}

      <GrantRewardDrawer
        open={grantOpen}
        player={p}
        onClose={() => setGrantOpen(false)}
        onSubmit={(message) => {
          setGrantOpen(false);
          fire(message);
        }}
      />
      {actionFlow && (
        <PlayerActionDrawer
          mode={actionFlow}
          player={p}
          onClose={() => setActionFlow(null)}
          onSubmit={(message) => {
            setActionFlow(null);
            fire(message);
          }}
        />
      )}
    </div>
  );
}

function CopyId({ label, value, copied, onCopy }: { label: string; value: string; copied: boolean; onCopy: () => void }) {
  return (
    <button onClick={onCopy} className="group flex items-center gap-1.5">
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">{label}</span>
      <span className="font-mono text-[12px] text-fg-secondary">{value}</span>
      {copied ? <Check size={12} style={{ color: 'var(--success)' }} strokeWidth={2.5} /> : <Copy size={12} className="text-fg-muted opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={2} />}
    </button>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">{label}</span>
      <span className="flex items-center">{children}</span>
    </div>
  );
}

function Action({ icon: Icon, label, onClick, primary, danger }: { icon: LucideIcon; label: string; onClick: () => void; primary?: boolean; danger?: boolean }) {
  const base = 'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors';
  if (primary) return <button onClick={onClick} className={base} style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}><Icon size={13} strokeWidth={2} />{label}</button>;
  return (
    <button onClick={onClick} className={base} style={{ border: '1px solid var(--border-strong)', background: 'var(--surface-2)', color: danger ? 'var(--danger)' : 'var(--fg-secondary)' }}>
      <Icon size={13} strokeWidth={2} />{label}
    </button>
  );
}

function GrantRewardDrawer({ open, player, onClose, onSubmit }: { open: boolean; player: Player; onClose: () => void; onSubmit: (message: string) => void }) {
  const eligible = REWARDS.filter((r) => r.brand === player.brand || r.brand === 'LKF' || r.status === 'active');
  const initialReward = eligible.find((r) => r.brand === player.brand && r.status === 'active') ?? eligible[0] ?? REWARDS[0];
  const [rewardId, setRewardId] = useState(initialReward.id);
  const [reason, setReason] = useState('Manual retention grant after player review');
  const [notifyPlayer, setNotifyPlayer] = useState(false);
  const reward = REWARDS.find((r) => r.id === rewardId) ?? initialReward;
  const checks = rewardGrantChecks(player, reward);
  const blocked = checks.some((c) => c.status === 'blocked');
  const needsApproval = !blocked && checks.some((c) => c.status === 'warning');
  const decision = blocked ? 'Blocked' : needsApproval ? 'Approval required' : 'Ready to grant';
  const cta = blocked ? 'Send to review queue' : needsApproval ? 'Submit for approval' : 'Grant reward';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0" style={{ background: 'var(--overlay-scrim)' }} onClick={onClose} />
      <aside className="relative flex h-full w-[520px] flex-col border-l" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-start justify-between gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="text-[15px] font-semibold text-fg-primary">Grant reward</div>
            <div className="mt-0.5 font-mono text-[11.5px] text-fg-muted">{player.alias} · {player.id}</div>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-fg-muted" style={{ background: 'var(--surface-2)' }}>
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <section className="rounded-lg border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Decision</div>
                <div className="mt-1 text-[16px] font-semibold text-fg-primary">{decision}</div>
              </div>
              <GrantStatus status={blocked ? 'blocked' : needsApproval ? 'warning' : 'clear'} />
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-fg-secondary">
              {blocked
                ? 'This grant cannot be paid directly. It should be routed with context for Risk, Compliance, or Technical Admin review.'
                : needsApproval
                  ? 'This grant can be prepared, but needs a human approval before fulfilment.'
                  : 'All mandatory player, reward, fulfilment and audit checks are clear.'}
            </p>
          </section>

          <section className="mt-4">
            <Label>Reward</Label>
            <select
              value={rewardId}
              onChange={(e) => setRewardId(e.target.value)}
              className="mt-2 w-full rounded-md border px-3 py-2 text-[13px] outline-none"
              style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)', color: 'var(--fg-primary)' }}
            >
              {eligible.map((r) => <option key={r.id} value={r.id}>{r.name} · {r.brand} · {KIND_LABEL[r.kind]}</option>)}
            </select>
          </section>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoBox label="Fulfilment" value={FULFILLMENT_LABEL[reward.fulfillment]} />
            <InfoBox label="Provider" value={reward.provider} />
            <InfoBox label="Cost per grant" value={fmtMoney(reward.costPerGrant, reward.currency)} />
            <InfoBox label="Daily cap" value={fmtMoney(reward.dailyCap, reward.currency)} />
          </div>

          {reward.bonusGuid && (
            <div className="mt-3 rounded-md border px-3 py-2" style={{ borderColor: 'var(--accent-border)', background: 'var(--accent-bg)' }}>
              <div className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Existing bonus GUID</div>
              <div className="mt-1 font-mono text-[12px] text-fg-primary">{reward.bonusGuid}</div>
            </div>
          )}

          <section className="mt-5">
            <Label>Safety checks</Label>
            <div className="mt-2 flex flex-col gap-2">
              {checks.map((check) => (
                <div key={check.id} className="rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[12.5px] font-medium text-fg-primary">{check.label}</div>
                      <div className="mt-0.5 text-[11.5px] leading-relaxed text-fg-secondary">{check.detail}</div>
                    </div>
                    <GrantStatus status={check.status} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-5">
            <Label>Audit reason</Label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="mt-2 w-full resize-none rounded-md border px-3 py-2 text-[13px] outline-none"
              style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)', color: 'var(--fg-primary)' }}
            />
            <label className="mt-3 flex items-center gap-2 text-[12.5px] text-fg-secondary">
              <input type="checkbox" checked={notifyPlayer} onChange={(e) => setNotifyPlayer(e.target.checked)} />
              Notify player after successful fulfilment
            </label>
          </section>
        </div>

        <div className="border-t px-5 py-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11.5px] text-fg-muted">Recorded to player ledger and reward audit trail.</div>
            <button
              onClick={() => onSubmit(`${cta}: ${reward.name}`)}
              disabled={!reason.trim()}
              className="inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-semibold disabled:opacity-50"
              style={blocked ? { background: 'var(--danger-bg)', color: 'var(--danger)' } : needsApproval ? { background: 'var(--warning-bg)', color: 'var(--warning)' } : { background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              {blocked ? <AlertTriangle size={14} strokeWidth={2} /> : needsApproval ? <Send size={14} strokeWidth={2} /> : <ShieldCheck size={14} strokeWidth={2} />}
              {cta}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function PlayerActionDrawer({ mode, player, onClose, onSubmit }: { mode: ActionFlow; player: Player; onClose: () => void; onSubmit: (message: string) => void }) {
  const segmentOptions = SEGMENTS.filter((s) => s.type !== 'suppression');
  const [segmentId, setSegmentId] = useState(segmentOptions[0]?.id ?? '');
  const [campaign, setCampaign] = useState(player.activeCampaigns[0] ?? player.eligibleCampaign?.name ?? 'Q2 High-Roller Rakeback');
  const [vipTier, setVipTier] = useState(player.upcomingTierChange?.to ?? (player.vip ? 'Elite' : 'Diamond'));
  const [duration, setDuration] = useState('30 days');
  const [abuseType, setAbuseType] = useState('Bonus abuse pattern');
  const [note, setNote] = useState(defaultActionNote(mode, player));
  const selectedSegment = segmentOptions.find((s) => s.id === segmentId) ?? segmentOptions[0];
  const meta = actionMeta(mode, player);
  const checks = actionChecks(mode, player, selectedSegment);
  const blocked = checks.some((c) => c.status === 'blocked');
  const warning = !blocked && checks.some((c) => c.status === 'warning');
  const status: GateStatus = blocked ? 'blocked' : warning ? 'warning' : 'clear';
  const target = mode === 'segment' ? selectedSegment?.name : mode === 'exclude' ? campaign : mode === 'vip' ? vipTier : abuseType;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0" style={{ background: 'var(--overlay-scrim)' }} onClick={onClose} />
      <aside className="relative flex h-full w-[500px] flex-col border-l" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-start justify-between gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="text-[15px] font-semibold text-fg-primary">{meta.title}</div>
            <div className="mt-0.5 font-mono text-[11.5px] text-fg-muted">{player.alias} · {player.id}</div>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-fg-muted" style={{ background: 'var(--surface-2)' }}>
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <section className="rounded-lg border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Outcome</div>
                <div className="mt-1 text-[16px] font-semibold text-fg-primary">{blocked ? meta.blocked : warning ? meta.warning : meta.ready}</div>
              </div>
              <GrantStatus status={status} />
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-fg-secondary">{meta.detail}</p>
          </section>

          {mode === 'segment' && (
            <section className="mt-4">
              <Label>Segment</Label>
              <select value={segmentId} onChange={(e) => setSegmentId(e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2 text-[13px] outline-none" style={fieldStyle}>
                {segmentOptions.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.status} · {s.count.toLocaleString()} players</option>)}
              </select>
              {selectedSegment && (
                <div className="mt-3 rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
                  <div className="text-[12.5px] font-medium text-fg-primary">{selectedSegment.overlapWarning}</div>
                  <div className="mt-1 text-[11.5px] text-fg-muted">{selectedSegment.exclusions.length ? selectedSegment.exclusions.join(' · ') : 'No local exclusions'}</div>
                </div>
              )}
            </section>
          )}

          {mode === 'exclude' && (
            <section className="mt-4">
              <Label>Campaign</Label>
              <select value={campaign} onChange={(e) => setCampaign(e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2 text-[13px] outline-none" style={fieldStyle}>
                {(player.activeCampaigns.length ? player.activeCampaigns : [player.eligibleCampaign?.name ?? 'Q2 High-Roller Rakeback']).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <InfoBox label="Effect" value="Remove from audience" />
                <InfoBox label="Reward status" value="Stop future grants" />
              </div>
            </section>
          )}

          {mode === 'vip' && (
            <section className="mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Target tier</Label>
                  <select value={vipTier} onChange={(e) => setVipTier(e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2 text-[13px] outline-none" style={fieldStyle}>
                    {['Gold', 'Platinum', 'Diamond', 'Elite'].map((tier) => <option key={tier}>{tier}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Duration</Label>
                  <select value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2 text-[13px] outline-none" style={fieldStyle}>
                    {['7 days', '30 days', '90 days', 'Until next reset'].map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <InfoBox label="Current tier" value={player.tier} />
                <InfoBox label="VIP manager" value={player.accountManager ?? 'Unassigned'} />
              </div>
            </section>
          )}

          {mode === 'abuse' && (
            <section className="mt-4">
              <Label>Abuse category</Label>
              <select value={abuseType} onChange={(e) => setAbuseType(e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2 text-[13px] outline-none" style={fieldStyle}>
                {['Bonus abuse pattern', 'Multi-account suspicion', 'Payment risk', 'RG policy breach', 'Manual investigation'].map((type) => <option key={type}>{type}</option>)}
              </select>
              <div className="mt-3 rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--danger-bg)', background: 'var(--danger-bg)' }}>
                <div className="text-[12.5px] font-medium" style={{ color: 'var(--danger)' }}>Routes to Risk & Compliance</div>
                <div className="mt-1 text-[11.5px] text-fg-secondary">Player remains visible, but future high-risk rewards and campaigns should be reviewed before action.</div>
              </div>
            </section>
          )}

          <section className="mt-5">
            <Label>Control checks</Label>
            <div className="mt-2 flex flex-col gap-2">
              {checks.map((check) => (
                <div key={check.id} className="rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[12.5px] font-medium text-fg-primary">{check.label}</div>
                      <div className="mt-0.5 text-[11.5px] leading-relaxed text-fg-secondary">{check.detail}</div>
                    </div>
                    <GrantStatus status={check.status} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-5">
            <Label>Audit note</Label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className="mt-2 w-full resize-none rounded-md border px-3 py-2 text-[13px] outline-none" style={fieldStyle} />
          </section>
        </div>

        <div className="border-t px-5 py-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11.5px] text-fg-muted">{meta.footer}</div>
            <button
              onClick={() => onSubmit(`${meta.cta}: ${target}`)}
              disabled={!note.trim()}
              className="inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-semibold disabled:opacity-50"
              style={mode === 'abuse' ? { background: 'var(--danger-bg)', color: 'var(--danger)' } : status === 'warning' ? { background: 'var(--warning-bg)', color: 'var(--warning)' } : { background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              {mode === 'abuse' ? <Flag size={14} strokeWidth={2} /> : status === 'warning' ? <Send size={14} strokeWidth={2} /> : <Check size={14} strokeWidth={2.5} />}
              {meta.cta}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function rewardGrantChecks(player: Player, reward: RewardItem): { id: string; label: string; detail: string; status: GateStatus }[] {
  return [
    {
      id: 'rg',
      label: 'Responsible gambling',
      detail: player.rg === 'ok' ? 'No active RG block on this player.' : `${RG_META[player.rg].label} is active and should be reviewed before reward fulfilment.`,
      status: player.rg === 'self_excluded' || player.rg === 'cooldown' ? 'blocked' : player.rg === 'ok' ? 'clear' : 'warning',
    },
    {
      id: 'kyc',
      label: 'KYC / source of funds',
      detail: player.kyc === 'verified' ? 'KYC is verified for bonus and wallet fulfilment.' : `${KYC_META[player.kyc].label}; cash-like rewards may require hold or approval.`,
      status: reward.kind === 'cash' && player.kyc !== 'verified' ? 'blocked' : player.kyc === 'verified' ? 'clear' : 'warning',
    },
    {
      id: 'fulfilment',
      label: 'Fulfilment health',
      detail: `${FULFILLMENT_LABEL[reward.fulfillment]} via ${reward.provider}; current status is ${REWARD_HEALTH_META[reward.health].label.toLowerCase()}.`,
      status: reward.health === 'failing' ? 'blocked' : reward.health === 'warning' ? 'warning' : 'clear',
    },
    {
      id: 'risk',
      label: 'Reward risk gate',
      detail: `${GATE_META[reward.risk].label}: ${reward.risk === 'clear' ? 'risk gates are clear for this reward.' : 'reward policy needs attention before direct grant.'}`,
      status: reward.risk,
    },
    {
      id: 'value',
      label: 'Value threshold',
      detail: reward.costPerGrant >= 500 ? 'High-value manual grant. Route to approval before payout.' : 'Grant value is below manual approval threshold.',
      status: reward.costPerGrant >= 500 ? 'warning' : 'clear',
    },
  ];
}

const fieldStyle = { borderColor: 'var(--border-strong)', background: 'var(--surface-2)', color: 'var(--fg-primary)' };

function actionMeta(mode: ActionFlow, player: Player) {
  const common = { footer: 'Recorded to player audit trail and visible in Risk & Compliance history.' };
  if (mode === 'segment') return {
    ...common,
    title: 'Add to segment',
    ready: 'Ready to add',
    warning: 'Review recommended',
    blocked: 'Blocked by player status',
    detail: 'Adds this player to a reusable audience so campaigns, loyalty, rewards and exclusions can target them consistently.',
    cta: 'Add to segment',
  };
  if (mode === 'exclude') return {
    ...common,
    title: 'Exclude from campaign',
    ready: 'Ready to exclude',
    warning: 'Campaign impact noted',
    blocked: 'No eligible campaign',
    detail: 'Removes the player from the selected campaign audience and prevents future campaign-driven reward grants.',
    cta: 'Apply exclusion',
  };
  if (mode === 'vip') return {
    ...common,
    title: 'VIP override',
    ready: player.vip ? 'Ready for approval' : 'Approval required',
    warning: 'Approval required',
    blocked: 'Blocked by risk state',
    detail: 'Creates a temporary tier or VIP-status override. This should be auditable and normally requires manager or committee approval.',
    cta: 'Submit override',
  };
  return {
    ...common,
    title: 'Flag abuse',
    ready: 'Ready to submit',
    warning: 'Risk case will open',
    blocked: 'Already restricted',
    detail: 'Creates a risk case and attaches the player, current campaign context, reward history and your note for investigation.',
    cta: 'Flag abuse',
  };
}

function defaultActionNote(mode: ActionFlow, player: Player) {
  if (mode === 'segment') return `Manual segment change requested after review of ${player.alias}.`;
  if (mode === 'exclude') return `Exclude ${player.alias} from future campaign eligibility due to current player review.`;
  if (mode === 'vip') return `Request VIP override for ${player.alias}; current tier ${player.tier}, LTV ${fmtMoney(player.metrics.ltv, 'EUR')}.`;
  return `Flag ${player.alias} for risk review. Include recent activity, campaign context and reward exposure.`;
}

function actionChecks(mode: ActionFlow, player: Player, segment?: { status: string; health: string; overlapWarning: string }) {
  if (mode === 'segment') return [
    {
      id: 'player-status',
      label: 'Player eligibility',
      detail: player.status === 'active' ? 'Player account is active.' : `${PLAYER_STATUS_META[player.status].label} players should not be added to marketing or reward audiences.`,
      status: player.status === 'self_excluded' || player.status === 'closed' ? 'blocked' as GateStatus : player.status === 'active' ? 'clear' as GateStatus : 'warning' as GateStatus,
    },
    {
      id: 'rg',
      label: 'Suppression gate',
      detail: player.rg === 'ok' ? 'No active RG suppression.' : `${RG_META[player.rg].label} must be respected by downstream campaigns.`,
      status: player.rg === 'self_excluded' || player.rg === 'cooldown' ? 'blocked' as GateStatus : player.rg === 'ok' ? 'clear' as GateStatus : 'warning' as GateStatus,
    },
    {
      id: 'segment-health',
      label: 'Segment health',
      detail: segment ? `${segment.status}; ${segment.overlapWarning}` : 'No segment selected.',
      status: !segment || segment.health === 'blocked' ? 'blocked' as GateStatus : segment.health === 'warning' ? 'warning' as GateStatus : 'clear' as GateStatus,
    },
  ];
  if (mode === 'exclude') return [
    {
      id: 'campaign',
      label: 'Campaign membership',
      detail: player.activeCampaigns.length ? `${player.activeCampaigns.length} active campaign link${player.activeCampaigns.length === 1 ? '' : 's'} found.` : 'Player has no active campaign; exclusion will be saved as a future suppression.',
      status: player.activeCampaigns.length ? 'clear' as GateStatus : 'warning' as GateStatus,
    },
    {
      id: 'reward-stop',
      label: 'Reward impact',
      detail: 'Future campaign rewards stop. Already granted rewards remain in the ledger unless separately voided.',
      status: 'clear' as GateStatus,
    },
    {
      id: 'audit',
      label: 'Audit requirement',
      detail: 'Reason is mandatory because this changes player eligibility.',
      status: 'clear' as GateStatus,
    },
  ];
  if (mode === 'vip') return [
    {
      id: 'vip-value',
      label: 'Value threshold',
      detail: player.metrics.ltv >= 50000 ? 'Player value supports VIP review.' : 'Lower LTV override should be justified by a manager.',
      status: player.metrics.ltv >= 50000 ? 'clear' as GateStatus : 'warning' as GateStatus,
    },
    {
      id: 'risk',
      label: 'Risk posture',
      detail: player.risk === 'clear' ? 'No abuse flag currently active.' : `${RISK_META[player.risk].label}; override should be reviewed before activation.`,
      status: player.risk === 'flagged' ? 'blocked' as GateStatus : player.risk === 'clear' ? 'clear' as GateStatus : 'warning' as GateStatus,
    },
    {
      id: 'rg',
      label: 'Responsible gambling',
      detail: player.rg === 'ok' ? 'No active RG restriction.' : `${RG_META[player.rg].label}; VIP treatment may require compliance review.`,
      status: player.rg === 'self_excluded' || player.rg === 'cooldown' ? 'blocked' as GateStatus : player.rg === 'ok' ? 'clear' as GateStatus : 'warning' as GateStatus,
    },
  ];
  return [
    {
      id: 'case',
      label: 'Risk case',
      detail: 'Creates a Risk & Compliance case and links reward/campaign context.',
      status: 'warning' as GateStatus,
    },
    {
      id: 'campaign',
      label: 'Campaign exposure',
      detail: player.activeCampaigns.length ? `${player.activeCampaigns.join(', ')} will be shown to reviewers.` : 'No active campaign exposure detected.',
      status: player.activeCampaigns.length ? 'warning' as GateStatus : 'clear' as GateStatus,
    },
    {
      id: 'player-state',
      label: 'Current risk state',
      detail: player.risk === 'flagged' ? 'Player is already flagged; this adds evidence to the existing risk posture.' : 'Player is not currently flagged as confirmed abuse.',
      status: player.risk === 'flagged' ? 'warning' as GateStatus : 'clear' as GateStatus,
    },
  ];
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">{children}</div>;
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">{label}</div>
      <div className="mt-1 truncate text-[12.5px] font-medium text-fg-primary">{value}</div>
    </div>
  );
}

function GrantStatus({ status }: { status: GateStatus }) {
  const meta = GATE_META[status];
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium leading-none" style={{ color: meta.fg, background: meta.bg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.fg }} />
      {meta.label}
    </span>
  );
}
