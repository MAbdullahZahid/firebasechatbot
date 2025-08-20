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
  const messagesEndRef = useRef(null); // ✅ ref for auto-scroll

  useEffect(() => {
    if (!selectedChat) return;
    setChatSession(startNewChat());
    fetchMessages();
  }, [selectedChat]);

  // Scroll to bottom whenever messages change
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
    <div className="chat-container" style={{ display: "flex", flexDirection: "row" }}>
      {/* Sidebar */}
      <Sidebar onSelectChat={setSelectedChat} refreshKey={refreshKey} />

      {/* Main Chatbox */}
      <div className="chatbox" style={{ marginLeft: "20px", flex: 1 }}>
        {/* User Info + Logout */}
        {auth.currentUser && (
          <div
            className="user-info"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
              borderBottom: "1px solid #ccc",
              paddingBottom: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={auth.currentUser.photoURL}
                alt={auth.currentUser.displayName}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  marginRight: "10px",
                }}
              />
              <span style={{ fontWeight: "bold" }}>
                {auth.currentUser.displayName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 12px",
                backgroundColor: "#f44336",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        )}

        {/* Messages */}
        <div
          className="messages"
          style={{
            minHeight: "300px",
            border: "1px solid #ccc",
            padding: "10px",
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              
            >
              <ReactMarkdown>{`**${msg.role}**: ${msg.text}`}</ReactMarkdown>
            </div>
          ))}
          {loading && <p><em>AI is typing...</em></p>}
          <div ref={messagesEndRef} /> {/* ✅ auto-scroll anchor */}
        </div>

        {/* Input */}
        <div style={{ marginTop: "10px", display: "flex", gap: "5px" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              resize: "none",
            }}
            rows={2}
          />
          <button
            onClick={handleSend}
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              backgroundColor: "#4CAF50",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
