// Configuration de l'API backend
export const API_CONFIG = {
  // URL de base de l'API (serveur de développement sur port 5174)
  // En production, on utilise Firestore directement
  BASE_URL: import.meta.env.PROD ? '' : 'http://localhost:5174',
  
  // Endpoints d'authentification
  AUTH: {
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh',
    VERIFY: '/api/auth/verify',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
  },
  
  // Endpoints des comptes
  ACCOUNTS: {
    PROFILE: '/api/accounts/profile/',
    UPDATE_PROFILE: '/api/accounts/profile/update/',
    CHANGE_PASSWORD: '/api/accounts/change-password/',
    VERIFY_EMAIL: '/api/accounts/verify-email/',
    RESET_PASSWORD: '/api/accounts/reset-password/',
  },
  
  // Endpoints des transactions
  TRANSACTIONS: {
    LIST: '/api/transactions/',
    DETAIL: (id: string) => `/api/transactions/${id}/`,
    CREATE: '/api/transactions/',
    UPDATE: (id: string) => `/api/transactions/${id}/`,
    DELETE: (id: string) => `/api/transactions/${id}/`,
    TRANSFERS: '/api/transactions/transfers/',
    HISTORY: '/api/transactions/history/',
  },
  
  // Endpoints des documents
  DOCUMENTS: {
    LIST: '/api/documents/',
    UPLOAD: '/api/documents/upload/',
    DOWNLOAD: (id: string) => `/api/documents/${id}/download/`,
    DELETE: (id: string) => `/api/documents/${id}/`,
  },
  
  // Endpoints du support
  SUPPORT: {
    TICKETS: '/api/support/tickets/',
    CREATE_TICKET: '/api/support/tickets/create/',
    MESSAGES: '/api/support/messages/',
  },
};

// Configuration des headers par défaut
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Gestion des tokens JWT
export class TokenManager {
  private static ACCESS_TOKEN_KEY = 'access_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';

  // Récupérer le token d'accès
  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // Récupérer le token de rafraîchissement
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Sauvegarder les tokens
  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  // Supprimer les tokens
  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // Vérifier si l'utilisateur est connecté
  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Obtenir les headers d'authentification
  static getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

// Configuration des requêtes HTTP
export const HTTP_CONFIG = {
  TIMEOUT: 10000, // 10 secondes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 seconde
};

// Types d'erreurs API
export enum API_ERROR_TYPES {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Interface pour les réponses API
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

// Interface pour les erreurs API
export interface ApiError {
  type: API_ERROR_TYPES;
  message: string;
  status?: number;
  details?: any;
} 