import { API_CONFIG } from '../config/api';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Types pour les données Firebase
export interface FirebaseAccount {
  id: string;
  userId?: string;
  name?: string;
  accountNumber: string;
  accountType?: string;
  balance: number;
  currency: string;
  status: string;
  createdAt?: any;
  bankName?: string;
  iban?: string;
  bic?: string;
}

export interface FirebaseTransaction {
  id: string;
  userId: string;
  accountId: string;
  type: 'debit' | 'credit';
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: any;
  status: string;
  reference: string;
}

export interface FirebaseDocument {
  id: string;
  userId: string;
  title: string;
  type: string;
  fileName: string;
  fileSize: number;
  uploadDate: any;
  status: string;
  category: string;
}

export interface FirebaseTransfer {
  id: string;
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  date: any;
  reference: string;
  beneficiaryName?: string;
  category?: string;
}

export interface FirebaseBeneficiary {
  id: string;
  userId: string;
  name: string;
  iban: string;
  bic: string;
  bankName: string;
  isFavorite: boolean;
  lastUsed: any;
}

export interface FirebaseMessage {
  id: string;
  text: string;
  senderId: string; // 'user' | 'support' or actual userId
  timestamp: any;
  status: 'sent' | 'delivered' | 'read';
}

export interface FirebaseIban {
  id: string;
  userId: string;
  iban: string;
  bic: string;
  accountHolder: string;
  bankName: string;
  accountType: string;
  status: string;
  balance: number;
  currency: string;
}

export interface FirebaseNotification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'maintenance' | 'feature';
  title: string;
  message: string;
  date: any;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'maintenance' | 'feature' | 'security' | 'general' | 'promotional';
  targetAudience?: 'all' | 'verified' | 'unverified' | 'premium';
  expiresAt?: any;
  actionUrl?: string;
  actionText?: string;
}

export interface FirebaseBudget {
  id: string;
  userId: string;
  category: string;
  name: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'yearly';
  startDate: any;
  endDate: any;
  status: 'on-track' | 'over-budget' | 'under-budget';
  createdAt?: any;
  updatedAt?: any;
}

// Cache pour éviter les rechargements multiples
const userDataCache = new Map<string, any>();
const kycStatusCache = new Map<string, string>();

