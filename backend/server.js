import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";
import process from "process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
let db;
try {
  // Opción 1: Usando archivo de clave de servicio
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const keyPath = path.resolve(
      __dirname,
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    );
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  // Opción 2: Usando variables de entorno individuales
  else if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }

  db = admin.firestore();
  console.log("Firestore connected successfully!");
} catch (error) {
  console.warn("Firestore not configured, using mock data:", error.message);
  console.warn("Please add your Firebase credentials to .env file");
}

// Routes
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

// Products routes
app.get("/api/products", async (req, res) => {
  console.log("🔍 API /products hit");
  try {
    const { category, search, featured, popular, onSale } = req.query;

    console.log("🔍 Query parameters:", {
      category,
      search,
      featured,
      popular,
      onSale,
    });

    // Require Firestore database
    if (!db) {
      return res.status(503).json({
        error: "Database not available. Please configure Firebase credentials.",
      });
    }

    console.log("🔍 Using Firestore database");
    let productsQuery = db.collection("catalogo");

    // Apply simple filters that work well with Firestore
    if (category) {
      productsQuery = productsQuery.where("categoria", "==", category);
    }

    const snapshot = await productsQuery.get();
    let products = [];

    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });

    // Apply JavaScript filters for better type handling
    if (onSale === "true") {
      console.log("🔍 Filtering products on sale");
      products = products.filter((product) => {
        const isOnSale =
          product.enDescuento === true ||
          product.enDescuento === "true" ||
          product.enDescuento === 1;
        console.log(
          `Product: ${product.nombre}, enDescuento: ${
            product.enDescuento
          } (${typeof product.enDescuento}), isOnSale: ${isOnSale}`
        );
        return isOnSale;
      });
    }
    if (featured === "true") {
      products = products.filter((product) => {
        return (
          product.destacado === true ||
          product.destacado === "true" ||
          product.destacado === 1
        );
      });
    }
    if (popular === "true") {
      products = products.filter((product) => {
        return (
          product.popular === true ||
          product.popular === "true" ||
          product.popular === 1
        );
      });
    }

    // Apply search filter (Firestore doesn't support full-text search easily)
    if (search) {
      products = products.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
          p.descripcion?.toLowerCase().includes(search.toLowerCase())
      );
    }

    console.log(
      `📦 Retrieved ${products.length} products from catalogo collection`
    );

    // Debug: Log all products with their enDescuento status
    products.forEach((product) => {
      console.log(
        `📦 Product: ${product.nombre}, enDescuento: ${
          product.enDescuento
        }, type: ${typeof product.enDescuento}`
      );
    });

    return res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({
        error: "Database not available. Please configure Firebase credentials.",
      });
    }

    const productDoc = await db.collection("catalogo").doc(req.params.id).get();

    if (!productDoc.exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = { id: productDoc.id, ...productDoc.data() };
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new product
app.post("/api/products", async (req, res) => {
  try {
    console.log("🆕 Creating new product:", req.body);

    if (!db) {
      return res.status(503).json({
        error: "Database not available. Please configure Firebase credentials.",
      });
    }

    const {
      categoria,
      descripcion,
      img,
      nombre,
      precio,
      rating,
      stock,
      destacado = false,
      enDescuento = false,
      popular = false,
    } = req.body;

    // Validate required fields
    if (!nombre || !categoria || precio == null) {
      return res.status(400).json({
        error:
          "Missing required fields: nombre, categoria, and precio are required",
      });
    }

    // Create product object
    const productData = {
      categoria,
      descripcion: descripcion || "",
      img: img || "",
      nombre,
      precio: Number(precio),
      rating: Number(rating) || 0,
      stock: Number(stock) || 0,
      destacado: Boolean(destacado),
      enDescuento: Boolean(enDescuento),
      popular: Boolean(popular),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Add product to Firestore
    const docRef = await db.collection("catalogo").add(productData);

    console.log("✅ Product created with ID:", docRef.id);

    // Return the created product with its ID
    const createdProduct = {
      id: docRef.id,
      ...productData,
    };

    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ error: error.message });
  }
});

