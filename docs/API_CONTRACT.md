# API Contract Draft

This draft translates the MonoPulse backoffice prototype into backend-facing API surfaces. It is intentionally implementation-neutral so Java/full-stack teams can map it to Spring Boot, NestJS, or another backend stack.

## Assumptions

- All endpoints are scoped to the authenticated organization.
- Brand-level access is enforced server-side, not only in the UI.
- Every mutation creates an audit log entry.
- IDs shown here are examples; backend can choose UUIDs or stable prefixed IDs.
- MVP backend should start with one vertical slice: campaign creation, validation, approval, scheduling, and audit.

## Common Response Shapes

```json
{
  "data": {},
  "meta": {
    "requestId": "req_123",
    "generatedAt": "2026-07-03T00:00:00Z"
  }
}
```

For list responses:

```json
{
  "data": [],
  "pagination": {
    "cursor": "next_cursor",
    "limit": 50,
    "hasMore": true
  }
}
```

For validation errors:

```json
{
  "error": {
    "code": "CAMPAIGN_BUDGET_EXCEEDED",
    "message": "Daily cap cannot exceed total budget.",
    "fields": {
      "dailyCap": "Must be lower than totalBudget"
    }
  }
}
```

## Campaigns

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/campaigns` | List campaigns with filters |
| `POST` | `/api/campaigns` | Create draft campaign |
| `GET` | `/api/campaigns/{campaignId}` | Read campaign detail |
| `PATCH` | `/api/campaigns/{campaignId}` | Update draft or editable campaign fields |
| `POST` | `/api/campaigns/{campaignId}/validate` | Run launch validation |
| `POST` | `/api/campaigns/{campaignId}/submit-review` | Submit for approval |
| `POST` | `/api/campaigns/{campaignId}/approve` | Approve campaign |
| `POST` | `/api/campaigns/{campaignId}/reject` | Reject with reason |
| `POST` | `/api/campaigns/{campaignId}/schedule` | Schedule approved campaign |
| `POST` | `/api/campaigns/{campaignId}/pause` | Pause active campaign |
| `POST` | `/api/campaigns/{campaignId}/resume` | Resume paused campaign |
| `POST` | `/api/campaigns/{campaignId}/clone` | Duplicate a campaign |

Suggested campaign list filters:

```text
brandId, type, status, ownerId, startsAfter, startsBefore, riskState, approvalState, q
```

Campaign status lifecycle:

```text
draft -> ready_for_review -> approved -> scheduled -> active -> paused -> completed
draft -> ready_for_review -> rejected -> draft
active -> blocked
scheduled -> cancelled
```

## Campaign Configuration

Each campaign has shared fields plus type-specific config.

Shared payload example:

```json
{
  "type": "mission",
  "name": "Weekend Warriors Mission",
  "brandIds": ["ACR", "VGV"],
  "audienceSegmentId": "seg_high_value_active",
  "startsAt": "2026-07-10T08:00:00Z",
  "endsAt": "2026-07-17T08:00:00Z",
  "budget": {
    "currency": "EUR",
    "totalCap": 25000,
    "dailyCap": 5000,
    "maxRewardPerPlayer": 50,
    "maxWinners": 500
  },
  "riskControls": {
    "responsibleGamingExclusions": true,
    "jurisdictionRules": ["MT", "FI"],
    "approvalRequired": true
  },
  "rewardIds": ["rw-fs-acr-20"],
  "mechanicConfig": {}
}
```

Type-specific `mechanicConfig` examples:

- Mission: tasks, completion rules, progress calculation.
- Tournament: scoring metric, leaderboard reset cadence, tie breaker.
- Leaderboard: rank source, prize bands, eligibility window.
- Cashback/rakeback: formula, loss/turnover basis, payout cadence.
- Prize drop: trigger event, probability, prize pool.
- Raffle: ticket earning rule, draw cadence, draw audit.
- Jackpot: contribution rate, seed amount, payout approval.
- Achievement: condition tree, badge visibility, one-time/repeatable rule.

## Approvals

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/approvals` | Review queue |
| `GET` | `/api/approvals/{approvalId}` | Approval detail |
| `POST` | `/api/approvals/{approvalId}/approve` | Approve |
| `POST` | `/api/approvals/{approvalId}/reject` | Reject |
| `POST` | `/api/approvals/{approvalId}/request-changes` | Send back to owner |

Approval object:

