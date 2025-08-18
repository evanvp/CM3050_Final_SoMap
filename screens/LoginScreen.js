import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { signInUser } from '../config/authHelper'; 

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
        const uid = await signInUser(email, password);
        console.log('User logged in with UID:', uid);
        navigation.navigate('Home'); 
        } catch (error) {
        Alert.alert('Login failed', error.message);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>

        <Text>Email</Text>
        <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 }}
        />

        <Text>Password</Text>
        <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 25, borderRadius: 5 }}
        />

        <Button title="Login" onPress={handleLogin} />

        <Text style={{ textAlign: 'center', marginTop: 20 }}>
        Don't have an account?{' '}
            <Text
            style={{ color: 'blue' }}
            onPress={() => navigation.navigate('Signup')}
            >
                Sign up
            </Text>
        </Text>
        </View>
    );
}
