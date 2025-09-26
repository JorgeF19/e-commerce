import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContextSafe"; // Hook de autenticación
import "./Navigation.css";

function Navigation() {
  const { currentUser, logout } = useAuth();

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
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/store">Tienda</Nav.Link>
            <Nav.Link as={Link} to="/cart">Carrito</Nav.Link>

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
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
