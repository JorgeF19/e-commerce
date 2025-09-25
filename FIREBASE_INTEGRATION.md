# 🔥 Configuración Firebase - Instrucciones Completas

## 📋 Pasos para Conectar Fireb3. **Verifica en Firebase Console**:

- Ve a Firestore Database
- Deberías ver una colección llamada **`catalogo`** con datos de muestra con tu Proyecto

### **1️⃣ Obtener la Clave de Servicio (Service Account Key)**

1. **Accede a Firebase Console**: https://console.firebase.google.com/
2. **Selecciona tu proyecto**: `e-commerce-c54a2`
3. **Ve a Configuración del Proyecto**:
   - Haz clic en el ícono de engranaje ⚙️
   - Selecciona "Project Settings"
4. **Ve a la pestaña "Service accounts"**
5. **Genera una nueva clave privada**:
   - Haz clic en "Generate new private key"
   - Se descargará un archivo JSON
6. **Guarda el archivo**:
   - Renómbralo a `serviceAccountKey.json`
   - Colócalo en la carpeta `backend/` de tu proyecto

### **2️⃣ Configurar las Variables de Entorno**

Una vez que tengas el archivo `serviceAccountKey.json`, tienes dos opciones:

#### **Opción A: Usar el archivo JSON (Recomendado)**

- El archivo ya debe estar en `backend/serviceAccountKey.json`
- No necesitas cambiar nada en `.env`

#### **Opción B: Usar variables de entorno individuales**

Si prefieres no tener el archivo JSON, puedes extraer los valores:

1. Abre el archivo `serviceAccountKey.json`
2. Actualiza el archivo `backend/.env` con estos valores:

```
FIREBASE_PROJECT_ID=e-commerce-c54a2
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@e-commerce-c54a2.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu-clave-privada-aquí\n-----END PRIVATE KEY-----\n"
```

### **3️⃣ Configurar Reglas de Firestore**

En Firebase Console:

1. Ve a "Firestore Database"
2. Haz clic en "Rules"
3. Reemplaza las reglas con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to catalogo for everyone
    match /catalogo/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Allow users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Allow users to manage their own cart
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### **4️⃣ Verificar la Conexión**

1. **Reinicia el servidor backend**:

   ```bash
   cd backend
   node server.js
   ```

2. **Verifica los logs**:

   - Deberías ver: `🔥 Firestore connected successfully!`
   - También: `✅ Sample products added to Firestore successfully!`

3. **Verifica en Firebase Console**:
   - Ve a Firestore Database
   - Deberías ver una colección llamada `products` con datos de ejemplo

### **5️⃣ Usar Firebase Authentication**

Tu frontend ya está configurado para usar Firebase Auth. Para probarlo:

1. **Registro**: Crea una cuenta nueva en tu app
2. **Login**: Inicia sesión con las credenciales
3. **Verificar en Console**: Ve a Authentication en Firebase Console para ver los usuarios registrados

## 🚨 **Seguridad Importante**

⚠️ **NUNCA COMPARTAS** el archivo `serviceAccountKey.json`

- Agrégalo a `.gitignore`
- No lo subas a GitHub o repositorios públicos
- Contiene credenciales administrativas de tu proyecto

## 🔍 **Resolución de Problemas**

### Error: "Firestore not configured"

- Verifica que el archivo `serviceAccountKey.json` esté en la carpeta `backend/`
- Revisa que las variables de entorno en `.env` sean correctas

### Error: "Permission denied"

- Actualiza las reglas de Firestore como se muestra arriba
- Verifica que los usuarios estén autenticados

### Error: "Project not found"

- Confirma que el `FIREBASE_PROJECT_ID` sea correcto: `e-commerce-c54a2`

## 📞 **¿Necesitas Ayuda?**

Si encuentras algún problema, revisa:

1. Los logs del servidor backend
2. La consola del navegador para errores del frontend
3. Firebase Console > Usage para ver si hay actividad
