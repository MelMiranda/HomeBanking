import { ChevronLeft, CreditCard, LogOut, Settings } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/components/Header.scss';

interface HeaderProps {
  title: string;
  backButton?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, backButton, onBack }) => {
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {backButton && (
          <button className="back-button" onClick={handleBack}>
            <ChevronLeft size={24} />
          </button>
        )}
        
        <div className="header-logo">
          <CreditCard size={24} />
          <h1>{title}</h1>
        </div>
      </div>
      
      <div className="header-actions">
        {isAdmin() && (
          <button className="admin-button" onClick={handleAdminClick} title="Panel de Administración">
            <Settings size={20} />
          </button>
        )}
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;