import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { GeminiMessage, GeminiResponse } from './types';
import { logAIEvent, logAIError } from './logger';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Safety settings to allow productivity-related content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Calls the Gemini API with the provided prompt and optional conversation history.
 * 
 * @param prompt - The user's message or request
 * @param systemInstruction - Optional system-level instruction for the model
 * @param conversationHistory - Optional array of previous messages for context
 * @returns GeminiResponse with text and usage information
 */
export async function callGemini(
  prompt: string,
  systemInstruction?: string,
  conversationHistory?: GeminiMessage[]
): Promise<GeminiResponse> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const startTime = Date.now();
  
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash', // Using flash for faster responses, can upgrade to pro
      systemInstruction: systemInstruction,
      safetySettings,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    let result;
    
    if (conversationHistory && conversationHistory.length > 0) {
      // Use chat mode for conversations
      const chat = model.startChat({
        history: conversationHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.parts }],
        })),
      });
      result = await chat.sendMessage(prompt);
    } else {
      // Use simple generation for single prompts
      result = await model.generateContent(prompt);
    }

    const response = result.response;
    const text = response.text();
    const latency = Date.now() - startTime;

    logAIEvent('gemini_call_success', {
      latencyMs: latency,
      promptLength: prompt.length,
      responseLength: text.length,
      promptTokens: response.usageMetadata?.promptTokenCount || 0,
      completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
    });

    return {
      text,
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
      },
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    logAIError(error as Error, { 
      operation: 'callGemini',
      latencyMs: latency,
      promptLength: prompt.length,
    });
    throw new Error(`Gemini API call failed: ${(error as Error).message}`);
  }
}

/**
 * Calls Gemini expecting a JSON response. Automatically parses and validates the output.
 * 
 * @param prompt - The prompt requesting JSON output
 * @param systemInstruction - Optional system instruction
 * @returns Parsed JSON object
 */
export async function callGeminiJSON<T>(
  prompt: string,
  systemInstruction?: string
): Promise<T> {
  const response = await callGemini(prompt, systemInstruction);
  
  try {
    // Try to extract JSON from the response
    let jsonText = response.text.trim();
    
    // Handle markdown code blocks
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7);
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3);
    }
    
    jsonText = jsonText.trim();
    
    const parsed = JSON.parse(jsonText) as T;
    return parsed;
  } catch (parseError) {
    logAIError(parseError as Error, {
      operation: 'callGeminiJSON',
      rawResponse: response.text.slice(0, 500),
    });
    throw new Error(`Failed to parse Gemini response as JSON: ${(parseError as Error).message}`);
  }
}

/**
 * Validates that the Gemini API key is configured.
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

