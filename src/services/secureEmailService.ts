// 🔒 Service sécurisé pour l'envoi d'emails
// Utilise un endpoint API simple pour éviter les problèmes CORS

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
   * Envoie un email via l'endpoint API
   */
  static async sendVerificationEmail(email: string, code: string, userName?: string): Promise<{ success: boolean; error?: string }> {
    try {
      logger.debug('📧 Envoi d\'email de vérification pour:', email);

      // En développement, essayer l'API backend d'abord
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
          logger.warn('⚠️ API backend non disponible, utilisation de l\'endpoint API:', apiError);
          // Fallback vers l'endpoint API
        }
      }

      // En production ou si l'API backend échoue, utiliser l'endpoint API
      logger.debug('🔄 Utilisation de l\'endpoint API pour l\'envoi d\'email...');
      
      // Utiliser le serveur email local (temporairement pour résoudre l'erreur 500)
      const apiUrl = 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/send-email`, {
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        logger.success('✅ Email envoyé avec succès via endpoint API');
        return { success: true };
      } else {
        throw new Error(result.error || 'Erreur lors de l\'envoi d\'email');
      }

    } catch (error: any) {
      logger.error('❌ Erreur envoi email:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi d\'email'
      };
    }
  }
} 