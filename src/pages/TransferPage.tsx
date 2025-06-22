import { AlertCircle, ArrowRight, CheckCircle, History, Search } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Account, LocalStorageService, Transaction } from '../services/localStorageService';
import '../styles/pages/TransferPage.scss';

const TransferPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estados del formulario
  const [originAccount, setOriginAccount] = useState('');
  const [destinationType, setDestinationType] = useState<'alias' | 'cbu' | 'id'>('alias');
  const [destinationValue, setDestinationValue] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  // Estados de la aplicación
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<Account | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Obtener cuentas del usuario
  const userAccounts = user ? LocalStorageService.getAccountsByUserId(user.id) : [];
  const allAccounts = LocalStorageService.getAccounts();

  // Buscar cuenta de destino
  const searchDestinationAccount = () => {
    if (!destinationValue.trim()) {
      setError('Por favor, ingresa un valor para buscar');
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchResult(null);

    let foundAccount: Account | undefined;

    switch (destinationType) {
      case 'alias':
        foundAccount = allAccounts.find(acc => 
          acc.alias.toLowerCase() === destinationValue.toLowerCase()
        );
        break;
      case 'cbu':
        foundAccount = allAccounts.find(acc => acc.cbu === destinationValue);
        break;
      case 'id':
        foundAccount = allAccounts.find(acc => acc.id === destinationValue);
        break;
    }

    if (foundAccount) {
      // Verificar que no sea una cuenta propia
      if (foundAccount.userId === user?.id) {
        setError('No puedes transferir a tu propia cuenta');
        setSearchResult(null);
      } else {
        setSearchResult(foundAccount);
        setError('');
      }
    } else {
      setError('No se encontró una cuenta con esos datos');
      setSearchResult(null);
    }

    setIsSearching(false);
  };

  // Realizar transferencia
  const handleTransfer = async () => {
    if (!originAccount || !searchResult || !amount || !description.trim()) {
      setError('Por favor, completa todos los campos');
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError('El monto debe ser un número positivo');
      return;
    }

    // Obtener cuenta de origen
    const originAccountData = userAccounts.find(acc => acc.id === originAccount);
    if (!originAccountData) {
      setError('Cuenta de origen no válida');
      return;
    }

    // Verificar saldo suficiente
    if (originAccountData.balance < transferAmount) {
      setError('Saldo insuficiente para realizar la transferencia');
      return;
    }

    // Verificar que las cuentas sean de la misma moneda
    if (originAccountData.currency !== searchResult.currency) {
      setError('No puedes transferir entre cuentas de diferentes monedas');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Crear transacciones
      const timestamp = Date.now();
      
      // Transacción de débito en cuenta origen
      const debitTransaction: Transaction = {
        id: `trx${timestamp}_debit`,
        entityId: originAccountData.id,
        entityType: 'account',
        date: new Date().toISOString().split('T')[0],
        description: `Transferencia enviada a ${searchResult.alias} - ${description}`,
        amount: transferAmount,
        type: 'debit'
      };

      // Transacción de crédito en cuenta destino
      const creditTransaction: Transaction = {
        id: `trx${timestamp}_credit`,
        entityId: searchResult.id,
        entityType: 'account',
        date: new Date().toISOString().split('T')[0],
        description: `Transferencia recibida de ${originAccountData.alias} - ${description}`,
        amount: transferAmount,
        type: 'credit'
      };

      // Actualizar saldos
      const updatedOriginAccount = {
        ...originAccountData,
        balance: originAccountData.balance - transferAmount
      };

      const updatedDestinationAccount = {
        ...searchResult,
        balance: searchResult.balance + transferAmount
      };

      // Guardar cambios
      LocalStorageService.addTransaction(debitTransaction);
      LocalStorageService.addTransaction(creditTransaction);
      LocalStorageService.updateAccount(updatedOriginAccount);
      LocalStorageService.updateAccount(updatedDestinationAccount);

      setSuccess('Transferencia realizada exitosamente');
      
      // Limpiar formulario
      setTimeout(() => {
        setOriginAccount('');
        setDestinationValue('');
        setAmount('');
        setDescription('');
        setSearchResult(null);
        setSuccess('');
      }, 3000);

    } catch (error) {
      setError('Error al procesar la transferencia. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener información del propietario de la cuenta destino
  const getDestinationOwnerInfo = () => {
    if (!searchResult) return null;
    const owner = LocalStorageService.getUserById(searchResult.userId);
    return owner;
  };

  const handleHistoryClick = () => {
    navigate('/transfer-history');
  };

  return (
    <div className="transfer-page">
      <Header title="Transferencias" backButton />
      
      <div className="transfer-content">
        <div className="transfer-header">
          <h1>Realizar Transferencia</h1>
          <p>Envía dinero a otras cuentas del sistema</p>
          <button className="history-button" onClick={handleHistoryClick}>
            <History size={16} />
            <span>Ver Historial</span>
          </button>
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

        <div className="transfer-form">
          {/* Cuenta de origen */}
          <div className="form-section">
            <h3>Cuenta de Origen</h3>
            <div className="form-group">
              <label>Selecciona tu cuenta:</label>
              <select 
                value={originAccount} 
                onChange={(e) => setOriginAccount(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Selecciona una cuenta</option>
                {userAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} - ${account.balance.toLocaleString()} {account.currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cuenta de destino */}
          <div className="form-section">
            <h3>Cuenta de Destino</h3>
            <div className="search-container">
              <div className="search-type">
                <label>Buscar por:</label>
                <select 
                  value={destinationType} 
                  onChange={(e) => setDestinationType(e.target.value as 'alias' | 'cbu' | 'id')}
                  disabled={isLoading}
                >
                  <option value="alias">Alias</option>
                  <option value="cbu">CBU</option>
                  <option value="id">ID de cuenta</option>
                </select>
              </div>
              
              <div className="search-input">
                <input
                  type="text"
                  value={destinationValue}
                  onChange={(e) => setDestinationValue(e.target.value)}
                  placeholder={`Ingresa el ${destinationType === 'alias' ? 'alias' : destinationType === 'cbu' ? 'CBU' : 'ID'} de la cuenta`}
                  disabled={isLoading}
                />
                <button 
                  type="button"
                  onClick={searchDestinationAccount}
                  disabled={isLoading || isSearching || !destinationValue.trim()}
                  className="search-btn"
                >
                  {isSearching ? 'Buscando...' : <Search size={16} />}
                </button>
              </div>
            </div>

            {/* Resultado de búsqueda */}
            {searchResult && (
              <div className="search-result">
                <div className="account-info">
                  <h4>Cuenta encontrada:</h4>
                  <p><strong>Propietario:</strong> {getDestinationOwnerInfo()?.name}</p>
                  <p><strong>Alias:</strong> {searchResult.alias}</p>
                  <p><strong>CBU:</strong> {searchResult.cbu}</p>
                  <p><strong>Tipo:</strong> {searchResult.name}</p>
                  <p><strong>Moneda:</strong> {searchResult.currency}</p>
                </div>
              </div>
            )}
          </div>

          {/* Detalles de la transferencia */}
          <div className="form-section">
            <h3>Detalles de la Transferencia</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Monto:</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label>Descripción:</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Motivo de la transferencia"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Botón de transferencia */}
          <div className="transfer-actions">
            <button 
              onClick={handleTransfer}
              disabled={isLoading || !originAccount || !searchResult || !amount || !description.trim()}
              className="transfer-button"
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Procesando transferencia...
                </>
              ) : (
                <>
                  <ArrowRight size={20} />
                  Realizar Transferencia
                </>
              )}
            </button>
          </div>
        </div>

        {/* Información adicional */}
        <div className="transfer-info">
          <h3>Información Importante</h3>
          <ul>
            <li>Las transferencias se procesan inmediatamente</li>
            <li>Solo puedes transferir entre cuentas de la misma moneda</li>
            <li>Verifica que tengas saldo suficiente antes de transferir</li>
            <li>Los movimientos se reflejan en ambas cuentas</li>
            <li>Puedes buscar cuentas por alias, CBU o ID</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TransferPage; 