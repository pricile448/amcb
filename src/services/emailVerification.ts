import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../config/firebase';

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
   * Génère et envoie un code de vérification
   */
  static async sendVerificationCode(email: string, userId: string): Promise<{ success: boolean; code?: string; error?: string }> {
    try {
      console.log('🔍 EmailVerificationService.sendVerificationCode - Début pour:', email);

      // Générer un code à 6 chiffres
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

      // En mode développement, retourner le code pour les tests
      if (import.meta.env.DEV) {
        return {
          success: true,
          code: code,
          error: undefined
        };
      }

      // En production, utiliser Firebase Auth pour envoyer l'email
      try {
        const user = auth.currentUser;
        if (user && user.email === email) {
          await sendEmailVerification(user);
          console.log('✅ Email de vérification Firebase envoyé');
        }
      } catch (firebaseError) {
        console.warn('⚠️ Erreur Firebase Auth, utilisation du mode debug:', firebaseError);
      }

      return {
        success: true,
        code: undefined,
        error: undefined
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du code:', error);
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

    } catch (error) {
      console.error('❌ Erreur lors de la vérification du code:', error);
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