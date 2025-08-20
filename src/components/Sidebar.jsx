import React, { useEffect, useState } from "react";
import { getUserChats, createChat } from "../services/chatService";
import { auth } from "../firebase";

export default function Sidebar({ onSelectChat, refreshKey }) {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  const fetchChats = async () => {
    const user = auth.currentUser;
    if (user) {
      const chatsData = await getUserChats(user.uid);
      setChats(chatsData);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    fetchChats();
  }, [refreshKey]);

  const handleNewChat = async () => {
    const user = auth.currentUser;
    if (user) {
      const newChatId = await createChat(user.uid);
      await fetchChats();
      setActiveChat(newChatId);
      onSelectChat(newChatId);
    }
  };

  const handleChatSelect = (chatId) => {
    setActiveChat(chatId);
    onSelectChat(chatId);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Your Chats</h3>
        <button className="new-chat-btn" onClick={handleNewChat}>
          + New Chat
        </button>
      </div>
      <div className="chat-list">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${activeChat === chat.id ? "active" : ""}`}
            onClick={() => handleChatSelect(chat.id)}
          >
            {chat.title || "Untitled Chat"}
          </div>
        ))}
      </div>
    </div>
  );
}