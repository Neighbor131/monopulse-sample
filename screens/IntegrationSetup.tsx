import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronRight,
  ClipboardCheck,
  Code2,
  KeyRound,
  Plug,
  RotateCcw,
  Send,
  ServerCog,
  ShieldCheck,
  Webhook,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BRANDS } from '../data/campaigns';

type StepId = 'scope' | 'credentials' | 'webhooks' | 'events' | 'rewards' | 'certification' | 'review';
type Status = 'ready' | 'warning' | 'blocked';

interface Step {
  id: StepId;
  label: string;
  desc: string;
  status: Status;
}

const STEPS: Step[] = [
  { id: 'scope', label: 'Brand scope', desc: 'Operator, brand and environment', status: 'ready' },
  { id: 'credentials', label: 'API credentials', desc: 'Key scopes and rotation policy', status: 'ready' },
  { id: 'webhooks', label: 'Webhooks', desc: 'Delivery URLs and signing', status: 'warning' },
  { id: 'events', label: 'Event mapping', desc: 'Player, wallet and game events', status: 'ready' },
  { id: 'rewards', label: 'Reward fulfillment', desc: 'Wallet, bonus GUID and trigger route', status: 'warning' },
  { id: 'certification', label: 'Certification', desc: 'Sandbox checks before production', status: 'blocked' },
  { id: 'review', label: 'Review', desc: 'Production readiness summary', status: 'warning' },
];

const EVENT_ROWS = [
  ['player.deposit.created', 'Deposit amount, currency, payment method', 'Campaign triggers, segments'],
  ['bet.settled', 'Stake, win, game, provider, NGR', 'Rakeback, missions, leaderboards'],
  ['reward.granted', 'Reward ID, grant status, bonus GUID', 'Reward state, liability'],
  ['player.responsible_gaming.updated', 'Limit, exclusion, cooling-off state', 'Eligibility suppression'],
  ['jackpot.win', 'Amount, jackpot ID, player, currency', 'Manual payout approval'],
];

const CERT_ROWS = [
  { label: 'Authentication', status: 'ready', detail: 'Sandbox key accepted with scoped access.' },
  { label: 'Webhook signature', status: 'blocked', detail: 'Latest HMAC test failed on timestamp tolerance.' },
  { label: 'Event schema', status: 'ready', detail: 'Core player, wallet and bet events validated.' },
  { label: 'Reward route', status: 'warning', detail: 'Bonus GUID lookup configured, wallet payout pending.' },
  { label: 'Dead-letter replay', status: 'warning', detail: 'Replay tested once, approval gate not confirmed.' },
];

