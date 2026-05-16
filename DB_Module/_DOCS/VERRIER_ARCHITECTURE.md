# Verrier — Architecture & AI Logic Analysis

**Date:** 2026-05-17  
**Stack:** Next.js App Router · React 19 · Gemini (`@google/generative-ai`) · Firebase · Tailwind CSS v4

---

## 1. 整体架构概览 / Overall Architecture

```
Browser (Client)
    │
    ├── Public Routes (no auth)
    │   ├── /apply/[programId]        → Startup application form
    │   └── /submit-meeting           → Mentor meeting submission (token-gated)
    │
    ├── Coordinator Routes (demo: open; prod: Firebase Auth)
    │   ├── /dashboard                → AI ops command center
    │   ├── /programs                 → Programme list (CRUD)
    │   ├── /programs/[id]            → Programme detail + edit
    │   ├── /programs/new             → Programme setup wizard
    │   ├── /programs/[id]/applicants → Applicant review pool
    │   ├── /matching                 → AI mentor matching workbench
    │   ├── /relationships            → Relationship list
    │   ├── /relationships/[id]       → Relationship detail + AI tools
    │   └── /program/[cohortId]       → Cohort overview + AI report
    │
    └── API Routes (server-side only)
        ├── POST /api/ai/program-fit      → Gemini fit scoring
        ├── POST /api/ai/match            → Gemini mentor ranking
        ├── POST /api/ai/analyze-meeting  → Gemini meeting analysis
        ├── POST /api/ai/diagnose         → Gemini relationship diagnosis
        ├── POST /api/ai/cohort-summary   → Gemini cohort narrative
        └── POST /api/relationships/confirm-match → Firestore write
```

**数据层 / Data Layer:**
- 所有演示数据来自 `lib/verrier-seed.ts`（静态种子数据）
- Firestore 仅在 `confirm-match` 路由中写入（其余为本地状态）
- `GEMINI_API_KEY` 仅在服务端读取，不暴露给客户端

---

## 2. AI 功能逻辑分析 / AI Feature Logic Analysis

### 2.1 Programme Fit Scoring — `POST /api/ai/program-fit`

**触发点:** 申请表单中的 "Get fit score & submit" 按钮（第一次点击）

**输入数据:**
```
programId + companyProfile (stage, industry, businessModel, country, teamSize, revenue)
+ founderSummary + supportNeeds[] + submittedDocumentTypes[]
```

**Gemini 任务:** 作为马来西亚加速器评估员，对初创公司进行项目契合度评分

**输出结构:**
```
fitScore (0-100) + fitLabel (Strong/Potential/Low fit)
+ aiRecommendation (approve/review/decline)
+ aiInsight (1-2句理由)
+ breakdown { stageFit, industryFit, tractionFit, teamFit, needsFit }
+ eligibilityFlags[]
```

**逻辑合理性分析:**
- ✅ 五维度评分（阶段、行业、牵引力、团队、需求契合）覆盖了加速器筛选的核心维度
- ✅ 分数阈值映射清晰：≥70 = Strong fit, 40-69 = Potential fit, <40 = Low fit
- ✅ 包含马来西亚背景护栏（不评估种族/宗教/皇室）
- ✅ Gemini 不可用时返回 `status: "pending"`，表单仍可提交
- ⚠️ 当前不验证 programId 是否真实存在于数据库（仅作为字符串传入 prompt）
- ⚠️ `teamSize` 和 `revenueMonthly` 为可选字段，缺失时 Gemini 可能低估牵引力

---

### 2.2 Mentor Matching — `POST /api/ai/match`

**触发点:** `/matching` 页面选择初创公司时自动触发（`useEffect`）

**输入数据:**
```
startupId → 从种子数据查找 ApprovedStartupQueueItem
programId + cohortId → 过滤 MentorPool
```

**Gemini 任务:** 从候选导师池中为初创公司排名前3名最佳导师

**候选导师数据传入 prompt:**
```
ID | Name | Expertise | Industries | Preferred stages | Style | Hours/month | Past successes
```

**输出结构:**
```
matches[3] { mentorId, overallScore, reason, breakdown { industryMatch, stageFit, availability, styleCompatibility } }
```

**确定性回退算法:**
```
overallScore = industryMatch×0.35 + stageFit×0.30 + availability×0.20 + styleCompatibility×0.15
```

**逻辑合理性分析:**
- ✅ 四维度权重分配合理：行业匹配最重要(35%)，阶段契合次之(30%)
- ✅ 回退算法与 Gemini prompt 的评分维度完全一致，保证一致性
- ✅ 验证 Gemini 返回的 mentorId 必须在候选池中存在（防止幻觉）
- ✅ 10秒超时 + AbortController，防止 UI 卡死
- ⚠️ `availability` 计算基于 `availableSlots` 数量比例，但 slot 数据是静态种子，不反映实时可用性
- ⚠️ `styleCompatibility` 用 `hoursPerMonth×8 + pastSuccessCount×5` 计算，这是代理指标，不是真正的风格匹配

