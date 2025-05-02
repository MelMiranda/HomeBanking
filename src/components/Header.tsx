import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CreditCard, LogOut, ChevronLeft } from 'lucide-react';
import '../styles/components/Header.scss';

interface HeaderProps {
  title: string;
  backButton?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, backButton, onBack }) => {
  const { logout } = useAuth();
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
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;