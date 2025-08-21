// import app from "../firebase";
// import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

// const ai = getAI(app, { backend: new GoogleAIBackend() });
// const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

// export function startNewChat() {
//   return model.startChat({});
// }

// export async function runGemini(chatSession, prompt) {
//   try {
//     const result = await chatSession.sendMessage(prompt);
//     return result.response.text();
//   } catch (error) {
//     console.error("Gemini API Error:", error);
//     return "Something went wrong!";
//   }
// }

// // Generate title from first user message
// export async function generateChatTitle(firstMessage) {
//   try {
//     // Use a temporary session to avoid polluting main chat
//     const tempSession = model.startChat({});

//     const titlePrompt = `Summarize this chat into a maximum of 3 words for a title:\n\n"${firstMessage}"`;
//     const result = await tempSession.sendMessage(titlePrompt);

//     // Some Gemini responses may need .response[0].content[0].text() depending on SDK
//     const text = await result.response.text();
//     return text.trim() || "New Chat";
//   } catch (error) {
//     console.error("Gemini API Error (title):", error);
//     return "New Chat";
//   }
// }


const GEMINI_API_KEY = import.meta.env.VITE_Gemini_API_Key;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// Helper function to call Gemini REST API
async function callGemini(model, prompt, history = []) {
  try {
    const response = await fetch(
      `${BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            ...history,
            { role: "user", parts: [{ text: prompt }] },
          ],
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    return { text, fullResponse: data };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Something went wrong!", fullResponse: null };
  }
}

/**
 * Start a new chat session (like model.startChat in Firebase SDK)
 */
export function startNewChat() {
  return {
    history: [],
    async sendMessage(prompt) {
      const result = await callGemini("gemini-2.0-flash", prompt, this.history);

      // keep track of conversation like Firebase SDK
      this.history.push({ role: "user", parts: [{ text: prompt }] });
      this.history.push({ role: "model", parts: [{ text: result.text }] });

      return {
        response: {
          text: () => result.text, // mimic Firebase SDK .response.text()
        },
      };
    },
  };
}


export async function runGemini(chatSession, prompt) {
  try {
    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error (runGemini):", error);
    return "Something went wrong!";
  }
}

export async function generateChatTitle(firstMessage) {
  try {
    // Temporary "chat" like before
    const tempSession = startNewChat();

    const titlePrompt = `Summarize this chat into a maximum of 3 words for a title:\n\n"${firstMessage}"`;
    const result = await tempSession.sendMessage(titlePrompt);

    const text = await result.response.text();
    return text.trim() || "New Chat";
  } catch (error) {
    console.error("Gemini API Error (title):", error);
    return "New Chat";
  }
}
