import React from "react";
import { Navigate } from "react-router-dom";

export default function RoleRoute({ children, allow }) {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!usuario || !allow.includes(usuario.tipo)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}