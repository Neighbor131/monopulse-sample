import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ClipboardCheck,
  Gift,
  KeyRound,
  Loader,
  Mail,
  Play,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ActionKind =
  | 'newReward'
  | 'syncGuids'
  | 'testGrant'
  | 'runGates'
  | 'inviteUser'
  | 'recalculateSegments'
  | 'submitSegmentApproval'
  | 'emergencyAction';

export interface ActionModalState {
  kind: ActionKind;
  title?: string;
  subtitle?: string;
  context?: string;
}

interface ActionConfig {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  subtitle: string;
  confirm: string;
  tone: 'primary' | 'warning' | 'danger';
  permission: { currentRole: string; allowed: boolean; note: string };
  steps: string[];
  fields: { label: string; value: string; type?: 'text' | 'select' | 'textarea' }[];
  api: { method: string; path: string; payload: string[] };
}

const CONFIG: Record<ActionKind, ActionConfig> = {
  newReward: {
    icon: Gift,
    eyebrow: 'Reward catalog',
    title: 'Create reward object',
    subtitle: 'Define the reward once, then map it to campaigns, loyalty benefits and manual grant flows.',
    confirm: 'Create draft reward',
    tone: 'primary',
    permission: { currentRole: 'CRM / Retention Manager', allowed: true, note: 'Can create draft rewards. Risk gates and launch approval still require Risk/Compliance.' },
    steps: ['Validate brand scope', 'Choose fulfillment route', 'Require risk gates before launch'],
    fields: [
      { label: 'Reward name', value: '25 free spins · Book of Ra' },
      { label: 'Brand', value: 'ACR · AceRoyale', type: 'select' },
      { label: 'Fulfillment route', value: 'Existing bonus GUID', type: 'select' },
      { label: 'Owner', value: 'CRM Ops', type: 'select' },
    ],
    api: { method: 'POST', path: '/rewards', payload: ['brandId', 'kind', 'fulfillmentMode', 'bonusGuid?', 'riskGatePolicy'] },
  },
  syncGuids: {
    icon: KeyRound,
    eyebrow: 'Bonus GUID coverage',
    title: 'Sync existing bonus GUIDs',
    subtitle: 'Pull operator-created bonus identifiers and reconcile missing or expired mappings.',
    confirm: 'Start GUID sync',
    tone: 'primary',
    permission: { currentRole: 'CRM / Retention Manager', allowed: true, note: 'Can run dry-run sync. Applying production mappings requires Technical Admin approval.' },
    steps: ['Read provider catalog', 'Match GUIDs to reward objects', 'Flag missing currency or expiry data'],
    fields: [
      { label: 'Provider', value: 'Bonus Engine v2', type: 'select' },
      { label: 'Brands', value: 'All production brands', type: 'select' },
      { label: 'Mode', value: 'Dry run, then apply clean matches', type: 'select' },
    ],
    api: { method: 'POST', path: '/integrations/bonus-guid/sync', payload: ['providerId', 'brandIds', 'dryRun', 'applyMatches'] },
  },
  testGrant: {
    icon: Play,
    eyebrow: 'Fulfillment test',
    title: 'Run test grant',
    subtitle: 'Send a safe test payload through the selected fulfillment route before launch.',
    confirm: 'Run test grant',
    tone: 'primary',
    permission: { currentRole: 'CRM / Retention Manager', allowed: true, note: 'Simulation is allowed. Real ledger writes require Casino Manager or Technical Admin.' },
    steps: ['Create sandbox player payload', 'Run RG/KYC/fraud gates', 'Call provider and record response'],
    fields: [
      { label: 'Test player ID', value: 'PLR-TEST-0001' },
      { label: 'Grant reason', value: 'Pre-launch fulfillment test', type: 'textarea' },
      { label: 'Write to ledger', value: 'No · simulation only', type: 'select' },
    ],
    api: { method: 'POST', path: '/rewards/test-grant', payload: ['rewardId', 'playerId', 'simulate', 'auditReason'] },
  },
  runGates: {
    icon: ShieldCheck,
    eyebrow: 'Risk controls',
    title: 'Run reward gates',
    subtitle: 'Re-evaluate responsible gambling, KYC, jurisdiction, fraud and liability blockers.',
    confirm: 'Run gates',
    tone: 'warning',
    permission: { currentRole: 'CRM / Retention Manager', allowed: true, note: 'Can preview gate results. Clearing blockers requires Risk/Compliance.' },
    steps: ['Check player eligibility rules', 'Check brand jurisdiction restrictions', 'Check daily cap and provider health'],
    fields: [
      { label: 'Gate policy', value: 'Launch blockers + warnings', type: 'select' },
      { label: 'Scope', value: 'Current reward object', type: 'select' },
      { label: 'Audit note', value: 'Manual gate rerun before launch review', type: 'textarea' },
    ],
    api: { method: 'POST', path: '/risk/reward-gates/run', payload: ['rewardId', 'scope', 'gatePolicy', 'auditNote'] },
  },
  inviteUser: {
    icon: UserPlus,
    eyebrow: 'Org access',
    title: 'Invite user',
    subtitle: 'Send a scoped invite with role, brand access and approval permissions.',
    confirm: 'Send invite',
    tone: 'primary',
    permission: { currentRole: 'CRM / Retention Manager', allowed: false, note: 'Org Admin must send production invites. This submits an invite request for approval.' },
    steps: ['Create pending invite', 'Apply role permissions', 'Require 2FA on first login'],
    fields: [
      { label: 'Email', value: 'backend.lead@operator.com' },
      { label: 'Role', value: 'Technical Admin', type: 'select' },
      { label: 'Brand access', value: 'All brands', type: 'select' },
      { label: 'Expires', value: '48 hours', type: 'select' },
    ],
    api: { method: 'POST', path: '/org/invites', payload: ['email', 'role', 'brandIds', 'expiresAt', 'require2fa'] },
  },
  recalculateSegments: {
    icon: RefreshCw,
    eyebrow: 'Audience sync',
    title: 'Recalculate segments',
    subtitle: 'Rebuild dynamic audience counts and surface eligibility changes before campaign use.',
    confirm: 'Recalculate now',
    tone: 'primary',
    permission: { currentRole: 'CRM / Retention Manager', allowed: true, note: 'Can recalculate previews. Publishing updated segment counts requires segment owner approval.' },
    steps: ['Fetch latest player events', 'Apply rules and exclusions', 'Compare audience movement'],
    fields: [
      { label: 'Scope', value: 'All active segments', type: 'select' },
      { label: 'Run mode', value: 'Preview counts before publishing', type: 'select' },
      { label: 'Notify owners', value: 'Only if blockers are found', type: 'select' },
    ],
    api: { method: 'POST', path: '/segments/recalculate', payload: ['segmentIds', 'preview', 'notifyOwners'] },
  },
  submitSegmentApproval: {
    icon: ClipboardCheck,
    eyebrow: 'Segment approval',
    title: 'Submit segment for approval',
    subtitle: 'Route the new audience logic to Risk/Compliance before it can power live rewards.',
    confirm: 'Submit approval',
    tone: 'warning',
    permission: { currentRole: 'CRM / Retention Manager', allowed: true, note: 'Can submit for approval. Reviewer decision is owned by Risk/Compliance.' },
    steps: ['Attach rule diff', 'Attach audience preview', 'Require reviewer note for blockers'],
    fields: [
      { label: 'Reviewer group', value: 'Risk & Compliance', type: 'select' },
      { label: 'Reason', value: 'New reusable campaign audience', type: 'textarea' },
    ],
    api: { method: 'POST', path: '/approvals/segments', payload: ['segmentDraftId', 'previewStats', 'reviewerGroup', 'reason'] },
  },
  emergencyAction: {
    icon: AlertTriangle,
    eyebrow: 'Emergency action',
    title: 'Confirm operational action',
    subtitle: 'High-impact actions require an audit reason and visible downstream effects.',
    confirm: 'Confirm action',
    tone: 'danger',
    permission: { currentRole: 'CRM / Retention Manager', allowed: false, note: 'Emergency execution requires Technical Admin or Risk lead. This records a request.' },
    steps: ['Lock affected object', 'Notify owners', 'Write audit event and rollback path'],
    fields: [
      { label: 'Action reason', value: 'Provider incident mitigation', type: 'textarea' },
      { label: 'Rollback owner', value: 'Technical Admin', type: 'select' },
    ],
    api: { method: 'POST', path: '/ops/actions', payload: ['actionId', 'reason', 'rollbackOwner', 'notifyOwners'] },
  },
};

