// Tipos de datos
export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  is_admin: boolean;
}

export interface Account {
  id: string;
  userId: string;
  type: 'pesos' | 'dolar' | 'corriente';
  name: string;
  number: string;
  cbu: string;
  alias: string;
  balance: number;
  currency: 'ARS' | 'USD';
}

export interface Card {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  name: string;
  number: string;
  availableCredit: number;
  balanceToPay: number;
  dueDate?: string;
  expiryDate: string;
}

export interface Transaction {
  id: string;
  entityId: string;
  entityType: 'card' | 'account';
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
}

// Claves para localStorage
const STORAGE_KEYS = {
  USERS: 'homeBanking_users',
  ACCOUNTS: 'homeBanking_accounts',
  CARDS: 'homeBanking_cards',
  TRANSACTIONS: 'homeBanking_transactions'
};

// Datos iniciales por defecto
const DEFAULT_USERS: User[] = [
  {
    id: "1",
    username: "farana",
    password: "1234",
    name: "Federico Arana",
    is_admin: true
  },
  {
    id: "2",
    username: "mmiranda",
    password: "1234",
    name: "Melania Miranda",
    is_admin: false
  }
];

const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: "acc1",
    userId: "1",
    type: "pesos",
    name: "Caja de Ahorro en Pesos",
    number: "10023456789",
    cbu: "0123456789012345678901",
    alias: "fede.arana.pesos",
    balance: 75000.50,
    currency: "ARS"
  },
  {
    id: "acc2",
    userId: "1",
    type: "dolar",
    name: "Caja de Ahorro en Dólares",
    number: "20023456789",
    cbu: "0123456789012345678902",
    alias: "fede.arana.dolares",
    balance: 2500.25,
    currency: "USD"
  },
  {
    id: "acc3",
    userId: "1",
    type: "corriente",
    name: "Cuenta Corriente",
    number: "30023456789",
    cbu: "0123456789012345678903",
    alias: "fede.arana.cc",
    balance: 35000.75,
    currency: "ARS"
  },
  {
    id: "acc4",
    userId: "2",
    type: "pesos",
    name: "Caja de Ahorro en Pesos",
    number: "10087654321",
    cbu: "0123456789012345678904",
    alias: "melania.miranda.pesos",
    balance: 125000.30,
    currency: "ARS"
  }
];

const DEFAULT_CARDS: Card[] = [
  {
    id: "card1",
    userId: "1",
    type: "credit",
    name: "Visa Platinum",
    number: "**** **** **** 5678",
    availableCredit: 150000,
    balanceToPay: 25750.50,
    dueDate: "2023-11-15",
    expiryDate: "2026-12"
  },
  {
    id: "card2",
    userId: "1",
    type: "debit",
    name: "Mastercard Débito",
    number: "**** **** **** 1234",
    availableCredit: 45000,
    balanceToPay: 0,
    expiryDate: "2025-10"
  },
  {
    id: "card3",
    userId: "2",
    type: "credit",
    name: "American Express Gold",
    number: "**** **** **** 9876",
    availableCredit: 200000,
    balanceToPay: 75200.25,
    dueDate: "2023-11-20",
    expiryDate: "2027-08"
  }
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: "trx1",
    entityId: "card1",
    entityType: "card",
    date: "2023-10-25",
    description: "Supermercado El Pino",
    amount: 12500.75,
    type: "debit"
  },
  {
    id: "trx2",
    entityId: "card1",
    entityType: "card",
    date: "2023-10-22",
    description: "Farmacia Salud",
    amount: 3500,
    type: "debit"
  },
  {
    id: "trx3",
    entityId: "card1",
    entityType: "card",
    date: "2023-10-20",
    description: "Pago recibido",
    amount: 15000,
    type: "credit"
  },
  {
    id: "trx4",
    entityId: "card2",
    entityType: "card",
    date: "2023-10-23",
    description: "Retiro ATM",
    amount: 5000,
    type: "debit"
  },
  {
    id: "trx5",
    entityId: "acc1",
    entityType: "account",
    date: "2023-10-24",
    description: "Transferencia recibida",
    amount: 25000,
    type: "credit"
  },
  {
    id: "trx6",
    entityId: "acc1",
    entityType: "account",
    date: "2023-10-21",
    description: "Pago de servicios",
    amount: 3200.50,
    type: "debit"
  },
  {
    id: "trx7",
    entityId: "acc2",
    entityType: "account",
    date: "2023-10-23",
    description: "Depósito en efectivo",
    amount: 500,
    type: "credit"
  },
  {
    id: "trx8",
    entityId: "acc3",
    entityType: "account",
    date: "2023-10-22",
    description: "Transferencia enviada",
    amount: 12000,
    type: "debit"
  },
  {
    id: "trx9",
    entityId: "acc1",
    entityType: "account",
    date: "2025-05-02",
    description: "Transferencia recibida de Melania Miranda",
    amount: 100000,
    type: "credit"
  },
  {
    id: "trx10",
    entityId: "acc1",
    entityType: "account",
    date: "2025-05-02",
    description: "Transferencia enviada a Melania Miranda",
    amount: 50000,
    type: "debit"
  }
];

