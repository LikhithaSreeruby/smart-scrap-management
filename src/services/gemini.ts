import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn("GEMINI_API_KEY is not set. AI detection will fail.");
  }
  return key || "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export async function detectScrap(base64Image: string) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("AI API Key is missing. Please configure GEMINI_API_KEY.");
  }

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
              text: "Analyze this image of scrap material. Identify the type of material (e.g., Newspaper, Iron, Copper, PET Bottles, E-Waste, Cardboard, Glass) and estimate its weight in kg. If multiple items, list them. Return as JSON with an 'items' array containing objects with 'type', 'estimated_weight_kg', and 'confidence'.",
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
    if (error.message?.includes("API key not valid")) {
      throw new Error("Invalid Gemini API Key. Please check your configuration.");
    }
    throw error;
  }
}
