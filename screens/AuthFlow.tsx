import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Check, KeyRound, Lock, Mail, ShieldCheck, Smartphone, UserPlus } from 'lucide-react';
import { BRANDS, ORG } from '../data/campaigns';
import BrandLogo from '../components/BrandLogo';

type AuthMode = 'login' | 'signup' | 'invite' | 'forgot' | '2fa' | 'select-org';

const MODE_COPY: Record<AuthMode, { title: string; subtitle: string; cta: string }> = {
  login: {
    title: 'Sign in to MonoPulse',
    subtitle: 'Use your operator account to manage campaigns, loyalty, rewards and compliance workflows.',
    cta: 'Continue',
  },
  signup: {
    title: 'Create operator workspace',
    subtitle: 'Start a new organization, invite backend and casino teams, then connect brands.',
    cta: 'Create workspace',
  },
  invite: {
    title: 'Accept your invite',
    subtitle: 'Join NovaBet Group with scoped access to CRM, rewards and approval operations.',
    cta: 'Accept invite',
  },
  forgot: {
    title: 'Reset your password',
    subtitle: 'We will send a secure recovery link to your work email.',
    cta: 'Send recovery link',
  },
  '2fa': {
    title: 'Two-factor verification',
    subtitle: 'Enter the six-digit code from your authenticator app before accessing live operations.',
    cta: 'Verify and enter',
  },
  'select-org': {
    title: 'Select organization',
    subtitle: 'Choose the operator scope you want to work in for this session.',
    cta: 'Enter backoffice',
  },
};

export default function AuthFlow({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate();
  const copy = MODE_COPY[mode];
  const isOrg = mode === 'select-org';
  const is2fa = mode === '2fa';
  const isForgot = mode === 'forgot';

  const submit = () => {
    if (mode === 'login' || mode === 'invite') navigate('/2fa');
    else if (mode === '2fa' || mode === 'select-org') navigate('/dashboard');
    else if (mode === 'signup') navigate('/select-org');
    else navigate('/login');
  };

  return (
    <main className="min-h-screen px-6 py-8" style={{ background: 'var(--bg-base)', color: 'var(--fg-primary)' }}>
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[1180px] items-center gap-8">
        <section className="hidden flex-1 lg:block">
          <div className="max-w-[520px]">
            <BrandLogo size="lg" />
            <h1 className="mt-8 text-[30px] font-semibold leading-tight tracking-tight">Controlled access for gamified casino operations.</h1>
            <p className="mt-4 text-[14px] leading-relaxed text-fg-secondary">
              The backoffice needs to prove who is entering, which brands they can touch, and whether they are allowed to launch, approve or fulfil rewards.
            </p>
            <div className="mt-8 grid gap-3">
              <TrustRow icon={ShieldCheck} title="Role-aware by default" detail="CRM, Casino Manager, Risk, Compliance and Technical Admin permissions can be surfaced from the first session." />
              <TrustRow icon={Building2} title="Org first, brand scoped" detail="Users can see organization health while campaign setup restricts specific brand IDs." />
              <TrustRow icon={Lock} title="Audit-friendly entry" detail="2FA, invite acceptance and session scope become part of the operational audit story." />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[460px] rounded-xl border p-6" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)', boxShadow: 'var(--shadow-md)' }}>
          <div className="mb-6">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">{modeLabel(mode)}</div>
            <h2 className="mt-2 text-[22px] font-semibold tracking-tight text-fg-primary">{copy.title}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-fg-secondary">{copy.subtitle}</p>
          </div>

          {isOrg ? <OrgSelector /> : is2fa ? <TwoFactor /> : <CredentialFields mode={mode} />}

          <button onClick={submit} className="mt-5 flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            {copy.cta} <ArrowRight size={15} />
          </button>

          <AuthFooter mode={mode} isForgot={isForgot} />
        </section>
      </div>
    </main>
  );
}

function CredentialFields({ mode }: { mode: AuthMode }) {
  const invite = mode === 'invite';
  const signup = mode === 'signup';
  const forgot = mode === 'forgot';
  return (
    <div className="grid gap-3">
      {signup && <Field icon={Building2} label="Organization name" value={ORG} />}
      {invite && <InviteCard />}
      <Field icon={Mail} label="Work email" value={invite ? 'mara@novabet.example' : ''} placeholder="name@operator.com" />
      {!forgot && <Field icon={KeyRound} label="Password" type="password" placeholder="••••••••••••" />}
      {signup && <Field icon={UserPlus} label="First admin role" value="CRM / Retention Manager" />}
      {!forgot && (
        <label className="mt-1 flex items-start gap-2 text-[12px] text-fg-secondary">
          <input type="checkbox" defaultChecked className="mt-0.5 accent-[var(--accent)]" />
          Require 2FA and audit every launch, approval and manual grant action.
        </label>
      )}
    </div>
  );
}

function TwoFactor() {
  return (
    <div>
      <div className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
        <Smartphone size={18} className="text-fg-muted" />
        <div>
          <div className="text-[13px] font-semibold text-fg-primary">Authenticator app</div>
          <div className="text-[11.5px] text-fg-muted">Code expires in 28 seconds</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-6 gap-2">
        {['4', '8', '1', '6', '2', '9'].map((digit, index) => (
          <input key={`${digit}-${index}`} defaultValue={digit} className="h-11 rounded-md border bg-transparent text-center font-mono text-[18px] font-semibold outline-none" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }} />
        ))}
      </div>
    </div>
  );
}

