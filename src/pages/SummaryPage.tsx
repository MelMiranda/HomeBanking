import { Calendar, DollarSign, Download, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Account, Card, LocalStorageService, Transaction } from '../services/localStorageService';
import '../styles/pages/SummaryPage.scss';

const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [userCards, setUserCards] = useState<Card[]>([]);
  const [userAccounts, setUserAccounts] = useState<Account[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = () => {
    if (!user) return;

    const cards = LocalStorageService.getCardsByUserId(user.id);
    const accounts = LocalStorageService.getAccountsByUserId(user.id);
    const allTransactions = LocalStorageService.getTransactions();

    // Filtrar transacciones del usuario
    const userTransactions = allTransactions.filter(transaction => {
      const isCardTransaction = cards.some(card => card.id === transaction.entityId);
      const isAccountTransaction = accounts.some(account => account.id === transaction.entityId);
      return isCardTransaction || isAccountTransaction;
    });

    setUserCards(cards);
    setUserAccounts(accounts);
    setAllTransactions(userTransactions);
  };
  
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

  const generatePDF = async () => {
    setIsGeneratingPDF(true);

    try {
      // Simular generación de PDF
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Crear contenido del PDF
      const pdfContent = generatePDFContent();
      
      // Crear y descargar el archivo
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resumen_financiero_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generando PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generatePDFContent = () => {
    const periodName = {
      'last30days': 'Últimos 30 días',
      'last90days': 'Últimos 90 días',
      'currentYear': 'Año actual'
    }[selectedPeriod];

    let content = `RESUMEN FINANCIERO - ${user?.name.toUpperCase()}\n`;
    content += `Período: ${periodName}\n`;
    content += `Generado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}\n`;
    content += `\n`;
    content += `RESUMEN GENERAL:\n`;
    content += `Total Ingresos: $${totalIncome.toLocaleString()}\n`;
    content += `Total Gastos: $${totalExpenses.toLocaleString()}\n`;
    content += `Saldo Neto: $${(totalIncome - totalExpenses).toLocaleString()}\n`;
    content += `Total Movimientos: ${filteredTransactions.length}\n`;
    content += `\n`;
    content += `ESTADO DE CUENTAS:\n`;
    content += `\n`;
    content += `TARJETAS (${userCards.length}):\n`;
    content += `-`.repeat(50) + `\n`;
    
    userCards.forEach(card => {
      content += `${card.name}\n`;
      content += `  Tipo: ${card.type === 'credit' ? 'Crédito' : 'Débito'}\n`;
      content += `  Número: ${card.number}\n`;
      content += `  Crédito Disponible: $${card.availableCredit.toLocaleString()}\n`;
      content += `  Saldo a Pagar: $${card.balanceToPay.toLocaleString()}\n`;
      if (card.dueDate) {
        content += `  Vencimiento: ${card.dueDate}\n`;
      }
      content += `\n`;
    });

    content += `CUENTAS (${userAccounts.length}):\n`;
    content += `-`.repeat(50) + `\n`;
    
    userAccounts.forEach(account => {
      content += `${account.name}\n`;
      content += `  Tipo: ${account.type}\n`;
      content += `  Número: ${account.number}\n`;
      content += `  CBU: ${account.cbu}\n`;
      content += `  Alias: ${account.alias}\n`;
      content += `  Saldo: $${account.balance.toLocaleString()} ${account.currency}\n`;
      content += `\n`;
    });

    content += `DETALLE DE MOVIMIENTOS:\n`;
    content += `-`.repeat(80) + `\n`;
    content += `Fecha\t\tTipo\t\tEntidad\t\tDescripción\t\tMonto\n`;
    content += `-`.repeat(80) + `\n`;

    // Ordenar transacciones por fecha (más recientes primero)
    const sortedTransactions = [...filteredTransactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sortedTransactions.forEach(transaction => {
      const date = new Date(transaction.date).toLocaleDateString('es-ES');
      const type = transaction.type === 'debit' ? 'GASTO' : 'INGRESO';
      const amount = transaction.type === 'debit' ? `-$${transaction.amount.toLocaleString()}` : `+$${transaction.amount.toLocaleString()}`;
      
      // Obtener nombre de la entidad
      let entityName = 'N/A';
      if (transaction.entityType === 'card') {
        const card = userCards.find(c => c.id === transaction.entityId);
        entityName = card ? card.name : 'Tarjeta';
      } else if (transaction.entityType === 'account') {
        const account = userAccounts.find(a => a.id === transaction.entityId);
        entityName = account ? account.name : 'Cuenta';
      }

      content += `${date}\t${type}\t\t${entityName}\t\t${transaction.description}\t\t${amount}\n`;
    });

    content += `\n`;
    content += `HomeBanking - Sistema de Gestión Financiera\n`;
    content += `Usuario: ${user?.name}\n`;
    content += `Período: ${periodName}\n`;

    return content;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="summary-page">
      <Header title="Generar Resumen" backButton />
      
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
              <TrendingUp size={20} />
            </div>
            <div className="overview-content">
              <span className="overview-label">Ingresos</span>
              <span className="overview-value">${totalIncome.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="overview-card expenses">
            <div className="overview-icon">
              <TrendingDown size={20} />
            </div>
            <div className="overview-content">
              <span className="overview-label">Gastos</span>
              <span className="overview-value">${totalExpenses.toLocaleString()}</span>
            </div>
          </div>

          <div className="overview-card balance">
            <div className="overview-icon">
              <DollarSign size={20} />
            </div>
            <div className="overview-content">
              <span className="overview-label">Saldo Neto</span>
              <span className={`overview-value ${totalIncome - totalExpenses >= 0 ? 'positive' : 'negative'}`}>
                ${(totalIncome - totalExpenses).toLocaleString()}
              </span>
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
                      {account.balance.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {filteredTransactions.length > 0 && (
          <div className="recent-transactions">
            <h3>Movimientos Recientes</h3>
            <div className="transactions-list">
              {filteredTransactions.slice(0, 5).map(transaction => (
                <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
                  <div className="transaction-icon">
                    {transaction.type === 'debit' ? (
                      <TrendingDown size={16} />
                    ) : (
                      <TrendingUp size={16} />
                    )}
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-header">
                      <h4>{transaction.description}</h4>
                      <span className={`amount ${transaction.type}`}>
                        {transaction.type === 'debit' ? '-' : '+'}${transaction.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="transaction-date">
                      <Calendar size={14} />
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="summary-actions">
          <button 
            className="generate-button"
            onClick={generatePDF}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <>
                <div className="loading-spinner"></div>
                <span>Generando...</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Descargar Resumen</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;