# Git Handoff Checklist

Use this before sending the repository to product, design, Java/backend, or full-stack reviewers.

## Include

- `README.md`
- `UX_PRODUCT_HANDOFF.md`
- `DEMO_SCRIPT_PRESENTATION.html`
- `DEMO_SCRIPT_WITH_SCREENSHOTS.md`
- `STAKEHOLDER_DEMO_SCRIPT.md`
- `BACKEND_CONTRACT_APPENDIX.md`
- `QA_CHECKLIST.md`
- `docs/demo-screenshots/`
- `scripts/capture-demo-screenshots.mjs`
- React source: `App.tsx`, `main.tsx`, `routes.tsx`, `components/`, `screens/`, `context/`, `data/`
- Styling/config: `index.css`, `tailwind.config.js`, `postcss.config.js`, `vite.config.ts`, `tsconfig.json`
- Package files: `package.json`, `package-lock.json`

## Exclude

- `node_modules/`
- `dist/`
- `*.tsbuildinfo`
- local editor files
- OS metadata files

## Demo Flow For Review

1. Open [DEMO_SCRIPT_PRESENTATION.html](./DEMO_SCRIPT_PRESENTATION.html).
2. Run the local prototype with `npm run dev`.
3. Walk through `/login`, `/dashboard`, `/`, `/campaigns/c-1042`, `/create`, `/builder/review`, `/approvals`, `/rewards`, `/rewards/rw-fs-acr-20`, `/players/PLR-88213`, `/segments`, `/monitoring`, `/integrations`, `/org`, and `/settings`.
4. Use [UX_PRODUCT_HANDOFF.md](./UX_PRODUCT_HANDOFF.md) for product scope questions.
5. Use [BACKEND_CONTRACT_APPENDIX.md](./BACKEND_CONTRACT_APPENDIX.md) for Java/backend discussion.
6. Use [QA_CHECKLIST.md](./QA_CHECKLIST.md) before stakeholder review.

## Reviewer Focus

Product owner:

- MVP scope by campaign mechanic
- approval rules
- reward ownership
- role and brand permissions
- launch blockers versus warnings

UX/design:

- campaign builder clarity
- dense table scanning
- modal/action patterns
- risk visibility
- demo narrative

Backend/full-stack:

- API contracts
- reward fulfillment routes
- bonus GUID lookup
- retries and dead-letter handling
- audit model
- role/brand authorization

## Final Checks

- `npm install` works from a clean checkout.
- `npm run dev` starts the prototype.
- `npm run build` passes.
- Demo screenshots render in `DEMO_SCRIPT_PRESENTATION.html`.
- No generated dependency folders are committed.