export default function IntegrationSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<StepId>('scope');
  const activeIndex = STEPS.findIndex((s) => s.id === step);
  const active = STEPS[activeIndex];
  const summary = useMemo(() => ({
    ready: STEPS.filter((s) => s.status === 'ready').length,
    warning: STEPS.filter((s) => s.status === 'warning').length,
    blocked: STEPS.filter((s) => s.status === 'blocked').length,
  }), []);

  const next = () => setStep(STEPS[Math.min(activeIndex + 1, STEPS.length - 1)].id);
  const previous = () => setStep(STEPS[Math.max(activeIndex - 1, 0)].id);

  return (
    <div className="mx-auto w-full max-w-[1360px] px-8 py-6">
      <button onClick={() => navigate('/integrations')} className="mb-4 flex items-center gap-1.5 text-[12.5px] font-medium text-fg-secondary hover:text-fg-primary">
        <ArrowLeft size={14} strokeWidth={2.25} /> Integrations
      </button>

      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[19px] font-semibold tracking-tight text-fg-primary">Integration setup</h1>
            <StatusPill status={active.status} />
          </div>
          <p className="mt-1 text-[13px] text-fg-secondary">NovaBet Group · ACR AceRoyale · production readiness</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-md border px-3.5 py-2 text-[13px] font-semibold text-fg-secondary" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
            <RotateCcw size={15} strokeWidth={2.25} /> Run test
          </button>
          <button className="flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            <Send size={15} strokeWidth={2.25} /> Submit certification
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3">
        <Metric label="Ready checks" value={String(summary.ready)} icon={Check} />
        <Metric label="Warnings" value={String(summary.warning)} icon={AlertTriangle} tone="warning" />
        <Metric label="Blockers" value={String(summary.blocked)} icon={ShieldCheck} tone="danger" />
        <Metric label="Target launch" value="14 Jul" icon={ClipboardCheck} />
      </div>

      <div className="mt-5 grid grid-cols-[280px_minmax(0,1fr)_320px] gap-4">
        <aside className="rounded-xl border p-2" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          {STEPS.map((s, index) => {
            const on = s.id === step;
            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-[var(--surface-2)]"
                style={on ? { background: 'var(--accent-bg)' } : undefined}
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-semibold" style={on ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-fg-primary">{s.label}</span>
                    <Dot status={s.status} />
                  </span>
                  <span className="mt-0.5 block text-[11.5px] leading-relaxed text-fg-muted">{s.desc}</span>
                </span>
              </button>
            );
          })}
        </aside>

        <main className="rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
          <div className="border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">
              <StepIcon step={step} /> Step {activeIndex + 1} of {STEPS.length}
            </div>
            <h2 className="mt-1 text-[16px] font-semibold text-fg-primary">{active.label}</h2>
            <p className="mt-0.5 text-[12.5px] text-fg-secondary">{active.desc}</p>
          </div>
          <div className="p-5">
            {step === 'scope' && <ScopeStep />}
            {step === 'credentials' && <CredentialsStep />}
            {step === 'webhooks' && <WebhooksStep />}
            {step === 'events' && <EventsStep />}
            {step === 'rewards' && <RewardsStep />}
            {step === 'certification' && <CertificationStep />}
            {step === 'review' && <ReviewStep />}
          </div>
          <div className="flex items-center justify-between border-t px-5 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <button onClick={previous} disabled={activeIndex === 0} className="rounded-md border px-3 py-2 text-[12.5px] font-semibold disabled:opacity-40" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)', color: 'var(--fg-secondary)' }}>Back</button>
            <button onClick={next} disabled={activeIndex === STEPS.length - 1} className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[12.5px] font-semibold disabled:opacity-40" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>Continue <ChevronRight size={14} strokeWidth={2.25} /></button>
          </div>
        </main>

        <aside className="flex flex-col gap-3">
          <section className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Readiness</div>
            <div className="mt-3 flex flex-col gap-2">
              {CERT_ROWS.map((row) => <CheckRow key={row.label} {...row} />)}
            </div>
          </section>
          <section className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Backend handoff</div>
            <div className="mt-3 grid gap-2 text-[12px] text-fg-secondary">
              <Info label="API scopes" value="events:write, rewards:write, players:read" />
              <Info label="Webhook signing" value="HMAC SHA-256 required" />
              <Info label="Retry policy" value="5 attempts then quarantine" />
              <Info label="Owner" value="Technical Admin + Java backend" />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ScopeStep() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Organization" value="NovaBet Group" />
      <Field label="Environment" value="Production" />
      <Field label="Primary brand" value="ACR · AceRoyale Malta" />
      <Field label="Jurisdiction" value="Malta · EUR · Europe/Malta" />
      <section className="col-span-2 rounded-lg border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Brand access</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {BRANDS.map((brand) => <span key={brand.code} className="rounded-md border px-2.5 py-1.5 font-mono text-[12px] text-fg-secondary" style={{ borderColor: brand.code === 'ACR' ? 'var(--accent-border)' : 'var(--border-subtle)', background: brand.code === 'ACR' ? 'var(--accent-bg)' : 'var(--surface-1)' }}>{brand.code}</span>)}
        </div>
      </section>
    </div>
  );
}

