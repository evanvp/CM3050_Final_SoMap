import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { auth, db } from '../config/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function ProfileSettingsScreen({ navigation }) {
    const [profile, setProfile] = useState({ name: '', job: '', interests: '' });

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

    const handleSave = async () => {
        try {
        const uid = auth.currentUser.uid;
        await setDoc(doc(db, "users", uid), profile, { merge: true });
        navigation.replace('Profile'); // reloads ProfileScreen and triggers useEffect
        } catch (error) {
        console.error("Profile update error:", error.message);
        }
    };

    return (
        <View style={styles.container}>
        <Text style={styles.label}>Name</Text>
        <TextInput
            value={profile.name}
            onChangeText={(text) => setProfile({ ...profile, name: text })}
            style={styles.input}
        />

        <Text style={styles.label}>Job</Text>
        <TextInput
            value={profile.job}
            onChangeText={(text) => setProfile({ ...profile, job: text })}
            style={styles.input}
        />

        <Text style={styles.label}>Interests</Text>
        <TextInput
            value={profile.interests}
            onChangeText={(text) => setProfile({ ...profile, interests: text })}
            style={styles.input}
        />

        <Button title="Save" onPress={handleSave} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    label: { fontSize: 16, marginTop: 15 },
    input: { borderWidth: 1, padding: 10, marginTop: 5, borderRadius: 5 },
});
