import { AlertCircle, Calendar, CheckCircle, CreditCard, DollarSign, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Card, LocalStorageService, Transaction } from '../services/localStorageService';
import '../styles/pages/CardExpensePage.scss';

const CardExpensePage: React.FC = () => {
  const { user } = useAuth();
  const [selectedCard, setSelectedCard] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [cards, setCards] = useState<Card[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allCards = LocalStorageService.getCards();
    const allUsers = LocalStorageService.getUsers();
    setCards(allCards);
    setUsers(allUsers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCard || !amount || !description.trim() || !date) {
      setError('Por favor, completa todos los campos');
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      setError('El monto debe ser un número positivo');
      return;
    }

    const card = cards.find(c => c.id === selectedCard);
    if (!card) {
      setError('Tarjeta no válida');
      return;
    }

    // Verificar crédito disponible
    if (card.availableCredit < expenseAmount) {
      setError('Crédito insuficiente para realizar el gasto');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Crear transacción de gasto
      const transaction: Transaction = {
        id: `expense_${Date.now()}`,
        entityId: card.id,
        entityType: 'card',
        date: date,
        description: description,
        amount: expenseAmount,
        type: 'debit'
      };

      // Actualizar saldo de la tarjeta
      const updatedCard = {
        ...card,
        availableCredit: card.availableCredit - expenseAmount,
        balanceToPay: card.balanceToPay + expenseAmount
      };

      // Guardar cambios
      LocalStorageService.addTransaction(transaction);
      LocalStorageService.updateCard(updatedCard);

      setSuccess('Gasto cargado exitosamente');
      
      // Limpiar formulario
      setTimeout(() => {
        setSelectedCard('');
        setAmount('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
        setSuccess('');
        loadData(); // Recargar datos para mostrar saldos actualizados
      }, 2000);

    } catch (error) {
      setError('Error al cargar el gasto. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Usuario no encontrado';
  };

  return (
    <div className="card-expense-page">
      <Header title="Cargar Gastos en Tarjetas" backButton />
      
      <div className="card-expense-content">
        <div className="expense-header">
          <h1>Cargar Gastos en Tarjetas</h1>
          <p>Registra gastos en las tarjetas de los usuarios</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-message">
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

        <div className="expense-form">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Seleccionar Tarjeta</h3>
              <div className="form-group">
                <label>Tarjeta:</label>
                <select 
                  value={selectedCard} 
                  onChange={(e) => setSelectedCard(e.target.value)}
                  disabled={isLoading}
                  required
                >
                  <option value="">Selecciona una tarjeta</option>
                  {cards.map(card => {
                    const cardUser = users.find(u => u.id === card.userId);
                    return (
                      <option key={card.id} value={card.id}>
                        {cardUser?.name} - {card.name} - Crédito: ${card.availableCredit.toLocaleString()}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="form-section">
              <h3>Detalles del Gasto</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Monto:</label>
                  <div className="input-with-icon">
                    <DollarSign size={16} />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Fecha:</label>
                  <div className="input-with-icon">
                    <Calendar size={16} />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label>Descripción:</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción del gasto"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit"
                disabled={isLoading || !selectedCard || !amount || !description.trim() || !date}
                className="submit-button"
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Cargando gasto...
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Cargar Gasto
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Información de tarjetas */}
        <div className="cards-info">
          <h3>Tarjetas Disponibles</h3>
          <div className="cards-grid">
            {cards.map(card => {
              const cardUser = users.find(u => u.id === card.userId);
              return (
                <div key={card.id} className="card-info-item">
                  <div className="card-icon">
                    <CreditCard size={24} />
                  </div>
                  <div className="card-details">
                    <h4>{card.name}</h4>
                    <p><strong>Propietario:</strong> {cardUser?.name || 'Usuario no encontrado'}</p>
                    <p><strong>Crédito Disponible:</strong> ${card.availableCredit.toLocaleString()}</p>
                    <p><strong>Saldo a Pagar:</strong> ${card.balanceToPay.toLocaleString()}</p>
                    <p><strong>Tipo:</strong> {card.type === 'credit' ? 'Crédito' : 'Débito'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardExpensePage; 