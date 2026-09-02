# notify-fixture Capabilities

## Capability: notification-delivery

**Goal:** Users see in-app notifications without changing the existing email digest.

### Hard Constraints

- The existing email digest continues to send on its current schedule.
- Notification records are per-user and are not dropped after a process restart.
