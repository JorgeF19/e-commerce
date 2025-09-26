import React from "react";
import { Row, Col, Spinner, Alert } from "react-bootstrap";
import Coupon from "./Coupon";

function CouponList({
  coupons,
  loading,
  error,
  onClaimCoupon,
  claimedCoupons,
  claimingCoupon,
}) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando cupones...</span>
        </Spinner>
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

  if (!coupons || coupons.length === 0) {
    return (
      <Alert variant="info" className="text-center">
        No hay cupones disponibles en este momento.
      </Alert>
    );
  }

  return (
    <Row>
      {coupons.map((coupon) => (
        <Col key={coupon.id} lg={3} md={4} sm={6} className="mb-4">
          <Coupon
            coupon={coupon}
            onClaim={onClaimCoupon}
            isAlreadyClaimed={claimedCoupons && claimedCoupons.has(coupon.code)}
            claimingCoupon={claimingCoupon}
          />
        </Col>
      ))}
    </Row>
  );
}

export default CouponList;
