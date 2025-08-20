import React, { useState, useEffect } from "react";
import { getChatMessages, saveMessage } from "../services/chatService";
import { auth } from "../firebase";
import Sidebar from "../components/Sidebar";
import { runGemini } from "../api/geminiApi";

export default function Chatbot() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // fetch messages when chat changes
  useEffect(() => {
    async function fetchMessages() {
      const user = auth.currentUser;
      if (user && selectedChat) {
        const msgs = await getChatMessages(user.uid, selectedChat);
        setMessages(msgs);
      }
    }
    fetchMessages();
  }, [selectedChat]);

  // handle send message
  const handleSend = async () => {
    if (!input.trim()) return;
    const user = auth.currentUser;
    if (!user || !selectedChat) return;

    const text = input.trim();
    setInput("");
    setLoading(true);

    // 1. save user message
    await saveMessage(user.uid, selectedChat, "user", text);
    setMessages((prev) => [...prev, { role: "user", text, id: Date.now() }]);

    // 2. get AI response
  const aiReply = await runGemini(selectedChat, text);
    // 3. save AI reply
    await saveMessage(user.uid, selectedChat, "assistant", aiReply);
    setMessages((prev) => [...prev, { role: "assistant", text: aiReply, id: Date.now() + 1 }]);

    setLoading(false);
  };

  return (
    <div className="chat-container" style={{ display: "flex" }}>
      {/* Sidebar with chats */}
      <Sidebar onSelectChat={setSelectedChat} />

      {/* Chat area */}
      <div className="chatbox" style={{ marginLeft: "20px", flex: 1 }}>
        {selectedChat ? (
          <div>
          
            <div className="messages" style={{ minHeight: "300px", border: "1px solid #ccc", padding: "10px" }}>
              {messages.map((msg) => (
                <p key={msg.id}>
                  <strong>{msg.role}:</strong> {msg.text}
                </p>
              ))}
              {loading && <p><em>AI is typing...</em></p>}
            </div>

            {/* input + send */}
            <div style={{ marginTop: "10px" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                style={{ width: "80%", padding: "8px" }}
              />
              <button onClick={handleSend} style={{ padding: "8px 12px", marginLeft: "5px" }}>
                Send
              </button>
            </div>
          </div>
        ) : (
          <p>Select a chat or create a new one to start messaging</p>
        )}
      </div>
    </div>
  );
}
