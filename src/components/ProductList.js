import React from "react";
import { Row, Col, Alert, Spinner } from "react-bootstrap";
import ProductCard from "./ProductCard";

function ProductList({ products, loading, error, showAddToCart = true }) {
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        {error}
      </Alert>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Alert variant="info" className="text-center">
        No se encontraron productos.
      </Alert>
    );
  }

  return (
    <Row>
      {products.map((product) => (
        <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
          <ProductCard product={product} showAddToCart={showAddToCart} />
        </Col>
      ))}
    </Row>
  );
}

export default ProductList;
