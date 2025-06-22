import { LocalStorageService } from '../services/localStorageService';

// Re-exportar tipos y funciones del LocalStorageService
export {
    LocalStorageService, type Account,
    type Card,
    type Transaction, type User
} from '../services/localStorageService';

// Funciones de conveniencia que usan LocalStorageService
export const mockUsers = LocalStorageService.getUsers;
export const mockAccounts = LocalStorageService.getAccounts;
export const mockCards = LocalStorageService.getCards;
export const mockTransactions = LocalStorageService.getTransactions;

// Funciones de consulta
export const getCardsByUserId = (userId: string) => {
  return LocalStorageService.getCardsByUserId(userId);
};

export const getAccountsByUserId = (userId: string) => {
  return LocalStorageService.getAccountsByUserId(userId);
};

export const getTransactionsByEntityId = (entityId: string, entityType: 'card' | 'account') => {
  return LocalStorageService.getTransactionsByEntityId(entityId, entityType);
};

export const getCardById = (cardId: string) => {
  return LocalStorageService.getCardById(cardId);
};

export const getAccountById = (accountId: string) => {
  return LocalStorageService.getAccountById(accountId);
};

export const getUserById = (userId: string) => {
  return LocalStorageService.getUserById(userId);
};

// Función para obtener el saldo de una cuenta
export const getBalanceAccount = (accountId: string) => {
  const account = LocalStorageService.getAccountById(accountId);
  return account?.balance || 0;
};

