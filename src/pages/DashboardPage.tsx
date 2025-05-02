import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCardsByUserId, getAccountsByUserId } from '../data/mockData';
import Header from '../components/Header';
import CardItem from '../components/CardItem';
import AccountItem from '../components/AccountItem';
import { CreditCard, Landmark, PieChart, ArrowRight } from 'lucide-react';
import '../styles/pages/DashboardPage.scss';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'cards' | 'accounts'>('cards');
  
  const userCards = user ? getCardsByUserId(user.id) : [];
  const userAccounts = user ? getAccountsByUserId(user.id) : [];
  
  const handleCardClick = (cardId: string) => {
    navigate(`/cards/${cardId}`);
  };
  
  const handleAccountClick = (accountId: string) => {
    navigate(`/accounts/${accountId}`);
  };
  
  const handleSummaryClick = () => {
    navigate('/summary');
  };

  return (
    <div className="dashboard-page">
      <Header title="Mi Banco" />
      
      <div className="dashboard-welcome">
        <h2>Hola, {user?.name}</h2>
        <p>Bienvenido a tu espacio financiero</p>
      </div>
      
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
      
      <div className="dashboard-summary">
        <button className="summary-button" onClick={handleSummaryClick}>
          <div className="summary-button-content">
            <PieChart size={20} />
            <span>Generar Resumen</span>
          </div>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;