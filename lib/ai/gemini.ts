import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""

if (!apiKey && typeof window !== "undefined") {
  console.warn("Gemini API key not found. AI features will not work. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file.")
}

// Initialize Gemini client
export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// Get the generative model
// Using gemini-1.5-flash which is stable and widely available
export function getGeminiModel() {
  if (!genAI) {
    throw new Error("Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file.")
  }

  // Use gemini-1.5-flash - the stable, fast model that's widely available
  // If you have access to gemini-2.0, you can change this to "gemini-2.0-flash-exp"
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
}

