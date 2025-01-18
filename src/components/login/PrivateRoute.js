// src/components/login/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, roles }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');

  // Verificar si el usuario está autenticado y tiene uno de los roles permitidos
  if (!isAuthenticated || (roles && !roles.includes(userRole))) {
    return <Navigate to="/login" replace />;
  }

  // Renderizar el componente si se cumple la validación
  return children;
};

export default PrivateRoute;
