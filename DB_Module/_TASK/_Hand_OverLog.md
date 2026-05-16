# Agent Handover Log

> This file is the **inter-agent communication channel**. Each agent appends a handover entry when transferring control to the next agent.
> The receiving agent reads the latest entry to understand context, status, and any flags before starting work.
> Entries are **append-only** during a task cycle. The Archivist clears this file at milestone boundaries.

---
