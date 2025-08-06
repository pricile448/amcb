import { doc, setDoc, getDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../config/firebase';
import { SecureEmailService } from './secureEmailService';
import { logger } from '../utils/logger';

import { Timestamp } from 'firebase/firestore';

export interface VerificationCode {
  code: string;
  email: string;
  userId: string;
  expires: Timestamp;
  attempts: number;
  createdAt: Timestamp;
}

export class EmailVerificationService {
  private static readonly CODE_EXPIRY_MINUTES = 15;
  private static readonly MAX_ATTEMPTS = 3;

  /**
   * Envoie un code de vérification à 6 chiffres (DEV et PROD)
   */
  static async sendVerificationCode(email: string, userId: string): Promise<{ success: boolean; code?: string; error?: string }> {
    try {
      logger.debug('🔍 EmailVerificationService.sendVerificationCode - Début pour:', email);

      // Générer un code à 6 chiffres (DEV et PROD)
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Calculer l'expiration
      const expiresDate = new Date();
      expiresDate.setMinutes(expiresDate.getMinutes() + this.CODE_EXPIRY_MINUTES);
      const expires = Timestamp.fromDate(expiresDate);

      // Créer l'objet de vérification
      const verificationData = {
        verificationCode: code,
        verificationCodeExpires: expires,
        verificationCodeAttempts: 0,
        verificationCodeCreatedAt: Timestamp.now()
      };

      // Stocker directement dans le document utilisateur
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, verificationData);

      logger.success('✅ Code de vérification stocké dans le document utilisateur:', { email, code });

      // En mode développement, afficher le code dans la console et alert
      if (import.meta.env.DEV) {
        logger.debug('🔍 CODE DE VÉRIFICATION (DEV):', code);
        alert(`Code de vérification (DEV): ${code}`);
      }

      // Envoyer le code par email via Resend (DEV et PROD)
      try {
        // Utiliser le service sécurisé pour envoyer l'email avec le code
        const emailResult = await SecureEmailService.sendVerificationEmail(email, code);
        
        if (emailResult.success) {
          logger.success('✅ Code de vérification envoyé par email via Resend');
        } else {
          logger.error('❌ Erreur envoi email Resend:', emailResult.error);
          // En cas d'erreur, on garde quand même le code stocké
          logger.warn('⚠️ Code disponible dans le document utilisateur pour vérification manuelle');
        }
      } catch (emailError) {
        logger.error('❌ Erreur lors de l\'envoi d\'email:', emailError);
        // En cas d'erreur, on garde quand même le code stocké
        logger.warn('⚠️ Code disponible dans le document utilisateur pour vérification manuelle');
      }

      return {
        success: true,
        code: import.meta.env.DEV ? code : undefined, // En PROD, ne pas retourner le code
        error: undefined
      };

    } catch (error) {
      logger.error('❌ Erreur lors de l\'envoi du code de vérification:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'envoi du code de vérification'
      };
    }
  }

  /**
   * Vérifie un code de vérification
   */
  static async verifyCode(email: string, userId: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      logger.debug('🔍 EmailVerificationService.verifyCode - Début pour:', email, 'code:', code);

      // Récupérer le document utilisateur
      const userDocRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Utilisateur non trouvé'
        };
      }

      const userData = docSnap.data();

      // Vérifier si un code de vérification existe
      if (!userData.verificationCode) {
        return {
          success: false,
          error: 'Code expiré ou non trouvé. Veuillez demander un nouveau code.'
        };
      }

      // Vérifier l'expiration
      if (new Date() > userData.verificationCodeExpires.toDate()) {
        // Supprimer le code expiré
        await updateDoc(userDocRef, {
          verificationCode: null,
          verificationCodeExpires: null,
          verificationCodeAttempts: null,
          verificationCodeCreatedAt: null
        });
        return {
          success: false,
          error: 'Code expiré. Veuillez demander un nouveau code.'
        };
      }

      // Vérifier le nombre de tentatives
      if (userData.verificationCodeAttempts >= this.MAX_ATTEMPTS) {
        // Supprimer le code après trop de tentatives
        await updateDoc(userDocRef, {
          verificationCode: null,
          verificationCodeExpires: null,
          verificationCodeAttempts: null,
          verificationCodeCreatedAt: null
        });
        return {
          success: false,
          error: 'Trop de tentatives. Veuillez demander un nouveau code.'
        };
      }

      // Incrémenter les tentatives
      await updateDoc(userDocRef, {
        verificationCodeAttempts: (userData.verificationCodeAttempts || 0) + 1
      });

      // Vérifier le code
      if (userData.verificationCode !== code) {
        return {
          success: false,
          error: `Code incorrect. Tentatives restantes: ${this.MAX_ATTEMPTS - ((userData.verificationCodeAttempts || 0) + 1)}`
        };
      }

      // Code correct - supprimer le code et marquer l'email comme vérifié
      await updateDoc(userDocRef, {
        emailVerified: true,
        emailVerifiedAt: serverTimestamp(),
        verificationCode: null,
        verificationCodeExpires: null,
        verificationCodeAttempts: null,
        verificationCodeCreatedAt: null
      });

      logger.success('✅ Code vérifié avec succès pour:', email);

      return {
        success: true,
        error: undefined
      };

    } catch (error: any) {
      logger.error('❌ Erreur lors de la vérification du code:', error);
      
      // Gérer spécifiquement les erreurs de permissions
      if (error.code === 'permission-denied' || error.message?.includes('permissions')) {
        return {
          success: false,
          error: 'Erreur de permissions: Vérifiez que vous êtes connecté avec le bon compte'
        };
      }
      
      return {
        success: false,
        error: 'Erreur lors de la vérification du code'
      };
    }
  }

  /**
   * Vérifie si un utilisateur a un code en cours
   */
  static async hasActiveCode(userId: string): Promise<boolean> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        return false;
      }

      const userData = docSnap.data();
      
      if (!userData.verificationCode || !userData.verificationCodeExpires) {
        return false;
      }

      return new Date() < userData.verificationCodeExpires.toDate();
    } catch (error) {
      logger.error('❌ Erreur lors de la vérification du code actif:', error);
      return false;
    }
  }

  /**
   * Supprime un code de vérification
   */
  static async deleteCode(userId: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        verificationCode: null,
        verificationCodeExpires: null,
        verificationCodeAttempts: null,
        verificationCodeCreatedAt: null
      });
      logger.success('✅ Code de vérification supprimé pour:', userId);
    } catch (error) {
      logger.error('❌ Erreur lors de la suppression du code:', error);
    }
  }
} 