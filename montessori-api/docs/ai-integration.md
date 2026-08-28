# AI Integration — Grok via xAI API

## Model

- Provider: xAI (`https://api.x.ai/v1`)
- SDK: `openai` npm package (OpenAI-compatible)
- Model: `grok-4` (configurable via `GROK_MODEL` env var)
- API key: `GROK_API_KEY` — stored in backend env only, **never sent to the frontend**

## AI Assistant (Chat)

Endpoint: `POST /api/v1/ai/chat`

### Flow

```
Client → POST /api/v1/ai/chat { message, conversationId? }
  → authenticate + scopeTenant
  → Load/create AIConversation
  → Build role-specific system prompt
  → Load last 20 AIMessages for context
  → Call Grok with tools array (function-calling)
  → If finish_reason === "tool_calls":
      Execute tool(s) → inject results → re-call Grok (max 5 iterations)
  → Persist AIMessage (user + assistant)
  → Return { reply, conversationId, toolsUsed }
```

### Function-Calling Tools

| Tool | Description | Used when |
|---|---|---|
| `fetch_student_progress` | Curriculum progress + recent observations | "How is Alex doing in Sensorial?" |
| `fetch_attendance` | Attendance summary for student/classroom | "Has Sofia been absent recently?" |
| `fetch_fee_status` | Overdue invoices and payment status | "Which families have outstanding fees?" |
| `fetch_classroom_summary` | Enrollment, obs count, upcoming plans | "What's happening in Sunflower Room?" |
| `fetch_org_overview` | School-wide KPIs | "Give me a school overview" |

### Role-Aware System Prompts

| Role | Focus |
|---|---|
| TEACHER / GUIDE | Curriculum help, observation note drafting, identifying students needing attention |
| PARENT | Own children's data only (enforced via `childIds` in system prompt context) |
| ORG_ADMIN | School-wide metrics, patterns, operational decisions |
| FINANCE_STAFF | Invoice, payment, expense queries |

## Nightly AI Insights Job

Runs at 02:00 UTC via BullMQ (`ai-insights` queue).

For each active organization, generates:

1. **ATTENDANCE_PATTERN** — students with < 80% attendance over 30 days
2. **CURRICULUM_GAP** — curriculum areas with no observations in 7 days per classroom
3. **FEE_DELINQUENCY** — overdue invoices summary with recommended actions
4. **DAY_REVIEW** — personalised daily digest per student with observations that day

All insights are persisted to `AIInsight` table and surfaced on admin/teacher dashboards.

## Photo Observation Tagging

Endpoint: `POST /api/v1/ai/suggest-observation`

Teacher uploads a photo → Grok Vision analyses → returns:
```json
{
  "curriculumAreaId": "<uuid>",
  "milestoneId": "<uuid>",
  "confidence": 0.87,
  "reasoning": "The image shows a child using the Pink Tower, which is a Sensorial activity."
}
```

Pre-fills the observation form. Teacher reviews and confirms before saving.

## Prompt Structure Example (Teacher)

```
System: You are a helpful, warm, and knowledgeable assistant for Sunrise Montessori Academy.
        You have access to real data about the school via tools. Always use the tools to ground
        your answers in actual data...
        [role-specific instructions]

User:   How is Alex doing this month?

[Grok calls fetch_student_progress({ studentId: "..." })]
[Tool returns: { progressByArea: {...}, recentObservations: [...] }]