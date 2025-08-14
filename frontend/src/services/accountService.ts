import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FirebaseAccount } from './firebaseData';
import { logger } from '../utils/logger';

export interface DefaultAccount {
  id: string;
  name: string;
  accountType: string;
  type: 'current' | 'savings' | 'credit';
  balance: number;
  currency: string;
  status: string;
  accountNumber: string;
  createdAt: Date;
}

export class AccountService {
  /**
   * Crée automatiquement les 3 comptes par défaut pour un utilisateur vérifié
   */
  static async createDefaultAccounts(userId: string): Promise<FirebaseAccount[]> {
    try {
      logger.debug('🔄 Création des comptes par défaut pour userId:', userId);
      
      const defaultAccounts: DefaultAccount[] = [
        {
          id: `checking-${userId}`,
          name: 'Compte Courant',
          accountType: 'checking',
          type: 'current',
          balance: 0,
          currency: 'EUR',
          status: 'active',
          accountNumber: `CC-${userId.slice(-8)}`,
          createdAt: new Date()
        },
        {
          id: `savings-${userId}`,
          name: 'Compte Épargne',
          accountType: 'savings',
          type: 'savings',
          balance: 0,
          currency: 'EUR',
          status: 'active',
          accountNumber: `CE-${userId.slice(-8)}`,
          createdAt: new Date()
        },
        {
          id: `credit-${userId}`,
          name: 'Carte de Crédit',
          accountType: 'credit',
          type: 'credit',
          balance: 0,
          currency: 'EUR',
          status: 'active',
          accountNumber: `CCR-${userId.slice(-8)}`,
          createdAt: new Date()
        }
      ];

      // Mettre à jour le document utilisateur avec les comptes par défaut
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        accounts: arrayUnion(...defaultAccounts),
        defaultAccountsCreated: true,
        defaultAccountsCreatedAt: new Date()
      });

      logger.success('✅ Comptes par défaut créés avec succès');
      return defaultAccounts as FirebaseAccount[];
      
    } catch (error) {
      logger.error('❌ Erreur lors de la création des comptes par défaut:', error);
      throw error;
    }
  }

  /**
   * Vérifie si les comptes par défaut existent déjà
   */
  static async checkDefaultAccountsExist(userId: string): Promise<boolean> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData?.defaultAccountsCreated === true;
      }
      
      return false;
    } catch (error) {
      logger.error('❌ Erreur lors de la vérification des comptes par défaut:', error);
      return false;
    }
  }

  /**
   * Récupère ou crée les comptes par défaut si nécessaire
   */
  static async ensureDefaultAccounts(userId: string, userStatus: string): Promise<FirebaseAccount[]> {
    try {
      // Seulement créer les comptes si l'utilisateur est vérifié
      if (userStatus !== 'verified') {
        logger.debug('⏳ Utilisateur non vérifié, pas de création de comptes par défaut');
        return [];
      }

      // Vérifier si les comptes par défaut existent déjà
      const defaultAccountsExist = await this.checkDefaultAccountsExist(userId);
      
      if (defaultAccountsExist) {
        logger.debug('✅ Comptes par défaut existent déjà');
        return [];
      }

      // Créer les comptes par défaut
      logger.info('🚀 Création des comptes par défaut pour utilisateur vérifié');
      return await this.createDefaultAccounts(userId);
      
    } catch (error) {
      logger.error('❌ Erreur lors de la gestion des comptes par défaut:', error);
      return [];
    }
  }
}
