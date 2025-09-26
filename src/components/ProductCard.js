import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { useCart } from "../contexts/CartContext";
// import { useAuth } from '../contexts/AuthContext'; // Firebase version
import { useAuth } from "../contexts/AuthContextSafe"; // Safe version with fallback

function ProductCard({ product, showAddToCart = true }) {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();

  const handleAddToCart = () => {
    if (!currentUser) {
      alert("Por favor inicia sesión para agregar productos al carrito");
      return;
    }
    addToCart(product);
  };

  const formatPrice = (price) => {
    return `$${price.toLocaleString("es-CO", { minimumFractionDigits: 2 })}`;
  };

  // Función para calcular precio con descuento
  const calculateDiscountedPrice = (precio, descuento) => {
    if (!descuento || descuento <= 0) return precio;
    return precio - (precio * descuento) / 100;
  };

  const hasDiscount =
    product.enDescuento && product.descuento && product.descuento > 0;
  const finalPrice = hasDiscount
    ? calculateDiscountedPrice(product.precio, product.descuento)
    : product.precio;

  return (
    <Card className="h-100 shadow-sm position-relative">
      {hasDiscount && (
        <Badge
          bg="danger"
          className="position-absolute top-0 start-0 m-2"
          style={{ zIndex: 1 }}
        >
          -{product.descuento}%
        </Badge>
      )}

      {/* Imagen del producto con fallback */}
      <Card.Img
        variant="top"
        src={product.img || "/default-product.png"}
        alt={product.nombre}
        className="product-image"
      />

      <Card.Body className="d-flex flex-column">
        <Card.Title className="h6">{product.nombre}</Card.Title>
        <Card.Text className="text-muted small flex-grow-1">
          {product.descripcion}
        </Card.Text>

        {/* Rating */}
        {product.rating && (
          <div className="mb-2">
            <small className="text-warning">
              {"★".repeat(Math.floor(product.rating))} {product.rating}/5
            </small>
          </div>
        )}

        {/* Stock info */}
        {product.stock !== undefined && (
          <div className="mb-2">
            <small
              className={product.stock > 0 ? "text-success" : "text-danger"}
            >
              {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}
            </small>
          </div>
        )}

        {/* Badges */}
        <div className="mb-2">
          <Badge bg="secondary" className="me-2">
            {product.categoria}
          </Badge>
          {product.destacado && (
            <Badge bg="warning" className="me-1">
              Destacado
            </Badge>
          )}
          {product.popular && (
            <Badge bg="success" className="me-1">
              Popular
            </Badge>
          )}
          {product.enDescuento && <Badge bg="danger">En Oferta</Badge>}
        </div>

        {/* Precio + Botón */}
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <div>
            {hasDiscount ? (
              <>
                <div className="h6 mb-0 text-primary">
                  {formatPrice(finalPrice)}
                </div>
                <small className="text-muted text-decoration-line-through">
                  {formatPrice(product.precio)}
                </small>
              </>
            ) : (
              <div className="h5 mb-0 text-primary">
                {formatPrice(product.precio)}
              </div>
            )}
          </div>
          {showAddToCart && product.stock > 0 && (
            <Button variant="primary" size="sm" onClick={handleAddToCart}>
              Agregar al Carrito
            </Button>
          )}
          {product.stock === 0 && (
            <Button variant="outline-secondary" size="sm" disabled>
              Sin Stock
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;
