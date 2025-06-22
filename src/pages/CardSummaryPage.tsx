import { Calendar, CreditCard, DollarSign, Download, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Card, LocalStorageService, Transaction } from '../services/localStorageService';
import '../styles/pages/CardSummaryPage.scss';

const CardSummaryPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedCard, setSelectedCard] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const [userCards, setUserCards] = useState<Card[]>([]);
  const [selectedCardData, setSelectedCardData] = useState<Card | null>(null);

  useEffect(() => {
    if (user) {
      const cards = LocalStorageService.getCardsByUserId(user.id);
      setUserCards(cards);
    }
  }, [user]);

  useEffect(() => {
    if (selectedCard && selectedMonth) {
      loadTransactions();
    } else {
      setTransactions([]);
    }
  }, [selectedCard, selectedMonth]);

  const loadTransactions = () => {
    if (!selectedCard || !selectedMonth) return;

    const allTransactions = LocalStorageService.getTransactions();
    const [year, month] = selectedMonth.split('-');
    
    const filteredTransactions = allTransactions.filter(transaction => {
      if (transaction.entityId !== selectedCard || transaction.entityType !== 'card') {
        return false;
      }
      
      const transactionDate = new Date(transaction.date);
      return transactionDate.getFullYear() === parseInt(year) && 
             transactionDate.getMonth() === parseInt(month) - 1;
    });

    // Ordenar por fecha (más recientes primero)
    filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setTransactions(filteredTransactions);
    
    // Obtener datos de la tarjeta seleccionada
    const card = userCards.find(c => c.id === selectedCard);
    setSelectedCardData(card || null);
  };

  const generatePDF = async () => {
    if (!selectedCardData || transactions.length === 0) return;

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
      link.download = `resumen_${selectedCardData.name}_${selectedMonth}.txt`;
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
    if (!selectedCardData) return '';

    const [year, month] = selectedMonth.split('-');
    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    
    const totalDebits = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalCredits = transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

    let content = `RESUMEN DE TARJETA - ${selectedCardData.name.toUpperCase()}\n`;
    content += `Período: ${monthName}\n`;
    content += `Propietario: ${user?.name}\n`;
    content += `Número: ${selectedCardData.number}\n`;
    content += `Tipo: ${selectedCardData.type === 'credit' ? 'Crédito' : 'Débito'}\n`;
    content += `Crédito Disponible: $${selectedCardData.availableCredit.toLocaleString()}\n`;
    content += `Saldo a Pagar: $${selectedCardData.balanceToPay.toLocaleString()}\n`;
    if (selectedCardData.dueDate) {
      content += `Fecha de Vencimiento: ${selectedCardData.dueDate}\n`;
    }
    content += `\n`;
    content += `RESUMEN DEL PERÍODO:\n`;
    content += `Total Gastos: $${totalDebits.toLocaleString()}\n`;
    content += `Total Pagos: $${totalCredits.toLocaleString()}\n`;
    content += `Saldo Neto: $${(totalCredits - totalDebits).toLocaleString()}\n`;
    content += `\n`;
    content += `DETALLE DE MOVIMIENTOS:\n`;
    content += `Fecha\t\tTipo\t\tDescripción\t\tMonto\n`;
    content += `-`.repeat(80) + `\n`;

    transactions.forEach(transaction => {
      const date = new Date(transaction.date).toLocaleDateString('es-ES');
      const type = transaction.type === 'debit' ? 'GASTO' : 'PAGO';
      const amount = transaction.type === 'debit' ? `-$${transaction.amount.toLocaleString()}` : `+$${transaction.amount.toLocaleString()}`;
      content += `${date}\t${type}\t\t${transaction.description}\t\t${amount}\n`;
    });

    content += `\n`;
    content += `Generado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}\n`;
    content += `HomeBanking - Sistema de Gestión Financiera\n`;

    return content;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Generar opciones para los últimos 12 meses
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }

    return options;
  };

  const totalDebits = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalCredits = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="card-summary-page">
      <Header title="Resumen de Tarjeta" backButton />
      
      <div className="card-summary-content">
        <div className="summary-header">
          <h1>Resumen de Tarjeta</h1>
          <p>Genera y descarga resúmenes mensuales de tus tarjetas</p>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label>Seleccionar Tarjeta:</label>
            <select 
              value={selectedCard} 
              onChange={(e) => setSelectedCard(e.target.value)}
            >
              <option value="">Selecciona una tarjeta</option>
              {userCards.map(card => (
                <option key={card.id} value={card.id}>
                  {card.name} - {card.type === 'credit' ? 'Crédito' : 'Débito'}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Seleccionar Mes:</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">Selecciona un mes</option>
              {getMonthOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedCardData && (
          <div className="card-info-section">
            <div className="card-info">
              <div className="card-icon">
                <CreditCard size={24} />
              </div>
              <div className="card-details">
                <h3>{selectedCardData.name}</h3>
                <p><strong>Número:</strong> {selectedCardData.number}</p>
                <p><strong>Tipo:</strong> {selectedCardData.type === 'credit' ? 'Crédito' : 'Débito'}</p>
                <p><strong>Crédito Disponible:</strong> ${selectedCardData.availableCredit.toLocaleString()}</p>
                <p><strong>Saldo a Pagar:</strong> ${selectedCardData.balanceToPay.toLocaleString()}</p>
                {selectedCardData.dueDate && (
                  <p><strong>Vencimiento:</strong> {selectedCardData.dueDate}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {transactions.length > 0 && (
          <>
            <div className="summary-stats">
              <div className="stat-card">
                <div className="stat-icon debit">
                  <TrendingDown size={20} />
                </div>
                <div className="stat-info">
                  <h4>Total Gastos</h4>
                  <p>${totalDebits.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon credit">
                  <TrendingUp size={20} />
                </div>
                <div className="stat-info">
                  <h4>Total Pagos</h4>
                  <p>${totalCredits.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon balance">
                  <DollarSign size={20} />
                </div>
                <div className="stat-info">
                  <h4>Saldo Neto</h4>
                  <p className={totalCredits - totalDebits >= 0 ? 'positive' : 'negative'}>
                    ${(totalCredits - totalDebits).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="transactions-section">
              <div className="section-header">
                <h3>Movimientos del Período</h3>
                <button 
                  onClick={generatePDF}
                  disabled={isGeneratingPDF}
                  className="download-button"
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="spinner"></div>
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Descargar
                    </>
                  )}
                </button>
              </div>

              <div className="transactions-list">
                {transactions.map(transaction => (
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
          </>
        )}

        {selectedCard && selectedMonth && transactions.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <CreditCard size={48} />
            </div>
            <h3>No hay movimientos</h3>
            <p>No se encontraron movimientos para la tarjeta y mes seleccionados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardSummaryPage; 