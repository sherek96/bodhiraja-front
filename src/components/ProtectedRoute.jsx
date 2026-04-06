import React from 'react';
import { Navigate } from 'react-router-dom';

// We pass 'children' (the page inside the wrapper) as a prop
const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("pirivena_token");
    
    // Optional: If you are saving the user's role on login, you can check it here
    const userRole = localStorage.getItem("user_role"); 

    // 1. No token? Go to login.
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 2. Not the right role? Kick them back to the Dashboard.
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />; 
    }

    // 3. You pass the checks? Render the page!
    return children;
};

export default ProtectedRoute;