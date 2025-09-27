import React from "react";
import { Card, Button, Badge } from "react-bootstrap";

function Coupon({ coupon, onClaim, isAlreadyClaimed, claimingCoupon }) {
  const handleClaim = () => {
    onClaim(coupon);
    // Nota: la lógica de localStorage ahora se maneja en el componente padre (Home.js)
  };

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body className="d-flex flex-column">
        <div className="text-center mb-3">
          <Badge bg="success" className="fs-6 p-2">
            {coupon.discount}% OFF
          </Badge>
        </div>
        <Card.Title className="text-center h5">{coupon.title}</Card.Title>
        <Card.Text className="text-muted text-center flex-grow-1">
          {coupon.description}
        </Card.Text>
        <div className="text-center">
          <small className="text-muted d-block mb-2">
            Código: <strong>{coupon.code}</strong>
          </small>

          <Button
            variant={isAlreadyClaimed ? "secondary" : "primary"}
            onClick={handleClaim}
            disabled={isAlreadyClaimed || claimingCoupon}
            className="w-100"
          >
            {claimingCoupon
              ? "Reclamando..."
              : isAlreadyClaimed
              ? "✓ Ya Reclamado"
              : "Reclamar Cupón"}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default Coupon;
