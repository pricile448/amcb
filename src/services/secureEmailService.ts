// 🔒 Service sécurisé pour l'envoi d'emails
// Utilise l'API backend pour éviter les problèmes CORS

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
   * Envoie un email via l'API backend sécurisée
   */
  static async sendVerificationEmail(email: string, code: string, userName?: string): Promise<{ success: boolean; error?: string }> {
    try {
      logger.debug('📧 Envoi d\'email via API backend:', email);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        logger.success('✅ Email envoyé avec succès via API backend');
        return { success: true };
      } else {
        throw new Error(result.error || 'Erreur lors de l\'envoi d\'email');
      }

    } catch (error: any) {
      logger.error('❌ Erreur envoi email API backend:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi d\'email'
      };
    }
  }
} 