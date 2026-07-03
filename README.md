# MonoPulse Backoffice Prototype

UX/product prototype for the MonoPulse operator backoffice. The prototype covers campaign creation, loyalty, rewards, player profiles, segments, approvals, monitoring, integrations, brands/org controls, settings, and global operational actions.

## Quick Start

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

Build check:

```bash
npm run build
```

## Demo

Shareable demo:

- [Live Netlify demo](https://roaring-cocada-6272cb.netlify.app)

Best demo entry:

- [Browser presentation demo](./DEMO_SCRIPT_PRESENTATION.html)

Screenshots used by the demo live in:

- [docs/demo-screenshots](./docs/demo-screenshots)

To refresh screenshots from the local running prototype:

```bash
npm run dev
node scripts/capture-demo-screenshots.mjs
```

## Handoff Docs

Read in this order:

1. [UX/Product handoff](./UX_PRODUCT_HANDOFF.md)
2. [Notion flow inventory table](./docs/NOTION_FLOW_INVENTORY.md)
3. [Browser presentation demo](./DEMO_SCRIPT_PRESENTATION.html)
4. [Backend contract appendix](./BACKEND_CONTRACT_APPENDIX.md)
5. [API contract draft](./docs/API_CONTRACT.md)
6. [Data model draft](./docs/DATA_MODEL.md)
7. [Event contract draft](./docs/EVENT_CONTRACT.md)
8. [Permissions and audit draft](./docs/PERMISSIONS_AND_AUDIT.md)
9. [UX QA checklist](./QA_CHECKLIST.md)

## Key Routes

| Route | Purpose |
| --- | --- |
| `/login` | Sign in |
| `/2fa` | Two-factor checkpoint |
| `/dashboard` | Operational dashboard |
| `/ops` | Campaign calendar, tasks and reports |
| `/` | Campaign portfolio |
| `/campaigns/c-1042` | Campaign detail |
| `/create` | Campaign type picker |
| `/builder/setup` | Campaign builder |
| `/builder/review` | Campaign review |
| `/approvals` | Approval inbox |
| `/rewards` | Reward catalog |
| `/rewards/rw-fs-acr-20` | Reward detail |
| `/players` | Player list |
| `/players/PLR-88213` | Player profile |
| `/segments` | Segment library |
| `/monitoring` | Live ops and incidents |
| `/integrations` | APIs, webhooks, providers |
| `/integrations/setup` | Integration setup wizard |
| `/org` | Brands, users, permissions |
| `/settings` | Account/org settings |

## State Preview Links

Several high-risk screens support demo state previews through the `state` query parameter:

| State | Example |
| --- | --- |
| Empty | `/dashboard?state=empty` |
| Loading | `/players?state=loading` |
| Error | `/integrations?state=error` |
| Not found | `/campaigns/unknown-id` |

Covered state-preview screens: dashboard, campaign portfolio, approvals, rewards, players and integrations.

## Prototype Notes

- Data is static mock data.
- Empty, loading and error states are previewed with `?state=empty`, `?state=loading` and `?state=error` on selected screens.
- Actions are UI-only and do not persist after refresh.
- The prototype is desktop-first.
- Production build passes.
- Typecheck may expose generated-code cleanup items depending on local TypeScript strictness.

## What To Review

- Product/design: start with the live demo, Campaign Ops, and UX handoff.
- Backend/full-stack: review the backend appendix after the demo.
- QA/stakeholders: use the QA checklist before presenting.