---

### 2.3 Meeting Analysis — `POST /api/ai/analyze-meeting`

**触发点:**
1. `/submit-meeting` 公开导师表单提交
2. `/relationships/[id]` 内联 Log Meeting 表单的 "✦ Submit & Analyze" 按钮

**输入数据:**
```
relationshipId + date + durationMinutes + rawNotes (min 50 chars) + submittedBy
```

**Gemini 任务:** 分析会议笔记，评估关系健康状况

**输出结构:**
```
aiSummary (2-3句) + actionItems[] { task, owner, dueDate }
+ signal (Positive/Neutral/Friction detected)
+ signalReason + healthScoreDelta (-15 to +15) + watchPoints[]
```

**逻辑合理性分析:**
- ✅ `healthScoreDelta` 限制在 -15 到 +15，防止单次会议造成极端波动
- ✅ 信号归一化处理：将 Gemini 可能返回的小写 "positive/negative" 映射到标准枚举值
- ✅ `owner` 字段将 "founder" 映射为 "startup"，保持类型一致性
- ✅ 50字符最小验证确保笔记有足够内容供 AI 分析
- ⚠️ 当前不将 meeting 写入 Firestore（本地状态），刷新页面后数据丢失
- ⚠️ `newHealthScore` 由路由计算（seed healthScore + delta），但 seed 数据不会更新，下次调用仍基于原始分数

---

### 2.4 Relationship Diagnosis — `POST /api/ai/diagnose`

**触发点:** `/relationships/[id]` 页面的 "Refresh Diagnosis" 按钮

**输入数据:**
```
relationshipId → 从种子数据查找关系、公司、导师、最近3次会议
```

**传入 Gemini 的上下文:**
```
companyName + mentorName + healthScore + healthTrend + meetingCount
+ daysSinceLastMeeting + currentMilestone + aiDiagnosis (现有)
+ watchPoints (现有) + recentSignals[] + recentSummaries[]
```

**输出结构:**
```
narrative (2-3句评估) + watchPoints[] + recommendation (给协调员的行动建议)
```

**确定性回退逻辑（按优先级）:**
```
1. isCritical (score<40) OR (isAtRisk AND deteriorating) → 升级处理
2. hasFriction (最近会议有摩擦信号) → 协调员介入
3. isStale (>14天无会议) → 发送跟进提示
4. isDeterioring → 密切监控
5. 默认 → 维持现状
```

**逻辑合理性分析:**
- ✅ 将最近3次会议的信号和摘要传入，提供真实的历史上下文
- ✅ 回退逻辑覆盖了所有关键风险场景，优先级排序合理
- ✅ `recommendation` 直接面向协调员，具体可操作
- ✅ UI 静默失败（保留现有种子数据），不打断用户流程
- ⚠️ 诊断结果不写回 Firestore，刷新页面后恢复种子数据
- ⚠️ 仅读取最近3次会议，长期关系的历史模式可能被忽略

---

### 2.5 Cohort Summary — `POST /api/ai/cohort-summary`

**触发点:** `/program/[cohortId]` 页面的 "Generate Report" 按钮

**输入数据（从种子数据聚合）:**
```
cohortName + programName
+ totalCompanies/Mentors/Relationships/ActiveRelationships/Meetings
+ avgHealthScore + healthyCount + atRiskCount + criticalCount + staleCount
+ milestoneDistribution[5] { milestone, label, count }
```

**Gemini 任务:** 生成管理层可读的队列健康摘要

**输出结构:**
```
narrative (2-4句，引用具体数字) + keyRisks[2-4] + recommendedActions[2-4]
```

**逻辑合理性分析:**
- ✅ 传入的是聚合指标而非原始数据，prompt 简洁高效
- ✅ 要求 narrative 必须引用具体数字，防止 Gemini 生成空洞内容
- ✅ 回退报告从已渲染的指标计算，与 Gemini 输出格式完全一致
- ✅ "Copy report" 功能支持 clipboard API 和 textarea 降级
- ⚠️ 不缓存生成结果，每次点击都重新调用 Gemini
- ⚠️ 里程碑分布数据基于 `currentMilestone >= num`，可能高估进度

---

## 3. 数据流向图 / Data Flow Diagram

```
Founder fills /apply/[programId]
    │
    ▼
POST /api/ai/program-fit ──→ Gemini ──→ fitScore + breakdown
    │
    ▼
Application saved (local state) → Applicant Pool
    │
    ▼ Coordinator approves
Approved companies → /matching
    │
    ▼
POST /api/ai/match ──→ Gemini ──→ top 3 mentor matches
    │
    ▼ Coordinator confirms
POST /api/relationships/confirm-match ──→ Firestore (+ local fallback)
    │
    ▼ Relationship created (healthScore: 60, trend: stable)
    │
    ├── Mentor submits /submit-meeting
    │       │
    │       ▼
    │   POST /api/ai/analyze-meeting ──→ Gemini ──→ summary + delta + signal
    │       │
    │       ▼
    │   healthScore updated (local), actionItems shown
    │
    ├── Coordinator clicks "Refresh Diagnosis" on /relationships/[id]
    │       │
    │       ▼
    │   POST /api/ai/diagnose ──→ Gemini ──→ narrative + watchPoints + recommendation
    │
    └── Coordinator clicks "Generate Report" on /program/[cohortId]
            │
            ▼
        POST /api/ai/cohort-summary ──→ Gemini ──→ narrative + keyRisks + actions
```

