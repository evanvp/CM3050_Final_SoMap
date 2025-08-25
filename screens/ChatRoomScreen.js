import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';

export default function ChatRoomScreen({ route }) {
  const { chatRoomId } = route.params;
  const currentUser = auth.currentUser;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [otherUser, setOtherUser] = useState(null);

  // Fetch chat messages and mark read
  useEffect(() => {
    const q = query(
      collection(db, "chatRooms", chatRoomId, "messages"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    // Mark message as read after enter the room
    const markRead = async () => {
      const roomRef = doc(db, "chatRooms", chatRoomId);
      await updateDoc(roomRef, {
        lastMessageReadBy: arrayUnion(currentUser.uid),
      });
    };
    markRead();

    return unsubscribe;
  }, [chatRoomId]);

  // Fetch the other participant's user info
  useEffect(() => {
    const fetchOtherUser = async () => {
      try {
        const roomRef = doc(db, "chatRooms", chatRoomId);
        const roomSnap = await getDoc(roomRef);
        if (roomSnap.exists()) {
          const roomData = roomSnap.data();
          const otherUserId = roomData.participants.find((uid) => uid !== currentUser.uid);
          if (otherUserId) {
            const userSnap = await getDoc(doc(db, "users", otherUserId));
            if (userSnap.exists()) {
              setOtherUser({ id: otherUserId, ...userSnap.data() });
            }
          }
        }
      } catch (err) {
        console.error("Error fetching other user:", err);
      }
    };

    fetchOtherUser();
  }, [chatRoomId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    await addDoc(collection(db, "chatRooms", chatRoomId, "messages"), {
      text: input,
      senderId: currentUser.uid,
      createdAt: serverTimestamp(),
      readBy: [currentUser.uid],
    });

    await updateDoc(doc(db, "chatRooms", chatRoomId), {
      lastMessage: input,
      lastMessageSender: currentUser.uid,
      lastMessageReadBy: [currentUser.uid],
      updatedAt: serverTimestamp(),
    });

    setInput("");
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === currentUser.uid;
    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text style={{ color: isMe ? "white" : "black" }}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top bar with other user name */}
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>{otherUser?.name || "Chat"}</Text>
      </View>

      <FlatList
        inverted  
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10 }}
      />

      {/* Input area */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          multiline={true}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={{ color: "white", fontWeight: "bold" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },

  topBar: {
    padding: 15,
    backgroundColor: "#4a90e2",
    alignItems: "left",
  },
  topBarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10, 
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#4a90e2",
    borderRadius: 25,
    marginLeft: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  messageBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 12,
    maxWidth: "70%",
  },
  myMessage: {
    backgroundColor: "#4a90e2",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#eee",
    alignSelf: "flex-start",
  },
});
