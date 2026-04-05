import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Check if the VIP Pass exists in local storage
  const token = localStorage.getItem("pirivena_token");

  // If there is no token, kick them to the login page immediately!
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If they have the token, render the page they asked for
  return children;
};

export default ProtectedRoute;