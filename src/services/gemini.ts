import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function detectScrap(base64Image: string) {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1],
            },
          },
          {
            text: "Analyze this image of scrap material. Identify the type of material (e.g., Newspaper, Iron, Copper, PET Bottles, E-Waste) and estimate its weight in kg. If multiple items, list them. Return as JSON.",
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                estimated_weight_kg: { type: Type.NUMBER },
                confidence: { type: Type.NUMBER },
              },
              required: ["type", "estimated_weight_kg"],
            },
          },
        },
      },
    },
  });

  return JSON.parse(response.text);
}
