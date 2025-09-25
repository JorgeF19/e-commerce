import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  InputGroup,
  Badge,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import ProductList from "../components/ProductList";

function Store() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      let url = "http://localhost:5000/api/products";
      const params = new URLSearchParams();

      if (selectedCategory) {
        params.append("category", selectedCategory);
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (params.toString()) {
        url += "?" + params.toString();
      }

      const response = await axios.get(url);
      setProducts(response.data);
      setError("");
    } catch (error) {
      setError("Error al cargar productos");
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm, fetchProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Tienda</h2>
          <hr />
        </Col>
      </Row>

      {/* Filters Section */}
      <Row className="mb-4">
        <Col md={8}>
          <Form onSubmit={handleSearchSubmit}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline-primary" type="submit">
                Buscar
              </Button>
            </InputGroup>
          </Form>
        </Col>
        <Col md={4}>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Active Filters */}
      {(selectedCategory || searchTerm) && (
        <Row className="mb-3">
          <Col>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span>Filtros activos:</span>
              {selectedCategory && (
                <Badge bg="primary">
                  Categoría:{" "}
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </Badge>
              )}
              {searchTerm && (
                <Badge bg="primary">Búsqueda: "{searchTerm}"</Badge>
              )}
              <Button variant="link" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          </Col>
        </Row>
      )}

      {/* Results Count */}
      {!loading && (
        <Row className="mb-3">
          <Col>
            <small className="text-muted">
              {products.length} producto(s) encontrado(s)
            </small>
          </Col>
        </Row>
      )}

      {/* Products Grid */}
      <ProductList
        products={products}
        loading={loading}
        error={error}
        showAddToCart={true}
      />

      {/* No Results Message */}
      {!loading && products.length === 0 && !error && (
        <Alert variant="info" className="text-center">
          <h5>No se encontraron productos</h5>
          <p>
            Intenta modificar los filtros de búsqueda o navega por otras
            categorías.
          </p>
          <Button variant="primary" onClick={clearFilters}>
            Ver todos los productos
          </Button>
        </Alert>
      )}
    </Container>
  );
}

export default Store;
