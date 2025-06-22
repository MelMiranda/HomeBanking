import { AtSign, Calendar, DollarSign, Hash, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { Account, LocalStorageService, Transaction } from '../services/localStorageService';
import '../styles/pages/DetailPage.scss';

const AccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      loadAccountData();
    }
  }, [id]);

  const loadAccountData = () => {
    if (!id) return;

    const accountData = LocalStorageService.getAccountById(id);
    if (accountData) {
      setAccount(accountData);
      
      // Obtener transacciones de la cuenta
      const allTransactions = LocalStorageService.getTransactions();
      const accountTransactions = allTransactions.filter(
        transaction => transaction.entityId === id && transaction.entityType === 'account'
      );
      setTransactions(accountTransactions);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="detail-page">
        <Header title="Detalle de Cuenta" backButton />
        <div className="loading">
          <p>Cargando cuenta...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="detail-page">
        <Header title="Detalle de Cuenta" backButton />
        <div className="error">
          <p>La cuenta no fue encontrada</p>
          <button onClick={() => navigate('/')}>Volver al Inicio</button>
        </div>
      </div>
    );
  }

  // Helper function to get account type in Spanish
  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'pesos':
        return 'Caja de Ahorro en Pesos';
      case 'dolar':
        return 'Caja de Ahorro en Dólares';
      case 'corriente':
        return 'Cuenta Corriente';
      default:
        return 'Cuenta';
    }
  };

  const currencySymbol = account.currency === 'USD' ? 'US$' : '$';

  // Calcular estadísticas de transacciones
  const totalIncome = transactions
    .filter(trx => trx.type === 'credit')
    .reduce((sum, trx) => sum + trx.amount, 0);
    
  const totalExpenses = transactions
    .filter(trx => trx.type === 'debit')
    .reduce((sum, trx) => sum + trx.amount, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="detail-page">
      <Header title="Detalle de Cuenta" backButton />
      
      <div className="detail-content">
        <div className="account-header">
          <div className="account-icon">
            <DollarSign size={32} />
          </div>
          <div className="account-info">
            <h1>{getAccountTypeLabel(account.type)}</h1>
            <div className="account-number">N°: {account.number}</div>
            <div className="account-balance">
              {currencySymbol} {account.balance.toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="account-stats">
          <div className="stat-item">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>Ingresos</h3>
              <p className="credit">+{currencySymbol} {totalIncome.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <TrendingDown size={24} />
            </div>
            <div className="stat-content">
              <h3>Gastos</h3>
              <p className="debit">-{currencySymbol} {totalExpenses.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <h3>Movimientos</h3>
              <p>{transactions.length}</p>
            </div>
          </div>
        </div>

        <div className="account-details">
          <div className="detail-item">
            <Hash size={20} />
            <div className="detail-content">
              <span className="detail-label">CBU</span>
              <span className="detail-value">{account.cbu}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <AtSign size={20} />
            <div className="detail-content">
              <span className="detail-label">Alias</span>
              <span className="detail-value">{account.alias}</span>
            </div>
          </div>
        </div>
        
        <div className="transactions-section">
          <h2>Movimientos Recientes</h2>
          
          {transactions.length > 0 ? (
            <>
              <div className="transactions-summary">
                <div className="summary-item">
                  <span>Total Ingresos</span>
                  <span className="credit">{currencySymbol} {totalIncome.toLocaleString()}</span>
                </div>
                <div className="summary-item">
                  <span>Total Gastos</span>
                  <span className="debit">{currencySymbol} {totalExpenses.toLocaleString()}</span>
                </div>
                <div className="summary-item">
                  <span>Saldo Actual</span>
                  <span>{currencySymbol} {account.balance.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="transactions-list">
                {transactions.slice(0, 10).map(transaction => (
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
                          {transaction.type === 'debit' ? '-' : '+'}{currencySymbol} {transaction.amount.toLocaleString()}
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
              
              {transactions.length > 10 && (
                <div className="view-more">
                  <button onClick={() => navigate(`/transactions/${account.id}`)}>
                    Ver todos los movimientos ({transactions.length})
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-transactions">
              <p>No hay movimientos en esta cuenta</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountDetailPage;