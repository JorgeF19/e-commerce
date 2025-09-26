import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Alert,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { db } from "../firebase/config"; // Adjust path as needed
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import ProductList from "../components/ProductList";
import CouponList from "../components/CouponList";

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [error, setError] = useState("");
  const [couponsError, setCouponsError] = useState("");
  const [claimingCoupon, setClaimingCoupon] = useState(false);
  const [claimedCoupons, setClaimedCoupons] = useState(new Set());

  // Estados para el modal de crear producto
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    categoria: "",
    descripcion: "",
    img: "",
    nombre: "",
    precio: 0,
    rating: 0,
    stock: 0,
  });

  useEffect(() => {
    fetchAllProducts();
    fetchCoupons();
    checkClaimedCoupons();
  }, []);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);

      // Fetch all products first
      const allProductsResponse = await axios.get(
        "http://localhost:5000/api/products"
      );

      // Filter featured products
      const featuredProductsFiltered = allProductsResponse.data.filter(
        (product) => product.destacado === true || product.destacado === "true"
      );
      setFeaturedProducts(featuredProductsFiltered);

      // Filter sale products
      const saleProductsFiltered = allProductsResponse.data.filter(
        (product) =>
          product.enDescuento === true || product.enDescuento === "true"
      );
      setSaleProducts(saleProductsFiltered);

      // Filter popular products
      const popularProductsFiltered = allProductsResponse.data.filter(
        (product) => product.popular === true || product.popular === "true"
      );
      setPopularProducts(popularProductsFiltered);
    } catch (error) {
      setError("Error al cargar productos");
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      setCouponsLoading(true);
      setCouponsError("");

      console.log("🎟️ Fetching coupons from backend...");
      const response = await axios.get("http://localhost:5000/api/coupons");

      console.log("🎟️ Coupons received:", response.data);
      setCoupons(response.data);
    } catch (error) {
      setCouponsError("Error al cargar cupones");
      console.error("Error fetching coupons:", error);

      // If backend fails, show empty array instead of mock data
      setCoupons([]);
    } finally {
      setCouponsLoading(false);
    }
  };

  const checkClaimedCoupons = async () => {
    try {
      // Get current user ID
      const userId = localStorage.getItem("userId") || "guest";

      // Check localStorage first (reliable source)
      const localClaimedCoupons = JSON.parse(
        localStorage.getItem("claimedCoupons") || "[]"
      );

      const claimed = new Set();

      // Add coupon codes from localStorage (to prevent duplicate codes)
      localClaimedCoupons.forEach((coupon) => {
        if (coupon.userId === userId) {
          claimed.add(coupon.code); // Use code instead of couponId
        }
      });

      // Try to also check Firebase (additional source, not critical)
      try {
        if (db) {
          const q = query(
            collection(db, "cupones"),
            where("userId", "==", userId)
          );
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((doc) => {
            const couponData = doc.data();
            // Add the code from original data or fallback to couponId
            const code = couponData.originalCouponData?.code || couponData.code;
            if (code) {
              claimed.add(code);
            }
          });

          console.log("✅ Cupones verificados desde Firebase y localStorage");
        }
      } catch (firebaseError) {
        console.warn(
          "⚠️ Error verificando cupones en Firebase (usando localStorage):",
          firebaseError.message
        );
        // Firebase error doesn't affect functionality
      }

      setClaimedCoupons(claimed); // Now stores codes, not IDs
    } catch (error) {
      console.error("❌ Error checking claimed coupons:", error);

      // Fallback: just use empty set
      setClaimedCoupons(new Set());
    }
  };

  const handleClaimCoupon = async (coupon) => {
    try {
      setClaimingCoupon(true);

      // Check if coupon code is already claimed (prevent duplicate codes)
      if (claimedCoupons.has(coupon.code)) {
        alert(
          `El cupón con código "${coupon.code}" ya ha sido reclamado. No puedes reclamar el mismo cupón dos veces.`
        );
        return;
      }

      // Get user ID
      const userId = localStorage.getItem("userId") || "guest";

      // Check existing coupons in localStorage for duplicate codes
      const localClaimedCoupons = JSON.parse(
        localStorage.getItem("claimedCoupons") || "[]"
      );

      // Check if this specific coupon code already exists for this user
      const duplicateCode = localClaimedCoupons.find(
        (claimedCoupon) =>
          claimedCoupon.userId === userId && claimedCoupon.code === coupon.code
      );

      if (duplicateCode) {
        alert(
          `Ya tienes un cupón con el código "${coupon.code}". No puedes reclamar el mismo cupón dos veces.`
        );
        return;
      }

      // Create coupon data
      const couponData = {
        id: `${Date.now()}_${coupon.id}`, // Unique ID for localStorage
        nombre: `cupon${coupon.discount}%off`,
        descuento: coupon.discount,
        userId: userId,
        couponId: coupon.id,
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        validUntil: coupon.validUntil,
        minPurchase: coupon.minPurchase,
        category: coupon.category,
        claimedAt: new Date().toISOString(),
        used: false,
      };

      // Save to localStorage first (reliable fallback)
      const updatedClaimedCoupons = [...localClaimedCoupons, couponData];
      localStorage.setItem(
        "claimedCoupons",
        JSON.stringify(updatedClaimedCoupons)
      );

      // Update local state with coupon code
      setClaimedCoupons((prev) => new Set([...prev, coupon.code]));

      // Try to save to Firestore (optional, won't block success)
      try {
        if (db) {
          // Check if this specific coupon code already exists in Firestore for this user
          const existingCodeQuery = query(
            collection(db, "cupones"),
            where("userId", "==", userId),
            where("code", "==", coupon.code)
          );

          const existingCodeSnapshot = await getDocs(existingCodeQuery);

          if (existingCodeSnapshot.empty) {
            // Only save to Firestore if this code doesn't exist for this user
            const firestoreDoc = {
              ...couponData,
              claimedAt: serverTimestamp(),
            };

            const docRef = await addDoc(
              collection(db, "cupones"),
              firestoreDoc
            );
            console.log(
              "✅ Cupón también guardado en Firestore con ID:",
              docRef.id
            );
          } else {
            console.log("⚠️ Cupón con este código ya existe en Firestore");
          }
        }
      } catch (firebaseError) {
        console.warn(
          "⚠️ Error de Firebase (cupón guardado localmente):",
          firebaseError.message
        );
        // Firebase error doesn't affect the main functionality
      }

      // Show success message
      alert(`¡Cupón ${coupon.code} reclamado exitosamente!`);
      console.log("✅ Cupón guardado:", couponData);
    } catch (error) {
      console.error("❌ Error claiming coupon:", error);
      alert("Error al reclamar el cupón. Inténtalo de nuevo.");
    } finally {
      setClaimingCoupon(false);
    }
  };

  // Function to delete a specific claimed coupon (currently not used in UI)
  // const handleDeleteClaimedCoupon = async (couponId) => {
  //   try {
  //     // Confirm deletion
  //     const confirmDelete = window.confirm(
  //       "¿Estás seguro de que quieres eliminar este cupón reclamado? Esta acción no se puede deshacer."
  //     );

  //     if (!confirmDelete) {
  //       return;
  //     }

  //     // Delete from Firebase
  //     if (db) {
  //       try {
  //         await deleteDoc(doc(db, "cupones", couponId));
  //         console.log("Cupón eliminado de Firebase:", couponId);
  //       } catch (firebaseError) {
  //         console.error("Error eliminando de Firebase:", firebaseError);
  //         // Continue with localStorage deletion even if Firebase fails
  //       }
  //     }

  //     // Delete from localStorage
  //     const claimedCoupons = JSON.parse(
  //       localStorage.getItem("claimedCoupons") || "[]"
  //     );
  //     const updatedCoupons = claimedCoupons.filter(
  //       (coupon) => coupon.id !== couponId
  //     );
  //     localStorage.setItem("claimedCoupons", JSON.stringify(updatedCoupons));

  //     // Update local state
  //     setClaimedCoupons((prev) => {
  //       const updated = new Set(prev);
  //       updated.delete(couponId);
  //       return updated;
  //     });

  //     alert("Cupón eliminado exitosamente");

  //     // Refresh the claimed coupons list
  //     checkClaimedCoupons();
  //   } catch (error) {
  //     console.error("Error eliminando cupón:", error);
  //     alert("Error al eliminar el cupón. Inténtalo de nuevo.");
  //   }
  // };

  const handleClearAllClaimedCoupons = async () => {
    try {
      const userId = localStorage.getItem("userId") || "guest";

      // Confirm deletion
      const confirmDelete = window.confirm(
        "¿Estás seguro de que quieres eliminar TODOS los cupones reclamados? Esta acción no se puede deshacer."
      );

      if (!confirmDelete) {
        return;
      }

      // Delete all from Firebase
      if (db) {
        try {
          const couponsQuery = query(
            collection(db, "cupones"),
            where("userId", "==", userId)
          );
          const querySnapshot = await getDocs(couponsQuery);

          const deletePromises = [];
          querySnapshot.forEach((couponDoc) => {
            deletePromises.push(deleteDoc(doc(db, "cupones", couponDoc.id)));
          });

          await Promise.all(deletePromises);
          console.log("Todos los cupones eliminados de Firebase");
        } catch (firebaseError) {
          console.error("Error eliminando de Firebase:", firebaseError);
        }
      }

      // Clear localStorage
      localStorage.removeItem("claimedCoupons");

      // Update local state
      setClaimedCoupons(new Set());

      alert("Todos los cupones reclamados han sido eliminados");
    } catch (error) {
      console.error("Error eliminando todos los cupones:", error);
      alert("Error al eliminar los cupones. Inténtalo de nuevo.");
    }
  };

  // Funciones para manejar el modal de crear producto
  const handleShowCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewProduct({
      categoria: "",
      descripcion: "",
      img: "",
      nombre: "",
      precio: 0,
      rating: 0,
      stock: 0,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      setCreatingProduct(true);

      // Validar campos requeridos
      if (!newProduct.nombre || !newProduct.categoria || !newProduct.precio) {
        alert(
          "Por favor completa los campos obligatorios: Nombre, Categoría y Precio"
        );
        return;
      }

      // Enviar producto al backend
      const response = await axios.post("http://localhost:5000/api/products", {
        ...newProduct,
        destacado: false,
        enDescuento: false,
        popular: false,
      });

      if (response.status === 201) {
        alert("¡Producto creado exitosamente!");
        handleCloseCreateModal();
        // Recargar productos para mostrar el nuevo
        fetchAllProducts();
      }
    } catch (error) {
      console.error("Error creando producto:", error);
      alert("Error al crear el producto. Inténtalo de nuevo.");
    } finally {
      setCreatingProduct(false);
    }
  };

  return (
    <Container>
      {/* Hero Section */}
      <div className="bg-primary text-white p-5 rounded mb-5">
        <Row>
          <Col md={8}>
            <h1 className="display-4 fw-bold">¡Bienvenido a TechStore!</h1>
            <p className="lead">
              Descubre los mejores productos tecnológicos al mejor precio. Desde
              smartphones hasta accesorios para el hogar.
            </p>
            <hr className="my-4" />
            <p>
              Navega por nuestras categorías y encuentra ofertas increíbles
              todos los días.
            </p>
            <div className="d-flex gap-3">
              <Link to="/store">
                <Button variant="light" size="lg">
                  Explorar Tienda
                </Button>
              </Link>
              <Button
                variant="outline-light"
                size="lg"
                onClick={handleShowCreateModal}
              >
                ➕ Crear Producto
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      )}

      {/* Coupons Section */}
      <section className="mb-5">
        <Row className="mb-4">
          <Col className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-warning">🎟️ Cupones de Descuento</h2>
              <p className="text-muted">
                Reclama estos cupones y úsalos en tu próxima compra
                {claimedCoupons.size > 0 && " (Ya tienes un cupón activo)"}
              </p>
            </div>
          </Col>
        </Row>

        {claimingCoupon && (
          <Alert variant="info" className="text-center">
            Reclamando cupón...
          </Alert>
        )}

        <CouponList
          coupons={coupons}
          loading={couponsLoading}
          error={couponsError}
          onClaimCoupon={handleClaimCoupon}
          claimedCoupons={claimedCoupons}
          claimingCoupon={claimingCoupon}
        />

        {/* Sección de cupones reclamados */}
        {claimedCoupons.size > 0 && (
          <div className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="text-success">🎟️ Tus Cupones Reclamados</h3>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleClearAllClaimedCoupons}
              >
                <svg
                  viewBox="0 0 1024 1024"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#000000"
                  width="16"
                  height="16"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      fill="#000000"
                      d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32V256zm448-64v-64H416v64h192zM224 896h576V256H224v640zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32zm192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32z"
                    ></path>
                  </g>
                </svg>{" "}
                Eliminar Todos
              </Button>
            </div>
            <Alert
              variant="success"
              className="d-flex align-items-center justify-content-between"
            >
              <div>
                <strong>¡Genial!</strong> Tienes {claimedCoupons.size} cupón(es)
                reclamado(s).
                <br />
                <small>
                  Puedes usarlos en el carrito de compras o eliminarlos si ya no
                  los necesitas.
                </small>
              </div>
              <div>
                <Link to="/carrito">
                  <Button variant="success" size="sm" className="me-2">
                    💳 Ir al Carrito
                  </Button>
                </Link>
              </div>
            </Alert>
            <p className="text-muted small">
              💡 <strong>Tip:</strong> Los cupones reclamados aparecerán
              automáticamente en tu carrito de compras donde podrás aplicarlos.
            </p>
          </div>
        )}
      </section>

      {/* Sale Products Section */}
      <section className="mb-5">
        <Row className="mb-4">
          <Col className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-danger"> Productos en Descuento</h2>
              <p className="text-muted">¡Aprovecha estas ofertas especiales!</p>
            </div>
            <Link to="/store?onSale=true">
              <Button variant="outline-danger">Ver Todas las Ofertas</Button>
            </Link>
          </Col>
        </Row>

        <ProductList
          products={saleProducts.slice(0, 4)}
          loading={loading}
          error=""
          showAddToCart={true}
        />
      </section>

      {/* Popular Products Section */}
      <section className="mb-5">
        <Row className="mb-4">
          <Col className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-success"> Productos Populares</h2>
              <p className="text-muted">Los más vendidos y mejor valorados</p>
            </div>
            <Link to="/store?popular=true">
              <Button variant="outline-success">Ver Todos los Populares</Button>
            </Link>
          </Col>
        </Row>

        <ProductList
          products={popularProducts.slice(0, 4)}
          loading={loading}
          error=""
          showAddToCart={true}
        />
      </section>

      {/* Featured Products Section */}
      <section className="mb-5">
        <Row className="mb-4">
          <Col className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-primary"> Productos Destacados</h2>
              <p className="text-muted">Seleccionados especialmente para ti</p>
            </div>
            <Link to="/store?featured=true">
              <Button variant="outline-primary">
                Ver Todos los Destacados
              </Button>
            </Link>
          </Col>
        </Row>

        <ProductList
          products={featuredProducts.slice(0, 4)}
          loading={loading}
          error=""
          showAddToCart={true}
        />
      </section>

      {/* Features Section */}
      <section className="my-5">
        <Row>
          <Col md={4} className="text-center mb-4">
            <div className="bg-light p-4 rounded">
              <h4>Envío Gratis</h4>
              <p>En compras superiores a $100,000</p>
            </div>
          </Col>
          <Col md={4} className="text-center mb-4">
            <div className="bg-light p-4 rounded">
              <h4>Pago Seguro</h4>
              <p>Tus datos están protegidos</p>
            </div>
          </Col>
          <Col md={4} className="text-center mb-4">
            <div className="bg-light p-4 rounded">
              <h4>Soporte 24/7</h4>
              <p>Te ayudamos cuando lo necesites</p>
            </div>
          </Col>
        </Row>
      </section>

      {/* Modal para crear nuevo producto */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>🆕 Crear Nuevo Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateProduct}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del Producto *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={newProduct.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej: iPhone 15 Pro"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Categoría *</Form.Label>
                  <Form.Control
                    type="text"
                    name="categoria"
                    value={newProduct.categoria}
                    onChange={handleInputChange}
                    placeholder="Ej: Software, Hardware, Móviles"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={newProduct.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción detallada del producto..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>URL de Imagen</Form.Label>
              <Form.Control
                type="url"
                name="img"
                value={newProduct.img}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {newProduct.img && (
                <div className="mt-2">
                  <small className="text-muted">Vista previa:</small>
                  <div className="mt-1">
                    <img
                      src={newProduct.img}
                      alt="Vista previa"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio *</Form.Label>
                  <Form.Control
                    type="number"
                    name="precio"
                    value={newProduct.precio}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Rating (1-5)</Form.Label>
                  <Form.Control
                    type="number"
                    name="rating"
                    value={newProduct.rating}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={newProduct.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                variant="secondary"
                onClick={handleCloseCreateModal}
                disabled={creatingProduct}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={creatingProduct}
              >
                {creatingProduct ? "Creando..." : "✅ Crear Producto"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Home;