function CredentialsStep() {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="API key name" value="ACR production event ingest" />
        <Field label="Rotation policy" value="90 days" />
        <Field label="Auth mode" value="Bearer token + HMAC webhook signing" />
        <Field label="IP allowlist" value="Operator gateway + MonoPulse workers" />
      </div>
      <Checklist rows={['events:write', 'players:read', 'rewards:write', 'webhooks:test', 'providers:read']} />
    </div>
  );
}

function WebhooksStep() {
  return (
    <div className="grid gap-4">
      <Field label="Reward callback URL" value="https://acr.example.com/monopulse/rewards" mono />
      <Field label="Campaign callback URL" value="https://acr.example.com/monopulse/campaigns" mono />
      <div className="grid grid-cols-3 gap-3">
        <MiniCheck label="HMAC signing" status="ready" />
        <MiniCheck label="Timestamp tolerance" status="blocked" />
        <MiniCheck label="Replay protection" status="warning" />
      </div>
      <Payload title="Test event" body={'{\n  "eventType": "reward.granted",\n  "brandId": "ACR",\n  "playerId": "PLR-4471902",\n  "rewardId": "rw-fs-acr-20"\n}'} />
    </div>
  );
}

function EventsStep() {
  return (
    <div className="overflow-hidden rounded-lg border" style={{ borderColor: 'var(--border-subtle)' }}>
      <table className="w-full text-left">
        <thead style={{ background: 'var(--surface-2)' }}>
          <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">
            <th className="px-4 py-2.5">Event</th>
            <th className="px-4 py-2.5">Required payload</th>
            <th className="px-4 py-2.5">Used by</th>
          </tr>
        </thead>
        <tbody>
          {EVENT_ROWS.map(([event, payload, used]) => (
            <tr key={event} className="border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <td className="px-4 py-3 font-mono text-[12px] text-fg-primary">{event}</td>
              <td className="px-4 py-3 text-[12.5px] text-fg-secondary">{payload}</td>
              <td className="px-4 py-3 text-[12.5px] text-fg-secondary">{used}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RewardsStep() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <RouteCard icon={Plug} title="Operator wallet" status="warning" detail="Payout endpoint authenticated, 401 incident remains on GLR." />
      <RouteCard icon={KeyRound} title="Existing bonus GUID" status="ready" detail="Bonus lookup configured for ACR free spins and deposit bonus." />
      <RouteCard icon={ServerCog} title="MonoPulse trigger" status="ready" detail="Internal trigger can call platform bonus creation endpoint." />
      <RouteCard icon={ClipboardCheck} title="Manual ops queue" status="ready" detail="High-value and physical rewards route to approval-backed queue." />
    </div>
  );
}

function CertificationStep() {
  return (
    <div className="grid gap-3">
      {CERT_ROWS.map((row) => <CheckRow key={row.label} {...row} large />)}
      <Payload title="Blocking result" body={'HMAC signature mismatch on signature.test\nExpected canonical payload hash differs from operator header.\nNext owner: Technical Admin + operator backend'} />
    </div>
  );
}

function ReviewStep() {
  return (
    <div className="grid gap-4">
      <section className="rounded-lg border p-4" style={{ borderColor: 'var(--warning)', background: 'var(--warning-bg)' }}>
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
          <div>
            <div className="text-[14px] font-semibold text-fg-primary">Not production ready</div>
            <div className="mt-1 text-[12.5px] text-fg-secondary">Webhook signature tolerance and reward route confirmation are still open.</div>
          </div>
        </div>
      </section>
      <div className="grid grid-cols-2 gap-3">
        <Info label="Ready" value="Authentication, event schema, core event routes" />
        <Info label="Needs backend" value="Signature tolerance, replay policy, wallet payout final test" />
        <Info label="Approval gate" value="Technical Admin certification required" />
        <Info label="Audit scope" value="API key, webhook test, replay, certification decision" />
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, tone = 'default' }: { icon: LucideIcon; label: string; value: string; tone?: 'default' | 'warning' | 'danger' }) {
  const color = tone === 'danger' ? 'var(--danger)' : tone === 'warning' ? 'var(--warning)' : 'var(--accent)';
  return <section className="rounded-xl border px-4 py-3.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}><div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted"><Icon size={13} style={{ color }} />{label}</div><div className="mt-1.5 font-mono text-[22px] font-semibold text-fg-primary">{value}</div></section>;
}

function StatusPill({ status }: { status: Status }) {
  const map = status === 'blocked' ? { label: 'Blocked', fg: 'var(--danger)', bg: 'var(--danger-bg)' } : status === 'warning' ? { label: 'Warning', fg: 'var(--warning)', bg: 'var(--warning-bg)' } : { label: 'Ready', fg: 'var(--success)', bg: 'var(--status-live-bg)' };
  return <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ color: map.fg, background: map.bg }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: map.fg }} />{map.label}</span>;
}

