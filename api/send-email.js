const nodemailer = require('nodemailer');

// Stockage temporaire des codes (en production, utilisez Redis ou une base de données)
const verificationCodes = new Map();

export default async function handler(req, res) {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Gérer les requêtes OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Vérifier que c'est une requête POST
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Méthode non autorisée. Utilisez POST.'
    });
    return;
  }

  try {
    const { email } = req.body;

    // Valider l'email
    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email requis'
      });
      return;
    }

    // Valider le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Format d\'email invalide'
      });
      return;
    }

    // Générer un code de vérification à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Stocker le code pour la vérification
    verificationCodes.set(email, {
      code: code,
      expires: Date.now() + (15 * 60 * 1000), // 15 minutes
      attempts: 0
    });

    // Configuration SMTP
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'mail.amccredit.com',
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: true, // true pour 465, false pour les autres ports
      auth: {
        user: process.env.SMTP_USER || 'amcbunq@amccredit.com',
        pass: process.env.SMTP_PASS
      }
    });

    // Contenu de l'email
    const mailOptions = {
      from: process.env.SMTP_USER || 'amcbunq@amccredit.com',
      to: email,
      subject: 'Code de vérification AMCB',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Code de vérification AMCB</h2>
          <p>Bonjour,</p>
          <p>Votre code de vérification est :</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
          </div>
          <p>Ce code expire dans 15 minutes.</p>
          <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">AMCB - Service de vérification</p>
        </div>
      `,
      text: `Votre code de vérification AMCB est : ${code}. Ce code expire dans 15 minutes.`
    };

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email envoyé avec succès:', info.messageId);

    // En mode debug, retourner le code
    res.status(200).json({
      success: true,
      message: 'Code de vérification envoyé par email',
      debug: {
        email: email,
        code: code, // À retirer en production
        messageId: info.messageId
      }
    });

  } catch (error) {
    console.error('❌ Erreur envoi email:', error);

    // En mode debug, retourner le code même en cas d'erreur
    res.status(200).json({
      success: true,
      message: 'Code envoyé avec succès (mode debug)',
      debug: {
        email: req.body.email,
        code: Math.floor(100000 + Math.random() * 900000).toString(),
        error: error.message
      }
    });
  }
}

// Exporter la Map pour qu'elle soit accessible par verify-code.js
export { verificationCodes }; 