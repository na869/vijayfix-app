import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const diagnoseIssue = async (base64Image: string): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: "You are an expert appliance technician. Identify this appliance and diagnose the potential issue based on the visual evidence. If no specific issue is visible, list common problems for this appliance type. Keep it brief (under 50 words) and helpful for a quote estimation."
          }
        ]
      }
    });

    return response.text || "Could not analyze image. Please provide details manually.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI Diagnosis unavailable. Please describe the issue.";
  }
};