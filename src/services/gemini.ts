import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY || "";
  return key.replace(/['"]/g, '').trim();
};

export async function detectScrap(base64Image: string) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("AI API Key is missing. Please configure GEMINI_API_KEY in your Secrets or .env file.");
  }

  // Create instance right before use to ensure latest key is used
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  // Extract mimeType from base64 string
  const mimeTypeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
  const imageData = base64Image.split(",")[1];

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageData,
              },
            },
            {
              text: "Analyze this image of scrap material. Identify the type of material from this list: [Newspaper, Iron, Copper, PET Bottles, E-Waste, Cardboard, Glass]. Estimate its weight in kg. If multiple items, list them. Return as JSON with an 'items' array containing objects with 'type', 'estimated_weight_kg', and 'confidence'.",
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

    if (!response.text) {
      throw new Error("AI returned an empty response.");
    }

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
