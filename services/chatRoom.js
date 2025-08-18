import { db } from "../config/firebaseConfig";
import { collection, query, where, getDocs, addDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";

// Find or create a chatroom between two users
export const getOrCreateChatRoom = async (currentUid, otherUid) => {
  const chatRoomsRef = collection(db, "chatRooms");
  const q = query(chatRoomsRef, where("participants", "array-contains", currentUid));
  const querySnapshot = await getDocs(q);

  let existingRoom = null;
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.participants.includes(otherUid)) {
      existingRoom = { id: docSnap.id, ...data };
    }
  });

  if (existingRoom) {
    return existingRoom.id;
  }

  // create new chatroom
  const newRoomRef = await addDoc(chatRoomsRef, {
    participants: [currentUid, otherUid],
    lastMessage: "",
    lastMessageSender: null,
    lastMessageReadBy: [],
    updatedAt: serverTimestamp(),
  });

  return newRoomRef.id;
};
