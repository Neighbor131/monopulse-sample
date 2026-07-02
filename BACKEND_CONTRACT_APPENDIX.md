# MonoPulse Backend Contract Appendix

This is a UX-side draft of the backend contracts implied by the prototype. It is not an implementation spec yet. Use it to help backend/full-stack reviewers identify missing fields, ownership boundaries, retry rules and security requirements.

## Cross-Cutting Requirements

Every mutating action should include:

- `actorUserId`
- `actorRole`
- `orgId`
- `brandIds`
- `requestId`
- `auditReason`
- `createdAt`

Every response should include:

- stable object ID
- status
- validation warnings
- blocker list
- audit event reference
- retry/recovery hint when relevant

## Campaign Creation

Endpoint:

```http
POST /campaigns
```

Example payload:

```json
{
  "orgId": "org-novabet",
  "brandIds": ["ACR", "SPC"],
  "type": "mission",
  "subtype": "daily_quest",
  "name": "Weekend Warriors Mission",
  "playerTitle": "Complete 3 quests, earn boosts",
  "audience": {
    "segmentIds": ["seg-high-value-active"],
    "excludeRiskFlagged": true,
    "applyResponsibleGamblingExclusions": true
  },
  "rewardIds": ["rw-fs-acr-20"],
  "budget": {
    "currency": "EUR",
    "totalCap": 25000,
    "dailyCap": 5000,
    "maxRewardPerPlayer": 50
  },
  "auditReason": "Campaign draft created by CRM"
}
```

Backend questions:

- Which campaign types require unique schema branches?
- Is audience copied into the campaign at launch or referenced dynamically?
- Can campaign launch happen if reward fulfillment is warning but not failing?

## Campaign Approval Decision

Endpoint:

```http
POST /approvals/{approvalId}/decision
```

Example payload:

```json
{
  "decision": "changes_requested",
  "comment": "Budget cap is acceptable, but RG exclusions must be applied before launch.",
  "checkResults": [
    { "id": "rg", "severity": "blocker", "status": "failed" },
    { "id": "budget", "severity": "warning", "status": "passed_with_warning" }
  ],
  "auditReason": "Reviewer decision from approval queue"
}
```

Backend questions:

- Can an approval be partially approved?
- Does a sensitive edit reset approval automatically?
- Which fields are sensitive enough to invalidate prior approval?

## Segment Recalculation

Endpoint:

```http
POST /segments/recalculate
```

Example payload:

```json
{
  "segmentIds": ["seg-high-value-active", "seg-churn-risk-14d"],
  "preview": true,
  "notifyOwners": "blockers_only",
  "auditReason": "Manual recalculation before campaign launch"
}
```

Example response:

```json
{
  "runId": "seg-run-9441",
  "status": "completed",
  "results": [
    {
      "segmentId": "seg-high-value-active",
      "previousCount": 5218,
      "newCount": 5564,
      "excludedPlayers": 312,
      "health": "healthy"
    }
  ],
  "auditEventId": "aud-seg-7120"
}
```

Backend questions:

- Are segment counts eventually consistent or blocking?
- What is the max acceptable recalculation time?
- Are player IDs returned to the UI, or only aggregate counts?

## Reward Creation

Endpoint:

```http
POST /rewards
```

Example payload:

```json
{
  "brandId": "ACR",
  "name": "25 free spins · Book of Ra",
  "kind": "free_spins",
  "fulfillmentMode": "bonus_guid",
  "provider": "Bonus Engine v2",
  "bonusGuid": "BONUS-FS25-ACR-2026",
  "costPerGrant": 2.4,
  "currency": "EUR",
  "dailyCap": 25000,
  "riskGatePolicy": "launch_blockers_and_warnings",
  "auditReason": "New reward draft"
}
```

Backend questions:

- Is a reward global, brand-specific, or reusable across brands?
- Can one reward have multiple provider mappings?
- Where does cost liability live: MonoPulse or operator wallet?

## Bonus GUID Sync

Endpoint:

