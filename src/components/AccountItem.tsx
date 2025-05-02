import React from 'react';
import { Landmark } from 'lucide-react';
import '../styles/components/AccountItem.scss';

interface AccountProps {
  account: {
    id: string;
    type: string;
    name: string;
    number: string;
    balance: number;
    currency: string;
    cbu: string;
    alias: string;
  };
  onClick: () => void;
}

const AccountItem: React.FC<AccountProps> = ({ account, onClick }) => {
  const getAccountTypeIcon = () => {
    return <Landmark size={20} />;
  };
  
  const currencySymbol = account.currency === 'USD' ? 'US$' : '$';

  return (
    <div className={`account-item ${account.type}`} onClick={onClick}>
      <div className="account-header">
        {getAccountTypeIcon()}
        <span className="account-type">
          {account.type === 'savings_pesos' 
            ? 'Caja de Ahorro $' 
            : account.type === 'savings_dollars' 
              ? 'Caja de Ahorro US$' 
              : 'Cuenta Corriente'}
        </span>
      </div>
      
      <div className="account-content">
        <h4 className="account-name">{account.name}</h4>
        <p className="account-number">N°: {account.number}</p>
        
        <div className="account-balance">
          <span className="balance-label">Saldo</span>
          <span className="balance-value">{currencySymbol} {account.balance.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default AccountItem;