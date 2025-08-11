import { auth } from '../config/firebase';
import { sendEmailVerification } from 'firebase/auth';

export const sendVerificationEmail = async (
  email: string, 
  userId: string, 
  userName?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    // Utiliser Firebase Auth natif pour l'envoi d'email
    await sendEmailVerification(user, {
      url: `${window.location.origin}/auth/action`,
      handleCodeInApp: false
    });

    console.log('✅ Email de vérification envoyé via Firebase Auth');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return { 
      success: false, 
      error: error.message || 'Erreur lors de l\'envoi de l\'email' 
    };
  }
};
