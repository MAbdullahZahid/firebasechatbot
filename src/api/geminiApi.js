//api/geminiApi.js

// src/api/geminiApi.js
import app from "../firebase"; 
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Create a `GenerativeModel` instance with a model that supports your use case
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

export async function runGemini(prompt) {
  try {
    // To generate text output, call generateContent with the text input
    const result = await model.generateContent(prompt);

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Something went wrong!";
  }
}
