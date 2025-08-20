import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  getChatMessages,
  saveMessage,
  updateChatTitle,
} from "../services/chatService";
import { auth } from "../firebase";
import Sidebar from "../components/Sidebar";
import {
  startNewChat,
  runGemini,
  generateChatTitle,
} from "../api/geminiApi";
import { signOut } from "firebase/auth";

export default function Chatbot() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatSession, setChatSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!selectedChat) return;
    setChatSession(startNewChat());
    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function fetchMessages() {
    const user = auth.currentUser;
    if (user && selectedChat) {
      const msgs = await getChatMessages(user.uid, selectedChat);
      setMessages(msgs);
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return;
    const user = auth.currentUser;
    if (!user) return;

    const text = input.trim();
    setInput("");
    setLoading(true);

    let chatId = selectedChat;
    if (!chatId) {
      chatId = await startNewChat();
      setSelectedChat(chatId);
      setChatSession(startNewChat());
      setMessages([]);
    }

    await saveMessage(user.uid, chatId, "user", text);
    setMessages((prev) => [...prev, { role: "user", text, id: Date.now() }]);

    if (messages.length === 0) {
      try {
        const title = await generateChatTitle(chatSession, text);
        await updateChatTitle(user.uid, chatId, title || "New Chat");
        setRefreshKey((prev) => prev + 1);
      } catch (err) {
        console.error("Title generation failed:", err);
      }
    }

    let aiReply = "";
    try {
      aiReply = await runGemini(chatSession, text);
    } catch (err) {
      aiReply = "⚠️ Something went wrong.";
    }

    await saveMessage(user.uid, chatId, "assistant", aiReply);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: aiReply, id: Date.now() + 1 },
    ]);

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="chat-app">
      <Sidebar onSelectChat={setSelectedChat} refreshKey={refreshKey} />
      
      <div className="chat-main">
        {auth.currentUser && (
          <div className="user-header">
            <div className="user-info">
              <img
                src={auth.currentUser.photoURL}
                alt={auth.currentUser.displayName}
                className="user-avatar"
              />
              <span className="user-name">
                {auth.currentUser.displayName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        )}

        <div className="messages-container">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message message-${msg.role}`}
            >
              <div className="message-role">
                {msg.role === "user" ? "You" : "Assistant"}
              </div>
              <div className="message-content">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="typing-indicator">
              AI is thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="message-input"
              rows={1}
            />
            <button
              onClick={handleSend}
              className="send-btn"
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}