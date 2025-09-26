# 🚀 Guía de Despliegue en Netlify

Este documento explica cómo desplegar la aplicación e-commerce en Netlify.

## 📋 Prerequisitos

1. **Cuenta en Netlify**: Crea una cuenta gratuita en [netlify.com](https://netlify.com)
2. **Repositorio en GitHub**: El código debe estar en un repositorio de GitHub
3. **Configuración de Firebase**: Ten lista tu configuración de Firebase

## ⚙️ Configuración Previa

### 1. Variables de Entorno

Crea un archivo `.env.local` basado en `.env.example`:

```bash
cp .env.example .env.local
```

Completa las variables con tus datos de Firebase:

- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`

### 2. Configuración de Firebase

Asegúrate de tener configurado:

- **Authentication**: Métodos de autenticación habilitados
- **Firestore**: Base de datos configurada con las reglas correctas
- **Hosting** (opcional): Si quieres usar Firebase Hosting como alternativa

## 🚀 Pasos de Despliegue en Netlify

### Opción 1: Despliegue desde GitHub (Recomendado)

1. **Conectar Repositorio**:

   - Ve a [app.netlify.com](https://app.netlify.com)
   - Click en "New site from Git"
   - Conecta tu cuenta de GitHub
   - Selecciona tu repositorio

2. **Configurar Build Settings**:

   - **Base directory**: `ecommerce-app` (si el proyecto está en un subdirectorio)
   - **Build command**: `npm run build`
   - **Publish directory**: `ecommerce-app/build`

3. **Configurar Variables de Entorno**:

   - Ve a Site Settings > Environment Variables
   - Agrega todas las variables `REACT_APP_*` de tu archivo `.env.local`

4. **Deploy**:
   - Click "Deploy site"
   - Netlify automáticamente construirá y desplegará tu aplicación

### Opción 2: Despliegue Manual

1. **Build Local**:

   ```bash
   cd ecommerce-app
   npm run build
   ```

2. **Deploy Manual**:
   - Ve a [app.netlify.com](https://app.netlify.com)
   - Arrastra la carpeta `build` al área de despliegue

## 🔧 Configuraciones Importantes

### Archivos de Configuración Incluidos

- **`netlify.toml`**: Configuración principal de Netlify
- **`public/_redirects`**: Manejo de rutas para SPA
- **`.env.example`**: Plantilla de variables de entorno

### Headers de Seguridad

El archivo `netlify.toml` incluye headers de seguridad:

- Protección XSS
- Prevención de clickjacking
- Cache optimizado para archivos estáticos

## 🐛 Solución de Problemas

### Error: "Page Not Found" en rutas

- **Causa**: Falta configuración de redirects para SPA
- **Solución**: Verifica que `public/_redirects` existe con el contenido correcto

### Error de Variables de Entorno

- **Causa**: Variables no configuradas en Netlify
- **Solución**: Ve a Site Settings > Environment Variables y agrega todas las `REACT_APP_*`

### Error de Build

- **Causa**: Dependencias no instaladas o errores en el código
- **Solución**:
  ```bash
  npm install
  npm run build
  ```

### Problemas con Firebase

- **Causa**: Configuración incorrecta o reglas restrictivas
- **Solución**: Verifica la configuración en `src/config/firebase.js`

## 📝 Notas Importantes

- **No subir credenciales**: El `.gitignore` protege archivos sensibles
- **HTTPS automático**: Netlify provee certificados SSL gratuitos
- **CDN global**: Tu aplicación se distribuye globalmente
- **Builds automáticos**: Cada push a la rama principal redespliega automáticamente

## 🔄 Actualizaciones

Para actualizar la aplicación:

1. Haz commit de tus cambios
2. Push a tu repositorio
3. Netlify automáticamente redesplegarrá la aplicación

## 📞 Soporte

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Firebase Docs**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **React Docs**: [reactjs.org](https://reactjs.org)
