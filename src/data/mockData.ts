// Mock Users
export const mockUsers = [
  {
    id: "1",
    username: "usuario1",
    password: "1234",
    name: "Juan Pérez"
  },
  {
    id: "2",
    username: "usuario2",
    password: "5467",
    name: "María González"
  }
];

// Mock Cards
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

// Mock Accounts
export const mockAccounts = [
  {
    id: "acc1",
    userId: "1",
    type: "savings_pesos",
    name: "Caja de Ahorro en Pesos",
    number: "10023456789",
    cbu: "0123456789012345678901",
    alias: "juan.perez.pesos",
    balance: 75000.50,
    currency: "ARS"
  },
  {
    id: "acc2",
    userId: "1",
    type: "savings_dollars",
    name: "Caja de Ahorro en Dólares",
    number: "20023456789",
    cbu: "0123456789012345678902",
    alias: "juan.perez.dolares",
    balance: 2500.25,
    currency: "USD"
  },
  {
    id: "acc3",
    userId: "1",
    type: "checking",
    name: "Cuenta Corriente",
    number: "30023456789",
    cbu: "0123456789012345678903",
    alias: "juan.perez.cc",
    balance: 35000.75,
    currency: "ARS"
  },
  {
    id: "acc4",
    userId: "2",
    type: "savings_pesos",
    name: "Caja de Ahorro en Pesos",
    number: "10087654321",
    cbu: "0123456789012345678904",
    alias: "maria.gonzalez.pesos",
    balance: 125000.30,
    currency: "ARS"
  }
];

// Mock Transactions
export const mockTransactions = [
  // Card transactions
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
  
  // Account transactions
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
  }
];

// Helper functions
export const getCardsByUserId = (userId: string) => {
  return mockCards.filter(card => card.userId === userId);
};

export const getAccountsByUserId = (userId: string) => {
  return mockAccounts.filter(account => account.userId === userId);
};

export const getTransactionsByEntityId = (entityId: string, entityType: 'card' | 'account') => {
  return mockTransactions.filter(
    transaction => transaction.entityId === entityId && transaction.entityType === entityType
  );
};

export const getCardById = (cardId: string) => {
  return mockCards.find(card => card.id === cardId);
};

export const getAccountById = (accountId: string) => {
  return mockAccounts.find(account => account.id === accountId);
};