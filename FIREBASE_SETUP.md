# Firebase Setup Instructions

Para completar la configuración de tu aplicación e-commerce, necesitas configurar Firebase. Sigue estos pasos:

## 1. Crear un Proyecto de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Nombra tu proyecto (ej: "ecommerce-app")
4. Habilita Google Analytics (opcional)
5. Crea el proyecto

## 2. Configurar Authentication

1. En la consola de Firebase, ve a "Authentication"
2. Haz clic en "Comenzar"
3. Ve a la pestaña "Sign-in method"
4. Habilita "Email/Password"
5. Guarda los cambios

## 3. Configurar Firestore Database

1. En la consola de Firebase, ve a "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba" (por ahora)
4. Elige una ubicación cercana a tus usuarios

## 4. Obtener Configuración del Frontend

1. En la página principal del proyecto, haz clic en el ícono de web (</>)
2. Registra tu aplicación con un nombre (ej: "ecommerce-frontend")
3. Copia la configuración que aparece
4. Reemplaza el contenido de `src/firebase.js` con tu configuración:

```javascript
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase (reemplaza con la tuya)
const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-project-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
```

## 5. Configurar Backend (Opcional - para producción)

Si quieres usar Firebase Admin en el backend:

1. Ve a "Configuración del proyecto" (ícono de engranaje)
2. Ve a la pestaña "Cuentas de servicio"
3. Haz clic en "Generar nueva clave privada"
4. Descarga el archivo JSON
5. Guarda el archivo en la carpeta `backend/` con el nombre `serviceAccountKey.json`
6. Descomenta las líneas en `backend/server.js` relacionadas con Firebase Admin
7. Actualiza la ruta del archivo en el código

## 6. Variables de Entorno (Opcional)

Puedes usar variables de entorno para mayor seguridad:

### Frontend (.env en la raíz del proyecto)

```
REACT_APP_FIREBASE_API_KEY=tu-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=tu-app-id
```

Y luego actualiza `src/firebase.js` para usar estas variables:

```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};
```

## 7. Configurar Reglas de Firestore

Para permitir lectura/escritura, ve a "Firestore Database" > "Reglas" y usa estas reglas básicas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura de productos a todos
    match /products/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Permitir acceso al carrito solo al usuario autenticado
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 8. Probar la Configuración

1. Reinicia tanto el backend como el frontend
2. Ve a http://localhost:3000
3. Intenta registrar un nuevo usuario
4. Verifica que puedas hacer login/logout
5. Agrega productos al carrito (debe requerir login)

¡Tu aplicación e-commerce ya está lista para usar con Firebase!
