import { useNavigate } from 'react-router-dom';
import {
  Coins, ShieldCheck, ShieldAlert, AlertTriangle, Ban, Check, ArrowRight,
  Fingerprint, Eye, Globe, ScrollText, Info,
} from 'lucide-react';
import { Section, Field, TextInput, Select, Toggle } from '../../components/builder/form';
import ModuleSections from '../../components/builder/ModuleFields';
import { useCampaign } from '../../context/CampaignContext';
import {
  FREQUENCIES, getBlockers, getWarnings, getSafetyChecks, SAFETY_CATEGORY_LABEL,
} from '../../data/validation';
import type { Issue, SafetyCheck, SafetyCategory, SafetySeverity } from '../../data/validation';

const CATEGORY_ICON: Record<SafetyCategory, typeof Coins> = {
  validation: ShieldCheck,
  fraud: ShieldAlert,
  manual_review: Eye,
  rg: ShieldCheck,
  kyc: Fingerprint,
  jurisdiction: Globe,
  audit: ScrollText,
};

const SEVERITY_STYLE: Record<SafetySeverity, { color: string; bg: string; label: string; Icon: typeof Check }> = {
  blocker: { color: 'var(--danger)', bg: 'var(--danger-bg)', label: 'Blocker', Icon: Ban },
  warning: { color: 'var(--warning)', bg: 'var(--warning-bg)', label: 'Warning', Icon: AlertTriangle },
  pass: { color: 'var(--success)', bg: 'var(--status-live-bg)', label: 'Pass', Icon: Check },
  info: { color: 'var(--status-scheduled)', bg: 'var(--surface-2)', label: 'Info', Icon: Info },
};