// Funciones de utilidad
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

// Servicio principal
export class LocalStorageService {
  // Inicializar datos por defecto si no existen
  static initializeData(): void {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      saveToStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
      saveToStorage(STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CARDS)) {
      saveToStorage(STORAGE_KEYS.CARDS, DEFAULT_CARDS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      saveToStorage(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
    }
  }

  // Usuarios
  static getUsers(): User[] {
    return getFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
  }

  static saveUsers(users: User[]): void {
    saveToStorage(STORAGE_KEYS.USERS, users);
  }

  static addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
  }

  static updateUser(updatedUser: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      this.saveUsers(users);
    }
  }

  static deleteUser(userId: string): void {
    const users = this.getUsers();
    const userToDelete = users.find(u => u.id === userId);
    
    // Verificar que no se elimine el último administrador
    if (userToDelete?.is_admin) {
      const adminUsers = users.filter(u => u.is_admin);
      if (adminUsers.length <= 1) {
        throw new Error('No se puede eliminar el último administrador del sistema');
      }
    }
    
    const filteredUsers = users.filter(u => u.id !== userId);
    this.saveUsers(filteredUsers);
  }

  // Cuentas
  static getAccounts(): Account[] {
    return getFromStorage(STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
  }

  static saveAccounts(accounts: Account[]): void {
    saveToStorage(STORAGE_KEYS.ACCOUNTS, accounts);
  }

  static addAccount(account: Account): void {
    const accounts = this.getAccounts();
    accounts.push(account);
    this.saveAccounts(accounts);
  }

  static updateAccount(updatedAccount: Account): void {
    const accounts = this.getAccounts();
    const index = accounts.findIndex(a => a.id === updatedAccount.id);
    if (index !== -1) {
      accounts[index] = updatedAccount;
      this.saveAccounts(accounts);
    }
  }

  static deleteAccount(accountId: string): void {
    const accounts = this.getAccounts();
    const filteredAccounts = accounts.filter(a => a.id !== accountId);
    this.saveAccounts(filteredAccounts);
  }

  // Tarjetas
  static getCards(): Card[] {
    return getFromStorage(STORAGE_KEYS.CARDS, DEFAULT_CARDS);
  }

  static saveCards(cards: Card[]): void {
    saveToStorage(STORAGE_KEYS.CARDS, cards);
  }

  static addCard(card: Card): void {
    const cards = this.getCards();
    cards.push(card);
    this.saveCards(cards);
  }

  static updateCard(updatedCard: Card): void {
    const cards = this.getCards();
    const index = cards.findIndex(c => c.id === updatedCard.id);
    if (index !== -1) {
      cards[index] = updatedCard;
      this.saveCards(cards);
    }
  }

  static deleteCard(cardId: string): void {
    const cards = this.getCards();
    const filteredCards = cards.filter(c => c.id !== cardId);
    this.saveCards(filteredCards);
  }

  // Transacciones
  static getTransactions(): Transaction[] {
    return getFromStorage(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
  }

  static saveTransactions(transactions: Transaction[]): void {
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
  }

  static addTransaction(transaction: Transaction): void {
    const transactions = this.getTransactions();
    transactions.push(transaction);
    this.saveTransactions(transactions);
  }

  static updateTransaction(updatedTransaction: Transaction): void {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === updatedTransaction.id);
    if (index !== -1) {
      transactions[index] = updatedTransaction;
      this.saveTransactions(transactions);
    }
  }

  static deleteTransaction(transactionId: string): void {
    const transactions = this.getTransactions();
    const filteredTransactions = transactions.filter(t => t.id !== transactionId);
    this.saveTransactions(filteredTransactions);
  }

  // Funciones de consulta
  static getAccountsByUserId(userId: string): Account[] {
    return this.getAccounts().filter(account => account.userId === userId);
  }

  static getCardsByUserId(userId: string): Card[] {
    return this.getCards().filter(card => card.userId === userId);
  }

  static getTransactionsByEntityId(entityId: string, entityType: 'card' | 'account'): Transaction[] {
    return this.getTransactions().filter(
      transaction => transaction.entityId === entityId && transaction.entityType === entityType
    );
  }

  static getAccountById(accountId: string): Account | undefined {
    return this.getAccounts().find(account => account.id === accountId);
  }

  static getCardById(cardId: string): Card | undefined {
    return this.getCards().find(card => card.id === cardId);
  }

  static getUserById(userId: string): User | undefined {
    return this.getUsers().find(user => user.id === userId);
  }

  // Limpiar todos los datos (resetear a valores por defecto)
  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.CARDS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    this.initializeData();
  }

  // Exportar datos
  static exportData(): string {
    const data = {
      users: this.getUsers(),
      accounts: this.getAccounts(),
      cards: this.getCards(),
      transactions: this.getTransactions()
    };
    return JSON.stringify(data, null, 2);
  }

  // Importar datos
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.users && data.accounts && data.cards && data.transactions) {
        this.saveUsers(data.users);
        this.saveAccounts(data.accounts);
        this.saveCards(data.cards);
        this.saveTransactions(data.transactions);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
} 