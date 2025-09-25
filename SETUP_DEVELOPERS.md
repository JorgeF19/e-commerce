# 🔥 Configuración para Desarrolladores

## Para ejecutar el backend, necesitas configurar Firebase:

### Opción 1: Proyecto Firebase Propio (Recomendado)

1. **Crear proyecto en Firebase Console**:

   - Ve a https://console.firebase.google.com/
   - Clic en "Crear proyecto"
   - Nombre: `tu-ecommerce-dev` (o el que prefieras)

2. **Habilitar Firestore**:

   - Ve a "Firestore Database"
   - Clic en "Crear base de datos"
   - Modo: "Empezar en modo de prueba"

3. **Generar clave de servicio**:

   - Ve a "Configuración del proyecto" > "Cuentas de servicio"
   - Clic en "Generar nueva clave privada"
   - Descargar el archivo JSON
   - Guardar como `backend/serviceAccountKey.json`

4. **Configurar variables de entorno**:

   - Copiar `backend/.env.example` a `backend/.env`
   - Actualizar con tu información:

   ```env
   PORT=5000
   FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json
   FIREBASE_PROJECT_ID=tu-project-id-aqui
   ```

5. **Iniciar el servidor**:
   ```bash
   cd backend
   npm start
   ```

### Opción 2: Acceso al proyecto existente

Si el dueño del proyecto te da acceso:

1. Solicitar el archivo `serviceAccountKey.json`
2. Colocarlo en `backend/serviceAccountKey.json`
3. El archivo `.env` ya está configurado
4. Ejecutar `npm start`

### Verificar que funciona

- El servidor debe mostrar: "Firestore connected successfully!"
- Probar: http://localhost:5000/api/products
- Debe devolver productos de la base de datos

## Estructura de la base de datos

El servidor automáticamente creará datos de muestra en la colección "catalogo" si está vacía.

## ⚠️ Importante

- **NUNCA** subir `serviceAccountKey.json` al repositorio
- **NUNCA** subir `.env` con credenciales reales
- Usar `.env.example` como referencia