```http
POST /integrations/bonus-guid/sync
```

Example payload:

```json
{
  "providerId": "bonus-engine-v2",
  "brandIds": ["ACR", "BNV", "VGV"],
  "dryRun": true,
  "applyMatches": false
}
```

Example response:

```json
{
  "syncRunId": "guid-sync-1842",
  "status": "completed_with_warnings",
  "matched": 42,
  "missingCurrency": 3,
  "expired": 2,
  "unmatchedGuids": ["BONUS-OLD-GLR-001"]
}
```

Backend questions:

- Does MonoPulse query GUIDs, or does the operator push them?
- How are expired or deactivated GUIDs handled?
- Who can apply matches in production?

## Reward Test Grant

Endpoint:

```http
POST /rewards/test-grant
```

Example payload:

```json
{
  "rewardId": "rw-fs-acr-20",
  "playerId": "PLR-TEST-0001",
  "simulate": true,
  "auditReason": "Pre-launch fulfillment test"
}
```

Example response:

```json
{
  "testRunId": "grant-test-3011",
  "status": "passed",
  "providerStatus": "200 OK",
  "latencyMs": 240,
  "ledgerWritten": false,
  "warnings": []
}
```

Backend questions:

- Does simulation call the real provider in sandbox mode?
- Can test grants ever write to a real ledger?
- Which failures are retryable?

## Reward Gate Run

Endpoint:

```http
POST /risk/reward-gates/run
```

Example payload:

```json
{
  "rewardId": "rw-cash-glr-jackpot",
  "scope": "current_reward",
  "gatePolicy": "launch_blockers_and_warnings",
  "auditNote": "Manual gate rerun before launch review"
}
```

Example response:

```json
{
  "gateRunId": "gate-run-8821",
  "status": "blocked",
  "gates": [
    {
      "id": "gate-liability",
      "status": "blocked",
      "message": "Jackpot payout would exceed remaining daily cap."
    },
    {
      "id": "gate-provider",
      "status": "blocked",
      "message": "Operator Wallet API returns 401."
    }
  ]
}
```

Backend questions:

- Which gates are synchronous at launch?
- Which gates are cached?
- Can Risk override a blocker, or must backend state change first?

## Event Ingestion

Endpoint:

```http
POST /events
```

Example payload:

```json
{
  "eventId": "evt-9f12a8",
  "eventType": "bet.settled",
  "playerId": "PLR-4471902",
  "brandId": "VGV",
  "occurredAt": "2026-07-02T12:42:08Z",
  "payload": {
    "amount": 250,
    "currency": "EUR",
    "game": "roulette_live"
  },
  "signature": "hmac-sha256..."
}
```

Backend questions:

- What is the canonical event schema?
- How are invalid signatures handled?
- What is the retry and dead-letter policy?
- Can events be replayed by UI action?

## Invite User

Endpoint:

```http
POST /org/invites
```

Example payload:

```json
{
  "email": "backend.lead@operator.com",
  "role": "technical_admin",
  "brandIds": ["ACR", "SPC", "BNV", "LKF", "VGV", "GLR"],
  "expiresAt": "2026-07-04T12:00:00Z",
  "require2fa": true,
  "auditReason": "Invite backend lead for integration review"
}
```

Backend questions:

- Are invites created by Org Admin only, or can managers request them?
- Does role imply brand access, or are they separate ACL dimensions?
- How are invite acceptances audited?

## Audit Event

Endpoint:

```http
POST /audit/events
```

Example payload:

```json
{
  "actorUserId": "usr-mara",
  "actorRole": "crm_manager",
  "targetType": "reward",
  "targetId": "rw-fs-acr-20",
  "action": "test_grant_run",
  "before": null,
  "after": {
    "status": "passed",
    "providerStatus": "200 OK"
  },
  "reason": "Pre-launch fulfillment test",
  "requestId": "grant-test-3011"
}
```

Backend questions:

- Which audit events are immutable?
- What retention period is required by license?
- Can audit logs expose PII, or should they only reference IDs?