// Categories route
app.get("/api/categories", async (req, res) => {
  try {
    console.log("🔍 Categories endpoint called");
    console.log("🔍 DB connection status:", db ? "Connected" : "Not connected");

    if (!db) {
      return res.status(503).json({
        error: "Database not available. Please configure Firebase credentials.",
      });
    }

    console.log("🔍 Attempting to get categories from Firebase...");

    // First, try to get from dedicated categories collection
    console.log("🔍 Checking categorias collection...");
    const categoriesSnapshot = await db
      .collection("categorias")
      .where("activa", "==", true)
      .get();

    console.log("🔍 Categories snapshot empty:", categoriesSnapshot.empty);

    if (!categoriesSnapshot.empty) {
      const categoryData = [];
      categoriesSnapshot.forEach((doc) => {
        const category = doc.data();
        categoryData.push({
          id: category.id,
          name: category.nombre || formatCategoryName(category.id),
          description: category.descripcion,
          icon: category.icono,
        });
      });

      console.log(
        `📂 Retrieved ${categoryData.length} categories from categorias collection`
      );
      return res.json(categoryData);
    }

    // If no categories collection, extract from products
    console.log(
      "🔍 No categorias collection found, extracting from products..."
    );
    const productsSnapshot = await db.collection("catalogo").get();
    console.log("🔍 Products found:", productsSnapshot.size);

    const categoriesSet = new Set();
    const categoryData = [];

    productsSnapshot.forEach((doc) => {
      const product = doc.data();
      console.log("🔍 Product categoria:", product.categoria);
      if (product.categoria) {
        categoriesSet.add(product.categoria);
      }
    });

    console.log("🔍 Unique categories found:", Array.from(categoriesSet));

    // Convert unique categories to the expected format
    categoriesSet.forEach((category) => {
      categoryData.push({
        id: category,
        name: formatCategoryName(category),
        description: `Productos de ${formatCategoryName(
          category
        ).toLowerCase()}`,
      });
    });

    console.log(
      `📦 Retrieved ${categoryData.length} categories from products collection:`,
      categoryData
    );
    return res.json(categoryData);
  } catch (error) {
    console.error("❌ Categories endpoint error:", error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to format category names
function formatCategoryName(category) {
  const categoryMap = {
    // English categories (legacy)
    electronics: "Electrónicos",
    sports: "Deportes",
    home: "Hogar y Jardín",
    fashion: "Moda",
    clothing: "Ropa",
    books: "Libros",
    toys: "Juguetes",
    beauty: "Belleza",
    automotive: "Automotriz",
    music: "Música",
    gaming: "Videojuegos",
    health: "Salud y Bienestar",

    // Spanish categories from Firebase
    electronico: "Electrónicos",
    electronica: "Electrónicos",
    tecnologia: "Tecnología",
    Tecnologia: "Tecnología",
    otros: "Otros",
    otro: "Otros",
    deportes: "Deportes",
    hogar: "Hogar y Jardín",
    moda: "Moda",
    ropa: "Ropa",
    libros: "Libros",
    juguetes: "Juguetes",
    belleza: "Belleza",
    automotriz: "Automotriz",
    musica: "Música",
    videojuegos: "Videojuegos",
    salud: "Salud y Bienestar",
  };

  // Check for direct mapping first
  if (categoryMap[category]) {
    return categoryMap[category];
  }

  // Check lowercase mapping
  if (categoryMap[category.toLowerCase()]) {
    return categoryMap[category.toLowerCase()];
  }

  // Return capitalized version as fallback
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
}

// CRUD routes for categories management (admin functionality)
// Create new category
app.post("/api/categories", async (req, res) => {
  try {
    const { id, nombre, descripcion, icono } = req.body;

    if (!id || !nombre) {
      return res.status(400).json({ error: "ID and nombre are required" });
    }

    if (db) {
      const categoryRef = db.collection("categorias").doc(id);
      await categoryRef.set({
        id,
        nombre,
        descripcion: descripcion || `Productos de ${nombre.toLowerCase()}`,
        icono: icono || "📦",
        activa: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({ message: "Category created successfully", id });
    } else {
      res.status(503).json({ error: "Database not available" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update category
app.put("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, icono, activa } = req.body;

    if (db) {
      const categoryRef = db.collection("categorias").doc(id);
      const updateData = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (nombre) updateData.nombre = nombre;
      if (descripcion !== undefined) updateData.descripcion = descripcion;
      if (icono !== undefined) updateData.icono = icono;
      if (activa !== undefined) updateData.activa = activa;

      await categoryRef.update(updateData);
      res.json({ message: "Category updated successfully", id });
    } else {
      res.status(503).json({ error: "Database not available" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete category (soft delete - mark as inactive)
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (db) {
      const categoryRef = db.collection("categorias").doc(id);
      await categoryRef.update({
        activa: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({ message: "Category deactivated successfully", id });
    } else {
      res.status(503).json({ error: "Database not available" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Discount cupones/bonuses endpoint
app.get("/api/cupones", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({
        error: "Database not available. Please configure Firebase credentials.",
      });
    }

    const couponsSnapshot = await db.collection("cupones").get();
    const coupons = [];

    couponsSnapshot.forEach((doc) => {
      const couponData = doc.data();
      coupons.push({
        id: doc.id,
        code: couponData.codigo, // Firebase field: codigo
        title: couponData.nombre || `Descuento ${couponData.descuento}% `, // Dynamic title based on discount
        description: `Obtén ${couponData.descuento}% de descuento en tu compra`,
        discount: couponData.descuento, // Firebase field: descuento
        type: "percentage", // Default type
        validUntil: couponData.fechaVencimiento, // Firebase field: fechaVencimiento
        active: couponData.active !== false,
        nombre: couponData.nombre, // Keep original nombre field
        ...couponData,
      });
    });

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Alias for English endpoint - redirect to Spanish endpoint
app.get("/api/coupons", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({
        error: "Database not available. Please configure Firebase credentials.",
      });
    }

    const couponsSnapshot = await db.collection("cupones").get();
    const coupons = [];

    couponsSnapshot.forEach((doc) => {
      const couponData = doc.data();
      coupons.push({
        id: doc.id,
        code: couponData.codigo || couponData.code, // Firebase field: codigo
        title: `Descuento ${couponData.descuento}% OFF`, // Dynamic title based on discount
        description: `Obtén ${couponData.descuento}% de descuento en tu compra`,
        discount: couponData.descuento, // Firebase field: descuento
        type: "percentage", // Default type
        minPurchase: couponData.compraMinima || 0,
        maxDiscount: couponData.descuentoMaximo,
        validUntil: couponData.fechaVencimiento, // Firebase field: fechaVencimiento
        active: couponData.active !== false,
        usageLimit: couponData.limiteUso,
        usedCount: couponData.vecesUsado || 0,
        nombre: couponData.nombre, // Keep original nombre field
        ...couponData,
      });
    });

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate discount coupon
app.post("/api/validate-coupon", async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!db) {
      return res.status(503).json({
        error: "Database not available. Please configure Firebase credentials.",
        valid: false,
      });
    }

    // First try to find coupon by 'codigo' field
    const couponsSnapshot = await db
      .collection("cupones")
      .where("codigo", "==", code.toUpperCase())
      .limit(1)
      .get();

    let couponsSnapshot2;
    if (couponsSnapshot.empty) {
      // Try searching by nombre field as fallback
      couponsSnapshot2 = await db
        .collection("cupones")
        .where("nombre", "==", code.toLowerCase())
        .limit(1)
        .get();

      if (couponsSnapshot2.empty) {
        return res.status(404).json({ error: "Cupón no válido", valid: false });
      }
    }

    const couponDoc = couponsSnapshot.empty
      ? couponsSnapshot2.docs[0]
      : couponsSnapshot.docs[0];
    const coupon = couponDoc.data();

    // Check if coupon is active and not used
    if (coupon.active === false || coupon.used === true) {
      return res
        .status(400)
        .json({ error: "Cupón expirado o ya usado", valid: false });
    }

    // Check if coupon has expired (fechaVencimiento is a timestamp)
    if (coupon.fechaVencimiento) {
      const expirationDate = coupon.fechaVencimiento.toDate
        ? coupon.fechaVencimiento.toDate()
        : new Date(coupon.fechaVencimiento);

      if (new Date() > expirationDate) {
        return res.status(400).json({
          error: "Cupón vencido",
          valid: false,
        });
      }
    }

    // Check minimum purchase requirement
    const minPurchase = coupon.compraMinima || 0;
    if (cartTotal < minPurchase) {
      return res.status(400).json({
        error: `Compra mínima requerida: $${minPurchase.toLocaleString()}`,
        valid: false,
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    const discount = coupon.descuento || 0; // Use 'descuento' field from Firebase
    const type = "percentage"; // Default to percentage since your data shows numeric discount

    if (type === "percentage") {
      const maxDiscount = coupon.descuentoMaximo || Infinity;
      discountAmount = Math.min((cartTotal * discount) / 100, maxDiscount);
    } else if (type === "fixed") {
      discountAmount = discount;
    }

    res.json({
      valid: true,
      coupon: {
        id: couponDoc.id,
        code: coupon.codigo,
        nombre: coupon.nombre,
        discount: coupon.descuento,
        validUntil: coupon.fechaVencimiento,
      },
      discountAmount: discountAmount,
      finalTotal: cartTotal - discountAmount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message, valid: false });
  }
});

// Cart routes (these would typically use user authentication)
app.get("/api/cart/:userId", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({
        error: "Error al conectar con la base de datos. ",
      });
    }

    const cartDoc = await db
      .collection("carritos")
      .doc(req.params.userId)
      .get();

    if (!cartDoc.exists) {
      return res.json({ userId: req.params.userId, items: [] });
    }

    res.json({ id: cartDoc.id, ...cartDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/cart/:userId/add", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({
        error: "Database not available. Please configure Firebase credentials.",
      });
    }

    const { productId, quantity = 1 } = req.body;
    const userId = req.params.userId;

    // Get or create cart
    const cartRef = db.collection("carritos").doc(userId);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      await cartRef.set({
        userId,
        items: [{ productId, quantity }],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Update existing cart logic would go here
      const cartData = cartDoc.data();
      const existingItemIndex = cartData.items.findIndex(
        (item) => item.productId === productId
      );

      if (existingItemIndex > -1) {
        cartData.items[existingItemIndex].quantity += quantity;
      } else {
        cartData.items.push({ productId, quantity });
      }

      await cartRef.update({
        items: cartData.items,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json({ message: "Product added to cart", productId, quantity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/cart/:userId/update/:itemId", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({
        error: "Database not available. Please configure Firebase credentials.",
      });
    }

    const { quantity } = req.body;
    // Cart update logic using Firestore would go here
    res.json({
      message: "Cart item updated",
      itemId: req.params.itemId,
      quantity,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/cart/:userId/remove/:itemId", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({
        error: "Database not available. Please configure Firebase credentials.",
      });
    }

    // Cart item removal logic using Firestore would go here
    res.json({ message: "Cart item removed", itemId: req.params.itemId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize Firestore with sample data
async function initializeFirestoreData() {
  if (!db) {
    console.log("📋 Firestore not available, skipping data initialization");
    return;
  }

  try {
    // Check if catalogo collection already has data
    const catalogoSnapshot = await db.collection("catalogo").limit(1).get();

    if (!catalogoSnapshot.empty) {
      console.log(
        "📦 Catalogo collection already has data, skipping initialization"
      );
      return;
    }

    console.log("🔄 Initializing Firestore with sample data...");

    // Sample products data with Spanish field names
    const sampleProducts = [
      {
        nombre: "Smartphone Pro",
        precio: 899.99,
        descuento: 25,
        categoria: "electronics",
        descripcion: "Latest smartphone with advanced features",
        img: "https://www.indumil.gov.co/wp-content/uploads/2024/02/37185-DEFAULT-l.jpg",
        destacado: true,
        popular: true,
        enDescuento: true,
        stock: 15,
        rating: 4.8,
      },
      {
        nombre: "Wireless Earbuds",
        precio: 129.99,
        descuento: 28,
        categoria: "electronics",
        descripcion: "True wireless earbuds with noise cancellation",
        img: "https://via.placeholder.com/300x300?text=Earbuds",
        destacado: false,
        popular: true,
        enDescuento: true,
        stock: 25,
        rating: 4.6,
      },
      {
        nombre: "Running Shoes",
        precio: 89.99,
        descuento: 0,
        categoria: "sports",
        descripcion: "Comfortable running shoes for daily training",
        img: "https://via.placeholder.com/300x300?text=Running+Shoes",
        destacado: true,
        popular: false,
        enDescuento: false,
        stock: 20,
        rating: 4.7,
      },
      {
        nombre: "Coffee Maker",
        precio: 79.99,
        descuento: 0,
        categoria: "home",
        descripcion: "Automatic coffee maker with programmable timer",
        img: "https://via.placeholder.com/300x300?text=Coffee+Maker",
        destacado: true,
        popular: true,
        enDescuento: false,
        stock: 12,
        rating: 4.5,
      },
      {
        nombre: "Fitness Tracker",
        precio: 149.99,
        descuento: 15,
        categoria: "sports",
        descripcion: "Advanced fitness tracker with heart rate monitor",
        img: "https://via.placeholder.com/300x300?text=Fitness+Tracker",
        destacado: false,
        popular: true,
        enDescuento: true,
        stock: 30,
        rating: 4.4,
      },
      {
        nombre: "Wireless Keyboard",
        precio: 59.99,
        descuento: 0,
        categoria: "electronics",
        descripcion: "Ergonomic wireless keyboard with backlight",
        img: "https://via.placeholder.com/300x300?text=Keyboard",
        destacado: false,
        popular: false,
        enDescuento: false,
        stock: 18,
        rating: 4.2,
      },
    ];

    // Add products to Firestore catalogo collection
    const batch = db.batch();
    sampleProducts.forEach((product, index) => {
      const productRef = db.collection("catalogo").doc(`product_${index + 1}`);
      batch.set(productRef, {
        ...product,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    console.log(
      "✅ Sample products added to catalogo collection successfully!"
    );

    // Initialize categories collection (optional - for better organization)
    await initializeCategoriesCollection();
  } catch (error) {
    console.error("❌ Error initializing Firestore data:", error);
  }
}

// Initialize categories collection with predefined categories
async function initializeCategoriesCollection() {
  try {
    const categoriesSnapshot = await db.collection("categorias").limit(1).get();

    if (!categoriesSnapshot.empty) {
      console.log("📂 Categories collection already exists");
      return;
    }

    const defaultCategories = [
      {
        id: "electronics",
        nombre: "Electrónicos",
        descripcion: "Dispositivos electrónicos y tecnología",
        icono: "📱",
        activa: true,
      },
      {
        id: "sports",
        nombre: "Deportes",
        descripcion: "Artículos deportivos y fitness",
        icono: "⚽",
        activa: true,
      },
      {
        id: "home",
        nombre: "Hogar y Jardín",
        descripcion: "Artículos para el hogar y jardín",
        icono: "🏠",
        activa: true,
      },
      {
        id: "fashion",
        nombre: "Moda",
        descripcion: "Ropa y accesorios de moda",
        icono: "👕",
        activa: true,
      },
    ];

    const categoriesBatch = db.batch();
    defaultCategories.forEach((category) => {
      const categoryRef = db.collection("categorias").doc(category.id);
      categoriesBatch.set(categoryRef, {
        ...category,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await categoriesBatch.commit();
    console.log("✅ Categories collection initialized successfully!");
  } catch (error) {
    console.error("❌ Error initializing categories:", error);
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // Initialize Firestore data if needed
  if (db) {
    await initializeFirestoreData();
  }
});
