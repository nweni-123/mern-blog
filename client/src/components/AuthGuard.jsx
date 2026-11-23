import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function AuthGuard({ children }) {
  const { token } = useAuthStore();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
