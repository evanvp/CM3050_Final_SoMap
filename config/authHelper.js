// Some reusable auth functions set for Signup and Login Screen.

import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

// Sign up new user
export const signUpUser = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Create user profile doc in Firestore
    await setDoc(doc(db, "users", uid), {
        name: "",
        job: "",
        interests: "",
        avatar: 0,  // Temporary placeholding for real image
        createdAt: new Date()
    });

    return uid;
};

// Sign in existing user
export const signInUser = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Set online to true after login
    await updateDoc(doc(db, 'users', uid), { online: true });
    return uid;
};
