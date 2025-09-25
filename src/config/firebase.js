// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config - Reemplaza con los valores de tu proyecto
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};

// INSTRUCCIONES:
// 1. Ve a Firebase Console > Project Settings > General
// 2. En "Your apps", selecciona la app web o crea una nueva
// 3. Copia la configuración y reemplaza los valores arriba
// 4. Guarda este archivo

// Initialize Firebase
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("🔥 Firebase initialized successfully");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  console.warn("📝 Please update firebase config in src/config/firebase.js");
}

export { auth, db };
export default app;
