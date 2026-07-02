# MonoPulse Visual Demo Script

Use this version when you want to show the actual local prototype screens and talk through the product story. Each screenshot is captured from the local build at `http://127.0.0.1:5173`.

## 1. Access And Role Scope

![Access and role-scoped entry](/Users/ene/Documents/Codex/2026-07-01/lov/figr-export/monopulse-backoffice/docs/demo-screenshots/01-login.png)

The backoffice starts with controlled access. This is not just a login screen. It establishes that every operator enters with a role, organization and brand scope.

What this proves:

- Auth, 2FA and organization selection are part of the product model.
- Role and brand scope should drive what users can see and do later.

Questions:

- Which roles can access the product on day one?
- Is 2FA mandatory for every operator or only privileged roles?
- Can one user belong to multiple operator organizations?

## 2. Operations Dashboard

![Operations dashboard](/Users/ene/Documents/Codex/2026-07-01/lov/figr-export/monopulse-backoffice/docs/demo-screenshots/02-dashboard.png)

This is the operator's morning view: what is live, what is blocked, what needs attention, and where cost or risk is moving.

What this proves:

- The product is operational, not only a setup tool.
- CRM and Casino Managers need a fast scan of campaigns, rewards, incidents and approvals.

Questions:

- Which dashboard metrics are mandatory for launch?
- Should risk and approval blockers be shown before revenue metrics?
- Which dashboard actions should be available directly from here?

## 3. Campaign Portfolio

![Campaign portfolio](/Users/ene/Documents/Codex/2026-07-01/lov/figr-export/monopulse-backoffice/docs/demo-screenshots/03-campaigns.png)

The campaign list is where managers compare mechanics, lifecycle state, audience, budget, reward cost and risk across all active gamified products.

What this proves:

- Multiple campaign mechanics can live in one operating portfolio.
- The UX needs dense scanning, filtering and drill-down, not marketing-style cards.

Questions:

- Which campaign states are final: draft, scheduled, active, paused, completed, blocked?
- Should campaigns be grouped by brand, mechanic, owner or lifecycle?
- Which columns are required for CRM versus Casino Manager?

## 4. Campaign Detail

![Campaign detail](/Users/ene/Documents/Codex/2026-07-01/lov/figr-export/monopulse-backoffice/docs/demo-screenshots/04-campaign-detail.png)

A campaign detail view should answer whether the campaign is healthy, who it targets, what it costs, which rewards it uses and whether anything is blocking launch or continuation.

What this proves:

- Campaign operations need status, risk, budget, audience and reward context in one place.
- Detail pages should expose actions without hiding compliance state.

Questions:

- Which changes require a new approval after a campaign is live?
- Should pausing a campaign require a reason note?
- What is the minimum campaign audit trail?

## 5. Campaign Type Picker

![Campaign type picker](/Users/ene/Documents/Codex/2026-07-01/lov/figr-export/monopulse-backoffice/docs/demo-screenshots/05-create-campaign.png)

The first builder decision is the campaign mechanic. The product owner wants all major mechanics available for prototyping and A/B testing.

What this proves:

- Missions, tournaments, leaderboards, rakeback, prize drops, raffles, jackpots and achievements share a single entry point.
- The UX can keep one builder while still showing mechanic-specific requirements.

Questions:

- Which mechanics are truly launch-critical versus prototype-only?
- Which mechanics require backend support that is not already available?
- Are there jurisdiction limits by campaign type?

## 6. Campaign Review

![Campaign review](/Users/ene/Documents/Codex/2026-07-01/lov/figr-export/monopulse-backoffice/docs/demo-screenshots/06-builder-review.png)

Review is the moment where setup, audience, reward, budget and compliance are checked before submission.

What this proves:

- Campaign creation needs a clear readiness model before launch.
- Missing fields, budget limits, risk gates and approval state should be visible together.

Questions:

- Which review checks are hard blockers?
- Which checks are warnings?
- Who can submit, approve and launch?

## 7. Approval Inbox

![Approval inbox](/Users/ene/Documents/Codex/2026-07-01/lov/figr-export/monopulse-backoffice/docs/demo-screenshots/07-approvals.png)

Approvals are not a side feature. They are the control layer that makes campaigns, rewards and sensitive player actions license-ready.

What this proves:

- Risk and compliance need their own queue.
- Approval decisions need evidence, comments and audit history.

Questions:

- Which workflows require approval: campaigns, rewards, segments, player overrides, API key changes?
- Can approvals be delegated?
- Is approval one-step or multi-step?

## 8. Reward Catalog

![Reward catalog](/Users/ene/Documents/Codex/2026-07-01/lov/figr-export/monopulse-backoffice/docs/demo-screenshots/08-rewards.png)

Rewards are where product, finance, integration and risk all meet. The catalog needs to show fulfillment mode, GUID coverage, provider health, liability and blockers.

What this proves:

- Rewards cannot be designed as a simple list of prizes.
- Operators need to know whether a reward can actually be granted safely.

Questions:

- Which fulfillment modes are launch scope?
- Who owns failed reward recovery?
- Should reward liability block campaign launch automatically?

## 9. Reward Detail

![Reward fulfillment detail](/Users/ene/Documents/Codex/2026-07-01/lov/figr-export/monopulse-backoffice/docs/demo-screenshots/09-reward-detail.png)

