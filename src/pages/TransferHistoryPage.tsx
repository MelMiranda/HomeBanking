import { ArrowDownLeft, ArrowUpRight, Calendar, DollarSign, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Account, LocalStorageService, Transaction } from '../services/localStorageService';
import '../styles/pages/TransferHistoryPage.scss';

const TransferHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'sent' | 'received'>('all');
  const [selectedAccount, setSelectedAccount] = useState('all');

  useEffect(() => {
    if (user) {
      loadTransferHistory();
    }
  }, [user, filterType, selectedAccount]);

  const loadTransferHistory = () => {
    if (!user) return;

    // Obtener todas las transacciones de cuentas del usuario
    const userAccounts = LocalStorageService.getAccountsByUserId(user.id);
    const allTransactions = LocalStorageService.getTransactions();
    const allAccounts = LocalStorageService.getAccounts();
    const allUsers = LocalStorageService.getUsers();

    // Filtrar transacciones de transferencias
    const transferTransactions = allTransactions.filter(transaction => 
      transaction.entityType === 'account' &&
      transaction.description.includes('Transferencia') &&
      (userAccounts.some(acc => acc.id === transaction.entityId) ||
       transaction.description.includes(user.name))
    );

    // Aplicar filtros
    let filteredTransactions = transferTransactions;

    if (filterType === 'sent') {
      filteredTransactions = transferTransactions.filter(t => 
        t.type === 'debit' && userAccounts.some(acc => acc.id === t.entityId)
      );
    } else if (filterType === 'received') {
      filteredTransactions = transferTransactions.filter(t => 
        t.type === 'credit' && userAccounts.some(acc => acc.id === t.entityId)
      );
    }

    if (selectedAccount !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => 
        t.entityId === selectedAccount
      );
    }

    // Ordenar por fecha (más recientes primero)
    filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setTransactions(filteredTransactions);
    setAccounts(allAccounts);
    setUsers(allUsers);
  };

  const getAccountInfo = (accountId: string) => {
    return accounts.find(acc => acc.id === accountId);
  };

  const getUserInfo = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionType = (transaction: Transaction) => {
    const userAccounts = LocalStorageService.getAccountsByUserId(user?.id || '');
    const isFromUserAccount = userAccounts.some(acc => acc.id === transaction.entityId);
    
    if (transaction.type === 'debit' && isFromUserAccount) {
      return 'sent';
    } else if (transaction.type === 'credit' && isFromUserAccount) {
      return 'received';
    }
    return 'other';
  };

  const getTransactionDescription = (transaction: Transaction) => {
    if (transaction.description.includes('Transferencia enviada')) {
      const match = transaction.description.match(/Transferencia enviada a (.+?) -/);
      return match ? `Enviada a ${match[1]}` : transaction.description;
    } else if (transaction.description.includes('Transferencia recibida')) {
      const match = transaction.description.match(/Transferencia recibida de (.+?) -/);
      return match ? `Recibida de ${match[1]}` : transaction.description;
    }
    return transaction.description;
  };

  const userAccounts = user ? LocalStorageService.getAccountsByUserId(user.id) : [];

  return (
    <div className="transfer-history-page">
      <Header title="Historial de Transferencias" backButton />
      
      <div className="transfer-history-content">
        <div className="history-header">
          <h1>Historial de Transferencias</h1>
          <p>Revisa todas tus transferencias enviadas y recibidas</p>
        </div>

        {/* Filtros */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Tipo de transferencia:</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as 'all' | 'sent' | 'received')}
            >
              <option value="all">Todas</option>
              <option value="sent">Enviadas</option>
              <option value="received">Recibidas</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Cuenta:</label>
            <select 
              value={selectedAccount} 
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              <option value="all">Todas las cuentas</option>
              {userAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.currency})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de transferencias */}
        <div className="transactions-list">
          {transactions.length > 0 ? (
            transactions.map(transaction => {
              const accountInfo = getAccountInfo(transaction.entityId);
              const transactionType = getTransactionType(transaction);
              const isFromUserAccount = userAccounts.some(acc => acc.id === transaction.entityId);

              return (
                <div 
                  key={transaction.id} 
                  className={`transaction-item ${transactionType}`}
                >
                  <div className="transaction-icon">
                    {transactionType === 'sent' ? (
                      <ArrowUpRight size={20} />
                    ) : transactionType === 'received' ? (
                      <ArrowDownLeft size={20} />
                    ) : (
                      <DollarSign size={20} />
                    )}
                  </div>

                  <div className="transaction-details">
                    <div className="transaction-header">
                      <h4>{getTransactionDescription(transaction)}</h4>
                      <span className={`amount ${transactionType}`}>
                        {transactionType === 'sent' ? '-' : '+'}${transaction.amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="transaction-info">
                      <div className="info-item">
                        <Calendar size={14} />
                        <span>{formatDate(transaction.date)}</span>
                      </div>

                      {accountInfo && (
                        <div className="info-item">
                          <User size={14} />
                          <span>
                            {isFromUserAccount ? 'Tu cuenta' : getUserInfo(accountInfo.userId)?.name}
                          </span>
                        </div>
                      )}

                      <div className="info-item">
                        <span className="account-alias">
                          {accountInfo?.alias || 'Cuenta no encontrada'}
                        </span>
                      </div>
                    </div>

                    {transaction.description.includes(' - ') && (
                      <div className="transaction-description">
                        <span>
                          {transaction.description.split(' - ')[1]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <ArrowUpRight size={48} />
              </div>
              <h3>No hay transferencias</h3>
              <p>
                {filterType === 'all' 
                  ? 'Aún no has realizado ni recibido transferencias'
                  : filterType === 'sent'
                  ? 'Aún no has enviado transferencias'
                  : 'Aún no has recibido transferencias'
                }
              </p>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        {transactions.length > 0 && (
          <div className="statistics-section">
            <h3>Resumen</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>{transactions.length}</h4>
                <p>Total de transferencias</p>
              </div>
              <div className="stat-card">
                <h4>
                  ${transactions
                    .filter(t => getTransactionType(t) === 'sent')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}
                </h4>
                <p>Total enviado</p>
              </div>
              <div className="stat-card">
                <h4>
                  ${transactions
                    .filter(t => getTransactionType(t) === 'received')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}
                </h4>
                <p>Total recibido</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferHistoryPage; 