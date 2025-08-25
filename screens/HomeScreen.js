import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Modal } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, getDocs, collection } from 'firebase/firestore';
import { getOrCreateChatRoom } from "../services/chatRoom";

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [otherUsers, setOtherUsers] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const locationInterval = useRef(null);
  const fetchInterval = useRef(null);

  const currentUser = auth.currentUser;

  // Request location permission and set initial location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  // Update user location in Firestore periodically
  useEffect(() => {
    if (!currentUser) return;

    const updateUserLocation = async () => {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      await updateDoc(doc(db, 'users', currentUser.uid), {
        location: { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
      });
    };

    updateUserLocation();
    locationInterval.current = setInterval(updateUserLocation, 5000);

    return () => clearInterval(locationInterval.current);
  }, []);

  // Fetch other online users periodically
  useEffect(() => {
    if (!currentUser) return;

    const fetchOtherUsers = async () => {
      const UsersData = await getDocs(collection(db, 'users'));
      const onlineUsers = [];
      UsersData.forEach((docSnap) => {
        if (docSnap.id !== currentUser.uid) {
          const data = docSnap.data();
          if (data.online && data.location) {
            onlineUsers.push({ id: docSnap.id, ...data });
          }
        }
      });
      setOtherUsers(onlineUsers);
    };

    fetchOtherUsers();
    fetchInterval.current = setInterval(fetchOtherUsers, 2000);

    return () => clearInterval(fetchInterval.current);
  }, []);

  // Toggle online/offline
  const toggleOnline = async (value) => {
    setIsOnline(value);
    if (currentUser) {
      await updateDoc(doc(db, 'users', currentUser.uid), { online: value });
    }
  };

  // Logout
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

  // Start chat
  const handleStartConversation = async (user) => {
    try {
      const currentUserId = auth.currentUser.uid;
      const chatRoomId = await getOrCreateChatRoom(currentUserId, user.id);

      navigation.navigate("ChatRoom", { chatRoomId });
      setSelectedUser(null);
    } catch (err) {
      console.error("Error starting conversation:", err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top bar for Toggle Online/Offline mode */}
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>Map</Text>
        <View style={styles.onlineToggle}>
          <Text style={{ color: "white", marginRight: 5 }}>Online</Text>
          <Switch value={isOnline} onValueChange={toggleOnline} />
        </View>
      </View>

      {/* Map */}
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
        >
          {otherUsers.map((user) => (
            <Marker
              key={user.id}
              coordinate={user.location}
              onPress={() => setSelectedUser(user)}
            />
          ))}
        </MapView>
      )}

      {/* Modal for selected user */}
      {selectedUser && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedUser(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Avatar Circle */}
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{selectedUser.avatar || '👤'}</Text>
              </View>

              {/* Name */}
              <Text style={styles.name}>{selectedUser.name || 'Anonymous'}</Text>

              {/* Job */}
              <Text style={styles.label}>Job:</Text>
              <Text style={styles.value}>{selectedUser.job || 'Unknown Job'}</Text>

              {/* Interests */}
              <Text style={styles.label}>Interests:</Text>
              <Text style={styles.value}>{selectedUser.interests || 'No interests listed'}</Text>

              {/* Buttons */}
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#4a90e2" }]}
                onPress={() => handleStartConversation(selectedUser)}
              >
                <Text style={styles.modalButtonText}>Start Conversation</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#aaa" }]}
                onPress={() => setSelectedUser(null)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={30} color="#4a90e2" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ChatList')}>
          <Ionicons name="chatbubbles" size={30} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person" size={30} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out" size={30} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#4a90e2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  topBarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  onlineToggle: {
    flexDirection: "row",
    alignItems: "center",
  },

  map: { flex: 1 },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "white",
    borderTopWidth: 0.5,
    borderColor: "#ccc",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
  },
  value: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 4,
  },
  modalButton: {
    width: "80%",
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
