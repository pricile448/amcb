const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques de l'application React
app.use(express.static(path.join(__dirname, 'dist')));

// Initialiser Resend
const resend = new Resend(process.env.VITE_RESEND_API_KEY);

// Endpoint pour l'envoi d'emails
app.post('/api/send-email', async (req, res) => {
  try {
    const { email, code, userName } = req.body;

    // Vérifier les paramètres requis
    if (!email || !code) {
      return res.status(400).json({ error: 'Email et code requis' });
    }

    console.log('📧 Tentative d\'envoi d\'email:', { email, code, userName });

    // Envoyer l'email via Resend
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev', // TODO: Changer pour noreply@amccredit.com
      to: [email],
      subject: 'Vérification de votre compte AMCB',
      html: generateVerificationEmailHTML(code, userName || email)
    });

    if (result.error) {
      console.error('❌ Erreur Resend:', result.error);
      return res.status(500).json({ error: result.error.message });
    }

    console.log('✅ Email envoyé avec succès:', result.data?.id);
    return res.status(200).json({ success: true, message: 'Email envoyé avec succès' });

  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return res.status(500).json({ error: error.message || 'Erreur lors de l\'envoi d\'email' });
  }
});

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

// Middleware pour servir l'application React pour toutes les routes non-API
app.use((req, res, next) => {
  // Si c'est une route API, passer au middleware suivant
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Sinon, servir l'application React
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📧 Endpoint email: http://localhost:${PORT}/api/send-email`);
}); 