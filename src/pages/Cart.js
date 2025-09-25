import React from "react";
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
} from "react-bootstrap";
// import { useAuth } from "../contexts/AuthContext"; // Firebase version
import { useAuth } from "../contexts/AuthContextSafe"; // Safe version with fallback
import { useCart } from "../contexts/CartContext";
import { Link } from "react-router-dom";

function Cart() {
  const { currentUser } = useAuth();
  const {
    cartItems,
    loading,
    removeFromCart,
    updateCartItem,
    getCartTotal,
    getCartItemCount,
    clearCart,
  } = useCart();

  const formatPrice = (price) => {
    return `$${price.toLocaleString("es-CO", { minimumFractionDigits: 2 })}`;
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity >= 1) {
      updateCartItem(itemId, parseInt(newQuantity));
    }
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
          <h4>Debes iniciar sesión para ver tu carrito</h4>
          <Link to="/login">
            <Button variant="primary">Iniciar Sesión</Button>
          </Link>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando carrito...</p>
        </div>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <Card className="p-5">
              <Card.Body>
                <h3>Tu carrito está vacío</h3>
                <p className="text-muted mb-4">
                  ¡Agrega algunos productos increíbles a tu carrito!
                </p>
                <Link to="/store">
                  <Button variant="primary" size="lg">
                    Ir a la Tienda
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
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
                {getCartItemCount()}{" "}
                {getCartItemCount() === 1 ? "producto" : "productos"}
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
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={item.image}
                            alt={item.title}
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                            className="me-3 rounded"
                          />
                          <div>
                            <h6 className="mb-0">{item.title}</h6>
                          </div>
                        </div>
                      </td>
                      <td>{formatPrice(item.price)}</td>
                      <td>
                        <Form.Control
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(item.id, e.target.value)
                          }
                          style={{ width: "80px" }}
                        />
                      </td>
                      <td className="fw-bold">
                        {formatPrice(item.price * item.quantity)}
                      </td>
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
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="sticky-top" style={{ top: "20px" }}>
            <Card.Header>
              <h5 className="mb-0">Resumen del Pedido</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Envío:</span>
                <span className="text-success">Gratis</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong className="text-primary">
                  {formatPrice(getCartTotal())}
                </strong>
              </div>

              <div className="d-grid gap-2">
                <Button variant="success" size="lg">
                  Proceder al Pago
                </Button>
                <Link to="/store">
                  <Button variant="outline-primary" className="w-100">
                    Seguir Comprando
                  </Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Cart;
