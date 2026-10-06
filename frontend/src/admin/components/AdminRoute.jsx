import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const location = useLocation();

  const adminToken = localStorage.getItem("adminToken");

  const storedUserStr = localStorage.getItem("adminUser");

  let isAdmin = false;

  if (adminToken) {
    try {
      if (storedUserStr) {
        const user = JSON.parse(storedUserStr);

        if (user && user.role === "admin") {
          isAdmin = true;
        }
      } else {
        /*
         * Backend will handle invalid token/permissions.
         */
        isAdmin = true;
      }
    } catch (error) {
      console.error("Admin user parse error:", error);

      isAdmin = true;
    }
  }

  if (!adminToken || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;
