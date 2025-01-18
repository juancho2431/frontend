// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Compras from './pages/Compras';
import Facturacion from './pages/Facturacion';
import Usuarios from './pages/Usuarios';
import Reportes from './pages/Reportes';
import ImprimirFactura from './components/facturacion/ImprimirFactura';
import Login from './pages/Login';
import PrivateRoute from './components/login/PrivateRoute';
import logo from './assets/LOGO_AREPASAURIOS.png';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(localStorage.getItem('authenticatedUser') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'Desconocido');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  useEffect(() => {
    // Actualizar el estado cuando cambien los valores en localStorage
    setAuthenticatedUser(localStorage.getItem('authenticatedUser') || 'Usuario no definido');
    setUserRole(localStorage.getItem('userRole') || 'Desconocido');
  }, [isAuthenticated]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authenticatedUser');
    localStorage.removeItem('userRole');
    setAuthenticatedUser('');
    setUserRole('');
    window.location.reload();
  };

  return (
    <Router>
      <div className="app-container">
        {isAuthenticated ? (
          <>
            <div className={`sidebar ${menuOpen ? 'open' : ''}`}>
              <div className="logo-container">
                <img src={logo} alt="Logo de la empresa" className="logo" />
              </div>
              <ul>
                <li>
                  <span style={{ color: 'black', fontSize: '18px' }}>Usuario: {authenticatedUser || 'Desconocido'} ({userRole || 'Sin rol'})</span>
                </li>
                <li>
                  <Link to="/" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                </li>
                <li>
                  <Link to="/inventario" onClick={() => setMenuOpen(false)}>Inventario</Link>
                </li>
                {userRole !== 'Mesero' && userRole !== 'Empleado' && ( // Restringir acceso a Compras para Mesero y Empleado
                  <li>
                    <Link to="/compras" onClick={() => setMenuOpen(false)}>Compras</Link>
                  </li>
                )}
                <li>
                  <Link to="/facturacion" onClick={() => setMenuOpen(false)}>Facturación</Link>
                </li>
                {userRole === 'Superadmin' && (
                  <li>
                    <Link to="/usuarios" onClick={() => setMenuOpen(false)}>Usuarios</Link>
                  </li>
                )}
                <li>
                  <Link to="/reportes" onClick={() => setMenuOpen(false)}>Reportes</Link>
                </li>
                <li className="logout-button" onClick={handleLogout}>
                  Cerrar sesión
                </li>
              </ul>
            </div>
            <div className="menu-hamburguesa" onClick={toggleMenu}>
              ☰
            </div>
            <div className="content" onClick={() => setMenuOpen(false)}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <PrivateRoute roles={['Superadmin', 'Administrador', 'Cajero', 'Mesero', 'Empleado']}>
                      <Dashboard userRole={userRole} />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/inventario"
                  element={
                    <PrivateRoute roles={['Superadmin', 'Administrador', 'Cajero', 'Mesero', 'Empleado']}>
                      <Inventario userRole={userRole} />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/compras"
                  element={
                    <PrivateRoute roles={['Superadmin', 'Administrador', 'Cajero']}>
                      <Compras />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/facturacion"
                  element={
                    <PrivateRoute roles={['Superadmin', 'Administrador', 'Cajero']}>
                      <Facturacion />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/facturacion/imprimir/:ventaId"
                  element={
                    <PrivateRoute roles={['Superadmin', 'Administrador', 'Cajero']}>
                      <ImprimirFactura />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/usuarios"
                  element={
                    <PrivateRoute roles={['Superadmin']}>
                      <Usuarios />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/reportes"
                  element={
                    <PrivateRoute roles={['Superadmin', 'Administrador', 'Cajero', 'Empleado']}>
                      <Reportes dailySalesOnly={userRole === 'Empleado' || userRole === 'Cajero'} />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login setAuthenticatedUser={setAuthenticatedUser} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
