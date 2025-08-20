// src/api/geminiApi.js
import app from "../firebase";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

// Store sessions per chatId
const sessions = {};

/**
 * Ensure a chat session exists for given chatId
 */
function getSession(chatId) {
  if (!sessions[chatId]) {
    sessions[chatId] = model.startChat({
      // You can set history here if you want to preload old messages
      history: [],
    });
  }
  return sessions[chatId];
}

/**
 * Run Gemini for a given chatId and prompt
 */
export async function runGemini(chatId, prompt) {
  try {
    const session = getSession(chatId);
    const result = await session.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Something went wrong!";
  }
}
