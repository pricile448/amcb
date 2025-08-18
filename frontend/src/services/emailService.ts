import { auth, getRedirectUrl } from '../config/firebase';
import { sendEmailVerification } from 'firebase/auth';

export const sendVerificationEmail = async (
  email: string, 
  userId: string, 
  userName?: string,
  preferredLanguage?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    // 🔧 AMÉLIORATION: Détecter la langue préférée
    const detectLanguage = () => {
      // 1. Priorité: Langue passée en paramètre
      if (preferredLanguage && ['fr', 'en', 'es', 'de', 'it', 'nl', 'pt'].includes(preferredLanguage)) {
        return preferredLanguage;
      }
      
      // 2. Priorité: Langue sauvegardée dans localStorage (même clé qu'i18n)
      const savedLang = localStorage.getItem('i18nextLng');
      if (savedLang && ['fr', 'en', 'es', 'de', 'it', 'nl', 'pt'].includes(savedLang)) {
        return savedLang;
      }
      
      // 3. Priorité: Langue actuelle de la page
      const currentLang = window.location.pathname.split('/')[1];
      if (currentLang && ['fr', 'en', 'es', 'de', 'it', 'nl', 'pt'].includes(currentLang)) {
        return currentLang;
      }
      
      // 4. Défaut: Français
      return 'fr';
    };

    const language = detectLanguage();
    
    // 🔧 AMÉLIORATION: URL avec détection d'environnement
    const baseUrl = getRedirectUrl();
    const verificationUrl = `${baseUrl}/${language}/auth/action`;
    
    console.log('🔧 URL de vérification avec environnement:', verificationUrl);

    // Utiliser Firebase Auth natif pour l'envoi d'email
    await sendEmailVerification(user, {
      url: verificationUrl,
      handleCodeInApp: false
    });

    console.log('✅ Email de vérification envoyé via Firebase Auth avec langue:', language);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return { 
      success: false, 
      error: error.message || 'Erreur lors de l\'envoi de l\'email' 
    };
  }
};
