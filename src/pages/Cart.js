import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Alert,
  Form,
  Badge,
  ListGroup,
} from "react-bootstrap";
// import { useAuth } from "../contexts/AuthContext"; // Versión Firebase
import { useAuth } from "../contexts/AuthContextSafe"; // Versión segura con fallback
import { useCart } from "../contexts/CartContext";
import { Link } from "react-router-dom";
import CouponManager from "../components/CouponManager";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

function Cart() {
  const { currentUser } = useAuth();
  const {
    cartItems,
    removeFromCart,
    updateQuantity, // CORREGIDO: usar updateQuantity en lugar de updateCartItem
    getCartTotal,
    getCartItemsCount,
    clearCart,
  } = useCart();

  // Estados para cupones
  const [claimedCoupons, setClaimedCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Cargar cupones reclamados al montar el componente
  useEffect(() => {
    const loadClaimedCoupons = async () => {
      try {
        const userId = localStorage.getItem("userId") || "guest";

        // Obtener cupones de Firebase
        if (db) {
          const couponsQuery = query(
            collection(db, "cupones"),
            where("userId", "==", userId),
            where("used", "==", false)
          );
          const querySnapshot = await getDocs(couponsQuery);
          const firebaseCoupons = [];

          querySnapshot.forEach((doc) => {
            const couponData = doc.data();
            firebaseCoupons.push({
              id: doc.id,
              code: couponData.codigo || couponData.nombre,
              title: `Descuento ${couponData.descuento}% OFF`,
              discount: couponData.descuento,
              validUntil: couponData.fechaVencimiento,
              source: "firebase",
              ...couponData,
            });
          });

          if (firebaseCoupons.length > 0) {
            setClaimedCoupons(firebaseCoupons);
            return; // Salir temprano si encontramos cupones de Firebase
          }
        }

        // Respaldo a localStorage si no hay cupones de Firebase o no hay conexión Firebase
        const localCoupons = JSON.parse(
          localStorage.getItem("claimedCoupons") || "[]"
        );
        if (localCoupons.length > 0) {
          setClaimedCoupons(
            localCoupons.map((coupon) => ({
              ...coupon,
              source: "localStorage",
            }))
          );
        }
      } catch (error) {
        console.error("Error loading claimed coupons:", error);
        // Fallback a localStorage
        const localCoupons = JSON.parse(
          localStorage.getItem("claimedCoupons") || "[]"
        );
        setClaimedCoupons(
          localCoupons.map((coupon) => ({
            ...coupon,
            source: "localStorage",
          }))
        );
      }
    };

    loadClaimedCoupons();
  }, [currentUser]);

  // Función para manejar la aplicación de cupones
  const handleCouponApply = (couponData) => {
    setAppliedCoupon(couponData.coupon);
    setDiscountAmount(couponData.discountAmount);
  };

  // Función para remover cupón aplicado
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  // Función para eliminar cupón reclamado
  const handleDeleteClaimedCoupon = async (couponId, couponSource) => {
    try {
      const confirmDelete = window.confirm(
        "¿Estás seguro de que quieres eliminar este cupón reclamado? Esta acción no se puede deshacer."
      );

      if (!confirmDelete) {
        return;
      }

      // Delete from Firebase if it comes from Firebase
      if (couponSource === "firebase" && db) {
        try {
          await deleteDoc(doc(db, "cupones", couponId));
          console.log("Cupón eliminado de Firebase:", couponId);
        } catch (firebaseError) {
          console.error("Error eliminando de Firebase:", firebaseError);
        }
      }

      // Delete from localStorage if it comes from localStorage
      if (couponSource === "localStorage") {
        const localCoupons = JSON.parse(
          localStorage.getItem("claimedCoupons") || "[]"
        );
        const updatedCoupons = localCoupons.filter(
          (coupon) => coupon.id !== couponId
        );
        localStorage.setItem("claimedCoupons", JSON.stringify(updatedCoupons));
      }

      // Update local state
      setClaimedCoupons((prev) =>
        prev.filter((coupon) => coupon.id !== couponId)
      );

      // If the deleted coupon was the applied one, remove it
      if (appliedCoupon && appliedCoupon.id === couponId) {
        handleRemoveCoupon();
      }

      alert("Cupón eliminado exitosamente");
    } catch (error) {
      console.error("Error eliminando cupón:", error);
      alert("Error al eliminar el cupón. Inténtalo de nuevo.");
    }
  };

  // Función para calcular el precio con descuento
  const calculateDiscountedPrice = (precio, descuento) => {
    if (!descuento || descuento <= 0) return precio;
    return precio - (precio * descuento) / 100;
  };

  // Función segura para formatear precios - CORREGIDA
  const formatPrice = (price) => {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice === null || numPrice === undefined) {
      return "$0.00";
    }
    return `$${numPrice.toFixed(2)}`;
  };

  // Función para obtener el precio del producto (compatible con ambos formatos)
  const getProductPrice = (item) => {
    return item.precio || item.price || 0;
  };

  // Función para obtener el descuento del producto
  const getProductDiscount = (item) => {
    return item.descuento || item.discount || 0;
  };

  // Función para obtener el nombre del producto
  const getProductName = (item) => {
    return item.nombre || item.title || "Producto sin nombre";
  };

  // Función para obtener la imagen del producto
  const getProductImage = (item) => {
    return (
      item.img ||
      item.image ||
      "https://via.placeholder.com/100x100?text=Sin+Imagen"
    );
  };

  const handleRemoveItem = (itemId) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este producto del carrito?"
      )
    ) {
      removeFromCart(itemId);
    }
  };

  const handleClearCart = () => {
    if (window.confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
      clearCart();
    }
  };

  if (!currentUser) {
    return (
      <Container>
        <Alert variant="warning" className="text-center">
          <h4>Acceso Restringido</h4>
          <p>Debes iniciar sesión para ver tu carrito de compras.</p>
          <Link to="/login">
            <Button variant="primary">Iniciar Sesión</Button>
          </Link>
        </Alert>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container>
        <Alert variant="info" className="text-center">
          <h4>Carrito Vacío</h4>
          <p>No tienes productos en tu carrito de compras.</p>
          <Link to="/tienda">
            <Button variant="primary">Ir a la Tienda</Button>
          </Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>
              Carrito de Compras
              <Badge bg="primary" className="ms-2">
                {getCartItemsCount()}{" "}
                {getCartItemsCount() === 1 ? "producto" : "productos"}
              </Badge>
            </h2>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleClearCart}
            >
              Vaciar Carrito
            </Button>
          </div>
          <hr />
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio Unitario</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => {
                    const originalPrice = getProductPrice(item);
                    const discount = getProductDiscount(item);
                    const finalPrice =
                      discount > 0
                        ? calculateDiscountedPrice(originalPrice, discount)
                        : originalPrice;
                    const subtotal = finalPrice * item.quantity;

                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={getProductImage(item)}
                              alt={getProductName(item)}
                              style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                              }}
                              className="me-3"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/60x60?text=Sin+Imagen";
                              }}
                            />
                            <div>
                              <h6 className="mb-0">{getProductName(item)}</h6>
                              {discount > 0 && (
                                <small className="text-danger">
                                  Descuento: {discount}%
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {discount > 0 ? (
                            <>
                              <span className="text-danger fw-bold">
                                {formatPrice(finalPrice)}
                              </span>
                              <br />
                              <small className="text-decoration-line-through text-muted">
                                {formatPrice(originalPrice)}
                              </small>
                            </>
                          ) : (
                            <span className="fw-bold">
                              {formatPrice(finalPrice)}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              -
                            </Button>
                            <span className="mx-3">{item.quantity}</span>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              +
                            </Button>
                          </div>
                        </td>
                        <td className="fw-bold">{formatPrice(subtotal)}</td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              {/* Sección de cupones reclamados */}
              {claimedCoupons.length > 0 && (
                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>🎟️ Tus cupones disponibles</h5>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        const confirmDelete = window.confirm(
                          "¿Estás seguro de que quieres eliminar TODOS los cupones reclamados?"
                        );
                        if (confirmDelete) {
                          // Clear all coupons
                          setClaimedCoupons([]);
                          // Clear from localStorage
                          localStorage.removeItem("claimedCoupons");
                          // Clear from Firebase would require individual deletion
                          // Remove applied coupon if any
                          if (appliedCoupon) {
                            handleRemoveCoupon();
                          }
                          alert("Todos los cupones han sido eliminados");
                        }
                      }}
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
                  <Row>
                    {claimedCoupons.map((coupon, index) => (
                      <Col md={6} key={coupon.id || index} className="mb-3">
                        <Card className="border-success">
                          <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <Badge bg="success" className="mb-2">
                                  {coupon.discount || coupon.descuento}% OFF
                                </Badge>
                                <div className="fw-bold">
                                  {coupon.code || coupon.codigo}
                                </div>
                                <small className="text-muted">
                                  {coupon.title ||
                                    `Descuento ${
                                      coupon.discount || coupon.descuento
                                    }% OFF`}
                                </small>
                                {coupon.validUntil && (
                                  <div className="text-muted small">
                                    Válido hasta:{" "}
                                    {coupon.validUntil.toDate
                                      ? coupon.validUntil
                                          .toDate()
                                          .toLocaleDateString()
                                      : new Date(
                                          coupon.validUntil
                                        ).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                              <div className="d-flex flex-column align-items-end">
                                <Badge bg="secondary" className="small mb-2">
                                  Reclamado
                                </Badge>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteClaimedCoupon(
                                      coupon.id,
                                      coupon.source
                                    )
                                  }
                                  title="Eliminar cupón"
                                >
                                  <svg
                                    viewBox="0 0 1024 1024"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="#000000"
                                    width="16"
                                    height="16"
                                  >
                                    <g
                                      id="SVGRepo_bgCarrier"
                                      stroke-width="0"
                                    ></g>
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
                                  </svg>
                                </Button>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {/* Aplicar cupones */}
              <div className="mt-4">
                <CouponManager
                  cartTotal={getCartTotal()}
                  onCouponApply={handleCouponApply}
                />
              </div>

              <hr />

              <Row className="mt-4">
                <Col md={8}>
                  <Button
                    variant="outline-danger"
                    onClick={handleClearCart}
                    className="me-2"
                  >
                    Vaciar Carrito
                  </Button>
                  <Link to="/tienda">
                    <Button variant="outline-primary">
                      Continuar Comprando
                    </Button>
                  </Link>
                </Col>
                <Col md={4} className="text-end">
                  <Card bg="light">
                    <Card.Body>
                      <h5>Resumen del Pedido</h5>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <span>Subtotal:</span>
                        <strong>{formatPrice(getCartTotal())}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Envío:</span>
                        <span>Gratis</span>
                      </div>
                      {appliedCoupon && discountAmount > 0 && (
                        <>
                          <div className="d-flex justify-content-between text-success">
                            <span>
                              Descuento (
                              {appliedCoupon.codigo || appliedCoupon.code}):
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 ms-1 text-danger"
                                onClick={handleRemoveCoupon}
                                title="Remover cupón"
                              >
                                ✕
                              </Button>
                            </span>
                            <strong>-{formatPrice(discountAmount)}</strong>
                          </div>
                        </>
                      )}
                      <hr />
                      <div className="d-flex justify-content-between">
                        <strong>Total:</strong>
                        <strong className="text-primary">
                          {formatPrice(getCartTotal() - discountAmount)}
                        </strong>
                      </div>
                      <Button
                        variant="success"
                        className="w-100 mt-3"
                        size="lg"
                      >
                        Proceder al Pago
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Cart;
