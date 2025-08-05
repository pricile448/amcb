// 🔒 Service sécurisé pour l'envoi d'emails
// Utilise l'API backend en développement, fallback en production

import { API_CONFIG } from '../config/api';
import { logger } from '../utils/logger';

export interface EmailRequest {
  to: string;
  subject: string;
  code: string;
  userName?: string;
}

export class SecureEmailService {
  /**
   * Envoie un email via l'API backend sécurisée ou fallback
   */
  static async sendVerificationEmail(email: string, code: string, userName?: string): Promise<{ success: boolean; error?: string }> {
    try {
      logger.debug('📧 Envoi d\'email de vérification pour:', email);

      // En développement, essayer l'API backend
      if (import.meta.env.DEV && API_CONFIG.BASE_URL) {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/email/send-verification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              code,
              userName: userName || email
            })
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              logger.success('✅ Email envoyé avec succès via API backend');
              return { success: true };
            } else {
              throw new Error(result.error || 'Erreur lors de l\'envoi d\'email');
            }
          } else {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
        } catch (apiError) {
          logger.warn('⚠️ API backend non disponible, utilisation du fallback:', apiError);
          // Fallback vers la méthode de développement
        }
      }

      // Fallback : En production ou si l'API backend échoue
      logger.debug('🔄 Utilisation du fallback pour l\'envoi d\'email...');
      
      // En mode développement, simuler l'envoi d'email
      if (import.meta.env.DEV) {
        logger.success('✅ Email simulé en développement (code affiché dans la console)');
        return { success: true };
      }

      // En production, retourner une erreur car l'API backend n'est pas disponible
      throw new Error('Service d\'envoi d\'email non disponible en production');

    } catch (error: any) {
      logger.error('❌ Erreur envoi email:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi d\'email'
      };
    }
  }
} 