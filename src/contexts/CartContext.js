import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
// import { useAuth } from "./AuthContext"; // Firebase version
// import { useAuth } from "./AuthContextMock"; // Temporary mock version
import { useAuth } from "./AuthContextSafe"; // Safe version with fallback

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const backendUrl = "http://localhost:5000";

  const loadCart = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${backendUrl}/api/cart/${currentUser.uid}`
      );
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, backendUrl]);

  // Load cart items when user logs in
  useEffect(() => {
    if (currentUser) {
      loadCart();
    } else {
      setCartItems([]);
    }
  }, [currentUser, loadCart]);

  const addToCart = async (product, quantity = 1) => {
    if (!currentUser) {
      alert("Please log in to add items to cart");
      return;
    }

    try {
      // Check if item already exists in cart
      const existingItem = cartItems.find(
        (item) => item.productId === product.id
      );

      if (existingItem) {
        // Update quantity if item exists
        await updateCartItem(existingItem.id, existingItem.quantity + quantity);
      } else {
        // Add new item to cart
        await axios.post(`${backendUrl}/api/cart/${currentUser.uid}/add`, {
          productId: product.id,
          quantity,
        });

        const newItem = {
          id: Date.now().toString(),
          productId: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          quantity,
        };

        setCartItems((prev) => [...prev, newItem]);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    if (!currentUser || quantity < 1) return;

    try {
      await axios.put(
        `${backendUrl}/api/cart/${currentUser.uid}/update/${itemId}`,
        {
          quantity,
        }
      );

      setCartItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
    } catch (error) {
      console.error("Error updating cart item:", error);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!currentUser) return;

    try {
      await axios.delete(
        `${backendUrl}/api/cart/${currentUser.uid}/remove/${itemId}`
      );
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    getCartTotal,
    getCartItemCount,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
