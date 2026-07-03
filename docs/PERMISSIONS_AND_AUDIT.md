# Permissions and Audit Draft

MonoPulse is an operational backoffice for campaign, reward, player, compliance, and integration control. Permissions and audit are core product requirements, not a later enhancement.

## Roles

| Role | Primary use |
| --- | --- |
| CRM / Retention Manager | Build campaigns, segments, and retention offers |
| Casino Manager | Configure casino mechanics, rewards, tournaments, jackpots |
| Risk Manager | Review risky players, fraud signals, reward abuse |
| Compliance Manager | Review responsible-gaming, jurisdiction and license controls |
| Technical Admin | Manage integrations, webhooks, API keys, event failures |
| Operator Owner | Org-level settings, users, roles, brand scope |
| Viewer | Read-only operational visibility |

## Permission Matrix

| Capability | CRM | Casino | Risk | Compliance | Tech Admin | Owner | Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- |
| View dashboard | yes | yes | yes | yes | yes | yes | yes |
| Create campaign draft | yes | yes | no | no | no | yes | no |
| Edit campaign draft | yes | yes | no | no | no | yes | no |
| Submit campaign for review | yes | yes | no | no | no | yes | no |
| Approve campaign | no | yes | conditional | conditional | no | yes | no |
| Emergency pause campaign | no | yes | yes | yes | yes | yes | no |
| Create/edit segment | yes | conditional | yes | conditional | no | yes | no |
| View player profile | yes | yes | yes | yes | no | yes | read-only |
| Grant manual reward | conditional | yes | no | no | no | yes | no |
| Exclude player | no | no | yes | yes | no | yes | no |
| Flag abuse | yes | yes | yes | yes | no | yes | no |
| Manage rewards | conditional | yes | no | no | no | yes | no |
| Manage API keys | no | no | no | no | yes | yes | no |
| Manage webhooks | no | no | no | no | yes | yes | no |
| Retry failed events | no | no | no | no | yes | yes | no |
| Invite users | no | no | no | no | no | yes | no |
| Edit permission matrix | no | no | no | no | no | yes | no |
| View audit log | conditional | conditional | yes | yes | yes | yes | no |

`conditional` means allowed only with correct brand scope, object ownership, or approval state.

## Brand Scope Rules

- Users belong to an organization.
- Users can have access to all brands or a restricted brand list.
- Campaign setup can restrict `brandIds` even when the user sees org-level health.
- Backend must enforce brand scope for every read and write.
- UI brand filtering is not a security boundary.

## Approval Rules

Actions that should require approval:

- Launching campaign.
- Increasing budget after approval.
- Changing reward value after approval.
- Changing audience eligibility after approval.
- Adding high-liability rewards.
- Manual reward grants over threshold.
- Jackpot payout.
- Disabling responsible-gaming exclusions.
- Overriding player tier.
- Replaying quarantined high-value events.

Actions that should invalidate existing approval:

```text
budget.totalCap changed
budget.dailyCap changed
brandIds changed
segmentId changed
rewardIds changed
mechanicConfig changed
riskControls changed
startsAt or endsAt materially changed
```

## Audit Log Requirements

Audit log should be append-only and capture:

```text
actor
role
brand scope
action
object type
object id
before value
after value
reason/note
timestamp
ip address
user agent
request id
```

## Actions That Must Be Audited

Campaign:

```text
campaign.created
campaign.updated
campaign.validated
campaign.submitted_for_review
campaign.approved
campaign.rejected
campaign.scheduled
campaign.paused
campaign.resumed
campaign.cancelled
```

Reward:

```text
reward.created
reward.updated
reward.guid_synced
reward.grant_requested
reward.granted
reward.failed
reward.manual_grant_created
```

Player:

```text
player.viewed_sensitive_profile
player.excluded
player.risk_flagged
player.tier_overridden
player.added_to_segment
player.reward_granted
```

Integration:

```text
api_key.created
api_key.rotated
webhook.created
webhook.updated
webhook.test_sent
event.retried
event.quarantined
event.replayed
provider.sync_run
```

Organization:

```text
user.invited
user.role_changed
user.brand_scope_changed
user.deactivated
permission_matrix.updated
brand.restricted
settings.updated
```

## Risk and Compliance Gates

The backend should block campaign launch or reward fulfillment when:

- Responsible-gaming exclusions are not applied.
- Player is self-excluded, cooled off, or deposit-limited.
- Jurisdiction rule is missing or incompatible.
- Budget cap would be exceeded.
- Reward liability cap would be exceeded.
- KYC is incomplete for required reward type.
- Fraud/risk flag blocks eligibility.
- Integration provider required for fulfillment is failing.
- Approval is missing, expired, or invalidated by edits.

## Audit UI Requirements

The UI should support:

- Search audit by actor, action, object, brand, and date.
- Open audit detail.
- Compare before/after values.
- Link audit event back to campaign, reward, player, or integration.
- Show approval history and decision reasons.

## Backend Notes

- Never trust client-submitted role or brand scope.
- Store permission decisions in audit when an action is denied.
- Keep PII minimized in audit logs.
- Use immutable storage or append-only table behavior for audit.
- Use request IDs to connect API logs, audit logs, and event processing logs.
