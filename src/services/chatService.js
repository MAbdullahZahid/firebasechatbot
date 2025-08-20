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

// Create a new chat
export async function createChat(uid, title = "New Chat") {
  const chatRef = await addDoc(collection(db, "users", uid, "chats"), {
    title,
    createdAt: serverTimestamp(),
  });
  return chatRef.id;
}

// ✅ Update chat title later
export async function updateChatTitle(uid, chatId, newTitle) {
  const chatRef = doc(db, "users", uid, "chats", chatId);
  await updateDoc(chatRef, { title: newTitle });
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

export async function getUserChats(uid) {
  const chatsRef = collection(db, "users", uid, "chats");
  const q = query(chatsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getChatMessages(uid, chatId) {
  const messagesRef = collection(db, "users", uid, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));
  const querySnapshot = await getDocs(q);

  const messages = [];
  querySnapshot.forEach((doc) => {
    messages.push({ id: doc.id, ...doc.data() });
  });

  return messages;
}
