import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { seedMentors } from "@/lib/verrier-seed";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { briefText } = await req.json();

    if (!briefText || typeof briefText !== "string") {
      return NextResponse.json(
        { error: "A valid 'briefText' string is required." },
        { status: 400 }
      );
    }

    const availableMentors = seedMentors.map(m => ({
      id: m.id,
      name: m.name,
      role: m.currentRole,
      industries: m.industries,
      expertise: m.expertise,
      stages: m.preferredStages
    }));

    const model = genAI.getGenerativeModel({
      model: "gemini-3.0-flash-preview",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `You are an expert accelerator program manager. Extract the program details from the provided brief. 
Also, select the most suitable mentors from the provided "Available Mentors" list based on the program's target industries, stages, and focus areas.

Return ONLY a valid JSON object matching this schema exactly:
{
  "name": "string",
  "type": "accelerator" | "incubator" | "grant" | "corporate-innovation" | "university" | "challenge",
  "description": "string",
  "targetStages": ["string"] (e.g. "idea", "pre-seed", "seed", "series-a", "series-b", "growth"),
  "targetIndustries": ["string"],
  "targetMarkets": ["string"],
  "criteriaWeights": { "stage": number, "industry": number, "traction": number, "team": number, "needs": number } (MUST sum to 100),
  "requiredDocuments": ["string"],
  "mentorIds": ["string"] (array of mentor IDs)
}

Available Mentors:
${JSON.stringify(availableMentors, null, 2)}

Program Brief:
${briefText}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Attempt to parse to ensure valid JSON before returning
    const parsedData = JSON.parse(text);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Error parsing program brief:", error);
    return NextResponse.json(
      { error: "Failed to extract program details." },
      { status: 500 }
    );
  }
}
