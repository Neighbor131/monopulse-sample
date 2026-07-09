# MonoPulse UX QA Checklist

Use this checklist before showing the prototype.

## Global Shell

- Sidebar expanded and collapsed states are usable.
- Active nav item is visible.
- Header controls stay aligned to the right.
- Theme toggle works in light and dark mode.
- Org switcher opens and closes.
- Account menu opens and closes.
- Notification center opens and links to relevant pages.
- Command palette opens with `Cmd/Ctrl + K`.
- Command palette empty state appears for unmatched search.

## Auth

- `/login` flows to `/2fa`.
- `/2fa` flows to `/dashboard`.
- `/signup` flows to `/select-org`.
- `/invite` shows invite context.
- `/forgot-password` returns to sign in.
- Auth screens do not show app sidebar.

## Campaigns

- Campaign list filters work.
- Empty filter state is readable.
- Campaign row opens detail.
- Three-dot menu is not clipped.
- Campaign detail content does not overlap at desktop width.
- Builder steps remain navigable.

## Campaign Ops

- Campaign Ops is reachable from sidebar and `/ops`.
- Calendar tab shows campaign windows, status and risk markers.
- Ops task tab shows owner, team, due date, priority, status and blocker copy.
- Reports tab shows template sections and generated report cards.
- Deep route `/ops` works on the hosted Netlify demo.

## Approvals

- Approval inbox filters work.
- Approval detail displays blockers, warnings and passes.
- Approve is disabled when blockers exist.
- Request changes requires a comment.
- Decision writes a visible audit entry.

## Rewards

- Reward table scrolls horizontally when needed.
- Reward rows open detail.
- Sync GUIDs modal opens.
- New reward modal opens.
- Reward detail actions open modals.
- Permission check is visible inside each modal.
- Submitted modal state is visible.

## Players

- Player table scrolls without clipping.
- Player profile opens.
- Player action drawers require notes where appropriate.
- Risk, rewards, ledger and timeline tabs are readable.

## Segments

- Segment table scrolls without clipping.
- Register source drawer opens.
- Refresh cache modal opens.
- Source mapping fields do not overlap.
- Usage map explains connected objects clearly.

## Monitoring And Integrations

- Monitoring incidents are readable.
- Event stream rows can be inspected.
- Emergency actions communicate impact.
- Integration tables scroll horizontally.
- Provider failure states are visible.
- Payload/debug drawer is readable.

## Org And Settings

- Brand readiness table scrolls horizontally.
- Permission matrix scrolls horizontally.
- Invite user modal opens from Org and Settings.
- Restricted actions show request-style permission copy.
- Role and approval rule tables remain readable.

## Known Follow-Up QA

- Narrow viewport QA is still needed for complex grids.
- True loading skeletons are not implemented everywhere.
- Some empty/error states exist, but not every module has a full-state suite.
