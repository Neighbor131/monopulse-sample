import { useState } from 'react';
import { Gift, Plug, Check, AlertTriangle, Zap, Loader, RefreshCw } from 'lucide-react';
import { Section, Field, TextInput, Select } from '../../components/builder/form';
import ModuleSections from '../../components/builder/ModuleFields';
import { useCampaign } from '../../context/CampaignContext';
import { REWARD_TYPES, CURRENCIES, EXPIRIES, FULFILLMENT_METHODS } from '../../data/validation';
import type { Health } from '../../data/validation';

const HEALTH_META: Record<Health, { label: string; color: string; bg: string }> = {
  connected: { label: 'Connected', color: 'var(--success)', bg: 'var(--status-live-bg)' },
  degraded: { label: 'Degraded', color: 'var(--warning)', bg: 'var(--warning-bg)' },
  error: { label: 'Error', color: 'var(--danger)', bg: 'var(--danger-bg)' },
};

type TestState = 'idle' | 'testing' | 'success' | 'warning' | 'error';

export default function StepRewards() {
  const { draft, update } = useCampaign();
  const [test, setTest] = useState<TestState>('idle');

  const selected = FULFILLMENT_METHODS.find((m) => m.id === draft.fulfillmentMethod);

  const runTest = () => {
    if (!selected) return;
    setTest('testing');
    setTimeout(() => {
      if (selected.health === 'error') setTest('error');
      else if (selected.health === 'degraded') setTest('warning');
      else setTest('success');
    }, 1100);
  };

  const selectMethod = (id: string) => {
    update({ fulfillmentMethod: id });
    setTest('idle');
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[16px] font-semibold tracking-tight">Rewards & fulfillment</h2>
        <p className="mt-1 text-[13px] text-fg-secondary">Define the reward, then choose how it's actually granted to the player.</p>
      </div>

      <Section icon={Gift} title="Reward">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Reward type" required>
            <Select value={draft.rewardType} onChange={(v) => update({ rewardType: v })} options={REWARD_TYPES} placeholder="Choose reward…" />
          </Field>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Field label="Amount / value" required>
              <TextInput value={draft.rewardAmount} onChange={(v) => update({ rewardAmount: v })} placeholder="e.g. 25" prefix="€" mono />
            </Field>
            <Field label="Currency">
              <Select value={draft.currency} onChange={(v) => update({ currency: v })} options={CURRENCIES} />
            </Field>
          </div>
          <Field label="Bonus template / GUID" hint="from operator catalog">
            <TextInput value={draft.bonusTemplate} onChange={(v) => update({ bonusTemplate: v })} placeholder="e.g. tmpl_freespin_20x" mono />
          </Field>
          <Field label="Reward expiry">
            <Select value={draft.expiry} onChange={(v) => update({ expiry: v })} options={EXPIRIES} placeholder="When it expires…" />
          </Field>
          <Field label="Max reward per player">
            <TextInput value={draft.maxPerPlayer} onChange={(v) => update({ maxPerPlayer: v })} placeholder="e.g. 50" prefix="€" mono />
          </Field>
          <Field label="Total reward cap">
            <TextInput value={draft.totalCap} onChange={(v) => update({ totalCap: v })} placeholder="e.g. 25000" prefix="€" mono />
          </Field>
        </div>
      </Section>

      {/* Module-specific reward mechanics */}
      <ModuleSections step="rewards" />

      <Section icon={Plug} title="Fulfillment method" desc="How MonoPulse turns a reward decision into a real bonus on the operator platform.">
        <div className="flex flex-col gap-2.5">
          {FULFILLMENT_METHODS.map((m) => {
            const active = draft.fulfillmentMethod === m.id;
            const health = HEALTH_META[m.health];
            return (
              <button
                key={m.id}
                onClick={() => selectMethod(m.id)}
                className="flex items-start gap-3 rounded-lg border px-4 py-3.5 text-left"
                style={active ? { borderColor: 'var(--accent-border)', background: 'var(--accent-bg)' } : { borderColor: 'var(--border-strong)' }}
              >
                <span
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                  style={active ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { border: '1px solid var(--border-strong)' }}
                >
                  {active && <Check size={11} strokeWidth={3} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-medium text-fg-primary">{m.name}</span>
                    <span
                      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-semibold"
                      style={{ color: health.color, background: health.bg }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: health.color }} />
                      {health.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-fg-secondary">{m.desc}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-fg-muted">Requires:</span>
                    {m.requires.map((r) => (
                      <span key={r} className="rounded px-1.5 py-0.5 text-[10.5px] font-medium" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Test fulfillment */}
        {selected && (
          <div className="mt-4 rounded-lg border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <div className="text-[13px] font-medium text-fg-primary">Test fulfillment</div>
                <div className="text-[12px] text-fg-secondary">{selected.note}</div>
              </div>
              <button
                onClick={runTest}
                disabled={test === 'testing'}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[12.5px] font-semibold"
                style={{ background: 'var(--surface-3)', color: 'var(--fg-primary)' }}
              >
                {test === 'testing' ? <Loader size={14} className="animate-spin" strokeWidth={2} /> : <Zap size={14} strokeWidth={2} />}
                {test === 'testing' ? 'Testing…' : 'Run test'}
              </button>
            </div>

            {test === 'success' && (
              <TestResult color="var(--success)" bg="var(--status-live-bg)" icon={<Check size={15} strokeWidth={2.5} />}
                title="Test bonus granted successfully"
                detail="A test reward was created and confirmed on the platform in 240ms. Ready for launch." />
            )}
            {test === 'warning' && (
              <TestResult color="var(--warning)" bg="var(--warning-bg)" icon={<AlertTriangle size={15} strokeWidth={2.25} />}
                title="Granted with a warning"
                detail="Reward was created but currency mapping is unconfirmed. Confirm the wallet route before launch." />
            )}
            {test === 'error' && (
              <TestResult color="var(--danger)" bg="var(--danger-bg)" icon={<AlertTriangle size={15} strokeWidth={2.25} />}
                title="Fulfillment failed — provider auth error"
                detail="The external bonus engine rejected the request (401 Unauthorized). Reconnect the provider before this campaign can launch."
                action={
                  <button className="mt-2 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-semibold" style={{ background: 'var(--danger)', color: '#fff' }}>
                    <RefreshCw size={13} strokeWidth={2.25} /> Reconnect provider
                  </button>
                } />
            )}
          </div>
        )}
      </Section>
    </div>
  );
}

function TestResult({
  color,
  bg,
  icon,
  title,
  detail,
  action,
}: {
  color: string;
  bg: string;
  icon: React.ReactNode;
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 border-t px-4 py-3" style={{ borderColor: 'var(--border-subtle)', background: bg }}>
      <span className="mt-0.5 shrink-0" style={{ color }}>{icon}</span>
      <div>
        <div className="text-[13px] font-medium" style={{ color: 'var(--fg-primary)' }}>{title}</div>
        <p className="mt-0.5 text-[12px] leading-relaxed text-fg-secondary">{detail}</p>
        {action}
      </div>
    </div>
  );
}
