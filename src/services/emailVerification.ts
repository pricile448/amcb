import { doc, setDoc, getDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../config/firebase';
import { SecureEmailService } from './secureEmailService';

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
  private static readonly COLLECTION_NAME = 'emailVerificationCodes';
  private static readonly CODE_EXPIRY_MINUTES = 15;
  private static readonly MAX_ATTEMPTS = 3;

  /**
   * Envoie un code de vérification à 6 chiffres (DEV et PROD)
   */
  static async sendVerificationCode(email: string, userId: string): Promise<{ success: boolean; code?: string; error?: string }> {
    try {
      console.log('🔍 EmailVerificationService.sendVerificationCode - Début pour:', email);

      // Générer un code à 6 chiffres (DEV et PROD)
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Calculer l'expiration
      const expiresDate = new Date();
      expiresDate.setMinutes(expiresDate.getMinutes() + this.CODE_EXPIRY_MINUTES);
      const expires = Timestamp.fromDate(expiresDate);

      // Créer l'objet de vérification
      const verificationData: VerificationCode = {
        code,
        email,
        userId,
        expires,
        attempts: 0,
        createdAt: Timestamp.now()
      };

      // Stocker dans Firestore
      const docRef = doc(db, this.COLLECTION_NAME, userId);
      await setDoc(docRef, verificationData);

      console.log('✅ Code de vérification stocké dans Firestore:', { email, code });

      // En mode développement, afficher le code dans la console et alert
      if (import.meta.env.DEV) {
        console.log('🔍 CODE DE VÉRIFICATION (DEV):', code);
        alert(`Code de vérification (DEV): ${code}`);
      }

      // En production, envoyer le code par email via service sécurisé
      if (!import.meta.env.DEV) {
        try {
          // Utiliser le service sécurisé pour envoyer l'email avec le code
          const emailResult = await SecureEmailService.sendVerificationEmail(email, code);
          
          if (emailResult.success) {
            console.log('✅ Code de vérification envoyé par email sécurisé (PROD)');
          } else {
            console.error('❌ Erreur envoi email sécurisé:', emailResult.error);
            // En cas d'erreur, on garde quand même le code stocké
            console.log('⚠️ Code disponible dans Firestore pour vérification manuelle');
          }
        } catch (emailError) {
          console.error('❌ Erreur lors de l\'envoi d\'email:', emailError);
          // En cas d'erreur, on garde quand même le code stocké
          console.log('⚠️ Code disponible dans Firestore pour vérification manuelle');
        }
      }

      return {
        success: true,
        code: import.meta.env.DEV ? code : undefined, // En PROD, ne pas retourner le code
        error: undefined
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du code de vérification:', error);
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
      console.log('🔍 EmailVerificationService.verifyCode - Début pour:', email, 'code:', code);

      // Vérifier que l'utilisateur connecté correspond à l'email
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.email !== email) {
        console.error('❌ Erreur de sécurité: Email ne correspond pas à l\'utilisateur connecté');
        return {
          success: false,
          error: 'Erreur de sécurité: Email ne correspond pas à l\'utilisateur connecté'
        };
      }

      // Récupérer le code stocké
      const docRef = doc(db, this.COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Code expiré ou non trouvé. Veuillez demander un nouveau code.'
        };
      }

      const storedData = docSnap.data() as VerificationCode;

      // Vérifier l'expiration (storedData.expires est déjà un Timestamp)
      if (new Date() > storedData.expires.toDate()) {
        await deleteDoc(docRef);
        return {
          success: false,
          error: 'Code expiré. Veuillez demander un nouveau code.'
        };
      }

      // Vérifier le nombre de tentatives
      if (storedData.attempts >= this.MAX_ATTEMPTS) {
        await deleteDoc(docRef);
        return {
          success: false,
          error: 'Trop de tentatives. Veuillez demander un nouveau code.'
        };
      }

      // Incrémenter les tentatives
      await setDoc(docRef, {
        ...storedData,
        attempts: storedData.attempts + 1
      }, { merge: true });

      // Vérifier le code
      if (storedData.code !== code) {
        return {
          success: false,
          error: `Code incorrect. Tentatives restantes: ${this.MAX_ATTEMPTS - (storedData.attempts + 1)}`
        };
      }

      // Code correct - supprimer le code et marquer l'email comme vérifié
      await deleteDoc(docRef);

      // Marquer l'email comme vérifié dans Firestore
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, {
        emailVerified: true,
        emailVerifiedAt: serverTimestamp()
      }, { merge: true });

      console.log('✅ Code vérifié avec succès pour:', email);

      return {
        success: true,
        error: undefined
      };

    } catch (error: any) {
      console.error('❌ Erreur lors de la vérification du code:', error);
      
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
      const docRef = doc(db, this.COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return false;
      }

      const storedData = docSnap.data() as VerificationCode;
      // storedData.expires est déjà un Timestamp, utiliser toDate()
      return new Date() < storedData.expires.toDate();
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du code actif:', error);
      return false;
    }
  }

  /**
   * Supprime un code de vérification
   */
  static async deleteCode(userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, userId);
      await deleteDoc(docRef);
      console.log('✅ Code de vérification supprimé pour:', userId);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du code:', error);
    }
  }
} 