import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PropTypes from "prop-types";

// ProtectedRoute component is a higher-order component that wraps protected content
export const ProtectedRoute = ({ children }) => {
  // Get authentication status from auth context/hook
  const { isAuthenticated } = useAuth();

  // If user is not authenticated, redirect to login page
  // 'replace' prop replaces the current history entry instead of adding a new one
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected content (children)
  return children;
};

// PropTypes for type checking
// Ensures that children prop is provided and is a valid React node
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
