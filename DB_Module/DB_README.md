# Dual-Brain System (双脑系统) Specification Document (V2.4) 💡

📖 **[中文版本](README(CN).md)** | English Version

*An AI collaboration protocol based on metacognition theory, designed to optimize the output-to-input ratio of side projects 🤖*

**Latest Updates (v2.4)**:

- 🤖 **Planner-Executed Bootstrap** - `_PHASES/00_INIT.md` acts as a state machine for INIT/BOOTSTRAPPED/REPLAN.
- 🧭 Strategic Traceability Enforcement - Planner/Evaluator are forced to anchor to `_PHASES` Phase/Block
- 📚 Signal-Driven Archival - Archivist updates `_PHASES` only after Evaluator emits `SIGNAL`
- 🗺️ Strategic Memory Layer (_PHASES) - Project roadmap with sequential execution and block-level acceptance criteria
- 🔗 Dependency Graph Analysis (auto-detect file relationships)
- 📖 Reference Scope (read-only context for Coder)
- ⚡ Debug Mode (fast-path E→C loop for simple errors)
- 🔍 Impact Audit (API side-effect tracking)

---

## Table of Contents

- [Introduction](#introduction)
- [Memory Structure](#i-memory-structure)
  - [_DOCS (Long-term Memory)](#1--docs-long-term-memory---static-truth)
  - [_PHASES (Strategic Memory)](#2--phases-strategic-memory---project-roadmap)
  - [_TASK (Working Memory)](#3--task-working-memory---dynamic-execution)
- [Agent Roles & Permissions](#ii-agent-roles--permissions)
- [Standard Operating Procedure](#iii-standard-operating-procedure-sop)
- [New Features (v2.1)](#iv-new-features-v21)
- [Defensive Rules](#v-defensive-rules)
- [Cost-aware Routing](#vi-cost-aware-routing)
- [Agent Skills](#vii-agent-skills-agentskills)
- [Quick Start Guide](#viii-initialization--quick-start-guide)
- [Workflow Examples](#concrete-example-building-your-first-feature)

---

# Introduction

Regarding the implementation of this concept, I combined the "Spec-Driven Development" (SDD) concept mentioned to me by the CTO of the Hiredly InnoTech team during a previous meeting, and referenced Daniel Kahneman's "System 1 and System 2" theory from "Thinking, Fast and Slow" to create a Markdown-based file system. System 1, as defined in the book, is fast, intuitive, and emotional, responsible for daily automated decisions; while System 2 is slow, deliberate, and logical, responsible for complex analytical reasoning. The system I designed simulates this cognitive operation by using "specifications" as a medium to guide AI into **System 2 deep thinking**, while breaking down tasks into routine actions that can be quickly processed by **System 1 intuition**. Through the constraints of specification documents, the AI is encouraged to enter the System 2 slow thinking mode for rigorous deduction and architectural design of complex business logic.

In current system practice (v2.1), I've designed a specification structure consisting of **Long-term Memory**, **Strategic Memory**, and **Short-term Memory**. Long-term memory (_DOCS) covers project structure, database schema, software requirement specifications (SRS), server-side action logic, and dependency relationships, forming the core knowledge base of the project. Strategic memory (_PHASES) defines the project roadmap and phase execution order. Short-term memory (_TASK) uses the `_PLAN.md` file to define specific task action plans, clarifying goals, scope, and verification checklists, thus forming an initial global view of the task. Subsequently, the system generates `_INSTRUCTION.md` based on the plan, transforming concepts into a series of executable instruction streams. This approach of introducing metacognitive thinking into project structures, combined with the recently launched "Agent-skill" mechanism, allows AI to move beyond fixed professional labels and instead operate as a skill- and spec-driven entity, achieving more flexible and autonomous deep collaboration.

The main goal is to save the cost of developing Side Projects. It feels like a low-cost, universal Adapter for different models through collaboration across various IDEs or CLIs. They only need to understand the current task and structure as input media, which significantly reduces Token consumption and regulates their reach, allowing for more comprehensive control over the overall process. However, for smaller tasks, a Single File and Single Prompt approach still works fine; no need to use a sledgehammer to crack a nut.

---

## I. Memory Structure

The system is divided into **Long-term Memory (_DOCS)**, **Strategic Memory (_PHASES)**, and **Working Memory (_TASK)**, achieving physical isolation between "facts", "sequence", and "intentions".

### 1. 📂 _DOCS (Long-term Memory - Static Truth)

> **Principle**: AI is Read-only (except for Evaluator logging and Archivist updates).


| File                       | Description                                                               | Maintained By      | Update Method           |
| -------------------------- | ------------------------------------------------------------------------- | ------------------ | ----------------------- |
| **00_STRUCTURE.md**        | File tree map. Prevents AI path hallucination.                            | Auto-generated     | `npm run gen:structure` |
| **01_DB_SCHEMA.md**        | Database schema. Single source of truth for fields, types, relationships. | Manual             | Human edits             |
| **02_STYLE_GUIDE.md**      | UI/UX conventions. Ensures visual consistency.                            | Manual             | Human edits             |
| **03_SERVER_ACTIONS.md**   | API protocol + Side Effects. Defines frontend-backend contracts.          | Manual + Archivist | Human + Impact Audit    |
| **04_TECH_STACK.md**       | Officially permitted tech stack and versions.                             | Manual             | Human edits             |
| **05_PROJECT_SNAPSHOT.md** | High-density project state. Current features, decisions, debt.            | Archivist          | After milestones        |
| **06_DEPENDENCY_GRAPH.md** | Import/export relationship map. Shows file dependencies.                  | Auto-generated     | `npm run gen:graph`     |
| **LOGS/**                  | Historical execution logs. Daily session records.                         | Evaluator          | After each task         |


**New in v2.1**:

- ✨ `06_DEPENDENCY_GRAPH.md` - Automatically analyzes import/export relationships
- ✨ `03_SERVER_ACTIONS.md` - Now includes explicit side effect documentation

### 2. 📂 _PHASES (Strategic Memory - Project Roadmap)

> **Principle**: Bridges long-term vision with short-term execution. "What sequence to build what next".


| File                | Description                                                    | Maintained By                 | Update Method                       |
| ------------------- | -------------------------------------------------------------- | ----------------------------- | ----------------------------------- |
| **00_ROADMAP.md**   | Single entry point. Current phase status and navigation.       | Archivist                     | After each block completion         |
| **PHASE_1__XXX.md** | Phase definition with blocks, scopes, and acceptance criteria. | Planner (initial) + Archivist | Initial creation + checkbox updates |
| **PHASE_2__XXX.md** | Phase definition with prerequisite dependencies.               | Planner (initial) + Archivist | Initial creation + checkbox updates |
| **PHASE_N__XXX.md** | Sequential phase files with inter-phase dependencies.          | Planner (initial) + Archivist | Initial creation + checkbox updates |


**File Structure Logic**:

```
_PHASES/
├── 00_ROADMAP.md          ← Single entry point (current phase status)
├── PHASE_1__XXX.md        ← Phase 1 definition
├── PHASE_2__XXX.md        ← Phase 2 (depends on Phase 1)
└── PHASE_3__XXX.md        ← Phase 3 (depends on Phase 2)
```

**Why This Design**:

- **One Entry Point** (`00_ROADMAP.md`) - Always start here to know current phase
- **Phase Isolation** - Each phase in separate file prevents future plans from interfering
- **Dependency Chain** - `Prerequisite:` fields ensure phases execute in order

**Internal Phase File Structure**:

```
Phase N File
├── Header (Status, Prerequisites, Required _DOCS files)
├── Block Dependency Table (Block execution order)
├── Block A
│   ├── Scope (What to do - checkbox list)
│   └── Acceptance (Completion criteria)
├── Block B
│   ├── Scope
│   └── Acceptance
└── ...
```

**Why Blocks Instead of Tasks**:
Each Block = One complete PDCA cycle input for PLANNER. PLANNER reads one Block → writes one `_INSTRUCTION.md` → CODER executes → EVALUATOR verifies → ARCHIVIST checks off.

**Update Frequency Comparison**:

```
_DOCS      → Archivist updates after phase completion   (monthly)
_PHASES    → Archivist updates after each block         (weekly)  
_TASK      → Replaced for each new task                 (daily)
```

**Access Permissions**:

```
📖 PLANNER    → Reads (determines next _INSTRUCTION.md scope; must anchor to current Phase+Block)
📚 ARCHIVIST  → Writes (checkboxes, phase status updates)
🔧 CODER      → Does not read (only reads _TASK files)
🔍 EVALUATOR  → Reads acceptance criteria (completion verification; Block Acceptance is the primary “done” gate)
```

**One-Sentence Summary**: `_PHASES` cuts large projects into sequential, independently executable work units, so PLANNER knows "which file to open, which Block to do" without rethinking the whole project.

### 3. 📂 _TASK (Working Memory - Dynamic Execution)

> **Principle**: High-frequency changes, cleared or updated upon task completion.


| File                        | Purpose                                                                     | Created By         | Used By            |
| --------------------------- | --------------------------------------------------------------------------- | ------------------ | ------------------ |
| **_PLAN.md**                | Strategic roadmap. "What to do" and "why".                                  | Planner (human/AI) | Planner, Evaluator |
| **_INSTRUCTION.md**         | Task blueprint. "How to do it" with scope constraints.                      | Planner            | Coder              |
| **_FIX_INSTRUCTION.md**     | Debug mode quick fix. Syntax/import errors only.                            | Evaluator          | Coder              |
| **_Hand_OverLog.md**        | Inter-agent communication log. Append-only handover entries between agents. | All agents         | All agents         |
| **_PLAN(Sample).md**        | Sample template for `_PLAN.md`. Reference for formatting.                   | —                  | Human              |
| **_INSTRUCTION(Sample).md** | Sample template for `_INSTRUCTION.md`. Reference for formatting.            | —                  | Human              |


**New in v2.1**:

- ✨ `_FIX_INSTRUCTION.md` - Emergency fix instructions bypass Planner for simple errors
- ✨ `_Hand_OverLog.md` - Structured inter-agent communication log for traceable handovers

---

## II. Agent Roles & Permissions


| Role          | Core Responsibility         | Read Access                                                                                    | Write Access                                                                                                            | **New Capabilities (v2.3)**                                                                                                                                                                              |
| ------------- | --------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Planner**   | Strategy to Tactics         | `_PLAN.md`, `_Hand_OverLog.md`, all `_DOCS/`, `_PHASES/`                                       | `_INSTRUCTION.md`, `_Hand_OverLog.md`, `_PHASES/` (initial creation)                                                    | ✨ Must anchor planning to current Phase+Block (no “guessing”) ✨ Must check dependency graph ✨ Can define Reference Scope (read-only)                                                                     |
| **Coder**     | Minimal Execution           | `_INSTRUCTION.md`, `_FIX_INSTRUCTION.md`, `_Hand_OverLog.md`, Context Scope, Reference Scope   | Context Scope files, `_Hand_OverLog.md`                                                                                 | ✨ Can read Reference Scope (read-only) ✨ Supports Debug Mode ✨ Writes handover log                                                                                                                       |
| **Evaluator** | Audit & Quality Gate        | `_PLAN.md`, `_INSTRUCTION.md`, `_Hand_OverLog.md`, code diff, `_PHASES/` (acceptance criteria) | `LOGS/`, `_PLAN.md` checkboxes, `_FIX_INSTRUCTION.md`, `_Hand_OverLog.md`                                               | ✨ Verifies Strategic Anchor (Phase+Block) ✨ Verifies against Block Acceptance criteria ✨ Can activate Debug Mode                                                                                         |
| **Archivist** | Strategic State Maintenance | `_PLAN.md`, `_INSTRUCTION.md`, `_Hand_OverLog.md`, `LOGS/`, all `_DOCS/`, `_PHASES/`           | `05_PROJECT_SNAPSHOT.md`, `03_SERVER_ACTIONS.md`, `_Hand_OverLog.md` (reset), cleanup, `_PHASES/` (checkboxes & status) | ✨ **Signal-driven**: writes `_PHASES` only after Evaluator `SIGNAL` ✨ Advances roadmap after Block completion ✨ Phase Gate: update `05_PROJECT_SNAPSHOT.md` on Phase transitions ✨ Performs Impact Audit |


---

## III. Standard Operating Procedure (SOP)



### 🌀 Core Cycles

The system now supports **two execution paths**:

#### **Normal Flow: P → C → E (→ A)**

```
┌─────────────────────────────────────────────────────────────────┐
│  NORMAL DEVELOPMENT CYCLE                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1️⃣ PLANNER:                                                   │
│     - Read _Hand_OverLog.md (prior Evaluator feedback)          │
│     - Read 00_ROADMAP.md (current phase status)                 │
│     - Read current PHASE_X__XXX.md (block to execute)           │
│     - Check 06_DEPENDENCY_GRAPH.md                             │
│     - Define Context Scope (≤4 files, writable)                │
│     - Define Reference Scope (≤2 files, read-only)             │
│     - Create _INSTRUCTION.md                                    │
│     - Append handover entry → _Hand_OverLog.md                 │
│                                                                  │
│  2️⃣ CODER:                                                     │
│     - Read _Hand_OverLog.md (Planner flags/context)             │
│     - Read _INSTRUCTION.md                                      │
│     - Read Reference Scope for context                          │
│     - Modify ONLY Context Scope files                           │
│     - Append handover entry → _Hand_OverLog.md                 │
│                                                                  │
│  3️⃣ EVALUATOR:                                                 │
│     - Read _Hand_OverLog.md (Coder status/flags)                │
│     - Run build verification                                    │
│     - Check scope adherence                                     │
│     - Log results + tick checkbox                               │
│     - Append handover entry → _Hand_OverLog.md                 │
│     - If simple error → activate DEBUG MODE                     │
│                                                                  │
│  Decision: More tasks? → Back to PLANNER                        │
│            Milestone reached? → Run ARCHIVIST                   │
│                                                                  │
│  4️⃣ ARCHIVIST (at milestones):                                 │
│     - Read _Hand_OverLog.md (full milestone history)            │
│     - Update _PHASES/ checkboxes and phase status               │
│     - Compress into PROJECT_SNAPSHOT.md                         │
│     - Reset _Hand_OverLog.md to blank template                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### **Debug Flow: E → C → E (Fast Path)** ⚡ NEW

```
┌─────────────────────────────────────────────────────────────────┐
│  DEBUG MODE (Bypasses Planner for simple errors)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  EVALUATOR detects simple error:                                │
│  - Syntax error (missing semicolon, bracket)                    │
│  - Missing import                                                │
│  - Typo (variable name mismatch)                                │
│  - Simple type annotation                                        │
│                                                                  │
│  ↓                                                               │
│  EVALUATOR creates _FIX_INSTRUCTION.md                          │
│  Appends DEBUG_MODE handover → _Hand_OverLog.md                 │
│  (Bypasses Planner - saves time)                                │
│                                                                  │
│  ↓                                                               │
│  CODER reads _Hand_OverLog.md (Evaluator's error context)       │
│  CODER applies ONLY the specified fix                           │
│  Appends DEBUG_FIX_APPLIED handover → _Hand_OverLog.md          │
│  (No features, no refactoring)                                  │
│                                                                  │
│  ↓                                                               │
│  EVALUATOR re-audits:                                           │
│  - Success → Continue normal flow                               │
│  - Still failing → Escalate to Planner                          │
│  - Max 2 iterations, then escalate                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step 1: Tactical Modeling (Planner Phase)

**Input**: `_PLAN.md` CURRENT FOCUS
**Output**: `_INSTRUCTION.md`

**Process** (Updated v2.1):

1. Read current focus from `_PLAN.md`
2. **🆕 Check `06_DEPENDENCY_GRAPH.md`** to understand file relationships
3. Identify if target files are "high-impact" (imported by many others)
4. Define **Context Scope** (≤4 files, writable)
5. **🆕 Define Reference Scope** (≤2 files, read-only for context)
6. Create `_INSTRUCTION.md` with clear steps and constraints

**Decision Matrix for Scope**:


| Importers | Risk     | Action                               |
| --------- | -------- | ------------------------------------ |
| 0-2       | Low      | Standard Context Scope               |
| 3-5       | Medium   | Add warning note                     |
| 6-10      | High     | Add 1-2 importers to Reference Scope |
| 10+       | Critical | Break task or expand scope           |


### Step 2: Isolated Surgery (Coder Phase)

**Input**: `_INSTRUCTION.md` OR `_FIX_INSTRUCTION.md`
**Output**: Modified code

**Process** (Updated v2.1):

1. **🆕 Check which instruction file exists**:
  - `_FIX_INSTRUCTION.md` → Debug Mode (quick fix only)
  - `_INSTRUCTION.md` → Normal Mode (feature implementation)
2. **🆕 Read Reference Scope** (if specified) for usage context
3. Modify **ONLY Context Scope** files
4. **Never modify Reference Scope** (read-only)
5. Write handover entry to `_Hand_OverLog.md`

**Restrictions**:

- ❌ Cannot read `_PLAN.md`
- ❌ Cannot modify files outside Context Scope
- ❌ Cannot modify Reference Scope files (read-only)
- ❌ In Debug Mode: Cannot add features or refactor

### Step 3: Shutdown Audit (Evaluator Phase)

**Input**: Code changes, `_INSTRUCTION.md`, `_PLAN.md`
**Output**: Log entry, checkbox ticked, OR `_FIX_INSTRUCTION.md`

**Process** (Updated v2.1):

1. Run structure sync: `npm run gen:structure`
2. Clear cache (e.g., `rm -rf .next`)
3. **Build verification**: `npm run build`
4. **🆕 If build fails with simple error**:
  - Syntax error, missing import, typo → **Activate Debug Mode**
  - Create `_FIX_INSTRUCTION.md`
  - Bypass Planner (fast path)
5. If build passes:
  - Verify scope adherence
  - **🆕 Check dependency awareness** (if high-impact file modified)
  - Create log entry
  - Tick checkbox in `_PLAN.md`

**Debug Mode Eligibility**:


| Error Type       | Debug Mode?                |
| ---------------- | -------------------------- |
| Syntax error     | ✅ Yes                      |
| Missing import   | ✅ Yes                      |
| Typo             | ✅ Yes                      |
| Logic error      | ❌ No → Escalate to Planner |
| Schema violation | ❌ No → Escalate to Planner |


### Step 4: Entropy Reduction (Archivist Phase - Trigger-based)

**Trigger**: Milestone completion, `LOGS/` > 10 files, or `_PLAN.md` > 100 lines

**Process** (Updated v2.1):

1. Scan completed tasks in `_PLAN.md`
2. Extract key decisions from `LOGS/`
3. **🆕 Perform Impact Audit**:
  - Review API changes in completed tasks
  - **🆕 Update `03_SERVER_ACTIONS.md`** with side effects
  - **🆕 Add breaking change annotations** if needed
  - Document which files were affected
4. Update `05_PROJECT_SNAPSHOT.md`
5. Clean up `_PLAN.md` (remove completed tasks)
6. Archive or delete old logs

**Side Effect Documentation Example**:

```markdown
### updateUserProfile (in 03_SERVER_ACTIONS.md)

**Side Effects**:
- ⚠️ Changing `email` triggers email verification workflow
- ⚠️ Updating `role` invalidates cached permissions

**⚠️ BREAKING CHANGE (2026-02-13)**:
- Return type changed from `{success: boolean}` to `{success: boolean, userId: string}`
- Frontend components using this action must be updated
```

---

## IV. New Features (v2.1)

### 🔗 Dependency Graph Analysis

**Purpose**: Prevent breaking changes by understanding file relationships

**How it works**:

1. Run `npm run gen:graph` to analyze imports/exports
2. Generates `06_DEPENDENCY_GRAPH.md` with:
  - High-impact files (imported by many others)
  - Complete dependency map
  - Reverse dependency map (who imports what)
3. Planner **must consult** this before defining scope

**Benefits**:

- ✅ 100% accurate (based on actual code)
- ✅ Zero token cost (pre-generated)
- ✅ Prevents "forgot to update caller" bugs
- ✅ Enables smarter Reference Scope decisions

**Example**:

```
Task: Modify lib/utils/validation.ts

Planner checks 06_DEPENDENCY_GRAPH.md:
→ Found: validation.ts imported by 12 files
→ Top importers: login/page.tsx, UserForm.tsx
→ Decision: Add these to Reference Scope (read-only)

Result: Coder sees how validation is used without modifying callers
```

### 📖 Reference Scope (Read-Only Context)

**Purpose**: Provide context without granting modification permission

**How it works**:

- Planner defines Reference Scope (≤2 files) in `_INSTRUCTION.md`
- Coder can **read** these files to understand usage patterns
- Coder **cannot modify** Reference Scope files

**Use cases**:

- Type definition files
- Files that import the target file
- Shared utilities to understand parameters

**Example**:

```markdown
## Context Scope (Writable)
- lib/utils/date-formatter.ts

## Reference Scope (Read-Only)
- app/dashboard/analytics/page.tsx (uses formatDate)
- components/charts/TimeSeriesChart.tsx (uses formatTimestamp)
```

### ⚡ Debug Mode (Fast Path)

**Purpose**: Skip Planner for simple errors

**How it works**:

1. Evaluator detects simple error (syntax, import, typo)
2. Creates `_FIX_INSTRUCTION.md` directly
3. Coder applies ONLY the fix
4. Evaluator re-audits
5. Max 2 iterations, then escalate to Planner

**Benefits**:

- 🚀 3-5x faster for simple errors
- ⚡ Bypasses planning overhead
- 🎯 Focused fixes only

**Qualifying errors**:

- Syntax errors (missing semicolon, bracket)
- Missing imports
- Variable name typos
- Simple type annotations

**NOT qualifying** (escalate to Planner):

- Logic errors
- Schema violations
- Architectural issues
- Multiple unrelated errors

### 🔍 Impact Audit (API Integrity)

**Purpose**: Prevent frontend-backend contract drift

**How it works**:

- Archivist reviews completed tasks at milestones
- Identifies API/server action changes
- Updates `03_SERVER_ACTIONS.md` with:
  - Side effects (what else is triggered)
  - Breaking changes (return type changes)
  - Affected components

**Benefits**:

- ✅ Frontend never uses outdated contracts
- ✅ Side effects are explicit
- ✅ Breaking changes clearly documented

---

## V. Defensive Rules

1. **No "Convenience Fixes"**: If the Coder finds an error outside of Scope, they must report to the Planner. Unauthorized modification is strictly forbidden.
2. **No "Path Guessing"**: If a path cannot be found, the Coder must **STOP** immediately and regenerate structure: `npm run gen:structure`.
3. **One-way Visibility**: The Coder is unaware of the "big goal" and only executes "atomic instructions" to prevent scope creep.
4. **Snapshot is Truth**: When `LOGS` details conflict with the `SNAPSHOT`, the `SNAPSHOT` prevails.
5. **🆕 Reference Scope is Sacred**: Coder can read but NEVER modify Reference Scope files.
6. **🆕 Dependency Awareness Required**: Planner must check dependency graph before defining scope.
7. **🆕 Debug Mode Limits**: Maximum 2 iterations before escalating to Planner.
8. **🆕 Phase Execution Order**: PLANNER must read `00_ROADMAP.md` first, then current phase file. Cannot skip phases or execute blocks out of order.

---

## VI. Cost-aware Routing

Based on task difficulty and Token consumption balance, the following model allocation is recommended:


| Role          | Recommended Model                  | Reasoning                                          |
| ------------- | ---------------------------------- | -------------------------------------------------- |
| **Planner**   | Claude Sonnet 4.5/4.6, GPT-4o      | Requires logical deduction, dependency analysis    |
| **Coder**     | Gemini 2.5 Flash, Claude Haiku 4.5 | Instructions are clear; pursues speed and low-cost |
| **Evaluator** | Claude Sonnet 4.5/4.6              | Keen at checking code diff and compliance          |
| **Archivist** | Claude Sonnet 4.5, DeepSeek-V3/R1  | Strong information aggregation and summarization   |


---

## VII. Agent Skills (`.agent/skills/`)

Each agent role is defined as a **Skill** file (`SKILL.md`) that can be loaded by compatible AI coding assistants (Cursor, Windsurf, Claude Code, etc.). These skill files enforce the role's permissions, workflow, and constraints at the prompt level.


| Skill File                      | Role                   | Key Behavior                                                                                                                                                            |
| ------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dual-brain-planner/SKILL.md`   | Architect & Strategist | Reads `_DOCS/`, `_Hand_OverLog.md`, checks dependency graph, writes `_PLAN.md`, `_INSTRUCTION.md`, and handover entry. Cannot write source code.                        |
| `dual-brain-coder/SKILL.md`     | Surgical Execution     | Reads `_INSTRUCTION.md`, `_FIX_INSTRUCTION.md`, and `_Hand_OverLog.md`. Modifies only Context Scope files. Writes handover entry on completion. Cannot read `_PLAN.md`. |
| `dual-brain-evaluator/SKILL.md` | Audit & Quality Gate   | Reads `_Hand_OverLog.md` (Coder's status), runs build verification, checks scope, ticks checkboxes. Writes handover entry (pass/fail/debug). Can activate Debug Mode.   |
| `dual-brain-archivist/SKILL.md` | Memory Compression     | Reads `_Hand_OverLog.md` (full milestone history), consolidates into `PROJECT_SNAPSHOT.md`, performs Impact Audit, resets handover log at milestones.                   |


Each skill file contains:

- **Data Access** rules (read/write permissions)
- **Forbidden Actions** (hard constraints)
- **Workflow Steps** (exact process to follow)
- **Templates** (output format for generated files)
- **Failure Conditions** (when to halt and escalate)

---

## VIII. Initialization & Quick Start Guide

### Prerequisites

1. **Node.js** (v14+) for automation scripts
2. **A new project repository** with basic scaffolding
3. **Access to AI models** aligned with Cost-aware Routing
4. **30-60 minutes** for initial setup

### 🚀 Project Initialization (Do This Once)

#### Step 1: Install System

```bash
# Clone or copy the dual-brain structure
git clone <your-repo>
cd your-project

# Install dependencies
npm install

# Optional: Install madge for better dependency analysis
npm install -g madge
```

#### Step 2: Create Directory Structure

```bash
your-project/
├── _DOCS/                              # Long-term Memory (Static Truth)
│   ├── 00_STRUCTURE.md                 # Auto-generated file tree map
│   ├── 01_DB_SCHEMA.md                 # Database schema (Manual)
│   ├── 02_STYLE_GUIDE.md               # UI/UX conventions (Manual)
│   ├── 03_SERVER_ACTIONS.md            # API protocol + Side Effects (Manual + Archivist)
│   ├── 04_TECH_STACK.md               # Permitted tech stack (Manual)
│   ├── 05_PROJECT_SNAPSHOT.md          # Project state (Archivist)
│   ├── 06_DEPENDENCY_GRAPH.md          # Import/export map (Auto-generated)
│   └── LOGS/                           # Historical execution logs
│       ├── YYYY-MM-DD.md               # Daily session records
│       └── LOG(format).md              # Log format template
├── _PHASES/                            # Strategic Memory (Project Roadmap)
│   ├── 00_ROADMAP.md                   # Single entry point (current phase status)
│   ├── PHASE_1__XXX.md                 # Phase 1 definition with blocks
│   ├── PHASE_2__XXX.md                 # Phase 2 (depends on Phase 1)
│   └── PHASE_3__XXX.md                 # Phase 3 (depends on Phase 2)
├── _TASK/                              # Working Memory (Dynamic Execution)
│   ├── _PLAN.md                       # Strategic roadmap & current focus
│   ├── _INSTRUCTION.md                # Execution blueprint from Planner
│   ├── _FIX_INSTRUCTION.md            # Debug mode quick fix (from Evaluator)
│   ├── _Hand_OverLog.md               # Inter-agent communication log
│   ├── _PLAN(Sample).md              # Sample template for _PLAN.md
│   └── _INSTRUCTION(Sample).md       # Sample template for _INSTRUCTION.md
├── .agent/                             # Agent Skills (Cursor/Windsurf/Claude)
│   └── skills/
│       ├── dual-brain-planner/         # Architect & Strategist role
│       │   └── SKILL.md
│       ├── dual-brain-coder/           # Surgical Execution role
│       │   └── SKILL.md
│       ├── dual-brain-evaluator/       # Audit & Quality Gate role
│       │   └── SKILL.md
│       └── dual-brain-archivist/       # Memory Compression role
│           └── SKILL.md
├── _UPDATE_LOG/                        # Version update changelog
│   └── UPDATE-2.0.MD                  # v2.0 → v2.1 migration log
├── scripts/
│   ├── generate-structure.js          # Generates 00_STRUCTURE.md
│   └── generate-dependency-graph.js   # Generates 06_DEPENDENCY_GRAPH.md
├── package.json                        # NPM scripts for automation
├── README.md                           # Full specification (English)
├── README(CN).md                      # Full specification (中文)
├── QUICK_REFERENCE.md                 # One-page cheat sheet
├── SKILLS_UPDATE_SUMMARY.md           # v2.1 changelog
├── DEPENDENCY_GRAPH_SETUP.md          # Dependency analysis setup guide
├── UPDATE_VERIFICATION.md             # v2.1 verification checklist
├── P-C-E-A Loop.png                   # Workflow diagram
└── src/                                # Your actual source code
```

#### Step 3: Generate Documentation

```bash
# Generate structure map
npm run gen:structure

# Generate dependency graph (requires source code)
npm run gen:graph

# Generate both at once
npm run gen:all

# Recommended: Run before each planning session
npm run pre-plan
```

#### Step 4: Initialize Core Documents

**Create `_DOCS/01_DB_SCHEMA.md`** (Manual):

```markdown
# Database Schema

## User Table
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| email | String | Unique, Not Null |
| password | String | Hashed |
| created_at | Timestamp | Default: now() |
```

**Create `_DOCS/02_STYLE_GUIDE.md`** (Manual):

```markdown
# Style Guide

## Colors
- Primary: #3B82F6
- Error: #EF4444

## Components
- Use shadcn/ui components
- Tailwind for styling
```

**Create `_DOCS/03_SERVER_ACTIONS.md`** (Manual):

```markdown
# Server Actions

## registerUser
**Parameters**: `{ email: string, password: string }`
**Returns**: `{ success: boolean, userId?: string }`

**Side Effects**: ✨ NEW
- Triggers welcome email
- Creates default user preferences
```

**Create `_DOCS/04_TECH_STACK.md`** (Manual):

```markdown
# Tech Stack

## Approved
- Next.js 15
- React 19
- TypeScript
- Prisma ORM
- Tailwind CSS

## Forbidden
- jQuery
- Lodash (use native JS)
```

**Create `_TASK/_PLAN.md`**:

```markdown
# Strategy Board

## Roadmap
- [ ] Phase 1: Authentication
- [ ] Phase 2: Dashboard
- [ ] Phase 3: Analytics

## CURRENT FOCUS
(Write your first task here)

## Notes
(Decisions, observations, constraints)
```

#### Step 5: First Planning Session

```bash
# 1. Generate latest structure and dependencies
npm run pre-plan

# 2. Update CURRENT FOCUS in _TASK/_PLAN.md
# Example: "Implement user registration form"

# 3. Run Planner agent (or manually create _INSTRUCTION.md)
# Planner will:
#  - Check 06_DEPENDENCY_GRAPH.md
#  - Define Context Scope
#  - Define Reference Scope (if needed)
#  - Create _INSTRUCTION.md

# 4. Run Coder agent to implement

# 5. Run Evaluator agent to verify
```

---

### ⚡ Standard Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  BEFORE EACH SESSION                                         │
├─────────────────────────────────────────────────────────────┤
│  npm run pre-plan  (regenerate structure + dependency graph) │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│  1️⃣ PLANNER                                                │
│  - Read _Hand_OverLog.md (prior context)  ✨                 │
│  - Read 00_ROADMAP.md (current phase status)  ✨             │
│  - Read current PHASE_X__XXX.md (block to execute)  ✨       │
│  - Read _PLAN.md CURRENT FOCUS                              │
│  - Check 06_DEPENDENCY_GRAPH.md  ✨                         │
│  - Define Context + Reference Scope                          │
│  - Create _INSTRUCTION.md                                    │
│  - Append handover → _Hand_OverLog.md  ✨                   │
│  Duration: 5-10 minutes                                      │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│  2️⃣ CODER                                                  │
│  - Read _Hand_OverLog.md (Planner's flags)  ✨               │
│  - Read _INSTRUCTION.md (or _FIX_INSTRUCTION.md)            │
│  - Read Reference Scope for context                          │
│  - Modify ONLY Context Scope files                           │
│  - Append handover → _Hand_OverLog.md  ✨                   │
│  Duration: 30 min - 2 hours                                  │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│  3️⃣ EVALUATOR                                              │
│  - Read _Hand_OverLog.md (Coder's status)  ✨                │
│  - Run build verification                                    │
│  - If simple error → DEBUG MODE  ✨                         │
│  - If pass → Log + tick checkbox                            │
│  - Append handover → _Hand_OverLog.md  ✨                   │
│  Duration: 10-20 minutes                                     │
└─────────────────────────────────────────────────────────────┘
        ↓
      Decision Point:
      ├─ More tasks? → Back to PLANNER
      └─ Milestone? → Run ARCHIVIST (resets _Hand_OverLog.md)
```

---

### 📋 Concrete Example: Building Your First Feature

**Scenario**: Build a user authentication system

#### **Iteration 1: Registration Form**

```
🧠 PLANNER:
   npm run pre-plan

   Read 00_ROADMAP.md:
   - Current Phase: PHASE_1__Authentication
   - Current Block: Block A - Registration Form

   Read PHASE_1__Authentication.md:
   - Prerequisites: None (first phase)
   - Block A Scope: [ ] Registration form with validation
   - Block A Acceptance: Form renders, validates, calls server action

   Check 06_DEPENDENCY_GRAPH.md:
   - No dependencies yet (new files)

   Create _INSTRUCTION.md:

   ## Context Scope
   - src/components/auth/RegisterForm.tsx (NEW)
   - src/actions/user.ts (NEW)

   ## Reference Scope
   (None - new feature)

   ## Steps
   1. Create RegisterForm with email/password fields
   2. Add validation (Zod schema)
   3. Create registerUser server action
   4. Hash password with bcrypt

   ## Out of Scope
   - Login form (next task)
   - Email verification (later)

🔧 CODER:
   Read _INSTRUCTION.md
   ✅ Create RegisterForm.tsx
   ✅ Create user.ts with registerUser action
   ✅ Test locally
   Report: "Registration form complete"
   Append to _Hand_OverLog.md:
     Coder → Evaluator | DONE | Modified: RegisterForm.tsx, user.ts

🔍 EVALUATOR:
   npm run gen:structure (update with new files)
   npm run build → ❌ FAILS

   Error: "Missing import: bcrypt"

   🆕 DEBUG MODE ACTIVATED:
   Create _FIX_INSTRUCTION.md:

   ## Error Type
   IMPORT_MISSING

   ## Target File
   - src/actions/user.ts:3

   ## Required Fix
   Add: import bcrypt from 'bcrypt'

   Handover to Coder

🔧 CODER (Debug Mode):
   Read _FIX_INSTRUCTION.md
   ✅ Add missing import
   Append to _Hand_OverLog.md:
     Coder → Evaluator | DEBUG_FIX_APPLIED | Fixed: user.ts:3
   Report: "Import added"

🔍 EVALUATOR (Re-audit):
   npm run build → ✅ SUCCESS
   ✅ Create log entry
   ✅ Tick checkbox: [x] Registration form

   Decision: More auth tasks → Back to PLANNER
```

#### **Iteration 2: Login Form**

```
🧠 PLANNER:
   npm run pre-plan

   🆕 Check 06_DEPENDENCY_GRAPH.md:
   - user.ts imported by RegisterForm.tsx
   - Risk: Low (only 1 importer)

   Create _INSTRUCTION.md:

   ## Context Scope
   - src/components/auth/LoginForm.tsx (NEW)
   - src/actions/user.ts (MODIFY - add loginUser)

   ## Reference Scope
   - src/components/auth/RegisterForm.tsx
     (to see how registerUser is called)

   ## Steps
   1. Create LoginForm similar to RegisterForm
   2. Add loginUser action to user.ts
   3. Verify password with bcrypt.compare

🔧 CODER:
   Read _INSTRUCTION.md
   🆕 Read Reference Scope: RegisterForm.tsx (context only)
   ✅ Create LoginForm (matching RegisterForm pattern)
   ✅ Add loginUser to user.ts
   Append to _Hand_OverLog.md:
     Coder → Evaluator | DONE | Modified: LoginForm.tsx, user.ts
   Report: "Login form complete"

🔍 EVALUATOR:
   npm run build → ✅ SUCCESS
   ✅ Verify scope: Only LoginForm and user.ts modified
   ✅ Verify: Did NOT modify RegisterForm (Reference Scope)
   ✅ Create log entry
   ✅ Tick checkbox: [x] Login form

   Decision: Auth feature COMPLETE → Run ARCHIVIST
```

#### **Archivist Phase**

```
📚 ARCHIVIST:
   Scan _PLAN.md:
   - [x] Registration form
   - [x] Login form

   Review LOGS/:
   - 2026-02-13.md: Registration + debug import fix
   - 2026-02-14.md: Login completed

   🆕 Update _PHASES/:
   - Update PHASE_1__Authentication.md:
     - [x] Block A: Registration form
     - [x] Block B: Login form
   - Update 00_ROADMAP.md:
     - Phase 1: ✅ COMPLETE
     - Next: Phase 2 - Dashboard

   🆕 Impact Audit:
   Check 03_SERVER_ACTIONS.md:

   Update with:

   ### registerUser
   **Parameters**: { email, password }
   **Returns**: { success, userId }
   **Side Effects**:
   - Triggers welcome email workflow
   - Creates user session

   ### loginUser
   **Parameters**: { email, password }
   **Returns**: { success, token }
   **Side Effects**:
   - Invalidates previous sessions
   - Logs login attempt

   Update 05_PROJECT_SNAPSHOT.md:

   Update with:

   ### registerUser
   **Parameters**: { email, password }
   **Returns**: { success, userId }
   **Side Effects**:
   - Triggers welcome email workflow
   - Creates user session

   ### loginUser
   **Parameters**: { email, password }
   **Returns**: { success, token }
   **Side Effects**:
   - Invalidates previous sessions
   - Logs login attempt

   Update 05_PROJECT_SNAPSHOT.md:

   ## Completed Features
   - [x] User Authentication
     - Registration with validation
     - Login with session management
     - Password hashing (bcrypt)

   Clean up:
   ✅ Remove completed tasks from _PLAN.md
   ✅ Archive old logs
   ✅ Reset _INSTRUCTION.md

   Ready for: Phase 2 - Dashboard
```

---

### 🛠️ Quick Reference: Files & Scripts


| Command                 | Purpose                 | When to Run                             |
| ----------------------- | ----------------------- | --------------------------------------- |
| `npm run gen:structure` | Generate file tree      | Before planning, after adding files     |
| `npm run gen:graph`     | Generate dependency map | Before planning, after changing imports |
| `npm run gen:all`       | Generate both           | ✅ Recommended before each session       |
| `npm run pre-plan`      | Alias for gen:all       | Use this!                               |



| File                     | Who Reads It             | Who Writes It          |
| ------------------------ | ------------------------ | ---------------------- |
| `06_DEPENDENCY_GRAPH.md` | Planner                  | Auto-generated         |
| `_INSTRUCTION.md`        | Coder                    | Planner                |
| `_FIX_INSTRUCTION.md`    | Coder                    | Evaluator (Debug Mode) |
| `_Hand_OverLog.md`       | All agents (read latest) | All agents (append)    |
| Reference Scope files    | Coder (read-only)        | -                      |


---

### ⚠️ Common Pitfalls & Solutions


| Pitfall                       | Symptom                                   | Solution (v2.1)                                           |
| ----------------------------- | ----------------------------------------- | --------------------------------------------------------- |
| **Breaking Changes**          | Modified file breaks callers              | Check `06_DEPENDENCY_GRAPH.md` first ✨                    |
| **Scope Creep**               | Coder modifies too many files             | Cap Context Scope at 4 files                              |
| **Simple Error Loop**         | Planner wastes time on typos              | Use Debug Mode (E→C→E) ✨                                  |
| **Reference Scope Violation** | Coder modifies read-only files            | Enforce read-only in Coder skill ✨                        |
| **API Drift**                 | Frontend uses outdated contracts          | Run Impact Audit (Archivist) ✨                            |
| **Hallucinating Paths**       | Coder tries non-existent files            | Run `npm run gen:structure`                               |
| **Lost Context**              | Coder reads _PLAN.md                      | Strictly enforce instruction-only reading                 |
| **Stale Dependencies**        | Breaking changes not detected             | Run `npm run gen:graph` regularly                         |
| **Missing Handover**          | Next agent lacks context from prior agent | Every agent appends to `_Hand_OverLog.md` before handover |


---

### 📚 Additional Resources

- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - One-page cheat sheet
- **[SKILLS_UPDATE_SUMMARY.md](SKILLS_UPDATE_SUMMARY.md)** - Complete v2.1 changelog
- **[DEPENDENCY_GRAPH_SETUP.md](DEPENDENCY_GRAPH_SETUP.md)** - Dependency analysis setup guide
- **[UPDATE_VERIFICATION.md](UPDATE_VERIFICATION.md)** - What was changed in v2.1
- **[README(CN).md](README(CN).md)** - Chinese version of this specification
- **[_UPDATE_LOG/](_UPDATE_LOG/)** - Version migration logs (e.g., v2.0 → v2.1)

---

### 🎯 Success Metrics

With v2.2, you should see:

- ✅ **Strategic Project Execution**: Clear phase-by-phase progression prevents planning paralysis
- ✅ Fewer breaking changes (dependency awareness)
- ✅ Faster simple error fixes (debug mode)
- ✅ Better context for implementation (reference scope)
- ✅ Clearer API contracts (impact audit)
- ✅ Reduced token costs (pre-generated analysis)

---

**Version**: 2.3
**Last Updated**: 2026-04-17
**Status**: Production Ready

For questions, issues, or contributions, see the [GitHub repository](https://github.com/JeffSiaYuHeng/dual-brain-system).

---

*Happy building with the Dual-Brain System! 🚀*