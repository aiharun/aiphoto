import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not defined");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Helper to extract base64 data and mimeType from a Data URL
 */
const parseDataUrl = (dataUrl: string) => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid data URL format");
  }
  return {
    mimeType: matches[1],
    data: matches[2],
  };
};

export interface GenerateResponse {
  text?: string;
  image?: string; // Base64 Data URL
}

/**
 * Sends an image and a text prompt to Gemini 2.5 Flash Image.
 * It handles both "analysis" (text response) and "editing" (image response).
 */
export const generateEditOrDescription = async (
  imageBase64: string,
  prompt: string
): Promise<GenerateResponse> => {
  try {
    const ai = getAiClient();
    const { mimeType, data } = parseDataUrl(imageBase64);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    let resultText = "";
    let resultImage = "";

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          resultText += part.text;
        }
        if (part.inlineData && part.inlineData.data) {
          // Construct data URL from raw base64
          const mime = part.inlineData.mimeType || "image/png";
          resultImage = `data:${mime};base64,${part.inlineData.data}`;
        }
      }
    }

    return {
      text: resultText,
      image: resultImage || undefined,
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};