export default function StepBudget() {
  const { draft, update } = useCampaign();
  const navigate = useNavigate();
  const blockers = getBlockers(draft);
  const warnings = getWarnings(draft);
  const checks = getSafetyChecks(draft);

  // group checks by category, keeping catalog order
  const categories = (Object.keys(SAFETY_CATEGORY_LABEL) as SafetyCategory[])
    .map((cat) => ({ cat, items: checks.filter((c) => c.category === cat) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[16px] font-semibold tracking-tight">Budget & safety</h2>
        <p className="mt-1 text-[13px] text-fg-secondary">Cap the financial exposure, set the safety gates, and clear the compliance checks that gate launch.</p>
      </div>

      <Section icon={Coins} title="Budget & limits" desc="These caps stop reward cost from exceeding what you've approved.">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Total budget cap" hint="hard ceiling" required>
            <TextInput value={draft.budgetCap} onChange={(v) => update({ budgetCap: v })} placeholder="e.g. 25000" prefix="€" mono />
          </Field>
          <Field label="Daily cap">
            <TextInput value={draft.dailyCap} onChange={(v) => update({ dailyCap: v })} placeholder="e.g. 5000" prefix="€" mono />
          </Field>
          <Field label="Max reward per player">
            <TextInput value={draft.maxPerPlayer} onChange={(v) => update({ maxPerPlayer: v })} placeholder="e.g. 50" prefix="€" mono />
          </Field>
          <Field label="Max winners">
            <TextInput value={draft.maxWinners} onChange={(v) => update({ maxWinners: v })} placeholder="e.g. 500" mono />
          </Field>
          <Field label="Max reward frequency">
            <Select value={draft.maxFrequency} onChange={(v) => update({ maxFrequency: v })} options={FREQUENCIES} placeholder="How often…" />
          </Field>
        </div>
      </Section>

      {/* Module-specific budget / payout controls */}
      <ModuleSections step="budget" />

      <Section icon={ShieldCheck} title="Safety gates" desc="Required controls. Each directly affects launch eligibility and the checks below.">
        <div className="flex flex-col gap-3">
          <Toggle
            checked={draft.rgExclusionsApplied}
            onChange={(v) => update({ rgExclusionsApplied: v })}
            label="Apply responsible-gambling exclusions"
            desc="Remove self-excluded, cooling-off and deposit-limited players. Mandatory before launch."
          />
          <div className="border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <Toggle
              checked={draft.kycRequired}
              onChange={(v) => update({ kycRequired: v })}
              label="Require KYC before payout"
              desc="Withhold the reward until the player passes identity verification. Recommended for all cash payouts."
            />
          </div>
          <div className="border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <Toggle
              checked={draft.manualRewardReview}
              onChange={(v) => update({ manualRewardReview: v })}
              label="Route high-value grants to manual review"
              desc="Grants above €500 pause in a human review queue before payout, guarding against misconfiguration and abuse."
            />
          </div>
          <div className="border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <Toggle
              checked={draft.jurisdictionResolved}
              onChange={(v) => update({ jurisdictionResolved: v })}
              label="Confirm jurisdiction eligibility mapping"
              desc="Acknowledge that reward rules are valid for every targeted jurisdiction."
            />
          </div>
        </div>
      </Section>

      {/* Safety checklist by category */}
      <Section
        icon={ShieldAlert}
        title="Compliance checklist"
        desc="Every safety dimension the reviewer sees, evaluated live from your configuration."
        aside={
          <div className="flex items-center gap-1.5 text-[11px] font-medium">
            <span style={{ color: 'var(--danger)' }}>{blockers.length} blocking</span>
            <span className="text-fg-muted">·</span>
            <span style={{ color: 'var(--warning)' }}>{warnings.length} warning</span>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {categories.map(({ cat, items }) => {
            const CatIcon = CATEGORY_ICON[cat];
            return (
              <div key={cat}>
                <div className="mb-2 flex items-center gap-1.5">
                  <CatIcon size={13} className="text-fg-muted" strokeWidth={2} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">{SAFETY_CATEGORY_LABEL[cat]}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((c) => <CheckRow key={c.id} check={c} onGo={() => navigate(`/builder/${c.step}`)} />)}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Launch readiness verdict */}
      <div className="rounded-xl border" style={{ borderColor: blockers.length ? 'rgba(240,87,107,0.35)' : 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="p-5">
          {blockers.length > 0 ? (
            <div className="flex items-center gap-3 rounded-lg px-4 py-3.5" style={{ background: 'var(--danger)', color: '#fff' }}>
              <Ban size={20} strokeWidth={2.25} />
              <div className="flex-1">
                <div className="text-[14px] font-semibold">Launch blocked</div>
                <div className="text-[12.5px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {blockers.length} {blockers.length === 1 ? 'issue' : 'issues'} must be resolved before this campaign can go live.
                </div>
              </div>
              <button onClick={() => navigate(`/builder/${blockers[0].step}`)} className="flex items-center gap-1 rounded-md px-3 py-1.5 text-[12.5px] font-semibold" style={{ background: 'rgba(255,255,255,0.16)', color: '#fff' }}>
                Fix first <ArrowRight size={13} strokeWidth={2.5} />
              </button>
            </div>
          ) : warnings.length > 0 ? (
            <div className="flex items-center gap-3 rounded-lg px-4 py-3.5" style={{ background: 'var(--warning-bg)' }}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--warning)', color: '#231703' }}>
                <AlertTriangle size={16} strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-fg-primary">Approval required</div>
                <div className="text-[12.5px] text-fg-secondary">
                  No blockers, but {warnings.length} warning{warnings.length === 1 ? '' : 's'} route this campaign through manager approval before it goes live.
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg px-4 py-3.5" style={{ background: 'var(--status-live-bg)' }}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'var(--success)', color: '#04211E' }}>
                <Check size={17} strokeWidth={3} />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-fg-primary">All checks passed</div>
                <div className="text-[12.5px] text-fg-secondary">No blockers or warnings. This campaign is clear to launch.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckRow({ check, onGo }: { check: SafetyCheck; onGo: () => void }) {
  const s = SEVERITY_STYLE[check.severity];
  const Icon = s.Icon;
  const actionable = check.severity === 'blocker' || check.severity === 'warning';
  return (
    <div className="flex items-start gap-3 rounded-lg border px-4 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: actionable ? s.bg : 'var(--surface-2)' }}>
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center" style={{ color: s.color }}>
        <Icon size={14} strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] font-medium text-fg-primary">{check.label}</span>
          <span className="rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide" style={{ color: s.color, background: 'var(--surface-3)' }}>{s.label}</span>
        </div>
        <p className="mt-0.5 text-[12px] leading-relaxed text-fg-secondary">{check.detail}</p>
      </div>
      {actionable && (
        <button onClick={onGo} className="flex shrink-0 items-center gap-1 text-[12px] font-medium" style={{ color: s.color }}>
          Fix <ArrowRight size={13} strokeWidth={2.25} />
        </button>
      )}
    </div>
  );
}
