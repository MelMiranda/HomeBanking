import React from 'react';
import { CreditCard } from 'lucide-react';
import '../styles/components/CardItem.scss';

interface CardProps {
  card: {
    id: string;
    type: string;
    name: string;
    number: string;
    availableCredit: number;
    balanceToPay: number;
    expiryDate: string;
    dueDate?: string;
  };
  onClick: () => void;
}

const CardItem: React.FC<CardProps> = ({ card, onClick }) => {
  return (
    <div className={`card-item ${card.type}`} onClick={onClick}>
      <div className="card-header">
        <CreditCard size={20} />
        <span className="card-type">
          {card.type === 'credit' ? 'Crédito' : 'Débito'}
        </span>
      </div>
      
      <div className="card-content">
        <h4 className="card-name">{card.name}</h4>
        <p className="card-number">{card.number}</p>
        
        <div className="card-details">
          <div className="card-detail">
            <span className="detail-label">Disponible</span>
            <span className="detail-value">${card.availableCredit.toLocaleString()}</span>
          </div>
          
          {card.type === 'credit' && (
            <div className="card-detail">
              <span className="detail-label">A pagar</span>
              <span className="detail-value">${card.balanceToPay.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardItem;