import { useState } from 'react';
import { FileText, Building2, Network, Search, Check, AlertTriangle, Lock, ShieldCheck } from 'lucide-react';
import { Section, Field, TextInput, TextArea, Select } from '../../components/builder/form';
import ModuleSections from '../../components/builder/ModuleFields';
import { useCampaign } from '../../context/CampaignContext';
import type { BrandScope, NetworkSettings } from '../../context/CampaignContext';
import { BRANDS } from '../../data/campaigns';
import { OWNERS, TIMEZONES, ROLES, canCreateNetwork } from '../../data/validation';

export default function StepSetup() {
  const { draft, update, setRole } = useCampaign();
  const [brandQuery, setBrandQuery] = useState('');
  const canNetwork = canCreateNetwork(draft.role);

  const filtered = BRANDS.filter(
    (b) => b.name.toLowerCase().includes(brandQuery.toLowerCase()) || b.code.toLowerCase().includes(brandQuery.toLowerCase())
  );

  const toggleBrand = (code: string) => {
    update({
      brands: draft.brands.includes(code) ? draft.brands.filter((c) => c !== code) : [...draft.brands, code],
    });
  };

  const setScope = (scope: BrandScope) => {
    if (scope === 'network' && !canNetwork) return;
    update({ brandScope: scope });
  };

  const patchNetwork = (patch: Partial<NetworkSettings>) => update({ network: { ...draft.network, ...patch } });

  const isNetwork = draft.brandScope === 'network';
  const showBrandPicker = draft.brandScope === 'brand_only' || (isNetwork && draft.network.brandIdsMode === 'selected');

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[16px] font-semibold tracking-tight">Basic setup & brand scope</h2>
        <p className="mt-1 text-[13px] text-fg-secondary">Name the campaign, set its schedule, and decide which brands it runs on.</p>
      </div>

      {/* Acting-as role */}
      <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={16} className="text-fg-secondary" strokeWidth={1.75} />
          <div>
            <div className="text-[12.5px] font-medium text-fg-primary">Acting as</div>
            <div className="text-[11.5px] text-fg-muted">{ROLES.find((r) => r.id === draft.role)?.desc}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {ROLES.map((r) => {
            const active = draft.role === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className="rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors"
                style={active ? { background: 'var(--accent-bg)', color: 'var(--accent)' } : { color: 'var(--fg-secondary)' }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <Section icon={FileText} title="Campaign details">
        <div className="flex flex-col gap-4">
          <Field label="Campaign name" hint="internal, not shown to players" required>
            <TextInput value={draft.name} onChange={(v) => update({ name: v })} placeholder="e.g. Weekend Warriors Mission" />
          </Field>
          <Field label="Internal description" hint="context for your team">
            <TextArea value={draft.internalDesc} onChange={(v) => update({ internalDesc: v })} placeholder="What this campaign is for and how it should behave…" />
          </Field>
          <Field label="Player-facing title" hint="shown to players in-app">
            <TextInput value={draft.playerTitle} onChange={(v) => update({ playerTitle: v })} placeholder="e.g. Complete 3 quests, earn boosts" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start date" required>
              <TextInput type="date" value={draft.startDate} onChange={(v) => update({ startDate: v })} />
            </Field>
            <Field label="End date" required>
              <TextInput type="date" value={draft.endDate} onChange={(v) => update({ endDate: v })} />
            </Field>
            <Field label="Timezone">
              <Select value={draft.timezone} onChange={(v) => update({ timezone: v })} options={TIMEZONES} />
            </Field>
            <Field label="Owner">
              <Select value={draft.owner} onChange={(v) => update({ owner: v })} options={OWNERS} />
            </Field>
          </div>
        </div>
      </Section>

      <Section icon={Building2} title="Brand scope" desc="Run this campaign on a single brand, or pool it across the network.">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2.5">
            <ScopeCard
              active={draft.brandScope === 'brand_only'}
              onClick={() => setScope('brand_only')}
              icon={Building2}
              title="Brand only"
              code="BRAND_ONLY"
              desc="Runs on one or more brands, scored and paid per brand."
            />
            <ScopeCard
              active={isNetwork}
              onClick={() => setScope('network')}
              icon={Network}
              title="Network"
              code="NETWORK"
              desc="Pools players and prizes across multiple brands."
              locked={!canNetwork}
              lockNote="Only Org Admin can create network campaigns"
            />
          </div>

          {/* Role restriction note */}
          {!canNetwork && (
            <div className="flex items-start gap-2.5 rounded-lg border px-4 py-2.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
              <Lock size={14} className="mt-0.5 shrink-0 text-fg-muted" strokeWidth={2} />
              <p className="text-[12px] leading-relaxed text-fg-secondary">
                You're acting as <span className="font-medium text-fg-primary">{ROLES.find((r) => r.id === draft.role)?.label}</span>, so this campaign is limited to <span className="font-medium text-fg-primary">brand-only</span> scope. Switch to Org Admin above to build a network campaign.
              </p>
            </div>
          )}

          {/* Network settings */}
          {isNetwork && (
            <div className="rounded-lg border" style={{ borderColor: 'var(--accent-border)', background: 'var(--accent-bg)' }}>
              <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
                <Network size={14} style={{ color: 'var(--accent)' }} strokeWidth={2} />
                <span className="text-[12px] font-semibold" style={{ color: 'var(--accent)' }}>Network campaign settings</span>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4">
                <SettingChoice
                  label="Participating brands"
                  value={draft.network.brandIdsMode}
                  onChange={(v) => patchNetwork({ brandIdsMode: v as NetworkSettings['brandIdsMode'] })}
                  options={[{ v: 'all', l: 'All brands' }, { v: 'selected', l: 'Selected brands' }]}
                />
                <SettingChoice
                  label="Score aggregation"
                  value={draft.network.scoreAggregation}
                  onChange={(v) => patchNetwork({ scoreAggregation: v as NetworkSettings['scoreAggregation'] })}
                  options={[{ v: 'combined', l: 'Combined across brands' }, { v: 'per_brand', l: 'Ranked per brand' }]}
                />
                <SettingChoice
                  label="Prize scope"
                  value={draft.network.prizeScope}
                  onChange={(v) => patchNetwork({ prizeScope: v as NetworkSettings['prizeScope'] })}
                  options={[{ v: 'shared_pool', l: 'Shared pool' }, { v: 'per_brand', l: 'Per-brand pool' }]}
                />
                <SettingChoice
                  label="Display mode"
                  value={draft.network.displayMode}
                  onChange={(v) => patchNetwork({ displayMode: v as NetworkSettings['displayMode'] })}
                  options={[{ v: 'unified', l: 'Unified leaderboard' }, { v: 'per_brand', l: 'Per-brand view' }]}
                />
              </div>
            </div>
          )}

          {/* Brand picker */}
          {showBrandPicker && (
            <div className="rounded-lg border" style={{ borderColor: 'var(--border-strong)' }}>
              <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: 'var(--border-subtle)' }}>
                <Search size={14} className="text-fg-muted" strokeWidth={1.75} />
                <input
                  value={brandQuery}
                  onChange={(e) => setBrandQuery(e.target.value)}
                  placeholder={isNetwork ? 'Search brands to include in the network…' : 'Search brands…'}
                  className="w-full bg-transparent text-[13px] outline-none"
                />
                <span className="text-[11.5px] text-fg-muted">{draft.brands.length} selected</span>
              </div>
              <div className="max-h-52 overflow-y-auto p-1.5">
                {filtered.map((b) => {
                  const on = draft.brands.includes(b.code);
                  return (
                    <button
                      key={b.code}
                      onClick={() => toggleBrand(b.code)}
                      className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors"
                      style={{ background: on ? 'var(--surface-3)' : 'transparent' }}
                    >
                      <span
                        className="flex h-4 w-4 items-center justify-center rounded"
                        style={on ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { border: '1px solid var(--border-strong)' }}
                      >
                        {on && <Check size={11} strokeWidth={3} />}
                      </span>
                      <span className="font-mono text-[11px] font-medium text-fg-muted">{b.code}</span>
                      <span className="text-[13px] text-fg-primary">{b.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isNetwork && draft.network.brandIdsMode === 'all' && (
            <div className="rounded-lg border px-4 py-2.5 text-[12px] text-fg-secondary" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
              This campaign pools <span className="font-medium text-fg-primary">all {BRANDS.length} brands</span> in {`the organization`}.
            </div>
          )}

          {/* Jurisdiction warning for network */}
          {isNetwork && (
            <div className="flex items-start gap-2.5 rounded-lg border px-4 py-3" style={{ borderColor: 'rgba(231,168,60,0.3)', background: 'var(--warning-bg)' }}>
              <AlertTriangle size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--warning)' }} strokeWidth={2} />
              <div>
                <div className="text-[13px] font-medium text-fg-primary">Network brands may span multiple jurisdictions</div>
                <p className="mt-0.5 text-[12px] leading-relaxed text-fg-secondary">
                  Bonus rules, reward caps and eligibility differ by jurisdiction. You'll confirm the eligibility mapping in the Budget & Safety step before launch.
                </p>
              </div>
            </div>
          )}
        </div>
      </Section>

      <ModuleSections step="setup" />
    </div>
  );
}

function ScopeCard({
  active, onClick, icon: Icon, title, code, desc, locked, lockNote,
}: {
  active: boolean; onClick: () => void; icon: typeof Building2; title: string; code: string; desc: string; locked?: boolean; lockNote?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className="relative flex flex-col gap-1.5 rounded-lg border px-4 py-3.5 text-left transition-colors"
      style={
        locked
          ? { borderColor: 'var(--border-subtle)', background: 'var(--surface-2)', opacity: 0.6, cursor: 'not-allowed' }
          : active
          ? { borderColor: 'var(--accent-border)', background: 'var(--accent-bg)' }
          : { borderColor: 'var(--border-strong)' }
      }
    >
      <div className="flex items-center gap-2">
        <Icon size={16} style={{ color: active && !locked ? 'var(--accent)' : 'var(--fg-secondary)' }} strokeWidth={1.75} />
        <span className="text-[13.5px] font-medium" style={{ color: active && !locked ? 'var(--accent)' : 'var(--fg-primary)' }}>{title}</span>
        {locked && <Lock size={13} className="text-fg-muted" strokeWidth={2} />}
        <span className="ml-auto font-mono text-[10px] font-medium text-fg-muted">{code}</span>
      </div>
      <span className="text-[11.5px] leading-relaxed text-fg-muted">{locked ? lockNote : desc}</span>
    </button>
  );
}

function SettingChoice({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[];
}) {
  return (
    <div>
      <div className="mb-1.5 text-[11.5px] font-medium text-fg-secondary">{label}</div>
      <div className="flex overflow-hidden rounded-md border" style={{ borderColor: 'var(--border-strong)' }}>
        {options.map((o) => {
          const on = value === o.v;
          return (
            <button
              key={o.v}
              onClick={() => onChange(o.v)}
              className="flex-1 px-2 py-1.5 text-[11.5px] font-medium transition-colors"
              style={on ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { background: 'var(--surface-1)', color: 'var(--fg-secondary)' }}
            >
              {o.l}
            </button>
          );
        })}
      </div>
    </div>
  );
}
