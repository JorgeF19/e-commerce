import React from "react";
import { Toast, ToastContainer } from "react-bootstrap";

const ToastNotification = ({ show, onClose, message, variant = "success" }) => {
  return (
    <ToastContainer
      position="top-end"
      className="p-3"
      style={{ position: "fixed", zIndex: 1050 }}
    >
      <Toast show={show} onClose={onClose} delay={3000} autohide bg={variant}>
        <Toast.Header>
          <strong className="me-auto">
            {variant === "success" ? "Producto agregado" : "mensaje"}
          </strong>
        </Toast.Header>
        <Toast.Body className="text-white">{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default ToastNotification;
