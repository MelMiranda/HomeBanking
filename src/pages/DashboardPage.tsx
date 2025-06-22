import { ArrowRight, CreditCard, FileText, History, Landmark, PieChart, Send, Settings, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountItem from '../components/AccountItem';
import CardItem from '../components/CardItem';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { LocalStorageService } from '../services/localStorageService';
import '../styles/pages/DashboardPage.scss';

const DashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'cards' | 'accounts'>('cards');
  
  const userCards = user ? LocalStorageService.getCardsByUserId(user.id) : [];
  const userAccounts = user ? LocalStorageService.getAccountsByUserId(user.id) : [];
  
  const handleCardClick = (cardId: string) => {
    navigate(`/cards/${cardId}`);
  };
  
  const handleAccountClick = (accountId: string) => {
    navigate(`/accounts/${accountId}`);
  };
  
  const handleSummaryClick = () => {
    navigate('/summary');
  };

  const handleTransferClick = () => {
    navigate('/transfer');
  };

  const handleTransferHistoryClick = () => {
    navigate('/transfer-history');
  };

  const handleCardSummaryClick = () => {
    navigate('/card-summary');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  // Estadísticas para administradores
  const users = LocalStorageService.getUsers();
  const accounts = LocalStorageService.getAccounts();
  const cards = LocalStorageService.getCards();
  const totalUsers = users.filter(u => !u.is_admin).length;
  const totalAccounts = accounts.length;
  const totalCards = cards.length;

  return (
    <div className="dashboard-page">
      <Header title="Mi Banco" />
      
      <div className="dashboard-welcome">
        <h2>Hola, {user?.name}</h2>
        <p>Bienvenido a tu espacio financiero</p>
        {isAdmin() && (
          <div className="admin-badge">
            <Settings size={16} />
            <span>Administrador</span>
          </div>
        )}
      </div>

      {isAdmin() && (
        <div className="admin-stats">
          <div className="stat-card">
            <Users size={24} />
            <div className="stat-info">
              <h3>{totalUsers}</h3>
              <p>Usuarios</p>
            </div>
          </div>
          <div className="stat-card">
            <Landmark size={24} />
            <div className="stat-info">
              <h3>{totalAccounts}</h3>
              <p>Cuentas</p>
            </div>
          </div>
          <div className="stat-card">
            <CreditCard size={24} />
            <div className="stat-info">
              <h3>{totalCards}</h3>
              <p>Tarjetas</p>
            </div>
          </div>
          <div className="stat-card admin-action">
            <button onClick={handleAdminClick}>
              <Settings size={24} />
              <div className="stat-info">
                <h3>Panel</h3>
                <p>Administración</p>
              </div>
            </button>
          </div>
        </div>
      )}
      
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'cards' ? 'active' : ''}`}
          onClick={() => setActiveTab('cards')}
        >
          <CreditCard size={18} />
          <span>Mis Tarjetas</span>
        </button>
        <button 
          className={`tab ${activeTab === 'accounts' ? 'active' : ''}`}
          onClick={() => setActiveTab('accounts')}
        >
          <Landmark size={18} />
          <span>Mis Cuentas</span>
        </button>
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'cards' && (
          <div className="cards-list">
            <h3>Tarjetas</h3>
            {userCards.length > 0 ? (
              userCards.map(card => (
                <CardItem 
                  key={card.id} 
                  card={card} 
                  onClick={() => handleCardClick(card.id)} 
                />
              ))
            ) : (
              <p className="empty-message">No tienes tarjetas disponibles</p>
            )}
          </div>
        )}
        
        {activeTab === 'accounts' && (
          <div className="accounts-list">
            <h3>Cuentas</h3>
            {userAccounts.length > 0 ? (
              userAccounts.map(account => (
                <AccountItem 
                  key={account.id} 
                  account={account} 
                  onClick={() => handleAccountClick(account.id)} 
                />
              ))
            ) : (
              <p className="empty-message">No tienes cuentas disponibles</p>
            )}
          </div>
        )}
      </div>
      
      <div className="dashboard-actions">
        <div className="action-buttons">
          <button className="action-button transfer" onClick={handleTransferClick}>
            <div className="action-button-content">
              <Send size={20} />
              <span>Transferir</span>
            </div>
            <ArrowRight size={18} />
          </button>
          
          <button className="action-button history" onClick={handleTransferHistoryClick}>
            <div className="action-button-content">
              <History size={20} />
              <span>Historial</span>
            </div>
            <ArrowRight size={18} />
          </button>
          
          <button className="action-button card-summary" onClick={handleCardSummaryClick}>
            <div className="action-button-content">
              <FileText size={20} />
              <span>Resumen Tarjetas</span>
            </div>
            <ArrowRight size={18} />
          </button>
          
          <button className="action-button summary" onClick={handleSummaryClick}>
            <div className="action-button-content">
              <PieChart size={20} />
              <span>Resumen</span>
            </div>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;