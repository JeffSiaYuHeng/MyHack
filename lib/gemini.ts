import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function analyzeWithGemini(input: string, outputSchema?: string): Promise<unknown> {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  
  const prompt = outputSchema 
    ? `${input}\n\nReturn the output in this JSON format: ${outputSchema}`
    : input;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { 
      responseMimeType: "application/json" 
    }
  });

  try {
    return JSON.parse(result.response.text());
  } catch {
    console.error("Failed to parse AI response as JSON:", result.response.text());
    return { error: "Failed to parse AI response", raw: result.response.text() };
  }
}

// Keep the simple version for compatibility if needed
export async function generateContent(prompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
