import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PrivateRoute({ children, allowedRoles }) {
  const { role } = useSelector((state) => state.user);

  const token = localStorage.getItem("accessToken");

  if (!token) return <Navigate to="/" />;

  // Chưa load user => đừng chặn
  if (!role) return null;

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
}
