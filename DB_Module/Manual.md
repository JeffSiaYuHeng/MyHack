# 🧠 The Dual-Brain System — Manual

Think of it like a **kitchen team** preparing a complex multi-season menu:

- **_DOCS** = The recipe book (long-term knowledge)
- **_PHASES** = The seasonal menu plan (what to build over the next 3 months, and in what order)
- **_TASK** = Today's prep list (active work instructions)
- **Agent Skills** = Each chef's job description (what they can/cannot do)

---

## 📁 Folder Map

```
Prototype/
├── _DOCS/        ← What the system IS (permanent reference)
├── _PHASES/      ← What to BUILD and in what ORDER (phased roadmap)
├── _TASK/        ← What to do RIGHT NOW (active task instructions)
└── Manual.md     ← This file
```

---

## 📚 `_DOCS` — The Recipe Book (Long-term Memory)

Static reference files that contain all the "facts" about the system. **Only the ARCHIVIST updates these**, and only when a Phase gate is passed.


| File                     | Purpose                                  |
| ------------------------ | ---------------------------------------- |
| `00_STRUCTURE.md`        | File & folder organization map           |
| `01_DB_SCHEMA.md`        | Database schema & access control         |
| `02_STYLE_GUIDE.md`      | UI/UX design system & coding conventions |
| `03_SERVER_ACTIONS.md`   | API contracts & server action patterns   |
| `04_TECH_STACK.md`       | Approved tools by layer                  |
| `05_PROJECT_SNAPSHOT.md` | Current build status & metric targets    |
| `06_DEPENDENCY_GRAPH.md` | File relationships & impact map          |
| `PROJECT_SNAPSHOT.md`    | Top-level version + quick links          |


**Update frequency:** Monthly / per Phase gate
**Who writes:** ARCHIVIST only

---

## 🗓️ `_PHASES` — The Seasonal Menu Plan (Strategic Layer)

Defines **what to build, in what order, and when a phase is done**. This is the layer that was missing from the original Dual-Brain System. Without it, the PLANNER had to re-derive priority from scratch every session.

```
_PHASES/
├── 00_ROADMAP.md          ← Entry point: Phase status table + Gate definitions
├── PHASE_1__MVP_LAUNCH.md ← V3.0: broken into Blocks (1A → 1B → 1C → 1D → 1E)
├── PHASE_2__DEVELOPER_API.md
└── PHASE_3__ENTERPRISE.md
```

### Internal structure of each Phase file

```
Phase N
├── Header (status, prerequisite, which _DOCS to read)
├── Block dependency table
├── Block A
│   ├── Scope (checkbox list of tasks)
│   └── Acceptance (definition of done)
├── Block B ...
└── ...
```

**One Block = one `_INSTRUCTION.md`** — PLANNER scopes each instruction to one Block only. Never cross phase boundaries in a single instruction.

**Update frequency:** Weekly / per Block completion
**Who writes:** ARCHIVIST only (after EVALUATOR sign-off)

### Update frequency comparison


| Folder    | Updated by      | When                       |
| --------- | --------------- | -------------------------- |
| `_DOCS`   | ARCHIVIST       | After Phase gate passes    |
| `_PHASES` | ARCHIVIST       | After each Block completes |
| `_TASK`   | PLANNER / CODER | Every new task             |


---

## ⚡ `_TASK` — The Prep Station (Working Memory)

Active work files that change with every task cycle.


| File                  | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `_PLAN.md`            | What needs to be done (strategy)             |
| `_INSTRUCTION.md`     | How to do it (tactics — scoped to one Block) |
| `_FIX_INSTRUCTION.md` | Quick bug fixes                              |
| `_Hand_OverLog.md`    | Communication between agents                 |


**Update frequency:** Every task
**Who writes:** PLANNER writes `_INSTRUCTION.md`; CODER/EVALUATOR write handover notes

---

## 👥 Agent Roles & Access

```
📖 PLANNER (Architect)
   Reads:  _PHASES/00_ROADMAP.md   → which Phase is active?
           _PHASES/PHASE_N.md      → which Block is next?
           _DOCS/                  → technical details for that Block
           _TASK/_Hand_OverLog.md  → prior context
   Writes: _TASK/_INSTRUCTION.md   → scoped to ONE Block only

🔧 CODER (Chef)
   Reads:  _TASK/_INSTRUCTION.md
           _TASK/_Hand_OverLog.md
           Reference files listed in _INSTRUCTION.md
   Writes: Code files + handover note
   Rule:   Never reads _PHASES directly

🔍 EVALUATOR (Quality Control)
   Reads:  Code changes + _TASK/_Hand_OverLog.md
           _PHASES/PHASE_N.md → Acceptance condition for the Block
   Writes: Logs + checkboxes + handover note

📚 ARCHIVIST (Keeper)
   Reads:  Completed work + EVALUATOR sign-off
   Writes: _PHASES/PHASE_N.md → mark Block checkboxes [x]
           _DOCS/ → update when Phase gate passes
           _PHASES/00_ROADMAP.md → update Phase status (🟡/🟢)
```

---

## 🔄 The Full Workflow Cycle

```
1. PLANNER opens _PHASES/00_ROADMAP.md
      → finds the current active Phase
      → opens that Phase file, finds the next uncompleted Block

2. PLANNER reads the Block's Scope from _PHASES/PHASE_N.md
      → reads the relevant _DOCS files listed in the Block
      → writes _TASK/_INSTRUCTION.md (scoped to that Block only)

3. CODER reads _TASK/_INSTRUCTION.md
      → modifies only the files listed in Context Scope
      → writes handover note

4. EVALUATOR checks the work
      → compares against the Block's Acceptance condition in _PHASES
      → approves or creates _FIX_INSTRUCTION.md

5. ARCHIVIST updates on sign-off
      → marks Block checkboxes [x] in _PHASES/PHASE_N.md
      → checks if all Blocks in Phase are [x]
      → if yes: runs Phase Gate checklist in 00_ROADMAP.md
      → if gate passes: updates _DOCS + marks Phase 🟢 Shipped
```

---

## 🚫 Rules

- PLANNER **never** scopes an instruction across Phase boundaries
- CODER **never** reads `_PHASES` directly (only `_TASK`)
- `_PHASES` files **only** updated by ARCHIVIST after EVALUATOR sign-off
- `_DOCS` files **only** updated by ARCHIVIST when a Phase gate is passed
- Phase N cannot start until Phase N-1 gate is 🟢 Shipped