function OrgSelector() {
  return (
    <div className="grid gap-3">
      <button className="rounded-lg border p-4 text-left" style={{ borderColor: 'var(--accent-border)', background: 'var(--accent-bg)' }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[14px] font-semibold text-fg-primary">{ORG}</div>
            <div className="mt-0.5 text-[12px] text-fg-secondary">CRM/Retention Manager · 6 brands</div>
          </div>
          <Check size={17} style={{ color: 'var(--accent)' }} />
        </div>
      </button>
      <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-muted">Available brands</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {BRANDS.map((brand) => <span key={brand.code} className="rounded-md px-2 py-1 font-mono text-[11px]" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{brand.code}</span>)}
        </div>
      </div>
    </div>
  );
}

function InviteCard() {
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      <div className="text-[12.5px] font-semibold text-fg-primary">Invite from NovaBet Group</div>
      <div className="mt-1 text-[11.5px] leading-relaxed text-fg-secondary">Role: CRM / Retention Manager · access: ACR, SPC, VGV · expires in 18h.</div>
    </div>
  );
}

function Field({ icon: Icon, label, placeholder, value, type = 'text' }: { icon: typeof Mail; label: string; placeholder?: string; value?: string; type?: string }) {
  return (
    <label>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-fg-muted">{label}</span>
      <span className="flex items-center gap-2 rounded-md border px-3 py-2.5" style={{ borderColor: 'var(--border-strong)', background: 'var(--surface-2)' }}>
        <Icon size={15} className="text-fg-muted" />
        <input defaultValue={value} type={type} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-[13px] text-fg-primary outline-none" />
      </span>
    </label>
  );
}

function TrustRow({ icon: Icon, title, detail }: { icon: typeof ShieldCheck; title: string; detail: string }) {
  return (
    <div className="flex gap-3 rounded-lg border p-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <Icon size={17} style={{ color: 'var(--accent)' }} />
      <div>
        <div className="text-[13px] font-semibold text-fg-primary">{title}</div>
        <div className="mt-0.5 text-[12px] leading-relaxed text-fg-secondary">{detail}</div>
      </div>
    </div>
  );
}

function AuthFooter({ mode, isForgot }: { mode: AuthMode; isForgot: boolean }) {
  if (mode === 'select-org') {
    return <p className="mt-4 text-center text-[12px] text-fg-muted">Need a different brand scope? Ask an org admin to update permissions.</p>;
  }
  if (isForgot) {
    return <p className="mt-4 text-center text-[12px] text-fg-muted"><Link className="font-semibold" style={{ color: 'var(--accent)' }} to="/login">Back to sign in</Link></p>;
  }
  return (
    <div className="mt-4 flex items-center justify-between text-[12px]">
      <Link to="/forgot-password" className="text-fg-muted hover:text-fg-secondary">Forgot password?</Link>
      <Link to={mode === 'signup' ? '/login' : '/signup'} style={{ color: 'var(--accent)' }} className="font-semibold">{mode === 'signup' ? 'Sign in' : 'Create workspace'}</Link>
    </div>
  );
}

function modeLabel(mode: AuthMode) {
  if (mode === '2fa') return 'Secure checkpoint';
  if (mode === 'select-org') return 'Session scope';
  if (mode === 'invite') return 'Operator invite';
  if (mode === 'signup') return 'Workspace setup';
  if (mode === 'forgot') return 'Account recovery';
  return 'Backoffice access';
}
