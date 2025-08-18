import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet} from 'react-native';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, arrayUnion} from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';

export default function ChatRoomScreen({ route }) {
  const { chatRoomId } = route.params;
  const currentUser = auth.currentUser;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "chatRooms", chatRoomId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    // mark as read
    const markRead = async () => {
      const roomRef = doc(db, "chatRooms", chatRoomId);
      await updateDoc(roomRef, {
        lastMessageReadBy: arrayUnion(currentUser.uid),
      });
    };
    markRead();

    return unsubscribe;
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
      lastMessageReadBy: [currentUser.uid], // reset read to only sender
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
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10 }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={{ color: "white" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    marginLeft: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  messageBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: "70%",
  },
  myMessage: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#eee",
    alignSelf: "flex-start",
  },
});
