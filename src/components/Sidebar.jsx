import React, { useEffect, useState } from "react";
import { getUserChats, createChat } from "../services/chatService";
import { auth } from "../firebase";

export default function Sidebar({onSelectChat, refreshKey, isSidebarOpen, toggleSidebar }) {
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
      onSelectChat(newChatId, true);
    
      if (window.innerWidth <= 768) {
        toggleSidebar();
      }
    }
  };

  const handleChatSelect = (chatId) => {
    setActiveChat(chatId);
    onSelectChat(chatId);
    // Close sidebar on mobile after selecting a chat
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
      
      <div className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-top">
            <h3>Your Chats</h3>
            <button className="close-sidebar-btn" onClick={toggleSidebar}>
              ✕
            </button>
          </div>
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
    </>
  );
}