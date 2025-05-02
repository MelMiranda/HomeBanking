import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Lock, User } from 'lucide-react';
import '../styles/pages/LoginPage.scss';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Por favor, ingrese usuario y contraseña');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          <CreditCard size={40} />
          <h1>FedeApp</h1>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Iniciar Sesión</h2>
          
          {error && <div className="login-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">
              <User size={18} />
              <span>Usuario</span>
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <Lock size={18} />
              <span>Contraseña</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
          
          <div className="login-help">
            <a href="#">¿Olvidó su contraseña?</a>
          </div>
        </form>
        
        <div className="login-demo">
          <p>Para prueba: Usuario - <strong>usuario1</strong>, Contraseña - <strong>password123</strong></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;