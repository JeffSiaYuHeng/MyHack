# `_PHASES` Bootstrap Controller

> **🤖 PLANNER**: Read `CURRENT_STATUS` below. Execute the matching procedure exactly. Do not skip steps.
> **👤 HUMAN / ARCHIVIST**: Only ever edit the `CURRENT_STATUS` field and `REPLAN_SCOPE` field. Do not modify procedure blocks.

---

## CURRENT_STATUS: `INIT`

<!-- Valid values: INIT | BOOTSTRAPPED | REPLAN -->

---

## REPLAN_SCOPE: `—`

<!-- Valid values: CONSERVATIVE | FULL_RESET | — (leave — when not in REPLAN state) -->

---

---

## 📋 Procedure A — STATUS: `INIT`

> **Trigger**: `CURRENT_STATUS` is `INIT`. No PHASE files exist yet. This is the first run.

### Steps

1. **Read the SRS fully before generating anything**
   - Open `_DOCS/00_SRS.md`
   - Read every section. Understand the full scope, goals, tech stack, and constraints.
   - Do not begin generating until you have a complete mental model of the project.

2. **Identify logical delivery phases**
   - Each phase must be a **shippable, independently testable slice** of the system.
   - Name phases by **outcome**, not by activity.
     - ✅ `PHASE_1__Foundation_and_Auth`
     - ❌ `PHASE_1__Setup_and_Build_Login`
   - Typical phase count: 3–7 for most projects. Do not over-granularize.

3. **Break each phase into Blocks**
   - Each Block = **one PDCA cycle** = one future `_INSTRUCTION.md`
   - Each Block must be narrow enough for a single Coder session (≤4 files touched)
   - Every Block must have explicit, testable **Acceptance Criteria**

4. **Generate files in this exact order**
   - First: all `PHASE_N__[Name].md` files (Phase 1 → Phase N)
   - Last: `00_ROADMAP.md` (only after all phase files are written)
   - Follow the Phase File Contract at the bottom of this file.

5. **Update this file**
   - Change `CURRENT_STATUS` from `INIT` → `BOOTSTRAPPED`
   - Do not delete this file or its procedure blocks.

---

## 📋 Procedure B — STATUS: `BOOTSTRAPPED`

> **Trigger**: `CURRENT_STATUS` is `BOOTSTRAPPED`. Normal operation.

### Steps

1. Stop reading this file.
2. Open `_PHASES/00_ROADMAP.md`
3. Identify the current active Phase and Block.
4. Proceed with the standard Planner flow (read `_PLAN.md` → write `_INSTRUCTION.md`).

---

## 📋 Procedure C — STATUS: `REPLAN`

> **Trigger**: `CURRENT_STATUS` is `REPLAN`. Human has updated `_DOCS/00_SRS.md` and flagged a replan.

### Steps

1. **Read `REPLAN_SCOPE` field above.** Human has set it to either `CONSERVATIVE` or `FULL_RESET`.

2. **Read the updated `_DOCS/00_SRS.md` fully.**

3. **Read all existing `PHASE_N__XXX.md` files** to understand current state.

4. **Execute based on scope:**

   #### If `REPLAN_SCOPE: CONSERVATIVE`
   - Diff the SRS changes against existing phases.
   - Identify only the phases and blocks **impacted** by the requirement change.
   - **Preserve all completed blocks** (do not touch checked-off `[x]` items).
   - Revise only the affected uncompleted phases/blocks.
   - Add new phases at the end if new requirements demand it.
   - Update `00_ROADMAP.md` to reflect changes.

   #### If `REPLAN_SCOPE: FULL_RESET`
   - Move all existing `PHASE_N__XXX.md` files into `_PHASES/_ARCHIVE/` (create folder if needed).
   - Move existing `00_ROADMAP.md` into `_PHASES/_ARCHIVE/` as well.
   - Regenerate from scratch using the updated SRS, following Procedure A steps 2–4.

5. **Clean up this file after replanning**
   - Change `CURRENT_STATUS` → `BOOTSTRAPPED`
   - Change `REPLAN_SCOPE` → `—`

---

---

## 📄 Phase File Contract

> **Planner reference**: Every generated `PHASE_N__[Name].md` must follow this structure exactly.

```markdown
# Phase [N]: [Outcome Name]

**Status**: [ NOT_STARTED | IN_PROGRESS | COMPLETE ]
**Prerequisite**: Phase [N-1] must be COMPLETE  ← (or "None" for Phase 1)
**Required _DOCS**: [List the _DOCS files Planner must read before working this phase]

---

## Block Dependency Table

| Block | Name          | Depends On | Status      |
|-------|---------------|------------|-------------|
| A     | [Block Name]  | —          | NOT_STARTED |
| B     | [Block Name]  | Block A    | NOT_STARTED |
| C     | [Block Name]  | Block B    | NOT_STARTED |

---

## Block A: [Name]

### Scope
- [ ] [Specific action item]
- [ ] [Specific action item]
- [ ] [Specific action item]

### Acceptance Criteria
- [ ] [Testable condition — verifiable by Evaluator]
- [ ] [Testable condition — verifiable by Evaluator]

---

## Block B: [Name]

### Scope
- [ ] [Specific action item]
- [ ] [Specific action item]

### Acceptance Criteria
- [ ] [Testable condition]
- [ ] [Testable condition]
```

---

## 📄 Roadmap File Contract

> **Planner reference**: `00_ROADMAP.md` must follow this structure exactly.

```markdown
# Project Roadmap

**Current Phase**: Phase [N] — [Name]
**Current Block**: Block [X]
**Last Updated**: [Date]

---

## Phase Overview

| Phase | Name                   | Status      |
|-------|------------------------|-------------|
| 1     | [Outcome Name]         | COMPLETE    |
| 2     | [Outcome Name]         | IN_PROGRESS |
| 3     | [Outcome Name]         | NOT_STARTED |

---

## Active: Phase [N] → Block [X]

> See `PHASE_[N]__[Name].md` for full block details.

**What we're building**: [One sentence]
**Acceptance gate**: [What Evaluator checks before Archivist advances the block]
```

---

*This file is permanent. It is the entry point for all `_PHASES` bootstrapping and replanning operations.*
*Maintained by: Human (STATUS field) + Archivist (STATUS field after phase transitions)*
