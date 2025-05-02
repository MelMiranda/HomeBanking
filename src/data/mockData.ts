// Usuarios de prueba
//TODO DIFERENCIAR ROLES
export const mockUsers = [
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


// Cuentas bancarias de prueba
export const mockAccounts = [
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

// Tarjetas bancarias de prueba
export const mockCards = [
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


// Movimientos de prueba asociados a TC y Cuentas
export const mockTransactions = [
  // Movimientos de tc
  {
    id: "trx1",
    entityId: "card1", // Card ID
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
  
  // Movimientos de cuenta
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
    type: "debit",
  }
];

// Helper functions
//Filtra todas las TC por id de usuario
export const getCardsByUserId = (userId: string) => {
  return mockCards.filter(card => card.userId === userId);
};

//Filtra todas las cuentas por id de usuario
export const getAccountsByUserId = (userId: string) => {
  return mockAccounts.filter(account => account.userId === userId);
};

//Filtra todos movimientos por si es cuenta o TC
export const getTransactionsByEntityId = (entityId: string, entityType: 'card' | 'account') => {
  return mockTransactions.filter(
    transaction => transaction.entityId === entityId && transaction.entityType === entityType
  );
};

//Filtra todas las tarjetas dado un ID de TC
export const getCardById = (cardId: string) => {
  return mockCards.find(card => card.id === cardId);
};

//Filtra todas las cuentas dado un ID de cuenta
export const getAccountById = (accountId: string) => {
  return mockAccounts.find(account => account.id === accountId);
};

//Obtiene el balance de la cuenta dado sus movimientos
export const getBalanceAccount = (accountId: string) => {

  return getTransactionsByEntityId(accountId, 'account').reduce((balance, transaction) => {
    if (transaction.type === 'debit') {
      return balance - transaction.amount;
    } else {
      return balance + transaction.amount;
    }
  }, 0);
};

