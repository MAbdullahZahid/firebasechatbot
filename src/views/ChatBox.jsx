import React, { useState } from "react";
import { runGemini } from "../api/geminiApi";
import ReactMarkdown from "react-markdown";
import "../App.css";

const ChatBox = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]); // store previous messages
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return; // prevent empty queries
    const userMessage = message;
    setMessage(""); // clear input field
    setIsLoading(true);

    // Add user message to chat
    setChatHistory((prev) => [...prev, { sender: "user", text: userMessage }]);

    try {
      const reply = await runGemini(userMessage);

      // Add Gemini response
      setChatHistory((prev) => [...prev, { sender: "gemini", text: reply }]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "gemini", text: "⚠️ Error fetching response." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div>
      <div>
        {chatHistory.map((chat, index) => (
          <p
            key={index}
            className={chat.sender === "user" ? "user-msg" : "bot-msg"}
          >
            <ReactMarkdown>{chat.text}</ReactMarkdown>
          </p>
        ))}

        {isLoading && <div className="loader"></div>}
      </div>

      <input
        type="text"
        placeholder="Ask Gemini..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default ChatBox;
