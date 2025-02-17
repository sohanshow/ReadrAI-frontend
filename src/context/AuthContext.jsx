import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, getUser, clearAuth } from "../utils/auth";
import PropTypes from "prop-types";

// Create a new context for authentication state management
const AuthContext = createContext(null);

// AuthProvider component to wrap the app and provide authentication state
export const AuthProvider = ({ children }) => {
  // Initialize state with user data from localStorage
  const [user, setUser] = useState(getUser());
  // Check if token exists in localStorage for initial auth state
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const navigate = useNavigate();

  // Login handler - stores auth data and updates state
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Logout handler - clears auth data and redirects to home
  const logout = () => {
    clearAuth(); // Clear localStorage
    setUser(null);
    setIsAuthenticated(false);
    navigate("/", { replace: true }); // Redirect with history replacement
  };

  // Effect to check for existing auth data on component mount
  useEffect(() => {
    const token = getToken();
    const userData = getUser();
    if (token && userData) {
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  // Provide auth context to children components
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// PropTypes for type checking
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to consume auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Ensure hook is used within AuthProvider
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
