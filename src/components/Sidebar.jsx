import React, { useEffect, useState } from "react";
import { getUserChats, createChat } from "../services/chatService"; // ✅ also import createChat
import { auth } from "../firebase";

export default function Sidebar({ onSelectChat , refreshKey}) {
  const [chats, setChats] = useState([]);

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


  // ✅ handle New Chat
  const handleNewChat = async () => {
    const user = auth.currentUser;
    if (user) {
      const newChatId = await createChat(user.uid); // pass uid
      await fetchChats(); // refresh sidebar
      onSelectChat(newChatId); // directly open new chat
    }
  };

  return (
    <div className="sidebar">
      <h3>Your Chats</h3>
      <button onClick={handleNewChat}>➕ New Chat</button>
      <ul>
        {chats.map((chat) => (
          <li
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            style={{ cursor: "pointer" }}
          >
            {chat.title || "Untitled Chat"}
          </li>
        ))}
      </ul>
    </div>
  );
}
