import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Temporal mock authentication for testing without Firebase
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true

  // Mock users storage in localStorage
  const getUsers = () => {
    return JSON.parse(localStorage.getItem("mockUsers") || "[]");
  };

  const saveUsers = (users) => {
    localStorage.setItem("mockUsers", JSON.stringify(users));
  };

  function signup(email, password) {
    return new Promise((resolve, reject) => {
      setLoading(true);

      setTimeout(() => {
        const users = getUsers();
        const existingUser = users.find((u) => u.email === email);

        if (existingUser) {
          setLoading(false);
          reject(new Error("Ya existe un usuario con este email"));
          return;
        }

        const newUser = {
          uid: Date.now().toString(),
          email,
          password, // In real app, never store passwords like this!
        };

        users.push(newUser);
        saveUsers(users);

        setCurrentUser({ uid: newUser.uid, email: newUser.email });
        localStorage.setItem(
          "currentUser",
          JSON.stringify({ uid: newUser.uid, email: newUser.email })
        );

        setLoading(false);
        resolve(newUser);
      }, 1000); // Simulate network delay
    });
  }

  function login(email, password) {
    return new Promise((resolve, reject) => {
      setLoading(true);

      setTimeout(() => {
        const users = getUsers();
        const user = users.find(
          (u) => u.email === email && u.password === password
        );

        if (!user) {
          setLoading(false);
          reject(new Error("Email o contraseña incorrectos"));
          return;
        }

        const userData = { uid: user.uid, email: user.email };
        setCurrentUser(userData);
        localStorage.setItem("currentUser", JSON.stringify(userData));

        setLoading(false);
        resolve(userData);
      }, 1000); // Simulate network delay
    });
  }

  function logout() {
    return new Promise((resolve) => {
      setCurrentUser(null);
      localStorage.removeItem("currentUser");
      resolve();
    });
  }

  useEffect(() => {
    // Check for existing user on app start
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
