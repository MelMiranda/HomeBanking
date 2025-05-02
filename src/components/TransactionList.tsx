import React from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import '../styles/components/TransactionList.scss';

interface Transaction {
  id: string;
  entityId: string;
  entityType: string;
  date: string;
  description: string;
  amount: number;
  type: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  // Group transactions by date
  const groupedTransactions: Record<string, Transaction[]> = {};
  
  transactions.forEach(transaction => {
    const date = transaction.date;
    if (!groupedTransactions[date]) {
      groupedTransactions[date] = [];
    }
    groupedTransactions[date].push(transaction);
  });
  
  // Sort dates in descending order
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  if (transactions.length === 0) {
    return (
      <div className="empty-transactions">
        <p>No hay movimientos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {sortedDates.map(date => (
        <div key={date} className="transaction-group">
          <div className="transaction-date">
            {new Date(date).toLocaleDateString('es-AR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          
          {groupedTransactions[date].map(transaction => (
            <div 
              key={transaction.id} 
              className={`transaction-item ${transaction.type}`}
            >
              <div className="transaction-icon">
                {transaction.type === 'credit' 
                  ? <ArrowDownLeft size={20} /> 
                  : <ArrowUpRight size={20} />
                }
              </div>
              
              <div className="transaction-content">
                <div className="transaction-description">
                  {transaction.description}
                </div>
                <div className="transaction-type">
                  {transaction.type === 'credit' ? 'Ingreso' : 'Egreso'}
                </div>
              </div>
              
              <div className="transaction-amount">
                <span className={`amount ${transaction.type}`}>
                  {transaction.type === 'credit' ? '+' : '-'} ${transaction.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TransactionList;