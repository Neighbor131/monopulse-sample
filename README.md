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

- [Live GitHub Pages demo](https://neighbor131.github.io/monopulse-sample/)

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
2. [Browser presentation demo](./DEMO_SCRIPT_PRESENTATION.html)
3. [Backend contract appendix](./BACKEND_CONTRACT_APPENDIX.md)
4. [UX QA checklist](./QA_CHECKLIST.md)

## Key Routes

| Route | Purpose |
| --- | --- |
| `/login` | Sign in |
| `/2fa` | Two-factor checkpoint |
| `/dashboard` | Operational dashboard |
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
| `/org` | Brands, users, permissions |
| `/settings` | Account/org settings |

## Prototype Notes

- Data is static mock data.
- Actions are UI-only and do not persist after refresh.
- The prototype is desktop-first.
- Production build passes.
- Typecheck may expose generated-code cleanup items depending on local TypeScript strictness.

## What To Review

- Product/design: start with the visual demo and UX handoff.
- Backend/full-stack: review the backend appendix after the demo.
- QA/stakeholders: use the QA checklist before presenting.
