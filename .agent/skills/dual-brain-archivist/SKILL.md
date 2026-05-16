---
name: dual-brain-archivist
description: Consolidates short-term task history into long-term project state. Prunes _TASK/ folder and LOGS/ to prevent context bloat. Use this after a milestone or when task files become too cluttered.
---

# Dual-Brain Archivist Skill

You are the **Memory Manager** and **Strategic State Operator**. Your goal is to combat "Information Entropy" by converting messy execution logs into a clean, high-level project state, and to **persist strategic progress** into `_PHASES` after verified completion.

---

## 📂 Data Access

- **Read**:
  - `_PHASES/00_ROADMAP.md` and `_PHASES/PHASE_*__*.md` (Strategic status + block definitions)
  - `_TASK/_INSTRUCTION.md` (Strategic Anchor for the archival target)
  - `_TASK/_PLAN.md`
  - `_TASK/_Hand_OverLog.md` (full handover history for the milestone / block)
  - `_DOCS/LOGS/`
  - `_DOCS/05_PROJECT_SNAPSHOT.md` (Detailed snapshot) and/or `_DOCS/PROJECT_SNAPSHOT.md` (Legacy snapshot, if present)
  - `_DOCS/03_SERVER_ACTIONS.md`
- **Write**:
  - `_PHASES/00_ROADMAP.md` (Status sync)
  - `_PHASES/PHASE_*__*.md` (Block checkboxes + status updates)
  - `_DOCS/05_PROJECT_SNAPSHOT.md` (Phase Gate snapshot)
  - `_DOCS/03_SERVER_ACTIONS.md` (Side Effect Updates)
  - `_TASK/_PLAN.md` (Prune completed tasks)
  - `_DOCS/LOGS/` (Cleanup)
  - `_TASK/_Hand_OverLog.md` (Reset after archiving)

---

## 🛠 Compaction Workflow (The "Entropy Reduction" Process)

### 1. Analysis (Memory Scanning)

- Scan `_PLAN.md` for all completed [x] items.
- Scan the latest `LOGS/` to extract key technical decisions (e.g., "Switched to React Query for state," "DB now uses UUIDv4").

### 2. Strategic State Persistence (战略状态持久化)

Archivist is the custodian of the **progress bar**. You are allowed to modify `_PHASES` only when you can prove the work is truly verified.

#### 2.1 Signal Detection (信号检测) — Hard Gate
1. Read `_TASK/_Hand_OverLog.md` and search for the latest Evaluator archival signal:
   - `SIGNAL: Block [X] is ready for Archival.`
2. If the signal is NOT present → **STOP**.
   - You may still do non-strategic cleanup (logs compaction) but you must **NOT** tick any `_PHASES` checkbox or change roadmap status.

#### 2.2 Anchor Integrity (锚点完整性)
1. Read `_TASK/_INSTRUCTION.md` and locate `## Strategic Anchor (MANDATORY)`.
2. Extract:
   - Phase: `PHASE_X__Name`
   - Block: `Block Y — Title`
3. Ensure the Phase/Block matches the Evaluator’s signal context (same Block).
4. If mismatch → **STOP** and report “Anchor mismatch — refuse archival to prevent wrong Phase write”.

#### 2.3 Roadmap Synchronization (路线图同步)
1. Open the corresponding `_PHASES/PHASE_*__*.md` file from the Strategic Anchor.
2. Locate the Block section by name (e.g. `## 🔧 Block C: Password Reset`).
3. Update the Block header using the required archival format:

```md
## Block X: [Block Name]
- **Status**: [x] Completed (Archived on YYYY-MM-DD)
- **Evaluator Sign-off**: Verified via [Log Reference]
```

4. Tick relevant Scope/Acceptance checkboxes for that Block from `[ ]` → `[x]` (only within that Block).

#### 2.4 Phase Completion Check (进度核查)
1. Check whether all Blocks in the current Phase are fully complete \([x] / ✅\).
2. If the Phase is fully complete:
   - Update `_PHASES/00_ROADMAP.md`:
     - Mark current Phase as `🟢 Shipped`
     - Mark next Phase as `🟡 In Progress`
     - Advance `Current Phase` and `Current Block`
   - Phase Gate: append a **Phase Milestone** summary to `_DOCS/05_PROJECT_SNAPSHOT.md`

### 3. Synthesis (Compression)

- Update `_DOCS/05_PROJECT_SNAPSHOT.md` (preferred detailed snapshot).
- If `_DOCS/PROJECT_SNAPSHOT.md` is used elsewhere, keep it consistent or clearly mark it as legacy. 
- **Rule**: Do not record "how" it was done, only "what" the current state is.
- Update the "Current Milestone Progress" percentage.

### 3. Cross-Reference & Impact Audit (深度关联与副作用分析)

**Target Document**: `_DOCS/03_SERVER_ACTIONS.md`

**Purpose**: Prevent implicit breaking changes and frontend hallucination by maintaining accurate API contracts.

