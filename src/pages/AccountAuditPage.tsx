import {
    AtSign,
    Calendar,
    DollarSign,
    Download,
    Filter,
    Hash,
    Search,
    TrendingDown,
    TrendingUp,
    User as UserIcon
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { Account, LocalStorageService, Transaction, User } from '../services/localStorageService';
import '../styles/pages/AccountAuditPage.scss';

const AccountAuditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  useEffect(() => {
    if (id) {
      loadAccountData();
    }
  }, [id]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, filterType]);

  const loadAccountData = () => {
    if (!id) return;

    const accountData = LocalStorageService.getAccountById(id);
    if (accountData) {
      setAccount(accountData);
      
      // Obtener usuario de la cuenta
      const userData = LocalStorageService.getUserById(accountData.userId);
      setUser(userData);
      
      // Obtener todas las transacciones de la cuenta
      const allTransactions = LocalStorageService.getTransactions();
      const accountTransactions = allTransactions.filter(
        transaction => transaction.entityId === id && transaction.entityType === 'account'
      );
      setTransactions(accountTransactions);
    }
    setLoading(false);
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(trx => trx.type === filterType);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(trx => 
        trx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trx.amount.toString().includes(searchTerm)
      );
    }

    setFilteredTransactions(filtered);
  };

  const generateAuditPDF = async () => {
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
      link.download = `auditoria_cuenta_${account?.number}_${new Date().toISOString().split('T')[0]}.txt`;
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
    if (!account || !user) return '';

    let content = `REPORTE DE AUDITORÍA - CUENTA BANCARIA\n`;
    content += `==========================================\n\n`;
    content += `INFORMACIÓN DE LA CUENTA:\n`;
    content += `-`.repeat(50) + `\n`;
    content += `Tipo: ${getAccountTypeLabel(account.type)}\n`;
    content += `Número: ${account.number}\n`;
    content += `CBU: ${account.cbu}\n`;
    content += `Alias: ${account.alias}\n`;
    content += `Saldo Actual: ${account.currency === 'USD' ? 'US$' : '$'} ${account.balance.toLocaleString()}\n`;
    content += `Moneda: ${account.currency}\n\n`;
    
    content += `INFORMACIÓN DEL TITULAR:\n`;
    content += `-`.repeat(50) + `\n`;
    content += `Nombre: ${user.name}\n`;
    content += `Usuario: ${user.username}\n`;
    content += `Tipo: ${user.is_admin ? 'Administrador' : 'Usuario Normal'}\n\n`;

    content += `RESUMEN DE MOVIMIENTOS:\n`;
    content += `-`.repeat(50) + `\n`;
    const totalIncome = transactions.filter(trx => trx.type === 'credit').reduce((sum, trx) => sum + trx.amount, 0);
    const totalExpenses = transactions.filter(trx => trx.type === 'debit').reduce((sum, trx) => sum + trx.amount, 0);
    content += `Total Ingresos: ${account.currency === 'USD' ? 'US$' : '$'} ${totalIncome.toLocaleString()}\n`;
    content += `Total Gastos: ${account.currency === 'USD' ? 'US$' : '$'} ${totalExpenses.toLocaleString()}\n`;
    content += `Total Movimientos: ${transactions.length}\n`;
    content += `Saldo Neto: ${account.currency === 'USD' ? 'US$' : '$'} ${(totalIncome - totalExpenses).toLocaleString()}\n\n`;

    content += `DETALLE COMPLETO DE MOVIMIENTOS:\n`;
    content += `-`.repeat(80) + `\n`;
    content += `Fecha\t\tTipo\t\tDescripción\t\t\tMonto\t\tSaldo\n`;
    content += `-`.repeat(80) + `\n`;

    // Ordenar transacciones por fecha (más recientes primero)
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let runningBalance = account.balance;
    sortedTransactions.forEach(transaction => {
      const date = new Date(transaction.date).toLocaleDateString('es-ES');
      const type = transaction.type === 'debit' ? 'GASTO' : 'INGRESO';
      const amount = transaction.type === 'debit' ? `-${account.currency === 'USD' ? 'US$' : '$'}${transaction.amount.toLocaleString()}` : `+${account.currency === 'USD' ? 'US$' : '$'}${transaction.amount.toLocaleString()}`;
      
      // Calcular saldo después de la transacción
      if (transaction.type === 'debit') {
        runningBalance += transaction.amount; // Revertir el gasto para obtener saldo anterior
      } else {
        runningBalance -= transaction.amount; // Revertir el ingreso para obtener saldo anterior
      }

      content += `${date}\t${type}\t\t${transaction.description.padEnd(25)}\t${amount.padStart(15)}\t${account.currency === 'USD' ? 'US$' : '$'} ${runningBalance.toLocaleString()}\n`;
    });

    content += `\n`;
    content += `REPORTE GENERADO EL: ${new Date().toLocaleDateString('es-ES')} A LAS ${new Date().toLocaleTimeString('es-ES')}\n`;
    content += `HomeBanking - Sistema de Auditoría Financiera\n`;
    content += `Usuario Auditor: Administrador del Sistema\n`;

    return content;
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currencySymbol = account?.currency === 'USD' ? 'US$' : '$';

  if (loading) {
    return (
      <div className="audit-page">
        <Header title="Auditoría de Cuenta" backButton />
        <div className="loading">
          <p>Cargando información de auditoría...</p>
        </div>
      </div>
    );
  }

  if (!account || !user) {
    return (
      <div className="audit-page">
        <Header title="Auditoría de Cuenta" backButton />
        <div className="error">
          <p>La cuenta no fue encontrada</p>
          <button onClick={() => navigate('/admin')}>Volver al Panel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-page">
      <Header title="Auditoría de Cuenta" backButton />
      
      <div className="audit-container">
        <div className="audit-header">
          <div className="account-info">
            <div className="account-icon">
              <DollarSign size={32} />
            </div>
            <div className="account-details">
              <h1>{getAccountTypeLabel(account.type)}</h1>
              <p className="account-number">N°: {account.number}</p>
              <p className="account-balance">
                {currencySymbol} {account.balance.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="user-info">
            <div className="user-icon">
              <UserIcon size={24} />
            </div>
            <div className="user-details">
              <h3>{user.name}</h3>
              <p>{user.username}</p>
              <span className={`user-type ${user.is_admin ? 'admin' : 'user'}`}>
                {user.is_admin ? 'Administrador' : 'Usuario'}
              </span>
            </div>
          </div>
        </div>

        <div className="audit-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Ingresos</h3>
              <p className="credit">
                {currencySymbol} {transactions.filter(trx => trx.type === 'credit').reduce((sum, trx) => sum + trx.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <TrendingDown size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Gastos</h3>
              <p className="debit">
                {currencySymbol} {transactions.filter(trx => trx.type === 'debit').reduce((sum, trx) => sum + trx.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Movimientos</h3>
              <p>{transactions.length}</p>
            </div>
          </div>
        </div>

        <div className="account-details-section">
          <h2>Información de la Cuenta</h2>
          <div className="details-grid">
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
        </div>

        <div className="filters-section">
          <div className="search-filter">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar en movimientos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="type-filter">
            <Filter size={20} />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as 'all' | 'credit' | 'debit')}>
              <option value="all">Todos los movimientos</option>
              <option value="credit">Solo ingresos</option>
              <option value="debit">Solo gastos</option>
            </select>
          </div>
          
          <button 
            className="download-button"
            onClick={generateAuditPDF}
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
                <span>Descargar Reporte</span>
              </>
            )}
          </button>
        </div>

        <div className="transactions-section">
          <h2>Movimientos de Auditoría ({filteredTransactions.length})</h2>
          
          {filteredTransactions.length > 0 ? (
            <div className="transactions-list">
              {filteredTransactions.map(transaction => (
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
          ) : (
            <div className="no-transactions">
              <p>No se encontraron movimientos con los filtros aplicados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountAuditPage; 