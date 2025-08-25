import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { signUpUser } from '../config/authHelper';

export default function SignupScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSignup = async () => {
        setErrorMessage(''); // clear previous error
        try {
        const uid = await signUpUser(email, password);
        console.log("New user UID:", uid);
        navigation.navigate('Home');
        } catch (error) {
        console.error("Signup error:", error.message);
        setErrorMessage(error.message); // set error for UI
        }
    };

    return (
        <View style={{ padding: 20 }}>
        <Text>Email</Text>
        <TextInput 
            value={email} 
            onChangeText={setEmail} 
            style={{ borderWidth: 1, marginBottom: 10, padding: 8 }} 
            keyboardType="email-address"
            autoCapitalize="none"
        />

        <Text>Password</Text>
        <TextInput 
            value={password} 
            secureTextEntry 
            onChangeText={setPassword} 
            style={{ borderWidth: 1, marginBottom: 10, padding: 8 }} 
        />

        {/* Render error message if present */}
        {errorMessage ? (
            <Text style={{ color: 'red', marginBottom: 10 }}>{errorMessage}</Text>
        ) : null}

        <Button title="Sign Up" onPress={handleSignup} />
        </View>
    );
}
