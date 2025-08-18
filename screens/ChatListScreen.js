// screens/ChatListScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';


export default function ChatListScreen({ navigation }) {
    const [chatRooms, setChatRooms] = useState([]);
    const currentUser = auth.currentUser;

    useEffect(() => {
        if (!currentUser) return;
        const q = query(
        collection(db, "chatRooms"),
        where("participants", "array-contains", currentUser.uid),
        orderBy("updatedAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
        const rooms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setChatRooms(rooms);
        });

        return unsubscribe;
    }, []);

    // Handle sign out
    const handleLogout = async () => {
        try {
        if (currentUser) {
            await updateDoc(doc(db, 'users', currentUser.uid), { online: false });
        }
        await signOut(auth);
        navigation.replace('Login');
        } catch (error) {
        console.error("Logout error:", error.message);
        }
    };
  

    const renderItem = ({ item }) => {
        const isUnread =
        item.lastMessageSender !== currentUser.uid &&
        !item.lastMessageReadBy?.includes(currentUser.uid);

        return (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() =>
            navigation.navigate("ChatRoom", { chatRoomId: item.id })
            }
        >
            <Text style={{ fontWeight: isUnread ? "bold" : "normal", fontSize: 16 }}>
            {item.lastMessage || "New chat"}
            </Text>
        </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
        <FlatList
            data={chatRooms}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={<Text>No chats yet</Text>}
        />
        <View style={styles.bottomNav}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Ionicons name="home" size={30} color="black" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ChatList')}>
            <Ionicons name="chatbubbles" size={30} color="black" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person" size={30} color="black" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out" size={30} color="red" />
            </TouchableOpacity>
        </View>
        </View>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  chatItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: 'grey',
    },
});
