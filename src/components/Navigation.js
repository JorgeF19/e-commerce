import React from "react";
import { Navbar, Nav, Container, Badge, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
// import { useAuth } from "../contexts/AuthContext"; // Firebase version
import { useAuth } from "../contexts/AuthContextSafe"; // Safe version with fallback
import { useCart } from "../contexts/CartContext";

function Navigation() {
  const { currentUser, logout } = useAuth();
  const { getCartItemCount } = useCart();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>TechStore</Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>Inicio</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/store">
              <Nav.Link>Tienda</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/cart">
              <Nav.Link>
                Carrito
                {currentUser && getCartItemCount() > 0 && (
                  <Badge bg="danger" className="ms-1">
                    {getCartItemCount()}
                  </Badge>
                )}
              </Nav.Link>
            </LinkContainer>
          </Nav>

          <Nav>
            {currentUser ? (
              <>
                <Navbar.Text className="me-3">
                  Hola, {currentUser.email}
                </Navbar.Text>
                <Button variant="outline-light" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>Iniciar Sesión</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Nav.Link>Registrarse</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
