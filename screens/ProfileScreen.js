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
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity onPress={() => navigation.push('ProfileSetting')}>
          <Ionicons name="settings" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Profile Content */}
      <View style={styles.content}>
        {/* Avatar Placeholder */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.avatar || '👤'}</Text>
        </View>

        {/* User Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}><Text style={styles.label}>Name: </Text>{profile?.name || '-'}</Text>
          <Text style={styles.infoText}><Text style={styles.label}>Job: </Text>{profile?.job || '-'}</Text>
          <Text style={styles.infoText}><Text style={styles.label}>Interests: </Text>{profile?.interests || '-'}</Text>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={30} color="grey" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ChatList')}>
          <Ionicons name="chatbubbles" size={30} color="grey" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person" size={30} color="#4a90e2" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out" size={30} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'column', backgroundColor: '#f9f9f9' },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#4a90e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: 'white' },

  // Content
  content: { flex: 1, alignItems: 'center', paddingTop: 30 },

  // Avatar
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  
  avatarText: {
    fontSize: 44,
  },

  // Info card
  infoCard: {
    width: '85%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoText: { fontSize: 16, marginBottom: 12, color: '#333' },
  label: { fontWeight: 'bold', color: '#555' },

  // Bottom nav
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "white",
    borderTopWidth: 0.5,
    borderColor: "#ccc",
  },
});