Reward detail is the backend-sensitive view: fulfillment route, provider contract, test grant, risk gates, audit and reconciliation all need to be visible.

What this proves:

- MonoPulse needs a clear contract between internal triggers, existing bonus GUIDs and operator wallet/platform APIs.
- Dev teams can validate what must exist behind the UI.

Questions:

- What is the exact API response for bonus GUID lookup?
- What happens when grant succeeds in MonoPulse but fails at the operator platform?
- Do retries need manual approval?

## 10. Player Profile

![Player profile](/Users/ene/Documents/Codex/2026-07-01/lov/figr-export/monopulse-backoffice/docs/demo-screenshots/10-players.png)

CRM needs player context, but player actions are sensitive. The profile should show value, loyalty, campaigns, rewards and risk without making dangerous actions casual.

What this proves:

- Player-level workflows need permission and audit boundaries.
- The same screen serves CRM, VIP and risk review contexts.

Questions:

- Which player fields can CRM see?
- Which actions require Risk/Compliance permission?
- Should reward grants and exclusions always require reason notes?

## 11. Segments

![Segments and audiences](/Users/ene/Documents/Codex/2026-07-01/lov/figr-export/monopulse-backoffice/docs/demo-screenshots/11-segments.png)

Segments power campaigns, loyalty, rewards, exclusions and A/B testing. They should be reusable, understandable and auditable.

What this proves:

- Audience logic needs its own product surface.
- Usage mapping and sync health matter because segments affect live money and eligibility.

Questions:

- Do segments require independent approval?
- Are segments global, brand-specific or campaign-specific?
- What is the refresh cadence for dynamic segments?

## 12. Monitoring

![Monitoring and incidents](/Users/ene/Documents/Codex/2026-07-01/lov/figr-export/monopulse-backoffice/docs/demo-screenshots/12-monitoring.png)

Monitoring is where real-time becomes operational: failed events, provider degradation, campaign health and emergency actions.

What this proves:

- The UI must expose backend health and event problems in operator language.
- Emergency actions need confirmation, scope and audit.

Questions:

- Which incidents should page an operator?
- Can operators replay failed events?
- Which emergency actions are allowed from the UI?

## 13. Integrations

![Integrations and provider health](/Users/ene/Documents/Codex/2026-07-01/lov/figr-export/monopulse-backoffice/docs/demo-screenshots/13-integrations.png)

Integrations show whether MonoPulse is connected, trusted and healthy across APIs, webhooks, providers and certification checks.

What this proves:

- Backend and full-stack teams have a visible operating surface.
- Operators need provider health without reading logs.

Questions:

- Which integrations are visible to non-technical users?
- Who can rotate API keys?
- What should happen to campaigns when a provider is degraded?

## 14. Brands, Org And Permissions

![Org, brands and permissions](/Users/ene/Documents/Codex/2026-07-01/lov/figr-export/monopulse-backoffice/docs/demo-screenshots/14-org.png)

The product owner confirmed org-level visibility with brand-level campaign restriction. This screen turns that into a governance model.

What this proves:

- Brand readiness, users, permissions, restrictions and audit belong together.
- Role and brand scope must be designed before backend implementation hardens.

Questions:

- Is brand access inherited from org roles or assigned independently?
- Can a campaign target multiple brands?
- Which permission changes require approval?

## 15. Settings

![Settings and governance](/Users/ene/Documents/Codex/2026-07-01/lov/figr-export/monopulse-backoffice/docs/demo-screenshots/15-settings.png)

Settings should not become a dumping ground. For this product, settings are about defaults, approval rules, notification preferences and governance.

What this proves:

- Product-level configuration is separate from operational workflows.
- Defaults can reduce friction in campaign and reward setup.

Questions:

- Which defaults should be org-level versus brand-level?
- Which settings are user preferences versus compliance rules?
- Who can change approval thresholds?

## 16. Global Command Palette

![Global command palette](/Users/ene/Documents/Codex/2026-07-01/lov/figr-export/monopulse-backoffice/docs/demo-screenshots/16-command-palette.png)

Operators will move quickly between campaigns, players, rewards, approvals and incidents. The command palette is the speed layer.

What this proves:

- The app supports repeated operational work.
- Navigation should not depend only on the sidebar.

Questions:

- Which objects should be searchable globally?
- Should search include IDs from the operator platform?
- Should restricted results appear, hide or show with permission messaging?

## 17. Action Modal Pattern

![Action modal with permission check](/Users/ene/Documents/Codex/2026-07-01/lov/figr-export/monopulse-backoffice/docs/demo-screenshots/17-action-modal.png)

High-risk actions should follow one consistent modal pattern: permission check, form inputs, consequence preview, backend contract preview and submitted/audit state.

What this proves:

- The same UX pattern can support reward grants, syncs, segment recalculation, invites and emergency actions.
- Permission and audit are visible at the moment of action.

Questions:

- Which actions need confirmation only, and which need approval?
- Which backend payload fields are mandatory?
- What should the user see after an action fails?

## Suggested Closing Line

The prototype now demonstrates the full operating model: campaign creation, reward fulfillment, approvals, players, segments, monitoring, integrations and governance. The next product decisions are about launch scope, permission rules, approval logic and backend contracts.
