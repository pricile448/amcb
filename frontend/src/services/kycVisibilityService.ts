import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { logger } from '../utils/logger';

export class KycVisibilityService {
  /**
   * Met à jour la visibilité des éléments après vérification KYC
   */
  static async updateVisibilityAfterKyc(userId: string): Promise<void> {
    try {
      logger.debug('🔄 Mise à jour de la visibilité après vérification KYC pour:', userId);

      const userDocRef = doc(db, 'users', userId);
      
      // Mettre à jour la visibilité de la facturation
      await updateDoc(userDocRef, {
        'billing.billingVisible': true,
        kycStatus: 'verified',
        verifiedAt: new Date(),
        updatedAt: new Date()
      });

      logger.success('✅ Visibilité mise à jour après vérification KYC');
    } catch (error) {
      logger.error('❌ Erreur lors de la mise à jour de la visibilité:', error);
      throw error;
    }
  }

  /**
   * Vérifie si l'utilisateur peut voir les éléments sensibles
   */
  static async canViewSensitiveElements(userId: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData?.kycStatus === 'verified';
      }
      
      return false;
    } catch (error) {
      logger.error('❌ Erreur lors de la vérification des permissions:', error);
      return false;
    }
  }

  /**
   * Récupère les éléments visibles selon le statut KYC
   */
  static async getVisibleElements(userId: string): Promise<{
    billing: boolean;
    transfers: boolean;
    cardLimits: boolean;
    beneficiaries: boolean;
    documents: boolean;
  }> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const isKycVerified = userData?.kycStatus === 'verified';
        
        return {
          billing: isKycVerified,
          transfers: isKycVerified,
          cardLimits: true, // Toujours visible
          beneficiaries: isKycVerified,
          documents: true // Toujours visible
        };
      }
      
      return {
        billing: false,
        transfers: false,
        cardLimits: false,
        beneficiaries: false,
        documents: false
      };
    } catch (error) {
      logger.error('❌ Erreur lors de la récupération des éléments visibles:', error);
      return {
        billing: false,
        transfers: false,
        cardLimits: false,
        beneficiaries: false,
        documents: false
      };
    }
  }

  /**
   * Met à jour le statut KYC et la visibilité
   */
  static async updateKycStatus(
    userId: string, 
    status: 'unverified' | 'pending' | 'verified' | 'rejected',
    details?: string
  ): Promise<void> {
    try {
      logger.debug(`🔄 Mise à jour du statut KYC pour ${userId}: ${status}`);

      const userDocRef = doc(db, 'users', userId);
      const updateData: any = {
        kycStatus: status,
        updatedAt: new Date()
      };

      if (status === 'verified') {
        updateData.verifiedAt = new Date();
        updateData['billing.billingVisible'] = true;
      } else if (status === 'rejected') {
        updateData.rejectedAt = new Date();
        updateData['billing.billingVisible'] = false;
      }

      if (details) {
        updateData.kycStatusDetails = details;
      }

      await updateDoc(userDocRef, updateData);
      
      logger.success(`✅ Statut KYC mis à jour: ${status}`);
    } catch (error) {
      logger.error('❌ Erreur lors de la mise à jour du statut KYC:', error);
      throw error;
    }
  }

  /**
   * Vérifie si l'utilisateur a accès aux fonctionnalités complètes
   */
  static async hasFullAccess(userId: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData?.kycStatus === 'verified' && 
               userData?.emailVerified === true;
      }
      
      return false;
    } catch (error) {
      logger.error('❌ Erreur lors de la vérification de l\'accès complet:', error);
      return false;
    }
  }

  /**
   * Récupère le statut de vérification complet de l'utilisateur
   */
  static async getVerificationStatus(userId: string): Promise<{
    emailVerified: boolean;
    phoneVerified: boolean;
    kycStatus: string;
    hasFullAccess: boolean;
  }> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const hasFullAccess = userData?.kycStatus === 'verified' && 
                             userData?.emailVerified === true;
        
        return {
          emailVerified: userData?.emailVerified || false,
          phoneVerified: userData?.isPhoneVerified || false,
          kycStatus: userData?.kycStatus || 'unverified',
          hasFullAccess
        };
      }
      
      return {
        emailVerified: false,
        phoneVerified: false,
        kycStatus: 'unverified',
        hasFullAccess: false
      };
    } catch (error) {
      logger.error('❌ Erreur lors de la récupération du statut de vérification:', error);
      return {
        emailVerified: false,
        phoneVerified: false,
        kycStatus: 'unverified',
        hasFullAccess: false
      };
    }
  }
}