export default function ActionModal({ state, onClose }: { state: ActionModalState | null; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const config = state ? CONFIG[state.kind] : null;
  const runId = useMemo(() => `run-${Math.floor(1000 + Math.random() * 8999)}`, [state?.kind]);

  if (!state || !config) return null;
  const Icon = config.icon;
  const title = state.title ?? config.title;
  const subtitle = state.subtitle ?? config.subtitle;
  const toneColor = config.tone === 'danger' ? 'var(--danger)' : config.tone === 'warning' ? 'var(--warning)' : 'var(--accent)';
  const toneBg = config.tone === 'danger' ? 'var(--danger-bg)' : config.tone === 'warning' ? 'var(--warning-bg)' : 'var(--accent-bg)';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8" style={{ background: 'var(--overlay-scrim)' }}>
      <div className="max-h-[86vh] w-full max-w-[640px] overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-1)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex min-w-0 gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: toneBg, color: toneColor }}>
              <Icon size={19} />
            </div>
            <div className="min-w-0">
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">{config.eyebrow}</div>
              <h2 className="mt-0.5 text-[17px] font-semibold tracking-tight text-fg-primary">{title}</h2>
              <p className="mt-1 text-[12.5px] leading-relaxed text-fg-secondary">{subtitle}</p>
              {state.context && <div className="mt-2 rounded-md px-2.5 py-1.5 font-mono text-[11px]" style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)' }}>{state.context}</div>}
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-[var(--surface-2)]">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[calc(86vh-150px)] overflow-y-auto px-5 py-4">
          {submitted ? (
            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--accent-border)', background: 'var(--accent-bg)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                  <Check size={18} strokeWidth={3} />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-fg-primary">Action recorded</div>
                  <div className="font-mono text-[11.5px] text-fg-muted">{runId} · audit event queued</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {config.steps.map((step) => (
                  <div key={step} className="rounded-lg border px-3 py-2" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
                    <div className="text-[11.5px] leading-snug text-fg-secondary">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-3">
                {config.fields.map((field) => (
                  <Field key={field.label} field={field} />
                ))}
              </div>

              <div className="mt-4 rounded-xl border p-4" style={{ borderColor: config.permission.allowed ? 'var(--accent-border)' : 'var(--warning)', background: config.permission.allowed ? 'var(--accent-bg)' : 'var(--warning-bg)' }}>
                <div className="flex items-start gap-3">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0" style={{ color: config.permission.allowed ? 'var(--accent)' : 'var(--warning)' }} />
                  <div>
                    <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Permission check</div>
                    <div className="mt-1 text-[12.5px] font-semibold text-fg-primary">{config.permission.currentRole}</div>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-fg-secondary">{config.permission.note}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
                <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">
                  <Loader size={13} /> What happens next
                </div>
                <div className="mt-3 grid gap-2">
                  {config.steps.map((step, index) => (
                    <div key={step} className="flex items-center gap-2 text-[12.5px] text-fg-secondary">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px]" style={{ background: 'var(--surface-3)', color: toneColor }}>{index + 1}</span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Backend contract preview</div>
                <div className="mt-2 rounded-md px-3 py-2 font-mono text-[11.5px] leading-relaxed text-fg-secondary" style={{ background: 'var(--surface-3)' }}>
                  {config.api.method} {config.api.path}<br />
                  payload: {config.api.payload.join(', ')}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-5 py-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
          <button onClick={onClose} className="rounded-md px-3 py-2 text-[12.5px] font-semibold text-fg-secondary" style={{ border: '1px solid var(--border-strong)' }}>
            {submitted ? 'Close' : 'Cancel'}
          </button>
          {!submitted && (
            <button onClick={() => setSubmitted(true)} className="rounded-md px-3.5 py-2 text-[12.5px] font-semibold" style={{ background: toneColor, color: config.tone === 'warning' ? '#241700' : config.tone === 'danger' ? '#fff' : 'var(--accent-fg)' }}>
              {config.permission.allowed ? config.confirm : 'Submit request'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ field }: { field: ActionConfig['fields'][number] }) {
  return (
    <label>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-fg-muted">{field.label}</span>
      {field.type === 'textarea' ? (
        <textarea defaultValue={field.value} rows={3} className="w-full resize-none rounded-md border px-3 py-2 text-[12.5px] leading-relaxed outline-none" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)', color: 'var(--fg-primary)' }} />
      ) : (
        <div className="flex items-center gap-2 rounded-md border px-3 py-2" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
          {field.type === 'select' ? <ClipboardCheck size={14} className="text-fg-muted" /> : field.label.toLowerCase().includes('email') ? <Mail size={14} className="text-fg-muted" /> : <KeyRound size={14} className="text-fg-muted" />}
          <input defaultValue={field.value} className="min-w-0 flex-1 bg-transparent text-[12.5px] text-fg-primary outline-none" />
        </div>
      )}
    </label>
  );
}
