# TechStore - E-commerce React Application

Una aplicación de comercio electrónico moderna construida con React, Express.js y Firebase Firestore.

## 🚀 Características

- **Frontend React**: Interfaz de usuario moderna y responsiva
- **Backend Express.js**: API RESTful robusta
- **Firebase Firestore**: Base de datos en tiempo real
- **Autenticación**: Sistema de autenticación con Firebase Auth
- **Carrito de Compras**: Funcionalidad completa de carrito
- **Gestión de Productos**: Catálogo de productos con filtros y búsqueda
- **Sistema de Descuentos**: Productos en oferta con cálculos automáticos
- **Cupones de Descuento**: Sistema de validación de cupones
- **Diseño Responsivo**: Compatible con dispositivos móviles

## 🛠️ Tecnologías Utilizadas

### Frontend

- React 18
- React Router DOM
- Bootstrap 5
- Axios
- Context API para manejo de estado

### Backend

- Node.js
- Express.js
- Firebase Admin SDK
- Firestore Database
- CORS
- dotenv

## 📋 Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn
- Cuenta de Firebase
- Git

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/techstore-ecommerce.git
cd techstore-ecommerce
```

### 2. Configurar el Frontend

```bash
# Instalar dependencias del frontend
npm install
```

### 3. Configurar el Backend

```bash
cd backend
npm install
```

### 4. Configuración de Firebase

**⚠️ IMPORTANTE**: Cada desarrollador necesita configurar su propia instancia de Firebase.

#### Para colaboradores del proyecto:
1. Solicita acceso al proyecto `e-commerce-c54a2` al dueño del repositorio
2. Obtén el archivo `serviceAccountKey.json` (NO está en el repositorio por seguridad)
3. Colócalo en `backend/serviceAccountKey.json`

#### Para desarrollo independiente:
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Firestore Database
3. Genera una clave de servicio:
   - Ve a Configuración del proyecto > Cuentas de servicio
   - Haz clic en "Generar nueva clave privada"
   - Guarda el archivo JSON como `backend/serviceAccountKey.json`

4. Crea/actualiza el archivo `backend/.env`:
```env
PORT=5000
FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json
FIREBASE_PROJECT_ID=tu-project-id
```

📋 **Ver [SETUP_DEVELOPERS.md](SETUP_DEVELOPERS.md) para instrucciones detalladas**
# FIREBASE_PRIVATE_KEY=tu-private-key
```

## 🚀 Uso

### Iniciar el Backend

```bash
cd backend
npm start
# El servidor se ejecutará en http://localhost:5000
```

### Iniciar el Frontend

```bash
# Desde la raíz del proyecto
npm start
# La aplicación se abrirá en http://localhost:3000
```

## 📚 Estructura del Proyecto

```
techstore-ecommerce/
├── public/                     # Archivos públicos
├── src/                       # Código fuente del frontend
│   ├── components/            # Componentes reutilizables
│   │   ├── ProductCard.js     # Tarjeta de producto
│   │   ├── ProductList.js     # Lista de productos
│   │   └── Navbar.js          # Barra de navegación
│   ├── contexts/              # Contextos de React
│   │   ├── AuthContext.js     # Contexto de autenticación
│   │   ├── AuthContextSafe.js # Contexto de autenticación seguro
│   │   └── CartContext.js     # Contexto del carrito
│   ├── pages/                 # Páginas principales
│   │   ├── Home.js            # Página de inicio
│   │   ├── Store.js           # Tienda/catálogo
│   │   ├── Cart.js            # Carrito de compras
│   │   └── Login.js           # Página de login
│   └── App.js                 # Componente principal
├── backend/                   # Código del servidor
│   ├── server.js              # Servidor Express
│   ├── .env                   # Variables de entorno
│   ├── serviceAccountKey.json # Clave de Firebase (no incluir en git)
│   └── package.json           # Dependencias del backend
├── package.json               # Dependencias del frontend
└── README.md                  # Este archivo
```

## 🔧 API Endpoints

### Productos

- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener producto por ID
- `GET /api/products?category=electronics` - Filtrar por categoría
- `GET /api/products?search=smartphone` - Buscar productos
- `GET /api/products?featured=true` - Productos destacados
- `GET /api/products?onSale=true` - Productos en oferta
- `GET /api/products?popular=true` - Productos populares

### Categorías

- `GET /api/categories` - Obtener todas las categorías

### Cupones

- `GET /api/discount-coupons` - Obtener cupones disponibles
- `POST /api/validate-coupon` - Validar cupón de descuento

### Carrito (Mock)

- `GET /api/cart/:userId` - Obtener carrito del usuario
- `POST /api/cart/:userId/add` - Agregar producto al carrito
- `PUT /api/cart/:userId/update/:itemId` - Actualizar cantidad
- `DELETE /api/cart/:userId/remove/:itemId` - Eliminar del carrito

## 🎯 Características Principales

### Sistema de Productos

- Catálogo completo con imágenes
- Filtrado por categoría, precio, popularidad
- Búsqueda por texto
- Productos destacados y en oferta
- Sistema de calificaciones (rating)
- Control de inventario (stock)

### Sistema de Descuentos

- Productos con descuentos automáticos
- Cálculo de precios con descuento
- Visualización de precios originales y rebajados
- Cupones de descuento con validación

### Carrito de Compras

- Agregar/eliminar productos
- Actualizar cantidades
- Cálculo automático de totales
- Persistencia en localStorage

### Autenticación

- Sistema de autenticación con Firebase
- Fallback a modo mock para desarrollo
- Contexto seguro para manejo de usuarios

## 🔒 Seguridad

- Variables de entorno para credenciales sensibles
- Validación de cupones en el backend
- Manejo seguro de errores
- CORS configurado apropiadamente

## 🚧 Próximas Funcionalidades

- [ ] Sistema de pagos (Stripe/PayPal)
- [ ] Panel de administración
- [ ] Historial de pedidos
- [ ] Notificaciones push
- [ ] Wishlist/Lista de deseos
- [ ] Reseñas y comentarios de productos
- [ ] Integración con servicios de envío

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de funcionalidad (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

Tu Nombre - [@tu-usuario](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- [React](https://reactjs.org/)
- [Express.js](https://expressjs.com/)
- [Firebase](https://firebase.google.com/)
- [Bootstrap](https://getbootstrap.com/)
- [Font Awesome](https://fontawesome.com/) para los iconos

## 📞 Soporte

Si tienes alguna pregunta o problema, por favor abre un [issue](https://github.com/tu-usuario/techstore-ecommerce/issues) en GitHub.

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!

```

```
