// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// TODO: Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBI431bZczKpJQd6lTk_dRzK94hkxOoegQ",
  authDomain: "e-commerce-c54a2.firebaseapp.com",
  projectId: "e-commerce-c54a2",
  storageBucket: "e-commerce-c54a2.firebasestorage.app",
  messagingSenderId: "68037131441",
  appId: "1:68037131441:web:6201a5276ec86dafb93690",
  measurementId: "G-8DL51SV1PG",
};

// IMPORTANT: You must replace the above placeholder values with your actual
// Firebase configuration from the Firebase Console

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