function Dot({ status }: { status: Status }) {
  const color = status === 'blocked' ? 'var(--danger)' : status === 'warning' ? 'var(--warning)' : 'var(--success)';
  return <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />;
}

function StepIcon({ step }: { step: StepId }) {
  const Icon = step === 'credentials' ? KeyRound : step === 'webhooks' ? Webhook : step === 'events' ? Code2 : step === 'rewards' ? Plug : step === 'certification' ? ShieldCheck : step === 'review' ? ClipboardCheck : ServerCog;
  return <Icon size={13} strokeWidth={2.25} />;
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return <label className="block"><span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">{label}</span><input defaultValue={value} className={`w-full rounded-md border px-3 py-2.5 text-[13px] outline-none ${mono ? 'font-mono' : ''}`} style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)', color: 'var(--fg-primary)' }} /></label>;
}

function Checklist({ rows }: { rows: string[] }) {
  return <section className="rounded-lg border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Scopes</div><div className="mt-3 flex flex-wrap gap-2">{rows.map((row) => <span key={row} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[12px]" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}><Check size={12} strokeWidth={3} />{row}</span>)}</div></section>;
}

function MiniCheck({ label, status }: { label: string; status: Status }) {
  return <section className="rounded-lg border p-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div className="flex items-center justify-between gap-2"><span className="text-[12.5px] font-medium text-fg-primary">{label}</span><StatusPill status={status} /></div></section>;
}

function Payload({ title, body }: { title: string; body: string }) {
  return <section><div className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">{title}</div><pre className="max-h-64 overflow-auto rounded-lg border p-3 font-mono text-[11.5px] leading-relaxed text-fg-secondary" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>{body}</pre></section>;
}

function RouteCard({ icon: Icon, title, detail, status }: { icon: LucideIcon; title: string; detail: string; status: Status }) {
  return <section className="rounded-lg border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-md" style={{ background: 'var(--surface-3)', color: 'var(--accent)' }}><Icon size={16} strokeWidth={2.25} /></span><div className="text-[13px] font-semibold text-fg-primary">{title}</div></div><StatusPill status={status} /></div><p className="mt-3 text-[12.5px] leading-relaxed text-fg-secondary">{detail}</p></section>;
}

function CheckRow({ label, detail, status, large }: { label: string; detail: string; status: Status; large?: boolean }) {
  return <section className={`rounded-lg border ${large ? 'p-4' : 'px-3 py-2.5'}`} style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div className="flex items-start justify-between gap-3"><div><div className="text-[12.5px] font-semibold text-fg-primary">{label}</div><div className="mt-0.5 text-[11.5px] leading-relaxed text-fg-secondary">{detail}</div></div><StatusPill status={status} /></div></section>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <section className="rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}><div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">{label}</div><div className="mt-0.5 text-[12.5px] font-medium text-fg-primary">{value}</div></section>;
}
