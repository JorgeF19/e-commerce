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

    // Try to get products from Firestore first
    if (db) {
      console.log("🔍 Using Firestore database");
      try {
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
      } catch (firestoreError) {
        console.warn(
          "Firestore query failed, falling back to mock data:",
          firestoreError.message
        );
        console.warn("Full error:", firestoreError);
      }
    } else {
      console.log("🔍 No Firestore database, using mock data");
    }

    // Fallback to mock data
    console.log("Using mock data for products");
    const products = [
      {
        id: "1",
        title: "Smartphone Prso",
        price: 899.99,
        originalPrice: 1199.99,
        discount: 25,
        category: "electronics",
        description: "Latest smartphone with advanced features",
        image:
          "https://www.indumil.gov.co/wp-content/uploads/2024/02/37185-DEFAULT-l.jpg",
        featured: true,
        popular: true,
        onSale: true,
        stock: 15,
        rating: 4.8,
      },
      {
        id: "2",
        title: "Wireless Headphones",
        price: 199.99,
        originalPrice: 249.99,
        discount: 20,
        category: "electronics",
        description: "Premium wireless headphones with noise cancellation",
        image: "https://via.placeholder.com/300x300?text=Headphones",
        featured: true,
        popular: true,
        onSale: true,
        stock: 8,
        rating: 4.6,
      },
      {
        id: "3",
        title: "Running Shoes",
        price: 129.99,
        originalPrice: 179.99,
        discount: 28,
        category: "sports",
        description: "Comfortable running shoes for all terrains",
        image: "https://via.placeholder.com/300x300?text=Shoes",
        featured: false,
        popular: false,
        onSale: true,
        stock: 25,
        rating: 4.3,
      },
      {
        id: "4",
        title: "Coffee Maker",
        price: 79.99,
        category: "home",
        description: "Automatic coffee maker with programmable timer",
        image: "https://via.placeholder.com/300x300?text=Coffee+Maker",
        featured: true,
        popular: true,
        onSale: false,
        stock: 12,
        rating: 4.5,
      },
      {
        id: "5",
        title: "Gaming Laptop",
        price: 1299.99,
        originalPrice: 1599.99,
        discount: 19,
        category: "electronics",
        description: "High-performance gaming laptop with RTX graphics",
        image: "https://via.placeholder.com/300x300?text=Gaming+Laptop",
        featured: false,
        popular: true,
        onSale: true,
        stock: 5,
        rating: 4.9,
      },
      {
        id: "6",
        title: "Fitness Tracker",
        price: 89.99,
        originalPrice: 119.99,
        discount: 25,
        category: "sports",
        description: "Advanced fitness tracker with heart rate monitor",
        image: "https://via.placeholder.com/300x300?text=Fitness+Tracker",
        featured: false,
        popular: true,
        onSale: true,
        stock: 30,
        rating: 4.4,
      },
      {
        id: "7",
        title: "Bluetooth Speaker",
        price: 49.99,
        category: "electronics",
        description: "Portable bluetooth speaker with excellent sound quality",
        image: "https://via.placeholder.com/300x300?text=Speaker",
        featured: false,
        popular: true,
        onSale: false,
        stock: 20,
        rating: 4.2,
      },
      {
        id: "8",
        title: "Yoga Mat",
        price: 24.99,
        originalPrice: 39.99,
        discount: 38,
        category: "sports",
        description: "Premium eco-friendly yoga mat with alignment guides",
        image: "https://via.placeholder.com/300x300?text=Yoga+Mat",
        featured: false,
        popular: false,
        onSale: true,
        stock: 50,
        rating: 4.1,
      },
    ];

    let filteredProducts = products;

    if (category) {
      filteredProducts = filteredProducts.filter(
        (p) => p.category === category
      );
    }

    if (search) {
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (featured === "true") {
      filteredProducts = filteredProducts.filter((p) => p.featured);
    }

    if (popular === "true") {
      filteredProducts = filteredProducts.filter((p) => p.popular);
    }

    if (onSale === "true") {
      filteredProducts = filteredProducts.filter((p) => p.onSale);
    }

    res.json(filteredProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    // Mock data - replace with Firestore query
    const products = [
      {
        id: "1",
        title: "Smartphone Pro",
        price: 899.99,
        category: "electronics",
        description: "Latest smartphone with advanced features",
        image: "https://via.placeholder.com/300x300?text=Smartphone",
        featured: true,
      },
    ];

    const product = products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Categories route
app.get("/api/categories", (req, res) => {
  const categories = [
    { id: "electronics", name: "Electronics" },
    { id: "sports", name: "Sports" },
    { id: "home", name: "Home & Garden" },
    { id: "fashion", name: "Fashion" },
  ];
  res.json(categories);
});

// Discount coupons/bonuses endpoint
app.get("/api/discount-coupons", (req, res) => {
  const coupons = [
    {
      id: "WELCOME10",
      code: "WELCOME10",
      description: "10% de descuento para nuevos usuarios",
      discount: 10,
      type: "percentage",
      minPurchase: 50000,
      maxDiscount: 20000,
      expiresAt: "2025-12-31",
      active: true,
      usageLimit: 100,
      usedCount: 25,
    },
    {
      id: "SAVE20",
      code: "SAVE20",
      description: "20% de descuento en compras superiores a $200,000",
      discount: 20,
      type: "percentage",
      minPurchase: 200000,
      maxDiscount: 50000,
      expiresAt: "2025-11-30",
      active: true,
      usageLimit: 50,
      usedCount: 12,
    },
    {
      id: "FIXED30",
      code: "FIXED30",
      description: "$30,000 de descuento fijo",
      discount: 30000,
      type: "fixed",
      minPurchase: 100000,
      maxDiscount: 30000,
      expiresAt: "2025-10-31",
      active: true,
      usageLimit: 200,
      usedCount: 89,
    },
  ];
  res.json(coupons);
});

// Validate discount coupon
app.post("/api/validate-coupon", (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    // Mock coupon validation
    const coupons = [
      {
        id: "WELCOME10",
        code: "WELCOME10",
        description: "10% de descuento para nuevos usuarios",
        discount: 10,
        type: "percentage",
        minPurchase: 50000,
        maxDiscount: 20000,
        active: true,
      },
      {
        id: "SAVE20",
        code: "SAVE20",
        description: "20% de descuento en compras superiores a $200,000",
        discount: 20,
        type: "percentage",
        minPurchase: 200000,
        maxDiscount: 50000,
        active: true,
      },
      {
        id: "FIXED30",
        code: "FIXED30",
        description: "$30,000 de descuento fijo",
        discount: 30000,
        type: "fixed",
        minPurchase: 100000,
        maxDiscount: 30000,
        active: true,
      },
    ];

    const coupon = coupons.find((c) => c.code === code.toUpperCase());

    if (!coupon) {
      return res.status(404).json({ error: "Cupón no válido", valid: false });
    }

    if (!coupon.active) {
      return res.status(400).json({ error: "Cupón expirado", valid: false });
    }

    if (cartTotal < coupon.minPurchase) {
      return res.status(400).json({
        error: `Compra mínima requerida: $${coupon.minPurchase.toLocaleString()}`,
        valid: false,
      });
    }

    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = Math.min(
        (cartTotal * coupon.discount) / 100,
        coupon.maxDiscount
      );
    } else if (coupon.type === "fixed") {
      discountAmount = coupon.discount;
    }

    res.json({
      valid: true,
      coupon: coupon,
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
    // Mock cart data
    const cart = {
      userId: req.params.userId,
      items: [
        {
          id: "1",
          productId: "1",
          title: "Smartphone Pro",
          price: 899.99,
          quantity: 1,
          image: "https://via.placeholder.com/300x300?text=Smartphone",
        },
      ],
    };
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/cart/:userId/add", async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    // Add to cart logic here
    res.json({ message: "Product added to cart", productId, quantity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/cart/:userId/update/:itemId", async (req, res) => {
  try {
    const { quantity } = req.body;
    // Update cart item logic here
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
    // Remove cart item logic here
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
  } catch (error) {
    console.error("❌ Error initializing Firestore data:", error);
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // Initialize Firestore data if needed
  if (db) {
    await initializeFirestoreData();
  }
});
