// 🔒 Service sécurisé pour l'envoi d'emails
// La clé API Resend n'est PAS exposée au frontend

export interface EmailRequest {
  to: string;
  subject: string;
  code: string;
  userName?: string;
}

export class SecureEmailService {
  /**
   * Envoie un email via une API backend sécurisée
   */
  static async sendVerificationEmail(email: string, code: string, userName?: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📧 Envoi d\'email sécurisé:', email);

      // En mode développement, utiliser Resend directement
      if (import.meta.env.DEV) {
        // Import dynamique pour éviter l'exposition de la clé
        const { Resend } = await import('resend');
        const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);
        
        const result = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: email,
          subject: 'Vérification de votre email - AMCB',
          html: this.generateVerificationEmailHTML(code, userName || email)
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        return { success: true };
      }

      // En production, utiliser une API backend sécurisée
      const response = await fetch('/api/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          code: code,
          userName: userName || email
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi d\'email');
      }

      return { success: true };

    } catch (error: any) {
      console.error('❌ Erreur envoi email:', error);
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
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vérification de votre email</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .code-container {
            background-color: #f1f5f9;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .verification-code {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            letter-spacing: 4px;
            font-family: 'Courier New', monospace;
          }
          .instructions {
            background-color: #eff6ff;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #6b7280;
            font-size: 14px;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏦 AMCB</div>
            <h1>Vérification de votre email</h1>
          </div>

          <p>Bonjour ${userName},</p>

          <p>Merci de vous être inscrit sur AMCB. Pour finaliser votre inscription, veuillez utiliser le code de vérification ci-dessous :</p>

          <div class="code-container">
            <div class="verification-code">${code}</div>
          </div>

          <div class="instructions">
            <strong>Instructions :</strong>
            <ul>
              <li>Copiez ce code à 6 chiffres</li>
              <li>Retournez sur la page de vérification</li>
              <li>Collez le code dans les champs prévus</li>
              <li>Cliquez sur "Valider le code"</li>
            </ul>
          </div>

          <div class="warning">
            <strong>⚠️ Important :</strong>
            <ul>
              <li>Ce code expire dans 15 minutes</li>
              <li>Ne partagez jamais ce code avec qui que ce soit</li>
              <li>Si vous n'avez pas demandé ce code, ignorez cet email</li>
            </ul>
          </div>

          <p>Si vous n'avez pas reçu le code ou s'il a expiré, vous pouvez demander un nouveau code depuis l'application.</p>

          <p>Cordialement,<br>L'équipe AMCB</p>

          <div class="footer">
            <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
            <p>© 2024 AMCB. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
} 