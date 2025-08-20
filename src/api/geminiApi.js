import app from "../firebase";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

export function startNewChat() {
  return model.startChat({});
}

export async function runGemini(chatSession, prompt) {
  try {
    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Something went wrong!";
  }
}

// Generate title from first user message
export async function generateChatTitle(chatSession, firstMessage) {
  try {
    const titlePrompt = `Summarize this chat into max 3 words title:\n\n"${firstMessage}"`;
    const result = await chatSession.sendMessage(titlePrompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error (title):", error);
    return "New Chat";
  }
}
