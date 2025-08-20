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
export async function generateChatTitle(firstMessage) {
  try {
    // Use a temporary session to avoid polluting main chat
    const tempSession = model.startChat({});

    const titlePrompt = `Summarize this chat into a maximum of 3 words for a title:\n\n"${firstMessage}"`;
    const result = await tempSession.sendMessage(titlePrompt);

    // Some Gemini responses may need .response[0].content[0].text() depending on SDK
    const text = await result.response.text();
    return text.trim() || "New Chat";
  } catch (error) {
    console.error("Gemini API Error (title):", error);
    return "New Chat";
  }
}
