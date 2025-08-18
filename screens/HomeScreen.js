import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Modal, Button } from 'react-native';
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

    // Request location permission and start updating
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
    
        updateUserLocation(); // initial update
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

        fetchOtherUsers(); // initial fetch
        fetchInterval.current = setInterval(fetchOtherUsers, 2000);

        return () => clearInterval(fetchInterval.current);
    }, []);

    // Toggle online/offline status
    const toggleOnline = async (value) => {
        setIsOnline(value);
        if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), { online: value });
        }
    };

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

    const handleStartConversation = async (user) => {
        try {
          const currentUserId = auth.currentUser.uid;
          const chatRoomId = await getOrCreateChatRoom(currentUserId, user.id);
      
          navigation.navigate("ChatRoom", { chatRoomId });
          setSelectedUser(null); // close modal
        } catch (err) {
          console.error("Error starting conversation:", err);
        }
      };

    return (
        <View style={styles.container}>
        {/* Top bar with online toggle */}
        <View style={styles.topBar}>
            <Text style={{ fontSize: 18 }}>Map</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text>Online</Text>
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
                title={user.name || 'Anonymous'}
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
                <Text style={{ fontSize: 18 }}>{selectedUser.name || 'Anonymous'}</Text>
                <Text>{selectedUser.job}</Text>
                <Text>{selectedUser.interests}</Text>
                <Button title="Start Conversation" onPress={() => handleStartConversation(selectedUser)} />
                <Button title="Close" onPress={() => setSelectedUser(null)} />
                </View>
            </View>
            </Modal>
        )}

        {/* Bottom Navigation */}
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
    container: { flex: 1 },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        alignItems: 'center',
        backgroundColor: '#eee',
    },
    map: { flex: 1 },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
        borderTopWidth: 1,
        borderColor: 'grey',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
});
