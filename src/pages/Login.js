// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';

const Login = ({ setAuthenticatedUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  // Credenciales quemadas para el superadmin
  const superAdminUsername = 'admin';
  const superAdminPassword = 'supersecret';

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Verificar si es el superadmin
      if (username === superAdminUsername && password === superAdminPassword) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('authenticatedUser', superAdminUsername);
        localStorage.setItem('userRole', 'Superadmin');
        setAuthenticatedUser(superAdminUsername);
        navigate('/');
        return;
      }
  
      // Verificar credenciales del empleado desde la base de datos
      const response = await axios.post(`${apiUrl}/api/login`, {
        username,
        password,
      });
  
      // Si la autenticación es exitosa, guardar la información en localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authenticatedUser', response.data.username);
      localStorage.setItem('userRole', response.data.role);
      setAuthenticatedUser(response.data.username);
      navigate('/');
    } catch (error) {
      setError('Usuario o contraseña incorrectos');
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <div className="input-container">
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          <button type="submit">Ingresar</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
