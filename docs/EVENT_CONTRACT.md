# Event Contract Draft

MonoPulse depends on operator and provider events to calculate campaign eligibility, player progress, reward fulfillment, monitoring, and reporting.

## Event Envelope

All inbound events should use a consistent envelope.

```json
{
  "eventId": "evt_01HX...",
  "eventType": "player.deposit.created",
  "idempotencyKey": "operator-event-123",
  "occurredAt": "2026-07-03T10:30:00Z",
  "receivedAt": "2026-07-03T10:30:01Z",
  "source": "operator-platform",
  "environment": "production",
  "organizationId": "org_novabet",
  "brandId": "ACR",
  "playerId": "PLR-4471902",
  "currency": "EUR",
  "payload": {}
}
```

## Required Rules

- `eventId` must be globally unique.
- `idempotencyKey` must be stable across retries.
- `occurredAt` should be the real operator event time, not ingestion time.
- `brandId` and `playerId` are required for player-level events.
- Payloads must be signed or submitted with scoped API credentials.
- Backend must deduplicate by `idempotencyKey`.
- Events that fail schema validation should not mutate campaign/player state.

## Core Event Types

### Player

```text
player.created
player.updated
player.login
player.kyc.updated
player.risk.updated
player.responsible_gaming.updated
player.excluded
```

### Wallet and Value

```text
player.deposit.created
player.withdrawal.created
player.wallet.balance_updated
player.ltv.updated
```

### Game / Betting

```text
game.round.started
game.round.completed
bet.placed
bet.settled
turnover.updated
loss.updated
```

### Campaign

```text
campaign.started
campaign.paused
campaign.completed
campaign.progress.updated
campaign.qualified
campaign.disqualified
leaderboard.rank.changed
raffle.ticket.earned
achievement.unlocked
```

### Rewards

```text
reward.grant.requested
reward.granted
reward.failed
reward.cancelled
bonus.created
bonus.guid.verified
jackpot.win
jackpot.payout.approved
```

### Integration / Ops

```text
webhook.delivery.failed
webhook.delivery.succeeded
provider.sync.completed
provider.sync.failed
integration.certification.completed
```

## Example: Deposit Event

```json
{
  "eventId": "evt_dep_001",
  "eventType": "player.deposit.created",
  "idempotencyKey": "deposit_88991",
  "occurredAt": "2026-07-03T10:30:00Z",
  "source": "operator-platform",
  "environment": "production",
  "organizationId": "org_novabet",
  "brandId": "ACR",
  "playerId": "PLR-4471902",
  "currency": "EUR",
  "payload": {
    "depositId": "dep_88991",
    "amount": 250,
    "paymentMethod": "card",
    "firstDeposit": false
  }
}
```

## Example: Bet Settled Event

```json
{
  "eventId": "evt_bet_001",
  "eventType": "bet.settled",
  "idempotencyKey": "round_777_settlement",
  "occurredAt": "2026-07-03T10:35:00Z",
  "source": "casino-provider",
  "environment": "production",
  "organizationId": "org_novabet",
  "brandId": "VGV",
  "playerId": "PLR-4471902",
  "currency": "EUR",
  "payload": {
    "roundId": "round_777",
    "gameId": "roulette_live",
    "provider": "Evolution",
    "stake": 250,
    "win": 120,
    "netGamingRevenue": 130
  }
}
```

## Example: Reward Grant Result

```json
{
  "eventId": "evt_reward_001",
  "eventType": "reward.granted",
  "idempotencyKey": "reward_grant_123",
  "occurredAt": "2026-07-03T10:40:00Z",
  "source": "bonus-engine",
  "environment": "production",
  "organizationId": "org_novabet",
  "brandId": "ACR",
  "playerId": "PLR-4471902",
  "currency": "EUR",
  "payload": {
    "rewardGrantId": "grant_123",
    "rewardId": "rw-fs-acr-20",
    "campaignId": "c-1042",
    "fulfillmentMethod": "bonus_guid",
    "bonusGuid": "bonus_20fs_acr",
    "status": "granted"
  }
}
```

## Processing States

```text
received
validated
processed
delivered
retrying
failed
quarantined
ignored_duplicate
```

## Failure Handling

| Failure | Expected backend behavior |
| --- | --- |
| Invalid schema | Reject, store failure, no state mutation |
| HMAC mismatch | Reject, alert technical admin |
| Duplicate idempotency key | Ignore duplicate and return existing result |
| Missing player | Quarantine or create placeholder based on integration policy |
| Reward API timeout | Retry with backoff |
| High-value payout | Quarantine for manual approval |
| Jurisdiction/RG blocked | Do not grant reward, audit blocked decision |

## Retry Rules

Recommended retry policy:

```text
attempt 1 immediately
attempt 2 after 30 seconds
attempt 3 after 2 minutes
attempt 4 after 10 minutes
attempt 5 after 30 minutes
then quarantine or dead-letter
```

Backend should expose replay actions only to permitted users and always audit replay.

## Event-to-UI Mapping

| UI area | Events needed |
| --- | --- |
| Dashboard | campaign status, reward failures, risk blockers, event failures |
| Campaign detail | progress, cost, audience, reward grant events |
| Players | deposits, bets, tier changes, rewards, exclusions |
| Segments | player state changes, recalculation jobs |
| Rewards | reward grant result, bonus GUID verification |
| Integrations | all inbound/outbound delivery states |
| Monitoring | provider incidents, retry queues, dead-letter events |
| Campaign Ops | campaign lifecycle, approval changes, task/report jobs |