// Service pour récupérer les données Firebase
export class FirebaseDataService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Méthodes pour les notifications
  static async getNotifications(userId: string): Promise<FirebaseNotification[]> {
    try {
      // En production, utiliser Firestore directement
      if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
        console.log('🔍 FirebaseDataService.getNotifications - Production: Utilisation directe Firestore');
        
        // Récupérer les données utilisateur depuis Firestore
        const userData = await this.getUserData(userId);
        console.log('🔍 FirebaseDataService.getNotifications - UserData:', userData);
        
        if (userData && userData.notifications) {
          console.log('🔍 FirebaseDataService.getNotifications - Notifications trouvées:', userData.notifications);
          return userData.notifications;
        }
        
        console.log('🔍 FirebaseDataService.getNotifications - Aucune notification trouvée');
        return [];
      }
      
      // En développement, utiliser l'API locale
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/notifications/${userId}`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders()
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Notifications récupérées depuis Firestore:', data.length);
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }
  }

  static async addNotification(notificationData: Omit<FirebaseNotification, 'id'>): Promise<FirebaseNotification | null> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/notifications`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(notificationData)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Notification ajoutée via Firestore:', data.id);
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de notification:', error);
      return null;
    }
  }

  static async updateNotification(notificationId: string, updateData: Partial<FirebaseNotification>): Promise<FirebaseNotification | null> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Notification mise à jour via Firestore:', notificationId);
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de notification:', error);
      return null;
    }
  }

  static async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/notifications/${notificationId}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          ...this.getAuthHeaders()
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      console.log('✅ Notification supprimée via Firestore:', notificationId);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de notification:', error);
      return false;
    }
  }

  // Récupérer les comptes de l'utilisateur
  static async getUserAccounts(userId: string): Promise<FirebaseAccount[]> {
    try {
      // En production, utiliser Firestore directement
      if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
        console.log('🔍 FirebaseDataService.getUserAccounts - Production: Utilisation directe Firestore');
        
        // Récupérer les données utilisateur depuis Firestore
        const userData = await this.getUserData(userId);
        console.log('🔍 FirebaseDataService.getUserAccounts - UserData:', userData);
        
        if (userData && userData.accounts) {
          console.log('🔍 FirebaseDataService.getUserAccounts - Comptes trouvés:', userData.accounts);
          return userData.accounts;
        }
        
        console.log('🔍 FirebaseDataService.getUserAccounts - Aucun compte trouvé');
        return [];
      }
      
      // En développement, utiliser l'API locale
      console.log('🔍 FirebaseDataService.getUserAccounts - URL:', `${API_CONFIG.BASE_URL}/api/accounts/${userId}`);
      console.log('🔍 FirebaseDataService.getUserAccounts - Headers:', this.getAuthHeaders());
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/accounts/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      console.log('🔍 FirebaseDataService.getUserAccounts - Response status:', response.status);
      console.log('🔍 FirebaseDataService.getUserAccounts - Response ok:', response.ok);

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des comptes');
      }

      const data = await response.json();
      console.log('🔍 FirebaseDataService.getUserAccounts - Data reçue:', data);
      return data.accounts || [];
    } catch (error) {
      console.error('❌ Erreur FirebaseDataService.getUserAccounts:', error);
      return [];
    }
  }

  // Récupérer les transactions de l'utilisateur
  static async getUserTransactions(userId: string): Promise<FirebaseTransaction[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/transactions/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des transactions');
      }

      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error('Erreur FirebaseDataService.getUserTransactions:', error);
      return [];
    }
  }

  // Récupérer les documents de l'utilisateur
  static async getUserDocuments(userId: string): Promise<FirebaseDocument[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/documents/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des documents');
      }

      const data = await response.json();
      return data.documents || [];
    } catch (error) {
      console.error('Erreur FirebaseDataService.getUserDocuments:', error);
      return [];
    }
  }

  // Récupérer les virements de l'utilisateur
  static async getUserTransfers(userId: string): Promise<FirebaseTransfer[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/transfers/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des virements');
      }

      const data = await response.json();
      console.log('🔍 Données brutes virements reçues:', data);
      console.log('🔍 Virements array:', data.transfers);
      return data.transfers || [];
    } catch (error) {
      console.error('Erreur FirebaseDataService.getUserTransfers:', error);
      return [];
    }
  }

  // Récupérer les bénéficiaires de l'utilisateur
  static async getUserBeneficiaries(userId: string): Promise<FirebaseBeneficiary[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/beneficiaries/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des bénéficiaires');
      }

      const data = await response.json();
      console.log('🔍 Données brutes bénéficiaires reçues:', data);
      console.log('🔍 Bénéficiaires array:', data.beneficiaries);
      return data.beneficiaries || [];
    } catch (error) {
      console.error('Erreur FirebaseDataService.getUserBeneficiaries:', error);
      return [];
    }
  }

  // Récupérer les budgets de l'utilisateur
  static async getUserBudgets(userId: string): Promise<FirebaseBudget[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/budgets/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des budgets');
      }

      const data = await response.json();
      console.log('🔍 Données brutes budgets reçues:', data);
      console.log('🔍 Budgets array:', data.budgets);
      return data.budgets || [];
    } catch (error) {
      console.error('Erreur FirebaseDataService.getUserBudgets:', error);
      return [];
    }
  }

  // Récupérer les messages de l'utilisateur depuis la collection chat
  static async getUserMessages(userId: string): Promise<FirebaseMessage[]> {
    console.log('💬 Récupération des messages depuis la collection chat pour userId:', userId);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/chat/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        console.error('❌ Erreur HTTP:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      console.log('✅ Messages de la collection chat récupérés avec succès:', data);
      return data.messages || [];
    } catch (error) {
      console.error('❌ Erreur FirebaseDataService.getUserMessages:', error);
      return [];
    }
  }

  // Envoyer un nouveau message
  static async sendMessage(userId: string, text: string, sender: 'user' | 'support'): Promise<FirebaseMessage | null> {
    console.log('💬 Envoi d\'un nouveau message pour userId:', userId);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/chat/${userId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ text, sender })
      });

      if (!response.ok) {
        console.error('❌ Erreur HTTP:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      console.log('✅ Message envoyé avec succès:', data);
      return data.message || null;
    } catch (error) {
      console.error('❌ Erreur FirebaseDataService.sendMessage:', error);
      return null;
    }
  }

  // Méthode pour demander un RIB
  static async requestIban(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/iban/request/${userId}`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la demande de RIB');
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erreur FirebaseDataService.requestIban:', error);
      return false;
    }
  }

  // Récupérer les données IBAN de l'utilisateur
  static async getUserIban(userId: string): Promise<FirebaseIban | null> {
    console.log('🏦 Récupération des données IBAN pour userId:', userId);
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/iban/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      console.log('🔍 Données brutes IBAN reçues:', response);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔍 IBAN object:', data.iban);
      
      return data.success ? data.iban : null;
    } catch (error) {
      console.error('❌ Erreur FirebaseDataService.getUserIban:', error);
      return null;
    }
  }

  // Méthode pour soumettre les documents KYC
  static async submitKycDocuments(userId: string, documents: any[]): Promise<boolean> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/kyc/submit`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, documents })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission des documents KYC');
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erreur FirebaseDataService.submitKycDocuments:', error);
      return false;
    }
  }

  // Méthode pour récupérer les documents KYC
  static async getKycDocuments(userId: string): Promise<any | null> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/kyc/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des documents KYC');
      }

      const data = await response.json();
      return data.success ? data : null;
    } catch (error) {
      console.error('Erreur FirebaseDataService.getKycDocuments:', error);
      return null;
    }
  }

  // Méthode pour récupérer les données utilisateur avec cache
  static async getUserData(userId: string): Promise<any> {
    try {
      // Vérifier le cache d'abord
      if (userDataCache.has(userId)) {
        console.log('👤 Données utilisateur récupérées du cache');
        return userDataCache.get(userId);
      }

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Mettre en cache
        userDataCache.set(userId, userData);
        
        console.log('👤 Données utilisateur chargées:', userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur chargement données utilisateur:', error);
      return null;
    }
  }

  // Méthode alternative pour récupérer les données utilisateur
  static async getUserDataAlternative(userId: string): Promise<any | null> {
    console.log('🔄 Tentative de récupération alternative pour userId:', userId);
    
    try {
      // Essayer de récupérer depuis le localStorage d'abord
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('🔍 Utilisateur trouvé dans localStorage:', user);
        console.log('🔍 ID dans localStorage:', user.id);
        console.log('🔍 ID recherché:', userId);
        
        // Si l'utilisateur a un ID correspondant, retourner ses données
        if (user.id === userId) {
          console.log('✅ Correspondance trouvée dans localStorage');
          return user;
        } else {
          console.log('❌ ID ne correspond pas dans localStorage');
        }
      } else {
        console.log('❌ Aucun utilisateur dans localStorage');
      }
      
      // Si pas dans localStorage, essayer d'autres endpoints
      const endpoints = [
        '/api/auth/verify',
        '/api/accounts/profile/',
        '/api/user/profile'
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Tentative avec l'endpoint: ${endpoint}`);
          const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: this.getAuthHeaders()
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Données récupérées depuis ${endpoint}:`, data);
            return data.user || data;
          } else {
            console.log(`❌ Endpoint ${endpoint} retourne ${response.status}`);
          }
        } catch (endpointError) {
          console.log(`❌ Erreur avec l'endpoint ${endpoint}:`, endpointError);
        }
      }
      
      console.log('⚠️ Aucune méthode alternative n\'a fonctionné');
      return null;
    } catch (error) {
      console.error('❌ Erreur dans getUserDataAlternative:', error);
      return null;
    }
  }

  // Récupérer l'ID de l'utilisateur connecté
  static getCurrentUserId(): string | null {
    console.log('🔍 FirebaseDataService.getCurrentUserId - localStorage user:', localStorage.getItem('user'));
    console.log('🔍 FirebaseDataService.getCurrentUserId - localStorage accessToken:', localStorage.getItem('accessToken'));
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('🔍 FirebaseDataService.getCurrentUserId - User parsé:', user);
        return user.id;
      } catch (error) {
        console.error('❌ Erreur parsing user:', error);
        return null;
      }
    }
    
    // Essayer de récupérer depuis accessToken si user n'existe pas
    const token = localStorage.getItem('accessToken');
    if (token) {
      console.log('🔍 FirebaseDataService.getCurrentUserId - Token trouvé, mais pas d\'utilisateur');
    }
    
    return null;
  }

  // Test: Simuler les données Firestore pour le débogage
  static async testKycSync(userId: string): Promise<void> {
    console.log('🧪 Test: Simulation de la synchronisation KYC');
    
    // Simuler des données Firestore avec kycStatus = 'pending'
    const mockUserData = {
      id: userId,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      kycStatus: 'pending', // Statut simulé
      isEmailVerified: false,
      isPhoneVerified: false
    };
    
    console.log('🧪 Données simulées:', mockUserData);
    
    // Mettre à jour le localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const updatedUser = {
        ...user,
        verificationStatus: mockUserData.kycStatus
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('🧪 Test: localStorage mis à jour avec:', updatedUser);
    }
  }

  // Méthode pour synchroniser le statut KYC avec cache
  static async syncKycStatus(userId: string): Promise<string> {
    try {
      // Vérifier le cache d'abord
      if (kycStatusCache.has(userId)) {
        console.log('🔄 Statut KYC récupéré du cache:', kycStatusCache.get(userId));
        return kycStatusCache.get(userId) || 'unverified';
      }

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Utiliser kycStatus comme priorité, puis verificationStatus comme fallback
        const status = userData.kycStatus || userData.verificationStatus || 'unverified';
        
        // Mettre en cache
        kycStatusCache.set(userId, status);
        
        // Mettre à jour localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.verificationStatus = status;
          user.kycStatus = status;
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        console.log('🔄 Statut KYC synchronisé:', status);
        return status;
      }
      return 'unverified';
    } catch (error) {
      console.error('❌ Erreur synchronisation KYC:', error);
      return 'unverified';
    }
  }

  // Méthode pour vider le cache (utile lors de la déconnexion)
  static clearCache(): void {
    userDataCache.clear();
    kycStatusCache.clear();
    console.log('🗑️ Cache vidé');
  }

  // Méthodes pour les bénéficiaires
  static async createBeneficiary(beneficiaryData: Omit<FirebaseBeneficiary, 'id'>): Promise<FirebaseBeneficiary | null> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/beneficiaries`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(beneficiaryData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.beneficiary;
    } catch (error) {
      console.error('Erreur lors de la création du bénéficiaire:', error);
      throw error;
    }
  }

  static async updateBeneficiary(beneficiaryId: string, beneficiaryData: Partial<FirebaseBeneficiary>): Promise<FirebaseBeneficiary | null> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/beneficiaries/${beneficiaryId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(beneficiaryData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.beneficiary;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du bénéficiaire:', error);
      throw error;
    }
  }

  static async deleteBeneficiary(beneficiaryId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/beneficiaries/${beneficiaryId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du bénéficiaire:', error);
      throw error;
    }
  }

  // Méthodes pour les virements
  static async createTransfer(transferData: {
    userId: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    currency: string;
    description: string;
    status?: string;
    date?: Date;
  }): Promise<any> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/transfers`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(transferData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.transfer;
    } catch (error) {
      console.error('Erreur lors de la création du virement:', error);
      throw error;
    }
  }
} 