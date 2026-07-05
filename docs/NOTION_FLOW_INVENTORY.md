# MonoPulse Flow Inventory

Use this as a Notion-ready table for product, design and engineering review. Paste the table into Notion to convert it into a database/table, then add owners, due dates or priority fields if needed.

Demo base URL: https://roaring-cocada-6272cb.netlify.app

| Flow / Screen | Demo Link | Status | Notes | Comments / Open Questions |
| --- | --- | --- | --- | --- |
| Access: Login | https://roaring-cocada-6272cb.netlify.app/login | Demo ready | Sign-in entry for backoffice users. | Confirm auth provider, password rules and session timeout. |
| Access: Signup | https://roaring-cocada-6272cb.netlify.app/signup | Demo ready | New account creation concept. | Confirm whether operators self-sign-up or only join by invite. |
| Access: Invite | https://roaring-cocada-6272cb.netlify.app/invite | Demo ready | Invitation acceptance flow for org users. | Confirm invite expiry, accepted states and role assignment. |
| Access: Forgot Password | https://roaring-cocada-6272cb.netlify.app/forgot-password | Demo ready | Recovery entry for locked-out users. | Confirm email provider, reset expiry and audit requirement. |
| Access: 2FA | https://roaring-cocada-6272cb.netlify.app/2fa | Demo ready | Two-factor checkpoint for sensitive backoffice access. | Confirm mandatory roles and fallback/recovery flow. |
| Org Selection | https://roaring-cocada-6272cb.netlify.app/select-org | Demo ready | Select org/brand context before entering the product. | Confirm org hierarchy and cross-brand access rules. |
| Dashboard | https://roaring-cocada-6272cb.netlify.app/dashboard | Demo ready | Operational landing with KPIs, alerts and action queue. | Define final KPIs, data freshness and default filters. |
| Campaign Ops | https://roaring-cocada-6272cb.netlify.app/ops | Demo ready | Calendar, tasks and reporting view for campaign operations. | Confirm task ownership, report formats and recurring workflow. |
| Analytics & Performance | https://roaring-cocada-6272cb.netlify.app/analytics | Demo ready | ROI, retention, LTV, reward cost and experiment readout. | Confirm metric formulas, warehouse source and reporting cadence. |
| Campaign Portfolio | https://roaring-cocada-6272cb.netlify.app/ | Demo ready | List of campaigns with status, health and drill-down. | Confirm final lifecycle states and required CRM vs Casino columns. |
| Campaign Detail | https://roaring-cocada-6272cb.netlify.app/campaigns/c-1042 | Demo ready | Campaign health, budget, audience, rewards and launch blockers. | Confirm which edits require re-approval after launch. |
| Mechanic Configuration | https://roaring-cocada-6272cb.netlify.app/mechanics | Demo ready | Mechanic-specific config fields for races, raffles, jackpots, prize drops and other campaign types. | Backend/product should confirm schema fields and subtype-specific validation. |
| Campaign Type Picker | https://roaring-cocada-6272cb.netlify.app/create | Demo ready | Entry point for missions, tournaments, leaderboards, jackpots, raffles and related mechanics. | Confirm mechanic-specific MVP depth for each campaign type. |
| Builder: Setup | https://roaring-cocada-6272cb.netlify.app/builder/setup | Demo ready | Basic campaign metadata, mechanic, schedule and brand scope. | Confirm required fields by campaign type. |
| Builder: Audience Scope | https://roaring-cocada-6272cb.netlify.app/builder/audience | Demo ready | Audience eligibility, platform vs MonoPulse segments, boolean matching and hard gates. | Confirm segment source ownership, sync frequency and ALL/ANY/NONE behavior. |
| Builder: Mission Logic | https://roaring-cocada-6272cb.netlify.app/builder/logic | Demo ready | WHEN / IF / THEN rule model, multi-event mode, condition groups and mechanic-specific config. | Confirm rule schema, event taxonomy, sequence behavior and hard gate evaluation. |
| Builder: Outcome & Rewards | https://roaring-cocada-6272cb.netlify.app/builder/rewards | Demo ready | Completion outcome, reward selection, fulfillment mode and GUID/trigger handling. | Confirm operator wallet vs MonoPulse trigger ownership. |
| Builder: Budget | https://roaring-cocada-6272cb.netlify.app/builder/budget | Demo ready | Budget caps, player limits and compliance checks before launch. | Confirm cap hierarchy, approval thresholds and jurisdiction rules. |
| Builder: Review | https://roaring-cocada-6272cb.netlify.app/builder/review | Demo ready | Final review before submitting or launching a campaign. | Confirm submit, approve, reject, revise and launch states. |
| Approvals Inbox | https://roaring-cocada-6272cb.netlify.app/approvals | Demo ready | Queue for campaign, reward and risk/compliance approvals. | Confirm approver roles, SLA and escalation states. |
| Approval Detail | https://roaring-cocada-6272cb.netlify.app/approvals/rv-3012 | Demo ready | Review packet with decision actions and audit context. | Confirm required decision comments and legal audit fields. |
| Rewards Catalog | https://roaring-cocada-6272cb.netlify.app/rewards | Demo ready | Reward library, fulfillment mapping, liability and risk gates. | Confirm real reward object schema and visible liability logic. |
| Reward Detail | https://roaring-cocada-6272cb.netlify.app/rewards/rw-fs-acr-20 | Demo ready | Reward status, brand mapping, GUID coverage and manual actions. | Confirm exact bonus API contract and failure recovery states. |
| Players List | https://roaring-cocada-6272cb.netlify.app/players | Demo ready | Player search, scanning and status/risk overview. | Confirm visible player data by role and jurisdiction. |
| Player Profile | https://roaring-cocada-6272cb.netlify.app/players/PLR-88213 | Demo ready | Player detail, risk, loyalty, reward and action history. | Confirm which actions are allowed: grant, exclude, flag, override. |
| Segments | https://roaring-cocada-6272cb.netlify.app/segments | Demo ready | Reusable audiences, rules, usage map and sync health. | Confirm recalculation cadence and rule syntax. |
| Monitoring | https://roaring-cocada-6272cb.netlify.app/monitoring | Demo ready | Live events, incidents, provider health and emergency actions. | Confirm real-time definition, incident severity and auto-pause rules. |
| Notifications | https://roaring-cocada-6272cb.netlify.app/notifications | Demo ready | Full operational notification inbox beyond the compact top-bar drawer. | Confirm notification types, read/resolved states and owner routing. |
| Audit Log | https://roaring-cocada-6272cb.netlify.app/audit | Demo ready | Unified audit explorer for approvals, reward actions and event evidence. | Confirm retention, export rules and compliance-required fields. |
| Integrations | https://roaring-cocada-6272cb.netlify.app/integrations | Demo ready | APIs, webhooks, event logs, providers and integration health. | Confirm what is visible to CRM/Casino users vs technical admins. |
| Integration Setup | https://roaring-cocada-6272cb.netlify.app/integrations/setup | Demo ready | Wizard for credentials, webhooks, event mapping, rewards and certification. | Confirm certification blockers and sandbox-to-production handoff. |
| Brands & Org | https://roaring-cocada-6272cb.netlify.app/org | Demo ready | Brand scope, users, permissions, restrictions and audit trail. | Confirm role matrix and cross-brand campaign restrictions. |
| Risk & Compliance | https://roaring-cocada-6272cb.netlify.app/safety | Demo ready | Safety gates, blockers, compliance review and risk controls. | Confirm license-specific rules and responsible-gaming enforcement. |
| Settings | https://roaring-cocada-6272cb.netlify.app/settings | Demo ready | Account, preferences, notification and org-level defaults. | Confirm which settings are personal, brand-level or org-level. |
| Global Command Palette | https://roaring-cocada-6272cb.netlify.app/dashboard | Pattern ready | Fast navigation/search pattern via Cmd/Ctrl+K. | Confirm searchable entities and permissions filtering. |
| Action Modal Pattern | https://roaring-cocada-6272cb.netlify.app/rewards/rw-fs-acr-20 | Pattern ready | Shared modal pattern for high-impact actions and audit payloads. | Confirm required fields, irreversible states and failure messages. |
| Empty State Preview | https://roaring-cocada-6272cb.netlify.app/dashboard?state=empty | Demo ready | Shows the calm/no-work state for dashboard and can be reused on campaigns, approvals, rewards, players and integrations. | Confirm preferred first-run copy and primary action per screen. |
| Loading State Preview | https://roaring-cocada-6272cb.netlify.app/players?state=loading | Demo ready | Shows skeleton/loading behavior while list data is being fetched. | Confirm expected loading duration and whether partial cached data should remain visible. |
| Error State Preview | https://roaring-cocada-6272cb.netlify.app/integrations?state=error | Demo ready | Shows blocked data-source behavior for integration health and other high-risk pages. | Confirm retry behavior, escalation copy and which actions must be disabled. |
| Not Found State Preview | https://roaring-cocada-6272cb.netlify.app/campaigns/unknown-id | Demo ready | Shows explicit stale-link handling instead of silently loading a fallback record. | Confirm archive/deleted/permitted-away copy per entity type. |
| Accessibility Baseline | https://roaring-cocada-6272cb.netlify.app/dashboard | Demo ready | Keyboard focus ring and skip link added for baseline accessibility review. | Run deeper screen-reader/table navigation review before production. |
| API Contract Draft | https://github.com/Neighbor131/monopulse-sample/blob/main/docs/API_CONTRACT.md | Draft ready | Initial REST-style endpoints for backend planning. | Backend team should validate resource naming, permissions and response shapes. |
| Data Model Draft | https://github.com/Neighbor131/monopulse-sample/blob/main/docs/DATA_MODEL.md | Draft ready | Core entities and relationships for implementation discussion. | Java/backend team should map this to persistence and service boundaries. |
| Event Contract Draft | https://github.com/Neighbor131/monopulse-sample/blob/main/docs/EVENT_CONTRACT.md | Draft ready | Event envelope, event families and retry/dead-letter expectations. | Confirm provider payloads, idempotency keys and replay policy. |
| Permissions & Audit Draft | https://github.com/Neighbor131/monopulse-sample/blob/main/docs/PERMISSIONS_AND_AUDIT.md | Draft ready | Role/action/audit expectations for licensed operator use. | Compliance and backend should validate final role matrix. |
