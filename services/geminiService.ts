
import { GoogleGenAI, Type } from "@google/genai";
import { FieldType, FormTemplate } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateFormFromAI = async (prompt: string): Promise<Partial<FormTemplate>> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a structured form based on this request: "${prompt}". 
               The form should have a title, a brief description, and a list of fields. 
               Fields can be of types: text, number, date, select, checkbox, textarea.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          fields: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                type: { 
                  type: Type.STRING, 
                  description: "One of: text, number, date, select, checkbox, textarea"
                },
                required: { type: Type.BOOLEAN },
                placeholder: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Required only if type is select"
                }
              },
              required: ["label", "type", "required"]
            }
          }
        },
        required: ["title", "description", "fields"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Failed to generate form structure.");
  }
};