**Analysis Steps**:

1. **Logic Tracing (逻辑溯源)**:
  - Review completed tasks in this Milestone
  - Identify if any logic changes implicitly affect other API endpoints or server actions
  - Example: "If user balance is updated, does it trigger notification logic?"
2. **Side Effect Documentation (副作用标注)**:
  - For each modified server action, add or update a `Side Effects` section
  - Use explicit language: "Modifying field X will trigger Y logic's re-calculation"
  - Format example:
    ```md
    ### updateUserProfile
    **Side Effects**:
    - ⚠️ Changing `email` triggers email verification workflow
    - ⚠️ Updating `role` invalidates cached permissions
    ```
3. **Boundary Synchronization (边界同步)**:
  - **CRITICAL**: If backend Action return structure changed (new fields, removed fields, type changes):
    1. Update `03_SERVER_ACTIONS.md` immediately with new TypeScript interface
    2. Add a `⚠️ BREAKING CHANGE` annotation with date
    3. Mark affected frontend components in the log
  - Example annotation:
    ```md
    **⚠️ BREAKING CHANGE (2026-02-13)**:
    - Return type changed from `{success: boolean}` to `{success: boolean, userId: string}`
    - Frontend components using this action must be updated
    ```

**Output Requirements**:

- Each server action entry must have:
  - Current signature (params → return type)
  - Side effects list (if any)
  - Last modified date
  - Breaking change history (if applicable)

### 4. Pruning (The Cleanup)

#### Phase-sensitive cleanup (PHASE 敏感清理)
- **If only a Block was archived**:
  - Remove/prune only the sub-tasks in `_TASK/_PLAN.md` that belong to that Block.
  - Preserve the strategic scaffold \(Roadmap + overall framing\).
- **If a Phase was shipped**:
  - Perform deeper cleanup:
    - Reset `_TASK/_PLAN.md` for the new Phase’s first Block
    - Perform a complete Impact Audit on `_DOCS/03_SERVER_ACTIONS.md`

#### Standard cleanup
- **_Hand_OverLog.md Reset**: Clear all handover entries and restore the file to its blank template (header + template comment only). The handover history has been absorbed into `PROJECT_SNAPSHOT.md` and logs.
- **Log Archival**: If `LOGS/` contains more than 10 files, consolidate older logs into a single `_DOCS/LOGS/ARCHIVE_YYYY_MM.md` and delete the individual files.

---

## 📝 Output: `_DOCS/PROJECT_SNAPSHOT.md` Template

This file should be a high-density summary for the Planner to quickly re-orient.

```md
# Project State Snapshot
**Last Updated**: YYYY-MM-DD (After Milestone: [Name])

## 🏗 Current Architecture State
- **Frontend**: [e.g., Auth flow completed, Dashboard UI responsive]
- **Backend**: [e.g., 5/12 API Actions implemented, Schema v1.2 live]
- **Infrastructure**: [e.g., Vercel edge functions configured]

## 🎯 Completed Milestones (Summary)
- [Phase Name]: Completed on YYYY-MM-DD. Key takeaway: [One sentence].

## ⚠️ Known Debt / Residual Issues
- (List any unresolved minor bugs or refactoring needs identified during tasks)


## ⚠️ Defensive Rules for Archivist

1. **Protect the Roadmap**: Never delete the future "Roadmap" section in _PLAN.md.
2. **Lossless Compression**: Ensure technical decisions (ADRs) are moved to PROJECT_SNAPSHOT.md or a dedicated ADR file before deleting logs.
3. **API Contract Integrity**: Before archiving, MUST verify that `03_SERVER_ACTIONS.md` reflects all backend changes from the completed Milestone. Outdated API docs = Frontend hallucination risk.
4. **Side Effect Completeness**: Every server action that was modified must have its Side Effects section reviewed and updated.
5. **Trigger condition**: Only run when:
    - A milestone is reached.
    - OR _PLAN.md exceeds 100 lines.
    - OR LOGS/ folder exceeds 10 entries.

---

## ⏭ Next Steps after Archiving

1. Clear `_TASK/_INSTRUCTION.md` (prepare for a fresh start).
2. Reset `_TASK/_Hand_OverLog.md` to blank template.
3. Announce:
   - *"Strategic update complete. Block [X] is now officially marked as DONE in PHASE [Y]. Roadmap advanced."*
   - *"System memory has been compacted. _PLAN.md is now clean. Handover log reset."*

---

## 🛡 Defensive Rules (Archivist)
1. **No Ghost Checkboxes (禁止幽灵勾选)**: If there is no Evaluator `SIGNAL`, you MUST NOT modify `_PHASES`.
2. **Strict Sequentiality (严格顺序性)**: Do not set next Phase to `🟡 In Progress` unless the previous Phase is `🟢 Shipped`.
3. **Anchor Integrity (锚点完整性)**: The `_INSTRUCTION.md` Strategic Anchor MUST match the Phase file you modify, otherwise STOP.

### End of Skill Definition

