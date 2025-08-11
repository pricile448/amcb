const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Resend } = require('resend');

// Initialiser Firebase Admin
admin.initializeApp();

// Initialiser Resend
const resend = new Resend(functions.config().resend.api_key);

// Fonction pour envoyer un email de vérification
exports.sendVerificationEmail = functions.https.onCall(async (data, context) => {
  try {
    const { email, code, userName } = data;

    // Vérifier que l'utilisateur est authentifié
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Utilisateur non authentifié');
    }

    // Vérifier les paramètres requis
    if (!email || !code) {
      throw new functions.https.HttpsError('invalid-argument', 'Email et code requis');
    }

    // Envoyer l'email via Resend
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev', // TODO: Changer pour noreply@amccredit.com
      to: [email],
      subject: 'Vérification de votre compte AMCB',
      html: generateVerificationEmailHTML(code, userName || email)
    });

    if (result.error) {
      throw new functions.https.HttpsError('internal', result.error.message);
    }

    return { success: true, message: 'Email envoyé avec succès' };

  } catch (error) {
    console.error('Erreur envoi email:', error);
    throw new functions.https.HttpsError('internal', error.message);
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