import { CreditCard } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LocalStorageService } from '../services/localStorageService';
import '../styles/pages/RegisterPage.scss';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.name.trim() || !formData.username.trim() || !formData.password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (formData.password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Verificar que el username no exista
    const users = LocalStorageService.getUsers();
    const existingUser = users.find(u => u.username === formData.username);
    if (existingUser) {
      setError('El nombre de usuario ya existe');
      return;
    }

    setIsLoading(true);

    try {
      // Simular delay de registro
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newUser = {
        id: `user${Date.now()}`,
        username: formData.username,
        password: formData.password,
        name: formData.name,
        is_admin: false // Los usuarios que se registran siempre son normales
      };

      LocalStorageService.addUser(newUser);

      alert('Usuario registrado exitosamente. Ya puedes iniciar sesión.');
      navigate('/login');
    } catch (error) {
      setError('Error al registrar el usuario. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <div className="logo">
            <CreditCard size={32} />
            <h1>HomeBanking</h1>
          </div>
          <h2>Crear Cuenta</h2>
          <p>Únete a nuestro sistema bancario</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ingresa tu nombre completo"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Elige un nombre de usuario"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Crea una contraseña"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirma tu contraseña"
              required
            />
          </div>

          <button 
            type="submit" 
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="login-link">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 