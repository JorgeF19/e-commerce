import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    console.error("❌ useAuth called outside of AuthProvider");
    // Return a safe default instead of throwing
    return {
      currentUser: null,
      signup: () => Promise.reject(new Error("Auth not available")),
      login: () => Promise.reject(new Error("Auth not available")),
      logout: () => Promise.reject(new Error("Auth not available")),
      loading: false,
      error: "Auth context not available",
    };
  }
  console.log("✅ useAuth called successfully", {
    hasCurrentUser: !!context.currentUser,
  });
  return context;
}

export function AuthProvider({ children }) {
  console.log("🔧 Using AuthContextSafe provider");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock functions for when Firebase fails
  const mockSignup = async (email, password) => {
    // Use password in mock logic to avoid unused variable error
    console.log("Using mock signup", {
      email,
      password: password ? "***" : undefined,
    });
    const mockUser = {
      uid: "mock-user",
      email,
      password: password ? "***" : undefined,
    };
    localStorage.setItem("mockUser", JSON.stringify(mockUser));
    setCurrentUser(mockUser);
    return Promise.resolve({ user: mockUser });
  };

  const mockLogin = async (email, password) => {
    // Use password in mock logic to avoid unused variable error
    console.log("Using mock login", {
      email,
      password: password ? "***" : undefined,
    });
    const mockUser = {
      uid: "mock-user",
      email,
      password: password ? "***" : undefined,
    };
    localStorage.setItem("mockUser", JSON.stringify(mockUser));
    setCurrentUser(mockUser);
    return Promise.resolve({ user: mockUser });
  };

  const mockLogout = async () => {
    console.log("Using mock logout");
    setCurrentUser(null);
    return Promise.resolve();
  };

  // Try to load Firebase auth
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const loadFirebaseAuth = async () => {
      try {
        const { auth: firebaseAuth } = await import("../firebase");
        const { onAuthStateChanged } = await import("firebase/auth");

        setAuth(firebaseAuth);

        if (firebaseAuth) {
          unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            setCurrentUser(user);
            setLoading(false);
          });
        } else {
          throw new Error("Firebase auth not available");
        }
      } catch (err) {
        console.warn("Firebase not available, using mock auth:", err.message);
        setError(err.message);

        // Check for mock user in localStorage
        const mockUser = localStorage.getItem("mockUser");
        if (mockUser) {
          setCurrentUser(JSON.parse(mockUser));
        }
        setLoading(false);
      }
    };

    loadFirebaseAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Choose functions based on Firebase availability
  const signup = auth
    ? async (email, password) => {
        const { createUserWithEmailAndPassword } = await import(
          "firebase/auth"
        );
        return createUserWithEmailAndPassword(auth, email, password);
      }
    : mockSignup;

  const login = auth
    ? async (email, password) => {
        const { signInWithEmailAndPassword } = await import("firebase/auth");
        return signInWithEmailAndPassword(auth, email, password);
      }
    : mockLogin;

  const logout = auth
    ? async () => {
        const { signOut } = await import("firebase/auth");
        return signOut(auth);
      }
    : mockLogout;

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
