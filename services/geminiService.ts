import { GoogleGenAI, Type, Schema } from "@google/genai";
import { InvoiceData, TaxCategory } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    vendorName: { type: Type.STRING },
    invoiceDate: { type: Type.STRING, description: "YYYY-MM-DD format" },
    totalAmount: { type: Type.NUMBER },
    currency: { type: Type.STRING },
    description: { type: Type.STRING },
    taxCategory: { type: Type.STRING, enum: Object.values(TaxCategory) },
    confidenceScore: { type: Type.NUMBER },
    isInvoice: { type: Type.BOOLEAN, description: "True if the image looks like an invoice/receipt" }
  },
  required: ["vendorName", "totalAmount", "taxCategory", "isInvoice"]
};

export const analyzeInvoiceImage = async (file: File): Promise<Partial<InvoiceData>> => {
  try {
    const base64Data = await fileToBase64(file);
    
    // Determine mime type (Gemini supports standard image/pdf types)
    const mimeType = file.type;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: "Extract data from this invoice."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Low temperature for factual extraction
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);

    if (!data.isInvoice) {
       throw new Error("Document does not appear to be a valid invoice.");
    }

    return {
      vendorName: data.vendorName || "Unknown Vendor",
      invoiceDate: data.invoiceDate || new Date().toISOString().split('T')[0],
      totalAmount: data.totalAmount || 0,
      currency: data.currency || "USD",
      description: data.description || "No description",
      taxCategory: data.taxCategory as TaxCategory || TaxCategory.UNCATEGORIZED,
      confidenceScore: data.confidenceScore || 0,
    };

  } catch (error) {
    console.error("Error analyzing invoice:", error);
    throw error;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};
