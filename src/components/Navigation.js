import React from "react";

import { Navbar, Nav, Container, Badge } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useAuth } from "../contexts/AuthContextSafe";
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

    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>CucShop</Navbar.Brand>
        </LinkContainer>

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

                <Navbar.Text className="me-3">
                  Hola, {currentUser.email}
                </Navbar.Text>
                <Nav.Link onClick={handleLogout}>Cerrar Sesión</Nav.Link>

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
