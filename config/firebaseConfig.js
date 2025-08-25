// Firebase Config, modified template from Firebase
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDeqqIlIk5w1NA-tuGds3hw5WKpesTi0A0",
  authDomain: "cm3050-final-somapapp.firebaseapp.com",
  projectId: "cm3050-final-somapapp",
  storageBucket: "cm3050-final-somapapp.firebasestorage.app",
  messagingSenderId: "689532199116",
  appId: "1:689532199116:web:65ca6fc4b97ba506c8a269",
  measurementId: "G-VH57FPRN3Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Auth and Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);