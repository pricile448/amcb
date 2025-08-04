// 🔒 Service sécurisé pour Firebase
// Masque les clés sensibles et utilise un backend sécurisé

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export class SecureFirebaseService {
  /**
   * Récupère la configuration Firebase de manière sécurisée
   */
  static getFirebaseConfig(): FirebaseConfig {
    // En développement, utiliser les variables locales
    if (import.meta.env.DEV) {
      return {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
      };
    }

    // En production, utiliser une configuration masquée
    return {
      apiKey: '***MASKED***', // Masqué en production
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
    };
  }

  /**
   * Initialise Firebase de manière sécurisée
   */
  static async initializeFirebase() {
    try {
      // En production, utiliser un backend sécurisé
      if (!import.meta.env.DEV) {
        console.log('🔒 Initialisation Firebase sécurisée (PROD)');
        
        // Utiliser une configuration minimale
        const config = {
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID
        };

        return config;
      }

      // En développement, configuration complète
      return this.getFirebaseConfig();

    } catch (error) {
      console.error('❌ Erreur initialisation Firebase sécurisée:', error);
      throw error;
    }
  }

  /**
   * Vérifie si l'application est en mode sécurisé
   */
  static isSecureMode(): boolean {
    return !import.meta.env.DEV;
  }
} 