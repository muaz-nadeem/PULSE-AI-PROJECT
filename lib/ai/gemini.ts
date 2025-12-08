import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""

if (!apiKey && typeof window !== "undefined") {
  console.warn("Gemini API key not found. AI features will not work. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file.")
}

// Initialize Gemini client
export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// Get the generative model
// Using gemini-1.5-flash-latest which is the current recommended model
// If this doesn't work, check your API key permissions and ensure the Generative AI API is enabled
export function getGeminiModel() {
  if (!genAI) {
    throw new Error("Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file.")
  }
  
  // Try gemini-1.5-flash-latest (most current and widely available)
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) 
}

