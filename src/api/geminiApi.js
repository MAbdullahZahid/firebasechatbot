  // src/api/geminiApi.js
  import app from "../firebase";
  import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
  const ai = getAI(app, { backend: new GoogleAIBackend() });
  const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });
  const chatSession = model.startChat({

  });

  export async function runGemini(prompt) {
    try {
      const result = await chatSession.sendMessage(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Something went wrong!";
    }
  }