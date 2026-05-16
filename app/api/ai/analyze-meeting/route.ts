import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { seedRelationships } from "@/lib/verrier-seed";
import type { ActionItem, Meeting } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Request body must be an object" },
      { status: 400 }
    );
  }

  const b = body as Record<string, unknown>;
  const { relationshipId, date, durationMinutes, rawNotes, submittedBy } = b;

  // Validation
  if (!relationshipId || typeof relationshipId !== "string") {
    return NextResponse.json({ error: "relationshipId is required" }, { status: 400 });
  }
  if (!date || typeof date !== "string") {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }
  if (typeof durationMinutes !== "number" || durationMinutes <= 0) {
    return NextResponse.json({ error: "durationMinutes must be a positive number" }, { status: 400 });
  }
  if (typeof rawNotes !== "string" || rawNotes.trim().length < 50) {
    return NextResponse.json({ error: "rawNotes must be at least 50 characters" }, { status: 400 });
  }
  if (submittedBy !== "admin" && submittedBy !== "mentor") {
    return NextResponse.json({ error: "submittedBy must be 'admin' or 'mentor'" }, { status: 400 });
  }

  const relationship = seedRelationships.find((r) => r.id === relationshipId);
  if (!relationship) {
    return NextResponse.json({ error: "Relationship not found" }, { status: 404 });
  }

  const meetingId = `meet-local-${Date.now()}`;

  // Deterministic Fallback Response
  const fallbackResponse = {
    meetingId,
    aiSummary: "Meeting notes received. AI analysis pending or unavailable.",
    actionItems: [] as ActionItem[],
    signal: "neutral" as Meeting["signal"],
    signalReason: "AI analysis fallback triggered.",
    healthScoreDelta: 0,
    newHealthScore: relationship.healthScore,
    watchPoints: [] as string[],
  };

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
Analyze the following mentor meeting notes and provide a structured assessment of the relationship health.

RELATIONSHIP CONTEXT:
- Mentor-Startup Pair: ${relationship.id}
- Current Health Score: ${relationship.healthScore} / 100
- Current Trend: ${relationship.healthTrend}

MEETING DATA:
- Date: ${date}
- Duration: ${durationMinutes} minutes
- Notes: "${rawNotes.trim()}"

TASK:
1. Summarize the meeting in 2-3 concise sentences.
2. Extract 2-5 actionable items (tasks) for the founder or mentor.
3. Assess the "signal" of the meeting (positive, neutral, or negative).
4. Determine a health score delta (-15 to +15) based on the progress, engagement, and risks discussed.
5. Identify any specific "watch points" or concerns.

RESPONSE FORMAT (JSON):
{
  "aiSummary": "string",
  "actionItems": [
    { "task": "string", "owner": "founder" | "mentor", "status": "pending", "dueDate": "YYYY-MM-DD" }
  ],
  "signal": "positive" | "neutral" | "negative",
  "signalReason": "string",
  "healthScoreDelta": number,
  "watchPoints": ["string"]
}

Rules:
- healthScoreDelta must be an integer between -15 and 15.
- Overall tone should be professional and objective.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    let data: unknown;
    
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("analyze-meeting: JSON parse failed", responseText);
      return NextResponse.json(fallbackResponse);
    }

    if (typeof data !== "object" || data === null) {
      return NextResponse.json(fallbackResponse);
    }

    const d = data as Record<string, unknown>;

    // Normalize and validate
    const rawSignal = (typeof d.signal === "string" && ["Positive", "Neutral", "Friction detected"].includes(d.signal))
      ? d.signal
      : "Neutral";
    
    // Support lowercase fallbacks from Gemini
    let signal = rawSignal as Meeting["signal"];
    if (typeof d.signal === "string" && !["Positive", "Neutral", "Friction detected"].includes(d.signal)) {
      const lower = d.signal.toLowerCase();
      if (lower === "positive") signal = "Positive";
      else if (lower === "neutral") signal = "Neutral";
      else if (lower === "negative" || lower.includes("friction")) signal = "Friction detected";
    }
      
    const delta = typeof d.healthScoreDelta === "number" 
      ? clamp(d.healthScoreDelta, -15, 15)
      : 0;

    const actionItems: ActionItem[] = Array.isArray(d.actionItems)
      ? d.actionItems.map((item: unknown) => {
          const i = item as Record<string, unknown>;
          
          // Map founder to startup for ActionItemOwner compatibility
          let owner: ActionItem["owner"] = "startup";
          if (typeof i.owner === "string") {
            const lower = i.owner.toLowerCase();
            if (lower === "mentor") owner = "mentor";
            else if (lower === "founder" || lower === "startup") owner = "startup";
          }

          return {
            task: typeof i.task === "string" ? i.task : "Unknown task",
            owner,
            dueDate: typeof i.dueDate === "string" ? i.dueDate : null,
            completed: false,
            completedAt: null,
          };
        })
      : [];

    const watchPoints = Array.isArray(d.watchPoints)
      ? d.watchPoints.filter((wp): wp is string => typeof wp === "string")
      : [];

    const newHealthScore = clamp(relationship.healthScore + delta, 0, 100);

    return NextResponse.json({
      meetingId,
      aiSummary: typeof d.aiSummary === "string" ? d.aiSummary : fallbackResponse.aiSummary,
      actionItems,
      signal,
      signalReason: typeof d.signalReason === "string" ? d.signalReason : fallbackResponse.signalReason,
      healthScoreDelta: delta,
      newHealthScore,
      watchPoints,
    });

  } catch (error) {
    console.error("analyze-meeting: Gemini call failed", error);
    return NextResponse.json(fallbackResponse);
  }
}
