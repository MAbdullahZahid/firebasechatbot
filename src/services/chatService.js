import { 
  collection, 
  addDoc, 
  updateDoc,
  doc,
  serverTimestamp, 
  getDocs, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "../firebase";

// Helper to validate uid and chatId
function validateId(id, name) {
  if (!id || typeof id !== "string") {
    throw new Error(`${name} is missing or invalid`);
  }
}

// Create a new chat
export async function createChat(uid, title = "New Chat") {
  validateId(uid, "User UID");
  const chatRef = await addDoc(collection(db, "users", uid, "chats"), {
    title,
    createdAt: serverTimestamp(),
  });
  return chatRef.id;
}

// Update chat title
export async function updateChatTitle(uid, chatId, newTitle) {
  validateId(uid, "User UID");
  validateId(chatId, "Chat ID");

  const chatRef = doc(db, "users", uid, "chats", chatId);
  await updateDoc(chatRef, { title: newTitle });
}

// Save message inside a chat
export async function saveMessage(uid, chatId, role, text) {
  validateId(uid, "User UID");
  validateId(chatId, "Chat ID");

  const messagesRef = collection(db, "users", uid, "chats", chatId, "messages");
  await addDoc(messagesRef, {
    role,
    text,
    createdAt: serverTimestamp(),
  });
}

// Get all chats for a user
export async function getUserChats(uid) {
  validateId(uid, "User UID");

  const chatsRef = collection(db, "users", uid, "chats");
  const q = query(chatsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Get all messages inside a chat
export async function getChatMessages(uid, chatId) {
  validateId(uid, "User UID");
  validateId(chatId, "Chat ID");

  const messagesRef = collection(db, "users", uid, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
