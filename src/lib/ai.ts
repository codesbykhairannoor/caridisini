import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateProductContent(title: string, rawDescription: string) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an expert E-commerce Copywriter for an affiliate store called "CariDisni".
    Your task is to take a product's title and its raw description, then refine them for high conversion.

    Product Title: "${title}"
    Raw Description: "${rawDescription}"

    Please provide the result in the following JSON format only:
    {
      "categoryName": "A concise and accurate category for this product (max 3 words)",
      "polishedDescription": "A professional, persuasive, and easy-to-read description in Indonesian. Focus on benefits and quality. Use bullet points if necessary."
    }

    Strict Rules:
    1. Respond ONLY with the JSON object.
    2. Category should be clear and clean (e.g., "Perawatan Wajah", "Sepatu Pria", "Alat Masak").
    3. The description must be in Indonesian.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (handling potential markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response");
  } catch (error: any) {
    console.error("AI Generation Error:", error.message);
    throw error;
  }
}