```json
{
  "id": "apr_001",
  "objectType": "campaign",
  "objectId": "c-1042",
  "state": "pending",
  "submittedBy": "usr_123",
  "requiredRoles": ["risk_manager", "casino_manager"],
  "changedFields": ["budget.totalCap", "rewardIds"],
  "blockers": ["responsible_gaming_exclusions_missing"],
  "submittedAt": "2026-07-03T10:00:00Z"
}
```

## Players

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/players` | Search/list players |
| `GET` | `/api/players/{playerId}` | Player profile |
| `GET` | `/api/players/{playerId}/timeline` | Player timeline |
| `POST` | `/api/players/{playerId}/rewards` | Manual reward grant |
| `POST` | `/api/players/{playerId}/segments` | Add to static segment |
| `POST` | `/api/players/{playerId}/exclusions` | Exclude from campaigns |
| `POST` | `/api/players/{playerId}/risk-flags` | Flag abuse/risk |

Sensitive actions require permission and audit notes.

## Segments

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/segments` | Segment library |
| `POST` | `/api/segments` | Create segment |
| `GET` | `/api/segments/{segmentId}` | Segment detail |
| `PATCH` | `/api/segments/{segmentId}` | Update segment |
| `POST` | `/api/segments/{segmentId}/preview` | Preview audience count |
| `POST` | `/api/segments/{segmentId}/recalculate` | Recalculate |

## Rewards

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/rewards` | Reward catalog |
| `POST` | `/api/rewards` | Create reward |
| `GET` | `/api/rewards/{rewardId}` | Reward detail |
| `PATCH` | `/api/rewards/{rewardId}` | Update reward |
| `POST` | `/api/rewards/{rewardId}/sync-guid` | Query/verify bonus GUID |
| `POST` | `/api/rewards/{rewardId}/test-fulfillment` | Test reward delivery |
| `POST` | `/api/rewards/grants` | Manual grant |

Reward fulfillment methods:

```text
operator_wallet
bonus_guid
monopulse_trigger
manual_ops
```

## Integrations

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/integrations/api-keys` | API keys |
| `POST` | `/api/integrations/api-keys` | Create API key |
| `POST` | `/api/integrations/api-keys/{keyId}/rotate` | Rotate key |
| `GET` | `/api/integrations/webhooks` | Webhook endpoints |
| `POST` | `/api/integrations/webhooks` | Create webhook |
| `POST` | `/api/integrations/webhooks/{webhookId}/test` | Send test event |
| `GET` | `/api/integrations/events` | Event stream |
| `GET` | `/api/integrations/events/{eventId}` | Event detail |
| `POST` | `/api/integrations/events/{eventId}/retry` | Retry failed event |
| `GET` | `/api/integrations/providers` | Provider health |
| `POST` | `/api/integrations/certification/run` | Run sandbox certification |

## Campaign Ops

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/ops/calendar` | Campaign calendar |
| `GET` | `/api/ops/tasks` | Jira-like ops tasks |
| `PATCH` | `/api/ops/tasks/{taskId}` | Update task status/owner |
| `GET` | `/api/reports/templates` | Report templates |
| `POST` | `/api/reports/generate` | Generate report |
| `GET` | `/api/reports/generated` | Generated report list |

## Brands, Org, and Users

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/org` | Organization summary |
| `GET` | `/api/brands` | Brand list |
| `GET` | `/api/users` | User list |
| `POST` | `/api/users/invite` | Invite user |
| `PATCH` | `/api/users/{userId}` | Update role/brand scope |
| `POST` | `/api/users/{userId}/deactivate` | Deactivate user |
| `GET` | `/api/permissions/matrix` | Permission matrix |
| `PATCH` | `/api/permissions/matrix` | Update permissions |

## Audit

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/audit` | Audit log search |
| `GET` | `/api/audit/{auditId}` | Audit detail |

Audit filters:

```text
actorId, objectType, objectId, action, brandId, from, to, severity
```

## First Backend Slice

Recommended first implementation:

```text
POST /api/campaigns
PATCH /api/campaigns/{id}
POST /api/campaigns/{id}/validate
POST /api/campaigns/{id}/submit-review
GET /api/approvals
POST /api/approvals/{id}/approve
POST /api/campaigns/{id}/schedule
GET /api/audit?objectId={id}
```

This proves campaign state, permissions, validation, approval, scheduling, and audit in one coherent path.
