import { API_CONFIG, TokenManager, DEFAULT_HEADERS, HTTP_CONFIG, API_ERROR_TYPES, ApiResponse, ApiError } from '../config/api';

// Types pour les réponses d'authentification
interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
  };
}

interface LoginResponse extends AuthResponse {}
interface RegisterResponse extends AuthResponse {}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Méthode générique pour faire des requêtes HTTP
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      ...DEFAULT_HEADERS,
      ...TokenManager.getAuthHeaders(),
      ...options.headers,
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), HTTP_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.handleError(response);
      }

      const data = await response.json();
      return {
        data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      throw this.handleNetworkError(error);
    }
  }

  // Gestion des erreurs HTTP
  private async handleError(response: Response): Promise<ApiError> {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: 'Erreur serveur' };
    }

    let errorType = API_ERROR_TYPES.UNKNOWN_ERROR;
    switch (response.status) {
      case 401:
        errorType = API_ERROR_TYPES.AUTHENTICATION_ERROR;
        TokenManager.clearTokens();
        break;
      case 403:
        errorType = API_ERROR_TYPES.AUTHORIZATION_ERROR;
        break;
      case 400:
        errorType = API_ERROR_TYPES.VALIDATION_ERROR;
        break;
      case 500:
        errorType = API_ERROR_TYPES.SERVER_ERROR;
        break;
    }

    return {
      type: errorType,
      message: errorData.message || `Erreur ${response.status}`,
      status: response.status,
      details: errorData,
    };
  }

  // Gestion des erreurs réseau
  private handleNetworkError(error: any): ApiError {
    if (error.name === 'AbortError') {
      return {
        type: API_ERROR_TYPES.NETWORK_ERROR,
        message: 'Délai d\'attente dépassé',
      };
    }

    return {
      type: API_ERROR_TYPES.NETWORK_ERROR,
      message: 'Erreur de connexion au serveur',
    };
  }

  // Méthodes HTTP
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Upload de fichiers
  async uploadFile<T>(endpoint: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      ...TokenManager.getAuthHeaders(),
    };

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({
              data,
              status: xhr.status,
              success: true,
            });
          } catch {
            reject({
              type: API_ERROR_TYPES.UNKNOWN_ERROR,
              message: 'Erreur lors du parsing de la réponse',
            });
          }
        } else {
          reject({
            type: API_ERROR_TYPES.SERVER_ERROR,
            message: `Erreur ${xhr.status}`,
            status: xhr.status,
          });
        }
      });

      xhr.addEventListener('error', () => {
        reject({
          type: API_ERROR_TYPES.NETWORK_ERROR,
          message: 'Erreur de connexion',
        });
      });

      xhr.open('POST', url);
      Object.entries(headers).forEach(([key, value]) => {
        if (value !== null) {
          xhr.setRequestHeader(key, value);
        }
      });
      xhr.send(formData);
    });
  }
}

// Instance singleton du service API
export const apiService = new ApiService();

// Services spécialisés
export class AuthService {
  // Connexion
  static async login(email: string, password: string) {
    const response = await apiService.post<LoginResponse>(API_CONFIG.AUTH.LOGIN, {
      email,
      password,
    });
    
    if (response.success && response.data && response.data.access && response.data.refresh) {
      TokenManager.setTokens(response.data.access, response.data.refresh);
      
      // Stocker les informations utilisateur dans localStorage
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ Utilisateur stocké dans localStorage:', response.data.user);
      }
    }
    
    return response;
  }

  // Inscription
  static async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    birthDate?: string;
    birthPlace?: string;
    nationality?: string;
    residenceCountry?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    profession?: string;
    salary?: string;
  }) {
    const response = await apiService.post<RegisterResponse>(API_CONFIG.AUTH.REGISTER, userData);
    
    if (response.success && response.data && response.data.access && response.data.refresh) {
      TokenManager.setTokens(response.data.access, response.data.refresh);
    }
    
    return response;
  }

  // Déconnexion
  static async logout() {
    try {
      await apiService.post(API_CONFIG.AUTH.LOGOUT);
    } finally {
      TokenManager.clearTokens();
      // Supprimer l'utilisateur du localStorage
      localStorage.removeItem('user');
      console.log('✅ Utilisateur supprimé du localStorage');
    }
  }

  // Rafraîchir le token
  static async refreshToken() {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('Aucun token de rafraîchissement disponible');
    }

    const response = await apiService.post<AuthResponse>(API_CONFIG.AUTH.REFRESH, {
      refresh: refreshToken,
    });

    if (response.success && response.data && response.data.access) {
      TokenManager.setTokens(response.data.access, refreshToken);
    }

    return response;
  }

  // Vérifier le token
  static async verifyToken() {
    return apiService.get<{ user: AuthResponse['user'] }>(API_CONFIG.AUTH.VERIFY);
  }
}

export class AccountService {
  // Récupérer le profil
  static async getProfile() {
    return apiService.get(API_CONFIG.ACCOUNTS.PROFILE);
  }

  // Mettre à jour le profil
  static async updateProfile(profileData: any) {
    return apiService.patch(API_CONFIG.ACCOUNTS.UPDATE_PROFILE, profileData);
  }

  // Changer le mot de passe
  static async changePassword(passwordData: {
    old_password: string;
    new_password: string;
  }) {
    return apiService.post(API_CONFIG.ACCOUNTS.CHANGE_PASSWORD, passwordData);
  }
}

export class TransactionService {
  // Récupérer les transactions
  static async getTransactions(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    type?: string;
    date_from?: string;
    date_to?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = params ? `${API_CONFIG.TRANSACTIONS.LIST}?${queryParams}` : API_CONFIG.TRANSACTIONS.LIST;
    return apiService.get(endpoint);
  }

  // Créer une transaction
  static async createTransaction(transactionData: any) {
    return apiService.post(API_CONFIG.TRANSACTIONS.CREATE, transactionData);
  }

  // Récupérer l'historique
  static async getHistory(params?: any) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = params ? `${API_CONFIG.TRANSACTIONS.HISTORY}?${queryParams}` : API_CONFIG.TRANSACTIONS.HISTORY;
    return apiService.get(endpoint);
  }
}

export class DocumentService {
  // Récupérer les documents
  static async getDocuments(params?: any) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = params ? `${API_CONFIG.DOCUMENTS.LIST}?${queryParams}` : API_CONFIG.DOCUMENTS.LIST;
    return apiService.get(endpoint);
  }

  // Uploader un document
  static async uploadDocument(file: File, onProgress?: (progress: number) => void) {
    return apiService.uploadFile(API_CONFIG.DOCUMENTS.UPLOAD, file, onProgress);
  }

  // Télécharger un document
  static async downloadDocument(id: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.DOCUMENTS.DOWNLOAD(id)}`, {
      headers: TokenManager.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement');
    }
    
    return response.blob();
  }
} 