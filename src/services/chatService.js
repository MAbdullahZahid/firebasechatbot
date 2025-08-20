// services/chatServices.js
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";

// Create a new chat when user starts messaging
export async function createChat(uid, title = "New Chat") {
  const chatRef = await addDoc(collection(db, "users", uid, "chats"), {
    title,
    createdAt: serverTimestamp(),
  });
  return chatRef.id;
}

// Save message inside a chat
export async function saveMessage(uid, chatId, role, text) {
  const messagesRef = collection(db, "users", uid, "chats", chatId, "messages");
  await addDoc(messagesRef, {
    role,
    text,
    createdAt: serverTimestamp(),
  });
}
