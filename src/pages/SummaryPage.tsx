import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { getCardsByUserId, getAccountsByUserId, getTransactionsByEntityId, getBalanceAccount } from '../data/mockData';
import { FileText, Download, Calendar, ArrowDown, ArrowUp } from 'lucide-react';
import '../styles/pages/SummaryPage.scss';

const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryGenerated, setSummaryGenerated] = useState(false);
  
  const userCards = user ? getCardsByUserId(user.id) : [];
  const userAccounts = user ? getAccountsByUserId(user.id) : [];
  
  // Get all transactions for user's cards and accounts
  const allTransactions = [...userCards, ...userAccounts].flatMap(item => {
    const entityType = 'id' in item && 'type' in item && 
                      (item.type === 'credit' || item.type === 'debit') 
                      ? 'card' : 'account';
    return getTransactionsByEntityId(item.id, entityType as 'card' | 'account');
  });
  
  // Filter transactions based on selected period
  const getFilteredTransactions = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (selectedPeriod) {
      case 'last30days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case 'last90days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        break;
      case 'currentYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
    }
    
    return allTransactions.filter(trx => new Date(trx.date) >= startDate);
  };
  
  const filteredTransactions = getFilteredTransactions();
  
  // Calculate summary statistics
  const totalIncome = filteredTransactions
    .filter(trx => trx.type === 'credit')
    .reduce((sum, trx) => sum + trx.amount, 0);
    
  const totalExpenses = filteredTransactions
    .filter(trx => trx.type === 'debit')
    .reduce((sum, trx) => sum + trx.amount, 0);
  
  const handleGenerateSummary = () => {
    setGeneratingSummary(true);
    
    // Simulate summary generation
    setTimeout(() => {
      setGeneratingSummary(false);
      setSummaryGenerated(true);
    }, 1500);
  };

  return (
    <div className="summary-page">
      <Header title="Generar Resumen" backButton onBack={() => navigate('/')} />
      
      <div className="summary-container">
        <div className="summary-header">
          <h2>Resumen Financiero</h2>
          <p>Visualiza tus movimientos en un resumen detallado</p>
        </div>
        
        <div className="summary-period">
          <div className="period-label">
            <Calendar size={18} />
            <span>Selecciona Periodo:</span>
          </div>
          <div className="period-options">
            <button 
              className={selectedPeriod === 'last30days' ? 'active' : ''} 
              onClick={() => setSelectedPeriod('last30days')}
            >
              Últimos 30 días
            </button>
            <button 
              className={selectedPeriod === 'last90days' ? 'active' : ''} 
              onClick={() => setSelectedPeriod('last90days')}
            >
              Últimos 90 días
            </button>
            <button 
              className={selectedPeriod === 'currentYear' ? 'active' : ''} 
              onClick={() => setSelectedPeriod('currentYear')}
            >
              Año actual
            </button>
          </div>
        </div>
        
        <div className="summary-overview">
          <div className="overview-card income">
            <div className="overview-icon">
              <ArrowDown size={20} />
            </div>
            <div className="overview-content">
              <span className="overview-label">Ingresos</span>
              <span className="overview-value">${totalIncome.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="overview-card expenses">
            <div className="overview-icon">
              <ArrowUp size={20} />
            </div>
            <div className="overview-content">
              <span className="overview-label">Gastos</span>
              <span className="overview-value">${totalExpenses.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="summary-details">
          <h3>Resumen de Movimientos</h3>
          <p>Total de movimientos: {filteredTransactions.length}</p>
          
          <div className="card-accounts-summary">
            <div className="summary-section">
              <h4>Tarjetas ({userCards.length})</h4>
              <ul>
                {userCards.map(card => (
                  <li key={card.id}>
                    <span>{card.name}</span>
                    <span>${card.balanceToPay.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="summary-section">
              <h4>Cuentas ({userAccounts.length})</h4>
              <ul>
                {userAccounts.map(account => (
                  <li key={account.id}>
                    <span>{account.name}</span>
                    <span>
                      {account.currency === 'USD' ? 'US$' : '$'} 
                      {  getBalanceAccount(account.id).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="summary-actions">
          <button 
            className="generate-button"
            onClick={handleGenerateSummary}
            disabled={generatingSummary}
          >
            {generatingSummary ? (
              <>
                <div className="loading-spinner"></div>
                <span>Generando...</span>
              </>
            ) : (
              <>
                <FileText size={18} />
                <span>Generar Resumen</span>
              </>
            )}
          </button>
          
          {summaryGenerated && (
            <button className="download-button">
              <Download size={18} />
              <span>Descargar PDF</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;