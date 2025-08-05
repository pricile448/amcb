// 🔒 Service sécurisé pour l'envoi d'emails
// Utilise Resend directement en production, API backend en développement

import { API_CONFIG } from '../config/api';
import { logger } from '../utils/logger';
import { Resend } from 'resend';

export interface EmailRequest {
  to: string;
  subject: string;
  code: string;
  userName?: string;
}

export class SecureEmailService {
  /**
   * Envoie un email via Resend ou l'API backend
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
          logger.warn('⚠️ API backend non disponible, utilisation de Resend:', apiError);
          // Fallback vers Resend
        }
      }

      // En production ou si l'API backend échoue, utiliser Resend directement
      logger.debug('🔄 Utilisation de Resend pour l\'envoi d\'email...');
      
      const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);
      
      const result = await resend.emails.send({
        from: 'onboarding@resend.dev', // TODO: Changer pour noreply@amccredit.com une fois configuré
        to: [email],
        subject: 'Vérification de votre compte AMCB',
        html: this.generateVerificationEmailHTML(code, userName || email)
      });

      if (result.error) {
        throw new Error(result.error.message || 'Erreur lors de l\'envoi d\'email');
      }

      logger.success('✅ Email envoyé avec succès via Resend');
      return { success: true };

    } catch (error: any) {
      logger.error('❌ Erreur envoi email:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi d\'email'
      };
    }
  }

  /**
   * Génère le HTML de l'email de vérification
   */
  private static generateVerificationEmailHTML(code: string, userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vérification de votre compte AMCB</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .code { font-size: 32px; font-weight: bold; text-align: center; color: #1e40af; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Vérification de votre compte AMCB</h1>
          </div>
          <div class="content">
            <p>Bonjour ${userName},</p>
            <p>Merci de vous être inscrit sur AMCB. Pour finaliser votre inscription, veuillez utiliser le code de vérification suivant :</p>
            
            <div class="code">${code}</div>
            
            <p><strong>Ce code expire dans 15 minutes.</strong></p>
            
            <p>Si vous n'avez pas créé de compte sur AMCB, vous pouvez ignorer cet email.</p>
            
            <p>Cordialement,<br>L'équipe AMCB</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
} 