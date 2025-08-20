import React, { useState, useEffect, useRef } from "react";
import { runGemini } from "../api/geminiApi";
import ReactMarkdown from "react-markdown";
import "../App.css";
import { Send, User, LogOut } from "react-feather";
import { auth, signOut } from "../firebase";
import { useNavigate } from "react-router-dom";
import { createChat, saveMessage } from "../services/chatService";

const ChatBox = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

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
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      // If chat not yet created, create one
      let currentChatId = chatId;
      if (!currentChatId) {
        currentChatId = await createChat(uid, "AI Chat");
        setChatId(currentChatId);
      }

      // Save user message
      await saveMessage(uid, currentChatId, "user", userMessage);

      // Get AI reply
      const reply = await runGemini(userMessage);

      // Show reply in UI
      setChatHistory((prev) => [...prev, { sender: "gemini", text: reply }]);

      // Save AI message
      await saveMessage(uid, currentChatId, "ai", reply);

    } catch (error) {
      console.error("Send message failed:", error);
      setChatHistory((prev) => [
        ...prev,
        { sender: "gemini", text: "Error fetching response." },
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2><strong>AI Chat</strong></h2>

        <div className="chat-actions">
          <div className="status-indicator">
            <span className={`status-dot ${isLoading ? 'loading' : 'active'}`}></span>
            {isLoading ? 'Thinking...' : 'Online'}
          </div>

          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} /> Logout
          </button>
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
