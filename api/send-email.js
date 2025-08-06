// API endpoint pour l'envoi d'emails via Resend
import { Resend } from 'resend';

const resend = new Resend(process.env.VITE_RESEND_API_KEY);

export default async function handler(req, res) {
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { email, code, userName } = req.body;

    // Vérifier les paramètres requis
    if (!email || !code) {
      return res.status(400).json({ error: 'Email et code requis' });
    }

    // Envoyer l'email via Resend
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev', // TODO: Changer pour noreply@amccredit.com
      to: [email],
      subject: 'Vérification de votre compte AMCB',
      html: generateVerificationEmailHTML(code, userName || email)
    });

    if (result.error) {
      console.error('Erreur Resend:', result.error);
      return res.status(500).json({ error: result.error.message });
    }

    console.log('Email envoyé avec succès:', result.data?.id);
    return res.status(200).json({ success: true, message: 'Email envoyé avec succès' });

  } catch (error) {
    console.error('Erreur envoi email:', error);
    return res.status(500).json({ error: error.message || 'Erreur lors de l\'envoi d\'email' });
  }
}

// Fonction pour générer le HTML de l'email
function generateVerificationEmailHTML(code, userName) {
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