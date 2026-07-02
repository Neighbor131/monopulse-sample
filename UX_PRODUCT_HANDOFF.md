# MonoPulse Backoffice UX/Product Handoff

## Purpose

This prototype explores the operator backoffice for MonoPulse gamification: campaign creation, loyalty/status management, reward fulfillment, player inspection, segment building, monitoring, integrations, org/brand controls, approvals, and operational safety.

The design target is a dense, operational backoffice for CRM/Retention Managers and Casino Managers, with visible touchpoints for Risk/Compliance and Technical Admin users.

## Primary Users

- CRM / Retention Manager: creates campaigns, manages audiences, monitors reward outcomes, inspects players.
- Casino Manager: manages campaign economics, game/provider readiness, prize pools, jackpots, leaderboards.
- Risk / Compliance: reviews approvals, responsible-gambling exclusions, jurisdiction rules, fraud flags, audit logs.
- Technical Admin / Backend: monitors event ingestion, webhooks, provider health, API keys, payload failures, retry paths.
- Org Admin / Owner: manages users, roles, brand access, permissions, org settings.

## Demo Path

1. Start at `/login`
2. Continue to `/2fa`
3. Enter `/dashboard`
4. Open Campaigns from `/`
5. Inspect `/campaigns/c-1042`
6. Create a campaign through `/create` and `/builder/setup`
7. Review approval flow at `/approvals` and `/approvals/:id`
8. Inspect rewards at `/rewards` and `/rewards/rw-fs-acr-20`
9. Run action modals: Test grant, Run gates, Sync GUIDs
10. Inspect player profile at `/players/PLR-88213`
11. Open monitoring at `/monitoring`
12. Review integrations at `/integrations`
13. Review org roles and permissions at `/org`
14. Open global search with `Cmd/Ctrl + K`
15. Open notifications and account/org menus from the top bar

## Route Map

| Route | Purpose |
| --- | --- |
| `/login` | Sign in entry |
| `/signup` | Workspace creation |
| `/invite` | Invite acceptance |
| `/forgot-password` | Password recovery |
| `/2fa` | Two-factor checkpoint |
| `/select-org` | Organization and brand-scope selection |
| `/dashboard` | Operational overview and action queue |
| `/` | Campaign list |
| `/campaigns/:id` | Campaign detail and operational state |
| `/create` | Campaign type picker |
| `/builder/:step` | Campaign creation wizard |
| `/loyalty` | Loyalty/status programs |
| `/loyalty/builder/:step` | Loyalty program setup |
| `/rewards` | Reward catalog, fulfillment, liability, gates |
| `/rewards/:id` | Reward fulfillment detail |
| `/players` | Player search and list |
| `/players/:id` | Player profile, risk, rewards, ledger |
| `/segments` | Audience segment library and builder |
| `/monitoring` | Live ops, incidents, event stream, emergency actions |
| `/integrations` | API keys, webhooks, event logs, provider health |
| `/org` | Brands, users, roles, permissions, restrictions |
| `/safety` | Risk/compliance operations |
| `/approvals` | Approval inbox |
| `/approvals/:id` | Approval decision detail |
| `/settings` | Account/org preferences and defaults |

## Key UX Flows

### Campaign Creation

The campaign builder supports setup, audience, rewards, budget, and review. The UX should prove that every campaign type can share a common wizard while still surfacing mechanic-specific configuration through contextual rails and module fields.

Important product question: which campaign mechanics truly require separate builder steps versus conditional fields inside shared steps?

### Approval Review

The approval flow shows compliance checklist outcomes, sensitive changes since review, blocker states, reviewer comments, and audit timeline. Approval is blocked when critical checks fail.

Important product question: which checks are hard blockers by license/jurisdiction, and which are business warnings?

### Reward Fulfillment

Rewards have list, detail, liability, manual grant, provider test, and risk gate surfaces. Reward detail shows fulfillment mode, provider route, backend contract preview, test grant state, gates, liability and audit.

