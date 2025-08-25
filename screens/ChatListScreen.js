import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';

export default function ChatListScreen({ navigation }) {
  const [chatRooms, setChatRooms] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const currentUser = auth.currentUser;
 
  // Query for rooms that current user participate in 
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const rooms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChatRooms(rooms);

      // Collect missing user IDs that has a chatroom with curretn user
      const missingIds = [];
      rooms.forEach((room) => {
        room.participants.forEach((uid) => {
          if (uid !== currentUser.uid && !userProfiles[uid]) {
            missingIds.push(uid);
          }
        });
      });

      if (missingIds.length > 0) {
        await fetchMissingProfiles(missingIds);
      }
    });

    return unsubscribe;
  }, [currentUser, userProfiles]);

  // Async function to fetch missing user profiles
  const fetchMissingProfiles = async (missingIds) => {
    const fetchedProfiles = [];

    for (const uid of missingIds) {
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          fetchedProfiles.push({ uid, ...snap.data() });
        } else {
          console.log('No profile found for', uid);
        }
      } catch (err) {
        console.error('Error fetching UID', uid, err);
      }
    }

    const profileMap = {};
    fetchedProfiles.forEach((p) => {
      if (p) profileMap[p.uid] = p;
    });

    setUserProfiles((prev) => ({ ...prev, ...profileMap }));
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), { online: false });
      }
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  const renderItem = ({ item }) => {
    const isUnread =
      item.lastMessageSender !== currentUser.uid &&
      !item.lastMessageReadBy?.includes(currentUser.uid);

    const otherUserId = item.participants.find((uid) => uid !== currentUser.uid);
    const otherUser = userProfiles[otherUserId];

    // render the room lists on UI
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('ChatRoom', { chatRoomId: item.id })}
      >
        {/* Left Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{otherUser?.avatar || '👤'}</Text>
        </View>

        {/* Right content */}
        <View style={styles.chatContent}>
          <Text style={styles.chatName}>{otherUser?.name || 'Unknown'}</Text>
          <Text
            style={[
              styles.chatMessage,
              isUnread && { fontWeight: 'bold', color: 'black' },
            ]}
            numberOfLines={1}
          >
            {item.lastMessage || 'New chat'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>No chats yet</Text>
        }
      />

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={30} color="grey" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ChatList')}>
          <Ionicons name="chatbubbles" size={30} color="#4a90e2" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person" size={30} color="grey" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out" size={30} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },

  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    backgroundColor: 'white',
    marginVertical: 2,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  avatar: {
    width: '20%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: { fontSize: 24 },

  chatContent: { width: '80%' },
  chatName: { fontSize: 16, marginBottom: 2, color: '#333' },
  chatMessage: { fontSize: 14, color: '#555' },

  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 0.5,
    borderColor: '#ccc',
  },
});
