import { Calendar, CreditCard, DollarSign, FileText, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Card, LocalStorageService, Transaction } from '../services/localStorageService';
import '../styles/pages/DetailPage.scss';

const CardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [card, setCard] = useState<Card | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCardData();
    }
  }, [id]);

  const loadCardData = () => {
    if (!id) return;

    const cardData = LocalStorageService.getCardById(id);
    if (!cardData) {
      navigate('/');
      return;
    }

    // Verificar que el usuario sea propietario de la tarjeta
    if (cardData.userId !== user?.id) {
      navigate('/');
      return;
    }

    setCard(cardData);

    // Cargar transacciones de la tarjeta
    const cardTransactions = LocalStorageService.getTransactionsByEntityId(id, 'card');
    cardTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(cardTransactions);

    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSummaryClick = () => {
    navigate(`/card-summary/${id}`);
  };

  if (isLoading) {
    return (
      <div className="detail-page">
        <Header title="Cargando..." backButton />
        <div className="loading">Cargando información de la tarjeta...</div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="detail-page">
        <Header title="Tarjeta no encontrada" backButton />
        <div className="error">Tarjeta no encontrada</div>
      </div>
    );
  }

  const totalDebits = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalCredits = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="detail-page">
      <Header title={card.name} backButton />
      
      <div className="detail-content">
        <div className="card-header">
          <div className="card-icon">
            <CreditCard size={32} />
          </div>
          <div className="card-info">
            <h1>{card.name}</h1>
            <p className="card-number">{card.number}</p>
            <p className="card-type">{card.type === 'credit' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'}</p>
          </div>
        </div>

        <div className="card-stats">
          <div className="stat-item">
            <div className="stat-icon">
              <DollarSign size={20} />
            </div>
            <div className="stat-content">
              <h3>Crédito Disponible</h3>
              <p>${card.availableCredit.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <TrendingDown size={20} />
            </div>
            <div className="stat-content">
              <h3>Saldo a Pagar</h3>
              <p>${card.balanceToPay.toLocaleString()}</p>
            </div>
          </div>
          
          {card.dueDate && (
            <div className="stat-item">
              <div className="stat-icon">
                <Calendar size={20} />
              </div>
              <div className="stat-content">
                <h3>Fecha de Vencimiento</h3>
                <p>{card.dueDate}</p>
              </div>
            </div>
          )}
          
          <div className="stat-item">
            <div className="stat-icon">
              <Calendar size={20} />
            </div>
            <div className="stat-content">
              <h3>Fecha de Expiración</h3>
              <p>{card.expiryDate}</p>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="action-button summary" onClick={handleSummaryClick}>
            <FileText size={20} />
            <span>Generar Resumen</span>
          </button>
        </div>

        <div className="transactions-section">
          <h2>Últimos Movimientos</h2>
          
          <div className="transactions-summary">
            <div className="summary-item">
              <span>Total Gastos:</span>
              <span className="debit">-${totalDebits.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span>Total Pagos:</span>
              <span className="credit">+${totalCredits.toLocaleString()}</span>
            </div>
          </div>

          <div className="transactions-list">
            {transactions.length > 0 ? (
              transactions.slice(0, 10).map(transaction => (
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
              ))
            ) : (
              <div className="empty-transactions">
                <p>No hay movimientos registrados</p>
              </div>
            )}
          </div>

          {transactions.length > 10 && (
            <div className="view-more">
              <p>Mostrando los últimos 10 movimientos de {transactions.length} totales</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDetailPage;