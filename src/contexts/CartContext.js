import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "./AuthContextSafe";

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export function CartProvider({ children }) {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    variant: "success",
  });

  // Función para mostrar notificaciones
  const showNotification = useCallback((message, variant = "success") => {
    setNotification({ show: true, message, variant });
  }, []);

  // Función para cerrar notificaciones
  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, show: false }));
  }, []);

  // Cargar carrito del localStorage cuando cambie el usuario
  useEffect(() => {
    if (currentUser) {
      const savedCart = localStorage.getItem(`cart_${currentUser.uid}`);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } else {
      setCartItems([]);
    }
  }, [currentUser]);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (currentUser && cartItems.length >= 0) {
      localStorage.setItem(
        `cart_${currentUser.uid}`,
        JSON.stringify(cartItems)
      );
    }
  }, [cartItems, currentUser]);

  const addToCart = useCallback(
    (product) => {
      if (!currentUser) {
        showNotification(
          "Debes iniciar sesión para agregar productos al carrito",
          "warning"
        );
        return;
      }

      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);

        if (existingItem) {
          const updatedItems = prevItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          showNotification(
            `Se agregó otra unidad de "${
              product.nombre || product.title
            }" al carrito`,
            "success"
          );
          return updatedItems;
        } else {
          const newItem = { ...product, quantity: 1 };
          showNotification(
            `"${
              product.nombre || product.title
            }" se agregó al carrito exitosamente`,
            "success"
          );
          return [...prevItems, newItem];
        }
      });
    },
    [currentUser, showNotification]
  );

  const removeFromCart = useCallback(
    (productId) => {
      setCartItems((prevItems) => {
        const itemToRemove = prevItems.find((item) => item.id === productId);
        const updatedItems = prevItems.filter((item) => item.id !== productId);

        if (itemToRemove) {
          showNotification(
            `"${
              itemToRemove.nombre || itemToRemove.title
            }" se eliminó del carrito`,
            "info"
          );
        }

        return updatedItems;
      });
    },
    [showNotification]
  );

  const updateQuantity = useCallback(
    (productId, quantity) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      setCartItems((prevItems) => {
        const updatedItems = prevItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        );

        const updatedItem = updatedItems.find((item) => item.id === productId);
        if (updatedItem) {
          showNotification(
            `Cantidad actualizada: ${quantity} unidades de "${
              updatedItem.nombre || updatedItem.title
            }"`,
            "info"
          );
        }

        return updatedItems;
      });
    },
    [removeFromCart, showNotification]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    showNotification("Carrito vaciado completamente", "warning");
  }, [showNotification]);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = item.precio || item.price || 0;
      const discount = item.descuento || item.discount || 0;
      const finalPrice =
        discount > 0 ? price - (price * discount) / 100 : price;
      return total + finalPrice * item.quantity;
    }, 0);
  }, [cartItems]);

  const getCartItemsCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    notification,
    showNotification,
    hideNotification,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
