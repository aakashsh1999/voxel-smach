
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { VoxelData } from "../types";

// Always initialize the client using a named parameter with process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateVoxelsFromImage(base64Image: string): Promise<VoxelData[]> {
  // Use gemini-3-pro-preview for complex spatial analysis and JSON generation from image input.
  const model = 'gemini-3-pro-preview';
  
  const prompt = `
    Analyze this image and convert it into a 3D voxel representation. 
    The grid size should be maximum 12x12x12 to ensure performance.
    Try to capture the main subject's shape and core colors.
    Return a JSON array of objects, each containing:
    - id (a unique string)
    - x, y, z (integers within the grid bounds)
    - color (hex string, e.g., "#FF0000")
    Focus on creating a recognizable 3D sculpture of the object in the image.
  `;

  try {
    // Correct content structure uses a single content object with a parts array.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image.split(',')[1] || base64Image
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              x: { type: Type.INTEGER },
              y: { type: Type.INTEGER },
              z: { type: Type.INTEGER },
              color: { type: Type.STRING }
            },
            required: ["id", "x", "y", "z", "color"]
          }
        }
      }
    });

    // Access the text property directly (not as a method).
    const text = response.text?.trim();
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as VoxelData[];
  } catch (error) {
    console.error("Voxel generation failed:", error);
    throw error;
  }
}
