import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import { AuthProvider } from "./contexts/AuthContextSafe";
import { CartProvider, useCart } from "./contexts/CartContext";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Store from "./pages/Store";
import Cart from "./pages/Cart";
import Login from "./components/Login";
import Register from "./components/Register";
import WhatsAppButton from "./components/WhatsAppButton";
import ToastNotification from "./components/ToastNotification";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Componente para mostrar las notificaciones
const NotificationWrapper = () => {
  const { notification, hideNotification } = useCart();

  return (
    <ToastNotification
      show={notification.show}
      onClose={hideNotification}
      message={notification.message}
      variant={notification.variant}
    />
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Navigation />
            <Container className="mt-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tienda" element={<Store />} />
                <Route path="/carrito" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </Container>
            <WhatsAppButton />
            <NotificationWrapper />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