Fulfillment modes represented:

- Operator wallet
- MonoPulse trigger
- Existing bonus GUID
- Manual ops

Important product question: who owns failed fulfillment recovery: MonoPulse, the operator platform, or the operator's bonus/wallet team?

### Segments

Segments include reusable audience definitions, rule preview, exclusions, usage mapping, sync health and audit. This is critical because campaign creation depends on safe, reusable audiences.

Important product question: should segments be approved independently before campaigns can use them?

### Player Profile

Player profile supports CRM and risk inspection: campaigns, loyalty, rewards, risk posture, ledger, timeline, VIP status and responsible-gambling state.

Important product question: which player-level actions are allowed for CRM versus Risk/Compliance?

### Monitoring And Integrations

Monitoring combines operational incidents, event stream, reward grant issues, campaign health and provider state. Integrations covers API keys, webhooks, event logs, certification and provider/game health.

Important backend question: what is the exact retry, dead-letter and replay model for failed events and reward grants?

### Org And Permissions

Org includes brand readiness, user roles, permission matrix, restrictions and audit. The prototype supports org-level visibility with brand-restricted campaign configuration.

Important product question: is brand access additive, exclusive, inherited from org, or overridden per module?

## Global System Layer

The top bar includes:

- Org/brand switcher
- Global search / command palette
- Light/dark mode
- Notification center
- Account menu

This layer is meant to show that operators need fast navigation between campaigns, players, rewards, approvals, integrations and risk events.

## Action Modals

Reusable action modal patterns now exist for:

- New reward
- Sync GUIDs
- Test grant
- Run reward gates
- Invite user
- Recalculate segments
- Submit segment approval
- Emergency action

Each modal contains form fields, next-step consequences, backend contract preview and submitted/audit state.

## Backend Touchpoints

Backend and full-stack teams will likely care most about:

- Object lifecycle states: campaign, reward, approval, segment, player action.
- Permission model: role, brand scope, action scope.
- Audit events: who did what, when, before/after values, reason notes.
- Event ingestion: validation, delivery status, retries, quarantine, dead letter.
- Reward fulfillment: provider route, bonus GUID mapping, wallet payout, trigger response.
- Risk gates: RG exclusions, KYC, jurisdiction, fraud, budget caps, liability caps.
- Integration health: API keys, webhooks, providers, certification checks.

## Known Prototype Limits

- Data is static mock data.
- Action submissions are UI-only and do not persist after refresh.
- Permission roles are represented, but disabled/hidden states are not fully applied everywhere.
- Empty, loading and error states are not consistently implemented yet.
- Typecheck has pre-existing generated-code issues; production build passes.
- The app is desktop-first and needs a narrow viewport QA pass.

## Remaining Product Questions

1. What is the minimum launch scope for each campaign type?
2. Which campaign types require approval before launch?
3. Which reward failures should pause a campaign automatically?
4. Who owns reward retry and reconciliation?
5. Which player data can CRM users see versus Risk users?
6. Which actions require mandatory audit notes?
7. Which risk controls are jurisdiction-specific?
8. Can campaigns run cross-brand, or only be visible org-wide while executing brand-scoped?
9. Are segments approved globally, per brand, or per campaign use?
10. What are the exact API contracts for bonus GUID lookup, reward creation and wallet payout?

## Suggested Next UX Work

1. Add role-based disabled states and permission tooltips.
2. Add empty/error/loading states for each major section.
3. Add a backend contract appendix with payload examples.
4. Add a visual demo checklist for stakeholder walkthroughs.
5. QA narrow viewport behavior for tables, rails and modals.

## Companion Docs

- [Browser presentation demo](./DEMO_SCRIPT_PRESENTATION.html)
- [Backend contract appendix](./BACKEND_CONTRACT_APPENDIX.md)
- [UX QA checklist](./QA_CHECKLIST.md)
