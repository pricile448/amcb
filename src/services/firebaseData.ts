// 🚨 URGENT: VERSION FORCÉE POUR VERCEL - $(Get-Date)
// 🔧 CORRECTION: Utilisation directe Firestore en production
// 📅 Dernière mise à jour: $(Get-Date)

import { API_CONFIG } from '../config/api';
import { db } from '../config/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { logger } from '../utils/logger';

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
  rib?: {
    displayValue: string;
    status: string;
  };
  type?: 'current' | 'savings' | 'credit';
  lastTransaction?: {
    date: Date;
    amount: number;
    description: string;
  };
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
      // FORCER l'utilisation de Firestore en production
      const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost' || window.location.hostname.includes('vercel');
      
      if (isProduction) {
        logger.debug('FirebaseDataService.getNotifications - Production: Utilisation directe Firestore');
        
        // Récupérer les données utilisateur depuis Firestore
        const userData = await this.getUserData(userId);
        logger.debug('FirebaseDataService.getNotifications - UserData:', userData);
        
        if (userData && userData.notifications) {
          logger.debug('FirebaseDataService.getNotifications - Notifications trouvées:', userData.notifications);
          return userData.notifications;
        }
        
        logger.debug('FirebaseDataService.getNotifications - Aucune notification trouvée');
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
      logger.success('Notifications récupérées depuis Firestore:', data.length);
      return data;
    } catch (error) {
      logger.error('Erreur lors de la récupération des notifications:', error);
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
      logger.success('Notification ajoutée via Firestore:', data.id);
      return data;
    } catch (error) {
      logger.error('Erreur lors de l\'ajout de notification:', error);
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
      logger.success('Notification mise à jour via Firestore:', notificationId);
      return data;
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de notification:', error);
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

      logger.success('Notification supprimée via Firestore:', notificationId);
      return true;
    } catch (error) {
      logger.error('Erreur lors de la suppression de notification:', error);
      return false;
    }
  }

  // Récupérer les comptes de l'utilisateur
  static async getUserAccounts(userId: string): Promise<FirebaseAccount[]> {
    try {
      // FORCER l'utilisation de Firestore en production - VERSION FINALE
      const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost' || window.location.hostname.includes('vercel') || window.location.hostname.includes('render');
      
      logger.debug('DEBUG: isProduction =', isProduction);
      logger.debug('DEBUG: hostname =', window.location.hostname);
      logger.debug('DEBUG: import.meta.env.PROD =', import.meta.env.PROD);
      
      if (isProduction) {
        logger.debug('FirebaseDataService.getUserAccounts - Production: Utilisation directe Firestore');
        
        // Récupérer les données utilisateur depuis Firestore
        const userData = await this.getUserData(userId);
        logger.debug('FirebaseDataService.getUserAccounts - UserData:', userData);
        
        if (userData && userData.accounts) {
          logger.debug('FirebaseDataService.getUserAccounts - Comptes trouvés:', userData.accounts);
          return userData.accounts;
        }
        
        logger.debug('FirebaseDataService.getUserAccounts - Aucun compte trouvé');
        return [];
      }
      
      // En développement, utiliser l'API locale
      logger.debug('FirebaseDataService.getUserAccounts - URL:', `${API_CONFIG.BASE_URL}/api/accounts/${userId}`);
      logger.debug('FirebaseDataService.getUserAccounts - Headers:', this.getAuthHeaders());
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/accounts/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      logger.debug('FirebaseDataService.getUserAccounts - Response status:', response.status);
      logger.debug('FirebaseDataService.getUserAccounts - Response ok:', response.ok);

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des comptes');
      }

      const data = await response.json();
      logger.debug('FirebaseDataService.getUserAccounts - Data reçue:', data);
      return data.accounts || [];
    } catch (error) {
      logger.error('Erreur FirebaseDataService.getUserAccounts:', error);
      return [];
    }
  }

  // Récupérer les transactions de l'utilisateur
  static async getUserTransactions(userId: string): Promise<FirebaseTransaction[]> {
    try {
      // FORCER l'utilisation de Firestore en production
      const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost' || window.location.hostname.includes('vercel') || window.location.hostname.includes('render');
      
      if (isProduction) {
        logger.debug('FirebaseDataService.getUserTransactions - Production: Utilisation directe Firestore');
        
        // Récupérer les données utilisateur depuis Firestore
        const userData = await this.getUserData(userId);
        logger.debug('FirebaseDataService.getUserTransactions - UserData:', userData);
        
        if (userData && userData.transactions) {
          logger.debug('FirebaseDataService.getUserTransactions - Transactions trouvées:', userData.transactions);
          return userData.transactions;
        }
        
        logger.debug('FirebaseDataService.getUserTransactions - Aucune transaction trouvée');
        return [];
      }
      
      // En développement, utiliser l'API locale
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
      logger.error('Erreur FirebaseDataService.getUserTransactions:', error);
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
      logger.error('Erreur FirebaseDataService.getUserDocuments:', error);
      return [];
    }
  }

  // Récupérer les virements de l'utilisateur
  static async getUserTransfers(userId: string): Promise<FirebaseTransfer[]> {
    try {
      // FORCER l'utilisation de Firestore en production
      const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost' || window.location.hostname.includes('vercel') || window.location.hostname.includes('render');
      
      if (isProduction) {
        logger.debug('FirebaseDataService.getUserTransfers - Production: Utilisation directe Firestore');
        
        // Récupérer les données utilisateur depuis Firestore
        const userData = await this.getUserData(userId);
        logger.debug('FirebaseDataService.getUserTransfers - UserData:', userData);
        
        if (userData && userData.transfers) {
          logger.debug('FirebaseDataService.getUserTransfers - Virements trouvés:', userData.transfers);
          return userData.transfers;
        }
        
        logger.debug('FirebaseDataService.getUserTransfers - Aucun virement trouvé');
        return [];
      }
      
      // En développement, utiliser l'API locale
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/transfers/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des virements');
      }

      const data = await response.json();
      logger.debug('Données brutes virements reçues:', data);
      logger.debug('Virements array:', data.transfers);
      return data.transfers || [];
    } catch (error) {
      logger.error('Erreur FirebaseDataService.getUserTransfers:', error);
      return [];
    }
  }

  // Récupérer les bénéficiaires de l'utilisateur
  static async getUserBeneficiaries(userId: string): Promise<FirebaseBeneficiary[]> {
    try {
      // FORCER l'utilisation de Firestore en production
      const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost' || window.location.hostname.includes('vercel') || window.location.hostname.includes('render');
      
      if (isProduction) {
        logger.debug('FirebaseDataService.getUserBeneficiaries - Production: Utilisation directe Firestore');
        
        // Récupérer les données utilisateur depuis Firestore
        const userData = await this.getUserData(userId);
        logger.debug('FirebaseDataService.getUserBeneficiaries - UserData:', userData);
        
        if (userData && userData.beneficiaries) {
          logger.debug('FirebaseDataService.getUserBeneficiaries - Bénéficiaires trouvés:', userData.beneficiaries);
          return userData.beneficiaries;
        }
        
        logger.debug('FirebaseDataService.getUserBeneficiaries - Aucun bénéficiaire trouvé');
        return [];
      }
      
      // En développement, utiliser l'API locale
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/beneficiaries/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des bénéficiaires');
      }

      const data = await response.json();
      logger.debug('Données brutes bénéficiaires reçues:', data);
      logger.debug('Bénéficiaires array:', data.beneficiaries);
      return data.beneficiaries || [];
    } catch (error) {
      logger.error('Erreur FirebaseDataService.getUserBeneficiaries:', error);
      return [];
    }
  }

  // Récupérer les budgets de l'utilisateur
  static async getUserBudgets(userId: string): Promise<FirebaseBudget[]> {
    try {
      // FORCER l'utilisation de Firestore en production
      const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost' || window.location.hostname.includes('vercel') || window.location.hostname.includes('render');
      
      if (isProduction) {
        logger.debug('FirebaseDataService.getUserBudgets - Production: Utilisation directe Firestore');
        
        // Récupérer les données utilisateur depuis Firestore
        const userData = await this.getUserData(userId);
        logger.debug('FirebaseDataService.getUserBudgets - UserData:', userData);
        
        if (userData && userData.budgets) {
          logger.debug('FirebaseDataService.getUserBudgets - Budgets trouvés:', userData.budgets);
          return userData.budgets;
        }
        
        logger.debug('FirebaseDataService.getUserBudgets - Aucun budget trouvé');
        return [];
      }
      
      // En développement, utiliser l'API locale
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/budgets/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des budgets');
      }

      const data = await response.json();
      logger.debug('Données brutes budgets reçues:', data);
      logger.debug('Budgets array:', data.budgets);
      return data.budgets || [];
    } catch (error) {
      logger.error('Erreur FirebaseDataService.getUserBudgets:', error);
      return [];
    }
  }

  // Récupérer les messages de l'utilisateur depuis la collection chats
  static async getUserMessages(userId: string): Promise<FirebaseMessage[]> {
    logger.debug('Récupération des messages depuis la collection chats pour userId:', userId);
    try {
      // FORCER l'utilisation de Firestore en production
      const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost' || window.location.hostname.includes('vercel') || window.location.hostname.includes('render');
      
      if (isProduction) {
        logger.debug('FirebaseDataService.getUserMessages - Production: Utilisation directe Firestore');
        
        try {
          // 1. Chercher tous les chats où l'utilisateur est participant
          logger.debug('FirebaseDataService.getUserMessages - Recherche des chats pour userId:', userId);
          const chatsQuery = query(collection(db, 'chats'), where('participants', 'array-contains', userId));
          const chatsSnapshot = await getDocs(chatsQuery);
          
          if (chatsSnapshot.empty) {
            logger.debug('FirebaseDataService.getUserMessages - Aucun chat trouvé pour cet utilisateur');
            return [];
          }
          
          logger.debug('FirebaseDataService.getUserMessages - Chats trouvés:', chatsSnapshot.docs.length);
          
          // 2. Récupérer tous les messages de tous les chats de l'utilisateur
          const allMessages: FirebaseMessage[] = [];
          
          for (const chatDoc of chatsSnapshot.docs) {
            const chatId = chatDoc.id;
            logger.debug('FirebaseDataService.getUserMessages - Traitement du chat:', chatId);
            
            // 3. Accéder à la sous-collection messages de ce chat
            const messagesQuery = query(collection(db, 'chats', chatId, 'messages'));
            const messagesSnapshot = await getDocs(messagesQuery);
            
            if (!messagesSnapshot.empty) {
              const chatMessages = messagesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              })) as FirebaseMessage[];
              
              logger.debug('FirebaseDataService.getUserMessages - Messages trouvés dans le chat', chatId, ':', chatMessages.length);
              allMessages.push(...chatMessages);
            }
          }
          
          // 4. Trier les messages par timestamp
          allMessages.sort((a, b) => {
            const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
            const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
            return timeA.getTime() - timeB.getTime();
          });
          
          logger.debug('FirebaseDataService.getUserMessages - Total messages récupérés:', allMessages.length);
          return allMessages;
          
        } catch (firestoreError) {
          logger.error('Erreur accès collection chats:', firestoreError);
          return [];
        }
      }
      
      // En développement, utiliser l'API locale
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/chat/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        logger.error('Erreur HTTP:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      logger.success('Messages de la collection chat récupérés avec succès:', data);
      return data.messages || [];
    } catch (error) {
      logger.error('Erreur FirebaseDataService.getUserMessages:', error);
      return [];
    }
  }

  // Envoyer un nouveau message
  static async sendMessage(userId: string, text: string, sender: 'user' | 'support'): Promise<FirebaseMessage | null> {
    logger.debug('Envoi d\'un nouveau message pour userId:', userId);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/chat/${userId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ text, sender })
      });

      if (!response.ok) {
        logger.error('Erreur HTTP:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      logger.success('Message envoyé avec succès:', data);
      return data.message || null;
    } catch (error) {
      logger.error('Erreur FirebaseDataService.sendMessage:', error);
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
      logger.error('Erreur FirebaseDataService.requestIban:', error);
      return false;
    }
  }

  // Récupérer les données IBAN de l'utilisateur
  static async getUserIban(userId: string): Promise<FirebaseIban | null> {
    logger.debug('Récupération des données IBAN pour userId:', userId);
    
    try {
      // FORCER l'utilisation de Firestore en production
      const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost' || window.location.hostname.includes('vercel') || window.location.hostname.includes('render');
      
      if (isProduction) {
        logger.debug('FirebaseDataService.getUserIban - Production: Utilisation directe Firestore');
        
        // Récupérer les données utilisateur depuis Firestore
        const userData = await this.getUserData(userId);
        logger.debug('FirebaseDataService.getUserIban - UserData:', userData);
        
        if (userData && userData.iban) {
          logger.debug('FirebaseDataService.getUserIban - IBAN trouvé:', userData.iban);
          return userData.iban;
        }
        
        logger.debug('FirebaseDataService.getUserIban - Aucun IBAN trouvé');
        return null;
      }
      
      // En développement, utiliser l'API locale
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/iban/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      logger.debug('Données brutes IBAN reçues:', response);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      logger.debug('IBAN object:', data.iban);
      
      return data.success ? data.iban : null;
    } catch (error) {
      logger.error('Erreur FirebaseDataService.getUserIban:', error);
      return null;
    }
  }

  // Méthodes KYC dépréciées - Utiliser kycService à la place
  // Ces méthodes sont conservées pour la compatibilité mais ne sont plus utilisées
  static async submitKycDocuments(userId: string, documents: any[]): Promise<boolean> {
    logger.warn('submitKycDocuments est déprécié. Utilisez kycService.submitDocument à la place.');
    return false;
  }

  static async getKycDocuments(userId: string): Promise<any | null> {
    logger.warn('getKycDocuments est déprécié. Utilisez kycService.getUserSubmissions à la place.');
    return null;
  }

  // Méthode pour récupérer les données utilisateur avec cache
  static async getUserData(userId: string): Promise<any> {
    try {
      // Vérifier le cache d'abord
      if (userDataCache.has(userId)) {
        logger.debug('Données utilisateur récupérées du cache');
        return userDataCache.get(userId);
      }

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // 🔧 Synchronisation automatique du statut de vérification email
        await this.syncEmailVerificationStatus(userId, userData);
        
        // Mettre en cache
        userDataCache.set(userId, userData);
        
        logger.debug('Données utilisateur chargées:', userData);
        return userData;
      }
      return null;
    } catch (error) {
      logger.error('Erreur chargement données utilisateur:', error);
      return null;
    }
  }

  /**
   * Synchronise automatiquement le statut de vérification email
   * entre Firebase Auth et Firestore
   */
  static async syncEmailVerificationStatus(userId: string, userData: any): Promise<void> {
    try {
      // Récupérer le statut depuis Firebase Auth
      const { getAuth, onAuthStateChanged } = await import('firebase/auth');
      const auth = getAuth();
      
      // Attendre que l'utilisateur soit connecté
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          unsubscribe();
          
          if (user && user.uid === userId) {
            const authVerified = user.emailVerified;
            const firestoreVerified = userData.emailVerified || false;
            const firestoreIsVerified = userData.isEmailVerified || false;
            
            logger.debug('🔍 Vérification synchronisation email:', {
              authVerified,
              firestoreVerified,
              firestoreIsVerified
            });
            
            // Si les statuts sont différents, synchroniser
            if (authVerified !== firestoreVerified || authVerified !== firestoreIsVerified) {
              logger.warn('🔄 Synchronisation nécessaire du statut email');
              
              try {
                const { updateDoc } = await import('firebase/firestore');
                const userDocRef = doc(db, 'users', userId);
                
                const updates: any = {};
                if (authVerified !== firestoreVerified) {
                  updates.emailVerified = authVerified;
                }
                if (authVerified !== firestoreIsVerified) {
                  updates.isEmailVerified = authVerified;
                }
                
                await updateDoc(userDocRef, updates);
                logger.success('✅ Statut email synchronisé');
                
                // Mettre à jour le cache
                userData.emailVerified = authVerified;
                userData.isEmailVerified = authVerified;
                userDataCache.set(userId, userData);
                
              } catch (updateError) {
                logger.error('❌ Erreur synchronisation email:', updateError);
              }
            }
          }
          
          resolve();
        });
      });
      
    } catch (error) {
      logger.error('❌ Erreur vérification statut email:', error);
    }
  }

  // Méthode alternative pour récupérer les données utilisateur
  static async getUserDataAlternative(userId: string): Promise<any | null> {
    logger.debug('Tentative de récupération alternative pour userId:', userId);
    
    try {
      // Essayer de récupérer depuis le localStorage d'abord
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        logger.debug('Utilisateur trouvé dans localStorage:', user);
        logger.debug('ID dans localStorage:', user.id);
        logger.debug('ID recherché:', userId);
        
        // Si l'utilisateur a un ID correspondant, retourner ses données
        if (user.id === userId) {
          logger.success('Correspondance trouvée dans localStorage');
          return user;
        } else {
          logger.debug('ID ne correspond pas dans localStorage');
        }
      } else {
        logger.debug('Aucun utilisateur dans localStorage');
      }
      
      // Si pas dans localStorage, essayer d'autres endpoints
      const endpoints = [
        '/api/auth/verify',
        '/api/accounts/profile/',
        '/api/user/profile'
      ];
      
      for (const endpoint of endpoints) {
        try {
          logger.debug(`Tentative avec l'endpoint: ${endpoint}`);
          const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: this.getAuthHeaders()
          });
          
          if (response.ok) {
            const data = await response.json();
            logger.success(`Données récupérées depuis ${endpoint}:`, data);
            return data.user || data;
          } else {
            logger.debug(`Endpoint ${endpoint} retourne ${response.status}`);
          }
        } catch (endpointError) {
          logger.debug(`Erreur avec l'endpoint ${endpoint}:`, endpointError);
        }
      }
      
      logger.warn('Aucune méthode alternative n\'a fonctionné');
      return null;
    } catch (error) {
      logger.error('Erreur dans getUserDataAlternative:', error);
      return null;
    }
  }

  // Récupérer l'ID de l'utilisateur connecté
  static getCurrentUserId(): string | null {
    logger.debug('FirebaseDataService.getCurrentUserId - localStorage user:', localStorage.getItem('user'));
    logger.debug('FirebaseDataService.getCurrentUserId - localStorage accessToken:', localStorage.getItem('accessToken'));
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        logger.debug('FirebaseDataService.getCurrentUserId - User parsé:', user);
        return user.id;
      } catch (error) {
        logger.error('Erreur parsing user:', error);
        return null;
      }
    }
    
    // Essayer de récupérer depuis accessToken si user n'existe pas
    const token = localStorage.getItem('accessToken');
    if (token) {
      logger.debug('FirebaseDataService.getCurrentUserId - Token trouvé, mais pas d\'utilisateur');
    }
    
    return null;
  }

  // Test: Simuler les données Firestore pour le débogage
  static async testKycSync(userId: string): Promise<void> {
    logger.debug('Test: Simulation de la synchronisation KYC');
    
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
    
    logger.debug('Données simulées:', mockUserData);
    
    // Mettre à jour le localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const updatedUser = {
        ...user,
        verificationStatus: mockUserData.kycStatus
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      logger.debug('Test: localStorage mis à jour avec:', updatedUser);
    }
  }

  // Méthode pour synchroniser le statut KYC avec cache
  static async syncKycStatus(userId: string): Promise<string> {
    try {
      // Vérifier le cache d'abord
      if (kycStatusCache.has(userId)) {
        logger.debug('Statut KYC récupéré du cache:', kycStatusCache.get(userId));
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
        
        logger.debug('Statut KYC synchronisé:', status);
        return status;
      }
      return 'unverified';
    } catch (error) {
      logger.error('Erreur synchronisation KYC:', error);
      return 'unverified';
    }
  }

  // Méthode pour vider le cache (utile lors de la déconnexion)
  static clearCache(): void {
    userDataCache.clear();
    kycStatusCache.clear();
    logger.debug('Cache vidé');
  }

  // ✅ NOUVEAU: Forcer la synchronisation KYC (ignore le cache)
  static async forceSyncKycStatus(userId: string): Promise<string> {
    try {
      logger.debug('🔄 Force sync KYC - Ignore cache pour userId:', userId);
      
      // Vider le cache pour cet utilisateur
      kycStatusCache.delete(userId);
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Utiliser kycStatus comme priorité, puis verificationStatus comme fallback
        const status = userData.kycStatus || userData.verificationStatus || 'unverified';
        
        logger.debug('🔄 Force sync KYC - Statut récupéré de Firestore:', status);
        
        // Mettre en cache avec le nouveau statut
        kycStatusCache.set(userId, status);
        
        // Mettre à jour localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.verificationStatus = status;
          user.kycStatus = status;
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        // Vider aussi le cache kycStatus
        localStorage.removeItem('kycStatus');
        
        logger.success('🔄 Force sync KYC - Statut forcé:', status);
        return status;
      }
      return 'unverified';
    } catch (error) {
      logger.error('🔄 Force sync KYC - Erreur:', error);
      return 'unverified';
    }
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
      logger.error('Erreur lors de la création du bénéficiaire:', error);
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
      logger.error('Erreur lors de la mise à jour du bénéficiaire:', error);
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
      logger.error('Erreur lors de la suppression du bénéficiaire:', error);
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
      logger.error('Erreur lors de la création du virement:', error);
      throw error;
    }
  }
} 