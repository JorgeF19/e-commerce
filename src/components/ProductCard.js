import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContextSafe";
import { useCart } from "../contexts/CartContext";

const ProductCard = ({ product }) => {
  const { currentUser } = useAuth();
  const { addToCart } = useCart(); // Solo necesitamos addToCart aquí

  // Función para calcular el precio con descuento
  const calculateDiscountedPrice = (precio, descuento) => {
    if (!descuento || descuento <= 0) return precio;
    return precio - (precio * descuento) / 100;
  };

  const {
    nombre,
    precio,
    descuento,
    categoria,
    descripcion,
    img,
    destacado,
    popular,
    stock,
    rating,
  } = product;

  const hasDiscount = descuento && descuento > 0;
  const discountedPrice = hasDiscount
    ? calculateDiscountedPrice(precio, descuento)
    : precio;
  const isOutOfStock = stock === 0;

  const handleAddToCart = () => {
    if (!currentUser) {
      alert("Debes iniciar sesión para agregar productos al carrito");
      return;
    }

    if (isOutOfStock) {
      alert("Este producto no tiene stock disponible");
      return;
    }

    addToCart(product);
  };

  return (
    <Card className="h-100">
      <div className="position-relative">
        <Card.Img
          variant="top"
          src={img}
          style={{ height: "200px", objectFit: "cover" }}
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/300x200?text=Imagen+no+disponible";
          }}
        />

        {/* Badges de estado */}
        <div className="position-absolute top-0 start-0 p-2">
          {destacado && (
            <Badge bg="warning" className="me-1 mb-1">
              Destacado
            </Badge>
          )}
          {popular && (
            <Badge bg="info" className="me-1 mb-1">
              Popular
            </Badge>
          )}
          {hasDiscount && (
            <Badge bg="danger" className="me-1 mb-1">
              -{descuento}%
            </Badge>
          )}
          {isOutOfStock && (
            <Badge bg="secondary" className="me-1 mb-1">
              Sin Stock
            </Badge>
          )}
        </div>
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title className="h5">{nombre}</Card.Title>
        <Card.Text className="text-muted small">
          Categoría: {categoria}
        </Card.Text>
        <Card.Text className="flex-grow-1">{descripcion}</Card.Text>

        {/* Rating */}
        {rating && (
          <div className="mb-2">
            <small className="text-warning">
              {"★".repeat(Math.floor(rating))}
              {"☆".repeat(5 - Math.floor(rating))}
            </small>
            <small className="text-muted ms-1">({rating})</small>
          </div>
        )}

        {/* Precio */}
        <div className="mb-3">
          {hasDiscount ? (
            <>
              <span className="h5 text-danger me-2">
                ${discountedPrice.toFixed(2)}
              </span>
              <span className="text-decoration-line-through text-muted">
                ${precio.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="h5 text-primary">${precio.toFixed(2)}</span>
          )}
        </div>

        {/* Stock info */}
        {stock !== undefined && (
          <Card.Text className="small text-muted">
            Stock disponible: {stock} unidades
          </Card.Text>
        )}

        <Button
          variant={isOutOfStock ? "secondary" : "primary"}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="mt-auto"
        >
          {isOutOfStock ? "Sin Stock" : "Agregar al Carrito"}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
