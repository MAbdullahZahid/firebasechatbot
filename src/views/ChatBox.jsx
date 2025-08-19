import React, { useState, useEffect, useRef } from "react";
import { runGemini } from "../api/geminiApi";
import ReactMarkdown from "react-markdown";
import "../App.css";
import { Send, User } from 'react-feather';

const ChatBox = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when chat history changes
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    const userMessage = message;
    setMessage("");
    setIsLoading(true);

    setChatHistory((prev) => [...prev, { sender: "user", text: userMessage }]);

    try {
      const reply = await runGemini(userMessage);
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>AI Chat</h2>
        <div className="status-indicator">
          <span className={`status-dot ${isLoading ? 'loading' : 'active'}`}></span>
          {isLoading ? 'Thinking...' : 'Online'}
        </div>
      </div>
      
      <div className="chat-messages">
        {chatHistory.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>Ask AI anything!</p>
          </div>
        )}
        
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`message ${chat.sender === "user" ? "user-message" : "bot-message"}`}
          >
            <div className="message-sender">
              {chat.sender === "user" ? (
                <User size={16} className="sender-icon" />
              ) : (
                <div className="gemini-icon">AI</div>
              )}
            </div>
            <div className="message-content">
              <ReactMarkdown>{chat.text}</ReactMarkdown>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message bot-message">
            <div className="message-sender">
              <div className="gemini-icon">AI</div>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* This empty div is used for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          placeholder="Ask AI something..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="chat-input"
          disabled={isLoading}
        />
        <button 
          onClick={handleSend} 
          className="send-button"
          disabled={isLoading || !message.trim()}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;