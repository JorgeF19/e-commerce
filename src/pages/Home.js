import React, { useState, useEffect } from "react";
import { Container, Row, Col, Alert, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import ProductList from "../components/ProductList";

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllProducts();
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

  return (
    <Container>
      {/* Hero Section */}
      <div className="bg-primary text-white p-5 rounded mb-5">
        <Row>
          <Col md={8}>
            <h1 className="display-4">¡Bienvenido a TechStore!</h1>
            <p className="lead">
              Descubre los mejores productos tecnológicos al mejor precio. Desde
              smartphones hasta accesorios para el hogar, tenemos todo lo que
              necesitas.
            </p>
            <hr className="my-4" />
            <p>
              Navega por nuestras categorías y encuentra ofertas increíbles
              todos los días.
            </p>
            <Link to="/store">
              <Button variant="light" size="lg">
                Explorar Tienda
              </Button>
            </Link>
          </Col>
        </Row>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      )}

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
              <h4>🚚 Envío Gratis</h4>
              <p>En compras superiores a $100,000</p>
            </div>
          </Col>
          <Col md={4} className="text-center mb-4">
            <div className="bg-light p-4 rounded">
              <h4>🔒 Pago Seguro</h4>
              <p>Tus datos están protegidos</p>
            </div>
          </Col>
          <Col md={4} className="text-center mb-4">
            <div className="bg-light p-4 rounded">
              <h4>📞 Soporte 24/7</h4>
              <p>Te ayudamos cuando lo necesites</p>
            </div>
          </Col>
        </Row>
      </section>
    </Container>
  );
}

export default Home;
