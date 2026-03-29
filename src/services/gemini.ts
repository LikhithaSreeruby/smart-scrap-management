import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
  // Try multiple sources in order of preference
  // Use a direct string check first as Vite will replace these
  const key = import.meta.env.VITE_GEMINI_API_KEY || 
              (typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : "") ||
              "";
  
  // Clean the key (remove quotes, whitespace, and check for common placeholders)
  const cleanedKey = key.replace(/['"]/g, '').trim();
  
  // Filter out common "invalid" strings that might be injected by build tools
  if (!cleanedKey || 
      cleanedKey === "undefined" || 
      cleanedKey === "null" || 
      cleanedKey === "[object Object]" ||
      cleanedKey === "TODO_KEYHERE" ||
      cleanedKey === "MY_GEMINI_API_KEY" ||
      cleanedKey.includes("YOUR_API_KEY")) {
    console.warn("GEMINI_API_KEY is not set or is a placeholder. AI detection will fail.");
    return "";
  }
  
  // Safe logging for diagnostics
  if (cleanedKey) {
    console.log(`Gemini API Key detected: ${cleanedKey.substring(0, 4)}...${cleanedKey.substring(cleanedKey.length - 4)} (length: ${cleanedKey.length})`);
    if (!cleanedKey.startsWith("AIza")) {
      console.warn("Warning: The Gemini API Key does not start with 'AIza'. It might be incorrect.");
    }
  } else {
    console.error("Gemini API Key is missing!");
  }
  return cleanedKey;
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
    if (error.message?.includes("API key not valid") || error.message?.includes("invalid API key")) {
      const apiKey = getApiKey();
      const keySnippet = apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : "None";
      throw new Error(`Invalid Gemini API Key (${keySnippet}). Please ensure you have a valid key from Google AI Studio in your Secrets.`);
    }
    throw error;
  }
}
