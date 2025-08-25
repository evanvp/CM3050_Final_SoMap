// Initail Firebase Config Test 
// Impoted onto App.js to work 

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { db } from '../config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export default function FirebaseTest() {
    useEffect(() => {
        const checkDB = async () => {
            const querySnapshot = await getDocs(collection(db, "test"));
            querySnapshot.forEach(doc => {
                console.log(doc.id, " => ", doc.data());
            });
        };
        checkDB();
    }, []);

    return (
        <View>
            <Text>Check console for Firestore data...</Text>
        </View>
    );
}
