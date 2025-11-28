import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// Initialize the client with the API key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to strip the data URL prefix (e.g., "data:image/png;base64,")
 */
const stripBase64Prefix = (base64Str: string): string => {
  return base64Str.replace(/^data:image\/\w+;base64,/, "");
};

/**
 * Helper to determine mime type from base64 string header
 */
const getMimeType = (base64Str: string): string => {
  const match = base64Str.match(/^data:([^;]+);/);
  return match ? match[1] : "image/png";
};

export const getPhotoSuggestions = async (base64Image: string): Promise<string[]> => {
  try {
    const cleanBase64 = stripBase64Prefix(base64Image);
    const mimeType = getMimeType(base64Image);

    // Use gemini-2.5-flash for analysis as it supports JSON schema and multimodal input
    const modelId = "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: "Analyze this image and provide a list of 3 short, creative editing prompts to improve or transform it. Example: ['Make it a sunset', 'Add a cyberpunk filter'].",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Error getting suggestions:", error);
    return ["Make it black and white", "Make the colors more vibrant", "Add a futuristic glow"];
  }
};

export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
  const cleanBase64 = stripBase64Prefix(base64Image);
  const mimeType = getMimeType(base64Image);
  
  // Using gemini-2.5-flash-image for editing as per guidelines for general image editing
  const modelId = "gemini-2.5-flash-image";

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Iterate to find the image part
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image generated");
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};