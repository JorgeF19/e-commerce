import React from "react";
import { Navbar, Nav, Container, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContextSafe"; // Hook de autenticación
import "./Navigation.css";
import { LinkContainer } from "react-router-bootstrap";
import { useCart } from "../contexts/CartContext";
function Navigation() {
  const { currentUser, logout } = useAuth();
  const { getCartItemsCount } = useCart();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm py-3">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src="/logo.png"
            alt="Tech Store"
            height="40"
            className="d-inline-block align-top"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
<Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>Inicio</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/tienda">
              <Nav.Link>Tienda</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/carrito">
              <Nav.Link>
                Carrito
                {currentUser && getCartItemsCount() > 0 && (
                  <Badge bg="danger" className="ms-2">
                    {getCartItemsCount()}
                  </Badge>
                )}
              </Nav.Link>
            </LinkContainer>
          </Nav>

            {currentUser ? (
              <>
                <span className="ms-3 fw-semibold text-primary">
                  👋 Bienvenido {currentUser.displayName || currentUser.email}
                </span>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="ms-3"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}
              </Navbar.Collapse>
      </Container>
      </Navbar>
  
);
}
export default Navigation;