import React, { useState } from "react";
import { Card, Form, Button, Alert, InputGroup, Badge } from "react-bootstrap";
import axios from "axios";

function CouponManager({ cartTotal, onCouponApply }) {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);

  const loadAvailableCoupons = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/discount-coupons"
      );
      setAvailableCoupons(response.data.filter((coupon) => coupon.active));
      setShowAvailableCoupons(true);
    } catch (error) {
      console.error("Error loading coupons:", error);
    }
  };

  const validateCoupon = async (code) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(
        "http://localhost:5000/api/validate-coupon",
        {
          code: code,
          cartTotal: cartTotal,
        }
      );

      if (response.data.valid) {
        setAppliedCoupon(response.data.coupon);
        setMessage(
          `¡Cupón aplicado! Ahorro: $${response.data.discountAmount.toLocaleString()}`
        );
        setMessageType("success");
        onCouponApply(response.data);
      }
    } catch (error) {
      setMessage(error.response?.data?.error || "Error al validar el cupón");
      setMessageType("danger");
      setAppliedCoupon(null);
      onCouponApply(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim()) {
      validateCoupon(couponCode.trim());
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setMessage("");
    onCouponApply(null);
  };

  const handleUseCoupon = (code) => {
    setCouponCode(code);
    validateCoupon(code);
    setShowAvailableCoupons(false);
  };

  const formatPrice = (price) => {
    return `$${price.toLocaleString("es-CO", { minimumFractionDigits: 2 })}`;
  };

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Cupones de Descuento</h6>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={loadAvailableCoupons}
        >
          Ver Cupones Disponibles
        </Button>
      </Card.Header>
      <Card.Body>
        {/* Applied Coupon Display */}
        {appliedCoupon && (
          <Alert
            variant="success"
            className="d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{appliedCoupon.code}</strong> -{" "}
              {appliedCoupon.description}
            </div>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleRemoveCoupon}
            >
              Remover
            </Button>
          </Alert>
        )}

        {/* Coupon Input Form */}
        {!appliedCoupon && (
          <Form onSubmit={handleApplyCoupon}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Ingresa tu código de cupón"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
              <Button
                variant="primary"
                type="submit"
                disabled={loading || !couponCode.trim()}
              >
                {loading ? "Validando..." : "Aplicar"}
              </Button>
            </InputGroup>
          </Form>
        )}

        {/* Message Display */}
        {message && (
          <Alert variant={messageType} className="mt-2 mb-0">
            {message}
          </Alert>
        )}

        {/* Available Coupons */}
        {showAvailableCoupons && availableCoupons.length > 0 && (
          <div className="mt-3">
            <h6>Cupones Disponibles:</h6>
            <div className="row">
              {availableCoupons.map((coupon) => (
                <div key={coupon.id} className="col-md-6 mb-2">
                  <Card className="h-100">
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Badge bg="primary">{coupon.code}</Badge>
                        <Badge bg="success">
                          {coupon.type === "percentage"
                            ? `${coupon.discount}%`
                            : formatPrice(coupon.discount)}
                        </Badge>
                      </div>
                      <p className="small mb-2">{coupon.description}</p>
                      <div className="small text-muted mb-2">
                        Compra mínima: {formatPrice(coupon.minPurchase)}
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="w-100"
                        onClick={() => handleUseCoupon(coupon.code)}
                        disabled={cartTotal < coupon.minPurchase}
                      >
                        {cartTotal < coupon.minPurchase
                          ? "No Elegible"
                          : "Usar Cupón"}
                      </Button>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default CouponManager;
