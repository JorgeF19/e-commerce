// Test script to directly test categories endpoint logic
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.firestore();

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
    "Tecnologia": "Tecnología",
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

async function testCategories() {
  try {
    console.log("🔍 Testing categories extraction...");
    console.log("🔍 DB connection status:", db ? "Connected" : "Not connected");
    
    // Try to get categories from Firestore first
    if (db) {
      try {
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
            `📂 Retrieved ${categoryData.length} categories from categorias collection:`,
            categoryData
          );
          return categoryData;
        }

        // If no categories collection, extract from products
        console.log("🔍 No categorias collection found, extracting from products...");
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
        return categoryData;
      } catch (firestoreError) {
        console.error(
          "❌ Firestore query failed for categories:",
          firestoreError.message,
          firestoreError.stack
        );
      }
    } else {
      console.log("❌ No DB connection available");
    }

    // Fallback to mock data
    console.log("📦 Would use mock categories data");
    return null;
  } catch (error) {
    console.error("❌ Categories test error:", error.message, error.stack);
    return null;
  }
}

testCategories().then((result) => {
  console.log("✅ Test completed");
  if (result) {
    console.log("Final result:", JSON.stringify(result, null, 2));
  }
  process.exit(0);
});