---

## 4. 关键设计决策 / Key Design Decisions

| 决策 | 原因 |
|---|---|
| 所有 Gemini 调用在服务端 | API key 安全，防止客户端暴露 |
| 每个路由有确定性回退 | 演示时 Gemini 不可用不会崩溃 |
| `responseMimeType: "application/json"` | 强制 Gemini 返回结构化 JSON，减少解析失败 |
| 10秒 AbortController 超时 | 防止 UI 无限等待 |
| 分数 clamp 到 0-100 | 防止 Gemini 返回越界数值 |
| mentorId 验证 | 防止 Gemini 幻觉出不存在的导师 |
| 马来西亚背景护栏 | 所有 prompt 明确排除种族/宗教/皇室评估 |

---

## 5. /relationships 页面完整元素说明

### 页面结构

```
ProductShell (sidebar nav)
└── RelationshipList
    ├── Page Header
    │   ├── "Relationships" 标题 (text-xl font-bold)
    │   └── 统计行: {total} total · {healthy} healthy · {atRisk} at risk · {critical} critical
    │
    ├── Filter Bar
    │   ├── Status filters (pill buttons): All · Active · Pending · Paused · Completed · Terminated
    │   └── Health filters (pill buttons): All · Healthy · At Risk · Critical
    │
    └── Relationship Cards (每条关系一张卡片)
        ├── 左侧色条 (健康状态颜色: 绿/橙/红)
        ├── Row 1: 公司名 + 状态徽章 + 健康分数 + 趋势箭头
        ├── Row 2: 导师名 · 职位 at 公司
        ├── Row 3: 健康进度条 + "X meetings · Xd ago · Match X"
        ├── Row 4: ✦ AI Insight 面板 (aiDiagnosis 文字)
        ├── Row 5: 匹配维度条形图 (Industry / Stage / Avail. / Style)
        └── Row 6: Watch point 标签 (如有)
```

### 每张卡片显示的数据字段

| 字段 | 来源 | 说明 |
|---|---|---|
| 公司名 | `company.name` | 主标题 |
| 状态徽章 | `relationship.status` | active/pending/paused/completed/terminated |
| 健康分数 | `relationship.healthScore` | 0-100，颜色编码 |
| 趋势符号 | `relationship.healthTrend` | ↑ improving / → stable / ↓ deteriorating |
| 健康等级 | 计算自 healthScore | Healthy / At Risk / Critical |
| 导师名 | `mentor.name` | 副标题 |
| 导师职位 | `mentor.currentRole at mentor.company` | 元数据 |
| 会议次数 | `relationship.meetingCount` | |
| 距上次会议 | `relationship.daysSinceLastMeeting` | 天数 |
| 匹配分数 | `relationship.matchScore` | 整体匹配分 |
| AI 诊断 | `relationship.aiDiagnosis` | 种子数据，可通过 Refresh Diagnosis 更新 |
| 行业匹配 | `relationship.matchBreakdown.industryMatch` | 进度条 0-100 |
| 阶段契合 | `relationship.matchBreakdown.stageFit` | 进度条 0-100 |
| 可用性 | `relationship.matchBreakdown.availability` | 进度条 0-100 |
| 风格兼容 | `relationship.matchBreakdown.styleCompatibility` | 进度条 0-100 |
| 关注点 | `relationship.watchPoints[]` | 橙色标签，如有 |

### 交互行为

- 点击任意卡片 → 跳转到 `/relationships/[id]`（详情页）
- Status filter 按钮 → 按关系状态筛选
- Health filter 按钮 → 按健康等级筛选
- 加载时显示 4 个骨架屏（400ms 延迟）
- 无匹配结果时显示空状态提示

---

## 6. 已知局限与改进建议 / Known Limitations

| 问题 | 影响 | 建议 |
|---|---|---|
| AI 结果不持久化到 Firestore | 刷新后丢失 | 为 meetings/diagnosis 添加 safeWrite |
| healthScore 基于种子数据，不累积 | 多次分析后分数不变 | 将 newHealthScore 写回关系记录 |
| 匹配可用性基于静态 slot | 不反映实时日历 | 接入真实日历 API |
| 无 Firebase Auth 强制 | 任何人可访问协调员页面 | 添加 ID token 验证中间件 |
| `lib/gemini.ts` 是死代码 | 混淆代码库 | 删除或重构为共享 helper |
| 队列摘要不缓存 | 每次点击重新调用 Gemini | 添加 `generatedAt` 缓存逻辑 |
