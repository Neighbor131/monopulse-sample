# MonoPulse Stakeholder Demo Script

Use this as the walkthrough path for product owner, design review, backend/full-stack review, or investor-style demo. The goal is not to show every screen. The goal is to prove the product logic: create gamified campaigns, control risk, fulfill rewards, monitor operations, and govern users/brands.

For a screenshot-backed walkthrough, use [MonoPulse Visual Demo Script](./DEMO_SCRIPT_WITH_SCREENSHOTS.md). If your markdown preview does not render local screenshots, open [the browser presentation version](./DEMO_SCRIPT_PRESENTATION.html).

## 1. Access And Scope

Route: `/login`

Say:

"The backoffice starts with controlled access. Users are not generic admins. Their role and brand scope determine which campaigns, rewards, approvals and integration actions they can touch."

Show:

- Login
- 2FA
- Organization selection
- Light/dark toggle after entering the app

What this proves:

- Auth is part of the product, not just a technical wrapper.
- Session scope matters because operators manage multiple brands and jurisdictions.

## 2. Operations Dashboard

Route: `/dashboard`

Say:

"The dashboard is the operator's morning view: what is live, what is blocked, what needs approval, and where money or risk is moving."

Show:

- Health cards
- Action queue
- Timeline
- Quick links
- Notification center
- Command palette with `Cmd/Ctrl + K`

What this proves:

- The backoffice is operational, not only CRUD.
- Users can jump quickly between campaigns, players, rewards, approvals and incidents.

## 3. Campaign Portfolio

Route: `/`

Say:

"Campaign managers need to scan mechanics, lifecycle state, audience, budget, reward cost and risk at once."

Show:

- Campaign list
- Filters/search
- Campaign detail route `/campaigns/c-1042`

What this proves:

- Multiple gamified product types can coexist in one portfolio.
- The list supports scanning and triage.

## 4. Campaign Creation

Routes: `/create`, `/builder/setup`

Say:

"The builder uses shared steps for setup, audience, rewards, budget and review, while still surfacing mechanic-specific requirements."

Show:

- Campaign type picker
- Type-specific requirement rail
- Setup, audience, rewards, budget
- Review and approval readiness

What this proves:

- MonoPulse can support missions, races, leaderboards, rakeback, prize drops, raffles, jackpots and achievements without inventing a separate product for each.
- The open question is which mechanic-specific rules are fields versus separate builder steps.

## 5. Approval And Compliance

Routes: `/approvals`, `/approvals/:id`

Say:

"Approval is where product ambition meets licensing reality. The UI must make blockers, warnings, sensitive changes and audit notes impossible to miss."

Show:

- Approval inbox
- Approval detail
- Compliance checklist
- Blocked approve state
- Request changes / reject / approve decision model

What this proves:

- Risk controls are part of launch, not an afterthought.
- Approval decisions create audit evidence.

## 6. Reward Fulfillment

Routes: `/rewards`, `/rewards/rw-fs-acr-20`

Say:

"Rewards are the most backend-sensitive area. The UI needs to show fulfillment route, provider health, liability, risk gates and test grant status."

Show:

- Reward catalog
- Sync GUIDs modal
- New reward modal
- Reward detail
- Test grant modal
- Run gates modal
- Liability and audit panels

What this proves:

- The operator can choose fulfillment mode.
- Backend teams can see the expected contract and retry/gate logic.

## 7. Player Inspection

Routes: `/players`, `/players/PLR-88213`

Say:

"CRM teams need player context, but risk-sensitive data and actions should be governed by role."

Show:

- Player list
- Player profile
- Loyalty snapshot
- Risk/RG/KYC state
- Rewards and ledger

What this proves:

- Player-level action requires permission boundaries.
- The product supports CRM work without ignoring compliance.

## 8. Segments

Route: `/segments`

Say:

"Segments power campaigns and loyalty. They need reusable rules, exclusions, usage mapping and sync health."

Show:

- Segment overview
- Rule builder
- Recalculate modal
- Usage map
- Exclusions

What this proves:

- Audience logic can be reusable and auditable.
- Product owner must decide whether segments need independent approval.

## 9. Monitoring And Integrations

Routes: `/monitoring`, `/integrations`

Say:

"Real-time in the UI means operators can see incidents, failed events, provider degradation and reward replay risk."

Show:

- Monitoring incidents
- Event stream
- Emergency actions
- API keys
- Webhooks
- Provider health
- Certification checks

What this proves:

- The system needs operational controls beyond campaign setup.
- Java/backend teams have clear areas to validate: event delivery, retries, dead-letter queues, provider contracts and auth.

## 10. Org, Roles And Permissions

Routes: `/org`, `/settings`

Say:

"Org visibility is broad, but execution is brand-scoped and role-scoped. Users should understand why actions are available or blocked."

Show:

- Brand readiness
- Users and roles
- Permission matrix
- Invite user modal
- Settings roles and approval rules

What this proves:

- Brand and role governance is a core product requirement.
- Permission model must be designed with backend from the start.

## Suggested Close

End with:

"The prototype now covers the core operating model. The next decisions are not visual polish only: we need product confirmation on launch scope, approval rules, reward ownership, retry logic, role permissions and exact backend contracts."

## Questions To Ask In The Demo

1. Which flow feels most business-critical for MVP: campaign creation, reward fulfillment, approvals, or monitoring?
2. Which actions must be impossible without Risk/Compliance approval?
3. Which user role is the actual daily owner of failed reward fulfillment?
4. Which data should CRM users never see?
5. Which backend events must be visible in real time versus just logged?
6. What is the minimum contract needed from the operator platform for reward creation, wallet payout and bonus GUID lookup?
