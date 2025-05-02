import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAccountById, getBalanceAccount, getTransactionsByEntityId } from '../data/mockData';
import Header from '../components/Header';
import TransactionList from '../components/TransactionList';
import { DollarSign, Hash, AtSign } from 'lucide-react';
import '../styles/pages/DetailPage.scss';

const AccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const account = id ? getAccountById(id) : null;
  const transactions = id ? getTransactionsByEntityId(id, 'account') : [];
  
  if (!account) {
    return (
      <div className="detail-page">
        <Header title="Detalle de Cuenta" backButton onBack={() => navigate('/')} />
        <div className="detail-error">
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

  return (
    <div className="detail-page">
      <Header title="Detalle de Cuenta" backButton onBack={() => navigate('/')} />
      
      <div className="account-detail">
        <div className="detail-header">
          <div className={`detail-account ${account.type}`}>
            <div className="account-type">
              {getAccountTypeLabel(account.type)}
            </div>
            <div className="account-number">N°: {account.number}</div>
            <div className="account-balance">
              {currencySymbol} { getBalanceAccount(account.id).toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="detail-info">
          <div className="info-item">
            <Hash size={20} />
            <div className="info-content">
              <span className="info-label">CBU</span>
              <span className="info-value">{account.cbu}</span>
            </div>
          </div>
          
          <div className="info-item">
            <AtSign size={20} />
            <div className="info-content">
              <span className="info-label">Alias</span>
              <span className="info-value">{account.alias}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="detail-transactions">
        <h3>Movimientos</h3>
        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
};

export default AccountDetailPage;