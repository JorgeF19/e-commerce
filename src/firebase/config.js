import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBI431bZczKpJQd6lTk_dRzK94hkxOoegQ",
  authDomain: "e-commerce-c54a2.firebaseapp.com",
  projectId: "e-commerce-c54a2",
  storageBucket: "e-commerce-c54a2.firebasestorage.app",
  messagingSenderId: "68037131441",
  appId: "1:68037131441:web:6201a5276ec86dafb93690",
  measurementId: "G-8DL51SV1PG",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
