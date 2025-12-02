import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function GuestRoute({ children }) {
  const user = useSelector((state) => state.user);
  const token = localStorage.getItem("accessToken");

  // Nếu có token và role, redirect tới dashboard tương ứng
  if (token && user?.role) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "staff") return <Navigate to="/staff" replace />;
  }

  return children;
}
