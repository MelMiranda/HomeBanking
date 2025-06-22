import { Database, UserPlus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Account, Card, LocalStorageService, User } from '../services/localStorageService';
import '../styles/pages/AdminPage.scss';

const AdminPage: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'accounts' | 'cards' | 'users' | 'expenses'>('accounts');
  const [selectedUser, setSelectedUser] = useState('');
  const [accountType, setAccountType] = useState('pesos');
  const [cardType, setCardType] = useState('debit');
  const [showForm, setShowForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  
  // Formulario de usuario
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    is_admin: false
  });

  // Obtener datos del localStorage
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [cards, setCards] = useState<Card[]>([]);

  // Filtrar usuarios que no son administradores
  const regularUsers = users.filter(user => !user.is_admin);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allAccounts = LocalStorageService.getAccounts();
    const allUsers = LocalStorageService.getUsers();
    const allCards = LocalStorageService.getCards();
    
    setAccounts(allAccounts);
    setUsers(allUsers);
    setCards(allCards);
  };

  if (!isAdmin()) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos de administrador para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.username || !newUser.password || !newUser.name) {
      alert('Por favor, completa todos los campos');
      return;
    }

    // Verificar que el username no exista
    const existingUser = users.find(u => u.username === newUser.username);
    if (existingUser) {
      alert('El nombre de usuario ya existe');
      return;
    }

    setShowUserForm(false);
    setNewUser({
      username: '',
      password: '',
      name: '',
      is_admin: false
    });

    try {
      const newUserData = {
        id: `user${Date.now()}`,
        ...newUser
      };

      LocalStorageService.addUser(newUserData);
      alert('Usuario creado exitosamente');
      loadData();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Error al crear el usuario');
      }
    }
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario "${user.name}"? Esta acción también eliminará todas sus cuentas y tarjetas.`)) {
      try {
        // Eliminar cuentas del usuario
        const userAccounts = accounts.filter(acc => acc.userId === userId);
        userAccounts.forEach(acc => LocalStorageService.deleteAccount(acc.id));

        // Eliminar tarjetas del usuario
        const userCards = cards.filter(card => card.userId === userId);
        userCards.forEach(card => LocalStorageService.deleteCard(card.id));

        // Eliminar usuario
        LocalStorageService.deleteUser(userId);
        alert('Usuario eliminado exitosamente');
        loadData();
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        } else {
          alert('Error al eliminar el usuario');
        }
      }
    }
  };

  const handleCreateAccount = () => {
    if (!selectedUser) return;
    
    const newAccount = {
      id: `acc${Date.now()}`,
      userId: selectedUser,
      type: accountType as 'pesos' | 'dolar' | 'corriente',
      name: `Cuenta ${accountType === 'pesos' ? 'en Pesos' : accountType === 'dolar' ? 'en Dólares' : 'Corriente'}`,
      number: (Math.floor(Math.random() * 90000000000) + 10000000000).toString(),
      cbu: (Math.floor(Math.random() * 9000000000000000000000) + 1000000000000000000000).toString().slice(0, 22),
      alias: `${users.find(u => u.id === selectedUser)?.username}.${accountType}`,
      balance: 0,
      currency: (accountType === 'dolar' ? 'USD' : 'ARS') as 'USD' | 'ARS'
    };

    LocalStorageService.addAccount(newAccount);
    alert('Cuenta creada exitosamente');
    setShowForm(false);
    setSelectedUser('');
  };

  const handleCreateCard = () => {
    if (!selectedUser) return;
    
    const newCard = {
      id: `card${Date.now()}`,
      userId: selectedUser,
      type: cardType as 'credit' | 'debit',
      name: cardType === 'credit' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito',
      number: `**** **** **** ${Math.floor(Math.random() * 9000) + 1000}`,
      availableCredit: cardType === 'credit' ? 100000 : 50000,
      balanceToPay: 0,
      dueDate: cardType === 'credit' ? '2024-12-15' : undefined,
      expiryDate: '2027-12'
    };

    LocalStorageService.addCard(newCard);
    alert('Tarjeta creada exitosamente');
    setShowForm(false);
    setSelectedUser('');
  };

  const handleDataManagement = () => {
    navigate('/data-management');
  };

  const handleExpensesClick = () => {
    navigate('/card-expenses');
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Usuario no encontrado';
  };

  const normalUsers = users.filter(u => !u.is_admin);
  const adminUsers = users.filter(u => u.is_admin);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Panel de Administración</h1>
        <p>Gestiona usuarios, cuentas y tarjetas del sistema</p>
        <button className="data-management-btn" onClick={handleDataManagement}>
          <Database size={16} />
          <span>Gestión de Datos</span>
        </button>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'accounts' ? 'active' : ''}`}
          onClick={() => setActiveTab('accounts')}
        >
          <UserPlus size={18} />
          <span>Gestionar Cuentas</span>
        </button>
        <button 
          className={`tab ${activeTab === 'cards' ? 'active' : ''}`}
          onClick={() => setActiveTab('cards')}
        >
          <UserPlus size={18} />
          <span>Gestionar Tarjetas</span>
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <UserPlus size={18} />
          <span>Gestionar Usuarios</span>
        </button>
        <button 
          className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          <UserPlus size={18} />
          <span>Cargar Gastos</span>
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'accounts' && (
          <div className="accounts-section">
            <div className="section-header">
              <h2>Cuentas Bancarias</h2>
              <button 
                className="create-button"
                onClick={() => setShowForm(true)}
              >
                Crear Nueva Cuenta
              </button>
            </div>

            {showForm && (
              <div className="create-form">
                <h3>Crear Nueva Cuenta</h3>
                <div className="form-group">
                  <label>Usuario:</label>
                  <select 
                    value={selectedUser} 
                    onChange={(e) => setSelectedUser(e.target.value)}
                  >
                    <option value="">Seleccionar usuario</option>
                    {regularUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.username})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo de cuenta:</label>
                  <select 
                    value={accountType} 
                    onChange={(e) => setAccountType(e.target.value)}
                  >
                    <option value="pesos">Caja de Ahorro en Pesos</option>
                    <option value="dolar">Caja de Ahorro en Dólares</option>
                    <option value="corriente">Cuenta Corriente</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button onClick={handleCreateAccount}>Crear Cuenta</button>
                  <button onClick={() => setShowForm(false)}>Cancelar</button>
                </div>
              </div>
            )}

            <div className="accounts-list">
              {accounts.map(account => {
                const user = users.find(u => u.id === account.userId);
                return (
                  <div 
                    key={account.id} 
                    className="account-item clickable"
                    onClick={() => navigate(`/account-audit/${account.id}`)}
                  >
                    <div className="account-info">
                      <h4>{account.name}</h4>
                      <p><strong>Usuario:</strong> {user?.name}</p>
                      <p><strong>Número:</strong> {account.number}</p>
                      <p><strong>Saldo:</strong> ${account.balance.toLocaleString()} {account.currency}</p>
                    </div>
                    <div className="account-actions">
                      <span className="audit-link">Ver Auditoría →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'cards' && (
          <div className="cards-section">
            <div className="section-header">
              <h2>Tarjetas Bancarias</h2>
              <button 
                className="create-button"
                onClick={() => setShowForm(true)}
              >
                Crear Nueva Tarjeta
              </button>
            </div>

            {showForm && (
              <div className="create-form">
                <h3>Crear Nueva Tarjeta</h3>
                <div className="form-group">
                  <label>Usuario:</label>
                  <select 
                    value={selectedUser} 
                    onChange={(e) => setSelectedUser(e.target.value)}
                  >
                    <option value="">Seleccionar usuario</option>
                    {regularUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.username})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo de tarjeta:</label>
                  <select 
                    value={cardType} 
                    onChange={(e) => setCardType(e.target.value)}
                  >
                    <option value="debit">Tarjeta de Débito</option>
                    <option value="credit">Tarjeta de Crédito</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button onClick={handleCreateCard}>Crear Tarjeta</button>
                  <button onClick={() => setShowForm(false)}>Cancelar</button>
                </div>
              </div>
            )}

            <div className="cards-list">
              {cards.map(card => {
                const user = users.find(u => u.id === card.userId);
                return (
                  <div key={card.id} className="card-item">
                    <div className="card-info">
                      <h4>{card.name}</h4>
                      <p><strong>Usuario:</strong> {user?.name}</p>
                      <p><strong>Número:</strong> {card.number}</p>
                      <p><strong>Crédito disponible:</strong> ${card.availableCredit.toLocaleString()}</p>
                      {card.type === 'credit' && (
                        <p><strong>Saldo a pagar:</strong> ${card.balanceToPay.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <h2>Usuarios del Sistema</h2>
              <button 
                className="create-button"
                onClick={() => setShowUserForm(true)}
              >
                <UserPlus size={16} />
                Crear Nuevo Usuario
              </button>
            </div>

            {showUserForm && (
              <div className="create-form">
                <h3>Crear Nuevo Usuario</h3>
                <div className="form-group">
                  <label>Nombre completo:</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Ingresa el nombre completo"
                  />
                </div>
                <div className="form-group">
                  <label>Nombre de usuario:</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="Ingresa el nombre de usuario"
                  />
                </div>
                <div className="form-group">
                  <label>Contraseña:</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Ingresa la contraseña"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newUser.is_admin}
                      onChange={(e) => setNewUser({...newUser, is_admin: e.target.checked})}
                    />
                    Es administrador
                  </label>
                </div>
                <div className="form-actions">
                  <button onClick={handleCreateUser}>Crear Usuario</button>
                  <button onClick={() => {
                    setShowUserForm(false);
                    setNewUser({
                      username: '',
                      password: '',
                      name: '',
                      is_admin: false
                    });
                  }}>Cancelar</button>
                </div>
              </div>
            )}

            <div className="users-list">
              {users.map(user => {
                const userAccounts = accounts.filter(acc => acc.userId === user.id);
                const userCards = cards.filter(card => card.userId === user.id);
                
                return (
                  <div key={user.id} className="user-item">
                    <div className="user-info">
                      <div className="user-header">
                        <h4>{user.name}</h4>
                        {user.is_admin && (
                          <span className="admin-badge">Administrador</span>
                        )}
                      </div>
                      <p><strong>Usuario:</strong> {user.username}</p>
                      <p><strong>Cuentas:</strong> {userAccounts.length}</p>
                      <p><strong>Tarjetas:</strong> {userCards.length}</p>
                    </div>
                    <div className="user-actions">
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.is_admin && users.filter(u => u.is_admin).length === 1}
                        title={user.is_admin && users.filter(u => u.is_admin).length === 1 ? 
                          "No se puede eliminar el último administrador" : "Eliminar usuario"}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="expenses-section">
            <h3>Cargar Gastos en Tarjetas</h3>
            <p>Accede al panel para cargar gastos en las tarjetas de los usuarios</p>
            
            <button onClick={handleExpensesClick} className="expenses-button">
              <UserPlus size={20} />
              <span>Ir a Cargar Gastos</span>
            </button>

            <div className="expenses-info">
              <h4>Información sobre Gastos</h4>
              <ul>
                <li>Solo los administradores pueden cargar gastos</li>
                <li>Los gastos se registran como transacciones de débito</li>
                <li>Se actualiza automáticamente el saldo de la tarjeta</li>
                <li>Los usuarios pueden ver sus gastos en el historial</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage; 