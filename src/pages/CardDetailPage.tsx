import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCardById, getTransactionsByEntityId } from '../data/mockData';
import Header from '../components/Header';
import TransactionList from '../components/TransactionList';
import { Calendar, DollarSign, CreditCard } from 'lucide-react';
import '../styles/pages/DetailPage.scss';

const CardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const card = id ? getCardById(id) : null;
  const transactions = id ? getTransactionsByEntityId(id, 'card') : [];
  
  if (!card) {
    return (
      <div className="detail-page">
        <Header title="Detalle de Tarjeta" backButton onBack={() => navigate('/')} />
        <div className="detail-error">
          <p>La tarjeta no fue encontrada</p>
          <button onClick={() => navigate('/')}>Volver al Inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <Header title="Detalle de Tarjeta" backButton onBack={() => navigate('/')} />
      
      <div className="card-detail">
        <div className="detail-header">
          <div className={`detail-card ${card.type}`}>
            <div className="card-type">
              <CreditCard size={24} />
              <span>{card.type === 'credit' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'}</span>
            </div>
            <div className="card-number">{card.number}</div>
            <div className="card-name">{card.name}</div>
            <div className="card-expiry">Vence: {card.expiryDate}</div>
          </div>
        </div>
        
        <div className="detail-info">
          <div className="info-item">
            <DollarSign size={20} />
            <div className="info-content">
              <span className="info-label">Disponible</span>
              <span className="info-value">${card.availableCredit.toLocaleString()}</span>
            </div>
          </div>
          
          {card.type === 'credit' && (
            <>
              <div className="info-item">
                <DollarSign size={20} />
                <div className="info-content">
                  <span className="info-label">Saldo a Pagar</span>
                  <span className="info-value">${card.balanceToPay.toLocaleString()}</span>
                </div>
              </div>
              
              {card.dueDate && (
                <div className="info-item">
                  <Calendar size={20} />
                  <div className="info-content">
                    <span className="info-label">Fecha de Vencimiento</span>
                    <span className="info-value">{new Date(card.dueDate).toLocaleDateString('es-AR')}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="detail-transactions">
        <h3>Movimientos</h3>
        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
};

export default CardDetailPage;