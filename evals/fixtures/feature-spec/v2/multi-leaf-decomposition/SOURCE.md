# Settled source

Title: In-app notification center

Problem: Users only learn about account events in a daily email digest, so time-sensitive notices are missed until the next digest.
User-visible outcome: Users can open an in-app notification center, see unread notices, and mark them read, while the email digest continues unchanged.
Chosen approach: Persist per-user notification records, fan account events into that store, and render a notification center from the store.
Why this approach: One store keeps unread counts consistent across delivery and the UI, and it leaves the digest pipeline untouched.
Important rejected alternatives: Embedding notices only in the next digest; pushing browser alerts without a persisted inbox.
Scope:
- A notification store that persists per-user notification records and unread state across process restarts.
- A delivery pipeline that fans account events into that store.
- A notification center UI that lists notices and marks them read.
Non-goals: Replacing the email digest, mobile push, or notification preferences beyond read/unread.
Constraints: The existing email digest continues on its current schedule. Notification records are per-user.
Acceptance criteria:
- Unread count shown in the UI matches the store.
- No notification is dropped after a process restart.
- The existing email digest still sends on its current schedule.
- Users can mark a notice read and see the unread count drop.
Verification strategy: Restart the service after inserting notices and confirm they remain; compare UI unread count with the store; confirm a digest still leaves on schedule after an in-app notice is stored.
Architecture-level decisions: The store is the source of unread state. Delivery writes to the store and does not call the UI. The UI reads only from the store.
Unit boundaries:
- Notification store: persist records and unread state.
- Delivery pipeline: fan account events into the store.
- Notification center UI: list notices and mark them read.
Dependencies: Delivery and UI both require the store. The store has no dependency on delivery or UI.
Unresolved human decisions: None.
This work has three observable leaves and a required store-first order. It is not one current-session unit.
