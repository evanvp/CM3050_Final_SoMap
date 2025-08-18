import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function ProfileScreen({ navigation }) {
    const [profile, setProfile] = useState(null);

    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchProfile = async () => {
        const uid = auth.currentUser.uid;
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setProfile(docSnap.data());
        }
        };
        fetchProfile();
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

    return (
        <View style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
            <Text style={styles.title}>Edit your Profile</Text>
            <TouchableOpacity onPress={() => navigation.push('ProfileSetting')}>
            <Ionicons name="settings" size={24} />
            </TouchableOpacity>
        </View>

        {/* Profile Content */}
        <View style={styles.content}>
            {/* Avatar Placeholder */}
            <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.avatar || '0'}</Text>
            </View>

            {/* User Info */}
            <Text style={styles.infoText}>Name: {profile?.name || '-'}</Text>
            <Text style={styles.infoText}>Job: {profile?.job || '-'}</Text>
            <Text style={styles.infoText}>Interests: {profile?.interests || '-'}</Text>
        </View>

            
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
    container: { flex: 1, flexDirection: 'column' },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderColor: 'grey',
    },
    title: { fontSize: 24, fontWeight: 'bold' },
    content: { flex: 1, alignItems: 'center', paddingTop: 30 },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarText: { fontSize: 32, fontWeight: 'bold' },
    infoText: { fontSize: 18, marginBottom: 10 },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
        borderTopWidth: 1,
        borderColor: 'grey',
    },
    });
