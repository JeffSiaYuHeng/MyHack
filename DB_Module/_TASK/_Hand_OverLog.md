# Agent Handover Log

> This file is the **inter-agent communication channel**. Each agent appends a handover entry when transferring control to the next agent.  
> The receiving agent reads the latest entry to understand context, status, and any flags before starting work.  
> Entries are **append-only** during a task cycle. The Archivist clears this file at milestone boundaries.

---

<!-- TEMPLATE — Copy below this line for each handover -->

## [TIMESTAMP] — [SENDER_ROLE] → [RECEIVER_ROLE]

**Status**: [PASSED / DONE / FAILED / DEBUG_MODE]

### What Was Done
- (Brief summary of actions taken)

### Flags / Blockers
- (Any issues, warnings, or context the next agent needs)

### Handover Payload
- (Specific deliverables: file names written, checkboxes ticked, logs created, etc.)
